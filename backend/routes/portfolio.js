const express = require('express');
const router = express.Router();
const db = require('../../db/db'); 
const ensureAuthenticated = require('../middleware/auth'); 
const yahooFinance = require('yahoo-finance2').default; // Note the .default

// --- 0. SMART PROXY ROUTE (With DB Caching) ---
// 1. HELPER FUNCTIONS (Add these outside your router.get)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options, retries = 3) => {
    try {
        const response = await fetch(url, options);
        // If Yahoo says "Too Many Requests", throw an error to trigger a retry
        if (response.status === 429) {
            throw new Error("429");
        }
        return response;
    } catch (err) {
        if (retries > 0 && (err.message === "429" || err.message.includes("fetch failed"))) {
            // Wait random time between 1s and 3s before trying again
            const delay = 1000 + Math.floor(Math.random() * 2000);
            console.log(`Yahoo 429 Error. Retrying in ${delay}ms...`);
            await sleep(delay);
            return fetchWithRetry(url, options, retries - 1);
        }
        throw err;
    }
};

// 2. YOUR ROUTE
router.get('/proxy/yahoo', async (req, res) => {
    const { symbol, range, interval } = req.query;
    
    if(!symbol || !range || !interval) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    try {
        // --- STEP 1: Check DB Cache ---
        const cached = await db.query(
            `SELECT data, updated_at FROM stock_history_cache 
             WHERE symbol = $1 AND range = $2 AND interval = $3`,
            [symbol, range, interval]
        );

        if (cached.rows.length > 0) {
            const age = Date.now() - new Date(cached.rows[0].updated_at).getTime();
            
            // Default 24 hours (86400000 ms)
            let maxAge = 86400000; 
            
            // If live data (1m/5m) or 1d range, lower cache to 5 mins (300000 ms)
            if (interval === '1m' || interval === '2m' || interval === '5m' || range === '1d') {
                maxAge = 300000; 
            }

            if (age < maxAge) { 
                return res.json(cached.rows[0].data);
            }
        }

        // --- STEP 2: Fetch from Yahoo (WITH RETRY LOGIC) ---
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;
        
        let response;
        try {
            response = await fetchWithRetry(yahooUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                }
            });
        } catch (fetchErr) {
            console.error("Yahoo Rate Limit Hit:", fetchErr.message);
            return res.status(429).json({ error: "Too many requests to Yahoo, please try again later." });
        }

        if (!response.ok) {
            throw new Error(`Yahoo API responded with status ${response.status}`);
        }

        const data = await response.json();

        // Validate data before caching
        if (!data.chart || !data.chart.result || data.chart.error) {
            console.error(`Invalid data for ${symbol}:`, JSON.stringify(data));
            return res.status(500).json({ error: "Invalid data structure from Yahoo" });
        }

        // --- STEP 3: Save to DB ---
        await db.query(
            `INSERT INTO stock_history_cache (symbol, range, interval, data, updated_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (symbol, range, interval) 
             DO UPDATE SET data = $4, updated_at = NOW()`,
            [symbol, range, interval, data]
        );

        res.json(data);

    } catch (err) {
        console.error("Proxy Error:", err.message);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

// --- 1. GET User Portfolios ---
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const query = `
            SELECT p.portfolio_id, p.name as portfolio_name, p.is_pinned, p.is_visible,
                   s.stock_id, s.symbol, s.quantity, s.avg_buy_price, s.last_known_price
            FROM portfolios p
            LEFT JOIN portfolio_stocks s ON p.portfolio_id = s.portfolio_id
            WHERE p.user_id = $1
            ORDER BY p.created_at DESC;
        `;
        
        const { rows } = await db.query(query, [req.user.user_id]);

        const portfolios = {};
        rows.forEach(row => {
            if (!portfolios[row.portfolio_id]) {
                portfolios[row.portfolio_id] = {
                    id: row.portfolio_id,
                    name: row.portfolio_name,
                    isPinned: row.is_pinned,
                    isVisible: row.is_visible,
                    stocks: [],
                    totalInvested: 0
                };
            }
            if (row.symbol) { 
                const invested = row.quantity * parseFloat(row.avg_buy_price);
                portfolios[row.portfolio_id].stocks.push({
                    stockId: row.stock_id,
                    symbol: row.symbol,
                    quantity: row.quantity,
                    avgBuyPrice: parseFloat(row.avg_buy_price),
                    lastPrice: parseFloat(row.last_known_price || 0), 
                    investedVal: invested
                });
                portfolios[row.portfolio_id].totalInvested += invested;
            }
        });

        res.json(Object.values(portfolios));
    } catch (err) {
        console.error("Error fetching portfolios:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// --- 2. Visibility Toggle ---
router.put('/:id/visibility', ensureAuthenticated, async (req, res) => {
    const { isVisible } = req.body;
    try {
        await db.query('UPDATE portfolios SET is_visible = $1 WHERE portfolio_id = $2 AND user_id = $3', 
            [isVisible, req.params.id, req.user.user_id]);
        res.json({ message: "Visibility updated" });
    } catch (err) { res.status(500).json({ message: "Error updating visibility" }); }
});

// --- 3. Batch Update Prices ---
router.post('/update-prices', ensureAuthenticated, async (req, res) => {
    const { updates } = req.body; 
    if (!updates || !Array.isArray(updates) || updates.length === 0) return res.status(200).json({ message: "No updates" });

    try {
        const promises = updates.map(update => {
            return db.query(
                `UPDATE portfolio_stocks SET last_known_price = $1 WHERE symbol = $2 AND portfolio_id IN (SELECT portfolio_id FROM portfolios WHERE user_id = $3)`,
                [update.price, update.symbol, req.user.user_id]
            );
        });
        await Promise.all(promises);
        res.json({ message: "Prices cached" });
    } catch (err) { res.status(500).json({ message: "Error caching" }); }
});

// --- 4. CREATE ---
router.post('/create', ensureAuthenticated, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });
    try {
        const result = await db.query(
            'INSERT INTO portfolios (user_id, name, is_visible) VALUES ($1, $2, TRUE) RETURNING *',
            [req.user.user_id, name]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ message: "Error creating" }); }
});

// --- 5. RENAME ---
router.put('/:id', ensureAuthenticated, async (req, res) => {
    const { name } = req.body;
    try {
        await db.query('UPDATE portfolios SET name = $1 WHERE portfolio_id = $2 AND user_id = $3', 
            [name, req.params.id, req.user.user_id]);
        res.json({ message: "Updated" });
    } catch (err) { res.status(500).json({ message: "Error updating" }); }
});

// --- 6. TOGGLE PIN ---
router.put('/:id/pin', ensureAuthenticated, async (req, res) => {
    const { isPinned } = req.body;
    try {
        await db.query('UPDATE portfolios SET is_pinned = $1 WHERE portfolio_id = $2 AND user_id = $3', 
            [isPinned, req.params.id, req.user.user_id]);
        res.json({ message: "Pin updated" });
    } catch (err) { res.status(500).json({ message: "Error pinning" }); }
});

// --- 7. ADD Stock ---
router.post('/add-stock', ensureAuthenticated, async (req, res) => {
    const { portfolioId, symbol, quantity, price } = req.body;
    try {
        const check = await db.query('SELECT * FROM portfolios WHERE portfolio_id = $1 AND user_id = $2', [portfolioId, req.user.user_id]);
        if (check.rows.length === 0) return res.status(403).json({ message: "Unauthorized" });

        const result = await db.query(
            'INSERT INTO portfolio_stocks (portfolio_id, symbol, quantity, avg_buy_price, last_known_price) VALUES ($1, $2, $3, $4, $4) RETURNING *',
            [portfolioId, symbol, quantity, price]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ message: "Error adding stock" }); }
});

// --- 8. EDIT Stock ---
router.put('/stock/:stockId', ensureAuthenticated, async (req, res) => {
    const { quantity, price } = req.body;
    const { stockId } = req.params;
    try {
        const check = await db.query(`SELECT * FROM portfolio_stocks s JOIN portfolios p ON s.portfolio_id = p.portfolio_id WHERE s.stock_id = $1 AND p.user_id = $2`, [stockId, req.user.user_id]);
        if (check.rows.length === 0) return res.status(403).json({ message: "Unauthorized" });
        await db.query('UPDATE portfolio_stocks SET quantity = $1, avg_buy_price = $2 WHERE stock_id = $3', [quantity, price, stockId]);
        res.json({ message: "Stock updated" });
    } catch (err) { res.status(500).json({ message: "Error updating" }); }
});

// --- 9. DELETE Stock ---
router.delete('/stock/:stockId', ensureAuthenticated, async (req, res) => {
    try {
        await db.query(`DELETE FROM portfolio_stocks WHERE stock_id = $1 AND portfolio_id IN (SELECT portfolio_id FROM portfolios WHERE user_id = $2)`, [req.params.stockId, req.user.user_id]);
        res.json({ message: "Stock deleted" });
    } catch (err) { res.status(500).json({ message: "Error deleting stock" }); }
});

// --- 10. DELETE Portfolio ---
router.delete('/:id', ensureAuthenticated, async (req, res) => {
    try {
        await db.query('DELETE FROM portfolios WHERE portfolio_id = $1 AND user_id = $2', [req.params.id, req.user.user_id]);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ message: "Error deleting" }); }
});

module.exports = router;
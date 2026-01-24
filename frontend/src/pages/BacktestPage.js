import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FiTrendingUp, FiActivity, FiCalendar, FiDollarSign, FiPlay, FiInfo, FiAlertCircle } from 'react-icons/fi';
import './BacktestPage.css';

// --- INDIAN TAX SAVING TIPS LIBRARY ---
const TAX_TIPS = [
    { title: "Section 80C Limit", desc: "You can claim a deduction of up to ₹1.5 Lakhs per year for investments in PPF, EPF, ELSS Mutual Funds, and LIC premiums." },
    { title: "NPS Additional Benefit", desc: "Under Section 80CCD(1B), you can claim an additional deduction of ₹50,000 for contributions to the National Pension System (NPS), over and above the ₹1.5 Lakh 80C limit." },
    { title: "Health Insurance (80D)", desc: "Premiums paid for health insurance for yourself and family allow a deduction of ₹25,000. For senior citizen parents, this limit increases to ₹50,000." },
    { title: "Home Loan Interest", desc: "Under Section 24(b), interest paid on a home loan for a self-occupied property is deductible up to ₹2 Lakhs per financial year." },
    { title: "Education Loan (80E)", desc: "Interest paid on an education loan for higher studies (self, spouse, or children) is fully deductible for up to 8 years, with no upper cap." },
    { title: "LTCG Tax Harvesting", desc: "Long Term Capital Gains (LTCG) from equity up to ₹1.25 Lakhs per year are tax-free. You can sell and rebuy stocks to reset your cost basis and utilize this exemption." },
    { title: "HRA Exemption", desc: "If you live in a rented house and receive HRA, you can claim exemption based on the lowest of: Actual HRA received, 50% of salary (metros)/40% (non-metros), or Rent paid minus 10% of salary." },
    { title: "Savings Account Interest", desc: "Under Section 80TTA, interest earned on savings accounts up to ₹10,000 is tax-free. For senior citizens (80TTB), this limit is ₹50,000 including FD interest." },
    { title: "Donations (80G)", desc: "Donations to specified relief funds and charitable institutions can be claimed as a deduction (either 50% or 100% of the donation amount depending on the fund)." },
    { title: "Preventive Health Checkup", desc: "Within the ₹25,000 limit of Section 80D, you can claim up to ₹5,000 for preventive health checkups for yourself or your family." }
];

// --- CACHE UTILS ---
// UPDATED KEY: Forces browser to discard old incompatible cache
const CACHE_KEY = 'stock_history_cache_v2'; 

const getFromCache = () => {
    try {
        const cache = localStorage.getItem(CACHE_KEY);
        return cache ? JSON.parse(cache) : {};
    } catch (e) { return {}; }
};
const saveToCache = (cache) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) { }
};

const BacktestPage = () => {
    // --- STATE ---
    const [portfolios, setPortfolios] = useState([]);
    
    const [selectedPortId1, setSelectedPortId1] = useState('');
    const [selectedPortId2, setSelectedPortId2] = useState('');
    
    const [investmentAmount, setInvestmentAmount] = useState(100000);
    const [timeRange, setTimeRange] = useState('1y'); 
    const [benchmark, setBenchmark] = useState('^NSEI');
    
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null); // NEW: Error state for empty portfolios
    const [currentTip, setCurrentTip] = useState(TAX_TIPS[0]);

    // --- 1. FETCH PORTFOLIOS ON MOUNT ---
    useEffect(() => {
        const fetchPorts = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/portfolios', { withCredentials: true });
                setPortfolios(res.data);
            } catch (err) { /* Silent fail */ }
        };
        fetchPorts();
    }, []);

    const pickRandomTip = () => {
        const randomIndex = Math.floor(Math.random() * TAX_TIPS.length);
        setCurrentTip(TAX_TIPS[randomIndex]);
    };

    // --- HELPER: Process Raw Data into Map ---
    const processStockData = (result) => {
        const priceMap = {};
        const dates = result.timestamp || [];
        const prices = result.indicators.quote[0].close || [];
        
        dates.forEach((ts, idx) => {
            if (prices[idx] !== null && prices[idx] !== undefined) {
                // Convert timestamp to Date Key (YYYY-MM-DD)
                const dateKey = new Date(ts * 1000).toISOString().split('T')[0];
                priceMap[dateKey] = prices[idx];
            }
        });

        return {
            timestamps: result.timestamp,
            quotes: result.indicators.quote[0].close,
            priceMap: priceMap 
        };
    };

    // --- HELPER: Fetch & Calc Logic ---
    const fetchHistoricalData = async (symbols, range, interval) => {
        const cache = getFromCache();
        const historyData = {};
        const symbolsToFetch = [];

        symbols.forEach(sym => {
            const cacheKey = `${sym}_${range}_${interval}`;
            // Check cache validity (24h)
            if (cache[cacheKey] && cache[cacheKey].timestamp > Date.now() - 24 * 60 * 60 * 1000) { 
                let data = cache[cacheKey].data;
                // RECOVERY: If priceMap is missing in cache (old format), regenerate it
                if (!data.priceMap) {
                    data = processStockData({ timestamp: data.timestamps, indicators: { quote: [{ close: data.quotes }] } });
                }
                historyData[sym] = data;
            } else {
                symbolsToFetch.push(sym);
            }
        });

        if (symbolsToFetch.length > 0) {
            await Promise.all(symbolsToFetch.map(async (sym) => {
                try {
                    // Use encodeURIComponent for symbols like "M&M.NS"
                    const proxyUrl = `http://localhost:5001/api/portfolios/proxy/yahoo?symbol=${encodeURIComponent(sym)}&range=${range}&interval=${interval}`;
                    const res = await fetch(proxyUrl);
                    const json = await res.json();
                    
                    const result = json.chart?.result?.[0];
                    if (result) {
                        const data = processStockData(result);
                        historyData[sym] = data;
                        cache[`${sym}_${range}_${interval}`] = { data, timestamp: Date.now() };
                    }
                } catch (e) { console.warn(`Failed to fetch ${sym}`); }
            }));
            saveToCache(cache);
        }
        return historyData;
    };

    const getComposition = (portfolio) => {
        if (!portfolio || portfolio.stocks.length === 0) return [];
        let totalCurrentVal = 0;
        const composition = portfolio.stocks.map(s => {
            const price = s.lastPrice || s.avgBuyPrice;
            const val = price * s.quantity;
            totalCurrentVal += val;
            return { symbol: s.symbol, currentVal: val };
        });
        return composition.map(c => ({
            symbol: c.symbol,
            weight: totalCurrentVal > 0 ? c.currentVal / totalCurrentVal : 0
        }));
    };

    // ROBUST CALCULATION: Uses Date Lookup + Forward Fill
    const calculateDailyValue = (weights, historyData, dateKey, investmentAmount, lastKnownPrices) => {
        let dailyVal = 0;
        let hasData = false;

        weights.forEach(w => {
            const stockData = historyData[w.symbol];
            
            // Get price for this specific date
            let price = stockData?.priceMap?.[dateKey];

            // If no price for today, try using the last known price (Forward Fill)
            if (price === undefined) {
                price = lastKnownPrices[w.symbol];
            } else {
                // Update last known price
                lastKnownPrices[w.symbol] = price;
            }

            // Only proceed if we have a price (either today's or carried forward)
            if (price !== undefined) {
                hasData = true;
                // Determine shares bought based on the *first available price* in history for this stock
                // (Approximation: Use first non-null price in quotes array)
                const firstPrice = stockData.quotes.find(q => q !== null) || price;
                
                const allocatedMoney = investmentAmount * w.weight;
                const sharesBought = allocatedMoney / firstPrice;
                dailyVal += sharesBought * price;
            }
        });
        
        return hasData ? dailyVal : null;
    };

    const calculateMetrics = (data, key, startVal, years) => {
        if(!data || data.length === 0) return null;
        const endVal = data[data.length - 1][key];
        const totalReturn = ((endVal - startVal) / startVal) * 100;
        const cagr = (Math.pow(endVal / startVal, 1 / years) - 1) * 100;
        
        let maxDrawdown = 0;
        let peakVal = -Infinity;
        data.forEach(d => {
            const val = d[key];
            if (val > peakVal) peakVal = val;
            const drawdown = (peakVal - val) / peakVal;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        });

        return { endVal, totalReturn, cagr, maxDrawdown: maxDrawdown * 100 };
    };

    // --- 2. BACKTEST LOGIC (With 3-Second Minimum Load) ---
    const runBacktest = async () => {
        setError(null); // Clear errors
        if (!selectedPortId1 && !selectedPortId2) return;
        
        if (selectedPortId1 === selectedPortId2) {
            alert("Please select two different portfolios to compare.");
            return;
        }

        // --- NEW: Validation Check for Empty Portfolios ---
        const p1 = portfolios.find(p => p.id === parseInt(selectedPortId1));
        const p2 = portfolios.find(p => p.id === parseInt(selectedPortId2));

        if (p1 && p1.stocks.length === 0) {
            setResults(null);
            setError(`Portfolio "${p1.name}" is empty. Please add stocks to this portfolio before backtesting.`);
            return;
        }
        if (p2 && p2.stocks.length === 0) {
            setResults(null);
            setError(`Portfolio "${p2.name}" is empty. Please add stocks to this portfolio before backtesting.`);
            return;
        }

        pickRandomTip(); 
        setLoading(true);
        setResults(null);
        
        // 1. Create a promise that resolves after 3 seconds
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 5000));

        // 2. Wrap the Data Logic in an async function
        const processData = async () => {
            // We already found p1 and p2 above
            
            const weights1 = p1 ? getComposition(p1) : [];
            const weights2 = p2 ? getComposition(p2) : [];

            const symbols = new Set([
                ...weights1.map(w => w.symbol), 
                ...weights2.map(w => w.symbol), 
                benchmark
            ]);
            
            let range = '1y'; 
            let interval = '1d';
            let years = 1;
            if(timeRange === '1mo') { range = '1mo'; years = 0.083; }
            if(timeRange === '6mo') { range = '6mo'; years = 0.5; }
            if(timeRange === '3y') { range = '3y'; years = 3; }
            if(timeRange === '5y') { range = '5y'; years = 5; }

            const historyData = await fetchHistoricalData(Array.from(symbols), range, interval);
            
            const masterTime = historyData[benchmark]?.timestamps;
            const masterQuotes = historyData[benchmark]?.quotes;

            if (!masterTime || masterTime.length === 0) throw new Error("Benchmark data missing.");

            const timelineData = [];
            const lastKnownPrices1 = {};
            const lastKnownPrices2 = {};

            for (let i = 0; i < masterTime.length; i++) {
                const ts = masterTime[i];
                if (!masterQuotes[i]) continue; 

                const dateKey = new Date(ts * 1000).toISOString().split('T')[0];
                
                const val1 = p1 ? calculateDailyValue(weights1, historyData, dateKey, investmentAmount, lastKnownPrices1) : null;
                const val2 = p2 ? calculateDailyValue(weights2, historyData, dateKey, investmentAmount, lastKnownPrices2) : null;
                
                const benchStart = masterQuotes.find(q => q !== null);
                const benchVal = (investmentAmount / benchStart) * masterQuotes[i];

                timelineData.push({
                    date: new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                    fullDate: new Date(ts * 1000).toLocaleDateString(),
                    [p1 ? p1.name : 'Strategy A']: val1,
                    [p2 ? p2.name : 'Strategy B']: val2,
                    Benchmark: benchVal
                });
            }

            const filteredData = timelineData.filter(d => 
                (p1 ? d[p1.name] !== null : true) && 
                (p2 ? d[p2.name] !== null : true)
            );

            if (filteredData.length === 0) throw new Error("No valid data points.");

            const metrics1 = p1 ? calculateMetrics(filteredData, p1.name, investmentAmount, years) : null;
            const metrics2 = p2 ? calculateMetrics(filteredData, p2.name, investmentAmount, years) : null;
            const metricsBench = calculateMetrics(filteredData, 'Benchmark', investmentAmount, years);

            return {
                data: filteredData,
                metrics: { port1: metrics1, port2: metrics2, benchmark: metricsBench },
                names: { port1: p1 ? p1.name : 'Strategy A', port2: p2 ? p2.name : 'Strategy B' }
            };
        };

        try {
            // 3. Wait for BOTH the timer AND the data processing
            const [_, calculatedResults] = await Promise.all([minLoadingTime, processData()]);
            
            // Only set results after both are done
            setResults(calculatedResults);

        } catch (err) {
            console.error("Simulation error", err);
            setError("Failed to generate backtest data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="backtest-page">
            <header className="page-header">
                <div>
                    <h1>Portfolio Backtesting</h1>
                    <p>Compare historical performance of different strategies.</p>
                </div>
                <div className="header-icon"><FiActivity /></div>
            </header>

            {/* CONFIGURATION PANEL */}
            <div className="config-panel">
                <div className="input-group">
                    <label><FiTrendingUp/> Strategy A</label>
                    <select value={selectedPortId1} onChange={e => setSelectedPortId1(e.target.value)}>
                        <option value="">Select Portfolio</option>
                        {portfolios.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="input-group">
                    <label><FiTrendingUp/> Strategy B</label>
                    <select value={selectedPortId2} onChange={e => setSelectedPortId2(e.target.value)}>
                        <option value="">Select Portfolio (Optional)</option>
                        {portfolios.map(p => {
                            // Disable option if already selected in Strategy A
                            const isDisabled = p.id === parseInt(selectedPortId1);
                            return (
                                <option key={p.id} value={p.id} disabled={isDisabled}>
                                    {p.name} {isDisabled ? '(Selected)' : ''}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="input-group">
                    <label><FiDollarSign/> Initial Investment</label>
                    <input 
                        type="number" 
                        value={investmentAmount} 
                        onChange={e => setInvestmentAmount(parseInt(e.target.value) || 0)}
                    />
                </div>

                <div className="input-group">
                    <label><FiCalendar/> Time Period</label>
                    <div className="toggle-group">
                        {['1mo', '6mo', '1y', '3y', '5y'].map(t => (
                            <button 
                                key={t} 
                                className={timeRange === t ? 'active' : ''} 
                                onClick={() => setTimeRange(t)}
                            >
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <button className="btn-run" onClick={runBacktest} disabled={loading}>
                    {loading ? 'Analyzing...' : <><FiPlay/> Run Comparison</>}
                </button>
            </div>

            {/* STATE 1: LOADING (SHOW TAX TIPS) */}
            {loading && (
                <div className="loading-tip-container">
                    <div className="spinner"></div>
                    <div className="tip-content">
                        <h4>Did You Know?</h4>
                        <h3>{currentTip.title}</h3>
                        <p>{currentTip.desc}</p>
                    </div>
                </div>
            )}

            {/* STATE 2: ERROR (EMPTY PORTFOLIO) */}
            {error && !loading && (
                <div className="empty-state-message" style={{borderColor: '#ff4d4d', color: '#ff4d4d'}}>
                    <FiAlertCircle size={40} />
                    <h3>Unable to Simulate</h3>
                    <p>{error}</p>
                </div>
            )}

            {/* STATE 3: INITIAL (NO RESULTS & NOT LOADING & NO ERROR) - Show Placeholder */}
            {!loading && !results && !error && (
                <div className="empty-state-message">
                    <FiInfo size={40} />
                    <h3>Ready to Simulate</h3>
                    <p>Select your portfolios above and click "Run Comparison" to see how your strategy would have performed historically vs NIFTY 50.</p>
                </div>
            )}

            {/* STATE 4: RESULTS DASHBOARD */}
            {results && !loading && !error && (
                <div className="results-container">
                    {/* MAIN CHART */}
                    <div className="chart-section">
                        <h3>Performance Comparison</h3>
                        <div className="chart-wrapper-lg">
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart data={results.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPort1" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00C49F" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorPort2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0088FE" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} minTickGap={30}/>
                                    <YAxis stroke="#666" fontSize={12} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false}/>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #444', borderRadius: '8px' }}
                                        formatter={(val) => [`₹${val.toLocaleString('en-IN', {maximumFractionDigits:0})}`]}
                                        labelStyle={{ color: '#ccc', marginBottom: '5px' }}
                                        isAnimationActive={false}
                                    />
                                    <Legend verticalAlign="top" height={36}/>
                                    {results.metrics.port1 && <Area type="monotone" dataKey={results.names.port1} stroke="#00C49F" strokeWidth={3} fillOpacity={1} fill="url(#colorPort1)" />}
                                    {results.metrics.port2 && <Area type="monotone" dataKey={results.names.port2} stroke="#0088FE" strokeWidth={3} fillOpacity={1} fill="url(#colorPort2)" />}
                                    <Area type="monotone" dataKey="Benchmark" stroke="#FF4d4d" strokeWidth={2} fill="transparent" strokeDasharray="5 5" name="NIFTY 50" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* METRICS CARDS */}
                    <div className="comparison-metrics">
                        {[
                            { title: 'Total Return', key: 'totalReturn', format: (v) => `${v.toFixed(2)}%` },
                            { title: 'CAGR', key: 'cagr', format: (v) => `${v.toFixed(2)}%` },
                            { title: 'Max Drawdown', key: 'maxDrawdown', format: (v) => `-${v.toFixed(2)}%`, reverseColor: true },
                            { title: 'Final Value', key: 'endVal', format: (v) => `₹${v.toLocaleString('en-IN', {maximumFractionDigits:0})}` }
                        ].map(metric => (
                            <div className="metric-row" key={metric.key}>
                                <h4>{metric.title}</h4>
                                <div className="metric-values">
                                    {results.metrics.port1 && (
                                        <div className={`metric-val ${!metric.reverseColor && results.metrics.port1[metric.key] >= 0 ? 'green' : (metric.reverseColor && results.metrics.port1[metric.key] > 0 ? 'red' : '')}`}>
                                            <span className="port-name">{results.names.port1}</span>
                                            {metric.format(results.metrics.port1[metric.key])}
                                        </div>
                                    )}
                                    {results.metrics.port2 && (
                                        <div className={`metric-val ${!metric.reverseColor && results.metrics.port2[metric.key] >= 0 ? 'green' : (metric.reverseColor && results.metrics.port2[metric.key] > 0 ? 'red' : '')}`}>
                                            <span className="port-name">{results.names.port2}</span>
                                            {metric.format(results.metrics.port2[metric.key])}
                                        </div>
                                    )}
                                    <div className="metric-val benchmark">
                                        <span className="port-name">Benchmark</span>
                                        {metric.format(results.metrics.benchmark[metric.key])}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BacktestPage;
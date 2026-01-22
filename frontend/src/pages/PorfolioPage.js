import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './PortfolioPage.css';
import { 
    FiPlus, FiTrash2, FiRefreshCw, FiEdit2, FiCheck, FiX, FiStar, FiAlertTriangle, FiCpu, 
    FiEye, FiEyeOff, FiActivity 
} from 'react-icons/fi';
import { 
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';

const VALID_STOCKS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", 
    "ITC.NS", "SBIN.NS", "BPCL.NS", "MRF.NS", "VEDL.NS", 
    "HINDUNILVR.NS", "BHARTIARTL.NS", "KOTAKBANK.NS", "LT.NS", "WIPRO.NS", 
    "HCLTECH.NS", "ASIANPAINT.NS", "AXISBANK.NS", "MARUTI.NS", "TITAN.NS", 
    "ULTRACEMCO.NS", "SUNPHARMA.NS", "BAJFINANCE.NS", "M&M.NS", "TATAMOTORS.NS", 
    "ADANIENT.NS", "POWERGRID.NS", "TATASTEEL.NS", "NTPC.NS", "JSWSTEEL.NS", 
    "GRASIM.NS", "ONGC.NS", "HINDALCO.NS", "COALINDIA.NS"
];

const COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

// --- TAX TIPS LIBRARY ---
const TAX_TIPS = [
    { title: "Section 80C Limit", desc: "Claim up to ₹1.5 Lakhs deduction for investments in PPF, EPF, and ELSS." },
    { title: "NPS Benefit", desc: "Claim an extra ₹50,000 deduction for NPS contributions under Section 80CCD(1B)." },
    { title: "Health Insurance", desc: "Save tax on premiums up to ₹25,000 (self) and ₹50,000 (parents) under 80D." },
    { title: "LTCG Harvesting", desc: "Long Term Capital Gains up to ₹1 Lakh/year are tax-free. Reset cost basis yearly." },
    { title: "Home Loan Interest", desc: "Deduct up to ₹2 Lakhs interest on home loans under Section 24(b)." },
    { title: "Savings Interest", desc: "Section 80TTA allows tax-free interest up to ₹10,000 from savings accounts." }
];

const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="label">{`${payload[0].name}`}</p>
                <p className="value">{`₹${payload[0].value.toLocaleString('en-IN')}`}</p>
                <p className="percent">{`(${(payload[0].payload.percent * 100).toFixed(1)}%)`}</p>
            </div>
        );
    }
    return null;
};

const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="label-date">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
                        {entry.name}: {entry.value.toFixed(2)}%
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const PortfolioPage = () => {
    // Data States
    const [portfolios, setPortfolios] = useState([]);
    const [liveValues, setLiveValues] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);

    // Form & UI States
    const [newPortName, setNewPortName] = useState('');
    const [activeAddStockId, setActiveAddStockId] = useState(null);
    const [editingPortId, setEditingPortId] = useState(null);
    const [editNameVal, setEditNameVal] = useState('');
    const [editingStockId, setEditingStockId] = useState(null);
    const [editStockForm, setEditStockForm] = useState({ quantity: '', price: '' });
    const [stockForm, setStockForm] = useState({ symbol: '', quantity: '', price: '' });
    const [suggestions, setSuggestions] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', id: null, message: '' });

    // Benchmark States
    const [selectedBenchmark, setSelectedBenchmark] = useState('^NSEI');
    const [chartData, setChartData] = useState([]);
    const [isChartLoading, setIsChartLoading] = useState(false);
    const [aiInsight, setAiInsight] = useState("Loading analysis...");
    
    // Tip State
    const [currentTip, setCurrentTip] = useState(TAX_TIPS[0]);

    // --- HELPER: Random Tip Generator ---
    const pickRandomTip = () => {
        const randomIndex = Math.floor(Math.random() * TAX_TIPS.length);
        setCurrentTip(TAX_TIPS[randomIndex]);
    };

    // --- 1. FETCH LIVE PRICES ---
    const fetchLivePrices = async (symbols) => {
        if (symbols.length === 0) return;
        
        const newPrices = {};
        const updates = [];

        await Promise.all(symbols.map(async (sym) => {
            try {
                // Using Local Proxy
                const proxyUrl = `http://localhost:5001/api/portfolios/proxy/yahoo?symbol=${sym}&range=1d&interval=1m`;
                const response = await fetch(proxyUrl);
                const data = await response.json();
                const meta = data?.chart?.result?.[0]?.meta;
                
                if (meta && meta.regularMarketPrice) {
                    const price = meta.regularMarketPrice;
                    newPrices[sym] = price;
                    updates.push({ symbol: sym, price: price });
                } 
            } catch (e) { }
        }));

        setLiveValues(prev => ({ ...prev, ...newPrices }));

        if (updates.length > 0) {
            try {
                 await axios.post('http://localhost:5001/api/portfolios/update-prices', { updates }, { withCredentials: true });
            } catch(e) { console.warn("Background cache update failed"); }
        }
    };

    // --- 2. FETCH PORTFOLIOS ---
    const fetchPortfolios = useCallback(async (shouldRefreshLive = false) => {
        try {
            setErrorMessage(null);
            const res = await axios.get('http://localhost:5001/api/portfolios', { 
                withCredentials: true,
                params: { _t: Date.now() } 
            });
            setPortfolios(res.data);
            
            const cachedPrices = {};
            const allSymbols = new Set();
            
            res.data.forEach(p => p.stocks.forEach(s => {
                allSymbols.add(s.symbol);
                if (s.lastPrice && s.lastPrice > 0) {
                    cachedPrices[s.symbol] = s.lastPrice;
                }
            }));
            
            setLiveValues(prev => ({ ...prev, ...cachedPrices }));

            if (shouldRefreshLive) {
                fetchLivePrices(Array.from(allSymbols));
            }

        } catch (err) { 
            console.error("Fetch Error:", err);
            setErrorMessage("Failed to load portfolios. Check if Database is running.");
        }
    }, []);

    // --- 3. TOGGLES ---
    const togglePin = async (p) => {
        const newPinnedStatus = !p.isPinned;
        // Optimistic UI update
        setPortfolios(prev => prev.map(port => port.id === p.id ? { ...port, isPinned: newPinnedStatus } : port));
        try {
            await axios.put(`http://localhost:5001/api/portfolios/${p.id}/pin`, { isPinned: newPinnedStatus }, { withCredentials: true });
        } catch (e) {
            // Revert on failure
            setPortfolios(prev => prev.map(port => port.id === p.id ? { ...port, isPinned: !newPinnedStatus } : port));
            showToast("Failed to update pin");
        }
    };

    const toggleVisibility = async (p) => {
        const newVisibleStatus = !p.isVisible;
        setPortfolios(prev => prev.map(port => port.id === p.id ? { ...port, isVisible: newVisibleStatus } : port));
        try {
            await axios.put(`http://localhost:5001/api/portfolios/${p.id}/visibility`, { isVisible: newVisibleStatus }, { withCredentials: true });
        } catch (e) {
            setPortfolios(prev => prev.map(port => port.id === p.id ? { ...port, isVisible: !newVisibleStatus } : port));
            showToast("Failed to update visibility");
        }
    };

    // --- 4. CHART LOGIC ---
    
    // FIX: Smart Dependency Key
    const chartDependency = useMemo(() => {
        return portfolios.map(p => `${p.id}:${p.isVisible}:${p.stocks.length}`).join('|');
    }, [portfolios]);

    const generateComparisonChart = async () => {
        const activePortfolios = portfolios.filter(p => p.isVisible);
        if (activePortfolios.length === 0) {
            setChartData([]);
            setAiInsight("Enable a portfolio to see insights.");
            return;
        }

        setIsChartLoading(true);
        pickRandomTip(); 

        const minTimer = new Promise(resolve => setTimeout(resolve, 2500));

        const dataPromise = async () => {
            const allStocks = [];
            activePortfolios.forEach(p => p.stocks.forEach(s => allStocks.push(s)));
            if (allStocks.length === 0) return { mergedData: [] };

            const uniqueSymbols = [...new Set(allStocks.map(s => s.symbol))];

            const benchUrl = `http://localhost:5001/api/portfolios/proxy/yahoo?symbol=${selectedBenchmark}&range=1mo&interval=1d`;
            let benchJson = null;
            try {
                const bRes = await fetch(benchUrl);
                benchJson = await bRes.json();
            } catch (e) { throw new Error("Benchmark Unavailable"); }

            const benchQuotes = benchJson?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
            const benchTimestamps = benchJson?.chart?.result?.[0]?.timestamp || [];

            if (benchQuotes.length === 0) throw new Error("No Data");

            const stockHistories = {};
            await Promise.all(uniqueSymbols.map(async (sym) => {
                try {
                    const url = `http://localhost:5001/api/portfolios/proxy/yahoo?symbol=${sym}&range=1mo&interval=1d`;
                    const res = await fetch(url);
                    const json = await res.json();
                    const closes = json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
                    if(closes) stockHistories[sym] = closes;
                } catch (e) { }
            }));

            const mergedData = [];
            let portfolioStartVal = 0;
            let benchmarkStartVal = benchQuotes[0] || 1;

            allStocks.forEach(s => {
                const hist = stockHistories[s.symbol];
                const startPrice = (hist && hist[0]) ? hist[0] : s.avgBuyPrice;
                portfolioStartVal += startPrice * s.quantity;
            });

            for (let i = 0; i < benchTimestamps.length; i++) {
                if (!benchQuotes[i]) continue;
                let currentPortVal = 0;
                allStocks.forEach(s => {
                    const hist = stockHistories[s.symbol];
                    let price = s.avgBuyPrice;
                    if (hist) price = hist[i] || hist[hist.length-1] || price;
                    currentPortVal += price * s.quantity;
                });

                const portReturn = portfolioStartVal > 0 ? ((currentPortVal - portfolioStartVal) / portfolioStartVal) * 100 : 0;
                const benchReturn = benchmarkStartVal > 0 ? ((benchQuotes[i] - benchmarkStartVal) / benchmarkStartVal) * 100 : 0;
                
                const date = new Date(benchTimestamps[i] * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                mergedData.push({ date, Portfolio: portReturn, Benchmark: benchReturn });
            }
            return { mergedData };
        };

        try {
            const [_, result] = await Promise.all([minTimer, dataPromise()]);
            
            if (result && result.mergedData) {
                setChartData(result.mergedData);
                
                if(result.mergedData.length > 0) {
                    const final = result.mergedData[result.mergedData.length - 1];
                    const diff = final.Portfolio - final.Benchmark;
                    const benchName = selectedBenchmark === '^NSEI' ? 'NIFTY 50' : 'Benchmark';
                    
                    let msg = "";
                    if (diff > 2) msg = `🚀 Outperformance! Your active portfolio beat the ${benchName} by ${diff.toFixed(2)}% this month.`;
                    else if (diff < -2) msg = `⚠️ Underperformance. You trailed the ${benchName} by ${Math.abs(diff).toFixed(2)}%.`;
                    else msg = `⚖️ Market Tracking. Your returns are mirroring the ${benchName} (${diff.toFixed(2)}% diff).`;
                    setAiInsight(msg);
                }
            }

        } catch (e) {
            console.error("Chart Error", e);
            setAiInsight("Chart data unavailable right now.");
        } finally {
            setIsChartLoading(false);
        }
    };

    const getBenchmarkName = (t) => {
        if(t==='^NSEI') return 'NIFTY 50';
        if(t==='^GSPC') return 'S&P 500';
        return 'Benchmark';
    };

    useEffect(() => { fetchPortfolios(true); }, [fetchPortfolios]);
    
    // FIX: Depend on chartDependency, NOT 'portfolios' directly
    useEffect(() => {
        if (portfolios.length > 0) {
            generateComparisonChart();
        }
    }, [chartDependency, selectedBenchmark]); 

    // --- HELPERS ---
    const showToast = (msg, type='error') => { setToast({ show: true, message: msg, type }); setTimeout(()=>setToast({show:false, message:'', type:''}), 3000); };
    
    // --- CRUD HANDLERS ---
    const handleSymbolChange = (e) => { const v = e.target.value.toUpperCase(); setStockForm(p => ({...p, symbol:v})); if(v) setSuggestions(VALID_STOCKS.filter(s=>s.startsWith(v)).slice(0,5)); else setSuggestions([]); };
    const selectSuggestion = (s) => { setStockForm(p=>({...p, symbol:s})); setSuggestions([]); };
    const handleCreate = async () => { if(!newPortName.trim()) return showToast("Name required"); await axios.post('http://localhost:5001/api/portfolios/create', {name:newPortName}, {withCredentials:true}); setNewPortName(''); fetchPortfolios(false); };
    const handleAddStock = async (pid) => { if(!stockForm.symbol || !stockForm.quantity || !stockForm.price) return showToast("Invalid fields"); await axios.post('http://localhost:5001/api/portfolios/add-stock', {portfolioId:pid, ...stockForm}, {withCredentials:true}); setStockForm({symbol:'',quantity:'',price:''}); setActiveAddStockId(null); fetchPortfolios(true); };
    const saveStockEdit = async (sid) => { try { await axios.put(`http://localhost:5001/api/portfolios/stock/${sid}`, editStockForm, {withCredentials:true}); setEditingStockId(null); fetchPortfolios(true); } catch(e){showToast("Error updating");} };
    const confirmDelete = async () => { 
        const url = modalConfig.type === 'portfolio' ? `http://localhost:5001/api/portfolios/${modalConfig.id}` : `http://localhost:5001/api/portfolios/stock/${modalConfig.id}`;
        await axios.delete(url, {withCredentials:true}); fetchPortfolios(false); setModalConfig({isOpen:false, type:'', id:null}); 
    };
    const saveName = async (id) => { await axios.put(`http://localhost:5001/api/portfolios/${id}`, {name:editNameVal}, {withCredentials:true}); setEditingPortId(null); fetchPortfolios(false); };

    // --- CALCULATIONS ---
    const activePortfolios = portfolios.filter(p => p.isVisible); 
    let globalValue = 0, globalInvested = 0;
    const stockDist = {};

    activePortfolios.forEach(p => {
        p.stocks.forEach(s => {
            const price = liveValues[s.symbol] || s.lastPrice || 0;
            const val = price * s.quantity;
            globalValue += val;
            globalInvested += s.avgBuyPrice * s.quantity;
            stockDist[s.symbol] = (stockDist[s.symbol] || 0) + val;
        });
    });

    const globalGain = globalValue - globalInvested;
    const globalPercent = globalInvested > 0 ? (globalGain / globalInvested) * 100 : 0;
    const pieData = Object.keys(stockDist).map(k => ({ name: k, value: stockDist[k], percent: globalValue > 0 ? stockDist[k]/globalValue : 0 })).sort((a,b) => b.value - a.value);

    return (
        <div className="portfolio-page">
            {toast.show && <div className={`custom-toast ${toast.type}`}>{toast.message}</div>}

            <header className="page-header">
                <div><h1>My Wealth Portfolios</h1><p>Manage assets & track performance.</p></div>
                <button className="btn-refresh" onClick={() => fetchPortfolios(true)}><FiRefreshCw /></button>
            </header>

            {errorMessage && (
                <div className="error-banner" style={{background:'#331111', color:'#ff4d4d', padding:'15px', borderRadius:'8px', marginBottom:'20px', border:'1px solid #ff4d4d', display:'flex', alignItems:'center', gap:'10px'}}>
                    <FiAlertTriangle size={24}/>
                    <div><strong>Connection Error:</strong> {errorMessage} <br/><small>Did you run the SQL command to add 'last_known_price'?</small></div>
                </div>
            )}

            {portfolios.length > 0 && (
                <>
                <div className="summary-section">
                    <div className="summary-card net-worth">
                        <h3>Total Active Net Worth</h3>
                        <div className="big-value">₹{globalValue.toLocaleString('en-IN', {maximumFractionDigits:0})}</div>
                        <div className={`profit-pill ${globalGain>=0?'green':'red'}`}>
                            {globalGain>=0?'+':''}₹{Math.abs(globalGain).toLocaleString('en-IN')} <span>({globalPercent.toFixed(2)}%)</span>
                        </div>
                        <p className="invested-label">Invested: ₹{globalInvested.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="summary-card chart-card">
                        <h3>Asset Allocation</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                        {pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} isAnimationActive={false} />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize:'0.8rem'}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="benchmark-section">
                    <div className="section-header">
                        <h3><FiActivity /> vs Market (1 Mo)</h3>
                        <select className="benchmark-select" value={selectedBenchmark} onChange={e=>setSelectedBenchmark(e.target.value)}>
                            <option value="^NSEI">NIFTY 50</option>
                            <option value="^GSPC">S&P 500</option>
                            <option value="^NSEBANK">NIFTY BANK</option>
                        </select>
                    </div>
                    
                    {/* CHART AREA WITH LOADING SUPPORT */}
                    {/* FIX: Use relative position with hidden overflow */}
                    <div className="benchmark-chart-container" style={{ position: 'relative', minHeight: '250px', overflow: 'hidden' }}>
                        {isChartLoading ? (
                            // FIX: Absolute positioning with negative margins to COVER 15px padding
                            <div className="loading-tip-container" style={{ 
                                position: 'absolute', 
                                top: '-20px', 
                                left: '-20px', 
                                width: 'calc(100% + 40px)', 
                                height: 'calc(100% + 40px)', 
                                zIndex: 10, 
                                borderRadius: '8px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                padding: '20px'
                            }}>
                                <div className="spinner"></div>
                                <div className="tip-content">
                                    <h4 style={{fontSize: '0.75rem', marginBottom:'5px'}}>Did You Know? Tax Tip</h4>
                                    <h3 style={{fontSize: '1.2rem', marginBottom:'5px'}}>{currentTip.title}</h3>
                                    <p style={{fontSize: '0.9rem', lineHeight:'1.4'}}>{currentTip.desc}</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={chartData} margin={{top:5, right:20, bottom:5, left:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="date" stroke="#888" tickLine={false} fontSize={12} />
                                    <YAxis stroke="#888" tickFormatter={v=>`${v}%`} fontSize={12} />
                                    <Tooltip content={<CustomLineTooltip />} isAnimationActive={false} />
                                    <Legend />
                                    <Line type="monotone" dataKey="Portfolio" stroke="#00C49F" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="Benchmark" stroke="#FF4d4d" strokeWidth={2} dot={false} name={getBenchmarkName(selectedBenchmark)} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="ai-insight-box">
                        <div className="icon-area"><FiCpu /></div>
                        <div className="text-area"><h4>AI Insight</h4><p>{aiInsight}</p></div>
                    </div>
                </div>
                </>
            )}

            <div className="create-section">
                <input value={newPortName} onChange={e=>setNewPortName(e.target.value)} placeholder="New Portfolio Name..." />
                <button className="btn-primary" onClick={handleCreate}><FiPlus /> Create</button>
            </div>

            <div className="portfolio-grid">
                {portfolios.map(port => {
                    const isIncluded = port.isVisible;
                    let pVal = 0, pInv = 0;
                    port.stocks.forEach(s => {
                        const price = liveValues[s.symbol] || s.lastPrice || 0;
                        const val = price * s.quantity;
                        pVal += val;
                        pInv += s.avgBuyPrice * s.quantity;
                    });
                    const pGain = pVal - pInv;
                    // FIX: Defined pPerc here to prevent error
                    const pPerc = pInv > 0 ? (pGain / pInv) * 100 : 0;

                    return (
                        <div key={port.id} className={`portfolio-card ${!isIncluded ? 'excluded' : ''}`}>
                            <div className="card-header">
                                <div className="header-title">
                                    {editingPortId===port.id ? (
                                        <div className="edit-box"><input autoFocus value={editNameVal} onChange={e=>setEditNameVal(e.target.value)} /><FiCheck className="action-icon success" onClick={()=>saveName(port.id)}/><FiX className="action-icon danger" onClick={()=>setEditingPortId(null)}/></div>
                                    ) : (
                                        <><h3>{port.name}</h3><FiEdit2 className="icon-btn edit" onClick={()=>{setEditingPortId(port.id); setEditNameVal(port.name)}}/></>
                                    )}
                                </div>
                                <div className="header-actions">
                                    {isIncluded ? <FiEye className="icon-btn active" onClick={()=>toggleVisibility(port)}/> : <FiEyeOff className="icon-btn inactive" onClick={()=>toggleVisibility(port)}/>}
                                    <FiStar className={`icon-btn star ${port.isPinned?'pinned':''}`} onClick={()=>togglePin(port)}/>
                                    <FiTrash2 className="icon-btn delete" onClick={()=>setModalConfig({isOpen:true, type:'portfolio', id:port.id, message:`Delete ${port.name}?`})}/>
                                </div>
                            </div>
                            <div className="card-stats">
                                <div className="stat-box">
                                    <label>Value</label>
                                    <span className="val">₹{pVal.toLocaleString('en-IN', {maximumFractionDigits:0})}</span>
                                    {/* FIX: Added Invested amount display */}
                                    <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px', display: 'block' }}>
                                        Invested: ₹{pInv.toLocaleString('en-IN', {maximumFractionDigits:0})}
                                    </span>
                                </div>
                                <div className="stat-box right">
                                    <label>Return</label>
                                    {/* FIX: Negative Sign Support */}
                                    <span className={`val ${pGain>=0?'green':'red'}`}>
                                        {pGain>=0?'+':'-'}₹{Math.abs(pGain).toLocaleString('en-IN')}
                                    </span>
                                    {/* FIX: Percentage Display */}
                                    <span style={{ fontSize: '0.75rem', color: pGain >= 0 ? '#00C49F' : '#FF4d4d', marginTop: '2px', display: 'block' }}>
                                        {pGain>=0?'+':''}{pPerc.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                            <div className="stock-list-container">
                                {port.stocks.map(s => {
                                    const price = liveValues[s.symbol] || s.lastPrice || 0;
                                    const sVal = price * s.quantity;
                                    const sGain = sVal - (s.avgBuyPrice * s.quantity);
                                    if(editingStockId === s.stockId) return (
                                        <div key={s.stockId} className="stock-item editing">
                                            <span className="sym">{s.symbol}</span>
                                            <div className="edit-inputs"><input value={editStockForm.quantity} onChange={e=>setEditStockForm({...editStockForm, quantity:e.target.value})} placeholder="Qty"/><input value={editStockForm.price} onChange={e=>setEditStockForm({...editStockForm, price:e.target.value})} placeholder="Price"/></div>
                                            <div className="edit-actions"><FiCheck className="action-icon success" onClick={()=>saveStockEdit(s.stockId)}/><FiX className="action-icon danger" onClick={()=>setEditingStockId(null)}/></div>
                                        </div>
                                    );
                                    return (
                                        <div key={s.stockId} className="stock-item">
                                            <div className="stock-info"><span className="sym">{s.symbol}</span><div className="details">{s.quantity} @ ₹{s.avgBuyPrice} <FiEdit2 className="mini-edit-btn" onClick={()=>{setEditingStockId(s.stockId); setEditStockForm({quantity:s.quantity, price:s.avgBuyPrice})}}/></div></div>
                                            <div className="stock-metrics"><div className="stock-price">₹{price.toFixed(2)}</div><div className={`stock-return ${sGain>=0?'green':'red'}`}>{sGain>=0?'+':''}{((sGain/(s.avgBuyPrice*s.quantity))*100).toFixed(1)}%</div></div>
                                            <FiTrash2 className="del-stock-btn" onClick={()=>setModalConfig({isOpen:true, type:'stock', id:s.stockId, message:`Remove ${s.symbol}?`})}/>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="card-footer">
                                {activeAddStockId===port.id ? (
                                    <div className="add-stock-form">
                                        <div className="autocomplete-wrapper"><input value={stockForm.symbol} onChange={handleSymbolChange} placeholder="Symbol (TCS.NS)"/>{suggestions.length>0 && <ul className="suggestions-list">{suggestions.map(s=><li key={s} onClick={()=>selectSuggestion(s)}>{s}</li>)}</ul>}</div>
                                        <div className="form-row split"><input value={stockForm.quantity} onChange={e=>setStockForm({...stockForm, quantity:e.target.value})} placeholder="Qty"/><input value={stockForm.price} onChange={e=>setStockForm({...stockForm, price:e.target.value})} placeholder="Price"/></div>
                                        <div className="form-actions"><button className="btn-save" onClick={()=>handleAddStock(port.id)}>Add</button><button className="btn-cancel" onClick={()=>setActiveAddStockId(null)}>Cancel</button></div>
                                    </div>
                                ) : <button className="btn-secondary" onClick={()=>setActiveAddStockId(port.id)}>+ Add Stock</button>}
                            </div>
                        </div>
                    );
                })}
            </div>
            {modalConfig.isOpen && <div className="modal-overlay"><div className="modal-content"><div className="modal-header"><h3>Confirm</h3></div><p>{modalConfig.message}</p><div className="modal-actions"><button className="btn-modal-cancel" onClick={()=>setModalConfig({isOpen:false})}>Cancel</button><button className="btn-modal-delete" onClick={confirmDelete}>Delete</button></div></div></div>}
        </div>
    );
};

export default PortfolioPage;
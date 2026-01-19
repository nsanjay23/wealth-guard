import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { FiShield, FiCpu } from 'react-icons/fi';
import './RiskHeatmapPage.css';

// --- MOCK DATA ---
// --- 1. REALISTIC RISK DATABASE (Based on 2024-25 Market Metrics) ---
const RISK_DB = {
    // --- GIANTS & STABLE (Low-Med Risk) ---
    "RELIANCE.NS": { volatility: 0.19, beta: 1.08, drawdown: 0.12, health: 0.90, sectorRisk: 0.3, marketCap: 1.00 }, // Oil/Telco Giant
    "TCS.NS":      { volatility: 0.16, beta: 0.75, drawdown: 0.10, health: 0.95, sectorRisk: 0.2, marketCap: 0.85 }, // IT Leader
    "HDFCBANK.NS": { volatility: 0.18, beta: 1.05, drawdown: 0.15, health: 0.92, sectorRisk: 0.4, marketCap: 0.90 }, // Banking Leader
    "INFY.NS":     { volatility: 0.21, beta: 0.90, drawdown: 0.18, health: 0.90, sectorRisk: 0.3, marketCap: 0.75 }, // IT
    "ITC.NS":      { volatility: 0.14, beta: 0.65, drawdown: 0.08, health: 0.94, sectorRisk: 0.2, marketCap: 0.60 }, // FMCG (Defensive)
    "HINDUNILVR.NS":{volatility: 0.15, beta: 0.60, drawdown: 0.10, health: 0.93, sectorRisk: 0.2, marketCap: 0.65 }, // FMCG
    "ASIANPAINT.NS":{volatility: 0.18, beta: 0.75, drawdown: 0.15, health: 0.90, sectorRisk: 0.3, marketCap: 0.40 }, // Consumption
    "MARUTI.NS":   { volatility: 0.22, beta: 0.95, drawdown: 0.20, health: 0.90, sectorRisk: 0.5, marketCap: 0.45 }, // Auto (Stable)
    "TITAN.NS":    { volatility: 0.24, beta: 1.10, drawdown: 0.18, health: 0.88, sectorRisk: 0.4, marketCap: 0.40 }, // Luxury Retail
    "SUNPHARMA.NS":{ volatility: 0.19, beta: 0.65, drawdown: 0.12, health: 0.85, sectorRisk: 0.3, marketCap: 0.45 }, // Pharma (Defensive)
    "POWERGRID.NS":{ volatility: 0.16, beta: 0.55, drawdown: 0.10, health: 0.85, sectorRisk: 0.2, marketCap: 0.35 }, // Utilities (Defensive)
    "NTPC.NS":     { volatility: 0.18, beta: 0.70, drawdown: 0.12, health: 0.80, sectorRisk: 0.3, marketCap: 0.40 }, // Power PSU

    // --- BANKING & FINANCE (Medium Risk) ---
    "ICICIBANK.NS":{ volatility: 0.22, beta: 1.15, drawdown: 0.18, health: 0.88, sectorRisk: 0.4, marketCap: 0.70 },
    "SBIN.NS":     { volatility: 0.28, beta: 1.35, drawdown: 0.25, health: 0.75, sectorRisk: 0.5, marketCap: 0.60 }, // PSU Bank
    "AXISBANK.NS": { volatility: 0.26, beta: 1.25, drawdown: 0.22, health: 0.80, sectorRisk: 0.4, marketCap: 0.45 },
    "KOTAKBANK.NS":{ volatility: 0.20, beta: 1.00, drawdown: 0.15, health: 0.88, sectorRisk: 0.4, marketCap: 0.50 },
    "BAJFINANCE.NS":{volatility: 0.32, beta: 1.55, drawdown: 0.30, health: 0.85, sectorRisk: 0.6, marketCap: 0.55 }, // NBFC (High Growth)

    // --- CYCLICAL & VOLATILE (Med-High Risk) ---
    "BHARTIARTL.NS":{volatility: 0.20, beta: 0.85, drawdown: 0.15, health: 0.75, sectorRisk: 0.3, marketCap: 0.75 }, // Telecom
    "LT.NS":       { volatility: 0.22, beta: 1.10, drawdown: 0.20, health: 0.85, sectorRisk: 0.5, marketCap: 0.65 }, // Infra Giant
    "M&M.NS":      { volatility: 0.24, beta: 1.15, drawdown: 0.20, health: 0.85, sectorRisk: 0.5, marketCap: 0.40 }, // Auto
    "TATAMOTORS.NS":{volatility: 0.42, beta: 1.80, drawdown: 0.45, health: 0.65, sectorRisk: 0.6, marketCap: 0.35 }, // Auto (Cyclical)
    "WIPRO.NS":    { volatility: 0.25, beta: 1.00, drawdown: 0.25, health: 0.80, sectorRisk: 0.3, marketCap: 0.30 }, // IT
    "HCLTECH.NS":  { volatility: 0.23, beta: 0.90, drawdown: 0.18, health: 0.85, sectorRisk: 0.3, marketCap: 0.45 }, // IT
    "ULTRACEMCO.NS":{volatility: 0.22, beta: 0.95, drawdown: 0.18, health: 0.85, sectorRisk: 0.4, marketCap: 0.35 }, // Cement
    "GRASIM.NS":   { volatility: 0.26, beta: 1.10, drawdown: 0.22, health: 0.75, sectorRisk: 0.5, marketCap: 0.25 }, // Conglomerate
    "BPCL.NS":     { volatility: 0.30, beta: 1.10, drawdown: 0.28, health: 0.70, sectorRisk: 0.6, marketCap: 0.20 }, // Oil PSU
    "ONGC.NS":     { volatility: 0.28, beta: 0.95, drawdown: 0.25, health: 0.75, sectorRisk: 0.6, marketCap: 0.30 }, // Oil PSU
    "COALINDIA.NS":{ volatility: 0.25, beta: 0.85, drawdown: 0.20, health: 0.80, sectorRisk: 0.5, marketCap: 0.25 }, // Mining

    // --- HIGH RISK / HIGH BETA (High Risk) ---
    "ADANIENT.NS": { volatility: 0.65, beta: 2.45, drawdown: 0.60, health: 0.55, sectorRisk: 0.9, marketCap: 0.45 }, // High Volatility
    "JSWSTEEL.NS": { volatility: 0.38, beta: 2.15, drawdown: 0.35, health: 0.65, sectorRisk: 0.8, marketCap: 0.30 }, // Metals
    "TATASTEEL.NS":{ volatility: 0.40, beta: 1.50, drawdown: 0.40, health: 0.60, sectorRisk: 0.8, marketCap: 0.25 }, // Metals
    "HINDALCO.NS": { volatility: 0.42, beta: 1.45, drawdown: 0.40, health: 0.65, sectorRisk: 0.8, marketCap: 0.20 }, // Metals
    "VEDL.NS":     { volatility: 0.45, beta: 1.03, drawdown: 0.45, health: 0.50, sectorRisk: 0.8, marketCap: 0.20 }, // High Debt
    "MRF.NS":      { volatility: 0.20, beta: 0.85, drawdown: 0.15, health: 0.85, sectorRisk: 0.4, marketCap: 0.15 }, // High Price/Low Vol
};
const DEFAULT_RISK = { volatility: 0.30, beta: 1.0, drawdown: 0.25, health: 0.7, sectorRisk: 0.5, marketCap: 0.5 };

// --- TAX TIPS LIBRARY ---
const TAX_TIPS = [
    { title: "Section 80C Limit", desc: "Claim up to ₹1.5 Lakhs deduction for investments in PPF, EPF, and ELSS." },
    { title: "NPS Benefit", desc: "Claim an extra ₹50,000 deduction for NPS contributions under Section 80CCD(1B)." },
    { title: "Health Insurance", desc: "Save tax on premiums up to ₹25,000 (self) and ₹50,000 (parents) under 80D." },
    { title: "LTCG Harvesting", desc: "Long Term Capital Gains up to ₹1 Lakh/year are tax-free. Reset cost basis yearly." },
    { title: "Home Loan Interest", desc: "Deduct up to ₹2 Lakhs interest on home loans under Section 24(b)." },
    { title: "Savings Interest", desc: "Section 80TTA allows tax-free interest up to ₹10,000 from savings accounts." }
];

const RiskHeatmapPage = () => {
    const [portfolios, setPortfolios] = useState([]);
    const [selectedPortId, setSelectedPortId] = useState('');
    const [heatmapData, setHeatmapData] = useState([]);
    const [aiInsight, setAiInsight] = useState("Select a portfolio to generate risk analysis.");
    const [loading, setLoading] = useState(false);
    
    // NEW: Tip State
    const [currentTip, setCurrentTip] = useState(TAX_TIPS[0]);

    // --- 1. HELPER: Random Tip ---
    const pickRandomTip = () => {
        const randomIndex = Math.floor(Math.random() * TAX_TIPS.length);
        setCurrentTip(TAX_TIPS[randomIndex]);
    };

    // --- 2. FETCH PORTFOLIOS ---
    useEffect(() => {
        const fetchPorts = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/portfolios', { withCredentials: true });
                setPortfolios(res.data);
                if (res.data.length > 0) setSelectedPortId(res.data[0].id);
            } catch (err) { console.error(err); }
        };
        fetchPorts();
    }, []);

    // --- 3. RISK ALGORITHM ---
    const calculateRiskScore = (symbol) => {
        const metrics = RISK_DB[symbol] || DEFAULT_RISK;
        const W = { vol: 30, beta: 20, dd: 20, health: 15, sector: 10, cap: 5 };
        const score = 
            (metrics.volatility * W.vol) +
            (Math.min(metrics.beta / 2, 1) * W.beta) +
            (metrics.drawdown * W.dd) +
            ((1 - metrics.health) * W.health) + 
            (metrics.sectorRisk * W.sector) +
            ((1 - metrics.marketCap) * W.cap);
        return Math.round(score);
    };

    const getRiskCategory = (score) => {
        if (score <= 30) return { label: 'Low Risk', color: '#00C49F', bg: 'rgba(0, 196, 159, 0.2)' };
        if (score <= 60) return { label: 'Medium Risk', color: '#FFBB28', bg: 'rgba(255, 187, 40, 0.2)' };
        return { label: 'High Risk', color: '#FF4d4d', bg: 'rgba(255, 77, 77, 0.2)' };
    };

    // --- 4. GENERATE HEATMAP (With Loading & Timer) ---
    useEffect(() => {
        if (!selectedPortId || portfolios.length === 0) return;

        setLoading(true);
        pickRandomTip(); // Show new tip

        // 1. Minimum Loading Timer (2.5s)
        const minTimer = new Promise(resolve => setTimeout(resolve, 2500));

        // 2. Data Calculation Promise
        const dataPromise = new Promise(resolve => {
            const currentPort = portfolios.find(p => p.id === parseInt(selectedPortId));
            if (!currentPort) return resolve(null);

            let totalValue = 0;
            let highRiskCount = 0;
            let totalRiskScore = 0;

            const data = currentPort.stocks.map(s => {
                const value = (s.lastPrice || s.avgBuyPrice) * s.quantity;
                totalValue += value;
                const score = calculateRiskScore(s.symbol);
                const category = getRiskCategory(score);

                if (score > 60) highRiskCount += value;
                totalRiskScore += (score * value);

                return {
                    name: s.symbol,
                    size: value,
                    score: score,
                    category: category.label,
                    fill: category.color
                };
            });

            // AI Insight Logic
            const portfolioRiskScore = totalValue > 0 ? Math.round(totalRiskScore / totalValue) : 0;
            const highRiskPercent = totalValue > 0 ? ((highRiskCount / totalValue) * 100).toFixed(1) : 0;

            let insight = "";
            if (portfolioRiskScore < 30) {
                insight = `🛡️ **Defensive Portfolio:** Your overall risk score is ${portfolioRiskScore}/100. You are heavily invested in stable, blue-chip stocks. Excellent for capital preservation.`;
            } else if (portfolioRiskScore < 60) {
                insight = `⚖️ **Balanced Strategy:** Your portfolio risk is moderate (${portfolioRiskScore}/100). You have a healthy mix of growth and stability. Consider hedging if market volatility increases.`;
            } else {
                insight = `⚠️ **High Exposure:** Your portfolio has a high risk score of ${portfolioRiskScore}/100. ${highRiskPercent}% of your capital is in volatile assets. Consider diversifying into defensive sectors like FMCG or IT.`;
            }

            resolve({ data, insight });
        });

        // 3. Wait for BOTH
        Promise.all([minTimer, dataPromise]).then(([_, result]) => {
            if (result) {
                setHeatmapData(result.data);
                setAiInsight(result.insight);
            }
            setLoading(false);
        });

    }, [selectedPortId, portfolios]);

    const CustomContent = (props) => {
        const { x, y, width, height, name, score, fill } = props;
        if (width < 50 || height < 50) return <g><rect x={x} y={y} width={width} height={height} fill={fill} stroke="#1e1e1e" strokeWidth={2} rx={4}/></g>;
        
        return (
            <g>
                <rect x={x} y={y} width={width} height={height} fill={fill} stroke="#1e1e1e" strokeWidth={2} rx={6} />
                <text x={x + width / 2} y={y + height / 2 - 5} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="bold">
                    {name.split('.')[0]}
                </text>
                <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize={10}>
                    Risk: {score}
                </text>
            </g>
        );
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div className="risk-tooltip">
                    <h4>{d.name}</h4>
                    <p>Value: ₹{d.size.toLocaleString()}</p>
                    <hr/>
                    <div className="risk-badge" style={{backgroundColor: d.fill}}>{d.category} ({d.score})</div>
                    <p className="reason">Weighted factors: Volatility & Drawdown</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="risk-page">
            <header className="page-header">
                <div>
                    <h1>Risk Heatmap</h1>
                    <p>Visualize portfolio risk distribution.</p>
                </div>
                <div className="header-icon"><FiShield /></div>
            </header>

            <div className="controls-bar">
                <label>Analyze Portfolio:</label>
                <select value={selectedPortId} onChange={e => setSelectedPortId(e.target.value)}>
                    {portfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            {loading ? (
                // --- FIXED LOADING UI (Matches other pages) ---
                <div className="loading-tip-container">
                    <div className="spinner"></div>
                    <div className="tip-content">
                        <h4>Did You Know? Tax Tip</h4>
                        <h3>{currentTip.title}</h3>
                        <p>{currentTip.desc}</p>
                    </div>
                </div>
            ) : (
                <div className="risk-layout">
                    <div className="heatmap-container">
                        <div className="heatmap-header">
                            <h3>Portfolio Risk Map</h3>
                            <div className="legend">
                                <span className="dot green"></span> Safe
                                <span className="dot yellow"></span> Moderate
                                <span className="dot red"></span> High
                            </div>
                        </div>
                        <div className="chart-area">
                            <ResponsiveContainer width="100%" height={400}>
                                <Treemap
                                    data={heatmapData}
                                    dataKey="size"
                                    stroke="#fff"
                                    fill="#8884d8"
                                    content={<CustomContent />}
                                >
                                    <Tooltip content={<CustomTooltip />} />
                                </Treemap>
                            </ResponsiveContainer>
                        </div>
                        <p className="chart-note">Box Size = Investment Value | Color = Risk Level</p>
                    </div>

                    <div className="side-panel">
                        <div className="ai-insight-card">
                            <div className="card-title"><FiCpu /> AI Risk Assessment</div>
                            <p className="insight-text">{aiInsight}</p>
                        </div>

                        <div className="risk-list">
                            <h3>Risk Breakdown</h3>
                            <div className="list-header">
                                <span>Stock</span>
                                <span>Score</span>
                            </div>
                            <div className="list-body">
                                {heatmapData.sort((a,b) => b.score - a.score).map(stock => (
                                    <div key={stock.name} className="list-row">
                                        <span className="stock-name">{stock.name}</span>
                                        <span className="risk-pill" style={{color: stock.fill, borderColor: stock.fill}}>
                                            {stock.score}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskHeatmapPage;
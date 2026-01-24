import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './DashboardPage.css';
import useAuthStatus from '../hooks/useAuthStatus';
import { FiArrowUpRight, FiShield, FiAlertCircle, FiTrendingUp, FiTrendingDown, FiClock } from 'react-icons/fi';

// --- RISK DATABASE (Shared with RiskHeatmapPage) ---
const RISK_DB = {
    "RELIANCE.NS": { volatility: 0.19, beta: 1.08, drawdown: 0.12, health: 0.90, sectorRisk: 0.3, marketCap: 1.00 },
    "TCS.NS":      { volatility: 0.16, beta: 0.75, drawdown: 0.10, health: 0.95, sectorRisk: 0.2, marketCap: 0.85 },
    "HDFCBANK.NS": { volatility: 0.18, beta: 1.05, drawdown: 0.15, health: 0.92, sectorRisk: 0.4, marketCap: 0.90 },
    "INFY.NS":     { volatility: 0.21, beta: 0.90, drawdown: 0.18, health: 0.90, sectorRisk: 0.3, marketCap: 0.75 },
    "ITC.NS":      { volatility: 0.14, beta: 0.65, drawdown: 0.08, health: 0.94, sectorRisk: 0.2, marketCap: 0.60 },
    "ICICIBANK.NS":{ volatility: 0.22, beta: 1.15, drawdown: 0.18, health: 0.88, sectorRisk: 0.4, marketCap: 0.70 },
    "SBIN.NS":     { volatility: 0.28, beta: 1.35, drawdown: 0.25, health: 0.75, sectorRisk: 0.5, marketCap: 0.60 },
    "ADANIENT.NS": { volatility: 0.65, beta: 2.45, drawdown: 0.60, health: 0.55, sectorRisk: 0.9, marketCap: 0.45 },
};
const DEFAULT_RISK = { volatility: 0.30, beta: 1.0, drawdown: 0.25, health: 0.7, sectorRisk: 0.5, marketCap: 0.5 };

const DashboardPage = () => {
  const { user, isLoading: authLoading } = useAuthStatus();
  const [portfolios, setPortfolios] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [liveValues, setLiveValues] = useState({});
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
        const [portRes, polRes] = await Promise.all([
            axios.get('http://localhost:5001/api/portfolios', { withCredentials: true }),
            axios.get('http://localhost:5001/api/policies', { withCredentials: true })
        ]);

        setPortfolios(portRes.data);
        setPolicies(polRes.data);

        // Fetch live prices for all unique symbols across ALL portfolios
        const allSymbols = new Set();
        portRes.data.forEach(p => p.stocks.forEach(s => allSymbols.add(s.symbol)));
        if (allSymbols.size > 0) {
            await fetchLivePrices(Array.from(allSymbols));
        }
    } catch (err) {
        console.error("Dashboard Fetch Error:", err);
    } finally {
        setIsDataLoading(false);
    }
  };

  const fetchLivePrices = async (symbols) => {
    const prices = {};
    await Promise.all(symbols.map(async (sym) => {
        try {
            const proxyUrl = `http://localhost:5001/api/portfolios/proxy/yahoo?symbol=${sym}&range=1d&interval=1d`;
            const response = await fetch(proxyUrl);
            const data = await response.json();
            const meta = data?.chart?.result?.[0]?.meta;
            if (meta) prices[sym] = meta.regularMarketPrice;
        } catch (e) { console.error(`Price fetch failed for ${sym}`); }
    }));
    setLiveValues(prev => ({...prev, ...prices}));
  };

  // --- DYNAMIC CALCULATIONS ---
  const stats = useMemo(() => {
    let totalAssets = 0;
    let totalInvested = 0;
    let totalWeightedRisk = 0;
    let totalWeight = 0;

    // 1. Portfolio Calculations (Visible only)
    portfolios.filter(p => p.isVisible).forEach(port => {
        port.stocks.forEach(s => {
            const price = liveValues[s.symbol] || s.lastPrice || s.avgBuyPrice;
            const currentVal = price * s.quantity;
            totalAssets += currentVal;
            totalInvested += s.avgBuyPrice * s.quantity;

            // Risk Calculation Logic
            const metrics = RISK_DB[s.symbol] || DEFAULT_RISK;
            const riskScore = Math.round((metrics.volatility * 30) + (Math.min(metrics.beta / 2, 1) * 20) + (metrics.drawdown * 20));
            totalWeightedRisk += (riskScore * currentVal);
            totalWeight += currentVal;
        });
    });

    const assetChange = totalInvested > 0 ? ((totalAssets - totalInvested) / totalInvested) * 100 : 0;
    const avgRiskScore = totalWeight > 0 ? totalWeightedRisk / totalWeight : 0;

    let riskLabel = "Low";
    if (avgRiskScore > 30) riskLabel = "Moderate";
    if (avgRiskScore > 60) riskLabel = "High";

    // 2. Insurance Calculations (Next Due)
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const futurePolicies = policies
        .map(p => ({ ...p, diff: new Date(p.dueDate) - today }))
        .filter(p => p.diff >= 0)
        .sort((a, b) => a.diff - b.diff);

    const nextPolicy = futurePolicies[0] || null;
    const daysLeft = nextPolicy ? Math.ceil(nextPolicy.diff / (1000 * 60 * 60 * 24)) : null;

    return { totalAssets, assetChange, riskLabel, daysLeft, nextPolicy };
  }, [portfolios, policies, liveValues]);

  if (authLoading || isDataLoading) return <div className="loading-state">Loading your wealth overview...</div>;

  const pinnedPortfolios = portfolios.filter(p => p.isPinned);

  return (
    <div className="dashboard-page-content">
      <div className="dashboard-header">
        <h1>Welcome, {user?.first_name || 'Investor'}!</h1>
        <p>Here is your financial overview for today.</p>
      </div>

      <div className="dashboard-grid">
        {/* --- DYNAMIC TOTAL ASSETS --- */}
        <div className="glass-card">
          <h3>Total Assets</h3>
          <div className="value">₹{stats.totalAssets.toLocaleString('en-IN', {maximumFractionDigits: 0})}</div>
          <div className={stats.assetChange >= 0 ? "text-green" : "text-orange"}>
            {stats.assetChange >= 0 ? <FiTrendingUp /> : <FiTrendingDown />} 
            <span>{stats.assetChange >= 0 ? '+' : ''}{stats.assetChange.toFixed(2)}% Total Return</span>
          </div>
        </div>

        {/* --- DYNAMIC RISK ASSESSMENT --- */}
        <div className="glass-card">
          <h3>Risk Assessment</h3>
          <div className="value">{stats.riskLabel}</div>
          <div className="text-orange">
            <FiAlertCircle style={{marginRight: '6px'}}/>
            <span>Based on {portfolios.filter(p => p.isVisible).length} active portfolios</span>
          </div>
        </div>

        {/* --- DYNAMIC NEXT RENEWAL --- */}
        <div className="glass-card">
          <h3>Next Renewal</h3>
          <div className="value">{stats.daysLeft !== null ? `${stats.daysLeft} Days` : 'N/A'}</div>
          <div className="text-blue">
            <FiShield /> 
            <span>{stats.nextPolicy ? stats.nextPolicy.policyName : 'No upcoming renewals'}</span>
          </div>
        </div>

        {/* --- PINNED PORTFOLIOS SECTION --- */}
        {pinnedPortfolios.length > 0 && (
            <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                <h3 style={{ color: '#ccc', marginBottom: '15px' }}>📌 Pinned Portfolios</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {pinnedPortfolios.map(port => {
                        let currentVal = 0, investedVal = 0;
                        port.stocks.forEach(s => {
                            currentVal += (liveValues[s.symbol] || s.lastPrice || s.avgBuyPrice) * s.quantity;
                            investedVal += s.avgBuyPrice * s.quantity;
                        });
                        const gain = currentVal - investedVal;
                        const gainPercent = investedVal > 0 ? (gain / investedVal) * 100 : 0;
                        const isProfit = gain >= 0;

                        return (
                            <div key={port.id} className="glass-card" style={{ minHeight: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{display:'flex', justifyContent:'space-between'}}>
                                    <h3 style={{margin:0}}>{port.name}</h3>
                                    <span style={{ fontSize: '0.9rem', color: isProfit ? '#00C49F' : '#FF4d4d' }}>
                                        {isProfit ? '+' : ''}{gainPercent.toFixed(2)}%
                                    </span>
                                </div>
                                <div className="value" style={{fontSize: '1.5rem'}}>
                                    ₹{currentVal.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#888' }}>
                                    Invested: ₹{investedVal.toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
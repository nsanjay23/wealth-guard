import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DashboardPage.css';
import useAuthStatus from '../hooks/useAuthStatus';
import { FiArrowUpRight, FiShield, FiAlertCircle, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const DashboardPage = () => {
  const { user, isLoading } = useAuthStatus();
  const [pinnedPortfolios, setPinnedPortfolios] = useState([]);
  const [liveValues, setLiveValues] = useState({});

  useEffect(() => {
    fetchPinnedPortfolios();
  }, []);

  const fetchPinnedPortfolios = async () => {
    try {
        const res = await axios.get('http://localhost:5001/api/portfolios', { withCredentials: true });
        // Filter only pinned
        const pinned = res.data.filter(p => p.isPinned);
        setPinnedPortfolios(pinned);

        const allSymbols = new Set();
        pinned.forEach(p => p.stocks.forEach(s => allSymbols.add(s.symbol)));
        fetchLivePrices(Array.from(allSymbols));
    } catch (err) { console.error(err); }
  };

  const fetchLivePrices = async (symbols) => {
    if(symbols.length === 0) return;
    const prices = {};
    await Promise.all(symbols.map(async (sym) => {
        try {
            const proxyUrl = `http://localhost:5001/api/portfolios/proxy/yahoo?symbol=${sym}&range=1d&interval=1d`;
            const response = await fetch(proxyUrl);
            const data = await response.json();
            const meta = data?.chart?.result?.[0]?.meta;
            if (meta) prices[sym] = meta.regularMarketPrice;
        } catch (e) {}
    }));
    setLiveValues(prev => ({...prev, ...prices}));
  };

  if (isLoading) return <div className="loading-state">Loading dashboard...</div>;

  return (
    <div className="dashboard-page-content">
      <div className="dashboard-header">
        <h1>Welcome, {user?.first_name || 'Investor'}!</h1>
        <p>Here is your financial overview for today.</p>
      </div>

      <div className="dashboard-grid">
        {/* --- EXISTING WIDGETS --- */}
        <div className="glass-card">
          <h3>Total Assets</h3>
          <div className="value">$12,450.00</div>
          <div className="text-green"><FiArrowUpRight /> <span>+12.75% Today</span></div>
        </div>

        <div className="glass-card">
          <h3>Risk Assessment</h3>
          <div className="value">Moderate</div>
          <div className="text-orange"><FiAlertCircle style={{marginRight: '6px'}}/><span>Hold</span></div>
        </div>

        <div className="glass-card">
          <h3>Next Renewal</h3>
          <div className="value">14 Days</div>
          <div className="text-blue"><FiShield /> <span>Policy #8839</span></div>
        </div>

        {/* --- PINNED PORTFOLIOS SECTION --- */}
        {pinnedPortfolios.length > 0 && (
            <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                <h3 style={{ color: '#ccc', marginBottom: '15px' }}>📌 Pinned Portfolios</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {pinnedPortfolios.map(port => {
                        let currentVal = 0, investedVal = 0;
                        port.stocks.forEach(s => {
                            currentVal += (liveValues[s.symbol] || s.avgBuyPrice) * s.quantity;
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
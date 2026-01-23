import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import fundamentalsData from '../data/fundamentalsData';
import './Fundamentals.css';

const FundamentalsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [liveData, setLiveData] = useState({});
  const navigate = useNavigate();

  // Mapping to Yahoo Finance Tickers (NSE uses .NS extension)
  const tickerMap = {
    "RELI": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "HDBK": "HDFCBANK.NS",
    "INFY": "INFY.NS",
    "ITC": "ITC.NS",
    "BPCL": "BPCL.NS",
    "SBI": "SBIN.NS",
    "ICBK": "ICICIBANK.NS",
    "MRF": "MRF.NS",
    "VDAN": "VEDL.NS"
  };

  const fetchStockPrice = async (symbol, internalId) => {
    try {
      const proxyUrl = `http://localhost:5001/api/portfolios/proxy/yahoo?symbol=${symbol}&range=1d&interval=1d`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const meta = data?.chart?.result?.[0]?.meta;

      if (meta) {
        const price = meta.regularMarketPrice || 0;
        const prevClose = meta.previousClose || meta.chartPreviousClose || price;
        const changeAmount = price - prevClose;
        let changePercent = 0;
        
        if (prevClose > 0) {
          changePercent = (changeAmount / prevClose) * 100;
        }

        setLiveData(prev => ({
          ...prev,
          [internalId]: {
            price: price.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR'
            }),
            change: (isNaN(changePercent) ? "0.00" : changePercent.toFixed(2)) + '%',
            isPositive: changeAmount >= 0
          }
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error);
    }
  };

  useEffect(() => {
    const symbols = Object.keys(tickerMap);
    
    symbols.forEach((id) => {
      fetchStockPrice(tickerMap[id], id);
    });
    
    const interval = setInterval(() => {
      symbols.forEach((id) => {
        fetchStockPrice(tickerMap[id], id);
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const filteredCompanies = fundamentalsData.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fundamentals-container">
      <header className="page-header">
        <h1>Company Fundamentals</h1>
        <p>Deep dive into financial health, ratios, and growth.</p>
      </header>

      {/* SEARCH BAR */}
      <div className="search-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by Company Name or Symbol (e.g. TCS)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* COMPANY LIST */}
      <div className="company-list">
        {filteredCompanies.map((company) => {
          const currentPrice = liveData[company.symbol]?.price || company.price;
          const currentChange = liveData[company.symbol]?.change || company.change;
          
          const isPos = liveData[company.symbol] 
            ? liveData[company.symbol].isPositive 
            : company.change.includes('+');

          return (
            <div 
              key={company.symbol} 
              className="company-wide-card"
              onClick={() => navigate(`/fundamentals/${company.symbol}`)}
            >
              <div className="card-left">
                <div className="company-badge">{company.symbol}</div>
                <div>
                  <h3>{company.name}</h3>
                  <span className="sector-tag">{company.sector}</span>
                </div>
              </div>

              <div className="card-stats">
                <div className="stat-box">
                  <label>Market Cap</label>
                  <span>{company.marketCap}</span>
                </div>
                <div className="stat-box">
                  <label>P/E Ratio</label>
                  <span>{company.ratios.pe}</span>
                </div>
                <div className="stat-box">
                  <label>Health Score</label>
                  <span className={`score ${company.healthScore > 80 ? 'high' : 'med'}`}>
                    {company.healthScore}/100
                  </span>
                </div>
              </div>

              <div className="card-right">
                <span className="price">{currentPrice}</span>
                <span className={`change ${isPos ? 'pos' : 'neg'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isPos ? <FiTrendingUp /> : <FiTrendingDown />}
                  {currentChange.replace('+', '')}
                </span>
                <button className="view-btn">View Analysis →</button>
              </div>
            </div>
          );
        })}
        
        {filteredCompanies.length === 0 && (
          <div className="no-results">No companies found matching "{searchTerm}"</div>
        )}
      </div>
    </div>
  );
};

export default FundamentalsDashboard;
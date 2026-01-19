import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import fundamentalsData from '../data/fundamentalsData';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import './Fundamentals.css';

const parseCurrency = (val) => {
    if (!val) return 0;
    // Remove symbols but keep the numbers
    let num = parseFloat(val.toString().replace(/[₹,]/g, ''));
    if (val.toString().includes('T')) return num * 100000;
    if (val.toString().includes('Cr')) return num / 100;
    return num;
};

const CompanyDetailsPage = () => {
  const { symbol } = useParams();
  // Find static data first
  const company = fundamentalsData.find(c => c.symbol.toLowerCase() === symbol?.toLowerCase());
  
  // State for live price
  const [liveData, setLiveData] = useState(null);

  // Mapping needed for Yahoo Finance (NSE extension)
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

  useEffect(() => {
    if (company && tickerMap[company.symbol]) {
        fetchStockPrice(tickerMap[company.symbol]);
    }
  }, [company]);

  const fetchStockPrice = async (yahooSymbol) => {
    try {
      // Use local backend proxy
      const proxyUrl = `http://localhost:5001/api/portfolios/proxy/yahoo?symbol=${yahooSymbol}&range=1d&interval=1d`;

      const response = await fetch(proxyUrl);
      const data = await response.json();
      const meta = data?.chart?.result?.[0]?.meta;

      if (meta) {
        const price = meta.regularMarketPrice || 0;
        const prevClose = meta.previousClose || meta.chartPreviousClose || price;
        const changeAmount = price - prevClose;
        const changePercent = prevClose > 0 ? (changeAmount / prevClose) * 100 : 0;

        setLiveData({
            price: price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
            change: (changeAmount >= 0 ? "+" : "") + changePercent.toFixed(2) + "%",
            isPositive: changeAmount >= 0
        });
      }
    } catch (error) {
      console.error("Error fetching live details:", error);
    }
  };

  if (!company) return <div className="fundamentals-container"><div className="no-results">Company Not Found</div></div>;

  // Use live data if available, otherwise fallback to static `company` data
  const displayPrice = liveData ? liveData.price : company.price;
  const displayChange = liveData ? liveData.change : company.change;
  const isPositive = liveData ? liveData.isPositive : company.change.includes('+');

  // --- MOCK DATA LOGIC ---
  const cashFlowData = company.cashFlow ? company.history.years.map((year, i) => ({
      year,
      Operating: company.cashFlow.operating[i],
      Investing: company.cashFlow.investing[i],
      Financing: company.cashFlow.financing[i]
  })) : [];

  const totalAssets = parseCurrency(company.balanceSheet?.totalAssets);
  const totalLiabs = parseCurrency(company.balanceSheet?.totalLiabilities);
  const totalVolume = totalAssets + totalLiabs;
  const assetFlex = totalVolume ? (totalAssets / totalVolume) * 10 : 7;
  const liabFlex = totalVolume ? (totalLiabs / totalVolume) * 10 : 3;

  return (
    <div className="details-page">
      <Link to="/fundamentals" className="back-link">← Back to Search</Link>

      {/* 1. TOP SNAPSHOT HEADER */}
      <div className="details-header-card">
        <div className="header-left">
            <h1>{company.name} <span className="ticker">({company.symbol})</span></h1>
            <div className="badges">
                <span className="sector-badge">{company.sector}</span>
                <span className="exch-badge">NSE</span>
            </div>
        </div>
        <div className="header-right">
            <div className="price-box">
                <h2>{displayPrice}</h2>
                <span className={`change ${isPositive ? 'pos' : 'neg'}`}>{displayChange}</span>
            </div>
            <div className="cap-box">
                <label>Market Cap</label>
                <span>{company.marketCap}</span>
            </div>
        </div>
      </div>

      {/* 2. HEALTH SCORE & INSIGHTS */}
      <div className="grid-section insights-grid">
        <div className="detail-card score-card">
            <h3>🛡️ WealthGuard Health Score</h3>
            <div className="score-dial">
                <div className={`score-circle ${company.healthScore > 80 ? 'high' : 'med'}`}>
                    {company.healthScore}
                </div>
                <div className="score-text">
                    <h4>{company.healthScore > 80 ? 'Strong Buy 💪' : 'Stable 🙂'}</h4>
                    <p>Based on profitability, debt, & growth.</p>
                </div>
            </div>
        </div>
        
        <div className="detail-card analysis-card">
            <div className="analysis-col">
                <h4 className="good-text">✅ Strengths</h4>
                <ul>
                    {company.strengths?.map((s,i) => <li key={i}>{s}</li>)}
                    <li>High ROE of {company.ratios.roe}%</li>
                </ul>
            </div>
            <div className="analysis-col">
                <h4 className="bad-text">⚠️ Red Flags</h4>
                <ul>
                    {company.weaknesses?.map((w,i) => <li key={i}>{w}</li>)}
                </ul>
            </div>
        </div>
      </div>

      {/* 3. RATIOS MATRIX */}
      <h3 className="section-title">📊 Key Financial Ratios</h3>
      <div className="ratios-matrix">
        <div className="ratio-box">
            <label>P/E Ratio</label>
            <strong>{company.ratios.pe}</strong>
            <small>Valuation</small>
        </div>
        <div className="ratio-box">
            <label>Net Margin</label>
            <strong>{company.ratios.netProfitMargin || '15%'}</strong>
            <small>Profitability</small>
        </div>
        <div className="ratio-box">
            <label>ROE</label>
            <strong className="good-text">{company.ratios.roe}%</strong>
            <small>Return on Equity</small>
        </div>
        <div className="ratio-box">
            <label>Dividend Yield</label>
            <strong>{company.ratios.dividendYield}</strong>
            <small>Returns</small>
        </div>
        <div className="ratio-box">
            <label>Current Ratio</label>
            <strong>{company.ratios.currentRatio || '1.5'}</strong>
            <small>Liquidity</small>
        </div>
        <div className="ratio-box">
            <label>Debt/Equity</label>
            <strong className={company.ratios.debtToEquity > 1 ? 'bad-text' : 'good-text'}>
                {company.ratios.debtToEquity}
            </strong>
            <small>Leverage</small>
        </div>
      </div>

      {/* 4. FINANCIAL TRENDS (Revenue & Profit) */}
      <div className="grid-section charts-grid">
        <div className="detail-card">
            <h3>📈 Revenue vs Profit (5 Years)</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={company.history.years.map((y, i) => ({
                        year: y,
                        Revenue: company.history.revenue[i],
                        Profit: company.history.profit[i]
                    }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="year" stroke="#888" />
                        <YAxis stroke="#888" tickFormatter={(val) => `₹${val/1000}k`} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', color: '#fff' }} 
                            itemStyle={{ color: '#fff' }}
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        />
                        <Legend wrapperStyle={{paddingTop: '10px'}}/>
                        <Bar dataKey="Revenue" fill="#00C49F" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Profit" fill="#FFBB28" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 5. CASH FLOW ANALYSIS */}
        <div className="detail-card">
            <h3>💸 Cash Flow Trends</h3>
            <div className="chart-container">
                {cashFlowData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={cashFlowData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="year" stroke="#888" />
                            <YAxis stroke="#888" tickFormatter={(val) => `₹${val/1000}k`} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', color: '#fff' }} 
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend wrapperStyle={{paddingTop: '10px'}}/>
                            <Line type="monotone" dataKey="Operating" stroke="#00C49F" strokeWidth={2} dot={{r: 4}} />
                            <Line type="monotone" dataKey="Investing" stroke="#FF4d4d" strokeWidth={2} dot={{r: 4}} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="no-data">Cash flow data unavailable</div>
                )}
            </div>
        </div>
      </div>

      {/* 6. BALANCE SHEET & SHAREHOLDING */}
      <div className="grid-section split-grid">
        <div className="detail-card">
            <h3>⚖️ Balance Sheet Summary</h3>
            <div className="bs-summary">
                <div className="bs-row">
                    <span>Total Assets</span>
                    <strong>{company.balanceSheet?.totalAssets || "₹1.5T"}</strong>
                </div>
                <div className="bs-row">
                    <span>Total Liabilities</span>
                    <strong>{company.balanceSheet?.totalLiabilities || "₹0.4T"}</strong>
                </div>
                <div className="bs-row">
                    <span>Total Equity</span>
                    <strong>{company.balanceSheet?.equity || "₹1.1T"}</strong>
                </div>
                <div className="bs-row highlight">
                    <span>Cash Reserves</span>
                    <strong>{company.balanceSheet?.cash || "₹15,000 Cr"}</strong>
                </div>
            </div>
            <div className="bs-visual">
                <div className="bs-bar-segment assets" style={{flex: assetFlex}}>Assets</div>
                <div className="bs-bar-segment liabilities" style={{flex: liabFlex}}>Liability</div>
            </div>
        </div>

        <div className="detail-card">
            <h3>👥 Shareholding Pattern</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie 
                            data={[
                                { name: 'Promoters', value: company.shareholding?.promoters || 50 }, 
                                { name: 'FII', value: company.shareholding?.fii || 20 },
                                { name: 'DII', value: company.shareholding?.dii || 15 },
                                { name: 'Public', value: company.shareholding?.public || 15 }
                            ]}
                            cx="50%" cy="50%" innerRadius={55} outerRadius={75}
                            dataKey="value" paddingAngle={5}
                        >
                            <Cell fill="#00C49F" />
                            <Cell fill="#0088FE" />
                            <Cell fill="#FFBB28" />
                            <Cell fill="#FF8042" />
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }} 
                            formatter={(value) => `${value}%`}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="legend-row">
                <span style={{color: '#00C49F'}}>● Promoters</span>
                <span style={{color: '#0088FE'}}>● FII</span>
                <span style={{color: '#FFBB28'}}>● DII</span>
                <span style={{color: '#FF8042'}}>● Public</span>
            </div>
        </div>
      </div>
      
    </div>
  );
};

export default CompanyDetailsPage;
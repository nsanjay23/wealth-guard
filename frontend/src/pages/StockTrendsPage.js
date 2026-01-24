import React, { useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './StockTrendsPage.css';

// --- CONFIGURATION ---
const COLOR_PALETTE = [
  '#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#8884d8', '#FF4d4d',
];

const COMPANY_NAMES = {
    'BPCL': 'Bharat Petroleum',
    'HDBK': 'HDFC Bank',
    'ICBK': 'ICICI Bank',
    'INFY': 'Infosys',
    'ITC': 'ITC Limited',
    'MRF': 'MRF Tyres',
    'RELI': 'Reliance Industries',
    'SBI': 'State Bank of India',
    'TCS': 'Tata Consultancy Services',
    'VDAN': 'Vedanta'
};

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

const StockTrendsPage = () => {
  // --- STATE ---
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [selectedCompany, setSelectedCompany] = useState('BPCL');
  const [stockMap, setStockMap] = useState({}); 
  const [investment, setInvestment] = useState(10000); 
  const [showInflation, setShowInflation] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Tip State
  const [currentTip, setCurrentTip] = useState(TAX_TIPS[0]);

  // --- HELPER: Random Tip Generator ---
  const pickRandomTip = () => {
      const randomIndex = Math.floor(Math.random() * TAX_TIPS.length);
      setCurrentTip(TAX_TIPS[randomIndex]);
  };

  // --- API HELPER ---
  const fetchStockData = async (company, start, end) => {
    const formatDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}-${month}-${year}`;
    };

    const payload = {
        company: company,
        startDate: formatDate(start),
        endDate: formatDate(end)
    };

    const response = await axios.post('http://localhost:5001/api/predict', payload, {
        withCredentials: true
    });
    
    return response.data.data;
  };

  // --- HANDLERS ---
  const handleDateChange = (e) => {
    setDates({ ...dates, [e.target.name]: e.target.value });
    if (error.includes("Date")) setError('');
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    
    if (!dates.startDate || !dates.endDate) {
      setError("Please select a date range first.");
      return;
    }
    const start = new Date(dates.startDate);
    const end = new Date(dates.endDate);
    if (start > end) {
        setError("Invalid Date Range: Start Date cannot be after End Date.");
        return;
    }
    if (Object.keys(stockMap).length >= 3) {
        setError("Maximum 3 companies allowed for comparison.");
        return;
    }
    if (stockMap[selectedCompany]) {
      setError(`${COMPANY_NAMES[selectedCompany]} is already on the graph.`);
      return;
    }

    // --- LOADING START ---
    setLoading(true);
    setError('');
    pickRandomTip(); 

    // CHANGE: 2.5 Seconds (2500ms)
    const minTimer = new Promise(resolve => setTimeout(resolve, 5000));

    const fetchDataPromise = async () => {
        const rawData = await fetchStockData(selectedCompany, dates.startDate, dates.endDate);
        return rawData;
    };

    try {
        const [_, rawData] = await Promise.all([minTimer, fetchDataPromise()]);
        
        const usedColors = new Set(Object.values(stockMap).map(s => s.color));
        let assignedColor = COLOR_PALETTE.find(c => !usedColors.has(c));
        if (!assignedColor) {
            const colorIndex = Object.keys(stockMap).length % COLOR_PALETTE.length;
            assignedColor = COLOR_PALETTE[colorIndex];
        }

        setStockMap(prev => ({
            ...prev,
            [selectedCompany]: {
                color: assignedColor,
                data: rawData
            }
        }));

    } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch data.');
    } finally {
        setLoading(false);
    }
  };

  const handleUpdateGraph = async () => {
    if (!dates.startDate || !dates.endDate) return;

    const start = new Date(dates.startDate);
    const end = new Date(dates.endDate);
    if (start > end) {
        setError("Invalid Date Range: Start Date cannot be after End Date.");
        return;
    }

    const activeCompanies = Object.keys(stockMap);
    if (activeCompanies.length === 0) return;

    setLoading(true);
    setError('');
    pickRandomTip();

    // CHANGE: 2.5 Seconds (2500ms)
    const minTimer = new Promise(resolve => setTimeout(resolve, 2500));

    const updatePromise = Promise.all(activeCompanies.map(async (comp) => {
        const data = await fetchStockData(comp, dates.startDate, dates.endDate);
        return { company: comp, data };
    }));

    try {
        const [_, results] = await Promise.all([minTimer, updatePromise]);

        setStockMap(prev => {
            const newMap = { ...prev };
            results.forEach(res => {
                if (newMap[res.company]) {
                    newMap[res.company].data = res.data;
                }
            });
            return newMap;
        });

    } catch (err) {
        console.error(err);
        setError("Failed to update graph. Check connections.");
    } finally {
        setLoading(false);
    }
  };

  const removeCompany = (companyName) => {
    const newMap = { ...stockMap };
    delete newMap[companyName];
    setStockMap(newMap);
    setError('');
  };

  const calculateROI = (companyName) => {
    const data = stockMap[companyName]?.data;
    if (!data || data.length < 2) return null;

    const startPrice = parseFloat(data[0].Price);
    const endPrice = parseFloat(data[data.length - 1].Price);

    if (startPrice === 0) return null;

    const invAmount = parseFloat(investment) || 0;

    const units = invAmount / startPrice;
    let finalValue = units * endPrice;
    
    if (showInflation) {
        const startDate = new Date(dates.startDate);
        const endDate = new Date(dates.endDate);
        const diffTime = Math.abs(endDate - startDate);
        const years = diffTime > 0 ? diffTime / (1000 * 60 * 60 * 24 * 365.25) : 0; 
        finalValue = finalValue / Math.pow(1.06, years);
    }

    const profit = finalValue - invAmount;
    const percentChange = invAmount > 0 ? ((finalValue - invAmount) / invAmount) * 100 : 0;

    return { finalValue, profit, percentChange };
  };

  const processChartData = () => {
    const mergedData = {};
    const allDates = new Set();

    Object.keys(stockMap).forEach(comp => {
        const sortedCompanyData = [...stockMap[comp].data].sort((a, b) => {
             const [d1, m1, y1] = a.Date.split('-');
             const [d2, m2, y2] = b.Date.split('-');
             return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`);
        });

        sortedCompanyData.forEach((item, index) => {
            const date = item.Date;
            allDates.add(date);
            if (!mergedData[date]) mergedData[date] = { Date: date };

            const price = parseFloat(item.Price);

            if (item.Type === 'Actual') {
                mergedData[date][`${comp}_Hist`] = price;
            } else {
                mergedData[date][`${comp}_Pred`] = price;
                if (index > 0 && sortedCompanyData[index - 1].Type === 'Actual') {
                    const prevDate = sortedCompanyData[index - 1].Date;
                    const prevPrice = parseFloat(sortedCompanyData[index - 1].Price);
                    if (mergedData[prevDate]) {
                        mergedData[prevDate][`${comp}_Pred`] = prevPrice;
                    }
                }
            }
        });
    });

    const sortedData = Array.from(allDates)
        .sort((a, b) => {
            const [d1, m1, y1] = a.split('-');
            const [d2, m2, y2] = b.split('-');
            return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`);
        })
        .map(date => mergedData[date]);

    if (sortedData.length > 500) {
        return sortedData.filter((_, index) => index % 2 === 0);
    }
    return sortedData;
  };

  const chartData = processChartData();

  const getChartTitle = () => {
      const activeSyms = Object.keys(stockMap);
      if (activeSyms.length === 0) return "Comparative Analysis";
      if (activeSyms.length === 1) return `Analysis of ${activeSyms[0]}`;
      return `Comparative Analysis: ${activeSyms.join(' vs ')}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const uniqueItems = new Map();
        
        payload.forEach(item => {
            const baseName = item.name.replace(' (Forecast)', '');
            if (!uniqueItems.has(baseName)) {
                uniqueItems.set(baseName, {
                    color: item.color,
                    value: item.value,
                    name: baseName
                });
            }
        });

        return (
            <div className="custom-tooltip" style={{ backgroundColor: '#1f1f1f', border: '1px solid #444', padding: '10px' }}>
                <p style={{ color: '#fff', marginBottom: '5px', fontWeight: 'bold' }}>{label}</p>
                {Array.from(uniqueItems.values()).map((item) => (
                    <p key={item.name} style={{ color: item.color, margin: '3px 0', fontSize: '0.9rem' }}>
                        {item.name} : {item.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
  };

  return (
    <div className="trends-page-content">
      {/* 1. Header Matches "Reliance Industries" Card Style */}
      <header className="trends-header">
        <h1>Market Comparison Tool</h1>
        <p>Compare historical performance and AI forecasts for multiple companies.</p>
      </header>

      <div className="trends-layout">
        
        {/* --- LEFT PANEL --- */}
        <div className="controls-panel">
          <div className="control-section">
            <h3>1. Set Date Range</h3>
            <div className="form-group">
              <label>Start Date</label>
              <input 
                  type="date" name="startDate" 
                  value={dates.startDate} onChange={handleDateChange} 
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input 
                  type="date" name="endDate" 
                  value={dates.endDate} onChange={handleDateChange} 
              />
            </div>
            {Object.keys(stockMap).length > 0 && (
                <button 
                    className="update-graph-btn" 
                    onClick={handleUpdateGraph} disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Update Graph'}
                </button>
            )}
          </div>

          <hr className="divider" />

          <div className="control-section">
            <h3>2. Add Companies</h3>
            <form onSubmit={handleAddCompany}>
                <div className="form-group">
                    <select 
                        value={selectedCompany} 
                        onChange={(e) => setSelectedCompany(e.target.value)}
                    >
                        {Object.keys(COMPANY_NAMES).map(sym => (
                            <option key={sym} value={sym}>{COMPANY_NAMES[sym]}</option>
                        ))}
                    </select>
                </div>
                <button 
                    type="submit" className="analyze-btn" 
                    disabled={loading || Object.keys(stockMap).length >= 3}
                    style={{ opacity: Object.keys(stockMap).length >= 3 ? 0.5 : 1 }}
                >
                    {loading ? 'Loading...' : 
                     Object.keys(stockMap).length >= 3 ? 'Max Limit Reached' : '+ Add to Graph'}
                </button>
            </form>
            <p className="limit-text">Max 3 companies allowed.</p>
          </div>

          {Object.keys(stockMap).length > 0 && (
              <div className="active-list">
                  <h4>Active Stocks:</h4>
                  {Object.keys(stockMap).map(comp => (
                      <div key={comp} className="stock-tag" style={{borderColor: stockMap[comp].color}}>
                          <span style={{color: stockMap[comp].color}}>●</span> 
                          {COMPANY_NAMES[comp]}
                          <button onClick={() => removeCompany(comp)}>×</button>
                      </div>
                  ))}
              </div>
          )}

          {error && <div className="error-card">{error}</div>}
        </div>

        {/* --- RIGHT PANEL --- */}
        <div className="chart-panel">
            {loading ? (
                <div className="loading-tip-container">
                    <div className="spinner"></div>
                    <div className="tip-content">
                        <h4>Did You Know?</h4>
                        <h3>{currentTip.title}</h3>
                        <p>{currentTip.desc}</p>
                    </div>
                </div>
            ) : chartData.length > 0 ? (
                <>
                <div className="chart-header">
                    <h3>{getChartTitle()}</h3>
                    <div className="legend-custom">
                        <span className="legend-solid">― Actual</span>
                        <span className="legend-dashed">- - Predicted</span>
                    </div>
                </div>
                
                <div className="chart-container-responsive">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="Date" stroke="#888" tick={{fontSize: 12}} />
                            <YAxis stroke="#888" domain={['auto', 'auto']} tick={{fontSize: 12}} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {Object.keys(stockMap).map(comp => {
                                const color = stockMap[comp].color;
                                return (
                                    <React.Fragment key={comp}>
                                        <Line 
                                            type="monotone" dataKey={`${comp}_Hist`} name={comp} 
                                            stroke={color} strokeWidth={2} dot={false} connectNulls={true} 
                                        />
                                        <Line 
                                            type="monotone" dataKey={`${comp}_Pred`} name={`${comp} (Forecast)`} 
                                            stroke={color} strokeWidth={2} strokeDasharray="5 5" 
                                            dot={false} legendType="none" 
                                        />
                                    </React.Fragment>
                                );
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                </>
            ) : (
                <div className="empty-state">
                    <p>Set a date range and add companies to compare performance.</p>
                </div>
            )}
        </div>

        {/* --- BOTTOM ROW: ROI CALCULATOR --- */}
        {!loading && chartData.length > 0 && (
        <div className="roi-widget-card">
            <div className="roi-header">
                <h3>ROI Calculator</h3>
                
                {/* REPLACED: Styled Button Toggle */}
                <button 
                    className={`inflation-btn ${showInflation ? 'active' : ''}`}
                    onClick={() => setShowInflation(!showInflation)}
                >
                    {showInflation ? 'Inflation Adjusted (6%)' : 'Adjust for Inflation'}
                </button>
            </div>

            <div className="roi-input-row">
                <span>If I invest ₹</span>
                <input 
                    type="number" 
                    min="0"
                    value={investment} 
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || (parseFloat(val) >= 0 && !val.includes('-'))) {
                            setInvestment(val);
                        }
                    }}
                />
                <span>at the start date...</span>
            </div>
            
            <div className="roi-cards-container">
                {Object.keys(stockMap).map(comp => {
                    const roi = calculateROI(comp);
                    if (!roi) return null;
                    const isProfit = roi.profit >= 0;
                    
                    return (
                        <div key={comp} className="roi-card" style={{borderTopColor: stockMap[comp].color}}>
                            <h4>{COMPANY_NAMES[comp]}</h4>
                            
                            <div className={`roi-percent ${isProfit ? 'pos' : 'neg'}`}>
                                {isProfit ? '▲' : '▼'} {roi.percentChange.toFixed(2)}%
                            </div>
                            
                            <div className="roi-details">
                                {/* CHANGED: Logic for Profit vs Loss label */}
                                <p>
                                    {isProfit ? 'Profit:' : 'Loss:'}
                                    <span className={isProfit ? 'pos' : 'neg'}>
                                        {/* Remove negative sign if using "Loss" label, display absolute value */}
                                        ₹{Math.abs(roi.profit).toFixed(0)}
                                    </span>
                                </p>
                                {/* CHANGED: Just "Final" */}
                                <p>Final: ₹{roi.finalValue.toFixed(0)}</p>
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

export default StockTrendsPage;
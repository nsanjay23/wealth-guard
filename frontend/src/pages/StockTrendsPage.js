import React, { useState, memo } from 'react'; // Import memo
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'; // Import Recharts components
import './StockTrendsPage.css'; // Import styles for this page

// Helper function to generate distinct colors for chart lines
const lineColors = ['#007bff', '#20c997', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'];
const getColor = (index) => lineColors[index % lineColors.length];

// Wrap the entire component function definition with memo()
const StockTrendsPage = memo(() => {
  console.log("--- Rendering StockTrendsPage ---"); // Debug log

  const [symbols, setSymbols] = useState(''); // State for stock symbols input
  const [startDate, setStartDate] = useState(''); // State for start date
  const [endDate, setEndDate] = useState(''); // State for end date
  const [chartData, setChartData] = useState([]); // State for formatted chart data
  const [fetchedSymbols, setFetchedSymbols] = useState([]); // State to track symbols in the chart data
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(''); // State for error messages

  console.log("Current State - isLoading:", isLoading, "error:", error, "chartData length:", chartData.length); // Debug log for state

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setError(''); // Clear previous errors
    setIsLoading(true); // Show loading state
    setChartData([]); // Clear previous chart data
    setFetchedSymbols([]); // Clear previous symbol list

    // Basic validation
    if (!symbols || !startDate || !endDate) {
      setError('Please enter stock symbols and select a date range.');
      setIsLoading(false);
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
        setError('Start date must be before end date.');
        setIsLoading(false);
        return;
    }

    try {
      // Prepare data for backend request
      const encodedSymbols = encodeURIComponent(symbols.toUpperCase());
      // Construct URL to backend endpoint (using Alpha Vantage backend)
      const url = `http://localhost:5001/api/features/stock-trends?symbols=${encodedSymbols}&startDate=${startDate}&endDate=${endDate}`;

      // Fetch data from backend
      const response = await fetch(url, { credentials: 'include' }); // Include credentials for session cookie
      const data = await response.json(); // Parse JSON response

      if (!response.ok) {
        // Handle errors from backend (4xx, 5xx status codes)
        throw new Error(data.message || `HTTP error! Status: ${response.status}`);
      }

      // Check if data is valid and non-empty
      if (!Array.isArray(data) || data.length === 0) {
        setError('No data found for the selected symbols and date range.');
        setChartData([]); // Ensure chart is cleared
      } else {
        setChartData(data); // Update chart data state
        // Extract symbol keys from the first data point (excluding 'date')
        const symbolsInData = Object.keys(data[0] || {}).filter(key => key !== 'date');
        setFetchedSymbols(symbolsInData); // Update symbols to be displayed in the chart
      }

    } catch (err) {
      // Handle fetch errors or errors thrown from response check
      console.error("Fetch Stock Trends Error:", err);
      setError(err.message || 'Failed to fetch stock data.');
      setChartData([]); // Ensure chart is cleared on error
      setFetchedSymbols([]);
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  // Formats date ticks on the X-axis for better readability
  const formatDateTick = (tickItem) => {
      // Attempt to parse the date
      const date = new Date(tickItem);
      // Determine format based on date range duration (optional enhancement)
      const options = { year: '2-digit', month: 'short', day: 'numeric' };
      // Check if date is valid before formatting
      return !isNaN(date) ? date.toLocaleDateString('en-US', options) : tickItem;
  };

  return (
    <div className="stock-trends-page">
      <h2>Stock Trends Analysis (Alpha Vantage)</h2>
      <form onSubmit={handleSubmit} className="trends-form">
        <div className="form-row">
          {/* Symbol Input */}
          <div className="form-group">
            <label htmlFor="symbols">Stock Symbols (Comma-separated)</label>
            <input
              type="text"
              id="symbols"
              value={symbols}
              onChange={(e) => setSymbols(e.target.value)}
              placeholder="e.g., IBM, RELIANCE.BSE, INFY.NS"
              required
            />
             <small className="symbol-format-hint">Use exchange suffix (e.g., .BSE, .NS for India)</small>
          </div>
        </div>
        {/* Date Inputs */}
        <div className="form-row date-range">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          {/* Submit Button */}
          <button type="submit" className="trends-button" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Visualize Trends'}
          </button>
        </div>
      </form>

      {/* Display Error Message if any */}
      {error && <p className="error-message">{error}</p>}

      {/* Chart Area */}
      <div className="chart-container">
        {/* Loading Indicator */}
        {isLoading && <div className="loading-spinner">Fetching data... (May take time due to API limits)</div>}
        {/* Chart (only rendered if not loading and data exists) */}
        {!isLoading && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-card)" />
              <XAxis
                  dataKey="date"
                  tickFormatter={formatDateTick}
                  stroke="var(--color-text-dashboard-secondary)"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                  minTickGap={30}
              />
              <YAxis
                  stroke="var(--color-text-dashboard-secondary)"
                  tick={{ fontSize: 12 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                  width={80}
              />
              <Tooltip
                  contentStyle={{
                      backgroundColor: 'var(--color-bg-sidebar)',
                      borderColor: 'var(--color-border-card)',
                      color: 'var(--color-text-dashboard-primary)'
                  }}
                  formatter={(value, name) => [`₹${value.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, name]}
                  labelFormatter={formatDateTick}
              />
              <Legend />
              {fetchedSymbols.map((symbol, index) => (
                <Line
                  key={symbol}
                  type="monotone"
                  dataKey={symbol}
                  stroke={getColor(index)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  connectNulls={true}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
        {/* Message shown when no data/error and not loading */}
         {!isLoading && chartData.length === 0 && !error && (
            <p className="no-data-message">Enter symbols and select a date range to visualize trends.</p>
         )}
      </div>
    </div>
  );
}); // <-- Closing parenthesis for memo()

export default StockTrendsPage;
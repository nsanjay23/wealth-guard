import React, { useEffect } from 'react';
import './App.css';
import './Theme.css';
import Navbar from './components/Navbar'; // Adjust path if needed
import Hero from './components/Hero';     // Adjust path if needed
import Features from './components/Features';

// Import the 'Fi' icons for Insurance
import {
  FiShield, FiUserCheck, FiCalendar, FiMessageSquare, FiFileText, FiPercent
} from 'react-icons/fi';

// Import the 'Tb' icons for Stock Analysis
import {
  TbChartLine, TbChartCandle, TbChartBar, TbFileSearch, TbClockDollar, TbLayoutGrid
} from 'react-icons/tb';

// Define your feature data with the correct icons
const featuresData = [
  {
    title: "Insurance Management",
    id: "insurance-management",
    gradientColors: ["#79F7D0", "#92A8F3"],
    items: [
      { id: "insurance-discovery", title: "Insurance Discovery & Comparison", description: "Browse and compare available insurance policies", icon: <FiShield /> },
      { id: "insurance-recommendations", title: "Personalized Policy Recommendations", description: "AI-based suggestions using user profile (age, income, goals)", icon: <FiUserCheck /> },
      { id: "insurance-reminders", title: "Premium & Renewal Management", description: "Reminders for upcoming due dates and payment tracking", icon: <FiCalendar /> },
      { id: "insurance-advisor", title: "AI Insurance Advisor", description: "Beginner-friendly chatbot that can answer queries in text or voice", icon: <FiMessageSquare /> },
      { id: "insurance-tax", title: "Tax-Saving Insights", description: "Show how chosen policies contribute to tax deductions", icon: <FiPercent /> },
      { id: "insurance-summarizer", title: "Policy Summarizer", description: "AI summarizer can turn a long policy PDF into easy-to-read bullet points", icon: <FiFileText /> },
    ]
  },
  {
    title: "Stock Analysis",
    id: "stock-analysis",
    gradientColors: ["#88F3B4", "#4CAF50"],
    items: [
      { id: "stock-backtesting", title: "Portfolio Backtesting", description: "Simulate how a user’s chosen stock portfolio would have performed historically", icon: <TbChartLine /> },
      { id: "stock-charts", title: "Historical Price Charts", description: "Interactive stock trend visualizations", icon: <TbChartCandle /> },
      { id: "stock-benchmarks", title: "Performance Benchmarks", description: "Compare portfolio against indexes (e.g., NIFTY, S&P 500)", icon: <TbChartBar /> },
      { id: "stock-fundamentals", title: "Company Fundamentals", description: "Financial ratios, revenue, dividend history", icon: <TbFileSearch /> },
      { id: "stock-tax", title: "Tax-Saving Opportunities", description: "Capital gains/losses breakdown with tax-saving strategies", icon: <TbClockDollar /> },
      { id: "stock-risk", title: "Portfolio Risk Heatmap", description: "AI can assign risk levels to different stocks and visualize them in a heatmap", icon: <TbLayoutGrid /> },
    ]
  }
];

function App() {
  useEffect(() => {
    document.body.className = 'dark';
  }, []);

  return (
    <div className="App">
      <Navbar />
      <Hero />
      <Features sections={featuresData} />
    </div>
  );
}

export default App;
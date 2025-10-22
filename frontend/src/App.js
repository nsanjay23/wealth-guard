import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import './Theme.css';

// Adjust these import paths based on your actual folder structure
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import SignUpPage from './pages/SignUpPage'; // Your sign-up page component
import LoginPage from './pages/LoginPage'; // Assuming you have this for login link

// --- Import Icons (Ensure you have run 'npm install react-icons') ---
import {
  FiShield, FiUserCheck, FiCalendar, FiMessageSquare, FiFileText, FiPercent, FiAlertTriangle // Added FiAlertTriangle
} from 'react-icons/fi';
import {
  TbChartLine, TbChartCandle, TbChartBar, TbFileSearch, TbClockDollar, TbLayoutGrid
} from 'react-icons/tb';


// --- Feature Data (Updated based on last confirmed list) ---
const featuresData = [
  {
    title: "Stock Analysis",
    id: "stock-analysis",
    gradientColors: ["#20c997", "#59e0b8"], // Green gradient
    items: [
      { id: "stock-charts", title: "Historical Price Charts", description: "Interactive stock trend visualizations.", icon: <TbChartCandle /> },
      { id: "stock-fundamentals", title: "Company Fundamentals (Past Data)", description: "Financial ratios, revenue, dividend history.", icon: <TbFileSearch /> },
      { id: "stock-benchmarks", title: "Performance Benchmarks", description: "Compare portfolio against indexes (e.g., NIFTY, S&P 500).", icon: <TbChartBar /> },
      { id: "stock-risk", title: "Portfolio Risk Heatmap", description: "AI can assign risk levels to different stocks and visualize them in a heatmap.", icon: <TbLayoutGrid /> },
      { id: "stock-backtesting", title: "Portfolio Backtesting", description: "Simulate how a user’s chosen stock portfolio would have performed historically.", icon: <TbChartLine /> },
      { id: "stock-tax", title: "Tax-Saving Opportunities", description: "Capital gains/losses breakdown with tax-saving strategies.", icon: <TbClockDollar /> },
    ]
  },
  {
    title: "Insurance Management",
    id: "insurance-management",
    gradientColors: ["#007bff", "#4dabf7"], // Blue gradient
    items: [
      { id: "insurance-discovery", title: "Insurance Discovery & Comparison", description: "Browse and compare available insurance policies.", icon: <FiShield /> },
      { id: "insurance-recommendations", title: "Personalized Policy Recommendations", description: "AI-based suggestions using user profile.", icon: <FiUserCheck /> },
      { id: "insurance-advisor", title: "AI Insurance Advisor", description: "Beginner-friendly chatbot that can answer queries in text or voice.", icon: <FiMessageSquare /> },
      { id: "insurance-fraud", title: "Fraud Policy Detection", description: "Detects fraudulent insurance policies by flagging anomalies.", icon: <FiAlertTriangle /> }, // Added Fraud Detection
      { id: "insurance-summarizer", title: "Policy Summarizer", description: "AI summarizer can turn a long policy PDF into easy-to-read bullet points.", icon: <FiFileText /> },
      { id: "insurance-reminders", title: "Premium & Renewal Management", description: "Reminders for upcoming due dates and payment tracking.", icon: <FiCalendar /> },
    ]
  }
];


// --- Layout Component for pages WITH Navbar ---
// (Used for Landing Page)
const MainLayout = ({ children }) => {
  useEffect(() => {
    // Ensure body class is set correctly based on where theme is managed
    document.body.className = 'dark'; // Assuming dark theme for landing page
  }, []);
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

// --- Layout Component for pages WITHOUT Navbar ---
// (Used for Auth Pages like Signup/Login)
const AuthLayout = ({ children }) => {
  useEffect(() => {
    document.body.className = 'dark'; // Ensure dark theme for auth pages
  }, []);
  // This wrapper provides the full-screen background and centers content
  return <div className="auth-page-wrapper">{children}</div>;
};

// --- Landing Page Component ---
// Renders the Hero and Features sections
const LandingPage = () => (
  <>
    <Hero />
    <Features sections={featuresData} />
  </>
);


// --- Main App Component ---
function App() {
  return (
    // The .App class can hold global styles like font
    <div className="App">
      <Routes>
        {/* Route for the landing page */}
        <Route
          path="/"
          element={
            <MainLayout>
              <LandingPage />
            </MainLayout>
          }
        />

        {/* Route for the sign-up page */}
        <Route
          path="/signup"
          element={
            <AuthLayout>
              <SignUpPage />
            </AuthLayout>
          }
        />

        {/* Route for the login page (using AuthLayout) */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
        {/* Add other simple routes like /privacy, /terms if needed */}

      </Routes>
    </div>
  );
}

export default App;
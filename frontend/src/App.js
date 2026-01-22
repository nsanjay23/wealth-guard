import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './Theme.css';

// --- COMPONENTS ---
import Navbar from './components/Navbar';
import DashboardNavbar from './components/DashboardNavbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Sidebar from './components/Sidebar';

// --- PAGES ---
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StockTrendsPage from './pages/StockTrendsPage'; // <--- 1. IMPORT ADDED HERE
import FundamentalsDashboard from './pages/FundamentalsDashboard';
import CompanyDetailsPage from './pages/CompanyDetailsPage';
import PortfolioPage from './pages/PorfolioPage'; // <--- ADD THIS IMPORT
import BacktestPage from './pages/BacktestPage'; // Adjust path as needed
import RiskHeatmapPage from './pages/RiskHeatmapPage';
import InsuranceDiscoveryPage from './pages/InsuranceDiscoverPage';
import ProfilePage from './pages/UserProfilePage';
import PolicyDetailsPage from './pages/PolicyDetails';
import ComparePage from './pages/ComparePage';
import PolicyUploadPage from './pages/PolicyUploadPage';


// --- HOOKS & DATA ---
import useAuthStatus from './hooks/useAuthStatus';

// --- ICONS ---
import {
  FiShield, FiUserCheck, FiCalendar, FiMessageSquare, FiFileText, FiAlertTriangle
} from 'react-icons/fi';
import {
  TbChartLine, TbChartCandle, TbChartBar, TbFileSearch, TbClockDollar, TbLayoutGrid
} from 'react-icons/tb';

// --- FEATURE DATA ---
const featuresData = [
  {
    title: "Stock Analysis",
    id: "stock-analysis",
    gradientColors: ["#20c997", "#59e0b8"],
    items: [
      { id: "stock-charts", title: "Historical Price Charts", description: "Interactive stock trend visualizations.", icon: <TbChartCandle /> },
      { id: "stock-fundamentals", title: "Company Fundamentals", description: "Financial ratios, revenue, dividend history.", icon: <TbFileSearch /> },
      { id: "stock-benchmarks", title: "Performance Benchmarks", description: "Compare portfolio against indexes.", icon: <TbChartBar /> },
      { id: "stock-risk", title: "Portfolio Risk Heatmap", description: "AI risk visualization.", icon: <TbLayoutGrid /> },
      { id: "stock-backtesting", title: "Portfolio Backtesting", description: "Simulate historical performance.", icon: <TbChartLine /> },
      { id: "stock-tax", title: "Tax-Saving Opportunities", description: "Capital gains strategies.", icon: <TbClockDollar /> },
    ]
  },
  {
    title: "Insurance Management",
    id: "insurance-management",
    gradientColors: ["#007bff", "#4dabf7"],
    items: [
      { id: "insurance-discovery", title: "Insurance Discovery", description: "Compare available policies.", icon: <FiShield /> },
      { id: "insurance-recommendations", title: "Personalized Recommendations", description: "AI-based suggestions.", icon: <FiUserCheck /> },
      { id: "insurance-advisor", title: "AI Insurance Advisor", description: "Chatbot for insurance queries.", icon: <FiMessageSquare /> },
      { id: "insurance-fraud", title: "Fraud Detection", description: "Detects fraudulent policies.", icon: <FiAlertTriangle /> },
      { id: "insurance-summarizer", title: "Policy Summarizer", description: "AI summary of PDF policies.", icon: <FiFileText /> },
      { id: "insurance-reminders", title: "Premium Management", description: "Reminders for due dates.", icon: <FiCalendar /> },
    ]
  }
];

// --- LAYOUTS ---

const AuthLayout = ({ children }) => {
  useEffect(() => { document.body.className = 'dark'; }, []);
  return <div className="auth-page-wrapper">{children}</div>;
};

const LandingPageLayout = ({ children }) => {
  useEffect(() => { document.body.className = 'dark'; }, []);
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

const DashboardLayout = ({ children }) => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = savedTheme;
  }, []);
  
  return (
    <div className="dashboard-root">
      <DashboardNavbar />
      <div className="dashboard-body">
        <Sidebar />
        <div className="dashboard-content-area">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- CONTENT COMPONENTS ---
const LandingPageContent = () => (
  <>
    <Hero />
    <Features sections={featuresData} />
  </>
);

// --- ROUTE GUARDS ---

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStatus();
  if (isLoading) return <div className="loading-state">Authenticating...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStatus();
  if (isLoading) return <div className="loading-state">Checking session...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

// --- MAIN APP ---

function App() {
  return (
    <div className="App">
      <Routes>
        {/* LANDING PAGE */}
        <Route path="/" element={
          <PublicRoute>
            <LandingPageLayout>
              <LandingPageContent />
            </LandingPageLayout>
          </PublicRoute>
        } />

        {/* AUTH PAGES */}
        <Route path="/signup" element={
          <AuthLayout>
            <SignUpPage />
          </AuthLayout>
        } />
        <Route path="/login" element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        } />

        {/* DASHBOARD PAGE */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* STOCK TRENDS PAGE - 2. ROUTE ADDED HERE */}
        <Route path="/trends" element={
          <ProtectedRoute>
            <DashboardLayout>
               <StockTrendsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* FUNDAMENTALS DASHBOARD PAGE */}
        <Route path="/fundamentals" element={
          <ProtectedRoute>
            <DashboardLayout>
               <FundamentalsDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* COMPANY DETAILS PAGE */}
        <Route path="/fundamentals/:symbol" element={
          <ProtectedRoute>
            <DashboardLayout>
               <CompanyDetailsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* --- NEW PORTFOLIO ROUTE START --- */}
        <Route path="/portfolio" element={
          <ProtectedRoute>
            <DashboardLayout>
               <PortfolioPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        {/* --- NEW PORTFOLIO ROUTE END --- */}
        
        <Route path="/backtest" element={
          <ProtectedRoute>
            <DashboardLayout>
               <BacktestPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/risk-heatmap" element={
          <ProtectedRoute>
            <DashboardLayout>
               <RiskHeatmapPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/insurance" element={
          <ProtectedRoute>
            <DashboardLayout>
               <InsuranceDiscoveryPage/>
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <DashboardLayout>
               <ProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/policy-details" element={
          <ProtectedRoute>
            <DashboardLayout>
               <PolicyDetailsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/compare" element={
          <ProtectedRoute>
            <DashboardLayout>
               <ComparePage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/pdf" element={
          <ProtectedRoute>
            <DashboardLayout>
               <PolicyUploadPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
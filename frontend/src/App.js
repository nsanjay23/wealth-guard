import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './Theme.css'; // Make sure this includes light theme variables

// Components
import Navbar from './components/Navbar'; // Landing page Navbar
import DashboardNavbar from './components/DashboardNavbar'; // Dashboard Navbar
import Hero from './components/Hero';
import Features from './components/Features'; // Corrected path
import Sidebar from './components/Sidebar'; // Import Sidebar

// Pages
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StockTrendsPage from './pages/StockTrendsPage'; // Import Stock Trends page

// Hooks & Data
import useAuthStatus from './hooks/useAuthStatus'; // Import auth hook
// --- Import Icons (Ensure you have run 'npm install react-icons') ---
import {
  FiShield, FiUserCheck, FiCalendar, FiMessageSquare, FiFileText, FiPercent, FiAlertTriangle
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
      { id: "insurance-fraud", title: "Fraud Policy Detection", description: "Detects fraudulent insurance policies by flagging anomalies.", icon: <FiAlertTriangle /> },
      { id: "insurance-summarizer", title: "Policy Summarizer", description: "AI summarizer can turn a long policy PDF into easy-to-read bullet points.", icon: <FiFileText /> },
      { id: "insurance-reminders", title: "Premium & Renewal Management", description: "Reminders for upcoming due dates and payment tracking.", icon: <FiCalendar /> },
    ]
  }
];


// --- Layout Component for pages WITHOUT Navbar (Auth Pages) ---
const AuthLayout = ({ children }) => {
  useEffect(() => {
    document.body.className = 'dark'; // Dark theme for auth
  }, []);
  return <div className="auth-page-wrapper">{children}</div>;
};

// --- Layout Component for Landing Page (Includes basic Navbar) ---
const LandingPageLayout = ({ children }) => {
  useEffect(() => {
    document.body.className = 'dark'; // Dark theme for landing
  }, []);
  return (
    <>
      <Navbar /> {/* Landing Page Navbar */}
      <main>{children}</main>
    </>
  );
};

// --- Layout Component for Dashboard pages (Includes DashboardNavbar and Sidebar structure) ---
const DashboardLayout = ({ children }) => {
  useEffect(() => {
    // Determine theme based on localStorage or default to light for dashboard
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = savedTheme;
  }, []); // Run only once on mount
  return (
    <div className="dashboard-root"> {/* Wrapper for full page */}
      <DashboardNavbar /> {/* Dashboard specific Navbar */}
      <div className="dashboard-body"> {/* Container below navbar */}
        <Sidebar />
        <div className="dashboard-content-area"> {/* Main content area */}
          {children}
        </div>
      </div>
    </div>
  );
};


// --- Landing Page Content Component ---
const LandingPageContent = () => (
  <>
    <Hero />
    <Features sections={featuresData} />
  </>
);

// --- Protected Route Component ---
// Checks auth status and redirects if user is not logged in
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStatus(); // Checks backend /api/auth/status

  if (isLoading) {
    // Display a loading indicator while checking authentication
    return <div className="loading-state">Authenticating...</div>;
  }
  if (!isAuthenticated) {
    // Redirect to the login page if not authenticated
    // 'replace' prevents the user from going back via browser history
    return <Navigate to="/login" replace />;
  }
  // Render the requested component (e.g., DashboardLayout) if authenticated
  return children;
};

// --- Component for Public Routes (Redirects if logged in) ---
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStatus();

  if (isLoading) {
    return <div className="loading-state">Checking session...</div>;
  }

  if (isAuthenticated) {
    // Redirect logged-in users away from public pages like landing page
    return <Navigate to="/dashboard" replace />;
  }
  // Show public page if not logged in
  return children;
};


// --- Main App Component ---
function App() {
  return (
    // The .App class provides the height container
    <div className="App">
      <Routes>
        {/* Landing Page Route (Redirects if logged in) */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPageLayout>
                <LandingPageContent />
              </LandingPageLayout>
            </PublicRoute>
          }
        />

        {/* Auth Routes (Signup and Login use AuthLayout - no Navbar) */}
        <Route
          path="/signup"
          element={
            <AuthLayout>
              <SignUpPage />
            </AuthLayout>
          }
        />
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />

        {/* Protected Dashboard Route (Base) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Protected Stock Trends Route */}
        <Route
          path="/dashboard/stocks/trends"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <StockTrendsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
         {/* Protected Insurance Tools Route */}
        <Route
          path="/dashboard/insurance"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div>Insurance Tools Page Content</div> {/* Example content */}
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Add routes for profile, settings etc. using the same pattern */}
        
      </Routes>
    </div>
  );
}

export default App;
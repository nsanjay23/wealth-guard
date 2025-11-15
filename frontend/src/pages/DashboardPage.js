import React from 'react'; // Removed useState, useEffect as they are no longer needed for the verify bar
import './DashboardPage.css';
// Removed FiAlertCircle, FiX imports
import useAuthStatus from '../hooks/useAuthStatus'; // To get user data

const DashboardPage = () => {
  const { user, isLoading } = useAuthStatus(); // Get user data and loading status

  // Display loading state while checking authentication
  if (isLoading) {
      return <div className="loading-state">Loading dashboard...</div>;
  }

  // Render the dashboard content
  return (
    // This div contains the content specific to the dashboard page
    <div className="dashboard-page-content">
      {/* Verify Email Bar has been removed */}

      {/* --- Main Dashboard Content Area --- */}
      <h1>Welcome, {user?.first_name || 'User'}!</h1>
      <p>This is your main dashboard area.</p>
      {/* Add your dashboard widgets, charts, and components below */}
      {/* Example: <RecentActivityWidget /> */}
      {/* Example: <PortfolioSummaryChart /> */}
      {/* ----------------------------------- */}
    </div>
  );
};

export default DashboardPage;
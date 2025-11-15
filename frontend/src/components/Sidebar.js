import React, { useState } from 'react'; // Import useState
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
// Import necessary icons, including dropdown arrows
import { FiGrid, FiShield, FiTrendingUp, FiChevronDown, FiChevronRight, FiActivity } from 'react-icons/fi';

const Sidebar = () => {
  // State to manage if the Stock Analysis dropdown is open
  const [isStockDropdownOpen, setIsStockDropdownOpen] = useState(false);

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {/* Dashboard Link */}
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'} end>
          <FiGrid className="sidebar-icon" /> Dashboard
        </NavLink>

        {/* Insurance Tools Link */}
        <NavLink to="/dashboard/insurance" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FiShield className="sidebar-icon" /> Insurance Tools
        </NavLink>

        {/* --- Stock Analysis Dropdown Toggle --- */}
        <div className="sidebar-link dropdown-toggle" onClick={() => setIsStockDropdownOpen(!isStockDropdownOpen)}>
          <FiTrendingUp className="sidebar-icon" /> Stock Analysis
          <span className="dropdown-arrow">
            {isStockDropdownOpen ? <FiChevronDown /> : <FiChevronRight />}
          </span>
        </div>
        {/* ------------------------------------- */}

        {/* --- Stock Analysis Sub-menu --- */}
        {isStockDropdownOpen && (
          <div className="sidebar-submenu">
            <NavLink to="/dashboard/stocks/trends" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FiActivity className="sidebar-icon sub-icon" /> Stock Trends
            </NavLink>
            {/* Add more stock analysis sub-links here later */}
            {/* Example:
            <NavLink to="/dashboard/stocks/backtest" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FiRotateCcw className="sidebar-icon sub-icon" /> Backtesting
            </NavLink>
            */}
          </div>
        )}
        {/* ----------------------------- */}

      </nav>
    </aside>
  );
};

export default Sidebar;
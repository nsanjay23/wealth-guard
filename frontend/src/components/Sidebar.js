import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { 
  FiGrid, FiTrendingUp, FiFileText, FiActivity, FiClock,
  FiShield, FiPhone, FiAlertTriangle,FiBriefcase
} from 'react-icons/fi';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'} end>
          <FiGrid className="sidebar-icon" /> Dashboard
        </NavLink>

        <div className="sidebar-section-title">Stock Analysis</div>
        
        {/* --- NEW PORTFOLIO LINK START --- */}
        <NavLink to="/portfolio" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FiBriefcase className="sidebar-icon" /> Portfolios
        </NavLink>
        {/* --- NEW PORTFOLIO LINK END --- */}

        <NavLink to="/trends" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FiTrendingUp className="sidebar-icon" /> Historical Charts
        </NavLink>
        
        <NavLink to="/fundamentals" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FiFileText className="sidebar-icon" /> Fundamentals
        </NavLink>

        <NavLink to="/risk-heatmap" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FiActivity className="sidebar-icon" /> Risk Heatmap
        </NavLink>

        <NavLink to="/backtest" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FiClock className="sidebar-icon" /> Backtesting
        </NavLink>

        <div className="sidebar-section-title">Insurance Tools</div>

        <NavLink to="/insurance" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FiShield className="sidebar-icon" /> Policy Comparison
        </NavLink>

        <NavLink to="/advisor" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FiPhone className="sidebar-icon" /> AI Advisor
        </NavLink>

        <NavLink to="/fraud-detection" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FiAlertTriangle className="sidebar-icon" /> Fraud Detection
        </NavLink>

      </nav>
    </aside>
  );
};

export default Sidebar;
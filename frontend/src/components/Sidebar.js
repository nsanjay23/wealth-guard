import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { 
  FiGrid, FiTrendingUp, FiFileText, FiActivity, FiClock,
  FiShield, FiBriefcase, FiChevronDown, FiChevronRight, FiLayers,
  FiPieChart, FiBell
} from 'react-icons/fi';

const Sidebar = () => {
  const [isPortfoliosOpen, setIsPortfoliosOpen] = useState(false);
  const [isCompaniesOpen, setIsCompaniesOpen] = useState(false);

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'} end>
          <FiGrid className="sidebar-icon" /> Dashboard
        </NavLink>

        <div className="sidebar-section-title">Stock Analysis</div>

        {/* --- COMPANIES SECTION (Moved Up) --- */}
        <div className="sidebar-link" onClick={() => setIsCompaniesOpen(!isCompaniesOpen)} style={{ cursor: 'pointer', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FiLayers className="sidebar-icon" /> Companies
          </div>
          {isCompaniesOpen ? <FiChevronDown /> : <FiChevronRight />}
        </div>

        {isCompaniesOpen && (
          <div className="sidebar-dropdown" style={{ paddingLeft: '20px' }}>
             <NavLink to="/fundamentals" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FiFileText className="sidebar-icon" /> Fundamentals
            </NavLink>

            <NavLink to="/trends" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FiTrendingUp className="sidebar-icon" /> Historical Charts
            </NavLink>
          </div>
        )}

        {/* --- PORTFOLIOS SECTION (Moved Down) --- */}
        <div className="sidebar-link" onClick={() => setIsPortfoliosOpen(!isPortfoliosOpen)} style={{ cursor: 'pointer', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FiBriefcase className="sidebar-icon" /> Portfolios
          </div>
          {isPortfoliosOpen ? <FiChevronDown /> : <FiChevronRight />}
        </div>

        {isPortfoliosOpen && (
          <div className="sidebar-dropdown" style={{ paddingLeft: '20px' }}>
            <NavLink to="/portfolio" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FiPieChart className="sidebar-icon" /> My Portfolio
            </NavLink>

            <NavLink to="/risk-heatmap" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FiActivity className="sidebar-icon" /> Risk Heatmap
            </NavLink>

            <NavLink to="/backtest" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FiClock className="sidebar-icon" /> Backtesting
            </NavLink>
          </div>
        )}

        <div className="sidebar-section-title">Insurance Tools</div>

        <NavLink to="/insurance" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FiShield className="sidebar-icon" /> Policy Discovery
        </NavLink>

        <NavLink to="/pdf" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FiFileText className="sidebar-icon" /> Policy Summarizer
        </NavLink>
        
        <NavLink to="/renew" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FiBell className="sidebar-icon" /> Premium Reminders
        </NavLink>

      </nav>
    </aside>
  );
};

export default Sidebar;
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { 
  FiGrid, FiTrendingUp, FiFileText, FiActivity, FiClock,
  FiShield, FiPhone, FiBriefcase, FiChevronDown, FiChevronRight, FiLayers
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
        
        <div className="sidebar-link" onClick={() => setIsPortfoliosOpen(!isPortfoliosOpen)} style={{ cursor: 'pointer', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FiBriefcase className="sidebar-icon" /> Portfolios
          </div>
          {isPortfoliosOpen ? <FiChevronDown /> : <FiChevronRight />}
        </div>

        {isPortfoliosOpen && (
          <div className="sidebar-dropdown" style={{ paddingLeft: '20px' }}>
            <NavLink to="/portfolio" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="sidebar-icon"></span> My Portfolio
            </NavLink>

            <NavLink to="/risk-heatmap" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FiActivity className="sidebar-icon" /> Risk Heatmap
            </NavLink>

            <NavLink to="/backtest" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <FiClock className="sidebar-icon" /> Backtracking
            </NavLink>
          </div>
        )}

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

        <div className="sidebar-section-title">Insurance Tools</div>

        <NavLink to="/insurance" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FiShield className="sidebar-icon" /> Policy Comparison
        </NavLink>

        <NavLink to="/advisor" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FiPhone className="sidebar-icon" /> AI Advisor
        </NavLink>

      </nav>
    </aside>
  );
};

export default Sidebar;
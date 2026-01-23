import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DashboardNavbar.css';
import logo from '../assets/logo.png'; 
import { FiBell, FiUser, FiLogOut, FiSettings, FiSun, FiMoon, FiGlobe } from 'react-icons/fi';
import useAuthStatus from '../hooks/useAuthStatus'; 

const DashboardNavbar = () => {
  const { user } = useAuthStatus(); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Initialize state based on localStorage OR default to Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Default to true (Dark) if no preference saved
    return savedTheme ? savedTheme === 'dark' : true;
  });

  // Apply the theme to the body tag whenever isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        credentials: 'include' 
      });
      if (response.ok) {
        setIsDropdownOpen(false);
        window.location.href = '/'; 
      } else {
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed. Please try again.');
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <nav className="dashboard-navbar">
      <div className="dashboard-navbar-left">
        <Link to="/dashboard" className="logo-link">
          <img src={logo} alt="Wealth Guard Logo" className="dashboard-logo" />
        </Link>
      </div>
      <div className="dashboard-navbar-right">
        <button className="navbar-icon-button">
          <FiBell />
        </button>
        <div className="profile-menu" ref={dropdownRef}>
          <button className="navbar-icon-button profile-button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <FiUser />
          </button>
          {isDropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                Signed in as<br /><strong>{user?.first_name || 'User'}</strong> 
              </div>
              <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                <FiUser className="dropdown-icon" /> My Profile
              </Link>
              <Link to="/settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                <FiSettings className="dropdown-icon" /> Settings
              </Link>
              <button className="dropdown-item" onClick={toggleDarkMode}>
                {isDarkMode ? <FiSun className="dropdown-icon" /> : <FiMoon className="dropdown-icon" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button className="dropdown-item"> 
                <FiGlobe className="dropdown-icon" /> Language
              </button>
              <button className="dropdown-item logout-button" onClick={handleLogout}>
                <FiLogOut className="dropdown-icon" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
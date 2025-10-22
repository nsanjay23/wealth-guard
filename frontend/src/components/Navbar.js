import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // <-- IMPORT LINK
import './Navbar.css';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          {/* --- WRAP LOGO WITH LINK --- */}
          <Link to="/">
            <img src={logo} alt="Wealth Guard Logo" />
          </Link>
          {/* --------------------------- */}
        </div>
        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/login">
                      <button className="btn btn-login">Login</button>
                    </Link>
        </div>
        <div className="hamburger" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
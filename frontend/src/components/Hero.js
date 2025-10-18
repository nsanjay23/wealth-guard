import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-visual-element"></div> {/* The background orb */}

      <div className="hero-split-content">
        <div className="hero-text-group">
          <h1 className="hero-heading">Wealth Guard</h1>
          <p className="hero-subtext">Simplify your Insurance and Stock Investments</p>
          <button className="btn-cta">Get Started</button>
        </div>

        {/* --- The overlapping UI cards visual --- */}
        <div className="hero-visual-container">
          <div className="ui-card card-back"></div>
          <div className="ui-card card-front">
            <div className="card-header">
              <span>Portfolio Value</span>
              <span className="card-dot-green"></span>
            </div>
            <div className="card-body">
              <h3 className="card-metric">+12.75%</h3>
              {/* This line has been changed to INR */}
              <p className="card-metric-label">₹17,25,000</p>
            </div>
            <div className="card-graph">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none">
                <polyline
                  className="graph-line"
                  points="0,30 20,20 40,25 60,10 80,15 100,5"
                />
              </svg>
            </div>
          </div>
        </div>
        {/* ------------------------------------------- */}
      </div>
    </section>
  );
};

export default Hero;
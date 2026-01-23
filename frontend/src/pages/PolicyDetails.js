import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiShield, FiClock, FiActivity, FiFileText } from 'react-icons/fi';
import './PolicyDetails.css';

const PolicyDetailsPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    // Fallback if accessed directly without state
    if (!state?.policy) {
        return (
            <div className="pd-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <p>No policy data found. <button onClick={() => navigate('/insurance')} style={{background:'transparent', border:'none', color:'#00d2aa', cursor:'pointer', textDecoration:'underline'}}>Go back</button></p>
            </div>
        );
    }
    
    const { policy } = state;

    return (
        <div className="pd-container">
            {/* Header Card with Back Button Inside */}
            <div className="pd-header">
                <div className="pd-header-left">
                    <button className="pd-back-btn" onClick={() => navigate(-1)}>
                        <FiArrowLeft />
                    </button>
                    <div className="pd-header-info">
                        <span className="pd-badge">{policy.type}</span>
                        <h1>{policy.planName}</h1>
                        <p className="pd-provider">by {policy.provider}</p>
                    </div>
                </div>
                
                <div className="pd-price-box">
                    <p>Annual Premium</p>
                    <div className="pd-price">₹{policy.premium.toLocaleString()}</div>
                </div>
            </div>

            <div className="pd-content">
                <div className="pd-main">
                    {/* STATS ROW */}
                    <div className="pd-stats-row">
                        <div className="pd-stat">
                            <FiShield className="pd-icon"/>
                            <div><label>Coverage</label><strong>{policy.coverage}</strong></div>
                        </div>
                        <div className="pd-stat">
                            <FiClock className="pd-icon"/>
                            <div><label>Term</label><strong>{policy.term}</strong></div>
                        </div>
                        <div className="pd-stat">
                            <FiActivity className="pd-icon"/>
                            <div><label>Claim Ratio</label><strong>98.5%</strong></div>
                        </div>
                    </div>

                    <div className="pd-section">
                        <h3>Key Features</h3>
                        <div className="pd-features">
                            {policy.features.map((f, i) => (
                                <div key={i} className="pd-feat-item"><FiCheck /> {f}</div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pd-sidebar">
                    <div className="pd-summary">
                        <div className="pd-summary-header">
                            <FiFileText /> <h3>Summary</h3>
                        </div>
                        <div className="pd-row"><span>Base Premium</span><span>₹{policy.premium.toLocaleString()}</span></div>
                        <div className="pd-row"><span>GST (18%)</span><span>₹{(policy.premium * 0.18).toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                        <hr/>
                        <div className="pd-row total"><span>Total Payable</span><span>₹{(policy.premium * 1.18).toLocaleString(undefined, {maximumFractionDigits: 0})}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyDetailsPage;
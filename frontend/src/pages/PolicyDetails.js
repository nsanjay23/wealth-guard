import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiShield, FiClock, FiActivity } from 'react-icons/fi';
import './PolicyDetails.css'; // SEPARATE CSS

const PolicyDetailsPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    if (!state?.policy) return <div>Loading...</div>;
    const { policy } = state;

    return (
        <div className="pd-container">
            <button className="pd-back" onClick={() => navigate(-1)}><FiArrowLeft /> Back</button>
            
            <div className="pd-header">
                <div>
                    <span className="pd-badge">{policy.type}</span>
                    <h1>{policy.planName}</h1>
                    <p>by {policy.provider}</p>
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
                        <h3>Summary</h3>
                        <div className="pd-row"><span>Base</span><span>₹{policy.premium}</span></div>
                        <div className="pd-row"><span>GST (18%)</span><span>₹{(policy.premium * 0.18).toFixed(0)}</span></div>
                        <hr/>
                        <div className="pd-row total"><span>Total</span><span>₹{(policy.premium * 1.18).toFixed(0)}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyDetailsPage;
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiCheckCircle, FiXCircle, FiTrash2, FiLayers } from 'react-icons/fi';
import './ComparePage.css';

const ComparePage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    
    const [policies, setPolicies] = useState(state?.policies || []);

    const handleAddMore = () => {
        navigate('/insurance', { state: { selectedPolicies: policies } });
    };

    const handleRemove = (id) => {
        const updated = policies.filter(p => p.id !== id);
        setPolicies(updated);
    };

    if (policies.length === 0) {
        return (
            <div className="cp-empty">
                <h2>No policies selected.</h2>
                <button className="cp-btn-primary" onClick={() => navigate('/insurance')}>Go to Discovery</button>
            </div>
        );
    }

    // Standard static rows
    const rows = [
        { label: 'Coverage', key: 'coverage' },
        { label: 'Term', key: 'term' },
        { label: 'Category', key: 'category' }
    ];

    return (
        <div className="cp-container">
            {/* Header is now a Card container */}
            <header className="cp-header">
                <div className="cp-header-left">
                    <button className="cp-back" onClick={() => navigate(-1)}>
                        <FiArrowLeft/>
                    </button>
                    <div>
                        <h1>Compare Plans</h1>
                        <p className="cp-subtitle">Detailed comparison of your selected policies</p>
                    </div>
                </div>
                <div className="cp-header-icon">
                    <FiLayers />
                </div>
            </header>

            <div className="cp-table-wrapper">
                <table className="cp-table">
                    <thead>
                        <tr>
                            <th className="cp-sticky-col cp-feature-header">Plan Details</th>
                            {policies.map(p => (
                                <th key={p.id} className="cp-policy-header">
                                    <div className="cp-plan-card">
                                        <div className="cp-plan-top">
                                            <span className="cp-provider-tag">{p.provider}</span>
                                            <button className="cp-btn-remove" onClick={() => handleRemove(p.id)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                        <h3 className="cp-plan-name">{p.planName}</h3>
                                        <div className="cp-price">₹{p.premium.toLocaleString()}</div>
                                    </div>
                                </th>
                            ))}
                            {policies.length < 3 && (
                                <th className="cp-add-col">
                                    <div className="cp-add-card" onClick={handleAddMore}>
                                        <FiPlus size={24} />
                                        <span>Add Plan</span>
                                    </div>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {/* 1. Standard Info Rows */}
                        {rows.map((row) => (
                            <tr key={row.key}>
                                <td className="cp-sticky-col cp-label">{row.label}</td>
                                {policies.map(p => (
                                    <td key={p.id} className="cp-data-cell">
                                        {p[row.key]}
                                    </td>
                                ))}
                                {policies.length < 3 && <td className="cp-empty-cell"></td>}
                            </tr>
                        ))}

                        {/* 2. SINGLE Consolidated Features Row */}
                        <tr>
                            <td className="cp-sticky-col cp-label cp-align-top">Features</td>
                            {policies.map(p => (
                                <td key={p.id} className="cp-data-cell cp-align-top">
                                    <div className="cp-features-list">
                                        {p.features && p.features.length > 0 ? (
                                            p.features.map((feature, idx) => (
                                                <div key={idx} className="cp-tag-yes">
                                                    <FiCheckCircle className="icon-check"/> 
                                                    <span>{feature}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="cp-tag-no"><FiXCircle/> No features</span>
                                        )}
                                    </div>
                                </td>
                            ))}
                            {policies.length < 3 && <td className="cp-empty-cell"></td>}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComparePage;
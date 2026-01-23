import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBell, FiCheckCircle, FiClock, FiAlertCircle, FiDownload } from 'react-icons/fi';
import './PremiumManagement.css';

const PremiumManagementPage = () => {
    const navigate = useNavigate();

    // Mock Data for Active Policies (In real app, fetch from API)
    const [activePolicies, setActivePolicies] = useState([
        {
            id: 101,
            provider: 'HDFC Life',
            planName: 'Click 2 Protect',
            premium: 12000,
            dueDate: '2025-10-15', // Upcoming
            status: 'Active',
            autoPay: false,
            reminderSet: true
        },
        {
            id: 102,
            provider: 'ICICI Lombard',
            planName: 'Health Guard',
            premium: 8500,
            dueDate: '2025-02-28', // Due Soon
            status: 'Active',
            autoPay: true,
            reminderSet: true
        },
        {
            id: 103,
            provider: 'Bajaj Allianz',
            planName: 'Car Insurance - 1L',
            premium: 1200,
            dueDate: '2025-01-10', // Overdue (Example)
            status: 'Overdue',
            autoPay: false,
            reminderSet: false
        }
    ]);

    // Helper to calculate days remaining
    const getDaysLeft = (dateStr) => {
        const today = new Date();
        const due = new Date(dateStr);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays;
    };

    const toggleReminder = (id) => {
        setActivePolicies(prev => prev.map(p => 
            p.id === id ? { ...p, reminderSet: !p.reminderSet } : p
        ));
    };

    return (
        <div className="pm-container">
            <header className="pm-header">
                <button className="pm-back" onClick={() => navigate('/insurance')}>
                    <FiArrowLeft /> Back to Discovery
                </button>
                <h1>Premium Management</h1>
                <p>Track your active policies and upcoming payments.</p>
            </header>

            <div className="pm-grid">
                {/* UPCOMING PAYMENTS SECTION */}
                <div className="pm-section">
                    <h2>Your Policies</h2>
                    <div className="pm-cards-list">
                        {activePolicies.map(policy => {
                            const daysLeft = getDaysLeft(policy.dueDate);
                            let statusClass = 'status-ok';
                            let statusText = `${daysLeft} days left`;
                            
                            if (daysLeft < 0) {
                                statusClass = 'status-danger';
                                statusText = `Overdue by ${Math.abs(daysLeft)} days`;
                            } else if (daysLeft <= 30) {
                                statusClass = 'status-warning';
                            }

                            return (
                                <div key={policy.id} className={`pm-card ${daysLeft < 0 ? 'card-overdue' : ''}`}>
                                    <div className="pm-card-top">
                                        <div>
                                            <h4>{policy.provider}</h4>
                                            <h3>{policy.planName}</h3>
                                        </div>
                                        <div className={`pm-status-badge ${statusClass}`}>
                                            {daysLeft < 0 ? <FiAlertCircle/> : <FiClock/>}
                                            {statusText}
                                        </div>
                                    </div>

                                    <div className="pm-details-row">
                                        <div className="pm-info-block">
                                            <label>Premium Amount</label>
                                            <span className="amount">₹{policy.premium.toLocaleString()}</span>
                                        </div>
                                        <div className="pm-info-block">
                                            <label>Due Date</label>
                                            <span>{new Date(policy.dueDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="pm-actions">
                                        <button 
                                            className={`btn-reminder ${policy.reminderSet ? 'active' : ''}`}
                                            onClick={() => toggleReminder(policy.id)}
                                        >
                                            <FiBell /> {policy.reminderSet ? 'Reminder On' : 'Set Reminder'}
                                        </button>
                                        
                                        {daysLeft < 0 ? (
                                            <button className="btn-pay-now overdue">Pay Immediately</button>
                                        ) : (
                                            <button className="btn-pay-now">Pay Now</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SIDEBAR: HISTORY & TOOLS */}
                <div className="pm-sidebar">
                    <div className="pm-widget">
                        <h3>Quick Actions</h3>
                        <ul className="pm-links">
                            <li><FiDownload /> Download Tax Certificates</li>
                            <li><FiCheckCircle /> View Payment History</li>
                            <li><FiBell /> Manage Notification Settings</li>
                        </ul>
                    </div>

                    <div className="pm-widget summary-widget">
                        <h3>Total Monthly Liability</h3>
                        <div className="liability-amount">₹21,700</div>
                        <p>Total premiums due in 2025</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumManagementPage;
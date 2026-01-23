import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Default styles (overridden in CSS)
import { FaPlus, FaGoogle, FaEnvelope, FaTrash, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import './PremiumManagement.css';

// --- GLOBAL CONFIGURATION (Prevents Infinite Loop) ---
const API_BASE_URL = 'http://localhost:5001';
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true // CRITICAL: Sends session cookies for auth
});

// --- SUB-COMPONENT: TOAST NOTIFICATION ---
const Toast = ({ message, type, onClose }) => (
    <div className={`toast ${type}`}>
        <span>{message}</span>
        <button onClick={onClose} className="toast-close"><FaTimes /></button>
    </div>
);

// --- SUB-COMPONENT: CONFIRMATION MODAL ---
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '400px', textAlign: 'center' }}>
                <h3 style={{ marginTop: 0 }}>Confirm Action</h3>
                <p style={{ color: '#a0a0a0', fontSize: '1.1rem', marginBottom: '2rem' }}>{message}</p>
                <div className="confirm-actions" style={{ justifyContent: 'center' }}>
                    <button className="btn-secondary" onClick={onCancel}>Cancel</button>
                    <button className="btn-danger" onClick={onConfirm}>Yes, Delete</button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const PremiumManagementPage = () => {
    // --- STATE MANAGEMENT ---
    const [policies, setPolicies] = useState([]);
    const [googleEvents, setGoogleEvents] = useState([]); // Stores fetched Google Calendar events
    const [stats, setStats] = useState({ nextDue: '-', upcoming: 0, overdue: 0 });
    const [isLoading, setIsLoading] = useState(true);
    
    // UI State
    const [showFormModal, setShowFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, policyId: null });
    const [step, setStep] = useState(1); // For the 2-step Add Policy modal
    const [toast, setToast] = useState(null);
    const [date, setDate] = useState(new Date()); // Calendar selected date

    // Form Data State
    const [formData, setFormData] = useState({
        policyName: '',
        insurer: '',
        premiumAmount: '',
        dueDate: '',
        reminderSettings: { googleCalendar: false, email: true }
    });

    // --- HELPER: SHOW TOAST ---
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000); // Auto-hide after 3s
    };

    // --- API: FETCH POLICIES ---
    const fetchPolicies = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/api/policies');
            setPolicies(res.data);
            calculateStats(res.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching policies', error);
            showToast("Failed to load policies.", "error");
            setIsLoading(false);
        }
    }, []);

    // --- API: FETCH GOOGLE EVENTS ---
    const fetchGoogleEvents = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/api/reminders/google-calendar');
            setGoogleEvents(res.data || []);
        } catch (error) {
            // User might not be connected to Google, so we fail silently or log debug
            console.log("Google Calendar fetch skipped or failed (User likely not connected via Google OAuth).");
        }
    }, []);

    // --- EFFECT: INITIAL LOAD ---
    useEffect(() => {
        fetchPolicies();
        fetchGoogleEvents();
    }, [fetchPolicies, fetchGoogleEvents]);

    // --- LOGIC: CALCULATE DASHBOARD STATS ---
    const calculateStats = (data) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let upcoming = 0;
        let overdue = 0;
        let nextDueDate = null;
        let minDiff = Infinity;

        data.forEach(policy => {
            const due = new Date(policy.dueDate);
            due.setHours(0, 0, 0, 0);
            const diffTime = due - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            if (diffDays < 0) overdue++;
            if (diffDays >= 0 && diffDays <= 30) upcoming++;
            
            // Find nearest future date
            if (diffDays >= 0 && diffTime < minDiff) {
                minDiff = diffTime;
                nextDueDate = due;
            }
        });

        setStats({
            nextDue: nextDueDate ? nextDueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'None',
            upcoming,
            overdue
        });
    };

    // --- LOGIC: CALENDAR DOTS ---
    const getTileContent = ({ date, view }) => {
        if (view === 'month') {
            const content = [];

            // 1. Red Dot for Policy Due Dates
            const hasPolicy = policies.some(p => {
                const d = new Date(p.dueDate);
                return d.getDate() === date.getDate() &&
                       d.getMonth() === date.getMonth() &&
                       d.getFullYear() === date.getFullYear();
            });
            if (hasPolicy) content.push(<div key="policy" className="dot red"></div>);

            // 2. Blue Dot for Google Events
            const hasGoogleEvent = googleEvents.some(e => {
                const d = new Date(e.date);
                return d.getDate() === date.getDate() &&
                       d.getMonth() === date.getMonth() &&
                       d.getFullYear() === date.getFullYear();
            });
            if (hasGoogleEvent) content.push(<div key="google" className="dot blue"></div>);

            return <div className="dots-container">{content}</div>;
        }
        return null;
    };

    // --- LOGIC: CARD STATUS COLORS ---
    const getStatusColor = (dateStr) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dateStr);
        due.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'red';    // Overdue
        if (diffDays <= 15) return 'yellow'; // Urgent
        return 'green';                    // Safe
    };

    // --- HANDLERS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Strict Number Validation for Premium
        if (name === 'premiumAmount') {
            if (value !== '' && !/^\d*\.?\d*$/.test(value)) return; 
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleReminderChange = (e) => {
        const { name, checked } = e.target;
        setFormData({
            ...formData,
            reminderSettings: { ...formData.reminderSettings, [name]: checked }
        });
    };

    // --- DELETE LOGIC ---
    const initiateDelete = (id) => {
        setDeleteModal({ show: true, policyId: id });
    };

    const confirmDelete = async () => {
        const id = deleteModal.policyId;
        try {
            await axiosInstance.delete(`/api/policies/${id}`);
            showToast("Policy removed successfully.", "success");
            fetchPolicies(); // Refresh list
        } catch (error) {
            console.error(error);
            showToast("Failed to delete policy.", "error");
        } finally {
            setDeleteModal({ show: false, policyId: null });
        }
    };

    // --- FORM SUBMISSION ---
    const handleNextStep = () => {
        if (!formData.policyName || !formData.premiumAmount || !formData.dueDate || !formData.insurer) {
            showToast("Please fill all required fields.", "error");
            return;
        }
        setStep(2);
    };

    const handleSubmit = async () => {
        try {
            // 1. Save Policy (Backend sends email if checked)
            await axiosInstance.post('/api/policies', formData);
            showToast("Policy saved! Email reminder set.", "success");

            // 2. Sync to Google Calendar (if checked)
            if (formData.reminderSettings.googleCalendar) {
                try {
                    await axiosInstance.post('/api/reminders/google-calendar', { 
                        policyName: formData.policyName, 
                        premiumAmount: formData.premiumAmount,
                        dueDate: formData.dueDate 
                    });
                    setTimeout(() => showToast("Synced with Google Calendar!", "success"), 800);
                    setTimeout(() => fetchGoogleEvents(), 2000); // Refresh calendar dots
                } catch (calError) {
                    console.error(calError);
                    showToast("Policy saved, but Calendar Sync failed.", "error");
                }
            }
            
            closeFormModal();
            fetchPolicies(); // Refresh list
        } catch (error) {
            console.error(error);
            showToast("Failed to save policy.", "error");
        }
    };

    const closeFormModal = () => {
        setShowFormModal(false);
        setStep(1);
        setFormData({
            policyName: '', insurer: '', premiumAmount: '', dueDate: '',
            reminderSettings: { googleCalendar: false, email: true }
        });
    };

    return (
        <div className="premium-container">
            {/* Toast Container */}
            {toast && (
                <div className="toast-container">
                    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                </div>
            )}

            {/* Custom Confirmation Modal */}
            <ConfirmationModal 
                isOpen={deleteModal.show}
                message="Are you sure you want to delete this policy reminder?"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ show: false, policyId: null })}
            />

            {/* --- HEADER --- */}
            <div className="header-section">
                <div className="header-title">
                    <h1>Premium & Renewal Reminders</h1>
                    <p>Track your insurance due dates & never miss a payment.</p>
                </div>
                <button className="add-btn" onClick={() => setShowFormModal(true)}>
                    <FaPlus /> Add New Policy
                </button>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="stats-grid">
                <div className="stat-card cyan">
                    <h3>Next Due</h3>
                    <p>{stats.nextDue}</p>
                </div>
                <div className="stat-card yellow">
                    <h3>Upcoming (30 Days)</h3>
                    <p>{stats.upcoming} Policies</p>
                </div>
                <div className="stat-card red">
                    <h3>Overdue</h3>
                    <p>{stats.overdue} Policies</p>
                </div>
            </div>

            {/* --- MAIN DASHBOARD (List + Calendar) --- */}
            <div className="dashboard-content">
                
                {/* LEFT: Policy List */}
                <div className="policies-list">
                    {isLoading ? (
                        <p className="loading-text">Loading policies...</p>
                    ) : policies.length === 0 ? (
                        <div className="empty-state">
                            <FaCalendarAlt size={40} color="var(--wg-accent)"/>
                            <p>No policies added yet.</p>
                        </div>
                    ) : (
                        policies.map(policy => (
                            <div key={policy.id} className={`policy-card ${getStatusColor(policy.dueDate)}`}>
                                <div className="policy-info">
                                    <h4>{policy.policyName}</h4>
                                    <div className="policy-sub">{policy.insurer}</div>
                                    <div className="reminder-icons">
                                        {policy.reminderSettings?.email && <FaEnvelope title="Email On" />}
                                        {policy.reminderSettings?.googleCalendar && <FaGoogle title="Calendar Sync" />}
                                    </div>
                                </div>
                                <div className="policy-meta">
                                    <span className="amount">₹{parseFloat(policy.premiumAmount).toLocaleString('en-IN')}</span>
                                    <span className="due-date">
                                        Due: {new Date(policy.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                <button className="action-btn delete" onClick={() => initiateDelete(policy.id)}>
                                    <FaTrash />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* RIGHT: Calendar */}
                <div className="calendar-wrapper">
                    <h3>Renewal Calendar</h3>
                    <Calendar 
                        onChange={setDate} 
                        value={date} 
                        tileContent={getTileContent}
                    />
                    <div className="calendar-legend" style={{marginTop:'1rem', display:'flex', gap:'1rem', fontSize:'0.8rem', color:'#a0a0a0'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'5px'}}><span className="dot red"></span> Policy Due</div>
                        <div style={{display:'flex', alignItems:'center', gap:'5px'}}><span className="dot blue"></span> Google Event</div>
                    </div>
                </div>
            </div>

            {/* --- ADD POLICY MODAL --- */}
            {showFormModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        {step === 1 ? (
                            <>
                                <h2 style={{marginTop:0}}>Add Policy Details</h2>
                                <div className="form-group">
                                    <label>Policy Name</label>
                                    <input name="policyName" value={formData.policyName} onChange={handleInputChange} autoFocus placeholder="e.g. Life Insurance" />
                                </div>
                                <div className="form-group">
                                    <label>Insurer</label>
                                    <input name="insurer" value={formData.insurer} onChange={handleInputChange} placeholder="e.g. LIC" />
                                </div>
                                <div className="form-group">
                                    <label>Premium Amount (₹)</label>
                                    <input name="premiumAmount" type="text" value={formData.premiumAmount} onChange={handleInputChange} placeholder="0" />
                                </div>
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input name="dueDate" type="date" value={formData.dueDate} onChange={handleInputChange} />
                                </div>
                                <div className="confirm-actions">
                                    <button className="btn-secondary" onClick={closeFormModal}>Cancel</button>
                                    <button className="add-btn" onClick={handleNextStep}>Next</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 style={{marginTop:0}}>Configure Reminders</h2>
                                <div className="toggle-item">
                                    <label><FaEnvelope className="icon"/> Email Notification</label>
                                    <input type="checkbox" name="email" checked={formData.reminderSettings.email} onChange={handleReminderChange} />
                                </div>
                                <div className="toggle-item">
                                    <label><FaGoogle className="icon"/> Sync to Google Calendar</label>
                                    <input type="checkbox" name="googleCalendar" checked={formData.reminderSettings.googleCalendar} onChange={handleReminderChange} />
                                </div>
                                <div className="confirm-actions">
                                    <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                                    <button className="add-btn" onClick={handleSubmit}>Save Policy</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PremiumManagementPage;
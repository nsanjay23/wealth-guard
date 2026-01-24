import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FiUser, FiSave, FiCheckCircle, FiActivity, FiDollarSign, 
    FiTrash2, FiTarget, FiAlertTriangle, FiX, FiAlertCircle
} from 'react-icons/fi';
import './UserProfilePage.css';

// Default State (Changed dob -> age)
const initialState = {
    age: '', gender: '', dependents: '', city: '',
    incomeRange: '', occupation: '', existingLoans: false,
    smoker: '', diseases: [],
    lifeGoal: '', healthType: '', riskAppetite: '',
    tax80c: false, tax80d: false
};

const UserProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState(initialState);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const diseasesList = ["Diabetes", "Hypertension", "Asthma", "Thyroid", "Heart Condition"];

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/user/profile', { withCredentials: true });
                if (res.data && (res.data.incomeRange || res.data.age)) {
                    const loadedData = {
                        ...res.data,
                        age: res.data.age || '', // Load Age
                        gender: res.data.gender || '',
                        dependents: res.data.dependents || 0,
                        city: res.data.city || '',
                        incomeRange: res.data.incomeRange || '',
                        occupation: res.data.occupation || '',
                        existingLoans: res.data.existingLoans || false,
                        smoker: res.data.smoker || '',
                        diseases: Array.isArray(res.data.diseases) ? res.data.diseases : [],
                        lifeGoal: res.data.lifeGoal || '',
                        healthType: res.data.healthType || '',
                        riskAppetite: res.data.riskAppetite || '',
                        tax80c: res.data.tax80c || false,
                        tax80d: res.data.tax80d || false
                    };
                    setFormData(loadedData);
                } else {
                    setFormData(initialState);
                }
            } catch (e) { 
                if(e.response && e.response.status !== 404) showToast("Could not load profile data.", "error");
            } finally { setLoading(false); }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox' && name === 'diseases') {
            let updatedList = [...formData.diseases];
            if (checked) updatedList.push(value);
            else updatedList = updatedList.filter(item => item !== value);
            setFormData({ ...formData, diseases: updatedList });
        } else if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        setSaved(false);
    };

    const toggleDisease = (d) => {
        let updatedList = [...formData.diseases];
        if (updatedList.includes(d)) updatedList = updatedList.filter(item => item !== d);
        else updatedList.push(d);
        setFormData({ ...formData, diseases: updatedList });
        setSaved(false);
    };

    const setRisk = (val) => {
        setFormData({ ...formData, riskAppetite: val });
        setSaved(false);
    };

    const handleSave = async () => {
        try {
            // Prepare Payload
            const payload = {
                ...formData,
                dependents: formData.dependents === '' ? 0 : parseInt(formData.dependents),
                age: formData.age === '' ? null : parseInt(formData.age), // Send Age as Integer
                incomeRange: formData.incomeRange || null,
                occupation: formData.occupation || null
            };

            await axios.put('http://localhost:5001/api/user/profile', payload, { withCredentials: true });

            setSaved(true);
            showToast("Profile updated successfully.", "success");
            setTimeout(() => setSaved(false), 3000);
        } catch (e) { 
            console.error(e);
            showToast("Failed to save profile.", "error"); 
        }
    };

    const confirmDeleteProfile = async () => {
        try {
            const emptyPayload = {
                age: null, gender: null, dependents: 0, city: null,
                incomeRange: null, occupation: null, existingLoans: false,
                smoker: null, diseases: [], lifeGoal: null, healthType: null, 
                riskAppetite: null, tax80c: false, tax80d: false
            };
            await axios.put('http://localhost:5001/api/user/profile', emptyPayload, { withCredentials: true });
            setFormData(initialState);
            setShowDeleteModal(false);
            showToast("Profile cleared successfully.", "success");
        } catch (e) { console.error(e); showToast("Failed to clear profile.", "error"); }
    };

    if (loading) return <div className="profile-wrapper loading"><div className="spinner"></div></div>;

    return (
        <div className="profile-wrapper">
            <header className="page-header">
                <div>
                    <h1>My Profile</h1>
                    <p>Customize your profile to get 100% accurate AI matches.</p>
                </div>
                <div className="header-icon"><FiUser /></div>
            </header>

            <div className="form-grid">
                {/* 1. PERSONAL */}
                <div className="form-card">
                    <h3><FiUser/> Personal Details</h3>
                    <div className="row">
                        <div className="field">
                            <label>Age</label>
                            <input 
                                type="number" 
                                name="age" 
                                placeholder="e.g. 25"
                                min="18"
                                max="100"
                                value={formData.age} 
                                onChange={handleChange} 
                                className="modern-input"
                            />
                        </div>
                        <div className="field">
                            <label>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="modern-input">
                                <option value="" disabled>Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="row">
                        <div className="field">
                            <label>Dependents</label>
                            <input type="number" name="dependents" min="0" value={formData.dependents} onChange={handleChange} placeholder="0" className="modern-input"/>
                        </div>
                        <div className="field">
                            <label>City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Mumbai" className="modern-input"/>
                        </div>
                    </div>
                </div>

                {/* 2. FINANCIAL */}
                <div className="form-card">
                    <h3><FiDollarSign/> Financial Status</h3>
                    <div className="field">
                        <label>Annual Income</label>
                        <select name="incomeRange" value={formData.incomeRange} onChange={handleChange} className="modern-input">
                            <option value="" disabled>Select Income</option>
                            <option value="<5L">Less than ₹5L</option>
                            <option value="5-10L">₹5L - ₹10L</option>
                            <option value="10-20L">₹10L - ₹20L</option>
                            <option value="20-50L">₹20L - ₹50L</option>
                            <option value=">50L">Above ₹50L</option>
                        </select>
                    </div>
                    <div className="field">
                        <label>Occupation</label>
                        <select name="occupation" value={formData.occupation} onChange={handleChange} className="modern-input">
                            <option value="" disabled>Select Type</option>
                            <option value="Salaried">Salaried</option>
                            <option value="Self-Employed">Self-Employed</option>
                            <option value="Student">Student</option>
                            <option value="Retired">Retired</option>
                        </select>
                    </div>
                    
                    <div className={`modern-checkbox ${formData.existingLoans ? 'active' : ''}`} onClick={() => setFormData({...formData, existingLoans: !formData.existingLoans})}>
                        <div className="check-circle">{formData.existingLoans && <FiCheckCircle />}</div>
                        <span>I have existing loans (Home/Car)</span>
                    </div>
                </div>

                {/* 3. HEALTH */}
                <div className="form-card">
                    <h3><FiActivity/> Health & Lifestyle</h3>
                    <div className="field">
                        <label>Do you smoke?</label>
                        <div className="toggle-group">
                            <button className={formData.smoker === 'No' ? 'active' : ''} onClick={()=>setFormData({...formData, smoker: 'No'})}>No</button>
                            <button className={formData.smoker === 'Yes' ? 'active' : ''} onClick={()=>setFormData({...formData, smoker: 'Yes'})}>Yes</button>
                        </div>
                    </div>
                    <div className="field">
                        <label>Pre-existing Conditions</label>
                        <div className="tags-container">
                            {diseasesList.map(d => (
                                <button key={d} className={`tag-btn ${formData.diseases.includes(d) ? 'selected' : ''}`} onClick={() => toggleDisease(d)}>
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. GOALS */}
                <div className="form-card">
                    <h3><FiTarget/> Goals & Preferences</h3>
                    
                    <div className="field">
                        <label>Risk Appetite (Premium vs Cover)</label>
                        <div className="risk-selector">
                            <button className={formData.riskAppetite === 'Low Cost' ? 'active' : ''} onClick={() => setRisk('Low Cost')}>
                                <span className="risk-title">Low Cost</span>
                                <span className="risk-desc">Min Premium</span>
                            </button>
                            <button className={formData.riskAppetite === 'Balanced' ? 'active' : ''} onClick={() => setRisk('Balanced')}>
                                <span className="risk-title">Balanced</span>
                                <span className="risk-desc">Best Value</span>
                            </button>
                            <button className={formData.riskAppetite === 'High Cover' ? 'active' : ''} onClick={() => setRisk('High Cover')}>
                                <span className="risk-title">High Cover</span>
                                <span className="risk-desc">Max Safety</span>
                            </button>
                        </div>
                    </div>

                    <div className="field">
                        <label>Primary Goal</label>
                        <select name="lifeGoal" value={formData.lifeGoal} onChange={handleChange} className="modern-input">
                            <option value="" disabled>Select Goal</option>
                            <option value="Protection">Pure Protection</option>
                            <option value="Investment">Investment</option>
                            <option value="Tax Saving">Tax Saving</option>
                        </select>
                    </div>

                    <div className="field">
                        <label>Tax Priorities</label>
                        <div className="tags-container">
                             <button className={`tag-btn ${formData.tax80c ? 'selected' : ''}`} onClick={() => setFormData({...formData, tax80c: !formData.tax80c})}>80C Benefit</button>
                             <button className={`tag-btn ${formData.tax80d ? 'selected' : ''}`} onClick={() => setFormData({...formData, tax80d: !formData.tax80d})}>80D Benefit</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fab-container">
                <button className="btn-clear-fab" onClick={() => setShowDeleteModal(true)}><FiTrash2 /></button>
                <button className={`btn-save-fab ${saved ? 'success' : ''}`} onClick={handleSave}>
                    {saved ? <><FiCheckCircle /> Saved!</> : <><FiSave /> Save Changes</>}
                </button>
            </div>

            {toast.show && (
                <div className={`toast-notification ${toast.type}`}>
                    {toast.type === 'error' ? <FiAlertCircle /> : <FiCheckCircle />}
                    <span>{toast.message}</span>
                </div>
            )}

            {showDeleteModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <div className="modal-icon-container">
                            <FiAlertTriangle className="warning-icon" />
                        </div>
                        <h2>Delete Profile?</h2>
                        <p>This will wipe all your entered financial data. This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="btn-confirm-delete" onClick={confirmDeleteProfile}>
                                <FiTrash2 /> Yes, Delete
                            </button>
                        </div>
                        <button className="btn-close-absolute" onClick={() => setShowDeleteModal(false)}><FiX/></button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default UserProfilePage;
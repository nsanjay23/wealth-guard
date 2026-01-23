import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { 
    FiShield, FiSearch, FiFilter, FiCheckCircle, FiActivity, 
    FiZap, FiPlusCircle, FiUser, FiChevronDown, FiAlertTriangle, FiX 
} from 'react-icons/fi';
import './InsuranceDiscoveryPage.css';

const InsuranceDiscoveryPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Load existing selection if returning from another page
    const initialCompareList = location.state?.selectedPolicies || [];

    const [allPolicies, setAllPolicies] = useState([]); 
    const [displayPolicies, setDisplayPolicies] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [compareList, setCompareList] = useState(initialCompareList);
    const [customAlert, setCustomAlert] = useState({ show: false, msg: '', type: '' });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [visibleCount, setVisibleCount] = useState(10);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const filterOptions = [
        { value: 'All', label: 'All Categories' },
        { value: 'Term Life', label: 'Term Life' },
        { value: 'Health', label: 'Health' },
        { value: 'Motor', label: 'Motor' }
    ];

    const triggerAlert = (msg, type = 'error') => {
        setCustomAlert({ show: true, msg, type });
        // Auto-hide after 3 seconds
        setTimeout(() => {
            setCustomAlert(prev => ({ ...prev, show: false }));
        }, 3000);
    };
    
    // 1. DATA LOADING
    useEffect(() => {
        const init = async () => {
            try {
                // A. Fetch Profile (to show in the sidebar)
                try {
                    const profileRes = await axios.get('http://localhost:5001/api/user/profile', { withCredentials: true });
                    if (profileRes.data && (profileRes.data.age || profileRes.data.incomeRange)) {
                        setUserProfile(profileRes.data);
                    }
                } catch (e) { 
                    console.log("User might be a guest or profile incomplete");
                    setUserProfile(null); 
                }

                // B. Fetch Policies (Already AI-Sorted by Backend)
                // The backend now handles the sorting and the 'isAiRecommended' flag
                const policyRes = await axios.get('http://localhost:5001/api/insurance/live', { withCredentials: true });
                const fetchedPolicies = policyRes.data;

                setAllPolicies(fetchedPolicies);
                setDisplayPolicies(fetchedPolicies);

            } catch (err) { 
                console.error("Error loading data:", err);
                triggerAlert("Failed to load policies. Please try again.", "error");
            } finally { 
                setLoading(false); 
            }
        };
        init();
    }, []);

    // 2. Filter Logic (Client-Side Search & Filter)
    useEffect(() => {
        let result = allPolicies;

        // Type Filter
        if (selectedType !== 'All') {
            result = result.filter(p => p.type === selectedType);
        }

        // Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(p => 
                p.provider.toLowerCase().includes(lowerTerm) || 
                p.planName.toLowerCase().includes(lowerTerm)
            );
        }

        setDisplayPolicies(result);
    }, [searchTerm, selectedType, allPolicies]);

    const handleViewDetails = (policy) => {
        navigate('/policy-details', { state: { policy } });
    };

    const toggleCompare = (policy) => {
        const exists = compareList.find(p => p.id === policy.id);
        if (exists) {
            setCompareList(prev => prev.filter(p => p.id !== policy.id));
            return;
        }
        
        // Validation Checks
        if (compareList.length >= 3) {
            triggerAlert("Max 3 plans allowed. Remove one to add another.", "error");
            return;
        }
        if (compareList.length > 0 && compareList[0].type !== policy.type) {
            triggerAlert(`Compare only ${compareList[0].type} plans together.`, "error");
            return;
        }
        
        setCompareList(prev => [...prev, policy]);
    };

    const proceedToCompare = () => {
        if (compareList.length < 2) {
            triggerAlert("Please select at least 2 policies to compare.", "warning");
            return;
        }
        navigate('/compare', { state: { policies: compareList } });
    };

    if (loading) return <div className="loading-state">Analyzing Profile & Policies...</div>;

    return (
        <div className="id-page-container">
            <header className="id-header">
                <div>
                    <h1>Insurance Discovery</h1>
                    <p>Compare real-time policies curated for you.</p>
                </div>
                <div className="id-header-icon"><FiShield /></div>
            </header>

            {/* Custom Alert Pop-up */}
            {customAlert.show && (
                <div className={`custom-alert ${customAlert.type}`}>
                    <div className="alert-icon">
                        {customAlert.type === 'error' ? <FiAlertTriangle /> : <FiZap />}
                    </div>
                    <div className="alert-content">
                        <span>{customAlert.msg}</span>
                    </div>
                    <button className="alert-close" onClick={() => setCustomAlert({ ...customAlert, show: false })}>
                        <FiX />
                    </button>
                </div>
            )}

            {/* Controls Bar */}
            <div className="id-controls">
                <div className="id-search">
                    <FiSearch className="id-icon"/>
                    <input 
                        placeholder="Search provider or plan..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                </div>
                <div 
                    className="id-filter custom-dropdown" 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <FiFilter className="id-icon"/>
                    
                    <span className="dropdown-selected-text">
                        {filterOptions.find(opt => opt.value === selectedType)?.label || selectedType}
                    </span>
                    
                    <FiChevronDown className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />

                    {isDropdownOpen && (
                        <ul className="dropdown-menu-list">
                            {filterOptions.map((opt) => (
                                <li 
                                    key={opt.value}
                                    className={`dropdown-item ${selectedType === opt.value ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedType(opt.value);
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    {opt.label}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="id-layout">
                {/* Main List Area */}
                <div className="id-list-container">
                    {displayPolicies.length === 0 && (
                        <div className="no-results">No policies found matching your criteria.</div>
                    )}

                    {displayPolicies.slice(0, visibleCount).map(p => {
                        const isSelected = compareList.some(c => c.id === p.id);
                        const isDisabled = compareList.length > 0 && compareList[0].type !== p.type;

                        return (
                            <div key={p.id} className={`id-wide-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled-card' : ''}`}>
                                
                                {/* AI RECOMMENDATION BADGE */}
                                {/* This relies on the backend sending isAiRecommended: true */}
                                {p.isAiRecommended && (
                                    <div className="id-badge-ai">
                                        <FiZap/> AI Recommended
                                    </div>
                                )}
                                
                                <div className="id-card-left">
                                    <div className="id-provider">
                                        <h4>{p.provider}</h4>
                                        <span className="policy-type-tag">{p.type}</span>
                                    </div>
                                    <h2 className="id-plan-name">{p.planName}</h2>
                                    <div className="id-features-inline">
                                        <FiCheckCircle/> <span>{p.features[0]}</span>
                                        {p.features[1] && <><span className="dot">•</span> <span>{p.features[1]}</span></>}
                                    </div>
                                </div>

                                <div className="id-card-middle">
                                    <div className="id-stat-box">
                                        <label>Cover</label>
                                        <strong>{p.coverage}</strong>
                                    </div>
                                    <div className="id-stat-box">
                                        <label>Term</label>
                                        <strong>{p.term}</strong>
                                    </div>
                                    <div className="id-stat-box price-box">
                                        <label>Premium</label>
                                        <strong>₹{p.premium.toLocaleString()}</strong>
                                    </div>
                                </div>

                                <div className="id-card-right">
                                    <button className="id-btn-outline" onClick={() => handleViewDetails(p)}>Details</button>
                                    <button 
                                        className={`id-btn-action ${isSelected ? 'btn-remove' : 'btn-compare'}`} 
                                        onClick={() => toggleCompare(p)}
                                        disabled={isDisabled && !isSelected}
                                    >
                                        {isSelected ? 'Remove' : 'Compare'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    
                    {visibleCount < displayPolicies.length && (
                        <button className="id-btn-load" onClick={() => setVisibleCount(prev => prev + 10)}>
                            Load More
                        </button>
                    )}
                </div>

                {/* Sidebar Profile Summary */}
                <aside className="id-sidebar">
                    {userProfile ? (
                        <div className="id-profile-card">
                            <div className="id-profile-head">
                                <FiActivity /> <h3>Active Profile</h3>
                            </div>
                            <div className="id-profile-rows">
                                <div className="row"><span>Age</span> <span>{userProfile.age}</span></div>
                                <div className="row"><span>Income</span> <span>{userProfile.incomeRange}</span></div>
                                <div className="row"><span>Occupation</span> <span>{userProfile.occupation}</span></div>
                                {userProfile.diseases && userProfile.diseases.length > 0 && (
                                    <div className="row warn"><span>Conditions</span> <span>{userProfile.diseases.length}</span></div>
                                )}
                            </div>
                            <button className="id-btn-edit" onClick={() => navigate('/profile')}>Edit Profile</button>
                        </div>
                    ) : (
                        <div className="id-guest-card">
                            <FiUser size={40}/>
                            <h3>Personalize Results</h3>
                            <p>Setup your profile to get AI-powered recommendations.</p>
                            <button className="id-btn-setup" onClick={() => navigate('/profile')}>
                                <FiPlusCircle /> Setup Profile
                            </button>
                        </div>
                    )}
                </aside>
            </div>

            {/* Compare Dock (Sticky Bottom) */}
            {compareList.length > 0 && (
                <div className="id-dock">
                    <div className="dock-content">
                        <span className="dock-count">{compareList.length}</span>
                        <span>Plans Selected</span>
                    </div>
                    <div className="dock-btns">
                        <button className="btn-text" onClick={() => setCompareList([])}>Clear</button>
                        <button className="btn-go" onClick={proceedToCompare}>Compare Now</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsuranceDiscoveryPage;
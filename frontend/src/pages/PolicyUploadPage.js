import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    FiUploadCloud, FiFileText, FiShield, FiAlertTriangle, 
    FiCheckCircle, FiCpu, FiMessageSquare, FiSend, FiX, FiTrash2, FiMinimize2,
    FiCalendar, FiUser, FiInfo, FiHelpCircle, FiLayers, FiArrowLeft, FiStar, FiClock
} from 'react-icons/fi';
import './PolicyUploadPage.css';

const PolicyUploadPage = () => {
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);
    const navigate = useNavigate();

    // --- STATE ---
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState('idle'); 
    const [analysisResult, setAnalysisResult] = useState(null);
    const [pdfContext, setPdfContext] = useState(''); 

    // Chatbot State
    const [isChatOpen, setIsChatOpen] = useState(false); 
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hi! I am your Insurance Assistant. I can explain terms or help you understand this policy.' }
    ]);
    const [inputMsg, setInputMsg] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);

    // --- HELPER: Strip Markdown ---
    const formatMessage = (text) => {
        return text ? text.replace(/\*\*/g, '').replace(/__/g, '') : "";
    };

    // --- HANDLERS ---
    const handleFileSelect = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === 'application/pdf') {
            setFile(selected);
            processFile(selected);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const selected = e.dataTransfer.files[0];
        if (selected && selected.type === 'application/pdf') {
            setFile(selected);
            processFile(selected);
        }
    };

    const resetAnalysis = () => {
        setFile(null);
        setStatus('idle');
        setAnalysisResult(null);
        setPdfContext('');
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const processFile = async (selectedFile) => {
        setStatus('uploading');
        const formData = new FormData();
        formData.append('policyPdf', selectedFile);

        try {
            setStatus('analyzing'); 
            const response = await axios.post('http://localhost:5001/api/analyze-policy', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            const data = response.data;

            setAnalysisResult({
                fraudScore: data.fraudScore,
                isFraudulent: data.isFraudulent,
                summary: data.summary
            });

            setPdfContext(data.rawTextContext);
            setStatus('complete');
        } catch (error) {
            console.error("Error analyzing policy:", error);
            setStatus('idle');
            setFile(null);
        }
    };

    const handleSend = async () => {
        if (!inputMsg.trim()) return;
        const userText = inputMsg;
        setMessages(prev => [...prev, { sender: 'user', text: userText }]);
        setInputMsg('');
        setIsChatLoading(true);

        try {
            const res = await axios.post('http://localhost:5001/api/chat-policy', {
                question: userText,
                context: pdfContext || null 
            });
            setMessages(prev => [...prev, { sender: 'bot', text: res.data.answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'bot', text: "Connection error. Please try again." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isChatOpen]);

    const formatValue = (val) => {
        if (!val || val === 'null' || val === 'undefined') return "N/A";
        return val;
    };

    return (
        <div className="pu-container">
            {/* Header Card Pattern */}
            <div className="pu-header">
                <div className="pu-header-left">
                    <button className="pu-back-btn" onClick={() => navigate(-1)}>
                        <FiArrowLeft />
                    </button>
                    <div className="pu-header-text">
                        <h1>Policy Analyzer <span className="highlight-text">& Teacher</span></h1>
                        <p>Upload your policy PDF to get AI-powered insights.</p>
                    </div>
                </div>
            </div>

            <div className="pu-main-content">
                
                {status === 'idle' && (
                    <div 
                        className={`pu-dropzone ${isDragging ? 'dragging' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <div className="icon-circle"><FiUploadCloud size={40} /></div>
                        <h3>Upload Policy or Brochure</h3>
                        <p>Get a summary of coverage, benefits, and exclusions.</p>
                        <input type="file" ref={fileInputRef} hidden accept=".pdf" onChange={handleFileSelect}/>
                    </div>
                )}

                {(status === 'uploading' || status === 'analyzing') && (
                    <div className="pu-loading-container">
                        <div className="pu-loader">
                            {status === 'uploading' ? <FiUploadCloud className="pulse"/> : <FiCpu className="spin"/>}
                        </div>
                        <h2>{status === 'uploading' ? 'Reading Document...' : 'Analyzing Terms...'}</h2>
                        <p className="loading-subtext">Extracting plan features and waiting periods...</p>
                    </div>
                )}

                {status === 'complete' && analysisResult && (
                    <div className="pu-dashboard fade-in">
                        
                        {/* ACTION BAR */}
                        <div className="pu-actions-bar">
                            <div className="file-tag"><FiFileText /> {file?.name}</div>
                            <button className="btn-reset" onClick={resetAnalysis}><FiTrash2 /> Reset</button>
                        </div>

                        {/* --- MAIN DASHBOARD GRID --- */}
                        <div className="pu-grid-layout">
                            
                            {/* 1. PROVIDER INFO */}
                            <div className="pu-card header-card">
                                <div className="provider-badge">{formatValue(analysisResult.summary?.provider)}</div>
                                <h2>{formatValue(analysisResult.summary?.policyName)}</h2>
                                <div className="policy-meta-row">
                                    <span className="meta-tag"><FiLayers/> {formatValue(analysisResult.summary?.policyType)}</span>
                                    <span className="meta-tag"><FiUser/> {formatValue(analysisResult.summary?.policyHolder)}</span>
                                </div>
                            </div>

                            {/* 2. KEY STATS */}
                            <div className="stats-row">
                                <div className="pu-card stat-card highlight">
                                    <div className="stat-label">
                                        Sum Insured Range
                                        <div className="tooltip" data-tip="Maximum coverage amount available"><FiHelpCircle/></div>
                                    </div>
                                    <div className="stat-value">{formatValue(analysisResult.summary?.sumInsured)}</div>
                                </div>
                                <div className="pu-card stat-card">
                                    <div className="stat-label">
                                        Premium / Cost
                                        <div className="tooltip" data-tip="Estimated cost or premium rules"><FiHelpCircle/></div>
                                    </div>
                                    <div className="stat-value small-text">{formatValue(analysisResult.summary?.premium)}</div>
                                </div>
                            </div>

                            {/* 3. POLICY ESSENTIALS */}
                            <div className="pu-card details-card">
                                <h3><FiInfo /> Policy Essentials</h3>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <label><FiCheckCircle/> Eligibility</label>
                                        <span>{formatValue(analysisResult.summary?.eligibility)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label><FiCalendar/> Policy Term</label>
                                        <span>{formatValue(analysisResult.summary?.policyTerm)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label><FiClock/> Waiting Periods</label>
                                        <ul className="mini-list">
                                            {analysisResult.summary?.waitingPeriods?.slice(0, 3).map((wp, i) => (
                                                <li key={i}>{wp}</li>
                                            )) || <li>No specific waiting periods found.</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* 4. KEY FEATURES */}
                            <div className="pu-card features-card">
                                <h3><FiStar /> Key Features & Benefits</h3>
                                <ul className="feature-list">
                                    {analysisResult.summary?.keyFeatures?.map((feat, i) => (
                                        <li key={i}>{formatMessage(feat)}</li>
                                    )) || <li>No features extracted.</li>}
                                </ul>
                            </div>

                            {/* 5. EXCLUSIONS */}
                            <div className="pu-card exclusions-card">
                                <h3>
                                    <FiAlertTriangle /> Major Exclusions 
                                    <span className="card-subtitle">(What is NOT covered)</span>
                                </h3>
                                <ul>
                                    {analysisResult.summary?.exclusions?.map((ex, i) => (
                                        <li key={i}>{formatMessage(ex)}</li>
                                    )) || <li>No specific exclusions detected.</li>}
                                </ul>
                            </div>

                            {/* 6. AUTHENTICITY / FOOTER */}
                            <div className={`pu-card fraud-card ${analysisResult.isFraudulent ? 'risk' : 'safe'}`}>
                                <div className="fraud-content">
                                    <div className="fraud-text">
                                        <h3>Document Analysis Score</h3>
                                        <p>{analysisResult.isFraudulent ? "Potential inconsistencies found." : "Document structure appears standard."}</p>
                                    </div>
                                    <div className="fraud-score">
                                        <span>{analysisResult.fraudScore}/100</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            {/* --- CHATBOT (Unchanged Logic) --- */}
            <div className={`pu-floating-chat ${isChatOpen ? 'open' : ''}`}>
                <button className="chat-toggle-btn" onClick={() => setIsChatOpen(!isChatOpen)}>
                    {isChatOpen ? <FiMinimize2 /> : <FiMessageSquare />}
                </button>

                {isChatOpen && (
                    <div className="chat-window">
                        <div className="chat-header-bar">
                            <div className="chat-status">
                                <span>Insurance Assistant</span>
                                <small>{status === 'complete' ? '● Reading this Policy' : '● General Help'}</small>
                            </div>
                            <FiX className="close-icon" onClick={() => setIsChatOpen(false)}/>
                        </div>
                        
                        <div className="chat-messages">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`message-row ${msg.sender}`}>
                                    <div className="bubble">{formatMessage(msg.text)}</div>
                                </div>
                            ))}
                            {isChatLoading && <div className="message-row bot"><div className="bubble typing">...</div></div>}
                            <div ref={chatEndRef}></div>
                        </div>

                        <div className="chat-input-wrapper">
                            <input 
                                placeholder="Ask about specific benefits..."
                                value={inputMsg}
                                onChange={(e) => setInputMsg(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button onClick={handleSend} disabled={!inputMsg}><FiSend/></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PolicyUploadPage;
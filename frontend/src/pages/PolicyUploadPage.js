import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    FiUploadCloud, FiFileText, FiShield, FiAlertTriangle, 
    FiCheckCircle, FiCpu, FiMessageSquare, FiSend, FiX, FiTrash2, FiMinimize2,
    FiCalendar, FiUser, FiInfo, FiHelpCircle, FiLayers, FiStar, FiClock, FiActivity
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
            {/* CLEAN HEADER (No Back Button) */}
            <div className="pu-header">
                <div className="pu-header-content">
                    <h1>Policy Analyzer <span className="highlight-text">& Teacher</span></h1>
                    <p>Upload your policy PDF to get AI-powered insights and fraud detection.</p>
                </div>
                <div className="pu-header-icon">
                    <FiUploadCloud />
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
                        <p className="loading-subtext">Extracting plan features, waiting periods, and fraud checks...</p>
                    </div>
                )}

                {status === 'complete' && analysisResult && (
                    <div className="pu-dashboard fade-in">
                        
                        {/* ACTION BAR */}
                        <div className="pu-actions-bar">
                            <div className="file-tag"><FiFileText /> {file?.name}</div>
                            <button className="btn-reset" onClick={resetAnalysis}><FiTrash2 /> Reset / Upload New</button>
                        </div>

                        {/* --- NEW LAYOUT: LEFT CONTENT vs RIGHT SIDEBAR --- */}
                        <div className="pu-layout-wrapper">
                            
                            {/* LEFT COLUMN: The Details */}
                            <div className="pu-layout-main">
                                
                                {/* 1. POLICY HEADER INFO */}
                                <div className="pu-card header-summary-card">
                                    <div className="provider-badge">{formatValue(analysisResult.summary?.provider)}</div>
                                    <h2 className="policy-title-main">{formatValue(analysisResult.summary?.policyName)}</h2>
                                    <div className="policy-chips">
                                        <span className="chip"><FiLayers/> {formatValue(analysisResult.summary?.policyType)}</span>
                                        <span className="chip"><FiUser/> {formatValue(analysisResult.summary?.policyHolder)}</span>
                                    </div>
                                </div>

                                {/* 2. ESSENTIALS GRID */}
                                <div className="pu-card">
                                    <h3><FiInfo /> Policy Essentials</h3>
                                    <div className="essentials-grid">
                                        <div className="essential-box">
                                            <label><FiCheckCircle/> Eligibility</label>
                                            <strong>{formatValue(analysisResult.summary?.eligibility)}</strong>
                                        </div>
                                        <div className="essential-box">
                                            <label><FiCalendar/> Term</label>
                                            <strong>{formatValue(analysisResult.summary?.policyTerm)}</strong>
                                        </div>
                                        <div className="essential-box wide">
                                            <label><FiClock/> Waiting Periods</label>
                                            <ul>
                                                {analysisResult.summary?.waitingPeriods?.slice(0, 3).map((wp, i) => (
                                                    <li key={i}>{wp}</li>
                                                )) || <li>No specific waiting periods found.</li>}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. FEATURES */}
                                <div className="pu-card">
                                    <h3><FiStar /> Key Features</h3>
                                    <ul className="feature-list">
                                        {analysisResult.summary?.keyFeatures?.map((feat, i) => (
                                            <li key={i}>{formatMessage(feat)}</li>
                                        )) || <li>No features extracted.</li>}
                                    </ul>
                                </div>

                                {/* 4. EXCLUSIONS */}
                                <div className="pu-card exclusions-card">
                                    <h3><FiAlertTriangle /> Major Exclusions</h3>
                                    <ul>
                                        {analysisResult.summary?.exclusions?.map((ex, i) => (
                                            <li key={i}>{formatMessage(ex)}</li>
                                        )) || <li>No specific exclusions detected.</li>}
                                    </ul>
                                </div>

                            </div>

                            {/* RIGHT COLUMN: Fraud & Stats */}
                            <div className="pu-layout-sidebar">
                                
                                {/* 1. FRAUD SCORE (Prominent) */}
                                <div className={`pu-card fraud-score-card ${analysisResult.isFraudulent ? 'risk' : 'safe'}`}>
                                    <div className="score-header">
                                        <FiShield size={24}/>
                                        <span>Trust Score</span>
                                    </div>
                                    <div className="score-circle">
                                        {analysisResult.fraudScore}
                                        <small>/100</small>
                                    </div>
                                    <p className="score-msg">
                                        {analysisResult.isFraudulent 
                                            ? "Caution: Inconsistencies found." 
                                            : "Document structure looks authentic."}
                                    </p>
                                </div>

                                {/* 2. FINANCIAL STATS */}
                                <div className="pu-card stat-card highlight">
                                    <div className="stat-label">Sum Insured Range</div>
                                    <div className="stat-value">{formatValue(analysisResult.summary?.sumInsured)}</div>
                                </div>

                                <div className="pu-card stat-card">
                                    <div className="stat-label">
                                        Premium / Cost
                                        <FiHelpCircle className="info-icon" title="Estimated cost based on document"/>
                                    </div>
                                    <div className="stat-value small">{formatValue(analysisResult.summary?.premium)}</div>
                                </div>

                                {/* 3. AI SUMMARY TIP */}
                                <div className="pu-card ai-tip-card">
                                    <FiActivity />
                                    <p>Ask the chatbot to explain "Co-pay" or "Room Rent Limits" specifically for this policy.</p>
                                </div>

                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* --- CHATBOT (Unchanged) --- */}
            <div className={`pu-floating-chat ${isChatOpen ? 'open' : ''}`}>
                <button className="chat-toggle-btn" onClick={() => setIsChatOpen(!isChatOpen)}>
                    {isChatOpen ? <FiMinimize2 /> : <FiMessageSquare />}
                </button>

                {isChatOpen && (
                    <div className="chat-window">
                        <div className="chat-header-bar">
                            <div className="chat-status">
                                <span>Insurance Assistant</span>
                                <small>{status === 'complete' ? '● Reading Policy' : '● Online'}</small>
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
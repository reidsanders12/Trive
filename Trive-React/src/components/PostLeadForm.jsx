import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import './PostLeadForm.css';

const PostLeadForm = ({ onLeadPosted }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // All Fields Restored
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [location, setLocation] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [leadType, setLeadType] = useState('Internal Referral');
    const [probability, setProbability] = useState(40);
    const [insight, setInsight] = useState('');

    const sliderRef = useRef(null);
    const thumbRef = useRef(null);
    const isDragging = useRef(false);

    useEffect(() => {
        if (!isFormVisible) return;
        const handleMove = (clientX) => {
            if (!sliderRef.current) return;
            const rect = sliderRef.current.getBoundingClientRect();
            const offsetX = clientX - rect.left;
            let percent = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
            setProbability(Math.round(percent / 10) * 10);
        };
        const onMouseMove = (e) => isDragging.current && handleMove(e.clientX);
        const stopDrag = () => { isDragging.current = false; thumbRef.current?.classList.remove('active'); };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', stopDrag);
        return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', stopDrag); };
    }, [isFormVisible]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Submit as PENDING
        const { error } = await supabase
            .from('exchanges')
            .insert([{
                company,
                role,
                location,
                tags: tagsInput.split(',').map(t => t.trim()),
                vetted_by: 'by Trive', // Visual cue for the database
                lead_type: leadType,
                probability,
                insight,
                status: 'pending' // THIS IS THE KEY CHANGE
            }]);

        if (error) {
            console.error("Error:", error.message);
        } else {
            // Show a "Submission Received" message instead of an instant reward
            alert("Lead transmitted to the vetting queue. Credits will be issued upon verification.");
            setIsFormVisible(false);
            if (onLeadPosted) onLeadPosted();
        }
        setLoading(false);
    };

    return (
        <>
            {!isFormVisible ? (
                <div className="add-lead-card-slot" onClick={() => setIsFormVisible(true)}>
                    <div className="plus-icon-container">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </div>
                    <span className="plus-card-label">Post New Lead</span>
                    <p className="plus-card-subtitle">Contribute to the Exchange</p>
                </div>
            ) : (
                <div className="form-modal-overlay">
                    {/* Liquid Filter Definition */}
                    <svg width="0" height="0" style={{ position: 'absolute' }}>
                        <filter id="mini-liquid-lens" x="-50%" y="-50%" width="200%" height="200%">
                            <feImage x="0" y="0" result="normalMap" xlinkHref="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><radialGradient id='invmap' cx='50%' cy='50%' r='75%'><stop offset='0%' stop-color='rgb(128,128,255)'/><stop offset='90%' stop-color='rgb(255,255,255)'/></radialGradient><rect width='100%' height='100%' fill='url(#invmap)'/></svg>" />
                            <feDisplacementMap in="SourceGraphic" in2="normalMap" scale="-120" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                            <feMerge><feMergeNode in="displaced" /></feMerge>
                        </filter>
                    </svg>

                    <div className="post-lead-card-modal">
                        <div className="modal-header">
                            <div>
                                <h3>Institutional Lead Transmission</h3>
                                <p className="modal-subtitle">Secure peer-to-peer data exchange protocol</p>
                            </div>
                            <button className="close-modal" onClick={() => setIsFormVisible(false)}>✕</button>
                        </div>

                        <form className="lead-form" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="input-group"><label>COMPANY</label><input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Apple" required /></div>
                                <div className="input-group"><label>ROLE ARCHITECTURE</label><input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Software Engineer" required /></div>
                            </div>

                            <div className="form-grid">
                                <div className="input-group"><label>LOCATION</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Cupertino, CA" required /></div>
                                <div className="input-group">
                                    <label>LEAD TYPE</label>
                                    <select value={leadType} onChange={e => setLeadType(e.target.value)}>
                                        <option value="" disabled>Select Protocol...</option>
                                        <option value="Internal Referral">Internal Referral</option>
                                        <option value="Direct Recruiter Link">Direct Recruiter Link</option>
                                        <option value="Priority Application">Priority Application</option>
                                        <option value="Vetted Backdoor">Vetted Backdoor</option>
                                    </select>
                                </div>
                            </div>

                            <div className="input-group"><label>STACK TAGS (COMMA SEPARATED)</label><input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="React, Python, AWS" required /></div>

                            <div className="slider-section">
                                <label className="slider-label">INTERVIEW PROBABILITY: <span className="prob-value">{probability}%</span></label>
                                <div className="slider-container" ref={sliderRef} onMouseDown={() => { isDragging.current = true; thumbRef.current.classList.add('active'); }}>
                                    <div className="slider-progress" style={{ width: `${probability}%` }}></div>
                                    <div className="slider-thumb-glass" ref={thumbRef} style={{ left: `${probability}%` }} onMouseDown={(e) => { e.preventDefault(); isDragging.current = true; thumbRef.current.classList.add('active'); }}>
                                        <div className="slider-thumb-glass-filter"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="input-group"><label>VETTED CONTEXT & INSIGHTS</label><textarea rows="3" value={insight} onChange={e => setInsight(e.target.value)} placeholder="Share specific advice or requirements..." required /></div>

                            <button type="submit" className="btn-main submit-btn" disabled={loading}>
                                {loading ? 'INITIATING TRANSMISSION...' : 'SUBMIT TO EXCHANGE'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default PostLeadForm;
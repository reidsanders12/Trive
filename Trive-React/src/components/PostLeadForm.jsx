import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './PostLeadForm.css';

const PostLeadForm = ({ onLeadPosted }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // Streamlined, High-Value Data Asset Fields
    const [targetUrl, setTargetUrl] = useState('');
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [location, setLocation] = useState('');
    const [insight, setInsight] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                alert("Session expired. Please log in to transmit data assets.");
                setLoading(false);
                return;
            }

            // Insert cleanly structured student inputs directly into the holding queue
            const { error } = await supabase
                .from('exchanges')
                .insert([{
                    user_id: session.user.id,
                    company: company.trim(),
                    role: role.trim(),
                    location: location.trim(),
                    tags: ["Verified Link", "Community Logged"],
                    vetted_by: 'by Trive Verification Queue',
                    lead_type: 'Direct Recruiter Link',
                    probability: 50, // Standard baseline initialization
                    insight: `[Verification Link: ${targetUrl.trim()}] \n\nPipeline Intelligence & Logs: ${insight.trim()}`,
                    status: 'pending' // Held secure for data vetting before deployment to main feed
                }]);

            if (error) throw error;

            alert(`Lead transmitted! "${role} at ${company}" has been sent to the institutional queue. Credits will post to your wallet upon confirmation.`);
            
            // Clear out all states
            setTargetUrl('');
            setCompany('');
            setRole('');
            setLocation('');
            setInsight('');
            setIsFormVisible(false);
            
            if (onLeadPosted) onLeadPosted();
            
        } catch (error) {
            console.error("Transmission Failure:", error.message);
            alert("Failed to securely route transmission: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {!isFormVisible ? (
                <div className="add-lead-card-slot" onClick={() => setIsFormVisible(true)}>
                    <div className="plus-icon-container">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                    <span className="plus-card-label">Post New Lead</span>
                    <p className="plus-card-subtitle">Log Application & Pipeline Assets</p>
                </div>
            ) : (
                <div className="form-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
                    <div className="post-lead-card-modal" style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflowY: 'auto', maxHeight: '90vh' }}>
                        
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', textAlign: 'left' }}>Institutional Lead Transmission</h3>
                                <p className="modal-subtitle" style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', textAlign: 'left' }}>Log core parameters along with a verification source link</p>
                            </div>
                            <button className="close-modal" onClick={() => setIsFormVisible(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>✕</button>
                        </div>

                        <form className="lead-form" onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                            
                            {/* Input: Verification Link */}
                            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', textAlign: 'left' }}>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Application Source URL</label>
                                <input 
                                    type="url" required placeholder="Paste the application link or job board URL as proof..." 
                                    value={targetUrl} onChange={e => setTargetUrl(e.target.value)}
                                    style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                                />
                            </div>

                            {/* Row: Company & Position */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Target Company</label>
                                    <input 
                                        type="text" required placeholder="e.g. Stripe" 
                                        value={company} onChange={e => setCompany(e.target.value)}
                                        style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                                    />
                                </div>
                                <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Position Architecture</label>
                                    <input 
                                        type="text" required placeholder="e.g. Frontend Intern" 
                                        value={role} onChange={e => setRole(e.target.value)}
                                        style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                                    />
                                </div>
                            </div>

                            {/* Input: Location */}
                            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', textAlign: 'left' }}>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Geographic Vector (Location)</label>
                                <input 
                                    type="text" required placeholder="e.g. New York, NY or Remote" 
                                    value={location} onChange={e => setLocation(e.target.value)}
                                    style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                                />
                            </div>

                            {/* Input: Context & Insights */}
                            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px', textAlign: 'left' }}>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Vetted Context & Interview Insights</label>
                                <textarea 
                                    rows="3" required placeholder="What are they looking for? Drop any details about the timeline, OA questions, or hiring managers..." 
                                    value={insight} onChange={e => setInsight(e.target.value)}
                                    style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
                                />
                            </div>

                            {/* Submit */}
                            <button 
                                type="submit" className="btn-main submit-btn" disabled={loading}
                                style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', fontWeight: '700', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
                            >
                                {loading ? 'TRANSMITTING ASSET...' : 'SUBMIT TO LIQUIDITY QUEUE'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default PostLeadForm;
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const MyPortfolio = ({ userId, currentCredits }) => {
    const [activeTab, setActiveTab] = useState('submissions');
    const [mySubmissions, setMySubmissions] = useState([]);
    const [unlockedLeads, setUnlockedLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchPortfolioData();
        }
    }, [userId, activeTab]);

    const fetchPortfolioData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'submissions') {
                // Fetch assets posted explicitly by this user node
                const { data, error } = await supabase
                    .from('exchanges')
                    .select('id, company, role, location, status, created_at')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });
                
                if (!error) setMySubmissions(data || []);
            } else if (activeTab === 'unlocked') {
                // Fetch leads this student has spent credits to unlock
                // (Assumes a structured 'unlocked_leads' join table mapping user_id to exchange_id)
                const { data, error } = await supabase
                    .from('unlocked_leads')
                    .select('exchange_id, exchanges(company, role, location, insight)')
                    .eq('user_id', userId);
                
                if (!error && data) {
                    const flattened = data.map(item => item.exchanges).filter(Boolean);
                    setUnlockedLeads(flattened);
                }
            }
        } catch (err) {
            console.error("Failed to sync portfolio metrics:", err);
        }
        setLoading(false);
    };

    const tabStyle = (tabName) => ({
        padding: '10px 16px',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        background: activeTab === tabName ? '#ffffff' : 'transparent',
        color: activeTab === tabName ? '#2563eb' : '#64748b',
        border: 'none',
        borderRadius: '6px',
        boxShadow: activeTab === tabName ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        transition: 'all 0.2s ease'
    });

    return (
        <div className="portfolio-terminal-container" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', textAlign: 'left', marginTop: '24px' }}>
            
            {/* Header / Wallet Vector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>Private Asset Terminal</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Manage your verified data entries and unlocked nodes</p>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '8px 14px', borderRadius: '8px', textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase' }}>Wallet Balance</span>
                    <strong style={{ fontSize: '18px', color: '#2563eb', fontWeight: '800' }}>{currentCredits} TC</strong>
                </div>
            </div>

            {/* Terminal Navigation Bar */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', marginBottom: '20px' }}>
                <button onClick={() => setActiveTab('submissions')} style={tabStyle('submissions')}>My Data Transmissions</button>
                <button onClick={() => setActiveTab('unlocked')} style={tabStyle('unlocked')}>Unlocked Intelligence ({unlockedLeads.length})</button>
            </div>

            {/* Core Workspace Output View */}
            {loading ? (
                <div style={{ padding: '30px 0', textAlign: 'center', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>Decrypting portfolio logs...</div>
            ) : activeTab === 'submissions' ? (
                <div>
                    {mySubmissions.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>You haven't transmitted any pipeline links yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {mySubmissions.map((asset) => {
                                const isPending = asset.status === 'pending';
                                return (
                                    <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                        <div>
                                            <strong style={{ fontSize: '14px', color: '#1e293b', display: 'block' }}>{asset.company}</strong>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>{asset.role} • {asset.location}</span>
                                        </div>
                                        <span style={{ 
                                            fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase',
                                            background: isPending ? '#fef3c7' : '#d1fae5',
                                            color: isPending ? '#d97706' : '#059669'
                                        }}>
                                            {isPending ? '⏳ Vetting Queue' : '✅ Active Feed'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {unlockedLeads.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>No intelligence nodes unlocked in this epoch.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {unlockedLeads.map((lead, idx) => (
                                <div key={idx} style={{ padding: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                                    <div style={{ marginBottom: '6px' }}>
                                        <strong style={{ fontSize: '14px', color: '#14532d' }}>{lead.company}</strong>
                                        <span style={{ fontSize: '12px', color: '#15803d', marginLeft: '8px' }}>({lead.role})</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#1e3a1e', fontStyle: 'italic' }}>"{lead.insight}"</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyPortfolio;
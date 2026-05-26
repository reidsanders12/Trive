import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const SchoolLeaderboard = () => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboardData();
    }, []);

    const fetchLeaderboardData = async () => {
        setLoading(true);
        // Query the live SQL view we generated in Supabase
        const { data, error } = await supabase
            .from('school_leaderboard')
            .select('*')
            .limit(5); // Show top 5 institutions for high-density UI layout

        if (!error && data) {
            setRankings(data);
        } else {
            console.error("Error reading leaderboard matrix:", error);
        }
        setLoading(false);
    };

    return (
        <div className="school-leaderboard-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>Institutional Index</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Network intelligence volume ranking</p>
                </div>
                <button onClick={fetchLeaderboardData} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: '12px', fontWeight: '600' }} title="Sync Live Database Rows">
                    ⟳ Sync
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '20px 0', fontSize: '13px', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>Calculating campus metrics...</div>
            ) : rankings.length === 0 ? (
                <div style={{ padding: '20px 0', fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>No network blocks initialized.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {rankings.map((row, index) => {
                        const rankColors = ['#f59e0b', '#94a3b8', '#b45309']; // Gold, Silver, Bronze indices
                        const isTopThree = index < 3;
                        
                        return (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '0' }}>
                                    {/* Numeric Badging */}
                                    <span style={{ 
                                        fontSize: '12px', fontWeight: '800', width: '20px', height: '20px', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                                        background: isTopThree ? rankColors[index] : '#e2e8f0',
                                        color: isTopThree ? '#ffffff' : '#475569'
                                    }}>
                                        {index + 1}
                                    </span>
                                    
                                    {/* School Information */}
                                    <div style={{ minWidth: '0' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {row.university}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                                            {row.total_active_students} student nodes
                                        </div>
                                    </div>
                                </div>

                                {/* Metric Readout Output */}
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#2563eb' }}>
                                        {row.cleared_data_nodes} Nodes
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#10b981', fontWeight: '600' }}>
                                        🎯 {row.offers_secured} Offers
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SchoolLeaderboard;
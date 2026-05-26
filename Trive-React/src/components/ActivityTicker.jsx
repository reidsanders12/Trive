import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ActivityTicker = () => {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        fetchInitialActivity();

        // Establish live WebSocket channel subscription to the database rows
        const channel = supabase
            .channel('live-exchange-feed')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'pipeline_tracker' },
                async (payload) => {
                    // When a row is inserted, fetch the company details to format the alert nicely
                    const { data: exchange } = await supabase
                        .from('exchanges')
                        .select('company, role')
                        .eq('id', payload.new.exchange_id)
                        .single();

                    if (exchange) {
                        const newEvent = {
                            id: payload.new.id,
                            company: exchange.company,
                            role: exchange.role,
                            stage: payload.new.current_stage,
                            timestamp: 'Just Now',
                            isNew: true // Used for visual pulse animation triggering
                        };
                        // Inject into frontend array queue
                        setActivities(prev => [newEvent, ...prev.slice(0, 4)]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchInitialActivity = async () => {
        // Hydrate feed with the latest 4 tracking logs
        const { data: trackerRows } = await supabase
            .from('pipeline_tracker')
            .select('id, current_stage, exchange_id')
            .order('id', { ascending: false })
            .limit(4);

        if (trackerRows && trackerRows.length > 0) {
            const formatted = await Promise.all(trackerRows.map(async (row) => {
                const { data: exchange } = await supabase
                    .from('exchanges')
                    .select('company, role')
                    .eq('id', row.exchange_id)
                    .single();

                return {
                    id: row.id,
                    company: exchange?.company || 'Corporate Network',
                    role: exchange?.role || 'Internship Track',
                    stage: row.current_stage,
                    timestamp: 'Recent',
                    isNew: false
                };
            }));
            setActivities(formatted);
        }
    };

    return (
        <div className="activity-ticker-card" style={{ background: '#0f172a', color: '#f8fafc', borderRadius: '12px', padding: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', textAlign: 'left', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }}></span>
                <h4 style={{ margin: 0, fontSize: '12px', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#94a3b8' }}>The Wire // Live Pipeline Logs</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activities.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>Awaiting transmission logs...</p>
                ) : (
                    activities.map((act) => {
                        // Color indices for different pipeline actions
                        const stageColors = {
                            'Offer': '#10b981',
                            'Interview': '#3b82f6',
                            'OA Invite': '#a855f7',
                            'Rejected': '#ef4444',
                            'Applied': '#64748b'
                        };

                        return (
                            <div 
                                key={act.id} 
                                style={{ 
                                    fontSize: '13px', 
                                    padding: '8px 10px', 
                                    background: 'rgba(30, 41, 59, 0.5)', 
                                    borderRadius: '6px', 
                                    borderLeft: `3px solid ${stageColors[act.stage] || '#cbd5e1'}`,
                                    animation: act.isNew ? 'flashPulse 1.5s ease-out' : 'none'
                                }}
                            >
                                <span style={{ color: '#64748b', fontSize: '11px', marginRight: '6px', fontFamily: 'monospace' }}>[{act.timestamp}]</span>
                                Student node updated <strong style={{ color: '#ffffff' }}>{act.company}</strong> ({act.role}) ➔ <span style={{ color: stageColors[act.stage], fontWeight: '700' }}>{act.stage}</span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Micro CSS animation injection for flash alerts */}
            <style>{`
                @keyframes flashPulse {
                    0% { background: rgba(37, 99, 235, 0.4); }
                    100% { background: rgba(30, 41, 59, 0.5); }
                }
            `}</style>
        </div>
    );
};

export default ActivityTicker;
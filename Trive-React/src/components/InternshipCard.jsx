import React, { useState, useEffect } from 'react';
import './InternshipCard.css';

const InternshipCard = ({ data, userCredits, onPurchase, onStatusUpdate }) => {
  const [isRevealed, setIsRevealed] = useState(data?.isAlreadyUnlocked || false);
  const [selectedStage, setSelectedStage] = useState("");
  const [stageNotes, setStageNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setIsRevealed(data?.isAlreadyUnlocked || false);
  }, [data?.isAlreadyUnlocked]);

  const handleUnlock = async () => {
    if (userCredits >= data.cost) {
      const success = await onPurchase(data.cost);
      if (success) setIsRevealed(true);
    } else {
      alert(`Insufficient funds. You need ${data.cost} TC to unlock this pipeline data.`);
    }
  };

  const handleSubmitStatus = async () => {
    if (!selectedStage) return;
    
    setSubmitting(true);
    // CRITICAL FIX: Sends stage AND text notes to align exactly with App.jsx
    await onStatusUpdate(selectedStage, stageNotes);
    setSubmitting(false);
    
    setSelectedStage(""); // Collapse form drawer
    setStageNotes("");    // Reset text field
  };

  return (
    <div className={`trive-card ${isRevealed ? 'revealed' : 'locked'}`}>
      {/* Header Info */}
      <div className="card-header">
        <div className="company-logo">{data.company}</div>
        <div className="live-pulse">
          <span className="pulse-dot"></span>
          Active Pipeline
        </div>
      </div>

      <div className="role-info">
        <h3>{data.role}</h3>
        <div className="role-tags">{data.tags ? data.tags.join(' • ') : ''}</div>
      </div>

      {/* Dynamic Status Bar - FIXED APPLICANT COUNT */}
      <div className="pipeline-summary-row">
        <div className="metric">
          <span className="metric-label">Tracking:</span>
          {/* Replaced '|| 12' fallback with real live dynamic data defaults */}
          <strong className="metric-value">{data.applicantCount || 0} Students</strong>
        </div>
        {!isRevealed && (
          <div className="tc-badge cost-badge">{data.cost} TC to Unlock</div>
        )}
      </div>

      {/* CONTRIBUTE ANONYMOUS DATA WITH TEXT DRAWER */}
      <div className="contribute-flow-box">
        <div className="contribute-data-zone">
          <label>Your Status:</label>
          <select 
            value={selectedStage} 
            onChange={(e) => setSelectedStage(e.target.value)}
            disabled={submitting}
          >
            <option value="">-- Update to earn +10 TC --</option>
            <option value="Applied">Applied</option>
            <option value="OA Invite">Received OA</option>
            <option value="Interview">Interviewing</option>
            <option value="Offer">Received Offer</option>
            <option value="Rejected">Rejected/Ghosted</option>
          </select>
        </div>

        {selectedStage && (
          <div className="notes-input-drawer">
            <textarea 
              placeholder={`Optional: Record what happened during your "${selectedStage}" phase... (e.g., test questions, formats, interview answers)`}
              value={stageNotes}
              onChange={(e) => setStageNotes(e.target.value)}
              rows="3"
            />
            <button className="submit-log-btn" onClick={handleSubmitStatus} disabled={submitting}>
              {submitting ? 'Committing...' : 'Commit Intel (+10 TC)'}
            </button>
          </div>
        )}
      </div>

      {/* INTELLIGENCE GATE */}
      <div className="intelligence-gate">
        {isRevealed ? (
          <div className="unlocked-content">
            <h4 className="matrix-title">Anonymized Cohort Timelines</h4>
            <div className="pipeline-matrix">
              <div className="matrix-row">
                <span>Applied / Processing:</span>
                <strong>{data.stats?.applied || 0}%</strong>
              </div>
              <div className="matrix-row alert-row">
                <span>Hit with OAs:</span>
                <strong>{data.stats?.oa || 0}%</strong>
              </div>
              <div className="matrix-row success-row">
                <span>Advanced to Interviews:</span>
                <strong>{data.stats?.interview || 0}%</strong>
              </div>
              <div className="matrix-row offer-row">
                <span>Offers Secured:</span>
                <strong>{data.stats?.offer || 0}%</strong>
              </div>
              <div className="matrix-row text-slate" style={{ color: '#64748b' }}>
                <span>Rejected / Ghosted:</span>
                <strong>{data.stats?.rejected || 0}%</strong>
              </div>
            </div>

            {/* LIVE DATA: ANONYMOUS TEXT INTELLIGENCE LOGS */}
            <div className="intel-logs-container">
              <h4 className="matrix-title" style={{ marginTop: '15px' }}>Anonymous Intelligence Logs</h4>
              {data.liveIntelligenceLogs && data.liveIntelligenceLogs.length > 0 ? (
                <div className="log-scroller">
                  {data.liveIntelligenceLogs.map((log, index) => (
                    <div key={index} className="intel-log-bubble">
                      <span className="log-badge-stage">{log.stage}</span>
                      <p>"{log.text}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-logs-text">No test intelligence records submitted for this cohort yet.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="locked-overlay">
            <button className="cta-button" onClick={handleUnlock}>
              Unlock Institutional Timelines & Logs
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternshipCard;
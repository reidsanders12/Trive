import React, { useState, useEffect } from 'react';
import './InternshipCard.css';

const InternshipCard = ({ data, userCredits, onPurchase }) => {
  // Use the database status to determine if it is unlocked on page load
  const [isRevealed, setIsRevealed] = useState(data?.isAlreadyUnlocked || false);

  // Sync state cleanly if the listings refresh
  useEffect(() => {
    setIsRevealed(data?.isAlreadyUnlocked || false);
  }, [data?.isAlreadyUnlocked]);

  if (!data) return null;

  const handleUnlock = async () => {
    const cost = data.cost || 50;
    
    if (userCredits >= cost) {
      // Wait for backend validation
      const transactionApproved = await onPurchase(cost); 
      if (transactionApproved) {
        setIsRevealed(true);
      }
    } else {
      alert(`Insufficient Credits. You need ${cost} TC to unlock this lead.`);
    }
  };

  return (
    <div className={`trive-card ${isRevealed ? 'revealed' : 'locked'}`}>
      <div className="card-header">
        <div className="company-logo">{data.company}</div>
        <div className="vetted-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Vetted {data.vettedBy}
        </div>
      </div>

      <div className="role-info">
        <h3>{data.role}</h3>
        <div className="role-tags">{data.tags ? data.tags.join(' • ') : ''}</div>
      </div>

      <div className="trade-details">
        <div className="detail-row">
          <span className="label">Lead Type:</span>
          <span className="value">{data.leadType}</span>
        </div>
        {!isRevealed && (
          <div className="lead-cost-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span className="exchange-label" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--slate)' }}>
              Exchange Cost:
            </span>
            <div className="tc-badge">{data.cost || 50} TC</div>
          </div>
        )}
      </div>

      <div className="intelligence-gate">
        {isRevealed ? (
          <div className="unlocked-content">
            <div className="probability-container">
              <div className="prob-text">
                <span>Probability ({data.probability}%)</span>
                <span style={{ color: '#94a3b8' }}>Verified</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${data.probability}%` }}></div>
              </div>
            </div>
            <div className="insight-box">
              <p><strong>INSIDER INSIGHT:</strong> "{data.insight}"</p>
            </div>
          </div>
        ) : (
          <div className="locked-overlay">
            <div className="blur-overlay" style={{ textAlign: 'center', padding: '15px 0', color: '#64748b' }}>
              <p>🔒 Secret intelligence hidden</p>
            </div>
            <button className="cta-button" onClick={handleUnlock}>
              Unlock Intelligence
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
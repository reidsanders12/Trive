import React from 'react';
import './InternshipCard.css';

const InternshipCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="trive-card">
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
        <div className="role-tags">{data.tags.join(' • ')}</div>
      </div>

      <div className="trade-details">
        <div className="detail-row">
          <span className="label">Lead Type:</span>
          <span className="value">{data.leadType}</span>
        </div>
        <div className="detail-row">
          <span className="label">Exchange Cost:</span>
          <span className="cost-value">$TRIVE {data.cost}</span>
        </div>
      </div>

      <div className="probability-container">
        <div className="prob-text">
          <span>Probability ({data.probability}%)</span>
          <span style={{color: '#94a3b8'}}>Posted {data.postedDate}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${data.probability}%` }}></div>
        </div>
      </div>

      <div className="insight-box">
        <p><strong>INSIDER INSIGHT:</strong> "{data.insight}"</p>
      </div>

      <button className="cta-button">View Full Details</button>
    </div>
  );
};

export default InternshipCard;
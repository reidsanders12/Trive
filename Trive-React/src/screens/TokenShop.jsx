import React, { useState } from 'react';
import './TokenShop.css';

const TIER_OPTIONS = [
  { id: 'tier_tier1', name: 'Analyst Access', credits: 100, price: 9.99, description: 'Perfect for unlocking 2 high-priority insider leads.', popular: false },
  { id: 'tier_tier2', name: 'Associate Tier', credits: 300, price: 24.99, description: 'Best value for active recruiting cycles.', popular: true },
  { id: 'tier_tier3', name: 'MD Institutional', credits: 700, price: 49.99, description: 'Unlimited premium networking and full pipeline vetting.', popular: false },
];

const TokenShop = ({ onClose, onPurchaseComplete }) => {
  const [processingId, setProcessingId] = useState(null);

  const handleCheckout = async (tier) => {
    setProcessingId(tier.id);
    
    // Simulate payment gateway delay (Stripe/Apple Pay mock)
    setTimeout(async () => {
      const success = await onPurchaseComplete(tier.credits);
      setProcessingId(null);
      if (success) {
        alert(`Successfully provisioned ${tier.credits} TC to your institutional wallet!`);
        onClose();
      }
    }, 1200);
  };

  return (
    <div className="shop-modal-backdrop">
      <div className="shop-modal-container">
        <div className="shop-header">
          <div>
            <h2>Capital Injection Window</h2>
            <p>Purchase Trive Credits (TC) to instantly bypass information asymmetry.</p>
          </div>
          <button className="close-shop-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="tier-grid">
          {TIER_OPTIONS.map((tier) => (
            <div key={tier.id} className={`tier-card ${tier.popular ? 'popular' : ''}`}>
              {tier.popular && <span className="popular-badge">MOST POPULAR</span>}
              <h3>{tier.name}</h3>
              <div className="tier-token-amount">{tier.credits} <span className="unit">TC</span></div>
              <p className="tier-desc">{tier.description}</p>
              <div className="tier-price">${tier.price}</div>
              
              <button 
                className={`purchase-tier-btn ${tier.popular ? 'btn-primary' : 'btn-secondary'}`}
                disabled={processingId !== null}
                onClick={() => handleCheckout(tier)}
              >
                {processingId === tier.id ? 'Processing Escrow...' : `Buy ${tier.credits} TC`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TokenShop;
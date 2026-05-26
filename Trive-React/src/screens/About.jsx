import React from 'react';
import './About.css'; 

const AboutPage = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        
        {/* Left Side: The Market Mechanics */}
        <div className="about-content">
          <span className="about-tagline">The Institutional Core</span>
          <h2 className="about-title">The Career Liquidity Protocol.</h2>
          
          <p className="about-text">
            Traditional recruiting systems are fundamentally broken. Highly qualified talent gets buried under millions of unverified spam applications, while students waste immense energy shouting into black-box corporate tracking algorithms. 
          </p>
          
          <p className="about-text">
            Trive changes the dynamic by introducing a structured, double-sided data exchange. We treat hiring pipelines like live financial markets, allowing students to log real-time interview intelligence, track actual cohort progression, and turn their localized academic insight into functional ecosystem capital.
          </p>

          <p className="about-text" style={{ fontWeight: '700', color: '#2563eb' }}>
            By enforcing authenticated domain parameters and clean metric tracking, we build a high-fidelity talent index that bypasses corporate gatekeepers entirely. Students earn market utility for verifying the board, and recruiters gain programmatic access to high-demand student cohorts.
          </p>
        </div>

        {/* Right Side: The Ecosystem Pillars */}
        <div className="about-pillars">
          <div className="pillar-card">
            <div className="pillar-num">01</div>
            <h3>Validated Networks</h3>
            <p>Every node on the exchange is verified via dynamic API domain matching, ensuring a pure, spam-free ecosystem composed exclusively of active university peers.</p>
          </div>

          <div className="pillar-card">
            <div className="pillar-num">02</div>
            <h3>Asymmetric Alpha</h3>
            <p>Gain a direct competitive edge by unlocking crowd-sourced pipeline milestones, interview logs, and critical operational updates hours before they hit the public market.</p>
          </div>

          <div className="pillar-card">
            <div className="pillar-num">03</div>
            <h3>Data Pre-Structuring</h3>
            <p>By transforming raw student backgrounds into structured tracking profiles, we create a secure, searchable talent directory ready for premium enterprise institutional deployment.</p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutPage;
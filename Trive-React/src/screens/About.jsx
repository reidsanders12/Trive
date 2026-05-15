import React from 'react';
import './About.css'; // Make sure About.css is in this same screens folder

const AboutPage = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        
        {/* Left Side: The Story/Mission */}
        <div className="about-content">
          <span className="about-tagline">Why We Built Trive</span>
          <h2 className="about-title">Decentralizing the Network.</h2>
          
          <p className="about-text">
            Securing an internship shouldn't depend on who your parents know or how lucky you get with an algorithm. The reality of the job market is that the best opportunities are rarely found on public job boards—they live within hidden networks and personal connections.
          </p>
          
          <p className="about-text">
            Trive was born out of a real frustration. After watching classmates and close peers struggle to break through traditional application walls, it became obvious that the system was broken. While individual students have powerful, isolated networks, there was no centralized mechanism to share that access.
          </p>

          <p className="about-text font-semibold text-navy">
            We built Trive to change that. By creating a high-trust exchange, students can leverage their verified university networks to swap leads, trade warm intros, and open doors for one another. 
          </p>
        </div>

        {/* Right Side: The Core Pillars */}
        <div className="about-pillars">
          <div className="pillar-card">
            <div className="pillar-num">01</div>
            <h3>Peer-to-Peer Capital</h3>
            <p>Turn your personal network into a structural asset that helps your community thrive.</p>
          </div>

          <div className="pillar-card">
            <div className="pillar-num">02</div>
            <h3>Verified Integrity</h3>
            <p>Every lead and connection is vetted via trive verification to completely eliminate spam.</p>
          </div>

          <div className="pillar-card">
            <div className="pillar-num">03</div>
            <h3>Zero-Friction Exchange</h3>
            <p>Trade access seamlessly using our transparent credit system. No gatekeepers, just utility.</p>
          </div>
        </div>

      </div>
    </section>
  );
};

// This matches the default import name you used in App.jsx
export default AboutPage;
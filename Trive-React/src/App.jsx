import React from 'react'
import './App.css'
import InternshipCard from './components/InternshipCard'

function App() {
  // We can map this array to show multiple cards later
  const featuredExchanges = [
    {
      company: "Amazon",
      role: "Software Engineer Intern (Frontend)",
      location: "Seattle/Remote",
      tags: ["React", "TypeScript", "Tailwind"],
      vettedBy: "Lehigh",
      leadType: "Internal Referral",
      cost: 50,
      probability: 75,
      postedDate: "1d Ago",
      insight: "Focus portfolio on complex React state management examples. They emphasize performance."
    }
  ];

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-logo">trive</div>
        <div className="nav-links">
          <a href="#feed">The Trade</a>
          <a href="#about">About</a>
          <button className="nav-btn-secondary">Log In</button>
          <button className="nav-btn-primary">Join the Exchange</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <h1 className="hero-title">Trade access.<br />Thrive together.</h1>
        <p className="hero-subtitle">
          The high-trust exchange for students to swap internship leads and 
          secure their future in a stress-free environment.
        </p>
        <div className="hero-actions">
          <button className="btn-main">Verify & Join</button>
          <button className="btn-text">How It Works →</button>
        </div>
      </header>

      {/* Featured Feed Section */}
      <section id="feed" className="feed-section">
        <div className="section-header">
          <h2>Active Internship Exchanges</h2>
          <p>Verified leads from your university network.</p>
        </div>
        
        <div className="card-grid">
          {featuredExchanges.map((exchange, index) => (
            <InternshipCard key={index} data={exchange} />
          ))}
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="footer">
        <p>© 2026 Trive. Built for the Lehigh CSB Community.</p>
      </footer>
    </div>
  )
}

export default App
import React, { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabaseClient'
import InternshipCard from './components/InternshipCard'
import AboutPage from './screens/About'
import Login from './screens/Login'
import CreateAccount from './screens/CreateAccount'
import PostLeadForm from './components/PostLeadForm'

function App() {
const [showLoginModal, setShowLoginModal] = useState(null);
const [user, setUser] = useState(null);
const [credits, setCredits] = useState(0); // TC Balance
const [exchanges, setExchanges] = useState([]);
const [loadingExchanges, setLoadingExchanges] = useState(true);

// 1. Session & Profile Management
useEffect(() => {
// Check current session
supabase.auth.getSession().then(({ data: { session } }) => {
setUser(session?.user ?? null);
if (session?.user) fetchProfile(session.user.id);
});

// Listen for auth changes
const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
setUser(session?.user ?? null);
if (session?.user) {
fetchProfile(session.user.id);
} else {
setCredits(0); // Reset balance on logout
}
});

return () => subscription.unsubscribe();
}, []);

// 2. Fetch TC Balance from Profiles table
const fetchProfile = async (userId) => {
const { data, error } = await supabase
.from('profiles')
.select('credits')
.eq('id', userId)
.single();
if (!error && data) {
setCredits(data.credits);
}
};

// 3. Fetch Lead Exchanges
const fetchApprovedExchanges = async () => {
setLoadingExchanges(true);
const { data, error } = await supabase
.from('exchanges')
.select('*')
.eq('status', 'approved')
.order('created_at', { ascending: false });

if (!error && data) {
const formatted = data.map(item => ({
company: item.company,
role: item.role,
location: item.location,
tags: item.tags,
vettedBy: item.vetted_by || 'Trive Approved',
leadType: item.lead_type,
cost: item.cost || 50,
probability: item.probability,
insight: item.insight,
postedDate: 'Verified'
}));
setExchanges(formatted);
}
setLoadingExchanges(false);
};

useEffect(() => {
fetchApprovedExchanges();
}, []);

const handleLogout = async () => {
await supabase.auth.signOut();
};

return (
<div className="app-container">
{/* Navigation */}
<nav className="navbar">
<div className="nav-logo">trive</div>
<div className="nav-links">
<a href="#feed">The Trade</a>
<a href="#about">About</a>

{user ? (
<div className="nav-profile-group">
<div className="balance-display">
<span className="balance-label">WALLET</span>
<div className="tc-badge">{credits} TC</div>
</div>
<div className="user-info-stack">
<span className="user-email">{user.email}</span>
<span className="account-status">Institutional Access</span>
</div>
<button className="nav-btn-secondary" onClick={handleLogout}>Log Out</button>
</div>
) : (
<div className="nav-auth-actions">
<button className="nav-btn-secondary" onClick={() => setShowLoginModal('login')}>Log In</button>
<button className="nav-btn-primary" onClick={() => setShowLoginModal('signup')}>Join the Exchange</button>
</div>
)}
</div>
</nav>

{/* Hero Section */}
<header className="hero-section">
<h1 className="hero-title">Trade access.<br />Thrive together.</h1>
<p className="hero-subtitle">
The high-trust exchange for students to swap internship leads and secure their future in a stress-free environment.
</p>
{!user && (
<div className="hero-actions">
<button className="btn-main" onClick={() => setShowLoginModal('signup')}>Verify & Join</button>
<button className="btn-text">How It Works →</button>
</div>
)}
</header>

{/* Feed Section */}
<section id="feed" className="feed-section">
<div className="section-header">
<h2>Active Internship Exchanges</h2>
<p>Verified institutional leads from your university network.</p>
</div>

<div className="card-grid">
{/* Post Lead Entry Point (Plus Card) */}
{user && (
<PostLeadForm onLeadPosted={() => {
fetchApprovedExchanges();
fetchProfile(user.id); // Refresh credits if posting earns them
}} />
)}

{loadingExchanges ? (
<div className="loading-state">Querying database rows...</div>
) : exchanges.length === 0 ? (
<p className="empty-feed-text">No active leads in this epoch.</p>
) : (
exchanges.map((exchange, index) => (
<InternshipCard key={index} data={exchange} />
))
)}
</div>
</section>

<AboutPage />

{/* Modals */}
{showLoginModal === 'login' && (
<Login
onLoginSuccess={(loggedUser) => { setUser(loggedUser); setShowLoginModal(null); }}
onClose={() => setShowLoginModal(null)}
/>
)}
{showLoginModal === 'signup' && (
<CreateAccount
onSignupSuccess={(registeredUser) => { setUser(registeredUser); setShowLoginModal(null); }}
onClose={() => setShowLoginModal(null)}
/>
)}

<footer className="footer">
<p>© 2026 Trive. Built for the University Exchange Community.</p>
</footer>
</div>
)
}

export default App
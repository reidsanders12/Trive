import React, { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabaseClient'
import InternshipCard from './components/InternshipCard'
import AboutPage from './screens/About'
import Login from './screens/Login'
import CreateAccount from './screens/CreateAccount'
import PostLeadForm from './components/PostLeadForm'
import TokenShop from './screens/TokenShop'

function App() {
    const [showLoginModal, setShowLoginModal] = useState(null);
    const [user, setUser] = useState(null);
    const [credits, setCredits] = useState(0);
    const [exchanges, setExchanges] = useState([]);
    const [loadingExchanges, setLoadingExchanges] = useState(true);
    const [showShopModal, setShowShopModal] = useState(false);

    // 1. Session & Profile Management
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session?.user) {
                setCredits(0);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Trigger data fetch when user state is resolved
    useEffect(() => {
        fetchProfileAndExchanges();
    }, [user]);

    const fetchProfileAndExchanges = async () => {
        setLoadingExchanges(true);
        let currentUserId = user?.id || null;
        let purchasedIds = [];

        // Fetch credits and purchases if logged in
        if (currentUserId) {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('credits')
                .eq('id', currentUserId)
                .single();
            if (profileData) setCredits(profileData.credits);

            const { data: purchaseData } = await supabase
                .from('purchases')
                .select('exchange_id')
                .eq('user_id', currentUserId);
            if (purchaseData) {
                purchasedIds = purchaseData.map(p => p.exchange_id);
            }
        }

        // Fetch feeds
        const { data: leadsData, error } = await supabase
            .from('exchanges')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (!error && leadsData) {
            // Market-driven algorithm mapping: Cost is scaled exactly to probability metric
            const formatted = leadsData.map(item => {
                const dynamicCost = Math.max(20, Math.round(item.probability)); 

                return {
                    id: item.id, 
                    company: item.company,
                    role: item.role,
                    location: item.location,
                    tags: item.tags || [],
                    vettedBy: item.vetted_by || 'Trive Approved',
                    leadType: item.lead_type,
                    cost: dynamicCost, // Dynamic asset pricing applied here
                    probability: item.probability,
                    insight: item.insight,
                    postedDate: 'Verified',
                    isAlreadyUnlocked: purchasedIds.includes(item.id)
                };
            });
            setExchanges(formatted);
        }
        setLoadingExchanges(false);
    };

    const handleBuyCredits = async (amount) => {
        if (!user) return false;

        const { error } = await supabase.rpc('grant_credits', {
            user_id: user.id,
            amount: parseInt(amount)
        });

        if (error) {
            console.error("Deposit failed:", error.message);
            alert("Transaction failed: " + error.message);
            return false;
        } else {
            setCredits(prev => prev + amount);
            return true;
        }
    };

    const handlePurchaseLead = async (exchangeId, cost) => {
        if (!user) {
            setShowLoginModal('login');
            return false;
        }

        const { error } = await supabase.rpc('purchase_lead', {
            user_id: user.id,
            exchange_id: exchangeId,
            cost: cost
        });

        if (error) {
            console.error("Transaction failed:", error.message);
            alert("Exchange failed: " + error.message);
            return false;
        } else {
            setCredits(prev => prev - cost);
            return true;
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="nav-logo">
                    trive<span style={{ color: '#2563eb' }}>.</span>
                </div>
                <div className="nav-links">
                    <a href="#feed">The Trade</a>
                    <a href="#about">About</a>

                    {user ? (
                        <div className="nav-profile-group">
                            <div
                                className="balance-display clickable"
                                onClick={() => setShowShopModal(true)}
                                title="Refill Institutional Credits"
                            >
                                <div className="balance-content">
                                    <span className="balance-label">WALLET <span className="plus-sign">+</span></span>
                                    <div className="tc-badge">{credits} TC</div>
                                </div>
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

            <section id="feed" className="feed-section">
                <div className="section-header">
                    <h2>Active Internship Exchanges</h2>
                    <p>Verified institutional leads from your university network.</p>
                </div>

                <div className="card-grid">
                    {user && (
                        <PostLeadForm onLeadPosted={fetchProfileAndExchanges} />
                    )}

                    {loadingExchanges ? (
                        <div className="loading-state">Querying database rows...</div>
                    ) : exchanges.length === 0 ? (
                        <p className="empty-feed-text">No active leads in this epoch.</p>
                    ) : (
                        exchanges.map((exchange) => (
                            <InternshipCard
                                key={exchange.id}
                                data={exchange}
                                userCredits={credits}
                                onPurchase={(cost) => handlePurchaseLead(exchange.id, cost)}
                            />
                        ))
                    )}
                </div>
            </section>

            <AboutPage />

            {showLoginModal === 'login' && (
                <Login
                    onLoginSuccess={() => setShowLoginModal(null)}
                    onClose={() => setShowLoginModal(null)}
                />
            )}
            {showLoginModal === 'signup' && (
                <CreateAccount
                    onSignupSuccess={() => setShowLoginModal(null)}
                    onClose={() => setShowLoginModal(null)}
                />
            )}

            {showShopModal && (
                <TokenShop
                    onClose={() => setShowShopModal(false)}
                    onPurchaseComplete={handleBuyCredits}
                />
            )}

            <footer className="footer">
                <p>© 2026 Trive. Built for the University Exchange Community.</p>
            </footer>
        </div>
    )
}

export default App;
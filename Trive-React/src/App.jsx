import React, { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabaseClient'
import InternshipCard from './components/InternshipCard'
import AboutPage from './screens/About'
import Login from './screens/Login'
import CreateAccount from './screens/CreateAccount'
import PostLeadForm from './components/PostLeadForm'
import TokenShop from './screens/TokenShop'
import OnboardingSurvey from './components/OnboardingSurvey'
import SchoolLeaderboard from './components/SchoolLeaderboard';
import ActivityTicker from './components/ActivityTicker';
import MyPortfolio from './components/MyPortfolio';

function App() {
    const [showLoginModal, setShowLoginModal] = useState(null);
    const [user, setUser] = useState(null);
    const [credits, setCredits] = useState(0);
    const [exchanges, setExchanges] = useState([]);
    const [loadingExchanges, setLoadingExchanges] = useState(true);
    const [showShopModal, setShowShopModal] = useState(false);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);
    const [viewMode, setViewMode] = useState('global'); // 'global' or 'portfolio'

    // 1. Session & Profile Management
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session?.user) {
                setCredits(0);
                setNeedsOnboarding(false); // Reset onboarding state on logout
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Trigger data fetch when user state is resolved or when state mutations occur
    useEffect(() => {
        fetchProfileAndExchanges();
    }, [user]);

    const fetchProfileAndExchanges = async () => {
        setLoadingExchanges(true);
        let currentUserId = user?.id || null;
        let purchasedIds = [];

        // 1. Fetch user profile data and purchased keys if logged in
        if (currentUserId) {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('credits, university')
                .eq('id', currentUserId)
                .single();

            if (profileData) {
                setCredits(profileData.credits);

                // If profile has no verified university column data, intercept with modal flow
                if (!profileData.university) {
                    setNeedsOnboarding(true);
                } else {
                    setNeedsOnboarding(false);
                }
            }

            const { data: purchaseData } = await supabase
                .from('purchases')
                .select('exchange_id')
                .eq('user_id', currentUserId);
            if (purchaseData) {
                purchasedIds = purchaseData.map(p => p.exchange_id);
            }
        }

        // 2. Fetch tracking rows containing current metrics AND textual crowd notes (Global Read)
        const { data: trackerRows } = await supabase
            .from('pipeline_tracker')
            .select('exchange_id, current_stage, stage_notes');

        // 3. Fetch active corporate pipelines
        const { data: leadsData, error } = await supabase
            .from('exchanges')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (!error && leadsData) {
            const formatted = leadsData.map(item => {
                // TYPE-MATCHING NORMALIZATION: Force both IDs to evaluate explicitly as Numbers.
                const companyRows = trackerRows
                    ? trackerRows.filter(r => Number(r.exchange_id) === Number(item.id))
                    : [];

                const totalApplicants = companyRows.length;

                // Extract and structure valid textual insights logged by peers
                const liveLogs = companyRows
                    .filter(r => r.stage_notes && r.stage_notes.trim() !== "")
                    .map(r => ({
                        stage: r.current_stage,
                        text: r.stage_notes
                    }));

                // Compute exact percentage distribution metrics
                const getPercentage = (stageName) => {
                    if (totalApplicants === 0) return 0;
                    const matchCount = companyRows.filter(r => r.current_stage === stageName).length;
                    return Math.round((matchCount / totalApplicants) * 100);
                };

                // Asset cost scaling relative to underlying probability score
                const dynamicCost = Math.max(20, Math.round(item.probability));

                return {
                    id: item.id,
                    company: item.company,
                    role: item.role,
                    location: item.location,
                    tags: item.tags || [],
                    vettedBy: item.vetted_by || 'Trive Approved',
                    leadType: item.lead_type,
                    cost: dynamicCost,
                    probability: item.probability,
                    insight: item.insight,
                    isAlreadyUnlocked: purchasedIds.includes(item.id),
                    applicantCount: totalApplicants,
                    liveIntelligenceLogs: liveLogs,
                    stats: {
                        applied: getPercentage('Applied'),
                        oa: getPercentage('OA Invite'),
                        interview: getPercentage('Interview'),
                        offer: getPercentage('Offer'),
                        rejected: getPercentage('Rejected')
                    }
                };
            });
            setExchanges(formatted);
        }
        setLoadingExchanges(false);
    };

    const handleUpdatePipelineStatus = async (exchangeId, stage, notes) => {
        if (!user) {
            setShowLoginModal('login');
            return;
        }

        // Pass the parameters with underscores to match the updated SQL signature
        const { error } = await supabase.rpc('update_pipeline_status', {
            _user_id: user.id,
            _exchange_id: parseInt(exchangeId),
            _new_stage: stage,
            _notes: notes || ""
        });

        if (error) {
            console.error("Database structural mismatch:", error.message);
            alert("Failed to record status: " + error.message);
        } else {
            setCredits(prev => prev + 10);
            alert(`Intelligence logged! Your wallet has been credited +10 TC.`);
            fetchProfileAndExchanges();
        }
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
                    trive
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
                    The verified data liquidity layer for institutional talent. Drop application links, extract programmatic pipeline intelligence, and bypass black-box corporate tracking algorithms.
                </p>
                {!user && (
                    <div className="hero-actions">
                        <button className="btn-main" onClick={() => setShowLoginModal('signup')}>Verify & Join</button>
                        <button className="btn-text">How It Works →</button>
                    </div>
                )}
            </header>

            {/* LOCATE THIS BLOCK INSIDE YOUR APP.JSX RETURN STATEMENTS */}
            <section id="feed" className="feed-section">
                {/* NAVIGATION CONTROL TABS */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                    <button
                        onClick={() => setViewMode('global')}
                        style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: '800', cursor: 'pointer', color: viewMode === 'global' ? '#2563eb' : '#94a3b8', borderBottom: viewMode === 'global' ? '3px solid #2563eb' : 'none', paddingBottom: '10px', marginBottom: '-13px' }}
                    >
                        🌐 Global Data Board
                    </button>
                    {user && (
                        <button
                            onClick={() => setViewMode('portfolio')}
                            style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: '800', cursor: 'pointer', color: viewMode === 'portfolio' ? '#2563eb' : '#94a3b8', borderBottom: viewMode === 'portfolio' ? '3px solid #2563eb' : 'none', paddingBottom: '10px', marginBottom: '-13px' }}
                        >
                            💼 My Private Terminal
                        </button>
                    )}
                </div>

                {/* CONDITIONAL RENDER PIPELINE */}
                {viewMode === 'portfolio' ? (
                    // RENDER PRIVATE PORTFOLIO VIEW
                    <MyPortfolio userId={user?.id} currentCredits={credits} />
                ) : (
                    // RENDER ORIGINAL GLOBAL WORKING ECOSYSTEM
                    <>
                        <div className="leaderboard-banner-wrapper" style={{ marginBottom: '32px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <ActivityTicker />
                            <SchoolLeaderboard />
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
                                        onStatusUpdate={(stage, notes) => handleUpdatePipelineStatus(exchange.id, stage, notes)}
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}
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

            {/* HIGH-VALUE INTERCEPT OVERLAY MODAL */}
            {needsOnboarding && user && (
                <OnboardingSurvey
                    userId={user.id}
                    onComplete={() => {
                        setNeedsOnboarding(false);
                        fetchProfileAndExchanges();
                    }}
                />
            )}

            <footer className="footer">
                <p>© 2026 Trive. Built for the University Exchange Community.</p>
            </footer>
        </div>
    )
}

export default App;
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

// Asynchronous helper function to ping the global university registry
const fetchUniversityFromAPI = async (emailStr) => {
  if (!emailStr || !emailStr.includes('@')) return null;

  // Always work with clean, lowercased string handles
  const cleanEmail = emailStr.trim().toLowerCase();
  const domain = cleanEmail.split('@')[1];

  try {
    // Query the API using the clean domain handle
    const response = await fetch(`https://universities.hipolabs.com/search?domain=${domain}`);
    const data = await response.json();

    // FIX 1: If the API matches, ensure it formats cleanly (e.g. "Lehigh University" instead of "LEHIGH")
    if (data && data.length > 0 && data[0].name) {
      const rawName = data[0].name;
      // Converts harsh all-caps names into clean Title Case
      return rawName.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    // FIX 2: Better fallback handling if the API returns an empty array
    if (domain.endsWith('.edu')) {
      const schoolPrefix = domain.split('.')[0]; // Isoles "lehigh"
      return schoolPrefix.charAt(0).toUpperCase() + schoolPrefix.slice(1) + " University";
    }
  } catch (err) {
    console.error("University database API unreachable:", err);
    if (domain.endsWith('.edu')) {
      const schoolPrefix = domain.split('.')[0]; // Pulls "lehigh"
      // Forces "Lehigh University" instead of creating a split "Network" category
      return schoolPrefix.charAt(0).toUpperCase() + schoolPrefix.slice(1).toLowerCase() + " University";
    }
  }

  return null;
};

function CreateAccount({ onSignupSuccess, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Structural Perimeter Check
    const domain = email.toLowerCase().split('@')[1];
    if (!domain || (!domain.endsWith('.edu') && !domain.includes('.edu.'))) {
      setError("Access Denied: You must register using a verified institutional .edu email address.");
      setLoading(false);
      return;
    }

    // 2. Resolve official school name via API background request
    const assignedUniversity = await fetchUniversityFromAPI(email);

    if (!assignedUniversity) {
      setError("Could not resolve your academic institution. Please double-check your email handle.");
      setLoading(false);
      return;
    }

    // 3. Register user with Supabase and inject the dynamically fetched school name
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          university: assignedUniversity
        }
      }
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
    } else {
      alert(`Account key generated! Welcome to the verified ${assignedUniversity} exchange layer.`);
      onSignupSuccess();
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
      <div className="auth-modal" style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Join the Exchange</h2>
          <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>×</button>
        </div>
        <p className="modal-subtitle" style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', textAlign: 'left' }}>Access requires a verified institutional student account.</p>

        {error && <div className="auth-error-banner" style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '15px', fontWeight: '500', border: '1px solid #fee2e2', textAlign: 'left' }}>{error}</div>}

        <form onSubmit={handleSignUpSubmit}>
          <div className="auth-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', textAlign: 'left' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Institutional Email</label>
            <input
              type="email"
              required
              placeholder="your_name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <div className="auth-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px', textAlign: 'left' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Secure Key Access</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <button
            type="submit"
            className="auth-main-btn"
            disabled={loading}
            style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', fontWeight: '700', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
          >
            {loading ? "Verifying with Registry..." : "Generate Account Key"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAccount;
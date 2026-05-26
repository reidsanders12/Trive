// src/screens/Login.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Login.css';

const Login = ({ onLoginSuccess, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      if (onLoginSuccess) onLoginSuccess(data.user);
    }
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-card">
        <div className="login-header">
          <h2>Access the Exchange</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <p className="login-subtitle">Enter your credentials to log in.</p>

        {errorMessage && <div className="auth-error">{errorMessage}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>School Email</label>
            <input 
              type="email" 
              placeholder="student@university.edu" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-main w-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
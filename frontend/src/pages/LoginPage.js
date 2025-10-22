import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css'; // Create this CSS file
import logo from '../assets/logo.png';
import GoogleIcon from '../assets/google-icon.svg';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = () => {
    // Redirects to the same Google auth route as signup
    window.location.href = 'http://localhost:5001/api/auth/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      console.log('Login successful:', data);
      // Redirect to dashboard or home page after successful login
      navigate('/dashboard'); // Or navigate('/')

    } catch (err) {
      console.error("Login fetch error:", err);
      setError(err.message || 'Failed to log in. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page"> {/* Reuse class names if styles are similar */}
      <div className="login-form-container"> {/* Container for centering */}
        <form className="login-form" onSubmit={handleSubmit}>
            <Link to="/">   <img src={logo} alt="Wealth Guard Logo" className="login-logo" /></Link>
          <h2>Welcome Back</h2>
          <p className="signup-link"> {/* Link to Sign Up */}
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>

          <button type="button" className="google-login-button" onClick={handleGoogleLogin} disabled={loading}>
            <img src={GoogleIcon} alt="Google logo" /> Log in with Google
          </button>

          <div className="form-divider">Or</div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
                role="button"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
             <Link to="/forgot-password" className="forgot-password-link">Forgot password?</Link>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
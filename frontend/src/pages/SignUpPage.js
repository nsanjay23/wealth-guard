import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SignUpPage.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import GoogleIcon from '../assets/google-icon.svg'; // Check path
import logo from '../assets/logo.png'; // Check path
import Illustration from '../assets/illustration.png'; // Check path


const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSignup = () => {
    // Redirects the user to the backend OAuth initiation route
    window.location.href = 'http://localhost:5001/api/auth/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 0. Frontend Validation Checks
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.email || !formData.password || !formData.firstName) {
      setError('Please fill in First name, Email, and Password');
      return;
    }

    setLoading(true);
    try {
      // 1. Send data to the backend for signup and server-side validation
      const response = await fetch('http://localhost:5001/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName, // Last name is sent even if empty
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If status is 4xx or 5xx, use the backend's error message
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // 2. Handle successful sign-up
      console.log('Signup successful:', data);
      // Navigate to the login page (or dashboard)
      navigate('/login');

    } catch (err) {
      console.error("Signup fetch error:", err);
      // Display error message from backend or generic failure message
      setError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-form-container">
        <form className="signup-form" onSubmit={handleSubmit}>
          
          {/* ----- LOGO & HEADING ----- */}
          <Link to="/">
            <img src={logo} alt="Wealth Guard Logo" className="signup-logo" />
          </Link>
          <h2>Create Account</h2>

          <p className="login-link">
            Already have an account? <Link to="/login">Log In</Link>
          </p>

          {/* Google Sign-up Button */}
          <button type="button" className="google-signup-button" onClick={handleGoogleSignup} disabled={loading}>
            <img src={GoogleIcon} alt="Google logo" /> Sign up with Google
          </button>

          <div className="form-divider">Or</div>

          {error && <p className="error-message">{error}</p>}

          {/* Name Fields */}
          <div className="name-group">
            <div className="form-group">
              <label htmlFor="firstName">First name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last name (Optional)</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                autoComplete="family-name"
              />
            </div>
          </div>

          {/* Email Field */}
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

          {/* Password Field */}
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
                autoComplete="new-password"
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
                role="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {/* Independent Toggle Icon */}
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                role="button"
                aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
              >
                {/* Independent Toggle Icon */}
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          {/* Privacy Text */}
          <p className="privacy-policy-text">
            By creating an account, I agree with Wealth Guard's <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms of Service</Link>.
          </p>

          {/* Submit Button */}
          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create account'}
          </button>
        </form>

        {/* Image Side */}
        <div className="signup-image-side">
          <img src={Illustration} alt="Financial Planning Illustration" />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
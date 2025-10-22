import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SignUpPage.css';
// Import your Google icon and Logo images
import GoogleIcon from '../assets/google-icon.svg'; // Check path
import logo from '../assets/logo.png'; // Check path
import illustration from '../assets/illus-.png';
// Import the eye icons
import { FiEye, FiEyeOff } from 'react-icons/fi';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '', // Keep this
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

    // Password matching check
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Updated validation: removed lastName requirement
    if (!formData.email || !formData.password || !formData.firstName) {
      setError('Please fill in First name, Email, and Password');
      return;
    }
    // You might want to add password complexity checks here in the frontend too

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName, // Send lastName even if empty
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      console.log('Signup successful:', data);
      // alert('Signup successful! Please log in.'); // Removed alert
      navigate('/login'); // Redirect to login page on success

    } catch (err) {
      console.error("Signup fetch error:", err);
      setError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page"> {/* This is the main centered box */}
      <div className="signup-form-container">
        <form className="signup-form" onSubmit={handleSubmit}>

          {/* ----- LOGO ----- */}
          <img src={logo} alt="Wealth Guard Logo" className="signup-logo" />
          {/* ---------------- */}

          {/* ----- HEADING ----- */}
          <h2>Create Account</h2>
          {/* ------------------- */}

          <p className="login-link">
            Already have an account? <Link to="/login">Log In</Link>
          </p>

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
                required // First name is required
                autoComplete="given-name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last name (Optional)</label> {/* Label updated */}
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                // 'required' attribute removed
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
                {/* Use react-icons */}
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-group"> {/* Added wrapper */}
              <input
                type={showConfirmPassword ? 'text' : 'password'} // Use showConfirmPassword state
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Controls showConfirmPassword
                role="button"
                aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
              >
                {/* Use react-icons */}
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
          {/* Replace with your actual illustration image */}
          <img src={illustration} alt="Financial Planning Illustration" />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
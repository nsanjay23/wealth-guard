import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css'; // Styles for this page
import logo from '../assets/logo.png'; // Path to your logo
import GoogleIcon from '../assets/google-icon.svg'; // Path to Google icon
import { FiEye, FiEyeOff } from 'react-icons/fi'; // Icons for password toggle

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Updates state when user types in input fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Redirects to backend Google OAuth route
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5001/api/auth/google';
  };

  // Handles email/password form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors
    setLoading(true); // Show loading state

    try {
      // Send login credentials to the backend
      // --- IMPORTANT: Ensure this URL matches your backend route ---
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Send email and password
        credentials: 'include' // ** Crucial for sending session cookies **
      });

      const data = await response.json(); // Parse the response

      if (!response.ok) { // Check if response status is NOT 2xx
        // If login failed (e.g., wrong password, user not found), throw error
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Login successful (status is 200 OK)
      console.log('Login successful:', data);
      console.log("Redirecting to dashboard..."); // Add log before redirect
      // Redirect to the dashboard page after successful login
      navigate('/dashboard'); // Make sure you have a '/dashboard' route

    } catch (err) {
      // Catch errors (network, backend errors, invalid credentials)
      console.error("Login fetch error:", err);
      setError(err.message || 'Failed to log in. Please check credentials.');
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    // This div becomes the centered box (styled by LoginPage.css)
    <div className="login-page">
      <div className="login-form-container">
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Logo */}
          <Link to="/">          <img src={logo} alt="Wealth Guard Logo" className="login-logo" />
 </Link>
          {/* Heading */}
          <h2>Welcome Back</h2>
          {/* Link to Sign Up */}
          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>

          {/* Google Login Button */}
          <button type="button" className="google-login-button" onClick={handleGoogleLogin} disabled={loading}>
            <img src={GoogleIcon} alt="Google logo" /> Log in with Google
          </button>

          <div className="form-divider">Or</div>

          {/* Display errors here */}
          {error && <p className="error-message">{error}</p>}

          {/* Email Input */}
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

          {/* Password Input */}
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
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {/* Password visibility icon */}
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
             {/* Forgot Password Link (add route later) */}
             <Link to="/forgot-password" className="forgot-password-link">Forgot password?</Link>
          </div>

          {/* Submit Button */}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
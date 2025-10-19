import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Optional: for redirection after signup
import './SignUpPage.css'; // We will create this next

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Optional: Hook for navigation

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.email || !formData.password) {
       setError('Please fill in all fields');
       return;
    }
    // You can add more complex password validation here

    setLoading(true);
    try {
      // Your backend endpoint (make sure backend is running on port 5001)
      const response = await fetch('http://localhost:5001/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the error message from the backend if available
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Handle successful signup
      console.log('Signup successful:', data);
      alert('Signup successful! Please log in.'); // Simple success feedback
      // navigate('/login'); // Optional: Redirect to login page after successful signup

    } catch (err) {
      console.error("Signup fetch error:", err);
      setError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create Your Account</h2>
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
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>
        <button type="submit" className="signup-button" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
        <p className="login-link">
          Already have an account? <a href="/login">Log In</a> {/* Change to <Link> later */}
        </p>
      </form>
    </div>
  );
};

export default SignUpPage;
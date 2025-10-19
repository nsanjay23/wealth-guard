import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import './Theme.css'; // Make sure this exists and has .dark styles

// Adjust these import paths based on your actual folder structure
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import SignUpPage from './pages/SignUpPage'; // We will create this next

// --- Feature Data (Keep your existing data here) ---
const featuresData = [
  // ... (Your Insurance Management section) ...
  // ... (Your Stock Analysis section) ...
];

// --- Layout Component ---
// Wraps pages that should have the Navbar
const Layout = ({ children }) => {
  // Sets the dark theme on initial load for pages using this layout
  useEffect(() => {
    document.body.className = 'dark';
  }, []);

  return (
    <> {/* Use Fragment to avoid unnecessary div */}
      <Navbar />
      <main>{children}</main>
    </>
  );
};

// --- Landing Page Component ---
// Contains only the content specific to your homepage
const LandingPage = () => (
  <>
    <Hero />
    <Features sections={featuresData} />
  </>
);


// --- Main App Component ---
function App() {
  return (
    // The .App class might not be needed directly here anymore if
    // background is handled by index.css or Layout component style
    <div className="App">
      <Routes>
        {/* Route for the landing page */}
        <Route
          path="/"
          element={
            <Layout>
              <LandingPage />
            </Layout>
          }
        />
        {/* Route for the sign-up page */}
        <Route
          path="/signup"
          element={
            <Layout>
              <SignUpPage />
            </Layout>
          }
        />
        {/* Add other routes like /login later */}
      </Routes>
    </div>
  );
}

export default App;
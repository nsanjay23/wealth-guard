// backend/server.js

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const axios = require('axios'); // For API calls
const passport = require('passport'); // Authentication middleware
const GoogleStrategy = require('passport-google-oauth20').Strategy; // Google OAuth strategy
const LocalStrategy = require('passport-local').Strategy; // Email/Password strategy
const session = require('express-session'); // Session management
const db = require('../db/db'); // Database connection module (adjust path if needed)
require('dotenv').config(); // Load environment variables

// --- Helper Function: Convert String to Title Case ---
const toTitleCase = (str) => {
  if (!str) return str;
  return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
};

// --- Helper Function: Check Email Validity with VerifyKit.io ---
async function checkEmailWithVerifyKit(emailToCheck) {
  const apiKey = process.env.VERIFYKIT_API_KEY;

  if (!apiKey) {
    console.warn('VerifyKit.io API key missing. Skipping email validation.');
    return { valid: true, reason: 'api_key_missing' }; // Allow signup if key missing
  }

  // --- API Configuration (Confirm with VerifyKit.io docs) ---
  const apiUrl = 'https://api.verifykit.io/v1/verify';
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
  const body = { email: emailToCheck };
  // ---------------------------------------------------------

  try {
    const response = await axios.post(apiUrl, body, { headers });
    console.log(`VerifyKit.io check successful for ${emailToCheck}. Status: ${response.data.valid ? 'VALID' : 'INVALID'}.`);
    return response.data; // Returns { valid: boolean, ... }
  } catch (error) {
    console.error('Error calling VerifyKit.io API:', error.response ? error.response.data : error.message);
    return { valid: false, reason: 'api_call_failed' };
  }
}

// --- Express App Setup ---
const app = express();
const port = process.env.PORT || 5001;

// --- PASSPORT CONFIGURATION ---

// 1. Google OAuth 2.0 Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5001/api/auth/google/callback" // Must match Google Console Redirect URI
  },
  async (accessToken, refreshToken, profile, done) => {
    // This function is called after successful Google authentication
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    const firstName = profile.name ? profile.name.givenName : null;
    const lastName = profile.name ? profile.name.familyName : null;

    if (!email) {
        return done(new Error('Failed to retrieve email from Google profile.'), null);
    }

    try {
        // Find or create user in the database
        let userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = userResult.rows[0];

        if (user) {
            // User exists
            return done(null, user); // Pass user object to serializeUser
        } else {
            // User does not exist, create a new one (password_hash is NULL for OAuth users)
            const newUserResult = await db.query(
                'INSERT INTO users (email, first_name, last_name) VALUES ($1, $2, $3) RETURNING user_id, email, first_name, last_name, created_at',
                [email, toTitleCase(firstName), toTitleCase(lastName)]
            );
            user = newUserResult.rows[0];
            return done(null, user); // Pass new user object to serializeUser
        }
    } catch (err) {
        return done(err, null); // Database or other error
    }
  }
));

// 2. Local (Email/Password) Strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' }, // Use 'email' field instead of default 'username'
  async (email, password, done) => {
    try {
      // Find user by email
      const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = userResult.rows[0];

      if (!user) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }

      // Check if the user signed up via Google (no local password)
      if (!user.password_hash) {
          return done(null, false, { message: 'This account was created using Google. Please log in with Google.' });
      }

      // Compare submitted password with stored hash
      const match = await bcrypt.compare(password, user.password_hash);

      if (!match) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }

      // Credentials are correct
      return done(null, user); // Pass user object to serializeUser

    } catch (err) {
      return done(err); // Server error during DB query or bcrypt comparison
    }
  }
));

// 3. Session Serialization/Deserialization
// Determines what user data should be stored in the session
passport.serializeUser((user, done) => {
  done(null, user.user_id); // Store only the user ID in the session cookie
});

// Retrieves the full user data based on the ID stored in the session
passport.deserializeUser(async (id, done) => {
    try {
        const userResult = await db.query('SELECT * FROM users WHERE user_id = $1', [id]);
        if (userResult.rows.length === 0) {
             return done(new Error(`User not found with ID ${id}`), null);
        }
        // Exclude password hash from the user object attached to req.user
        const { password_hash, ...userData } = userResult.rows[0];
        done(null, userData); // Attach user data (without hash) to req.user
    } catch (err) {
        console.error('Error in deserializeUser:', err);
        done(err, null);
    }
});
// -----------------------------

// --- Middleware Setup ---
// Enable CORS for requests from your frontend, allow credentials (cookies)
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
// Parse incoming JSON request bodies
app.use(express.json());

// Configure and use express-session for session management
app.use(session({
    secret: process.env.SESSION_SECRET, // Secret key to sign the session ID cookie
    resave: false,                     // Don't save session if unmodified
    saveUninitialized: false,          // Don't create session until something stored
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
        httpOnly: true, // Prevent client-side JS from reading the cookie
        maxAge: 1000 * 60 * 60 * 24 // Example: Cookie expires in 1 day
    }
}));
// Initialize Passport and allow it to use sessions
app.use(passport.initialize());
app.use(passport.session());
// ----------------------

// --- Routes ---

// Basic test route
app.get('/', (req, res) => {
  res.send('Wealth Guard Backend Server is Running!');
});

// --- AUTHENTICATION ROUTES ---

// Google Auth - Step 1: Redirect to Google
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }) // Request profile and email access
);

// Google Auth - Step 2: Callback URL after Google authentication
app.get('/api/auth/google/callback',
  passport.authenticate('google', {
    // Redirect back to frontend signup page on failure
    failureRedirect: 'http://localhost:3000/signup?error=google_auth_failed'
  }),
  (req, res) => {
    // Successful authentication! Redirect to the frontend dashboard.
    // The session is now established by Passport.
    res.redirect('http://localhost:3000/dashboard'); // Adjust to your desired success route
  }
);

// Local (Email/Password) Login Route
app.post('/api/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); } // Pass server errors to error handler
    if (!user) {
        // Authentication failed (wrong email/pass, or Google user trying local)
        return res.status(401).json({ message: info.message || 'Login failed. Check credentials.' });
    }
    // Manually establish the session using req.logIn
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      // Send success response with user data (excluding password hash)
      const { password_hash, ...userData } = user;
      return res.status(200).json({ message: 'Login successful!', user: userData });
    });
  })(req, res, next); // Necessary invocation for custom callback
});

// Logout Route
app.post('/api/auth/logout', (req, res, next) => {
  req.logout(function(err) { // req.logout requires a callback in newer Passport versions
    if (err) { return next(err); }
    // Optional: Explicitly destroy session and clear cookie for cleaner logout
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        // Still attempt to clear cookie and respond
      }
      res.clearCookie('connect.sid'); // Default session cookie name
      res.status(200).json({ message: 'Logout successful.' });
    });
  });
});

// Check Authentication Status Route (for frontend to check if user is logged in)
app.get('/api/auth/status', (req, res) => {
  if (req.isAuthenticated()) { // Passport adds isAuthenticated() to the request object
    // req.user contains the user data deserialized from the session
    res.status(200).json({ isAuthenticated: true, user: req.user });
  } else {
    // User is not logged in
    res.status(401).json({ isAuthenticated: false, user: null });
  }
});

// --- MANUAL SIGNUP ROUTE ---
app.post('/api/signup', async (req, res) => {
  console.log("--- DEBUG: Received POST request for signup ---");
  const { email, password, firstName, lastName } = req.body;

  // --- 0. Input Validation & Security Checks ---
  if (!email || !password || !firstName) {
    return res.status(400).json({ message: 'Email, password, and first name are required.' });
  }
  if (password.length > 128) { return res.status(400).json({ message: 'Password is too long (max 128).' }); }
  if (password.length < 8) { return res.status(400).json({ message: 'Password must be at least 8 characters.' }); }
  if (!/\d/.test(password)) { return res.status(400).json({ message: 'Password must contain a number.' }); }
  if (!/[A-Z]/.test(password)) { return res.status(400).json({ message: 'Password must contain a capital letter.' }); }
  // ---------------------------------------------

  try {
    // 1. CONDITIONALLY Check Email Validity (VerifyKit)
    const shouldVerifyEmail = process.env.ENABLE_EMAIL_VERIFICATION === 'true';
    if (shouldVerifyEmail) {
      const verificationResult = await checkEmailWithVerifyKit(email);
      if (verificationResult.valid !== true) {
        return res.status(400).json({ message: 'Email validation failed. Please try another.' });
      }
    } else {
        console.log("Email verification disabled. Skipping VerifyKit.")
    }

    // 2. Check if user already exists in DB
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // 3. Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Convert names to Title Case
    const firstNameTitleCase = toTitleCase(firstName);
    const lastNameTitleCase = toTitleCase(lastName);

    // 5. Insert the new user into the database
    const newUser = await db.query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING user_id, email, first_name, last_name, created_at',
      [email, passwordHash, firstNameTitleCase, lastNameTitleCase]
    );

    // 6. Send Success Response
    res.status(201).json({
      message: 'User created successfully!',
      user: newUser.rows[0],
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal server error during signup.' });
  }
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
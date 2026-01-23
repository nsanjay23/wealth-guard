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
const ensureAuthenticated = require('./middleware/auth');
require('dotenv').config(); // Load environment variables
const portfolioRoutes = require('./routes/portfolio');
const path = require('path');
const fs = require('fs'); // Add fs to read the CSV file
const csv = require('csv-parser'); // You might need to install this: npm install csv-parser
const multer = require('multer');
const pdfParse = require('pdf-extraction');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { spawn } = require('child_process'); // To start Python server
const OpenAI = require('openai'); // CHANGED: Using OpenAI
const Groq = require('groq-sdk');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// Helper: Wait function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// Helper: Convert string to Title Case
const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Google's predefined service settings
    auth: {
        user: process.env.EMAIL_USER, // Reads from your .env file
        pass: process.env.EMAIL_PASS  // Reads from your .env file
    }
});

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,     // Placeholder
    process.env.GOOGLE_CLIENT_SECRET, // Placeholder
    'http://localhost:3000'      // Redirect URL
);
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

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
    callbackURL: "http://localhost:5001/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    
    try {
        // 1. Check if user exists
        let userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = userResult.rows[0];

        if (user) {
            // 2. USER EXISTS: Update their tokens!
            // We need to save these so we can use Calendar API later.
            await db.query(
                'UPDATE users SET google_access_token = $1, google_refresh_token = $2 WHERE email = $3',
                [accessToken, refreshToken, email]
            );
            return done(null, user); 
        } else {
            // 3. NEW USER: Create them AND save tokens
            const newUser = await db.query(
                'INSERT INTO users (email, first_name, last_name, google_access_token, google_refresh_token) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [email, profile.name.givenName, profile.name.familyName, accessToken, refreshToken]
            );
            return done(null, newUser.rows[0]);
        }
    } catch (err) {
        return done(err, null);
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
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));
// Initialize Passport and allow it to use sessions
app.use(passport.initialize());
app.use(passport.session());
// ----------------------


// --- 1. START PYTHON SERVER IN BACKGROUND ---
let pythonServerProcess;

const startPythonServer = () => {
    // POINT TO YOUR PREDICT.PY FILE NOW
    const scriptPath = path.join(__dirname, '../ai/predict.py'); 
    console.log('🚀 Starting Python AI Server (predict.py)...');
    
    // ADD THE '--server' FLAG
    pythonServerProcess = spawn('python', [scriptPath, '--server']);

    pythonServerProcess.stdout.on('data', (data) => {
        console.log(`[PYTHON]: ${data.toString()}`);
    });

    pythonServerProcess.stderr.on('data', (data) => {
        const output = data.toString();
        
        // Filter out "INFO" logs from Flask/Werkzeug so they don't look like errors
        if (output.includes('INFO:') || output.includes('WARNING:')) {
            console.log(`[PYTHON LOG]: ${output.trim()}`);
        } else {
            // Real errors stay red
            console.error(`[PYTHON ERROR]: ${output.trim()}`);
        }
    });
};

// Start it immediately when Node starts
startPythonServer();

// --- 2. START SECOND PYTHON SERVER (ai_server.py) ---
let aiServerProcess;

const startAiServer = () => {
    // 1. Point to your new ai_server.py file
    // Check if it is in the same folder as server.js or in '../ai/'
    const scriptPath = path.join(__dirname, '../ai/ai_server.py'); 
    
    console.log('🚀 Starting New AI Server (ai_server.py)...');

    // 2. Spawn the process (Port 5002 defined inside python file)
    aiServerProcess = spawn('python', [scriptPath]);

    // 3. Handle Standard Output
    aiServerProcess.stdout.on('data', (data) => {
        console.log(`[AI SERVER]: ${data.toString().trim()}`);
    });

    // 4. Handle Errors & Logs
    aiServerProcess.stderr.on('data', (data) => {
        const output = data.toString();
        // Filter out normal Flask logs
        if (output.includes('Running on') || output.includes('Press CTRL+C')) {
            console.log(`[AI STATUS]: ${output.trim()}`);
        } else {
            console.error(`[AI ERROR]: ${output.trim()}`);
        }
    });

    // 5. Handle Crash
    aiServerProcess.on('close', (code) => {
        console.log(`AI Server exited with code ${code}`);
    });
};

// Start the second AI server immediately when Node starts
startAiServer();

// --- Routes ---
// 1. Setup Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Fallback to the standard pro model if flash is giving 404
// Trying the Experimental model - usually has separate limits
// Trying the specific pinned Lite version
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-001" });
// Initialize OpenAI Client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// 2. Setup File Upload (Memory Storage)
const upload = multer({ storage: multer.memoryStorage() });

// --- 2. FAST API ROUTE ---
app.post('/api/predict', async (req, res) => {
    try {
        // Forward the request to the running Python server (Port 5002)
        const response = await axios.post('http://127.0.0.1:5002/predict', req.body);
        
        // Return the Python result directly to Frontend
        res.json(response.data);

    } catch (error) {
        console.error("Prediction Error:", error.message);
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                message: "AI Server is warming up, please try again in 10 seconds." 
            });
        }
        res.status(500).json({ message: "Prediction failed", error: error.message });
    }
});


// Basic test route
app.get('/', (req, res) => {
  res.send('Wealth Guard Backend Server is Running!');
});

// --- AUTHENTICATION ROUTES ---

// CHANGE: Added 'calendar' scope and 'access_type: offline' to get a Refresh Token
app.get('/api/auth/google',
  passport.authenticate('google', { 
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
      // CHANGE THIS LINE BELOW:
      access_type: 'offline', // <--- It must say 'offline', not 'online'
      prompt: 'consent'       // <--- Keeps asking for consent to ensure we get the token
  })
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

app.use('/api/portfolios', portfolioRoutes);

// --- ROUTE 1: ANALYZE POLICY ---
app.post('/api/analyze-policy', upload.single('policyPdf'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        // 1. EXTRACT TEXT
        let rawText = "";
        try {
            const data = await pdfParse(req.file.buffer);
            // REDUCED LIMIT: 30,000 chars is approx 7.5k tokens (Safe for 12k limit)
            rawText = data.text.substring(0, 30000); 
        } catch (pdfError) {
            return res.status(500).json({ error: "Failed to read PDF." });
        }

        // 2. AI PROMPT
        const systemPrompt = `
            You are an expert insurance underwriter. Analyze this document (Policy Bond or Product Brochure).

            CRITICAL INSTRUCTIONS:
            1. **Identify the Document Type:** Is it a specific user policy or a general product brochure?
            2. **Extract Product Logic:** If specific user details (Name, Dates) are missing, extract the PRODUCT RULES (e.g., "Eligibility: 5 months to 65 years", "Sum Insured: 1.5L to 15L").
            3. **Summarize Key Sections:** Extract features, waiting periods, and specific plan options.

            RETURN JSON ONLY (Do not use Markdown in JSON keys):
            {
                "fraudScore": number (80-100, lower if document looks edited/fake),
                "isFraudulent": boolean,
                "summary": {
                    "provider": "string",
                    "policyName": "string",
                    "policyType": "string",
                    "sumInsured": "string",
                    "premium": "string",
                    "policyHolder": "string",
                    "policyTerm": "string",
                    "eligibility": "string",
                    "keyFeatures": ["string", "string", "string"],
                    "waitingPeriods": ["string", "string"], 
                    "exclusions": ["string", "string", "string"]
                }
            }
        `;

        // 3. CALL GROQ WITH ERROR HANDLING
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Document Text:\n${rawText}` }
                ],
                // Stick to 70b first, it's smarter
                model: "llama-3.3-70b-versatile",
                temperature: 0.1,
                response_format: { type: "json_object" } 
            });

            const aiResponse = completion.choices[0].message.content;
            const aiData = JSON.parse(aiResponse);
            return res.json({ ...aiData, rawTextContext: rawText });

        } catch (groqError) {
            // FALLBACK: If 70b hits rate limit, try 8b (it's faster and has higher limits)
            if (groqError.status === 413 || groqError.code === 'rate_limit_exceeded') {
                console.log("Rate limit hit. Retrying with smaller model...");
                
                const fallbackCompletion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Document Text:\n${rawText}` }
                    ],
                    model: "llama-3.1-8b-instant", // Fallback model
                    temperature: 0.1,
                    response_format: { type: "json_object" } 
                });

                const fallbackResponse = fallbackCompletion.choices[0].message.content;
                const fallbackData = JSON.parse(fallbackResponse);
                return res.json({ ...fallbackData, rawTextContext: rawText });
            } else {
                throw groqError; // Re-throw other errors
            }
        }

    } catch (error) {
        console.error("Analysis Error:", error);
        // Send a readable error to frontend
        res.status(500).json({ error: "Analysis failed due to AI limits. Please try a smaller file." });
    }
});

// --- ROUTE 2: CHATBOT (Simpler & Shorter) ---
app.post('/api/chat-policy', async (req, res) => {
    try {
        const { question, context } = req.body;

        const systemPrompt = `
            You are a helpful Insurance Assistant.
            User Question: "${question}"
            Document Context: "${context ? context.substring(0, 15000) : ''}"
            
            RULES FOR ANSWERING:
            1. **Keep it SHORT.** Maximum 2-3 sentences.
            2. **Simple English.** Explain it like you are talking to a high schooler.
            3. No complex formatting. No bold (**), no bullet points.
            4. If the answer is in the document context, use it. If not, answer generally.
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "llama-3.3-70b-versatile", 
            temperature: 0.7
        });

        // Double clean to remove any accidental markdown
        const cleanText = completion.choices[0].message.content.replace(/\*\*/g, "").replace(/#/g, "");
        
        res.json({ answer: cleanText });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Chat failed" });
    }
});


// --- PREDICTION ROUTE ---
app.post('/api/predict', ensureAuthenticated, (req, res) => {
    const { company, startDate, endDate } = req.body;

    if (!company || !startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    // 1. Define paths
    // Go up one level from 'backend' to 'ai'
    const pythonScriptPath = path.join(__dirname, '../ai/predict.py'); 
    const aiDir = path.join(__dirname, '../ai'); // Working directory for the script

    // 2. Spawn the Python process
    // We run it inside the 'ai' folder so it finds the models easily
    const pythonProcess = require('child_process').spawn('python', [pythonScriptPath, company, startDate, endDate], {
        cwd: aiDir 
    });

    let scriptOutput = '';

    pythonProcess.stdout.on('data', (data) => {
        scriptOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script finished with code ${code}`);
        
        // --- DEBUG: Print what Python actually said ---
        console.log("--- PYTHON OUTPUT START ---");
        console.log(scriptOutput); 
        console.log("--- PYTHON OUTPUT END ---");
        // ---------------------------------------------

        // 3. Check output for Success/Error tags
        if (scriptOutput.includes('ERROR:')) {
            // Send the specific python error to the frontend
            return res.status(500).json({ message: 'Prediction failed', details: scriptOutput });
        }

        if (scriptOutput.includes('SUCCESS:')) {
            const filenameMatch = scriptOutput.match(/SUCCESS:(.*)/);
            if (filenameMatch && filenameMatch[1]) {
                const csvFilename = filenameMatch[1].trim();
                const csvFilePath = path.join(aiDir, csvFilename);

                const results = [];
                fs.createReadStream(csvFilePath)
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', () => {
                        res.json({ message: 'Success', data: results });
                    });
            } else {
                res.status(500).json({ message: 'Could not parse output file name.' });
            }
        } else {
            res.status(500).json({ message: 'Unknown script response', raw: scriptOutput });
        }
    });
});

// --- GET REAL POLICIES FROM NEON DB ---
app.get('/api/insurance/live', ensureAuthenticated, async (req, res) => {
    try {
        const userRes = await db.query('SELECT * FROM users WHERE user_id = $1', [req.user.user_id]);
        const user = userRes.rows[0];

        const policyRes = await db.query('SELECT * FROM policies');
        let policies = policyRes.rows.map(row => ({
            id: row.id,
            provider: row.provider,
            planName: row.plan_name,
            type: row.type,
            category: row.category,
            premium: parseInt(row.premium),
            coverage: row.coverage,
            term: row.term,
            features: Array.isArray(row.features) ? row.features : [],
            badge: row.badge
        }));

        if (user && user.age && user.income_range) {
            try {
                // 1. Get Scores from Python
                const payload = {
                    user: {
                        age: user.age,
                        incomeRange: user.income_range,
                        riskAppetite: user.risk_appetite || 'Balanced'
                    },
                    policies: policies.map(p => ({ id: p.id, type: p.type, premium: p.premium }))
                };

                const aiResponse = await axios.post('http://localhost:5003/predict', payload);
                const scores = aiResponse.data; 

                // 2. Attach Scores
                policies = policies.map(p => {
                    const s = scores.find(x => x.id === p.id);
                    return { ...p, matchScore: s ? s.matchScore : 0 };
                });

                // 3. Sort (Highest Score First)
                policies.sort((a, b) => b.matchScore - a.matchScore);

                // 4. *** FORCE BADGE ON TOP 3 ***
                policies = policies.map((p, index) => ({
                    ...p,
                    isAiRecommended: index < 3 // True for 0, 1, 2. False for others.
                }));

            } catch (e) {
                console.error("AI Error, using default sort");
            }
        }
        
        res.json(policies);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

/*
app.get('/api/insurance/live', ensureAuthenticated, async (req, res) => {
    try {
        // 1. Fetch from Database (Sorted by premium for better default view)
        const result = await db.query('SELECT * FROM policies ORDER BY premium ASC');
        
        // 2. Map Database Columns (snake_case) to Frontend (camelCase)
        const formattedPolicies = result.rows.map(row => ({
            id: row.id,
            provider: row.provider,
            planName: row.plan_name,   // DB: plan_name -> Frontend: planName
            type: row.type,            // Term Life, Health, etc.
            category: row.category,    // Individual, Family, Car, etc.
            premium: parseInt(row.premium), // Ensure it's a number
            coverage: row.coverage,
            term: row.term,
            // Postgres returns arrays automatically, but we fallback to empty array just in case
            features: Array.isArray(row.features) ? row.features : [], 
            badge: row.badge
        }));

        res.json(formattedPolicies);

    } catch (err) {
        console.error("Error fetching policies:", err);
        res.status(500).json({ message: "Server Error fetching policies" });
    }
});
*/

/// 2. UPDATE PROFILE ROUTES (Replace existing /api/user/profile routes)
// GET Profile
// --- GET Profile (Streamlined) ---
app.get('/api/user/profile', ensureAuthenticated, async (req, res) => {
    try {
        const r = await db.query('SELECT * FROM users WHERE user_id = $1', [req.user.user_id]);
        if (r.rows.length === 0) return res.json({});
        const u = r.rows[0];
        
        res.json({
            age: u.age, // CHANGED: dob -> age
            gender: u.gender,
            dependents: u.dependents,
            city: u.city,
            incomeRange: u.income_range,
            occupation: u.occupation_type,
            existingLoans: u.existing_loans,
            smoker: u.is_smoker,
            diseases: u.pre_existing_diseases ? u.pre_existing_diseases.split(',') : [],
            lifeGoal: u.life_goal,
            healthType: u.health_plan_type,
            riskAppetite: u.risk_appetite,
            tax80c: u.tax_saving_80c,
            tax80d: u.tax_saving_80d
        });
    } catch (err) { console.error(err); res.status(500).send("Server Error"); }
});


// --- PUT Profile (Streamlined) ---
app.put('/api/user/profile', ensureAuthenticated, async (req, res) => {
    // CHANGED: dob -> age
    const { 
        age, gender, dependents, city,
        incomeRange, occupation, existingLoans,
        smoker, diseases,
        lifeGoal, healthType, riskAppetite, tax80c, tax80d 
    } = req.body;

    try {
        await db.query(`
            UPDATE users SET 
            age=$1, gender=$2, dependents=$3, city=$4,
            income_range=$5, occupation_type=$6, existing_loans=$7,
            is_smoker=$8, pre_existing_diseases=$9,
            life_goal=$10, health_plan_type=$11, risk_appetite=$12, 
            tax_saving_80c=$13, tax_saving_80d=$14
            WHERE user_id=$15
        `, [
            age || null, gender, dependents, city, // CHANGED: age mapped to $1
            incomeRange, occupation, existingLoans,
            smoker, diseases ? diseases.join(',') : "",
            lifeGoal, healthType, riskAppetite, tax80c, tax80d,
            req.user.user_id
        ]);
        res.json({ message: "Profile Updated" });
    } catch (err) { console.error(err); res.status(500).send("Update failed"); }
});


// --- DEBUG: LIST AVAILABLE MODELS ---
async function listModels() {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    console.log("Checking available models...");
    // Note: older versions of the SDK might use .listModels() differently
    // This works for @google/generative-ai version 0.1.0+
    const modelResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await modelResponse.json();
    
    if (data.models) {
      console.log("✅ AVAILABLE MODELS FOR YOUR KEY:");
      data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes("generateContent")) {
          console.log(`   - ${m.name.replace('models/', '')}`);
        }
      });
    } else {
      console.log("❌ No models found. Response:", data);
    }
  } catch (err) {
    console.error("❌ Could not list models:", err.message);
  }
}

// =========================================================
// === NEW: PREMIUM & RENEWAL MANAGEMENT ROUTES ============
// =========================================================

// GET Policies (Unchanged)
app.get('/api/policies', ensureAuthenticated, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM userpolicies WHERE user_id = $1 ORDER BY due_date ASC',
            [req.user.user_id]
        );
        // Format data for frontend
        const formattedPolicies = result.rows.map(row => ({
            id: row.id,
            policyName: row.policy_name,
            insurer: row.insurer,
            premiumAmount: parseFloat(row.premium_amount),
            dueDate: row.due_date,
            reminderSettings: row.reminder_settings,
            googleEventId: row.google_event_id
        }));
        res.json(formattedPolicies);
    } catch (err) {
        console.error("Error fetching policies:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST Route - ADD New Policy & Send Email Notification
app.post('/api/policies', ensureAuthenticated, async (req, res) => {
    const { policyName, insurer, premiumAmount, dueDate, reminderSettings } = req.body;
    const userEmail = req.user.email; // Get user's email from session

    if (!policyName || !insurer || !premiumAmount || !dueDate) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // 1. Save to Database first
        const result = await db.query(
            `INSERT INTO userpolicies (user_id, policy_name, insurer, premium_amount, due_date, reminder_settings) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [req.user.user_id, policyName, insurer, premiumAmount, dueDate, JSON.stringify(reminderSettings)]
        );
        const newPolicy = result.rows[0];

        // 2. Handle Email Notification (If selected by user)
        if (reminderSettings.email) {
            console.log(`[Server] Attempting to send confirmation email to ${userEmail}...`);
            
            // This tries to send an email. Since we used 'jsonTransport: true' above, it will just log the email structure to your console.
            transporter.sendMail({
                from: '"WealthGuard Reminders" <no-reply@wealthguard.com>',
                to: userEmail,
                subject: `Reminder Set: ${policyName}`,
                html: `<h3>Policy Added Successfully</h3><p>We will remind you to pay <strong>₹${premiumAmount}</strong> for <strong>${policyName}</strong> before <strong>${dueDate}</strong>.</p>`
            }, (err, info) => {
               if (err) console.error("[Email Error]:", err);
               else console.log("[Email Success (Mocked)] Message ID:", info.messageId);
            });
        }

        // Send the saved policy back to frontend
        res.json({
            id: newPolicy.id,
            policyName: newPolicy.policy_name,
            insurer: newPolicy.insurer,
            premiumAmount: parseFloat(newPolicy.premium_amount),
            dueDate: newPolicy.due_date,
            reminderSettings: newPolicy.reminder_settings
        });

    } catch (err) {
        console.error("Error adding policy:", err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE Route (Unchanged)
app.delete('/api/policies/:id', ensureAuthenticated, async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM userpolicies WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.user_id]
        );
        if (result.rowCount === 0) return res.status(404).json({ message: "Policy not found" });
        res.json({ message: 'Policy deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GOOGLE CALENDAR SYNC ROUTE
app.post('/api/reminders/google-calendar', ensureAuthenticated, async (req, res) => {
    const { policyName, premiumAmount, dueDate } = req.body;

    try {
        // 1. Get the latest tokens for this user from the DB
        const userResult = await db.query('SELECT google_access_token, google_refresh_token FROM users WHERE user_id = $1', [req.user.user_id]);
        const userTokens = userResult.rows[0];

        if (!userTokens?.google_access_token) {
            return res.status(400).json({ message: "Google Calendar not connected. Please log out and log in again." });
        }

        // 2. Setup Google Credentials
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "http://localhost:5001/api/auth/google/callback"
        );

        oauth2Client.setCredentials({
            access_token: userTokens.google_access_token,
            refresh_token: userTokens.google_refresh_token // Handles token expiration automatically
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // 3. Create the Event Object
        const event = {
            summary: `Pay Premium: ${policyName}`,
            description: `Reminder for ${policyName}. Amount: ₹${premiumAmount}`,
            start: {
                date: dueDate, // All-day event (YYYY-MM-DD)
            },
            end: {
                date: dueDate,
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // Email 1 day before
                    { method: 'popup', minutes: 60 },      // Notification 1 hour before
                ],
            },
        };

        // 4. Send to Google
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        console.log("Calendar Event Created:", response.data.htmlLink);
        res.json({ success: true, message: 'Event added to Google Calendar!' });

    } catch (error) {
        console.error('Google Calendar Error:', error);
        res.status(500).json({ error: 'Failed to sync with Google Calendar. Try logging in again.' });
    }
});
// GET Route: Fetch Events FROM Google Calendar
app.get('/api/reminders/google-calendar', ensureAuthenticated, async (req, res) => {
    try {
        // 1. Get User Tokens
        const userResult = await db.query('SELECT google_access_token, google_refresh_token FROM users WHERE user_id = $1', [req.user.user_id]);
        const userTokens = userResult.rows[0];

        if (!userTokens?.google_access_token) {
            return res.status(400).json({ message: "Not connected to Google." });
        }

        // 2. Setup Google Client
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "http://localhost:5001/api/auth/google/callback"
        );
        oauth2Client.setCredentials({
            access_token: userTokens.google_access_token,
            refresh_token: userTokens.google_refresh_token
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // 3. Fetch Events (Next 30 days)
        const now = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: now.toISOString(),
            timeMax: nextMonth.toISOString(),
            maxResults: 20,
            singleEvents: true,
            orderBy: 'startTime',
        });

        // 4. Send events to frontend
        const events = response.data.items.map(event => ({
            id: event.id,
            title: event.summary,
            date: event.start.dateTime || event.start.date, // Handle both timed and all-day events
            link: event.htmlLink
        }));

        res.json(events);

    } catch (error) {
        console.error('Fetch Calendar Error:', error);
        res.status(500).json({ error: 'Failed to fetch Google Calendar events.' });
    }
});

// =========================================================

// Run this on startup
listModels();

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
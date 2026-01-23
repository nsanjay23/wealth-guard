const { Pool } = require('pg');
require('dotenv').config();

// Use the connection string from your .env file
// It usually looks like: postgres://user:password@host/database?sslmode=require
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, 
    ssl: {
        rejectUnauthorized: false // CRITICAL for Neon/AWS connections to work reliably
    },
    // Add these timeouts to keep connections alive
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000, 
    max: 20 // Don't open too many connections at once
});

// Add a listener to catch errors on idle clients so the app doesn't crash
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1); // Or handle it without exiting if you prefer
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
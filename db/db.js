const { Pool } = require('pg');
// Make sure the path is correct if db.js is in the db folder
require('dotenv').config({ path: '../backend/.env' });

// --- ADD THIS LINE ---
console.log('DATABASE_URL being used:', process.env.DATABASE_URL);
// --------------------

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
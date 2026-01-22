const { Pool } = require('pg');
require('dotenv').config({ path: '../backend/.env' });

// Use the URL from env, or fallback to the hardcoded one if env fails
const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_G9ebfOTEYH2c@ep-wispy-star-a1dh471a-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // <--- THIS IS THE MAGIC FIX FOR NEON
  },
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
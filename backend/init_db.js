const { Pool } = require('pg');

// YOUR NEON URL
const connectionString = "postgresql://neondb_owner:npg_G9ebfOTEYH2c@ep-wispy-star-a1dh471a-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const createTablesQuery = `
  -- 1. FORCE CREATE SCHEMA & SET PATH
  CREATE SCHEMA IF NOT EXISTS public;
  SET search_path TO public;

  -- 2. Create USERS Table
  CREATE TABLE IF NOT EXISTS public.users (
      user_id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      -- Profile Fields
      date_of_birth DATE,
      gender VARCHAR(50),
      marital_status VARCHAR(50),
      dependents INT,
      city VARCHAR(100),
      income_range VARCHAR(100),
      occupation_type VARCHAR(100),
      existing_loans VARCHAR(255),
      is_smoker BOOLEAN,
      alcohol_consumer BOOLEAN,
      pre_existing_diseases TEXT,
      life_goal VARCHAR(255),
      health_plan_type VARCHAR(100),
      risk_appetite VARCHAR(50),
      tax_saving_80c BOOLEAN,
      tax_saving_80d BOOLEAN
  );

  -- 3. Create PORTFOLIOS Table
  CREATE TABLE IF NOT EXISTS public.portfolios (
      portfolio_id SERIAL PRIMARY KEY,
      user_id INT REFERENCES public.users(user_id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      is_visible BOOLEAN DEFAULT TRUE,
      is_pinned BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- 4. Create PORTFOLIO_STOCKS Table
  CREATE TABLE IF NOT EXISTS public.portfolio_stocks (
      stock_id SERIAL PRIMARY KEY,
      portfolio_id INT REFERENCES public.portfolios(portfolio_id) ON DELETE CASCADE,
      symbol VARCHAR(20) NOT NULL,
      quantity INT NOT NULL,
      avg_buy_price DECIMAL(12, 2) NOT NULL,
      last_known_price DECIMAL(12, 2) DEFAULT 0
  );

  -- 5. Create STOCK_HISTORY_CACHE Table
  CREATE TABLE IF NOT EXISTS public.stock_history_cache (
      symbol VARCHAR(20),
      range VARCHAR(10),
      "interval" VARCHAR(10),
      data JSONB,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (symbol, range, "interval")
  );
`;

async function run() {
  console.log("🚀 Connecting to database...");
  try {
    // We execute the query
    await pool.query(createTablesQuery);
    console.log("✅ SUCCESS: Schema fixed and tables created!");
  } catch (err) {
    console.error("❌ ERROR:", err);
  } finally {
    await pool.end();
  }
}

run();
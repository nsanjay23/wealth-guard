const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');
require('dotenv').config();

// Connect to Neon DB
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const results = [];
const csvFile = 'real_policies_cleaned.csv'; // Make sure this name matches

console.log(`🚀 Reading ${csvFile}...`);

fs.createReadStream(csvFile)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
        console.log(`📂 Found ${results.length} policies. Uploading to DB...`);

        try {
            // 1. Clear old data (Optional)
            await pool.query('DELETE FROM policies');

            // 2. Insert new data
            for (const row of results) {
                // Features are already pipe-separated by the Python script
                const featureArray = row.features ? row.features.split('|') : [];

                await pool.query(
                    `INSERT INTO policies (provider, plan_name, type, category, premium, coverage, term, features, badge) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        row.provider, 
                        row.plan_name, 
                        row.type, 
                        row.category, 
                        parseInt(row.premium) || 0, 
                        row.coverage, 
                        row.term, 
                        featureArray, 
                        row.badge
                    ]
                );
            }
            console.log("✅ SUCCESS: All policies imported!");
        } catch (err) {
            console.error("❌ Error uploading:", err);
        } finally {
            pool.end();
        }
    });
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function addReviewsTable() {
  const client = await pool.connect();

  try {
    console.log("Creating reviews table...");

    // Create reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        rating DECIMAL(2, 1) CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);
    console.log("✓ Reviews table created");

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
    `);
    console.log("✓ Indexes created");

    // Generate sample reviews for existing users and products
    console.log("Generating sample reviews...");

    const usersResult = await client.query("SELECT id FROM users");
    const productsResult = await client.query(
      "SELECT id FROM products LIMIT 100"
    );

    if (usersResult.rows.length > 0 && productsResult.rows.length > 0) {
      const users = usersResult.rows;
      const products = productsResult.rows;

      // Generate 50-100 random reviews per user
      for (const user of users) {
        const numReviews = Math.floor(Math.random() * 51) + 50; // 50-100 reviews
        const reviewedProducts = new Set();

        for (
          let i = 0;
          i < numReviews && reviewedProducts.size < products.length;
          i++
        ) {
          const randomProduct =
            products[Math.floor(Math.random() * products.length)];

          if (!reviewedProducts.has(randomProduct.id)) {
            reviewedProducts.add(randomProduct.id);

            // Generate rating (weighted towards higher ratings)
            const rand = Math.random();
            let rating;
            if (rand < 0.5) rating = 5;
            else if (rand < 0.75) rating = 4;
            else if (rand < 0.9) rating = 3;
            else if (rand < 0.97) rating = 2;
            else rating = 1;

            try {
              await client.query(
                `INSERT INTO reviews (user_id, product_id, rating, review_text) 
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (user_id, product_id) DO NOTHING`,
                [
                  user.id,
                  randomProduct.id,
                  rating,
                  `Sample review for product ${randomProduct.id}`,
                ]
              );
            } catch (err) {
              // Skip duplicates
            }
          }
        }
      }

      const reviewCount = await client.query("SELECT COUNT(*) FROM reviews");
      console.log(`✓ Generated ${reviewCount.rows[0].count} sample reviews`);
    } else {
      console.log(
        "⚠ No users or products found. Skipping sample review generation."
      );
    }

    console.log("\n✅ Reviews table setup completed successfully!");
  } catch (error) {
    console.error("❌ Error setting up reviews table:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

addReviewsTable();

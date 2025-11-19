require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

// Create a new pool with your database credentials from .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Function to read and parse CSV file
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

// Function to extract numeric price from string
function extractPrice(priceString) {
  if (!priceString) return 0;
  const numericValue = parseFloat(priceString);
  return isNaN(numericValue) ? 0 : numericValue;
}

// Function to calculate discount percentage
function calculateDiscount(initialPrice, finalPrice) {
  if (!initialPrice || !finalPrice || initialPrice <= finalPrice) return 0;
  return Math.round(((initialPrice - finalPrice) / initialPrice) * 100);
}

// Function to get first image from image URLs
function getFirstImage(imageUrls) {
  if (!imageUrls) return null;
  try {
    const urls = JSON.parse(imageUrls);
    return Array.isArray(urls) && urls.length > 0 ? urls[0] : null;
  } catch {
    return null;
  }
}

// Function to parse categories from CSV
function parseCategories(categoriesString) {
  if (!categoriesString) return [];
  try {
    const categories = JSON.parse(categoriesString);
    return Array.isArray(categories) ? categories : [];
  } catch {
    return [];
  }
}

async function initDatabase() {
  const client = await pool.connect();

  try {
    console.log("Starting database initialization...");

    // Drop existing tables if you want to recreate them
    // UNCOMMENT THESE LINES IF YOU WANT TO RESET YOUR DATABASE
    /*
    await client.query('DROP TABLE IF EXISTS order_items CASCADE');
    await client.query('DROP TABLE IF EXISTS orders CASCADE');
    await client.query('DROP TABLE IF EXISTS cart CASCADE');
    await client.query('DROP TABLE IF EXISTS products CASCADE');
    await client.query('DROP TABLE IF EXISTS news CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('✓ Existing tables dropped');
    */

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Users table created");

    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(5, 2) DEFAULT 0,
        image_url VARCHAR(500),
        category TEXT[] DEFAULT '{}',
        stock INTEGER DEFAULT 0,
        total_rating_score INTEGER DEFAULT 0,
        number_of_ratings INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Products table created");

    // Create cart table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);
    console.log("✓ Cart table created");

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total_amount DECIMAL(10, 2) NOT NULL,
        shipping_address TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Orders table created");

    // Create order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Order items table created");

    // Create news table
    await client.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(255),
        image_url VARCHAR(500),
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ News table created");

    // Read and insert products from CSV
    const csvPath = path.join(__dirname, "walmart-products.csv");
    console.log("📖 Reading CSV file...");

    const csvData = await readCSV(csvPath);
    console.log(`✓ Found ${csvData.length} products in CSV`);

    // Insert products from CSV (limit to first 20 for performance)
    const productsToInsert = csvData.slice(0, 500);

    for (const row of productsToInsert) {
      const finalPrice = extractPrice(row.final_price);
      const initialPrice = extractPrice(row.initial_price);
      const discount = calculateDiscount(initialPrice, finalPrice);
      const imageUrl = getFirstImage(row.image_urls) || row.main_image;
      const categories = parseCategories(row.categories);

      // Calculate rating data
      const ratingStars = parseFloat(row.rating) || 0;
      const reviewCount = parseInt(row.review_count) || 0;
      const totalRatingScore = Math.round(ratingStars * reviewCount);

      // Set random stock between 10-100
      const stock = Math.floor(Math.random() * 91) + 10;

      await client.query(
        `INSERT INTO products (name, description, price, discount, category, stock, image_url, total_rating_score, number_of_ratings) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT DO NOTHING`,
        [
          row.product_name || "Unknown Product",
          row.description || "",
          finalPrice,
          discount,
          categories,
          stock,
          imageUrl,
          totalRatingScore,
          reviewCount,
        ]
      );
    }

    console.log(`✓ ${productsToInsert.length} products inserted from CSV`);

    // Insert sample news
    await client.query(`
      INSERT INTO news (title, content, author) 
      VALUES 
        ('New Product Launch', 'We are excited to announce our new product line launching next month with amazing features!', 'Marketing Team'),
        ('Summer Sale 2025', 'Get up to 50% off on selected items. Limited time offer - sale ends next week!', 'Sales Department'),
        ('Website Update', 'Our platform has been updated with new features, improved performance, and better user experience.', 'Tech Team'),
        ('Customer Appreciation Day', 'Thank you for being our valued customers! Enjoy special discounts throughout the month.', 'Customer Service')
      ON CONFLICT DO NOTHING
    `);
    console.log("✓ Sample news inserted");

    console.log("\n✅ Database initialization completed successfully!");
    console.log("\n📊 Database Summary:");
    console.log("   - All tables created");
    console.log("   - Products loaded from CSV file");
    console.log("   - Sample news data inserted");
    console.log("   - Ready to use with your Vue.js frontend!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();

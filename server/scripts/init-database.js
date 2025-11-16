require("dotenv").config();
const { Pool } = require("pg");

// Create a new pool with your database credentials from .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function initDatabase() {
  const client = await pool.connect();

  try {
    console.log("Starting database initialization...");

    // Drop existing tables if you want to recreate them with new structure
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

    // Create products table with new fields
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(5, 2) DEFAULT 0,
        image_url VARCHAR(500),
        category VARCHAR(100),
        stock INTEGER DEFAULT 0,
        total_rating_score INTEGER DEFAULT 0,
        number_of_ratings INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Products table created");

    // If table already exists, add new columns
    try {
      await client.query(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS discount DECIMAL(5, 2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS total_rating_score INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS number_of_ratings INTEGER DEFAULT 0
      `);
      console.log("✓ New columns added to products table");
    } catch (err) {
      console.log("⚠ Columns may already exist, continuing...");
    }

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

    // Insert sample products with English text and new fields
    await client.query(`
      INSERT INTO products (name, description, price, discount, category, stock, image_url, total_rating_score, number_of_ratings) 
      VALUES 
        ('MacBook Pro 15"', 'High-performance laptop with 16GB RAM and M2 chip', 1299.99, 15.00, 'Electronics', 10, 'https://salt.tikicdn.com/cache/280x280/ts/product/7a/5b/dc/ecb1af2e1c263b9e6ba2a0f4fc9b44ed.jpg', 245, 50),
        ('Wireless Mouse', 'Ergonomic wireless mouse with precision tracking', 29.99, 20.00, 'Accessories', 50, 'https://salt.tikicdn.com/cache/280x280/ts/product/2d/79/5d/8fb40d8c6ff2f001b3e5e2656bca090e.jpg', 180, 38),
        ('Mechanical Keyboard RGB', 'RGB mechanical gaming keyboard with Cherry MX switches', 89.99, 25.00, 'Accessories', 30, 'https://salt.tikicdn.com/cache/280x280/ts/product/46/41/38/488c5e88e4d48d5d7b8f7c2038d9e1a8.jpg', 420, 85),
        ('USB-C Hub 7-in-1', 'Premium USB-C multiport adapter with 4K HDMI output', 49.99, 10.00, 'Accessories', 25, 'https://salt.tikicdn.com/cache/280x280/ts/product/93/26/2e/e73f0bbbc3e2d6912f6a9efbb515a218.jpg', 165, 35),
        ('4K Monitor 27"', '4K UHD IPS display with HDR support', 399.99, 30.00, 'Electronics', 15, 'https://salt.tikicdn.com/cache/280x280/ts/product/c5/36/42/aa49b37de6e1ff3f99323651c7c8a8a0.jpg', 385, 78),
        ('The Art of War', 'Classic strategy and philosophy book by Sun Tzu', 12.99, 0, 'Books', 100, 'https://salt.tikicdn.com/cache/280x280/ts/product/f9/f9/ee/c549f28adea452310419ee9f3b313857.jpg', 470, 95),
        ('Atomic Habits', 'Bestselling self-improvement book by James Clear', 16.99, 15.00, 'Books', 75, 'https://salt.tikicdn.com/cache/280x280/ts/product/fb/da/47/d7c3470ea5fa56b62a1dd83b71be65c5.jpg', 490, 98),
        ('Wireless Earbuds Pro', 'Premium noise-cancelling wireless earbuds', 149.99, 20.00, 'Electronics', 40, 'https://salt.tikicdn.com/cache/280x280/ts/product/88/03/06/84ea3ec7703a9f08410d06aea15ee986.jpg', 360, 72),
        ('Smart Watch Series 8', 'Advanced fitness tracking smartwatch with GPS', 299.99, 12.00, 'Electronics', 20, 'https://salt.tikicdn.com/cache/280x280/ts/product/1f/69/22/8d7d62affd9afa3a2ee2d492d3812f68.jpg', 410, 82),
        ('Portable SSD 1TB', 'Ultra-fast portable solid state drive', 119.99, 18.00, 'Electronics', 35, 'https://salt.tikicdn.com/cache/280x280/ts/product/67/4a/3b/7a8182516741899d124922dadca876ee.jpg', 290, 58)
      ON CONFLICT DO NOTHING
    `);
    console.log("✓ Sample products inserted");

    // Insert sample news in English
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
    console.log("   - All tables created with updated structure");
    console.log(
      "   - Products now include: discount, total_rating_score, number_of_ratings"
    );
    console.log("   - Sample data inserted in English");
    console.log("   - Ready to use with your Vue.js frontend!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();

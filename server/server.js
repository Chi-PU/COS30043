require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;
const cookieParser = require("cookie-parser");

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err.stack);
  } else {
    console.log("Connected to PostgreSQL");
    release();
  }
});

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Add this line after express.json()
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-this-secret",
    resave: false,
    saveUninitialized: false,
    name: "connect.sid", // Explicitly set cookie name
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      sameSite: "lax",
      path: "/",
    },
  })
);

// Serve static files (product images, etc.)
app.use("/uploads", express.static(path.join(__dirname, "../public")));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized. Please login." });
  }
};

// ==================== AUTH ROUTES ====================

// Register new user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name",
      [email, hashedPassword, name]
    );

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Set session
    req.session.userId = user.id;
    req.session.email = user.email;

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).json({ error: "Could not logout" });
    }

    // Clear the session cookie with proper options
    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: "lax",
    });

    res.json({ message: "Logout successful" });
  });
});

// Check auth status
app.get("/api/auth/me", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name FROM users WHERE id = $1",
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Auth check error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ==================== PRODUCT ROUTES ====================

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT *, CASE WHEN number_of_ratings > 0 THEN ROUND(CAST(total_rating_score AS DECIMAL) / number_of_ratings, 2) ELSE 0 END as average_rating FROM products ORDER BY created_at DESC"
    );
    res.json({ products: result.rows });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single product
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT *, CASE WHEN number_of_ratings > 0 THEN ROUND(CAST(total_rating_score AS DECIMAL) / number_of_ratings, 2) ELSE 0 END as average_rating FROM products WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create product (protected)
app.post("/api/products", isAuthenticated, async (req, res) => {
  try {
    const { name, description, price, discount, image_url, category, stock } =
      req.body;

    const result = await pool.query(
      "INSERT INTO products (name, description, price, discount, image_url, category, stock, total_rating_score, number_of_ratings) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0) RETURNING *",
      [name, description, price, discount || 0, image_url, category, stock]
    );

    res.status(201).json({
      message: "Product created",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update product (protected)
app.put("/api/products/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, discount, image_url, category, stock } =
      req.body;

    const result = await pool.query(
      "UPDATE products SET name = $1, description = $2, price = $3, discount = $4, image_url = $5, category = $6, stock = $7 WHERE id = $8 RETURNING *",
      [name, description, price, discount || 0, image_url, category, stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product updated",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete product (protected)
app.delete("/api/products/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add rating to product (protected)
app.post("/api/products/:id/rate", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    // Validate rating (must be 1-5)
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Update product ratings
    const result = await pool.query(
      "UPDATE products SET total_rating_score = total_rating_score + $1, number_of_ratings = number_of_ratings + 1 WHERE id = $2 RETURNING *",
      [rating, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = result.rows[0];
    const averageRating =
      product.total_rating_score / product.number_of_ratings;

    res.json({
      message: "Rating added successfully",
      product: product,
      averageRating: averageRating.toFixed(2),
    });
  } catch (error) {
    console.error("Add rating error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ==================== CART ROUTES ====================

// Get user's cart
app.get("/api/cart", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.quantity, p.* 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = $1`,
      [req.session.userId]
    );

    res.json({ cart: result.rows });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add to cart
app.post("/api/cart", isAuthenticated, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.session.userId;

    // Check if item already in cart
    const existing = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
      [user_id, product_id]
    );

    if (existing.rows.length > 0) {
      // Update quantity
      const result = await pool.query(
        "UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 RETURNING *",
        [quantity, user_id, product_id]
      );
      res.json({ message: "Cart updated", item: result.rows[0] });
    } else {
      // Add new item
      const result = await pool.query(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
        [user_id, product_id, quantity]
      );
      res.status(201).json({ message: "Added to cart", item: result.rows[0] });
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Remove from cart
app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM cart WHERE id = $1 AND user_id = $2", [
      id,
      req.session.userId,
    ]);

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ==================== ORDER ROUTES ====================

// Create order
app.post("/api/orders", isAuthenticated, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { items, total_amount, shipping_address } = req.body;
    const user_id = req.session.userId;

    // Create order
    const orderResult = await client.query(
      "INSERT INTO orders (user_id, total_amount, shipping_address, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, total_amount, shipping_address, "pending"]
    );

    const order_id = orderResult.rows[0].id;

    // Create order items
    for (const item of items) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [order_id, item.product_id, item.quantity, item.price]
      );
    }

    // Clear cart
    await client.query("DELETE FROM cart WHERE user_id = $1", [user_id]);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Order created successfully",
      order: orderResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create order error:", error);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

// Get user's orders
app.get("/api/orders", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [req.session.userId]
    );

    res.json({ orders: result.rows });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ==================== NEWS ROUTES ====================

// Get all news articles
app.get("/api/news", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM news ORDER BY published_at DESC"
    );
    res.json({ news: result.rows });
  } catch (error) {
    console.error("Get news error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single news article
app.get("/api/news/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM news WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "News article not found" });
    }

    res.json({ article: result.rows[0] });
  } catch (error) {
    console.error("Get news error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

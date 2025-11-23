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

//npm install bcrypt cookie-parser cors csv-parser dotenv express express-session pg

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

    // Create user with is_admin field
    const result = await pool.query(
      "INSERT INTO users (email, password, name, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, email, name, is_admin",
      [email, hashedPassword, name, false]
    );

    // Set session
    req.session.userId = result.rows[0].id;
    req.session.email = result.rows[0].email;

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

    console.log("Login attempt for:", email);

    // Find user - IMPORTANT: Include is_admin field
    const result = await pool.query(
      "SELECT id, email, name, password, is_admin FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      console.log("User not found:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    console.log("User found:", {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin,
    });

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      console.log("Invalid password for:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Set session
    req.session.userId = user.id;
    req.session.email = user.email;

    console.log("Login successful for:", email);

    // Return user data WITHOUT password, but WITH is_admin
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin, // Include is_admin field
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

// Check auth status - UPDATED to include is_admin
app.get("/api/auth/me", isAuthenticated, async (req, res) => {
  try {
    // Include is_admin in the SELECT query
    const result = await pool.query(
      "SELECT id, email, name, is_admin FROM users WHERE id = $1",
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

// ==================== CART ROUTES ====================

// Get user's cart
app.get("/api/cart", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.id as cart_id,
        c.quantity,
        c.created_at as added_at,
        p.id as product_id,
        p.name,
        p.description,
        p.price,
        p.discount,
        p.image_url,
        p.category,
        p.stock,
        p.total_rating_score,
        p.number_of_ratings
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [req.session.userId]
    );

    // Transform the data to match frontend expectations
    const cartItems = result.rows.map((row) => ({
      id: row.cart_id,
      quantity: row.quantity,
      added_at: row.added_at,
      product: {
        id: row.product_id,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        discount: parseFloat(row.discount),
        image_url: row.image_url,
        category: row.category,
        stock: row.stock,
        total_rating_score: row.total_rating_score,
        number_of_ratings: row.number_of_ratings,
      },
    }));

    res.json({ cart: cartItems });
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

    // Validate product exists and has stock
    const productCheck = await pool.query(
      "SELECT id, stock FROM products WHERE id = $1",
      [product_id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (productCheck.rows[0].stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // Check if item already in cart
    const existing = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
      [user_id, product_id]
    );

    if (existing.rows.length > 0) {
      // Update quantity
      const newQuantity = existing.rows[0].quantity + quantity;

      // Check if new quantity exceeds stock
      if (newQuantity > productCheck.rows[0].stock) {
        return res.status(400).json({
          error: `Only ${productCheck.rows[0].stock} items available in stock`,
        });
      }

      const result = await pool.query(
        "UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *",
        [newQuantity, user_id, product_id]
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

// Update cart item quantity
app.put("/api/cart/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    // Get cart item with product info
    const cartItem = await pool.query(
      `SELECT c.*, p.stock 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.id = $1 AND c.user_id = $2`,
      [id, req.session.userId]
    );

    if (cartItem.rows.length === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    // Check stock availability
    if (quantity > cartItem.rows[0].stock) {
      return res.status(400).json({
        error: `Only ${cartItem.rows[0].stock} items available in stock`,
      });
    }

    // Update quantity
    const result = await pool.query(
      "UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [quantity, id, req.session.userId]
    );

    res.json({
      message: "Cart updated successfully",
      item: result.rows[0],
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Remove from cart
app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Clear entire cart
app.delete("/api/cart", isAuthenticated, async (req, res) => {
  try {
    await pool.query("DELETE FROM cart WHERE user_id = $1", [
      req.session.userId,
    ]);

    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Clear cart error:", error);
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

// Add this to your server.js file, before the recommendations router line

const axios = require("axios");

// Flask recommendation service URL
const RECOMMENDATION_SERVICE =
  process.env.RECOMMENDATION_SERVICE_URL || "http://localhost:5001";

// ==================== RECOMMENDATION ENDPOINTS ====================

// Proxy endpoint to get recommendations
app.get("/api/recommendations/for-you", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const limit = req.query.limit || 10;

    const response = await axios.get(
      `${RECOMMENDATION_SERVICE}/api/recommendations/${userId}`,
      {
        params: { limit },
        timeout: 10000,
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("[ERROR] Error fetching recommendations:", error.message);

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(503).json({
        error: "Recommendation service unavailable",
        recommendations: [],
      });
    }
  }
});

// Manual retrain - triggers retraining immediately
app.post("/api/recommendations/retrain", isAuthenticated, async (req, res) => {
  try {
    console.log(
      `[RETRAIN] User ${req.session.userId} manually triggered model retraining`
    );

    const response = await axios.post(
      `${RECOMMENDATION_SERVICE}/api/retrain`,
      {},
      { timeout: 30000 } // 30 second timeout for training
    );

    res.json({
      message: "Model retrained successfully",
      ...response.data,
    });
  } catch (error) {
    console.error("[ERROR] Error retraining model:", error.message);

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(503).json({
        error: "Recommendation service unavailable",
      });
    }
  }
});

// Check and retrain - checks if user has 10+ ratings, then retrains
app.post(
  "/api/recommendations/check-and-retrain",
  isAuthenticated,
  async (req, res) => {
    try {
      const userId = req.session.userId;
      console.log(
        `[CHECK-RETRAIN] Checking if user ${userId} is eligible for retraining`
      );

      const response = await axios.post(
        `${RECOMMENDATION_SERVICE}/api/check-and-retrain/${userId}`,
        {},
        { timeout: 30000 }
      );

      res.json(response.data);
    } catch (error) {
      console.error("[ERROR] Error in check-and-retrain:", error.message);

      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(503).json({
          error: "Recommendation service unavailable",
        });
      }
    }
  }
);

// Debug endpoint - proxy to Flask debug
app.get("/api/recommendations/debug", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log(`[DEBUG] Getting debug info for user ${userId}`);

    const response = await axios.get(
      `${RECOMMENDATION_SERVICE}/api/debug/${userId}`,
      { timeout: 10000 }
    );

    res.json(response.data);
  } catch (error) {
    console.error("[ERROR] Error getting debug info:", error.message);

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(503).json({
        error: "Recommendation service unavailable",
      });
    }
  }
});

// Rating endpoint - NO automatic retraining
app.post("/api/products/:id/rate", isAuthenticated, async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { rating } = req.body;
    const user_id = req.session.userId;

    // Validate rating (must be 1-5)
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    await client.query("BEGIN");

    // Check if user already rated this product
    const existingReview = await client.query(
      "SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2",
      [user_id, id]
    );

    if (existingReview.rows.length > 0) {
      // Update existing review
      const oldRating = existingReview.rows[0].rating;
      const ratingDiff = rating - oldRating;

      await client.query(
        "UPDATE reviews SET rating = $1, created_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND product_id = $3",
        [rating, user_id, id]
      );

      // Update product ratings (adjust by difference)
      await client.query(
        "UPDATE products SET total_rating_score = total_rating_score + $1 WHERE id = $2",
        [ratingDiff, id]
      );
    } else {
      // Insert new review
      await client.query(
        "INSERT INTO reviews (user_id, product_id, rating, review_text) VALUES ($1, $2, $3, $4)",
        [user_id, id, rating, null]
      );

      // Update product ratings (add new rating)
      await client.query(
        "UPDATE products SET total_rating_score = total_rating_score + $1, number_of_ratings = number_of_ratings + 1 WHERE id = $2",
        [rating, id]
      );
    }

    // Get updated product
    const result = await client.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Product not found" });
    }

    await client.query("COMMIT");

    const product = result.rows[0];
    const averageRating =
      product.number_of_ratings > 0
        ? product.total_rating_score / product.number_of_ratings
        : 0;

    res.json({
      message:
        existingReview.rows.length > 0
          ? "Rating updated successfully"
          : "Rating added successfully",
      product: product,
      averageRating: averageRating.toFixed(2),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Add rating error:", error);

    if (error.code === "23505") {
      // Unique constraint violation
      res.status(400).json({ error: "You have already rated this product" });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    client.release();
  }
});

// ==================== RECOMMENDATION ROUTES ====================
const recommendationsRouter = require("./routes/recommendations");
app.use("/api/recommendations", recommendationsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

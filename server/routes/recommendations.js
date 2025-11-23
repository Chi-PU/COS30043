const express = require("express");
const router = express.Router();
const axios = require("axios");

const RECOMMENDATION_SERVICE_URL =
  process.env.RECOMMENDATION_SERVICE_URL || "http://localhost:5001";

// Authentication middleware (reuse from server.js)
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized. Please login." });
  }
};

// Get recommendations for current user
router.get("/for-you", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const limit = req.query.limit || 10;

    const response = await axios.get(
      `${RECOMMENDATION_SERVICE_URL}/api/recommendations/${userId}`,
      {
        params: { limit },
        timeout: 10000, // 10 second timeout
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Recommendation error:", error.message);

    // Return empty recommendations instead of error
    res.json({
      user_id: req.session.userId,
      recommendations: [],
      message: "Recommendations temporarily unavailable",
    });
  }
});

// Get similar users
router.get("/similar-users", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const limit = req.query.limit || 5;

    const response = await axios.get(
      `${RECOMMENDATION_SERVICE_URL}/api/similar-users/${userId}`,
      {
        params: { limit },
        timeout: 5000,
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Similar users error:", error.message);
    res.status(500).json({ error: "Failed to get similar users" });
  }
});

// Trigger model retraining (admin endpoint - you may want to add admin check)
router.post("/retrain", isAuthenticated, async (req, res) => {
  try {
    const response = await axios.post(
      `${RECOMMENDATION_SERVICE_URL}/api/retrain`,
      {},
      { timeout: 60000 } // 60 second timeout for training
    );
    res.json(response.data);
  } catch (error) {
    console.error("Retrain error:", error.message);
    res.status(500).json({ error: "Failed to retrain model" });
  }
});

// Health check
router.get("/health", async (req, res) => {
  try {
    const response = await axios.get(
      `${RECOMMENDATION_SERVICE_URL}/api/health`,
      { timeout: 3000 }
    );
    res.json(response.data);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: "Recommendation service unavailable",
    });
  }
});

module.exports = router;

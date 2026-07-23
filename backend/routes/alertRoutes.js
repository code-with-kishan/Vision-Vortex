// Alerts (withdrawal period, vaccination due, low stock, etc.)

const express = require("express");
const pool = require("../config/db");
const { requireLogin } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(requireLogin);

// GET all alerts for the logged-in user, newest first
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM alerts WHERE owner_id = ? ORDER BY created_at DESC LIMIT 50", [req.session.user.id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not fetch alerts" });
  }
});

// Mark a single alert as read
router.put("/:id/read", async (req, res) => {
  try {
    await pool.query("UPDATE alerts SET is_read = TRUE WHERE id = ? AND owner_id = ?", [req.params.id, req.session.user.id]);
    res.json({ success: true, message: "Alert marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not update alert" });
  }
});

module.exports = router;

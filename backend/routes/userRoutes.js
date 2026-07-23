// Admin-only route to see and manage all users on the platform

const express = require("express");
const pool = require("../config/db");
const { requireRole } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(requireRole("admin")); // only admin can use any route in this file

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, email, role, farm_name, phone, created_at FROM users ORDER BY created_at DESC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not fetch users" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not delete user" });
  }
});

module.exports = router;

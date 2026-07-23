// Handles register, login, logout and "who am I" (checking session)

const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const router = express.Router();

// -------- REGISTER --------
// Only farmers and vets can self-register from the public form.
// Admin accounts are created directly in the database (not through
// this public route) so that random users cannot make themselves admin.
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, farmName, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    const safeRole = role === "vet" ? "vet" : "farmer"; // block anything else, including "admin"

    // check if email is already used
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role, farm_name, phone) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, safeRole, farmName || null, phone || null]
    );

    // log the user in right away by saving to session
    req.session.user = { id: result.insertId, name, email, role: safeRole };

    res.status(201).json({ success: true, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Something went wrong while registering" });
  }
});

// -------- LOGIN --------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // save only the safe fields in session (never the password)
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      farmName: user.farm_name,
    };

    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Something went wrong while logging in" });
  }
});

// -------- LOGOUT --------
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logged out" });
  });
});

// -------- CHECK SESSION (used by frontend on every page load) --------
router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }
  res.json({ success: true, user: req.session.user });
});

module.exports = router;

// CRUD routes for animal registration.
// Every animal belongs to the logged-in farmer (owner_id = req.session.user.id)

const express = require("express");
const pool = require("../config/db");
const { requireLogin } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(requireLogin); // every route below needs the user to be logged in

// GET all animals belonging to the logged-in user (supports simple search)
router.get("/", async (req, res) => {
  try {
    const ownerId = req.session.user.id;
    const search = req.query.search ? `%${req.query.search}%` : null;

    let sql = "SELECT * FROM animals WHERE owner_id = ?";
    const params = [ownerId];

    if (search) {
      sql += " AND (name LIKE ? OR animal_tag LIKE ? OR breed LIKE ?)";
      params.push(search, search, search);
    }

    sql += " ORDER BY created_at DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Could not fetch animals" });
  }
});

// GET a single animal (only if it belongs to the logged-in user)
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM animals WHERE id = ? AND owner_id = ?", [
      req.params.id,
      req.session.user.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Animal not found" });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// CREATE a new animal
router.post("/", async (req, res) => {
  try {
    const { animalTag, name, species, breed, age, gender, weight, healthStatus } = req.body;

    if (!animalTag || !species) {
      return res.status(400).json({ success: false, message: "Animal tag and species are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO animals (owner_id, animal_tag, name, species, breed, age, gender, weight, health_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.session.user.id, animalTag, name || null, species, breed || null, age || null, gender || null, weight || null, healthStatus || "Healthy"]
    );

    res.status(201).json({ success: true, insertId: result.insertId });
  } catch (err) {
    console.error(err);
    // duplicate animal tag will throw a MySQL error code ER_DUP_ENTRY
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "This animal tag is already used" });
    }
    res.status(500).json({ success: false, message: "Could not add animal" });
  }
});

// UPDATE an animal
router.put("/:id", async (req, res) => {
  try {
    const { name, species, breed, age, gender, weight, healthStatus } = req.body;

    const [existing] = await pool.query("SELECT id FROM animals WHERE id = ? AND owner_id = ?", [
      req.params.id,
      req.session.user.id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Animal not found" });
    }

    await pool.query(
      `UPDATE animals SET name=?, species=?, breed=?, age=?, gender=?, weight=?, health_status=? WHERE id=?`,
      [name, species, breed, age, gender, weight, healthStatus, req.params.id]
    );

    res.json({ success: true, message: "Animal updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not update animal" });
  }
});

// DELETE an animal
router.delete("/:id", async (req, res) => {
  try {
    const [existing] = await pool.query("SELECT id FROM animals WHERE id = ? AND owner_id = ?", [
      req.params.id,
      req.session.user.id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Animal not found" });
    }

    await pool.query("DELETE FROM animals WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Animal deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not delete animal" });
  }
});

module.exports = router;

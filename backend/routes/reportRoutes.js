// Report generation.
// For a first-year project we are keeping this simple: the backend
// sends back plain JSON data, and the frontend has a "Print Report"
// button that uses the browser's own Print (Ctrl+P -> Save as PDF)
// feature. This avoids needing a complicated PDF library while still
// giving a real PDF file at the end.

const express = require("express");
const pool = require("../config/db");
const { requireLogin } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(requireLogin);

// Full antimicrobial usage report - this is the most important
// report for this project since it directly matches the problem
// statement (AMR tracking / compliance).
router.get("/antimicrobial-usage", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.medicine_name, m.dosage, m.vet_name, m.start_date, m.end_date,
              m.withdrawal_days, m.withdrawal_end_date, a.name AS animal_name, a.animal_tag
       FROM medicines m JOIN animals a ON m.animal_id = a.id
       WHERE m.owner_id = ? AND m.is_antimicrobial = TRUE
       ORDER BY m.start_date DESC`,
      [req.session.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not generate report" });
  }
});

router.get("/animals", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM animals WHERE owner_id = ?", [req.session.user.id]);
  res.json({ success: true, data: rows });
});

router.get("/vaccinations", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT v.*, a.name AS animal_name FROM vaccinations v JOIN animals a ON v.animal_id = a.id WHERE v.owner_id = ?`,
    [req.session.user.id]
  );
  res.json({ success: true, data: rows });
});

module.exports = router;

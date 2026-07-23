const express = require("express");
const pool = require("../config/db");
const { requireLogin } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(requireLogin);

// GET all vaccinations for the logged-in user
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.*, a.name AS animal_name, a.animal_tag
       FROM vaccinations v JOIN animals a ON v.animal_id = a.id
       WHERE v.owner_id = ? ORDER BY v.next_due_date ASC`,
      [req.session.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not fetch vaccination records" });
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const { animalId, vaccineName, dateGiven, nextDueDate, givenBy } = req.body;
    if (!animalId || !vaccineName || !dateGiven || !nextDueDate) {
      return res.status(400).json({ success: false, message: "Please fill all required fields" });
    }
    const [result] = await pool.query(
      "INSERT INTO vaccinations (animal_id, owner_id, vaccine_name, date_given, next_due_date, given_by) VALUES (?, ?, ?, ?, ?, ?)",
      [animalId, req.session.user.id, vaccineName, dateGiven, nextDueDate, givenBy || null]
    );
    res.status(201).json({ success: true, insertId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not add vaccination record" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { vaccineName, dateGiven, nextDueDate, givenBy } = req.body;
    const [existing] = await pool.query("SELECT id FROM vaccinations WHERE id = ? AND owner_id = ?", [req.params.id, req.session.user.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: "Record not found" });

    await pool.query(
      "UPDATE vaccinations SET vaccine_name=?, date_given=?, next_due_date=?, given_by=? WHERE id=?",
      [vaccineName, dateGiven, nextDueDate, givenBy, req.params.id]
    );
    res.json({ success: true, message: "Vaccination record updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not update record" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const [existing] = await pool.query("SELECT id FROM vaccinations WHERE id = ? AND owner_id = ?", [req.params.id, req.session.user.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: "Record not found" });

    await pool.query("DELETE FROM vaccinations WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Vaccination record deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not delete record" });
  }
});

module.exports = router;

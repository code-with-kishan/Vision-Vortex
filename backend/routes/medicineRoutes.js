// This is the main "antimicrobial usage tracking" part of the project.
// Every time a farmer or vet gives medicine to an animal, it gets
// logged here, along with the withdrawal period.

const express = require("express");
const pool = require("../config/db");
const { requireLogin } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(requireLogin);

// helper function - adds "days" number of days to a date string and
// returns a new date string in YYYY-MM-DD format
function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

// GET all medicine records for the logged-in user (optionally filtered by animal)
router.get("/", async (req, res) => {
  try {
    const ownerId = req.session.user.id;
    let sql = `
      SELECT m.*, a.name AS animal_name, a.animal_tag
      FROM medicines m
      JOIN animals a ON m.animal_id = a.id
      WHERE m.owner_id = ?`;
    const params = [ownerId];

    if (req.query.animalId) {
      sql += " AND m.animal_id = ?";
      params.push(req.query.animalId);
    }

    sql += " ORDER BY m.start_date DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Could not fetch medicine records" });
  }
});

// CREATE a medicine record
router.post("/", async (req, res) => {
  try {
    const { animalId, medicineName, isAntimicrobial, dosage, purpose, vetName, startDate, endDate, withdrawalDays } = req.body;

    if (!animalId || !medicineName || !startDate) {
      return res.status(400).json({ success: false, message: "Animal, medicine name and start date are required" });
    }

    // Only calculate withdrawal end date if we know when the treatment ends
    const withdrawalEndDate = endDate ? addDays(endDate, withdrawalDays) : null;

    const [result] = await pool.query(
      `INSERT INTO medicines
        (animal_id, owner_id, medicine_name, is_antimicrobial, dosage, purpose, vet_name, start_date, end_date, withdrawal_days, withdrawal_end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        animalId, req.session.user.id, medicineName, isAntimicrobial !== false, dosage || null,
        purpose || null, vetName || null, startDate, endDate || null, withdrawalDays || 0, withdrawalEndDate,
      ]
    );

    // If withdrawal end date is in the future, create an alert automatically
    if (withdrawalEndDate && new Date(withdrawalEndDate) >= new Date()) {
      await pool.query(
        "INSERT INTO alerts (owner_id, message, type) VALUES (?, ?, 'withdrawal')",
        [req.session.user.id, `Withdrawal period active for animal until ${withdrawalEndDate}. Do not sell milk/meat before this date.`]
      );
    }

    res.status(201).json({ success: true, insertId: result.insertId, withdrawalEndDate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Could not add medicine record" });
  }
});

// UPDATE a medicine record
router.put("/:id", async (req, res) => {
  try {
    const { medicineName, isAntimicrobial, dosage, purpose, vetName, startDate, endDate, withdrawalDays } = req.body;

    const [existing] = await pool.query("SELECT * FROM medicines WHERE id = ? AND owner_id = ?", [
      req.params.id, req.session.user.id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Medicine record not found" });
    }

    const withdrawalEndDate = endDate ? addDays(endDate, withdrawalDays) : null;

    await pool.query(
      `UPDATE medicines SET medicine_name=?, is_antimicrobial=?, dosage=?, purpose=?, vet_name=?,
       start_date=?, end_date=?, withdrawal_days=?, withdrawal_end_date=? WHERE id=?`,
      [medicineName, isAntimicrobial !== false, dosage, purpose, vetName, startDate, endDate, withdrawalDays || 0, withdrawalEndDate, req.params.id]
    );

    res.json({ success: true, message: "Medicine record updated", withdrawalEndDate });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not update medicine record" });
  }
});

// DELETE a medicine record
router.delete("/:id", async (req, res) => {
  try {
    const [existing] = await pool.query("SELECT id FROM medicines WHERE id = ? AND owner_id = ?", [
      req.params.id, req.session.user.id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Medicine record not found" });
    }
    await pool.query("DELETE FROM medicines WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Medicine record deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not delete medicine record" });
  }
});

// GET only the records whose withdrawal period is still active today
// (this powers the "Withdrawal Period Alerts" feature from the requirements)
router.get("/alerts/active-withdrawals", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, a.name AS animal_name, a.animal_tag
       FROM medicines m JOIN animals a ON m.animal_id = a.id
       WHERE m.owner_id = ? AND m.withdrawal_end_date IS NOT NULL AND m.withdrawal_end_date >= CURDATE()
       ORDER BY m.withdrawal_end_date ASC`,
      [req.session.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not fetch withdrawal alerts" });
  }
});

module.exports = router;

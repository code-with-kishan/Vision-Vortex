// This route gathers numbers from all the other tables and sends
// them back together, so the dashboard page only needs ONE fetch()
// call instead of calling 5 different APIs separately.

const express = require("express");
const pool = require("../config/db");
const { requireLogin } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(requireLogin);

router.get("/", async (req, res) => {
  try {
    const ownerId = req.session.user.id;

    // total animals
    const [[{ totalAnimals }]] = await pool.query(
      "SELECT COUNT(*) AS totalAnimals FROM animals WHERE owner_id = ?", [ownerId]
    );

    // healthy vs sick animals
    const [[{ healthyAnimals }]] = await pool.query(
      "SELECT COUNT(*) AS healthyAnimals FROM animals WHERE owner_id = ? AND health_status = 'Healthy'", [ownerId]
    );
    const [[{ sickAnimals }]] = await pool.query(
      "SELECT COUNT(*) AS sickAnimals FROM animals WHERE owner_id = ? AND health_status IN ('Sick','Under Treatment','Critical')", [ownerId]
    );

    // vaccinations due in the next 7 days
    const [[{ vaccinationDue }]] = await pool.query(
      "SELECT COUNT(*) AS vaccinationDue FROM vaccinations WHERE owner_id = ? AND next_due_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)", [ownerId]
    );

    // active withdrawal periods right now (core antimicrobial-tracking stat)
    const [[{ activeWithdrawals }]] = await pool.query(
      "SELECT COUNT(*) AS activeWithdrawals FROM medicines WHERE owner_id = ? AND withdrawal_end_date >= CURDATE()", [ownerId]
    );

    // total antimicrobial doses given this month (usage tracking)
    const [[{ antimicrobialsThisMonth }]] = await pool.query(
      `SELECT COUNT(*) AS antimicrobialsThisMonth FROM medicines
       WHERE owner_id = ? AND is_antimicrobial = TRUE
       AND MONTH(start_date) = MONTH(CURDATE()) AND YEAR(start_date) = YEAR(CURDATE())`,
      [ownerId]
    );

    // low stock inventory items
    const [lowStockItems] = await pool.query(
      "SELECT * FROM inventory WHERE owner_id = ? AND quantity <= reorder_level", [ownerId]
    );

    // medicine usage over the last 6 months (for a simple bar chart)
    const [monthlyMedicineUsage] = await pool.query(
      `SELECT DATE_FORMAT(start_date, '%Y-%m') AS month, COUNT(*) AS count
       FROM medicines WHERE owner_id = ? AND start_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY month ORDER BY month ASC`,
      [ownerId]
    );

    res.json({
      success: true,
      data: {
        totalAnimals,
        healthyAnimals,
        sickAnimals,
        vaccinationDue,
        activeWithdrawals,
        antimicrobialsThisMonth,
        lowStockItems,
        monthlyMedicineUsage,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Could not load dashboard data" });
  }
});

module.exports = router;

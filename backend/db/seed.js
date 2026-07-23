// Run this file once with "npm run seed" after you have created
// the database using schema.sql. It will insert 3 test accounts
// with a properly hashed password so you can log in immediately.
//
// Farmer login  : farmer@test.com / Password@123
// Vet login     : vet@test.com    / Password@123
// Admin login   : admin@test.com  / Password@123

const bcrypt = require("bcryptjs");
const pool = require("../config/db");

async function seed() {
  try {
    const hashedPassword = await bcrypt.hash("Password@123", 10);

    // Update the 3 sample users we already inserted in schema.sql
    // with a correctly generated hash (since the one in schema.sql
    // is just a placeholder pattern, not a real hash).
    await pool.query("UPDATE users SET password = ? WHERE email IN (?, ?, ?)", [
      hashedPassword,
      "farmer@test.com",
      "vet@test.com",
      "admin@test.com",
    ]);

    console.log("Seed complete! You can now log in with:");
    console.log("farmer@test.com / Password@123");
    console.log("vet@test.com / Password@123");
    console.log("admin@test.com / Password@123");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();

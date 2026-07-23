// Main entry point of the backend server.
// Run this file with "node server.js" (or "npm run dev" for auto-restart)

const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const app = express();

// ---- middleware ----
app.use(express.json()); // lets us read JSON from the request body

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://127.0.0.1:5500", // where our frontend is served from
    credentials: true, // needed so the session cookie is sent along with requests
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "vision-vortex-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  })
);

// ---- quick health check route, useful to test if server is running ----
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Vision Vortex backend is running" });
});

// ---- routes ----
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/animals", require("./routes/animalRoutes"));
app.use("/api/medicines", require("./routes/medicineRoutes"));
app.use("/api/vaccinations", require("./routes/vaccinationRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/alerts", require("./routes/alertRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// ---- 404 handler for unknown API routes ----
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// ---- basic error handler (catches anything we forgot to try/catch) ----
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Server error" });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Vision Vortex backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;

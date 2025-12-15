const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Admin credentials from environment or defaults
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "propscholars@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Hindi@1234";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Initialize SQLite database
const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Database error:", err);
  else console.log("Database connected");
});

// Create submissions table
db.run(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    blog TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Submit blog endpoint
app.post("/submit", (req, res) => {
  const { name, email, phone, blog } = req.body;
  
  // Validation
  if (!name || !email || !phone || !blog) {
    return res.status(400).send("All fields are required.");
  }
  
  const wordCount = blog.trim().split(/\s+/).filter(Boolean).length;
  
  if (wordCount < 250) {
    return res.status(400).send(`Minimum 250 words required. You have ${wordCount} words.`);
  }
  
  // Insert into database
  db.run(
    "INSERT INTO submissions (name, email, phone, blog) VALUES (?, ?, ?, ?)",
    [name.trim(), email.trim(), phone.trim(), blog.trim()],
    function(err) {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).send("Error saving submission.");
      }
      res.redirect("/success.html");
    }
  );
});

// Admin login endpoint
app.post("/admin-login", (req, res) => {
  const { email, password } = req.body;
  
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    res.redirect("/admin.html");
  } else {
    res.status(401).send("Invalid admin credentials");
  }
});

// Fetch all submissions (admin endpoint)
app.get("/submissions", (req, res) => {
  db.all(
    "SELECT * FROM submissions ORDER BY created_at DESC",
    (err, rows) => {
      if (err) {
        console.error("Query error:", err);
        return res.status(500).json({ error: "Error fetching submissions" });
      }
      res.json(rows || []);
    }
  );
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n=== PropScholar Blog Contest Server ===`);
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin login at http://localhost:${PORT}/admin-login.html`);
  console.log(`Admin email: ${ADMIN_EMAIL}`);
  console.log("===================================\n");
});

module.exports = app;

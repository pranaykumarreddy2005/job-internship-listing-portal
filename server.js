const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

/* ================= MYSQL CONNECTION ================= */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "jobportal"
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("✅ MySQL Connected");
});

/* ================= MULTER CONFIG ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

/* ================= JOB ROUTES ================= */

app.get("/jobs", (req, res) => {
  db.query("SELECT * FROM jobs", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.get("/jobs/search", (req, res) => {
  const q = `%${req.query.q}%`;
  db.query(
    "SELECT * FROM jobs WHERE title LIKE ? OR company LIKE ?",
    [q, q],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

/* ================= BOOKMARK ================= */

app.post("/bookmark", (req, res) => {
  const { job_id } = req.body;
  db.query(
    "INSERT INTO bookmarks (job_id) VALUES (?)",
    [job_id],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Bookmarked successfully" });
    }
  );
});

/* ================= APPLY (FINAL & ONLY ONE) ================= */

app.post("/apply", upload.single("resume"), (req, res) => {
  const {
    job_id,
    name,
    email,
    phone,
    cover_letter,
    college,
    gpa,
    skills,
    type,
    experience
  } = req.body;

  const resume = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO applicants
    (job_id, name, email, phone, cover_letter, resume, college, gpa, skills, type, experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      job_id,
      name,
      email,
      phone,
      cover_letter,
      resume,
      college,
      gpa,
      skills,
      type,
      type === "job" ? experience : null
    ],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ message: "✅ Application submitted successfully" });
    }
  );
});

/* ================= VIEW APPLICANTS ================= */

app.get("/applicants", (req, res) => {
  const sql = `
    SELECT applicants.*, jobs.title
    FROM applicants
    JOIN jobs ON applicants.job_id = jobs.job_id
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/* ================= DEBUG (TERMINAL VIEW) ================= */

app.get("/debug/applicants", (req, res) => {
  db.query("SELECT * FROM applicants", (err, result) => {
    if (err) return console.error(err);

    console.log("📄 APPLICANTS DATA:");
    console.table(result);

    res.json({ message: "Check terminal output" });
  });
});

/* ================= TEST ================= */
app.get("/", (req, res) => {
  res.send("Server is working ✅");
});

/* ================= SERVER ================= */
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
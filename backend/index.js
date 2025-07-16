/* ------------------------------------------------------------------ */
/* وابستگی‌ها                                                          */
/* ------------------------------------------------------------------ */
const express  = require("express");
const cors     = require("cors");
const db       = require("./db");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");

/* ------------------------------------------------------------------ */
/* تنظیمات عمومی                                                       */
/* ------------------------------------------------------------------ */
const app = express();

// CORS — برای شبکهٔ داخلی اجازهٔ همه Origin‌ها می‌دهیم
app.use(cors({ origin: "*", methods: ["GET","POST","PUT","DELETE"] }));
app.use(express.json());

/* ------------------------------------------------------------------ */
/* بارگذاری فایل‌ها (عکس و ضمائم)                                     */
/* ------------------------------------------------------------------ */
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename   : (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

app.use("/uploads", express.static(uploadDir));

/* ------------------------------------------------------------------ */
/* Notifications API                                                  */
/* ------------------------------------------------------------------ */
app.get("/api/notifications", (_, res) => {
  db.all(`SELECT * FROM notifications ORDER BY createdAt DESC`, [], (e, rows) =>
    e ? res.status(500).json({ error: e.message }) : res.json(rows)
  );
});

app.post("/api/notifications", (req, res) => {
  const { userId, title, body, type } = req.body;
  const createdAt = new Date().toISOString();

  db.run(
    `INSERT INTO notifications (userId,title,body,isRead,createdAt,type)
     VALUES (?,?,?,?,?,?)`,
    [userId, title, body, 0, createdAt, type],
    function (e) {
      if (e) return res.status(500).json({ error: e.message });
      res.json({ id: this.lastID, userId, title, body, type, createdAt, isRead: 0 });
    }
  );
});

/* ------------------------------------------------------------------ */
/* Employees API                                                      */
/* ------------------------------------------------------------------ */

// همهٔ کارمندان
app.get("/api/employees", (_, res) => {
  db.all(`SELECT * FROM employees ORDER BY dateJoined DESC`, [], (e, rows) =>
    e ? res.status(500).json({ error: e.message }) : res.json(rows)
  );
});

// افزودن کارمند
app.post(
  "/api/employees",
  upload.fields([{ name: "photo", maxCount: 1 }, { name: "documents" }]),
  (req, res) => {
    try {
      const {
        fullName, nationalId, employeeId, jobTitle, department, branch,
        contactNumber, email, dateOfJoining, monthlySalary, status,
        gender, militaryStatus, additionalNotes, tasks = "[]",
      } = req.body;

      const photoPath = req.files?.photo?.[0]?.path || null;

      // اعتبارسنجی JSON وظایف
      let parsedTasks;
      try {
        parsedTasks = JSON.parse(tasks);
        if (!Array.isArray(parsedTasks)) throw new Error();
      } catch {
        return res.status(400).json({ error: "فرمت وظایف نادرست است" });
      }

      // درج کارمند
      const sql = `
        INSERT INTO employees (
          id, fullName, jobTitle, department, contactNumber, email, status,
          dateJoined, photo, nationalId, branch, monthlySalary,
          gender, militaryStatus, additionalNotes
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `;
      const params = [
        employeeId, fullName, jobTitle, department, contactNumber, email, status,
        dateOfJoining, photoPath, nationalId, branch, monthlySalary,
        gender, militaryStatus, additionalNotes,
      ];

      db.run(sql, params, function (e) {
        if (e) {
          console.error("❌ DB Insert Error:", e.message);
          return res.status(500).json({ error: "خطا در ذخیرهٔ کارمند" });
        }

        // درج تسک‌ها (اختیاری)
        if (parsedTasks.length) {
          const stmt = db.prepare(`
            INSERT INTO tasks (
              id, employeeName, description,
              assignedDate, dueDate, status, priority, department
            ) VALUES (?,?,?,?,?,?,?,?)
          `);

          parsedTasks.forEach((t) =>
            stmt.run(
              `TASK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              fullName, t.description, t.assignedDate, t.dueDate,
              t.status, t.priority || "medium", department
            )
          );
          stmt.finalize();
        }

        res.status(201).json({ message: "کارمند ثبت شد", id: this.lastID });
      });
    } catch (e) {
      console.error("❌ API Error:", e);
      res.status(500).json({ error: "خطای غیرمنتظرهٔ سرور" });
    }
  }
);

/* ------------------------------------------------------------------ */
/* Tasks API                                                          */
/* ------------------------------------------------------------------ */
app.get("/api/tasks", (_, res) => {
  db.all(`SELECT * FROM tasks`, [], (e, rows) =>
    e ? res.status(400).json({ error: e.message }) : res.json(rows)
  );
});

app.post("/api/tasks", (req, res) => {
  const { id, employeeName, description, assignedDate, dueDate, status, priority, department } = req.body;

  db.run(
    `INSERT INTO tasks (id,employeeName,description,assignedDate,dueDate,status,priority,department)
     VALUES (?,?,?,?,?,?,?,?)`,
    [id, employeeName, description, assignedDate, dueDate, status, priority, department],
    function (e) {
      if (e) return res.status(400).json({ error: e.message });
      res.json({ message: "success", id: this.lastID });
    }
  );
});

/* ------------------------------------------------------------------ */
/* Requests API                                                       */
/* ------------------------------------------------------------------ */
app.get("/api/requests", (_, res) => {
  db.all(`SELECT * FROM requests`, [], (e, rows) =>
    e ? res.status(400).json({ error: e.message }) : res.json(rows)
  );
});

/* ------------------------------------------------------------------ */
/* Branches & Positions API                                           */
/* ------------------------------------------------------------------ */
// Branches
app.get("/api/branches", (_, res) => {
  const sql = `
    SELECT b.id, b.name, e.fullName AS managerName,
           (SELECT COUNT(*) FROM employees WHERE branch = b.name) AS employeeCount
    FROM branches b
    LEFT JOIN employees e ON b.managerId = e.id
  `;
  db.all(sql, [], (e, rows) =>
    e ? res.status(500).json({ error: e.message }) : res.json(rows)
  );
});

app.post("/api/branches", (req, res) => {
  const { name, managerId } = req.body;
  const id = `BR-${Date.now()}`;
  db.run(`INSERT INTO branches (id,name,managerId) VALUES (?,?,?)`, [id, name, managerId], function (e) {
    if (e) return res.status(500).json({ error: e.message });
    res.status(201).json({ id, name, managerId });
  });
});

app.put("/api/branches/:id", (req, res) => {
  const { name, managerId } = req.body;
  db.run(`UPDATE branches SET name=?, managerId=? WHERE id=?`, [name, managerId, req.params.id], function (e) {
    if (e) return res.status(500).json({ error: e.message });
    res.json({ message: "Branch updated", changes: this.changes });
  });
});

app.delete("/api/branches/:id", (req, res) => {
  db.run(`DELETE FROM branches WHERE id=?`, req.params.id, function (e) {
    if (e) return res.status(500).json({ error: e.message });
    res.json({ message: "Branch deleted", changes: this.changes });
  });
});

// Positions
app.get("/api/positions", (_, res) => {
  db.all(`SELECT * FROM positions`, [], (e, rows) =>
    e ? res.status(500).json({ error: e.message }) : res.json(rows)
  );
});

app.post("/api/positions", (req, res) => {
  const { title } = req.body;
  const id = `POS-${Date.now()}`;
  db.run(`INSERT INTO positions (id,title) VALUES (?,?)`, [id, title], function (e) {
    if (e) return res.status(500).json({ error: e.message });
    res.status(201).json({ id, title });
  });
});

app.put("/api/positions/:id", (req, res) => {
  db.run(`UPDATE positions SET title=? WHERE id=?`, [req.body.title, req.params.id], function (e) {
    if (e) return res.status(500).json({ error: e.message });
    res.json({ message: "Position updated", changes: this.changes });
  });
});

app.delete("/api/positions/:id", (req, res) => {
  db.run(`DELETE FROM positions WHERE id=?`, req.params.id, function (e) {
    if (e) return res.status(500).json({ error: e.message });
    res.json({ message: "Position deleted", changes: this.changes });
  });
});

/* ------------------------------------------------------------------ */
/* راه‌اندازی سرور                                                     */
/* ------------------------------------------------------------------ */
const HOST = process.env.HOST || "0.0.0.0";  // همهٔ اینترفیس‌ها
const PORT = process.env.PORT || 3001;

app.listen(PORT, HOST, () => {
  console.log("------------------------------------------------");
  console.log(`🚀  API ready on:\n    http://${HOST === "0.0.0.0" ? "YOUR_IP" : HOST}:${PORT}`);
  console.log("------------------------------------------------");
});

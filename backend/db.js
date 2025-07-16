// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('❌ خطا در اتصال:', err.message);
    else console.log('✅ اتصال موفق به SQLite');
});

/* ------------------------------------------------------------------ */
/* ایجاد یا به‌روزرسانی جداول                                          */
/* ------------------------------------------------------------------ */
db.serialize(() => {
    /* جدول اصلی کارمندان (نسخهٔ کامل) */
    db.run(`
      CREATE TABLE IF NOT EXISTS employees (
        id               TEXT PRIMARY KEY,       -- کد کارمندی
        fullName         TEXT,                   -- نام و نام خانوادگی
        nationalId       TEXT,                   -- کد ملی
        jobTitle         TEXT,
        department       TEXT,
        branch           TEXT,
        contactNumber    TEXT,
        email            TEXT,
        gender           TEXT,                   -- male | female
        militaryStatus   TEXT,                   -- completed | exempted | pending
        monthlySalary    INTEGER,
        status           TEXT,                   -- active | inactive
        dateJoined       TEXT,
        photo            TEXT,                   -- مسیر فایل ذخیره‌شده
        additionalNotes  TEXT
      )
    `);

    /* ستون‌های جدید برای دیتابیس‌های قبلی (اگر وجود نداشتند) */
    const addColumn = (name, type) =>
        db.run(`ALTER TABLE employees ADD COLUMN ${name} ${type}`, [], () => { /* ساکت */ });

    const columns = [
        ['nationalId', 'TEXT'],
        ['branch', 'TEXT'],
        ['gender', 'TEXT'],
        ['militaryStatus', 'TEXT'],
        ['monthlySalary', 'INTEGER'],
        ['additionalNotes', 'TEXT']
    ];

    db.all(`PRAGMA table_info(employees)`, (err, existingColumns) => {
        if (err) {
            console.error("Error fetching table info:", err);
            return;
        }
        columns.forEach(([c, t]) => {
            if (!existingColumns.some(col => col.name === c)) {
                addColumn(c, t);
            }
        });
    });

    /* جدول تسک‌ها */
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id            TEXT PRIMARY KEY,
        employeeName  TEXT,
        description   TEXT,
        assignedDate  TEXT,
        dueDate       TEXT,
        status        TEXT,
        priority      TEXT,
        department    TEXT,
        completedDate TEXT
      )
    `);

    /* جدول درخواست‌ها */
    db.run(`
      CREATE TABLE IF NOT EXISTS requests (
        id             TEXT PRIMARY KEY,
        employeeName   TEXT,
        employeeId     TEXT,
        requestType    TEXT,
        status         TEXT,
        priority       TEXT,
        submissionDate TEXT,
        startDate      TEXT,
        endDate        TEXT,
        amount         INTEGER,
        description    TEXT
      )
    `);

    /* >>> بخش جدید: جداول شعب و سمت‌ها <<< */
    
    // جدول شعب
    db.run(`
      CREATE TABLE IF NOT EXISTS branches (
        id        TEXT PRIMARY KEY,
        name      TEXT NOT NULL UNIQUE,
        managerId TEXT,
        FOREIGN KEY (managerId) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    // جدول سمت‌ها
    db.run(`
      CREATE TABLE IF NOT EXISTS positions (
        id      TEXT PRIMARY KEY,
        title   TEXT NOT NULL UNIQUE
      )
    `);
});

module.exports = db;
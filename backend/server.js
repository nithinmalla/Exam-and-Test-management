const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// API health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Get dashboard statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [students] = await db.query('SELECT COUNT(*) as count FROM student');
    const [exams] = await db.query('SELECT COUNT(*) as count FROM exam');
    const [teachers] = await db.query('SELECT COUNT(*) as count FROM teacher');
    const [subjects] = await db.query('SELECT COUNT(*) as count FROM subject');

    res.json({
      students: students[0].count,
      exams: exams[0].count,
      teachers: teachers[0].count,
      subjects: subjects[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// --- EXAM ROUTES ---
// Get recent exams
app.get('/api/exams/recent', async (req, res) => {
  try {
    const [exams] = await db.query(`
      SELECT e.exam_id, e.exam_name, e.exam_date, e.status, s.subject_name 
      FROM exam e
      JOIN subject s ON e.subject_id = s.subject_id
      ORDER BY e.exam_date DESC
    `);
    res.json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Create an exam
app.post('/api/exams', async (req, res) => {
  const { subject_id, teacher_id, exam_name, exam_date, duration_minutes, total_marks, pass_percentage, status } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO exam (subject_id, teacher_id, exam_name, exam_date, duration_minutes, total_marks, pass_percentage, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [subject_id, teacher_id, exam_name, exam_date, duration_minutes, total_marks, pass_percentage || 40.00, status || 'scheduled']
    );
    res.json({ message: 'Exam scheduled', exam_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});


// --- STUDENT ROUTES ---
// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const [students] = await db.query('SELECT * FROM student ORDER BY created_at DESC');
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Add a student
app.post('/api/students', async (req, res) => {
  const { enrollment_no, first_name, last_name, email, phone, dob, batch_year } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO student (enrollment_no, first_name, last_name, email, phone, dob, batch_year) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [enrollment_no, first_name, last_name, email, phone, dob, batch_year]
    );
    res.json({ message: 'Student added', student_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Edit a student
app.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const { enrollment_no, first_name, last_name, email, phone, dob, batch_year } = req.body;
  try {
    await db.query(
      `UPDATE student SET enrollment_no=?, first_name=?, last_name=?, email=?, phone=?, dob=?, batch_year=? 
       WHERE student_id=?`,
      [enrollment_no, first_name, last_name, email, phone, dob, batch_year, id]
    );
    res.json({ message: 'Student updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Delete a student
app.delete('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM student WHERE student_id=?', [id]);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// --- REFERENCE DATA ROUTES (for dropdowns) ---
app.get('/api/subjects', async (req, res) => {
  try {
    const [subjects] = await db.query('SELECT subject_id, subject_name FROM subject ORDER BY subject_name');
    res.json(subjects);
  } catch (err) { res.status(500).json({ error: 'Database fetch failed' }); }
});

app.get('/api/teachers', async (req, res) => {
  try {
    const [teachers] = await db.query('SELECT teacher_id, first_name, last_name FROM teacher ORDER BY first_name');
    res.json(teachers);
  } catch (err) { res.status(500).json({ error: 'Database fetch failed' }); }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

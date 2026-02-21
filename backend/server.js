const express = require('express');
const cors = require('cors');
const db = require('./db');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

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

// Get recent exams
app.get('/api/exams/recent', async (req, res) => {
  try {
    const [exams] = await db.query(`
      SELECT e.exam_id, e.exam_name, e.exam_date, e.status, s.subject_name 
      FROM exam e
      JOIN subject s ON e.subject_id = s.subject_id
      ORDER BY e.exam_date DESC LIMIT 5
    `);
    res.json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

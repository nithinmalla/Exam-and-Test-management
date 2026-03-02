const express = require('express');
const cors = require('cors');
const db = require('./db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_exam_key_123';

// API health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// --- AUTHENTICATION ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token, role: 'admin' });
  }

  if (username === 'teacher' && password === 'teacher123') {
    const token = jwt.sign({ role: 'teacher', teacher_id: 1 }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token, role: 'teacher', teacher_id: 1 });
  }

  if (username === 'student' && password === 'student123') {
    const token = jwt.sign({ role: 'student', student_id: 1 }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token, role: 'student', student_id: 1 });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    next();
  };
};
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Get dashboard statistics
app.get('/api/stats', authenticateToken, authorizeRoles('admin'), async (req, res) => {
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
app.get('/api/exams/recent', authenticateToken, authorizeRoles('admin'), async (req, res) => {
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
app.post('/api/exams', authenticateToken, authorizeRoles('admin'), async (req, res) => {
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
app.get('/api/students', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [students] = await db.query('SELECT * FROM student ORDER BY created_at DESC');
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Add a student
app.post('/api/students', authenticateToken, authorizeRoles('admin'), async (req, res) => {
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
app.put('/api/students/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
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
app.delete('/api/students/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM student WHERE student_id=?', [id]);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// --- TEACHERS ROUTES ---
app.get('/api/teachers', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [teachers] = await db.query('SELECT * FROM teacher ORDER BY first_name');
    res.json(teachers);
  } catch (err) { res.status(500).json({ error: 'Database fetch failed' }); }
});

app.post('/api/teachers', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { first_name, last_name, email, phone, department, hire_date } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO teacher (first_name, last_name, email, phone, department, hire_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, department, hire_date]
    );
    res.json({ message: 'Teacher added', teacher_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.put('/api/teachers/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone, department, hire_date } = req.body;
  try {
    await db.query(
      `UPDATE teacher SET first_name=?, last_name=?, email=?, phone=?, department=?, hire_date=? 
       WHERE teacher_id=?`,
      [first_name, last_name, email, phone, department, hire_date, id]
    );
    res.json({ message: 'Teacher updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.delete('/api/teachers/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM teacher WHERE teacher_id=?', [id]);
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// --- SUBJECTS ROUTES ---
app.get('/api/subjects', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [subjects] = await db.query('SELECT * FROM subject ORDER BY subject_name');
    res.json(subjects);
  } catch (err) { res.status(500).json({ error: 'Database fetch failed' }); }
});

app.post('/api/subjects', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { subject_code, subject_name, description, credits } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO subject (subject_code, subject_name, description, credits) 
       VALUES (?, ?, ?, ?)`,
      [subject_code, subject_name, description, credits || 3]
    );
    res.json({ message: 'Subject added', subject_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.put('/api/subjects/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { subject_code, subject_name, description, credits } = req.body;
  try {
    await db.query(
      `UPDATE subject SET subject_code=?, subject_name=?, description=?, credits=? 
       WHERE subject_id=?`,
      [subject_code, subject_name, description, credits, id]
    );
    res.json({ message: 'Subject updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.delete('/api/subjects/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM subject WHERE subject_id=?', [id]);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});


// --- TEACHER ROLE ROUTES ---
app.get('/api/teacher/subjects', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  try {
    const [subjects] = await db.query(`
      SELECT s.* FROM subject s
      JOIN teacher_subject ts ON s.subject_id = ts.subject_id
      WHERE ts.teacher_id = ?
    `, [req.user.teacher_id]);
    res.json(subjects);
  } catch (err) { res.status(500).json({ error: 'Database fetch failed' }); }
});

app.get('/api/teacher/students', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT st.* FROM student st
      JOIN teacher_student ts ON st.student_id = ts.student_id
      WHERE ts.teacher_id = ?
    `, [req.user.teacher_id]);
    res.json(students);
  } catch (err) { res.status(500).json({ error: 'Database fetch failed' }); }
});

app.get('/api/teacher/exams', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  try {
    const [exams] = await db.query(`
      SELECT e.*, s.subject_name FROM exam e
      JOIN subject s ON e.subject_id = s.subject_id
      WHERE e.teacher_id = ?
      ORDER BY e.exam_date DESC
    `, [req.user.teacher_id]);
    res.json(exams);
  } catch (err) { res.status(500).json({ error: 'Database fetch failed' }); }
});

app.post('/api/teacher/exams', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  const { subject_id, exam_name, exam_date, duration_minutes, total_marks, pass_percentage, status } = req.body;

  // Verify the teacher is assigned to this subject
  try {
    const [assignment] = await db.query('SELECT * FROM teacher_subject WHERE teacher_id = ? AND subject_id = ?', [req.user.teacher_id, subject_id]);
    if (assignment.length === 0) return res.status(403).json({ error: 'Not assigned to this subject' });

    const [result] = await db.query(
      `INSERT INTO exam (subject_id, teacher_id, exam_name, exam_date, duration_minutes, total_marks, pass_percentage, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [subject_id, req.user.teacher_id, exam_name, exam_date, duration_minutes, total_marks, pass_percentage || 40.00, status || 'scheduled']
    );
    res.json({ message: 'Exam scheduled', exam_id: result.insertId });
  } catch (err) { res.status(500).json({ error: 'Database query failed' }); }
});

// --- STUDENT ROLE ROUTES ---
app.get('/api/student/subjects', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const [subjects] = await db.query(`
      SELECT s.*, t.first_name as teacher_first_name, t.last_name as teacher_last_name 
      FROM subject s
      JOIN student_subject ss ON s.subject_id = ss.subject_id
      JOIN teacher_subject ts ON s.subject_id = ts.subject_id
      JOIN teacher t ON ts.teacher_id = t.teacher_id
      WHERE ss.student_id = ?
    `, [req.user.student_id]);
    res.json(subjects);
  } catch (err) { res.status(500).json({ error: 'Database fetch failed' }); }
});

app.get('/api/student/exams', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const [exams] = await db.query(`
      SELECT e.*, s.subject_name, t.first_name as teacher_first_name, t.last_name as teacher_last_name 
      FROM exam e
      JOIN subject s ON e.subject_id = s.subject_id
      JOIN student_subject ss ON s.subject_id = ss.subject_id
      JOIN teacher t ON e.teacher_id = t.teacher_id
      WHERE ss.student_id = ?
      ORDER BY e.exam_date ASC
    `, [req.user.student_id]);
    res.json(exams);
  } catch (err) { res.status(500).json({ error: 'Database fetch failed' }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

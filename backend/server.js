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
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token, role: 'admin' });
  }

  try {
    const [teachers] = await db.query('SELECT * FROM teacher WHERE first_name = ? AND last_name = ?', [username, password]);
    if (teachers.length > 0) {
      const token = jwt.sign({ role: 'teacher', teacher_id: teachers[0].teacher_id }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({ token, role: 'teacher', teacher_id: teachers[0].teacher_id });
    }

    const [students] = await db.query('SELECT * FROM student WHERE first_name = ? AND last_name = ?', [username, password]);
    if (students.length > 0) {
      const token = jwt.sign({ role: 'student', student_id: students[0].student_id }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({ token, role: 'student', student_id: students[0].student_id });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
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
      SELECT e.*, s.subject_name 
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

// Edit an exam
app.put('/api/exams/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { subject_id, teacher_id, exam_name, exam_date, duration_minutes, total_marks, pass_percentage, status } = req.body;
  try {
    await db.query(
      `UPDATE exam SET subject_id=?, teacher_id=?, exam_name=?, exam_date=?, duration_minutes=?, total_marks=?, pass_percentage=?, status=? 
       WHERE exam_id=?`,
      [subject_id, teacher_id, exam_name, exam_date, duration_minutes, total_marks, pass_percentage, status, id]
    );
    res.json({ message: 'Exam updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Delete an exam
app.delete('/api/exams/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM exam WHERE exam_id=?', [id]);
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Get exam results (Admin)
app.get('/api/admin/exams/:id/results', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const [students] = await db.query(`
      SELECT st.student_id, st.enrollment_no, st.first_name, st.last_name, r.score, r.status as result_status
      FROM student st
      JOIN subject_student ss ON st.student_id = ss.student_id
      JOIN exam e ON e.subject_id = ss.subject_id
      LEFT JOIN result r ON st.student_id = r.student_id AND r.exam_id = e.exam_id
      WHERE e.exam_id = ?
      ORDER BY st.enrollment_no ASC
    `, [id]);
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch failed' });
  }
});

// --- QUESTION & OPTION ROUTES ---
// Get all questions for a subject
app.get('/api/subjects/:id/questions', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  const { id } = req.params;
  try {
    const [questions] = await db.query('SELECT * FROM question WHERE subject_id = ?', [id]);
    for (let q of questions) {
      const [options] = await db.query('SELECT * FROM `option` WHERE question_id = ?', [q.question_id]);
      q.options = options;
    }
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch failed' });
  }
});

// Add a question with options
app.post('/api/questions', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  const { subject_id, question_text, marks, difficulty_level, options } = req.body;
  const connection = await db.getConnection();
  await connection.beginTransaction();
  try {
    const [qResult] = await connection.query(
      'INSERT INTO question (subject_id, question_text, marks, difficulty_level) VALUES (?, ?, ?, ?)',
      [subject_id, question_text, marks || 1.00, difficulty_level || 'medium']
    );
    const questionId = qResult.insertId;

    if (options && options.length > 0) {
      const optionValues = options.map(opt => [questionId, opt.option_text, opt.is_correct ? 1 : 0]);
      await connection.query('INSERT INTO `option` (question_id, option_text, is_correct) VALUES ?', [optionValues]);
    }

    await connection.commit();
    res.json({ message: 'Question added', question_id: questionId });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to add question' });
  } finally {
    connection.release();
  }
});

// Delete a question
app.delete('/api/questions/:id', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM question WHERE question_id = ?', [id]);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database delete failed' });
  }
});

// Link questions to an exam
app.post('/api/exams/:id/questions', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  const { id } = req.params; // exam_id
  const { question_ids } = req.body;
  try {
    // Clear existing links
    await db.query('DELETE FROM exam_question WHERE exam_id = ?', [id]);
    
    if (question_ids && question_ids.length > 0) {
      const values = question_ids.map(qId => [id, qId]);
      await db.query('INSERT INTO exam_question (exam_id, question_id) VALUES ?', [values]);
    }
    res.json({ message: 'Exam questions updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database update failed' });
  }
});

// Get questions for a specific exam
app.get('/api/exams/:id/questions', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [questions] = await db.query(`
      SELECT q.* FROM question q
      JOIN exam_question eq ON q.question_id = eq.question_id
      WHERE eq.exam_id = ?
    `, [id]);
    
    for (let q of questions) {
      const [options] = await db.query('SELECT option_id, option_text FROM `option` WHERE question_id = ?', [q.question_id]);
      q.options = options;
    }
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch failed' });
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
  const { subject_code, subject_name, description, credits, teacher_id, students } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO subject (subject_code, subject_name, description, credits, teacher_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [subject_code, subject_name, description, credits || 3, teacher_id]
    );
    const subjectId = result.insertId;

    if (students && students.length > 0) {
      const studentValues = students.map(sId => [subjectId, sId]);
      await db.query(`INSERT INTO subject_student (subject_id, student_id) VALUES ?`, [studentValues]);
    }

    res.json({ message: 'Subject added', subject_id: subjectId });
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
      SELECT * FROM subject WHERE teacher_id = ?
    `, [req.user.teacher_id]);
    res.json(subjects);
  } catch (err) { res.status(500).json({ error: 'Database fetch failed' }); }
});

app.get('/api/teacher/students', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT DISTINCT st.* FROM student st
      JOIN subject_student ss ON st.student_id = ss.student_id
      JOIN subject s ON ss.subject_id = s.subject_id
      WHERE s.teacher_id = ?
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

app.get('/api/teacher/exams/:exam_id/students', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  const { exam_id } = req.params;
  try {
    const [exams] = await db.query('SELECT * FROM exam WHERE exam_id = ? AND teacher_id = ?', [exam_id, req.user.teacher_id]);
    if (exams.length === 0) return res.status(403).json({ error: 'Unauthorized for this exam' });

    const [students] = await db.query(`
      SELECT st.student_id, st.enrollment_no, st.first_name, st.last_name, r.score, r.status as result_status
      FROM student st
      JOIN subject_student ss ON st.student_id = ss.student_id
      LEFT JOIN result r ON st.student_id = r.student_id AND r.exam_id = ?
      WHERE ss.subject_id = ?
      ORDER BY st.enrollment_no ASC
    `, [exam_id, exams[0].subject_id]);
    
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch failed' });
  }
});

app.post('/api/teacher/exams/:exam_id/marks', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
  const { exam_id } = req.params;
  const { marks } = req.body;
  
  try {
    const [exams] = await db.query('SELECT total_marks, pass_percentage, teacher_id FROM exam WHERE exam_id = ?', [exam_id]);
    if (exams.length === 0) return res.status(404).json({ error: 'Exam not found' });
    if (exams[0].teacher_id !== req.user.teacher_id) return res.status(403).json({ error: 'Unauthorized for this exam' });

    const passPercentage = exams[0].pass_percentage;
    const totalMarks = exams[0].total_marks;
    const requiredScore = (totalMarks * passPercentage) / 100;

    if (marks && marks.length > 0) {
      for (const mark of marks) {
        let scoreFloat = parseFloat(mark.score);
        if (isNaN(scoreFloat)) continue;
        
        let status = scoreFloat >= requiredScore ? 'Pass' : 'Fail';
        
        await db.query(`
          INSERT INTO result (student_id, exam_id, score, status)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE score = VALUES(score), status = VALUES(status), generated_at = CURRENT_TIMESTAMP
        `, [mark.student_id, exam_id, scoreFloat, status]);
      }
      
      await db.query('UPDATE exam SET status = ? WHERE exam_id = ?', ['completed', exam_id]);
    }

    res.json({ message: 'Marks updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database update failed' });
  }
});

// --- STUDENT ROLE ROUTES ---
app.get('/api/student/subjects', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const [subjects] = await db.query(`
      SELECT s.*, t.first_name as teacher_first_name, t.last_name as teacher_last_name 
      FROM subject s
      JOIN subject_student ss ON s.subject_id = ss.subject_id
      JOIN teacher t ON s.teacher_id = t.teacher_id
      WHERE ss.student_id = ?
    `, [req.user.student_id]);
    res.json(subjects);
  } catch (err) { res.status(500).json({ error: 'Database fetch failed' }); }
});

app.get('/api/student/exams', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const [exams] = await db.query(`
      SELECT e.*, s.subject_name, t.first_name as teacher_first_name, t.last_name as teacher_last_name,
             r.score, r.status as result_status
      FROM exam e
      JOIN subject s ON e.subject_id = s.subject_id
      JOIN subject_student ss ON s.subject_id = ss.subject_id
      JOIN teacher t ON e.teacher_id = t.teacher_id
      LEFT JOIN result r ON e.exam_id = r.exam_id AND r.student_id = ss.student_id
      WHERE ss.student_id = ?
      ORDER BY e.exam_date ASC
    `, [req.user.student_id]);
    res.json(exams);
  } catch (err) { res.status(500).json({ error: 'Database fetch failed' }); }
});

// Start an exam attempt
app.post('/api/student/exams/:id/start', authenticateToken, authorizeRoles('student'), async (req, res) => {
  const { id } = req.params; // exam_id
  try {
    const [existing] = await db.query('SELECT * FROM student_exam WHERE student_id = ? AND exam_id = ?', [req.user.student_id, id]);
    if (existing.length > 0) {
      return res.json({ message: 'Attempt already started', attempt_id: existing[0].attempt_id });
    }

    const [result] = await db.query(
      'INSERT INTO student_exam (student_id, exam_id, start_time, attempt_status) VALUES (?, ?, NOW(), "started")',
      [req.user.student_id, id]
    );
    res.json({ message: 'Exam started', attempt_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start exam' });
  }
});

// Submit an exam attempt
app.post('/api/student/exams/:id/submit', authenticateToken, authorizeRoles('student'), async (req, res) => {
  const { id } = req.params; // exam_id
  const { answers } = req.body; // Array of { question_id, selected_option_id }
  
  try {
    // 1. Fetch correct options for the exam questions
    const [correctOptions] = await db.query(`
      SELECT q.question_id, o.option_id, q.marks
      FROM question q
      JOIN \`option\` o ON q.question_id = o.question_id
      JOIN exam_question eq ON q.question_id = eq.question_id
      WHERE eq.exam_id = ? AND o.is_correct = 1
    `, [id]);

    // 2. Calculate score
    let score = 0;
    const correctMap = new Map(correctOptions.map(opt => [opt.question_id, opt]));
    
    for (const ans of answers) {
      const correct = correctMap.get(parseInt(ans.question_id));
      if (correct && correct.option_id === parseInt(ans.selected_option_id)) {
        score += parseFloat(correct.marks);
      }
    }

    // 3. Update attempt status
    await db.query(
      'UPDATE student_exam SET end_time = NOW(), attempt_status = "submitted" WHERE student_id = ? AND exam_id = ?',
      [req.user.student_id, id]
    );

    // 4. Upsert result
    const [examInfo] = await db.query('SELECT total_marks, pass_percentage FROM exam WHERE exam_id = ?', [id]);
    const passPercentage = examInfo[0].pass_percentage;
    const totalMarks = examInfo[0].total_marks;
    const status = score >= (totalMarks * passPercentage / 100) ? 'Pass' : 'Fail';

    await db.query(`
      INSERT INTO result (student_id, exam_id, score, status)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE score = VALUES(score), status = VALUES(status), generated_at = CURRENT_TIMESTAMP
    `, [req.user.student_id, id, score, status]);

    res.json({ message: 'Exam submitted successfully', score, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

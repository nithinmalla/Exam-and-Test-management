-- ==============================================================================
-- Exam and Test Management System - Sample Data
-- ==============================================================================
USE exam_management_system;

-- Disable Foreign Key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Insert Admins
INSERT INTO admin (username, password_hash, email) VALUES
('admin01', 'hash_of_secure_password', 'admin01@university.edu');

-- 2. Insert Teachers
INSERT INTO teacher (first_name, last_name, email, phone, department, hire_date) VALUES
('Alan', 'Turing', 'alan.turing@university.edu', '1234567890', 'Computer Science', '2015-08-01'),
('Ada', 'Lovelace', 'ada.lovelace@university.edu', '0987654321', 'Mathematics', '2018-01-15');

-- 3. Insert Students
INSERT INTO student (enrollment_no, first_name, last_name, email, phone, dob, batch_year) VALUES
('CS2020001', 'John', 'Doe', 'john.doe@student.edu', '1112223333', '2000-05-15', 2020),
('CS2020002', 'Jane', 'Smith', 'jane.smith@student.edu', '4445556666', '2001-08-22', 2020),
('CS2020003', 'Alice', 'Johnson', 'alice.johnson@student.edu', '7778889999', '2001-02-10', 2020);

-- 4. Insert Subjects
INSERT INTO subject (subject_code, subject_name, description, credits) VALUES
('CS101', 'Introduction to Database Systems', 'Fundamentals of SQL and NoSQL', 4),
('MA101', 'Discrete Mathematics', 'Logic, set theory, and combinatorics', 3);

-- 5. Insert Exams
INSERT INTO exam (subject_id, teacher_id, exam_name, exam_date, duration_minutes, total_marks, pass_percentage, status) VALUES
(1, 1, 'DBMS Midterm 2023', '2023-10-15 10:00:00', 120, 100.00, 40.00, 'completed'),
(2, 2, 'Discrete Math Finals', '2023-12-10 14:00:00', 180, 100.00, 50.00, 'scheduled');

-- 6. Insert Questions for Exam 1 (DBMS)
INSERT INTO question (subject_id, question_text, marks, difficulty_level) VALUES
(1, 'What is the primary characteristic of First Normal Form (1NF)?', 2.00, 'easy'),
(1, 'Which property ensures that a transaction is completed entirely or not at all?', 2.00, 'medium'),
(1, 'Explain the difference between clustered and non-clustered indexes.', 5.00, 'hard');

-- 7. Insert Options for Questions
-- Options for Q1
INSERT INTO `option` (question_id, option_text, is_correct) VALUES
(1, 'Eliminates all anomalies', FALSE),
(1, 'Every attribute is atomic (indivisible)', TRUE),
(1, 'Removes partial dependency', FALSE),
(1, 'Uses Foreign Keys', FALSE);

-- Options for Q2
INSERT INTO `option` (question_id, option_text, is_correct) VALUES
(2, 'Atomicity', TRUE),
(2, 'Consistency', FALSE),
(2, 'Isolation', FALSE),
(2, 'Durability', FALSE);

-- Options for Q3 (Assuming multiple choice for simplicity, or just a descriptive placeholder)
INSERT INTO `option` (question_id, option_text, is_correct) VALUES
(3, 'Clustered determines physical order, non-clustered does not.', TRUE),
(3, 'They are exactly the same.', FALSE);

-- 8. Map Questions to Exams (Bridge Table)
INSERT INTO exam_question (exam_id, question_id) VALUES
(1, 1),
(1, 2),
(1, 3);

-- 9. Insert Student Attempts (student_exam)
INSERT INTO student_exam (student_id, exam_id, start_time, end_time, attempt_status) VALUES
(1, 1, '2023-10-15 10:00:00', '2023-10-15 11:45:00', 'submitted'),
(2, 1, '2023-10-15 10:05:00', '2023-10-15 12:00:00', 'submitted');

-- 10. Insert Results
INSERT INTO result (student_id, exam_id, score, status) VALUES
(1, 1, 85.00, 'Pass'),
(2, 1, 38.00, 'Fail');

-- Re-enable Foreign Key checks
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;

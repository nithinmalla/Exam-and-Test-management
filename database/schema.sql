-- ==============================================================================
-- Exam and Test Management System - Database Schema
-- ==============================================================================

-- Create the database
CREATE DATABASE IF NOT EXISTS exam_management_system;
USE exam_management_system;

-- ==========================================
-- 1. ADMIN TABLE
-- ==========================================
CREATE TABLE admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. TEACHER TABLE
-- ==========================================
CREATE TABLE teacher (
    teacher_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15),
    department VARCHAR(100),
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. STUDENT TABLE
-- ==========================================
CREATE TABLE student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_no VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15),
    dob DATE,
    batch_year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. SUBJECT TABLE
-- ==========================================
CREATE TABLE subject (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20) NOT NULL UNIQUE,
    subject_name VARCHAR(100) NOT NULL,
    description TEXT,
    credits INT DEFAULT 3
);

-- ==========================================
-- 5. EXAM TABLE
-- ==========================================
CREATE TABLE exam (
    exam_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    exam_name VARCHAR(200) NOT NULL,
    exam_date DATETIME NOT NULL,
    duration_minutes INT NOT NULL,  -- Timer field
    total_marks DECIMAL(5,2) NOT NULL,
    pass_percentage DECIMAL(5,2) NOT NULL DEFAULT 40.00,
    status ENUM('scheduled', 'ongoing', 'completed') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id) ON DELETE RESTRICT
);

-- ==========================================
-- 6. QUESTION TABLE
-- ==========================================
CREATE TABLE question (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    question_text TEXT NOT NULL,
    marks DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE
);

-- ==========================================
-- 7. OPTION TABLE
-- ==========================================
CREATE TABLE `option` (
    option_id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES question(question_id) ON DELETE CASCADE
);

-- ==========================================
-- 8. EXAM_QUESTION (Bridge Table)
-- ==========================================
-- Manages Many-to-Many relationship between Exams and Questions
CREATE TABLE exam_question (
    exam_id INT NOT NULL,
    question_id INT NOT NULL,
    PRIMARY KEY (exam_id, question_id),
    FOREIGN KEY (exam_id) REFERENCES exam(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES question(question_id) ON DELETE CASCADE
);

-- ==========================================
-- 9. STUDENT_EXAM (Bridge Table / Attempt tracking)
-- ==========================================
-- Manages student attempts for an exam
CREATE TABLE student_exam (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    attempt_status ENUM('started', 'submitted', 'abandoned') DEFAULT 'started',
    UNIQUE KEY unique_student_exam (student_id, exam_id), -- Prevent multiple attempts if required
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exam(exam_id) ON DELETE CASCADE
);

-- ==========================================
-- 10. RESULT TABLE
-- ==========================================
CREATE TABLE result (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    status ENUM('Pass', 'Fail') NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_result (student_id, exam_id),
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exam(exam_id) ON DELETE CASCADE
);

-- ==========================================
-- INDEX CREATION FOR OPTIMIZATION
-- ==========================================
-- Index on enrollment_no for fast student lookups
CREATE INDEX idx_student_enrollment ON student(enrollment_no);

-- Index on exam date and status for dashboard queries
CREATE INDEX idx_exam_date_status ON exam(exam_date, status);

-- Index to quickly find correct options for grading
CREATE INDEX idx_option_question_correct ON `option`(question_id, is_correct);

-- Index on result score to quickly find top performers
CREATE INDEX idx_result_score ON result(score DESC);

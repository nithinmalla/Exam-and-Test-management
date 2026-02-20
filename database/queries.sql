-- ==============================================================================
-- Exam and Test Management System - Sample Queries
-- ==============================================================================
USE exam_management_system;

-- ------------------------------------------------------------------------------
-- 1. SELECT QUERIES WITH JOIN
-- ------------------------------------------------------------------------------

-- Query A: Get all students and the exams they have appeared for, along with scores
SELECT 
    s.enrollment_no, 
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    e.exam_name, 
    sub.subject_code, 
    r.score, 
    r.status
FROM student s
JOIN result r ON s.student_id = r.student_id
JOIN exam e ON r.exam_id = e.exam_id
JOIN subject sub ON e.subject_id = sub.subject_id
ORDER BY r.score DESC;

-- Query B: Find all questions and their correct options for a specific exam (e.g., Exam 1)
SELECT 
    q.question_id, 
    q.question_text, 
    o.option_text AS correct_answer, 
    q.marks
FROM exam_question eq
JOIN question q ON eq.question_id = q.question_id
JOIN `option` o ON q.question_id = o.question_id
WHERE eq.exam_id = 1 AND o.is_correct = TRUE;


-- ------------------------------------------------------------------------------
-- 2. AGGREGATE QUERIES (Group By, Having)
-- ------------------------------------------------------------------------------

-- Query A: Calculate the average score for each exam
SELECT 
    e.exam_name, 
    COUNT(r.result_id) AS total_students_appeared,
    ROUND(AVG(r.score), 2) AS average_score,
    MAX(r.score) AS highest_score
FROM result r
JOIN exam e ON r.exam_id = e.exam_id
GROUP BY e.exam_id, e.exam_name;

-- Query B: Find subjects that have more than 5 questions in the question bank
SELECT 
    s.subject_code, 
    s.subject_name, 
    COUNT(q.question_id) AS total_questions
FROM subject s
JOIN question q ON s.subject_id = q.subject_id
GROUP BY s.subject_id, s.subject_name
HAVING COUNT(q.question_id) > 5;


-- ------------------------------------------------------------------------------
-- 3. UPDATE OR DELETE QUERIES
-- ------------------------------------------------------------------------------

-- Query A: Update exam status based on the current date
UPDATE exam
SET status = 'completed'
WHERE exam_date < NOW() AND status = 'ongoing';

-- Query B: Delete an abandoned student attempt
DELETE FROM student_exam 
WHERE attempt_status = 'abandoned' AND DATE(start_time) < '2023-01-01';


-- ------------------------------------------------------------------------------
-- 4. VIEWS
-- ------------------------------------------------------------------------------

-- View: Result Summary Dashboard View for Teachers
CREATE OR REPLACE VIEW ResultSummaryView AS
SELECT 
    e.exam_name, 
    t.first_name AS teacher_name, 
    sub.subject_name,
    COUNT(r.student_id) AS total_candidates,
    SUM(CASE WHEN r.status = 'Pass' THEN 1 ELSE 0 END) AS passed_count,
    ROUND((SUM(CASE WHEN r.status = 'Pass' THEN 1 ELSE 0 END) / COUNT(r.student_id)) * 100, 2) AS pass_percentage
FROM exam e
JOIN teacher t ON e.teacher_id = t.teacher_id
JOIN subject sub ON e.subject_id = sub.subject_id
LEFT JOIN result r ON e.exam_id = r.exam_id
GROUP BY e.exam_id, e.exam_name, t.first_name, sub.subject_name;

-- Query the View
-- SELECT * FROM ResultSummaryView;


-- ------------------------------------------------------------------------------
-- 5. STORED PROCEDURE
-- ------------------------------------------------------------------------------

-- Stored Procedure to Calculate and Insert Result Automatically
DELIMITER //

CREATE PROCEDURE CalculateExamResult (
    IN p_student_id INT, 
    IN p_exam_id INT,
    IN p_obtained_score DECIMAL(5,2)
)
BEGIN
    DECLARE v_pass_percentage DECIMAL(5,2);
    DECLARE v_total_marks DECIMAL(5,2);
    DECLARE v_percentage DECIMAL(5,2);
    DECLARE v_status_enum ENUM('Pass', 'Fail');

    -- Get exam requirements
    SELECT total_marks, pass_percentage 
    INTO v_total_marks, v_pass_percentage
    FROM exam 
    WHERE exam_id = p_exam_id;

    -- Calculate current percentage
    SET v_percentage = (p_obtained_score / v_total_marks) * 100;

    -- Determine Pass/Fail status
    IF v_percentage >= v_pass_percentage THEN
        SET v_status_enum = 'Pass';
    ELSE
        SET v_status_enum = 'Fail';
    END IF;

    -- Insert or Update Result
    INSERT INTO result (student_id, exam_id, score, status)
    VALUES (p_student_id, p_exam_id, p_obtained_score, v_status_enum)
    ON DUPLICATE KEY UPDATE 
        score = p_obtained_score, 
        status = v_status_enum, 
        generated_at = CURRENT_TIMESTAMP;

END //

DELIMITER ;


-- ------------------------------------------------------------------------------
-- 6. TOP PERFORMER QUERY (Using Subqueries & Limits)
-- ------------------------------------------------------------------------------

-- Find the top performing student for a given exam
SELECT 
    s.enrollment_no, 
    CONCAT(s.first_name, ' ', s.last_name) AS top_student, 
    r.score 
FROM student s
JOIN result r ON s.student_id = r.student_id
WHERE r.exam_id = 1
ORDER BY r.score DESC
LIMIT 1;

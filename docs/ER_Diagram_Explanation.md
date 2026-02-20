# ER Diagram and Database Relationship Explanation

This document provides a clear, Viva-ready explanation of the Entity-Relationship (ER) model and the database architecture for the **Exam and Test Management System**.

## 1. Overview of Entities

The system revolves around several core entities:
- **Users**: `admin`, `teacher`, `student`
- **Academics**: `subject`, `exam`
- **Assessment**: `question`, `option`, `result`

---

## 2. One-to-Many (1:N) Relationships

A One-to-Many relationship exists when a single record in one table is associated with multiple records in another table.

### Key Examples in our Schema:
*   **`subject` (1) to `exam` (N)**
    *   *Explanation:* A single subject (e.g., Database Systems) can have multiple exams over time (Midterm, Finals, Retest). However, an individual exam is strictly tied to one subject.
*   **`teacher` (1) to `exam` (N)**
    *   *Explanation:* One teacher can create and supervise multiple exams. Conversely, a specific exam must be assigned to one responsible teacher.
*   **`subject` (1) to `question` (N)**
    *   *Explanation:* The question bank is categorized by subject. A subject includes many questions, but each question uniquely belongs to a specific subject pool.
*   **`question` (1) to `option` (N)**
    *   *Explanation:* A single multiple-choice question contains multiple options (e.g., A, B, C, D), but each option is strictly tied to one specific question.

---

## 3. Many-to-Many (M:N) Relationships and Bridge Tables

In relational databases, Many-to-Many relationships cannot be implemented directly without causing massive data redundancy. We resolve them using a **Bridge Table** (also known as an Associative Entity or Junction Table).

### A. The `exam` & `question` Relationship
*   **The Problem:** One exam contains many questions. Concurrently, a single question from the subject pool can be reused across many different exams. This creates an M:N relationship.
*   **The Solution (`exam_question` Bridge Table):**
    *   Instead of duplicating questions for every exam, we use `exam_question`.
    *   It contains only two foreign keys: `exam_id` and `question_id`.
    *   Together, they form a **Composite Primary Key**.
    *   *Viva Note:* "Why use a bridge table here?" -> "To achieve reusability. A teacher can pull 50 existing questions into a new exam without duplicating the text of the questions in the database."

### B. The `student` & `exam` Relationship
*   **The Problem:** A student takes many exams throughout their course. Conversely, an exam is taken by many students. This is a classic M:N scenario.
*   **The Solution (`student_exam` Bridge Table):**
    *   We use the `student_exam` table to record attempts.
    *   It tracks individual instance details: which student took which exam, what time they started (`start_time`), when they finished (`end_time`), and their `attempt_status`.
    *   *Viva Note:* "Why not just put this in the `result` table?" -> "Because `student_exam` tracks the *attempt state* (e.g., ongoing, abandoned) while `result` is a specialized table generated only *after* the exam is completed and graded."

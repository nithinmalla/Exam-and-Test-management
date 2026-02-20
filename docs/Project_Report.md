# Project Architecture and Design Report

## Exam and Test Management System

### 1. Executive Summary
This report outlines the database architecture for the Exam and Test Management System. The design is engineered to accurately model an academic assessment environment while maintaining strict adherence to RDBMS principles. The schema is highly normalized, optimized for read/write performance, and designed to scale as the institution grows.

---

### 2. Architectural Design Principles

The database schema was built upon three core pillars:
1.  **Strict Normalization (3NF):** Ensuring zero data redundancy by completely segregating disjoint entities.
2.  **Referential Integrity:** Enforcing strict foreign key constraints (`ON DELETE CASCADE` and `ON DELETE RESTRICT`) to prevent orphaned records.
3.  **Auditability & State Tracking:** Implementing granular status tracking using `ENUM` datasets for exams (`scheduled`, `ongoing`, `completed`) and student attempts (`started`, `submitted`, `abandoned`).

---

### 3. How the Design Avoids Redundancy
*   **Question Bank Reusability:** The question pool is isolated from the exam itself. Connecting them via the `exam_question` bridge table means a teacher can build 10 different exams pulling from the same 500 questions without duplicating a single character of question text.
*   **Decoupled Entities:** By abstracting the `Result` from the `Student_Exam` attempt tracker, the database avoids storing NULL scores for exams that are currently ongoing or were abandoned midway.

---

### 4. Index Optimization Strategy
To ensure the system remains highly responsive under load (e.g., hundreds of students logging in and submitting an exam simultaneously), specific B-Tree indexes were implemented:
*   `idx_student_enrollment`: Speeds up authentication and profile lookups by indexing the unique enrollment number.
*   `idx_exam_date_status`: Optimizes dashboard queries. When querying "Which exams are happening right now?", the database engine uses this index instead of scanning the entire `exam` table.
*   `idx_option_question_correct`: Drastically reduces the time required for the automated grading script to fetch the correct answers for a specific question.
*   `idx_result_score`: Allows instant O(log N) retrieval of top performers and ranking aggregations without sorting large result sets in memory.

---

### 5. Scalability Discussion
As the application scales to thousands of concurrent users, the current schema supports horizontal and vertical scaling:
*   **Vertical Scaling (Hardware):** The purely relational structure allows straightforward migration to high-memory instances (e.g., AWS RDS) to cache the frequently accessed question banks in RAM.
*   **Horizontal Scaling (Architecture):** The stateless nature of the data models supports reading from Read-Replicas. Heavy analytical queries (e.g., the `ResultSummaryView`) can be routed to a read-replica database to unburden the primary write database during peak exam hours.

---

### 6. Future Enhancements
While the current schema is robust, future feature iterations could include:
1.  **Question Randomization & Shuffling:** Adding a `sequence_order` column to `exam_question`, or generating randomized sets per student to prevent cheating.
2.  **Granular Permissions (RBAC):** Expanding the `admin` table into a full Role-Based Access Control system (SuperAdmin, Invigilator, Examiner) with a `roles` and `permissions` schema.
3.  **Audit Logging:** Creating an `audit_log` table triggered to capture changes (insertions, deletions) on critical tables like `result` and `exam` to ensure academic integrity.

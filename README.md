# 🎓 Exam and Test Management System

![Project Type](https://img.shields.io/badge/Project%20Type-Database%20Architecture-blue?style=for-the-badge)
![Database](https://img.shields.io/badge/Database-MySQL-orange?style=for-the-badge&logo=mysql)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A robust, highly-normalized relational database architecture designed to manage users, rigorous academic assessments, comprehensive question banks, and secure student attempts.

## 📝 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Technologies Used](#-technologies-used)
- [Database Structure](#-database-structure)
- [Getting Started](#-getting-started)
- [Sample Queries](#-sample-queries)
- [Project Documentation](#-project-documentation)
- [Author & License](#-author--license)

---

## 📖 Project Overview

This system is an enterprise-grade backend blueprint for managing institutional exams. It handles user authentication scopes (Admin, Teacher, Student), complex Many-to-Many relationships utilizing Bridge Tables, and ensures strict data integrity. The schema is normalized up to the **Third Normal Form (3NF)** to ensure zero redundancy and maximum auditability.

## ✨ Key Features

-   **Role Separation:** Distinct data scopes for Students, Teachers, and Administrators.
-   **Reusable Question Banks:** Questions are tied dynamically to exams, allowing massive libraries of questions to be reused without duplication.
-   **Granular Attempt Tracking:** Records exact start/end time, abandonment metrics, and attempt status via `student_exam`.
-   **Automated Grading Procedure:** Uses a MySQL Stored Procedure to instantly grade attempts and categorize Pass/Fail metrics depending on configurable pass percentage criteria.
-   **High Performance:** Strategic indexing implementations on high-cardinality search metrics (e.g. `idx_exam_date_status`, `idx_result_score`) ensuring O(log N) data retrieval.

## 🛠 Technologies Used

-   **Database Engine:** MySQL
-   **Design Paradigms:** Relational Database Management System (RDBMS), Normalization (3NF)
-   **Architecture:** Bridge Tables, Clustered/Non-Clustered Indexing Considerations, Automated Views

## 🗄 Database Structure

The project implements the following entities with interconnected relationships:
- `admin`
- `teacher`, `student`, `subject`
- `exam`, `question`, `option`
- **Bridge Entities:** `exam_question`, `student_exam`
- **Transactional Entities:** `result`

*(Refer to `docs/ER_Diagram_Explanation.md` for a complete breakdown of relationship management).*

## 🚀 Getting Started

Follow these steps to deploy the database instance locally:

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/Exam-Test-Management-System.git
    cd Exam-Test-Management-System
    ```

2.  **Execute the Schema**
    Login to your MySQL instance and source the schema file:
    ```bash
    mysql -u root -p < database/schema.sql
    ```

3.  **Load the Sample Data**
    Populate the instantiated database with dummy data for testing:
    ```bash
    mysql -u root -p < database/sample_data.sql
    ```

4.  **Run Analytical Queries**
    Execute the pre-built optimized data views and aggregates:
    ```bash
    mysql -u root -p < database/queries.sql
    ```

## 🔍 Sample Queries

Here's an example of aggregating standard deviation and complex exam passing metrics:

```sql
-- Calculate the average score for each exam
SELECT 
    e.exam_name, 
    COUNT(r.result_id) AS total_students_appeared,
    ROUND(AVG(r.score), 2) AS average_score,
    MAX(r.score) AS highest_score
FROM result r
JOIN exam e ON r.exam_id = e.exam_id
GROUP BY e.exam_id, e.exam_name;
```

```sql
-- Find subjects having more than 5 registered questions
SELECT 
    s.subject_code, 
    s.subject_name, 
    COUNT(q.question_id) AS total_questions
FROM subject s
JOIN question q ON s.subject_id = q.subject_id
GROUP BY s.subject_id, s.subject_name
HAVING COUNT(q.question_id) > 5;
```

## 📚 Project Documentation

Dive deeper into the architectural decisions:
-   [Entity-Relationship Model Breakdown](docs/ER_Diagram_Explanation.md)
-   [Step-by-Step Normalization Guide](docs/Normalization.md)
-   [Project Architecture Report](docs/Project_Report.md)

## 👤 Author & License

👤 **Your Name**
* GitHub: [@nithinmalla]([https://github.com/yourusername](https://github.com/nithinmalla)) 

📝 **License**
This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.

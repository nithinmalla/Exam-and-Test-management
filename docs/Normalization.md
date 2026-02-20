# Step-by-Step Database Normalization

Normalization is the process of organizing data in a database to eliminate redundancy, prevent data anomalies (insertion, update, and deletion), and ensure data dependencies make logical sense.

Below is a practical walkthrough of normalizing student exam data from an Unnormalized Form (UNF) to the Third Normal Form (3NF).

---

## 1. Unnormalized Form (UNF)

In UNF, data is often stored in a flat-file format, containing multi-valued attributes and massive redundancy.

**Table: `Student_Exam_Flat`**

| StudentID | StudentName | SubjectCode | SubjectName | TeacherName | ExamDate | Questions_Attempted | Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| S101 | John Doe | CS101 | DBMS | Alan Turing | 2023-10-15 | Q1, Q2, Q5 | 85 |
| S102 | Jane Smith | CS101 | DBMS | Alan Turing | 2023-10-15 | Q1, Q3, Q4 | 90 |
| S101 | John Doe | MA101 | Discrete Math| Ada Lovelace| 2023-12-10 | Q1, Q2, Q3 | 75 |

**Issues in UNF:**
*   **Multi-valued attributes:** `Questions_Attempted` contains a comma-separated list of values.
*   **Redundancy:** `StudentName`, `SubjectName`, and `TeacherName` are repeated continuously.

---

## 2. First Normal Form (1NF)

**Rule for 1NF:** 
1. Eliminate multi-valued attributes (every cell must contain atomic/indivisible values).
2. Ensure there is a Primary Key.

*Action:* We split the `Questions_Attempted` into separate rows.

**Table: `Student_Exam_1NF`** (Composite PK: `StudentID`, `SubjectCode`, `QuestionID`)

| StudentID | StudentName | SubjectCode | SubjectName | TeacherName | ExamDate | QuestionID | Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| S101 | John Doe | CS101 | DBMS | Alan Turing | 2023-10-15 | Q1 | 85 |
| S101 | John Doe | CS101 | DBMS | Alan Turing | 2023-10-15 | Q2 | 85 |
| S101 | John Doe | CS101 | DBMS | Alan Turing | 2023-10-15 | Q5 | 85 |
| S102 | Jane Smith | CS101 | DBMS | Alan Turing | 2023-10-15 | Q1 | 90 |

*Status:* All values are atomic. However, redundancy is now even worse.

---

## 3. Second Normal Form (2NF)

**Rule for 2NF:** 
1. Must be in 1NF.
2. Eliminate **Partial Dependencies**. (Non-key attributes must depend on the *entire* Composite Primary Key, not just a part of it).

*Action:* Break the table into logical entities. `StudentName` only depends on `StudentID`, not on the subject or question. `SubjectName` and `TeacherName` only depend on `SubjectCode`.

**Table: `Student`**
*   `StudentID` (PK)
*   `StudentName`

**Table: `Subject_Info`**
*   `SubjectCode` (PK)
*   `SubjectName`
*   `TeacherName`

**Table: `Exam_Attempt`** (Bridge)
*   `StudentID` (FK)
*   `SubjectCode` (FK)
*   `ExamDate`
*   `Score`

---

## 4. Third Normal Form (3NF)

**Rule for 3NF:** 
1. Must be in 2NF.
2. Eliminate **Transitive Dependencies**. (Non-key attributes must not depend on other non-key attributes).

*Action:* Look at the `Subject_Info` table from 2NF. What if a teacher's department or phone number was added? The teacher's details would depend on the `TeacherName` (or ideally a `TeacherID`), which in turn depends on the `SubjectCode`. This is a transitive dependency: `SubjectCode -> TeacherID -> TeacherName`.

We separate the Teacher into its own table.

**Final 3NF Schema (matching our system design):**

1.  **`Student` Table:**
    *   `StudentID` (PK)
    *   `StudentName`
2.  **`Teacher` Table:**
    *   `TeacherID` (PK)
    *   `TeacherName`
3.  **`Subject` Table:**
    *   `SubjectCode` (PK)
    *   `SubjectName`
4.  **`Exam` Table:**
    *   `ExamID` (PK)
    *   `SubjectCode` (FK)
    *   `TeacherID` (FK)
    *   `ExamDate`
5.  **`Result` Table:**
    *   `ResultID` (PK)
    *   `StudentID` (FK)
    *   `ExamID` (FK)
    *   `Score`

**Conclusion:** Through normalization, we arrived at an architecture where every table represents a single logical concept. Updates, deletions, and inserts can be performed without causing anomalies. (e.g., Changing a teacher's name happens in exactly one place).

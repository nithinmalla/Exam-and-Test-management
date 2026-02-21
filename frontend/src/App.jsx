import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BookOpen, LayoutDashboard, Users, FileText } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ExamsList from './components/ExamsList';
import StudentsList from './components/StudentsList';
import TeachersList from './components/TeachersList';
import SubjectsList from './components/SubjectsList';

function App() {
  return (
    <Router>
      <nav>
        <div className="nav-brand">
          <BookOpen />
          <span>ExamManager</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/exams" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FileText size={18} /> Exams
          </Link>
          <Link to="/students" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Users size={18} /> Students
          </Link>
          <Link to="/teachers" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Users size={18} /> Teachers
          </Link>
          <Link to="/subjects" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <BookOpen size={18} /> Subjects
          </Link>
        </div>
      </nav>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/exams" element={<ExamsList />} />
          <Route path="/students" element={<StudentsList />} />
          <Route path="/teachers" element={<TeachersList />} />
          <Route path="/subjects" element={<SubjectsList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

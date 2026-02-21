import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BookOpen, LayoutDashboard, Users, FileText } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ExamsList from './components/ExamsList';
import StudentsList from './components/StudentsList';

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
        </div>
      </nav>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/exams" element={<ExamsList />} />
          <Route path="/students" element={<StudentsList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

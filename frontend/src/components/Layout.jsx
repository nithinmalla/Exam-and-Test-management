import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, FileText, LogOut } from 'lucide-react';

const Layout = () => {
    const role = localStorage.getItem('role');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <aside style={{ width: '250px', background: 'var(--surface-dark)', color: 'var(--text-main)', padding: '1rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                    <BookOpen color="var(--primary)" />
                    ExamManager
                </div>

                <div style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {role} Panel
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
                    {role === 'admin' && (
                        <>
                            <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', color: 'var(--text-main)', textDecoration: 'none', borderRadius: '4px', background: 'var(--primary)' }}>
                                <LayoutDashboard size={18} /> Dashboard
                            </Link>
                            <Link to="/admin/students" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                                <Users size={18} /> Students
                            </Link>
                            <Link to="/admin/teachers" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                                <Users size={18} /> Teachers
                            </Link>
                            <Link to="/admin/subjects" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                                <BookOpen size={18} /> Subjects
                            </Link>
                            <Link to="/admin/exams" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                                <FileText size={18} /> Exams
                            </Link>
                        </>
                    )}

                    {role === 'teacher' && (
                        <>
                            <Link to="/teacher" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', color: 'var(--text-main)', textDecoration: 'none', borderRadius: '4px', background: 'var(--primary)' }}>
                                <LayoutDashboard size={18} /> Dashboard
                            </Link>
                            <Link to="/teacher/exams" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                                <FileText size={18} /> Add / View Exams
                            </Link>
                        </>
                    )}

                    {role === 'student' && (
                        <>
                            <Link to="/student" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', color: 'var(--text-main)', textDecoration: 'none', borderRadius: '4px', background: 'var(--primary)' }}>
                                <LayoutDashboard size={18} /> Dashboard
                            </Link>
                            <Link to="/student/exams" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                                <FileText size={18} /> Upcoming Exams
                            </Link>
                        </>
                    )}
                </nav>

                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    <LogOut size={18} /> Logout
                </button>
            </aside>

            <main style={{ flexGrow: 1, backgroundColor: 'var(--bg-dark)', overflowY: 'auto' }}>
                <div style={{ padding: '2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;

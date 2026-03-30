import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, FileText, LogOut } from 'lucide-react';

const Layout = () => {
    const role = localStorage.getItem('role');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const getNavClass = ({ isActive }) => isActive ? "nav-item active" : "nav-item";

    return (
        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
            <aside style={{ width: '260px', padding: '32px 24px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    <BookOpen color="var(--primary)" size={28} />
                    Eduhouse
                </div>

                <div style={{ fontSize: '0.75rem', marginBottom: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                    Main Menu
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
                    {role === 'admin' && (
                        <>
                            <NavLink to="/admin" end className={getNavClass}>
                                <LayoutDashboard size={20} /> Overview
                            </NavLink>
                            <NavLink to="/admin/students" className={getNavClass}>
                                <Users size={20} /> Students
                            </NavLink>
                            <NavLink to="/admin/teachers" className={getNavClass}>
                                <Users size={20} /> Teachers
                            </NavLink>
                            <NavLink to="/admin/subjects" className={getNavClass}>
                                <BookOpen size={20} /> Subjects
                            </NavLink>
                            <NavLink to="/admin/exams" className={getNavClass}>
                                <FileText size={20} /> Exams
                            </NavLink>
                        </>
                    )}

                    {role === 'teacher' && (
                        <>
                            <NavLink to="/teacher" end className={getNavClass}>
                                <LayoutDashboard size={20} /> Overview
                            </NavLink>
                            <NavLink to="/teacher/exams" className={getNavClass}>
                                <FileText size={20} /> Add / View Exams
                            </NavLink>
                        </>
                    )}

                    {role === 'student' && (
                        <>
                            <NavLink to="/student" end className={getNavClass}>
                                <LayoutDashboard size={20} /> Overview
                            </NavLink>
                            <NavLink to="/student/exams" className={getNavClass}>
                                <FileText size={20} /> Upcoming Exams
                            </NavLink>
                        </>
                    )}
                </nav>

                <div style={{ fontSize: '0.75rem', marginTop: 'auto', marginBottom: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                    Settings
                </div>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontSize: '1rem', fontWeight: '500', borderRadius: '12px', transition: 'all 0.2s ease' }} onMouseOver={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = '#FEF2F2'; }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            <main style={{ flexGrow: 1, overflowY: 'auto', padding: '40px 40px 40px 24px' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;

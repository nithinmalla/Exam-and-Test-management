import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, BookOpen, GraduationCap, ClipboardList } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({ students: 0, exams: 0, teachers: 0, subjects: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:5001/api/stats')
            .then(res => {
                setStats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Overview Dashboard</h1>
            </div>

            <div className="stat-grid">
                <div className="glass-panel stat-card">
                    <GraduationCap size={40} color="var(--primary)" style={{ marginBottom: '15px' }} />
                    <div className="stat-value">{stats.students}</div>
                    <div className="stat-label">Total Students</div>
                </div>
                <div className="glass-panel stat-card">
                    <BookOpen size={40} color="var(--success)" style={{ marginBottom: '15px' }} />
                    <div className="stat-value">{stats.subjects}</div>
                    <div className="stat-label">Subjects</div>
                </div>
                <div className="glass-panel stat-card">
                    <ClipboardList size={40} color="var(--warning)" style={{ marginBottom: '15px' }} />
                    <div className="stat-value">{stats.exams}</div>
                    <div className="stat-label">Exams Created</div>
                </div>
                <div className="glass-panel stat-card">
                    <Users size={40} color="var(--danger)" style={{ marginBottom: '15px' }} />
                    <div className="stat-value">{stats.teachers}</div>
                    <div className="stat-label">Faculty Members</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

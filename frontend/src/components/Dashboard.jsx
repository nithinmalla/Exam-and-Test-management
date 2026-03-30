import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, BookOpen, GraduationCap, ClipboardList } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({ students: 0, exams: 0, teachers: 0, subjects: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:5001/api/stats', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginTop: '30px' }}>
                {/* Students Card - Purple */}
                <div className="card card-pastel-purple" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>Total Students</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.students}</div>
                        </div>
                        <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '16px', display: 'flex', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            <GraduationCap size={24} color="#8A63D2" />
                        </div>
                    </div>
                </div>

                {/* Subjects Card - Peach */}
                <div className="card card-pastel-peach" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>Subjects</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.subjects}</div>
                        </div>
                        <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '16px', display: 'flex', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            <BookOpen size={24} color="#F37335" />
                        </div>
                    </div>
                </div>

                {/* Exams Card - Cyan */}
                <div className="card card-pastel-cyan" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>Exams Created</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.exams}</div>
                        </div>
                        <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '16px', display: 'flex', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            <ClipboardList size={24} color="#3498db" />
                        </div>
                    </div>
                </div>

                {/* Teachers Card - Green */}
                <div className="card card-pastel-green" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>Faculty Members</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.teachers}</div>
                        </div>
                        <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '16px', display: 'flex', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            <Users size={24} color="#2ecc71" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

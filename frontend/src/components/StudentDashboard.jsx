import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, FileText } from 'lucide-react';

const StudentDashboard = () => {
    const [subjects, setSubjects] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subRes, examRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/student/subjects'),
                    axios.get('http://localhost:5001/api/student/exams')
                ]);
                setSubjects(subRes.data);
                setExams(examRes.data);
            } catch (err) {
                console.error("Failed to fetch student data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading Student Dashboard...</div>;

    return (
        <div>
            <h1 style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>Student Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--surface-dark)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'none', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#000000', padding: '1rem', borderRadius: '50%' }}><BookOpen color="var(--primary)" size={24} /></div>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>My Subjects</h3>
                        <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 'bold' }}>{subjects.length}</p>
                    </div>
                </div>

                <div style={{ background: 'var(--surface-dark)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'none', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#000000', padding: '1rem', borderRadius: '50%' }}><FileText color="var(--warning)" size={24} /></div>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Upcoming Exams</h3>
                        <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 'bold' }}>{exams.filter(e => e.status === 'scheduled').length}</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <div style={{ background: 'var(--surface-dark)', borderRadius: '8px', boxShadow: 'none', border: '1px solid var(--primary)', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>My Subjects & Teachers</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Code</th>
                                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Subject</th>
                                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Teacher</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map(s => (
                                <tr key={s.subject_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.75rem 0' }}>{s.subject_code}</td>
                                    <td style={{ padding: '0.75rem 0' }}>{s.subject_name}</td>
                                    <td style={{ padding: '0.75rem 0' }}>{`${s.teacher_first_name} ${s.teacher_last_name}`}</td>
                                </tr>
                            ))}
                            {subjects.length === 0 && <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No subjects assigned</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div style={{ background: 'var(--surface-dark)', borderRadius: '8px', boxShadow: 'none', border: '1px solid var(--primary)', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>My Exams</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Subject</th>
                                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Exam Name</th>
                                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Date</th>
                                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.map(e => (
                                <tr key={e.exam_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.75rem 0' }}>{e.subject_name}</td>
                                    <td style={{ padding: '0.75rem 0' }}>{e.exam_name}</td>
                                    <td style={{ padding: '0.75rem 0' }}>{new Date(e.exam_date).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            backgroundColor: '#000000', border: e.status === 'completed' ? '1px solid var(--success)' : '1px solid var(--warning)',
                                            color: e.status === 'completed' ? 'var(--success)' : 'var(--warning)'
                                        }}>
                                            {e.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {exams.length === 0 && <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No exams found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

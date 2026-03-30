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
                const authHeaders = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const [subRes, examRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/student/subjects', authHeaders),
                    axios.get('http://localhost:5001/api/student/exams', authHeaders)
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div className="card card-pastel-purple" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>My Subjects</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{subjects.length}</div>
                        </div>
                        <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '16px', display: 'flex', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            <BookOpen size={24} color="#8A63D2" />
                        </div>
                    </div>
                </div>

                <div className="card card-pastel-peach" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>Upcoming Exams</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{exams.filter(e => e.status === 'scheduled').length}</div>
                        </div>
                        <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '16px', display: 'flex', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            <FileText size={24} color="#F37335" />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-main)', fontWeight: '700' }}>My Subjects & Teachers</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Subject</th>
                                <th>Teacher</th>
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

                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-main)', fontWeight: '700' }}>My Exams</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Exam Name</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.map(e => (
                                <tr key={e.exam_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.75rem 0' }}>{e.subject_name}</td>
                                    <td style={{ padding: '0.75rem 0' }}>{e.exam_name}</td>
                                    <td style={{ padding: '0.75rem 0' }}>{new Date(e.exam_date).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 0' }}>
                                        <span className={`badge badge-${e.status.toLowerCase()}`}>
                                            {e.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem 0', fontWeight: 'bold', color: e.result_status === 'Pass' ? 'var(--success)' : (e.result_status === 'Fail' ? 'var(--danger)' : 'var(--text-muted)') }}>
                                        {e.score !== null && e.score !== undefined ? `${e.score} (${e.result_status})` : '-'}
                                    </td>
                                </tr>
                            ))}
                            {exams.length === 0 && <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No exams found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

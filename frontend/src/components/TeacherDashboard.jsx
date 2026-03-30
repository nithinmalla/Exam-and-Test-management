import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Users, FileText } from 'lucide-react';

const TeacherDashboard = () => {
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const authHeaders = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
                const [subRes, stuRes, examRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/teacher/subjects', authHeaders),
                    axios.get('http://localhost:5001/api/teacher/students', authHeaders),
                    axios.get('http://localhost:5001/api/teacher/exams', authHeaders)
                ]);
                setSubjects(subRes.data);
                setStudents(stuRes.data);
                setExams(examRes.data);
            } catch (err) {
                console.error("Failed to fetch teacher data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading Teacher Dashboard...</div>;

    return (
        <div>
            <h1 style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>Teacher Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div className="card card-pastel-purple" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>Assigned Subjects</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{subjects.length}</div>
                        </div>
                        <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '16px', display: 'flex', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            <BookOpen size={24} color="#8A63D2" />
                        </div>
                    </div>
                </div>

                <div className="card card-pastel-cyan" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>My Students</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{students.length}</div>
                        </div>
                        <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '16px', display: 'flex', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            <Users size={24} color="#3498db" />
                        </div>
                    </div>
                </div>

                <div className="card card-pastel-peach" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>Exams Scheduled</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{exams.length}</div>
                        </div>
                        <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '16px', display: 'flex', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            <FileText size={24} color="#F37335" />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-main)', fontWeight: '700' }}>Assigned Subjects</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map(s => (
                                <tr key={s.subject_id}>
                                    <td>{s.subject_code}</td>
                                    <td>{s.subject_name}</td>
                                </tr>
                            ))}
                            {subjects.length === 0 && <tr><td colSpan="2" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>No subjects assigned</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-main)', fontWeight: '700' }}>Recent Exams</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Exam Name</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.map(e => (
                                <tr key={e.exam_id}>
                                    <td>{e.subject_name}</td>
                                    <td>{e.exam_name}</td>
                                    <td>{new Date(e.exam_date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {exams.length === 0 && <tr><td colSpan="3" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>No exams scheduled</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';

const StudentExams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchExams = async () => {
        setLoading(true);
        try {
            const authHeaders = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            const res = await axios.get('http://localhost:5001/api/student/exams', authHeaders);
            setExams(res.data);
        } catch (err) {
            console.error("Failed to fetch student exams", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const upcomingExams = exams.filter(e => e.status === 'scheduled');
    const recentExams = exams.filter(e => e.status !== 'scheduled');

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Exams...</div>;

    return (
        <div>
            <h1 style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>Exams Portal</h1>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={20} color="var(--primary)" /> Upcoming Exams
                </h2>

                {upcomingExams.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <AlertCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>No upcoming exams scheduled at the moment.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {upcomingExams.map(exam => (
                            <div key={exam.exam_id} className="card card-pastel-peach" style={{ border: '1px solid #FFE0B2' }}>
                                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                                            {exam.subject_name}
                                        </div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{exam.exam_name}</h3>
                                    </div>
                                    <div style={{ background: '#FFF4E5', color: '#F37335', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                                        Scheduled
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-main)', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                        <Calendar size={16} color="var(--text-muted)" />
                                        {new Date(exam.exam_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                        <Clock size={16} color="var(--text-muted)" />
                                        {new Date(exam.exam_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({exam.duration_minutes} mins)
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                        <BookOpen size={16} color="var(--text-muted)" />
                                        Teacher: {exam.teacher_first_name} {exam.teacher_last_name}
                                    </div>
                                </div>

                                <button 
                                    className="btn-primary" 
                                    style={{ width: '100%', justifyContent: 'center' }} 
                                    onClick={() => navigate(`/student/take-exam/${exam.exam_id}`)}
                                    disabled={new Date() < new Date(exam.exam_date)}
                                >
                                    {new Date() < new Date(exam.exam_date) ? 'Starts at ' + new Date(exam.exam_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Start Exam'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)', fontWeight: '700' }}>Recent Exams & Results</h2>
                <div className="card">
                    {recentExams.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>No recent exams found.</p>
                    ) : (
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
                                {recentExams.map(e => (
                                    <tr key={e.exam_id}>
                                        <td style={{ fontWeight: '600' }}>{e.subject_name}</td>
                                        <td>{e.exam_name}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{new Date(e.exam_date).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge badge-${e.status.toLowerCase()}`}>
                                                {e.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            {e.score !== null ? (
                                                <span style={{ fontWeight: '700', color: e.result_status === 'Pass' ? 'var(--success)' : 'var(--danger)' }}>
                                                    {e.score} ({e.result_status})
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>Pending</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </div>
    );
};

export default StudentExams;

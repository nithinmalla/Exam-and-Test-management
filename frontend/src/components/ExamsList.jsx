import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, PlusCircle } from 'lucide-react';

const ExamsList = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:5000/api/exams/recent')
            .then(res => {
                setExams(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Recent Exams</h1>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PlusCircle size={18} /> Schedule Exam
                </button>
            </div>

            <div className="glass-panel">
                {loading ? (
                    <div>Loading exams...</div>
                ) : exams.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No exams scheduled yet.</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Exam Name</th>
                                <th>Subject</th>
                                <th>Date & Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.map(exam => (
                                <tr key={exam.exam_id}>
                                    <td style={{ fontWeight: '600' }}>{exam.exam_name}</td>
                                    <td>{exam.subject_name}</td>
                                    <td style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                                        <Calendar size={14} /> {new Date(exam.exam_date).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${exam.status}`}>
                                            {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ExamsList;

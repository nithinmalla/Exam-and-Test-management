import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, PlusCircle, X } from 'lucide-react';

const ExamsList = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [formData, setFormData] = useState({
        subject_id: '',
        teacher_id: '',
        exam_name: '',
        exam_date: '',
        duration_minutes: 60,
        total_marks: 100,
        pass_percentage: 40
    });

    const fetchExams = () => {
        setLoading(true);
        axios.get('http://localhost:5000/api/exams/recent')
            .then(res => {
                setExams(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const fetchDependencies = () => {
        axios.get('http://localhost:5000/api/subjects').then(res => setSubjects(res.data));
        axios.get('http://localhost:5000/api/teachers').then(res => setTeachers(res.data));
    };

    useEffect(() => {
        fetchExams();
        fetchDependencies();
    }, []);

    const handleOpenModal = () => {
        // Reset form
        setFormData({
            subject_id: subjects.length > 0 ? subjects[0].subject_id : '',
            teacher_id: teachers.length > 0 ? teachers[0].teacher_id : '',
            exam_name: '',
            exam_date: '',
            duration_minutes: 60,
            total_marks: 100,
            pass_percentage: 40
        });
        setIsModalOpen(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5000/api/exams', formData)
            .then(res => {
                fetchExams();
                setIsModalOpen(false);
            })
            .catch(err => alert('Error scheduling exam. Ensure subject and teacher exist.'));
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Recent Exams</h1>
                <button className="btn-primary" onClick={handleOpenModal}>
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
                                        <Calendar size={14} /> {new Date(exam.exam_date).toLocaleString()}
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

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Schedule New Exam</h2>
                            <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Exam Name</label>
                                <input type="text" className="form-control" name="exam_name" value={formData.exam_name} onChange={handleChange} required placeholder="e.g. Midterm Physics" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Subject</label>
                                    <select className="form-control" name="subject_id" value={formData.subject_id} onChange={handleChange} required>
                                        <option value="">Select Subject</option>
                                        {subjects.map(s => (
                                            <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Assigned Teacher</label>
                                    <select className="form-control" name="teacher_id" value={formData.teacher_id} onChange={handleChange} required>
                                        <option value="">Select Teacher</option>
                                        {teachers.map(t => (
                                            <option key={t.teacher_id} value={t.teacher_id}>{t.first_name} {t.last_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Exam Date & Time</label>
                                <input type="datetime-local" className="form-control" name="exam_date" value={formData.exam_date} onChange={handleChange} required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Duration (mins)</label>
                                    <input type="number" className="form-control" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Total Marks</label>
                                    <input type="number" className="form-control" name="total_marks" value={formData.total_marks} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Pass %</label>
                                    <input type="number" step="0.1" className="form-control" name="pass_percentage" value={formData.pass_percentage} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Schedule Exam</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamsList;

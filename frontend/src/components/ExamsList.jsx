import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, PlusCircle, X, Edit2, Trash2, Eye, HelpCircle } from 'lucide-react';
import QuestionManager from './QuestionManager';

const ExamsList = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [editingExam, setEditingExam] = useState(null);
    const [viewingExam, setViewingExam] = useState(null);
    const [examResults, setExamResults] = useState([]);
    const [managingQuestionsFor, setManagingQuestionsFor] = useState(null);

    const [formData, setFormData] = useState({
        subject_id: '',
        teacher_id: '',
        exam_name: '',
        exam_date: '',
        duration_minutes: 60,
        total_marks: 100,
        pass_percentage: 40,
        status: 'scheduled'
    });

    const authHeaders = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

    const fetchExams = () => {
        setLoading(true);
        axios.get('http://localhost:5001/api/exams/recent', authHeaders)
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
        axios.get('http://localhost:5001/api/subjects', authHeaders).then(res => setSubjects(res.data));
        axios.get('http://localhost:5001/api/teachers', authHeaders).then(res => setTeachers(res.data));
    };

    useEffect(() => {
        fetchExams();
        fetchDependencies();
    }, []);

    const handleOpenModal = (exam = null) => {
        if (exam) {
            setEditingExam(exam);
            // Format datetime-local string (YYYY-MM-DDTHH:mm)
            const dateObj = new Date(exam.exam_date);
            const formattedDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000))
                .toISOString().slice(0, 16);

            setFormData({
                subject_id: exam.subject_id,
                teacher_id: exam.teacher_id,
                exam_name: exam.exam_name,
                exam_date: formattedDate,
                duration_minutes: exam.duration_minutes,
                total_marks: exam.total_marks,
                pass_percentage: exam.pass_percentage,
                status: exam.status
            });
        } else {
            setEditingExam(null);
            setFormData({
                subject_id: subjects.length > 0 ? subjects[0].subject_id : '',
                teacher_id: teachers.length > 0 ? teachers[0].teacher_id : '',
                exam_name: '',
                exam_date: '',
                duration_minutes: 60,
                total_marks: 100,
                pass_percentage: 40,
                status: 'scheduled'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingExam(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const endpoint = editingExam 
            ? `http://localhost:5001/api/exams/${editingExam.exam_id}` 
            : 'http://localhost:5001/api/exams';
        const method = editingExam ? 'put' : 'post';

        axios[method](endpoint, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(res => {
                fetchExams();
                handleCloseModal();
            })
            .catch(err => alert('Error saving exam. Ensure subject and teacher exist.'));
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this exam? All associated results will be lost.')) {
            axios.delete(`http://localhost:5001/api/exams/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                .then(res => fetchExams())
                .catch(err => alert('Error deleting exam.'));
        }
    };

    const handleViewResults = (exam) => {
        setViewingExam(exam);
        axios.get(`http://localhost:5001/api/admin/exams/${exam.exam_id}/results`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(res => setExamResults(res.data))
            .catch(err => alert('Failed to fetch results.'));
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Recent Exams</h1>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <PlusCircle size={18} /> Schedule Exam
                </button>
            </div>

            <div className="card">
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
                                <th>Actions</th>
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
                                        <span className={`badge badge-${exam.status || 'unknown'}`}>
                                            {exam.status ? exam.status.charAt(0).toUpperCase() + exam.status.slice(1) : 'Unknown'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {exam.status === 'scheduled' && (
                                                <>
                                                    <button className="btn-icon" onClick={() => handleOpenModal(exam)}>
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="btn-icon" style={{ color: 'var(--primary)' }} onClick={() => setManagingQuestionsFor(exam)} title="Manage Questions">
                                                        <HelpCircle size={16} />
                                                    </button>
                                                    <button className="btn-icon danger" onClick={() => handleDelete(exam.exam_id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {exam.status === 'completed' && (
                                                <button className="btn-icon" onClick={() => handleViewResults(exam)} title="View Results">
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingExam ? 'Edit Exam' : 'Schedule New Exam'}</h2>
                            <button className="btn-icon" onClick={handleCloseModal}>
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
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn-primary">{editingExam ? 'Update Exam' : 'Schedule Exam'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {viewingExam && (
                <div className="modal-overlay" onClick={() => setViewingExam(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">{viewingExam.exam_name} Results</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>{viewingExam.subject_name} • {new Date(viewingExam.exam_date).toLocaleDateString()}</p>
                            </div>
                            <button className="btn-icon" onClick={() => setViewingExam(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ marginTop: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                            {examResults.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No student results found for this exam.</p>
                            ) : (
                                <table style={{ width: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#FFF' }}>
                                        <tr>
                                            <th>Roll No</th>
                                            <th>Student Name</th>
                                            <th>Score</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {examResults.map(res => (
                                            <tr key={res.student_id}>
                                                <td>{res.enrollment_no}</td>
                                                <td>{res.first_name} {res.last_name}</td>
                                                <td style={{ fontWeight: 'bold' }}>{res.score !== null ? res.score : '-'}</td>
                                                <td>
                                                    {res.result_status ? (
                                                        <span style={{
                                                            color: res.result_status === 'Pass' ? 'var(--success)' : 'var(--danger)',
                                                            fontWeight: 'bold', fontSize: '0.875rem'
                                                        }}>
                                                            {res.result_status.toUpperCase()}
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
                    </div>
                </div>
            )}

            {managingQuestionsFor && (
                <QuestionManager 
                    subjectId={managingQuestionsFor.subject_id} 
                    examId={managingQuestionsFor.exam_id} 
                    onClose={() => setManagingQuestionsFor(null)} 
                />
            )}
        </div>
    );
};

export default ExamsList;

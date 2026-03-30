import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Upload, X, HelpCircle, Plus } from 'lucide-react';
import QuestionManager from './QuestionManager';

const TeacherExams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [students, setStudents] = useState([]);
    const [marksLoading, setMarksLoading] = useState(false);
    const [managingQuestionsFor, setManagingQuestionsFor] = useState(null);

    const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [newExamData, setNewExamData] = useState({
        subject_id: '',
        exam_name: '',
        exam_date: '',
        duration_minutes: '',
        total_marks: '',
        pass_percentage: '',
        status: 'scheduled'
    });

    const fetchExams = () => {
        setLoading(true);
        axios.get('http://localhost:5001/api/teacher/exams', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => {
                setExams(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const fetchSubjects = () => {
        axios.get('http://localhost:5001/api/teacher/subjects', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => setSubjects(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchExams();
        fetchSubjects();
    }, []);

    const handleOpenModal = (exam) => {
        setSelectedExam(exam);
        setMarksLoading(true);
        setIsModalOpen(true);
        axios.get(`http://localhost:5001/api/teacher/exams/${exam.exam_id}/students`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => {
                // Initialize score state. Either existing score or empty
                const initialStudents = res.data.map(st => ({
                    ...st,
                    inputScore: st.score !== null ? st.score : ''
                }));
                setStudents(initialStudents);
                setMarksLoading(false);
            })
            .catch(err => {
                console.error(err);
                setMarksLoading(false);
            });
    };

    const handleScoreChange = (studentId, value) => {
        setStudents(students.map(st => st.student_id === studentId ? { ...st, inputScore: value } : st));
    };

    const handleSubmitMarks = (e) => {
        e.preventDefault();
        const payloadMarks = students
            .filter(st => st.inputScore !== '')
            .map(st => ({ student_id: st.student_id, score: st.inputScore }));

        axios.post(`http://localhost:5001/api/teacher/exams/${selectedExam.exam_id}/marks`, { marks: payloadMarks }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => {
                alert('Marks uploaded successfully!');
                fetchExams(); // Re-fetch to update status
                setIsModalOpen(false);
            })
            .catch(err => alert('Error uploading marks.'));
    };

    const handleCreateExam = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5001/api/teacher/exams', newExamData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => {
                alert('Exam scheduled successfully!');
                setIsAddExamModalOpen(false);
                setNewExamData({
                    subject_id: '',
                    exam_name: '',
                    exam_date: '',
                    duration_minutes: '',
                    total_marks: '',
                    pass_percentage: '',
                    status: 'scheduled'
                });
                fetchExams();
            })
            .catch(err => {
                console.error(err);
                alert('Error scheduling exam: ' + (err.response?.data?.error || err.message));
            });
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">My Exams</h1>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsAddExamModalOpen(true)}>
                    <Plus size={18} /> Schedule Exam
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <div>Loading exams...</div>
                ) : exams.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No exams scheduled.</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Exam Name</th>
                                <th>Subject</th>
                                <th>Date &amp; Time</th>
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
                                        <span className={`badge badge-${exam.status}`}>
                                            {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn-primary" style={{ padding: '0.5rem', fontSize: '0.875rem' }} onClick={() => handleOpenModal(exam)}>
                                                <Upload size={14} style={{ display: 'inline', marginRight: '4px' }}/> Upload Marks
                                            </button>
                                            <button className="btn-secondary" style={{ padding: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setManagingQuestionsFor(exam)}>
                                                <HelpCircle size={14} /> Questions
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && selectedExam && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Upload Marks: {selectedExam.exam_name}</h2>
                            <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {marksLoading ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading students...</div>
                        ) : (
                            <form onSubmit={handleSubmitMarks}>
                                <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Enrollment No</th>
                                                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Student Name</th>
                                                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Marks (Out of {selectedExam.total_marks})</th>
                                                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Current Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map(st => (
                                                <tr key={st.student_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '0.75rem 0' }}>{st.enrollment_no}</td>
                                                    <td style={{ padding: '0.75rem 0' }}>{st.first_name} {st.last_name}</td>
                                                    <td style={{ padding: '0.75rem 0' }}>
                                                        <input 
                                                            type="number" 
                                                            step="0.01"
                                                            max={selectedExam.total_marks}
                                                            className="form-control" 
                                                            style={{ width: '100px', padding: '0.25rem 0.5rem' }}
                                                            value={st.inputScore} 
                                                            onChange={(e) => handleScoreChange(st.student_id, e.target.value)} 
                                                            placeholder="Score"
                                                        />
                                                    </td>
                                                    <td style={{ padding: '0.75rem 0' }}>
                                                        {st.result_status ? (
                                                            <span style={{ color: st.result_status === 'Pass' ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                                                                {st.result_status} ({st.score})
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: 'var(--text-muted)' }}>Not Uploaded</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {students.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students enrolled in this subject.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={students.length === 0}>Save Marks</button>
                                </div>
                            </form>
                        )}
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

            {isAddExamModalOpen && (
                <div className="modal-overlay" onClick={() => setIsAddExamModalOpen(false)}>
                    <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Schedule New Exam</h2>
                            <button className="btn-icon" onClick={() => setIsAddExamModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateExam}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Subject</label>
                                <select 
                                    className="form-control" 
                                    value={newExamData.subject_id} 
                                    onChange={(e) => setNewExamData({...newExamData, subject_id: e.target.value})} 
                                    required
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                >
                                    <option value="">Select a Subject</option>
                                    {subjects.map(sub => (
                                        <option key={sub.subject_id} value={sub.subject_id}>{sub.subject_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Exam Name</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="e.g. Midterm 1"
                                    value={newExamData.exam_name} 
                                    onChange={(e) => setNewExamData({...newExamData, exam_name: e.target.value})} 
                                    required 
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Exam Date & Time</label>
                                <input 
                                    type="datetime-local" 
                                    className="form-control" 
                                    value={newExamData.exam_date} 
                                    onChange={(e) => setNewExamData({...newExamData, exam_date: e.target.value})} 
                                    required 
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Duration (Mins)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        min="1"
                                        value={newExamData.duration_minutes} 
                                        onChange={(e) => setNewExamData({...newExamData, duration_minutes: e.target.value})} 
                                        required 
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Total Marks</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        min="1"
                                        value={newExamData.total_marks} 
                                        onChange={(e) => setNewExamData({...newExamData, total_marks: e.target.value})} 
                                        required 
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Pass %</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        min="1"
                                        max="100"
                                        step="0.01"
                                        value={newExamData.pass_percentage} 
                                        onChange={(e) => setNewExamData({...newExamData, pass_percentage: e.target.value})} 
                                        required 
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    />
                                </div>
                            </div>
                            
                            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsAddExamModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Schedule Exam</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherExams;

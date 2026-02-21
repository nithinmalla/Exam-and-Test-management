import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Edit2, Trash2, X } from 'lucide-react';

const SubjectsList = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);

    const [formData, setFormData] = useState({
        subject_code: '',
        subject_name: '',
        description: '',
        credits: 3
    });

    const fetchSubjects = () => {
        setLoading(true);
        axios.get('http://localhost:5000/api/subjects')
            .then(res => {
                setSubjects(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleOpenModal = (subject = null) => {
        if (subject) {
            setEditingSubject(subject);
            setFormData(subject);
        } else {
            setEditingSubject(null);
            setFormData({
                subject_code: '',
                subject_name: '',
                description: '',
                credits: 3
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSubject(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const endpoint = editingSubject
            ? `http://localhost:5000/api/subjects/${editingSubject.subject_id}`
            : 'http://localhost:5000/api/subjects';
        const method = editingSubject ? 'put' : 'post';

        axios[method](endpoint, formData)
            .then(res => {
                fetchSubjects();
                handleCloseModal();
            })
            .catch(err => alert('Error saving subject'));
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this subject? It cannot be deleted if there are exams assigned to it.')) {
            axios.delete(`http://localhost:5000/api/subjects/${id}`)
                .then(res => fetchSubjects())
                .catch(err => alert('Error deleting subject. It is likely referenced in an existing Exam.'));
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Manage Subjects</h1>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <PlusCircle size={18} /> Add Subject
                </button>
            </div>

            <div className="glass-panel">
                {loading ? (
                    <div>Loading subjects...</div>
                ) : subjects.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No subjects found. Please add them here to schedule exams.</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Subject Name</th>
                                <th>Description</th>
                                <th>Credits</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map(subject => (
                                <tr key={subject.subject_id}>
                                    <td style={{ fontWeight: '600' }}>{subject.subject_code}</td>
                                    <td>{subject.subject_name}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{subject.description || 'No description'}</td>
                                    <td>{subject.credits}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn-icon" onClick={() => handleOpenModal(subject)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon danger" onClick={() => handleDelete(subject.subject_id)}>
                                                <Trash2 size={16} />
                                            </button>
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
                            <h2 className="modal-title">{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h2>
                            <button className="btn-icon" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Subject Code</label>
                                    <input type="text" className="form-control" name="subject_code" value={formData.subject_code} onChange={handleChange} required placeholder="e.g. CS101" />
                                </div>
                                <div className="form-group">
                                    <label>Subject Name</label>
                                    <input type="text" className="form-control" name="subject_name" value={formData.subject_name} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} rows="3" style={{ resize: 'vertical' }}></textarea>
                            </div>
                            <div className="form-group">
                                <label>Credits</label>
                                <input type="number" className="form-control" name="credits" value={formData.credits} onChange={handleChange} required />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn-primary">
                                    {editingSubject ? 'Update Details' : 'Save Subject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectsList;

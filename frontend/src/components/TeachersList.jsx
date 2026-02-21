import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Edit2, Trash2, X } from 'lucide-react';

const TeachersList = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: '',
        hire_date: ''
    });

    const fetchTeachers = () => {
        setLoading(true);
        axios.get('http://localhost:5000/api/teachers')
            .then(res => {
                setTeachers(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleOpenModal = (teacher = null) => {
        if (teacher) {
            setEditingTeacher(teacher);
            const formattedDate = teacher.hire_date ? new Date(teacher.hire_date).toISOString().split('T')[0] : '';
            setFormData({ ...teacher, hire_date: formattedDate });
        } else {
            setEditingTeacher(null);
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                department: '',
                hire_date: new Date().toISOString().split('T')[0]
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTeacher(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const endpoint = editingTeacher
            ? `http://localhost:5000/api/teachers/${editingTeacher.teacher_id}`
            : 'http://localhost:5000/api/teachers';
        const method = editingTeacher ? 'put' : 'post';

        axios[method](endpoint, formData)
            .then(res => {
                fetchTeachers();
                handleCloseModal();
            })
            .catch(err => alert('Error saving teacher'));
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this teacher? Have they been unassigned from all exams?')) {
            axios.delete(`http://localhost:5000/api/teachers/${id}`)
                .then(res => fetchTeachers())
                .catch(err => alert('Error deleting teacher. They might be referenced in existing exams or subjects.'));
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Manage Faculty</h1>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <PlusCircle size={18} /> Add Teacher
                </button>
            </div>

            <div className="glass-panel">
                {loading ? (
                    <div>Loading teachers...</div>
                ) : teachers.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No teachers found. Please add them here to schedule exams.</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Department</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map(teacher => (
                                <tr key={teacher.teacher_id}>
                                    <td style={{ fontWeight: '600' }}>{teacher.first_name} {teacher.last_name}</td>
                                    <td>{teacher.department || 'N/A'}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{teacher.email}</td>
                                    <td>{teacher.phone || 'N/A'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn-icon" onClick={() => handleOpenModal(teacher)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon danger" onClick={() => handleDelete(teacher.teacher_id)}>
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
                            <h2 className="modal-title">{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h2>
                            <button className="btn-icon" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input type="text" className="form-control" name="first_name" value={formData.first_name} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" className="form-control" name="last_name" value={formData.last_name} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <input type="text" className="form-control" name="department" value={formData.department} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Hire Date</label>
                                <input type="date" className="form-control" name="hire_date" value={formData.hire_date} onChange={handleChange} />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn-primary">
                                    {editingTeacher ? 'Update Details' : 'Save Teacher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeachersList;

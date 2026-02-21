import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Edit2, Trash2, X } from 'lucide-react';

const StudentsList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    const [formData, setFormData] = useState({
        enrollment_no: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        dob: '',
        batch_year: new Date().getFullYear()
    });

    const fetchStudents = () => {
        setLoading(true);
        axios.get('http://localhost:5000/api/students')
            .then(res => {
                setStudents(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleOpenModal = (student = null) => {
        if (student) {
            setEditingStudent(student);
            // Format the date string for the HTML input (YYYY-MM-DD)
            const formattedDob = student.dob ? new Date(student.dob).toISOString().split('T')[0] : '';
            setFormData({ ...student, dob: formattedDob });
        } else {
            setEditingStudent(null);
            setFormData({
                enrollment_no: '',
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                dob: '',
                batch_year: new Date().getFullYear()
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStudent(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const endpoint = editingStudent
            ? `http://localhost:5000/api/students/${editingStudent.student_id}`
            : 'http://localhost:5000/api/students';
        const method = editingStudent ? 'put' : 'post';

        axios[method](endpoint, formData)
            .then(res => {
                fetchStudents();
                handleCloseModal();
            })
            .catch(err => alert('Error saving student'));
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            axios.delete(`http://localhost:5000/api/students/${id}`)
                .then(res => fetchStudents())
                .catch(err => alert('Error deleting student'));
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Manage Students</h1>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <PlusCircle size={18} /> Add Student
                </button>
            </div>

            <div className="glass-panel">
                {loading ? (
                    <div>Loading students...</div>
                ) : students.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No students found.</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Enrollment No</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Batch</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(std => (
                                <tr key={std.student_id}>
                                    <td style={{ fontWeight: '600' }}>{std.enrollment_no}</td>
                                    <td>{std.first_name} {std.last_name}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{std.email}</td>
                                    <td>{std.batch_year}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn-icon" onClick={() => handleOpenModal(std)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon danger" onClick={() => handleDelete(std.student_id)}>
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
                            <h2 className="modal-title">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
                            <button className="btn-icon" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Enrollment Number</label>
                                <input type="text" className="form-control" name="enrollment_no" value={formData.enrollment_no} onChange={handleChange} required />
                            </div>
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
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Batch Year</label>
                                    <input type="number" className="form-control" name="batch_year" value={formData.batch_year} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input type="date" className="form-control" name="dob" value={formData.dob} onChange={handleChange} />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn-primary">
                                    {editingStudent ? 'Update Details' : 'Save Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsList;

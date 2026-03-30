import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Trash2, CheckCircle, HelpCircle } from 'lucide-react';

const QuestionManager = ({ subjectId, examId, onClose }) => {
    const [questions, setQuestions] = useState([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        question_text: '',
        marks: 1,
        difficulty_level: 'medium',
        options: [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false }
        ]
    });

    const authHeaders = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

    const fetchData = async () => {
        try {
            const [qRes, examQRes] = await Promise.all([
                axios.get(`http://localhost:5001/api/subjects/${subjectId}/questions`, authHeaders),
                axios.get(`http://localhost:5001/api/exams/${examId}/questions`, authHeaders)
            ]);
            setQuestions(qRes.data);
            setSelectedQuestionIds(examQRes.data.map(q => q.question_id));
        } catch (err) {
            console.error("Failed to fetch questions", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [subjectId, examId]);

    const handleAddOption = () => {
        setNewQuestion({
            ...newQuestion,
            options: [...newQuestion.options, { option_text: '', is_correct: false }]
        });
    };

    const handleSaveQuestion = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/questions', {
                subject_id: subjectId,
                ...newQuestion
            }, authHeaders);
            setNewQuestion({
                question_text: '',
                marks: 1,
                difficulty_level: 'medium',
                options: [
                    { option_text: '', is_correct: true },
                    { option_text: '', is_correct: false },
                    { option_text: '', is_correct: false },
                    { option_text: '', is_correct: false }
                ]
            });
            setIsAdding(false);
            fetchData();
        } catch (err) {
            alert("Failed to save question");
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (window.confirm("Delete this question from the subject pool?")) {
            try {
                await axios.delete(`http://localhost:5001/api/questions/${id}`, authHeaders);
                fetchData();
            } catch (err) {
                alert("Failed to delete question");
            }
        }
    };

    const handleToggleSelect = (id) => {
        setSelectedQuestionIds(prev => 
            prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
        );
    };

    const handleUpdateExamQuestions = async () => {
        try {
            await axios.post(`http://localhost:5001/api/exams/${examId}/questions`, {
                question_ids: selectedQuestionIds
            }, authHeaders);
            alert("Exam questions updated successfully!");
            onClose();
        } catch (err) {
            alert("Failed to update exam questions");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
                <div className="modal-header">
                    <h2 className="modal-title">Manage Questions</h2>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Select questions for this exam from the subject pool.</p>
                    <button className="btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={18} /> New Question
                    </button>
                </div>

                {isAdding && (
                    <div className="card" style={{ marginBottom: '20px', border: '2px solid var(--primary-light)' }}>
                        <form onSubmit={handleSaveQuestion}>
                            <div className="form-group">
                                <label>Question Text</label>
                                <textarea 
                                    className="form-control" 
                                    required 
                                    value={newQuestion.question_text}
                                    onChange={e => setNewQuestion({...newQuestion, question_text: e.target.value})}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                <div className="form-group">
                                    <label>Marks</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={newQuestion.marks}
                                        onChange={e => setNewQuestion({...newQuestion, marks: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Difficulty</label>
                                    <select 
                                        className="form-control"
                                        value={newQuestion.difficulty_level}
                                        onChange={e => setNewQuestion({...newQuestion, difficulty_level: e.target.value})}
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>
                            
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Options</label>
                            {newQuestion.options.map((opt, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                                    <input 
                                        type="radio" 
                                        name="correct-option" 
                                        checked={opt.is_correct}
                                        onChange={() => {
                                            const updated = newQuestion.options.map((o, i) => ({...o, is_correct: i === idx}));
                                            setNewQuestion({...newQuestion, options: updated});
                                        }}
                                    />
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder={`Option ${idx + 1}`}
                                        value={opt.option_text}
                                        onChange={e => {
                                            const updated = [...newQuestion.options];
                                            updated[idx].option_text = e.target.value;
                                            setNewQuestion({...newQuestion, options: updated});
                                        }}
                                        required
                                    />
                                </div>
                            ))}
                            <button type="button" className="btn-secondary" style={{ marginBottom: '20px' }} onClick={handleAddOption}>+ Add Option</button>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Question</button>
                            </div>
                        </form>
                    </div>
                )}

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {questions.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No questions found for this subject.</p>
                    ) : (
                        questions.map(q => (
                            <div key={q.question_id} style={{ 
                                padding: '15px', 
                                border: '1px solid var(--border-color)', 
                                borderRadius: '12px', 
                                marginBottom: '12px',
                                display: 'flex',
                                gap: '15px',
                                alignItems: 'flex-start',
                                background: selectedQuestionIds.includes(q.question_id) ? '#F0F7FF' : '#FFF',
                                borderColor: selectedQuestionIds.includes(q.question_id) ? 'var(--primary-light)' : 'var(--border-color)'
                            }}>
                                <input 
                                    type="checkbox" 
                                    style={{ marginTop: '5px' }}
                                    checked={selectedQuestionIds.includes(q.question_id)}
                                    onChange={() => handleToggleSelect(q.question_id)}
                                />
                                <div style={{ flexGrow: 1 }}>
                                    <div style={{ fontWeight: '700', marginBottom: '8px' }}>{q.question_text}</div>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {q.options.map(opt => (
                                            <div key={opt.option_id} style={{ 
                                                fontSize: '0.85rem', 
                                                padding: '4px 10px', 
                                                borderRadius: '8px',
                                                background: opt.is_correct ? '#E8F5E9' : '#F5F5F5',
                                                color: opt.is_correct ? '#2E7D32' : 'var(--text-main)',
                                                border: opt.is_correct ? '1px solid #A5D6A7' : '1px solid #EEEEEE',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                {opt.is_correct && <CheckCircle size={12} />}
                                                {opt.option_text}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        Marks: {q.marks} | Difficulty: {q.difficulty_level.toUpperCase()}
                                    </div>
                                </div>
                                <button className="btn-icon danger" onClick={() => handleDeleteQuestion(q.question_id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="modal-actions" style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <p style={{ marginRight: 'auto', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {selectedQuestionIds.length} questions selected for this exam.
                    </p>
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                    <button className="btn-primary" onClick={handleUpdateExamQuestions}>Save Exam Selection</button>
                </div>
            </div>
        </div>
    );
};

export default QuestionManager;

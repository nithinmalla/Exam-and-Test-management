import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, CheckCircle, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';

const TakeExam = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    
    const [questions, setQuestions] = useState([]);
    const [examInfo, setExamInfo] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: optionId }
    const [timeLeft, setTimeLeft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const authHeaders = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

    useEffect(() => {
        const fetchExamAndStart = async () => {
            try {
                // Get exam details (all exams info)
                const examsRes = await axios.get('http://localhost:5001/api/student/exams', authHeaders);
                const currentExam = examsRes.data.find(e => e.exam_id === parseInt(examId));
                setExamInfo(currentExam);

                // Start attempt (initialize start_time)
                await axios.post(`http://localhost:5001/api/student/exams/${examId}/start`, {}, authHeaders);

                // Fetch questions
                const qRes = await axios.get(`http://localhost:5001/api/exams/${examId}/questions`, authHeaders);
                setQuestions(qRes.data);
                
                // Initialize timer (if not already expired)
                const startTime = new Date().getTime();
                const durationMs = currentExam.duration_minutes * 60 * 1000;
                setTimeLeft(durationMs / 1000);
            } catch (err) {
                console.error("Failed to initialize exam", err);
                alert("Failed to start exam. Make sure you are authorized.");
                navigate('/student/exams');
            } finally {
                setLoading(false);
            }
        };
        fetchExamAndStart();
    }, [examId]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) {
            if (timeLeft === 0) handleSubmit();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    const handleOptionSelect = (questionId, optionId) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([qId, optId]) => ({
                question_id: qId,
                selected_option_id: optId
            }));
            const res = await axios.post(`http://localhost:5001/api/student/exams/${examId}/submit`, {
                answers: formattedAnswers
            }, authHeaders);
            
            alert(`Exam submitted! Your score: ${res.data.score} (${res.data.status})`);
            navigate('/student/exams');
        } catch (err) {
            alert("Failed to submit exam. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Initializing Exam...</div>;
    if (!examInfo || questions.length === 0) return <div style={{ padding: '3rem', textAlign: 'center' }}>No questions found for this exam.</div>;

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '100px' }}>
            <header style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '32px',
                padding: '20px',
                background: '#FFF',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{examInfo.exam_name}</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>{examInfo.subject_name} • {questions.length} Questions</p>
                </div>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '10px 20px', 
                    background: timeLeft && timeLeft < 300 ? '#FEF2F2' : '#F0F7FF', 
                    color: timeLeft && timeLeft < 300 ? 'var(--danger)' : 'var(--primary)',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '1.25rem'
                }}>
                    <Clock size={24} />
                    {formatTime(timeLeft)}
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '32px' }}>
                <main>
                    <div className="card" style={{ padding: '40px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Question {currentQuestionIndex + 1} of {questions.length}</span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Marks: {currentQuestion.marks}</span>
                        </div>
                        
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', lineHeight: 1.4, marginBottom: '32px' }}>
                            {currentQuestion.question_text}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
                            {currentQuestion.options.map(opt => (
                                <div 
                                    key={opt.option_id}
                                    onClick={() => handleOptionSelect(currentQuestion.question_id, opt.option_id)}
                                    style={{ 
                                        padding: '20px', 
                                        borderRadius: '12px', 
                                        border: '2.5px solid',
                                        borderColor: answers[currentQuestion.question_id] === opt.option_id ? 'var(--primary)' : 'var(--border-color)',
                                        background: answers[currentQuestion.question_id] === opt.option_id ? '#F0F7FF' : '#FFF',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        fontWeight: answers[currentQuestion.question_id] === opt.option_id ? '700' : '500'
                                    }}
                                >
                                    <div style={{ 
                                        width: '24px', 
                                        height: '24px', 
                                        borderRadius: '50%', 
                                        border: '2px solid',
                                        borderColor: answers[currentQuestion.question_id] === opt.option_id ? 'var(--primary)' : 'var(--border-color)',
                                        background: answers[currentQuestion.question_id] === opt.option_id ? 'var(--primary)' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {answers[currentQuestion.question_id] === opt.option_id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFF' }} />}
                                    </div>
                                    {opt.option_text}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                            <button 
                                className="btn-secondary" 
                                disabled={currentQuestionIndex === 0}
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <ChevronLeft size={18} /> Previous
                            </button>
                            {currentQuestionIndex === questions.length - 1 ? (
                                <button 
                                    className="btn-primary" 
                                    onClick={() => { if(window.confirm("Are you sure you want to submit the exam?")) handleSubmit(); }}
                                    style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
                                >
                                    Finish & Submit
                                </button>
                            ) : (
                                <button 
                                    className="btn-primary" 
                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    Next <ChevronRight size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </main>

                <aside>
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Question Navigator</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {questions.map((q, idx) => (
                                <button
                                    key={q.question_id}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    style={{
                                        width: '100%',
                                        aspectRatio: '1',
                                        borderRadius: '8px',
                                        border: '1px solid',
                                        borderColor: currentQuestionIndex === idx ? 'var(--primary)' : (answers[q.question_id] ? 'var(--primary-light)' : 'var(--border-color)'),
                                        background: currentQuestionIndex === idx ? 'var(--primary)' : (answers[q.question_id] ? '#F0F7FF' : '#FFF'),
                                        color: currentQuestionIndex === idx ? '#FFF' : 'var(--text-main)',
                                        fontWeight: '700',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        
                        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <CheckCircle size={16} color="var(--primary)" />
                                <span style={{ fontSize: '0.85rem' }}>{Object.keys(answers).length} Answered</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={16} color="var(--danger)" />
                                <span style={{ fontSize: '0.85rem' }}>{questions.length - Object.keys(answers).length} Unanswered</span>
                            </div>
                        </div>

                        <button 
                            className="btn-primary" 
                            style={{ width: '100%', marginTop: '32px', background: 'var(--success)', borderColor: 'var(--success)' }}
                            onClick={() => { if(window.confirm("Submit your exam now?")) handleSubmit(); }}
                        >
                            Submit Exam
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default TakeExam;

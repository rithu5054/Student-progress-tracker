import { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Timer } from "lucide-react";

const AssessmentView = ({ topicId, onBack, onAssessmentComplete }) => {
    const [assessment, setAssessment] = useState(null);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        fetchAssessment();
    }, [topicId]);

    const fetchAssessment = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'https://student-progress-tracker-r2cz.onrender.com'}/api/assessment/${topicId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setAssessment(res.data);
            setTimeLeft((res.data.timeLimit || 5) * 60);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to load assessment");
            setLoading(false);
        }
    };

    const handleOptionChange = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    useEffect(() => {
        if (timeLeft === null || result) return;
        if (timeLeft <= 0) {
            handleSubmit(true);
            return;
        }
        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, result]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSubmit = async (isAutoSubmit = false) => {
        if (!isAutoSubmit && Object.keys(answers).length !== assessment.questions.length) {
            if (!window.confirm("You have unanswered questions. Are you sure you want to submit?")) {
                return;
            }
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'https://student-progress-tracker-r2cz.onrender.com'}/api/assessment/submit`, {
                topicId,
                answers,
                questionIds: assessment.questions.map(q => q._id)
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setResult(res.data);
            if (res.data.isPassed) {
                onAssessmentComplete();
            }
        } catch (err) {
            console.error(err);
            alert("Failed to submit assessment.");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Assessment...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    if (result) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center animate-fade-in">
                {result.isPassed ? (
                    <div className="text-green-600 mb-4">
                        <CheckCircle size={64} className="mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-2">Assessment Passed ✅</h2>
                        <p className="text-lg">Score: {result.score.toFixed(1)}%</p>
                        {result.nextTopicUnlocked && <p className="mt-2 text-indigo-600 font-semibold">🔓 Next Topic Unlocked!</p>}
                    </div>
                ) : (
                    <div className="text-red-500 mb-4">
                        <XCircle size={64} className="mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-2">Try Again ❌</h2>
                        <p className="text-lg">Score: {result.score.toFixed(1)}%</p>
                        <p className="text-sm text-gray-500 mt-2">Passing marks: {assessment.passingMarks}%</p>
                    </div>
                )}
                
                <button
                    onClick={() => {
                        if (result.isPassed) {
                            onBack();
                        } else {
                            setResult(null);
                            setAnswers({});
                            setTimeLeft(null);
                            setLoading(true);
                            fetchAssessment();
                        }
                    }}
                    className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition"
                >
                    {result.isPassed ? "Back to Roadmap" : "Retry Assessment"}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="text-indigo-600 hover:underline">← Back</button>
                {timeLeft !== null && (
                    <div className={`flex items-center gap-2 font-bold px-4 py-2 rounded-lg ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-700'}`}>
                        <Timer size={20} />
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Topic Assessment</h2>
            
            <div className="space-y-8">
                {assessment.questions.map((q, index) => (
                    <div key={q._id} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">{index + 1}. {q.question}</h3>
                        <div className="space-y-3">
                            {q.options.map((option, idx) => (
                                <label key={idx} className="flex items-center gap-3 p-3 bg-white border border-gray-300 rounded cursor-pointer hover:bg-indigo-50 transition">
                                    <input 
                                        type="radio" 
                                        name={`question-${q._id}`} 
                                        value={option}
                                        checked={answers[q._id] === option}
                                        onChange={() => handleOptionChange(q._id, option)}
                                        className="text-indigo-600 w-5 h-5 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-700">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => handleSubmit(false)}
                className="mt-8 bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition w-full shadow-md"
            >
                Submit Answers
            </button>
        </div>
    );
};

export default AssessmentView;

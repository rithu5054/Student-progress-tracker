import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Save, X } from "lucide-react";

const AssessmentManager = ({ topic, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [passingMarks, setPassingMarks] = useState(70);
    const [timeLimit, setTimeLimit] = useState(30);
    const [numQuestions, setNumQuestions] = useState(25);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        fetchAssessment();
    }, [topic]);

    const fetchAssessment = async () => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/assessment/staff/${topic._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (data) {
                setPassingMarks(data.passingMarks);
                setTimeLimit(data.timeLimit || 30);
                setNumQuestions(data.numQuestions || 25);
                setQuestions(data.questions);
            }
        } catch (error) {
            // 404 means no assessment yet, this is fine
            if (error.response?.status !== 404) {
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            { question: "", options: ["", "", "", ""], correctAnswer: "" }
        ]);
    };

    const handleRemoveQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex] = value;
        setQuestions(updated);
    };

    const handleSave = async () => {
        // Validation
        if (questions.length === 0) {
            return alert("Please add at least one question.");
        }
        for (const q of questions) {
            if (!q.question.trim() || q.options.some(o => !o.trim()) || !q.correctAnswer.trim()) {
                return alert("All questions must have a question text, 4 options, and a correct answer exact match.");
            }
            if (!q.options.includes(q.correctAnswer)) {
                return alert(`Question "${q.question}" correct answer does not match any option exactly.`);
            }
        }

        try {
            await axios.post(`http://localhost:5000/api/assessment/create`, {
                topicId: topic._id,
                passingMarks,
                timeLimit,
                numQuestions,
                questions
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            alert("Assessment saved successfully!");
            onBack();
        } catch (error) {
            console.error(error);
            alert("Failed to save assessment.");
        }
    };

    if (loading) return <div className="p-4 text-gray-500">Loading Assessment...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow animate-fade-in relative">
            <button onClick={onBack} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
                <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-2">Manage Assessment: {topic.name}</h3>
            <p className="text-gray-500 mb-6 font-medium">Define your question bank and assessment rules.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-gray-50 p-4 rounded-lg">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Passing Marks (%)</label>
                    <input type="number" value={passingMarks} onChange={e => setPassingMarks(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Time Limit (mins)</label>
                    <input type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Questions per attempt</label>
                    <input type="number" value={numQuestions} onChange={e => setNumQuestions(e.target.value)} className="w-full border rounded p-2" />
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-lg text-gray-800">Question Bank ({questions.length} Questions)</h4>
                <button onClick={handleAddQuestion} className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded hover:bg-indigo-200 flex items-center gap-1 text-sm font-semibold">
                    <Plus size={16} /> Add Question
                </button>
            </div>

            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 pb-4">
                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 border border-gray-200 rounded-lg bg-white relative">
                        <button onClick={() => handleRemoveQuestion(qIndex)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                            <Trash2 size={18} />
                        </button>
                        
                        <div className="mb-4 pr-8">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Question {qIndex + 1}</label>
                            <input 
                                type="text" 
                                value={q.question} 
                                onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500 bg-gray-50"
                                placeholder="Enter question..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex}>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Option {oIndex + 1}</label>
                                    <input 
                                        type="text" 
                                        value={opt} 
                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                        className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500"
                                        placeholder={`Option ${oIndex + 1}`}
                                    />
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 text-green-700">Correct Answer</label>
                            <input 
                                type="text" 
                                value={q.correctAnswer} 
                                onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                                className="w-full border border-green-300 rounded p-2 focus:ring-1 focus:ring-green-500"
                                placeholder="Must exactly match one of the options above"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-4 border-t flex justify-end gap-4">
                <button onClick={onBack} className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium">
                    <Save size={18} /> Save Assessment
                </button>
            </div>
        </div>
    );
};

export default AssessmentManager;

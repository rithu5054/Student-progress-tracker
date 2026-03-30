import { useState, useEffect } from "react";
import axios from "axios";
import { Edit2, Trash2, Plus, Settings } from "lucide-react";
import AssessmentManager from "./AssessmentManager";

const TopicManager = ({ subjectId, topics, onUpdate }) => {
    const [newTopic, setNewTopic] = useState("");
    const [loading, setLoading] = useState(false);
    const [assessmentIds, setAssessmentIds] = useState([]);
    const [selectedTopicForm, setSelectedTopicForm] = useState(null);

    useEffect(() => {
        fetchAssessmentsStatus();
    }, [subjectId, topics]);

    const fetchAssessmentsStatus = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'https://student-progress-tracker-r2cz.onrender.com'}/api/assessment/subject/${subjectId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setAssessmentIds(data.assessmentTopicIds || []);
        } catch (error) {
            console.error("Failed to fetch assessment status", error);
        }
    };

    const handleAddTopic = async (e) => {
        e.preventDefault();
        if (!newTopic.trim()) return;
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'https://student-progress-tracker-r2cz.onrender.com'}/api/topics`, {
                name: newTopic,
                subjectId,
            });
            setNewTopic("");
            onUpdate();
        } catch (error) {
            console.error(error);
            alert("Failed to add topic");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure? This will delete all materials and progress for this topic.")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || 'https://student-progress-tracker-r2cz.onrender.com'}/api/topics/${id}`);
            onUpdate();
        } catch (error) {
            console.error(error);
            alert("Failed to delete topic");
        }
    };

    if (selectedTopicForm) {
        return (
            <AssessmentManager 
                topic={selectedTopicForm} 
                onBack={() => {
                    setSelectedTopicForm(null);
                    fetchAssessmentsStatus();
                }} 
            />
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Topic Management</h3>

            {/* Add Topic */}
            <form onSubmit={handleAddTopic} className="flex gap-2 mb-6">
                <input
                    type="text"
                    placeholder="New Topic Name"
                    className="flex-1 border rounded px-3 py-2"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2"
                >
                    <Plus size={18} /> Add
                </button>
            </form>

            {/* List Topics */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic Name</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {topics.map((topic) => (
                            <tr key={topic._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <div className="flex items-center gap-3">
                                        {topic.name}
                                        {assessmentIds.includes(topic._id) ? (
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">Assessment Created</span>
                                        ) : (
                                            <span className="bg-red-50 text-red-500 text-xs px-2 py-1 rounded-full border border-red-200">No Assessment</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setSelectedTopicForm(topic)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md flex items-center gap-1 inline-flex ml-auto">
                                        <Settings size={16} /> Manage Assessment
                                    </button>
                                    <button onClick={() => handleDelete(topic._id)} className="text-red-600 hover:text-red-900 ml-4 inline-flex">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {topics.length === 0 && (
                            <tr>
                                <td colSpan="2" className="px-6 py-4 text-center text-gray-500">No topics added yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopicManager;

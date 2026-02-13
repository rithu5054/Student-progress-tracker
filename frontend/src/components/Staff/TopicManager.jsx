import { useState } from "react";
import axios from "axios";
import { Edit2, Trash2, Plus } from "lucide-react";

const TopicManager = ({ subjectId, topics, onUpdate }) => {
    const [newTopic, setNewTopic] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAddTopic = async (e) => {
        e.preventDefault();
        if (!newTopic.trim()) return;
        setLoading(true);
        try {
            await axios.post("http://localhost:5000/api/topics", {
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
            await axios.delete(`http://localhost:5000/api/topics/${id}`);
            onUpdate();
        } catch (error) {
            console.error(error);
            alert("Failed to delete topic");
        }
    };

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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{topic.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleDelete(topic._id)} className="text-red-600 hover:text-red-900 ml-4">
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

import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Plus, ExternalLink, FileText } from "lucide-react";

const MaterialManager = ({ topics, onUpdate }) => {
    const [selectedTopic, setSelectedTopic] = useState("");
    const [materials, setMaterials] = useState([]);
    const [formData, setFormData] = useState({ title: "", type: "link", url: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedTopic) {
            fetchMaterials(selectedTopic);
        } else {
            setMaterials([]);
        }
    }, [selectedTopic]);

    const fetchMaterials = async (topicId) => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/materials/${topicId}`);
            setMaterials(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!selectedTopic) return alert("Select a topic first");
        setLoading(true);
        try {
            await axios.post("http://localhost:5000/api/materials", {
                ...formData,
                topicId: selectedTopic
            });
            setFormData({ title: "", type: "link", url: "" });
            fetchMaterials(selectedTopic);
            if (onUpdate) onUpdate(); // Refresh stats if needed
        } catch (error) {
            console.error(error);
            alert("Failed to add material");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this material?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/materials/${id}`);
            fetchMaterials(selectedTopic);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Study Materials</h3>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Topic</label>
                <select
                    className="block w-full border-gray-300 rounded-md shadow-sm p-2"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                >
                    <option value="">-- Select Topic --</option>
                    {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
            </div>

            {selectedTopic && (
                <>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded">
                        <input
                            type="text"
                            placeholder="Title"
                            className="border rounded px-3 py-2"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        <select
                            className="border rounded px-3 py-2"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="link">Link</option>
                            <option value="pdf">PDF (URL)</option>
                        </select>
                        <input
                            type="text"
                            placeholder="URL"
                            className="border rounded px-3 py-2"
                            value={formData.url}
                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-secondary text-white rounded hover:bg-emerald-600 flex justify-center items-center gap-2"
                        >
                            <Plus size={18} /> Add
                        </button>
                    </form>

                    <div className="space-y-3">
                        {materials.map(m => (
                            <div key={m._id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    {m.type === 'pdf' ? <FileText className="text-red-500" size={20} /> : <ExternalLink className="text-blue-500" size={20} />}
                                    <div>
                                        <p className="font-medium text-gray-800">{m.title}</p>
                                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate max-w-xs block">{m.url}</a>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(m._id)} className="text-gray-400 hover:text-red-600">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {materials.length === 0 && <p className="text-gray-500 text-center">No materials found.</p>}
                    </div>
                </>
            )}
        </div>
    );
};

export default MaterialManager;

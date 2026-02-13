import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, FileText, ExternalLink, CheckCircle } from "lucide-react";

const StudentSubjectView = ({ subject, onBack }) => {
    const [topics, setTopics] = useState([]);
    const [progressData, setProgressData] = useState([]); // Array of progress objects
    const [expandedTopic, setExpandedTopic] = useState(null);
    const [materials, setMaterials] = useState({}); // topicId -> materials[]

    useEffect(() => {
        fetchTopicsAndProgress();
    }, [subject]);

    const fetchTopicsAndProgress = async () => {
        try {
            const [topicsRes, progressRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/topics/${subject._id}`),
                axios.get(`http://localhost:5000/api/progress/student/${subject._id}`)
            ]);
            setTopics(topicsRes.data);
            setProgressData(progressRes.data);
        } catch (error) {
            console.error("Failed to load subject data", error);
        }
    };

    const fetchMaterials = async (topicId) => {
        if (materials[topicId]) return; // Already fetched
        try {
            const { data } = await axios.get(`http://localhost:5000/api/materials/${topicId}`);
            setMaterials(prev => ({ ...prev, [topicId]: data }));
        } catch (error) {
            console.error(error);
        }
    };

    const toggleTopic = (topicId) => {
        if (expandedTopic === topicId) {
            setExpandedTopic(null);
        } else {
            setExpandedTopic(topicId);
            fetchMaterials(topicId);
        }
    };

    const updateProgress = async (topicId, completion, confidence) => {
        try {
            const { data } = await axios.post("http://localhost:5000/api/progress", {
                topicId,
                completionPercentage: completion,
                confidenceLevel: confidence
            });
            // Update local state
            setProgressData(prev => {
                const idx = prev.findIndex(p => p.topicId === topicId);
                if (idx >= 0) {
                    const newArr = [...prev];
                    newArr[idx] = data;
                    return newArr;
                }
                return [...prev, data];
            });
        } catch (error) {
            console.error("Failed to update progress", error);
        }
    };

    // Calculate subject average
    const subjectProgress = topics.length > 0
        ? (progressData.reduce((acc, curr) => acc + curr.completionPercentage, 0) / topics.length).toFixed(1)
        : 0;

    return (
        <div className="bg-white rounded-lg shadow min-h-[500px] p-6">
            <button onClick={onBack} className="text-blue-600 hover:underline mb-4">← Back to Dashboard</button>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{subject.name}</h2>
                    <p className="text-gray-500">{subject.code}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Overall Progress</p>
                    <div className="text-3xl font-bold text-blue-600">{subjectProgress}%</div>
                </div>
            </div>

            <div className="space-y-4">
                {topics.map(topic => {
                    const prog = progressData.find(p => p.topicId === topic._id) || { completionPercentage: 0, confidenceLevel: 'Low' };
                    const isExpanded = expandedTopic === topic._id;

                    return (
                        <div key={topic._id} className="border rounded-lg overflow-hidden transition-all duration-200">
                            <div
                                className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                                onClick={() => toggleTopic(topic._id)}
                            >
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">{topic.name}</h3>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="w-32">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>{prog.completionPercentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${prog.completionPercentage}%` }}></div>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-medium ${prog.confidenceLevel === 'High' ? 'text-green-600' :
                                            prog.confidenceLevel === 'Medium' ? 'text-yellow-600' : 'text-red-500'
                                        }`}>
                                        {prog.confidenceLevel} Conf.
                                    </span>
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-4 bg-white border-t">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Update Progress Section */}
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-3">Update Progress</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">Coverage (%)</label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={prog.completionPercentage}
                                                        onChange={(e) => updateProgress(topic._id, parseInt(e.target.value), prog.confidenceLevel)}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">Confidence</label>
                                                    <div className="flex gap-2">
                                                        {['Low', 'Medium', 'High'].map(level => (
                                                            <button
                                                                key={level}
                                                                onClick={() => updateProgress(topic._id, prog.completionPercentage, level)}
                                                                className={`px-3 py-1 rounded text-sm border ${prog.confidenceLevel === level
                                                                        ? (level === 'High' ? 'bg-green-100 border-green-500 text-green-700' :
                                                                            level === 'Medium' ? 'bg-yellow-100 border-yellow-500 text-yellow-700' :
                                                                                'bg-red-100 border-red-500 text-red-700')
                                                                        : 'bg-white border-gray-300'
                                                                    }`}
                                                            >
                                                                {level}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Study Materials Section */}
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-3">Study Materials</h4>
                                            <div className="space-y-2">
                                                {materials[topic._id]?.length > 0 ? (
                                                    materials[topic._id].map(m => (
                                                        <a
                                                            key={m._id}
                                                            href={m.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block p-2 border rounded hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            {m.type === 'pdf' ? <FileText size={16} className="text-red-500" /> : <ExternalLink size={16} className="text-blue-500" />}
                                                            <span className="text-sm text-blue-600 underline">{m.title}</span>
                                                        </a>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">No materials uploaded.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {topics.length === 0 && <p className="text-center text-gray-500 py-10">No topics found for this subject.</p>}
            </div>
        </div>
    );
};

export default StudentSubjectView;

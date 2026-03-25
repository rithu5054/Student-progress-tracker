import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Book, TrendingUp, Award, Flame, Lock, CheckCircle, AlertTriangle, Download, ExternalLink } from "lucide-react";
import Logo from "../../components/Logo";
import AssessmentView from "./AssessmentView";

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [topics, setTopics] = useState([]);
    const [progress, setProgress] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            fetchSubjectDetails(selectedSubject._id);
        }
    }, [selectedSubject]);

    const fetchDashboard = async () => {
        try {
            const [subjectsRes, statsRes] = await Promise.all([
                axios.get("http://localhost:5000/api/subjects", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }),
                axios.get("http://localhost:5000/api/progress/stats", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }),
            ]);
            setSubjects(subjectsRes.data);
            setDashboardStats(statsRes.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchSubjectDetails = async (subjectId) => {
        try {
            console.log("Fetching subject details for:", subjectId);
            const [topicsRes, progressRes, materialsRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/topics/subject/${subjectId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }),
                axios.get(`http://localhost:5000/api/progress/student/${subjectId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }),
                axios.get(`http://localhost:5000/api/materials/subject/${subjectId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }),
            ]);
            console.log("Topics received:", topicsRes.data);
            console.log("Progress received:", progressRes.data);
            console.log("Materials received:", materialsRes.data);

            setTopics(topicsRes.data.sort((a, b) => (a.order || 0) - (b.order || 0)));
            setProgress(progressRes.data);
            setMaterials(materialsRes.data);
        } catch (error) {
            console.error("Error fetching subject details:", error);
            console.error("Error response:", error.response?.data);
            alert("Failed to load subject details. Check console for details.");
        }
    };

    const updateProgress = async (topicId, completion, confidence) => {
        try {
            const res = await axios.post(
                "http://localhost:5000/api/progress",
                { topicId, completionPercentage: completion, confidenceLevel: confidence },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            // Show notification if new badge or unlock
            if (res.data.newBadge) {
                alert(`🎉 New Badge Earned: ${res.data.newBadge}!`);
            }
            if (res.data.unlockedNext) {
                alert(`🔓 Next Topic Unlocked!`);
            }

            // Refresh data
            fetchDashboard();
            if (selectedSubject) fetchSubjectDetails(selectedSubject._id);
        } catch (error) {
            console.error(error);
            alert("Failed to update progress");
        }
    };

    const getTopicProgress = (topicId) => {
        return progress.find((p) => p.topicId === topicId) || {
            completionPercentage: 0,
            confidenceLevel: "Low",
            isUnlocked: false
        };
    };

    const getHealthColor = (score) => {
        if (score >= 70) return "text-green-600 bg-green-50 border-green-200";
        if (score >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your learning journey...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm px-8 py-5 flex justify-between items-center sticky top-0 z-50 border-b border-gray-100">
                <Logo />
                <div className="flex items-center gap-4">
                    <span className="text-gray-600 text-sm md:text-base font-medium">
                        Welcome, <span className="text-gray-800 font-bold">{user?.name}</span>
                    </span>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                {!selectedSubject ? (
                    <>
                        {/* Top Stats Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Streak */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Current Streak</h3>
                                    <Flame className="text-orange-500" size={24} />
                                </div>
                                <p className="text-4xl font-bold text-gray-800">{dashboardStats?.streak || 0}</p>
                                <p className="text-sm text-gray-500 mt-1">Days in a row 🔥</p>
                            </div>

                            {/* Academic Health */}
                            <div className={`p-6 rounded-2xl shadow-sm border-2 ${getHealthColor(dashboardStats?.academicHealth || 0)}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider">Academic Health</h3>
                                    <TrendingUp size={24} />
                                </div>
                                <p className="text-4xl font-bold">{dashboardStats?.academicHealth || 0}%</p>
                                <p className="text-sm mt-1">
                                    {dashboardStats?.academicHealth >= 70 ? "Healthy Learner" :
                                        dashboardStats?.academicHealth >= 40 ? "Moderate" : "Needs Improvement"}
                                </p>
                            </div>

                            {/* Badges */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Badges Earned</h3>
                                    <Award className="text-yellow-500" size={24} />
                                </div>
                                <p className="text-4xl font-bold text-gray-800">{dashboardStats?.badges?.length || 0}</p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {dashboardStats?.badges?.slice(0, 3).map((badge, idx) => (
                                        <span key={idx} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                            {badge}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Weak Areas Alert */}
                        {dashboardStats?.weakAreas?.length > 0 && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg mb-8">
                                <div className="flex items-center gap-3 mb-3">
                                    <AlertTriangle className="text-red-600" size={20} />
                                    <h3 className="font-bold text-red-800">⚠ Topics Needing Attention</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {dashboardStats.weakAreas.map((area, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-lg">
                                            <p className="font-medium text-gray-700">{area.topic}</p>
                                            <p className="text-sm text-gray-500">{area.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Subjects Grid */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Subjects</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subjects.map((subject) => (
                                <div
                                    key={subject._id}
                                    onClick={() => setSelectedSubject(subject)}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-xl">
                                            <Book size={24} className="text-indigo-600" />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-400 uppercase">{subject.code}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition">
                                        {subject.name}
                                    </h3>
                                    <button className="mt-4 text-indigo-600 text-sm font-medium group-hover:underline">
                                        View Roadmap →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <LearningRoadmap
                        subject={selectedSubject}
                        topics={topics}
                        progress={progress}
                        materials={materials}
                        onBack={() => setSelectedSubject(null)}
                        onUpdateProgress={updateProgress}
                        getTopicProgress={getTopicProgress}
                        refreshData={() => { fetchDashboard(); fetchSubjectDetails(selectedSubject._id); }}
                    />
                )}
            </main>
        </div>
    );
};

// Learning Roadmap Component
const LearningRoadmap = ({ subject, topics, materials, onBack, onUpdateProgress, getTopicProgress, refreshData }) => {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [editingProgress, setEditingProgress] = useState(null);
    const [takingAssessment, setTakingAssessment] = useState(false);

    if (selectedTopic) {
        if (takingAssessment) {
            return (
                <AssessmentView 
                    topicId={selectedTopic._id} 
                    onBack={() => setTakingAssessment(false)} 
                    onAssessmentComplete={() => {
                        setTakingAssessment(false);
                        if (refreshData) refreshData();
                    }} 
                />
            );
        }

        const topicProgress = getTopicProgress(selectedTopic._id);
        const topicMaterials = materials.filter(m => m.topicId === selectedTopic._id);

        return (
            <div className="animate-fade-in">
                <button
                    onClick={() => setSelectedTopic(null)}
                    className="mb-6 text-indigo-600 hover:underline flex items-center gap-2"
                >
                    ← Back to Roadmap
                </button>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">{selectedTopic.name}</h2>

                    {/* Progress Update */}
                    {topicProgress.isUnlocked ? (
                        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                            <h3 className="font-bold text-gray-800 mb-4">Update Your Progress</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-2">Completion %</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={editingProgress?.completion ?? topicProgress.completionPercentage}
                                        onChange={(e) => setEditingProgress({
                                            ...editingProgress,
                                            completion: parseInt(e.target.value)
                                        })}
                                        className="w-full"
                                    />
                                    <p className="text-sm text-gray-600 mt-1">
                                        {editingProgress?.completion ?? topicProgress.completionPercentage}%
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-2">Confidence Level</label>
                                    <select
                                        value={editingProgress?.confidence ?? topicProgress.confidenceLevel}
                                        onChange={(e) => setEditingProgress({
                                            ...editingProgress,
                                            confidence: e.target.value
                                        })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        onUpdateProgress(
                                            selectedTopic._id,
                                            editingProgress?.completion ?? topicProgress.completionPercentage,
                                            editingProgress?.confidence ?? topicProgress.confidenceLevel
                                        );
                                        setEditingProgress(null);
                                    }}
                                    className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                                >
                                    Save Progress
                                </button>
                                {((editingProgress?.completion ?? topicProgress.completionPercentage) === 100 && 
                                  (editingProgress?.confidence ?? topicProgress.confidenceLevel) === "High") && (
                                    <button
                                        onClick={() => setTakingAssessment(true)}
                                        className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                                    >
                                        Take Assessment
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-8 p-6 bg-gray-100 rounded-xl text-center">
                            <Lock className="mx-auto mb-3 text-gray-400" size={40} />
                            <p className="text-gray-600">This topic is locked. Complete previous topics to unlock.</p>
                        </div>
                    )}

                    {/* Study Materials */}
                    <h3 className="font-bold text-gray-800 mb-4">Study Materials</h3>
                    <div className="space-y-3">
                        {topicMaterials.length > 0 ? topicMaterials.map((mat) => (
                            <a
                                key={mat._id}
                                href={mat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                            >
                                <span className="font-medium text-gray-700">{mat.title}</span>
                                {mat.type === 'pdf' ? <Download size={18} /> : <ExternalLink size={18} />}
                            </a>
                        )) : (
                            <p className="text-gray-500 text-sm">No materials available yet.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <button
                onClick={onBack}
                className="mb-6 text-indigo-600 hover:underline flex items-center gap-2"
            >
                ← Back to Subjects
            </button>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{subject.name}</h2>
                <p className="text-gray-500 mb-6">Complete topics sequentially to unlock the next level</p>

                {/* Roadmap */}
                <div className="space-y-4">
                    {topics.map((topic, index) => {
                        const topicProgress = getTopicProgress(topic._id);
                        const isLocked = !topicProgress.isUnlocked;
                        const isCompleted = topicProgress.assessmentPassed === true;

                        return (
                            <div
                                key={topic._id}
                                onClick={() => !isLocked && setSelectedTopic(topic)}
                                className={`relative p-6 rounded-xl border-2 transition-all ${isLocked
                                    ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                                    : isCompleted
                                        ? "bg-green-50 border-green-300 cursor-pointer hover:shadow-md"
                                        : "bg-white border-indigo-200 cursor-pointer hover:shadow-md hover:border-indigo-400"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isLocked
                                                ? "bg-gray-200 text-gray-400"
                                                : isCompleted
                                                    ? "bg-green-500 text-white"
                                                    : "bg-indigo-100 text-indigo-600"
                                                }`}
                                        >
                                            {isLocked ? <Lock size={20} /> : isCompleted ? <CheckCircle size={20} /> : index + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">{topic.name}</h3>
                                            <p className="text-sm text-gray-500">
                                                {isLocked
                                                    ? "🔒 Locked"
                                                    : isCompleted
                                                        ? "✅ Completed"
                                                        : `${topicProgress.completionPercentage}% • ${topicProgress.confidenceLevel} Confidence`}
                                            </p>
                                        </div>
                                    </div>
                                    {!isLocked && (
                                        <div className="w-32">
                                            <div className="bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${isCompleted ? "bg-green-500" : "bg-indigo-600"
                                                        }`}
                                                    style={{ width: `${topicProgress.completionPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

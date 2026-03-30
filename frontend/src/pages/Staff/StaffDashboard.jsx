import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { LogOut, BookOpen, Users, BarChart, AlertTriangle, Plus, X } from "lucide-react";
import TopicManager from "../../components/Staff/TopicManager";
import MaterialManager from "../../components/Staff/MaterialManager";
import StudentProgress from "../../components/Staff/StudentProgress";
import Logo from "../../components/Logo";

const StaffDashboard = () => {
    const { user, logout } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [topics, setTopics] = useState([]);
    const [studentData, setStudentData] = useState([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [createSubjectModal, setCreateSubjectModal] = useState(false);
    const [newSub, setNewSub] = useState({ name: "", code: "" });

    // Stats
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTopics: 0,
        avgProgress: 0,
        atRisk: 0
    });

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            fetchDashboardData();
            setActiveTab("overview");
        }
    }, [selectedSubject]);

    const fetchSubjects = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'https://student-progress-tracker-r2cz.onrender.com'}/api/subjects`);
            setSubjects(data);
            if (data.length > 0) setSelectedSubject(data[0]);
        } catch (error) {
            console.error("Failed to fetch subjects", error);
        }
    };

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'https://student-progress-tracker-r2cz.onrender.com'}/api/subjects`, newSub);
            setSubjects([...subjects, data]);
            setSelectedSubject(data);
            setCreateSubjectModal(false);
            setNewSub({ name: "", code: "" });
        } catch (error) {
            alert("Failed to create subject");
        }
    }

    const fetchDashboardData = async () => {
        if (!selectedSubject) return;
        try {
            // Fetch Topics
            const topicsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'https://student-progress-tracker-r2cz.onrender.com'}/api/topics/${selectedSubject._id}`);
            setTopics(topicsRes.data);

            // Fetch Student Progress
            const progressRes = await axios.get(`${import.meta.env.VITE_API_URL || 'https://student-progress-tracker-r2cz.onrender.com'}/api/progress/staff/${selectedSubject._id}`);
            setStudentData(progressRes.data);

            calculateStats(topicsRes.data, progressRes.data);

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        }
    };

    const calculateStats = (topicsList, studentsList) => {
        const totalStudents = studentsList.length;
        const totalTopics = topicsList.length;

        let totalCoverageSum = 0;
        let atRiskCount = 0;

        studentsList.forEach(s => {
            totalCoverageSum += parseFloat(s.avgCoverage);

            const lowConf = s.progressDocs.filter(d => d.confidenceLevel === 'Low').length;
            const highConf = s.progressDocs.filter(d => d.confidenceLevel === 'High').length;
            const numAvgCoverage = parseFloat(s.avgCoverage);

            if (numAvgCoverage < 40 || (lowConf > highConf && numAvgCoverage < 60)) {
                atRiskCount++;
            }
        });

        const avgProgress = totalStudents > 0 ? (totalCoverageSum / totalStudents).toFixed(1) : 0;

        setStats({
            totalStudents,
            totalTopics,
            avgProgress,
            atRisk: atRiskCount
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg px-8 py-5 flex justify-between items-center sticky top-0 z-50 text-white">
                <div className="bg-white px-4 py-2 rounded-xl">
                    <Logo />
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-gray-300 text-sm md:text-base font-medium">
                        Welcome, <span className="text-white font-bold">{user?.name}</span>
                    </span>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-full transition-all duration-200 border border-red-500/20 backdrop-blur-sm"
                    >
                        <LogOut size={18} />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                {/* Subject Selection */}
                <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                    <div className="w-full md:w-1/2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Current Subject Context</label>
                        <div className="relative">
                            <select
                                className="block w-full appearance-none border-gray-200 rounded-xl shadow-sm py-3 px-4 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-700 font-medium"
                                value={selectedSubject?._id || ""}
                                onChange={(e) => setSelectedSubject(subjects.find(s => s._id === e.target.value))}
                            >
                                {subjects.map(sub => (
                                    <option key={sub._id} value={sub._id}>{sub.name} ({sub.code})</option>
                                ))}
                                {subjects.length === 0 && <option value="">No subjects assigned</option>}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setCreateSubjectModal(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition flex items-center gap-2 font-bold"
                    >
                        <Plus size={20} />
                        Create New Subject
                    </button>
                </div>

                {createSubjectModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                        <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl transform transition-all scale-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-800">Create New Subject</h3>
                                <button onClick={() => setCreateSubjectModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateSubject} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                                    <input
                                        className="block w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        placeholder="e.g. Advanced Mathematics"
                                        value={newSub.name}
                                        onChange={e => setNewSub({ ...newSub, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                                    <input
                                        className="block w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        placeholder="e.g. MTH401"
                                        value={newSub.code}
                                        onChange={e => setNewSub({ ...newSub, code: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => setCreateSubjectModal(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">Cancel</button>
                                    <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold shadow-md">Create Subject</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {selectedSubject ? (
                    <div className="animate-slide-up">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Total Enrolled</p>
                                        <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{stats.totalStudents}</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                                        <Users className="text-blue-600" size={24} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Total Topics</p>
                                        <p className="text-3xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{stats.totalTopics}</p>
                                    </div>
                                    <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                                        <BookOpen className="text-emerald-600" size={24} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Avg Progress</p>
                                        <p className="text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{stats.avgProgress}%</p>
                                    </div>
                                    <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                                        <BarChart className="text-purple-600" size={24} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">At Risk Students</p>
                                        <p className="text-3xl font-bold text-red-600">{stats.atRisk}</p>
                                    </div>
                                    <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                                        <AlertTriangle className="text-red-600" size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Custom Tabs */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                            <div className="border-b border-gray-100 px-6">
                                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                                    {['overview', 'topics', 'materials', 'students'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`
                                        whitespace-nowrap py-5 px-2 border-b-2 font-bold text-sm transition-all duration-200 capitalize
                                        ${activeTab === tab
                                                    ? 'border-indigo-600 text-indigo-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                    `}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Content Area */}
                            <div className="p-6 min-h-[400px]">
                                {activeTab === 'overview' && (
                                    <div className="animate-fade-in">
                                        <h3 className="text-xl font-bold mb-4 text-gray-800">Dashboard Overview</h3>
                                        <p className="text-gray-600 mb-8 max-w-3xl leading-relaxed">
                                            Manage your curriculum and monitor student performance for <span className="font-bold text-indigo-600">{selectedSubject.name}</span>.
                                            Use the tabs above to navigate between different management sections.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 hover:border-indigo-200 transition">
                                                <h4 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
                                                    <BookOpen size={20} />
                                                    Curriculum Management
                                                </h4>
                                                <p className="text-indigo-600/80 mb-4 text-sm">Add topics and study materials for your students.</p>
                                                <div className="flex gap-3">
                                                    <button onClick={() => setActiveTab('topics')} className="text-sm bg-white border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50 text-indigo-700 font-medium transition shadow-sm">Manage Topics</button>
                                                    <button onClick={() => setActiveTab('materials')} className="text-sm bg-white border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50 text-indigo-700 font-medium transition shadow-sm">Upload Materials</button>
                                                </div>
                                            </div>

                                            <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100 hover:border-purple-200 transition">
                                                <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                                                    <Users size={20} />
                                                    Student Performance
                                                </h4>
                                                <p className="text-purple-600/80 mb-4 text-sm">Track progress and identify students who need help.</p>
                                                <button onClick={() => setActiveTab('students')} className="text-sm bg-white border border-purple-200 px-4 py-2 rounded-lg hover:bg-purple-50 text-purple-700 font-medium transition shadow-sm">View & Enroll Students</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'topics' && (
                                    <TopicManager
                                        subjectId={selectedSubject._id}
                                        topics={topics}
                                        onUpdate={fetchDashboardData}
                                    />
                                )}
                                {activeTab === 'materials' && (
                                    <MaterialManager
                                        topics={topics}
                                        onUpdate={fetchDashboardData}
                                    />
                                )}
                                {activeTab === 'students' && (
                                    <StudentProgress
                                        studentData={studentData}
                                        topics={topics}
                                        subjectId={selectedSubject._id}
                                        onUpdate={fetchDashboardData}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 mt-20 p-16 bg-white rounded-3xl shadow-lg border border-dashed border-gray-300 max-w-2xl mx-auto">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen size={40} className="text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3 text-gray-800">No Subject Selected</h2>
                        <p className="text-gray-500 mb-8">Get started by creating your first subject to manage.</p>
                        <button
                            onClick={() => setCreateSubjectModal(true)}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition font-bold inline-flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Create Subject
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StaffDashboard;

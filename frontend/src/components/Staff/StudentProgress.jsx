import { useState } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle, TrendingUp, UserPlus } from "lucide-react";

const StudentProgress = ({ studentData, topics, subjectId, onUpdate }) => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [newStudentUsername, setNewStudentUsername] = useState("");
    const [enrollLoading, setEnrollLoading] = useState(false);

    const handleEnroll = async (e) => {
        e.preventDefault();
        if (!newStudentUsername.trim()) return;
        setEnrollLoading(true);
        try {
            await axios.post("http://localhost:5000/api/subjects/enroll", {
                subjectId,
                username: newStudentUsername
            });
            alert(`Student enrolled successfully!`);
            setNewStudentUsername("");
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to enroll student");
        } finally {
            setEnrollLoading(false);
        }
    };

    const getStatus = (avgCoverage, confidenceDocs) => {
        let status = "Average";
        let color = "text-yellow-600";

        const lowConf = confidenceDocs.filter(d => d.confidenceLevel === 'Low').length;
        const highConf = confidenceDocs.filter(d => d.confidenceLevel === 'High').length;

        const numAvgCoverage = parseFloat(avgCoverage);

        if (numAvgCoverage < 40 || (lowConf > highConf && numAvgCoverage < 60)) {
            status = "At Risk";
            color = "text-red-600";
        } else if (numAvgCoverage > 75 && highConf >= lowConf) {
            status = "Strong Performer";
            color = "text-green-600";
        }

        return { status, color };
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Student Progress Monitoring</h3>
                <form onSubmit={handleEnroll} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Student Username"
                        className="border rounded px-3 py-1 text-sm outline-none focus:ring-1 ring-blue-500"
                        value={newStudentUsername}
                        onChange={(e) => setNewStudentUsername(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={enrollLoading}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1 transition-colors"
                    >
                        <UserPlus size={16} /> Enroll
                    </button>
                </form>
            </div>
            <p className="text-xs text-gray-400 mb-4 text-right -mt-4 mr-1">
                * Student must already be registered in the system.
            </p>

            {!selectedStudent ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Coverage</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {studentData.map(student => {
                                const { status, color } = getStatus(student.avgCoverage, student.progressDocs);
                                return (
                                    <tr key={student.studentId} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedStudent(student)}>
                                        <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 max-w-[100px] mx-auto">
                                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${student.avgCoverage}%` }}></div>
                                            </div>
                                            <span className="text-xs text-gray-500 mt-1 block">{student.avgCoverage}%</span>
                                        </td>
                                        <td className={`px-6 py-4 text-center font-bold ${color}`}>
                                            {status}
                                        </td>
                                        <td className="px-6 py-4 text-right text-blue-600 hover:underline text-sm">View Details</td>
                                    </tr>
                                );
                            })}
                            {studentData.length === 0 && (
                                <tr><td colSpan="4" className="text-center py-4 text-gray-500">No students enrolled. Add one above using their username.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div>
                    <button onClick={() => setSelectedStudent(null)} className="mb-4 text-blue-600 hover:underline">← Back to List</button>
                    <h4 className="text-lg font-bold mb-4">Detailed Report: {selectedStudent.name}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {topics.map(topic => {
                            const prog = selectedStudent.progressDocs.find(p => p.topicId === topic._id);
                            const coverage = prog ? prog.completionPercentage : 0;
                            const confidence = prog ? prog.confidenceLevel : 'Not Set';
                            const score = prog && prog.assessmentScore !== null ? prog.assessmentScore : null;
                            const passed = prog ? prog.assessmentPassed : false;

                            let confColor = "text-gray-400";
                            if (confidence === 'High') confColor = "text-green-600";
                            if (confidence === 'Medium') confColor = "text-yellow-600";
                            if (confidence === 'Low') confColor = "text-red-600";

                            return (
                                <div key={topic._id} className="border p-4 rounded hover:shadow-md transition bg-white">
                                    <h5 className="font-medium text-gray-800 mb-2">{topic.name}</h5>
                                    <div className="mb-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-500">Coverage</span>
                                            <span className="font-medium text-gray-700">{coverage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${coverage}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mb-2 border-b pb-2">
                                        <span className="text-gray-500">Confidence:</span>
                                        <span className={`font-bold ${confColor}`}>{confidence}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Assessment:</span>
                                        {score !== null ? (
                                            <span className={`font-bold flex items-center gap-1 ${passed ? 'text-green-600' : 'text-red-500'}`}>
                                                {score.toFixed(1)}% {passed ? '✅' : '❌'}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">Not taken</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {topics.length === 0 && <p className="text-gray-500">No topics in this subject.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProgress;

import { GraduationCap } from "lucide-react";

const Logo = () => {
    return (
        <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-md">
                <GraduationCap size={28} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-800 leading-tight tracking-tight">
                    Student Progress Tracker
                </h1>
                <p className="text-xs text-gray-500 font-medium">Learn • Track • Achieve</p>
            </div>
        </div>
    );
};

export default Logo;

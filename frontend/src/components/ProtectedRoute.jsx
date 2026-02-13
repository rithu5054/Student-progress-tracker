import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth(); // Assuming loading state provided by context

    if (!user) {
        if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard if they try to access wrong route?
        // Or just unrelated page.
        return <div className="text-center mt-20 text-xl text-red-600">Unauthorized Access</div>;
    }

    return <Outlet />;
};

export default ProtectedRoute;

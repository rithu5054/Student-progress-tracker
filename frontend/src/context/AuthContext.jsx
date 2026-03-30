import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    // Verify token or just decode? For now, we trust storage until API call fails
                    const savedUser = JSON.parse(localStorage.getItem("user"));
                    if (savedUser) {
                        setUser(savedUser);
                    }
                    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                } catch (error) {
                    console.error("Auth check failed", error);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const apiURL = (import.meta.env.VITE_API_URL || "https://student-progress-tracker-r2cz.onrender.com").replace(/\/$/, "");
            const { data } = await axios.post(`${apiURL}/api/auth/login`, {
                username,
                password,
            });
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data));
            axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
            setUser(data);
            return data;
        } catch (error) {
            throw error.response?.data?.message || "Login failed";
        }
    };

    const register = async (userData) => {
        try {
            const apiURL = (import.meta.env.VITE_API_URL || "https://student-progress-tracker-r2cz.onrender.com").replace(/\/$/, "");
            const { data } = await axios.post(`${apiURL}/api/auth/register`, userData);
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data));
            axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
            setUser(data);
            return data;
        } catch (error) {
            throw error.response?.data?.message || "Registration failed";
        }
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["Authorization"];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

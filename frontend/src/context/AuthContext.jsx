import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem("access");
        if (token) {
            try {
                const response = await api.get("profile/details/");
                setUser(response.data);
            } catch (error) {
                console.error("Auth check failed:", error);
                // If it fails with 401, api interceptor might have handled it, 
                // but if not, clear state
                setUser(null);
            }
        }
        setLoading(false);
    };

    const login = async (username, password) => {
        const response = await api.post("login/", { username, password });
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);
        
        // Fetch detailed user profile
        const profileRes = await api.get("profile/details/");
        setUser(profileRes.data);
        return profileRes.data;
    };

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const response = await api.get("profile/details/");
            setUser(response.data);
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

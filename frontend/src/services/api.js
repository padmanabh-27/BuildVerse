import axios from "axios";

const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // Smart fallback: if the hostname is not localhost or 127.0.0.1, use the production Render backend
    if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
        return "https://buildverse-backend-ymvm.onrender.com/api/";
    }
    return "http://127.0.0.1:8000/api/";
};

const api = axios.create({
    baseURL: getBaseURL(),
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Avoid infinite loop if refresh token endpoint fails
        if (originalRequest.url === "/token/refresh/" || originalRequest.url === "/login/") {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refresh");
            
            if (refreshToken) {
                try {
                    const response = await axios.post(`${getBaseURL()}token/refresh/`, {
                        refresh: refreshToken
                    });
                    
                    const newAccess = response.data.access;
                    localStorage.setItem("access", newAccess);
                    
                    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh token is invalid/expired - clear auth and redirect
                    localStorage.removeItem("access");
                    localStorage.removeItem("refresh");
                    window.location.href = "/";
                    return Promise.reject(refreshError);
                }
            } else {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
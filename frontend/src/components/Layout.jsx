import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [username, setUsername] = useState("");
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Fetch basic info and notifications
        fetchUserData();
        fetchNotifications();

        // Poll notifications every 10 seconds
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Handle clicking outside of notifications dropdown
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await api.get("profile/details/");
            setUsername(response.data.username);
        } catch (error) {
            console.error("Error fetching profile detail:", error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await api.get("notifications/");
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.patch(`notifications/${id}/read/`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification read:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/");
    };

    const menuItems = [
        {
            path: "/dashboard",
            name: "Dashboard",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
            )
        },
        {
            path: "/projects",
            name: "Projects",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            path: "/matching",
            name: "AI Recruiter",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.88M18 10a8 8 0 11-16 0 8 8 0 0116 0zM12 14a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
            )
        },
        {
            path: "/profile",
            name: "My Profile",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        }
    ];

    const getPageTitle = () => {
        if (location.pathname === "/dashboard") return "Dashboard Overview";
        if (location.pathname === "/projects") return "Projects Hub";
        if (location.pathname.startsWith("/projects/")) return "Workspace Manager";
        if (location.pathname === "/matching") return "AI Team Recruitment";
        if (location.pathname === "/profile") return "My Builder Identity";
        return "BuildVerse";
    };

    return (
        <div className="min-h-screen bg-[#07090e] text-slate-100 flex overflow-hidden font-sans">
            {/* Background glowing decorations */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/5 blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/5 blur-[150px] pointer-events-none"></div>

            {/* Sidebar */}
            <aside className="w-64 bg-slate-950/80 border-r border-slate-900 flex flex-col justify-between z-20 shrink-0">
                <div>
                    <div className="h-16 px-6 border-b border-slate-900 flex items-center gap-3">
                        <span className="text-xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            BuildVerse
                        </span>
                        <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                            BETA
                        </span>
                    </div>

                    <nav className="p-4 space-y-1.5">
                        {menuItems.map(item => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium ${
                                        isActive
                                            ? "bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 pl-3.5"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                                    }`}
                                >
                                    <span className={isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}>
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Profile Card / Logout */}
                <div className="p-4 border-t border-slate-900 bg-slate-950/90">
                    <div className="flex items-center justify-between gap-3 mb-3 px-2">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white capitalize shrink-0">
                                {username ? username[0] : "U"}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold truncate text-slate-200">{username || "User"}</p>
                                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Online
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-slate-900 hover:border-rose-500/25 active:scale-[0.98] transition cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
                {/* Header */}
                <header className="h-16 px-8 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold tracking-tight text-slate-100">{getPageTitle()}</h2>

                    {/* Notification Bell & Panel */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition relative cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 divide-y divide-slate-800">
                                <div className="p-3.5 flex justify-between items-center bg-slate-950/60 sticky top-0 backdrop-blur-md">
                                    <h4 className="font-bold text-sm">Notifications</h4>
                                    <span className="text-xs bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-full font-semibold">
                                        {unreadCount} new
                                    </span>
                                </div>
                                <div className="divide-y divide-slate-800/60">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500 text-sm">
                                            No notifications yet
                                        </div>
                                    ) : (
                                        notifications.map(item => (
                                            <div
                                                key={item.id}
                                                className={`p-3.5 flex gap-3 text-xs transition hover:bg-slate-800/40 ${
                                                    !item.is_read ? "bg-slate-800/10 font-medium" : ""
                                                }`}
                                            >
                                                <div className="flex-1">
                                                    <p className="text-slate-300 mb-1 leading-relaxed">{item.message}</p>
                                                    <span className="text-[10px] text-slate-500">
                                                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                {!item.is_read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(item.id)}
                                                        className="text-indigo-400 hover:text-indigo-300 font-semibold self-start shrink-0 cursor-pointer"
                                                    >
                                                        Mark read
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-8 relative scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Layout;

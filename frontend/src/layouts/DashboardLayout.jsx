import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const dropdownRef = useRef(null);
    const avatarRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (avatarRef.current && !avatarRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get("notifications/");
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
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
        logout();
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
            path: "/teams",
            name: "Teams Workspace",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
            path: "/search",
            name: "Search Developers",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
        if (location.pathname === "/dashboard") return "Dashboard";
        if (location.pathname === "/projects") return "Projects directory";
        if (location.pathname.startsWith("/projects/")) return "Workspace";
        if (location.pathname === "/teams") return "Teams";
        if (location.pathname === "/matching") return "AI Matching recruiter";
        if (location.pathname === "/search") return "Search Developers";
        if (location.pathname === "/profile") return "My Profile";
        return "BuildVerse";
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className={`bg-white border-r border-slate-200 flex flex-col justify-between z-20 shrink-0 transition-all duration-200 ${
                sidebarCollapsed ? "w-16" : "w-64"
            }`}>
                <div>
                    {/* Header Logo */}
                    <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
                        {!sidebarCollapsed && (
                            <Link to="/dashboard" className="flex items-center gap-2 font-black text-xl text-blue-600">
                                BuildVerse <span className="text-sm">🚀</span>
                            </Link>
                        )}
                        {sidebarCollapsed && (
                            <Link to="/dashboard" className="mx-auto font-black text-xl text-blue-600">
                                B🚀
                            </Link>
                        )}
                    </div>

                    {/* Navigation Menu */}
                    <nav className="p-3 space-y-1">
                        {menuItems.map(item => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition group text-sm font-medium ${
                                        isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-slate-650 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                                    title={sidebarCollapsed ? item.name : ""}
                                >
                                    <span className={isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}>
                                        {item.icon}
                                    </span>
                                    {!sidebarCollapsed && <span>{item.name}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Collapsible toggle & User Summary */}
                <div className="p-3 border-t border-slate-200 bg-white">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 mb-2 cursor-pointer"
                        title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <svg className="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            {sidebarCollapsed ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                            )}
                        </svg>
                    </button>

                    {!sidebarCollapsed && user && (
                        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold capitalize">
                                {user.username ? user.username[0] : "U"}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-slate-800 truncate capitalize">{user.username}</p>
                                <span className="text-[10px] text-slate-450 truncate block">Developer Partner</span>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header Navbar */}
                <header className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between z-10 shrink-0">
                    <h2 className="text-lg font-bold text-slate-800">{getPageTitle()}</h2>

                    {/* Right side items */}
                    <div className="flex items-center gap-4">
                        {/* Notifications Bell */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 relative cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                                )}
                            </button>

                            {/* Dropdown Panel */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-xl z-50 divide-y divide-slate-100 animate-scaleUp">
                                    <div className="p-3 flex justify-between items-center bg-slate-50 sticky top-0">
                                        <h4 className="font-bold text-xs text-slate-750">Notifications</h4>
                                        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                            {unreadCount} unread
                                        </span>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400 text-xs italic">
                                                No notifications yet
                                            </div>
                                        ) : (
                                            notifications.map(item => (
                                                <div
                                                    key={item.id}
                                                    className={`p-3.5 flex gap-2.5 text-xs transition hover:bg-slate-50/50 ${
                                                        !item.is_read ? "bg-blue-50/10" : ""
                                                    }`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-slate-650 leading-relaxed">{item.message}</p>
                                                        <span className="text-[10px] text-slate-400 mt-1 block">
                                                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    {!item.is_read && (
                                                        <button
                                                            onClick={(e) => handleMarkAsRead(item.id, e)}
                                                            className="text-blue-600 hover:text-blue-500 font-bold self-start text-[10px] cursor-pointer"
                                                        >
                                                            Dismiss
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Avatar & Dropdown */}
                        {user && (
                            <div className="relative" ref={avatarRef}>
                                <button
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm capitalize shadow cursor-pointer border-2 border-white hover:border-slate-100 transition"
                                >
                                    {user.username ? user.username[0] : "U"}
                                </button>

                                {showUserDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-xl z-50 py-1 animate-scaleUp">
                                        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                                            <p className="text-xs font-bold text-slate-800 truncate capitalize">{user.username}</p>
                                            <p className="text-[10px] text-slate-450 truncate">{user.email || "No email linked"}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            onClick={() => setShowUserDropdown(false)}
                                            className="block px-4 py-2 text-xs text-slate-650 hover:bg-slate-50 hover:text-slate-900 transition"
                                        >
                                            Edit Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left block px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition font-bold border-t border-slate-100 cursor-pointer"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {/* Content Panel */}
                <main className="flex-1 overflow-y-auto p-8 relative">
                    <div className="max-w-6xl mx-auto h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;

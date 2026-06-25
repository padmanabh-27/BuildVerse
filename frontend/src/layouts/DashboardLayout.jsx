import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import LightRays from "../components/LightRays";
import { 
    LayoutDashboard, 
    Briefcase, 
    Users, 
    Sparkles, 
    Search, 
    User, 
    Bell, 
    LogOut, 
    Layers, 
    ChevronLeft, 
    ChevronRight,
    Settings
} from "lucide-react";

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
        const interval = setInterval(fetchNotifications, 15000);
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
            icon: <LayoutDashboard className="w-5 h-5" />
        },
        {
            path: "/projects",
            name: "Projects Feed",
            icon: <Briefcase className="w-5 h-5" />
        },
        {
            path: "/teams",
            name: "Teams Workspace",
            icon: <Users className="w-5 h-5" />
        },
        {
            path: "/matching",
            name: "AI Recruiter",
            icon: <Sparkles className="w-5 h-5 text-indigo-400" />
        },
        {
            path: "/search",
            name: "Match Developers",
            icon: <Search className="w-5 h-5" />
        },
        {
            path: "/profile",
            name: "My Profile",
            icon: <User className="w-5 h-5" />
        }
    ];

    const getPageTitle = () => {
        if (location.pathname === "/dashboard") return "Hub Overview";
        if (location.pathname === "/projects") return "Collaborative Projects";
        if (location.pathname.startsWith("/projects/")) return "Project Command Workspace";
        if (location.pathname === "/teams") return "Active Teams";
        if (location.pathname === "/matching") return "AI Matching Recruiter Pipeline";
        if (location.pathname === "/search") return "Discover Talent & Collaborators";
        if (location.pathname === "/profile") return "My Builder Identity";
        return "BuildVerse Workspace";
    };

    return (
        <div className="min-h-screen text-slate-100 flex overflow-hidden font-sans relative" style={{ backgroundColor: '#0c0d12' }}>
            {/* Interactive Light Rays Background — white top-center spotlight */}
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ opacity: 0.28 }}>
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#ffffff"
                    raysSpeed={0.6}
                    lightSpread={0.5}
                    rayLength={1.5}
                    pulsating={false}
                    fadeDistance={1.2}
                    saturation={0.0}
                    followMouse={true}
                    mouseInfluence={0.06}
                    noiseAmount={0.02}
                    distortion={0.01}
                />
            </div>

            {/* Ambient silver-white gradients */}
            <div className="absolute top-[5%] left-[25%] w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none animate-pulseGlow" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)' }}></div>
            <div className="absolute bottom-[5%] right-[5%] w-[350px] h-[350px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(203,213,225,0.03) 0%, transparent 70%)' }}></div>

            {/* Sidebar */}
            <aside className={`glass-panel border-r border-slate-900 flex flex-col justify-between z-20 shrink-0 transition-all duration-300 relative ${
                sidebarCollapsed ? "w-20" : "w-64"
            }`}>
                <div>
                    {/* Header Logo */}
                    <div className="h-16 px-5 border-b border-slate-900/60 flex items-center justify-between">
                        {!sidebarCollapsed ? (
                            <Link to="/dashboard" className="flex items-center gap-2 font-black text-lg text-white font-display">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #334155, #64748b)' }}>
                                    <Layers className="w-4 h-4 text-white" />
                                </div>
                                <span>Build<span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #cbd5e1, #f8fafc)', WebkitBackgroundClip: 'text' }}>Verse</span></span>
                            </Link>
                        ) : (
                            <Link to="/dashboard" className="mx-auto flex items-center justify-center">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #334155, #64748b)' }}>
                                    <Layers className="w-4.5 h-4.5 text-white" />
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* Navigation Menu */}
                    <nav className="p-4 space-y-1.5">
                        {menuItems.map(item => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 group text-sm font-semibold relative ${
                                        isActive
                                            ? "bg-slate-900/80 text-white border border-slate-800 shadow-inner glow-hover"
                                            : "text-slate-400 hover:bg-slate-900/40 hover:text-white border border-transparent"
                                    }`}
                                    title={sidebarCollapsed ? item.name : ""}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-r-full" style={{ background: 'linear-gradient(to bottom, #f8fafc, #94a3b8)' }}></div>
                                    )}
                                    <span className={isActive ? "text-white" : "text-slate-500 group-hover:text-slate-350"}>
                                        {item.icon}
                                    </span>
                                    {!sidebarCollapsed && <span>{item.name}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Collapsible toggle & User Summary */}
                <div className="p-4 border-t border-slate-900 bg-slate-950/20">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full flex items-center justify-center p-2 rounded-xl text-slate-500 hover:bg-slate-900/60 hover:text-slate-350 mb-3 cursor-pointer border border-transparent hover:border-slate-800 transition"
                        title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>

                    {!sidebarCollapsed && user && (
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-900/80 text-xs">
                            <div className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold capitalize shadow-sm text-sm" style={{ background: 'linear-gradient(135deg, #334155, #64748b)' }}>
                                {user.username ? user.username[0] : "U"}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-semibold text-slate-200 truncate capitalize">{user.username}</p>
                                <span className="text-[10px] text-slate-500 truncate block">Co-Builder</span>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header Navbar */}
                <header className="h-16 px-6 border-b border-slate-900/60 glass-panel flex items-center justify-between z-10 shrink-0">
                    <h2 className="text-base font-bold text-white tracking-tight font-display">{getPageTitle()}</h2>

                    {/* Right side items */}
                    <div className="flex items-center gap-3.5">
                        {/* Notifications Bell */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white relative cursor-pointer transition flex items-center justify-center"
                            >
                                <Bell className="w-4.5 h-4.5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full animate-ping"></span>
                                )}
                            </button>

                            {/* Dropdown Panel */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2.5 w-80 max-h-96 overflow-y-auto rounded-2xl glass-panel shadow-2xl z-50 border border-slate-800 divide-y divide-slate-900/60 animate-scaleUp">
                                    <div className="p-3.5 flex justify-between items-center bg-slate-900/40 sticky top-0 backdrop-blur-md">
                                        <h4 className="font-bold text-xs text-white">Notifications</h4>
                                        <span className="text-[10px] bg-white/10 text-slate-300 border border-white/15 px-2 py-0.5 rounded-full font-semibold">
                                            {unreadCount} unread
                                        </span>
                                    </div>
                                    <div className="divide-y divide-slate-900/60">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-500 text-xs italic">
                                                All quiet for now.
                                            </div>
                                        ) : (
                                            notifications.map(item => (
                                                <div
                                                    key={item.id}
                                                    className={`p-3.5 flex gap-2.5 text-xs transition hover:bg-slate-900/40 ${
                                                        !item.is_read ? "bg-slate-900/20" : ""
                                                    }`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-slate-350 leading-relaxed">{item.message}</p>
                                                        <span className="text-[9px] text-slate-500 mt-1 block">
                                                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    {!item.is_read && (
                                                        <button
                                                            onClick={(e) => handleMarkAsRead(item.id, e)}
                                                            className="text-brand-blue hover:text-blue-400 font-bold self-start text-[10px] cursor-pointer"
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
                                    className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-sm capitalize shadow cursor-pointer border border-transparent hover:border-white/20 transition animate-fadeIn" style={{ background: 'linear-gradient(135deg, #334155, #64748b)' }}
                                >
                                    {user.username ? user.username[0] : "U"}
                                </button>

                                {showUserDropdown && (
                                    <div className="absolute right-0 mt-2.5 w-48 rounded-xl glass-panel shadow-2xl z-50 py-1.5 border border-slate-800 animate-scaleUp">
                                        <div className="px-4 py-2 border-b border-slate-900 bg-slate-900/40">
                                            <p className="text-xs font-bold text-slate-200 truncate capitalize">{user.username}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{user.email || "No email linked"}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            onClick={() => setShowUserDropdown(false)}
                                            className="block px-4 py-2.5 text-xs text-slate-400 hover:bg-slate-900/60 hover:text-white transition"
                                        >
                                            My Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left block px-4 py-2.5 text-xs text-rose-450 hover:bg-rose-950/20 hover:text-rose-400 transition font-bold border-t border-slate-900 cursor-pointer"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {/* Content Panel */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
                    <div className="max-w-6xl mx-auto h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;

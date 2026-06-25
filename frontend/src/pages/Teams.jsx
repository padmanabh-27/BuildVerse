import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { useToast } from "../context/ToastContext";
import { CardSkeleton } from "../components/Skeletons";
import { 
    Users, 
    FolderGit2, 
    ArrowUpRight, 
    Clock, 
    Tag, 
    CheckCircle2, 
    Compass, 
    AlertCircle,
    UserCheck
} from "lucide-react";

function Teams() {
    const [myProjects, setMyProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [myUsername, setMyUsername] = useState("");

    useEffect(() => {
        fetchTeamsData();
    }, []);

    const fetchTeamsData = async () => {
        setLoading(true);
        try {
            // Get user profile first to identify user's projects
            const profileRes = await api.get("profile/details/");
            const username = profileRes.data.username;
            setMyUsername(username);

            // Fetch projects
            const projectsRes = await api.get("projects/");
            const allProjects = projectsRes.data;

            // Fetch members list for each project in parallel
            const projectsWithMembers = await Promise.all(
                allProjects.map(async (project) => {
                    try {
                        const membersRes = await api.get(`projects/${project.id}/members/`);
                        return {
                            ...project,
                            membersList: membersRes.data,
                        };
                    } catch (error) {
                        console.error(`Failed to fetch members for project ${project.id}:`, error);
                        return {
                            ...project,
                            membersList: [],
                        };
                    }
                })
            );

            // Filter to show only projects where user is creator OR user is a member
            const userProjects = projectsWithMembers.filter((project) => {
                const isCreator = project.creator_username === username;
                const isMember = project.membersList.some((m) => m.username === username);
                return isCreator || isMember;
            });

            setMyProjects(userProjects);
        } catch (error) {
            console.error("Error fetching teams data:", error);
            showToast("Failed to load your team workspaces.", "error");
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyWeightBadge = (diff) => {
        switch (diff) {
            case "beginner": 
                return { label: "Light Load", color: "bg-emerald-955/30 text-emerald-400 border-emerald-500/20" };
            case "intermediate": 
                return { label: "Medium Load", color: "bg-blue-955/30 text-blue-400 border-blue-500/20" };
            default: 
                return { label: "Heavy Load", color: "bg-rose-955/30 text-rose-455 border-rose-500/20" };
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fadeIn pb-10 relative">
                {/* Header Card */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                    <div className="absolute top-[-30%] left-[-10%] w-[200px] h-[200px] bg-brand-purple/10 rounded-full blur-[65px] pointer-events-none"></div>
                    
                    <div className="relative z-10 space-y-1">
                        <h1 className="text-xl font-bold text-white tracking-tight font-display">Teams Workspace</h1>
                        <p className="text-xs text-slate-400">
                            Coordinate your project rosters, inspect active member roles, and access team dashboards.
                        </p>
                    </div>
                    <Link
                        to="/projects"
                        className="px-4 py-2.5 bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-95 text-xs font-bold text-white rounded-xl shadow-lg shadow-brand-blue/15 transition active:scale-[0.98] self-start md:self-auto cursor-pointer glow-btn relative z-10"
                    >
                        Explore Project Feed
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                ) : myProjects.length === 0 ? (
                    <div className="glass-panel rounded-3xl border border-slate-900 p-16 text-center shadow-xl space-y-4">
                        <AlertCircle className="w-12 h-12 text-slate-650 mx-auto animate-pulse" />
                        <h3 className="font-bold text-white text-sm font-display">No active workspaces</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                            You are not registered in any developer team roster yet. Visit the feed to discover collaborative projects.
                        </p>
                        <div className="pt-2">
                            <Link
                                to="/projects"
                                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-brand-purple/40 text-xs font-bold text-slate-350 rounded-xl transition hover:text-white"
                            >
                                Find Workspaces to Join
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {myProjects.map((project) => {
                            const isCreator = project.creator_username === myUsername;
                            const myRole = isCreator
                                ? "Owner & Creator"
                                : project.membersList.find((m) => m.username === myUsername)?.role_name || "Member";
                            
                            const diffBadge = getDifficultyWeightBadge(project.difficulty);

                            return (
                                <div
                                    key={project.id}
                                    className="glass-panel rounded-2xl border border-slate-900 p-6 shadow-xl hover:border-slate-800 transition flex flex-col justify-between space-y-5 hover:scale-[1.01]"
                                >
                                    <div className="space-y-4">
                                        {/* Project metadata */}
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-white/8 text-slate-300 border border-white/12 tracking-wider">
                                                    <Tag className="w-2.5 h-2.5" /> {project.category}
                                                </span>
                                                <h3 className="font-bold text-white text-sm tracking-tight capitalize mt-2 font-display">
                                                    {project.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span
                                                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                                                        project.status === "completed"
                                                            ? "bg-slate-900 border-slate-800 text-slate-500"
                                                            : project.status === "in_progress"
                                                            ? "bg-blue-950/30 border-blue-500/20 text-blue-400"
                                                            : "bg-amber-955/30 border-amber-500/20 text-amber-400"
                                                    }`}
                                                >
                                                    {project.status.replace("_", " ")}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 min-h-[32px]">
                                            {project.description}
                                        </p>

                                        {/* My role status badge */}
                                        <div className="flex items-center gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                                            <span className="text-slate-500 font-semibold flex items-center gap-1"><UserCheck className="w-3.5 h-3.5 text-brand-blue" /> Your Role:</span>
                                            <span className="font-bold text-slate-200 capitalize">{myRole}</span>
                                        </div>

                                        {/* Project members list */}
                                        <div className="space-y-2">
                                            <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                                Team Roster ({project.membersList.length + 1} / {project.max_members})
                                            </h4>
                                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                                {/* Creator */}
                                                <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-900 text-xs">
                                                    <span className="font-semibold text-slate-300 capitalize">
                                                        @{project.creator_username} (Creator)
                                                    </span>
                                                    <span className="text-[9px] bg-white/8 text-slate-300 border border-white/15 px-2 py-0.5 rounded font-bold uppercase tracking-wide">Owner</span>
                                                </div>
                                                {/* Other members */}
                                                {project.membersList.map((member) => (
                                                    <div
                                                        key={member.id}
                                                        className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-900 text-xs"
                                                    >
                                                        <span className="font-semibold text-slate-350 capitalize">
                                                            @{member.username}
                                                        </span>
                                                        <span className="text-[9px] bg-slate-900 text-slate-500 border border-slate-850 px-2 py-0.5 rounded-lg capitalize">
                                                            {member.role_name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action links */}
                                    <div className="pt-3.5 border-t border-slate-900/60 flex items-center justify-between gap-3">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border uppercase tracking-wider ${diffBadge.color}`}>
                                            {diffBadge.label}
                                        </span>
                                        <Link
                                            to={`/projects/${project.id}`}
                                            className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-brand-purple/40 text-[10px] font-bold rounded-lg text-slate-300 transition flex items-center gap-1 hover:text-white"
                                        >
                                            Enter Workspace <ArrowUpRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default Teams;

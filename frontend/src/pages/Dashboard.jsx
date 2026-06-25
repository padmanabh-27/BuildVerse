import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { Link } from "react-router-dom";
import { ListSkeleton } from "../components/Skeletons";

function Dashboard() {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [projects, setProjects] = useState([]);
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [profileRes, statsRes, activityRes, projectsRes] = await Promise.all([
                api.get("profile/details/"),
                api.get("dashboard/"),
                api.get("activity/"),
                api.get("projects/")
            ]);

            setProfile(profileRes.data);
            setStats(statsRes.data);
            setActivities(activityRes.data);
            
            // Filter user's active projects (where user is creator or member)
            const myProj = projectsRes.data.filter(
                p => p.creator_username === profileRes.data.username
            );
            setProjects(myProj.slice(0, 3)); // show top 3 projects

            // Fetch tasks for each project to find user's assigned tasks
            let allAssignedTasks = [];
            for (const proj of projectsRes.data) {
                try {
                    const tasksRes = await api.get(`tasks/project/${proj.id}/`);
                    const userTasks = tasksRes.data.filter(
                        t => t.assigned_to_username === profileRes.data.username && t.status !== "completed"
                    );
                    allAssignedTasks = [...allAssignedTasks, ...userTasks];
                } catch (taskErr) {
                    console.error("Error fetching tasks for project", proj.id, taskErr);
                }
            }
            setAssignedTasks(allAssignedTasks.slice(0, 5)); // show top 5 tasks
        } catch (error) {
            console.error("Error fetching dashboard details:", error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case "project": return "📁";
            case "join_request": return "✉️";
            case "member": return "👥";
            case "task": return "⚡";
            case "document": return "📄";
            case "chat": return "💬";
            default: return "🔔";
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="h-28 bg-white border border-slate-200 rounded-2xl animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-48 bg-white border border-slate-200 rounded-2xl animate-pulse"></div>
                            <div className="h-48 bg-white border border-slate-200 rounded-2xl animate-pulse"></div>
                        </div>
                        <div className="space-y-6">
                            <div className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse"></div>
                            <div className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fadeIn">
                {/* Hero Title */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                            Developer Hub
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Welcome back, <span className="text-blue-600 font-bold capitalize">{profile?.username}</span>. Track projects, coordinate tasks, and recruit builders.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            to="/projects"
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold active:scale-[0.98] transition text-xs shadow"
                        >
                            Projects Feed
                        </Link>
                        <Link
                            to="/matching"
                            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold active:scale-[0.98] transition text-xs"
                        >
                            AI Recruiter
                        </Link>
                    </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { title: "Created Projects", count: stats?.projects_created || 0, label: "Administered", color: "text-blue-650 bg-blue-50" },
                        { title: "Projects Joined", count: stats?.projects_joined || 0, label: "Collaborations", color: "text-emerald-650 bg-emerald-50" },
                        { title: "My Assigned Tasks", count: stats?.tasks_assigned || 0, label: "Pending", color: "text-amber-650 bg-amber-50" },
                        { title: "Completed Tasks", count: stats?.tasks_completed || 0, label: "Shipped", color: "text-indigo-650 bg-indigo-50" }
                    ].map((item, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex justify-between items-center transition hover:border-slate-300">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{item.title}</span>
                                <h3 className="text-2xl font-black text-slate-800 mb-0.5">{item.count}</h3>
                                <p className="text-[10px] text-slate-500">{item.label}</p>
                            </div>
                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${item.color}`}>
                                {idx === 0 ? "📁" : idx === 1 ? "👥" : idx === 2 ? "⏳" : "🏆"}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Grid Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (Active Projects + Assigned Tasks) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Active Projects */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <h2 className="text-sm font-bold text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
                                    <span>📁</span> Active Workspaces
                                </h2>
                                <Link to="/projects" className="text-xs font-semibold text-blue-600 hover:text-blue-500">
                                    View All
                                </Link>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {projects.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 text-xs italic">
                                        No active projects yet. Click "+ Create Project" in Projects Feed to start one.
                                    </div>
                                ) : (
                                    projects.map(proj => (
                                        <div key={proj.id} className="py-3 flex justify-between items-center gap-4 hover:bg-slate-50/40 px-2 rounded-lg transition">
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-slate-800 truncate capitalize">{proj.title}</h4>
                                                <p className="text-xs text-slate-500 truncate mt-0.5">{proj.description}</p>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                                                    proj.status === "recruiting" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                                                }`}>
                                                    {proj.status.replace("_", " ")}
                                                </span>
                                                <Link
                                                    to={`/projects/${proj.id}`}
                                                    className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-650 border border-slate-200"
                                                >
                                                    Workspace
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Assigned Tasks */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                            <h2 className="text-sm font-bold text-slate-850 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                                <span>⚡</span> Pending Tasks
                            </h2>

                            <div className="divide-y divide-slate-100">
                                {assignedTasks.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 text-xs italic">
                                        All caught up! No pending tasks assigned.
                                    </div>
                                ) : (
                                    assignedTasks.map(task => (
                                        <div key={task.id} className="py-3 flex justify-between items-center gap-4 hover:bg-slate-50/40 px-2 rounded-lg transition">
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-slate-800 truncate capitalize">{task.title}</h4>
                                                <p className="text-xs text-slate-450 mt-0.5">Due: {task.due_date || "No due date"}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                                    task.priority === "high" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                                    task.priority === "medium" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                                    "bg-slate-100 text-slate-500 border border-slate-200"
                                                }`}>
                                                    {task.priority}
                                                </span>
                                                <Link
                                                    to={`/projects/${task.project}`}
                                                    className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-650 border border-slate-200"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Reputation + Activities) */}
                    <div className="space-y-6">
                        {/* Reputation Widgets */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                            <h2 className="text-sm font-bold text-slate-850 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                                <span>⭐</span> Builder Reputation
                            </h2>

                            <div className="space-y-3">
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role Ratings</h4>
                                    {profile?.role_reputations.length === 0 ? (
                                        <p className="text-[11px] text-slate-400 italic">No role ratings yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {profile?.role_reputations.map((role, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                    <span className="capitalize font-bold text-slate-700">{role.role_name}</span>
                                                    <span className="text-amber-500 font-bold">⭐ {role.average_rating} ({role.reviews_count})</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2 border-t border-slate-100">
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Technical Skill Ratings</h4>
                                    {profile?.skill_reputations.length === 0 ? (
                                        <p className="text-[11px] text-slate-400 italic">No skill ratings yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {profile?.skill_reputations.map((skill, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                    <span className="capitalize font-bold text-slate-700">{skill.skill_name}</span>
                                                    <span className="text-amber-500 font-bold">⭐ {skill.average_rating} ({skill.reviews_count})</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity stream */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                            <h2 className="text-sm font-bold text-slate-850 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                                <span>⌛</span> Recent Activity
                            </h2>

                            <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                                {activities.length === 0 ? (
                                    <p className="text-slate-400 text-xs italic text-center py-4">No recent activity.</p>
                                ) : (
                                    activities.map(act => (
                                        <div key={act.id} className="flex gap-3 items-start p-2 rounded-lg hover:bg-slate-50 transition">
                                            <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-150 text-base">
                                                {getActivityIcon(act.activity_type)}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-650 leading-relaxed">{act.message}</p>
                                                <span className="text-[10px] text-slate-400 mt-0.5 block">
                                                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default Dashboard;
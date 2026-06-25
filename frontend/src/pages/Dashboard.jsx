import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { Link, useNavigate } from "react-router-dom";
import { 
    Sparkles, 
    Plus, 
    Users, 
    CheckSquare, 
    TrendingUp, 
    FolderGit2, 
    Award, 
    Activity, 
    CheckCircle2, 
    ArrowRight,
    Play,
    Zap,
    Clock,
    Briefcase
} from "lucide-react";

function Dashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [projects, setProjects] = useState([]);
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Onboarding Wizard State (Saved in LocalStorage for demo purposes)
    const [onboardingSteps, setOnboardingSteps] = useState([
        { id: 1, label: "Complete your Builder Profile", desc: "Add your skills and collaboration availability.", completed: false, path: "/profile" },
        { id: 2, label: "Explore the Projects Feed", desc: "Discover active startup ideas to join.", completed: false, path: "/projects" },
        { id: 3, label: "Run the AI Candidate Recruiter", desc: "Find ideal collaborators using our AI matcher.", completed: false, path: "/matching" },
        { id: 4, label: "Launch your own Project", desc: "Start a workspace and invite developers.", completed: false, path: "/projects" }
    ]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (profile && stats) {
            // Dynamically calculate onboarding step completion based on backend data
            const updatedSteps = [...onboardingSteps];
            
            // Step 1: Completed if user has bio or some reputation
            if (profile.bio || profile.role_reputations?.length > 0 || profile.skills?.length > 0) {
                updatedSteps[0].completed = true;
            }
            // Step 2: Completed if user is in any project
            if (stats.projects_joined > 0 || stats.projects_created > 0) {
                updatedSteps[1].completed = true;
                updatedSteps[3].completed = true;
            }
            // Step 3: Completed if user has active tasks or reviews
            if (stats.tasks_assigned > 0 || stats.tasks_completed > 0) {
                updatedSteps[2].completed = true;
            }
            setOnboardingSteps(updatedSteps);
        }
    }, [profile, stats]);

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
            setProjects(myProj.slice(0, 3)); 

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
            setAssignedTasks(allAssignedTasks.slice(0, 5));
        } catch (error) {
            console.error("Error fetching dashboard details:", error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case "project": return <FolderGit2 className="w-4 h-4 text-blue-400" />;
            case "join_request": return <Users className="w-4 h-4 text-amber-400" />;
            case "member": return <Users className="w-4 h-4 text-emerald-400" />;
            case "task": return <CheckSquare className="w-4 h-4 text-indigo-400" />;
            case "chat": return <Zap className="w-4 h-4 text-pink-400" />;
            default: return <Activity className="w-4 h-4 text-slate-400" />;
        }
    };

    const totalStepsCompleted = onboardingSteps.filter(s => s.completed).length;
    const progressPercent = Math.round((totalStepsCompleted / onboardingSteps.length) * 100);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="h-32 bg-slate-900/60 border border-slate-900 rounded-2xl animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 bg-slate-900/60 border border-slate-900 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-56 bg-slate-900/60 border border-slate-900 rounded-2xl animate-pulse"></div>
                            <div className="h-56 bg-slate-900/60 border border-slate-900 rounded-2xl animate-pulse"></div>
                        </div>
                        <div className="space-y-6">
                            <div className="h-72 bg-slate-900/60 border border-slate-900 rounded-2xl animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fadeIn">
                {/* Premium Startup Banner */}
                <div className="relative overflow-hidden rounded-3xl border border-slate-900 bg-slate-900/40 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="absolute top-[-40%] left-[-20%] w-[350px] h-[350px] rounded-full bg-brand-blue/10 blur-[80px] pointer-events-none"></div>
                    <div className="absolute bottom-[-40%] right-[-10%] w-[300px] h-[300px] rounded-full bg-brand-purple/10 blur-[70px] pointer-events-none"></div>
                    
                    <div className="relative z-10 space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-white/8 text-slate-300 border border-white/12 uppercase tracking-widest">
                            <Sparkles className="w-3.5 h-3.5" /> Builder Command Center
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight font-display capitalize">
                            Welcome back, {profile?.username}
                        </h1>
                        <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                            Assemble your startup team, coordinate tasks via Kanban boards, and track your collaboration scores inside the BuildVerse.
                        </p>
                    </div>

                    <div className="flex gap-2.5 relative z-10 shrink-0">
                        <Link
                            to="/matching"
                            className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-95 text-white font-semibold text-xs shadow-lg shadow-brand-blue/10 flex items-center gap-1.5 transition glow-btn"
                        >
                            <Sparkles className="w-4 h-4" /> Run AI Matcher
                        </Link>
                        <Link
                            to="/projects"
                            className="px-4.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 font-semibold text-xs transition hover:text-white"
                        >
                            Browse Projects
                        </Link>
                    </div>
                </div>

                {/* Onboarding Wizard checklist Widget */}
                {progressPercent < 100 && (
                    <div className="rounded-2xl border border-slate-900/60 bg-slate-900/20 p-5 space-y-4">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Getting Started Checklist</h3>
                                <p className="text-xs text-slate-400">Complete these steps to activate your project presence.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-white">{progressPercent}% Done</p>
                                    <p className="text-[10px] text-slate-500">{totalStepsCompleted} of 4 steps</p>
                                </div>
                                <div className="w-12 h-12 rounded-full border-4 border-slate-900 flex items-center justify-center relative">
                                    <div className="absolute inset-0 rounded-full border-4 border-brand-purple" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${progressPercent}%, 0 ${progressPercent}%)` }}></div>
                                    <span className="text-[10px] font-bold text-slate-200">{totalStepsCompleted}/4</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {onboardingSteps.map((step) => (
                                <div 
                                    key={step.id} 
                                    onClick={() => navigate(step.path)}
                                    className={`p-3.5 rounded-xl border transition cursor-pointer flex gap-3 items-start ${
                                        step.completed 
                                            ? "bg-slate-900/30 border-slate-900/50 opacity-60 hover:opacity-85" 
                                            : "bg-slate-900/50 border-slate-800 hover:border-brand-purple/40"
                                    }`}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {step.completed ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-450/10" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border border-slate-650 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                {step.id}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className={`text-xs font-bold text-slate-200 ${step.completed ? "line-through text-slate-500" : ""}`}>{step.label}</h4>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Metrics Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { title: "Created Projects", count: stats?.projects_created || 0, label: "Administered", color: "from-blue-600/10 to-blue-700/5 border-blue-500/15 text-blue-400", icon: <FolderGit2 className="w-5 h-5" /> },
                        { title: "Projects Joined", count: stats?.projects_joined || 0, label: "Collaborations", color: "from-emerald-600/10 to-emerald-700/5 border-emerald-500/15 text-emerald-400", icon: <Users className="w-5 h-5" /> },
                        { title: "Assigned Tasks", count: stats?.tasks_assigned || 0, label: "Pending Execution", color: "from-amber-600/10 to-amber-700/5 border-amber-500/15 text-amber-400", icon: <Clock className="w-5 h-5" /> },
                        { title: "Shipped Tasks", count: stats?.tasks_completed || 0, label: "Completed", color: "from-indigo-600/10 to-indigo-700/5 border-indigo-500/15 text-indigo-400", icon: <Award className="w-5 h-5" /> }
                    ].map((item, idx) => (
                        <div key={idx} className={`p-5 rounded-2xl bg-gradient-to-br ${item.color} border shadow-sm flex justify-between items-center transition duration-200 hover:scale-[1.01]`}>
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">{item.title}</span>
                                <h3 className="text-3xl font-black text-white mb-0.5 tracking-tight">{item.count}</h3>
                                <p className="text-[10px] text-slate-450">{item.label}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-950/40 flex items-center justify-center border border-slate-900">
                                {item.icon}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grid Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (Workspaces & Tasks) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Active Workspaces */}
                        <div className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                                <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 font-display">
                                    <FolderGit2 className="w-4.5 h-4.5 text-brand-blue" /> Active Workspaces
                                </h2>
                                <Link to="/projects" className="text-xs font-semibold text-brand-blue hover:text-blue-400 transition">
                                    Browse All
                                </Link>
                            </div>

                            <div className="divide-y divide-slate-900/60">
                                {projects.length === 0 ? (
                                    <div className="py-8 text-center text-slate-500 text-xs italic">
                                        No active workspaces. Browse the feed to collaborate.
                                    </div>
                               ) : (
                                    projects.map(proj => (
                                        <div key={proj.id} className="py-3.5 flex justify-between items-center gap-4 hover:bg-slate-900/20 px-2 rounded-xl transition">
                                            <div className="min-w-0 space-y-1">
                                                <h4 className="text-sm font-bold text-slate-200 truncate capitalize font-display">{proj.title}</h4>
                                                <p className="text-xs text-slate-450 truncate">{proj.description}</p>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                                                    proj.status === "recruiting" 
                                                        ? "bg-amber-950/30 text-amber-400 border border-amber-500/20" 
                                                        : "bg-blue-950/30 text-blue-400 border border-blue-500/20"
                                                }`}>
                                                    {proj.status.replace("_", " ")}
                                                </span>
                                                <Link
                                                    to={`/projects/${proj.id}`}
                                                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-800 transition"
                                                >
                                                    Workspace
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Assigned Pending Tasks */}
                        <div className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-3 font-display">
                                <CheckSquare className="w-4.5 h-4.5 text-brand-purple" /> Pending Tasks
                            </h2>

                            <div className="divide-y divide-slate-900/60">
                                {assignedTasks.length === 0 ? (
                                    <div className="py-8 text-center text-slate-500 text-xs italic">
                                        Zero pending tasks. You are fully caught up!
                                    </div>
                                ) : (
                                    assignedTasks.map(task => (
                                        <div key={task.id} className="py-3.5 flex justify-between items-center gap-4 hover:bg-slate-900/20 px-2 rounded-xl transition">
                                            <div className="min-w-0 space-y-1">
                                                <h4 className="text-sm font-bold text-slate-200 truncate capitalize">{task.title}</h4>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Due: {task.due_date || "No deadline"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                                                    task.priority === "high" ? "bg-rose-950/30 text-rose-450 border border-rose-500/20" :
                                                    task.priority === "medium" ? "bg-blue-950/30 text-blue-450 border border-blue-500/20" :
                                                    "bg-slate-900 text-slate-400 border border-slate-800"
                                                }`}>
                                                    {task.priority}
                                                </span>
                                                <Link
                                                    to={`/projects/${task.project}`}
                                                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-350 border border-slate-800 transition"
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

                    {/* Right Column (Reputation Widgets & Activity) */}
                    <div className="space-y-6">
                        {/* Reputation Widgets */}
                        <div className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-3 font-display">
                                <Award className="w-4.5 h-4.5 text-brand-purple" /> Reputation Scores
                            </h2>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collab Availability</h4>
                                    <div className="flex justify-between items-center text-xs bg-slate-900/40 p-2.5 rounded-xl border border-slate-900">
                                        <span className="font-semibold text-slate-300">Open to Collaborate</span>
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                                            profile?.is_available ? "bg-emerald-950/30 text-emerald-400 border border-emerald-500/20" : "bg-rose-950/30 text-rose-400 border border-rose-500/20"
                                        }`}>
                                            {profile?.is_available ? "Yes" : "No"}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-900/60">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role Skills Score</h4>
                                    {profile?.role_reputations?.length === 0 ? (
                                        <p className="text-[11px] text-slate-500 italic">No ratings yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {profile?.role_reputations?.map((role, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs bg-slate-900/40 p-2.5 rounded-xl border border-slate-900">
                                                    <span className="capitalize font-semibold text-slate-300">{role.role_name}</span>
                                                    <span className="text-amber-400 font-bold flex items-center gap-1">⭐ {role.average_rating} ({role.reviews_count})</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity stream */}
                        <div className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-3 font-display">
                                <Activity className="w-4.5 h-4.5 text-brand-blue" /> Recent Events
                            </h2>

                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                {activities.length === 0 ? (
                                    <p className="text-slate-500 text-xs italic text-center py-4">No recent activity.</p>
                                ) : (
                                    activities.map(act => (
                                        <div key={act.id} className="flex gap-3 items-start p-2.5 rounded-xl hover:bg-slate-900/20 transition">
                                            <span className="w-7- h-7 p-1.5 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 border border-slate-850">
                                                {getActivityIcon(act.activity_type)}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-350 leading-relaxed">{act.message}</p>
                                                <span className="text-[9px] text-slate-550 mt-0.5 block">
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
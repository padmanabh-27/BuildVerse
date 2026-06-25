import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { useToast } from "../context/ToastContext";
import { CardSkeleton } from "../components/Skeletons";

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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Teams Workspace</h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Manage your project engineering rosters, review active roles, and coordinate collaboration.
                        </p>
                    </div>
                    <Link
                        to="/projects"
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg shadow-sm transition active:scale-[0.98] self-start md:self-auto cursor-pointer"
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
                    <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                        <div className="text-4xl mb-4">👥</div>
                        <h3 className="text-base font-bold text-slate-800">No active team workspaces</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
                            You are not a member or creator of any project team yet. Explore the projects directory to join an active initiative!
                        </p>
                        <Link
                            to="/projects"
                            className="px-4 py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-lg transition"
                        >
                            Find projects to join
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {myProjects.map((project) => {
                            const isCreator = project.creator_username === myUsername;
                            const myRole = isCreator
                                ? "Owner & Creator"
                                : project.membersList.find((m) => m.username === myUsername)?.role_name || "Member";

                            return (
                                <div
                                    key={project.id}
                                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5"
                                >
                                    <div className="space-y-4">
                                        {/* Project metadata */}
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                                                    {project.category}
                                                </span>
                                                <h3 className="font-extrabold text-slate-800 text-sm tracking-tight capitalize mt-0.5">
                                                    {project.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span
                                                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                                        project.status === "completed"
                                                            ? "bg-slate-50 border-slate-200 text-slate-550"
                                                            : project.status === "in_progress"
                                                            ? "bg-blue-50 border-blue-100 text-blue-600"
                                                            : "bg-purple-50 border-purple-100 text-purple-600"
                                                    }`}
                                                >
                                                    {project.status}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-650 leading-relaxed line-clamp-2 min-h-[32px]">
                                            {project.description}
                                        </p>

                                        {/* My role status badge */}
                                        <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl">
                                            <span className="text-slate-400 font-medium">Your Role:</span>
                                            <span className="font-bold text-slate-850 capitalize">{myRole}</span>
                                        </div>

                                        {/* Project members list */}
                                        <div className="space-y-2">
                                            <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                                                Team Roster ({project.membersList.length + 1} / {project.max_members})
                                            </h4>
                                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                                {/* Creator */}
                                                <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-100 text-xs">
                                                    <span className="font-semibold text-slate-700 capitalize">
                                                        @{project.creator_username} (Creator)
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">Owner</span>
                                                </div>
                                                {/* Other members */}
                                                {project.membersList.map((member) => (
                                                    <div
                                                        key={member.id}
                                                        className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-100 text-xs"
                                                    >
                                                        <span className="font-semibold text-slate-700 capitalize">
                                                            @{member.username}
                                                        </span>
                                                        <span className="text-[10px] text-slate-450 capitalize">
                                                            {member.role_name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action links */}
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                                        <span className="text-[10px] font-medium text-slate-400 capitalize">
                                            Difficulty: {project.difficulty}
                                        </span>
                                        <Link
                                            to={`/projects/${project.id}`}
                                            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 text-[11px] font-bold rounded-lg text-slate-700 transition cursor-pointer"
                                        >
                                            Enter Workspace →
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

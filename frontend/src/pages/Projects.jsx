import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { Link, useNavigate } from "react-router-dom";
import { CardSkeleton } from "../components/Skeletons";
import { useToast } from "../context/ToastContext";

function Projects() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [projects, setProjects] = useState([]);
    const [myUsername, setMyUsername] = useState("");
    const [loading, setLoading] = useState(true);

    // Filter Fields
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterDifficulty, setFilterDifficulty] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // Create Modal Fields
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [difficulty, setDifficulty] = useState("beginner");
    const [maxMembers, setMaxMembers] = useState(5);
    const [visibility, setVisibility] = useState("public");
    const [githubRepoUrl, setGithubRepoUrl] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchProjectsAndUser();
    }, []);

    const fetchProjectsAndUser = async () => {
        setLoading(true);
        try {
            const [projRes, profileRes] = await Promise.all([
                api.get("projects/"),
                api.get("profile/details/")
            ]);
            setProjects(projRes.data);
            setMyUsername(profileRes.data.username);
        } catch (error) {
            console.error("Error loading projects:", error);
            showToast("Failed to load projects feed.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const response = await api.post("projects/", {
                title,
                description,
                category: category.toLowerCase(),
                difficulty: difficulty.toLowerCase(),
                max_members: parseInt(maxMembers),
                status: "recruiting",
                visibility,
                github_repo_url: githubRepoUrl
            });
            showToast("Workspace Created! Let's set up roles and skills. 🚀");
            setShowCreateModal(false);
            navigate(`/projects/${response.data.id}`);
        } catch (error) {
            console.error("Error creating project:", error);
            showToast(error.response?.data?.title || "Error creating project workspace.", "error");
        } finally {
            setCreating(false);
        }
    };

    const handleJoinRequest = async (projectId) => {
        try {
            await api.post(`projects/${projectId}/join/`);
            showToast("Request to join project workspace sent! ✉️");
            // Refresh list
            const projRes = await api.get("projects/");
            setProjects(projRes.data);
        } catch (error) {
            console.error("Error sending join request:", error);
            showToast(error.response?.data?.error || "Error requesting to join workspace.", "error");
        }
    };

    // Filter projects based on inputs
    const filteredProjects = projects.filter(proj => {
        const matchesSearch = searchQuery === "" || 
            proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proj.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = filterCategory === "" || proj.category === filterCategory.toLowerCase();
        const matchesDifficulty = filterDifficulty === "" || proj.difficulty === filterDifficulty.toLowerCase();
        const matchesStatus = filterStatus === "" || proj.status === filterStatus.toLowerCase();

        return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fadeIn">
                {/* Header Section */}
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Workspaces Directory</h1>
                        <p className="text-slate-500 text-sm mt-1">Discover developer collaborations, build teams, and coordinate code.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow active:scale-[0.98] transition cursor-pointer text-xs"
                    >
                        + Create Workspace
                    </button>
                </div>

                {/* Filters Row */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-full md:flex-1 relative">
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-xs text-slate-800 pl-8"
                            placeholder="Search by title or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
                    </div>

                    <div className="flex flex-wrap gap-3.5 w-full md:w-auto">
                        <select
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-350 text-slate-700 text-xs focus:border-blue-500 outline-none cursor-pointer"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            <option value="web">Web Development</option>
                            <option value="mobile">Mobile Apps</option>
                            <option value="ai">AI / Machine Learning</option>
                            <option value="blockchain">Blockchain</option>
                        </select>

                        <select
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-350 text-slate-700 text-xs focus:border-blue-500 outline-none cursor-pointer"
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                        >
                            <option value="">All Difficulties</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>

                        <select
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-350 text-slate-700 text-xs focus:border-blue-500 outline-none cursor-pointer"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="recruiting">Recruiting</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                {/* Projects Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="p-16 text-center text-slate-400 border border-slate-200 rounded-2xl bg-white space-y-3.5 shadow-sm">
                        <div className="text-3xl">📁</div>
                        <h3 className="font-bold text-slate-700 text-sm">No projects yet</h3>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">No workspaces match your parameters. Create a new repository to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => {
                            const isCreator = project.creator_username === myUsername;
                            return (
                                <div
                                    key={project.id}
                                    className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between transition hover:-translate-y-1 hover:border-slate-300"
                                >
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider capitalize">
                                                {project.category}
                                            </span>
                                            <div className="flex gap-1.5">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold capitalize ${
                                                    project.difficulty === "beginner" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                    project.difficulty === "intermediate" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                                    "bg-rose-50 text-rose-600 border border-rose-100"
                                                }`}>
                                                    {project.difficulty}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold capitalize ${
                                                    project.status === "recruiting" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                    project.status === "in_progress" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                                    "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                }`}>
                                                    {project.status.replace("_", " ")}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-base font-extrabold text-slate-800 line-clamp-1 capitalize">{project.title}</h3>
                                            <span className="text-[10px] text-slate-450">Created by <span className="capitalize font-bold text-slate-500">@{project.creator_username}</span></span>
                                        </div>

                                        <p className="text-xs text-slate-550 leading-relaxed line-clamp-3">
                                            {project.description}
                                        </p>
                                    </div>

                                    <div className="pt-5 mt-5 border-t border-slate-100 flex gap-2.5">
                                        {isCreator ? (
                                            <Link
                                                to={`/projects/${project.id}`}
                                                className="w-full text-center py-2 rounded-lg bg-blue-600 hover:bg-blue-750 text-xs font-bold text-white transition active:scale-[0.98] shadow-sm"
                                            >
                                                Open Workspace
                                            </Link>
                                        ) : (
                                            <>
                                                <Link
                                                    to={`/projects/${project.id}`}
                                                    className="flex-1 text-center py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200 transition active:scale-[0.98]"
                                                >
                                                    View Workspace
                                                </Link>
                                                <button
                                                    onClick={() => handleJoinRequest(project.id)}
                                                    className="flex-1 py-2 rounded-lg bg-blue-50 hover:bg-blue-100/70 border border-blue-100 text-xs font-bold text-blue-600 transition active:scale-[0.98] cursor-pointer"
                                                >
                                                    Request Join
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Create Project Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-lg p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl relative animate-scaleUp max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                ✕
                            </button>
                            <h2 className="text-lg font-bold text-slate-800 mb-6">Create New Workspace</h2>

                            <form onSubmit={handleCreateProject} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Workspace Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-xs text-slate-800"
                                        placeholder="e.g. Decentralized Task Hub"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Description</label>
                                    <textarea
                                        rows="4"
                                        required
                                        className="w-full px-4 py-2 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-xs text-slate-800 placeholder:text-slate-400"
                                        placeholder="Outline project mission statement, tasks, and tech..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Category</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-xs text-slate-800"
                                            placeholder="e.g. Web, Mobile, AI"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Max Members</label>
                                        <input
                                            type="number"
                                            min="2"
                                            required
                                            className="w-full px-4 py-2 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-xs text-slate-800"
                                            value={maxMembers}
                                            onChange={(e) => setMaxMembers(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Difficulty</label>
                                        <select
                                            className="w-full px-4 py-2 rounded-lg bg-white border border-slate-350 text-slate-800 text-xs focus:border-blue-500 outline-none cursor-pointer"
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(e.target.value)}
                                        >
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Visibility</label>
                                        <select
                                            className="w-full px-4 py-2 rounded-lg bg-white border border-slate-350 text-slate-800 text-xs focus:border-blue-500 outline-none cursor-pointer"
                                            value={visibility}
                                            onChange={(e) => setVisibility(e.target.value)}
                                        >
                                            <option value="public">Public</option>
                                            <option value="portfolio_only">Portfolio Only</option>
                                            <option value="private">Private</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">GitHub Repo URL (Optional)</label>
                                    <input
                                        type="url"
                                        className="w-full px-4 py-2 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-xs text-slate-800 placeholder:text-slate-400"
                                        placeholder="https://github.com/user/repo"
                                        value={githubRepoUrl}
                                        onChange={(e) => setGithubRepoUrl(e.target.value)}
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-755 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                                    >
                                        {creating ? "Creating..." : "Build Workspace"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default Projects;

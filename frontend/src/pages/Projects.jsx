import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { Link, useNavigate } from "react-router-dom";
import { CardSkeleton } from "../components/Skeletons";
import { useToast } from "../context/ToastContext";
import { 
    Search, 
    Plus, 
    Users, 
    Lock, 
    Github, 
    SlidersHorizontal,
    Code,
    Sparkles,
    CheckCircle2,
    Calendar,
    ArrowUpRight,
    Tag,
    Clock,
    X,
    FolderGit2
} from "lucide-react";

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
    const filteredProjects = (Array.isArray(projects) ? projects : []).filter(proj => {
        if (!proj) return false;
        
        const titleStr = proj.title || "";
        const descStr = proj.description || "";
        const catStr = proj.category || "";
        const diffStr = proj.difficulty || "";
        const statusStr = proj.status || "";

        const matchesSearch = searchQuery === "" || 
            titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
            descStr.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = filterCategory === "" || catStr.toLowerCase() === filterCategory.toLowerCase();
        const matchesDifficulty = filterDifficulty === "" || diffStr.toLowerCase() === filterDifficulty.toLowerCase();
        const matchesStatus = filterStatus === "" || statusStr.toLowerCase() === filterStatus.toLowerCase();

        return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });

    const getDifficultyWeightBadge = (diff) => {
        switch (diff) {
            case "beginner": 
                return { label: "Light Load", color: "bg-emerald-950/40 text-emerald-400 border-emerald-500/20" };
            case "intermediate": 
                return { label: "Medium Load", color: "bg-blue-950/40 text-blue-400 border-blue-500/20" };
            default: 
                return { label: "Heavy Load", color: "bg-rose-950/40 text-rose-450 border-rose-500/20" };
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fadeIn relative">
                {/* Header Section */}
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight font-display">Workspaces Feed</h1>
                        <p className="text-slate-400 text-sm mt-1">Discover startup ideas, check teammate slots, and coordinate code bases.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-95 text-white font-semibold text-xs shadow-lg shadow-brand-purple/20 transition flex items-center gap-1.5 glow-btn"
                    >
                        <Plus className="w-4 h-4" /> Create Workspace
                    </button>
                </div>

                {/* Search & Filter Panel */}
                <div className="p-4 rounded-2xl glass-panel border border-slate-900 shadow-xl flex flex-col lg:flex-row gap-4 items-center">
                    <div className="w-full lg:flex-1 relative">
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none text-xs text-slate-200 pl-10 transition placeholder:text-slate-600"
                            placeholder="Search by workspace title, key skills, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-600" />
                    </div>

                    <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-900">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                            <select
                                className="bg-transparent text-slate-300 text-xs outline-none cursor-pointer pr-4 font-semibold border-none"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="" className="bg-slate-950 text-slate-300">All Categories</option>
                                <option value="web" className="bg-slate-950 text-slate-300">Web Development</option>
                                <option value="mobile" className="bg-slate-950 text-slate-300">Mobile Apps</option>
                                <option value="ai" className="bg-slate-950 text-slate-300">AI / ML</option>
                                <option value="blockchain" className="bg-slate-950 text-slate-300">Web3 / Blockchain</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-900">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <select
                                className="bg-transparent text-slate-300 text-xs outline-none cursor-pointer pr-4 font-semibold border-none"
                                value={filterDifficulty}
                                onChange={(e) => setFilterDifficulty(e.target.value)}
                            >
                                <option value="" className="bg-slate-950 text-slate-300">All Workloads</option>
                                <option value="beginner" className="bg-slate-950 text-slate-300">Light Load</option>
                                <option value="intermediate" className="bg-slate-950 text-slate-300">Medium Load</option>
                                <option value="advanced" className="bg-slate-950 text-slate-300">Heavy Load</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-900">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                            <select
                                className="bg-transparent text-slate-300 text-xs outline-none cursor-pointer pr-4 font-semibold border-none"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="" className="bg-slate-950 text-slate-300">All Statuses</option>
                                <option value="recruiting" className="bg-slate-950 text-slate-300">Recruiting</option>
                                <option value="in_progress" className="bg-slate-950 text-slate-300">In Progress</option>
                                <option value="completed" className="bg-slate-950 text-slate-300">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Projects Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="p-16 text-center border border-slate-900 rounded-3xl bg-slate-900/10 space-y-4 shadow-xl">
                        <FolderGit2 className="w-12 h-12 text-slate-650 mx-auto animate-pulse" />
                        <h3 className="font-bold text-white text-sm font-display">No workspaces match</h3>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">Try resetting filters or launch a new project workspace container.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => {
                            const isCreator = project.creator_username === myUsername;
                            const diffBadge = getDifficultyWeightBadge(project.difficulty);
                            
                            // Mocking or fetching slots occupied
                            const occupiedSlots = project.members?.length || 1; // At least owner
                            const totalSlots = project.max_members || 5;
                            const slotsLeft = totalSlots - occupiedSlots;

                            return (
                                <div
                                    key={project.id}
                                    className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:border-slate-800"
                                >
                                    <div className="space-y-4.5">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-white/8 text-slate-300 border border-white/12 tracking-wider">
                                                <Tag className="w-2.5 h-2.5" /> {project.category}
                                            </span>
                                            
                                            <div className="flex gap-1.5">
                                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border uppercase tracking-wider ${diffBadge.color}`}>
                                                    {diffBadge.label}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border uppercase tracking-wider ${
                                                    (project.status || "") === "recruiting" 
                                                        ? "bg-amber-950/30 text-amber-400 border-amber-500/20" 
                                                        : (project.status || "") === "in_progress" 
                                                            ? "bg-blue-950/30 text-blue-400 border-blue-500/20" 
                                                            : "bg-emerald-950/30 text-emerald-400 border-emerald-500/20"
                                                }`}>
                                                    {(project.status || "").replace("_", " ")}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-base font-extrabold text-white line-clamp-1 capitalize font-display flex items-center gap-1.5">
                                                {project.title}
                                                {project.visibility === "private" && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                                            </h3>
                                            <span className="text-[10px] text-slate-500 block mt-0.5">Created by <span className="capitalize font-bold text-slate-400">@{project.creator_username}</span></span>
                                        </div>

                                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                                            {project.description}
                                        </p>

                                        {/* Teammate slots progress indicator */}
                                        <div className="space-y-1.5 pt-2">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-slate-500 flex items-center gap-1">
                                                    <Users className="w-3 h-3 text-slate-500" /> Roster Slots
                                                </span>
                                                <span className="font-bold text-slate-300">
                                                    {occupiedSlots} / {totalSlots} Occupied ({slotsLeft} left)
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-950">
                                                <div 
                                                    className="bg-gradient-to-r from-brand-blue to-brand-purple h-full rounded-full transition-all duration-300"
                                                    style={{ width: `${(occupiedSlots / totalSlots) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-5 border-t border-slate-900/60 flex gap-2.5">
                                        {isCreator ? (
                                            <Link
                                                to={`/projects/${project.id}`}
                                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-95 text-xs font-bold text-white transition flex items-center justify-center gap-1 shadow-lg shadow-brand-blue/10 glow-btn"
                                            >
                                                Enter Workspace <ArrowUpRight className="w-3.5 h-3.5" />
                                            </Link>
                                        ) : (
                                            <>
                                                <Link
                                                    to={`/projects/${project.id}`}
                                                    className="flex-1 text-center py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-bold text-slate-300 border border-slate-800 transition"
                                                >
                                                    View Idea
                                                </Link>
                                                {project.status === "recruiting" ? (
                                                    <button
                                                        onClick={() => handleJoinRequest(project.id)}
                                                        className="flex-1 py-2.5 rounded-xl bg-white/8 hover:bg-white/15 border border-white/15 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
                                                    >
                                                        Request Join
                                                    </button>
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-xs font-bold text-slate-600 transition cursor-not-allowed"
                                                    >
                                                        Closed
                                                    </button>
                                                )}
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
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-lg p-6 rounded-2xl glass-panel border border-slate-900 shadow-2xl relative animate-scaleUp max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="absolute top-4.5 right-4.5 text-slate-500 hover:text-white cursor-pointer transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-lg font-bold text-white mb-5 font-display flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-brand-purple" /> Create New Project Workspace
                            </h2>

                            <form onSubmit={handleCreateProject} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider font-display">Workspace Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none text-xs text-slate-100 placeholder:text-slate-600"
                                        placeholder="e.g. BuildVerse Mobile Client"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider font-display">Description</label>
                                    <textarea
                                        rows="3"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none text-xs text-slate-100 placeholder:text-slate-600 leading-relaxed"
                                        placeholder="Detail your product goals, team mission, and target features..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider font-display">Category</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none text-xs text-slate-100 placeholder:text-slate-600"
                                            placeholder="e.g. AI, Web, Mobile"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider font-display">Max Members</label>
                                        <input
                                            type="number"
                                            min="2"
                                            max="20"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none text-xs text-slate-100"
                                            value={maxMembers}
                                            onChange={(e) => setMaxMembers(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider font-display">Difficulty (Workload)</label>
                                        <select
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-350 text-xs focus:border-brand-purple outline-none cursor-pointer"
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(e.target.value)}
                                        >
                                            <option value="beginner">Light Load (Beginner)</option>
                                            <option value="intermediate">Medium Load (Intermediate)</option>
                                            <option value="advanced">Heavy Load (Advanced)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider font-display">Visibility</label>
                                        <select
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-350 text-xs focus:border-brand-purple outline-none cursor-pointer"
                                            value={visibility}
                                            onChange={(e) => setVisibility(e.target.value)}
                                        >
                                            <option value="public">Public (Visible to All)</option>
                                            <option value="portfolio_only">Portfolio Only</option>
                                            <option value="private">Private (Invite Only)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider font-display">GitHub Repository (Optional)</label>
                                    <input
                                        type="url"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none text-xs text-slate-100 placeholder:text-slate-600"
                                        placeholder="https://github.com/org/repo"
                                        value={githubRepoUrl}
                                        onChange={(e) => setGithubRepoUrl(e.target.value)}
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-900 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 text-xs font-bold transition hover:text-white cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-95 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50 glow-btn"
                                    >
                                        {creating ? "Launching container..." : "Create Workspace"}
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

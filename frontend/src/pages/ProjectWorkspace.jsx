import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { useToast } from "../context/ToastContext";
import { BoardSkeleton } from "../components/Skeletons";
import { 
    FolderGit2, 
    Calendar, 
    Users, 
    CheckSquare, 
    FileText, 
    MessageSquare, 
    Plus, 
    Trash2, 
    Download, 
    ExternalLink, 
    Lock, 
    Sparkles, 
    Clock, 
    ArrowLeft, 
    Send, 
    Github,
    ChevronLeft,
    ChevronRight,
    Award,
    CheckCircle2,
    X,
    User
} from "lucide-react";

const getBackendUrl = () => {
    const apiBase = api.defaults.baseURL || "http://127.0.0.1:8000/api/";
    if (apiBase.endsWith("/api/")) {
        return apiBase.slice(0, -5);
    }
    if (apiBase.endsWith("/api")) {
        return apiBase.slice(0, -4);
    }
    return "http://127.0.0.1:8000";
};

function ProjectWorkspace() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [project, setProject] = useState(null);
    const [myUsername, setMyUsername] = useState("");
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);

    // Overview Tab State
    const [members, setMembers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [skills, setSkills] = useState([]);
    const [joinRequests, setJoinRequests] = useState([]);

    // Role & Skill Add States
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleSlots, setNewRoleSlots] = useState(1);
    const [newSkillName, setNewSkillName] = useState("");
    const [newSkillExp, setNewSkillExp] = useState(1.0);

    // Accept Request Role Mapping State
    const [selectedRoleForRequest, setSelectedRoleForRequest] = useState({});

    // Task Board State
    const [tasks, setTasks] = useState([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDesc, setTaskDesc] = useState("");
    const [taskAssignedTo, setTaskAssignedTo] = useState("");
    const [taskPriority, setTaskPriority] = useState("medium");
    const [taskDueDate, setTaskDueDate] = useState("");
    const [creatingTask, setCreatingTask] = useState(false);

    // Task Comments Modal State
    const [selectedTask, setSelectedTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);

    // Document State
    const [documents, setDocuments] = useState([]);
    const [docTitle, setDocTitle] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const fileInputRef = useRef(null);

    // Chat Room State
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const chatEndRef = useRef(null);
    const chatPollInterval = useRef(null);

    // Team Rating / Review Modal State
    const [showRateModal, setShowRateModal] = useState(false);
    const [rateUserId, setRateUserId] = useState(null);
    const [rateUsername, setRateUsername] = useState("");
    const [techRating, setTechRating] = useState(5);
    const [commRating, setCommRating] = useState(5);
    const [teamRating, setTeamRating] = useState(5);
    const [deadRating, setDeadRating] = useState(5);
    const [rateFeedback, setRateFeedback] = useState("");
    const [submittingRate, setSubmittingRate] = useState(false);
    const [reviewedUserIds, setReviewedUserIds] = useState([]);

    useEffect(() => {
        loadWorkspace();
        return () => {
            if (chatPollInterval.current) clearInterval(chatPollInterval.current);
        };
    }, [id]);

    useEffect(() => {
        if (activeTab === "chat") {
            fetchChatMessages();
            chatPollInterval.current = setInterval(fetchChatMessages, 4000);
        } else {
            if (chatPollInterval.current) {
                clearInterval(chatPollInterval.current);
                chatPollInterval.current = null;
            }
        }
        return () => {
            if (chatPollInterval.current) clearInterval(chatPollInterval.current);
        };
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === "chat" && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const loadWorkspace = async () => {
        setLoading(true);
        try {
            const [projRes, profileRes] = await Promise.all([
                api.get(`projects/${id}/`),
                api.get("profile/details/")
            ]);
            setProject(projRes.data);
            setMyUsername(profileRes.data.username);

            // Load sub-resources
            fetchOverviewData(projRes.data, profileRes.data.username);
            fetchTasks();
            fetchDocuments();
        } catch (error) {
            console.error("Error loading project workspace:", error);
            showToast("Permission denied or project workspace not found.", "error");
            navigate("/projects");
        } finally {
            setLoading(false);
        }
    };

    const fetchOverviewData = async (projData, usernameVal) => {
        try {
            const [membersRes, rolesRes, skillsRes] = await Promise.all([
                api.get(`projects/${id}/members/`),
                api.get(`projects/${id}/roles/`),
                api.get(`projects/${id}/skills/`)
            ]);
            setMembers(membersRes.data);
            setRoles(rolesRes.data);
            setSkills(skillsRes.data);

            const currentUser = usernameVal || myUsername;

            if (projData.creator_username === currentUser) {
                const requestsRes = await api.get(`projects/${id}/requests/`);
                setJoinRequests(requestsRes.data);
            }

            // Check which members have been reviewed if project is completed
            if (projData.status === "completed") {
                const candidates = [];
                if (projData.creator_username !== currentUser) {
                    candidates.push({ user: projData.creator, username: projData.creator_username });
                }
                membersRes.data.forEach(m => {
                    if (m.username !== currentUser) {
                        candidates.push({ user: m.user, username: m.username });
                    }
                });

                if (candidates.length > 0) {
                    const checks = await Promise.all(
                        candidates.map(async (c) => {
                            try {
                                const res = await api.get(`reviews/user/${c.user}/`);
                                const hasReviewed = res.data.some(r => 
                                    r.project === projData.id && r.reviewer_username === currentUser
                                );
                                return { userId: c.user, reviewed: hasReviewed };
                            } catch (e) {
                                return { userId: c.user, reviewed: false };
                            }
                        })
                    );
                    const alreadyReviewed = checks.filter(c => c.reviewed).map(c => c.userId);
                    setReviewedUserIds(alreadyReviewed);
                }
            }
        } catch (error) {
            console.error("Error loading overview sub-data:", error);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await api.get(`tasks/project/${id}/`);
            setTasks(response.data);
        } catch (error) {
            console.error("Error loading tasks:", error);
        }
    };

    const fetchDocuments = async () => {
        try {
            const response = await api.get(`documents/project/${id}/`);
            setDocuments(response.data);
        } catch (error) {
            console.error("Error loading documents:", error);
        }
    };

    const fetchChatMessages = async () => {
        try {
            const response = await api.get(`chats/${id}/messages/`);
            setMessages(response.data);
        } catch (error) {
            console.error("Error loading messages:", error);
        }
    };

    // --- Overview Tab Actions ---
    const handleAddRole = async (e) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;
        try {
            await api.post(`projects/${id}/roles/`, {
                role_name: newRoleName.trim().toLowerCase(),
                slots_required: parseInt(newRoleSlots)
            });
            setNewRoleName("");
            setNewRoleSlots(1);
            fetchOverviewData(project);
            showToast("Workspace role defined successfully.");
        } catch (error) {
            console.error("Error adding role:", error);
            showToast("Failed to define role.", "error");
        }
    };

    const handleDeleteRole = async (roleId) => {
        try {
            await api.delete(`projects/roles/${roleId}/delete/`);
            fetchOverviewData(project);
            showToast("Role removed.");
        } catch (error) {
            console.error("Error deleting role:", error);
        }
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        if (!newSkillName.trim()) return;
        try {
            await api.post(`projects/${id}/skills/`, {
                skill_name: newSkillName.trim(),
                minimum_experience_years: parseFloat(newSkillExp)
            });
            setNewSkillName("");
            setNewSkillExp(1.0);
            fetchOverviewData(project);
            showToast("Required technical skill registered.");
        } catch (error) {
            console.error("Error adding project skill:", error);
            showToast("Failed to add project skill.", "error");
        }
    };

    const handleDeleteSkill = async (skillId) => {
        try {
            await api.delete(`projects/skills/${skillId}/delete/`);
            fetchOverviewData(project);
            showToast("Required skill removed.");
        } catch (error) {
            console.error("Error deleting project skill:", error);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        const roleId = selectedRoleForRequest[requestId];
        if (!roleId) {
            showToast("Select a project role to assign first!", "error");
            return;
        }
        try {
            await api.post(`projects/join-requests/${requestId}/accept/`, {
                role_id: parseInt(roleId)
            });
            showToast("Join request accepted! Teammate added. 👥");
            fetchOverviewData(project);
        } catch (error) {
            console.error("Error accepting request:", error);
            showToast("Failed to accept join request.", "error");
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await api.post(`projects/join-requests/${requestId}/reject/`);
            showToast("Join request declined.");
            fetchOverviewData(project);
        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    };

    const handleCompleteProject = async () => {
        if (!window.confirm("Mark project workspace as completed?")) return;
        try {
            await api.patch(`projects/${id}/complete/`);
            showToast("Project completed! Teammates have been notified to leave ratings. 🏆");
            loadWorkspace();
        } catch (error) {
            console.error("Error completing project:", error);
        }
    };

    // --- Task Board Actions ---
    const handleCreateTask = async (e) => {
        e.preventDefault();
        setCreatingTask(true);
        try {
            // If assignedTo is "creator", we send project.creator (which is the creator ID)
            const assigneeValue = taskAssignedTo === "creator" ? project?.creator : taskAssignedTo;
            await api.post(`tasks/project/${id}/`, {
                title: taskTitle,
                description: taskDesc,
                assigned_to_id: assigneeValue ? parseInt(assigneeValue) : null,
                priority: taskPriority,
                due_date: taskDueDate || null,
                status: "todo"
            });
            setTaskTitle("");
            setTaskDesc("");
            setTaskAssignedTo("");
            setTaskPriority("medium");
            setTaskDueDate("");
            setShowTaskModal(false);
            fetchTasks();
            showToast("Workspace task registered!");
        } catch (error) {
            console.error("Error creating task:", error);
            showToast("Failed to create task.", "error");
        } finally {
            setCreatingTask(false);
        }
    };

    const handleUpdateTaskStatus = async (taskId, nextStatus) => {
        try {
            await api.patch(`tasks/${taskId}/status/`, {
                status: nextStatus
            });
            fetchTasks();
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Delete this task?")) return;
        try {
            await api.delete(`tasks/${taskId}/`);
            fetchTasks();
            if (selectedTask?.id === taskId) setSelectedTask(null);
            showToast("Task removed.");
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    // --- Task Comments Modals ---
    const handleOpenTaskComments = async (task) => {
        setSelectedTask(task);
        setLoadingComments(true);
        try {
            const response = await api.get(`tasks/${task.id}/comments/`);
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await api.post(`tasks/${selectedTask.id}/comments/`, {
                comment: newComment.trim()
            });
            setNewComment("");
            // Refresh comments
            const response = await api.get(`tasks/${selectedTask.id}/comments/`);
            setComments(response.data);
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    // --- Document Actions ---
    const handleUploadDoc = async (e) => {
        e.preventDefault();
        if (!docTitle.trim() || !selectedFile) return;

        setUploadingDoc(true);
        const formData = new FormData();
        formData.append("title", docTitle.trim());
        formData.append("file", selectedFile);

        try {
            await api.post(`documents/project/${id}/`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setDocTitle("");
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchDocuments();
            showToast("Workspace document uploaded! 📄");
        } catch (error) {
            console.error("Error uploading document:", error);
            showToast("Failed to upload document.", "error");
        } finally {
            setUploadingDoc(false);
        }
    };

    const handleDeleteDoc = async (docId) => {
        if (!window.confirm("Delete this document?")) return;
        try {
            await api.delete(`documents/${docId}/`);
            fetchDocuments();
            showToast("Document deleted.");
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    };

    // --- Teammate Rating Actions ---
    const handleOpenRateModal = (userId, username) => {
        setRateUserId(userId);
        setRateUsername(username);
        setTechRating(5);
        setCommRating(5);
        setTeamRating(5);
        setDeadRating(5);
        setRateFeedback("");
        setShowRateModal(true);
    };

    const handleSubmitRate = async (e) => {
        e.preventDefault();
        setSubmittingRate(true);
        try {
            await api.post("reviews/", {
                project: parseInt(id),
                reviewed_user: rateUserId,
                technical_rating: techRating,
                communication_rating: commRating,
                teamwork_rating: teamRating,
                deadline_rating: deadRating,
                feedback: rateFeedback
            });
            showToast(`Successfully rated @${rateUsername}!`);
            setShowRateModal(false);
            setReviewedUserIds(prev => [...prev, rateUserId]);
        } catch (error) {
            console.error("Error submitting rating:", error);
            const errMsg = error.response?.data?.error || "Failed to submit rating.";
            showToast(errMsg, "error");
        } finally {
            setSubmittingRate(false);
        }
    };

    // --- Chat Actions ---
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const msgText = chatInput.trim();
        setChatInput(""); 

        try {
            await api.post(`chats/${id}/messages/`, {
                content: msgText
            });
            fetchChatMessages();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col justify-center items-center h-96 gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-purple border-t-transparent"></div>
                    <p className="text-xs text-slate-500 font-bold tracking-wider animate-pulse">Synchronizing Workspace Assets...</p>
                </div>
            </DashboardLayout>
        );
    }

    const isCreator = project?.creator_username === myUsername;

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fadeIn h-full flex flex-col relative pb-10">
                {/* Back Link & Workspace Info */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Link to="/projects" className="flex items-center gap-1 hover:text-white transition">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Feed
                    </Link>
                </div>

                {/* Project Workspace Header */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-900 shadow-xl flex justify-between items-start md:items-center flex-wrap gap-4 relative overflow-hidden">
                    <div className="absolute top-[-30%] left-[-10%] w-[200px] h-[200px] bg-brand-blue/10 rounded-full blur-[60px] pointer-events-none"></div>
                    
                    <div className="relative z-10 space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-white/8 text-slate-300 border border-white/12 tracking-wider">
                                {project?.category}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold border uppercase tracking-wider ${
                                project?.status === "recruiting" 
                                    ? "bg-amber-950/30 text-amber-400 border-amber-500/20" 
                                    : project?.status === "in_progress" 
                                        ? "bg-blue-950/30 text-blue-400 border-blue-500/20" 
                                        : "bg-emerald-950/30 text-emerald-400 border-emerald-500/20"
                            }`}>
                                {project?.status ? project.status.replace("_", " ") : ""}
                            </span>
                            {project?.visibility === "private" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-slate-900 border border-slate-800 text-slate-500">
                                    <Lock className="w-2.5 h-2.5" /> Private
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-black text-white capitalize font-display tracking-tight">{project?.title}</h1>
                        <p className="text-[10px] text-slate-400">Created by <span className="capitalize font-bold text-slate-300">@{project?.creator_username}</span></p>
                    </div>

                    {isCreator && project?.status !== "completed" && (
                        <button
                            onClick={handleCompleteProject}
                            className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-650 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-emerald-600/10 active:scale-[0.98] transition relative z-10 glow-btn"
                        >
                            🏆 Mark Completed
                        </button>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 border-b border-slate-900 pb-px">
                    {[
                        { id: "overview", label: "Overview & Team", icon: <Users className="w-4 h-4" /> },
                        { id: "tasks", label: "Task Board", icon: <CheckSquare className="w-4 h-4" /> },
                        { id: "docs", label: "Documents Hub", icon: <FileText className="w-4 h-4" /> },
                        { id: "chat", label: "Team Chat", icon: <MessageSquare className="w-4 h-4" /> }
                    ].map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition duration-200 cursor-pointer border-b-2 relative ${
                                    isActive
                                        ? "text-slate-200 border-slate-500 bg-white/5"
                                        : "text-slate-450 border-transparent hover:text-slate-200 hover:bg-slate-900/20"
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Contents */}
                <div className="flex-1 min-h-0">
                    {/* OVERVIEW TAB */}
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Pane (Description + Skills & Roles) */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider font-display">Mission Statement</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{project?.description}</p>
                                    
                                    {project?.github_repo_url && (
                                        <div className="pt-2">
                                            <a
                                                href={project.github_repo_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                                            >
                                                <Github className="w-4 h-4" /> Connect Repository
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Skills and Roles managers */}
                                {isCreator && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {/* Roles defined */}
                                        <div className="p-5 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                                            <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider font-display">Workspace Roles</h3>
                                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                                {roles.length === 0 ? (
                                                    <p className="text-[10px] text-slate-550 italic py-2">No custom roles defined yet.</p>
                                                ) : (
                                                    roles.map(r => (
                                                        <div key={r.id} className="flex justify-between items-center text-xs bg-slate-900/40 p-2.5 rounded-xl border border-slate-900">
                                                            <span className="capitalize text-slate-300 font-semibold">{r.role_name} ({r.slots_required} slots)</span>
                                                            <button onClick={() => handleDeleteRole(r.id)} className="text-rose-400 hover:text-rose-500 transition cursor-pointer">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <form onSubmit={handleAddRole} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    required
                                                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-200 outline-none focus:border-brand-purple"
                                                    placeholder="Role Name"
                                                    value={newRoleName}
                                                    onChange={e => setNewRoleName(e.target.value)}
                                                />
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="w-12 px-2 py-2 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-200 outline-none"
                                                    value={newRoleSlots}
                                                    onChange={e => setNewRoleSlots(e.target.value)}
                                                />
                                                <button type="submit" className="px-3 py-2 bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-xl text-xs font-bold cursor-pointer">+</button>
                                            </form>
                                        </div>

                                        {/* Skills defined */}
                                        <div className="p-5 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                                            <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider font-display">Required Skills</h3>
                                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                                {skills.length === 0 ? (
                                                    <p className="text-[10px] text-slate-555 italic py-2">No skill requirements set yet.</p>
                                                ) : (
                                                    skills.map(s => (
                                                        <div key={s.id} className="flex justify-between items-center text-xs bg-slate-900/40 p-2.5 rounded-xl border border-slate-900">
                                                            <span className="capitalize text-slate-300 font-semibold">{s.skill_name} ({s.minimum_experience_years}+y)</span>
                                                            <button onClick={() => handleDeleteSkill(s.id)} className="text-rose-400 hover:text-rose-500 transition cursor-pointer">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <form onSubmit={handleAddSkill} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    required
                                                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-200 outline-none focus:border-brand-purple"
                                                    placeholder="Skill Name"
                                                    value={newSkillName}
                                                    onChange={e => setNewSkillName(e.target.value)}
                                                />
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    className="w-14 px-2 py-2 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-200 outline-none"
                                                    value={newSkillExp}
                                                    onChange={e => setNewSkillExp(e.target.value)}
                                                />
                                                <button type="submit" className="px-3 py-2 bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-xl text-xs font-bold cursor-pointer">+</button>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Pane (Roster & Requests) */}
                            <div className="space-y-6">
                                {/* Team Roster */}
                                <div className="p-5 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider font-display">Team Roster</h3>
                                    <div className="space-y-2.5">
                                        {/* Creator Card */}
                                        <div className="flex justify-between items-center bg-brand-blue/10 p-3 rounded-xl border border-brand-blue/20">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-purple text-white flex items-center justify-center font-bold text-xs capitalize">
                                                    {project?.creator_username ? project.creator_username[0] : ""}
                                                </div>
                                                <span className="text-xs font-bold text-slate-200 capitalize">{project?.creator_username}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] bg-brand-blue/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-black uppercase tracking-wider">Creator</span>
                                                {project?.status === "completed" && myUsername !== project?.creator_username && (
                                                    reviewedUserIds.includes(project?.creator) ? (
                                                        <span className="text-[9px] text-slate-500 border border-slate-850 bg-slate-950 px-2.5 py-0.5 rounded-lg font-bold uppercase tracking-wider">Reviewed</span>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleOpenRateModal(project?.creator, project?.creator_username)}
                                                                    className="px-2.5 py-1 rounded-lg bg-white/8 hover:bg-white/15 text-slate-300 border border-slate-700 text-[9px] font-bold cursor-pointer transition active:scale-95"
                                                        >
                                                            ⭐ Rate Work
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        {/* Members Card */}
                                        {members.length === 0 ? (
                                            <p className="text-[11px] text-slate-500 italic py-4 text-center">Roster is currently empty.</p>
                                        ) : (
                                            members.map(member => (
                                                <div key={member.id} className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-900">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center font-bold text-xs text-slate-400 capitalize border border-slate-850">
                                                            {member.username[0]}
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-300 capitalize">{member.username}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] bg-slate-950 text-slate-450 border border-slate-850 px-2.5 py-0.5 rounded-lg capitalize">{member.role_name}</span>
                                                        {project?.status === "completed" && myUsername !== member.username && (
                                                            reviewedUserIds.includes(member.user) ? (
                                                                <span className="text-[9px] text-slate-500 border border-slate-850 bg-slate-950 px-2.5 py-0.5 rounded-lg font-bold uppercase tracking-wider">Reviewed</span>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => handleOpenRateModal(member.user, member.username)}
                                                                            className="px-2.5 py-1 rounded-lg bg-white/8 hover:bg-white/15 text-slate-300 border border-slate-700 text-[9px] font-bold cursor-pointer transition active:scale-95"
                                                                >
                                                                    ⭐ Rate Work
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Join Requests Manager (Only Creator) */}
                                {isCreator && (
                                    <div className="p-5 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                                        <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider font-display">Workspace Requests</h3>
                                        <div className="space-y-3">
                                            {joinRequests.filter(r => r.status === "pending").length === 0 ? (
                                                <p className="text-[11px] text-slate-500 italic py-4 text-center">No pending requests.</p>
                                            ) : (
                                                joinRequests.filter(r => r.status === "pending").map(req => (
                                                    <div key={req.id} className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-900 space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-slate-300 capitalize">{req.username}</span>
                                                            <span className="text-[9px] text-slate-500">{new Date(req.requested_at).toLocaleDateString()}</span>
                                                        </div>
                                                        {/* Role Assignment Selector */}
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Assign Role</label>
                                                            <select
                                                                className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-900 text-slate-300 text-[10px] outline-none cursor-pointer focus:border-brand-purple"
                                                                value={selectedRoleForRequest[req.id] || ""}
                                                                onChange={e => setSelectedRoleForRequest(prev => ({ ...prev, [req.id]: e.target.value }))}
                                                            >
                                                                <option value="" className="bg-slate-950">Select role...</option>
                                                                {roles.map(role => (
                                                                    <option key={role.id} value={role.id} className="bg-slate-950">{role.role_name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        {/* Action Triggers */}
                                                        <div className="flex gap-2 pt-1">
                                                            <button
                                                                onClick={() => handleAcceptRequest(req.id)}
                                                                className="flex-1 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-[10px] font-bold text-white transition cursor-pointer"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectRequest(req.id)}
                                                                className="px-3 py-1.5 rounded-lg bg-slate-950 text-slate-400 text-[10px] font-semibold border border-slate-850 hover:text-white transition cursor-pointer"
                                                            >
                                                                Decline
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TASK BOARD TAB */}
                    {activeTab === "tasks" && (
                        <div className="space-y-6 h-full flex flex-col">
                            {/* Create task action bar */}
                            {isCreator && (
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowTaskModal(true)}
                                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-95 text-xs font-bold text-white shadow-lg shadow-brand-blue/15 transition flex items-center gap-1.5 glow-btn"
                                    >
                                        <Plus className="w-4 h-4" /> Add Task
                                    </button>
                                </div>
                            )}

                            {/* Kanban Board columns */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[480px]">
                                {[
                                    { id: "todo", label: "To Do" },
                                    { id: "in_progress", label: "In Progress" },
                                    { id: "completed", label: "Completed" }
                                ].map(col => {
                                    const colTasks = tasks.filter(t => t.status === col.id);
                                    return (
                                        <div key={col.id} className="p-4 rounded-2xl glass-panel border border-slate-900 flex flex-col h-full min-h-[420px] shadow-xl">
                                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-900/60">
                                                <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2 font-display">
                                                    <span className={`w-2.5 h-2.5 rounded-full ${
                                                        col.id === "todo" ? "bg-slate-550" :
                                                        col.id === "in_progress" ? "bg-blue-500" : "bg-emerald-500"
                                                    }`}></span>
                                                    {col.label}
                                                </h3>
                                                <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full font-bold border border-slate-850">
                                                    {colTasks.length}
                                                </span>
                                            </div>

                                            <div className="space-y-3.5 overflow-y-auto flex-1 pr-1">
                                                {colTasks.map(task => (
                                                    <div
                                                        key={task.id}
                                                        onClick={() => handleOpenTaskComments(task)}
                                                        className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 hover:border-slate-800 hover:bg-slate-950 transition cursor-pointer relative group space-y-3"
                                                    >
                                                        <div className="flex justify-between items-start gap-2">
                                                            <h4 className="text-xs font-bold text-slate-200 group-hover:text-brand-purple transition line-clamp-1 capitalize font-display">{task.title}</h4>
                                                            <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider ${
                                                                task.priority === "high" ? "bg-rose-950/30 text-rose-455 border border-rose-500/20" :
                                                                task.priority === "medium" ? "bg-blue-950/30 text-blue-455 border border-blue-500/20" :
                                                                "bg-slate-900 text-slate-500 border border-slate-850"
                                                            }`}>
                                                                {task.priority}
                                                            </span>
                                                        </div>

                                                        <p className="text-[11px] text-slate-450 line-clamp-2 leading-relaxed">{task.description}</p>

                                                        <div className="flex justify-between items-center text-[10px] pt-1.5 text-slate-500 font-semibold border-t border-slate-900/40">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3 text-slate-500" /> {task.due_date ? task.due_date : "No deadline"}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-[9px] bg-slate-900 px-2 py-0.5 rounded-lg text-slate-400 capitalize border border-slate-850">
                                                                <User className="w-2.5 h-2.5 text-slate-500" /> {task.assigned_to_username ? `@${task.assigned_to_username}` : "Unassigned"}
                                                            </span>
                                                        </div>

                                                        {/* Status Controls */}
                                                        <div className="flex justify-between items-center gap-1.5 pt-2 border-t border-slate-900/60 opacity-0 group-hover:opacity-100 transition duration-200">
                                                            <div className="flex gap-1">
                                                                {col.id !== "todo" && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleUpdateTaskStatus(task.id, col.id === "completed" ? "in_progress" : "todo");
                                                                        }}
                                                                        className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 rounded text-[9px] font-bold text-slate-400 border border-slate-800 cursor-pointer"
                                                                    >
                                                                        ← Move
                                                                    </button>
                                                                )}
                                                                {col.id !== "completed" && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleUpdateTaskStatus(task.id, col.id === "todo" ? "in_progress" : "completed");
                                                                        }}
                                                                        className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-[9px] font-bold text-slate-300 border border-white/15 cursor-pointer"
                                                                    >
                                                                        Move →
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {isCreator && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteTask(task.id);
                                                                    }}
                                                                    className="text-rose-455 hover:text-rose-400 p-0.5 rounded cursor-pointer transition"
                                                                    title="Delete Task"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* DOCUMENTS HUB TAB */}
                    {activeTab === "docs" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Document Uploader */}
                            <div className="lg:col-span-1">
                                <div className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider font-display">Asset Uploader</h3>
                                    {isCreator ? (
                                        <form onSubmit={handleUploadDoc} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Document Title</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-100 outline-none focus:border-brand-purple placeholder:text-slate-700"
                                                    placeholder="e.g. Design Specs"
                                                    value={docTitle}
                                                    onChange={e => setDocTitle(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Select Asset File</label>
                                                <input
                                                    type="file"
                                                    required
                                                    ref={fileInputRef}
                                                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-slate-900 file:text-slate-300 hover:file:bg-slate-800 hover:file:text-white cursor-pointer"
                                                    onChange={e => setSelectedFile(e.target.files[0])}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={uploadingDoc}
                                                className="w-full py-2.5 bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-95 rounded-xl text-xs font-bold text-white transition active:scale-[0.98] cursor-pointer disabled:opacity-50 glow-btn"
                                            >
                                                {uploadingDoc ? "Uploading..." : "Upload Document"}
                                            </button>
                                        </form>
                                    ) : (
                                        <p className="text-xs text-slate-500 italic leading-relaxed">Only the project creator can upload assets.</p>
                                    )}
                                </div>
                            </div>

                            {/* Documents List */}
                            <div className="lg:col-span-2">
                                <div className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider font-display">Shared Assets</h3>
                                    <div className="space-y-3">
                                        {documents.length === 0 ? (
                                            <p className="text-xs text-slate-500 py-12 text-center italic">No documents shared inside workspace yet.</p>
                                        ) : (
                                            documents.map(doc => (
                                                <div key={doc.id} className="flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-slate-900 hover:border-slate-800 transition">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-200 capitalize font-display">{doc.title}</h4>
                                                        <div className="flex gap-2 text-[10px] text-slate-500 pt-1 font-semibold">
                                                            <span>Uploaded by @{doc.uploaded_by_username}</span>
                                                            <span>•</span>
                                                            <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <a
                                                            href={`${getBackendUrl()}${doc.file}`}
                                                            download
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs font-bold text-brand-blue hover:text-blue-400 flex items-center gap-1"
                                                        >
                                                            <Download className="w-3.5 h-3.5" /> Download
                                                        </a>
                                                        {(isCreator || doc.uploaded_by_username === myUsername) && (
                                                            <button
                                                                onClick={() => handleDeleteDoc(doc.id)}
                                                                className="text-rose-455 hover:text-rose-400 text-xs font-semibold cursor-pointer transition"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TEAM CHAT TAB */}
                    {activeTab === "chat" && (
                        <div className="p-5 rounded-2xl glass-panel border border-slate-900 flex flex-col h-[520px] shadow-xl relative">
                            {/* Messages area */}
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1.5">
                                {messages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                                        No messages sent yet. Start the coordination!
                                    </div>
                                ) : (
                                    messages.map((msg, index) => {
                                        const isMe = msg.sender_username === myUsername;
                                        return (
                                            <div key={msg.id || index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                                <div className="flex gap-1.5 items-center mb-1 text-[9px] text-slate-500 font-semibold">
                                                    <span className="font-bold capitalize">{msg.sender_username}</span>
                                                    <span>•</span>
                                                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className={`px-4 py-2.5 rounded-2xl text-xs max-w-sm ${
                                                    isMe
                                                        ? "bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-tr-none shadow-md"
                                                        : "bg-slate-900 text-slate-300 border border-slate-850 rounded-tl-none"
                                                }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={chatEndRef}></div>
                            </div>

                            {/* Chat Input bar */}
                            <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-slate-900/60">
                                <input
                                    type="text"
                                    required
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-200 outline-none focus:border-brand-purple placeholder:text-slate-700"
                                    placeholder="Message team channel..."
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white hover:opacity-95 text-xs font-bold transition flex items-center justify-center cursor-pointer glow-btn"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Create Task Modal */}
                {showTaskModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-slate-900 shadow-2xl relative animate-scaleUp">
                            <button
                                onClick={() => setShowTaskModal(false)}
                                className="absolute top-4.5 right-4.5 text-slate-500 hover:text-white cursor-pointer transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-lg font-bold text-white mb-5 font-display flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-brand-purple animate-pulse" /> Add Workspace Task
                            </h2>

                            <form onSubmit={handleCreateTask} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Task Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-955 border border-slate-900 text-xs text-slate-105 outline-none focus:border-brand-purple placeholder:text-slate-700"
                                        placeholder="e.g. Build authentication endpoints"
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
                                    <textarea
                                        rows="3"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-955 border border-slate-900 text-xs text-slate-105 outline-none focus:border-brand-purple placeholder:text-slate-700"
                                        placeholder="Detail task requirements & expected outputs..."
                                        value={taskDesc}
                                        onChange={(e) => setTaskDesc(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Assign To</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-955 border border-slate-900 text-slate-350 text-xs focus:border-brand-purple outline-none cursor-pointer"
                                        value={taskAssignedTo}
                                        onChange={e => setTaskAssignedTo(e.target.value)}
                                    >
                                        <option value="" className="bg-slate-950">Unassigned</option>
                                        {/* Creator option - using creator user ID integer */}
                                        <option value="creator" className="bg-slate-950">@{project?.creator_username} (Creator)</option>
                                        {/* Members */}
                                        {members.map(member => (
                                            <option key={member.user} value={member.user} className="bg-slate-950">@{member.username} ({member.role_name})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Priority</label>
                                        <select
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-955 border border-slate-900 text-slate-350 text-xs focus:border-brand-purple outline-none cursor-pointer"
                                            value={taskPriority}
                                            onChange={(e) => setTaskPriority(e.target.value)}
                                        >
                                            <option value="low" className="bg-slate-950">Low</option>
                                            <option value="medium" className="bg-slate-950">Medium</option>
                                            <option value="high" className="bg-slate-950">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Due Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-955 border border-slate-900 text-slate-350 text-xs focus:border-brand-purple outline-none cursor-pointer"
                                            value={taskDueDate}
                                            onChange={e => setTaskDueDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-900 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowTaskModal(false)}
                                        className="px-4 py-2 rounded-xl bg-slate-900 text-slate-450 border border-slate-800 text-xs font-bold transition hover:text-white cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creatingTask}
                                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-95 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50 glow-btn"
                                    >
                                        {creatingTask ? "Registering..." : "Add Task"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Task Detail and Comments modal */}
                {selectedTask && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-lg p-6 rounded-2xl glass-panel border border-slate-900 shadow-2xl relative animate-scaleUp max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="absolute top-4.5 right-4.5 text-slate-500 hover:text-white cursor-pointer transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-start gap-2 pb-3.5 border-b border-slate-900/60">
                                    <div>
                                        <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider inline-block mb-1.5 ${
                                            selectedTask.priority === "high" ? "bg-rose-955/30 text-rose-455 border border-rose-500/20" :
                                            selectedTask.priority === "medium" ? "bg-blue-955/30 text-blue-455 border border-blue-500/20" :
                                            "bg-slate-900 text-slate-500 border border-slate-850"
                                        }`}>
                                            {selectedTask.priority} Priority
                                        </span>
                                        <h3 className="text-base font-extrabold text-white capitalize font-display">{selectedTask.title}</h3>
                                    </div>
                                    <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-full font-bold capitalize">
                                        Status: {selectedTask.status.replace("_", " ")}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Description</span>
                                    <p className="text-xs text-slate-350 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-900">{selectedTask.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-b border-slate-900/60 pb-3.5">
                                    <div>
                                        <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Assigned Builder</span>
                                        <span className="font-bold text-slate-300 capitalize">@{selectedTask.assigned_to_username || "Unassigned"}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Due Date</span>
                                        <span className="font-bold text-slate-300 flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-slate-500" /> {selectedTask.due_date || "No deadline"}
                                        </span>
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <div className="pt-2 space-y-4">
                                    <h4 className="text-[9px] font-bold uppercase text-slate-500 tracking-wider font-display">Discussion Log</h4>

                                    <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                                        {loadingComments ? (
                                            <div className="text-center py-4 text-xs text-slate-500 animate-pulse">Loading discussion logs...</div>
                                        ) : comments.length === 0 ? (
                                            <div className="text-center py-6 text-xs text-slate-550 italic">No comments in this task log yet.</div>
                                        ) : (
                                            comments.map(c => (
                                                <div key={c.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
                                                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-semibold">
                                                        <span className="font-bold capitalize text-slate-400">{c.username || c.user_username}</span>
                                                        <span>{new Date(c.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-350 leading-relaxed">{c.comment}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Add Comment Form */}
                                    <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                                        <input
                                            type="text"
                                            required
                                            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-200 outline-none focus:border-brand-purple placeholder:text-slate-700"
                                            placeholder="Write to task log..."
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-800 rounded-xl cursor-pointer hover:text-white transition"
                                        >
                                            Post
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Teammate Rating & Review Modal */}
                {showRateModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-slate-900 shadow-2xl relative animate-scaleUp">
                            <button
                                onClick={() => setShowRateModal(false)}
                                className="absolute top-4.5 right-4.5 text-slate-500 hover:text-white cursor-pointer transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-lg font-bold text-white mb-5 font-display flex items-center gap-2">
                                <Award className="w-5 h-5 text-brand-purple animate-pulse" /> Rate Teammate
                            </h2>

                            <div className="mb-4">
                                <p className="text-xs text-slate-400">
                                    Submit performance ratings and constructive feedback for <span className="text-white font-bold capitalize">@{rateUsername}</span>.
                                    This will directly update their Skill and Role Reputation scores.
                                </p>
                            </div>

                            <form onSubmit={handleSubmitRate} className="space-y-4">
                                {renderStarRating("Technical Execution", techRating, setTechRating)}
                                {renderStarRating("Communication & Sync", commRating, setCommRating)}
                                {renderStarRating("Collaboration & Teamwork", teamRating, setTeamRating)}
                                {renderStarRating("Deadline & Delivery", deadRating, setDeadRating)}

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Constructive Feedback</label>
                                    <textarea
                                        rows="3"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-955 border border-slate-900 text-xs text-slate-100 outline-none focus:border-brand-purple placeholder:text-slate-700"
                                        placeholder="Detail their contributions, strengths, and areas of growth..."
                                        value={rateFeedback}
                                        onChange={(e) => setRateFeedback(e.target.value)}
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-900 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowRateModal(false)}
                                        className="px-4 py-2 rounded-xl bg-slate-900 text-slate-450 border border-slate-800 text-xs font-bold transition hover:text-white cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingRate}
                                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-95 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50 glow-btn"
                                    >
                                        {submittingRate ? "Submitting..." : "Submit Review"}
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

const renderStarRating = (label, value, onChange) => {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                <span className="text-xs font-black text-brand-purple">{value} / 5</span>
            </div>
            <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(star => {
                    const isActive = star <= value;
                    return (
                        <button
                            key={star}
                            type="button"
                            onClick={() => onChange(star)}
                            className={`p-0.5 hover:scale-110 transition cursor-pointer ${
                                isActive ? "text-amber-400" : "text-slate-800 hover:text-slate-650"
                            }`}
                        >
                            <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ProjectWorkspace;

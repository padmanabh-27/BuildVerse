import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { useToast } from "../context/ToastContext";
import { BoardSkeleton } from "../components/Skeletons";

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
            fetchOverviewData(projRes.data);
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

    const fetchOverviewData = async (projData) => {
        try {
            const [membersRes, rolesRes, skillsRes] = await Promise.all([
                api.get(`projects/${id}/members/`),
                api.get(`projects/${id}/roles/`),
                api.get(`projects/${id}/skills/`)
            ]);
            setMembers(membersRes.data);
            setRoles(rolesRes.data);
            setSkills(skillsRes.data);

            if (projData.creator_username === myUsername) {
                const requestsRes = await api.get(`projects/${id}/requests/`);
                setJoinRequests(requestsRes.data);
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
            await api.post(`tasks/project/${id}/`, {
                title: taskTitle,
                description: taskDesc,
                assigned_to_id: taskAssignedTo ? parseInt(taskAssignedTo) : null,
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

    // --- Chat Actions ---
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const msgText = chatInput.trim();
        setChatInput(""); // Clear immediately for UX

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
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    const isCreator = project?.creator_username === myUsername;

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fadeIn h-full flex flex-col">
                {/* Project workspace Header */}
                <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-200 pb-5">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider capitalize">
                                {project?.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black capitalize ${
                                project?.status === "recruiting" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                project?.status === "in_progress" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            }`}>
                                {project?.status.replace("_", " ")}
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 capitalize">{project?.title}</h1>
                    </div>
                    {isCreator && project?.status !== "completed" && (
                        <button
                            onClick={handleCompleteProject}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold rounded-lg text-white shadow active:scale-[0.98] transition cursor-pointer"
                        >
                            🏆 Mark Completed
                        </button>
                    )}
                </div>

                {/* Workspace Navigation Tabs */}
                <div className="flex gap-1 border-b border-slate-200">
                    {[
                        { id: "overview", label: "Overview & Team" },
                        { id: "tasks", label: "Task Board" },
                        { id: "docs", label: "Documents Hub" },
                        { id: "chat", label: "Team Chat" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-3 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
                                activeTab === tab.id
                                    ? "text-blue-600 border-blue-500 bg-blue-50/30"
                                    : "text-slate-500 border-transparent hover:text-slate-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Contents */}
                <div className="flex-1 min-h-0">
                    {/* OVERVIEW TAB */}
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Project description pane */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Mission Statement</h3>
                                    <p className="text-slate-655 text-sm leading-relaxed whitespace-pre-wrap">{project?.description}</p>
                                    
                                    {project?.github_repo_url && (
                                        <div className="pt-2">
                                            <a
                                                href={project.github_repo_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-500"
                                            >
                                                🔗 Access GitHub Repository
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Skills and Roles managers */}
                                {isCreator && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {/* Roles defined */}
                                        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                                            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Workspace Roles</h3>
                                            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                                {roles.length === 0 ? (
                                                    <p className="text-[10px] text-slate-450 italic py-2">No custom roles defined yet.</p>
                                                ) : (
                                                    roles.map(r => (
                                                        <div key={r.id} className="flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                            <span className="capitalize text-slate-700 font-semibold">{r.role_name} ({r.slots_required} slots)</span>
                                                            <button onClick={() => handleDeleteRole(r.id)} className="text-rose-500 hover:text-rose-600 font-bold cursor-pointer">✕</button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <form onSubmit={handleAddRole} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    required
                                                    className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-350 text-xs text-slate-800"
                                                    placeholder="Role Name"
                                                    value={newRoleName}
                                                    onChange={e => setNewRoleName(e.target.value)}
                                                />
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="w-12 px-2 py-1.5 rounded-lg bg-white border border-slate-350 text-xs text-slate-800"
                                                    value={newRoleSlots}
                                                    onChange={e => setNewRoleSlots(e.target.value)}
                                                />
                                                <button type="submit" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold text-white cursor-pointer">+</button>
                                            </form>
                                        </div>

                                        {/* Skills defined */}
                                        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                                            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Required Skills</h3>
                                            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                                {skills.length === 0 ? (
                                                    <p className="text-[10px] text-slate-455 italic py-2">No skill requirements set yet.</p>
                                                ) : (
                                                    skills.map(s => (
                                                        <div key={s.id} className="flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                            <span className="capitalize text-slate-700 font-semibold">{s.skill_name} ({s.minimum_experience_years}+y)</span>
                                                            <button onClick={() => handleDeleteSkill(s.id)} className="text-rose-500 hover:text-rose-600 font-bold cursor-pointer">✕</button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <form onSubmit={handleAddSkill} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    required
                                                    className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-350 text-xs text-slate-800"
                                                    placeholder="Skill Name"
                                                    value={newSkillName}
                                                    onChange={e => setNewSkillName(e.target.value)}
                                                />
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    className="w-14 px-2 py-1.5 rounded-lg bg-white border border-slate-350 text-xs text-slate-800"
                                                    value={newSkillExp}
                                                    onChange={e => setNewSkillExp(e.target.value)}
                                                />
                                                <button type="submit" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold text-white cursor-pointer">+</button>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Team members & requests panel */}
                            <div className="space-y-6">
                                {/* Members List */}
                                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Team Roster</h3>
                                    <div className="space-y-2.5">
                                        {/* Creator details */}
                                        <div className="flex justify-between items-center bg-blue-50/40 p-2.5 rounded-xl border border-blue-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6.5 h-6.5 rounded-full bg-blue-650 flex items-center justify-center font-bold text-xs text-white capitalize">
                                                    {project?.creator_username[0]}
                                                </div>
                                                <span className="text-xs font-bold text-slate-800 capitalize">{project?.creator_username}</span>
                                            </div>
                                            <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-black uppercase">Creator</span>
                                        </div>

                                        {/* Other members */}
                                        {members.length === 0 ? (
                                            <p className="text-[11px] text-slate-450 italic py-2 text-center">No other teammates joined yet.</p>
                                        ) : (
                                            members.map(member => (
                                                <div key={member.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6.5 h-6.5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 capitalize">
                                                            {member.username[0]}
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-800 capitalize">{member.username}</span>
                                                    </div>
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold capitalize">{member.role_name}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Join Requests manager */}
                                {isCreator && (
                                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Join Applications</h3>
                                        <div className="space-y-3">
                                            {joinRequests.filter(r => r.status === "pending").length === 0 ? (
                                                <p className="text-[11px] text-slate-450 italic py-4 text-center">No pending requests.</p>
                                            ) : (
                                                joinRequests.filter(r => r.status === "pending").map(req => (
                                                    <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-slate-750 capitalize">{req.username}</span>
                                                            <span className="text-[9px] text-slate-400">{new Date(req.requested_at).toLocaleDateString()}</span>
                                                        </div>
                                                        {/* Role assignment dropdown */}
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1.5">Assign Role</label>
                                                            <select
                                                                className="w-full px-2 py-1 rounded bg-white border border-slate-350 text-slate-800 text-[10px] outline-none cursor-pointer"
                                                                value={selectedRoleForRequest[req.id] || ""}
                                                                onChange={e => setSelectedRoleForRequest(prev => ({ ...prev, [req.id]: e.target.value }))}
                                                            >
                                                                <option value="">Select role...</option>
                                                                {roles.map(role => (
                                                                    <option key={role.id} value={role.id}>{role.role_name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        {/* Action Buttons */}
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleAcceptRequest(req.id)}
                                                                className="flex-1 py-1 rounded bg-blue-600 hover:bg-blue-700 text-[10px] font-bold text-white transition cursor-pointer"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectRequest(req.id)}
                                                                className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200 hover:bg-slate-200 cursor-pointer"
                                                            >
                                                                Reject
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
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg text-white shadow active:scale-[0.98] transition cursor-pointer"
                                    >
                                        + Add Task
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
                                        <div key={col.id} className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col h-full min-h-[400px] shadow-sm">
                                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                                                <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full ${
                                                        col.id === "todo" ? "bg-slate-400" :
                                                        col.id === "in_progress" ? "bg-blue-500" : "bg-emerald-500"
                                                    }`}></span>
                                                    {col.label}
                                                </h3>
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                                                    {colTasks.length}
                                                </span>
                                            </div>

                                            <div className="space-y-3.5 overflow-y-auto flex-1 pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                                {colTasks.map(task => (
                                                    <div
                                                        key={task.id}
                                                        onClick={() => handleOpenTaskComments(task)}
                                                        className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-350 hover:shadow-md transition cursor-pointer relative group space-y-3"
                                                    >
                                                        <div className="flex justify-between items-start gap-1">
                                                            <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition line-clamp-1">{task.title}</h4>
                                                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                                                                task.priority === "high" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                                                task.priority === "medium" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                                                "bg-slate-100 text-slate-500 border border-slate-200"
                                                            }`}>
                                                                {task.priority}
                                                            </span>
                                                        </div>

                                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>

                                                        <div className="flex justify-between items-center text-[10px] pt-1">
                                                            <span className="text-slate-400">
                                                                {task.due_date ? `📅 ${task.due_date}` : "No due date"}
                                                            </span>
                                                            <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-bold capitalize">
                                                                {task.assigned_to_username ? `@${task.assigned_to_username}` : "Unassigned"}
                                                            </span>
                                                        </div>

                                                        {/* Status Controls */}
                                                        <div className="flex justify-between items-center gap-1.5 pt-2 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition duration-200">
                                                            <div className="flex gap-1">
                                                                {col.id !== "todo" && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleUpdateTaskStatus(task.id, col.id === "completed" ? "in_progress" : "todo");
                                                                        }}
                                                                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[9px] font-bold text-slate-600 border border-slate-200 cursor-pointer"
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
                                                                        className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 rounded text-[9px] font-bold text-blue-600 border border-blue-100 cursor-pointer"
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
                                                                    className="text-rose-500 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                                                                    title="Delete Task"
                                                                >
                                                                    🗑️
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
                                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                                    <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Asset Uploader</h3>
                                    {isCreator ? (
                                        <form onSubmit={handleUploadDoc} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Document Title</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-4 py-2 rounded-lg bg-white border border-slate-350 text-xs text-slate-805 outline-none focus:border-blue-500"
                                                    placeholder="e.g. Spec Document"
                                                    value={docTitle}
                                                    onChange={e => setDocTitle(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Select Asset File</label>
                                                <input
                                                    type="file"
                                                    required
                                                    ref={fileInputRef}
                                                    className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                                                    onChange={e => setSelectedFile(e.target.files[0])}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={uploadingDoc}
                                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold text-white transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                                            >
                                                {uploadingDoc ? "Uploading..." : "Upload Document"}
                                            </button>
                                        </form>
                                    ) : (
                                        <p className="text-xs text-slate-450 italic">Only the project creator can upload project documents.</p>
                                    )}
                                </div>
                            </div>

                            {/* Documents list */}
                            <div className="lg:col-span-2">
                                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                                    <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Shared Assets</h3>
                                    <div className="space-y-3">
                                        {documents.length === 0 ? (
                                            <p className="text-xs text-slate-450 py-12 text-center italic">No documents shared inside workspace yet.</p>
                                        ) : (
                                            documents.map(doc => (
                                                <div key={doc.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-800">{doc.title}</h4>
                                                        <div className="flex gap-2 text-[10px] text-slate-450 pt-1">
                                                            <span>Uploaded by @{doc.uploaded_by_username}</span>
                                                            <span>•</span>
                                                            <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <a
                                                            href={`http://127.0.0.1:8000${doc.file}`}
                                                            download
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs font-bold text-blue-600 hover:text-blue-500"
                                                        >
                                                            📥 Download
                                                        </a>
                                                        {(isCreator || doc.uploaded_by_username === myUsername) && (
                                                            <button
                                                                onClick={() => handleDeleteDoc(doc.id)}
                                                                className="text-rose-600 hover:text-rose-700 text-xs font-semibold cursor-pointer"
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
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col h-[520px] shadow-sm">
                            {/* Messages area */}
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                {messages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                                        No messages sent yet. Start the discussion!
                                    </div>
                                ) : (
                                    messages.map((msg, index) => {
                                        const isMe = msg.sender_username === myUsername;
                                        return (
                                            <div key={msg.id || index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                                <div className="flex gap-1.5 items-center mb-1 text-[9px] text-slate-450">
                                                    <span className="font-bold capitalize">{msg.sender_username}</span>
                                                    <span>•</span>
                                                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className={`px-4 py-2 rounded-2xl text-xs max-w-sm ${
                                                    isMe
                                                        ? "bg-blue-600 text-white rounded-tr-none"
                                                        : "bg-slate-100 text-slate-700 border border-slate-200/60 rounded-tl-none"
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
                            <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-slate-150">
                                <input
                                    type="text"
                                    required
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-350 text-xs text-slate-800 outline-none focus:border-blue-500"
                                    placeholder="Type message here..."
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition active:scale-[0.98] cursor-pointer"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Create Task Modal */}
                {showTaskModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl relative animate-scaleUp">
                            <button
                                onClick={() => setShowTaskModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 cursor-pointer"
                            >
                                ✕
                            </button>
                            <h2 className="text-lg font-bold text-slate-805 mb-6">Create New Task</h2>

                            <form onSubmit={handleCreateTask} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Task Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-xs text-slate-800"
                                        placeholder="e.g. Build API endpoints"
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Description</label>
                                    <textarea
                                        rows="3"
                                        required
                                        className="w-full px-4 py-2 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-xs text-slate-850 placeholder:text-slate-405"
                                        placeholder="Outline task details..."
                                        value={taskDesc}
                                        onChange={(e) => setTaskDesc(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Assign To</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg bg-white border border-slate-350 text-slate-800 text-xs focus:border-blue-500 outline-none cursor-pointer"
                                        value={taskAssignedTo}
                                        onChange={e => setTaskAssignedTo(e.target.value)}
                                    >
                                        <option value="">Unassigned</option>
                                        {/* Creator option */}
                                        <option value="creator">@{project?.creator_username} (Creator)</option>
                                        {/* Members */}
                                        {members.map(member => (
                                            <option key={member.user} value={member.user}>@{member.username}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Priority</label>
                                        <select
                                            className="w-full px-4 py-2 rounded-lg bg-white border border-slate-350 text-slate-800 text-xs focus:border-blue-500 outline-none cursor-pointer"
                                            value={taskPriority}
                                            onChange={(e) => setTaskPriority(e.target.value)}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Due Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2 rounded-lg bg-white border border-slate-350 text-slate-800 text-xs focus:border-blue-500 outline-none cursor-pointer"
                                            value={taskDueDate}
                                            onChange={e => setTaskDueDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowTaskModal(false)}
                                        className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creatingTask}
                                        className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-755 text-white text-xs font-bold transition cursor-pointer"
                                    >
                                        {creatingTask ? "Creating..." : "Add Task"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Task Detail and Comments modal */}
                {selectedTask && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-lg p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl relative animate-scaleUp max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                ✕
                            </button>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-start gap-1 pb-3 border-b border-slate-100">
                                    <div>
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase inline-block mb-1.5 ${
                                            selectedTask.priority === "high" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                            selectedTask.priority === "medium" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                            "bg-slate-100 text-slate-500 border border-slate-200"
                                        }`}>
                                            {selectedTask.priority} Priority
                                        </span>
                                        <h3 className="text-base font-extrabold text-slate-800 capitalize">{selectedTask.title}</h3>
                                    </div>
                                    <span className="text-[10px] text-slate-500 bg-slate-150 border border-slate-200 px-2.5 py-1 rounded-full font-bold capitalize">
                                        Status: {selectedTask.status.replace("_", " ")}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Description</span>
                                    <p className="text-xs text-slate-650 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">{selectedTask.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-b border-slate-100 pb-3">
                                    <div>
                                        <span className="text-slate-450 block">Assigned Builder</span>
                                        <span className="font-bold text-slate-700 capitalize">@{selectedTask.assigned_to_username || "Unassigned"}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-450 block">Due Date</span>
                                        <span className="font-bold text-slate-700">{selectedTask.due_date || "No due date"}</span>
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <div className="pt-2 space-y-4">
                                    <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Comments Log</h4>

                                    <div className="space-y-3.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                        {loadingComments ? (
                                            <div className="text-center py-4 text-xs text-slate-450">Loading comments...</div>
                                        ) : comments.length === 0 ? (
                                            <div className="text-center py-6 text-xs text-slate-400 italic">No comments posted yet.</div>
                                        ) : (
                                            comments.map(c => (
                                                <div key={c.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                                                    <div className="flex justify-between items-center text-[9px] text-slate-450">
                                                        <span className="font-bold capitalize">{c.username || c.user_username}</span>
                                                        <span>{new Date(c.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-650 leading-relaxed">{c.comment}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Add Comment form */}
                                    <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                                        <input
                                            type="text"
                                            required
                                            className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-350 text-xs text-slate-800 outline-none focus:border-blue-500"
                                            placeholder="Write comments..."
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg cursor-pointer"
                                        >
                                            Post
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default ProjectWorkspace;

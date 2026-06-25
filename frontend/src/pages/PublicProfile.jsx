import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { useToast } from "../context/ToastContext";
import { 
    ArrowLeft,
    Award, 
    Sparkles, 
    MapPin, 
    Github, 
    Linkedin, 
    Mail, 
    TrendingUp, 
    Send, 
    FolderGit2, 
    MessageSquare,
    UserCheck,
    CheckCircle2
} from "lucide-react";

function PublicProfile() {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [myProjects, setMyProjects] = useState([]);
    const [myUsername, setMyUsername] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchPublicProfile();
    }, [userId]);

    const fetchPublicProfile = async () => {
        setLoading(true);
        try {
            // Fetch public profile details
            const profileRes = await api.get(`profile/user/${userId}/`);
            setProfile(profileRes.data);

            // Fetch reviews received by this user
            const reviewsRes = await api.get(`reviews/user/${userId}/`);
            setReviews(reviewsRes.data);

            // Fetch my projects (to populate invite dropdown)
            const [projectsRes, myProfileRes] = await Promise.all([
                api.get("projects/"),
                api.get("profile/details/")
            ]);
            setMyUsername(myProfileRes.data.username);

            // Filter projects where I am the creator
            const ownedProjects = projectsRes.data.filter(
                p => p.creator_username === myProfileRes.data.username
            );
            setMyProjects(ownedProjects);
            if (ownedProjects.length > 0) {
                setSelectedProjectId(ownedProjects[0].id);
            }
        } catch (error) {
            console.error("Error loading public profile:", error);
            showToast("Failed to load profile.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSendInvitation = async (e) => {
        e.preventDefault();
        if (!selectedProjectId) {
            showToast("Please select a project to invite them to.", "error");
            return;
        }

        setInviting(true);
        try {
            const response = await api.post(`projects/${selectedProjectId}/invite/${userId}/`);
            showToast(response.data.message || "Invitation sent successfully! ✉️");
        } catch (error) {
            console.error("Error sending invitation:", error);
            showToast(error.response?.data?.error || "Failed to send invitation.", "error");
        } finally {
            setInviting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col justify-center items-center h-96 gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-purple border-t-transparent"></div>
                    <p className="text-xs text-slate-500 font-bold tracking-wider animate-pulse">Loading Builder Profile...</p>
                </div>
            </DashboardLayout>
        );
    }

    const isSelf = profile?.username === myUsername;

    // Calculate rating averages
    const averageRating = reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + (r.technical_rating + r.communication_rating + r.teamwork_rating + r.deadline_rating) / 4, 0) / reviews.length).toFixed(2)
        : null;

    // Generate credentials badges
    const getDeveloperBadges = () => {
        const badges = [];
        badges.push({ name: "Verified", desc: "Identity Authenticated", color: "bg-blue-950/40 text-blue-400 border-blue-500/20" });
        if (profile?.experience_years >= 3 || reviews.length > 0) {
            badges.push({ name: "Top Contributor", desc: "High Rating Score", color: "bg-purple-950/40 text-purple-400 border-purple-500/20" });
        }
        if (profile?.skills?.length > 3 || profile?.username === "john") {
            badges.push({ name: "AI Expert", desc: "Matches NLP Weightings", color: "bg-indigo-950/40 text-indigo-400 border-indigo-500/20" });
        }
        if (profile?.username === "alice") {
            badges.push({ name: "Project Leader", desc: "Coordinates Workspaces", color: "bg-pink-950/40 text-pink-400 border-pink-500/20" });
        }
        badges.push({ name: "Reviewer", desc: "Collaborative Feedback", color: "bg-slate-900 text-slate-400 border-slate-800" });
        return badges;
    };

    const devBadges = getDeveloperBadges();

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fadeIn pb-10">
                {/* Back Link */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Link to="/search" className="flex items-center gap-1 hover:text-white transition">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Discover
                    </Link>
                </div>

                {/* Profile Banner */}
                <div className="p-6 md:p-8 rounded-2xl glass-panel border border-slate-900 shadow-xl flex items-start gap-6 flex-wrap md:flex-nowrap relative overflow-hidden">
                    <div className="absolute top-[-30%] left-[-10%] w-[250px] h-[250px] bg-brand-blue/5 rounded-full blur-[60px] pointer-events-none animate-pulseGlow"></div>
                    
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center font-bold text-2xl text-white capitalize shrink-0 shadow-lg relative z-10">
                        {profile?.username ? profile.username[0] : "?"}
                    </div>

                    <div className="flex-1 space-y-4 relative z-10 w-full">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <h1 className="text-2xl font-black text-white tracking-tight capitalize flex items-center gap-2.5 font-display">
                                    {profile?.username}
                                    {profile?.is_available && (
                                        <span className="text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg font-bold tracking-wider uppercase">
                                            Open Collab
                                        </span>
                                    )}
                                </h1>
                                <p className="text-slate-500 text-xs font-semibold block mt-0.5">Verified Platform Builder</p>
                            </div>

                            {/* Contact Badges */}
                            <div className="flex gap-2 flex-wrap text-xs">
                                {profile?.github_url && (
                                    <a
                                        href={profile.github_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold rounded-xl transition flex items-center gap-1 hover:text-white"
                                    >
                                        <Github className="w-3.5 h-3.5 text-slate-450" /> GitHub
                                    </a>
                                )}
                                {profile?.linkedin_url && (
                                    <a
                                        href={profile.linkedin_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold rounded-xl transition flex items-center gap-1 hover:text-white"
                                    >
                                        <Linkedin className="w-3.5 h-3.5 text-slate-450" /> LinkedIn
                                    </a>
                                )}
                                {profile?.email && (
                                    <a
                                        href={`mailto:${profile.email}`}
                                        className="px-3.5 py-2 bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold rounded-xl shadow-md shadow-brand-blue/15 hover:opacity-95 transition flex items-center gap-1 glow-btn"
                                    >
                                        <Mail className="w-3.5 h-3.5" /> Email
                                    </a>
                                )}
                            </div>
                        </div>

                        <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">{profile?.bio || "This builder hasn't set up their bio details yet."}</p>
                    </div>
                </div>

                {/* Credential Badges */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-900 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                        <Award className="w-4 h-4 text-brand-purple animate-pulse" />
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Credential Badges</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {devBadges.map((badge, idx) => (
                            <div 
                                key={idx} 
                                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition hover:scale-[1.01] ${badge.color}`}
                            >
                                <Award className="w-5 h-5" />
                                <span className="text-[10px] font-extrabold uppercase tracking-wider">{badge.name}</span>
                                <span className="text-[8px] text-slate-500 font-semibold">{badge.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (Performance & Invite) */}
                    <div className="space-y-6">
                        {/* Builder Metrics */}
                        <div className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-slate-900 pb-3 flex items-center gap-2 font-display">
                                <TrendingUp className="w-4.5 h-4.5 text-brand-blue" /> Builder Analytics
                            </h3>
                            <div className="space-y-3.5 text-xs font-semibold">
                                {profile?.experience_years !== undefined && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Platform Experience</span>
                                        <span className="text-slate-300">{profile?.experience_years} Years</span>
                                    </div>
                                )}
                                {profile?.projects_joined !== undefined && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Active Collaborations</span>
                                        <span className="text-slate-300">{profile?.projects_joined} Projects</span>
                                    </div>
                                )}
                                {profile?.tasks_completed !== undefined && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Shipped Tasks</span>
                                        <span className="text-slate-300">{profile?.tasks_completed} Milestones</span>
                                    </div>
                                )}
                                {profile?.role_reputations !== undefined && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Overall Score</span>
                                        <span className="text-amber-400 flex items-center gap-0.5">
                                            {averageRating ? `⭐ ${averageRating} (${reviews.length} reviews)` : "No reviews"}
                                        </span>
                                    </div>
                                )}
                                {profile?.city && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Local Area</span>
                                        <span className="text-slate-300 truncate max-w-[120px]">{profile.city}, {profile.country}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Invite to Workspace (Creator only) */}
                        {!isSelf && myProjects.length > 0 && (
                            <div className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                                <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-slate-900 pb-3 flex items-center gap-2 font-display">
                                    <FolderGit2 className="w-4.5 h-4.5 text-brand-purple" /> Recruit for Workspace
                                </h3>
                                <p className="text-xs text-slate-450 leading-relaxed">Send an invitation request to collaborate on one of your managed projects.</p>
                                
                                <form onSubmit={handleSendInvitation} className="space-y-3.5 pt-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1.5 tracking-wider">Select Project</label>
                                        <select
                                            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-300 outline-none focus:border-brand-purple cursor-pointer"
                                            value={selectedProjectId}
                                            onChange={e => setSelectedProjectId(e.target.value)}
                                        >
                                            {myProjects.map(project => (
                                                <option key={project.id} value={project.id} className="bg-slate-950">{project.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={inviting}
                                        className="w-full py-2.5 bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-95 text-xs font-bold rounded-xl text-white transition active:scale-[0.98] cursor-pointer disabled:opacity-50 glow-btn"
                                    >
                                        {inviting ? "Sending invite..." : "Send Invite Request"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Skills & Reviews Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Skills */}
                        {profile?.skills !== undefined && (
                            <div className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                                <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-slate-900 pb-3 font-display">🛠️ Tech Stack</h3>
                                <div className="flex gap-2 flex-wrap pt-1.5">
                                    {profile?.skills.length === 0 ? (
                                        <span className="text-xs text-slate-500 italic py-2">No skills registered on profile yet.</span>
                                    ) : (
                                        profile?.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="bg-slate-905 border border-slate-900 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold"
                                            >
                                                {skill}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reviews list */}
                        {profile?.role_reputations !== undefined && (
                            <div className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                                <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-slate-900 pb-3 font-display">⭐ Teammate Feedback</h3>
                                <div className="space-y-3.5">
                                    {reviews.length === 0 ? (
                                        <p className="text-xs text-slate-500 italic text-center py-6">No feedback logged yet.</p>
                                    ) : (
                                        reviews.map((review) => {
                                            const avg = (review.technical_rating + review.communication_rating + review.teamwork_rating + review.deadline_rating) / 4;
                                            return (
                                                <div key={review.id} className="p-4 bg-slate-950/40 rounded-xl border border-slate-900 space-y-2">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="font-bold text-slate-300 flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-brand-blue" /> Reviewed by @{review.reviewer_username}</span>
                                                        <span className="text-amber-400 font-bold flex items-center gap-0.5">⭐ {avg.toFixed(1)}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 italic leading-relaxed">"{review.comment}"</p>
                                                    
                                                    {/* Ratings grid */}
                                                    <div className="grid grid-cols-4 gap-2 text-[9px] text-slate-550 pt-1.5 border-t border-slate-900/60 font-semibold uppercase tracking-wider">
                                                        <span>Tech: {review.technical_rating}/5</span>
                                                        <span>Comm: {review.communication_rating}/5</span>
                                                        <span>Team: {review.teamwork_rating}/5</span>
                                                        <span>Dead: {review.deadline_rating}/5</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default PublicProfile;

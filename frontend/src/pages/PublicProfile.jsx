import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { useToast } from "../context/ToastContext";

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
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    const isSelf = profile?.username === myUsername;

    // Calculate rating averages
    const averageRating = reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + (r.technical_rating + r.communication_rating + r.teamwork_rating + r.deadline_rating) / 4, 0) / reviews.length).toFixed(2)
        : null;

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fadeIn">
                {/* Back Link */}
                <div>
                    <Link to="/matching" className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1">
                        ← Back to AI Matching
                    </Link>
                </div>

                {/* Profile Banner */}
                <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-6 flex-wrap md:flex-nowrap">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center font-bold text-2xl text-white capitalize shrink-0 shadow-md">
                        {profile?.username ? profile.username[0] : "?"}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight capitalize flex items-center gap-2.5">
                                    {profile?.username}
                                    {profile?.is_available && (
                                        <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded font-black tracking-wider uppercase">
                                            Available
                                        </span>
                                    )}
                                </h1>
                                <p className="text-slate-500 text-xs">Verified Platform Builder</p>
                            </div>

                            {/* Contact Badges */}
                            <div className="flex gap-2">
                                {profile?.github_url && (
                                    <a
                                        href={profile.github_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 font-semibold rounded-lg transition"
                                    >
                                        GitHub 🔗
                                    </a>
                                )}
                                {profile?.linkedin_url && (
                                    <a
                                        href={profile.linkedin_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 font-semibold rounded-lg transition"
                                    >
                                        LinkedIn 🔗
                                    </a>
                                )}
                                {profile?.email && (
                                    <a
                                        href={`mailto:${profile.email}`}
                                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-xs text-white font-semibold rounded-lg shadow-sm transition"
                                    >
                                        Email Builder ✉️
                                    </a>
                                )}
                            </div>
                        </div>

                        <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">{profile?.bio || "This builder hasn't set up their bio details yet."}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stats & Invite Column */}
                    <div className="space-y-6">
                        {/* Builder Metrics */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <span>📈</span> Performance Stats
                            </h3>
                            <div className="space-y-3.5 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-medium">Platform Experience</span>
                                    <span className="font-bold text-slate-800">{profile?.experience_years} years</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-medium">Projects Collaborated</span>
                                    <span className="font-bold text-slate-800">{profile?.projects_joined} projects</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-medium">Tasks Completed</span>
                                    <span className="font-bold text-slate-800">{profile?.tasks_completed} tasks</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-medium">Overall Rating</span>
                                    <span className="font-bold text-amber-500">
                                        {averageRating ? `⭐ ${averageRating} (${reviews.length} reviews)` : "No ratings"}
                                    </span>
                                </div>
                                {profile?.city && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-medium">Location</span>
                                        <span className="font-bold text-slate-800 truncate max-w-[120px]">{profile.city}, {profile.country}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Invite Workspace form (Creator only) */}
                        {!isSelf && myProjects.length > 0 && (
                            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                                    <span>✉️</span> Recruit for Project
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed">Invite this matched talent to collaborate on one of your workspaces.</p>
                                
                                <form onSubmit={handleSendInvitation} className="space-y-3 pt-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Select Workspace</label>
                                        <select
                                            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-350 text-xs text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
                                            value={selectedProjectId}
                                            onChange={e => setSelectedProjectId(e.target.value)}
                                        >
                                            {myProjects.map(project => (
                                                <option key={project.id} value={project.id}>{project.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={inviting}
                                        className="w-full py-2 bg-blue-600 hover:bg-blue-750 text-xs font-bold rounded-lg text-white transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                                    >
                                        {inviting ? "Sending invite..." : "Send Invitation"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Skills & Reviews Columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Skills chips */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">🛠️ Builder Skills</h3>
                            <div className="flex gap-2 flex-wrap pt-1">
                                {profile?.skills.length === 0 ? (
                                    <span className="text-xs text-slate-400 italic">No skills listed</span>
                                ) : (
                                    profile?.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100"
                                        >
                                            {skill}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Teammate Reviews list */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">⭐ Teammate Reviews</h3>
                            <div className="space-y-3">
                                {reviews.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic text-center py-6">No reviews received yet</p>
                                ) : (
                                    reviews.map((review) => {
                                        const avg = (review.technical_rating + review.communication_rating + review.teamwork_rating + review.deadline_rating) / 4;
                                        return (
                                            <div key={review.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-bold text-slate-700">Reviewed by @{review.reviewer_username}</span>
                                                    <span className="text-amber-500 font-bold">⭐ {avg.toFixed(1)}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 italic">"{review.comment}"</p>
                                                
                                                {/* Ratings grid */}
                                                <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-200/40">
                                                    <span>Tech: {review.technical_rating}/5</span>
                                                    <span>Comm: {review.communication_rating}/5</span>
                                                    <span>Team: {review.teamwork_rating}/5</span>
                                                    <span>Deadline: {review.deadline_rating}/5</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default PublicProfile;

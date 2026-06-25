import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { useToast } from "../context/ToastContext";
import { 
    User, 
    Award, 
    Sparkles, 
    MapPin, 
    Github, 
    Linkedin, 
    Clock, 
    Sliders, 
    Cpu, 
    Trash2, 
    MessageSquare,
    Save,
    ShieldAlert,
    X
} from "lucide-react";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [skillsList, setSkillsList] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Profile Edit Fields
    const [bio, setBio] = useState("");
    const [country, setCountry] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [timezone, setTimezone] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [experienceYears, setExperienceYears] = useState(0);
    const [isAvailable, setIsAvailable] = useState(true);

    // Privacy / Visibility Settings
    const [showEmail, setShowEmail] = useState(false);
    const [showGithub, setShowGithub] = useState(true);
    const [showLinkedin, setShowLinkedin] = useState(true);
    const [showBio, setShowBio] = useState(true);
    const [showLocation, setShowLocation] = useState(true);
    const [showExperience, setShowExperience] = useState(true);
    const [showAvailability, setShowAvailability] = useState(true);
    const [showSkills, setShowSkills] = useState(true);
    const [showReputation, setShowReputation] = useState(true);
    const [showStats, setShowStats] = useState(true);

    // New Skill Fields
    const [newSkillName, setNewSkillName] = useState("");
    const [newSkillExp, setNewSkillExp] = useState(1);

    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [addingSkill, setAddingSkill] = useState(false);

    useEffect(() => {
        fetchProfileAndSkills();
    }, []);

    const fetchProfileAndSkills = async () => {
        setLoading(true);
        try {
            const profileRes = await api.get("profile/details/");
            setProfile(profileRes.data);
            
            // Set edit fields
            setBio(profileRes.data.bio || "");
            setCountry(profileRes.data.country || "");
            setState(profileRes.data.state || "");
            setCity(profileRes.data.city || "");
            setTimezone(profileRes.data.timezone || "");
            setGithubUrl(profileRes.data.github_url || "");
            setLinkedinUrl(profileRes.data.linkedin_url || "");
            setExperienceYears(profileRes.data.experience_years || 0);
            setIsAvailable(profileRes.data.is_available);

            // Fetch user portfolio privacy settings
            try {
                const portfolioRes = await api.get("portfolio/");
                setShowEmail(portfolioRes.data.show_email);
                setShowGithub(portfolioRes.data.show_github);
                setShowLinkedin(portfolioRes.data.show_linkedin);
                setShowBio(portfolioRes.data.show_bio);
                setShowLocation(portfolioRes.data.show_location);
                setShowExperience(portfolioRes.data.show_experience);
                setShowAvailability(portfolioRes.data.show_availability);
                setShowSkills(portfolioRes.data.show_skills);
                setShowReputation(portfolioRes.data.show_reputation);
                setShowStats(portfolioRes.data.show_stats);
            } catch (err) {
                console.error("Error loading portfolio settings:", err);
            }

            // Fetch user skills
            const skillsRes = await api.get("skills/");
            setSkillsList(skillsRes.data);

            // Fetch user reviews
            if (profileRes.data.user) {
                const reviewsRes = await api.get(`reviews/user/${profileRes.data.user}/`);
                setReviews(reviewsRes.data);
            }
        } catch (error) {
            console.error("Error loading profile details:", error);
            showToast("Failed to load profile.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdatingProfile(true);
        try {
            const [profileRes] = await Promise.all([
                api.put("profile/details/", {
                    bio,
                    country,
                    state,
                    city,
                    timezone,
                    github_url: githubUrl,
                    linkedin_url: linkedinUrl,
                    experience_years: parseFloat(experienceYears),
                    is_available: isAvailable
                }),
                api.patch("portfolio/", {
                    show_email: showEmail,
                    show_github: showGithub,
                    show_linkedin: showLinkedin,
                    show_bio: showBio,
                    show_location: showLocation,
                    show_experience: showExperience,
                    show_availability: showAvailability,
                    show_skills: showSkills,
                    show_reputation: showReputation,
                    show_stats: showStats
                })
            ]);
            setProfile(profileRes.data);
            showToast("Profile identity and privacy controls updated successfully! 🎉");
        } catch (error) {
            console.error("Error updating profile:", error);
            showToast("Failed to save profile changes.", "error");
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        if (!newSkillName.trim()) return;

        setAddingSkill(true);
        try {
            await api.post("skills/", {
                skill_name: newSkillName.trim(),
                experience_years: parseFloat(newSkillExp)
            });
            
            // Refresh skills list
            const skillsRes = await api.get("skills/");
            setSkillsList(skillsRes.data);
            setNewSkillName("");
            setNewSkillExp(1);
            showToast(`Skill '${newSkillName.trim()}' added!`);
        } catch (error) {
            console.error("Error adding skill:", error);
            showToast("Failed to add skill.", "error");
        } finally {
            setAddingSkill(false);
        }
    };

    const handleDeleteSkill = async (userSkillId, name) => {
        if (!window.confirm(`Remove skill '${name}'?`)) return;
        try {
            await api.delete(`skills/${userSkillId}/`);
            setSkillsList(prev => prev.filter(s => s.id !== userSkillId));
            showToast(`Skill '${name}' removed.`);
        } catch (error) {
            console.error("Error removing skill:", error);
            showToast("Failed to remove skill.", "error");
        }
    };

    // Calculate premium badges to display dynamically
    const getMyBadges = () => {
        const badges = [];
        badges.push({ name: "Verified", desc: "Identity Authenticated", color: "bg-blue-950/40 text-blue-400 border-blue-500/20" });
        if (experienceYears >= 3 || reviews.length > 0) {
            badges.push({ name: "Top Contributor", desc: "High Rating Score", color: "bg-purple-950/40 text-purple-400 border-purple-500/20" });
        }
        if (skillsList.length > 3 || profile?.username === "john") {
            badges.push({ name: "AI Expert", desc: "Matches NLP Weightings", color: "bg-indigo-950/40 text-indigo-400 border-indigo-500/20" });
        }
        if (profile?.username === "alice") {
            badges.push({ name: "Project Leader", desc: "Coordinates Workspaces", color: "bg-pink-950/40 text-pink-400 border-pink-500/20" });
        }
        badges.push({ name: "Reviewer", desc: "Collaborative Feedback", color: "bg-slate-900 text-slate-400 border-slate-800" });
        return badges;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col justify-center items-center h-96 gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-purple border-t-transparent"></div>
                    <p className="text-xs text-slate-500 font-bold tracking-wider animate-pulse">Retreiving Builder Records...</p>
                </div>
            </DashboardLayout>
        );
    }

    const myBadges = getMyBadges();

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fadeIn pb-10">
                {/* Premium Badges Row */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-900 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                        <Award className="w-4.5 h-4.5 text-brand-purple" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest font-display">My Credential Badges</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                        {myBadges.map((badge, idx) => (
                            <div 
                                key={idx} 
                                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition hover:scale-[1.02] ${badge.color}`}
                            >
                                <Award className="w-6 h-6 animate-pulse" />
                                <span className="text-xs font-extrabold uppercase tracking-wider">{badge.name}</span>
                                <span className="text-[9px] text-slate-450 font-semibold">{badge.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Specifications Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-5">
                            <h2 className="text-xs font-bold text-white uppercase tracking-widest font-display flex items-center gap-2 pb-3.5 border-b border-slate-900/60">
                                <User className="w-4.5 h-4.5 text-brand-blue" /> Profile Specifications
                            </h2>

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider font-display">
                                        About Me / Bio
                                    </label>
                                    <textarea
                                        rows="4"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 focus:border-brand-purple outline-none transition text-slate-200 placeholder:text-slate-700 text-xs leading-relaxed"
                                        placeholder="Explain your technical expertise, builder goals, and what you ship..."
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider font-display">
                                            Experience (Years)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-955 border border-slate-900 focus:border-brand-purple outline-none text-xs text-slate-205"
                                            value={experienceYears}
                                            onChange={(e) => setExperienceYears(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider font-display">
                                            Timezone
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-955 border border-slate-900 focus:border-brand-purple outline-none text-xs text-slate-205"
                                            placeholder="e.g. UTC, GMT+5:30"
                                            value={timezone}
                                            onChange={(e) => setTimezone(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider font-display">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-955 border border-slate-900 focus:border-brand-purple outline-none text-xs text-slate-205"
                                            placeholder="e.g. India"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider font-display">
                                            State / Province
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-955 border border-slate-900 focus:border-brand-purple outline-none text-xs text-slate-205"
                                            placeholder="e.g. Karnataka"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider font-display">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-955 border border-slate-900 focus:border-brand-purple outline-none text-xs text-slate-205"
                                            placeholder="e.g. Bangalore"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider font-display flex items-center gap-1.5">
                                            <Github className="w-3.5 h-3.5 text-slate-400" /> GitHub Profile URL
                                        </label>
                                        <input
                                            type="url"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-955 border border-slate-900 focus:border-brand-purple outline-none text-xs text-slate-205 placeholder:text-slate-700"
                                            placeholder="https://github.com/handle"
                                            value={githubUrl}
                                            onChange={(e) => setGithubUrl(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider font-display flex items-center gap-1.5">
                                            <Linkedin className="w-3.5 h-3.5 text-slate-400" /> LinkedIn Profile URL
                                        </label>
                                        <input
                                            type="url"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-955 border border-slate-900 focus:border-brand-purple outline-none text-xs text-slate-205 placeholder:text-slate-700"
                                            placeholder="https://linkedin.com/in/handle"
                                            value={linkedinUrl}
                                            onChange={(e) => setLinkedinUrl(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center justify-between">
                                    <label className="inline-flex items-center gap-3 cursor-pointer text-xs text-slate-300">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-brand-purple bg-slate-950 border-slate-900 rounded focus:ring-0 cursor-pointer"
                                            checked={isAvailable}
                                            onChange={(e) => setIsAvailable(e.target.checked)}
                                        />
                                        <span>Open to team collaboration matching</span>
                                    </label>
                                </div>

                                {/* Profile Privacy & Visibility Settings */}
                                <div className="pt-5 border-t border-slate-900/60 space-y-4">
                                    <div>
                                        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                                            <Sliders className="w-4 h-4 text-brand-purple animate-pulse" /> Public Profile Visibility Controls
                                        </h3>
                                        <p className="text-[10px] text-slate-500 mt-1">Control what information is visible to other platform builders on your public identity page.</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1.5">
                                        <label className="inline-flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white transition">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-brand-purple bg-slate-950 border-slate-900 rounded focus:ring-0 cursor-pointer"
                                                checked={showEmail}
                                                onChange={(e) => setShowEmail(e.target.checked)}
                                            />
                                            <span>Expose Email Address</span>
                                        </label>
                                        <label className="inline-flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white transition">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-brand-purple bg-slate-950 border-slate-900 rounded focus:ring-0 cursor-pointer"
                                                checked={showGithub}
                                                onChange={(e) => setShowGithub(e.target.checked)}
                                            />
                                            <span>Show GitHub URL</span>
                                        </label>
                                        <label className="inline-flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white transition">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-brand-purple bg-slate-950 border-slate-900 rounded focus:ring-0 cursor-pointer"
                                                checked={showLinkedin}
                                                onChange={(e) => setShowLinkedin(e.target.checked)}
                                            />
                                            <span>Show LinkedIn URL</span>
                                        </label>
                                        <label className="inline-flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white transition">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-brand-purple bg-slate-950 border-slate-900 rounded focus:ring-0 cursor-pointer"
                                                checked={showBio}
                                                onChange={(e) => setShowBio(e.target.checked)}
                                            />
                                            <span>Show Bio Statement</span>
                                        </label>
                                        <label className="inline-flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white transition">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-brand-purple bg-slate-950 border-slate-900 rounded focus:ring-0 cursor-pointer"
                                                checked={showLocation}
                                                onChange={(e) => setShowLocation(e.target.checked)}
                                            />
                                            <span>Show Location Details</span>
                                        </label>
                                        <label className="inline-flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white transition">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-brand-purple bg-slate-950 border-slate-900 rounded focus:ring-0 cursor-pointer"
                                                checked={showExperience}
                                                onChange={(e) => setShowExperience(e.target.checked)}
                                            />
                                            <span>Show Platform Experience</span>
                                        </label>
                                        <label className="inline-flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white transition">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-brand-purple bg-slate-950 border-slate-900 rounded focus:ring-0 cursor-pointer"
                                                checked={showAvailability}
                                                onChange={(e) => setShowAvailability(e.target.checked)}
                                            />
                                            <span>Show Collaboration Status</span>
                                        </label>
                                        <label className="inline-flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white transition">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-brand-purple bg-slate-950 border-slate-900 rounded focus:ring-0 cursor-pointer"
                                                checked={showSkills}
                                                onChange={(e) => setShowSkills(e.target.checked)}
                                            />
                                            <span>Show Skills Inventory</span>
                                        </label>
                                        <label className="inline-flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white transition">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-brand-purple bg-slate-950 border-slate-900 rounded focus:ring-0 cursor-pointer"
                                                checked={showReputation}
                                                onChange={(e) => setShowReputation(e.target.checked)}
                                            />
                                            <span>Show Reputation Ratings</span>
                                        </label>
                                        <label className="inline-flex items-center gap-3 cursor-pointer text-xs text-slate-300 hover:text-white transition">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-brand-purple bg-slate-950 border-slate-900 rounded focus:ring-0 cursor-pointer"
                                                checked={showStats}
                                                onChange={(e) => setShowStats(e.target.checked)}
                                            />
                                            <span>Show Project Statistics</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-900/60 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={updatingProfile}
                                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-brand-blue/15 active:scale-[0.98] transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 glow-btn font-display"
                                    >
                                        <Save className="w-4 h-4" /> {updatingProfile ? "Saving Identity..." : "Save Identity"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right column: Skills and Reviews */}
                    <div className="space-y-6">
                        {/* Skills Inventory */}
                        <div className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                            <h2 className="text-xs font-bold text-white uppercase tracking-widest font-display flex items-center gap-2 pb-3.5 border-b border-slate-900/60">
                                <Sparkles className="w-4.5 h-4.5 text-brand-purple animate-pulse" /> Skills Inventory
                            </h2>

                            {/* Skills Chips */}
                            <div className="flex gap-2 flex-wrap min-h-12 py-1">
                                {skillsList.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic text-center w-full py-4">No skills registered yet.</p>
                                ) : (
                                    skillsList.map((skill) => (
                                        <div
                                            key={skill.id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-300 font-semibold group hover:border-slate-800 transition"
                                        >
                                            <span>{skill.skill_name}</span>
                                            <span className="text-[10px] text-slate-500 font-bold">({skill.experience_years}y)</span>
                                            <button
                                                onClick={() => handleDeleteSkill(skill.id, skill.skill_name)}
                                                className="text-slate-500 hover:text-rose-455 font-bold transition ml-0.5 cursor-pointer"
                                                title="Delete skill"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add Skill form */}
                            <form onSubmit={handleAddSkill} className="space-y-3 pt-4 border-t border-slate-900/60">
                                <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Register Skill</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        required
                                        className="px-3 py-2 rounded-xl bg-slate-955 border border-slate-900 focus:border-brand-purple outline-none text-xs text-slate-205 placeholder:text-slate-700"
                                        placeholder="Skill (React)"
                                        value={newSkillName}
                                        onChange={(e) => setNewSkillName(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0.5"
                                        required
                                        className="px-3 py-2 rounded-xl bg-slate-955 border border-slate-900 focus:border-brand-purple outline-none text-xs text-slate-205 placeholder:text-slate-700"
                                        placeholder="Years"
                                        value={newSkillExp}
                                        onChange={(e) => setNewSkillExp(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={addingSkill}
                                    className="w-full py-2 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs font-bold text-slate-300 transition active:scale-[0.98] cursor-pointer"
                                >
                                    {addingSkill ? "Adding..." : "+ Add Skill"}
                                </button>
                            </form>
                        </div>

                        {/* Teammate Reviews */}
                        <div className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-4">
                            <h2 className="text-xs font-bold text-white uppercase tracking-widest font-display flex items-center gap-2 pb-3.5 border-b border-slate-900/60">
                                <MessageSquare className="w-4.5 h-4.5 text-brand-blue" /> Teammate Reviews
                            </h2>

                            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                                {reviews.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic text-center py-8">No reviews received yet.</p>
                                ) : (
                                    reviews.map((review) => {
                                        const avg = (review.technical_rating + review.communication_rating + review.teamwork_rating + review.deadline_rating) / 4;
                                        return (
                                            <div key={review.id} className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-900 space-y-2">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-bold text-slate-300">From @{review.reviewer_username}</span>
                                                    <span className="text-amber-400 font-bold flex items-center gap-0.5">⭐ {avg.toFixed(1)}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 italic leading-relaxed">"{review.comment}"</p>
                                                
                                                {/* Ratings grid breakdown */}
                                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] text-slate-500 pt-1.5 border-t border-slate-900/60 font-semibold uppercase tracking-wider">
                                                    <span>Technical: {review.technical_rating}/5</span>
                                                    <span>Communication: {review.communication_rating}/5</span>
                                                    <span>Teamwork: {review.teamwork_rating}/5</span>
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

export default Profile;

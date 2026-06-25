import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { useToast } from "../context/ToastContext";

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
            const response = await api.put("profile/details/", {
                bio,
                country,
                state,
                city,
                timezone,
                github_url: githubUrl,
                linkedin_url: linkedinUrl,
                experience_years: parseFloat(experienceYears),
                is_available: isAvailable
            });
            setProfile(response.data);
            showToast("Profile identity updated successfully! 🎉");
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

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                {/* Profile Edit Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                            <span>📝</span> Profile Specifications
                        </h2>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                                    About Me / Bio
                                </label>
                                <textarea
                                    rows="4"
                                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-slate-850 placeholder:text-slate-400 text-sm leading-relaxed"
                                    placeholder="Explain your technical expertise, builder goals, and what you ship..."
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                                        Experience (Years)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-sm text-slate-850"
                                        value={experienceYears}
                                        onChange={(e) => setExperienceYears(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                                        Timezone
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-sm text-slate-850"
                                        placeholder="e.g. UTC, GMT+5:30"
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-sm text-slate-850"
                                        placeholder="e.g. India"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                                        State / Province
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-sm text-slate-850"
                                        placeholder="e.g. Karnataka"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-sm text-slate-850"
                                        placeholder="e.g. Bangalore"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                                        GitHub Profile URL
                                    </label>
                                    <input
                                        type="url"
                                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-sm text-slate-850 placeholder:text-slate-400"
                                        placeholder="https://github.com/your-username"
                                        value={githubUrl}
                                        onChange={(e) => setGithubUrl(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                                        LinkedIn Profile URL
                                    </label>
                                    <input
                                        type="url"
                                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-sm text-slate-850 placeholder:text-slate-400"
                                        placeholder="https://linkedin.com/in/your-username"
                                        value={linkedinUrl}
                                        onChange={(e) => setLinkedinUrl(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="inline-flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                        checked={isAvailable}
                                        onChange={(e) => setIsAvailable(e.target.checked)}
                                    />
                                    <span className="text-sm font-semibold text-slate-700">
                                        Open to team collaboration matching
                                    </span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={updatingProfile}
                                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-750 text-white text-xs font-bold shadow active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
                                >
                                    {updatingProfile ? "Saving..." : "Save Identity"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Skills & Reviews Column */}
                <div className="space-y-6">
                    {/* Skills Manager */}
                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                            <span>🚀</span> Skills Inventory
                        </h2>

                        {/* Skills Chip List */}
                        <div className="flex gap-2 flex-wrap min-h-12 py-1">
                            {skillsList.length === 0 ? (
                                <p className="text-xs text-slate-400 italic text-center w-full py-4">No skills listed yet</p>
                            ) : (
                                skillsList.map((skill) => (
                                    <div
                                        key={skill.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold group hover:border-slate-300"
                                    >
                                        <span>{skill.skill_name}</span>
                                        <span className="text-[10px] text-slate-400">({skill.experience_years}y)</span>
                                        <button
                                            onClick={() => handleDeleteSkill(skill.id, skill.skill_name)}
                                            className="text-slate-450 hover:text-rose-500 font-bold transition ml-0.5 cursor-pointer"
                                            title="Delete skill"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Skill Form */}
                        <form onSubmit={handleAddSkill} className="space-y-3 pt-4 border-t border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Register Skill</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    required
                                    className="px-3 py-2 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-xs text-slate-800"
                                    placeholder="Skill Name (React)"
                                    value={newSkillName}
                                    onChange={(e) => setNewSkillName(e.target.value)}
                                />
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    required
                                    className="px-3 py-2 rounded-lg bg-white border border-slate-350 focus:border-blue-500 outline-none text-xs text-slate-800"
                                    placeholder="Experience"
                                    value={newSkillExp}
                                    onChange={(e) => setNewSkillExp(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={addingSkill}
                                className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 transition active:scale-[0.98] cursor-pointer"
                            >
                                {addingSkill ? "Adding..." : "+ Add Skill"}
                            </button>
                        </form>
                    </div>

                    {/* Reviews & Reputation */}
                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                            <span>⭐</span>Teammate Reviews
                        </h2>

                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            {reviews.length === 0 ? (
                                <p className="text-xs text-slate-400 italic text-center py-8">No reviews received yet</p>
                            ) : (
                                reviews.map((review) => {
                                    const avg = (review.technical_rating + review.communication_rating + review.teamwork_rating + review.deadline_rating) / 4;
                                    return (
                                        <div key={review.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-slate-700">From @{review.reviewer_username}</span>
                                                <span className="text-amber-500 font-bold">⭐ {avg.toFixed(1)}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 italic">"{review.comment}"</p>
                                            
                                            {/* Ratings grid */}
                                            <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-400 pt-1 border-t border-slate-200/40">
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
        </DashboardLayout>
    );
}

export default Profile;

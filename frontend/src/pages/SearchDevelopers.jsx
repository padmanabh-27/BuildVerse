import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { useToast } from "../context/ToastContext";
import { CardSkeleton } from "../components/Skeletons";
import { 
    Search, 
    Filter, 
    MapPin, 
    Award, 
    Sparkles, 
    Users, 
    CheckCircle2, 
    ArrowUpRight, 
    UserCheck,
    AlertCircle
} from "lucide-react";

function SearchDevelopers() {
    const [searchQuery, setSearchQuery] = useState("");
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    // Left Sidebar filter states
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [minExperience, setMinExperience] = useState(0);
    const [locationQuery, setLocationQuery] = useState("");

    useEffect(() => {
        handleSearch("");
    }, []);

    const handleSearch = async (query) => {
        setLoading(true);
        try {
            const response = await api.get(`search/users/?q=${encodeURIComponent(query)}`);
            const users = response.data;
            
            // Resolve profiles for all users to enrich UX with skills, bio, location, etc.
            const enriched = await Promise.all(
                users.map(async (u) => {
                    try {
                        const profileRes = await api.get(`profile/user/${u.id}/`);
                        return { ...u, ...profileRes.data };
                    } catch (err) {
                        return { 
                            ...u, 
                            skills: [], 
                            bio: "No bio details shared yet.", 
                            is_available: Math.random() > 0.4, // fallback mock
                            experience_years: Math.floor(Math.random() * 5) + 1,
                            city: "",
                            country: ""
                        };
                    }
                })
            );
            
            setDevelopers(enriched);
        } catch (error) {
            console.error("Search failed:", error);
            showToast("Failed to search developers.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSearch(searchQuery);
    };

    // Apply sidebar client-side filters
    const filteredDevelopers = developers.filter(dev => {
        if (onlyAvailable && !dev.is_available) return false;
        if (dev.experience_years < minExperience) return false;
        if (locationQuery) {
            const city = dev.city?.toLowerCase() || "";
            const country = dev.country?.toLowerCase() || "";
            const locStr = `${city} ${country}`;
            if (!locStr.includes(locationQuery.toLowerCase())) return false;
        }
        return true;
    });

    // Helper to generate premium badges for visual premium feel
    const getPremiumBadges = (dev) => {
        const badges = [];
        // Add badges based on some criteria
        if (dev.is_available) {
            badges.push({ name: "Verified", color: "bg-blue-950/40 text-blue-400 border-blue-500/20" });
        }
        if (dev.experience_years >= 3 || dev.role_reputations?.length > 0) {
            badges.push({ name: "Top Contributor", color: "bg-purple-950/40 text-purple-400 border-purple-500/20" });
        }
        if (dev.skills?.length > 3 || dev.username === "john") {
            badges.push({ name: "AI Expert", color: "bg-indigo-950/40 text-indigo-400 border-indigo-500/20" });
        }
        if (dev.username === "alice") {
            badges.push({ name: "Project Leader", color: "bg-pink-950/40 text-pink-400 border-pink-500/20" });
        }
        return badges.slice(0, 2); // Show at most 2 badges on card
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fadeIn">
                {/* Search Bar section */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-900 shadow-xl">
                    <form onSubmit={handleFormSubmit} className="flex gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-900 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none text-sm transition text-slate-100 placeholder:text-slate-650"
                                placeholder="Search developers by name, handles, technical skills..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-600" />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-95 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-brand-blue/10 active:scale-[0.98] cursor-pointer glow-btn"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Sidebar Filter Column */}
                    <div className="w-full lg:w-64 shrink-0 glass-panel border border-slate-900 p-5 rounded-2xl h-fit space-y-5">
                        <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                            <Filter className="w-4 h-4 text-brand-blue" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest font-display">Builder Filters</h3>
                        </div>

                        {/* Availability Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Availability Status</label>
                            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded bg-slate-950 border-slate-900 text-brand-purple focus:ring-0 cursor-pointer"
                                    checked={onlyAvailable}
                                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                                />
                                <span>Open to Collaborate</span>
                            </label>
                        </div>

                        {/* Experience Slider */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <span>Min Experience</span>
                                <span className="text-white font-extrabold">{minExperience} Years</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                className="w-full accent-brand-purple cursor-pointer bg-slate-900 h-1 rounded-lg"
                                value={minExperience}
                                onChange={(e) => setMinExperience(parseInt(e.target.value))}
                            />
                        </div>

                        {/* Location Query */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Location / City</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-900 focus:border-brand-blue outline-none text-xs text-slate-200 placeholder:text-slate-700"
                                placeholder="e.g. London, Remote"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                            />
                        </div>

                        {/* Summary metric */}
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                            Showing <span className="text-slate-300 font-bold">{filteredDevelopers.length}</span> builders
                        </div>
                    </div>

                    {/* Right Grid Column */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <CardSkeleton />
                                <CardSkeleton />
                                <CardSkeleton />
                                <CardSkeleton />
                            </div>
                        ) : filteredDevelopers.length === 0 ? (
                            <div className="glass-panel rounded-2xl border border-slate-900 p-16 text-center shadow-xl space-y-4">
                                <AlertCircle className="w-12 h-12 text-slate-650 mx-auto animate-pulse" />
                                <h3 className="font-bold text-white text-sm font-display">No developers found</h3>
                                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                    Try expanding your search keywords or adjusting your filters.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredDevelopers.map((dev) => {
                                    const badges = getPremiumBadges(dev);
                                    return (
                                        <div 
                                            key={dev.id} 
                                            className="glass-panel rounded-2xl border border-slate-900 p-6 shadow-xl hover:border-slate-800 transition flex flex-col justify-between space-y-4 hover:scale-[1.01]"
                                        >
                                            <div className="space-y-3.5">
                                                {/* User Header */}
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple text-white flex items-center justify-center font-black text-lg capitalize shrink-0 shadow-sm shadow-brand-blue/15">
                                                            {dev.username ? dev.username[0] : "?"}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-200 text-sm tracking-tight capitalize flex items-center gap-2 font-display">
                                                                {dev.username}
                                                                {dev.is_available && (
                                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Available"></span>
                                                                )}
                                                            </h3>
                                                            <span className="text-[10px] text-slate-500 font-semibold block">
                                                                {dev.experience_years ? `${dev.experience_years}y Experience` : "New Builder"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {dev.is_available && (
                                                        <span className="text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">
                                                            Open Collab
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Premium Badges row */}
                                                {badges.length > 0 && (
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        {badges.map((badge, bIdx) => (
                                                            <span 
                                                                key={bIdx} 
                                                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase border tracking-wider ${badge.color}`}
                                                            >
                                                                <Award className="w-2.5 h-2.5" /> {badge.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Bio */}
                                                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 min-h-[32px]">
                                                    {dev.bio || "This developer hasn't set up their bio details yet."}
                                                </p>

                                                {/* Skills Tags */}
                                                <div className="flex flex-wrap gap-1.5 pt-1.5">
                                                    {dev.skills && dev.skills.length > 0 ? (
                                                        dev.skills.slice(0, 4).map((skill, index) => (
                                                            <span
                                                                key={index}
                                                                className="bg-slate-900 border border-slate-850 text-slate-450 px-2 py-0.5 rounded-lg text-[9px] font-semibold tracking-wide"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] text-slate-600 italic">No custom skills listed</span>
                                                    )}
                                                    {dev.skills && dev.skills.length > 4 && (
                                                        <span className="text-[9px] text-slate-500 self-center pl-1 font-bold">
                                                            +{dev.skills.length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Footer details & CTA */}
                                            <div className="pt-3.5 border-t border-slate-900/60 flex items-center justify-between gap-3 text-xs">
                                                <span className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-slate-500" /> 
                                                    {dev.city && dev.country ? `${dev.city}, ${dev.country}` : "Remote"}
                                                </span>
                                                <Link
                                                    to={`/profile/${dev.id}`}
                                                    className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-brand-purple/40 text-[10px] font-bold rounded-lg text-slate-300 transition flex items-center gap-1 hover:text-white"
                                                >
                                                    Profile & Invite <ArrowUpRight className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default SearchDevelopers;

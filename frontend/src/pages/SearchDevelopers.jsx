import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { useToast } from "../context/ToastContext";
import { CardSkeleton } from "../components/Skeletons";

function SearchDevelopers() {
    const [searchQuery, setSearchQuery] = useState("");
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        handleSearch("");
    }, []);

    const handleSearch = async (query) => {
        setLoading(true);
        try {
            const response = await api.get(`search/users/?q=${encodeURIComponent(query)}`);
            const users = response.data; // [{ id, username }]
            
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
                            is_available: false,
                            experience_years: 0
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Search Bar section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <form onSubmit={handleFormSubmit} className="flex gap-3">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm transition"
                                placeholder="Search developers by name, username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Developer Grid list */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                ) : developers.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-base font-bold text-slate-800">No builders found</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            Try adjusting your query or search term to discover other engineering partners.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {developers.map((dev) => (
                            <div key={dev.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                                <div className="space-y-3.5">
                                    {/* User header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-lg capitalize shrink-0">
                                                {dev.username ? dev.username[0] : "?"}
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-slate-800 text-sm tracking-tight capitalize flex items-center gap-2">
                                                    {dev.username}
                                                    {dev.is_available && (
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Available"></span>
                                                    )}
                                                </h3>
                                                <span className="text-[10px] text-slate-450">
                                                    {dev.experience_years ? `${dev.experience_years}y experience` : "No experience listed"}
                                                </span>
                                            </div>
                                        </div>

                                        {dev.is_available && (
                                            <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                                Available
                                            </span>
                                        )}
                                    </div>

                                    {/* Bio */}
                                    <p className="text-xs text-slate-650 leading-relaxed line-clamp-2 min-h-[32px]">
                                        {dev.bio || "This developer hasn't set up their bio details yet."}
                                    </p>

                                    {/* Skills tags */}
                                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                                        {dev.skills && dev.skills.length > 0 ? (
                                            dev.skills.slice(0, 4).map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-slate-105 border border-slate-200/60 text-slate-650 px-2 py-1 rounded text-[10px] font-semibold"
                                                >
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-slate-400 italic">No skills listed</span>
                                        )}
                                        {dev.skills && dev.skills.length > 4 && (
                                            <span className="text-[10px] text-slate-400 self-center pl-1">
                                                +{dev.skills.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                                    <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                        {dev.city && dev.country ? `📍 ${dev.city}, ${dev.country}` : "🌐 Remote"}
                                    </span>
                                    <Link
                                        to={`/profile/${dev.id}`}
                                        className="px-4 py-2 border border-slate-200 hover:border-slate-350 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold rounded-lg text-slate-700 transition cursor-pointer"
                                    >
                                        View Profile & Invite
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default SearchDevelopers;

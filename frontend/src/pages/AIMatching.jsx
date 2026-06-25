import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { useToast } from "../context/ToastContext";

function AIMatching() {
    const [query, setQuery] = useState("");
    const [regionFilter, setRegionFilter] = useState(false);
    const [country, setCountry] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState(0);
    const [searched, setSearched] = useState(false);
    const { showToast } = useToast();

    // Multi-stage loading text updates for premium AI feel
    const loadingStages = [
        "Analyzing search parameters using NLP...",
        "Identifying candidate roles and tech requirements...",
        "Evaluating candidate experience and task completion scores...",
        "Computing matching weights and ranking talent..."
    ];

    useEffect(() => {
        let interval;
        if (loading) {
            setLoadingStage(0);
            interval = setInterval(() => {
                setLoadingStage((prev) => (prev + 1) % loadingStages.length);
            }, 1800);
        } else {
            setLoadingStage(0);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const response = await api.post("ai/team-matching/", {
                query,
                region_filter: regionFilter,
                country: regionFilter ? country : "",
                state: regionFilter ? state : "",
                city: regionFilter ? city : ""
            });
            setResults(response.data);
            showToast("AI Matchmaking completed successfully! ✨");
        } catch (error) {
            console.error("AI Matching Error:", error);
            showToast("Error executing AI matching search.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Intro Hero card */}
                <div className="p-8 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 select-none pointer-events-none">
                        <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
                        </svg>
                    </div>
                    <div className="max-w-2xl space-y-3 relative z-10">
                        <span className="text-[10px] uppercase font-black tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                            LLM RECRUITER v1.0
                        </span>
                        <h1 className="text-2xl font-extrabold tracking-tight">
                            AI Candidate Recruiter 🤖
                        </h1>
                        <p className="text-xs text-slate-350 leading-relaxed">
                            Describe your requirements in plain English. Our specialized matching model scores and ranks available partners based on their platform role reputation, skills, task velocity, and completed contributions.
                        </p>
                    </div>
                </div>

                {/* Search Form */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
                    <form onSubmit={handleSearch} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase">
                                Describe the talent you need
                            </label>
                            <textarea
                                required
                                rows="3"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs leading-relaxed transition"
                                placeholder="Example: Looking for a Python Developer with 3+ years of Django experience who has completed at least 2 projects and knows PostgreSQL..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>

                        {/* Region Filtering Toggle */}
                        <div className="border-t border-slate-100 pt-4">
                            <label className="inline-flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                    checked={regionFilter}
                                    onChange={(e) => setRegionFilter(e.target.checked)}
                                />
                                <span className="text-xs font-bold text-slate-650 select-none">
                                    Filter candidates by geographic location
                                </span>
                            </label>
                        </div>

                        {/* Location Fields */}
                        {regionFilter && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 animate-slideDown">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-blue-600 text-xs"
                                        placeholder="e.g. India"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                        State / Province
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-blue-600 text-xs"
                                        placeholder="e.g. Delhi"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-blue-600 text-xs"
                                        placeholder="e.g. New Delhi"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm active:scale-[0.98] transition cursor-pointer flex justify-center items-center gap-2.5 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                                    <span>{loadingStages[loadingStage]}</span>
                                </>
                            ) : (
                                <>
                                    <span>Find Ideal Partners</span>
                                    <span>🔍</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                {searched && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                                Matched Talent ({results.length})
                            </h2>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse space-y-4">
                                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                                    <div className="space-y-2 pt-4">
                                        <div className="h-2 bg-slate-200 rounded"></div>
                                        <div className="h-2 bg-slate-200 rounded"></div>
                                        <div className="h-2 bg-slate-200 rounded"></div>
                                    </div>
                                </div>
                                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse space-y-4">
                                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                                    <div className="space-y-2 pt-4">
                                        <div className="h-2 bg-slate-200 rounded"></div>
                                        <div className="h-2 bg-slate-200 rounded"></div>
                                        <div className="h-2 bg-slate-200 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-sm italic text-xs">
                                No matching available candidates found matching your criteria.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {results.map((candidate, idx) => (
                                    <div
                                        key={idx}
                                        className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition relative overflow-hidden flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Match Percentage Overlay badge */}
                                            <div className="absolute top-4 right-4 flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full font-black text-xs">
                                                {candidate.match_percentage}% Match
                                            </div>

                                            <div className="flex gap-3.5 items-start mb-6">
                                                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg capitalize shrink-0 shadow-sm">
                                                    {candidate.username ? candidate.username[0] : "?"}
                                                </div>
                                                <div>
                                                    <Link
                                                        to={`/profile/${candidate.user_id}`}
                                                        className="text-base font-extrabold text-slate-800 capitalize hover:text-blue-600 transition"
                                                    >
                                                        {candidate.username}
                                                    </Link>
                                                    <span className="text-[10px] text-slate-450 font-bold block mt-0.5">Verified Platform Builder</span>
                                                </div>
                                            </div>

                                            {/* Score breakdown metrics */}
                                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Breakdown Analytics</h4>
                                                
                                                {[
                                                    { label: "Role Experience fit", value: candidate.details.role_score, max: 30 },
                                                    { label: "Technical skills match", value: candidate.details.skill_score, max: 25 },
                                                    { label: "Contribution experience", value: candidate.details.contribution_score, max: 20 },
                                                    { label: "Task completion rate", value: candidate.details.task_score, max: 15 },
                                                    { label: "Overall years of exp", value: candidate.details.experience_score, max: 5 },
                                                    { label: "Community activity", value: candidate.details.activity_score, max: 5 }
                                                ].map((score, sIdx) => {
                                                    const percentage = (score.value / score.max) * 100;
                                                    return (
                                                        <div key={sIdx} className="space-y-1">
                                                            <div className="flex justify-between items-center text-[10px]">
                                                                <span className="text-slate-500 font-medium">{score.label}</span>
                                                                <span className="text-slate-800 font-bold">{score.value} / {score.max}</span>
                                                            </div>
                                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-150/40">
                                                                <div
                                                                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-end">
                                            <Link
                                                to={`/profile/${candidate.user_id}`}
                                                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 text-[11px] font-bold rounded-lg text-slate-700 transition cursor-pointer"
                                            >
                                                View Profile & Recruit
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default AIMatching;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { useToast } from "../context/ToastContext";
import { 
    Sparkles, 
    Search, 
    MapPin, 
    Award, 
    CheckCircle2, 
    ArrowUpRight, 
    Cpu, 
    Sliders,
    BrainCircuit,
    Compass
} from "lucide-react";

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
        "Analyzing project description using NLP models...",
        "Extracting target developer roles & key framework tags...",
        "Cross-matching candidate database with reputation index...",
        "Computing vector similarity weights and ranking results..."
    ];

    useEffect(() => {
        let interval;
        if (loading) {
            setLoadingStage(0);
            interval = setInterval(() => {
                setLoadingStage((prev) => (prev + 1) % loadingStages.length);
            }, 1500);
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
            showToast("AI Recruiter alignment analysis complete! ✨");
        } catch (error) {
            console.error("AI Matching Error:", error);
            showToast("Error executing AI matching search.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Helper to generate a contextual reason list based on candidate scores
    const getMatchReasons = (candidate) => {
        const reasons = [];
        const details = candidate.details || {};
        
        if (details.role_score > 20) {
            reasons.push("Strong structural role experience matching project scope.");
        }
        if (details.skill_score > 15) {
            reasons.push("Possesses key technical packages requested in query.");
        } else {
            reasons.push("Broad package familiarity matching general profile.");
        }
        if (details.task_score > 10) {
            reasons.push("High task shipping velocity and milestone contribution rates.");
        }
        if (details.activity_score > 3) {
            reasons.push("Active platform collaborator with verified feedback logs.");
        }
        return reasons.slice(0, 2);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fadeIn relative">
                {/* Intro Hero card */}
                <div className="p-8 rounded-3xl bg-gradient-premium border border-slate-900 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute right-[-10%] bottom-[-10%] w-[350px] h-[350px] rounded-full bg-brand-purple/10 blur-[80px] pointer-events-none"></div>
                    <div className="absolute top-[-20%] left-[-20%] w-[400px] h-[400px] rounded-full bg-brand-blue/10 blur-[100px] pointer-events-none"></div>
                    
                    <div className="max-w-2xl space-y-3.5 relative z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-white/8 text-slate-300 border border-white/15 uppercase tracking-widest">
                            <BrainCircuit className="w-3.5 h-3.5 text-brand-purple animate-pulse" /> neural recruit engine
                        </span>
                        <h1 className="text-3xl font-black tracking-tight font-display">
                            AI Candidate Recruiter
                        </h1>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Describe your workspace requirements in plain text. Our neural matching pipeline extracts role weights, cross-checks developer reputation indices, and showcases best-aligned builders.
                        </p>
                    </div>
                </div>

                {/* Search Form */}
                <div className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl space-y-5">
                    <form onSubmit={handleSearch} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-display">
                                Describe your project requirements & stack
                            </label>
                            <textarea
                                required
                                rows="3"
                                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-900 outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple text-xs leading-relaxed transition text-slate-100 placeholder:text-slate-650"
                                placeholder="Example: We need a backend developer skilled in Python, Django, and PostgreSQL who is active and has good reputation scores to help build out database APIs..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>

                        {/* Region Filtering Toggle */}
                        <div className="border-t border-slate-900 pt-4 flex items-center justify-between">
                            <label className="inline-flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-brand-purple border-slate-900 rounded bg-slate-950 focus:ring-0 cursor-pointer"
                                    checked={regionFilter}
                                    onChange={(e) => setRegionFilter(e.target.checked)}
                                />
                                <span className="text-xs font-semibold text-slate-400 select-none">
                                    Enforce geographic location alignment
                                </span>
                            </label>
                        </div>

                        {/* Location Fields */}
                        {regionFilter && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 animate-slideUp">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-900 focus:border-brand-purple outline-none text-xs text-slate-200"
                                        placeholder="e.g. India"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        State / Province
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-900 focus:border-brand-purple outline-none text-xs text-slate-200"
                                        placeholder="e.g. Maharashtra"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-900 focus:border-brand-purple outline-none text-xs text-slate-200"
                                        placeholder="e.g. Mumbai"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-95 text-white font-semibold text-xs shadow-lg shadow-brand-blue/15 active:scale-[0.98] transition cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50 glow-btn"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                                    <span className="animate-pulse">{loadingStages[loadingStage]}</span>
                                </>
                            ) : (
                                <>
                                    <span>Initiate Recruiter Search</span>
                                    <Compass className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Progress Status Bar (rendered during loading) */}
                {loading && (
                    <div className="p-6 rounded-2xl glass-panel border border-brand-purple/35 shadow-xl space-y-4">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                            <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-brand-purple animate-spin" /> Neural Recruiter Analysis in Progress</span>
                            <span>Stage {loadingStage + 1} of 4</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                            <div 
                                className="bg-gradient-to-r from-brand-blue to-brand-purple h-full rounded-full transition-all duration-500 animate-pulse"
                                style={{ width: `${((loadingStage + 1) / 4) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-[11px] text-slate-500 italic text-center">Please stand by. Matching weights are evaluated in real-time.</p>
                    </div>
                )}

                {/* Results Section */}
                {searched && !loading && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xs font-bold text-white uppercase tracking-widest font-display">
                                Matched Builders ({results.length})
                            </h2>
                        </div>

                        {results.length === 0 ? (
                            <div className="p-16 text-center text-slate-500 glass-panel border border-slate-900 rounded-3xl shadow-xl italic text-xs">
                                No candidate metrics satisfied your parameters. Try broadening your description query terms.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {results.map((candidate, idx) => {
                                    const reasons = getMatchReasons(candidate);
                                    return (
                                        <div
                                            key={idx}
                                            className="p-6 rounded-2xl glass-panel border border-slate-900 shadow-xl hover:border-slate-800 transition relative overflow-hidden flex flex-col justify-between hover:scale-[1.01]"
                                        >
                                            {/* Glow Accent */}
                                            <div className="absolute top-[-10%] right-[-10%] w-[100px] h-[100px] rounded-full bg-brand-purple/10 blur-[30px] pointer-events-none"></div>

                                            <div>
                                                {/* Match Percentage Overlay badge */}
                                                <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/10 text-slate-200 border border-white/20 px-3 py-1 rounded-full font-black text-xs">
                                                    {candidate.match_percentage}% Match
                                                </div>

                                                <div className="flex gap-3 items-start mb-6">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple text-white flex items-center justify-center font-black text-lg capitalize shrink-0 shadow-md shadow-brand-blue/10">
                                                        {candidate.username ? candidate.username[0] : "?"}
                                                    </div>
                                                    <div>
                                                        <Link
                                                            to={`/profile/${candidate.user_id}`}
                                                            className="text-base font-extrabold text-slate-200 capitalize hover:text-brand-purple transition font-display"
                                                        >
                                                            {candidate.username}
                                                        </Link>
                                                        <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Verified Platform Builder</span>
                                                    </div>
                                                </div>

                                                {/* Reasoning list */}
                                                <div className="bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl space-y-2 mb-5">
                                                    <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">AI Matching Highlights</h4>
                                                    <ul className="space-y-1.5">
                                                        {reasons.map((r, rIdx) => (
                                                            <li key={rIdx} className="text-xs text-slate-350 flex items-start gap-1.5">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                                                <span>{r}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Score breakdown metrics progress bars */}
                                                <div className="space-y-3.5 pt-4 border-t border-slate-900/60">
                                                    <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Neural Weights Breakdown</h4>
                                                    
                                                    {[
                                                        { label: "Role Experience Fit", value: candidate.details.role_score, max: 30 },
                                                        { label: "Technical Skills Alignment", value: candidate.details.skill_score, max: 25 },
                                                        { label: "Platform Tasks Completion", value: candidate.details.task_score, max: 15 },
                                                        { label: "Overall Contribution Rates", value: candidate.details.contribution_score, max: 20 }
                                                    ].map((score, sIdx) => {
                                                        const percentage = (score.value / score.max) * 100;
                                                        return (
                                                            <div key={sIdx} className="space-y-1">
                                                                <div className="flex justify-between items-center text-[10px]">
                                                                    <span className="text-slate-450 font-semibold">{score.label}</span>
                                                                    <span className="text-slate-300 font-bold">{score.value} / {score.max}</span>
                                                                </div>
                                                                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                                                                    <div
                                                                        className="bg-gradient-to-r from-brand-blue to-brand-purple h-full rounded-full transition-all duration-500"
                                                                        style={{ width: `${percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Action button */}
                                            <div className="pt-5 mt-5 border-t border-slate-900/60 flex items-center justify-end">
                                                <Link
                                                    to={`/profile/${candidate.user_id}`}
                                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-brand-purple/40 text-[10px] font-bold rounded-lg text-slate-300 transition flex items-center gap-1 hover:text-white"
                                                >
                                                    View Builder Identity <ArrowUpRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default AIMatching;

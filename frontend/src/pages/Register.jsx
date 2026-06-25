import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { User, Mail, Lock, UserPlus } from "lucide-react";
import LightRays from "../components/LightRays";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }

        setLoading(true);
        try {
            await api.post("register/", {
                username,
                email,
                password,
            });
            showToast("Registration Successful! Please login. 🚀");
            navigate("/");
        } catch (error) {
            console.error("REGISTER ERROR:", error.response?.data);
            const data = error.response?.data;
            if (data && typeof data === "object") {
                const messages = Object.entries(data).map(([key, val]) => `${key}: ${val}`).join(", ");
                showToast(messages, "error");
            } else {
                showToast("Registration failed. Choose a different username/email.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 md:p-6 font-sans relative overflow-hidden" style={{ backgroundColor: '#0c0d12' }}>
            {/* Interactive Light Rays Background — white top-center spotlight */}
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ opacity: 0.35 }}>
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#ffffff"
                    raysSpeed={0.6}
                    lightSpread={0.5}
                    rayLength={1.5}
                    pulsating={false}
                    fadeDistance={1.2}
                    saturation={0.0}
                    followMouse={true}
                    mouseInfluence={0.08}
                    noiseAmount={0.02}
                    distortion={0.01}
                />
            </div>

            {/* Ambient silver glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[140px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)' }}></div>
            <div className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(203,213,225,0.02) 0%, transparent 70%)' }}></div>

            {/* Main Template-Style Container */}
            <div className="w-full max-w-4xl h-auto md:h-[520px] flex flex-col md:flex-row shadow-2xl rounded-3xl overflow-hidden border border-slate-900 relative z-10 bg-slate-950">
                
                {/* LEFT COLUMN: Input Card Form */}
                <div className="w-full md:w-[42%] flex flex-col justify-between p-8 relative min-h-[420px] md:min-h-0" style={{ backgroundColor: 'rgba(255,255,255,0.97)' }}>
                    {/* Header: Logo */}
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-0.5">
                            <div className="w-5 h-2 bg-slate-700 rounded-sm"></div>
                            <div className="w-5 h-2 bg-slate-400 rounded-sm translate-x-1.5 -translate-y-0.5"></div>
                        </div>
                        <div className="flex flex-col text-slate-900 font-bold leading-none select-none">
                            <span className="text-xs uppercase tracking-wider font-extrabold">Build</span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest -mt-0.5 font-bold">Verse</span>
                        </div>
                    </div>

                    {/* Centered Login Inputs */}
                    <div className="my-auto flex flex-col items-center space-y-4 pt-3">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md" style={{ background: 'linear-gradient(135deg, #334155, #64748b)' }}>
                            <UserPlus className="w-7 h-7 stroke-[1.5]" />
                        </div>

                        <form onSubmit={handleRegister} className="w-full space-y-3 px-1">
                            {/* Username */}
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450">
                                    <User className="w-3.5 h-3.5" />
                                </span>
                                <input
                                    type="text"
                                    required
                                    placeholder="USERNAME"
                                    className="w-full pl-11 pr-4 py-2 rounded-full border border-slate-300 focus:border-[#18264F] focus:ring-1 focus:ring-[#18264F] outline-none text-slate-900 text-xs font-bold placeholder:text-slate-400 tracking-wider transition"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450">
                                    <Mail className="w-3.5 h-3.5" />
                                </span>
                                <input
                                    type="email"
                                    required
                                    placeholder="EMAIL ADDRESS"
                                    className="w-full pl-11 pr-4 py-2 rounded-full border border-slate-300 focus:border-[#18264F] focus:ring-1 focus:ring-[#18264F] outline-none text-slate-900 text-xs font-bold placeholder:text-slate-400 tracking-wider transition"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450">
                                    <Lock className="w-3.5 h-3.5" />
                                </span>
                                <input
                                    type="password"
                                    required
                                    placeholder="PASSWORD"
                                    className="w-full pl-11 pr-4 py-2 rounded-full border border-slate-300 focus:border-[#18264F] focus:ring-1 focus:ring-[#18264F] outline-none text-slate-900 text-xs font-bold placeholder:text-slate-400 tracking-wider transition"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450">
                                    <Lock className="w-3.5 h-3.5" />
                                </span>
                                <input
                                    type="password"
                                    required
                                    placeholder="CONFIRM PASSWORD"
                                    className="w-full pl-11 pr-4 py-2 rounded-full border border-slate-300 focus:border-[#18264F] focus:ring-1 focus:ring-[#18264F] outline-none text-slate-900 text-xs font-bold placeholder:text-slate-400 tracking-wider transition"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            {/* Signup Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 rounded-full text-white font-extrabold text-xs uppercase tracking-widest transition shadow-md cursor-pointer select-none active:scale-[0.99]"
                                style={{ background: 'linear-gradient(135deg, #1e293b, #475569)', opacity: loading ? 0.6 : 1 }}
                            >
                                {loading ? "Registering..." : "Sign Up"}
                            </button>
                        </form>
                    </div>

                    {/* Bottom margin */}
                    <div className="pb-1"></div>
                </div>

                {/* RIGHT COLUMN: Charcoal-Dark Spotlight Panel */}
                <div 
                    className="w-full md:w-[58%] flex flex-col justify-between p-8 text-white relative min-h-[300px] md:min-h-0"
                    style={{
                        background: `linear-gradient(160deg, #1a1d27 0%, #0c0d12 40%, #13161f 100%)`
                    }}
                >
                    {/* Subtle inner top light */}
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.07) 0%, transparent 60%)' }}></div>

                    {/* Nav header */}
                    <div className="flex justify-between items-center w-full z-10 select-none relative">
                        <div className="flex gap-4 text-[9px] font-black uppercase tracking-wider text-slate-300">
                            <a href="#about" onClick={(e) => { e.preventDefault(); showToast("BuildVerse: Team Matching Platform"); }} className="hover:text-white transition">About</a>
                            <a href="#contact" onClick={(e) => { e.preventDefault(); showToast("Contact us at contact@buildverse.co"); }} className="hover:text-white transition">Contact</a>
                        </div>
                        <Link to="/" className="px-4 py-1.5 rounded-full border border-white hover:bg-white hover:text-slate-900 transition text-[9px] font-black uppercase tracking-wider select-none">
                            Sign In
                        </Link>
                    </div>

                    {/* Welcome content */}
                    <div className="my-auto max-w-sm pl-2 space-y-4 z-10 relative">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none font-display" style={{ background: 'linear-gradient(135deg, #f8fafc 30%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Welcome.</h1>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                            Co-build the future of software. Match with vetted builders, coordinate tasks via Kanbans, and showcase verified achievements with zero platform commission.
                        </p>
                        <div className="text-[9px] pt-1 font-bold text-slate-500">
                            Already registered? <Link to="/" className="underline text-slate-300 hover:text-white transition">Sign in</Link>
                        </div>
                    </div>

                    {/* Small footer text */}
                    <div className="z-10 text-[9px] text-slate-600 select-none relative">
                        © 2026 BuildVerse Inc. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;

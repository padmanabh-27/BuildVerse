import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 relative font-sans">
            <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-slate-200 shadow-xl relative z-10 space-y-6">
                <div className="text-center space-y-1.5">
                    <h1 className="text-3xl font-black tracking-tight text-blue-600">
                        BuildVerse
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Join the ultimate space for builders & creators
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                            Username
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-slate-850 placeholder:text-slate-400 text-sm"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-slate-850 placeholder:text-slate-400 text-sm"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-slate-850 placeholder:text-slate-400 text-sm"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-slate-850 placeholder:text-slate-400 text-sm"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-750 text-white font-bold shadow-lg shadow-blue-550/15 active:scale-[0.98] transition cursor-pointer flex justify-center items-center disabled:opacity-50 text-sm"
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <p className="text-slate-500 text-sm">
                        Already have an account?{" "}
                        <Link to="/" className="text-blue-600 hover:text-blue-500 font-bold transition">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;

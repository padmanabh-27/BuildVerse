import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(username, password);
            showToast("Welcome back to BuildVerse! 🚀");
            navigate("/dashboard");
        } catch (error) {
            console.error("LOGIN ERROR:", error.response?.data);
            showToast("Invalid username or password credentials.", "error");
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
                        Sign in to connect, collaborate, and build
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                            Username
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-slate-850 placeholder:text-slate-400 text-sm"
                            placeholder="your-username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-750 text-white font-bold shadow-lg shadow-blue-550/15 active:scale-[0.98] transition cursor-pointer flex justify-center items-center disabled:opacity-50 text-sm"
                    >
                        {loading ? "Authenticating..." : "Log In"}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <p className="text-slate-500 text-sm">
                        Don't have an account yet?{" "}
                        <Link to="/register" className="text-blue-600 hover:text-blue-500 font-bold transition">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
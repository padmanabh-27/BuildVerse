import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full text-center space-y-6 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm animate-fadeIn">
                <div className="text-6xl select-none">🛸</div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">404</h1>
                    <h2 className="text-sm font-bold text-slate-700">Page not found</h2>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                </div>
                <div className="pt-2">
                    <Link
                        to="/dashboard"
                        className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg shadow-sm transition active:scale-[0.98]"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default NotFound;

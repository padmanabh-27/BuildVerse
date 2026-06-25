import { createContext, useContext, useState } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div className="fixed top-4 right-4 z-50 animate-scaleUp">
                    <div className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2.5 ${
                        toast.type === "error"
                            ? "bg-rose-50 border-rose-100 text-rose-600"
                            : "bg-emerald-50 border-emerald-100 text-emerald-600"
                    }`}>
                        <span>{toast.type === "error" ? "⚠️" : "✨"}</span>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);

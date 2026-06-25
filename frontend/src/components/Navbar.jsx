import { useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/");
    };

    return (
        <nav className="bg-white shadow p-4 flex justify-between">
            <h1 className="text-2xl font-bold">
                BuildVerse 🚀
            </h1>

            <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded"
            >
                Logout
            </button>
        </nav>
    );
}

export default Navbar;
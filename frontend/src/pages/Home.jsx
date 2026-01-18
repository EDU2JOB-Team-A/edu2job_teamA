import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import EducationSection from "../components/EducationSection";
import JobHistorySection from "../components/JobHistorySection";

function Home() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-xl font-bold text-primary">Edu2Job</h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">Welcome, {user?.username}</span>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                    >
                        Logout
                    </button>
                </div>
            </nav>
            <main className="container mx-auto p-8 max-w-5xl">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-gray-500">Manage your professional profile</p>
                </div>

                {user?.role === 'admin' ? (
                    <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl shadow-sm">
                        <h3 className="font-bold text-indigo-800 text-xl mb-2">Admin Controls</h3>
                        <p className="text-indigo-600">Administrative features will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl shadow-sm mb-6">
                            <h3 className="font-bold text-blue-800 text-xl mb-2">My Profile</h3>
                            <p className="text-blue-600">Update your education and work experience below to get better job recommendations.</p>
                        </div>
                        <EducationSection />
                        <JobHistorySection />
                    </div>
                )}
            </main>
        </div>
    );
}

export default Home;

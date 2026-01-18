import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Layout({ children }) {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
                        <span className="bg-primary text-white p-1 rounded">E2J</span> Edu2Job
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-gray-600 hover:text-primary transition font-medium">Home</Link>
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-gray-600 hover:text-primary transition font-medium">Dashboard</Link>
                                <Link to="/profile" className="text-gray-600 hover:text-primary transition font-medium">Profile</Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="text-purple-600 hover:text-purple-700 transition font-medium">Admin Panel</Link>
                                )}
                            </>
                        ) : (
                            <a href="#features" className="text-gray-600 hover:text-primary transition font-medium">Features</a>
                        )}
                        <a href="#about" className="text-gray-600 hover:text-primary transition font-medium">About</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                    {user.first_name ? user.first_name : user.username}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-full transition-all text-sm font-semibold"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-gray-700 hover:text-primary font-medium px-3 py-2">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-primary hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg font-semibold text-sm">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-grow bg-gray-50">
                {children}
            </main>

            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="text-white text-xl font-bold mb-4">Edu2Job</h3>
                            <p className="text-sm text-gray-400">Bridging the gap between education and career success through AI-driven insights.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">Career Prediction</a></li>
                                <li><a href="#" className="hover:text-white transition">Resume Builder</a></li>
                                <li><a href="#" className="hover:text-white transition">Job Matching</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Connect</h4>
                            <div className="flex gap-4">
                                {/* Social icons placeholders */}
                                <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
                                <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
                                <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} Edu2Job. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Layout;

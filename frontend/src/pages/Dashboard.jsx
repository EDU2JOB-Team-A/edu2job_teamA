import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Dashboard() {
    const { user } = useContext(AuthContext);

    return (
        <div className="container mx-auto px-6 py-8 md:py-12 max-w-6xl">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back, <span className="font-semibold text-gray-900">{user?.first_name || user?.username}</span>!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Stats / Overview */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Career Journey</h2>
                        <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center border-dashed border-2 border-gray-200">
                            <p className="text-gray-500 text-sm">Career prediction graph will appear here</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Recommended Roles</h2>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                    <div>
                                        <h4 className="font-bold text-gray-900">Software Engineer {i}</h4>
                                        <p className="text-xs text-gray-500">9{i}% Match based on your skills</p>
                                    </div>
                                    <span className="text-primary text-sm font-semibold">View Details</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar / Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link to="/profile" className="block w-full text-center bg-indigo-50 hover:bg-indigo-100 text-primary font-medium py-2 rounded-lg transition">
                                Update Profile
                            </Link>
                            <button className="block w-full text-center bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-lg transition">
                                Generate Resume
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary to-indigo-600 p-6 rounded-2xl shadow-lg text-white">
                        <h3 className="font-bold text-lg mb-2">Upgrade to Pro</h3>
                        <p className="text-indigo-100 text-sm mb-4">Get unlimited career insights and mentorship.</p>
                        <button className="bg-white text-primary text-sm font-bold py-2 px-4 rounded-lg w-full hover:bg-gray-50 transition">
                            View Plans
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

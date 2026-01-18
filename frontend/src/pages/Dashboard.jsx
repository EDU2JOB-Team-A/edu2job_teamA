import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../api";

function Dashboard() {
    const { user } = useContext(AuthContext);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPrediction, setSelectedPrediction] = useState(null); // For Modal

    useEffect(() => {
        fetchPredictions();
    }, []);

    const fetchPredictions = async () => {
        try {
            const res = await api.get("/predict-career/");
            if (Array.isArray(res.data)) {
                setPredictions(res.data);
            } else {
                console.log(res.data.message); // "Add skills..."
                setPredictions([]);
            }
        } catch (error) {
            console.error("Prediction Error", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-8 md:py-12 max-w-6xl relative">
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
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Recommended Roles (AI Predicted)</h2>
                        <div className="space-y-4">
                            {loading ? (
                                <p className="text-gray-500">Analyzing your profile...</p>
                            ) : predictions.length > 0 ? (
                                predictions.map((pred, i) => (
                                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border-l-4 border-indigo-500">
                                        <div className="mb-2 md:mb-0">
                                            <h4 className="font-bold text-gray-900 text-lg">{pred.role}</h4>
                                            <p className="text-xs text-indigo-600 font-semibold">{pred.match_percentage}% Match based on your skills</p>
                                        </div>

                                        <div className="flex flex-col md:items-end">
                                            {pred.missing_skills && pred.missing_skills.length > 0 ? (
                                                <div className="text-xs text-red-500 mt-1 md:mt-0 text-right">
                                                    <span className="font-bold">Missing:</span> {pred.missing_skills.slice(0, 2).join(", ")}{pred.missing_skills.length > 2 ? "..." : ""}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-green-600 font-bold">Great Match!</span>
                                            )}
                                            <button
                                                onClick={() => setSelectedPrediction(pred)}
                                                className="text-primary text-sm font-semibold mt-1 hover:underline text-indigo-600"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-4">
                                    <p className="text-gray-500 mb-2">No predictions yet.</p>
                                    <Link to="/profile" className="text-indigo-600 font-semibold hover:underline">
                                        Add more skills to get recommendations
                                    </Link>
                                </div>
                            )}
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
                            <Link to="/resume-generate" className="block w-full text-center bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-lg transition">
                                Generate Resume
                            </Link>
                            <Link to="/prediction-history" className="block w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 rounded-lg transition">
                                Prediction History
                            </Link>
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

            {/* Modal */}
            {selectedPrediction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedPrediction.role}</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm text-gray-500">Match Score:</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${selectedPrediction.match_percentage >= 80 ? 'bg-green-100 text-green-700' :
                                    selectedPrediction.match_percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {selectedPrediction.match_percentage}%
                            </span>
                        </div>

                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-800 mb-2">Missing Skills to Acquire:</h4>
                            {selectedPrediction.missing_skills && selectedPrediction.missing_skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {selectedPrediction.missing_skills.map((skill, idx) => (
                                        <span key={idx} className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm border border-red-100">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-green-600 text-sm">You have all the key skills for this role!</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setSelectedPrediction(null)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

export default Dashboard;

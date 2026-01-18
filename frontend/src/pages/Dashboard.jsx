import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Skeleton from "../components/Skeleton";

function Dashboard() {
    const { user } = useContext(AuthContext);
    const [predictions, setPredictions] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPrediction, setSelectedPrediction] = useState(null); // For Modal
    const [freshUser, setFreshUser] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch profile deeply to ensure we have latest 'is_flagged' status
            // which might not be in the token or might be stale
            const [predRes, histRes, profileRes] = await Promise.all([
                api.get("/predict-career/"),
                api.get("/prediction-history/"),
                api.get("/profile/")
            ]);

            if (Array.isArray(predRes.data)) {
                setPredictions(predRes.data);
            } else {
                setPredictions([]);
            }

            if (Array.isArray(histRes.data)) {
                // Process history for graph (e.g., average match score over time)
                // Or just plot the top role's match percentage
                const processedHistory = histRes.data
                    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                    .map(item => ({
                        date: new Date(item.created_at).toLocaleDateString(),
                        match: item.match_percentage,
                        role: item.role
                    }));
                setHistory(processedHistory);
            }

            if (profileRes.data) {
                setFreshUser(profileRes.data);
            }

        } catch (error) {
            console.error("Dashboard Data Error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFeedbackSubmit = async () => {
        try {
            await api.post('/feedback/', {
                rating: rating,
                message: comment || "No comment provided." // Optional comment handling
            });
            setFeedbackSubmitted(true);
            setTimeout(() => {
                setFeedbackSubmitted(false);
                setComment("");
                setRating(0);
            }, 3000);
        } catch (error) {
            alert("Failed to submit feedback.");
        }
    };

    return (
        <div className="container mx-auto px-6 py-8 md:py-12 max-w-6xl relative">
            {/* Flagged Warning */}
            {(freshUser?.is_flagged || user?.is_flagged) && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded w-full">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">

                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                <span className="font-bold">Account Alert:</span> Your account has been flagged by the administration. Please <Link to="/support" className="underline hover:text-red-900">contact support</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back, <span className="font-semibold text-gray-900">{user?.first_name || user?.username}</span>!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Stats / Overview */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Career Journey</h2>
                        <div style={{ width: '100%', height: 300 }}>
                            {history.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">

                                    <LineChart data={history}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="match" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full bg-gray-50 rounded-xl flex items-center justify-center border-dashed border-2 border-gray-200">
                                    <p className="text-gray-500 text-sm">No career history yet. Generate predictions to see trends!</p>
                                </div>
                            )}
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
                            <Link to="/about" className="block w-full text-center bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium py-2 rounded-lg transition">
                                View Full Profile (About)
                            </Link>
                            <Link to="/profile" className="block w-full text-center bg-indigo-50 hover:bg-indigo-100 text-primary font-medium py-2 rounded-lg transition">
                                Update Details
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
            {
                selectedPrediction && (
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

                            {/* Feedback Section */}
                            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="font-semibold text-gray-800 mb-2 text-sm">Rate this result</h4>
                                {feedbackSubmitted ? (
                                    <p className="text-green-600 text-sm font-medium text-center py-2">Thank you for your feedback!</p>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex gap-1 justify-center" onMouseLeave={() => setHoverRating(0)}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setRating(star)}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    className={`text-2xl transition hover:scale-110 ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Optional comment..."
                                            className="w-full text-sm border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            rows="2"
                                        />
                                        <button
                                            onClick={handleFeedbackSubmit}
                                            className="w-full bg-indigo-600 text-white text-xs font-bold py-2 rounded hover:bg-indigo-700 transition"
                                        >
                                            Submit Feedback
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between mt-6">
                                <button
                                    onClick={async () => {
                                        if (window.confirm("Is this prediction incorrect? Flagging it helps improve our AI.")) {
                                            try {
                                                await api.post(`/prediction/flag/${selectedPrediction.id}/`);
                                                alert("Prediction reported. Thank you for your feedback.");
                                                setSelectedPrediction(null);
                                            } catch (e) {
                                                alert("Failed to report.");
                                            }
                                        }
                                    }}
                                    className="text-red-500 text-sm font-medium hover:text-red-700 flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-8a2 2 0 012-2h10a2 2 0 012 2v8m-6-6h6m-6 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Report Incorrect
                                </button>

                                <button
                                    onClick={() => setSelectedPrediction(null)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
            `}</style>
        </div >
    );
}

export default Dashboard;


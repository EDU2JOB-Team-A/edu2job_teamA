import { useState, useEffect } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaTrash } from "react-icons/fa";

function PredictionHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get("/prediction-history/");
            setHistory(res.data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this prediction?")) return;
        try {
            await api.delete(`/prediction-delete/${id}/`);
            setHistory(history.filter(item => item.id !== id));
        } catch (error) {
            console.error("Failed to delete prediction", error);
            alert("Failed to delete prediction");
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
    };

    return (
        <div className="container mx-auto px-6 py-8 md:py-12 max-w-4xl">
            <div className="mb-6">
                <Link to="/dashboard" className="text-gray-500 hover:text-indigo-600 flex items-center gap-2 transition">
                    <FaArrowLeft /> Back to Dashboard
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-6">Career Prediction History</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading history...</div>
                ) : history.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-700">Last Updated</th>
                                    <th className="p-4 font-semibold text-gray-700">Predicted Role</th>
                                    <th className="p-4 font-semibold text-gray-700">Match %</th>
                                    <th className="p-4 font-semibold text-gray-700">Missing Skills</th>
                                    <th className="p-4 font-semibold text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="p-4 text-sm text-gray-600">
                                            {item.updated_at ? formatDate(item.updated_at) : formatDate(item.created_at)}
                                        </td>
                                        <td className="p-4 font-medium text-gray-900">{item.role}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.match_percentage >= 80 ? 'bg-green-100 text-green-700' :
                                                    item.match_percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {item.match_percentage}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 max-w-xs truncate">
                                            {item.missing_skills.length > 0 ? item.missing_skills.join(", ") : "None"}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                                                title="Delete Prediction"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No prediction history found.
                    </div>
                )}
            </div>
        </div>
    );
}

export default PredictionHistory;

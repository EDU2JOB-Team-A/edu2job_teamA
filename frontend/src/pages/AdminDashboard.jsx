import { useState, useEffect } from "react";
import api from "../api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, statsRes, ticketsRes] = await Promise.all([
                api.get("/users/"),
                api.get("/admin/stats/"),
                api.get("/support/tickets/")
            ]);
            setUsers(usersRes.data);
            setStats(statsRes.data);
            setTickets(ticketsRes.data);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await api.delete(`/users/${id}/`);
                setUsers(users.filter(user => user.id !== id));
            } catch (error) {
                alert("Failed to delete user");
            }
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await api.patch(`/users/${id}/`, { role: newRole });
            setUsers(users.map(user =>
                user.id === id ? { ...user, role: newRole } : user
            ));
        } catch (error) {
            console.error("Failed to update role", error);
            alert("Failed to update role");
        }
    };

    const handleFlagUser = async (id, currentStatus) => {
        try {
            await api.patch(`/users/${id}/`, { is_flagged: !currentStatus });
            setUsers(users.map(user =>
                user.id === id ? { ...user, is_flagged: !currentStatus } : user
            ));
        } catch (error) {
            console.error("Failed to update flag status", error);
            alert("Failed to update flag status");
        }
    };
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            await api.post("/admin/upload-data/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Training data updated and model retrained!");
            fetchData(); // Refresh data/stats if needed
        } catch (error) {
            console.error("Upload failed", error);
            const errorMsg = error.response?.data?.error || "Failed to upload training data";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFlag = async (id) => {
        try {
            await api.post(`/prediction/flag/${id}/`);

            // Check current status in prediction_logs
            const currentLog = stats.prediction_logs.find(p => p.id === id);
            const isCurrentlyFlagged = currentLog ? currentLog.is_flagged : false; // Fallback if not in recent list

            // Update prediction_logs state
            const updatedLogs = stats.prediction_logs.map(p =>
                p.id === id ? { ...p, is_flagged: !p.is_flagged } : p
            );

            let updatedFlaggedList = [...stats.flagged_predictions];

            if (!isCurrentlyFlagged) {
                // It wasn't flagged, so now it IS flagged. Add to flagged list if not already there.
                // We need the full object. If it's in updatedLogs, use that.
                const newItem = updatedLogs.find(p => p.id === id);
                if (newItem && !updatedFlaggedList.find(f => f.id === id)) {
                    updatedFlaggedList.unshift(newItem);
                }
            } else {
                // It WAS flagged, so now unflag. Remove from flagged list.
                updatedFlaggedList = updatedFlaggedList.filter(p => p.id !== id);
            }

            setStats({
                ...stats,
                prediction_logs: updatedLogs,
                flagged_predictions: updatedFlaggedList
            });
        } catch (error) {
            console.error(error);
            alert("Failed to update flag status");
        }
    };

    const handleDeleteFeedback = async (id) => {
        if (window.confirm("Delete this feedback?")) {
            try {
                await api.delete(`/feedback/${id}/`);
                setStats({
                    ...stats,
                    recent_feedback: stats.recent_feedback.filter(f => f.id !== id)
                });
            } catch (error) {
                alert("Failed to delete feedback");
            }
        }
    };

    const handleDeletePrediction = async (id) => {
        if (window.confirm("Permanently delete this prediction log?")) {
            try {
                await api.delete(`/prediction-delete/${id}/`);
                setStats({
                    ...stats,
                    prediction_logs: stats.prediction_logs.filter(p => p.id !== id),
                    flagged_predictions: stats.flagged_predictions.filter(p => p.id !== id)
                });
            } catch (error) {
                console.error(error);
                alert("Failed to delete prediction");
            }
        }
    };

    const handleCloseTicket = async (id) => {
        if (window.confirm("Mark this ticket as Resolved?")) {
            try {
                await api.patch(`/support/tickets/${id}/`, { is_resolved: true });
                setTickets(tickets.map(t =>
                    t.id === id ? { ...t, is_resolved: true } : t
                ));
            } catch (error) {
                alert("Failed to close ticket");
            }
        }
    };


    const [searchTerm, setSearchTerm] = useState("");

    // ... useEffect ...

    // ... existing handlers ...

    // --- Search Logic ---
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Export Logic ---
    const downloadCSV = (data, filename) => {
        if (!data || data.length === 0) {
            alert("No data to export");
            return;
        }

        const headers = Object.keys(data[0]).join(",");
        const rows = data.map(obj => Object.values(obj).map(val =>
            typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
        ).join(","));

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Analytics Logic ---
    // Group users by month joined
    const userGrowthData = (() => {
        const counts = {};
        users.forEach(user => {
            const month = new Date(user.date_joined).toLocaleString('default', { month: 'short', year: 'numeric' });
            counts[month] = (counts[month] || 0) + 1;
        });

        let cumulative = 0;
        return Object.entries(counts).map(([month, count]) => {
            cumulative += count;
            return { name: month, New: count, Total: cumulative };
        });
    })();

    if (loading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;

    const chartData = stats?.top_roles.map(r => ({
        name: r.predicted_role,
        count: r.count
    })) || [];

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_users || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Flagged Predictions</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats?.flagged_predictions?.length || 0}</p>
                </div>
            </div>

            {/* Analytics & Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Career Trends */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-w-0">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Career Prediction Trends</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#4F46E5" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 text-center py-10">No prediction data available.</p>
                        )}
                    </div>
                </div>

                {/* User Growth */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-w-0">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">User Growth</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        {userGrowthData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={userGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="Total" fill="#10B981" name="Total Users" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 text-center py-10">No user data available.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Model Management & Exports */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">System Management</h3>
                    <div className="space-x-4">
                        <button
                            onClick={() => downloadCSV(users, 'users_export.csv')}
                            className="text-sm border border-gray-300 px-3 py-1 rounded hover:bg-gray-50 transition"
                        >
                            Export Users
                        </button>
                        <button
                            onClick={() => downloadCSV(stats?.prediction_logs || [], 'predictions_export.csv')}
                            className="text-sm border border-gray-300 px-3 py-1 rounded hover:bg-gray-50 transition"
                        >
                            Export Logs
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <label className="block text-gray-700 font-medium mb-2">Upload New Training Data (CSV)</label>
                    <p className="text-sm text-gray-500 mb-4">Uploading a new dataset will automatically retrain the career prediction model.</p>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100"
                    />
                </div>
            </div>



            <div className="space-y-8">
                {/* Flagged Predictions Review */}
                {stats?.flagged_predictions && stats.flagged_predictions.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
                        <div className="p-6 border-b border-red-100 bg-red-50">
                            <h2 className="text-xl font-bold text-red-800">Review Flagged Predictions</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white text-gray-600 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Role Predicted</th>
                                        <th className="px-6 py-4">Match %</th>
                                        <th className="px-6 py-4">Time</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {stats.flagged_predictions.map((log) => (
                                        <tr key={log.id} className="hover:bg-red-50">
                                            <td className="px-6 py-4 font-medium">{log.user}</td>
                                            <td className="px-6 py-4">{log.role}</td>
                                            <td className="px-6 py-4">{log.match}%</td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleFlag(log.id)}
                                                    className="text-xs bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded font-medium text-gray-700 mr-2"
                                                >
                                                    Dismiss
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePrediction(log.id)}
                                                    className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* User Management */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">User Management</h2>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-4">Username</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Flag</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className={`hover:bg-gray-50 transition ${user.is_flagged ? 'bg-red-50 hover:bg-red-100' : ''}`}>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {user.username}
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                            {user.is_flagged && <span className="text-xs text-red-600 font-bold">FLAGGED</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className={`border rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                                                    : 'bg-green-100 text-green-800 border-green-200'
                                                    }`}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleFlagUser(user.id, user.is_flagged)}
                                                className={`text-xs font-bold px-3 py-1 rounded border ${user.is_flagged
                                                    ? 'bg-white text-red-600 border-red-600 hover:bg-red-50'
                                                    : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {user.is_flagged ? "Unflag" : "Flag"}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-600 hover:text-red-900 font-medium text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            No users found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Support Tickets Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Support Tickets</h2>
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                            {tickets.filter(t => !t.is_resolved).length} Open
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Last Updated</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tickets.map(ticket => (
                                    <tr key={ticket.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {ticket.user_username}
                                            <div className="text-xs text-gray-500">{ticket.user_email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{ticket.subject}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.is_resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {ticket.is_resolved ? 'Resolved' : 'Open'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(ticket.updated_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button
                                                onClick={() => window.location.href = `/support`} // Ideally open a modal or navigate to specific support ID
                                                className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                                            >
                                                View
                                            </button>
                                            {!ticket.is_resolved && (
                                                <button
                                                    onClick={() => handleCloseTicket(ticket.id)}
                                                    className="text-green-600 hover:text-green-900 font-medium text-sm"
                                                >
                                                    Close
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {tickets.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No tickets found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Prediction Logs (System Wide) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800">System Logs: Prediction History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role Predicted</th>
                                    <th className="px-6 py-4">Match %</th>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats?.prediction_logs && stats.prediction_logs.length > 0 ? (
                                    stats.prediction_logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{log.user}</td>
                                            <td className="px-6 py-4">{log.role}</td>
                                            <td className="px-6 py-4">{log.match}%</td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 flex gap-2">
                                                <button
                                                    onClick={() => handleToggleFlag(log.id)}
                                                    className={`text-xs px-3 py-1 rounded font-medium border ${log.is_flagged
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {log.is_flagged ? 'Unflag' : 'Flag'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePrediction(log.id)}
                                                    className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded font-medium border border-red-100"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                            No prediction logs found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800">Recent Feedback</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {stats?.recent_feedback.map((feed) => (
                            <div key={feed.id} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-gray-900">{feed.user}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">
                                            {new Date(feed.created_at).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteFeedback(feed.id)}
                                            className="text-gray-400 hover:text-red-500 transition"
                                            title="Remove Feedback"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={`text-lg ${i < feed.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <p className="text-gray-700 text-sm">{feed.message}</p>
                            </div>
                        ))}
                        {(!stats?.recent_feedback || stats.recent_feedback.length === 0) && (
                            <p className="text-gray-500 text-center">No feedback received yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

}

export default AdminDashboard;


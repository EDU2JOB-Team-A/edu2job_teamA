import { useState, useEffect } from "react";
import api from "../api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaChartLine, FaUsers, FaTicketAlt, FaServer, FaCommentDots } from "react-icons/fa";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

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
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 bg-white shadow-lg rounded-xl overflow-hidden h-fit shrink-0">
                    <div className="p-6 bg-indigo-600 text-white text-center">
                        <h2 className="text-xl font-bold">Admin Panel</h2>
                        <p className="text-indigo-200 text-sm">Dashboard & Controls</p>
                    </div>
                    <nav className="p-2">
                        {[
                            { id: "overview", label: "Overview", icon: <FaChartLine /> },
                            { id: "users", label: "Users", icon: <FaUsers /> },
                            { id: "tickets", label: "Tickets", icon: <FaTicketAlt /> },
                            { id: "system", label: "System & Logs", icon: <FaServer /> },
                            { id: "feedback", label: "Feedback", icon: <FaCommentDots /> }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors mb-1
                                    ${activeTab === item.id
                                        ? "bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px] p-6">
                        <div className="animate-fadeIn">

                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Dashboard Overview</h2>
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Users</h3>
                                            <div className="flex items-end justify-between mt-2">
                                                <p className="text-4xl font-bold text-gray-900">{stats?.total_users || 0}</p>
                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                    <FaUsers size={24} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                                            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Flagged Predictions</h3>
                                            <div className="flex items-end justify-between mt-2">
                                                <p className="text-4xl font-bold text-red-600">{stats?.flagged_predictions?.length || 0}</p>
                                                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                                    <FaTicketAlt size={24} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Charts */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4">Career Prediction Trends</h3>
                                            <div className="h-64">
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
                                                ) : <p className="text-gray-400 text-center py-10">No data</p>}
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4">User Growth</h3>
                                            <div className="h-64">
                                                {userGrowthData.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={userGrowthData}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="name" />
                                                            <YAxis allowDecimals={false} />
                                                            <Tooltip />
                                                            <Bar dataKey="Total" fill="#10B981" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                ) : <p className="text-gray-400 text-center py-10">No data</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* USERS TAB */}
                            {activeTab === 'users' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b pb-4">
                                        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                                        <button onClick={() => downloadCSV(users, 'users_export.csv')} className="text-sm border border-gray-300 px-3 py-1 rounded hover:bg-gray-50">
                                            Export CSV
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search users by name or email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                        <div className="absolute left-3 top-3 text-gray-400">🔍</div>
                                    </div>

                                    <div className="overflow-x-auto border rounded-xl">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                                                <tr>
                                                    <th className="px-6 py-4">User</th>
                                                    <th className="px-6 py-4">Role</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {filteredUsers.map((user) => (
                                                    <tr key={user.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-gray-900">{user.username}</div>
                                                            <div className="text-xs text-gray-500">{user.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <select
                                                                value={user.role}
                                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                                className={`border rounded px-2 py-1 text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                                                    }`}
                                                            >
                                                                <option value="user">User</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {user.is_flagged ?
                                                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">Flagged</span> :
                                                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">Active</span>
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 flex gap-2">
                                                            <button
                                                                onClick={() => handleFlagUser(user.id, user.is_flagged)}
                                                                className="text-xs border px-2 py-1 rounded hover:bg-gray-100"
                                                            >
                                                                {user.is_flagged ? "Unflag" : "Flag"}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 font-medium"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* TICKETS TAB */}
                            {activeTab === 'tickets' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Support Tickets</h2>
                                    <div className="overflow-x-auto border rounded-xl">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                                                <tr>
                                                    <th className="px-6 py-4">User</th>
                                                    <th className="px-6 py-4">Subject</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4">Updated</th>
                                                    <th className="px-6 py-4">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {tickets.map(ticket => (
                                                    <tr key={ticket.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 text-gray-900 font-medium">{ticket.user_username}</td>
                                                        <td className="px-6 py-4 text-sm max-w-xs truncate">{ticket.subject}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.is_resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                {ticket.is_resolved ? 'Resolved' : 'Open'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-gray-500">{new Date(ticket.updated_at).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4 flex gap-2">
                                                            <button onClick={() => window.location.href = `/support`} className="text-indigo-600 text-sm font-medium hover:underline">View</button>
                                                            {!ticket.is_resolved && (
                                                                <button onClick={() => handleCloseTicket(ticket.id)} className="text-green-600 text-sm font-medium hover:underline">Close</button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {tickets.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-gray-500">No tickets found.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* SYSTEM TAB */}
                            {activeTab === 'system' && (
                                <div className="space-y-8">
                                    <div className="flex justify-between items-center border-b pb-4">
                                        <h2 className="text-2xl font-bold text-gray-800">System & Logs</h2>
                                        <div className="flex gap-2">
                                            <button onClick={() => downloadCSV(stats?.prediction_logs || [], 'predictions_export.csv')} className="text-sm border border-gray-300 px-3 py-1 rounded hover:bg-gray-50">
                                                Export Logs
                                            </button>
                                        </div>
                                    </div>

                                    {/* Upload */}
                                    <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                                        <h3 className="font-bold text-indigo-900 mb-2">Update AI Model Data</h3>
                                        <p className="text-sm text-indigo-700 mb-4">Upload a new CSV dataset to retrain the career prediction model.</p>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-white file:text-indigo-700
                                            file:shadow-sm
                                            hover:file:bg-indigo-50"
                                        />
                                    </div>

                                    {/* Flagged Table */}
                                    {stats?.flagged_predictions?.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-bold text-red-700 mb-3 border-l-4 border-red-500 pl-3">Flagged Predictions</h3>
                                            <div className="overflow-x-auto border border-red-100 rounded-xl">
                                                <table className="w-full text-left">
                                                    <thead className="bg-red-50 text-red-800 text-sm uppercase">
                                                        <tr>
                                                            <th className="px-6 py-3">User</th>
                                                            <th className="px-6 py-3">Prediction</th>
                                                            <th className="px-6 py-3">Score</th>
                                                            <th className="px-6 py-3">Options</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-red-50">
                                                        {stats.flagged_predictions.map(log => (
                                                            <tr key={log.id} className="bg-red-50/30">
                                                                <td className="px-6 py-3 font-medium">{log.user}</td>
                                                                <td className="px-6 py-3">{log.role}</td>
                                                                <td className="px-6 py-3">{log.match}%</td>
                                                                <td className="px-6 py-3 flex gap-2">
                                                                    <button onClick={() => handleToggleFlag(log.id)} className="text-xs bg-white border px-2 py-1 rounded">Dismiss</button>
                                                                    <button onClick={() => handleDeletePrediction(log.id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Delete</button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* All Logs Table */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-3">All Prediction Logs</h3>
                                        <div className="overflow-x-auto border rounded-xl max-h-[500px] overflow-y-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 text-gray-600 text-sm uppercase sticky top-0">
                                                    <tr>
                                                        <th className="px-6 py-3">User</th>
                                                        <th className="px-6 py-3">Role</th>
                                                        <th className="px-6 py-3">Match</th>
                                                        <th className="px-6 py-3">Time</th>
                                                        <th className="px-6 py-3">Flag</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {stats?.prediction_logs?.map(log => (
                                                        <tr key={log.id}>
                                                            <td className="px-6 py-3">{log.user}</td>
                                                            <td className="px-6 py-3 font-medium">{log.role}</td>
                                                            <td className="px-6 py-3">{log.match}%</td>
                                                            <td className="px-6 py-3 text-xs text-gray-400">{new Date(log.created_at).toLocaleDateString()}</td>
                                                            <td className="px-6 py-3">
                                                                <button onClick={() => handleToggleFlag(log.id)} className={`text-xs px-2 py-1 rounded border ${log.is_flagged ? 'bg-red-50 text-red-600 border-red-200' : 'text-gray-400'}`}>
                                                                    {log.is_flagged ? 'Flagged' : 'Flag'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FEEDBACK TAB */}
                            {activeTab === 'feedback' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">User Feedback</h2>
                                    <div className="grid grid-cols-1 gap-4">
                                        {stats?.recent_feedback?.length > 0 ? stats.recent_feedback.map(feed => (
                                            <div key={feed.id} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-gray-900">{feed.user}</p>
                                                        <div className="flex text-yellow-400 my-1">
                                                            {[...Array(5)].map((_, i) => <span key={i}>{i < feed.rating ? '★' : '☆'}</span>)}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleDeleteFeedback(feed.id)} className="text-gray-400 hover:text-red-500">✕</button>
                                                </div>
                                                <p className="text-gray-700 mt-2">"{feed.message}"</p>
                                                <p className="text-xs text-gray-400 mt-4">{new Date(feed.created_at).toLocaleString()}</p>
                                            </div>
                                        )) : <p className="text-gray-500 text-center py-10">No feedback yet.</p>}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );

}

export default AdminDashboard;


import { useState } from "react";
import api from "../api";

function ChangePasswordSection() {
    const [formData, setFormData] = useState({
        old_password: "",
        new_password: "",
        confirm_password: ""
    });
    const [message, setMessage] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.new_password !== formData.confirm_password) {
            setMessage({ type: "error", text: "New passwords do not match." });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await api.post("/change-password/", formData);
            setMessage({ type: "success", text: "Password changed successfully." });
            setFormData({
                old_password: "",
                new_password: "",
                confirm_password: ""
            });
        } catch (error) {
            console.error("Change Password Error:", error);
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                const errorMsg = Object.values(errorData).flat().join(" ");
                setMessage({ type: "error", text: errorMsg || "Failed to change password." });
            } else {
                setMessage({ type: "error", text: "Failed to change password." });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Change Password</h2>

            {message.text && (
                <div className={`p-3 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-md">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
                    <input
                        type="password"
                        name="old_password"
                        value={formData.old_password}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                        type="password"
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                        type="password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
                >
                    {loading ? "Changing..." : "Change Password"}
                </button>
            </form>
        </div>
    );
}

export default ChangePasswordSection;

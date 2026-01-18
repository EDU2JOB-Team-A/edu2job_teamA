import { useState, useEffect } from "react";
import api from "../api";

function JobHistorySection() {
    const [jobs, setJobs] = useState([]);
    const [formData, setFormData] = useState({
        company: "",
        role: "",
        start_date: "",
        end_date: "",
        description: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await api.get("/job-history/");
            setJobs(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/job-history/", formData);
            fetchJobs();
            setFormData({
                company: "",
                role: "",
                start_date: "",
                end_date: "",
                description: ""
            });
        } catch (error) {
            alert("Failed to add job history");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/job-history/${id}/`);
            fetchJobs();
        } catch (error) {
            alert("Failed to delete");
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Work Experience</h2>

            <div className="space-y-4 mb-8">
                {jobs.map((job) => (
                    <div key={job.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <h3 className="font-bold text-lg">{job.role}</h3>
                            <p className="text-gray-600">{job.company}</p>
                            <p className="text-sm text-gray-500">{job.start_date} - {job.end_date || 'Present'}</p>
                            {job.description && <p className="text-sm text-gray-600 mt-2">{job.description}</p>}
                        </div>
                        <button
                            onClick={() => handleDelete(job.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                            Delete
                        </button>
                    </div>
                ))}
                {jobs.length === 0 && <p className="text-gray-500 italic">No work experience added yet.</p>}
            </div>

            <form onSubmit={handleSubmit} className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-4 text-gray-700">Add New Job</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        placeholder="Job Role"
                        className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                    <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Company"
                        className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">Start Date</label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">End Date</label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Description"
                        className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none md:col-span-2"
                        rows="3"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
                >
                    {loading ? "Adding..." : "Add Job"}
                </button>
            </form>
        </div>
    );
}

export default JobHistorySection;

import { useState, useEffect } from "react";
import api from "../api";

function EducationSection() {
    const [educations, setEducations] = useState([]);
    const [formData, setFormData] = useState({
        institution: "",
        degree: "",
        start_year: "",
        end_year: "",
        grade: "",
        cgpa: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEducations();
    }, []);

    const fetchEducations = async () => {
        try {
            const res = await api.get("/education/");
            setEducations(res.data);
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

        const payload = { ...formData };
        if (payload.cgpa === "") payload.cgpa = null;
        if (payload.end_year === "") payload.end_year = null;
        if (payload.grade === "") payload.grade = ""; // Explicitly allow empty string for CharField

        try {
            await api.post("/education/", payload);
            fetchEducations();
            setFormData({
                institution: "",
                degree: "",
                start_year: "",
                end_year: "",
                grade: "",
                cgpa: ""
            });
        } catch (error) {
            console.error("Add Education Error:", error);
            if (error.response && error.response.data) {
                // Format validation errors
                const errorData = error.response.data;
                const errorMessages = Object.keys(errorData).map(key => {
                    const messages = Array.isArray(errorData[key]) ? errorData[key].join(", ") : errorData[key];
                    return `${key}: ${messages}`;
                }).join("\n");
                alert(`Failed to add education:\n${errorMessages}`);
            } else {
                alert("Failed to add education. Please check your connection and try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/education/${id}/`);
            fetchEducations();
        } catch (error) {
            alert("Failed to delete");
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Education</h2>

            <div className="space-y-4 mb-8">
                {educations.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <h3 className="font-bold text-lg">{edu.degree}</h3>
                            <p className="text-gray-600">{edu.institution}</p>
                            <p className="text-sm text-gray-500">{edu.start_year} - {edu.end_year || 'Present'}</p>
                            <div className="flex gap-4 mt-1">
                                {edu.grade && <p className="text-sm text-gray-500">Grade: {edu.grade}</p>}
                                {edu.cgpa && <p className="text-sm text-gray-500">CGPA: {edu.cgpa}</p>}
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(edu.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                            Delete
                        </button>
                    </div>
                ))}
                {educations.length === 0 && <p className="text-gray-500 italic">No education details added yet.</p>}
            </div>

            <form onSubmit={handleSubmit} className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-4 text-gray-700">Add New Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        name="institution"
                        value={formData.institution}
                        onChange={handleChange}
                        placeholder="Institution"
                        className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                    <input
                        type="text"
                        name="degree"
                        value={formData.degree}
                        onChange={handleChange}
                        placeholder="Degree"
                        className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                    <input
                        type="number"
                        name="start_year"
                        value={formData.start_year}
                        onChange={handleChange}
                        placeholder="Start Year"
                        className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                    <input
                        type="number"
                        name="end_year"
                        value={formData.end_year}
                        onChange={handleChange}
                        placeholder="End Year (Optional)"
                        className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                    />
                    <input
                        type="text"
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                        placeholder="Grade (Optional)"
                        className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                    />
                    <input
                        type="number"
                        step="0.01"
                        name="cgpa"
                        value={formData.cgpa}
                        onChange={handleChange}
                        placeholder="CGPA (Optional)"
                        className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
                >
                    {loading ? "Adding..." : "Add Education"}
                </button>
            </form>
        </div>
    );
}

export default EducationSection;

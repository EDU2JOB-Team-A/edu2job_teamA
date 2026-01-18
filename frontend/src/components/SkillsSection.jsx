import { useState, useEffect } from "react";
import api from "../api";

function SkillsSection() {
    const [skills, setSkills] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        proficiency: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const res = await api.get("/skills/");
            setSkills(res.data);
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
            await api.post("/skills/", formData);
            fetchSkills();
            setFormData({
                name: "",
                proficiency: ""
            });
        } catch (error) {
            alert("Failed to add skill");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/skills/${id}/`);
            fetchSkills();
        } catch (error) {
            alert("Failed to delete");
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Skills</h2>

            <div className="bg-white rounded-lg border border-gray-100 p-4 mb-8">
                {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                            <div key={skill.id} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100">
                                <span className="font-medium">{skill.name}</span>
                                {skill.proficiency && <span className="text-xs text-indigo-500">({skill.proficiency})</span>}
                                <button onClick={() => handleDelete(skill.id)} className="text-indigo-400 hover:text-red-500 ml-1">
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No skills added yet.</p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-4 text-gray-700">Add New Skill</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Skill Name (e.g. Python)"
                        className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                    <select
                        name="proficiency"
                        value={formData.proficiency}
                        onChange={handleChange}
                        className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                    >
                        <option value="">Select Proficiency (Optional)</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
                >
                    {loading ? "Adding..." : "Add Skill"}
                </button>
            </form>
        </div>
    );
}

export default SkillsSection;

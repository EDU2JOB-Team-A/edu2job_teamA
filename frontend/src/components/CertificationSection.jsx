import { useState, useEffect } from "react";
import api from "../api";

function CertificationSection() {
    const [certifications, setCertifications] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        issuing_organization: "",
        issue_date: "",
        expiration_date: "",
        credential_id: "",
        credential_url: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCertifications();
    }, []);

    const fetchCertifications = async () => {
        try {
            const res = await api.get("/certifications/");
            setCertifications(res.data);
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
        if (payload.expiration_date === "") payload.expiration_date = null;

        try {
            await api.post("/certifications/", payload);
            fetchCertifications();
            setFormData({
                name: "",
                issuing_organization: "",
                issue_date: "",
                expiration_date: "",
                credential_id: "",
                credential_url: ""
            });
        } catch (error) {
            console.error("Add Certification Error:", error);
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                const errorMessages = Object.keys(errorData).map(key => {
                    const messages = Array.isArray(errorData[key]) ? errorData[key].join(", ") : errorData[key];
                    return `${key}: ${messages}`;
                }).join("\n");
                alert(`Failed to add certification:\n${errorMessages}`);
            } else {
                alert("Failed to add certification.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/certifications/${id}/`);
            fetchCertifications();
        } catch (error) {
            alert("Failed to delete");
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Certifications</h2>

            <div className="space-y-4 mb-8">
                {certifications.map((cert) => (
                    <div key={cert.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <h3 className="font-bold text-lg">{cert.name}</h3>
                            <p className="text-gray-600">{cert.issuing_organization}</p>
                            <p className="text-sm text-gray-500">Issued: {cert.issue_date}{cert.expiration_date ? `, Expires: ${cert.expiration_date}` : ''}</p>
                            {cert.credential_id && <p className="text-sm text-gray-500">Credential ID: {cert.credential_id}</p>}
                            {cert.credential_url && (
                                <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                                    View Credential
                                </a>
                            )}
                        </div>
                        <button
                            onClick={() => handleDelete(cert.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                            Delete
                        </button>
                    </div>
                ))}
                {certifications.length === 0 && <p className="text-gray-500 italic">No certifications added yet.</p>}
            </div>

            <form onSubmit={handleSubmit} className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-4 text-gray-700">Add New Certification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Certification Name"
                        className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                    <input
                        type="text"
                        name="issuing_organization"
                        value={formData.issuing_organization}
                        onChange={handleChange}
                        placeholder="Issuing Organization"
                        className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        required
                    />
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">Issue Date</label>
                        <input
                            type="date"
                            name="issue_date"
                            value={formData.issue_date}
                            onChange={handleChange}
                            className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">Expiration Date (Optional)</label>
                        <input
                            type="date"
                            name="expiration_date"
                            value={formData.expiration_date}
                            onChange={handleChange}
                            className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <input
                        type="text"
                        name="credential_id"
                        value={formData.credential_id}
                        onChange={handleChange}
                        placeholder="Credential ID (Optional)"
                        className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                    />
                    <input
                        type="url"
                        name="credential_url"
                        value={formData.credential_url}
                        onChange={handleChange}
                        placeholder="Credential URL (Optional)"
                        className="p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
                >
                    {loading ? "Adding..." : "Add Certification"}
                </button>
            </form>
        </div>
    );
}

export default CertificationSection;

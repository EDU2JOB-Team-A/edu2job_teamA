import { useState, useEffect } from "react";
import api from "../api";
import EducationSection from "../components/EducationSection";
import JobHistorySection from "../components/JobHistorySection";
import SkillsSection from "../components/SkillsSection";
import CertificationSection from "../components/CertificationSection";
import ChangePasswordSection from "../components/ChangePasswordSection";
import { FaUserGraduate, FaBriefcase, FaTools, FaCertificate, FaLock, FaCamera, FaImage } from "react-icons/fa";

function Profile() {
    const [activeTab, setActiveTab] = useState("education");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const res = await api.get("/profile/");
            setUser(res.data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
        }
    };

    const handleImageUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append(field, file);

        try {
            setLoading(true);
            await api.patch("/profile/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            fetchUserProfile(); // Refresh data
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image.");
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { id: "education", label: "Education", icon: <FaUserGraduate />, component: <EducationSection /> },
        { id: "experience", label: "Work Experience", icon: <FaBriefcase />, component: <JobHistorySection /> },
        { id: "skills", label: "Skills", icon: <FaTools />, component: <SkillsSection /> },
        { id: "certifications", label: "Certifications", icon: <FaCertificate />, component: <CertificationSection /> },
        { id: "settings", label: "Settings", icon: <FaLock />, component: <ChangePasswordSection /> },
    ];

    if (!user) return <div className="p-10 text-center">Loading profile...</div>;

    const bannerStyle = user.banner_image
        ? { backgroundImage: `url(${user.banner_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { backgroundColor: '#4f46e5' }; // Default indigo-600

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar */}
                <aside className="w-full md:w-1/4 bg-white shadow-lg rounded-xl overflow-hidden h-fit">
                    <div className="relative h-32 bg-indigo-600" style={bannerStyle}>
                        <div className="absolute top-2 right-2">
                            <label className="cursor-pointer bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition">
                                <FaImage size={14} />
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner_image')} />
                            </label>
                        </div>
                    </div>

                    <div className="px-6 pb-6 text-center -mt-12 relative">
                        <div className="w-24 h-24 mx-auto bg-white p-1 rounded-full shadow-lg relative cursor-pointer group">
                            <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
                                {user.profile_photo ? (
                                    <img src={user.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white text-2xl font-bold">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Overlay for upload */}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full transition cursor-pointer">
                                <FaCamera />
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile_photo')} />
                            </label>
                        </div>

                        <h2 className="text-xl font-bold mt-3 text-gray-800">{user.username}</h2>
                        <p className="text-gray-500 text-sm mb-4">{user.email}</p>
                        {user.role && <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide">{user.role}</p>}
                    </div>

                    <nav className="p-2 border-t border-gray-100">
                        {menuItems.map((item) => (
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

                {/* Main Content */}
                <main className="w-full md:w-3/4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
                        {/* Header for Mobile/Title */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {menuItems.find(i => i.id === activeTab)?.label}
                            </h2>
                        </div>

                        {/* Content Area */}
                        <div className="p-2 md:p-6 bg-gray-50/50">
                            <div className="animate-fadeIn">
                                {menuItems.find(i => i.id === activeTab)?.component}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

export default Profile;

import { useState, useEffect } from "react";
import api from "../api";
import { FaGraduationCap, FaBriefcase, FaTools, FaCertificate, FaUser } from "react-icons/fa";

function About() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await api.get("/profile/");
                setUser(res.data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    if (loading) return <div className="p-10 text-center text-indigo-600 font-bold">Loading your profile details...</div>;
    if (!user) return <div className="p-10 text-center text-red-500">Failed to load profile.</div>;

    const bannerStyle = user.banner_image
        ? { backgroundImage: `url(${user.banner_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { backgroundColor: '#4f46e5' };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header / Banner */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                <div className="h-40 bg-indigo-600" style={bannerStyle}></div>
                <div className="px-8 pb-8 text-center -mt-16">
                    <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200 mx-auto shadow-md">
                            {user.profile_photo ? (
                                <img src={user.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white text-4xl font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mt-4">{user.first_name} {user.last_name}</h1>
                    <p className="text-gray-500">@{user.username} • Joined {new Date(user.date_joined).getFullYear()}</p>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Education */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4 text-indigo-600">
                        <FaGraduationCap size={20} />
                        <h2 className="text-xl font-bold text-gray-800">Education</h2>
                    </div>
                    {user.education && user.education.length > 0 ? (
                        <ul className="space-y-4">
                            {user.education.map((edu) => (
                                <li key={edu.id} className="border-l-2 border-indigo-200 pl-4 py-1">
                                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                                    <p className="text-sm text-gray-600">{edu.institution}</p>
                                    <p className="text-xs text-gray-400">{edu.start_year} - {edu.end_year || 'Present'}</p>
                                    {edu.cgpa && <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">CGPA: {edu.cgpa}</span>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 italic text-sm">No education details added.</p>
                    )}
                </div>

                {/* Experience */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4 text-blue-600">
                        <FaBriefcase size={20} />
                        <h2 className="text-xl font-bold text-gray-800">Experience</h2>
                    </div>
                    {user.job_history && user.job_history.length > 0 ? (
                        <ul className="space-y-4">
                            {user.job_history.map((job) => (
                                <li key={job.id} className="border-l-2 border-blue-200 pl-4 py-1">
                                    <h3 className="font-semibold text-gray-900">{job.role}</h3>
                                    <p className="text-sm text-gray-600">{job.company}</p>
                                    <p className="text-xs text-gray-400">{job.start_date} - {job.end_date || 'Present'}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 italic text-sm">No work experience added.</p>
                    )}
                </div>

                {/* Skills */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4 text-green-600">
                        <FaTools size={20} />
                        <h2 className="text-xl font-bold text-gray-800">Skills</h2>
                    </div>
                    {user.skills && user.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {user.skills.map((skill) => (
                                <span key={skill.id} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-100">
                                    {skill.name} <span className="opacity-50 text-xs">• {skill.proficiency}</span>
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic text-sm">No skills added.</p>
                    )}
                </div>

                {/* Certifications */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4 text-orange-500">
                        <FaCertificate size={20} />
                        <h2 className="text-xl font-bold text-gray-800">Certifications</h2>
                    </div>
                    {user.certifications && user.certifications.length > 0 ? (
                        <ul className="space-y-3">
                            {user.certifications.map((cert) => (
                                <li key={cert.id} className="flex flex-col text-sm">
                                    <span className="font-semibold text-gray-800">{cert.name}</span>
                                    <span className="text-gray-500 text-xs">{cert.issuing_organization} • {cert.issue_date}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 italic text-sm">No certifications added.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default About;

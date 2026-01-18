import api from "../api";
import { FaDownload, FaFilePdf } from "react-icons/fa";

function ResumeSection() {

    const handleDownload = async () => {
        try {
            const response = await api.get('/generate-resume/', {
                responseType: 'blob', // Important for binary data
            });

            // Create a blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'resume.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to download resume. Please ensure you have added education and other details.");
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Resume Builder</h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                Generate an ATS-friendly professional resume using the details from your Education, Work Experience, Skills, and Certifications.
            </p>

            <div className="flex flex-col items-center justify-center space-y-4">
                <FaFilePdf className="text-6xl text-red-500" />

                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition shadow-lg"
                >
                    <FaDownload />
                    Download Resume (PDF)
                </button>
            </div>
        </div>
    );
}

export default ResumeSection;

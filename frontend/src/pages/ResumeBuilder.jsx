import ResumeSection from "../components/ResumeSection";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function ResumeBuilder() {
    return (
        <div className="container mx-auto px-6 py-8 md:py-12 max-w-4xl">
            <div className="mb-6">
                <Link to="/dashboard" className="text-gray-500 hover:text-indigo-600 flex items-center gap-2 transition">
                    <FaArrowLeft /> Back to Dashboard
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-indigo-600 p-8 text-white text-center">
                    <h1 className="text-3xl font-bold mb-2">Resume Generator</h1>
                    <p className="text-indigo-100">Create a professional resume in seconds</p>
                </div>

                <div className="p-8">
                    <ResumeSection />
                </div>
            </div>
        </div>
    );
}

export default ResumeBuilder;

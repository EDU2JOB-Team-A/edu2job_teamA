import EducationSection from "../components/EducationSection";
import JobHistorySection from "../components/JobHistorySection";

function Profile() {
    return (
        <div className="container mx-auto px-6 py-8 md:py-12 max-w-4xl">
            <div className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-2">Manage your education and work experience to improve job matching.</p>
            </div>

            <div className="space-y-8">
                <EducationSection />
                <JobHistorySection />
            </div>
        </div>
    );
}

export default Profile;

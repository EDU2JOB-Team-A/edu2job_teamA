import { Link } from "react-router-dom";

function LandingPage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-white overflow-hidden">
                <div className="container mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2 space-y-6">
                            <span className="inline-block bg-indigo-50 text-primary px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
                                AI-Powered Career Guidance
                            </span>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                                Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Education</span> Into A Dream Career
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                                Edu2Job analyzes your academic background and skills to predict the perfect job roles for you. Build your profile, get matched, and launch your career.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <Link to="/register" className="bg-primary hover:bg-indigo-700 text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                                    Get Started Free
                                </Link>
                                <a href="#features" className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-3.5 rounded-full font-bold shadow-sm hover:shadow-md transition">
                                    Learn More
                                </a>
                            </div>
                        </div>
                        <div className="md:w-1/2 relative">
                            <div className="bg-gradient-to-tr from-blue-100 to-purple-100 rounded-3xl p-8 transform rotate-3 shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Students collaboration"
                                    className="rounded-2xl shadow-lg transform -rotate-3 transition hover:rotate-0 duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Edu2Job?</h2>
                        <p className="text-gray-600">We use advanced AI algorithms to bridge the gap between where you are and where you want to be.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Smart Role Prediction",
                                desc: "Our AI analyzes your grades, degrees, and interests to suggest the most suitable job roles.",
                                icon: "🎯"
                            },
                            {
                                title: "Resume Builder",
                                desc: "Create professional resumes automatically generated from your profile data.",
                                icon: "📝"
                            },
                            {
                                title: "Skill Gap Analysis",
                                desc: "Identify missing skills for your dream job and get recommendations on how to acquire them.",
                                icon: "📊"
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gray-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-10 rounded-full transform translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Shape Your Future?</h2>
                    <p className="text-gray-400 mb-8 max-w-xl mx-auto">Join thousands of students and professionals who are finding their perfect career path with Edu2Job.</p>
                    <Link to="/register" className="bg-white text-gray-900 px-8 py-3.5 rounded-full font-bold shadow-lg hover:bg-gray-100 transition transform hover:scale-105">
                        Create Your Free Profile
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default LandingPage;

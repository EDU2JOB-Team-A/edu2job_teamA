function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
            <a href="/" className="text-primary hover:underline text-lg">Go back Home</a>
        </div>
    );
}

export default NotFound;

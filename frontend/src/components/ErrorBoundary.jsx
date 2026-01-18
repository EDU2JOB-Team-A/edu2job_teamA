import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#FEF2F2', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 style={{ color: '#991B1B', fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong.</h1>
                    <details style={{ textAlign: 'left', whiteSpace: 'pre-wrap', backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FECACA', maxWidth: '800px', width: '100%' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                        style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}
                    >
                        Clear Data & Login Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

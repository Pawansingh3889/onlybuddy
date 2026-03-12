import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>⚠️</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 12, color: '#0F172A' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#64748B', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
            An unexpected error occurred. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: '#6366F1', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

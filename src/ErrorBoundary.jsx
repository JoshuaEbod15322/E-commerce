// src/ErrorBoundary.jsx
import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>⚠️ Something went wrong</h2>
            <p className="error-message">
              {this.state.error && this.state.error.toString()}
            </p>
            <details className="error-details">
              <summary>Error Details</summary>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </details>
            <div className="error-actions">
              <button onClick={this.handleReload} className="reload-btn">
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="try-again-btn"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

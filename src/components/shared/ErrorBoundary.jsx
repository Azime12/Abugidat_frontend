import { Component } from "react";
import { MdErrorOutline, MdRefresh, MdHome } from "react-icons/md";
import AbugidaLogo from "../AbugidaLogo";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MdErrorOutline size={40} className="text-red-500" />
            </div>

            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <AbugidaLogo size={28} variant="icon" />
              <span className="font-bold text-lg text-primary">Abugida</span>
            </div>

            {/* Error title */}
            <h2 className="text-xl font-bold text-text-main mb-2">
              Something went wrong
            </h2>
            <p className="text-text-sub text-sm mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>

            {/* Error details (dev only) */}
            {this.props.showError && this.state.error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-left">
                <p className="text-xs font-mono text-red-600 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium"
              >
                <MdRefresh size={16} />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-text-sub border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <MdHome size={16} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

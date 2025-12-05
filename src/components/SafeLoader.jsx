// src/components/SafeLoader.jsx
import React, { useEffect, useState } from "react";

const SafeLoader = ({ children, timeout = 8000 }) => {
  const [showFallback, setShowFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn("Loading timeout reached, showing fallback");
        setShowFallback(true);
        setIsLoading(false);
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, isLoading]);

  // When children are ready, stop loading
  useEffect(() => {
    if (children && isLoading) {
      console.log("Children ready, stopping loader");
      setIsLoading(false);
    }
  }, [children, isLoading]);

  // Show fallback UI if loading times out
  if (showFallback) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Taking longer than expected
          </h2>
          <p className="text-gray-600 mb-6">
            The page is taking too long to load. This could be due to:
          </p>
          <ul className="text-left text-gray-600 mb-6 space-y-2">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
              Slow internet connection
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
              Server taking time to respond
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
              Large amount of data being loaded
            </li>
          </ul>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Refresh Page
            </button>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading spinner while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-gray-600 text-lg font-medium">
          Loading your experience...
        </p>
        <p className="mt-2 text-gray-400 text-sm">
          This should only take a moment
        </p>
        <div className="mt-8 w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-[loadingBar_2s_ease-in-out_infinite]"></div>
        </div>

        <style jsx>{`
          @keyframes loadingBar {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );
  }

  // Render children when not loading
  return <>{children}</>;
};

export default SafeLoader;

import React from 'react';

const LoadingSpinner: React.FC<{text?: string}> = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        <div className="text-center">
            <svg
                className="animate-spin h-12 w-12 text-blue-900 mx-auto flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                {/* Background circle */}
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                ></circle>
                {/* Spinning arc with rounded corners */}
                <circle
                    className="opacity-75"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="80, 200"
                    strokeDashoffset="-20"
                ></circle>
            </svg>
            <p className="mt-4 text-lg font-semibold text-gray-700">{text}</p>
        </div>
    </div>
  );
};

export default LoadingSpinner;
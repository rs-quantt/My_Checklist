import React from 'react';

const LoadingSpinner: React.FC<{text: string}> = ({ text }) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen text-4xl text-blue-600 font-bold">
      <div className="relative w-16 h-16 flex justify-center items-center"> {/* Updated size here */}
        <div className="absolute w-full h-full border-8 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
        <img src="/check.png" alt="Checkmark icon" className="text-blue-500 text-4xl" />

      </div>
      <p className="mt-4 text-2xl">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
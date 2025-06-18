import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100 font-inter p-4 sm:p-6 lg:p-8">
      {/* Main Container for the 404 Page */}
      <div className="bg-gray-800 p-8 sm:p-10 rounded-xl shadow-2xl text-center max-w-xl w-full transition-all duration-300 ease-in-out transform scale-95 opacity-0 animate-scale-in">
        
        {/* Large 404 Text */}
        <h1 className="text-7xl sm:text-8xl lg:text-9xl font-extrabold text-blue-500 mb-4 animate-bounce-slow">
          404
        </h1>
        
        {/* Not Found Message */}
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Page Not Found
        </h2>
        
        {/* Descriptive Text */}
        <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-md mx-auto">
          Oops! It seems like the page you're trying to reach doesn't exist or has been moved.
        </p>
        
        {/* Go Home Button */}
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;


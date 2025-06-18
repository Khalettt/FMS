import React from 'react';
// import "./css/home.css"
function Home() {
  return (
    <div className="home relative min-h-screen  flex items-center justify-center overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-5xl lg:text-7xl font-extrabold text-black  mb-4 sm:mb-6">
          Empowering Farmers with Smart Solutions
        </h1>
        <p className="text-lg sm:text-xl lg:text-3xl text-black font-semibold mb-6 sm:mb-8">
          Discover how technology is transforming agriculture for a better tomorrow.
        </p>
        <a href="#" className="inline-block bg-green-700 hover:bg-green-900 text-white font-bold py-3 px-8 rounded-xl shadow-xs transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75">
          Get Started
        </a>
      </div>
    </div>
  );
}

export default Home;

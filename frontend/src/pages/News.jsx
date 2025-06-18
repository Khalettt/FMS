import React from 'react';
import news1 from "./../images/news1.jpg";
import new2 from "./../images/new2.jpg";
import news3 from "./../images/new3.jpg";

function News() {
  return (
    <div className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-10">Latest Agricultural News</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
            <img
              src={news1}
              className="w-full h-48 object-cover"
              alt="News 1"
            />
            <div className="p-6 flex flex-col flex-grow">
              <h5 className="text-xl font-semibold text-gray-800 mb-2">New Irrigation Technology Adopted by Farmers</h5>
              <p className="text-gray-600 mb-4 flex-grow">
                Farmers across the region are now using smart irrigation systems to save water and increase crop yield.
              </p>
              <a href="#" className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out self-start">Read More</a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
            <img
              src={new2}
              className="w-full h-48 object-cover"
              alt="News 2"
            />
            <div className="p-6 flex flex-col flex-grow">
              <h5 className="text-xl font-semibold text-gray-800 mb-2">Government Launches New Support Program</h5>
              <p className="text-gray-600 mb-4 flex-grow">
                A new subsidy program is being introduced to help small-scale farmers get access to modern tools.
              </p>
              <a href="#" className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out self-start">Read More</a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
            <img
              src={news3}
              className="w-full h-48 object-cover"
              alt="News 3"
            />
            <div className="p-6 flex flex-col flex-grow">
              <h5 className="text-xl font-semibold text-gray-800 mb-2">Organic Farming Gains Popularity</h5>
              <p className="text-gray-600 mb-4 flex-grow">
                More farmers are switching to organic practices as consumers demand healthier and eco-friendly food.
              </p>
              <a href="#" className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out self-start">Read More</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default News;

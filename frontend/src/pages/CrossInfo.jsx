import React from 'react';
import control from "./../images/liin.jpg";
import water from "./../images/orange.jpeg";
import fertilize from "./../images/qumbo.jpg";
import mcn from "./../images/mcn.jpg";
import qajaar from "./../images/qajar.jpg";
import tomato from "./../images/tomato.jpg";

const images = [
  { src: water, alt: "Watering Crops" },
  { src: fertilize, alt: "Fertilizing" },
  { src: control, alt: "Pest Control" },
  { src: mcn, alt: "Apple or Fruit" },
  { src: qajaar, alt: "Cucumber" },
  { src: tomato, alt: "Tomato" },
];

function TipsGuides() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-10">Essential Farming Practices</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {images.map((img, index) => (
            <div className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden" key={index}>
              <img
                src={img.src}
                className="w-full h-80 object-cover transform hover:scale-105 transition duration-300 ease-in-out"
                alt={img.alt}
              />
              <div className="p-4">
                <p className="text-lg font-semibold text-gray-800 text-center">{img.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TipsGuides;

import React from 'react';
import control from "./../images/control.jpg";
import water from "./../images/water.jpg";
import fertilize from "./../images/fertlize.jpg";

const tipsData = [
  {
    image: water,
    title: "Watering Tips",
    description: "Water your crops early in the morning or late in the evening to reduce evaporation and maximize water absorption.",
    link: "#"
  },
  {
    image: fertilize,
    title: "Use Organic Fertilizers",
    description: "Organic fertilizers improve soil structure, provide essential nutrients, and are environmentally friendly for sustainable farming.",
    link: "#"
  },
  {
    image: control,
    title: "Pest Control",
    description: "Regularly inspect your crops for signs of pests and use natural methods for pest control where possible to avoid chemical use.",
    link: "#"
  }
];

function TipsGuides() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-10">Tips & Guides</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tipsData.map((tip, index) => (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col" key={index}>
              <img
                src={tip.image}
                className="w-full h-64 object-cover transform hover:scale-105 transition duration-300 ease-in-out"
                alt={tip.title}
              />
              <div className="p-6 flex flex-col flex-grow">
                <h5 className="text-xl font-semibold text-gray-800 mb-2">{tip.title}</h5>
                <p className="text-gray-600 mb-4 flex-grow">
                  {tip.description}
                </p>
                <a href={tip.link} className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out self-start">Read More</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TipsGuides;

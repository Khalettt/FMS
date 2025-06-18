import React, { useState } from "react";
import Grapes from "./../images/graps.jpeg";
import Orange from "./../images/orange.jpeg";
import banana from "./../images/banana.jpeg";
import apple from "./../images/apple.jpeg";
import Blueberry from "./../images/Blueberry.jpeg";
import pineapple from "./../images/mcn.jpg";
import kiwi from "./../images/kiwi.jpeg";
import Papaya from "./../images/Papaya.jpeg";
import strawberry from "./../images/Starberry.jpeg";
import lemon from "./../images/lemon.jpeg";
import Watermelon from "./../images/watermelon.jpeg";
import mango from "./../images/mango.jpeg"
const fruits = [
  {
    name: "Banana",
    price: 0.5,
    rate: 3,
    kilo: "1kg",
    image: banana
  },
  {
    name: "Apple",
    price: 0.8,
    rate: 5,
    kilo: "1kg",
    image: apple
  },
  {
    name: "Orange",
    price: 0.6,
    rate: 3.5,
    kilo: "1kg",
    image: Orange
  },
  {
    name: "Mango",
    price: 1.2,
    rate: 3.7,
    kilo: "1kg",
    image: mango
  },
  {
    name: "Grapes",
    price: 2.0,
    rate: 4.5,
    kilo: "1kg",
    image: Grapes
  },
  {
    name: "Pineapple",
    price: 1.5,
    rate: 2.5,
    kilo: "1kg",
    image: pineapple
  },
  {
    name: "Kiwi",
    price: 2.5,
    rate: 3.5,
    kilo: "1kg",
    image: kiwi
  },
  {
    name: "Papaya",
    price: 1.0,
    rate: 4.5,
    kilo: "1kg",
    image: Papaya
  },
  {
    name: "Strawberry",
    price: 3.0,
    rate: 3.5,
    kilo: "1kg",
    image: strawberry
  },
  {
    name: "Lemon",
    price: 0.7,
    rate: 2.5,
    kilo: "1kg",
    image: lemon
  },
  {
    name: "Watermelon",
    price: 0.4,
    rate: 4.5,
    kilo: "1kg",
    image: Watermelon
  },
  {
    name: "Blueberry",
    price: 2.5,
    rate: 3.9,
    kilo: "1kg",
    image: Blueberry
  }
];

const renderStars = (rate) => {
  const fullStars = Math.floor(rate);
  const halfStar = rate - fullStars >= 0.5;
  const stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={i} className="text-yellow-400">⭐</span>);
  }
  if (halfStar) stars.push(<span key="half" className="text-yellow-400">⭐️</span>);
  return stars;
};

function MarketPrices() {
  const [page, setPage] = useState(0);
  const itemsPerPage = 4;

  const handleNext = () => {
    if ((page + 1) * itemsPerPage < fruits.length) {
      setPage(page + 1);
    }
  };

  const handlePrevious = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const currentFruits = fruits.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );

  return (
    <div className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-10">Market Prices</h2>
        <div className="flex justify-between mt-6 mb-8 ">
          <div>
            <button
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePrevious}
            disabled={page === 0}
          >
            Previous
          </button>
          </div>
          <div>
            <button
            className="bg-green-800 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleNext}
            disabled={(page + 1) * itemsPerPage >= fruits.length}
          >
            Next
          </button>
          </div>

        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {currentFruits.map((fruit, index) => (
            <div className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden h-full transform transition duration-300 hover:scale-105" key={index}>
              <img
                src={fruit.image}
                alt={fruit.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6 text-center flex flex-col flex-grow">
                <h5 className="text-xl font-semibold text-gray-800 mb-2">{fruit.name}</h5>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-700 font-bold">Price: ${fruit.price.toFixed(2)}</p>
                  <p className="text-gray-700 font-bold">Kilo: {fruit.kilo}</p>
                </div>
                <p className="text-gray-600 mt-auto">Rate: {renderStars(fruit.rate)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MarketPrices;

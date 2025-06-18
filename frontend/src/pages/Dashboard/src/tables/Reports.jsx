import React from 'react';
import { Footer } from '../layouts/footer';
import { Star, PencilLine, Trash } from "lucide-react";
import Apple from "../../../../images/apple.jpeg";
import Banana from "../../../../images/banana.jpeg";
import Blueberry from "../../../../images/Blueberry.jpeg";
import kiwi from "../../../../images/kiwi.jpeg";
import papaya from "../../../../images/Papaya.jpeg";
import Starberry from "../../../../images/Starberry.jpeg";
import tomato from "../../../../images/tomato.jpg";
import watermelon from "../../../../images/watermelon.jpeg";
import mango from "../../../../images/mango.jpeg"
import orange from "../../../../images/orange.jpeg";

function Reports() {
  const topFruits = [
    {
      number: 1,
      name: "Banana",
      image: Banana,
      description: "Fresh yellow bananas rich in potassium.",
      price: 0.5,
      status: "Available",
      rating: 4.8,
    },
    {
      number: 2,
      name: "Apple",
      image: Apple,
      description: "Crisp and juicy red apples.",
      price: 0.7,
      status: "Available",
      rating: 4.6,
    },
    {
      number: 3,
      name: "Mango",
      image: mango,
      description: "Sweet tropical mangoes full of flavor.",
      price: 1.2,
      status: "Out of Season",
      rating: 4.9,
    },
    {
      number: 4,
      name: "Orange",
      image: orange,
      description: "Vitamin C-rich juicy oranges.",
      price: 0.6,
      status: "Available",
      rating: 4.5,
    },
    {
      number: 5,
      name: "Strawberry",
      image: Starberry,
      description: "Fresh strawberries great for desserts.",
      price: 1.5,
      status: "Available",
      rating: 4.7,
    },
    {
      number: 6,
      name: "Tomato",
      image: tomato,
      description: "Tropical tomato with tangy sweetness.",
      price: 1.0,
      status: "Available",
      rating: 4.6,
    },
    {
      number: 7,
      name: "Watermelon",
      image: watermelon,
      description: "Refreshing and hydrating watermelon slices.",
      price: 3.0,
      status: "Available",
      rating: 4.9,
    },
    {
      number: 8,
      name: "Blueberry",
      image: Blueberry,
      description: "Sweet and seedless green grapes.",
      price: 2.5,
      status: "Out of Stock",
      rating: 4.4,
    },
    {
      number: 9,
      name: "Papaya",
      image: papaya,
      description: "Healthy papaya full of vitamins.",
      price: 1.8,
      status: "Available",
      rating: 4.3,
    },
    {
      number: 10,
      name: "Kiwi",
      image: kiwi,
      description: "Tangy kiwi fruits with rich antioxidants.",
      price: 2.0,
      status: "Available",
      rating: 4.5,
    },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <p className="card-title text-slate-900 dark:text-slate-50">
          Top Fruits
        </p>
      </div>
      <div className="card-body p-0">
        <div className="relative h-[500px] w-full overflow-auto">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row text-slate-900 dark:text-slate-50">
                <th className="table-head">#</th>
                <th className="table-head">Fruit</th>
                <th className="table-head">Price ($)</th>
                <th className="table-head">Status</th>
                <th className="table-head">Rating</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body text-slate-900 dark:text-slate-50">
              {topFruits.map((fruit) => (
                <tr key={fruit.number} className="table-row">
                  <td className="table-cell">{fruit.number}</td>
                  <td className="table-cell">
                    <div className="flex w-max gap-x-4">
                      <img
                        src={fruit.image}
                        alt={fruit.name}
                        className="size-14 rounded-lg object-cover"
                      />
                      <div className="flex flex-col">
                        <p>{fruit.name}</p>
                        <p className="font-normal text-slate-600 dark:text-slate-400">
                          {fruit.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">${fruit.price}</td>
                  <td className="table-cell">{fruit.status}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-x-2">
                      <Star size={18} className="fill-yellow-600 stroke-yellow-600" />
                      {fruit.rating}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-x-4">
                      <button className="text-blue-500 dark:text-blue-600">
                        <PencilLine size={20} />
                      </button>
                      <button className="text-red-500">
                        <Trash size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Reports;

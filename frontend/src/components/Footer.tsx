import React from "react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          <div className="mb-6 md:mb-0">
            <h5 className="text-xl font-bold text-white mb-4">SomFamers</h5>
            <p className="text-gray-400">Fresh Fruits & Vegetables App.</p>
          </div>

          <div className="mb-6 md:mb-0">
            <h5 className="text-xl font-bold text-white mb-4">Quick Links</h5>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white transition duration-300 ease-in-out">Home</a></li>
              <li><a href="#market" className="text-gray-400 hover:text-white transition duration-300 ease-in-out">Market Prices</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition duration-300 ease-in-out">Contact</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-white transition duration-300 ease-in-out">About</a></li>
            </ul>
          </div>

          <div className="mb-6 md:mb-0">
            <h5 className="text-xl font-bold text-white mb-4">Contact Us</h5>
            <p className="text-gray-400">Email: <a href="mailto:khalid@gmail.com" className="text-blue-400 hover:underline">khalid@gmail.com</a></p>
            <p className="text-gray-400">Phone: +252 61 2657715</p>
            <p className="text-gray-400">Location: Mogadishu, Somalia</p>
          </div>

          <div className="mb-6 md:mb-0">
            <h5 className="text-xl font-bold text-white mb-4">Follow Us</h5>
            <div className="flex space-x-4">
              <a href="#" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition duration-300 ease-in-out">
                <i className="fab fa-facebook-f text-lg"></i>
              </a>
              <a href="#" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition duration-300 ease-in-out">
                <i className="fab fa-twitter text-lg"></i>
              </a>
              <a href="https://wa.me/252612657715" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition duration-300 ease-in-out">
                <i className="fab fa-whatsapp text-lg"></i>
              </a>
              <a href="https://github.com/Khalettt" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition duration-300 ease-in-out">
                <i className="fab fa-github text-lg"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="text-center mt-10 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm">&copy; {currentYear} SomFamers. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

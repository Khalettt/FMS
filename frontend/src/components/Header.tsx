import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavLinkClick = (e, targetId) => {
    // Prevent default anchor link behavior for smooth scrolling
    e.preventDefault();
    setIsMobileMenuOpen(false); // Close mobile menu on link click

    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop,
        behavior: 'smooth' // Enable smooth scrolling
      });
    } else {
      window.location.href = `/#${targetId}`;
    }
  };

  return (
    <nav className="bg-gray-800 text-white  shadow-md  top-0 z-30">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <a href="#home" onClick={(e) => handleNavLinkClick(e, 'home')} className="text-2xl font-bold text-blue-400 hover:text-blue-200 transition duration-300 ease-in-out">SomFamers</a>
          </div>
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#home" onClick={(e) => handleNavLinkClick(e, 'home')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition duration-150 ease-in-out">Home</a>
              <a href="#news" onClick={(e) => handleNavLinkClick(e, 'news')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition duration-150 ease-in-out">News & Updates</a>
              <a href="#crops" onClick={(e) => handleNavLinkClick(e, 'crops')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition duration-150 ease-in-out">Crops Info</a>
              <a href="#guides" onClick={(e) => handleNavLinkClick(e, 'guides')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition duration-150 ease-in-out">Tips & Guides</a>
              <a href="#market" onClick={(e) => handleNavLinkClick(e, 'market')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition duration-150 ease-in-out">Market Prices</a>
              <a href="#contact" onClick={(e) => handleNavLinkClick(e, 'contact')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition duration-150 ease-in-out">Contact</a>
              <Link to="/login" className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out">Login</Link>
              <Link to="/signup"  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">Sign-Up</Link>
            </div>
          </div>
          <div className="-mr-2 flex lg:hidden">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#home" onClick={(e) => handleNavLinkClick(e, 'home')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition duration-150 ease-in-out">Home</a>
            <a href="#news" onClick={(e) => handleNavLinkClick(e, 'news')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition duration-150 ease-in-out">News & Updates</a>
            <a href="#crops" onClick={(e) => handleNavLinkClick(e, 'crops')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition duration-150 ease-in-out">Crops Info</a>
            <a href="#guides" onClick={(e) => handleNavLinkClick(e, 'guides')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition duration-150 ease-in-out">Tips & Guides</a>
            <a href="#market" onClick={(e) => handleNavLinkClick(e, 'market')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition duration-150 ease-in-out">Market Prices</a>
            <a href="#contact" onClick={(e) => handleNavLinkClick(e, 'contact')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition duration-150 ease-in-out">Contact</a>
            <div className="pt-4 pb-3 border-t border-gray-700">
              <Link to="/login"  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 text-center transition duration-150 ease-in-out mb-2">Login</Link>
              <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 text-center transition duration-150 ease-in-out">Sign-Up</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Header;

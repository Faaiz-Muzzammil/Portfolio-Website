// src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
    if (window.innerWidth >= 768) {
      setMenuOpen(false); // Automatically close mobile menu on large screens
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { id: 1, link: 'Home' },
    { id: 2, link: 'About' },
    { id: 3, link: 'Projects' },
    { id: 4, link: 'Skills' },
    { id: 5, link: 'Contact' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-gray-900 bg-opacity-80 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        
        {/* Logo */}
        <div className="text-3xl font-extrabold text-cyan-400">
          F K
        </div>

        {/* Links for Desktop */}
        <ul className={`${isMobile ? 'hidden' : 'flex'} space-x-10 text-gray-300 font-semibold`}>
          {navLinks.map(({ id, link }) => (
            <li key={id} className="relative group">
              <a
                href={`#${link.toLowerCase()}`}
                className="transition duration-300 group-hover:text-cyan-400"
              >
                {link}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
              </a>
            </li>
          ))}
        </ul>

        {/* Hamburger for Mobile */}
        <div
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-300 cursor-pointer"
        >
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <ul className="absolute top-16 left-0 w-full bg-gray-900 bg-opacity-95 backdrop-blur-md flex flex-col items-center py-8 space-y-8 text-gray-300 font-semibold md:hidden">
            {navLinks.map(({ id, link }) => (
              <li key={id}>
                <a
                  onClick={() => setMenuOpen(false)}
                  href={`#${link.toLowerCase()}`}
                  className="text-2xl hover:text-cyan-400 transition"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

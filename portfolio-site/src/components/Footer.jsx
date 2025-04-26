// src/components/Footer.jsx

import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-500 py-6 text-center text-sm z-10">
      <p>
        © {new Date().getFullYear()} Faaiz Khan. Built with ❤️ using React & TailwindCSS.
      </p>
    </footer>
  );
}

export default Footer;

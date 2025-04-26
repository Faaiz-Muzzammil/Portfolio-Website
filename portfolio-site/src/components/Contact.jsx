// src/components/Contact.jsx

import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

function Contact() {
  return (
    <section
      id="contact"
      className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-6 py-20 overflow-hidden"
      data-aos="fade-up"
    >
      {/* Heading */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 tracking-wide z-10">
        Contact Me
      </h2>

      {/* Contact Details */}
      <div className="bg-gray-800/70 backdrop-blur-md rounded-3xl shadow-2xl p-10 max-w-2xl text-center hover:shadow-cyan-400/20 transition-all duration-500 z-10">
        <p className="text-gray-300 text-lg md:text-xl mb-6 leading-relaxed">
          Feel free to reach out to me via email or connect with me on social media!
        </p>
        <a
          href="mailto:your.email@example.com"
          className="text-cyan-400 text-xl font-semibold underline hover:text-cyan-300 transition"
        >
          faaizmuzzammil@gmail.com
        </a>

        {/* Social Links */}
        <div className="flex justify-center gap-8 mt-8">
          <a
            href="https://github.com/yourgithub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 transition text-3xl"
          >
            <FaGithub />
          </a>
          <a
            href="https://linkedin.com/in/yourlinkedin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 transition text-3xl"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>
    </section>
  );
}

export default Contact;

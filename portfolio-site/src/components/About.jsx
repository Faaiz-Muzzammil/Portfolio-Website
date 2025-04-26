// src/components/About.jsx

import React from 'react';

function About() {
  return (
    <section
      id="about"
      className="relative min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-6 py-20 overflow-hidden"
      data-aos="fade-up"
    >
      {/* Decorative Blurred Circles */}
      <div className="absolute w-96 h-96 bg-cyan-400 rounded-full opacity-10 blur-3xl top-10 left-10 animate-pulse-slow"></div>
      <div className="absolute w-72 h-72 bg-purple-400 rounded-full opacity-10 blur-2xl bottom-10 right-10 animate-pulse-slow"></div>

      {/* Heading */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 tracking-wide z-10">
        About Me
      </h2>

      {/* About Card */}
      <div className="relative bg-gray-800/70 backdrop-blur-md rounded-3xl shadow-2xl p-10 max-w-4xl text-center hover:shadow-cyan-400/20 transition-all duration-500 z-10">
        <p className="text-gray-300 text-lg md:text-xl leading-relaxed space-y-4">
          I'm <span className="text-cyan-400 font-semibold">Faaiz Khan</span>, a passionate Full Stack Developer based in Pakistan 🇵🇰.
          <br /><br />
          I love crafting elegant, scalable, and intuitive digital experiences that solve real-world problems.
          <br /><br />
          My main tech stack includes <span className="text-cyan-400">React, Node.js, Spring Boot, Flutter, PostgreSQL, AWS</span> — and I'm always eager to learn and work on exciting new technologies!
        </p>
      </div>
    </section>
  );
}

export default About;

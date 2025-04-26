// src/components/Hero.jsx

import React from 'react';
import { Typewriter } from 'react-simple-typewriter';

function Hero() {
  return (
    <section
      id="home"
      className="relative h-screen flex flex-col justify-center items-center text-center overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
    >
      {/* Blurred Background Circle */}
      <div className="absolute w-96 h-96 bg-cyan-400 rounded-full opacity-20 blur-3xl top-1/4 -left-32 animate-pulse-slow"></div>
      <div className="absolute w-72 h-72 bg-blue-500 rounded-full opacity-20 blur-2xl bottom-1/4 right-0 animate-pulse-slow"></div>

      {/* Main Heading */}
      <h1
        className="text-4xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 mb-6"
        data-aos="fade-down"
      >
        Hi, I'm{' '}
        <span className="text-cyan-400">
          <Typewriter
            words={['Faaiz', 'Developer', 'Gamer', 'Designer', 'Creator']}
            loop={true}
            cursor
            cursorStyle="|"
            typeSpeed={80}
            deleteSpeed={50}
            delaySpeed={1500}
          />
        </span>
      </h1>

      {/* Subheading */}
      <p
        className="text-gray-400 text-lg md:text-2xl max-w-2xl mb-8 leading-relaxed"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        I craft beautiful, scalable, and intuitive web experiences that solve real-world problems.
      </p>

      {/* CTA Button */}
      <a
        href="#projects"
        className="mt-4 inline-block px-10 py-4 bg-cyan-400 text-gray-900 font-bold rounded-lg hover:bg-cyan-300 transition-all duration-300 shadow-lg hover:shadow-cyan-400/50 animate-bounce-slow"
        data-aos="zoom-in"
        data-aos-delay="500"
      >
        View Projects
      </a>
    </section>
  );
}

export default Hero;

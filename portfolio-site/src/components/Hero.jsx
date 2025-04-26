// src/components/Hero.jsx

import React from "react";
import { Typewriter } from "react-simple-typewriter";

function Hero() {
  return (
    <section
      id="home"
      className="relative h-screen flex flex-col justify-center items-center text-center overflow-hidden bg-[#0f111a]" // Solid dark background for neumorphism
    >
      {/* Blurred Background Circles */}
      <div className="absolute w-96 h-96 bg-cyan-400 rounded-full opacity-20 blur-3xl top-1/4 -left-32 animate-pulse-slow z-10"></div>
      <div className="absolute w-72 h-72 bg-blue-500 rounded-full opacity-20 blur-2xl bottom-1/4 right-0 animate-pulse-slow z-10"></div>

      {/* Main Heading */}
      <h1
        className="relative z-20 text-4xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 mb-6"
        data-aos="fade-down"
      >
        Hi, I'm{" "}
        <span className="text-cyan-400">
          <Typewriter
            words={["Faaiz", "Developer", "Gamer", "Designer", "Creator"]}
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
        className="relative z-20 text-gray-400 text-lg md:text-2xl max-w-2xl mb-8 leading-relaxed"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        I craft beautiful, scalable, and intuitive web experiences that solve
        real-world problems.
      </p>

      {/* Neumorphic CTA Button */}
      <a
        href="#projects"
        className="relative z-20 mt-4 inline-block px-10 py-4
             bg-[#0f111a] text-cyan-400 font-bold rounded-xl
             shadow-[8px_8px_16px_#0a0a0a,-8px_-8px_16px_#1a1a1a]
             hover:bg-blue-500 hover:text-white hover:shadow-inner hover:scale-105
             transition-all duration-300"
        data-aos="zoom-in"
        data-aos-delay="500"
      >
        View Projects
      </a>
    </section>
  );
}

export default Hero;

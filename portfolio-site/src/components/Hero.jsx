// src/components/Hero.jsx

import React, { useCallback } from 'react';
import { Typewriter } from 'react-simple-typewriter';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

function Hero() {
  const particlesInit = useCallback(async engine => {
    await loadFull(engine);
  }, []);

  return (
    <section
      id="home"
      className="relative h-screen flex flex-col justify-center items-center text-center overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
    >
      {/* Particles Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 60,
          interactivity: {
            events: {
              onClick: { enable: true, mode: "push" },
              onHover: { enable: true, mode: "repulse" },
              resize: true,
            },
            modes: {
              push: { quantity: 4 },
              repulse: { distance: 100, duration: 0.4 },
            },
          },
          particles: {
            color: { value: "#00ffff" },
            links: { color: "#00ffff", distance: 150, enable: true, opacity: 0.5, width: 1 },
            collisions: { enable: true },
            move: { direction: "none", enable: true, outModes: { default: "bounce" }, speed: 2 },
            number: { density: { enable: true, area: 800 }, value: 50 },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 5 } },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0"
      />

      {/* Blurred Background Circles */}
      <div className="absolute w-96 h-96 bg-cyan-400 rounded-full opacity-20 blur-3xl top-1/4 -left-32 animate-pulse-slow z-10"></div>
      <div className="absolute w-72 h-72 bg-blue-500 rounded-full opacity-20 blur-2xl bottom-1/4 right-0 animate-pulse-slow z-10"></div>

      {/* Main Heading */}
      <h1
        className="relative z-20 text-4xl md:text-7xl font-extrabold text-white mb-6"
        data-aos="fade-down"
      >
        Hi, I'm{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
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
        className="relative z-20 text-gray-400 text-lg md:text-2xl max-w-2xl mb-8 leading-relaxed"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        I craft beautiful, scalable, and intuitive web experiences that solve real-world problems.
      </p>

      {/* CTA Button */}
      <a
        href="#projects"
        className="relative z-20 mt-4 inline-block px-10 py-4 bg-cyan-400 text-gray-900 font-bold rounded-lg hover:bg-cyan-300 transition-all duration-300 shadow-lg hover:shadow-cyan-400/50 animate-bounce-slow"
        data-aos="zoom-in"
        data-aos-delay="500"
      >
        View Projects
      </a>
    </section>
  );
}

export default Hero;

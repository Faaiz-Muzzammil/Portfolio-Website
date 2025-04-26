// src/components/Projects.jsx

import React from 'react';

const projects = [
  {
    title: 'Portfolio Website',
    description: 'A personal portfolio website built with React and TailwindCSS.',
    link: '#',
  },
  {
    title: 'E-Commerce App',
    description: 'A full-stack e-commerce platform using React, Node.js, and MongoDB.',
    link: '#',
  },
  {
    title: 'Chat Application',
    description: 'A real-time chat app built with Socket.io and React.',
    link: '#',
  },
];

function Projects() {
  return (
    <section
      id="projects"
      className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-6 py-20 overflow-hidden"
      data-aos="fade-up"
    >
      {/* Heading */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 tracking-wide z-10">
        Projects
      </h2>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl z-10">
        {projects.map((project, index) => (
          <div
            key={index}
            className="bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-cyan-400/30 transition-all duration-500 transform hover:-translate-y-2"
            data-aos="zoom-in"
            data-aos-delay={`${index * 200}`}
          >
            <h3 className="text-2xl font-bold mb-4 text-cyan-400">{project.title}</h3>
            <p className="text-gray-300 mb-6">{project.description}</p>
            <a
              href={project.link}
              className="inline-block px-6 py-2 bg-cyan-400 text-gray-900 font-semibold rounded-lg hover:bg-cyan-300 transition duration-300"
            >
              View Project
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;

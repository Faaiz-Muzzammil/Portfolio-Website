// src/components/Projects.jsx

import React from 'react';

function Projects() {
  const projectList = [
    {
      id: 1,
      title: 'Portfolio Website',
      description: 'A personal portfolio website built with React and TailwindCSS.',
      link: '#',
    },
    {
      id: 2,
      title: 'E-Commerce App',
      description: 'A full-stack e-commerce platform using React, Node.js, and MongoDB.',
      link: '#',
    },
    {
      id: 3,
      title: 'Chat Application',
      description: 'A real-time chat app built with Socket.io and React.',
      link: '#',
    },
  ];

  return (
    <section 
      id="projects" 
      className="min-h-screen flex flex-col justify-center items-center bg-gray-900 px-6 pt-32 pb-20 md:pt-40"
      data-aos="fade-up"
    >
      {/* Heading */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 tracking-wide">
        Projects
      </h2>

      {/* Project Cards */}
      <div className="grid gap-12 md:grid-cols-3">
        {projectList.map(({ id, title, description, link }) => (
          <div
            key={id}
            className="bg-gray-800/70 backdrop-blur-md rounded-3xl shadow-[8px_8px_20px_#0a0f1a,-8px_-8px_20px_#1a2332] p-8 flex flex-col justify-between hover:shadow-cyan-400/30 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105"
          >
            <h3 className="text-cyan-400 text-2xl font-bold mb-4">{title}</h3>
            <p className="text-gray-300 text-base mb-6">{description}</p>
            <a
              href={link}
              className="self-start mt-auto inline-block px-6 py-3 rounded-xl font-semibold text-gray-900 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 hover:opacity-90 transition-all duration-300"
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

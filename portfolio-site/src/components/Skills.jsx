// src/components/Skills.jsx

import React from 'react';
import { FaReact, FaNodeJs, FaHtml5, FaCss3Alt, FaJsSquare, FaGitAlt } from 'react-icons/fa';

const skills = [
  { name: 'React', icon: <FaReact size={50} /> },
  { name: 'Node.js', icon: <FaNodeJs size={50} /> },
  { name: 'HTML5', icon: <FaHtml5 size={50} /> },
  { name: 'CSS3', icon: <FaCss3Alt size={50} /> },
  { name: 'JavaScript', icon: <FaJsSquare size={50} /> },
  { name: 'Git', icon: <FaGitAlt size={50} /> },
];

function Skills() {
  return (
    <section
      id="skills"
      className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-6 py-20 overflow-hidden"
      data-aos="fade-up"
    >
      {/* Heading */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 tracking-wide z-10">
        Skills
      </h2>

      {/* Skills Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 max-w-5xl z-10">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="flex flex-col items-center hover:scale-110 transition-transform duration-300"
            data-aos="zoom-in"
            data-aos-delay={`${index * 150}`}
          >
            <div className="text-cyan-400 mb-4">{skill.icon}</div>
            <p className="text-lg font-semibold text-gray-300">{skill.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;

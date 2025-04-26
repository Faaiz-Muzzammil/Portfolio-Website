// src/App.jsx

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1200,        // Animation duration
      once: false,           // Animate every time you scroll (fade-in and fade-out)
      mirror: true,          // Mirror fade-out when scrolling back up
      easing: 'ease-in-out', // Smooth animation
    });
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-between">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;

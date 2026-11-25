import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Projects from '../components/Projects';
import Team from '../components/Team';
import LatestNews from '../components/LatestNews';
import CommunityNexus from '../components/CommunityNexus';
import Footer from '../components/Footer';

const Home = () => {
  useEffect(() => {
    document.title = 'Thurayya Studio';
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 relative">
      <div className="absolute inset-0 crt-overlay mix-blend-multiply pointer-events-none z-50" />
      <Navbar />
      <Hero />
      <Projects />
      <LatestNews />
      <Team />
      <CommunityNexus />
      <Footer />
    </main>
  );
};

export default Home;

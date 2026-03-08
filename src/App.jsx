import React, { useState } from 'react';
import LoadingScreen from './LoadingScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Team from './components/Team';
import CommLink from './components/CommLink';
import Footer from './components/Footer';

function App() {
  const [loadingDone, setLoadingDone] = useState(false);

  return (
    <>
      {!loadingDone && <LoadingScreen onComplete={() => setLoadingDone(true)} />}

      {/* App content shows when loading finishes */}
      <main className={`min-h-screen flex flex-col bg-slate-950 relative ${loadingDone ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
        <div className="absolute inset-0 crt-overlay mix-blend-multiply pointer-events-none z-50" />
        <Navbar />
        <Hero />
        <Projects />
        <Team />
        <CommLink />
        <Footer />
      </main>
    </>
  );
}

export default App;

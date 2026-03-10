import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';


const LoadingScreen = ({ onComplete }) => {
  const containerRef = useRef(null);
  const starsRef = useRef([]);
  const bgStarsRef = useRef([]);
  const bgStarCount = [...Array(100)]; // Added ambient background stars

  // FINAL POSITIONS: Al-Thurayya (Pleiades / M45) star positions.
  // Mapped directly from user sketch. Stars ordered: Taygeta, Maia, Alcyone, Electra, Celaeno, Atlas, Merope.
  const starDestinations = [
    { top: '28%', left: '47%' }, // Taygeta  – upper-left
    { top: '28%', left: '50%' }, // Maia     – upper-right
    { top: '44%', left: '49%' }, // Alcyone  – center (brightest)
    { top: '54%', left: '41%' }, // Electra  – left-center
    { top: '60%', left: '63%' }, // Celaeno  – right-center
    { top: '65%', left: '65%' }, // Atlas    – lower-right (Atlas & Pleione pair)
    { top: '68%', left: '46%' }, // Merope   – lower-center-left
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => onComplete()
      });

      // 1. SETUP LOGO STARS: Scatter randomly BEFORE the user sees them
      starsRef.current.forEach((star) => {
        gsap.set(star, {
          x: "random(-300, 300)", // Use Transforms (GPU), not Top/Left
          y: "random(-300, 300)",
          scale: "random(0.5, 0.8)",
          opacity: 0.2 // VERY DIM initially
        });
      });

      // SETUP AMBIENT BG STARS
      bgStarsRef.current.forEach((star) => {
        gsap.set(star, {
          x: "+=random(-20, 20)",
          y: "+=random(-20, 20)",
          scale: "random(0.3, 0.8)",
          opacity: "random(0.1, 0.3)"
        });
      });

      // 2. IDLE ANIMATION (The Drifting)
      starsRef.current.forEach((star) => {
        gsap.to(star, {
          x: "+=random(-20, 20)", // Small movements
          y: "+=random(-20, 20)",
          duration: "random(2, 4)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });

      bgStarsRef.current.forEach((star) => {
        gsap.to(star, {
          x: "+=random(-30, 30)",
          y: "+=random(-30, 30)",
          duration: "random(3, 6)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });

      // 3. THE SNAP (Triggered after 2.5 seconds)
      tl.to({}, { duration: 1.5 }) // Wait 2.5 seconds

        // Step A: Fade out Officer
        .to(".officer-sprite", {
          opacity: 0,
          duration: 0.5,
          scale: 0.8,
          ease: "power2.in"
        })

        // Step B: SNAP stars to home (x:0, y:0 means "Go to CSS defined position")
        .to(starsRef.current, {
          x: 0, // FORCE GPU
          y: 0, // FORCE GPU
          scale: 1.67,
          opacity: 1, // BRIGHTEN UP
          boxShadow: "0 0 15px 4px rgba(255, 255, 255, 0.8)", // ADD GLOW
          duration: 0.8,
          ease: "back.out(1.7)",
          overwrite: true, // IMPORTANT: Stop the drifting animation immediately
        })

        // Step C: Reveal Logo
        .to(".logo-reveal", {
          opacity: 1,
          duration: 1.2,
          ease: "power2.out",
          // Force hardware acceleration on the big image
          force3D: true
        }, "-=0.4")

        // Step D: The Smooth Cover/Wipe Transition
        // We scale the logo up but fade it out BEFORE it becomes a giant white block
        .to(".logo-reveal", {
          scale: 15, // Reduced scale to avoid covering the whole screen in thick white
          duration: 1.0,
          ease: "power3.in"
        }, "+=0.8")
        .to(".logo-reveal", {
          opacity: 0,
          duration: 0.5, // Fade logo out quickly
          ease: "power1.out"
        }, "<") // Start fade at the exact same time
        .to(containerRef.current, {
          opacity: 0, // Fade out the entire loading screen smoothly
          duration: 1.0,
          ease: "power2.inOut"
        }, "<"); // sync with logo zoom

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 bg-[#0a0a1a] flex items-center justify-center z-[100] overflow-hidden">

      {/* RANDOMLY DRIFTING BACKGROUND STARS */}
      {bgStarCount.map((_, i) => (
        <div
          key={`bg-${i}`}
          ref={el => bgStarsRef.current[i] = el}
          className="absolute bg-white rounded-full opacity-0"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: '4px',
            height: '4px',
            willChange: 'transform, opacity'
          }}
        />
      ))}

      {/* LOGO STARS (The ones that form the logo) */}
      {starDestinations.map((pos, i) => (
        <div
          key={i}
          ref={el => starsRef.current[i] = el}
          className="absolute bg-white rounded-full opacity-0"
          style={{
            // Set the FINAL position here. 
            // GSAP will pull them away and snap them back to this.
            top: pos.top,
            left: pos.left,
            width: '6px',  // Slightly larger base size
            height: '6px',
            willChange: 'transform, opacity, box-shadow'
          }}
        />
      ))}

      {/* OFFICER */}
      <div className="officer-sprite relative z-10 flex flex-col items-center">
        <img
          src="/checkingwatch.gif"
          alt="Loading..."
          className="w-32 h-auto"
          style={{ imageRendering: 'pixelated' }}
        />
        <p className="mt-4 font-mono text-xs text-blue-200 animate-pulse tracking-widest text-center shadow-black drop-shadow-md">
          INITIALIZING TIMELINE...
        </p>
      </div>

      {/* LOGO TEXT */}
      <img
        src="/logo-transparent-white.png"
        alt="Thuraya"
        className="logo-reveal absolute w-96 opacity-0 z-0 pointer-events-none"
        style={{ willChange: 'opacity' }} // Optimization
      />

    </div>
  );
};

export default LoadingScreen;
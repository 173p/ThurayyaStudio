import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function DistortedStars() {
    const starsRef = useRef();

    useFrame(({ clock }) => {
        if (starsRef.current) {
            starsRef.current.rotation.y = clock.getElapsedTime() * 0.05;
            starsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.2;
        }
    });

    return (
        <Stars
            ref={starsRef}
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
        />
    );
}

const Hero = () => {
    return (
        <section className="relative w-full h-screen bg-slate-950 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 1] }}>
                    <DistortedStars />
                </Canvas>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950 pointer-events-none" />
            </div>

            <div className="relative z-10 text-center flex flex-col items-center mt-[-5vh]">
                <h1 className="text-6xl md:text-[6.5rem] font-bold tracking-tighter text-white mb-6 drop-shadow-2xl animate-interface-pulse">
                    THURAYYA STUDIO
                </h1>
                <p className="text-xl md:text-2xl text-emerald-500 font-mono tracking-[0.3em] mb-12 uppercase">
                    CRAFTING TIMELINES
                </p>
                <a
                    href="#game"
                    className="bracket-btn text-emerald-500 font-mono tracking-[0.2em] px-10 py-4 bg-transparent border border-emerald-500/50 hover:bg-emerald-500/10 hover:border-emerald-500 transition-all text-sm md:text-base font-bold"
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                        e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        document.querySelector('#game')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    [ EXPLORE TIMELINES ]
                </a>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-80 animate-blink">
                <span className="text-slate-400 font-mono text-[10px] md:text-xs tracking-[0.3em]">SCROLL_DOWN</span>
                <span className="text-emerald-500 font-mono text-xl md:text-2xl font-bold">V</span>
            </div>
        </section>
    );
};

export default Hero;

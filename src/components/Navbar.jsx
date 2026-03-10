import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Apply background after scrolling past ~50px
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLinkClick = (e, id) => {
        setIsMenuOpen(false); // Close mobile menu if open
        // Find the target element
        const target = document.getElementById(id);
        if (target) {
            // Add highlight class
            target.classList.add('section-highlight');
            // Remove it after animation finishes
            setTimeout(() => {
                target.classList.remove('section-highlight');
            }, 1500);
        }
    };

    return (
        <>
            <nav className={`fixed top-0 left-0 w-full z-50 py-2 px-6 font-mono text-sm transition-all duration-300 ${isScrolled
                ? 'bg-slate-950/90 backdrop-blur-md border-b border-emerald-500/20 shadow-lg'
                : 'bg-transparent'
                }`}>
                <div className="container mx-auto flex items-center justify-between">

                    {/* Left Side: Logo */}
                    <div className="flex-1 flex justify-start pl-4 md:pl-8">
                        <a href="#" className="flex-shrink-0 flex items-center justify-center">
                            <img
                                src="/logo-transparent-white.png"
                                alt="Thurayya Studio"
                                className="h-16 md:h-20 lg:h-24 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-transform hover:scale-105"
                                style={{ margin: '-0.5rem 0' }}
                            />
                        </a>
                    </div>

                    {/* Center: Navigation Links */}
                    <div className="hidden lg:flex flex-1 justify-center items-center gap-10 text-slate-300 font-bold tracking-[0.2em] text-xs">
                        <a
                            href="#game"
                            onClick={(e) => handleLinkClick(e, 'game')}
                            className="hover:text-emerald-400 hover:-translate-y-0.5 transition-all whitespace-nowrap"
                        >
                            [ GAME ]
                        </a>
                        <a
                            href="#team"
                            onClick={(e) => handleLinkClick(e, 'team')}
                            className="hover:text-emerald-400 hover:-translate-y-0.5 transition-all whitespace-nowrap"
                        >
                            [ TEAM ]
                        </a>
                        <a
                            href="#community"
                            onClick={(e) => handleLinkClick(e, 'community')}
                            className="hover:text-emerald-400 hover:-translate-y-0.5 transition-all whitespace-nowrap"
                        >
                            [ COMMUNITY ]
                        </a>
                        <a
                            href="#socials"
                            onClick={(e) => handleLinkClick(e, 'socials')}
                            className="hover:text-emerald-400 hover:-translate-y-0.5 transition-all whitespace-nowrap"
                        >
                            [ SOCIALS ]
                        </a>
                    </div>

                    {/* Right Side: Wishlist & Mobile Menu */}
                    <div className="flex-1 flex justify-end items-center gap-4">
                        <a
                            href="https://store.steampowered.com/app/3905840/Pexet_Inc/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:inline-block border border-emerald-500 text-emerald-400 px-6 py-2.5 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all font-bold tracking-widest text-xs"
                        >
                            [ WISHLIST ON STEAM ]
                        </a>

                        {/* Mobile Menu Icon */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="lg:hidden text-emerald-400 hover:text-emerald-300 font-bold tracking-widest"
                        >
                            [ MENU ]
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-8 lg:hidden"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute top-8 right-8 text-emerald-400 hover:text-emerald-300 font-bold font-mono tracking-widest text-sm"
                        >
                            [ CLOSE ]
                        </button>

                        {/* Menu Links */}
                        <div className="flex flex-col items-center gap-8 text-center">
                            <img
                                src="/logo-transparent-white.png"
                                alt="Thurayya Studio"
                                className="h-24 mb-6 opacity-80"
                            />

                            {[
                                { id: 'game', label: 'GAME' },
                                { id: 'team', label: 'TEAM' },
                                { id: 'community', label: 'COMMUNITY' },
                                { id: 'socials', label: 'SOCIALS' }
                            ].map((link) => (
                                <a
                                    key={link.id}
                                    href={`#${link.id}`}
                                    onClick={(e) => handleLinkClick(e, link.id)}
                                    className="text-2xl font-bold tracking-[0.3em] text-slate-300 hover:text-emerald-400 transition-colors uppercase font-mono whitespace-nowrap"
                                >
                                    [{link.label}]
                                </a>
                            ))}

                            <a
                                href="https://store.steampowered.com/app/3905840/Pexet_Inc/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-8 border border-emerald-500 text-emerald-400 px-8 py-3 hover:bg-emerald-500 hover:text-white transition-all font-bold tracking-widest text-sm font-mono"
                            >
                                [ WISHLIST ON STEAM ]
                            </a>
                        </div>

                        {/* Background Decor */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-950/5 pointer-events-none -z-10 blur-3xl rounded-full" />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;

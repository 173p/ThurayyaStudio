import React, { useState, useEffect } from 'react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            // Apply background after scrolling past ~50px
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        // ScrollSpy logic
        const sections = ['projects', 'studio', 'community', 'footer'];
        const sectionElements = sections.map(id => document.getElementById(id)).filter(el => el);

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px', // Trigger when section is in view
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        sectionElements.forEach(el => observer.observe(el));

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            sectionElements.forEach(el => observer.unobserve(el));
        };
    }, []);

    const handleLinkClick = (e, id) => {
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
                        href="#projects"
                        onClick={(e) => handleLinkClick(e, 'projects')}
                        className={`hover:text-emerald-400 hover:-translate-y-0.5 transition-all ${activeSection === 'projects' ? 'navbar-link-active' : ''}`}
                    >
                        [ GAME ]
                    </a>
                    <a
                        href="#studio"
                        onClick={(e) => handleLinkClick(e, 'studio')}
                        className={`hover:text-emerald-400 hover:-translate-y-0.5 transition-all ${activeSection === 'studio' ? 'navbar-link-active' : ''}`}
                    >
                        [ TEAM ]
                    </a>
                    <a
                        href="#community"
                        onClick={(e) => handleLinkClick(e, 'community')}
                        className={`hover:text-emerald-400 hover:-translate-y-0.5 transition-all ${activeSection === 'community' ? 'navbar-link-active' : ''}`}
                    >
                        [ COMMUNITY ]
                    </a>
                    <a
                        href="#footer"
                        onClick={(e) => handleLinkClick(e, 'footer')}
                        className={`hover:text-emerald-400 hover:-translate-y-0.5 transition-all ${activeSection === 'footer' ? 'navbar-link-active' : ''}`}
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
                        className="hidden md:inline-block border border-emerald-500 text-emerald-500 px-6 py-2.5 hover:bg-emerald-500 hover:text-slate-950 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all font-bold tracking-widest text-xs"
                    >
                        [ WISHLIST ON STEAM ]
                    </a>

                    {/* Mobile Menu Icon */}
                    <button className="lg:hidden text-emerald-500 hover:text-emerald-400">
                        [ MENU ]
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

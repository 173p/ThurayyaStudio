import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SECTIONS = [
    { id: 'game', label: 'GAME' },
    { id: 'team', label: 'TEAM' },
    { id: 'community', label: 'COMMUNITY' },
];

const linkClass = 'hover:text-[#305CDE] hover:-translate-y-0.5 transition-all whitespace-nowrap';
const mobileLinkClass = 'text-2xl font-bold tracking-[0.3em] text-slate-300 hover:text-[#305CDE] transition-colors uppercase font-mono whitespace-nowrap';

function SectionLink({ id, isHome, onPick, className, children }) {
    return isHome ? (
        <a href={`#${id}`} onClick={() => onPick(id)} className={className}>{children}</a>
    ) : (
        <Link to={`/#${id}`} onClick={() => onPick(null)} className={className}>{children}</Link>
    );
}

function LangSwitch({ langSwitch }) {
    if (!langSwitch) return null;
    const on = 'text-white border-b-2 border-[#305CDE] pb-0.5';
    const off = 'text-slate-400 hover:text-white';
    return (
        <div aria-label="Language" className="flex items-center gap-2.5">
            {langSwitch.current === 'en'
                ? <span className={on}>EN</span>
                : <Link to={langSwitch.otherHref} className={off}>EN</Link>}
            <span aria-hidden="true" className="text-slate-700">|</span>
            {langSwitch.current === 'ar'
                ? <span lang="ar" className={`font-arabic tracking-normal text-sm ${on}`}>العربية</span>
                : <Link to={langSwitch.otherHref} lang="ar" className={`font-arabic tracking-normal text-sm ${off}`}>العربية</Link>}
        </div>
    );
}

const Navbar = ({ langSwitch }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { pathname } = useLocation();
    const isHome = pathname === '/';
    const onBlog = pathname.startsWith('/blog') || pathname.startsWith('/ar/blog');
    const blogHref = langSwitch?.current === 'en' ? '/blog' : '/ar/blog';

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const pickSection = (id) => {
        setIsMenuOpen(false);
        if (!id) return;
        const target = document.getElementById(id);
        if (target) {
            target.classList.add('section-highlight');
            setTimeout(() => target.classList.remove('section-highlight'), 1500);
        }
    };

    const blogClass = onBlog ? 'text-[#305CDE] border-b-2 border-[#305CDE] pb-1 whitespace-nowrap' : linkClass;

    return (
        <>
            <nav dir="ltr" className={`fixed top-0 left-0 w-full z-50 py-2 px-6 font-mono text-sm transition-all duration-300 ${isScrolled || !isHome
                ? 'bg-slate-950/90 backdrop-blur-md border-b border-[#305CDE]/20 shadow-lg'
                : 'bg-transparent'
                }`}>
                <div className="container mx-auto flex items-center justify-between gap-8">

                    {/* Left Side: Logo */}
                    <div className="flex-1 flex justify-start pl-4 md:pl-8">
                        <Link to="/" className="flex-shrink-0 flex items-center justify-center">
                            <img
                                src="/logo-transparent-white.png"
                                alt="Thurayya Studio"
                                className="h-16 md:h-20 lg:h-24 object-contain drop-shadow-[0_0_8px_rgba(48,92,222,0.3)] transition-transform hover:scale-105"
                                style={{ margin: '-0.5rem 0' }}
                            />
                        </Link>
                    </div>

                    {/* Center: Navigation Links */}
                    <div className="hidden xl:flex flex-none justify-center items-center gap-8 text-slate-300 font-bold tracking-[0.2em] text-xs">
                        {SECTIONS.slice(0, 1).map((s) => (
                            <SectionLink key={s.id} id={s.id} isHome={isHome} onPick={pickSection} className={linkClass}>
                                [ {s.label} ]
                            </SectionLink>
                        ))}
                        <Link to={blogHref} className={blogClass}>[ BLOG ]</Link>
                        {SECTIONS.slice(1).map((s) => (
                            <SectionLink key={s.id} id={s.id} isHome={isHome} onPick={pickSection} className={linkClass}>[ {s.label} ]</SectionLink>
                        ))}
                        <SectionLink id="socials" isHome={isHome} onPick={pickSection} className={linkClass}>[ SOCIALS ]</SectionLink>
                    </div>

                    {/* Right Side: Language switch, Wishlist & Mobile Menu */}
                    <div className="flex-1 min-w-max flex justify-end items-center gap-6 font-bold tracking-[0.2em] text-xs">
                        <div className="hidden md:flex whitespace-nowrap"><LangSwitch langSwitch={langSwitch} /></div>
                        <a
                            href="https://store.steampowered.com/app/3905840/Pexet_Inc/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:inline-block whitespace-nowrap border border-[#305CDE] text-[#305CDE] px-6 py-2.5 hover:bg-[#305CDE] hover:text-white hover:shadow-[0_0_20px_rgba(48,92,222,0.5)] transition-all font-bold tracking-widest text-xs"
                        >
                            [ WISHLIST ON STEAM ]
                        </a>

                        {/* Mobile Menu Icon */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="xl:hidden text-[#305CDE] hover:text-blue-400 font-bold tracking-widest"
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
                        dir="ltr"
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-8 xl:hidden"
                    >
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute top-8 right-8 text-[#305CDE] hover:text-blue-400 font-bold font-mono tracking-widest text-sm"
                        >
                            [ CLOSE ]
                        </button>

                        <div className="flex flex-col items-center gap-8 text-center">
                            <img src="/logo-transparent-white.png" alt="Thurayya Studio" className="h-24 mb-6 opacity-80" />

                            {SECTIONS.slice(0, 1).map((s) => (
                                <SectionLink key={s.id} id={s.id} isHome={isHome} onPick={pickSection} className={mobileLinkClass}>
                                    [{s.label}]
                                </SectionLink>
                            ))}
                            <Link to={blogHref} onClick={() => setIsMenuOpen(false)} className={mobileLinkClass}>[BLOG]</Link>
                            {SECTIONS.slice(1).map((s) => (
                                <SectionLink key={s.id} id={s.id} isHome={isHome} onPick={pickSection} className={mobileLinkClass}>[{s.label}]</SectionLink>
                            ))}
                            <SectionLink id="socials" isHome={isHome} onPick={pickSection} className={mobileLinkClass}>[SOCIALS]</SectionLink>

                            <div className="font-mono font-bold tracking-[0.2em] text-sm"><LangSwitch langSwitch={langSwitch} /></div>

                            <a
                                href="https://store.steampowered.com/app/3905840/Pexet_Inc/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 border border-[#305CDE] text-[#305CDE] px-8 py-3 hover:bg-[#305CDE] hover:text-white transition-all font-bold tracking-widest text-sm font-mono"
                            >
                                [ WISHLIST ON STEAM ]
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;

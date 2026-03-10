import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const features = [
    {
        title: 'Timeline Shifting',
        desc: 'Jump between the past, present, and future to open new paths, uncover hidden truths, and survive escalating threats.'
    },
    {
        title: 'Psychological Horror',
        desc: 'Experience intense tension through retro pixel art, flickering lights, and ambient audio designed to unsettle your every step.'
    },
    {
        title: 'Survival-Focused Combat',
        desc: 'Every bullet counts. Use firearms wisely, manage stamina carefully, and master parry or stun mechanics to stay alive.'
    },
    {
        title: 'Puzzle Solving Across Time',
        desc: 'Alter the past to change the future — but beware, some choices unlock deeper horrors.'
    }
];

const Projects = () => {
    const [selectedMedia, setSelectedMedia] = useState(null);

    const closeLightbox = () => setSelectedMedia(null);

    const handleNext = useCallback((e) => {
        if (e) e.stopPropagation();
        if (selectedMedia?.type === 'image' && selectedMedia?.index !== undefined) {
            const nextIndex = (selectedMedia.index + 1) % 5;
            setSelectedMedia({ type: 'image', url: `/ingame${nextIndex + 1}.jpg`, index: nextIndex });
        }
    }, [selectedMedia]);

    const handlePrev = useCallback((e) => {
        if (e) e.stopPropagation();
        if (selectedMedia?.type === 'image' && selectedMedia?.index !== undefined) {
            const prevIndex = (selectedMedia.index - 1 + 5) % 5;
            setSelectedMedia({ type: 'image', url: `/ingame${prevIndex + 1}.jpg`, index: prevIndex });
        }
    }, [selectedMedia]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedMedia || selectedMedia.type !== 'image') return;
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') closeLightbox();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedMedia, handleNext, handlePrev]);

    return (
        <section id="game" className="w-full py-24 bg-slate-950 text-white border-y border-slate-800 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row gap-16 items-center">

                    {/* Left: Image / Banner */}
                    <div className="w-full xl:w-5/12 flex flex-col gap-6">
                        <div className="flex justify-between items-center mb-1 font-mono text-sm tracking-widest uppercase">
                            <span className="text-red-500 font-bold tracking-[0.2em] drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">PROJECT_FILE: PEXET</span>
                            <span className="text-red-900/80 tracking-widest text-xs animate-pulse">[ CLASSIFIED ]</span>
                        </div>
                        <div
                            className="relative group overflow-hidden rounded-md border border-slate-700/50 shadow-2xl shadow-red-900/10 cursor-pointer"
                            onClick={() => setSelectedMedia({ type: 'video', url: '/Trailer.mp4' })}
                        >
                            <div className="absolute top-3 left-4 z-20 text-slate-400/80 font-mono text-xs font-bold pointer-events-none">1.00</div>
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                poster="/pexet-banner.png"
                            >
                                <source src="/Trailer.mp4" type="video/mp4" />
                                <img
                                    src="/pexet-banner.png"
                                    alt="Pexet Inc. Banner"
                                    className="w-full h-auto object-cover"
                                />
                            </video>

                            {/* Play Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <div className="w-16 h-16 rounded-full border-2 border-red-500 flex items-center justify-center bg-red-950/20 backdrop-blur-sm">
                                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-red-500 border-b-[10px] border-b-transparent ml-1"></div>
                                </div>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 mix-blend-multiply pointer-events-none" />
                        </div>

                        <a
                            href="https://store.steampowered.com/app/3905840/Pexet_Inc/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#110505] hover:bg-red-950/80 border border-red-900/60 hover:border-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] text-slate-200 hover:text-white font-bold py-4 px-8 rounded-md transition-all duration-300 w-full text-center text-sm tracking-widest shadow-[inset_0_0_20px_rgba(220,38,38,0.05)]"
                        >
                            WISHLIST ON STEAM
                        </a>
                    </div>

                    {/* Right: Info & Features */}
                    <div className="w-full xl:w-7/12 xl:pl-8">
                        <h3 className="text-5xl md:text-[3.5rem] font-bold mb-6 tracking-tight text-white drop-shadow-lg">Pexet Inc</h3>
                        <p className="text-slate-300 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl">
                            A top-down 2D survival horror adventure where time itself becomes your worst enemy.
                            Explore the ruins of a corrupted research facility, shift between past, present, and future,
                            and survive nightmarish experiments gone wrong.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {features.map((feature, idx) => (
                                <div key={idx} className="bg-[#0b0f17] p-6 rounded-md border border-slate-800 shadow-lg hover:border-red-900/50 hover:bg-[#0d131f] transition-colors">
                                    <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2 text-xs md:text-sm uppercase tracking-widest font-mono">
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                                        {feature.title}
                                    </h4>
                                    <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Gameplay Gallery */}
                <div className="mt-24">


                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <div
                                key={num}
                                className="group relative aspect-video overflow-hidden border border-slate-800 rounded bg-slate-900 cursor-pointer"
                                onClick={() => setSelectedMedia({ type: 'image', url: `/ingame${num}.jpg`, index: num - 1 })}
                            >
                                <img
                                    src={`/ingame${num}.jpg`}
                                    alt={`Gameplay ${num}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-red-950/10 mix-blend-overlay group-hover:bg-transparent transition-colors"></div>
                                <div className="absolute top-2 left-2 text-[8px] font-mono text-white/40 bg-black/60 px-1 py-0.5 rounded">
                                    CAM_0{num}_{new Date().getTime().toString().slice(-4)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-slate-950/90 backdrop-blur-md"
                        onClick={closeLightbox}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-6xl w-full max-h-[90vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={closeLightbox}
                                className="absolute -top-12 right-0 text-white font-mono text-sm hover:text-red-500 transition-colors tracking-widest"
                            >
                                [X]
                            </button>

                            {selectedMedia.type === 'image' && selectedMedia.index !== undefined && (
                                <>
                                    <button
                                        onClick={handlePrev}
                                        className="absolute left-4 md:-left-24 top-1/2 -translate-y-1/2 text-white/70 hover:text-red-500 transition-colors hover:scale-110 p-4 z-50 bg-black/20 md:bg-transparent rounded-full backdrop-blur-sm md:backdrop-blur-none"
                                    >
                                        <ChevronLeft className="w-8 h-8 md:w-16 md:h-16" strokeWidth={1} />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="absolute right-4 md:-right-24 top-1/2 -translate-y-1/2 text-white/70 hover:text-red-500 transition-colors hover:scale-110 p-4 z-50 bg-black/20 md:bg-transparent rounded-full backdrop-blur-sm md:backdrop-blur-none"
                                    >
                                        <ChevronRight className="w-8 h-8 md:w-16 md:h-16" strokeWidth={1} />
                                    </button>
                                </>
                            )}

                            <div className="w-full rounded-lg overflow-hidden border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black relative">
                                {selectedMedia.type === 'video' ? (
                                    <video
                                        src={selectedMedia.url}
                                        controls
                                        autoPlay
                                        className="w-full h-auto"
                                    />
                                ) : (
                                    <img
                                        src={selectedMedia.url}
                                        alt="Preview"
                                        className="w-full h-auto object-contain"
                                    />
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Projects;

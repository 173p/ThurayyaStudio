import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDiscord, FaXTwitter, FaTiktok, FaInstagram, FaLinkedinIn, FaEnvelope, FaXmark } from 'react-icons/fa6';

const Footer = () => {
    const [isContactOpen, setIsContactOpen] = useState(false);

    return (
        <footer id="socials" className="w-full py-12 bg-slate-950 text-slate-500 font-mono text-xs border-t border-slate-800">
            <div className="container mx-auto px-6 flex flex-col md:grid md:grid-cols-3 items-center gap-8 text-center md:text-left">

                {/* Left: Copyright - Order 2 on mobile, 1 on desktop */}
                <div className="order-2 md:order-1">
                    <p>&copy; {new Date().getFullYear()} THURAYYA STUDIO. ALL RIGHTS RESERVED.</p>
                </div>

                {/* Center: Socials - Order 1 on mobile, 2 on desktop */}
                <div className="flex gap-6 text-xl text-slate-400 justify-center order-1 md:order-2">
                    <a href="https://discord.gg/EEkV5d3kbR" target="_blank" rel="noreferrer" className="hover:text-[#00FF9C] hover:drop-shadow-[0_0_8px_rgba(0,255,156,0.8)] hover:-translate-y-1 transition-all duration-300">
                        <FaDiscord />
                    </a>
                    <a href="https://x.com/ThurayyaStudio" target="_blank" rel="noreferrer" className="hover:text-[#00FF9C] hover:drop-shadow-[0_0_8px_rgba(0,255,156,0.8)] hover:-translate-y-1 transition-all duration-300">
                        <FaXTwitter />
                    </a>
                    <a href="https://tiktok.com/@thurayyastudio" target="_blank" rel="noreferrer" className="hover:text-[#00FF9C] hover:drop-shadow-[0_0_8px_rgba(0,255,156,0.8)] hover:-translate-y-1 transition-all duration-300">
                        <FaTiktok />
                    </a>
                    <a href="https://instagram.com/ThurayyaStudio" target="_blank" rel="noreferrer" className="hover:text-[#00FF9C] hover:drop-shadow-[0_0_8px_rgba(0,255,156,0.8)] hover:-translate-y-1 transition-all duration-300">
                        <FaInstagram />
                    </a>
                    <a href="https://www.linkedin.com/company/thurayya-studio/?viewAsMember=true" target="_blank" rel="noreferrer" className="hover:text-[#00FF9C] hover:drop-shadow-[0_0_8px_rgba(0,255,156,0.8)] hover:-translate-y-1 transition-all duration-300">
                        <FaLinkedinIn />
                    </a>
                </div>

                {/* Right: Site Links - Order 3 on mobile, 3 on desktop */}
                <div className="flex gap-6 justify-center md:justify-end order-3">
                    <button
                        onClick={() => setIsContactOpen(true)}
                        className="hover:text-white transition-colors cursor-pointer"
                    >
                        CONTACT
                    </button>
                </div>

            </div>

            {/* Contact Modal */}
            <AnimatePresence>
                {isContactOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsContactOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-slate-900 border border-slate-700 p-8 rounded-lg shadow-2xl max-w-sm w-full text-center"
                        >
                            <button
                                onClick={() => setIsContactOpen(false)}
                                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                            >
                                <FaXmark size={20} />
                            </button>

                            <div className="w-16 h-16 bg-[#00FF9C]/10 border border-[#00FF9C]/30 rounded-full flex items-center justify-center mx-auto mb-6 text-[#00FF9C]">
                                <FaEnvelope size={28} />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Get in Touch</h3>
                            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                                Feel free to reach out for collaborations or inquiries.
                            </p>

                            <a
                                href="mailto:thurayyastudio@gmail.com"
                                className="block w-full py-4 bg-[#00FF9C] hover:bg-emerald-400 text-black font-bold rounded transition-colors tracking-widest text-sm"
                            >
                                thurayyastudio@gmail.com
                            </a>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </footer>
    );
};

export default Footer;

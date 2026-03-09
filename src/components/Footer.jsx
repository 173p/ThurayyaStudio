import React from 'react';
import { FaDiscord, FaXTwitter, FaTiktok, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';

const Footer = () => {
    return (
        <footer id="footer" className="w-full py-12 bg-slate-950 text-slate-500 font-mono text-xs border-t border-slate-800">
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
                    <a href="#" className="hover:text-white transition-colors">PRESS KIT</a>
                    <a href="#" className="hover:text-white transition-colors">CONTACT</a>
                </div>

            </div>
        </footer>
    );
};

export default Footer;

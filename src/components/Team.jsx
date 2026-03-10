import React from 'react';
import { Linkedin, Instagram } from 'lucide-react';
import { FaXTwitter, FaTiktok, FaGithub, FaItchIo } from 'react-icons/fa6';

const teamMembers = [
    {
        id: 1,
        codename: 'Fayhan Bin Rubaian',
        role: 'Co-Founder & CEO',
        linkedin: 'https://www.linkedin.com/in/fayhan-bin-rubaian-088388292/',
        twitter: 'https://x.com/fayhanexe'
    },
    {
        id: 2,
        codename: 'Osama Al Mana',
        role: 'Co-Founder & Game Director',
        linkedin: 'https://www.linkedin.com/in/osamah-almana-8215b733a/'
    },
    {
        id: 3,
        codename: 'Wael Qubaisi',
        role: 'Co-Founder & Game Developer',
        linkedin: 'https://www.linkedin.com/in/wael-qubaisi-08874733a/',
        twitter: 'https://x.com/Waelaaqa2',
        github: 'https://github.com/Waelaaq'
    },
    {
        id: 4,
        codename: 'Ali Al Qahtani',
        role: 'Co-Founder & CTO',
        linkedin: 'https://www.linkedin.com/in/ali-mohammed-98690a308/',
        twitter: 'https://x.com/AliMoha90038896'
    },
    {
        id: 5,
        codename: 'Utam',
        role: 'Freelancer',
        instagram: 'https://www.instagram.com/matu_7041'
    },
    {
        id: 6,
        codename: 'irumi',
        role: 'Freelancer',
        tiktok: 'https://www.tiktok.com/@irumi.rurouni?_r=1&_t=ZS-94XG2UBS61k',
        instagram: 'https://www.instagram.com/ruroni.irumi/',
        twitter: 'https://x.com/irumiartz'
    },
    {
        id: 7,
        codename: 'Marwan Al Ghamdi',
        role: 'Freelancer - Game Programmer',
        linkedin: 'https://www.linkedin.com/in/marwan-alghamdi-3b7828194/',
        github: 'https://github.com/Eapk01',
        itchio: 'https://bo-1.itch.io/'
    }
];

const TeamMemberCard = ({ member, className = "" }) => (
    <div className={`relative group perspective h-full ${className}`}>
        <div className="w-full h-full min-h-[360px] bg-slate-900/80 border-t-4 border-slate-700 p-6 rounded-b-md overflow-hidden flex flex-col justify-start transition-all duration-500 group-hover:-translate-y-2 group-hover:border-[#10b981]/80 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] group-hover:bg-slate-900 border-x border-b">
            {/* Top Dossier details */}
            <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-3">
                <span className="text-xs text-[#10b981]/80 font-mono font-bold">FILE.ID_{member.id}</span>
                <span className="text-[10px] text-red-500 font-mono border border-red-500/30 bg-red-950/20 px-1.5 py-0.5 tracking-widest animate-pulse">CLASSIFIED</span>
            </div>

            <div className="flex flex-col items-center mb-6">
                <div className="w-28 h-28 bg-black rounded mb-5 overflow-hidden pixelated flex items-center justify-center relative border border-slate-800 shadow-inner">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.2)_2px,rgba(0,0,0,0.2)_4px)] z-10 mix-blend-overlay"></div>
                    {/* Silhouette SVG placeholder */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold font-mono text-[#10b981] tracking-[0.1em] uppercase text-center">{member.codename}</h3>
                <p className="text-sm text-slate-400 font-mono mt-2 tracking-wide block text-center min-h-[2.5rem]">{member.role}</p>
            </div>

            <div className="mt-auto flex justify-center gap-4">
                {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer" className="text-slate-500 p-2 bg-black/40 border border-[#10b981]/30 hover:border-[#10b981] hover:text-[#10b981] transition-colors group/icon">
                        <Linkedin size={18} className="group-hover/icon:scale-110 transition-transform" />
                    </a>
                )}
                {member.twitter && (
                    <a href={member.twitter} target="_blank" rel="noreferrer" className="text-slate-500 p-2 bg-black/40 border border-[#10b981]/30 hover:border-[#10b981] hover:text-[#10b981] transition-colors group/icon">
                        <FaXTwitter size={18} className="group-hover/icon:scale-110 transition-transform" />
                    </a>
                )}
                {member.instagram && (
                    <a href={member.instagram} target="_blank" rel="noreferrer" className="text-slate-500 p-2 bg-black/40 border border-[#10b981]/30 hover:border-[#10b981] hover:text-[#10b981] transition-colors group/icon">
                        <Instagram size={18} className="group-hover/icon:scale-110 transition-transform" />
                    </a>
                )}
                {member.tiktok && (
                    <a href={member.tiktok} target="_blank" rel="noreferrer" className="text-slate-500 p-2 bg-black/40 border border-[#10b981]/30 hover:border-[#10b981] hover:text-[#10b981] transition-colors group/icon">
                        <FaTiktok size={18} className="group-hover/icon:scale-110 transition-transform" />
                    </a>
                )}
                {member.github && (
                    <a href={member.github} target="_blank" rel="noreferrer" className="text-slate-500 p-2 bg-black/40 border border-[#10b981]/30 hover:border-[#10b981] hover:text-[#10b981] transition-colors group/icon">
                        <FaGithub size={18} className="group-hover/icon:scale-110 transition-transform" />
                    </a>
                )}
                {member.itchio && (
                    <a href={member.itchio} target="_blank" rel="noreferrer" className="text-slate-500 p-2 bg-black/40 border border-[#10b981]/30 hover:border-[#10b981] hover:text-[#10b981] transition-colors group/icon">
                        <FaItchIo size={18} className="group-hover/icon:scale-110 transition-transform" />
                    </a>
                )}
            </div>

            {/* Scanline effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#10b981]/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-scanline pointer-events-none" />
        </div>
    </div>
);

const Team = () => {
    const founders = teamMembers.filter(m => m.id <= 4);
    const freelancers = teamMembers.filter(m => m.id > 4);

    return (
        <section id="team" className="w-full py-24 bg-slate-950 border-b border-slate-800 text-white relative">
            <div className="container mx-auto px-6 relative z-10">
                <h2 className="text-3xl font-mono font-bold tracking-widest text-[#10b981] mb-16 text-center">
                    Our Team
                </h2>

                {/* Co-founders Row (4 items) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto w-full mb-12">
                    {founders.map((member) => (
                        <TeamMemberCard
                            key={member.id}
                            member={member}
                        />
                    ))}
                </div>

                {/* Freelancers Row (3 items, centered) */}
                <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto w-full">
                    {freelancers.map((member) => (
                        <TeamMemberCard
                            key={member.id}
                            member={member}
                            className="w-full md:w-[calc(25%-1.5rem)]"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Team;

import React from 'react';

const teamMembers = [
    {
        id: 1,
        codename: 'PHANTOM',
        role: 'Lead Developer',
        bio: 'Responsible for core systems architecture. Clearance level: HIGH.'
    },
    {
        id: 2,
        codename: 'ECLIPSE',
        role: 'Art Director',
        bio: 'Oversees visual threat modeling and aesthetics. Clearance level: RESTRICTED.'
    },
    {
        id: 3,
        codename: 'ORACLE',
        role: 'Narrative Designer',
        bio: 'Maintains canonical timelines and secure logs. Clearance level: CONFIDENTIAL.'
    }
];

const Team = () => {
    return (
        <section id="studio" className="w-full py-24 bg-slate-950 border-b border-slate-800 text-white relative">
            <div className="container mx-auto px-6 relative z-10">
                <h2 className="text-3xl font-mono font-bold tracking-widest text-emerald-400 mb-16 text-center">
                    Our Team
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {teamMembers.map((member) => (
                        <div key={member.id} className="relative group perspective">
                            <div className="w-full h-full min-h-[360px] bg-slate-900/80 border-t-4 border-slate-700 p-6 rounded-b-md overflow-hidden flex flex-col justify-start transition-all duration-500 group-hover:-translate-y-2 group-hover:border-emerald-500/80 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] group-hover:bg-slate-900 border-x border-b">

                                {/* Top Dossier details */}
                                <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-3">
                                    <span className="text-xs text-emerald-500/80 font-mono font-bold">FILE.ID_{member.id}</span>
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
                                    <h3 className="text-xl font-bold font-mono text-emerald-400 tracking-[0.2em] uppercase">{member.codename}</h3>
                                    <p className="text-sm text-slate-400 font-mono mt-2 tracking-wide block">{member.role}</p>
                                </div>

                                <div className="mt-auto">
                                    <p className="text-xs text-slate-500 font-mono leading-relaxed bg-black/40 p-4 border-l-2 border-emerald-500/30 group-hover:border-emerald-500/80 transition-colors">
                                        {member.bio}
                                    </p>
                                </div>

                                {/* Scanline effect */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-scanline pointer-events-none" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Team;

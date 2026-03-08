import React from 'react';

const CommLink = () => {
    return (
        <section id="community" className="w-full py-24 bg-slate-950 text-emerald-400 font-mono">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="border border-emerald-500/30 rounded-md bg-[#040a06] p-6 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                    <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4 mb-6">
                        <span className="text-sm tracking-widest text-emerald-500/80">COMM-LINK TERMINAL v2.4</span>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500/50"></span>
                            <span className="w-3 h-3 rounded-full bg-amber-500/50"></span>
                            <span className="w-3 h-3 rounded-full bg-emerald-500/80 animate-pulse"></span>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8 text-sm md:text-base text-emerald-500/90">
                        <p>{'>'} ESTABLISHING SECURE CONNECTION...</p>
                        <p>{'>'} CONNECTION VERIFIED.</p>
                        <p>{'>'} WAITING FOR INPUT...</p>
                        <p className="text-emerald-300">{'>'} Welcome to the Thurayya internal network. The community frequency is open.</p>
                        <div className="flex items-center gap-2 text-emerald-400 pt-2">
                            <span>root@thurayya:~$</span>
                            <span className="animate-blink font-bold text-lg leading-none mt-[-2px]">|</span>
                        </div>
                    </div>

                    <a
                        href="https://discord.gg/EEkV5d3kbR"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block border border-emerald-500/80 bg-emerald-950/20 px-8 py-3 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300 font-bold tracking-widest relative"
                    >
                        [ JOIN_DISCORD_SERVER ]
                    </a>
                </div>
            </div>
        </section>
    );
};

export default CommLink;

import React, { useEffect, useRef, useState } from 'react';
import { FaDiscord } from 'react-icons/fa6';

/* ─── Constants ───────────────────────────────────────────────────── */
const TIMELINES = ['PAST', 'PRESENT', 'FUTURE'];

// For each timeline: which boxes are [past, present, future]
// ⊗ = done/visited, ■ = active, □ = pending
const INDICATORS = {
    PAST: ['■', '□', '□'],
    PRESENT: ['⊗', '■', '□'],
    FUTURE: ['⊗', '⊗', '■'],
};

const SCREEN_COLORS = {
    PAST: { fg: '#7ec8a0', glow: '#4a9e72', dim: '#3a6e52', outerGlow: 'rgba(74,158,114,0.25)' },
    PRESENT: { fg: '#00FF9C', glow: '#00e688', dim: '#007a4a', outerGlow: 'rgba(0,255,156,0.35)' },
    FUTURE: { fg: '#ff6b6b', glow: '#ff3333', dim: '#8b1a1a', outerGlow: 'rgba(255,60,60,0.30)' },
};

/* ─── Static noise canvas overlay ────────────────────────────────── */
function NoiseOverlay() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        const W = canvas.width = canvas.offsetWidth;
        const H = canvas.height = canvas.offsetHeight;
        const draw = () => {
            const img = ctx.createImageData(W, H);
            for (let i = 0; i < img.data.length; i += 4) {
                const v = Math.random() > 0.97 ? Math.floor(Math.random() * 40) : 0;
                img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
                img.data[i + 3] = 255;
            }
            ctx.putImageData(img, 0, 0);
            animId = requestAnimationFrame(draw);
        };
        animId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animId);
    }, []);
    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none rounded-sm"
            style={{ mixBlendMode: 'screen', opacity: 0.035 }}
        />
    );
}

/* ─── Backdrop particle canvas ────────────────────────────────────── */
function BackdropCanvas() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId, t = 0;
        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);
        const draw = () => {
            const W = canvas.width, H = canvas.height;
            t += 0.008;
            ctx.clearRect(0, 0, W, H);
            for (let i = 0; i < 60; i++) {
                const s = i * 137.5;
                const x = ((s * 0.618) % 1) * W;
                const y = (((s * 0.382) % 1) * H + t * (8 + s % 6)) % H;
                const zone = x < W * 0.33 ? '180,83,9' : x > W * 0.67 ? '220,50,50' : '16,185,129';
                const a = 0.08 + 0.06 * Math.sin(t + i);
                ctx.globalAlpha = a;
                ctx.fillStyle = `rgba(${zone},1)`;
                ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
            }
            // subtle rift line
            const midX = W * 0.5;
            ctx.globalAlpha = 0.05 + 0.03 * Math.sin(t * 1.8);
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let step = 0; step <= 16; step++) {
                const y = (step / 16) * H;
                const wx = midX + (Math.random() - 0.5) * 8;
                step === 0 ? ctx.moveTo(wx, y) : ctx.lineTo(wx, y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
            animId = requestAnimationFrame(draw);
        };
        animId = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(animId); ro.disconnect(); };
    }, []);
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ─── Retro pixel monitor ─────────────────────────────────────────── */
function TimelineMonitor({ timeline, glitching }) {
    const c = SCREEN_COLORS[timeline];
    const boxes = INDICATORS[timeline];

    return (
        <div
            className="relative select-none"
            style={{
                /* outer metal body */
                background: 'linear-gradient(160deg, #3a3a4a 0%, #252530 60%, #1a1a24 100%)',
                border: '3px solid #4a4a5a',
                borderRadius: '6px',
                padding: '10px',
                boxShadow: `
                    4px 4px 0 #0d0d14,
                    -2px -2px 0 #555566,
                    0 0 40px ${c.outerGlow},
                    0 0 80px ${c.outerGlow}
                `,
                imageRendering: 'pixelated',
                width: '300px',
                maxWidth: '380px',
            }}
        >
            {/* bezel top vent slots */}
            <div className="flex gap-1 mb-2 px-1">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-1 flex-1 rounded-full" style={{ background: '#1a1a24' }} />
                ))}
            </div>

            {/* screen bezel inner */}
            <div
                style={{
                    background: '#111118',
                    border: '3px solid #1a1a24',
                    borderRadius: '3px',
                    padding: '4px',
                    boxShadow: 'inset 0 0 12px rgba(0,0,0,0.9)',
                }}
            >
                {/* CRT screen */}
                <div
                    className="relative overflow-hidden"
                    style={{
                        background: `radial-gradient(ellipse at 50% 40%, #0d200d 0%, #060e06 100%)`,
                        border: `2px solid ${c.dim}`,
                        borderRadius: '2px',
                        padding: '24px 20px 20px',
                        minHeight: '160px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: `inset 0 0 30px rgba(0,0,0,0.7), inset 0 0 8px ${c.outerGlow}`,
                    }}
                >
                    {/* scanlines overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)',
                            zIndex: 2,
                        }}
                    />

                    {/* noise */}
                    <NoiseOverlay />

                    {/* content */}
                    <div className="relative z-10 flex flex-col items-center gap-3"
                        style={{ opacity: glitching ? 0.3 : 1, transition: 'opacity 0.05s' }}>

                        {/* "TIME" label */}
                        <p
                            style={{
                                color: c.glow,
                                fontFamily: "'Press Start 2P', monospace",
                                fontSize: '11px',
                                letterSpacing: '0.25em',
                                textShadow: `0 0 6px ${c.glow}`,
                            }}
                        >
                            TIME
                        </p>

                        {/* main timeline name */}
                        <p
                            style={{
                                color: c.fg,
                                fontFamily: "'Press Start 2P', monospace",
                                fontSize: 'clamp(22px, 5vw, 32px)',
                                letterSpacing: '0.05em',
                                textShadow: `0 0 10px ${c.glow}, 0 0 20px ${c.outerGlow}`,
                                lineHeight: 1,
                            }}
                        >
                            {timeline}
                        </p>

                        {/* indicator boxes */}
                        <div className="flex items-center gap-4 mt-1">
                            {boxes.map((box, i) => {
                                const isActive = box === '■';
                                const isDone = box === '⊗';
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            width: '26px',
                                            height: '26px',
                                            border: `2px solid ${isActive ? c.fg : c.dim}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: isActive ? `${c.dim}88` : 'transparent',
                                            boxShadow: isActive ? `0 0 8px ${c.glow}, inset 0 0 6px ${c.outerGlow}` : 'none',
                                            fontFamily: "'Press Start 2P', monospace",
                                            fontSize: '10px',
                                            color: isDone ? c.dim : isActive ? c.fg : `${c.dim}88`,
                                        }}
                                    >
                                        {isDone ? '×' : isActive ? '■' : ' '}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* glitch bar flash */}
                    {glitching && (
                        <div
                            className="absolute inset-x-0 pointer-events-none z-20"
                            style={{
                                top: `${20 + Math.random() * 60}%`,
                                height: '3px',
                                background: c.fg,
                                opacity: 0.7,
                            }}
                        />
                    )}
                </div>
            </div>

            {/* bottom row: Q key — status — E key */}
            <div className="flex items-center justify-between px-1 mt-2">
                {/* Q key */}
                <div style={keyStyle}>Q</div>

                {/* status LEDs */}
                <div className="flex gap-2 items-center">
                    {TIMELINES.map((tl) => (
                        <div
                            key={tl}
                            style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background: tl === timeline ? SCREEN_COLORS[tl].fg : '#1a1a2a',
                                boxShadow: tl === timeline ? `0 0 6px ${SCREEN_COLORS[tl].glow}` : 'none',
                                transition: 'all 0.3s',
                            }}
                        />
                    ))}
                </div>

                {/* E key */}
                <div style={keyStyle}>E</div>
            </div>

            {/* bottom vent slots */}
            <div className="flex gap-1 mt-2 px-1">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-1 flex-1 rounded-full" style={{ background: '#1a1a24' }} />
                ))}
            </div>
        </div>
    );
}

const keyStyle = {
    width: '28px',
    height: '28px',
    background: 'linear-gradient(145deg, #3a3a4a, #1e1e28)',
    border: '2px solid #555',
    borderBottom: '3px solid #0d0d14',
    borderRight: '3px solid #0d0d14',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '9px',
    color: '#888',
    userSelect: 'none',
};

/* ─── Main Section ────────────────────────────────────────────────── */
const CommunityNexus = () => {
    const [timelineIdx, setTimelineIdx] = useState(1); // start on PRESENT
    const [glitching, setGlitching] = useState(false);

    const timeline = TIMELINES[timelineIdx];
    const c = SCREEN_COLORS[timeline];

    // auto-cycle every 3s with a glitch transition
    useEffect(() => {
        const id = setInterval(() => {
            setGlitching(true);
            setTimeout(() => {
                setTimelineIdx(i => (i + 1) % 3);
                setGlitching(false);
            }, 200);
        }, 3000);
        return () => clearInterval(id);
    }, []);

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
                rel="stylesheet"
            />
            <style>{`
                @keyframes rift-border-glow {
                    0%,100% { box-shadow: 0 0 16px rgba(16,185,129,0.15), inset 0 0 10px rgba(16,185,129,0.04); }
                    50%     { box-shadow: 0 0 40px rgba(16,185,129,0.3),  inset 0 0 20px rgba(16,185,129,0.07); }
                }
                @keyframes rift-flicker {
                    0%,100% { opacity:1; }
                    46%     { opacity:0.5; }
                    47%     { opacity:1; }
                    81%     { opacity:0.7; }
                    82%     { opacity:1; }
                }
                @keyframes scanline-run {
                    0%   { top:-4%; }
                    100% { top:104%; }
                }
                .scanline-run {
                    position:absolute; left:0; width:100%; height:2px;
                    background:rgba(16,185,129,0.06);
                    animation:scanline-run 5s linear infinite;
                    pointer-events:none;
                }
                @keyframes glitch-bar {
                    0%,100% { transform:translateX(0); opacity:0; }
                    50%     { transform:translateX(-4px); opacity:1; }
                    75%     { transform:translateX(4px); opacity:0.6; }
                }
            `}</style>

            <section
                id="community"
                className="relative w-full overflow-hidden bg-slate-950 border-b border-slate-800"
                style={{ minHeight: '560px' }}
            >
                {/* backdrop */}
                <div className="absolute inset-0"><BackdropCanvas /></div>

                {/* running scanline */}
                <div className="scanline-run" />



                {/* main content */}
                <div className="relative z-10 flex flex-col items-center justify-center gap-8 min-h-[560px] px-8 py-16 max-w-3xl mx-auto text-center">

                    {/* eyebrow + headline */}
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-emerald-500/60 font-mono text-[10px] tracking-[0.5em] uppercase"
                            style={{ animation: 'rift-flicker 5s infinite' }}>
                            ◈ &nbsp; TEMPORAL RIFT DETECTED &nbsp; ◈
                        </p>
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-tight">
                                ENTER THE
                            </h2>
                            <h2
                                className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-tight"
                                style={{
                                    color: c.fg,
                                    textShadow: `0 0 25px ${c.glow}, 0 0 50px ${c.outerGlow}`,
                                    transition: 'color 0.4s, text-shadow 0.4s',
                                }}
                            >
                                NEXUS
                            </h2>
                        </div>
                    </div>

                    {/* monitor */}
                    <div className="flex items-center justify-center shrink-0">
                        <TimelineMonitor timeline={timeline} glitching={glitching} />
                    </div>

                    {/* body text + CTA */}
                    <div className="flex flex-col items-center gap-6 max-w-sm">

                        <p className="text-slate-400 font-mono text-sm leading-relaxed tracking-wide">
                            Between timelines, there is a signal.<br />
                            <span style={{ color: c.fg, transition: 'color 0.4s' }}>Tune in on Discord</span> — shape the
                            studio's next chapter with us.
                        </p>

                        {/* timeline pills */}
                        <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.25em] uppercase select-none">
                            {TIMELINES.map((tl, i) => {
                                const active = tl === timeline;
                                const sc = SCREEN_COLORS[tl];
                                return (
                                    <React.Fragment key={tl}>
                                        <span
                                            style={{
                                                padding: '3px 10px',
                                                border: `1px solid ${active ? sc.fg : sc.dim}`,
                                                color: active ? sc.fg : `${sc.dim}`,
                                                background: active ? `${sc.dim}33` : 'transparent',
                                                boxShadow: active ? `0 0 8px ${sc.outerGlow}` : 'none',
                                                transition: 'all 0.4s',
                                            }}
                                        >
                                            {tl}
                                        </span>
                                        {i < 2 && <span className="text-slate-700">›</span>}
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {/* Discord CTA */}
                        <a
                            href="https://discord.gg/EEkV5d3kbR"
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseMove={(e) => {
                                const r = e.currentTarget.getBoundingClientRect();
                                e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
                                e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
                            }}
                            className="group relative inline-flex items-center gap-3
                                px-8 py-4
                                text-emerald-300 font-mono font-bold text-sm tracking-[0.3em] uppercase
                                hover:text-slate-950
                                transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                            style={{
                                border: '1px solid rgba(16,185,129,0.6)',
                                background: 'rgba(6,30,20,0.4)',
                                animation: 'rift-border-glow 3s ease-in-out infinite',
                            }}
                        >
                            {/* hover fill */}
                            <span
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                                style={{ background: '#10b981' }}
                            />
                            {/* shimmer */}
                            <span
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none z-10"
                                style={{ background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.15) 0%, transparent 60%)' }}
                            />
                            <FaDiscord className="text-xl shrink-0 relative z-20" />
                            <span className="relative z-20">JOIN THE DISCORD</span>
                        </a>
                    </div>
                </div>
            </section>

        </>
    );
};

export default CommunityNexus;

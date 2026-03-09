import React, { useEffect, useRef, useState } from 'react';
import { FaDiscord } from 'react-icons/fa6';

/* ─── Rift Canvas ─────────────────────────────────────────────────── */
function RiftCanvas({ hovered }) {
    const canvasRef = useRef(null);
    const hovRef = useRef(hovered);
    useEffect(() => { hovRef.current = hovered; }, [hovered]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        let t = 0;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        function drawTimeline(label, color, rgbVec, xFrac, yOffset, t, W, H) {
            const cx = W * xFrac;
            const cy = H * 0.5 + yOffset;
            const radius = Math.min(W, H) * 0.09 + (hovRef.current ? 8 : 0) * Math.sin(t * 2);

            /* orbiting glow */
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2.4);
            grad.addColorStop(0, `rgba(${rgbVec},0.18)`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 2.4, 0, Math.PI * 2);
            ctx.fill();

            /* main ring */
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = hovRef.current ? 2 : 1.2;
            ctx.globalAlpha = 0.55 + 0.2 * Math.sin(t * 1.5 + xFrac * 4);
            ctx.shadowColor = color;
            ctx.shadowBlur = hovRef.current ? 20 : 10;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            /* cracked shards — 3 arcs radiating out */
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2 + t * 0.3 + xFrac;
                const len = radius * (1.4 + 0.5 * Math.sin(t + i));
                ctx.save();
                ctx.strokeStyle = color;
                ctx.globalAlpha = 0.25 + 0.1 * Math.sin(t * 2 + i);
                ctx.lineWidth = 0.8;
                ctx.shadowColor = color;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
                ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
                ctx.stroke();
                ctx.restore();
            }

            /* label */
            ctx.save();
            ctx.font = `bold ${Math.floor(W * 0.01 + 8)}px monospace`;
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.7;
            ctx.textAlign = 'center';
            ctx.fillText(label, cx, cy + radius + 24);
            ctx.restore();
        }

        function drawRiftCrack(W, H, t) {
            const openAmt = hovRef.current ? 1 : 0.5;
            /* vertical crack from top to bottom */
            const midX = W * 0.5;
            ctx.save();
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 20;
            ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 2);

            ctx.beginPath();
            const steps = 20;
            for (let i = 0; i <= steps; i++) {
                const y = (i / steps) * H;
                const wiggle = (Math.random() - 0.5) * 6 * openAmt;
                if (i === 0) ctx.moveTo(midX + wiggle, y);
                else ctx.lineTo(midX + wiggle, y);
            }
            ctx.stroke();
            ctx.restore();

            /* rift glow center */
            const cg = ctx.createRadialGradient(midX, H * 0.5, 0, midX, H * 0.5, H * 0.35);
            cg.addColorStop(0, `rgba(16,185,129,${0.12 * openAmt})`);
            cg.addColorStop(0.5, `rgba(16,185,129,${0.04 * openAmt})`);
            cg.addColorStop(1, 'transparent');
            ctx.fillStyle = cg;
            ctx.fillRect(0, 0, W, H);
        }

        function drawParticles(W, H, t) {
            for (let i = 0; i < 40; i++) {
                const seed = i * 137.5;
                const px = (((seed * 0.618) % 1) * W);
                const py = (((seed * 0.382) % 1) * H + t * (10 + (seed % 8))) % H;
                const alpha = 0.15 + 0.1 * Math.sin(t + i);
                /* colour based on x zone */
                const hue = px < W * 0.33 ? '40,30,10' : px > W * 0.66 ? '220,50,50' : '16,185,129';
                ctx.save();
                ctx.fillStyle = `rgba(${hue},${alpha})`;
                ctx.beginPath();
                ctx.arc(px, py, 1.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        const loop = () => {
            const W = canvas.width, H = canvas.height;
            t += 0.012;
            ctx.clearRect(0, 0, W, H);

            drawParticles(W, H, t);

            // Past — warm sepia left
            drawTimeline('PAST', '#b45309', '180,83,9', 0.18, 0, t, W, H);
            // Present — emerald centre
            // (intentionally slightly off-centre left to give room for "Future" on right)
            // Future — red-corrupt right
            drawTimeline('FUTURE', '#ef4444', '239,68,68', 0.82, 0, t, W, H);

            drawRiftCrack(W, H, t);

            animId = requestAnimationFrame(loop);
        };
        animId = requestAnimationFrame(loop);

        return () => { cancelAnimationFrame(animId); ro.disconnect(); };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
        />
    );
}

/* ─── Glitch text  ────────────────────────────────────────────────── */
function GlitchText({ children, className = '' }) {
    return (
        <span className={`relative inline-block ${className}`}>
            <span className="glitch-main">{children}</span>
            <span className="glitch-copy1" aria-hidden="true">{children}</span>
            <span className="glitch-copy2" aria-hidden="true">{children}</span>
        </span>
    );
}

/* ─── Main Section ────────────────────────────────────────────────── */
const CommunityNexus = () => {
    const [hovered, setHovered] = useState(false);

    return (
        <>
            {/* Inline keyframes for glitch + scanlines */}
            <style>{`
                .glitch-main  { position: relative; z-index: 1; }
                .glitch-copy1,
                .glitch-copy2 {
                    position: absolute; top: 0; left: 0;
                    width: 100%; overflow: hidden;
                }
                .glitch-copy1 {
                    color: #ef4444;
                    clip-path: polygon(0 30%, 100% 30%, 100% 55%, 0 55%);
                    animation: glitch1 3.5s infinite steps(1);
                    opacity: 0;
                }
                .glitch-copy2 {
                    color: #60a5fa;
                    clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%);
                    animation: glitch2 4s infinite steps(1);
                    opacity: 0;
                }
                @keyframes glitch1 {
                    0%,90%  { opacity:0; transform:translate(0,0); }
                    91%     { opacity:1; transform:translate(-3px, 1px); }
                    93%     { opacity:1; transform:translate(3px,-1px); }
                    95%     { opacity:0; }
                }
                @keyframes glitch2 {
                    0%,85%  { opacity:0; transform:translate(0,0); }
                    86%     { opacity:1; transform:translate(4px, 2px); }
                    89%     { opacity:1; transform:translate(-2px,-2px); }
                    91%     { opacity:0; }
                }
                @keyframes rift-pulse {
                    0%,100% { opacity:0.6; transform:scaleX(1); }
                    50%     { opacity:1;   transform:scaleX(1.04); }
                }
                @keyframes rift-flicker {
                    0%,100% { opacity: 1; }
                    45%     { opacity: 0.92; }
                    46%     { opacity: 0.4; }
                    47%     { opacity: 0.92; }
                    80%     { opacity: 1; }
                    81%     { opacity: 0.6; }
                    82%     { opacity: 1; }
                }
                .rift-flicker { animation: rift-flicker 5s infinite; }

                @keyframes scanline {
                    0%   { top: -5%; }
                    100% { top: 105%; }
                }
                .scanline {
                    position: absolute;
                    left:0; width:100%; height:2px;
                    background: rgba(16,185,129,0.08);
                    animation: scanline 4s linear infinite;
                    pointer-events: none;
                }
                @keyframes rift-border-glow {
                    0%,100% { box-shadow: 0 0 20px rgba(16,185,129,0.15), inset 0 0 20px rgba(16,185,129,0.04); }
                    50%     { box-shadow: 0 0 50px rgba(16,185,129,0.35), inset 0 0 30px rgba(16,185,129,0.08); }
                }
            `}</style>

            <section
                id="community"
                className="relative w-full overflow-hidden bg-slate-950"
                style={{ minHeight: '520px' }}
            >
                {/* ── canvas backdrop ── */}
                <div className="absolute inset-0">
                    <RiftCanvas hovered={hovered} />
                </div>

                {/* running scanline */}
                <div className="scanline" />

                {/* top / bottom edge lines */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-700/50 to-transparent" />

                {/* ── centred CTA card ── */}
                <div className="relative z-10 flex items-center justify-center min-h-[520px] px-6 py-24">
                    <div className="flex flex-col items-center text-center gap-8 max-w-lg">

                        {/* eyebrow */}
                        <p className="text-emerald-500/70 font-mono text-[10px] tracking-[0.5em] uppercase rift-flicker">
                            ◈ &nbsp; TEMPORAL RIFT DETECTED &nbsp; ◈
                        </p>

                        {/* headline */}
                        <div className="flex flex-col items-center gap-1">
                            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none uppercase rift-flicker">
                                <GlitchText>ENTER THE</GlitchText>
                            </h2>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-none uppercase"
                                style={{
                                    color: '#10b981',
                                    textShadow: '0 0 30px rgba(16,185,129,0.6), 0 0 60px rgba(16,185,129,0.3)',
                                    animation: 'rift-pulse 3s ease-in-out infinite'
                                }}>
                                <GlitchText>RIFT</GlitchText>
                            </h2>
                        </div>

                        {/* descriptor */}
                        <p className="text-slate-400 font-mono text-sm md:text-base leading-relaxed max-w-sm tracking-wide">
                            Between past and future lies a frequency only few can tune into.
                            {' '}<span className="text-emerald-400">Join our Discord</span> — where the timelines converge
                            and the community shapes what comes next.
                        </p>

                        {/* three timeline pills */}
                        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] uppercase select-none">
                            <span className="px-3 py-1 border border-amber-700/50 text-amber-600/80 bg-amber-950/20">PAST</span>
                            <span className="text-emerald-500/50">⬡</span>
                            <span className="px-3 py-1 border border-emerald-500/60 text-emerald-400 bg-emerald-950/20"
                                style={{ boxShadow: '0 0 10px rgba(16,185,129,0.2)' }}>
                                PRESENT
                            </span>
                            <span className="text-emerald-500/50">⬡</span>
                            <span className="px-3 py-1 border border-red-700/50 text-red-500/80 bg-red-950/20">FUTURE</span>
                        </div>

                        {/* Discord CTA button */}
                        <a
                            href="https://discord.gg/EEkV5d3kbR"
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                            onMouseMove={(e) => {
                                const r = e.currentTarget.getBoundingClientRect();
                                e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
                                e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
                            }}
                            className="group relative inline-flex items-center gap-3
                                px-10 py-4 mt-2
                                border border-emerald-500/60 bg-emerald-950/20
                                text-emerald-300 font-mono font-bold text-sm tracking-[0.3em] uppercase
                                hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-300
                                transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                            style={{ animation: 'rift-border-glow 3s ease-in-out infinite' }}
                        >
                            {/* radial shimmer on hover */}
                            <span
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                                style={{ background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.1) 0%, transparent 60%)' }}
                            />
                            <FaDiscord className="text-xl shrink-0 relative z-10" />
                            <span className="relative z-10">JOIN THE DISCORD</span>
                        </a>

                        {/* sub note */}
                        <p className="text-slate-600 font-mono text-[10px] tracking-widest">
                            ALL TIMELINES WELCOME
                        </p>

                    </div>
                </div>
            </section>
        </>
    );
};

export default CommunityNexus;

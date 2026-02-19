import { useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Building2, Zap, Trophy, Users, TrendingUp, Hammer } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const timelineEvents = [
    {
        year: '2001',
        title: 'Tino: The Foundation',
        description: 'Founder Tino establishes the industrial precision standards that define MSC today.',
        stat: 'Est. 2001',
        icon: Hammer
    },
    {
        year: '2012',
        title: 'Energizing Apartments',
        description: 'Major massive deployment: Fully powering over 4,000 apartments in a single phase.',
        stat: '4,000+ Units',
        icon: Zap
    },
    {
        year: '2016',
        title: 'Townhome Grids',
        description: 'Engineering high-performance electrical networks for 480 townhomes.',
        stat: '480 Homes',
        icon: Building2
    },
    {
        year: '2019',
        title: 'Residential Scaling',
        description: 'Expanding the MSC network with power solutions for 360 additional units.',
        stat: '360 Units',
        icon: TrendingUp
    },
    {
        year: '2023',
        title: 'Diversified Infra',
        description: 'Deploying systems for 360 apartments and 181 duplexes with extreme adaptability.',
        stat: '541 Units',
        icon: Users
    },
    {
        year: '2025',
        title: 'Region Expansion',
        description: 'Active clusters in College Station, Rockport, and New Braunfels.',
        stat: '1,080 Units',
        icon: Trophy
    }
];

export function TrackRecordSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    // State to track active event for React rendering if needed, 
    // but we'll try to drive most via GSAP for smoothness.
    // Actually, swapping text via GSAP onScroll is efficient.

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const totalEvents = timelineEvents.length;

            // Master Timeline
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: `+=${totalEvents * 100}%`, // Scroll distance based on item count
                    pin: true,
                    scrub: 1,
                    snap: 1 / (totalEvents - 1)
                }
            });

            // 1. Background slow parallax
            tl.to(bgRef.current, { scale: 1.1, ease: 'none' }, 0);

            // 2. Cycle through events
            timelineEvents.forEach((_, index) => {
                if (index === 0) return; // First one is visible by default

                const stepStart = (index - 1) / (totalEvents - 1);
                const stepEnd = index / (totalEvents - 1);

                // Hide previous
                tl.to(`.event-group-${index - 1}`, {
                    opacity: 0,
                    y: -50,
                    filter: 'blur(10px)',
                    duration: 0.1
                }, stepStart * tl.duration());

                // Show current
                tl.fromTo(`.event-group-${index}`,
                    { opacity: 0, y: 50, filter: 'blur(10px)' },
                    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.1 },
                    stepStart * tl.duration() + 0.05
                );

                // Active Dot Animation
                tl.to('.progress-dot', {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    scale: 1
                }, stepStart * tl.duration());

                tl.to(`.progress-dot-${index}`, {
                    backgroundColor: '#F2C94C',
                    scale: 1.5
                }, stepStart * tl.duration());
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="section-pinned z-40 bg-[#0B0C0F] text-white overflow-hidden relative"
        >
            {/* Background Image */}
            <div
                ref={bgRef}
                className="absolute inset-0 z-[1]"
                style={{
                    backgroundImage: 'url(/project_commercial.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 z-[2] bg-[#0B0C0F]/80 backdrop-blur-[2px]" />

            {/* Vertical Label */}
            <div className="absolute left-[4vw] top-1/2 -translate-y-1/2 z-[6] hidden md:block">
                <span className="font-mono text-xs text-[#A9AFB8] tracking-[0.2em] vertical-label vertical-label-left">
                    TIMELINE
                </span>
            </div>

            {/* Main Content Container */}
            <div ref={contentRef} className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6">

                {/* Static Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                        <Trophy className="w-3 h-3" />
                        Proven Track Record
                    </div>
                </div>

                {/* Dynamic Event Container */}
                <div className="relative w-full max-w-4xl h-[40vh] flex items-center justify-center">
                    {timelineEvents.map((event, index) => (
                        <div
                            key={index}
                            className={`event-group-${index} absolute inset-0 flex flex-col items-center justify-center text-center`}
                            style={{ opacity: index === 0 ? 1 : 0 }}
                        >
                            {/* Giant Year */}
                            <h2 className="text-[clamp(6rem,15vw,12rem)] font-display font-bold leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/0 select-none">
                                {event.year}
                            </h2>

                            {/* Content Overlay */}
                            <div className="relative -mt-8 md:-mt-16 z-20">
                                <h3 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
                                    {event.title}
                                </h3>
                                <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-8">
                                    {event.description}
                                </p>

                                <div className="inline-flex items-center gap-4 px-6 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                                    <event.icon className="w-6 h-6 text-[#F2C94C]" />
                                    <div className="text-left">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Milestone</div>
                                        <div className="text-xl font-bold text-white">{event.stat}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Progress Dots */}
                <div ref={progressRef} className="mt-16 flex items-center gap-4">
                    {timelineEvents.map((event, index) => (
                        <div key={index} className="group relative flex flex-col items-center gap-2">
                            <div
                                className={`progress-dot progress-dot-${index} w-3 h-3 rounded-full transition-all duration-300 ${index === 0 ? 'bg-[#F2C94C] scale-150' : 'bg-white/20'}`}
                            />
                            <span className="absolute top-6 text-[10px] font-mono text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {event.year}
                            </span>
                        </div>
                    ))}
                </div>

            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Scroll Timeline</span>
            </div>
        </section>
    );
}

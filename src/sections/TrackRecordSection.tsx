import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Building2, Zap, Trophy, Users, TrendingUp, Hammer } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const timelineEvents = [
    { year: '2001', title: 'Foundation', stat: 'Est. 2001', icon: Hammer },
    { year: '2012', title: 'Energizing Apts', stat: '4,000+ Units', icon: Zap },
    { year: '2016', title: 'Townhome Grids', stat: '480 Homes', icon: Building2 },
    { year: '2019', title: 'Scaling Up', stat: '360 Units', icon: TrendingUp },
    { year: '2023', title: 'Diversified', stat: '541 Units', icon: Users },
    { year: '2025', title: 'Expansion', stat: '1,080 Units', icon: Trophy }
];

export function TrackRecordSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            });

            // Animate Master Line
            tl.fromTo(lineRef.current,
                { scaleX: 0 },
                { scaleX: 1, duration: 1, ease: 'power3.inOut' }
            );

            // Animate individual nodes
            const items = itemsRef.current?.querySelectorAll('.timeline-node');
            if (items) {
                tl.fromTo(items,
                    { opacity: 0, y: 30, scale: 0.8 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)' },
                    "-=0.5"
                );
            }

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-16 bg-[#0B0C0F] border-b border-white/5 relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0B0C0F] to-[#0B0C0F] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">24 Years</span> of Excellence
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        From our foundation to energizing over 6,000 units across Texas. The legacy behind the gallery.
                    </p>
                </div>

                {/* Horizontal Timeline */}
                <div className="relative pt-12 pb-8 overflow-x-auto hide-scrollbar">
                    <div className="min-w-[800px] px-8">
                        {/* Connecting Line */}
                        <div className="absolute top-[4.5rem] left-0 w-full h-[2px] bg-white/10 origin-left" ref={lineRef}>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-[#F2C94C]/50" />
                        </div>

                        {/* Nodes */}
                        <div ref={itemsRef} className="flex justify-between relative z-10">
                            {timelineEvents.map((event, index) => (
                                <div key={index} className="timeline-node flex flex-col items-center w-32 relative group">
                                    {/* Year */}
                                    <span className="text-sm font-mono font-bold text-gray-500 mb-4 group-hover:text-white transition-colors">
                                        {event.year}
                                    </span>

                                    {/* Dot / Icon container */}
                                    <div className="w-12 h-12 rounded-full bg-[#111318] border-2 border-white/10 flex items-center justify-center mb-6 group-hover:border-[#F2C94C] group-hover:shadow-[0_0_20px_rgba(242,201,76,0.3)] transition-all duration-300 relative bg-clip-padding">
                                        <event.icon className="w-5 h-5 text-blue-400 group-hover:text-[#F2C94C] transition-colors" />
                                    </div>

                                    {/* Content below */}
                                    <div className="text-center">
                                        <h4 className="text-white font-bold text-sm mb-1">{event.title}</h4>
                                        <span className="text-xs text-blue-400 font-mono">{event.stat}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

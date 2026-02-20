import { useRef, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Building2, Zap, Trophy, Users, TrendingUp, Hammer, ArrowRight, MessageSquare, ImageIcon } from 'lucide-react';
import { ClientMarquee } from '@/components/ui/ClientMarquee';
import { AIConsultationModal } from '@/components/ui/AIConsultationModal';

gsap.registerPlugin(ScrollTrigger);

interface TrackRecordSectionProps {
    hidePortfolioCTA?: boolean;
}

const timelineEvents = [
    { year: '2001', title: 'Foundation', stat: 'Est. 2001', icon: Hammer, desc: 'Where precision began.', images: ['/project_panel.jpg', '/outlets_safety.jpg', '/project_commercial.jpg'] },
    { year: '2012', title: 'Energizing Apts', stat: '4,000+ Units', icon: Zap, desc: 'Massive scale deployment.', images: ['/gallery/IMG_1294.PNG', '/ceiling_fixtures.jpg', '/gallery/IMG_1296.PNG'] },
    { year: '2016', title: 'Townhome Grids', stat: '480 Homes', icon: Building2, desc: 'High-performance networks.', images: ['/gallery/IMG_1281.PNG', '/gallery/IMG_1286.PNG', '/gallery/IMG_1289.PNG'] },
    { year: '2019', title: 'Scaling Up', stat: '360 Units', icon: TrendingUp, desc: 'Rapid residential growth.', images: ['/hero_home_dusk.jpg', '/project_ev.jpg', '/project_smart.jpg'] },
    { year: '2023', title: 'Diversified', stat: '541 Units', icon: Users, desc: 'Complex mixed-use infra.', images: ['/gallery/IMG_1292.PNG', '/gallery/IMG_1296.PNG', '/gallery/IMG_1297.PNG'] },
    { year: '2025', title: 'Expansion', stat: '1,080 Units', icon: Trophy, desc: 'Regional dominance.', images: ['/gallery/IMG_1300.PNG', '/project_commercial.jpg', '/gallery/IMG_1294.PNG'] }
];

export function TrackRecordSection({ hidePortfolioCTA = false }: TrackRecordSectionProps = {}) {
    const sectionRef = useRef<HTMLElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const nodesRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // UI State for triggering modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            });

            // 1. Header fade in
            tl.fromTo(headerRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
            );

            // 2. Thick Glowing Line draws across
            tl.fromTo(lineRef.current,
                { scaleX: 0 },
                { scaleX: 1, duration: 1.2, ease: 'power4.inOut' },
                "-=0.4"
            );

            // 3. Nodes pop in with a bounce, staggered
            const nodes = nodesRef.current?.querySelectorAll('.timeline-card');
            if (nodes) {
                tl.fromTo(nodes,
                    { y: 100, opacity: 0, scale: 0.5, rotationY: 45 },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        rotationY: 0,
                        duration: 0.8,
                        stagger: 0.15,
                        ease: 'back.out(1.7)'
                    },
                    "-=0.8"
                );
            }

            // 4. Glow pulses on the icons
            const icons = nodesRef.current?.querySelectorAll('.icon-ring');
            if (icons) {
                tl.fromTo(icons,
                    { boxShadow: '0 0 0px rgba(242,201,76,0)' },
                    {
                        boxShadow: '0 0 30px rgba(242,201,76,0.6)',
                        duration: 1,
                        stagger: 0.15,
                        ease: 'power2.out'
                    },
                    "-=0.6"
                );
            }

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-32 bg-[#0B0C0F] border-b border-white/5 relative overflow-hidden"
            style={{ perspective: '1000px' }}
        >
            {/* Dynamic Backgrounds */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0B0C0F] to-[#0B0C0F] pointer-events-none" />

            {/* Giant abstract year in background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-display font-bold text-white/[0.02] pointer-events-none whitespace-nowrap hidden md:block select-none">
                2001 - 2025
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <div ref={headerRef} className="text-center mb-24 relative">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F2C94C]/10 border border-[#F2C94C]/20 text-[#F2C94C] text-sm font-bold uppercase tracking-widest mb-6">
                        <Trophy className="w-4 h-4" />
                        Proven Track Record
                    </div>
                    <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2C94C] to-yellow-200">24 Years</span> of Excellence
                    </h2>
                    <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed mb-6">
                        We don't just wire buildings; we energize communities. A legacy of <span className="text-white font-bold">6,000+ units</span> built on precision and trust.
                    </p>
                </div>

                {/* Infinite Flowing Client Logos */}
                <ClientMarquee />

                {/* Highly Visible Horizontal Timeline */}
                <div className="relative py-4 overflow-x-auto hide-scrollbar touch-pan-x cursor-grab active:cursor-grabbing w-full">
                    <div className="min-w-[1240px] px-8 pt-72 pb-40 relative">

                        {/* The Thick Connecting Line */}
                        <div className="absolute top-[60%] left-0 w-full h-1 -translate-y-1/2 origin-left z-0" ref={lineRef}>
                            {/* Base line */}
                            <div className="absolute inset-0 bg-white/10 rounded-full" />
                            {/* Glowing line */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-[#F2C94C] to-[#F2C94C] rounded-full shadow-[0_0_20px_rgba(242,201,76,0.5)]" />
                        </div>

                        {/* Timeline Nodes */}
                        <div ref={nodesRef} className="flex justify-between items-center relative z-10 w-full">
                            {timelineEvents.map((event, index) => (
                                <div key={index} className="timeline-card flex flex-col items-center w-56 relative group">

                                    {/* Project Collage (appears on hover) */}
                                    <div className="absolute bottom-[110%] mb-12 w-64 h-48 opacity-0 scale-95 origin-bottom pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] z-0 flex items-center justify-center">

                                        {/* Left Image */}
                                        <div className="absolute w-28 h-36 rounded-xl border border-white/20 bg-[#111318] shadow-2xl overflow-hidden -rotate-[15deg] -translate-x-12 translate-y-6 group-hover:-translate-x-16 group-hover:-rotate-12 transition-all duration-700">
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                                            <img src={event.images[0]} className="w-full h-full object-cover scale-110" alt="collage-1" />
                                        </div>

                                        {/* Right Image */}
                                        <div className="absolute w-28 h-36 rounded-xl border border-white/20 bg-[#111318] shadow-2xl overflow-hidden rotate-[15deg] translate-x-12 translate-y-6 group-hover:translate-x-16 group-hover:rotate-12 transition-all duration-700">
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                                            <img src={event.images[2]} className="w-full h-full object-cover scale-110" alt="collage-3" />
                                        </div>

                                        {/* Center Top Image */}
                                        <div className="absolute w-32 h-44 rounded-xl border border-[#F2C94C]/40 bg-[#111318] shadow-[0_0_40px_rgba(242,201,76,0.2)] overflow-hidden z-10 group-hover:-translate-y-4 transition-all duration-700">
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" />
                                            <img src={event.images[1]} className="w-full h-full object-cover scale-110" alt="collage-2" />

                                            {/* Top Banner Tag */}
                                            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white font-bold flex items-center gap-1 z-20 whitespace-nowrap border border-white/10">
                                                <ImageIcon className="w-3 h-3 text-[#F2C94C]" /> Preview
                                            </div>
                                        </div>
                                    </div>

                                    {/* Top: Massive Year */}
                                    <div className="absolute bottom-full mb-8 flex flex-col items-center origin-bottom transform transition-transform duration-500 group-hover:-translate-y-4">
                                        <span className="text-4xl font-display font-black text-white/20 group-hover:text-white transition-colors duration-500 tracking-tighter">
                                            {event.year}
                                        </span>
                                    </div>

                                    {/* Center: The Node (Icon) */}
                                    <div className="icon-ring w-20 h-20 rounded-full bg-[#111318] border-4 border-[#1A1D24] flex items-center justify-center relative z-10 group-hover:border-[#F2C94C] group-hover:bg-[#F2C94C]/10 transition-all duration-500 transform group-hover:scale-110">
                                        <event.icon className="w-8 h-8 text-gray-400 group-hover:text-[#F2C94C] transition-colors duration-500" />
                                        {/* Inner pulse ring on hover */}
                                        <div className="absolute inset-0 rounded-full border-2 border-[#F2C94C] opacity-0 group-hover:animate-ping" />
                                    </div>

                                    {/* Bottom: Detail Card */}
                                    <div className="absolute top-full mt-8 flex flex-col items-center w-full transform transition-all duration-500 group-hover:translate-y-4">
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 w-full text-center backdrop-blur-md group-hover:bg-white/10 group-hover:border-[#F2C94C]/30 transition-colors duration-500 relative overflow-hidden">
                                            {/* Hover highlight line */}
                                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#F2C94C] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            <h4 className="text-white font-bold text-sm mb-1">{event.title}</h4>
                                            <div className="text-lg font-display font-bold text-[#F2C94C] mb-2">{event.stat}</div>
                                            <p className="text-gray-400 text-xs leading-relaxed">{event.desc}</p>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Scroll hint for desktop if it overflows slightly */}
                <div className="text-center mt-8 md:hidden mb-16">
                    <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">Swipe to explore</span>
                </div>

                {/* Combined CTAs Grid */}
                <div className={`mx-auto mt-20 grid grid-cols-1 gap-8 ${hidePortfolioCTA ? 'max-w-3xl' : 'max-w-6xl md:grid-cols-2'}`}>

                    {/* View Complete Portfolio */}
                    {!hidePortfolioCTA && (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 text-center backdrop-blur-sm relative overflow-hidden group flex flex-col items-center justify-between">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div>
                                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <ImageIcon className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
                                    View Our Complete <span className="text-[#F2C94C]">Portfolio</span>
                                </h3>
                                <p className="text-gray-400 text-lg mb-8 max-w-sm mx-auto font-light leading-relaxed flex-grow">
                                    We've transformed over 6,000 properties across Texas. Explore our extensive gallery.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    if (window.location.pathname === '/projects') {
                                        const grid = document.getElementById('gallery-grid');
                                        grid?.scrollIntoView({ behavior: 'smooth' });
                                    } else {
                                        window.scrollTo({ top: 0, behavior: 'instant' });
                                        navigate('/projects');
                                    }
                                }}
                                className="group/btn relative inline-flex items-center justify-center px-8 py-4 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest rounded-full overflow-hidden transition-all hover:border-white/50 hover:bg-white/5"
                            >
                                <span className="relative flex items-center gap-3">
                                    Explore The Gallery <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform text-[#F2C94C]" />
                                </span>
                            </button>
                        </div>
                    )}

                    {/* Get Excited CTA Box */}
                    <div className="bg-[#111318] border border-[#F2C94C]/20 rounded-3xl p-8 md:p-12 text-center backdrop-blur-sm relative overflow-hidden group flex flex-col items-center justify-between shadow-[0_0_40px_rgba(242,201,76,0.05)]">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#F2C94C] to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
                        <div>
                            <div className="w-16 h-16 bg-[#F2C94C]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <MessageSquare className="w-8 h-8 text-[#F2C94C]" />
                            </div>
                            <h3 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
                                Ready for Excellence?
                            </h3>
                            <p className="text-gray-400 text-lg mb-8 max-w-sm mx-auto font-light leading-relaxed">
                                You've seen the track record. Let's make your next project our next success story.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="group/btn relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-[#F2C94C] text-black font-bold uppercase tracking-widest rounded-full overflow-hidden transition-transform hover:scale-105 shadow-[0_0_30px_rgba(242,201,76,0.3)] hover:shadow-[0_0_50px_rgba(242,201,76,0.5)]"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                            <span className="relative flex items-center gap-3">
                                Start Your Project <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </div>
                </div>

            </div>

            {/* AI Consultation Modal Triggered by CTA */}
            <AIConsultationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                context={{ type: 'selection', title: 'Start Your Custom Project' }}
            />
        </section>
    );
}

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, Check, Zap, Sparkles, MousePointerClick, Bot, FileText, Server, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

interface PanelUpgradesDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onBook: (type: string, title: string) => void;
}

const UPGRADES = [
    {
        id: 'heavy-up',
        title: '200 Amp Heavy-Up',
        description: 'Modernize your home’s electrical backbone to support high-demand appliances.',
        longText: 'Many older homes operate on 100 Amp services that simply cannot keep up with modern energy demands. Our 200 Amp Heavy-Up ensures your home has the capacity for the future, eliminates flickering lights, and improves overall electrical stability.',
        icon: Zap,
        image: '/panel_heavy_up.png',
        features: ['EV Charger Ready', 'Solar Compatible', 'Eliminates Flickering', 'Increased Resale Value']
    },
    {
        id: 'smart-panel',
        title: 'Smart Panel Integration',
        description: 'Gain unprecedented control and visibility over your energy usage.',
        longText: 'Transform your standard breaker box into a smart energy hub. Monitor real-time consumption circuit-by-circuit, automate load shedding during outages to extend battery life, and control power remotely from your smartphone.',
        icon: Cpu,
        image: '/panel_smart.png',
        features: ['App-Based Control', 'Real-Time Monitoring', 'Battery Optimization', 'Remote Circuit Switching']
    },
    {
        id: 'surge-protection',
        title: 'Whole-Home Surge Defense',
        description: 'Protect every device in your home from grid spikes and lightning strikes.',
        longText: 'Power strips aren’t enough. Our industrial-grade surge protection devices (SPDs) are installed directly at the main panel, stopping dangerous voltage spikes before they enter your home’s wiring. Essential protection for sensitive electronics.',
        icon: ShieldCheck,
        image: '/panel_surge.png',
        features: ['Protect All Appliances', 'Lightning Defense', 'Prevents Data Loss', 'Lifetime Warranty Options']
    },
    {
        id: 'subpanel',
        title: 'Subpanel Expansion',
        description: 'Securely expand your capacity for renovations and additions.',
        longText: 'When your main panel is full but still has amperage capacity, a subpanel is the safe, code-compliant solution to add more circuits. Ideal for kitchen remodels, finishing basements, or adding a workshop.',
        icon: Server,
        image: '/panel_subpanel.png',
        features: ['More Breaker Space', 'Dedicated Circuits', 'Code Compliant', 'Flexible Expansion']
    }
];

export function PanelUpgradesDrawer({ isOpen, onClose, onBook }: PanelUpgradesDrawerProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const drawerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';

            const tl = gsap.timeline();

            // Animate Overlay
            tl.to(overlayRef.current, {
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out',
                display: 'block'
            });

            // Animate Drawer Slide-In
            tl.fromTo(drawerRef.current,
                { x: '100%' },
                { x: '0%', duration: 0.6, ease: 'power3.out' },
                '-=0.2'
            );

            // Animate Content Stagger
            tl.fromTo('.drawer-item',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.4, ease: 'power2.out' },
                '-=0.3'
            );

        } else {
            document.body.style.overflow = '';

            const tl = gsap.timeline({
                onComplete: () => {
                    if (overlayRef.current) overlayRef.current.style.display = 'none';
                }
            });

            tl.to(drawerRef.current, {
                x: '100%',
                duration: 0.4,
                ease: 'power3.in'
            });

            tl.to(overlayRef.current, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in'
            }, '-=0.2');
        }
    }, [isOpen]);

    const handleBook = (itemTitle: string, itemId: string) => {
        onBook(itemId, itemTitle);
    };

    const handleCustomRequest = () => {
        onBook('custom', 'Custom Project');
    };

    return (
        <>
            {/* Backdrop Overlay */}
            <div
                ref={overlayRef}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] hidden opacity-0"
                onClick={onClose}
            />

            {/* Drawer Container */}
            <div
                ref={drawerRef}
                className="fixed top-0 right-0 h-full w-full md:w-[600px] lg:w-[700px] bg-[#0B0C0F] z-[95] shadow-2xl border-l border-white/10 overflow-y-auto translate-x-full"
            >
                <div className="p-8 md:p-12 relative min-h-full">

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Header */}
                    <div className="mb-8 drawer-item">
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
                            Panel <span className="text-[#F2C94C]">Perfection</span>
                        </h2>
                        <p className="text-gray-400 text-lg font-light leading-relaxed">
                            Powering the modern home requires a modern electrical backbone. Explore our premium panel solutions designed for safety, capacity, and control.
                        </p>
                    </div>

                    {/* How It Works Infographic */}
                    <div className="mb-12 p-6 rounded-2xl bg-[#1A1D24]/50 border border-white/5 backdrop-blur-sm relative overflow-hidden drawer-item">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F2C94C]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#F2C94C]" />
                            How to Get Started
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                            {/* Step 1: Chat */}
                            <div
                                onClick={() => onBook('chat', 'AI Consultation')}
                                className="flex flex-col gap-3 group cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#F2C94C]/10 flex items-center justify-center border border-[#F2C94C]/20 group-hover:border-[#F2C94C] group-hover:bg-[#F2C94C]/20 transition-all duration-300">
                                    <Bot className="w-6 h-6 text-[#F2C94C]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm mb-1 group-hover:text-[#F2C94C] transition-colors">Ask MSC Agent</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                                        Unsure what you need? Chat with our AI for a personalized diagnostic.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2: Quote */}
                            <div
                                onClick={() => onBook('quote', 'Quick Quote')}
                                className="flex flex-col gap-3 group cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500 group-hover:bg-blue-500/20 transition-all duration-300">
                                    <FileText className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm mb-1 group-hover:text-blue-400 transition-colors">Request a Quote</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                                        Already know your project details? Fill out a quick form to get started.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3: Browse */}
                            <div
                                onClick={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                className="flex flex-col gap-3 group cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500 group-hover:bg-purple-500/20 transition-all duration-300">
                                    <MousePointerClick className="w-6 h-6 text-purple-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm mb-1 group-hover:text-purple-400 transition-colors">Select an Option</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                                        Browse the upgrades below and book a specific service directly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upgrade Items */}
                    <div className="space-y-16" ref={contentRef}>
                        {UPGRADES.map((item) => (
                            <div key={item.id} className="drawer-item group">

                                {/* Image Card */}
                                <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 border border-white/10 shadow-lg group-hover:border-[#F2C94C]/30 transition-all duration-500">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url(${item.image})` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0F] via-transparent to-transparent opacity-80" />

                                    {/* Floating Icon */}
                                    <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-[#111318]/90 backdrop-blur border border-white/10 flex items-center justify-center shadow-xl">
                                        <item.icon className="w-6 h-6 text-[#F2C94C]" />
                                    </div>
                                </div>

                                {/* Text Content */}
                                <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-[#F2C94C] transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-white/80 font-medium mb-3">
                                    {item.description}
                                </p>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6 border-l-2 border-[#F2C94C]/20 pl-4">
                                    {item.longText}
                                </p>

                                {/* Features List */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {item.features.map(feature => (
                                        <div key={feature} className="flex items-center gap-2 text-xs text-gray-300">
                                            <Check className="w-3 h-3 text-[#F2C94C]" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <button
                                    id={`book-btn-${item.id}`}
                                    onClick={() => handleBook(item.title, item.id)}
                                    className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-[#F2C94C] hover:text-black hover:border-transparent transition-all font-mono text-sm font-bold uppercase tracking-wider active:scale-95"
                                >
                                    Book {item.title}
                                </button>

                            </div>
                        ))}

                        {/* Custom / Other Services Option */}
                        <div className="drawer-item pt-8 border-t border-white/10">
                            <div
                                onClick={handleCustomRequest}
                                className="group cursor-pointer rounded-2xl bg-[#111318] border border-white/5 p-8 hover:border-[#F2C94C]/30 transition-all hover:bg-white/5"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-bold text-white group-hover:text-[#F2C94C] transition-colors">
                                        Need something else?
                                    </h3>
                                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-[#F2C94C] transition-transform group-hover:translate-x-1" />
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Looking for a specific retrofit, repair, or commercial solution? Tell us what you need.
                                </p>
                            </div>
                        </div>

                    </div>

                    <div className="h-20" /> {/* Spacer */}
                </div>
            </div>
        </>
    );
}

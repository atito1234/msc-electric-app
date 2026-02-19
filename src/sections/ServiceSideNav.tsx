import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const services = [
    { id: 'panel', label: 'Panels' },
    { id: 'safety', label: 'Safety' },
    { id: 'smart', label: 'Smart' },
    { id: 'lighting', label: 'Light' },
    { id: 'future', label: 'Future' },
];

export function ServiceSideNav() {
    const navRef = useRef<HTMLDivElement>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // 1. Visibility Toggle (Only show during service sections)
        const toggleSt = ScrollTrigger.create({
            trigger: '#panel',
            start: 'top center',
            endTrigger: '#future',
            end: 'bottom center',
            onEnter: () => setIsVisible(true),
            onLeave: () => setIsVisible(false),
            onEnterBack: () => setIsVisible(true),
            onLeaveBack: () => setIsVisible(false),
        });

        // 2. Active State Tracking
        services.forEach(({ id }) => {
            ScrollTrigger.create({
                trigger: `#${id}`,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => setActiveId(id),
                onEnterBack: () => setActiveId(id),
            });
        });

        return () => {
            toggleSt.kill();
            ScrollTrigger.getAll().forEach(st => st.kill());
        };
    }, []);

    const handleScroll = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div
            ref={navRef}
            className={`fixed right-6 top-1/2 -translate-y-1/2 z-[90] transition-opacity duration-500 hidden md:block
        ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
        >
            <div className="flex flex-col gap-4">
                {services.map((service) => (
                    <button
                        key={service.id}
                        onClick={() => handleScroll(service.id)}
                        className="group flex items-center justify-end gap-3"
                    >
                        {/* Label (Reveals on hover or active) */}
                        <span
                            className={`text-xs font-mono tracking-widest uppercase transition-all duration-300
                ${activeId === service.id
                                    ? 'text-white translate-x-0 opacity-100'
                                    : 'text-gray-500 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                                }
              `}
                        >
                            {service.label}
                        </span>

                        {/* Indicator Dot/Bar */}
                        <div
                            className={`transition-all duration-300
                ${activeId === service.id
                                    ? 'w-1 h-8 bg-[#F2C94C]'
                                    : 'w-1 h-1.5 bg-white/20 group-hover:bg-white/50'
                                }
              `}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}

import { useRef, useState, useEffect } from 'react';
import { ArrowDown, X, Home, Image as ImageIcon, Zap, Shield, Cpu, Lightbulb, Phone } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate, useLocation } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export function FloatingNav() {
    const containerRef = useRef<HTMLDivElement>(null);
    const arrowRef = useRef<HTMLButtonElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isHome = location.pathname === '/';

    useEffect(() => {
        if (!containerRef.current) return;

        // Scroll Trigger to detect scroll state
        const st = ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: '100vh top',
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;

                // Sync React state for button behavior
                if (progress > 0.05 && !isScrolled) {
                    setIsScrolled(true);
                } else if (progress <= 0.05 && isScrolled) {
                    setIsScrolled(false);
                    setIsOpen(false); // Close menu if we go back to top
                }
            }
        });

        return () => {
            st.kill();
        };
    }, [location.pathname, isScrolled]);

    const handleMainClick = () => {
        if (!isScrolled) {
            // If at top (Arrow state), scroll down to first section
            if (isHome) {
                window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
            } else {
                navigate('/');
            }
        } else {
            // If scrolled, clicking the main button takes you back to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsOpen(false);
        }
    };

    const handleHomeClick = () => {
        if (isHome) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/');
        }
        setIsOpen(false);
    };

    const scrollToSection = (id: string) => {
        if (isHome) {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                setIsOpen(false);
            }
        } else {
            navigate('/');
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 500);
            setIsOpen(false);
        }
    };

    // Minimalist Menu Items
    const menuItems = [
        { label: 'Home', icon: Home, action: handleHomeClick },
        { label: 'Gallery', icon: ImageIcon, action: () => { navigate('/projects'); setIsOpen(false); } },
        { label: 'Panels', icon: Zap, action: () => scrollToSection('panel') },
        { label: 'Safety', icon: Shield, action: () => scrollToSection('safety') },
        { label: 'Smart', icon: Cpu, action: () => scrollToSection('smart') },
        { label: 'Light', icon: Lightbulb, action: () => scrollToSection('lighting') },
        { label: 'Contact', icon: Phone, action: () => scrollToSection('contact') },
    ];

    return (
        <div
            ref={containerRef}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center"
            onMouseEnter={() => isScrolled && setIsOpen(true)}
            onMouseLeave={() => isScrolled && setIsOpen(false)}
        >
            {/* Expanded Dock (Apple-style but prominent) */}
            <div
                className={`
                    absolute bottom-full mb-4 flex items-center gap-2 p-3
                    bg-[#111318]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]
                    transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${isOpen
                        ? 'opacity-100 scale-100 translate-y-0 visible'
                        : 'opacity-0 scale-90 translate-y-8 invisible pointer-events-none'
                    }
                `}
            >
                {menuItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={item.action}
                        className="group relative flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-white/10 transition-all duration-300"
                        aria-label={item.label}
                    >
                        <item.icon className="w-6 h-6 text-gray-400 group-hover:text-[#F2C94C] transition-colors mb-1" />
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-wider transition-colors">
                            {item.label}
                        </span>
                        {/* Interactive hover dot */}
                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#F2C94C] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300" />
                    </button>
                ))}
            </div>

            {/* Main Button */}
            <button
                ref={arrowRef}
                onClick={handleMainClick}
                className={`
                    group flex items-center justify-center w-14 h-14 rounded-full 
                    backdrop-blur-md shadow-[0_0_20px_rgba(242,201,76,0.3)]
                    bg-[#F2C94C] border border-[#F2C94C] text-black
                    transition-all duration-500 ease-out hover:scale-110 hover:shadow-[0_0_30px_rgba(242,201,76,0.6)]
                `}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-black" />
                ) : (
                    isScrolled ? (
                        // Menu Icon
                        <div className="flex flex-col gap-1 items-center">
                            <span className="w-6 h-0.5 bg-black rounded-full" />
                            <span className="w-6 h-0.5 bg-black rounded-full" />
                            <span className="w-6 h-0.5 bg-black rounded-full" />
                        </div>
                    ) : (
                        <ArrowDown className="w-6 h-6 text-black animate-bounce" />
                    )
                )}
            </button>
        </div>
    );
}

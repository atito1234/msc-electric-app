import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X, Zap, LogIn } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Animate underline on load
    if (underlineRef.current) {
      gsap.fromTo(underlineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6, delay: 0.8, ease: 'power2.out' }
      );
    }
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Services', id: 'services' },
    { label: 'Projects', id: 'projects' },
    { label: 'About', id: 'testimonials' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-[#0B0C0F]/90 backdrop-blur-md py-4' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="px-[4vw] flex items-center justify-between">
        {/* Logo */}
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-2 group"
        >
          <Zap className="w-6 h-6 text-[#F2C94C] transition-transform group-hover:scale-110" />
          <span className="font-display font-bold text-lg tracking-tight text-[#F6F7F9]">
            MSC ELECTRIC
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="relative">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="font-mono text-sm text-[#A9AFB8] hover:text-[#F6F7F9] transition-colors duration-300"
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div 
              ref={underlineRef}
              className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[#F2C94C] origin-left"
            />
          </div>
          <a 
            href="#/login"
            className="font-mono text-sm text-[#A9AFB8] hover:text-[#F6F7F9] transition-colors duration-300 flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Portal
          </a>
          <button 
            onClick={() => scrollToSection('contact')}
            className="btn-primary"
          >
            Get a Quote
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-[#F6F7F9] p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0B0C0F]/95 backdrop-blur-md border-t border-white/10">
          <div className="px-[4vw] py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="font-mono text-sm text-[#A9AFB8] hover:text-[#F6F7F9] transition-colors duration-300 text-left py-2"
              >
                {link.label}
              </button>
            ))}
            <a 
              href="#/login"
              className="font-mono text-sm text-[#A9AFB8] hover:text-[#F6F7F9] transition-colors duration-300 text-left py-2 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Portal Login
            </a>
            <button 
              onClick={() => scrollToSection('contact')}
              className="btn-primary mt-4 w-full"
            >
              Get a Quote
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

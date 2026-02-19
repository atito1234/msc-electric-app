import { useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollLabelRef = useRef<HTMLDivElement>(null);

  // Load animation (auto-play on mount)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Background fade in
      tl.fromTo(bgRef.current,
        { opacity: 0, scale: 1.06 },
        { opacity: 1, scale: 1, duration: 1.2 }
      );

      // Headline lines stagger
      const headlineLines = headlineRef.current?.querySelectorAll('.headline-line');
      if (headlineLines) {
        tl.fromTo(headlineLines,
          { x: '-10vw', opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
          '-=0.6'
        );
      }

      // Subheadline
      tl.fromTo(subheadRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      );

      // CTAs
      tl.fromTo(ctaRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.3'
      );

      // Scroll label
      tl.fromTo(scrollLabelRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        '-=0.2'
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Scroll-driven exit animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            // Reset all elements when scrolling back to top
            gsap.set([headlineRef.current, subheadRef.current, ctaRef.current], {
              opacity: 1, x: 0, y: 0
            });
            gsap.set(bgRef.current, { scale: 1, y: 0 });
          }
        }
      });

      // EXIT phase (70% - 100%)
      scrollTl.fromTo(headlineRef.current,
        { x: 0, opacity: 1 },
        { x: '-55vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo([subheadRef.current, ctaRef.current],
        { y: 0, opacity: 1 },
        { y: '10vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(bgRef.current,
        { scale: 1, y: 0 },
        { scale: 1.08, y: '-6vh', ease: 'none' },
        0.7
      );

      scrollTl.fromTo(scrollLabelRef.current,
        { opacity: 1 },
        { opacity: 0 },
        0.7
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="section-pinned z-10"
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-[1]"
        style={{
          backgroundImage: 'url(/hero_home_dusk.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-[#0B0C0F]/35 to-[#0B0C0F]/65" />

      {/* Content */}
      <div className="relative z-[6] h-full flex flex-col justify-center px-[6vw]">
        {/* Headline */}
        <div ref={headlineRef} className="mb-8">
          <h1 className="font-display font-bold text-[#F6F7F9] uppercase leading-[0.92] tracking-tight">
            <span className="headline-line block text-[clamp(2.5rem,8vw,7rem)]">Powering</span>
            <span className="headline-line block text-[clamp(2.5rem,8vw,7rem)]">Homes</span>
            <span className="headline-line block text-[clamp(1.5rem,4vw,3.5rem)] text-[#A9AFB8] mt-2">Protecting Futures</span>
          </h1>
        </div>

        {/* Subheadline */}
        <p
          ref={subheadRef}
          className="text-[#A9AFB8] text-base md:text-lg max-w-md mb-8 leading-relaxed"
        >
          Licensed electrical services for modern living—safe, clean, and built to last.
          Over 30 years of excellence, 5000+ homes powered.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-wrap gap-4">
          <button 
            onClick={() => scrollToSection('contact')}
            className="btn-primary flex items-center gap-2 group"
          >
            Request a Quote
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button 
            onClick={() => scrollToSection('projects')}
            className="btn-secondary"
          >
            See Our Work
          </button>
        </div>
      </div>

      {/* Scroll Label */}
      <div
        ref={scrollLabelRef}
        className="absolute bottom-[4vh] right-[4vw] z-10"
      >
        <span className="font-mono text-xs text-[#A9AFB8] tracking-widest flex items-center gap-2">
          SCROLL
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </span>
      </div>
    </section>
  );
}

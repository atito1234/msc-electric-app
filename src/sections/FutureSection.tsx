import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function FutureSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const verticalLabelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        }
      });

      // ENTRANCE (0% - 30%)
      scrollTl.fromTo(bgRef.current,
        { x: '8vw', scale: 1.10, opacity: 0.6 },
        { x: 0, scale: 1, opacity: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(overlayRef.current,
        { x: '-10vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );

      const headlineLines = headlineRef.current?.querySelectorAll('.headline-line');
      if (headlineLines) {
        scrollTl.fromTo(headlineLines,
          { x: '-60vw', opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.02, ease: 'none' },
          0
        );
      }

      scrollTl.fromTo(bodyRef.current,
        { y: '10vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.1
      );

      scrollTl.fromTo(verticalLabelRef.current,
        { x: '6vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0.1
      );

      // EXIT (70% - 100%)
      scrollTl.fromTo(headlineRef.current,
        { x: 0, opacity: 1 },
        { x: '-40vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(bodyRef.current,
        { y: 0, opacity: 1 },
        { y: '8vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(verticalLabelRef.current,
        { x: 0, opacity: 1 },
        { x: '6vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(bgRef.current,
        { scale: 1, x: 0 },
        { scale: 1.06, x: '-4vw', ease: 'none' },
        0.7
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="future"
      ref={sectionRef}
      className="section-pinned z-[80]"
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-[1]"
        style={{
          backgroundImage: 'url(/ev_charger_home.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Left Gradient Overlay */}
      <div
        ref={overlayRef}
        className="absolute left-0 top-0 w-[55vw] h-full z-[2] bg-left-gradient"
      />

      {/* Vertical Label (Right) */}
      <div
        ref={verticalLabelRef}
        className="absolute right-[3.5vw] top-1/2 -translate-y-1/2 z-[6]"
      >
        <span className="font-mono text-xs text-[#A9AFB8] tracking-[0.2em] vertical-label">
          INNOVATION
        </span>
      </div>

      {/* Content */}
      <div className="relative z-[6] h-full flex flex-col justify-center px-[6vw]">
        {/* Headline */}
        <div ref={headlineRef} className="mb-8">
          <h2 className="font-display font-bold text-[#F6F7F9] uppercase leading-[0.92] tracking-tight">
            <span className="headline-line block text-[clamp(2.5rem,7vw,6rem)]">Future</span>
            <span className="headline-line block text-[clamp(2.5rem,7vw,6rem)]">Ready</span>
          </h2>
        </div>

        {/* Body */}
        <div ref={bodyRef} className="max-w-sm">
          <p className="text-[#A9AFB8] text-base leading-relaxed mb-6">
            EV charging, solar-ready panels, and load planning for what's next.
          </p>
          <button className="flex items-center gap-2 font-mono text-sm text-[#F2C94C] hover:text-[#F5D76E] transition-colors group">
            Plan your upgrade
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Bottom Micro Label */}
      <div className="absolute bottom-[4vh] left-[4vw] z-10">
        <span className="font-mono text-xs text-[#A9AFB8] tracking-widest">
          MSC ELECTRIC • FUTURE
        </span>
      </div>
    </section>
  );
}

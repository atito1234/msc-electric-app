import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function AlwaysOnSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const microTopRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);

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
        { scale: 1.12, opacity: 0.7 },
        { scale: 1, opacity: 1, ease: 'none' },
        0
      );

      const headlineLines = headlineRef.current?.querySelectorAll('.headline-line');
      if (headlineLines) {
        scrollTl.fromTo(headlineLines[0],
          { y: '-40vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0
        );
        scrollTl.fromTo(headlineLines[1],
          { y: '40vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.05
        );
      }

      scrollTl.fromTo(microTopRef.current,
        { y: '-6vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.1
      );

      scrollTl.fromTo(bodyRef.current,
        { y: '10vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.1
      );

      // EXIT (70% - 100%)
      scrollTl.fromTo(headlineRef.current,
        { y: 0, opacity: 1 },
        { y: '-18vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(bodyRef.current,
        { y: 0, opacity: 1 },
        { y: '10vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(bgRef.current,
        { scale: 1, y: 0 },
        { scale: 1.08, y: '-4vh', ease: 'none' },
        0.7
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pinned z-30"
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-[1]"
        style={{
          backgroundImage: 'url(/ceiling_fixtures.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 z-[2] bg-[#0B0C0F]/50" />

      {/* Top Micro Label */}
      <div
        ref={microTopRef}
        className="absolute top-[6vh] left-1/2 -translate-x-1/2 z-[6]"
      >
        <span className="font-mono text-xs text-[#A9AFB8] tracking-[0.2em]">
          RELIABILITY
        </span>
      </div>

      {/* Centered Content */}
      <div className="relative z-[6] h-full flex flex-col items-center justify-center text-center px-[6vw]">
        {/* Headline */}
        <div ref={headlineRef} className="mb-8">
          <h2 className="font-display font-bold text-[#F6F7F9] uppercase leading-[0.92] tracking-tight">
            <span className="headline-line block text-[clamp(3rem,10vw,8rem)]">Always</span>
            <span className="headline-line block text-[clamp(3rem,10vw,8rem)]">On</span>
          </h2>
        </div>

        {/* Body */}
        <p
          ref={bodyRef}
          className="text-[#A9AFB8] text-base md:text-lg max-w-xl leading-relaxed"
        >
          From routine repairs to full rewires, we show up on time and get it right the first time.
        </p>
      </div>

      {/* Bottom Micro Label */}
      <div className="absolute bottom-[4vh] left-[4vw] z-10">
        <span className="font-mono text-xs text-[#A9AFB8] tracking-widest">
          MSC ELECTRIC • SERVICE
        </span>
      </div>
    </section>
  );
}

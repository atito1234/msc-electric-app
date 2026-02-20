import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function AlwaysOnSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  // Phase 1 refs (Always On)
  const headlineRef = useRef<HTMLDivElement>(null);
  const microTopRef = useRef<HTMLDivElement>(null);

  // Phase 2 refs (Values/Mission)
  const valuesContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: 0.6,
        }
      });

      // --- PHASE 1: ENTRANCE (0% - 15%) ---
      scrollTl.fromTo(bgRef.current,
        { scale: 1.12, opacity: 0.7 },
        { scale: 1, opacity: 1, ease: 'none' },
        0
      );

      const headlineLines = headlineRef.current?.querySelectorAll('.headline-line');
      if (headlineLines && headlineLines.length >= 2) {
        scrollTl.fromTo(headlineLines[0], { y: '-40vh', opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0);
        scrollTl.fromTo(headlineLines[1], { y: '40vh', opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0.05);
      }

      scrollTl.fromTo(microTopRef.current, { y: '-6vh', opacity: 0 }, { y: 0, opacity: 1, ease: 'none' }, 0.08);

      // --- PHASE 1: EXIT (30% - 40%) ---
      scrollTl.to(headlineRef.current, { y: '-20vh', opacity: 0, ease: 'power2.in' }, 0.3);
      scrollTl.to(microTopRef.current, { opacity: 0, ease: 'power2.in' }, 0.3);

      // --- PHASE 2: ENTRANCE (40% - 50%) ---
      const valueCards = valuesContainerRef.current?.querySelectorAll('.value-card');
      const missionHeader = valuesContainerRef.current?.querySelector('.mission-header');

      if (missionHeader) {
        scrollTl.fromTo(missionHeader, { y: 50, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out' }, 0.4);
      }

      if (valueCards) {
        scrollTl.fromTo(valueCards,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.05, ease: 'power2.out' },
          0.45
        );
      }

      // --- PHASE 2: EXIT & ZOOM OUT (85% - 100%) ---
      if (missionHeader) {
        scrollTl.to(missionHeader, { y: -50, opacity: 0, ease: 'power2.in' }, 0.85);
      }
      if (valueCards) {
        scrollTl.to(valueCards, { y: -50, opacity: 0, stagger: 0.05, ease: 'power2.in' }, 0.85);
      }

      scrollTl.to(bgRef.current, { scale: 1.08, y: '-4vh', ease: 'none' }, 0.85);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pinned z-30 bg-[#0B0C0F]"
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
      <div className="absolute inset-0 z-[2] bg-[#0B0C0F]/70 backdrop-blur-[2px]" />

      {/* PHASE 1: "Always On" */}
      <div className="absolute inset-0 z-[10] flex flex-col items-center justify-center text-center px-[6vw] pointer-events-none">
        <div ref={microTopRef} className="absolute top-[16vh] left-1/2 -translate-x-1/2">
          <span className="font-mono text-xs md:text-sm text-[#F2C94C] uppercase tracking-[0.3em] font-bold">
            Our Commitment
          </span>
        </div>

        <div ref={headlineRef} className="mb-4 mt-8 flex flex-col items-center">
          <h2 className="font-display font-black uppercase leading-[0.85] tracking-tighter text-[clamp(6rem,18vw,16rem)] text-center w-full">
            <span className="headline-line block electrified pb-2">Always</span>
            <span className="headline-line block electrified">On</span>
          </h2>
        </div>
      </div>

      {/* PHASE 2: Mission & Values */}
      <div
        ref={valuesContainerRef}
        className="absolute inset-0 z-[7] flex flex-col items-center justify-center px-6 md:px-12 max-w-7xl mx-auto pointer-events-none"
      >
        {/* Mission */}
        <div className="mission-header text-center mb-16 md:mb-20 w-full bg-black/30 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-white/5 max-w-5xl">
          <h3 className="font-mono text-[#F2C94C] text-sm md:text-base uppercase tracking-[0.2em] font-bold mb-6">Mission Statement</h3>
          <p className="font-display text-3xl md:text-5xl text-white leading-tight md:leading-snug">
            To deliver <span className="text-[#F2C94C]">uncompromising electrical infrastructure</span> that empowers progress, safeguards communities, and sets the gold standard for precision.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 w-full">
          {/* Value 1 */}
          <div className="value-card bg-black/40 backdrop-blur-md border border-white/10 p-8 rounded-3xl" style={{ opacity: 0 }}>
            <div className="text-4xl font-display font-black text-white/10 mb-4 tracking-tighter">01</div>
            <h4 className="text-xl font-display font-bold text-white mb-3">Relentless Reliability</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              We treat every wire like a lifeline. When we build it, it stays built. Zero compromise on safety and longevity.
            </p>
          </div>

          {/* Value 2 */}
          <div className="value-card bg-black/40 backdrop-blur-md border border-white/10 p-8 rounded-3xl" style={{ opacity: 0 }}>
            <div className="text-4xl font-display font-black text-white/10 mb-4 tracking-tighter">02</div>
            <h4 className="text-xl font-display font-bold text-white mb-3">Precision Execution</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              From commercial blueprints to residential panels, we execute with millimeter accuracy. Measure twice, wire once.
            </p>
          </div>

          {/* Value 3 */}
          <div className="value-card bg-black/40 backdrop-blur-md border border-white/10 p-8 rounded-3xl" style={{ opacity: 0 }}>
            <div className="text-4xl font-display font-black text-white/10 mb-4 tracking-tighter">03</div>
            <h4 className="text-xl font-display font-bold text-white mb-3">Future-Proof Innovation</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              We don't just solve for today. We anticipate tomorrow's load limits, EV requirements, and smart home revolutions.
            </p>
          </div>
        </div>
      </div>

    </section>
  );
}

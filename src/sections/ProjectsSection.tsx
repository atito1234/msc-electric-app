import { useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ImageIcon } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-[90] bg-[#0B0C0F] py-24 md:py-32 border-t border-white/5 overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-[#F2C94C]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div
          ref={contentRef}
          className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 md:p-16 text-center backdrop-blur-sm"
        >
          <div className="w-16 h-16 bg-[#F2C94C]/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <ImageIcon className="w-8 h-8 text-[#F2C94C]" />
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-6">
            View Our Complete <span className="text-[#F2C94C]">Portfolio</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            We've transformed over 6,000 properties across Texas. Explore our extensive gallery showcasing everything from underground commercial infrastructure to luxury residential smart homes.
          </p>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'instant' });
              navigate('/projects');
            }}
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#F2C94C] text-black font-bold uppercase tracking-widest rounded-full overflow-hidden transition-transform hover:scale-105 shadow-[0_0_40px_rgba(242,201,76,0.3)] hover:shadow-[0_0_60px_rgba(242,201,76,0.5)]"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative flex items-center gap-3">
              Explore The Gallery <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

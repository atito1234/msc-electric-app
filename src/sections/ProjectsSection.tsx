import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    image: '/project_panel.jpg',
    title: 'Modern Panel Upgrade',
    category: 'Residential',
  },
  {
    image: '/project_ev.jpg',
    title: 'EV Charger Install',
    category: 'Future-Ready',
  },
  {
    image: '/project_lighting.jpg',
    title: 'Recessed Lighting',
    category: 'Lighting',
  },
  {
    image: '/project_smart.jpg',
    title: 'Smart Home Switching',
    category: 'Automation',
  },
  {
    image: '/project_commercial.jpg',
    title: 'Commercial Fit-Out',
    category: 'Commercial',
  },
  {
    image: '/project_safety.jpg',
    title: 'Safety Retrofit',
    category: 'Protection',
  },
];

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(headingRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      // Underline animation
      gsap.fromTo(underlineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: underlineRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      // Gallery items animation
      const items = gridRef.current?.querySelectorAll('.project-item');
      if (items) {
        gsap.fromTo(items,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }

      // Parallax for images
      const images = gridRef.current?.querySelectorAll('.project-image');
      if (images) {
        images.forEach((img) => {
          gsap.fromTo(img,
            { y: -10 },
            {
              y: 10,
              ease: 'none',
              scrollTrigger: {
                trigger: img,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              }
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-[90] bg-[#F4F6F8] py-24 md:py-32"
    >
      <div className="px-[6vw]">
        {/* Heading */}
        <div ref={headingRef} className="mb-12 md:mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#0B0C0F] mb-4">
            Projects
          </h2>
          <div ref={underlineRef} className="w-24 h-[2px] bg-[#F2C94C] origin-left mb-6" />
          <p className="text-[#4A4D55] text-lg max-w-xl">
            Real homes. Real precision. Real results.
          </p>
        </div>

        {/* Projects Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="project-item group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-xl aspect-[16/10] mb-4">
                <div
                  className="project-image absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${project.image})` }}
                />
                <div className="absolute inset-0 bg-[#0B0C0F]/20 group-hover:bg-[#0B0C0F]/10 transition-colors duration-300" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-lg text-[#0B0C0F] group-hover:text-[#1A1D24] transition-colors">
                  {project.title}
                </h3>
                <span className="font-mono text-xs text-[#6A6D75] bg-[#E8EAEC] px-3 py-1 rounded-full">
                  {project.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

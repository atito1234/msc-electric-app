import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  PanelTop, 
  Lightbulb, 
  Smartphone, 
  BatteryCharging, 
  ShieldCheck, 
  Wrench 
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: PanelTop,
    title: 'Panel Upgrades',
    description: 'Safe capacity for modern loads. Complete panel replacements and service upgrades.',
  },
  {
    icon: Lightbulb,
    title: 'Lighting Design',
    description: 'Recessed, pendant, and accent installs. Transform your space with perfect lighting.',
  },
  {
    icon: Smartphone,
    title: 'Smart Switches',
    description: 'Schedules, scenes, and remote control. Modern automation for your home.',
  },
  {
    icon: BatteryCharging,
    title: 'EV Charging',
    description: 'Home charger installation and load planning. Ready for the electric future.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety Inspections',
    description: 'Code compliance and peace of mind. Comprehensive electrical safety audits.',
  },
  {
    icon: Wrench,
    title: 'Repairs & Troubleshooting',
    description: 'Fast diagnosis, lasting fixes. Expert troubleshooting for any electrical issue.',
  },
];

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
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

      // Cards animation
      const cards = cardsRef.current?.querySelectorAll('.service-card');
      if (cards) {
        gsap.fromTo(cards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative z-[90] bg-[#0B0C0F] py-24 md:py-32"
    >
      <div className="px-[6vw]">
        {/* Heading */}
        <div ref={headingRef} className="mb-12 md:mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#F6F7F9] mb-4">
            Services
          </h2>
          <div ref={underlineRef} className="w-24 h-[2px] bg-[#F2C94C] origin-left mb-6" />
          <p className="text-[#A9AFB8] text-lg max-w-xl">
            Residential and commercial electrical work—done clean, done right.
          </p>
        </div>

        {/* Services Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="service-card glass-card rounded-xl p-6 md:p-8 hover:border-[#F2C94C]/30 transition-all duration-300 group"
            >
              <service.icon className="w-8 h-8 text-[#F2C94C] mb-4 transition-transform group-hover:scale-110" />
              <h3 className="font-display font-semibold text-xl text-[#F6F7F9] mb-3">
                {service.title}
              </h3>
              <p className="text-[#A9AFB8] text-sm leading-relaxed mb-4">
                {service.description}
              </p>
              <button className="font-mono text-sm text-[#F2C94C] hover:text-[#F5D76E] transition-colors">
                Learn more →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

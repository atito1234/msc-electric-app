import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "MSC Electric made the panel upgrade feel easy—clean work, clear communication. They explained everything and finished ahead of schedule.",
    name: "Jordan T.",
    role: "Homeowner",
    rating: 5,
  },
  {
    quote: "They showed up on time, kept the site tidy, and delivered exactly what they promised. Our go-to electricians for all our properties.",
    name: "Alex R.",
    role: "Property Manager",
    rating: 5,
  },
  {
    quote: "Our lighting finally matches the way we live. The smart switches and recessed lighting transformed our home. Highly recommend.",
    name: "Sam K.",
    role: "Homeowner",
    rating: 5,
  },
];

export function TestimonialsSection() {
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
      const cards = cardsRef.current?.querySelectorAll('.testimonial-card');
      if (cards) {
        gsap.fromTo(cards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
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
      id="testimonials"
      className="relative z-[90] bg-[#0B0C0F] py-24 md:py-32"
    >
      <div className="px-[6vw]">
        {/* Heading */}
        <div ref={headingRef} className="mb-12 md:mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#F6F7F9] mb-4">
            What clients say
          </h2>
          <div ref={underlineRef} className="w-24 h-[2px] bg-[#F2C94C] origin-left mb-6" />
          <p className="text-[#A9AFB8] text-lg max-w-xl">
            We're proud of the relationships we build—one project at a time.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card glass-card rounded-xl p-6 md:p-8 relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-[#F2C94C]/20" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#F2C94C] text-[#F2C94C]" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#F6F7F9] text-base leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F2C94C]/20 flex items-center justify-center">
                  <span className="font-display font-semibold text-[#F2C94C]">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-display font-medium text-[#F6F7F9] text-sm">
                    {testimonial.name}
                  </p>
                  <p className="font-mono text-xs text-[#A9AFB8]">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

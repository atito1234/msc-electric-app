import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    message: '',
  });

  useEffect(() => {
    const handlePrefill = (e: CustomEvent) => {
      const { projectType, message } = e.detail;
      setFormData(prev => ({ ...prev, projectType, message }));
      // Scroll to contact section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('contact:prefill', handlePrefill as EventListener);
    return () => window.removeEventListener('contact:prefill', handlePrefill as EventListener);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Left column animation
      gsap.fromTo(leftRef.current,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: leftRef.current,
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

      // Right column animation
      gsap.fromTo(rightRef.current,
        { x: 30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: rightRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll respond within one business day.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      projectType: '',
      message: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative z-[90] bg-[#0B0C0F] py-24 md:py-32"
    >
      <div className="px-[6vw]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Info */}
          <div ref={leftRef}>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-[#F6F7F9] mb-4">
              Ready to power your next project?
            </h2>
            <div ref={underlineRef} className="w-24 h-[2px] bg-[#F2C94C] origin-left mb-6" />
            <p className="text-[#A9AFB8] text-lg mb-8">
              Tell us what you need. We'll respond within one business day.
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#F2C94C]/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#F2C94C]" />
                </div>
                <div>
                  <p className="font-mono text-xs text-[#A9AFB8]">Email</p>
                  <p className="text-[#F6F7F9]">tino@electricalmsc.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#F2C94C]/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#F2C94C]" />
                </div>
                <div>
                  <p className="font-mono text-xs text-[#A9AFB8]">Phone</p>
                  <p className="text-[#F6F7F9]">(281) 905-6830</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#F2C94C]/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#F2C94C]" />
                </div>
                <div>
                  <p className="font-mono text-xs text-[#A9AFB8]">Service Area</p>
                  <p className="text-[#F6F7F9]">State of Texas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div ref={rightRef}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[#F6F7F9] placeholder:text-[#6A6D75] focus:outline-none focus:border-[#F2C94C] transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[#F6F7F9] placeholder:text-[#6A6D75] focus:outline-none focus:border-[#F2C94C] transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[#F6F7F9] placeholder:text-[#6A6D75] focus:outline-none focus:border-[#F2C94C] transition-colors"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Project Type</label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[#F6F7F9] focus:outline-none focus:border-[#F2C94C] transition-colors"
                  >
                    <option value="" className="bg-[#0B0C0F]">Select type</option>
                    <option value="panel" className="bg-[#0B0C0F]">Panel Upgrade</option>
                    <option value="lighting" className="bg-[#0B0C0F]">Lighting Design</option>
                    <option value="smart" className="bg-[#0B0C0F]">Smart Home</option>
                    <option value="ev" className="bg-[#0B0C0F]">EV Charging</option>
                    <option value="repair" className="bg-[#0B0C0F]">Repair</option>
                    <option value="other" className="bg-[#0B0C0F]">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-[#A9AFB8] mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[#F6F7F9] placeholder:text-[#6A6D75] focus:outline-none focus:border-[#F2C94C] transition-colors resize-none"
                  placeholder="Tell us about your project..."
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary flex items-center justify-center gap-2 py-4"
              >
                Send Message
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { FloatingNav } from '@/components/ui/FloatingNav';
import { SplitHero } from '@/components/ui/SplitHero';
import { PanelSection } from '@/sections/PanelSection';
import { AlwaysOnSection } from '@/sections/AlwaysOnSection';
import { WiredSection } from '@/sections/WiredSection';
import { SafetySection } from '@/sections/SafetySection';
import { SmartSection } from '@/sections/SmartSection';
import { LightingSection } from '@/sections/LightingSection';
import { FutureSection } from '@/sections/FutureSection';
import { ServicesSection } from '@/sections/ServicesSection';
import { ProjectsSection } from '@/sections/ProjectsSection';
import { TestimonialsSection } from '@/sections/TestimonialsSection';
import { ContactSection } from '@/sections/ContactSection';
import { Footer } from '@/sections/Footer';
import { TrackRecordSection } from '@/sections/TrackRecordSection';
import { ServiceSideNav } from '@/sections/ServiceSideNav';

gsap.registerPlugin(ScrollTrigger);

export function MarketingSite() {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Global snap for pinned sections
    const setupGlobalSnap = () => {
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);

      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const inPinned = pinnedRanges.some(r => value >= r.start - 0.02 && value <= r.end + 0.02);
            if (!inPinned) return value;

            const target = pinnedRanges.reduce((closest, r) =>
              Math.abs(r.center - value) < Math.abs(closest - value) ? r.center : closest,
              pinnedRanges[0]?.center ?? 0
            );
            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: "power2.out"
        }
      });
    };

    // Delay to allow all section ScrollTriggers to initialize
    const timer = setTimeout(setupGlobalSnap, 500);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div ref={mainRef} className="relative bg-[#0B0C0F]">
      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Navigation */}
      <FloatingNav />
      <ServiceSideNav />

      {/* Pinned Sections */}
      <SplitHero />
      <div id="track-record">
        <TrackRecordSection />
      </div>

      <PanelSection />
      <AlwaysOnSection />
      <WiredSection />
      <SafetySection />
      <SmartSection />
      <LightingSection />
      <FutureSection />

      {/* Flowing Sections */}
      <ServicesSection />
      <ProjectsSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

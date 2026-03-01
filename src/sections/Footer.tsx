import { Zap, Instagram, Facebook, Linkedin, Twitter, LogIn } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative z-[90] bg-[#0B0C0F] border-t border-white/10 py-12 md:py-16">
      <div className="px-[6vw]">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-[#F2C94C]" />
              <span className="font-display font-bold text-lg tracking-tight text-[#F6F7F9]">
                MSC ELECTRIC
              </span>
            </div>
            <p className="text-[#A9AFB8] text-sm leading-relaxed max-w-sm mb-6">
              Licensed electrical services for modern living—safe, clean, and built to last.
              Over 30 years of excellence, 5000+ homes powered.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#F2C94C]/20 transition-colors group">
                <Facebook className="w-5 h-5 text-[#A9AFB8] group-hover:text-[#F2C94C] transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#F2C94C]/20 transition-colors group">
                <Instagram className="w-5 h-5 text-[#A9AFB8] group-hover:text-[#F2C94C] transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#F2C94C]/20 transition-colors group">
                <Linkedin className="w-5 h-5 text-[#A9AFB8] group-hover:text-[#F2C94C] transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#F2C94C]/20 transition-colors group">
                <Twitter className="w-5 h-5 text-[#A9AFB8] group-hover:text-[#F2C94C] transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-[#F6F7F9] mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection('services')}
                  className="text-[#A9AFB8] text-sm hover:text-[#F2C94C] transition-colors"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('projects')}
                  className="text-[#A9AFB8] text-sm hover:text-[#F2C94C] transition-colors"
                >
                  Projects
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('testimonials')}
                  className="text-[#A9AFB8] text-sm hover:text-[#F2C94C] transition-colors"
                >
                  Testimonials
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-[#A9AFB8] text-sm hover:text-[#F2C94C] transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-[#F6F7F9] mb-4">Services</h4>
            <ul className="space-y-3">
              <li>
                <span className="text-[#A9AFB8] text-sm">Panel Upgrades</span>
              </li>
              <li>
                <span className="text-[#A9AFB8] text-sm">Lighting Design</span>
              </li>
              <li>
                <span className="text-[#A9AFB8] text-sm">Smart Home</span>
              </li>
              <li>
                <span className="text-[#A9AFB8] text-sm">EV Charging</span>
              </li>
            </ul>
          </div>

          {/* Portal Access */}
          <div>
            <h4 className="font-display font-semibold text-[#F6F7F9] mb-4">Portal Access</h4>
            <ul className="space-y-3">
              <li>
                <a href="#/login" className="text-[#F2C94C] text-sm hover:text-[#F5D76E] transition-colors flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Client Login
                </a>
              </li>
              <li>
                <a href="#/login" className="text-[#A9AFB8] text-sm hover:text-[#F2C94C] transition-colors flex items-center gap-2">
                  <Zap className="w-4 h-4" /> GC Partner Login
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#6A6D75] text-sm">
            © {currentYear} MSC Electric LLC. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[#6A6D75] text-sm hover:text-[#A9AFB8] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-[#6A6D75] text-sm hover:text-[#A9AFB8] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

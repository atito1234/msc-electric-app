import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, Building2, Home } from 'lucide-react';

export function SplitHero() {
    const navigate = useNavigate();
    const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);

    const handleScrollToProjects = (e: React.MouseEvent) => {
        e.stopPropagation();
        const element = document.getElementById('projects');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleScrollToResidential = (e: React.MouseEvent) => {
        e.stopPropagation();
        const element = document.getElementById('panel');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden flex flex-col md:flex-row bg-[#0B0C0F]">

            {/* Left Side - Residential (Homeowners) */}
            <div
                className={`relative h-1/2 md:h-full transition-all duration-700 ease-out cursor-pointer group
          ${hoveredSide === 'left' ? 'md:w-[60%]' : hoveredSide === 'right' ? 'md:w-[40%]' : 'md:w-1/2'}
          w-full
        `}
                onMouseEnter={() => setHoveredSide('left')}
                onMouseLeave={() => setHoveredSide(null)}
                onClick={handleScrollToResidential}
            >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500 z-10" />
                <div
                    className="absolute inset-0 bg-cover bg-center scale-100 group-hover:scale-105 transition-transform duration-1000"
                    style={{ backgroundImage: 'url(/hero_home_dusk.jpg)' }}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 border border-white/20">
                        <Home className="w-8 h-8 text-[#F2C94C]" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
                        Residential Services
                    </h2>
                    <p className="text-gray-300 max-w-md text-sm md:text-base font-light tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">
                        Expert upgrades, repairs, and smart home solutions for homeowners.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-[#F2C94C] text-sm font-semibold uppercase tracking-widest opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                        For Homeowners <ArrowDown className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Right Side - Commercial/Builder (B2B) */}
            <div
                className={`relative h-1/2 md:h-full transition-all duration-700 ease-out cursor-pointer group
          ${hoveredSide === 'right' ? 'md:w-[60%]' : hoveredSide === 'left' ? 'md:w-[40%]' : 'md:w-1/2'}
          w-full border-t md:border-t-0 md:border-l border-white/10
        `}
                onMouseEnter={() => setHoveredSide('right')}
                onMouseLeave={() => setHoveredSide(null)}
                onClick={handleScrollToProjects}
            >
                <div className="absolute inset-0 bg-blue-900/40 group-hover:bg-blue-900/20 transition-all duration-500 z-10" />
                <div
                    className="absolute inset-0 bg-cover bg-center scale-100 group-hover:scale-105 transition-transform duration-1000"
                    style={{ backgroundImage: 'url(/project_commercial.jpg)' }}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 backdrop-blur-md flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 border border-blue-400/30">
                        <Building2 className="w-8 h-8 text-blue-400" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
                        Multi-Family & Commercial
                    </h2>
                    <p className="text-blue-100 max-w-md text-sm md:text-base font-light tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">
                        Powering 6,000+ units across Texas. The trusted partner for builders.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-blue-400 text-sm font-semibold uppercase tracking-widest opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                        See Our Work <ArrowDown className="w-4 h-4" />
                    </div>
                </div>
            </div>

        </div>
    );
}


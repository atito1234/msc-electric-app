import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, Camera, Wrench } from 'lucide-react';

export function SplitHero() {
    const navigate = useNavigate();
    const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);

    const handleScrollDown = () => {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    };

    return (
        <div className="relative w-full h-screen overflow-hidden flex flex-col md:flex-row bg-[#0B0C0F]">

            {/* Left Side - Services */}
            <div
                className={`relative h-1/2 md:h-full transition-all duration-700 ease-out cursor-pointer group
          ${hoveredSide === 'left' ? 'md:w-[60%]' : hoveredSide === 'right' ? 'md:w-[40%]' : 'md:w-1/2'}
          w-full
        `}
                onMouseEnter={() => setHoveredSide('left')}
                onMouseLeave={() => setHoveredSide(null)}
                onClick={handleScrollDown}
            >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500 z-10" />
                <div
                    className="absolute inset-0 bg-cover bg-center scale-100 group-hover:scale-105 transition-transform duration-1000"
                    style={{ backgroundImage: 'url(/panel_closeup.jpg)' }}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 border border-white/20">
                        <Wrench className="w-8 h-8 text-[#F2C94C]" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
                        Installations
                    </h2>
                    <p className="text-gray-300 max-w-md text-sm md:text-base font-light tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">
                        Technical excellence in wiring, panels, and safety systems.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-[#F2C94C] text-sm font-semibold uppercase tracking-widest opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                        View Services <ArrowDown className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Right Side - Gallery */}
            <div
                className={`relative h-1/2 md:h-full transition-all duration-700 ease-out cursor-pointer group
          ${hoveredSide === 'right' ? 'md:w-[60%]' : hoveredSide === 'left' ? 'md:w-[40%]' : 'md:w-1/2'}
          w-full border-t md:border-t-0 md:border-l border-white/10
        `}
                onMouseEnter={() => setHoveredSide('right')}
                onMouseLeave={() => setHoveredSide(null)}
                onClick={() => navigate('/projects')}
            >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500 z-10" />
                <div
                    className="absolute inset-0 bg-cover bg-center scale-100 group-hover:scale-105 transition-transform duration-1000"
                    style={{ backgroundImage: 'url(/hero_home_dusk.jpg)' }}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 border border-white/20">
                        <Camera className="w-8 h-8 text-blue-400" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
                        Project Gallery
                    </h2>
                    <p className="text-gray-300 max-w-md text-sm md:text-base font-light tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">
                        Explore over 6,000 homes transformed by our craftsmanship.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-blue-400 text-sm font-semibold uppercase tracking-widest opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                        View Portfolio <ArrowDown className="w-4 h-4 -rotate-90" />
                    </div>
                </div>
            </div>

            {/* Overlay Text - Optional center branding if needed, but keeping it clean for now */}

        </div>
    );
}

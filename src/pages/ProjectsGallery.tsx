import { useState } from 'react';
import { FloatingNav } from '@/components/ui/FloatingNav';


const PROJECTS = [
    { id: 1, title: 'Modern Ranch Upgrade', category: 'Residential', image: '/hero_home_dusk.jpg', location: 'Austin, TX' },
    { id: 2, title: 'Downtown Office Complex', category: 'Commercial', image: '/project_commercial.jpg', location: 'Austin, TX' },
    { id: 3, title: 'EV Charging Station', category: 'Modern', image: '/project_ev.jpg', location: 'Round Rock, TX' },
    { id: 4, title: 'Smart Home Integration', category: 'Residential', image: '/project_smart.jpg', location: 'West Lake, TX' },
    { id: 5, title: 'Safety Inspection Retrofit', category: 'Safety', image: '/project_safety.jpg', location: 'Georgetown, TX' },
    { id: 6, title: 'Custom Landscape Lighting', category: 'Lighting', image: '/project_lighting.jpg', location: 'Austin, TX' },
    { id: 7, title: 'Main Panel Upgrade', category: 'Technical', image: '/project_panel.jpg', location: 'Pflugerville, TX' },
    { id: 8, title: 'Kitchen Remodel Wiring', category: 'Residential', image: '/outlets_safety.jpg', location: 'Cedar Park, TX' },
];

const CATEGORIES = ['All', 'Residential', 'Commercial', 'Technical', 'Lighting', 'Safety'];

export function ProjectsGallery() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const filteredProjects = activeCategory === 'All'
        ? PROJECTS
        : PROJECTS.filter(p => p.category === activeCategory || (activeCategory === 'Technical' && p.category === 'Modern'));

    return (
        <div className="min-h-screen bg-[#0B0C0F] text-white overflow-hidden">
            <FloatingNav />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-[#0B0C0F]/80 backdrop-blur-md border-b border-white/5 py-6 px-6 md:px-12 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">MSC Electric <span className="text-[#F2C94C] text-sm font-mono ml-2">PORTFOLIO</span></h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-32 px-6 md:px-12 pb-20">

                {/* Intro */}
                <div className="max-w-4xl mb-12">
                    <h2 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
                        6,000+ Homes <br />
                        <span className="text-gray-500">Transformed.</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl font-light">
                        Explore our extensive gallery of electrical craftsmanship. From high-end residential upgrades to complex commercial infrastructure.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-12">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                        ${activeCategory === cat
                                    ? 'bg-[#F2C94C] text-black'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}
                    `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            className="group relative aspect-[4/5] bg-gray-900 rounded-xl overflow-hidden cursor-zoom-in border border-white/5 hover:border-[#F2C94C]/50 transition-all duration-500"
                            onClick={() => setSelectedImage(project.image)}
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                style={{ backgroundImage: `url(${project.image})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                            <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <span className="inline-block px-2 py-1 bg-[#F2C94C] text-black text-[10px] uppercase font-bold tracking-wider rounded mb-2">
                                    {project.category}
                                </span>
                                <h3 className="text-xl font-display font-bold mb-1">{project.title}</h3>
                                <p className="text-gray-400 text-xs flex items-center gap-1">
                                    <span className="w-1 h-1 bg-[#F2C94C] rounded-full" />
                                    {project.location}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </main>

            {/* Lightbox / Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/50 hover:text-white"
                        onClick={() => setSelectedImage(null)}
                    >
                        Start closing...
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full View"
                        className="max-h-[90vh] max-w-full rounded-lg shadow-2xl border border-white/10"
                    />
                </div>
            )}
        </div>
    );
}

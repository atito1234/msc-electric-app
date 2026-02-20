import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FloatingNav } from '@/components/ui/FloatingNav';
import { TrackRecordSection } from '@/sections/TrackRecordSection';
import { GALLERY_PROJECTS, GALLERY_CATEGORIES, type ProjectCategory } from '@/data/gallery-data';
import { ShieldCheck, Award, Clock, ArrowRight, Zap } from 'lucide-react';
import { AIConsultationModal } from '@/components/ui/AIConsultationModal';


export function ProjectsGallery() {
    const location = useLocation();
    const navigate = useNavigate();
    const defaultCategory = (location.state as { category?: ProjectCategory | 'All' })?.category || 'All';
    const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'All'>(defaultCategory);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
    const [consultationContext, setConsultationContext] = useState<{ type: string, title: string } | null>(null);

    const handleOpenConsultation = (project?: typeof GALLERY_PROJECTS[0]) => {
        if (project) {
            setConsultationContext({ type: 'chat', title: `Inquiry: ${project.title}` });
        } else {
            setConsultationContext({ type: 'selection', title: 'General Inquiry' });
        }
        setIsConsultationModalOpen(true);
    };

    const filteredProjects = useMemo(() => {
        if (activeCategory === 'All') return GALLERY_PROJECTS;
        return GALLERY_PROJECTS.filter(p => p.category === activeCategory);
    }, [activeCategory]);

    const activeProject = useMemo(() =>
        GALLERY_PROJECTS.find(p => p.id === selectedImageId),
        [selectedImageId]);

    return (
        <div className="min-h-screen bg-[#0B0C0F] text-white overflow-hidden">
            <FloatingNav />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-[#0B0C0F]/80 backdrop-blur-md border-b border-white/5 py-6 px-6 md:px-12 flex items-center justify-between">
                <Link to="/" className="hover:opacity-80 transition-opacity">
                    <h1 className="text-2xl font-display font-bold">MSC Electric <span className="text-[#F2C94C] text-sm font-mono ml-2">PORTFOLIO</span></h1>
                </Link>

                <button
                    onClick={() => {
                        navigate('/');
                        setTimeout(() => {
                            const el = document.getElementById('services');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                    }}
                    className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors group"
                >
                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Back to Services
                </button>
            </header>

            {/* Main Content */}
            <main className="pt-32 px-6 md:px-12 pb-20">

                {/* Intro */}
                <div className="max-w-5xl mb-12 relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-[#F2C94C] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(242,201,76,0.5)]">
                            <Zap className="w-6 h-6 text-black fill-current" />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-white tracking-tight">MSC Electric</h2>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight tracking-tight">
                        6,000+ Homes <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-700">Transformed.</span>
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-light leading-relaxed mb-10">
                        Explore our extensive gallery of electrical craftsmanship. From high-end residential upgrades to complex commercial infrastructure.
                    </p>

                    {/* Trust Builders & CTA */}
                    <div className="flex flex-col gap-6 mb-4">
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <button
                                onClick={() => handleOpenConsultation()}
                                className="bg-[#F2C94C] text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-yellow-400 transition-all hover:scale-105 shadow-[0_0_30px_rgba(242,201,76,0.3)] flex items-center justify-center flex-1 sm:flex-none group"
                            >
                                Start Your Project
                            </button>

                            <button
                                onClick={() => {
                                    navigate('/');
                                    // Small delay to allow home page to render before scrolling
                                    setTimeout(() => {
                                        const el = document.getElementById('services');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }, 100);
                                }}
                                className="bg-transparent border border-white/20 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/5 hover:border-white/40 transition-all flex items-center justify-center gap-3 flex-1 sm:flex-none group"
                            >
                                Explore Services
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#F2C94C]" />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm text-gray-300 font-medium">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#F2C94C]" />
                                Licensed, Bonded & Insured
                            </div>
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-[#F2C94C]" />
                                100% Satisfaction Guarantee
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#F2C94C]" />
                                24/7 Priority Support
                            </div>
                        </div>
                    </div>
                </div>

                <TrackRecordSection hidePortfolioCTA={true} showCollages={true} />

                {/* Filters */}
                <div id="gallery-grid" className="flex flex-wrap gap-2 mb-12 scroll-mt-32">
                    <button
                        onClick={() => setActiveCategory('All')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === 'All' ? 'bg-[#F2C94C] text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                    >
                        All Projects
                    </button>

                    {GALLERY_CATEGORIES.map(cat => (
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
                            onClick={() => setSelectedImageId(project.id)}
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

            {/* Lightbox / Modal with Story Component */}
            {activeProject && (
                <div
                    className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex flex-col md:flex-row items-center justify-center p-4 md:p-12 gap-8"
                    onClick={() => setSelectedImageId(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/50 hover:text-white z-50 p-4"
                        onClick={() => setSelectedImageId(null)}
                    >
                        <span className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">Close <span className="text-3xl leading-none">&times;</span></span>
                    </button>

                    {/* Img Container */}
                    <div className="relative flex-1 w-full max-h-[60vh] md:max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={activeProject.image}
                            alt={activeProject.title}
                            className="max-h-full max-w-full rounded-2xl shadow-2xl border border-white/10 object-contain"
                        />
                    </div>

                    {/* Story Container */}
                    <div className="w-full md:w-[400px] flex-shrink-0 bg-[#111318] p-8 rounded-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
                        <span className="inline-block px-3 py-1 bg-[#F2C94C]/10 border border-[#F2C94C]/20 text-[#F2C94C] text-xs uppercase font-bold tracking-wider rounded-full mb-4">
                            {activeProject.category}
                        </span>
                        <h3 className="text-3xl font-display font-bold text-white mb-2">{activeProject.title}</h3>
                        <p className="text-gray-400 text-sm flex items-center gap-2 mb-6 font-mono">
                            <span className="w-1.5 h-1.5 bg-[#F2C94C] rounded-full" />
                            {activeProject.location}
                        </p>

                        <div className="h-[1px] w-full bg-white/10 mb-6" />

                        <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-8">
                            {activeProject.description}
                        </p>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenConsultation(activeProject);
                            }}
                            className="w-full bg-[#1A1D24] border border-[#F2C94C]/30 hover:border-[#F2C94C] text-[#F2C94C] py-4 rounded-xl font-bold uppercase tracking-widest transition-all hover:bg-[#F2C94C]/10 flex justify-center items-center gap-3 group"
                        >
                            Request This Service
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                </div>
            )}

            {/* Global Modals for Gallery Layer */}
            <AIConsultationModal
                isOpen={isConsultationModalOpen}
                onClose={() => setIsConsultationModalOpen(false)}
                context={consultationContext}
            />
        </div>
    );
}

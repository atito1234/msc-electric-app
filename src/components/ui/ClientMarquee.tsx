import React from 'react';

const CLIENT_NAMES = [
    "Centennial Properties",
    "Apex Residential Group",
    "Toll Brothers",
    "Pinnacle Development",
    "Texas State Grid",
    "Austin Metro Housing",
    "Lumina Architecture",
    "Ironwood Construction"
];

export function ClientMarquee() {
    return (
        <div className="w-full relative overflow-hidden flex bg-[#0B0C0F] py-8 border-y border-white/5 my-12 group">
            {/* Fade edges */}
            <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-[#0B0C0F] to-transparent z-10" />
            <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-[#0B0C0F] to-transparent z-10" />

            {/* Marquee Container */}
            <div className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap">
                {/* Double the list to loop seamlessly */}
                {[...CLIENT_NAMES, ...CLIENT_NAMES].map((name, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-center mx-8 text-2xl md:text-3xl font-display font-bold text-white/20 hover:text-white/60 transition-colors duration-300"
                    >
                        {name}
                        {/* Dot separator */}
                        <span className="w-2 h-2 rounded-full bg-[#F2C94C]/40 mx-8 inline-block" />
                    </div>
                ))}
            </div>
        </div>
    );
}

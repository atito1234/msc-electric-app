export type ProjectCategory = 'Multi-Family & Commercial' | 'Custom Residential' | 'Underground & Infrastructure' | 'Rough-In & Panels' | 'EV & Green Tech' | 'Legacy';

export interface GalleryProject {
    id: string;
    title: string;
    category: ProjectCategory;
    image: string;
    location: string;
    description: string;
}

export const GALLERY_PROJECTS: GalleryProject[] = [
    // Mixed 1 (Day/Indoor/Lit)
    {
        id: 'new-ri-1', title: 'The Perfect Panel', category: 'Rough-In & Panels', image: '/gallery/51497a97-ca3e-46de-9e99-fca987850de1.jpg', location: 'Commercial Phase 2',
        description: 'Our signature of excellence. We pride ourselves on meticulously dressed, cleanly labeled, and perfectly routed breaker panels. This is what unmatched quality looks like inside the wall.'
    },
    {
        id: 'new-mf-1', title: 'Luxury Apt Framing', category: 'Multi-Family & Commercial', image: '/gallery/IMG_1294.PNG', location: 'Central TX',
        description: 'Scaling excellence: Early stage rough-ins on a massive 300+ unit luxury apartment complex. We handle the heavy lifting of large-scale commercial power distribution.'
    },
    // Mixed 2 (Dark/Dusk)
    {
        id: 'new-res-1', title: 'Modern Mansion Pool', category: 'Custom Residential', image: '/gallery/IMG_1304.PNG', location: 'Westlake/Lakeway',
        description: 'Where luxury meets luminescence: Complete smart-home integration, landscape accentuation, and aquatic lighting for an ultra-premium custom estate.'
    },
    // Mixed 3 (Day)
    {
        id: 'legacy-2', title: 'Downtown Office Complex', category: 'Legacy', image: '/project_commercial.jpg', location: 'Austin, TX',
        description: 'Comprehensive electrical fit-out for a multi-story high-rise, delivering robust infrastructure capable of supporting modern tech tenants.'
    },
    {
        id: 'new-ev-3', title: 'Fleet Expansion', category: 'EV & Green Tech', image: '/gallery/IMG_1287.PNG', location: 'Commercial Charging',
        description: 'Our teams rapidly deploying robust, networked EV charging stations to support the transition to commercial electric fleets.'
    },
    // Mixed 4 (Night/Dusk)
    {
        id: 'new-mf-4', title: 'Commercial Glow', category: 'Multi-Family & Commercial', image: '/gallery/IMG_1297.PNG', location: 'Texas Hub',
        description: 'Bringing blueprints to life: High-visibility exterior commercial lighting installations that enhance security and architectural beauty.'
    },
    {
        id: 'legacy-6', title: 'Custom Landscape Lighting', category: 'Custom Residential', image: '/project_lighting.jpg', location: 'Austin, TX',
        description: 'Architectural accent lighting designed to highlight custom masonry and elevate evening curb appeal.'
    },
    // Mixed 5 (Day/Indoor)
    {
        id: 'new-mf-6', title: 'Site Inspection', category: 'Multi-Family & Commercial', image: '/gallery/IMG_1289.PNG', location: 'Commercial Build',
        description: 'Master electricians conducting rigorous phase inspections on an expansive multi-family site. Trust is built on uncompromised verification.'
    },
    {
        id: 'new-mf-2', title: 'Commercial Lift Ops', category: 'Multi-Family & Commercial', image: '/gallery/IMG_1269.PNG', location: 'Texas Region',
        description: 'Safety and scale in motion. Utilizing heavy machinery for high-elevation commercial installations, demonstrating our capacity for any size build.'
    },
    // Mixed 6 (Night/Dark)
    {
        id: 'new-ug-1', title: 'Conduit Monument', category: 'Underground & Infrastructure', image: '/gallery/IMG_1273.PNG', location: 'Grid Expansion',
        description: 'The veins of the city: Massive underground commercial feeder installations. Our teams expertly manage the heavy infrastructure you never see.'
    },
    {
        id: 'legacy-1', title: 'Modern Ranch Upgrade', category: 'Legacy', image: '/hero_home_dusk.jpg', location: 'Austin, TX',
        description: 'A complete modernization of a sprawling luxury ranch, blending cutting-edge smart home technology with classic Texan architecture.'
    },
    // Mixed 7 (Indoor/Lit)
    {
        id: 'new-ri-2', title: 'Smart Node Routing', category: 'Rough-In & Panels', image: '/gallery/IMG_1298.PNG', location: 'Luxury Build',
        description: 'The nervous system of a smart home: Faultless, perfectly organized low-voltage and high-voltage routing for advanced home automation processors.'
    },
    {
        id: 'legacy-4', title: 'Smart Home Integration', category: 'Custom Residential', image: '/project_smart.jpg', location: 'West Lake, TX',
        description: 'Seamlessly hidden automated lighting and climate control systems in a high-end luxury build.'
    },
    // Mixed 8 (Night)
    {
        id: 'new-res-3', title: 'Neighborhood Glow', category: 'Custom Residential', image: '/gallery/IMG_1300.PNG', location: 'Suburban Dev',
        description: 'From blueprint to neighborhood beacon: Executing flawless exterior and interior lighting packages that define the character of new developments.'
    },
    {
        id: 'new-ug-3', title: 'Spool Deployment', category: 'Underground & Infrastructure', image: '/gallery/IMG_1299.PNG', location: 'Commercial Site',
        description: 'Scale in action: Managing massive logistical deployments of underground commercial wire spools. No project is too large for our infrastructure teams.'
    },
    // Mixed 9 (Day/Indoor)
    {
        id: 'new-ev-4', title: 'Solar Infrastructure', category: 'EV & Green Tech', image: '/gallery/IMG_1282.PNG', location: 'Eco-Center',
        description: 'From the sun to the switch: Providing the critical heavy-up commercial services required to handle massive commercial solar arrays.'
    },
    {
        id: 'new-ri-4', title: 'Rough-In Inspection', category: 'Rough-In & Panels', image: '/gallery/IMG_1286.PNG', location: 'Residential Tract',
        description: 'Before the drywall goes up, the truth is exposed. Our pristine rough-ins guarantee smooth, delay-free city inspections and decades of safety.'
    },
    // Mixed 10 (Night/Garage)
    {
        id: 'new-ev-1', title: 'Tesla Integration', category: 'EV & Green Tech', image: '/gallery/IMG_1302.PNG', location: 'Custom Garage',
        description: 'Driving the future: Clean, surface-mounted Tesla Wall Connector installations tailored for luxury garages, delivering maximum overnight charging speeds.'
    },
    {
        id: 'new-ug-2', title: 'Trenching the Feed', category: 'Underground & Infrastructure', image: '/gallery/IMG_1274.PNG', location: 'Grid Expansion',
        description: 'Laying the groundwork: Precision excavation and conduit routing to ensure reliable, high-capacity power delivery to new commercial sectors.'
    },
    // Mixed 11 (Day/Lit)
    {
        id: 'new-res-2', title: 'Gourmet Kitchen Pendants', category: 'Custom Residential', image: '/gallery/IMG_1301.PNG', location: 'Austin, TX',
        description: 'The master touch: Precision installation of high-end designer pendant fixtures, establishing the perfect ambiance for luxury living spaces.'
    },
    {
        id: 'new-mf-5', title: 'Pre-Dawn Dispatch', category: 'Multi-Family & Commercial', image: '/gallery/IMG_1296_cropped.PNG', location: 'Site Operations',
        description: 'Our fleet coordinates at first light. Reliability and rigorous scheduling are the cornerstones of our multi-million dollar commercial partnerships.'
    },
    // Mixed 12 (Night/Dusk)
    {
        id: 'new-res-4', title: 'Patio Living', category: 'Custom Residential', image: '/gallery/IMG_1303.PNG', location: 'Hill Country',
        description: 'Extending the living space: Expertly wired outdoor ceiling fans, recessed LEDs, and weatherproof circuits for premium alfresco entertaining.'
    },
    // Mixed 13 (Day)
    {
        id: 'new-ev-2', title: 'Green Complex Concept', category: 'EV & Green Tech', image: '/gallery/IMG_1292.PNG', location: 'Eco-Development',
        description: 'Future-ready living: Partnering with developers to integrate commercial EV stations and solar-ready infrastructure into multi-family housing complexes.'
    },
    {
        id: 'legacy-3', title: 'EV Charging Station', category: 'EV & Green Tech', image: '/project_ev.jpg', location: 'Round Rock, TX',
        description: 'High-capacity commercial charging installation, future-proofing retail spaces for the electric transition.'
    },
    // Mixed 14 (Indoor)
    {
        id: 'legacy-5', title: 'Safety Inspection Retrofit', category: 'Legacy', image: '/project_safety.jpg', location: 'Georgetown, TX',
        description: 'Brought a historical property fully up to modern National Electrical Code standards without compromising aesthetic integrity.'
    },
    {
        id: 'new-ri-3', title: 'Meter Bank Masterpiece', category: 'Rough-In & Panels', image: '/gallery/IMG_1281.PNG', location: 'Multi-Family HQ',
        description: 'Symmetrical perfection. flawless execution of a multi-unit meter bank. When the conduit looks like architectural art, you know MSC Electric installed it.'
    },
    {
        id: 'legacy-7', title: 'Main Panel Upgrade', category: 'Rough-In & Panels', image: '/project_panel.jpg', location: 'Pflugerville, TX',
        description: 'Heavy up service upgrade from 100A to 400A to support modern appliances, pool equipment, and dual EV chargers.'
    },
    {
        id: 'legacy-8', title: 'Kitchen Remodel Wiring', category: 'Legacy', image: '/outlets_safety.jpg', location: 'Cedar Park, TX',
        description: 'Precision layout of GFCI safety circuits and under-cabinet LED task lighting for a chef\'s kitchen.'
    }
];

export const GALLERY_CATEGORIES: ProjectCategory[] = [
    'Multi-Family & Commercial',
    'Custom Residential',
    'Rough-In & Panels',
    'Underground & Infrastructure',
    'EV & Green Tech'
];

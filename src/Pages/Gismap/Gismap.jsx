import { useState, useMemo } from 'react';
import Navbar from '../../Components/Header/Navbar';
import Footer from '../../Components/Footer/Footer';
import { useDatabase } from '../../Context/DatabaseContext';
import { 
    MapPin, Search, 
    Hospital, GraduationCap, School, ShoppingBag,
    CheckCircle2, Compass, ChevronRight
} from 'lucide-react';

const Gismap = () => {
    const { publicProjects = [] } = useDatabase();

    const [selectedProjectId, setSelectedProjectId] = useState(publicProjects[0]?.id || 'p1');
    const [searchQuery, setSearchQuery] = useState('');

    // Handle project card click: select project but keep list visible (no auto-filtering list)
    const handleSelectProject = (proj) => {
        setSelectedProjectId(proj.id);
    };

    // Filter projects based on search query
    const filteredProjects = useMemo(() => {
        return publicProjects.filter(p => {
            const matchSearch = !searchQuery || 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchSearch;
        });
    }, [publicProjects, searchQuery]);

    // Active selected project object
    const activeProject = useMemo(() => {
        return publicProjects.find(p => p.id === selectedProjectId) || filteredProjects[0] || publicProjects[0] || {};
    }, [publicProjects, selectedProjectId, filteredProjects]);

    // Helper to format google map embed link or coordinates pointing out exact location marker
    const getMapEmbedUrl = (proj) => {
        if (!proj) return 'https://maps.google.com/maps?q=23.6238,90.4993&z=16&output=embed';

        let raw = (proj.mapLink || proj.map_link || '').trim();

        // 1. Extract src if admin pasted full <iframe> HTML tag
        if (raw.includes('<iframe') && raw.includes('src=')) {
            const match = raw.match(/src=["']([^"']+)["']/i);
            if (match && match[1]) {
                raw = match[1];
            }
        }

        // 2. Extract latitude & longitude coordinates from any URL format
        // Format A: @23.6238,90.4993
        const atCoords = raw.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (atCoords) {
            return `https://maps.google.com/maps?q=${atCoords[1]},${atCoords[2]}&z=16&output=embed`;
        }

        // Format B: !3d23.6238!4d90.4993
        const d3d4 = raw.match(/!3d(-?\d+\.\d+).*?!4d(-?\d+\.\d+)/);
        if (d3d4) {
            return `https://maps.google.com/maps?q=${d3d4[1]},${d3d4[2]}&z=16&output=embed`;
        }

        // Format C: q=23.6238,90.4993 or ll=23.6238,90.4993
        const qCoords = raw.match(/(?:q|ll)=(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
        if (qCoords) {
            return `https://maps.google.com/maps?q=${qCoords[1]},${qCoords[2]}&z=16&output=embed`;
        }

        // Format D: raw pair string e.g. "23.6238, 90.4993"
        const pairMatch = raw.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
        if (pairMatch) {
            return `https://maps.google.com/maps?q=${pairMatch[1]},${pairMatch[2]}&z=16&output=embed`;
        }

        // 3. Direct embed URL with pb= or output=embed
        if (raw.includes('google.com/maps/embed') || raw.includes('output=embed')) {
            return raw;
        }

        // 4. If raw is a text address or location link
        if (raw && !raw.startsWith('http://') && !raw.startsWith('https://')) {
            return `https://maps.google.com/maps?q=${encodeURIComponent(raw)}&z=16&output=embed`;
        }

        // 5. Fallback: Build exact location pinpoint using project coordinates or full address
        if (proj.coordinates && proj.coordinates.lat && proj.coordinates.lng) {
            return `https://maps.google.com/maps?q=${proj.coordinates.lat},${proj.coordinates.lng}&z=16&output=embed`;
        }

        const exactQuery = [proj.name, proj.fullAddress || proj.location]
            .filter(Boolean)
            .join(', ');

        return `https://maps.google.com/maps?q=${encodeURIComponent(exactQuery || 'Narayanganj, Bangladesh')}&z=16&output=embed`;
    };

    // ─── Location-aware amenity profiles ─────────────────────────────────────
    // Fallback neighborhoods are selected by matching the active project's
    // location string, so text + distance numbers differ per project region.
    const AREA_AMENITY_PROFILES = [
        {
            match: /dhanmondi|dhaka|gulshan|banani|badda|uttara|mirpur|mogbazar|aftabnagar|rampura|east west|west|tejgaon|mohakhali|bashundhara/i,
            hospitals: 'Labaid Specialized Hospital (0.5 km), Square Hospital (1.4 km), Ibn Sina Hospital (1.1 km)',
            schools: 'Scholastica School (0.8 km), Mastermind International (1.2 km), Maple Leaf International (0.9 km)',
            colleges: 'Dhaka City College (0.7 km), State University of Bangladesh (1.5 km), ULAB (1.8 km)',
            markets: 'Shimanto Square (0.6 km), Rapa Plaza (1.1 km), Metro Shopping Mall (1.3 km)'
        },
        {
            match: /narayanganj|bb road|shamabay/i,
            hospitals: 'Narayanganj 200 Bed Hospital (0.8 km), Popular Diagnostic Center (1.2 km), General Hospital (1.5 km)',
            schools: 'Ideal School & College (0.6 km), Narayanganj Govt High School (1.1 km), Morning Star School (1.4 km)',
            colleges: 'Tolaram Govt College (1.3 km), Narayanganj College (1.6 km), MW High School & College (1.8 km)',
            markets: 'Shamabay New Market (0.3 km), Balur Math Super Market (0.7 km), Narayanganj Central Market (1.0 km)'
        },
        {
            match: /chattogram|chittagong|port city|agrabad/i,
            hospitals: 'Chattogram General Hospital (0.9 km), Chevron Clinical Lab (1.3 km), Metropole Hospital (1.7 km)',
            schools: 'Agrabad Govt High School (0.7 km), Chattogram Collegiate School (1.1 km), Crescent Public School (1.6 km)',
            colleges: 'Chattogram College (1.2 km), Govt Hazi Mohammad Mohsin College (1.8 km)',
            markets: 'Agrabad Access Road Market (0.4 km), New Market GEC (0.9 km), Reazuddin Bazar (1.5 km)'
        },
        {
            match: /sylhet|zindabazar|amberkhana/i,
            hospitals: 'Sylhet MAG Osmani Hospital (0.7 km), Synergy Hospital (1.4 km)',
            schools: 'Sylhet Govt Pilot High School (0.6 km), Scholarshome (1.2 km)',
            colleges: 'Sylhet MC College (1.1 km), Sylhet Polytechnic (1.9 km)',
            markets: 'Zindabazar Market (0.3 km), Amberkhana New Market (0.8 km), Fenchuganj Bazar (1.6 km)'
        },
        {
            match: /rajshahi|khulna|barishal|barisal|rangpur|mymensingh|cumilla|comilla/i,
            hospitals: 'City General Hospital (1.0 km), Specialized Diagnostic Center (1.4 km)',
            schools: 'Govt High School (0.8 km), Model School & College (1.2 km)',
            colleges: 'Govt College (1.3 km), Medical University (1.9 km)',
            markets: 'Central Super Market (0.5 km), City New Market (1.0 km), Posh Bazar (1.5 km)'
        }
    ];

    const DEFAULT_AMENITIES = {
        hospitals: 'City General Hospital (1.0 km), Specialized Diagnostic Center (1.4 km)',
        schools: 'Govt High School (0.8 km), Model School & College (1.2 km)',
        colleges: 'Govt College (1.3 km)',
        markets: 'Central Super Market (0.5 km), City New Market (1.0 km)'
    };

    const getAreaProfile = (location) => {
        const loc = (location || '').toLowerCase();
        return AREA_AMENITY_PROFILES.find(p => p.match.test(loc)) || {};
    };

    const areaProfile = getAreaProfile(activeProject.location || activeProject.name);

    // Helper to parse comma-separated amenity lists
    const parseAmenityList = (rawString, defaultFallback) => {
        const val = rawString || defaultFallback;
        if (!val) return [];
        return val.split(',').map(s => s.trim()).filter(Boolean);
    };

    const hospitals = parseAmenityList(
        activeProject.nearbyHospitals || activeProject.nearby_hospitals,
        areaProfile.hospitals || DEFAULT_AMENITIES.hospitals
    );

    const schools = parseAmenityList(
        activeProject.nearbySchools || activeProject.nearby_schools,
        areaProfile.schools || DEFAULT_AMENITIES.schools
    );

    const colleges = parseAmenityList(
        activeProject.nearbyColleges || activeProject.nearby_colleges,
        areaProfile.colleges || DEFAULT_AMENITIES.colleges
    );

    const markets = parseAmenityList(
        activeProject.nearbyMarkets || activeProject.nearby_markets,
        areaProfile.markets || DEFAULT_AMENITIES.markets
    );

    return (
        <div className="min-h-screen bg-base-200 flex flex-col font-sans text-base-content">
            {/* Header Navigation */}
            <Navbar />

            {/* Page Banner */}
            <div className="bg-[#000f22] text-white py-10 px-6 border-b border-[#0a2540] relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Project Location & Nearby Amenities</h1>
                    </div>
                </div>
            </div>

            {/* Main Interactive Map Layout */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* Upper Split View: Left Sidebar Controls + Right Interactive Map Box */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT SIDEBAR: Area Selector & Project Catalog (4 cols) */}
                    <div className="lg:col-span-4 bg-base-100 border border-base-300 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[650px]">
                        
                        {/* Area Location Filter Tabs */}
                        <div className="p-4 border-b border-base-300 bg-base-200/50 space-y-3">
                            <div className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                Search Property Projects
                            </div>

                            {/* Search Input */}
                            <div className="relative mt-2">
                                <Search size={14} className="absolute left-3 top-2.5 text-base-content/40" />
                                <input
                                    type="text"
                                    placeholder="Search project or address..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 bg-base-100 border border-base-300 rounded-lg text-xs font-medium focus:outline-none focus:border-primary text-base-content"
                                />
                            </div>
                        </div>

                        {/* Project Cards List */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            <div className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider px-1">
                                Available Projects ({filteredProjects.length})
                            </div>

                            {filteredProjects.length > 0 ? (
                                filteredProjects.map(proj => {
                                    const isSelected = (activeProject.id === proj.id);
                                    return (
                                        <div
                                            key={proj.id}
                                            onClick={() => handleSelectProject(proj)}
                                            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                                                isSelected 
                                                    ? 'bg-primary/10 border-primary shadow-md ring-1 ring-primary' 
                                                    : 'bg-base-100 border-base-300 hover:border-primary/50 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-base-content text-sm flex items-center gap-2">
                                                        {proj.name}
                                                        {isSelected && <CheckCircle2 size={14} className="text-primary" />}
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-xs text-base-content/60 mt-0.5">
                                                        <MapPin size={12} className="text-[#fe762a] flex-shrink-0" />
                                                        <span className="truncate">{proj.location}</span>
                                                    </div>
                                                </div>

                                                <span 
                                                    className="text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider text-white"
                                                    style={{ backgroundColor: proj.statusBg || '#a14000' }}
                                                >
                                                    {proj.status || 'AVAILABLE'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                                                <span className="text-slate-600 font-semibold">{proj.type || 'Residential'}</span>
                                                <span className="text-slate-500 font-medium">{proj.area || ''}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 text-slate-400 text-xs">
                                    No project locations match your filter. Try selecting "All Locations".
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT MAIN AREA: Interactive Google/GIS Map Box (8 cols) */}
                    <div className="lg:col-span-8 bg-base-100 border border-base-300 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[650px]">
                        
                        {/* Map Header Toolbar */}
                        <div className="p-4 border-b border-base-300 bg-base-200/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-primary text-primary-content rounded-lg flex items-center justify-center font-bold">
                                    <Compass size={18} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-base-content flex items-center gap-2">
                                        {activeProject.name || 'Select a Project Location'}
                                    </h2>
                                    <div className="text-xs text-base-content/60 flex items-center gap-1.5">
                                        <MapPin size={12} className="text-[#fe762a]" />
                                        <span>{activeProject.location || 'Narayanganj'}</span>
                                        <span className="opacity-40">•</span>
                                        <span className="text-primary font-semibold">GIS Map Location</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Embedded Map Viewport */}
                        <div className="flex-1 bg-base-200 relative">
                            <iframe
                                key={`${activeProject.id || 'p1'}_${getMapEmbedUrl(activeProject)}`}
                                title={`GIS Map for ${activeProject.name}`}
                                src={getMapEmbedUrl(activeProject)}
                                className="w-full h-full border-0"
                                loading="lazy"
                                allowFullScreen
                            ></iframe>


                        </div>
                    </div>
                </div>

                {/* LOWER SECTION: Nearby Amenities */}
                <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-base-200 pb-4">
                        <div>
                            <div className="text-[10px] font-bold text-[#fe762a] uppercase tracking-widest mb-0.5">
                                2 KM Radius Geographic Analysis
                            </div>
                            <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
                                Nearby Amenities for <span className="text-primary">{activeProject.name}</span>
                            </h2>
                        </div>
                    </div>

                    {/* 4 Amenity Cards Grid: Hospitals, Schools, Colleges, Markets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        {/* 1. Hospitals */}
                        <div className="bg-base-200/60 border border-base-300 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-red-400 transition-colors">
                            <div className="flex items-center gap-3 border-b border-base-300 pb-3">
                                <div className="w-9 h-9 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center">
                                    <Hospital size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base-content text-sm">Hospitals & Health</h3>
                                    <div className="text-[10px] text-base-content/60 font-semibold">Within 2 km</div>
                                </div>
                            </div>
                            
                            <ul className="space-y-2 flex-1">
                                {hospitals.map((h, i) => (
                                    <li key={i} className="text-xs text-base-content/80 flex items-start gap-2 bg-base-100 p-2 rounded border border-base-300">
                                        <ChevronRight size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
                                        <span className="font-medium">{h}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 2. Schools */}
                        <div className="bg-base-200/60 border border-base-300 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-blue-400 transition-colors">
                            <div className="flex items-center gap-3 border-b border-base-300 pb-3">
                                <div className="w-9 h-9 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                                    <School size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base-content text-sm">Nearby Schools</h3>
                                    <div className="text-[10px] text-base-content/60 font-semibold">Within 2 km</div>
                                </div>
                            </div>
                            
                            <ul className="space-y-2 flex-1">
                                {schools.map((s, i) => (
                                    <li key={i} className="text-xs text-base-content/80 flex items-start gap-2 bg-base-100 p-2 rounded border border-base-300">
                                        <ChevronRight size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                        <span className="font-medium">{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 3. Colleges / Varsities */}
                        <div className="bg-base-200/60 border border-base-300 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-indigo-400 transition-colors">
                            <div className="flex items-center gap-3 border-b border-base-300 pb-3">
                                <div className="w-9 h-9 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center">
                                    <GraduationCap size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base-content text-sm">Colleges & Universities</h3>
                                    <div className="text-[10px] text-base-content/60 font-semibold">Within 2 km</div>
                                </div>
                            </div>
                            
                            <ul className="space-y-2 flex-1">
                                {colleges.map((c, i) => (
                                    <li key={i} className="text-xs text-base-content/80 flex items-start gap-2 bg-base-100 p-2 rounded border border-base-300">
                                        <ChevronRight size={12} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                                        <span className="font-medium">{c}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 4. Markets / Malls */}
                        <div className="bg-base-200/60 border border-base-300 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-amber-400 transition-colors">
                            <div className="flex items-center gap-3 border-b border-base-300 pb-3">
                                <div className="w-9 h-9 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center">
                                    <ShoppingBag size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base-content text-sm">Markets & Malls</h3>
                                    <div className="text-[10px] text-base-content/60 font-semibold">Within 2 km</div>
                                </div>
                            </div>
                            
                            <ul className="space-y-2 flex-1">
                                {markets.map((m, i) => (
                                    <li key={i} className="text-xs text-base-content/80 flex items-start gap-2 bg-base-100 p-2 rounded border border-base-300">
                                        <ChevronRight size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                        <span className="font-medium">{m}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </div>

            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Gismap;
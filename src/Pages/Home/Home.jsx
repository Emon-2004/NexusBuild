import { useState } from "react";
import { Link } from "react-router";
import { supabase } from "../../lib/supabaseClient";
import { showToast } from '../../Components/Toast/globalToast';
import {
    MapPin,
    Wrench,
    ArrowRight,
    CheckCircle2,
    TrendingUp,
    FileText,
    Globe,
    LifeBuoy,
    Building2,
    ShieldCheck,
    Award
} from "lucide-react";

import { PROJECTS } from "../../data/projectsData";
import { useDatabase } from "../../Context/DatabaseContext";
import { DEFAULT_SYSTEM_SETTINGS } from "../../config/defaultSettings";
import map_mockup from "../../assets/pics/map_mockup.png";
import {
    HeroSlider,
    LiveStatsCounter,
    PartnersGrid,
    MarketUpdates,
    TestimonialsCarousel,
    FaqAccordion,
    NewsletterBar
} from "../../Components/Home";

// Public assets matching design system
const IMG_HERO = "/Frontend/Projects/Hero_Section.svg";
const IMG_SERVICES = "/Frontend/Projects/Professional_Services_Remodeling.svg";

const MapFrameWithSkeleton = ({ src, title }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className="relative w-full h-full">
            {!loaded && (
                <div className="absolute inset-0 bg-[#000f22] flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-3 text-white">
                        <span className="loading loading-spinner loading-lg text-[#fe762a]"></span>
                        <span className="text-xs font-semibold text-[#768dad]">Loading Map Coordinates...</span>
                    </div>
                </div>
            )}
            <iframe
                title={title}
                src={src}
                className="w-full h-full border-0 relative z-0"
                loading="lazy"
                onLoad={() => setLoaded(true)}
            />
        </div>
    );
};

const Home = () => {
    const { systemSettings, publicProjects, loading } = useDatabase();
    const [selectedNeighborhood, setSelectedNeighborhood] = useState("Chashiara");
    const [showRemodeling, setShowRemodeling] = useState(false);
    const [showSiteVisit, setShowSiteVisit] = useState(false);
    const [showGeneralInquiry, setShowGeneralInquiry] = useState(false);

    // Form inputs state
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formPlotSize, setFormPlotSize] = useState('');
    const [formAddress, setFormAddress] = useState('');
    const [formProject, setFormProject] = useState('Sardar Tower – Block A');

    const handleInquirySubmit = async (type, details) => {
        try {
            const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            let interestText = details.description;
            if (type === 'Remodeling') {
                interestText = `Remodeling Inquiry: Plot Size - ${details.plotSize}, Address - ${details.address}. Requirements: ${details.description}`;
            } else if (type === 'Site Visit') {
                interestText = `Site Visit Schedule: Project - ${details.project}. Comments: ${details.description}`;
            } else {
                interestText = `General Inquiry: ${details.description}`;
            }

            const payload = {
                name: details.name,
                phone: details.phone || 'N/A',
                interest: `${interestText} (Email: ${details.email || 'N/A'})`,
                source: `${type} Inquiry`,
                status: 'New',
                date: dateStr
            };

            const { error } = await supabase.from('leads').insert([payload]);
            if (error) {
                showToast('Submission failed: ' + error.message, 'error', 'Submission Failed');
            } else {
                showToast('Thank you! Your inquiry has been submitted. Our team will get back to you soon.', 'success', 'Inquiry Submitted');
                setShowRemodeling(false);
                setShowSiteVisit(false);
                setShowGeneralInquiry(false);
                // Reset fields
                setFormName('');
                setFormEmail('');
                setFormPhone('');
                setFormDescription('');
                setFormPlotSize('');
                setFormAddress('');
            }
        } catch(err) {
            showToast('Error submitting inquiry: ' + err.message, 'error', 'Submission Failed');
        }
    };

    const neighborhoods = [
        {
            name: "Chashiara",
            stats: "45 Projects • 12 Active",
            desc: "The commercial heart of Narayanganj with premium retail and high-rise residential towers.",
            lat: 23.6238,
            lng: 90.4993,
            bbox: "90.47,23.60,90.52,23.65"
        },
        {
            name: "Deobhog",
            stats: "28 Projects • 8 Active",
            desc: "A rapidly growing residential area with modern schools, parks, and family-friendly complexes.",
            lat: 23.6280,
            lng: 90.4850,
            bbox: "90.46,23.61,90.51,23.66"
        },
        {
            name: "Masdair",
            stats: "19 Projects • 5 Active",
            desc: "Peaceful residential neighborhood known for green spaces and premium housing developments.",
            lat: 23.6180,
            lng: 90.5100,
            bbox: "90.48,23.59,90.53,23.64"
        },
        {
            name: "BB Road",
            stats: "15 Projects • 4 Active",
            desc: "High-density commercial corridor offering corporate headquarters and mixed-use complexes.",
            lat: 23.6158,
            lng: 90.5010,
            bbox: "90.47,23.59,90.52,23.64"
        }
    ];

    const selectedNbData = neighborhoods.find(n => n.name === selectedNeighborhood) || neighborhoods[0];

    // Take top 4 projects for the featured preview (4 cards per row on desktop)
    const allProjects = publicProjects && publicProjects.length > 0 ? publicProjects : PROJECTS;
    const featuredProjects = allProjects.slice(0, 4);

    return (
        <div className="flex flex-col min-h-screen bg-base-100 font-[Inter,sans-serif] text-base-content">

            {/* ══════════════════════════════════════════════════════════════
             * 1. HERO SLIDER (CONSTRAINED TO 60-70VH WITH INTERACTIVE SLIDER)
             * ══════════════════════════════════════════════════════════════ */}
            <HeroSlider systemSettings={systemSettings} />

            {/* ══════════════════════════════════════════════════════════════
             * 2. LIVE STATISTICS COUNTER (DATABASE COUNTS & ANIMATED COUNT-UP)
             * ══════════════════════════════════════════════════════════════ */}
            <LiveStatsCounter />

            {/* ══════════════════════════════════════════════════════════════
             * 2.5 STATUTORY ACCREDITATIONS & PARTNERS GRID
             * ══════════════════════════════════════════════════════════════ */}
            <PartnersGrid />

            {/* ══════════════════════════════════════════════════════════════
             * 3. FEATURED DEVELOPMENTS SECTION (4-CARD GRID WITH EQUAL HEIGHTS & SKELETONS)
             * ══════════════════════════════════════════════════════════════ */}
            <section className="bg-base-100 py-16 lg:py-24 px-6 lg:px-12">
                <div className="max-w-[1280px] mx-auto flex flex-col gap-12">

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-[12px] font-semibold text-[#a14000] uppercase tracking-wider">
                                Featured Portfolio
                            </span>
                            <h2 className="text-[28px] lg:text-[32px] font-bold text-base-content leading-tight">
                                Signature Developments
                            </h2>
                            <p className="text-[16px] font-normal text-base-content/75 leading-relaxed max-w-xl">
                                Hand-picked showcase of our premier residential and commercial properties in Narayanganj.
                            </p>
                        </div>

                        <Link
                            to="/projects"
                            className="inline-flex items-center gap-2 text-[14px] font-bold text-[#a14000] hover:text-[#5e2200] transition-colors flex-shrink-0"
                        >
                            View All Projects ({allProjects.length})
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="bg-base-100 border border-base-300 flex flex-col justify-between h-full rounded-xl overflow-hidden shadow-sm animate-pulse"
                                >
                                    <div className="skeleton h-[200px] lg:h-[220px] w-full bg-base-300 rounded-none" />
                                    <div className="p-5 flex flex-col flex-1 gap-3 justify-between">
                                        <div className="space-y-2">
                                            <div className="skeleton h-6 w-3/4 bg-base-300 rounded" />
                                            <div className="flex gap-3">
                                                <div className="skeleton h-4 w-20 bg-base-300 rounded" />
                                                <div className="skeleton h-4 w-16 bg-base-300 rounded" />
                                            </div>
                                            <div className="skeleton h-12 w-full bg-base-300 rounded mt-2" />
                                        </div>
                                        <div className="skeleton h-10 w-full bg-base-300 rounded-lg mt-2" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            featuredProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-base-100 border border-base-300 flex flex-col justify-between h-full hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden group"
                                >
                                    <div className="relative h-[200px] lg:h-[220px] overflow-hidden flex-shrink-0">
                                        <img
                                            src={project.image}
                                            alt={project.name}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />

                                        <div className="absolute top-3 left-3">
                                            <span
                                                className="text-[11px] font-bold text-white px-2.5 py-1 uppercase tracking-wider rounded-[3px] shadow-sm"
                                                style={{ backgroundColor: project.statusBg || '#000f22' }}
                                            >
                                                {project.status}
                                            </span>
                                        </div>

                                        {project.priceRange && (
                                            <div className="absolute bottom-3 right-3">
                                                <span className="text-[11px] font-bold bg-base-100/90 backdrop-blur-sm text-base-content px-2 py-0.5 rounded shadow-sm">
                                                    {project.priceRange}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col flex-1 p-5 gap-3 justify-between">
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-[20px] font-bold text-base-content leading-tight line-clamp-1">
                                                {project.name}
                                            </h3>

                                            <div className="flex items-center gap-3 text-[12px] text-base-content/65">
                                                <span className="flex items-center gap-1 font-medium truncate max-w-[130px]">
                                                    <MapPin size={13} className="text-primary flex-shrink-0" />
                                                    <span className="truncate">{project.location}</span>
                                                </span>
                                                <span className="flex items-center gap-1 font-medium flex-shrink-0">
                                                    <Wrench size={13} className="text-secondary flex-shrink-0" />
                                                    <span>{project.type}</span>
                                                </span>
                                            </div>

                                            <p className="text-[14px] font-normal text-base-content/75 leading-relaxed line-clamp-2">
                                                {project.description}
                                            </p>
                                        </div>

                                        <Link
                                            to={`/project-details/${project.id}`}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-content text-[13px] font-bold hover:opacity-90 transition-opacity duration-200 min-h-[42px] mt-2 rounded-lg shadow-sm"
                                        >
                                            Project Details
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
             * 3. EXPLORE NEIGHBORHOODS & GIS MAP
             * ══════════════════════════════════════════════════════════════ */}
            {/* ══════════════════════════════════════════════════════════════
             * 3. EXPLORE NEIGHBORHOODS & GIS MAP
             * ══════════════════════════════════════════════════════════════ */}
            <section className="bg-base-200 border-y border-base-300 py-16 lg:py-24 px-6 lg:px-12">
                <div className="max-w-[1280px] mx-auto flex flex-col gap-10">

                    <div>
                        <span className="text-[12px] font-semibold text-[#a14000] uppercase tracking-wider">
                            Location Insights
                        </span>
                        <h2 className="text-[28px] lg:text-[32px] font-bold text-base-content leading-tight mt-1">
                            Explore Narayanganj Neighborhoods
                        </h2>
                        <p className="text-[16px] font-normal text-base-content/75 leading-relaxed max-w-xl">
                            Discover active properties and ongoing infrastructure developments mapped across prime sectors.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                        {/* Left: Interactive list */}
                        <div className="lg:col-span-5 flex flex-col gap-3 justify-center">
                            {neighborhoods.map((nb) => {
                                const isActive = selectedNeighborhood === nb.name;
                                return (
                                    <div
                                        key={nb.name}
                                        onClick={() => setSelectedNeighborhood(nb.name)}
                                        className={`p-5 rounded-[6px] border cursor-pointer transition-all ${
                                            isActive
                                                ? "bg-base-100 border-[#fe762a] shadow-md"
                                                : "bg-base-100/60 border-base-300 hover:border-base-content/40 hover:bg-base-100"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[16px] font-bold text-base-content">{nb.name}</h4>
                                            <span className="text-[12px] font-medium text-base-content/70">{nb.stats}</span>
                                        </div>
                                        {isActive && (
                                            <p className="text-[14px] text-base-content/75 mt-2 leading-relaxed">
                                                {nb.desc}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}

                            <Link
                                to="/gismap"
                                className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:opacity-90 text-primary-content text-[14px] font-bold rounded-[4px] transition-colors"
                            >
                                <Globe size={16} />
                                Launch Interactive GIS Map
                            </Link>
                        </div>

                        {/* Right: Map graphics preview */}
                        <div className="lg:col-span-7 bg-base-100 p-3 border border-base-300 rounded-[8px] overflow-hidden shadow-sm flex flex-col justify-between min-h-[380px] relative">
                            <div className="relative w-full h-full min-h-[340px] rounded-[4px] overflow-hidden bg-[#000f22] flex items-center justify-center">
                                {/* Live OpenStreetMap interactive embed centered on selected neighborhood with loading spinner */}
                                <MapFrameWithSkeleton
                                    key={selectedNbData.name}
                                    title={`NexusBuild GIS Map Preview — ${selectedNbData.name}`}
                                    src={`https://maps.google.com/maps?q=${selectedNbData.lat},${selectedNbData.lng}&z=15&output=embed`}
                                />
                                {/* Fallback image background in case iframe loads slowly */}
                                <img
                                    src={map_mockup}
                                    alt="Map Mockup Fallback"
                                    className="absolute inset-0 w-full h-full object-cover -z-10"
                                />
                                <div className="absolute inset-0 bg-[#000f22]/10 pointer-events-none" />

                                <div className="absolute bottom-4 left-4 z-10 bg-base-100/95 backdrop-blur-md p-4 rounded-[6px] shadow-lg border border-base-300 max-w-xs pointer-events-none">
                                    <span className="text-[10px] font-bold text-base-content/65 uppercase tracking-wider block">
                                        Selected Region
                                    </span>
                                    <p className="text-[16px] font-bold text-base-content mt-0.5">
                                        {selectedNbData.name} District
                                    </p>
                                    <p className="text-[12px] text-base-content/75 mt-1">
                                        Lat: {selectedNbData.lat}°N, Lng: {selectedNbData.lng}°E — Live GIS plot active.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
             * 4. PROFESSIONAL SERVICES & REMODELING
             * ══════════════════════════════════════════════════════════════ */}
            <section className="bg-[#000f22] py-16 lg:py-24 px-6 lg:px-12">
                <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-12 items-center">

                    {/* Left details */}
                    <div className="flex-1 flex flex-col gap-6 max-w-[540px]">
                        <span className="text-[12px] font-semibold text-[#fe762a] uppercase tracking-wider">
                            Comprehensive Care
                        </span>
                        <h2 className="text-[28px] lg:text-[36px] font-bold text-white leading-tight">
                            Professional Services &amp; Remodeling
                        </h2>
                        <p className="text-[16px] lg:text-[18px] font-normal text-[#768dad] leading-relaxed">
                            Beyond construction, NexusBuild offers full-scale interior remodeling, architectural consulting, and on-site scheduling for home and business owners.
                        </p>

                        <div className="flex flex-col gap-4 py-2">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-[#a14000] flex items-center justify-center flex-shrink-0 rounded-[4px]">
                                    <Wrench size={20} className="text-white" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-[16px] font-bold text-white">Full-Scope Remodeling</h4>
                                    <p className="text-[14px] text-[#768dad]">Custom interior design, structural renovations, and modern fittings.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-[#a14000] flex items-center justify-center flex-shrink-0 rounded-[4px]">
                                    <CheckCircle2 size={20} className="text-white" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-[16px] font-bold text-white">Consultation &amp; Site Visits</h4>
                                    <p className="text-[14px] text-[#768dad]">Scheduled on-site inspections guided by senior structural engineers.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <button
                                onClick={() => setShowRemodeling(true)}
                                className="px-6 py-3.5 bg-[#fe762a] hover:bg-[#a14000] text-[#5e2200] hover:text-white text-[13px] font-extrabold transition-colors duration-200 rounded-[4px] shadow-md cursor-pointer flex items-center gap-1.5"
                            >
                                Request Remodeling <ArrowRight size={14} />
                            </button>
                            <button
                                onClick={() => setShowSiteVisit(true)}
                                className="px-6 py-3.5 bg-base-100 border-2 border-[#fe762a] text-[#fe762a] hover:bg-[#fe762a] hover:text-white text-[13px] font-extrabold transition-colors duration-200 rounded-[4px] cursor-pointer flex items-center gap-1.5"
                            >
                                Schedule Site Visit <ArrowRight size={14} />
                            </button>
                            <button
                                onClick={() => setShowGeneralInquiry(true)}
                                className="px-6 py-3.5 bg-[#001E3D] text-white hover:bg-slate-800 text-[13px] font-extrabold transition-colors duration-200 rounded-[4px] cursor-pointer flex items-center gap-1.5"
                            >
                                General Inquiry <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Right image */}
                    <div className="flex-1 max-w-[540px] w-full">
                        <div className="w-full aspect-[4/3] rounded-[8px] overflow-hidden border border-white/10 shadow-2xl">
                            <img
                                src={IMG_SERVICES}
                                alt="Professional Services & Remodeling"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
             * 5. CLIENT CAPABILITIES & DIGITAL TOOLKIT
             * ══════════════════════════════════════════════════════════════ */}
            {/* ══════════════════════════════════════════════════════════════
             * 5. CLIENT CAPABILITIES & DIGITAL TOOLKIT
             * ══════════════════════════════════════════════════════════════ */}
            <section className="bg-base-100 py-16 lg:py-24 px-6 lg:px-12">
                <div className="max-w-[1280px] mx-auto flex flex-col gap-12">

                    <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
                        <span className="text-[12px] font-semibold text-[#a14000] uppercase tracking-wider">
                            Digital Platform
                        </span>
                        <h2 className="text-[28px] lg:text-[34px] font-bold text-base-content leading-tight">
                            Empowering Property Owners
                        </h2>
                        <p className="text-[16px] text-base-content/75 leading-relaxed">
                            We equip clients with real-time construction progress tracking, transparent financial ledgers, and 24/7 support portals.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Card 1 */}
                        <div className="bg-base-200 border border-base-300 p-8 rounded-[8px] flex flex-col gap-4">
                            <div className="w-12 h-12 rounded-[6px] bg-[#fe762a]/10 text-[#a14000] flex items-center justify-center">
                                <TrendingUp size={24} />
                            </div>
                            <h3 className="text-[20px] font-bold text-base-content">Project Timeline Tracking</h3>
                            <p className="text-[14px] text-base-content/75 leading-relaxed">
                                Follow construction milestones and structural handovers with automated notifications.
                            </p>
                            <div className="mt-2 pt-4 border-t border-base-300">
                                <div className="flex justify-between text-[12px] font-bold text-base-content/70 mb-1">
                                    <span>Milestone: Structural Framework</span>
                                    <span className="text-[#a14000]">72%</span>
                                </div>
                                <div className="w-full bg-base-300 h-2 rounded-full overflow-hidden">
                                    <div className="bg-[#fe762a] h-full w-[72%]" />
                                </div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-base-200 border border-base-300 p-8 rounded-[8px] flex flex-col gap-4">
                            <div className="w-12 h-12 rounded-[6px] bg-primary/10 text-primary flex items-center justify-center">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-[20px] font-bold text-base-content">Financial Reporting</h3>
                            <p className="text-[14px] text-base-content/75 leading-relaxed">
                                Access payment schedules, digitized invoices, and complete financial ledger transparency.
                            </p>
                            <Link
                                to="/login"
                                className="mt-auto text-[14px] font-bold text-base-content hover:text-primary flex items-center gap-1.5 pt-4"
                            >
                                Client Portal Login →
                            </Link>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-base-200 border border-base-300 p-8 rounded-[8px] flex flex-col gap-4">
                            <div className="w-12 h-12 rounded-[6px] bg-[#a14000]/10 text-[#a14000] flex items-center justify-center">
                                <LifeBuoy size={24} />
                            </div>
                            <h3 className="text-[20px] font-bold text-base-content">24/7 Client Care</h3>
                            <p className="text-[14px] text-base-content/75 leading-relaxed">
                                Dedicated support desk for resident inquiries, site visits, and property management needs.
                            </p>
                            <Link
                                to="/contact"
                                className="mt-auto text-[14px] font-bold text-[#a14000] hover:text-[#5e2200] flex items-center gap-1.5 pt-4"
                            >
                                Contact Support →
                            </Link>
                        </div>

                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
             * 6. LATEST MARKET UPDATES & ARCHITECTURAL INSIGHTS
             * ══════════════════════════════════════════════════════════════ */}
            <MarketUpdates />

            {/* ══════════════════════════════════════════════════════════════
             * 7. TESTIMONIALS & CLIENT REVIEWS CAROUSEL
             * ══════════════════════════════════════════════════════════════ */}
            <TestimonialsCarousel />

            {/* ══════════════════════════════════════════════════════════════
             * 8. FAQ ACCORDION
             * ══════════════════════════════════════════════════════════════ */}
            <FaqAccordion />

            {/* ══════════════════════════════════════════════════════════════
             * 9. VIP NEWSLETTER & PRE-LAUNCH ALLOCATION BAR
             * ══════════════════════════════════════════════════════════════ */}
            <NewsletterBar />

            {/* ══════════════════════════════════════════════════════════════
             * 6. DECADES OF TRUST SECTION
             * ══════════════════════════════════════════════════════════════ */}
            {/* <section className="bg-[#f8f9fa] border-t border-[#c4c6ce]/50 py-16 lg:py-24 px-6 lg:px-12">
                <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-12 items-center">

                    
                    <div className="flex-1 flex flex-col gap-6 max-w-[552px]">
                        <span className="text-[12px] font-semibold text-[#a14000] uppercase tracking-wider">
                            Our Heritage
                        </span>
                        <h2 className="text-[28px] lg:text-[32px] font-bold text-[#000f22] leading-tight">
                            {systemSettings?.heritageHeadline || DEFAULT_SYSTEM_SETTINGS.heritageHeadline}
                        </h2>
                        <p className="text-[16px] lg:text-[18px] font-normal text-[#43474d] leading-relaxed">
                            {systemSettings?.heritageStoryText || DEFAULT_SYSTEM_SETTINGS.heritageStoryText}
                        </p>
                        <p className="text-[16px] font-normal text-[#43474d] leading-relaxed">
                            From high-rise residential towers on BB Road to commercial hubs, our pledge remains steadfast: uncompromising engineering quality, regulatory compliance, and total client transparency.
                        </p>

                        <div className="flex items-start gap-8 pt-4 border-t border-[#c4c6ce]">
                            {[
                                { value: "12+", label: "Years Active" },
                                { value: "150+", label: "Projects Built" },
                                { value: "12k+", label: "Families Housed" },
                            ].map(({ value, label }) => (
                                <div key={label} className="flex flex-col gap-1">
                                    <span className="text-[32px] font-bold text-[#000f22] leading-none">{value}</span>
                                    <span className="text-[12px] font-medium text-[#43474d] uppercase tracking-wider">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    
                    <div className="flex-1 relative max-w-[552px] w-full">
                        <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-[#a14000] rounded-[12px] z-0" />
                        <div className="relative z-10 w-full aspect-[4/3] overflow-hidden border-[8px] border-white shadow-[0px_20px_25px_#0000001a] rounded-[4px]">
                            <img
                                src={IMG_ABOUT}
                                alt="Decades of Trust in Narayanganj"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
            </section> */}
            {/* Remodeling Request Modal */}
            {showRemodeling && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-base-100 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-base-300">
                        <div className="bg-[#001E3D] px-6 py-4 text-white flex justify-between items-center">
                            <h3 className="font-bold text-base">Request Professional Remodeling</h3>
                            <button onClick={() => setShowRemodeling(false)} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">×</button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleInquirySubmit('Remodeling', {
                                name: formName,
                                email: formEmail,
                                phone: formPhone,
                                description: formDescription,
                                plotSize: formPlotSize,
                                address: formAddress
                            });
                        }} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-base-content/80 uppercase mb-1">Your Name *</label>
                                <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded text-sm text-base-content focus:outline-none focus:border-[#fe762a]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-base-content/80 uppercase mb-1">Phone Number *</label>
                                    <input required type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded text-sm text-base-content focus:outline-none focus:border-[#fe762a]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-base-content/80 uppercase mb-1">Email Address</label>
                                    <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded text-sm text-base-content focus:outline-none focus:border-[#fe762a]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-base-content/80 uppercase mb-1">Plot Size (e.g. 3 Katha)</label>
                                    <input type="text" value={formPlotSize} onChange={e => setFormPlotSize(e.target.value)} className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded text-sm text-base-content focus:outline-none focus:border-[#fe762a]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-base-content/80 uppercase mb-1">Site Location Address</label>
                                    <input type="text" value={formAddress} onChange={e => setFormAddress(e.target.value)} className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded text-sm text-base-content focus:outline-none focus:border-[#fe762a]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-base-content/80 uppercase mb-1">Remodeling Scope Details *</label>
                                <textarea required value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={3} placeholder="Please detail the modifications or redesign you need..." className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded text-sm text-base-content focus:outline-none focus:border-[#fe762a]"></textarea>
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowRemodeling(false)} className="px-4 py-2 border border-base-300 text-base-content rounded text-xs font-bold hover:bg-base-200 cursor-pointer">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-[#fe762a] hover:bg-[#a14000] text-white rounded text-xs font-bold cursor-pointer">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Site Visit Schedule Modal */}
            {showSiteVisit && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-base-100 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-base-300">
                        <div className="bg-[#001E3D] px-6 py-4 text-white flex justify-between items-center">
                            <h3 className="font-bold text-base">Schedule Site Visit</h3>
                            <button onClick={() => setShowSiteVisit(false)} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">×</button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleInquirySubmit('Site Visit', {
                                name: formName,
                                email: formEmail,
                                phone: formPhone,
                                description: formDescription,
                                project: formProject
                            });
                        }} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-base-content/80 uppercase mb-1">Your Name *</label>
                                <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded text-sm text-base-content focus:outline-none focus:border-[#fe762a]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-base-content/80 uppercase mb-1">Phone Number *</label>
                                    <input required type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded text-sm text-base-content focus:outline-none focus:border-[#fe762a]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-base-content/80 uppercase mb-1">Email Address</label>
                                    <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded text-sm text-base-content focus:outline-none focus:border-[#fe762a]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-base-content/80 uppercase mb-1">Select Project to Visit *</label>
                                <select value={formProject} onChange={e => setFormProject(e.target.value)} className="w-full px-3 py-2 border border-base-300 rounded text-sm text-base-content focus:outline-none bg-base-200">
                                    <option value="Sardar Tower – Block A">Sardar Tower (Chashiara)</option>
                                    <option value="Shapla Green Fields">Shapla Green Fields (Chashiara)</option>
                                    <option value="Shamabai Biponi Bitan">Shamabai Biponi Bitan (Narayanganj Sadar)</option>
                                    <option value="Bhuiyan Heights">Bhuiyan Heights (Narayanganj Sadar)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-base-content/80 uppercase mb-1">Preferred Date &amp; Notes *</label>
                                <textarea required value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={3} placeholder="Please mention preferred date/time and any specific instructions..." className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded text-sm text-base-content focus:outline-none focus:border-[#fe762a]"></textarea>
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowSiteVisit(false)} className="px-4 py-2 border border-base-300 text-base-content rounded text-xs font-bold hover:bg-base-200 cursor-pointer">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-[#fe762a] hover:bg-[#a14000] text-white rounded text-xs font-bold cursor-pointer">Schedule Visit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* General Inquiry Modal */}
            {showGeneralInquiry && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-base-100 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-base-300">
                        <div className="bg-[#001E3D] px-6 py-4 text-white flex justify-between items-center">
                            <h3 className="font-bold text-base">Submit General Inquiry</h3>
                            <button onClick={() => setShowGeneralInquiry(false)} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">×</button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleInquirySubmit('General', {
                                name: formName,
                                email: formEmail,
                                phone: formPhone,
                                description: formDescription
                            });
                        }} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-base-content/80 uppercase mb-1">Your Name *</label>
                                <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded text-sm text-base-content focus:outline-none focus:border-[#fe762a]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-base-content/80 uppercase mb-1">Phone Number *</label>
                                    <input required type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded text-sm text-base-content focus:outline-none focus:border-[#fe762a]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-base-content/80 uppercase mb-1">Email Address</label>
                                    <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded text-sm text-base-content focus:outline-none focus:border-[#fe762a]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-base-content/80 uppercase mb-1">Inquiry / Message *</label>
                                <textarea required value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={4} placeholder="Please type your message or question here..." className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded text-sm text-base-content focus:outline-none focus:border-[#fe762a]"></textarea>
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowGeneralInquiry(false)} className="px-4 py-2 border border-base-300 text-base-content rounded text-xs font-bold hover:bg-base-200 cursor-pointer">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-[#fe762a] hover:bg-[#a14000] text-white rounded text-xs font-bold cursor-pointer">Submit Inquiry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Home;
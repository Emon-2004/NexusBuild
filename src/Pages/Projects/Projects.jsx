import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import {
    Search,
    MapPin,
    ArrowRight,
    Wrench,
    CalendarCheck,
    RotateCcw,
    CheckCircle2,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal
} from "lucide-react";
import { useDatabase } from "../../Context/DatabaseContext";
import { DEFAULT_SYSTEM_SETTINGS } from "../../config/defaultSettings";
import { supabase } from "../../lib/supabaseClient";
import { showToast } from '../../Components/Toast/globalToast';
import { Button, Badge } from "../../Components/UI";

// ── Public image paths (files in /public/frontend/projects/) ──────────────────
const IMG_HERO = "/Frontend/Projects/Hero_Section.svg";
const IMG_SERVICES = "/Frontend/Projects/Professional_Services_Remodeling.svg";
const IMG_ABOUT = "/Frontend/Projects/Decades_of_Trust_in_Narayanganj.svg";

// ─── Projects ─────────────────────────────────────────────────────────────────
// Figma frame: 1310×3783, node-id=1:753
// Sections:
//   1. Hero Section (1310×870): dark overlay, search/filter bar
//   2. All Projects Section (1280×898): 3-card grid with filter integration
//   3. GIS Map Module
//   4. Services & Remodeling Section (#000f22)
//   5. About Us Section
// ─────────────────────────────────────────────────────────────────────────────

const ImageWithSkeleton = ({ src, alt, className }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className="relative w-full h-full overflow-hidden bg-base-300">
            {!loaded && <div className="skeleton absolute inset-0 w-full h-full bg-base-300" />}
            <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
};

// Helper parsers for client-side sorting
const extractPrice = (proj) => {
    if (typeof proj.price === 'number') return proj.price;
    const raw = String(proj.priceRange || proj.price || '');
    const crMatch = raw.match(/([\d.]+)\s*Cr/i);
    if (crMatch) return parseFloat(crMatch[1]) * 10000000;
    const lacMatch = raw.match(/([\d.]+)\s*(?:Lac|Lakh)/i);
    if (lacMatch) return parseFloat(lacMatch[1]) * 100000;
    const num = parseFloat(raw.replace(/[^\d.]/g, ''));
    return isNaN(num) ? 0 : num;
};

const extractSize = (proj) => {
    const specArea = proj.specs?.find(s => /area|size/i.test(s.label))?.value;
    const raw = String(proj.area || proj.size || specArea || '');
    const num = parseFloat(raw.replace(/[^\d.]/g, ''));
    return isNaN(num) ? 0 : num;
};

const extractNewest = (proj) => {
    if (proj.created_at) {
        const time = new Date(proj.created_at).getTime();
        if (!isNaN(time)) return time;
    }
    const specYear = proj.specs?.find(s => /year/i.test(s.label))?.value;
    const year = parseInt(String(specYear || proj.completionYear || '').replace(/[^\d]/g, ''), 10);
    if (!isNaN(year) && year > 0) return year;
    const idNum = parseInt(String(proj.id).replace(/[^\d]/g, ''), 10);
    return isNaN(idNum) ? 0 : idNum;
};

const Projects = () => {
    const { publicProjects, systemSettings, loading } = useDatabase();

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
                setFormProject('Sardar Tower – Block A');
            }
        } catch(err) {
            showToast('Error submitting inquiry: ' + err.message, 'error', 'Submission Failed');
        }
    };

    // ── Search & Pagination URL State ─────────────────────────────────────────
    const [searchParams, setSearchParams] = useSearchParams();
    const currentSort = searchParams.get("sort") || "default";
    const rawPage = parseInt(searchParams.get("page") || "1", 10);
    const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const ITEMS_PER_PAGE = 12;

    // ── Filter State ──────────────────────────────────────────────────────────
    const [locationFilter, setLocationFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Dynamic filter options lists collected from all public projects
    const locationsList = useMemo(() => {
        const locSet = new Set(publicProjects.map(p => p.location?.trim()).filter(Boolean));
        return Array.from(locSet).sort();
    }, [publicProjects]);

    const typesList = useMemo(() => {
        const typeSet = new Set(publicProjects.map(p => p.type?.trim()).filter(Boolean));
        return Array.from(typeSet).sort();
    }, [publicProjects]);

    const statusesList = useMemo(() => {
        const statusSet = new Set(publicProjects.map(p => p.status?.trim()).filter(Boolean));
        return Array.from(statusSet).sort();
    }, [publicProjects]);

    // Applied filter state (triggered by Search button or immediate select)
    const [appliedFilters, setAppliedFilters] = useState({
        location: "",
        type: "",
        status: "",
    });

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        setAppliedFilters({
            location: locationFilter,
            type: typeFilter,
            status: statusFilter,
        });
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("page", "1");
        setSearchParams(nextParams);
    };

    const handleResetFilters = () => {
        setLocationFilter("");
        setTypeFilter("");
        setStatusFilter("");
        setAppliedFilters({ location: "", type: "", status: "" });
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("page");
        setSearchParams(nextParams);
    };

    // Filter projects based on active applied criteria
    const filteredProjects = useMemo(() => {
        return publicProjects.filter((project) => {
            if (
                appliedFilters.location &&
                project.location?.toLowerCase() !== appliedFilters.location.toLowerCase()
            ) {
                return false;
            }
            if (
                appliedFilters.type &&
                project.type?.toLowerCase() !== appliedFilters.type.toLowerCase()
            ) {
                return false;
            }
            if (
                appliedFilters.status &&
                project.status?.toLowerCase() !== appliedFilters.status.toLowerCase()
            ) {
                return false;
            }
            return true;
        });
    }, [publicProjects, appliedFilters]);

    // Client-side sorting
    const sortedProjects = useMemo(() => {
        const list = [...filteredProjects];
        switch (currentSort) {
            case "price_asc":
                return list.sort((a, b) => extractPrice(a) - extractPrice(b));
            case "price_desc":
                return list.sort((a, b) => extractPrice(b) - extractPrice(a));
            case "newest":
                return list.sort((a, b) => extractNewest(b) - extractNewest(a));
            case "size":
                return list.sort((a, b) => extractSize(b) - extractSize(a));
            default:
                return list;
        }
    }, [filteredProjects, currentSort]);

    // Pagination at 12 items per page
    const totalPages = Math.max(1, Math.ceil(sortedProjects.length / ITEMS_PER_PAGE));
    const activePage = Math.min(currentPage, totalPages);

    const paginatedProjects = useMemo(() => {
        const startIdx = (activePage - 1) * ITEMS_PER_PAGE;
        return sortedProjects.slice(startIdx, startIdx + ITEMS_PER_PAGE);
    }, [sortedProjects, activePage]);

    const handleSortChange = (newSort) => {
        const nextParams = new URLSearchParams(searchParams);
        if (newSort && newSort !== "default") {
            nextParams.set("sort", newSort);
        } else {
            nextParams.delete("sort");
        }
        nextParams.set("page", "1");
        setSearchParams(nextParams);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("page", String(newPage));
        setSearchParams(nextParams);
        const section = document.getElementById("all-projects-section");
        if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-base-100 text-base-content font-[Inter,sans-serif]">

            {/* ══════════════════════════════════════════════════════════════
             * 1. HERO SECTION
             * Figma: 1310×870, HORIZONTAL, bg #000f22 overlay
             *   Container: 1280px wide, 48px H pad
             *   Content: 672px wide, vertical, 16px gap
             *     - Red pill "RELIANCE HOUSING LTD." 12px fw=500 #ffffff, bg #a14000
             *     - Heading: "Modern Real Estate & Infrastructure Management." 48px fw=700 white
             *     - Body: 18px fw=400 #e1e3e4
             *     - Integrated Search/Filter bar: white bg r=8, 3 filter cells + search button (#000f22)
             * ══════════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[600px] lg:min-h-[870px] overflow-hidden flex items-center">

                {/* Hero background image */}
                <img
                    src={IMG_HERO}
                    alt="NexusBuild Modern Real Estate"
                    className="absolute inset-0 w-full h-full object-cover select-none"
                />
                {/* Dark overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#000f22]/90 via-[#000f22]/70 to-[#000f22]/30" />

                <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
                    <div className="max-w-[672px] flex flex-col gap-4">

                        {/* Figma: red pill — #a14000 fill, 12px fw=500 white */}
                        <div className="inline-flex self-start">
                            <span className="bg-[#a14000] text-white text-[12px] font-medium px-3 py-1 uppercase tracking-wider rounded-[2px]">
                                {systemSettings?.heroTagline || DEFAULT_SYSTEM_SETTINGS.heroTagline}
                            </span>
                        </div>

                        {/* Figma: Heading 1 — 48px fw=700 white */}
                        <h1 className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold text-white leading-tight tracking-tight">
                            Modern Real Estate &amp; Infrastructure Management.
                        </h1>

                        {/* Figma: body — 18px fw=400 #e1e3e4 */}
                        <p className="text-[16px] lg:text-[18px] font-normal text-[#e1e3e4] leading-relaxed">
                            Precision-engineered living spaces and commercial hubs designed for the next generation. Leveraging GIS technology for unparalleled site accuracy.
                        </p>

                        {/* Integrated Search/Filter Form */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="mt-4 bg-base-100 text-base-content rounded-[8px] shadow-[0px_25px_50px_#00000040] flex flex-col sm:flex-row overflow-hidden border border-base-300"
                        >

                            {/* Filter cell 1: Location */}
                            <div className="flex-1 flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-base-300">
                                <MapPin size={16} className="text-base-content/60 flex-shrink-0" />
                                <div className="flex flex-col w-full">
                                    <span className="text-[10px] font-semibold text-base-content/70 uppercase tracking-wider">Location</span>
                                    <select
                                        value={locationFilter}
                                        onChange={(e) => {
                                            setLocationFilter(e.target.value);
                                            setAppliedFilters(prev => ({ ...prev, location: e.target.value }));
                                        }}
                                        className="text-[14px] font-medium text-base-content bg-base-100 focus:outline-none cursor-pointer w-full"
                                    >
                                        <option value="" className="bg-base-100 text-base-content">All Areas</option>
                                        {locationsList.map(loc => (
                                            <option key={loc} value={loc} className="bg-base-100 text-base-content">{loc}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Filter cell 2: Type */}
                            <div className="flex-1 flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-base-300">
                                <Wrench size={16} className="text-base-content/60 flex-shrink-0" />
                                <div className="flex flex-col w-full">
                                    <span className="text-[10px] font-semibold text-base-content/70 uppercase tracking-wider">Type</span>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => {
                                            setTypeFilter(e.target.value);
                                            setAppliedFilters(prev => ({ ...prev, type: e.target.value }));
                                        }}
                                        className="text-[14px] font-medium text-base-content bg-base-100 focus:outline-none cursor-pointer w-full"
                                    >
                                        <option value="" className="bg-base-100 text-base-content">All Types</option>
                                        {typesList.map(t => (
                                            <option key={t} value={t} className="bg-base-100 text-base-content">{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Filter cell 3: Status */}
                            <div className="flex-1 flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-base-300">
                                <CalendarCheck size={16} className="text-base-content/60 flex-shrink-0" />
                                <div className="flex flex-col w-full">
                                    <span className="text-[10px] font-semibold text-base-content/70 uppercase tracking-wider">Status</span>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setAppliedFilters(prev => ({ ...prev, status: e.target.value }));
                                        }}
                                        className="text-[14px] font-medium text-base-content bg-base-100 focus:outline-none cursor-pointer w-full"
                                    >
                                        <option value="" className="bg-base-100 text-base-content">Any Status</option>
                                        {statusesList.map(s => (
                                            <option key={s} value={s} className="bg-base-100 text-base-content">{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Search button */}
                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-content hover:opacity-90 text-[14px] font-bold transition-opacity duration-200 cursor-pointer min-h-[44px] flex-shrink-0"
                            >
                                <Search size={16} />
                                <span>Search<br className="hidden lg:block" /> Projects</span>
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
             * 2. ALL PROJECTS SECTION (4 CARDS PER ROW, SORTING, PAGINATION, SKELETONS)
             * ══════════════════════════════════════════════════════════════ */}
            <section id="all-projects-section" className="bg-base-100 py-16 lg:py-24 px-6 lg:px-12">
                <div className="max-w-[1280px] mx-auto flex flex-col gap-10">

                    {/* Section header & active filter/sort controls */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-base-300">
                        <div className="flex flex-col gap-2 max-w-xl">
                            <span className="text-[12px] font-semibold text-primary uppercase tracking-wider">
                                Curated Catalog
                            </span>
                            <h2 className="text-[28px] lg:text-[34px] font-bold text-base-content leading-tight">
                                Signature Developments
                            </h2>
                            <p className="text-[15px] font-normal text-base-content/75 leading-relaxed">
                                Explore our portfolio of architectural excellence, from luxury residences to premier commercial spaces.
                            </p>
                        </div>

                        {/* Controls Toolbar: Sort dropdown + Counter + Filter Reset */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-2 bg-base-200/90 px-3.5 py-2 rounded-xl border border-base-300 shadow-sm">
                                <ArrowUpDown size={15} className="text-base-content/70 flex-shrink-0" />
                                <label htmlFor="projects-sort-select" className="text-xs font-semibold text-base-content/70 select-none">Sort:</label>
                                <select
                                    id="projects-sort-select"
                                    value={currentSort}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="bg-transparent text-sm font-semibold text-base-content focus:outline-none cursor-pointer pr-1"
                                >
                                    <option value="default" className="bg-base-100 text-base-content">Featured / Default</option>
                                    <option value="price_asc" className="bg-base-100 text-base-content">Price: Low to High</option>
                                    <option value="price_desc" className="bg-base-100 text-base-content">Price: High to Low</option>
                                    <option value="newest" className="bg-base-100 text-base-content">Newest</option>
                                    <option value="size" className="bg-base-100 text-base-content">Size: Large to Small</option>
                                </select>
                            </div>

                            {/* Reset / All link */}
                            {(appliedFilters.location || appliedFilters.type || appliedFilters.status) ? (
                                <button
                                    onClick={handleResetFilters}
                                    className="flex items-center gap-1.5 text-[13px] font-bold text-primary hover:opacity-80 transition-colors cursor-pointer px-3 py-2 rounded-xl border border-primary/20 bg-primary/5"
                                >
                                    <RotateCcw size={14} />
                                    Reset Filters ({filteredProjects.length})
                                </button>
                            ) : (
                                <span className="text-xs font-semibold text-base-content/60 px-2">
                                    {publicProjects.length} Total Projects
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Skeletons OR Project Grid OR Empty State */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                            {Array.from({ length: 8 }).map((_, idx) => (
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
                                        <div className="space-y-2 pt-2">
                                            <div className="skeleton h-10 w-full bg-base-300 rounded-lg" />
                                            <div className="skeleton h-9 w-full bg-base-300 rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : paginatedProjects.length > 0 ? (
                        <div className="flex flex-col gap-10">
                            {/* 4 Cards per Row Desktop Grid with Equal Heights */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                                {paginatedProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="bg-base-100 border border-base-300 flex flex-col justify-between h-full hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden group"
                                    >
                                        {/* Card image area */}
                                        <div className="relative h-[200px] lg:h-[220px] overflow-hidden flex-shrink-0">
                                            <ImageWithSkeleton
                                                src={project.image}
                                                alt={project.name}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />

                                            {/* Status pill */}
                                            <div className="absolute top-3 left-3">
                                                <span
                                                    className="text-[11px] font-bold text-white px-2.5 py-1 uppercase tracking-wider rounded-[3px] shadow-sm"
                                                    style={{ backgroundColor: project.statusBg || '#000f22' }}
                                                >
                                                    {project.status}
                                                </span>
                                            </div>

                                            {/* Price Tag pill */}
                                            {project.priceRange && (
                                                <div className="absolute bottom-3 right-3">
                                                    <span className="text-[11px] font-bold bg-base-100/90 backdrop-blur-sm text-base-content px-2 py-0.5 rounded shadow-sm">
                                                        {project.priceRange}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card body — equal height flex structure */}
                                        <div className="flex flex-col flex-1 p-5 gap-3 justify-between">
                                            <div className="flex flex-col gap-2">
                                                <h3 className="text-[20px] font-bold text-base-content leading-tight line-clamp-1">
                                                    {project.name}
                                                </h3>

                                                {/* Meta row */}
                                                <div className="flex items-center gap-3 text-[12px] text-base-content/70">
                                                    <span className="flex items-center gap-1 truncate max-w-[130px]">
                                                        <MapPin size={13} className="text-primary flex-shrink-0" />
                                                        <span className="truncate">{project.location}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1 flex-shrink-0">
                                                        <Wrench size={13} className="text-secondary flex-shrink-0" />
                                                        <span>{project.type}</span>
                                                    </span>
                                                </div>

                                                <p className="text-[14px] font-normal text-base-content/75 leading-relaxed line-clamp-2">
                                                    {project.description}
                                                </p>
                                            </div>

                                            {/* Actions pinned at bottom */}
                                            <div className="flex flex-col gap-2 pt-2 border-t border-base-200">
                                                <Link
                                                    to={`/project-details/${project.id}`}
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-content text-[13px] font-bold hover:opacity-90 transition-opacity duration-200 cursor-pointer min-h-[42px] rounded-lg shadow-sm"
                                                >
                                                    Project Details
                                                    <ArrowRight size={14} />
                                                </Link>

                                                <Link
                                                    to="/gismap"
                                                    className="w-full flex items-center justify-center gap-2 py-2 border border-base-300 text-base-content/80 text-[13px] font-medium hover:bg-base-200 hover:text-base-content transition-colors duration-200 cursor-pointer min-h-[40px] rounded-lg"
                                                >
                                                    <MapPin size={13} />
                                                    View Map
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-base-300">
                                    <span className="text-sm text-base-content/70">
                                        Showing <span className="font-semibold text-base-content">{(activePage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-semibold text-base-content">{Math.min(activePage * ITEMS_PER_PAGE, sortedProjects.length)}</span> of <span className="font-semibold text-base-content">{sortedProjects.length}</span> properties
                                    </span>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            disabled={activePage === 1}
                                            onClick={() => handlePageChange(activePage - 1)}
                                            className="px-3 py-1.5 rounded-lg border border-base-300 text-xs font-semibold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-base-200 cursor-pointer transition-colors bg-base-100 text-base-content"
                                            aria-label="Previous Page"
                                        >
                                            <ChevronLeft size={16} />
                                            <span className="hidden sm:inline">Prev</span>
                                        </button>

                                        <div className="flex items-center gap-1 mx-1">
                                            {Array.from({ length: totalPages }).map((_, i) => {
                                                const pNum = i + 1;
                                                const isCurrent = pNum === activePage;
                                                return (
                                                    <button
                                                        key={pNum}
                                                        type="button"
                                                        onClick={() => handlePageChange(pNum)}
                                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                                            isCurrent
                                                                ? 'bg-primary text-primary-content shadow-sm'
                                                                : 'hover:bg-base-200 text-base-content border border-base-300 bg-base-100'
                                                        }`}
                                                        aria-label={`Page ${pNum}`}
                                                        aria-current={isCurrent ? "page" : undefined}
                                                    >
                                                        {pNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            type="button"
                                            disabled={activePage === totalPages}
                                            onClick={() => handlePageChange(activePage + 1)}
                                            className="px-3 py-1.5 rounded-lg border border-base-300 text-xs font-semibold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-base-200 cursor-pointer transition-colors bg-base-100 text-base-content"
                                            aria-label="Next Page"
                                        >
                                            <span className="hidden sm:inline">Next</span>
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Styled Empty State when search returns no projects */
                        <div className="bg-base-200 border border-base-300 p-10 sm:p-14 text-center rounded-2xl flex flex-col items-center justify-center gap-4 my-4">
                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                <Search size={30} />
                            </div>
                            <h3 className="text-[22px] font-bold text-base-content">
                                No projects match your search
                            </h3>
                            <p className="text-[15px] font-normal text-base-content/75 max-w-md leading-relaxed">
                                We couldn't find any developments matching your selected location, type, or status criteria. Try different filters or reset your search.
                            </p>
                            <button
                                onClick={handleResetFilters}
                                className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-content hover:opacity-90 text-[14px] font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                            >
                                <RotateCcw size={16} />
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
             * 3. GIS MAP MODULE
             * ══════════════════════════════════════════════════════════════ */}
            <section className="bg-base-200 border-y border-base-300 h-[120px] lg:h-[160px] flex items-center justify-center px-6">
                <Link
                    to="/gismap"
                    className="text-[14px] font-semibold text-base-content/70 hover:text-base-content uppercase tracking-widest flex items-center gap-2 transition-colors"
                >
                    <MapPin size={16} className="text-primary" />
                    GIS Map Integration — Click to Launch Interactive Map
                </Link>
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
                                className="px-6 py-3.5 bg-white border-2 border-[#fe762a] text-[#fe762a] hover:bg-[#fe762a] hover:text-white text-[13px] font-extrabold transition-colors duration-200 rounded-[4px] cursor-pointer flex items-center gap-1.5"
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
             * 5. ABOUT US SECTION
             * ══════════════════════════════════════════════════════════════ */}
            <section className="bg-base-100 py-16 lg:py-24 px-6 lg:px-12 border-t border-base-300">
                <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

                    {/* Left */}
                    <div className="flex-1 flex flex-col gap-6 max-w-[552px]">
                        <h2 className="text-[28px] lg:text-[32px] font-semibold text-base-content leading-tight">
                            {systemSettings?.heritageHeadline || DEFAULT_SYSTEM_SETTINGS.heritageHeadline}
                        </h2>
                        <p className="text-[16px] lg:text-[18px] font-normal text-base-content/80 leading-relaxed">
                            {systemSettings?.projectsStoryText || DEFAULT_SYSTEM_SETTINGS.projectsStoryText}
                        </p>
                        <p className="text-[16px] font-normal text-base-content/80 leading-relaxed">
                            We don't just build apartments; we architect communities. From the bustling corridors of BB Road to the quiet luxury of riverfront estates, our commitment remains the same: uncompromising quality and absolute transparency.
                        </p>

                        <div className="flex items-start gap-8 pt-4 border-t border-base-300">
                            {[
                                { value: "12+", label: "Years Active" },
                                { value: "150+", label: "Projects Delivered" },
                                { value: "12k+", label: "Families Housed" },
                            ].map(({ value, label }) => (
                                <div key={label} className="flex flex-col gap-1">
                                    <span className="text-[32px] font-bold text-base-content leading-none">{value}</span>
                                    <span className="text-[12px] font-medium text-base-content/70 uppercase tracking-wider">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex-1 relative max-w-[552px] w-full">
                        <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-primary rounded-[12px] z-0" />
                        <div className="relative z-10 w-full aspect-[4/3] overflow-hidden border-[8px] border-base-100 shadow-[0px_20px_25px_#0000001a]">
                            <img
                                src={IMG_ABOUT}
                                alt="Decades of Trust in Narayanganj"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Remodeling Request Modal */}
            {showRemodeling && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-base-100 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-base-300">
                        <div className="bg-primary px-6 py-4 text-primary-content flex justify-between items-center">
                            <h3 className="font-bold text-base">Request Professional Remodeling</h3>
                            <button onClick={() => setShowRemodeling(false)} className="text-primary-content/70 hover:text-primary-content font-bold text-lg cursor-pointer">×</button>
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
                                <label className="block text-xs font-bold text-base-content/70 uppercase mb-1">Your Name *</label>
                                <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 border border-base-300 bg-base-100 rounded text-sm text-base-content focus:outline-none focus:border-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-base-content/70 uppercase mb-1">Phone Number *</label>
                                    <input required type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full px-3 py-2 border border-base-300 bg-base-100 rounded text-sm text-base-content focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-base-content/70 uppercase mb-1">Email Address</label>
                                    <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-3 py-2 border border-base-300 bg-base-100 rounded text-sm text-base-content focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-base-content/70 uppercase mb-1">Plot Size (e.g. 3 Katha)</label>
                                    <input type="text" value={formPlotSize} onChange={e => setFormPlotSize(e.target.value)} className="w-full px-3 py-2 border border-base-300 bg-base-100 rounded text-sm text-base-content focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-base-content/70 uppercase mb-1">Site Location Address</label>
                                    <input type="text" value={formAddress} onChange={e => setFormAddress(e.target.value)} className="w-full px-3 py-2 border border-base-300 bg-base-100 rounded text-sm text-base-content focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-base-content/70 uppercase mb-1">Remodeling Scope Details *</label>
                                <textarea required value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={3} placeholder="Please detail the modifications or redesign you need..." className="w-full px-3 py-2 border border-base-300 bg-base-100 rounded text-sm text-base-content focus:outline-none focus:border-primary"></textarea>
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowRemodeling(false)} className="px-4 py-2 border border-base-300 text-base-content/80 rounded text-xs font-bold hover:bg-base-200 cursor-pointer">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-primary hover:opacity-90 text-primary-content rounded text-xs font-bold cursor-pointer">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Site Visit Schedule Modal */}
            {showSiteVisit && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-base-100 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-base-300">
                        <div className="bg-primary px-6 py-4 text-primary-content flex justify-between items-center">
                            <h3 className="font-bold text-base">Schedule Site Visit</h3>
                            <button onClick={() => setShowSiteVisit(false)} className="text-primary-content/70 hover:text-primary-content font-bold text-lg cursor-pointer">×</button>
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
                                <label className="block text-xs font-bold text-base-content/70 uppercase mb-1">Your Name *</label>
                                <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 border border-base-300 bg-base-100 rounded text-sm text-base-content focus:outline-none focus:border-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-base-content/70 uppercase mb-1">Phone Number *</label>
                                    <input required type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full px-3 py-2 border border-base-300 bg-base-100 rounded text-sm text-base-content focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-base-content/70 uppercase mb-1">Email Address</label>
                                    <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-3 py-2 border border-base-300 bg-base-100 rounded text-sm text-base-content focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-base-content/70 uppercase mb-1">Select Project to Visit *</label>
                                <select value={formProject} onChange={e => setFormProject(e.target.value)} className="w-full px-3 py-2 border border-base-300 bg-base-100 rounded text-sm text-base-content focus:outline-none">
                                    <option value="Sardar Tower – Block A">Sardar Tower (Chashiara)</option>
                                    <option value="Shapla Green Fields">Shapla Green Fields (Chashiara)</option>
                                    <option value="Shamabai Biponi Bitan">Shamabai Biponi Bitan (Narayanganj Sadar)</option>
                                    <option value="Bhuiyan Heights">Bhuiyan Heights (Narayanganj Sadar)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-base-content/70 uppercase mb-1">Preferred Date &amp; Notes *</label>
                                <textarea required value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={3} placeholder="Please mention preferred date/time and any specific instructions..." className="w-full px-3 py-2 border border-base-300 bg-base-100 rounded text-sm text-base-content focus:outline-none focus:border-primary"></textarea>
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowSiteVisit(false)} className="px-4 py-2 border border-base-300 text-base-content/80 rounded text-xs font-bold hover:bg-base-200 cursor-pointer">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-primary hover:opacity-90 text-primary-content rounded text-xs font-bold cursor-pointer">Schedule Visit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* General Inquiry Modal */}
            {showGeneralInquiry && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-base-100 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-base-300">
                        <div className="bg-primary px-6 py-4 text-primary-content flex justify-between items-center">
                            <h3 className="font-bold text-base">Submit General Inquiry</h3>
                            <button onClick={() => setShowGeneralInquiry(false)} className="text-primary-content/70 hover:text-primary-content font-bold text-lg cursor-pointer">×</button>
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
                                <label className="block text-xs font-bold text-base-content/70 uppercase mb-1">Your Name *</label>
                                <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 border border-base-300 bg-base-100 rounded text-sm text-base-content focus:outline-none focus:border-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-base-content/70 uppercase mb-1">Phone Number *</label>
                                    <input required type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full px-3 py-2 border border-base-300 bg-base-100 rounded text-sm text-base-content focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-base-content/70 uppercase mb-1">Email Address</label>
                                    <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-3 py-2 border border-base-300 bg-base-100 rounded text-sm text-base-content focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-base-content/70 uppercase mb-1">Inquiry / Message *</label>
                                <textarea required value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={4} placeholder="Please type your message or question here..." className="w-full px-3 py-2 border border-base-300 bg-base-100 rounded text-sm text-base-content focus:outline-none focus:border-primary"></textarea>
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowGeneralInquiry(false)} className="px-4 py-2 border border-base-300 text-base-content/80 rounded text-xs font-bold hover:bg-base-200 cursor-pointer">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-primary hover:opacity-90 text-primary-content rounded text-xs font-bold cursor-pointer">Submit Inquiry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
import { useState } from "react";
import { useParams, Link } from "react-router";
import {
    MapPin, Building, CheckCircle2,
    ArrowLeft, Compass, Mail, ShieldCheck, Tag, Layers, ArrowRight
} from "lucide-react";
import Navbar from "../../Components/Header/Navbar";
import Footer from "../../Components/Footer/Footer";
import { useDatabase } from "../../Context/DatabaseContext";
import { DEFAULT_SYSTEM_SETTINGS } from "../../config/defaultSettings";

// ─── Project Details Page ─────────────────────────────────────────────────────
// Displays comprehensive information for an individual project.
// Styled consistently with Blueprint OS design tokens (#000f22, #fe762a, #f8f9fa).
// ─────────────────────────────────────────────────────────────────────────────

const ImageWithSkeleton = ({ src, alt, className }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className="relative w-full h-full overflow-hidden bg-[#0a2540]">
            {!loaded && <div className="skeleton absolute inset-0 w-full h-full bg-[#191c1d]" />}
            <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
};

const ProjectDetails = () => {
    const { id } = useParams();
    const { publicProjects, systemSettings } = useDatabase();
    
    const project = publicProjects.find(p => 
        String(p.id).toLowerCase() === String(id).toLowerCase() || 
        (p.slug && String(p.slug).toLowerCase() === String(id).toLowerCase())
    );

    const [activeImage, setActiveImage] = useState(0);

    // If project ID is invalid or not found
    if (!project) {
        return (
            <div className="flex flex-col min-h-screen bg-base-200 text-base-content font-[Inter,sans-serif]">
                <Navbar />
                <main className="flex-grow flex items-center justify-center py-20 px-6">
                    <div className="max-w-md w-full bg-base-100 border border-base-300 p-8 text-center rounded-[8px] shadow-sm">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building size={32} />
                        </div>
                        <h2 className="text-[24px] font-bold text-base-content mb-2">Project Not Found</h2>
                        <p className="text-[14px] text-base-content/75 mb-6">
                            The project you are looking for does not exist or may have been moved.
                        </p>
                        <Link
                            to="/projects"
                            className="inline-flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-primary-content text-[14px] font-bold px-6 py-3 rounded-[4px] transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to Projects
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Authoritative gallery images list saved by admin
    const galleryImages = (project.gallery && Array.isArray(project.gallery) && project.gallery.length > 0)
        ? project.gallery.filter(Boolean)
        : (project.image ? [project.image] : []);

    // Safeguard activeImage index bounds
    const activeImageIndex = activeImage >= galleryImages.length ? 0 : activeImage;

    return (
        <div className="flex flex-col min-h-screen bg-base-200 text-base-content font-[Inter,sans-serif]">
            <Navbar />

            {/* ══ 1. TOP NAVIGATION / BREADCRUMB ════════════════════════════════ */}
            <div className="bg-[#000f22] text-white border-b border-white/10">
                <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#e1e3e4] hover:text-[#fe762a] transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to All Projects
                    </Link>
                    <span className="text-[12px] font-medium text-[#768dad] uppercase tracking-wider hidden sm:inline-block">
                        Project ID: #{project.id} · {project.location}
                    </span>
                </div>
            </div>

            {/* ══ 2. PROJECT HERO & GALLERY ════════════════════════════════════ */}
            <section className="bg-[#000f22] py-8 lg:py-12 px-6 lg:px-12 relative overflow-hidden">
                {/* Background blueprint grid */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: [
                            'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                            'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                        ].join(','),
                        backgroundSize: '40px 40px',
                    }}
                />

                <div className="max-w-[1280px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Gallery & Main Image (7 cols on desktop) */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        {/* Main Featured Image */}
                        <div className="relative aspect-[16/10] bg-[#0a2540] rounded-[6px] overflow-hidden border border-white/10 shadow-lg">
                            <ImageWithSkeleton
                                src={galleryImages[activeImageIndex]}
                                alt={project.name}
                                className="w-full h-full object-cover"
                            />
                            {/* Status badge */}
                            <div className="absolute top-4 left-4 z-10">
                                <span
                                    className="text-[12px] font-bold text-white px-3.5 py-1.5 uppercase tracking-wider shadow-md rounded-[2px]"
                                    style={{ backgroundColor: project.statusBg }}
                                >
                                    {project.status}
                                </span>
                            </div>
                        </div>

                        {/* Gallery Thumbnails */}
                        {galleryImages.length > 1 && (
                            <div className="flex items-center gap-3 overflow-x-auto pb-2">
                                {galleryImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`relative w-24 h-16 rounded-[4px] overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                                            activeImageIndex === idx
                                                ? "border-[#fe762a] scale-105"
                                                : "border-transparent opacity-60 hover:opacity-100"
                                        }`}
                                    >
                                        <ImageWithSkeleton src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Quick Highlights (5 cols on desktop) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 text-white">
                        <div>
                            {/* Category pill */}
                            <span className="bg-[#fe762a] text-[#5e2200] text-[11px] font-bold px-3 py-1 uppercase tracking-wider rounded-[2px] inline-block mb-3">
                                {project.type} Development
                            </span>

                            <h1 className="text-[32px] sm:text-[40px] font-bold leading-tight text-white mb-2">
                                {project.name}
                            </h1>

                            <p className="text-[14px] text-[#768dad] flex items-center gap-2 mb-4">
                                <MapPin size={16} className="text-[#fe762a]" />
                                {project.fullAddress || project.location}
                            </p>
                        </div>

                        {/* Price tag block */}
                        {project.priceRange && (
                            <div className="bg-[#0a2540] border border-white/10 p-4 rounded-[4px] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Tag size={18} className="text-[#fe762a]" />
                                    <span className="text-[12px] font-medium text-[#768dad] uppercase tracking-wider">Estimated Valuation</span>
                                </div>
                                <span className="text-[20px] font-bold text-white">{project.priceRange}</span>
                            </div>
                        )}

                        {/* Short Description */}
                        <p className="text-[16px] text-[#e1e3e4] leading-relaxed">
                            {project.description}
                        </p>

                        {/* CTA Quick Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Link
                                to="/contact"
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#fe762a] hover:bg-[#a14000] text-[#5e2200] hover:text-white font-bold text-[14px] py-3.5 px-6 rounded-[4px] transition-colors min-h-[48px]"
                            >
                                <Mail size={16} />
                                Inquire Property
                            </Link>

                            <Link
                                to="/gismap"
                                className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/50 text-white font-bold text-[14px] py-3.5 px-6 rounded-[4px] transition-colors min-h-[48px]"
                            >
                                <Compass size={16} className="text-[#fe762a]" />
                                View on GIS Map
                            </Link>
                        </div>
                    </div>

                </div>
            </section>

            {/* ══ 3. DETAILED CONTENT SECTION ══════════════════════════════════ */}
            <main className="py-12 lg:py-16 px-6 lg:px-12">
                <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column: Full Overview & Features (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-10">

                        {/* Detailed Description */}
                        <div className="bg-base-100 border border-base-300 p-6 lg:p-8 rounded-[6px] flex flex-col gap-4 text-base-content">
                            <h2 className="text-[22px] font-bold text-base-content border-b border-base-300 pb-3 flex items-center gap-2">
                                <Building size={20} className="text-primary" />
                                Project Overview
                            </h2>
                            <p className="text-[16px] text-base-content/85 leading-relaxed whitespace-pre-line">
                                {project.fullDescription || project.description}
                            </p>
                        </div>

                        {/* Key Features & Amenities checklist */}
                        {project.features && project.features.length > 0 && (
                            <div className="bg-base-100 border border-base-300 p-6 lg:p-8 rounded-[6px] flex flex-col gap-6 text-base-content">
                                <h2 className="text-[22px] font-bold text-base-content border-b border-base-300 pb-3 flex items-center gap-2">
                                    <ShieldCheck size={20} className="text-primary" />
                                    Features &amp; Infrastructure Amenities
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {project.features.map((feature, idx) => (
                                         <div key={idx} className="flex items-start gap-3 p-3 bg-base-200 border border-base-300 rounded-[4px]">
                                            <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                                            <span className="text-[14px] font-medium text-base-content leading-snug">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column: Technical Specifications & Contact Card (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {/* Specifications Card */}
                        {project.specs && project.specs.length > 0 && (
                            <div className="bg-base-100 border border-base-300 p-6 rounded-[6px] flex flex-col gap-4 text-base-content">
                                <h3 className="text-[18px] font-bold text-base-content border-b border-base-300 pb-3 flex items-center gap-2">
                                    <Layers size={18} className="text-primary" />
                                    Technical Specifications
                                </h3>

                                <div className="flex flex-col divide-y divide-base-300">
                                    {project.specs.map((spec, idx) => (
                                        <div key={idx} className="py-3 flex flex-col gap-0.5">
                                            <span className="text-[11px] font-semibold text-base-content/70 uppercase tracking-wider">
                                                {spec.label}
                                            </span>
                                            <span className="text-[15px] font-semibold text-base-content">
                                                {spec.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Support / Inspection Card */}
                        <div className="bg-[#000f22] text-white p-6 rounded-[6px] flex flex-col gap-4">
                            <h3 className="text-[18px] font-bold text-white leading-tight">
                                Schedule a Site Visit
                            </h3>
                            <p className="text-[13px] text-[#768dad] leading-relaxed">
                                Experience {project.name} in person. Book an appointment with our project engineers and client representatives.
                            </p>
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center gap-2 bg-[#fe762a] hover:bg-[#a14000] text-[#5e2200] hover:text-white font-bold text-[14px] py-3.5 px-4 rounded-[4px] transition-colors mt-2"
                            >
                                Contact {systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName}
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProjectDetails;

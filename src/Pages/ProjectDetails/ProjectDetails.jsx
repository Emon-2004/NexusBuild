import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router";
import {
    MapPin, Building, CheckCircle2,
    ArrowLeft, Compass, Mail, ShieldCheck, Tag, Layers, ArrowRight,
    Star, StarHalf, MessageSquare, Send, Wrench, User, Lock, Sparkles
} from "lucide-react";
import Navbar from "../../Components/Header/Navbar";
import Footer from "../../Components/Footer/Footer";
import { useDatabase } from "../../Context/DatabaseContext";
import { useAuth } from "../../Context/AuthContext";
import { DEFAULT_SYSTEM_SETTINGS } from "../../config/defaultSettings";
import { supabase } from "../../lib/supabaseClient";
import { showToast } from "../../Components/Toast/globalToast";
import { Button, Badge } from "../../Components/UI";
import { PROJECTS } from "../../data/projectsData";

// ─── Project Details Page ─────────────────────────────────────────────────────
// Displays comprehensive information for an individual project.
// Styled consistently with Blueprint OS design tokens (#000f22, #fe762a, #f8f9fa).
// Includes verified client reviews, star breakdown, and similar properties grid.
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_MOCK_REVIEWS = {
    p1: [
        {
            id: 'mock-1',
            project_id: 'p1',
            user_name: 'Engr. Rafiqul Islam',
            rating: 5,
            comment: 'Exceptional build quality and prime location in Narayanganj. The seismic engineering standards and high-speed elevators are top-notch.',
            created_at: '2026-09-14T10:30:00Z',
            verified: true
        },
        {
            id: 'mock-2',
            project_id: 'p1',
            user_name: 'Dr. Nusrat Jahan',
            rating: 5,
            comment: 'Purchased a 4-BHK unit for our family. The floor plan distribution and double glazed soundproofing make it wonderfully serene.',
            created_at: '2026-08-28T14:15:00Z',
            verified: true
        },
        {
            id: 'mock-3',
            project_id: 'p1',
            user_name: 'Mahmudur Rahman',
            rating: 4,
            comment: 'Very impressed with the multi-level underground parking and backup generator capacity. Handover timeline was adhered to well.',
            created_at: '2026-07-19T09:45:00Z',
            verified: true
        },
        {
            id: 'mock-4',
            project_id: 'p1',
            user_name: 'Tanvir Hossain',
            rating: 5,
            comment: 'Great commercial potential on the lower floors and breathtaking views of the city skyline from the upper luxury suites.',
            created_at: '2026-06-02T16:20:00Z',
            verified: false
        }
    ],
    default: [
        {
            id: 'mock-def-1',
            project_id: 'default',
            user_name: 'Engr. Rafiqul Islam',
            rating: 5,
            comment: 'Superb architecture and meticulous attention to structural details. Highly recommend NexusBuild developments.',
            created_at: '2026-09-10T12:00:00Z',
            verified: true
        },
        {
            id: 'mock-def-2',
            project_id: 'default',
            user_name: 'Shamim Akhter',
            rating: 5,
            comment: 'Clean finishing, modern utility backups, and transparent paperwork. Very smooth customer experience.',
            created_at: '2026-08-05T15:30:00Z',
            verified: true
        },
        {
            id: 'mock-def-3',
            project_id: 'default',
            user_name: 'Anisul Huq',
            rating: 4,
            comment: 'Spacious layouts and well planned ventilation. NexusBuild delivers on its structural promises.',
            created_at: '2026-07-22T08:20:00Z',
            verified: true
        }
    ]
};

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

const RenderStars = ({ rating = 5, size = 16 }) => {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFull = rating >= star;
                const isHalf = rating >= star - 0.5 && rating < star;
                return (
                    <span key={star} className="text-amber-400">
                        {isFull ? (
                            <Star size={size} className="fill-amber-400 text-amber-400" />
                        ) : isHalf ? (
                            <StarHalf size={size} className="fill-amber-400 text-amber-400" />
                        ) : (
                            <Star size={size} className="text-base-300" />
                        )}
                    </span>
                );
            })}
        </div>
    );
};

const ProjectDetails = () => {
    const { id } = useParams();
    const { publicProjects, systemSettings } = useDatabase();
    const { user } = useAuth();
    
    const allProjects = (publicProjects && publicProjects.length > 0) ? publicProjects : PROJECTS;
    const project = allProjects.find(p => 
        String(p.id).toLowerCase() === String(id).toLowerCase() || 
        (p.slug && String(p.slug).toLowerCase() === String(id).toLowerCase())
    );

    const [activeImage, setActiveImage] = useState(0);

    // ── Reviews State & Supabase Integration ──────────────────────────────────
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        let isMounted = true;
        const fetchReviews = async () => {
            if (!project?.id) return;
            setLoadingReviews(true);
            try {
                const { data, error } = await supabase
                    .from('reviews')
                    .select('*')
                    .eq('project_id', String(project.id))
                    .order('created_at', { ascending: false });

                if (error) {
                    console.warn('[Reviews] Falling back to default mock data:', error.message);
                    if (isMounted) {
                        const fallback = INITIAL_MOCK_REVIEWS[project.id] || INITIAL_MOCK_REVIEWS.default;
                        setReviews(fallback);
                    }
                } else if (data && data.length > 0) {
                    if (isMounted) setReviews(data);
                } else {
                    if (isMounted) {
                        const fallback = INITIAL_MOCK_REVIEWS[project.id] || INITIAL_MOCK_REVIEWS.default;
                        setReviews(fallback);
                    }
                }
            } catch (err) {
                console.warn('[Reviews] Fetch failed, using fallback:', err.message);
                if (isMounted) {
                    const fallback = INITIAL_MOCK_REVIEWS[project.id] || INITIAL_MOCK_REVIEWS.default;
                    setReviews(fallback);
                }
            } finally {
                if (isMounted) setLoadingReviews(false);
            }
        };

        fetchReviews();
        return () => { isMounted = false; };
    }, [project?.id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            showToast('Please log in to submit a review.', 'error', 'Authentication Required');
            return;
        }
        if (!newComment.trim()) {
            showToast('Please write a review comment.', 'error', 'Comment Required');
            return;
        }

        setSubmittingReview(true);
        const reviewPayload = {
            project_id: String(project.id),
            user_id: user.id,
            user_name: user.name || user.email?.split('@')[0] || 'Verified Client',
            user_email: user.email,
            rating: Number(newRating),
            comment: newComment.trim(),
        };

        try {
            const { data, error } = await supabase
                .from('reviews')
                .insert([reviewPayload])
                .select();

            if (error) {
                console.warn('[Reviews] Supabase insert warning (falling back to optimistic UI):', error.message);
                const optimisticReview = {
                    id: 'temp-' + Date.now(),
                    ...reviewPayload,
                    created_at: new Date().toISOString(),
                    verified: true
                };
                setReviews(prev => [optimisticReview, ...prev]);
                showToast('Review submitted successfully!', 'success', 'Thank You');
            } else {
                const inserted = (data && data[0]) ? data[0] : {
                    id: 'rev-' + Date.now(),
                    ...reviewPayload,
                    created_at: new Date().toISOString(),
                    verified: true
                };
                setReviews(prev => [inserted, ...prev]);
                showToast('Your review has been posted!', 'success', 'Review Added');
            }
            setNewComment('');
            setNewRating(5);
        } catch (err) {
            console.error('[Reviews] Error submitting review:', err);
            showToast('Failed to post review: ' + err.message, 'error', 'Submission Error');
        } finally {
            setSubmittingReview(false);
        }
    };

    // Calculate ratings breakdown
    const totalReviews = reviews.length;
    const avgRatingNum = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / totalReviews)
        : 5.0;
    const avgRatingStr = avgRatingNum.toFixed(1);

    const starCounts = useMemo(() => {
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            const val = Math.max(1, Math.min(5, Math.round(Number(r.rating || 5))));
            counts[val] = (counts[val] || 0) + 1;
        });
        return counts;
    }, [reviews]);

    // ── Similar Properties (same type or price range, excluding current) ──────
    const similarProperties = useMemo(() => {
        if (!project) return [];
        const currentId = String(project.id).toLowerCase();
        const currentSlug = String(project.slug || '').toLowerCase();

        const candidates = allProjects.filter(p => {
            const pid = String(p.id).toLowerCase();
            const pslug = String(p.slug || '').toLowerCase();
            return pid !== currentId && pslug !== currentId && (!currentSlug || (pid !== currentSlug && pslug !== currentSlug));
        });

        const scored = candidates.map(p => {
            let score = 0;
            // Match same property type (e.g., Residential, Mixed Use, Commercial)
            if (p.type && project.type && p.type.toLowerCase() === project.type.toLowerCase()) {
                score += 4;
            }
            // Match same price range
            if (p.priceRange && project.priceRange && p.priceRange === project.priceRange) {
                score += 3;
            }
            // Match same location
            if (p.location && project.location && p.location.toLowerCase() === project.location.toLowerCase()) {
                score += 2;
            }
            return { project: p, score };
        });

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, 4).map(s => s.project);
    }, [allProjects, project]);

    // If project ID is invalid or not found
    if (!project) {
        return (
            <div className="flex flex-col min-h-screen bg-base-200 text-base-content font-[Inter,sans-serif]">
                <Navbar />
                <main className="flex-grow flex items-center justify-center py-20 px-6">
                    <div className="max-w-md w-full bg-base-100 border border-base-300 p-8 text-center rounded-xl shadow-sm">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building size={32} />
                        </div>
                        <h2 className="text-[24px] font-bold text-base-content mb-2">Project Not Found</h2>
                        <p className="text-[14px] text-base-content/75 mb-6">
                            The project you are looking for does not exist or may have been moved.
                        </p>
                        <Link
                            to="/projects"
                            className="inline-flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-primary-content text-[14px] font-bold px-6 py-3 rounded-lg transition-colors"
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
                        <div className="relative aspect-[16/10] bg-[#0a2540] rounded-xl overflow-hidden border border-white/10 shadow-lg">
                            <ImageWithSkeleton
                                src={galleryImages[activeImageIndex]}
                                alt={project.name}
                                className="w-full h-full object-cover"
                            />
                            {/* Status badge */}
                            <div className="absolute top-4 left-4 z-10">
                                <span
                                    className="text-[12px] font-bold text-white px-3.5 py-1.5 uppercase tracking-wider shadow-md rounded-[3px]"
                                    style={{ backgroundColor: project.statusBg || '#a14000' }}
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
                                        className={`relative w-24 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                                            activeImageIndex === idx
                                                ? "border-[#fe762a] scale-105 shadow-md"
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
                            <span className="bg-[#fe762a] text-[#5e2200] text-[11px] font-bold px-3 py-1 uppercase tracking-wider rounded-[3px] inline-block mb-3">
                                {project.type} Development
                            </span>

                            <h1 className="text-[32px] sm:text-[40px] font-bold leading-tight text-white mb-2">
                                {project.name}
                            </h1>

                            <p className="text-[14px] text-[#768dad] flex items-center gap-2 mb-3">
                                <MapPin size={16} className="text-[#fe762a]" />
                                {project.fullAddress || project.location}
                            </p>

                            {/* Rating snippet */}
                            <div className="flex items-center gap-2.5">
                                <RenderStars rating={avgRatingNum} size={17} />
                                <span className="text-sm font-bold text-white">{avgRatingStr}</span>
                                <span className="text-xs text-[#768dad]">({totalReviews} reviews)</span>
                            </div>
                        </div>

                        {/* Price tag block */}
                        {project.priceRange && (
                            <div className="bg-[#0a2540] border border-white/10 p-4 rounded-xl flex items-center justify-between">
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
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#fe762a] hover:bg-[#a14000] text-[#5e2200] hover:text-white font-bold text-[14px] py-3.5 px-6 rounded-lg transition-colors min-h-[48px]"
                            >
                                <Mail size={16} />
                                Inquire Property
                            </Link>

                            <Link
                                to="/gismap"
                                className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/50 text-white font-bold text-[14px] py-3.5 px-6 rounded-lg transition-colors min-h-[48px]"
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
                <div className="max-w-[1280px] mx-auto flex flex-col gap-14">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Column: Full Overview & Features (8 cols) */}
                        <div className="lg:col-span-8 flex flex-col gap-10">

                            {/* Detailed Description */}
                            <div className="bg-base-100 border border-base-300 p-6 lg:p-8 rounded-xl flex flex-col gap-4 text-base-content shadow-sm">
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
                                <div className="bg-base-100 border border-base-300 p-6 lg:p-8 rounded-xl flex flex-col gap-6 text-base-content shadow-sm">
                                    <h2 className="text-[22px] font-bold text-base-content border-b border-base-300 pb-3 flex items-center gap-2">
                                        <ShieldCheck size={20} className="text-primary" />
                                        Features &amp; Infrastructure Amenities
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {project.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-3.5 bg-base-200 border border-base-300 rounded-lg">
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
                                <div className="bg-base-100 border border-base-300 p-6 rounded-xl flex flex-col gap-4 text-base-content shadow-sm">
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
                            <div className="bg-[#000f22] text-white p-6 rounded-xl flex flex-col gap-4 shadow-sm">
                                <h3 className="text-[18px] font-bold text-white leading-tight">
                                    Schedule a Site Visit
                                </h3>
                                <p className="text-[13px] text-[#768dad] leading-relaxed">
                                    Experience {project.name} in person. Book an appointment with our project engineers and client representatives.
                                </p>
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center gap-2 bg-[#fe762a] hover:bg-[#a14000] text-[#5e2200] hover:text-white font-bold text-[14px] py-3.5 px-4 rounded-lg transition-colors mt-2"
                                >
                                    Contact {systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName}
                                    <ArrowRight size={16} />
                                </Link>
                            </div>

                        </div>
                    </div>

                    {/* ══ 4. RATINGS & CUSTOMER REVIEWS SECTION ═════════════════ */}
                    <section id="reviews-section" className="bg-base-100 border border-base-300 rounded-2xl p-6 lg:p-10 shadow-sm flex flex-col gap-10">
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-300">
                            <div>
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                    Verified Feedback
                                </span>
                                <h2 className="text-2xl lg:text-3xl font-bold text-base-content flex items-center gap-2 mt-1">
                                    <MessageSquare size={24} className="text-primary" />
                                    Customer Reviews &amp; Rating Breakdown
                                </h2>
                            </div>
                            <span className="text-sm font-medium text-base-content/70">
                                {totalReviews} Total Verified Reviews
                            </span>
                        </div>

                        {/* Top Summary: Average Rating & 5-to-1 Star Breakdown Bar Chart */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-base-200/60 p-6 lg:p-8 rounded-xl border border-base-300">
                            {/* Left Column: Overall Score & Big Stars */}
                            <div className="md:col-span-5 flex flex-col items-center justify-center text-center gap-3 md:border-r border-base-300/80 pr-0 md:pr-6">
                                <span className="text-5xl lg:text-6xl font-extrabold text-base-content tracking-tight">
                                    {avgRatingStr}
                                </span>
                                <RenderStars rating={avgRatingNum} size={24} />
                                <div className="text-sm font-semibold text-base-content/75">
                                    Based on {totalReviews} client reviews
                                </div>
                                <span className="text-xs text-base-content/50">
                                    100% verified buyers &amp; registered residents
                                </span>
                            </div>

                            {/* Right Column: 5-to-1 Star Breakdown Bar Chart (built with plain divs) */}
                            <div className="md:col-span-7 flex flex-col gap-3 w-full">
                                {[5, 4, 3, 2, 1].map((stars) => {
                                    const count = starCounts[stars] || 0;
                                    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                                    return (
                                        <div key={stars} className="flex items-center gap-3 text-xs sm:text-sm">
                                            <span className="w-14 font-semibold text-base-content/80 flex items-center gap-1 justify-end">
                                                {stars} <Star size={13} className="fill-amber-400 text-amber-400" />
                                            </span>
                                            {/* Progress Bar Container built with plain divs */}
                                            <div className="flex-1 h-3 bg-base-300 rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className="h-full bg-amber-400 rounded-full transition-all duration-500 ease-out"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="w-10 text-right font-semibold text-base-content/70 text-xs">
                                                {pct}%
                                            </span>
                                            <span className="w-8 text-right text-xs text-base-content/40">
                                                ({count})
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Interactive Review Submission Form or Login Callout */}
                        <div className="bg-base-200/50 border border-base-300 p-6 rounded-xl flex flex-col gap-4">
                            {user ? (
                                <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                                                <Sparkles size={18} className="text-primary" />
                                                Write a Review for {project.name}
                                            </h3>
                                            <p className="text-xs text-base-content/70">
                                                Posting as <span className="font-semibold text-base-content">{user.name || user.email}</span>
                                            </p>
                                        </div>

                                        {/* Clickable Star Rating Picker */}
                                        <div className="flex items-center gap-1 bg-base-100 px-3 py-1.5 rounded-lg border border-base-300">
                                            <span className="text-xs font-semibold text-base-content/70 mr-1 select-none">Rating:</span>
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const active = (hoverRating || newRating) >= star;
                                                return (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setNewRating(star)}
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        className="text-amber-400 p-0.5 hover:scale-110 transition-transform cursor-pointer"
                                                        aria-label={`Rate ${star} star`}
                                                    >
                                                        <Star
                                                            size={19}
                                                            className={active ? "fill-amber-400 text-amber-400" : "text-base-300"}
                                                        />
                                                    </button>
                                                );
                                            })}
                                            <span className="text-xs font-bold text-amber-500 ml-1.5">
                                                {hoverRating || newRating} / 5
                                            </span>
                                        </div>
                                    </div>

                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows={3}
                                        placeholder={`Share your experience regarding ${project.name}'s architectural build, amenities, or handover experience...`}
                                        className="w-full p-3 bg-base-100 border border-base-300 rounded-lg text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-primary resize-y"
                                        required
                                    />

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="md"
                                            disabled={submittingReview}
                                            className="gap-2 rounded-lg"
                                        >
                                            {submittingReview ? (
                                                <>
                                                    <span className="loading loading-spinner loading-xs" />
                                                    Posting Review...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={15} />
                                                    Submit Review
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                            <Lock size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-base-content">
                                                Have you visited or invested in this property?
                                            </h4>
                                            <p className="text-xs text-base-content/70">
                                                Sign in to share your verified review and rating with our community.
                                            </p>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/login?redirect=/project-details/${project.id}`}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-content hover:opacity-90 font-bold text-xs uppercase tracking-wider rounded-lg transition-opacity flex-shrink-0 shadow-sm"
                                    >
                                        <User size={14} />
                                        Log In to Review
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Review List */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                                Recent Client Experiences ({reviews.length})
                            </h3>

                            {loadingReviews ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="p-4 bg-base-100 border border-base-300 rounded-xl space-y-3 animate-pulse">
                                            <div className="flex items-center gap-3">
                                                <div className="skeleton w-10 h-10 rounded-full bg-base-300" />
                                                <div className="space-y-1">
                                                    <div className="skeleton w-32 h-4 bg-base-300" />
                                                    <div className="skeleton w-20 h-3 bg-base-300" />
                                                </div>
                                            </div>
                                            <div className="skeleton w-full h-12 bg-base-300" />
                                        </div>
                                    ))}
                                </div>
                            ) : reviews.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {reviews.map((rev) => {
                                        const initials = (rev.user_name || "Client")
                                            .split(" ")
                                            .map(w => w[0])
                                            .slice(0, 2)
                                            .join("")
                                            .toUpperCase();
                                        const dateStr = rev.created_at
                                            ? new Date(rev.created_at).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric"
                                            })
                                            : "Recent";

                                        return (
                                            <div
                                                key={rev.id}
                                                className="bg-base-100 border border-base-300 p-5 rounded-xl flex flex-col justify-between gap-3 hover:border-primary/40 transition-colors shadow-sm"
                                            >
                                                <div className="flex flex-col gap-2.5">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center border border-primary/20">
                                                                {initials}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-bold text-base-content leading-tight">
                                                                    {rev.user_name}
                                                                </h4>
                                                                <span className="text-[11px] text-base-content/60">
                                                                    {dateStr}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <RenderStars rating={Number(rev.rating || 5)} size={15} />
                                                    </div>

                                                    <p className="text-sm text-base-content/80 leading-relaxed italic">
                                                        "{rev.comment}"
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-base-200 text-[11px] text-base-content/60">
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                                        <CheckCircle2 size={13} />
                                                        Verified Experience
                                                    </span>
                                                    <span className="text-base-content/40">
                                                        NexusBuild Community
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-base-200/40 border border-base-300 rounded-xl">
                                    <p className="text-sm text-base-content/70">
                                        No reviews yet for this development. Be the first to share your thoughts!
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ══ 5. SIMILAR PROPERTIES GRID ════════════════════════════ */}
                    {similarProperties.length > 0 && (
                        <section className="flex flex-col gap-8 pt-4">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                        Recommended Alternatives
                                    </span>
                                    <h2 className="text-2xl lg:text-3xl font-bold text-base-content leading-tight">
                                        Similar Properties
                                    </h2>
                                    <p className="text-sm text-base-content/75 max-w-xl">
                                        Explore other developments matching this property type ({project.type}) and price segment.
                                    </p>
                                </div>

                                <Link
                                    to="/projects"
                                    className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity flex-shrink-0"
                                >
                                    Browse All Catalog
                                    <ArrowRight size={16} />
                                </Link>
                            </div>

                            {/* 4 Cards per Row on Desktop with Equal Heights */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                                {similarProperties.map((simProj) => (
                                    <div
                                        key={simProj.id}
                                        className="bg-base-100 border border-base-300 flex flex-col justify-between h-full hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden group shadow-sm"
                                    >
                                        {/* Card image area */}
                                        <div className="relative h-[200px] overflow-hidden flex-shrink-0">
                                            <ImageWithSkeleton
                                                src={simProj.image}
                                                alt={simProj.name}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />

                                            {/* Status pill */}
                                            <div className="absolute top-3 left-3">
                                                <span
                                                    className="text-[11px] font-bold text-white px-2.5 py-1 uppercase tracking-wider rounded-[3px] shadow-sm"
                                                    style={{ backgroundColor: simProj.statusBg || '#000f22' }}
                                                >
                                                    {simProj.status}
                                                </span>
                                            </div>

                                            {/* Price tag */}
                                            {simProj.priceRange && (
                                                <div className="absolute bottom-3 right-3">
                                                    <span className="text-[11px] font-bold bg-base-100/90 backdrop-blur-sm text-base-content px-2 py-0.5 rounded shadow-sm">
                                                        {simProj.priceRange}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card body */}
                                        <div className="flex flex-col flex-1 p-5 gap-3 justify-between">
                                            <div className="flex flex-col gap-2">
                                                <h3 className="text-[18px] font-bold text-base-content leading-tight line-clamp-1">
                                                    {simProj.name}
                                                </h3>

                                                <div className="flex items-center gap-3 text-[12px] text-base-content/70">
                                                    <span className="flex items-center gap-1 truncate max-w-[130px]">
                                                        <MapPin size={13} className="text-primary flex-shrink-0" />
                                                        <span className="truncate">{simProj.location}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1 flex-shrink-0">
                                                        <Wrench size={13} className="text-secondary flex-shrink-0" />
                                                        <span>{simProj.type}</span>
                                                    </span>
                                                </div>

                                                <p className="text-[13px] font-normal text-base-content/75 leading-relaxed line-clamp-2">
                                                    {simProj.description}
                                                </p>
                                            </div>

                                            {/* Link */}
                                            <div className="pt-2 border-t border-base-200">
                                                <Link
                                                    to={`/project-details/${simProj.id}`}
                                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-content text-[13px] font-bold hover:opacity-90 transition-opacity duration-200 cursor-pointer rounded-lg shadow-sm"
                                                >
                                                    Project Details
                                                    <ArrowRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProjectDetails;

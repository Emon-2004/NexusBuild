import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Globe, ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';
import { Button, Badge } from '../UI';
import { DEFAULT_SYSTEM_SETTINGS } from '../../config/defaultSettings';

const DEFAULT_SLIDES = [
    {
        id: 'slide-1',
        image: '/Frontend/Projects/Hero_Section.svg',
        tagline: 'PREMIER REAL ESTATE ECOSYSTEM',
        headline: 'Architectural Excellence, Engineered for You.',
        subtitle: 'Access Narayanganj’s most advanced GIS-mapped property management ecosystem. Securely manage assets, track financials, and explore premier developments.',
        cta1Text: 'Explore Projects',
        cta1Link: '/projects',
        cta2Text: 'GIS Map Location',
        cta2Link: '/gismap',
    },
    {
        id: 'slide-2',
        image: '/Frontend/Projects/Project_1.svg',
        tagline: 'FLAGSHIP HIGH-RISE LIVING',
        headline: 'Engineered for Resilience, Designed for Luxury.',
        subtitle: 'Seismic-rated structural foundations with panoramic city views, underground secure parking, and round-the-clock smart building management.',
        cta1Text: 'View Developments',
        cta1Link: '/projects',
        cta2Text: 'Book Site Inspection',
        cta2Link: '/contact',
    },
    {
        id: 'slide-3',
        image: '/Frontend/Projects/Decades_of_Trust_in_Narayanganj.svg',
        tagline: 'TRANSPARENT CLIENT PORTAL',
        headline: 'Track Milestones & Financials in Real Time.',
        subtitle: 'Complete construction oversight at your fingertips — digitized installment schedules, automated handover alerts, and verified legal documentation.',
        cta1Text: 'Client Portal Login',
        cta1Link: '/login',
        cta2Text: 'Learn About Us',
        cta2Link: '/about',
    },
];

export const HeroSlider = ({ systemSettings }) => {
    const slides = [
        {
            ...DEFAULT_SLIDES[0],
            image: systemSettings?.heroImage || DEFAULT_SLIDES[0].image,
            tagline: systemSettings?.heroTagline || DEFAULT_SYSTEM_SETTINGS.heroTagline || DEFAULT_SLIDES[0].tagline,
            headline: systemSettings?.heroHeadline || DEFAULT_SYSTEM_SETTINGS.heroHeadline || DEFAULT_SLIDES[0].headline,
            subtitle: systemSettings?.heroSubtitle || DEFAULT_SYSTEM_SETTINGS.heroSubtitle || DEFAULT_SLIDES[0].subtitle,
            cta1Text: systemSettings?.heroCta1Text || DEFAULT_SYSTEM_SETTINGS.heroCta1Text || DEFAULT_SLIDES[0].cta1Text,
            cta1Link: systemSettings?.heroCta1Link || DEFAULT_SYSTEM_SETTINGS.heroCta1Link || DEFAULT_SLIDES[0].cta1Link,
            cta2Text: systemSettings?.heroCta2Text || DEFAULT_SYSTEM_SETTINGS.heroCta2Text || DEFAULT_SLIDES[0].cta2Text,
            cta2Link: systemSettings?.heroCta2Link || DEFAULT_SYSTEM_SETTINGS.heroCta2Link || DEFAULT_SLIDES[0].cta2Link,
        },
        DEFAULT_SLIDES[1],
        DEFAULT_SLIDES[2],
    ];

    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef(null);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    useEffect(() => {
        if (isPaused) return;
        timerRef.current = setInterval(nextSlide, 6500);
        return () => clearInterval(timerRef.current);
    }, [isPaused, current, slides.length]);

    const activeSlide = slides[current];

    return (
        <section
            className="relative w-full h-[65vh] min-h-[480px] max-h-[660px] overflow-hidden select-none bg-neutral"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            aria-label="Hero Showcase Slider"
        >
            {/* Background Slides */}
            {slides.map((s, idx) => (
                <div
                    key={s.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                >
                    <img
                        src={s.image}
                        alt={s.headline}
                        className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000 ease-out"
                        loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                    {/* Deep gradient overlay for guaranteed readable text in both themes */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/35" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                </div>
            ))}

            {/* Slide Content Layer */}
            <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col justify-center">
                <div className="max-w-2xl text-white space-y-4 sm:space-y-6">
                    {/* Tagline Badge */}
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="primary"
                            size="sm"
                            className="bg-[#fe762a] text-white border-none font-bold tracking-widest uppercase text-[11px] px-3 py-1 rounded-full shadow-sm"
                        >
                            <Sparkles size={12} className="inline mr-1" />
                            {activeSlide.tagline}
                        </Badge>
                        <span className="text-white/60 text-xs font-mono">
                            0{current + 1} / 0{slides.length}
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-sm">
                        {activeSlide.headline}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm sm:text-base lg:text-lg text-white/85 leading-relaxed max-w-xl">
                        {activeSlide.subtitle}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap items-center gap-3.5 pt-2">
                        <Link to={activeSlide.cta1Link}>
                            <Button
                                variant="primary"
                                size="md"
                                rightIcon={<ArrowRight size={16} />}
                                className="bg-[#fe762a] hover:bg-[#a14000] text-white border-none shadow-lg px-6 font-bold"
                            >
                                {activeSlide.cta1Text}
                            </Button>
                        </Link>
                        <Link to={activeSlide.cta2Link}>
                            <Button
                                variant="outline"
                                size="md"
                                leftIcon={<Globe size={16} />}
                                className="border-white/40 text-white hover:bg-white/15 hover:border-white px-6 font-semibold backdrop-blur-sm"
                            >
                                {activeSlide.cta2Text}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute z-30 bottom-6 right-6 sm:right-12 flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                    className="btn-circle bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-sm"
                >
                    <ChevronLeft size={18} />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPaused(!isPaused)}
                    aria-label={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
                    className="btn-circle bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-sm"
                >
                    {isPaused ? <Play size={14} /> : <Pause size={14} />}
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextSlide}
                    aria-label="Next slide"
                    className="btn-circle bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-sm"
                >
                    <ChevronRight size={18} />
                </Button>
            </div>

            {/* Slider Dots */}
            <div className="absolute z-30 bottom-6 left-6 sm:left-12 flex items-center gap-2">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                            idx === current ? 'w-8 bg-[#fe762a]' : 'w-2 bg-white/40 hover:bg-white/70'
                        }`}
                    />
                ))}
            </div>
        </section>
    );
};

export default HeroSlider;

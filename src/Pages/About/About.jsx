import { Link } from 'react-router';
import {
    Target, Eye, MapPin, ArrowRight, Calendar,
    ChevronRight, Mail, Globe,
} from 'lucide-react';
import Navbar from '../../Components/Header/Navbar';
import Footer from '../../Components/Footer/Footer';
import { useDatabase } from '../../Context/DatabaseContext';

// ─── About ────────────────────────────────────────────────────────────────────
// Figma frame: 1280 × 2598, node-id=1:197
// Sections: Hero | Mission+Vision cards | Story | Stats | Timeline | Team
// ─────────────────────────────────────────────────────────────────────────────

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
    { value: '20+', label: 'Years of Expertise' },
    { value: '48',  label: 'Projects Delivered' },
    { value: '12K+',label: 'Happy Clients' },
    { value: '3',   label: 'Active Developments' },
];

// ── Timeline milestones ───────────────────────────────────────────────────────
const getMilestones = (companyName) => [
    {
        year: '2003',
        title: 'Foundation',
        desc: `${companyName} founded at Shamabay New Market with a vision for Narayanganj's growth.`,
    },
    {
        year: '2009',
        title: 'First Tower',
        desc: 'Completed our first residential high-rise, setting new benchmarks for structural quality in the district.',
    },
    {
        year: '2015',
        title: 'GIS Integration',
        desc: 'Integration of GIS Mapping into urban planning workflows — a first for local developers.',
    },
    {
        year: '2019',
        title: 'Commercial Expansion',
        desc: 'Launched the Nexus Business Hub, redefining commercial infrastructure in Narayanganj.',
    },
    {
        year: '2023',
        title: 'NexusBuild Platform',
        desc: 'Launched the NexusBuild digital portal for transparent, client-first real estate management.',
    },
];

// ── Team ──────────────────────────────────────────────────────────────────────
const TEAM = [
    {
        name:  'Mohammed A. Rahman',
        role:  'Chief Executive Officer',
        badge: 'CEO',
        bg:    '#000f22',
        text:  '#fff',
        bio:   'Over 25 years leading landmark infrastructure projects across Bangladesh.',
    },
    {
        name:  'Nasreen Hossain',
        role:  'Director of Engineering',
        badge: 'ENG',
        bg:    '#a14000',
        text:  '#fff',
        bio:   'Structural engineer with international credentials and 18 years of field leadership.',
    },
    {
        name:  'Tanvir Islam',
        role:  'GIS Specialist',
        badge: 'GIS',
        bg:    '#0a3d2e',
        text:  '#fff',
        bio:   'Pioneer in applying geospatial intelligence to urban real estate development.',
    },
    {
        name:  'Fatima Begum',
        role:  'Client Relations Manager',
        badge: 'CRM',
        bg:    '#5e2200',
        text:  '#fff',
        bio:   'Dedicated to delivering exceptional client experiences throughout every project lifecycle.',
    },
];

import DEFAULT_SYSTEM_SETTINGS from '../../config/defaultSettings';

// ─────────────────────────────────────────────────────────────────────────────
const About = () => {
    const { systemSettings } = useDatabase();
    const companyName = systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName;
    const headAddress = systemSettings?.headOfficeAddress || DEFAULT_SYSTEM_SETTINGS.headOfficeAddress;
    const milestones = getMilestones(companyName);

    // Dynamic About Hero Properties
    const heroEyebrow = systemSettings?.aboutHeroEyebrow || DEFAULT_SYSTEM_SETTINGS.aboutHeroEyebrow;
    const heroHeadline = systemSettings?.aboutHeroHeadline || DEFAULT_SYSTEM_SETTINGS.aboutHeroHeadline;
    const heroSubtitle = systemSettings?.aboutHeroSubtitle || DEFAULT_SYSTEM_SETTINGS.aboutHeroSubtitle;
    const heroCta1Text = systemSettings?.aboutHeroCta1Text || DEFAULT_SYSTEM_SETTINGS.aboutHeroCta1Text;
    const heroCta1Link = systemSettings?.aboutHeroCta1Link || DEFAULT_SYSTEM_SETTINGS.aboutHeroCta1Link;
    const heroCta2Text = systemSettings?.aboutHeroCta2Text || DEFAULT_SYSTEM_SETTINGS.aboutHeroCta2Text;
    const heroCta2Link = systemSettings?.aboutHeroCta2Link || DEFAULT_SYSTEM_SETTINGS.aboutHeroCta2Link;

    // Dynamic Our People Properties
    const peopleEyebrow = systemSettings?.aboutPeopleEyebrow || DEFAULT_SYSTEM_SETTINGS.aboutPeopleEyebrow;
    const peopleTitle = systemSettings?.aboutPeopleTitle || DEFAULT_SYSTEM_SETTINGS.aboutPeopleTitle;
    const peopleSubtitle = systemSettings?.aboutPeopleSubtitle || DEFAULT_SYSTEM_SETTINGS.aboutPeopleSubtitle;
    const teamMembers = systemSettings?.aboutTeamMembers?.length ? systemSettings.aboutTeamMembers : TEAM;

    return (
        <div className="flex flex-col min-h-screen font-[Inter,sans-serif] bg-[#f3f4f5]">
            <Navbar />

            {/* ══ 1. HERO ══════════════════════════════════════════════════════ */}
            <section
                className="relative overflow-hidden bg-[#000f22] min-h-[640px] flex items-center"
                style={{
                    backgroundImage: [
                        'linear-gradient(rgba(10,37,64,0.92), rgba(10,37,64,0.92))',
                        'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(161,64,0,0.18) 0%, transparent 70%)',
                    ].join(','),
                }}
            >
                {/* Blueprint grid overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: [
                            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
                            'linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
                        ].join(','),
                        backgroundSize: '40px 40px',
                    }}
                />

                <div className="relative max-w-[1184px] mx-auto px-6 sm:px-10 lg:px-12 py-24 w-full">
                    {/* Eyebrow */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-[2px] bg-[#fe762a]" />
                        <span className="text-[11px] font-semibold text-[#fe762a] uppercase tracking-[0.22em]">
                            {heroEyebrow}
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-[48px] sm:text-[56px] lg:text-[64px] font-bold text-white leading-[1.05] tracking-tight mb-6 max-w-[700px]">
                        {heroHeadline}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-[18px] font-normal text-[#b0c8eb] leading-[28px] max-w-[600px] mb-10">
                        {heroSubtitle}
                    </p>

                    {/* CTA */}
                    <div className="flex flex-wrap gap-4">
                        <Link
                            to={heroCta1Link}
                            className="
                                inline-flex items-center gap-2
                                bg-[#fe762a] hover:bg-[#a14000]
                                text-white text-[16px] font-normal
                                px-12 py-6 rounded-[4px]
                                transition-colors duration-200
                            "
                        >
                            {heroCta1Text}
                            <ArrowRight size={16} />
                        </Link>
                        <Link
                            to={heroCta2Link}
                            className="
                                inline-flex items-center gap-2
                                border border-[#fe762a] hover:bg-[#fe762a]/10
                                text-white text-[16px] font-normal
                                px-10 py-6 rounded-[4px]
                                transition-all duration-200
                            "
                        >
                            <MapPin size={16} />
                            {heroCta2Text}
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══ 2. STATS BAR ════════════════════════════════════════════════ */}
            <section className="bg-[#000f22] border-t border-white/10">
                <div className="max-w-[1184px] mx-auto px-6 sm:px-10 lg:px-12">
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
                        {STATS.map(({ value, label }) => (
                            <div key={label} className="px-6 py-8 text-center">
                                <div className="text-[36px] sm:text-[40px] font-bold text-[#fe762a] leading-none mb-1">
                                    {value}
                                </div>
                                <div className="text-[13px] font-normal text-[#768dad] uppercase tracking-[0.1em]">
                                    {label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ 3. MISSION + VISION ═════════════════════════════════════════ */}
            <section className="py-20 sm:py-28 bg-[#f3f4f5]">
                <div className="max-w-[1184px] mx-auto px-6 sm:px-10 lg:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Mission card — light bg */}
                        <div className="bg-[#edeeef] border border-[#c4c6ce] p-12 flex flex-col justify-between gap-6">
                            <div>
                                {/* Icon */}
                                <div className="w-10 h-10 mb-6">
                                    <Target size={40} className="text-[#a14000]" />
                                </div>
                                <h2 className="text-[24px] font-semibold text-[#191c1d] mb-6 leading-[32px]">
                                    Our Mission
                                </h2>
                                <p className="text-[16px] font-normal text-[#43474d] leading-[24px]">
                                    To redefine urban living by integrating cutting-edge GIS technology and engineering
                                    precision into every brick we lay. We strive to provide transparent, technology-driven
                                    real estate solutions that empower communities across Bangladesh.
                                </p>
                            </div>
                            {/* Divider link */}
                            <div className="border-t border-[#c4c6ce] pt-6 flex items-center justify-between">
                                <Link
                                    to="/gismap"
                                    className="text-[16px] font-normal text-[#a14000] hover:text-[#5e2200] flex items-center gap-2 transition-colors"
                                >
                                    LEARN ABOUT OUR TECHNOLOGY
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>

                        {/* Vision card — dark bg */}
                        <div className="bg-[#000f22] border border-[#0a2540] p-12 flex flex-col justify-between gap-6">
                            <div>
                                {/* Icon */}
                                <div className="w-10 h-10 mb-6">
                                    <Eye size={40} className="text-[#ffb694]" />
                                </div>
                                <h2 className="text-[24px] font-semibold text-white mb-6 leading-[32px]">
                                    Our Vision
                                </h2>
                                <p className="text-[16px] font-normal text-[#b0c8eb] leading-[24px]">
                                    To be the undisputed benchmark for structural integrity and innovative infrastructure
                                    in the region. We envision a future where every family resides in a home designed
                                    with absolute precision and unmatched safety standards.
                                </p>
                            </div>
                            {/* Divider link */}
                            <div className="border-t border-white/10 pt-6 flex items-center justify-between">
                                <Link
                                    to="/"
                                    className="text-[16px] font-normal text-[#ffb694] hover:text-white flex items-center gap-2 transition-colors"
                                >
                                    VIEW OUR PROJECTS
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ══ 4. TIMELINE — "A Journey Through Time" ══════════════════════ */}
            <section className="py-20 sm:py-28 bg-white">
                <div className="max-w-[1184px] mx-auto px-6 sm:px-10 lg:px-12">

                    {/* Section heading */}
                    <div className="text-center mb-16">
                        <span className="text-[11px] font-semibold text-[#a14000] uppercase tracking-[0.22em] block mb-4">
                            Our History
                        </span>
                        <h2 className="text-[32px] font-semibold text-[#000f22] tracking-tight">
                            A Journey Through Time
                        </h2>
                        <p className="mt-3 text-[16px] text-[#74777e]">
                            Defining the skyline of Narayanganj for over two decades.
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="relative">
                        {/* Vertical line (desktop) */}
                        <div className="hidden lg:block absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-[#e1e3e4]" />

                        <div className="flex flex-col gap-12">
                            {milestones.map((m, i) => {
                                const isLeft = i % 2 === 0;
                                return (
                                    <div
                                        key={m.year}
                                        className={`relative flex flex-col lg:flex-row items-start lg:items-center gap-6 ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                                    >
                                        {/* Card */}
                                        <div className={`w-full lg:w-[calc(50%-40px)] ${isLeft ? 'lg:text-right' : 'lg:text-left'}`}>
                                            <div className={`
                                                bg-[#f3f4f5] border border-[#e1e3e4] p-6
                                                hover:border-[#a14000]/40 hover:bg-[#edeeef]
                                                transition-colors duration-200 group
                                            `}>
                                                <div className={`flex items-center gap-3 mb-3 ${isLeft ? 'lg:justify-end' : ''}`}>
                                                    <span className="text-[11px] font-bold text-white bg-[#a14000] px-2 py-0.5 tracking-wider uppercase">
                                                        {m.year}
                                                    </span>
                                                    <h3 className="text-[16px] font-semibold text-[#000f22]">
                                                        {m.title}
                                                    </h3>
                                                </div>
                                                <p className={`text-[14px] font-normal text-[#74777e] leading-[22px]`}>
                                                    {m.desc}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Centre node */}
                                        <div className="hidden lg:flex w-20 flex-shrink-0 items-center justify-center z-10">
                                            <div className="w-4 h-4 rounded-full bg-[#a14000] ring-4 ring-white shadow-md" />
                                        </div>

                                        {/* Spacer */}
                                        <div className="hidden lg:block w-[calc(50%-40px)]" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ 5. TEAM ══════════════════════════════════════════════════════ */}
            <section className="py-20 sm:py-28 bg-[#f3f4f5]">
                <div className="max-w-[1184px] mx-auto px-6 sm:px-10 lg:px-12">

                    {/* Section heading */}
                    <div className="text-center mb-16">
                        <span className="text-[11px] font-semibold text-[#a14000] uppercase tracking-[0.22em] block mb-4">
                            {peopleEyebrow}
                        </span>
                        <h2 className="text-[32px] font-semibold text-[#000f22] tracking-tight">
                            {peopleTitle}
                        </h2>
                        <p className="mt-3 text-[16px] text-[#74777e] max-w-[480px] mx-auto">
                            {peopleSubtitle}
                        </p>
                    </div>

                    {/* Team grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {teamMembers.map((member, idx) => (
                            <div
                                key={member.name + idx}
                                className="bg-white border border-[#e1e3e4] overflow-hidden group hover:shadow-[0px_8px_24px_#0000001a] transition-shadow duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Avatar / colour header */}
                                    <div
                                        className="h-[120px] flex items-center justify-center"
                                        style={{ background: member.bg || '#000f22' }}
                                    >
                                        <div
                                            className="w-16 h-16 flex items-center justify-center text-[22px] font-bold border-2 border-white/30"
                                            style={{ color: member.text || '#ffffff' }}
                                        >
                                            {member.badge || 'TEAM'}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-5">
                                        <h3 className="text-[15px] font-semibold text-[#191c1d] leading-tight mb-1">
                                            {member.name}
                                        </h3>
                                        <p
                                            className="text-[11px] font-bold uppercase tracking-wider mb-3 pb-3 border-b border-[#e1e3e4]"
                                            style={{ color: member.bg || '#a14000' }}
                                        >
                                            {member.role}
                                        </p>
                                        <p className="text-[13px] font-normal text-[#74777e] leading-[20px]">
                                            {member.bio}
                                        </p>
                                    </div>
                                </div>

                                {/* Social row */}
                                <div className="px-5 pb-5 pt-2 flex items-center gap-2">
                                    <button className="w-8 h-8 border border-[#e1e3e4] flex items-center justify-center hover:border-[#a14000] hover:text-[#a14000] transition-colors text-[#74777e] rounded cursor-pointer">
                                        <Globe size={13} />
                                    </button>
                                    <button className="w-8 h-8 border border-[#e1e3e4] flex items-center justify-center hover:border-[#a14000] hover:text-[#a14000] transition-colors text-[#74777e] rounded cursor-pointer">
                                        <Mail size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ 6. COMPANY STORY BANNER ═════════════════════════════════════ */}
            <section className="py-20 sm:py-28 bg-[#000f22] relative overflow-hidden">
                {/* Grid overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: [
                            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
                            'linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                        ].join(','),
                        backgroundSize: '40px 40px',
                    }}
                />
                {/* Accent glow */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#a14000]/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative max-w-[1184px] mx-auto px-6 sm:px-10 lg:px-12">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12 justify-between">
                        <div className="max-w-[640px]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-6 h-[2px] bg-[#fe762a]" />
                                <span className="text-[11px] font-semibold text-[#fe762a] uppercase tracking-[0.22em]">
                                    Our Story
                                </span>
                            </div>
                            <h2 className="text-[32px] font-semibold text-white leading-[40px] tracking-tight mb-6">
                                Building the future of Bangladesh with transparency, integrity, and innovative GIS technology.
                            </h2>
                            <p className="text-[18px] font-normal text-[#b0c8eb] leading-[28px]">
                                {systemSettings?.aboutStoryText || DEFAULT_SYSTEM_SETTINGS.aboutStoryText}
                            </p>
                        </div>

                        {/* Info block */}
                        <div className="flex-shrink-0 flex flex-col gap-4">
                            <div className="border border-white/10 p-6 min-w-[260px]">
                                <div className="flex items-center gap-3 mb-2">
                                    <MapPin size={16} className="text-[#fe762a]" />
                                    <span className="text-[11px] font-semibold text-[#768dad] uppercase tracking-wider">
                                        Head Office
                                    </span>
                                </div>
                                <p className="text-[14px] font-normal text-white leading-[22px]">
                                    {headAddress}
                                </p>
                            </div>
                            <div className="border border-white/10 p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Calendar size={16} className="text-[#fe762a]" />
                                    <span className="text-[11px] font-semibold text-[#768dad] uppercase tracking-wider">
                                        Established
                                    </span>
                                </div>
                                <p className="text-[14px] font-normal text-white">2003</p>
                            </div>
                            <Link
                                to="/contact"
                                className="
                                    inline-flex items-center justify-center gap-2
                                    bg-[#fe762a] hover:bg-[#a14000]
                                    text-white text-[14px] font-semibold
                                    px-6 py-4 transition-colors duration-200
                                "
                            >
                                Get in Touch
                                <ArrowRight size={15} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
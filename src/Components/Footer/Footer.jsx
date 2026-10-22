import { Link } from "react-router";
import { Mail, Phone, MapPin, Building2 } from "lucide-react";
import { useDatabase } from "../../Context/DatabaseContext";
import DEFAULT_SYSTEM_SETTINGS from "../../config/defaultSettings";

const Footer = () => {
    const { systemSettings } = useDatabase();

    const currentSettings = systemSettings || DEFAULT_SYSTEM_SETTINGS;

    const facebookUrl = currentSettings?.facebookUrl || DEFAULT_SYSTEM_SETTINGS.facebookUrl || "https://facebook.com";
    const twitterUrl  = currentSettings?.twitterUrl  || DEFAULT_SYSTEM_SETTINGS.twitterUrl  || "https://twitter.com";
    const linkedinUrl = currentSettings?.linkedinUrl || DEFAULT_SYSTEM_SETTINGS.linkedinUrl || "https://linkedin.com";

    const quickLinks = [
        { to: "/projects", label: "Projects" },
        { to: "/gismap",   label: "GIS Map" },
        { to: "/blog",     label: "Market Blog" },
        { to: "/about",    label: "About Us" },
        { to: "/contact",  label: "Contact" },
    ];

    const legalLinks = [
        { to: "/terms",   label: "Terms of Service" },
        { to: "/privacy", label: "Privacy Policy" },
        { to: "/contact", label: "Security & Support" },
    ];

    return (
        <footer className="bg-[#000f22] text-white border-t border-[#0a2540]">

            {/* ── Main Grid ── */}
            <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">

                {/* Column 1: Brand */}
                <div className="flex flex-col gap-5 md:col-span-1">
                    <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                        {currentSettings?.companyLogo ? (
                            <img 
                                src={currentSettings.companyLogo} 
                                alt={currentSettings?.companyName || 'Logo'} 
                                className="h-14 w-auto max-w-[260px] object-contain" 
                            />
                        ) : (
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 bg-white text-[#000f22] rounded-xl flex items-center justify-center font-bold shadow-xs">
                                    <Building2 size={22} />
                                </div>
                                <span className="text-[20px] font-extrabold text-white tracking-tight">
                                    {currentSettings?.companyName || 'Reliance Housing Ltd.'}
                                </span>
                            </div>
                        )}
                    </Link>
                    <p className="text-[12px] font-medium text-white/80 leading-relaxed">
                        Building the future of Bangladesh with transparency, structural integrity, and innovative GIS technology.
                    </p>
                    {/* Social links with verified URLs from systemSettings */}
                    <div className="flex items-center gap-3 pt-1">
                        {/* Facebook */}
                        <a 
                            href={facebookUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Facebook" 
                            className="w-9 h-9 rounded-[10px] border border-white/60 flex items-center justify-center text-white hover:bg-white hover:text-[#000f22] hover:border-white transition-all duration-200"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </a>
                        {/* Twitter / X */}
                        <a 
                            href={twitterUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Twitter" 
                            className="w-9 h-9 rounded-[10px] border border-white/60 flex items-center justify-center text-white hover:bg-white hover:text-[#000f22] hover:border-white transition-all duration-200"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                        </a>
                        {/* LinkedIn */}
                        <a 
                            href={linkedinUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="LinkedIn" 
                            className="w-9 h-9 rounded-[10px] border border-white/60 flex items-center justify-center text-white hover:bg-white hover:text-[#000f22] hover:border-white transition-all duration-200"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                    </div>
                </div>

                {/* Column 2: Navigation Links */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[15px] font-bold text-[#ffb694] tracking-tight uppercase">Navigation</h4>
                    <ul className="flex flex-col gap-2.5">
                        {quickLinks.map(({ to, label }) => (
                            <li key={to}>
                                <Link
                                    to={to}
                                    className="text-[12px] font-medium text-white/85 hover:text-[#ffb694] transition-colors duration-200"
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Column 3: Legal & Trust */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[15px] font-bold text-[#ffb694] tracking-tight uppercase">Legal &amp; Trust</h4>
                    <ul className="flex flex-col gap-2.5">
                        {legalLinks.map(({ to, label }) => (
                            <li key={to}>
                                <Link
                                    to={to}
                                    className="text-[12px] font-medium text-white/85 hover:text-[#ffb694] transition-colors duration-200"
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-2 text-[11px] text-white/60">
                        Reg No: {currentSettings?.regNumber || 'REG-2023-998811'}
                    </div>
                </div>

                {/* Column 4: Contact Us */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[15px] font-bold text-[#ffb694] tracking-tight uppercase">Contact Us</h4>
                    <ul className="flex flex-col gap-3">
                        <li className="flex items-start gap-2">
                            <MapPin size={14} className="text-[#ffb694] mt-0.5 flex-shrink-0" />
                            <span className="text-[12px] font-medium text-white/85 leading-snug">
                                {currentSettings.headOfficeAddress}
                            </span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Phone size={14} className="text-[#ffb694] flex-shrink-0" />
                            <a 
                                href={`tel:${currentSettings.supportPhone}`} 
                                className="text-[12px] font-medium text-white/85 hover:text-[#ffb694] transition-colors"
                            >
                                {currentSettings.supportPhone}
                            </a>
                        </li>
                        <li className="flex items-center gap-2">
                            <Mail size={14} className="text-[#ffb694] flex-shrink-0" />
                            <a 
                                href={`mailto:${currentSettings.supportEmail}`} 
                                className="text-[12px] font-medium text-white/85 hover:text-[#ffb694] transition-colors"
                            >
                                {currentSettings.supportEmail}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* ── Bottom bar ── */}
            <div className="border-t border-white/20 max-w-[1280px] mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <span className="text-[12px] font-medium text-white/70">
                    © 2026 {currentSettings.companyName}. All rights reserved.
                </span>
                <div className="flex items-center gap-5 text-[11px] text-white/60">
                    <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    <span>•</span>
                    <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <span>•</span>
                    <Link to="/contact" className="hover:text-white transition-colors">Client Support</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

import { Link } from "react-router";
import { Mail, Phone, MapPin, Building2 } from "lucide-react";

// ─── Footer ───────────────────────────────────────────────────────────────────
// Figma spec (consistent across all frames):
//   bg: #000f22, border-top: #0a2540 1px
//   4-column grid (48px padding all sides)
//   Col 1: NexusBuild 24px fw=700 white + tagline 12px fw=500 white + social circles (r=12 stroke white)
//   Col 2: (Figma doesn't show quick links — kept for usability)
//   Col 3: "Contact Us" 16px fw=700 #ffb694 + address/phone/email items 12px fw=500 white
//   Col 4: "Newsletter" 16px fw=700 #ffb694 + input (white bg, r=2, white stroke) + Subscribe btn (#a14000)
//   Bottom bar: #ffffff border-top, 24px V pad, 12px fw=500 white
//     Left: "© 2026 Reliance Housing Ltd. All rights reserved."
//     Right: Security | Sitemap | Cookie Policy
// ─────────────────────────────────────────────────────────────────────────────

import { useDatabase } from "../../Context/DatabaseContext";

import DEFAULT_SYSTEM_SETTINGS from "../../config/defaultSettings";

const Footer = () => {
    const { systemSettings } = useDatabase();

    const currentSettings = systemSettings || DEFAULT_SYSTEM_SETTINGS;

    return (
        <footer className="bg-[#000f22] text-white border-t border-[#0a2540]">

            {/* ── Main Grid ── */}
            <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">

                {/* Column 1: Brand */}
                <div className="flex flex-col gap-6">
                    <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                        {currentSettings?.companyLogo ? (
                            <img 
                                src={currentSettings.companyLogo} 
                                alt={currentSettings?.companyName || 'Logo'} 
                                className="h-16 w-auto max-w-[280px] object-contain" 
                            />
                        ) : (
                            <div className="flex items-center gap-2.5">
                                <div className="w-11 h-11 bg-white text-[#000f22] rounded-xl flex items-center justify-center font-bold shadow-xs">
                                    <Building2 size={24} />
                                </div>
                                <span className="text-[22px] font-extrabold text-white tracking-tight">
                                    {currentSettings?.companyName || 'Reliance Housing Ltd.'}
                                </span>
                            </div>
                        )}
                    </Link>
                    {/* Figma: 12px fw=500 white */}
                    <p className="text-[12px] font-medium text-white leading-relaxed">
                        Building the future of Bangladesh with transparency, integrity, and innovative GIS technology.
                    </p>
                    {/* Figma: social circles — 40×40, r=12, stroke white 1px */}
                    <div className="flex items-center gap-4">
                        {/* Facebook */}
                        <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-[12px] border border-white flex items-center justify-center text-white hover:bg-white hover:text-[#000f22] transition-colors duration-200">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </a>
                        {/* Twitter / X */}
                        <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-[12px] border border-white flex items-center justify-center text-white hover:bg-white hover:text-[#000f22] transition-colors duration-200">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                        </a>
                        {/* LinkedIn */}
                        <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-[12px] border border-white flex items-center justify-center text-white hover:bg-white hover:text-[#000f22] transition-colors duration-200">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                    </div>
                </div>

                {/* Column 2: Quick Links (navigation convenience, not in Figma but kept for UX) */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[16px] font-bold text-[#ffb694] tracking-tight">Quick Links</h4>
                    <ul className="flex flex-col gap-3">
                        {[
                            { to: "/projects", label: "Projects"       },
                            { to: "/gismap",   label: "GIS Map"        },
                            { to: "/about",    label: "About Us"       },
                            { to: "/contact",  label: "Contact"        },
                        ].map(({ to, label }) => (
                            <li key={to}>
                                <Link
                                    to={to}
                                    className="text-[12px] font-medium text-white hover:text-[#ffb694] transition-colors duration-200"
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Column 3: Contact Us — Figma: heading #ffb694 16px fw=700, items 12px fw=500 white */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[16px] font-bold text-[#ffb694] tracking-tight">Contact Us</h4>
                    <ul className="flex flex-col gap-3">
                        <li className="flex items-start gap-2">
                            <MapPin size={12} className="text-white mt-0.5 flex-shrink-0" />
                            <span className="text-[12px] font-medium text-white leading-snug">
                                Office: {currentSettings.headOfficeAddress}
                            </span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Phone size={12} className="text-white flex-shrink-0" />
                            <span className="text-[12px] font-medium text-white">Contact: {currentSettings.supportPhone}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Mail size={12} className="text-white flex-shrink-0" />
                            <span className="text-[12px] font-medium text-white">{currentSettings.supportEmail}</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* ── Bottom bar ── */}
            <div className="border-t border-white max-w-[1280px] mx-auto px-6 lg:px-12 py-6 flex items-center justify-center text-center">
                <span className="text-[12px] font-medium text-white">
                    © 2026 {currentSettings.companyName}. All rights reserved.
                </span>
            </div>
        </footer>
    );
};

export default Footer;
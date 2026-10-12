import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Search, LogOut, LayoutDashboard, Menu, X, MapPin, Building2, Sun, Moon } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";
import { useDatabase } from "../../Context/DatabaseContext";
import { useTheme } from "../../Context/ThemeContext";
import { PROJECTS } from "../../data/projectsData";
import DEFAULT_SYSTEM_SETTINGS from "../../config/defaultSettings";

// ─── Navbar ───────────────────────────────────────────────────────────────────
// Figma spec (Header - TopNavBar, consistent across all frames):
//   Height: 80px, bg: #f8f9fa, border-bottom: #c4c6ce 1px
//   Logo: "NexusBuild" 24px fw=700 #000f22
//   Nav links: 16px fw=400 #43474d — active link underlined with #a14000 stroke
//   Right: search input (#f3f4f5 bg, r=4, #c4c6ce border) + Login (outline) + Register (filled #000f22)
//   When logged in: show Dashboard + Logout in place of Login/Register
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
    { to: "/projects", label: "Projects" },
    { to: "/gismap",   label: "GIS Map"  },
    { to: "/about",    label: "About"    },
    { to: "/contact",  label: "Contact"  },
];

const MAX_RESULTS = 7;

// ── ProjectSearch ─────────────────────────────────────────────────────────────
// Defined OUTSIDE Navbar so it is never recreated on parent re-renders.
// This prevents the focus-loss bug caused by component identity changing.
// ─────────────────────────────────────────────────────────────────────────────
const ProjectSearch = ({ onNavigate, className = "" }) => {
    const [query, setQuery]           = useState("");
    const [results, setResults]       = useState([]);
    const [open, setOpen]             = useState(false);
    const [activeIdx, setActiveIdx]   = useState(-1);
    const inputRef                    = useRef(null);
    const containerRef                = useRef(null);
    const debounceRef                 = useRef(null);

    // ── Click outside → close ─────────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setActiveIdx(-1);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Debounced filter ──────────────────────────────────────────────────
    const filter = useCallback((q) => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const trimmed = q.trim().toLowerCase();
            if (!trimmed) {
                setResults([]);
                setOpen(false);
                return;
            }
            const matched = PROJECTS.filter((p) => {
                const haystack = [p.name, p.location, p.fullAddress, p.type]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                return haystack.includes(trimmed);
            }).slice(0, MAX_RESULTS);
            setResults(matched);
            setOpen(true);
            setActiveIdx(-1);
        }, 175);
    }, []);

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        filter(val);
    };

    const handleClear = () => {
        setQuery("");
        setResults([]);
        setOpen(false);
        setActiveIdx(-1);
        inputRef.current?.focus();
    };

    const handleSelect = (project) => {
        setQuery("");
        setResults([]);
        setOpen(false);
        setActiveIdx(-1);
        onNavigate(`/project-details/${project.id}`);
    };

    // ── Keyboard navigation (↑ ↓ Enter Escape) ───────────────────────────
    const handleKeyDown = (e) => {
        if (!open) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIdx((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx((i) => Math.max(i - 1, -1));
        } else if (e.key === "Enter") {
            if (activeIdx >= 0 && results[activeIdx]) {
                handleSelect(results[activeIdx]);
            }
        } else if (e.key === "Escape") {
            setOpen(false);
            setActiveIdx(-1);
            inputRef.current?.blur();
        }
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* ── Search Input ── */}
            <div className="relative flex items-center">
                <Search
                    size={15}
                    className="absolute left-3 text-base-content/50 pointer-events-none z-10"
                />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.trim() && results.length >= 0 && setOpen(true)}
                    placeholder="Search projects..."
                    autoComplete="off"
                    spellCheck={false}
                    className="
                        pl-9 pr-8 py-[9px] w-full
                        bg-base-200 border border-base-300 rounded-[4px]
                        text-[14px] font-semibold text-base-content placeholder-base-content/50
                        focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
                        transition-all
                    "
                />
                {/* Clear (×) button shown only when there's text */}
                {query && (
                    <button
                        onMouseDown={(e) => { e.preventDefault(); handleClear(); }}
                        className="absolute right-2.5 text-base-content/50 hover:text-base-content transition-colors"
                        aria-label="Clear search"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* ── Dropdown ── */}
            {open && (
                <div className="
                    absolute top-[calc(100%+6px)] left-0 right-0
                    bg-base-100 border border-base-300 rounded-[6px] shadow-xl
                    overflow-hidden z-[200]
                    min-w-[300px]
                ">
                    {results.length === 0 ? (
                        /* No results state */
                        <div className="flex items-center gap-3 px-4 py-3.5 text-base-content/60">
                            <Search size={14} className="flex-shrink-0" />
                            <span className="text-[13px] font-medium">
                                No projects found for &ldquo;{query}&rdquo;
                            </span>
                        </div>
                    ) : (
                        <ul role="listbox" className="divide-y divide-base-300">
                            {results.map((project, idx) => (
                                <li key={project.id} role="option" aria-selected={idx === activeIdx}>
                                    <button
                                        onMouseDown={(e) => { e.preventDefault(); handleSelect(project); }}
                                        onMouseEnter={() => setActiveIdx(idx)}
                                        className={`
                                            w-full text-left px-4 py-3 flex items-start gap-3
                                            transition-colors duration-100 cursor-pointer
                                            ${idx === activeIdx
                                                ? "bg-primary text-primary-content"
                                                : "hover:bg-base-200 text-base-content"
                                            }
                                        `}
                                    >
                                        {/* Icon badge */}
                                        <div className={`
                                            w-8 h-8 rounded-[3px] flex items-center justify-center flex-shrink-0 mt-0.5
                                            ${idx === activeIdx ? "bg-white/20" : "bg-base-300 text-primary"}
                                        `}>
                                            <Building2
                                                size={14}
                                                className={idx === activeIdx ? "text-primary-content" : "text-primary"}
                                            />
                                        </div>

                                        {/* Text block */}
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className={`
                                                text-[13px] font-bold leading-tight truncate
                                                ${idx === activeIdx ? "text-primary-content" : "text-base-content"}
                                            `}>
                                                {project.name}
                                            </span>
                                            <span className={`
                                                text-[11px] flex items-center gap-1 truncate
                                                ${idx === activeIdx ? "text-primary-content/80" : "text-base-content/70"}
                                            `}>
                                                <MapPin size={10} className="flex-shrink-0" />
                                                {project.fullAddress || project.location}
                                                {project.type && (
                                                    <span className={`
                                                        ml-1.5 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide rounded-[2px]
                                                        ${idx === activeIdx
                                                            ? "bg-white/25 text-white"
                                                            : "bg-primary/10 text-primary"
                                                        }
                                                    `}>
                                                        {project.type}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Footer hint */}
                    <div className="px-4 py-2 bg-base-200 border-t border-base-300 flex items-center justify-between">
                        <span className="text-[10px] text-base-content/60 font-medium">
                            {results.length > 0
                                ? `${results.length} result${results.length !== 1 ? "s" : ""} — ↑↓ to navigate, Enter to open`
                                : "Try a project name or location"}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
const Navbar = () => {
    const { user, loading, signOut } = useAuth();
    const { systemSettings } = useDatabase();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    const handleLogout = async () => {
        await signOut();
        navigate("/");
    };

    const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + "/");

    return (
        <header className="sticky top-0 z-50 bg-base-100 border-b border-base-300">
            <div className="max-w-[1280px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-8">

                {/* ── Left: Logo + Nav ── */}
                <div className="flex items-center gap-8">
                    {/* Logo — Dynamic Company Logo & Name */}
                    <Link
                        to="/"
                        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity flex-shrink-0"
                    >
                        {systemSettings?.companyLogo ? (
                            <img 
                                src={systemSettings.companyLogo} 
                                alt={systemSettings?.companyName || 'Logo'} 
                                className="h-16 w-auto max-w-[280px] object-contain" 
                            />
                        ) : (
                            <div className="flex items-center gap-2.5">
                                <div className="w-11 h-11 bg-primary text-primary-content rounded-xl flex items-center justify-center font-bold shadow-xs">
                                    <Building2 size={24} />
                                </div>
                                <span className="text-[22px] font-extrabold text-base-content tracking-tight">
                                    {systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName}
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        {NAV_LINKS.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`
                                    text-[16px] font-normal transition-colors duration-200 pb-1
                                    ${isActive(to)
                                        ? "text-base-content font-bold border-b-2 border-primary"
                                        : "text-base-content/70 hover:text-base-content border-b-2 border-transparent"}
                                `}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* ── Right: Search + Theme Toggle + Auth CTAs ── */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Search */}
                    <ProjectSearch
                        onNavigate={navigate}
                        className="w-56"
                    />

                    {/* Theme Toggle Button */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="p-2.5 rounded-[4px] border border-base-300 hover:bg-base-200 text-base-content transition-colors flex items-center justify-center cursor-pointer"
                        title={isDark ? "Switch to light theme" : "Switch to dark theme"}
                    >
                        {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
                    </button>

                    {/* Auth CTAs */}
                    {!loading && (
                        <div className="flex items-center gap-3">
                            {user ? (
                                <>
                                    {/* Dashboard button when logged in */}
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center gap-1.5 px-4 py-[9px] text-[14px] font-bold text-base-content border border-base-300 hover:bg-base-200 rounded-[4px] transition-all"
                                    >
                                        <LayoutDashboard size={14} />
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-1.5 px-4 py-[9px] text-[14px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-[4px] transition-all cursor-pointer"
                                    >
                                        <LogOut size={14} />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Login */}
                                    <Link
                                        to="/login"
                                        className="px-5 py-[9px] text-[14px] font-bold text-base-content border border-base-300 hover:bg-base-200 rounded-[4px] transition-all"
                                    >
                                        Login
                                    </Link>
                                    {/* Register */}
                                    <Link
                                        to="/register"
                                        className="px-5 py-[9px] text-[14px] font-bold text-primary-content bg-primary hover:opacity-90 rounded-[4px] transition-all"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Mobile: Search icon + Theme toggle + Hamburger ── */}
                <div className="md:hidden flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="text-base-content/75 hover:text-base-content focus:outline-none p-1.5 cursor-pointer"
                        title={isDark ? "Switch to light theme" : "Switch to dark theme"}
                    >
                        {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
                    </button>
                    <button
                        onClick={() => { setMobileSearchOpen((s) => !s); setMobileOpen(false); }}
                        className="text-base-content/75 hover:text-base-content focus:outline-none p-1.5 cursor-pointer"
                        aria-label="Toggle search"
                    >
                        <Search size={20} />
                    </button>
                    <button
                        className="text-base-content/75 hover:text-base-content focus:outline-none p-1.5 cursor-pointer"
                        onClick={() => { setMobileOpen(!mobileOpen); setMobileSearchOpen(false); }}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* ── Mobile Search Bar (slide-down) ── */}
            {mobileSearchOpen && (
                <div className="md:hidden bg-base-100 border-t border-base-300 px-4 py-3">
                    <ProjectSearch
                        onNavigate={(path) => { navigate(path); setMobileSearchOpen(false); }}
                        className="w-full"
                    />
                </div>
            )}

            {/* ── Mobile Menu Drawer ── */}
            {mobileOpen && (
                <div className="md:hidden bg-base-100 border-t border-base-300 px-6 py-4 flex flex-col gap-4">
                    {NAV_LINKS.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            onClick={() => setMobileOpen(false)}
                            className={`text-[16px] py-2 transition-colors ${isActive(to) ? "text-base-content font-bold border-l-2 border-primary pl-2" : "text-base-content/70"}`}
                        >
                            {label}
                        </Link>
                    ))}

                    {/* Mobile Theme Toggle Row */}
                    <div className="flex items-center justify-between py-2 border-t border-base-300 text-sm font-medium text-base-content/80">
                        <span>Theme Mode</span>
                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-base-300 bg-base-200 text-base-content text-xs font-semibold cursor-pointer"
                        >
                            {isDark ? <><Sun size={14} className="text-amber-400" /> Dark</> : <><Moon size={14} /> Light</>}
                        </button>
                    </div>

                    <div className="border-t border-base-300 pt-4 flex gap-3">
                        {!loading && (user ? (
                            <>
                                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-3 text-[14px] font-bold text-base-content border border-base-300 rounded-[4px]">Dashboard</Link>
                                <button onClick={handleLogout} className="flex-1 py-3 text-[14px] font-bold text-white bg-rose-600 rounded-[4px] cursor-pointer">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-3 text-[14px] font-bold text-base-content border border-base-300 rounded-[4px]">Login</Link>
                                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-3 text-[14px] font-bold text-primary-content bg-primary rounded-[4px]">Register</Link>
                            </>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
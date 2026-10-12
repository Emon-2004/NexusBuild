import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link, useNavigate } from 'react-router';
import { Lock, Eye, EyeOff, ArrowRight, AtSign } from 'lucide-react';
import login_image from '../../assets/pics/login_pic.png';
import Footer from '../../Components/Footer/Footer';
import Navbar from '../../Components/Header/Navbar';
import ForgotPasswordModal from '../../Components/ForgotPasswordModal/ForgotPasswordModal';
import { useAuth } from '../../Context/AuthContext';
// ─── Login logging is handled inline below via supabase.rpc() ────────────────

const Login = () => {
    const navigate = useNavigate();
    const { user, signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    // Navigate only after AuthContext has the user
    useEffect(() => {
        if (user) {
            if (redirecting) {
                const timer = setTimeout(() => {
                    if (user.role === 'admin') navigate('/admin', { replace: true });
                    else navigate('/dashboard', { replace: true });
                }, 1000);
                return () => clearTimeout(timer);
            } else {
                if (user.role === 'admin') navigate('/admin', { replace: true });
                else navigate('/dashboard', { replace: true });
            }
        }
    }, [user, navigate, redirecting]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const loginEmail = email.toLowerCase() === 'admin' ? 'admin@reliance.com' : email;
            await signIn(loginEmail, password);
            setRedirecting(true);
        } catch (err) {
            setError(err.message || 'Invalid email or password. Please use a registered client email, or "admin@reliance.com".');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (demoEmail, demoPassword) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
        setError('');
        setLoading(true);

        try {
            await signIn(demoEmail, demoPassword);
            setRedirecting(true);
        } catch (err) {
            setError(err.message || 'Demo login failed. Please verify credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f3f4f5]">
            <Navbar />
            {/* ── Main content area ── */}
            <div className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:py-12 lg:px-6">

                {/*
                 * DESKTOP (lg+): Exact Figma split-screen — 50/50, 852px tall card, flush edge-to-edge
                 * TABLET (sm-lg): Single column, form panel centered with max-width
                 * MOBILE (<sm): Full-width stacked, touch-friendly
                 */}
                <div className="
                    relative w-full bg-white overflow-hidden
                    flex flex-col
                    lg:flex-row lg:min-h-[700px] lg:max-w-[1280px] lg:shadow-[0px_25px_50px_#00000040]
                    sm:max-w-2xl sm:rounded-xl sm:shadow-[0px_10px_15px_#0000001a]
                    max-w-full rounded-lg shadow-[0px_4px_6px_#0000001a]
                    lg:rounded-2xl lg:mx-auto
                ">

                    {/* ── LEFT PANEL — Hero image (desktop only) ─────────────── */}
                    <div className="hidden lg:block lg:w-1/2 relative overflow-hidden flex-shrink-0">

                        {/* Hero image */}
                        <img
                            src={login_image}
                            alt="NexusBuild Architectural Excellence"
                            className="absolute inset-0 w-full h-full object-cover select-none"
                        />

                        {/* Dark overlay — #000f22 from design tokens (primary-dark) */}
                        <div className="absolute inset-0 bg-[#000f22]/80" />

                        {/* Decorative geometric shape — matches the Figma vector overlay */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[165px] h-[165px] border border-white/10 rotate-45 flex items-center justify-center">
                            <div className="w-24 h-24 border border-white/20 flex items-center justify-center">
                                <svg viewBox="0 0 92 92" fill="none" className="w-14 h-14 opacity-60">
                                    <path d="M10 82L46 10L82 82H10Z" stroke="white" strokeWidth="2" fill="none" />
                                    <path d="M28 60L46 26L64 60H28Z" fill="white" fillOpacity="0.15" />
                                </svg>
                            </div>
                        </div>

                        {/* Text content — Figma: 80px padding all sides, vertical layout, 16px gap */}
                        <div className="absolute inset-0 flex flex-col justify-center p-20 z-10">
                            <div className="flex flex-col gap-4 max-w-[480px]">

                                {/* Heading block */}
                                <div className="flex flex-col gap-4">
                                    <div>
                                        {/* Eyebrow */}
                                        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#fe762a] mb-3">
                                            Client Portal
                                        </p>
                                        {/* Main heading — Figma: 32px, bold, white */}
                                        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">
                                            Architectural Excellence,<br />
                                            Engineered for You.
                                        </h1>
                                    </div>
                                    {/* Sub-text — Figma: 14px, #c4c6ce (gray-500 token) */}
                                    <p className="text-[14px] text-[#c4c6ce] leading-relaxed">
                                        Access the industry's most advanced GIS-mapped property management ecosystem. Securely manage assets, track financials, and explore development opportunities.
                                    </p>
                                </div>

                                {/* Stat pills — bottom of left panel */}
                                <div className="flex items-center gap-8 mt-4 pt-6 border-t border-white/10">
                                    <div>
                                        <div className="text-[24px] font-bold text-white tracking-tight">4.8k+</div>
                                        <div className="text-[10px] font-semibold text-[#74777e] uppercase tracking-widest mt-0.5">Managed Assets</div>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <div>
                                        <div className="text-[24px] font-bold text-white tracking-tight">98%</div>
                                        <div className="text-[10px] font-semibold text-[#74777e] uppercase tracking-widest mt-0.5">Client Satisfaction</div>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <div>
                                        <div className="text-[24px] font-bold text-white tracking-tight">12yr</div>
                                        <div className="text-[10px] font-semibold text-[#74777e] uppercase tracking-widest mt-0.5">Market Presence</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT PANEL — Login form ───────────────────────────── */}
                    {/*
                     * Figma: 640px wide, white bg, 80px top/bottom pad, 24px left/right on outer,
                     * inner container 448px wide centered, 80px gap between header block and form
                     */}
                    <div className="
                        w-full bg-white flex items-center justify-center
                        lg:w-1/2 lg:flex-shrink-0
                        px-4 py-10
                        sm:px-10 sm:py-12
                        lg:px-6 lg:py-20
                    ">
                        {/* Back to home — top right, absolute on desktop */}
                        <Link
                            to="/"
                            className="
                                absolute top-4 right-4 z-20
                                text-[12px] font-medium text-[#74777e] hover:text-[#0a2540]
                                transition-colors duration-200
                                hidden lg:block
                            "
                        >
                            &larr; Back to Home
                        </Link>

                        {/* Inner container — Figma: 448px wide, 80px gap between sections */}
                        <div className="w-full max-w-[448px] flex flex-col gap-10 sm:gap-16 lg:gap-20">

                            {/* Header block — Figma: 448x64, 8px gap */}
                            <div className="flex flex-col gap-2">
                                {/* Mobile back link */}
                                <Link
                                    to="/"
                                    className="text-[12px] text-[#74777e] hover:text-[#0a2540] transition-colors mb-1 lg:hidden"
                                >
                                    &larr; Back to Home
                                </Link>

                                {/* Figma: brand wordmark above heading on desktop */}
                                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#fe762a] hidden lg:block">
                                    NexusBuild
                                </p>
                                {/* Heading — Figma Heading 2 node: 32px bold, #000f22 */}
                                <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-[#000f22] tracking-tight leading-tight">
                                    Welcome Back
                                </h2>
                                {/* Sub-label — Figma: 14px, #74777e (gray-600 token) */}
                                <p className="text-[14px] text-[#74777e] leading-relaxed">
                                    Please enter your credentials to access your portal.
                                </p>
                            </div>

                            {/* Form block — Figma: Form node 448x444, 24px gap between fields */}
                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                                {/* Email input — Figma: Email Input 448x77, 8px gap label→input */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-[#43474d] uppercase tracking-[0.14em]">
                                        Email Address
                                    </label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-[#74777e] pointer-events-none flex items-center">
                                            <AtSign size={16} />
                                        </span>
                                        <input
                                            type="text"
                                            className="
                                                w-full pl-11 pr-4 py-3.5
                                                bg-[#f8f9fa] border border-[#e1e3e4]
                                                rounded-lg
                                                text-[14px] text-[#191c1d] placeholder-[#74777e]
                                                focus:outline-none focus:border-[#0a2540] focus:ring-1 focus:ring-[#0a2540]/20
                                                transition-all duration-200
                                                min-h-[44px]
                                            "
                                            placeholder="Email or Username (e.g. Admin)"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password input — Figma: Password Input 448x77, 8px gap */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-[#43474d] uppercase tracking-[0.14em]">
                                        Password
                                    </label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-[#74777e] pointer-events-none flex items-center">
                                            <Lock size={16} />
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="
                                                w-full pl-11 pr-12 py-3.5
                                                bg-[#f8f9fa] border border-[#e1e3e4]
                                                rounded-lg
                                                text-[14px] text-[#191c1d] placeholder-[#74777e]
                                                focus:outline-none focus:border-[#0a2540] focus:ring-1 focus:ring-[#0a2540]/20
                                                transition-all duration-200
                                                min-h-[44px]
                                            "
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 text-[#74777e] hover:text-[#43474d] focus:outline-none flex items-center min-h-[44px] min-w-[44px] justify-end"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me row — Figma: Remember Me 448x24, horizontal layout */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2.5 text-[14px] text-[#43474d] select-none cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-[#c4c6ce] accent-[#0a2540] cursor-pointer"
                                        />
                                        Remember me
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotModal(true)}
                                        className="text-[14px] text-[#0a2540] font-semibold hover:text-[#fe762a] focus:outline-none cursor-pointer transition-colors duration-200"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Error state */}
                                {error && (
                                    <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
                                        <p className="text-[12px] text-red-600 font-medium leading-snug">{error}</p>
                                    </div>
                                )}

                                {/* CTA Button — Figma: 448x52, fill=#fe762a (accent token), radius=8px, 16px V pad, 8px gap */}
                                <button
                                    type="submit"
                                    disabled={loading || redirecting}
                                    className="
                                        w-full flex items-center justify-center gap-2
                                        bg-[#fe762a] hover:bg-[#a14000]
                                        text-white font-semibold text-[16px]
                                        py-3.5 px-6 rounded-lg min-h-[52px]
                                        transition-colors duration-200
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        shadow-[0px_4px_6px_#0000001a]
                                        cursor-pointer
                                    "
                                >
                                    {redirecting ? (
                                        <span className="flex items-center gap-2">
                                            <span className="loading loading-spinner loading-xs text-white"></span>
                                            Redirecting...
                                        </span>
                                    ) : loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="loading loading-dots loading-sm text-white"></span>
                                            Signing in...
                                        </span>
                                    ) : (
                                        <>
                                            Sign In <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>

                                {/* Demo Credentials Buttons — Enabled when VITE_ENABLE_DEMO === "true" */}
                                {import.meta.env.VITE_ENABLE_DEMO === "true" && (
                                    <div className="flex flex-col gap-2 pt-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-px bg-[#e1e3e4]" />
                                            <span className="text-[11px] text-[#74777e] font-semibold uppercase tracking-wider">
                                                Quick Demo Login
                                            </span>
                                            <div className="flex-1 h-px bg-[#e1e3e4]" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                disabled={loading || redirecting}
                                                onClick={() => handleDemoLogin("user@example.com", "User@123456")}
                                                className="
                                                    w-full py-2.5 px-3 border border-[#c4c6ce] hover:border-[#0a2540]
                                                    bg-white hover:bg-slate-50 text-[#000f22] font-semibold text-[13px]
                                                    rounded-lg transition-all duration-200 disabled:opacity-50
                                                    disabled:cursor-not-allowed cursor-pointer text-center
                                                "
                                            >
                                                Demo User
                                            </button>
                                            <button
                                                type="button"
                                                disabled={loading || redirecting}
                                                onClick={() => handleDemoLogin("admin@example.com", "Admin@123456")}
                                                className="
                                                    w-full py-2.5 px-3 border border-[#000f22] bg-[#000f22] hover:bg-[#0a2540]
                                                    text-white font-semibold text-[13px] rounded-lg transition-all duration-200
                                                    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-center
                                                "
                                            >
                                                Demo Admin
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Divider + Register link — Figma: Divider 448x48 with 16px V padding */}
                                <div className="flex flex-col items-center gap-4 pt-2">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="flex-1 h-px bg-[#e1e3e4]" />
                                        <span className="text-[12px] text-[#74777e] font-medium flex-shrink-0">or</span>
                                        <div className="flex-1 h-px bg-[#e1e3e4]" />
                                    </div>
                                    <p className="text-[14px] text-[#43474d] text-center">
                                        New to Reliance Housing?{' '}
                                        <Link
                                            to="/register"
                                            className="text-[#0a2540] font-bold hover:text-[#fe762a] transition-colors duration-200"
                                        >
                                            Create an account
                                        </Link>
                                    </p>
                                    {/* <Link
                                        to="/admin"
                                        className="text-[11px] text-[#74777e] hover:text-[#0a2540] transition-colors duration-200"
                                    >
                                        Login as Admin
                                    </Link> */}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
            <ForgotPasswordModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />
        </div>
    );
};

export default Login;
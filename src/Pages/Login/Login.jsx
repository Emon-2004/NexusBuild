import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link, useNavigate } from 'react-router';
import { Lock, Eye, EyeOff, ArrowRight, AtSign } from 'lucide-react';
import login_image from '../../assets/pics/login_pic.png';
import Footer from '../../Components/Footer/Footer';
import Navbar from '../../Components/Header/Navbar';
import ForgotPasswordModal from '../../Components/ForgotPasswordModal/ForgotPasswordModal';
import { useAuth } from '../../Context/AuthContext';
import { useDatabase } from '../../Context/DatabaseContext';
import { DEFAULT_SYSTEM_SETTINGS } from '../../config/defaultSettings';
import { Button, Input, Badge } from '../../Components/UI';
// ─── Login logging is handled inline below via supabase.rpc() ────────────────

const Login = () => {
    const navigate = useNavigate();
    const { user, signIn } = useAuth();
    const { systemSettings } = useDatabase();
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
            setError(err.message || 'Invalid email or password. Please use a registered client email or administrator account.');
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
        <div className="flex flex-col min-h-screen bg-base-200 text-base-content">
            <Navbar />
            {/* ── Main content area ── */}
            <div className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:py-12 lg:px-6">

                {/*
                 * DESKTOP (lg+): Exact Figma split-screen — 50/50, 852px tall card, flush edge-to-edge
                 * TABLET (sm-lg): Single column, form panel centered with max-width
                 * MOBILE (<sm): Full-width stacked, touch-friendly
                 */}
                <div className="
                    relative w-full bg-base-100 border border-base-300 overflow-hidden
                    flex flex-col
                    lg:flex-row lg:min-h-[700px] lg:max-w-[1280px] lg:shadow-2xl
                    sm:max-w-2xl sm:rounded-xl
                    max-w-full rounded-lg
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
                                        <div className="mb-3">
                                            <Badge variant="outline" size="sm" className="text-[#fe762a] border-[#fe762a]/50 font-semibold tracking-[0.2em] uppercase">
                                                Client Portal
                                            </Badge>
                                        </div>
                                        {/* Main heading — Figma: 32px, bold, white */}
                                        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">
                                            Architectural Excellence,<br />
                                            Engineered for You.
                                        </h1>
                                    </div>
                                    {/* Sub-text */}
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
                    <div className="
                        w-full bg-base-100 text-base-content flex items-center justify-center
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
                                text-[12px] font-medium text-base-content/70 hover:text-base-content
                                transition-colors duration-200
                                hidden lg:block
                            "
                        >
                            &larr; Back to Home
                        </Link>

                        {/* Inner container */}
                        <div className="w-full max-w-[448px] flex flex-col gap-10 sm:gap-16 lg:gap-20">

                            {/* Header block */}
                            <div className="flex flex-col gap-2">
                                {/* Mobile back link */}
                                <Link
                                    to="/"
                                    className="text-[12px] text-base-content/70 hover:text-base-content transition-colors mb-1 lg:hidden"
                                >
                                    &larr; Back to Home
                                </Link>

                                <div className="hidden lg:block mb-1">
                                    <Badge variant="primary" size="sm" className="font-bold tracking-wider">
                                        NexusBuild
                                    </Badge>
                                </div>
                                <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-base-content tracking-tight leading-tight">
                                    Welcome Back
                                </h2>
                                <p className="text-[14px] text-base-content/70 leading-relaxed">
                                    Please enter your credentials to access your portal.
                                </p>
                            </div>

                            {/* Form block */}
                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                                {/* Email input */}
                                <Input
                                    label="Email Address"
                                    type="text"
                                    placeholder="Email or Username (e.g. Admin)"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    leftIcon={<AtSign size={16} />}
                                    className="min-h-[44px]"
                                />

                                {/* Password input */}
                                <Input
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    leftIcon={<Lock size={16} />}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-base-content/60 hover:text-base-content focus:outline-none flex items-center min-h-[40px] cursor-pointer"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    }
                                    className="min-h-[44px]"
                                />

                                {/* Remember Me row */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2.5 text-[14px] text-base-content/80 select-none cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm checkbox-primary"
                                        />
                                        Remember me
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotModal(true)}
                                        className="text-[14px] text-primary font-semibold hover:underline focus:outline-none cursor-pointer transition-colors duration-200"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Error state */}
                                {error && (
                                    <div className="flex items-start gap-3 px-4 py-3 bg-error/10 border border-error/20 rounded-lg">
                                        <p className="text-[12px] text-error font-medium leading-snug">{error}</p>
                                    </div>
                                )}

                                {/* CTA Button */}
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    loading={loading || redirecting}
                                    rightIcon={!loading && !redirecting ? <ArrowRight size={16} /> : null}
                                    className="w-full min-h-[52px] shadow-md text-[16px] font-semibold"
                                >
                                    {redirecting ? 'Redirecting...' : loading ? 'Signing in...' : 'Sign In'}
                                </Button>

                                {/* Demo Credentials Buttons — Enabled when VITE_ENABLE_DEMO === "true" */}
                                {import.meta.env.VITE_ENABLE_DEMO === "true" && (
                                    <div className="flex flex-col gap-2 pt-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-px bg-base-300" />
                                            <span className="text-[11px] text-base-content/70 font-semibold uppercase tracking-wider">
                                                Quick Demo Login
                                            </span>
                                            <div className="flex-1 h-px bg-base-300" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                disabled={loading || redirecting}
                                                onClick={() => handleDemoLogin("user@example.com", "User@123456")}
                                                className="w-full border border-base-300 hover:border-primary text-base-content text-[13px] py-2.5"
                                            >
                                                Demo User
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="primary"
                                                size="sm"
                                                disabled={loading || redirecting}
                                                onClick={() => handleDemoLogin("admin@example.com", "Admin@123456")}
                                                className="w-full text-[13px] py-2.5"
                                            >
                                                Demo Admin
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Divider + Register link */}
                                <div className="flex flex-col items-center gap-4 pt-2">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="flex-1 h-px bg-base-300" />
                                        <span className="text-[12px] text-base-content/60 font-medium flex-shrink-0">or</span>
                                        <div className="flex-1 h-px bg-base-300" />
                                    </div>
                                    <p className="text-[14px] text-base-content/80 text-center">
                                        New to {systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName}?{' '}
                                        <Link
                                            to="/register"
                                            className="text-primary font-bold hover:underline transition-colors duration-200"
                                        >
                                            Create an account
                                        </Link>
                                    </p>
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
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import register_image from '../../assets/pics/register_pic.svg';
import Footer from '../../Components/Footer/Footer';
import Navbar from '../../Components/Header/Navbar';
import { useDatabase } from '../../Context/DatabaseContext';
import { supabase } from '../../lib/supabaseClient';

// ─── Register ────────────────────────────────────────────────────────────────
// Figma frame: 1280×1450, node-id=1:451
// Layout: Horizontal split — 768px visual column (left) / 512px form column (right)
// Left:  Hero image + gradient overlay, pill badge, 48px heading, 18px body, stats grid
// Right: #f8f9fa bg, 80px all-around padding, 352px form container, 48px gap sections
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared input field wrapper — defined at MODULE SCOPE so it is stable across
// renders. Defining sub-components inside a parent function causes React to
// treat them as new types on every render, which unmounts and remounts the DOM
// node (losing focus). Module-level = single, stable reference.
const Field = ({ label, hint, children }) => (
    <div className="flex flex-col gap-2">
        <label className="text-[14px] font-semibold text-base-content uppercase tracking-[0.06em]">
            {label}
        </label>
        {children}
        {hint && (
            <p className="text-[12px] font-medium text-base-content/70 leading-snug">{hint}</p>
        )}
    </div>
);

const IconWrap = ({ children }) => (
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/60 pointer-events-none flex items-center">
        {children}
    </span>
);

const inputCls = `
    w-full pl-12 pr-4 py-[18px]
    bg-base-200 border border-base-300 rounded-[4px]
    text-[14px] font-medium text-base-content placeholder:text-base-content/40
    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
    transition-all duration-200 min-h-[44px]
`;

const Register = () => {
    const navigate = useNavigate();
    const { addApplication } = useDatabase();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
 
        try {
            // 1. Register user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phoneNumber
                    }
                }
            });
 
            if (authError) throw authError;
 
            // Immediately sign out to prevent automatic login / dashboard access
            await supabase.auth.signOut();
 
            // 2. Push to DB as a pending onboarding application
            await addApplication({
                name: fullName,
                unit: JSON.stringify({
                    email: email,
                    phone: phoneNumber,
                    unit: 'Not specified'
                }),
                stage: 'Verify Client',
                status: 'Pending',
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            });

            setSuccess('Registration successful! Redirecting to login page...');
            setFullName('');
            setEmail('');
            setPhoneNumber('');
            setPassword('');

            // Redirect to login page after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'An error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-base-200 text-base-content">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:py-12 lg:px-6">

                <div className="
                    relative w-full bg-base-100 border border-base-300 overflow-hidden
                    flex flex-col
                    lg:flex-row lg:min-h-[700px] lg:max-w-[1280px] lg:shadow-2xl
                    sm:max-w-2xl sm:rounded-xl
                    max-w-full rounded-lg
                    lg:rounded-2xl lg:mx-auto
                ">

                    {/* ══ LEFT PANEL — Visual Column (768px / 60%) ══════════════ */}
                    <div className="hidden lg:block lg:w-[60%] relative overflow-hidden">

                        {/* Hero image */}
                        <img
                            src={register_image}
                            alt="NexusBuild Empowering Infrastructure"
                            className="absolute inset-0 w-full h-full object-cover select-none"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#000f22]/85 via-[#000f22]/60 to-[#0a2540]/40" />

                        {/* Content on Image */}
                        <div className="absolute inset-0 flex flex-col justify-center p-20 z-10">
                            <div className="flex flex-col gap-6 max-w-[576px]">

                                <div className="flex flex-col gap-4">
                                    <div className="inline-flex self-start">
                                        <span className="bg-[#fe762a] text-[#5e2200] text-[14px] font-semibold rounded-[2px] px-4 py-1 uppercase tracking-[0.04em]">
                                            Premium Infrastructure
                                        </span>
                                    </div>

                                    <h1 className="text-[48px] font-bold text-white leading-tight tracking-tight">
                                        Empowering<br />Infrastructure
                                    </h1>

                                    <p className="text-[18px] font-normal text-white leading-relaxed max-w-[576px]">
                                        Join the architectural vanguard. NexusBuild leverages advanced GIS mapping and sustainable engineering to create spaces that define the next generation of urban living.
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                <div className="flex items-start gap-6 pt-10">
                                    <div className="flex flex-col gap-1 pl-4 border-l-2 border-[#a14000]">
                                        <span className="text-[32px] font-semibold text-[#fe762a] leading-none">150+</span>
                                        <span className="text-[14px] font-semibold text-white">Completed Projects</span>
                                    </div>

                                    <div className="flex flex-col gap-1 pl-4 border-l-2 border-[#a14000]">
                                        <span className="text-[32px] font-semibold text-[#fe762a] leading-none">12k+</span>
                                        <span className="text-[14px] font-semibold text-white">Happy Families</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ══ RIGHT PANEL — Form Column (512px / 40%) ═══════════════ */}
                    <div className="
                        w-full bg-base-100 text-base-content flex items-center justify-center
                        lg:w-[40%] lg:flex-shrink-0
                        px-4 py-10
                        sm:px-12 sm:py-14
                        lg:px-20 lg:py-12
                    ">
                        {/* Inner container */}
                        <div className="w-full max-w-[352px] flex flex-col gap-12">

                            {/* Header block */}
                            <div className="flex flex-col gap-2">
                                <Link
                                    to="/"
                                    className="text-[12px] text-base-content/70 hover:text-base-content transition-colors mb-2 lg:hidden"
                                >
                                    &larr; Back to Home
                                </Link>
                                <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] font-semibold text-base-content leading-tight tracking-tight">
                                    Create Your Account
                                </h2>
                                <p className="text-[16px] font-normal text-base-content/70 leading-snug">
                                    Enter the exclusive portal for infrastructure excellence.
                                </p>
                            </div>

                            {/* Form */}
                            <div className="flex flex-col gap-3">

                                {/* Success banner */}
                                {success && (
                                    <div className="flex items-start gap-3 px-4 py-4 bg-success/10 border border-success/20 rounded-[4px] mb-2">
                                        <CheckCircle2 size={16} className="text-success mt-0.5 flex-shrink-0" />
                                        <p className="text-[14px] font-medium text-success leading-snug">{success}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                                    {/* ── Full Name ── */}
                                    <Field label="Full Name">
                                        <div className="relative">
                                            <IconWrap><User size={16} /></IconWrap>
                                            <input
                                                type="text"
                                                className={inputCls}
                                                placeholder="John Doe"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </Field>

                                    {/* ── Email Address ── */}
                                    <Field label="Email Address">
                                        <div className="relative">
                                            <IconWrap><Mail size={16} /></IconWrap>
                                            <input
                                                type="email"
                                                className={inputCls}
                                                placeholder="john@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </Field>

                                    {/* ── Phone Number ── */}
                                    <Field label="Phone Number">
                                        <div className="relative">
                                            <IconWrap><Phone size={16} /></IconWrap>
                                            <input
                                                type="tel"
                                                inputMode="tel"
                                                className={inputCls}
                                                placeholder="+880 1XXX-XXXXXX"
                                                value={phoneNumber}
                                                onKeyDown={(e) => {
                                                    const allowed = /^[0-9+\-() ]$/;
                                                    const nav = [
                                                        'Backspace','Delete','Tab','ArrowLeft',
                                                        'ArrowRight','Home','End',
                                                    ];
                                                    if (!allowed.test(e.key) && !nav.includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const cleaned = e.target.value.replace(/[^0-9+\-() ]/g, '');
                                                    setPhoneNumber(cleaned);
                                                }}
                                            />
                                        </div>
                                    </Field>

                                    {/* ── Password ── */}
                                    <Field
                                        label="Password"
                                        hint="Minimum 8 characters with a mix of symbols."
                                    >
                                        <div className="relative">
                                            <IconWrap><Lock size={16} /></IconWrap>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className={`${inputCls} pr-12`}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content focus:outline-none flex items-center min-h-[44px] min-w-[44px] justify-end cursor-pointer"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </Field>

                                    {/* ── Terms ── */}
                                    <div className="flex items-start gap-4 pt-2">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            className="checkbox checkbox-sm checkbox-primary mt-0.5 rounded-[2px]"
                                            required
                                        />
                                        <label
                                            htmlFor="terms"
                                            className="text-[14px] font-semibold text-base-content/80 leading-snug select-none cursor-pointer"
                                        >
                                            I agree to the{' '}
                                            <Link to="/terms" className="text-primary hover:underline transition-colors">Terms of Service</Link>
                                            {' '}and{' '}
                                            <Link to="/privacy" className="text-primary hover:underline transition-colors">Privacy Policy</Link>
                                        </label>
                                    </div>

                                    {/* Error state */}
                                    {error && (
                                        <div className="px-4 py-3 bg-error/10 border border-error/20 rounded-[4px]">
                                            <p className="text-[12px] font-medium text-error leading-snug">{error}</p>
                                        </div>
                                    )}

                                    {/* ── CTA Button ── */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="
                                            w-full flex items-center justify-center gap-4
                                            bg-primary hover:opacity-90
                                            text-primary-content
                                            font-semibold text-[14px] uppercase tracking-[0.06em]
                                            py-5 rounded-[4px] min-h-[58px]
                                            transition-opacity duration-200
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            shadow-md
                                            cursor-pointer
                                        "
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="loading loading-dots loading-sm text-primary-content"></span>
                                                Registering...
                                            </span>
                                        ) : (
                                            <>
                                                Register Account <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>

                                    {/* Sign-in link */}
                                    <p className="text-[16px] font-normal text-base-content/75 text-center">
                                        Already have an account?{' '}
                                        <Link
                                            to="/login"
                                            className="font-semibold text-primary hover:underline transition-colors duration-200"
                                        >
                                            Sign in here
                                        </Link>
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Register;
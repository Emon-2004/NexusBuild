import { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { showToast } from '../Toast/globalToast';
import { Button, Input, Badge } from '../UI';

export const NewsletterBar = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        const trimmedEmail = email.trim().toLowerCase();

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
            showToast('Please enter a valid email address.', 'error', 'Invalid Email');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('subscribers')
                .insert([{ email: trimmedEmail, status: 'active' }]);

            if (error) {
                // Handle duplicate email unique constraint (code 23505)
                if (error.code === '23505' || error.message?.toLowerCase().includes('duplicate') || error.message?.toLowerCase().includes('unique')) {
                    showToast('You are already subscribed to our newsletter!', 'info', 'Already Subscribed');
                    setSubscribed(true);
                } else {
                    showToast(error.message || 'Subscription failed. Please try again later.', 'error', 'Subscription Failed');
                }
            } else {
                showToast('Thank you for subscribing! You will receive our latest market reports and project updates.', 'success', 'Subscribed Successfully');
                setSubscribed(true);
                setEmail('');
            }
        } catch (err) {
            showToast(err.message || 'An unexpected error occurred. Please try again.', 'error', 'Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            className="w-full py-16 px-6 sm:px-10 lg:px-12 bg-gradient-to-br from-[#000f22] via-[#001738] to-[#0a2540] text-white relative overflow-hidden"
            aria-label="Newsletter Subscription"
        >
            {/* Subtle architectural background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border-[32px] border-white/20" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full border-[32px] border-[#fe762a]/30" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                {/* Left Text Block */}
                <div className="space-y-3 max-w-xl text-center lg:text-left">
                    <Badge
                        variant="primary"
                        size="sm"
                        className="bg-[#fe762a] text-white border-none font-bold uppercase tracking-wider text-[11px]"
                    >
                        <Sparkles size={12} className="inline mr-1" />
                        Stay Ahead
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                        Receive Exclusive Market Reports &amp; Pre-Launch Allocations
                    </h2>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                        Join over 1,800+ real estate investors and homeowners in Narayanganj. Get quarterly valuation insights, regulatory updates, and early access to new developments.
                    </p>
                    <div className="flex items-center justify-center lg:justify-start gap-4 text-xs text-white/60 pt-1">
                        <span className="flex items-center gap-1">
                            <ShieldCheck size={14} className="text-emerald-400" />
                            No spam ever
                        </span>
                        <span>•</span>
                        <span>Unsubscribe anytime</span>
                        <span>•</span>
                        <span>Strict privacy policy</span>
                    </div>
                </div>

                {/* Right Form Card */}
                <div className="w-full lg:max-w-md bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/15 shadow-2xl">
                    {subscribed ? (
                        <div className="text-center py-4 space-y-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                                <CheckCircle2 size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-white">You're on the VIP list!</h3>
                            <p className="text-xs text-white/80">
                                Check your inbox soon for our latest real estate market analysis report.
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSubscribed(false)}
                                className="text-white/70 hover:text-white text-xs underline"
                            >
                                Subscribe another email
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubscribe} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-white/80 uppercase tracking-wider block text-left">
                                    Work or Personal Email
                                </label>
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    leftIcon={<Mail size={16} className="text-white/60" />}
                                    size="md"
                                    className="bg-white/15 text-white placeholder:text-white/50 border-white/20 focus:border-[#fe762a] focus:bg-white/20"
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                loading={loading}
                                rightIcon={<ArrowRight size={16} />}
                                className="w-full bg-[#fe762a] hover:bg-[#d95106] text-white border-none font-bold py-3.5 shadow-lg min-h-[46px]"
                            >
                                {loading ? 'Subscribing...' : 'Subscribe to Newsletter'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};

export default NewsletterBar;

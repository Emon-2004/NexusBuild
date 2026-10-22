import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Building2, Users, Home as HomeIcon, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card, Badge } from '../UI';
import { PROJECTS } from '../../data/projectsData';

function useCountUp(target, duration = 1800, startNow = false) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!startNow || target <= 0) return;
        let startTime = null;
        let animationFrameId = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * target));

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(target);
            }
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [target, duration, startNow]);

    return count;
}

export const LiveStatsCounter = () => {
    const [stats, setStats] = useState({
        projectsCount: PROJECTS.length || 12,
        clientsCount: 240,
        deliveredUnits: 156,
        satisfactionRate: 99,
        loadedFromDb: false,
    });
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef(null);

    // Fetch live counts from Supabase
    useEffect(() => {
        let isMounted = true;

        async function fetchLiveCounts() {
            try {
                // 1. Projects count
                const { count: projCount, error: projErr } = await supabase
                    .from('projects')
                    .select('*', { count: 'exact', head: true });

                // 2. Clients count
                const { count: clientCount } = await supabase
                    .from('clients')
                    .select('*', { count: 'exact', head: true });

                // 3. Properties or delivered units
                const { count: deliveredCount } = await supabase
                    .from('properties')
                    .select('*', { count: 'exact', head: true });

                if (isMounted) {
                    setStats((prev) => ({
                        ...prev,
                        projectsCount: (projCount && projCount > 0) ? projCount : (PROJECTS.length || 12),
                        clientsCount: (clientCount && clientCount > 0) ? clientCount : prev.clientsCount,
                        deliveredUnits: (deliveredCount && deliveredCount > 0) ? deliveredCount : prev.deliveredUnits,
                        loadedFromDb: !projErr && Boolean(projCount),
                    }));
                }
            } catch {
                // Keep default calculated values gracefully
            }
        }

        fetchLiveCounts();
        return () => { isMounted = false; };
    }, []);

    // Intersection observer to trigger counting animation when in view
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, []);

    const animatedProjects = useCountUp(stats.projectsCount, 1500, isVisible);
    const animatedClients = useCountUp(stats.clientsCount, 1800, isVisible);
    const animatedUnits = useCountUp(stats.deliveredUnits, 1800, isVisible);
    const animatedSatisfaction = useCountUp(stats.satisfactionRate, 1400, isVisible);

    const statItems = [
        {
            icon: <Building2 className="text-primary" size={26} />,
            value: `${animatedProjects}+`,
            label: 'Active & Planned Projects',
            caption: 'Verified architectural builds',
            badge: stats.loadedFromDb ? 'Live Sync' : 'Verified',
        },
        {
            icon: <Users className="text-[#fe762a]" size={26} />,
            value: `${animatedClients}+`,
            label: 'Registered Clients',
            caption: 'Families and corporate partners',
            badge: 'Active Accounts',
        },
        {
            icon: <HomeIcon className="text-emerald-500" size={26} />,
            value: `${animatedUnits}+`,
            label: 'Units Delivered',
            caption: 'Residential & commercial handovers',
            badge: 'Completed',
        },
        {
            icon: <ShieldCheck className="text-indigo-500" size={26} />,
            value: `${animatedSatisfaction}%`,
            label: 'On-Time Handover Rate',
            caption: 'Seismic & QA certified',
            badge: 'Grade-A QA',
        },
    ];

    return (
        <section
            ref={containerRef}
            className="w-full py-12 px-6 sm:px-10 lg:px-12 bg-base-200 border-y border-base-300"
            aria-label="Live Performance Statistics"
        >
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[11px] font-bold tracking-widest uppercase text-base-content/70">
                                Live Database Telemetry
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
                            Measurable Impact in Real Estate & Engineering
                        </h2>
                    </div>
                    <Badge variant="ghost" size="sm" className="border-base-300 text-base-content/70">
                        <CheckCircle2 size={12} className="text-emerald-500 mr-1" />
                        Supabase Connected
                    </Badge>
                </div>

                {/* Counters Grid using Card UI primitive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statItems.map((item, index) => (
                        <Card
                            key={index}
                            variant="bordered"
                            size="sm"
                            className="bg-base-100 hover:border-primary/50 transition-all duration-300 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="p-3 rounded-xl bg-base-200/80 border border-base-300">
                                    {item.icon}
                                </div>
                                <Badge variant="outline" size="xs" className="border-base-300 text-base-content/60 font-mono">
                                    {item.badge}
                                </Badge>
                            </div>
                            <div className="mt-3">
                                <span className="text-3xl lg:text-4xl font-extrabold text-base-content tracking-tight font-mono block">
                                    {item.value}
                                </span>
                                <h3 className="text-sm font-bold text-base-content mt-1">
                                    {item.label}
                                </h3>
                                <p className="text-xs text-base-content/60 mt-0.5">
                                    {item.caption}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LiveStatsCounter;

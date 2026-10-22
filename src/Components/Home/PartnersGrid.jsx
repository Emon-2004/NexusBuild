import { Shield, Award, CheckCircle, FileCheck, Landmark, Building } from 'lucide-react';
import { Badge } from '../UI';

const PARTNERS = [
    {
        id: 'rajuk',
        name: 'RAJUK',
        fullName: 'Rajdhani Unnayan Kartripakkha',
        role: 'Approved Developer Masterplan',
        icon: <Landmark size={24} className="text-primary" />,
        badge: 'Reg #NK-4182',
    },
    {
        id: 'rehab',
        name: 'REHAB',
        fullName: 'Real Estate & Housing Association',
        role: 'Verified Corporate Member',
        icon: <Building size={24} className="text-[#fe762a]" />,
        badge: 'Member #1420',
    },
    {
        id: 'bnbc',
        name: 'BNBC 2020',
        fullName: 'Bangladesh National Building Code',
        role: 'Grade-A Seismic & Fire Safety',
        icon: <Shield size={24} className="text-emerald-500" />,
        badge: 'Seismic Zone 2',
    },
    {
        id: 'iso',
        name: 'ISO 9001:2015',
        fullName: 'International Organization for Standardization',
        role: 'Quality Management Certified',
        icon: <Award size={24} className="text-indigo-500" />,
        badge: 'QA Certified',
    },
    {
        id: 'ncc',
        name: 'NCC Registered',
        fullName: 'Narayanganj City Corporation',
        role: 'Municipal Civic Clearance',
        icon: <FileCheck size={24} className="text-amber-500" />,
        badge: 'Sadar & Chashiara',
    },
    {
        id: 'buet',
        name: 'BUET Vetted',
        fullName: 'Civil Engineering Consultation',
        role: 'Sub-soil & Piling Advisory',
        icon: <CheckCircle size={24} className="text-sky-500" />,
        badge: 'Soil Tested',
    },
];

export const PartnersGrid = () => {
    return (
        <section
            className="w-full py-12 px-6 sm:px-10 lg:px-12 bg-base-200/60 border-t border-base-300 text-base-content"
            aria-label="Partners and Statutory Certifications"
        >
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Section Header */}
                <div className="text-center space-y-2 max-w-2xl mx-auto">
                    <Badge variant="ghost" size="sm" className="border-base-300 text-base-content/70 font-semibold uppercase tracking-wider text-[11px]">
                        Accreditations &amp; Standards
                    </Badge>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-base-content tracking-tight">
                        Built Upon Strict Statutory &amp; Regulatory Compliance
                    </h2>
                    <p className="text-xs sm:text-sm text-base-content/70">
                        Every NexusBuild asset strictly conforms to national building codes, municipal zoning permits, and independent geotechnical vetting.
                    </p>
                </div>

                {/* Partners Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {PARTNERS.map((partner) => (
                        <div
                            key={partner.id}
                            className="bg-base-100 border border-base-300 hover:border-primary/50 hover:shadow-md p-4 rounded-xl flex flex-col items-center text-center justify-between gap-3 transition-all duration-200 group"
                        >
                            {/* Logo Icon */}
                            <div className="w-12 h-12 rounded-xl bg-base-200/80 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                {partner.icon}
                            </div>

                            {/* Name & Details */}
                            <div className="space-y-1">
                                <h3 className="text-sm font-extrabold text-base-content tracking-tight group-hover:text-primary transition-colors">
                                    {partner.name}
                                </h3>
                                <p className="text-[11px] font-medium text-base-content/80 leading-tight">
                                    {partner.fullName}
                                </p>
                                <p className="text-[10px] text-base-content/60 leading-tight">
                                    {partner.role}
                                </p>
                            </div>

                            {/* Badge */}
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-base-200 text-base-content/70 border border-base-300/60">
                                {partner.badge}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PartnersGrid;

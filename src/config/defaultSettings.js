/**
 * Default System Settings Configuration
 * 
 * Centralized place for branding, contact info, and default copy.
 * The application loads these as initial fallbacks so that out of the box
 * the platform displays Reliance Housing Ltd.'s details, while allowing
 * dynamic overrides via the Admin Settings panel or Supabase system_settings.
 */

export const DEFAULT_SYSTEM_SETTINGS = {
    companyName: 'Reliance Housing Ltd.',
    regNumber: 'REG-2023-998811',
    headOfficeAddress: 'Shamabay New Market, 259 B B Road, Narayanganj',
    supportEmail: 'info@reliancehousing.com',
    supportPhone: '+880 1234 567890',
    primaryColor: '#1A4B9C',
    companyLogo: null,
    heroTagline: 'Reliance Housing Ltd.',
    heroHeadline: "Building Narayanganj's Future Architecture.",
    heroSubtitle: 'Precision-engineered residential complexes, commercial hubs, and GIS-mapped land developments designed for the next generation.',
    heroCta1Text: 'Explore All Projects',
    heroCta1Link: '/projects',
    heroCta2Text: 'Interactive GIS Map',
    heroCta2Link: '/gismap',
    heroImage: null,

    // About Page Configurations
    aboutHeroEyebrow: 'Est. 2003 · Narayanganj, Bangladesh',
    aboutHeroHeadline: 'Decades of Trust in Narayanganj.',
    aboutHeroSubtitle: "What began in the bustling corridors of Shamabay New Market, B B Road, has evolved into Narayanganj's hallmark of infrastructure excellence. Reliance Housing Ltd. was founded on a simple promise: to build not just structures, but legacies of trust and architectural integrity.",
    aboutHeroCta1Text: 'Explore Our Heritage',
    aboutHeroCta1Link: '/',
    aboutHeroCta2Text: 'View on Map',
    aboutHeroCta2Link: '/gismap',
    aboutStoryText: 'Since our founding at Shamabay New Market, Reliance Housing Ltd. has been synonymous with stability and innovation in the local infrastructure landscape.',
    heritageHeadline: 'Decades of Trust in Narayanganj.',
    heritageStoryText: 'Since our founding at Shamabay New Market, Reliance Housing Ltd. has stood as a symbol of structural reliability and community growth.',
    projectsStoryText: 'Since our founding at Shamabay New Market, Reliance Housing Ltd. has been synonymous with stability and innovation in the local infrastructure landscape.',
    aboutPeopleEyebrow: 'Our People',
    aboutPeopleTitle: "The Visionaries Behind Narayanganj's Finest Landmarks",
    aboutPeopleSubtitle: "The visionaries behind Narayanganj's finest landmarks.",
    aboutTeamMembers: [
        {
            name: 'Mohammed A. Rahman',
            role: 'Chief Executive Officer',
            badge: 'CEO',
            bg: '#000f22',
            text: '#fff',
            bio: 'Over 25 years leading landmark infrastructure projects across Bangladesh.'
        },
        {
            name: 'Nasreen Hossain',
            role: 'Director of Engineering',
            badge: 'ENG',
            bg: '#a14000',
            text: '#fff',
            bio: 'Structural engineer with international credentials and 18 years of field leadership.'
        },
        {
            name: 'Tanvir Islam',
            role: 'GIS Specialist',
            badge: 'GIS',
            bg: '#0a3d2e',
            text: '#fff',
            bio: 'Pioneer in applying geospatial intelligence to urban real estate development.'
        },
        {
            name: 'Fatima Begum',
            role: 'Client Relations Manager',
            badge: 'CRM',
            bg: '#5e2200',
            text: '#fff',
            bio: 'Dedicated to delivering exceptional client experiences throughout every project lifecycle.'
        }
    ],

    // Contact Page Configurations
    contactHeroTitle: 'Get In Touch',
    contactHeroSubtitle: "Whether you're enquiring about a project, exploring investment opportunities, or need support — our team is ready to assist you.",
    contactOfficeHours: 'Mon – Fri: 9:00 AM – 6:00 PM\nSaturday: 9:00 AM – 2:00 PM\nSunday: Closed',
    contactMapLat: '23.622',
    contactMapLng: '90.500',
    contactGeneralTitle: 'General Inquiries',
    contactGeneralEmail: 'info@reliancehousing.com',
    contactGeneralPhone: '+880 1234 567890',
    contactSalesTitle: 'Sales & Investment',
    contactSalesEmail: 'sales@nexusbuild.com',
    contactSalesHours: 'Mon – Fri: 9:00 AM – 6:00 PM',
    contactSupportTitle: 'Customer Support',
    contactSupportEmail: 'support@reliancehousing.com',
    contactSupportHours: 'Mon – Sat: 8:00 AM – 8:00 PM',

    // Dedicated Account Executive Details (Client Portal Support)
    accountExecName: 'Farhana Islam',
    accountExecRole: 'Dedicated Account Exec',
    accountExecEmail: 'farhana@reliance.com',
    accountExecPhone: '+880 1700-123456'
};

export default DEFAULT_SYSTEM_SETTINGS;

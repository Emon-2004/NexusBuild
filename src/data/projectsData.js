// ─── Centralized Projects Dataset ──────────────────────────────────────────────
// Shared project data for Projects catalog, ProjectDetails, and GIS Map views
// ─────────────────────────────────────────────────────────────────────────────

export const PROJECTS = [
    {
        id: "p1",
        slug: "sardar-tower-block-a",
        name: "Sardar Tower – Block A",
        status: "AVAILABLE",
        statusBg: "#a14000",
        location: "Narayanganj",
        fullAddress: "Plot 12-15, Sardar Tower Corridor, Narayanganj",
        type: "Mixed Use",
        image: "/Frontend/Projects/Project_1.svg",
        gallery: [
            "/Frontend/Projects/Project_1.svg",
            "/Frontend/Projects/Hero_Section.svg",
            "/Frontend/Projects/Decades_of_Trust_in_Narayanganj.svg"
        ],
        description: "A flagship mixed-use high-rise featuring luxury apartments, modern commercial office suites, and state-of-the-art structural foundation.",
        fullDescription: "Sardar Tower – Block A represents the premier flagship development of Nexus Build in Narayanganj. Designed for both residential luxury and high-demand commercial utility, this multi-story complex combines seismic-rated piling with modern architectural finishes.",
        priceRange: "৳ 1.50 Cr – ৳ 3.80 Cr",
        totalUnits: 32,
        specs: [
            { label: "Total Floors", value: "28 Floors" },
            { label: "Unit Types", value: "3 & 4 BHK Apartments + Commercial" },
            { label: "Land Area", value: "42,000 sq. ft" },
            { label: "Completion Year", value: "2025" },
            { label: "Architect", value: "Nexus Architectural Studio" },
            { label: "Structural Rating", value: "Grade A Seismic Standard" }
        ],
        features: [
            "28 Premium Floors with City Skyline Views",
            "Smart Access Control & 24/7 CCTV Surveillance",
            "Multi-Level Underground Secure Parking",
            "Full Backup Generator & Water Treatment",
            "High-Speed Passenger & Service Lifts"
        ],
        coordinates: { lat: 23.6238, lng: 90.4993 },
        mapLink: "https://maps.google.com/maps?q=23.6238,90.4993&z=15&output=embed",
        nearbyHospitals: "Narayanganj 200 Bed Hospital (0.8 km), Popular Diagnostic Center (1.2 km)",
        nearbySchools: "Ideal School & College (0.6 km), Narayanganj Govt High School (1.1 km)",
        nearbyColleges: "Tolaram Govt College (1.3 km)",
        nearbyMarkets: "Shamabay New Market (0.3 km), Balur Math Market (0.7 km)"
    },
    {
        id: "p2",
        slug: "green-valley-residency",
        name: "Green Valley Residency",
        status: "AVAILABLE",
        statusBg: "#a14000",
        location: "BB Road, Narayanganj",
        fullAddress: "Green Valley Lane, Off BB Road, Narayanganj",
        type: "Residential",
        image: "/Frontend/Projects/The_Heritage_Plaza.svg",
        gallery: [
            "/Frontend/Projects/The_Heritage_Plaza.svg",
            "/Frontend/Projects/Decades_of_Trust_in_Narayanganj.svg",
            "/Frontend/Projects/Hero_Section.svg"
        ],
        description: "Eco-friendly luxury residential gated community featuring lush green balconies, solar power integration, and riverfront peaceful surroundings.",
        fullDescription: "Green Valley Residency is a premier eco-inspired luxury residential sanctuary nestled in BB Road, Narayanganj. Designed for serene living with rooftop gardens, children's play areas, and energy-efficient building systems.",
        priceRange: "৳ 1.10 Cr – ৳ 2.60 Cr",
        totalUnits: 24,
        specs: [
            { label: "Total Floors", value: "16 Floors" },
            { label: "Unit Types", value: "2, 3 & 4 BHK Eco Apartments" },
            { label: "Land Area", value: "36,000 sq. ft" },
            { label: "Completion Year", value: "2024" },
            { label: "Architect", value: "Green Grid Design Partners" },
            { label: "Structural Rating", value: "Eco Grade A Standard" }
        ],
        features: [
            "Eco-Friendly Green Balconies & Rooftop Solar",
            "Gated Community with 24/7 Security Patrol",
            "Sound-Insulated Double Glazed Windows",
            "Landscaped Courtyard & Children's Play Zone",
            "Full Generator Backup for All Essential Units"
        ],
        coordinates: { lat: 23.7461, lng: 90.3742 },
        mapLink: "https://maps.google.com/maps?q=23.7461,90.3742&z=15&output=embed",
        nearbyHospitals: "Labaid Specialized Hospital (0.5 km), Square Hospital (1.4 km)",
        nearbySchools: "Scholastica School (0.8 km), Mastermind School (1.2 km)",
        nearbyColleges: "Dhaka City College (0.7 km), State University of Bangladesh (1.5 km)",
        nearbyMarkets: "Shimanto Square (0.6 km), Rapa Plaza (1.1 km)"
    }
];

export const getProjectById = (id) => {
    if (!id) return null;
    const strId = String(id).toLowerCase();
    return PROJECTS.find(p => String(p.id).toLowerCase() === strId || (p.slug && p.slug.toLowerCase() === strId)) || null;
};

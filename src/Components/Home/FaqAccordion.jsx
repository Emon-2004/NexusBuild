import { useState } from 'react';
import { Link } from 'react-router';
import { Search, HelpCircle, ChevronDown, MessageSquare, ArrowRight, PhoneCall } from 'lucide-react';
import { Badge, Input, Button, Card } from '../UI';

const FAQ_DATA = [
    {
        id: 'faq-1',
        category: 'Purchasing',
        question: 'How do milestone-based installment payments work?',
        answer: 'All property purchases follow transparent, milestone-tied payment schedules. Installments are linked to verified engineering stages (e.g. Piling Foundation, Basement Columns, Slab Casting, and Interior Handover). You can view your real-time payment schedule, automated invoice receipts, and outstanding balance in the Client Portal.',
    },
    {
        id: 'faq-2',
        category: 'Site Visits',
        question: 'Can I schedule a guided on-site visit before committing?',
        answer: 'Absolutely. We encourage prospective homeowners and investors to inspect our construction sites. Scheduled visits are guided by senior structural engineers who can walk you through the seismic foundation, material testing reports, and surrounding neighborhood amenities.',
    },
    {
        id: 'faq-3',
        category: 'GIS & Location',
        question: 'How accurate are the GIS map coordinates and amenity radius data?',
        answer: 'Our GIS coordinates are plotted using GPS ground surveys and satellite overlay data. The interactive radius feature maps real road distances to major hospitals, premier schools, universities, and commercial shopping centers across Chashiara, BB Road, and Narayanganj Sadar.',
    },
    {
        id: 'faq-4',
        category: 'Legal & Approvals',
        question: 'What legal documentation and building permits are provided?',
        answer: 'Every NexusBuild project comes with authenticated freehold title deeds, approved municipal/RAJUK building permits, and structural vetting aligned with the Bangladesh National Building Code (BNBC). All legal papers are presented during the agreement signing.',
    },
    {
        id: 'faq-5',
        category: 'Remodeling',
        question: 'What is included in the Professional Remodeling & Interior service?',
        answer: 'Our dedicated interior and remodeling wing handles custom floorplan alterations, false ceiling designs, modular kitchens, electrical automation, and luxury bathroom fittings. You can request architectural modifications before your unit reaches handover.',
    },
    {
        id: 'faq-6',
        category: 'Client Portal',
        question: 'How do I activate my Client Portal account?',
        answer: 'Upon contract confirmation, your registered client email receives an activation credential. Logging into the portal gives you immediate access to weekly drone progress photos, digital financial receipts, and direct customer care ticketing.',
    },
];

const CATEGORIES = ['All', 'Purchasing', 'Site Visits', 'GIS & Location', 'Legal & Approvals', 'Remodeling'];

export const FaqAccordion = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [openId, setOpenId] = useState('faq-1');

    const filteredFaqs = FAQ_DATA.filter((item) => {
        const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesQuery =
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
    });

    const toggleFaq = (id) => {
        setOpenId((prev) => (prev === id ? null : id));
    };

    return (
        <section
            className="w-full py-16 lg:py-24 px-6 sm:px-10 lg:px-12 bg-base-200 border-t border-base-300 text-base-content"
            aria-label="Frequently Asked Questions"
        >
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Section Header */}
                <div className="text-center space-y-3">
                    <Badge variant="primary" size="sm" className="font-semibold uppercase tracking-wider text-[11px]">
                        <HelpCircle size={12} className="inline mr-1" />
                        Got Questions?
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-base-content tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-sm sm:text-base text-base-content/75 max-w-xl mx-auto leading-relaxed">
                        Find clear answers to booking schedules, GIS site surveys, legal verification, and client portal access.
                    </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="space-y-4">
                    {/* Search Input using UI Primitive */}
                    <Input
                        type="text"
                        placeholder="Search questions (e.g. payment, GIS, legal, remodeling)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<Search size={16} />}
                        size="md"
                        className="bg-base-100 border-base-300 shadow-sm"
                    />

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                                    selectedCategory === cat
                                        ? 'bg-primary text-primary-content border-primary shadow-sm'
                                        : 'bg-base-100 text-base-content/70 border-base-300 hover:border-base-content/40'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accordion List */}
                <div className="space-y-3">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq) => {
                            const isOpen = openId === faq.id;
                            return (
                                <div
                                    key={faq.id}
                                    className="rounded-xl border border-base-300 bg-base-100 overflow-hidden shadow-sm transition-all"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(faq.id)}
                                        className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 cursor-pointer hover:bg-base-200/50 transition-colors"
                                        aria-expanded={isOpen}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" size="xs" className="border-base-300 text-base-content/60 font-medium">
                                                {faq.category}
                                            </Badge>
                                            <span className="text-sm sm:text-base font-bold text-base-content">
                                                {faq.question}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            size={18}
                                            className={`text-base-content/60 transition-transform duration-200 flex-shrink-0 ${
                                                isOpen ? 'rotate-180 text-primary' : ''
                                            }`}
                                        />
                                    </button>

                                    {isOpen && (
                                        <div className="px-5 pb-5 pt-1 text-sm text-base-content/80 leading-relaxed border-t border-base-200 bg-base-100">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10 text-base-content/60 text-sm bg-base-100 rounded-xl border border-base-300">
                            No questions match "{searchQuery}". Try a different keyword or reset filters.
                        </div>
                    )}
                </div>

                {/* Still Have Questions Card using Card and Button UI primitives */}
                <Card
                    variant="bordered"
                    size="md"
                    className="bg-base-100 border-base-300 shadow-sm"
                >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-base-content flex items-center justify-center sm:justify-start gap-2">
                                <MessageSquare size={18} className="text-primary" />
                                Still have unanswered questions?
                            </h3>
                            <p className="text-xs text-base-content/70">
                                Our advisory engineers and support agents are available Sunday–Friday to help you.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link to="/contact">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    rightIcon={<ArrowRight size={14} />}
                                    className="font-semibold shadow-sm"
                                >
                                    Contact Support
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    leftIcon={<PhoneCall size={14} />}
                                    className="border-base-300 text-base-content"
                                >
                                    Call Office
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        </section>
    );
};

export default FaqAccordion;

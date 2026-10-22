import { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2 } from 'lucide-react';
import { Card, Badge, Button } from '../UI';

const TESTIMONIALS = [
    {
        id: 1,
        name: 'Dr. Farhan Ahmed',
        role: 'Resident & Property Owner',
        property: 'Sardar Tower – Block A, Unit 12B',
        avatar: 'FA',
        rating: 5,
        content: 'The GIS map integration and live construction tracking on the Client Portal gave our family total peace of mind. Every milestone, from foundation piling to rooftop casting, was updated with photos.',
        date: 'Delivered Jan 2025',
    },
    {
        id: 2,
        name: 'Nusrat Jahan & Family',
        role: 'First-time Homeowner',
        property: 'Green Valley Residency, Plot 4',
        avatar: 'NJ',
        rating: 5,
        content: 'As first-time buyers in Narayanganj, transparency was our highest priority. NexusBuild’s digital financial ledger showed every payment receipt and scheduled installment without hidden surprises.',
        date: 'Verified Buyer',
    },
    {
        id: 3,
        name: 'Engr. Tanvir Chowdhury',
        role: 'Corporate Suite Investor',
        property: 'Shamabay Biponi Bitan, Floor 3',
        avatar: 'TC',
        rating: 5,
        content: 'The seismic foundation specs and fire safety engineering exceed typical municipality norms. The commercial floor layout has high rental yield and modern backup utilities.',
        date: 'Verified Investor',
    },
    {
        id: 4,
        name: 'Sabrina Kabir',
        role: 'Duplex Resident',
        property: 'Shapla Green Fields, Narayanganj',
        avatar: 'SK',
        rating: 5,
        content: 'We used NexusBuild’s remodeling service for our custom interior finishes. The architects and engineers listened to every detail and handed over our home two weeks ahead of schedule!',
        date: 'Handover Completed',
    },
];

export const TestimonialsCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef(null);

    // Show 1 card on mobile, 2 on tablet, 3 on desktop
    // We can slide by 1
    const maxIndex = TESTIMONIALS.length - 1;

    const next = () => setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    const prev = () => setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));

    useEffect(() => {
        if (isPaused) return;
        timerRef.current = setInterval(next, 5500);
        return () => clearInterval(timerRef.current);
    }, [isPaused, maxIndex]);

    return (
        <section
            className="w-full py-16 lg:py-24 px-6 sm:px-10 lg:px-12 bg-base-100 text-base-content"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            aria-label="Client Testimonials & Reviews"
        >
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                        <div className="flex items-center gap-2">
                            <Badge variant="primary" size="sm" className="font-semibold uppercase tracking-wider text-[11px]">
                                Client Trust
                            </Badge>
                            <span className="text-xs text-base-content/60 font-medium">
                                4.9 / 5.0 Average Rating
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-base-content tracking-tight">
                            Loved by Homeowners and Property Investors
                        </h2>
                        <p className="text-sm sm:text-base text-base-content/75 leading-relaxed">
                            Discover verified feedback from families and business partners who trusted our engineering, digital ledgers, and on-time delivery.
                        </p>
                    </div>

                    {/* Navigation buttons using Button UI primitive */}
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={prev}
                            aria-label="Previous testimonial"
                            className="btn-circle border-base-300 hover:border-primary text-base-content"
                        >
                            <ChevronLeft size={18} />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={next}
                            aria-label="Next testimonial"
                            className="btn-circle border-base-300 hover:border-primary text-base-content"
                        >
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                </div>

                {/* Carousel Viewport (CSS Scroll-snap / Transform transition) */}
                <div className="relative overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-out gap-6"
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`,
                        }}
                    >
                        {TESTIMONIALS.map((item) => (
                            <div
                                key={item.id}
                                className="w-full flex-shrink-0 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                            >
                                <Card
                                    variant="bordered"
                                    size="md"
                                    className="h-full bg-base-100 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between shadow-sm"
                                >
                                    <div className="space-y-4">
                                        {/* Top row: Quote icon + Stars */}
                                        <div className="flex items-center justify-between">
                                            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                <Quote size={18} />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[...Array(item.rating)].map((_, i) => (
                                                    <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Review text */}
                                        <p className="text-sm text-base-content/85 leading-relaxed italic">
                                            "{item.content}"
                                        </p>
                                    </div>

                                    {/* Author footer */}
                                    <div className="pt-4 mt-6 border-t border-base-300 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary text-primary-content font-bold flex items-center justify-center text-xs flex-shrink-0">
                                            {item.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-base-content truncate">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs text-base-content/60 truncate">
                                                {item.property}
                                            </p>
                                        </div>
                                        <Badge variant="ghost" size="xs" className="border-base-300 text-emerald-600 font-medium">
                                            <CheckCircle2 size={10} className="inline mr-1" />
                                            Verified
                                        </Badge>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center justify-center gap-2 pt-2">
                    {TESTIMONIALS.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                idx === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-base-300 hover:bg-base-content/40'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsCarousel;

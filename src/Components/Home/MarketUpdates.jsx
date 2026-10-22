import { useState } from 'react';
import { Calendar, Clock, ArrowRight, User, TrendingUp } from 'lucide-react';
import { BLOG_POSTS } from '../../data/blogPosts';
import { Card, Badge, Button, Modal } from '../UI';

export const MarketUpdates = () => {
    const [selectedPost, setSelectedPost] = useState(null);

    // Show the 3 newest posts
    const latestPosts = BLOG_POSTS.slice(0, 3);

    return (
        <section
            className="w-full py-16 lg:py-24 px-6 sm:px-10 lg:px-12 bg-base-100 text-base-content"
            aria-label="Latest Real Estate Market Updates"
        >
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                        <div className="flex items-center gap-2">
                            <Badge variant="primary" size="sm" className="font-semibold uppercase tracking-wider text-[11px]">
                                <TrendingUp size={12} className="inline mr-1" />
                                Industry Insights
                            </Badge>
                            <span className="text-xs text-base-content/60 font-medium">
                                Narayanganj Real Estate Trends
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-base-content tracking-tight">
                            Latest Market Updates &amp; Architectural Insights
                        </h2>
                        <p className="text-sm sm:text-base text-base-content/75 leading-relaxed">
                            Stay informed on urban infrastructure expansion, structural safety codes, legal guidelines, and emerging property valuations.
                        </p>
                    </div>

                    <div className="flex-shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPost(latestPosts[0])}
                            rightIcon={<ArrowRight size={14} />}
                            className="border-base-300 hover:border-primary text-base-content font-bold"
                        >
                            Featured Analysis
                        </Button>
                    </div>
                </div>

                {/* 3 Posts Grid using Card UI primitive */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {latestPosts.map((post) => (
                        <Card
                            key={post.id}
                            variant="bordered"
                            size="sm"
                            className="group bg-base-100 hover:border-primary/50 transition-all duration-300 overflow-hidden shadow-sm flex flex-col justify-between"
                        >
                            {/* Card Image */}
                            <div className="relative h-48 sm:h-52 w-full overflow-hidden rounded-lg bg-base-200">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute top-3 left-3">
                                    <Badge
                                        variant="primary"
                                        size="sm"
                                        className="bg-[#000f22]/90 text-white border border-white/20 font-bold backdrop-blur-sm text-[10px] uppercase tracking-wider"
                                    >
                                        {post.category}
                                    </Badge>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="flex flex-col flex-1 pt-4 space-y-3">
                                {/* Meta info */}
                                <div className="flex items-center gap-3 text-xs text-base-content/60 font-medium">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={13} />
                                        {post.date}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={13} />
                                        {post.readTime}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-base sm:text-lg font-bold text-base-content leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                    {post.title}
                                </h3>

                                {/* Excerpt */}
                                <p className="text-xs sm:text-sm text-base-content/75 leading-relaxed line-clamp-3 flex-1">
                                    {post.excerpt}
                                </p>

                                {/* Author + Read button */}
                                <div className="pt-3 border-t border-base-300 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-full bg-base-200 text-base-content flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                            <User size={12} />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-xs font-bold text-base-content truncate">{post.author}</p>
                                            <p className="text-[10px] text-base-content/60 truncate">{post.authorRole}</p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedPost(post)}
                                        className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer flex-shrink-0"
                                    >
                                        Read More
                                        <ArrowRight size={13} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Article Preview Modal using Modal UI primitive */}
            <Modal
                isOpen={Boolean(selectedPost)}
                onClose={() => setSelectedPost(null)}
                title={selectedPost?.title}
                size="lg"
                actions={
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedPost(null)}
                    >
                        Close Preview
                    </Button>
                }
            >
                {selectedPost && (
                    <div className="space-y-4 text-left">
                        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-base-200 text-xs text-base-content/70">
                            <Badge variant="primary" size="xs">
                                {selectedPost.category}
                            </Badge>
                            <span>Published on {selectedPost.date}</span>
                            <span>•</span>
                            <span>{selectedPost.readTime}</span>
                            <span>•</span>
                            <span className="font-semibold text-base-content">By {selectedPost.author} ({selectedPost.authorRole})</span>
                        </div>

                        <div className="h-48 w-full overflow-hidden rounded-xl bg-base-200">
                            <img
                                src={selectedPost.image}
                                alt={selectedPost.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <p className="text-sm font-semibold text-base-content/90 leading-relaxed">
                            {selectedPost.excerpt}
                        </p>

                        <p className="text-xs text-base-content/75 leading-relaxed">
                            Narayanganj’s urban growth continues to outpace national averages as modern infrastructural connections mature. Comprehensive master-planning with RAJUK and regional municipal authorities ensures structural durability, civic utility provision, and enduring capital preservation for modern commercial and residential unit owners.
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-2">
                            {selectedPost.tags?.map((t) => (
                                <span key={t} className="text-[10px] font-mono bg-base-200 text-base-content/70 px-2 py-0.5 rounded-md">
                                    #{t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
        </section>
    );
};

export default MarketUpdates;

import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Search, Calendar, Clock, ArrowRight, TrendingUp, Sparkles, Filter, BookOpen } from 'lucide-react';
import Navbar from '../../Components/Header/Navbar';
import Footer from '../../Components/Footer/Footer';
import { BLOG_POSTS } from '../../data/blogPosts';
import { Badge, Card } from '../../Components/UI';

const Blog = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Extract unique categories
    const categories = useMemo(() => {
        const unique = new Set(BLOG_POSTS.map(p => p.category));
        return ['All', ...Array.from(unique)];
    }, []);

    const filteredPosts = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        return BLOG_POSTS.filter(post => {
            const matchesSearch = !term ||
                post.title.toLowerCase().includes(term) ||
                post.excerpt.toLowerCase().includes(term) ||
                post.author.toLowerCase().includes(term) ||
                post.tags?.some(tag => tag.toLowerCase().includes(term));
            const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory]);

    const featuredPost = BLOG_POSTS[0];

    return (
        <div className="min-h-screen bg-base-100 text-base-content flex flex-col justify-between">
            <div>
                <Navbar />
                {/* ── Hero Banner ── */}
            <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-base-100 to-base-100 py-16 sm:py-24 px-6 sm:px-10 lg:px-12 border-b border-base-200">
                <div className="max-w-6xl mx-auto space-y-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold uppercase tracking-wider">
                        <TrendingUp size={14} />
                        Market Insights &amp; Knowledge Hub
                    </div>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-base-content max-w-4xl mx-auto leading-tight">
                        Real Estate Intelligence, Engineering Standards &amp; Urban Growth
                    </h1>
                    <p className="text-base sm:text-lg text-base-content/75 max-w-2xl mx-auto leading-relaxed">
                        In-depth architectural analysis, infrastructure corridor forecasts, regulatory due diligence, and sustainability practices for Narayanganj and Dhaka.
                    </p>

                    {/* Search & Filter Bar */}
                    <div className="pt-4 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" />
                            <input
                                type="text"
                                placeholder="Search articles by title, topic, engineer or tag..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-base-100 border border-base-300 rounded-xl text-sm text-base-content shadow-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Category Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                    selectedCategory === cat
                                        ? 'bg-primary text-primary-content shadow-sm scale-105'
                                        : 'bg-base-200 hover:bg-base-300 text-base-content/70 hover:text-base-content'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Main Content Area ── */}
            <main className="max-w-7xl mx-auto py-12 lg:py-16 px-6 sm:px-10 lg:px-12 space-y-12">
                
                {/* Featured Headline Post (when no search active and showing all) */}
                {!searchTerm && selectedCategory === 'All' && featuredPost && (
                    <div className="relative rounded-3xl overflow-hidden border border-base-300 bg-base-200/50 shadow-md hover:shadow-xl transition-shadow group">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                            <div className="lg:col-span-7 h-72 sm:h-96 lg:h-auto overflow-hidden relative">
                                <img
                                    src={featuredPost.image}
                                    alt={featuredPost.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4">
                                    <Badge variant="primary" size="sm" className="font-bold uppercase tracking-wider">
                                        <Sparkles size={12} className="inline mr-1" /> Featured Analysis
                                    </Badge>
                                </div>
                            </div>
                            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-xs text-base-content/60 font-medium">
                                        <Badge variant="neutral" size="xs">
                                            {featuredPost.category}
                                        </Badge>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={13} /> {featuredPost.date}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={13} /> {featuredPost.readTime}
                                        </span>
                                    </div>

                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-base-content tracking-tight leading-snug group-hover:text-primary transition-colors">
                                        <Link to={`/blog/${featuredPost.id}`}>
                                            {featuredPost.title}
                                        </Link>
                                    </h2>

                                    <p className="text-sm text-base-content/75 line-clamp-3 leading-relaxed">
                                        {featuredPost.excerpt}
                                    </p>
                                </div>

                                <div className="pt-6 mt-6 border-t border-base-300 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                            {featuredPost.author.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-base-content">{featuredPost.author}</div>
                                            <div className="text-[10px] text-base-content/60">{featuredPost.authorRole}</div>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/blog/${featuredPost.id}`}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-content rounded-xl font-bold text-xs hover:bg-primary/90 transition-colors shadow-xs"
                                    >
                                        Read Article <ArrowRight size={13} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid of Articles */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-base-300">
                        <div className="flex items-center gap-2">
                            <BookOpen size={18} className="text-primary" />
                            <h3 className="font-extrabold text-lg sm:text-xl text-base-content">
                                {selectedCategory === 'All' ? 'All Published Articles' : `${selectedCategory} Articles`}
                            </h3>
                            <span className="text-xs font-bold text-base-content/50 bg-base-200 px-2.5 py-0.5 rounded-full ml-1">
                                {filteredPosts.length}
                            </span>
                        </div>
                    </div>

                    {filteredPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPosts.map((post) => (
                                <Card
                                    key={post.id}
                                    className="border border-base-300 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between bg-base-100 group"
                                >
                                    <div>
                                        {/* Thumbnail */}
                                        <div className="relative h-48 w-full overflow-hidden bg-base-200">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-3 left-3">
                                                <Badge variant="primary" size="xs" className="font-bold shadow-xs">
                                                    {post.category}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="p-6 space-y-3">
                                            <div className="flex items-center gap-2 text-[11px] text-base-content/60 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} /> {post.date}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} /> {post.readTime}
                                                </span>
                                            </div>

                                            <h4 className="text-base font-bold text-base-content leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                                <Link to={`/blog/${post.id}`}>
                                                    {post.title}
                                                </Link>
                                            </h4>

                                            <p className="text-xs text-base-content/75 line-clamp-3 leading-relaxed">
                                                {post.excerpt}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer Details */}
                                    <div className="px-6 pb-6 pt-3 border-t border-base-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-7 h-7 rounded-full bg-base-200 flex items-center justify-center font-bold text-[10px] text-primary flex-shrink-0">
                                                {post.author.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-base-content truncate">{post.author}</div>
                                                <div className="text-[10px] text-base-content/55 truncate">{post.authorRole}</div>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/blog/${post.id}`}
                                            className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 flex-shrink-0 transition-transform group-hover:translate-x-0.5"
                                        >
                                            Read More <ArrowRight size={13} />
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="p-16 text-center rounded-2xl border border-dashed border-base-300 bg-base-200/40 space-y-3">
                            <Filter size={32} className="mx-auto text-base-content/40" />
                            <h4 className="text-base font-bold text-base-content">No articles found</h4>
                            <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                                No articles matched your search query "{searchTerm}". Try clearing your filters or search terms.
                            </p>
                            <button
                                type="button"
                                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                                className="px-4 py-1.5 bg-primary text-primary-content text-xs font-bold rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            </main>
            </div>
            <Footer />
        </div>
    );
};

export default Blog;

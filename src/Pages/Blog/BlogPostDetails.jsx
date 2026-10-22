import { useParams, Link } from 'react-router';
import { Calendar, Clock, ArrowLeft, ArrowRight, Share2, Tag, BookOpen, CheckCircle2 } from 'lucide-react';
import Navbar from '../../Components/Header/Navbar';
import Footer from '../../Components/Footer/Footer';
import { BLOG_POSTS } from '../../data/blogPosts';
import { Badge, Card, Button } from '../../Components/UI';
import { showToast } from '../../Components/Toast/globalToast';
import Error from '../ErrorPage/Error';

const BlogPostDetails = () => {
    const { id } = useParams();

    // Match by ID or Slug
    const post = BLOG_POSTS.find((p) => p.id === id || p.slug === id);

    // If missing, render the 404 error page as mandated
    if (!post) {
        return <Error />;
    }

    const relatedPosts = BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 3);

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            showToast('Article URL copied to clipboard!', 'success', 'Link Copied');
        } else {
            showToast('Share link ready at current browser URL.', 'info', 'Share');
        }
    };

    return (
        <div className="min-h-screen bg-base-100 text-base-content flex flex-col justify-between">
            <div>
                <Navbar />
                {/* ── Article Header ── */}
            <header className="relative bg-gradient-to-b from-primary/10 via-base-100 to-base-100 py-12 sm:py-16 px-6 sm:px-10 lg:px-12 border-b border-base-200">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Breadcrumb / Back Link */}
                    <div className="flex items-center justify-between">
                        <Link
                            to="/blog"
                            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to All Articles
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShare}
                            leftIcon={<Share2 size={14} />}
                            className="text-xs"
                        >
                            Share Article
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="primary" size="sm" className="font-bold uppercase tracking-wider">
                                {post.category}
                            </Badge>
                            <span className="text-xs text-base-content/60 flex items-center gap-1 font-medium">
                                <Calendar size={13} /> Published on {post.date}
                            </span>
                            <span className="text-xs text-base-content/60">•</span>
                            <span className="text-xs text-base-content/60 flex items-center gap-1 font-medium">
                                <Clock size={13} /> {post.readTime}
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-base-content tracking-tight leading-tight">
                            {post.title}
                        </h1>

                        <p className="text-base sm:text-lg text-base-content/80 font-medium leading-relaxed">
                            {post.excerpt}
                        </p>
                    </div>

                    {/* Author Box */}
                    <div className="flex items-center gap-3.5 pt-4 border-t border-base-200">
                        <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-extrabold text-base shadow-xs">
                            {post.author.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-sm text-base-content flex items-center gap-1.5">
                                {post.author}
                                <span title="Verified Contributor">
                                    <CheckCircle2 size={14} className="text-primary inline" />
                                </span>
                            </div>
                            <div className="text-xs text-base-content/60 font-medium">
                                {post.authorRole} • NexusBuild Engineering Advisory
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Article Body ── */}
            <main className="max-w-4xl mx-auto py-10 sm:py-14 px-6 sm:px-10 lg:px-12 space-y-10">
                {/* Featured Hero Image */}
                <div className="rounded-3xl overflow-hidden border border-base-300 shadow-lg bg-base-200 max-h-[460px]">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Article Prose Paragraphs */}
                <article className="prose prose-base sm:prose-lg max-w-none text-base-content space-y-6">
                    {post.content && post.content.length > 0 ? (
                        post.content.map((paragraph, idx) => (
                            <p
                                key={idx}
                                className="text-base sm:text-[17px] leading-relaxed text-base-content/85 font-normal"
                            >
                                {paragraph}
                            </p>
                        ))
                    ) : (
                        <p className="text-base sm:text-lg leading-relaxed text-base-content/85">
                            {post.excerpt}
                        </p>
                    )}
                </article>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="pt-6 border-t border-base-300 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-base-content/60 flex items-center gap-1 mr-2 uppercase tracking-wider">
                            <Tag size={13} /> Tags:
                        </span>
                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-base-200 border border-base-300 rounded-lg text-xs font-semibold text-base-content/80 font-mono"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Call to Action Banner */}
                <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-primary/10 via-base-200 to-primary/5 border border-primary/20 space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:space-y-0">
                    <div className="space-y-1 max-w-md">
                        <h3 className="text-lg font-bold text-base-content">
                            Explore Narayanganj Real Estate Investments
                        </h3>
                        <p className="text-xs text-base-content/70">
                            Discover premier residential towers and commercial properties managed with GIS intelligence.
                        </p>
                    </div>
                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-content rounded-xl font-bold text-xs hover:bg-primary/90 transition-colors shadow-sm flex-shrink-0"
                    >
                        Browse Projects <ArrowRight size={14} />
                    </Link>
                </div>

                {/* ── Related Articles Section ── */}
                <div className="pt-10 border-t border-base-300 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen size={18} className="text-primary" />
                            <h3 className="font-extrabold text-xl text-base-content">
                                Related Market Updates
                            </h3>
                        </div>
                        <Link
                            to="/blog"
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                        >
                            View All <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {relatedPosts.map((rel) => (
                            <Card
                                key={rel.id}
                                className="border border-base-300 rounded-xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between bg-base-100 group"
                            >
                                <div>
                                    <div className="h-32 w-full overflow-hidden bg-base-200">
                                        <img
                                            src={rel.image}
                                            alt={rel.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                                            {rel.category}
                                        </span>
                                        <h4 className="text-xs font-bold text-base-content group-hover:text-primary transition-colors line-clamp-2">
                                            <Link to={`/blog/${rel.id}`}>
                                                {rel.title}
                                            </Link>
                                        </h4>
                                    </div>
                                </div>
                                <div className="px-4 pb-4 pt-1">
                                    <Link
                                        to={`/blog/${rel.id}`}
                                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                        Read More <ArrowRight size={11} />
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
            </div>
            <Footer />
        </div>
    );
};

export default BlogPostDetails;

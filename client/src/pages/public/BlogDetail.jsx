import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchBlogBySlug, clearCurrentBlog } from '../../features/blog/blogSlice';
import { Calendar, User, Tag, ArrowLeft, Loader2, Share2, Clock, ChevronRight, Facebook, Linkedin, Twitter } from 'lucide-react';
import Newsletter from '../../components/common/Newsletter';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import AdBanner from '../../components/ads/AdBanner';
import InContentAd from '../../components/ads/InContentAd';
import SEO from '../../components/common/SEO';

const BlogDetail = ({ isDashboard }) => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const { currentBlog, isLoading, isError, message } = useSelector((state) => state.blog);

    useEffect(() => {
        if (slug) {
            dispatch(fetchBlogBySlug(slug));
        }
        return () => {
            dispatch(clearCurrentBlog());
        };
    }, [dispatch, slug]);

    if (isLoading) {
        return (
            <>
                {!isDashboard && <Navbar />}
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <Loader2 className="animate-spin text-primary-600" size={48} />
                </div>
                {!isDashboard && <Footer />}
            </>
        );
    }

    if (isError || !currentBlog) {
        return (
            <>
                {!isDashboard && <Navbar />}
                <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-slate-50">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Tag size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Blog Post Not Found</h2>
                        <p className="text-slate-600 mb-6">{message || "The article you are looking for has been moved or deleted."}</p>
                        <Link to={isDashboard ? "/dashboard/blog" : "/blog"} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium w-full">
                            <ArrowLeft size={18} /> Back to Blog
                        </Link>
                    </div>
                </div>
                {!isDashboard && <Footer />}
            </>
        );
    }

    const { title, content, author, category, tags, imageUrl, featuredImage, createdAt, readTime } = currentBlog;

    const authorName = (typeof author === 'object' && author?.name) ? author.name : (author || 'Editorial Team');
    const displayImage = featuredImage || imageUrl;

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <>
            <SEO
                title={`${title} | Japan Visa SaaS Blog`}
                description={currentBlog.excerpt || `Read about ${title}`}
                image={displayImage}
                type="article"
                author={authorName}
                publishedTime={createdAt}
            />
            {!isDashboard && <Navbar />}
            <div className="min-h-screen bg-white pb-24 pt-24">
                {/* Progress Bar (Optional - could add later) */}

                <article className="container mx-auto px-4 max-w-5xl">
                    {/* Navigation */}
                    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 max-w-3xl mx-auto">
                        <Link to={isDashboard ? "/dashboard" : "/"} className="hover:text-primary-600 transition-colors">
                            {isDashboard ? "Dashboard" : "Home"}
                        </Link>
                        <ChevronRight size={14} />
                        <Link to={isDashboard ? "/dashboard/blog" : "/blog"} className="hover:text-primary-600 transition-colors">Blog</Link>
                        <ChevronRight size={14} />
                        <span className="text-slate-900 font-medium truncate">{title}</span>
                    </nav>

                    {/* Header Section */}
                    <header className="text-center max-w-3xl mx-auto mb-10">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-medium mb-4 border border-primary-100">
                            <Tag size={12} />
                            {category || 'General'}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">
                            {title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm md:text-base">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-blue-100 flex items-center justify-center text-primary-700 font-bold border border-white shadow-sm">
                                    {authorName.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Written by</p>
                                    <p className="font-semibold text-slate-900">{authorName}</p>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-slate-400" />
                                <span>{formatDate(createdAt)}</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-slate-400" />
                                <span>{readTime || '5'} min read</span>
                            </div>
                        </div>
                    </header>

                    {/* Hero Image */}
                    {displayImage && (
                        <div className="mb-10 relative">
                            <div className="aspect-[21/9] w-full relative overflow-hidden rounded-lg shadow-md border border-slate-100">
                                <img
                                    src={displayImage}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Ad Banner - After Hero Image */}
                    <div className="mb-12 flex justify-center">
                        <AdBanner adKey="56e9dabb44efce88731345b0c91490dd" width={728} height={90} />
                    </div>

                    {/* Content Section - Flex layout for proper sidebar width */}
                    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">

                        {/* Sidebar (Share) */}
                        <div className="hidden lg:flex lg:flex-col w-16 shrink-0">
                            <div className="sticky top-32 flex flex-col gap-4 items-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest vertical-text mb-2">Share</p>
                                <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1877F2] hover:text-white transition-all shadow-sm">
                                    <Facebook size={18} />
                                </button>
                                <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1DA1F2] hover:text-white transition-all shadow-sm">
                                    <Twitter size={18} />
                                </button>
                                <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#0A66C2] hover:text-white transition-all shadow-sm">
                                    <Linkedin size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Main Text */}
                        <div className="flex-1 min-w-0">
                            <div className="prose prose-lg md:prose-xl max-w-none 
                                prose-slate
                                prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight
                                prose-p:text-slate-600 prose-p:leading-8
                                prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline hover:prose-a:text-primary-700
                                prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-10
                                prose-strong:text-slate-900 prose-strong:font-bold
                                prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:bg-gradient-to-r prose-blockquote:from-primary-50 prose-blockquote:to-transparent prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:my-8 prose-blockquote:rounded-r-lg
                                prose-li:text-slate-600
                                first-letter:text-7xl first-letter:font-bold first-letter:text-slate-900 first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8]
                            ">
                                <InContentAd content={content} adKey="012f82fd8efee1c8aa29d03593d4de8c" paragraphInterval={3} />
                            </div>

                            {/* Tags Footer */}
                            {tags && tags.length > 0 && (
                                <div className="mt-16 pt-8 border-t border-slate-100">
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag, index) => (
                                            <Link
                                                to={`/blog?tag=${tag}`}
                                                key={index}
                                                className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-white hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm"
                                            >
                                                #{tag}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Author Box */}
                            <div className="mt-12 bg-slate-50 rounded-2xl p-8 border border-slate-100 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                                <div className="w-20 h-20 rounded-full bg-white p-1 shadow-md shrink-0">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-100 to-blue-200 flex items-center justify-center text-2xl font-bold text-primary-700">
                                        {authorName.charAt(0)}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">About {authorName}</h3>
                                    <p className="text-slate-600 mb-4 leading-relaxed">
                                        {authorName === 'Admin' ? 'The official editorial team at JapanVisa.ai, dedicated to bringing you the latest updates on Japanese immigration, visa policies, and student life.' : `Expert contributor at JapanVisa.ai sharing insights on Japanese culture and immigration.`}
                                    </p>
                                    <Link to="/blog" className="text-primary-600 font-semibold hover:text-primary-800 inline-flex items-center gap-1">
                                        View more posts <ArrowLeft size={16} className="rotate-180" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar with Ads - Desktop */}
                        <div className="hidden lg:block w-[320px] shrink-0">
                            {/* Ad banner in sidebar */}
                            <div className="sticky top-32">
                                <AdBanner adKey="012f82fd8efee1c8aa29d03593d4de8c" width={300} height={250} />
                            </div>
                        </div>

                    </div>

                    {/* Mobile Ad - Below Content */}
                    <div className="lg:hidden flex justify-center py-6">
                        <AdBanner adKey="012f82fd8efee1c8aa29d03593d4de8c" width={300} height={250} />
                    </div>
                </article>

                {/* Ad Banner - Before Newsletter */}
                <div className="py-8 flex justify-center border-t border-slate-100">
                    <AdBanner adKey="56e9dabb44efce88731345b0c91490dd" width={728} height={90} />
                </div>

                {/* Newsletter / CTA */}
                <Newsletter />

            </div>
            {!isDashboard && <Footer />}
        </>
    );
};

export default BlogDetail;

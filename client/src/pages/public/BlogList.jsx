import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBlogs, reset } from '../../features/blog/blogSlice';
import { Calendar, Clock, Eye, Search, Loader2, ArrowRight } from 'lucide-react';
import SEO from '../../components/common/SEO';
import Button from '../../components/ui/Button';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { fixImageUrl } from '../../utils/imageUtils';
import BannerAd from '../../components/ads/BannerAd';


const BlogList = ({ isDashboard }) => {
    const dispatch = useDispatch();
    const { blogs, isLoading, pagination } = useSelector((state) => state.blog);

    const [filters, setFilters] = useState({
        category: 'all',
        search: '',
        page: 1
    });

    const categories = ['all', 'Visa Tips', 'Study in Japan', 'Success Stories', 'Student Life', 'Application Guide', 'News'];

    useEffect(() => {
        dispatch(fetchBlogs(filters));
        return () => dispatch(reset());
    }, [dispatch, filters]);

    const handleCategoryChange = (category) => {
        setFilters({ ...filters, category, page: 1 });
    };

    const handleSearchChange = (e) => {
        setFilters({ ...filters, search: e.target.value, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const calculateReadTime = (content) => {
        const wordsPerMinute = 200;
        const wordCount = content.split(' ').length;
        return Math.ceil(wordCount / wordsPerMinute);
    };

    if (isLoading && blogs.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
            {!isDashboard && <Navbar />}

            {/* Hero Section */}
            <section className="bg-primary-600 text-white py-12 mt-14">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Our Blog</h1>
                    <p className="text-primary-100 max-w-xl mx-auto">
                        Insights, tips, and stories to help you succeed in your Japan visa journey
                    </p>
                </div>
            </section>

            {/* Banner Ad */}
            <BannerAd className="max-w-7xl mx-auto" />

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Filters */}
                <div className="mb-12 space-y-6">
                    {/* Search */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search blogs..."
                            value={filters.search}
                            onChange={handleSearchChange}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategoryChange(category)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filters.category === category
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content with Sidebar */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Blog Grid */}
                    <div className="flex-1">
                        {blogs.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-slate-600 text-lg">No blogs found</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid md:grid-cols-2 gap-8 mb-12">
                                    {blogs.map((blog) => (
                                        <Link
                                            key={blog._id}
                                            to={`/blog/${blog.slug}`}
                                            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300"
                                        >
                                            {/* Featured Image */}
                                            <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                                                {blog.featuredImage ? (
                                                    <img src={fixImageUrl(blog.featuredImage)} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <Calendar size={48} />
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3">
                                                    <span className="px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded">
                                                        {blog.category}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 space-y-3">
                                                <h2 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                                                    {blog.title}
                                                </h2>
                                                <p className="text-slate-600 text-sm line-clamp-3">{blog.excerpt}</p>

                                                {/* Meta */}
                                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={14} />
                                                            {calculateReadTime(blog.content)} min read
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Eye size={14} />
                                                            {blog.viewCount}
                                                        </span>
                                                    </div>
                                                    <ArrowRight className="text-primary-600 group-hover:translate-x-1 transition-transform" size={18} />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="flex items-center justify-center gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => handlePageChange(filters.page - 1)}
                                            disabled={filters.page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <div className="flex gap-2">
                                            {[...Array(pagination.pages)].map((_, index) => (
                                                <button
                                                    key={index + 1}
                                                    onClick={() => handlePageChange(index + 1)}
                                                    className={`w-10 h-10 rounded-lg font-medium transition-all ${filters.page === index + 1
                                                        ? 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white'
                                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                                        }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => handlePageChange(filters.page + 1)}
                                            disabled={filters.page === pagination.pages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>


                </div>


            </div>



            {!isDashboard && <Footer />}
        </div>
    );
};

export default BlogList;

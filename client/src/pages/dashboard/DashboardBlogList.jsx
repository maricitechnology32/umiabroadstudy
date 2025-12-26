import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchBlogs, reset } from '../../features/blog/blogSlice';
import { Calendar, Clock, Eye, Search, Loader2, ArrowRight } from 'lucide-react';

const DashboardBlogList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
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

    const calculateReadTime = (content) => {
        const wordsPerMinute = 200;
        const wordCount = content.split(' ').length;
        return Math.ceil(wordCount / wordsPerMinute);
    };

    if (isLoading && blogs.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-primary-600" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Blog</h1>
                <p className="text-slate-600 mt-1">Insights, tips, and stories to help you succeed</p>
            </div>

            {/* Filters */}
            <div className="space-y-4">
                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search blogs..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setFilters({ ...filters, category, page: 1 })}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filters.category === category
                                    ? 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Blog Grid */}
            {blogs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                    <p className="text-slate-600 text-lg">No blogs found</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                        <div
                            key={blog._id}
                            onClick={() => navigate(`/dashboard/blog/${blog.slug}`)}
                            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 cursor-pointer"
                        >
                            {/* Featured Image */}
                            <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                                {blog.featuredImage ? (
                                    <img
                                        src={blog.featuredImage}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Calendar size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white text-xs font-semibold rounded-full">
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
                                            {calculateReadTime(blog.content)} min
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye size={14} />
                                            {blog.viewCount}
                                        </span>
                                    </div>
                                    <ArrowRight className="text-primary-600 group-hover:translate-x-1 transition-transform" size={18} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                        disabled={filters.page === 1}
                        className="px-4 py-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                        Previous
                    </button>
                    <div className="flex gap-2">
                        {[...Array(pagination.pages)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => setFilters({ ...filters, page: index + 1 })}
                                className={`w-10 h-10 rounded-lg font-medium transition-all ${filters.page === index + 1
                                        ? 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                        disabled={filters.page === pagination.pages}
                        className="px-4 py-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default DashboardBlogList;

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogBySlug, clearCurrentBlog, reset } from '../../features/blog/blogSlice';
import { Calendar, Clock, Eye, User, ArrowLeft, Loader2, Tag } from 'lucide-react';

const DashboardBlogDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentBlog: blog, isLoading } = useSelector((state) => state.blog);

    useEffect(() => {
        dispatch(fetchBlogBySlug(slug));
        return () => {
            dispatch(clearCurrentBlog());
            dispatch(reset());
        };
    }, [dispatch, slug]);

    const calculateReadTime = (content) => {
        const wordsPerMinute = 200;
        const wordCount = content.split(' ').length;
        return Math.ceil(wordCount / wordsPerMinute);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-primary-600" size={48} />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-600 text-lg mb-4">Blog not found</p>
                <button onClick={() => navigate('/dashboard/blog')} className="text-primary-600 hover:underline">
                    ← Back to Blog List
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/dashboard/blog')}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft size={20} />
                Back to Blog
            </button>

            {/* Article */}
            <article className="bg-white rounded-2xl p-8 border border-slate-200">
                {/* Meta Info */}
                <div className="mb-6">
                    <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
                        {blog.category}
                    </span>
                    <h1 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
                        {blog.title}
                    </h1>

                    {/* Author & Meta */}
                    <div className="flex flex-wrap items-center gap-6 text-slate-600 text-sm pb-6 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                            <User size={16} />
                            <span className="font-medium">{blog.author?.name || 'Admin'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>{calculateReadTime(blog.content)} min read</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye size={16} />
                            <span>{blog.viewCount} views</span>
                        </div>
                    </div>
                </div>

                {/* Featured Image */}
                {blog.featuredImage && (
                    <div className="mb-8 rounded-xl overflow-hidden">
                        <img
                            src={blog.featuredImage}
                            alt={blog.title}
                            className="w-full h-auto"
                        />
                    </div>
                )}

                {/* Content */}
                <div
                    className="prose prose-lg max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary-600 prose-img:rounded-xl"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Additional Images Gallery */}
                {blog.images && blog.images.length > 0 && (
                    <div className="mt-12 pt-12 border-t border-slate-200">
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">Gallery</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {blog.images.map((image, index) => (
                                <div key={index} className="rounded-xl overflow-hidden">
                                    <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-slate-200">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag size={18} className="text-slate-400" />
                            {blog.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </div>
    );
};

export default DashboardBlogDetail;

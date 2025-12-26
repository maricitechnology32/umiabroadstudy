import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogsAdmin, createBlog, updateBlog, deleteBlog, reset } from '../../features/blog/blogSlice';
import { Plus, Edit, Trash2, Eye, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import RichTextEditor from '../../components/ui/RichTextEditor';
import api from '../../utils/api';
import Button from '../../components/ui/Button';

const BlogManager = () => {
    const dispatch = useDispatch();
    const { blogs, isLoading, isError, isSuccess, message } = useSelector((state) => state.blog);

    const [showForm, setShowForm] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        featuredImage: '',
        images: [],
        category: 'Uncategorized',
        tags: [],
        status: 'draft'
    });
    const [tagInput, setTagInput] = useState('');
    const [uploadingImages, setUploadingImages] = useState(false);

    const categories = ['Visa Tips', 'Study in Japan', 'Success Stories', 'Student Life', 'Application Guide', 'News', 'Uncategorized'];

    useEffect(() => {
        dispatch(fetchBlogsAdmin());
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (isSuccess && message) {
            toast.success(message);
            setShowForm(false);
            setEditingBlog(null);
            resetForm();
        }
        dispatch(reset());
    }, [isError, isSuccess, message, dispatch]);

    const resetForm = () => {
        setFormData({
            title: '',
            excerpt: '',
            content: '',
            featuredImage: '',
            images: [],
            category: 'Uncategorized',
            tags: [],
            status: 'draft'
        });
        setTagInput('');
    };

    const handleEdit = (blog) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title,
            excerpt: blog.excerpt,
            content: blog.content,
            featuredImage: blog.featuredImage,
            images: blog.images || [],
            category: blog.category,
            tags: blog.tags || [],
            status: blog.status
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.excerpt || !formData.content) {
            return toast.error('Please fill in all required fields');
        }

        if (editingBlog) {
            dispatch(updateBlog({ id: editingBlog._id, data: formData }));
        } else {
            dispatch(createBlog(formData));
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this blog?')) {
            dispatch(deleteBlog(id));
        }
    };

    const handleImageUpload = async (e, isFeatured = false) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingImages(true);
        const uploadedUrls = [];

        try {
            for (const file of files) {
                const formDataUpload = new FormData();
                formDataUpload.append('file', file);

                const response = await api.post('/upload', formDataUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                uploadedUrls.push(response.data.url);
            }

            if (isFeatured) {
                setFormData({ ...formData, featuredImage: uploadedUrls[0] });
            } else {
                setFormData({ ...formData, images: [...formData.images, ...uploadedUrls] });
            }

            toast.success(`${files.length} image(s) uploaded successfully`);
        } catch (error) {
            toast.error('Failed to upload images');
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (index) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData({ ...formData, images: newImages });
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const removeTag = (index) => {
        const newTags = [...formData.tags];
        newTags.splice(index, 1);
        setFormData({ ...formData, tags: newTags });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Blog Management</h1>
                    <p className="text-slate-600 mt-1">Create and manage blog posts</p>
                </div>
                <Button onClick={() => { setShowForm(true); setEditingBlog(null); resetForm(); }} className="flex items-center gap-2">
                    <Plus size={20} />
                    New Blog Post
                </Button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-4xl my-8">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200">
                            <h2 className="text-2xl font-bold">{editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
                            <button onClick={() => { setShowForm(false); setEditingBlog(null); resetForm(); }} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">Excerpt *</label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    rows="3"
                                    maxLength="300"
                                    required
                                />
                                <p className="text-sm text-slate-500 mt-1">{formData.excerpt.length}/300 characters</p>
                            </div>

                            {/* Category & Status */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">Content *</label>
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(content) => setFormData({ ...formData, content })}
                                    placeholder="Write your blog content here..."
                                />
                            </div>

                            {/* Featured Image */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">Featured Image</label>
                                {formData.featuredImage ? (
                                    <div className="relative inline-block">
                                        <img src={formData.featuredImage} alt="Featured" className="w-full max-w-md h-48 object-cover rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, featuredImage: '' })}
                                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                                        <ImageIcon size={32} className="text-slate-400 mb-2" />
                                        <span className="text-sm text-slate-600">Click to upload featured image</span>
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="hidden" disabled={uploadingImages} />
                                    </label>
                                )}
                            </div>

                            {/* Additional Images */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">Additional Images</label>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="relative">
                                            <img src={img} alt={`Gallery ${index}`} className="w-full h-32 object-cover rounded-lg" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg cursor-pointer hover:bg-slate-200">
                                    <ImageIcon size={18} />
                                    {uploadingImages ? 'Uploading...' : 'Upload Images'}
                                    <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, false)} className="hidden" disabled={uploadingImages} />
                                </label>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">Tags</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        placeholder="Add a tag"
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                                    />
                                    <Button type="button" onClick={addTag} variant="outline">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag, index) => (
                                        <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(index)} className="hover:text-emerald-900">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingBlog(null); resetForm(); }}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Saving...' : (editingBlog ? 'Update Blog' : 'Create Blog')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Blog List */}
            <div className="bg-white rounded-xl border border-slate-200">
                {isLoading && blogs.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-emerald-600" size={32} />
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-20 text-slate-600">No blogs yet. Create your first one!</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Views</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {blogs.map((blog) => (
                                    <tr key={blog._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{blog.title}</div>
                                            <div className="text-sm text-slate-500 line-clamp-1">{blog.excerpt}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">{blog.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${blog.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {blog.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{blog.viewCount}</td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">{new Date(blog.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {blog.status === 'published' && (
                                                    <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                        <Eye size={18} />
                                                    </a>
                                                )}
                                                <button onClick={() => handleEdit(blog)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(blog._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogManager;

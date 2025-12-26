import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getResources, addResource, deleteResource } from '../../features/resources/resourceSlice';
import { FileText, Trash2, Upload, Download, Loader2, BookOpen, Shield, Lock } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { toast } from 'react-toastify';
import api from '../../utils/api';

export default function ResourceManager() {
    const dispatch = useDispatch();
    const { resources, isLoading } = useSelector((state) => state.resources);
    const { user } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        name: '',
        file: null,
        category: 'document' // Default category
    });
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('document'); // 'document' or 'exam'

    useEffect(() => {
        dispatch(getResources());
    }, [dispatch]);

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.file) {
            return toast.error("Please provide name and file");
        }

        setIsUploading(true);

        try {
            const uploadData = new FormData();
            uploadData.append('file', formData.file);

            const uploadRes = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const fileUrl = uploadRes.data.url;

            // Now create the resource info
            await dispatch(addResource({
                name: formData.name,
                fileUrl: fileUrl,
                fileType: 'document',
                category: formData.category
            })).unwrap();

            toast.success(`${formData.category === 'exam' ? 'Exam' : 'Document'} uploaded successfully!`);
            setFormData({ name: '', file: null, category: 'document' });
            document.getElementById('file-upload').value = null;

        } catch (error) {
            toast.error(error.message || "Failed to upload");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure?")) {
            dispatch(deleteResource(id));
        }
    };

    // Filter resources based on active tab
    const filteredResources = resources.filter(res => (res.category || 'document') === activeTab);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Upload Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Upload size={20} className="text-primary-600" /> Upload Resource
                        </h3>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <Input
                                label="Resource Name"
                                placeholder="e.g. Exam Routine 2025"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="document">General Notice / Routine</option>
                                    <option value="exam">Exam Question</option>
                                    {user?.role === 'consultancy_admin' && (
                                        <option value="admin_only">Admin Only Document (Private)</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select File</label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-slate-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-primary-50 file:text-primary-700
                                    hover:file:bg-primary-100
                                    cursor-pointer"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full justify-center"
                                disabled={isUploading}
                            >
                                {isUploading ? <Loader2 className="animate-spin" /> : 'Upload & Notify'}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                        {/* Tabs Header */}
                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => setActiveTab('document')}
                                className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 ${activeTab === 'document' ? 'border-primary-600 text-primary-600 bg-primary-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Notices & Routines
                            </button>
                            <button
                                onClick={() => setActiveTab('exam')}
                                className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 ${activeTab === 'exam' ? 'border-primary-600 text-primary-600 bg-primary-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Exam Questions
                            </button>
                            {user?.role === 'consultancy_admin' && (
                                <button
                                    onClick={() => setActiveTab('admin_only')}
                                    className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 ${activeTab === 'admin_only' ? 'border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Admin Docs
                                </button>
                            )}
                        </div>

                        <div className="p-5 border-b border-slate-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                {activeTab === 'exam' && 'Exam Questions'}
                                {activeTab === 'document' && 'General Documents'}
                                {activeTab === 'admin_only' && (
                                    <>
                                        <Lock size={18} className="text-red-600" />
                                        <span className="text-red-700">Restricted Admin Documents</span>
                                    </>
                                )}
                            </h3>
                            <span className="text-sm text-slate-500">{filteredResources.length} files</span>
                        </div>

                        {isLoading && !isUploading ? (
                            <div className="p-8 text-center text-slate-500">Loading...</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredResources.map(resource => (
                                    <div key={resource._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${resource.category === 'exam' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {resource.category === 'exam' ? <BookOpen size={20} /> : <FileText size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-800">{resource.name}</h4>
                                                <p className="text-xs text-slate-500">
                                                    Uploaded on {new Date(resource.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={resource.fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Download/View"
                                            >
                                                <Download size={18} />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(resource._id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {filteredResources.length === 0 && (
                                    <div className="p-8 text-center text-slate-400">
                                        <p>No {activeTab === 'exam' ? 'exam questions' : 'documents'} found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

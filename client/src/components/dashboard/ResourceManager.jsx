import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getResources, addResource, deleteResource, uploadFilledForm, verifyForm } from '../../features/resources/resourceSlice';
import { FileText, Trash2, Upload, Download, Loader2, BookOpen, Shield, Lock, CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
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

    // Workflow modals
    const [fillModalOpen, setFillModalOpen] = useState(false);
    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [fillFile, setFillFile] = useState(null);
    const [verificationData, setVerificationData] = useState({ status: '', message: '' });

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

    // Handle workflows
    const handleOpenFillModal = (resource) => {
        setSelectedResource(resource);
        setFillModalOpen(true);
    };

    const handleFillSubmit = async () => {
        if (!fillFile) return toast.error('Please select a file');

        setIsUploading(true);
        try {
            // Upload file first
            const uploadData = new FormData();
            uploadData.append('file', fillFile);
            const uploadRes = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update resource with filled form
            await dispatch(uploadFilledForm({
                id: selectedResource._id,
                fileUrl: uploadRes.data.url
            })).unwrap();

            toast.success('Filled form uploaded successfully!');
            setFillModalOpen(false);
            setFillFile(null);
        } catch (error) {
            toast.error(error || 'Failed to upload filled form');
        } finally {
            setIsUploading(false);
        }
    };

    const handleOpenVerifyModal = (resource) => {
        setSelectedResource(resource);
        setVerificationData({ status: '', message: '' });
        setVerifyModalOpen(true);
    };

    const handleVerifySubmit = async () => {
        if (!verificationData.status) return toast.error('Please select verification status');

        try {
            await dispatch(verifyForm({
                id: selectedResource._id,
                status: verificationData.status,
                message: verificationData.message
            })).unwrap();

            toast.success(`Form ${verificationData.status} successfully!`);
            setVerifyModalOpen(false);
            setVerificationData({ status: '', message: '' });
        } catch (error) {
            toast.error(error || 'Failed to verify form');
        }
    };

    // Get workflow status badge
    const getWorkflowBadge = (status) => {
        const badges = {
            template: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Template' },
            filled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Filled' },
            verified: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Verified' },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' }
        };
        const badge = badges[status] || badges.template;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
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
                                    <option value="university_form">University Form / Template</option>
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
                            <button
                                onClick={() => setActiveTab('university_form')}
                                className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 ${activeTab === 'university_form' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                University Forms
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
                                {activeTab === 'university_form' && 'University Forms & Templates'}
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
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${resource.category === 'exam' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {resource.category === 'exam' ? <BookOpen size={20} /> : <FileText size={20} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-slate-800">{resource.name}</h4>
                                                    {resource.category === 'university_form' && getWorkflowBadge(resource.workflowStatus)}
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    Uploaded on {new Date(resource.createdAt).toLocaleDateString()}
                                                    {resource.verifiedBy && (
                                                        <span className="ml-2">• Verified by {resource.verifiedBy.name} on {new Date(resource.verifiedAt).toLocaleDateString()}</span>
                                                    )}
                                                </p>
                                                {resource.verificationMessage && (
                                                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                                                        <MessageSquare size={12} /> {resource.verificationMessage}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Template download for university forms */}
                                            {resource.category === 'university_form' && resource.templateUrl && (
                                                <a
                                                    href={resource.templateUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all flex items-center gap-1"
                                                    title="Download Template"
                                                >
                                                    <Download size={14} /> Template
                                                </a>
                                            )}

                                            {/* Main file download */}
                                            <a
                                                href={resource.fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title={resource.category === 'university_form' && resource.workflowStatus !== 'template' ? 'Download Filled Form' : 'Download/View'}
                                            >
                                                <Download size={18} />
                                            </a>

                                            {/* Workflow actions for university forms */}
                                            {resource.category === 'university_form' && (
                                                <>
                                                    {/* Staff: Upload filled form */}
                                                    {(resource.workflowStatus === 'template' || resource.workflowStatus === 'rejected') && (
                                                        <button
                                                            onClick={() => handleOpenFillModal(resource)}
                                                            className="px-3 py-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-all flex items-center gap-1"
                                                            title="Upload Filled Form"
                                                        >
                                                            <Upload size={14} /> Update
                                                        </button>
                                                    )}

                                                    {/* Admin: Verify/Reject */}
                                                    {user?.role === 'consultancy_admin' && resource.workflowStatus === 'filled' && (
                                                        <button
                                                            onClick={() => handleOpenVerifyModal(resource)}
                                                            className="px-3 py-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-all flex items-center gap-1"
                                                            title="Verify Form"
                                                        >
                                                            <Eye size={14} /> Review
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            {/* Delete button */}
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

            {/* Fill Form Modal */}
            <Modal isOpen={fillModalOpen} onClose={() => setFillModalOpen(false)} title="Upload Filled Form">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Upload the completed version of <strong>{selectedResource?.name}</strong>
                    </p>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                        <input
                            type="file"
                            accept="application/pdf,image/*,.doc,.docx"
                            onChange={(e) => setFillFile(e.target.files[0])}
                            className="hidden"
                            id="fill-file-input"
                        />
                        <label htmlFor="fill-file-input" className="cursor-pointer">
                            {fillFile ? (
                                <div className="text-emerald-600 font-medium flex flex-col items-center">
                                    <FileText size={32} className="mb-2" />
                                    {fillFile.name}
                                </div>
                            ) : (
                                <div className="text-slate-400 flex flex-col items-center">
                                    <Upload size={32} className="mb-2" />
                                    Click to upload filled form
                                </div>
                            )}
                        </label>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setFillModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleFillSubmit} disabled={isUploading}>
                            {isUploading ? <Loader2 className="animate-spin" /> : 'Upload Filled Form'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Verify Form Modal */}
            <Modal isOpen={verifyModalOpen} onClose={() => setVerifyModalOpen(false)} title="Verify Form">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 mb-4">
                        Review <strong>{selectedResource?.name}</strong> and provide verification status.
                    </p>

                    {/* Preview link */}
                    {selectedResource?.fileUrl && (
                        <a
                            href={selectedResource.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-center flex items-center justify-center gap-2"
                        >
                            <Eye size={16} /> View Filled Form
                        </a>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2">Verification Status</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setVerificationData({ ...verificationData, status: 'verified' })}
                                className={`py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${verificationData.status === 'verified'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                        : 'border-slate-200 hover:border-emerald-300'
                                    }`}
                            >
                                <CheckCircle size={20} /> Approve
                            </button>
                            <button
                                onClick={() => setVerificationData({ ...verificationData, status: 'rejected' })}
                                className={`py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${verificationData.status === 'rejected'
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-slate-200 hover:border-red-300'
                                    }`}
                            >
                                <XCircle size={20} /> Reject
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Feedback Message</label>
                        <textarea
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            rows="3"
                            placeholder="Add verification feedback or reasons for rejection..."
                            value={verificationData.message}
                            onChange={(e) => setVerificationData({ ...verificationData, message: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setVerifyModalOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleVerifySubmit}
                            className={verificationData.status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                            {verificationData.status === 'verified' ? 'Approve Form' : 'Reject Form'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    fetchAllJobsAdmin,
    createJob,
    updateJob,
    deleteJob,
    clearError
} from '../../features/jobs/jobSlice';
import {
    fetchApplications,
    fetchApplicationById,
    updateApplicationStatus,
    deleteApplication,
    clearCurrentApplication
} from '../../features/jobApplications/jobApplicationSlice';
import {
    Briefcase,
    Plus,
    Edit,
    Trash2,
    Eye,
    X,
    Loader2,
    Search,
    Filter,
    FileText,
    Calendar,
    MapPin,
    DollarSign,
    CheckCircle,
    Ban,
    Clock,
    Mail,
    Phone,
    ExternalLink,
    Users
} from 'lucide-react';
import { toast } from 'react-toastify';

const CareersManager = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { jobs, isLoading: jobsLoading, error: jobError } = useSelector((state) => state.jobs);
    const {
        applications,
        currentApplication,
        isLoading: appsLoading,
        pagination,
        error: appError
    } = useSelector((state) => state.jobApplications);

    const [activeTab, setActiveTab] = useState('jobs');
    const [showJobModal, setShowJobModal] = useState(false);
    const [showAppModal, setShowAppModal] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    const [jobFormData, setJobFormData] = useState({
        title: '',
        department: 'Engineering',
        location: '',
        jobType: 'full-time',
        salaryRange: { min: '', max: '', currency: 'JPY' },
        description: '',
        requirements: [''],
        qualifications: [''],
        responsibilities: [''],
        benefits: [''],
        applicationDeadline: '',
        status: 'active'
    });

    const [appFilters, setAppFilters] = useState({
        status: 'all',
        search: '',
        jobId: '',
        page: 1
    });

    const [statusUpdate, setStatusUpdate] = useState({
        status: '',
        notes: ''
    });

    const departments = ['Engineering', 'Marketing', 'Sales', 'Customer Support', 'HR', 'Operations', 'Finance', 'Design'];
    const jobTypes = ['full-time', 'part-time', 'contract', 'internship'];
    const jobStatuses = ['active', 'closed', 'draft'];
    const appStatuses = ['all', 'new', 'reviewed', 'shortlisted', 'rejected', 'hired'];

    useEffect(() => {
        dispatch(fetchAllJobsAdmin());
        dispatch(fetchApplications(appFilters));

        // Check if edit param exists
        const editId = searchParams.get('edit');
        if (editId) {
            const jobToEdit = jobs.find(j => j._id === editId);
            if (jobToEdit) {
                handleEditJob(jobToEdit);
            }
        }
    }, [dispatch]);

    useEffect(() => {
        if (activeTab === 'applications') {
            dispatch(fetchApplications(appFilters));
        }
    }, [dispatch, activeTab, appFilters]);

    useEffect(() => {
        if (jobError) {
            toast.error(jobError);
            dispatch(clearError());
        }
        if (appError) {
            toast.error(appError);
        }
    }, [jobError, appError, dispatch]);

    const handleJobInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('salary-')) {
            const field = name.split('-')[1];
            setJobFormData({
                ...jobFormData,
                salaryRange: { ...jobFormData.salaryRange, [field]: value }
            });
        } else {
            setJobFormData({ ...jobFormData, [name]: value });
        }
    };

    const handleArrayInputChange = (field, index, value) => {
        const newArray = [...jobFormData[field]];
        newArray[index] = value;
        setJobFormData({ ...jobFormData, [field]: newArray });
    };

    const addArrayItem = (field) => {
        setJobFormData({ ...jobFormData, [field]: [...jobFormData[field], ''] });
    };

    const removeArrayItem = (field, index) => {
        const newArray = jobFormData[field].filter((_, i) => i !== index);
        setJobFormData({ ...jobFormData, [field]: newArray });
    };

    const resetJobForm = () => {
        setJobFormData({
            title: '',
            department: 'Engineering',
            location: '',
            jobType: 'full-time',
            salaryRange: { min: '', max: '', currency: 'JPY' },
            description: '',
            requirements: [''],
            qualifications: [''],
            responsibilities: [''],
            benefits: [''],
            applicationDeadline: '',
            status: 'active'
        });
        setEditingJob(null);
    };

    const handleEditJob = (job) => {
        setEditingJob(job);
        setJobFormData({
            title: job.title,
            department: job.department,
            location: job.location,
            jobType: job.jobType,
            salaryRange: job.salaryRange || { min: '', max: '', currency: 'JPY' },
            description: job.description,
            requirements: job.requirements?.length > 0 ? job.requirements : [''],
            qualifications: job.qualifications?.length > 0 ? job.qualifications : [''],
            responsibilities: job.responsibilities?.length > 0 ? job.responsibilities : [''],
            benefits: job.benefits?.length > 0 ? job.benefits : [''],
            applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '',
            status: job.status
        });
        setShowJobModal(true);
    };

    const handleJobSubmit = async (e) => {
        e.preventDefault();

        // Filter out empty array items
        const cleanedData = {
            ...jobFormData,
            requirements: jobFormData.requirements.filter(r => r.trim() !== ''),
            qualifications: jobFormData.qualifications.filter(q => q.trim() !== ''),
            responsibilities: jobFormData.responsibilities.filter(r => r.trim() !== ''),
            benefits: jobFormData.benefits.filter(b => b.trim() !== '')
        };

        // Only include salaryRange if at least one value is provided
        if (jobFormData.salaryRange.min || jobFormData.salaryRange.max) {
            cleanedData.salaryRange = {
                min: jobFormData.salaryRange.min ? parseInt(jobFormData.salaryRange.min) : undefined,
                max: jobFormData.salaryRange.max ? parseInt(jobFormData.salaryRange.max) : undefined,
                currency: 'JPY'
            };
        }

        try {
            if (editingJob) {
                await dispatch(updateJob({ id: editingJob._id, data: cleanedData })).unwrap();
                toast.success('Job updated successfully');
            } else {
                await dispatch(createJob(cleanedData)).unwrap();
                toast.success('Job created successfully');
            }
            setShowJobModal(false);
            resetJobForm();
            dispatch(fetchAllJobsAdmin());
        } catch (error) {
            toast.error(error || 'Failed to save job');
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job posting?')) {
            try {
                await dispatch(deleteJob(jobId)).unwrap();
                toast.success('Job deleted successfully');
                dispatch(fetchAllJobsAdmin());
            } catch (error) {
                toast.error(error || 'Failed to delete job');
            }
        }
    };

    const handleViewApplication = async (appId) => {
        await dispatch(fetchApplicationById(appId));
        setShowAppModal(true);
    };

    const handleUpdateAppStatus = async () => {
        if (!statusUpdate.status) {
            toast.error('Please select a status');
            return;
        }

        try {
            await dispatch(updateApplicationStatus({
                id: currentApplication._id,
                status: statusUpdate.status,
                notes: statusUpdate.notes
            })).unwrap();
            toast.success('Application status updated');
            setShowAppModal(false);
            setStatusUpdate({ status: '', notes: '' });
            dispatch(clearCurrentApplication());
            dispatch(fetchApplications(appFilters));
        } catch (error) {
            toast.error(error || 'Failed to update status');
        }
    };

    const handleDeleteApplication = async (appId) => {
        if (window.confirm('Are you sure you want to delete this application?')) {
            try {
                await dispatch(deleteApplication(appId)).unwrap();
                toast.success('Application deleted successfully');
                dispatch(fetchApplications(appFilters));
            } catch (error) {
                toast.error(error || 'Failed to delete application');
            }
        }
    };

    const formatSalary = (salaryRange) => {
        if (!salaryRange || !salaryRange.min) return 'Competitive';
        const formatter = new Intl.NumberFormat('ja-JP');
        return `Rs${formatter.format(salaryRange.min)} - Rs${formatter.format(salaryRange.max)}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getStatusColor = (status) => {
        const colors = {
            new: 'bg-blue-100 text-blue-700',
            reviewed: 'bg-purple-100 text-purple-700',
            shortlisted: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
            hired: 'bg-primary-100 text-primary-700',
            active: 'bg-green-100 text-green-700',
            closed: 'bg-red-100 text-red-700',
            draft: 'bg-gray-100 text-gray-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Careers Manager</h1>
                <p className="text-slate-600 mt-2">Manage job postings and applications</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('jobs')}
                    className={`px-6 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'jobs'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Briefcase size={20} />
                        Jobs ({jobs.length})
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('applications')}
                    className={`px-6 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'applications'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <FileText size={20} />
                        Applications ({pagination.total || 0})
                    </div>
                </button>
            </div>

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
                <div className="space-y-6">
                    {/* Jobs Header */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900">Job Postings</h2>
                        <button
                            onClick={() => {
                                resetJobForm();
                                setShowJobModal(true);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Create Job
                        </button>
                    </div>

                    {/* Jobs List */}
                    {jobsLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-primary-600" size={48} />
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                            <Briefcase className="mx-auto mb-4 text-slate-300" size={64} />
                            <p className="text-slate-600 text-lg">No job postings yet</p>
                            <p className="text-slate-500 text-sm mt-2">Create your first job posting to get started</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map((job) => (
                                <div
                                    key={job._id}
                                    className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                            </span>
                                            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                                                {job.jobType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{job.title}</h3>
                                    <p className="text-sm font-medium text-primary-600 mb-4">{job.department}</p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <MapPin size={16} />
                                            <span>{job.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <DollarSign size={16} />
                                            <span>{formatSalary(job.salaryRange)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Eye size={16} />
                                            <span>{job.viewCount} views</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => navigate(`/dashboard/careers/${job.slug}`)}
                                            className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                        >
                                            <Eye size={16} />
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleEditJob(job)}
                                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteJob(job._id)}
                                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200">
                        <div className="grid md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={appFilters.search}
                                        onChange={(e) => setAppFilters({ ...appFilters, search: e.target.value, page: 1 })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <select
                                    value={appFilters.status}
                                    onChange={(e) => setAppFilters({ ...appFilters, status: e.target.value, page: 1 })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    {appStatuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <select
                                    value={appFilters.jobId}
                                    onChange={(e) => setAppFilters({ ...appFilters, jobId: e.target.value, page: 1 })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">All Jobs</option>
                                    {jobs.map((job) => (
                                        <option key={job._id} value={job._id}>
                                            {job.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Applications List */}
                    {appsLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-primary-600" size={48} />
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                            <FileText className="mx-auto mb-4 text-slate-300" size={64} />
                            <p className="text-slate-600 text-lg">No applications yet</p>
                            <p className="text-slate-500 text-sm mt-2">Applications will appear here when candidates apply</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Applicant</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Job</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Applied</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {applications.map((app) => (
                                                <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium text-slate-900">{app.applicantName}</p>
                                                            <p className="text-sm text-slate-500">{app.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-slate-900">{app.job?.title || 'N/A'}</p>
                                                        <p className="text-xs text-slate-500">{app.job?.department}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {formatDate(app.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleViewApplication(app._id)}
                                                                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteApplication(app._id)}
                                                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => setAppFilters({ ...appFilters, page: appFilters.page - 1 })}
                                        disabled={appFilters.page === 1}
                                        className="px-4 py-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex gap-2">
                                        {[...Array(pagination.pages)].map((_, index) => (
                                            <button
                                                key={index + 1}
                                                onClick={() => setAppFilters({ ...appFilters, page: index + 1 })}
                                                className={`w-10 h-10 rounded-lg font-medium transition-all ${appFilters.page === index + 1
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                                    }`}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setAppFilters({ ...appFilters, page: appFilters.page + 1 })}
                                        disabled={appFilters.page === pagination.pages}
                                        className="px-4 py-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Job Modal */}
            {showJobModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {editingJob ? 'Edit Job' : 'Create Job'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowJobModal(false);
                                    resetJobForm();
                                }}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleJobSubmit} className="p-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Job Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={jobFormData.title}
                                        onChange={handleJobInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Department <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="department"
                                        value={jobFormData.department}
                                        onChange={handleJobInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        required
                                    >
                                        {departments.map((dept) => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Job Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="jobType"
                                        value={jobFormData.jobType}
                                        onChange={handleJobInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        required
                                    >
                                        {jobTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Location <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={jobFormData.location}
                                        onChange={handleJobInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={jobFormData.status}
                                        onChange={handleJobInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        {jobStatuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Min Salary (JPY)
                                    </label>
                                    <input
                                        type="number"
                                        name="salary-min"
                                        value={jobFormData.salaryRange.min}
                                        onChange={handleJobInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Max Salary (JPY)
                                    </label>
                                    <input
                                        type="number"
                                        name="salary-max"
                                        value={jobFormData.salaryRange.max}
                                        onChange={handleJobInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Application Deadline
                                    </label>
                                    <input
                                        type="date"
                                        name="applicationDeadline"
                                        value={jobFormData.applicationDeadline}
                                        onChange={handleJobInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={jobFormData.description}
                                        onChange={handleJobInputChange}
                                        rows={5}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                                        required
                                    />
                                </div>

                                {/* Requirements */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Requirements</label>
                                    {jobFormData.requirements.map((req, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={req}
                                                onChange={(e) => handleArrayInputChange('requirements', index, e.target.value)}
                                                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            />
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem('requirements', index)}
                                                    className="px-3 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200"
                                                >
                                                    <X size={20} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('requirements')}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        + Add Requirement
                                    </button>
                                </div>

                                {/* Qualifications */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Qualifications</label>
                                    {jobFormData.qualifications.map((qual, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={qual}
                                                onChange={(e) => handleArrayInputChange('qualifications', index, e.target.value)}
                                                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            />
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem('qualifications', index)}
                                                    className="px-3 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200"
                                                >
                                                    <X size={20} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('qualifications')}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        + Add Qualification
                                    </button>
                                </div>

                                {/* Responsibilities */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Responsibilities</label>
                                    {jobFormData.responsibilities.map((resp, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={resp}
                                                onChange={(e) => handleArrayInputChange('responsibilities', index, e.target.value)}
                                                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            />
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem('responsibilities', index)}
                                                    className="px-3 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200"
                                                >
                                                    <X size={20} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('responsibilities')}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        + Add Responsibility
                                    </button>
                                </div>

                                {/* Benefits */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Benefits</label>
                                    {jobFormData.benefits.map((benefit, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={benefit}
                                                onChange={(e) => handleArrayInputChange('benefits', index, e.target.value)}
                                                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            />
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem('benefits', index)}
                                                    className="px-3 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200"
                                                >
                                                    <X size={20} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('benefits')}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        + Add Benefit
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowJobModal(false);
                                        resetJobForm();
                                    }}
                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={jobsLoading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                                >
                                    {jobsLoading ? 'Saving...' : editingJob ? 'Update Job' : 'Create Job'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Application Modal */}
            {showAppModal && currentApplication && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900">Application Details</h2>
                            <button
                                onClick={() => {
                                    setShowAppModal(false);
                                    dispatch(clearCurrentApplication());
                                    setStatusUpdate({ status: '', notes: '' });
                                }}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Job Info */}
                            <div className="bg-primary-50 border border-emerald-200 rounded-xl p-4">
                                <h3 className="font-bold text-emerald-900 mb-1">{currentApplication.job?.title}</h3>
                                <p className="text-sm text-primary-700">{currentApplication.job?.department}</p>
                            </div>

                            {/* Applicant Info */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                                    <p className="text-slate-900">{currentApplication.applicantName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                                    <a href={`mailto:${currentApplication.email}`} className="text-primary-600 hover:underline flex items-center gap-1">
                                        <Mail size={16} />
                                        {currentApplication.email}
                                    </a>
                                </div>
                                {currentApplication.phone && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                                        <a href={`tel:${currentApplication.phone}`} className="text-primary-600 hover:underline flex items-center gap-1">
                                            <Phone size={16} />
                                            {currentApplication.phone}
                                        </a>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Applied</label>
                                    <p className="text-slate-900">{formatDate(currentApplication.createdAt)}</p>
                                </div>
                            </div>

                            {/* Links */}
                            <div className="space-y-2">
                                {currentApplication.resumeUrl && (
                                    <a
                                        href={currentApplication.resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-primary-600 hover:underline"
                                    >
                                        <FileText size={16} />
                                        View Resume
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                                {currentApplication.linkedinUrl && (
                                    <a
                                        href={currentApplication.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-primary-600 hover:underline"
                                    >
                                        <Users size={16} />
                                        LinkedIn Profile
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                                {currentApplication.portfolioUrl && (
                                    <a
                                        href={currentApplication.portfolioUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-primary-600 hover:underline"
                                    >
                                        <Briefcase size={16} />
                                        Portfolio
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>

                            {/* Cover Letter */}
                            {currentApplication.coverLetter && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Cover Letter</label>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <p className="text-slate-700 whitespace-pre-line">{currentApplication.coverLetter}</p>
                                    </div>
                                </div>
                            )}

                            {/* Current Status */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Current Status</label>
                                <span className={`px-4 py-2 text-sm font-semibold rounded-full inline-block ${getStatusColor(currentApplication.status)}`}>
                                    {currentApplication.status.charAt(0).toUpperCase() + currentApplication.status.slice(1)}
                                </span>
                            </div>

                            {/* Notes */}
                            {currentApplication.notes && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <p className="text-slate-700">{currentApplication.notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Update Status */}
                            <div className="pt-6 border-t border-slate-200 space-y-4">
                                <h3 className="text-lg font-bold text-slate-900">Update Status</h3>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">New Status</label>
                                    <select
                                        value={statusUpdate.status}
                                        onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">Select status...</option>
                                        {appStatuses.filter(s => s !== 'all').map((status) => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                                    <textarea
                                        value={statusUpdate.notes}
                                        onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                                        placeholder="Add notes about this application..."
                                    />
                                </div>
                                <button
                                    onClick={handleUpdateAppStatus}
                                    disabled={appsLoading || !statusUpdate.status}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                                >
                                    {appsLoading ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareersManager;

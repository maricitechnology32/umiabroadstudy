import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchJobBySlug, clearCurrentJob, deleteJob } from '../../features/jobs/jobSlice';
import { submitJobApplication, fetchMyApplications, clearError, clearSuccess } from '../../features/jobApplications/jobApplicationSlice';
import { Briefcase, MapPin, DollarSign, Calendar, Eye, CheckCircle, Upload, Loader2, ArrowLeft, Send, Edit, Trash2, Ban, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const DashboardCareerDetail = () => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { currentJob, isLoading } = useSelector((state) => state.jobs);
    const { applications, isLoading: isSubmitting, error, successMessage } = useSelector((state) => state.jobApplications);

    const [formData, setFormData] = useState({
        applicantName: user?.name || '',
        email: user?.email || '',
        phone: '',
        resumeUrl: '',
        coverLetter: '',
        linkedinUrl: '',
        portfolioUrl: ''
    });

    const [uploading, setUploading] = useState(false);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    const isAdmin = user?.role === 'super_admin' || user?.role === 'consultancy_admin';

    useEffect(() => {
        dispatch(fetchJobBySlug(slug));
        if (!isAdmin && user) {
            dispatch(fetchMyApplications());
        }
        return () => {
            dispatch(clearCurrentJob());
            dispatch(clearError());
            dispatch(clearSuccess());
        };
    }, [dispatch, slug, isAdmin, user]);

    // Check if user has already applied for this job
    useEffect(() => {
        if (currentJob && applications && user?.email) {
            const existingApplication = applications.find(
                app => app.job?._id === currentJob._id || app.job?.slug === currentJob.slug
            );
            setHasApplied(!!existingApplication);
        }
    }, [currentJob, applications, user]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
        if (successMessage) {
            toast.success(successMessage);
            dispatch(clearSuccess());
            setShowApplicationForm(false);
            // Reset form
            setFormData({
                applicantName: user?.name || '',
                email: user?.email || '',
                phone: '',
                resumeUrl: '',
                coverLetter: '',
                linkedinUrl: '',
                portfolioUrl: ''
            });
        }
    }, [error, successMessage, dispatch, user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload a PDF or Word document');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            const response = await api.post('/upload', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData({ ...formData, resumeUrl: response.data.url });
            toast.success('Resume uploaded successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload resume');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.applicantName || !formData.email || !formData.resumeUrl) {
            toast.error('Please fill in all required fields');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        dispatch(submitJobApplication({
            job: currentJob._id,
            ...formData
        }));
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this job posting?')) {
            try {
                await dispatch(deleteJob(currentJob._id)).unwrap();
                toast.success('Job deleted successfully');
                navigate('/dashboard/careers');
            } catch (error) {
                toast.error(error || 'Failed to delete job');
            }
        }
    };

    const formatSalary = (salaryRange) => {
        if (!salaryRange || !salaryRange.min) return 'Competitive';
        const formatter = new Intl.NumberFormat('ja-JP');
        return `Rs${formatter.format(salaryRange.min)} - Rs${formatter.format(salaryRange.max)}`;
    };

    const formatDeadline = (deadline) => {
        if (!deadline) return 'No deadline';
        const date = new Date(deadline);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (isLoading || !currentJob) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-primary-600" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Back Button */}
            <button
                onClick={() => navigate('/dashboard/careers')}
                className="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Careers</span>
            </button>

            {/* Job Header */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-4 py-1.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full shadow-sm">
                                {currentJob.jobType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </span>
                            <span className="px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full">
                                {currentJob.department}
                            </span>
                            <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${currentJob.status === 'active' ? 'bg-green-100 text-green-700' :
                                currentJob.status === 'closed' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {currentJob.status.charAt(0).toUpperCase() + currentJob.status.slice(1)}
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">{currentJob.title}</h1>

                        <div className="flex flex-wrap gap-6 text-slate-600">
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className="text-primary-600" />
                                <span>{currentJob.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign size={18} className="text-primary-600" />
                                <span>{formatSalary(currentJob.salaryRange)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye size={18} className="text-primary-600" />
                                <span>{currentJob.viewCount} views</span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => window.open(`/careers/${currentJob.slug}`, '_blank')}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm font-medium"
                                title="View live page"
                            >
                                <ExternalLink size={18} />
                                View Live
                            </button>
                            <button
                                onClick={() => navigate(`/admin/careers?edit=${currentJob._id}`)}
                                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2 font-medium"
                            >
                                <Edit size={18} />
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
                            >
                                <Trash2 size={18} />
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {currentJob.applicationDeadline && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                        <Calendar className="text-amber-600" size={20} />
                        <div>
                            <p className="text-sm font-semibold text-amber-900">Application Deadline</p>
                            <p className="text-sm text-amber-700">{formatDeadline(currentJob.applicationDeadline)}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Job Details */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-white rounded-2xl p-8 border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Job Description</h2>
                        {/* Using dangerouslySetInnerHTML to render HTML content from rich text editor */}
                        <div
                            className="prose prose-slate max-w-none prose-p:text-slate-700 prose-ul:text-slate-700"
                            dangerouslySetInnerHTML={{ __html: currentJob.description }}
                        />
                    </div>

                    {/* Requirements */}
                    {currentJob.requirements && currentJob.requirements.length > 0 && (
                        <div className="bg-white rounded-2xl p-8 border border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Requirements</h2>
                            <ul className="space-y-3">
                                {currentJob.requirements.map((req, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle className="text-primary-600 flex-shrink-0 mt-0.5" size={20} />
                                        <span className="text-slate-700">{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Qualifications */}
                    {currentJob.qualifications && currentJob.qualifications.length > 0 && (
                        <div className="bg-white rounded-2xl p-8 border border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Qualifications</h2>
                            <ul className="space-y-3">
                                {currentJob.qualifications.map((qual, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle className="text-primary-600 flex-shrink-0 mt-0.5" size={20} />
                                        <span className="text-slate-700">{qual}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Responsibilities */}
                    {currentJob.responsibilities && currentJob.responsibilities.length > 0 && (
                        <div className="bg-white rounded-2xl p-8 border border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Responsibilities</h2>
                            <ul className="space-y-3">
                                {currentJob.responsibilities.map((resp, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle className="text-primary-600 flex-shrink-0 mt-0.5" size={20} />
                                        <span className="text-slate-700">{resp}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Benefits */}
                    {currentJob.benefits && currentJob.benefits.length > 0 && (
                        <div className="bg-white rounded-2xl p-8 border border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Benefits</h2>
                            <ul className="space-y-3">
                                {currentJob.benefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle className="text-primary-600 flex-shrink-0 mt-0.5" size={20} />
                                        <span className="text-slate-700">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    {!isAdmin && (
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 sticky top-24">
                            {hasApplied ? (
                                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-center">
                                    <CheckCircle className="mx-auto mb-2 text-primary-600" size={32} />
                                    <p className="font-semibold text-primary-900 mb-1">Already Applied</p>
                                    <p className="text-sm text-primary-700">You have already submitted an application for this position. Check "My Applications" for status updates.</p>
                                    <button
                                        onClick={() => navigate('/dashboard/my-applications')}
                                        className="mt-3 w-full px-4 py-2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium"
                                    >
                                        View My Applications
                                    </button>
                                </div>
                            ) : !showApplicationForm ? (
                                <button
                                    onClick={() => setShowApplicationForm(true)}
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Send size={20} />
                                    Apply for this Position
                                </button>
                            ) : (
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">Submit Application</h3>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="applicantName"
                                                value={formData.applicantName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Resume/CV <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="file"
                                                onChange={handleFileUpload}
                                                accept=".pdf,.doc,.docx"
                                                className="hidden"
                                                id="resume-upload"
                                            />
                                            <label
                                                htmlFor="resume-upload"
                                                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer"
                                            >
                                                {uploading ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={18} />
                                                        <span className="text-sm">Uploading...</span>
                                                    </>
                                                ) : formData.resumeUrl ? (
                                                    <>
                                                        <CheckCircle className="text-primary-600" size={18} />
                                                        <span className="text-sm text-primary-600">Uploaded</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload size={18} />
                                                        <span className="text-sm">Upload</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Cover Letter
                                            </label>
                                            <textarea
                                                name="coverLetter"
                                                value={formData.coverLetter}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-sm"
                                                maxLength={2000}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                LinkedIn
                                            </label>
                                            <input
                                                type="url"
                                                name="linkedinUrl"
                                                value={formData.linkedinUrl}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Portfolio
                                            </label>
                                            <input
                                                type="url"
                                                name="portfolioUrl"
                                                value={formData.portfolioUrl}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowApplicationForm(false)}
                                                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || uploading}
                                                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <Loader2 className="animate-spin" size={18} />
                                                ) : (
                                                    <>
                                                        <Send size={18} />
                                                        Submit
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardCareerDetail;

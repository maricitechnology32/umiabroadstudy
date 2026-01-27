import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchJobBySlug, clearCurrentJob } from '../../features/jobs/jobSlice';
import { submitJobApplication, clearError, clearSuccess } from '../../features/jobApplications/jobApplicationSlice';
import {
    Briefcase, MapPin, DollarSign, Calendar, Clock, Eye, CheckCircle,
    Upload, Loader2, ArrowLeft, Send, Building2, Globe, Users, FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../utils/api';

const CareerDetail = ({ isDashboard }) => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentJob, isLoading } = useSelector((state) => state.jobs);
    const { isLoading: isSubmitting, error, successMessage } = useSelector((state) => state.jobApplications);

    const [formData, setFormData] = useState({
        applicantName: '',
        email: '',
        phone: '',
        resumeUrl: '',
        coverLetter: '',
        linkedinUrl: '',
        portfolioUrl: ''
    });

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        dispatch(fetchJobBySlug(slug));
        return () => {
            dispatch(clearCurrentJob());
            dispatch(clearError());
            dispatch(clearSuccess());
        };
    }, [dispatch, slug]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
        if (successMessage) {
            toast.success(successMessage);
            dispatch(clearSuccess());
            // Redirect to careers page after 2 seconds
            setTimeout(() => {
                navigate('/careers');
            }, 2000);
        }
    }, [error, successMessage, dispatch, navigate]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type (PDF, DOC, DOCX)
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload a PDF or Word document');
            return;
        }

        // Validate file size (max 5MB)
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

        // Validation
        if (!formData.applicantName || !formData.email || !formData.resumeUrl) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Email validation
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

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (isLoading || !currentJob) {
        return (
            <>
                {!isDashboard && <Navbar />}
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-primary-600" size={48} />
                        <p className="text-secondary-500 font-medium">Loading position details...</p>
                    </div>
                </div>
                {!isDashboard && <Footer />}
            </>
        );
    }

    // Determine Job Type Color
    const getJobTypeColor = (type) => {
        const t = type.toLowerCase();
        if (t.includes('full')) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (t.includes('part')) return 'bg-amber-100 text-amber-700 border-amber-200';
        if (t.includes('contract')) return 'bg-purple-100 text-purple-700 border-purple-200';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    return (
        <>
            {!isDashboard && <Navbar />}
            <div className="min-h-screen bg-slate-50 font-sans">
                {/* Header Section */}
                <div className="bg-white border-b border-slate-200 pt-16 pb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-50 to-transparent opacity-60 pointer-events-none" />

                    <div className="container mx-auto px-4 relative z-10">
                        <button
                            onClick={() => navigate('/careers')}
                            className="flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-8 transition-colors group w-fit"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium text-sm">Back to Careers</span>
                        </button>

                        <div className="max-w-5xl mx-auto">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getJobTypeColor(currentJob.jobType)}`}>
                                            {currentJob.jobType.replace('-', ' ')}
                                        </span>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-full border border-slate-200 flex items-center gap-1.5">
                                            <Briefcase size={12} /> {currentJob.department}
                                        </span>
                                    </div>

                                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                        {currentJob.title}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-slate-500 font-medium pt-2">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={18} className="text-primary-500" />
                                            <span>{currentJob.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={18} className="text-primary-500" />
                                            <span className="text-slate-700">{formatSalary(currentJob.salaryRange)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={18} className="text-primary-500" />
                                            <span>Posted {formatDate(currentJob.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Apply Action (Mobile mainly, or emphasis) */}
                                <div className="hidden md:block">
                                    <a href="#apply-form" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary-200 hover:shadow-primary-300 transition-all active:scale-95">
                                        Apply Now <Send size={18} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12 max-w-6xl">
                    <div className="grid lg:grid-cols-12 gap-10">
                        {/* Main Content */}
                        <div className="lg:col-span-8 space-y-10">
                            {/* Description */}
                            <section className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-slate-100">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <FileText className="text-primary-600" /> Job Description
                                </h2>
                                <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
                                    <p className="whitespace-pre-line">{currentJob.description}</p>
                                </div>
                            </section>

                            {/* Requirements & Qualifications */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {currentJob.requirements?.length > 0 && (
                                    <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 h-full">
                                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <CheckCircle className="text-emerald-500" size={22} /> Requirements
                                        </h3>
                                        <ul className="space-y-4">
                                            {currentJob.requirements.map((req, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-slate-600">
                                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                    <span className="leading-relaxed">{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                {currentJob.qualifications?.length > 0 && (
                                    <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 h-full">
                                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <Briefcase className="text-blue-500" size={22} /> Qualifications
                                        </h3>
                                        <ul className="space-y-4">
                                            {currentJob.qualifications.map((qual, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-slate-600">
                                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                    <span className="leading-relaxed">{qual}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                            </div>

                            {/* Responsibilities & Benefits */}
                            <div className="space-y-6">
                                {currentJob.responsibilities?.length > 0 && (
                                    <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                                        <h3 className="text-xl font-bold text-slate-900 mb-6">Key Responsibilities</h3>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {currentJob.responsibilities.map((resp, idx) => (
                                                <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                                                    <CheckCircle className="text-slate-400 mt-0.5" size={18} />
                                                    <span className="text-slate-700 text-sm font-medium">{resp}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {currentJob.benefits?.length > 0 && (
                                    <section className="bg-primary-900 rounded-2xl p-8 md:p-10 shadow-lg text-white">
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            Perks & Benefits
                                        </h3>
                                        <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                                            {currentJob.benefits.map((benefit, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <span className="p-1 bg-white/10 rounded-full text-primary-300">
                                                        <CheckCircle size={16} />
                                                    </span>
                                                    <span className="text-slate-100 font-medium">{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Job Overview Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-4 text-lg">Position Overview</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-md text-slate-400 shadow-sm"><Building2 size={18} /></div>
                                            <div className="text-sm">
                                                <p className="text-slate-500 text-xs">Department</p>
                                                <p className="font-semibold text-slate-800">{currentJob.department}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-md text-slate-400 shadow-sm"><Clock size={18} /></div>
                                            <div className="text-sm">
                                                <p className="text-slate-500 text-xs">Job Type</p>
                                                <p className="font-semibold text-slate-800">{currentJob.jobType}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-md text-slate-400 shadow-sm"><Globe size={18} /></div>
                                            <div className="text-sm">
                                                <p className="text-slate-500 text-xs">Location</p>
                                                <p className="font-semibold text-slate-800">{currentJob.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {currentJob.applicationDeadline && (
                                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-md text-red-500 shadow-sm"><Calendar size={18} /></div>
                                                <div className="text-sm">
                                                    <p className="text-red-500 text-xs font-bold uppercase">Deadline</p>
                                                    <p className="font-bold text-red-700">{formatDeadline(currentJob.applicationDeadline)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Application Form */}
                            <div id="apply-form" className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-primary-100 lg:sticky lg:top-24">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-900">Apply for this Role</h3>
                                    <p className="text-slate-500 text-sm mt-1">Fill out the form below to submit your application.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                                        <input
                                            type="text"
                                            name="applicantName"
                                            value={formData.applicantName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium"
                                            placeholder="e.g. Sarah Smith"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium"
                                            placeholder="sarah@example.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Phones</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium"
                                            placeholder="+977 9800000000"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Resume / CV</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id="resume-upload"
                                                className="hidden"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileUpload}
                                            />
                                            <label
                                                htmlFor="resume-upload"
                                                className={`
                                                    flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all
                                                    ${formData.resumeUrl ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'}
                                                `}
                                            >
                                                {uploading ? (
                                                    <div className="flex items-center gap-2 text-primary-600 font-bold">
                                                        <Loader2 className="animate-spin" size={20} /> Uploading...
                                                    </div>
                                                ) : formData.resumeUrl ? (
                                                    <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                                        <CheckCircle size={20} /> Available
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-slate-500">
                                                        <Upload className="mx-auto mb-2 text-slate-400" size={24} />
                                                        <span className="text-sm font-medium">Click to upload Resume</span>
                                                        <p className="text-[10px] mt-1 text-slate-400">PDF, DOC (Max 5MB)</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Cover Letter</label>
                                        <textarea
                                            name="coverLetter"
                                            value={formData.coverLetter}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                            placeholder="Why should we hire you?"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">LinkedIn</label>
                                            <input
                                                type="url"
                                                name="linkedinUrl"
                                                value={formData.linkedinUrl}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                                placeholder="Profile URL"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Portfolio</label>
                                            <input
                                                type="url"
                                                name="portfolioUrl"
                                                value={formData.portfolioUrl}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                                placeholder="Website URL"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || uploading}
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary-200 hover:shadow-primary-300 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <> <Loader2 className="animate-spin" size={20} /> Submitting... </>
                                        ) : (
                                            <> <Send size={20} /> Submit Application </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                {!isDashboard && <Footer />}
            </div>
        </>
    );
};

export default CareerDetail;

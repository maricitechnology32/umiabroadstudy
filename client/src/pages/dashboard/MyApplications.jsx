import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMyApplications } from '../../features/jobApplications/jobApplicationSlice';
import { Briefcase, Calendar, MapPin, Loader2, FileText, ExternalLink } from 'lucide-react';

const MyApplications = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { applications, isLoading } = useSelector((state) => state.jobApplications);

    useEffect(() => {
        dispatch(fetchMyApplications());
    }, [dispatch]);

    const getStatusColor = (status) => {
        const colors = {
            new: 'bg-blue-100 text-blue-700 border-blue-200',
            reviewed: 'bg-purple-100 text-purple-700 border-purple-200',
            shortlisted: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
            hired: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };
        return colors[status] || 'bg-secondary-100 text-secondary-700 border-secondary-200';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
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

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-50">
                    My Applications
                </h1>
                <p className="text-secondary-600 dark:text-secondary-400 mt-2">
                    Track the status of your job applications
                </p>
            </div>

            {/* Applications */}
            {applications && applications.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800">
                    <FileText className="mx-auto mb-4 text-secondary-300 dark:text-secondary-700" size={64} />
                    <p className="text-secondary-600 dark:text-secondary-400 text-lg">
                        No applications yet
                    </p>
                    <p className="text-secondary-500 dark:text-secondary-500 text-sm mt-2 mb-6">
                        Start by browsing available job openings
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/careers')}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
                    >
                        <Briefcase size={20} />
                        Browse Jobs
                    </button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {applications.map((application) => (
                        <div
                            key={application._id}
                            className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-secondary-200 dark:border-secondary-800 hover:shadow-lg transition-all"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                {/* Left section - Job info */}
                                <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                                            <Briefcase className="text-primary-600 dark:text-primary-400" size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-50 mb-1">
                                                {application.job?.title || 'Position Unavailable'}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-600 dark:text-secondary-400 mb-3">
                                                {application.job?.department && (
                                                    <span className="font-medium text-primary-600 dark:text-primary-400">
                                                        {application.job.department}
                                                    </span>
                                                )}
                                                {application.job?.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={14} />
                                                        {application.job.location}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    Applied {formatDate(application.createdAt)}
                                                </span>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusColor(
                                                        application.status
                                                    )}`}
                                                >
                                                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                </span>
                                                {application.status === 'reviewed' && application.reviewedAt && (
                                                    <span className="text-xs text-secondary-500 dark:text-secondary-400">
                                                        Reviewed on {formatDate(application.reviewedAt)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right section - Action button */}
                                <div>
                                    {application.job && application.job.status === 'active' ? (
                                        <button
                                            onClick={() => navigate(`/dashboard/careers/${application.job.slug}`)}
                                            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                                        >
                                            View Job
                                            <ExternalLink size={16} />
                                        </button>
                                    ) : (
                                        <span className="px-5 py-2.5 bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 rounded-xl font-semibold inline-block">
                                            Job Closed
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Notes section (if admin added notes) */}
                            {application.notes && (
                                <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                                    <p className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-1">
                                        Admin Notes:
                                    </p>
                                    <p className="text-sm text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-800/50 p-3 rounded-lg">
                                        {application.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyApplications;

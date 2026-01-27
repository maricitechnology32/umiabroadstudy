import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchJobs, reset } from '../../features/jobs/jobSlice';
import { Briefcase, MapPin, DollarSign, Calendar, Search, Filter, Loader2 } from 'lucide-react';

const DashboardCareers = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { jobs, isLoading, pagination } = useSelector((state) => state.jobs);

    const [filters, setFilters] = useState({
        department: 'all',
        jobType: 'all',
        search: '',
        page: 1
    });

    const departments = ['all', 'Engineering', 'Marketing', 'Sales', 'Customer Support', 'HR', 'Operations', 'Finance', 'Design'];
    const jobTypes = ['all', 'full-time', 'part-time', 'contract', 'internship'];

    useEffect(() => {
        dispatch(fetchJobs(filters));
        return () => dispatch(reset());
    }, [dispatch, filters]);

    const formatSalary = (salaryRange) => {
        if (!salaryRange || !salaryRange.min) return 'Competitive';
        const formatter = new Intl.NumberFormat('ja-JP');
        return `Rs${formatter.format(salaryRange.min)} - Rs${formatter.format(salaryRange.max)}`;
    };

    const formatDeadline = (deadline) => {
        if (!deadline) return 'No deadline';
        const date = new Date(deadline);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (isLoading && jobs.length === 0) {
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
                <h1 className="text-3xl font-bold text-slate-900">Careers</h1>
                <p className="text-slate-600 mt-2">Join our team and help students achieve their dreams of studying in Japan</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className="grid md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="md:col-span-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>

                    {/* Department Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                        <select
                            value={filters.department}
                            onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept.charAt(0).toUpperCase() + dept.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Job Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Job Type</label>
                        <select
                            value={filters.jobType}
                            onChange={(e) => setFilters({ ...filters, jobType: e.target.value, page: 1 })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            {jobTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type === 'all' ? 'All Types' : type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ department: 'all', jobType: 'all', search: '', page: 1 })}
                            className="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Jobs Grid */}
            {jobs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                    <Briefcase className="mx-auto mb-4 text-slate-300" size={64} />
                    <p className="text-slate-600 text-lg">No jobs found</p>
                    <p className="text-slate-500 text-sm mt-2">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <div
                            key={job._id}
                            onClick={() => navigate(`/dashboard/careers/${job.slug}`)}
                            className="group bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl hover:border-primary-500 transition-all duration-300 cursor-pointer"
                        >
                            {/* Job Type Badge */}
                            <div className="flex items-start justify-between mb-4">
                                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                                    {job.jobType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </span>
                                {job.applicationDeadline && (
                                    <span className="text-xs text-slate-500">
                                        {formatDeadline(job.applicationDeadline)}
                                    </span>
                                )}
                            </div>

                            {/* Job Title */}
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-2">
                                {job.title}
                            </h3>

                            {/* Department */}
                            <p className="text-sm font-medium text-primary-600 mb-4">{job.department}</p>

                            {/* Details */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPin size={16} className="flex-shrink-0" />
                                    <span>{job.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <DollarSign size={16} className="flex-shrink-0" />
                                    <span>{formatSalary(job.salaryRange)}</span>
                                </div>
                            </div>

                            {/* Requirements Preview */}
                            {job.requirements && job.requirements.length > 0 && (
                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-xs font-semibold text-slate-700 mb-2">Key Requirements:</p>
                                    <ul className="space-y-1">
                                        {job.requirements.slice(0, 2).map((req, idx) => (
                                            <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                                <span className="text-primary-600 mt-0.5">•</span>
                                                <span className="line-clamp-1">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {job.requirements.length > 2 && (
                                        <p className="text-xs text-primary-600 mt-2">+{job.requirements.length - 2} more</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
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
                                    ? 'bg-primary-600 text-white'
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

export default DashboardCareers;

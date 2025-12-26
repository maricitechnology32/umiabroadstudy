import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchJobs, reset } from '../../features/jobs/jobSlice';
import { Briefcase, MapPin, DollarSign, Calendar, Search, Filter, Loader2, ArrowRight, TrendingUp } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import AdBanner from '../../components/ads/AdBanner';

const Careers = ({ isDashboard }) => {
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
            <>
                {!isDashboard && <Navbar />}
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary-600" size={48} />
                </div>
                {!isDashboard && <Footer />}
            </>
        );
    }

    return (
        <>
            {!isDashboard && <Navbar />}
            <div className="min-h-screen bg-slate-50">
                {/* Hero Section */}
                <div className="bg-primary-600 text-white py-12 mt-14">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full mb-4">
                                <TrendingUp size={16} />
                                <span className="text-sm font-medium">Join Our Growing Team</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-4">
                                Build Your Career With Us
                            </h1>
                            <p className="text-primary-100 mb-6">
                                Join our mission to help students achieve their dreams of studying in Japan.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <div className="bg-white/10 px-4 py-2 rounded-lg">
                                    <p className="text-xl font-bold">{pagination.total}+</p>
                                    <p className="text-xs text-primary-100">Positions</p>
                                </div>
                                <div className="bg-white/10 px-4 py-2 rounded-lg">
                                    <p className="text-xl font-bold">5+</p>
                                    <p className="text-xs text-primary-100">Departments</p>
                                </div>
                                <div className="bg-white/10 px-4 py-2 rounded-lg">
                                    <p className="text-xl font-bold">Global</p>
                                    <p className="text-xs text-primary-100">Opportunities</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ad Banner - Top */}
                {!isDashboard && (
                    <div className="bg-slate-100 py-4">
                        <div className="container mx-auto px-4 flex justify-center">
                            <AdBanner adKey="56e9dabb44efce88731345b0c91490dd" width={728} height={90} />
                        </div>
                    </div>
                )}

                {/* Main Content with Sidebar */}
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Filters */}
                            <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-100 mb-6">
                                <div className="grid md:grid-cols-3 gap-4">
                                    {/* Search */}
                                    <div className="md:col-span-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Search job titles, keywords..."
                                                value={filters.search}
                                                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Department Filter */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Department</label>
                                        <select
                                            value={filters.department}
                                            onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
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
                                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Job Type</label>
                                        <select
                                            value={filters.jobType}
                                            onChange={(e) => setFilters({ ...filters, jobType: e.target.value, page: 1 })}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
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
                                            className="w-full px-3 py-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Jobs Grid */}
                            {jobs.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-slate-200">
                                    <Briefcase className="mx-auto mb-4 text-slate-300" size={64} />
                                    <p className="text-slate-600 text-xl font-semibold mb-2">No jobs found</p>
                                    <p className="text-slate-500 text-sm">Try adjusting your filters or check back later for new opportunities</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                                        {jobs.map((job) => (
                                            <div
                                                key={job._id}
                                                onClick={() => navigate(`/careers/${job.slug}`)}
                                                className="group bg-white rounded-lg p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer"
                                            >
                                                {/* Job Type Badge & Deadline */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <span className="px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded">
                                                        {job.jobType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                    </span>
                                                    {job.applicationDeadline && (
                                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                                            <Calendar size={12} />
                                                            <span>{formatDeadline(job.applicationDeadline)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Job Title */}
                                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-2 line-clamp-2">
                                                    {job.title}
                                                </h3>

                                                {/* Department */}
                                                <p className="text-sm font-semibold text-primary-600 mb-4">{job.department}</p>

                                                {/* Details */}
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <MapPin size={16} className="flex-shrink-0 text-primary-600" />
                                                        <span>{job.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <DollarSign size={16} className="flex-shrink-0 text-primary-600" />
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
                                                            <p className="text-xs text-primary-600 mt-2 font-medium">+{job.requirements.length - 2} more</p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* View Details Link */}
                                                <div className="mt-4 pt-4 border-t border-slate-100">
                                                    <div className="flex items-center justify-between text-primary-600 font-semibold text-sm group-hover:gap-2 transition-all">
                                                        <span>View Details</span>
                                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {pagination.pages > 1 && (
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                                disabled={filters.page === 1}
                                                className="px-6 py-3 rounded-xl border border-slate-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 font-medium transition-all"
                                            >
                                                Previous
                                            </button>
                                            <div className="flex gap-2">
                                                {[...Array(pagination.pages)].map((_, index) => (
                                                    <button
                                                        key={index + 1}
                                                        onClick={() => setFilters({ ...filters, page: index + 1 })}
                                                        className={`w-12 h-12 rounded-xl font-medium transition-all ${filters.page === index + 1
                                                            ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
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
                                                className="px-6 py-3 rounded-xl border border-slate-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 font-medium transition-all"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Sidebar with Ads - Desktop Only */}
                        {!isDashboard && (
                            <div className="hidden lg:block w-[300px] shrink-0">
                                <div className="sticky top-24 space-y-6">
                                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                                        <p className="text-xs text-slate-400 mb-2 text-center">Advertisement</p>
                                        <AdBanner adKey="012f82fd8efee1c8aa29d03593d4de8c" width={300} height={250} />
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                                        <p className="text-xs text-slate-400 mb-2 text-center">Advertisement</p>
                                        <AdBanner adKey="012f82fd8efee1c8aa29d03593d4de8c" width={300} height={250} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Ad - Below Content */}
                    {!isDashboard && (
                        <div className="lg:hidden flex justify-center py-6">
                            <AdBanner adKey="012f82fd8efee1c8aa29d03593d4de8c" width={300} height={250} />
                        </div>
                    )}
                </div>

                {/* Ad Banner - Bottom */}
                {!isDashboard && (
                    <div className="bg-slate-100 py-6 border-t border-slate-200">
                        <div className="container mx-auto px-4 flex justify-center">
                            <AdBanner adKey="56e9dabb44efce88731345b0c91490dd" width={728} height={90} />
                        </div>
                    </div>
                )}
            </div>
            {!isDashboard && <Footer />}
        </>
    );
};

export default Careers;

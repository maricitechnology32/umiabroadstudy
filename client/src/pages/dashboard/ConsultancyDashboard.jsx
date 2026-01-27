import { Building2, CalendarDays, Eye, Filter, GraduationCap, Loader2, Mail, Search, Settings, Shield, UserPlus, TrendingUp, Users, CheckCircle, Clock, Smartphone, MoreHorizontal, LayoutGrid, List, Plane, FileText, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getStudents, inviteStudent, updateStudentStatus, updateStudentProcessing, reset } from '../../features/students/studentSlice';
import { fetchDashboardStats } from '../../features/dashboard/dashboardSlice';
import Input from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { TableSkeleton, CardSkeleton } from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import StudentKanban from '../../components/dashboard/StudentKanban';
import Select from '../../components/ui/Select'; // Assuming Select component exists or using native select

// Import Sub-Components
import ConsultancySettings from './ConsultancySettings';
import StaffManagement from './StaffManagement';
import UniversityManager from './UniversityManager';
import EventManager from './EventManager';
import ResourceManager from '../../components/dashboard/ResourceManager';
import DocumentVerificationManager from '../../components/dashboard/DocumentVerificationManager';
import SEO from '../../components/common/SEO';

export default function ConsultancyDashboard() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { students, isLoading: studentsLoading } = useSelector((state) => state.students);
    const { user } = useSelector((state) => state.auth);
    const { stats, isLoading: statsLoading } = useSelector((state) => state.dashboard);

    // UI State
    const [activeTab, setActiveTab] = useState('overview'); // Changed default to 'overview'
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [showVisaModal, setShowVisaModal] = useState(false);
    const [selectedStudentForVisa, setSelectedStudentForVisa] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
    const [updatingStudentId, setUpdatingStudentId] = useState(null); // For optimistic UI
    const [formData, setFormData] = useState({ name: '', email: '' });

    // Visa Status Form Data
    const [visaFormData, setVisaFormData] = useState({
        visaStatus: 'None',
        coeDate: '',
        visaDate: '',
        flightDate: ''
    });

    // --- PERMISSIONS ---
    const canManageStaff = user?.role === 'consultancy_admin' || user?.subRole === 'manager';
    const canManageUniversities = canManageStaff || user?.subRole === 'counselor';
    const canVerifyDocuments = canManageStaff || user?.subRole === 'receptionist' || user?.subRole === 'document_officer';

    // --- EFFECTS ---
    useEffect(() => {
        if (activeTab === 'overview') {
            dispatch(fetchDashboardStats());
        } else if (activeTab === 'students') {
            dispatch(getStudents());
        }
    }, [dispatch, activeTab]);

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) return toast.error("Name and Email required");
        try {
            await dispatch(inviteStudent(formData)).unwrap();
            setShowInviteForm(false);
            setFormData({ name: '', email: '' });
            toast.success("Invitation Sent!");
        } catch (error) {
            toast.error(error || "Failed to send invitation");
        }
    };

    // Handle Kanban drag-and-drop status change
    const handleStatusChange = async (studentId, newStatus) => {
        setUpdatingStudentId(studentId);
        try {
            await dispatch(updateStudentStatus({ id: studentId, status: newStatus })).unwrap();
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            toast.error(error || 'Failed to update status');
        } finally {
            setUpdatingStudentId(null);
        }
    };

    const openVisaModal = (student) => {
        setSelectedStudentForVisa(student);
        setVisaFormData({
            visaStatus: student.processingInfo?.visaStatus || 'None',
            coeDate: student.processingInfo?.coeDate ? student.processingInfo.coeDate.split('T')[0] : '',
            visaDate: student.processingInfo?.visaDate ? student.processingInfo.visaDate.split('T')[0] : '',
            flightDate: student.processingInfo?.flightDate ? student.processingInfo.flightDate.split('T')[0] : ''
        });
        setShowVisaModal(true);
    };

    const handleVisaUpdate = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updateStudentProcessing({
                id: selectedStudentForVisa._id,
                processingInfo: visaFormData
            })).unwrap();
            toast.success("Visa details updated successfully");
            setShowVisaModal(false);
        } catch (error) {
            toast.error(error || "Failed to update details");
        }
    };

    // Filtering Logic (for Students Tab)
    const filteredStudents = students?.filter(student => {
        const fullName = (student.personalInfo?.firstName + ' ' + student.personalInfo?.lastName).toLowerCase();
        const email = student.personalInfo?.email?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        const matchesSearch = fullName.includes(search) || email.includes(search);
        const matchesStatus = statusFilter === 'all' || student.profileStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Helper for Status Badge
    const getStatusColor = (status) => {
        switch (status) {
            case 'Visa Granted': return 'bg-emerald-100 text-emerald-700';
            case 'COE Received': return 'bg-blue-100 text-blue-700';
            case 'Applied': return 'bg-indigo-100 text-indigo-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <SEO
                title={`Dashboard | ${user?.name || 'Consultancy'} - Japan Visa SaaS`}
                description="Manage your consultancy, students, and applications."
                noIndex={true}
            />

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                        <CalendarDays size={14} />
                        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
                    <p className="text-slate-500 mt-1">Welcome back, {user?.name}. Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setShowInviteForm(true)} className="flex items-center gap-2 bg-primary-600 text-white hover:bg-primary-700 shadow-none">
                        <UserPlus size={18} /> Invite Student
                    </Button>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-8 overflow-x-auto hide-scrollbar">
                    {['overview', 'students', 'verification', 'universities', 'staff', 'events', 'resources', 'settings'].map((tab) => {
                        if (tab === 'universities' && !canManageUniversities) return null;
                        if ((tab === 'staff' || tab === 'events' || tab === 'settings') && !canManageStaff) return null;
                        if (tab === 'verification' && !canVerifyDocuments) return null;

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-medium capitalize border-b-2 transition-all whitespace-nowrap px-1 ${activeTab === tab
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* --- OVERVIEW TAB (Dashboard Stats) --- */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Stats Grid - Premium Design */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Students"
                            value={stats?.overview?.totalStudents || 0}
                            icon={Users}
                            gradient="from-primary-500" // Used for color extraction
                            iconBg="bg-primary-500"
                            loading={statsLoading}
                        />
                        <StatCard
                            title="Active Applications"
                            value={stats?.overview?.activeApplications || 0}
                            icon={Clock}
                            gradient="from-blue-500"
                            iconBg="bg-blue-500"
                            loading={statsLoading}
                        />
                        <StatCard
                            title="Visa Granted"
                            value={stats?.overview?.visaGranted || 0}
                            icon={CheckCircle}
                            gradient="from-emerald-500"
                            iconBg="bg-emerald-500"
                            loading={statsLoading}
                        />
                        <StatCard
                            title="Success Rate"
                            value={`${stats?.overview?.successRate || 0}%`}
                            icon={TrendingUp}
                            gradient="from-violet-500"
                            iconBg="bg-violet-500"
                            loading={statsLoading}
                        />
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Recent Activity - Enhanced Card List */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Recent Activity</h3>
                                    <p className="text-slate-500 text-sm">Latest student updates</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab('students')}
                                    className="text-sm text-primary-600 font-semibold hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors"
                                >
                                    View All →
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {stats?.recentActivity?.map((student, index) => (
                                    <div
                                        key={student._id}
                                        className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary-500/20">
                                                {student.personalInfo?.firstName?.[0] || '?'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">
                                                    {student.personalInfo?.firstName} {student.personalInfo?.lastName}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {(student.updatedAt || student.createdAt)
                                                        ? `Updated ${new Date(student.updatedAt || student.createdAt).toLocaleDateString()}`
                                                        : 'Recently added'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${student.profileStatus === 'verified' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' :
                                                student.profileStatus === 'submitted' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' :
                                                    student.profileStatus === 'rejected' ? 'bg-red-100 text-red-700 ring-1 ring-red-200' :
                                                        student.profileStatus === 'lead' ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200' :
                                                            'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                                                }`}>
                                                {student.profileStatus}
                                            </span>
                                            <button
                                                onClick={() => navigate(`/dashboard/student/${student._id}`)}
                                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary-600 p-2 rounded-lg hover:bg-primary-50 transition-all"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {!stats?.recentActivity?.length && (
                                    <div className="text-center py-12 text-slate-400">
                                        <Users size={40} className="mx-auto mb-3 opacity-30" />
                                        <p>No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Pipeline - Enhanced */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                            <h3 className="font-bold text-slate-800 text-lg mb-1">Visa Pipeline</h3>
                            <p className="text-slate-500 text-sm mb-6">Application tracking (Live)</p>

                            <div className="space-y-5">
                                <PipelineItem
                                    label="Documentation Phase"
                                    count={stats?.visaStatusCounts?.['Documentation'] || 0}
                                    total={stats?.overview?.totalStudents || 1}
                                    color="bg-slate-500"
                                    lightColor="bg-slate-200"
                                />
                                <PipelineItem
                                    label="Applied for COE"
                                    count={stats?.visaStatusCounts?.['Applied for COE'] || 0}
                                    total={stats?.overview?.totalStudents || 1}
                                    color="bg-blue-500"
                                    lightColor="bg-blue-100"
                                />
                                <PipelineItem
                                    label="COE Received"
                                    count={stats?.visaStatusCounts?.['COE Received'] || 0}
                                    total={stats?.overview?.totalStudents || 1}
                                    color="bg-indigo-500"
                                    lightColor="bg-indigo-100"
                                />
                                <PipelineItem
                                    label="Visa Granted"
                                    count={stats?.visaStatusCounts?.['Visa Granted'] || 0}
                                    total={stats?.overview?.totalStudents || 1}
                                    color="bg-emerald-500"
                                    lightColor="bg-emerald-100"
                                />
                                <PipelineItem
                                    label="Visa Rejected"
                                    count={stats?.visaStatusCounts?.['Visa Rejected'] || 0}
                                    total={stats?.overview?.totalStudents || 1}
                                    color="bg-red-500"
                                    lightColor="bg-red-100"
                                />
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Quick Actions</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setShowInviteForm(true)}
                                        className="group p-4 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-primary-50 hover:to-primary-100 rounded-xl text-sm font-semibold text-slate-600 hover:text-primary-700 transition-all flex flex-col items-center gap-2 border border-slate-200 hover:border-primary-200 hover:shadow-md hover:shadow-primary-500/10"
                                    >
                                        <div className="p-2.5 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                            <UserPlus size={20} className="text-slate-500 group-hover:text-primary-600" />
                                        </div>
                                        Add Student
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('events')}
                                        className="group p-4 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-primary-50 hover:to-primary-100 rounded-xl text-sm font-semibold text-slate-600 hover:text-primary-700 transition-all flex flex-col items-center gap-2 border border-slate-200 hover:border-primary-200 hover:shadow-md hover:shadow-primary-500/10"
                                    >
                                        <div className="p-2.5 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                            <CalendarDays size={20} className="text-slate-500 group-hover:text-primary-600" />
                                        </div>
                                        Add Event
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- STUDENTS TAB --- */}
            {activeTab === 'students' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    {/* View Toggle & Filters */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-500">View:</span>
                            <div className="flex bg-slate-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'table'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <List size={16} /> Table
                                </button>
                                <button
                                    onClick={() => setViewMode('kanban')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'kanban'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <LayoutGrid size={16} /> Kanban
                                </button>
                            </div>
                        </div>

                        {viewMode === 'table' && (
                            <div className="flex gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-sm"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                >
                                    <option value="all">All Status</option>
                                    <option value="lead">Lead</option>
                                    <option value="draft">Draft</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="verified">Verified</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Kanban View */}
                    {viewMode === 'kanban' && (
                        <StudentKanban
                            students={students}
                            onStatusChange={handleStatusChange}
                            isUpdating={updatingStudentId}
                        />
                    )}

                    {/* Table View */}
                    {viewMode === 'table' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

                            {/* Table */}
                            <div className="overflow-x-auto">
                                {studentsLoading ? (
                                    <div className="p-4">
                                        <TableSkeleton rows={5} cols={4} />
                                    </div>
                                ) : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Name</th>
                                                <th className="px-6 py-4">Current Stage</th>
                                                <th className="px-6 py-4">Visa Status</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredStudents?.map((student) => (
                                                <tr key={student._id} className="hover:bg-slate-50 transition-colors group animate-fade-in">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
                                                                {student.personalInfo?.firstName?.[0]}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-slate-900">{student.personalInfo?.firstName} {student.personalInfo?.lastName}</div>
                                                                <div className="text-xs text-slate-400">{student.personalInfo?.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${student.profileStatus === 'submitted' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                            student.profileStatus === 'verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                                student.profileStatus === 'lead' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                                                    'bg-slate-100 text-slate-600 border border-slate-200'
                                                            }`}>
                                                            {student.profileStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {student.processingInfo?.visaStatus !== 'None' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                                <Plane size={12} /> {student.processingInfo?.visaStatus}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs italic">Not Started</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                        <Button size="sm" variant="ghost" className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={() => openVisaModal(student)}>
                                                            <Settings size={14} className="mr-1" /> Status
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="h-8" onClick={() => navigate(`/dashboard/student/${student._id}`)}>View</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!filteredStudents?.length && (
                                                <tr><td colSpan="4" className="text-center py-12 text-slate-500">No students found matching your search.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Other Tabs */}
            {activeTab === 'universities' && canManageUniversities && <UniversityManager />}
            {activeTab === 'staff' && canManageStaff && <StaffManagement />}
            {activeTab === 'settings' && canManageStaff && <ConsultancySettings />}
            {activeTab === 'events' && canManageStaff && <EventManager />}
            {activeTab === 'resources' && <ResourceManager />}
            {activeTab === 'verification' && canVerifyDocuments && <DocumentVerificationManager />}

            {/* Invite Modal (Reused) */}
            <Modal
                isOpen={showInviteForm}
                onClose={() => setShowInviteForm(false)}
                title={
                    <div className="flex items-center gap-2">
                        <Mail className="text-primary-600" size={20} />
                        <span>Invite Student</span>
                    </div>
                }
                size="md"
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800 text-sm">
                        <div className="bg-blue-100 p-2 rounded-full shrink-0 h-fit">
                            <UserPlus size={16} />
                        </div>
                        <div>
                            <p className="font-bold mb-1">Send an invitation</p>
                            <p className="opacity-90 leading-relaxed">The student will receive an email with login credentials. They can then complete their profile.</p>
                        </div>
                    </div>

                    <form onSubmit={handleInvite} className="space-y-5">
                        <Input
                            label="Full Name"
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="e.g. student@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <div className="pt-2">
                            <Button type="submit" className="w-full h-11 shadow-lg shadow-primary-500/20">Send Invitation</Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Visa Status Update Modal */}
            <Modal
                isOpen={showVisaModal}
                onClose={() => setShowVisaModal(false)}
                title={
                    <div className="flex items-center gap-2">
                        <Plane className="text-primary-600" size={20} />
                        <span>Update Visa Status</span>
                    </div>
                }
                size="md"
            >
                <div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5 flex gap-3 text-slate-600 text-sm">
                        <div className="bg-white p-2 rounded-full shrink-0 shadow-sm">
                            <FileText size={16} className="text-slate-500" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 mb-1">Processing for: {selectedStudentForVisa?.personalInfo?.firstName} {selectedStudentForVisa?.personalInfo?.lastName}</p>
                            <p className="opacity-90">Update key milestones for this student's visa application journey.</p>
                        </div>
                    </div>

                    <form onSubmit={handleVisaUpdate} className="space-y-5">
                        <Select
                            label="Current Status"
                            value={visaFormData.visaStatus}
                            onChange={(e) => setVisaFormData({ ...visaFormData, visaStatus: e.target.value })}
                        >
                            <option value="None">Not Started (None)</option>
                            <option value="Documentation">Documentation Phase</option>
                            <option value="Applied for COE">Applied for COE</option>
                            <option value="COE Received">COE Received</option>
                            <option value="Visa Applied">Visa Applied</option>
                            <option value="Visa Granted">Visa Granted</option>
                            <option value="Visa Rejected">Visa Rejected</option>
                        </Select>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="COE Received Date"
                                type="date"
                                value={visaFormData.coeDate}
                                onChange={(e) => setVisaFormData({ ...visaFormData, coeDate: e.target.value })}
                            />
                            <Input
                                label="Visa Decision Date"
                                type="date"
                                value={visaFormData.visaDate}
                                onChange={(e) => setVisaFormData({ ...visaFormData, visaDate: e.target.value })}
                            />
                        </div>

                        <Input
                            label="Flight Date (Expected/Booked)"
                            type="date"
                            value={visaFormData.flightDate}
                            onChange={(e) => setVisaFormData({ ...visaFormData, flightDate: e.target.value })}
                        />

                        <div className="pt-4 flex gap-3">
                            <Button type="button" variant="outline" className="w-full" onClick={() => setShowVisaModal(false)}>Cancel</Button>
                            <Button type="submit" className="w-full shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white">Update Status</Button>
                        </div>
                    </form>
                </div>
            </Modal>

        </div>
    );
}

// Sub-components for Cleaner Code
const StatCard = ({ title, value, icon: Icon, gradient, iconBg, loading }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-2">{title}</p>
                {loading ? (
                    <div className="h-9 w-24 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                    <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
                )}
            </div>
            <div className={`p-3 rounded-xl ${iconBg} bg-opacity-20 transition-transform group-hover:scale-110`}>
                <Icon size={24} className={`text-${gradient.split('-')[1]}-600`} />
            </div>
        </div>
        {/* Subtle decorative circle */}
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 ${iconBg}`} />
    </div>
);

const PipelineItem = ({ label, count, total, color, lightColor }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
        <div className="group">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">{label}</span>
                <span className="text-sm font-bold text-slate-800">{count}</span>
            </div>
            <div className={`h-2 ${lightColor} rounded-full overflow-hidden`}>
                <div
                    className={`h-full ${color} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${Math.max(percentage, count > 0 ? 8 : 0)}%` }}
                />
            </div>
        </div>
    );
};
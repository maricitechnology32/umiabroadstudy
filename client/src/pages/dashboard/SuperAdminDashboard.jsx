


import { Building2, Calendar, Loader2, Mail, Phone, Plus, FileText, PenTool } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createConsultancy, getConsultancies } from '../../features/consultancies/consultancySlice';

// Import Holiday Manager
import HolidayManager from './HolidayManager';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

export default function SuperAdminDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { consultancies, isLoading, isError, message } = useSelector((state) => state.consultancies);

    // UI State
    const [activeTab, setActiveTab] = useState('consultancies'); // 'consultancies', 'holidays'
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        website: ''
    });

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        // Only fetch if on consultancies tab
        if (activeTab === 'consultancies') {
            dispatch(getConsultancies());
        }
    }, [dispatch, isError, message, activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) return toast.error("Name and Email are required");

        await dispatch(createConsultancy(formData));
        toast.success("Consultancy added & Invite sent!");
        setShowForm(false);
        setFormData({ name: '', email: '', phone: '', address: '', website: '' });
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Super Admin Dashboard</h2>
                    <p className="text-secondary-500">Manage consultancies and global settings.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-secondary-200 pb-1 gap-4">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('consultancies')}
                        className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'consultancies' ? 'border-primary-600 text-primary-600' : 'border-transparent text-secondary-500 hover:text-secondary-700'}`}
                    >
                        <Building2 size={18} /> Consultancies
                    </button>
                    <button
                        onClick={() => setActiveTab('holidays')}
                        className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'holidays' ? 'border-primary-600 text-primary-600' : 'border-transparent text-secondary-500 hover:text-secondary-700'}`}
                    >
                        <Calendar size={18} /> Global Holidays
                    </button>
                    <button
                        onClick={() => navigate('/admin/about-us')}
                        className="pb-3 text-sm font-medium flex items-center gap-2 border-b-2 border-transparent text-secondary-500 hover:text-secondary-700 transition-colors"
                    >
                        <FileText size={18} /> About Us
                    </button>
                    <button
                        onClick={() => navigate('/admin/blog')}
                        className="pb-3 text-sm font-medium flex items-center gap-2 border-b-2 border-transparent text-secondary-500 hover:text-secondary-700 transition-colors"
                    >
                        <PenTool size={18} /> Blog
                    </button>
                </div>

                {/* Add Button (Only for Consultancies Tab) */}
                {activeTab === 'consultancies' && (
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 mb-2"
                    >
                        <Plus size={20} /> Add Consultancy
                    </Button>
                )}
            </div>

            {/* --- TAB 1: CONSULTANCIES --- */}
            {activeTab === 'consultancies' && (
                <div className="animate-in fade-in">
                    {/* Add Form */}
                    {showForm && (
                        <Card className="border-secondary-200 mb-6">
                            <h3 className="text-lg font-semibold mb-4 text-secondary-900">Register New Consultancy</h3>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input placeholder="Consultancy Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                <Input placeholder="Email Address (Admin Login)" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                <Input placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                <Input placeholder="Website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                                    <Button variant="ghost" type="button" onClick={() => setShowForm(false)} className="text-secondary-600">Cancel</Button>
                                    <Button type="submit">Register & Send Invite</Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {/* List */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {isLoading && <div className="col-span-3 flex justify-center py-10"><Loader2 className="animate-spin text-primary-600" size={32} /></div>}

                        {!isLoading && consultancies.map((consultancy) => (
                            <Card key={consultancy._id} className="border-secondary-200 hover:shadow-md transition-shadow p-4">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-primary-50 rounded-lg"><Building2 className="text-primary-600" size={24} /></div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${consultancy.isActive ? 'bg-primary-100 text-primary-800' : 'bg-red-100 text-red-800'}`}>
                                        {consultancy.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-secondary-900">{consultancy.name}</h3>
                                <div className="space-y-2 text-sm text-secondary-600">
                                    <div className="flex items-center gap-2"><Mail size={16} /> {consultancy.email}</div>
                                    <div className="flex items-center gap-2"><Phone size={16} /> {consultancy.phone || 'N/A'}</div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-secondary-100 text-xs text-secondary-400">
                                    Joined: {new Date(consultancy.createdAt).toLocaleDateString()}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* --- TAB 2: HOLIDAYS --- */}
            {activeTab === 'holidays' && (
                <HolidayManager />
            )}

        </div>
    );
}
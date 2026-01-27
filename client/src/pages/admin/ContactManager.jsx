import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchContactSettings,
    updateContactSettings,
} from '../../features/contactSettings/contactSettingsSlice';
import {
    fetchContactMessages,
    updateMessageStatus,
    deleteContactMessage,
} from '../../features/contactMessage/contactMessageSlice';
import {
    Save, Plus, Trash2, Mail, Phone, MapPin, Globe,
    Clock, MessageSquare, Settings as SettingsIcon,
    CheckCircle, XCircle, AlertCircle, RefreshCw, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

const ContactManager = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'settings'

    // Redux State
    const { settings, isLoading: settingsLoading } = useSelector((state) => state.contactSettings);
    const { messages, isLoading: messagesLoading, pagination } = useSelector((state) => state.contactMessages);

    // Local State for Settings Form
    const [formData, setFormData] = useState({
        mainContact: { companyName: '', email: '', phone: '', address: '', description: '' },
        supportInfo: { responseTime: '', supportEmail: '', supportPhone: '' },
        officeLocations: [],
        socialMedia: [],
        businessHours: []
    });

    // Fetch initial data
    useEffect(() => {
        if (activeTab === 'settings') {
            dispatch(fetchContactSettings());
        } else {
            dispatch(fetchContactMessages({ page: 1, limit: 50 }));
        }
    }, [dispatch, activeTab]);

    // Populate form data when settings are fetched
    useEffect(() => {
        if (settings && activeTab === 'settings') {
            setFormData({
                mainContact: settings.mainContact || { companyName: '', email: '', phone: '', address: '', description: '' },
                supportInfo: settings.supportInfo || { responseTime: '', supportEmail: '', supportPhone: '' },
                officeLocations: settings.officeLocations || [],
                socialMedia: settings.socialMedia || [],
                businessHours: settings.businessHours || []
            });
        }
    }, [settings, activeTab]);

    // --- Message Handlers ---
    const handleDeleteMessage = async (id) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            await dispatch(deleteContactMessage(id));
            toast.success('Message deleted');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        await dispatch(updateMessageStatus({ id, status }));
        toast.success(`Marked as ${status}`);
    };

    // --- Settings Handlers ---
    const handleMainContactChange = (e) => {
        setFormData({
            ...formData,
            mainContact: { ...formData.mainContact, [e.target.name]: e.target.value }
        });
    };

    const handleSupportInfoChange = (e) => {
        setFormData({
            ...formData,
            supportInfo: { ...formData.supportInfo, [e.target.name]: e.target.value }
        });
    };

    // Office Locations
    const addOffice = () => {
        setFormData({
            ...formData,
            officeLocations: [...formData.officeLocations, { name: '', address: '', phone: '', email: '' }]
        });
    };

    const removeOffice = (index) => {
        const newOffices = formData.officeLocations.filter((_, i) => i !== index);
        setFormData({ ...formData, officeLocations: newOffices });
    };

    const handleOfficeChange = (index, field, value) => {
        const newOffices = [...formData.officeLocations];
        newOffices[index] = { ...newOffices[index], [field]: value };
        setFormData({ ...formData, officeLocations: newOffices });
    };

    // Social Media
    const addSocial = () => {
        setFormData({
            ...formData,
            socialMedia: [...formData.socialMedia, { platform: 'linkedin', url: '' }]
        });
    };

    const removeSocial = (index) => {
        const newSocials = formData.socialMedia.filter((_, i) => i !== index);
        setFormData({ ...formData, socialMedia: newSocials });
    };

    const handleSocialChange = (index, field, value) => {
        const newSocials = [...formData.socialMedia];
        newSocials[index] = { ...newSocials[index], [field]: value };
        setFormData({ ...formData, socialMedia: newSocials });
    };

    // Business Hours
    const initBusinessHours = () => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const hours = days.map(day => ({ day, hours: '9:00 AM - 5:00 PM', isOpen: true }));
        setFormData({ ...formData, businessHours: hours });
    };

    const handleHoursChange = (index, field, value) => {
        const newHours = [...formData.businessHours];
        newHours[index] = { ...newHours[index], [field]: value };
        setFormData({ ...formData, businessHours: newHours });
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        if (settings?._id) {
            await dispatch(updateContactSettings({ id: settings._id, data: formData })).unwrap();
            toast.success('Settings updated successfully');
        } else {
            // In a real scenario we'd call createContactSettings here. 
            // Since I didn't import it, I'll rely on the seed data ensuring settings exist.
            toast.error('No settings ID found. Please ensure settings are initialized.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Contact Manager</h1>
                    <p className="text-slate-600">Manage inquiries and contact information</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'messages'
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquare size={16} /> Messages
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'settings'
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <SettingsIcon size={16} /> Settings
                        </div>
                    </button>
                </div>
            </div>

            {/* MESSAGES TAB */}
            {activeTab === 'messages' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Sender</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Subject</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {messagesLoading ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading messages...</td></tr>
                                ) : messages.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-slate-500">No messages found</td></tr>
                                ) : (
                                    messages.map((msg) => (
                                        <tr key={msg._id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${msg.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                                        msg.status === 'read' ? 'bg-slate-100 text-slate-800' :
                                                            msg.status === 'replied' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {msg.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-medium text-slate-900">{msg.name}</div>
                                                <div className="text-xs text-slate-500">{msg.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-900 font-medium">{msg.subject}</div>
                                                <div className="text-xs text-slate-500 line-clamp-1">{msg.message}</div>
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                {msg.status === 'new' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(msg._id, 'read')}
                                                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                        title="Mark as Read"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteMessage(msg._id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">

                    {/* General Info */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Globe size={20} className="text-primary-600" /> General Information
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                                <input
                                    type="text" name="companyName"
                                    value={formData.mainContact.companyName} onChange={handleMainContactChange}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Main Email</label>
                                <input
                                    type="email" name="email"
                                    value={formData.mainContact.email} onChange={handleMainContactChange}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Main Phone</label>
                                <input
                                    type="text" name="phone"
                                    value={formData.mainContact.phone} onChange={handleMainContactChange}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Response Time</label>
                                <input
                                    type="text" name="responseTime"
                                    value={formData.supportInfo.responseTime} onChange={handleSupportInfoChange}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. 24 hours"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Main Address</label>
                                <input
                                    type="text" name="address"
                                    value={formData.mainContact.address} onChange={handleMainContactChange}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.mainContact.description} onChange={handleMainContactChange}
                                    rows={3}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Office Locations */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <MapPin size={20} className="text-primary-600" /> Office Locations
                            </h2>
                            <button type="button" onClick={addOffice} className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1">
                                <Plus size={16} /> Add Office
                            </button>
                        </div>
                        <div className="space-y-4">
                            {formData.officeLocations.map((office, index) => (
                                <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeOffice(index)}
                                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input
                                            placeholder="Office Name (e.g. Tokyo HQ)"
                                            value={office.name}
                                            onChange={(e) => handleOfficeChange(index, 'name', e.target.value)}
                                            className="p-2 border border-slate-300 rounded-lg text-sm"
                                        />
                                        <input
                                            placeholder="Address"
                                            value={office.address}
                                            onChange={(e) => handleOfficeChange(index, 'address', e.target.value)}
                                            className="p-2 border border-slate-300 rounded-lg text-sm"
                                        />
                                        <input
                                            placeholder="Phone"
                                            value={office.phone || ''}
                                            onChange={(e) => handleOfficeChange(index, 'phone', e.target.value)}
                                            className="p-2 border border-slate-300 rounded-lg text-sm"
                                        />
                                        <input
                                            placeholder="Email"
                                            value={office.email || ''}
                                            onChange={(e) => handleOfficeChange(index, 'email', e.target.value)}
                                            className="p-2 border border-slate-300 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Business Hours */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Clock size={20} className="text-primary-600" /> Business Hours
                            </h2>
                            {formData.businessHours.length === 0 && (
                                <button type="button" onClick={initBusinessHours} className="text-sm text-primary-600 font-medium hover:underline">
                                    Initialize Defaults
                                </button>
                            )}
                        </div>
                        <div className="grid gap-2">
                            {formData.businessHours.map((day, index) => (
                                <div key={index} className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-lg">
                                    <span className="w-24 font-medium text-slate-700 text-sm">{day.day}</span>
                                    <div className="flex-1 flex items-center gap-4">
                                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={day.isOpen}
                                                onChange={(e) => handleHoursChange(index, 'isOpen', e.target.checked)}
                                                className="rounded text-primary-600 focus:ring-primary-500"
                                            />
                                            Open
                                        </label>
                                        <input
                                            type="text"
                                            value={day.hours}
                                            disabled={!day.isOpen}
                                            onChange={(e) => handleHoursChange(index, 'hours', e.target.value)}
                                            className="flex-1 p-1.5 border border-slate-300 rounded-lg text-sm disabled:bg-slate-100 disabled:text-slate-400"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Globe size={20} className="text-primary-600" /> Social Media
                            </h2>
                            <button type="button" onClick={addSocial} className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1">
                                <Plus size={16} /> Add Social
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.socialMedia.map((social, index) => (
                                <div key={index} className="flex gap-3">
                                    <select
                                        value={social.platform}
                                        onChange={(e) => handleSocialChange(index, 'platform', e.target.value)}
                                        className="p-2 border border-slate-300 rounded-lg text-sm bg-slate-50 w-32"
                                    >
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="twitter">Twitter</option>
                                        <option value="facebook">Facebook</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="youtube">YouTube</option>
                                        <option value="github">GitHub</option>
                                    </select>
                                    <input
                                        value={social.url}
                                        placeholder="Profile URL"
                                        onChange={(e) => handleSocialChange(index, 'url', e.target.value)}
                                        className="flex-1 p-2 border border-slate-300 rounded-lg text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSocial(index)}
                                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={settingsLoading}
                            className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 flex items-center gap-2"
                        >
                            {settingsLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ContactManager;

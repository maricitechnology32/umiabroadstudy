import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContactSettings } from '../../features/contactSettings/contactSettingsSlice';
import { submitContactMessage, clearSuccess, clearError } from '../../features/contactMessage/contactMessageSlice';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const DashboardContact = () => {
    const dispatch = useDispatch();
    const { settings, isLoading: settingsLoading } = useSelector((state) => state.contactSettings);
    const { isLoading: messageLoading, successMessage, error } = useSelector((state) => state.contactMessages);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    useEffect(() => {
        dispatch(fetchContactSettings());
    }, [dispatch]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            dispatch(clearSuccess());
        }
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [successMessage, error, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(submitContactMessage(formData));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (settingsLoading) {
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
                <h1 className="text-3xl font-bold text-slate-900">Contact Us</h1>
                <p className="text-slate-600 mt-2">Get in touch with our team - we're here to help you with your Japan visa journey</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Contact Form */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
                                Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Your full name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-slate-900 mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="+81 XX XXXX XXXX"
                            />
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-sm font-semibold text-slate-900 mb-2">
                                Subject *
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                required
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="How can we help?"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-semibold text-slate-900 mb-2">
                                Message *
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                                placeholder="Tell us about your inquiry..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={messageLoading}
                            className="w-full bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {messageLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Send Message
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                    {/* Main Contact Card */}
                    <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 text-white shadow-xl">
                        <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

                        {settings && (
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <Mail className="flex-shrink-0 mt-1" size={20} />
                                    <div>
                                        <p className="font-semibold">Email</p>
                                        <a href={`mailto:${settings.mainContact?.email}`} className="hover:underline">
                                            {settings.mainContact?.email}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Phone className="flex-shrink-0 mt-1" size={20} />
                                    <div>
                                        <p className="font-semibold">Phone</p>
                                        <a href={`tel:${settings.mainContact?.phone}`} className="hover:underline">
                                            {settings.mainContact?.phone}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <MapPin className="flex-shrink-0 mt-1" size={20} />
                                    <div>
                                        <p className="font-semibold">Address</p>
                                        <p className="text-primary-50">{settings.mainContact?.address}</p>
                                    </div>
                                </div>

                                {settings.supportInfo?.responseTime && (
                                    <div className="flex items-start gap-4 pt-4 border-t border-primary-500">
                                        <Clock className="flex-shrink-0 mt-1" size={20} />
                                        <div>
                                            <p className="font-semibold">Response Time</p>
                                            <p className="text-primary-50">{settings.supportInfo.responseTime}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Office Locations */}
                    {settings?.officeLocations && settings.officeLocations.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Our Offices</h3>
                            <div className="space-y-4">
                                {settings.officeLocations.map((office, index) => (
                                    <div key={index} className="p-4 bg-slate-50 rounded-xl">
                                        <h4 className="font-semibold text-slate-900 mb-2">{office.name}</h4>
                                        <div className="text-sm text-slate-600 space-y-1">
                                            <p className="flex items-start gap-2">
                                                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                                                {office.address}
                                            </p>
                                            {office.phone && (
                                                <p className="flex items-center gap-2">
                                                    <Phone size={16} />
                                                    {office.phone}
                                                </p>
                                            )}
                                            {office.email && (
                                                <p className="flex items-center gap-2">
                                                    <Mail size={16} />
                                                    {office.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Business Hours */}
                    {settings?.businessHours && settings.businessHours.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Business Hours</h3>
                            <div className="space-y-2">
                                {settings.businessHours.map((schedule, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700">{schedule.day}</span>
                                        <span className={schedule.isOpen ? 'text-slate-600' : 'text-red-600'}>
                                            {schedule.isOpen ? schedule.hours : 'Closed'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardContact;

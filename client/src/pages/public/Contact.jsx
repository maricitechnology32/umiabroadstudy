import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchContactSettings } from '../../features/contactSettings/contactSettingsSlice';
import { submitContactMessage, clearSuccess, clearError } from '../../features/contactMessage/contactMessageSlice';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle, Globe, Facebook, Twitter, Linkedin, Instagram, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import BannerAd from '../../components/ads/BannerAd';


const Contact = () => {
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

    const SocialIcon = ({ platform }) => {
        switch (platform.toLowerCase()) {
            case 'facebook': return <Facebook size={20} />;
            case 'twitter': return <Twitter size={20} />;
            case 'linkedin': return <Linkedin size={20} />;
            case 'instagram': return <Instagram size={20} />;
            default: return <Globe size={20} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            {/* Note: Navbar usually handles its own layout, but we wrap for consistency */}
            <Navbar />

            {/* HERO SECTION */}
            <div className="relative mt-14 py-12 bg-primary-600 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

                <div className="relative max-w-6xl mx-auto px-4 text-center text-white">
                    <h1 className="text-2xl md:text-3xl font-bold mb-3">
                        Get in Touch
                    </h1>
                    <p className="text-primary-100 max-w-xl mx-auto">
                        Have questions about your visa application or need consultancy services?
                        We're here to help you navigate your journey to Japan.
                    </p>
                </div>
            </div>



            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-10">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Contact Info */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Main Contact Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-100 h-full">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="p-2 bg-primary-50 text-primary-600 rounded-md">
                                    <Phone size={18} />
                                </span>
                                Contact Information
                            </h3>

                            {settingsLoading ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                                </div>
                            ) : settings?.mainContact ? (
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 text-primary-600 shrink-0"><MapPin size={20} /></div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Address</p>
                                            <p className="text-slate-600 leading-relaxed">{settings.mainContact.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 text-primary-600 shrink-0"><Mail size={20} /></div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Email</p>
                                            <a href={`mailto:${settings.mainContact.email}`} className="text-slate-600 hover:text-primary-600 transition-colors">{settings.mainContact.email}</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 text-primary-600 shrink-0"><Phone size={20} /></div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Phone</p>
                                            <a href={`tel:${settings.mainContact.phone}`} className="text-slate-600 hover:text-primary-600 transition-colors">{settings.mainContact.phone}</a>
                                        </div>
                                    </div>

                                    {/* Social Media */}
                                    {settings.socialMedia?.length > 0 && (
                                        <div className="pt-6 border-t border-slate-100">
                                            <p className="font-semibold text-slate-900 mb-4">Follow Us</p>
                                            <div className="flex gap-3">
                                                {settings.socialMedia.map((social) => (
                                                    <a
                                                        key={social._id}
                                                        href={social.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all duration-300 hover:-translate-y-1"
                                                    >
                                                        <SocialIcon platform={social.platform} />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-slate-500 italic">Contact information unavailable.</p>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Form & Map */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Contact Form */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">Send us a Message</h3>
                            <p className="text-slate-500 text-sm mb-6">We usually respond within {settings?.supportInfo?.responseTime || '24 hours'}.</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all bg-slate-50 focus:bg-white"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all bg-slate-50 focus:bg-white"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all bg-slate-50 focus:bg-white"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all bg-slate-50 focus:bg-white"
                                            placeholder="Inquiry about..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Message *</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all bg-slate-50 focus:bg-white resize-none"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={messageLoading}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    {messageLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    <span>Send Message</span>
                                </button>
                            </form>
                        </div>

                        {/* Map or Office Locations */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {settings?.officeLocations?.map((office) => (
                                <div key={office._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <h4 className="font-bold text-slate-900 mb-2">{office.name}</h4>
                                    <p className="text-sm text-slate-600 mb-4">{office.address}</p>
                                    <div className="space-y-2 text-sm">
                                        {office.phone && (
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Phone size={14} className="text-primary-500" />
                                                <span>{office.phone}</span>
                                            </div>
                                        )}
                                        {office.email && (
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Mail size={14} className="text-primary-500" />
                                                <span>{office.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </main>



            {/* Apply CTA Section */}
            <div className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
                <div className="bg-gradient-to-r from-primary-900 to-secondary-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                        <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
                        <p className="text-secondary-200 text-lg">
                            Apply online directly through our student portal. We'll assess your profile and guide you through the entire visa process.
                        </p>
                        <Link to="/inquiry/default" className="inline-block" onClick={() => window.scrollTo(0, 0)}>
                            <Button variant="outline" size="lg" className="bg-white text-primary-900 hover:bg-secondary-50 border-none shadow-xl">
                                Apply for Visa Assessment <ArrowRight className="ml-2" size={20} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Contact;

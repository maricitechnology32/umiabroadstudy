import api from '../../utils/api';
import { Building2, CheckCircle, Loader2, Send, Sparkles, GraduationCap, Globe, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';

export default function InquiryForm() {
    const { consultancyId } = useParams();

    // States
    const [consultancy, setConsultancy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        personalInfo: {
            firstName: '', lastName: '', email: '', phone: '',
            dobAD: '', gender: 'Male'
        },
        visaDetails: {
            japaneseLanguage: { status: 'None', level: '', testName: '' },
            education: { lastDegree: '', passedYear: '', percentage: '' },
            intake: ''
        }
    });

    // Fetch Consultancy Info on Load
    useEffect(() => {
        const fetchInfo = async () => {
            try {
                // Determine URL based on whether ID is 'default' or specific
                const url = consultancyId === 'default'
                    ? '/public/consultancy/default'
                    : `/public/consultancy/${consultancyId}`;

                const res = await api.get(url);
                setConsultancy(res.data.data);
            } catch (error) {
                toast.error("Invalid Consultation Link");
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, [consultancyId]);

    // Handlers
    const handlePersonalChange = (e) => {
        setFormData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [e.target.name]: e.target.value }
        }));
    };

    const handleVisaChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            visaDetails: {
                ...prev.visaDetails,
                [section]: {
                    ...prev.visaDetails[section],
                    [field]: value
                }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await api.post('/public/inquiry', {
                consultancyId: consultancy._id,
                ...formData
            });
            setIsSuccess(true);
        } catch (error) {
            toast.error(error.response?.data?.message || "Submission failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
            <Loader2 className="animate-spin text-primary-600" size={48} />
            <p className="text-slate-500 font-medium animate-pulse">Loading Application Portal...</p>
        </div>
    );

    if (!consultancy) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <Building2 size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Consultancy Not Found</h2>
                <p className="text-slate-500">Please verify the link or contact support.</p>
            </div>
        </div>
    );

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-64 bg-primary-900/10 -skew-y-3 pointer-events-none" />

                <div className="bg-white p-10 rounded-3xl shadow-2xl shadow-primary-900/10 max-w-md w-full relative z-10 animate-in zoom-in duration-500">
                    <div className="mx-auto bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mb-8 ring-8 ring-green-50">
                        <CheckCircle className="text-green-600" size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Sent!</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Thank you for choosing <strong>{consultancy.name}</strong>.
                        <br /><br />
                        We have sent your secure login credentials to <strong>{formData.personalInfo.email}</strong>.
                    </p>
                    <a href="/login">
                        <Button size="lg" className="w-full py-6 text-lg shadow-xl shadow-primary-500/20">
                            Go to Student Portal
                        </Button>
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary-100 pb-20">

            {/* Premium Header */}
            <div className="relative bg-secondary-900 text-white pb-32 pt-12 overflow-hidden rounded-b-[4rem] shadow-2xl">
                {/* Abstract Background */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

                <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-6 text-primary-200">
                        <Sparkles size={14} /> Student Visa Application
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{consultancy.name}</h1>
                    <div className="flex items-center justify-center gap-2 text-secondary-300 text-sm md:text-base">
                        <Building2 size={16} />
                        <span>Authorized Japan Access Partner</span>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="max-w-xl mx-auto px-4 -mt-20 relative z-20">
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">

                    {/* 1. Personal Info */}
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                                <Globe size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Personal Details</h3>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">First Name</label>
                                    <input
                                        required
                                        name="firstName"
                                        value={formData.personalInfo.firstName}
                                        onChange={handlePersonalChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-slate-200 border text-slate-900 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-medium"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Last Name</label>
                                    <input
                                        required
                                        name="lastName"
                                        value={formData.personalInfo.lastName}
                                        onChange={handlePersonalChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-slate-200 border text-slate-900 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-medium"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.personalInfo.email}
                                    onChange={handlePersonalChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-slate-200 border text-slate-900 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-medium"
                                    placeholder="student@example.com"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    name="phone"
                                    value={formData.personalInfo.phone}
                                    onChange={handlePersonalChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-slate-200 border text-slate-900 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-medium"
                                    placeholder="+977 9800000000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 mx-8" />

                    {/* 2. Japan Specifics */}
                    <div className="p-8 bg-slate-50/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                                <GraduationCap size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Academic & Visa Info</h3>
                        </div>

                        <div className="space-y-5">
                            {/* Language */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Japanese Language Status</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-3 rounded-xl bg-white border-slate-200 border text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all appearance-none font-medium cursor-pointer"
                                        value={formData.visaDetails.japaneseLanguage.status}
                                        onChange={(e) => handleVisaChange('japaneseLanguage', 'status', e.target.value)}
                                    >
                                        <option value="None">Not Started</option>
                                        <option value="Studying">Currently Studying</option>
                                        <option value="Passed">Passed Test (NAT/JLPT)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <BookOpen size={16} />
                                    </div>
                                </div>
                            </div>

                            {formData.visaDetails.japaneseLanguage.status !== 'None' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in slide-in-from-top-2 fade-in duration-300 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Test Name</label>
                                        <select
                                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border-slate-200 border text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                                            onChange={(e) => handleVisaChange('japaneseLanguage', 'testName', e.target.value)}
                                        >
                                            <option>JLPT</option>
                                            <option>NAT-TEST</option>
                                            <option>TOP-J</option>
                                            <option>J-CERT</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Level / Score</label>
                                        <input
                                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border-slate-200 border text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                                            placeholder="e.g. N5"
                                            onChange={(e) => handleVisaChange('japaneseLanguage', 'level', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Education */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Last Qualification</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-white border-slate-200 border text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-medium cursor-pointer"
                                    onChange={(e) => handleVisaChange('education', 'lastDegree', e.target.value)}
                                >
                                    <option value="">Select Degree</option>
                                    <option value="+2/High School">+2 / High School</option>
                                    <option value="Bachelor">Bachelor's Degree</option>
                                    <option value="Master">Master's Degree</option>
                                </select>
                            </div>

                            {formData.visaDetails.education.lastDegree && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in slide-in-from-top-2 fade-in duration-300 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Passed Year</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border-slate-200 border text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                                            placeholder="2023"
                                            onChange={(e) => handleVisaChange('education', 'passedYear', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">GPA / %</label>
                                        <input
                                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border-slate-200 border text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                                            placeholder="3.6"
                                            onChange={(e) => handleVisaChange('education', 'percentage', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="p-8 border-t border-slate-100 bg-white">
                        <Button
                            type="submit"
                            isLoading={submitting}
                            size="lg"
                            className="w-full py-6 text-lg shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all hover:-translate-y-1"
                        >
                            <span className="flex items-center gap-2">
                                <Send size={20} /> Submit Application
                            </span>
                        </Button>
                        <p className="text-center text-xs text-slate-400 mt-5 leading-relaxed px-4">
                            By submitting this inquirer form, you consent to {consultancy.name} processing your data for visa assessment purposes.
                        </p>
                    </div>

                </form>
            </div>

            <div className="mt-12 text-center">
                <p className="text-slate-400 text-sm">Powered by <span className="font-bold text-slate-500">JapanVisa SaaS</span></p>
            </div>
        </div>
    );
}
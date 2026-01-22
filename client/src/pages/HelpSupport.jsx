import {
    ArrowLeft,
    BookOpen,
    ChevronDown, ChevronRight,
    FileText,
    Globe,
    HelpCircle,
    Mail,
    MessageCircle,
    Phone,
    Shield,
    Users,
    Zap
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';

const faqs = [
    {
        category: 'Getting Started',
        icon: Zap,
        questions: [
            {
                q: 'How do I create an account?',
                a: 'Click the "Get Started" button on the homepage and fill in your details. You\'ll receive a confirmation email to verify your account.'
            },
            {
                q: 'What documents do I need for my visa application?',
                a: 'Required documents typically include: valid passport, passport photos, educational certificates, financial statements, and a statement of purpose. Your consultancy will guide you through specific requirements.'
            },
            {
                q: 'How long does the visa process take?',
                a: 'Processing times vary by visa type. Student visas typically take 2-3 months. Your consultancy will provide specific timelines based on your application.'
            }
        ]
    },
    {
        category: 'Account & Profile',
        icon: Users,
        questions: [
            {
                q: 'How do I update my profile information?',
                a: 'Navigate to your Dashboard and click on your profile. You can edit personal information, upload documents, and update your status from there.'
            },
            {
                q: 'I forgot my password. How do I reset it?',
                a: 'Click "Forgot Password" on the login page. Enter your email address and we\'ll send you a password reset link valid for 10 minutes.'
            },
            {
                q: 'Can I change my email address?',
                a: 'Please contact your consultancy administrator to update your registered email address for security purposes.'
            }
        ]
    },
    {
        category: 'AI Interview Practice',
        icon: MessageCircle,
        questions: [
            {
                q: 'How does the AI interview simulator work?',
                a: 'Our AI simulates a real Japanese immigration officer interview. Select your visa type, and the AI will ask relevant questions to help you prepare for your actual interview.'
            },
            {
                q: 'Is the AI interview available in multiple languages?',
                a: 'Currently, the AI interview is available in English and Japanese. We\'re working on adding more languages soon.'
            },
            {
                q: 'How many practice sessions can I have?',
                a: 'You can practice unlimited times. We recommend practicing at least 3-5 times before your actual interview.'
            }
        ]
    },
    {
        category: 'Documents & Applications',
        icon: FileText,
        questions: [
            {
                q: 'What file formats are accepted for document uploads?',
                a: 'We accept PDF, JPG, PNG, and JPEG files. Each file should be under 5MB. For best results, upload clear, legible scans.'
            },
            {
                q: 'How do I track my application status?',
                a: 'Your application status is displayed on your dashboard. You\'ll also receive email and in-app notifications when your status changes.'
            },
            {
                q: 'Can I edit my application after submission?',
                a: 'Contact your consultancy to request changes after submission. Some fields may be locked depending on your application stage.'
            }
        ]
    }
];

const contactMethods = [
    {
        icon: Mail,
        title: 'Email Support',
        description: 'Get help via email within 24 hours',
        action: 'support@japanvisa.com',
        link: 'mailto:support@japanvisa.com'
    },
    {
        icon: Phone,
        title: 'Phone Support',
        description: 'Mon-Fri, 9AM - 6PM JST',
        action: '+977-9706127862',
        link: 'tel:9706127862'
    },
    
];

export default function HelpSupport({ isDashboard }) {
    const [openFaq, setOpenFaq] = useState(null);
    const [activeCategory, setActiveCategory] = useState('Getting Started');

    const toggleFaq = (categoryIndex, questionIndex) => {
        const key = `${categoryIndex}-${questionIndex}`;
        setOpenFaq(openFaq === key ? null : key);
    };

    const currentCategory = faqs.find(f => f.category === activeCategory);

    return (
        <>
            {!isDashboard && <Navbar />}
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-secondary-900 dark:to-secondary-950">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white mt-14">
                    <div className="max-w-6xl mx-auto px-6 py-12">
                        <Link to={isDashboard ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
                            <ArrowLeft size={16} />
                            Back to {isDashboard ? 'Dashboard' : 'Home'}
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-xl">
                                <HelpCircle size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">Help & Support</h1>
                                <p className="text-primary-100 mt-1">Find answers and get the help you need</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-6 py-12">
                    {/* Contact Cards */}
                    <div className="grid md:grid-cols-3 gap-6 -mt-20 mb-12">
                        {contactMethods.map((method, idx) => (
                            <a
                                key={idx}
                                href={method.link}
                                className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group"
                            >
                                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                                    <method.icon className="text-primary-600" size={24} />
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1">{method.title}</h3>
                                <p className="text-sm text-slate-500 mb-3">{method.description}</p>
                                <span className="text-primary-600 font-medium text-sm">{method.action}</span>
                            </a>
                        ))}
                    </div>

                    {/* FAQ Section */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <BookOpen size={20} className="text-primary-600" />
                                Frequently Asked Questions
                            </h2>
                        </div>

                        <div className="flex flex-col md:flex-row">
                            {/* Category Sidebar */}
                            <div className="md:w-64 border-b md:border-b-0 md:border-r border-slate-100 p-4">
                                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
                                    {faqs.map((cat) => (
                                        <button
                                            key={cat.category}
                                            onClick={() => setActiveCategory(cat.category)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left whitespace-nowrap transition-all ${activeCategory === cat.category
                                                ? 'bg-primary-50 text-primary-700 font-semibold'
                                                : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <cat.icon size={18} />
                                            <span className="text-sm">{cat.category}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Questions */}
                            <div className="flex-1 p-4 md:p-6">
                                <div className="space-y-3">
                                    {currentCategory?.questions.map((item, qIdx) => {
                                        const catIdx = faqs.findIndex(f => f.category === activeCategory);
                                        const isOpen = openFaq === `${catIdx}-${qIdx}`;
                                        return (
                                            <div
                                                key={qIdx}
                                                className={`border rounded-xl overflow-hidden transition-all ${isOpen ? 'border-primary-200 bg-primary-50/30' : 'border-slate-200'
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => toggleFaq(catIdx, qIdx)}
                                                    className="w-full flex items-center justify-between p-4 text-left"
                                                >
                                                    <span className={`font-medium ${isOpen ? 'text-primary-700' : 'text-slate-700'}`}>
                                                        {item.q}
                                                    </span>
                                                    <ChevronDown
                                                        size={18}
                                                        className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                                    />
                                                </button>
                                                {isOpen && (
                                                    <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
                                                        {item.a}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Still Need Help */}
                    <div className="mt-12 text-center bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
                        <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
                        <p className="text-slate-300 mb-6 max-w-md mx-auto">
                            Our support team is here to assist you with any questions or issues you may have.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="secondary" className="bg-white text-slate-800 hover:bg-slate-100">
                                <Mail size={16} className="mr-2" />
                                Contact Support
                            </Button>
                            <Link to="/contact">
                                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                                    Visit Contact Page
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        <Link to="/terms" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-primary-200 hover:shadow-md transition-all group">
                            <Shield size={20} className="text-slate-400 group-hover:text-primary-600" />
                            <div>
                                <p className="font-medium text-slate-800">Terms & Conditions</p>
                                <p className="text-xs text-slate-500">Read our terms of service</p>
                            </div>
                            <ChevronRight size={16} className="ml-auto text-slate-300" />
                        </Link>
                        <Link to="/privacy" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-primary-200 hover:shadow-md transition-all group">
                            <Globe size={20} className="text-slate-400 group-hover:text-primary-600" />
                            <div>
                                <p className="font-medium text-slate-800">Privacy Policy</p>
                                <p className="text-xs text-slate-500">How we protect your data</p>
                            </div>
                            <ChevronRight size={16} className="ml-auto text-slate-300" />
                        </Link>
                        <Link to="/about" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-primary-200 hover:shadow-md transition-all group">
                            <Users size={20} className="text-slate-400 group-hover:text-primary-600" />
                            <div>
                                <p className="font-medium text-slate-800">About Us</p>
                                <p className="text-xs text-slate-500">Learn about our mission</p>
                            </div>
                            <ChevronRight size={16} className="ml-auto text-slate-300" />
                        </Link>
                    </div>
                </div>
                {!isDashboard && <Footer />}
            </div>
        </>
    );
}

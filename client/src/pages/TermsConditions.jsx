import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Scale, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function TermsConditions({ isDashboard }) {
    const lastUpdated = 'December 13, 2024';

    const sections = [
        {
            id: 'acceptance',
            title: '1. Acceptance of Terms',
            content: `By accessing and using the Japan Visa Portal ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this Service.

This agreement is between you ("User", "you", or "your") and Japan Visa Portal ("Company", "we", "us", or "our"). These Terms of Service govern your use of our website and services.`
        },
        {
            id: 'services',
            title: '2. Description of Services',
            content: `Japan Visa Portal provides:

• Visa application management and tracking tools
• Document organization and submission assistance
• AI-powered interview preparation simulations
• Communication tools between consultancies and applicants
• Educational resources about Japanese visa processes

Our services are designed to assist with visa applications but do not guarantee visa approval. Final decisions rest with Japanese immigration authorities.`
        },
        {
            id: 'accounts',
            title: '3. User Accounts',
            content: `To use certain features of the Service, you must register for an account. You agree to:

• Provide accurate, current, and complete information during registration
• Maintain the security of your password and account
• Accept responsibility for all activities under your account
• Notify us immediately of any unauthorized use
• Not share your account credentials with others

We reserve the right to suspend or terminate accounts that violate these terms.`
        },
        {
            id: 'privacy',
            title: '4. Privacy and Data Protection',
            content: `Your privacy is important to us. Our data practices include:

• Collection of personal information necessary for visa applications
• Secure storage of documents and sensitive information
• Sharing data only with your designated consultancy
• Compliance with applicable data protection laws
• Right to request data deletion (subject to legal requirements)

For complete details, please review our Privacy Policy.`
        },
        {
            id: 'conduct',
            title: '5. User Conduct',
            content: `When using our Service, you agree NOT to:

• Submit false or misleading information
• Impersonate another person or entity
• Interfere with or disrupt the Service
• Attempt to gain unauthorized access to our systems
• Use the Service for any illegal purpose
• Upload malicious software or content
• Violate any applicable laws or regulations

Violation of these rules may result in immediate account termination.`
        },
        {
            id: 'intellectual',
            title: '6. Intellectual Property',
            content: `All content, features, and functionality of the Service are owned by Japan Visa Portal and are protected by international copyright, trademark, and other intellectual property laws.

• You may not copy, modify, or distribute our content without permission
• User-submitted content remains your property, but you grant us a license to use it for providing our services
• Our AI interview simulations and training materials are proprietary`
        },
        {
            id: 'liability',
            title: '7. Limitation of Liability',
            content: `To the maximum extent permitted by law:

• The Service is provided "as is" without warranties of any kind
• We do not guarantee visa approval or application success
• We are not liable for decisions made by immigration authorities
• Our liability is limited to the amount you paid for services
• We are not responsible for third-party services or content

You acknowledge that visa applications involve inherent uncertainties.`
        },
        {
            id: 'fees',
            title: '8. Fees and Payments',
            content: `Regarding fees and payments:

• Consultancy fees are set by individual consultancies, not us
• Platform fees (if applicable) are clearly disclosed before payment
• Refund policies vary by consultancy and service type
• We use secure payment processors and do not store card details
• You are responsible for any taxes applicable in your jurisdiction`
        },
        {
            id: 'termination',
            title: '9. Termination',
            content: `This agreement may be terminated:

• By you at any time by discontinuing use of the Service
• By us if you violate these terms
• By us if we discontinue the Service (with notice)

Upon termination, your right to use the Service ceases immediately. Data retention follows our Privacy Policy.`
        },
        {
            id: 'changes',
            title: '10. Changes to Terms',
            content: `We may modify these terms at any time. When we do:

• We will post the updated terms on this page
• The "Last Updated" date will be revised
• Material changes will be communicated via email or notice
• Continued use after changes constitutes acceptance

We encourage you to review these terms periodically.`
        },
        {
            id: 'governing',
            title: '11. Governing Law',
            content: `These Terms shall be governed by and construed in accordance with the laws of Japan, without regard to its conflict of law provisions.

Any disputes arising from these terms or the Service shall be resolved in the courts of Tokyo, Japan. You consent to the personal jurisdiction of such courts.`
        },
        {
            id: 'contact',
            title: '12. Contact Information',
            content: `For questions about these Terms of Service, please contact us:

• Email: legal@japanvisa.com
• Address: Tokyo, Japan
• Phone: +81-3-1234-5678

We aim to respond to all inquiries within 3 business days.`
        }
    ];

    return (
        <>
            {!isDashboard && <Navbar />}
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white mt-14">
                    <div className="max-w-4xl mx-auto px-6 py-16">
                        <Link to={isDashboard ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
                            <ArrowLeft size={16} />
                            Back to {isDashboard ? 'Dashboard' : 'Home'}
                        </Link>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/10 rounded-xl">
                                <Scale size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold">Terms & Conditions</h1>
                                <p className="text-primary-100 mt-1">Last updated: {lastUpdated}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-12">
                    {/* Important Notice */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 flex items-start gap-4">
                        <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="font-semibold text-amber-800 mb-1">Please Read Carefully</h3>
                            <p className="text-sm text-amber-700">
                                These Terms of Service constitute a legally binding agreement. By using our services,
                                you acknowledge that you have read, understood, and agree to be bound by these terms.
                            </p>
                        </div>
                    </div>

                    {/* Table of Contents */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
                        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-primary-600" />
                            Table of Contents
                        </h2>
                        <div className="grid md:grid-cols-2 gap-2">
                            {sections.map((section) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="text-sm text-slate-600 hover:text-primary-600 hover:underline py-1"
                                >
                                    {section.title}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="space-y-8">
                        {sections.map((section) => (
                            <section
                                key={section.id}
                                id={section.id}
                                className="bg-white rounded-xl border border-slate-200 p-6 scroll-mt-24"
                            >
                                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Shield size={18} className="text-primary-600" />
                                    {section.title}
                                </h2>
                                <div className="text-slate-600 leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Acceptance Box */}
                    <div className="mt-12 bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                        <CheckCircle className="text-emerald-600 mx-auto mb-3" size={32} />
                        <h3 className="font-bold text-emerald-800 mb-2">Agreement Acknowledgment</h3>
                        <p className="text-sm text-emerald-700 max-w-lg mx-auto">
                            By creating an account or using our services, you confirm that you have read,
                            understood, and agree to these Terms and Conditions.
                        </p>
                    </div>

                    {/* Related Links */}
                    <div className="mt-8 flex flex-wrap gap-4 justify-center">
                        <Link
                            to="/privacy"
                            className="text-sm text-slate-600 hover:text-primary-600 underline underline-offset-2"
                        >
                            Privacy Policy
                        </Link>
                        <span className="text-slate-300">|</span>
                        <Link
                            to="/help"
                            className="text-sm text-slate-600 hover:text-primary-600 underline underline-offset-2"
                        >
                            Help & Support
                        </Link>
                        <span className="text-slate-300">|</span>
                        <Link
                            to="/contact"
                            className="text-sm text-slate-600 hover:text-primary-600 underline underline-offset-2"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
            {!isDashboard && <Footer />}
        </>
    );
}

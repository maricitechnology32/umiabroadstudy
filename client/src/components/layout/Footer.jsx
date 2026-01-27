import { Github, Linkedin, Mail, Twitter, ChevronRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fixImageUrl } from '../../utils/imageUtils';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const { branding } = useSelector((state) => state.landing);
    const { user } = useSelector((state) => state.auth);
    const hasToken = localStorage.getItem('accessToken') || localStorage.getItem('token');

    // Logic: If logged in or has token, show consultancy branding, otherwise default to UMI Abroad Study
    const showConsultancyBranding = !!(user || hasToken);
    const displayName = showConsultancyBranding ? (branding?.name || 'UMI Abroad Study') : 'UMI Abroad Study';
    const displayLogo = showConsultancyBranding && branding?.logo ? fixImageUrl(branding.logo) : '/logo.jpg';

    const SocialLink = ({ icon: Icon, href }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-primary-500 hover:border-primary-500 hover:text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-500/25 backdrop-blur-sm"
        >
            <Icon size={18} />
        </a>
    );

    const FooterLink = ({ to, children }) => (
        <li>
            <Link
                to={to}
                className="group flex items-center text-sm text-slate-400 hover:text-white transition-colors py-1"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2 opacity-0 -ml-3.5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                {children}
            </Link>
        </li>
    );

    return (
        <footer className="relative bg-slate-900 border-t border-slate-800/50 pt-20 pb-10 overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl overflow-visible pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-900/20 blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-900/10 blur-[100px]" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Top Section */}
                <div className="flex flex-col md:flex-row justify-between gap-12 lg:gap-24 mb-16">

                    {/* Brand */}
                    <div className="space-y-8 md:max-w-md">
                        <div className="flex flex-col gap-6">
                            <Link to="/" className="flex items-center gap-3 group">
                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-primary-900/20 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                    {showConsultancyBranding && branding?.logo ? (
                                        <img src={displayLogo} alt={displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src="/logo.jpg" alt="UMI Abroad Study" className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <span className="text-xl font-bold text-white tracking-tight leading-none group-hover:text-primary-400 transition-colors">
                                    {displayName}
                                </span>
                            </Link>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Streamlining your journey to Japan with cutting-edge technology. We simplify visa applications and university placement with intelligent tools and expert guidance.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <SocialLink icon={Github} href="#" />
                            <SocialLink icon={Twitter} href="#" />
                            <SocialLink icon={Linkedin} href="#" />
                            <SocialLink icon={Mail} href="#" />
                        </div>
                    </div>

                    {/* Quick Link Category 1 */}
                    <div className="md:text-right">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Company</h4>
                        <ul className="space-y-4 md:items-end flex flex-col">
                            <FooterLink to="/about">About Us</FooterLink>
                            <FooterLink to="/careers">Careers</FooterLink>
                            <FooterLink to="/blog">Blog</FooterLink>
                            <FooterLink to="/contact">Contact</FooterLink>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent my-10"></div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
                    <p className="text-slate-500 font-medium">
                        © {currentYear} <span className="text-slate-300">UMI Abroad Study</span>. All rights reserved.
                    </p>

                    <div className="flex flex-wrap justify-center items-center gap-8">
                        <Link to="/privacy" className="text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="text-slate-500 hover:text-white transition-colors">Terms of Service</Link>

                        <a
                            href="https://maricitechnologies.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all text-xs font-semibold group backdrop-blur-sm"
                        >
                            <span>Designed and Developed by Marici Technology</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

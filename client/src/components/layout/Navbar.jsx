import { Menu, X, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { fixImageUrl } from '../../utils/imageUtils';
import Button from '../ui/Button';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const isLandingPage = location.pathname === '/' || location.pathname === '/landing';

    const { branding } = useSelector((state) => state.landing);
    const { user } = useSelector((state) => state.auth);
    const hasToken = localStorage.getItem('accessToken') || localStorage.getItem('token');

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleScrollEvent = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScrollEvent);
        return () => window.removeEventListener('scroll', handleScrollEvent);
    }, []);

    // Logic: If logged in or has token, show consultancy branding, otherwise default to UMI Abroad Study
    const showConsultancyBranding = !!(user || hasToken);
    const displayName = showConsultancyBranding ? (branding?.name || 'UMI Abroad Study') : 'UMI Abroad Study';
    const displayLogo = showConsultancyBranding && branding?.logo ? fixImageUrl(branding.logo) : '/logo.jpg';

    const logoInitial = displayName.charAt(0).toUpperCase();

    const handleScroll = (e, id) => {
        e.preventDefault();
        if (isLandingPage) {
            const element = document.getElementById(id);
            if (element) {
                const navHeight = 80; // Approximate navbar height
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        } else {
            // Navigate to home then scroll
            // This is handled by standard anchor behavior + ScrollToTop ignoring hash
            window.location.href = `/#${id}`;
        }
        setIsMobileMenuOpen(false);
    };

    const NavItem = ({ href, children, onClick }) => (
        <a
            href={href}
            onClick={onClick}
            className="relative font-medium text-sm text-slate-600 hover:text-primary-600 transition-colors group py-2"
        >
            {children}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
        </a>
    );

    const NavLinkItem = ({ to, children }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={`relative font-medium text-sm transition-colors group py-2 ${isActive ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'}`}
            >
                {children}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-primary-600 transition-all duration-300 ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}`} />
            </Link>
        );
    };

    return (
        <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${isScrolled
            ? "bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm py-3"
            : "bg-transparent py-5"
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group relative z-50">
                        <div className="relative">
                            <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-white font-bold text-xl  group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                                <img src={displayLogo} alt={displayName} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-white/20 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-primary-700 transition-colors">
                            {displayName}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8 bg-slate-50/50 px-6 py-2 rounded-full border border-slate-200/50 backdrop-blur-sm">
                        <NavItem href="#features" onClick={(e) => handleScroll(e, 'features')}>Features</NavItem>
                        <NavItem href="#ai-simulator" onClick={(e) => handleScroll(e, 'ai-simulator')}>AI Interview</NavItem>
                        <NavItem href="#testimonials" onClick={(e) => handleScroll(e, 'testimonials')}>Testimonials</NavItem>
                        <NavLinkItem to="/contact">Contact</NavLinkItem>
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden lg:flex items-center gap-4">
                        <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors px-4 py-2">
                            Log in
                        </Link>
                        <Link to="/contact">
                            <Button className="group relative overflow-hidden bg-primary-700 hover:bg-primary text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                                <span className="relative z-10 flex items-center gap-2">
                                    Join Now <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden relative z-50 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 hover:bg-slate-200 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileMenuOpen(false)} />

            {/* Mobile Menu Drawer */}
            <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full pt-20 pb-6 px-6">
                    <div className="flex flex-col space-y-2">
                        <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="flex items-center justify-between p-4 rounded-sm hover:bg-slate-50 text-slate-900 font-medium transition-colors">
                            Features <ChevronRight size={16} className="text-slate-400" />
                        </a>
                        <a href="#ai-simulator" onClick={(e) => handleScroll(e, 'ai-simulator')} className="flex items-center justify-between p-4 rounded-sm hover:bg-slate-50 text-slate-900 font-medium transition-colors">
                            AI Interview <ChevronRight size={16} className="text-slate-400" />
                        </a>
                        <a href="#testimonials" onClick={(e) => handleScroll(e, 'testimonials')} className="flex items-center justify-between p-4 rounded-sm hover:bg-slate-50 text-slate-900 font-medium transition-colors">
                            Testimonials <ChevronRight size={16} className="text-slate-400" />
                        </a>
                        <Link to="/contact" className="flex items-center justify-between p-4 rounded-sm hover:bg-slate-50 text-slate-900 font-medium transition-colors">
                            Contact <ChevronRight size={16} className="text-slate-400" />
                        </Link>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-3">
                        <Link to="/login" className="w-full">
                            <Button variant="outline" className="w-full justify-center py-3 rounded-sm border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                                Log in
                            </Button>
                        </Link>
                        <Link to="/register" className="w-full">
                            <Button className="w-full justify-center py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-sm shadow-lg shadow-primary-500/30">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

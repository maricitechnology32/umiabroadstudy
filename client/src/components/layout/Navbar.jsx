import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import Button from '../ui/Button';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const isLandingPage = location.pathname === '/' || location.pathname === '/landing';

    const { branding } = useSelector((state) => state.landing);
    const logoInitial = branding?.name ? branding.name.charAt(0).toUpperCase() : 'U';

    const handleScroll = (e, id) => {
        e.preventDefault();
        if (isLandingPage) {
            const element = document.getElementById(id);
            if (element) {
                const navHeight = 56; // Fixed navbar height
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

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    {branding?.logo ? (
                        <img src={branding.logo} alt={branding.name} className="w-9 h-9 rounded-md object-cover" />
                    ) : (
                        <div className="w-9 h-9 bg-primary-600 rounded-md flex items-center justify-center text-white text-base font-semibold">
                            {logoInitial}
                        </div>
                    )}
                    <span className="font-semibold text-lg text-slate-900">
                        {branding?.name || 'Your Consultancy'}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
                    <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="hover:text-primary-600 transition cursor-pointer">Features</a>
                    <a href="#ai-simulator" onClick={(e) => handleScroll(e, 'ai-simulator')} className="hover:text-primary-600 transition cursor-pointer">AI Interview</a>
                    <a href="#testimonials" onClick={(e) => handleScroll(e, 'testimonials')} className="hover:text-primary-600 transition cursor-pointer">Success Stories</a>
                    <Link to="/contact" className={`hover:text-primary-600 transition ${location.pathname === '/contact' ? 'text-primary-600 font-medium' : ''}`}>Contact</Link>
                </div>

                <div className="hidden md:flex items-center gap-3">
                    <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5">Log in</Link>
                    <Button size="sm" onClick={() => window.location.href = '/inquiry/default'}>Apply Online</Button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 text-slate-600 hover:text-slate-900"
                >
                    {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-slate-200">
                    <div className="flex flex-col p-4 space-y-1">
                        <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-md">Features</a>
                        <a href="#ai-simulator" onClick={(e) => handleScroll(e, 'ai-simulator')} className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-md">AI Interview</a>
                        <a href="#testimonials" onClick={(e) => handleScroll(e, 'testimonials')} className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-md">Success Stories</a>
                        <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className={`px-3 py-2 hover:bg-slate-50 rounded-md ${location.pathname === '/contact' ? 'text-primary-600 bg-primary-50' : 'text-slate-700'}`}>Contact</Link>
                        <div className="border-t border-slate-100 pt-3 mt-2 flex flex-col gap-2">
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-center text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">Log in</Link>
                            <Button onClick={() => { window.location.href = '/register'; setIsMobileMenuOpen(false); }} className="w-full justify-center">Get Started</Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

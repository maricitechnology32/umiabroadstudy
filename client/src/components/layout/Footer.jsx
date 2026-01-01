import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-primary-900 text-primary-100 py-10 border-t border-primary-800">
            <div className="max-w-6xl mx-auto px-4">

                {/* Top Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">

                    {/* Brand */}
                    <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center">
                                <span className="text-white text-sm">GF</span>
                            </div>
                            Global Flow
                        </h3>
                        <p className="text-sm max-w-xs text-primary-200 leading-relaxed">
                            Streamlining visa applications with modern technology. Your gateway to the world, simplified.
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center gap-2 mt-4">
                            {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-8 h-8 flex items-center justify-center rounded-md bg-primary-800 text-primary-300 hover:bg-primary-700 hover:text-white transition-colors"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider">Company</h4>
                            <ul className="space-y-2">
                                <li><Link to="/about" className="text-sm text-primary-300 hover:text-white transition-colors">About Us</Link></li>
                                <li><Link to="/blog" className="text-sm text-primary-300 hover:text-white transition-colors">Blog</Link></li>
                                <li><Link to="/careers" className="text-sm text-primary-300 hover:text-white transition-colors">Careers</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider">Support</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/help" className="text-sm text-primary-300 hover:text-white transition-colors">Help Center</Link>
                                </li>
                                <li>
                                    <Link to="/contact" className="text-sm text-primary-300 hover:text-white transition-colors">Contact</Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="text-sm text-primary-300 hover:text-white transition-colors">Terms</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-primary-800 my-6"></div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row items-center justify-between text-sm text-primary-400">
                    <p>
                        © {currentYear} <span className="text-white">Global Flow</span>. All rights reserved.
                    </p>

                    <div className="flex items-center gap-4 mt-3 md:mt-0">
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link
                            to="/help"
                            className="px-3 py-1 border border-primary-700 rounded-full text-primary-300 hover:bg-primary-800 hover:text-white transition-colors text-xs"
                        >
                            Get Support
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

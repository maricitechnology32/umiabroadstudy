import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { fixImageUrl } from '../../utils/imageUtils';
import { LayoutDashboard, Users, FileText, Settings, LogOut, BookOpen, Info, Mail, Briefcase, Globe, Key, Building2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import ChangePasswordModal from '../auth/ChangePasswordModal';

const Sidebar = ({ onLogout, isOpen, onClose }) => {
    // Get user from Redux to react to state changes
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user?.role === 'super_admin' || user?.role === 'consultancy_admin';

    // Change password modal state
    const [showChangePassword, setShowChangePassword] = useState(false);

    // Base navigation items
    const baseNavItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Blog', path: '/blog', icon: BookOpen },
        { name: 'About Us', path: '/about', icon: Info },
        { name: 'Contact', path: '/contact', icon: Mail },
        { name: 'Careers', path: '/careers', icon: Briefcase },
    ];

    // Add My Applications only for non-admin users
    const navItems = isAdmin
        ? baseNavItems
        : [...baseNavItems, { name: 'My Applications', path: '/dashboard/my-applications', icon: FileText }];


    const adminItems = [
        { name: 'University Manager', path: '/admin/universities', icon: Building2 }, // New Item
        { name: 'About Us Manager', path: '/admin/about-us', icon: Info },
        { name: 'Blog Manager', path: '/admin/blog', icon: BookOpen },
        { name: 'Careers Manager', path: '/admin/careers', icon: Briefcase },
        { name: 'Contact Manager', path: '/admin/contact', icon: Mail },
        { name: 'Website Manager', path: '/admin/website', icon: Globe },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-secondary-900/50 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white text-secondary-900 shadow-xl transition-transform duration-300 ease-in-out dark:bg-secondary-950 dark:text-secondary-50 border-r border-secondary-200 dark:border-secondary-800
          lg:translate-x-0 lg:shadow-sm
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="flex h-16 items-center justify-between border-b border-secondary-200 px-6 dark:border-secondary-800">
                    <div className="flex items-center gap-3">
                        {/* Logo or Initial */}
                        {user?.consultancy?.logo ? (
                            <img
                                src={fixImageUrl(user.consultancy.logo)}
                                alt={user.consultancy.name}
                                className="h-10 w-10 rounded-xl object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                                {user?.consultancy?.name?.charAt(0)?.toUpperCase() || 'C'}
                            </div>
                        )}
                        {/* Name */}
                        <div className="flex-1 min-w-0">
                            <span className="font-bold text-base text-secondary-900 dark:text-secondary-50 block truncate">
                                {user?.consultancy?.name || 'Your Consultancy'}
                            </span>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="lg:hidden text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200"
                    >
                        <span className="sr-only">Close sidebar</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-1 flex-col overflow-y-auto py-4">
                    <nav className="space-y-1 px-3">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose} // Close sidebar on mobile when link clicked
                                className={({ isActive }) => `
                  flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                  ${isActive
                                        ? 'bg-primary-50 text-primary-900 dark:bg-primary-900/10 dark:text-primary-400'
                                        : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800 dark:hover:text-secondary-50'}
                `}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </NavLink>
                        ))}

                        {/* Admin Section */}
                        {isAdmin && (
                            <>
                                <div className="pt-4 pb-2 px-3">
                                    <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                                        Admin
                                    </p>
                                </div>
                                {adminItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        className={({ isActive }) => `
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                      ${isActive
                                                ? 'bg-primary-50 text-primary-900 dark:bg-primary-900/10 dark:text-primary-400'
                                                : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800 dark:hover:text-secondary-50'}
                    `}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </NavLink>
                                ))}
                            </>
                        )}
                    </nav>
                </div>

                <div className="border-t border-secondary-200 p-4 dark:border-secondary-800 space-y-2">
                    <button
                        onClick={() => setShowChangePassword(true)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 dark:text-secondary-400 dark:hover:bg-secondary-800"
                    >
                        <Key className="h-5 w-5" />
                        Change Password
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
            />
        </>
    );
};

export default Sidebar;

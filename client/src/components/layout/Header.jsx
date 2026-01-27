import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, Settings, LogOut, User, HelpCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import NotificationBell from './NotificationBell';
import ChangePasswordModal from '../auth/ChangePasswordModal';

const Header = ({ onMenuClick, user }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [time, setTime] = useState(new Date());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const dropdownRef = useRef(null);

    // Get student profile for photo
    const { currentProfile } = useSelector((state) => state.students);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const greeting = () => {
        const hour = time.getHours();
        if (hour < 12) return { text: 'Good Morning', emoji: '🌅' };
        if (hour < 17) return { text: 'Good Afternoon', emoji: '☀️' };
        if (hour < 21) return { text: 'Good Evening', emoji: '🌆' };
        return { text: 'Good Night', emoji: '🌙' };
    };

    const greet = greeting();

    // Get user's profile photo
    const getProfileImage = () => {
        if (user?.profileImage) return user.profileImage;
        if (user?.role === 'student' && currentProfile?.personalInfo?.photoUrl) {
            return currentProfile.personalInfo.photoUrl;
        }
        return null;
    };

    const profileImage = getProfileImage();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'super_admin': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'consultancy_admin': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'student': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <>
            <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-secondary-900/95 border-b border-slate-200 dark:border-secondary-800 backdrop-blur-md">
                <div className="h-full flex items-center justify-between gap-4 px-4 lg:px-6">

                    {/* Left Section */}
                    <div className="flex items-center gap-4">
                        {/* Mobile menu */}
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-secondary-800 transition-colors"
                        >
                            <Menu className="h-5 w-5 text-slate-600 dark:text-secondary-300" />
                        </button>

                        {/* Greeting Badge */}
                        <div className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-secondary-800 dark:to-secondary-800 rounded-xl border border-primary-100/50 dark:border-secondary-700">
                            <span className="text-lg">{greet.emoji}</span>
                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-secondary-100">
                                    {greet.text}, <span className="text-primary-600">{user?.name?.split(' ')[0] || 'User'}</span>
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-secondary-400 tabular-nums">
                                    {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1"></div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2">

                        {/* System Status */}
                        <div className="hidden xl:flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                            <div className="relative">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                            </div>
                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Online</span>
                        </div>

                        {/* Notification bell */}
                        {user?.role === 'student' && <NotificationBell />}

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-secondary-700 mx-1"></div>

                        {/* User Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`flex items-center gap-3 px-2 py-1.5 rounded-xl transition-all ${isDropdownOpen ? 'bg-slate-100 dark:bg-secondary-800' : 'hover:bg-slate-50 dark:hover:bg-secondary-800'}`}
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    {profileImage ? (
                                        <img
                                            src={profileImage}
                                            alt={user?.name || 'User'}
                                            className="h-9 w-9 rounded-xl object-cover ring-2 ring-white shadow-md"
                                        />
                                    ) : (
                                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                                            <span className="text-sm font-bold text-white">
                                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white"></div>
                                </div>

                                {/* User Info - Hidden on mobile */}
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-secondary-50 max-w-[120px] truncate">
                                        {user?.name || 'User'}
                                    </p>
                                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full border ${getRoleBadgeColor(user?.role)}`}>
                                        {user?.role?.replace('_', ' ') || 'User'}
                                    </span>
                                </div>

                                <ChevronDown size={16} className={`hidden sm:block text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-secondary-900 rounded-2xl shadow-xl border border-slate-200 dark:border-secondary-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    {/* Header */}
                                    <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-secondary-800 dark:to-secondary-800 border-b border-slate-200 dark:border-secondary-700">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-secondary-100">{user?.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-secondary-400">{user?.email}</p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="p-2">
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-secondary-200 hover:bg-slate-100 dark:hover:bg-secondary-800 rounded-xl transition-colors"
                                        >
                                            <User size={16} className="text-slate-400" />
                                            My Dashboard
                                        </Link>

                                        <button
                                            onClick={() => { setShowChangePassword(true); setIsDropdownOpen(false); }}
                                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-700 dark:text-secondary-200 hover:bg-slate-100 dark:hover:bg-secondary-800 rounded-xl transition-colors"
                                        >
                                            <Settings size={16} className="text-slate-400" />
                                            Change Password
                                        </button>

                                        <Link
                                            to="/help"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-secondary-200 hover:bg-slate-100 dark:hover:bg-secondary-800 rounded-xl transition-colors"
                                        >
                                            <HelpCircle size={16} className="text-slate-400" />
                                            Help & Support
                                        </Link>
                                    </div>

                                    {/* Logout */}
                                    <div className="p-2 border-t border-slate-200 dark:border-secondary-700">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                        >
                                            <LogOut size={16} />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
            />
        </>
    );
};

export default Header;

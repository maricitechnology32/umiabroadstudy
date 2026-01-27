import { Bell, Check, CheckCheck, Info, Trash2, X, AlertTriangle, AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification
} from '../../features/notifications/notificationSlice';

// Socket URL from environment variable with fallback
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Initialize Socket once
const socket = io.connect(SOCKET_URL);

export default function NotificationBell() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { notifications, unreadCount, isLoading } = useSelector((state) => state.notifications);
    const [isOpen, setIsOpen] = useState(false);

    // Ref for detecting clicks outside
    const dropdownRef = useRef(null);

    // 1. Fetch notifications on mount
    useEffect(() => {
        if (user) {
            dispatch(fetchNotifications());
        }
    }, [dispatch, user]);

    // 2. Socket Listener for real-time notifications
    useEffect(() => {
        const userId = user?.id || user?._id;

        if (!userId) return;

        console.log("[NOTIFICATIONS] Connected to room:", userId);
        socket.emit("join_room", userId);

        if (user?.consultancy || user?.consultancyId) {
            const consultancyId = user.consultancy?._id || user.consultancy || user.consultancyId;
            socket.emit("join_room", `consultancy_${consultancyId}`);
            console.log("[NOTIFICATIONS] Joined consultancy room:", consultancyId);
        }

        socket.on("receive_notification", (data) => {
            // Add to Redux store
            dispatch(addNotification({
                _id: data.id,
                ...data
            }));
            toast.info(data.message, { position: "bottom-right" });

            // Play notification sound
            try {
                const audio = new Audio('/notification.mp3');
                audio.play();
            } catch (e) { console.error("Audio error", e); }
        });

        return () => {
            socket.off("receive_notification");
        };
    }, [user, dispatch]);

    // 3. Click Outside to Close
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleOpen = () => {
        setIsOpen(!isOpen);
    };

    const handleMarkAsRead = (e, notificationId) => {
        e.stopPropagation();
        dispatch(markAsRead(notificationId));
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead());
    };

    const handleDelete = (e, notificationId) => {
        e.stopPropagation();
        dispatch(deleteNotification(notificationId));
    };

    const handleClearAll = () => {
        dispatch(clearAllNotifications());
        setIsOpen(false);
    };

    const handleNotificationClick = (notification) => {
        // Mark as read
        if (!notification.isRead) {
            dispatch(markAsRead(notification._id));
        }
        // Navigate if link exists
        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'success':
                return <Check size={14} className="text-emerald-600" />;
            case 'warning':
                return <AlertTriangle size={14} className="text-amber-600" />;
            case 'error':
                return <AlertCircle size={14} className="text-red-600" />;
            default:
                return <Info size={14} className="text-blue-600" />;
        }
    };

    const getTypeBgColor = (type) => {
        switch (type) {
            case 'success':
                return 'bg-emerald-50 border-emerald-100';
            case 'warning':
                return 'bg-amber-50 border-amber-100';
            case 'error':
                return 'bg-red-50 border-red-100';
            default:
                return 'bg-blue-50 border-blue-100';
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        // Less than 1 minute
        if (diff < 60000) return 'Just now';
        // Less than 1 hour
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        // Less than 24 hours
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        // Show date
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={handleOpen}
                className={`relative p-2.5 rounded-full transition-all duration-200 ${isOpen ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">

                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                            <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{notifications.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-[10px] text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors font-medium"
                                >
                                    <CheckCheck size={12} /> Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button onClick={handleClearAll} className="text-[10px] text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                                    <Trash2 size={12} /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="p-8 text-center text-slate-400">
                                <div className="w-6 h-6 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-xs">Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-10 text-center flex flex-col items-center text-slate-400">
                                <div className="bg-slate-50 p-3 rounded-full mb-3">
                                    <Bell size={24} className="opacity-20" />
                                </div>
                                <p className="text-sm font-medium">All caught up!</p>
                                <p className="text-xs mt-1 opacity-70">No new notifications.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif._id || notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`p-4 hover:bg-slate-50 transition-colors relative group cursor-pointer ${!notif.isRead ? 'bg-primary-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3 items-start">
                                            {/* Icon Badge */}
                                            <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${getTypeBgColor(notif.type)}`}>
                                                {getTypeIcon(notif.type)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 pr-4">
                                                <div className="flex justify-between items-start">
                                                    <p className={`text-sm ${!notif.isRead ? 'font-bold' : 'font-semibold'} text-slate-800`}>{notif.title}</p>
                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                        {formatTime(notif.createdAt || notif.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                {!notif.isRead && (
                                                    <button
                                                        onClick={(e) => handleMarkAsRead(e, notif._id)}
                                                        className="p-1.5 text-slate-300 hover:text-primary-500 hover:bg-primary-50 rounded-md"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => handleDelete(e, notif._id)}
                                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md"
                                                    title="Delete"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Unread indicator */}
                                        {!notif.isRead && (
                                            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
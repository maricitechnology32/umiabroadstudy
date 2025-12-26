import { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';

function ActiveSessions() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/sessions/me');
            setSessions(data.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
            setError('Failed to load active sessions');
        } finally {
            setLoading(false);
        }
    };

    const revokeSession = async (sessionId) => {
        if (!confirm('Are you sure you want to logout from this device?')) {
            return;
        }

        try {
            await api.delete(`/sessions/${sessionId}`);
            // Remove from list
            setSessions(sessions.filter(s => s._id !== sessionId));
        } catch (err) {
            alert('Failed to revoke session. Please try again.');
            console.error('Revoke session error:', err);
        }
    };

    const logoutAllDevices = async () => {
        if (!confirm('This will log you out from all other devices. Continue?')) {
            return;
        }

        try {
            const { data } = await api.delete('/sessions/all/remove');
            alert(data.message);
            fetchSessions(); // Refresh list
        } catch (err) {
            alert('Failed to logout from other devices');
            console.error('Logout all error:', err);
        }
    };

    const getDeviceIcon = (deviceType) => {
        switch (deviceType) {
            case 'mobile':
                return '📱';
            case 'tablet':
                return '📱';
            case 'desktop':
            default:
                return '💻';
        }
    };

    const formatLastActivity = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / 1000 / 60);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Active Sessions</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage your active logins across different devices
                    </p>
                </div>
                {sessions.length > 1 && (
                    <button
                        onClick={logoutAllDevices}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                        Logout All Other Devices
                    </button>
                )}
            </div>

            {/* Sessions List */}
            <div className="space-y-4">
                {sessions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No active sessions found</p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div
                            key={session._id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    {/* Device Info */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">
                                            {getDeviceIcon(session.device?.deviceType)}
                                        </span>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {session.device?.browser} on {session.device?.os}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {session.device?.osVersion && `${session.device.osVersion} • `}
                                                {session.device?.browserVersion}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Location & Activity */}
                                    <div className="mt-3 space-y-1">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">IP Address:</span> {session.ip}
                                        </p>
                                        {session.location?.city && (
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Location:</span>{' '}
                                                {session.location.city}, {session.location.country}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Last active:</span>{' '}
                                            {formatLastActivity(session.lastActivity)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Session started: {new Date(session.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Status Badge */}
                                    {session.isActive && (
                                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                            Active
                                        </span>
                                    )}
                                </div>

                                {/* Revoke Button */}
                                <button
                                    onClick={() => revokeSession(session._id)}
                                    className="ml-4 bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 transition-colors font-medium"
                                >
                                    Revoke
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Info Footer */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> If you see a session you don't recognize, revoke it
                    immediately and change your password.
                </p>
            </div>
        </div>
    );
}

export default ActiveSessions;

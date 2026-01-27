import { CalendarDays, Plus, Trash2, X, Calendar as CalendarIcon, List, Clock, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getEvents, addEvent, deleteEvent, reset } from '../../features/events/eventSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Calendar from '../../components/calendar/Calendar';

const EVENT_TYPES = [
    { value: 'Class', label: 'Class', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'Holiday', label: 'Holiday', color: 'bg-red-100 text-red-700 border-red-200' },
    { value: 'Deadline', label: 'Deadline', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { value: 'Orientation', label: 'Orientation', color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 'Meeting', label: 'Meeting', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { value: 'Other', label: 'Other', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export default function EventManager() {
    const dispatch = useDispatch();
    const { events, isLoading, isSuccess, isError, message } = useSelector(state => state.events);

    const [viewMode, setViewMode] = useState('calendar');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        type: 'Other',
        description: ''
    });

    useEffect(() => {
        dispatch(getEvents());
    }, [dispatch]);

    useEffect(() => {
        if (isSuccess && message) {
            toast.success(message);
            setShowForm(false);
            setFormData({ title: '', date: '', type: 'Other', description: '' });
        }
        if (isError && message) {
            toast.error(message);
        }
        dispatch(reset());
    }, [isSuccess, isError, message, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.date) {
            toast.error('Title and Date are required');
            return;
        }
        dispatch(addEvent(formData));
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            dispatch(deleteEvent(id));
        }
    };

    const getTypeColor = (type) => {
        const found = EVENT_TYPES.find(t => t.value === type);
        return found?.color || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    // Transform events for Calendar component
    const calendarEvents = events.map(event => ({
        id: event._id,
        title: event.title,
        date: event.date,
        type: event.type
    }));

    // Get today's date in YYYY-MM-DD format (local time)
    const getTodayString = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    };

    const upcomingEvents = [...events]
        .filter(e => e.date >= getTodayString())
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

    // Helper to parse date safely
    const parseDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
                        <CalendarDays className="text-primary-600" /> Event Calendar
                    </h2>
                    <p className="text-secondary-500">Manage events for your consultancy</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <CalendarIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
                        {showForm ? <X size={18} /> : <Plus size={18} />}
                        {showForm ? 'Cancel' : 'Add Event'}
                    </Button>
                </div>
            </div>

            {/* Add Event Form */}
            {showForm && (
                <Card className="animate-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle>Create New Event</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Event Title"
                                    placeholder="e.g., Orientation Session"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Event Date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">Event Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {EVENT_TYPES.map(type => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: type.value })}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.type === type.value
                                                ? type.color + ' ring-2 ring-offset-1 ring-primary-500'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Description (Optional)</label>
                                <textarea
                                    placeholder="Add details about this event..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" isLoading={isLoading}>
                                    <Plus size={18} className="mr-2" /> Create Event
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Calendar/List View */}
                <div className="lg:col-span-3">
                    {viewMode === 'calendar' ? (
                        <Calendar events={calendarEvents} />
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>All Events</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {events.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <CalendarDays size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>No events yet. Create your first event!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {events.map(event => (
                                            <div
                                                key={event._id}
                                                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="text-center bg-white p-3 rounded-lg border border-slate-200 min-w-[60px]">
                                                        <div className="text-xs text-slate-500 uppercase">
                                                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                                                        </div>
                                                        <div className="text-xl font-bold text-slate-900">
                                                            {new Date(event.date).getDate()}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900">{event.title}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`px-2 py-0.5 text-xs rounded-full border ${getTypeColor(event.type)}`}>
                                                                {event.type}
                                                            </span>
                                                            {event.description && (
                                                                <span className="text-xs text-slate-500 truncate max-w-[200px]">
                                                                    {event.description}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(event._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Upcoming Events Sidebar */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock size={18} /> Upcoming
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {upcomingEvents.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">No upcoming events</p>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingEvents.map(event => (
                                        <div key={event._id} className="p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`px-2 py-0.5 text-xs rounded-full border ${getTypeColor(event.type)}`}>
                                                    {event.type}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <h4 className="font-medium text-slate-900 text-sm">{event.title}</h4>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="mt-4">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{events.length}</div>
                                    <div className="text-xs text-blue-600">Total Events</div>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{upcomingEvents.length}</div>
                                    <div className="text-xs text-green-600">Upcoming</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

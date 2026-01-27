import { CalendarDays, Clock, Tag, AlignLeft, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEvents } from '../../features/events/eventSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Calendar from '../../components/calendar/Calendar';
import Modal from '../../components/ui/Modal';

const EVENT_TYPES = {
    'Class': 'bg-blue-100/50 text-blue-700 border-blue-200',
    'Holiday': 'bg-red-100/50 text-red-700 border-red-200',
    'Deadline': 'bg-amber-100/50 text-amber-700 border-amber-200',
    'Orientation': 'bg-green-100/50 text-green-700 border-green-200',
    'Meeting': 'bg-purple-100/50 text-purple-700 border-purple-200',
    'Other': 'bg-slate-100/50 text-slate-700 border-slate-200',
};

export default function StudentEventCalendar() {
    const dispatch = useDispatch();
    const { events, isLoading } = useSelector(state => state.events);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        dispatch(getEvents());
    }, [dispatch]);

    // Transform events for Calendar component matching required structure
    // We spread 'event' to ensure all properties (like description) are available in the click handler
    const calendarEvents = events.map(event => ({
        ...event,
        title: event.title,
        date: event.date,
        type: event.type
    }));

    // Get today's date in YYYY-MM-DD format (local time)
    const getTodayString = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    };

    const todayString = getTodayString();

    // Get upcoming events (next 30 days)
    const upcomingEvents = [...events]
        .filter(e => e.date >= todayString)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 8);

    const getTypeColor = (type) => EVENT_TYPES[type] || EVENT_TYPES['Other'];

    const formatEventDate = (dateStr) => {
        // Parse date parts directly to avoid timezone issues
        const [year, month, day] = dateStr.split('-').map(Number);
        const eventDate = new Date(year, month - 1, day);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const diffTime = eventDate.getTime() - now.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;

        return eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
                    <CalendarDays className="text-primary-600" /> Consultancy Events
                </h2>
                <p className="text-secondary-500">Stay updated with important dates and events</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar View */}
                <div className="lg:col-span-2">
                    <Calendar
                        events={calendarEvents}
                        onEventClick={setSelectedEvent}
                    />
                </div>

                {/* Upcoming Events Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock size={18} className="text-primary-600" /> Upcoming Events
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            {upcomingEvents.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <CalendarDays size={40} className="mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">No upcoming events</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingEvents.slice(0, 8).map(event => {
                                        const dateLabel = formatEventDate(event.date);
                                        const isUrgent = dateLabel.includes('Today') || dateLabel.includes('Tomorrow');

                                        return (
                                            <div
                                                key={event._id}
                                                onClick={() => setSelectedEvent(event)}
                                                className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group relative overflow-hidden"
                                            >
                                                {/* Left Accent Bar */}
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getTypeColor(event.type).replace('bg-', 'bg-').split(' ')[0].replace('/50', '-500')}`}></div>

                                                <div className="pl-2 flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors line-clamp-1">{event.title}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTypeColor(event.type)}`}>
                                                                {event.type}
                                                            </span>
                                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                <Clock size={10} /> {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isUrgent ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'}`}>
                                                        {dateLabel}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Event Legend */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <Tag size={16} className="text-primary-500" /> Event Legend
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(EVENT_TYPES).map(([type, colorClass]) => (
                                    <div key={type} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-transform hover:scale-105 cursor-default ${colorClass}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-60`}></span>
                                        {type}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Event Details Modal */}
            <Modal
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                title="Event Details"
            >
                {selectedEvent && (
                    <div className="space-y-6">
                        {/* Title and Type */}
                        <div>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border mb-3 ${getTypeColor(selectedEvent.type)}`}>
                                {selectedEvent.type}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 leading-tight">
                                {selectedEvent.title}
                            </h3>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-slate-100">
                            {/* Date */}
                            <div className="flex items-start gap-4 text-slate-600">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <CalendarDays size={20} />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Date</span>
                                    <span className="font-medium">
                                        {new Date(selectedEvent.date).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedEvent.description && (
                                <div className="flex items-start gap-4 text-slate-600">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                        <AlignLeft size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Description</span>
                                        <p className="leading-relaxed text-sm whitespace-pre-wrap">{selectedEvent.description}</p>
                                    </div>
                                </div>
                            )}

                            {/* Location Placeholder (Optional) */}
                            {/* 
                            <div className="flex items-start gap-4 text-slate-600">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Location</span>
                                    <span className="font-medium">Main Branch Office</span>
                                </div>
                            </div> 
                            */}
                        </div>

                        <div className="pt-4 mt-2 flex justify-end">
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

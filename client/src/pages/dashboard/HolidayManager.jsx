 

import { Calendar as CalendarIcon, CalendarDays, Filter, Globe, LayoutGrid, List, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { addHoliday, deleteHoliday, getHolidays, reset } from '../../features/holidays/holidaySlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import Calendar from '../../components/calendar/Calendar'; // Import the new Calendar component

export default function HolidayManager() {
  const dispatch = useDispatch();
  const { holidays, isLoading, isSuccess, message } = useSelector((state) => state.holidays);

  const [formData, setFormData] = useState({ date: '', name: '', type: 'Public' });
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('calendar'); // Default to calendar view as requested

  useEffect(() => {
    dispatch(getHolidays());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && message) {
      toast.success(message);
      setFormData({ date: '', name: '', type: 'Public' });
      dispatch(reset());
    }
  }, [isSuccess, message, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.name) return toast.error("Date and Name required");
    dispatch(addHoliday(formData));
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Public': return 'bg-red-100 text-red-800 border-red-200';
      case 'Bank': return 'bg-green-100 text-green-800 border-green-200';
      case 'Festival': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-secondary-100 text-secondary-800 border-secondary-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Public': return '🏛️';
      case 'Bank': return '🏦';
      case 'Festival': return '🎉';
      default: return '📅';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      date: date.getDate(),
      year: date.getFullYear(),
      full: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  };

  const filteredAndSortedHolidays = holidays
    .filter(h => filterType === 'All' || h.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const typeCounts = {
    All: holidays.length,
    Public: holidays.filter(h => h.type === 'Public').length,
    Bank: holidays.filter(h => h.type === 'Bank').length,
    Festival: holidays.filter(h => h.type === 'Festival').length
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">

      {/* Actions Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-secondary-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Globe size={20} className="text-secondary-400" />
          <span className="font-medium text-secondary-700">{holidays.length} Global Holidays Configured</span>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-secondary-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${viewMode === 'calendar' ? 'bg-white shadow text-primary-600' : 'text-secondary-500 hover:text-secondary-700'}`}
            >
              <LayoutGrid size={16} /> Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary-600' : 'text-secondary-500 hover:text-secondary-700'}`}
            >
              <List size={16} /> List
            </button>
          </div>

          {viewMode === 'list' && (
            <div className="flex items-center gap-2 bg-secondary-100 p-1 rounded-lg">
              <button onClick={() => setSortBy('date')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${sortBy === 'date' ? 'bg-white shadow text-secondary-800' : 'text-secondary-600 hover:text-secondary-800'}`}>
                Date
              </button>
              <button onClick={() => setSortBy('name')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${sortBy === 'name' ? 'bg-white shadow text-secondary-800' : 'text-secondary-600 hover:text-secondary-800'}`}>
                Name
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-secondary-200 p-6 sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-secondary-800 text-lg flex items-center gap-2">
                <Plus size={20} />
                Add Holiday
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  leftIcon={<CalendarDays size={16} />}
                />
              </div>

              <div className="space-y-2">
                <Input
                  label="Name"
                  placeholder="e.g. Dashain"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-secondary-700">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Public', 'Bank', 'Festival'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`p-2 rounded-lg border-2 transition-all ${formData.type === type
                        ? `${getTypeColor(type)} border-opacity-100 font-semibold`
                        : 'border-secondary-200 hover:border-secondary-300'}`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">{getTypeIcon(type)}</span>
                        <span className="text-[10px] uppercase tracking-wide">{type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                className="w-full justify-center py-2.5"
              >
                <Plus size={18} className="mr-2" /> Add Holiday
              </Button>
            </form>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {viewMode === 'calendar' ? (
            // Direct render without extra card wrapper
            <Calendar events={filteredAndSortedHolidays} />
          ) : (
            // List View - Needs Card Wrapper
            <Card className="border-secondary-200 p-0 overflow-hidden min-h-[600px]">
              <div className="overflow-auto max-h-[600px]">
                {filteredAndSortedHolidays.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                      <CalendarIcon size={24} className="text-secondary-400" />
                    </div>
                    <h4 className="text-secondary-500 font-medium">No holidays found</h4>
                  </div>
                ) : (
                  <div className="divide-y divide-secondary-100">
                    {filteredAndSortedHolidays.map((holiday) => {
                      const formattedDate = formatDate(holiday.date);
                      return (
                        <div key={holiday._id} className="p-4 hover:bg-secondary-50 transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="text-center min-w-[60px] p-2 bg-secondary-100 rounded-lg">
                              <div className="text-xl font-bold text-secondary-900">{formattedDate.date}</div>
                              <div className="text-xs font-bold text-secondary-500 uppercase">{formattedDate.month}</div>
                            </div>
                            <div>
                              <h4 className="font-bold text-secondary-900">{holiday.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTypeColor(holiday.type)}`}>
                                  {holiday.type}
                                </span>
                                <span className="text-xs text-secondary-500">{formattedDate.full}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${holiday.name}?`)) dispatch(deleteHoliday(holiday._id));
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 text-secondary-400 hover:text-red-600 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
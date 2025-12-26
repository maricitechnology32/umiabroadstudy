import { useState } from 'react';
import moment from 'moment';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function Calendar({ events = [], onEventClick }) {
  const [currentDate, setCurrentDate] = useState(moment());

  const startOfMonth = currentDate.clone().startOf('month');
  const endOfMonth = currentDate.clone().endOf('month');
  const startDate = startOfMonth.clone().startOf('week');
  const endDate = endOfMonth.clone().endOf('week');

  const calendarDays = [];
  let day = startDate.clone();

  while (day.isSameOrBefore(endDate, 'day')) {
    calendarDays.push(day.clone());
    day.add(1, 'day');
  }

  const nextMonth = () => setCurrentDate(currentDate.clone().add(1, 'month'));
  const prevMonth = () => setCurrentDate(currentDate.clone().subtract(1, 'month'));
  const goToToday = () => setCurrentDate(moment());

  const getEventsForDay = (dayMoment) => {
    return events.filter(event =>
      moment(event.date).isSame(dayMoment, 'day')
    );
  };

  const getEventTypeStyles = (type) => {
    switch (type) {
      case 'Public': return 'bg-rose-100/80 text-rose-700 border-l-[3px] border-rose-500 hover:bg-rose-200';
      case 'Bank': return 'bg-emerald-100/80 text-emerald-700 border-l-[3px] border-emerald-500 hover:bg-emerald-200';
      case 'Festival': return 'bg-violet-100/80 text-violet-700 border-l-[3px] border-violet-500 hover:bg-violet-200';
      case 'Class': return 'bg-blue-100/80 text-blue-700 border-l-[3px] border-blue-500 hover:bg-blue-200';
      case 'Holiday': return 'bg-red-100/80 text-red-700 border-l-[3px] border-red-500 hover:bg-red-200';
      case 'Deadline': return 'bg-amber-100/80 text-amber-700 border-l-[3px] border-amber-500 hover:bg-amber-200';
      case 'Orientation': return 'bg-green-100/80 text-green-700 border-l-[3px] border-green-500 hover:bg-green-200';
      case 'Meeting': return 'bg-purple-100/80 text-purple-700 border-l-[3px] border-purple-500 hover:bg-purple-200';
      case 'Other': return 'bg-slate-100/80 text-slate-700 border-l-[3px] border-slate-500 hover:bg-slate-200';
      default: return 'bg-slate-100/80 text-slate-700 border-l-[3px] border-slate-500 hover:bg-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col font-sans w-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-white/50 backdrop-blur-sm border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl text-primary-600 shadow-sm ring-1 ring-primary-100">
            <CalendarIcon size={22} className="stroke-[1.5]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {currentDate.format('MMMM YYYY')}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Running Schedule
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100/50 rounded-xl border border-slate-200/60">
          <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500 hover:text-slate-800 active:scale-95">
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <button onClick={goToToday} className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-primary-700 bg-transparent hover:bg-white hover:shadow-sm rounded-lg transition-all uppercase tracking-wide">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500 hover:text-slate-800 active:scale-95">
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
          <div key={dayName} className="py-3 text-center text-[11px] font-bold uppercase text-slate-400 tracking-widest">
            {dayName}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 auto-rows-fr bg-slate-100 gap-px border-b border-slate-100">
        {calendarDays.map((dateItem) => {
          const isCurrentMonth = dateItem.isSame(currentDate, 'month');
          const isToday = dateItem.isSame(moment(), 'day');
          const dayEvents = getEventsForDay(dateItem);
          const isWeekend = dateItem.day() === 6;

          return (
            <div
              key={dateItem.format('DD-MM-YYYY')}
              className={`min-h-[80px] sm:min-h-[100px] lg:min-h-[140px] bg-white p-1.5 sm:p-2 lg:p-3 relative flex flex-col transition-all duration-200 hover:z-10
                        ${!isCurrentMonth ? 'bg-slate-50/40 text-slate-300' : 'text-slate-700'}
                        ${isWeekend && isCurrentMonth ? 'bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:16px_16px]' : ''}
                        hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]
                    `}
            >
              {/* Date Number */}
              <div className="flex justify-between items-start mb-2 group">
                <span className={`
                            text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300
                            ${isToday ? 'bg-primary-600 text-white shadow-md scale-100' :
                    isCurrentMonth ? 'group-hover:bg-slate-100 text-slate-700' : 'text-slate-400'}
                        `}>
                  {dateItem.format('D')}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Events List */}
              <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden hide-scrollbar">
                {dayEvents.map((event, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick && onEventClick(event);
                    }}
                    className={`
                                    group/event relative text-[10px] px-2.5 py-1.5 rounded-lg font-semibold truncate transition-transform hover:-translate-y-0.5
                                    cursor-pointer select-none hover:shadow-sm ring-1 ring-inset ring-black/5
                                    ${getEventTypeStyles(event.type)}
                                `}
                  >
                    <span className="relative z-10">{event.title || event.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
  Clock, MapPin, User, MoreVertical, Trash2, Edit3,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { CalendarService } from '@/src/services/calendarService';
import { cn } from '@/src/lib/utils';

export default function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const items = await CalendarService.list();
        if (!active) return;

        setEvents((items as any[]).map((item) => ({
          id: item.id,
          title: item.title || 'Scheduled Event',
          time: item.time || 'TBD',
          date: String(item.date || item.createdAt || new Date().toISOString()).slice(0, 10),
          type: item.type || 'event',
          tutor: item.tutor || 'Admin',
          location: item.location || 'Online',
        })));
      } catch (err) {
        console.error('Failed to load calendar events:', err);
      }
    })();

    return () => { active = false; };
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return day === selectedDate.getDate() && 
           currentDate.getMonth() === selectedDate.getMonth() && 
           currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((event) => String(event.date).slice(0, 10) === dateStr);
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-display font-black text-ink tracking-tight flex items-center gap-3">
              <CalendarIcon className="text-primary" size={32} />
              Schedule & Calendar
            </h2>
            <p className="text-sm font-medium text-ink-muted">Manage demo classes, meetings, and important deadlines.</p>
          </div>
          <button className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95">
            <Plus size={18} /> Add New Event
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-8 bg-white/40 backdrop-blur-xl rounded-[40px] border border-white/40 shadow-2xl shadow-ink/5 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-ink">
                {monthNames[currentDate.getMonth()]} <span className="text-primary">{currentDate.getFullYear()}</span>
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-white border border-ink/5 flex items-center justify-center text-ink-muted hover:text-primary transition-all shadow-sm">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-white border border-ink/5 flex items-center justify-center text-ink-muted hover:text-primary transition-all shadow-sm">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-ink-muted uppercase tracking-widest py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {prevMonthDays.map(i => (
                <div key={`prev-${i}`} className="aspect-square rounded-2xl bg-ink/[0.02] opacity-20" />
              ))}
              {days.map(day => {
                const events = getEventsForDate(day);
                return (
                  <button 
                    key={day}
                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    className={cn(
                      "aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all group",
                      isSelected(day) ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-white/60 hover:bg-white border border-white/40 text-ink-muted hover:text-primary",
                      isToday(day) && !isSelected(day) && "border-primary/40 bg-primary/5 text-primary"
                    )}
                  >
                    <span className="text-sm font-black">{day}</span>
                    {events.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {events.slice(0, 3).map((_, i) => (
                          <div key={i} className={cn("w-1 h-1 rounded-full", isSelected(day) ? "bg-white" : "bg-primary")} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Events Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/40 shadow-2xl shadow-ink/5 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-ink">Events</h3>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                  {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </span>
              </div>

              <div className="space-y-4">
                {getEventsForDate(selectedDate.getDate()).length > 0 ? (
                  getEventsForDate(selectedDate.getDate()).map(event => (
                    <motion.div 
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-5 bg-white rounded-3xl border border-ink/5 shadow-sm space-y-3 group hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className={cn(
                            "text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
                            event.type === 'demo' ? "bg-emerald-50 text-emerald-500" : 
                            event.type === 'meeting' ? "bg-blue-50 text-blue-500" : "bg-amber-50 text-amber-500"
                          )}>
                            {event.type}
                          </span>
                          <h4 className="text-sm font-black text-ink leading-tight">{event.title}</h4>
                        </div>
                        <button className="text-ink-muted hover:text-primary transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-muted">
                          <Clock size={12} className="text-primary" /> {event.time}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-muted">
                          <User size={12} className="text-primary" /> {event.tutor}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-muted">
                          <MapPin size={12} className="text-primary" /> {event.location}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted mx-auto">
                      <CalendarIcon size={24} />
                    </div>
                    <p className="text-xs font-bold text-ink-muted">No events scheduled for this day.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

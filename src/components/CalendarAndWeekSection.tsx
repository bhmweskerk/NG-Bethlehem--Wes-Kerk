import {useMemo, useState} from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Gift,
  Check,
  Copy,
} from 'lucide-react';
import {
  BirthdayEntry,
  CalendarEvent,
  DayOfWeek,
  EventCategory,
  WeeklyProgramItem,
} from '../types/church';

interface CalendarAndWeekSectionProps {
  calendarEvents: CalendarEvent[];
  weeklyProgram: WeeklyProgramItem[];
  birthdays: BirthdayEntry[];
  editMode: boolean;
  isAdmin: boolean;
  onAddEvent: (ev: Omit<CalendarEvent, 'id'>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  onAddProgramItem: (item: Omit<WeeklyProgramItem, 'id'>) => Promise<void>;
  onDeleteProgramItem: (id: string) => Promise<void>;
  onAddBirthday: (bday: Omit<BirthdayEntry, 'id' | 'wishedCount'>) => Promise<void>;
  onWishBirthday: (id: string) => Promise<void>;
}

const MONTH_NAMES = [
  'Januarie',
  'Februarie',
  'Maart',
  'April',
  'Mei',
  'Junie',
  'Julie',
  'Augustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const WEEKDAY_SHORT = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Sa', 'So'];
const DAYS_ORDER: DayOfWeek[] = [
  'Maandag',
  'Dinsdag',
  'Woensdag',
  'Donderdag',
  'Vrydag',
  'Saterdag',
  'Sondag',
];

const TODAY_ISO = '2026-11-22';

export function CalendarAndWeekSection({
  calendarEvents,
  weeklyProgram,
  birthdays,
  editMode,
  isAdmin,
  onAddEvent,
  onDeleteEvent,
  onAddProgramItem,
  onDeleteProgramItem,
  onAddBirthday,
  onWishBirthday,
}: CalendarAndWeekSectionProps) {
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(10); // 0-indexed: 10 = November
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-22');
  const [programFilter, setProgramFilter] = useState<'all' | 'weekend'>('all');
  const [copiedBdayId, setCopiedBdayId] = useState<string | null>(null);

  // Admin add forms
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<{
    title: string;
    date: string;
    time: string;
    location: string;
    category: EventCategory;
    description: string;
  }>({
    title: '',
    date: '2026-11-28',
    time: '09:00',
    location: 'Hoofkerkgebou',
    category: 'Gemeenskap',
    description: '',
  });

  const [showAddProgram, setShowAddProgram] = useState(false);
  const [newProgram, setNewProgram] = useState<{
    dayOfWeek: DayOfWeek;
    time: string;
    title: string;
    location: string;
    leader: string;
    note: string;
  }>({
    dayOfWeek: 'Woensdag',
    time: '18:00',
    title: '',
    location: 'Kerksaal',
    leader: '',
    note: '',
  });

  const [showAddBday, setShowAddBday] = useState(false);
  const [newBday, setNewBday] = useState({
    name: '',
    dayLabel: 'Sondag',
    dateStr: '22 November',
    group: '',
  });

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // Monday-first offset: JS getDay() returns 0=Sun..6=Sat
    const jsDay = firstDayOfMonth.getDay();
    const startOffset = jsDay === 0 ? 6 : jsDay - 1;

    const cells: Array<{iso: string | null; dayNum: number | null}> = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push({iso: null, dayNum: null});
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(viewMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      cells.push({iso: `${viewYear}-${mm}-${dd}`, dayNum: d});
    }
    return cells;
  }, [viewYear, viewMonth]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of calendarEvents) {
      const list = map.get(ev.date) || [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return map;
  }, [calendarEvents]);

  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const monthEvents = useMemo(
    () =>
      calendarEvents
        .filter((ev) => ev.date.startsWith(monthPrefix))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [calendarEvents, monthPrefix],
  );

  const selectedDayEvents = eventsByDate.get(selectedDate) || [];

  const sortedProgram = useMemo(() => {
    const filtered =
      programFilter === 'weekend'
        ? weeklyProgram.filter(
            (item) =>
              item.dayOfWeek === 'Vrydag' ||
              item.dayOfWeek === 'Saterdag' ||
              item.dayOfWeek === 'Sondag',
          )
        : weeklyProgram;
    return [...filtered].sort(
      (a, b) =>
        DAYS_ORDER.indexOf(a.dayOfWeek) - DAYS_ORDER.indexOf(b.dayOfWeek),
    );
  }, [weeklyProgram, programFilter]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleCopyBirthdayWish = async (bday: BirthdayEntry) => {
    const greeting = `Veels geluk met jou verjaardag, ${bday.name}! Mag die Here jou ryklik seën in die nuwe lewensjaar. — NG Kerk Bethlehem-Wes`;
    try {
      await navigator.clipboard.writeText(greeting);
    } catch {
      // Ignore clipboard failure in restricted iframes
    }
    setCopiedBdayId(bday.id);
    await onWishBirthday(bday.id);
    setTimeout(() => setCopiedBdayId(null), 2200);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;
    await onAddEvent(newEvent);
    setNewEvent({
      title: '',
      date: selectedDate,
      time: '09:00',
      location: 'Hoofkerkgebou',
      category: 'Gemeenskap',
      description: '',
    });
    setShowAddEvent(false);
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgram.title.trim()) return;
    await onAddProgramItem(newProgram);
    setNewProgram({
      dayOfWeek: 'Woensdag',
      time: '18:00',
      title: '',
      location: 'Kerksaal',
      leader: '',
      note: '',
    });
    setShowAddProgram(false);
  };

  const handleCreateBirthday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBday.name.trim()) return;
    await onAddBirthday(newBday);
    setNewBday({
      name: '',
      dayLabel: 'Sondag',
      dateStr: '22 November',
      group: '',
    });
    setShowAddBday(false);
  };

  return (
    <section id="kalender" className="py-12 lg:py-16 border-b border-stone-200 bg-[#F7F4EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top half: Maandkalender */}
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-medium text-stone-500">
                Gemeente Beplanning
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-950 mt-1">
                Maand se Kalender
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {editMode && isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setNewEvent((prev) => ({...prev, date: selectedDate}));
                    setShowAddEvent((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  Nuwe Gebeurtenis
                </button>
              )}

              <div className="inline-flex items-center bg-white border border-stone-200 rounded-lg p-1">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  aria-label="Vorige maand"
                  className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-md cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-semibold text-stone-900 min-w-[145px] text-center tabular-nums whitespace-nowrap">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={goNextMonth}
                  aria-label="Volgende maand"
                  className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-md cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {showAddEvent && editMode && isAdmin && (
            <form
              onSubmit={handleCreateEvent}
              className="mb-6 bg-white border border-stone-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
            >
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Gebeurtenis Titel
                </label>
                <input
                  type="text"
                  required
                  placeholder="bv. Adventsdiens"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Datum
                </label>
                <input
                  type="date"
                  required
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Tyd
                </label>
                <input
                  type="text"
                  required
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Kategorie
                </label>
                <select
                  value={newEvent.category}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      category: e.target.value as EventCategory,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                >
                  <option value="Erediens">Erediens</option>
                  <option value="Kategese">Kategese</option>
                  <option value="Gemeenskap">Gemeenskap</option>
                  <option value="Jeug">Jeug</option>
                  <option value="Uitreek">Uitreek</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] cursor-pointer min-h-[38px]"
                >
                  Stoor
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="py-2 px-3 text-xs font-medium text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer min-h-[38px]"
                >
                  Sluit
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Monthly Calendar Grid */}
            <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-4 sm:p-6">
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-stone-500 pb-3 border-b border-stone-100">
                {WEEKDAY_SHORT.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 pt-2">
                {calendarDays.map((cell, idx) => {
                  if (!cell.iso || cell.dayNum === null) {
                    return <div key={`empty-${idx}`} className="h-12 sm:h-14" />;
                  }
                  const dayEvents = eventsByDate.get(cell.iso) || [];
                  const isSelected = cell.iso === selectedDate;
                  const isToday = cell.iso === TODAY_ISO;

                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      onClick={() => setSelectedDate(cell.iso!)}
                      className={`h-12 sm:h-14 rounded-lg flex flex-col items-center justify-center relative transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#1B4332] text-white'
                          : isToday
                            ? 'bg-[#F2EDE4] text-stone-950 font-semibold border border-stone-300'
                            : 'hover:bg-stone-100 text-stone-800'
                      }`}
                    >
                      <span className="text-sm tabular-nums">{cell.dayNum}</span>
                      {dayEvents.length > 0 && (
                        <span
                          className={`mt-1 w-4 h-0.5 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-[#92400E]'
                          }`}
                          aria-label={`${dayEvents.length} gebeurtenisse`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected day + Month overview list */}
            <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-5 sm:p-6">
              <div className="pb-4 border-b border-stone-200">
                <p className="text-xs font-medium text-stone-500 tabular-nums">
                  Geselekteerde Datum · {selectedDate}
                </p>
                {selectedDayEvents.length === 0 ? (
                  <p className="mt-2 text-sm text-stone-600">
                    Geen geskeduleerde kerkgebeurtenisse op hierdie dag nie.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {selectedDayEvents.map((ev) => (
                      <div key={ev.id} className="pt-2 first:pt-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-[#92400E] font-medium tabular-nums">
                              {ev.category} · {ev.time} · {ev.location}
                            </p>
                            <h3 className="text-base font-semibold text-stone-950 mt-0.5">
                              {ev.title}
                            </h3>
                          </div>
                          {editMode && isAdmin && (
                            <button
                              type="button"
                              onClick={() => onDeleteEvent(ev.id)}
                              aria-label={`Verwyder ${ev.title}`}
                              className="p-1.5 text-stone-400 hover:text-red-700 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {ev.description && (
                          <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                            {ev.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <p className="text-xs font-medium text-stone-500 mb-3">
                  Alle Gebeurtenisse in {MONTH_NAMES[viewMonth]}
                </p>
                {monthEvents.length === 0 ? (
                  <p className="text-sm text-stone-500">
                    Geen gebeurtenisse vir hierdie maand gelys nie.
                  </p>
                ) : (
                  <div className="divide-y divide-stone-100 max-h-[260px] overflow-y-auto pr-1">
                    {monthEvents.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setSelectedDate(ev.date)}
                        className={`w-full text-left py-2.5 px-2 rounded-lg flex items-baseline justify-between gap-3 transition-colors cursor-pointer ${
                          ev.date === selectedDate
                            ? 'bg-[#F2EDE4]'
                            : 'hover:bg-stone-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-900 truncate">
                            {ev.title}
                          </p>
                          <p className="text-xs text-stone-500 truncate">
                            {ev.category} · {ev.location}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-stone-600 tabular-nums whitespace-nowrap shrink-0">
                          {ev.date.slice(8)} {MONTH_NAMES[viewMonth].slice(0, 3)} · {ev.time}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom half: Week Program + Verjaardae van die Week */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4 border-t border-stone-200">
          {/* Week Program */}
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-medium text-stone-500">
                  Maandag tot Sondag
                </p>
                <h2 className="font-serif text-2xl font-medium text-stone-950 mt-0.5">
                  Weekprogram
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setProgramFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      programFilter === 'all'
                        ? 'bg-white text-stone-950 shadow-sm'
                        : 'text-stone-600 hover:text-stone-950'
                    }`}
                  >
                    Hele Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setProgramFilter('weekend')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      programFilter === 'weekend'
                        ? 'bg-white text-stone-950 shadow-sm'
                        : 'text-stone-600 hover:text-stone-950'
                    }`}
                  >
                    Naweek &amp; Sondag
                  </button>
                </div>

                {editMode && isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowAddProgram((prev) => !prev)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] whitespace-nowrap cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Voeg By
                  </button>
                )}
              </div>
            </div>

            {showAddProgram && editMode && isAdmin && (
              <form
                onSubmit={handleCreateProgram}
                className="mb-4 bg-white border border-stone-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                <select
                  value={newProgram.dayOfWeek}
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      dayOfWeek: e.target.value as DayOfWeek,
                    })
                  }
                  className="px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                >
                  {DAYS_ORDER.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  placeholder="Tyd (bv. 18:00)"
                  value={newProgram.time}
                  onChange={(e) => setNewProgram({...newProgram, time: e.target.value})}
                  className="px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder="Aktiwiteit"
                  value={newProgram.title}
                  onChange={(e) => setNewProgram({...newProgram, title: e.target.value})}
                  className="px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder="Plek"
                  value={newProgram.location}
                  onChange={(e) =>
                    setNewProgram({...newProgram, location: e.target.value})
                  }
                  className="px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder="Leier"
                  value={newProgram.leader}
                  onChange={(e) => setNewProgram({...newProgram, leader: e.target.value})}
                  className="px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
                <button
                  type="submit"
                  className="py-2 px-4 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] cursor-pointer"
                >
                  Stoor Item
                </button>
              </form>
            )}

            <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-200">
              {sortedProgram.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6"
                >
                  <div className="flex items-baseline gap-4 min-w-0">
                    <div className="w-28 shrink-0">
                      <p className="text-xs font-semibold text-[#1B4332]">
                        {item.dayOfWeek}
                      </p>
                      <p className="text-sm font-medium text-stone-900 tabular-nums">
                        {item.time}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-stone-950">
                        {item.title}
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {item.location} · {item.leader}
                        {item.note ? ` · ${item.note}` : ''}
                      </p>
                    </div>
                  </div>
                  {editMode && isAdmin && (
                    <button
                      type="button"
                      onClick={() => onDeleteProgramItem(item.id)}
                      aria-label={`Verwyder ${item.title}`}
                      className="self-end sm:self-center p-1.5 text-stone-400 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Verjaardae van die Week */}
          <div className="lg:col-span-5">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-medium text-stone-500">
                  Ons Vier Saam
                </p>
                <h2 className="font-serif text-2xl font-medium text-stone-950 mt-0.5">
                  Verjaardae van die Week
                </h2>
              </div>

              {editMode && isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAddBday((prev) => !prev)}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Voeg By
                </button>
              )}
            </div>

            {showAddBday && editMode && isAdmin && (
              <form
                onSubmit={handleCreateBirthday}
                className="mb-4 bg-white border border-stone-200 rounded-xl p-4 space-y-3"
              >
                <input
                  type="text"
                  required
                  placeholder="Naam en Van"
                  value={newBday.name}
                  onChange={(e) => setNewBday({...newBday, name: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Dag (bv. Maandag)"
                    value={newBday.dayLabel}
                    onChange={(e) => setNewBday({...newBday, dayLabel: e.target.value})}
                    className="px-3 py-2 text-sm border border-stone-300 rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Datum (bv. 23 Nov)"
                    value={newBday.dateStr}
                    onChange={(e) => setNewBday({...newBday, dateStr: e.target.value})}
                    className="px-3 py-2 text-sm border border-stone-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Groep"
                    value={newBday.group}
                    onChange={(e) => setNewBday({...newBday, group: e.target.value})}
                    className="px-3 py-2 text-sm border border-stone-300 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] cursor-pointer"
                >
                  Stoor Verjaardag
                </button>
              </form>
            )}

            <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-200">
              {birthdays.map((bday) => {
                const isCopied = copiedBdayId === bday.id;
                return (
                  <div
                    key={bday.id}
                    className="p-4 sm:px-5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-stone-500 tabular-nums">
                        {bday.dayLabel} · {bday.dateStr}
                        {bday.group &&
                        bday.group !== bday.dateStr &&
                        !bday.group.includes(bday.dateStr)
                          ? ` · ${bday.group}`
                          : ''}
                      </p>
                      <h3 className="text-sm sm:text-base font-semibold text-stone-950 truncate mt-0.5">
                        {bday.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyBirthdayWish(bday)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 min-h-[38px] cursor-pointer ${
                        isCopied
                          ? 'bg-[#1B4332] text-white border-[#1B4332]'
                          : 'bg-[#FBF9F5] text-stone-800 border-stone-200 hover:bg-[#F2EDE4]'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          Wens Gekopieer
                        </>
                      ) : (
                        <>
                          <Gift className="w-3.5 h-3.5 text-[#92400E]" aria-hidden="true" />
                          Gelukwens ({bday.wishedCount})
                          <Copy className="w-3 h-3 text-stone-400" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import {useMemo, useState} from 'react';
import {Plus, Trash2, Megaphone} from 'lucide-react';
import {
  CatechismClass,
  CatechismGradeGroup,
  ClassAnnouncement,
} from '../types/church';
import {CATECHISM_IMAGE_PATH} from '../data/defaultChurchData';
import {ResilientImage} from './ResilientImage';

interface CatechismSectionProps {
  classes: CatechismClass[];
  announcements: ClassAnnouncement[];
  editMode: boolean;
  isAdmin: boolean;
  onAddAnnouncement: (
    ann: Omit<ClassAnnouncement, 'id' | 'dateLabel'>,
  ) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
}

const FILTER_OPTIONS: Array<'Alle Klasse' | CatechismGradeGroup> = [
  'Alle Klasse',
  'Gr 1–3',
  'Gr 4–6',
  'Gr 7–9',
  'Belydenisklas',
];

export function CatechismSection({
  classes,
  announcements,
  editMode,
  isAdmin,
  onAddAnnouncement,
  onDeleteAnnouncement,
}: CatechismSectionProps) {
  const [selectedGrade, setSelectedGrade] = useState<
    'Alle Klasse' | CatechismGradeGroup
  >('Alle Klasse');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnn, setNewAnn] = useState<{
    gradeGroup: CatechismGradeGroup | 'Alle Klasse';
    title: string;
    message: string;
    author: string;
    important: boolean;
  }>({
    gradeGroup: 'Alle Klasse',
    title: '',
    message: '',
    author: 'Kategese Leier',
    important: false,
  });

  const filteredClasses = useMemo(
    () =>
      selectedGrade === 'Alle Klasse'
        ? classes
        : classes.filter((c) => c.gradeGroup === selectedGrade),
    [classes, selectedGrade],
  );

  const filteredAnnouncements = useMemo(
    () =>
      selectedGrade === 'Alle Klasse'
        ? announcements
        : announcements.filter(
            (a) => a.gradeGroup === 'Alle Klasse' || a.gradeGroup === selectedGrade,
          ),
    [announcements, selectedGrade],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnn.title.trim() || !newAnn.message.trim()) return;
    await onAddAnnouncement(newAnn);
    setNewAnn({
      gradeGroup: 'Alle Klasse',
      title: '',
      message: '',
      author: 'Kategese Leier',
      important: false,
    });
    setShowAddForm(false);
  };

  return (
    <section id="kategese" className="py-12 lg:py-16 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header + interactive grade filter */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium text-stone-500">
              Jeug &amp; Geloofsvorming · Graad 1–10
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-950 mt-1">
              Kategese Program &amp; Klas Aankondigings
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Filter kategese volgens graad"
            className="flex flex-wrap items-center gap-1 p-1 bg-[#F2EDE4] rounded-lg"
          >
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={selectedGrade === option}
                onClick={() => setSelectedGrade(option)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedGrade === option
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Kategese Klasse */}
          <div className="lg:col-span-7 space-y-4">
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs font-semibold text-[#92400E]">
                    {cls.gradeGroup} · {cls.room}
                  </p>
                  {cls.time && !cls.time.toLowerCase().includes('vakansie-reses') && (
                    <p className="text-xs font-medium text-stone-500 tabular-nums">
                      {cls.time}
                    </p>
                  )}
                </div>

                <h3 className="font-serif text-xl font-medium text-stone-950 mt-1">
                  {cls.title}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Klasleier: {cls.teacher}
                </p>

                <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-stone-500">
                      Hierdie Week se Tema
                    </p>
                    <p className="text-sm text-stone-800 mt-1 leading-relaxed">
                      {cls.currentTopic}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-stone-500">
                      Voorbereiding / Nota
                    </p>
                    <p className="text-sm text-stone-700 mt-1 leading-relaxed">
                      {cls.nextAssignment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Kids photo placeholder + Klas Aankondigings */}
          <div className="lg:col-span-5 space-y-6">
            {CATECHISM_IMAGE_PATH ? (
              <div className="rounded-xl overflow-hidden border border-stone-200 aspect-[4/3] bg-[#EBE6DF]">
                <ResilientImage
                  src={CATECHISM_IMAGE_PATH}
                  alt="Kategese en kinders by NG Kerk Bethlehem-Wes"
                  className="w-full h-full object-cover"
                  fallbackLabel="Kategese & Kinders"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-stone-300 bg-[#F4EFE6] p-6 sm:p-8 flex flex-col justify-center min-h-[180px]">
                <p className="text-xs font-semibold text-[#92400E]">
                  Kinders &amp; Kategese
                </p>
                <h3 className="font-serif text-xl font-medium text-stone-950 mt-1">
                  Foto van Ons Kinders Kom Binnekort
                </h3>
                <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
                  Hierdie spasie is gereserveer vir die nuwe foto van ons kategese-kinders.
                </p>
              </div>
            )}

            <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#1B4332]" aria-hidden="true" />
                  <h3 className="font-serif text-xl font-medium text-stone-950">
                    Klas Aankondigings
                  </h3>
                </div>

                {editMode && isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowAddForm((prev) => !prev)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] whitespace-nowrap cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Plaas
                  </button>
                )}
              </div>

              {showAddForm && editMode && isAdmin && (
                <form
                  onSubmit={handleSubmit}
                  className="py-4 border-b border-stone-200 space-y-3"
                >
                  <select
                    value={newAnn.gradeGroup}
                    onChange={(e) =>
                      setNewAnn({
                        ...newAnn,
                        gradeGroup: e.target.value as
                          | CatechismGradeGroup
                          | 'Alle Klasse',
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                  >
                    {FILTER_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Opskrif van aankondiging"
                    value={newAnn.title}
                    onChange={(e) => setNewAnn({...newAnn, title: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                  />
                  <textarea
                    rows={3}
                    required
                    placeholder="Boodskap aan ouers en leerders"
                    value={newAnn.message}
                    onChange={(e) => setNewAnn({...newAnn, message: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAnn.important}
                        onChange={(e) =>
                          setNewAnn({...newAnn, important: e.target.checked})
                        }
                      />
                      Merk as belangrik
                    </label>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] cursor-pointer"
                    >
                      Plaas Aankondiging
                    </button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-stone-100">
                {filteredAnnouncements.length === 0 ? (
                  <p className="py-6 text-sm text-stone-500">
                    Geen aankondigings vir hierdie graadgroep nie.
                  </p>
                ) : (
                  filteredAnnouncements.map((ann) => (
                    <div key={ann.id} className="py-4 first:pt-4 last:pb-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-stone-500">
                            <span
                              className={
                                ann.important
                                  ? 'font-semibold text-[#92400E]'
                                  : 'font-medium text-stone-600'
                              }
                            >
                              {ann.gradeGroup}
                            </span>
                            <span aria-hidden="true"> · </span>
                            <span>{ann.dateLabel}</span>
                            {ann.important && (
                              <>
                                <span aria-hidden="true"> · </span>
                                <span className="font-semibold text-[#92400E]">
                                  Belangrik
                                </span>
                              </>
                            )}
                          </p>
                          <h4 className="text-sm sm:text-base font-semibold text-stone-950 mt-1">
                            {ann.title}
                          </h4>
                          <p className="text-sm text-stone-700 mt-1.5 leading-relaxed">
                            {ann.message}
                          </p>
                          <p className="text-xs text-stone-500 mt-2">
                            — {ann.author}
                          </p>
                        </div>

                        {editMode && isAdmin && (
                          <button
                            type="button"
                            onClick={() => onDeleteAnnouncement(ann.id)}
                            aria-label={`Verwyder ${ann.title}`}
                            className="p-1.5 text-stone-400 hover:text-red-700 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

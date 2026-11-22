import {useMemo, useState} from 'react';
import {HeartHandshake, CheckCircle2, Trash2, Send} from 'lucide-react';
import {PrayerCategory, PrayerRequest} from '../types/church';

interface PrayerListSectionProps {
  requests: PrayerRequest[];
  isSignedIn: boolean;
  editMode: boolean;
  isAdmin: boolean;
  onAddRequest: (
    req: Omit<PrayerRequest, 'id' | 'dateLabel' | 'prayingCount' | 'isAnswered'>,
  ) => Promise<boolean>;
  onPrayTogether: (id: string) => Promise<void>;
  onToggleAnswered: (id: string) => Promise<void>;
  onDeleteRequest: (id: string) => Promise<void>;
  onSignIn: () => Promise<boolean>;
}

const PRAYER_FILTERS: Array<'Alles' | PrayerCategory | 'Beantwoord'> = [
  'Alles',
  'Gesondheid',
  'Familie',
  'Danksegging',
  'Leiding & Werk',
  'Beantwoord',
];

export function PrayerListSection({
  requests,
  isSignedIn,
  editMode,
  isAdmin,
  onAddRequest,
  onPrayTogether,
  onToggleAnswered,
  onDeleteRequest,
  onSignIn,
}: PrayerListSectionProps) {
  const [filter, setFilter] = useState<'Alles' | PrayerCategory | 'Beantwoord'>(
    'Alles',
  );
  const [prayedIds, setPrayedIds] = useState<Record<string, boolean>>({});

  const [personName, setPersonName] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('Gesondheid');
  const [requestText, setRequestText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredRequests = useMemo(() => {
    if (filter === 'Alles') return requests;
    if (filter === 'Beantwoord') return requests.filter((r) => r.isAnswered);
    return requests.filter((r) => r.category === filter);
  }, [requests, filter]);

  const handlePrayClick = async (id: string) => {
    if (prayedIds[id]) return;
    setPrayedIds((prev) => ({...prev, [id]: true}));
    await onPrayTogether(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || !requestText.trim()) return;
    setSubmitting(true);
    try {
      const ok = await onAddRequest({
        personName: personName.trim(),
        category,
        request: requestText.trim(),
        isAnonymous,
      });
      if (ok) {
        setPersonName('');
        setRequestText('');
        setIsAnonymous(false);
        setSubmittedNotice(true);
        setTimeout(() => setSubmittedNotice(false), 4000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="gebedslys"
      className="py-12 lg:py-16 border-b border-stone-200 bg-[#F7F4EE]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium text-stone-500">
              Dra Mekaar se Laste · Jakobus 5:16
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-950 mt-1">
              Gemeente Gebedslys
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Filter gebedsversoeke"
            className="flex flex-wrap items-center gap-1 p-1 bg-stone-200/70 rounded-lg"
          >
            {PRAYER_FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={filter === item}
                onClick={() => setFilter(item)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  filter === item
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Prayer cards list */}
          <div className="lg:col-span-7 space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
                <p className="text-sm text-stone-600">
                  Geen gebedsversoeke in hierdie kategorie nie.
                </p>
              </div>
            ) : (
              filteredRequests.map((item) => {
                const hasPrayed = !!prayedIds[item.id];
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-stone-500">
                        <span className="font-semibold text-[#92400E]">
                          {item.category}
                        </span>
                        <span aria-hidden="true"> · </span>
                        <span>{item.dateLabel}</span>
                        {item.isAnonymous && (
                          <>
                            <span aria-hidden="true"> · </span>
                            <span>Voorletters / Diskreet</span>
                          </>
                        )}
                        {item.isAnswered && (
                          <>
                            <span aria-hidden="true"> · </span>
                            <span className="font-semibold text-[#1B4332]">
                              Gebed Beantwoord
                            </span>
                          </>
                        )}
                      </p>

                      {editMode && isAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onToggleAnswered(item.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#1B4332] hover:underline cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {item.isAnswered ? 'Heropen' : 'Merk Beantwoord'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteRequest(item.id)}
                            aria-label={`Verwyder versoek vir ${item.personName}`}
                            className="p-1 text-stone-400 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-medium text-stone-950 mt-1.5">
                      {item.personName}
                    </h3>

                    <p className="mt-2 text-sm sm:text-base text-stone-700 leading-relaxed max-w-prose">
                      {item.request}
                    </p>

                    <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => handlePrayClick(item.id)}
                        disabled={hasPrayed}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap min-h-[38px] cursor-pointer ${
                          hasPrayed
                            ? 'bg-[#1B4332] text-white border-[#1B4332]'
                            : 'bg-[#FBF9F5] text-stone-800 border-stone-200 hover:bg-[#F2EDE4]'
                        }`}
                      >
                        <HeartHandshake className="w-4 h-4" aria-hidden="true" />
                        {hasPrayed ? 'Jy bid saam' : 'Ek bid saam'}
                        <span className="tabular-nums font-semibold">
                          ({item.prayingCount})
                        </span>
                      </button>

                      {item.isAnswered && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1B4332]">
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          Danksegging
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Add a prayer request form */}
          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-6 sm:p-7">
            <p className="text-xs font-medium text-stone-500">
              Deel met die Gemeente
            </p>
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-stone-950 mt-1">
              Sit Iemand op die Gebedslys
            </h3>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              Ons bid elke Woensdagaand tydens die gebedskring en regdeur die week
              vir elke naam op hierdie lys.
            </p>
            <div className="mt-4 p-3.5 rounded-lg bg-[#F4EFE6] border border-stone-200">
              <p className="text-xs text-stone-700 leading-relaxed">
                <span className="font-semibold text-[#92400E]">
                  Neem asseblief kennis:
                </span>{' '}
                Wanneer jy iemand op die gebedslys plaas, sal Ds. Riaan van Zyl eers
                met die persoon of gesin in aanraking kom voordat hulle naam op die
                gebedslys geplaas word.
              </p>
            </div>

            {!isSignedIn && (
              <div className="mt-4 p-4 bg-[#F4EFE6] border border-stone-200 rounded-lg">
                <p className="text-xs text-stone-700 leading-relaxed">
                  Om privaatheid te beskerm en versoeke veilig in die gemeente-databasis
                  te stoor, teken asseblief eers in met jou Google-rekening.
                </p>
                <button
                  type="button"
                  onClick={onSignIn}
                  className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] cursor-pointer"
                >
                  Teken in met Google
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="prayer-person"
                  className="block text-xs font-medium text-stone-700 mb-1.5"
                >
                  Naam (of Voorletters)
                </label>
                <input
                  id="prayer-person"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="bv. Tannie Maria / Familie K."
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-[#FBF9F5] focus:bg-white focus:outline-2 focus:outline-[#1B4332]"
                />
              </div>

              <div>
                <label
                  htmlFor="prayer-category"
                  className="block text-xs font-medium text-stone-700 mb-1.5"
                >
                  Kategorie
                </label>
                <select
                  id="prayer-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PrayerCategory)}
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-[#FBF9F5] focus:bg-white"
                >
                  <option value="Gesondheid">Gesondheid</option>
                  <option value="Familie">Familie</option>
                  <option value="Leiding & Werk">Leiding &amp; Werk</option>
                  <option value="Danksegging">Danksegging</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="prayer-request"
                  className="block text-xs font-medium text-stone-700 mb-1.5"
                >
                  Gebedsversoek
                </label>
                <textarea
                  id="prayer-request"
                  rows={4}
                  required
                  maxLength={700}
                  placeholder="Deel waaroor die gemeente kan saambid..."
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-[#FBF9F5] focus:bg-white focus:outline-2 focus:outline-[#1B4332]"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                Merk as diskreet / voorletters
              </label>

              {submittedNotice && (
                <p className="text-xs font-medium text-[#1B4332]">
                  Dankie — jou gebedsversoek is ontvang. Ds. Riaan van Zyl sal eers met
                  die betrokke persoon in aanraking kom.
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] transition-colors min-h-[44px] cursor-pointer disabled:opacity-60"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                {submitting ? 'Stoor tans...' : 'Plaas op Gebedslys'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

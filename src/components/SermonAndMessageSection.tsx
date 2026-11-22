import {useState} from 'react';
import {ExternalLink, Play, Video, Edit3, Check, X} from 'lucide-react';
import {SundaySermon, WeeklyMessage} from '../types/church';
import {SERMON_IMAGE_PATH} from '../data/defaultChurchData';
import {ResilientImage} from './ResilientImage';

interface SermonAndMessageSectionProps {
  sermons: SundaySermon[];
  weeklyMessage: WeeklyMessage;
  editMode: boolean;
  showInlinePlayer: boolean;
  onSetShowInlinePlayer: (show: boolean) => void;
  onUpdateSermon: (updated: SundaySermon) => void;
  onAddSermon: (newSermon: Omit<SundaySermon, 'id'>) => void;
  onUpdateWeeklyMessage: (updated: WeeklyMessage) => void;
}

function extractYouTubeId(url: string): string | null {
  try {
    const trimmed = url.trim();
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
    if (shortMatch) return shortMatch[1];
    const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
    if (watchMatch) return watchMatch[1];
    const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
    if (embedMatch) return embedMatch[1];
    const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{6,})/);
    if (liveMatch) return liveMatch[1];
  } catch {
    return null;
  }
  return null;
}

export function SermonAndMessageSection({
  sermons,
  weeklyMessage,
  editMode,
  showInlinePlayer,
  onSetShowInlinePlayer,
  onUpdateSermon,
  onAddSermon,
  onUpdateWeeklyMessage,
}: SermonAndMessageSectionProps) {
  const [selectedSermonId, setSelectedSermonId] = useState<string>(
    sermons.find((s) => s.isCurrent)?.id || sermons[0]?.id || '',
  );
  const [editingSermon, setEditingSermon] = useState(false);
  const [editingMessage, setEditingMessage] = useState(false);

  const activeSermon =
    sermons.find((s) => s.id === selectedSermonId) || sermons[0];

  const [sermonForm, setSermonForm] = useState<SundaySermon>(activeSermon);
  const [msgForm, setMsgForm] = useState<{
    title: string;
    scripture: string;
    scriptureText: string;
    bodyText: string;
    author: string;
    dateLabel: string;
  }>({
    title: weeklyMessage.title,
    scripture: weeklyMessage.scripture,
    scriptureText: weeklyMessage.scriptureText,
    bodyText: weeklyMessage.body.join('\n\n'),
    author: weeklyMessage.author,
    dateLabel: weeklyMessage.dateLabel,
  });

  const videoId = activeSermon ? extractYouTubeId(activeSermon.youtubeUrl) : null;

  const openSermonEditor = () => {
    setSermonForm(activeSermon);
    setEditingSermon(true);
  };

  const handleSaveSermon = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSermon(sermonForm);
    setEditingSermon(false);
  };

  const handleCreateNewSundaySermon = () => {
    const newItem: Omit<SundaySermon, 'id'> = {
      dateLabel: 'Nuwe Sondag Erediens',
      title: 'Nuwe Preektitel',
      theme: 'Sondag Preek-Tema',
      scripture: 'Skriflesing',
      preacher: 'Ds. Riaan van Zyl',
      organist: 'Estelle Visser',
      doorCollection: 'Vennootskappe',
      youtubeUrl: 'https://youtu.be/bKzyAezegqw',
      summary: 'Kort opsomming van Sondag se preek vir NG Kerk Bethlehem-Wes.',
      isCurrent: true,
    };
    onAddSermon(newItem);
  };

  const handleSaveMessage = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWeeklyMessage({
      title: msgForm.title.trim(),
      scripture: msgForm.scripture.trim(),
      scriptureText: msgForm.scriptureText.trim(),
      body: msgForm.bodyText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
      author: msgForm.author.trim(),
      dateLabel: msgForm.dateLabel.trim(),
    });
    setEditingMessage(false);
  };

  return (
    <section id="preek" className="py-12 lg:py-16 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left: Vorige Sondag se Erediens Opname & YouTube */}
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-baseline justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-medium text-stone-500">
                  Vorige Sondag se Opname · Studio-opname
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-950 mt-1 text-balance">
                  Erediens Opname &amp; YouTube Skakel
                </h2>
              </div>

              {editMode && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openSermonEditor}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded-lg hover:bg-[#F2EDE4] whitespace-nowrap cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                    Wysig Preek / YouTube
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateNewSundaySermon}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] whitespace-nowrap cursor-pointer"
                  >
                    + Nuwe Sondag
                  </button>
                </div>
              )}
            </div>

            {activeSermon && (
              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <div className="relative aspect-video bg-stone-900">
                  {showInlinePlayer && videoId ? (
                    <div className="w-full h-full relative">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                        title={activeSermon.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <button
                        type="button"
                        onClick={() => onSetShowInlinePlayer(false)}
                        aria-label="Sluit videospeler"
                        className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-black/75 text-white rounded-md hover:bg-black cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Sluit Speler
                      </button>
                    </div>
                  ) : (
                    <>
                      <ResilientImage
                        src={SERMON_IMAGE_PATH}
                        alt={`Kansel en orrel binne NG Kerk Bethlehem-Wes vir erediens: ${activeSermon.title}`}
                        className="w-full h-full object-cover"
                        fallbackLabel={activeSermon.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 sm:p-7">
                        <p className="text-xs text-stone-200 font-medium">
                          {activeSermon.dateLabel} · {activeSermon.preacher}
                        </p>
                        <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white mt-1 text-balance">
                          {activeSermon.title}
                        </h3>
                        <p className="text-sm text-stone-200 mt-1">
                          {activeSermon.theme}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Details + actions */}
                <div className="p-5 sm:p-7">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg bg-[#F4EFE6] border border-stone-200 text-xs">
                    <div>
                      <p className="text-stone-500">Prediker</p>
                      <p className="font-semibold text-stone-950 mt-0.5">
                        {activeSermon.preacher}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-500">Orrelis</p>
                      <p className="font-semibold text-stone-950 mt-0.5">
                        {activeSermon.organist || 'Estelle Visser'}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-500">Deurkollekte</p>
                      <p className="font-semibold text-stone-950 mt-0.5">
                        {activeSermon.doorCollection || 'Vennootskappe'}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm sm:text-base text-stone-700 leading-relaxed">
                    {activeSermon.summary}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {videoId && (
                      <button
                        type="button"
                        onClick={() => onSetShowInlinePlayer(!showInlinePlayer)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] transition-colors whitespace-nowrap shrink-0 min-h-[42px] cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                        {showInlinePlayer ? 'Versteek Speler' : 'Speel Opname Hier'}
                      </button>
                    )}

                    <a
                      href={activeSermon.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-800 bg-[#F2EDE4] rounded-lg hover:bg-[#E7E0D3] transition-colors whitespace-nowrap shrink-0 min-h-[42px]"
                    >
                      <Video className="w-4 h-4 text-[#1B4332]" aria-hidden="true" />
                      Kyk op YouTube
                      <ExternalLink className="w-3.5 h-3.5 text-stone-500" aria-hidden="true" />
                    </a>
                  </div>

                  {/* Sermon Editor Form */}
                  {editingSermon && (
                    <form
                      onSubmit={handleSaveSermon}
                      className="mt-6 pt-6 border-t border-stone-200 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-stone-900">
                          Dateer Preek &amp; YouTube Skakel Op
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingSermon(false)}
                          className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                        >
                          Kanselleer
                        </button>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Plak die YouTube-video se skakel van die opname hieronder om dit
                        direk op die webblad te speel.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">
                            Preektitel / Tema
                          </label>
                          <input
                            type="text"
                            required
                            value={sermonForm.title}
                            onChange={(e) =>
                              setSermonForm({...sermonForm, title: e.target.value})
                            }
                            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">
                            Datum
                          </label>
                          <input
                            type="text"
                            required
                            value={sermonForm.dateLabel}
                            onChange={(e) =>
                              setSermonForm({...sermonForm, dateLabel: e.target.value})
                            }
                            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">
                            Prediker
                          </label>
                          <input
                            type="text"
                            required
                            value={sermonForm.preacher}
                            onChange={(e) =>
                              setSermonForm({...sermonForm, preacher: e.target.value})
                            }
                            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">
                            Orrelis
                          </label>
                          <input
                            type="text"
                            value={sermonForm.organist || ''}
                            onChange={(e) =>
                              setSermonForm({...sermonForm, organist: e.target.value})
                            }
                            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">
                            Deurkollekte
                          </label>
                          <input
                            type="text"
                            value={sermonForm.doorCollection || ''}
                            onChange={(e) =>
                              setSermonForm({
                                ...sermonForm,
                                doorCollection: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 mb-1">
                            Skriflesing / Geleentheid
                          </label>
                          <input
                            type="text"
                            required
                            value={sermonForm.scripture}
                            onChange={(e) =>
                              setSermonForm({...sermonForm, scripture: e.target.value})
                            }
                            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-stone-600 mb-1">
                            YouTube Video Skakel
                          </label>
                          <input
                            type="url"
                            required
                            placeholder="https://youtu.be/..."
                            value={sermonForm.youtubeUrl}
                            onChange={(e) =>
                              setSermonForm({...sermonForm, youtubeUrl: e.target.value})
                            }
                            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          Kort Opsomming
                        </label>
                        <textarea
                          rows={2}
                          value={sermonForm.summary}
                          onChange={(e) =>
                            setSermonForm({...sermonForm, summary: e.target.value})
                          }
                          className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Stoor Preek
                      </button>
                    </form>
                  )}

                  {/* Beskikbare Opnames Selector */}
                  {sermons.length > 1 && (
                    <div className="mt-7 pt-5 border-t border-stone-200">
                      <p className="text-xs font-medium text-stone-500 mb-3">
                        Beskikbare Erediens Opnames
                      </p>
                      <div className="divide-y divide-stone-100">
                        {sermons.map((sermon) => {
                          const isSelected = sermon.id === activeSermon.id;
                          return (
                            <button
                              key={sermon.id}
                              type="button"
                              onClick={() => {
                                setSelectedSermonId(sermon.id);
                                onSetShowInlinePlayer(false);
                              }}
                              className={`w-full text-left py-2.5 px-3 rounded-lg flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#F2EDE4] text-stone-950'
                                  : 'hover:bg-stone-50 text-stone-700'
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {sermon.title}
                                </p>
                                <p className="text-xs text-stone-500 truncate">
                                  {sermon.dateLabel} · {sermon.scripture}
                                </p>
                              </div>
                              <span className="text-xs font-medium text-[#1B4332] whitespace-nowrap shrink-0">
                                {isSelected ? 'Gekies' : 'Kies'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Vandag se Boodskap / Herderlike Woord */}
          <div className="lg:col-span-5">
            <div className="flex items-baseline justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-medium text-stone-500">
                  Vandag se Erediens &amp; Herderlike Woord
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-950 mt-1">
                  Boodskap vir die Week
                </h2>
              </div>
              {editMode && (
                <button
                  type="button"
                  onClick={() => {
                    setMsgForm({
                      title: weeklyMessage.title,
                      scripture: weeklyMessage.scripture,
                      scriptureText: weeklyMessage.scriptureText,
                      bodyText: weeklyMessage.body.join('\n\n'),
                      author: weeklyMessage.author,
                      dateLabel: weeklyMessage.dateLabel,
                    });
                    setEditingMessage((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded-lg hover:bg-[#F2EDE4] whitespace-nowrap cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                  {editingMessage ? 'Sluit' : 'Wysig Boodskap'}
                </button>
              )}
            </div>

            <article className="bg-[#F4EFE6] border border-stone-200 rounded-xl p-6 sm:p-8">
              <p className="text-xs text-stone-500 font-medium">
                {weeklyMessage.dateLabel} · {weeklyMessage.author}
              </p>

              <h3 className="font-serif text-xl sm:text-2xl font-medium text-stone-950 mt-2 text-balance">
                {weeklyMessage.title}
              </h3>

              <blockquote className="my-5 py-4 border-y border-stone-300">
                <p className="font-serif italic text-base sm:text-lg text-stone-800 leading-relaxed">
                  &ldquo;{weeklyMessage.scriptureText}&rdquo;
                </p>
                <footer className="mt-2 text-xs font-medium text-[#92400E]">
                  — {weeklyMessage.scripture}
                </footer>
              </blockquote>

              <div className="space-y-4 text-[15px] sm:text-base text-stone-700 leading-[1.7] max-w-prose">
                {weeklyMessage.body.map((paragraph, index) => (
                  <p
                    key={index}
                    className={
                      index === 0
                        ? 'first-letter:text-4xl first-letter:font-serif first-letter:font-semibold first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:leading-none first-letter:text-[#1B4332]'
                        : ''
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {editingMessage && (
                <form
                  onSubmit={handleSaveMessage}
                  className="mt-6 pt-6 border-t border-stone-300 space-y-3"
                >
                  <h4 className="text-sm font-semibold text-stone-900">
                    Wysig Weeklikse Boodskap
                  </h4>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Titel
                    </label>
                    <input
                      type="text"
                      required
                      value={msgForm.title}
                      onChange={(e) => setMsgForm({...msgForm, title: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        Skrifverwysing
                      </label>
                      <input
                        type="text"
                        required
                        value={msgForm.scripture}
                        onChange={(e) => setMsgForm({...msgForm, scripture: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        Skrywer
                      </label>
                      <input
                        type="text"
                        required
                        value={msgForm.author}
                        onChange={(e) => setMsgForm({...msgForm, author: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Teksvers
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={msgForm.scriptureText}
                      onChange={(e) => setMsgForm({...msgForm, scriptureText: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Boodskap (skei paragrawe met &apos;n leë lyn)
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={msgForm.bodyText}
                      onChange={(e) => setMsgForm({...msgForm, bodyText: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Stoor Boodskap
                  </button>
                </form>
              )}
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

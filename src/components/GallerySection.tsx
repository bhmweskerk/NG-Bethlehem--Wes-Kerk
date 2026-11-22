import {useState} from 'react';
import {Camera, ExternalLink, Plus, Trash2, Edit3, Check, X} from 'lucide-react';
import {GalleryPhoto} from '../types/church';
import {ResilientImage} from './ResilientImage';

interface GallerySectionProps {
  photos: GalleryPhoto[];
  facebookUrl: string;
  editMode: boolean;
  isAdmin: boolean;
  onAddPhoto: (photo: Omit<GalleryPhoto, 'id'>) => Promise<void>;
  onDeletePhoto: (id: string) => Promise<void>;
  onUpdateFacebookUrl: (url: string) => Promise<void>;
}

export function GallerySection({
  photos,
  facebookUrl,
  editMode,
  isAdmin,
  onAddPhoto,
  onDeletePhoto,
  onUpdateFacebookUrl,
}: GallerySectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFb, setEditingFb] = useState(false);
  const [fbInput, setFbInput] = useState(facebookUrl);
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);

  const [newPhoto, setNewPhoto] = useState({
    title: '',
    eventLabel: 'Kerssangdiens',
    dateLabel: 'November 2026',
    imageUrl: '',
    caption: '',
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.title.trim() || !newPhoto.imageUrl.trim()) return;
    await onAddPhoto(newPhoto);
    setNewPhoto({
      title: '',
      eventLabel: 'Kerssangdiens',
      dateLabel: 'November 2026',
      imageUrl: '',
      caption: '',
    });
    setShowAddForm(false);
  };

  const handleSaveFb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbInput.trim()) return;
    await onUpdateFacebookUrl(fbInput.trim());
    setEditingFb(false);
  };

  return (
    <section id="galery" className="py-12 lg:py-16 border-b border-stone-200 bg-[#FBF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium text-stone-500">
              Vorige Geleenthede &amp; Gemeentelewe
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-950 mt-1">
              Foto-galery &amp; Facebook-blad
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
              Kyk terug na kosbare oomblikke soos ons Kerssangdiens en gemeentebyeenkomste, of
              besoek NG Kerk Bethlehem-Wes se Facebook-blad vir nog foto&apos;s en nuus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {editMode && isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setShowAddForm((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  Voeg Foto By
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFbInput(facebookUrl);
                    setEditingFb((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded-lg hover:bg-[#F2EDE4] whitespace-nowrap cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                  Wysig Facebook Skakel
                </button>
              </>
            )}

            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] transition-colors whitespace-nowrap min-h-[42px]"
            >
              <Camera className="w-4 h-4" aria-hidden="true" />
              Besoek Facebook-blad
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {editingFb && editMode && isAdmin && (
          <form
            onSubmit={handleSaveFb}
            className="mb-6 bg-white border border-stone-200 rounded-xl p-5 flex flex-col sm:flex-row items-end gap-3"
          >
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-stone-600 mb-1">
                NG Kerk Bethlehem-Wes Facebook-blad Skakel (URL)
              </label>
              <input
                type="url"
                required
                placeholder="https://www.facebook.com/..."
                value={fbInput}
                onChange={(e) => setFbInput(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] cursor-pointer min-h-[38px]"
              >
                <Check className="w-3.5 h-3.5" />
                Stoor
              </button>
              <button
                type="button"
                onClick={() => setEditingFb(false)}
                className="px-3 py-2 text-xs font-medium text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer min-h-[38px]"
              >
                Sluit
              </button>
            </div>
          </form>
        )}

        {showAddForm && editMode && isAdmin && (
          <form
            onSubmit={handleAddSubmit}
            className="mb-8 bg-white border border-stone-200 rounded-xl p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stone-900">
                Voeg Foto van Geleentheid By
              </h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                Kanselleer
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Foto Titel
                </label>
                <input
                  type="text"
                  required
                  placeholder="bv. Kerssangdiens Koor"
                  value={newPhoto.title}
                  onChange={(e) => setNewPhoto({...newPhoto, title: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Geleentheid
                </label>
                <input
                  type="text"
                  required
                  placeholder="bv. Kerssangdiens"
                  value={newPhoto.eventLabel}
                  onChange={(e) => setNewPhoto({...newPhoto, eventLabel: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Datum
                </label>
                <input
                  type="text"
                  required
                  placeholder="bv. 15 November 2026"
                  value={newPhoto.dateLabel}
                  onChange={(e) => setNewPhoto({...newPhoto, dateLabel: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Foto Skakel (URL of /assets/...)
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={newPhoto.imageUrl}
                  onChange={(e) => setNewPhoto({...newPhoto, imageUrl: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Kort Beskrywing
                </label>
                <input
                  type="text"
                  placeholder="Kort byskrif oor die geleentheid"
                  value={newPhoto.caption}
                  onChange={(e) => setNewPhoto({...newPhoto, caption: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Stoor in Galery
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <article
              key={photo.id}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col"
            >
              <button
                type="button"
                onClick={() => setLightboxPhoto(photo)}
                className="relative aspect-[4/3] bg-[#EBE6DF] overflow-hidden cursor-pointer group text-left"
              >
                <ResilientImage
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  fallbackLabel={photo.title}
                />
              </button>

              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-[#92400E]">
                      {photo.eventLabel} · {photo.dateLabel}
                    </p>
                    {editMode && isAdmin && (
                      <button
                        type="button"
                        onClick={() => onDeletePhoto(photo.id)}
                        aria-label={`Verwyder ${photo.title}`}
                        className="p-1 text-stone-400 hover:text-red-700 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <h3 className="font-serif text-lg font-medium text-stone-950 mt-1">
                    {photo.title}
                  </h3>
                  {photo.caption && (
                    <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
                      {photo.caption}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Lightbox modal */}
      {lightboxPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxPhoto.title}
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl max-w-3xl w-full overflow-hidden shadow-xl"
          >
            <div className="relative bg-stone-900 max-h-[70vh] overflow-hidden">
              <ResilientImage
                src={lightboxPhoto.imageUrl}
                alt={lightboxPhoto.title}
                className="w-full h-full max-h-[70vh] object-contain mx-auto"
                fallbackLabel={lightboxPhoto.title}
              />
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                aria-label="Sluit foto"
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold text-[#92400E]">
                {lightboxPhoto.eventLabel} · {lightboxPhoto.dateLabel}
              </p>
              <h3 className="font-serif text-xl font-medium text-stone-950 mt-0.5">
                {lightboxPhoto.title}
              </h3>
              {lightboxPhoto.caption && (
                <p className="text-sm text-stone-600 mt-1">{lightboxPhoto.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import {ArrowRight, Edit3, Check, Play, LogIn, LogOut} from 'lucide-react';
import {HERO_IMAGE_PATH} from '../data/defaultChurchData';
import {ResilientImage} from './ResilientImage';

interface HeroSectionProps {
  editMode: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  onToggleEditMode: () => void;
  onSignIn: () => Promise<boolean>;
  onSignOut: () => Promise<void>;
  onNavigate: (sectionId: string) => void;
  onPlayCurrentSermon: () => void;
}

export function HeroSection({
  editMode,
  isAdmin,
  userEmail,
  onToggleEditMode,
  onSignIn,
  onSignOut,
  onNavigate,
  onPlayCurrentSermon,
}: HeroSectionProps) {
  return (
    <section id="top" className="border-b border-stone-200 bg-[#FBF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 lg:pt-12 lg:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Editorial copy column */}
          <div className="lg:col-span-7 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs font-medium tracking-wide text-stone-500 mb-4">
                NG Bethlehem-Wes · 1927 – 2027
              </p>
              <h1
                className="font-serif font-medium tracking-tight text-stone-950 text-balance leading-[1.08]"
                style={{fontSize: 'clamp(2.25rem, 4vw, 3.65rem)'}}
              >
                Die verlede · Die hede · Die toekoms
              </h1>
              <p className="mt-5 text-base sm:text-lg text-stone-600 leading-relaxed max-w-[62ch]">
                Baie welkom by NG Kerk Bethlehem-Wes se digitale tuiste. Vind hierdie week se
                afkondigings, verjaardae, gebedsversoeke, weekprogram, kategese-inligting,
                Sondag se preek op YouTube en maklike maniere om by te dra op een plek.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  onNavigate('preek');
                  onPlayCurrentSermon();
                }}
                className="inline-flex items-center gap-2.5 px-5 py-3 text-sm font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] transition-colors whitespace-nowrap shrink-0 min-h-[44px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332]"
              >
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                Kyk Sondag se Preek
              </button>

              <button
                type="button"
                onClick={() => onNavigate('kalender')}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-stone-800 bg-white border border-stone-200 rounded-lg hover:bg-[#F2EDE4] transition-colors whitespace-nowrap shrink-0 min-h-[44px] cursor-pointer"
              >
                Sien Weekprogram &amp; Kalender
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Sanctuary focal image */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative flex-1 min-h-[260px] lg:min-h-[340px] rounded-xl overflow-hidden border border-stone-200 bg-[#EBE6DF]">
              <ResilientImage
                src={HERO_IMAGE_PATH}
                alt="Buiteaansig van NG Kerk Bethlehem-Wes se kerkgebou en toring"
                className="w-full h-full lg:h-full object-cover object-center"
                fallbackLabel="NG Kerk Bethlehem-Wes"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-5">
                <p className="text-xs text-stone-200 font-medium">
                  Erediens Sondae 09:30
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Operational Utility Strip + Auth & Admin controls */}
        <div className="mt-10 pt-6 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
          <div className="py-1">
            <p className="text-xs text-stone-500">Sondag 22 November</p>
            <p className="text-sm font-semibold text-stone-900 tabular-nums mt-0.5">
              09:30 (Geen tee ná diens)
            </p>
          </div>
          <div className="py-1">
            <p className="text-xs text-stone-500">Bybelstudie</p>
            <p className="text-sm font-semibold text-stone-900 tabular-nums mt-0.5">
              Dinsdae · 10:00 &amp; 14:00
            </p>
          </div>
          <div className="py-1">
            <p className="text-xs text-stone-500">Bergpragdiens</p>
            <p className="text-sm font-semibold text-stone-900 tabular-nums mt-0.5">
              Dinsdae · 10:30
            </p>
          </div>
          <div className="py-1">
            <p className="text-xs text-stone-500">Bybelskool</p>
            <p className="text-sm font-semibold text-stone-900 tabular-nums mt-0.5">
              Woensdae · 18:00
            </p>
          </div>
          <div className="lg:col-span-2 flex flex-wrap items-center sm:justify-end gap-2">
            {userEmail ? (
              <>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={onToggleEditMode}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer ${
                      editMode
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-[#F2EDE4]'
                    }`}
                  >
                    {editMode ? (
                      <>
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        Klaar met Wysig
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                        Bestuur Inhoud
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  Teken Uit
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded-lg hover:bg-[#F2EDE4] whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#1B4332]" aria-hidden="true" />
                Lidmaat / Admin Inteken
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import {useState} from 'react';
import {Menu, X} from 'lucide-react';
import {ChurchLogo} from './ChurchLogo';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
}

const NAV_ITEMS = [
  {id: 'preek', label: 'Preek & Boodskap'},
  {id: 'kalender', label: 'Kalender & Week'},
  {id: 'kategese', label: 'Kategese'},
  {id: 'gebedslys', label: 'Gebedslys'},
  {id: 'galery', label: 'Galery'},
  {id: 'donasies', label: 'Gee & Kontak'},
];

export function Header({onNavigate}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (id: string) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Logo + Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('top');
          }}
          className="inline-flex items-center gap-2.5 font-serif text-xl font-semibold tracking-tight text-stone-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4332]"
        >
          <ChurchLogo className="w-9 h-9 shrink-0" />
          <span>NG Kerk Bethlehem-Wes</span>
        </a>

        {/* Zone 2: 5 clean single-line text nav links */}
        <nav
          aria-label="Hoofnavigasie"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-600"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id);
              }}
              className="hover:text-stone-950 hover:underline underline-offset-4 decoration-stone-400 transition-colors whitespace-nowrap shrink-0 py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4332]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action + mobile menu trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('donasies')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332]"
          >
            Maak &apos;n Bydrae
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Sluit kieslys' : 'Maak kieslys oop'}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-[#FBF9F5] px-4 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id);
              }}
              className="block px-3 py-2.5 text-sm font-medium text-stone-800 hover:bg-[#F2EDE4] rounded-lg whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2 border-t border-stone-200 mt-2">
            <button
              type="button"
              onClick={() => handleLinkClick('donasies')}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] transition-colors whitespace-nowrap cursor-pointer"
            >
              Maak &apos;n Bydrae
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

import {ChurchLogo} from './ChurchLogo';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export function Footer({onNavigate}: FooterProps) {
  return (
    <footer className="bg-[#F2EDE4] border-t border-stone-200 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-3.5">
          <ChurchLogo className="w-11 h-11 shrink-0" />
          <div>
            <p className="font-serif text-lg font-semibold text-stone-950">
              NG Kerk Bethlehem-Wes
            </p>
            <p className="text-xs font-medium text-[#1B4332] mt-0.5">
              Die verlede · Die hede · Die toekoms
            </p>
            <p className="text-xs text-stone-600 mt-1">
              Kerkkantoor Ma–Vr 08:00–12:00 · 065 630 2683 · Sondag Erediens 09:30
            </p>
          </div>
        </div>

        <nav
          aria-label="Voetskrif navigasie"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-stone-700"
        >
          {[
            {id: 'preek', label: 'Sondag Preek'},
            {id: 'kalender', label: 'Kalender & Week'},
            {id: 'kategese', label: 'Kategese'},
            {id: 'gebedslys', label: 'Gebedslys'},
            {id: 'galery', label: 'Galery & Facebook'},
            {id: 'donasies', label: 'Bydraes & Fondse'},
            {id: 'kontak', label: 'Kontak Ons'},
          ].map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(link.id);
              }}
              className="hover:text-stone-950 hover:underline underline-offset-4 whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-xs text-stone-500">
          &copy; {new Date().getFullYear()} NG Kerk Bethlehem-Wes
        </p>
      </div>
    </footer>
  );
}

import {useState} from 'react';
import {
  Check,
  Copy,
  Landmark,
  MapPin,
  Phone,
  Clock,
  Send,
  QrCode,
  CalendarOff,
  Mail,
  ExternalLink,
} from 'lucide-react';
import {BankDetails, ContactInfo, DonationRecord} from '../types/church';
import {ChurchLocationMap} from './ChurchLocationMap';

interface DonationsAndContactSectionProps {
  bankDetails: BankDetails;
  contactInfo: ContactInfo;
  donations: DonationRecord[];
  isSignedIn: boolean;
  onRecordDonation: (
    pledge: Omit<DonationRecord, 'id' | 'dateLabel'>,
  ) => Promise<boolean>;
  onSubmitContact: (msg: {
    senderName: string;
    senderEmail: string;
    subject: string;
    message: string;
  }) => Promise<boolean>;
  onSignIn: () => Promise<boolean>;
}

const FUNDS = [
  'Dankoffer',
  'Tiende',
  'Barmhartigheid',
  'Gebouefonds',
  'Kategese & Jeug',
  'Sending & Instansies',
];

const PRESET_AMOUNTS = [150, 300, 500, 1000];

export function DonationsAndContactSection({
  bankDetails,
  contactInfo,
  donations,
  isSignedIn,
  onRecordDonation,
  onSubmitContact,
  onSignIn,
}: DonationsAndContactSectionProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Contribution builder state
  const [selectedFund, setSelectedFund] = useState<string>('Dankoffer');
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('500');
  const [donorSurname, setDonorSurname] = useState<string>('');
  const [donorWard, setDonorWard] = useState<string>('');
  const [method, setMethod] = useState<'EFT' | 'SnapScan / QR'>('EFT');
  const [receiptSummary, setReceiptSummary] = useState<{
    fund: string;
    amount: number;
    reference: string;
    method: 'EFT' | 'SnapScan / QR';
  } | null>(null);

  // Contact form state
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('Algemene Navraag');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [sendingContact, setSendingContact] = useState(false);

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback ignored if clipboard blocked
    }
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePresetClick = (val: number) => {
    setAmount(val);
    setCustomAmount(String(val));
  };

  const computedReference = (() => {
    const cleanName = donorSurname
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, '')
      .slice(0, 14);
    const cleanWard = donorWard
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);
    if (cleanName && cleanWard) return `${cleanName} W${cleanWard}`;
    if (cleanName) return `${cleanName}`;
    return 'Naam en wykno.';
  })();

  const handleCreateContributionSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(customAmount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) return;

    const finalRef =
      computedReference === 'Naam en wykno.'
        ? selectedFund.toUpperCase().slice(0, 14)
        : computedReference;

    setReceiptSummary({
      fund: selectedFund,
      amount: numericAmount,
      reference: finalRef,
      method,
    });

    if (isSignedIn) {
      await onRecordDonation({
        fund: selectedFund,
        amount: numericAmount,
        reference: finalRef,
        method,
      });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !contactMessage.trim()) {
      return;
    }
    setSendingContact(true);
    try {
      const ok = await onSubmitContact({
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        subject,
        message: contactMessage.trim(),
      });
      if (ok) {
        setSenderName('');
        setSenderEmail('');
        setContactMessage('');
        setContactSent(true);
        setTimeout(() => setContactSent(false), 5000);
      }
    } finally {
      setSendingContact(false);
    }
  };

  return (
    <section id="donasies" className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Part 1: Donasies, Dankoffers & Bankbesonderhede */}
        <div>
          <div className="max-w-2xl mb-8">
            <p className="text-xs font-medium text-stone-500">
              Vrygewigheid &amp; Rentmeesterskap · 2 Korintiërs 9:7
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-950 mt-1 text-balance">
              Donasies, Dankoffers &amp; Gemeentefondse
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600 leading-relaxed">
              Gebruik NG Gemeente Bethlehem-Wes se amptelike bankbesonderhede vir EFT,
              ons koöperasie-kodes (VKB / AFGRI), of maak enige bydrae vir die fonds
              van jou keuse hieronder — enige bedrag is aanvaarbaar.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: EFT Bankbesonderhede + VKB & AFGRI */}
            <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-6 sm:p-7">
              <div className="flex items-center gap-2.5 pb-4 border-b border-stone-200">
                <Landmark className="w-5 h-5 text-[#1B4332]" aria-hidden="true" />
                <h3 className="font-serif text-xl font-medium text-stone-950">
                  Bankbesonderhede &amp; Kodes
                </h3>
              </div>

              <dl className="divide-y divide-stone-100 mt-2">
                {[
                  {label: 'Rekeningnaam', value: bankDetails.accountName, mono: false},
                  {label: 'Bank & Tipe', value: `${bankDetails.bankName} — ${bankDetails.accountType}`, mono: false},
                  {
                    label: 'Rekeningnommer',
                    value: bankDetails.accountNumber,
                    mono: true,
                  },
                  {label: 'Takkode', value: bankDetails.branchCode, mono: true},
                  {label: 'VKB Nommer', value: bankDetails.vkbNumber, mono: true},
                  {label: 'AFGRI Nommer', value: bankDetails.afgriNumber, mono: true},
                ].map((row) => {
                  const isCopied = copiedField === row.label;
                  return (
                    <div
                      key={row.label}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div>
                        <dt className="text-xs text-stone-500">{row.label}</dt>
                        <dd
                          className={`text-sm sm:text-base font-semibold text-stone-950 mt-0.5 ${
                            row.mono ? 'font-mono tabular-nums' : ''
                          }`}
                        >
                          {row.value}
                        </dd>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(row.label, row.value)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-[#FBF9F5] border border-stone-200 rounded-md hover:bg-[#F2EDE4] whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#1B4332]" />
                            Gekopieer
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-400" />
                            Kopieer
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </dl>

              <p className="mt-4 pt-4 border-t border-stone-200 text-xs font-medium text-[#92400E] leading-relaxed">
                {bankDetails.referenceGuide}
              </p>
            </div>

            {/* Right: Aanlyn Bydrae & EFT Verwysing */}
            <div className="lg:col-span-7 bg-[#F4EFE6] border border-stone-200 rounded-xl p-6 sm:p-8">
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-stone-950">
                Maak &apos;n Eenmalige of Gereelde Bydrae
              </h3>
              <p className="text-sm text-stone-600 mt-1">
                Kies die fonds, en skep jou EFT-verwysing (Naam en Wyknommer). Enige bydrae is aanvaarbaar.
              </p>

              <form onSubmit={handleCreateContributionSummary} className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-2">
                    1. Kies Fonds / Doel
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FUNDS.map((fund) => (
                      <button
                        key={fund}
                        type="button"
                        onClick={() => setSelectedFund(fund)}
                        className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                          selectedFund === fund
                            ? 'bg-[#1B4332] text-white border-[#1B4332]'
                            : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {fund}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contribution-amount"
                    className="block text-xs font-medium text-stone-700 mb-1.5"
                  >
                    2. Bedrag (ZAR) — Enige bydrae is welkom
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <input
                      id="contribution-amount"
                      type="number"
                      min="1"
                      step="any"
                      required
                      placeholder="bv. 100"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        const num = parseFloat(e.target.value);
                        if (!Number.isNaN(num)) setAmount(num);
                      }}
                      className="w-full sm:w-48 px-3.5 py-2.5 text-sm font-semibold border border-stone-300 rounded-lg bg-white tabular-nums"
                    />
                    <div className="flex flex-wrap gap-2">
                      {PRESET_AMOUNTS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handlePresetClick(preset)}
                          className={`px-3 py-2 text-xs font-medium rounded-md border tabular-nums cursor-pointer ${
                            amount === preset
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          R{preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="donor-surname"
                      className="block text-xs font-medium text-stone-700 mb-1.5"
                    >
                      3. Jou Naam / Van
                    </label>
                    <input
                      id="donor-surname"
                      type="text"
                      maxLength={40}
                      placeholder="bv. Van Zyl"
                      value={donorSurname}
                      onChange={(e) => setDonorSurname(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="donor-ward"
                      className="block text-xs font-medium text-stone-700 mb-1.5"
                    >
                      Wyknommer
                    </label>
                    <input
                      id="donor-ward"
                      type="text"
                      maxLength={12}
                      placeholder="bv. 12"
                      value={donorWard}
                      onChange={(e) => setDonorWard(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-white tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1.5">
                      Betaalmetode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['EFT', 'SnapScan / QR'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMethod(m)}
                          className={`py-2.5 px-2 text-xs font-medium rounded-lg border whitespace-nowrap cursor-pointer ${
                            method === m
                              ? 'bg-white text-stone-950 border-stone-900 font-semibold'
                              : 'bg-white/60 text-stone-600 border-stone-200'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-1 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-xs text-stone-600">
                    Verwysing:{' '}
                    <span className="font-mono font-semibold text-stone-950">
                      {computedReference}
                    </span>
                  </p>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] transition-colors whitespace-nowrap min-h-[44px] cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" aria-hidden="true" />
                    Genereer Betalingsopsomming
                  </button>
                </div>
              </form>

              {receiptSummary && (
                <div className="mt-6 pt-6 border-t border-stone-300 bg-white rounded-xl p-5 border border-stone-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#1B4332]">
                        Betalingsopsomming Gereed
                      </p>
                      <h4 className="font-serif text-lg font-medium text-stone-950 mt-0.5 tabular-nums">
                        R{receiptSummary.amount.toLocaleString('en-ZA')} · {receiptSummary.fund}
                      </h4>
                      <p className="text-xs text-stone-600 mt-1">
                        ABSA Rek: <span className="font-mono font-semibold">{bankDetails.accountNumber}</span> · Verwysing:{' '}
                        <span className="font-mono font-semibold text-stone-950">
                          {receiptSummary.reference}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          'summary-ref',
                          `${bankDetails.accountName} | ${bankDetails.bankName} Rek: ${bankDetails.accountNumber} | Tak: ${bankDetails.branchCode} | Verwysing: ${receiptSummary.reference} | Bedrag: R${receiptSummary.amount}`,
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-800 bg-[#F2EDE4] rounded-lg hover:bg-[#E7E0D3] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {copiedField === 'summary-ref' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#1B4332]" />
                          Besonderhede Gekopieer
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Kopieer EFT Opsomming
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {isSignedIn && donations.length > 0 && (
                <div className="mt-6 pt-5 border-t border-stone-300">
                  <p className="text-xs font-medium text-stone-600 mb-2">
                    Jou Onlangse Aangetekende Bydraes
                  </p>
                  <div className="space-y-1.5">
                    {donations.slice(0, 4).map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between text-xs text-stone-700"
                      >
                        <span>
                          {d.fund} · <span className="font-mono">{d.reference}</span>
                        </span>
                        <span className="font-semibold tabular-nums">
                          R{d.amount.toLocaleString('en-ZA')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Part 2: Kontak Ons */}
        <div id="kontak" className="pt-12 border-t border-stone-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <p className="text-xs font-medium text-stone-500">
                  Ons Hoor Graag van Jou
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-stone-950 mt-1">
                  Kontak Ons
                </h2>
                <p className="mt-2 text-sm sm:text-base text-stone-600 leading-relaxed">
                  Kontak gerus NG Kerk Bethlehem-Wes se kerkkantoor vir navrae oor
                  lidmaatskap, pastorale sorg, kategese of afkondigings.
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#1B4332] mt-1 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-stone-500">Gemeente</p>
                    <p className="text-sm font-medium text-stone-900">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#1B4332] mt-1 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-stone-500">Kerkkantoor Ure</p>
                    <p className="text-sm font-medium text-stone-900 tabular-nums">
                      {contactInfo.officeHours}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#1B4332] mt-1 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-stone-500">Kerkkantoor Telefoon</p>
                    <a
                      href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`}
                      className="text-sm font-semibold text-[#1B4332] tabular-nums hover:underline"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#1B4332] mt-1 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-stone-500">E-posadres</p>
                    <a
                      href={`mailto:${contactInfo.email || 'skriba@bhmwes.co.za'}`}
                      className="text-sm font-semibold text-[#1B4332] hover:underline"
                    >
                      {contactInfo.email || 'skriba@bhmwes.co.za'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarOff className="w-4 h-4 text-[#92400E] mt-1 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-stone-500">Vakansie Kennisgewing</p>
                    <p className="text-sm text-stone-800 leading-relaxed">
                      {contactInfo.closureNotice}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-stone-500">Leraar</p>
                    <p className="font-semibold text-stone-900 mt-0.5">
                      {contactInfo.pastorName}
                    </p>
                    <a
                      href={`tel:${contactInfo.pastorPhone.replace(/\s+/g, '')}`}
                      className="text-[#1B4332] font-semibold tabular-nums hover:underline"
                    >
                      {contactInfo.pastorPhone}
                    </a>
                  </div>
                  <div>
                    <p className="text-stone-500">Sondag Erediens Nota</p>
                    <p className="font-semibold text-stone-900 mt-0.5">
                      {contactInfo.teaNotice}
                    </p>
                    <p className="text-stone-600">Kersdiens 25 Des · 09:00</p>
                  </div>
                </div>

                {contactInfo.facebookUrl && (
                  <div className="pt-3 border-t border-stone-200">
                    <a
                      href={contactInfo.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:underline"
                    >
                      Volg NG Kerk Bethlehem-Wes op Facebook
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-6 sm:p-8">
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-stone-950">
                Stuur vir Ons &apos;n Boodskap
              </h3>

              {!isSignedIn && (
                <div className="mt-4 p-4 bg-[#F4EFE6] border border-stone-200 rounded-lg flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-stone-700">
                    Teken in met Google om jou navraag direk aan die kerkkantoor te stuur.
                  </p>
                  <button
                    type="button"
                    onClick={onSignIn}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] whitespace-nowrap cursor-pointer"
                  >
                    Teken in met Google
                  </button>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-medium text-stone-700 mb-1.5"
                    >
                      Naam en Van
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      maxLength={100}
                      placeholder="Jou naam"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-[#FBF9F5] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-medium text-stone-700 mb-1.5"
                    >
                      E-posadres of Selnommer
                    </label>
                    <input
                      id="contact-email"
                      type="text"
                      required
                      maxLength={140}
                      placeholder="082 ... of naam@voorbeeld.co.za"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-[#FBF9F5] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-medium text-stone-700 mb-1.5"
                  >
                    Onderwerp
                  </label>
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-[#FBF9F5] focus:bg-white"
                  >
                    <option value="Algemene Navraag">Algemene Navraag</option>
                    <option value="Pastorale Besoek">Pastorale Besoek</option>
                    <option value="Doop / Huwelik">Doop / Huwelik</option>
                    <option value="Kategese & Jeug">Kategese &amp; Jeug</option>
                    <option value="Lidmaatskap & Wyknavraag">
                      Lidmaatskap &amp; Wyknavraag
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-msg"
                    className="block text-xs font-medium text-stone-700 mb-1.5"
                  >
                    Boodskap
                  </label>
                  <textarea
                    id="contact-msg"
                    rows={4}
                    required
                    maxLength={1200}
                    placeholder="Skryf jou boodskap aan NG Kerk Bethlehem-Wes..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-[#FBF9F5] focus:bg-white"
                  />
                </div>

                {contactSent && (
                  <p className="text-sm font-medium text-[#1B4332]">
                    Dankie! Jou boodskap is ontvang en ons kerkkantoor sal spoedig
                    reageer.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sendingContact}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] transition-colors min-h-[44px] cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  {sendingContact ? 'Stuur tans...' : 'Stuur Boodskap'}
                </button>
              </form>
            </div>
          </div>

          {/* Interactive Google Maps location card */}
          <div className="mt-8">
            <h3 className="font-serif text-xl font-medium text-stone-950 mb-3">
              Waar Ons Geleë Is
            </h3>
            <ChurchLocationMap
              mapsUrl={
                contactInfo.mapsUrl ||
                'https://maps.app.goo.gl/n9EKNGqYFirwzF2QA?g_st=ac'
              }
              address={contactInfo.address}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

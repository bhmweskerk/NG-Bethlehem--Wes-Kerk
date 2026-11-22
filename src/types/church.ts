export type EventCategory =
  | 'Erediens'
  | 'Kategese'
  | 'Gemeenskap'
  | 'Jeug'
  | 'Uitreek';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  category: EventCategory;
  description: string;
}

export type CatechismGradeGroup =
  | 'Gr 1–3'
  | 'Gr 4–6'
  | 'Gr 7–9'
  | 'Belydenisklas';

export interface CatechismClass {
  id: string;
  gradeGroup: CatechismGradeGroup;
  title: string;
  teacher: string;
  time: string;
  room: string;
  currentTopic: string;
  nextAssignment: string;
}

export interface ClassAnnouncement {
  id: string;
  gradeGroup: CatechismGradeGroup | 'Alle Klasse';
  title: string;
  message: string;
  dateLabel: string;
  author: string;
  important: boolean;
}

export interface BirthdayEntry {
  id: string;
  name: string;
  dayLabel: string;
  dateStr: string;
  group: string;
  wishedCount: number;
}

export type DayOfWeek =
  | 'Maandag'
  | 'Dinsdag'
  | 'Woensdag'
  | 'Donderdag'
  | 'Vrydag'
  | 'Saterdag'
  | 'Sondag';

export interface WeeklyProgramItem {
  id: string;
  dayOfWeek: DayOfWeek;
  time: string;
  title: string;
  location: string;
  leader: string;
  note?: string;
}

export interface WeeklyMessage {
  title: string;
  scripture: string;
  scriptureText: string;
  body: string[];
  author: string;
  dateLabel: string;
}

export type PrayerCategory =
  | 'Gesondheid'
  | 'Familie'
  | 'Danksegging'
  | 'Leiding & Werk';

export interface PrayerRequest {
  id: string;
  personName: string;
  category: PrayerCategory;
  request: string;
  dateLabel: string;
  prayingCount: number;
  isAnswered: boolean;
  isAnonymous: boolean;
}

export interface SundaySermon {
  id: string;
  dateLabel: string;
  title: string;
  theme: string;
  scripture: string;
  preacher: string;
  organist?: string;
  doorCollection?: string;
  youtubeUrl: string;
  summary: string;
  isCurrent: boolean;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  eventLabel: string;
  dateLabel: string;
  imageUrl: string;
  caption: string;
}

export interface BankDetails {
  churchName: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
  vkbNumber: string;
  afgriNumber: string;
  referenceGuide: string;
}

export interface DonationRecord {
  id: string;
  fund: string;
  amount: number;
  reference: string;
  method: 'EFT' | 'SnapScan / QR';
  dateLabel: string;
}

export interface ContactInfo {
  address: string;
  officeHours: string;
  phone: string;
  email?: string;
  closureNotice: string;
  teaNotice: string;
  pastorName: string;
  pastorPhone: string;
  youtubeChannelUrl: string;
  facebookUrl?: string;
  mapsUrl?: string;
}

export interface ChurchData {
  calendarEvents: CalendarEvent[];
  catechismClasses: CatechismClass[];
  classAnnouncements: ClassAnnouncement[];
  birthdays: BirthdayEntry[];
  weeklyProgram: WeeklyProgramItem[];
  weeklyMessage: WeeklyMessage;
  prayerRequests: PrayerRequest[];
  sermons: SundaySermon[];
  galleryPhotos: GalleryPhoto[];
  bankDetails: BankDetails;
  donations: DonationRecord[];
  contactInfo: ContactInfo;
}

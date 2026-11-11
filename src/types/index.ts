export type CardType = 'central' | 'point' | 'cross' | 'illustration' | 'action';

export type HighlightCategory = 'central' | 'command' | 'promise' | 'reflection' | 'revelation';

export interface VerseSegment {
  text: string;
  isJesus?: boolean;
}

export interface VerseCrossRef {
  ref: string;
  text?: string;
}

export interface VerseFootnote {
  caller?: string;
  text: string;
}

export interface VerseMap {
  title: string;
  placesMentioned?: string[];
  relevanceExplanation?: string;
  description?: string;
  imageUrl: string;
  sourceName?: string;
}

export interface ReaderSettings {
  showJesusWordsInRed: boolean;
  showCrossRefs: boolean;
  showFootnotes: boolean;
  showMaps: boolean;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
}

export interface BibleVerse {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  segments?: VerseSegment[];
  crossRefs?: VerseCrossRef[];
  footnotes?: VerseFootnote[];
  maps?: VerseMap[];
}

export interface VerseHighlight {
  id: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  selectedText: string;
  fullVerseText?: string;
  category: HighlightCategory;
  color: string;
  note?: string;
  createdAt: number;
}

export interface FloatingCard {
  id: string;
  type: CardType;
  customTypeLabel?: string;
  title: string;
  content: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  zIndex: number;
  isMinimized?: boolean;
  linkedHighlightId?: string;
  linkedVerseRef?: string;
  linkedQuote?: string;
  tags?: string[];
  imageUrl?: string;
  imageCaption?: string;
  createdAt: number;
}

export interface ConnectionLink {
  id: string;
  fromHighlightId?: string;
  fromVerseRef?: string;
  toCardId: string;
  label?: string;
  color: string;
}

export interface PersonalReflection {
  godSpokeToMe: string;
  personalApplication: string;
  prayerRequest: string;
  spiritualCommitment: string;
  keyGratitude: string;
  updatedAt: number;
}

export type SermonCategory = 
  | 'Predicas Dominicales'
  | 'Estudios Devocionales'
  | 'Células de estudio'
  | 'Mis prédicas';

export interface SermonCategoryConfig {
  id: SermonCategory;
  label: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
}

export const SERMON_CATEGORIES: SermonCategoryConfig[] = [
  {
    id: 'Predicas Dominicales',
    label: 'Prédicas Dominicales',
    color: '#D97706',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200',
    badgeBorder: 'border-amber-300 dark:border-amber-700',
  },
  {
    id: 'Estudios Devocionales',
    label: 'Estudios Devocionales',
    color: '#2563EB',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200',
    badgeBorder: 'border-blue-300 dark:border-blue-700',
  },
  {
    id: 'Células de estudio',
    label: 'Células de estudio',
    color: '#059669',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200',
    badgeBorder: 'border-emerald-300 dark:border-emerald-700',
  },
  {
    id: 'Mis prédicas',
    label: 'Mis prédicas',
    color: '#7C3AED',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200',
    badgeBorder: 'border-purple-300 dark:border-purple-700',
  },
];

export interface SermonNote {
  id: string;
  title: string;
  category?: SermonCategory;
  preacher: string;
  churchName: string;
  date: string;
  series: string;
  mainScripture: string;
  activePassage: {
    bookId: string;
    chapter: number;
  };
  cards: FloatingCard[];
  highlights: VerseHighlight[];
  links: ConnectionLink[];
  reflection: PersonalReflection;
  updatedAt: number;
}

export interface BibleBook {
  id: string;
  name: string;
  shortName: string;
  testament: 'AT' | 'NT';
  category: 'Pentateuco' | 'Históricos' | 'Poéticos' | 'Profetas' | 'Evangelios' | 'Epístolas' | 'Apocalipsis';
  chaptersCount: number;
}

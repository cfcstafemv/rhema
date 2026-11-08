export type CardType = 'central' | 'point' | 'cross' | 'illustration' | 'action';

export type HighlightCategory = 'central' | 'command' | 'promise' | 'reflection' | 'revelation';

export interface BibleVerse {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
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

export interface SermonNote {
  id: string;
  title: string;
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

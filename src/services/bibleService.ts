import type { BibleVerse, BibleBook } from '../types';
import { BIBLE_BOOKS, BIBLE_TRANSLATIONS, getBibleVerses } from '../data/bibleData';

type ApiTranslation = {
  id: string;
  name?: string;
  englishName?: string;
  shortName?: string;
  language?: string;
  languageName?: string;
  languageEnglishName?: string;
  numberOfBooks?: number;
  totalNumberOfChapters?: number;
  licenseNotice?: string | null;
  licenseUrl?: string;
};

type ApiBook = {
  id: string;
  name?: string;
  commonName?: string;
  shortName?: string;
  order?: number;
  numberOfChapters?: number;
  isApocryphal?: boolean;
};

type ApiChapterResponse = {
  chapter?: {
    content?: Array<{
      type?: string;
      number?: number;
      text?: string;
    }>;
  };
};

export interface BibleTranslationOption {
  id: string;
  name: string;
  shortName: string;
  description: string;
}

const API_BASE = 'https://bible.helloao.org/api';
const REQUESTED_TRANSLATIONS = [
  { aliases: ['rvr1960', 'rvr60'], name: 'Reina-Valera 1960', shortName: 'RVR1960' },
  { aliases: ['ntv'], name: 'Nueva Traducción Viviente', shortName: 'NTV' },
  { aliases: ['nbla'], name: 'Nueva Biblia de las Américas', shortName: 'NBLA' },
] as const;

const booksCache = new Map<string, ApiBook[]>();
const chapterCache = new Map<string, BibleVerse[]>();
let translationsPromise: Promise<ApiTranslation[]> | undefined;

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`HelloAO API respondió ${response.status}`);
  return (await response.json()) as T;
}

function getTranslations(): Promise<ApiTranslation[]> {
  translationsPromise ??= fetchJson<{ translations?: ApiTranslation[] }>(`${API_BASE}/available_translations.json`)
    .then(({ translations }) => translations ?? [])
    .catch((error) => {
      translationsPromise = undefined;
      throw error;
    });
  return translationsPromise;
}

function resolveRequestedTranslation(translation: ApiTranslation) {
  const identifiers = [translation.id, translation.shortName, translation.name, translation.englishName]
    .filter((value): value is string => Boolean(value))
    .map(normalizeText);
  return REQUESTED_TRANSLATIONS.find(({ aliases }) =>
    identifiers.some((identifier) => aliases.some((alias) => identifier === normalizeText(alias)))
  );
}

/** Return only the user's requested versions that the HelloAO catalogue actually contains. */
export async function getAvailableBibleTranslations(): Promise<BibleTranslationOption[]> {
  const catalog = await getTranslations();
  return catalog.flatMap((translation) => {
    const isSpanish = translation.language?.toLowerCase() === 'spa' ||
      translation.languageName?.toLowerCase().includes('español') ||
      translation.languageEnglishName?.toLowerCase().includes('spanish');
    const requested = resolveRequestedTranslation(translation);
    if (!isSpanish || !requested) return [];

    return [{
      id: translation.id,
      name: translation.name || requested.name,
      shortName: translation.shortName || requested.shortName,
      description: translation.licenseNotice ||
        (translation.licenseUrl ? `Detalles de licencia: ${translation.licenseUrl}` : `Versión disponible · ${translation.id}`),
    }];
  });
}

function categoryForApiBook(order = 0): BibleBook['category'] {
  if (order <= 5) return 'Pentateuco';
  if (order <= 17 || order === 44) return 'Históricos';
  if (order <= 22) return 'Poéticos';
  if (order <= 39) return 'Profetas';
  if (order <= 43) return 'Evangelios';
  if (order === 66) return 'Apocalipsis';
  return 'Epístolas';
}

function addApiBooks(books: ApiBook[]): void {
  for (const book of books) {
    if (book.isApocryphal) continue;
    const name = book.commonName || book.name;
    if (!name || BIBLE_BOOKS.some((local) => normalizeText(local.name) === normalizeText(name))) continue;
    BIBLE_BOOKS.push({
      id: book.id.toLowerCase(),
      name,
      shortName: book.shortName || name,
      testament: (book.order ?? 1) <= 39 ? 'AT' : 'NT',
      category: categoryForApiBook(book.order),
      chaptersCount: book.numberOfChapters || 1,
    });
  }
}

async function getApiBooks(translationId: string): Promise<ApiBook[]> {
  const cached = booksCache.get(translationId);
  if (cached) return cached;
  const response = await fetchJson<{ books?: ApiBook[] }>(`${API_BASE}/${encodeURIComponent(translationId)}/books.json`);
  const books = response.books ?? [];
  booksCache.set(translationId, books);
  addApiBooks(books);
  return books;
}

async function resolveApiBookId(translationId: string, localBookId: string): Promise<string | null> {
  const books = await getApiBooks(translationId);
  const localBook = BIBLE_BOOKS.find((book) => book.id === localBookId);
  if (!localBook) return null;
  const localName = normalizeText(localBook.name);
  const match = books.find((book) => book.id.toLowerCase() === localBookId.toLowerCase()) ??
    books.find((book) => [book.name, book.commonName, book.shortName]
      .filter((value): value is string => Boolean(value))
      .map(normalizeText)
      .includes(localName));
  return match?.id ?? null;
}

function readStoredChapter(key: string): BibleVerse[] | null {
  try {
    const raw = window.localStorage.getItem(`rhema_helloao_${key}`);
    return raw ? JSON.parse(raw) as BibleVerse[] : null;
  } catch {
    return null;
  }
}

function storeChapter(key: string, verses: BibleVerse[]): void {
  try {
    window.localStorage.setItem(`rhema_helloao_${key}`, JSON.stringify(verses));
  } catch {
    // Continue with the in-memory cache if localStorage is unavailable or full.
  }
}

export async function getOrFetchChapterVerses(bookId: string, chapter: number, translation = 'RVR1960'): Promise<BibleVerse[]> {
  const localVerses = getBibleVerses(bookId, chapter, translation);
  if (typeof window === 'undefined') return localVerses;

  try {
    const catalog = await getTranslations();
    const selected = catalog.find((item) => item.id === translation);
    if (!selected || !resolveRequestedTranslation(selected)) return localVerses;

    const apiBookId = await resolveApiBookId(selected.id, bookId);
    if (!apiBookId) return localVerses;
    const key = `${selected.id}_${apiBookId}_${chapter}`;
    const cached = chapterCache.get(key) ?? readStoredChapter(key);
    if (cached?.length) {
      chapterCache.set(key, cached);
      return cached;
    }

    const response = await fetchJson<ApiChapterResponse>(
      `${API_BASE}/${encodeURIComponent(selected.id)}/${encodeURIComponent(apiBookId)}/${chapter}.simple.json`
    );
    const localBook = BIBLE_BOOKS.find((book) => book.id === bookId);
    if (!localBook) return localVerses;
    const verses = (response.chapter?.content ?? [])
      .filter((entry): entry is { type: 'verse'; number: number; text: string } =>
        entry.type === 'verse' && typeof entry.number === 'number' && typeof entry.text === 'string')
      .map((entry) => ({ bookId, bookName: localBook.name, chapter, verse: entry.number, text: entry.text }));
    if (!verses.length) return localVerses;
    chapterCache.set(key, verses);
    storeChapter(key, verses);
    return verses;
  } catch (error) {
    console.warn('No se pudo cargar el capítulo desde HelloAO; se conserva el contenido local.', error);
    return localVerses;
  }
}

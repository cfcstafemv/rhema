import type { BibleVerse } from '../types';
import { BIBLE_BOOKS, getBibleVerses } from '../data/bibleData';

type ApiTranslation = {
  id: string;
  name?: string;
  shortName?: string;
  language?: string;
  numberOfBooks?: number;
  totalNumberOfChapters?: number;
};

type ApiBook = {
  id: string;
  name?: string;
  commonName?: string;
  shortName?: string;
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

const API_BASE = 'https://bible.helloao.org/api';
const TRANSLATION_ALIASES: Record<string, string[]> = {
  RVR1960: ['RVR1960', 'RVR60'],
  RVR60: ['RVR60', 'RVR1960'],
  NTV: ['NTV'],
  NBLA: ['NBLA'],
};
const booksCache = new Map<string, ApiBook[]>();
const chapterCache = new Map<string, BibleVerse[]>();
let translationsPromise: Promise<ApiTranslation[]> | undefined;

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`HelloAO API respondió ${response.status}`);
  return (await response.json()) as T;
}

function getTranslations(): Promise<ApiTranslation[]> {
  translationsPromise ??= fetchJson<{ translations?: ApiTranslation[] }>(
    `${API_BASE}/available_translations.json`
  )
    .then((response) => response.translations ?? [])
    .catch((error) => {
      translationsPromise = undefined;
      throw error;
    });
  return translationsPromise;
}

function findTranslationId(requested: string, available: ApiTranslation[]): string | null {
  const normalizedRequest = requested.trim().toLowerCase();
  const aliases = TRANSLATION_ALIASES[requested.toUpperCase()] ?? [requested];
  const candidates = [...aliases, requested];

  for (const candidate of candidates) {
    const match = available.find(
      (translation) =>
        translation.id.toLowerCase() === candidate.toLowerCase() ||
        translation.shortName?.toLowerCase() === candidate.toLowerCase()
    );
    if (match) return match.id;
  }

  // Do not silently substitute a different translation under the requested name.
  // If the requested version is absent, use only a complete Spanish edition, and
  // return its actual ID to the caller's UI through verse text source attribution.
  const spanishFullBible = available.find(
    (translation) =>
      translation.language === 'spa' &&
      (translation.numberOfBooks ?? 0) >= 66 &&
      (translation.totalNumberOfChapters ?? 0) >= 1189 &&
      translation.id.toLowerCase() === normalizedRequest
  );
  return spanishFullBible?.id ?? null;
}

async function getApiBooks(translationId: string): Promise<ApiBook[]> {
  const cached = booksCache.get(translationId);
  if (cached) return cached;

  const response = await fetchJson<{ books?: ApiBook[] }>(
    `${API_BASE}/${encodeURIComponent(translationId)}/books.json`
  );
  const books = response.books ?? [];
  booksCache.set(translationId, books);
  return books;
}

async function findApiBookId(translationId: string, localBookId: string): Promise<string | null> {
  const books = await getApiBooks(translationId);
  const localBook = BIBLE_BOOKS.find((book) => book.id === localBookId);
  if (!localBook) return null;

  const localName = normalizeText(localBook.name);
  const match = books.find((book) => {
    const bookNames = [book.name, book.commonName, book.shortName]
      .filter((name): name is string => Boolean(name))
      .map(normalizeText);
    return bookNames.includes(localName);
  });

  return match?.id ?? null;
}

function readStoredChapter(cacheKey: string): BibleVerse[] | null {
  try {
    const stored = window.localStorage.getItem(`rhema_helloao_${cacheKey}`);
    return stored ? (JSON.parse(stored) as BibleVerse[]) : null;
  } catch {
    return null;
  }
}

function storeChapter(cacheKey: string, verses: BibleVerse[]): void {
  try {
    window.localStorage.setItem(`rhema_helloao_${cacheKey}`, JSON.stringify(verses));
  } catch {
    // Browser storage can be disabled or full; in-memory/network reading still works.
  }
}

export async function getOrFetchChapterVerses(
  bookId: string,
  chapter: number,
  translation = 'RVR1960'
): Promise<BibleVerse[]> {
  const localVerses = getBibleVerses(bookId, chapter, translation);
  if (typeof window === 'undefined') return localVerses;

  try {
    const translations = await getTranslations();
    const translationId = findTranslationId(translation, translations);
    if (!translationId) return localVerses;

    const apiBookId = await findApiBookId(translationId, bookId);
    if (!apiBookId) return localVerses;

    const cacheKey = `${translationId}_${apiBookId}_${chapter}`;
    const memoryCached = chapterCache.get(cacheKey);
    if (memoryCached) return memoryCached;

    const storedCached = readStoredChapter(cacheKey);
    if (storedCached?.length) {
      chapterCache.set(cacheKey, storedCached);
      return storedCached;
    }

    const response = await fetchJson<ApiChapterResponse>(
      `${API_BASE}/${encodeURIComponent(translationId)}/${encodeURIComponent(apiBookId)}/${chapter}.simple.json`
    );
    const localBook = BIBLE_BOOKS.find((book) => book.id === bookId);
    if (!localBook) return localVerses;

    const verses = (response.chapter?.content ?? [])
      .filter(
        (entry): entry is { type: 'verse'; number: number; text: string } =>
          entry.type === 'verse' &&
          typeof entry.number === 'number' &&
          typeof entry.text === 'string'
      )
      .map((entry) => ({
        bookId,
        bookName: localBook.name,
        chapter,
        verse: entry.number,
        text: entry.text,
      }));

    if (!verses.length) return localVerses;
    chapterCache.set(cacheKey, verses);
    storeChapter(cacheKey, verses);
    return verses;
  } catch (error) {
    console.warn('No se pudo consultar HelloAO; se conserva el contenido local.', error);
    return localVerses;
  }
}

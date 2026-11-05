import type { BibleVerse, BibleBook } from '../types';
import { BIBLE_BOOKS, BIBLE_TRANSLATIONS, getBibleVerses } from '../data/bibleData';

type ApiTranslation = {
  id: string;
  name?: string;
  shortName?: string;
  englishName?: string;
  language?: string;
  languageName?: string;
  numberOfBooks?: number;
  totalNumberOfChapters?: number;
  licenseNotice?: string | null;
  licenseUrl?: string;
  website?: string;
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

type TranslationOption = {
  id: string;
  name: string;
  shortName: string;
  description: string;
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

function addSpanishTranslationsToPicker(translations: ApiTranslation[]): void {
  const options = BIBLE_TRANSLATIONS as unknown as TranslationOption[];
  const spanishTranslations = translations.filter(
    (translation) => translation.language === 'spa' && (translation.numberOfBooks ?? 0) > 0
  );

  for (const translation of spanishTranslations) {
    if (options.some((option) => option.id.toLowerCase() === translation.id.toLowerCase())) continue;

    const name = translation.name || translation.englishName || translation.id;
    const details = [translation.licenseNotice, translation.licenseUrl ? `Licencia: ${translation.licenseUrl}` : null]
      .filter(Boolean)
      .join(' · ');

    options.push({
      id: translation.id,
      name,
      shortName: translation.shortName || translation.id,
      description: details || `Texto en español · ${translation.numberOfBooks ?? '?'} libros`,
    });
  }
}

function getTranslations(): Promise<ApiTranslation[]> {
  translationsPromise ??= fetchJson<{ translations?: ApiTranslation[] }>(
    `${API_BASE}/available_translations.json`
  )
    .then((response) => {
      const translations = response.translations ?? [];
      addSpanishTranslationsToPicker(translations);
      return translations;
    })
    .catch((error) => {
      translationsPromise = undefined;
      throw error;
    });
  return translationsPromise;
}

function findTranslationId(requested: string, available: ApiTranslation[]): string | null {
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

  return null;
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

function addApiBooksToPicker(books: ApiBook[]): void {
  for (const apiBook of books) {
    if (apiBook.isApocryphal) continue;
    const name = apiBook.commonName || apiBook.name;
    if (!name) continue;
    const normalizedName = normalizeText(name);
    if (BIBLE_BOOKS.some((book) => normalizeText(book.name) === normalizedName)) continue;

    BIBLE_BOOKS.push({
      id: apiBook.id.toLowerCase(),
      name,
      shortName: apiBook.shortName || name,
      testament: (apiBook.order ?? 1) <= 39 ? 'AT' : 'NT',
      category: categoryForApiBook(apiBook.order),
      chaptersCount: apiBook.numberOfChapters || 1,
    });
  }
}

async function getApiBooks(translationId: string): Promise<ApiBook[]> {
  const cached = booksCache.get(translationId);
  if (cached) return cached;

  const response = await fetchJson<{ books?: ApiBook[] }>(
    `${API_BASE}/${encodeURIComponent(translationId)}/books.json`
  );
  const books = response.books ?? [];
  booksCache.set(translationId, books);
  addApiBooksToPicker(books);
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
    return bookNames.includes(localName) || book.id.toLowerCase() === localBookId.toLowerCase();
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

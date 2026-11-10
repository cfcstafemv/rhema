import type { BibleVerse, BibleBook } from '../types';
import { BIBLE_BOOKS, BIBLE_TRANSLATIONS, getBibleVerses } from '../data/bibleData';
import { getCuratedChapter } from '../data/curatedScriptures';

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

const API_BASE_HELLOAO = 'https://bible.helloao.org/api';
const API_BASE_APIBIBLE = 'https://api.scripture.api.bible/v1';

// Canonical mapping of our 66 book identifiers to standard 3-letter USFM book IDs
export const LOCAL_TO_API_BOOK_MAP: Record<string, string> = {
  gen: 'GEN', exo: 'EXO', lev: 'LEV', num: 'NUM', deu: 'DEU',
  jos: 'JOS', jue: 'JDG', rut: 'RUT', '1sa': '1SA', '2sa': '2SA',
  '1re': '1KI', '2re': '2KI', '1cr': '1CH', '2cr': '2CH', esd: 'EZR',
  neh: 'NEH', est: 'EST', job: 'JOB', sal: 'PSA', pro: 'PRO',
  ecl: 'ECC', can: 'SNG', isa: 'ISA', jer: 'JER', lam: 'LAM',
  eze: 'EZK', dan: 'DAN', ose: 'HOS', joe: 'JOL', amo: 'AMO',
  abd: 'OBA', jon: 'JON', miq: 'MIC', nah: 'NAM', hab: 'HAB',
  sof: 'ZEP', hag: 'HAG', zac: 'ZEC', mal: 'MAL', mat: 'MAT',
  mar: 'MRK', luc: 'LUK', jua: 'JHN', hch: 'ACT', rom: 'ROM',
  '1co': '1CO', '2co': '2CO', gal: 'GAL', efe: 'EPH', fil: 'PHP',
  col: 'COL', '1ts': '1TH', '2ts': '2TH', '1ti': '1TI', '2ti': '2TI',
  tit: 'TIT', flm: 'PHM', heb: 'HEB', stg: 'JAS', '1pe': '1PE',
  '2pe': '2PE', '1jn': '1JN', '2jn': '2JN', '3jn': '3JN', jud: 'JUD',
  apo: 'REV',
};

// Direct internal API.Bible configuration provided by developer
const DEFAULT_API_BIBLE_KEY = 'C20fZ2WHCaH7cLsimnVL_';
const API_BIBLE_KEY_STORAGE = 'rhema_api_bible_key';

// Verified exact Bible IDs in API.Bible for Spanish NTV and NBLA
export const API_BIBLE_IDS: Record<'NTV' | 'NBLA', string> = {
  NTV: '826f63861180e056-01', // Nueva Traducción Viviente
  NBLA: 'ce11b813f9a27e20-01', // Nueva Biblia de las Américas
};

export function getStoredApiBibleKey(): string {
  if (typeof window === 'undefined') return DEFAULT_API_BIBLE_KEY;
  return localStorage.getItem(API_BIBLE_KEY_STORAGE) || DEFAULT_API_BIBLE_KEY;
}

export function setStoredApiBibleKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key.trim()) {
    localStorage.setItem(API_BIBLE_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(API_BIBLE_KEY_STORAGE);
  }
}

export function getCustomBibleId(translation: 'NTV' | 'NBLA'): string {
  return API_BIBLE_IDS[translation] || '';
}

export function setCustomBibleId(_translation: 'NTV' | 'NBLA', _id: string): void {
  // Configured internally
}

const chapterCache = new Map<string, BibleVerse[]>();

async function fetchJson<T>(url: string, headers?: Record<string, string>): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...headers,
    },
  });
  if (!response.ok) throw new Error(`API error status ${response.status}`);
  return (await response.json()) as T;
}

/**
 * Returns available translation options: RVR1960 (primary), NTV, and NBLA.
 */
export async function getAvailableBibleTranslations(): Promise<BibleTranslationOption[]> {
  return [
    {
      id: 'RVR1960',
      name: 'Reina-Valera 1960',
      shortName: 'RVR1960',
      description: 'Traducción clásica y predilecta para predicación y estudio bíblico',
    },
    {
      id: 'NTV',
      name: 'Nueva Traducción Viviente',
      shortName: 'NTV',
      description: 'Lenguaje moderno, dinámico y contemporáneo',
    },
    {
      id: 'NBLA',
      name: 'Nueva Biblia de las Américas',
      shortName: 'NBLA',
      description: 'Precisión literal con claridad contemporánea',
    },
  ];
}

const VERSE_CACHE_VERSION = 'v6';
const VERSE_CACHE_PREFIX = `rhema_verse_cache_${VERSE_CACHE_VERSION}_`;

/**
 * Actively purges legacy or corrupted cache entries from localStorage
 */
export function purgeLegacyVerseCache(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith('rhema_verse_cache_') && !k.startsWith(VERSE_CACHE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch (err) {
    console.warn('Error purging legacy verse cache:', err);
  }
}

// Auto-purge legacy caches on initial load
if (typeof window !== 'undefined') {
  try {
    purgeLegacyVerseCache();
  } catch {
    // Ignore in SSR
  }
}

/**
 * Validates verse data to ensure no truncated words, cross-version leaks, or incomplete chapter fragments
 */
export function isValidVerseList(verses: BibleVerse[] | null, translation?: string): boolean {
  if (!verses || !Array.isArray(verses) || verses.length === 0) return false;
  for (const v of verses) {
    if (!v || typeof v.text !== 'string' || !v.text.trim()) return false;
    // Detect truncated phrase bug from older AST parser
    if (v.text.includes('del  en Mizpa') || v.text.includes('presencia del  en')) return false;
    // Detect fallback template text
    if (v.text.startsWith('Versión ') && v.text.includes('capítulo')) return false;
    // Guard against cross-version leakage in Jueces 20:1
    if ((translation === 'NTV' || translation === 'NBLA') && v.bookId === 'jue' && v.chapter === 20 && v.verse === 1) {
      if (v.text.includes('a Jehová en Mizpa')) return false;
      if (!v.text.includes('Señor')) return false;
    }
  }

  // Reject incomplete chapter fragments with big non-sequential gaps (e.g. verse 1 jumping to 4, 5 to 12)
  for (let i = 1; i < verses.length; i++) {
    if (verses[i].verse - verses[i - 1].verse > 2) {
      return false;
    }
  }

  return true;
}

function readStoredChapter(key: string, translation?: string): BibleVerse[] | null {
  try {
    const fullKey = `${VERSE_CACHE_PREFIX}${key}`;
    const raw = window.localStorage.getItem(fullKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BibleVerse[];
    if (!isValidVerseList(parsed, translation)) {
      window.localStorage.removeItem(fullKey);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function storeChapter(key: string, verses: BibleVerse[]): void {
  try {
    window.localStorage.setItem(`${VERSE_CACHE_PREFIX}${key}`, JSON.stringify(verses));
  } catch {
    // Continue with in-memory cache if storage full
  }
}

/**
 * Returns Bible ID for NTV or NBLA on API.Bible using verified IDs.
 */
async function discoverApiBibleId(translation: 'NTV' | 'NBLA', _apiKey: string): Promise<string | null> {
  return API_BIBLE_IDS[translation] || null;
}

/**
 * Fetches chapter verses from API.Bible.
 */
async function fetchChapterFromApiBible(
  translation: 'NTV' | 'NBLA',
  bookId: string,
  chapter: number,
  apiKey: string
): Promise<BibleVerse[] | null> {
  const apiBookCode = LOCAL_TO_API_BOOK_MAP[bookId.toLowerCase()] || bookId.toUpperCase();
  const bibleId = await discoverApiBibleId(translation, apiKey);
  if (!bibleId) return null;

  const chapterId = `${apiBookCode}.${chapter}`;
  const url = `${API_BASE_APIBIBLE}/bibles/${encodeURIComponent(bibleId)}/chapters/${encodeURIComponent(chapterId)}?content-type=json&include-verse-numbers=true`;

  try {
    const res = await fetchJson<{ data: { content?: any[] } }>(url, { 'api-key': apiKey });
    const localBook = BIBLE_BOOKS.find((b) => b.id === bookId) || BIBLE_BOOKS[0];

    // Parse verses from API.Bible JSON node tree
    const verses: BibleVerse[] = [];
    let currentVerseNum: number | null = null;
    let currentVerseText = '';
    let currentSegments: { text: string; isJesus?: boolean }[] = [];
    let currentFootnotes: { caller?: string; text: string }[] = [];
    let currentCrossRefs: { ref: string; text?: string }[] = [];

    const flush = () => {
      if (currentVerseNum !== null && currentVerseText.trim()) {
        const fullText = currentVerseText.replace(/\s+/g, ' ').trim();
        const cleanedSegments = currentSegments.length > 0 ? currentSegments : undefined;
        verses.push({
          bookId,
          bookName: localBook.name,
          chapter,
          verse: currentVerseNum,
          text: fullText,
          segments: cleanedSegments && cleanedSegments.some((s) => s.isJesus) ? cleanedSegments : undefined,
          footnotes: currentFootnotes.length > 0 ? currentFootnotes : undefined,
          crossRefs: currentCrossRefs.length > 0 ? currentCrossRefs : undefined,
        });
        currentVerseNum = null;
        currentVerseText = '';
        currentSegments = [];
        currentFootnotes = [];
        currentCrossRefs = [];
      }
    };

    const extractNoteText = (n: any): string => {
      let t = '';
      if (n.type === 'text' && typeof n.text === 'string') t += n.text;
      if (Array.isArray(n.items)) {
        for (const item of n.items) t += extractNoteText(item);
      }
      return t.trim();
    };

    const walkNodes = (nodes: any[], inJesus = false) => {
      for (const node of nodes) {
        if (node.name === 'verse' && node.attrs?.number) {
          flush();
          currentVerseNum = parseInt(node.attrs.number, 10);
          continue; // Avoid verse number label in items
        }

        // Catch footnotes or cross references
        if (node.name === 'note' || (node.name === 'char' && ['f', 'fe'].includes(node.attrs?.style))) {
          const noteText = extractNoteText(node);
          if (noteText && currentVerseNum !== null) {
            currentFootnotes.push({ text: noteText, caller: node.attrs?.caller });
          }
          continue;
        }

        if (node.attrs?.style === 'x') {
          const refText = extractNoteText(node);
          if (refText && currentVerseNum !== null) {
            currentCrossRefs.push({ ref: refText });
          }
          continue;
        }

        // Skip editorial headings
        if (node.name === 'para' && ['s', 's1', 's2', 's3', 'r', 'd', 'ms', 'mr'].includes(node.attrs?.style)) {
          continue;
        }

        // Add natural spacing when transitioning between paragraphs in poetry or prose
        if (
          node.name === 'para' &&
          currentVerseNum !== null &&
          currentVerseText.length > 0 &&
          !/\s$/.test(currentVerseText)
        ) {
          currentVerseText += ' ';
          if (currentSegments.length > 0 && !/\s$/.test(currentSegments[currentSegments.length - 1].text)) {
            currentSegments[currentSegments.length - 1].text += ' ';
          }
        }

        const isNowJesus = inJesus || (node.name === 'char' && node.attrs?.style === 'wj');

        if (node.type === 'text' && typeof node.text === 'string') {
          if (currentVerseNum !== null) {
            currentVerseText += node.text;
            currentSegments.push({ text: node.text, isJesus: isNowJesus });
          }
        }

        if (Array.isArray(node.items)) {
          walkNodes(node.items, isNowJesus);
        }
      }
    };

    if (res.data?.content) {
      walkNodes(res.data.content);
      flush();
    }

    return verses.length > 0 ? verses : null;
  } catch (err) {
    console.warn(`Error al consultar capítulo ${chapterId} en API.Bible (${translation}):`, err);
    return null;
  }
}

export class OfflineTranslationWaitingError extends Error {
  translation: string;
  bookId: string;
  chapter: number;

  constructor(translation: string, bookId: string, chapter: number) {
    super(`Esperando conexión a internet para cargar ${translation}`);
    this.name = 'OfflineTranslationWaitingError';
    this.translation = translation;
    this.bookId = bookId;
    this.chapter = chapter;
  }
}

/**
 * Checks whether a specific chapter of a translation is available without internet
 */
export function isChapterAvailableOffline(
  bookId: string,
  chapter: number,
  translation: string
): boolean {
  const apiBookCode = LOCAL_TO_API_BOOK_MAP[bookId.toLowerCase()] || bookId.toUpperCase();
  const cacheKey = `${translation}_${apiBookCode}_${chapter}`;

  // 1. In-memory cache
  if (chapterCache.has(cacheKey)) return true;

  // 2. LocalStorage cache
  const stored = readStoredChapter(cacheKey, translation);
  if (stored && stored.length > 0) return true;

  // 3. Curated passages
  const curated = getCuratedChapter(translation, bookId, chapter);
  if (curated && curated.length > 0) return true;

  // 4. RVR1960 is always backed by the offline Scripture database
  if (translation === 'RVR1960') return true;

  return false;
}

function enrichWithCuratedData(
  verses: BibleVerse[],
  bookId: string,
  chapter: number,
  translation: string
): BibleVerse[] {
  const curated = getCuratedChapter(translation, bookId, chapter);
  if (!curated || curated.length === 0) return verses;

  const map = new Map<number, (typeof curated)[0]>();
  for (const c of curated) map.set(c.verse, c);

  return verses.map((v) => {
    const c = map.get(v.verse);
    if (!c) return v;
    return {
      ...v,
      crossRefs: c.crossRefs || v.crossRefs,
      footnotes: c.footnotes || v.footnotes,
      segments: v.segments || (c.isJesus ? [{ text: v.text, isJesus: true }] : undefined),
    };
  });
}

/**
 * Retrieves Bible verses for any book, chapter and translation.
 * - Prioritizes verified curated chapter database (e.g. Jueces 20, Romanos 8, Salmos 23, Juan 15).
 * - For NTV / NBLA: Fetches from API.Bible while online. If offline and uncached, throws OfflineTranslationWaitingError.
 * - For RVR1960: Fetches through online textual API while online; seamlessly falls back to offline database when offline.
 */
export async function getOrFetchChapterVerses(
  bookId: string,
  chapter: number,
  translation = 'RVR1960'
): Promise<BibleVerse[]> {
  const localBook = BIBLE_BOOKS.find((b) => b.id === bookId) || BIBLE_BOOKS[0];
  const apiBookCode = LOCAL_TO_API_BOOK_MAP[bookId.toLowerCase()] || bookId.toUpperCase();
  const cacheKey = `${translation}_${apiBookCode}_${chapter}`;

  // 1. Check curated authentic passages first (instantaneous, offline-ready & immune to network issues)
  const curated = getCuratedChapter(translation, bookId, chapter);
  if (curated && curated.length > 0) {
    const parsed: BibleVerse[] = curated.map((v) => ({
      bookId,
      bookName: localBook.name,
      chapter,
      verse: v.verse,
      text: v.text,
      segments: (v as any).segments || ((v as any).isJesus ? [{ text: v.text, isJesus: true }] : undefined),
      crossRefs: (v as any).crossRefs,
      footnotes: (v as any).footnotes,
    }));
    if (isValidVerseList(parsed, translation)) {
      chapterCache.set(cacheKey, parsed);
      storeChapter(cacheKey, parsed);
      return parsed;
    }
  }

  // 2. Check in-memory or validated localStorage cache
  const cached = chapterCache.get(cacheKey) ?? readStoredChapter(cacheKey, translation);
  if (cached && cached.length > 0 && isValidVerseList(cached, translation)) {
    chapterCache.set(cacheKey, cached);
    return cached;
  }

  const isOnline = typeof navigator === 'undefined' ? true : navigator.onLine;

  // 3. Modern versions path (NTV / NBLA): Fetch from API.Bible when online
  if (translation === 'NTV' || translation === 'NBLA') {
    if (!isOnline) {
      throw new OfflineTranslationWaitingError(translation, bookId, chapter);
    }

    const apiKey = getStoredApiBibleKey();
    if (apiKey) {
      try {
        const fromApiBible = await fetchChapterFromApiBible(translation, bookId, chapter, apiKey);
        if (fromApiBible && fromApiBible.length > 0 && isValidVerseList(fromApiBible, translation)) {
          const enriched = enrichWithCuratedData(fromApiBible, bookId, chapter, translation);
          chapterCache.set(cacheKey, enriched);
          storeChapter(cacheKey, enriched);
          return enriched;
        }
      } catch {
        // Fall through to waiting error
      }
    }

    // If API is unreachable or offline, signal waiting state
    throw new OfflineTranslationWaitingError(translation, bookId, chapter);
  }

  // 4. Reina-Valera (RVR1960) path:
  // Mientras haya internet, se toma desde la API online
  if (isOnline) {
    const candidateApiVersions = ['spa_rvg', 'spa_r09'];
    for (const apiVer of candidateApiVersions) {
      try {
        const url = `${API_BASE_HELLOAO}/${apiVer}/${apiBookCode}/${chapter}.simple.json`;
        const response = await fetchJson<{ chapter?: { content?: Array<{ type?: string; number?: number; text?: string }> } }>(url);
        const content = response.chapter?.content ?? [];
        const verses: BibleVerse[] = content
          .filter(
            (entry): entry is { type: 'verse'; number: number; text: string } =>
              entry.type === 'verse' && typeof entry.number === 'number' && typeof entry.text === 'string'
          )
          .map((entry) => ({
            bookId,
            bookName: localBook.name,
            chapter,
            verse: entry.number,
            text: entry.text,
          }));

        if (verses.length > 0 && isValidVerseList(verses, translation)) {
          const enriched = enrichWithCuratedData(verses, bookId, chapter, translation);
          chapterCache.set(cacheKey, enriched);
          storeChapter(cacheKey, enriched);
          return enriched;
        }
      } catch {
        // Continue to next candidate
      }
    }
  }

  // Si no hay internet o falla la API, se muestra la base de datos local fuera de línea
  const localVerses = getBibleVerses(bookId, chapter, translation);
  return localVerses;
}

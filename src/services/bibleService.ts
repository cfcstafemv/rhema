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

// Canonical mapping of our 66 book identifiers to standard 3-letter USFM book IDs used by HelloAO
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

const chapterCache = new Map<string, BibleVerse[]>();

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`HelloAO API error status ${response.status}`);
  return (await response.json()) as T;
}

/**
 * Return only RVR1960 as requested by user.
 */
export async function getAvailableBibleTranslations(): Promise<BibleTranslationOption[]> {
  return [
    {
      id: 'RVR1960',
      name: 'Reina-Valera 1960',
      shortName: 'RVR1960',
      description: 'Versión clásica Reina-Valera (RVR1960), traducción fundamental y pastoral',
    },
  ];
}

function readStoredChapter(key: string): BibleVerse[] | null {
  try {
    const raw = window.localStorage.getItem(`rhema_helloao_${key}`);
    return raw ? (JSON.parse(raw) as BibleVerse[]) : null;
  } catch {
    return null;
  }
}

function storeChapter(key: string, verses: BibleVerse[]): void {
  try {
    window.localStorage.setItem(`rhema_helloao_${key}`, JSON.stringify(verses));
  } catch {
    // Continue with in-memory cache if storage full or restricted
  }
}

/**
 * Retrieves Bible verses for any book and chapter.
 * First uses curated local RVR1960 verses, or fetches the complete chapter from HelloAO API
 * (spa_rvg / spa_r09 Reina-Valera textual editions) and caches it in memory and localStorage.
 */
export async function getOrFetchChapterVerses(
  bookId: string,
  chapter: number,
  _translation = 'RVR1960'
): Promise<BibleVerse[]> {
  const localVerses = getBibleVerses(bookId, chapter, 'RVR1960');
  const localBook = BIBLE_BOOKS.find((b) => b.id === bookId) || BIBLE_BOOKS[0];

  // If we already have curated complete text locally (e.g. key sermon chapters), prioritize it
  if (localVerses && localVerses.length >= 10) {
    return localVerses;
  }

  if (typeof window === 'undefined') return localVerses;

  const apiBookCode = LOCAL_TO_API_BOOK_MAP[bookId.toLowerCase()] || bookId.toUpperCase();
  const cacheKey = `rvr_${apiBookCode}_${chapter}`;

  const cached = chapterCache.get(cacheKey) ?? readStoredChapter(cacheKey);
  if (cached && cached.length > 0) {
    chapterCache.set(cacheKey, cached);
    return cached;
  }

  // Try fetching from HelloAO Reina Valera (spa_rvg / spa_r09)
  const candidateApiVersions = ['spa_rvg', 'spa_r09'];
  for (const apiVer of candidateApiVersions) {
    try {
      const url = `${API_BASE}/${apiVer}/${apiBookCode}/${chapter}.simple.json`;
      const response = await fetchJson<ApiChapterResponse>(url);
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

      if (verses.length > 0) {
        chapterCache.set(cacheKey, verses);
        storeChapter(cacheKey, verses);
        return verses;
      }
    } catch {
      // Continue to next candidate or fallback
    }
  }

  return localVerses;
}

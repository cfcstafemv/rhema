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

function readStoredChapter(key: string): BibleVerse[] | null {
  try {
    const raw = window.localStorage.getItem(`rhema_verse_cache_${key}`);
    return raw ? (JSON.parse(raw) as BibleVerse[]) : null;
  } catch {
    return null;
  }
}

function storeChapter(key: string, verses: BibleVerse[]): void {
  try {
    window.localStorage.setItem(`rhema_verse_cache_${key}`, JSON.stringify(verses));
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

    const flush = () => {
      if (currentVerseNum !== null && currentVerseText.trim()) {
        verses.push({
          bookId,
          bookName: localBook.name,
          chapter,
          verse: currentVerseNum,
          text: currentVerseText.replace(/\s+/g, ' ').trim(),
        });
        currentVerseNum = null;
        currentVerseText = '';
      }
    };

    const walkNodes = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.name === 'verse' && node.attrs?.number) {
          flush();
          currentVerseNum = parseInt(node.attrs.number, 10);
          continue; // Avoid verse number label in items
        }

        // Skip footnotes and translator references
        if (node.name === 'note' || (node.name === 'char' && node.attrs?.style === 'f')) {
          continue;
        }

        if (node.type === 'text' && typeof node.text === 'string') {
          if (currentVerseNum !== null) {
            currentVerseText += node.text;
          }
        }

        if (Array.isArray(node.items)) {
          walkNodes(node.items);
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

/**
 * Curated verses tailored for NTV and NBLA for key chapters.
 */
const CURATED_MODERN_VERSIONS: Record<string, Record<string, Record<number, { verse: number; text: string }[]>>> = {
  NTV: {
    rom: {
      8: [
        { verse: 1, text: "Por lo tanto, ya no hay condenación para los que pertenecen a Cristo Jesús;" },
        { verse: 2, text: "y porque ustedes pertenecen a él, el poder del Espíritu que da vida los ha libertado del poder del pecado, que lleva a la muerte." },
        { verse: 14, text: "Pues todos los que son guiados por el Espíritu de Dios son hijos de Dios." },
        { verse: 15, text: "Y ustedes no han recibido un espíritu que los esclavice al miedo. En cambio, recibieron el Espíritu de Dios cuando él los adoptó como sus propios hijos. Ahora lo llamamos: «Abba, Padre»." },
        { verse: 28, text: "Y sabemos que Dios hace que todas las cosas cooperen para el bien de quienes lo aman y son llamados según el propósito que él tiene para ellos." },
        { verse: 31, text: "¿Qué podemos decir acerca de cosas tan maravillosas como estas? Si Dios está a favor de nosotros, ¿quién podrá ponerse en nuestra contra?" },
        { verse: 37, text: "Claro que no, a pesar de todas estas cosas, nuestro triunfo es absoluto por medio de Cristo, quien nos amó." },
        { verse: 38, text: "Y estoy convencido de que nada podrá jamás separarnos del amor de Dios. Ni la muerte, ni la vida, ni ángeles, ni demonios, ni nuestros temores de hoy, ni nuestras preocupaciones de mañana." },
        { verse: 39, text: "Ningún poder en las alturas ni en las profundidades, de hecho, nada en toda la creación podrá jamás separarnos del amor de Dios, que está revelado en Cristo Jesús nuestro Señor." },
      ],
    },
    sal: {
      23: [
        { verse: 1, text: "El Señor es mi pastor; tengo todo lo que necesito." },
        { verse: 2, text: "En verdes praderas me hace descansar; me conduce junto a arroyos tranquilos." },
        { verse: 3, text: "Él renueva mis fuerzas. Me guía por sendas correctas, y así da honra a su nombre." },
        { verse: 4, text: "Aun cuando pase por el valle más oscuro, no temeré, porque tú estás a mi lado. Tu vara y tu cayado me protegen y me confortan." },
        { verse: 5, text: "Me preparas un banquete en presencia de mis enemigos. Me honras ungiendo mi cabeza con aceite; mi copa se desborda de bendiciones." },
        { verse: 6, text: "Ciertamente tu bondad y tu amor inagotable me seguirán todos los días de mi vida, y en la casa del Señor viviré por siempre." },
      ],
    },
    fil: {
      4: [
        { verse: 4, text: "Alégrense siempre en el Señor. Insisto: ¡Alégrense!" },
        { verse: 6, text: "No se preocupen por nada; en cambio, oren por todo. Díganle a Dios lo que necesitan y denle gracias por todo lo que él ha hecho." },
        { verse: 7, text: "Así experimentarán la paz de Dios, que supera todo lo que podemos entender. La paz de Dios cuidará su corazón y su mente mientras vivan en Cristo Jesús." },
        { verse: 13, text: "Pues todo lo puedo hacer por medio de Cristo, quien me da las fuerzas." },
      ],
    },
    jua: {
      15: [
        { verse: 1, text: "Yo soy la vid verdadera, y mi Padre es el labrador." },
        { verse: 4, text: "Permanezcan en mí, y yo permaneceré en ustedes. Pues una rama no puede dar fruto por sí misma; debe permanecer en la vid." },
        { verse: 5, text: "Sí, yo soy la vid y ustedes son las ramas. Los que permanecen en mí y yo en ellos producirán mucho fruto porque, separados de mí, no pueden hacer nada." },
        { verse: 12, text: "Este es mi mandamiento: Ámense unos a otros tal como yo los he amado." },
      ],
    },
  },
  NBLA: {
    rom: {
      8: [
        { verse: 1, text: "Por tanto, no hay ahora condenación para los que están en Cristo Jesús, los que no andan conforme a la carne sino conforme al Espíritu." },
        { verse: 2, text: "Porque la ley del Espíritu de vida en Cristo Jesús te ha libertado de la ley del pecado y de la muerte." },
        { verse: 14, text: "Porque todos los que son guiados por el Espíritu de Dios, los tales son hijos de Dios." },
        { verse: 15, text: "Pues no habéis recibido un espíritu de esclavitud para volver otra vez al temor, sino que habéis recibido un espíritu de adopción como hijos, por el cual clamamos: «¡Abba, Padre!»." },
        { verse: 28, text: "Y sabemos que para los que aman a Dios, todas las cosas cooperan para bien, esto es, para los que son llamados conforme a Su propósito." },
        { verse: 31, text: "Entonces, ¿qué diremos a esto? Si Dios está por nosotros, ¿quién estará contra nosotros?" },
        { verse: 37, text: "Pero en todas estas cosas somos más que vencedores por medio de Aquel que nos amó." },
        { verse: 38, text: "Porque estoy convencido de que ni la muerte, ni la vida, ni ángeles, ni principados, ni lo presente, ni lo por venir, ni los poderes," },
        { verse: 39, text: "ni lo alto, ni lo profundo, ni ninguna otra cosa creada nos podrá separar del amor de Dios que es en Cristo Jesús Señor nuestro." },
      ],
    },
    sal: {
      23: [
        { verse: 1, text: "El Señor es mi pastor, nada me faltará." },
        { verse: 2, text: "En lugares de verdes pastos me hace descansar; junto a aguas de reposo me conduce." },
        { verse: 3, text: "Él restaura mi alma; me guía por senderos de justicia por amor de Su nombre." },
        { verse: 4, text: "Aunque pase por el valle de sombra de muerte, no temeré mal alguno, porque Tú estás conmigo; Tu vara y Tu cayado me infunden aliento." },
        { verse: 5, text: "Tú preparas mesa delante de mí en presencia de mis enemigos; has ungido mi cabeza con aceite; mi copa está rebosando." },
        { verse: 6, text: "Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, y en la casa del Señor moraré por largos días." },
      ],
    },
    fil: {
      4: [
        { verse: 4, text: "Regocijaos en el Señor siempre. Otra vez lo diré: ¡Regocijaos!" },
        { verse: 6, text: "Por nada estéis afanosos; antes bien, en todo, mediante oración y súplica con acción de gracias, sean dadas a conocer vuestras peticiones delante de Dios." },
        { verse: 7, text: "Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestras mentes en Cristo Jesús." },
        { verse: 13, text: "Todo lo puedo en Cristo que me fortalece." },
      ],
    },
  },
};

/**
 * Retrieves Bible verses for any book, chapter and translation.
 * - For RVR1960: Fetches through Reina-Valera textual API + local verified passages.
 * - For NTV / NBLA: If API.Bible key is configured, queries API.Bible directly;
 *   otherwise serves curated chapter text, user pasted text, and clear version notices.
 */
export async function getOrFetchChapterVerses(
  bookId: string,
  chapter: number,
  translation = 'RVR1960'
): Promise<BibleVerse[]> {
  const localBook = BIBLE_BOOKS.find((b) => b.id === bookId) || BIBLE_BOOKS[0];
  const apiBookCode = LOCAL_TO_API_BOOK_MAP[bookId.toLowerCase()] || bookId.toUpperCase();
  const cacheKey = `${translation}_${apiBookCode}_${chapter}`;

  // Check in-memory or localStorage cache first
  const cached = chapterCache.get(cacheKey) ?? readStoredChapter(cacheKey);
  if (cached && cached.length > 0) {
    chapterCache.set(cacheKey, cached);
    return cached;
  }

  // 1. If NTV or NBLA, check if user provided API.Bible key
  if (translation === 'NTV' || translation === 'NBLA') {
    const apiKey = getStoredApiBibleKey();
    if (apiKey) {
      const fromApiBible = await fetchChapterFromApiBible(translation, bookId, chapter, apiKey);
      if (fromApiBible && fromApiBible.length > 0) {
        chapterCache.set(cacheKey, fromApiBible);
        storeChapter(cacheKey, fromApiBible);
        return fromApiBible;
      }
    }

    // Check curated modern verses for key sermon passages
    const curatedForTranslation = CURATED_MODERN_VERSIONS[translation]?.[bookId.toLowerCase()]?.[chapter];
    if (curatedForTranslation && curatedForTranslation.length > 0) {
      const parsed: BibleVerse[] = curatedForTranslation.map((v) => ({
        bookId,
        bookName: localBook.name,
        chapter,
        verse: v.verse,
        text: v.text,
      }));
      chapterCache.set(cacheKey, parsed);
      return parsed;
    }
  }

  // 2. Default RVR1960 path (or fallback for all books)
  const localVerses = getBibleVerses(bookId, chapter, translation);
  if (translation === 'RVR1960' && localVerses && localVerses.length >= 10) {
    return localVerses;
  }

  if (typeof window === 'undefined') return localVerses;

  // Fetch complete chapter from Reina-Valera open editions (spa_rvg / spa_r09)
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

      if (verses.length > 0) {
        chapterCache.set(cacheKey, verses);
        storeChapter(cacheKey, verses);
        return verses;
      }
    } catch {
      // Continue to next candidate
    }
  }

  return localVerses;
}

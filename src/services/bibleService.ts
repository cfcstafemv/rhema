import type { BibleVerse } from '../types';
import { BIBLE_TRANSLATIONS, getBibleVerses } from '../data/bibleData';

export type BibleTranslation = (typeof BIBLE_TRANSLATIONS)[number];

export async function getAvailableBibleTranslations(): Promise<BibleTranslation[]> {
  const fallback: BibleTranslation[] = [...BIBLE_TRANSLATIONS];

  try {
    const response = await fetch('https://bible.helloao.org/api/available_translations.json', {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as { translations?: Array<Record<string, unknown>> };
    const available = Array.isArray(data?.translations) ? data.translations : [];

    const spanishTranslations = available
      .filter((item) => {
        const language = String(item.language ?? '').toLowerCase();
        const languageName = String(item.languageName ?? '').toLowerCase();
        const languageEnglishName = String(item.languageEnglishName ?? '').toLowerCase();
        return language === 'spa' || languageName.includes('español') || languageEnglishName.includes('spanish');
      })
      .map((item) => {
        const id = String(item.id ?? item.shortName ?? '').trim();
        const name = String(item.name ?? item.englishName ?? id || 'Biblia en español').trim();
        const shortName = String(item.shortName ?? id || name).trim();

        if (!id) return null;

        return {
          id,
          name: name || shortName || 'Biblia en español',
          shortName: shortName || id,
          description: String(item.description ?? `Versión bíblica ${name || shortName}`),
        } satisfies BibleTranslation;
      })
      .filter((item): item is BibleTranslation => Boolean(item));

    if (spanishTranslations.length > 0) {
      return spanishTranslations;
    }

    return fallback;
  } catch {
    return fallback;
  }
}

export async function getOrFetchChapterVerses(
  bookId: string,
  chapter: number,
  translation = 'RVR1960'
): Promise<BibleVerse[]> {
  const localVerses = getBibleVerses(bookId, chapter, translation);

  // Fallback offline-first support: the app works without an external API, and we keep
  // the translation selector functional even when remote providers are unavailable.
  return localVerses;
}

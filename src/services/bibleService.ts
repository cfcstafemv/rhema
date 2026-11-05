import type { BibleVerse } from '../types';
import { getBibleVerses } from '../data/bibleData';

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

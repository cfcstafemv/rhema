import { SermonNote, CardType } from '../types';
import { INITIAL_SAMPLE_SERMON } from '../data/bibleData';

const STORAGE_KEY = 'rhema_sermons_v1';
const ACTIVE_SERMON_KEY = 'rhema_active_sermon_id_v1';
const CARD_TYPE_LABELS_KEY = 'rhema_custom_card_type_labels_v1';

export const DEFAULT_CARD_TYPE_LABELS: Record<CardType, string> = {
  central: 'Mensaje Central',
  point: 'Punto Principal',
  action: 'Aplicación Práctica',
  illustration: 'Ilustración / Ejemplo',
  cross: 'Cita Cruzada',
};

export function getCustomCardTypeLabels(): Record<CardType, string> {
  try {
    const raw = localStorage.getItem(CARD_TYPE_LABELS_KEY);
    if (!raw) return { ...DEFAULT_CARD_TYPE_LABELS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CARD_TYPE_LABELS, ...parsed };
  } catch {
    return { ...DEFAULT_CARD_TYPE_LABELS };
  }
}

export function saveCustomCardTypeLabels(labels: Partial<Record<CardType, string>>): Record<CardType, string> {
  const current = getCustomCardTypeLabels();
  const updated = { ...current, ...labels };
  try {
    localStorage.setItem(CARD_TYPE_LABELS_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rhema_card_types_updated', { detail: updated }));
    }
  } catch (e) {
    console.error('Error saving custom card type labels', e);
  }
  return updated;
}

export function resetCustomCardTypeLabels(): Record<CardType, string> {
  try {
    localStorage.removeItem(CARD_TYPE_LABELS_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rhema_card_types_updated', { detail: DEFAULT_CARD_TYPE_LABELS }));
    }
  } catch (e) {
    console.error('Error resetting card type labels', e);
  }
  return { ...DEFAULT_CARD_TYPE_LABELS };
}

export function getAllSermons(): SermonNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = [INITIAL_SAMPLE_SERMON];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [INITIAL_SAMPLE_SERMON];
  } catch (error) {
    console.warn('Error loading sermons from localStorage, falling back to sample', error);
    return [INITIAL_SAMPLE_SERMON];
  }
}

export function saveSermon(sermon: SermonNote): void {
  try {
    const all = getAllSermons();
    const index = all.findIndex((s) => s.id === sermon.id);
    const updated = { ...sermon, updatedAt: Date.now() };

    let newAll: SermonNote[];
    if (index >= 0) {
      newAll = [...all];
      newAll[index] = updated;
    } else {
      newAll = [updated, ...all];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAll));
    localStorage.setItem(ACTIVE_SERMON_KEY, sermon.id);
  } catch (error) {
    console.error('Error saving sermon to localStorage', error);
  }
}

export function getActiveSermon(): SermonNote {
  const all = getAllSermons();
  const activeId = localStorage.getItem(ACTIVE_SERMON_KEY);
  if (activeId) {
    const found = all.find((s) => s.id === activeId);
    if (found) return found;
  }
  return all[0] || INITIAL_SAMPLE_SERMON;
}

export function createNewSermon(title = 'Nueva Prédica'): SermonNote {
  const newSermon: SermonNote = {
    id: 'sermon-' + Date.now(),
    title,
    preacher: 'Pastor ',
    churchName: 'Mi Iglesia',
    date: new Date().toISOString().split('T')[0],
    series: 'Serie Dominical',
    mainScripture: 'Juan 15:1-8',
    activePassage: {
      bookId: 'jua',
      chapter: 15,
    },
    highlights: [],
    cards: [
      {
        id: 'card-' + Date.now(),
        type: 'central',
        title: 'Mensaje Central',
        content: 'Escribe aquí la tesis o verdad principal expuesta por el pastor...',
        color: '#F59E0B',
        x: 60,
        y: 60,
        width: 320,
        zIndex: 1,
        createdAt: Date.now(),
      },
    ],
    links: [],
    reflection: {
      godSpokeToMe: '',
      personalApplication: '',
      prayerRequest: '',
      spiritualCommitment: '',
      keyGratitude: '',
      updatedAt: Date.now(),
    },
    updatedAt: Date.now(),
  };

  saveSermon(newSermon);
  return newSermon;
}

export function deleteSermon(id: string): SermonNote[] {
  const all = getAllSermons().filter((s) => s.id !== id);
  const finalAll = all.length > 0 ? all : [INITIAL_SAMPLE_SERMON];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(finalAll));
  localStorage.setItem(ACTIVE_SERMON_KEY, finalAll[0].id);
  return finalAll;
}

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

export function exportSermonToJson(sermon: SermonNote): void {
  if (typeof window === 'undefined') return;
  const jsonStr = JSON.stringify(sermon, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const cleanTitle = (sermon.title || 'Predica').replace(/[\s\W]+/g, '_');
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rhema_${cleanTitle}.rhema.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAllSermonsToJson(): void {
  if (typeof window === 'undefined') return;
  const all = getAllSermons();
  const jsonStr = JSON.stringify(all, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rhema_Todas_Las_Predicas_${dateStr}.rhema.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importSermonsFromJson(jsonString: string): {
  success: boolean;
  count: number;
  importedSermon?: SermonNote;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    const existing = getAllSermons();

    // Check if it's an array of sermons
    if (Array.isArray(parsed)) {
      const validSermons = parsed.filter(
        (s) => s && typeof s.title === 'string' && Array.isArray(s.cards)
      );
      if (validSermons.length === 0) {
        return {
          success: false,
          count: 0,
          error: 'El archivo no contiene un formato de prédica válido de Rhema.',
        };
      }

      const mergedMap = new Map<string, SermonNote>();
      existing.forEach((s) => mergedMap.set(s.id, s));
      validSermons.forEach((s) => mergedMap.set(s.id, s));

      const newAll = Array.from(mergedMap.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAll));
      localStorage.setItem(ACTIVE_SERMON_KEY, validSermons[0].id);

      return {
        success: true,
        count: validSermons.length,
        importedSermon: validSermons[0],
      };
    }

    // Check if it's a single sermon
    if (parsed && typeof parsed.title === 'string' && Array.isArray(parsed.cards)) {
      const sermonToImport: SermonNote = {
        ...parsed,
        id: parsed.id || 'sermon-' + Date.now(),
        updatedAt: Date.now(),
      };
      saveSermon(sermonToImport);
      localStorage.setItem(ACTIVE_SERMON_KEY, sermonToImport.id);

      return {
        success: true,
        count: 1,
        importedSermon: sermonToImport,
      };
    }

    return {
      success: false,
      count: 0,
      error: 'Estructura del archivo de prédica no reconocida.',
    };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      error: err.message || 'Error al procesar el archivo JSON.',
    };
  }
}

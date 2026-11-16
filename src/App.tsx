import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Header } from './components/Header';
import { BibleReader } from './components/BibleReader';
import { CanvasBoard } from './components/CanvasBoard';
import { CellLessonReader } from './components/CellLessonReader';
import { UnsavedChangesModal } from './components/UnsavedChangesModal';
import type { ParsedCellLesson } from './services/pdfService';
import { SermonNote, FloatingCard, VerseHighlight, CardType, PersonalReflection, SermonCategory } from './types';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layers,
  HeartHandshake,
  Maximize2,
} from 'lucide-react';
import {
  getActiveSermon,
  getAllSermons,
  saveSermon,
  createNewSermon,
  deleteSermon,
  getCustomCardTypeLabels,
} from './services/storage';
import { BIBLE_BOOKS, CARD_TYPES, BIBLE_TRANSLATIONS } from './data/bibleData';
import { getAvailableBibleTranslations, BibleTranslationOption } from './services/bibleService';

// Lazy-loaded heavy modals & secondary views to keep initial startup fast on tablets/low-end PCs
const PersonalReflectionsModal = React.lazy(() =>
  import('./components/PersonalReflectionsModal').then((m) => ({ default: m.PersonalReflectionsModal }))
);
const PresentationMode = React.lazy(() =>
  import('./components/PresentationMode').then((m) => ({ default: m.PresentationMode }))
);
const ExportModal = React.lazy(() =>
  import('./components/ExportModal').then((m) => ({ default: m.ExportModal }))
);
const SermonListModal = React.lazy(() =>
  import('./components/SermonListModal').then((m) => ({ default: m.SermonListModal }))
);
const QuickPassageSearchModal = React.lazy(() =>
  import('./components/QuickPassageSearchModal').then((m) => ({ default: m.QuickPassageSearchModal }))
);
const CellPdfUploadModal = React.lazy(() =>
  import('./components/CellPdfUploadModal').then((m) => ({ default: m.CellPdfUploadModal }))
);

const AUTO_SAVE_INTERVAL_MS = 90_000; // 1.5 minutos

export default function App() {
  const [sermons, setSermons] = useState<SermonNote[]>([]);
  const [sermon, setSermon] = useState<SermonNote>(() => getActiveSermon());
  const [activeView, setActiveView] = useState<'split' | 'canvas-only' | 'bible-only'>('split');
  const [isBibleCollapsed, setIsBibleCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTranslation, setCurrentTranslation] = useState('RVR1960');
  const [availableTranslations, setAvailableTranslations] = useState<BibleTranslationOption[]>(BIBLE_TRANSLATIONS as any);
  const [isReflectionsOpen, setIsReflectionsOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSermonsListOpen, setIsSermonsListOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isCellPdfUploadOpen, setIsCellPdfUploadOpen] = useState(false);
  const [highlightedVerseId, setHighlightedVerseId] = useState<number | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Save & dirty-tracking state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [unsavedPrompt, setUnsavedPrompt] = useState<{ isOpen: boolean; actionLabel: string }>({
    isOpen: false,
    actionLabel: 'continuar',
  });

  const sermonRef = useRef<SermonNote>(sermon);
  sermonRef.current = sermon;
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  hasUnsavedChangesRef.current = hasUnsavedChanges;
  const pendingActionRef = useRef<(() => void) | null>(null);

  const isCellMode = sermon.studyMode === 'cell' || sermon.category === 'Células de estudio';

  // Fast non-blocking splash screen
  useEffect(() => {
    let removeTimer: ReturnType<typeof setTimeout>;
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      removeTimer = setTimeout(() => {
        setShowSplash(false);
      }, 250);
    }, 450);
    return () => {
      clearTimeout(timer);
      if (removeTimer) clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    const loaded = getAllSermons();
    setSermons(loaded);
    const active = getActiveSermon();
    sermonRef.current = active;
    setSermon(active);

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('rhema_theme');
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getAvailableBibleTranslations()
      .then((translations) => {
        if (!isMounted) return;
        setAvailableTranslations(translations);
        setCurrentTranslation((existing) =>
          translations.some((translation) => translation.id === existing)
            ? existing
            : translations[0]?.id ?? 'RVR1960'
        );
      })
      .catch(() => {
        if (isMounted) {
          setAvailableTranslations(BIBLE_TRANSLATIONS as any);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const markDirty = useCallback(() => {
    hasUnsavedChangesRef.current = true;
    setHasUnsavedChanges(true);
  }, []);

  const updateSermonInMemory = useCallback((updater: (prev: SermonNote) => SermonNote) => {
    setSermon((prev) => {
      const next = updater(prev);
      sermonRef.current = next;
      return next;
    });
    hasUnsavedChangesRef.current = true;
    setHasUnsavedChanges(true);
  }, []);

  const flushSaveNow = useCallback(() => {
    const current = sermonRef.current;
    saveSermon(current);
    setSermons(getAllSermons());
    hasUnsavedChangesRef.current = false;
    setHasUnsavedChanges(false);
    setLastSavedAt(Date.now());
  }, []);

  const persistCurrentSermon = useCallback(() => {
    const activeEl = document.activeElement as HTMLElement | null;
    if (
      activeEl &&
      (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') &&
      activeEl.closest('[data-floating-card]')
    ) {
      activeEl.blur();
      setTimeout(() => {
        flushSaveNow();
      }, 0);
      return;
    }
    flushSaveNow();
  }, [flushSaveNow]);

  // Periodic background auto-save every 90 seconds (1.5 minutes) only if there are pending changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasUnsavedChangesRef.current) {
        flushSaveNow();
      }
    }, AUTO_SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [flushSaveNow]);

  // Browser tab close / reload warning when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChangesRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Global keyboard shortcuts: Ctrl/Cmd+K (search) and Ctrl/Cmd+S (manual save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (hasUnsavedChangesRef.current) {
          persistCurrentSermon();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [persistCurrentSermon]);

  const confirmIfUnsavedChanges = useCallback((actionLabel: string, action: () => void) => {
    if (!hasUnsavedChangesRef.current) {
      action();
      return;
    }
    pendingActionRef.current = action;
    setUnsavedPrompt({ isOpen: true, actionLabel });
  }, []);

  // Auto-hydrate previously saved cell lesson cards & LECTURA mainScripture if they still have placeholder/fallback text
  useEffect(() => {
    if (!isCellMode || !sermon.cellLesson) return;

    const needsCardHydration = sermon.cards.some(
      (c) =>
        c.linkedVerseRef &&
        (c.content.includes('Pasaje de estudio citado') ||
          c.content.includes('Abrir en la Biblia:') ||
          (c.content.includes('Clama a mí, y yo te responderé') &&
            !c.linkedVerseRef.toLowerCase().includes('jerem')) ||
          (c.content.includes('Lámpara es a mis pies tu palabra') &&
            !c.linkedVerseRef.toLowerCase().includes('salmo 119:105')))
    );

    const needsLecturaFix =
      sermon.mainScripture.includes(',') &&
      /lectura\s*:/i.test(sermon.cellLesson.fullText || '');

    if (!needsCardHydration && !needsLecturaFix) return;

    let cancelled = false;

    (async () => {
      const { fetchVerseRangeText, parseCellLesson } = await import('./services/pdfService');
      const currentSnapshot = sermonRef.current;

      let nextMainScripture = currentSnapshot.mainScripture;
      if (needsLecturaFix && currentSnapshot.cellLesson?.fullText) {
        const reparsed = await parseCellLesson(
          currentSnapshot.cellLesson.fullText,
          currentSnapshot.cellLesson.fileName
        );
        if (reparsed.readingScripture) {
          nextMainScripture = reparsed.readingScripture;
        }
      }

      const updatedCards = await Promise.all(
        currentSnapshot.cards.map(async (c) => {
          if (!c.linkedVerseRef) return c;
          const isPlaceholder =
            c.content.includes('Pasaje de estudio citado') ||
            c.content.includes('Abrir en la Biblia:') ||
            (c.content.includes('Clama a mí, y yo te responderé') &&
              !c.linkedVerseRef.toLowerCase().includes('jerem'));
          if (!isPlaceholder) return c;

          const realText = await fetchVerseRangeText(c.linkedVerseRef);
          if (!realText) return c;
          return {
            ...c,
            content: `«${realText}»`,
            linkedQuote: realText,
          };
        })
      );

      if (cancelled) return;
      const updatedSermon: SermonNote = {
        ...sermonRef.current,
        mainScripture: nextMainScripture,
        cards: updatedCards,
        updatedAt: Date.now(),
      };
      sermonRef.current = updatedSermon;
      setSermon(updatedSermon);
      saveSermon(updatedSermon);
      setSermons(getAllSermons());
    })();

    return () => {
      cancelled = true;
    };
  }, [sermon.id, isCellMode]);

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('rhema_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('rhema_theme', 'light');
      }
      return next;
    });
  }, []);

  const handleUpdateSermonMeta = useCallback(
    (updates: Partial<SermonNote>) => {
      updateSermonInMemory((prev) => ({
        ...prev,
        ...updates,
        updatedAt: Date.now(),
      }));
    },
    [updateSermonInMemory]
  );

  const handleSelectPassage = useCallback(
    (bookId: string, chapter: number) => {
      const book = BIBLE_BOOKS.find((b) => b.id === bookId);
      updateSermonInMemory((prev) => ({
        ...prev,
        activePassage: { bookId, chapter },
        mainScripture: `${book?.name || 'Biblia'} ${chapter}`,
        updatedAt: Date.now(),
      }));
    },
    [updateSermonInMemory]
  );

  const handleAddHighlight = useCallback(
    (highlightData: Omit<VerseHighlight, 'id' | 'createdAt'>): string => {
      const newId = 'hl-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
      const newHighlight: VerseHighlight = {
        ...highlightData,
        id: newId,
        createdAt: Date.now(),
      };

      updateSermonInMemory((prev) => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight],
        updatedAt: Date.now(),
      }));
      return newId;
    },
    [updateSermonInMemory]
  );

  const handleRemoveHighlight = useCallback(
    (highlightId: string) => {
      updateSermonInMemory((prev) => ({
        ...prev,
        highlights: prev.highlights.filter((h) => h.id !== highlightId),
        links: prev.links.filter((l) => l.fromHighlightId !== highlightId),
        cards: prev.cards.map((c) =>
          c.linkedHighlightId === highlightId
            ? { ...c, linkedHighlightId: undefined, linkedVerseRef: undefined, linkedQuote: undefined }
            : c
        ),
        updatedAt: Date.now(),
      }));
    },
    [updateSermonInMemory]
  );

  const handleCreateLinkedCard = useCallback(
    (
      highlightId: string,
      quote: string,
      verseRef: string,
      cardType: CardType,
      extra?: { imageUrl?: string; imageCaption?: string; title?: string }
    ) => {
      const typeInfo = CARD_TYPES.find((t) => t.id === cardType) || CARD_TYPES[0];
      const customLabels = getCustomCardTypeLabels();
      const newCardId = 'card-' + Date.now();

      updateSermonInMemory((prev) => {
        const cardCount = prev.cards.length;
        const posX = 40 + (cardCount % 3) * 340;
        const posY = 50 + Math.floor(cardCount / 3) * 260;

        const newCard: FloatingCard = {
          id: newCardId,
          type: cardType,
          title:
            extra?.title ||
            (cardType === 'central' ? customLabels.central || 'Verdad Central' : `Nota sobre ${verseRef}`),
          content: extra?.imageUrl
            ? extra.imageCaption || `Contexto geográfico e histórico de ${verseRef}`
            : `Reflexión inspirada en: "${quote}"`,
          color: typeInfo.color,
          x: posX,
          y: posY,
          width: 320,
          zIndex: cardCount + 2,
          linkedHighlightId: highlightId,
          linkedVerseRef: verseRef,
          linkedQuote: quote,
          imageUrl: extra?.imageUrl,
          imageCaption: extra?.imageCaption,
          createdAt: Date.now(),
        };

        const newLink = {
          id: 'link-' + Date.now(),
          fromHighlightId: highlightId,
          fromVerseRef: verseRef,
          toCardId: newCardId,
          color: typeInfo.color,
          label: customLabels[cardType] || typeInfo.label,
        };

        return {
          ...prev,
          cards: [...prev.cards, newCard],
          links: [...prev.links, newLink],
          updatedAt: Date.now(),
        };
      });

      setActiveView('split');
    },
    [updateSermonInMemory]
  );

  const handleAddCard = useCallback(
    (cardType: CardType) => {
      const typeInfo = CARD_TYPES.find((t) => t.id === cardType) || CARD_TYPES[0];
      const customLabels = getCustomCardTypeLabels();
      const newCardId = 'card-' + Date.now();

      updateSermonInMemory((prev) => {
        const cardCount = prev.cards.length;
        const posX = 60 + (cardCount % 3) * 330;
        const posY = 60 + Math.floor(cardCount / 3) * 250;

        const newCard: FloatingCard = {
          id: newCardId,
          type: cardType,
          title: customLabels[cardType] || typeInfo.label,
          content: '',
          color: typeInfo.color,
          x: posX,
          y: posY,
          width: 320,
          zIndex: cardCount + 2,
          createdAt: Date.now(),
        };

        return {
          ...prev,
          cards: [...prev.cards, newCard],
          updatedAt: Date.now(),
        };
      });
    },
    [updateSermonInMemory]
  );

  const handleUpdateCard = useCallback(
    (id: string, updates: Partial<FloatingCard>) => {
      updateSermonInMemory((prev) => ({
        ...prev,
        cards: prev.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        updatedAt: Date.now(),
      }));
    },
    [updateSermonInMemory]
  );

  const handleBatchUpdateCards = useCallback(
    (updatesList: Array<{ id: string; updates: Partial<FloatingCard> }>) => {
      const updateMap = new Map(updatesList.map((u) => [u.id, u.updates]));
      updateSermonInMemory((prev) => ({
        ...prev,
        cards: prev.cards.map((c) => {
          const patch = updateMap.get(c.id);
          return patch ? { ...c, ...patch } : c;
        }),
        updatedAt: Date.now(),
      }));
    },
    [updateSermonInMemory]
  );

  const handleDeleteCard = useCallback(
    (id: string) => {
      updateSermonInMemory((prev) => ({
        ...prev,
        cards: prev.cards.filter((c) => c.id !== id),
        links: prev.links.filter((l) => l.toCardId !== id),
        updatedAt: Date.now(),
      }));
    },
    [updateSermonInMemory]
  );

  const handleUpdateReflection = useCallback(
    (updates: Partial<PersonalReflection>) => {
      updateSermonInMemory((prev) => ({
        ...prev,
        reflection: {
          ...prev.reflection,
          ...updates,
          updatedAt: Date.now(),
        },
        updatedAt: Date.now(),
      }));
    },
    [updateSermonInMemory]
  );

  const handleConvertReflectionToCard = useCallback(
    (title: string, content: string) => {
      const newCardId = 'card-' + Date.now();
      updateSermonInMemory((prev) => {
        const newCard: FloatingCard = {
          id: newCardId,
          type: 'action',
          title,
          content,
          color: '#10B981',
          x: 80,
          y: 120,
          width: 330,
          zIndex: prev.cards.length + 5,
          createdAt: Date.now(),
        };
        return {
          ...prev,
          cards: [...prev.cards, newCard],
          updatedAt: Date.now(),
        };
      });
      setIsReflectionsOpen(false);
    },
    [updateSermonInMemory]
  );

  const handleApplyTemplate = useCallback(
    (newCards: FloatingCard[], mode: 'replace' | 'append') => {
      updateSermonInMemory((prev) => ({
        ...prev,
        cards: mode === 'replace' ? newCards : [...prev.cards, ...newCards],
        links: mode === 'replace' ? [] : prev.links,
        updatedAt: Date.now(),
      }));
      setActiveView('split');
    },
    [updateSermonInMemory]
  );

  const handleRequestOpenCellPdfUpload = useCallback(() => {
    confirmIfUnsavedChanges('cargar un nuevo PDF de célula', () => {
      setIsCellPdfUploadOpen(true);
    });
  }, [confirmIfUnsavedChanges]);

  const handleToggleCellMode = useCallback(() => {
    const current = sermonRef.current;
    const currentlyCell = current.studyMode === 'cell' || current.category === 'Células de estudio';
    const nextMode = currentlyCell ? 'sermon' : 'cell';
    const nextCategory: SermonCategory =
      nextMode === 'cell'
        ? 'Células de estudio'
        : current.category === 'Células de estudio'
        ? 'Predicas Dominicales'
        : current.category || 'Predicas Dominicales';

    const wasDirtyBefore = hasUnsavedChangesRef.current;

    updateSermonInMemory((prev) => ({
      ...prev,
      studyMode: nextMode,
      category: nextCategory,
      updatedAt: Date.now(),
    }));

    if (nextMode === 'cell' && !current.cellLesson) {
      if (wasDirtyBefore) {
        confirmIfUnsavedChanges('cargar un nuevo PDF de célula', () => {
          setIsCellPdfUploadOpen(true);
        });
      } else {
        setIsCellPdfUploadOpen(true);
      }
    }
  }, [updateSermonInMemory, confirmIfUnsavedChanges]);

  const handleCellLessonLoaded = useCallback((parsed: ParsedCellLesson) => {
    const newLessonId = 'sermon-cell-' + Date.now();
    const todayDate = new Date().toISOString().split('T')[0];

    const primaryScriptureText =
      parsed.readingScripture ||
      (parsed.detectedScriptures.length > 0
        ? parsed.detectedScriptures.map((s) => s.ref).join(', ')
        : 'Lección de Célula');

    let activePassageObj = { bookId: 'rom', chapter: 13 };
    if (
      parsed.detectedScriptures.length > 0 &&
      parsed.detectedScriptures[0].bookId &&
      parsed.detectedScriptures[0].chapter
    ) {
      activePassageObj = {
        bookId: parsed.detectedScriptures[0].bookId,
        chapter: parsed.detectedScriptures[0].chapter,
      };
    }

    const newCellSermon: SermonNote = {
      id: newLessonId,
      title: parsed.lessonTitle || 'Lección de Célula',
      category: 'Células de estudio',
      studyMode: 'cell',
      preacher: parsed.lessonNumber || 'LECCIÓN DE CÉLULA',
      churchName: sermonRef.current.churchName || 'Comunidad de Fe',
      date: todayDate,
      series: 'Estudios de Célula',
      mainScripture: primaryScriptureText,
      activePassage: activePassageObj,
      cellLesson: {
        fileName: parsed.fileName,
        lessonTitle: parsed.lessonTitle,
        lessonNumber: parsed.lessonNumber,
        fullText: parsed.fullText,
        detectedScriptures: parsed.detectedScriptures.map((s) => s.ref),
        detectedQuestions: parsed.detectedQuestions,
        icebreaker: parsed.icebreaker,
        loadedAt: Date.now(),
      },
      cards: parsed.cards,
      links: parsed.links,
      highlights: [],
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

    saveSermon(newCellSermon);
    setSermons(getAllSermons());
    sermonRef.current = newCellSermon;
    setSermon(newCellSermon);
    hasUnsavedChangesRef.current = false;
    setHasUnsavedChanges(false);
    setLastSavedAt(Date.now());
    setActiveView('split');
  }, []);

  const handleNavigateToLinkedVerse = useCallback(
    (verseRef: string) => {
      const match = verseRef.match(/^(.+?)\s+(\d+):(\d+)(?:[-–—]\d+)?$/);
      if (match) {
        const bookName = match[1].trim();
        const chapter = parseInt(match[2], 10);
        const verse = parseInt(match[3], 10);

        const foundBook = BIBLE_BOOKS.find(
          (b) =>
            b.name.toLowerCase() === bookName.toLowerCase() ||
            b.shortName.toLowerCase() === bookName.toLowerCase()
        );

        if (foundBook) {
          handleSelectPassage(foundBook.id, chapter);
          setHighlightedVerseId(verse);
          setActiveView('split');

          setTimeout(() => {
            const el = document.getElementById(`verse-${foundBook.id}-${chapter}-${verse}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 150);
        }
      }
    },
    [handleSelectPassage]
  );

  const handleSelectSermon = useCallback(
    (s: SermonNote) => {
      if (s.id === sermonRef.current.id) return;
      confirmIfUnsavedChanges('cambiar a otro estudio', () => {
        sermonRef.current = s;
        setSermon(s);
        localStorage.setItem('rhema_active_sermon_id_v1', s.id);
        hasUnsavedChangesRef.current = false;
        setHasUnsavedChanges(false);
      });
    },
    [confirmIfUnsavedChanges]
  );

  const handleNewSermon = useCallback(
    (category: SermonCategory = 'Predicas Dominicales') => {
      confirmIfUnsavedChanges('crear una nueva prédica', () => {
        const categoryTitles: Record<SermonCategory, string> = {
          'Predicas Dominicales': 'Prédica Dominical',
          'Estudios Devocionales': 'Estudio Devocional',
          'Células de estudio': 'Célula de Estudio',
          'Mis prédicas': 'Mi Prédica',
        };
        const prefix = categoryTitles[category] || 'Prédica';
        const newS = createNewSermon(
          `${prefix} — ${new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`,
          category
        );
        setSermons(getAllSermons());
        sermonRef.current = newS;
        setSermon(newS);
        hasUnsavedChangesRef.current = false;
        setHasUnsavedChanges(false);
        setLastSavedAt(Date.now());
      });
    },
    [confirmIfUnsavedChanges]
  );

  const handleUpdateSermonCategory = useCallback(
    (sermonId: string, category: SermonCategory) => {
      const target = sermons.find((s) => s.id === sermonId);
      if (target) {
        const updated = { ...target, category, updatedAt: Date.now() };
        saveSermon(updated);
        setSermons(getAllSermons());
        if (sermonRef.current.id === sermonId) {
          sermonRef.current = updated;
          setSermon(updated);
        }
      }
    },
    [sermons]
  );

  const handleDeleteSermon = useCallback((id: string) => {
    const remaining = deleteSermon(id);
    setSermons(remaining);
    if (sermonRef.current.id === id) {
      const active = getActiveSermon();
      sermonRef.current = active;
      setSermon(active);
      hasUnsavedChangesRef.current = false;
      setHasUnsavedChanges(false);
    }
  }, []);

  const handleImportSuccess = useCallback(
    (imported: SermonNote) => {
      confirmIfUnsavedChanges('abrir el estudio importado', () => {
        setSermons(getAllSermons());
        sermonRef.current = imported;
        setSermon(imported);
        localStorage.setItem('rhema_active_sermon_id_v1', imported.id);
        hasUnsavedChangesRef.current = false;
        setHasUnsavedChanges(false);
      });
    },
    [confirmIfUnsavedChanges]
  );

  const handleSelectPassageInCellMode = useCallback(
    (bookId: string, chapter: number) => {
      handleSelectPassage(bookId, chapter);
      handleToggleCellMode();
    },
    [handleSelectPassage, handleToggleCellMode]
  );

  const handleOpenSermonsList = useCallback(() => setIsSermonsListOpen(true), []);
  const handleOpenReflections = useCallback(() => setIsReflectionsOpen(true), []);
  const handleOpenPresentationMode = useCallback(() => setIsPresentationOpen(true), []);
  const handleOpenExport = useCallback(() => setIsExportOpen(true), []);
  const handleOpenQuickSearch = useCallback(() => setIsQuickSearchOpen(true), []);
  const handleCollapseBible = useCallback(() => setIsBibleCollapsed(true), []);
  const handleNewDefaultSermon = useCallback(() => handleNewSermon(), [handleNewSermon]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FBF9F5] dark:bg-[#0E1015] text-stone-900 dark:text-stone-100 relative">
      {showSplash && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FBF9F5] dark:bg-[#0E1015] transition-opacity duration-300 ${
            isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2 shadow-2xl flex items-center justify-center mb-4">
            <img
              src="/assets/aistudio/logoRHEMA_4329ba63.jpg"
              alt="Rhema Logo"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-cinzel font-bold text-stone-900 dark:text-stone-100 tracking-wider">
            RHEMA
          </h1>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-sans tracking-widest mt-1">
            ῥῆμα
          </span>
          <span className="text-xs text-amber-700 dark:text-amber-400 font-serif italic mt-3">
            Estudio & Lienzo de Prédicas
          </span>
        </div>
      )}

      <Header
        sermon={sermon}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenSermonsList={handleOpenSermonsList}
        onNewSermon={handleNewDefaultSermon}
        onOpenReflections={handleOpenReflections}
        onOpenPresentationMode={handleOpenPresentationMode}
        onOpenExport={handleOpenExport}
        onOpenQuickSearch={handleOpenQuickSearch}
        isCellMode={isCellMode}
        onToggleCellMode={handleToggleCellMode}
        onOpenCellPdfUpload={handleRequestOpenCellPdfUpload}
        onUpdateSermonMeta={handleUpdateSermonMeta}
        activeView={activeView}
        onViewChange={setActiveView}
        hasUnsavedChanges={hasUnsavedChanges}
        onManualSave={persistCurrentSermon}
        lastSavedAt={lastSavedAt}
      />

      <main className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Bible / Cell Lesson Panel with Sliding Drawer Animation */}
        {(activeView === 'split' || activeView === 'bible-only') && (
          <div
            className={`h-full transition-all duration-300 ease-in-out z-20 flex shrink-0 ${
              activeView === 'bible-only'
                ? 'w-full'
                : isBibleCollapsed
                ? 'w-0'
                : 'w-full md:w-[400px] lg:w-[460px] xl:w-[500px]'
            }`}
          >
            <div
              className={`h-full w-full overflow-hidden transition-opacity duration-200 ${
                isBibleCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              {isCellMode ? (
                <CellLessonReader
                  cellLesson={sermon.cellLesson}
                  onOpenUploadModal={handleRequestOpenCellPdfUpload}
                  onSwitchToSermonMode={handleToggleCellMode}
                  onSelectPassageInBible={handleSelectPassageInCellMode}
                  cards={sermon.cards}
                />
              ) : (
                <BibleReader
                  activeBookId={sermon.activePassage.bookId}
                  activeChapter={sermon.activePassage.chapter}
                  highlights={sermon.highlights}
                  onSelectPassage={handleSelectPassage}
                  onAddHighlight={handleAddHighlight}
                  onRemoveHighlight={handleRemoveHighlight}
                  onCreateLinkedCard={handleCreateLinkedCard}
                  highlightedVerseId={highlightedVerseId}
                  currentTranslation={currentTranslation}
                  onSelectTranslation={setCurrentTranslation}
                  translations={availableTranslations}
                  onToggleCollapse={handleCollapseBible}
                />
              )}
            </div>
          </div>
        )}

        {/* Sliding Arrow Tab to Toggle / Slide Bible Panel (Visible on Split View) */}
        {activeView === 'split' && (
          <button
            onClick={() => setIsBibleCollapsed(!isBibleCollapsed)}
            className={`absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-7 h-16 sm:w-6 sm:h-14 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-r-xl border border-l-0 border-amber-600/70 cursor-pointer active:scale-95 group ${
              isBibleCollapsed
                ? 'left-0'
                : 'left-[calc(100%-28px)] md:left-[400px] lg:left-[460px] xl:left-[500px]'
            }`}
            title={isBibleCollapsed ? 'Deslizar para abrir la Biblia' : 'Ocultar Biblia para expandir lienzo'}
            aria-label={isBibleCollapsed ? 'Abrir Biblia' : 'Ocultar Biblia'}
          >
            {isBibleCollapsed ? (
              <ChevronRight className="w-4 h-4 text-white animate-pulse group-hover:scale-110 transition-transform" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            )}
          </button>
        )}

        {/* Canvas Board Area */}
        {(activeView === 'split' || activeView === 'canvas-only') && (
          <div className="flex-1 h-full relative overflow-hidden">
            <CanvasBoard
              cards={sermon.cards}
              links={sermon.links}
              highlights={sermon.highlights}
              onUpdateCard={handleUpdateCard}
              onBatchUpdateCards={handleBatchUpdateCards}
              onCardDirty={markDirty}
              onDeleteCard={handleDeleteCard}
              onAddCard={handleAddCard}
              onNavigateToLinkedVerse={handleNavigateToLinkedVerse}
              onApplyTemplate={handleApplyTemplate}
              isSplitView={activeView === 'split' && !isBibleCollapsed}
            />
          </div>
        )}
      </main>

      {/* Mobile & Tablet Quick Bottom Navigation Bar (Hidden on Desktop) */}
      <nav className="sm:hidden flex items-center justify-around bg-white/95 dark:bg-[#12141A]/95 border-t border-stone-200 dark:border-stone-800 py-1.5 px-2 z-30 backdrop-blur-md">
        <button
          onClick={() => {
            setActiveView('bible-only');
            setIsBibleCollapsed(false);
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            activeView === 'bible-only'
              ? 'text-amber-700 dark:text-amber-400 font-bold'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Biblia</span>
        </button>

        <button
          onClick={() => {
            setActiveView('canvas-only');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            activeView === 'canvas-only'
              ? 'text-amber-700 dark:text-amber-400 font-bold'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Lienzo</span>
        </button>

        <button
          onClick={() => {
            setActiveView('split');
            setIsBibleCollapsed(false);
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            activeView === 'split'
              ? 'text-amber-700 dark:text-amber-400 font-bold'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
          }`}
        >
          <div className="flex items-center gap-0.5">
            <BookOpen className="w-3.5 h-3.5" />
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span>Dividida</span>
        </button>

        <button
          onClick={handleOpenReflections}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 transition-colors cursor-pointer"
        >
          <HeartHandshake className="w-4 h-4 text-pink-500" />
          <span>Diario</span>
        </button>

        <button
          onClick={handleOpenPresentationMode}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-4 h-4 text-amber-500" />
          <span>Modo Culto</span>
        </button>
      </nav>

      {/* Lazy-mounted modals (only loaded into memory when opened) */}
      <Suspense fallback={null}>
        {isReflectionsOpen && (
          <PersonalReflectionsModal
            isOpen={isReflectionsOpen}
            onClose={() => setIsReflectionsOpen(false)}
            reflection={sermon.reflection}
            onUpdateReflection={handleUpdateReflection}
            onConvertReflectionToCard={handleConvertReflectionToCard}
          />
        )}

        {isPresentationOpen && (
          <PresentationMode
            isOpen={isPresentationOpen}
            onClose={() => setIsPresentationOpen(false)}
            sermon={sermon}
            currentTranslation={currentTranslation}
          />
        )}

        {isExportOpen && (
          <ExportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            sermon={sermon}
          />
        )}

        {isSermonsListOpen && (
          <SermonListModal
            isOpen={isSermonsListOpen}
            onClose={() => setIsSermonsListOpen(false)}
            sermons={sermons}
            activeSermonId={sermon.id}
            onSelectSermon={handleSelectSermon}
            onNewSermon={handleNewSermon}
            onDeleteSermon={handleDeleteSermon}
            onImportSuccess={handleImportSuccess}
            onUpdateSermonCategory={handleUpdateSermonCategory}
          />
        )}

        {isQuickSearchOpen && (
          <QuickPassageSearchModal
            isOpen={isQuickSearchOpen}
            onClose={() => setIsQuickSearchOpen(false)}
            onSelectPassage={(bookId, chapter, verse) => {
              handleSelectPassage(bookId, chapter);
              if (verse) {
                setHighlightedVerseId(verse);
              }
            }}
            currentBookId={sermon.activePassage.bookId}
            currentChapter={sermon.activePassage.chapter}
          />
        )}

        {isCellPdfUploadOpen && (
          <CellPdfUploadModal
            isOpen={isCellPdfUploadOpen}
            onClose={() => setIsCellPdfUploadOpen(false)}
            onLessonLoaded={handleCellLessonLoaded}
          />
        )}
      </Suspense>

      {/* Save-before-leaving / switching modal */}
      <UnsavedChangesModal
        isOpen={unsavedPrompt.isOpen}
        actionLabel={unsavedPrompt.actionLabel}
        onSaveAndContinue={() => {
          flushSaveNow();
          setUnsavedPrompt({ isOpen: false, actionLabel: 'continuar' });
          const act = pendingActionRef.current;
          pendingActionRef.current = null;
          act?.();
        }}
        onDiscardAndContinue={() => {
          hasUnsavedChangesRef.current = false;
          setHasUnsavedChanges(false);
          setUnsavedPrompt({ isOpen: false, actionLabel: 'continuar' });
          const act = pendingActionRef.current;
          pendingActionRef.current = null;
          act?.();
        }}
        onCancel={() => {
          pendingActionRef.current = null;
          setUnsavedPrompt({ isOpen: false, actionLabel: 'continuar' });
        }}
      />
    </div>
  );
}

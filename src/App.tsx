import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Header } from './components/Header';
import { BibleReader } from './components/BibleReader';
import { CanvasBoard } from './components/CanvasBoard';
import { CellLessonReader } from './components/CellLessonReader';
import { UnsavedChangesModal } from './components/UnsavedChangesModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import type { ParsedCellLesson } from './services/pdfService';
import { SermonNote, FloatingCard, VerseHighlight, CardType, PersonalReflection, SermonCategory } from './types';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layers,
  HeartHandshake,
  Maximize2,
  Users,
  MonitorPlay,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { ProjectorScreen } from './components/ProjectorScreen';
import {
  ProjectorSlidePayload,
  broadcastProjectorSlide,
  getLastProjectorSlide,
  subscribeProjectorPresence,
} from './services/projectorSync';
import type { User } from 'firebase/auth';
import {
  getActiveSermon,
  getAllSermons,
  saveSermon,
  createNewSermon,
  deleteSermon,
  replaceAllSermonsInStorage,
  getCustomCardTypeLabels,
} from './services/storage';
import { BIBLE_BOOKS, CARD_TYPES, BIBLE_TRANSLATIONS } from './data/bibleData';
import { getAvailableBibleTranslations, BibleTranslationOption } from './services/bibleService';
import { arrangeCardsInZones, computeNewCardPosition } from './utils/canvasZones';

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
const DriveSyncModal = React.lazy(() =>
  import('./components/DriveSyncModal').then((m) => ({ default: m.DriveSyncModal }))
);
const FirstVisitGoogleModal = React.lazy(() =>
  import('./components/FirstVisitGoogleModal').then((m) => ({ default: m.FirstVisitGoogleModal }))
);
const ProjectorModal = React.lazy(() =>
  import('./components/ProjectorModal').then((m) => ({ default: m.ProjectorModal }))
);

const AUTO_SAVE_INTERVAL_MS = 90_000; // 1.5 minutos
const FIRST_VISIT_AUTH_PROMPT_KEY = 'rhema_first_visit_auth_prompt_v1';

const isProjectorQueryUrl = (): boolean => {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('proyector');
};

const isPrivacyQueryUrl = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.location.search.includes('privacidad') ||
    window.location.hash.toLowerCase().includes('privacidad')
  );
};

const isMobileViewport = (): boolean => {
  if (typeof window === 'undefined') return false;
  const narrowScreen = window.innerWidth < 768;
  const mobileUA =
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  return narrowScreen || (mobileUA && window.innerWidth < 900);
};

function MainStudioApp() {
  const [sermons, setSermons] = useState<SermonNote[]>([]);
  const [sermon, setSermon] = useState<SermonNote>(() => getActiveSermon());
  const [isMobile, setIsMobile] = useState<boolean>(() => isMobileViewport());
  const [activeView, setActiveView] = useState<'split' | 'canvas-only' | 'bible-only'>(() =>
    isMobileViewport() ? 'bible-only' : 'split'
  );
  const [cellLeftView, setCellLeftView] = useState<'cell' | 'bible'>('cell');
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
  const [isDriveSyncOpen, setIsDriveSyncOpen] = useState(false);
  const [isPrivacyStandalone] = useState<boolean>(() => isPrivacyQueryUrl());
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(() => isPrivacyQueryUrl());
  const [isProjectorModalOpen, setIsProjectorModalOpen] = useState(false);
  const [isProjectorConnected, setIsProjectorConnected] = useState(false);
  const [hasProjectedInSession, setHasProjectedInSession] = useState(false);
  const [currentProjectedSlide, setCurrentProjectedSlide] = useState<ProjectorSlidePayload>(() => {
    return (
      getLastProjectorSlide() || {
        kind: 'idle',
        sermonTitle: 'Rhema',
        sermonScripture: 'Estudio & Lienzo Bíblico',
        updatedAt: Date.now(),
      }
    );
  });
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [hasDriveToken, setHasDriveToken] = useState(false);
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [isFirstVisitAuthOpen, setIsFirstVisitAuthOpen] = useState(false);
  const [highlightedVerseId, setHighlightedVerseId] = useState<number | null>(null);
  const [showSplash, setShowSplash] = useState<boolean>(() => !isPrivacyQueryUrl());
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

  const splashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const splashFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCellMode = sermon.studyMode === 'cell' || sermon.category === 'Células de estudio';

  const triggerSplash = useCallback((durationMs = 1600) => {
    if (splashTimerRef.current) clearTimeout(splashTimerRef.current);
    if (splashFadeTimerRef.current) clearTimeout(splashFadeTimerRef.current);
    setIsFadingOut(false);
    setShowSplash(true);
    splashTimerRef.current = setTimeout(() => {
      setIsFadingOut(true);
      splashFadeTimerRef.current = setTimeout(() => {
        setShowSplash(false);
      }, 350);
    }, durationMs);
  }, []);

  // Initial splash screen with bounce effect (skipped if opened directly to ?privacidad=1)
  useEffect(() => {
    if (isPrivacyQueryUrl()) {
      setShowSplash(false);
      return;
    }
    triggerSplash(900);
    return () => {
      if (splashTimerRef.current) clearTimeout(splashTimerRef.current);
      if (splashFadeTimerRef.current) clearTimeout(splashFadeTimerRef.current);
    };
  }, [triggerSplash]);

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

    const handleResize = () => {
      const mobileNow = isMobileViewport();
      setIsMobile(mobileNow);
      if (mobileNow) {
        setActiveView((prev) => (prev === 'split' ? 'bible-only' : prev));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // Initialize Firebase Google Auth listener lazily after startup
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    const fallbackTimer = setTimeout(() => {
      if (!cancelled) setIsAuthResolved(true);
    }, 1800);

    import('./services/googleAuth')
      .then(({ initAuth }) => {
        if (cancelled) return;
        unsub = initAuth(
          (user) => {
            setGoogleUser(user);
            setHasDriveToken(true);
            setIsAuthResolved(true);
          },
          (user) => {
            setGoogleUser(user);
            setHasDriveToken(false);
            setIsAuthResolved(true);
          },
          () => {
            setGoogleUser(null);
            setHasDriveToken(false);
            setIsAuthResolved(true);
          }
        );
      })
      .catch(() => {
        if (!cancelled) setIsAuthResolved(true);
      });

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
      unsub?.();
    };
  }, []);

  // Suggest Google sign-in on the user's very first visit
  useEffect(() => {
    if (googleUser) {
      try {
        localStorage.setItem(FIRST_VISIT_AUTH_PROMPT_KEY, '1');
      } catch {
        // ignore storage errors
      }
      return;
    }
    if (showSplash || !isAuthResolved || isPrivacyOpen) return;
    try {
      if (!localStorage.getItem(FIRST_VISIT_AUTH_PROMPT_KEY)) {
        setIsFirstVisitAuthOpen(true);
      }
    } catch {
      // ignore storage errors
    }
  }, [showSplash, isAuthResolved, googleUser, isPrivacyOpen]);

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
      extra?: { imageUrl?: string; imageCaption?: string; title?: string; customTypeLabel?: string }
    ) => {
      const typeInfo = CARD_TYPES.find((t) => t.id === cardType) || CARD_TYPES[0];
      const customLabels = getCustomCardTypeLabels();
      const newCardId = 'card-' + Date.now();

      updateSermonInMemory((prev) => {
        const cardCount = prev.cards.length;
        const cellModeActive =
          prev.studyMode === 'cell' || prev.category === 'Células de estudio';
        const draftCard: Partial<FloatingCard> = {
          id: newCardId,
          type: cardType,
          customTypeLabel: extra?.customTypeLabel,
          tags: extra?.customTypeLabel ? [extra.customTypeLabel] : undefined,
          title:
            extra?.title ||
            (cardType === 'central' ? customLabels.central || 'Verdad Central' : `Nota sobre ${verseRef}`),
          content: extra?.imageUrl
            ? extra.imageCaption || `Contexto geográfico e histórico de ${verseRef}`
            : `Reflexión inspirada en: "${quote}"`,
          linkedVerseRef: verseRef,
          imageUrl: extra?.imageUrl,
        };
        const { x: posX, y: posY } = computeNewCardPosition(
          prev.cards,
          draftCard,
          cellModeActive
        );

        const newCard: FloatingCard = {
          id: newCardId,
          type: cardType,
          customTypeLabel: extra?.customTypeLabel,
          tags: extra?.customTypeLabel ? [extra.customTypeLabel] : undefined,
          title: draftCard.title!,
          content: draftCard.content!,
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
          label: extra?.customTypeLabel || customLabels[cardType] || typeInfo.label,
        };

        return {
          ...prev,
          cards: [...prev.cards, newCard],
          links: [...prev.links, newLink],
          updatedAt: Date.now(),
        };
      });

      if (!isMobileViewport()) {
        setActiveView('split');
      }
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
        const cellModeActive =
          prev.studyMode === 'cell' || prev.category === 'Células de estudio';
        const title = customLabels[cardType] || typeInfo.label;
        const { x: posX, y: posY } = computeNewCardPosition(
          prev.cards,
          { id: newCardId, type: cardType, title },
          cellModeActive
        );

        const newCard: FloatingCard = {
          id: newCardId,
          type: cardType,
          title,
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

  const handleCreateCellQuestionCard = useCallback(
    (idx: number, questionTitle: string, content: string) => {
      updateSermonInMemory((prev) => {
        const existing = prev.cards.find(
          (c) => /^card-cell-q-.*-\d+$/.test(c.id) && c.id.endsWith(`-${idx}`)
        );
        if (existing) {
          return {
            ...prev,
            cards: prev.cards.map((c) =>
              c.id === existing.id ? { ...c, content } : c
            ),
            updatedAt: Date.now(),
          };
        }

        const newCardId = `card-cell-q-${Date.now()}-${idx}`;
        const pos = computeNewCardPosition(
          prev.cards,
          {
            id: newCardId,
            type: 'action',
            customTypeLabel: 'Pregunta de Diálogo',
            tags: ['Pregunta de Diálogo'],
            title: questionTitle,
          },
          true
        );

        const newCard: FloatingCard = {
          id: newCardId,
          type: 'action',
          customTypeLabel: 'Pregunta de Diálogo',
          tags: ['Pregunta de Diálogo'],
          title: questionTitle,
          content,
          color: '#10B981',
          x: pos.x,
          y: pos.y,
          width: 320,
          zIndex: prev.cards.length + 2,
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
      updateSermonInMemory((prev) => {
        const cellModeActive =
          prev.studyMode === 'cell' || prev.category === 'Células de estudio';

        if (mode === 'replace') {
          const arranged = arrangeCardsInZones(newCards, cellModeActive);
          const posMap = new Map(arranged.map((p) => [p.id, p]));
          const positioned = newCards.map((c) => {
            const pos = posMap.get(c.id);
            return pos ? { ...c, x: pos.x, y: pos.y } : c;
          });
          return {
            ...prev,
            cards: positioned,
            links: [],
            updatedAt: Date.now(),
          };
        }

        const accCards = [...prev.cards];
        for (const tplCard of newCards) {
          const pos = computeNewCardPosition(accCards, tplCard, cellModeActive);
          accCards.push({ ...tplCard, x: pos.x, y: pos.y });
        }

        return {
          ...prev,
          cards: accCards,
          updatedAt: Date.now(),
        };
      });
      setActiveView(isMobileViewport() ? 'canvas-only' : 'split');
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

    setCellLeftView('cell');
    if (nextMode === 'cell' && isMobileViewport()) {
      setActiveView('bible-only');
      setIsBibleCollapsed(false);
    }

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
    setCellLeftView('cell');
    setIsBibleCollapsed(false);
    setActiveView(isMobileViewport() ? 'bible-only' : 'split');
  }, []);

  const handleNavigateToLinkedVerse = useCallback(
    (verseRef: string) => {
      const match = verseRef.match(/^(.+?)\s+(\d+):(\d+)(?:[-–—]\d+)?$/);
      if (match) {
        const rawBookName = match[1].trim().toLowerCase();
        const normalizedBookName = rawBookName === 'salmo' ? 'salmos' : rawBookName;
        const chapter = parseInt(match[2], 10);
        const verse = parseInt(match[3], 10);

        const foundBook = BIBLE_BOOKS.find(
          (b) =>
            b.name.toLowerCase() === normalizedBookName ||
            b.shortName.toLowerCase() === normalizedBookName
        );

        if (foundBook) {
          const current = sermonRef.current;
          const currentlyCell =
            current.studyMode === 'cell' || current.category === 'Células de estudio';
          handleSelectPassage(foundBook.id, chapter);
          if (currentlyCell) {
            setCellLeftView('bible');
          }
          setIsBibleCollapsed(false);
          setHighlightedVerseId(verse);
          setActiveView(isMobileViewport() ? 'bible-only' : 'split');

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
        setCellLeftView('cell');
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
        setCellLeftView('cell');
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
      setCellLeftView('cell');
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
        setCellLeftView('cell');
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
      setCellLeftView('bible');
      setIsBibleCollapsed(false);
    },
    [handleSelectPassage]
  );

  const handleOpenSermonsList = useCallback(() => setIsSermonsListOpen(true), []);
  const handleOpenReflections = useCallback(() => setIsReflectionsOpen(true), []);
  const handleOpenPresentationMode = useCallback(() => setIsPresentationOpen(true), []);
  const handleOpenExport = useCallback(() => setIsExportOpen(true), []);
  const handleOpenQuickSearch = useCallback(() => setIsQuickSearchOpen(true), []);
  const handleOpenDriveSync = useCallback(() => setIsDriveSyncOpen(true), []);
  const handleOpenPrivacy = useCallback(() => setIsPrivacyOpen(true), []);
  const handleCollapseBible = useCallback(() => setIsBibleCollapsed(true), []);
  const handleNewDefaultSermon = useCallback(() => handleNewSermon(), [handleNewSermon]);

  const handleAuthUpdated = useCallback((user: User | null, hasToken: boolean) => {
    setGoogleUser(user);
    setHasDriveToken(hasToken);
  }, []);

  const handleMergedFromDrive = useCallback((mergedSermons: SermonNote[], preferredActiveId?: string) => {
    const stored = replaceAllSermonsInStorage(mergedSermons, sermonRef.current.id || preferredActiveId);
    setSermons(stored);
    const active = getActiveSermon();
    sermonRef.current = active;
    setSermon(active);
    hasUnsavedChangesRef.current = false;
    setHasUnsavedChanges(false);
    setLastSavedAt(Date.now());
  }, []);

  const handleReplaySplash = useCallback(() => triggerSplash(1600), [triggerSplash]);

  useEffect(() => {
    const unsub = subscribeProjectorPresence(() => {
      setIsProjectorConnected(true);
    });
    return () => unsub();
  }, []);

  const handleProjectSlide = useCallback(
    (slide: Omit<ProjectorSlidePayload, 'updatedAt'>) => {
      const sent = broadcastProjectorSlide(slide);
      setCurrentProjectedSlide(sent);
      setHasProjectedInSession(true);
    },
    []
  );

  const handleProjectVerse = useCallback(
    (verseText: string, ref: string, translation: string) => {
      handleProjectSlide({
        kind: 'verse',
        reference: ref,
        content: verseText,
        translation,
        sermonTitle: sermonRef.current.title,
        sermonScripture: sermonRef.current.mainScripture,
      });
    },
    [handleProjectSlide]
  );

  const handleProjectCard = useCallback(
    (card: FloatingCard) => {
      const current = sermonRef.current;
      const isQuestion =
        card.customTypeLabel === 'Pregunta de Diálogo' ||
        card.tags?.includes('Pregunta de Diálogo');

      if (isQuestion) {
        handleProjectSlide({
          kind: 'question',
          title: 'Pregunta para Dialogar',
          content: card.title,
          sermonTitle: current.title,
          sermonScripture: current.mainScripture,
        });
        return;
      }

      const isVerseCard =
        (card.customTypeLabel === 'Cita Bíblica' || card.tags?.includes('Cita Bíblica')) &&
        Boolean(card.linkedVerseRef) &&
        Boolean(card.linkedQuote);

      if (isVerseCard) {
        handleProjectSlide({
          kind: 'verse',
          reference: card.linkedVerseRef,
          content: card.linkedQuote || card.content.replace(/^[«"]|[»"]$/g, ''),
          sermonTitle: current.title,
          sermonScripture: current.mainScripture,
        });
        return;
      }

      handleProjectSlide({
        kind: 'card',
        title: card.title,
        content: card.content,
        reference: card.linkedVerseRef,
        quote: card.linkedQuote,
        imageUrl: card.imageUrl,
        accentColor: card.color,
        sermonTitle: current.title,
        sermonScripture: current.mainScripture,
      });
    },
    [handleProjectSlide]
  );

  const handleProjectCellScripture = useCallback(
    async (ref: string, quoteText?: string) => {
      const current = sermonRef.current;
      if (quoteText && quoteText.trim()) {
        handleProjectSlide({
          kind: 'verse',
          reference: ref,
          content: quoteText.trim(),
          sermonTitle: current.title,
          sermonScripture: current.mainScripture,
        });
        return;
      }

      try {
        const { fetchVerseRangeText } = await import('./services/pdfService');
        const fetched = await fetchVerseRangeText(ref);
        handleProjectSlide({
          kind: 'verse',
          reference: ref,
          content: fetched || ref,
          sermonTitle: current.title,
          sermonScripture: current.mainScripture,
        });
      } catch {
        handleProjectSlide({
          kind: 'verse',
          reference: ref,
          content: ref,
          sermonTitle: current.title,
          sermonScripture: current.mainScripture,
        });
      }
    },
    [handleProjectSlide]
  );

  const handleProjectQuestion = useCallback(
    (questionText: string) => {
      const current = sermonRef.current;
      handleProjectSlide({
        kind: 'question',
        title: 'Pregunta para Dialogar',
        content: questionText,
        sermonTitle: current.title,
        sermonScripture: current.mainScripture,
      });
    },
    [handleProjectSlide]
  );

  const handleOpenProjector = useCallback(() => setIsProjectorModalOpen(true), []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FBF9F5] dark:bg-[#0E1015] text-stone-900 dark:text-stone-100 relative">
      {showSplash && (
        <div
          onClick={() => {
            if (splashTimerRef.current) clearTimeout(splashTimerRef.current);
            if (splashFadeTimerRef.current) clearTimeout(splashFadeTimerRef.current);
            setIsFadingOut(true);
            splashFadeTimerRef.current = setTimeout(() => setShowSplash(false), 250);
          }}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FBF9F5] dark:bg-[#0E1015] transition-opacity duration-300 cursor-pointer ${
            isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2 shadow-2xl animate-bounce flex items-center justify-center mb-4">
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
        onShowSplash={handleReplaySplash}
        onOpenDriveSync={handleOpenDriveSync}
        googleUserPhoto={googleUser?.photoURL}
        googleUserName={googleUser?.displayName || googleUser?.email}
        isDriveConnected={Boolean(googleUser && hasDriveToken)}
        onOpenPrivacy={handleOpenPrivacy}
        onOpenProjector={handleOpenProjector}
        isProjectorConnected={isProjectorConnected}
        hasActiveProjectorSlide={
          hasProjectedInSession &&
          currentProjectedSlide.kind !== 'idle' &&
          currentProjectedSlide.kind !== 'blackout'
        }
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
              {isCellMode && cellLeftView === 'cell' ? (
                <CellLessonReader
                  cellLesson={sermon.cellLesson}
                  onOpenUploadModal={handleRequestOpenCellPdfUpload}
                  onSwitchToSermonMode={handleToggleCellMode}
                  onOpenBibleInCellMode={() => setCellLeftView('bible')}
                  onOpenScriptureRef={handleNavigateToLinkedVerse}
                  onSelectPassageInBible={handleSelectPassageInCellMode}
                  onUpdateCard={handleUpdateCard}
                  onCreateQuestionCard={handleCreateCellQuestionCard}
                  onDirty={markDirty}
                  onProjectScripture={handleProjectCellScripture}
                  onProjectQuestion={handleProjectQuestion}
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
                  onBackToCellLesson={isCellMode ? () => setCellLeftView('cell') : undefined}
                  onProjectVerse={handleProjectVerse}
                />
              )}
            </div>
          </div>
        )}

        {/* Sliding Arrow Tab to Toggle / Slide Bible Panel (Visible on Desktop/Tablet Split View) */}
        {activeView === 'split' && (
          <button
            onClick={() => setIsBibleCollapsed(!isBibleCollapsed)}
            className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-30 items-center justify-center w-6 h-14 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-r-xl border border-l-0 border-amber-600/70 cursor-pointer active:scale-95 group ${
              isBibleCollapsed
                ? 'left-0'
                : 'left-[400px] lg:left-[460px] xl:left-[500px]'
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
              onProjectCard={handleProjectCard}
              onApplyTemplate={handleApplyTemplate}
              isSplitView={activeView === 'split' && !isBibleCollapsed}
              isCellMode={isCellMode}
            />
          </div>
        )}

        {/* Quick Live Projector Controls (Only visible when projector window is connected or projecting in this session) */}
        {(isProjectorConnected || hasProjectedInSession) && !isPresentationOpen && (
          <div className="fixed bottom-16 md:bottom-4 right-4 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-900/95 text-stone-100 border border-stone-700/80 shadow-xl backdrop-blur-md text-[11px] font-sans">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isProjectorConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="max-w-[130px] truncate text-stone-300 font-medium">
              {currentProjectedSlide.kind === 'blackout'
                ? 'Negro'
                : currentProjectedSlide.kind === 'idle'
                ? 'Portada'
                : currentProjectedSlide.reference || currentProjectedSlide.title || 'En vivo'}
            </span>
            <button
              type="button"
              onClick={() =>
                handleProjectSlide({
                  kind: 'idle',
                  sermonTitle: sermon.title,
                  sermonScripture: sermon.mainScripture,
                })
              }
              className="p-1 rounded-lg hover:bg-stone-800 text-amber-400 transition-colors cursor-pointer"
              title="Mostrar portada en el proyector"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleProjectSlide({ kind: 'blackout' })}
              className="p-1 rounded-lg hover:bg-stone-800 text-stone-300 transition-colors cursor-pointer"
              title="Poner proyector en negro"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleOpenProjector}
              className="px-2 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors cursor-pointer flex items-center gap-1"
              title="Abrir panel de proyector"
            >
              <MonitorPlay className="w-3 h-3" />
              <span>Panel</span>
            </button>
          </div>
        )}
      </main>

      {/* Mobile Quick Bottom Navigation Bar (Visible on < 768px) */}
      <nav className="md:hidden flex items-center justify-around bg-white/95 dark:bg-[#12141A]/95 border-t border-stone-200 dark:border-stone-800 py-1.5 px-1.5 z-30 backdrop-blur-md shrink-0">
        {isCellMode && (
          <button
            type="button"
            onClick={() => {
              setCellLeftView('cell');
              setActiveView('bible-only');
              setIsBibleCollapsed(false);
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
              activeView === 'bible-only' && cellLeftView === 'cell'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Célula</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (isCellMode) setCellLeftView('bible');
            setActiveView('bible-only');
            setIsBibleCollapsed(false);
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            activeView === 'bible-only' && (!isCellMode || cellLeftView === 'bible')
              ? 'text-amber-700 dark:text-amber-400 font-bold'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Biblia</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveView('canvas-only');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            activeView === 'canvas-only'
              ? 'text-amber-700 dark:text-amber-400 font-bold'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Lienzo</span>
        </button>

        <button
          type="button"
          onClick={handleOpenReflections}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 transition-colors cursor-pointer"
        >
          <HeartHandshake className="w-4 h-4 text-pink-500" />
          <span>Diario</span>
        </button>

        <button
          type="button"
          onClick={handleOpenPresentationMode}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 transition-colors cursor-pointer"
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
            onProjectSlide={handleProjectSlide}
          />
        )}

        {isProjectorModalOpen && (
          <ProjectorModal
            isOpen={isProjectorModalOpen}
            onClose={() => setIsProjectorModalOpen(false)}
            sermon={sermon}
            currentSlide={currentProjectedSlide}
            isProjectorConnected={isProjectorConnected}
            onProjectSlide={handleProjectSlide}
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
              if (isCellMode) {
                setCellLeftView('bible');
              }
              if (isMobile) {
                setActiveView('bible-only');
              }
              setIsBibleCollapsed(false);
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

        {isDriveSyncOpen && (
          <DriveSyncModal
            isOpen={isDriveSyncOpen}
            onClose={() => setIsDriveSyncOpen(false)}
            googleUser={googleUser}
            hasAccessToken={hasDriveToken}
            onAuthUpdated={handleAuthUpdated}
            localSermonsCount={sermons.length}
            activeSermonId={sermon.id}
            hasUnsavedChanges={hasUnsavedChanges}
            onFlushLocalSave={flushSaveNow}
            onMergedFromDrive={handleMergedFromDrive}
            onOpenPrivacy={() => {
              setIsDriveSyncOpen(false);
              setIsPrivacyOpen(true);
            }}
          />
        )}

        {isFirstVisitAuthOpen && (
          <FirstVisitGoogleModal
            isOpen={isFirstVisitAuthOpen}
            onClose={() => {
              try {
                localStorage.setItem(FIRST_VISIT_AUTH_PROMPT_KEY, '1');
              } catch {
                // ignore
              }
              setIsFirstVisitAuthOpen(false);
            }}
            onAuthUpdated={handleAuthUpdated}
            onOpenDriveSyncWithBackup={() => setIsDriveSyncOpen(true)}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
          />
        )}
      </Suspense>

      {isPrivacyOpen && (
        <PrivacyPolicyModal
          isOpen={isPrivacyOpen}
          isStandalonePage={isPrivacyStandalone}
          onClose={() => {
            setIsPrivacyOpen(false);
            if (isPrivacyStandalone && typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              url.searchParams.delete('privacidad');
              if (url.hash.toLowerCase().includes('privacidad')) url.hash = '';
              window.history.replaceState({}, '', url.pathname + url.search + url.hash);
            }
          }}
        />
      )}

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

export default function App() {
  if (isProjectorQueryUrl()) {
    return <ProjectorScreen />;
  }
  return <MainStudioApp />;
}

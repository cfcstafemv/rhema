import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BibleReader } from './components/BibleReader';
import { CanvasBoard } from './components/CanvasBoard';
import { PersonalReflectionsModal } from './components/PersonalReflectionsModal';
import { PresentationMode } from './components/PresentationMode';
import { ExportModal } from './components/ExportModal';
import { SermonListModal } from './components/SermonListModal';
import { QuickPassageSearchModal } from './components/QuickPassageSearchModal';
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
  getCustomCardTypeLabels
} from './services/storage';
import { BIBLE_BOOKS, CARD_TYPES, BIBLE_TRANSLATIONS } from './data/bibleData';
import { getAvailableBibleTranslations, BibleTranslationOption } from './services/bibleService';

export default function App() {
  const [sermons, setSermons] = useState<SermonNote[]>([]);
  const [sermon, setSermon] = useState<SermonNote>(getActiveSermon());
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
  const [highlightedVerseId, setHighlightedVerseId] = useState<number | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      const removeTimer = setTimeout(() => {
        setShowSplash(false);
      }, 500);
      return () => clearTimeout(removeTimer);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loaded = getAllSermons();
    setSermons(loaded);
    const active = getActiveSermon();
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

  // Global keyboard shortcut for quick passage search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rhema_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rhema_theme', 'light');
    }
  };

  const updateAndSaveSermon = (updated: SermonNote) => {
    setSermon(updated);
    saveSermon(updated);
    setSermons(getAllSermons());
  };

  const handleUpdateSermonMeta = (updates: Partial<SermonNote>) => {
    const updated: SermonNote = {
      ...sermon,
      ...updates,
      updatedAt: Date.now(),
    };
    updateAndSaveSermon(updated);
  };

  const handleSelectPassage = (bookId: string, chapter: number) => {
    const book = BIBLE_BOOKS.find((b) => b.id === bookId);
    const updated: SermonNote = {
      ...sermon,
      activePassage: { bookId, chapter },
      mainScripture: `${book?.name || 'Biblia'} ${chapter}`,
      updatedAt: Date.now(),
    };
    updateAndSaveSermon(updated);
  };

  const handleAddHighlight = (highlightData: Omit<VerseHighlight, 'id' | 'createdAt'>): string => {
    const newId = 'hl-' + Date.now();
    const newHighlight: VerseHighlight = {
      ...highlightData,
      id: newId,
      createdAt: Date.now(),
    };

    const updated: SermonNote = {
      ...sermon,
      highlights: [...sermon.highlights, newHighlight],
      updatedAt: Date.now(),
    };
    updateAndSaveSermon(updated);
    return newId;
  };

  const handleRemoveHighlight = (highlightId: string) => {
    const updated: SermonNote = {
      ...sermon,
      highlights: sermon.highlights.filter((h) => h.id !== highlightId),
      links: sermon.links.filter((l) => l.fromHighlightId !== highlightId),
      cards: sermon.cards.map((c) =>
        c.linkedHighlightId === highlightId
          ? { ...c, linkedHighlightId: undefined, linkedVerseRef: undefined, linkedQuote: undefined }
          : c
      ),
      updatedAt: Date.now(),
    };
    updateAndSaveSermon(updated);
  };

  const handleCreateLinkedCard = (
    highlightId: string,
    quote: string,
    verseRef: string,
    cardType: CardType,
    extra?: { imageUrl?: string; imageCaption?: string; title?: string }
  ) => {
    const typeInfo = CARD_TYPES.find((t) => t.id === cardType) || CARD_TYPES[0];
    const customLabels = getCustomCardTypeLabels();
    const newCardId = 'card-' + Date.now();
    const cardCount = sermon.cards.length;
    const posX = 40 + (cardCount % 3) * 340;
    const posY = 50 + Math.floor(cardCount / 3) * 260;

    const newCard: FloatingCard = {
      id: newCardId,
      type: cardType,
      title: extra?.title || (cardType === 'central' ? (customLabels.central || 'Verdad Central') : `Nota sobre ${verseRef}`),
      content: extra?.imageUrl ? (extra.imageCaption || `Contexto geográfico e histórico de ${verseRef}`) : `Reflexión inspirada en: "${quote}"`,
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

    const updated: SermonNote = {
      ...sermon,
      cards: [...sermon.cards, newCard],
      links: [...sermon.links, newLink],
      updatedAt: Date.now(),
    };

    updateAndSaveSermon(updated);
    setActiveView('split');
  };

  const handleAddCard = (cardType: CardType) => {
    const typeInfo = CARD_TYPES.find((t) => t.id === cardType) || CARD_TYPES[0];
    const customLabels = getCustomCardTypeLabels();
    const newCardId = 'card-' + Date.now();
    const cardCount = sermon.cards.length;
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

    const updated: SermonNote = {
      ...sermon,
      cards: [...sermon.cards, newCard],
      updatedAt: Date.now(),
    };
    updateAndSaveSermon(updated);
  };

  const handleUpdateCard = (id: string, updates: Partial<FloatingCard>) => {
    const updated: SermonNote = {
      ...sermon,
      cards: sermon.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      updatedAt: Date.now(),
    };
    updateAndSaveSermon(updated);
  };

  const handleDeleteCard = (id: string) => {
    const updated: SermonNote = {
      ...sermon,
      cards: sermon.cards.filter((c) => c.id !== id),
      links: sermon.links.filter((l) => l.toCardId !== id),
      updatedAt: Date.now(),
    };
    updateAndSaveSermon(updated);
  };

  const handleUpdateReflection = (updates: Partial<PersonalReflection>) => {
    const updated: SermonNote = {
      ...sermon,
      reflection: {
        ...sermon.reflection,
        ...updates,
        updatedAt: Date.now(),
      },
      updatedAt: Date.now(),
    };
    updateAndSaveSermon(updated);
  };

  const handleConvertReflectionToCard = (title: string, content: string) => {
    const newCardId = 'card-' + Date.now();
    const newCard: FloatingCard = {
      id: newCardId,
      type: 'action',
      title,
      content,
      color: '#10B981',
      x: 80,
      y: 120,
      width: 330,
      zIndex: sermon.cards.length + 5,
      createdAt: Date.now(),
    };

    const updated: SermonNote = {
      ...sermon,
      cards: [...sermon.cards, newCard],
      updatedAt: Date.now(),
    };
    updateAndSaveSermon(updated);
    setIsReflectionsOpen(false);
  };

  const handleApplyTemplate = (newCards: FloatingCard[], mode: 'replace' | 'append') => {
    const updated: SermonNote = {
      ...sermon,
      cards: mode === 'replace' ? newCards : [...sermon.cards, ...newCards],
      links: mode === 'replace' ? [] : sermon.links,
      updatedAt: Date.now(),
    };
    updateAndSaveSermon(updated);
    setActiveView('split');
  };

  const handleNavigateToLinkedVerse = (verseRef: string) => {
    const match = verseRef.match(/^([\w\s]+)\s+(\d+):(\d+)$/);
    if (match) {
      const bookName = match[1].trim();
      const chapter = parseInt(match[2], 10);
      const verse = parseInt(match[3], 10);

      const foundBook = BIBLE_BOOKS.find(
        (b) => b.name.toLowerCase() === bookName.toLowerCase() || b.shortName.toLowerCase() === bookName.toLowerCase()
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
  };

  const handleSelectSermon = (s: SermonNote) => {
    setSermon(s);
    localStorage.setItem('rhema_active_sermon_id_v1', s.id);
  };

  const handleNewSermon = (category: SermonCategory = 'Predicas Dominicales') => {
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
    setSermon(newS);
  };

  const handleUpdateSermonCategory = (sermonId: string, category: SermonCategory) => {
    const target = sermons.find((s) => s.id === sermonId);
    if (target) {
      const updated = { ...target, category, updatedAt: Date.now() };
      saveSermon(updated);
      setSermons(getAllSermons());
      if (sermon.id === sermonId) {
        setSermon(updated);
      }
    }
  };

  const handleDeleteSermon = (id: string) => {
    const remaining = deleteSermon(id);
    setSermons(remaining);
    setSermon(getActiveSermon());
  };

  const handleImportSuccess = (imported: SermonNote) => {
    setSermons(getAllSermons());
    setSermon(imported);
    localStorage.setItem('rhema_active_sermon_id_v1', imported.id);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FBF9F5] dark:bg-[#0E1015] text-stone-900 dark:text-stone-100 relative">
      {showSplash && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FBF9F5] dark:bg-[#0E1015] transition-opacity duration-500 ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
        onOpenSermonsList={() => setIsSermonsListOpen(true)}
        onNewSermon={handleNewSermon}
        onOpenReflections={() => setIsReflectionsOpen(true)}
        onOpenPresentationMode={() => setIsPresentationOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenQuickSearch={() => setIsQuickSearchOpen(true)}
        onUpdateSermonMeta={handleUpdateSermonMeta}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <main className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Bible Panel with Sliding Drawer Animation */}
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
            <div className={`h-full w-full overflow-hidden transition-opacity duration-200 ${isBibleCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
                onToggleCollapse={() => setIsBibleCollapsed(true)}
              />
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
          onClick={() => setIsReflectionsOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 transition-colors cursor-pointer"
        >
          <HeartHandshake className="w-4 h-4 text-pink-500" />
          <span>Diario</span>
        </button>

        <button
          onClick={() => setIsPresentationOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-4 h-4 text-amber-500" />
          <span>Modo Culto</span>
        </button>
      </nav>

      <PersonalReflectionsModal
        isOpen={isReflectionsOpen}
        onClose={() => setIsReflectionsOpen(false)}
        reflection={sermon.reflection}
        onUpdateReflection={handleUpdateReflection}
        onConvertReflectionToCard={handleConvertReflectionToCard}
      />

      <PresentationMode
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        sermon={sermon}
        currentTranslation={currentTranslation}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        sermon={sermon}
      />

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
    </div>
  );
}

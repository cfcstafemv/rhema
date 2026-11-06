import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BibleReader } from './components/BibleReader';
import { CanvasBoard } from './components/CanvasBoard';
import { PersonalReflectionsModal } from './components/PersonalReflectionsModal';
import { PresentationMode } from './components/PresentationMode';
import { ExportModal } from './components/ExportModal';
import { SermonListModal } from './components/SermonListModal';
import { SermonNote, FloatingCard, VerseHighlight, CardType, PersonalReflection } from './types';
import {
  getActiveSermon,
  getAllSermons,
  saveSermon,
  createNewSermon,
  deleteSermon
} from './services/storage';
import { BIBLE_BOOKS, CARD_TYPES, BIBLE_TRANSLATIONS } from './data/bibleData';
import { getAvailableBibleTranslations, BibleTranslationOption } from './services/bibleService';

export default function App() {
  const [sermons, setSermons] = useState<SermonNote[]>([]);
  const [sermon, setSermon] = useState<SermonNote>(getActiveSermon());
  const [activeView, setActiveView] = useState<'split' | 'canvas-only' | 'bible-only'>('split');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTranslation, setCurrentTranslation] = useState('RVR1960');
  const [availableTranslations, setAvailableTranslations] = useState<BibleTranslationOption[]>(BIBLE_TRANSLATIONS as any);
  const [isReflectionsOpen, setIsReflectionsOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSermonsListOpen, setIsSermonsListOpen] = useState(false);
  const [highlightedVerseId, setHighlightedVerseId] = useState<number | null>(null);

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
    cardType: CardType
  ) => {
    const typeInfo = CARD_TYPES.find((t) => t.id === cardType) || CARD_TYPES[0];
    const newCardId = 'card-' + Date.now();
    const cardCount = sermon.cards.length;
    const posX = 40 + (cardCount % 3) * 340;
    const posY = 50 + Math.floor(cardCount / 3) * 260;

    const newCard: FloatingCard = {
      id: newCardId,
      type: cardType,
      title: cardType === 'central' ? 'Verdad Central' : `Nota sobre ${verseRef}`,
      content: `Reflexión inspirada en: "${quote}"`,
      color: typeInfo.color,
      x: posX,
      y: posY,
      width: 320,
      zIndex: cardCount + 2,
      linkedHighlightId: highlightId,
      linkedVerseRef: verseRef,
      linkedQuote: quote,
      createdAt: Date.now(),
    };

    const newLink = {
      id: 'link-' + Date.now(),
      fromHighlightId: highlightId,
      fromVerseRef: verseRef,
      toCardId: newCardId,
      color: typeInfo.color,
      label: typeInfo.label,
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
    const newCardId = 'card-' + Date.now();
    const cardCount = sermon.cards.length;
    const posX = 60 + (cardCount % 3) * 330;
    const posY = 60 + Math.floor(cardCount / 3) * 250;

    const newCard: FloatingCard = {
      id: newCardId,
      type: cardType,
      title: typeInfo.label,
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

  const handleNewSermon = () => {
    const newS = createNewSermon(`Prédica — ${new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`);
    setSermons(getAllSermons());
    setSermon(newS);
  };

  const handleDeleteSermon = (id: string) => {
    const remaining = deleteSermon(id);
    setSermons(remaining);
    setSermon(getActiveSermon());
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FBF9F5] dark:bg-[#0E1015] text-stone-900 dark:text-stone-100">
      <Header
        sermon={sermon}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenSermonsList={() => setIsSermonsListOpen(true)}
        onNewSermon={handleNewSermon}
        onOpenReflections={() => setIsReflectionsOpen(true)}
        onOpenPresentationMode={() => setIsPresentationOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onUpdateSermonMeta={handleUpdateSermonMeta}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <main className="flex-1 flex overflow-hidden relative">
        {(activeView === 'split' || activeView === 'bible-only') && (
          <div
            className={`h-full transition-all duration-200 z-10 ${
              activeView === 'bible-only'
                ? 'w-full'
                : 'w-full md:w-[420px] lg:w-[480px] xl:w-[540px] shrink-0'
            }`}
          >
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
            />
          </div>
        )}

        {(activeView === 'split' || activeView === 'canvas-only') && (
          <div className="flex-1 h-full relative">
            <CanvasBoard
              cards={sermon.cards}
              links={sermon.links}
              highlights={sermon.highlights}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
              onAddCard={handleAddCard}
              onNavigateToLinkedVerse={handleNavigateToLinkedVerse}
              isSplitView={activeView === 'split'}
            />
          </div>
        )}
      </main>

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
      />
    </div>
  );
}

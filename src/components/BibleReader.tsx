import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronLeft,
  Link2,
  Highlighter,
  Trash2,
  Plus,
  Sparkles,
  Bookmark,
  CheckCircle2,
  ClipboardPaste,
  Check,
  X,
  Loader2,
  Lightbulb,
  SlidersHorizontal,
  Info,
  Type,
  WifiOff,
  Wifi,
  CloudOff,
  RefreshCw,
} from 'lucide-react';
import {
  BibleVerse,
  VerseHighlight,
  HighlightCategory,
  CardType,
  ReaderSettings,
  VerseCrossRef,
  VerseFootnote,
} from '../types';
import {
  BIBLE_BOOKS,
  BIBLE_TRANSLATIONS,
  HIGHLIGHT_CATEGORIES,
  getBibleVerses,
  saveCustomVerses,
} from '../data/bibleData';
import {
  getOrFetchChapterVerses,
  isChapterAvailableOffline,
  OfflineTranslationWaitingError,
} from '../services/bibleService';

const DEFAULT_READER_SETTINGS: ReaderSettings = {
  showJesusWordsInRed: true,
  showCrossRefs: true,
  showFootnotes: true,
  fontSize: 'base',
};

const READER_SETTINGS_STORAGE = 'rhema_reader_settings';

function getInitialReaderSettings(): ReaderSettings {
  if (typeof window === 'undefined') return DEFAULT_READER_SETTINGS;
  try {
    const raw = localStorage.getItem(READER_SETTINGS_STORAGE);
    return raw ? { ...DEFAULT_READER_SETTINGS, ...JSON.parse(raw) } : DEFAULT_READER_SETTINGS;
  } catch {
    return DEFAULT_READER_SETTINGS;
  }
}

function persistReaderSettings(settings: ReaderSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(READER_SETTINGS_STORAGE, JSON.stringify(settings));
  } catch {}
}

const FONT_SIZE_CLASSES: Record<ReaderSettings['fontSize'], string> = {
  sm: 'text-xs sm:text-sm leading-relaxed',
  base: 'text-sm sm:text-base leading-relaxed',
  lg: 'text-base sm:text-lg leading-relaxed',
  xl: 'text-lg sm:text-xl leading-loose',
};

interface BibleReaderProps {
  activeBookId: string;
  activeChapter: number;
  highlights: VerseHighlight[];
  onSelectPassage: (bookId: string, chapter: number) => void;
  onAddHighlight: (highlight: Omit<VerseHighlight, 'id' | 'createdAt'>) => string;
  onRemoveHighlight: (highlightId: string) => void;
  onCreateLinkedCard: (highlightId: string, quote: string, ref: string, cardType: CardType) => void;
  highlightedVerseId?: number | null;
  currentTranslation: string;
  onSelectTranslation: (translationId: string) => void;
  translations?: Array<{ id: string; name: string; shortName: string; description: string }>;
  onToggleCollapse?: () => void;
}

export const BibleReader: React.FC<BibleReaderProps> = ({
  activeBookId,
  activeChapter,
  highlights,
  onSelectPassage,
  onAddHighlight,
  onRemoveHighlight,
  onCreateLinkedCard,
  highlightedVerseId,
  currentTranslation,
  onSelectTranslation,
  translations,
  onToggleCollapse,
}) => {
  const [searchBook, setSearchBook] = useState('');
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [isTranslationDropdownOpen, setIsTranslationDropdownOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [activeVerseForMenu, setActiveVerseForMenu] = useState<BibleVerse | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(getInitialReaderSettings);
  const [activeCrossRefPopover, setActiveCrossRefPopover] = useState<{ verse: BibleVerse; ref: VerseCrossRef; x: number; y: number } | null>(null);
  const [activeFootnotePopover, setActiveFootnotePopover] = useState<{ verse: BibleVerse; footnote: VerseFootnote; x: number; y: number } | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [isWaitingForInternet, setIsWaitingForInternet] = useState(false);
  const [verses, setVerses] = useState<BibleVerse[]>(() => {
    const isAvail = isChapterAvailableOffline(activeBookId, activeChapter, currentTranslation);
    if (!isAvail && (currentTranslation === 'NTV' || currentTranslation === 'NBLA') && typeof navigator !== 'undefined' && !navigator.onLine) {
      return [];
    }
    return getBibleVerses(activeBookId, activeChapter, currentTranslation);
  });
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  const translationOptions = translations && translations.length > 0 ? translations : BIBLE_TRANSLATIONS;
  const currentBook = BIBLE_BOOKS.find((b) => b.id === activeBookId) || BIBLE_BOOKS[0];
  const translationObj = translationOptions.find((t) => t.id === currentTranslation) || translationOptions[0];

  // Listener para estado de conexión en tiempo real
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setRefreshKey((k) => k + 1);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const isAvailableOffline = isChapterAvailableOffline(activeBookId, activeChapter, currentTranslation);

    // Si es NTV o NBLA y no está en caché/offline y no hay internet, mostrar aviso de espera
    if (currentTranslation === 'NTV' || currentTranslation === 'NBLA') {
      if (!isAvailableOffline && typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsWaitingForInternet(true);
        setIsLoadingVerses(false);
        setVerses([]);
        return;
      }
    }

    const immediate = getBibleVerses(activeBookId, activeChapter, currentTranslation);
    if (isAvailableOffline || currentTranslation === 'RVR1960') {
      setVerses(immediate);
    }

    setIsLoadingVerses(true);
    setIsWaitingForInternet(false);

    getOrFetchChapterVerses(activeBookId, activeChapter, currentTranslation)
      .then((fullVerses) => {
        if (isMounted && fullVerses && fullVerses.length > 0) {
          setVerses(fullVerses);
          setIsWaitingForInternet(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          if (err instanceof OfflineTranslationWaitingError || err?.name === 'OfflineTranslationWaitingError') {
            setIsWaitingForInternet(true);
            setVerses([]);
          } else if ((currentTranslation === 'NTV' || currentTranslation === 'NBLA') && !isAvailableOffline) {
            setIsWaitingForInternet(true);
            setVerses([]);
          }
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingVerses(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeBookId, activeChapter, currentTranslation, refreshKey]);

  const filteredBooks = BIBLE_BOOKS.filter((b) =>
    b.name.toLowerCase().includes(searchBook.toLowerCase()) ||
    b.shortName.toLowerCase().includes(searchBook.toLowerCase())
  );

  const otBooks = filteredBooks.filter((b) => b.testament === 'AT');
  const ntBooks = filteredBooks.filter((b) => b.testament === 'NT');

  // Robust text selection checking for desktop and mobile
  const checkTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (!text || text.length === 0) return;

    // Ignore selections originating inside the floating toolbar itself
    const anchorElem =
      selection.anchorNode instanceof HTMLElement
        ? selection.anchorNode
        : selection.anchorNode?.parentElement;
    const focusElem =
      selection.focusNode instanceof HTMLElement
        ? selection.focusNode
        : selection.focusNode?.parentElement;

    if (
      anchorElem?.closest('#bible-floating-toolbar') ||
      focusElem?.closest('#bible-floating-toolbar')
    ) {
      return;
    }

    const verseElem = (anchorElem?.closest('.bible-verse-row') ||
      focusElem?.closest('.bible-verse-row')) as HTMLElement | null;

    if (verseElem) {
      const verseAttr = verseElem.getAttribute('data-verse');
      const verseNum = verseAttr ? parseInt(verseAttr, 10) : null;
      const verse = verses.find((v) => Number(v.verse) === Number(verseNum));

      if (verse) {
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectedText(text);
          setActiveVerseForMenu(verse);
          setSelectedHighlightId(null);
          setMenuPosition({
            x: Math.min(Math.max(16, rect.left + rect.width / 2), window.innerWidth - 180),
            y: Math.max(rect.top - 65, 75),
          });
        } catch {
          const rect = verseElem.getBoundingClientRect();
          setSelectedText(text);
          setActiveVerseForMenu(verse);
          setSelectedHighlightId(null);
          setMenuPosition({
            x: Math.min(Math.max(16, rect.left + 80), window.innerWidth - 180),
            y: Math.max(rect.top - 65, 75),
          });
        }
      }
    }
  };

  // Selection change listener for touch devices and mouse release
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handleSelectionChange = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
          checkTextSelection();
        }
      }, 150);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [verses]);

  // Click outside to dismiss toolbar safely without interrupting verse interactions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('#bible-floating-toolbar') &&
        !target.closest('.bible-verse-row') &&
        !target.closest('.verse-highlight-trigger')
      ) {
        setMenuPosition(null);
        setSelectedText('');
        setActiveVerseForMenu(null);
        setSelectedHighlightId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const applyHighlight = (category: HighlightCategory, color: string) => {
    if (!activeVerseForMenu) return;

    const textToHighlight = (selectedText || activeVerseForMenu.text).trim();

    const newHighlightId = onAddHighlight({
      bookId: activeVerseForMenu.bookId,
      bookName: activeVerseForMenu.bookName,
      chapter: activeVerseForMenu.chapter,
      verse: activeVerseForMenu.verse,
      selectedText: textToHighlight,
      fullVerseText: activeVerseForMenu.text,
      category,
      color,
    });

    setMenuPosition(null);
    setSelectedText('');
    setActiveVerseForMenu(null);

    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }

    return newHighlightId;
  };

  const handleCreateCardFromSelection = (cardType: CardType = 'central') => {
    if (!activeVerseForMenu) return;

    const textToHighlight = selectedText || activeVerseForMenu.text;
    const ref = `${activeVerseForMenu.bookName} ${activeVerseForMenu.chapter}:${activeVerseForMenu.verse}`;

    const existing = highlights.find(
      (h) =>
        h.bookId === activeVerseForMenu.bookId &&
        h.chapter === activeVerseForMenu.chapter &&
        h.verse === activeVerseForMenu.verse &&
        h.selectedText === textToHighlight
    );

    let hlId = existing ? existing.id : selectedHighlightId;
    if (!hlId) {
      hlId = onAddHighlight({
        bookId: activeVerseForMenu.bookId,
        bookName: activeVerseForMenu.bookName,
        chapter: activeVerseForMenu.chapter,
        verse: activeVerseForMenu.verse,
        selectedText: textToHighlight,
        fullVerseText: activeVerseForMenu.text,
        category: cardType === 'central' ? 'central' : 'promise',
        color: cardType === 'central' ? '#F59E0B' : '#3B82F6',
      });
    }

    onCreateLinkedCard(hlId, textToHighlight, ref, cardType);
    setMenuPosition(null);
    setSelectedText('');
    setActiveVerseForMenu(null);
  };

  const handleSavePastedText = () => {
    if (!pastedText.trim()) return;

    const parsedVerses: { verse: number; text: string }[] = [];
    const lines = pastedText.split('\n').filter((l) => l.trim().length > 0);

    let currentVerseNum = 1;
    lines.forEach((line) => {
      const match = line.match(/^(\d+)[\.\:\s\-\]]+(.*)/);
      if (match) {
        parsedVerses.push({
          verse: parseInt(match[1], 10),
          text: match[2].trim(),
        });
        currentVerseNum = parseInt(match[1], 10) + 1;
      } else {
        parsedVerses.push({
          verse: currentVerseNum++,
          text: line.trim(),
        });
      }
    });

    if (parsedVerses.length > 0) {
      saveCustomVerses(activeBookId, activeChapter, parsedVerses);
      setRefreshKey((k) => k + 1);
      setIsPasteModalOpen(false);
      setPastedText('');
    }
  };

  const getHighlightsForVerse = (verseNum: number) => {
    return highlights.filter(
      (h) =>
        h.bookId?.toLowerCase() === activeBookId?.toLowerCase() &&
        Number(h.chapter) === Number(activeChapter) &&
        Number(h.verse) === Number(verseNum)
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF7F0] dark:bg-[#12141A] border-r border-stone-200 dark:border-stone-800 transition-colors select-text relative">
      <div className="p-3 border-b border-stone-200 dark:border-stone-800 bg-[#FFFFFF] dark:bg-[#151821] flex flex-wrap items-center justify-between gap-2 shadow-2xs z-30">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => {
                setIsBookDropdownOpen(!isBookDropdownOpen);
                setIsTranslationDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700/80 text-stone-900 dark:text-stone-100 text-sm font-serif font-bold transition-colors cursor-pointer border border-stone-200 dark:border-stone-700 shadow-2xs"
            >
              <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>{currentBook.name}</span>
              <span className="text-stone-400 text-xs">({currentBook.shortName})</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-0.5" />
            </button>

            {isBookDropdownOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/25"
                onClick={() => setIsBookDropdownOpen(false)}
              />
            )}

            {isBookDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#181B22] text-stone-900 dark:text-stone-100 z-50 p-3 max-h-96 flex flex-col isolate"
              >
                <div className="relative mb-2.5">
                  <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar libro bíblico..."
                    value={searchBook}
                    onChange={(e) => setSearchBook(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    autoFocus
                  />
                </div>

                <div className="overflow-y-auto flex-1 space-y-3 pr-1 text-xs">
                  {ntBooks.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1.5">
                        Nuevo Testamento
                      </span>
                      <div className="grid grid-cols-2 gap-1">
                        {ntBooks.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => {
                              onSelectPassage(b.id, 1);
                              setIsBookDropdownOpen(false);
                              setSearchBook('');
                            }}
                            className={`text-left px-2 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                              b.id === activeBookId
                                ? 'bg-amber-100 dark:bg-amber-900/60 font-bold text-amber-950 dark:text-amber-200 ring-1 ring-amber-500/50'
                                : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 font-medium'
                            }`}
                          >
                            {b.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {otBooks.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider block mb-1.5">
                        Antiguo Testamento
                      </span>
                      <div className="grid grid-cols-2 gap-1">
                        {otBooks.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => {
                              onSelectPassage(b.id, 1);
                              setIsBookDropdownOpen(false);
                              setSearchBook('');
                            }}
                            className={`text-left px-2 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                              b.id === activeBookId
                                ? 'bg-amber-100 dark:bg-amber-900/60 font-bold text-amber-950 dark:text-amber-200 ring-1 ring-amber-500/50'
                                : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 font-medium'
                            }`}
                          >
                            {b.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setIsTranslationDropdownOpen(!isTranslationDropdownOpen);
                setIsBookDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 text-xs font-mono font-bold transition-colors cursor-pointer border border-stone-200 dark:border-stone-700 shadow-2xs"
              title="Cambiar versión o traducción de la Biblia"
            >
              <span>{translationObj.shortName}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {isTranslationDropdownOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/25"
                onClick={() => setIsTranslationDropdownOpen(false)}
              />
            )}

            {isTranslationDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-1.5 w-68 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#181B22] text-stone-900 dark:text-stone-100 z-50 p-2.5 text-xs isolate"
              >
                <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider px-2 py-1 block">
                  Traducciones de la Biblia
                </span>
                {translationOptions.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTranslation(t.id);
                      setIsTranslationDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex flex-col gap-0.5 cursor-pointer ${
                      t.id === currentTranslation
                        ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 font-bold ring-1 ring-amber-500/50'
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <span className="font-bold text-stone-900 dark:text-stone-100">{t.name} ({t.shortName})</span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">{t.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer border border-stone-200/80 dark:border-stone-700 shadow-2xs"
            title="Opciones de lectura: Letras rojas, referencias y notas"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Opciones</span>
          </button>

          <button
            onClick={() => setIsPasteModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            title="Pegar o personalizar versículos de cualquier versión"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Pegar</span>
          </button>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="Ocultar Biblia para expandir el lienzo"
              aria-label="Ocultar panel bíblico"
            >
              <ChevronLeft className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span className="hidden sm:inline">Ocultar</span>
            </button>
          )}
        </div>
      </div>

      <div className="px-3.5 py-1.5 bg-stone-100/80 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center gap-1 overflow-x-auto no-scrollbar z-10">
        <span className="text-xs text-stone-700 dark:text-stone-300 mr-1.5 font-serif font-semibold shrink-0">Capítulo:</span>
        {Array.from({ length: Math.min(currentBook.chaptersCount, 25) }, (_, i) => i + 1).map((ch) => (
          <button
            key={ch}
            onClick={() => onSelectPassage(activeBookId, ch)}
            className={`w-6 h-6 shrink-0 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
              ch === activeChapter
                ? 'bg-amber-700 text-white shadow-2xs font-bold'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            {ch}
          </button>
        ))}
        {currentBook.chaptersCount > 25 && (
          <span className="text-xs text-stone-500 dark:text-stone-400 px-1 font-mono">+{currentBook.chaptersCount - 25}</span>
        )}

        {isLoadingVerses && (
          <Loader2 className="w-3 h-3 text-amber-600 animate-spin ml-2 shrink-0" />
        )}
      </div>

      <div
        ref={readerContainerRef}
        onMouseUp={checkTextSelection}
        onTouchEnd={() => {
          setTimeout(checkTextSelection, 120);
        }}
        className={`flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-3.5 font-serif text-stone-800 dark:text-stone-200 ${FONT_SIZE_CLASSES[readerSettings.fontSize]} relative`}
      >
        <div className="text-center pb-3 border-b border-stone-200/60 dark:border-stone-800/60">
          <h2 className="text-lg font-cinzel font-bold text-stone-900 dark:text-stone-100">
            {currentBook.name} {activeChapter}
          </h2>
          <span className="text-xs text-stone-400 font-sans">
            {translationObj.name} · {currentBook.category}
          </span>
        </div>

        {verses.length === 0 && (
          <div className="py-12 px-4 text-center font-sans max-w-md mx-auto">
            {isWaitingForInternet ? (
              <div className="bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <WifiOff className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-1">
                  Esperando conexión a internet
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                  El capítulo <strong>{currentBook.name} {activeChapter}</strong> en la versión <strong>{translationObj.name} ({translationObj.shortName})</strong> requiere internet para descargarse. Se cargará automáticamente al restablecerse la conexión.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
                  <button
                    onClick={() => onSelectTranslation('RVR1960')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Leer en Reina-Valera 1960</span>
                  </button>
                  <button
                    onClick={() => setRefreshKey((k) => k + 1)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium text-xs transition-colors cursor-pointer border border-stone-200 dark:border-stone-700"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingVerses ? 'animate-spin' : ''}`} />
                    <span>Reintentar</span>
                  </button>
                </div>
              </div>
            ) : isLoadingVerses ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-stone-500 dark:text-stone-400">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                <span className="text-xs font-medium">Cargando texto bíblico...</span>
              </div>
            ) : (
              <div className="py-10 text-stone-400 text-xs">
                No se encontraron versículos para este capítulo.
              </div>
            )}
          </div>
        )}

        {verses.map((v) => {
          const verseHighlights = getHighlightsForVerse(v.verse);
          const hasHighlights = verseHighlights.length > 0;
          const isTargeted = highlightedVerseId === v.verse;

          return (
            <div
              key={v.verse}
              id={`verse-${activeBookId}-${activeChapter}-${v.verse}`}
              data-verse={v.verse}
              className={`bible-verse-row p-2 rounded-xl transition-all relative group cursor-text ${
                isTargeted
                  ? 'bg-amber-100/90 dark:bg-amber-950/70 ring-2 ring-amber-500 shadow-sm'
                  : 'hover:bg-stone-100/70 dark:hover:bg-stone-800/40'
              }`}
            >
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveVerseForMenu(v);
                    setSelectedText(v.text);
                    setSelectedHighlightId(null);
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setMenuPosition({
                      x: rect.left,
                      y: Math.max(rect.top - 65, 75),
                    });
                  }}
                  className="font-mono text-xs font-bold text-amber-700 dark:text-amber-500 hover:text-amber-900 dark:hover:text-amber-300 hover:underline select-none pt-0.5 shrink-0 w-6 text-left cursor-pointer verse-highlight-trigger"
                  title="Toca para resaltar versículo"
                >
                  {v.verse}
                </button>

                <div className="flex-1">
                  <span className="verse-text-span select-text">
                    {renderVerseContent(v, verseHighlights, readerSettings.showJesusWordsInRed, (hl) => {
                      setSelectedHighlightId(hl.id);
                      setActiveVerseForMenu(v);
                      setSelectedText(hl.selectedText);
                      setMenuPosition({
                        x: Math.min(window.innerWidth / 2, 400),
                        y: 180,
                      });
                    })}
                  </span>

                  {/* Badges de Citas Cruzadas */}
                  {readerSettings.showCrossRefs && v.crossRefs && v.crossRefs.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {v.crossRefs.map((cr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setActiveCrossRefPopover({
                              verse: v,
                              ref: cr,
                              x: Math.min(rect.left, window.innerWidth - 310),
                              y: rect.bottom + 6,
                            });
                            setActiveFootnotePopover(null);
                          }}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-sans font-medium bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-200/80 dark:hover:bg-amber-900/60 border border-amber-300/60 dark:border-amber-800/60 transition-colors cursor-pointer shadow-2xs"
                          title={`Ver cita conectada: ${cr.ref}`}
                        >
                          <Link2 className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" />
                          <span>{cr.ref}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Badges de Notas de Traducción */}
                  {readerSettings.showFootnotes && v.footnotes && v.footnotes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {v.footnotes.map((fn, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setActiveFootnotePopover({
                              verse: v,
                              footnote: fn,
                              x: Math.min(rect.left, window.innerWidth - 310),
                              y: rect.bottom + 6,
                            });
                            setActiveCrossRefPopover(null);
                          }}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
                          title="Ver nota aclaratoria de traducción"
                        >
                          <Info className="w-2.5 h-2.5 text-stone-500" />
                          <span>Nota{fn.caller ? ` (${fn.caller})` : ''}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {hasHighlights && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-1 border-t border-stone-200/40 dark:border-stone-800/40 text-[11px] font-sans">
                      {verseHighlights.map((hl) => (
                        <div
                          key={hl.id}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{ backgroundColor: `${hl.color}20`, color: hl.color, border: `1px solid ${hl.color}50` }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hl.color }} />
                          <span className="truncate max-w-[130px] italic">"{hl.selectedText}"</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveHighlight(hl.id);
                            }}
                            className="hover:opacity-75 p-0.5 cursor-pointer"
                            title="Eliminar resaltado"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveVerseForMenu(v);
                    setSelectedText(v.text);
                    setSelectedHighlightId(null);
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setMenuPosition({
                      x: rect.left,
                      y: Math.max(rect.top - 65, 75),
                    });
                  }}
                  className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 hover:opacity-100 transition-opacity p-1.5 text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer verse-highlight-trigger shrink-0"
                  title="Resaltar versículo"
                  aria-label={`Resaltar versículo ${v.verse}`}
                >
                  <Highlighter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {menuPosition && activeVerseForMenu && (
        <div
          id="bible-floating-toolbar"
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="fixed z-50 bg-stone-900/95 dark:bg-stone-950 text-white rounded-2xl shadow-2xl p-2.5 flex flex-col gap-2.5 border border-stone-700 backdrop-blur-md animate-in fade-in zoom-in-95 w-[92vw] sm:w-[320px] max-w-[340px] left-1/2 -translate-x-1/2 bottom-[75px] sm:bottom-auto sm:left-auto sm:translate-x-0"
          style={
            typeof window !== 'undefined' && window.innerWidth >= 640
              ? {
                  left: `${Math.min(Math.max(16, menuPosition.x - 140), window.innerWidth - 340)}px`,
                  top: `${Math.min(Math.max(70, menuPosition.y), window.innerHeight - 220)}px`,
                }
              : undefined
          }
        >
          <div className="px-1.5 pt-0.5 pb-1 border-b border-stone-800 text-xs text-stone-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate max-w-[230px]">
              <span className="font-serif font-bold text-amber-400 truncate">
                {activeVerseForMenu.bookName} {activeVerseForMenu.chapter}:{activeVerseForMenu.verse}
              </span>
              <span className="text-[10px] text-stone-400 shrink-0">
                ({selectedText && selectedText !== activeVerseForMenu.text ? 'Selección' : 'Versículo'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setMenuPosition(null);
                setSelectedText('');
                setActiveVerseForMenu(null);
                setSelectedHighlightId(null);
              }}
              className="p-1 text-stone-400 hover:text-white rounded transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-stone-400">Color:</span>
            <div className="flex items-center gap-2">
              {HIGHLIGHT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => applyHighlight(cat.id, cat.color)}
                  className="w-7 h-7 sm:w-6 sm:h-6 rounded-full transition-transform hover:scale-125 active:scale-95 focus:ring-2 focus:ring-white cursor-pointer relative shadow-sm"
                  style={{ backgroundColor: cat.color }}
                  title={`${cat.name} (${cat.description})`}
                  aria-label={`Resaltar ${cat.name}`}
                />
              ))}
            </div>

            {selectedHighlightId && (
              <button
                onClick={() => {
                  onRemoveHighlight(selectedHighlightId);
                  setMenuPosition(null);
                }}
                className="ml-auto text-rose-400 hover:text-rose-300 p-1 text-xs cursor-pointer"
                title="Quitar resaltado"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="pt-1.5 border-t border-stone-800 grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              onClick={() => handleCreateCardFromSelection('central')}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white font-medium transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Mensaje Central</span>
            </button>
            <button
              onClick={() => handleCreateCardFromSelection('point')}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium transition-colors cursor-pointer"
            >
              <Bookmark className="w-3 h-3" />
              <span>Punto Clave</span>
            </button>
            <button
              onClick={() => handleCreateCardFromSelection('action')}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-medium transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Aplicación</span>
            </button>
            <button
              onClick={() => handleCreateCardFromSelection('illustration')}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-pink-600/80 hover:bg-pink-600 text-white font-medium transition-colors cursor-pointer"
            >
              <Lightbulb className="w-3 h-3" />
              <span>Ilustración</span>
            </button>
          </div>
        </div>
      )}

      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-5 h-5 text-amber-600" />
                <h3 className="font-cinzel font-bold text-stone-900 dark:text-stone-100 text-base">
                  Pegar Pasaje: {currentBook.name} {activeChapter}
                </h3>
              </div>
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
              Puedes copiar y pegar versículos directamente desde tu aplicación bíblica favorita (YouVersion, BibleGateway, Logos, etc.). Se detectarán los números de versículos automáticamente y se guardarán en este capítulo.
            </p>

            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Ejemplo:&#10;1 Al tercer día se hicieron unas bodas en Caná de Galilea...&#10;2 Y fueron también invitados Jesús y sus discípulos...&#10;3 Y faltando el vino..."
              rows={8}
              className="w-full text-xs font-serif p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePastedText}
                className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Guardar en este capítulo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popover de Cita Cruzada */}
      {activeCrossRefPopover && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setActiveCrossRefPopover(null)} />
          <div
            className="fixed z-50 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl shadow-2xl p-3.5 border border-stone-200 dark:border-stone-700 w-[290px] animate-in fade-in zoom-in-95 text-xs font-sans"
            style={{
              left: `${Math.max(12, Math.min(activeCrossRefPopover.x, window.innerWidth - 302))}px`,
              top: `${Math.min(activeCrossRefPopover.y, window.innerHeight - 200)}px`,
            }}
          >
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold font-serif">
                <Link2 className="w-3.5 h-3.5" />
                <span>{activeCrossRefPopover.ref.ref}</span>
              </div>
              <button
                onClick={() => setActiveCrossRefPopover(null)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeCrossRefPopover.ref.text ? (
              <p className="text-stone-600 dark:text-stone-300 italic mb-3 font-serif text-[12px] leading-relaxed line-clamp-3">
                "{activeCrossRefPopover.ref.text}"
              </p>
            ) : (
              <p className="text-stone-500 dark:text-stone-400 mb-3 text-[11px]">
                Pasaje bíblico relacionado con {activeCrossRefPopover.verse.bookName} {activeCrossRefPopover.verse.chapter}:{activeCrossRefPopover.verse.verse}.
              </p>
            )}

            <div className="flex flex-col gap-1.5 pt-1 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => {
                  const ref = activeCrossRefPopover.ref.ref;
                  const quote = activeCrossRefPopover.ref.text || `Cita conectada a ${activeCrossRefPopover.verse.bookName} ${activeCrossRefPopover.verse.chapter}:${activeCrossRefPopover.verse.verse}`;
                  const hlId = onAddHighlight({
                    bookId: activeCrossRefPopover.verse.bookId,
                    bookName: activeCrossRefPopover.verse.bookName,
                    chapter: activeCrossRefPopover.verse.chapter,
                    verse: activeCrossRefPopover.verse.verse,
                    selectedText: ref,
                    fullVerseText: activeCrossRefPopover.verse.text,
                    category: 'revelation',
                    color: '#EC4899',
                  });
                  onCreateLinkedCard(hlId, quote, ref, 'cross');
                  setActiveCrossRefPopover(null);
                }}
                className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-medium text-[11px] transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Tarjeta de Cita Cruzada</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Popover de Nota al Pie */}
      {activeFootnotePopover && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setActiveFootnotePopover(null)} />
          <div
            className="fixed z-50 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl shadow-2xl p-3.5 border border-stone-200 dark:border-stone-700 w-[290px] animate-in fade-in zoom-in-95 text-xs font-sans"
            style={{
              left: `${Math.max(12, Math.min(activeFootnotePopover.x, window.innerWidth - 302))}px`,
              top: `${Math.min(activeFootnotePopover.y, window.innerHeight - 180)}px`,
            }}
          >
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200 font-bold">
                <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Nota de Traducción</span>
              </div>
              <button
                onClick={() => setActiveFootnotePopover(null)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-stone-700 dark:text-stone-300 text-[12px] leading-relaxed mb-2.5 font-serif">
              {activeFootnotePopover.footnote.text}
            </p>

            <div className="text-[10px] text-stone-400 flex items-center justify-between pt-1.5 border-t border-stone-100 dark:border-stone-800">
              <span>{activeFootnotePopover.verse.bookName} {activeFootnotePopover.verse.chapter}:{activeFootnotePopover.verse.verse}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeFootnotePopover.footnote.text);
                  setActiveFootnotePopover(null);
                }}
                className="text-amber-600 dark:text-amber-400 font-medium hover:underline cursor-pointer"
              >
                Copiar texto
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de Opciones de Lectura */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Cabecera */}
            <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">Opciones de Lectura</h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">Personaliza la visualización bíblica en Rhema</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-5 space-y-4">
              {/* Opción: Palabras de Jesús en rojo */}
              <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-700/60">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 font-sans">
                      Palabras de Jesús en rojo
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-normal">
                    Destaca las citas directas de Cristo con un tono carmesí/coral distinguible.
                  </p>
                  <div className="mt-2 text-[11px] font-serif p-1.5 rounded bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-700/50">
                    <span className={readerSettings.showJesusWordsInRed ? 'text-red-600 dark:text-red-400 font-medium' : 'text-stone-700 dark:text-stone-300'}>
                      «Yo soy la vid verdadera, y mi Padre es el labrador.»
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...readerSettings, showJesusWordsInRed: !readerSettings.showJesusWordsInRed };
                    setReaderSettings(updated);
                    persistReaderSettings(updated);
                  }}
                  className={`w-11 h-6 shrink-0 rounded-full transition-colors relative cursor-pointer ${
                    readerSettings.showJesusWordsInRed ? 'bg-amber-700' : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                  aria-label="Alternar palabras de Jesús en rojo"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                      readerSettings.showJesusWordsInRed ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Opción: Referencias cruzadas */}
              <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-700/60">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 font-sans">
                      Referencias cruzadas canónicas
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-normal">
                    Insignias discretas en versículos conectados teológicamente para explorar y añadir al lienzo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...readerSettings, showCrossRefs: !readerSettings.showCrossRefs };
                    setReaderSettings(updated);
                    persistReaderSettings(updated);
                  }}
                  className={`w-11 h-6 shrink-0 rounded-full transition-colors relative cursor-pointer ${
                    readerSettings.showCrossRefs ? 'bg-amber-700' : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                  aria-label="Alternar referencias cruzadas"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                      readerSettings.showCrossRefs ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Opción: Notas de traducción */}
              <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-700/60">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 font-sans">
                      Notas y comentarios lingüísticos
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-normal">
                    Aclaraciones de los traductores sobre términos hebreos, griegos o variantes textuales.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...readerSettings, showFootnotes: !readerSettings.showFootnotes };
                    setReaderSettings(updated);
                    persistReaderSettings(updated);
                  }}
                  className={`w-11 h-6 shrink-0 rounded-full transition-colors relative cursor-pointer ${
                    readerSettings.showFootnotes ? 'bg-amber-700' : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                  aria-label="Alternar notas de traducción"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                      readerSettings.showFootnotes ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Selector de tamaño de letra */}
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-700/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Type className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 font-sans">
                      Tamaño de texto bíblico
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500 uppercase px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700">
                    {readerSettings.fontSize}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'sm', label: 'Pequeño', icon: 'A' },
                    { id: 'base', label: 'Normal', icon: 'A' },
                    { id: 'lg', label: 'Grande', icon: 'A+' },
                    { id: 'xl', label: 'Máximo', icon: 'A++' },
                  ].map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => {
                        const updated = { ...readerSettings, fontSize: sz.id as ReaderSettings['fontSize'] };
                        setReaderSettings(updated);
                        persistReaderSettings(updated);
                      }}
                      className={`py-2 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                        readerSettings.fontSize === sz.id
                          ? 'bg-amber-700 text-white border-amber-800 font-bold shadow-2xs'
                          : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{sz.icon}</div>
                      <div className="text-[10px] opacity-80">{sz.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pie de modal */}
            <div className="px-5 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 flex justify-end">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold cursor-pointer shadow-2xs"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function renderHighlightedString(
  text: string,
  highlights: VerseHighlight[],
  onHighlightClick: (hl: VerseHighlight) => void
) {
  if (highlights.length === 0) {
    return text;
  }

  const sortedHighlights = [...highlights].sort(
    (a, b) => (b.selectedText?.length || 0) - (a.selectedText?.length || 0)
  );

  let parts: { text: string; highlight?: VerseHighlight }[] = [{ text }];

  sortedHighlights.forEach((hl) => {
    const rawTarget = hl.selectedText?.trim();
    if (!rawTarget) return;

    const nextParts: { text: string; highlight?: VerseHighlight }[] = [];

    parts.forEach((part) => {
      if (part.highlight) {
        nextParts.push(part);
        return;
      }

      // Case-insensitive substring match
      const lowerPart = part.text.toLowerCase();
      const lowerTarget = rawTarget.toLowerCase();
      let index = lowerPart.indexOf(lowerTarget);

      // If exact substring not found, check if this is the entire verse text matching
      if (index === -1 && (lowerPart.trim() === lowerTarget || (hl.fullVerseText && lowerPart.trim() === hl.fullVerseText.trim().toLowerCase()))) {
        index = 0;
      }

      if (index === -1) {
        nextParts.push(part);
      } else {
        const matchLength = Math.min(part.text.length - index, rawTarget.length || part.text.length);
        const before = part.text.substring(0, index);
        const match = part.text.substring(index, index + matchLength);
        const after = part.text.substring(index + matchLength);

        if (before) nextParts.push({ text: before });
        nextParts.push({ text: match, highlight: hl });
        if (after) nextParts.push({ text: after });
      }
    });

    parts = nextParts;
  });

  return (
    <>
      {parts.map((part, i) => {
        if (!part.highlight) return <span key={i}>{part.text}</span>;

        const hl = part.highlight;
        return (
          <mark
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              onHighlightClick(hl);
            }}
            className="cursor-pointer px-1 py-0.5 rounded font-medium transition-all hover:brightness-110 shadow-2xs"
            style={{
              backgroundColor: `${hl.color}35`,
              color: 'inherit',
              borderBottom: `2.5px solid ${hl.color}`,
            }}
            title={`Resaltado: ${hl.category} · Toca para opciones`}
          >
            {part.text}
          </mark>
        );
      })}
    </>
  );
}

function renderVerseContent(
  verse: BibleVerse,
  highlights: VerseHighlight[],
  showJesusInRed: boolean,
  onHighlightClick: (hl: VerseHighlight) => void
) {
  if (showJesusInRed && verse.segments && verse.segments.length > 0) {
    return (
      <>
        {verse.segments.map((seg, sIdx) => {
          const segHighlights = highlights.filter((hl) => {
            const rawTarget = hl.selectedText?.trim().toLowerCase();
            return rawTarget && seg.text.toLowerCase().includes(rawTarget);
          });

          const isRed = !!seg.isJesus;
          const redClass = isRed ? 'text-red-600 dark:text-red-400 font-medium' : '';

          if (segHighlights.length === 0) {
            return (
              <span key={sIdx} className={redClass}>
                {seg.text}
              </span>
            );
          }

          return (
            <span key={sIdx} className={redClass}>
              {renderHighlightedString(seg.text, segHighlights, onHighlightClick)}
            </span>
          );
        })}
      </>
    );
  }

  return renderHighlightedString(verse.text, highlights, onHighlightClick);
}


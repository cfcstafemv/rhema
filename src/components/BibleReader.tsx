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
} from 'lucide-react';
import { BibleVerse, VerseHighlight, HighlightCategory, CardType } from '../types';
import {
  BIBLE_BOOKS,
  BIBLE_TRANSLATIONS,
  HIGHLIGHT_CATEGORIES,
  getBibleVerses,
  saveCustomVerses,
} from '../data/bibleData';
import { getOrFetchChapterVerses } from '../services/bibleService';

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
  const [pastedText, setPastedText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [verses, setVerses] = useState<BibleVerse[]>(() => getBibleVerses(activeBookId, activeChapter, currentTranslation));
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  const translationOptions = translations && translations.length > 0 ? translations : BIBLE_TRANSLATIONS;
  const currentBook = BIBLE_BOOKS.find((b) => b.id === activeBookId) || BIBLE_BOOKS[0];
  const translationObj = translationOptions.find((t) => t.id === currentTranslation) || translationOptions[0];

  useEffect(() => {
    let isMounted = true;
    const immediate = getBibleVerses(activeBookId, activeChapter, currentTranslation);
    setVerses(immediate);

    setIsLoadingVerses(true);
    getOrFetchChapterVerses(activeBookId, activeChapter, currentTranslation)
      .then((fullVerses) => {
        if (isMounted && fullVerses && fullVerses.length > 0) {
          setVerses(fullVerses);
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
                className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 rounded-xl shadow-2xl border border-stone-300 dark:border-stone-700 z-50 p-3 max-h-96 flex flex-col isolate"
                style={{ backgroundColor: '#ffffff' }}
              >
                <div className="relative mb-2.5">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar libro bíblico..."
                    value={searchBook}
                    onChange={(e) => setSearchBook(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    autoFocus
                  />
                </div>

                <div className="overflow-y-auto flex-1 space-y-3 pr-1 text-xs">
                  {ntBooks.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider block mb-1">
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
                            className={`text-left px-2 py-1 rounded transition-colors cursor-pointer ${
                              b.id === activeBookId
                                ? 'bg-amber-100 dark:bg-amber-950 font-semibold text-amber-900 dark:text-amber-200'
                                : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
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
                      <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">
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
                            className={`text-left px-2 py-1 rounded transition-colors cursor-pointer ${
                              b.id === activeBookId
                                ? 'bg-amber-100 dark:bg-amber-950 font-semibold text-amber-900 dark:text-amber-200'
                                : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-mono font-bold transition-colors cursor-pointer"
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
                className="absolute top-full left-0 mt-1.5 w-64 rounded-xl shadow-2xl border border-stone-300 dark:border-stone-700 z-50 p-2 text-xs isolate"
                style={{ backgroundColor: '#ffffff' }}
              >
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 py-1 block">
                  Traducciones de la Biblia
                </span>
                {translationOptions.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTranslation(t.id);
                      setIsTranslationDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex flex-col cursor-pointer ${
                      t.id === currentTranslation
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold'
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span className="font-bold">{t.name} ({t.shortName})</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1">{t.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPasteModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            title="Pegar o personalizar versículos de cualquier versión"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Pegar Pasaje</span>
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

      <div className="px-3.5 py-1.5 bg-stone-100/80 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 flex items-center gap-1 overflow-x-auto no-scrollbar z-10">
        <span className="text-xs text-stone-500 dark:text-stone-400 mr-1.5 font-serif shrink-0">Capítulo:</span>
        {Array.from({ length: Math.min(currentBook.chaptersCount, 25) }, (_, i) => i + 1).map((ch) => (
          <button
            key={ch}
            onClick={() => onSelectPassage(activeBookId, ch)}
            className={`w-6 h-6 shrink-0 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
              ch === activeChapter
                ? 'bg-amber-700 text-white shadow-2xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            {ch}
          </button>
        ))}
        {currentBook.chaptersCount > 25 && (
          <span className="text-xs text-stone-400 px-1 font-mono">+{currentBook.chaptersCount - 25}</span>
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
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-3.5 font-serif text-stone-800 dark:text-stone-200 leading-relaxed text-sm sm:text-base relative"
      >
        <div className="text-center pb-3 border-b border-stone-200/60 dark:border-stone-800/60">
          <h2 className="text-lg font-cinzel font-bold text-stone-900 dark:text-stone-100">
            {currentBook.name} {activeChapter}
          </h2>
          <span className="text-xs text-stone-400 font-sans">
            {translationObj.name} · {currentBook.category}
          </span>
        </div>

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
                    {renderVerseContent(v.text, verseHighlights, (hl) => {
                      setSelectedHighlightId(hl.id);
                      setActiveVerseForMenu(v);
                      setSelectedText(hl.selectedText);
                      setMenuPosition({
                        x: Math.min(window.innerWidth / 2, 400),
                        y: 180,
                      });
                    })}
                  </span>

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
    </div>
  );
};

function renderVerseContent(
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

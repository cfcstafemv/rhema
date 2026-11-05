import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Search, 
  ChevronDown, 
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
  Loader2
} from 'lucide-react';
import { BibleVerse, VerseHighlight, HighlightCategory, CardType } from '../types';
import { 
  BIBLE_BOOKS, 
  BIBLE_TRANSLATIONS, 
  HIGHLIGHT_CATEGORIES, 
  getBibleVerses, 
  saveCustomVerses 
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

  const currentBook = BIBLE_BOOKS.find((b) => b.id === activeBookId) || BIBLE_BOOKS[0];
  const translationObj = BIBLE_TRANSLATIONS.find((t) => t.id === currentTranslation) || BIBLE_TRANSLATIONS[0];

  // Async load verses from cache or open API
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

  // Filtered books for quick search
  const filteredBooks = BIBLE_BOOKS.filter((b) =>
    b.name.toLowerCase().includes(searchBook.toLowerCase()) ||
    b.shortName.toLowerCase().includes(searchBook.toLowerCase())
  );

  const otBooks = filteredBooks.filter((b) => b.testament === 'AT');
  const ntBooks = filteredBooks.filter((b) => b.testament === 'NT');

  // Handle user mouse text selection
  const handleMouseUp = (verse: BibleVerse) => {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';

    if (text.length > 0) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();

      if (rect) {
        setSelectedText(text);
        setActiveVerseForMenu(verse);
        setSelectedHighlightId(null);
        setMenuPosition({
          x: Math.min(rect.left + rect.width / 2, window.innerWidth - 180),
          y: Math.max(rect.top - 55, 60),
        });
        return;
      }
    }
  };

  // Close floating menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#bible-floating-toolbar') && !target.closest('.verse-text-span')) {
        setMenuPosition(null);
        setSelectedText('');
        setActiveVerseForMenu(null);
        setSelectedHighlightId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apply highlight
  const applyHighlight = (category: HighlightCategory, color: string) => {
    if (!activeVerseForMenu) return;

    const textToHighlight = selectedText || activeVerseForMenu.text;

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

  // Create linked card directly from current selection
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

  // Handle saving custom pasted verses
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

  // Check highlights for a verse
  const getHighlightsForVerse = (verseNum: number) => {
    return highlights.filter(
      (h) => h.bookId === activeBookId && h.chapter === activeChapter && h.verse === verseNum
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF7F0] dark:bg-[#12141A] border-r border-stone-200 dark:border-stone-800 transition-colors select-text relative">
      {/* Bible Selector & Translation Bar */}
      <div className="p-3 border-b border-stone-200 dark:border-stone-800 bg-[#FFFFFF] dark:bg-[#151821] flex flex-wrap items-center justify-between gap-2 shadow-2xs z-30">
        <div className="flex items-center gap-2">
          {/* Book picker */}
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

            {/* Click-outside backdrop shield */}
            {isBookDropdownOpen && (
              <div 
                className="fixed inset-0 z-40 bg-black/25"
                onClick={() => setIsBookDropdownOpen(false)}
              />
            )}

            {/* Solid, non-transparent Book Picker Dropdown */}
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
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
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

          {/* Translation selector */}
          <div className="relative">
            <button
              onClick={() => {
                setIsTranslationDropdownOpen(!isTranslationDropdownOpen);
                setIsBookDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-mono font-bold transition-colors cursor-pointer border border-stone-200 dark:border-stone-700"
              title="Cambiar versión o traducción de la Biblia"
            >
              <span>{translationObj.shortName}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {/* Click-outside backdrop shield */}
            {isTranslationDropdownOpen && (
              <div 
                className="fixed inset-0 z-40 bg-black/25"
                onClick={() => setIsTranslationDropdownOpen(false)}
              />
            )}

            {/* Solid, non-transparent Translation Picker */}
            {isTranslationDropdownOpen && (
              <div 
                className="absolute top-full left-0 mt-1.5 w-64 rounded-xl shadow-2xl border border-stone-300 dark:border-stone-700 z-50 p-2 text-xs isolate"
                style={{ backgroundColor: '#ffffff' }}
              >
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 py-1 block">
                  Traducciones de la Biblia
                </span>
                {BIBLE_TRANSLATIONS.map((t) => (
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

        {/* Custom text paste / edit button */}
        <button
          onClick={() => setIsPasteModalOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          title="Pegar o personalizar versículos de cualquier versión"
        >
          <ClipboardPaste className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">Pegar Pasaje</span>
        </button>
      </div>

      {/* Chapter selector */}
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

      {/* Bible text body */}
      <div 
        ref={readerContainerRef}
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
              onMouseUp={() => handleMouseUp(v)}
              className={`p-2 rounded-lg transition-all relative group cursor-text ${
                isTargeted
                  ? 'bg-amber-100 dark:bg-amber-950/60 ring-2 ring-amber-500 shadow-sm'
                  : 'hover:bg-stone-100/70 dark:hover:bg-stone-800/40'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-500 select-none pt-0.5 shrink-0 w-6">
                  {v.verse}
                </span>

                <div className="flex-1">
                  <span className="verse-text-span">
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
                  onClick={() => {
                    setActiveVerseForMenu(v);
                    setSelectedText(v.text);
                    setSelectedHighlightId(null);
                    setMenuPosition({
                      x: 200,
                      y: 150,
                    });
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer"
                  title="Resaltar versículo completo"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Selection / Highlight Toolbar */}
      {menuPosition && activeVerseForMenu && (
        <div
          id="bible-floating-toolbar"
          className="fixed bg-stone-900/95 dark:bg-stone-950 text-white rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-2 border border-stone-700 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${Math.max(16, menuPosition.x - 120)}px`,
            top: `${menuPosition.y}px`,
            maxWidth: '360px',
          }}
        >
          <div className="px-2 pt-1 pb-1.5 border-b border-stone-800 text-[11px] text-stone-300 flex items-center justify-between">
            <span className="font-serif font-bold text-amber-400 truncate max-w-[200px]">
              {activeVerseForMenu.bookName} {activeVerseForMenu.chapter}:{activeVerseForMenu.verse}
            </span>
            <span className="text-[10px] text-stone-400">
              {selectedText ? 'Selección' : 'Versículo'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-1">
            <span className="text-[10px] text-stone-400 mr-1">Color:</span>
            {HIGHLIGHT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => applyHighlight(cat.id, cat.color)}
                className="w-5 h-5 rounded-full transition-transform hover:scale-125 focus:ring-2 focus:ring-white cursor-pointer relative"
                style={{ backgroundColor: cat.color }}
                title={`${cat.name} (${cat.description})`}
              />
            ))}

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

          <div className="pt-1 border-t border-stone-800 grid grid-cols-2 gap-1 text-[11px]">
            <button
              onClick={() => handleCreateCardFromSelection('central')}
              className="flex items-center justify-center gap-1 px-2 py-1 rounded bg-amber-600/80 hover:bg-amber-600 text-white font-medium transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Mensaje Central</span>
            </button>
            <button
              onClick={() => handleCreateCardFromSelection('point')}
              className="flex items-center justify-center gap-1 px-2 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium transition-colors cursor-pointer"
            >
              <Bookmark className="w-3 h-3" />
              <span>Punto Clave</span>
            </button>
            <button
              onClick={() => handleCreateCardFromSelection('action')}
              className="flex items-center justify-center gap-1 px-2 py-1 rounded bg-emerald-600/80 hover:bg-emerald-600 text-white font-medium transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Aplicación</span>
            </button>
            <button
              onClick={() => handleCreateCardFromSelection('illustration')}
              className="flex items-center justify-center gap-1 px-2 py-1 rounded bg-pink-600/80 hover:bg-pink-600 text-white font-medium transition-colors cursor-pointer"
            >
              <Link2 className="w-3 h-3" />
              <span>Ilustración</span>
            </button>
          </div>
        </div>
      )}

      {/* Paste / Custom Verses Modal */}
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
              Puedes copiar y pegar versículos directamente desde tu aplicación bíblica favorita (YouVersion, BibleGateway, Logos, etc.). Se detectarán los números de versículos automáticamente:
            </p>

            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Ejemplo:&#10;1 Al tercer día se hicieron unas bodas en Caná de Galilea...&#10;2 Y fueron también invitados Jesús y sus discípulos...&#10;3 Y faltando el vino, la madre de Jesús le dijo..."
              rows={8}
              className="w-full text-xs font-serif p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500 leading-relaxed"
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
    (a, b) => b.selectedText.length - a.selectedText.length
  );

  let parts: { text: string; highlight?: VerseHighlight }[] = [{ text }];

  sortedHighlights.forEach((hl) => {
    const nextParts: { text: string; highlight?: VerseHighlight }[] = [];

    parts.forEach((part) => {
      if (part.highlight) {
        nextParts.push(part);
        return;
      }

      const index = part.text.indexOf(hl.selectedText);
      if (index === -1) {
        nextParts.push(part);
      } else {
        const before = part.text.substring(0, index);
        const match = part.text.substring(index, index + hl.selectedText.length);
        const after = part.text.substring(index + hl.selectedText.length);

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
            className="cursor-pointer px-1 py-0.5 rounded font-medium transition-all hover:brightness-110"
            style={{
              backgroundColor: `${hl.color}35`,
              color: 'inherit',
              borderBottom: `2px solid ${hl.color}`,
            }}
            title={`Resaltado: ${hl.category} · Clic para opciones`}
          >
            {part.text}
          </mark>
        );
      })}
    </>
  );
}

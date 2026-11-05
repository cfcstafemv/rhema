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
  Compass,
  ArrowRight
} from 'lucide-react';
import { BibleVerse, VerseHighlight, HighlightCategory, CardType } from '../types';
import { BIBLE_BOOKS, HIGHLIGHT_CATEGORIES, getBibleVerses } from '../data/bibleData';

interface BibleReaderProps {
  activeBookId: string;
  activeChapter: number;
  highlights: VerseHighlight[];
  onSelectPassage: (bookId: string, chapter: number) => void;
  onAddHighlight: (highlight: Omit<VerseHighlight, 'id' | 'createdAt'>) => string;
  onRemoveHighlight: (highlightId: string) => void;
  onCreateLinkedCard: (highlightId: string, quote: string, ref: string, cardType: CardType) => void;
  highlightedVerseId?: number | null;
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
}) => {
  const [searchBook, setSearchBook] = useState('');
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [activeVerseForMenu, setActiveVerseForMenu] = useState<BibleVerse | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  const currentBook = BIBLE_BOOKS.find((b) => b.id === activeBookId) || BIBLE_BOOKS[0];
  const verses = getBibleVerses(activeBookId, activeChapter);

  // Filtered books for quick search
  const filteredBooks = BIBLE_BOOKS.filter((b) =>
    b.name.toLowerCase().includes(searchBook.toLowerCase()) ||
    b.shortName.toLowerCase().includes(searchBook.toLowerCase())
  );

  // Group books by testament
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

    // Clear window selection
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

    // Find if already highlighted
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

  // Check highlights for a verse
  const getHighlightsForVerse = (verseNum: number) => {
    return highlights.filter(
      (h) => h.bookId === activeBookId && h.chapter === activeChapter && h.verse === verseNum
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF7F0] dark:bg-[#12141A] border-r border-stone-200 dark:border-stone-800 transition-colors select-text">
      {/* Bible Selector Bar */}
      <div className="p-3.5 border-b border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative">
          <button
            onClick={() => setIsBookDropdownOpen(!isBookDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/70 dark:bg-stone-800 dark:hover:bg-stone-700/80 text-stone-900 dark:text-stone-100 text-sm font-serif font-bold transition-colors cursor-pointer border border-stone-200 dark:border-stone-700 shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>{currentBook.name}</span>
            <span className="text-stone-400 text-xs">({currentBook.shortName})</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-1" />
          </button>

          {/* Book dropdown picker */}
          {isBookDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-72 sm:w-80 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 z-50 p-3 max-h-96 flex flex-col">
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar libro bíblico..."
                  value={searchBook}
                  onChange={(e) => setSearchBook(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
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
                          className={`text-left px-2 py-1 rounded transition-colors ${
                            b.id === activeBookId
                              ? 'bg-amber-100 dark:bg-amber-950/60 font-semibold text-amber-900 dark:text-amber-200'
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
                          className={`text-left px-2 py-1 rounded transition-colors ${
                            b.id === activeBookId
                              ? 'bg-amber-100 dark:bg-amber-950/60 font-semibold text-amber-900 dark:text-amber-200'
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

        {/* Chapter selector */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-[260px] py-0.5 no-scrollbar">
          <span className="text-xs text-stone-500 dark:text-stone-400 mr-1 font-serif">Cap.</span>
          {Array.from({ length: Math.min(currentBook.chaptersCount, 25) }, (_, i) => i + 1).map((ch) => (
            <button
              key={ch}
              onClick={() => onSelectPassage(activeBookId, ch)}
              className={`w-6 h-6 shrink-0 rounded text-xs font-mono font-medium transition-colors ${
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
        </div>
      </div>

      {/* Guide hint for high-quality note taking */}
      <div className="px-4 py-2 bg-amber-50/60 dark:bg-amber-950/30 border-b border-amber-200/50 dark:border-amber-900/30 text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Highlighter className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Selecciona palabras clave o haz clic en un versículo para resaltar y vincular</span>
        </span>
        <span className="text-stone-400 dark:text-stone-500 font-serif italic hidden sm:inline">
          Reina-Valera 1960
        </span>
      </div>

      {/* Bible text body */}
      <div 
        ref={readerContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4 font-serif text-stone-800 dark:text-stone-200 leading-relaxed text-sm sm:text-base relative"
      >
        <div className="text-center pb-3 border-b border-stone-200/60 dark:border-stone-800/60">
          <h2 className="text-lg font-cinzel font-bold text-stone-900 dark:text-stone-100">
            {currentBook.name} {activeChapter}
          </h2>
          <span className="text-xs text-stone-400 font-sans">
            {currentBook.category} · {currentBook.testament === 'AT' ? 'Antiguo Testamento' : 'Nuevo Testamento'}
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
              {/* Verse number and quick actions */}
              <div className="flex items-start gap-2">
                <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-500 select-none pt-0.5 shrink-0 w-6">
                  {v.verse}
                </span>

                <div className="flex-1">
                  <span className="verse-text-span">
                    {/* Render text with embedded highlights */}
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

                  {/* Highlights tag indicators */}
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
                            className="hover:opacity-75 p-0.5"
                            title="Eliminar resaltado"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick verse action buttons on hover */}
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
          {/* Quote snippet preview */}
          <div className="px-2 pt-1 pb-1.5 border-b border-stone-800 text-[11px] text-stone-300 flex items-center justify-between">
            <span className="font-serif font-bold text-amber-400 truncate max-w-[200px]">
              {activeVerseForMenu.bookName} {activeVerseForMenu.chapter}:{activeVerseForMenu.verse}
            </span>
            <span className="text-[10px] text-stone-400">
              {selectedText ? 'Selección' : 'Versículo'}
            </span>
          </div>

          {/* Color Highlight Buttons */}
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
                className="ml-auto text-rose-400 hover:text-rose-300 p-1 text-xs"
                title="Quitar resaltado"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Link to Floating Card action buttons */}
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
    </div>
  );
};

/**
 * Helper to render verse text with colored highlighted segments
 */
function renderVerseContent(
  text: string,
  highlights: VerseHighlight[],
  onHighlightClick: (hl: VerseHighlight) => void
) {
  if (highlights.length === 0) {
    return text;
  }

  // Simple string match segmentation
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

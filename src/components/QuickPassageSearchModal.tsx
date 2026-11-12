import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { BIBLE_BOOKS } from '../data/bibleData';
import { BibleBook } from '../types';

interface QuickPassageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPassage: (bookId: string, chapter: number, verse?: number) => void;
  currentBookId?: string;
  currentChapter?: number;
}

interface ParsedMatch {
  book: BibleBook;
  chapter: number;
  verse?: number;
  displayText: string;
}

export const QuickPassageSearchModal: React.FC<QuickPassageSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPassage,
  currentBookId,
  currentChapter,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Normalize string for fuzzy matching (remove accents)
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const cleanQuery = query.trim();
  const normQuery = normalize(cleanQuery);

  // 1. Try to parse book + chapter + verse pattern (e.g., "Rom 8", "Juan 15:5", "Sal 23", "1 Cor 13")
  const parsePassage = (): ParsedMatch[] => {
    if (!normQuery) return [];

    // Regex to match: [bookName] [chapter] [:verse]
    const match = normQuery.match(/^([1-3]?\s*[a-zA-Záéíóúñ]+)\s*(\d+)?(?::(\d+))?$/i);
    const matches: ParsedMatch[] = [];

    if (match) {
      const bookPart = normalize(match[1].replace(/\s+/g, ' '));
      const chapterPart = match[2] ? parseInt(match[2], 10) : undefined;
      const versePart = match[3] ? parseInt(match[3], 10) : undefined;

      const matchingBooks = BIBLE_BOOKS.filter(
        (b) =>
          normalize(b.name).startsWith(bookPart) ||
          normalize(b.shortName) === bookPart ||
          normalize(b.id) === bookPart
      );

      matchingBooks.slice(0, 5).forEach((b) => {
        const ch = chapterPart ? Math.min(Math.max(1, chapterPart), b.chaptersCount) : 1;
        matches.push({
          book: b,
          chapter: ch,
          verse: versePart,
          displayText: `${b.name} ${ch}${versePart ? `:${versePart}` : ''}`,
        });
      });
    }

    // 2. Also match book names generally
    const generalBooks = BIBLE_BOOKS.filter(
      (b) =>
        normalize(b.name).includes(normQuery) ||
        normalize(b.shortName).includes(normQuery) ||
        normalize(b.category).includes(normQuery)
    );

    generalBooks.slice(0, 6).forEach((b) => {
      if (!matches.some((m) => m.book.id === b.id)) {
        matches.push({
          book: b,
          chapter: 1,
          displayText: `${b.name} (${b.shortName}) · ${b.chaptersCount} capítulos`,
        });
      }
    });

    return matches;
  };

  const results = parsePassage();

  const handleSelect = (match: ParsedMatch) => {
    onSelectPassage(match.book.id, match.chapter, match.verse);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        results.length > 0 ? (prev - 1 + results.length) % results.length : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-stone-200 dark:border-stone-800 flex items-center gap-3 bg-stone-50/70 dark:bg-stone-800/40">
          <Search className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Escribe una cita o libro (ej: Rom 8, Juan 15:5, Sal 23, Génesis)..."
            className="flex-1 bg-transparent border-0 text-sm font-sans font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline px-2 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-200 dark:bg-stone-800 rounded border border-stone-300 dark:border-stone-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {results.length > 0 ? (
            results.map((res, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={`${res.book.id}-${res.chapter}-${res.verse || 0}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(res)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-amber-100/80 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 font-semibold'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-sm font-serif">{res.displayText}</span>
                      <span className="text-[10px] text-stone-400 block font-sans">
                        {res.book.category} · {res.book.testament === 'AT' ? 'Antiguo Testamento' : 'Nuevo Testamento'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-stone-400">
                    <span className="text-[11px] font-sans">Saltar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })
          ) : query.trim() ? (
            <div className="py-8 text-center text-xs text-stone-400 font-sans">
              No se encontraron pasajes para "{query}". Prueba con abreviaturas como <em>Rom 8</em>, <em>Jn 15</em>, <em>Sal 23</em> o <em>Gn 1</em>.
            </div>
          ) : (
            <div className="p-3 text-xs text-stone-500 dark:text-stone-400 space-y-2">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
                Sugerencias rápidas para prédicas
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Romanos 8 (Vida en el Espíritu)', b: 'rom', ch: 8 },
                  { label: 'Juan 15 (La Vid Verdadera)', b: 'jua', ch: 15 },
                  { label: 'Salmos 23 (El Buen Pastor)', b: 'sal', ch: 23 },
                  { label: 'Filipenses 4 (El Gozo en Cristo)', b: 'fil', ch: 4 },
                  { label: 'Jueces 20 (Asamblea en Mizpa)', b: 'jue', ch: 20 },
                  { label: 'Génesis 1 (La Creación)', b: 'gen', ch: 1 },
                ].map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => {
                      onSelectPassage(sug.b, sug.ch);
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left border border-stone-200/60 dark:border-stone-700/60 transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-stone-800 dark:text-stone-200 block text-xs font-serif">
                      {sug.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-stone-50 dark:bg-stone-800/40 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
          <span>Usa <kbd className="px-1 py-0.5 bg-stone-200 dark:bg-stone-700 rounded font-mono text-[10px]">↑</kbd> <kbd className="px-1 py-0.5 bg-stone-200 dark:bg-stone-700 rounded font-mono text-[10px]">↓</kbd> para navegar</span>
          <span className="flex items-center gap-1 font-sans">
            <CornerDownLeft className="w-3 h-3 text-amber-600" /> Presiona Enter para abrir
          </span>
        </div>
      </div>
    </div>
  );
};

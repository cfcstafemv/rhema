import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  HeartHandshake, 
  Maximize2
} from 'lucide-react';
import { BibleVerse, SermonNote } from '../types';
import { getBibleVerses } from '../data/bibleData';
import { getOrFetchChapterVerses } from '../services/bibleService';

interface PresentationModeProps {
  isOpen: boolean;
  onClose: () => void;
  sermon: SermonNote;
  currentTranslation?: string;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  isOpen,
  onClose,
  sermon,
  currentTranslation = 'RVR1960',
}) => {
  const [activeTab, setActiveTab] = useState<'scripture' | 'deck' | 'reflection'>('deck');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [verses, setVerses] = useState<BibleVerse[]>(() => 
    getBibleVerses(sermon.activePassage.bookId, sermon.activePassage.chapter, currentTranslation)
  );

  // Sync complete chapter verses
  useEffect(() => {
    if (isOpen) {
      getOrFetchChapterVerses(sermon.activePassage.bookId, sermon.activePassage.chapter, currentTranslation).then((res) => {
        if (res && res.length > 0) setVerses(res);
      });
    }
  }, [isOpen, sermon.activePassage.bookId, sermon.activePassage.chapter, currentTranslation]);

  // Keyboard navigation: Esc to close, Arrows to navigate
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && activeTab === 'deck') {
        setActiveCardIndex((i) => Math.min(sermon.cards.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft' && activeTab === 'deck') {
        setActiveCardIndex((i) => Math.max(0, i - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, sermon.cards.length, onClose]);

  if (!isOpen) return null;

  const currentCard = sermon.cards[activeCardIndex] || sermon.cards[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#0F1117] text-stone-100 flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* Presentation Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-[#151923] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/rhema2_97cdc8b7.jpg"
            alt="Rhema Logo"
            className="w-8 h-8 rounded-lg object-contain bg-white border border-stone-700 p-0.5 shrink-0"
          />
          <div>
            <h1 className="text-base font-cinzel font-bold text-stone-100 tracking-wide">
              {sermon.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-stone-400 font-sans">
              <span>{sermon.preacher}</span>
              <span>·</span>
              <span className="text-amber-400 font-serif font-medium">{sermon.mainScripture}</span>
              <span>·</span>
              <span className="text-stone-500 text-[11px] font-mono">{currentTranslation}</span>
            </div>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-2 bg-stone-900/90 border border-stone-800 p-1 rounded-xl text-xs font-sans">
          <button
            onClick={() => setActiveTab('deck')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'deck'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Tarjetas de Prédica
          </button>
          <button
            onClick={() => setActiveTab('scripture')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'scripture'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Pasaje Bíblico
          </button>
          <button
            onClick={() => setActiveTab('reflection')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'reflection'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Reflexión Personal
          </button>
        </div>

        {/* Exit Presentation Mode */}
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-700/80 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors text-xs font-medium cursor-pointer"
          title="Salir del Modo Presentación (Esc)"
        >
          <span>Salir</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Presentation Area */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-6 lg:p-12">
        {/* Tab 1: Cards Deck Presentation */}
        {activeTab === 'deck' && currentCard && (
          <div className="w-full max-w-3xl flex flex-col items-center">
            {/* Presentation Card */}
            <div 
              className="w-full bg-[#181C27] border rounded-2xl p-8 lg:p-10 shadow-2xl relative transition-all"
              style={{ borderColor: `${currentCard.color}60` }}
            >
              {/* Type Accent Tag */}
              <div className="flex items-center justify-between mb-4">
                <span 
                  className="text-xs uppercase tracking-widest font-sans font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-md"
                  style={{ backgroundColor: `${currentCard.color}25`, color: currentCard.color }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Punto {activeCardIndex + 1} de {sermon.cards.length}</span>
                </span>

                {currentCard.linkedVerseRef && (
                  <span className="text-xs font-serif text-stone-400 italic">
                    {currentCard.linkedVerseRef}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-2xl lg:text-3xl font-cinzel font-bold text-stone-100 mb-6 leading-tight">
                {currentCard.title}
              </h2>

              {/* Content */}
              <p className="text-stone-300 font-sans text-base lg:text-lg leading-relaxed whitespace-pre-line mb-8">
                {currentCard.content}
              </p>

              {/* Linked Quote */}
              {currentCard.linkedQuote && (
                <div 
                  className="p-4 rounded-xl text-sm font-serif italic border-l-2 bg-stone-900/60"
                  style={{ borderColor: currentCard.color, color: currentCard.color }}
                >
                  "{currentCard.linkedQuote}"
                </div>
              )}
            </div>

            {/* Carousel Navigation Bottom */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={() => setActiveCardIndex((i) => Math.max(0, i - 1))}
                disabled={activeCardIndex === 0}
                className="p-2.5 rounded-full border border-stone-800 text-stone-300 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Tarjeta anterior (←)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5">
                {sermon.cards.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCardIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === activeCardIndex
                        ? 'w-6 bg-amber-500'
                        : 'w-2 bg-stone-700 hover:bg-stone-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveCardIndex((i) => Math.min(sermon.cards.length - 1, i + 1))}
                disabled={activeCardIndex === sermon.cards.length - 1}
                className="p-2.5 rounded-full border border-stone-800 text-stone-300 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Siguiente tarjeta (→)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Scripture View */}
        {activeTab === 'scripture' && (
          <div className="w-full max-w-2xl bg-[#181C27] border border-stone-800 rounded-2xl p-8 lg:p-10 shadow-2xl">
            <h2 className="text-xl font-cinzel font-bold text-amber-400 mb-6 text-center">
              {sermon.mainScripture} ({currentTranslation})
            </h2>

            <div className="space-y-4 font-serif text-base lg:text-lg text-stone-200 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              {verses.map((v) => {
                const hl = sermon.highlights.find(
                  (h) => h.bookId === v.bookId && h.chapter === v.chapter && h.verse === v.verse
                );

                return (
                  <p key={v.verse} className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-amber-500 pt-1 shrink-0">
                      {v.verse}
                    </span>
                    <span 
                      className={`transition-colors ${
                        hl ? 'p-1 rounded font-medium' : ''
                      }`}
                      style={hl ? { backgroundColor: `${hl.color}25`, borderBottom: `2px solid ${hl.color}` } : {}}
                    >
                      {v.text}
                    </span>
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Devotional Reflection */}
        {activeTab === 'reflection' && (
          <div className="w-full max-w-2xl bg-[#181C27] border border-stone-800 rounded-2xl p-8 lg:p-10 shadow-2xl space-y-6">
            <div className="text-center pb-4 border-b border-stone-800">
              <span className="text-amber-500 font-cinzel text-xs tracking-widest uppercase">
                Voz Interior y Oración
              </span>
              <h2 className="text-xl font-cinzel font-bold text-stone-100 mt-1">
                Reflexión para el Corazón
              </h2>
            </div>

            <div className="space-y-4 text-sm font-sans">
              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
                <span className="text-amber-400 font-bold block mb-1 text-xs">
                  ¿Qué me habló Dios hoy?
                </span>
                <p className="text-stone-300 italic leading-relaxed">
                  {sermon.reflection.godSpokeToMe || 'No hay reflexiones anotadas aún.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
                <span className="text-emerald-400 font-bold block mb-1 text-xs">
                  Mi aplicación para esta semana
                </span>
                <p className="text-stone-300 leading-relaxed">
                  {sermon.reflection.personalApplication || 'Anota aquí tu paso práctico.'}
                </p>
              </div>

              {sermon.reflection.prayerRequest && (
                <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
                  <span className="text-pink-400 font-bold block mb-1 text-xs">
                    Petición de Oración
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    {sermon.reflection.prayerRequest}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

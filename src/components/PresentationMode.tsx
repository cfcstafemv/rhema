import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  HeartHandshake, 
  Maximize2,
  MonitorPlay,
} from 'lucide-react';
import { BibleVerse, FloatingCard, SermonNote } from '../types';
import { getBibleVerses } from '../data/bibleData';
import { getOrFetchChapterVerses } from '../services/bibleService';
import type { ProjectorSlidePayload } from '../services/projectorSync';

interface PresentationModeProps {
  isOpen: boolean;
  onClose: () => void;
  sermon: SermonNote;
  currentTranslation?: string;
  onProjectSlide?: (slide: Omit<ProjectorSlidePayload, 'updatedAt'>) => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  isOpen,
  onClose,
  sermon,
  currentTranslation = 'RVR1960',
  onProjectSlide,
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

  const handleProjectCard = (card: FloatingCard) => {
    if (!onProjectSlide) return;
    const isQuestion =
      card.customTypeLabel === 'Pregunta de Diálogo' ||
      card.tags?.includes('Pregunta de Diálogo');

    if (isQuestion) {
      onProjectSlide({
        kind: 'question',
        title: 'Pregunta para Dialogar',
        content: card.title,
        sermonTitle: sermon.title,
        sermonScripture: sermon.mainScripture,
      });
      return;
    }

    const isVerseCard =
      (card.customTypeLabel === 'Cita Bíblica' || card.tags?.includes('Cita Bíblica')) &&
      Boolean(card.linkedVerseRef) &&
      Boolean(card.linkedQuote);

    if (isVerseCard) {
      onProjectSlide({
        kind: 'verse',
        reference: card.linkedVerseRef,
        content: card.linkedQuote || card.content.replace(/^[«"]|[»"]$/g, ''),
        sermonTitle: sermon.title,
        sermonScripture: sermon.mainScripture,
      });
      return;
    }

    onProjectSlide({
      kind: 'card',
      title: card.title,
      content: card.content,
      reference: card.linkedVerseRef,
      quote: card.linkedQuote,
      imageUrl: card.imageUrl,
      accentColor: card.color,
      sermonTitle: sermon.title,
      sermonScripture: sermon.mainScripture,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F1117] text-stone-100 flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* Presentation Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-3 sm:px-6 py-2.5 sm:py-4 border-b border-stone-800 bg-[#151923] backdrop-blur-md shrink-0">
        <div className="flex items-center justify-between gap-2 min-w-0 sm:flex-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/assets/aistudio/logoRHEMA_4329ba63.jpg"
              alt="Rhema Logo"
              className="w-8 h-8 rounded-lg object-contain bg-white border border-stone-700 p-0.5 shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-cinzel font-bold text-stone-100 tracking-wide truncate">
                {sermon.title}
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-400 font-sans truncate">
                {sermon.preacher && (
                  <span className="truncate max-w-[110px] sm:max-w-none">{sermon.preacher}</span>
                )}
                {sermon.preacher && sermon.mainScripture && <span className="shrink-0">·</span>}
                {sermon.mainScripture && (
                  <span className="text-amber-400 font-serif font-medium truncate">
                    {sermon.mainScripture}
                  </span>
                )}
                <span className="shrink-0">·</span>
                <span className="text-stone-500 text-[10px] sm:text-[11px] font-mono shrink-0">
                  {currentTranslation}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Exit Presentation Mode (Always visible top-right) */}
          <button
            type="button"
            onClick={onClose}
            className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-700 bg-stone-800/80 text-stone-200 hover:text-white hover:bg-stone-700 transition-colors text-xs font-semibold shrink-0 cursor-pointer"
            title="Salir del Modo Culto"
          >
            <X className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>

        {/* View Switcher Controls */}
        <div className="grid grid-cols-3 sm:flex items-center gap-1 sm:gap-2 bg-stone-900/90 border border-stone-800 p-1 rounded-xl text-xs font-sans shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('deck')}
            className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all text-center truncate cursor-pointer ${
              activeTab === 'deck'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span className="sm:hidden">Tarjetas</span>
            <span className="hidden sm:inline">Tarjetas de Prédica</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scripture')}
            className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all text-center truncate cursor-pointer ${
              activeTab === 'scripture'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span className="sm:hidden">Pasaje</span>
            <span className="hidden sm:inline">Pasaje Bíblico</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reflection')}
            className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all text-center truncate cursor-pointer ${
              activeTab === 'reflection'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span className="sm:hidden">Reflexión</span>
            <span className="hidden sm:inline">Reflexión Personal</span>
          </button>
        </div>

        {/* Desktop Exit Presentation Mode */}
        <button
          type="button"
          onClick={onClose}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-700/80 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors text-xs font-medium shrink-0 cursor-pointer"
          title="Salir del Modo Presentación (Esc)"
        >
          <span>Salir</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Presentation Area */}
      <div className="flex-1 overflow-y-auto flex p-3 sm:p-6 lg:p-12">
        {/* Tab 1: Empty Deck State */}
        {activeTab === 'deck' && !currentCard && (
          <div className="m-auto w-full max-w-md bg-[#181C27] border border-stone-800 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-cinzel font-bold text-stone-100">
                Aún no hay tarjetas en este estudio
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-sans leading-relaxed">
                Agrega tarjetas en el lienzo o cambia a la pestaña Pasaje para leer el capítulo actual.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Volver al estudio
            </button>
          </div>
        )}

        {/* Tab 1: Cards Deck Presentation */}
        {activeTab === 'deck' && currentCard && (
          <div className="m-auto w-full max-w-3xl flex flex-col items-center">
            {/* Presentation Card */}
            <div 
              className="w-full bg-[#181C27] border rounded-2xl p-5 sm:p-8 lg:p-10 shadow-2xl relative transition-all"
              style={{ borderColor: `${currentCard.color}60` }}
            >
              {/* Type Accent Tag & Quick Project */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span 
                  className="text-xs uppercase tracking-widest font-sans font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-md"
                  style={{ backgroundColor: `${currentCard.color}25`, color: currentCard.color }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Punto {activeCardIndex + 1} de {sermon.cards.length}</span>
                </span>

                <div className="flex items-center gap-2">
                  {currentCard.linkedVerseRef && (
                    <span className="text-xs font-serif text-stone-400 italic">
                      {currentCard.linkedVerseRef}
                    </span>
                  )}
                  {onProjectSlide && (
                    <button
                      type="button"
                      onClick={() => handleProjectCard(currentCard)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                      title="Enviar este punto a la ventana del proyector"
                    >
                      <MonitorPlay className="w-3.5 h-3.5" />
                      <span>Proyectar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-cinzel font-bold text-stone-100 mb-4 sm:mb-6 leading-tight break-words">
                {currentCard.title}
              </h2>

              {/* Attached Map / Image in Presentation Mode */}
              {currentCard.imageUrl && (
                <div className="mb-5 sm:mb-6 rounded-xl overflow-hidden border border-stone-700 bg-black/60 shadow-lg max-h-96 flex flex-col items-center">
                  <img
                    src={currentCard.imageUrl}
                    alt={currentCard.imageCaption || currentCard.title}
                    className="max-h-80 w-auto object-contain cursor-zoom-in"
                    onClick={() => window.open(currentCard.imageUrl, '_blank')}
                    title="Haz clic para abrir en pantalla completa"
                  />
                  {currentCard.imageCaption && (
                    <div className="w-full p-2 bg-stone-900/90 text-xs text-stone-300 font-sans text-center border-t border-stone-800">
                      {currentCard.imageCaption}
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <p className="text-stone-300 font-sans text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-line mb-6 sm:mb-8 break-words">
                {currentCard.content}
              </p>

              {/* Linked Quote */}
              {currentCard.linkedQuote && (
                <div 
                  className="p-3.5 sm:p-4 rounded-xl text-sm font-serif italic border-l-2 bg-stone-900/60"
                  style={{ borderColor: currentCard.color, color: currentCard.color }}
                >
                  "{currentCard.linkedQuote}"
                </div>
              )}
            </div>

            {/* Carousel Navigation Bottom */}
            <div className="flex items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              <button
                type="button"
                onClick={() => setActiveCardIndex((i) => Math.max(0, i - 1))}
                disabled={activeCardIndex === 0}
                className="p-2.5 rounded-full border border-stone-800 text-stone-300 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                title="Tarjeta anterior (←)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[200px] sm:max-w-md">
                {sermon.cards.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
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
                type="button"
                onClick={() => setActiveCardIndex((i) => Math.min(sermon.cards.length - 1, i + 1))}
                disabled={activeCardIndex === sermon.cards.length - 1}
                className="p-2.5 rounded-full border border-stone-800 text-stone-300 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                title="Siguiente tarjeta (→)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Scripture View */}
        {activeTab === 'scripture' && (
          <div className="m-auto w-full max-w-2xl bg-[#181C27] border border-stone-800 rounded-2xl p-5 sm:p-8 lg:p-10 shadow-2xl">
            <h2 className="text-lg sm:text-xl font-cinzel font-bold text-amber-400 mb-5 sm:mb-6 text-center">
              {sermon.mainScripture} ({currentTranslation})
            </h2>

            <div className="space-y-4 font-serif text-sm sm:text-base lg:text-lg text-stone-200 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              {verses.map((v) => {
                const hl = sermon.highlights.find(
                  (h) => h.bookId === v.bookId && h.chapter === v.chapter && h.verse === v.verse
                );

                return (
                  <div key={v.verse} className="flex items-start justify-between gap-3 group">
                    <p className="flex items-start gap-3 flex-1">
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
                    {onProjectSlide && (
                      <button
                        type="button"
                        onClick={() =>
                          onProjectSlide({
                            kind: 'verse',
                            reference: `${v.bookName} ${v.chapter}:${v.verse}`,
                            content: v.text,
                            translation: currentTranslation,
                            sermonTitle: sermon.title,
                            sermonScripture: sermon.mainScripture,
                          })
                        }
                        className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 hover:opacity-100 p-1.5 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-all cursor-pointer shrink-0"
                        title={`Proyectar ${v.bookName} ${v.chapter}:${v.verse}`}
                      >
                        <MonitorPlay className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Devotional Reflection */}
        {activeTab === 'reflection' && (
          <div className="m-auto w-full max-w-2xl bg-[#181C27] border border-stone-800 rounded-2xl p-5 sm:p-8 lg:p-10 shadow-2xl space-y-6">
            <div className="text-center pb-4 border-b border-stone-800">
              <span className="text-amber-500 font-cinzel text-xs tracking-widest uppercase">
                Voz Interior y Oración
              </span>
              <h2 className="text-lg sm:text-xl font-cinzel font-bold text-stone-100 mt-1">
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

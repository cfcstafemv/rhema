import React, { useEffect, useState, useRef } from 'react';
import { Maximize, Minimize, BookOpen, MessageCircle, Sparkles } from 'lucide-react';
import {
  ProjectorSlidePayload,
  getLastProjectorSlide,
  subscribeProjectorSlides,
} from '../services/projectorSync';

function getAdaptiveTextClass(text: string, isVerse = false): string {
  const len = (text || '').trim().length;
  if (len <= 90) {
    return isVerse
      ? 'text-3xl sm:text-5xl lg:text-6xl leading-tight'
      : 'text-2xl sm:text-4xl lg:text-5xl leading-snug';
  }
  if (len <= 200) {
    return isVerse
      ? 'text-2xl sm:text-4xl lg:text-5xl leading-snug'
      : 'text-xl sm:text-3xl lg:text-4xl leading-snug';
  }
  if (len <= 380) {
    return 'text-xl sm:text-2xl lg:text-3xl leading-relaxed';
  }
  return 'text-base sm:text-xl lg:text-2xl leading-relaxed';
}

export const ProjectorScreen: React.FC = () => {
  const [slide, setSlide] = useState<ProjectorSlidePayload>(() => {
    return (
      getLastProjectorSlide() || {
        kind: 'idle',
        sermonTitle: 'Rhema',
        sermonScripture: 'Estudio & Lienzo Bíblico',
        updatedAt: Date.now(),
      }
    );
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = subscribeProjectorSlides((incoming) => {
      setSlide(incoming);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const scheduleHide = () => {
      setShowControls(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3200);
    };

    scheduleHide();
    window.addEventListener('mousemove', scheduleHide);
    window.addEventListener('touchstart', scheduleHide);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      window.removeEventListener('mousemove', scheduleHide);
      window.removeEventListener('touchstart', scheduleHide);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen may be blocked if not triggered by user gesture
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none transition-colors duration-300 ${
        slide.kind === 'blackout'
          ? 'bg-black text-black'
          : 'bg-[#07090E] text-stone-100'
      }`}
    >
      {/* Subtle warm ambient sanctuary glow */}
      {slide.kind !== 'blackout' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            background:
              'radial-gradient(circle at 50% 35%, rgba(217, 119, 6, 0.22), transparent 65%)',
          }}
        />
      )}

      {/* Main Stage */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8 sm:px-14 lg:px-24 py-10 overflow-y-auto">
        {slide.kind === 'blackout' && (
          <span className="sr-only">Pantalla en pausa</span>
        )}

        {slide.kind === 'idle' && (
          <div className="text-center max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-white/95 p-2 shadow-2xl border border-amber-500/30">
              <img
                src="/assets/aistudio/logoRHEMA_4329ba63.jpg"
                alt="Rhema Logo"
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
            <div className="space-y-3">
              <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-amber-400/90 font-sans font-semibold">
                RHEMA · ῥῆμα
              </p>
              {slide.sermonTitle && (
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-cinzel font-bold text-stone-100 leading-tight">
                  {slide.sermonTitle}
                </h1>
              )}
              {slide.sermonScripture && (
                <p className="text-xl sm:text-2xl lg:text-3xl font-serif text-amber-300/90 pt-1">
                  {slide.sermonScripture}
                </p>
              )}
            </div>
          </div>
        )}

        {slide.kind === 'verse' && (
          <div
            key={slide.updatedAt}
            className="max-w-5xl w-full mx-auto text-center space-y-6 sm:space-y-8 animate-in fade-in duration-200"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-sm sm:text-lg font-sans font-semibold tracking-wide">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{slide.reference}</span>
              {slide.translation && (
                <span className="text-amber-400/75 font-mono text-xs sm:text-sm">
                  · {slide.translation}
                </span>
              )}
            </div>

            <blockquote
              className={`font-serif text-stone-50 font-medium tracking-normal text-balance ${getAdaptiveTextClass(
                slide.content || '',
                true
              )}`}
            >
              “{slide.content}”
            </blockquote>
          </div>
        )}

        {slide.kind === 'card' && (
          <div
            key={slide.updatedAt}
            className="max-w-5xl w-full mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800/90 pb-4">
              {slide.title && (
                <h1
                  className="text-2xl sm:text-4xl lg:text-5xl font-cinzel font-bold leading-tight"
                  style={{ color: slide.accentColor || '#FBBF24' }}
                >
                  {slide.title}
                </h1>
              )}
              {slide.reference && (
                <span className="px-3.5 py-1.5 rounded-xl bg-stone-900 border border-stone-700/80 text-amber-300 font-serif text-sm sm:text-lg shrink-0">
                  {slide.reference}
                </span>
              )}
            </div>

            {slide.imageUrl && (
              <div className="flex justify-center">
                <img
                  src={slide.imageUrl}
                  alt={slide.title || 'Imagen proyectada'}
                  className="max-h-[42vh] w-auto rounded-2xl border border-stone-700/80 shadow-2xl object-contain bg-black/60"
                />
              </div>
            )}

            {slide.content && (
              <p
                className={`font-sans text-stone-100 whitespace-pre-line break-words ${getAdaptiveTextClass(
                  slide.content,
                  false
                )}`}
              >
                {slide.content}
              </p>
            )}

            {slide.quote && (
              <div
                className="p-5 sm:p-6 rounded-2xl bg-stone-900/80 border-l-4 font-serif italic text-lg sm:text-2xl text-amber-200 leading-relaxed"
                style={{ borderColor: slide.accentColor || '#F59E0B' }}
              >
                “{slide.quote}”
              </div>
            )}
          </div>
        )}

        {slide.kind === 'question' && (
          <div
            key={slide.updatedAt}
            className="max-w-4xl w-full mx-auto text-center space-y-6 sm:space-y-8 animate-in fade-in duration-200"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-sm sm:text-base font-sans font-bold uppercase tracking-wider">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{slide.title || 'Pregunta para Dialogar'}</span>
            </div>

            <p
              className={`font-sans font-bold text-stone-50 text-balance ${getAdaptiveTextClass(
                slide.content || '',
                false
              )}`}
            >
              {slide.content}
            </p>
          </div>
        )}
      </div>

      {/* Subtle Auto-Hiding Bottom Controls (Fullscreen & Live Indicator) */}
      <div
        className={`fixed bottom-4 right-4 z-20 flex items-center gap-2 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-3 py-1.5 rounded-xl bg-stone-900/90 border border-stone-700/80 text-[11px] text-stone-300 font-sans flex items-center gap-1.5 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Pantalla de Proyección · Mueve esta ventana al proyector</span>
        </div>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-lg transition-colors cursor-pointer"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Poner en pantalla completa (F11)'}
        >
          {isFullscreen ? (
            <>
              <Minimize className="w-4 h-4" />
              <span>Salir pantalla completa</span>
            </>
          ) : (
            <>
              <Maximize className="w-4 h-4" />
              <span>Pantalla completa</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

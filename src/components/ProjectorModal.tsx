import React, { useState, useEffect } from 'react';
import {
  X,
  MonitorPlay,
  ExternalLink,
  Copy,
  Check,
  EyeOff,
  Sparkles,
  BookOpen,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { FloatingCard, SermonNote } from '../types';
import {
  ProjectorSlidePayload,
  pingProjectorScreens,
} from '../services/projectorSync';

interface ProjectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sermon: SermonNote;
  currentSlide: ProjectorSlidePayload;
  isProjectorConnected: boolean;
  onProjectSlide: (slide: Omit<ProjectorSlidePayload, 'updatedAt'>) => void;
}

export const ProjectorModal: React.FC<ProjectorModalProps> = ({
  isOpen,
  onClose,
  sermon,
  currentSlide,
  isProjectorConnected,
  onProjectSlide,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (isOpen) {
      pingProjectorScreens();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const projectorUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?proyector=1`
      : '/?proyector=1';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(projectorUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // ignore clipboard restrictions
    }
  };

  const handleProjectCard = (card: FloatingCard) => {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#FBF9F5] dark:bg-[#141720] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white/75 dark:bg-stone-900/75">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <MonitorPlay className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-cinzel font-bold text-stone-900 dark:text-stone-100">
                Proyector en 2ª Pantalla (Local)
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Envía versículos, tarjetas y preguntas directo al proyector sin consumir cuotas en la nube
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Connection & Launch Row */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {isProjectorConnected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      Ventana del proyector conectada y escuchando
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                      1. Abre la ventana del proyector y arrástrala al segundo monitor (Win+P → Ampliar)
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/?proyector=1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Ventana del Proyector</span>
              </a>

              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-medium transition-colors cursor-pointer"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Enlace copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar enlace (/?proyector=1)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Mini-Preview & Scene Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 rounded-xl bg-[#07090E] border border-stone-800 p-4 min-h-[120px] flex flex-col justify-center items-center text-center">
              {currentSlide.kind === 'blackout' ? (
                <span className="text-[11px] font-mono text-stone-500 uppercase tracking-widest">
                  Pantalla en negro (Pausa)
                </span>
              ) : currentSlide.kind === 'idle' ? (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold block">
                    Portada en pantalla
                  </span>
                  <p className="text-sm font-cinzel font-bold text-stone-100">
                    {currentSlide.sermonTitle || sermon.title}
                  </p>
                  <p className="text-xs font-serif text-amber-300">
                    {currentSlide.sermonScripture || sermon.mainScripture}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-w-full">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 block">
                    {currentSlide.reference || currentSlide.title || 'Proyectando'}
                  </span>
                  <p className="text-xs text-stone-200 line-clamp-3 font-serif">
                    {currentSlide.content || currentSlide.quote}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 justify-center">
              <button
                type="button"
                onClick={() =>
                  onProjectSlide({
                    kind: 'idle',
                    sermonTitle: sermon.title,
                    sermonScripture: sermon.mainScripture,
                  })
                }
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  currentSlide.kind === 'idle'
                    ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-400 text-amber-900 dark:text-amber-200'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Mostrar Portada</span>
              </button>

              <button
                type="button"
                onClick={() => onProjectSlide({ kind: 'blackout' })}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  currentSlide.kind === 'blackout'
                    ? 'bg-stone-900 text-white border-stone-700'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                <span>Pantalla Negra</span>
              </button>
            </div>
          </div>

          {/* Quick Project Cards from Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>Tarjetas del estudio ({sermon.cards.length})</span>
              </span>
              <span className="text-[11px] text-stone-500">
                También puedes proyectar cualquier versículo desde la Biblia
              </span>
            </div>

            {sermon.cards.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 text-center text-xs text-stone-500">
                No hay tarjetas creadas todavía. Usa el botón de proyector en la Biblia o agrega tarjetas al lienzo.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {sermon.cards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleProjectCard(card)}
                    className="text-left p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-amber-500/70 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all cursor-pointer group flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span
                        className="text-xs font-bold block truncate"
                        style={{ color: card.color }}
                      >
                        {card.title}
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">
                        {card.linkedQuote || card.content || card.linkedVerseRef || 'Sin contenido'}
                      </span>
                    </div>
                    <MonitorPlay className="w-4 h-4 text-stone-400 group-hover:text-amber-600 shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-stone-800 bg-white/75 dark:bg-stone-900/75 flex items-center justify-between gap-2 text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Tip: Toca el ícono de proyector en cualquier versículo o tarjeta para enviarlo en vivo.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold cursor-pointer transition-colors shrink-0"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

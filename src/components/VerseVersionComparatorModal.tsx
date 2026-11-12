import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  BookOpen,
  ArrowRightLeft,
  Sparkles,
  Link2,
  Bookmark,
  ExternalLink,
  Layers,
  Loader2,
} from 'lucide-react';
import { BibleVerse, CardType } from '../types';
import { getOrFetchChapterVerses } from '../services/bibleService';
import confetti from 'canvas-confetti';

interface VerseVersionComparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  verse: BibleVerse | null;
  currentTranslation: string;
  onCreateLinkedCard?: (
    highlightId: string,
    quote: string,
    ref: string,
    cardType: CardType,
    extra?: { title?: string; customTypeLabel?: string }
  ) => void;
  onAddHighlight?: (highlight: any) => string;
}

interface VersionData {
  id: string;
  name: string;
  shortName: string;
  badgeColor: string;
  description: string;
  text: string;
  isLoading: boolean;
}

export const VerseVersionComparatorModal: React.FC<VerseVersionComparatorModalProps> = ({
  isOpen,
  onClose,
  verse,
  currentTranslation,
  onCreateLinkedCard,
  onAddHighlight,
}) => {
  const [versions, setVersions] = useState<VersionData[]>([
    {
      id: 'RVR1960',
      name: 'Reina-Valera 1960',
      shortName: 'RVR1960',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800',
      description: 'Traducción clásica y predilecta para predicación y memorización',
      text: '',
      isLoading: true,
    },
    {
      id: 'NTV',
      name: 'Nueva Traducción Viviente',
      shortName: 'NTV',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-800',
      description: 'Lenguaje dinámico, directo y claro para comprensión y aplicación',
      text: '',
      isLoading: true,
    },
    {
      id: 'NBLA',
      name: 'Nueva Biblia de las Américas',
      shortName: 'NBLA',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-200 dark:border-indigo-800',
      description: 'Máxima fidelidad formal y literal a los manuscritos originales',
      text: '',
      isLoading: true,
    },
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState(false);
  const [isLinked, setIsLinked] = useState(false);

  useEffect(() => {
    if (!isOpen || !verse) return;

    let isMounted = true;
    setIsLinked(false);

    // Initial state setup with known current verse text if matching
    setVersions((prev) =>
      prev.map((v) => ({
        ...v,
        text: v.id === currentTranslation ? verse.text : '',
        isLoading: v.id !== currentTranslation,
      }))
    );

    const loadTranslations = async () => {
      const translationIds = ['RVR1960', 'NTV', 'NBLA'];

      const results = await Promise.all(
        translationIds.map(async (tId) => {
          if (tId === currentTranslation && verse.text) {
            return { id: tId, text: verse.text };
          }
          try {
            const list = await getOrFetchChapterVerses(verse.bookId, verse.chapter, tId);
            const found = list.find((v) => v.verse === verse.verse);
            return { id: tId, text: found?.text || '' };
          } catch {
            return { id: tId, text: '' };
          }
        })
      );

      if (!isMounted) return;

      setVersions((prev) =>
        prev.map((item) => {
          const match = results.find((r) => r.id === item.id);
          return {
            ...item,
            text: match?.text || (item.id === currentTranslation ? verse.text : 'Texto no disponible en modo sin conexión'),
            isLoading: false,
          };
        })
      );
    };

    loadTranslations();

    return () => {
      isMounted = false;
    };
  }, [isOpen, verse, currentTranslation]);

  if (!isOpen || !verse) return null;

  const verseRef = `${verse.bookName} ${verse.chapter}:${verse.verse}`;

  // Copy single version
  const handleCopySingle = (v: VersionData) => {
    const textToCopy = `«${v.text}»\n— ${verseRef} (${v.shortName})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(v.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy comparison of all 3
  const handleCopyAll = () => {
    const textToCopy = [
      `📖 *COMPARATIVA EXEGETICA — ${verseRef}*`,
      ``,
      ...versions.map(
        (v) => `• *${v.shortName}*: «${v.text || 'Sin texto'}»`
      ),
      ``,
      `_Estudio preparado con Rhema_`,
    ].join('\n');

    navigator.clipboard.writeText(textToCopy);
    setIsCopiedAll(true);
    setTimeout(() => setIsCopiedAll(false), 2000);
  };

  // Link as a card on the canvas
  const handleLinkToCanvas = () => {
    if (!onCreateLinkedCard) return;

    let highlightId = 'hl-comp-' + Date.now();
    if (onAddHighlight) {
      highlightId = onAddHighlight({
        bookId: verse.bookId,
        bookName: verse.bookName,
        chapter: verse.chapter,
        verse: verse.verse,
        selectedText: verse.text,
        fullVerseText: verse.text,
        category: 'revelation',
        color: '#6366F1',
        note: `Comparativa de versiones bíblicas para ${verseRef}`,
      });
    }

    const cardContent = versions
      .map((v) => `【${v.shortName}】\n«${v.text || verse.text}»`)
      .join('\n\n');

    onCreateLinkedCard(
      highlightId,
      verse.text,
      verseRef,
      'point',
      {
        title: `Comparativa: ${verseRef}`,
        customTypeLabel: 'Texto Bíblico',
      }
    );

    setIsLinked(true);
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-cinzel font-bold text-stone-900 dark:text-stone-100">
                  Comparador Paralelo de Versiones
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                  {verseRef}
                </span>
              </div>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                Contrasta matices de traducción entre la tradición clásica (RVR1960), claridad dinámica (NTV) y rigor literal (NBLA)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Ribbon */}
        <div className="px-5 py-2.5 bg-stone-100 dark:bg-stone-800/30 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
          <span className="text-stone-500 dark:text-stone-400 font-medium">
            3 traducciones cotejadas simultáneamente
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer font-medium"
            >
              {isCopiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
              <span>{isCopiedAll ? '¡Copiado!' : 'Copiar las 3 versiones'}</span>
            </button>

            {onCreateLinkedCard && (
              <button
                onClick={handleLinkToCanvas}
                disabled={isLinked}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isLinked ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Vinculada al Lienzo!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Vincular Cita al Lienzo</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Parallel Version Cards Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-50/50 dark:bg-stone-950/40">
          {versions.map((ver) => (
            <div
              key={ver.id}
              className="flex flex-col rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-800/40">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono ${ver.badgeColor}`}>
                    {ver.shortName}
                  </span>
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[130px]">
                    {ver.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopySingle(ver)}
                  disabled={ver.isLoading || !ver.text}
                  className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                  title={`Copiar versículo en ${ver.shortName}`}
                >
                  {copiedId === ver.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Version Description Tag */}
              <div className="px-3.5 pt-2 text-[10px] text-stone-400 font-sans">
                {ver.description}
              </div>

              {/* Text Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                {ver.isLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-stone-400 text-xs font-sans">
                    <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                    <span>Cotejando traducción...</span>
                  </div>
                ) : (
                  <blockquote className="font-serif text-sm text-stone-800 dark:text-stone-200 leading-relaxed italic border-l-2 border-stone-300 dark:border-stone-700 pl-3 my-auto">
                    "{ver.text}"
                  </blockquote>
                )}
              </div>

              {/* Card Footer Reference */}
              <div className="px-3.5 py-2 bg-stone-50 dark:bg-stone-800/30 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
                <span>{verseRef}</span>
                <span className="font-mono text-[9px] uppercase">{ver.id}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between">
          <span>
            💡 Al vincular la cita, se genera una tarjeta de exégesis en tu lienzo con todas sus etiquetas y títulos completamente editables.
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

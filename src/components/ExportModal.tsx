import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  Share2, 
  BookOpen, 
  CheckCircle2, 
  HeartHandshake,
  FileJson,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { SermonNote } from '../types';
import { exportSermonToJson } from '../services/storage';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sermon: SermonNote;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  sermon,
}) => {
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const exportCardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Download high-resolution PNG image
  const handleDownloadPNG = async () => {
    if (!exportCardRef.current) return;
    setIsExportingImage(true);
    setExportError(null);

    try {
      const cardEl = exportCardRef.current;
      const canvas = await html2canvas(cardEl, {
        scale: 2, // High resolution
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#FBF9F5',
        onclone: (clonedDoc) => {
          const imgs = clonedDoc.getElementsByTagName('img');
          for (let i = 0; i < imgs.length; i++) {
            imgs[i].crossOrigin = 'anonymous';
          }
        },
      });

      const fileName = `Rhema_Predica_${(sermon.title || 'Resumen').replace(/[\s\W]+/g, '_')}.png`;

      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (!blob) {
            // Fallback to dataURL
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = fileName;
            link.href = blobUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
          }
        }, 'image/png');
      } else {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Confetti celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      console.error('Error generating image export:', err);
      setExportError(
        'El navegador restringió la descarga directa de la imagen por políticas de seguridad. Puedes usar "Imprimir / PDF" para guardarlo en alta calidad.'
      );
    } finally {
      setIsExportingImage(false);
    }
  };

  // Print as PDF
  const handlePrint = () => {
    window.print();
  };

  // Copy structured text for WhatsApp group
  const handleCopyWhatsApp = () => {
    const lines = [
      `📖 *RESUMEN DE PRÉDICA — ${sermon.title.toUpperCase()}*`,
      `🏛️ ${sermon.churchName} | 👤 ${sermon.preacher}`,
      `📅 Fecha: ${sermon.date} | 📜 Cita: ${sermon.mainScripture}`,
      ``,
      `✨ *PUNTOS PRINCIPALES Y MENSAJE:*`,
      ...sermon.cards.map((c, i) => `• *${c.title}*: ${c.content}${c.linkedVerseRef ? ` (_${c.linkedVerseRef}_)` : ''}`),
      ``,
      sermon.reflection.godSpokeToMe ? `🕊️ *Reflexión devocional:* "${sermon.reflection.godSpokeToMe}"\n` : '',
      sermon.reflection.personalApplication ? `🌱 *Aplicación práctica:* ${sermon.reflection.personalApplication}\n` : '',
      sermon.reflection.prayerRequest ? `🙏 *Petición de oración:* ${sermon.reflection.prayerRequest}\n` : '',
      `_Notas creadas con Rhema_`,
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-[#FBF9F5] dark:bg-[#141720] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white/60 dark:bg-stone-900/60 no-print">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/logoRHEMA_4329ba63.jpg"
              alt="Rhema Logo"
              crossOrigin="anonymous"
              className="w-8 h-8 rounded-lg object-contain bg-white border border-stone-200 dark:border-stone-700 p-0.5"
            />
            <div>
              <h2 className="text-base font-cinzel font-bold text-stone-900 dark:text-stone-100">
                Exportar Resumen Visual
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                Descarga una ficha gráfica o copia el resumen para compartir en grupos
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

        {/* Export Error Alert if any */}
        {exportError && (
          <div className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between no-print">
            <span>{exportError}</span>
            <button
              onClick={() => setExportError(null)}
              className="text-rose-600 hover:text-rose-800 font-bold ml-2 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Action Buttons Ribbon */}
        <div className="p-3 bg-stone-100 dark:bg-stone-900/40 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs no-print">
          <span className="text-stone-500 font-medium">Formato de exportación:</span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                exportSermonToJson(sermon);
                confetti({
                  particleCount: 40,
                  spread: 55,
                  origin: { y: 0.7 },
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700/70 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 transition-colors font-medium cursor-pointer"
              title="Descarga el archivo completo (.rhema.json) para abrir e interactuar en otro dispositivo"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Archivo Rhema (.json)</span>
            </button>

            <button
              onClick={handleCopyWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 transition-colors font-medium cursor-pointer"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
              <span>{copiedText ? 'Copiado' : 'WhatsApp'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 transition-colors font-medium cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={isExportingImage}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingImage ? 'Generando...' : 'Descargar Imagen'}</span>
            </button>
          </div>
        </div>

        {/* Visual Summary Card to Export */}
        <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-stone-200/50 dark:bg-stone-950/50">
          <div
            ref={exportCardRef}
            className="w-full max-w-2xl bg-[#FBF9F5] text-stone-900 rounded-2xl p-8 border border-stone-300 shadow-md space-y-6"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            {/* Top Header */}
            <div className="border-b-2 border-stone-800 pb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    {sermon.category || 'Predicas Dominicales'}
                  </span>
                  <span className="text-[11px] font-bold tracking-widest text-amber-800 uppercase font-sans">
                    {sermon.churchName || 'Comunidad de Fe'} · Serie: {sermon.series || 'Enseñanza'}
                  </span>
                </div>
                <h1 className="text-2xl font-cinzel font-bold text-stone-900 mt-1 leading-snug">
                  {sermon.title}
                </h1>
                <div className="flex items-center gap-3 text-xs text-stone-600 mt-2 font-serif">
                  <span className="font-semibold text-stone-800">{sermon.preacher}</span>
                  <span>·</span>
                  <span className="font-bold text-amber-900">{sermon.mainScripture}</span>
                  <span>·</span>
                  <span>{sermon.date}</span>
                </div>
              </div>

              <div className="w-12 h-12 rounded-xl bg-white border border-stone-300 p-1 flex items-center justify-center shadow-xs shrink-0">
                <img
                  src="/assets/aistudio/logoRHEMA_4329ba63.jpg"
                  alt="Rhema Logo"
                  crossOrigin="anonymous"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Highlighted Scripture Snippets */}
            {sermon.highlights.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  <span>Pasajes y Frases Resaltadas</span>
                </span>
                <div className="space-y-1.5 text-xs font-serif italic text-stone-800">
                  {sermon.highlights.map((hl) => (
                    <div key={hl.id} className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-800 not-italic text-[11px] shrink-0">
                        {hl.bookName} {hl.chapter}:{hl.verse}
                      </span>
                      <span className="border-b border-amber-300 pb-0.5">
                        "{hl.selectedText}"
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Floating Cards Summary */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block font-sans">
                Puntos de la Enseñanza
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {sermon.cards.map((card) => (
                  <div
                    key={card.id}
                    className="p-3.5 rounded-xl border bg-white shadow-2xs space-y-1.5"
                    style={{ borderColor: `${card.color}60` }}
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${card.color}20`, color: card.color }}
                      >
                        {card.type}
                      </span>
                      {card.linkedVerseRef && (
                        <span className="text-[10px] font-serif font-bold text-stone-500">
                          {card.linkedVerseRef}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-serif font-bold text-stone-900">
                      {card.title}
                    </h3>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      {card.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Devotional Reflection Footer */}
            {(sermon.reflection.godSpokeToMe || sermon.reflection.personalApplication) && (
              <div className="border-t border-stone-200 pt-4 space-y-2 text-xs">
                <span className="font-bold text-stone-800 flex items-center gap-1 font-sans">
                  <HeartHandshake className="w-3.5 h-3.5 text-pink-600" />
                  <span>Reflexión y Aplicación Personal</span>
                </span>
                {sermon.reflection.godSpokeToMe && (
                  <p className="text-stone-700 italic bg-stone-100/70 p-2.5 rounded-lg border border-stone-200">
                    "{sermon.reflection.godSpokeToMe}"
                  </p>
                )}
                {sermon.reflection.personalApplication && (
                  <div className="flex items-start gap-1.5 text-stone-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Acción semanal:</strong> {sermon.reflection.personalApplication}</span>
                  </div>
                )}
              </div>
            )}

            {/* Tiny signature */}
            <div className="text-center pt-2 text-[10px] text-stone-400 font-serif italic border-t border-stone-200/60">
              «Lámpara es a mis pies tu palabra, y lumbrera a mi camino» · Salmos 119:105
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

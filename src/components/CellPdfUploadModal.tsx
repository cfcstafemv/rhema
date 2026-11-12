import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  HelpCircle,
  Layers,
  ArrowRight,
  ClipboardPaste,
} from 'lucide-react';
import { extractTextFromPdf, parseCellLesson, getSampleCellLesson, ParsedCellLesson } from '../services/pdfService';
import confetti from 'canvas-confetti';

interface CellPdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLessonLoaded: (parsed: ParsedCellLesson) => void;
}

export const CellPdfUploadModal: React.FC<CellPdfUploadModalProps> = ({
  isOpen,
  onClose,
  onLessonLoaded,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<ParsedCellLesson | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [pastedTitle, setPastedTitle] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Por favor selecciona un archivo PDF válido (.pdf).');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setParsedPreview(null);

    try {
      const extractedText = await extractTextFromPdf(file);
      if (!extractedText || extractedText.trim().length < 20) {
        throw new Error('No se pudo extraer texto del PDF (podría ser un documento escaneado solo con imágenes). Puedes copiar y pegar el texto en la pestaña "Pegar Texto".');
      }

      const parsed = await parseCellLesson(extractedText, file.name);
      setParsedPreview(parsed);
    } catch (err: any) {
      console.error('Error procesando PDF:', err);
      setError(
        err.message || 'Error al leer el archivo PDF. Puedes usar la pestaña "Pegar Texto" para ingresar la lección.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleProcessPastedText = async () => {
    if (!pastedText.trim() || pastedText.trim().length < 20) {
      setError('Por favor pega el contenido de la lección antes de continuar.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const parsed = await parseCellLesson(pastedText, pastedTitle.trim() || undefined);
      setParsedPreview(parsed);
    } catch (err: any) {
      setError('Ocurrió un error al procesar el texto.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const sample = await getSampleCellLesson();
      setParsedPreview(sample);
    } catch (err: any) {
      setError('Error al cargar la lección de ejemplo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmApply = () => {
    if (!parsedPreview) return;

    onLessonLoaded(parsedPreview);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.65 },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-cinzel font-bold text-stone-900 dark:text-stone-100">
                  Cargar Célula (PDF)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 uppercase font-mono">
                  Modo Célula
                </span>
              </div>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                Rhema analiza los versículos citados y las preguntas para armar el lienzo de tu reunión
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

        {/* Tab Switcher */}
        {!parsedPreview && (
          <div className="flex items-center border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 px-5 pt-2 text-xs">
            <button
              onClick={() => {
                setActiveTab('upload');
                setError(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Archivo PDF</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('paste');
                setError(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'paste'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Pegar Texto de la Lección</span>
            </button>

            <button
              onClick={handleLoadSample}
              className="ml-auto text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer py-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Cargar lección de prueba</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isProcessing && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <div className="space-y-1">
                <span className="font-serif font-bold text-sm text-stone-800 dark:text-stone-100">
                  Analizando la lección de célula...
                </span>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Extrayendo pasajes bíblicos citados y preguntas de diálogo en grupo
                </p>
              </div>
            </div>
          )}

          {/* Tab 1: Upload PDF */}
          {!parsedPreview && !isProcessing && activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  isDraggingOver
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 ring-4 ring-emerald-500/10'
                    : 'border-stone-300 dark:border-stone-700 hover:border-emerald-500 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6" />
                </div>

                <h3 className="font-serif font-bold text-stone-800 dark:text-stone-200 text-sm mb-1">
                  Arrastra aquí el PDF de la célula semanal
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mb-3">
                  O haz clic para buscarlo en tu dispositivo. Se extraerán automáticamente las citas bíblicas y las preguntas.
                </p>

                <button
                  type="button"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Examinar archivos
                </button>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-700/60 text-[11px] text-stone-500 dark:text-stone-400 space-y-1 font-sans">
                <span className="font-bold text-stone-700 dark:text-stone-300 block">
                  💡 ¿Cómo funciona el análisis automático?
                </span>
                <p>
                  1. El texto completo del PDF se ubica en el panel izquierdo (reemplazando el lector de un solo libro).
                </p>
                <p>
                  2. Los versículos bíblicos citados en la lección se convierten en tarjetas individuales en el orden exacto en que aparecen.
                </p>
                <p>
                  3. Las preguntas de diálogo se agregan como tarjetas con un espacio listo para anotar las respuestas del grupo en vivo.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Paste Text */}
          {!parsedPreview && !isProcessing && activeTab === 'paste' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Título o tema de la lección (opcional):
                </label>
                <input
                  type="text"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  placeholder="Ej: La fe que vence en medio de la prueba..."
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-serif"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Contenido de la lección:
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Pega aquí el texto completo copiado de tu PDF, Word o mensaje de WhatsApp..."
                  rows={8}
                  className="w-full text-xs p-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleProcessPastedText}
                  disabled={!pastedText.trim()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Analizar Lección
                </button>
              </div>
            </div>
          )}

          {/* Analysis Result Preview */}
          {parsedPreview && !isProcessing && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 font-sans uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Lección analizada con éxito</span>
                </div>
                <h3 className="font-cinzel font-bold text-stone-900 dark:text-stone-100 text-sm">
                  {parsedPreview.lessonTitle}
                </h3>
                {parsedPreview.fileName && (
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-mono">
                    Archivo: {parsedPreview.fileName}
                  </span>
                )}
              </div>

              {/* Detected breakdown stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <span className="text-base font-bold text-blue-600 block">
                    {parsedPreview.detectedScriptures.length}
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Citas Bíblicas
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <span className="text-base font-bold text-emerald-600 block">
                    {parsedPreview.detectedQuestions.length}
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Preguntas de Diálogo
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <span className="text-base font-bold text-amber-600 block">
                    {parsedPreview.cards.length}
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Tarjetas para el Lienzo
                  </span>
                </div>
              </div>

              {/* List of Detected Bible Passages */}
              {parsedPreview.detectedScriptures.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 font-sans">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Pasajes detectados en orden de aparición:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedPreview.detectedScriptures.map((sc, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-serif font-bold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
                      >
                        {sc.ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* List of Detected Questions */}
              {parsedPreview.detectedQuestions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 font-sans">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Preguntas de estudio detectadas:</span>
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {parsedPreview.detectedQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/60 text-xs text-stone-800 dark:text-stone-200 font-sans"
                      >
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 mr-1.5">
                          {idx + 1}.
                        </span>
                        {q}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 flex items-center justify-between gap-3">
          {parsedPreview ? (
            <button
              onClick={() => setParsedPreview(null)}
              className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
            >
              ← Cargar otro archivo
            </button>
          ) : (
            <span className="text-xs text-stone-400">
              Formato compatible: .pdf o texto
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium cursor-pointer"
            >
              Cancelar
            </button>

            {parsedPreview && (
              <button
                onClick={handleConfirmApply}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
              >
                <span>Cargar en Modo Célula</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  Upload,
  Search,
  Type,
  HelpCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Clock,
  HeartHandshake,
  Check,
  RotateCcw,
} from 'lucide-react';
import { CellLessonData, FloatingCard } from '../types';
import { fixPdfLigatures } from '../services/pdfService';

interface CellLessonReaderProps {
  cellLesson?: CellLessonData;
  onOpenUploadModal: () => void;
  onSwitchToSermonMode: () => void;
  onSelectPassageInBible?: (bookId: string, chapter: number) => void;
  onFocusCardOnCanvas?: (cardId: string) => void;
  cards: FloatingCard[];
}

export const CellLessonReader: React.FC<CellLessonReaderProps> = ({
  cellLesson,
  onOpenUploadModal,
  onSwitchToSermonMode,
  onSelectPassageInBible,
  onFocusCardOnCanvas,
  cards,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'scriptures' | 'questions'>('all');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  const FONT_SIZE_CLASSES = {
    sm: 'text-xs leading-relaxed',
    base: 'text-sm leading-relaxed',
    lg: 'text-base sm:text-lg leading-loose',
  };

  const cleanText = cellLesson?.fullText || '';
  const rawParagraphs = cleanText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const paragraphs =
    rawParagraphs.length <= 2 && cleanText.length > 400
      ? cleanText
          .replace(/([\.?!»”])\s+(?=[A-ZÁÉÍÓÚÑ¿«“"\d])/g, '$1\n\n')
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean)
      : rawParagraphs;

  // Filter paragraphs if search query is present
  const filteredParagraphs = paragraphs.filter((p) => {
    if (!searchQuery.trim()) return true;
    return p.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-[#FBF9F5] dark:bg-[#12141A] text-stone-900 dark:text-stone-100 border-r border-stone-200 dark:border-stone-800 overflow-hidden font-sans">
      {/* Top Bar Contract: Mode Indicator & Primary Actions */}
      <div className="p-3 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-sans text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                Modo Célula
              </span>
              <span className="text-[10px] text-stone-400">·</span>
              <span className="text-[11px] text-stone-600 dark:text-stone-300 font-sans font-medium truncate max-w-[150px] sm:max-w-[200px]">
                {cellLesson?.lessonTitle || 'Lección Semanal'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Button: Upload PDF */}
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Cargar o cambiar el archivo PDF de la lección semanal"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cargar Célula (PDF)</span>
            <span className="sm:hidden">PDF</span>
          </button>

          {/* Switch to Sermon / Bible Mode */}
          <button
            onClick={onSwitchToSermonMode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors cursor-pointer"
            title="Volver a la Biblia tradicional y modo de estudio dominical"
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden md:inline">Ver Biblia</span>
          </button>
        </div>
      </div>

      {/* Sub-bar: Search, Filter tabs & Font Size */}
      {cellLesson && (
        <div className="px-3 py-2 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 font-sans">
          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-stone-200/60 dark:bg-stone-800 rounded-lg text-[11px] font-medium">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Texto Completo
            </button>
            <button
              onClick={() => setActiveFilter('scriptures')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                activeFilter === 'scriptures'
                  ? 'bg-white dark:bg-stone-900 text-blue-700 dark:text-blue-300 font-bold shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Citas ({cellLesson.detectedScriptures?.length || 0})
            </button>
            <button
              onClick={() => setActiveFilter('questions')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                activeFilter === 'questions'
                  ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Preguntas ({cellLesson.detectedQuestions?.length || 0})
            </button>
          </div>

          {/* Search bar & Font Size Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3 h-3 text-stone-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar texto..."
                className="pl-6 pr-2 py-0.5 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-28 sm:w-36 font-sans"
              />
            </div>

            {/* Font size toggle */}
            <div className="flex items-center gap-1 p-0.5 bg-stone-200/70 dark:bg-stone-800 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setFontSize('sm')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer text-[11px] ${
                  fontSize === 'sm'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
                title="Letra pequeña"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize('base')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer text-[11px] ${
                  fontSize === 'base'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
                title="Letra normal"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('lg')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer text-[11px] ${
                  fontSize === 'lg'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
                title="Letra grande"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Body Area */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 font-sans">
        {/* State A: No cell lesson loaded yet */}
        {!cellLesson && (
          <div className="py-12 px-4 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-700 dark:text-emerald-300 shadow-sm">
              <FileText className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-sans font-bold text-base text-stone-900 dark:text-stone-100">
                Bienvenido al Modo Célula
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-sans leading-relaxed">
                Sube el archivo PDF de la lección semanal que envía tu iglesia. Rhema mostrará el texto completo aquí y colocará en tu lienzo las citas bíblicas y las preguntas de diálogo en el orden exacto en que aparecen.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={onOpenUploadModal}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Cargar Célula (PDF)</span>
              </button>
            </div>
          </div>
        )}

        {/* State B: Lesson Loaded - Filter: Only Scriptures */}
        {cellLesson && activeFilter === 'scriptures' && (
          <div className="space-y-3 font-sans">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
              <span className="font-bold block mb-1">
                Pasajes citados en el PDF ({cellLesson.detectedScriptures.length}):
              </span>
              <span>
                Cada versículo tiene su tarjeta en el lienzo visual para que el grupo los lea en orden.
              </span>
            </div>

            <div className="space-y-2">
              {cellLesson.detectedScriptures.map((sc, idx) => {
                const ref = typeof sc === 'string' ? sc : (sc as any).ref;
                const matchingCard = cards.find((c) => c.linkedVerseRef === ref);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-xs text-blue-700 dark:text-blue-400">
                        {ref}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200">
                        Orden #{idx + 1}
                      </span>
                    </div>
                    {matchingCard?.linkedQuote && (
                      <p className="text-xs text-stone-700 dark:text-stone-300 font-sans leading-relaxed">
                        «{matchingCard.linkedQuote}»
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* State C: Lesson Loaded - Filter: Only Questions */}
        {cellLesson && activeFilter === 'questions' && (
          <div className="space-y-3 font-sans">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200">
              <span className="font-bold block mb-1">
                Preguntas de diálogo en grupo ({cellLesson.detectedQuestions.length}):
              </span>
              <span>
                Tienen tarjeta dedicada en el lienzo para que anotes las respuestas del grupo durante la reunión.
              </span>
            </div>

            <div className="space-y-2">
              {cellLesson.detectedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <h4 className="font-sans font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 leading-snug">
                      {q}
                    </h4>
                  </div>
                  <div className="p-1.5 rounded bg-stone-50 dark:bg-stone-800/50 text-[11px] text-stone-500 font-sans italic">
                    ✏️ Las respuestas de los miembros se guardan en la tarjeta correspondiente del lienzo.
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* State D: Full Text Reading Flow */}
        {cellLesson && activeFilter === 'all' && (
          <article className={`space-y-3 font-sans text-stone-700 dark:text-stone-300 ${FONT_SIZE_CLASSES[fontSize]}`}>
            {/* Header Document Banner */}
            <div className="pb-3 border-b border-stone-200 dark:border-stone-800 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase tracking-widest font-mono">
                  Guía de Célula Semanal
                </span>
                {cellLesson.fileName && (
                  <span className="text-[10px] text-stone-400 font-mono truncate max-w-[180px]">
                    {cellLesson.fileName}
                  </span>
                )}
              </div>
              <h1 className="text-base sm:text-lg font-sans font-bold text-stone-900 dark:text-stone-100 leading-snug">
                {cellLesson.lessonTitle}
              </h1>
            </div>

            {/* Paragraphs */}
            {filteredParagraphs.map((para, pIdx) => {
              const normalizedPara = fixPdfLigatures(para);
              // If paragraph is just underscore line(s), render a subtle clean writing divider
              if (/^[_\s\-]+$/.test(normalizedPara) && normalizedPara.includes('_')) {
                return (
                  <div
                    key={pIdx}
                    className="border-b border-stone-300 dark:border-stone-700/80 my-2 h-2 w-full"
                    aria-hidden="true"
                  />
                );
              }

              // Replace long underscores with short clean fill-in-the-blank segment
              const cleanPara = normalizedPara.replace(/_{3,}/g, ' ________ ');

              const isIce =
                cleanPara.toLowerCase().includes('rompehielo') ||
                cleanPara.toLowerCase().includes('dinámica');

              const isHeaderOrIntro =
                /^(?:LECCIÓN|LECCION|LECTURA:|INTRODUCCIÓN:|INTRODUCCION:|TEMA:)/i.test(cleanPara);

              const isHeadingLine =
                !isHeaderOrIntro &&
                cleanPara.length < 130 &&
                (/^\d+\.\s+/.test(cleanPara) ||
                  /^(?:PARA\s+(?:HACER|ORAR)|EN\s+RES[UÚ]MEN):/i.test(cleanPara));

              const isQuestion =
                !isHeaderOrIntro &&
                cleanPara.includes('¿') &&
                cleanPara.includes('?') &&
                (cleanPara.trim().startsWith('¿') ||
                  cleanPara.length < 240);

              if (isIce) {
                return (
                  <div
                    key={pIdx}
                    className="p-3 rounded-xl bg-pink-50/80 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900 space-y-1 my-2 break-words overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-pink-900 dark:text-pink-300 uppercase tracking-wider font-sans">
                      <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                      <span>Rompehielo / Conexión</span>
                    </div>
                    <p className="text-stone-800 dark:text-stone-200 font-sans leading-relaxed break-words whitespace-pre-line">
                      {cleanPara}
                    </p>
                  </div>
                );
              }

              if (isQuestion) {
                return (
                  <div
                    key={pIdx}
                    className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900 space-y-1.5 my-2 break-words overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider font-sans flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pregunta para Dialogar</span>
                      </span>
                    </div>
                    <p className="text-stone-900 dark:text-stone-100 font-sans font-bold leading-snug break-words whitespace-pre-line">
                      {cleanPara}
                    </p>
                  </div>
                );
              }

              if (isHeadingLine) {
                return (
                  <h3
                    key={pIdx}
                    className="font-sans font-bold text-stone-900 dark:text-stone-100 pt-2 pb-0.5 leading-snug break-words"
                  >
                    {cleanPara}
                  </h3>
                );
              }

              return (
                <div key={pIdx} className="mb-2.5 break-words overflow-hidden">
                  {cleanPara.split(/\n/).map((line, lIdx) => (
                    <p
                      key={lIdx}
                      className="leading-relaxed font-sans text-stone-700 dark:text-stone-300 mb-1.5 break-words whitespace-pre-line"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              );
            })}
          </article>
        )}
      </div>

      {/* Reader Footer Info */}
      <div className="px-4 py-2 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 shrink-0">
        <span className="truncate max-w-[250px]">
          {cellLesson ? `Mostrando lección: ${cellLesson.lessonTitle}` : 'Modo Célula'}
        </span>
        <button
          onClick={onOpenUploadModal}
          className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
        >
          {cellLesson ? 'Cargar otra lección' : 'Cargar PDF'}
        </button>
      </div>
    </div>
  );
};

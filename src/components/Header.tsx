import React, { useState } from 'react';
import { 
  BookOpen, 
  Share2, 
  Moon, 
  Sun, 
  Sparkles, 
  Maximize2, 
  HeartHandshake, 
  FolderOpen, 
  Plus,
  PenLine,
  Check
} from 'lucide-react';
import { SermonNote } from '../types';

interface HeaderProps {
  sermon: SermonNote;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSermonsList: () => void;
  onNewSermon: () => void;
  onOpenReflections: () => void;
  onOpenPresentationMode: () => void;
  onOpenExport: () => void;
  onUpdateSermonMeta: (updates: Partial<SermonNote>) => void;
  activeView: 'split' | 'canvas-only' | 'bible-only';
  onViewChange: (view: 'split' | 'canvas-only' | 'bible-only') => void;
}

export const Header: React.FC<HeaderProps> = ({
  sermon,
  isDarkMode,
  onToggleDarkMode,
  onOpenSermonsList,
  onNewSermon,
  onOpenReflections,
  onOpenPresentationMode,
  onOpenExport,
  onUpdateSermonMeta,
  activeView,
  onViewChange,
}) => {
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaTitle, setMetaTitle] = useState(sermon.title);
  const [metaPreacher, setMetaPreacher] = useState(sermon.preacher);
  const [metaScripture, setMetaScripture] = useState(sermon.mainScripture);

  const handleSaveMeta = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateSermonMeta({
      title: metaTitle.trim() || 'Prédica sin título',
      preacher: metaPreacher.trim() || 'Pastor',
      mainScripture: metaScripture.trim() || 'Cita Bíblica',
    });
    setIsEditingMeta(false);
  };

  return (
    <header className="border-b border-stone-200 dark:border-stone-800 bg-[#FBF9F5]/90 dark:bg-[#12141A]/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
      {/* Strict One-Row Top Bar Contract (3 zones separated by gap-8) */}
      <div className="flex items-center justify-between gap-8 px-4 sm:px-6 py-2.5">
        {/* Zone 1: Brand wordmark with official logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/rhema2_97cdc8b7.jpg"
              alt="Rhema Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain shadow-xs bg-white border border-stone-200/90 dark:border-stone-700/80 p-0.5 shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-cinzel font-bold tracking-wider text-stone-900 dark:text-stone-100 leading-none">
                RHEMA
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-sans tracking-widest leading-none mt-0.5">
                ῥῆμα
              </span>
            </div>
          </div>
          <span className="hidden md:inline text-xs text-stone-400 dark:text-stone-500 font-serif italic border-l border-stone-300 dark:border-stone-700 pl-3">
            Estudio & Lienzo de Prédicas
          </span>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean, unboxed) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-300">
          <button
            onClick={onOpenSermonsList}
            className="flex items-center gap-1.5 hover:text-amber-700 dark:hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-stone-400" />
            <span>Mis Prédicas</span>
          </button>

          <button
            onClick={onOpenReflections}
            className="flex items-center gap-1.5 hover:text-amber-700 dark:hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer relative"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-pink-500" />
            <span>Diario Devocional</span>
            {sermon.reflection.godSpokeToMe && (
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={onOpenPresentationMode}
            className="flex items-center gap-1.5 hover:text-amber-700 dark:hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer"
            title="Vista de pantalla completa para seguir la prédica"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Modo Presentación</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Quick Utilities */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* View switcher on larger screens */}
          <div className="hidden sm:flex items-center p-0.5 bg-stone-200/70 dark:bg-stone-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => onViewChange('split')}
              className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                activeView === 'split'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Lienzo & Biblia
            </button>
            <button
              onClick={() => onViewChange('canvas-only')}
              className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                activeView === 'canvas-only'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Sólo Lienzo
            </button>
            <button
              onClick={() => onViewChange('bible-only')}
              className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                activeView === 'bible-only'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Sólo Biblia
            </button>
          </div>

          {/* New Sermon button */}
          <button
            onClick={onNewSermon}
            className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Nueva Prédica"
            aria-label="Nueva Prédica"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Theme switch */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title={isDarkMode ? 'Modo Día Alabastro' : 'Modo Culto / Noche'}
            aria-label="Alternar tema"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>

          {/* Primary Action Button: Export */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Exportar Resumen</span>
          </button>
        </div>
      </div>

      {/* Sermon Context & Metadata Bar (Readable, elegant editorial ribbon) */}
      <div className="bg-stone-100/70 dark:bg-stone-900/60 border-t border-stone-200/80 dark:border-stone-800/80 px-4 sm:px-6 py-2">
        {isEditingMeta ? (
          <form onSubmit={handleSaveMeta} className="flex flex-wrap items-center gap-2 text-xs">
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Título del Sermón"
              className="px-2.5 py-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium w-64"
              autoFocus
            />
            <input
              type="text"
              value={metaPreacher}
              onChange={(e) => setMetaPreacher(e.target.value)}
              placeholder="Predicador"
              className="px-2.5 py-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500 w-44"
            />
            <input
              type="text"
              value={metaScripture}
              onChange={(e) => setMetaScripture(e.target.value)}
              placeholder="Cita Bíblica Principal"
              className="px-2.5 py-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500 w-40"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-amber-700 text-white rounded hover:bg-amber-800 flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>Guardar</span>
            </button>
          </form>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-stone-700 dark:text-stone-300">
              <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                {sermon.title}
              </span>
              <span className="text-stone-400" aria-hidden="true">·</span>
              <span className="text-stone-600 dark:text-stone-400">
                {sermon.preacher}
              </span>
              <span className="text-stone-400" aria-hidden="true">·</span>
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                {sermon.mainScripture}
              </span>
              <span className="text-stone-400 hidden sm:inline" aria-hidden="true">·</span>
              <span className="text-stone-500 hidden sm:inline">
                {sermon.date}
              </span>

              <button
                onClick={() => {
                  setMetaTitle(sermon.title);
                  setMetaPreacher(sermon.preacher);
                  setMetaScripture(sermon.mainScripture);
                  setIsEditingMeta(true);
                }}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors p-1"
                title="Editar datos de la prédica"
              >
                <PenLine className="w-3 h-3" />
              </button>
            </div>

            {/* Status counters (Zero-pill text styling) */}
            <div className="flex items-center gap-3 text-stone-500 dark:text-stone-400 text-[11px]">
              <span>{sermon.cards.length} tarjetas en lienzo</span>
              <span aria-hidden="true">·</span>
              <span>{sermon.highlights.length} versículos resaltados</span>
              <span aria-hidden="true">·</span>
              <span>{sermon.links.length} conexiones</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

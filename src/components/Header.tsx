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
  Check,
  Search,
  Users,
  Upload,
} from 'lucide-react';
import { SermonNote, SermonCategory, SERMON_CATEGORIES } from '../types';

interface HeaderProps {
  sermon: SermonNote;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSermonsList: () => void;
  onNewSermon: () => void;
  onOpenReflections: () => void;
  onOpenPresentationMode: () => void;
  onOpenExport: () => void;
  onOpenQuickSearch?: () => void;
  isCellMode?: boolean;
  onToggleCellMode?: () => void;
  onOpenCellPdfUpload?: () => void;
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
  onOpenQuickSearch,
  isCellMode,
  onToggleCellMode,
  onOpenCellPdfUpload,
  onUpdateSermonMeta,
  activeView,
  onViewChange,
}) => {
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaTitle, setMetaTitle] = useState(sermon.title);
  const [metaCategory, setMetaCategory] = useState<SermonCategory>(sermon.category || 'Predicas Dominicales');
  const [metaPreacher, setMetaPreacher] = useState(sermon.preacher);
  const [metaScripture, setMetaScripture] = useState(sermon.mainScripture);

  const handleSaveMeta = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateSermonMeta({
      title: metaTitle.trim() || 'Prédica sin título',
      category: metaCategory,
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
              src="/assets/aistudio/logoRHEMA_4329ba63.jpg"
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

          {onToggleCellMode && (
            <button
              onClick={onToggleCellMode}
              className={`flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer px-2.5 py-1 rounded-lg ${
                isCellMode
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700 shadow-2xs'
                  : 'hover:text-emerald-700 dark:hover:text-emerald-400'
              }`}
              title={isCellMode ? 'Modo Célula activo (clic para volver a Biblia)' : 'Cambiar a Modo Célula (Lección PDF)'}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Modo Célula</span>
              {isCellMode && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action & Quick Utilities */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Cargar Célula PDF button if in cell mode */}
          {isCellMode && onOpenCellPdfUpload && (
            <button
              onClick={onOpenCellPdfUpload}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer font-semibold"
              title="Cargar o cambiar el archivo PDF de la lección semanal de célula"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cargar Célula (PDF)</span>
              <span className="sm:hidden">Célula PDF</span>
            </button>
          )}

          {/* Quick Passage Search button */}
          {onOpenQuickSearch && (
            <button
              onClick={onOpenQuickSearch}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-100 hover:bg-stone-200/70 dark:bg-stone-800 dark:hover:bg-stone-700/80 rounded-lg border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
              title="Búsqueda rápida de pasajes bíblicos (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Buscar</span>
              <kbd className="hidden md:inline px-1 py-0.5 text-[9px] font-mono text-stone-400 bg-white dark:bg-stone-900 rounded border border-stone-300 dark:border-stone-700">
                ⌘K
              </kbd>
            </button>
          )}

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
            <select
              value={metaCategory}
              onChange={(e) => setMetaCategory(e.target.value as SermonCategory)}
              className="px-2.5 py-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            >
              {SERMON_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
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
              className="px-2.5 py-1 bg-amber-700 text-white rounded hover:bg-amber-800 flex items-center gap-1 cursor-pointer font-medium"
            >
              <Check className="w-3 h-3" />
              <span>Guardar</span>
            </button>
          </form>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-stone-700 dark:text-stone-300">
              {/* Category Quick Selector */}
              {(() => {
                const currentCat = SERMON_CATEGORIES.find(c => c.id === (sermon.category || 'Predicas Dominicales')) || SERMON_CATEGORIES[0];
                return (
                  <select
                    value={sermon.category || 'Predicas Dominicales'}
                    onChange={(e) => onUpdateSermonMeta({ category: e.target.value as SermonCategory })}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer ${currentCat.badgeBg} ${currentCat.badgeBorder} focus:outline-none`}
                    title="Cambiar categoría de esta prédica"
                  >
                    {SERMON_CATEGORIES.map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      >
                        {c.label}
                      </option>
                    ))}
                  </select>
                );
              })()}

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
                  setMetaCategory(sermon.category || 'Predicas Dominicales');
                  setMetaPreacher(sermon.preacher);
                  setMetaScripture(sermon.mainScripture);
                  setIsEditingMeta(true);
                }}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors p-1 cursor-pointer"
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

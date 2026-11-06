import React from 'react';
import { 
  FolderOpen, 
  X, 
  Plus, 
  BookOpen, 
  Calendar, 
  User, 
  Trash2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { SermonNote } from '../types';

interface SermonListModalProps {
  isOpen: boolean;
  onClose: () => void;
  sermons: SermonNote[];
  activeSermonId: string;
  onSelectSermon: (sermon: SermonNote) => void;
  onNewSermon: () => void;
  onDeleteSermon: (id: string) => void;
}

export const SermonListModal: React.FC<SermonListModalProps> = ({
  isOpen,
  onClose,
  sermons,
  activeSermonId,
  onSelectSermon,
  onNewSermon,
  onDeleteSermon,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-[#FBF9F5] dark:bg-[#141720] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white/60 dark:bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/rhema_4ffc7d10.jpg"
              alt="Rhema Logo"
              className="w-8 h-8 rounded-lg object-contain bg-white border border-stone-200 dark:border-stone-700 p-0.5"
            />
            <div>
              <h2 className="text-base font-cinzel font-bold text-stone-900 dark:text-stone-100">
                Mis Prédicas Guardadas
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                {sermons.length} {sermons.length === 1 ? 'sermón registrado' : 'sermones registrados'}
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

        {/* Action button */}
        <div className="p-3 bg-stone-100/70 dark:bg-stone-900/40 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
          <span className="text-xs text-stone-500">
            Selecciona una prédica para abrir su lienzo
          </span>
          <button
            onClick={() => {
              onNewSermon();
              onClose();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Prédica</span>
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {sermons.map((s) => {
            const isActive = s.id === activeSermonId;

            return (
              <div
                key={s.id}
                onClick={() => {
                  onSelectSermon(s);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 ring-1 ring-amber-400/50'
                    : 'bg-white dark:bg-stone-900/70 border-stone-200 dark:border-stone-800 hover:border-amber-200 dark:hover:border-stone-700'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                      {s.title}
                    </h3>
                    {isActive && (
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
                        Abierta
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-1">
                    <span className="flex items-center gap-1 font-serif text-amber-800 dark:text-amber-300">
                      <BookOpen className="w-3 h-3" />
                      <span>{s.mainScripture}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{s.preacher}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{s.date}</span>
                    </span>
                    <span>· {s.cards.length} tarjetas</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {sermons.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSermon(s.id);
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Eliminar prédica"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useRef, useState } from 'react';
import { 
  FolderOpen, 
  X, 
  Plus, 
  BookOpen, 
  Calendar, 
  User, 
  Trash2, 
  ArrowRight,
  Sparkles,
  Upload,
  Download,
  FileJson,
  Check,
  AlertCircle,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SermonNote, SermonCategory, SERMON_CATEGORIES } from '../types';
import { 
  exportSermonToJson, 
  exportAllSermonsToJson, 
  importSermonsFromJson 
} from '../services/storage';

interface SermonListModalProps {
  isOpen: boolean;
  onClose: () => void;
  sermons: SermonNote[];
  activeSermonId: string;
  onSelectSermon: (sermon: SermonNote) => void;
  onNewSermon: (category?: SermonCategory) => void;
  onDeleteSermon: (id: string) => void;
  onImportSuccess?: (imported: SermonNote) => void;
  onUpdateSermonCategory?: (sermonId: string, category: SermonCategory) => void;
}

export const SermonListModal: React.FC<SermonListModalProps> = ({
  isOpen,
  onClose,
  sermons,
  activeSermonId,
  onSelectSermon,
  onNewSermon,
  onDeleteSermon,
  onImportSuccess,
  onUpdateSermonCategory,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<SermonCategory | 'all'>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleTriggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = importSermonsFromJson(content);
      if (result.success && result.importedSermon) {
        setFeedbackMsg({
          type: 'success',
          text: `¡${result.count > 1 ? `${result.count} prédicas importadas` : `Prédica "${result.importedSermon.title}" importada`} con éxito!`,
        });
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
        if (onImportSuccess) {
          onImportSuccess(result.importedSermon);
        }
        setTimeout(() => setFeedbackMsg(null), 3500);
      } else {
        setFeedbackMsg({
          type: 'error',
          text: result.error || 'No se pudo importar el archivo. Verifica que sea un archivo válido de Rhema (.json).',
        });
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const filteredSermons = selectedCategory === 'all'
    ? sermons
    : sermons.filter((s) => (s.category || 'Predicas Dominicales') === selectedCategory);

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
              src="/assets/aistudio/logoRHEMA_4329ba63.jpg"
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

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar border-b border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/50 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-700 text-white shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/70 dark:hover:bg-stone-800'
            }`}
          >
            Todas ({sermons.length})
          </button>
          {SERMON_CATEGORIES.map((cat) => {
            const count = sermons.filter(
              (s) => (s.category || 'Predicas Dominicales') === cat.id
            ).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-700 text-white shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/70 dark:hover:bg-stone-800'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-white/25 text-white'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Hidden File Input for Import */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Feedback Alert Banner */}
        {feedbackMsg && (
          <div
            className={`mx-4 mt-3 p-3 rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in duration-200 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="flex-1">{feedbackMsg.text}</span>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
            >
              ×
            </button>
          </div>
        )}

        {/* Action ribbon */}
        <div className="p-3 bg-stone-100/70 dark:bg-stone-900/40 border-b border-stone-200 dark:border-stone-800 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleTriggerImport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-medium transition-colors cursor-pointer"
              title="Cargar un archivo .json de prédica exportado desde otro dispositivo"
            >
              <Upload className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Importar (.json)</span>
            </button>

            <button
              onClick={() => exportAllSermonsToJson()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-medium transition-colors cursor-pointer"
              title="Descargar un único archivo con todas las prédicas guardadas"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Respaldar Todo</span>
            </button>
          </div>

          <button
            onClick={() => {
              onNewSermon(selectedCategory === 'all' ? 'Predicas Dominicales' : selectedCategory);
              onClose();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {selectedCategory === 'all' ? 'Nueva Prédica' : `Nueva en ${SERMON_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Categoría'}`}
            </span>
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {filteredSermons.length === 0 ? (
            <div className="text-center py-8 text-stone-400 dark:text-stone-500 text-xs space-y-2">
              <FolderOpen className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-600" />
              <p>No hay prédicas guardadas en esta categoría.</p>
              <button
                onClick={() => {
                  onNewSermon(selectedCategory === 'all' ? 'Predicas Dominicales' : selectedCategory);
                  onClose();
                }}
                className="text-amber-700 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
              >
                + Crear una aquí
              </button>
            </div>
          ) : (
            filteredSermons.map((s) => {
              const isActive = s.id === activeSermonId;
              const catConfig =
                SERMON_CATEGORIES.find(
                  (c) => c.id === (s.category || 'Predicas Dominicales')
                ) || SERMON_CATEGORIES[0];

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
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                        {s.title}
                      </h3>
                      {isActive && (
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
                          Abierta
                        </span>
                      )}

                      {/* Category Badge & Selector */}
                      <select
                        value={s.category || 'Predicas Dominicales'}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          onUpdateSermonCategory?.(
                            s.id,
                            e.target.value as SermonCategory
                          );
                        }}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border cursor-pointer ${catConfig.badgeBg} ${catConfig.badgeBorder} focus:outline-none`}
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
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-1.5">
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportSermonToJson(s);
                      }}
                      className="p-1.5 text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
                      title="Descargar archivo (.json) de esta prédica para transferir a otro dispositivo"
                    >
                      <FileJson className="w-4 h-4" />
                    </button>

                    {sermons.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSermon(s.id);
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar prédica"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

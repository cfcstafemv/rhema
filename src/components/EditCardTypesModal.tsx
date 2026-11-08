import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, Sparkles, Bookmark, CheckCircle2, Lightbulb, Compass, Tags } from 'lucide-react';
import { CardType } from '../types';
import { CARD_TYPES } from '../data/bibleData';
import { getCustomCardTypeLabels, saveCustomCardTypeLabels, resetCustomCardTypeLabels, DEFAULT_CARD_TYPE_LABELS } from '../services/storage';

interface EditCardTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLabelsUpdated?: (newLabels: Record<CardType, string>) => void;
}

export const EditCardTypesModal: React.FC<EditCardTypesModalProps> = ({
  isOpen,
  onClose,
  onLabelsUpdated,
}) => {
  const [labels, setLabels] = useState<Record<CardType, string>>(getCustomCardTypeLabels());
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLabels(getCustomCardTypeLabels());
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (type: CardType, value: string) => {
    setLabels((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Trim values or fallback to default if blank
    const cleaned: Record<CardType, string> = {
      central: labels.central.trim() || DEFAULT_CARD_TYPE_LABELS.central,
      point: labels.point.trim() || DEFAULT_CARD_TYPE_LABELS.point,
      action: labels.action.trim() || DEFAULT_CARD_TYPE_LABELS.action,
      illustration: labels.illustration.trim() || DEFAULT_CARD_TYPE_LABELS.illustration,
      cross: labels.cross.trim() || DEFAULT_CARD_TYPE_LABELS.cross,
    };
    const saved = saveCustomCardTypeLabels(cleaned);
    setLabels(saved);
    if (onLabelsUpdated) {
      onLabelsUpdated(saved);
    }
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleReset = () => {
    const defaults = resetCustomCardTypeLabels();
    setLabels(defaults);
    if (onLabelsUpdated) {
      onLabelsUpdated(defaults);
    }
  };

  const renderIcon = (type: CardType, color: string) => {
    const props = { className: 'w-4 h-4 shrink-0', style: { color } };
    switch (type) {
      case 'central':
        return <Sparkles {...props} />;
      case 'point':
        return <Bookmark {...props} />;
      case 'action':
        return <CheckCircle2 {...props} />;
      case 'illustration':
        return <Lightbulb {...props} />;
      case 'cross':
        return <Compass {...props} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[#FBF9F5] dark:bg-[#141720] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white/60 dark:bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Tags className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-cinzel font-bold text-stone-900 dark:text-stone-100">
                Títulos Predeterminados
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                Edita los nombres de las categorías de tarjetas
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-3.5 overflow-y-auto max-h-[70vh]">
          {CARD_TYPES.map((t) => {
            const currentVal = labels[t.id as CardType] ?? t.label;
            return (
              <div key={t.id} className="space-y-1">
                <label className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                  <div className="flex items-center gap-1.5">
                    {renderIcon(t.id as CardType, t.color)}
                    <span>Tipo predeterminado</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-normal">Original: {t.label}</span>
                </label>
                <input
                  type="text"
                  value={currentVal}
                  onChange={(e) => handleChange(t.id as CardType, e.target.value)}
                  placeholder={`Ej. ${t.label}...`}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition-all shadow-2xs"
                  required
                />
              </div>
            );
          })}

          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors cursor-pointer"
              title="Restablecer nombres iniciales de fábrica"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{isSaved ? '¡Guardado!' : 'Guardar Títulos'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

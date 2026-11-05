import React from 'react';
import { 
  HeartHandshake, 
  X, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Plus, 
  Lightbulb,
  Heart
} from 'lucide-react';
import { PersonalReflection, FloatingCard } from '../types';

interface PersonalReflectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reflection: PersonalReflection;
  onUpdateReflection: (updates: Partial<PersonalReflection>) => void;
  onConvertReflectionToCard: (title: string, content: string) => void;
}

export const PersonalReflectionsModal: React.FC<PersonalReflectionsModalProps> = ({
  isOpen,
  onClose,
  reflection,
  onUpdateReflection,
  onConvertReflectionToCard,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#FBF9F5] dark:bg-[#141720] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white/60 dark:bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-cinzel font-bold text-stone-900 dark:text-stone-100">
                Diario de Reflexión Personal
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                Aterrizando la Palabra del púlpito a mi vida diaria
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

        {/* Body content with thoughtful prompts */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Prompt 1: God spoke to me */}
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>¿Qué me habló Dios hoy a través de este mensaje?</span>
              </label>
              {reflection.godSpokeToMe && (
                <button
                  onClick={() => onConvertReflectionToCard('Voz de Dios en mi Corazón', reflection.godSpokeToMe)}
                  className="text-[10px] text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  title="Copiar como tarjeta flotante en el lienzo"
                >
                  <Plus className="w-3 h-3" />
                  <span>Al Lienzo</span>
                </button>
              )}
            </div>
            <textarea
              value={reflection.godSpokeToMe}
              onChange={(e) => onUpdateReflection({ godSpokeToMe: e.target.value })}
              placeholder="El Espíritu Santo me confrontó con... Me llenó de paz saber que..."
              rows={3}
              className="w-full text-xs font-sans text-stone-800 dark:text-stone-200 bg-stone-50/70 dark:bg-stone-800/50 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700/60 focus:outline-hidden focus:ring-1 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          {/* Prompt 2: Practical Application */}
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Aplicación Concreta: ¿Cómo lo viviré esta semana?</span>
              </label>
              {reflection.personalApplication && (
                <button
                  onClick={() => onConvertReflectionToCard('Acción Concreta Semanal', reflection.personalApplication)}
                  className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  title="Copiar como tarjeta flotante en el lienzo"
                >
                  <Plus className="w-3 h-3" />
                  <span>Al Lienzo</span>
                </button>
              )}
            </div>
            <textarea
              value={reflection.personalApplication}
              onChange={(e) => onUpdateReflection({ personalApplication: e.target.value })}
              placeholder="Paso práctico: hablaré con tal persona, dejaré el hábito de..., buscaré tiempo diario para..."
              rows={3}
              className="w-full text-xs font-sans text-stone-800 dark:text-stone-200 bg-stone-50/70 dark:bg-stone-800/50 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700/60 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          {/* Two-column sub-prompts: Prayer & Gratitude */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 shadow-2xs space-y-2">
              <label className="font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-xs">
                <Heart className="w-3.5 h-3.5 text-pink-500" />
                <span>Petición de Oración</span>
              </label>
              <textarea
                value={reflection.prayerRequest}
                onChange={(e) => onUpdateReflection({ prayerRequest: e.target.value })}
                placeholder="Señor, pongo delante de ti mi necesidad de..."
                rows={2}
                className="w-full text-xs font-sans text-stone-800 dark:text-stone-200 bg-stone-50/70 dark:bg-stone-800/50 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700/60 focus:outline-hidden focus:ring-1 focus:ring-pink-500"
              />
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 shadow-2xs space-y-2">
              <label className="font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-xs">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                <span>Compromiso Espiritual</span>
              </label>
              <textarea
                value={reflection.spiritualCommitment}
                onChange={(e) => onUpdateReflection({ spiritualCommitment: e.target.value })}
                placeholder="Me comprometo a perseverar en..."
                rows={2}
                className="w-full text-xs font-sans text-stone-800 dark:text-stone-200 bg-stone-50/70 dark:bg-stone-800/50 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700/60 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 flex items-center justify-between">
          <span className="text-xs text-stone-400">
            Se guarda automáticamente en tu dispositivo
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Listo, guardar reflexiones
          </button>
        </div>
      </div>
    </div>
  );
};

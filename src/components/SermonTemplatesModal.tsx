import React, { useState } from 'react';
import {
  X,
  Layers,
  Sparkles,
  BookOpen,
  Compass,
  CheckCircle2,
  Lightbulb,
  Bookmark,
  Check,
  Info,
  ArrowRight,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import { FloatingCard, CardType } from '../types';
import confetti from 'canvas-confetti';

interface SermonTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (newCards: FloatingCard[], mode: 'replace' | 'append') => void;
  currentCardsCount: number;
  currentScripture?: string;
}

interface TemplateDefinition {
  id: string;
  name: string;
  categoryTag: string;
  badgeColor: string;
  subtitle: string;
  description: string;
  recommendedFor: string;
  structure: Array<{
    title: string;
    tag: string;
    type: CardType;
    color: string;
    content: string;
  }>;
}

const HOMILETICAL_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'expository',
    name: 'Sermón Expositivo',
    categoryTag: 'Versículo por versículo',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
    subtitle: 'Estructura progresiva a través de un pasaje bíblico continuo',
    description: 'La forma clásica y más fiel para predicar. El bosquejo fluye naturalmente de la propia estructura y argumento del texto bíblico seleccionado.',
    recommendedFor: 'Predicación dominical, series a través de un libro bíblico y enseñanzas profundas de un capítulo.',
    structure: [
      {
        title: '1. Pasaje Principal y Proposición Central',
        tag: 'Texto Bíblico',
        type: 'central',
        color: '#D97706', // Amber
        content: 'Lectura bíblica central. Proposición: ¿Cuál es la verdad eterna que el autor comunica a la congregación en este pasaje?',
      },
      {
        title: '2. Contexto Histórico y Redaccional',
        tag: 'Contexto Histórico',
        type: 'cross',
        color: '#3B82F6', // Blue
        content: '¿Quién escribe y a quiénes? Circunstancias culturales de la época, problemas que la carta o libro abordaba y propósito original.',
      },
      {
        title: '3. Primer Movimiento del Texto (Punto 1)',
        tag: 'Punto Expositivo',
        type: 'point',
        color: '#6366F1', // Indigo
        content: 'Explicación del primer bloque de versículos. Análisis de términos clave, verbos principales y la revelación del carácter de Dios.',
      },
      {
        title: '4. Segundo Movimiento del Texto (Punto 2)',
        tag: 'Punto Expositivo',
        type: 'point',
        color: '#6366F1', // Indigo
        content: 'Desarrollo de la siguiente verdad teológica en el texto. Conexión lógica con el punto anterior y su resolución en la Escritura.',
      },
      {
        title: '5. Ilustración Contemporánea',
        tag: 'Ilustración',
        type: 'illustration',
        color: '#EC4899', // Pink
        content: 'Analogía, metáfora visual o historia que ancle el principio en la experiencia cotidiana de los oyentes.',
      },
      {
        title: '6. Aplicación Pastoral y Desafío',
        tag: 'Aplicación Práctica',
        type: 'action',
        color: '#10B981', // Emerald
        content: '¿Cómo debe cambiar nuestra vida, mente y corazón tras escuchar esta verdad divina hoy? Pasos específicos para la semana.',
      },
      {
        title: '7. Conclusión: Cristo en el Evangelio y Oración',
        tag: 'Llamado',
        type: 'central',
        color: '#D97706', // Amber
        content: 'Cierre enfocado en la suficiencia de la gracia de Jesús. Llamado a la fe, entrega personal y ministración.',
      },
    ],
  },
  {
    id: 'thematic',
    name: 'Sermón Temático / Doctrinal',
    categoryTag: 'Doctrina & Vida Cristiana',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800',
    subtitle: 'Desarrollo de una verdad bíblica apoyada en múltiples pasajes',
    description: 'Permite abordar de forma integral temas específicos (ej: la gracia, la reconciliación, las finanzas o la oración) examinando lo que toda la Escritura enseña.',
    recommendedFor: 'Series de discipulado, campañas temáticas y fortalecimiento doctrinal de la iglesia.',
    structure: [
      {
        title: '1. Declaración de la Tesis Central',
        tag: 'Tesis Central',
        type: 'central',
        color: '#D97706',
        content: 'La gran afirmación bíblica que la congregación debe comprender hoy: clara, memorable y arraigada en el Evangelio.',
      },
      {
        title: '2. Fundamento en la Escritura',
        tag: 'Fundamento Bíblico',
        type: 'point',
        color: '#6366F1',
        content: 'Pasajes clave del Antiguo y Nuevo Testamento que establecen y validan de manera irrefutable esta enseñanza.',
      },
      {
        title: '3. Realidad Cultural vs. Pensamiento de Dios',
        tag: 'Contexto & Contraste',
        type: 'cross',
        color: '#3B82F6',
        content: '¿Cómo distorsiona el mundo esta área de la vida? Contraste entre la sabiduría secular y la sabiduría eterna de Dios.',
      },
      {
        title: '4. Testimonio o Ilustración Vivencial',
        tag: 'Ilustración',
        type: 'illustration',
        color: '#EC4899',
        content: 'Ejemplo concreto de alguien que creyó a Dios en este tema y experimentó Su redención y fidelidad.',
      },
      {
        title: '5. Pasos Concretos de Obediencia y Fe',
        tag: 'Aplicación Práctica',
        type: 'action',
        color: '#10B981',
        content: 'Acciones prácticas para vivir esta verdad esta semana: decisiones concretas en el hogar, trabajo y vida interior.',
      },
    ],
  },
  {
    id: 'inductive',
    name: 'Estudio Inductivo (O.I.A.)',
    categoryTag: 'Observación · Interpretación · Aplicación',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
    subtitle: 'El método más riguroso de investigación del texto bíblico',
    description: 'Guía paso a paso al pastor o maestro: primero descubrir qué dice el texto exactamente, luego qué significaba para sus oyentes originales, y finalmente cómo nos transforma hoy.',
    recommendedFor: 'Grupos pequeños, células, preparación exegética de clases y discipulado inductivo.',
    structure: [
      {
        title: '1. Pasaje Delimitado de Estudio',
        tag: 'Texto Bíblico',
        type: 'central',
        color: '#D97706',
        content: 'Lectura detenida y repetida del pasaje. Identificar el género literario (epístola, narrativa, poesía, profecía).',
      },
      {
        title: '2. Observación: ¿Qué dice exactamente el texto?',
        tag: 'Observación',
        type: 'point',
        color: '#6366F1',
        content: '¿Quiénes intervienen? Palabras y conceptos repetidos. Verbos clave. Conectores lógicos ("por tanto", "porque", "para que", "pero").',
      },
      {
        title: '3. Interpretación: ¿Qué significaba para los primeros oyentes?',
        tag: 'Interpretación',
        type: 'cross',
        color: '#3B82F6',
        content: '¿Cuál fue la intención original del autor divino y humano? ¿Qué problema solucionaba en ese momento histórico?',
      },
      {
        title: '4. Correlación Bíblica: Analogía de la Fe',
        tag: 'Correlación',
        type: 'point',
        color: '#6366F1',
        content: '¿Qué otros pasajes de la Biblia iluminan o confirman este texto? La Escritura es su propio mejor intérprete.',
      },
      {
        title: '5. Aplicación: ¿Cómo transforma mi vida hoy?',
        tag: 'Aplicación Personal',
        type: 'action',
        color: '#10B981',
        content: 'Pecados a confesar, promesas a abrazar, mandamientos a obedecer, actitudes a corregir y alabanzas al Padre.',
      },
    ],
  },
];

export const SermonTemplatesModal: React.FC<SermonTemplatesModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  currentCardsCount,
  currentScripture,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('expository');
  const [applyMode, setApplyMode] = useState<'append' | 'replace'>('append');

  if (!isOpen) return null;

  const currentTemplate =
    HOMILETICAL_TEMPLATES.find((t) => t.id === selectedTemplateId) || HOMILETICAL_TEMPLATES[0];

  const handleApply = () => {
    const colWidth = 350;
    const rowHeight = 250;
    const cols = 3;

    const baseIndexOffset = applyMode === 'append' ? currentCardsCount : 0;
    const now = Date.now();

    const newCards: FloatingCard[] = currentTemplate.structure.map((item, idx) => {
      const overallIdx = baseIndexOffset + idx;
      const col = overallIdx % cols;
      const row = Math.floor(overallIdx / cols);

      return {
        id: `card-tpl-${now}-${idx}`,
        type: item.type,
        customTypeLabel: item.tag,
        tags: [item.tag],
        title: item.title,
        content: item.content,
        color: item.color,
        x: 40 + col * colWidth,
        y: 40 + row * rowHeight,
        width: 320,
        zIndex: overallIdx + 2,
        createdAt: now + idx,
      };
    });

    onApplyTemplate(newCards, applyMode);

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.65 },
    });

    onClose();
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
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-cinzel font-bold text-stone-900 dark:text-stone-100">
                Plantillas Homiléticas y de Estudio
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                Estructuras sólidas para organizar tu prédica o estudio sobre el lienzo
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

        {/* Notice: 100% editable tags and titles */}
        <div className="px-5 py-2.5 bg-amber-50/80 dark:bg-amber-950/30 border-b border-amber-200/80 dark:border-amber-900/50 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200 font-sans">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Base 100% editable:</strong> Todas las tarjetas, títulos y etiquetas (ej: <em>«Texto Bíblico»</em>, <em>«Contexto Histórico»</em>, <em>«Ilustración»</em>) se pueden modificar libremente en el lienzo con solo hacer clic en ellas.
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-5">
          {/* Template Selection Tabs (Left Column) */}
          <div className="w-full md:w-72 shrink-0 space-y-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Selecciona una estructura base
            </span>

            {HOMILETICAL_TEMPLATES.map((tpl) => {
              const isSelected = tpl.id === selectedTemplateId;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-1 ring-amber-500 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40 bg-white dark:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                      {tpl.name}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${tpl.badgeColor}`}>
                      {tpl.structure.length} tarjetas
                    </span>
                  </div>
                  <span className="text-xs text-stone-500 dark:text-stone-400 leading-snug">
                    {tpl.subtitle}
                  </span>
                </button>
              );
            })}

            {/* Mode selection: Replace or Append */}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Modo de inserción en el lienzo
              </span>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 dark:border-stone-800 cursor-pointer text-xs hover:bg-stone-50 dark:hover:bg-stone-800/40">
                <input
                  type="radio"
                  name="applyMode"
                  checked={applyMode === 'append'}
                  onChange={() => setApplyMode('append')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                    Añadir al lienzo actual
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Conserva tus {currentCardsCount} tarjeta(s) actuales y suma estas.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 dark:border-stone-800 cursor-pointer text-xs hover:bg-stone-50 dark:hover:bg-stone-800/40">
                <input
                  type="radio"
                  name="applyMode"
                  checked={applyMode === 'replace'}
                  onChange={() => setApplyMode('replace')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="font-semibold text-rose-700 dark:text-rose-400 block">
                    Reemplazar lienzo actual
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Limpia las tarjetas previas y comienza de cero con esta plantilla.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Template Preview (Right Column) */}
          <div className="flex-1 flex flex-col space-y-3.5 bg-stone-50/50 dark:bg-stone-950/40 rounded-xl p-4 border border-stone-200/80 dark:border-stone-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-cinzel font-bold text-base text-stone-900 dark:text-stone-100">
                  {currentTemplate.name}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${currentTemplate.badgeColor}`}>
                  {currentTemplate.categoryTag}
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
                {currentTemplate.description}
              </p>
              <div className="mt-2 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/60 dark:border-amber-800/50">
                <strong>Recomendado para:</strong> {currentTemplate.recommendedFor}
              </div>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Estructura de tarjetas que se crearán ({currentTemplate.structure.length} tarjetas):
              </span>

              <div className="space-y-2">
                {currentTemplate.structure.map((cardItem, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-3 rounded-lg border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col gap-1 text-xs"
                    style={{ borderLeftColor: cardItem.color, borderLeftWidth: '4px' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-serif text-stone-800 dark:text-stone-100">
                        {cardItem.title}
                      </span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${cardItem.color}20`, color: cardItem.color }}
                      >
                        Etiqueta: {cardItem.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
                      {cardItem.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 flex items-center justify-between gap-3">
          <span className="text-xs text-stone-400">
            {applyMode === 'append' ? 'Se sumarán a tus tarjetas actuales' : 'Se reemplazará el contenido del lienzo'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium cursor-pointer"
            >
              Cancelar
            </button>

            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aplicar {currentTemplate.name}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

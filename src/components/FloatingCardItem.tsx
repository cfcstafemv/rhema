import React, { useState, useRef, useEffect } from 'react';
import { 
  GripHorizontal, 
  Trash2, 
  Minimize2, 
  Maximize2, 
  Link2, 
  Sparkles, 
  Bookmark, 
  CheckCircle2, 
  Lightbulb, 
  Compass,
  Palette,
  ExternalLink
} from 'lucide-react';
import { FloatingCard, CardType } from '../types';
import { CARD_TYPES } from '../data/bibleData';

interface FloatingCardItemProps {
  card: FloatingCard;
  onUpdate: (id: string, updates: Partial<FloatingCard>) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
  onNavigateToLinkedVerse?: (verseRef: string) => void;
  zoomScale: number;
}

const COLOR_OPTIONS = [
  '#F59E0B', // Amber
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#78716C', // Stone
];

export const FloatingCardItem: React.FC<FloatingCardItemProps> = ({
  card,
  onUpdate,
  onDelete,
  onBringToFront,
  onNavigateToLinkedVerse,
  zoomScale,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const cardTypeInfo = CARD_TYPES.find((t) => t.id === card.type) || CARD_TYPES[0];

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from the card header or drag handle, not from input/textarea
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.closest('.no-drag')
    ) {
      onBringToFront(card.id);
      return;
    }

    onBringToFront(card.id);
    setIsDragging(true);

    // Record initial offset relative to card
    setDragOffset({
      x: e.clientX / zoomScale - card.x,
      y: e.clientY / zoomScale - card.y,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.round(e.clientX / zoomScale - dragOffset.x);
      const newY = Math.round(e.clientY / zoomScale - dragOffset.y);
      onUpdate(card.id, {
        x: Math.max(10, newX),
        y: Math.max(10, newY),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, zoomScale, card.id, onUpdate]);

  // Render icon for card type
  const renderTypeIcon = () => {
    switch (card.type) {
      case 'central':
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      case 'point':
        return <Bookmark className="w-3.5 h-3.5 text-indigo-500" />;
      case 'action':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'illustration':
        return <Lightbulb className="w-3.5 h-3.5 text-pink-500" />;
      case 'cross':
        return <Compass className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div
      ref={cardRef}
      id={`floating-card-${card.id}`}
      onMouseDown={handleMouseDown}
      className={`absolute select-none rounded-xl bg-white dark:bg-stone-900 border transition-shadow duration-150 ${
        isDragging
          ? 'shadow-2xl ring-2 ring-amber-500/50 cursor-grabbing'
          : 'shadow-md hover:shadow-lg'
      }`}
      style={{
        left: `${card.x}px`,
        top: `${card.y}px`,
        width: `${card.width || 320}px`,
        zIndex: card.zIndex || 1,
        borderColor: `${card.color}40`,
      }}
    >
      {/* Visual Accent Top Bar */}
      <div 
        className="h-1.5 w-full rounded-t-xl transition-colors"
        style={{ backgroundColor: card.color }}
      />

      {/* Card Header (Drag handle & controls) */}
      <div className="px-3 py-2 flex items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800/80 cursor-grab active:cursor-grabbing bg-stone-50/50 dark:bg-stone-800/30 rounded-t-xl">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
          <GripHorizontal className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          {renderTypeIcon()}
          <select
            value={card.type}
            onChange={(e) => onUpdate(card.id, { type: e.target.value as CardType })}
            className="no-drag text-[11px] font-sans font-semibold bg-transparent border-0 text-stone-700 dark:text-stone-300 focus:ring-0 cursor-pointer"
          >
            {CARD_TYPES.map((t) => (
              <option key={t.id} value={t.id} className="bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200">
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          {/* Color palette toggle */}
          <div className="relative">
            <button
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded transition-colors no-drag"
              title="Cambiar color de tarjeta"
            >
              <Palette className="w-3 h-3" />
            </button>

            {isColorPickerOpen && (
              <div className="absolute right-0 top-full mt-1 p-1.5 bg-white dark:bg-stone-800 rounded-lg shadow-xl border border-stone-200 dark:border-stone-700 flex items-center gap-1 z-50">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onUpdate(card.id, { color: c });
                      setIsColorPickerOpen(false);
                    }}
                    className="w-4 h-4 rounded-full transition-transform hover:scale-125"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Minimize toggle */}
          <button
            onClick={() => onUpdate(card.id, { isMinimized: !card.isMinimized })}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded transition-colors no-drag"
            title={card.isMinimized ? 'Expandir' : 'Minimizar'}
          >
            {card.isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(card.id)}
            className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors no-drag"
            title="Eliminar tarjeta"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Card Content Area */}
      <div className={`p-3.5 space-y-2.5 ${card.isMinimized ? 'hidden' : 'block'}`}>
        {/* Title Input */}
        <input
          type="text"
          value={card.title}
          onChange={(e) => onUpdate(card.id, { title: e.target.value })}
          placeholder="Título del punto o mensaje..."
          className="w-full text-sm font-bold font-serif text-stone-900 dark:text-stone-100 bg-transparent border-0 border-b border-transparent hover:border-stone-200 dark:hover:border-stone-700 focus:border-amber-500 focus:outline-hidden px-0 py-0.5 transition-colors"
        />

        {/* Content Note Textarea */}
        <textarea
          value={card.content}
          onChange={(e) => onUpdate(card.id, { content: e.target.value })}
          placeholder="Escribe las notas, argumentos del pastor, preguntas o citas..."
          rows={3}
          className="w-full text-xs font-sans text-stone-700 dark:text-stone-300 bg-transparent resize-y border-0 focus:outline-hidden p-0 leading-relaxed placeholder:text-stone-400"
        />

        {/* Linked Scripture Reference Ribbon */}
        {card.linkedVerseRef && (
          <div 
            onClick={() => onNavigateToLinkedVerse && onNavigateToLinkedVerse(card.linkedVerseRef!)}
            className="p-2 rounded-lg text-[11px] font-sans flex items-start gap-1.5 transition-colors cursor-pointer group hover:brightness-95"
            style={{ backgroundColor: `${card.color}15`, border: `1px solid ${card.color}35` }}
            title="Clic para ver este pasaje en la Biblia"
          >
            <Link2 className="w-3 h-3 shrink-0 mt-0.5" style={{ color: card.color }} />
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-semibold font-serif" style={{ color: card.color }}>
                  {card.linkedVerseRef}
                </span>
                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: card.color }} />
              </div>
              {card.linkedQuote && (
                <p className="italic text-stone-600 dark:text-stone-400 truncate mt-0.5">
                  "{card.linkedQuote}"
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Minimized preview label */}
      {card.isMinimized && (
        <div className="px-3 py-2 text-xs font-serif font-bold text-stone-800 dark:text-stone-200 truncate">
          {card.title || 'Tarjeta minimizada'}
        </div>
      )}
    </div>
  );
};

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
  ExternalLink,
  PenLine,
  MonitorPlay,
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
  typeLabels?: Record<CardType, string>;
  onOpenEditDefaults?: () => void;
  onDirty?: () => void;
  onProjectCard?: (card: FloatingCard) => void;
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

export const FloatingCardItem: React.FC<FloatingCardItemProps> = React.memo(({
  card,
  onUpdate,
  onDelete,
  onBringToFront,
  onNavigateToLinkedVerse,
  zoomScale,
  typeLabels,
  onOpenEditDefaults,
  onDirty,
  onProjectCard,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [localTitle, setLocalTitle] = useState(card.title);
  const [localContent, setLocalContent] = useState(card.content);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Refs for GPU-accelerated dragging without React re-renders per pixel
  const dragOriginRef = useRef<{
    startClientX: number;
    startClientY: number;
    cardStartX: number;
    cardStartY: number;
    dx: number;
    dy: number;
  } | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Refs for debounced text updates
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTitleRef = useRef(card.title);
  const latestContentRef = useRef(card.content);

  const cardTypeInfo = CARD_TYPES.find((t) => t.id === card.type) || CARD_TYPES[0];
  const [tagInput, setTagInput] = useState(
    card.customTypeLabel || card.tags?.[0] || (typeLabels && typeLabels[card.type]) || cardTypeInfo.label
  );

  useEffect(() => {
    setTagInput(
      card.customTypeLabel || card.tags?.[0] || (typeLabels && typeLabels[card.type]) || cardTypeInfo.label
    );
  }, [card.customTypeLabel, card.tags, card.type, typeLabels, cardTypeInfo.label]);

  useEffect(() => {
    setLocalTitle(card.title);
    latestTitleRef.current = card.title;
  }, [card.id, card.title]);

  useEffect(() => {
    setLocalContent(card.content);
    latestContentRef.current = card.content;
  }, [card.id, card.content]);

  useEffect(() => {
    return () => {
      if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
      if (contentTimerRef.current) clearTimeout(contentTimerRef.current);
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const handleTitleChange = (val: string) => {
    setLocalTitle(val);
    latestTitleRef.current = val;
    onDirty?.();
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(() => {
      titleTimerRef.current = null;
      onUpdate(card.id, { title: val });
    }, 250);
  };

  const handleTitleBlur = () => {
    if (titleTimerRef.current) {
      clearTimeout(titleTimerRef.current);
      titleTimerRef.current = null;
      onUpdate(card.id, { title: latestTitleRef.current });
    }
  };

  const handleContentChange = (val: string) => {
    setLocalContent(val);
    latestContentRef.current = val;
    onDirty?.();
    if (contentTimerRef.current) clearTimeout(contentTimerRef.current);
    contentTimerRef.current = setTimeout(() => {
      contentTimerRef.current = null;
      onUpdate(card.id, { content: val });
    }, 250);
  };

  const handleContentFocus = () => {
    const trimmed = (latestContentRef.current || '').replace(/\r/g, '').trim();
    if (
      trimmed === '💬 Respuestas y aportes del grupo:\n•' ||
      trimmed === '💬 Respuestas y aportes del grupo:'
    ) {
      setLocalContent('');
      latestContentRef.current = '';
      onUpdate(card.id, { content: '' });
    }
  };

  const handleContentBlur = () => {
    if (contentTimerRef.current) {
      clearTimeout(contentTimerRef.current);
      contentTimerRef.current = null;
      onUpdate(card.id, { content: latestContentRef.current });
    }
  };

  // Dragging logic - Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
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
    dragOriginRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      cardStartX: card.x,
      cardStartY: card.y,
      dx: 0,
      dy: 0,
    };
    setIsDragging(true);
  };

  // Dragging logic - Touch (Tablet & Phone)
  const handleTouchStart = (e: React.TouchEvent) => {
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

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      onBringToFront(card.id);
      dragOriginRef.current = {
        startClientX: touch.clientX,
        startClientY: touch.clientY,
        cardStartX: card.x,
        cardStartY: card.y,
        dx: 0,
        dy: 0,
      };
      setIsDragging(true);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const scheduleTransform = (clientX: number, clientY: number) => {
      const origin = dragOriginRef.current;
      if (!origin) return;
      const rawDx = (clientX - origin.startClientX) / zoomScale;
      const rawDy = (clientY - origin.startClientY) / zoomScale;
      origin.dx = Math.max(10 - origin.cardStartX, Math.round(rawDx));
      origin.dy = Math.max(10 - origin.cardStartY, Math.round(rawDy));

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          if (cardRef.current && dragOriginRef.current) {
            cardRef.current.style.transform = `translate3d(${dragOriginRef.current.dx}px, ${dragOriginRef.current.dy}px, 0)`;
          }
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      scheduleTransform(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
      if (e.touches.length === 1) {
        scheduleTransform(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (cardRef.current) {
        cardRef.current.style.transform = '';
      }
      const origin = dragOriginRef.current;
      dragOriginRef.current = null;
      setIsDragging(false);

      if (origin && (origin.dx !== 0 || origin.dy !== 0)) {
        onUpdate(card.id, {
          x: Math.max(10, origin.cardStartX + origin.dx),
          y: Math.max(10, origin.cardStartY + origin.dy),
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDragging, zoomScale, card.id, onUpdate]);

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
      data-floating-card="true"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`absolute select-none rounded-xl bg-white dark:bg-stone-900 border transition-shadow duration-150 touch-none overscroll-none ${
        isDragging
          ? 'shadow-2xl ring-2 ring-amber-500/50 cursor-grabbing'
          : 'shadow-md hover:shadow-lg'
      }`}
      style={{
        left: `${card.x}px`,
        top: `${card.y}px`,
        width: `${card.width || 320}px`,
        maxWidth: `${card.width || 320}px`,
        boxSizing: 'border-box',
        zIndex: card.zIndex || 1,
        borderColor: `${card.color}40`,
        willChange: isDragging ? 'transform' : undefined,
      }}
    >
      {/* Visual Accent Top Bar */}
      <div 
        className="h-1.5 w-full rounded-t-xl transition-colors"
        style={{ backgroundColor: card.color }}
      />

      {/* Card Header (Drag handle & controls) */}
      <div className="px-2.5 py-1.5 flex items-center justify-between gap-1.5 border-b border-stone-100 dark:border-stone-800/80 cursor-grab active:cursor-grabbing bg-stone-50/50 dark:bg-stone-800/30 rounded-t-xl overflow-hidden">
        <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
          <GripHorizontal className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="shrink-0">{renderTypeIcon()}</span>
          {isEditingTag ? (
            <input
              type="text"
              autoFocus
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onBlur={() => {
                setIsEditingTag(false);
                const trimmed = tagInput.trim();
                onUpdate(card.id, {
                  customTypeLabel: trimmed || undefined,
                  tags: trimmed ? [trimmed] : [],
                });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  (e.target as HTMLInputElement).blur();
                }
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              placeholder="Etiqueta..."
              className="no-drag text-[11px] font-sans font-bold bg-white dark:bg-stone-800 border border-amber-500 rounded px-1.5 py-0 text-stone-800 dark:text-stone-100 focus:outline-none w-28 max-w-[130px]"
            />
          ) : (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTag(true);
              }}
              className="no-drag flex items-center gap-1 cursor-pointer hover:bg-stone-200/60 dark:hover:bg-stone-700/60 px-1 py-0.5 rounded transition-colors group/tag min-w-0"
              title="Haz clic para personalizar esta etiqueta (ej: Texto Bíblico, Contexto Histórico, etc.)"
            >
              <span className="text-[11px] font-sans font-semibold text-stone-700 dark:text-stone-300 truncate max-w-[95px] sm:max-w-[110px]">
                {card.customTypeLabel || card.tags?.[0] || (typeLabels && typeLabels[card.type]) || cardTypeInfo.label}
              </span>
              <PenLine className="w-2.5 h-2.5 text-stone-400 opacity-40 group-hover/tag:opacity-100 shrink-0" />
            </div>
          )}

          {/* Selector de categoría base para paleta y semántica */}
          <select
            value={card.type}
            onChange={(e) => {
              if (e.target.value === '__edit_defaults__') {
                if (onOpenEditDefaults) onOpenEditDefaults();
                return;
              }
              const newType = e.target.value as CardType;
              const newTypeInfo = CARD_TYPES.find((t) => t.id === newType);
              onUpdate(card.id, {
                type: newType,
                color: newTypeInfo ? newTypeInfo.color : card.color,
              });
            }}
            className="no-drag text-[10px] text-stone-400 dark:text-stone-500 bg-transparent border-0 focus:ring-0 cursor-pointer p-0 w-3.5 overflow-hidden"
            title="Cambiar categoría base o color"
          >
            {CARD_TYPES.map((t) => (
              <option key={t.id} value={t.id} className="bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200">
                {(typeLabels && typeLabels[t.id as CardType]) || t.label}
              </option>
            ))}
            {onOpenEditDefaults && (
              <option value="__edit_defaults__" className="bg-amber-50 dark:bg-amber-950 font-bold text-amber-800 dark:text-amber-300">
                ✏️ Editar títulos predeterminados...
              </option>
            )}
          </select>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {onProjectCard && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onProjectCard(card);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="p-1.5 text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-md transition-colors no-drag cursor-pointer"
              title="Proyectar esta tarjeta en 2ª pantalla"
              aria-label="Proyectar tarjeta"
            >
              <MonitorPlay className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Color palette toggle */}
          <div className="relative">
            <button
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/70 dark:hover:bg-stone-700/60 rounded-md transition-colors no-drag cursor-pointer"
              title="Cambiar color de tarjeta"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {isColorPickerOpen && (
              <div className="absolute right-0 top-full mt-1 p-2 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 flex items-center gap-2 z-50">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onUpdate(card.id, { color: c });
                      setIsColorPickerOpen(false);
                    }}
                    className="w-5 h-5 rounded-full transition-transform hover:scale-125 cursor-pointer"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Minimize toggle */}
          <button
            onClick={() => onUpdate(card.id, { isMinimized: !card.isMinimized })}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/70 dark:hover:bg-stone-700/60 rounded-md transition-colors no-drag cursor-pointer"
            title={card.isMinimized ? 'Expandir' : 'Minimizar'}
          >
            {card.isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(card.id)}
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors no-drag cursor-pointer"
            title="Eliminar tarjeta"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Content Area */}
      <div className={`p-3.5 space-y-2.5 ${card.isMinimized ? 'hidden' : 'block'}`}>
        {/* Editable Title Container */}
        <div 
          className="relative group/title no-drag touch-auto select-text rounded-lg p-1 -m-1 transition-colors hover:bg-stone-100/70 dark:hover:bg-stone-800/40"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5">
            <input
              ref={titleInputRef}
              type="text"
              value={localTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              placeholder="Título del punto o mensaje..."
              className="flex-1 min-w-0 text-sm font-bold font-serif text-stone-900 dark:text-stone-100 bg-transparent border-b border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 focus:border-solid focus:border-amber-600 focus:outline-hidden px-1 py-0.5 transition-colors no-drag select-text touch-auto"
              title="Haz clic o toca para editar el título"
            />
            <button
              type="button"
              onClick={() => titleInputRef.current?.focus()}
              className="p-1 text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors opacity-70 group-hover/title:opacity-100 no-drag shrink-0 cursor-pointer"
              title="Editar título"
              aria-label="Editar título"
            >
              <PenLine className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Note Textarea */}
        <textarea
          value={localContent}
          onFocus={handleContentFocus}
          onChange={(e) => handleContentChange(e.target.value)}
          onBlur={handleContentBlur}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          placeholder={
            card.customTypeLabel === 'Pregunta de Diálogo'
              ? '💬 Respuestas y aportes del grupo...'
              : 'Escribe las notas, argumentos del pastor, preguntas o citas...'
          }
          rows={Math.min(
            10,
            Math.max(
              3,
              Math.ceil((localContent?.length || 0) / 42) +
                ((localContent?.match(/\n/g) || []).length)
            )
          )}
          className="w-full text-xs font-sans bg-transparent border-0 resize-none focus:outline-none text-stone-700 dark:text-stone-300 placeholder:text-stone-400/70 p-0 leading-relaxed"
        />

        {/* Context Map / Image Preview if attached */}
        {card.imageUrl && (
          <div className="relative rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-900/90 group/img my-1">
            <img
              src={card.imageUrl}
              alt={card.imageCaption || card.title}
              className="w-full max-h-44 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(card.imageUrl, '_blank')}
              title="Haz clic para abrir el mapa en alta resolución"
              loading="lazy"
            />
            {card.imageCaption && (
              <div className="p-1.5 bg-black/75 text-[10px] text-white/90 backdrop-blur-xs font-sans line-clamp-2">
                {card.imageCaption}
              </div>
            )}
          </div>
        )}

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

      {/* Minimized preview label with quick verse link & editable title */}
      {card.isMinimized && (
        <div 
          className="px-3 py-1.5 flex items-center gap-1.5 no-drag touch-auto select-text"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {card.linkedVerseRef && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToLinkedVerse?.(card.linkedVerseRef!);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg transition-all cursor-pointer shrink-0 hover:brightness-95 active:scale-95 no-drag"
              style={{
                backgroundColor: `${card.color}18`,
                border: `1px solid ${card.color}40`,
                color: card.color,
              }}
              title={`Ir a ${card.linkedVerseRef} en la Biblia`}
              aria-label={`Ir a ${card.linkedVerseRef} en la Biblia`}
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
          )}
          <input
            type="text"
            value={localTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            onBlur={handleTitleBlur}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            placeholder="Título de la tarjeta..."
            className="flex-1 min-w-0 text-xs font-serif font-bold text-stone-800 dark:text-stone-200 bg-transparent border-b border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 focus:border-amber-600 focus:outline-hidden py-0.5 transition-colors no-drag"
            title="Editar título de la tarjeta"
          />
          <PenLine className="w-3 h-3 text-stone-400 shrink-0" />
        </div>
      )}
    </div>
  );
});

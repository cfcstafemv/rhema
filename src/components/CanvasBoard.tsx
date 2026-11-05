import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Grid, 
  Sparkles, 
  Bookmark, 
  CheckCircle2, 
  Lightbulb, 
  Compass,
  Move
} from 'lucide-react';
import { FloatingCard, ConnectionLink, VerseHighlight, CardType } from '../types';
import { FloatingCardItem } from './FloatingCardItem';
import { CARD_TYPES } from '../data/bibleData';

interface CanvasBoardProps {
  cards: FloatingCard[];
  links: ConnectionLink[];
  highlights: VerseHighlight[];
  onUpdateCard: (id: string, updates: Partial<FloatingCard>) => void;
  onDeleteCard: (id: string) => void;
  onAddCard: (cardType: CardType) => void;
  onNavigateToLinkedVerse?: (verseRef: string) => void;
  isSplitView: boolean;
}

export const CanvasBoard: React.FC<CanvasBoardProps> = ({
  cards,
  links,
  highlights,
  onUpdateCard,
  onDeleteCard,
  onAddCard,
  onNavigateToLinkedVerse,
  isSplitView,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1200, height: 800 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize observer to track dimensions for SVG lines
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setCanvasDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Pan interaction on canvas background
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking direct background or holding space
    const target = e.target as HTMLElement;
    if (
      target.id === 'canvas-interactive-area' || 
      target.id === 'canvas-svg-layer' ||
      e.button === 1 || // Middle mouse
      e.shiftKey
    ) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  useEffect(() => {
    if (!isPanning) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, startPan]);

  // Bring card to front
  const handleBringToFront = (id: string) => {
    const maxZ = Math.max(...cards.map((c) => c.zIndex || 1), 1);
    onUpdateCard(id, { zIndex: maxZ + 1 });
  };

  // Auto-arrange cards in an orderly staggered grid
  const handleAutoArrange = () => {
    const startX = 40;
    const startY = 40;
    const colWidth = 350;
    const rowHeight = 260;
    const cols = Math.max(1, Math.floor((canvasDimensions.width - 80) / colWidth));

    cards.forEach((card, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      onUpdateCard(card.id, {
        x: startX + col * colWidth,
        y: startY + row * rowHeight,
      });
    });
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom((z) => Math.min(1.6, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, z - 0.15));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex-1 h-full overflow-hidden bg-[#FBF9F5] dark:bg-[#0E1015] bg-canvas-dots transition-colors select-none"
    >
      {/* Floating Toolbar on Canvas */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
        {/* Add Card Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white shadow-lg text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Tarjeta</span>
          </button>

          {isAddMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 p-1.5 bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 z-50 flex flex-col gap-1 text-xs">
              {CARD_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onAddCard(t.id as CardType);
                    setIsAddMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors text-left cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Auto arrange button */}
        <button
          onClick={handleAutoArrange}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md hover:bg-white dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 shadow-sm text-xs font-medium transition-colors cursor-pointer"
          title="Organizar tarjetas en cuadrícula armónica"
        >
          <Grid className="w-3.5 h-3.5 text-stone-500" />
          <span className="hidden sm:inline">Acomodar</span>
        </button>
      </div>

      {/* Floating Canvas Zoom & View Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-40 flex items-center gap-1 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-xl p-1 border border-stone-200 dark:border-stone-800 shadow-lg text-xs">
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Alejar (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="font-mono text-[11px] px-1 text-stone-500 dark:text-stone-400 min-w-[42px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Acercar (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-stone-200 dark:bg-stone-800 mx-0.5" />
        <button
          onClick={handleResetZoom}
          className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Restablecer vista centrada"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Transform Container */}
      <div
        id="canvas-interactive-area"
        onMouseDown={handleMouseDown}
        className={`w-full h-full relative cursor-default ${isPanning ? 'cursor-grabbing' : ''}`}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* SVG Dynamic Connection Cords Layer */}
        <svg
          id="canvas-svg-layer"
          className="absolute inset-0 pointer-events-none overflow-visible"
          style={{ width: '4000px', height: '4000px' }}
        >
          <defs>
            <linearGradient id="cord-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="cord-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="cord-pink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="cord-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glow-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Render connection cords between cards and biblical anchors */}
          {cards.map((card, i) => {
            if (!card.linkedVerseRef) return null;

            // Anchor point on the left edge of canvas (where Bible reader connects in split view)
            // Stagger anchor Y based on index for harmonic lines
            const anchorX = 0;
            const anchorY = Math.max(40, card.y + 40);

            // Target point on the card's left connection dock
            const targetX = card.x;
            const targetY = card.y + 24;

            // Compute smooth horizontal S-curve Bézier control points
            const deltaX = Math.abs(targetX - anchorX);
            const cp1X = anchorX + Math.max(60, deltaX * 0.45);
            const cp1Y = anchorY;
            const cp2X = targetX - Math.max(60, deltaX * 0.45);
            const cp2Y = targetY;

            const pathD = `M ${anchorX} ${anchorY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${targetX} ${targetY}`;

            return (
              <g key={`cord-${card.id}`}>
                {/* Background glow halo */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={card.color}
                  strokeWidth="5"
                  strokeOpacity="0.12"
                />

                {/* Primary dynamic cable */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={card.color}
                  strokeWidth="2.2"
                  strokeDasharray="5 3"
                  strokeOpacity="0.85"
                  filter="url(#glow-shadow)"
                  className="animate-pulse"
                />

                {/* Anchor origin dot */}
                <circle cx={anchorX} cy={anchorY} r="4" fill={card.color} />

                {/* Target node dot on card */}
                <circle cx={targetX} cy={targetY} r="4" fill={card.color} />
              </g>
            );
          })}
        </svg>

        {/* Floating Cards */}
        {cards.map((card) => (
          <FloatingCardItem
            key={card.id}
            card={card}
            onUpdate={onUpdateCard}
            onDelete={onDeleteCard}
            onBringToFront={handleBringToFront}
            onNavigateToLinkedVerse={onNavigateToLinkedVerse}
            zoomScale={zoom}
          />
        ))}

        {/* Zero State if empty */}
        {cards.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center p-8 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md rounded-2xl border border-stone-200 dark:border-stone-800 max-w-md shadow-sm">
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h3 className="font-cinzel font-bold text-stone-900 dark:text-stone-100 text-base mb-1">
              Lienzo Listo para la Palabra
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-sans leading-relaxed mb-4">
              Selecciona palabras o versículos en la Biblia para vincular tarjetas con hilos visuales, o crea una tarjeta libre usando el botón superior.
            </p>
            <button
              onClick={() => onAddCard('central')}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Crear Mensaje Central
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

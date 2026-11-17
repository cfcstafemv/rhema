import { FloatingCard } from '../types';

export const ZONE_START_X = 40;
export const ZONE_START_Y = 64;
export const ZONE_COL_WIDTH = 350;
export const ZONE_CARD_GAP = 22;

export type ZoneColumnIndex = 0 | 1 | 2;

const normalizeText = (value?: string): string => (value || '').trim().toLowerCase();

/**
 * Maps a card to one of 3 invisible semantic columns on the canvas.
 *
 * Sermon / Study mode:
 * - Col 0: Mensaje Central, Punto Principal, Punto 1, 2, 3...
 * - Col 1: Versículo Principal, Aplicación Práctica e Ilustración
 * - Col 2: Referencias, Citas Bíblicas, Citas Cruzadas y Contexto
 *
 * Cell mode:
 * - Col 0: Tema / Versículo Principal, Rompehielo, Oración y otras tarjetas
 * - Col 1: Citas Bíblicas
 * - Col 2: Preguntas de Diálogo
 */
export function getCardZoneColumn(
  card: Partial<FloatingCard>,
  isCellMode: boolean
): ZoneColumnIndex {
  const id = normalizeText(card.id);
  const title = normalizeText(card.title);
  const label = normalizeText(card.customTypeLabel || card.tags?.[0]);
  const type = card.type || 'point';

  if (isCellMode) {
    // Col 1: Citas Bíblicas
    if (
      id.startsWith('card-cell-scripture-') ||
      label.includes('texto bíblico') ||
      label.includes('cita bíblica') ||
      label.includes('cita cruzada') ||
      label.includes('referencia') ||
      title.startsWith('cita bíblica') ||
      title.startsWith('comparativa:') ||
      type === 'cross'
    ) {
      return 1;
    }

    // Col 2: Preguntas
    if (
      id.startsWith('card-cell-q-') ||
      label.includes('pregunta') ||
      type === 'action' ||
      title.startsWith('pregunta') ||
      title.endsWith('?')
    ) {
      return 2;
    }

    // Col 0: Versículo / Tema principal y otras tarjetas (rompehielo, oración, notas)
    return 0;
  }

  // Sermon / Study mode
  const isExplicitMainVerse =
    label.includes('versículo principal') ||
    label.includes('lectura principal') ||
    title.startsWith('versículo principal') ||
    title.startsWith('lectura principal');

  if (isExplicitMainVerse) {
    return 1;
  }

  // Col 2: Referencias y citas
  const isReferenceOrQuote =
    type === 'cross' ||
    title.startsWith('cita bíblica') ||
    title.startsWith('comparativa:') ||
    label.includes('cita') ||
    label.includes('referencia') ||
    label.includes('contexto') ||
    label.includes('correlación') ||
    (type !== 'central' && label.includes('texto bíblico'));

  if (isReferenceOrQuote) {
    return 2;
  }

  // Col 1: Aplicación e Ilustración
  if (type === 'action' || type === 'illustration') {
    return 1;
  }

  // Col 0: Mensaje central, punto principal, puntos 1, 2, 3...
  return 0;
}

export function estimateCardHeight(card: Partial<FloatingCard>): number {
  if (card.isMinimized) {
    return 76;
  }

  const content = card.content || '';
  const newlineCount = (content.match(/\n/g) || []).length;
  const rows = Math.min(10, Math.max(3, Math.ceil(content.length / 42) + newlineCount));
  const contentHeight = rows * 20;
  const headerAndTitleHeight = 118;
  const imageHeight = card.imageUrl ? 185 : 0;
  const linkedRibbonHeight = card.linkedVerseRef ? 58 : 0;

  return Math.max(185, headerAndTitleHeight + contentHeight + imageHeight + linkedRibbonHeight);
}

/**
 * Computes non-overlapping { x, y } for a new card inside its assigned zone column.
 */
export function computeNewCardPosition(
  existingCards: FloatingCard[],
  newCard: Partial<FloatingCard>,
  isCellMode: boolean,
  measuredHeights?: Record<string, number>
): { x: number; y: number } {
  const col = getCardZoneColumn(newCard, isCellMode);
  const targetX = ZONE_START_X + col * ZONE_COL_WIDTH;

  const cardsInColumn = existingCards.filter((c) => {
    const nearTargetX = Math.abs((c.x ?? 0) - targetX) < ZONE_COL_WIDTH * 0.5;
    const sameZone = getCardZoneColumn(c, isCellMode) === col;
    return nearTargetX || sameZone;
  });

  if (cardsInColumn.length === 0) {
    return { x: targetX, y: ZONE_START_Y };
  }

  const maxBottomY = cardsInColumn.reduce((maxY, c) => {
    const height = measuredHeights?.[c.id] || estimateCardHeight(c);
    const bottom = (c.y ?? ZONE_START_Y) + height;
    return Math.max(maxY, bottom);
  }, ZONE_START_Y);

  return {
    x: targetX,
    y: maxBottomY + ZONE_CARD_GAP,
  };
}

/**
 * Arranges all cards into 3 invisible vertical columns according to the active study mode.
 */
export function arrangeCardsInZones(
  cards: FloatingCard[],
  isCellMode: boolean,
  measuredHeights?: Record<string, number>
): Array<{ id: string; x: number; y: number }> {
  const columnNextY: [number, number, number] = [ZONE_START_Y, ZONE_START_Y, ZONE_START_Y];

  return cards.map((card) => {
    const col = getCardZoneColumn(card, isCellMode);
    const x = ZONE_START_X + col * ZONE_COL_WIDTH;
    const y = columnNextY[col];
    const height = measuredHeights?.[card.id] || estimateCardHeight(card);
    columnNextY[col] = y + height + ZONE_CARD_GAP;

    return {
      id: card.id,
      x,
      y,
    };
  });
}

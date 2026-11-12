import * as pdfjsLib from 'pdfjs-dist';
import { FloatingCard, ConnectionLink, CardType } from '../types';
import { BIBLE_BOOKS, getBibleVerses } from '../data/bibleData';

// Configure pdfjs worker
if (typeof window !== 'undefined') {
  try {
    // Use worker from unpkg/cdnjs or dynamic URL
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Could not set pdfjs workerSrc:', e);
  }
}

export interface ParsedCellLesson {
  lessonTitle: string;
  fullText: string;
  fileName?: string;
  icebreaker?: string;
  detectedScriptures: Array<{
    ref: string;
    bookId?: string;
    chapter?: number;
    verseStart?: number;
    verseEnd?: number;
    sampleText?: string;
  }>;
  detectedQuestions: string[];
  cards: FloatingCard[];
  links: ConnectionLink[];
}

/**
 * Extracts plain text from a PDF file using pdfjs-dist.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pageTexts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (pageText) {
      pageTexts.push(pageText);
    }
  }

  return pageTexts.join('\n\n');
}

// Known Spanish Bible book names and patterns for citation detection
const BOOK_MATCH_PATTERNS = [
  { names: ['mateo', 'mt', 'san mateo'], id: 'mat', label: 'Mateo' },
  { names: ['marcos', 'mr', 'mc', 'san marcos'], id: 'mar', label: 'Marcos' },
  { names: ['lucas', 'lc', 'san lucas'], id: 'luc', label: 'Lucas' },
  { names: ['juan', 'jn', 'san juan'], id: 'jua', label: 'Juan' },
  { names: ['hechos', 'hch', 'hechos de los apostoles'], id: 'hch', label: 'Hechos' },
  { names: ['romanos', 'ro', 'rom'], id: 'rom', label: 'Romanos' },
  { names: ['1 corintios', '1 cor', '1 co', '1ra corintios', '1ª corintios'], id: '1co', label: '1 Corintios' },
  { names: ['2 corintios', '2 cor', '2 co', '2da corintios', '2ª corintios'], id: '2co', label: '2 Corintios' },
  { names: ['gálatas', 'galatas', 'gál', 'gal'], id: 'gal', label: 'Gálatas' },
  { names: ['efesios', 'ef', 'efe'], id: 'efe', label: 'Efesios' },
  { names: ['filipenses', 'fil', 'flp'], id: 'fil', label: 'Filipenses' },
  { names: ['colosenses', 'col'], id: 'col', label: 'Colosenses' },
  { names: ['1 tesalonicenses', '1 tes', '1 ts'], id: '1ts', label: '1 Tesalonicenses' },
  { names: ['2 tesalonicenses', '2 tes', '2 ts'], id: '2ts', label: '2 Tesalonicenses' },
  { names: ['1 timoteo', '1 tim', '1 ti'], id: '1ti', label: '1 Timoteo' },
  { names: ['2 timoteo', '2 tim', '2 ti'], id: '2ti', label: '2 Timoteo' },
  { names: ['tito', 'tit'], id: 'tit', label: 'Tito' },
  { names: ['filemón', 'filemon', 'flm'], id: 'flm', label: 'Filemón' },
  { names: ['hebreos', 'he', 'heb'], id: 'heb', label: 'Hebreos' },
  { names: ['santiago', 'stg', 'sant'], id: 'stg', label: 'Santiago' },
  { names: ['1 pedro', '1 pe', '1 p'], id: '1pe', label: '1 Pedro' },
  { names: ['2 pedro', '2 pe', '2 p'], id: '2pe', label: '2 Pedro' },
  { names: ['1 juan', '1 jn'], id: '1jn', label: '1 Juan' },
  { names: ['2 juan', '2 jn'], id: '2jn', label: '2 Juan' },
  { names: ['3 juan', '3 jn'], id: '3jn', label: '3 Juan' },
  { names: ['judas', 'jud'], id: 'jud', label: 'Judas' },
  { names: ['apocalipsis', 'ap', 'apoc'], id: 'apo', label: 'Apocalipsis' },
  { names: ['génesis', 'genesis', 'gn', 'gen'], id: 'gen', label: 'Génesis' },
  { names: ['éxodo', 'exodo', 'éx', 'ex'], id: 'exo', label: 'Éxodo' },
  { names: ['levítico', 'levitico', 'lv', 'lev'], id: 'lev', label: 'Levítico' },
  { names: ['números', 'numeros', 'nm', 'num'], id: 'num', label: 'Números' },
  { names: ['deuteronomio', 'dt', 'deu'], id: 'deu', label: 'Deuteronomio' },
  { names: ['josué', 'josue', 'jos'], id: 'jos', label: 'Josué' },
  { names: ['jueces', 'jue'], id: 'jue', label: 'Jueces' },
  { names: ['salmos', 'salmo', 'sal', 'ps'], id: 'sal', label: 'Salmos' },
  { names: ['proverbios', 'pr', 'prov'], id: 'pro', label: 'Proverbios' },
  { names: ['isaías', 'isaias', 'is'], id: 'isa', label: 'Isaías' },
  { names: ['jeremías', 'jeremias', 'jer'], id: 'jer', label: 'Jeremías' },
];

/**
 * Analyzes the extracted cell lesson text:
 * 1. Finds the title
 * 2. Extracts biblical references in exact order of appearance
 * 3. Extracts study/dialogue questions
 * 4. Extracts icebreaker/rompehielo
 * 5. Generates cards and visual connection links
 */
export function parseCellLesson(text: string, fileName?: string): ParsedCellLesson {
  const clean = text.trim();
  const lines = clean.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Detect Title
  let detectedTitle = '';
  for (const line of lines.slice(0, 8)) {
    const titleMatch = line.match(/(?:tema|lección|leccion|título|titulo|estudio|célula|celula)[:\s\-]+(.+)/i);
    if (titleMatch && titleMatch[1].length > 3) {
      detectedTitle = titleMatch[1].trim();
      break;
    }
  }

  if (!detectedTitle && lines.length > 0) {
    // Take the first prominent line that isn't too long
    const candidate = lines[0];
    detectedTitle = candidate.length <= 80 ? candidate : candidate.substring(0, 75) + '...';
  }

  if (!detectedTitle) {
    detectedTitle = fileName ? fileName.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ') : 'Lección de Célula Semanal';
  }

  // 2. Detect Biblical Scriptures in order of appearance
  const detectedScriptures: ParsedCellLesson['detectedScriptures'] = [];
  const seenRefs = new Set<string>();

  // Regular expression to scan citations: (Book Name) (Chapter)(:(Verse)(-Verse)?)?
  // We scan using known book names
  for (const bp of BOOK_MATCH_PATTERNS) {
    for (const name of bp.names) {
      // Escape for regex
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\s+(\\d+)(?::(\\d+)(?:-(\\d+))?)?\\b`, 'gi');

      let m: RegExpExecArray | null;
      while ((m = regex.exec(clean)) !== null) {
        const chapter = parseInt(m[1], 10);
        const verseStart = m[2] ? parseInt(m[2], 10) : undefined;
        const verseEnd = m[3] ? parseInt(m[3], 10) : undefined;

        const canonicalRef = `${bp.label} ${chapter}${
          verseStart ? `:${verseStart}${verseEnd ? `-${verseEnd}` : ''}` : ''
        }`;

        if (!seenRefs.has(canonicalRef)) {
          seenRefs.add(canonicalRef);

          // Try to look up real text from Rhema Bible verses
          let sampleText = '';
          try {
            const verses = getBibleVerses(bp.id, chapter, 'RVR1960');
            if (verses && verses.length > 0) {
              if (verseStart) {
                const targetVerses = verses.filter(
                  (v) => v.verse >= verseStart && v.verse <= (verseEnd || verseStart)
                );
                sampleText = targetVerses.map((v) => `${v.verse}. ${v.text}`).join(' ');
              } else {
                sampleText = verses.slice(0, 3).map((v) => `${v.verse}. ${v.text}`).join(' ') + '...';
              }
            }
          } catch {}

          detectedScriptures.push({
            ref: canonicalRef,
            bookId: bp.id,
            chapter,
            verseStart,
            verseEnd,
            sampleText: sampleText || undefined,
          });
        }
      }
    }
  }

  // Sort scriptures roughly by appearance in text if needed
  detectedScriptures.sort((a, b) => clean.indexOf(a.ref) - clean.indexOf(b.ref));

  // 3. Detect Questions
  const detectedQuestions: string[] = [];
  const seenQuestions = new Set<string>();

  // Regex patterns:
  // a) Standard Spanish questions: ¿... ?
  const questionRegex = /¿([^?\n\r]{8,250})\?/g;
  let qm: RegExpExecArray | null;
  while ((qm = questionRegex.exec(clean)) !== null) {
    const fullQ = `¿${qm[1].trim()}?`;
    if (!seenQuestions.has(fullQ) && fullQ.length > 12) {
      seenQuestions.add(fullQ);
      detectedQuestions.push(fullQ);
    }
  }

  // b) Numbered questions like "1. ¿...", "Pregunta 1: ..."
  if (detectedQuestions.length === 0) {
    for (const line of lines) {
      if (
        (line.match(/^\d+[\.\)\-]\s+/) || line.match(/^(?:pregunta|pregunta para dialogar)\s*\d*[:\-]/i)) &&
        line.length > 15
      ) {
        if (!seenQuestions.has(line)) {
          seenQuestions.add(line);
          detectedQuestions.push(line);
        }
      }
    }
  }

  // 4. Detect Icebreaker / Rompehielo
  let icebreaker = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/(?:rompehielo|dinámica|dinamica|rompe-hielo|bienvenida|pregunta inicial)[:\s\-]+/i)) {
      const rest = line.replace(/(?:rompehielo|dinámica|dinamica|rompe-hielo|bienvenida|pregunta inicial)[:\s\-]+/i, '').trim();
      icebreaker = rest || lines[i + 1] || '';
      break;
    }
  }

  // 5. Generate Floating Cards & Visual Connection Links
  const now = Date.now();
  const cards: FloatingCard[] = [];
  const links: ConnectionLink[] = [];

  let cardIndex = 0;
  const colWidth = 350;
  const rowHeight = 260;
  const cols = 3;

  const getPosition = (idx: number) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    return {
      x: 40 + col * colWidth,
      y: 40 + row * rowHeight,
    };
  };

  // 5.1 Add Lesson Header / Main Card
  const pos0 = getPosition(cardIndex++);
  const mainCardId = `card-cell-main-${now}`;
  cards.push({
    id: mainCardId,
    type: 'central',
    customTypeLabel: 'Tema de Célula',
    tags: ['Tema de Célula'],
    title: detectedTitle,
    content: `Lección semanal de célula.\n\n📖 Pasajes citados: ${
      detectedScriptures.map((s) => s.ref).join(', ') || 'Ver texto completo'
    }\n👥 Dinámica de grupo: Participación abierta y oración mutua.`,
    color: '#059669', // Emerald
    x: pos0.x,
    y: pos0.y,
    width: 330,
    zIndex: cardIndex + 2,
    createdAt: now + cardIndex,
  });

  // 5.2 Add Icebreaker Card if found
  if (icebreaker) {
    const posIce = getPosition(cardIndex++);
    cards.push({
      id: `card-cell-ice-${now}`,
      type: 'illustration',
      customTypeLabel: 'Rompehielo',
      tags: ['Rompehielo'],
      title: 'Rompehielo / Conexión Inicial',
      content: `${icebreaker}\n\n⏱️ Tiempo sugerido: 10-15 minutos para que todos participen.`,
      color: '#EC4899', // Pink
      x: posIce.x,
      y: posIce.y,
      width: 320,
      zIndex: cardIndex + 2,
      createdAt: now + cardIndex,
    });
  }

  // 5.3 Add Biblical Scripture Cards in order
  const scriptureCardIds: string[] = [];
  detectedScriptures.forEach((sc, sIdx) => {
    const pos = getPosition(cardIndex++);
    const cardId = `card-cell-scripture-${now}-${sIdx}`;
    scriptureCardIds.push(cardId);

    cards.push({
      id: cardId,
      type: 'point',
      customTypeLabel: 'Texto Bíblico',
      tags: ['Texto Bíblico'],
      title: `Cita Bíblica: ${sc.ref}`,
      content: sc.sampleText
        ? `«${sc.sampleText}»`
        : `Pasaje de estudio citado en la lección (${sc.ref}). Leer juntos en voz alta en el grupo.`,
      color: '#3B82F6', // Blue
      linkedVerseRef: sc.ref,
      linkedQuote: sc.sampleText,
      x: pos.x,
      y: pos.y,
      width: 320,
      zIndex: cardIndex + 2,
      createdAt: now + cardIndex,
    });

    // Link scripture card to main card
    links.push({
      id: `link-cell-sc-${now}-${sIdx}`,
      fromVerseRef: sc.ref,
      toCardId: cardId,
      label: sc.ref,
      color: '#3B82F6',
    });
  });

  // 5.4 Add Study Question Cards
  detectedQuestions.forEach((q, qIdx) => {
    const pos = getPosition(cardIndex++);
    const qCardId = `card-cell-q-${now}-${qIdx}`;

    cards.push({
      id: qCardId,
      type: 'action',
      customTypeLabel: 'Pregunta de Diálogo',
      tags: ['Pregunta de Diálogo'],
      title: `Pregunta ${qIdx + 1}`,
      content: `${q}\n\n💬 Respuestas y aportes del grupo:\n• `,
      color: '#10B981', // Emerald
      x: pos.x,
      y: pos.y,
      width: 320,
      zIndex: cardIndex + 2,
      createdAt: now + cardIndex,
    });

    // Link to the nearest scripture card if available
    const correspondingScriptureCardId =
      scriptureCardIds[Math.min(qIdx, scriptureCardIds.length - 1)];
    if (correspondingScriptureCardId) {
      links.push({
        id: `link-cell-q-${now}-${qIdx}`,
        toCardId: qCardId,
        label: `Pregunta ${qIdx + 1}`,
        color: '#10B981',
      });
    }
  });

  // 5.5 Add Final Prayer & Community Request Card
  const posPrayer = getPosition(cardIndex++);
  cards.push({
    id: `card-cell-prayer-${now}`,
    type: 'central',
    customTypeLabel: 'Motivos de Oración',
    tags: ['Motivos de Oración'],
    title: 'Peticiones y Oración en Célula',
    content: `🙏 Peticiones de los miembros de la célula:\n• \n• \n\n🕊️ Compromiso semanal: Orar unos por otros y compartir con el grupo de WhatsApp.`,
    color: '#D97706', // Amber
    x: posPrayer.x,
    y: posPrayer.y,
    width: 320,
    zIndex: cardIndex + 2,
    createdAt: now + cardIndex,
  });

  return {
    lessonTitle: detectedTitle,
    fullText: clean,
    fileName,
    icebreaker: icebreaker || undefined,
    detectedScriptures,
    detectedQuestions,
    cards,
    links,
  };
}

/**
 * Returns a rich authentic demonstration lesson so the user can test the entire workflow instantly.
 */
export function getSampleCellLesson(): ParsedCellLesson {
  const sampleText = `CÉLULA DE ESTUDIO BÍBLICO Y COMUNIÓN
TEMA: LA FE QUE VENCE EN MEDIO DE LA PRUEBA
Pasajes base: Santiago 1:2-5, Mateo 8:23-27, Romanos 8:28

1. BIENVENIDA Y ROMPEHIELO (15 min):
Rompehielo: Si tuvieras que describir tu semana en el clima de un día, ¿fue una semana soleada, nublada, o con tormenta? ¿Por qué?

2. INTRODUCCIÓN Y LECTURA DE LA PALABRA (20 min):
Todos atravesamos temporadas difíciles. Muchas veces nos preguntamos por qué Dios permite ciertas dificultades en nuestra vida. El apóstol Santiago nos enseña en Santiago 1:2-4 que debemos considerar como sumo gozo cuando nos hallemos en diversas pruebas, sabiendo que la prueba de nuestra fe produce paciencia.
Asimismo, en Mateo 8:23-27 vemos a los discípulos en la barca en medio de una tempestad repentina. Mientras Jesús dormía, ellos se llenaron de pánico y dijeron: «¡Señor, sálvanos, que perecemos!». Jesús se levantó y les dijo: «¿Por qué teméis, hombres de poca fe?». Y reprendió a los vientos y al mar, y se hizo grande bonanza.
Por último, el apóstol Pablo nos recuerda en Romanos 8:28 que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.

3. PREGUNTAS DE DIÁLOGO Y REFLEXIÓN (25 min):
¿Cuál suele ser nuestra primera reacción instintiva cuando llega una prueba inesperada a nuestra vida o familia?
¿Por qué crees que Jesús cuestionó el miedo de los discípulos si la tormenta era real y peligrosa?
¿Qué significa en la práctica cotidiana que "todas las cosas nos ayudan a bien"? ¿Puedes recordar alguna situación difícil del pasado que Dios usó para bien?
¿En qué área de tu vida necesitas hoy pedirle a Dios la paz y la sabiduría que promete Santiago 1:5?

4. DESAFÍO SEMANAL Y MINISTRACIÓN (15 min):
Esta semana, cada vez que enfrentes una preocupación, en lugar de angustiarte en silencio, haz una pausa de 1 minuto y di en voz alta: "Jesús está en mi barca".

5. PETICIONES Y MOTIVOS DE ORACIÓN DE LA CÉLULA:
- Salud y fortaleza en las familias de la célula.
- Empleo y provisión para los hermanos que están en búsqueda laboral.
- Salvación de amigos y vecinos invitados.`;

  return parseCellLesson(sampleText, 'Leccion_Celula_La_Fe_Vence.pdf');
}

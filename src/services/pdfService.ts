import * as pdfjsLib from 'pdfjs-dist';
import { FloatingCard, ConnectionLink } from '../types';
import { getBibleVerses } from '../data/bibleData';
import { getOrFetchChapterVerses, LOCAL_TO_API_BOOK_MAP } from './bibleService';

// Configure pdfjs worker
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Could not set pdfjs workerSrc:', e);
  }
}

export interface ParsedCellLesson {
  lessonTitle: string;
  lessonNumber?: string;
  readingScripture?: string;
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
 * Normalizes broken PDF font ligatures (common in Word/Canva Spanish PDFs).
 */
export function fixPdfLigatures(str: string): string {
  return str
    .replace(/\u019f/g, 'ti') // Ɵ -> ti (cristianos, prácticas, tinieblas, etc.)
    .replace(/\u01a1/g, 'tí') // ơ -> tí (Vestíos)
    .replace(/\u0130/g, 'fl') // İ -> fl (reflejar)
    .replace(/\ufb01/g, 'fi') // ﬁ -> fi
    .replace(/\ufb02/g, 'fl'); // ﬂ -> fl
}

/**
 * Extracts plain text from a PDF file using pdfjs-dist.
 * Reconstructs visual lines by Y-coordinate and preserves paragraph breaks ("punto y aparte").
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const allParagraphs: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();

    interface LineBucket {
      y: number;
      items: Array<{ str: string; x: number; endX: number }>;
    }

    const lines: LineBucket[] = [];

    for (const rawItem of textContent.items) {
      if (!('str' in rawItem)) continue;
      const item = rawItem as any;
      const str = fixPdfLigatures(item.str || '');
      if (str.length === 0) continue;

      const x: number = item.transform ? item.transform[4] : 0;
      const y: number = item.transform ? item.transform[5] : 0;
      const w: number = item.width || 0;

      // Skip tiny bottom-page church footer logos if clearly separated at bottom margin
      let line = lines.find((l) => Math.abs(l.y - y) <= 3);
      if (!line) {
        line = { y, items: [] };
        lines.push(line);
      }
      line.items.push({ str, x, endX: x + w });
    }

    // Sort top-to-bottom
    lines.sort((a, b) => b.y - a.y);

    const builtLines = lines
      .map((l) => {
        l.items.sort((a, b) => a.x - b.x);
        let text = '';
        let prevEnd: number | null = null;
        for (const it of l.items) {
          if (
            prevEnd !== null &&
            it.x - prevEnd > 1.5 &&
            !text.endsWith(' ') &&
            !it.str.startsWith(' ')
          ) {
            text += ' ';
          }
          text += it.str;
          prevEnd = it.endX;
        }
        return {
          y: l.y,
          startX: l.items[0].x,
          endX: Math.max(...l.items.map((it) => it.endX)),
          text: text.trim(),
        };
      })
      .filter((l) => l.text.length > 0);

    if (builtLines.length === 0) continue;

    // Right margin of wrapped lines on this page
    const maxEndX = Math.max(...builtLines.map((l) => l.endX), 450);

    let currentPara = '';
    for (let idx = 0; idx < builtLines.length; idx++) {
      const curr = builtLines[idx];
      if (!currentPara) {
        currentPara = curr.text;
        continue;
      }

      const prev = builtLines[idx - 1];
      const dy = prev.y - curr.y;

      const hasBlankLineGap = dy > 16;
      const endsWithSentencePunct =
        /[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9»”"\)]\s*[\.\?\!]$/.test(prev.text) &&
        !/(?:^|\s)(?:Sr|Sra|Dr|Dra|etc|vs|v|cap|núm|nro|aprox)\.$/i.test(prev.text);
      const isShortLinePuntoYAparte =
        prev.endX < maxEndX - 35 && /[\.\?\!\:\»\”\"\_\)]$/.test(prev.text);
      const isNewStructuralBlock =
        /^(?:\d+[\.\)]\s+|¿|LECTURA:|INTRODUCCIÓN:|ROMPEHIELO|PREGUNTAS?|PARA\s+(?:HACER|ORAR):|EN\s+RES[UÚ]MEN:|Salmo|2\s+Timoteo|Proverbios|Mateo|Hebreos|1\s+Pedro|_{3,})/i.test(
          curr.text
        );
      const isPrevStandaloneLine =
        /^(?:LECCIÓN|LECTURA:|¿.+\?$|\d+[\.\)]\s+|PARA\s+|EN\s+RES[UÚ]MEN:|_+)/i.test(prev.text) &&
        prev.endX < maxEndX - 35;

      if (
        hasBlankLineGap ||
        endsWithSentencePunct ||
        isShortLinePuntoYAparte ||
        isNewStructuralBlock ||
        isPrevStandaloneLine
      ) {
        allParagraphs.push(currentPara.trim());
        currentPara = curr.text;
      } else {
        currentPara += ' ' + curr.text;
      }
    }

    if (currentPara.trim()) {
      allParagraphs.push(currentPara.trim());
    }
  }

  return allParagraphs.join('\n\n').trim();
}

// Known Spanish Bible book names and patterns for citation detection
const BOOK_MATCH_PATTERNS = [
  { names: ['1 corintios', '1 cor', '1 co', '1ra corintios', '1ª corintios'], id: '1co', label: '1 Corintios', numbered: true },
  { names: ['2 corintios', '2 cor', '2 co', '2da corintios', '2ª corintios'], id: '2co', label: '2 Corintios', numbered: true },
  { names: ['1 tesalonicenses', '1 tes', '1 ts'], id: '1ts', label: '1 Tesalonicenses', numbered: true },
  { names: ['2 tesalonicenses', '2 tes', '2 ts'], id: '2ts', label: '2 Tesalonicenses', numbered: true },
  { names: ['1 timoteo', '1 tim', '1 ti'], id: '1ti', label: '1 Timoteo', numbered: true },
  { names: ['2 timoteo', '2 tim', '2 ti'], id: '2ti', label: '2 Timoteo', numbered: true },
  { names: ['1 pedro', '1 pe', '1 p'], id: '1pe', label: '1 Pedro', numbered: true },
  { names: ['2 pedro', '2 pe', '2 p'], id: '2pe', label: '2 Pedro', numbered: true },
  { names: ['1 juan', '1 jn'], id: '1jn', label: '1 Juan', numbered: true },
  { names: ['2 juan', '2 jn'], id: '2jn', label: '2 Juan', numbered: true },
  { names: ['3 juan', '3 jn'], id: '3jn', label: '3 Juan', numbered: true },
  { names: ['1 samuel', '1 sam', '1 s'], id: '1sa', label: '1 Samuel', numbered: true },
  { names: ['2 samuel', '2 sam', '2 s'], id: '2sa', label: '2 Samuel', numbered: true },
  { names: ['1 reyes', '1 r'], id: '1re', label: '1 Reyes', numbered: true },
  { names: ['2 reyes', '2 r'], id: '2re', label: '2 Reyes', numbered: true },
  { names: ['1 crónicas', '1 cronicas', '1 cr'], id: '1cr', label: '1 Crónicas', numbered: true },
  { names: ['2 crónicas', '2 cronicas', '2 cr'], id: '2cr', label: '2 Crónicas', numbered: true },
  { names: ['mateo', 'mt', 'san mateo'], id: 'mat', label: 'Mateo' },
  { names: ['marcos', 'mr', 'mc', 'san marcos'], id: 'mar', label: 'Marcos' },
  { names: ['lucas', 'lc', 'san lucas'], id: 'luc', label: 'Lucas' },
  { names: ['juan', 'jn', 'san juan'], id: 'jua', label: 'Juan' },
  { names: ['hechos', 'hch', 'hechos de los apostoles'], id: 'hch', label: 'Hechos' },
  { names: ['romanos', 'ro', 'rom'], id: 'rom', label: 'Romanos' },
  { names: ['gálatas', 'galatas', 'gál', 'gal'], id: 'gal', label: 'Gálatas' },
  { names: ['efesios', 'ef', 'efe'], id: 'efe', label: 'Efesios' },
  { names: ['filipenses', 'fil', 'flp'], id: 'fil', label: 'Filipenses' },
  { names: ['colosenses', 'col'], id: 'col', label: 'Colosenses' },
  { names: ['tito', 'tit'], id: 'tit', label: 'Tito' },
  { names: ['filemón', 'filemon', 'flm'], id: 'flm', label: 'Filemón' },
  { names: ['hebreos', 'he', 'heb'], id: 'heb', label: 'Hebreos' },
  { names: ['santiago', 'stg', 'sant'], id: 'stg', label: 'Santiago' },
  { names: ['judas', 'jud'], id: 'jud', label: 'Judas' },
  { names: ['apocalipsis', 'ap', 'apoc'], id: 'apo', label: 'Apocalipsis' },
  { names: ['génesis', 'genesis', 'gn', 'gen'], id: 'gen', label: 'Génesis' },
  { names: ['éxodo', 'exodo', 'éx', 'ex'], id: 'exo', label: 'Éxodo' },
  { names: ['levítico', 'levitico', 'lv', 'lev'], id: 'lev', label: 'Levítico' },
  { names: ['números', 'numeros', 'nm', 'num'], id: 'num', label: 'Números' },
  { names: ['deuteronomio', 'dt', 'deu'], id: 'deu', label: 'Deuteronomio' },
  { names: ['josué', 'josue', 'jos'], id: 'jos', label: 'Josué' },
  { names: ['jueces', 'jue'], id: 'jue', label: 'Jueces' },
  { names: ['rut'], id: 'rut', label: 'Rut' },
  { names: ['salmos', 'salmo', 'sal', 'ps'], id: 'sal', label: 'Salmos' },
  { names: ['proverbios', 'pr', 'prov'], id: 'pro', label: 'Proverbios' },
  { names: ['eclesiastés', 'eclesiastes', 'ec', 'ecl'], id: 'ecl', label: 'Eclesiastés' },
  { names: ['isaías', 'isaias', 'is'], id: 'isa', label: 'Isaías' },
  { names: ['jeremías', 'jeremias', 'jer'], id: 'jer', label: 'Jeremías' },
  { names: ['ezequiel', 'ez', 'eze'], id: 'eze', label: 'Ezequiel' },
  { names: ['daniel', 'dn', 'dan'], id: 'dan', label: 'Daniel' },
];

/**
 * Fetches full authentic verse text for a chapter, avoiding synthetic fallback templates.
 */
async function fetchAuthenticChapter(bookId: string, chapter: number): Promise<Array<{ verse: number; text: string }>> {
  try {
    const verses = await getOrFetchChapterVerses(bookId, chapter, 'RVR1960');
    if (
      verses &&
      verses.length > 0 &&
      !verses[0].text.startsWith('Versión ')
    ) {
      return verses;
    }
  } catch {
    // Fall through to direct API fetch
  }

  // Direct fetch from HelloAO Spanish Bible API if getOrFetchChapterVerses failed or rejected a verse gap
  const apiBookCode = LOCAL_TO_API_BOOK_MAP[bookId.toLowerCase()] || bookId.toUpperCase();
  for (const apiVer of ['spa_rvg', 'spa_r09']) {
    try {
      const resp = await fetch(`https://bible.helloao.org/api/${apiVer}/${apiBookCode}/${chapter}.simple.json`);
      if (!resp.ok) continue;
      const json = await resp.json();
      const content = json?.chapter?.content ?? [];
      const extracted = content
        .filter((e: any) => e?.type === 'verse' && typeof e?.number === 'number' && typeof e?.text === 'string')
        .map((e: any) => ({ verse: e.number as number, text: (e.text as string).trim() }));
      if (extracted.length > 0) return extracted;
    } catch {
      // Try next version
    }
  }

  // Last resort: check local curated/scripture database (never the fake 5-verse fallback template)
  const local = getBibleVerses(bookId, chapter, 'RVR1960');
  if (local && local.length > 0 && !local[0].text.startsWith('Versión ')) {
    return local;
  }

  return [];
}

/**
 * Resolves a human scripture reference string (e.g., "Efesios 2:8-9" or "Salmo 119:11")
 * into its full verse text. Exported so App.tsx can also hydrate saved cards.
 */
export async function fetchVerseRangeText(verseRef: string): Promise<string | null> {
  const refClean = verseRef.trim();
  for (const bp of BOOK_MATCH_PATTERNS) {
    for (const name of bp.names) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const m = refClean.match(new RegExp(`^${escaped}\\s+(\\d+)(?::(\\d+)(?:[-–—](\\d+))?)?$`, 'i'));
      if (m) {
        const chapter = parseInt(m[1], 10);
        const verseStart = m[2] ? parseInt(m[2], 10) : undefined;
        const verseEnd = m[3] ? parseInt(m[3], 10) : undefined;
        const verses = await fetchAuthenticChapter(bp.id, chapter);
        if (verses.length === 0) return null;

        if (verseStart) {
          const endV = verseEnd || verseStart;
          const target = verses.filter((v) => v.verse >= verseStart && v.verse <= endV);
          if (target.length > 0) {
            return target.map((v) => `${v.verse}. ${v.text}`).join(' ');
          }
        }
        return verses.slice(0, 3).map((v) => `${v.verse}. ${v.text}`).join(' ');
      }
    }
  }
  return null;
}

/**
 * Analyzes the extracted cell lesson text:
 * 1. Finds the title and lesson number
 * 2. Detects explicit "LECTURA:" passage
 * 3. Extracts biblical references in exact order of appearance and fetches full verse texts
 * 4. Extracts study/dialogue questions
 * 5. Extracts icebreaker/rompehielo
 * 6. Generates cards and visual connection links
 */
export async function parseCellLesson(text: string, fileName?: string): Promise<ParsedCellLesson> {
  const clean = fixPdfLigatures(text).trim();
  const lines = clean.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Detect Lesson Number & Title
  let detectedTitle = '';
  let detectedLessonNumber = '';

  for (const line of lines.slice(0, 12)) {
    const numMatch = line.match(/^(?:lección|leccion|estudio|célula|celula|guía|guia|nº|n°|#)?\s*(\d{1,3})\s*[:\.\-–]\s*(.+)/i);
    if (numMatch) {
      detectedLessonNumber = `LECCIÓN ${numMatch[1]}`;
      let candidateTitle = numMatch[2].trim();
      candidateTitle = candidateTitle.replace(/(?:lecturas?|pasajes?|textos?|citas?)[\s:]+.*$/i, '').trim();
      candidateTitle = candidateTitle.replace(/^["'“«]+|["'”»]+$/g, '').trim();
      if (candidateTitle.length > 2) {
        detectedTitle = candidateTitle;
        break;
      }
    }

    const numOnlyMatch = line.match(/^(?:lección|leccion|estudio)\s+(\d{1,3})$/i);
    if (numOnlyMatch && !detectedLessonNumber) {
      detectedLessonNumber = `LECCIÓN ${numOnlyMatch[1]}`;
    }

    const topicMatch = line.match(/(?:tema|título|titulo|estudio)[:\s\-]+(.+)/i);
    if (topicMatch) {
      let candidateTitle = topicMatch[1].trim();
      candidateTitle = candidateTitle.replace(/(?:lecturas?|pasajes?|textos?|citas?)[\s:]+.*$/i, '').trim();
      candidateTitle = candidateTitle.replace(/^["'“«]+|["'”»]+$/g, '').trim();
      if (candidateTitle.length > 2) {
        detectedTitle = candidateTitle;
        break;
      }
    }
  }

  if (!detectedTitle && lines.length > 0) {
    let candidate = lines[0];
    const leadingNumMatch = candidate.match(/^(\d{1,3})\s*[:\.\-–]\s*(.+)/);
    if (leadingNumMatch) {
      if (!detectedLessonNumber) detectedLessonNumber = `LECCIÓN ${leadingNumMatch[1]}`;
      candidate = leadingNumMatch[2];
    }
    candidate = candidate.replace(/(?:lecturas?|pasajes?|textos?|citas?)[\s:]+.*$/i, '').trim();
    candidate = candidate.replace(/^["'“«]+|["'”»]+$/g, '').trim();
    detectedTitle = candidate.length <= 90 ? candidate : candidate.substring(0, 85) + '...';
  }

  if (!detectedTitle) {
    detectedTitle = fileName ? fileName.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ') : 'Lección de Célula Semanal';
  }

  // 2. Detect "LECTURA:" passage (main scripture)
  let readingScripture = '';
  const lecturaMatch = clean.match(
    /(?:lecturas?|pasajes?\s+principal(?:es)?|cita(?:s)?\s+principal(?:es)?)[\s:]+([^\r\n]+?)(?=\r?\n|introducción|introduccion|pregunta|rompehielo|1\.|2\.|3\.|4\.|5\.|$)/i
  );
  if (lecturaMatch) {
    const rawLectura = lecturaMatch[1].trim();
    const foundLecturas: Array<{ ref: string; idx: number }> = [];
    for (const bp of BOOK_MATCH_PATTERNS) {
      for (const name of bp.names) {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\s+(\\d+)(?::(\\d+)(?:[-–—](\\d+))?)?\\b`, 'gi');
        let m: RegExpExecArray | null;
        while ((m = regex.exec(rawLectura)) !== null) {
          if (!bp.numbered && m.index > 0 && /[1-3]\s+$/.test(rawLectura.slice(Math.max(0, m.index - 4), m.index))) {
            continue;
          }
          const chapter = parseInt(m[1], 10);
          const verseStart = m[2] ? parseInt(m[2], 10) : undefined;
          const verseEnd = m[3] ? parseInt(m[3], 10) : undefined;
          const canonical = `${bp.label} ${chapter}${verseStart ? `:${verseStart}${verseEnd ? `-${verseEnd}` : ''}` : ''}`;
          if (!foundLecturas.some((x) => x.ref === canonical)) {
            foundLecturas.push({ ref: canonical, idx: m.index });
          }
        }
      }
    }
    if (foundLecturas.length > 0) {
      foundLecturas.sort((a, b) => a.idx - b.idx);
      readingScripture = foundLecturas.map((x) => x.ref).join(', ');
    }
  }

  // 3. Detect Biblical Scriptures in exact order of appearance
  const detectedMap = new Map<
    string,
    {
      ref: string;
      bookId: string;
      chapter: number;
      verseStart?: number;
      verseEnd?: number;
      firstIndex: number;
      sampleText?: string;
    }
  >();

  for (const bp of BOOK_MATCH_PATTERNS) {
    for (const name of bp.names) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\s+(\\d+)(?::(\\d+)(?:[-–—](\\d+))?)?\\b`, 'gi');

      let m: RegExpExecArray | null;
      while ((m = regex.exec(clean)) !== null) {
        // Avoid matching "Juan 3:16" inside "1 Juan 3:16"
        if (!bp.numbered && m.index > 0 && /[1-3]\s+$/.test(clean.slice(Math.max(0, m.index - 4), m.index))) {
          continue;
        }

        const chapter = parseInt(m[1], 10);
        const verseStart = m[2] ? parseInt(m[2], 10) : undefined;
        const verseEnd = m[3] ? parseInt(m[3], 10) : undefined;

        const canonicalRef = `${bp.label} ${chapter}${
          verseStart ? `:${verseStart}${verseEnd ? `-${verseEnd}` : ''}` : ''
        }`;

        const existing = detectedMap.get(canonicalRef);
        if (!existing || m.index < existing.firstIndex) {
          detectedMap.set(canonicalRef, {
            ref: canonicalRef,
            bookId: bp.id,
            chapter,
            verseStart,
            verseEnd,
            firstIndex: existing ? Math.min(existing.firstIndex, m.index) : m.index,
          });
        }
      }
    }
  }

  const detectedScriptures = Array.from(detectedMap.values()).sort(
    (a, b) => a.firstIndex - b.firstIndex
  );

  if (!readingScripture && detectedScriptures.length > 0) {
    readingScripture = detectedScriptures[0].ref;
  }

  // Fetch all unique chapters in parallel for instant speed
  const uniqueChapters = new Map<string, Promise<Array<{ verse: number; text: string }>>>();
  for (const sc of detectedScriptures) {
    const key = `${sc.bookId}_${sc.chapter}`;
    if (!uniqueChapters.has(key)) {
      uniqueChapters.set(key, fetchAuthenticChapter(sc.bookId, sc.chapter));
    }
  }

  await Promise.all(
    detectedScriptures.map(async (sc) => {
      const verses = await uniqueChapters.get(`${sc.bookId}_${sc.chapter}`)!;
      if (verses && verses.length > 0) {
        if (sc.verseStart) {
          const endV = sc.verseEnd || sc.verseStart;
          const targetVerses = verses.filter((v) => v.verse >= sc.verseStart! && v.verse <= endV);
          if (targetVerses.length > 0) {
            sc.sampleText = targetVerses.map((v) => `${v.verse}. ${v.text}`).join(' ');
          } else {
            sc.sampleText = verses.slice(0, 3).map((v) => `${v.verse}. ${v.text}`).join(' ');
          }
        } else {
          sc.sampleText = verses.slice(0, 3).map((v) => `${v.verse}. ${v.text}`).join(' ') + '...';
        }
      }
    })
  );

  // 4. Detect Questions
  const detectedQuestions: string[] = [];
  const seenQuestions = new Set<string>();

  const questionRegex = /¿([^?\n\r]{8,250})\?/g;
  let qm: RegExpExecArray | null;
  while ((qm = questionRegex.exec(clean)) !== null) {
    const fullQ = `¿${qm[1].trim()}?`;
    if (!seenQuestions.has(fullQ) && fullQ.length > 12) {
      seenQuestions.add(fullQ);
      detectedQuestions.push(fullQ);
    }
  }

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

  // 5. Detect Icebreaker / Rompehielo
  let icebreaker = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/(?:rompehielo|dinámica|dinamica|rompe-hielo|bienvenida|pregunta inicial)[:\s\-]+/i)) {
      const rest = line.replace(/(?:rompehielo|dinámica|dinamica|rompe-hielo|bienvenida|pregunta inicial)[:\s\-]+/i, '').trim();
      icebreaker = rest || lines[i + 1] || '';
      break;
    }
  }

  // 6. Generate Floating Cards & Visual Connection Links
  const now = Date.now();
  const cards: FloatingCard[] = [];
  const links: ConnectionLink[] = [];

  let cardIndex = 0;
  const colWidth = 350;
  const rowHeight = 310;
  const cols = 3;

  const getPosition = (idx: number) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    return {
      x: 40 + col * colWidth,
      y: 40 + row * rowHeight,
    };
  };

  // 6.1 Main Card
  const pos0 = getPosition(cardIndex++);
  const mainCardId = `card-cell-main-${now}`;
  cards.push({
    id: mainCardId,
    type: 'central',
    customTypeLabel: 'Tema de Célula',
    tags: ['Tema de Célula'],
    title: detectedTitle,
    content: `Lección semanal de célula.\n\n📖 Lectura Principal: ${readingScripture || 'Ver texto completo'}\n📖 Pasajes citados: ${
      detectedScriptures.map((s) => s.ref).join(', ') || 'Ver texto completo'
    }\n👥 Dinámica de grupo: Participación abierta y oración mutua.`,
    color: '#059669',
    x: pos0.x,
    y: pos0.y,
    width: 330,
    zIndex: cardIndex + 2,
    createdAt: now + cardIndex,
  });

  // 6.2 Icebreaker Card if found
  if (icebreaker) {
    const posIce = getPosition(cardIndex++);
    cards.push({
      id: `card-cell-ice-${now}`,
      type: 'illustration',
      customTypeLabel: 'Rompehielo',
      tags: ['Rompehielo'],
      title: 'Rompehielo / Conexión Inicial',
      content: `${icebreaker}\n\n⏱️ Tiempo sugerido: 10-15 minutos para que todos participen.`,
      color: '#EC4899',
      x: posIce.x,
      y: posIce.y,
      width: 320,
      zIndex: cardIndex + 2,
      createdAt: now + cardIndex,
    });
  }

  // 6.3 Biblical Scripture Cards with FULL VERSE TEXT
  const scriptureCardIds: string[] = [];
  detectedScriptures.forEach((sc, sIdx) => {
    const pos = getPosition(cardIndex++);
    const cardId = `card-cell-scripture-${now}-${sIdx}`;
    scriptureCardIds.push(cardId);

    const fullTextQuote = sc.sampleText
      ? `«${sc.sampleText}»`
      : `Abrir en la Biblia: ${sc.ref} (conéctate a internet para descargar el texto completo automáticamente).`;

    cards.push({
      id: cardId,
      type: 'point',
      customTypeLabel: 'Texto Bíblico',
      tags: ['Texto Bíblico'],
      title: `Cita Bíblica: ${sc.ref}`,
      content: fullTextQuote,
      color: '#3B82F6',
      linkedVerseRef: sc.ref,
      linkedQuote: sc.sampleText,
      x: pos.x,
      y: pos.y,
      width: 320,
      zIndex: cardIndex + 2,
      createdAt: now + cardIndex,
    });

    links.push({
      id: `link-cell-sc-${now}-${sIdx}`,
      fromVerseRef: sc.ref,
      toCardId: cardId,
      label: sc.ref,
      color: '#3B82F6',
    });
  });

  // 6.4 Dialogue Question Cards with direct question title
  detectedQuestions.forEach((q, qIdx) => {
    const pos = getPosition(cardIndex++);
    const qCardId = `card-cell-q-${now}-${qIdx}`;

    cards.push({
      id: qCardId,
      type: 'action',
      customTypeLabel: 'Pregunta de Diálogo',
      tags: ['Pregunta de Diálogo'],
      title: q,
      content: `💬 Respuestas y aportes del grupo:\n• `,
      color: '#10B981',
      x: pos.x,
      y: pos.y,
      width: 320,
      zIndex: cardIndex + 2,
      createdAt: now + cardIndex,
    });

    const correspondingScriptureCardId =
      scriptureCardIds[Math.min(qIdx, scriptureCardIds.length - 1)];
    if (correspondingScriptureCardId) {
      links.push({
        id: `link-cell-q-${now}-${qIdx}`,
        toCardId: qCardId,
        label: q.length > 25 ? q.substring(0, 22) + '...' : q,
        color: '#10B981',
      });
    }
  });

  // 6.5 Prayer & Peticiones Card
  const posPrayer = getPosition(cardIndex++);
  cards.push({
    id: `card-cell-prayer-${now}`,
    type: 'central',
    customTypeLabel: 'Motivos de Oración',
    tags: ['Motivos de Oración'],
    title: 'Peticiones y Oración en Célula',
    content: `🙏 Peticiones de los miembros de la célula:\n• \n• \n\n🕊️ Compromiso semanal: Orar unos por otros y compartir con el grupo de WhatsApp.`,
    color: '#D97706',
    x: posPrayer.x,
    y: posPrayer.y,
    width: 320,
    zIndex: cardIndex + 2,
    createdAt: now + cardIndex,
  });

  return {
    lessonTitle: detectedTitle,
    lessonNumber: detectedLessonNumber || undefined,
    readingScripture: readingScripture || undefined,
    fullText: clean,
    fileName,
    icebreaker: icebreaker || undefined,
    detectedScriptures: detectedScriptures.map(({ firstIndex: _unused, ...rest }) => rest),
    detectedQuestions,
    cards,
    links,
  };
}

/**
 * Returns a rich authentic demonstration lesson so the user can test the entire workflow instantly.
 */
export async function getSampleCellLesson(): Promise<ParsedCellLesson> {
  const sampleText = `LECCIÓN 8: ¿Qué DIFERENCIA hay?

LECTURA: Romanos 13:12-14

INTRODUCCIÓN: ¿Hay alguna diferencia entre vivir con Cristo y vivir sin Él? Podemos asistir a la iglesia, decir que somos cristianos, tener ministerios y conocer la Biblia, pero ¿nuestra manera de vivir demuestra que pertenecemos a Cristo?

La salvación no se obtiene por nuestras buenas obras, sino por gracia, mediante la fe (Efesios 2:8-9). Sin embargo, esa salvación produce una transformación que debe hacerse visible.

En el pasaje del día de hoy, Pablo nos enseña que quienes pertenecen a Cristo deben abandonar las prácticas de las tinieblas y comenzar a vivir de una manera que refleje a Jesús.

1. Desechar las obras de las tinieblas: abandonar lo que desagrada a Dios (v.12)

Pablo utiliza la imagen de la noche y el día para mostrar que nuestra vida ya no debe estar dominada por el pecado. Así como alguien tira a la basura algo que es dañino o que ya no sirve, el creyente debe abandonar las prácticas de su antigua manera de vivir.

No se trata solamente de eliminar los pecados más evidentes. También debemos desechar actitudes como el orgullo, la envidia, los celos, las peleas y el resentimiento.

No podemos decir que caminamos con Cristo mientras seguimos aferrados voluntariamente a aquello de lo que Él vino a rescatarnos (Efesios 4:22-24).

Leamos Romanos 13:13 y Colosenses 3:5-8. De todas estas actitudes/prácticas “terrenales” o “de las tinieblas” nombradas, ¿cuáles pueden llegar a pasar inadvertidas entre los cristianos?

¿Hay alguna actitud que he normalizado en mi vida, aunque sé que no agrada a Dios?

2. Vestirse con las armas de la luz: reflejar el carácter de Cristo

Colosenses 3:12-14 expresa que debemos vestirnos como escogidos de Dios, ¿qué elementos incluye esa vestimenta?

3. No volver a alimentar aquello que decidimos abandonar

«Y no proveáis para los deseos de la carne» (Romanos 13:14).

¿Qué hábitos o situaciones pueden acercarnos al pecado?

¿Qué hacer para prevenir el pecado?
Salmo 119:11
2 Timoteo 2:22
Proverbios 4:23
Mateo 26:41
Hebreos 10:24-25

¿Qué diferencia hay en mi vida?
1 Pedro 1:14-16

PARA HACER: Identificá una actitud que necesitás desechar y una virtud de Cristo que necesitás cultivar.

PARA ORAR: Señor, gracias porque por tu gracia nos has dado una nueva vida en Cristo. Amén.`;

  return await parseCellLesson(sampleText, 'Lección_8.pdf');
}

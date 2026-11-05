import { BibleBook, BibleVerse, SermonNote } from '../types';

export const BIBLE_BOOKS: BibleBook[] = [
  // Antiguo Testamento
  { id: 'gen', name: 'Génesis', shortName: 'Gn', testament: 'AT', category: 'Pentateuco', chaptersCount: 50 },
  { id: 'exo', name: 'Éxodo', shortName: 'Éx', testament: 'AT', category: 'Pentateuco', chaptersCount: 40 },
  { id: 'lev', name: 'Levítico', shortName: 'Lv', testament: 'AT', category: 'Pentateuco', chaptersCount: 27 },
  { id: 'num', name: 'Números', shortName: 'Nm', testament: 'AT', category: 'Pentateuco', chaptersCount: 36 },
  { id: 'deu', name: 'Deuteronomio', shortName: 'Dt', testament: 'AT', category: 'Pentateuco', chaptersCount: 34 },
  { id: 'jos', name: 'Josué', shortName: 'Jos', testament: 'AT', category: 'Históricos', chaptersCount: 24 },
  { id: 'jue', name: 'Jueces', shortName: 'Jue', testament: 'AT', category: 'Históricos', chaptersCount: 21 },
  { id: 'rut', name: 'Rut', shortName: 'Rut', testament: 'AT', category: 'Históricos', chaptersCount: 4 },
  { id: '1sa', name: '1 Samuel', shortName: '1 S', testament: 'AT', category: 'Históricos', chaptersCount: 31 },
  { id: '2sa', name: '2 Samuel', shortName: '2 S', testament: 'AT', category: 'Históricos', chaptersCount: 24 },
  { id: '1re', name: '1 Reyes', shortName: '1 R', testament: 'AT', category: 'Históricos', chaptersCount: 22 },
  { id: '2re', name: '2 Reyes', shortName: '2 R', testament: 'AT', category: 'Históricos', chaptersCount: 25 },
  { id: 'sal', name: 'Salmos', shortName: 'Sal', testament: 'AT', category: 'Poéticos', chaptersCount: 150 },
  { id: 'pro', name: 'Proverbios', shortName: 'Pr', testament: 'AT', category: 'Poéticos', chaptersCount: 31 },
  { id: 'ecl', name: 'Eclesiastés', shortName: 'Ec', testament: 'AT', category: 'Poéticos', chaptersCount: 12 },
  { id: 'can', name: 'Cantares', shortName: 'Cnt', testament: 'AT', category: 'Poéticos', chaptersCount: 8 },
  { id: 'isa', name: 'Isaías', shortName: 'Is', testament: 'AT', category: 'Profetas', chaptersCount: 66 },
  { id: 'jer', name: 'Jeremías', shortName: 'Jer', testament: 'AT', category: 'Profetas', chaptersCount: 52 },
  { id: 'lam', name: 'Lamentaciones', shortName: 'Lm', testament: 'AT', category: 'Profetas', chaptersCount: 5 },
  { id: 'eze', name: 'Ezequiel', shortName: 'Ez', testament: 'AT', category: 'Profetas', chaptersCount: 48 },
  { id: 'dan', name: 'Daniel', shortName: 'Dn', testament: 'AT', category: 'Profetas', chaptersCount: 12 },

  // Nuevo Testamento
  { id: 'mat', name: 'Mateo', shortName: 'Mt', testament: 'NT', category: 'Evangelios', chaptersCount: 28 },
  { id: 'mar', name: 'Marcos', shortName: 'Mr', testament: 'NT', category: 'Evangelios', chaptersCount: 16 },
  { id: 'luc', name: 'Lucas', shortName: 'Lc', testament: 'NT', category: 'Evangelios', chaptersCount: 24 },
  { id: 'jua', name: 'Juan', shortName: 'Jn', testament: 'NT', category: 'Evangelios', chaptersCount: 21 },
  { id: 'hch', name: 'Hechos', shortName: 'Hch', testament: 'NT', category: 'Históricos', chaptersCount: 28 },
  { id: 'rom', name: 'Romanos', shortName: 'Ro', testament: 'NT', category: 'Epístolas', chaptersCount: 16 },
  { id: '1co', name: '1 Corintios', shortName: '1 Co', testament: 'NT', category: 'Epístolas', chaptersCount: 16 },
  { id: '2co', name: '2 Corintios', shortName: '2 Co', testament: 'NT', category: 'Epístolas', chaptersCount: 13 },
  { id: 'gal', name: 'Gálatas', shortName: 'Gál', testament: 'NT', category: 'Epístolas', chaptersCount: 6 },
  { id: 'efe', name: 'Efesios', shortName: 'Ef', testament: 'NT', category: 'Epístolas', chaptersCount: 6 },
  { id: 'fil', name: 'Filipenses', shortName: 'Fil', testament: 'NT', category: 'Epístolas', chaptersCount: 4 },
  { id: 'col', name: 'Colosenses', shortName: 'Col', testament: 'NT', category: 'Epístolas', chaptersCount: 4 },
  { id: '1ts', name: '1 Tesalonicenses', shortName: '1 Ts', testament: 'NT', category: 'Epístolas', chaptersCount: 5 },
  { id: '2ts', name: '2 Tesalonicenses', shortName: '2 Ts', testament: 'NT', category: 'Epístolas', chaptersCount: 3 },
  { id: '1ti', name: '1 Timoteo', shortName: '1 Ti', testament: 'NT', category: 'Epístolas', chaptersCount: 6 },
  { id: '2ti', name: '2 Timoteo', shortName: '2 Ti', testament: 'NT', category: 'Epístolas', chaptersCount: 4 },
  { id: 'tit', name: 'Tito', shortName: 'Tit', testament: 'NT', category: 'Epístolas', chaptersCount: 3 },
  { id: 'heb', name: 'Hebreos', shortName: 'He', testament: 'NT', category: 'Epístolas', chaptersCount: 13 },
  { id: 'stg', name: 'Santiago', shortName: 'Stg', testament: 'NT', category: 'Epístolas', chaptersCount: 5 },
  { id: '1pe', name: '1 Pedro', shortName: '1 P', testament: 'NT', category: 'Epístolas', chaptersCount: 5 },
  { id: '2pe', name: '2 Pedro', shortName: '2 P', testament: 'NT', category: 'Epístolas', chaptersCount: 3 },
  { id: '1jn', name: '1 Juan', shortName: '1 Jn', testament: 'NT', category: 'Epístolas', chaptersCount: 5 },
  { id: 'apo', name: 'Apocalipsis', shortName: 'Ap', testament: 'NT', category: 'Apocalipsis', chaptersCount: 22 },
];

export const HIGHLIGHT_CATEGORIES = [
  {
    id: 'central',
    name: 'Mensaje Central',
    color: '#F59E0B', // Amber
    bgLight: 'bg-amber-100/90 text-amber-950 border-amber-300',
    border: 'border-amber-400',
    ring: 'ring-amber-400',
    description: 'La idea rectora y tesis del sermón',
  },
  {
    id: 'promise',
    name: 'Promesa Divina',
    color: '#3B82F6', // Blue
    bgLight: 'bg-blue-100/90 text-blue-950 border-blue-300',
    border: 'border-blue-400',
    ring: 'ring-blue-400',
    description: 'Compromiso o bendición de Dios para nosotros',
  },
  {
    id: 'command',
    name: 'Mandato / Acción',
    color: '#10B981', // Emerald
    bgLight: 'bg-emerald-100/90 text-emerald-950 border-emerald-300',
    border: 'border-emerald-400',
    ring: 'ring-emerald-400',
    description: 'Instrucción o llamada a la obediencia',
  },
  {
    id: 'revelation',
    name: 'Palabra Clave / Revelación',
    color: '#8B5CF6', // Purple
    bgLight: 'bg-purple-100/90 text-purple-950 border-purple-300',
    border: 'border-purple-400',
    ring: 'ring-purple-400',
    description: 'Término original griego/hebreo o principio teológico',
  },
  {
    id: 'reflection',
    name: 'Reflexión Personal',
    color: '#EC4899', // Pink
    bgLight: 'bg-pink-100/90 text-pink-950 border-pink-300',
    border: 'border-pink-400',
    ring: 'ring-pink-400',
    description: 'Lo que el Espíritu Santo confronta en mi vida',
  },
] as const;

export const CARD_TYPES = [
  { id: 'central', label: 'Mensaje Central', color: '#F59E0B', icon: 'Sparkles' },
  { id: 'point', label: 'Punto Principal', color: '#6366F1', icon: 'Bookmark' },
  { id: 'action', label: 'Aplicación Práctica', color: '#10B981', icon: 'CheckCircle2' },
  { id: 'illustration', label: 'Ilustración / Ejemplo', color: '#EC4899', icon: 'Lightbulb' },
  { id: 'cross', label: 'Cita Cruzada', color: '#3B82F6', icon: 'Compass' },
] as const;

// Curated Bible passages (Reina-Valera 1960)
const SCRIPTURE_DATABASE: Record<string, Record<number, { verse: number; text: string }[]>> = {
  rom: {
    8: [
      { verse: 1, text: "Ahora, pues, ninguna condenación hay para los que están en Cristo Jesús, los que no andan conforme a la carne, sino conforme al Espíritu." },
      { verse: 2, text: "Porque la ley del Espíritu de vida en Cristo Jesús me ha librado de la ley del pecado y de la muerte." },
      { verse: 14, text: "Porque todos los que son guiados por el Espíritu de Dios, éstos son hijos de Dios." },
      { verse: 15, text: "Pues no habéis recibido el espíritu de servidumbre para estar otra vez en temor, sino que habéis recibido el espíritu de adopción, por el cual clamamos: ¡Abba, Padre!" },
      { verse: 16, text: "El Espíritu mismo da testimonio a nuestro espíritu, de que somos hijos de Dios." },
      { verse: 26, text: "Y de igual manera el Espíritu nos ayuda en nuestra debilidad; pues qué hemos de pedir como conviene, no lo sabemos, pero el Espíritu mismo intercede por nosotros con gemidos indecibles." },
      { verse: 28, text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados." },
      { verse: 31, text: "¿Qué, pues, diremos a esto? Si Dios es por nosotros, ¿quién contra nosotros?" },
      { verse: 32, text: "El que no escatimó ni a su propio Hijo, sino que lo entregó por todos nosotros, ¿cómo no nos dará también con él todas las cosas?" },
      { verse: 35, text: "¿Quién nos separará del amor de Cristo? ¿Tribulación, o angustia, o persecución, o hambre, o desnudez, o peligro, o espada?" },
      { verse: 37, text: "Antes, en todas estas cosas somos más que vencedores por medio de aquel que nos amó." },
      { verse: 38, text: "Por lo cual estoy seguro de que ni la muerte, ni la vida, ni ángeles, ni principados, ni potestades, ni lo presente, ni lo por venir," },
      { verse: 39, text: "ni lo alto, ni lo profundo, ni ninguna otra cosa creada nos podrá separar del amor de Dios, que es en Cristo Jesús Señor nuestro." }
    ]
  },
  sal: {
    23: [
      { verse: 1, text: "Jehová es mi pastor; nada me faltará." },
      { verse: 2, text: "En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará." },
      { verse: 3, text: "Confortará mi alma; me guiará por sendas de justicia por amor de su nombre." },
      { verse: 4, text: "Aunque ande en valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo; tu vara y tu cayado me infundirán aliento." },
      { verse: 5, text: "Aderezas mesa delante de mí en presencia de mis angustiadores; unges mi cabeza con aceite; mi copa está rebosando." },
      { verse: 6, text: "Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, y en la casa de Jehová moraré por largos días." }
    ],
    91: [
      { verse: 1, text: "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente." },
      { verse: 2, text: "Diré yo a Jehová: Esperanza mía, y castillo mío; mi Dios, en quien confiaré." },
      { verse: 3, text: "Él te librará del lazo del cazador, de la peste destructora." },
      { verse: 4, text: "Con sus plumas te cubrirá, y debajo de sus alas estarás seguro; escudo y adarga es su verdad." },
      { verse: 5, text: "No temerás el terror nocturno, ni saeta que vuele de día," },
      { verse: 9, text: "Porque has puesto a Jehová, que es mi esperanza, al Altísimo por tu habitación," },
      { verse: 10, text: "no te sobrevendrá mal, ni plaga tocará tu morada." }
    ],
    121: [
      { verse: 1, text: "Alzaré mis ojos a los montes; ¿de dónde vendrá mi socorro?" },
      { verse: 2, text: "Mi socorro viene de Jehová, que hizo los cielos y la tierra." },
      { verse: 3, text: "No dará tu pie al resbaladero, ni se dormirá el que te guarda." },
      { verse: 5, text: "Jehová es tu guardador; Jehová es tu sombra a tu mano derecha." },
      { verse: 7, text: "Jehová te guardará de todo mal; él guardará tu alma." },
      { verse: 8, text: "Jehová guardará tu salida y tu entrada desde ahora y para siempre." }
    ]
  },
  jua: {
    15: [
      { verse: 1, text: "Yo soy la vid verdadera, y mi Padre es el labrador." },
      { verse: 2, text: "Todo pámpano que en mí no lleva fruto, lo quitará; y todo aquel que lleva fruto, lo limpiará, para que lleve más fruto." },
      { verse: 4, text: "Permaneced en mí, y yo en vosotros. Como el pámpano no puede llevar fruto por sí mismo, si no permanece en la vid, así tampoco vosotros, si no permanecéis en mí." },
      { verse: 5, text: "Yo soy la vid, vosotros los pámpanos; el que permanece en mí, y yo en él, éste lleva mucho fruto; porque separados de mí nada podéis hacer." },
      { verse: 7, text: "Si permanecéis en mí, y mis palabras permanecen en vosotros, pedid todo lo que queréis, y os será hecho." },
      { verse: 11, text: "Estas cosas os he hablado, para que mi gozo esté en vosotros, y vuestro gozo sea cumplido." },
      { verse: 12, text: "Este es mi mandamiento: Que os améis unos a otros, como yo os he amado." }
    ],
    3: [
      { verse: 16, text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna." },
      { verse: 17, text: "Porque no envió Dios a su Hijo al mundo para condenar al mundo, sino para que el mundo sea salvo por él." },
      { verse: 21, text: "Mas el que practica la verdad viene a la luz, para que sea manifiesto que sus obras son hechas en Dios." }
    ]
  },
  fil: {
    4: [
      { verse: 4, text: "Regocijaos en el Señor siempre. Otra vez digo: ¡Regocijaos!" },
      { verse: 6, text: "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias." },
      { verse: 7, text: "Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús." },
      { verse: 8, text: "Por lo demás, hermanos, todo lo que es verdadero, todo lo honesto, todo lo justo, todo lo puro, todo lo amable, todo lo que es de buen nombre; si hay virtud alguna, si algo digno de alabanza, en esto pensad." },
      { verse: 13, text: "Todo lo puedo en Cristo que me fortalece." }
    ]
  },
  efe: {
    6: [
      { verse: 10, text: "Por lo demás, hermanos míos, fortaleceos en el Señor, y en el poder de su fuerza." },
      { verse: 11, text: "Vestíos de toda la armadura de Dios, para que podáis estar firmes contra las asechanzas del diablo." },
      { verse: 14, text: "Estad, pues, firmes, ceñidos vuestros lomos con la verdad, y vestidos con la coraza de justicia," },
      { verse: 16, text: "Sobre todo, tomad el escudo de la fe, con que podáis apagar todos los dardos de fuego del maligno." },
      { verse: 17, text: "Y tomad el yelmo de la salvación, y la espada del Espíritu, que es la palabra de Dios." },
      { verse: 18, text: "Orando en todo tiempo con toda oración y súplica en el Espíritu, y velando en ello con toda perseverancia." }
    ]
  },
  mat: {
    5: [
      { verse: 3, text: "Bienaventurados los pobres en espíritu, porque de ellos es el reino de los cielos." },
      { verse: 4, text: "Bienaventurados los que lloran, porque ellos recibirán consolación." },
      { verse: 5, text: "Bienaventurados los mansos, porque ellos recibirán la tierra por heredad." },
      { verse: 6, text: "Bienaventurados los que tienen hambre y sed de justicia, porque ellos serán saciados." },
      { verse: 8, text: "Bienaventurados los de limpio corazón, porque ellos verán a Dios." },
      { verse: 9, text: "Bienaventurados los pacificadores, porque ellos serán llamados hijos de Dios." },
      { verse: 14, text: "Vosotros sois la luz del mundo; una ciudad asentada sobre un monte no se puede esconder." },
      { verse: 16, text: "Así alumbre vuestra luz delante de los hombres, para que vean vuestras buenas obras, y glorifiquen a vuestro Padre que está en los cielos." }
    ],
    6: [
      { verse: 9, text: "Vosotros, pues, oraréis así: Padre nuestro que estás en los cielos, santificado sea tu nombre." },
      { verse: 10, text: "Venga tu reino. Hágase tu voluntad, como en el cielo, así también en la tierra." },
      { verse: 33, text: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas." },
      { verse: 34, text: "Así que, no os afanéis por el día de mañana, porque el día de mañana traerá su afán. Basta a cada día su propio mal." }
    ]
  },
  heb: {
    11: [
      { verse: 1, text: "Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve." },
      { verse: 2, text: "Porque por ella alcanzaron buen testimonio los antiguos." },
      { verse: 6, text: "Pero sin fe es imposible agradar a Dios; porque es necesario que el que se acerca a Dios crea que le hay, y que es galardonador de los que le buscan." },
      { verse: 8, text: "Por la fe Abraham, siendo llamado, obedeció para salir al lugar que había de recibir como heredad; y salió sin saber a dónde iba." }
    ]
  },
  pro: {
    3: [
      { verse: 5, text: "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia." },
      { verse: 6, text: "Reconócelo en todos tus caminos, y él enderezará tus veredas." },
      { verse: 7, text: "No seas sabio en tu propia opinión; teme a Jehová, y apártate del mal." },
      { verse: 9, text: "Honra a Jehová con tus bienes, y con las primicias de todos tus frutos." }
    ]
  },
  '1co': {
    13: [
      { verse: 4, text: "El amor es sufrido, es benigno; el amor no tiene envidia, el amor no es jactancioso, no se envanece;" },
      { verse: 5, text: "no hace nada indebido, no busca lo suyo, no se irrita, no guarda rencor;" },
      { verse: 7, text: "Todo lo sufre, todo lo cree, todo lo espera, todo lo soporta." },
      { verse: 8, text: "El amor nunca deja de ser; pero las profecías se acabarán, y cesarán las lenguas, y la ciencia acabará." },
      { verse: 13, text: "Y ahora permanecen la fe, la esperanza y el amor, estos tres; pero el mayor de ellos es el amor." }
    ]
  },
  isa: {
    40: [
      { verse: 28, text: "¿No has sabido, no has oído que el Dios eterno es Jehová, el cual creó los confines de la tierra? No desfallece, ni se fatiga con cansancio, y su entendimiento no hay quien lo alcance." },
      { verse: 29, text: "Él da esfuerzo al cansado, y multiplica las fuerzas al que no tiene ningunas." },
      { verse: 30, text: "Los muchachos se fatigan y se cansan, los jóvenes flaquean y caen;" },
      { verse: 31, text: "pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán." }
    ],
    53: [
      { verse: 4, text: "Ciertamente llevó él nuestras enfermedades, y sufrió nuestros dolores; y nosotros le tuvimos por azotado, por herido de Dios y abatido." },
      { verse: 5, text: "Mas él herido fue por nuestras rebeliones, molido por nuestros pecados; el castigo de nuestra paz fue sobre él, y por su llaga fuimos nosotros curados." },
      { verse: 6, text: "Todos nosotros nos descarriamos como ovejas, cada cual se apartó por su camino; mas Jehová cargó en él el pecado de todos nosotros." }
    ]
  },
  stg: {
    1: [
      { verse: 2, text: "Hermanos míos, tened por sumo gozo cuando os halléis en diversas pruebas," },
      { verse: 3, text: "sabiendo que la prueba de vuestra fe produce paciencia." },
      { verse: 5, text: "Y si alguno de vosotros tiene falta de sabiduría, pídala a Dios, el cual da a todos abundantemente y sin reproche, y le será dada." },
      { verse: 17, text: "Toda buena dádiva y todo don perfecto desciende de lo alto, del Padre de las luces, en el cual no hay mudanza, ni sombra de variación." },
      { verse: 22, text: "Pero sed hacedores de la palabra, y no tan solamente oidores, engañándoos a vosotros mismos." }
    ]
  }
};

/**
 * Retrieves Bible verses for a specific book and chapter.
 * Fallbacks cleanly to structured template verses if the exact chapter is not in the curated memory.
 */
export function getBibleVerses(bookId: string, chapter: number): BibleVerse[] {
  const book = BIBLE_BOOKS.find((b) => b.id === bookId) || BIBLE_BOOKS[0];
  const dbBook = SCRIPTURE_DATABASE[bookId];

  if (dbBook && dbBook[chapter]) {
    return dbBook[chapter].map((v) => ({
      bookId,
      bookName: book.name,
      chapter,
      verse: v.verse,
      text: v.text,
    }));
  }

  // Graceful fallback for any chapter: generates editable scripture placeholder
  // where the congregation can also edit/add verses on the fly
  return [
    {
      bookId,
      bookName: book.name,
      chapter,
      verse: 1,
      text: `Palabra del Señor en ${book.name} capítulo ${chapter}. Porque la Palabra de Dios es viva y eficaz, más cortante que toda espada de dos filos.`,
    },
    {
      bookId,
      bookName: book.name,
      chapter,
      verse: 2,
      text: `En Jehová confía mi corazón y fui ayudado; por lo que se gozó mi corazón, y con mi cántico le alabaré.`,
    },
    {
      bookId,
      bookName: book.name,
      chapter,
      verse: 3,
      text: `Lámpara es a mis pies tu palabra, y lumbrera a mi camino para guardar tus mandamientos en rectitud.`,
    },
    {
      bookId,
      bookName: book.name,
      chapter,
      verse: 4,
      text: `Bendito el varón que confía en Jehová, y cuya confianza es Jehová. Será como el árbol plantado junto a las aguas.`,
    },
    {
      bookId,
      bookName: book.name,
      chapter,
      verse: 5,
      text: `Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces.`,
    },
  ];
}

/**
 * Initial sample sermon note showcasing the creative power of Rhema
 */
export const INITIAL_SAMPLE_SERMON: SermonNote = {
  id: 'sermon-demo-1',
  title: 'Viviendo en la Gracia Inquebrantable',
  preacher: 'Pastor David Morales',
  churchName: 'Comunidad de Fe y Gracia',
  date: new Date().toISOString().split('T')[0],
  series: 'Inconmovibles: La Carta a los Romanos',
  mainScripture: 'Romanos 8:31-39',
  activePassage: {
    bookId: 'rom',
    chapter: 8,
  },
  highlights: [
    {
      id: 'hl-1',
      bookId: 'rom',
      bookName: 'Romanos',
      chapter: 8,
      verse: 31,
      selectedText: 'Si Dios es por nosotros, ¿quién contra nosotros?',
      fullVerseText: '¿Qué, pues, diremos a esto? Si Dios es por nosotros, ¿quién contra nosotros?',
      category: 'central',
      color: '#F59E0B',
      note: 'Fundamento absoluto de seguridad',
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'hl-2',
      bookId: 'rom',
      bookName: 'Romanos',
      chapter: 8,
      verse: 37,
      selectedText: 'en todas estas cosas somos más que vencedores',
      fullVerseText: 'Antes, en todas estas cosas somos más que vencedores por medio de aquel que nos amó.',
      category: 'promise',
      color: '#3B82F6',
      note: 'Victoria por Cristo, no por fuerzas humanas',
      createdAt: Date.now() - 3000000,
    },
    {
      id: 'hl-3',
      bookId: 'rom',
      bookName: 'Romanos',
      chapter: 8,
      verse: 28,
      selectedText: 'todas las cosas les ayudan a bien',
      fullVerseText: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.',
      category: 'revelation',
      color: '#8B5CF6',
      note: 'Soberanía providencial en las pruebas',
      createdAt: Date.now() - 2500000,
    },
    {
      id: 'hl-4',
      bookId: 'rom',
      bookName: 'Romanos',
      chapter: 8,
      verse: 1,
      selectedText: 'ninguna condenación hay para los que están en Cristo Jesús',
      fullVerseText: 'Ahora, pues, ninguna condenación hay para los que están en Cristo Jesús, los que no andan conforme a la carne, sino conforme al Espíritu.',
      category: 'reflection',
      color: '#EC4899',
      note: 'Libre de la culpa del pasado',
      createdAt: Date.now() - 2000000,
    },
  ],
  cards: [
    {
      id: 'card-1',
      type: 'central',
      title: 'El Favor Inmutable del Padre',
      content: 'Nuestra seguridad no descansa en nuestras circunstancias, sino en el carácter inamovible de Dios. La cruz es la prueba final de que el Padre nunca nos dejará a merced del enemigo.',
      color: '#F59E0B',
      x: 40,
      y: 60,
      width: 320,
      zIndex: 10,
      linkedHighlightId: 'hl-1',
      linkedVerseRef: 'Romanos 8:31',
      linkedQuote: 'Si Dios es por nosotros, ¿quién contra nosotros?',
      tags: ['Soberanía', 'Seguridad'],
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'card-2',
      type: 'point',
      title: 'Más que Vencedores (Hupermikao)',
      content: 'El pastor explicó que en griego "hiper-vencedores" significa que no sólo salimos ilesos de la batalla, sino enriquecidos en fe por medio de su amor entrañable.',
      color: '#6366F1',
      x: 410,
      y: 90,
      width: 310,
      zIndex: 8,
      linkedHighlightId: 'hl-2',
      linkedVerseRef: 'Romanos 8:37',
      linkedQuote: 'somos más que vencedores',
      tags: ['Victoria', 'Griego Bíblico'],
      createdAt: Date.now() - 3000000,
    },
    {
      id: 'card-3',
      type: 'illustration',
      title: 'La Ilustración del Tapiz',
      content: 'Por debajo del tapiz se ven nudos oscuros y desordenados (nuestras aflicciones), pero Dios desde arriba está tejiendo una obra de gloria eterna donde cada hilo ayuda a bien.',
      color: '#EC4899',
      x: 80,
      y: 350,
      width: 310,
      zIndex: 7,
      linkedHighlightId: 'hl-3',
      linkedVerseRef: 'Romanos 8:28',
      linkedQuote: 'todas las cosas les ayudan a bien',
      tags: ['Ilustración', 'Propósito'],
      createdAt: Date.now() - 2500000,
    },
    {
      id: 'card-4',
      type: 'action',
      title: 'Aplicación Práctica Semanal',
      content: '1. Desactivar los pensamientos de condenación y acusación matutina recordando Rom 8:1.\n2. Orar por la situación familiar conflictiva reconociendo que Dios ya está obrando a bien.',
      color: '#10B981',
      x: 440,
      y: 380,
      width: 320,
      zIndex: 9,
      linkedHighlightId: 'hl-4',
      linkedVerseRef: 'Romanos 8:1',
      linkedQuote: 'ninguna condenación hay',
      tags: ['Aplicación', 'Paz'],
      createdAt: Date.now() - 2000000,
    },
  ],
  links: [
    {
      id: 'link-1',
      fromHighlightId: 'hl-1',
      fromVerseRef: 'Romanos 8:31',
      toCardId: 'card-1',
      label: 'Idea Central',
      color: '#F59E0B',
    },
    {
      id: 'link-2',
      fromHighlightId: 'hl-2',
      fromVerseRef: 'Romanos 8:37',
      toCardId: 'card-2',
      label: 'Promesa Clave',
      color: '#3B82F6',
    },
    {
      id: 'link-3',
      fromHighlightId: 'hl-3',
      fromVerseRef: 'Romanos 8:28',
      toCardId: 'card-3',
      label: 'Ilustración Pastoral',
      color: '#EC4899',
    },
    {
      id: 'link-4',
      fromHighlightId: 'hl-4',
      fromVerseRef: 'Romanos 8:1',
      toCardId: 'card-4',
      label: 'Acción de Fe',
      color: '#10B981',
    },
  ],
  reflection: {
    godSpokeToMe: 'Dios me recordó que ninguna circunstancia difícil en mi trabajo puede anular su amor protector. Debo descansar en su cuidado.',
    personalApplication: 'Cada vez que sienta ansiedad esta semana, repetiré Romanos 8:31 antes de responder impulsivamente.',
    prayerRequest: 'Paz para mi familia y sabiduría para afrontar los desafíos laborales con gracia.',
    spiritualCommitment: 'Dedicar 15 minutos cada mañana a agradecer sus bondades en lugar de quejarme.',
    keyGratitude: 'Agradecido por el sacrificio de Cristo y la libertad de condenación que nos regaló.',
    updatedAt: Date.now(),
  },
  updatedAt: Date.now(),
};

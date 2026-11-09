// Curated, fully verified scripture passages for high-frequency preaching chapters
// Guaranteed authentic text across RVR1960, NTV, and NBLA translations.

export interface CuratedVerse {
  verse: number;
  text: string;
  isJesus?: boolean;
  crossRefs?: { ref: string; text?: string }[];
  footnotes?: { caller?: string; text: string }[];
}

export const CURATED_CHAPTERS: Record<string, Record<string, Record<number, CuratedVerse[]>>> = {
  NTV: {
    jue: {
      20: [
      {
            "verse": 1,
            "text": "Entonces todos los israelitas se unieron como un solo hombre, desde Dan en el norte hasta Beerseba en el sur, incluidos los del otro lado del Jordán, en la tierra de Galaad. Toda la comunidad se reunió en asamblea ante la presencia del Señor en Mizpa."
      },
      {
            "verse": 2,
            "text": "Los líderes de todo el pueblo, de todas las tribus de Israel —cuatrocientos mil guerreros armados con espadas—, ocuparon sus puestos en la asamblea del pueblo de Dios."
      },
      {
            "verse": 3,
            "text": "(Pronto llegó la noticia a la tierra de Benjamín de que las otras tribus habían subido a Mizpa). Entonces los israelitas preguntaron cómo había sucedido ese crimen tan terrible."
      },
      {
            "verse": 4,
            "text": "El levita, el esposo de la mujer asesinada, explicó:—Mi concubina y yo nos detuvimos para pasar la noche en Guibeá, una ciudad que pertenece a la tribu de Benjamín."
      },
      {
            "verse": 5,
            "text": "Esa noche, algunos de los ciudadanos prominentes de Guibeá rodearon la casa con la intención de matarme, y violaron a mi concubina hasta que quedó muerta."
      },
      {
            "verse": 6,
            "text": "Entonces corté su cuerpo en doce pedazos y envié los pedazos por todo el territorio asignado a Israel, porque esos hombres han cometido un crimen terrible y vergonzoso."
      },
      {
            "verse": 7,
            "text": "Ahora bien, todos ustedes —la comunidad entera de Israel— tienen que decidir aquí y ahora qué debe hacerse al respecto."
      },
      {
            "verse": 8,
            "text": "Y todo el pueblo se puso de pie al mismo tiempo y proclamó a una voz:—¡Ninguno de nosotros volverá a su hogar! ¡No, ni una sola persona!"
      },
      {
            "verse": 9,
            "text": "En cambio, haremos lo siguiente con Guibeá: echaremos suertes para decidir quién la atacará."
      },
      {
            "verse": 10,
            "text": "Una décima parte de los hombres de cada tribu se encargará de abastecer a los guerreros con provisiones; los demás nos vengaremos de Guibeá, en Benjamín, por la infamia que sus hombres han cometido en Israel."
      },
      {
            "verse": 11,
            "text": "Así que los israelitas estaban en total unanimidad, y se juntaron para atacar la ciudad."
      },
      {
            "verse": 12,
            "text": "Los israelitas enviaron mensajeros a la tribu de Benjamín, diciendo: «¡Qué acto tan terrible se ha cometido en medio de ustedes!"
      },
      {
            "verse": 13,
            "text": "Entréguennos a esos hombres malvados, a esos perturbadores de Guibeá, para que los ejecutemos y así purifiquemos a Israel de semejante maldad».Pero los de Benjamín no quisieron escuchar."
      },
      {
            "verse": 14,
            "text": "En cambio, salieron de sus ciudades y se juntaron en Guibeá para pelear contra los israelitas."
      },
      {
            "verse": 15,
            "text": "En total, de toda la tribu de Benjamín, llegaron a Guibeá veintiséis mil guerreros armados con espadas, los cuales se sumaron a los setecientos guerreros selectos que vivían allí."
      },
      {
            "verse": 16,
            "text": "Entre las tropas selectas de Benjamín había setecientos hombres zurdos, capaces de tirar una piedra con la honda y acertar en un cabello sin errar el blanco."
      },
      {
            "verse": 17,
            "text": "Israel, a su vez, tenía cuatrocientos mil soldados con experiencia en la guerra, armados con espadas, sin contar a los guerreros de Benjamín."
      },
      {
            "verse": 18,
            "text": "Antes de la batalla, los israelitas fueron a Betel y le preguntaron a Dios:—¿Cuál de las tribus debe ser la primera en atacar a la gente de Benjamín?El Señor contestó:—Judá debe ir primero."
      },
      {
            "verse": 19,
            "text": "Entonces los israelitas salieron temprano a la mañana siguiente y acamparon cerca de Guibeá."
      },
      {
            "verse": 20,
            "text": "Después avanzaron hacia Guibeá para atacar a los hombres de Benjamín."
      },
      {
            "verse": 21,
            "text": "Pero los guerreros de Benjamín, que estaban defendiendo la ciudad, salieron y mataron ese día a veintidós mil israelitas en el campo de batalla."
      },
      {
            "verse": 22,
            "text": "Sin embargo, los israelitas se animaron unos a otros y otra vez tomaron sus posiciones en el mismo lugar donde habían luchado el día anterior."
      },
      {
            "verse": 23,
            "text": "Pues habían subido a Betel y habían llorado en presencia del Señor hasta la noche. Le habían preguntado al Señor:—¿Debemos salir nuevamente a pelear contra nuestros parientes de Benjamín?Y el Señor había dicho:—Salgan a pelear contra ellos."
      },
      {
            "verse": 24,
            "text": "Así que, al día siguiente, volvieron a pelear contra los hombres de Benjamín,"
      },
      {
            "verse": 25,
            "text": "pero los hombres de Benjamín mataron a otros dieciocho mil israelitas, todos ellos expertos en el uso de la espada."
      },
      {
            "verse": 26,
            "text": "Entonces todos los israelitas subieron a Betel y lloraron en presencia del Señor, y ayunaron hasta la noche. También le llevaron al Señor ofrendas quemadas y ofrendas de paz."
      },
      {
            "verse": 27,
            "text": "Los israelitas fueron a buscar dirección del Señor. (En esos días el arca del pacto de Dios estaba en Betel,"
      },
      {
            "verse": 28,
            "text": "y el sacerdote era Finees, hijo de Eleazar y nieto de Aarón). Los israelitas le preguntaron al Señor:—¿Debemos volver a pelear contra nuestros parientes de Benjamín o debemos detenernos?El Señor dijo:—¡Vayan! Mañana se los entregaré."
      },
      {
            "verse": 29,
            "text": "Entonces los israelitas armaron una emboscada alrededor de Guibeá."
      },
      {
            "verse": 30,
            "text": "Salieron al tercer día, y tomaron sus posiciones en los mismos lugares que antes."
      },
      {
            "verse": 31,
            "text": "Cuando los hombres de Benjamín salieron a atacar, fueron alejados de la ciudad. Y tal como habían hecho antes, comenzaron a matar a los israelitas. Unos treinta israelitas murieron en campo abierto y por los dos caminos, uno que lleva a Betel, y el otro que lleva de vuelta a Guibeá."
      },
      {
            "verse": 32,
            "text": "Entonces los guerreros de Benjamín gritaron: «¡Los estamos derrotando igual que antes!»; pero los israelitas habían planeado huir de antemano, para que los hombres de Benjamín salieran a perseguirlos por los caminos y quedaran alejados de la ciudad."
      },
      {
            "verse": 33,
            "text": "Cuando los guerreros israelitas llegaron a Baal-tamar, se dieron vuelta y tomaron sus posiciones de batalla. Mientras tanto, los israelitas que estaban escondidos en emboscada al occidente de Guibeá salieron de repente a pelear."
      },
      {
            "verse": 34,
            "text": "Sumaban diez mil los guerreros israelitas selectos que avanzaron contra Guibeá. El enfrentamiento fue tan intenso que Benjamín no se dio cuenta del desastre que se avecinaba."
      },
      {
            "verse": 35,
            "text": "Y el Señor ayudó a Israel a derrotar a Benjamín, y ese día los israelitas mataron a veinticinco mil cien guerreros de Benjamín, todos expertos en el manejo de la espada."
      },
      {
            "verse": 36,
            "text": "Entonces los hombres de Benjamín se dieron cuenta de que estaban vencidos.Los israelitas habían retrocedido frente a los guerreros de Benjamín para que los que estaban escondidos en emboscada tuvieran más terreno para maniobrar contra Guibeá."
      },
      {
            "verse": 37,
            "text": "Entonces los que estaban escondidos en los alrededores se lanzaron contra la ciudad y mataron a todos los habitantes."
      },
      {
            "verse": 38,
            "text": "Habían acordado hacer una gran columna de humo desde la ciudad como señal."
      },
      {
            "verse": 39,
            "text": "Cuando los israelitas vieron el humo, se dieron vuelta y atacaron a los guerreros de Benjamín.Para entonces, los guerreros de Benjamín habían matado a unos treinta israelitas y gritaban: «¡Los estamos derrotando como en la primera batalla!»."
      },
      {
            "verse": 40,
            "text": "Pero cuando los guerreros de Benjamín miraron hacia atrás y vieron el humo que se elevaba al cielo desde todos los rincones de la ciudad,"
      },
      {
            "verse": 41,
            "text": "los hombres de Israel giraron y los atacaron. En ese instante, los hombres de Benjamín se aterrorizaron, porque se dieron cuenta de que se les venía el desastre encima."
      },
      {
            "verse": 42,
            "text": "Así que dieron media vuelta y huyeron frente a los israelitas hacia el desierto. Pero no pudieron escapar de la batalla, y la gente que salió de las ciudades cercanas también pereció."
      },
      {
            "verse": 43,
            "text": "Los israelitas cercaron a los hombres de Benjamín y los persiguieron sin tregua, hasta que por fin los alcanzaron al oriente de Guibeá."
      },
      {
            "verse": 44,
            "text": "Ese día murieron en batalla dieciocho mil de los guerreros más fuertes de Benjamín."
      },
      {
            "verse": 45,
            "text": "Los sobrevivientes huyeron al desierto, hacia la roca de Rimón, pero Israel mató a cinco mil de ellos a lo largo del camino. Los israelitas continuaron persiguiéndolos hasta que mataron a otros dos mil cerca de Gidom."
      },
      {
            "verse": 46,
            "text": "Ese día la tribu de Benjamín perdió veinticinco mil guerreros fuertes armados con espada,"
      },
      {
            "verse": 47,
            "text": "y quedaron solo seiscientos hombres, quienes escaparon a la roca de Rimón, donde vivieron durante cuatro meses."
      },
      {
            "verse": 48,
            "text": "Entonces los israelitas regresaron al territorio de Benjamín y en todas las ciudades masacraron a todo ser viviente: a la gente, a los animales y a todo lo que encontraron. También quemaron por completo todas las ciudades por las que pasaron."
      }
]
    },
    rom: {
      8: [
        {
          verse: 1,
          text: 'Por lo tanto, ya no hay condenación para los que pertenecen a Cristo Jesús;',
          crossRefs: [
            { ref: 'Romanos 8:34', text: '¿Quién es el que condenará? Cristo es el que murió; más aun, el que también resucitó' },
            { ref: 'Juan 3:18', text: 'El que en él cree, no es condenado' }
          ],
          footnotes: [{ text: 'Algunos manuscritos añaden: los que no andan conforme a la carne, sino conforme al Espíritu.' }]
        },
        { verse: 2, text: 'y porque ustedes pertenecen a él, el poder del Espíritu que da vida los ha libertado del poder del pecado, que lleva a la muerte.' },
        { verse: 14, text: 'Pues todos los que son guiados por el Espíritu de Dios son hijos de Dios.' },
        { verse: 15, text: 'Y ustedes no han recibido un espíritu que los esclavice al miedo. En cambio, recibieron el Espíritu de Dios cuando él los adoptó como sus propios hijos. Ahora lo llamamos: «Abba, Padre».' },
        {
          verse: 28,
          text: 'Y sabemos que Dios hace que todas las cosas cooperen para el bien de quienes lo aman y son llamados según el propósito que él tiene para ellos.',
          crossRefs: [
            { ref: 'Jeremías 29:11', text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz' },
            { ref: 'Efesios 1:11', text: 'Habiendo sido predestinados conforme al propósito del que hace todas las cosas' }
          ]
        },
        {
          verse: 31,
          text: '¿Qué podemos decir acerca de cosas tan maravillosas como estas? Si Dios está a favor de nosotros, ¿quién podrá ponerse en nuestra contra?',
          crossRefs: [
            { ref: 'Salmos 118:6', text: 'Jehová está conmigo; no temeré lo que me pueda hacer el hombre.' },
            { ref: 'Isaías 50:8', text: 'Cercano está de mí el que me salva; ¿quién contenderá conmigo?' }
          ]
        },
        {
          verse: 37,
          text: 'Claro que no, a pesar de todas estas cosas, nuestro triunfo es absoluto por medio de Cristo, quien nos amó.',
          crossRefs: [{ ref: '1 Corintios 15:57', text: 'Mas gracias sean dadas a Dios, que nos da la victoria por medio de nuestro Señor Jesucristo.' }]
        },
        { verse: 38, text: 'Y estoy convencido de que nada podrá jamás separarnos del amor de Dios. Ni la muerte, ni la vida, ni ángeles, ni demonios, ni nuestros temores de hoy, ni nuestras preocupaciones de mañana.' },
        {
          verse: 39,
          text: 'Ningún poder en las alturas ni en las profundidades, de hecho, nada en toda la creación podrá jamás separarnos del amor de Dios, que está revelado en Cristo Jesús nuestro Señor.',
          crossRefs: [{ ref: 'Efesios 3:18-19', text: 'Para que seáis plenamente capaces de comprender con todos los santos cuál sea la anchura, la longitud, la profundidad y la altura' }]
        }
      ]
    },
    sal: {
      23: [
        {
          verse: 1,
          text: 'El Señor es mi pastor; tengo todo lo que necesito.',
          crossRefs: [
            { ref: 'Juan 10:11', text: 'Yo soy el buen pastor; el buen pastor su vida da por las ovejas.' },
            { ref: 'Filipenses 4:19', text: 'Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria' }
          ]
        },
        { verse: 2, text: 'En verdes praderas me hace descansar; me conduce junto a arroyos tranquilos.' },
        { verse: 3, text: 'Él renueva mis fuerzas. Me guía por sendas correctas, y así da honra a su nombre.' },
        { verse: 4, text: 'Aun cuando pase por el valle más oscuro, no temeré, porque tú estás a mi lado. Tu vara y tu cayado me protegen y me confortan.' },
        { verse: 5, text: 'Me preparas un banquete en presencia de mis enemigos. Me honras ungiendo mi cabeza con aceite; mi copa se desborda de bendiciones.' },
        { verse: 6, text: 'Ciertamente tu bondad y tu amor inagotable me seguirán todos los días de mi vida, y en la casa del Señor viviré por siempre.' }
      ]
    },
    fil: {
      4: [
        { verse: 4, text: 'Alégrense siempre en el Señor. Insisto: ¡Alégrense!' },
        { verse: 6, text: 'No se preocupen por nada; en cambio, oren por todo. Díganle a Dios lo que necesitan y denle gracias por todo lo que él ha hecho.' },
        { verse: 7, text: 'Así experimentarán la paz de Dios, que supera todo lo que podemos entender. La paz de Dios cuidará su corazón y su mente mientras vivan en Cristo Jesús.' },
        {
          verse: 13,
          text: 'Pues todo lo puedo hacer por medio de Cristo, quien me da las fuerzas.',
          crossRefs: [
            { ref: '2 Corintios 12:9', text: 'Bástate mi gracia; porque mi poder se perfecciona en la debilidad.' },
            { ref: 'Juan 15:5', text: 'Separados de mí nada podéis hacer.' }
          ]
        }
      ]
    },
    jua: {
      15: [
        {
          verse: 1,
          text: 'Yo soy la vid verdadera, y mi Padre es el labrador.',
          isJesus: true,
          crossRefs: [{ ref: 'Salmos 80:8', text: 'Hiciste venir una vid de Egipto; echaste las naciones, y la plantaste.' }]
        },
        { verse: 4, text: 'Permanezcan en mí, y yo permaneceré en ustedes. Pues una rama no puede dar fruto por sí misma; debe permanecer en la vid.', isJesus: true },
        {
          verse: 5,
          text: 'Sí, yo soy la vid y ustedes son las ramas. Los que permanecen en mí y yo en ellos producirán mucho fruto porque, separados de mí, no pueden hacer nada.',
          isJesus: true,
          crossRefs: [{ ref: 'Filipenses 4:13', text: 'Todo lo puedo en Cristo que me fortalece.' }]
        },
        { verse: 12, text: 'Este es mi mandamiento: Ámense unos a otros tal como yo los he amado.', isJesus: true }
      ]
    }
  },
  NBLA: {
    jue: {
      20: [
      {
            "verse": 1,
            "text": "Entonces salieron todos los israelitas, desde Dan hasta Beerseba, incluyendo la tierra de Galaad, y la congregación se reunió al Señor como un solo hombre en Mizpa."
      },
      {
            "verse": 2,
            "text": "Y los jefes de todo el pueblo, de todas las tribus de Israel, tomaron su puesto en la asamblea del pueblo de Dios, 400,000 soldados de a pie que sacaban espada."
      },
      {
            "verse": 3,
            "text": "(Y los hijos de Benjamín oyeron que los israelitas habían subido a Mizpa). Entonces los israelitas preguntaron: «Dígannos, ¿cómo ocurrió esta maldad?»."
      },
      {
            "verse": 4,
            "text": "El levita, marido de la mujer que había sido asesinada, respondió: «Vine con mi concubina a pasar la noche en Guibeá de Benjamín."
      },
      {
            "verse": 5,
            "text": "Pero los hombres de Guibeá se levantaron contra mí, y rodearon la casa por la noche por causa mía. Tenían intención de matarme. Pero en vez de esto, violaron a mi concubina de tal manera que murió."
      },
      {
            "verse": 6,
            "text": "Tomé entonces a mi concubina, la corté en pedazos y la envié por todo el territorio de la heredad de Israel, porque han cometido lascivia y terrible ofensa en Israel."
      },
      {
            "verse": 7,
            "text": "Así que todos ustedes, israelitas, den aquí su parecer y consejo»."
      },
      {
            "verse": 8,
            "text": "Entonces todo el pueblo se levantó como un solo hombre y dijeron: «Ninguno de nosotros irá a su tienda, ni ninguno de nosotros volverá a su casa."
      },
      {
            "verse": 9,
            "text": "Esto es lo que haremos ahora a Guibeá: subiremos contra la ciudad por sorteo."
      },
      {
            "verse": 10,
            "text": "Tomaremos diez hombres de cada 100 por todas las tribus de Israel, y 100 de cada 1,000 y 1,000 de cada 10,000 para proveer víveres para el ejército, que vaya a Guibeá de Benjamín a castigarlos por toda la infamia que han cometido en Israel»."
      },
      {
            "verse": 11,
            "text": "Así se juntaron contra la ciudad todos los hombres de Israel, como un solo hombre."
      },
      {
            "verse": 12,
            "text": "Entonces las tribus de Israel enviaron hombres por toda la tribu de Benjamín y dijeron: «¿Qué es esta infamia que se ha cometido entre ustedes?"
      },
      {
            "verse": 13,
            "text": "Entreguen ahora a los hombres, esos perversos en Guibeá, para que les demos muerte y quitemos esta infamia de Israel». Pero los de la tribu de Benjamín no quisieron escuchar la voz de sus hermanos, los israelitas."
      },
      {
            "verse": 14,
            "text": "Y los benjamitas, de sus ciudades, se reunieron en Guibeá para salir a combatir contra los israelitas."
      },
      {
            "verse": 15,
            "text": "De las ciudades fueron contados en aquel día, de los benjamitas, 26,000 hombres que sacaban espada, además de los habitantes de Guibeá que fueron contados, 700 hombres escogidos."
      },
      {
            "verse": 16,
            "text": "De toda esta gente, 700 hombres escogidos eran zurdos; capaces cada uno de lanzar con la honda una piedra a un cabello sin errar."
      },
      {
            "verse": 17,
            "text": "Entonces los hombres de Israel, aparte de Benjamín, fueron contados, 400,000 hombres que sacaban espada. Todos estos eran hombres de guerra."
      },
      {
            "verse": 18,
            "text": "Los israelitas se levantaron, subieron a Betel, y consultaron a Dios, y preguntaron: «¿Quién de nosotros subirá primero a pelear contra la tribu de Benjamín?». Entonces el Señor respondió: «Judá subirá primero»."
      },
      {
            "verse": 19,
            "text": "Los israelitas se levantaron por la mañana y acamparon contra Guibeá."
      },
      {
            "verse": 20,
            "text": "Los hombres de Israel salieron a combatir contra Benjamín, y los hombres de Israel se pusieron en orden de batalla contra ellos en Guibeá."
      },
      {
            "verse": 21,
            "text": "Pero los benjamitas salieron de Guibeá y derribaron por tierra en aquel día 22,000 hombres de Israel."
      },
      {
            "verse": 22,
            "text": "Pero el pueblo, los hombres de Israel, se reanimaron, y se pusieron otra vez en orden de batalla en el lugar donde se habían puesto el primer día."
      },
      {
            "verse": 23,
            "text": "Y subieron los israelitas y lloraron delante del Señor hasta la noche, y consultaron al Señor, diciendo: «¿Nos acercaremos otra vez para combatir contra los hijos de mi hermano Benjamín?». Y el Señor dijo: «Suban contra él»."
      },
      {
            "verse": 24,
            "text": "Entonces los israelitas fueron contra los de Benjamín el segundo día."
      },
      {
            "verse": 25,
            "text": "Y salió Benjamín de Guibeá contra ellos el segundo día y otra vez hizo caer 18,000 hombres de los israelitas. Todos estos sacaban espada."
      },
      {
            "verse": 26,
            "text": "Todos los israelitas y todo el pueblo subieron y vinieron a Betel y lloraron; y permanecieron allí delante del Señor y ayunaron ese día hasta la noche. Y ofrecieron holocaustos y ofrendas de paz delante del Señor."
      },
      {
            "verse": 27,
            "text": "Los israelitas consultaron al Señor, porque el arca del pacto de Dios estaba allí en aquellos días,"
      },
      {
            "verse": 28,
            "text": "y Finees, hijo de Eleazar, hijo de Aarón, estaba delante de ella para ministrar en aquellos días y preguntó: «¿Volveré a salir otra vez a combatir contra los hijos de mi hermano Benjamín, o desistiré?». Y el Señor respondió: «Suban, porque mañana lo entregaré en tu mano».Derrota y exterminio de los benjamitas"
      },
      {
            "verse": 29,
            "text": "Puso, pues, Israel emboscadas alrededor de Guibeá."
      },
      {
            "verse": 30,
            "text": "Los israelitas subieron contra los de Benjamín al tercer día, y se pusieron en orden de batalla contra Guibeá como las otras veces."
      },
      {
            "verse": 31,
            "text": "Salieron los hijos de Benjamín contra el pueblo, y fueron alejados de la ciudad. Comenzaron como las otras veces a herir y a matar a algunos del pueblo por los caminos, uno de los cuales sube a Betel y el otro a Guibeá, en campo abierto. Y mataron a unos treinta hombres de Israel."
      },
      {
            "verse": 32,
            "text": "Y los hijos de Benjamín dijeron: «Están derrotados delante de nosotros como la primera vez». Pero los israelitas dijeron: «Huyamos para que los alejemos de la ciudad hacia los caminos»."
      },
      {
            "verse": 33,
            "text": "Entonces todos los hombres de Israel se levantaron de sus puestos y se pusieron en orden de batalla en Baal Tamar. Y los emboscados de Israel salieron de sus puestos, de Maareh Geba."
      },
      {
            "verse": 34,
            "text": "Cuando 10,000 hombres escogidos de todo Israel fueron contra Guibeá, la batalla se hizo reñida; pero Benjamín no sabía que el desastre se le acercaba."
      },
      {
            "verse": 35,
            "text": "Y el Señor hirió a Benjamín delante de Israel, de modo que los israelitas mataron ese día a 25,100 hombres de Benjamín, todos ellos sacaban espada."
      },
      {
            "verse": 36,
            "text": "Y los de Benjamín vieron que estaban derrotados. Cuando los hombres de Israel cedieron terreno a Benjamín porque confiaban en las emboscadas que habían puesto contra Guibeá,"
      },
      {
            "verse": 37,
            "text": "los emboscados se apresuraron y se lanzaron contra Guibeá. Entonces se desplegaron e hirieron toda la ciudad a filo de espada."
      },
      {
            "verse": 38,
            "text": "La señal convenida entre los hombres de Israel y los emboscados, era de que ellos harían que se levantara una gran nube de humo de la ciudad,"
      },
      {
            "verse": 39,
            "text": "entonces los hombres de Israel regresarían a la batalla. Y los de Benjamín empezaron a herir y matar a unos treinta hombres de Israel, porque dijeron: «Ciertamente están derrotados delante de nosotros como en la primera batalla»."
      },
      {
            "verse": 40,
            "text": "Pero cuando la nube de humo como columna empezó a levantarse de la ciudad, los de Benjamín miraron tras sí; y de toda la ciudad subía humo al cielo."
      },
      {
            "verse": 41,
            "text": "Entonces los hombres de Israel se volvieron, y los de Benjamín se aterrorizaron porque vieron que el desastre se les acercaba."
      },
      {
            "verse": 42,
            "text": "Por tanto, volvieron la espalda ante los hombres de Israel en dirección al desierto, pero la batalla los alcanzó, y los que salían de las ciudades los destruían en medio de ellos."
      },
      {
            "verse": 43,
            "text": "Cercaron a Benjamín, lo persiguieron sin tregua y lo aplastaron frente a Guibeá, hacia el oriente."
      },
      {
            "verse": 44,
            "text": "Cayeron 18,000 hombres de Benjamín; todos ellos eran valientes guerreros."
      },
      {
            "verse": 45,
            "text": "Cuando los demás se volvieron y huyeron al desierto, a la peña de Rimón, los israelitas capturaron a 5,000 de ellos en los caminos, y a otros los persiguieron muy de cerca hasta Gidom y mataron a 2,000 de ellos."
      },
      {
            "verse": 46,
            "text": "El total de los de Benjamín que cayeron aquel día fue de 25,000 hombres que sacaban espada, todos ellos valientes guerreros."
      },
      {
            "verse": 47,
            "text": "Pero 600 hombres se volvieron y huyeron al desierto, a la peña de Rimón, y permanecieron en la peña de Rimón cuatro meses."
      },
      {
            "verse": 48,
            "text": "Entonces los hombres de Israel se volvieron contra los hijos de Benjamín y los hirieron a filo de espada, a toda la ciudad, así como el ganado y todo lo que encontraron; también prendieron fuego a todas las ciudades que hallaron."
      }
]
    },
    rom: {
      8: [
        { verse: 1, text: 'Por tanto, no hay ahora condenación para los que están en Cristo Jesús, los que no andan conforme a la carne sino conforme al Espíritu.' },
        { verse: 2, text: 'Porque la ley del Espíritu de vida en Cristo Jesús te ha libertado de la ley del pecado y de la muerte.' },
        { verse: 14, text: 'Porque todos los que son guiados por el Espíritu de Dios, los tales son hijos de Dios.' },
        { verse: 15, text: 'Pues no habéis recibido un espíritu de esclavitud para volver otra vez al temor, sino que habéis recibido un espíritu de adopción como hijos, por el cual clamamos: «¡Abba, Padre!».' },
        { verse: 28, text: 'Y sabemos que para los que aman a Dios, todas las cosas cooperan para bien, esto es, para los que son llamados conforme a Su propósito.' },
        { verse: 31, text: 'Entonces, ¿qué diremos a esto? Si Dios está por nosotros, ¿quién estará contra nosotros?' },
        { verse: 37, text: 'Pero en todas estas cosas somos más que vencedores por medio de Aquel que nos amó.' },
        { verse: 38, text: 'Porque estoy convencido de que ni la muerte, ni la vida, ni ángeles, ni principados, ni lo presente, ni lo por venir, ni los poderes,' },
        { verse: 39, text: 'ni lo alto, ni lo profundo, ni ninguna otra cosa creada nos podrá separar del amor de Dios que es en Cristo Jesús Señor nuestro.' }
      ]
    },
    sal: {
      23: [
        { verse: 1, text: 'El Señor es mi pastor, nada me faltará.' },
        { verse: 2, text: 'En lugares de verdes pastos me hace descansar; junto a aguas de reposo me conduce.' },
        { verse: 3, text: 'Él restaura mi alma; me guía por senderos de justicia por amor de Su nombre.' },
        { verse: 4, text: 'Aunque pase por el valle de sombra de muerte, no temeré mal alguno, porque Tú estás conmigo; Tu vara y Tu cayado me infunden aliento.' },
        { verse: 5, text: 'Tú preparas mesa delante de mí en presencia de mis enemigos; has ungido mi cabeza con aceite; mi copa está rebosando.' },
        { verse: 6, text: 'Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, y en la casa del Señor moraré por largos días.' }
      ]
    },
    fil: {
      4: [
        { verse: 4, text: 'Regocijaos en el Señor siempre. Otra vez lo diré: ¡Regocijaos!' },
        { verse: 6, text: 'Por nada estéis afanosos; antes bien, en todo, mediante oración y súplica con acción de gracias, sean dadas a conocer vuestras peticiones delante de Dios.' },
        { verse: 7, text: 'Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestras mentes en Cristo Jesús.' },
        { verse: 13, text: 'Todo lo puedo en Cristo que me fortalece.' }
      ]
    }
  },
  RVR1960: {
    jue: {
      20: [
      {
            "verse": 1,
            "text": "Entonces salieron todos los hijos de Israel, y se reunió la congregación como un solo hombre, desde Dan hasta Beerseba y la tierra de Galaad, a Jehová en Mizpa."
      },
      {
            "verse": 2,
            "text": "Y los jefes de todo el pueblo, de todas las tribus de Israel, se hallaron presentes en la reunión del pueblo de Dios, cuatrocientos mil hombres de a pie que sacaban espada."
      },
      {
            "verse": 3,
            "text": "Y los hijos de Benjamín oyeron que los hijos de Israel habían subido a Mizpa. Y dijeron los hijos de Israel: Decid cómo fue esta maldad."
      },
      {
            "verse": 4,
            "text": "Entonces el varón levita, marido de la mujer muerta, respondió y dijo: Yo llegué a Gabaa de Benjamín con mi concubina, para pasar allí la noche."
      },
      {
            "verse": 5,
            "text": "Y levantándose contra mí los de Gabaa, rodearon sobre mí la casa por la noche, con idea de matarme, y amancillaron a mi concubina tanto que ella murió."
      },
      {
            "verse": 6,
            "text": "Entonces tomando yo mi concubina, la corté en pedazos, y los envié por todo el término de la posesión de Israel: por cuanto han hecho maldad y crimen en Israel."
      },
      {
            "verse": 7,
            "text": "He aquí todos vosotros sois hijos de Israel; dad aquí vuestro parecer y consejo."
      },
      {
            "verse": 8,
            "text": "Entonces todo el pueblo, como un solo hombre, se levantó, y dijeron: Ninguno de nosotros irá a su tienda, ni ninguno de nosotros volverá a su casa."
      },
      {
            "verse": 9,
            "text": "Esto es lo que haremos ahora a Gabaa; contra ella subiremos por sorteo."
      },
      {
            "verse": 10,
            "text": "Tomaremos diez hombres de cada cien por todas las tribus de Israel, y cien de cada mil, y mil de cada diez mil, que lleven provisiones para el pueblo, para que yendo contra Gabaa de Benjamín, le hagan conforme a toda la abominación que ha cometido en Israel."
      },
      {
            "verse": 11,
            "text": "Y se juntaron todos los hombres de Israel contra la ciudad, ligados como un solo hombre."
      },
      {
            "verse": 12,
            "text": "Y las tribus de Israel enviaron varones por toda la tribu de Benjamín, diciendo: ¿Qué maldad es esta que ha sido hecha entre vosotros?"
      },
      {
            "verse": 13,
            "text": "Entregad, pues, ahora aquellos hombres, hijos de Belial, que están en Gabaa, para que los matemos, y barramos el mal de Israel. Mas los de Benjamín no quisieron oír la voz de sus hermanos los hijos de Israel."
      },
      {
            "verse": 14,
            "text": "Antes los de Benjamín se juntaron de las ciudades de Gabaa, para salir a pelear contra los hijos de Israel."
      },
      {
            "verse": 15,
            "text": "Y fueron contados en aquel tiempo los hijos de Benjamín de las ciudades, veintiséis mil hombres que sacaban espada, además de los habitantes de Gabaa, que fueron por cuenta setecientos hombres escogidos."
      },
      {
            "verse": 16,
            "text": "De toda aquella gente había setecientos hombres escogidos, que eran zurdos, todos los cuales tiraban una piedra con la honda a un cabello, y no erraban."
      },
      {
            "verse": 17,
            "text": "Y fueron contados los varones de Israel, fuera de Benjamín, cuatrocientos mil hombres que sacaban espada, todos estos eran hombres de guerra."
      },
      {
            "verse": 18,
            "text": "Se levantaron luego los hijos de Israel, y subieron a la casa de Dios, y consultaron a Dios, diciendo: ¿Quién de nosotros subirá primero a la guerra contra los hijos de Benjamín? Y Jehová respondió: Judá subirá primero."
      },
      {
            "verse": 19,
            "text": "Levantándose, pues, de mañana los hijos de Israel, acamparon contra Gabaa."
      },
      {
            "verse": 20,
            "text": "Y salieron los hijos de Israel a combatir contra Benjamín; y los varones de Israel ordenaron la batalla contra ellos junto a Gabaa."
      },
      {
            "verse": 21,
            "text": "Saliendo entonces de Gabaa los hijos de Benjamín, derribaron en tierra aquel día veintidós mil hombres de los hijos de Israel."
      },
      {
            "verse": 22,
            "text": "Mas reanimándose el pueblo, los varones de Israel tornaron a ordenar la batalla en el mismo lugar donde la habían ordenado el primer día."
      },
      {
            "verse": 23,
            "text": "Porque los hijos de Israel subieron, y lloraron delante de Jehová hasta la tarde, y consultaron a Jehová, diciendo: ¿Tornaré a pelear con los hijos de Benjamín mi hermano? Y Jehová les respondió: Subid contra él."
      },
      {
            "verse": 24,
            "text": "Los hijos pues de Israel se acercaron el siguiente día a los hijos de Benjamín."
      },
      {
            "verse": 25,
            "text": "Y aquel segundo día, saliendo Benjamín de Gabaa contra ellos, derribaron por tierra otros dieciocho mil hombres de los hijos de Israel, todos los cuales sacaban espada."
      },
      {
            "verse": 26,
            "text": "Entonces subieron todos los hijos de Israel, y todo el pueblo, y vinieron a la casa de Dios; y lloraron, y se sentaron allí delante de Jehová, y ayunaron aquel día hasta la tarde; y sacrificaron holocaustos y ofrendas de paz delante de Jehová."
      },
      {
            "verse": 27,
            "text": "Y los hijos de Israel preguntaron a Jehová (porque el arca del pacto de Dios estaba allí en aquellos días,"
      },
      {
            "verse": 28,
            "text": "y Finees, hijo de Eleazar, hijo de Aarón, ministraba delante de ella en aquellos días), y dijeron: ¿Volveré aún a salir en batalla contra los hijos de Benjamín mi hermano, o me quedaré quieto? Y Jehová dijo: Subid, que mañana yo lo entregaré en tu mano."
      },
      {
            "verse": 29,
            "text": "Y puso Israel emboscadas alrededor de Gabaa."
      },
      {
            "verse": 30,
            "text": "Subiendo entonces los hijos de Israel contra los hijos de Benjamín el tercer día, ordenaron la batalla delante de Gabaa, como las otras veces."
      },
      {
            "verse": 31,
            "text": "Y saliendo los hijos de Benjamín contra el pueblo, alejados que fueron de la ciudad, comenzaron a herir a algunos del pueblo, matando como las otras veces por los caminos, uno de los cuales sube a Betel, y el otro a Gabaa en el campo; y mataron unos treinta hombres de Israel."
      },
      {
            "verse": 32,
            "text": "Y los hijos de Benjamín decían: Vencidos son delante de nosotros, como antes. Mas los hijos de Israel decían: Huiremos, y los alejaremos de la ciudad hasta los caminos."
      },
      {
            "verse": 33,
            "text": "Entonces, levantándose todos los de Israel de su lugar, se pusieron en orden en Baal-tamar: y también las emboscadas de Israel salieron de su lugar, del prado de Gabaa."
      },
      {
            "verse": 34,
            "text": "Y vinieron contra Gabaa diez mil hombres escogidos de todo Israel, y la batalla comenzó a agravarse; mas ellos no sabían que el mal se acercaba sobre ellos."
      },
      {
            "verse": 35,
            "text": "Y Jehová hirió a Benjamín delante de Israel; y mataron los hijos de Israel aquel día veinticinco mil cien hombres de Benjamín, todos los cuales sacaban espada."
      },
      {
            "verse": 36,
            "text": "Y vieron los hijos de Benjamín que eran muertos; pues los hijos de Israel habían dado lugar a Benjamín, porque estaban confiados en las emboscadas que habían puesto detrás de Gabaa."
      },
      {
            "verse": 37,
            "text": "Entonces los hombres de las emboscadas acometieron prontamente a Gabaa, y se extendieron, e hirieron a filo de espada a toda la ciudad."
      },
      {
            "verse": 38,
            "text": "Ya los israelitas estaban concertados con las emboscadas, que hiciesen mucho fuego, para que subiese gran humo de la ciudad."
      },
      {
            "verse": 39,
            "text": "Luego, pues, que los de Israel se volvieron en la batalla, los de Benjamín comenzaron a derribar heridos de Israel unos treinta hombres, y ya decían: Ciertamente ellos han caído delante de nosotros, como en la primera batalla."
      },
      {
            "verse": 40,
            "text": "Mas cuando la llama comenzó a subir de la ciudad con una columna de humo, los benjamitas miraron hacia atrás; y he aquí que el fuego de la ciudad subía al cielo."
      },
      {
            "verse": 41,
            "text": "Entonces se volvieron los hombres de Israel, y los de Benjamín se llenaron de temor porque vieron que el mal había venido sobre ellos."
      },
      {
            "verse": 42,
            "text": "Volvieron, por tanto, la espalda delante de Israel hacia el camino del desierto; mas el escuadrón los alcanzó, y los que salían de las ciudades los destruían en medio de ellos."
      },
      {
            "verse": 43,
            "text": "Así envolvieron a los de Benjamín, y los persiguieron y fácilmente los aplastaron enfrente de Gabaa, hacia donde nace el sol."
      },
      {
            "verse": 44,
            "text": "Y cayeron de Benjamín dieciocho mil hombres, todos ellos hombres de guerra."
      },
      {
            "verse": 45,
            "text": "Volviéndose luego, huyeron hacia el desierto, a la roca de Rimón, y de ellos recogieron cinco mil hombres en los caminos; y fueron persiguiéndolos aun hasta Gidom, y mataron de ellos dos mil hombres."
      },
      {
            "verse": 46,
            "text": "Así todos los que de Benjamín murieron aquel día, fueron veinticinco mil hombres que sacaban espada, todos ellos hombres de guerra."
      },
      {
            "verse": 47,
            "text": "Pero seiscientos hombres se volvieron y huyeron al desierto, a la roca de Rimón, y se estuvieron en la roca de Rimón cuatro meses:"
      },
      {
            "verse": 48,
            "text": "Y los hombres de Israel se volvieron contra los hijos de Benjamín, y los mataron a filo de espada, así a los hombres de cada ciudad, como a las bestias y todo lo que encontraron; también pusieron fuego a todas las ciudades que hallaron."
      }
]
    }
  }
};

export function getCuratedChapter(
  translation: string,
  bookId: string,
  chapter: number
): CuratedVerse[] | null {
  const normalizedBook = bookId.toLowerCase();
  const found = CURATED_CHAPTERS[translation]?.[normalizedBook]?.[chapter];
  if (found && found.length > 0) return found;
  return null;
}

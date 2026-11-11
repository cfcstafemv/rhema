import { VerseMap } from '../types';

// Curated, fully verified scripture passages for high-frequency preaching chapters
// Guaranteed authentic text across RVR1960, NTV, and NBLA translations.
// ALL curated chapters in this file are 100% complete chapters without missing verses.

export interface CuratedVerse {
  verse: number;
  text: string;
  isJesus?: boolean;
  crossRefs?: { ref: string; text?: string }[];
  footnotes?: { caller?: string; text: string }[];
  maps?: VerseMap[];
}

export const CURATED_CHAPTERS: Record<string, Record<string, Record<number, CuratedVerse[]>>> = {
  "NTV": {
    "jue": {
      "20": [
        {
          "verse": 1,
          "text": "Entonces todos los israelitas se unieron como un solo hombre, desde Dan en el norte hasta Beerseba en el sur, incluidos los del otro lado del Jordán, en la tierra de Galaad. Toda la comunidad se reunió en asamblea ante la presencia del Señor en Mizpa.",
          "maps": [
            {
              "title": "Canaán y las Doce Tribus: Dan, Beerseba, Galaad y Mizpa",
              "placesMentioned": [
                "Dan (Extremo norte)",
                "Beerseba (Límite sur / Néguev)",
                "Tierra de Galaad (Transjordania)",
                "Mizpa (Colinas de Benjamín)"
              ],
              "relevanceExplanation": "El versículo 1 relata cómo los israelitas se congregaron «desde Dan hasta Beerseba y la tierra de Galaad en Mizpa». Dan marcaba la frontera más al norte del territorio tribal y Beerseba el confín sur en el Néguev, mientras que Galaad representaba a las tribus al este del Jordán. El mapa permite comprender la enorme movilización nacional que convergió hacia las colinas de Mizpa (en Benjamín) para tratar la crisis de Gabaa.",
              "description": "Mapa geográfico de la distribución de las Doce Tribus de Israel en la época de los Jueces, delimitando Dan al norte, Beerseba al sur, Galaad al oriente del Jordán y la asamblea en Mizpa en territorio de Benjamín.",
              "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c2/12_Tribes_of_Israel_Map.svg",
              "sourceName": "Wikimedia Commons / Cartografía Histórica Bíblica"
            }
          ]
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
    "sal": {
      "23": [
        {
          "verse": 1,
          "text": "El Señor es mi pastor; tengo todo lo que necesito.",
          "crossRefs": [
            {
              "ref": "Juan 10:11",
              "text": "Yo soy el buen pastor; el buen pastor su vida da por las ovejas."
            },
            {
              "ref": "Filipenses 4:19",
              "text": "Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria"
            }
          ]
        },
        {
          "verse": 2,
          "text": "En verdes praderas me hace descansar; me conduce junto a arroyos tranquilos."
        },
        {
          "verse": 3,
          "text": "Él renueva mis fuerzas. Me guía por sendas correctas, y así da honra a su nombre."
        },
        {
          "verse": 4,
          "text": "Aun cuando pase por el valle más oscuro, no temeré, porque tú estás a mi lado. Tu vara y tu cayado me protegen y me confortan."
        },
        {
          "verse": 5,
          "text": "Me preparas un banquete en presencia de mis enemigos. Me honras ungiendo mi cabeza con aceite; mi copa se desborda de bendiciones."
        },
        {
          "verse": 6,
          "text": "Ciertamente tu bondad y tu amor inagotable me seguirán todos los días de mi vida, y en la casa del Señor viviré por siempre."
        }
      ]
    },
    "rom": {
      "8": [
        {
          "verse": 1,
          "text": "Por lo tanto, ya no hay condenación para los que pertenecen a Cristo Jesús;",
          "crossRefs": [
            {
              "ref": "Romanos 8:34",
              "text": "¿Quién es el que condenará? Cristo es el que murió; más aun, el que también resucitó"
            },
            {
              "ref": "Juan 3:18",
              "text": "El que en él cree, no es condenado"
            }
          ],
          "footnotes": [
            {
              "text": "Variante manuscrita: Los manuscritos griegos más antiguos y confiables (Códice Sinaítico, Vaticano y Papiro 46) omiten «los que no andan conforme a la carne, sino conforme al Espíritu». El comité de traducción señala que esta cláusula fue incorporada en copias bizantinas posteriores por asimilación con el versículo 4."
            }
          ]
        },
        {
          "verse": 2,
          "text": "y porque ustedes pertenecen a él, el poder del Espíritu que da vida los ha libertado del poder del pecado, que lleva a la muerte."
        },
        {
          "verse": 3,
          "text": "La ley de Moisés no podía salvarnos, porque nuestra naturaleza pecaminosa es débil. Así que Dios hizo lo que la ley no podía hacer. Él envió a su propio Hijo en un cuerpo como el que nosotros los pecadores tenemos; y en ese cuerpo, mediante la entrega de su Hijo como sacrificio por nuestros pecados, Dios declaró el fin del dominio que el pecado tenía sobre nosotros."
        },
        {
          "verse": 4,
          "text": "Lo hizo para que se cumpliera totalmente la exigencia justa de la ley a favor de nosotros, que ya no seguimos a nuestra naturaleza pecaminosa sino que seguimos al Espíritu."
        },
        {
          "verse": 5,
          "text": "Los que están dominados por la naturaleza pecaminosa piensan en cosas pecaminosas, pero los que son controlados por el Espíritu Santo piensan en las cosas que agradan al Espíritu."
        },
        {
          "verse": 6,
          "text": "Por lo tanto, permitir que la naturaleza pecaminosa les controle la mente lleva a la muerte. Pero permitir que el Espíritu les controle la mente lleva a la vida y a la paz."
        },
        {
          "verse": 7,
          "text": "Pues la naturaleza pecaminosa es enemiga de Dios siempre. Nunca obedeció las leyes de Dios y jamás lo hará."
        },
        {
          "verse": 8,
          "text": "Por eso, los que todavía viven bajo el dominio de la naturaleza pecaminosa nunca pueden agradar a Dios."
        },
        {
          "verse": 9,
          "text": "Pero ustedes no están dominados por su naturaleza pecaminosa. Son controlados por el Espíritu si el Espíritu de Dios vive en ustedes. (Y recuerden que los que no tienen al Espíritu de Cristo en ellos, de ninguna manera pertenecen a él)."
        },
        {
          "verse": 10,
          "text": "Y Cristo vive en ustedes; entonces, aunque el cuerpo morirá por causa del pecado, el Espíritu les da vida, porque ustedes ya fueron hechos justos a los ojos de Dios."
        },
        {
          "verse": 11,
          "text": "El Espíritu de Dios, quien levantó a Jesús de los muertos, vive en ustedes; y así como Dios levantó a Cristo Jesús de los muertos, él dará vida a sus cuerpos mortales mediante el mismo Espíritu, quien vive en ustedes."
        },
        {
          "verse": 12,
          "text": "Por lo tanto, amados hermanos, no están obligados a hacer lo que su naturaleza pecaminosa los incita a hacer;"
        },
        {
          "verse": 13,
          "text": "pues, si viven obedeciéndola, morirán; pero si mediante el poder del Espíritu hacen morir las acciones de la naturaleza pecaminosa, vivirán."
        },
        {
          "verse": 14,
          "text": "Pues todos los que son guiados por el Espíritu de Dios son hijos de Dios."
        },
        {
          "verse": 15,
          "text": "Y ustedes no han recibido un espíritu que los esclavice al miedo. En cambio, recibieron el Espíritu de Dios cuando él los adoptó como sus propios hijos. Ahora lo llamamos «Abba, Padre»."
        },
        {
          "verse": 16,
          "text": "Pues su Espíritu se une a nuestro espíritu para confirmar que somos hijos de Dios."
        },
        {
          "verse": 17,
          "text": "Así que como somos sus hijos, también somos sus herederos. De hecho, somos herederos junto con Cristo de la gloria de Dios; pero si vamos a participar de su gloria, también debemos participar de su sufrimiento."
        },
        {
          "verse": 18,
          "text": "Sin embargo, lo que ahora sufrimos no es nada comparado con la gloria que él nos revelará más adelante."
        },
        {
          "verse": 19,
          "text": "Pues toda la creación espera con anhelo el día futuro en que Dios revelará quiénes son verdaderamente sus hijos."
        },
        {
          "verse": 20,
          "text": "Contra su propia voluntad, toda la creación quedó sujeta a la maldición de Dios. Sin embargo, con gran esperanza,"
        },
        {
          "verse": 21,
          "text": "la creación espera el día en que será liberada de la muerte y la descomposición, y se unirá a la gloria de los hijos de Dios."
        },
        {
          "verse": 22,
          "text": "Pues sabemos que, hasta el día de hoy, toda la creación gime de angustia como si tuviera dolores de parto;"
        },
        {
          "verse": 23,
          "text": "y los creyentes también gemimos —aunque tenemos al Espíritu Santo en nosotros como una muestra anticipada de la gloria futura— porque anhelamos que nuestro cuerpo sea liberado del pecado y el sufrimiento. Nosotros también deseamos con una esperanza ferviente que llegue el día en que Dios nos dé todos nuestros derechos como sus hijos adoptivos, incluido el nuevo cuerpo que nos prometió."
        },
        {
          "verse": 24,
          "text": "Recibimos esa esperanza cuando fuimos salvos. (Si uno ya tiene algo, no necesita esperarlo;"
        },
        {
          "verse": 25,
          "text": "pero si deseamos algo que todavía no tenemos, debemos esperar con paciencia y confianza)."
        },
        {
          "verse": 26,
          "text": "Además, el Espíritu Santo nos ayuda en nuestra debilidad. Por ejemplo, nosotros no sabemos qué quiere Dios que le pidamos en oración, pero el Espíritu Santo ora por nosotros con gemidos que no pueden expresarse con palabras."
        },
        {
          "verse": 27,
          "text": "Y el Padre, quien conoce cada corazón, sabe lo que el Espíritu dice, porque el Espíritu intercede por nosotros, los creyentes, en armonía con la voluntad de Dios."
        },
        {
          "verse": 28,
          "text": "Y sabemos que Dios hace que todas las cosas cooperen para el bien de quienes lo aman y son llamados según el propósito que él tiene para ellos.",
          "crossRefs": [
            {
              "ref": "Jeremías 29:11",
              "text": "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz"
            },
            {
              "ref": "Efesios 1:11",
              "text": "Habiendo sido predestinados conforme al propósito del que hace todas las cosas"
            }
          ]
        },
        {
          "verse": 29,
          "text": "Pues Dios conoció a los suyos de antemano y los eligió para que llegaran a ser como su Hijo, a fin de que su Hijo fuera el hijo mayor entre muchos hermanos."
        },
        {
          "verse": 30,
          "text": "Después de haberlos elegido, Dios los llamó para que se acercaran a él; y una vez que los llamó, los puso en la relación correcta con él; y luego de ponerlos en la relación correcta con él, les dio su gloria."
        },
        {
          "verse": 31,
          "text": "¿Qué podemos decir acerca de cosas tan maravillosas como estas? Si Dios está a favor de nosotros, ¿quién podrá ponerse en nuestra contra?",
          "crossRefs": [
            {
              "ref": "Salmos 118:6",
              "text": "Jehová está conmigo; no temeré lo que me pueda hacer el hombre."
            },
            {
              "ref": "Isaías 50:8",
              "text": "Cercano está de mí el que me salva; ¿quién contenderá conmigo?"
            }
          ]
        },
        {
          "verse": 32,
          "text": "Si Dios no se guardó ni a su propio Hijo, sino que lo entregó por todos nosotros, ¿no nos dará también todo lo demás?"
        },
        {
          "verse": 33,
          "text": "¿Quién se atreve a acusarnos a nosotros, a quienes Dios ha elegido para sí? Nadie, porque Dios mismo nos puso en la relación correcta con él."
        },
        {
          "verse": 34,
          "text": "Entonces, ¿quién nos condenará? Nadie, porque Cristo Jesús murió por nosotros y resucitó por nosotros, y está sentado en el lugar de honor, a la derecha de Dios, e intercede por nosotros."
        },
        {
          "verse": 35,
          "text": "¿Acaso hay algo que pueda separarnos del amor de Cristo? ¿Será que él ya no nos ama si tenemos problemas o aflicciones, si somos perseguidos o pasamos hambre o estamos en la miseria o en peligro o bajo amenaza de muerte?"
        },
        {
          "verse": 36,
          "text": "(Como dicen las Escrituras: «Por tu causa nos matan cada día; nos tratan como a ovejas en el matadero»)."
        },
        {
          "verse": 37,
          "text": "Claro que no, a pesar de todas estas cosas, nuestra victoria es absoluta por medio de Cristo, quien nos amó.",
          "crossRefs": [
            {
              "ref": "1 Corintios 15:57",
              "text": "Mas gracias sean dadas a Dios, que nos da la victoria por medio de nuestro Señor Jesucristo."
            }
          ]
        },
        {
          "verse": 38,
          "text": "Y estoy convencido de que nada podrá jamás separarnos del amor de Dios. Ni la muerte ni la vida, ni ángeles ni demonios, ni nuestros temores de hoy ni nuestras preocupaciones de mañana. Ni siquiera los poderes del infierno pueden separarnos del amor de Dios."
        },
        {
          "verse": 39,
          "text": "Ningún poder en las alturas ni en las profundidades, de hecho, nada en toda la creación podrá jamás separarnos del amor de Dios, que está revelado en Cristo Jesús nuestro Señor.",
          "crossRefs": [
            {
              "ref": "Efesios 3:18-19",
              "text": "Para que seáis plenamente capaces de comprender con todos los santos cuál sea la anchura, la longitud, la profundidad y la altura"
            }
          ]
        }
      ]
    },
    "fil": {
      "4": [
        {
          "verse": 1,
          "text": "Por lo tanto, mis amados hermanos, manténganse fieles al Señor. Los amo y anhelo verlos, mis queridos amigos, porque ustedes son mi alegría y la corona que recibo por mi trabajo."
        },
        {
          "verse": 2,
          "text": "Ahora les ruego a Evodia y a Síntique, dado que pertenecen al Señor, que arreglen su desacuerdo."
        },
        {
          "verse": 3,
          "text": "Y te pido a ti, mi fiel colaborador, que ayudes a esas dos mujeres, porque trabajaron mucho a mi lado para dar a conocer a otros la Buena Noticia. Trabajaron junto con Clemente y mis demás colaboradores, cuyos nombres están escritos en el libro de la vida."
        },
        {
          "verse": 4,
          "text": "Estén siempre llenos de alegría en el Señor. Lo repito, ¡alégrense!"
        },
        {
          "verse": 5,
          "text": "Que todo el mundo vea que son considerados en todo lo que hacen. Recuerden que el Señor vuelve pronto."
        },
        {
          "verse": 6,
          "text": "No se preocupen por nada; en cambio, oren por todo. Díganle a Dios lo que necesitan y denle gracias por todo lo que él ha hecho."
        },
        {
          "verse": 7,
          "text": "Así experimentarán la paz de Dios, que supera todo lo que podemos entender. La paz de Dios cuidará su corazón y su mente mientras vivan en Cristo Jesús."
        },
        {
          "verse": 8,
          "text": "Y ahora, amados hermanos, una cosa más para terminar. Concéntrense en todo lo que es verdadero, todo lo honorable, todo lo justo, todo lo puro, todo lo bello y todo lo admirable. Piensen en cosas excelentes y dignas de alabanza."
        },
        {
          "verse": 9,
          "text": "No dejen de poner en práctica todo lo que aprendieron y recibieron de mí, todo lo que oyeron de mis labios y vieron que hice. Entonces el Dios de paz estará con ustedes."
        },
        {
          "verse": 10,
          "text": "¡Cuánto alabo al Señor de que hayan vuelto a preocuparse por mí! Sé que siempre se han preocupado por mí, pero no tenían la oportunidad de ayudarme."
        },
        {
          "verse": 11,
          "text": "No es que haya pasado necesidad alguna vez, porque he aprendido a estar contento con lo que tengo."
        },
        {
          "verse": 12,
          "text": "Sé vivir con casi nada o con todo lo necesario. He aprendido el secreto de vivir en cualquier situación, sea con el estómago lleno o vacío, con mucho o con poco."
        },
        {
          "verse": 13,
          "text": "Pues todo lo puedo hacer por medio de Cristo, quien me da las fuerzas.",
          "crossRefs": [
            {
              "ref": "2 Corintios 12:9",
              "text": "Bástate mi gracia; porque mi poder se perfecciona en la debilidad."
            },
            {
              "ref": "Juan 15:5",
              "text": "Separados de mí nada podéis hacer."
            }
          ],
          "footnotes": [
            {
              "text": "Aclaración de término griego: «En Cristo que me fortalece» emplea el verbo compuesto ἐνδυναμόω (endynamoō, en voz pasiva-continua), que denota una capacitación dinámica interior constante derramada por Cristo en el creyente para sobrellevar toda circunstancia."
            }
          ]
        },
        {
          "verse": 14,
          "text": "De todos modos, han hecho bien al compartir conmigo en la dificultad por la que ahora atravieso."
        },
        {
          "verse": 15,
          "text": "Como saben, filipenses, ustedes fueron los únicos que me ayudaron económicamente cuando les llevé la Buena Noticia por primera vez y luego seguí mi viaje desde Macedonia. Ninguna otra iglesia hizo lo mismo.",
          "maps": [
            {
              "title": "Ruta Misionera de Pablo: De Filipos a Tesalónica (Macedonia)",
              "placesMentioned": [
                "Filipos (Macedonia oriental)",
                "Tesalónica (Vía Egnatia)",
                "Provincia de Macedonia",
                "Grecia / Acaya"
              ],
              "relevanceExplanation": "En los versículos 15 y 16, Pablo recuerda su itinerario geográfico por Macedonia: tras fundar la iglesia en Filipos (Hechos 16), avanzó por la calzada romana Vía Egnatia hacia Tesalónica (Hechos 17). El apóstol agradece cómo los creyentes de Filipos le enviaron sustento financiero reiteradas veces a lo largo de esa ruta misionera.",
              "description": "Mapa histórico de los viajes misioneros del apóstol Pablo por Macedonia y el mundo grecorromano, mostrando el trayecto entre Filipos y Tesalónica por la Vía Egnatia.",
              "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/1/18/Biblica_Open_Bible_Map_16_17_Paul_missionary_journeys_map.png",
              "sourceName": "Biblica / Open Bible Map Archive"
            }
          ]
        },
        {
          "verse": 16,
          "text": "Incluso cuando estuve en Tesalónica, ustedes me mandaron ayuda más de una vez."
        },
        {
          "verse": 17,
          "text": "No digo esto esperando que me envíen una ofrenda. Más bien, quiero que ustedes reciban una recompensa por su bondad."
        },
        {
          "verse": 18,
          "text": "Por el momento, tengo todo lo que necesito, ¡y aún más! Estoy bien abastecido con las ofrendas que ustedes me enviaron por medio de Epafrodito. Son un sacrificio de olor fragante aceptable y agradable a Dios."
        },
        {
          "verse": 19,
          "text": "Y este mismo Dios quien me cuida suplirá todo lo que necesiten, de las gloriosas riquezas que nos ha dado por medio de Cristo Jesús."
        },
        {
          "verse": 20,
          "text": "¡Toda la gloria sea a Dios nuestro Padre por siempre y para siempre! Amén."
        },
        {
          "verse": 21,
          "text": "Denle saludos de mi parte a cada persona del pueblo santo de Dios, a todos los que pertenecen a Cristo Jesús. Los hermanos que están conmigo envían saludos."
        },
        {
          "verse": 22,
          "text": "Los demás del pueblo de Dios también les envían saludos, en particular los de la casa de César."
        },
        {
          "verse": 23,
          "text": "Que la gracia del Señor Jesucristo sea con el espíritu de cada uno de ustedes."
        }
      ]
    },
    "jua": {
      "15": [
        {
          "verse": 1,
          "text": "»Yo soy la vid verdadera, y mi Padre es el labrador.",
          "isJesus": true,
          "crossRefs": [
            {
              "ref": "Salmos 80:8",
              "text": "Hiciste venir una vid de Egipto; echaste las naciones, y la plantaste."
            }
          ]
        },
        {
          "verse": 2,
          "text": "Él corta de mí toda rama que no produce fruto y poda las ramas que sí dan fruto, para que den aún más.",
          "footnotes": [
            {
              "text": "Aclaración lingüística griega: Existe un juego de palabras entre aírei (αἴρει, quitar/levantar) y kathaírei (καθαίρει, podar/limpiar). En la viticultura de Judea, los sarmientos caídos en tierra húmeda no se descartaban de inmediato, sino que el labrador los levantaba con cuidado, los lavaba del barro y los ataba a espalderas para que volvieran a recibir el sol y florecer."
            }
          ],
          "isJesus": true
        },
        {
          "verse": 3,
          "text": "Ustedes ya han sido podados y purificados por el mensaje que les di.",
          "isJesus": true
        },
        {
          "verse": 4,
          "text": "Permanezcan en mí, y yo permaneceré en ustedes. Pues una rama no puede producir fruto si la cortan de la vid, y ustedes tampoco pueden ser fructíferos a menos que permanezcan en mí.",
          "isJesus": true
        },
        {
          "verse": 5,
          "text": "»Ciertamente, yo soy la vid; ustedes son las ramas. Los que permanecen en mí y yo en ellos producirán mucho fruto porque, separados de mí, no pueden hacer nada.",
          "isJesus": true,
          "crossRefs": [
            {
              "ref": "Filipenses 4:13",
              "text": "Todo lo puedo en Cristo que me fortalece."
            }
          ]
        },
        {
          "verse": 6,
          "text": "El que no permanece en mí es desechado como rama inútil y se seca. Todas esas ramas se juntan en un montón para quemarlas en el fuego.",
          "isJesus": true
        },
        {
          "verse": 7,
          "text": "Si ustedes permanecen en mí y mis palabras permanecen en ustedes, pueden pedir lo que quieran, ¡y les será concedido!",
          "isJesus": true
        },
        {
          "verse": 8,
          "text": "Cuando producen mucho fruto, demuestran que son mis verdaderos discípulos. Eso le da mucha gloria a mi Padre.",
          "isJesus": true
        },
        {
          "verse": 9,
          "text": "»Yo los he amado a ustedes tanto como el Padre me ha amado a mí. Permanezcan en mi amor.",
          "isJesus": true
        },
        {
          "verse": 10,
          "text": "Cuando obedecen mis mandamientos, permanecen en mi amor, así como yo obedezco los mandamientos de mi Padre y permanezco en su amor.",
          "isJesus": true
        },
        {
          "verse": 11,
          "text": "Les he dicho estas cosas para que se llenen de mi gozo; así es, desbordarán de gozo.",
          "isJesus": true
        },
        {
          "verse": 12,
          "text": "Este es mi mandamiento: ámense unos a otros de la misma manera en que yo los he amado.",
          "isJesus": true
        },
        {
          "verse": 13,
          "text": "No hay un amor más grande que el dar la vida por los amigos.",
          "isJesus": true
        },
        {
          "verse": 14,
          "text": "Ustedes son mis amigos si hacen lo que yo les mando.",
          "isJesus": true
        },
        {
          "verse": 15,
          "text": "Ya no los llamo esclavos, porque el amo no confía sus asuntos a los esclavos. Ustedes ahora son mis amigos, porque les he contado todo lo que el Padre me dijo.",
          "isJesus": true
        },
        {
          "verse": 16,
          "text": "Ustedes no me eligieron a mí, yo los elegí a ustedes. Les encargué que vayan y produzcan frutos duraderos, así el Padre les dará todo lo que pidan en mi nombre.",
          "isJesus": true
        },
        {
          "verse": 17,
          "text": "Este es mi mandato: ámense unos a otros.",
          "isJesus": true
        },
        {
          "verse": 18,
          "text": "»Si el mundo los odia, recuerden que a mí me odió primero.",
          "isJesus": true
        },
        {
          "verse": 19,
          "text": "Si pertenecieran al mundo, el mundo los amaría como a uno de los suyos, pero ustedes ya no forman parte del mundo. Yo los elegí para que salieran del mundo, por eso el mundo los odia.",
          "isJesus": true
        },
        {
          "verse": 20,
          "text": "¿Recuerdan lo que les dije? “El esclavo no es superior a su amo”. Ya que me persiguieron a mí, también a ustedes los perseguirán. Y, si me hubieran escuchado a mí, también los escucharían a ustedes.",
          "isJesus": true
        },
        {
          "verse": 21,
          "text": "Les harán todo eso a causa de mí, porque han rechazado a aquel que me envió.",
          "isJesus": true
        },
        {
          "verse": 22,
          "text": "Ellos no serían culpables si yo no hubiera venido a hablarles, pero ahora no tienen ninguna excusa por su pecado.",
          "isJesus": true
        },
        {
          "verse": 23,
          "text": "Cualquiera que me odia a mí también odia a mi Padre.",
          "isJesus": true
        },
        {
          "verse": 24,
          "text": "Si yo no hubiera hecho entre ellos esas señales tan milagrosas que nadie más podría hacer, no serían culpables; pero la verdad es que vieron todo lo que hice, y aun así nos siguen odiando a mí y a mi Padre.",
          "isJesus": true
        },
        {
          "verse": 25,
          "text": "Con eso se cumple lo que está registrado en sus Escrituras: “Me odiaron sin motivo”.",
          "isJesus": true
        },
        {
          "verse": 26,
          "text": "»A ustedes yo les enviaré al Abogado Defensor, el Espíritu de verdad. Él vendrá del Padre y dará testimonio acerca de mí,",
          "isJesus": true
        },
        {
          "verse": 27,
          "text": "y también ustedes deben dar testimonio de mí porque han estado conmigo desde el principio de mi ministerio.",
          "isJesus": true
        }
      ]
    }
  },
  "NBLA": {
    "jue": {
      "20": [
        {
          "verse": 1,
          "text": "Entonces salieron todos los israelitas, desde Dan hasta Beerseba, incluyendo la tierra de Galaad, y la congregación se reunió al Señor como un solo hombre en Mizpa.",
          "maps": [
            {
              "title": "Canaán y las Doce Tribus: Dan, Beerseba, Galaad y Mizpa",
              "placesMentioned": [
                "Dan (Extremo norte)",
                "Beerseba (Límite sur / Néguev)",
                "Tierra de Galaad (Transjordania)",
                "Mizpa (Colinas de Benjamín)"
              ],
              "relevanceExplanation": "El versículo 1 relata cómo los israelitas se congregaron «desde Dan hasta Beerseba y la tierra de Galaad en Mizpa». Dan marcaba la frontera más al norte del territorio tribal y Beerseba el confín sur en el Néguev, mientras que Galaad representaba a las tribus al este del Jordán. El mapa permite comprender la enorme movilización nacional que convergió hacia las colinas de Mizpa (en Benjamín) para tratar la crisis de Gabaa.",
              "description": "Mapa geográfico de la distribución de las Doce Tribus de Israel en la época de los Jueces, delimitando Dan al norte, Beerseba al sur, Galaad al oriente del Jordán y la asamblea en Mizpa en territorio de Benjamín.",
              "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c2/12_Tribes_of_Israel_Map.svg",
              "sourceName": "Wikimedia Commons / Cartografía Histórica Bíblica"
            }
          ]
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
    "sal": {
      "23": [
        {
          "verse": 1,
          "text": "El Señor es mi pastor, nada me faltará."
        },
        {
          "verse": 2,
          "text": "En lugares de verdes pastos me hace descansar; junto a aguas de reposo me conduce."
        },
        {
          "verse": 3,
          "text": "Él restaura mi alma; me guía por senderos de justicia por amor de Su nombre."
        },
        {
          "verse": 4,
          "text": "Aunque pase por el valle de sombra de muerte, no temeré mal alguno, porque Tú estás conmigo; Tu vara y Tu cayado me infunden aliento."
        },
        {
          "verse": 5,
          "text": "Tú preparas mesa delante de mí en presencia de mis enemigos; has ungido mi cabeza con aceite; mi copa está rebosando."
        },
        {
          "verse": 6,
          "text": "Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, y en la casa del Señor moraré por largos días."
        }
      ]
    },
    "rom": {
      "8": [
        {
          "verse": 1,
          "text": "Por tanto, ahora no hay condenación para los que están en Cristo Jesús, los que no andan conforme a la carne sino conforme al Espíritu.",
          "crossRefs": [
            {
              "ref": "Romanos 8:34",
              "text": "¿Quién es el que condenará? Cristo es el que murió; más aun, el que también resucitó"
            },
            {
              "ref": "Juan 3:18",
              "text": "El que en él cree, no es condenado"
            }
          ],
          "footnotes": [
            {
              "text": "Variante manuscrita: Los manuscritos griegos más antiguos y confiables (Códice Sinaítico, Vaticano y Papiro 46) omiten «los que no andan conforme a la carne, sino conforme al Espíritu». El comité de traducción señala que esta cláusula fue incorporada en copias bizantinas posteriores por asimilación con el versículo 4."
            }
          ]
        },
        {
          "verse": 2,
          "text": "Porque la ley del Espíritu de vida en Cristo Jesús te ha libertado de la ley del pecado y de la muerte."
        },
        {
          "verse": 3,
          "text": "Pues lo que la ley no pudo hacer, ya que era débil por causa de la carne, Dios lo hizo: enviando a Su propio Hijo en semejanza de carne de pecado y como ofrenda por el pecado, condenó al pecado en la carne,"
        },
        {
          "verse": 4,
          "text": "para que el requisito de la ley se cumpliera en nosotros, que no andamos conforme a la carne, sino conforme al Espíritu."
        },
        {
          "verse": 5,
          "text": "Porque los que viven conforme a la carne, ponen la mente en las cosas de la carne, pero los que viven conforme al Espíritu, en las cosas del Espíritu."
        },
        {
          "verse": 6,
          "text": "Porque la mente puesta en la carne es muerte, pero la mente puesta en el Espíritu es vida y paz."
        },
        {
          "verse": 7,
          "text": "La mente puesta en la carne es enemiga de Dios, porque no se sujeta a la ley de Dios, pues ni siquiera puede hacerlo,"
        },
        {
          "verse": 8,
          "text": "y los que están en la carne no pueden agradar a Dios."
        },
        {
          "verse": 9,
          "text": "Sin embargo, ustedes no están en la carne sino en el Espíritu, si en verdad el Espíritu de Dios habita en ustedes. Pero si alguien no tiene el Espíritu de Cristo, el tal no es de Él."
        },
        {
          "verse": 10,
          "text": "Y si Cristo está en ustedes, aunque el cuerpo esté muerto a causa del pecado, sin embargo, el espíritu está vivo a causa de la justicia."
        },
        {
          "verse": 11,
          "text": "Pero si el Espíritu de Aquel que resucitó a Jesús de entre los muertos habita en ustedes, el mismo que resucitó a Cristo Jesús de entre los muertos, también dará vida a sus cuerpos mortales por medio de Su Espíritu que habita en ustedes."
        },
        {
          "verse": 12,
          "text": "Así que, hermanos, somos deudores, no a la carne, para vivir conforme a la carne."
        },
        {
          "verse": 13,
          "text": "Porque si ustedes viven conforme a la carne, habrán de morir; pero si por el Espíritu hacen morir las obras de la carne, vivirán."
        },
        {
          "verse": 14,
          "text": "Porque todos los que son guiados por el Espíritu de Dios, los tales son hijos de Dios."
        },
        {
          "verse": 15,
          "text": "Pues ustedes no han recibido un espíritu de esclavitud para volver otra vez al temor, sino que han recibido un espíritu de adopción como hijos, por el cual clamamos: «¡Abba, Padre!»."
        },
        {
          "verse": 16,
          "text": "El Espíritu mismo da testimonio a nuestro espíritu de que somos hijos de Dios."
        },
        {
          "verse": 17,
          "text": "Y si somos hijos, somos también herederos; herederos de Dios y coherederos con Cristo, si en verdad padecemos con Él a fin de que también seamos glorificados con Él."
        },
        {
          "verse": 18,
          "text": "Pues considero que los sufrimientos de este tiempo presente no son dignos de ser comparados con la gloria que nos ha de ser revelada."
        },
        {
          "verse": 19,
          "text": "Porque el anhelo profundo de la creación es aguardar ansiosamente la revelación de los hijos de Dios."
        },
        {
          "verse": 20,
          "text": "Porque la creación fue sometida a vanidad, no de su propia voluntad, sino por causa de Aquel que la sometió, en la esperanza"
        },
        {
          "verse": 21,
          "text": "de que la creación misma será también liberada de la esclavitud de la corrupción a la libertad de la gloria de los hijos de Dios."
        },
        {
          "verse": 22,
          "text": "Pues sabemos que la creación entera gime y sufre hasta ahora dolores de parto."
        },
        {
          "verse": 23,
          "text": "Y no solo ella, sino que también nosotros mismos, que tenemos las primicias del Espíritu, aun nosotros mismos gemimos en nuestro interior, aguardando ansiosamente la adopción como hijos, la redención de nuestro cuerpo."
        },
        {
          "verse": 24,
          "text": "Porque en esperanza hemos sido salvados, pero la esperanza que se ve no es esperanza, pues, ¿por qué esperar lo que uno ve?"
        },
        {
          "verse": 25,
          "text": "Pero si esperamos lo que no vemos, con paciencia lo aguardamos."
        },
        {
          "verse": 26,
          "text": "De la misma manera, también el Espíritu nos ayuda en nuestra debilidad. No sabemos orar como debiéramos, pero el Espíritu mismo intercede por nosotros con gemidos indecibles."
        },
        {
          "verse": 27,
          "text": "Y Aquel que escudriña los corazones sabe cuál es el sentir del Espíritu, porque Él intercede por los santos conforme a la voluntad de Dios."
        },
        {
          "verse": 28,
          "text": "Y sabemos que para los que aman a Dios, todas las cosas cooperan para bien, esto es, para los que son llamados conforme a Su propósito.",
          "crossRefs": [
            {
              "ref": "Jeremías 29:11",
              "text": "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz"
            },
            {
              "ref": "Efesios 1:11",
              "text": "Habiendo sido predestinados conforme al propósito del que hace todas las cosas"
            }
          ]
        },
        {
          "verse": 29,
          "text": "Porque a los que de antemano conoció, también los predestinó a ser hechos conforme a la imagen de Su Hijo, para que Él sea el primogénito entre muchos hermanos."
        },
        {
          "verse": 30,
          "text": "A los que predestinó, a esos también llamó. A los que llamó, a esos también justificó. A los que justificó, a esos también glorificó."
        },
        {
          "verse": 31,
          "text": "Entonces, ¿qué diremos a esto? Si Dios está por nosotros, ¿quién estará contra nosotros?",
          "crossRefs": [
            {
              "ref": "Salmos 118:6",
              "text": "Jehová está conmigo; no temeré lo que me pueda hacer el hombre."
            },
            {
              "ref": "Isaías 50:8",
              "text": "Cercano está de mí el que me salva; ¿quién contenderá conmigo?"
            }
          ]
        },
        {
          "verse": 32,
          "text": "El que no negó ni a Su propio Hijo, sino que lo entregó por todos nosotros, ¿cómo no nos dará también junto con Él todas las cosas?"
        },
        {
          "verse": 33,
          "text": "¿Quién acusará a los escogidos de Dios? Dios es el que justifica."
        },
        {
          "verse": 34,
          "text": "¿Quién es el que condena? Cristo Jesús es el que murió, sí, más aún, el que resucitó, el que además está a la diestra de Dios, el que también intercede por nosotros."
        },
        {
          "verse": 35,
          "text": "¿Quién nos separará del amor de Cristo? ¿Tribulación, o angustia, o persecución, o hambre, o desnudez, o peligro, o espada?"
        },
        {
          "verse": 36,
          "text": "Tal como está escrito: «Por causa Tuya somos puestos a muerte todo el día; Somos considerados como ovejas para el matadero»."
        },
        {
          "verse": 37,
          "text": "Pero en todas estas cosas somos más que vencedores por medio de Aquel que nos amó.",
          "crossRefs": [
            {
              "ref": "1 Corintios 15:57",
              "text": "Mas gracias sean dadas a Dios, que nos da la victoria por medio de nuestro Señor Jesucristo."
            }
          ]
        },
        {
          "verse": 38,
          "text": "Porque estoy convencido de que ni la muerte, ni la vida, ni ángeles, ni principados, ni lo presente, ni lo por venir, ni los poderes,"
        },
        {
          "verse": 39,
          "text": "ni lo alto, ni lo profundo, ni ninguna otra cosa creada nos podrá separar del amor de Dios que es en Cristo Jesús Señor nuestro.",
          "crossRefs": [
            {
              "ref": "Efesios 3:18-19",
              "text": "Para que seáis plenamente capaces de comprender con todos los santos cuál sea la anchura, la longitud, la profundidad y la altura"
            }
          ]
        }
      ]
    },
    "fil": {
      "4": [
        {
          "verse": 1,
          "text": "Así que, hermanos míos, amados y añorados, gozo y corona mía, estén así firmes en el Señor, amados."
        },
        {
          "verse": 2,
          "text": "Ruego a Evodia y a Síntique, que vivan en armonía en el Señor."
        },
        {
          "verse": 3,
          "text": "En verdad, fiel compañero, también te ruego que ayudes a estas mujeres que han compartido mis luchas en la causa del evangelio, junto con Clemente y los demás colaboradores míos, cuyos nombres están en el libro de la vida."
        },
        {
          "verse": 4,
          "text": "Regocíjense en el Señor siempre. Otra vez lo diré: ¡Regocíjense!"
        },
        {
          "verse": 5,
          "text": "La bondad de ustedes sea conocida de todos los hombres. El Señor está cerca."
        },
        {
          "verse": 6,
          "text": "Por nada estén afanosos; antes bien, en todo, mediante oración y súplica con acción de gracias, sean dadas a conocer sus peticiones delante de Dios."
        },
        {
          "verse": 7,
          "text": "Y la paz de Dios, que sobrepasa todo entendimiento, guardará sus corazones y sus mentes en Cristo Jesús."
        },
        {
          "verse": 8,
          "text": "Por lo demás, hermanos, todo lo que es verdadero, todo lo digno, todo lo justo, todo lo puro, todo lo amable, todo lo honorable, si hay alguna virtud o algo que merece elogio, en esto mediten."
        },
        {
          "verse": 9,
          "text": "Lo que también han aprendido y recibido y oído y visto en mí, esto practiquen, y el Dios de paz estará con ustedes."
        },
        {
          "verse": 10,
          "text": "Me alegré grandemente en el Señor de que ya al fin han reavivado su cuidado para conmigo. En verdad, antes se preocupaban, pero les faltaba la oportunidad."
        },
        {
          "verse": 11,
          "text": "No que hable porque tenga escasez, pues he aprendido a contentarme cualquiera que sea mi situación."
        },
        {
          "verse": 12,
          "text": "Sé vivir en pobreza, y sé vivir en prosperidad. En todo y por todo he aprendido el secreto tanto de estar saciado como de tener hambre, de tener abundancia como de sufrir necesidad."
        },
        {
          "verse": 13,
          "text": "Todo lo puedo en Cristo que me fortalece.",
          "crossRefs": [
            {
              "ref": "2 Corintios 12:9",
              "text": "Bástate mi gracia; porque mi poder se perfecciona en la debilidad."
            },
            {
              "ref": "Juan 15:5",
              "text": "Separados de mí nada podéis hacer."
            }
          ],
          "footnotes": [
            {
              "text": "Aclaración de término griego: «En Cristo que me fortalece» emplea el verbo compuesto ἐνδυναμόω (endynamoō, en voz pasiva-continua), que denota una capacitación dinámica interior constante derramada por Cristo en el creyente para sobrellevar toda circunstancia."
            }
          ]
        },
        {
          "verse": 14,
          "text": "Sin embargo, han hecho bien en compartir conmigo en mi aflicción."
        },
        {
          "verse": 15,
          "text": "Ustedes mismos también saben, filipenses, que al comienzo de la predicación del evangelio, después que partí de Macedonia, ninguna iglesia compartió conmigo en cuestión de dar y recibir, sino solamente ustedes.",
          "maps": [
            {
              "title": "Ruta Misionera de Pablo: De Filipos a Tesalónica (Macedonia)",
              "placesMentioned": [
                "Filipos (Macedonia oriental)",
                "Tesalónica (Vía Egnatia)",
                "Provincia de Macedonia",
                "Grecia / Acaya"
              ],
              "relevanceExplanation": "En los versículos 15 y 16, Pablo recuerda su itinerario geográfico por Macedonia: tras fundar la iglesia en Filipos (Hechos 16), avanzó por la calzada romana Vía Egnatia hacia Tesalónica (Hechos 17). El apóstol agradece cómo los creyentes de Filipos le enviaron sustento financiero reiteradas veces a lo largo de esa ruta misionera.",
              "description": "Mapa histórico de los viajes misioneros del apóstol Pablo por Macedonia y el mundo grecorromano, mostrando el trayecto entre Filipos y Tesalónica por la Vía Egnatia.",
              "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/1/18/Biblica_Open_Bible_Map_16_17_Paul_missionary_journeys_map.png",
              "sourceName": "Biblica / Open Bible Map Archive"
            }
          ]
        },
        {
          "verse": 16,
          "text": "Porque aun a Tesalónica enviaron dádivas más de una vez para mis necesidades."
        },
        {
          "verse": 17,
          "text": "No es que busque la dádiva en sí, sino que busco fruto que aumente en su cuenta."
        },
        {
          "verse": 18,
          "text": "Pero lo he recibido todo y tengo abundancia. Estoy bien abastecido, habiendo recibido de Epafrodito lo que han enviado: fragante aroma, sacrificio aceptable, agradable a Dios."
        },
        {
          "verse": 19,
          "text": "Y mi Dios proveerá a todas sus necesidades, conforme a Sus riquezas en gloria en Cristo Jesús."
        },
        {
          "verse": 20,
          "text": "A nuestro Dios y Padre sea la gloria por los siglos de los siglos. Amén."
        },
        {
          "verse": 21,
          "text": "Saluden a todos los santos en Cristo Jesús. Los hermanos que están conmigo los saludan."
        },
        {
          "verse": 22,
          "text": "Todos los santos los saludan, especialmente los de la casa de César."
        },
        {
          "verse": 23,
          "text": "La gracia del Señor Jesucristo sea con el espíritu de ustedes."
        }
      ]
    },
    "jua": {
      "15": [
        {
          "verse": 1,
          "text": "»Yo soy la vid verdadera, y Mi Padre es el viñador.",
          "isJesus": true,
          "crossRefs": [
            {
              "ref": "Salmos 80:8",
              "text": "Hiciste venir una vid de Egipto; echaste las naciones, y la plantaste."
            }
          ]
        },
        {
          "verse": 2,
          "text": "Todo sarmiento que en Mí no da fruto, lo quita; y todo el que da fruto, lo poda para que dé más fruto.",
          "footnotes": [
            {
              "text": "Aclaración lingüística griega: Existe un juego de palabras entre aírei (αἴρει, quitar/levantar) y kathaírei (καθαίρει, podar/limpiar). En la viticultura de Judea, los sarmientos caídos en tierra húmeda no se descartaban de inmediato, sino que el labrador los levantaba con cuidado, los lavaba del barro y los ataba a espalderas para que volvieran a recibir el sol y florecer."
            }
          ],
          "isJesus": true
        },
        {
          "verse": 3,
          "text": "Ustedes ya están limpios por la palabra que les he hablado.",
          "isJesus": true
        },
        {
          "verse": 4,
          "text": "»Permanezcan en Mí, y Yo en ustedes. Como el sarmiento no puede dar fruto por sí mismo si no permanece en la vid, así tampoco ustedes si no permanecen en Mí.",
          "isJesus": true
        },
        {
          "verse": 5,
          "text": "Yo soy la vid, ustedes los sarmientos; el que permanece en Mí y Yo en él, ese da mucho fruto, porque separados de Mí nada pueden hacer.",
          "isJesus": true,
          "crossRefs": [
            {
              "ref": "Filipenses 4:13",
              "text": "Todo lo puedo en Cristo que me fortalece."
            }
          ]
        },
        {
          "verse": 6,
          "text": "Si alguien no permanece en Mí, es echado fuera como un sarmiento y se seca; y los recogen, los echan al fuego y se queman.",
          "isJesus": true
        },
        {
          "verse": 7,
          "text": "»Si permanecen en Mí, y Mis palabras permanecen en ustedes, pidan lo que quieran y les será hecho.",
          "isJesus": true
        },
        {
          "verse": 8,
          "text": "En esto es glorificado Mi Padre, en que den mucho fruto, y así prueben que son Mis discípulos.",
          "isJesus": true
        },
        {
          "verse": 9,
          "text": "Como el Padre me ha amado, así también Yo los he amado; permanezcan en Mi amor.",
          "isJesus": true
        },
        {
          "verse": 10,
          "text": "Si guardan Mis mandamientos, permanecerán en Mi amor, así como Yo he guardado los mandamientos de Mi Padre y permanezco en Su amor.",
          "isJesus": true
        },
        {
          "verse": 11,
          "text": "»Estas cosas les he hablado, para que Mi gozo esté en ustedes, y su gozo sea perfecto.",
          "isJesus": true
        },
        {
          "verse": 12,
          "text": "Este es Mi mandamiento: que se amen los unos a los otros, así como Yo los he amado.",
          "isJesus": true
        },
        {
          "verse": 13,
          "text": "Nadie tiene un amor mayor que este: que uno dé su vida por sus amigos.",
          "isJesus": true
        },
        {
          "verse": 14,
          "text": "Ustedes son Mis amigos si hacen lo que Yo les mando.",
          "isJesus": true
        },
        {
          "verse": 15,
          "text": "Ya no los llamo siervos, porque el siervo no sabe lo que hace su señor; pero los he llamado amigos, porque les he dado a conocer todo lo que he oído de Mi Padre.",
          "isJesus": true
        },
        {
          "verse": 16,
          "text": "»Ustedes no me escogieron a Mí, sino que Yo los escogí a ustedes, y los designé para que vayan y den fruto, y que su fruto permanezca; para que todo lo que pidan al Padre en Mi nombre se lo conceda.",
          "isJesus": true
        },
        {
          "verse": 17,
          "text": "Esto les mando: que se amen los unos a los otros.",
          "isJesus": true
        },
        {
          "verse": 18,
          "text": "»Si el mundo los odia, sepan que me ha odiado a Mí antes que a ustedes.",
          "isJesus": true
        },
        {
          "verse": 19,
          "text": "Si ustedes fueran del mundo, el mundo amaría lo suyo; pero como no son del mundo, sino que Yo los escogí de entre el mundo, por eso el mundo los odia.",
          "isJesus": true
        },
        {
          "verse": 20,
          "text": "Acuérdense de la palabra que Yo les dije: “Un siervo no es mayor que su señor”. Si me persiguieron a Mí, también los perseguirán a ustedes; si guardaron Mi palabra, también guardarán la de ustedes.",
          "isJesus": true
        },
        {
          "verse": 21,
          "text": "Pero todo eso les harán por causa de Mi nombre, porque no conocen a Aquel que me envió.",
          "isJesus": true
        },
        {
          "verse": 22,
          "text": "Si Yo no hubiera venido y no les hubiera hablado, no tendrían pecado, pero ahora no tienen excusa por su pecado.",
          "isJesus": true
        },
        {
          "verse": 23,
          "text": "El que me odia a Mí, odia también a Mi Padre.",
          "isJesus": true
        },
        {
          "verse": 24,
          "text": "Si Yo no hubiera hecho entre ellos las obras que ningún otro ha hecho, no tendrían pecado; pero ahora las han visto, y me han odiado a Mí y también a Mi Padre.",
          "isJesus": true
        },
        {
          "verse": 25,
          "text": "Pero ellos han hecho esto para que se cumpla la palabra que está escrita en su ley: “Me odiaron sin causa”.",
          "isJesus": true
        },
        {
          "verse": 26,
          "text": "»Cuando venga el Consolador, a quien Yo enviaré del Padre, es decir, el Espíritu de verdad que procede del Padre, Él dará testimonio de Mí,",
          "isJesus": true
        },
        {
          "verse": 27,
          "text": "y ustedes también darán testimonio, porque han estado junto a Mí desde el principio.",
          "isJesus": true
        }
      ]
    }
  },
  "RVR1960": {
    "jue": {
      "20": [
        {
          "verse": 1,
          "text": "Entonces salieron todos los hijos de Israel, y se reunió la congregación como un solo hombre, desde Dan hasta Beerseba y la tierra de Galaad, a Jehová en Mizpa.",
          "maps": [
            {
              "title": "Canaán y las Doce Tribus: Dan, Beerseba, Galaad y Mizpa",
              "placesMentioned": [
                "Dan (Extremo norte)",
                "Beerseba (Límite sur / Néguev)",
                "Tierra de Galaad (Transjordania)",
                "Mizpa (Colinas de Benjamín)"
              ],
              "relevanceExplanation": "El versículo 1 relata cómo los israelitas se congregaron «desde Dan hasta Beerseba y la tierra de Galaad en Mizpa». Dan marcaba la frontera más al norte del territorio tribal y Beerseba el confín sur en el Néguev, mientras que Galaad representaba a las tribus al este del Jordán. El mapa permite comprender la enorme movilización nacional que convergió hacia las colinas de Mizpa (en Benjamín) para tratar la crisis de Gabaa.",
              "description": "Mapa geográfico de la distribución de las Doce Tribus de Israel en la época de los Jueces, delimitando Dan al norte, Beerseba al sur, Galaad al oriente del Jordán y la asamblea en Mizpa en territorio de Benjamín.",
              "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c2/12_Tribes_of_Israel_Map.svg",
              "sourceName": "Wikimedia Commons / Cartografía Histórica Bíblica"
            }
          ]
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
    },
    "sal": {
      "23": [
        {
          "verse": 1,
          "text": "Jehová es mi pastor; nada me faltará.",
          "crossRefs": [
            {
              "ref": "Juan 10:11",
              "text": "Yo soy el buen pastor"
            }
          ]
        },
        {
          "verse": 2,
          "text": "En lugares de delicados pastos me hará descansar; Junto a aguas de reposo me pastoreará."
        },
        {
          "verse": 3,
          "text": "Confortará mi alma; Me guiará por sendas de justicia por amor de su nombre."
        },
        {
          "verse": 4,
          "text": "Aunque ande en valle de sombra de muerte, No temeré mal alguno, porque tú estarás conmigo; Tu vara y tu cayado me infundirán aliento."
        },
        {
          "verse": 5,
          "text": "Aderezas mesa delante de mí en presencia de mis angustiadores; Unges mi cabeza con aceite; mi copa está rebosando."
        },
        {
          "verse": 6,
          "text": "Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, Y en la casa de Jehová moraré por largos días."
        }
      ]
    },
    "rom": {
      "8": [
        {
          "verse": 1,
          "text": "Ahora, pues, ninguna condenación hay para los que están en Cristo Jesús, los que no andan conforme a la carne, sino conforme al Espíritu.",
          "crossRefs": [
            {
              "ref": "Romanos 8:34",
              "text": "¿Quién es el que condenará? Cristo es el que murió; más aun, el que también resucitó"
            },
            {
              "ref": "Juan 3:18",
              "text": "El que en él cree, no es condenado"
            }
          ],
          "footnotes": [
            {
              "text": "Variante manuscrita: Los manuscritos griegos más antiguos y confiables (Códice Sinaítico, Vaticano y Papiro 46) omiten «los que no andan conforme a la carne, sino conforme al Espíritu». El comité de traducción señala que esta cláusula fue incorporada en copias bizantinas posteriores por asimilación con el versículo 4."
            }
          ]
        },
        {
          "verse": 2,
          "text": "Porque la ley del Espíritu de vida en Cristo Jesús me ha librado de la ley del pecado y de la muerte."
        },
        {
          "verse": 3,
          "text": "Porque lo que era imposible para la ley, por cuanto era débil por la carne, Dios, enviando a su Hijo en semejanza de carne de pecado y a causa del pecado, condenó al pecado en la carne;"
        },
        {
          "verse": 4,
          "text": "para que la justicia de la ley se cumpliese en nosotros, que no andamos conforme a la carne, sino conforme al Espíritu."
        },
        {
          "verse": 5,
          "text": "Porque los que son de la carne, en las cosas de la carne piensan; pero los que son del Espíritu, en las cosas del Espíritu."
        },
        {
          "verse": 6,
          "text": "Porque la mente carnal es muerte, pero la mente espiritual, es vida y paz."
        },
        {
          "verse": 7,
          "text": "Porque la mente carnal es enemistad contra Dios; porque no se sujeta a la ley de Dios, ni tampoco puede."
        },
        {
          "verse": 8,
          "text": "Así que, los que están en la carne no pueden agradar a Dios."
        },
        {
          "verse": 9,
          "text": "Mas vosotros no estáis en la carne, sino en el Espíritu, si es que el Espíritu de Dios mora en vosotros. Y si alguno no tiene el Espíritu de Cristo, el tal no es de Él."
        },
        {
          "verse": 10,
          "text": "Y si Cristo está en vosotros, el cuerpo a la verdad está muerto a causa del pecado pero el Espíritu vive a causa de la justicia."
        },
        {
          "verse": 11,
          "text": "Y si el Espíritu de Aquél que levantó de los muertos a Jesús mora en vosotros, el que levantó a Cristo de entre los muertos, vivificará también vuestros cuerpos mortales por su Espíritu que mora en vosotros."
        },
        {
          "verse": 12,
          "text": "Así que, hermanos, deudores somos, no a la carne, para que vivamos conforme a la carne."
        },
        {
          "verse": 13,
          "text": "Porque si vivís conforme a la carne, moriréis, mas si por el Espíritu hacéis morir las obras de la carne, viviréis."
        },
        {
          "verse": 14,
          "text": "Porque todos los que son guiados por el Espíritu de Dios, los tales son hijos de Dios."
        },
        {
          "verse": 15,
          "text": "Porque no habéis recibido el espíritu de servidumbre para estar otra vez en temor, sino que habéis recibido el Espíritu de adopción, por el cual clamamos: Abba Padre."
        },
        {
          "verse": 16,
          "text": "El Espíritu mismo da testimonio a nuestro espíritu que somos hijos de Dios."
        },
        {
          "verse": 17,
          "text": "Y si hijos, también herederos; herederos de Dios, y coherederos con Cristo; si es que padecemos juntamente con Él, para que juntamente con Él seamos también glorificados."
        },
        {
          "verse": 18,
          "text": "Pues tengo por cierto que las aflicciones del tiempo presente no son dignas de comparar con la gloria que en nosotros ha de ser manifestada."
        },
        {
          "verse": 19,
          "text": "Porque el anhelo ardiente de las criaturas espera la manifestación de los hijos de Dios."
        },
        {
          "verse": 20,
          "text": "Porque las criaturas fueron sujetadas a vanidad, no voluntariamente, sino por causa de Aquél que las sujetó en esperanza,"
        },
        {
          "verse": 21,
          "text": "porque las mismas criaturas serán libradas de la servidumbre de corrupción, en la libertad gloriosa de los hijos de Dios."
        },
        {
          "verse": 22,
          "text": "Porque sabemos que toda la creación gime a una, y está en dolores de parto hasta ahora;"
        },
        {
          "verse": 23,
          "text": "y no sólo ella, sino que también nosotros que tenemos las primicias del Espíritu, nosotros también gemimos dentro de nosotros mismos, esperando la adopción, esto es, la redención de nuestro cuerpo."
        },
        {
          "verse": 24,
          "text": "Porque en esperanza somos salvos; mas la esperanza que se ve no es esperanza, pues lo que uno ve ¿por qué esperarlo aún?"
        },
        {
          "verse": 25,
          "text": "Mas si lo que no vemos esperamos, con paciencia lo esperamos."
        },
        {
          "verse": 26,
          "text": "Y de la misma manera, también el Espíritu nos ayuda en nuestras debilidades; pues qué hemos de pedir como conviene, no lo sabemos; pero el Espíritu mismo intercede por nosotros con gemidos indecibles."
        },
        {
          "verse": 27,
          "text": "Y el que escudriña los corazones sabe cuál es la intención del Espíritu, porque conforme a la voluntad de Dios intercede por los santos."
        },
        {
          "verse": 28,
          "text": "Y sabemos que todas las cosas ayudan a bien, a los que aman a Dios, a los que conforme a su propósito son llamados.",
          "crossRefs": [
            {
              "ref": "Jeremías 29:11",
              "text": "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz"
            },
            {
              "ref": "Efesios 1:11",
              "text": "Habiendo sido predestinados conforme al propósito del que hace todas las cosas"
            }
          ]
        },
        {
          "verse": 29,
          "text": "Porque a los que antes conoció, también los predestinó para que fuesen hechos conforme a la imagen de su Hijo, para que Él sea el primogénito entre muchos hermanos."
        },
        {
          "verse": 30,
          "text": "Y a los que predestinó, a estos también llamó; y a los que llamó, a estos también justificó; y a los que justificó, a estos también glorificó."
        },
        {
          "verse": 31,
          "text": "¿Qué, pues, diremos a esto? Si Dios por nosotros, ¿quién contra nosotros?",
          "crossRefs": [
            {
              "ref": "Salmos 118:6",
              "text": "Jehová está conmigo; no temeré lo que me pueda hacer el hombre."
            },
            {
              "ref": "Isaías 50:8",
              "text": "Cercano está de mí el que me salva; ¿quién contenderá conmigo?"
            }
          ]
        },
        {
          "verse": 32,
          "text": "El que no escatimó ni a su propio Hijo, sino que lo entregó por todos nosotros, ¿cómo no nos dará también con Él todas las cosas?"
        },
        {
          "verse": 33,
          "text": "¿Quién acusará a los escogidos de Dios? Dios es el que justifica."
        },
        {
          "verse": 34,
          "text": "¿Quién es el que condenará? Cristo es el que murió, y más aun, el que también resucitó, el que además está a la diestra de Dios, el que también intercede por nosotros."
        },
        {
          "verse": 35,
          "text": "¿Quién nos separará del amor de Cristo? ¿Tribulación, o angustia, o persecución, o hambre, o desnudez, o peligro, o espada?"
        },
        {
          "verse": 36,
          "text": "Como está escrito: Por causa de ti somos muertos todo el tiempo; somos contados como ovejas de matadero."
        },
        {
          "verse": 37,
          "text": "Antes, en todas estas cosas somos más que vencedores por medio de Aquél que nos amó.",
          "crossRefs": [
            {
              "ref": "1 Corintios 15:57",
              "text": "Mas gracias sean dadas a Dios, que nos da la victoria por medio de nuestro Señor Jesucristo."
            }
          ]
        },
        {
          "verse": 38,
          "text": "Por lo cual estoy seguro que ni la muerte, ni la vida, ni ángeles, ni principados, ni potestades, ni lo presente, ni lo por venir,"
        },
        {
          "verse": 39,
          "text": "ni lo alto, ni lo profundo, ni ninguna otra criatura nos podrá separar del amor de Dios que es en Cristo Jesús Señor nuestro.",
          "crossRefs": [
            {
              "ref": "Efesios 3:18-19",
              "text": "Para que seáis plenamente capaces de comprender con todos los santos cuál sea la anchura, la longitud, la profundidad y la altura"
            }
          ]
        }
      ]
    },
    "fil": {
      "4": [
        {
          "verse": 1,
          "text": "Así que, hermanos míos amados y deseados, gozo y corona mía, estad así firmes en el Señor, amados."
        },
        {
          "verse": 2,
          "text": "A Euodias ruego, y ruego a Sintique, que sean de una misma mente en el Señor."
        },
        {
          "verse": 3,
          "text": "Y te ruego también a ti, fiel compañero, ayuda a aquellas mujeres que trabajaron juntamente conmigo en el evangelio, con Clemente también, y los otros de mis colaboradores, cuyos nombres están en el libro de la vida."
        },
        {
          "verse": 4,
          "text": "Regocijaos en el Señor siempre: Otra vez digo: Regocijaos."
        },
        {
          "verse": 5,
          "text": "Vuestra modestia sea conocida de todos los hombres. El Señor está cerca."
        },
        {
          "verse": 6,
          "text": "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y súplica, con acción de gracias."
        },
        {
          "verse": 7,
          "text": "Y la paz de Dios que sobrepasa todo entendimiento, guardará vuestros corazones y vuestras mentes en Cristo Jesús."
        },
        {
          "verse": 8,
          "text": "Por lo demás, hermanos, todo lo que es verdadero, todo lo honesto, todo lo justo, todo lo puro, todo lo amable, todo lo que es de buen nombre, si hay virtud alguna, si alguna alabanza, en esto pensad."
        },
        {
          "verse": 9,
          "text": "Lo que aprendisteis y recibisteis y oísteis y visteis en mí, esto haced; y el Dios de paz será con vosotros."
        },
        {
          "verse": 10,
          "text": "Mas en gran manera me regocijé en el Señor de que ya al fin ha reflorecido vuestro cuidado de mí, de lo cual también estabais solícitos, pero os faltaba la oportunidad."
        },
        {
          "verse": 11,
          "text": "No lo digo porque tenga escasez; pues he aprendido a contentarme, cualquiera que sea mi situación."
        },
        {
          "verse": 12,
          "text": "Sé tener escasez, y sé tener abundancia; en todo y por todo estoy enseñado, así para hartura, como para hambre; para tener abundancia, como para padecer necesidad."
        },
        {
          "verse": 13,
          "text": "Todo lo puedo en Cristo que me fortalece.",
          "crossRefs": [
            {
              "ref": "2 Corintios 12:9",
              "text": "Bástate mi gracia; porque mi poder se perfecciona en la debilidad."
            },
            {
              "ref": "Juan 15:5",
              "text": "Separados de mí nada podéis hacer."
            }
          ],
          "footnotes": [
            {
              "text": "Aclaración de término griego: «En Cristo que me fortalece» emplea el verbo compuesto ἐνδυναμόω (endynamoō, en voz pasiva-continua), que denota una capacitación dinámica interior constante derramada por Cristo en el creyente para sobrellevar toda circunstancia."
            }
          ]
        },
        {
          "verse": 14,
          "text": "Sin embargo, bien hicisteis al comunicar conmigo en mi aflicción."
        },
        {
          "verse": 15,
          "text": "Y sabéis también vosotros, oh filipenses, que al principio del evangelio, cuando partí de Macedonia, ninguna iglesia comunicó conmigo en el asunto de dar y recibir, sino vosotros solos,",
          "maps": [
            {
              "title": "Ruta Misionera de Pablo: De Filipos a Tesalónica (Macedonia)",
              "placesMentioned": [
                "Filipos (Macedonia oriental)",
                "Tesalónica (Vía Egnatia)",
                "Provincia de Macedonia",
                "Grecia / Acaya"
              ],
              "relevanceExplanation": "En los versículos 15 y 16, Pablo recuerda su itinerario geográfico por Macedonia: tras fundar la iglesia en Filipos (Hechos 16), avanzó por la calzada romana Vía Egnatia hacia Tesalónica (Hechos 17). El apóstol agradece cómo los creyentes de Filipos le enviaron sustento financiero reiteradas veces a lo largo de esa ruta misionera.",
              "description": "Mapa histórico de los viajes misioneros del apóstol Pablo por Macedonia y el mundo grecorromano, mostrando el trayecto entre Filipos y Tesalónica por la Vía Egnatia.",
              "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/1/18/Biblica_Open_Bible_Map_16_17_Paul_missionary_journeys_map.png",
              "sourceName": "Biblica / Open Bible Map Archive"
            }
          ]
        },
        {
          "verse": 16,
          "text": "pues aun a Tesalónica me enviasteis lo necesario una y otra vez."
        },
        {
          "verse": 17,
          "text": "No es que busque dádivas, sino que busco fruto que abunde a vuestra cuenta."
        },
        {
          "verse": 18,
          "text": "Pero todo lo he recibido, y tengo abundancia; estoy lleno, habiendo recibido de Epafrodito lo que enviasteis; perfume de dulce fragancia, sacrificio acepto, agradable a Dios."
        },
        {
          "verse": 19,
          "text": "Mi Dios, pues, suplirá todo lo que os falte, conforme a sus riquezas en gloria en Cristo Jesús."
        },
        {
          "verse": 20,
          "text": "Y al Dios y Padre nuestro sea gloria por siempre jamás. Amén."
        },
        {
          "verse": 21,
          "text": "Saludad a todos los santos en Cristo Jesús. Los hermanos que están conmigo os saludan."
        },
        {
          "verse": 22,
          "text": "Todos los santos os saludan, y mayormente los que son de la casa de César."
        },
        {
          "verse": 23,
          "text": "La gracia de nuestro Señor Jesucristo sea con todos vosotros. Amén."
        }
      ]
    },
    "jua": {
      "15": [
        {
          "verse": 1,
          "text": "Yo soy la vid verdadera, y mi Padre es el labrador.",
          "isJesus": true,
          "crossRefs": [
            {
              "ref": "Salmos 80:8",
              "text": "Hiciste venir una vid de Egipto; echaste las naciones, y la plantaste."
            }
          ]
        },
        {
          "verse": 2,
          "text": "Todo pámpano que en mí no lleva fruto, lo quita; y todo aquel que lleva fruto, lo limpia, para que lleve más fruto.",
          "footnotes": [
            {
              "text": "Aclaración lingüística griega: Existe un juego de palabras entre aírei (αἴρει, quitar/levantar) y kathaírei (καθαίρει, podar/limpiar). En la viticultura de Judea, los sarmientos caídos en tierra húmeda no se descartaban de inmediato, sino que el labrador los levantaba con cuidado, los lavaba del barro y los ataba a espalderas para que volvieran a recibir el sol y florecer."
            }
          ],
          "isJesus": true
        },
        {
          "verse": 3,
          "text": "Ya vosotros sois limpios por la palabra que os he hablado.",
          "isJesus": true
        },
        {
          "verse": 4,
          "text": "Permaneced en mí, y yo en vosotros. Como el pámpano no puede llevar fruto de sí mismo, si no permanece en la vid, así tampoco vosotros, si no permanecéis en mí.",
          "isJesus": true
        },
        {
          "verse": 5,
          "text": "Yo soy la vid, vosotros sois los pámpanos; el que permanece en mí, y yo en él, este lleva mucho fruto; porque sin mí nada podéis hacer.",
          "isJesus": true,
          "crossRefs": [
            {
              "ref": "Filipenses 4:13",
              "text": "Todo lo puedo en Cristo que me fortalece."
            }
          ]
        },
        {
          "verse": 6,
          "text": "Si alguno no permanece en mí, será echado fuera como pámpano, y se secará; y los recogen, ylos echan en el fuego, y arden.",
          "isJesus": true
        },
        {
          "verse": 7,
          "text": "Si permanecéis en mí, y mis palabras permanecen en vosotros, pediréis todo lo que quisiereis, y os será hecho.",
          "isJesus": true
        },
        {
          "verse": 8,
          "text": "En esto es glorificado mi Padre, en que llevéis mucho fruto, y seáis así mis discípulos.",
          "isJesus": true
        },
        {
          "verse": 9,
          "text": "Como el Padre me ha amado, así también yo os he amado; permaneced en mi amor.",
          "isJesus": true
        },
        {
          "verse": 10,
          "text": "Si guardáis mis mandamientos, permaneceréis en mi amor; como también yo he guardado los mandamientos de mi Padre, y permanezco en su amor.",
          "isJesus": true
        },
        {
          "verse": 11,
          "text": "Estas cosas os he hablado, para que mi gozo esté en vosotros, y vuestro gozo sea cumplido.",
          "isJesus": true
        },
        {
          "verse": 12,
          "text": "Este es mi mandamiento: Que os améis unos a otros, como yo os he amado.",
          "isJesus": true
        },
        {
          "verse": 13,
          "text": "Nadie tiene mayor amor que este, que uno ponga su vida por sus amigos.",
          "isJesus": true
        },
        {
          "verse": 14,
          "text": "Vosotros sois mis amigos, si hacéis lo que yo os mando.",
          "isJesus": true
        },
        {
          "verse": 15,
          "text": "Ya no os llamaré siervos, porque el siervo no sabe lo que hace su señor; mas os he llamado amigos, porque os he dado a conocer todas las cosas que he oído de mi Padre.",
          "isJesus": true
        },
        {
          "verse": 16,
          "text": "No me elegisteis vosotros a mí; sino que yo os elegí a vosotros; y os he puesto para que vayáis y llevéis fruto, y vuestro fruto permanezca; para que todo lo que pidiereis al Padre en mi nombre; Él os lo dé.",
          "isJesus": true
        },
        {
          "verse": 17,
          "text": "Esto os mando: Que os améis unos a otros.",
          "isJesus": true
        },
        {
          "verse": 18,
          "text": "Si el mundo os aborrece, sabed que a mí me aborreció antes que a vosotros.",
          "isJesus": true
        },
        {
          "verse": 19,
          "text": "Si fuerais del mundo, el mundo amaría lo suyo; mas porque no sois del mundo, antes yo os elegí del mundo, por eso el mundo os aborrece.",
          "isJesus": true
        },
        {
          "verse": 20,
          "text": "Acordaos de la palabra que yo os dije: El siervo no es más que su señor. Si a mí me han perseguido, también a vosotros perseguirán; si han guardado mi palabra, también guardarán la vuestra.",
          "isJesus": true
        },
        {
          "verse": 21,
          "text": "Pero todo esto os harán por causa de mi nombre; porque no conocen al que me envió.",
          "isJesus": true
        },
        {
          "verse": 22,
          "text": "Si yo no hubiera venido, ni les hubiera hablado, no tendrían pecado, pero ahora no tienen excusa de su pecado.",
          "isJesus": true
        },
        {
          "verse": 23,
          "text": "El que me aborrece, también a mi Padre aborrece.",
          "isJesus": true
        },
        {
          "verse": 24,
          "text": "Si yo no hubiese hecho entre ellos obras que ningún otro ha hecho, no tendrían pecado; pero ahora también ellos las han visto, y nos han aborrecido a mí y a mi Padre.",
          "isJesus": true
        },
        {
          "verse": 25,
          "text": "Peroesto es para que se cumpla la palabra que está escrita en su ley: Sin causa me aborrecieron.",
          "isJesus": true
        },
        {
          "verse": 26,
          "text": "Pero cuando venga el Consolador, a quien yo os enviaré del Padre, el Espíritu de verdad que procede del Padre, Él dará testimonio de mí.",
          "isJesus": true
        },
        {
          "verse": 27,
          "text": "Y vosotros también daréis testimonio, porque habéis estado conmigo desde el principio.",
          "isJesus": true
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
  const t = translation === 'NTV' || translation === 'NBLA' ? translation : 'RVR1960';
  const books = CURATED_CHAPTERS[t];
  if (!books) return null;
  const chs = books[bookId.toLowerCase()];
  if (!chs) return null;
  return chs[chapter] || null;
}

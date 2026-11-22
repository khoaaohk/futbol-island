import type {Faq,PrintableEs,ToolPageEs,ToolsHubEs} from './types';
/**
 * The free coach tools in Spanish (Spanish round D, Nov 16 2026): /es/tools, the lineup builder ("creador de alineaciones") and its
 * 7v7 / 9v9 / 11v11 / futsal landings, the playing-time calculator ("calculadora de minutos de juego") and its 7v7 / 9v9 rotation
 * landings ("rotación de cambios"), and the field diagrams ("diagramas de cancha"): hub, blank templates, cheat sheets ("hojas de
 * referencia") and the positions chart. English (lib/site/tools/registry.ts, printables.ts) stays the source of truth; each record
 * holds only words, keyed by the English slug, arrays 1:1. Glossary: lib/i18n/es-glossary.ts ("tú", cancha, balón, portero, banca).
 */
export const TOOL_NAMES_ES='El fútbol se llama soccer en Estados Unidos y Canadá. Estas herramientas son gratis, sin cuenta y sin anuncios, de Futbol Island, un juego para aprender fútbol para niños de 7 a 12 años.';
export const PRIVACY_LINE_ES='Los nombres se quedan en tu dispositivo. Nada de lo que escribes se envía a Futbol Island ni se guarda en un servidor.';
export const LICENCE_ES='Gratis para imprimir y compartir con equipos, clubes y escuelas. Hecho por Futbol Island.';

export const TOOLS_HUB_ES:ToolsHubEs={crumb:'Herramientas',title:'Herramientas de fútbol gratis: alineaciones y cambios',h1:'Herramientas gratis para entrenadores de fútbol',
 description:'Herramientas gratis para entrenadores de fútbol infantil: creador de alineaciones, calculadora de minutos justa, diagramas de cancha y hojas de referencia.',
 lead:'Un creador de alineaciones, una calculadora de minutos de juego justa y diagramas de cancha para imprimir, para entrenadores voluntarios de equipos de 7v7, 9v9, 11v11 y futsal. Gratis, sin cuenta y sin nada que instalar.',
 blurb:'Creador de alineaciones, calculadora de minutos justa y diagramas de cancha para entrenadores',
 faq:[{q:'¿Para quién son estas herramientas de fútbol?',a:'Para entrenadores voluntarios y de fútbol infantil, maestros de educación física y padres que ayudan a un equipo de niños de unos 7 a 12 años. Los equipos de adultos también pueden usarlas.'},
  {q:'¿Las herramientas guardan algún dato?',a:'No. Los nombres y las alineaciones se quedan en tu propio navegador. Nada de lo que escribes se envía a Futbol Island, y no hay cuenta que crear.'},
  {q:'¿Puedo compartir las hojas para imprimir con mi club?',a:'Sí. Son gratis para imprimir y compartir con equipos, clubes y escuelas. Cada hoja lleva un pequeño crédito de futbolisland.app; por favor, déjalo.'},
  {q:'¿Las herramientas funcionan en el teléfono?',a:'Sí. Están hechas para un teléfono en una mano al lado de la cancha, y también funcionan en tabletas y computadoras.'}]};

export const LINEUP_PAGES_ES:Readonly<Record<string,ToolPageEs>>={
 'soccer-lineup-builder':{crumb:'Creador de alineaciones',title:'Creador de alineaciones de fútbol gratis para imprimir',h1:'Creador de alineaciones de fútbol',
  description:'Creador de alineaciones de fútbol gratis para 7v7, 9v9, 11v11 y futsal. Elige la formación, escribe nombres, mueve jugadores, imprime o comparte.',
  lead:'Arma tu alineación titular en un diagrama de cancha de verdad. Elige la modalidad y la formación, escribe los nombres, mueve jugadores entre las posiciones y la banca, y luego imprímela, guárdala como imagen o copia un enlace para el chat del equipo.',
  blurb:'Nombres en un diagrama de cancha para 7v7, 9v9, 11v11 o futsal: imprime, guarda la imagen o comparte un enlace',
  intro:['Una alineación en papel responde las preguntas que los niños hacen en el estacionamiento: “¿Dónde juego?” y “¿Soy titular?”. Este creador dibuja la respuesta en los mismos diagramas de cancha que usan las lecciones de Futbol Island, así que la forma de la hoja es la forma que los jugadores ya vieron.',
   'Sirve para cada modalidad que juegan los equipos infantiles en Estados Unidos: 7v7 en U9 y U10, 9v9 en U11 y U12, 11v11 desde U13, y futsal bajo techo. Cambia la formación cuando quieras y los nombres se quedan contigo.'],
  faq:[{q:'¿El creador de alineaciones de fútbol es gratis de verdad?',a:'Sí. No hay cuenta, ni prueba, ni anuncios. Puedes armar, imprimir, descargar y compartir todas las alineaciones que quieras.'},
   {q:'¿Dónde se guardan los nombres de mis jugadores?',a:'Solo en tu propio navegador, así que la alineación sigue ahí cuando vuelves en el mismo dispositivo. Nada se envía a un servidor. Un enlace que copias lleva la alineación dentro del propio enlace, así que solo la ven las personas a quienes se lo mandas.'},
   {q:'¿Puedo usarlo en el teléfono en la cancha?',a:'Sí. Está hecho para un solo pulgar: toca a un jugador y luego toca el lugar o el suplente con quien cambiarlo. En una computadora también puedes arrastrar, o usar las teclas Tab, las flechas y Enter.'},
   {q:'¿Cómo comparto una alineación con los padres?',a:'Usa “Descargar imagen” y publica la imagen en el chat del equipo, o usa “Copiar enlace” y pega el enlace. Cuando compartas la alineación de un equipo de niños, usa solo nombres de pila o apodos.'}]},
 '7v7-lineup-builder':{crumb:'Alineaciones 7v7',title:'Creador de alineaciones 7v7 gratis para imprimir',h1:'Creador de alineaciones de fútbol 7v7',
  description:'Arma una alineación de fútbol 7v7 en 2-3-1, 3-2-1, 2-2-2 o 3-1-2. Escribe nombres, mueve jugadores y suplentes, imprime o comparte. Gratis.',
  lead:'Coloca a tus siete titulares y a tus suplentes en una cancha de 7v7 con líneas de salida. Elige un 2-3-1, 3-2-1, 2-2-2 o 3-1-2, escribe los nombres y mueve a los jugadores hasta que se vea bien.',
  blurb:'Siete titulares y la banca en una cancha de 7v7',
  intro:['El 7v7 es la modalidad que juegan los equipos de Estados Unidos en U9 y U10: un portero y seis jugadores de campo en una cancha pequeña. Casi todos los planteles tienen de diez a doce niños, así que la banca importa tanto como los siete titulares. Pon a cada niño en la hoja, titulares y suplentes, antes de salir de casa.',
   'A esta edad nadie debería ser dueño de una posición. Guarda una alineación, luego cambia a dos jugadores para el segundo tiempo e imprime las dos. Un niño que juega en defensa una semana y adelante la siguiente aprende todo el juego.'],
  faq:[{q:'¿Cuál es la mejor formación de 7v7 para empezar?',a:'Casi todos los entrenadores empiezan con un 2-3-1: dos defensas, tres mediocampistas y un delantero delante del portero. Da amplitud en el medio y es fácil de entender para los jugadores pequeños.'},
   {q:'¿Cuántos suplentes debería tener un equipo de 7v7?',a:'Lo común es de tres a cinco, lo que da un plantel de diez a doce. Con más, se vuelve difícil darle a cada niño una parte justa del partido.'},
   {q:'¿La cancha de 7v7 del creador tiene líneas de salida?',a:'Sí. Las dos líneas punteadas son las líneas de salida (build-out lines) que se usan en el 7v7 de Estados Unidos. El otro equipo espera detrás de la línea mientras tu portero reanuda el juego, así que muéstrales a tus defensas dónde pararse para recibir el balón.'}]},
 '9v9-lineup-builder':{crumb:'Alineaciones 9v9',title:'Creador de alineaciones 9v9 gratis para imprimir',h1:'Creador de alineaciones de fútbol 9v9',
  description:'Arma una alineación de fútbol 9v9 en 3-2-3, 3-3-2, 2-3-2-1, 3-1-3-1 o 4-3-1. Escribe nombres, mueve jugadores y suplentes, imprime o comparte.',
  lead:'Coloca a tus nueve titulares en una cancha de 9v9 en 3-2-3, 3-3-2, 2-3-2-1, 3-1-3-1 o 4-3-1, agrega a los suplentes y dale a cada jugador una imagen clara de dónde empieza.',
  blurb:'Nueve titulares y la banca en una cancha de 9v9',
  intro:['El 9v9 se juega en U11 y U12 en Estados Unidos. Con ocho jugadores de campo hay por primera vez tres líneas de verdad, y el fuera de juego se marca desde la línea media, así que los jugadores necesitan saber quién está a su lado y quién está detrás. Una alineación dibujada lo muestra de un vistazo.',
   'Prueba el mismo plantel en dos formas. Ármalo en un 3-2-3, copia el enlace, luego cambia a un 3-3-2 y compara: los nombres se mueven con la forma, así que ves enseguida qué jugadores cambian de tarea.'],
  faq:[{q:'¿Cuál es la formación de 9v9 más común?',a:'El 3-2-3 es la primera opción habitual: tres defensas, dos mediocampistas centrales y tres delanteros. Prepara a los jugadores para el 4-3-3 que encontrarán en el 11v11.'},
   {q:'¿Puedo pasar a un suplente de la banca a la alineación?',a:'Sí. Toca al suplente y luego toca al jugador en la cancha. Cambian de lugar. En una computadora puedes arrastrar uno sobre el otro.'},
   {q:'¿Puedo imprimir la alineación de 9v9?',a:'Sí. “Imprimir” hace una hoja de una página en negro sobre blanco con la cancha, los nombres, la banca y tu nota del partido, lista para la tablilla.'}]},
 '11v11-lineup-builder':{crumb:'Alineaciones 11v11',title:'Creador de alineaciones 11v11 de fútbol gratis',h1:'Creador de alineaciones de fútbol 11v11',
  description:'Haz una alineación de fútbol 11v11 en 4-3-3, 4-4-2, 4-2-3-1 o 3-5-2 en una cancha completa. Escribe nombres, mueve jugadores, imprime o comparte.',
  lead:'Dibuja a tus once titulares en una cancha de tamaño completo en 4-3-3, 4-4-2, 4-2-3-1 o 3-5-2, con los números de costumbre en los puntos y tus suplentes al lado.',
  blurb:'Once titulares en una cancha de tamaño completo',
  intro:['El 11v11 es el juego completo, que se juega desde U13 en Estados Unidos y entre adultos en todo el mundo. Once nombres son muchos para leerlos antes del saque inicial; una hoja en la banca o una imagen en el chat del grupo la noche anterior deja la charla para lo que importa.',
   'Los puntos llevan los números que los entrenadores usan como nombres de posición (el 6 para el mediocampista de contención, el 9 para el delantero centro). Son una costumbre, no una regla, así que la hoja muestra el nombre del jugador debajo de cada uno y puedes ignorar los números si tu equipo no los usa.'],
  faq:[{q:'¿Qué formaciones de 11v11 puedo armar?',a:'El 4-3-3, el 4-4-2, el 4-2-3-1 y el 3-5-2. Cada una enlaza a una guía con los roles, las fortalezas y los puntos débiles.'},
   {q:'¿Los números de los puntos tienen que coincidir con los números de las camisetas?',a:'No. Los números del 1 al 11 son una costumbre de los entrenadores para nombrar posiciones. Los jugadores pueden usar cualquier número en la camiseta.'},
   {q:'¿Lo pueden usar equipos de adultos y de escuelas?',a:'Sí. Es gratis para cualquier equipo, club o escuela. La imagen y la hoja impresa llevan un pequeño crédito de futbolisland.app.'}]},
 'futsal-lineup-builder':{crumb:'Alineaciones de futsal',title:'Creador de alineaciones de futsal gratis para imprimir',h1:'Creador de alineaciones de futsal',
  description:'Arma una alineación de futsal en 2-2, 1-2-1 en rombo o 3-1 en una cancha de futsal de verdad. Escribe nombres, cambia jugadores, imprime o comparte.',
  lead:'Coloca a tu portero y a tus cuatro jugadores de cancha en una cancha de futsal en 2-2, 1-2-1 en rombo o 3-1, y anota al resto del plantel como suplentes de cambio libre.',
  blurb:'Cinco titulares y cambios libres en una cancha de futsal',
  intro:['El futsal es el fútbol (soccer) de cinco por lado bajo techo: un portero y cuatro jugadores de cancha, un balón más pequeño que se queda en el piso y cambios sin parar el juego. Como los jugadores rotan tan seguido, la alineación es en realidad una lista de quién empieza y quién entra primero.',
   'Usa la banca como tu orden de cambios: el primer nombre es el primero que entra. Arma una alineación para cada tiempo y guarda los dos enlaces.'],
  faq:[{q:'¿Qué significan cierre, ala y pívot?',a:'Son las posiciones del futsal. El cierre es el último jugador de cancha delante del portero, los dos alas juegan abiertos y el pívot juega más adelante, de espaldas al arco.'},
   {q:'¿Qué formación de futsal es la más fácil para principiantes?',a:'El 2-2: dos jugadores atrás y dos adelante. Pasa al 1-2-1 en rombo cuando los jugadores sepan pasar y moverse.'},
   {q:'¿Cuántos suplentes puede usar un equipo de futsal?',a:'El futsal usa cambios libres, así que los jugadores salen y vuelven a entrar muchas veces. El tamaño del plantel lo fija tu liga; revisa sus reglas.'}]},
};

export const PLANNER_PAGES_ES:Readonly<Record<string,ToolPageEs>>={
 'soccer-playing-time-calculator':{crumb:'Calculadora de minutos',title:'Calculadora de minutos de fútbol gratis: cambios justos',h1:'Calculadora de minutos de juego de fútbol',
  description:'Calculadora de minutos de juego de fútbol, gratis: escribe tus jugadores y la duración del partido y obtén cambios justos, los mismos minutos para todos.',
  lead:'Dile cuántos jugadores vinieron, cuántos juegan a la vez y cuánto dura el partido. Te da un plan de cambios en el que cada jugador recibe la misma parte del partido, con una diferencia de un cambio como máximo.',
  blurb:'Un plan de cambios justo, con los mismos minutos para cada jugador',
  intro:['Repartir los minutos con justicia de memoria, con un partido en marcha delante de ti, es difícil. Nueve niños, siete lugares, dos tiempos: ¿quién ya descansó dos veces? Esta calculadora hace las cuentas antes del partido, así que al lado de la cancha solo lees la siguiente línea de la tabla.',
   'Sirve para cualquier modalidad: elige 7v7, 9v9, 11v11 o futsal, o escribe tus propios números para un torneo con partidos cortos.'],
  faq:[{q:'¿Cómo mantiene la calculadora los minutos iguales?',a:'Corta el partido en bloques iguales, uno por cada cambio, y le da a cada jugador el mismo número de bloques. Cuando los números no se dividen exacto, algunos jugadores reciben un bloque más que otros, nunca dos.'},
   {q:'¿Y si un jugador no llega?',a:'Cambia el número de jugadores y el plan se rehace al instante. Toma unos segundos en el teléfono en la cancha.'},
   {q:'¿El portero también debería rotar?',a:'Con niños pequeños, sí si puedes: así cada niño prueba la posición y los minutos siguen iguales. Elige “Un portero nuevo en cada periodo” y el portero cambia en los descansos. Si un niño se queda en el arco, juega todo el partido y los demás se reparten el resto.'},
   {q:'¿Los nombres que escribo se guardan en algún lado?',a:'Solo en tu propio navegador. Nada se envía a un servidor. Los nombres son opcionales: el plan también funciona con “Jugador 1, Jugador 2”.'}]},
 '7v7-substitution-rotation':{crumb:'Rotación de cambios 7v7',title:'Rotación de cambios de fútbol 7v7: minutos iguales',h1:'Rotación de cambios de fútbol 7v7',
  description:'Una rotación de cambios de fútbol 7v7 para 8 a 14 jugadores. Di quién vino y obtén un plan justo con minutos iguales, para imprimir o pegar en un chat.',
  lead:'Siete en la cancha y una banca llena de niños de ocho y nueve años con ganas de jugar. Escribe cuántos jugadores tienes y obtén una rotación de cambios de 7v7 en la que todos juegan lo mismo, con una diferencia de un cambio como máximo.',
  blurb:'Minutos iguales para un plantel de 7v7 de cualquier tamaño',
  intro:['El 7v7 se juega en U9 y U10 en Estados Unidos, casi siempre en dos tiempos de 25 minutos. Con cambios cada cinco minutos son diez bloques de juego para repartir. Un plantel de diez recibe siete bloques cada uno; un plantel de catorce recibe cinco cada uno, que es justo la mitad del partido.',
   'El plan empieza con esos números ya puestos. Cambia la duración del partido si tu liga o tu torneo juega partidos más cortos.'],
  faq:[{q:'¿Cada cuánto debería hacer cambios en 7v7?',a:'Cada cinco a ocho minutos les sirve a casi todos los equipos U9 y U10. Los turnos cortos mantienen a los niños frescos y las esperas breves; los turnos largos les dan tiempo para meterse en el partido.'},
   {q:'¿Cómo roto a diez jugadores en 7v7?',a:'Tres jugadores descansan en cada bloque. En un partido de diez bloques cada jugador está en la cancha siete bloques y fuera tres, y nadie descansa dos veces seguidas.'},
   {q:'¿Cuándo puedo hacer los cambios?',a:'Casi todas las ligas infantiles permiten cambios solo cuando el juego está parado, y algunas solo en ciertas paradas. Toma los tiempos como metas y haz el cambio en la siguiente parada que permita tu liga.'}]},
 '9v9-substitution-rotation':{crumb:'Rotación de cambios 9v9',title:'Rotación de cambios de fútbol 9v9: minutos iguales',h1:'Rotación de cambios de fútbol 9v9',
  description:'Una rotación de cambios de fútbol 9v9 para 10 a 18 jugadores. Di quién vino y obtén un plan justo con minutos iguales, listo para imprimir o compartir.',
  lead:'Nueve en la cancha, y un plantel que puede ser de doce una semana y de quince la siguiente. Escribe cuántos vinieron y obtén una rotación de cambios de 9v9 que reparte el partido por igual.',
  blurb:'Minutos iguales para un plantel de 9v9 de cualquier tamaño',
  intro:['El 9v9 se juega en U11 y U12 en Estados Unidos, casi siempre en dos tiempos de 30 minutos. A esta edad los jugadores pueden sostener una posición por más tiempo, así que muchos entrenadores cambian cada siete o diez minutos en vez de cada cinco. La calculadora corta cada tiempo en bloques iguales según el intervalo que elijas.',
   'Los niños de once y doce años se fijan en quién juega más. Un plan impreso, mostrado al equipo antes del saque inicial, termina con casi todas las discusiones antes de que empiecen.'],
  faq:[{q:'¿Cada cuánto debería hacer cambios en 9v9?',a:'Cada siete a diez minutos es lo común en U11 y U12. Eso da tres o cuatro bloques en un tiempo de 30 minutos.'},
   {q:'¿Cómo reparto el tiempo entre doce jugadores en 9v9?',a:'Tres jugadores descansan en cada bloque. En un partido de seis bloques de diez minutos, algunos jugadores están en la cancha cuatro bloques y otros cinco. La calculadora elige quién recibe el bloque extra; cambia el orden de los nombres la semana siguiente para que se empareje durante la temporada.'},
   {q:'¿El plan mantiene al mismo portero?',a:'Tú eliges. Un solo portero todo el partido, o un portero nuevo en cada periodo para que más jugadores aprendan la posición.'}]},
};

export const PRINTABLES_HUB_ES=(n:number):ToolsHubEs=>({crumb:'Diagramas de cancha',title:'Diagramas de cancha de fútbol en blanco para imprimir',h1:'Diagramas de cancha de fútbol en blanco para imprimir',
 description:'Diagramas de cancha de fútbol gratis para imprimir: plantillas 7v7, 9v9, 11v11 y futsal, hojas de referencia de formaciones y un cuadro de posiciones.',
 lead:`Plantillas de cancha de fútbol en blanco para 7v7, 9v9, 11v11 y futsal, hojas de referencia de formaciones y un cuadro de posiciones: ${n} hojas, cada una en PNG y en SVG, gratis para imprimir.`,
 blurb:`${n} hojas para imprimir: canchas en blanco, hojas de referencia de formaciones y un cuadro de posiciones`,
 faq:[{q:'¿Las plantillas de cancha de fútbol son gratis?',a:'Sí. Son gratis para imprimir y compartir con equipos, clubes y escuelas. Por favor, deja el pequeño crédito de futbolisland.app en la hoja.'},
  {q:'¿Descargo el PNG o el SVG?',a:'Toma el PNG para imprimir en casa o para ponerlo en un documento o una presentación. Toma el SVG si quieres editar el diagrama en un programa de dibujo o imprimirlo muy grande: se ve nítido a cualquier tamaño.'},
  {q:'¿Las hojas se imprimen en papel A4?',a:'Sí. Están dibujadas para tamaño carta (US Letter); elige “ajustar a la página” en la ventana de impresión y llenan una hoja A4 con un margen un poco más ancho.'},
  {q:'¿Por qué una cancha de 7v7 se dibuja distinta de una cancha completa?',a:'Porque es otra cancha, no una copia más pequeña. En Estados Unidos una cancha de 7v7 tiene líneas de salida y su propio tamaño de área penal. Cada plantilla de aquí conserva las marcas de su propia modalidad.'}] as Faq[]});

/** Per-format words for the blank templates and the cheat sheets. */
const TEMPLATE_USE_ES:Readonly<Record<string,readonly string[]>>={
 '7v7':['Una cancha de 7v7 es la cancha reducida en la que juegan los equipos de Estados Unidos en U9 y U10. No es una cancha completa encogida: tiene su propia área penal y dos líneas de salida punteadas, una en cada mitad. Imprime la hoja en blanco y dibuja en ella con pluma en el entrenamiento, o métela en una funda de plástico y usa un marcador borrable para que dure toda la temporada.',
  'Usa la hoja vertical cuando hables de tu propio equipo: atacas hacia arriba de la hoja, como lo ven los jugadores desde su arco. Usa la hoja horizontal para todo el partido visto desde la línea de banda, con los dos equipos. La hoja de tercios ayuda a explicar dónde regatear y dónde pasar con seguridad. La hoja de zonas marca los carriles de los lados, así que un jugador abierto ve “mi carril” de un vistazo.',
  'Algunas ligas juegan 7v7 sin líneas de salida, así que también hay una hoja sin líneas punteadas. Revisa las reglas de tu liga antes de enseñar la línea.'],
 '9v9':['Una cancha de 9v9 es el puente entre el juego reducido y el juego completo, y se juega en U11 y U12 en Estados Unidos. Aquí el fuera de juego se marca desde la línea media, así que un diagrama limpio importa: los jugadores necesitan ver la línea con la que deben quedar a la par. Imprime un montón antes de la temporada y guárdalas en la bolsa del equipo con un lápiz.',
  'La hoja en blanco es para alineaciones, jugadas a balón parado y cualquier cosa que dibujes en el momento. Dibuja los saques de esquina en la hoja vertical, con tu arco abajo. La hoja de tercios es la de hablar de cuándo salir jugando desde atrás y cuándo presionar. La hoja de zonas marca los carriles de los lados junto al área penal, lo que ayuda a los jugadores abiertos de un 3-2-3 a mantener la amplitud.',
  'Dale una copia a cada línea del equipo en el medio tiempo y pídeles que marquen dónde estaban parados. Los niños recuerdan mejor un dibujo que hicieron ellos mismos.'],
 '11v11':['Esta es la cancha de tamaño completo, con el área penal, el área chica, el arco del área, el círculo central y los arcos de esquina en proporción. Los equipos de Estados Unidos pasan al 11v11 en U13. Los entrenadores la imprimen para charlas de equipo, para planes de balón parado y para los cuadernos de los jugadores; los maestros la usan para hojas de trabajo de educación física.',
  'La hoja vertical sirve para la forma de un equipo, atacando hacia arriba de la hoja. La hoja horizontal sirve para el partido entero o para una vista como la de la televisión. La hoja de tercios divide la cancha en tercio defensivo, tercio medio y tercio ofensivo. La hoja de zonas agrega cinco carriles a lo largo de la cancha: dos carriles por los lados, dos carriles interiores en línea con el borde del área chica, y el centro. Esos cinco carriles son una forma común de hablar del espacio al entrenar, no una marca de una cancha real.',
  'Plastifica una copia y se vuelve una pizarra táctica de bolsillo para la banca.'],
 futsal:['Una cancha de futsal no es una cancha de fútbol pequeña. El área penal es una figura redondeada dibujada a seis metros del arco, hay dos puntos penales en cada mitad, y las líneas están tan cerca que cada jugador siempre está cerca del balón. Esta plantilla conserva esas marcas en proporción, así que una rotación dibujada en papel se ve como en el piso.',
  'Usa la hoja vertical para tus cuatro jugadores de cancha y tu portero, atacando hacia arriba de la hoja. Usa la hoja horizontal cuando dibujes a los dos equipos, o una jugada de saque de banda con el pie desde la línea de banda. La hoja de tercios ayuda con las reglas de presión (“presionamos en su tercio”). La hoja de zonas corta la cancha en nueve cuadros, una forma sencilla de enseñarles al ala, al cierre y al pívot dónde empieza y dónde termina su zona.',
  'El futsal va rápido, así que dibuja una idea por hoja y deja que los jugadores la tengan en la mano.'],
};
const CHEAT_USE_ES:Readonly<Record<string,readonly string[]>>={
 '7v7':['Cuatro formas de 7v7 en una página: 2-3-1, 3-2-1, 2-2-2 y 3-1-2. Cada cancha pequeña muestra dónde empiezan los siete jugadores, con el portero en el punto más claro. Pégala dentro de tu tablilla, o dale una a cada familia en el primer entrenamiento para que los padres sepan qué significa “dos-tres-uno” cuando lo oigan desde la línea de banda.',
  'Una formación es solo dónde empiezan los jugadores. En U9 y U10 la forma importa menos que los hábitos dentro de ella: abrirse cuando tu equipo tiene el balón y juntarse cuando no lo tiene. Usa la hoja para elegir una forma, quédate con ella unas semanas y deja que cada niño pruebe cada línea. La línea debajo de cada forma dice para quién es ideal.'],
 '9v9':['Cinco formas de 9v9 en una página: 3-2-3, 3-3-2, 2-3-2-1, 3-1-3-1 y 4-3-1. Nueve jugadores dejan lugar para tres líneas de verdad, así que esta es la edad en la que los niños aprenden por primera vez a jugar como línea de defensa, mediocampo y ataque. La hoja te deja comparar las formas lado a lado antes de elegir.',
  'Los entrenadores la usan de dos maneras. Antes de la temporada, para elegir una forma que le quede al plantel: ¿tienes dos delanteros naturales, o jugadores abiertos a los que les encanta correr? Durante la temporada, para mostrarle al equipo cómo puede pararse el siguiente rival. Imprime una para tu asistente también, para que los dos usen las mismas palabras el día del partido.'],
 '11v11':['Cuatro formas del juego completo en una página: 4-3-3, 4-4-2, 4-2-3-1 y 3-5-2, cada una en una cancha completa pequeña con los números de costumbre en los puntos. Es una respuesta rápida para el jugador que pregunta “¿dónde juega el 6?” y una página útil para un equipo que acaba de subir del 9v9 en U13.',
  'Ponla en los cuadernos de los jugadores y pídeles que encierren en un círculo su posición en cada forma. Verán que un lateral, un mediocampista central y un delantero centro existen en todas, y que solo cambian unas pocas tareas. Eso facilita cambiar de forma a mitad de temporada sin empezar de nuevo.'],
 futsal:['Tres formas de futsal en una página: el cuadrado 2-2, el 1-2-1 en rombo y el 3-1. Un equipo de futsal tiene cuatro jugadores de cancha y un portero, y los jugadores de cancha rotan todo el tiempo, así que una forma en futsal es más una imagen de inicio y unas líneas de pase que un juego fijo de posiciones.',
  'Los entrenadores la imprimen para la primera sesión de una temporada de futsal de invierno, cuando los jugadores de cancha abierta conocen por primera vez al cierre, a los alas y al pívot. Empieza con el 2-2, el más sencillo de explicar, y luego muestra el rombo cuando los jugadores sepan pasar y moverse. La línea debajo de cada forma dice para quién es ideal.'],
};
const FIELD_ES:Readonly<Record<string,string>>={'7v7':'cancha de fútbol 7v7','9v9':'cancha de fútbol 9v9','11v11':'cancha de fútbol 11v11',futsal:'cancha de futsal'};
export const fieldNameEs=(f:string)=>FIELD_ES[f];
const tpl=(f:string,n:number,title:string,description:string):PrintableEs=>({crumb:f==='futsal'?'Cancha de futsal en blanco':`Cancha ${f} en blanco`,title,h1:`Plantilla de ${FIELD_ES[f]} en blanco`,description,
 lead:`Plantillas de ${FIELD_ES[f]} para imprimir, dibujar y compartir: ${n} hojas, cada una como un PNG del tamaño de una página y un SVG nítido.`,
 blurb:`${n} hojas de ${FIELD_ES[f]} en blanco: lisas, con tercios y con zonas`,use:TEMPLATE_USE_ES[f]});
const cheat=(f:string,n:number,shapes:string,title:string,description:string):PrintableEs=>({crumb:f==='futsal'?'Hoja de referencia de futsal':`Hoja de referencia ${f}`,title,
 h1:f==='futsal'?'Hoja de referencia de formaciones de futsal':`Hoja de referencia de formaciones de fútbol ${f}`,description,
 lead:`Cada formación de ${f==='futsal'?'futsal':`fútbol ${f}`} de Futbol Island, dibujada en una página para imprimir: ${shapes}.${f==='futsal'?' El futsal es el juego de cinco por lado bajo techo.':''}`,
 blurb:`${n} formas de ${f==='futsal'?'futsal':f} en una página`,use:CHEAT_USE_ES[f]});
/** Keyed by the English printable slug (lib/site/tools/printables.ts PRINTABLES), same order. */
export const PRINTABLES_ES:Readonly<Record<string,PrintableEs>>={
 'blank-7v7-soccer-field':tpl('7v7',8,'Plantilla de cancha de fútbol 7v7 en blanco para imprimir','Un diagrama de cancha de fútbol 7v7 en blanco para imprimir: vertical u horizontal, liso, con tercios o con zonas. SVG y PNG gratis.'),
 'blank-9v9-soccer-field':tpl('9v9',6,'Plantilla de cancha de fútbol 9v9 en blanco para imprimir','Un diagrama de cancha de fútbol 9v9 en blanco para imprimir: vertical u horizontal, liso, con tercios o con zonas. Descargas gratis para entrenadores.'),
 'blank-11v11-soccer-field':tpl('11v11',6,'Plantilla de cancha de fútbol 11v11 en blanco gratis','Un diagrama de cancha de fútbol 11v11 en blanco para imprimir: vertical u horizontal, liso, con tercios o con zonas. Para entrenadores y maestros.'),
 'blank-futsal-court':tpl('futsal',6,'Plantilla de cancha de futsal en blanco para imprimir','Un diagrama de cancha de futsal en blanco para imprimir: vertical u horizontal, liso, con tercios o con zonas. SVG y PNG gratis para entrenadores.'),
 '7v7-soccer-formations-cheat-sheet':cheat('7v7',4,'2-3-1, 3-2-1, 2-2-2, 3-1-2','Hoja de referencia de formaciones de fútbol 7v7','Las 4 formaciones de fútbol 7v7 en una página para imprimir, cada una en una cancha pequeña con los números. PNG y SVG gratis para entrenadores y padres.'),
 '9v9-soccer-formations-cheat-sheet':cheat('9v9',5,'3-2-3, 3-3-2, 2-3-2-1, 3-1-3-1, 4-3-1','Hoja de referencia de formaciones de fútbol 9v9','Las 5 formaciones de fútbol 9v9 en una página para imprimir, cada una en una cancha pequeña con los números de los jugadores. PNG y SVG gratis.'),
 '11v11-soccer-formations-cheat-sheet':cheat('11v11',4,'4-3-3, 4-4-2, 4-2-3-1, 3-5-2','Hoja de referencia de formaciones de fútbol 11v11','Las 4 formaciones de fútbol 11v11 en una página para imprimir, cada una en una cancha completa pequeña con los números. Gratis en PNG y SVG.'),
 'futsal-formations-cheat-sheet':cheat('futsal',3,'2-2, 1-2-1 en rombo, 3-1','Hoja de referencia de formaciones de futsal','Las 3 formaciones de futsal en una página para imprimir, cada una en una cancha pequeña con las letras de los jugadores. PNG y SVG gratis.'),
 'soccer-positions-and-numbers':{crumb:'Posiciones y números',title:'Posiciones y números del fútbol: cuadro para imprimir',h1:'Cuadro de posiciones y números del fútbol',
  description:'Un cuadro para imprimir con las posiciones del fútbol y sus números, del 1 al 11, en una cancha: portero, defensas, mediocampistas, extremos y delantero.',
  lead:'Las once posiciones del fútbol en una página, cada una con el número que usan los entrenadores para ella, del portero (1) al extremo izquierdo (11).',
  blurb:'Los números del 1 al 11 en una cancha, con el nombre de cada posición',
  use:['Cuando un entrenador dice “pásala al seis” o “nuestro nueve baja”, usa los números como nombres de posiciones. Esta hoja muestra la costumbre que sigue la mayoría de los entrenadores: 1 para el portero, 2 y 3 para los laterales, 4 y 5 para los defensas centrales, 6, 8 y 10 en el mediocampo, 7 y 11 en las bandas y 9 para el delantero centro. Está dibujada en un 4-3-3, la forma en la que cada número tiene un lugar claro.',
   'Imprímela para los jugadores que suben al 11v11, para los padres nuevos en el fútbol o para la pared de un salón de clases. Pide a los jugadores que encuentren su propio número y luego el número del compañero al que más le pasan. Los números son una costumbre de los entrenadores, no una regla: un jugador puede usar cualquier número en la camiseta, y algunos países usan los números de otra forma. Por eso la hoja lo dice en una esquina.']},
};

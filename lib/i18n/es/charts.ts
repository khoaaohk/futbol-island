import {CHARTS,SIZES_SEASON} from '@/lib/site/sizes';
import {FAMILY_CHECKED} from '@/lib/site/checked';
import {longDateEs} from './ui';
import type {ChartEs,LinkEs} from './types';
/**
 * The Spanish size charts (Spanish round D, Nov 16 2026): the words of lib/site/sizes.ts CHARTS, keyed by slug. Tables, rows,
 * sections and FAQ are 1:1 with English (checked below); numbers, units (yards first) and U-labels kept. Sources unchanged.
 */
const S=SIZES_SEASON;
const LEAGUE=`Normas típicas del fútbol juvenil en EE. UU. para la temporada ${S}; tu liga puede ser diferente. Revisado el ${longDateEs(FAMILY_CHECKED.sizes)}.`;
/** The 2026-27 birth-date range of U<n> on the August 1 to July 31 cycle (as lib/site/sizes.ts born()). */
const born=(n:number)=>`1 ago ${2026-n} a 31 jul ${2027-n}`;
const FORMAT=(n:number)=>n<=8?'4v4':n<=10?'7v7':n<=12?'9v9':'11v11';
const BALLSIZE=(n:number)=>n<=8?'3':n<=12?'4':'5';
const LENGTH=(n:number)=>n<=8?'4 cuartos de 10 min':n<=10?'2 tiempos de 25 min':n<=12?'2 tiempos de 30 min':n<=14?'2 tiempos de 35 min':n<=16?'2 tiempos de 40 min':'2 tiempos de 45 min';
const AGE_ROWS=[6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(n=>[`U${n}`,`${n} años o menos`,born(n),FORMAT(n),BALLSIZE(n),LENGTH(n),n<=12?'USSF':'USYS']);

export const CHARTS_ES:Readonly<Record<string,ChartEs>>={
 'soccer-ball-size-by-age':{crumb:'Tamaño del balón por edad',blurb:'Qué balón comprar: tamaño 3, 4 o 5 para cada categoría, en una tabla',
  title:'Tamaño del balón de fútbol por edad: 3, 4 o 5 (tabla)',h1:'Tamaño del balón de fútbol por edad',
  description:'Qué tamaño de balón necesita tu hijo: tamaño 3 hasta los 8 años, tamaño 4 de 9 a 12 y tamaño 5 desde los 13. Tabla por edad, con sus fuentes.',
  lead:'Un balón de fútbol viene en tres tamaños de partido. En el fútbol juvenil de EE. UU., los niños de 8 años o menos usan un tamaño 3, los de 9 a 12 años usan un tamaño 4 y los de 13 años o más usan un tamaño 5, el mismo balón que usan los adultos.',
  more:'Compra el tamaño con el que juega la categoría de tu hijo, no el tamaño al que va a llegar. Un balón demasiado grande y pesado es más difícil de controlar y de patear bien.',
  tables:[
   {title:'Tabla de tamaños de balón por categoría de edad',head:['Categoría','Edades','Tamaño del balón','Partido','Fuente'],
    rows:[['U6, U7, U8','8 años o menos','Tamaño 3','4v4','USSF, USYS'],['U9, U10','9 y 10 años','Tamaño 4','7v7','USSF, USYS'],['U11, U12','11 y 12 años','Tamaño 4','9v9','USSF, USYS'],['U13 a U19','13 años o más','Tamaño 5','11v11','USYS'],['Adultos','','Tamaño 5','11v11','IFAB']],
    note:`USSF = estándares de juego reducido de U.S. Soccer. USYS = reglas de juego de US Youth Soccer, diciembre de 2025. IFAB = Reglas de Juego, Regla 2. AYSO usa los mismos tamaños en sus divisiones de 6U a 19U. ${LEAGUE}`},
   {title:'¿Qué tan grande es cada balón?',intro:'El número del tamaño viene impreso en el balón. Si se borró, mide alrededor de la parte central con una cinta métrica.',head:['Balón','Circunferencia','Peso','Fuente'],
    rows:[['Tamaño 3','23 a 24 in (58 a 61 cm)','11 a 12 oz','USYS'],['Tamaño 4','25 a 26 in (64 a 66 cm)','11 a 13 oz','USYS'],['Tamaño 5','27 a 28 in (68 a 70 cm)','14 a 16 oz (410 a 450 g)','USYS, IFAB'],['Balón de futsal','62 a 64 cm (unas 24.5 a 25 in)','400 a 440 g (unas 14 a 15.5 oz)','FIFA']],
    note:'Las pulgadas y las onzas son de la Regla 303 de US Youth Soccer; los centímetros de los tamaños 3 y 4 son esas pulgadas convertidas y redondeadas. El tamaño 5 y el balón de futsal llevan las cifras de las Reglas. AYSO da pesos un poco diferentes para los tamaños 3 y 4.'}],
  sections:[
   {title:'Cómo elegir el balón correcto',items:['Guíate por la categoría en la que juega tu hijo, como U10, no por su estatura ni por su nivel.','Si tu hijo juega en una categoría mayor, usa el balón que ese equipo usa en los partidos.',
    'Revisa el número impreso cerca de la válvula: 3, 4 o 5.','Para practicar en casa, el tamaño de partido es la mejor opción. El primer toque y el pase se sienten distintos con cada tamaño.',
    'Un balón de futsal no es un balón de fútbol pequeño. Pesa más para su tamaño, está hecho para rebotar poco y es solo para futsal.']},
   {title:'Por qué los niños usan un balón más pequeño',items:['Un balón más pequeño y ligero va con un pie más pequeño, así un niño puede golpearlo por el centro.','Las Reglas de Juego permiten que el fútbol juvenil cambie el tamaño, el peso y el material del balón.',
    'Los estándares de juego reducido de U.S. Soccer ajustan el balón a la cancha y al número de jugadores, para que cada niño toque más el balón.','La FA de Inglaterra usa otras franjas: tamaño 3 hasta sub-11, tamaño 4 en sub-12 y sub-13, y tamaño 5 desde sub-14.']}],
  faq:[{q:'¿Qué tamaño de balón necesita un niño de 7 años?',a:'Un tamaño 3. En los estándares juveniles de EE. UU., todas las categorías hasta U8 juegan con un balón tamaño 3.'},
   {q:'¿Qué tamaño de balón necesita un niño de 10 años?',a:'Un tamaño 4. Los equipos de U9 a U12, es decir, niños de 9 a 12 años, usan un tamaño 4 en los estándares de U.S. Soccer y de US Youth Soccer.'},
   {q:'¿A qué edad se usa un balón tamaño 5?',a:'Desde U13, es decir, 13 años o menos, en adelante. El tamaño 5 es el balón completo del fútbol de adultos: de 27 a 28 pulgadas de circunferencia.'},
   {q:'¿Un balón tamaño 4 es mucho más pequeño que un tamaño 5?',a:'Tiene unas 2 pulgadas menos de circunferencia: de 25 a 26 pulgadas contra 27 a 28. También es más ligero: de 11 a 13 onzas contra 14 a 16.'},
   {q:'¿De qué tamaño es un balón de futsal?',a:'Las Reglas de Futsal dan de 62 a 64 cm de circunferencia y de 400 a 440 g. Es parecido a un tamaño 4 de ancho, pero pesa más y está hecho para rebotar menos.'}],
  pictureTitle:'Tamaño del balón de fútbol por edad'},

 'soccer-field-size-by-age':{crumb:'Tamaño de la cancha por edad',blurb:'Cancha, arco y duración del partido para 4v4, 7v7, 9v9 y 11v11, en una tabla',
  title:'Tamaño de la cancha de fútbol por edad: tabla juvenil',h1:'Tamaño de la cancha de fútbol por edad',
  description:'Medidas de la cancha de fútbol juvenil por edad: canchas de 4v4, 7v7, 9v9 y 11v11 en yardas, tamaño del arco, jugadores y duración, con fuentes.',
  lead:'Una cancha de fútbol juvenil crece con los niños. En los estándares de U.S. Soccer, los menores de 8 años juegan 4v4 en una cancha de unas 30 yardas de largo, los menores de 10 juegan 7v7 en unas 60 yardas, los menores de 12 juegan 9v9 en unas 75 yardas y, desde U13, los equipos juegan 11v11 en una cancha de tamaño completo.',
  more:'Los estándares dan un rango, no un solo número, porque los parques y las escuelas tienen espacios distintos. Tu liga elige un tamaño dentro del rango.',
  tables:[
   {title:'Tabla de tamaños de cancha de fútbol juvenil',head:['Categoría','Partido','Jugadores','Largo de la cancha','Ancho de la cancha','Arco más grande','Duración','Balón','Fuente'],
    rows:[['U6, U7, U8','4v4','4, sin portero','25 a 35 yd','15 a 25 yd','4 ft de alto, 6 ft de ancho','4 x 10 min','3','USSF'],
     ['U9, U10','7v7','7, con portero','55 a 65 yd','35 a 45 yd','6.5 ft de alto, 18.5 ft de ancho','2 x 25 min','4','USSF'],
     ['U11, U12','9v9','9, con portero','70 a 80 yd','45 a 55 yd','7 ft de alto, 21 ft de ancho','2 x 30 min','4','USSF'],
     ['U13, U14','11v11','11, con portero','100 a 130 yd','50 a 100 yd','8 ft de alto, 24 ft de ancho','2 x 35 min','5','IFAB, USYS'],
     ['U15, U16','11v11','11, con portero','100 a 130 yd','50 a 100 yd','8 ft de alto, 24 ft de ancho','2 x 40 min','5','IFAB, USYS'],
     ['U17 a U19','11v11','11, con portero','100 a 130 yd','50 a 100 yd','8 ft de alto, 24 ft de ancho','2 x 45 min','5','IFAB, USYS']],
    note:`USSF = estándares de juego reducido de U.S. Soccer (cancha, arco, jugadores, duración). IFAB = Reglas de Juego, Regla 1 (la cancha y el arco de tamaño completo). USYS = reglas de juego de US Youth Soccer, diciembre de 2025 (duración y balón desde U13). U.S. Soccer recomienda un arco más pequeño que el máximo permitido: 6.5 x 12 ft para 7v7 y 6.5 x 18.5 ft para 9v9. ${LEAGUE}`},
   {title:'Marcas de la cancha de tamaño completo (11v11)',intro:'Son iguales en toda cancha de tamaño completo, sin importar su largo ni su ancho.',head:['Marca','Medida','Fuente'],
    rows:[['Arco','8 yd de ancho, 8 ft de alto (7.32 m x 2.44 m)','IFAB'],['Área penal','18 yd desde cada poste y 18 yd hacia dentro de la cancha (16.5 m)','IFAB'],['Área chica','6 yd desde cada poste y 6 yd hacia dentro de la cancha (5.5 m)','IFAB'],
     ['Punto penal','12 yd desde la línea de meta (11 m)','IFAB'],['Círculo central','10 yd de radio (9.15 m)','IFAB'],['Arco de esquina','1 yd de radio (1 m)','IFAB'],['Partidos internacionales','110 a 120 yd de largo, 70 a 80 yd de ancho','IFAB']],
    note:'Reglas de Juego, Regla 1. Las líneas son parte de las áreas que marcan, así que una falta sobre la línea del área penal es dentro del área penal.'}],
  sections:[
   {title:'Qué cambia en una cancha pequeña',items:['Una cancha de 4v4 no tiene porteros ni fuera de juego.','Una cancha de 7v7 tiene una línea de salida en cada mitad, a medio camino entre el área penal y la línea media.',
    'Una cancha de 9v9 no tiene línea de salida. Es una copia más pequeña de la cancha completa, con fuera de juego desde la línea media.','El área penal, el área chica y el círculo central son más pequeños en las canchas de 7v7 y 9v9. El diagrama de la cancha de tu liga tiene las medidas exactas.',
    'La FA de Inglaterra usa otros formatos y medidas: 5v5 en unas 40 x 30 yardas, 7v7 en unas 60 x 40 yardas y 9v9 en unas 80 x 50 yardas.']},
   {title:'Por qué los niños no juegan en una cancha completa',items:['Menos jugadores en una cancha más pequeña significa que cada niño toca el balón más seguido.','Los arcos a la medida del portero hacen posibles las atajadas, así mejoran tanto el tiro como el trabajo del portero.',
    'Las distancias cortas hacen que el juego sea de pasar y moverse, no del pelotazo más largo.','Las Reglas de Juego permiten que el fútbol juvenil cambie el tamaño de la cancha y de los arcos, la duración del partido y el número de jugadores.']}],
  faq:[{q:'¿Qué tan grande es una cancha de 7v7?',a:'En los estándares de U.S. Soccer, de 55 a 65 yardas de largo y de 35 a 45 yardas de ancho, para equipos U9 y U10. El arco más grande permitido mide 6.5 pies de alto y 18.5 pies de ancho.'},
   {q:'¿Qué tan grande es una cancha de 9v9?',a:'En los estándares de U.S. Soccer, de 70 a 80 yardas de largo y de 45 a 55 yardas de ancho, para equipos U11 y U12. El arco más grande permitido mide 7 pies de alto y 21 pies de ancho.'},
   {q:'¿Qué tan grande es una cancha de tamaño completo?',a:'Las Reglas de Juego permiten de 100 a 130 yardas de largo y de 50 a 100 yardas de ancho. Para partidos internacionales, el rango es de 110 a 120 yardas por 70 a 80 yardas.'},
   {q:'¿Qué tan grande es una cancha de U8?',a:'En los estándares de U.S. Soccer, los equipos de U6 a U8 juegan 4v4 en una cancha de 25 a 35 yardas de largo y de 15 a 25 yardas de ancho, con arcos de no más de 4 por 6 pies.'},
   {q:'¿Qué tan grande es un arco de fútbol?',a:'Un arco de tamaño completo mide 8 yardas de ancho y 8 pies de alto. Los arcos juveniles son más pequeños: como máximo 4 x 6 pies para 4v4, 6.5 x 18.5 pies para 7v7 y 7 x 21 pies para 9v9.'}],
  pictureTitle:'Tamaño de la cancha de fútbol por edad'},

 'soccer-age-groups':{crumb:'Categorías de edad',blurb:'De U6 a U19: las fechas de nacimiento de cada categoría y el partido que juega',
  title:'Categorías del fútbol por edad: tabla sub-6 a sub-19',h1:'Categorías de edad del fútbol: de U6 a U19',
  description:`Qué significa U8, U10 o U12 en el fútbol juvenil: tabla de categorías ${S} de U6 a U19 con fechas de nacimiento, formato, balón y duración.`,
  lead:'En el fútbol juvenil, la “U” significa “menores de”, así que un equipo U10 es para niños de 10 años o menos. Cada categoría tiene su propio partido: 4v4 hasta U8, 7v7 en U9 y U10, 9v9 en U11 y U12, y 11v11 desde U13.',
  more:`La categoría de un niño depende de su fecha de nacimiento y de la fecha de corte que usa su liga. Para la temporada ${S}, las organizaciones juveniles más grandes de EE. UU. cambiaron la fecha de corte del 1 de enero al 1 de agosto.`,
  tables:[
   {title:`Tabla de categorías de edad del fútbol para la temporada ${S}`,intro:'Las fechas de nacimiento son para las ligas que usan el corte del 1 de agosto: US Youth Soccer, US Club Soccer y AYSO.',head:['Categoría','Significa','Nacidos','Partido','Balón','Duración','Fuente'],rows:AGE_ROWS,
    note:`Fechas de nacimiento: el ciclo del 1 de agosto al 31 de julio que US Youth Soccer, US Club Soccer y AYSO anunciaron para ${S}. USSF = estándares de juego reducido de U.S. Soccer (partido, balón y duración hasta U12). USYS = reglas de juego de US Youth Soccer, diciembre de 2025 (balón y duración desde U13). AYSO escribe las mismas categorías como 6U, 8U, 10U, etc. ${LEAGUE}`}],
  sections:[
   {title:'Cómo encontrar la categoría de tu hijo',items:[`Busca la temporada. La temporada ${S} va del 1 de agosto de 2026 al 31 de julio de 2027.`,'Busca la fecha de nacimiento de tu hijo en la columna “Nacidos” de la tabla.',
    'Un niño nacido el 1 de agosto o después está en una categoría menor que un niño nacido en julio del mismo año.','Pregunta al club qué fecha de corte usa. U.S. Soccer deja que cada organización miembro elija, así que algunas ligas todavía pueden agrupar por año de nacimiento.',
    'Por lo general, un niño puede jugar en una categoría mayor si el club y la liga están de acuerdo.']},
   {title:'Categorías por año de nacimiento y por año escolar',items:['Desde 2017 hasta la temporada 2025-26, el fútbol juvenil de EE. UU. agrupó a los niños por año de nacimiento, del 1 de enero al 31 de diciembre. U.S. Soccer lo eligió para coincidir con el fútbol internacional.',
    'Con ese sistema, un equipo U10 en una temporada era para los niños que cumplían 10 años, o menos, en el año en que terminaba la temporada.',
    `Desde ${S}, US Youth Soccer, US Club Soccer y AYSO agrupan a los niños del 1 de agosto al 31 de julio, algo parecido a un año escolar, así más compañeros de clase juegan juntos.`,
    'La FA de Inglaterra también usa años escolares, y sus formatos son distintos: 3v3 en sub-7, 5v5 en sub-8 y sub-9, 7v7 en sub-10 y sub-11, 9v9 en sub-12 y sub-13.']},
   {title:'Qué partido juega cada categoría',items:['U6, U7, U8: 4v4 sin porteros, sin fuera de juego y sin cabecear. Cuatro cuartos cortos.','U9, U10: 7v7 con porteros, una línea de salida y sin cabecear. Dos tiempos de 25 minutos.',
    'U11, U12: 9v9. Fuera de juego desde la línea media. Dos tiempos de 30 minutos.','U13 y mayores: 11v11 en una cancha de tamaño completo con un balón tamaño 5. Los tiempos crecen de 35 a 45 minutos.']}],
  faq:[{q:'¿Qué significa U10 en el fútbol?',a:'Menores de 10: un equipo para niños de 10 años o menos. Es lo mismo que 10U en AYSO. La mayoría de los niños de un equipo U10 tienen 9 años cuando empieza la temporada.'},
   {q:'¿Qué edad es U12 en el fútbol?',a:`Niños de 12 años o menos. Para la temporada ${S}, con el corte del 1 de agosto, son los nacidos del 1 de agosto de 2014 al 31 de julio de 2015.`},
   {q:'¿Cuándo empiezan los niños a jugar 11v11?',a:'En U13, según los estándares de U.S. Soccer. Antes, los niños juegan 4v4, luego 7v7 en U9 y U10, y luego 9v9 en U11 y U12.'},
   {q:'¿Cambiaron las categorías de edad del fútbol en 2026?',a:`Sí. US Youth Soccer, US Club Soccer y AYSO pasaron de categorías por año de nacimiento a un ciclo del 1 de agosto al 31 de julio, a partir de la temporada ${S}.`},
   {q:'¿Mi hijo puede jugar en una categoría mayor?',a:'Por lo general sí, si el club y la liga están de acuerdo. A esto se le llama jugar en una categoría superior. Reglas como no cabecear a los 10 años o menos siguen la edad del propio niño en US Youth Soccer.'}],
  pictureTitle:'Categorías de edad del fútbol'},
};
/** The two empty fields of the field-size chart (ChartView FIELDS), Spanish words. */
export const CHART_FIELDS_ES={title:'Una cancha de 7v7 junto a una cancha de tamaño completo',scenes:[
 {title:'Una cancha de 7v7',caption:'Una cancha de 7v7 vacía: de 55 a 65 yardas de largo. Las líneas discontinuas son las dos líneas de salida.'},
 {title:'Una cancha 11v11 de tamaño completo',caption:'Una cancha de tamaño completo vacía: de 100 a 130 yardas de largo, con el área penal, el área chica, el círculo central y los puntos penales.'}]} as const;
/** Spanish names and lines of the English pages the charts and hubs link to (keyed by English path; shown only when hasEs). */
export const LINKS_ES:Readonly<Record<string,LinkEs>>={
 '/tools/soccer-match-timer':{name:'Reloj y marcador de fútbol',line:'Un reloj de partido con los tiempos o cuartos de cada categoría'},/* Nov 22 2026 */
 '/tools/youth-soccer-field-size-guide':{name:'Guía de medidas de canchas de fútbol infantil',line:'Cada modalidad a escala, con un plan de conos para marcarla'},
 '/tools/soccer-juggling-challenge':{name:'Reto de dominadas de fútbol',line:'Niveles de 5 a 100 toques y un registro de récords'},
 '/tools/soccer-team-name-generator':{name:'Generador de nombres de equipos de fútbol',line:'Nombres para un equipo infantil nuevo'},
 '/tools/8v8-lineup-builder':{name:'Creador de alineaciones de fútbol 8',line:'El fútbol 8 de España: portero y siete, con su cancha y sus reglas'},/* round 4D */
 '/learn/soccer-ball-size-by-age':{name:'Tamaño del balón de fútbol por edad',line:'Tamaño 3, 4 o 5 para cada categoría, con una tabla'},
 '/learn/soccer-field-size-by-age':{name:'Tamaño de la cancha de fútbol por edad',line:'Cancha, arco y duración del partido para cada categoría'},
 '/learn/soccer-age-groups':{name:'Las categorías de edad del fútbol explicadas',line:'De U6 a U19, fechas de nacimiento y el partido de cada una'},
 '/learn/soccer-rules':{name:'Reglas del fútbol para niños',line:'Cada regla con un diagrama'},
 '/learn/soccer-rules/substitutions-and-game-length':{name:'Cambios y duración del partido por edad',line:'Cuánto dura un partido y cómo funcionan los cambios'},
 '/learn/soccer-rules/build-out-line':{name:'La línea de salida en 7v7',line:'La línea discontinua de una cancha de 7v7'},
 '/learn/soccer-rules/heading-rules-for-kids':{name:'Reglas para cabecear en EE. UU.',line:'No se cabecea a los 10 años o menos'},
 '/learn/7v7-soccer-formations':{name:'Formaciones de fútbol 7v7',line:'Formas para equipos U9 y U10'},
 '/learn/8v8-soccer-formations':{name:'Formaciones de fútbol 8',line:'Formas para la modalidad de ocho que se juega en España'},/* round 4F */
 '/learn/9v9-soccer-formations':{name:'Formaciones de fútbol 9v9',line:'Formas para equipos U11 y U12'},
 '/learn/11v11-soccer-formations':{name:'Formaciones de fútbol 11v11',line:'Formas para el juego completo'},
 '/learn/soccer-rules/futsal-rules':{name:'Reglas del futsal que son diferentes del fútbol',line:'Un balón más pequeño, una cancha más pequeña'},
 '/tools/soccer-playing-time-calculator':{name:'Calculadora de minutos de juego',line:'Reparte el partido de forma justa: un plan de cambios para cualquier plantel'},
};
for(const c of CHARTS){const e=CHARTS_ES[c.slug];if(!e)throw new Error(`Spanish chart "${c.slug}" is missing`);
 if(e.tables.length!==c.tables.length||e.sections.length!==c.sections.length||e.faq.length!==c.faq.length)throw new Error(`Spanish chart ${c.slug}: not 1:1 with English`);
 e.tables.forEach((t,i)=>{if(t.rows.length!==c.tables[i].rows.length||t.head.length!==c.tables[i].head.length)throw new Error(`Spanish chart ${c.slug} table ${i}: rows/head not 1:1`);});
 e.sections.forEach((s,i)=>{if(s.items.length!==c.sections[i].items.length)throw new Error(`Spanish chart ${c.slug} section ${i}: items not 1:1`);});}

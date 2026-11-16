import type {Faq} from './types';
import type {DrillEs} from './drillTypes';
import {DRILLS_A_ES} from './drillsA';
import {DRILLS_B_ES} from './drillsB';
import {DRILLS_C_ES} from './drillsC';
import {DRILLS_D_ES} from './drillsD';
/**
 * Spanish drills and practice plans, shared words (Spanish round C, Nov 16 2026): the hubs, the skills, the stage names and the
 * one-line safety notes of lib/site/drills.ts and lib/site/plans.ts. The drills themselves are in drillsA-D.ts, the guides in
 * drillGuides.ts, the plans in plans.ts (all keyed by the English slug, merged by drillsRegistry.ts).
 */
export const DRILLS_ES:Readonly<Record<string,DrillEs>>={...DRILLS_A_ES,...DRILLS_B_ES,...DRILLS_C_ES,...DRILLS_D_ES};
export const AGE_YEARS_ES:Readonly<Record<string,string>>={U6:'5 y 6 años',U8:'7 y 8 años',U10:'9 y 10 años',U12:'11 y 12 años'};
const FIRST:Readonly<Record<string,string>>={U6:'5',U8:'7',U10:'9',U12:'11'},LAST:Readonly<Record<string,string>>={U6:'6',U8:'8',U10:'10',U12:'12'};
/** lib/site/drills.ts agesText in Spanish: "U6 (5 y 6 años)", "U6 a U12 (de 5 a 12 años)". */
export const agesTextEs=(a:readonly string[])=>a.length===1?`${a[0]} (${AGE_YEARS_ES[a[0]]})`:`${a[0]} a ${a[a.length-1]} (de ${FIRST[a[0]]} a ${LAST[a[a.length-1]]} años)`;
export const SKILLS_ES:Readonly<Record<string,{name:string;line:string}>>={
 'dribbling':{name:'Regate y dominio del balón',line:'Un balón cada uno: muchos toques, giros y cambios de ritmo.'},
 'first-touch':{name:'Primer toque',line:'Recibir el balón para que la siguiente acción sea fácil.'},
 'passing':{name:'Pases y recepción',line:'Pasar a un compañero y moverse para volver a ayudar.'},
 'shooting':{name:'Tiro y definición',line:'Tirar al arco, y qué hacer después del tiro.'},
 'attacking-1v1':{name:'Ataque 1v1',line:'Superar a un defensa con un cambio de ritmo o de dirección.'},
 'defending-1v1':{name:'Defensa 1v1',line:'Quedarse del lado del arco, frenar al atacante y ganar el balón.'},
 'scanning':{name:'Mirar alrededor',line:'Mirar alrededor antes de que llegue el balón.'},
 'small-sided':{name:'Partidos reducidos',line:'Partidos de verdad con pocos jugadores, para que todos toquen el balón.'},
 'goalkeeper':{name:'Bases del portero',line:'Pies, manos seguras y empezar el ataque. Desde U10, con balones suaves.'},
 'warm-up':{name:'Calentamientos y juegos divertidos',line:'Juegos para empezar el entrenamiento con un balón y una sonrisa.'},
};
export const DRILL_SAFETY_LINE_ES='Cambia el tamaño del área según tu grupo: más grande lo hace más fácil para el jugador con el balón, más pequeña lo hace más difícil. Todo el que sale vuelve a entrar enseguida, y nadie da vueltas corriendo a la cancha.';
export const DRILLS_HUB_ES=(n:number)=>({crumb:'Ejercicios de fútbol',blurb:`${n} ejercicios y juegos de fútbol para U6 a U12, cada uno con diagrama, puntos clave y la lección que entrena`,
 title:'Ejercicios de fútbol para niños: juegos por edad y habilidad',h1:'Ejercicios de fútbol para niños',
 description:'Ejercicios y juegos de fútbol divertidos para niños de 5 a 12 años, por habilidad y por edad. Cada uno con diagrama, pasos, puntos clave y preguntas.',
 lead:`Aquí tienes ${n} ejercicios y juegos de fútbol para jugadores de 5 a 12 años. Cada uno tiene un diagrama del montaje con medidas en yardas, pasos numerados, puntos clave cortos para decir en voz alta y el momento de un partido de verdad para el que prepara.`,
 more:'Elige por habilidad o por edad. Todos los ejercicios mantienen a cada niño en movimiento con un balón: sin filas, sin vueltas a la cancha y sin charlas largas. Cada uno enlaza también con una lección gratis de Futbol Island que enseña la misma idea en una cancha en movimiento.',
 how:['Cada niño tiene un balón siempre que el ejercicio lo permita.','Jueguen primero, luego para el juego para un solo punto clave, y vuelvan a jugar.','Si un niño queda “fuera”, dale una tarea rápida que lo devuelva al juego.','Termina cada entrenamiento con un partido pequeño, como 3v3 o 4v4.','Haz descansos para tomar agua seguido, y más seguido con calor.'],
 faq:[{q:'¿Cuáles son los mejores ejercicios de fútbol para principiantes?',a:'Los juegos en los que cada niño tiene un balón: Tiburones y pececitos, Luz roja, luz verde, Regate por las puertas y Piratas y tesoro. Enseñan a conducir y a frenar el balón sin que nadie haga fila.'},
  {q:'¿Cuántos ejercicios debo usar en un entrenamiento?',a:'Dos o tres, más un partido al final. Los jugadores pequeños necesitan tiempo para dominar un juego, así que es mejor repetir uno favorito que explicar uno nuevo cada diez minutos.'},
  {q:'¿Qué ejercicios de fútbol pueden hacer los niños en casa?',a:'Los toques con la suela, el zigzag entre conos, los pases contra la pared y Gira y sal funcionan solos y en poco espacio. Nuestra página de ejercicios en casa reúne los que necesitan un jugador o un jugador y un adulto.'},
  {q:'¿Deben los niños pequeños practicar el cabeceo?',a:'No. En el fútbol juvenil de Estados Unidos, los jugadores de 10 años o menos no cabecean en partidos ni en entrenamientos, y el cabeceo en el entrenamiento está limitado a los 11 y 12 años. Ningún ejercicio de esta página usa el cabeceo.'},
  {q:'¿Cuánto debe durar un entrenamiento de fútbol?',a:'La guía de entrenadores de US Youth Soccer sugiere unos 45 minutos en U6, de 45 a 60 en U8, de 60 a 75 en U10 y 75 en U12. Nuestros planes de entrenamiento siguen esas duraciones.'}] as Faq[]});

// ---- practice plans ----------------------------------------------------------------------------------------------------------
export const STAGE_ES:Readonly<Record<string,string>>={Welcome:'Bienvenida',Play:'Jugar',Practice:'Practicar',Break:'Descanso',Finish:'Cierre'};
export const PRACTICE_RANGE_ES:Readonly<Record<string,string>>={U6:'45 minutos',U8:'45 a 60 minutos',U10:'60 a 75 minutos',U12:'75 minutos'};
/** lib/site/plans.ts FIELD (the final game of each age). */
export const FIELD_ES:Readonly<Record<string,string>>={U6:'4v4 sin porteros, en unas 30 x 20 yardas',U8:'4v4 sin porteros, en unas 30 x 20 yardas',U10:'Hasta 7v7 con porteros; una cancha de 7v7 mide de 55 a 65 yardas de largo',U12:'Hasta 9v9 con porteros; una cancha de 9v9 mide de 70 a 80 yardas de largo'};
export const PPP_LINE_ES='Estos planes siguen la estructura Jugar-Practicar-Jugar que U.S. Soccer enseña a los entrenadores de base: los jugadores llegan y juegan partidos pequeños, luego practican la idea del día en actividades parecidas al partido, y terminan con un partido. La estructura es de U.S. Soccer; los minutos de cada parte son nuestros, así que ajústalos a tu grupo.';
export const PLAN_SAFETY_LINE_ES='Haz descansos para tomar agua más seguido cuando hace calor, nunca uses correr como castigo, y cambia el tamaño de cualquier área que sea demasiado difícil o demasiado fácil.';
export const PLANS_HUB_ES=(n:number)=>({crumb:'Planes de entrenamiento',blurb:`${n} planes de entrenamiento de fútbol listos para U6, U8, U10 y U12, con tabla de tiempos, material y ejercicios enlazados`,
 title:'Planes de entrenamiento de fútbol para niños: U6 a U12',h1:'Planes de entrenamiento de fútbol para niños',
 description:'Planes de entrenamiento de fútbol gratis para U6, U8, U10 y U12: el primer entrenamiento y sesiones por tema, con tabla de tiempos, ejercicios y material.',
 lead:`Aquí tienes ${n} planes de entrenamiento de fútbol listos para entrenadores voluntarios: tres para cada edad, U6, U8, U10 y U12. Cada plan tiene una tabla de tiempos, una lista de material, enlaces a cada ejercicio con su diagrama y un cambio para cuando las cosas salen mal.`,
 more:'Cada edad tiene un plan para el primer entrenamiento de la temporada y dos planes por tema. Se imprimen en una página, así que puedes llevar uno a la cancha.',
 stages:[['Jugar','Los jugadores entran a un partido pequeño, como 2v2 o 3v3, en cuanto llegan. El entrenador observa y habla poco. El juego lleva a los jugadores hacia la idea del día.'],
  ['Practicar','Una o dos actividades parecidas al partido sobre esa idea, con repeticiones y un reto. Aquí es donde el entrenador enseña: una demostración corta, una pregunta, una palabra clave.'],
  ['Jugar','Un partido en un formato parecido al del día de partido. Los jugadores prueban lo que practicaron y el entrenador casi siempre los deja jugar.']] as [string,string][],
 lengths:[['U6','45 minutos','4v4, sin porteros','Tamaño 3'],['U8','45 a 60 minutos','4v4, sin porteros','Tamaño 3'],['U10','60 a 75 minutos','7v7','Tamaño 4'],['U12','75 minutos','9v9','Tamaño 4']] as string[][],
 lengthsNote:'Duración del entrenamiento: Departamento de Formación de Entrenadores de US Youth Soccer. Partido y balón: normas de U.S. Soccer para partidos reducidos. Nuestros planes U8 y U10 usan 60 minutos. Tu liga puede ser distinta.',
 faq:[{q:'¿Qué es Jugar-Practicar-Jugar?',a:'La estructura de entrenamiento que U.S. Soccer enseña a los entrenadores de base. Los jugadores empiezan con partidos pequeños, luego practican una idea en actividades parecidas al partido y terminan con un partido.'},
  {q:'¿Cuánto debe durar un entrenamiento de fútbol infantil?',a:'La guía de entrenadores de US Youth Soccer sugiere unos 45 minutos en U6, de 45 a 60 en U8, de 60 a 75 en U10 y 75 en U12.'},
  {q:'¿Cómo planeo un entrenamiento de fútbol para principiantes?',a:'Elige una idea, como el regate. Empieza con partidos pequeños, haz dos o tres actividades sobre esa idea con un balón por jugador y termina con un partido.'},
  {q:'¿Qué material necesito para entrenar fútbol infantil?',a:'Un balón por jugador, unos 20 conos, chalecos de dos colores, arcos pequeños o más conos, agua, un botiquín y un inflador.'},
  {q:'¿El entrenamiento debe empezar con vueltas o estiramientos?',a:'No. Los niños calientan jugando. Un partido pequeño o un juego con un balón cada uno en los primeros minutos los prepara y además les enseña fútbol.'}] as Faq[]});

/**
 * The Spanish line of each guide link a drill, guide or plan carries (lib/site/drillLinks.ts G), keyed by the English path.
 * The name comes from the Spanish page itself (registry); a link is shown only when that page has a Spanish version
 * (esPaths hasEs), so the age, field and ball size guides appear by themselves once their family lands.
 */
export const LINK_LINES_ES:Readonly<Record<string,{name:string;line:string}>>={
 '/learn/soccer-rules/throw-in':{name:'La regla del saque de banda',line:'Los dos pies abajo, las dos manos, desde atrás y por encima de la cabeza'},
 '/learn/soccer-rules/heading-rules-for-kids':{name:'Reglas del cabeceo para niños en Estados Unidos',line:'Sin cabeceo a los 10 años o menos'},
 '/learn/soccer-rules/build-out-line':{name:'La línea de salida (build-out line) en 7v7',line:'Por qué el otro equipo retrocede en un saque de meta'},
 '/learn/soccer-rules/goal-kick':{name:'La regla del saque de meta',line:'Cómo se reanuda el juego desde el área chica'},
 '/learn/soccer-rules/back-pass-rule':{name:'La regla del pase atrás al portero',line:'Cuándo el portero debe usar los pies'},
 '/learn/soccer-rules/fouls-and-free-kicks':{name:'Faltas y tiros libres',line:'Cómo es una entrada limpia'},
 '/learn/soccer-rules/offside':{name:'La regla del fuera de juego',line:'Por qué importa el momento de la carrera'},
 '/learn/soccer-rules/kick-off':{name:'La regla del saque inicial',line:'Cómo empieza y se reanuda un partido'},
 '/learn/soccer-positions/goalkeeper':{name:'El portero',line:'El trabajo, las habilidades y dónde pararse'},
 '/learn/soccer-positions/center-back':{name:'El defensa central',line:'El defensa que protege el centro'},
 '/learn/soccer-positions/fullback':{name:'El lateral',line:'El defensa del costado de la cancha'},
 '/learn/soccer-positions/central-midfielder':{name:'El mediocampista central',line:'El jugador de enlace que recibe girando'},
 '/learn/soccer-positions/defensive-midfielder':{name:'El mediocampista defensivo',line:'El jugador que protege el centro'},
 '/learn/soccer-positions/winger':{name:'El extremo',line:'El atacante de banda que encara a los rivales'},
 '/learn/soccer-positions/striker':{name:'El delantero',line:'El jugador que define las ocasiones'},
 '/learn/soccer-terms/give-and-go':{name:'Pared (término de fútbol)',line:'Pasa, corre más allá del defensa y recibe de vuelta'},
 '/learn/soccer-terms/first-touch':{name:'Primer toque (término de fútbol)',line:'El toque que das cuando llega el balón'},
 '/learn/soccer-terms/two-v-one':{name:'2v1 (término de fútbol)',line:'Dos atacantes contra un defensa'},
 '/learn/soccer-terms/goal-side':{name:'Lado del arco (término de fútbol)',line:'Entre el atacante y tu propio arco'},
 '/learn/soccer-terms/pressing':{name:'Presión (término de fútbol)',line:'Cerrarle el paso al jugador con el balón'},
 '/learn/soccer-terms/tackle':{name:'Entrada (término de fútbol)',line:'Ganar el balón de forma limpia con el pie'},
 '/learn/soccer-terms/cross':{name:'Centro (término de fútbol)',line:'Un pase desde la banda hacia el área'},
 '/learn/soccer-terms/cutback':{name:'Centro atrás (término de fútbol)',line:'Un pase hacia atrás desde la línea de fondo'},
 '/learn/soccer-terms/switching-play':{name:'Cambio de juego (término de fútbol)',line:'Mover el balón al lado vacío'},
 '/learn/soccer-terms/nutmeg':{name:'Caño (término de fútbol)',line:'El balón pasa entre las piernas de un defensa'},
 '/learn/soccer-terms/counterattack':{name:'Contraataque (término de fútbol)',line:'Atacar rápido después de ganar el balón'},
 '/learn/soccer-terms/marking':{name:'Marca (término de fútbol)',line:'Quedarse con un rival'},
 '/learn/7v7-soccer-formations':{name:'Formaciones de fútbol 7v7',line:'Sistemas para equipos U9 y U10'},
 '/learn/9v9-soccer-formations':{name:'Formaciones de fútbol 9v9',line:'Sistemas para equipos U11 y U12'},
 '/learn/soccer-field-size-by-age':{name:'Tamaño de la cancha de fútbol por edad',line:'Cancha, arco y duración del partido para cada edad'},
 '/learn/soccer-ball-size-by-age':{name:'Tamaño del balón de fútbol por edad',line:'Tamaño 3, 4 o 5 para cada edad'},
 '/learn/soccer-age-groups':{name:'Las categorías por edad en el fútbol',line:'Qué significan U6, U8, U10 y U12'},
};

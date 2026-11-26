import {gapByKey,gapByPath,type GapBlock,type GapPage} from '@/lib/site/gapPages';
import type {QuizQuestion} from '@/lib/site/guideQuiz';
/**
 * The gap pages in Spanish (Nov 26 2026; English and sources: lib/site/gapPages.ts). Same keys, block ids, drill order and
 * drawings (the pitch spots and the drill set-ups are taken from the English page); only the words are here. Paths: the English
 * path, shown under /es with the Spanish slug of lib/i18n/esPaths.ts ES_GAP_SLUGS.
 */
type DrillWords={name:string;meta:string[];steps:string[];tip?:string;link?:string};
type SpotWords={name:string;abbr?:string;job:string;also?:string};
type BlockWords={title:string;intro?:string;head?:string[];rows?:string[][];note?:string;items?:string[];text?:string;caption?:string;
 drills?:DrillWords[];steps?:{t:string;d:string}[];spots?:Record<string,SpotWords>;pitchTitle?:string;pitchDesc?:string;more?:string};
type Words={hubName:string;crumb:string;rail:string;title:string;desc:string;h1:string;answer:string;facts:{label:string;value:string}[];blocks:Record<string,BlockWords>;
 faq:{q:string;a:string}[];quizName:string;quiz:QuizQuestion[];tryIt:{name:string;line:string}[];links:{name:string;line:string}[];about:string;imageAlt:string;sources:string};
const q=(qq:string,options:string[],correct:number,explain:string):QuizQuestion=>({q:qq,options,correct,explain});

const ES:Record<string,Words>={
 'abbreviations':{hubName:'Posiciones del fútbol',crumb:'Abreviaturas de posiciones',rail:'Abreviaturas',
  title:'Abreviaturas de posiciones de fútbol: DFC, MCD, MCO, DC',
  desc:'Abreviaturas de las posiciones del fútbol para niños: qué es POR, DFC, LI, LD, MCD, MC, MCO, EI, ED y DC, en una cancha que puedes tocar, y en inglés.',
  h1:'Abreviaturas de posiciones de fútbol: qué es DFC, MCD y MCO',
  answer:'Las abreviaturas de las posiciones son las letras cortas que usan entrenadores, alineaciones y videojuegos. DFC es defensa central, LI y LD los laterales izquierdo y derecho, MCD el mediocampista defensivo, MC el mediocampista central, MCO el mediocampista ofensivo, EI y ED los extremos, DC el delantero centro y POR el portero.',
  facts:[{label:'Cancha',value:'Toca una posición'},{label:'Letras',value:'25 explicadas'},{label:'En inglés',value:'CB, CDM, CAM…'},{label:'Quiz rápido',value:'3 preguntas'}],
  blocks:{
   'pitch':{title:'Toca una posición para ver su trabajo',intro:'La cancha muestra un 4-3-3 con un mediocampista defensivo y uno ofensivo, atacando hacia arriba. Toca cualquier letra para ir a lo que hace ese jugador.',
    pitchTitle:'Abreviaturas de posiciones en una cancha de fútbol',pitchDesc:'Cancha de 11v11 atacando hacia arriba. POR en la arco; dos DFC y los laterales LI y LD atrás; MCD delante de ellos; MC y MCO en el medio; EI y ED abiertos en ataque; DC arriba.',
    more:'Cada letra lleva a su fila de abajo. Entre paréntesis, la letra en inglés.',
    spots:{gk:{abbr:'POR',name:'Portero',job:'Para los tiros y empieza los ataques. El único que puede usar las manos, dentro de su área penal.',also:'Dorsal 1. En inglés: GK (goalkeeper).'},
     cb:{abbr:'DFC',name:'Defensa central',job:'Defiende el centro delante de la arco: despeja de cabeza, bloquea tiros y marca al delantero. Suelen ser dos.',also:'Dorsales 4 y 5. En inglés: CB (center back).'},cb2:{abbr:'DFC',name:'Defensa central',job:''},
     lb:{abbr:'LI',name:'Lateral izquierdo (LI) y derecho (LD)',job:'Defiende la banda izquierda y sube para ayudar en ataque. LD es el mismo trabajo a la derecha.',also:'Dorsal 3 (LD: 2). En inglés: LB y RB.'},rb:{abbr:'LD',name:'Lateral derecho',job:''},
     cdm:{abbr:'MCD',name:'Mediocampista defensivo',job:'Se coloca delante de los defensas, recupera el balón y lo pasa fácil. También se le llama pivote.',also:'Dorsal 6. En inglés: CDM o DM.'},
     cm:{abbr:'MC',name:'Mediocampista central',job:'Une la defensa y el ataque: pide el balón, pasa y corre de área a área.',also:'Dorsal 8. En inglés: CM.'},
     cam:{abbr:'MCO',name:'Mediocampista ofensivo',job:'Juega justo detrás del delantero: da el último pase y tira desde la frontal. También se le llama mediapunta.',also:'Dorsal 10. En inglés: CAM o AM.'},
     lw:{abbr:'EI',name:'Extremo izquierdo (EI) y derecho (ED)',job:'Ataca por la izquierda: regatea, centra y se va hacia dentro para tirar. ED es la banda derecha.',also:'Dorsal 11 (ED: 7). En inglés: LW y RW.'},rw:{abbr:'ED',name:'Extremo derecho',job:''},
     st:{abbr:'DC',name:'Delantero centro',job:'El jugador más adelantado: marca goles, aguanta el balón y presiona a los defensas.',also:'Dorsal 9. En inglés: ST o CF.'}}},
   'all-letters':{title:'Todas las letras de las posiciones (en inglés)',head:['Letras','Significa','Dónde juega'],rows:[
    ['GK','Portero','En la arco'],['CB','Defensa central','El centro de la defensa'],['LCB / RCB','Central izquierdo / derecho','Los dos centrales'],['SW','Líbero','Un defensa libre detrás (poco común hoy)'],
    ['LB / RB','Lateral izquierdo / derecho','Los lados de una defensa de cuatro'],['LWB / RWB','Carrilero izquierdo / derecho','Los lados, más arriba, con defensa de tres'],['DF','Defensa','Cualquier defensa, en una lista'],
    ['CDM / DM','Mediocampista defensivo','Delante de la defensa'],['CM','Mediocampista central','El centro de la cancha'],['LCM / RCM','Interior izquierdo / derecho','Los dos o tres mediocampistas'],
    ['CAM / AM','Mediocampista ofensivo','Detrás del delantero'],['LM / RM','Medio izquierdo / derecho','Abierto en el medio'],['MF','Mediocampista','Cualquier mediocampista, en una lista'],
    ['LW / RW','Extremo izquierdo / derecho','Abierto en ataque'],['CF','Delantero centro','Arriba, a veces un poco más atrás que el ST'],['SS','Segundo delantero','Detrás o al lado del delantero'],
    ['ST','Delantero','La punta del ataque'],['FW','Delantero','Cualquier atacante, en una lista']],
    note:'Las letras son una costumbre, no una regla: las Reglas de Juego solo nombran al portero. Ligas, aplicaciones y juegos usan listas un poco distintas.'},
   'spanish':{title:'Abreviaturas en español: DFC, MCD, MCO y más',intro:'Los entrenadores de habla hispana y las ediciones en español de los videojuegos de fútbol usan estas letras. Aquí están junto a las inglesas.',
    head:['Español','Significa','Inglés'],rows:[['POR','Portero','GK'],['DFC','Defensa central','CB'],['LI / LD','Lateral izquierdo / derecho','LB / RB'],['CAI / CAD','Carrilero izquierdo / derecho','LWB / RWB'],
    ['MCD','Mediocampista defensivo (de contención)','CDM'],['MC','Mediocampista central','CM'],['MCO','Mediocampista ofensivo (mediapunta)','CAM'],['MI / MD','Medio izquierdo / derecho','LM / RM'],
    ['EI / ED','Extremo izquierdo / derecho','LW / RW'],['SD','Segundo delantero','CF / SS'],['DC','Delantero centro','ST']]},
   'numbers':{title:'¿Qué dorsal llevan los defensas centrales?',items:['Los centrales llevan tradicionalmente el 4 y el 5, con el 2 y el 3 para los laterales y el 6 para el mediocampista defensivo.','Los números vienen de cuando los once titulares llevaban del 1 al 11. Hoy casi cualquier número vale, así que un DFC puede llevar el 15 o el 23.','En los partidos pequeños hay menos letras: en fútbol 7 suele haber dos o tres defensas y no hay MCD ni MCO.']},
   'mix-ups':{title:'Confusiones comunes',items:['MCD y MCO no son izquierda y derecha: D es defensivo (más atrás) y O es ofensivo (más arriba).','LI es un defensa, EI un atacante y MI un mediocampista: el mismo lado, tres trabajos distintos.','DC y SD no son lo mismo: el SD juega un poco detrás del delantero centro.']},
   'ask-your-coach':{title:'Pregunta a tu entrenador',text:'En el próximo entrenamiento pregunta “¿Qué letras soy hoy?” y “¿Quién está a mi lado?”. Conocer a los dos jugadores que tienes al lado es la mitad de jugar en cualquier posición.'}},
  faq:[{q:'¿Qué es DFC en fútbol?',a:'DFC significa defensa central: un defensa que juega en el centro de la defensa, delante del portero. En inglés se escribe CB (center back).'},
   {q:'¿Qué diferencia hay entre MCD y MCO?',a:'Los dos juegan por el centro. El MCD está más atrás, delante de los defensas, y los protege. El MCO juega más arriba, detrás del delantero, y da el último pase.'},
   {q:'¿Qué significa DC en fútbol?',a:'DC es delantero centro, el jugador más adelantado. En inglés es ST (striker) o CF (center forward).'},
   {q:'¿Qué dorsal lleva un defensa central?',a:'Tradicionalmente el 4 y el 5. Hoy se pueden elegir otros números, pero muchos equipos siguen dando el 4 y el 5 a los centrales.'},
   {q:'¿Son oficiales las abreviaturas de las posiciones?',a:'No. Las Reglas de Juego solo nombran al portero. Las letras son una costumbre de entrenadores, alineaciones, la televisión y los videojuegos.'}],
  quizName:'las abreviaturas de posiciones',quiz:[
   q('¿Qué significa DFC?',['Delantero fuera de la cancha','Defensa central','Defensa de la falta'],1,'DFC es defensa central, un defensa del centro.'),
   q('¿Quién juega más adelantado, el MCD o el MCO?',['El MCD','El MCO','Están a la misma altura'],1,'El MCO es el mediocampista ofensivo, detrás del delantero. El MCD está delante de la defensa.'),
   q('En inglés, ¿cómo se escribe defensa central?',['CB','CM','CF'],0,'CB es center back. CM es el mediocampista central y CF el delantero centro.')],
  tryIt:[{name:'Alineación de 11v11',line:'Pon nombres a las letras e imprime la alineación'},{name:'Quiz de posiciones del fútbol',line:'Preguntas y respuestas sobre cada posición'},{name:'Juega una posición en la isla',line:'Una lección del juego: conduce el balón desde tu sitio'}],
  links:[{name:'Posiciones por número',line:'Qué significan del 1 al 11'},{name:'Las posiciones del fútbol',line:'Cada posición, con un diagrama'},{name:'Delantero o extremo',line:'DC y EI / ED, lado a lado'},{name:'Lateral o carrilero',line:'LI y CAI, lado a lado'},{name:'Formaciones de fútbol',line:'Dónde va cada letra en cada sistema'}],
  about:'Abreviaturas de las posiciones del fútbol',imageAlt:'Diagrama de las 11 posiciones del fútbol en un 4-3-3',
  sources:'Las letras son una costumbre: las Reglas de Juego (IFAB) solo nombran al portero. Letras en español como las usan los entrenadores de habla hispana y las ediciones en español de los videojuegos de fútbol.'},

 'solo-drills':{hubName:'Ejercicios de fútbol',crumb:'Ejercicios solo',rail:'Ejercicios solo',
  title:'Ejercicios de fútbol para hacer solo: 9 con una pared',
  desc:'Ejercicios de fútbol para hacer solo: 9 ejercicios para niños con un balón y una pared, de toques de suela a paredes y giros, con dibujos y edades.',
  h1:'Ejercicios de fútbol para hacer solo: 9 con un balón y una pared',
  answer:'Los mejores ejercicios de fútbol para hacer solo solo necesitan un balón y una pared: toques de suela, pases a la pared con las dos piernas, un eslalon entre conos, toques al aire, rodar con la suela, recibir y girar desde la pared y tirar a un blanco. De diez a veinte minutos al día, con muchos toques con las dos piernas, valen más que una sesión larga a la semana.',
  facts:[{label:'Necesitas',value:'Un balón, una pared, 4-6 conos'},{label:'Tiempo',value:'10-20 minutos'},{label:'Ejercicios',value:'9, por edad'},{label:'Quiz rápido',value:'3 preguntas'}],
  blocks:{
   'safe-spot':{title:'Primero, elige un sitio seguro',items:['Una pared contra la que puedas chutar: un garaje, el muro del colegio, una valla de tablas. Pregunta a un adulto.','Lejos de ventanas, coches y la calle. Dentro de casa, un balón blando.','Zapatillas o conos como marcas. Un balón de talla 3 o 4 para los más pequeños.']},
   'drills':{title:'9 ejercicios de fútbol para hacer solo, del más fácil al más difícil',intro:'Cada ejercicio dice la edad y cuánto tiempo hacerlo. Haz tres o cuatro de una vez, no los nueve.',drills:[
    {name:'Toques de suela',meta:['Desde 5 años','3 x 30 segundos'],steps:['Ponte detrás del balón. Toca la parte de arriba con la suela de un pie y luego del otro, como si caminaras sin moverte.','Quédate de puntillas y deja el balón quieto.','Cuenta los toques en 30 segundos. Descansa e intenta superarlo.'],tip:'Levanta la vista entre toques: en el partido miras la cancha, no el balón.',link:'Toques de suela y bases'},
    {name:'Pases a la pared a dos toques',meta:['Desde 5 años','2 x 2 minutos'],steps:['Ponte a tres o cinco pasos largos de la pared.','Pasa con el interior del pie para que vuelva recto.','Para con un toque y pasa con el siguiente. Diez con la derecha y diez con la izquierda.'],tip:'Tobillo firme y el pie de apoyo apuntando a la pared.',link:'Pases a la pared'},
    {name:'Eslalon entre conos',meta:['Desde 5 años','5 viajes de ida y vuelta'],steps:['Pon seis conos o zapatillas en fila, a un paso largo.','Conduce entre ellos con toques cortos, gira y vuelve.','Solo con el pie derecho, luego solo con el izquierdo, luego con el exterior.'],tip:'Toques cortos cerca de los conos y uno más largo en el espacio libre del final.',link:'Eslalon entre conos'},
    {name:'Conducción rápida y parada',meta:['Desde 6 años','6 viajes'],steps:['Dos marcas a unos 15 pasos largos.','Empuja el balón hacia delante y corre rápido a la otra marca.','Para el balón en seco con la suela justo en la marca, gira y vuelve.'],tip:'Rápido y en línea recta son menos toques; frena para pararlo.'},
    {name:'Rodar con la suela y arrastres',meta:['Desde 7 años','3 x 30 segundos'],steps:['Rueda el balón por delante del cuerpo con la suela, de un pie al otro.','Luego arrástralo hacia ti con la suela y empújalo con el empeine.','Mézclalos: rueda, rueda, arrastra, gira.'],tip:'Rodillas flexionadas y brazos abiertos para el equilibrio.',link:'Regate'},
    {name:'Toques al aire: golpear y atrapar',meta:['Desde 7 años','5 minutos'],steps:['Deja caer el balón, dale un toque hacia arriba con el empeine y atrápalo.','Luego dos toques antes de atraparlo, luego tres.','Los mayores: un bote entre toques, y después sin bote. Cuenta tu récord.'],tip:'Punta del pie estirada y toque suave: el balón no debe pasar de tu cabeza.',link:'Reto de toques'},
    {name:'Pases a la pared a un toque',meta:['Desde 8 años','3 x 1 minuto'],steps:['Acércate un poco a la pared.','Devuélvelo a la primera, sin pararlo.','Alterna pies: derecha, izquierda, derecha. Cuenta cuántos seguidos.'],tip:'Coloca los pies antes de que llegue el balón, no cuando llega.'},
    {name:'Recibir y girar desde la pared',meta:['Desde 9 años','2 x 2 minutos'],steps:['Pon una marca a cada lado, detrás de ti.','Pasa a la pared. Abre el cuerpo cuando vuelve y da el primer toque cruzado, con el pie más lejano a la pared.','Conduce hasta una marca. La próxima vez, gira hacia el otro lado.'],tip:'Mira por encima del hombro antes de que llegue el balón: eso es perfilarse y escanear.',link:'Recibir con el cuerpo abierto'},
    {name:'Tiro a un blanco',meta:['Desde 8 años','10 tiros con cada pie'],steps:['Marca dos cuadrados abajo en la pared con tiza o cinta, como las esquinas de una arco.','Tira con el empeine desde unos ocho pasos largos.','Un punto por cada cuadrado. Los tiros con la izquierda valen doble.'],tip:'Cabeza encima del balón y cae sobre el pie que chuta para que el tiro vaya bajo.',link:'Ejercicios de tiro'}]},
   'by-age':{title:'Qué ejercicios hacer solo según la edad',head:['Edad','Empieza con','Añade'],rows:[['5 a 6 (U6)','Toques de suela, eslalon','Pases a la pared a dos toques'],['7 a 8 (U8)','Pases a la pared con las dos piernas, conducción y parada','Rodar con la suela, toques al aire'],['9 a 10 (U10)','Pases a un toque, recibir y girar','Tiro a un blanco con las dos piernas'],['11 a 12 (U12)','Recibir y girar hacia los dos lados, un toque con la pierna mala','Toques al aire sin bote, tiros en carrera']]},
   'mistakes':{title:'Errores comunes',items:['Usar solo la pierna buena. Haz cada ejercicio con las dos.','Chutar a la pared lo más fuerte posible: es mejor un pase limpio que vuelve.','Una hora un día a la semana. Un poco cada día mejora el toque más rápido.']}},
  faq:[{q:'¿Cómo puedo entrenar fútbol solo?',a:'Con un balón y una pared: pases a la pared, toques de suela, eslalon, toques al aire y tiros a un blanco. Haz tres o cuatro ejercicios de 10 a 20 minutos, con las dos piernas.'},
   {q:'¿Qué ejercicios de fútbol puedo hacer en casa sin pared?',a:'Toques de suela, rodar con la suela, eslalon con zapatillas como conos, conducción y parada, y toques al aire.'},
   {q:'¿Cuánto tiempo debe entrenar solo un niño?',a:'De 10 a 20 minutos es suficiente para la mayoría. Poco y a menudo, y parar cuando deje de ser divertido.'},
   {q:'¿Cuál es el mejor ejercicio solo para el primer toque?',a:'Recibir y girar desde la pared: pasa, abre el cuerpo y da el primer toque cruzado hacia el espacio.'},
   {q:'¿Se puede mejorar en fútbol entrenando solo?',a:'Sí, en la técnica: el toque, el pase, las dos piernas y los toques al aire. Las decisiones y el juego en equipo llegan jugando con otros.'}],
  quizName:'los ejercicios solo',quiz:[
   q('¿Con qué parte del pie haces un pase a la pared a dos toques?',['La punta','El interior','El talón'],1,'El interior es la superficie más grande y plana, así que el pase va recto.'),
   q('¿Cuánto dura una buena sesión solo para la mayoría de los niños?',['De 10 a 20 minutos','2 horas','1 minuto'],0,'Poco y a menudo mejora más que una sesión larga.'),
   q('En “recibir y girar”, ¿cuándo miras por encima del hombro?',['Después de girar','Antes de que llegue el balón','Nunca'],1,'Mirar antes de que llegue el balón te dice hacia dónde girar.')],
  tryIt:[{name:'Reto de toques',line:'Cuenta tus toques y supera tu récord'},{name:'Juego de toques',line:'Mantén el balón en el aire en el arcade'},{name:'Ball Blaster',line:'El juego de tiros: apunta abajo a las esquinas'}],
  links:[{name:'Ejercicios de fútbol en casa',line:'Más ejercicios para el jardín y el salón'},{name:'Ejercicios U8',line:'Juegos para niños de 7 y 8 años'},{name:'Ejercicios de primer toque',line:'Controla el balón en un toque'},{name:'Pierna mala',line:'Por qué importan las dos piernas'},{name:'Todos los ejercicios de fútbol para niños',line:'Ejercicios por edad y habilidad'}],
  about:'Ejercicios de fútbol para hacer solo',imageAlt:'Diagrama del ejercicio de pases a la pared',
  sources:'Práctica de entrenamiento, escrita para estas páginas. Las edades siguen las etapas U6 a U12 de las páginas de ejercicios.'},

 'futsal-vs-soccer':{hubName:'Futsal para niños',crumb:'Futsal y fútbol',rail:'Futsal y fútbol',
  title:'Futsal vs fútbol: las diferencias lado a lado, para niños',
  desc:'Futsal vs fútbol para niños: el balón, la pista, los jugadores, el reloj, los saques de banda con el pie, las faltas y las expulsiones, lado a lado.',
  h1:'Futsal vs fútbol: qué cambia, lado a lado',
  answer:'El futsal es fútbol de cinco contra cinco en una cancha dura, con un balón más pequeño y pesado que bota menos. Comparado con el fútbol, no tiene fuera de juego, tiene cambios ilimitados y volantes, saque de banda con el pie, reloj parado, cuatro segundos para cada reanudación y un conteo de faltas que da un tiro libre desde 10 m a partir de la sexta.',
  facts:[{label:'Jugadores',value:'5 contra 11'},{label:'Balón',value:'Talla 4 contra talla 5'},{label:'Tiempo',value:'2x20 parado contra 2x45'},{label:'Quiz rápido',value:'3 preguntas'}],
  blocks:{
   'to-scale':{title:'Una cancha de futsal y una cancha de fútbol, a escala',intro:'La cancha cabe unas siete veces en una cancha de fútbol: por eso en futsal se toca tanto el balón.',caption:'A escala: una cancha de futsal de 40 por 20 m dibujada dentro de una cancha de fútbol de 105 por 68 m. Las arcos de futsal miden 3 m de ancho; las de fútbol, 7,32 m.'},
   'differences':{title:'Futsal vs fútbol: todas las diferencias',head:['','Futsal','Fútbol (11v11)','Qué significa para ti'],rows:[
    ['Jugadores','5 por equipo, con el portero','11 por equipo, con el portero','En futsal todos defienden y atacan'],
    ['Terreno','Una cancha de 25-42 m por 16-25 m, con líneas (sin césped)','Una cancha de 90-120 m por 45-90 m','En futsal hay menos tiempo con el balón: decide rápido'],
    ['Balón','Talla 4, 62-64 cm de circunferencia, bote bajo','Talla 5, 68-70 cm','El balón de futsal va por el suelo: pasa raso'],
    ['Arcos','3 m por 2 m','7,32 m por 2,44 m','Los tiros tienen que ser precisos, a menudo de puntera o rasos'],
    ['Tiempo','2 x 20 minutos; el reloj se para con el balón fuera','2 x 45 minutos; el reloj corre y se añade tiempo','Un partido de futsal dura más de 40 minutos de reloj normal'],
    ['Cambios','Ilimitados, en cualquier momento, por la zona de cambios del equipo','Un número fijo por partido','En futsal sales y vuelves a entrar'],
    ['Balón fuera por la banda','Saque de banda con el pie, balón en la línea, en 4 segundos','Saque de banda con las manos','En futsal se pone en juego con el pie'],
    ['Reanudaciones','4 segundos para saques de banda, faltas, saques de esquina y saques de meta','Sin tiempo fijo en la mayoría; el árbitro puede contar 5 segundos en un saque de banda o de meta lento','Prepárate antes de que salga el balón'],
    ['Balón fuera por la línea de fondo','Saque de meta: el portero lanza con la mano desde su área','Saque de meta','En futsal el portero empieza el ataque con la mano'],
    ['Portero con el balón','4 segundos en su mitad de la cancha, con manos o pies','8 segundos con el balón en las manos, o saque de esquina para el rival','En futsal el portero tiene que soltarla rápido'],
    ['Fuera de juego','No hay','Sí (Regla 11)','En futsal un delantero puede esperar cerca de la arco'],
    ['Faltas del equipo','Se cuentan en cada parte; desde la sexta, tiro libre directo sin barrera, normalmente desde la marca de 10 m','No se cuentan','El futsal castiga muchas faltas pequeñas'],
    ['Punto penal','6 m','11 m','Los penales de futsal están más cerca'],
    ['Expulsión','El equipo juega con uno menos 2 minutos o hasta que le meten gol','El equipo juega con uno menos el resto del partido','En futsal el equipo recupera a su quinto jugador'],
    ['Tiempos muertos','Uno por equipo en cada parte, de 1 minuto','No hay','En futsal el entrenador puede parar el partido'],
    ['Árbitros','Dos en la cancha, más un cronometrador y a menudo un tercer árbitro','Un árbitro, dos asistentes y a menudo un cuarto árbitro','']],
    note:'Fuentes: Reglas de Juego de Futsal de la FIFA 2025-26; Reglas de Juego de la IFAB (Reglas 1, 2, 3, 7, 11, 12, 15, 16). Las ligas infantiles cambian algunos detalles, como la duración y el tamaño de la cancha.'},
   'what-it-teaches':{title:'Qué enseña el futsal a un futbolista',items:['Control en corto: el balón pequeño y pesado y la cancha estrecha dan muchos toques en poco espacio.','Decisiones rápidas: cuatro segundos para reanudar y los defensas cerca.','Usar la suela: en futsal se rueda y se para el balón con la planta del pie.','Hacer todos los trabajos: con cinco jugadores todos defienden y atacan, como un mediocampista.']},
   'switching':{title:'Pasar de uno a otro',items:['Del futsal al fútbol: levanta la vista y pasa más largo, hay espacio.','Del fútbol al futsal: suelta el balón rápido y olvídate del saque con las manos.','Calzado: zapatillas de suela lisa para futsal, botas de tacos para césped.']},
   'mix-ups':{title:'Confusiones comunes',items:['“El futsal es lo mismo que el fútbol indoor.” El fútbol indoor a veces se juega con paredes; el futsal tiene líneas y el balón sale.','“En futsal no se puede hacer una barrida.” Se puede si no es imprudente, temeraria ni peligrosa; si lo es, es falta.','“En futsal el reloj nunca se para.” Se para cada vez que el balón está fuera del juego.']}},
  faq:[{q:'¿Cuál es la diferencia principal entre futsal y fútbol?',a:'El futsal es cinco contra cinco en una cancha pequeña y dura con un balón de talla 4 que bota poco. El fútbol es once contra once en una cancha grande con un balón de talla 5.'},
   {q:'¿Hay fuera de juego en futsal?',a:'No. El futsal no tiene regla del fuera de juego: los atacantes pueden estar donde quieran.'},
   {q:'¿Cuánto dura un partido de futsal?',a:'Dos partes de 20 minutos de juego. El reloj se para con el balón fuera, así que en un reloj normal dura más.'},
   {q:'¿Es bueno el futsal para niños que juegan al fútbol?',a:'Sí. Muchos entrenadores lo usan para mejorar el control en corto y las decisiones rápidas, porque cada jugador toca mucho más el balón.'},
   {q:'¿Qué balón se usa en futsal?',a:'Un balón de futsal de talla 4, de 62 a 64 cm de circunferencia, hecho para botar menos que uno normal.'}],
  quizName:'futsal y fútbol',quiz:[
   q('¿Cómo se reanuda en futsal cuando el balón sale por la banda?',['Con las manos','Con el pie','Con un bote neutral'],1,'En futsal se saca con el pie, con el balón en la línea, en 4 segundos.'),
   q('¿Hay fuera de juego en futsal?',['Sí','No','Solo en la segunda parte'],1,'El futsal no tiene regla del fuera de juego.'),
   q('¿Cuánto tiempo juega con uno menos un equipo de futsal tras una roja?',['El resto del partido','2 minutos, o hasta que le metan gol','10 minutos'],1,'Tras 2 minutos de juego, o un gol del rival, puede entrar un sustituto.')],
  tryIt:[{name:'Reglas del futsal para niños',line:'Todas las reglas del futsal, con un diagrama'},{name:'Alineación de futsal',line:'Elige a tus cinco e imprímela'},{name:'Juega al futsal en la isla',line:'Una lección de futsal: gana el 2 contra 1'}],
  links:[{name:'Reglas del futsal',line:'La página de reglas, con el conteo de faltas'},{name:'Futsal para niños',line:'Lecciones, formaciones y ejercicios de futsal'},{name:'Formaciones de futsal',line:'Sistemas para cinco jugadores'},{name:'7v7, 9v9 y 11v11',line:'En qué se diferencian los tamaños de partido'},{name:'Talla del balón por edad',line:'Talla 3, 4 o 5'}],
  about:'El futsal comparado con el fútbol',imageAlt:'Diagrama de una cancha de futsal',
  sources:'Reglas de Juego de Futsal de la FIFA 2025-26; Reglas de Juego de la IFAB.'},

 'types-of-dribbling':{hubName:'Términos de fútbol',crumb:'Tipos de regate',rail:'Tipos de regate',
  title:'Tipos de regate en el fútbol: los 5 tipos, para niños',
  desc:'Los tipos de regate en el fútbol para niños: control en corto, conducción rápida, protección, giros y fintas, con dibujos y cuándo usar cada uno.',
  h1:'Tipos de regate en el fútbol: los 5 tipos y cuándo usarlos',
  answer:'Los entrenadores suelen ordenar el regate en cinco tipos: el control en corto en espacios pequeños, la conducción rápida hacia el espacio libre, la protección del balón ante un defensa, los giros y cambios de dirección, y las fintas que amagan hacia un lado para salir por el otro. Cada uno sirve para un momento distinto del partido.',
  facts:[{label:'Tipos',value:'5'},{label:'Ideal para',value:'De 6 a 12 años'},{label:'Movimientos',value:'Bicicleta, dejada, caño'},{label:'Quiz rápido',value:'3 preguntas'}],
  blocks:{
   'types':{title:'Los 5 tipos de regate',intro:'No hay una lista oficial: así lo ordenan muchos entrenadores. Un buen regateador mezcla los cinco en una misma jugada.',drills:[
    {name:'1. Control en corto',meta:['Espacios pequeños','Toques cortos'],steps:['Lleva el balón a menos de un paso de los pies, tocándolo en cada zancada.','Usa el interior, el exterior y la suela de los dos pies.','Úsalo entre rivales: cerca de los defensas, por el centro, en un área llena.'],link:'Regate'},
    {name:'2. Conducción rápida',meta:['Espacio libre','Toques más largos'],steps:['Empuja el balón unos pasos por delante y corre tras él.','Tócalo con el empeine o el exterior, con la punta hacia abajo.','Úsalo cuando hay espacio vacío delante: un contraataque o por la banda.'],link:'Contraataque'},
    {name:'3. Protección del balón',meta:['Bajo presión','El cuerpo en medio'],steps:['Pon el cuerpo entre el defensa y el balón, de perfil.','Rodillas flexionadas, brazo abierto para el equilibrio (sin empujar), balón en el pie más lejano.','Úsalo para guardar el balón hasta que llegue un compañero o se abra espacio.'],link:'Proteger el balón'},
    {name:'4. Giros y cambios de dirección',meta:['Cambiar de dirección','Salir de la presión'],steps:['Para el balón o córtalo para cambiar de dirección rápido.','Giros comunes: el corte con el interior, con el exterior, el arrastre con la suela y el giro de Cruyff.','Úsalos cuando un defensa te cierra el paso o llegas a un callejón sin salida.'],link:'Ejercicio de girar y salir'},
    {name:'5. Fintas y amagos',meta:['Superar a un defensa','Amagar y salir'],steps:['Amaga hacia un lado con el cuerpo, bajando el hombro o pasando el pie por encima del balón.','Cuando el defensa se inclina, sal rápido hacia el otro lado.','Úsalas en el uno contra uno, cuando necesitas un metro de espacio para centrar o tirar.'],link:'Bicicleta'}]},
   'when':{title:'¿Qué regate y cuándo?',head:['En el partido','Usa','Por qué'],rows:[['El centro de la cancha lleno','Control en corto','Necesitas el balón siempre cerca'],['Espacio vacío delante','Conducción rápida','Avanza rápido antes de que vuelvan los defensas'],['Un defensa justo detrás','Protección','Guarda el balón hasta que llegue ayuda'],['Un defensa delante','Un giro o un corte','Ve donde él no está'],['Uno contra uno con espacio detrás del defensa','Una finta','Haz que se incline y pásalo']]},
   'moves':{title:'Movimientos de regate y su tipo',head:['Movimiento','Tipo','Qué es'],rows:[['Bicicleta','Finta','Pasa el pie por encima del balón y sal por el otro lado'],['Dejada','Finta','Deja pasar el balón para un compañero'],['Caño','Finta o control en corto','Pasa el balón entre las piernas del defensa'],['Arrastre','Giro','Tira del balón hacia atrás con la suela y gira'],['Corte con interior y exterior','Giro','Corta el balón con el interior o el exterior del pie']]},
   'mistakes':{title:'Errores comunes',items:['Cabeza abajo todo el rato: levanta la vista entre toques.','Toques largos entre muchos rivales y cortos en espacio libre: debería ser al revés.','Regatear cuando un compañero está solo: regatear es una decisión y a menudo pasar es mejor.']},
   'try-at-practice':{title:'Pruébalo en el entrenamiento',text:'Jueguen a tiburones y pececitos. Control en corto entre la gente, velocidad en el espacio libre y un giro cuando un tiburón te cierra.'}},
  faq:[{q:'¿Cuáles son los 5 tipos de regate en el fútbol?',a:'El control en corto, la conducción rápida, la protección del balón, los giros y las fintas. Es una forma de ordenar los regates de los entrenadores, no una lista oficial.'},
   {q:'¿Cuál es el regate más fácil para empezar?',a:'El control en corto con el interior del pie: toques cortos, balón cerca y cabeza arriba entre toques.'},
   {q:'¿Proteger el balón es un tipo de regate?',a:'Sí, para la mayoría de los entrenadores. Guardas el balón poniendo el cuerpo entre él y el defensa, a menudo moviéndote despacio.'},
   {q:'¿Con qué parte del pie se conduce rápido?',a:'Sobre todo con el empeine o el exterior, con la punta hacia abajo, para empujar el balón mientras corres.'},
   {q:'¿Cómo pueden los niños mejorar el regate?',a:'Con muchos toques: eslalon entre conos, toques de suela y juegos de regate como tiburones y pececitos, con las dos piernas.'}],
  quizName:'los tipos de regate',quiz:[
   q('Tienes espacio libre delante. ¿Qué regate?',['Protección','Conducción rápida','Control en corto'],1,'Empuja el balón y corre: la conducción rápida avanza mucho terreno.'),
   q('Un defensa está justo detrás de ti. ¿Qué regate?',['Protección','Una bicicleta','Conducción rápida'],0,'Proteger pone tu cuerpo entre el defensa y el balón.'),
   q('¿Qué tipo de regate es la bicicleta?',['Un giro','Una finta','Conducción rápida'],1,'Amaga hacia un lado para salir por el otro: una finta.')],
  tryIt:[{name:'Tiburones y pececitos',line:'El juego de regate para todas las edades'},{name:'Breakaway Run',line:'El corredor del arcade: esquiva defensas a toda velocidad'},{name:'Conduce el balón en la isla',line:'Una lección del juego: cuándo conducir hacia delante'}],
  links:[{name:'Regate',line:'Qué es regatear'},{name:'Proteger el balón',line:'Guardar el balón'},{name:'Bicicleta',line:'El amago pasando el pie por encima'},{name:'Caño',line:'Entre las piernas'},{name:'Ejercicios de regate',line:'Ejercicios para practicar los cinco'}],
  about:'Tipos de regate en el fútbol',imageAlt:'Diagrama de un regate en el fútbol',
  sources:'Práctica de entrenamiento, escrita para estas páginas: los cinco tipos son una forma común de ordenar el regate, no una lista oficial.'},

 'teaching-possession':{hubName:'Ejercicios de fútbol',crumb:'Enseñar la posesión',rail:'Enseñar la posesión',
  title:'Enseñar la posesión a niños en el fútbol: 3 juegos',
  desc:'Guía para entrenadores: cómo enseñar a los niños la importancia de la posesión en el fútbol, cuándo empezar, tres juegos sencillos y qué decirles.',
  h1:'Enseñar a los niños la importancia de la posesión en el fútbol',
  answer:'La posesión se enseña a los niños con juegos, no con charlas: juegos de mantener el balón en los que un equipo puntúa dando pases. Empieza hacia los 8 años, cuando ya saben pasar y parar el balón, y usa tres ideas sencillas: abran la cancha, muévanse para que un compañero los vea y guarden el balón cuando no hay un buen pase hacia delante.',
  facts:[{label:'Empezar a',value:'Unos 8 años (U9)'},{label:'Juegos',value:'3, del más fácil'},{label:'Qué decir',value:'5 frases cortas'},{label:'Quiz rápido',value:'3 preguntas'}],
  blocks:{
   'by-age':{title:'La posesión según la edad',head:['Edad','Qué esperar','Qué enseñar'],rows:[['5 a 7 (U6, U8)','Un balón cada uno, conducción; el pase es nuevo','Balón cerca; “¿encuentras a un amigo?”'],['8 a 10 (U9, U10)','Ya pasan y paran el balón','Abrirse, moverse para quedar libre, pasar al compañero libre'],['11 a 12 (U11, U12)','Pueden jugar 4 contra 2 y partidos pequeños','Guardar el balón para construir y avanzar cuando hay espacio']]},
   'games':{title:'3 juegos sencillos de posesión',intro:'Cada juego da un punto, así que los niños quieren guardar el balón.',drills:[
    {name:'Rondo 3 contra 1 (o 4 contra 1)',meta:['Desde 8 años','10 por 10 yardas','8 minutos'],steps:['Tres jugadores en los lados de un cuadrado y un defensa en el medio.','Cuenten los pases. Cinco seguidos es un punto.','Si el defensa toca el balón, entra el que pasó.'],tip:'Di: “Haz el cuadrado grande”.',link:'Rondo 3 contra 1'},
    {name:'Rondo a tres equipos',meta:['Desde 9 años','20 por 20 yardas','10 minutos'],steps:['Tres equipos de tres. Dos equipos guardan el balón juntos; uno defiende.','Cuando los defensas la recuperan, defiende el equipo que la perdió.','Cuenten los pases: gana el equipo con más.'],tip:'Di: “¿Dónde está el libre?”',link:'Rondo a tres equipos'},
    {name:'Pase a la zona de anotación',meta:['Desde 10 años','30 por 20 yardas','12 minutos'],steps:['Dos equipos, 4 contra 4. Una zona estrecha en cada fondo.','Se marca pasando a un compañero que entra en la zona.','Añade una regla: tres pases antes de poder marcar.'],tip:'Di: “Guárdala y luego ve”.',link:'Juego de zonas de gol'}]},
   'coaching-points':{title:'Consignas',steps:[{t:'Abran la cancha',d:'Ábranse a lo ancho y a lo largo cuando tu equipo tiene el balón. El espacio facilita el pase.'},{t:'Muévete para que te vean',d:'Ponte en un hueco donde el pasador te vea, no detrás de un defensa.'},{t:'Cuerpo abierto',d:'Perfílate para recibir y pasar hacia delante en un toque.'},{t:'Pasa y muévete',d:'Después de pasar, muévete otra vez para recibirla de vuelta.'},{t:'Guárdala y luego ve',d:'La posesión no es el objetivo: guarda el balón hasta que haya un pase o un regate hacia delante.'}]},
   'what-to-say':{title:'Qué decir: cinco frases cortas',intro:'En un partido los niños oyen unas pocas palabras, no un discurso. Usa las mismas cada semana.',items:['“¡Ábranse!” cuando tu equipo recupera el balón.','“¡Ofrécete!” al jugador escondido detrás de un defensa.','“Cabeza arriba y pasa.” antes de que pasen.','“¿Dónde está el libre?” cuando van a pegarle sin mirar.','“¡Guárdala!” cuando no hay un buen pase delante, y “¡Ve!” cuando sí lo hay.']},
   'mistakes':{title:'Errores comunes',items:['Decir que nunca la peguen en largo. La posesión es una decisión, no una regla: avanzar sigue siendo el objetivo.','Jugadores en fila. En un juego de posesión todos tienen balón o están en el juego.','Empezar demasiado pronto. Los menores de 8 sobre todo necesitan un balón cada uno y juegos de conducción.']}},
  faq:[{q:'¿Por qué es importante la posesión en el fútbol?',a:'Mientras tu equipo tiene el balón, el rival no puede marcar. Guardarlo también cansa al rival y espera a que se abra un hueco.'},
   {q:'¿A qué edad deben aprender los niños la posesión?',a:'Hacia los 8 a 10 años, cuando ya pasan y paran el balón. Los más pequeños aprenden a guardarlo con juegos de conducción.'},
   {q:'¿Cuál es el mejor ejercicio para enseñar la posesión?',a:'Un rondo, como un 3 contra 1 o un 4 contra 1 en un cuadrado pequeño, con un punto por cinco pases seguidos.'},
   {q:'¿Cómo se explica la posesión a un niño?',a:'“Si tenemos el balón, no nos pueden marcar. Guárdalo hasta que veas un camino hacia delante.”'},
   {q:'¿Deben los niños guardar siempre el balón?',a:'No. Guardar el balón es una forma de encontrar una ocasión. Cuando hay un pase o un regate hacia delante, adelante.'}],
  quizName:'enseñar la posesión',quiz:[
   q('¿Qué significa “ábranse”?',['Pegarle lejos','Sepárense cuando tu equipo tiene el balón','Gritar fuerte'],1,'Abrirse crea espacio, y el espacio facilita el pase.'),
   q('En un rondo 3 contra 1, ¿cómo se gana un punto?',['Cinco pases seguidos','Un gol','Regatear al defensa'],0,'Los pases son los puntos, así que los jugadores quieren guardar el balón.'),
   q('¿Hacia qué edad pueden empezar la mayoría de los niños con juegos de posesión?',['4','8','14'],1,'Hacia los 8, cuando ya pasan y paran el balón.')],
  tryIt:[{name:'Ejercicio rondo 3 contra 1',line:'Montaje, pasos y consignas'},{name:'Pass Puzzles',line:'El juego de pases: encuentra al jugador libre'},{name:'Gana el 2 contra 1 en la isla',line:'Una lección del juego: pasa en el momento justo'}],
  links:[{name:'Posesión',line:'Qué significa la posesión'},{name:'Apoyo',line:'Moverse para ayudar al que tiene el balón'},{name:'Ejercicios de pase',line:'Ejercicios para pasar y recibir'},{name:'Ejercicios U10',line:'Juegos para niños de 9 y 10 años'},{name:'Pase y apoyo',line:'El tema de las lecciones de pase'}],
  about:'Enseñar la posesión a los niños en el fútbol',imageAlt:'Diagrama de un rondo 3 contra 1',
  sources:'Práctica de entrenamiento, escrita para estas páginas. Las edades siguen las etapas U6 a U12 de las páginas de ejercicios.'},
};

function block(b:GapBlock,w:BlockWords|undefined):GapBlock{
 if(!w)throw new Error(`gapPages ES: block ${b.id} has no Spanish words`);
 const base={...b,title:w.title,...(w.intro!==undefined?{intro:w.intro}:{})} as GapBlock;
 switch(base.k){
  case 'pitch':return {...base,pitchTitle:w.pitchTitle!,pitchDesc:w.pitchDesc!,more:w.more,spots:base.spots.map(s=>{const x=w.spots![s.id];return {...s,abbr:x.abbr??s.abbr,name:x.name,job:x.job,also:x.also};})};
  case 'table':return {...base,head:w.head??base.head,rows:w.rows??base.rows,note:w.note};
  case 'drills':return {...base,drills:base.drills.map((d,i)=>{const x=w.drills![i];return {...d,name:x.name,meta:x.meta,steps:x.steps,tip:x.tip,link:d.link&&x.link?{...d.link,name:x.link}:undefined};})};
  case 'steps':return {...base,items:base.items.map((s,i)=>({...s,...w.steps![i]}))};
  case 'list':return {...base,items:w.items!};
  case 'callout':return {...base,items:w.items,text:w.text};
  case 'scale':return {...base,caption:w.caption!};
 }
}
function build(en:GapPage):GapPage{
 const w=ES[en.key];if(!w)throw new Error(`gapPages ES: ${en.key} missing`);
 if(w.faq.length!==en.faq.length||w.links.length!==en.links.length||w.tryIt.length!==en.tryIt.length||w.facts.length!==en.facts.length)throw new Error(`gapPages ES: ${en.key} counts differ`);
 return {...en,hub:{...en.hub,name:w.hubName},crumb:w.crumb,rail:w.rail,title:w.title,desc:w.desc,h1:w.h1,answer:w.answer,
  facts:en.facts.map((f,i)=>({...f,...w.facts[i]})),blocks:en.blocks.map(b=>block(b,w.blocks[b.id])),faq:w.faq,quizName:w.quizName,quiz:w.quiz,
  tryIt:en.tryIt.map((t,i)=>({...t,...w.tryIt[i]})),links:en.links.map((l,i)=>({...l,...w.links[i]})),about:w.about,imageAlt:w.imageAlt,sources:w.sources};
}
const CACHE=new Map<string,GapPage>();
/** The Spanish gap page for an English path, or null. */
export function gapEs(enPath:string):GapPage|null{
 const en=gapByPath(enPath);if(!en)return null;
 if(!CACHE.has(en.key))CACHE.set(en.key,build(en));return CACHE.get(en.key)!;
}
export const gapEsByKey=(k:string)=>{const en=gapByKey(k);return en?gapEs(en.path):null;};

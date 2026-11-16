import type {ComparisonEs} from './types';
/**
 * Spanish comparison pages (Spanish round 2, Nov 16 2026): the words of lib/site/comparisons.ts COMPARISONS, keyed by slug. The
 * table cells are built from the Spanish position / formation records (components/es/pages/FormationsEs.tsx), as in English.
 * fullback-vs-wingback and 4-3-3-vs-4-4-2 reuse the Spanish FAQ answer the English page reuses.
 */
export const COMPARISONS_ES:Readonly<Record<string,ComparisonEs>>={
 'fullback-vs-wingback':{title:'Lateral vs carrilero en el fútbol: la diferencia',h1:'Lateral vs carrilero: ¿cuál es la diferencia?',
  desc:'Lateral vs carrilero en el fútbol, explicado para niños y entrenadores: dónde se coloca cada uno, sus tareas con y sin balón y qué formaciones los usan.',
  answer:'Un lateral juega en una línea de cuatro con un extremo adelante. Un carrilero juega por fuera de tres defensas centrales sin nadie adelante, así que empieza más arriba y tiene todo el lado para él solo.',
  fit:['Un equipo con cuatro defensas (un 4-3-3 o un 4-4-2) juega con laterales. Un equipo con tres defensas centrales (un 3-5-2) juega con carrileros.',
   'Las dos tareas piden correr mucho. Un carrilero corre más, porque nadie juega delante de él por ese lado.'],
  switching:['Un lateral al que le encanta atacar ya está a medio camino de la tarea de carrilero: el desdoble por la banda es la misma carrera, solo que el carrilero la hace mucho más seguido.',
   'Pasar de carrilero a lateral quiere decir quedarse más atrás. Cuando un lateral sube, el lateral del otro lado normalmente se queda atrás con los defensas centrales.',
   'Pruébalo en el entrenamiento: juega un tiempo con cuatro defensas y otro con tres defensas centrales, y luego pregúntales a los jugadores de banda cómo cambió lo que corrieron.',
   'Cuida las piernas cansadas. Un carrilero cubre toda la banda, así que dale descanso cuando puedas, sobre todo en días de calor.']},
 'striker-vs-winger':{title:'Delantero centro vs extremo en el fútbol: la diferencia',h1:'Delantero centro vs extremo: ¿cuál es la diferencia?',
  desc:'Delantero centro vs extremo en el fútbol, explicado para niños: dónde juega cada uno, qué hace con y sin balón, sus números y a quién le queda cada tarea.',
  answer:'Los dos son delanteros. El delantero centro juega en el medio, lo más cerca del arco rival, y su tarea principal es meter goles. Un extremo juega abierto por la izquierda o la derecha, estira al otro equipo y crea ocasiones desde la banda con regates, centros o metiéndose hacia dentro para tirar.',
  fit:['Si te encanta meter goles, eres valiente en un área llena de gente y sabes cuándo correr, prueba de delantero centro.','Si eres rápido, te encanta encarar a un defensa con regates y disfrutas centrar, prueba de extremo.'],
  switching:['Muchos delanteros jóvenes juegan de las dos cosas. Un extremo que se mete hacia dentro para tirar ya está haciendo parte de la tarea del delantero centro.',
   'Un delantero centro que se abre a la banda arrastra a un defensa lejos del medio, y eso abre un hueco para que un extremo corra.',
   'En los partidos de pocos jugadores hay menos delanteros, así que muchas veces un mismo jugador hace las dos cosas: meter goles en el medio y ayudar por la banda.',
   'Pruébalo en el entrenamiento: deja que el delantero centro y un extremo cambien de lugar cada pocos minutos, y luego hablen de cuál se sintió más natural.']},
 '4-3-3-vs-4-4-2':{title:'Formación 4-3-3 vs 4-4-2: la diferencia',h1:'4-3-3 vs 4-4-2: ¿qué formación es mejor?',
  desc:'Las formaciones 4-3-3 y 4-4-2 comparadas para niños y entrenadores: líneas, fortalezas, puntos débiles, cómo ataca y defiende cada una y a quién le sirve.',
  answer:'El 4-4-2 tiene dos delanteros y cuatro en el mediocampo. El 4-3-3 tiene un delantero centro, dos extremos más arriba y tres mediocampistas centrales. El 4-3-3 tiene un jugador más en el medio.',
  fit:['Ninguna es mejor para todos los equipos. Elige la forma que les quede a tus jugadores.','El 4-3-3 les sirve a los equipos con extremos a los que les gusta atacar. El 4-4-2 les sirve a los equipos que quieren líneas sencillas y dos delanteros.'],
  switching:['Las dos formas empiezan con la misma línea de cuatro, así que un equipo puede cambiar de una a otra sin cambiar a sus defensas.',
   'Para pasar de un 4-4-2 a un 4-3-3, uno de los dos delanteros baja al medio del mediocampo y los dos mediocampistas abiertos suben para jugar de extremos.',
   'Los equipos también cambian de forma durante el partido: un 4-3-3 muchas veces parece un 4-5-1 cuando defiende, con los extremos bajando al lado de los mediocampistas.',
   'Pruébalo en el entrenamiento: juega el primer tiempo con una forma y el segundo con la otra, y luego pregúntales a los jugadores dónde encontraron más espacio.']},
};

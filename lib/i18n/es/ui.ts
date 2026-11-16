/** The Spanish site words shared by every /es page (glossary: lib/i18n/es-glossary.ts). */
const MONTHS=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
/** 2026-11-15 -> 15 de noviembre de 2026 (no Date object, as lib/site/checked.ts longDate). */
export function longDateEs(iso:string):string{
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);if(!m)throw new Error(`not an ISO date: ${iso}`);
 return `${Number(m[3])} de ${MONTHS[Number(m[2])-1]} de ${m[1]}`;
}
export const ES_UI={
 home:'Inicio',lessons:'Lecciones',playFree:'Juega gratis',playIsland:'Juega esto en la isla',learnIsland:'Apréndelo en la isla',play:'Jugar',
 guideNames:'El fútbol se llama soccer en Estados Unidos y Canadá. Esta guía es parte de las lecciones gratis de fútbol de Futbol Island para niños de 7 a 12 años.',
 guideFoot:'Futbol Island es un juego gratis para aprender fútbol, para niños de 7 a 12 años. Cada idea de esta página se enseña en una cancha con jugadores que se mueven y luego se repasa con una prueba rápida. El juego está en inglés por ahora.',
 openPicture:'Abre este diagrama como imagen',lastChecked:'Última revisión',howWeCheck:'Cómo revisamos los datos',
 coachNotes:'Notas del entrenador',coachPoint:'Punto clave',inMatch:'En un partido',mistakes:'Errores comunes',byAge:'Por edad',
 readNext:'Lee después',previous:'Anterior',backTo:'Volver a',keepReading:'Sigue leyendo',drills:'Ejercicios para practicarlo',
 print:'Imprimir / Guardar como PDF',printHint:(what:string)=>`Una ${what} de una página para la cancha: diagrama, pasos y puntos clave.`,
 printUrl:'Futbol Island · lecciones gratis de fútbol para niños',crumbNav:'Ruta de navegación',
 sceneDesc:(format:string,caption:string)=>`Diagrama de una ${format==='futsal'?'cancha de futsal':`cancha de fútbol ${format}`}, visto desde arriba. El equipo dorado ataca hacia arriba y el otro equipo va de verde oscuro. ${caption}`,
 playLesson:'Juega la lección en la isla',
} as const;
/** The Spanish words of the client islands (GuideQuiz, PlayBar, MotionToggle, PrintButton take them as a prop). */
export const ES_QUIZ={title:'Prueba rápida',yes:'¡Sí!',notQuite:'Casi.',answerIs:'La respuesta es:',again:'Intenta otra vez',
 cheer:(score:number,total:number)=>score===total?`¡${score}/${total}! Ya lo sabes.`:score>=total-1?`${score}/${total}. ¡Casi! Lee la que fallaste y vuelve a intentarlo.`:`${score}/${total}. Vuelve a leer la página e inténtalo otra vez.`};

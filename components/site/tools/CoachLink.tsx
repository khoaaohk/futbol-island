import s from './newTools.module.css';
/**
 * C3 (Nov 22 2026, UX audit): where a game-day tool overlaps the Coach app (/coach: the squad, the lineup and a live game), the
 * tool says so and links there. The tool itself stays standalone. Static, no client code.
 */
const W={
 en:{match:['Run the whole game with your squad in the Coach app: lineup, substitutions and this clock together.','Open the Coach app'],
  beep:['Track your squad in the Coach app: your players live there, with their lineups and minutes.','Open the Coach app'],
  tournament:['Taking a squad to the tournament? The Coach app keeps your players, lineups and minutes for each game.','Open the Coach app']},
 es:{match:['Lleva el partido entero con tu plantilla en la app del entrenador: alineación, cambios y este reloj juntos.','Abrir la app del entrenador'],
  beep:['Sigue a tu plantilla en la app del entrenador: allí están tus jugadores, con sus alineaciones y minutos.','Abrir la app del entrenador'],
  tournament:['¿Llevas una plantilla al torneo? La app del entrenador guarda tus jugadores, alineaciones y minutos de cada partido.','Abrir la app del entrenador']},
};
export default function CoachLink({kind,lang}:{kind:'match'|'beep'|'tournament';lang?:'es'}){
 const es=lang==='es',[line,cta]=W[es?'es':'en'][kind];
 const href=`/coach${es?'?lang=es':''}${kind==='match'?'#tool=match':''}`;
 return <aside className={`${s.coach} ${s.noPrint}`} data-coach-link={kind}><p>{line}</p><a className={`${s.btn} ${s.coachBtn}`} href={href}>{cta}</a></aside>;
}

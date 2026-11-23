import rt from '@/components/site/railTarget.module.css';
import b from './CoachAppBand.module.css';
/**
 * The Coach app called out at the top of the tools hub (/tools and /es/tools; owner Nov 22 2026: "call out the coaches app at the
 * top with a link"). Static: a picture of the app's Home in a phone frame, one line, Open the Coach app and Open the tactics board.
 * It is also the first section of the hub's rail (lib/site/railNavCollections.ts, #coach-app).
 */
const T={en:{h:'The free Futbol Island Coach app',line:'Your team, lineups, fair playing time, subs, a tactics board and the scan trainer in one app. Works on your phone, even offline.',
  open:'Open the Coach app',board:'Open the tactics board',alt:'The Coach app Home on a phone: the team card, Continue, and a tile for each tool',coach:'/coach',boardHref:'/board'},
 es:{h:'La app gratis para entrenadores de Futbol Island',line:'Tu equipo, alineaciones, minutos justos, cambios, una pizarra táctica y el entrenador de escaneo en una sola app. Funciona en tu teléfono, aun sin conexión.',
  open:'Abrir la app',board:'Abrir la pizarra táctica',alt:'El inicio de la app del entrenador en un teléfono: el equipo, Continuar y una tarjeta por herramienta',coach:'/coach?lang=es',boardHref:'/board'}};
export function CoachAppBand({lang='en'}:{lang?:'en'|'es'}){
 const t=T[lang];
 return <section className={b.band} aria-labelledby="coach-app">
  <div className={b.text}>
   <h2 className={`${b.h2} ${rt.target}`} id="coach-app">{t.h}</h2>
   <p className={b.line}>{t.line}</p>
   <div className={b.btns}><a className={`${b.btn} ${b.primary}`} href={t.coach}>{t.open}</a><a className={`${b.btn} ${b.ghost}`} href={t.boardHref}>{t.board}</a></div>
  </div>
  <figure className={b.phone}>
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src="/tools/coach-app-home.webp" width={360} height={720} alt={t.alt} loading="eager" decoding="async"/>
  </figure>
 </section>;
}

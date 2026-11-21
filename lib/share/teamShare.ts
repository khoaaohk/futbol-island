/**
 * "Share the game with your team" (Nov 20 2026): the words, the links and the printable Team homework sheet. Pure (no window,
 * no network), so tests/team-share.cjs runs it as it is. The component is components/share/TeamShare.tsx.
 *
 * Privacy: a link carries only fixed campaign marks (which tool, and whether it was a message, a QR code or a printed sheet).
 * Never a team name, a player or an id. The team name is used in one place only, the printed sheet, which is made on the device.
 */
import type {ShareSurface} from '@/lib/analytics/shareIds';
export type ShareLang='en'|'es';
export type ShareVia='share'|'qr'|'print';
/** [format, lesson id, English title, Spanish title] rows, handed in by the page (lib/site/lessons.ts, lib/i18n/es/lessons.ts). */
export type ShareLesson=readonly [format:string,id:string,en:string,es:string];
export const SHARE_ORIGIN='https://futbolisland.app';
export const SHARE_SHORT_LINK='futbolisland.app/play';
/** utm_source per surface: what the tool is, nothing about who used it. */
export const SHARE_SOURCE:Record<ShareSurface,string>={coach:'coach-app',lineup:'lineup-builder',minutes:'playing-time',practice:'practice-plan'};
const marks=(surface:ShareSurface,via:ShareVia)=>`utm_source=${SHARE_SOURCE[surface]}&utm_medium=${via}`;
export const gameLink=(surface:ShareSurface,via:ShareVia='share')=>`${SHARE_ORIGIN}/play?${marks(surface,via)}`;
/** A lesson's reading page (English /learn/lessons/<id>, Spanish /es/learn/lessons/<id>). */
export const lessonLink=(surface:ShareSurface,lang:ShareLang,id:string,via:ShareVia='share')=>`${SHARE_ORIGIN}${lang==='es'?'/es':''}/learn/lessons/${encodeURIComponent(id)}?${marks(surface,via)}`;
/** Formats that have their own lessons in the game (lib/site/lessons.ts FORMAT_ORDER). */
export const LESSON_FORMATS=['7v7','9v9','11v11','futsal'] as const;
export const hasLessons=(format?:string)=>!!format&&(LESSON_FORMATS as readonly string[]).includes(format);
export const lessonsFor=(lessons:readonly ShareLesson[]|undefined,format?:string)=>(lessons??[]).filter(l=>l[0]===format);

const en={
 title:'Share the game with your team',
 line:'Coaching a team? Send your players the free game.',
 open:'Share',close:'Close',
 intro:'A short message for your players’ families. Your team name and your players are not in it.',
 lesson:'This week’s lesson',noLesson:'No lesson, only the game',
 message:'Message',
 share:'Share',copy:'Copy message',qr:'Show QR code',qrHide:'Hide QR code',print:'Print team homework',
 copied:'Message copied. Paste it in your team chat.',noCopy:'Could not copy. Select the message and copy it by hand.',
 qrAlt:'QR code that opens the Futbol Island game',qrLine:'Point a phone camera at the square to open the game.',noQr:'Could not draw the QR code. The link still works.',
 hwTitle:'Team homework',hwTry:'This week, try:',hwScan:'Scan the square with a phone camera, or type',hwCut:'Cut here',
 hwWhat:'Futbol Island is a free football (soccer) game for kids aged 7 to 12. It plays in the browser on a phone, tablet or computer. No download and no account needed.',
};
export type ShareWords=typeof en;
const es:ShareWords={
 title:'Comparte el juego con tu equipo',
 line:'¿Entrenas a un equipo? Envía el juego gratis a tus jugadores.',
 open:'Compartir',close:'Cerrar',
 intro:'Un mensaje corto para las familias de tus jugadores. No lleva el nombre de tu equipo ni de tus jugadores.',
 lesson:'La lección de esta semana',noLesson:'Sin lección, solo el juego',
 message:'Mensaje',
 share:'Compartir',copy:'Copiar mensaje',qr:'Mostrar código QR',qrHide:'Ocultar código QR',print:'Imprimir tarea del equipo',
 copied:'Mensaje copiado. Pégalo en el chat de tu equipo.',noCopy:'No se pudo copiar. Selecciona el mensaje y cópialo a mano.',
 qrAlt:'Código QR que abre el juego Futbol Island',qrLine:'Apunta la cámara de un teléfono al cuadro para abrir el juego.',noQr:'No se pudo dibujar el código QR. El enlace funciona igual.',
 hwTitle:'Tarea del equipo',hwTry:'Esta semana, prueba:',hwScan:'Escanea el cuadro con la cámara de un teléfono, o escribe',hwCut:'Corta aquí',
 hwWhat:'Futbol Island es un juego de fútbol gratis para niños de 7 a 12 años. Se juega en el navegador, en un teléfono, una tableta o una computadora. No hay que descargar nada ni crear una cuenta.',
};
export const SHARE_WORDS:Record<ShareLang,ShareWords>={en,es};

const lessonsPhrase=(lang:ShareLang,format?:string)=>{
 if(!hasLessons(format))return lang==='es'?'Tiene lecciones cortas de posiciones, pases y reglas, con pruebas rápidas.':'It has short lessons on positions, passing and the rules, with quick quizzes.';
 if(lang==='es')return format==='futsal'?'Tiene lecciones cortas de futsal con pruebas rápidas.':`Tiene lecciones cortas de fútbol ${format} con pruebas rápidas.`;
 return format==='futsal'?'It has short futsal lessons with quick quizzes.':`It has short ${format} lessons with quick quizzes.`;
};
/**
 * The message a coach sends to parents. `lesson` adds "this week's lesson" with a link to that lesson's page. Plain text: it is
 * pasted into a team chat, so the links are written out.
 */
export function shareMessage({lang,surface,format,lesson}:{lang:ShareLang;surface:ShareSurface;format?:string;lesson?:ShareLesson}):string{
 const es=lang==='es',out:string[]=[];
 out.push(es?`Hola, familias. Les comparto un juego de fútbol gratis que nuestros jugadores pueden probar en casa: Futbol Island. Es para niños de 7 a 12 años. ${lessonsPhrase(lang,format)}`
  :`Hi families. Here is a free football (soccer) game our players can try at home: Futbol Island. It is for kids aged 7 to 12. ${lessonsPhrase(lang,format)}`);
 out.push(es?'Se juega en el navegador, en un teléfono, una tableta o una computadora. No hay que descargar nada ni crear una cuenta.'
  :'It plays in the browser on a phone, tablet or computer. No download and no account needed.');
 if(lesson)out.push(`${es?'La lección de esta semana':'This week’s lesson'}: ${es?lesson[3]:lesson[2]}\n${lessonLink(surface,lang,lesson[1])}`);
 out.push(`${es?'Jugar':'Play the game'}: ${gameLink(surface)}`);
 return out.join('\n\n');
}

const esc=(s:unknown)=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]!));
/**
 * The Team homework sheet: two half-pages on one sheet (one cut gives two notes to hand out). Each has the team name if the
 * coach typed one, one line on what Futbol Island is, the QR code with the short link, and a line to write on ("This week, try:";
 * the lesson's title is printed there when the coach picked one). A whole document for lib/grownups/printHtml.ts.
 */
export function homeworkHtml({lang,team,qr,tryLine}:{lang:ShareLang;team?:string;qr?:string|null;tryLine?:string}):string{
 const w=SHARE_WORDS[lang],name=(team??'').trim().slice(0,40);
 const half=`<section class="half">
<header><h1>${esc(w.hwTitle)}</h1>${name?`<p class="team">${esc(name)}</p>`:''}</header>
<div class="row">${qr?`<img src="${esc(qr)}" width="150" height="150" alt="${esc(w.qrAlt)}">`:''}
<div><p class="what">${esc(w.hwWhat)}</p><p class="scan">${qr?esc(w.hwScan)+' ':''}<b>${esc(SHARE_SHORT_LINK)}</b></p></div></div>
<p class="try"><b>${esc(w.hwTry)}</b><span class="fill">${tryLine?esc(tryLine):''}</span></p>
<p class="try second"><span class="fill"></span></p>
</section>`;
 return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(w.hwTitle)}</title><style>
body{margin:0;font:400 12.5pt/1.4 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#14221d;background:#fff}
.half{box-sizing:border-box;height:128mm;padding:9mm 4mm 6mm;display:flex;flex-direction:column;gap:6mm;break-inside:avoid}
header{display:flex;align-items:baseline;justify-content:space-between;gap:8mm}
h1{margin:0;font-size:27pt;line-height:1.05;font-weight:700;letter-spacing:-.02em}
.team{margin:0;font-size:15pt;font-weight:600;text-align:right}
.row{display:flex;align-items:center;gap:8mm}
img{flex:none;width:40mm;height:40mm;image-rendering:pixelated}
.what{margin:0;font-size:13pt;line-height:1.35}
.scan{margin:3mm 0 0;font-size:12pt}.scan b{font-size:15pt;white-space:nowrap}
.try{margin:auto 0 0;display:flex;align-items:flex-end;gap:3mm;font-size:14pt}
.try b{flex:none}
.fill{flex:1;min-height:9mm;border-bottom:1.2pt solid #14221d;font-size:14pt;padding:0 1mm 1mm}
.second{margin-top:0}
.cut{margin:0;border:0;border-top:1.2pt dashed #4f5b53;text-align:center;font-size:9pt;color:#4f5b53;height:0;overflow:visible}
.cut span{position:relative;top:-7pt;background:#fff;padding:0 3mm}
</style></head><body>${half}<p class="cut"><span>${esc(w.hwCut)}</span></p>${half}</body></html>`;
}

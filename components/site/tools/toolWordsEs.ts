import type {GuideFormat} from '@/lib/site/pitch';
import {spotsOf,type Lineup,type Shape} from '@/lib/site/tools/lineup';
import type {Rotation} from '@/lib/site/tools/rotation';
import {CREDIT,dotItems,fieldItems,GRASS,LETTER,wrapText,type Item,type Sheet,type Theme} from '@/lib/site/tools/sheet';
/**
 * The Spanish words of the tool islands (Spanish round D, Nov 16 2026): LineupBuilder, RotationPlanner, LineupHeading and
 * EmbedSnippet take `lang="es"` and read their words here; without the prop their English output is unchanged. Kept small and
 * import-free of lib/i18n (client bundle). Glossary: lib/i18n/es-glossary.ts (banca = bench, suplente = substitute, portero).
 */
export const lineupHeadingEs=(f:GuideFormat)=>f==='futsal'?'Creador de alineaciones de futsal':`Creador de alineaciones de fútbol ${f}`;
export const shapeLabelEs=(s:Shape)=>s.shape==='1-2-1'?'1-2-1 en rombo':s.shape;
/** 1st half, Quarter 2... (lib/site/tools/rotation.ts periodName). */
export const periodNameEs=(i:number,periods:number)=>periods===2?['1.er tiempo','2.º tiempo'][i]:periods===4?`Cuarto ${i+1}`:periods===1?'Partido':`Periodo ${i+1}`;
export const playerNameEs=(r:Rotation,p:number)=>r.input.names?.[p]||`Jugador ${p+1}`;
/** The plan as plain text for a team chat (lib/site/tools/rotation.ts rotationText, in Spanish). */
export function rotationTextEs(r:Rotation,team=''):string{
 const i=r.input,n=(p:number)=>playerNameEs(r,p),out=[`${team?team+': ':''}plan de minutos de juego`,`${i.players} jugadores, ${i.onField} en la cancha, ${i.periods} x ${i.periodMin} min, cambios cada ${r.blocks[0].minutes} min más o menos`,''];
 r.blocks.forEach((b,k)=>{if(k%r.blocksPerPeriod===0)out.push(periodNameEs(b.period,i.periods).toUpperCase());
  out.push(`${b.start}-${b.end} min: POR ${n(b.keeper)} | ${b.on.filter(p=>p!==b.keeper).map(n).join(', ')}${b.off.length?` | Descansan: ${b.off.map(n).join(', ')}`:''}`);
  if(k%r.blocksPerPeriod===r.blocksPerPeriod-1)out.push('');});
 out.push('MINUTOS',r.names.map((_,p)=>`${n(p)} ${r.minutes[p]}`).join(', '),'','Hecho con futbolisland.app/es/tools/soccer-playing-time-calculator');
 return out.join('\n');
}
/** lib/site/tools/lineup.ts lineupSheet with Spanish words (the shape's spot labels are already Spanish: the page passes them). */
export function lineupSheetEs(l:Lineup,s:Shape,theme:Theme=GRASS):Sheet{
 const {w,h}=LETTER.portrait,T=theme,items:Item[]=[],spots=spotsOf(s);
 const fmt=s.format==='futsal'?'Futsal':`Fútbol ${s.format}`;
 items.push({t:'text',x:50,y:78,text:(l.team||'Nuestra alineación').slice(0,30),size:40,fill:T.ink,weight:700},
  {t:'text',x:50,y:112,text:`${fmt} · formación ${shapeLabelEs(s)}`,size:20,fill:T.soft});
 const field=fieldItems(s.format,{x:50,y:140,w:520,h:860},{theme:T,sw:2.5});
 items.push(...field.items);
 const r=s.format==='11v11'?22:25;
 spots.forEach((p,i)=>{const [x,y]=field.at(p.x,p.y);items.push(...dotItems(x,y,{n:p.n,label:(l.on[i]||p.label).slice(0,14),keeper:i===0,r,theme:T,size:16}));});
 const cx=610;let y=168;
 items.push({t:'text',x:cx,y,text:'Banca',size:22,fill:T.ink,weight:700});y+=14;
 const bench=l.bench.filter(Boolean);
 if(!bench.length){y+=22;items.push({t:'text',x:cx,y,text:'Sin suplentes anotados',size:16,fill:T.soft});}
 for(const b of bench){y+=26;items.push({t:'text',x:cx,y,text:b,size:18,fill:T.ink});}
 y+=50;items.push({t:'text',x:cx,y,text:'Notas del partido',size:22,fill:T.ink,weight:700});y+=10;
 const lines=wrapText(l.note,24,Math.max(2,Math.floor((960-y)/24)));
 if(lines.length)for(const ln of lines){y+=24;items.push({t:'text',x:cx,y,text:ln,size:16,fill:T.ink});}
 else for(let i=0;i<5;i++){y+=34;items.push({t:'line',x1:cx,y1:y,x2:w-50,y2:y,stroke:T.soft,sw:1});}
 items.push({t:'text',x:w-50,y:h-48,text:`Hecho con ${CREDIT}`,size:14,fill:T.soft,weight:700,anchor:'end'});
 const who=spots.map((p,i)=>`${p.label}: ${l.on[i]||'sin nombre'}`).join(', ');
 return {w,h,bg:T.page,title:`${l.team||'Alineación'}: ${shapeLabelEs(s)} (${s.format})`,desc:`Alineación de ${s.format==='futsal'?'futsal':`fútbol ${s.format}`} en formación ${shapeLabelEs(s)}. ${who}.${bench.length?` Banca: ${bench.join(', ')}.`:''}`,items};
}
/** LineupBuilder words. */
export const LINEUP_ES={empty:'Lugar vacío',newSub:'Nuevo suplente',picked:(a:string)=>`${a} elegido. Ahora elige con quién cambiarlo.`,swapped:(a:string,b:string)=>`${a} y ${b} cambiaron de lugar.`,
 noPicture:'Este navegador no pudo crear la imagen. Prueba con Imprimir.',file:'alineacion-futbol',saved:'Imagen guardada en tus descargas.',
 linkCopied:'Enlace copiado. Quien lo abra verá esta alineación.',copyBelow:'Copia el enlace de abajo.',game:'Modalidad',formation:'Formación',team:'Nombre del equipo',teamHint:'Tiburones Azules U10',
 svg:(f:GuideFormat,shape:string,n:number)=>`Cancha de ${f==='futsal'?'futsal':f}, formación ${shape}. ${n} jugadores.`,noName:'sin nombre todavía',keeper:', portero',
 bench:'Banca',sub:'Suplente',toBenchAria:'Pasa al jugador elegido a la banca',addSubAria:'Agrega un suplente',toBench:'A la banca',plusSub:'+ Suplente',
 hint:'Toca a un jugador y luego toca a otro jugador o a un suplente para cambiarlos. También puedes arrastrar. El punto blanco es el portero: pon a cualquier jugador en él para cambiar de portero.',
 print:'Imprimir',download:'Descargar imagen',copy:'Copiar enlace',makeKeeper:'Hacer portero',clear:'Borrar',cleared:'Alineación borrada.',linkLabel:'Enlace a esta alineación',
 privacy:'Los nombres se quedan en tu dispositivo. Nada de lo que escribes se envía a Futbol Island ni se guarda en un servidor. Un enlace copiado lleva la alineación dentro del propio enlace, así que usa nombres de pila o apodos.',
 names:'Nombres y nota del partido',nameOf:(label:string)=>`Nombre: ${label}`,firstName:'Nombre',subN:(n:number)=>`Suplente ${n}`,subNameOf:(n:number)=>`Nombre del suplente ${n}`,removeSub:(n:number)=>`Quitar suplente ${n}`,
 addSub:'Agregar un suplente',note:'Nota del partido',noteHint:'Saque inicial 9:30, cancha 4. Camisetas blancas.'};
/** RotationPlanner words. */
export const ROTATION_ES={textCopied:'Plan copiado como texto. Pégalo en el chat del equipo.',noCopy:'No se pudo copiar. Selecciona la tabla y cópiala a mano.',
 linkCopied:'Enlace copiado. Quien lo abra verá este plan.',copyBelow:'Copia el enlace de abajo.',game:'Modalidad',own:'Tus propios números',players:'Jugadores en el partido',onField:'En la cancha',
 periods:'Periodos',periodOpt:(n:number)=>n===1?'1 (sin descanso)':n===2?'2 tiempos':n===4?'4 cuartos':`${n} periodos`,periodMin:'Minutos por periodo',subEvery:'Cambio cada (min)',
 keeper:'Portero',rotate:'Un portero nuevo en cada periodo',fixed:'Un solo portero todo el partido',team:'Nombre del equipo (opcional)',names:'Nombres, uno por línea (opcional)',namesHint:'Ana\nBeto\nCarlos',
 privacy:'Los nombres se quedan en tu dispositivo. Nada de lo que escribes se envía a Futbol Island ni se guarda en un servidor.',firstKeeper:' El primer jugador de la lista es el portero.',
 planOf:(t:string)=>`${t}: el plan`,plan:'Tu plan de cambios',
 summary:(o:{players:number;onField:number;gameMin:number;bench:number;rotates:boolean;lo:number;hi:number;block:number})=>o.bench<=0
  ?`Con ${o.players} jugadores y ${o.onField} en la cancha no hay suplentes: todos juegan el partido completo de ${o.gameMin} minutos.`
  :`${o.players} jugadores comparten ${o.onField} lugares durante ${o.gameMin} minutos. ${o.rotates?'Cada jugador':'Cada jugador de campo'} está en la cancha ${o.lo===o.hi?`${o.lo} minutos`:`de ${o.lo} a ${o.hi} minutos`}${o.rotates?'':`, y el portero juega los ${o.gameMin}`}. ${o.bench} descansan en cada bloque de unos ${o.block} minutos.`,
 region:'Tabla de rotación',table:'Quién está en la cancha en cada bloque',time:'Cuándo',on:'En la cancha',off:'Descansan',nobody:'Nadie',minutes:'Minutos de cada jugador',
 print:'Imprimir',copyText:'Copiar como texto',copyLink:'Copiar enlace',linkLabel:'Enlace a este plan',
 made:'Hecho con futbolisland.app. Haz el cambio en la siguiente parada que permita tu liga; los tiempos son metas.'};
/** EmbedSnippet words. */
export const EMBED_ES={copied:'Copiado. Pégalo en la página web de tu club.',select:'Selecciona el código y cópialo.',title:'Úsalo en la página web de tu club',
 line:(name:string)=>`Pega este código en la página web de tu club o liga para mostrar el ${name} allí, para tus entrenadores y familias. La herramienta insertada está en inglés por ahora.`,
 caption:'Sin anuncios, sin rastreo, sin registro; los nombres que se escriben se quedan en el dispositivo de cada visitante.',code:'Código para insertar',copy:'Copiar el código'};

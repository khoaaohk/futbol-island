import RailNav from '@/components/site/shell/RailNav';
import {lineupRail,plannerRail,printableRail,printablesHubRail,toolsHubRail} from '@/lib/site/railNavCollections';
import KeepReading from '@/components/site/KeepReading';
import type {EsRoute} from '../routes';
import JsonLd from '@/components/seo/JsonLd';
import LineupBuilder from '@/components/site/tools/LineupBuilder';
import LineupHeading from '@/components/site/tools/LineupHeading';
import RotationPlanner from '@/components/site/tools/RotationPlanner';
import EmbedSnippet from '@/components/site/tools/EmbedSnippet';
import {AppLink,PrintStyle,Screen} from '@/components/site/tools/ToolParts';
import SheetSvg from '@/lib/site/tools/SheetSvg';
import {FAMILY_CHECKED} from '@/lib/site/checked';
import {formationsIn} from '@/lib/site/formations';
import {GUIDE_FORMATS,PITCH,place,PLAYERS_PER_TEAM,type GuideFormat} from '@/lib/site/pitch';
import {positionPath} from '@/lib/site/positions';
import {abs,breadcrumbLd,collectionLd,faqLd,type Crumb} from '@/lib/site/seo';
import {SIZES_SEASON} from '@/lib/site/sizes';
import {EMBED_HEIGHT,embedPath,plannerSetup} from '@/lib/site/tools/embed';
import {DEFAULT_FORMATION} from '@/lib/site/tools/lineup';
import {cheatSheetPath,fileUrl,PRINTABLES,PRINTABLES_HUB_PATH,PRINT_FILES,templateSheet,type Printable,type PrintFile,type Variant} from '@/lib/site/tools/printables';
import {gameLengths,LINEUP_PAGES,LINEUP_PATH,PLANNER_PAGES,PLANNER_PATH,plannerImage,printableImage,printableLd,PRINTABLES_HUB,TOOL_PAGES,TOOLS_HUB,TOOLS_UPDATED,webAppLd,type LineupPage,type PlannerPage} from '@/lib/site/tools/registry';
import {SHAPES} from '@/lib/site/tools/shapes';
import ScanTrainerPage from '@/components/site/tools/ScanTrainerPage';
import {EsGridFigure} from './DrillsEs';
import {SCAN_IMAGE,SCAN_PATH,SCAN_RELATED_EN} from '@/lib/site/tools/scanTrainer';
import {SCAN_ES} from '@/lib/i18n/es/scanTrainer';
import {CREDIT,dotItems,fieldItems,INK,LETTER,LICENCE,wrapText,type Item,type Sheet} from '@/lib/site/tools/sheet';
import {hasEs,toEs} from '@/lib/i18n/esPaths';
import {esMeta} from '@/lib/i18n/es/seo';
import {ES_UI,longDateEs} from '@/lib/i18n/es/ui';
import {ES_FORMATIONS,ES_HUBS,ES_POSITIONS,esFormatGuide,esFormation,esFormationsIn,esLines,esRule} from '@/lib/i18n/es/registry';
import {LICENCE_ES,LINEUP_PAGES_ES,PLANNER_PAGES_ES,PRINTABLES_ES,PRINTABLES_HUB_ES,PRIVACY_LINE_ES,TOOL_NAMES_ES,TOOLS_HUB_ES,fieldNameEs} from '@/lib/i18n/es/tools';
import type {PrintableEs,ToolPageEs} from '@/lib/i18n/es/types';
import {ToolCards} from '@/components/site/tools/ToolCards';
import {DataTable,EsBreadcrumbs,EsPlayEnd,LinkList,QA,QuickAnswer,Section,esCrumbs,esLibCrumbs,type Fact} from '@/components/es/EsParts';
import {esLd} from './GuidesEs';
import site from '@/app/(site)/site.module.css';
import t from '@/components/site/tools/tools.module.css';
/**
 * The Spanish tools family (Spanish round D, Nov 16 2026): /es/tools, the lineup builder and its four format landings, the
 * playing-time calculator and its two rotation landings, the field-diagram hub and its nine sheets. Same sections, markup and
 * classes as app/(site)/tools; words from lib/i18n/es/tools.ts. The client tools take `lang="es"` (components/site/tools/
 * toolWordsEs.ts). The sheet on a printable page is drawn with Spanish words; the downloadable .png/.svg files and the thumbnails
 * are the English files (app/(site)/tools/soccer-field-diagrams/files), and the club embed (/embed) is English.
 */
const cap=(s:string)=>s[0].toUpperCase()+s.slice(1);
const need=<T,>(rec:Readonly<Record<string,T>>,slug:string):T=>{const x=rec[slug];if(!x)throw new Error(`Spanish tool page "${slug}" is missing (lib/i18n/es/tools.ts)`);return x;};
const lineupEs=(p:LineupPage):ToolPageEs=>need(LINEUP_PAGES_ES,p.slug);
const plannerEs=(p:PlannerPage):ToolPageEs=>need(PLANNER_PAGES_ES,p.slug);
const printEs=(p:Printable):PrintableEs=>need(PRINTABLES_ES,p.slug);
const PRINT_HUB=PRINTABLES_HUB_ES(PRINT_FILES.length),HUB=TOOLS_HUB_ES;
const toolCrumbsEs=(...tail:Crumb[])=>esLibCrumbs({name:HUB.crumb,path:toEs(TOOLS_HUB.path)},...tail);
const image=(enPath:string)=>TOOL_PAGES.find(x=>x.path===enPath)!.image!;
type Link={path:string;name:string;line:string};
/** Pages outside the families above, by English path: their Spanish name and line. */
const OTHER:Readonly<Record<string,readonly [string,string]>>={
 '/learn/soccer-age-groups':['Grupos de edad del fútbol explicados','De U6 a U19 y qué modalidad juega cada uno'],
 '/learn/soccer-field-size-by-age':['Tamaño de la cancha de fútbol por edad','Cancha, arco y duración del partido para cada grupo de edad'],
 '/learn/lessons':['Todas las lecciones de fútbol','Lecciones animadas cortas con una prueba rápida'],
 '/learn/futsal-for-kids':['Lecciones de futsal para niños','Cada lección de futsal, agrupada por tema'],
};
/** A link from a Spanish tool page: the Spanish page when it exists; else, for a key link, the English page marked “(en inglés)”. */
function esLink(enPath:string,o:{name?:string;line?:string;key?:boolean}={}):Link|null{
 const tool=toolLink(enPath);if(tool)return {...tool,...(o.name?{name:o.name}:{}),...(o.line?{line:o.line}:{})};
 const f=ES_FORMATIONS().find(x=>x.path===enPath);if(f)return {path:f.esPath,name:o.name??`Formación ${f.name}`,line:o.line??f.best};
 const p=ES_POSITIONS().find(x=>x.path===enPath);if(p)return {path:p.esPath,name:o.name??p.name,line:o.line??'Qué hace esta posición'};
 const hub=Object.values(ES_HUBS).find(h=>h.enPath===enPath);if(hub)return {path:hub.path,name:o.name??hub.h1,line:o.line??hub.blurb};
 const g=(['7v7','9v9','11v11'] as const).find(x=>`/learn/${x}-soccer-formations`===enPath);if(g){const e=esFormatGuide(g);return {path:e.esPath,name:o.name??`Formaciones de fútbol ${g}`,line:o.line??e.blurb};}
 const other=OTHER[enPath],name=o.name??other?.[0],line=o.line??other?.[1]??'';if(!name)return null;
 if(hasEs(enPath))return {path:toEs(enPath),name,line};
 return o.key?{path:enPath,name:`${name} (en inglés)`,line}:null;
}
function toolLink(enPath:string):Link|null{
 const l=LINEUP_PAGES.find(x=>x.path===enPath);if(l){const e=lineupEs(l);return {path:toEs(l.path),name:e.h1,line:e.blurb};}
 const r=PLANNER_PAGES.find(x=>x.path===enPath);if(r){const e=plannerEs(r);return {path:toEs(r.path),name:e.h1,line:e.blurb};}
 if(enPath===PRINTABLES_HUB_PATH)return {path:toEs(enPath),name:PRINT_HUB.h1,line:PRINT_HUB.blurb};
 const s=PRINTABLES.find(x=>x.path===enPath);if(s){const e=printEs(s);return {path:toEs(s.path),name:e.h1,line:e.blurb};}
 return null;
}
const links=(xs:(Link|null)[])=>xs.filter((x):x is Link=>!!x);

// ---- shared parts ----
function EsToolIntro({crumbs,h1,lead,headingFormat,app,facts}:{crumbs:readonly Crumb[];h1:string;lead:string;headingFormat?:GuideFormat;/** the coach tool to open (Nov 22 2026: /coach#tool=…) */app?:'lineup'|'minutes'|'subs';facts?:readonly Fact[]}){
 return <header className={`${site.intro} ${t.head}`} id="top">
  <EsBreadcrumbs crumbs={crumbs}/>
  {headingFormat?<LineupHeading format={headingFormat} className={site.title} lang="es"/>:<h1 className={site.title}>{h1}</h1>}
  <QuickAnswer lead={lead} facts={facts}/>
  {app&&<AppLink href={`/coach?lang=es#tool=${app}`} label="Abrir la app del entrenador" line="La misma herramienta como app para el día del partido: reloj de cambios en vivo, funciona sin conexión, sin cuenta."/>}
  <p className={site.caption}>{TOOL_NAMES_ES}</p>
 </header>;
}
const EsToolEnd=()=><><div className={site.endNote}><p className={site.caption}>{ES_UI.guideFoot}</p></div><EsPlayEnd sticky={false}/></>;
const LicenceEs=()=><p className={site.caption} id="licence">{LICENCE_ES}</p>;
const webAppEs=(o:{name:string;path:string;description:string;image?:string;features:string[]})=>esLd({...webAppLd(o),audience:{'@type':'Audience',audienceType:'Entrenadores de fútbol infantil, maestros y padres'}});
const embedSnippetEs=(p:LineupPage|PlannerPage,h1:string)=>`<iframe src="${abs(embedPath(p.slug))}" title="${h1} (Futbol Island)" width="100%" height="${EMBED_HEIGHT[p.kind]}" style="border:0;max-width:760px" loading="lazy" referrerpolicy="strict-origin"></iframe>\n<p style="font:14px sans-serif;margin:8px 0 0"><a href="${abs(toEs(p.path))}">Hecho con Futbol Island</a></p>`;/* Nov 20 2026: one visible credit line, like the English code (lib/site/tools/embed.ts) */

// ---- Spanish sheets (the page preview; same drawing as lib/site/tools/printables.ts, Spanish words) ----
const VARIANT_LABEL:Record<Variant,string>={blank:'En blanco','no-build-out-lines':'Sin líneas de salida',thirds:'Tercios',zones:'Zonas'};
const VARIANT_TITLE:Record<Variant,string>={blank:'lisa','no-build-out-lines':'sin líneas de salida',thirds:'con tercios',zones:'con zonas'};
const VARIANT_HEAD:Record<Variant,string>={blank:'','no-build-out-lines':'sin líneas de salida',thirds:'tercios',zones:'zonas'};
const fileParts=(f:PrintFile)=>{const m=/-(blank|no-build-out-lines|thirds|zones)-(portrait|landscape)$/.exec(f.name);return m?{v:m[1] as Variant,landscape:m[2]==='landscape'}:null;};
function templateSheetEs(format:GuideFormat,v:Variant,landscape:boolean):Sheet{
 const en=templateSheet(format,v,landscape),name=fieldNameEs(format);
 const marks=v==='thirds'?' Dos líneas punteadas la dividen en tercio defensivo, tercio medio y tercio ofensivo.':v==='zones'?' Líneas punteadas la dividen en tercios y en carriles a lo largo.'
  :PITCH[format].buildOut&&v==='blank'?' Las dos líneas punteadas son las líneas de salida.':'';
 const items=en.items.map((i,n)=>i.t!=='text'?i:n===0?{...i,text:`${cap(name)}${VARIANT_HEAD[v]?` · ${VARIANT_HEAD[v]}`:''}`}:i.text===LICENCE?{...i,text:LICENCE_ES}:i);
 return {...en,items,title:`Plantilla de ${name} en blanco, ${VARIANT_TITLE[v]}`,
  desc:`Una ${name} vacía vista desde arriba, ${landscape?'de lado, con los arcos a la izquierda y a la derecha':'vertical, con un arco arriba y otro abajo'}, con sus áreas penales, la línea media y el círculo central.${marks}`};
}
const footerEs=(w:number,h:number):Item[]=>[{t:'text',x:40,y:h-30,text:LICENCE_ES,size:11,fill:INK.soft},{t:'text',x:w-40,y:h-30,text:CREDIT,size:13,fill:INK.ink,weight:700,anchor:'end'}];
function cheatSheetEs(format:GuideFormat):Sheet{
 const {w,h}=LETTER.portrait,list=esFormationsIn(format),cols=list.length===4?2:3,rows=Math.ceil(list.length/cols),futsal=format==='futsal';
 const head=futsal?'Formaciones de futsal':`Formaciones de fútbol ${format}`,items:Item[]=[{t:'text',x:40,y:70,text:head,size:36,fill:INK.ink,weight:700},
  {t:'text',x:40,y:100,text:futsal?'Cinco jugadores: los números cuentan a los cuatro jugadores de cancha desde atrás. El portero va aparte.':`${PLAYERS_PER_TEAM[format]} jugadores: los números cuentan a los jugadores de campo desde la defensa hacia adelante. El portero va aparte.`,size:15,fill:INK.soft}];
 const gx=40,gy=126,gw=w-80,gh=h-gy-60,cw=gw/cols,ch=Math.min(gh/rows,rows===1?520:999);
 list.forEach((f,i)=>{const x=gx+(i%cols)*cw,y=gy+Math.floor(i/cols)*ch,field=fieldItems(format,{x:x+12,y:y+44,w:cw-24,h:ch-104},{theme:INK,sw:1.8});
  const r=Math.max(9,Math.min(15,field.w/15));
  items.push({t:'text',x:x+cw/2,y:y+30,text:f.shapeEs,size:24,fill:INK.ink,weight:700,anchor:'middle'},...field.items);
  place(f.lines).forEach((s,n)=>{const [px,py]=field.at(s.x,s.y);items.push(...dotItems(px,py,{n:s.n,keeper:n===0,r,theme:INK}));});
  wrapText(f.best,Math.floor(cw/7.2),2).forEach((ln,n)=>items.push({t:'text',x:x+cw/2,y:y+ch-40+n*16,text:ln,size:13,fill:INK.soft,anchor:'middle'}));});
 items.push(...footerEs(w,h));
 return {w,h,bg:INK.page,title:`Hoja de referencia: ${head.toLowerCase()}`,desc:`${list.length} formaciones de ${futsal?'futsal':format} en una página, cada una dibujada en una ${fieldNameEs(format)} pequeña vista desde arriba: ${list.map(f=>f.shapeEs).join(', ')}.`,items};
}
function positionsSheetEs():Sheet{
 const {w,h}=LETTER.portrait,f=esFormation('11v11-4-3-3')!,enSpots=place(f.lines),spots=place(esLines(f.lines)),items:Item[]=[{t:'text',x:40,y:70,text:'Posiciones y números del fútbol',size:36,fill:INK.ink,weight:700},
  {t:'text',x:40,y:100,text:'Las once posiciones de un 4-3-3 con los números del 1 al 11 que usan los entrenadores.',size:15,fill:INK.soft}];
 const field=fieldItems('11v11',{x:40,y:130,w:470,h:h-200},{theme:INK,sw:2.2});items.push(...field.items);
 spots.forEach((s,n)=>{const [x,y]=field.at(s.x,s.y);items.push(...dotItems(x,y,{n:s.n,label:s.label,keeper:n===0,r:19,theme:INK,size:13}));});
 const name=(slug?:string)=>ES_POSITIONS().find(p=>p.slug===slug)?.name??'';
 const side=(l:string)=>/^L/.test(l)&&l!=='LCB'&&l!=='LCM'?' izquierdo':/^R/.test(l)&&l!=='RCB'&&l!=='RCM'?' derecho':'';
 let y=160;const x=540;items.push({t:'text',x,y,text:'Número, nombre corto, posición',size:15,fill:INK.soft,weight:700});
 for(const n of spots.map((_,i)=>i).sort((a,b)=>Number(spots[a].n)-Number(spots[b].n))){const s=spots[n],full=name(enSpots[n].pos)+side(enSpots[n].label);y+=42;
  items.push({t:'circle',cx:x+16,cy:y-6,r:16,fill:s.n==='1'?INK.keeper:INK.dot,stroke:INK.ink,sw:2},{t:'text',x:x+16,y:y,text:s.n,size:16,fill:INK.ink,weight:700,anchor:'middle'},
   {t:'text',x:x+44,y,text:s.label,size:17,fill:INK.ink,weight:700},{t:'text',x:x+108,y,text:full[0].toUpperCase()+full.slice(1).toLowerCase(),size:17,fill:INK.ink});}
 y+=54;for(const ln of wrapText('Los números son una costumbre común de los entrenadores, no una regla. Los jugadores pueden usar cualquier número en la camiseta, y la costumbre cambia de un país a otro.',36)){items.push({t:'text',x,y,text:ln,size:14,fill:INK.soft});y+=19;}
 items.push(...footerEs(w,h));
 return {w,h,bg:INK.page,title:'Hoja de posiciones y números del fútbol',desc:`Una cancha de fútbol 11v11 vista desde arriba con una formación 4-3-3. Cada punto lleva su número y su nombre corto: ${spots.map(s=>`${s.n} ${s.label}`).join(', ')}. Una lista al lado de la cancha da el nombre completo de la posición de cada número.`,items};
}
function fileEs(p:Printable,f:PrintFile):{label:string;note:string;sheet:Sheet}{
 const fp=fileParts(f),fmt=p.format??'11v11';
 if(fp){const {v,landscape}=fp;return {label:`${VARIANT_LABEL[v]}, ${landscape?'horizontal':'vertical'}`,
  note:v==='blank'?(PITCH[fmt].buildOut?'Marcas oficiales con las dos líneas de salida':'Solo las marcas oficiales'):v==='thirds'?'Tercio defensivo, medio y ofensivo':v==='zones'?'Tercios y carriles para enseñar el espacio':'Para ligas que juegan 7v7 sin ellas',
  sheet:templateSheetEs(fmt,v,landscape)};}
 const note='Tamaño carta (US Letter); también se imprime bien en A4 con “ajustar a la página”';
 return p.kind==='positions'?{label:'Cuadro de posiciones, vertical',note,sheet:positionsSheetEs()}:{label:'Hoja de referencia, vertical',note,sheet:cheatSheetEs(fmt)};
}
function DownloadsEs({file,label}:{file:PrintFile;label:string}){
 return <div className={t.dl}><a className={t.dlBtn} href={fileUrl(file.name,'png')} download aria-label={`Descargar PNG: ${label}`}>Descargar PNG</a><a className={t.dlBtn} href={fileUrl(file.name,'svg')} download aria-label={`Descargar SVG: ${label}`}>Descargar SVG</a></div>;
}
function SheetThumbEs({file,alt}:{file:PrintFile;alt:string}){
 const s=file.sheet();
 // eslint-disable-next-line @next/next/no-img-element
 return <div className={t.sheet}><img src={fileUrl(file.name,'svg')} alt={alt} width={s.w} height={s.h} loading="lazy" decoding="async"/></div>;
}

// ---- /es/tools ----
function ToolsHubEs(){
 const crumbs=esLibCrumbs({name:HUB.crumb,path:toEs(TOOLS_HUB.path)});
 const items=[...LINEUP_PAGES.map(p=>toolLink(p.path)!),...PLANNER_PAGES.map(p=>toolLink(p.path)!),toolLink(PRINTABLES_HUB_PATH)!,...PRINTABLES.map(p=>toolLink(p.path)!),{path:toEs(SCAN_PATH),name:SCAN_ES.h1,line:SCAN_ES.blurb}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd(collectionLd({name:HUB.h1,path:toEs(TOOLS_HUB.path),description:HUB.description,published:TOOLS_UPDATED,modified:TOOLS_UPDATED,items:items.map(x=>({name:x.name,path:x.path}))}))}/>
  <JsonLd data={faqLd(HUB.faq)}/>
  <RailNav rail={toolsHubRail(true)} current="#top"/>
  <EsToolIntro crumbs={crumbs} h1={HUB.h1} lead={HUB.lead}/>
  <Section id="lineups" title="Creadores de alineaciones">
   <p>Pon los nombres en un diagrama de cancha, cambia jugadores con un toque y luego imprime la hoja, guarda una imagen o comparte un enlace. {PRIVACY_LINE_ES}</p>
   <ToolCards links={LINEUP_PAGES.map(p=>toolLink(p.path)!)} tint="lineups"/>
  </Section>
  <Section id="playing-time" title="Minutos de juego y cambios">
   <p>Escribe cuántos jugadores vinieron y cuánto dura el partido. La calculadora reparte los minutos por igual y te dice quién entra en cada cambio.</p>
   <ToolCards links={PLANNER_PAGES.map(p=>toolLink(p.path)!)} tint="time"/>
  </Section>
  <Section id="practice" title="Apps para el entrenamiento y el partido">
   <p>Dos apps para la cancha: un entrenador de escaneo que muestra colores, números, flechas y pases para que los jugadores miren por encima del hombro, y una app del entrenador con la alineación y un reloj de cambios en vivo.</p>
   <ToolCards links={[{path:toEs(SCAN_PATH),name:SCAN_ES.h1,line:SCAN_ES.blurb},{path:'/coach?lang=es',name:'App del entrenador para el partido',line:'La alineación y un reloj de cambios en vivo en tu teléfono; funciona sin conexión, sin cuenta'}]} tint="practice"/>
  </Section>
  <Section id="printables" title="Diagramas de cancha y hojas de referencia para imprimir">
   <p>Canchas en blanco para dibujar, todas las formaciones de una modalidad en una página, y las posiciones con sus números. Gratis para imprimir y compartir con equipos, clubes y escuelas.</p>
   <ToolCards links={[toolLink(PRINTABLES_HUB_PATH)!,...PRINTABLES.map(p=>toolLink(p.path)!)]} tint="print"/>
  </Section>
  <QA id="faq" title="Preguntas sobre las herramientas" faq={HUB.faq}/>
  <Section id="guides" title="Guías que acompañan a las herramientas"><LinkList links={links([esLink('/learn/soccer-formations',{name:'Formaciones de fútbol',line:'Cada formación de 7v7, 9v9, 11v11 y futsal, con un diagrama'}),esLink('/learn/soccer-positions',{name:'Posiciones del fútbol',line:'Qué hace cada posición y los números del 1 al 11'}),
   esLink('/learn/soccer-rules',{name:'Reglas del fútbol para niños',line:'Cada regla con un diagrama'}),esLink('/learn/soccer-age-groups'),esLink('/learn/lessons')])}/></Section>
  <EsToolEnd/>
 </>;
}

// ---- the lineup builder and its landings ----
const shapesEs=SHAPES.map(s=>({...s,lines:esLines(s.lines)}));
function LineupEs({p}:{p:LineupPage}){
 const e=lineupEs(p),format=p.format??'7v7',f=esFormation(DEFAULT_FORMATION[format])!,crumbs=toolCrumbsEs({name:e.crumb,path:toEs(p.path)});
 const others=LINEUP_PAGES.filter(x=>x!==p).map(x=>{const o=toolLink(x.path)!;return {...o,name:cap(o.name)};});
 const related=links([...(p.format?esFormationsIn(format).map(x=>({path:x.esPath,name:`Formación ${x.name}`,line:x.best})):[]),
  p.format?esLink(format==='futsal'?'/learn/futsal-for-kids':`/learn/${format}-soccer-formations`,{line:'Cómo elegir una forma, con un diagrama de cada una',key:true}):esLink('/learn/soccer-formations',{name:'Las formaciones de fútbol explicadas',line:'Cómo elegir una forma, con un diagrama de cada una'}),
  p.format?esLink(cheatSheetPath(format),{line:'Cada forma de esta modalidad en una página para imprimir'}):esLink(PRINTABLES_HUB_PATH,{name:'Hojas de referencia de formaciones y canchas en blanco'}),
  esLink(PLANNER_PATH,{line:'Un plan de cambios justo para el mismo plantel'}),...others]);
 const fmtWord=format==='futsal'?'futsal':format;
 /* visual pass Nov 17 2026: the same key facts as the English page (app/(site)/tools/[slug]/page.tsx) */
 const facts:Fact[]=[{icon:format==='futsal'?'court':'lineup',label:'Modalidades',value:p.format?fmtWord:'7v7, 9v9, 11v11, futsal'},
  {icon:'diagram',label:'Formaciones',value:`${p.format?esFormationsIn(format).length:ES_FORMATIONS().length} para elegir`},{icon:'share',label:'Compártela',value:'Imprimir, imagen o enlace'},{icon:'lock',label:'Cuenta',value:'Ninguna, los nombres se quedan en tu dispositivo'}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={webAppEs({name:e.h1,path:toEs(p.path),description:e.description,image:image(p.path),
   features:['Alineaciones para 7v7, 9v9, 11v11 y futsal','Arrastra o toca para cambiar jugadores y suplentes','Impresión de una página','Descarga de imagen','Compartir por enlace','Sin cuenta; los nombres se quedan en el dispositivo']})}/>
  <JsonLd data={faqLd(e.faq.map(x=>({...x})))}/>
  <PrintStyle/>
  <RailNav rail={lineupRail(!!p.format,true)} current="#top"/>
  <Screen><EsToolIntro crumbs={crumbs} h1={e.h1} lead={e.lead} headingFormat={p.format} app="lineup" facts={facts}/></Screen>
  <LineupBuilder shapes={shapesEs} initial={f.slug} lockFormat={p.format} lang="es"/>
  <Screen>
   <Section id="how" title="Cómo armar tu alineación">
    <ol>
     <li>Elige la modalidad y la formación. La cancha y los puntos cambian para coincidir.</li>
     <li>Escribe un nombre de pila o un apodo para cada posición y agrega a tus suplentes.</li>
     <li>Toca a un jugador y luego toca a otro jugador o a un suplente para cambiarlos. En una computadora puedes arrastrar, o usar Tab, las flechas y Enter.</li>
     <li>Agrega el nombre de tu equipo y una nota del partido, como la hora del saque inicial.</li>
     <li>Presiona Imprimir para una hoja de una página, Descargar imagen para un PNG, o Copiar enlace para mandarle la alineación a alguien.</li>
    </ol>
   </Section>
   <Section id="about" title={p.format?`Sobre las alineaciones de ${fmtWord}`:'Por qué dibujar la alineación'}>{e.intro.map(x=><p key={x}>{x}</p>)}</Section>
   {!p.format&&<Section id="shapes" title="Todas las formaciones que puedes armar" fold>
    <p>{ES_FORMATIONS().length} formas en cuatro modalidades. Cada una se abre en el creador desde su guía, donde primero puedes leer sus roles, sus fortalezas y sus puntos débiles.</p>
    <LinkList links={ES_FORMATIONS().map(x=>({path:x.esPath,name:`Formación ${x.name}`,line:x.best}))}/>
   </Section>}
   {p.format&&<Section id="roles" title={`Quién juega dónde en un ${f.shapeEs}`}>
    <p>El creador se abre con la formación {f.name}. Estas son sus tareas; <a href={f.esPath}>la guía del {f.shapeEs}</a> tiene las fortalezas, los puntos débiles y cómo se mueve la forma.</p>
    <ul>{f.roles.map(r=><li key={r.title}><b>{r.pos&&hasEs(positionPath(r.pos))?<a href={toEs(positionPath(r.pos))}>{r.title}</a>:r.title}.</b> {r.job}</li>)}</ul>
   </Section>}
   <EmbedSnippet snippet={embedSnippetEs(p,e.h1)} name={e.h1.toLowerCase()} lang="es"/>
   <QA id="faq" title={`Preguntas sobre el ${e.h1.toLowerCase()}`} faq={e.faq.map(x=>({...x}))}/>
  <KeepReading lang="es" title="Formaciones y más herramientas" groups={[{id:'related',links:related}]}/>
   <EsToolEnd/>
  </Screen>
 </>;
}

// ---- the playing-time calculator and its landings ----
const lengthEs=(s:string)=>s.replace(/(\d+) halves of (\d+) min/,'$1 tiempos de $2 min').replace(/(\d+) quarters of (\d+) min/,'$1 cuartos de $2 min').replace(/ to /g,' a ');
function PlannerEs({p}:{p:PlannerPage}){
 const e=plannerEs(p),crumbs=toolCrumbsEs({name:e.crumb,path:toEs(p.path)}),format=p.format??'7v7',{presets,initial}=plannerSetup(p);
 const presetsEs=presets.map(x=>({...x,label:lengthEs(x.label)}));
 const rows=GUIDE_FORMATS.filter(f=>f!=='futsal').flatMap(f=>gameLengths(f).map(x=>[`${f} (${lengthEs(x.ages)})`,`${PLAYERS_PER_TEAM[f]}`,lengthEs(x.label),`${x.periods*x.periodMin} min`]));
 const subs=esRule('substitutions-and-game-length');
 const related=links([subs?{path:subs.esPath,name:subs.h1,line:'Cuánto duran los partidos y cómo funcionan los cambios'}:null,esLink('/learn/soccer-field-size-by-age'),esLink('/learn/soccer-age-groups'),
  esLink(p.format?`/tools/${p.format}-lineup-builder`:LINEUP_PATH,{line:'Pon a los titulares en un diagrama de cancha'}),
  ...PLANNER_PAGES.filter(x=>x!==p).map(x=>toolLink(x.path)),esLink(PRINTABLES_HUB_PATH,{name:'Diagramas de cancha de fútbol en blanco'})]);
 const ages=esLink('/learn/soccer-age-groups',{key:true})!;
 const facts:Fact[]=[{icon:'lineup',label:'Modalidades',value:p.format??'7v7, 9v9, 11v11'},{icon:'clock',label:'Minutos',value:'Iguales para cada jugador'},
  {icon:'share',label:'Compártelo',value:'Imprimir, texto o enlace'},{icon:'lock',label:'Cuenta',value:'Ninguna, los nombres se quedan en tu dispositivo'}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={webAppEs({name:e.h1,path:toEs(p.path),description:e.description,image:plannerImage(p),
   features:['Minutos iguales para un plantel de cualquier tamaño','Portero fijo o que rota','Tabla para imprimir','Copiar como texto para el chat del equipo','Compartir por enlace','Sin cuenta; los nombres se quedan en el dispositivo']})}/>
  <JsonLd data={faqLd(e.faq.map(x=>({...x})))}/>
  <PrintStyle/>
  <RailNav rail={plannerRail(!!p.format,true)} current="#top"/>
  <Screen><EsToolIntro crumbs={crumbs} h1={e.h1} lead={e.lead} app={p.format?'subs':'minutes'} facts={facts}/></Screen>
  <RotationPlanner presets={presetsEs} initial={initial} lockKey={p.format} lang="es"/>
  <Screen>
   <Section id="about" title={p.format?`Repartir un partido de ${p.format}`:'Por qué planear los cambios'}>{e.intro.map(x=><p key={x}>{x}</p>)}</Section>
   <Section id="why" title="Por qué importan los minutos iguales a estas edades">
    <p>Los niños aprenden el juego jugándolo. Un niño de diez años en la banca no está aprendiendo a recibir un pase bajo presión, y a esa edad nadie puede saber quién será el mejor jugador a los dieciséis: los niños crecen y aprenden a velocidades muy distintas.</p>
    <p>El fútbol infantil de Estados Unidos pasó a los juegos reducidos (7v7, luego 9v9) para que cada niño toque más el balón. Repartir los minutos con justicia sigue la misma idea: más niños, más toques, más fútbol aprendido.{p.format?'':' Muchas ligas recreativas también fijan una parte mínima del partido para cada jugador, así que revisa las reglas de tu liga.'}</p>
    <p>Un plan es un punto de partida. Si un niño se lastima, se molesta o simplemente está volando, cámbialo: la meta es una parte justa durante la temporada, no una tabla perfecta cada semana.</p>
   </Section>
   <Section id="lengths" title="Duración típica de los partidos infantiles en Estados Unidos" fold>
    <DataTable label="Duración típica de los partidos infantiles en Estados Unidos por modalidad" head={['Modalidad','Jugadores en la cancha','Duración del partido','Total']} rows={rows}/>
    <p className={site.caption}>Estándares típicos del fútbol infantil de Estados Unidos para la temporada {SIZES_SEASON}, de la <a href={ages.path}>tabla de grupos de edad{ages.name.endsWith('(en inglés)')?' (en inglés)':''}</a> de Futbol Island (fuentes: U.S. Soccer y US Youth Soccer); tu liga puede ser distinta. Revisado el {longDateEs(FAMILY_CHECKED.sizes)}.</p>
   </Section>
   <Section id="method" title="Cómo se hace el plan" fold>
    <ul>
     <li>Cada periodo se corta en bloques iguales, uno por cada cambio. Un tiempo de 25 minutos con cambios cada 5 minutos tiene cinco bloques.</li>
     <li>Cada jugador recibe el mismo número de bloques. Cuando no se divide exacto, algunos reciben un bloque más, nunca dos.</li>
     <li>Con un solo portero todo el partido, nadie descansa dos bloques seguidos mientras haya lugares suficientes para evitarlo. Con un portero que cambia, el plan deja esas esperas dobles en las pocas que no puede cambiar.</li>
     <li>Un portero que rota se queda en el arco un periodo entero cuando esa es una parte justa, y un turno más corto en un plantel muy grande.</li>
     <li>Los mismos números siempre dan el mismo plan. Cambia el orden de los nombres para cambiar quién empieza.</li>
    </ul>
   </Section>
   <EmbedSnippet snippet={embedSnippetEs(p,e.h1)} name={e.h1.toLowerCase()} lang="es"/>
   <QA id="faq" title={`Preguntas sobre ${p.format?`los cambios en ${format}`:'los minutos de juego'}`} faq={e.faq.map(x=>({...x}))}/>
  <KeepReading lang="es" title="Reglas, tablas y más herramientas" groups={[{id:'related',links:related}]}/>
   <EsToolEnd/>
  </Screen>
 </>;
}

// ---- the field diagrams ----
const GROUPS=[{id:'fields',title:'Plantillas de cancha en blanco',kind:'template',line:'Una página para cada modalidad. Cada página tiene hojas verticales y horizontales: lisas, con tercios y con zonas.'},
 {id:'cheat-sheets',title:'Hojas de referencia de formaciones',kind:'cheat-sheet',line:'Todas las formas de una modalidad en una sola página, con los números de los jugadores en los puntos.'},
 {id:'positions',title:'Posiciones y números',kind:'positions',line:'Los números del 1 al 11 y la posición que representa cada uno.'}] as const;
function PrintablesHubEs(){
 const H=PRINT_HUB,crumbs=toolCrumbsEs({name:H.crumb,path:toEs(PRINTABLES_HUB_PATH)});
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd(collectionLd({name:H.h1,path:toEs(PRINTABLES_HUB_PATH),description:H.description,published:TOOLS_UPDATED,modified:TOOLS_UPDATED,items:PRINTABLES.map(p=>({name:printEs(p).h1,path:toEs(p.path)}))}))}/>
  <JsonLd data={faqLd(H.faq)}/>
  <RailNav rail={printablesHubRail(true)} current="#top"/>
  <EsToolIntro crumbs={crumbs} h1={H.h1} lead={H.lead}/>
  {GROUPS.map(g=><Section key={g.id} id={g.id} title={g.title}>
   <p>{g.line}</p>
   <ul className={t.thumbs}>{PRINTABLES.filter(p=>p.kind===g.kind).map(p=>{const e=printEs(p);return <li key={p.slug}><a href={toEs(p.path)} aria-label={e.h1}><SheetThumbEs file={p.files[0]} alt={fileEs(p,p.files[0]).sheet.title}/></a><b><a href={toEs(p.path)}>{e.crumb}</a></b><span className={site.caption}>{e.blurb}</span></li>;})}</ul>
  </Section>)}
  <Section id="terms" title="Gratis para imprimir y compartir"><LicenceEs/><p>Cada hoja está dibujada en negro sobre blanco para ahorrar tinta y lleva un pequeño crédito de futbolisland.app. Imprime todas las copias que necesite tu equipo, publícalas en la página de un club o repártelas en un curso de entrenadores.</p></Section>
  <QA id="faq" title="Preguntas sobre los diagramas de cancha" faq={H.faq}/>
  <Section id="related" title="Herramientas que usan las mismas canchas"><LinkList links={links([esLink(LINEUP_PATH,{line:'Pon los nombres de tus jugadores en una cancha e imprímela'}),esLink(PLANNER_PATH,{line:'Un plan de cambios justo con minutos iguales'}),
   esLink('/learn/soccer-formations',{name:'Formaciones de fútbol',line:'Cada formación explicada, con un diagrama'}),esLink('/learn/soccer-field-size-by-age')])}/></Section>
  <EsToolEnd/>
 </>;
}
function PrintableEsPage({p}:{p:Printable}){
 const e=printEs(p),crumbs=toolCrumbsEs({name:PRINT_HUB.crumb,path:toEs(PRINTABLES_HUB_PATH)},{name:e.crumb,path:toEs(p.path)}),main=p.files[0],mainEs=fileEs(p,main),rest=p.files.slice(1);
 const ld={...printableLd({...p,h1:e.h1,path:toEs(p.path),description:e.description,files:p.files.map(f=>{const x=fileEs(p,f);return {...f,label:x.label,note:x.note,sheet:()=>x.sheet};})}),learningResourceType:'Hoja imprimible'};
 const fmt=p.format,n=fmt&&fmt!=='futsal'?PLAYERS_PER_TEAM[fmt]-1:0;
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd(ld)}/>
  <PrintStyle/>
  <RailNav rail={printableRail({versions:rest.length>0,compare:p.kind==='cheat-sheet'&&!!fmt},true)} current="#top"/>
  <Screen><EsToolIntro crumbs={crumbs} h1={e.h1} lead={e.lead}/></Screen>
  <figure className={site.figure}>
   <div className={t.sheet}><SheetSvg id="main" sheet={mainEs.sheet}/></div>
   <figcaption className={`${site.caption} ${t.noPrint}`}>{mainEs.sheet.desc}</figcaption>
  </figure>
  <Screen>
   <Section id="download" title="Imprimir o descargar">
    <p>Para imprimir, usa el comando de imprimir de tu navegador en esta página: solo se imprime la hoja, en negro sobre blanco, en una página. O descárgala como imagen (PNG) o como dibujo que se ve nítido a cualquier tamaño (SVG). Por ahora, los archivos para descargar tienen las palabras en inglés.</p>
    <DownloadsEs file={main} label={mainEs.label}/>
    <LicenceEs/>
   </Section>
   {rest.length>0&&<Section id="versions" title="Todas las versiones de esta plantilla">
    <ul className={t.thumbs}>{p.files.map(f=>{const x=fileEs(p,f);return <li key={f.name}><SheetThumbEs file={f} alt={x.sheet.title}/><b>{x.label}</b><span className={site.caption}>{x.note}</span><DownloadsEs file={f} label={x.label}/></li>;})}</ul>
   </Section>}
   {p.kind==='cheat-sheet'&&fmt&&<Section id="compare" title="Las formaciones de esta hoja, comparadas">
    <p>{fmt==='futsal'?'Las formas de futsal cuentan a los cuatro jugadores de cancha delante del portero, de atrás hacia adelante: el primer número es el cierre o los jugadores de atrás, el último es el pívot o los jugadores de adelante.':`Un equipo de ${fmt} tiene ${n} jugadores de campo delante del portero, así que cada forma de ${fmt} suma ${n}. Léela desde atrás: el primer número son los defensas, el último los delanteros, y el resto el mediocampo.`}</p>
    <DataTable label={`Formaciones de ${fmt} comparadas`} head={['Formación','Atrás','En el medio','Adelante','Ideal para','Cuidado con']}
     rows={formationsIn(fmt).map(x=>{const f=esFormation(x.slug)!,s=x.shape.split('-').map(Number),mid=s.slice(1,-1).reduce((a,b)=>a+b,0);
      return [<a key={f.slug} href={f.esPath}>{f.shapeEs}</a>,String(s[0]),s.length>2?String(mid):'ninguno',String(s[s.length-1]),f.best,f.watch];})}/>
   </Section>}
   <Section id="use" title="Cómo la usan los entrenadores">{e.use.map(x=><p key={x}>{x}</p>)}</Section>
  <KeepReading lang="es" title="Ve más allá" groups={[{id:'related',links:links([...p.links.map(l=>esLink(l.path,{key:true})),esLink(PRINTABLES_HUB_PATH,{name:'Todos los diagramas de cancha para imprimir'})])}]}/>
   <EsToolEnd/>
  </Screen>
 </>;
}

// ---- Scan Trainer (Nov 16 2026; lib/i18n/es/scanTrainer.ts) ----
/** Spanish names for the English related links (every target has a Spanish page; tests/scan-trainer.cjs checks the paths match). */
const SCAN_RELATED_ES:readonly [string,string][]=[['Mira, y luego gira o devuelve (lección de 7v7)','Busca la presión antes de recibir y luego gira hacia el espacio o devuelve el balón'],
 ['Recibe: gira o conecta (lección de 9v9)','Revisa el espacio antes de recibir; girar y devolver resuelven presiones distintas'],['Sal de la sombra del pase (lección de 9v9)','El movimiento de apoyo que practica el ejercicio Pásala'],
 ['Mira el balón y al que corre (lección de 7v7)','Mirar alrededor cuando tu equipo no tiene el balón'],['Lecciones de pase y apoyo','Cada lección para encontrar y dar un pase libre'],
 ['Colores por encima del hombro (ejercicio de fútbol)','La misma idea con un compañero que levanta conos, sin teléfono'],['Cuadrado lleno: conducción con la cabeza arriba (ejercicio)','Conducción mirando arriba para los más pequeños'],
 ['Ejercicios de primer toque','Ejercicios para recibir en los que mirar antes de que llegue el balón sí cuenta'],['¿Qué es el primer toque en el fútbol?','Por qué la mirada va antes del toque'],
 ['Calculadora de minutos de juego de fútbol','Minutos justos para cada jugador el día del partido'],['Creador de alineaciones de fútbol','Pon a los titulares en un diagrama de cancha']];
function ScanEs(){
 const crumbs=toolCrumbsEs({name:SCAN_ES.crumb,path:toEs(SCAN_PATH)});
 const related=SCAN_RELATED_EN.map((l,i)=>({path:toEs(l.path),name:SCAN_RELATED_ES[i][0],line:SCAN_RELATED_ES[i][1]}));
 return <ScanTrainerPage p={SCAN_ES} path={toEs(SCAN_PATH)} crumbs={crumbs} lang="es" related={related}
  intro={<header className={site.intro} id="top"><EsBreadcrumbs crumbs={crumbs}/><h1 className={site.title}>{SCAN_ES.h1}</h1><p className={site.lead} data-answer="">{SCAN_ES.lead}</p>
   <AppLink href="/scan?lang=es" label={SCAN_ES.openLabel} line={SCAN_ES.openLine}/><p className={site.caption}>{TOOL_NAMES_ES}</p></header>}
  end={<EsToolEnd/>} figure={(id,sc)=><EsGridFigure id={id} scene={sc} small/>}/>;
}

// ---- the route table ----
const H1_IMAGE_ALT='Un diagrama de formación de fútbol 9v9';
export function toolsEsRoute(enPath:string):EsRoute|null{
 if(enPath===TOOLS_HUB.path)return {meta:()=>esMeta(HUB.title,HUB.description,enPath,{url:image(enPath),alt:H1_IMAGE_ALT}),render:()=><ToolsHubEs/>};
 const l=LINEUP_PAGES.find(x=>x.path===enPath);if(l){const e=lineupEs(l);return {meta:()=>esMeta(e.title,e.description,enPath,{url:image(enPath),alt:`Un diagrama de formación del ${e.h1.toLowerCase()}`}),render:()=><LineupEs p={l}/>};}
 const r=PLANNER_PAGES.find(x=>x.path===enPath);if(r){const e=plannerEs(r);return {meta:()=>esMeta(e.title,e.description,enPath,{url:image(enPath),alt:'Un diagrama de formación de fútbol'}),render:()=><PlannerEs p={r}/>};}
 if(enPath===SCAN_PATH)return {meta:()=>esMeta(SCAN_ES.title,SCAN_ES.description,enPath,{url:SCAN_IMAGE,alt:'El entrenador de escaneo en dos teléfonos: una señal de color azul y un pase al compañero 3 a la derecha'}),render:()=><ScanEs/>};
 if(enPath===PRINTABLES_HUB.path)return {meta:()=>esMeta(PRINT_HUB.title,PRINT_HUB.description,enPath,{url:image(enPath),alt:'Un diagrama de cancha de fútbol 11v11 en blanco'}),render:()=><PrintablesHubEs/>};
 const s=PRINTABLES.find(x=>x.path===enPath);if(s){const e=printEs(s);
  return {meta:()=>{const sh=fileEs(s,s.files[0]).sheet,url=printableImage(s),m=esMeta(e.title,e.description,enPath,{url,alt:sh.title});return {...m,openGraph:{...m.openGraph,images:[{url,width:sh.w*1.5,height:sh.h*1.5,alt:sh.title}]}};},render:()=><PrintableEsPage p={s}/>};}
 return null;
}

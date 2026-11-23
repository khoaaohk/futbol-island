import {DRILLS,DRILLS_HUB,drillBySlug,type Drill,type DrillLink} from '@/lib/site/drills';
import {GUIDE_DRILLS} from '@/lib/site/drillLinks';
import {DRILL_GUIDES,drillGuideBySlug,type DrillGuide} from '@/lib/site/drillGuides';
import {PLANS,PLANS_HUB,planBySlug,type Plan} from '@/lib/site/plans';
import {gridSize,type GridScene} from '@/lib/site/grid';
import {DRILL_AGE_NOTES} from '@/lib/site/notesDrills';
import {DRILLS_ES,DRILLS_HUB_ES,LINK_LINES_ES,PLANS_HUB_ES,SKILLS_ES,agesTextEs} from './drills';
import {DRILL_GUIDES_ES} from './drillGuides';
import {PLANS_ES} from './plans';
import {hasEs,toEs} from '../esPaths';
/**
 * Spanish drills, drill guides and practice plans merged over the English records (Spanish round C, Nov 16 2026): the English
 * record gives the structure (grid coordinates, ages, lessons, links, clock), the Spanish record every word. A missing record or
 * an array of the wrong length throws, so a half-translated page never renders (tests/es-pages.cjs renders them all).
 */
const need=<T,>(rec:Readonly<Record<string,T>>,slug:string,what:string):T=>{const x=rec[slug];if(!x)throw new Error(`Spanish ${what} "${slug}" is missing (lib/i18n/es)`);return x;};
const same=(w:string,a:readonly unknown[],b:readonly unknown[])=>{if(a.length!==b.length)throw new Error(`Spanish ${w}: ${b.length}, English has ${a.length}`);};
/** Diagram dot letters: the goalkeeper's GK becomes POR (glossary); the other letters (A, B, C, D, S...) stay. */
const DOT:Readonly<Record<string,string>>={GK:'POR'};
const sceneEs=(s:GridScene,e:{title:string;caption:string}):GridScene=>({...s,title:e.title,caption:e.caption,dots:s.dots.map(d=>({...d,n:DOT[d.n]??d.n}))});
/** lib/site/grid.ts gridDesc in Spanish (the SVG <desc>). */
export function gridDescEs(g:GridScene):string{
 const key=[g.cones.length?'los triángulos pequeños son conos':'',g.goals.length?'las barras blancas son arcos':'',g.passes.length?'las flechas continuas son pases':'',g.runs.length?'las flechas discontinuas son carreras sin balón':'',g.dribbles.length?'las flechas doradas onduladas son conducciones':''].filter(Boolean);
 return `Diagrama del montaje de un área de ${g.w} yardas de ancho y ${g.l} yardas de largo, vista desde arriba, con un cono en cada esquina. Los puntos dorados son atacantes o jugadores con balón y los verde oscuro son defensas${key.length?`; ${key.join(', ')}`:''}. ${g.caption}`;
}
/** lib/site/grid.ts gridKey in Spanish (the short key under a diagram). */
export function gridKeyEs(g:GridScene):string{
 const k=['Dorado: atacantes.'];if(g.dots.some(d=>d.opp))k.push('Verde oscuro: defensas.');if(g.cones.length)k.push('Triángulos: conos.');if(g.goals.length)k.push('Barras blancas: arcos.');
 if(g.passes.length)k.push('Flecha continua: pase.');if(g.runs.length)k.push('Flecha discontinua: carrera.');if(g.dribbles.length)k.push('Flecha ondulada: conducción.');
 return k.join(' ');
}
export const gridSizeEs=(g:{w:number;l:number})=>gridSize(g);
const lineOf=(answer:string)=>(answer.match(/[^.!?]+[.!?]+(?=\s|$)/g)||[answer])[1]?.trim()??answer;

export type EsDrill=Drill&{esPath:string;ageNotes:[string,string][];skillName:string;skillLine:string};
export function esDrill(slug:string):EsDrill|null{
 const d=drillBySlug(slug);if(!d)return null;const e=need(DRILLS_ES,slug,'drill'),notes=DRILL_AGE_NOTES[slug]!;
 same(`drill ${slug} steps`,d.steps,e.steps);same(`drill ${slug} cues`,d.cues,e.cues);same(`drill ${slug} mistakes`,d.mistakes,e.mistakes);same(`drill ${slug} faq`,d.faq,e.faq);same(`drill ${slug} age notes`,notes,e.ages);
 const scene=sceneEs(d.scene,e.scene),sk=SKILLS_ES[d.skill];
 return {...d,name:e.name,h1:e.h1??`${e.name}: ejercicio de fútbol`,title:e.title,desc:e.desc,answer:e.answer,players:e.players,equipment:e.equipment,time:e.time,spaceNote:e.spaceNote,
  scene,space:gridSize(scene)+(e.spaceNote?`. ${e.spaceNote}`:''),agesText:agesTextEs(d.ages),steps:[...e.steps],cues:[...e.cues],easier:e.easier,harder:e.harder,mistakes:[...e.mistakes],
  game:e.game,home:e.home,faq:e.faq.map(f=>({...f})),esPath:toEs(d.path),ageNotes:notes.map((n,i)=>[n[0],e.ages[i]]),skillName:sk.name,skillLine:sk.line};
}
export const ES_DRILLS=():EsDrill[]=>DRILLS.map(d=>esDrill(d.slug)!);
/** The one-line summary of a drill in lists (the second sentence of its answer, as lib/site/drills.ts drillLine). */
export const drillLineEs=(d:{answer:string})=>lineOf(d.answer);

export type EsDrillGuide=Omit<DrillGuide,'picks'>&{esPath:string;picks:{drill:EsDrill;line:string}[]};
export function esDrillGuide(slug:string):EsDrillGuide|null{
 const g=drillGuideBySlug(slug);if(!g)return null;const e=need(DRILL_GUIDES_ES,slug,'drill guide');
 same(`guide ${slug} picks`,g.picks,e.picks);same(`guide ${slug} before`,g.before,e.before);same(`guide ${slug} after`,g.after,e.after);same(`guide ${slug} faq`,g.faq,e.faq);
 const sec=(en:DrillGuide['before'],es:typeof e.before)=>en.map((s,i)=>{same(`guide ${slug} ${s.id}`,s.items,es[i].items);return {...s,title:es[i].title,items:[...es[i].items]};});
 if(!!g.facts!==!!e.facts)throw new Error(`Spanish guide ${slug}: facts`);
 return {...g,name:e.name,title:e.title,h1:e.h1,desc:e.desc,blurb:e.blurb,lead:e.lead,more:e.more,
  facts:g.facts&&e.facts?{label:e.facts.label,note:e.facts.note,rows:e.facts.rows.map(r=>[r[0],r[1]] as [string,string])}:undefined,
  before:sec(g.before,e.before),picksTitle:e.picksTitle,picks:g.picks.map((p,i)=>({drill:esDrill(p.drill.slug)!,line:e.picks[i]})),after:sec(g.after,e.after),faq:e.faq.map(f=>({...f})),esPath:toEs(g.path)};
}
export const ES_DRILL_GUIDES=():EsDrillGuide[]=>DRILL_GUIDES.map(g=>esDrillGuide(g.slug)!);

const lower=(s:string)=>s[0].toLowerCase()+s.slice(1);
export type EsPlan=Omit<Plan,'drills'>&{esPath:string;drills:EsDrill[]};
export function esPlan(slug:string):EsPlan|null{
 const p=planBySlug(slug);if(!p)return null;const e=need(PLANS_ES,slug,'plan');
 same(`plan ${slug} rows`,p.rows,e.rows);same(`plan ${slug} equipment`,p.equipment,e.equipment);same(`plan ${slug} notes`,p.notes,e.notes);same(`plan ${slug} faq`,p.faq,e.faq);
 return {...p,theme:e.theme,name:`${p.age}: ${lower(e.theme)}`,h1:p.slug.endsWith('-first-practice')?`Plan de entrenamiento de fútbol ${p.age}: ${lower(e.theme)}`:`${e.theme} en el fútbol ${p.age}: plan de entrenamiento`/* Nov 23 2026: a theme plan no longer shares the first practice's head */,title:e.title,desc:e.desc,lead:e.lead,goal:e.goal,players:e.players,
  rows:p.rows.map((r,i)=>({...r,activity:e.rows[i][0],purpose:e.rows[i][1]})),equipment:[...e.equipment],notes:[...e.notes],swap:{...e.swap},faq:e.faq.map(f=>({...f})),
  drills:p.drills.map(d=>esDrill(d.slug)!),esPath:toEs(p.path)};
}
export const ES_PLANS=():EsPlan[]=>PLANS.map(p=>esPlan(p.slug)!);
export const esPlansForAge=(a:string)=>ES_PLANS().filter(p=>p.age===a);

export const ES_DRILL_HUBS={
 drills:{...DRILLS_HUB_ES(DRILLS.length),path:toEs(DRILLS_HUB.path),enPath:DRILLS_HUB.path},
 plans:{...PLANS_HUB_ES(PLANS.length),path:toEs(PLANS_HUB.path),enPath:PLANS_HUB.path},
};
/** "Lee después" orders: the drills hub, the age and skill guides, then the drills; the plans hub, then the plans. */
export const esDrillOrder=()=>[{path:ES_DRILL_HUBS.drills.path,name:ES_DRILL_HUBS.drills.h1},...ES_DRILL_GUIDES().map(g=>({path:g.esPath,name:g.h1})),...ES_DRILLS().map(d=>({path:d.esPath,name:d.name}))];
export const esPlanOrder=()=>[{path:ES_DRILL_HUBS.plans.path,name:ES_DRILL_HUBS.plans.h1},...ES_PLANS().map(p=>({path:p.esPath,name:p.h1}))];

/** A link from a Spanish drill, guide or plan page: the Spanish page with its Spanish name, or null when it has none yet. */
export function esDrillLink(l:DrillLink):{path:string;name:string;line?:string}|null{
 if(!hasEs(l.path))return null;
 const known=LINK_LINES_ES[l.path];if(known)return {path:toEs(l.path),name:known.name,line:known.line};
 const d=DRILLS.find(x=>x.path===l.path);if(d){const e=esDrill(d.slug)!;return {path:e.esPath,name:`${e.name} (ejercicio)`,line:drillLineEs(e)};}
 const p=PLANS.find(x=>x.path===l.path);if(p){const e=esPlan(p.slug)!;return {path:e.esPath,name:e.h1,line:`${e.minutes} minutos: ${lower(e.goal)}`};}
 return null;
}
export const esDrillLinks=(xs:readonly DrillLink[])=>xs.map(esDrillLink).filter((x):x is NonNullable<typeof x>=>!!x);
/** "Ejercicios para practicarlo" on the Spanish rule, term and position pages (lib/site/drillLinks.ts GUIDE_DRILLS). */
export const esDrillLinksFor=(enGuidePath:string)=>(GUIDE_DRILLS[enGuidePath]??[]).map(s=>{const d=esDrill(s)!;return {path:d.esPath,name:`${d.name} (ejercicio)`,line:drillLineEs(d)};});

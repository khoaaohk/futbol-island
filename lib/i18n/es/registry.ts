import {RULES,RULES_HUB,ruleBySlug,type Rule} from '@/lib/site/rules';
import {TERM_PAGES,TERMS_HUB,termBySlug,type TermPage} from '@/lib/site/terms';
import {POSITIONS,POSITIONS_HUB,positionBySlug,type Position} from '@/lib/site/positions';
import {FORMATIONS,FORMATIONS_HUB,FORMAT_GUIDES,formationBySlug,type Formation} from '@/lib/site/formations';
import {COMPARISONS,comparisonBySlug,type Comparison} from '@/lib/site/comparisons';
import type {Scene} from '@/lib/site/scenes';
import type {Line} from '@/lib/site/pitch';
import {RULES_ES,RULES_HUB_ES} from './rules';
import {TERMS_ES,TERMS_HUB_ES} from './terms';
import {POSITIONS_ES,POSITIONS_HUB_ES} from './positions';
import {FORMATIONS_ES,FORMAT_GUIDES_ES,FORMATIONS_HUB_ES,shapeEs} from './formations';
import {COMPARISONS_ES} from './comparisons';
import type {CoachNotesEs,SceneEs} from './types';
import {toEs} from '../esPaths';
/**
 * Spanish records merged over the English ones (Spanish round 1). The English record gives the structure (diagram coordinates,
 * lessons, links, dates); the Spanish record gives every word. A missing Spanish record throws at build/render time and
 * tests/es-pages.cjs fails first, so a half-translated page never ships.
 */
const need=<T,>(rec:Readonly<Record<string,T>>,slug:string,what:string):T=>{const x=rec[slug];if(!x)throw new Error(`Spanish ${what} "${slug}" is missing (lib/i18n/es)`);return x;};
const mergeScene=(s:Scene,e:SceneEs):Scene=>({...s,title:e.title,caption:e.caption,...(s.lineWord?{lineWord:e.lineWord??s.lineWord}:{})});
export type EsRule=Rule&{esPath:string;notes:CoachNotesEs};
export type EsTerm=TermPage&{esPath:string;notes:CoachNotesEs};
export type EsPosition=Position&{esPath:string;notes:CoachNotesEs};
export function esRule(slug:string):EsRule|null{
 const r=ruleBySlug(slug);if(!r)return null;const e=need(RULES_ES,slug,'rule');
 if(e.scenes.length!==r.scenes.length)throw new Error(`Spanish rule ${slug}: ${e.scenes.length} scenes, English has ${r.scenes.length}`);
 return {...r,name:e.name,title:e.title,h1:e.h1,desc:e.desc,answer:e.answer,law:e.law,scenes:r.scenes.map((s,i)=>mergeScene(s,e.scenes[i])),
  refs:[...e.refs],mixups:e.mixups.map(m=>({...m})),formats:e.formats.map(f=>[f[0],f[1]] as [string,string]),faq:e.faq.map(f=>({...f})),esPath:toEs(r.path),notes:e.notes};
}
export function esTerm(slug:string):EsTerm|null{
 const t=termBySlug(slug);if(!t)return null;const e=need(TERMS_ES,slug,'term');
 return {...t,name:e.name,also:e.also,title:e.title,h1:e.h1,desc:e.desc,short:e.short,answer:e.answer,scene:mergeScene(t.scene,e.scene),howTitle:e.howTitle,
  how:[...e.how],mistakes:[...e.mistakes],formats:e.formats,faq:e.faq.map(f=>({...f})),esPath:toEs(t.path),notes:e.notes};
}
export function esPosition(slug:string):EsPosition|null{
 const p=positionBySlug(slug);if(!p)return null;const e=need(POSITIONS_ES,slug,'position');
 return {...p,numbers:p.numbers.replace(/ and /g,' y ').replace(/ or /g,' o '),name:e.name,short:e.short,numberLine:e.numberLine,title:e.title,h1:e.h1,desc:e.desc,answer:e.answer,job:e.job,suits:e.suits,where:e.where,
  withBall:[...e.withBall],withoutBall:[...e.withoutBall],habits:e.habits.map(h=>({...h})),small:e.small,faq:e.faq.map(f=>({...f})),esPath:toEs(p.path),notes:e.notes};
}
export type EsFormation=Formation&{esPath:string;notes:CoachNotesEs;shapeEs:string};
const same=(slug:string,what:string,a:readonly unknown[],b:readonly unknown[])=>{if(a.length!==b.length)throw new Error(`Spanish formation ${slug}: ${what} ${b.length}, English has ${a.length}`);};
export function esFormation(slug:string):EsFormation|null{
 const f=formationBySlug(slug);if(!f)return null;const e=need(FORMATIONS_ES,slug,'formation');
 same(slug,'roles',f.roles,e.roles);same(slug,'strengths',f.strengths,e.strengths);same(slug,'weak',f.weak,e.weak);
 const sh=shapeEs(f.shape,slug),fs=f.format==='futsal';
 return {...f,shapeEs:sh,name:fs?`${sh} (futsal)`:`${sh} (${f.format})`,title:fs?`Formación ${sh} de futsal: roles y diagrama`:`Formación ${sh} en fútbol ${f.format}: roles y diagrama`,
  h1:fs?`Formación ${sh} de futsal`:`Formación ${sh} de fútbol (${f.format})`,best:e.best,watch:e.watch,desc:e.desc,answer:e.answer,
  roles:f.roles.map((r,i)=>({...r,title:e.roles[i].title,job:e.roles[i].job})),strengths:[...e.strengths],weak:f.weak.map((w,i)=>({...w,spot:e.weak[i].spot,cover:e.weak[i].cover})),
  attack:e.attack,defend:e.defend,suits:e.suits,faq:e.faq.map(q=>({...q})),esPath:toEs(f.path),notes:e.notes};
}
export const ES_FORMATIONS=():EsFormation[]=>FORMATIONS.map(f=>esFormation(f.slug)!);
export const esFormationsIn=(format:string)=>ES_FORMATIONS().filter(f=>f.format===format);
export const esFormatGuide=(format:'7v7'|'9v9'|'11v11')=>{const g=FORMAT_GUIDES.find(x=>x.format===format)!;return {...g,...FORMAT_GUIDES_ES[format],esPath:toEs(g.path)};};
export type EsComparison=Comparison&{esPath:string};
export function esComparison(slug:string):EsComparison|null{const c=comparisonBySlug(slug);if(!c)return null;const e=need(COMPARISONS_ES,slug,'comparison');
 return {...c,title:e.title,h1:e.h1,desc:e.desc,answer:e.answer,fit:[...e.fit],switching:[...e.switching],esPath:toEs(c.path)};}
export const ES_COMPARISONS=():EsComparison[]=>COMPARISONS.map(c=>esComparison(c.slug)!);
export const ES_RULES=():EsRule[]=>RULES.map(r=>esRule(r.slug)!);
export const ES_TERMS=():EsTerm[]=>TERM_PAGES.map(t=>esTerm(t.slug)!);
export const ES_POSITIONS=():EsPosition[]=>POSITIONS.map(p=>esPosition(p.slug)!);
export const ES_HUBS={
 rules:{...RULES_HUB_ES,path:toEs(RULES_HUB.path),enPath:RULES_HUB.path},
 terms:{...TERMS_HUB_ES,path:toEs(TERMS_HUB.path),enPath:TERMS_HUB.path},
 positions:{...POSITIONS_HUB_ES,path:toEs(POSITIONS_HUB.path),enPath:POSITIONS_HUB.path},
 formations:{...FORMATIONS_HUB_ES(FORMATIONS.length),path:toEs(FORMATIONS_HUB.path),enPath:FORMATIONS_HUB.path},
};
/** Reading order per family (hub, then the pages in the English order): "Lee después". */
export const esOrder=(family:'rules'|'terms'|'positions')=>family==='rules'?[{path:ES_HUBS.rules.path,name:ES_HUBS.rules.h1},...ES_RULES().map(r=>({path:r.esPath,name:r.h1}))]
 :family==='terms'?[{path:ES_HUBS.terms.path,name:ES_HUBS.terms.h1},...ES_TERMS().map(t=>({path:t.esPath,name:t.h1}))]
 :[{path:ES_HUBS.positions.path,name:ES_HUBS.positions.h1},...ES_POSITIONS().map(p=>({path:p.esPath,name:p.name}))];
/** Diagram labels on position/formation pitches: the Spanish team-sheet letters and line names (glossary). */
const SPOT:Readonly<Record<string,string>>={GK:'POR',RB:'LD',LB:'LI',CB:'DFC',LCB:'DFC',RCB:'DFC',ST:'DC',LS:'DC',RS:'DC',RM:'MD',LM:'MI',CM:'MC',LCM:'MC',RCM:'MC',
 DM:'MCD',LDM:'MCD',RDM:'MCD',CDM:'MCD',AM:'MCO',LAM:'MCO',RAM:'MCO',CAM:'MCO',RW:'ED',LW:'EI',RWB:'CD',LWB:'CI',ALA:'ALA',FIXO:'CIERRE',PIVOT:'PÍVOT',BACK:'ATRÁS',FRONT:'ARRIBA'};
const LINE:Readonly<Record<string,string>>={'Goalkeeper':'Portero','Defenders':'Defensas','Midfielders':'Mediocampistas','Striker':'Delantero','Forwards':'Delanteros',
 'Strikers':'Delanteros','Attacking midfielders':'Mediocampistas ofensivos','Forward':'Delantero','Midfielder':'Mediocampista','Holding midfielder':'Mediocampista de contención',
 'Holding midfielders':'Mediocampistas de contención','Center backs':'Defensas centrales','Back three':'Línea de tres','Pivot':'Pívot','Fixo':'Cierre','Alas':'Alas',
 'Rear pair':'Pareja de atrás','Front pair':'Pareja de adelante','':''};
export const esLines=(lines:readonly Line[]):Line[]=>lines.map(l=>({name:LINE[l.name]??l.name,spots:l.spots.map(s=>{const lab=SPOT[s.label]??s.label;return {...s,label:lab,n:s.n===s.label?lab:s.n};})}));
const list=(xs:string[])=>xs.length>1?`${xs.slice(0,-1).join(', ')} y ${xs[xs.length-1]}`:xs[0]??'';
/** Spanish lib/site/pitch.ts describe() for the base shape (position pages). */
export function describeEs(o:{format:string;what:string;lines:readonly Line[];highlight?:string;mode?:'base'|'attack'|'defend'}):string{
 const field=o.format==='futsal'?'una cancha de futsal':`una cancha de fútbol ${o.format}`;
 const rows=o.lines.map(l=>`${l.name}: ${list(l.spots.map(s=>s.n===s.label?s.label:`${s.label} (${s.n})`))}`).join('. ');
 const n=o.lines.reduce((a,l)=>a+l.spots.length,0);
 return `Diagrama de ${o.what} en ${field}, visto desde arriba, con ${n} jugadores que atacan hacia arriba. ${rows}.${o.highlight?` La posición de ${o.highlight} está marcada en dorado.`:''}${o.mode==='attack'?' Las flechas muestran al equipo subiendo por la cancha y abriéndose.':o.mode==='defend'?' Las flechas muestran al equipo bajando y juntándose en el medio.':''}`;
}

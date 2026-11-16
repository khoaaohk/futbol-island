import type {Metadata} from 'next';
import {diagramUrl,formationImage,positionImage} from '@/lib/site/guides';
import {ES_HUBS,esComparison,esFormatGuide,esFormation,esPosition,esRule,esTerm} from '@/lib/i18n/es/registry';
import {guideByPath} from '@/lib/site/guides';
import {CompareEsPage,FormatGuideEsPage,FormationEsPage,FormationsHubEsPage} from './pages/FormationsEs';
import {esMeta} from '@/lib/i18n/es/seo';
import {hasEs} from '@/lib/i18n/esPaths';
import HomeEs,{meta as HOME} from './pages/HomeEs';
import AboutEs,{meta as ABOUT} from './pages/AboutEs';
import FactsEs,{meta as FACTS} from './pages/FactsEs';
import {PositionEsPage,PositionsHubEsPage,RuleEsPage,RulesHubEsPage,TermEsPage,TermsHubEsPage} from './pages/GuidesEs';
/**
 * The Spanish route table: English path -> metadata + page. Only paths in lib/i18n/esPaths.ts ES_PAGES resolve, so the language
 * switch, hreflang, the sitemap and this table always agree (tests/es-pages.cjs renders each one).
 */
export type EsRoute={meta:()=>Metadata;render:()=>JSX.Element};
const R='/learn/soccer-rules/',T='/learn/soccer-terms/',P='/learn/soccer-positions/',F='/learn/soccer-formations/';
const COMPARE:Readonly<Record<string,string>>={'/learn/soccer-positions/fullback-vs-wingback':'fullback-vs-wingback','/learn/soccer-positions/striker-vs-winger':'striker-vs-winger','/learn/soccer-formations/4-3-3-vs-4-4-2':'4-3-3-vs-4-4-2'};
const GUIDES:Readonly<Record<string,'7v7'|'9v9'|'11v11'>>={'/learn/7v7-soccer-formations':'7v7','/learn/9v9-soccer-formations':'9v9','/learn/11v11-soccer-formations':'11v11'};
export function esRoute(enPath:string):EsRoute|null{
 if(!hasEs(enPath))return null;
 if(enPath==='/')return {meta:()=>esMeta(HOME.title,HOME.desc,'/'),render:()=><HomeEs/>};
 if(enPath==='/about')return {meta:()=>esMeta(ABOUT.title,ABOUT.desc,enPath),render:()=><AboutEs/>};
 if(enPath==='/about/how-we-check-facts')return {meta:()=>esMeta(FACTS.title,FACTS.desc,enPath),render:()=><FactsEs/>};
 const H=ES_HUBS;
 const cmp=COMPARE[enPath];if(cmp){const c=esComparison(cmp)!;return {meta:()=>esMeta(c.title,c.desc,enPath,{url:c.images[0],alt:c.h1.replace(/:.*$/,'')}),render:()=><CompareEsPage c={c}/>};}
 if(enPath===H.formations.enPath)return {meta:()=>esMeta(H.formations.title,H.formations.description,enPath,{url:formationImage('11v11-4-3-3'),alt:'Diagrama de la formación 4-3-3'}),render:()=><FormationsHubEsPage/>};
 const fg=GUIDES[enPath];if(fg){const g=esFormatGuide(fg);return {meta:()=>esMeta(g.title,g.description,enPath,{url:guideByPath(enPath)!.image!,alt:`Diagrama de una formación de fútbol ${fg}`}),render:()=><FormatGuideEsPage format={fg}/>};}
 if(enPath.startsWith(F)){const f=esFormation(enPath.slice(F.length));if(!f)return null;
  return {meta:()=>esMeta(f.title,f.desc,enPath,{url:formationImage(f.slug),alt:`Diagrama de la formación ${f.name}`}),render:()=><FormationEsPage f={f}/>};}
 if(enPath===H.rules.enPath)return {meta:()=>esMeta(H.rules.title,H.rules.description,enPath,{url:diagramUrl('offside-rule.png'),alt:'Diagrama de la regla del fuera de juego'}),render:()=><RulesHubEsPage/>};
 if(enPath===H.terms.enPath)return {meta:()=>esMeta(H.terms.title,H.terms.description,enPath,{url:diagramUrl('give-and-go-term.png'),alt:'Diagrama de una pared en el fútbol'}),render:()=><TermsHubEsPage/>};
 if(enPath===H.positions.enPath)return {meta:()=>esMeta(H.positions.title,H.positions.description,enPath,{url:formationImage('11v11-4-3-3'),alt:'Diagrama de las once posiciones en un 4-3-3'}),render:()=><PositionsHubEsPage/>};
 if(enPath.startsWith(R)){const r=esRule(enPath.slice(R.length));if(!r)return null;
  return {meta:()=>esMeta(r.title,r.desc,enPath,{url:diagramUrl(r.picture),alt:`Diagrama: ${r.name.toLowerCase()} en el fútbol`}),render:()=><RuleEsPage r={r}/>};}
 if(enPath.startsWith(T)){const t=esTerm(enPath.slice(T.length));if(!t)return null;
  return {meta:()=>esMeta(t.title,t.desc,enPath,{url:diagramUrl(t.picture),alt:`Diagrama: ${t.name.toLowerCase()} en el fútbol`}),render:()=><TermEsPage t={t}/>};}
 if(enPath.startsWith(P)){const p=esPosition(enPath.slice(P.length));if(!p)return null;
  return {meta:()=>esMeta(p.title,p.desc,enPath,{url:positionImage(p.slug),alt:`Diagrama de dónde juega: ${p.name.toLowerCase()}`}),render:()=><PositionEsPage p={p}/>};}
 return null;
}

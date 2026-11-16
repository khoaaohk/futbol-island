import type {Metadata} from 'next';
import {diagramUrl,formationImage,positionImage} from '@/lib/site/guides';
import {ES_HUBS,esPosition,esRule,esTerm} from '@/lib/i18n/es/registry';
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
const R='/learn/soccer-rules/',T='/learn/soccer-terms/',P='/learn/soccer-positions/';
export function esRoute(enPath:string):EsRoute|null{
 if(!hasEs(enPath))return null;
 if(enPath==='/')return {meta:()=>esMeta(HOME.title,HOME.desc,'/'),render:()=><HomeEs/>};
 if(enPath==='/about')return {meta:()=>esMeta(ABOUT.title,ABOUT.desc,enPath),render:()=><AboutEs/>};
 if(enPath==='/about/how-we-check-facts')return {meta:()=>esMeta(FACTS.title,FACTS.desc,enPath),render:()=><FactsEs/>};
 const H=ES_HUBS;
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

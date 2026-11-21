import {FactIcon,type FactIconKind} from './FactIcons';
import {lessonPath,type SiteLesson} from '../../lib/site/lessons';
import k from './keep.module.css';
import rt from './railTarget.module.css';
/**
 * "Keep reading" (visual pass batch 3, Nov 17 2026; audit shared fix 2): the end of a guide, hub, card, fish or tool page used to
 * stack 4-6 link lists (lessons, drills, related terms, formations, cards, more to learn). Now it is ONE section: one h2, one grid
 * of small link cards, each with its group's energy-bar icon (./FactIcons.tsx), a short group word, the title and one line.
 * `show` cards are visible, shared out round-robin so every group gets a place; the rest wait under one "Show N more"
 * <details> and are still in the HTML (internal links matter for search: every link the page had is kept, in the same order).
 * The first card of each group carries the old section id (#lessons, #drills, #related), so old jump links still land.
 * Server-rendered, no script.
 */
export type ReadLink={path:string;name:string;line?:string;tag?:string};
/** `icon` / `label` left out: each card takes them from its own path (kindOf), for "related" groups that mix pages. */
export type ReadGroup={id:string;label?:string;icon?:FactIconKind;links:readonly ReadLink[]};
type Kind={icon:FactIconKind;en:string;es:string};
const KINDS:readonly [RegExp,Kind][]=[
 [/^\/learn\/lessons\/./,{icon:'steps',en:'Lesson',es:'Lección'}],
 [/^\/learn\/soccer-rules/,{icon:'law',en:'Rule',es:'Regla'}],
 [/^\/learn\/soccer-terms/,{icon:'tag',en:'Soccer term',es:'Término'}],
 [/^\/learn\/soccer-positions/,{icon:'shirt',en:'Position',es:'Posición'}],
 [/^\/learn\/(soccer-formations|\d+v\d+-soccer-formations)/,{icon:'lineup',en:'Formation',es:'Formación'}],
 [/^\/learn\/soccer-drills/,{icon:'cone',en:'Drill',es:'Ejercicio'}],
 [/^\/learn\/soccer-practice-plans/,{icon:'clock',en:'Practice plan',es:'Plan'}],
 [/^\/learn\/(soccer-field-size|soccer-ball-size|soccer-age-groups)/,{icon:'diagram',en:'Size chart',es:'Tabla'}],
 [/^\/tools\/soccer-field-diagrams/,{icon:'blank',en:'Printable',es:'Para imprimir'}],
 [/^\/(tools|coach)/,{icon:'whistle',en:'Coach tool',es:'Herramienta'}],
 [/^\/cards/,{icon:'shirt',en:'Player cards',es:'Cartas'}],
 [/^\/fish/,{icon:'fish',en:'Fishbook',es:'Peces'}],
 [/^\/exhibits/,{icon:'book',en:'Museum',es:'Museo'}],
 [/^\/games/,{icon:'ball',en:'Game',es:'Juego'}],
 [/^\/(safe-football|about)/,{icon:'lock',en:'For parents',es:'Para padres'}],
 [/^\/learn\//,{icon:'steps',en:'Lessons',es:'Lecciones'}],
];
export function kindOf(path:string):Kind{
 const p=path.replace(/^\/es(?=\/|$)/,'').split('#')[0]||'/';
 return KINDS.find(([re])=>re.test(p))?.[1]??{icon:'book',en:'Guide',es:'Guía'};
}
const WORDS={en:{title:'Keep reading',more:(n:number)=>`Show ${n} more`},es:{title:'Sigue leyendo',more:(n:number)=>`Ver ${n} más`}};

/** Visible slots per group: one each in turn until `show` is used up or every group is empty. */
export function shareOut(sizes:readonly number[],show:number):number[]{
 const q=sizes.map(()=>0);let left=show,moved=true;
 while(left>0&&moved){moved=false;for(let i=0;i<sizes.length&&left>0;i++)if(q[i]<sizes[i]){q[i]++;left--;moved=true;}}
 return q;
}
function Card({g,l,id,lang}:{g:ReadGroup;l:ReadLink;id?:string;lang:'en'|'es'}){
 const auto=g.icon&&g.label?null:kindOf(l.path);
 return <li className={k.item} id={id}><a href={l.path}>
  <span className={k.ico}><FactIcon kind={g.icon??auto!.icon} size={22}/></span>
  <span className={k.name}>{l.name}</span>
  {/* the group word is drawn by CSS (attr): a visual hint like the icon, not page text (word counts, snippets) */}
  <span className={k.tag} data-tag={l.tag??g.label??auto![lang]} aria-hidden="true"/>
  {l.line&&<span className={k.line}>{l.line}</span>}
 </a></li>;
}
export default function KeepReading({groups,title,id='keep-reading',show=8,lang='en'}:{groups:readonly ReadGroup[];title?:string;id?:string;show?:number;lang?:'en'|'es'}){
 const W=WORDS[lang],gs=groups.filter(g=>g.links.length>0);if(!gs.length)return null;
 const q=shareOut(gs.map(g=>g.links.length),show);
 const seen=new Set<string>(),anchor=(g:ReadGroup)=>seen.has(g.id)?undefined:(seen.add(g.id),g.id);
 const first=gs.flatMap((g,i)=>g.links.slice(0,q[i]).map(l=>({g,l}))),rest=gs.flatMap((g,i)=>g.links.slice(q[i]).map(l=>({g,l})));
 const cards=(xs:typeof first)=>xs.map(({g,l},j)=><Card key={`${g.id}-${l.path}-${j}`} g={g} l={l} id={anchor(g)} lang={lang}/>);
 return <section className={k.keep} aria-labelledby={id} data-keep-reading={first.length+rest.length}>
  <h2 className={`${k.h2} ${rt.target}`} id={id}>{title??W.title}</h2>
  <ul className={k.grid}>{cards(first)}</ul>
  {rest.length>0&&<details className={k.more}><summary className={k.moreSum}><span>{W.more(rest.length)}</span><span className={k.plus} aria-hidden="true"/></summary>
   <ul className={k.grid}>{cards(rest)}</ul></details>}
 </section>;
}
/** The lesson lists' links (lib/site/GuideParts.tsx LessonList words): the title, the concept as the line, "7v7 lesson" as the tag. */
export const lessonLinks=(lessons:readonly SiteLesson[]):ReadLink[]=>lessons.map(l=>({path:lessonPath(l.id),name:l.title,line:l.concept,tag:`${l.formatLabel} lesson`}));

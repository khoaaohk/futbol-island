import {RULES} from './rules';
import {TERM_PAGES} from './terms';
import {DRILLS} from './drills';
import {DRILL_GUIDES} from './drillGuides';
import {PLANS} from './plans';
import {POSITIONS} from './positions';
import {FORMATIONS} from './formations';
import {COMPARISONS} from './comparisons';
import {LESSONS,lessonPath} from './lessons';
import {readNext} from './readNext';
import {ruleCrossLinks,termCrossLinks} from './crossLinks';
import {hasEs,toEn,toEs} from '../i18n/esPaths';
import * as reg from '../i18n/es/registry';
import * as dr from '../i18n/es/drillsRegistry';
import * as le from '../i18n/es/lessons';
/**
 * The linking mesh (SEO, Nov 21 2026, owner approved): every rule, term, drill, drill guide, practice plan, position, formation,
 * comparison and lesson page links to its closest siblings in its own family (up to MESH_SAME new links) and to the closest
 * pages of other families (up to MESH_CROSS, one per family), on top of the hand-made links each page already has.
 * "Close" is a cosine similarity of weighted topic tokens, all from the pages' own data: the words of the name, h1 and meta
 * description (stop words out, a light plural fold, IDF-weighted so common words count little), the lessons a page teaches
 * (a drill and a term that train the same lesson are close; a lesson is close to every page that names it), the drill
 * skill, the age group, the team size (format) and the positions a formation or comparison names. Ties break on the path,
 * so the result is deterministic (no randomness, no build clock). A link the page already shows (the caller passes them)
 * and the page's own read-next pair are skipped, and the next-closest page takes the slot. Anchor text: the target's short
 * title. Spanish pages get the Spanish page and its Spanish words; a target with no Spanish page is skipped there.
 * Rendered inside the existing "Keep reading" grid (components/site/KeepReading.tsx, group id `similar`) or, on lessons,
 * as more items of the "Keep going" list: no new layout.
 */
export type MeshFamily='rule'|'term'|'drill'|'drill-guide'|'plan'|'position'|'formation'|'comparison'|'lesson';
export type MeshLink={path:string;name:string;line?:string;mesh?:boolean};
type Node={path:string;family:MeshFamily;name:string;line?:string;bag:Map<string,number>};
export const MESH_SAME=8,MESH_CROSS=3;

const STOP=new Set(('a an and are as at be but by can do does for from has have how in into is it its kids kid soccer football of on one or our the their them '+
 'then there these they this to two up what when where which who why with you your plain words explained explain parents coaches coach guide page each every '+
 'more most so than that also all any just not no out over use used uses using will about after before both get gets here like only own same see very diagram time step steps simple').split(' '));
const fold=(w:string)=>w.length>4&&w.endsWith('ies')?w.slice(0,-3)+'y':w.length>3&&w.endsWith('s')&&!w.endsWith('ss')?w.slice(0,-1):w;
const words=(s:string|undefined)=>(s??'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').split(' ')
 .filter(w=>w.length>2&&!STOP.has(w)).map(fold);
const firstSentence=(s:string|undefined,max=110)=>{const t=(s??'').replace(/\s+/g,' ').trim(),m=t.match(/^[^.!?]+[.!?]/),x=(m?m[0]:t);
 if(x.length<=max)return x;const i=x.lastIndexOf(' ',max-1);return x.slice(0,i>40?i:max-1)+'…';};

function bag(parts:[string|undefined,number][],tags:[string,number][]):Map<string,number>{
 const m=new Map<string,number>();const add=(k:string,w:number)=>m.set(k,(m.get(k)??0)+w);
 for(const [s,w] of parts)for(const x of words(s))add(x,w);
 for(const [k,w] of tags)add(k,w);
 return m;
}
const L=(ls:readonly {id:string}[]):[string,number][]=>ls.map(l=>[`lesson:${l.id}`,2]);
/** Co-citation: the pages a page already links by hand (and the page itself) are tags too, so two pages that point at the same
 *  rule, term or drill are close, and a page is close to the pages that link it. */
const C=(self:string,ls:readonly {path:string}[]):[string,number][]=>[[`at:${self}`,3],...[...new Set(ls.map(l=>l.path.split('#')[0]))].filter(p=>p!==self).map(p=>[`at:${p}`,1.5] as [string,number])];

function build():Node[]{
 const out:Node[]=[];
 for(const r of RULES)out.push({path:r.path,family:'rule',name:/rule|card|kick|ball|line|game length/i.test(r.name)?r.name:`${r.name} rule`,line:`${r.law}: ${firstSentence(r.answer,80)}`,
  bag:bag([[r.name,3],[r.h1,1],[r.desc,1]],[...L(r.lessons),[`law:${r.law}`,1],...C(r.path,[...ruleCrossLinks(r.slug),...r.links,...r.exhibits])])});
 for(const t of TERM_PAGES)out.push({path:t.path,family:'term',name:t.name,line:t.short,bag:bag([[t.name,3],[t.also,2],[t.h1,1],[t.desc,1]],[...L(t.lessons),...C(t.path,termCrossLinks(t.slug))])});
 for(const d of DRILLS)out.push({path:d.path,family:'drill',name:d.name,line:firstSentence(d.answer),
  bag:bag([[d.name,3],[d.desc,1]],[...L(d.lessons),[`skill:${d.skill}`,3],...d.ages.map(a=>[`age:${a}`,.5] as [string,number]),...C(d.path,d.links)])});
 for(const g of DRILL_GUIDES)out.push({path:g.path,family:'drill-guide',name:g.name,line:g.blurb,
  bag:bag([[g.name,3],[g.h1,1],[g.desc,1]],[...L(g.lessons),...(g.age?[[`age:${g.age}`,2] as [string,number]]:[]),...(g.kind==='skill'?[[`skill:${g.slug}`,3] as [string,number]]:[]),[`at:${g.path}`,3]])});
 for(const p of PLANS)out.push({path:p.path,family:'plan',name:p.name,line:firstSentence(p.lead),
  bag:bag([[p.theme,3],[p.h1,1],[p.desc,1]],[...L(p.lessons),[`age:${p.age}`,2],...p.drills.map(d=>[`skill:${d.skill}`,1] as [string,number]),...C(p.path,[...p.links,...p.drills])])});
 for(const p of POSITIONS)out.push({path:p.path,family:'position',name:p.name,line:p.numberLine,bag:bag([[p.name,3],[p.h1,1],[p.desc,1]],[...L(p.lessons),[`pos:${p.slug}`,4],[`at:${p.path}`,3]])});
 for(const f of FORMATIONS)out.push({path:f.path,family:'formation',name:`${f.shape} formation (${f.format})`,line:firstSentence(f.answer),
  bag:bag([[f.h1,1],[f.desc,1]],[...L(f.lessons),[`fmt:${f.format}`,3],[`shape:${f.shape}`,2],[`form:${f.slug}`,4],[`at:${f.path}`,3],...[...new Set(f.roles.map(r=>r.pos).filter((x):x is string=>!!x))].map(p=>[`pos:${p}`,1] as [string,number])])});
 for(const c of COMPARISONS)out.push({path:c.path,family:'comparison',name:c.h1.split(':')[0].replace(/\?$/,''),line:firstSentence(c.answer),
  bag:bag([[c.h1,2],[c.desc,1]],c.kind==='position'?[[`pos:${c.a}`,4],[`pos:${c.b}`,4],...C(c.path,c.links)]:[[`form:${c.a}`,4],[`form:${c.b}`,4],...C(c.path,c.links)])});
 for(const l of LESSONS)out.push({path:lessonPath(l.id),family:'lesson',name:`${l.title} (${l.formatLabel})`,line:l.concept,
  bag:bag([[l.title,3],[l.concept,1],[l.category,1],[l.chapter,1]],[[`lesson:${l.id}`,4],[`fmt:${l.format}`,2],[`at:${lessonPath(l.id)}`,3]])});
 return out;
}

let NODES:Node[]|null=null,BY:Map<string,Node>|null=null,VEC:Map<string,Map<string,number>>|null=null;
function graph(){
 if(NODES&&BY&&VEC)return {nodes:NODES,by:BY,vec:VEC};
 const nodes=build(),df=new Map<string,number>();
 for(const n of nodes)for(const k of n.bag.keys())df.set(k,(df.get(k)??0)+1);
 const vec=new Map<string,Map<string,number>>();
 for(const n of nodes){const v=new Map<string,number>();let norm=0;
  for(const [k,w] of n.bag){const x=w*Math.log(nodes.length/(df.get(k)!));if(x>0){v.set(k,x);norm+=x*x;}}
  norm=Math.sqrt(norm)||1;for(const [k,x] of v)v.set(k,x/norm);vec.set(n.path,v);}
 const by=new Map(nodes.map(n=>[n.path,n]));
 if(by.size!==nodes.length)throw new Error('mesh: a path is in two families');
 NODES=nodes;BY=by;VEC=vec;return {nodes,by,vec};
}
const cos=(a:Map<string,number>,b:Map<string,number>)=>{let s=0;const [x,y]=a.size<b.size?[a,b]:[b,a];for(const [k,v] of x){const w=y.get(k);if(w)s+=v*w;}return s;};
/** Every other mesh page, closest first (ties: path order). */
function ranked(path:string):{node:Node;score:number}[]{
 const {nodes,by,vec}=graph(),self=by.get(path);if(!self)return [];
 const v=vec.get(path)!;
 return nodes.filter(n=>n!==self).map(node=>({node,score:cos(v,vec.get(node.path)!)}))
  .sort((a,b)=>b.score-a.score||(a.node.path<b.node.path?-1:a.node.path>b.node.path?1:0));
}
export const meshFamilyOf=(path:string):MeshFamily|undefined=>graph().by.get(path)?.family;
export const meshPaths=():string[]=>graph().nodes.map(n=>n.path);

/** Spanish words of a target page, read from the Spanish records (built once, on the first Spanish page). */
let ES_WORDS:Map<string,MeshLink>|null=null;
function esWords():Map<string,MeshLink>{
 if(ES_WORDS)return ES_WORDS;
 const m=new Map<string,MeshLink>(),put=(en:string,es:string,name:string,line?:string)=>m.set(en,{path:es,name,line});
 for(const r of reg.ES_RULES())put(r.path,r.esPath,r.name,`${r.law}: ${firstSentence(r.answer,80)}`);
 for(const t of reg.ES_TERMS())put(t.path,t.esPath,t.name,t.short);
 for(const p of reg.ES_POSITIONS())put(p.path,p.esPath,p.name,p.numberLine);
 for(const f of reg.ES_FORMATIONS())put(f.path,f.esPath,`Formación ${f.shapeEs??f.shape} (${f.format})`,firstSentence(f.answer));
 for(const c of reg.ES_COMPARISONS())put(c.path,c.esPath,c.h1.split(':')[0].replace(/^¿|\?$/g,''),firstSentence(c.answer));
 for(const d of dr.ES_DRILLS())put(d.path,d.esPath,d.name,firstSentence(d.answer));
 for(const g of dr.ES_DRILL_GUIDES())put(g.path,g.esPath,g.name,g.blurb);
 for(const p of dr.ES_PLANS())put(p.path,p.esPath,p.h1.split(':').slice(-1)[0].trim()||p.h1,firstSentence(p.lead));
 for(const l of le.ES_LESSONS())put(lessonPath(l.id),l.esPath,`${l.title} (${l.formatLabel})`,l.concept);
 ES_WORDS=m;return m;
}

/**
 * The mesh links of one page: up to MESH_SAME closest pages of its own family, then up to MESH_CROSS closest pages of other
 * families (one per family). `path` is the English path (a Spanish one is folded back). `skip`: the paths the page already
 * links in its related lists (English or Spanish form, `#anchor` ignored).
 */
export function meshLinks(path:string,{skip=[],lang='en'}:{skip?:Iterable<string>;lang?:'en'|'es'}={}):MeshLink[]{
 const en=path.startsWith('/es')?toEn(path)??path:path,{by}=graph(),self=by.get(en);if(!self)return [];
 const rn=readNext(en),taken=new Set<string>([en,...(rn?[rn.prev.path,rn.next.path]:[])]);
 for(const s of skip){const p=s.split('#')[0];taken.add(p.startsWith('/es')?toEn(p)??p:p);}
 const ok=(p:string)=>!taken.has(p)&&(lang==='en'||hasEs(p));
 const all=ranked(en).filter(x=>ok(x.node.path));
 /* a small family fills up with its last pages even at score 0; a cross-family link needs a shared topic */
 const same=all.filter(x=>x.node.family===self.family).slice(0,MESH_SAME),fams=new Set<MeshFamily>([self.family]),cross:typeof all=[];
 for(const x of all){if(cross.length>=MESH_CROSS||x.score<=0)break;if(!fams.has(x.node.family)){fams.add(x.node.family);cross.push(x);}}
 const out=[...same,...cross].map(({node}):MeshLink=>{
  /* the short title only: no summary line, so the grid adds links, not repeated text (word budgets, unique-text checks) */
  if(lang==='en')return {path:node.path,name:node.name,mesh:true};
  const w=esWords().get(node.path);return {path:w?.path??toEs(node.path),name:w?.name??node.name,mesh:true};
 });
 return out;
}
/** The "Keep reading" groups with the mesh group added after them (id `similar`, mixed kinds: each card takes its own tag). */
export function withMesh<G extends {id:string;links:readonly {path:string}[]}>(groups:readonly G[],path:string,lang:'en'|'es'='en'):(G|{id:string;links:MeshLink[]})[]{
 const links=meshLinks(path,{skip:groups.flatMap(g=>g.links.map(l=>l.path)),lang});
 return links.length?[...groups,{id:'similar',links}]:[...groups];
}

import {RULES,RULES_HUB} from './rules';
import {TERM_PAGES,TERMS_HUB} from './terms';
import {POSITIONS,POSITIONS_HUB} from './positions';
import {NUMBERS_PAGE} from './positionNumbers';
import {FORMATIONS,FORMATIONS_HUB} from './formations';
import {DRILLS,DRILLS_HUB} from './drills';
import {DRILL_GUIDES} from './drillGuides';
import {PLANS,PLANS_HUB} from './plans';
import {FORMAT_ORDER,LESSONS,LESSONS_INDEX,lessonPath} from './lessons';
/**
 * "Read next" paths (owner request, Nov 15 2026): every guide page ends with the next logical page of its topic, as one ordered,
 * linear chain per cluster with a previous / next pair. The first page's "previous" and the last page's "next" are the
 * cluster's hub, so there are no dead ends and no loops (tests/seo-links.cjs walks every chain).
 * Order: the rules and the glossary follow a teaching order written below (every page exactly once, checked here); the other
 * clusters use their own data order (positions back to front, formations by team size, drills by skill, plans and drill
 * guides by age, lessons in catalog order within 7v7, 9v9, 11v11 and futsal).
 */
export type ChainLink={path:string;name:string};
export type Chain={id:string;hub:ChainLink;pages:ChainLink[]};
/** Rules: restarts, then the referee's cards with the fouls and kicks they follow from, then offside and the youth rules. */
const RULE_ORDER=['kick-off','throw-in','goal-kick','corner-kick','drop-ball','yellow-and-red-cards','fouls-and-free-kicks','penalty-kick','handball','advantage',
 'offside','back-pass-rule','build-out-line','heading-rules-for-kids','substitutions-and-game-length','futsal-rules'];
/** Terms: combinations from the simplest (2v1) up, then wide play, the ball, defending, and the words for results. */
const TERM_ORDER=['two-v-one','give-and-go','through-ball','third-man-run','overlap','switching-play','cross','cutback','first-touch','nutmeg','counterattack',
 'pressing','marking','goal-side','tackle','set-piece','free-kick-wall','yellow-card','red-card','clean-sheet','hat-trick'];
function ordered<T extends {slug:string}>(list:readonly T[],order:readonly string[],what:string):T[]{
 const out=order.map(s=>{const x=list.find(y=>y.slug===s);if(!x)throw new Error(`readNext: ${what} ${s} does not exist`);return x;});
 if(out.length!==list.length||new Set(order).size!==order.length)throw new Error(`readNext: the ${what} order must list every page once`);
 return out;
}
export const CHAINS:readonly Chain[]=[
 {id:'rules',hub:{path:RULES_HUB.path,name:'All soccer rules for kids'},pages:ordered(RULES,RULE_ORDER,'rule').map(r=>({path:r.path,name:r.h1}))},
 {id:'terms',hub:{path:TERMS_HUB.path,name:'All soccer terms'},pages:ordered(TERM_PAGES,TERM_ORDER,'term').map(t=>({path:t.path,name:t.h1}))},
 {id:'positions',hub:{path:POSITIONS_HUB.path,name:'All soccer positions'},pages:[{path:NUMBERS_PAGE.path,name:NUMBERS_PAGE.h1},...POSITIONS.map(p=>({path:p.path,name:p.h1}))]},
 {id:'formations',hub:{path:FORMATIONS_HUB.path,name:'All soccer formations'},pages:FORMATIONS.map(f=>({path:f.path,name:f.h1}))},
 {id:'drills',hub:{path:DRILLS_HUB.path,name:'All soccer drills for kids'},pages:DRILLS.map(d=>({path:d.path,name:d.h1}))},
 {id:'drill-guides',hub:{path:DRILLS_HUB.path,name:'All soccer drills for kids'},pages:DRILL_GUIDES.map(g=>({path:g.path,name:g.h1}))},
 {id:'plans',hub:{path:PLANS_HUB.path,name:'All soccer practice plans'},pages:PLANS.map(p=>({path:p.path,name:p.h1}))},
 {id:'lessons',hub:{path:LESSONS_INDEX,name:'All football lessons'},pages:FORMAT_ORDER.flatMap(f=>LESSONS.filter(l=>l.format===f)).map(l=>({path:lessonPath(l.id),name:`${l.title} (${l.formatLabel} lesson)`}))},
];
const AT=new Map<string,{chain:Chain;i:number}>();
for(const chain of CHAINS)chain.pages.forEach((p,i)=>{if(AT.has(p.path))throw new Error(`readNext: ${p.path} is in two chains`);AT.set(p.path,{chain,i});});
/** The previous and next page for a guide page (the hub at either end), or undefined for a page in no chain. */
export function readNext(path:string):{prev:ChainLink;next:ChainLink;prevIsHub:boolean;nextIsHub:boolean;topic:string}|undefined{
 const at=AT.get(path);if(!at)return undefined;const {chain,i}=at,last=chain.pages.length-1;
 return {prev:i>0?chain.pages[i-1]:chain.hub,next:i<last?chain.pages[i+1]:chain.hub,prevIsHub:i===0,nextIsHub:i===last,topic:chain.id};
}

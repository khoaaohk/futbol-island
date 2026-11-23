/**
 * The coach app's screens in the URL (round 4A, Nov 22 2026; UX audit B1/C6). Pure: no window, no storage (tests/coach-app.cjs §10).
 * Two tab pages (Game Day, Training) and the tools that push over them. Every screen has its own hash so the phone's Back (Android
 * back, the iOS edge swipe, the browser button) moves between screens: a tool returns to the tab it came from, a tab page leaves the
 * app. Old links keep working: #tool=home is Game Day, #tool=match opens the live game.
 *   #tool=subs&format=9v9        a tool, asked for a format (the /tools front doors)
 *   #tool=plans&plan=<slug>      a practice plan (the /learn plan pages' "Open in the Coach app")
 *   #tool=plans&age=U8           the plans list at an age;  &run=1  the plan's session timer
 */
export type Root='gameday'|'training';
export type Tool='team'|'lineup'|'minutes'|'subs'|'summary'|'plans';
export type Screen=Root|Tool;
export type Age='U6'|'U8'|'U10'|'U12';
export type Route={screen:Screen;live?:boolean;format?:string;plan?:string;age?:Age;run?:boolean};
export const ROOTS:readonly Root[]=['gameday','training'];
export const TOOLS:readonly Tool[]=['team','lineup','minutes','subs','summary','plans'];
export const AGES:readonly Age[]=['U6','U8','U10','U12'];
const FORMATS=['4v4','5v5','7v7','8v8','9v9','11v11','futsal'];
export const isRoot=(s:Screen):s is Root=>s==='gameday'||s==='training';
/** The tab a tool belongs to (Back returns there when the tool was opened by a link, not from a tab). */
export const homeOf=(s:Screen):Root=>isRoot(s)?s:s==='plans'?'training':'gameday';
const SLUG=/^[a-z0-9-]{1,80}$/;
export function parseHash(hash:string):Route{
 const q=new URLSearchParams((hash||'').replace(/^#/,''));
 const t=q.get('tool')??q.get('tab')??'';
 const live=t==='match';
 const screen:Screen=t==='home'||t==='match'?(live?'subs':'gameday'):(ROOTS as readonly string[]).includes(t)||(TOOLS as readonly string[]).includes(t)?t as Screen:'gameday';
 const r:Route={screen};
 if(live)r.live=true;
 const f=q.get('format');if(f&&FORMATS.includes(f))r.format=f;
 if(screen==='plans'){const p=q.get('plan');if(p&&SLUG.test(p))r.plan=p;const a=(q.get('age')||'').toUpperCase();if((AGES as readonly string[]).includes(a))r.age=a as Age;if(r.plan&&q.get('run')==='1')r.run=true;}
 return r;
}
/** True when the hash names a screen at all (a bare /coach opens the last tab page). */
export const hashNamesScreen=(hash:string)=>/[#&](tool|tab)=/.test(hash||'');
export function hashFor(r:Route):string{
 if(r.live)return '#tool=match';
 const parts=[`tool=${r.screen}`];
 if(r.format)parts.push(`format=${r.format}`);
 if(r.screen==='plans'){if(r.plan)parts.push(`plan=${r.plan}`);if(r.age)parts.push(`age=${r.age}`);if(r.plan&&r.run)parts.push('run=1');}
 return '#'+parts.join('&');
}
/** The history to build when the app opens on a route: a tool opened by a link gets its tab page underneath (one Back returns to it);
 *  a plan opened by a link gets the plans list underneath it, and the tab under that. */
export function landingStack(r:Route):Route[]{
 if(isRoot(r.screen)&&!r.live)return [r];
 const base:Route[]=[{screen:homeOf(r.screen)}];
 if(r.screen==='plans'&&r.plan){base.push({screen:'plans',age:r.age});if(r.run)base.push({screen:'plans',plan:r.plan,age:r.age});}
 return [...base,r];
}
/** Same screen (ignoring a deep link's format hint): used to skip a history entry that changes nothing. */
export const sameRoute=(a:Route,b:Route)=>hashFor({...a,format:undefined})===hashFor({...b,format:undefined});
/**
 * The practice age for a team (owner: plans open at the active team's age): an age written in the team's name wins ("Tigers U10",
 * "u9 Blue"), else the game format (4v4 U6, 5v5 U8, 7v7 and futsal U10, 9v9 and 11v11 U12). Odd ages round up to the plan ages
 * (U7 -> U8, U9 -> U10, U11+ -> U12; U5 and under -> U6).
 */
export function ageFor(format:string,teamName=''):Age{
 const m=/\bu-?(\d{1,2})\b/i.exec(teamName);
 if(m){const n=Number(m[1]);return n<=6?'U6':n<=8?'U8':n<=10?'U10':'U12';}
 return format==='4v4'?'U6':format==='5v5'?'U8':format==='7v7'||format==='futsal'?'U10':'U12';
}

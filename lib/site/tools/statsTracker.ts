/**
 * Youth soccer stats tracker for parents (Nov 22 2026; /tools/youth-soccer-stats-tracker and its Spanish twin). Pure and
 * import-free (tests/more-tools.cjs): the game record, the season summary, the effort badges and the CSV export. Everything is
 * kept on the device by the page; no names are needed (a nickname is enough) and nothing is sent anywhere.
 * Counting rules the page explains: a goal is when the whole ball crosses the goal line between the posts and under the bar
 * (IFAB Law 10); an assist is the last pass or touch before a teammate scores (the common youth-stats custom, not a Law);
 * a save is a shot on target that the player stops as goalkeeper.
 */
export type BadgeId='new-skill'|'helped'|'attitude'|'never-gave-up'|'talked'|'good-sport';
export const BADGES:readonly BadgeId[]=['new-skill','helped','attitude','never-gave-up','talked','good-sport'];
export type Game={id:string;date:string;opponent:string;goals:number;assists:number;saves:number;minutes:number;badges:BadgeId[];note:string};
export type Season={player:string;games:Game[]};
export const MAX_GAMES=200,MAX_TEXT=60,MAX_NOTE=200;
const int=(v:unknown,max:number)=>{const n=Math.round(Number(v));return Number.isFinite(n)?Math.max(0,Math.min(max,n)):0;};
const text=(v:unknown,max:number)=>typeof v==='string'?v.replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max):'';
const isDate=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s);
/** One game, cleaned: counts are whole numbers within sensible limits, text is trimmed, badges are known ones only. */
export function cleanGame(g:Partial<Game>&{id:string}):Game{
 return {id:text(g.id,40)||'g',date:isDate(String(g.date))?String(g.date):'2026-01-01',opponent:text(g.opponent,MAX_TEXT),goals:int(g.goals,50),assists:int(g.assists,50),saves:int(g.saves,99),
  minutes:int(g.minutes,180),badges:BADGES.filter(b=>Array.isArray(g.badges)&&g.badges.includes(b)),note:text(g.note,MAX_NOTE)};
}
export function readSeason(v:unknown):Season{
 if(!v||typeof v!=='object')return {player:'',games:[]};const o=v as Partial<Season>;
 return {player:text(o.player,MAX_TEXT),games:Array.isArray(o.games)?o.games.filter(g=>g&&typeof g==='object'&&typeof (g as Game).id==='string').map(g=>cleanGame(g as Game)).slice(-MAX_GAMES):[]};
}
/** Games in date order (oldest first; same date keeps the order they were added). */
export const ordered=(gs:readonly Game[])=>gs.map((g,i)=>[g,i] as const).sort((a,b)=>a[0].date<b[0].date?-1:a[0].date>b[0].date?1:a[1]-b[1]).map(x=>x[0]);
export const upsert=(s:Season,g:Game):Season=>{const c=cleanGame(g),i=s.games.findIndex(x=>x.id===c.id);return {...s,games:i<0?[...s.games,c].slice(-MAX_GAMES):s.games.map((x,j)=>j===i?c:x)};};
export const remove=(s:Season,id:string):Season=>({...s,games:s.games.filter(g=>g.id!==id)});
export type Summary={games:number;goals:number;assists:number;saves:number;minutes:number;perGame:{goals:number;assists:number;minutes:number};badges:Record<BadgeId,number>;topBadge:BadgeId|null;bestGame:Game|null};
const r1=(n:number)=>Math.round(n*10)/10;
export function summary(gs:readonly Game[]):Summary{
 const n=gs.length,sum=(k:'goals'|'assists'|'saves'|'minutes')=>gs.reduce((a,g)=>a+g[k],0);
 const badges=Object.fromEntries(BADGES.map(b=>[b,gs.filter(g=>g.badges.includes(b)).length])) as Record<BadgeId,number>;
 const topBadge=BADGES.reduce<BadgeId|null>((a,b)=>badges[b]>0&&(a===null||badges[b]>badges[a])?b:a,null);
 const bestGame=gs.reduce<Game|null>((a,g)=>!a||g.goals+g.assists+g.badges.length>a.goals+a.assists+a.badges.length?g:a,null);
 return {games:n,goals:sum('goals'),assists:sum('assists'),saves:sum('saves'),minutes:sum('minutes'),perGame:{goals:n?r1(sum('goals')/n):0,assists:n?r1(sum('assists')/n):0,minutes:n?Math.round(sum('minutes')/n):0},badges,topBadge,bestGame};
}
/** One CSV field: quoted when needed, and a leading = + - @ is made safe so a spreadsheet never runs it as a formula. */
export function csvField(v:string|number){let s=String(v);if(/^[=+\-@\t\r]/.test(s))s=`'${s}`;return /[",\n\r]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}
export function toCsv(gs:readonly Game[],head:readonly string[],badgeName:(b:BadgeId)=>string){
 const rows=ordered(gs).map(g=>[g.date,g.opponent,g.goals,g.assists,g.saves,g.minutes,g.badges.map(badgeName).join('; '),g.note]);
 return [head,...rows].map(r=>r.map(csvField).join(',')).join('\r\n')+'\r\n';
}
/** The example season the page shows before the first game is logged (labelled "Example"). */
export const EXAMPLE_GAMES:readonly Game[]=[
 {id:'ex1',date:'2026-09-06',opponent:'Lions',goals:0,assists:1,saves:0,minutes:30,badges:['helped','attitude'],note:''},
 {id:'ex2',date:'2026-09-13',opponent:'Sharks',goals:1,assists:0,saves:0,minutes:35,badges:['new-skill'],note:''},
 {id:'ex3',date:'2026-09-20',opponent:'Eagles',goals:0,assists:0,saves:3,minutes:25,badges:['never-gave-up','talked'],note:''},
 {id:'ex4',date:'2026-09-27',opponent:'Wolves',goals:2,assists:1,saves:0,minutes:40,badges:['good-sport','helped'],note:''},
 {id:'ex5',date:'2026-10-04',opponent:'Tigers',goals:0,assists:2,saves:0,minutes:35,badges:['new-skill','attitude'],note:''},
];

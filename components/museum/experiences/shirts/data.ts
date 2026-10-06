/**
 * shirts (1928, "Numbers and colours"): the data and pure logic behind the Kit Room experience. No React here, so the Node
 * test (tests/museum-exp-shirts.cjs) can check the history, the clash maths and the scan-drill generator directly.
 *
 * Real history only. The case's own facts (lib/endgame/museum.ts) are shown word for word from `exhibit.facts`; the extra
 * facts below are verified and cited in SOURCES.
 */

/** The classic 1–11, as they were handed out from the 1928 "2-3-5" line-up (the pyramid): counted from the goalkeeper
 *  forwards, and right to left along each line. x/y are on a 68 × 105 pitch, our goal at the bottom, attacking upwards. */
export type Spot={n:number;role:string;short:string;line:'goal'|'backs'|'halves'|'forwards';x:number;y:number;say:string};
export const SPOTS:readonly Spot[]=[
 {n:1,role:'Goalkeeper',short:'Keeper',line:'goal',x:34,y:97,say:'1 the goalkeeper: the last line of defence. Keepers wear a colour of their own, so everyone can tell them apart.'},
 {n:2,role:'Right back',short:'R back',line:'backs',x:46,y:81,say:'2 and 3 were the two backs, guarding the goal on the right and the left.'},
 {n:3,role:'Left back',short:'L back',line:'backs',x:22,y:81,say:'3 the left back. Numbers count from the back of the team to the front.'},
 {n:4,role:'Right half',short:'R half',line:'halves',x:55,y:63,say:'4, 5 and 6 were the halves: they won the ball and passed it forward.'},
 {n:5,role:'Centre half',short:'C half',line:'halves',x:34,y:65,say:'5 the centre half, right in the middle of everything.'},
 {n:6,role:'Left half',short:'L half',line:'halves',x:13,y:63,say:'6 the left half. That is the second line done: 4, 5, 6 from right to left.'},
 {n:7,role:'Outside right (right winger)',short:'R wing',line:'forwards',x:61,y:38,say:'7 the right winger, racing down the touchline.'},
 {n:8,role:'Inside right',short:'In right',line:'forwards',x:47,y:43,say:'8 the inside right, passing to the wingers and the striker.'},
 {n:9,role:'Centre forward (striker)',short:'Striker',line:'forwards',x:34,y:36,say:'9 the striker: the centre forward, there to score the goals.'},
 {n:10,role:'Inside left (playmaker)',short:'Playmaker',line:'forwards',x:21,y:43,say:'10 the playmaker: the inside left, later the number for a team’s most creative passer.'},
 {n:11,role:'Outside left (left winger)',short:'L wing',line:'forwards',x:7,y:38,say:'11 the left winger. 2 backs, 3 halves, 5 forwards: the 2-3-5 shape of 1928.'},
];
export const spotOf=(n:number)=>SPOTS.find(s=>s.n===n)!;
/** Where a drop lands: the nearest spot within `reach` (pitch units), or null. */
export function nearestSpot(x:number,y:number,reach=11):Spot|null{
 let best:Spot|null=null,bd=reach;for(const s of SPOTS){const d=Math.hypot(s.x-x,s.y-y);if(d<bd){bd=d;best=s;}}return best;
}
/** A gentle nudge after a wrong spot (never just "wrong"). */
export function hintFor(n:number,tried:Spot):string{
 const want=spotOf(n);if(tried.n===n)return '';
 if(want.line!==tried.line){const order=['goal','backs','halves','forwards'];return `Not quite. That spot wears ${tried.n}. Number ${n} plays ${order.indexOf(want.line)<order.indexOf(tried.line)?'further back':'further forward'}: numbers count up from the goalkeeper.`;}
 return `Close! Right line, wrong side. Each line counts from right to left, so ${n} goes ${want.x>tried.x?'more to the right':'more to the left'}.`;
}

/** New facts, beyond the case (all in SOURCES). Kid-sized words. */
export const EXTRA_FACTS={
 firstDay:'On 25 August 1928, Arsenal and Chelsea were the first clubs to wear numbers in English league games.',
 shape:'The numbers followed the 2-3-5 line-up of the time: 1 the goalkeeper, 2 and 3 the backs, 4 to 6 the halves, 7 to 11 the forwards.',
 cupFinal:'At the 1933 FA Cup final, Everton wore 1 to 11 and Manchester City wore 12 to 22.',
 lawWords:'Law 4 says the two teams must wear colours that make them easy to tell apart from each other and from the referees.',
} as const;

export const SOURCES:readonly {title:string;url:string}[]=[
 {title:'Wikipedia · Squad number (association football)',url:'https://en.wikipedia.org/wiki/Squad_number_(association_football)'},
 {title:'Arsenal.com · Gunners wear numbered shirts',url:'https://www.arsenal.com/feature/27.-gunners-wear-numbered-shirts-aX7y25h6rQhY'},
 {title:'Wikipedia · 1933 FA Cup final',url:'https://en.wikipedia.org/wiki/1933_FA_Cup_final'},
 {title:'Wikipedia · 2–3–5 formation (Formation (association football))',url:'https://en.wikipedia.org/wiki/Formation_(association_football)'},
 {title:'IFAB Laws of the Game · Law 4 The Players’ Equipment',url:'https://www.theifab.com/laws/latest/the-players-equipment/'},
];

// ---- Colours ------------------------------------------------------------------------------------------------------------
export type Swatch={id:string;name:string;hex:string;ink:string};
export const SWATCHES:readonly Swatch[]=[
 {id:'red',name:'Red',hex:'#d62839',ink:'#fff'},
 {id:'orange',name:'Orange',hex:'#ec5a24',ink:'#fff'},
 {id:'yellow',name:'Yellow',hex:'#f5cf2a',ink:'#1b1b1d'},
 {id:'amber',name:'Gold',hex:'#e9a21b',ink:'#1b1b1d'},
 {id:'green',name:'Green',hex:'#1e8c4e',ink:'#fff'},
 {id:'sky',name:'Sky blue',hex:'#5ab0e6',ink:'#1b1b1d'},
 {id:'navy',name:'Navy',hex:'#1d3270',ink:'#fff'},
 {id:'royal',name:'Royal blue',hex:'#2f56c4',ink:'#fff'},
 {id:'white',name:'White',hex:'#f4f1e8',ink:'#1b1b1d'},
 {id:'black',name:'Black',hex:'#1b1b1d',ink:'#fff'},
];
export const swatch=(id:string)=>SWATCHES.find(s=>s.id===id)??SWATCHES[0];
const lin=(c:number)=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};
/** sRGB hex → CIE L*a*b* (D65). */
export function lab(hex:string):[number,number,number]{
 const r=lin(parseInt(hex.slice(1,3),16)),g=lin(parseInt(hex.slice(3,5),16)),b=lin(parseInt(hex.slice(5,7),16));
 const x=(r*.4124+g*.3576+b*.1805)/.95047,y=r*.2126+g*.7152+b*.0722,z=(r*.0193+g*.1192+b*.9505)/1.08883;
 const f=(t:number)=>t>.008856?Math.cbrt(t):7.787*t+16/116;
 return [116*f(y)-16,500*(f(x)-f(y)),200*(f(y)-f(z))];
}
/** How different two colours look (ΔE 1976). Under CLASH_DE they are too easy to mix up at a glance. */
export function colourGap(a:string,b:string){const A=lab(swatch(a).hex),B=lab(swatch(b).hex);return Math.hypot(A[0]-B[0],A[1]-B[1],A[2]-B[2]);}
export const CLASH_DE=45;
export const clash=(a:string,b:string)=>colourGap(a,b)<CLASH_DE;

export type Kits={home:string;away:string;homeGk:string;awayGk:string;referee:string};
export const DEFAULT_KITS:Kits={home:'red',away:'white',homeGk:'green',awayGk:'yellow',referee:'black'};
export const KIT_ROLES:readonly {key:keyof Kits;label:string}[]=[
 {key:'home',label:'Your team'},{key:'away',label:'Other team'},{key:'homeGk',label:'Your keeper'},{key:'awayGk',label:'Their keeper'},{key:'referee',label:'Referee'},
];
export type LawCheck={id:'teams'|'referee'|'keepers';rule:string;ok:boolean;why:string};
/** The three Law 4 colour checks, with a reason a 7-year-old can act on. */
export function lawChecks(k:Kits):LawCheck[]{
 const nm=(id:string)=>swatch(id).name.toLowerCase();
 const teams=!clash(k.home,k.away);
 const refBad=[k.home,k.away].find(c=>clash(c,k.referee));
 const pairs:[keyof Kits,keyof Kits][]=[['homeGk','home'],['homeGk','away'],['homeGk','referee'],['awayGk','home'],['awayGk','away'],['awayGk','referee'],['homeGk','awayGk']];
 const gkBad=pairs.find(([a,b])=>clash(k[a],k[b]));
 const label=(key:keyof Kits)=>KIT_ROLES.find(r=>r.key===key)!.label.toLowerCase();
 return [
  {id:'teams',rule:'The two teams look different',ok:teams,why:teams?'Easy: you can tell team-mates from opponents.':`${swatch(k.home).name} and ${nm(k.away)} are too alike. Who is on your side?`},
  {id:'referee',rule:'The teams look different from the referee',ok:!refBad,why:!refBad?'Nobody will pass to the referee by mistake.':`The referee’s ${nm(k.referee)} is too close to ${nm(refBad)}.`},
  {id:'keepers',rule:'Each goalkeeper has a colour of their own',ok:!gkBad,why:!gkBad?'Both keepers stand out from everyone.':`The ${label(gkBad[0])} looks too much like the ${label(gkBad[1])}.`},
 ];
}

// ---- The scan drill -----------------------------------------------------------------------------------------------------
/** One "look before you receive" moment: you (at the bottom, the ball coming to you) plus 4 team-mates and 4 opponents on a
 *  100 × 70 patch of pitch. Exactly one team-mate is free (no opponent close); the others each have a marker on them. */
export type ScanPlayer={id:string;team:'mate'|'opp';x:number;y:number;free?:boolean};
export type ScanScene={you:{x:number;y:number};players:ScanPlayer[];freeId:string};
export const MARK_DIST=7,FREE_DIST=20;
export function scanScene(rng:()=>number=Math.random):ScanScene{
 const you={x:50,y:62};
 for(let attempt=0;attempt<400;attempt++){
  const mates:ScanPlayer[]=[];
  for(let i=0;i<4&&mates.length<4;i++){let tries=0;while(tries++<60){const p={id:'m'+i,team:'mate' as const,x:10+rng()*80,y:10+rng()*38};
   if(mates.every(m=>Math.hypot(m.x-p.x,m.y-p.y)>28)&&Math.hypot(p.x-you.x,p.y-you.y)>20){mates.push(p);break;}}}
  if(mates.length<4)continue;
  const freeIdx=Math.floor(rng()*4);mates[freeIdx].free=true;
  const opps:ScanPlayer[]=[];
  mates.forEach((m,i)=>{if(i===freeIdx)return;const a=rng()*Math.PI*2,d=4+rng()*(MARK_DIST-4);opps.push({id:'o'+opps.length,team:'opp',x:m.x+Math.cos(a)*d,y:m.y+Math.sin(a)*d});});
  // the fourth opponent is a decoy in open space (never near the free player)
  let decoy:ScanPlayer|null=null;for(let t=0;t<80&&!decoy;t++){const p={id:'o3',team:'opp' as const,x:8+rng()*84,y:8+rng()*44};
   if(Math.hypot(p.x-mates[freeIdx].x,p.y-mates[freeIdx].y)>FREE_DIST+4&&Math.hypot(p.x-you.x,p.y-you.y)>14&&[...mates,...opps].every(q=>Math.hypot(q.x-p.x,q.y-p.y)>9))decoy=p;}
  if(!decoy)continue;opps.push(decoy);
  const players=[...mates,...opps];
  if(!sceneValid({you,players,freeId:mates[freeIdx].id}))continue;
  // shuffle draw order so the free player isn't always first in the DOM
  for(let i=players.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[players[i],players[j]]=[players[j],players[i]];}
  return {you,players,freeId:mates[freeIdx].id};
 }
 // a fixed fallback scene (never reached in practice)
 return {you,freeId:'m0',players:[{id:'m0',team:'mate',x:18,y:20,free:true},{id:'m1',team:'mate',x:50,y:16},{id:'m2',team:'mate',x:80,y:26},{id:'m3',team:'mate',x:30,y:44},
  {id:'o0',team:'opp',x:54,y:20},{id:'o1',team:'opp',x:76,y:30},{id:'o2',team:'opp',x:34,y:40},{id:'o3',team:'opp',x:70,y:50}]};
}
/** Exactly one team-mate has no opponent within FREE_DIST; every other team-mate has one within MARK_DIST. */
export function sceneValid(s:ScanScene){
 const opps=s.players.filter(p=>p.team==='opp'),mates=s.players.filter(p=>p.team==='mate');
 const near=(m:ScanPlayer)=>Math.min(...opps.map(o=>Math.hypot(o.x-m.x,o.y-m.y)));
 return mates.length===4&&opps.length===4&&mates.filter(m=>m.free).length===1&&mates.every(m=>m.free?near(m)>FREE_DIST&&m.id===s.freeId:near(m)<=MARK_DIST);
}

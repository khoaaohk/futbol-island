/**
 * copa-america-1916 · the data and rules (pure, tested by tests/museum-exp-copa-america-1916.cjs). Checked Oct 14 2026 against
 * the Wikipedia pages listed in content.ts (each tournament's first edition; the 1916 matches and table; the trophy).
 *  1. THE FIXTURE DRUM (Oct 14 2026 redo): an eight-sided drum turned by a crank, one face per 45° detent: a start face, the six
 *     1916 matches in order, and a champions face. The drum's position IS how many matches have been played; the flip table
 *     and the threads on the map plate follow it.
 *  2. THE TIMELINE RAIL: a carriage slides along the years 1910–1980; each continent's first cup for national teams drops into
 *     its slot when the carriage reaches its year. The Copa América stands alone for 40 years.
 *  3. THE TROPHY: the silver cup bought in 1916 lifts off its three-level wooden base.
 */
export type CupId='copa'|'asia'|'africa'|'europe'|'concacaf'|'oceania';
export type Cup={id:CupId;name:string;short:string;year:number;continent:string;host:string;winner:string};
export const CUPS:readonly Cup[]=[
 {id:'copa',name:'South American Championship (now the Copa América)',short:'Copa América',year:1916,continent:'South America',host:'Argentina',winner:'Uruguay'},
 {id:'asia',name:'AFC Asian Cup',short:'Asian Cup',year:1956,continent:'Asia',host:'Hong Kong',winner:'South Korea'},
 {id:'africa',name:'Africa Cup of Nations',short:'Africa Cup of Nations',year:1957,continent:'Africa',host:'Sudan',winner:'Egypt'},
 {id:'europe',name:'European Nations’ Cup (now the European Championship)',short:'European Championship',year:1960,continent:'Europe',host:'France',winner:'Soviet Union'},
 {id:'concacaf',name:'CONCACAF Championship (now the Gold Cup)',short:'CONCACAF Championship',year:1963,continent:'North and Central America',host:'El Salvador',winner:'Costa Rica'},
 {id:'oceania',name:'OFC Nations Cup',short:'OFC Nations Cup',year:1973,continent:'Oceania',host:'New Zealand',winner:'New Zealand'},
];
export const cupOf=(id:CupId)=>CUPS.find(c=>c.id===id)!;
export const DECADES:readonly number[]=[1910,1920,1930,1940,1950,1960,1970];
export const decadeOf=(year:number)=>Math.floor(year/10)*10;
/** Place a cup on a decade: right only when the cup's first year is in that decade. */
export function placeCup(id:CupId,decade:number):{ok:boolean;say:string}{
 const c=cupOf(id),d=decadeOf(c.year);
 if(d===decade)return {ok:true,say:`${c.year}: the first ${c.short}, in ${c.host}. ${c.winner} won it.`};
 return {ok:false,say:`${c.year} is in the ${d}s, ${decade<d?'later':'earlier'} on the line.`};
}
export const oldest=(list:readonly Cup[]=CUPS)=>list.reduce((a,b)=>b.year<a.year?b:a);
/** How many years the oldest cup is ahead of the next one. */
export function headStart(list:readonly Cup[]=CUPS){const ys=list.map(c=>c.year).sort((a,b)=>a-b);return ys[1]-ys[0];}

// ---- 1916 ---------------------------------------------------------------------------------------------------------------
export type Team='Uruguay'|'Argentina'|'Brazil'|'Chile';
export const TEAMS:readonly Team[]=['Uruguay','Argentina','Brazil','Chile'];
export type Match={date:string;home:Team;away:Team;hg:number;ag:number;note?:string};
export const MATCHES_1916:readonly Match[]=[
 {date:'2 July',home:'Uruguay',away:'Chile',hg:4,ag:0},
 {date:'6 July',home:'Argentina',away:'Chile',hg:6,ag:1},
 {date:'8 July',home:'Brazil',away:'Chile',hg:1,ag:1},
 {date:'10 July',home:'Argentina',away:'Brazil',hg:1,ag:1},
 {date:'12 July',home:'Uruguay',away:'Brazil',hg:2,ag:1},
 {date:'17 July',home:'Argentina',away:'Uruguay',hg:0,ag:0,note:'Stopped after five minutes on 16 July when the crowd got out of hand, and played again the next day.'},
];
export const WIN_POINTS=2;
export type Row={team:Team;p:number;w:number;d:number;l:number;gf:number;ga:number;pts:number};
/** The table after the first n matches (points, then goal difference, then goals scored). */
export function table(n:number=MATCHES_1916.length):Row[]{
 const r=new Map<Team,Row>(TEAMS.map(t=>[t,{team:t,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}]));
 for(const m of MATCHES_1916.slice(0,n)){const h=r.get(m.home)!,a=r.get(m.away)!;h.p++;a.p++;h.gf+=m.hg;h.ga+=m.ag;a.gf+=m.ag;a.ga+=m.hg;
  if(m.hg>m.ag){h.w++;a.l++;h.pts+=WIN_POINTS;}else if(m.hg<m.ag){a.w++;h.l++;a.pts+=WIN_POINTS;}else{h.d++;a.d++;h.pts++;a.pts++;}}
 return [...r.values()].sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
}
/** A round robin of n teams: everyone plays everyone once. */
export const roundRobinGames=(n:number)=>n*(n-1)/2;

// ---- The fixture drum -------------------------------------------------------------------------------------------------
export const FACES=8,STEP=Math.PI*2/FACES,LAST_STATE=MATCHES_1916.length+1;
/** The drum's angle → its state: 0 = start, 1..6 = after that match, 7 = the champions face. */
export const stateAt=(phi:number)=>Math.max(0,Math.min(LAST_STATE,Math.round(phi/STEP)));
/** How many matches have been played at a drum state. */
export const playedAt=(state:number)=>Math.min(MATCHES_1916.length,Math.max(0,state));
export const clampPhi=(phi:number)=>Math.max(0,Math.min(LAST_STATE*STEP,phi));
/** The angle a state's face sits under the window. */
export const phiOf=(state:number)=>Math.max(0,Math.min(LAST_STATE,state))*STEP;
/** A team's three-letter tag (engraved on its peg and the table). */
export const TAG:Record<Team,string>={Uruguay:'URU',Argentina:'ARG',Brazil:'BRA',Chile:'CHI'};
/** Where each team's peg stands on the map plate (longitude, latitude of a point inside the country). */
export const PEG_AT:Record<Team,[number,number]>={Uruguay:[-55.6,-32.6],Argentina:[-64,-37],Brazil:[-50,-12],Chile:[-71,-27]};
/** The six threads between the pegs: everyone plays everyone once, so the threads join every pair (a full round robin). */
export const threadsAt=(played:number)=>MATCHES_1916.slice(0,played).map((m,i)=>({i,a:m.home,b:m.away,now:i===played-1}));

// ---- The timeline rail ------------------------------------------------------------------------------------------------
export const YEAR0=1910,YEAR1=1980;
export const clampYear=(y:number)=>Math.max(YEAR0,Math.min(YEAR1,y));
/** The cups that have dropped into their slots once the carriage has reached `year`. */
export const droppedBy=(year:number)=>CUPS.filter(c=>c.year<=year).map(c=>c.id);
/** What the carriage's window says at a year: the newest cup so far, or how long South America has been alone. */
export function railSay(year:number):string{
 const y=Math.round(year),got=CUPS.filter(c=>c.year<=y);
 if(!got.length)return `${y}: no continent has a cup for national teams yet.`;
 const last=got[got.length-1];
 if(got.length===1)return y-1916?`${y}: still only South America. ${y-1916} ${y-1916===1?'year':'years'} alone so far.`:`1916: the first ${last.short}, in ${last.host}. ${last.winner} won it.`;
 return `${last.year}: the first ${last.short}, in ${last.host}. ${last.winner} won it. ${got.length} of ${CUPS.length} continents.`;
}

// ---- The trophy -------------------------------------------------------------------------------------------------------
export type TrophyPart='cup'|'tier1'|'tier2'|'tier3'|'plaques';
export const TROPHY_PARTS:readonly {id:TrophyPart;name:string;line:string}[]=[
 {id:'cup',name:'Silver cup',line:'Bought in 1916 from a jewellery shop in Buenos Aires, for 3,000 Swiss francs. It is 77 cm tall and weighs 9 kg.'},
 {id:'tier1',name:'Top level',line:'The wooden base has three levels. Before 1979 the cup had no base at all.'},
 {id:'tier2',name:'Middle level',line:'The base grew as the list of winners grew: first one level, then two, now three.'},
 {id:'tier3',name:'Bottom level',line:'The widest level carries the most plaques.'},
 {id:'plaques',name:'Plaques',line:'Small plates engraved with every winner of the competition, back to Uruguay in 1916.'},
];

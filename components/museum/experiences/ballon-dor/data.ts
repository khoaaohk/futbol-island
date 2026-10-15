import type {MuseumSource} from '@/lib/endgame/museum';
/**
 * ballon-dor · the data behind the exhibit (Oct 14 2026). Checked on Oct 14 2026 against Wikipedia's "Ballon d'Or" article (its
 * winners table, read from the page source, and its lead and "Criteria" sections) and "Ballon d'Or Féminin", plus the Lev Yashin
 * and Fabio Cannavaro articles for the only goalkeeper and the three defenders. The 70th award (2026) is not presented until
 * 26 October 2026, so both lists stop at 2025. 2020 was not awarded (COVID-19).
 *
 * Positions: the exhibit only sorts winners into three groups the sources state outright: the one goalkeeper (Yashin, 1963), the
 * defenders (Beckenbauer 1972 and 1976, Sammer 1996, Cannavaro 2006: "only the third of all time after Franz Beckenbauer and
 * Matthias Sammer"), and everyone else as "midfield and attack". Finer splits (is a winger a midfielder?) are left out on purpose.
 */
export type Group='gk'|'df'|'mf';
export type Winner={year:number;name:string;group:Group};
const DF=new Set([1972,1976,1996,2006]),GK=new Set([1963]);
/** Men's winners, 1956 → 2025 (no award in 2020). */
const MEN_RAW:[number,string][]=[
 [1956,'Stanley Matthews'],[1957,'Alfredo Di Stéfano'],[1958,'Raymond Kopa'],[1959,'Alfredo Di Stéfano'],[1960,'Luis Suárez'],[1961,'Omar Sívori'],
 [1962,'Josef Masopust'],[1963,'Lev Yashin'],[1964,'Denis Law'],[1965,'Eusébio'],[1966,'Bobby Charlton'],[1967,'Flórián Albert'],[1968,'George Best'],
 [1969,'Gianni Rivera'],[1970,'Gerd Müller'],[1971,'Johan Cruyff'],[1972,'Franz Beckenbauer'],[1973,'Johan Cruyff'],[1974,'Johan Cruyff'],
 [1975,'Oleg Blokhin'],[1976,'Franz Beckenbauer'],[1977,'Allan Simonsen'],[1978,'Kevin Keegan'],[1979,'Kevin Keegan'],[1980,'Karl-Heinz Rummenigge'],
 [1981,'Karl-Heinz Rummenigge'],[1982,'Paolo Rossi'],[1983,'Michel Platini'],[1984,'Michel Platini'],[1985,'Michel Platini'],[1986,'Igor Belanov'],
 [1987,'Ruud Gullit'],[1988,'Marco van Basten'],[1989,'Marco van Basten'],[1990,'Lothar Matthäus'],[1991,'Jean-Pierre Papin'],[1992,'Marco van Basten'],
 [1993,'Roberto Baggio'],[1994,'Hristo Stoichkov'],[1995,'George Weah'],[1996,'Matthias Sammer'],[1997,'Ronaldo'],[1998,'Zinedine Zidane'],
 [1999,'Rivaldo'],[2000,'Luís Figo'],[2001,'Michael Owen'],[2002,'Ronaldo'],[2003,'Pavel Nedvěd'],[2004,'Andriy Shevchenko'],[2005,'Ronaldinho'],
 [2006,'Fabio Cannavaro'],[2007,'Kaká'],[2008,'Cristiano Ronaldo'],[2009,'Lionel Messi'],[2010,'Lionel Messi'],[2011,'Lionel Messi'],[2012,'Lionel Messi'],
 [2013,'Cristiano Ronaldo'],[2014,'Cristiano Ronaldo'],[2015,'Lionel Messi'],[2016,'Cristiano Ronaldo'],[2017,'Cristiano Ronaldo'],[2018,'Luka Modrić'],
 [2019,'Lionel Messi'],[2021,'Lionel Messi'],[2022,'Karim Benzema'],[2023,'Lionel Messi'],[2024,'Rodri'],[2025,'Ousmane Dembélé'],
];
export const MEN:readonly Winner[]=MEN_RAW.map(([year,name])=>({year,name,group:GK.has(year)?'gk':DF.has(year)?'df':'mf'}));
/** Women's winners, 2018 → 2025 (no award in 2020). All midfielders or forwards. */
export const WOMEN:readonly Winner[]=([[2018,'Ada Hegerberg'],[2019,'Megan Rapinoe'],[2021,'Alexia Putellas'],[2022,'Alexia Putellas'],[2023,'Aitana Bonmatí'],[2024,'Aitana Bonmatí'],[2025,'Aitana Bonmatí']] as [number,string][])
 .map(([year,name])=>({year,name,group:'mf' as const}));
export const FIRST_YEAR=1956,LAST_YEAR=2025,NOT_AWARDED=[2020] as const;
export const GROUPS:readonly {id:Group;label:string;short:string;note:string}[]=[
 {id:'mf',label:'Midfield and attack',short:'Midfield & attack',note:'Most winners make and score goals: that is what the award has mostly rewarded.'},
 {id:'df',label:'Defenders',short:'Defenders',note:'Three defenders have won it: Franz Beckenbauer (twice), Matthias Sammer and Fabio Cannavaro.'},
 {id:'gk',label:'Goalkeeper',short:'Goalkeeper',note:'Lev Yashin, in 1963, is the only goalkeeper ever to win it.'},
];
export const countOf=(g:Group,list:readonly Winner[]=MEN)=>list.filter(w=>w.group===g).length;
export const winsOf=(name:string,list:readonly Winner[])=>list.filter(w=>w.name===name).length;

/** The voters' three criteria (Wikipedia, "Criteria"), word for word. */
export const CRITERIA=['Individual performances, decisive and impressive character','Team performances and achievements','Class and fair play'] as const;
/** Made-up season moments to sort into the criteria (labelled as practice in the exhibit; not real events). */
export const MOMENTS:readonly {text:string;c:0|1|2}[]=[
 {text:'Scores the winning goal in a cup final.',c:0},
 {text:'Her team wins the league.',c:1},
 {text:'Helps an injured opponent up, then plays on fairly.',c:2},
 {text:'A goalkeeper saves two penalties to win a shootout.',c:0},
 {text:'His country wins the World Cup.',c:1},
 {text:'Never argues with the referee all season.',c:2},
];
/** Records, each stated in the sources. */
export const RECORDS:readonly {n:string;label:string}[]=[
 {n:'8',label:'Men’s wins for Lionel Messi, the record'},
 {n:'3',label:'Women’s wins in a row for Aitana Bonmatí, 2023 to 2025: the first player to win it three times'},
 {n:'41',label:'Stanley Matthews’s age when he won the first one in 1956: still the oldest winner'},
 {n:'1995',label:'George Weah of Liberia: the first winner from outside Europe, the year the rules opened up'},
];
export const CHECK=[
 {q:'Who won the very first Ballon d’Or, in 1956?',options:['Stanley Matthews','Lionel Messi','Lev Yashin'],right:0,why:'Stanley Matthews of England, aged 41. He is still the oldest winner.'},
 {q:'How many goalkeepers have won the men’s Ballon d’Or?',options:['None','One: Lev Yashin','Five'],right:1,why:'Lev Yashin in 1963 is the only one. Every position can be great, but it is hardest for keepers to win.'},
 {q:'Which of these is one of the voters’ three things to look for?',options:['The most expensive boots','Class and fair play','Being the tallest'],right:1,why:'Individual performances, team achievements, and class and fair play.'},
] as const;
export const SOURCES:readonly MuseumSource[]=[
 {title:'Wikipedia · Ballon d’Or (winners table, criteria)',url:'https://en.wikipedia.org/wiki/Ballon_d%27Or'},
 {title:'Wikipedia · Ballon d’Or Féminin',url:'https://en.wikipedia.org/wiki/Ballon_d%27Or_F%C3%A9minin'},
 {title:'Wikipedia · Lev Yashin',url:'https://en.wikipedia.org/wiki/Lev_Yashin'},
 {title:'Wikipedia · Fabio Cannavaro',url:'https://en.wikipedia.org/wiki/Fabio_Cannavaro'},
];

// ── The workshop (Oct 14 2026 redo) ──────────────────────────────────────────────────────────────────────────────────────
// The trophy, checked on Oct 14 2026 against the French Wikipedia "Ballon d'or" article ("Le trophée"): made in Paris by the
// jeweller Mellerio dits Meller; it weighs 15 kg; a brass ball fixed in a block of pyrite, which makes every piece unique; about
// six months and 100 hours of work by five craftspeople. The vote (same article): since 2022, 100 journalists, one from each of
// the top 100 countries in the FIFA ranking, each rank a top 10 from a list of 30 named by France Football; 1st = 15 points,
// then 12, 10, 8, 7, 5, 4, 3, 2, 1.
export const TROPHY={kg:15,maker:'Mellerio dits Meller',city:'Paris',hours:100,artisans:5,months:6} as const;
export const TROPHY_LAYERS:readonly {id:'ball'|'block'|'scale';n:number;head:string;text:string}[]=[
 {id:'ball',n:3,head:'The golden ball',text:'A ball made of brass, with the panels of a real football. Made in Paris by the jewellers Mellerio dits Meller.'},
 {id:'block',n:2,head:'The pyrite block',text:'The ball is fixed in a block of pyrite, a shiny stone. No two blocks are the same, so every trophy is unique.'},
 {id:'scale',n:1,head:'On the scale',text:'The whole trophy weighs 15 kg. Five craftspeople spend about 100 hours making one.'},
];
export const POINTS=[15,12,10,8,7,5,4,3,2,1] as const;
export const VOTERS=100,SHORTLIST=30;
/** Points for a place on one journalist's top 10 (1-based). */
export const pointsFor=(place:number)=>place>=1&&place<=10?POINTS[place-1]:0;
/** The eras the tally machine counts through, one pull each. */
export const ERAS:readonly {from:number;to:number;label:string}[]=[
 {from:1956,to:1959,label:'1956–59'},{from:1960,to:1969,label:'1960s'},{from:1970,to:1979,label:'1970s'},{from:1980,to:1989,label:'1980s'},
 {from:1990,to:1999,label:'1990s'},{from:2000,to:2009,label:'2000s'},{from:2010,to:2019,label:'2010s'},{from:2020,to:2025,label:'2020–25'},
];
/** The drums after `pulls` pulls of the lever: men's awards by position and women's awards, counted to the end of that era. */
export function tally(pulls:number){
 const end=pulls<=0?FIRST_YEAR-1:ERAS[Math.min(pulls,ERAS.length)-1].to,men=MEN.filter(w=>w.year<=end);
 return {year:pulls<=0?0:end,mf:men.filter(w=>w.group==='mf').length,df:men.filter(w=>w.group==='df').length,gk:men.filter(w=>w.group==='gk').length,women:WOMEN.filter(w=>w.year<=end).length};
}
export const eraWinners=(i:number)=>{const e=ERAS[i];return {men:MEN.filter(w=>w.year>=e.from&&w.year<=e.to),women:WOMEN.filter(w=>w.year>=e.from&&w.year<=e.to)};};
export const TROPHY_SOURCE:MuseumSource={title:'Wikipédia (French) · Ballon d’or (the trophy and the vote)',url:'https://fr.wikipedia.org/wiki/Ballon_d%27or'};

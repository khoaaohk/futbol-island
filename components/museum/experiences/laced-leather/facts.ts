/**
 * laced-leather · The Weather Machine: every number the experience shows, with where it comes from.
 * The exhibit's own facts (lib/endgame/museum.ts) are quoted word for word in Experience.tsx; these are the added ones.
 */
export type SizeId='5'|'4'|'3';

/** The 2023 lab test: a replica (a copy) of the 1966 leather World Cup ball (Slazenger Challenge) soaked in water for 90 minutes;
 * the 2018 Telstar 18 in the same bucket did not change weight. */
export const LEATHER={dry:410,wet:595,soakMinutes:90,ballYear:1966,labYear:2023} as const;
export const LEATHER_GAIN=LEATHER.wet-LEATHER.dry;// 185 g
export const LEATHER_GAIN_PCT=Math.round(LEATHER_GAIN/LEATHER.dry*100);// 45 %

/** Ball sizes. Size 5 is IFAB Law 2. Sizes 3 and 4 are the usual youth specs (retail size guides; leagues choose the size). */
export const SIZES:Record<SizeId,{name:string;around:string;weight:string;minG:number;maxG:number;cm:number;ages:string;accent:string}>={
 '5':{name:'Size 5',around:'68–70 cm',weight:'410–450 g',minG:410,maxG:450,cm:69,ages:'about 13 and older',accent:'#2e2419'},
 '4':{name:'Size 4',around:'about 63.5–66 cm',weight:'about 350–390 g',minG:350,maxG:390,cm:64.75,ages:'about 8 to 12',accent:'#5b7d99'},
 '3':{name:'Size 3',around:'about 58.5–61 cm',weight:'about 300–320 g',minG:300,maxG:320,cm:59.75,ages:'about 5 to 8',accent:'#b8754a'},
};
export const AGE_CHOICES:{label:string;size:SizeId}[]=[{label:'Age 5–8',size:'3'},{label:'Age 8–12',size:'4'},{label:'Age 13+',size:'5'}];

/**
 * Experiment 4, "Head it" (Oct 9 2026). A wooden head on a spring and a ball on a string: every swing starts at the same peg, so
 * every ball arrives at the same speed and the only thing that changes is its weight. Push = momentum = mass × speed, so the
 * bars are the balls' weights relative to the soaked leather ball (physics, not a measured head acceleration).
 *  - The soaked replica is the lab's 595 g; dry 410 g; a modern size 5 is drawn as 430 g (the middle of Law 2's 410–450 g).
 *  - HEAD_STUDY is the 2023 paper's own result, said simply: the soaked 1966 replica gave higher head responses in slow
 *    headers and lower ones as the headers got faster; dry, the old and new balls were about the same.
 *  - YEATS: Liverpool captain Ron Yeats on heading the lace (LFChistory.net interview, 2007), quoted word for word.
 */
export const HEAD_BALLS={wet:{label:'Soaked leather',g:LEATHER.wet,e:.34},dry:{label:'Dry leather',g:LEATHER.dry,e:.5},modern:{label:'Modern size 5',g:430,e:.62}} as const;
export type HeadBall=keyof typeof HEAD_BALLS;
export const HEAD_MORE_PCT=Math.round((HEAD_BALLS.wet.g/HEAD_BALLS.modern.g-1)*10)*10;// 595/430 → about 40 %
export const YEATS={quote:'The ball had a lace in it and if you headed the lace, you had prints all over your head.',who:'Ron Yeats, Liverpool captain in the 1960s'} as const;
export const HEAD_STUDY='In a 2023 lab test, the soaked copy of the 1966 ball pushed a test head harder in slow headers. In fast headers it squashed more, and the difference went away. Dry, the old and new balls were about the same.';
export const HEAD_PAIN='Heading a leather ball was often painful, and rain made it worse: the wet leather got heavy.';

/** Sources added by this experience (the exhibit's own IFAB + Wikipedia sources are listed too). */
export const EXTRA_SOURCES:{title:string;url:string}[]=[
 {title:'Scientific Reports (2023) · Head trauma analysis of laboratory reconstructed headers using 1966 Slazenger Challenge and 2018 Telstar 18 soccer balls',url:'https://www.nature.com/articles/s41598-023-45489-2'},
 {title:'Size-Charts.com · Soccer ball size guide and dimensions',url:'https://size-charts.com/sports/soccerball-size-guide-and-dimensions/'},
 {title:'Nike Help · What size soccer ball do I need?',url:'https://www.nike.com/help/a/soccer-ball-sizes'},
 {title:'The Soccer Store · What is a size 4 football?',url:'https://www.thesoccerstore.co.uk/blog/football-equipment/what-is-a-size-4-football/'},
 {title:'LFChistory.net · Heads, you lose (Ron Yeats interview)',url:'https://lfchistory.net/articles/4667'},
 {title:'Reading Referees’ Society · A different ball game since Jeff Astle played (Dick Sawdon Smith)',url:'https://www.readingrefs.org.uk/ftm/ftmpages/FTM124.html'},
 {title:'Wikipedia · Slazenger Challenge 4-Star (the 1966 World Cup ball: 25 panels, no laces)',url:'https://en.wikipedia.org/wiki/Slazenger_Challenge_4-Star'},
 {title:'DPMA (German Patent and Trade Mark Office) · History of the football',url:'https://galerie.dpma.de/fussballundtechnik/en/technik/historiedesfussballs/neuzeit.html'},
];

/** The 1966 World Cup ball itself (Slazenger Challenge 4-Star) had no laces: 25 leather panels and a valve. It is the ball the lab
 *  copied because it is the last leather World Cup ball tested this way; the laced balls before it were leather too. */
export const NO_LACES_1966='The real 1966 ball had no laces: you pumped it up through a little valve. But it was still leather, so it drank water just like the laced balls before it.';
/** The story opening (Oct 9 2026 story pass) and the quick check at the end (what the five experiments showed). */
export const OPENING='A rainy Saturday, long ago. Your team’s ball is brown leather, laced up tight. Let’s find out what the rain does to it.';
export const CHECK:readonly {q:string;options:readonly string[];answer:number;why:string}[]=[
 {q:'What happened to a leather ball in the rain?',options:['It got lighter','It soaked up water and got heavier','Nothing at all'],answer:1,
  why:`In the lab, a leather ball went from ${LEATHER.dry} g dry to ${LEATHER.wet} g after ${LEATHER.soakMinutes} minutes in water.`},
 {q:'Same speed, heavier ball. What happens to the push on your head?',options:['A smaller push','The same push','A bigger push'],answer:2,
  why:'More weight at the same speed means more push. That is why heading a soggy leather ball hurt.'},
 {q:'Which ball do most 8 to 12 year olds use?',options:['Size 3','Size 4','Size 5'],answer:1,
  why:`Size 4: ${SIZES['4'].around} around. Size 5 is for about 13 and older. Your league decides, so ask your coach.`},
];

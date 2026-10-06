/**
 * laced-leather · The Weather Machine: every number the experience shows, with where it comes from.
 * The exhibit's own facts (lib/endgame/museum.ts) are quoted word for word in Experience.tsx; these are the added ones.
 */
export type SizeId='5'|'4'|'3';

/** The 2023 lab test: a real 1966 leather World Cup ball (Slazenger Challenge) soaked in water for 90 minutes. */
export const LEATHER={dry:410,wet:595,soakMinutes:90,ballYear:1966,labYear:2023} as const;
export const LEATHER_GAIN=LEATHER.wet-LEATHER.dry;// 185 g
export const LEATHER_GAIN_PCT=Math.round(LEATHER_GAIN/LEATHER.dry*100);// 45 %

/** Ball sizes. Size 5 is IFAB Law 2. Sizes 3 and 4 are the usual youth specs (retail size guides; leagues choose the size). */
export const SIZES:Record<SizeId,{name:string;around:string;weight:string;minG:number;maxG:number;cm:number;ages:string;accent:string}>={
 '5':{name:'Size 5',around:'68–70 cm',weight:'410–450 g',minG:410,maxG:450,cm:69,ages:'about 13 and older',accent:'#1c1f26'},
 '4':{name:'Size 4',around:'about 63.5–66 cm',weight:'about 350–390 g',minG:350,maxG:390,cm:64.75,ages:'about 8 to 12',accent:'#2f6fd0'},
 '3':{name:'Size 3',around:'about 58.5–61 cm',weight:'about 300–320 g',minG:300,maxG:320,cm:59.75,ages:'about 5 to 8',accent:'#e0702a'},
};
export const AGE_CHOICES:{label:string;size:SizeId}[]=[{label:'Age 5–8',size:'3'},{label:'Age 8–12',size:'4'},{label:'Age 13+',size:'5'}];

/** Sources added by this experience (the exhibit's own IFAB + Wikipedia sources are listed too). */
export const EXTRA_SOURCES:{title:string;url:string}[]=[
 {title:'Scientific Reports (2023) · Head trauma analysis of laboratory reconstructed headers using 1966 Slazenger Challenge and 2018 Telstar 18 soccer balls',url:'https://www.nature.com/articles/s41598-023-45489-2'},
 {title:'Size-Charts.com · Soccer ball size guide and dimensions',url:'https://size-charts.com/sports/soccerball-size-guide-and-dimensions/'},
 {title:'Nike Help · What size soccer ball do I need?',url:'https://www.nike.com/help/a/soccer-ball-sizes'},
 {title:'The Soccer Store · What is a size 4 football?',url:'https://www.thesoccerstore.co.uk/blog/football-equipment/what-is-a-size-4-football/'},
];

/**
 * Youth soccer field size guide (Nov 22 2026; /tools/youth-soccer-field-size-guide and its Spanish twin). Pure and import-free
 * (tests/more-tools.cjs checks every number against the source table below). Each figure is kept in the unit its source uses
 * (yards and feet for U.S. Soccer and the Laws of the Game, metres for The FA and futsal) and converted only for display.
 *
 * SOURCES (read Nov 22 2026):
 *  - USSF: U.S. Soccer, Player Development Initiatives (September 2016), Small-Sided Games Chart and the 4v4, 7v7 and 9v9
 *    standards (a state association's copy): 4v4 25-35 x 15-25 yd, goals no larger than 4 x 6 ft, ball 3, no goalkeepers, no
 *    penalty kicks; 7v7 55-65 x 35-45 yd, goals no larger than 6.5 x 18.5 ft, 6.5 x 12 ft recommended, ball 4, build-out lines
 *    "equidistant between the penalty area line and halfway line"; 9v9 70-80 x 45-55 yd, goals no larger than 7 x 21 ft,
 *    6.5 x 18.5 ft recommended, ball 4. https://www.wiyouthsoccer.com/wp-content/uploads/sites/168/2023/06/pdi_final_september_2016.pdf
 *  - LIJSL: Long Island Junior Soccer League's copy of U.S. Soccer's Player Development Initiatives, with the Small-Sided Games
 *    Chart's field markings (the U.S. Soccer document shows them only in a diagram): 7v7 goal box 4 x 8 yd, penalty area
 *    12 x 24 yd, penalty spot 10 yd, center circle 8 yd; 9v9 goal box 5 x 12 yd, penalty area 14 x 36 yd, penalty spot 10 yd,
 *    center circle 8 yd. https://lijsoccer.com/wp-content/uploads/2020/09/U9-U10-Player-Development-Initiatives.pdf
 *  - FA: England Football, Future Fit, "What are pitch and goal sizes for the different age groups?": 5v5 (U8, U9) 37 x 27 m
 *    recommended, 27 x 18 m minimum, goal 12 x 6 ft, ball 3; 7v7 (U10, U11) 55 x 37 m, minimum 46 x 27 m, goal 12 x 6 ft,
 *    ball 3; 9v9 (U12, U13) 73 x 46 m, minimum 64 x 37 m, goal 16 x 7 ft, ball 4.
 *    https://futurefit.englandfootball.com/futurefit/faqs/what-are-pitch-and-goal-sizes-for-the-different-age-groups/index.html
 *  - IFAB: Laws of the Game, Law 1 (non-international: touchline 100-130 yd / 90-120 m, goal line 50-100 yd / 45-90 m; goal
 *    area 6 yd / 5.5 m and penalty area 18 yd / 16.5 m from the inside of each post and into the field; penalty mark
 *    12 yd / 11 m; centre circle 10 yd / 9.15 m; goal 8 yd / 7.32 m by 8 ft / 2.44 m). https://www.theifab.com/laws/latest/the-field-of-play/
 *    Widths of the two areas are arithmetic: 8 + 2 x 18 = 44 yd and 8 + 2 x 6 = 20 yd.
 *  - USYS: US Youth Soccer Policy on Players and Playing Rules (Dec 5 2025), Rule 303: ball 5 from 13U (lib/site/sizes.ts).
 *  - FUTSAL: FIFA Futsal Laws of the Game, Law 1 and Law 2 as published by The FA: touch line 25-42 m and goal line 16-25 m
 *    (international 38-42 m and 20-25 m); goals 3 x 2 m (inside); penalty area of two 6 m lines from the outside of each post
 *    with quarter circles joined by a 3.16 m line (so 6 m deep and 3.16 + 2 x 6 = 15.16 m wide); penalty mark 6 m, second
 *    mark 10 m; centre circle 3 m; ball 62-64 cm, 400-440 g. https://www.thefa.com/football-rules-governance/lawsandrules/laws/futsal/law-1---the-pitch
 *    and https://www.thefa.com/football-rules-governance/lawsandrules/laws/futsal/law-2---the-ball
 * NOT stated (not found in a source): markings for 4v4 and 5v5 (none are required: 4v4 has no goalkeepers and no penalty
 * kicks), goal sizes for futsal for children, field sizes for leagues outside the US and England.
 */
export type FormatId='4v4'|'5v5'|'7v7'|'9v9'|'11v11'|'futsal';
export type Unit='yd'|'m';
export type Area={depth:number;width:number};
export type FieldFormat={id:FormatId;unit:Unit;ages:{us?:string;en?:string};length:readonly [number,number];width:readonly [number,number];
 recommended?:{length:number;width:number};goal:{w:number;h:number;u:'ft'|'m'};goalRec?:{w:number;h:number};ball:string;keepers:boolean;
 goalArea?:Area;penaltyArea?:Area;penaltyMark?:number;secondMark?:number;circle?:number;buildOut?:boolean;sources:readonly string[];
 alt?:{label:'fa';unit:Unit;length:readonly [number,number];recommended:{length:number;width:number};width:readonly [number,number];goal:{w:number;h:number;u:'ft'};ball:string;ages:string}};
export const FORMATS:readonly FieldFormat[]=[
 {id:'4v4',unit:'yd',ages:{us:'U6 to U8'},length:[25,35],width:[15,25],goal:{w:6,h:4,u:'ft'},ball:'3',keepers:false,sources:['ussf']},
 {id:'5v5',unit:'m',ages:{en:'U8 and U9'},length:[27,37],width:[18,27],recommended:{length:37,width:27},goal:{w:12,h:6,u:'ft'},ball:'3',keepers:true,sources:['fa']},
 {id:'7v7',unit:'yd',ages:{us:'U9 and U10',en:'U10 and U11'},length:[55,65],width:[35,45],goal:{w:18.5,h:6.5,u:'ft'},goalRec:{w:12,h:6.5},ball:'4',keepers:true,
  goalArea:{depth:4,width:8},penaltyArea:{depth:12,width:24},penaltyMark:10,circle:8,buildOut:true,sources:['ussf','lijsl','fa'],
  alt:{label:'fa',unit:'m',length:[46,55],width:[27,37],recommended:{length:55,width:37},goal:{w:12,h:6,u:'ft'},ball:'3',ages:'U10 and U11'}},
 {id:'9v9',unit:'yd',ages:{us:'U11 and U12',en:'U12 and U13'},length:[70,80],width:[45,55],goal:{w:21,h:7,u:'ft'},goalRec:{w:18.5,h:6.5},ball:'4',keepers:true,
  goalArea:{depth:5,width:12},penaltyArea:{depth:14,width:36},penaltyMark:10,circle:8,sources:['ussf','lijsl','fa'],
  alt:{label:'fa',unit:'m',length:[64,73],width:[37,46],recommended:{length:73,width:46},goal:{w:16,h:7,u:'ft'},ball:'4',ages:'U12 and U13'}},
 {id:'11v11',unit:'yd',ages:{us:'U13 and up'},length:[100,130],width:[50,100],goal:{w:24,h:8,u:'ft'},ball:'5',keepers:true,
  goalArea:{depth:6,width:20},penaltyArea:{depth:18,width:44},penaltyMark:12,circle:10,sources:['ifab','usys']},
 {id:'futsal',unit:'m',ages:{},length:[25,42],width:[16,25],goal:{w:3,h:2,u:'m'},ball:'futsal',keepers:true,
  penaltyArea:{depth:6,width:15.16},penaltyMark:6,secondMark:10,circle:3,sources:['futsal']},
];
export const formatById=(id:string)=>FORMATS.find(f=>f.id===id);
export const YD=0.9144,FT=0.3048;
/** A length in the format's own unit, shown in `to` (yards or metres), rounded for a tape measure. */
export function show(v:number,from:Unit,to:Unit){const x=from===to?v:from==='yd'?v*YD:v/YD;return to==='m'?Math.round(x*10)/10:Math.round(x*2)/2;}
/** A goal size in feet or metres, shown in feet (yards view) or metres. */
export function showGoal(v:number,u:'ft'|'m',to:Unit){if(to==='yd')return u==='ft'?v:Math.round(v/FT*2)/2;return u==='m'?v:Math.round(v*FT*100)/100;}
/** Where the build-out line sits, from the goal line: halfway between the penalty area line and the halfway line. */
export const buildOutAt=(length:number,penaltyDepth:number)=>(penaltyDepth+length/2)/2;
/** The default field the guide draws: the recommended size where the source gives one, else the middle of the range. */
export const defaultSize=(f:FieldFormat)=>f.recommended??{length:(f.length[0]+f.length[1])/2,width:(f.width[0]+f.width[1])/2};
export const clampSize=(f:FieldFormat,l:number,w:number)=>{const L=Math.min(f.length[1],Math.max(f.length[0],l)),W=Math.min(f.width[1],Math.max(f.width[0],w,0));return {length:L,width:Math.min(W,L)};};
export type ConeStep={id:'corners'|'square'|'halfway'|'goals'|'penalty'|'goalArea'|'marks'|'buildOut'|'circle';cones:number;a?:number;b?:number};
/** How to mark this field with cones, in order, with the cones each step uses. Distances in the format's own unit. */
export function conePlan(f:FieldFormat,length:number,width:number):{steps:ConeStep[];total:number}{
 const s:ConeStep[]=[{id:'corners',cones:4,a:length,b:width},{id:'square',cones:0,a:length,b:width},{id:'halfway',cones:3,a:length/2}];
 s.push({id:'goals',cones:f.id==='4v4'||f.id==='5v5'?4:0,a:showGoal(f.goalRec?.w??f.goal.w,f.goal.u,f.unit)});
 if(f.penaltyArea)s.push({id:'penalty',cones:8,a:f.penaltyArea.depth,b:(width-f.penaltyArea.width)/2});
 if(f.goalArea)s.push({id:'goalArea',cones:4,a:f.goalArea.depth,b:(width-f.goalArea.width)/2});
 if(f.penaltyMark)s.push({id:'marks',cones:f.secondMark?4:2,a:f.penaltyMark,b:f.secondMark});
 if(f.buildOut&&f.penaltyArea)s.push({id:'buildOut',cones:4,a:buildOutAt(length,f.penaltyArea.depth)});
 if(f.circle)s.push({id:'circle',cones:4,a:f.circle});
 return {steps:s,total:s.reduce((a,x)=>a+x.cones,0)};
}
/** The diagonal of the field, for checking the corners are square (it should match within a step or two). */
export const diagonal=(l:number,w:number)=>Math.round(Math.hypot(l,w)*10)/10;

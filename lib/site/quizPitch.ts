/**
 * The quiz pages' "spot" questions (Nov 23 2026, owner: "build more interactive quizzes"): tap the right place on a small pitch.
 * One drawing for the /learn/quizzes pages and the lesson pages, in the lesson data's own 270x400 space (x across, y down; the gold
 * team attacks up, toward y=0, so "our" goal is at the bottom). The line sizes per format are the game's mini pitch
 * (components/VisualQuestion.tsx PITCH), so a lesson's spot sits where the game draws it. Pure data, no React.
 */
export type Pt={x:number;y:number};
export type PitchFormat='futsal'|'7v7'|'9v9'|'11v11';
export type Geometry={boxD:number;boxW:number;goalW:number;smallD?:number;smallW?:number;circle:number;round?:boolean};
export const PITCH:Readonly<Record<PitchFormat,Geometry>>={futsal:{boxD:60,boxW:205,goalW:40,circle:34,round:true},'7v7':{boxD:78,boxW:160,goalW:40,circle:40},
 '9v9':{boxD:70,boxW:190,goalW:38,smallD:26,smallW:90,circle:40},'11v11':{boxD:63,boxW:160,goalW:30,smallD:21,smallW:73,circle:36}};
/** A player on the drawing: gold is the child's team. `label` is drawn on the disc; `focus` gets a ring. */
export type SpotPlayer=Pt&{gold:boolean;label?:string;focus?:boolean};
/** What QuizPlay draws: the pitch crop, the players and ball, and one numbered target per answer option (same order). */
export type SpotPic={format:PitchFormat;view:{x:number;y:number;w:number;h:number};players:SpotPlayer[];ball?:Pt;at:Pt[];alt:string};

/** The usual crops: the whole pitch, our half (bottom), or the half we attack (top). */
export const VIEWS={full:{x:-8,y:-8,w:286,h:416},own:{x:-8,y:180,w:286,h:228},top:{x:-8,y:-8,w:286,h:228}} as const;
export type ViewName=keyof typeof VIEWS;

/** Named places on an 11v11 drawing (our goal at the bottom). */
export const PLACE={
 ownGoalArea:{x:135,y:385},ownPenMark:{x:135,y:354},ownBoxEdge:{x:135,y:326},ownCornerL:{x:9,y:391},ownCornerR:{x:261,y:391},
 topGoalArea:{x:135,y:15},topPenMark:{x:135,y:46},topBoxEdge:{x:135,y:74},topCornerL:{x:9,y:9},topCornerR:{x:261,y:9},
 centre:{x:135,y:200},halfwayL:{x:40,y:200},halfwayR:{x:230,y:200},touchL:{x:5,y:290},touchR:{x:265,y:290},touchTopL:{x:5,y:110},
 ownGoalLineL:{x:60,y:396},topGoalLineR:{x:210,y:4},ownThird:{x:135,y:300},topThird:{x:135,y:110}} as const;
export type PlaceName=keyof typeof PLACE;

/** Gold team shapes (our goal at the bottom; the team's left is the drawing's left). Ids follow the lesson data. */
export const SHAPES:Readonly<Record<string,Readonly<Record<string,Pt>>>>={
 '4-3-3':{gk:{x:135,y:376},lb:{x:42,y:312},lcb:{x:102,y:330},rcb:{x:168,y:330},rb:{x:228,y:312},dm:{x:135,y:276},lcm:{x:84,y:240},rcm:{x:186,y:240},lw:{x:44,y:160},st:{x:135,y:140},rw:{x:226,y:160}},
 '4-4-2':{gk:{x:135,y:376},lb:{x:42,y:314},lcb:{x:102,y:330},rcb:{x:168,y:330},rb:{x:228,y:314},lm:{x:42,y:236},lcm:{x:106,y:250},rcm:{x:164,y:250},rm:{x:228,y:236},ls:{x:106,y:156},rs:{x:164,y:156}},
 '3-5-2':{gk:{x:135,y:376},lcb:{x:78,y:326},cb:{x:135,y:334},rcb:{x:192,y:326},lwb:{x:32,y:236},lcm:{x:96,y:246},dm:{x:135,y:280},rcm:{x:174,y:246},rwb:{x:238,y:236},ls:{x:106,y:156},rs:{x:164,y:156}},
 '2-3-1':{gk:{x:135,y:376},lb:{x:88,y:316},rb:{x:182,y:316},lm:{x:44,y:236},cm:{x:135,y:250},rm:{x:226,y:236},st:{x:135,y:150}},
 '3-2-3':{gk:{x:135,y:376},lb:{x:60,y:312},cb:{x:135,y:326},rb:{x:210,y:312},lcm:{x:100,y:250},rcm:{x:170,y:250},lw:{x:46,y:170},st:{x:135,y:150},rw:{x:224,y:170}}};

/** Build a SpotPic from compact bank data: places by name or [x,y], an optional gold shape (ids listed in `hide` are left out). */
/** `extra`: more players as [x, y, team], e.g. the blue attacker a defender must stand goal-side of. */
export type BankSpot={at:readonly (PlaceName|string|readonly [number,number])[];view?:ViewName;format?:PitchFormat;shape?:string;hide?:readonly string[];labels?:boolean;ball?:PlaceName|readonly [number,number];
 extra?:readonly [number,number,'gold'|'blue'][];alt:string};
const pt=(p:PlaceName|string|readonly [number,number],shape?:Readonly<Record<string,Pt>>):Pt=>{
 if(typeof p!=='string')return {x:p[0],y:p[1]};
 const named=(PLACE as Record<string,Pt>)[p]??shape?.[p];if(!named)throw new Error(`lib/site/quizPitch.ts: unknown place "${p}"`);return {...named};};
export function spotPic(s:BankSpot):SpotPic{
 const shape=s.shape?SHAPES[s.shape]:undefined;if(s.shape&&!shape)throw new Error(`lib/site/quizPitch.ts: unknown shape ${s.shape}`);
 const players:SpotPlayer[]=shape?Object.entries(shape).filter(([id])=>!s.hide?.includes(id)).map(([id,p])=>({...p,gold:true,...(s.labels?{label:id==='gk'?'GK':''}:{})})):[];
 for(const [x,y,t] of s.extra??[])players.push({x,y,gold:t==='gold'});
 return {format:s.format??'11v11',view:{...VIEWS[s.view??'full']},players,...(s.ball?{ball:pt(s.ball)}:{}),at:s.at.map(p=>pt(p,shape)),alt:s.alt};
}

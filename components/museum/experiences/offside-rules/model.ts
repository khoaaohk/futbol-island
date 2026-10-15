/**
 * offside-rules · THE OFFSIDE LINE MACHINE, its rules as pure functions (Oct 14 2026 redo; tested by
 * tests/museum-exp-offside-rules.cjs in Node). Every rule is checked against Wikipedia "Offside (association football)", which
 * quotes the FA's 1863 and 1866 texts, and IFAB Law 11.
 *
 * The machine judges ONE moment, the pass, with a stack of RULE CAMS on a spindle inside its "judge" drum. The era dial decides
 * which cams sit in the stack (a cam that is not part of that era's law slides out of the drum):
 *  - BALL cam (every era): are you nearer their goal line than the ball? If not, you are onside.
 *  - COUNT wheel (from 1866): how many opponents are between you and their goal line? 1866: you need 3. 1925: you need 2.
 *    In 1863 there was no count at all: in front of the ball = out of play.
 *  - HALFWAY stop (from 1907): you can't be offside in your own half.
 *  - LEVEL shim (from 1990): a defender LEVEL with you counts for you, so level with the second-last opponent is onside.
 *    Before 1990, level did not count as "between", so level was offside.
 * Board units: x from the attackers' own goal line (0) to the goal they attack (100); halfway = 50. Positions are along the
 * pitch only (each player rides their own rail on the machine).
 */
export type Era='1863'|'1866'|'1907'|'1925'|'1990';
export type CamId='ball'|'count'|'half'|'level';
export const HALF=50;
/** "Level": closer than this along the pitch is the same line (about a stride). Dragging snaps to it. */
export const LEVEL=1.2;
export const ERAS:readonly {id:Era;year:string;tab:string;head:string;rule:string;need:number|null;cams:readonly CamId[]}[]=[
 {id:'1863',year:'1863',tab:'1863',head:'In front of the ball = out',need:null,cams:['ball'],
  rule:'When a teammate kicks the ball, anyone nearer the opponents’ goal line than the ball is out of play.'},
 {id:'1866',year:'1866',tab:'1866',head:'Three opponents',need:3,cams:['ball','count'],
  rule:'In front of the ball you need at least three opponents between you and their goal line.'},
 {id:'1907',year:'1907',tab:'1907',head:'Not in your own half',need:3,cams:['ball','count','half'],
  rule:'Still three opponents, but now nobody can be offside in their own half.'},
 {id:'1925',year:'1925',tab:'1925',head:'Two opponents',need:2,cams:['ball','count','half'],
  rule:'Three became two: you need two opponents between you and their goal line.'},
 {id:'1990',year:'1990',tab:'1990–now',head:'Level is onside',need:2,cams:['ball','count','half','level'],
  rule:'Two opponents, and now level with the second-last opponent is onside. This is still the law today.'},
];
export const eraOf=(id:Era)=>ERAS.find(e=>e.id===id)!;
/** The cams bottom to top in the drum. */
export const CAMS:readonly CamId[]=['ball','count','half','level'];
export const camIn=(era:Era,cam:CamId)=>eraOf(era).cams.includes(cam);

/** The era dial: five detents, the pointer angle in degrees (0 = straight at the bench, clockwise from above). */
export const DIAL_DEG:readonly number[]=[-80,-40,0,40,80];
export const dialAngle=(era:Era)=>DIAL_DEG[ERAS.findIndex(e=>e.id===era)];
/** The nearest detent to a free angle (drag), clamped to the dial's end stops. */
export function detentOf(deg:number):Era{let best=0,bd=1e9;DIAL_DEG.forEach((d,i)=>{const x=Math.abs(d-deg);if(x<bd){bd=x;best=i;}});return ERAS[best].id;}
/** One click of the dial (arrow keys): -1 back in time, +1 forward. */
export const stepEra=(era:Era,dir:-1|1):Era=>ERAS[Math.max(0,Math.min(ERAS.length-1,ERAS.findIndex(e=>e.id===era)+dir))].id;

export type Scene={ball:number;att:number;defs:readonly number[]};
export type CamResult={cam:CamId;/** this cam alone says "onside" */clears:boolean;say:string};
export type Verdict={era:Era;offside:boolean;reason:string;
 /** where the laser line sits (board x): the ball (1863), or the opponent you must stay behind, never before halfway once the
  *  halfway stop is in */
 line:number;between:number;level:boolean;ahead:boolean;ownHalf:boolean;cams:CamResult[]};
const sortedDefs=(defs:readonly number[])=>[...defs].sort((a,b)=>b-a);
/** The second-last opponent's x (the goalkeeper is usually the last). */
export const secondLast=(defs:readonly number[])=>sortedDefs(defs)[1]??0;
const plural=(n:number,one:string,many:string)=>`${n} ${n===1?one:many}`;

export function judge(era:Era,s:Scene):Verdict{
 const E=eraOf(era),a=s.att,ahead=a-s.ball>LEVEL,ownHalf=a<=HALF,sl=secondLast(s.defs),level=Math.abs(a-sl)<=LEVEL;
 const withLevel=camIn(era,'level');
 // "Between": strictly nearer their goal line. With the level shim in, a defender level with you counts too.
 const between=s.defs.filter(d=>withLevel?d-a>=-LEVEL:d-a>LEVEL).length;
 const need=E.need;
 const cams:CamResult[]=[];
 cams.push({cam:'ball',clears:!ahead,say:ahead?'In front of the ball':'Not in front of the ball'});
 if(camIn(era,'count'))cams.push({cam:'count',clears:between>=need!,say:`${plural(between,'opponent',`opponents`)} between · needs ${need}`});
 if(camIn(era,'half'))cams.push({cam:'half',clears:ownHalf,say:ownHalf?'In your own half':'In their half'});
 if(withLevel)cams.push({cam:'level',clears:level&&ahead&&!ownHalf,say:level?'Level counts as onside':'Not level'});
 let line=era==='1863'?s.ball:Math.max(sortedDefs(s.defs)[need!-1]??0,s.ball);
 if(camIn(era,'half'))line=Math.max(line,HALF);
 const base={era,line,between,level,ahead,ownHalf,cams};
 if(!ahead)return {...base,offside:false,reason:era==='1863'?'Not in front of the ball, so fine in 1863.':'Not in front of the ball: always onside.'};
 if(era==='1863')return {...base,offside:true,reason:'In 1863 anyone in front of the ball was out of play. There was no counting at all.'};
 if(ownHalf&&camIn(era,'half'))return {...base,offside:false,reason:'In their own half: never offside (a rule since 1907).'};
 if(between>=need!){
  if(withLevel&&level&&between===need)return {...base,offside:false,reason:'Level with the second-last defender. Since 1990, level is onside.'};
  return {...base,offside:false,reason:`${plural(between,'opponent is','opponents are')} between the striker and the goal line. The ${E.year} law needs ${need}.`};}
 return {...base,offside:true,reason:`Only ${plural(between,'opponent is','opponents are')} between the striker and the goal line${level&&!withLevel?' (level did not count before 1990)':''}. The ${E.year} law needs ${need}.`};
}
export const judgeAll=(s:Scene)=>ERAS.map(e=>judge(e.id,s));

/** Dragging the striker: within LEVEL of a defender (or the ball) it snaps level, so "exactly level" is easy with a finger. */
export function snapLevel(x:number,s:Scene):number{
 let best:number|null=null,bd=LEVEL;for(const v of [...s.defs,s.ball]){const d=Math.abs(x-v);if(d<=bd){bd=d;best=v;}}
 return best??x;
}
/** Every carriage stops at its end stops: halfway-ish (the bench starts at 40) and the goal line. */
export const RAIL={min:40,max:100} as const;
export const clampRail=(x:number)=>Math.max(RAIL.min,Math.min(RAIL.max,x));

/** The things to do (each ticked when a pass is played from a position that passes its test, or when the judge is opened). */
export type TaskId='today-off'|'level'|'1925'|'open';
export type Task={id:TaskId;ask:string;done:string;test?:(s:Scene)=>boolean};
export const TASKS:readonly Task[]=[
 {id:'today-off',ask:'Turn the dial to 1990–now. Slide the striker so the flag goes UP, then pull the pass lever.',done:'Offside today: in their half, nearer the goal line than the ball and the second-last defender.',
  test:s=>judge('1990',s).offside},
 {id:'level',ask:'Stand the striker exactly level with the second-last defender (it clicks), then pass. Try it in 1925 and 1990.',done:'Level: offside in 1925, onside since 1990. That is the level shim.',
  test:s=>{const t=judge('1990',s);return t.level&&t.ahead&&!t.ownHalf&&!t.offside&&judge('1925',s).offside;}},
 {id:'1925',ask:'Find a spot that was OFFSIDE in 1866 but ONSIDE in 1925, then pass.',done:'That is the space the 1925 change opened up. Goals jumped the next season.',
  test:s=>judge('1866',s).offside&&!judge('1925',s).offside},
 {id:'open',ask:'Pull the “Open the judge” slider and look at the cams inside.',done:'Four cams, added one law at a time. The dial swaps them.'},
];
/** The start: onside today, offside only under the strict 1863 law. Defenders: goalkeeper, then three. */
export const START:Scene={ball:56,att:66,defs:[96,80,74,70]};
export const DEF_NAMES=['Goalkeeper','Defender 1','Defender 2','Defender 3'];

/** Pass timing (seconds): the lever swings, the ball rolls, each cam in the stack clicks, the flag. */
export const PASS={lever:.22,roll:.6,cam:.16,flag:.3} as const;
export const passLength=(cams:number)=>PASS.lever+PASS.roll+cams*PASS.cam+PASS.flag;
/** Where in the pass sequence we are at time t (for the drawing and the tests). */
export function passAt(t:number,cams:number){
 const lever=Math.min(1,t/PASS.lever),back=t<PASS.lever?lever:Math.max(0,1-(t-PASS.lever)/.3);
 const roll=Math.max(0,Math.min(1,(t-PASS.lever)/PASS.roll));
 const c0=PASS.lever+PASS.roll,lit=Math.max(0,Math.min(cams,Math.floor((t-c0)/PASS.cam)+ (t>=c0?1:0)));
 const flag=Math.max(0,Math.min(1,(t-c0-cams*PASS.cam)/PASS.flag));
 return {lever:back,roll,lit,flag,done:t>=passLength(cams)};
}
/** The breakdown: how far apart the judge is (0 assembled, 1 open). */
export const OPEN_AT=.3;

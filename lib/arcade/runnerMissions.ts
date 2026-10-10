import type {RunnerGame} from './runnerGame';

/**
 * Breakaway Run missions: three football goals at a time (one star each), in the
 * style of goal-based progression in endless runners. Every mission names a real
 * skill or decision. Completing a set of three unlocks a ball with a true story.
 * Earned only by playing: no purchases, no randomness, no streak pressure.
 * Storage is written only when a mission completes (never per frame).
 */
export type RunnerMissionId='goals2'|'skill1'|'stage2'|'hurdle'|'onetwo'|'near3'|'puddle'|'corner'|'boss'|'skillKinds'|'closer'|'chip'|'cross'|'round'|'shield'|'goals5'|'middle'|'stage5'|'inside3'|'downhill'|'stage6'|'beatScore'|'perfect3'|'clean3';
type Mission={label:string;target:number;value:(s:RunnerGame)=>number};
export const RUNNER_MISSIONS:Record<RunnerMissionId,Mission>={
 goals2:{label:'Score 2 goals',target:2,value:s=>s.goals},
 skill1:{label:'Beat a defender with a skill move',target:1,value:s=>s.skills},
 stage2:{label:'Reach stage 2',target:2,value:s=>s.level},
 hurdle:{label:'Jump a low slide tackle',target:1,value:s=>s.hurdles},
 onetwo:{label:'Play a one-two with a teammate',target:1,value:s=>s.oneTwos},
 near3:{label:'Beat 3 tackles by cutting away late',target:3,value:s=>s.nearMisses},
 puddle:{label:'Lift the ball over a puddle',target:1,value:s=>s.puddleJumps},
 corner:{label:'Score in the corner, away from the keeper',target:1,value:s=>s.cornerGoals},
 boss:{label:'Beat the back line',target:1,value:s=>s.bosses},
 skillKinds:{label:'Use 3 different skill moves',target:3,value:s=>s.skillKinds.length},
 closer:{label:'Beat a defender who closes the gap',target:1,value:s=>s.closersBeaten},
 chip:{label:'Chip a keeper who rushes out',target:1,value:s=>s.chips},
 cross:{label:'Volley in a cross from the wing',target:1,value:s=>s.headers},
 round:{label:'Go round a rushing keeper',target:1,value:s=>s.rounded},
 shield:{label:'Ride a tackle with your power run',target:1,value:s=>s.shieldSaves},
 goals5:{label:'Score 5 goals in one run',target:5,value:s=>s.goals},
 middle:{label:'Take the route through the middle',target:1,value:s=>s.middleRuns},
 stage5:{label:'Reach stage 5',target:5,value:s=>s.level},
 // Hills and bends (Oct 9 2026): the short way round, and calm feet when the slope speeds you up.
 inside3:{label:'Cut inside on 3 bends',target:3,value:s=>s.insideCuts},
 downhill:{label:'Beat a tackle running downhill',target:1,value:s=>s.downhillBeats},
 stage6:{label:'Reach stage 6',target:6,value:s=>s.level},
 // The lesson in one move (Oct 9 2026): beat a defender, then finish within a few seconds.
 beatScore:{label:'Beat a defender, then score straight away',target:1,value:s=>s.beatScores},
 perfect3:{label:'Time 3 PERFECT skill moves',target:3,value:s=>s.perfectSkills},
 clean3:{label:'Reach stage 3 without losing a chance',target:3,value:s=>s.cleanStage},
};
export const RUNNER_MISSION_SETS:readonly (readonly RunnerMissionId[])[]=[
 ['goals2','skill1','stage2'],['hurdle','onetwo','near3'],['puddle','corner','boss'],
 ['skillKinds','closer','chip'],['cross','round','shield'],['goals5','middle','stage5'],
 ['inside3','downhill','stage6'],['beatScore','perfect3','clean3'],
];
/** Cosmetic balls, each with a true piece of football history or kit knowledge. */
export const RUNNER_BALLS=[
 {id:'classic',name:'Island ball',base:'#fff8e3',patch:'#294c49',fact:'Your island match ball.'},
 {id:'laced',name:'Laced leather ball',base:'#8a5a35',patch:'#5e3a20',fact:'Early footballs were leather with a lace. In the rain they soaked up water and got heavy.'},
 {id:'panels',name:'Black-and-white panel ball',base:'#ffffff',patch:'#151515',fact:'Black-and-white panel balls were made so the ball was easy to see on black-and-white TV.'},
 {id:'winter',name:'Winter orange ball',base:'#ff8a1f',patch:'#6e2a00',fact:'Bright orange or yellow balls are used on snowy pitches so everyone can see them.'},
 {id:'futsal',name:'Futsal ball',base:'#2f6fd6',patch:'#ffd23f',fact:'A futsal ball is smaller and bounces less, for quick passing on hard courts.'},
 {id:'legend',name:'Island legend ball',base:'#ffd36e',patch:'#a8741f',fact:'Earned by finishing every mission set. Well played!'},
] as const;
export type RunnerProgress={set:number;done:RunnerMissionId[];stars:number};
const KEY='fi2-runner-missions-v1';
let cache:RunnerProgress|null=null;
export function readRunnerProgress():RunnerProgress{
 if(cache)return cache;
 let value:RunnerProgress={set:0,done:[],stars:0};
 try{const raw=typeof localStorage!=='undefined'?localStorage.getItem(KEY):null;if(raw){const v=JSON.parse(raw);if(Number.isInteger(v?.set)&&Array.isArray(v?.done))value={set:Math.max(0,v.set),done:v.done.filter((id:string)=>id in RUNNER_MISSIONS),stars:Math.max(0,Number(v.stars)||0)};}}catch{/* storage optional */}
 return cache=value;
}
function save(p:RunnerProgress){cache=p;try{localStorage.setItem(KEY,JSON.stringify(p));}catch{/* storage optional */}}
/** Test hook: forget the cached progress (and optionally set it). */
export function resetRunnerProgress(p?:RunnerProgress){cache=p?{...p,done:[...p.done]}:null;}
export const runnerMissionSet=(set:number)=>RUNNER_MISSION_SETS[set%RUNNER_MISSION_SETS.length];
/** Ball unlocked count: one per completed set, capped at the catalogue. */
export const runnerBallFor=(p:RunnerProgress)=>RUNNER_BALLS[Math.min(RUNNER_BALLS.length-1,p.set)];
type RunState={set:number;ids:readonly RunnerMissionId[];earned:RunnerMissionId[]};
const runs=new WeakMap<RunnerGame,RunState>();
function run(s:RunnerGame){let r=runs.get(s);if(!r){const p=readRunnerProgress();r={set:p.set,ids:runnerMissionSet(p.set),earned:[]};runs.set(s,r);}return r;}
/** Called once per simulation frame. Completing a mission adds a star and a message;
 * finishing all three moves to the next set (used from the next run) and unlocks a ball. */
export function tickRunnerMissions(s:RunnerGame){
 if(s.lives<=0)return;const r=run(s),p=readRunnerProgress();
 if(p.set!==r.set)return;
 // Never talk over a fresh teaching moment (a skill name, a goal): announce once it has been read.
 if(s.eventKind!=='mission'&&s.time-s.eventAt<1.2)return;
 for(const id of r.ids){if(p.done.includes(id))continue;const m=RUNNER_MISSIONS[id];if(m.value(s)<m.target)continue;
  const done=[...p.done,id],complete=done.length>=r.ids.length,next:RunnerProgress={set:complete?p.set+1:p.set,done:complete?[]:done,stars:p.stars+1};
  r.earned.push(id);save(next);
  const ball=complete?RUNNER_BALLS[Math.min(RUNNER_BALLS.length-1,next.set)]:null;
  s.event++;s.eventKind='mission';s.eventX=s.x;s.eventZ=0;s.eventAt=s.time;
  s.message=ball?`★ MISSION SET COMPLETE! New ball unlocked: ${ball.name}.`:`★ MISSION: ${m.label}!`;
  return;}
}
/** Short line for the full-time card. */
export function runnerMissionSummary(s:RunnerGame){const r=run(s),p=readRunnerProgress();const total=r.set===p.set?p.done.length:3;return `★ ${r.earned.length} this run · set ${r.set+1}: ${total}/3`;}
/** Mission rows for the ready and full-time cards (true = done). */
export function runnerMissionRows(s?:RunnerGame):{label:string;done:boolean;progress:string}[]{
 const p=readRunnerProgress(),r=s?runs.get(s):undefined,ids=r?.ids??runnerMissionSet(p.set),set=r?.set??p.set;
 return ids.map(id=>{const m=RUNNER_MISSIONS[id],done=set===p.set?p.done.includes(id):true,value=s?Math.min(m.target,m.value(s)):0;return{label:m.label,done,progress:m.target>1&&!done&&s?`${value}/${m.target}`:''};});
}

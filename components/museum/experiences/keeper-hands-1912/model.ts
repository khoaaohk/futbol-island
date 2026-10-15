/**
 * keeper-hands-1912 · where a goalkeeper may use their hands (pure, tested by tests/museum-exp-keeper-hands-1912.cjs).
 *
 * The half pitch, in metres: x across (−34 … 34, the goal's centre at 0), y out from the keeper's own goal line (0 … 52.5, the
 * halfway line). The penalty area is 16.5 m out from each goalpost (IFAB Law 1), so it is 40.32 m wide and 16.5 m deep. Lines
 * belong to the area they mark (Law 1), so a keeper standing on the line is inside.
 *  - Before 1912 (the 1887–1912 Laws): a goalkeeper could handle the ball anywhere in their own half.
 *  - From 1912 (still the Law today, Law 12): only inside their own penalty area.
 */
export const HALF={w:68,d:52.5} as const;
export const GOAL_W=7.32,BOX={hw:GOAL_W/2+16.5,d:16.5} as const,SIX={hw:GOAL_W/2+5.5,d:5.5} as const,SPOT=11;
export type Era='before'|'after';
export const ERA_NAME:Record<Era,string>={before:'Before 1912',after:'From 1912'};
export type Zone='box'|'half'|'out';

export const clampToHalf=(x:number,y:number):[number,number]=>[Math.max(-HALF.w/2,Math.min(HALF.w/2,x)),Math.max(0,Math.min(HALF.d,y))];
const EPS=1e-9;
export const inBox=(x:number,y:number)=>Math.abs(x)<=BOX.hw+EPS&&y>=-EPS&&y<=BOX.d+EPS;
export const inHalf=(x:number,y:number)=>Math.abs(x)<=HALF.w/2+EPS&&y>=-EPS&&y<=HALF.d+EPS;
export const zoneOf=(x:number,y:number):Zone=>inBox(x,y)?'box':inHalf(x,y)?'half':'out';
/** May the goalkeeper handle the ball here, under this era's Law? */
export function handsOK(era:Era,x:number,y:number){const z=zoneOf(x,y);return era==='before'?z!=='out':z==='box';}

/** The three things to find while exploring (each needs the keeper in the right place under the right Law). */
export type Task='old-far'|'new-out'|'new-in';
export const TASKS:readonly {id:Task;text:string}[]=[
 {id:'old-far',text:'Before 1912: catch it outside the box'},
 {id:'new-out',text:'From 1912: step outside the box'},
 {id:'new-in',text:'From 1912: catch it inside the box'},
];
export function taskAt(era:Era,x:number,y:number):Task|null{
 const z=zoneOf(x,y);if(z==='out')return null;
 if(era==='before')return z==='half'?'old-far':null;
 return z==='half'?'new-out':'new-in';
}

/** What the keeper's hands say, in plain words (no emoji). */
export function sayHands(era:Era,x:number,y:number):{ok:boolean;big:string;line:string}{
 const ok=handsOK(era,x,y),z=zoneOf(x,y),m=Math.round(y);
 if(era==='before')return z==='box'?{ok,big:'Hands OK',line:'In the box. Before 1912 the hands work all the way to halfway.'}
  :{ok,big:'Hands OK',line:`${m} m out, and still allowed: before 1912 a keeper could handle anywhere in their own half.`};
 return z==='box'?{ok,big:'Hands OK',line:'Inside the penalty area: catch it, hold it, throw it.'}
  :{ok,big:'No hands',line:`${m} m out, outside the box: here a keeper must play it like everyone else, with feet, chest or head.`};
}

/** The keeper's grab circle in metres: at least 3.4 m, and never under 26 px of radius at the drawing's scale. */
export const grabRadius=(pxPerMetre:number)=>Math.max(3.4,26/Math.max(.05,pxPerMetre));

// ── The instrument (Oct 14 2026 redo): an XY gantry over the half pitch, two cranks, the Law switch, the glove stand ─────────
/** One full turn of either crank moves the keeper this many metres (a leadscrew). Arrow keys turn a crank by an eighth. */
export const LEAD=8,KEY_TURN=1/8;
/** Turning a crank by `turns` (+ clockwise): X moves the carriage across the pitch, Y moves the bridge out from the goal line. */
export function crank(pos:[number,number],axis:'x'|'y',turns:number):[number,number]{
 const [x,y]=pos;return axis==='x'?clampToHalf(x+turns*LEAD,y):clampToHalf(x,y+turns*LEAD);}
/** The crank handle's angle (radians) for a position: the handle turns with the screw, so it always shows where the keeper is. */
export const crankAngle=(v:number)=>v/LEAD*Math.PI*2;
/** The Law switch: two positions; a tap flips it. */
export const flip=(e:Era):Era=>e==='before'?'after':'before';

/** The glove stand: one glove taken apart into its layers, palm side down. Which layers a keeper had depends on the era
 *  (Wikipedia, Kit (association football): gloves were rarely worn before the 1970s; since the 1980s gloves have finger
 *  protectors that stop the fingers bending backwards, segmentation for flexibility and palms made to protect the hand and grip). */
export type GloveEra='bare'|'1970s'|'today';
export type Layer='palm'|'hand'|'spines'|'back'|'strap';
export const LAYERS:readonly Layer[]=['palm','hand','spines','back','strap'];
export const GLOVE_ERAS:readonly {id:GloveEra;tab:string;head:string;layers:readonly Layer[]}[]=[
 {id:'bare',tab:'Before 1970s',head:'Mostly bare hands',layers:['hand']},
 {id:'1970s',tab:'1970s',head:'Gloves catch on',layers:['palm','hand','back']},
 {id:'today',tab:'Since 1980s',head:'Built for keepers',layers:['palm','hand','spines','back','strap']},
];
export const gloveLayers=(e:GloveEra)=>GLOVE_ERAS.find(g=>g.id===e)!.layers;
/** Stack height of layer i (bottom of it) for an explode amount 0…1: assembled they sit snug; apart, 30 units between them. */
export const LAYER_T:Record<Layer,number>={palm:4.5,hand:6,spines:2.4,back:4.5,strap:3};
export function layerZ(i:number,apart:number,gap=30){let z=12;for(let n=0;n<i;n++)z+=LAYER_T[LAYERS[n]]+.4;return z+apart*i*gap;}
/** The stand's crank: one full turn takes the glove fully apart. */
export const apartOfTurns=(turns:number)=>Math.max(0,Math.min(1,turns));

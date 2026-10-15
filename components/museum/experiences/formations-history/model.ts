/**
 * formations-history · the tactics machine's model (Oct 14 2026 redo). Pure, no React, so the test runs it in Node.
 * Board units are metres on a 100 × 64 pitch: x from your own goal line (0) to the goal you attack (100), y across (0..64).
 * A shape is written for the ten outfield players, counted from your own goal (4-3-3 = 4 defenders, 3 midfielders, 3 forwards);
 * the goalkeeper is not counted.
 * History checked against Wikipedia "Formation (association football)": the 2-3-5 recorded in 1880 and the standard in England by
 * the 1890s; the WM (3-2-2-3) created in the mid-1920s by Herbert Chapman of Arsenal after the 1925 offside change; Brazil's 4-2-4
 * at the 1958 World Cup ("1958 FIFA World Cup"); the 4-4-2 the most common shape in the 1990s and early 2000s; 4-3-3 and 4-2-3-1
 * widely used today. The board shapes are drawn simply: real teams move all the time.
 */
export type Pt={x:number;y:number};
export const L=100,W=64,MID=32;
export const dist=(a:Pt,b:Pt)=>Math.hypot(a.x-b.x,a.y-b.y);
export const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
/** n players spread evenly across at depth x (spread 0..1 of the width; one player stands in the middle). */
export function line(n:number,x:number,spread:number):Pt[]{
 if(n===1)return [{x,y:MID}];const w=W*spread;return Array.from({length:n},(_,i)=>({x,y:MID-w/2+w*i/(n-1)}));
}
const stack=(...ls:Pt[][])=>ls.flat();
export type Era={id:string;shape:string;name:string;when:string;who:string;why:string;lines:string[];pts:Pt[]};
export const ERAS:readonly Era[]=[
 {id:'pyramid',shape:'2-3-5',name:'The pyramid',when:'1880s',who:'Recorded in 1880; the standard in England by the 1890s',
  why:'Five forwards! Teams attacked in numbers and kept just two defenders at the back.',lines:['Backs','Half-backs','Forwards'],
  pts:stack(line(2,18,.45),line(3,36,.7),line(5,62,.86))},
 {id:'wm',shape:'3-2-2-3',name:'The WM',when:'1920s–30s',who:'Herbert Chapman, Arsenal',
  why:'After the 1925 offside change strikers could stand nearer the goal, so Chapman pulled a centre-half back to mark the centre-forward. Look for the W and the M.',
  lines:['Backs','Half-backs','Inside forwards','Forwards'],pts:stack(line(3,16,.62),line(2,32,.4),line(2,47,.32),line(3,64,.8))},
 {id:'424',shape:'4-2-4',name:'Brazil’s 4-2-4',when:'1958',who:'Brazil, World Cup winners in 1958',
  why:'Four defenders in a line, two midfielders who do everything, four attackers.',lines:['Defence','Midfield','Attack'],
  pts:stack(line(4,18,.78),line(2,37,.3),line(4,62,.8))},
 {id:'442',shape:'4-4-2',name:'The 4-4-2',when:'1990s',who:'The most common shape in the 1990s and early 2000s',
  why:'Two neat banks of four make it hard to play through you, and two strikers work as a pair.',lines:['Defence','Midfield','Attack'],
  pts:stack(line(4,18,.78),line(4,40,.8),line(2,61,.3))},
 {id:'433',shape:'4-3-3',name:'The 4-3-3',when:'Today',who:'Used by many top clubs today',
  why:'Three in midfield to keep the ball, and three forwards who stretch the pitch wide.',lines:['Defence','Midfield','Attack'],
  pts:stack(line(4,18,.78),line(3,39,.55),line(3,62,.76))},
 {id:'4231',shape:'4-2-3-1',name:'The 4-2-3-1',when:'Today',who:'Very often used in the modern game',
  why:'Two holding midfielders give cover; three play behind one striker.',lines:['Defence','Holding midfield','Attacking midfield','Striker'],
  pts:stack(line(4,18,.78),line(2,34,.36),line(3,51,.74),line(1,66,0))},
];
export const GK:Pt={x:4,y:MID};
/** The game's own shapes (Paths), for the history text: fewer players, the same ideas. */
export const YOUTH=[{format:'7v7',shape:'2-3-1'},{format:'9v9',shape:'3-2-3'},{format:'11v11',shape:'4-3-3'}] as const;

// ── Reading a shape ──────────────────────────────────────────────────────────────────────────────────────────────────────
/** Dots closer than this along the pitch are on the same line. */
export const LINE_GAP=7;
/** Group players into lines from your own goal forward (sorted by x; a new line starts after a gap > LINE_GAP). Returns indices. */
export function linesOf(pts:readonly Pt[]):number[][]{
 const order=pts.map((p,i)=>i).sort((a,b)=>pts[a].x-pts[b].x||pts[a].y-pts[b].y),out:number[][]=[];
 for(const i of order){const last=out[out.length-1];if(last&&pts[i].x-pts[last[last.length-1]].x<=LINE_GAP)last.push(i);else out.push([i]);}
 return out;
}
export const shapeOf=(pts:readonly Pt[])=>linesOf(pts).map(l=>l.length).join('-');
/** Generic names for the lines of a built shape. */
export function lineNames(n:number):string[]{
 if(n<=1)return ['Everyone'];if(n===2)return ['Defence','Attack'];if(n===3)return ['Defence','Midfield','Attack'];
 if(n===4)return ['Defence','Midfield','Midfield','Attack'];return ['Defence',...Array.from({length:n-2},()=>'Midfield'),'Attack'];
}

// ── The two gauges you drive (width and depth) ───────────────────────────────────────────────────────────────────────────
/** Width factor: 1 = the shape as drawn; the slider runs from a squeezed 0.35 to a stretched 1.15. Depth factor: 0.45..1.35. */
export const WIDTH_RANGE=[.35,1.15] as const,DEPTH_RANGE=[.45,1.35] as const;
export const factorOf=(t:number,[a,b]:readonly [number,number])=>a+(b-a)*clamp(t,0,1);
export const tOf=(f:number,[a,b]:readonly [number,number])=>clamp((f-a)/(b-a),0,1);
/** Squeeze or stretch a shape: across about the middle of the pitch, along about the shape's own middle. */
export function warp(pts:readonly Pt[],wf:number,df:number):Pt[]{
 const xs=pts.map(p=>p.x),xc=(Math.min(...xs)+Math.max(...xs))/2;
 return pts.map(p=>({x:clamp(xc+(p.x-xc)*df,6,94),y:clamp(MID+(p.y-MID)*wf,2,62)}));
}

// ── The balance gauges ───────────────────────────────────────────────────────────────────────────────────────────────────
/** Green zones (metres): width ≥ 40; depth (back line to front line) 26..50; the biggest empty gap inside the shape ≤ 19. */
export const ZONES={width:[40,64],depth:[26,50],gap:[0,19]} as const;
export const GAUGE_FULL={width:70,depth:70,gap:40};
export type Reading={width:number;depth:number;gap:number;close:boolean;lines:number[][];shape:string;ok:{width:boolean;depth:boolean;cover:boolean};all:boolean;say:string};
const mean=(pts:readonly Pt[],ix:number[])=>ix.reduce((a,i)=>a+pts[i].x,0)/ix.length;
/** Read a shape like the machine's needles do. */
export function readShape(pts:readonly Pt[]):Reading{
 const lines=linesOf(pts),ys=pts.map(p=>p.y),width=Math.max(...ys)-Math.min(...ys);
 const back=mean(pts,lines[0]),front=mean(pts,lines[lines.length-1]),depth=front-back;
 // the biggest gap: the emptiest spot inside the shape's box (how far it is from the nearest player)
 let gap=0;for(let x=back;x<=front+1e-9;x+=Math.max(2,(front-back)/12))for(let y=6;y<=58;y+=4){const d=Math.min(...pts.map(p=>dist(p,{x,y})));if(d>gap)gap=d;}
 let close=false;for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)if(dist(pts[i],pts[j])<5)close=true;
 const ok={width:width>=ZONES.width[0],depth:depth>=ZONES.depth[0]&&depth<=ZONES.depth[1],cover:gap<=ZONES.gap[1]&&!close};
 const say=!ok.width?'Too narrow: the wings are empty. Spread out toward both touchlines.'
  :depth<ZONES.depth[0]?'Too flat: everyone is in one band. Stretch from defence to attack.'
  :depth>ZONES.depth[1]?'Too stretched: the lines are far apart. Pull them closer together.'
  :close?'Two players on top of each other: give each one their own space.'
  :!ok.cover?`A big hole in the middle (${Math.round(gap)} m to the nearest player). Fill it.`
  :'Balanced: wide, deep enough, and every space has someone.';
 return {width,depth,gap,close,lines,shape:lines.map(l=>l.length).join('-'),ok,all:ok.width&&ok.depth&&ok.cover,say};
}
/** The name of a known shape, if a built one matches. */
export const KNOWN:Record<string,string>={'2-3-5':'the pyramid','3-2-2-3':'the WM','4-2-4':'Brazil’s 1958 shape','4-4-2':'the 4-4-2','4-3-3':'the 4-3-3','4-2-3-1':'the 4-2-3-1',
 '3-4-3':'a 3-4-3','3-5-2':'a 3-5-2','4-5-1':'a 4-5-1','5-3-2':'a 5-3-2','4-1-4-1':'a 4-1-4-1','3-4-2-1':'a 3-4-2-1','4-3-2-1':'the “Christmas tree” 4-3-2-1'};
/** Where the build starts: everyone bunched round the ball like a swarm (the classic kids' game), so the task is to spread out. */
export function swarm():Pt[]{return Array.from({length:10},(_,i)=>{const a=i*2.4,r=4+i*1.1;return {x:48+Math.cos(a)*r,y:MID+Math.sin(a)*r};});}
/** Holes on the pegboard: every 4 m. A dropped peg snaps to the nearest hole. */
export const HOLE=4;
export const snapHole=(p:Pt):Pt=>({x:clamp(Math.round(p.x/HOLE)*HOLE,4,96),y:clamp(Math.round(p.y/HOLE)*HOLE,4,60)});

// ── Controls ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** The era selector's detents (degrees from `up`, turning clockwise), one per era. */
export const ERA_ANGLES=[-125,-75,-25,25,75,125];
export function eraIndex(deg:number){let best=0;ERA_ANGLES.forEach((a,i)=>{if(Math.abs(a-deg)<Math.abs(ERA_ANGLES[best]-deg))best=i;});return best;}
/** The lift lever: −34° down (lines together) … +34° up (lines apart). */
export const LIFT_ANGLES=[-34,34] as const;
export const liftOfLever=(deg:number)=>clamp((deg-LIFT_ANGLES[0])/(LIFT_ANGLES[1]-LIFT_ANGLES[0]),0,1);
export const leverOfLift=(f:number)=>LIFT_ANGLES[0]+(LIFT_ANGLES[1]-LIFT_ANGLES[0])*clamp(f,0,1);
/** The mode switch: HISTORY (era knob drives the pegs) or BUILD (you place them). */
export type Mode='history'|'build';
export const SWITCH_ANGLES:Record<Mode,number>={history:-30,build:30};
export const TASKS=[
 {id:'eras',ask:'Turn the big era knob: watch the pegs hop into each famous shape. Try four.'},
 {id:'squeeze',ask:'Drag the WIDTH or DEPTH slider until a needle leaves the green. What goes wrong?'},
 {id:'lines',ask:'Pull the LIFT lever: the shape comes apart into its lines, like a stadium’s layers.'},
 {id:'build',ask:'Flip the switch to BUILD and drag the pegs into your own shape with all three needles in the green.'},
] as const;
export type TaskId=typeof TASKS[number]['id'];

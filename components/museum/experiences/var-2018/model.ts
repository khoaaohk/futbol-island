import * as k from '../anatomy/iso-kit';
import type {Plan,Projection,SolidPaths,Tone,LineTone,Point3} from '../anatomy/iso-kit';
import {POSES,ballItem,byDepth,figureItems,mixPose,runAt,shadowAt,type Fig,type Item,type Part} from '../anatomy/figure';
import {BALL_R,CLIPS,DEEP,DEEPEST_Z,LAST,LINE_W,clipTruth,clipZ,timecode,type Clip} from './goalline';

/**
 * var-2018 · "The VAR room" (Oct 12 2026 anatomy Paper rebuild of the Oct 10 game; user: every exhibit but the penalty kick is an
 * isometric technical illustration in the Paper theme, LARGE, filling the screen, a real mini-game). Pure: no DOM, so
 * tests/museum-exp-var-2018.cjs runs it in Node.
 *
 * The object is a goal-mouth model on a bench, seen from behind the attack: a base plate on feet, a turf deck with the 12 cm
 * goal line, the goal and its net, a goal-line camera on a mast behind the goal, the pitchside review screen, and paper players
 * (#9 shoots, the keeper claws the ball back, the referee). From up here the 22 cm ball is a few pixels: you CANNOT tell whether
 * all of it crossed. So you aim the goal-line camera (drag its reticle onto the ball) and its monitor shows the line and the
 * ball from above at true scale, from the same numbers that move the ball (goalline.ts clipZ), so what you see is the truth.
 *
 * World: centimetres. The goal line runs along y at x = 0 (its 12 cm band from x = −12 to 0); the pitch is x > 0, the goal x < 0.
 */
export const FIRST:Clip={id:'first',deep:DEEP,deepZ:DEEPEST_Z};
/** A shift: the first practice replay (6 cm of the ball still on the line), then four more in a shuffled order. */
export function makeShift(r:()=>number):Clip[]{const a=[...CLIPS];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return [FIRST,...a.slice(0,4)];}
export const SHIFT_N=5;
/** Ball centre's distance from the goal line's pitch edge (m) on frame f: negative = into the goal. */
export const zAt=(c:Clip,f:number)=>clipZ(c,f);
export const BALL_Y=40;// where along the mouth the ball crosses (cm from the middle)
export const POST=366,AZ=12,EL=30;
export function rng(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}

/** The ball on frame f, in world cm (centre; z includes its 11 cm radius). It is lifted while it flies in. */
export function ballAt(c:Clip,f:number){const lift=f<c.deep?Math.sin(Math.PI*f/c.deep)*55:0;return {x:zAt(c,f)*100,y:BALL_Y,z:BALL_R*100+lift};}

export type VarView={clip:Clip;frame:number;/** the camera reticle on the floor (world cm) */cam:{x:number;y:number};
 /** the referee walks to the review screen 0 → 1 */review:number;call:'goal'|'nogoal'|null};
/** Is the reticle on the ball (close enough for the goal-line camera to lock)? */
export const camOnBall=(v:VarView)=>{const b=ballAt(v.clip,v.frame);return Math.hypot(v.cam.x-b.x,v.cam.y-b.y)<60;};

/**
 * What the goal-line camera's monitor shows, in cm, from the same numbers that move the ball: the ball's centre and near edge
 * its trailing edge (the side toward the pitch) against the line (x = −12 … 0). `onLineCm` > 0: that much of the ball is still over (on) the line.
 */
export function monitorOf(v:VarView){const b=ballAt(v.clip,v.frame),near=b.x+BALL_R*100;return {ballX:b.x,near,onLineCm:Math.round(near+LINE_W*100),over:near< -LINE_W*100};}

// ── The bench ───────────────────────────────────────────────────────────────────────────────────────────────────────────
export const PLATE:Plan={x:-300,y:-560,w:1160,d:1120,r:34};
export const TURF=k.insetPlan(PLATE,36);
export const MAST={x:-170,y:-470},SCREEN={x:280,y:-470};
/** Fit the bench into a box of w × h px. */
export function cameraFor(w:number,h:number):Projection{
 const narrow=w/h<1.1,pts:Point3[]=narrow?[...k.boxCorners({x:-190,y:-470,w:720,d:740,r:0},0,200),[MAST.x,MAST.y,320]]:[...k.boxCorners({x:-210,y:-490,w:800,d:900,r:0},0,250),[MAST.x,MAST.y,330]];
 return k.fitProjection(pts,Math.max(1,w),Math.max(1,h),{pad:narrow?6:Math.min(28,w*.03),azimuth:AZ,elevation:narrow?44:EL});
}
/** The floor point under a screen point (inverse of the projection at z = 0). */
export function floorAt(P:Projection,sx:number,sy:number){const o=k.iso([0,0,0],P),ax=k.iso([1,0,0],P),ay=k.iso([0,1,0],P);
 const a=ax[0]-o[0],b=ay[0]-o[0],c=ax[1]-o[1],d=ay[1]-o[1],det=a*d-b*c||1,X=sx-o[0],Y=sy-o[1];return {x:(d*X-b*Y)/det,y:(a*Y-c*X)/det};}

export function benchParts(P:Projection,v:VarView):Part[]{
 const out:Part[]=[],S=(paths:SolidPaths,o:Omit<Extract<Part,{kind:'solid'}>,'kind'|'paths'>={})=>out.push({kind:'solid',paths,...o});
 const Ln=(d:string,tone:LineTone='lo')=>out.push({kind:'line',d,tone});
 const byD=(pts:k.Plane[])=>[...pts].sort((a,b)=>k.depthOf([a[0],a[1],0],P)-k.depthOf([b[0],b[1],0],P));
 out.push({kind:'halo',d:k.haloOf(PLATE,-62,50,P)});
 for(const [x,y] of byD(k.corners(PLATE,66))){S(k.cylinder(x,y,30,-62,4,P,40),{tone:'mid',crease:'none'});S(k.cylinder(x,y,24,-58,14,P,40),{tone:'hi',crease:'lo'});}
 S(k.slabOf(PLATE,-46,36,P,8,1.6),{tone:'hi',crease:'lo',inner:k.lineSvg(k.sideSeam(PLATE,-30,P,8),{tone:'faint'})});
 Ln(k.planOutline(k.insetPlan(PLATE,13),-10,P));
 for(const [x,y] of k.corners(PLATE,25)){Ln(k.ring(x,y,7,-10,P,20));out.push({kind:'dots',pts:[k.iso([x,y,-10],P)],size:1.1,tone:'hi'});}
 const strip:Plan={x:PLATE.x+PLATE.w-28,y:-500,w:14,d:860,r:2};S(k.slabOf(strip,-10,1.4,P,3),{tone:'lo',crease:'none'});
 const t=k.topTicks(strip.y+10,strip.y+strip.d-10,20,5,strip.x+.6,-8.6,[5,9.5],P,'y');Ln(t.minor);Ln(t.major,'mid');
 const label:Plan={x:PLATE.x+PLATE.w-32,y:380,w:22,d:150,r:3};S(k.slabOf(label,-10,1.8,P,4,.6),{tone:'mid',crease:'faint'});
 out.push({kind:'text',transform:k.topMatrix([label.x+15,label.y+10],-8.2,P,'y'),text:'LAW 10 · RUSSIA 2018',size:8});
 S(k.slabOf(TURF,-10,10,P,6,1),{tone:'hi',crease:'lo'});
 const y0=TURF.y+2,y1=TURF.y+TURF.d-2;
 for(let x=120;x<TURF.x+TURF.w-20;x+=120)Ln(k.lineOnTop([x,y0],[x,y1],0,P),'faint');
 // The goal line: a 12 cm band (it belongs to the goal area), and the six-yard box.
 out.push({kind:'line',d:k.onTop([[-12,y0],[0,y0],[0,y1],[-12,y1]],0,P,true),tone:'mid'});
 const box=(x:number,ya:number,yb:number)=>{Ln(k.onTop([[0,ya],[x,ya],[x,yb],[0,yb]],0,P),'mid');Ln(k.onTop([[0,ya+12],[x-12,ya+12],[x-12,yb-12],[0,yb-12]],0,P),'mid');};
 box(550,Math.max(y0,-POST-550),Math.min(y1,POST+550));
 // Advertising boards behind the goal.
 for(let i=0;i<4;i++){const b:Plan={x:-286,y:-500+i*260,w:10,d:240,r:1};S(k.slabOf(b,0,52,P,2,.5),{tone:'hi',crease:'faint'});}
 // The goal: net behind, far post, crossbar, near post.
 const gx=-6,bx=-200,H=244,hb=180;
 for(let y=-POST;y<=POST+.1;y+=61)Ln(k.segment([bx,y,0],[bx,y,hb],P),'faint');for(let z=0;z<=hb+.1;z+=36)Ln(k.segment([bx,-POST,z],[bx,POST,z],P),'faint');
 for(let y=-POST;y<=POST+.1;y+=61)Ln(k.segment([gx,y,H],[bx,y,hb],P),'faint');
 for(const side of [-1,1]){const y=side*POST;for(let x=gx;x>=bx;x-=40)Ln(k.segment([x,y,0],[x,y,H+(hb-H)*(gx-x)/(gx-bx)],P),'faint');}
 S(k.cylinder(bx,-POST,3,0,hb,P,16),{tone:'mid'});S(k.cylinder(bx,POST,3,0,hb,P,16),{tone:'mid'});
 S(k.cylinder(gx,-POST,6,0,H,P,24),{tone:'hi',crease:'lo'});
 S(k.slabOf({x:gx-6,y:-POST-6,w:12,d:POST*2+12,r:5},H-12,12,P,3),{tone:'hi',crease:'lo'});
 S(k.cylinder(gx,POST,6,0,H,P,24),{tone:'hi',crease:'lo'});
 // The goal-line camera on its mast behind the goal.
 const m=MAST;S(k.slabOf({x:m.x-36,y:m.y-36,w:72,d:72,r:6},0,10,P,4,.8),{tone:'hi',crease:'lo'});
 S(k.cylinder(m.x,m.y,7,10,262,P,24),{tone:'hi',crease:'none',inner:k.lineSvg(k.sideArc(m.x,m.y,7,120,P,12),{tone:'faint'})});
 S(k.slabOf({x:m.x-22,y:m.y-14,w:44,d:28,r:4},272,10,P,3,.6),{tone:'hi',crease:'lo'});
 S(k.slabOf({x:m.x-26,y:m.y-18,w:60,d:36,r:6},282,34,P,4,1),{tone:'hi',crease:'lo',lit:camOnBall(v)});
 out.push({kind:'lens',d:k.sideRing([m.x+34.3,m.y,299],11,'x',P,28),on:camOnBall(v)?'green':null,colour:'green',glow:k.iso([m.x+34,m.y,299],P),r:8});
 // The review screen by the pitch (RRA): a stand, a hooded monitor.
 const s=SCREEN;S(k.slabOf({x:s.x-30,y:s.y-30,w:60,d:60,r:5},0,8,P,4,.6),{tone:'hi',crease:'lo'});
 S(k.cylinder(s.x,s.y,5,8,120,P,20),{tone:'hi',crease:'none'});
 S(k.slabOf({x:s.x-40,y:s.y-6,w:80,d:12,r:3},128,56,P,3,.6),{tone:'hi',crease:'lo'});
 out.push({kind:'line',d:k.pathOf([[s.x-33,s.y+6.2,134],[s.x+33,s.y+6.2,134],[s.x+33,s.y+6.2,178],[s.x-33,s.y+6.2,178]].map(p=>k.iso(p as Point3,P)),true),tone:v.review>.95?'hi':'lo'});
 return out;
}

/** The keeper's place and pose on frame f: set, dives across as the ball arrives, claws it back from the line. */
function keeper(c:Clip,f:number):Fig{const u=f/c.deep;
 if(u<.55)return {id:'K',x:40,y:BALL_Y-170,h:0,pose:POSES.ready,kit:'keeper'};
 const v=Math.min(1,(u-.55)/.55);return {id:'K',x:30,y:BALL_Y-150+80*v,h:90,pose:mixPose(POSES.ready,POSES.lie,Math.min(1,v*1.4)),kit:'keeper'};}
export function actorItems(P:Projection,v:VarView){
 const f=v.frame,c=v.clip,figs:Fig[]=[];
 figs.push({id:'A',x:540,y:BALL_Y+70,h:180,kit:'light',pose:f<4?POSES.pass:f<c.deep+6?POSES.stand:POSES.point});
 figs.push({id:'D',x:300,y:BALL_Y+260,h:200,kit:'grey',pose:f<10?runAt(f/12):POSES.stand});
 figs.push(keeper(c,f));
 const r=v.review,rx=480+(SCREEN.x+60-480)*r,ry=-150+(SCREEN.y+40+150)*r;
 figs.push({id:'ref',x:rx,y:ry,h:r>0&&r<1?-120:200,kit:'dark',pose:r>0&&r<1?runAt(r*3):v.call&&r>=1?POSES.point:POSES.stand});
 const items:Item[]=[];for(const g of figs)items.push(...figureItems(g,P));
 const b=ballAt(c,f);items.push(ballItem([b.x,b.y,b.z],P,f*.7,'accent'));
 const shadows=figs.map(g=>shadowAt(g.x,g.y,g.pose.lean>60?70:34,P));shadows.push(shadowAt(b.x,b.y,14,P));
 return {items:byDepth(items),shadows};
}
/** The answer key for a clip (goalline.ts): goal only when the WHOLE ball crossed the WHOLE line at its deepest. */
export const truthOf=(c:Clip)=>clipTruth(c);
export {LAST,timecode,LINE_W,BALL_R};
export type {Tone};

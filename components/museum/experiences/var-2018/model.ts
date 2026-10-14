import * as k from '../anatomy/iso-kit';
import type {Plan,Point3,Projection,SolidPaths,LineTone} from '../anatomy/iso-kit';
import {BALL_R,CLIPS,DEEP,DEEPEST_Z,LAST,LINE_W,clipTruth,clipZ,timecode,type Clip} from './goalline';
import {ballItem,byDepth,pxPerCm,shadowAt,type Item,type Part} from './items';

/**
 * var-2018 · "The goal-line desk" (Oct 12 2026 rebuild, no people; user: "rebuild the video assistant referee. the characters
 * don't look good moving. don't use the characters."). Pure: no DOM, so tests/museum-exp-var-2018.cjs runs it in Node.
 *
 * The ball is the star. The object is a goal-mouth model on a bench, seen from behind the attack: a base plate on feet, a turf
 * deck with the 12 cm goal line, the goal and its net, and the VAR's instruments: a LINE CAM on a mast at the end of the goal
 * line (it looks straight along the line), a TOP CAM on a boom over the goal mouth (it looks straight down), a cable run to the
 * pitchside review screen on its stand. Nobody is on the model.
 *
 * Every replay is the same kind of moment: a shot comes in, smacks the underside of the crossbar, drops on (or behind) the line
 * on its deepest frame and spins back out. From the bench view the 22 cm ball is a few pixels; the cameras' monitor shows it at
 * true scale (cm), from the same numbers that move the ball (goalline.ts clipZ), so what you see on the monitor is the truth.
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
export const POST=366,BAR=244,BAR_W=12,AZ=12,EL=30;
/** The ball's centre height when its top touches the underside of the bar. */
export const BAR_HIT_Z=BAR-BAR_W-BALL_R*100;
export function rng(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}

/** The frame the ball strikes the bar on (four frames before it lands on its deepest frame). */
export const hitFrame=(c:Clip)=>Math.max(2,c.deep-4);
/**
 * The ball on frame f, in world cm (centre). In flight it rises to the bar (hitFrame), drops under gravity to land on its deepest
 * frame, then bounces lower and lower as the spin carries it back out.
 */
export function ballAt(c:Clip,f:number){const n=Math.max(0,Math.min(LAST,f)),h=hitFrame(c),r=BALL_R*100;let z:number;
 if(n<=h){const u=n/h;z=r+(BAR_HIT_Z-r)*(1-(1-u)*(1-u));}
 else if(n<=c.deep){const u=(n-h)/(c.deep-h);z=BAR_HIT_Z-(BAR_HIT_Z-r)*u*u;}
 else{const u=n-c.deep;z=r+46*Math.abs(Math.sin(Math.PI*u/7))*Math.exp(-u/9);}
 return {x:zAt(c,n)*100,y:BALL_Y,z};}

export type Cam='line'|'top';
export const ZOOMS=[1,2,4] as const;
export type VarView={clip:Clip;frame:number;cam:Cam;zoom:number;/** the review: the screen lights and the signal is drawn 0 → 1 */review:number;call:'goal'|'nogoal'|null};

/**
 * What the cameras read, in cm, from the same numbers that move the ball: the ball's centre, its trailing edge (the side toward
 * the pitch) and how much of it is still over the line. `onLineCm` > 0: that much of the ball is still on the line (no goal).
 */
export function monitorOf(v:{clip:Clip;frame:number}){const b=ballAt(v.clip,v.frame),near=b.x+BALL_R*100;
 return {ballX:b.x,ballZ:b.z,near,onLineCm:Math.round(near+LINE_W*100),over:near< -LINE_W*100};}

/**
 * The monitor's window (a viewBox in cm) for a camera, a zoom and the monitor's aspect (w / h). LINE CAM looks along the goal
 * line: x across the screen, height up (svg y = −z). TOP CAM looks down: x across, y (along the line) down the screen. At ×1 the
 * line cam shows the whole goal height; zoomed, both follow the ball and the line.
 */
export function monitorWindow(cam:Cam,zoom:number,aspect:number,b:{x:number;z:number}){
 const a=Math.max(.6,Math.min(3,aspect)),clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
 const cx0=zoom<=1?-20:clamp((b.x+(-LINE_W*50))/2,-60,40);
 if(cam==='line'){const h=zoom<=1?290:zoom<3?150:72,w=h*a,cz=zoom<=1?128:clamp(b.z,h/2-14,BAR);
  return {x:cx0-w/2,y:-cz-h/2,w,h};}
 const w=zoom<=1?300:zoom<3?150:74,h=w/a;return {x:cx0-w/2,y:-h/2,w,h};
}
/** Ruler step for a window width (cm per tick, labelled for the monitor). */
export const tickStep=(w:number)=>w>220?10:w>110?5:1;

// ── The bench ───────────────────────────────────────────────────────────────────────────────────────────────────────────
export const PLATE:Plan={x:-300,y:-560,w:1160,d:1120,r:34};
export const TURF=k.insetPlan(PLATE,36);
/** LINE CAM: on the line's own extension, past the far post, looking along +y. TOP CAM: hangs from a boom over the line. */
export const LINE_CAM={x:-LINE_W*50,y:-500,z:150},TOP_CAM={x:-LINE_W*50,y:BALL_Y,z:330},BOOM={x:-262,y:BALL_Y},SCREEN={x:250,y:500};
/** Fit the bench into a box of w × h px. Phones (tall cards) close in on the goal mouth and look down more steeply. */
export function cameraFor(w:number,h:number,narrow=w/h<1.1):Projection{
 const pts:Point3[]=narrow
  ?[...k.boxCorners({x:-200,y:-400,w:380,d:780,r:0},0,250),[LINE_CAM.x,LINE_CAM.y,LINE_CAM.z+30],[BOOM.x,BOOM.y,TOP_CAM.z+20]]
  :[...k.boxCorners({x:-220,y:-530,w:560,d:1080,r:0},0,250),[LINE_CAM.x,LINE_CAM.y,LINE_CAM.z+40],[BOOM.x,BOOM.y,TOP_CAM.z+20],[SCREEN.x,SCREEN.y,200]];
 return k.fitProjection(pts,Math.max(1,w),Math.max(1,h),{pad:narrow?6:Math.min(30,w*.03),azimuth:narrow?30:AZ,elevation:narrow?38:EL});
}

export function benchParts(P:Projection,v:VarView,live=true):Part[]{
 const out:Part[]=[],S=(paths:SolidPaths,o:Omit<Extract<Part,{kind:'solid'}>,'kind'|'paths'>={})=>out.push({kind:'solid',paths,...o});
 const Ln=(d:string,tone:LineTone='lo')=>out.push({kind:'line',d,tone});
 const byD=(pts:k.Plane[])=>[...pts].sort((a,b)=>k.depthOf([a[0],a[1],0],P)-k.depthOf([b[0],b[1],0],P));
 const frozen=live;
 // Base plate on turned feet, a groove, corner screws.
 out.push({kind:'halo',d:k.haloOf(PLATE,-62,50,P)});
 for(const [x,y] of byD(k.corners(PLATE,66))){S(k.cylinder(x,y,30,-62,4,P,40),{tone:'mid',crease:'none'});S(k.cylinder(x,y,24,-58,14,P,40),{tone:'hi',crease:'lo'});}
 S(k.slabOf(PLATE,-46,36,P,8,1.6),{tone:'hi',crease:'lo',inner:k.lineSvg(k.sideSeam(PLATE,-30,P,8),{tone:'faint'})});
 Ln(k.planOutline(k.insetPlan(PLATE,13),-10,P));
 for(const [x,y] of k.corners(PLATE,25)){Ln(k.ring(x,y,7,-10,P,20));out.push({kind:'dots',pts:[k.iso([x,y,-10],P)],size:1.1,tone:'hi'});}
 // A centimetre ruler along the pitch-side edge and the engraved label plate.
 const strip:Plan={x:PLATE.x+PLATE.w-28,y:-500,w:14,d:860,r:2};S(k.slabOf(strip,-10,1.4,P,3),{tone:'lo',crease:'none'});
 const t=k.topTicks(strip.y+10,strip.y+strip.d-10,20,5,strip.x+.6,-8.6,[5,9.5],P,'y');Ln(t.minor);Ln(t.major,'mid');
 const label:Plan={x:PLATE.x+PLATE.w-32,y:380,w:22,d:150,r:3};S(k.slabOf(label,-10,1.8,P,4,.6),{tone:'mid',crease:'faint'});
 out.push({kind:'text',transform:k.topMatrix([label.x+15,label.y+10],-8.2,P,'y'),text:'LAW 10 · RUSSIA 2018',size:8});
 // The turf deck with mown stripes.
 S(k.slabOf(TURF,-10,10,P,6,1),{tone:'hi',crease:'lo'});
 const y0=TURF.y+2,y1=TURF.y+TURF.d-2;
 for(let x=120;x<TURF.x+TURF.w-20;x+=120)Ln(k.lineOnTop([x,y0],[x,y1],0,P),'faint');
 // The goal line: a 12 cm band (it belongs to the goal area), and the six-yard box.
 out.push({kind:'line',d:k.onTop([[-LINE_W*100,y0],[0,y0],[0,y1],[-LINE_W*100,y1]],0,P,true),tone:'mid'});
 const box=(x:number,ya:number,yb:number)=>{Ln(k.onTop([[0,ya],[x,ya],[x,yb],[0,yb]],0,P),'mid');Ln(k.onTop([[0,ya+12],[x-12,ya+12],[x-12,yb-12],[0,yb-12]],0,P),'mid');};
 box(550,Math.max(y0,-POST-550),Math.min(y1,POST+550));
 // The VAR's cable: from the line cam's foot, along the touch edge, to the review screen's stand.
 out.push({kind:'line',d:k.onTop([[LINE_CAM.x,LINE_CAM.y+30],[LINE_CAM.x-40,LINE_CAM.y+30],[-244,LINE_CAM.y+30],[-244,BOOM.y-30]],.6,P),tone:'mid'});
 out.push({kind:'line',d:k.onTop([[BOOM.x+30,BOOM.y+10],[-244,BOOM.y+10],[-244,SCREEN.y],[SCREEN.x-30,SCREEN.y]],.6,P),tone:'mid'});
 // Advertising boards behind the goal.
 for(let i=0;i<4;i++){const b:Plan={x:-286,y:-500+i*260,w:10,d:240,r:1};S(k.slabOf(b,0,52,P,2,.5),{tone:'hi',crease:'faint'});}
 // The top cam's boom: a mast behind the net, an arm out over the goal mouth, the camera pod hanging from it.
 const B=BOOM;S(k.slabOf({x:B.x-30,y:B.y-30,w:60,d:60,r:5},0,10,P,4,.8),{tone:'hi',crease:'lo'});
 S(k.cylinder(B.x,B.y,6,10,TOP_CAM.z+6,P,24),{tone:'hi',crease:'none',inner:k.lineSvg(k.sideArc(B.x,B.y,6,150,P,12),{tone:'faint'})});
 // The goal: net behind, far post, crossbar, near post.
 const gx=-LINE_W*50,bx=-200,hb=180;
 for(let y=-POST;y<=POST+.1;y+=61)Ln(k.segment([bx,y,0],[bx,y,hb],P),'faint');for(let z=0;z<=hb+.1;z+=36)Ln(k.segment([bx,-POST,z],[bx,POST,z],P),'faint');
 for(let y=-POST;y<=POST+.1;y+=61)Ln(k.segment([gx,y,BAR],[bx,y,hb],P),'faint');
 for(const side of [-1,1]){const y=side*POST;for(let x=gx;x>=bx;x-=40)Ln(k.segment([x,y,0],[x,y,BAR+(hb-BAR)*(gx-x)/(gx-bx)],P),'faint');}
 S(k.cylinder(bx,-POST,3,0,hb,P,16),{tone:'mid'});S(k.cylinder(bx,POST,3,0,hb,P,16),{tone:'mid'});
 // Line cam mast, on the line's extension past the far post (behind the goal frame on screen).
 const L=LINE_CAM;S(k.slabOf({x:L.x-30,y:L.y-30,w:60,d:60,r:6},0,10,P,4,.8),{tone:'hi',crease:'lo'});
 for(const [x,y] of k.corners({x:L.x-30,y:L.y-30,w:60,d:60,r:6},9))out.push({kind:'dots',pts:[k.iso([x,y,10],P)],size:1,tone:'mid'});
 S(k.cylinder(L.x,L.y,6,10,L.z-26,P,24),{tone:'hi',crease:'none',inner:k.lineSvg(k.sideArc(L.x,L.y,6,70,P,12),{tone:'faint'})});
 S(k.slabOf({x:L.x-14,y:L.y-14,w:28,d:28,r:3},L.z-16,6,P,3,.5),{tone:'hi',crease:'lo'});
 S(k.slabOf({x:L.x-18,y:L.y-26,w:36,d:58,r:6},L.z-10,30,P,4,1),{tone:'hi',crease:'lo',lit:frozen&&v.cam==='line'});
 S(k.slabOf({x:L.x-14,y:L.y+32,w:28,d:8,r:2},L.z-6,22,P,3,.4),{tone:'hi',crease:'faint'});// the lens hood
 out.push({kind:'lens',d:k.sideRing([L.x,L.y+40.4,L.z+5],9,'y',P,28),on:frozen&&v.cam==='line'?'green':null,colour:'green',glow:k.iso([L.x,L.y+40,L.z+5],P),r:7});
 S(k.cylinder(gx,-POST,6,0,BAR,P,24),{tone:'hi',crease:'lo'});
 S(k.slabOf({x:gx-6,y:-POST-6,w:BAR_W,d:POST*2+12,r:5},BAR-BAR_W,BAR_W,P,3),{tone:'hi',crease:'lo'});
 S(k.cylinder(gx,POST,6,0,BAR,P,24),{tone:'hi',crease:'lo'});
 // The boom arm over the line (above the crossbar), and the top cam pod looking down at the line.
 const T=TOP_CAM;S(k.slabOf({x:B.x-10,y:B.y-8,w:T.x-B.x+28,d:16,r:4},T.z+6,12,P,3,.6),{tone:'hi',crease:'lo'});
 S(k.slabOf({x:T.x-16,y:T.y-16,w:32,d:32,r:5},T.z-24,30,P,4,1),{tone:'hi',crease:'lo',lit:frozen&&v.cam==='top'});
 S(k.cylinder(T.x,T.y,10,T.z-34,10,P,28,.5),{tone:'hi',crease:'lo'});
 out.push({kind:'lens',d:k.ring(T.x,T.y,7,T.z-34.2,P,28),on:frozen&&v.cam==='top'?'green':null,colour:'green',glow:k.iso([T.x,T.y,T.z-34],P),r:6});
 // The pitchside review screen (RRA): a weighted foot, a column, a hooded monitor that lights up for the review.
 const s=SCREEN;S(k.slabOf({x:s.x-30,y:s.y-30,w:60,d:60,r:5},0,8,P,4,.6),{tone:'hi',crease:'lo'});
 S(k.cylinder(s.x,s.y,5,8,120,P,20),{tone:'hi',crease:'none'});
 S(k.slabOf({x:s.x-6,y:s.y-44,w:12,d:88,r:3},128,60,P,3,.6),{tone:'hi',crease:'lo',lit:v.review>0});
 S(k.slabOf({x:s.x-12,y:s.y-46,w:22,d:92,r:2},188,4,P,3,.3),{tone:'hi',crease:'faint'});
 const scr=[[s.x+6.2,s.y-36,134],[s.x+6.2,s.y+36,134],[s.x+6.2,s.y+36,182],[s.x+6.2,s.y-36,182]].map(p=>k.iso(p as Point3,P));
 out.push({kind:'line',d:k.pathOf(scr,true),tone:v.review>0?'hi':'lo'});
 return out;
}

/** The review signal drawn on the screen (the referee's "TV" rectangle), traced 0 → 1, as a path in screen px. */
export function signalPath(P:Projection,u:number){if(u<=0)return '';const s=SCREEN,pts=[[s.x+6.4,s.y+28,142],[s.x+6.4,s.y-28,142],[s.x+6.4,s.y-28,174],[s.x+6.4,s.y+28,174],[s.x+6.4,s.y+28,142]].map(p=>k.iso(p as Point3,P));
 const segs:[number,number][][]=[];let total=0;for(let i=0;i<4;i++){segs.push([pts[i],pts[i+1]]);total+=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);}
 let left=total*Math.min(1,u);const out:[number,number][]=[pts[0]];
 for(const [a,b] of segs){const l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(left>=l){out.push(b);left-=l;}else{const f=left/l;out.push([a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]);break;}}
 return k.pathOf(out);}

/**
 * The moving things on frame f: the ball (the accent), its soft shadow, the dotted flight trace so far, the bar's impact mark
 * once it has been hit, and the bounce mark on the turf. Also the sight line from the chosen camera to the ball.
 */
export function ballItems(P:Projection,v:VarView){
 const c=v.clip,f=v.frame,b=ballAt(c,f),items:Item[]=[],h=hitFrame(c);
 const trail:k.Flat[]=[];for(let n=0;n<f;n++){const p=ballAt(c,n);trail.push(k.iso([p.x,p.y,p.z],P));}
 if(trail.length)items.push({kind:'dots',depth:-1e6,pts:trail,r:1.1});
 items.push(ballItem([b.x,b.y,b.z],P,f*.7,'accent'));
 const sh=shadowAt(b.x,b.y,18*Math.max(.45,1-b.z/400),P);
 const hit=f>=h?k.iso([-LINE_W*50,BALL_Y,BAR-BAR_W],P):null;
 const bounce=f>=c.deep?(()=>{const p=ballAt(c,c.deep);return {x:p.x,y:p.y};})():null;
 const camAt=v.cam==='line'?k.iso([LINE_CAM.x,LINE_CAM.y+40,LINE_CAM.z+5],P):k.iso([TOP_CAM.x,TOP_CAM.y,TOP_CAM.z-34],P);
 return {items:byDepth(items),shadow:{...sh,o:Math.max(.35,1-b.z/300)},hit,bounce,ball:k.iso([b.x,b.y,b.z],P),ballR:BALL_R*100*pxPerCm(P),camAt};
}
/** The answer key for a clip (goalline.ts): goal only when the WHOLE ball crossed the WHOLE line at its deepest. */
export const truthOf=(c:Clip)=>clipTruth(c);
export {LAST,timecode,LINE_W,BALL_R};

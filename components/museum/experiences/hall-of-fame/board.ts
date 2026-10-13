import {axisVector,boxCorners,cameraOf,circleRing,corners,cylinder,depthOf,fitProjection,insetPlan,iso,lineOnTop,onTop,pathOf,planOutline,ring,sideArc,sideSeam,slabOf,topTicks,
 type Flat,type LineTone,type Plan,type Point3,type Projection,type SolidPaths,type Tone} from '../anatomy/iso-kit';
import {FIN,INT,OVER,THR,BEAT,toUV,uv,type Actor,type Att,type GameId,type V} from './arenaRules';

/**
 * Hall of Fame · the tabletop pitch (Oct 12 2026, anatomy restyle; the shared kit in ../anatomy). Every position's game is played
 * on a model pitch: a base plate on feet with a bevelled edge, corner screws, a metre ruler along the front border, a label plate,
 * an inlaid playing surface with engraved lines (cut where the board ends) and, for the goal games, a goal with posts, crossbar
 * and net. The players are plain turned game pieces (base, column, collar, a ball for a head): never a likeness. The ball is the
 * one accent. Pure geometry (no React), so tests/museum-exp-hall-of-fame.cjs builds every board in Node.
 *
 * Render world: metres, z up. The goal games (save, overlap, finish) use the rules' own frame (x out from the goal line, y along
 * it). The midfield games (intercept, through ball, 1-v-1) live in the rules' screen-aligned frame (u, v); they are drawn with
 * X = u and Y = −v, so every board is axis-aligned and the camera is the same for all six.
 */
export type Frame='goal'|'uv';
export const FRAME:Record<GameId,Frame>={save:'goal',overlap:'goal',finish:'goal',intercept:'uv',through:'uv',beat:'uv'};
/** Camera azimuth per game: low (the goal or the passer at the top, play coming up the screen), side-on for the overlap run. */
export const AZ_OF:Record<GameId,number>={save:18,finish:18,intercept:18,through:18,beat:18,overlap:68};
export const AZ=18,PAD=22,FIG=1.5,BALL_R=.38;
/** The smallest board each game needs (render metres). It grows to fill the stage (fitBoard). */
export const BOARD:Record<GameId,Plan>={
 save:{x:-3.4,y:-8.6,w:18.8,d:17.2,r:.8},
 finish:{x:-3.4,y:-9,w:25.8,d:17,r:.8},
 overlap:{x:-2.4,y:11.5,w:23.6,d:21.5,r:.8},
 intercept:{x:-.6,y:-9.4,w:23.4,d:19.4,r:.8},
 through:{x:1,y:-9.6,w:22.6,d:16.4,r:.8},
 beat:{x:2.6,y:-8.4,w:17.2,d:11.4,r:.8},
};
/** Game frame → render world. */
export const toRender=(game:GameId,p:V):[number,number]=>{if(FRAME[game]==='goal')return [p.x,p.y];const q=toUV(p);return [q.u,-q.v];};
/** Render world → game frame (taps and drags). */
export const fromRender=(game:GameId,X:number,Y:number):V=>FRAME[game]==='goal'?{x:X,y:Y}:uv(X,-Y);
/** The board plate's heights. */
export const TOP=0,PLATE=.9,FOOT=.55;

/** The camera for a board on a stage of w × h px. The azimuth is low, so the goal (or the passer) sits at the top and the play
 *  comes up the screen; a portrait stage looks down more steeply so the pitch uses the height. */
export const elevationFor=(w:number,h:number)=>w/h<.9?50:w/h<1.3?38:33;
export function project(plan:Plan,w:number,h:number,tall=2.6,azimuth=AZ):Projection{
 return fitProjection(boxCorners(plan,-PLATE-FOOT,tall),Math.max(80,w),Math.max(80,h),{pad:PAD,headroom:h<520?16:26,azimuth,elevation:elevationFor(w,h)});
}
/** The action area per game (render metres): on a tall (phone) stage the camera frames this, not the whole board, so the
 *  pieces stay big; the plate then runs on past the card's edges. */
export const CORE:Record<GameId,Plan>={
 save:{x:-1.2,y:-5,w:15.6,d:10,r:0},finish:{x:-1.2,y:-5.4,w:22,d:10.8,r:0},overlap:{x:.5,y:22,w:19.5,d:9.5,r:0},
 intercept:{x:1,y:-7.4,w:20,d:15,r:0},through:{x:3,y:-8,w:18.5,d:12,r:0},beat:{x:4.8,y:-6.2,w:13,d:8.4,r:0},
};
/** The overlap is a long thin run up the wing, so on a wide stage too the camera frames the action (the lane and where the cross
 *  lands), not its whole board (Oct 12 2026 polish: the three pieces were tiny on a big plate). */
const WIDE_CORE:Partial<Record<GameId,Plan>>={overlap:{x:-.3,y:14,w:20.3,d:17.5,r:0}};
/** Fit a game's board to the stage. Wide: the camera frames the game's own board, then the board grows across for as long as
 *  that costs little scale, so the model fills the card. Tall: the camera frames the action (CORE) and the plate grows until it
 *  covers the card, so the pieces stay big enough to play on a phone. */
export function fitBoard(game:GameId,w:number,h:number):{plan:Plan;P:Projection}{
 const tall=FRAME[game]==='goal'&&game!=='overlap'?2.8:2.4,wide=w/h>1;
 const az=wide?AZ_OF[game]:game==='overlap'?10:AZ,side=az>45,core=wide?WIDE_CORE[game]:CORE[game];
 if(core){
  const P=fitProjection(boxCorners(core,0,tall),Math.max(80,w),Math.max(80,h),{pad:14,headroom:20,azimuth:az,elevation:elevationFor(w,h)});
  let plan={...BOARD[game]};
  const covers=(pl:Plan)=>{const pts=boxCorners(pl,0,0).map(p=>iso(p,P)),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return [Math.min(...xs)<=0&&Math.max(...xs)>=w,Math.min(...ys)<=0&&Math.max(...ys)>=h];};
  for(let i=0;i<40;i++){const [cx,cy]=covers(plan);if(cx&&cy)break;
   if(!cx)plan={...plan,y:plan.y-plan.d*.03,d:plan.d*1.06};
   if(!cy)plan={...plan,x:plan.x-plan.w*.03,w:plan.w*1.06};}
  return {plan,P};
 }
 let plan={...BOARD[game]},P=project(plan,w,h,tall,az);const s0=P.scale;
 for(let i=0;i<40;i++){
  const g:Plan=wide!==side?{...plan,y:plan.y-plan.d*.02,d:plan.d*1.04}:{...plan,x:plan.x-plan.w*.02,w:plan.w*1.04};
  const P2=project(g,w,h,tall,az);if(P2.scale<s0*.86)break;plan=g;P=P2;
 }
 return {plan,P};
}
/** A screen point (stage px) → the floor (render metres) at height z. */
export function floorAt(P:Projection,sx:number,sy:number,z=TOP):[number,number]{
 const {sinA,cosA,sinE,cosE,k}=cameraOf(P),u=(sx-P.origin[0])/k,v=((sy-P.origin[1])/k+z*cosE)/sinE;
 return [u*sinA+v*cosA,-u*cosA+v*sinA];
}

// ── Drawing items: a tiny display list the React layer renders with the kit's Solid / Line / Dots. ─────────────────────────
export type Item=
 |{k:'solid';paths:SolidPaths;tone?:Tone;crease?:Tone|'none';halo?:boolean;lit?:boolean;flat?:boolean;cls?:string;inner?:string}
 |{k:'line';d:string;tone?:LineTone;cls?:string;free?:boolean}
 |{k:'dots';pts:Flat[];size?:number;tone?:Tone}
 |{k:'ball';c:Flat;r:number;cls?:string}
 |{k:'shadow';d:string;o:number};

/** Keep the parts of a polyline inside a rectangle (render metres); each kept run ends exactly on the rectangle's edge. */
export function clipRuns(pts:[number,number][],r:Plan):[number,number][][]{
 const inside=(p:[number,number])=>p[0]>=r.x-1e-9&&p[0]<=r.x+r.w+1e-9&&p[1]>=r.y-1e-9&&p[1]<=r.y+r.d+1e-9;
 const cut=(a:[number,number],b:[number,number]):[number,number]=>{let lo=0,hi=1;for(let i=0;i<30;i++){const m=(lo+hi)/2,p:[number,number]=[a[0]+(b[0]-a[0])*m,a[1]+(b[1]-a[1])*m];if(inside(p)===inside(a))lo=m;else hi=m;}const m=(lo+hi)/2;return [a[0]+(b[0]-a[0])*m,a[1]+(b[1]-a[1])*m];};
 // densify so a long straight line can enter and leave
 const dense:[number,number][]=[];for(let i=0;i<pts.length;i++){if(i){const a=pts[i-1],b=pts[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.5));for(let j=1;j<n;j++)dense.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]);}dense.push(pts[i]);}
 const runs:[number,number][][]=[];let run:[number,number][]|null=null;
 for(let i=0;i<dense.length;i++){const p=dense[i],inn=inside(p);
  if(inn){if(!run){run=i?[cut(p,dense[i-1])]:[];runs.push(run);}run.push(p);}
  else if(run){run.push(cut(dense[i-1],p));run=null;}}
 return runs.filter(r=>r.length>1).map(r=>{const out:[number,number][]=[r[0]];for(let i=1;i<r.length-1;i++){const a=out[out.length-1],b=r[i],c=r[i+1];const cr=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);if(Math.abs(cr)>1e-6)out.push(b);}out.push(r[r.length-1]);return out;});
}
const arc=(cx:number,cy:number,r:number,a0:number,a1:number,n=48)=>Array.from({length:n+1},(_,i)=>{const a=a0+(a1-a0)*i/n;return [cx+r*Math.cos(a),cy+r*Math.sin(a)] as [number,number];});

/** The pitch markings for a game, as polylines in render metres (clipped to the surface by the caller). */
export function markings(game:GameId):{lines:[number,number][][];spots:[number,number][]}{
 const L:[number,number][][]=[],S:[number,number][]=[];
 if(FRAME[game]==='goal'){const side=game==='overlap'?30:34;
  L.push([[0,-side],[0,side]],[[0,side],[60,side]],[[0,-side],[60,-side]]);
  L.push([[0,-9.16],[5.5,-9.16],[5.5,9.16],[0,9.16]],[[0,-20.16],[16.5,-20.16],[16.5,20.16],[0,20.16]]);
  const a=Math.acos(5.5/9.15);L.push(arc(11,0,9.15,-a,a));S.push([11,0]);
  L.push(arc(0,side,1,-Math.PI/2,0,10),arc(0,-side,1,0,Math.PI/2,10));
 }else if(game==='beat'){L.push([[-10,-7],[40,-7]],[[11,-7],[11,40]]);L.push(arc(11,-7,9.15,0,Math.PI,40));}
 else{L.push([[11,-40],[11,40]]);L.push(arc(11,0,9.15,0,Math.PI*2,72));S.push([11,0]);}
 return {lines:L,spots:S};
}

/** The static model: halo, feet, plate, border, ruler, label plate, screws, the inlaid surface and its engraved lines. */
export function boardItems(game:GameId,plan:Plan,P:Projection):Item[]{
 const it:Item[]=[];const byDepth=(ps:[number,number][])=>[...ps].sort((a,b)=>depthOf([a[0],a[1],0],P)-depthOf([b[0],b[1],0],P));
 const z0=TOP-PLATE,zf=z0-FOOT;
 it.push({k:'shadow',d:slabOf({...plan,x:plan.x+.4,w:plan.w-.8},zf,.05,P).fill,o:1});
 for(const [x,y] of byDepth(corners(plan,1.7))){it.push({k:'solid',paths:cylinder(x,y,.62,zf,.1,P,28),tone:'lo'});it.push({k:'solid',paths:cylinder(x,y,.44,zf+.1,FOOT-.1,P,28,.04),tone:'mid'});}
 it.push({k:'solid',paths:slabOf(plan,z0,PLATE,P,8,.22),tone:'mid',inner:sideSeam(plan,z0+PLATE*.42,P,8)});
 // the inlaid playing surface and its engraved lines
 const surf=insetPlan(plan,1.25);
 it.push({k:'solid',paths:slabOf(surf,TOP,.05,P,6),tone:'lo',crease:'none',flat:true,cls:'turf'});
 const m=markings(game),lines:string[]=[];for(const l of m.lines)for(const run of clipRuns(l,surf))lines.push(onTop(run,TOP+.05,P));
 it.push({k:'line',d:lines.join(''),tone:'mid',cls:'chalk'});
 const spots=m.spots.filter(([x,y])=>x>surf.x&&x<surf.x+surf.w&&y>surf.y&&y<surf.y+surf.d).map(([x,y])=>iso([x,y,TOP+.05],P));
 if(spots.length)it.push({k:'dots',pts:spots,size:1.6,tone:'mid'});
 // the border furniture: corner screws, a metre ruler (front-left border) and a label plate (front-right border)
 for(const [x,y] of corners(plan,.6))it.push({k:'line',d:ring(x,y,.2,TOP,P,16),tone:'lo'});
 it.push({k:'dots',pts:corners(plan,.6).map(([x,y])=>iso([x,y,TOP],P)),size:.8,tone:'mid'});
 const strip:Plan={x:plan.x+2.2,y:plan.y+plan.d-.95,w:plan.w-4.4,d:.55,r:.08};
 it.push({k:'solid',paths:slabOf(strip,TOP,.06,P,3),tone:'lo',crease:'none'});
 const t=topTicks(strip.x+.4,strip.x+strip.w-.4,1,5,strip.y+.02,TOP+.06,[.2,.36],P,'x');
 it.push({k:'line',d:t.minor,tone:'lo'},{k:'line',d:t.major,tone:'mid'});
 const lp:Plan={x:plan.x+plan.w-1,y:plan.y+plan.d-6.4,w:.7,d:4.2,r:.1};
 it.push({k:'solid',paths:slabOf(lp,TOP,.07,P,4),tone:'lo',crease:'none'});
 it.push({k:'line',d:planOutline(insetPlan(lp,.12),TOP+.07,P,4),tone:'faint'});
 it.push({k:'line',d:[0,1,2].map(i=>lineOnTop([lp.x+.22+i*.13,lp.y+.5],[lp.x+.22+i*.13,lp.y+lp.d-.5-i*.7],TOP+.07,P)).join(''),tone:'lo',free:true});
 return it;
}

/** The goal (goal games): net and ground frame (static, behind), posts and crossbar (sorted with the players). */
export const GOAL={half:3.66,bar:2.44,back:2,post:.12};
export function goalBack(P:Projection):Item[]{
 const {half,bar,back}=GOAL,it:Item[]=[];
 it.push({k:'solid',paths:slabOf({x:-back-.08,y:-half-.08,w:.16,d:half*2+.16,r:.06},TOP,.12,P,3),tone:'mid'});
 for(const s of [-1,1])it.push({k:'solid',paths:slabOf({x:-back,y:s*half-.06,w:back,d:.12,r:.04},TOP,.1,P,3),tone:'mid'});
 const net:string[]=[];
 for(let y=-half+.6;y<half-.3;y+=.61)net.push(pathOf([iso([0,y,bar],P),iso([-back,y,.12],P)]));
 for(let f=.2;f<1;f+=.2)net.push(pathOf([iso([-back*f,-half,TOP+.1+(bar-.1)*(1-f)],P),iso([-back*f,half,TOP+.1+(bar-.1)*(1-f)],P)]));
 for(const s of [-1,1])for(let f=.25;f<1;f+=.25)net.push(pathOf([iso([-back*f,s*half,.1],P),iso([-back*f,s*half,bar*(1-f)+.1],P)]));
 it.push({k:'line',d:net.join(''),tone:'faint'});
 return it;
}
export type Sorted={key:number;items:Item[];tr?:string};
export function goalFront(P:Projection):Sorted[]{
 const {half,bar,post}=GOAL,out:Sorted[]=[];
 for(const s of [-1,1])out.push({key:depthOf([0,s*half,0],P),items:[{k:'solid',paths:cylinder(0,s*half,post,TOP,bar,P,20),tone:'hi',crease:'none'}]});
 const n=4;for(let i=0;i<n;i++){const y0=-half-post+(half*2+post*2)*i/n,y1=-half-post+(half*2+post*2)*(i+1)/n;
  out.push({key:depthOf([0,(y0+y1)/2,0],P)+.05,items:[{k:'solid',paths:slabOf({x:-post,y:y0,w:post*2,d:y1-y0,r:i===0||i===n-1?.05:0},bar-post,post*2,P,3),tone:'hi',crease:'none'}]});}
 return out;
}

// ── The game piece ────────────────────────────────────────────────────────────────────────────────────────────────────────
export type PieceKind='stand'|'diveL'|'diveR';
/** One turned game piece built at the origin (moved with translate): base, column with a waist seam, collar, neck, head. */
/** How much bigger than true scale the pieces are drawn in play: on a small stage (a phone) the pitch keeps its metres but the
 *  pieces grow until a standing piece is about 30 px a metre tall, up to 1.5×, so they stay big enough to see and tap. */
export const growOf=(P:Projection)=>Math.min(1.5,Math.max(1,30/cameraOf(P).k));
export function piece(P:Projection,kind:PieceKind='stand',grow=1):Item[]{
 const F=FIG*grow,it:Item[]=[];
 if(kind==='stand'){
  it.push({k:'solid',paths:cylinder(0,0,.44*F,TOP,.14*F,P,28,.03),tone:'mid'});
  it.push({k:'solid',paths:cylinder(0,0,.23*F,TOP+.14*F,.92*F,P,24),tone:'hi',inner:sideArc(0,0,.23*F,TOP+.62*F,P,16)});
  it.push({k:'solid',paths:cylinder(0,0,.33*F,TOP+1.06*F,.15*F,P,28,.02),tone:'hi'});
  it.push({k:'solid',paths:cylinder(0,0,.1*F,TOP+1.21*F,.1*F,P,14),tone:'hi',crease:'none'});
  const r=.21*F;it.push({k:'ball',c:iso([0,0,TOP+1.31*F+r],P),r:r*cameraOf(P).k,cls:'head'});
 }else{const s=kind==='diveR'?1:-1,L=1.45*F;
  it.push({k:'solid',paths:slabOf({x:-.27*F,y:s>0?-.2*F:-L+.2*F,w:.54*F,d:L,r:.25*F},TOP+.22*F,.46*F,P,8,.03),tone:'hi'});
  const r=.21*F;it.push({k:'ball',c:iso([0,s*(L-.05*F),TOP+.48*F],P),r:r*cameraOf(P).k,cls:'head'});
 }
 return it;
}
/** The ring under the legend you play (the one accent besides the ball) and the shadow under any piece. */
export const meRing=(P:Projection,grow=1):Item[]=>[{k:'line',d:ring(0,0,.62*FIG*grow,TOP+.06,P,40),tone:'lit',cls:'accentLine'}];
export const pieceShadow=(P:Projection,grow=1):Item=>({k:'shadow',d:onTop(circleRing(.08,.08,.5*FIG*grow,28),TOP,P,true),o:.9});
/** Screen offset (px) that moves a piece built at the origin to (X, Y, z). */
export const offset=(P:Projection,X:number,Y:number,z=0):Flat=>axisVector(P,[X,Y,z]);
export const depthAt=(P:Projection,X:number,Y:number,z=0)=>depthOf([X,Y,z],P);

/** The ball (accent) at render (X, Y, z), radius BALL_R, and its shadow on the floor (fainter as it rises). */
export function ballItems(P:Projection,X:number,Y:number,z:number):{shadow:Item;ball:Item}{
 const r=BALL_R;return {shadow:{k:'shadow',d:onTop(circleRing(X+.06,Y+.06,r*1.05,20),TOP,P,true),o:Math.max(.15,.85-z*.22)},ball:{k:'ball',c:iso([X,Y,TOP+z+r],P),r:r*cameraOf(P).k,cls:'ball'}};
}
/** Which way a piece faces when it dives, from the actor's pose and flip. */
export const kindOf=(a:Actor):PieceKind=>a.pose==='dive'?(a.flip?'diveL':'diveR'):'stand';

/** Every point a game uses must sit on its board (tests): the actors and the ball in their rest pose. */
export function gamePoints(a:Att):V[]{
 switch(a.g.kind){
  case 'save':return [{x:13.6,y:-1.6},{x:11,y:0},{x:.7,y:0}];
  case 'overlap':return [{x:OVER.start,y:OVER.lane},OVER.mate,OVER.def,{x:0,y:OVER.lane-14}];
  case 'intercept':return [INT.passer,INT.a,INT.b,INT.cb];
  case 'through':return [THR.me,THR.d1,THR.d2,THR.mate0,THR.mate1];
  case 'beat':return [BEAT.me,BEAT.def,BEAT.out];
  case 'finish':return [FIN.me,FIN.ball,FIN.k0,FIN.def0];
 }
}
export type {Point3};

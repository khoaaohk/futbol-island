import * as k from '../anatomy/iso-kit';
import type {Plan,Projection,SolidPaths,LineTone,Point3} from '../anatomy/iso-kit';
import {POSES,joints as jointsOf,ballItem,byDepth,figureItems,runAt,shadowAt,type Fig,type Item,type Kit,type Part,type PoseName} from '../anatomy/figure';
import {CLOCK_END,CROWD_MAX,clockText} from './board';
import {current} from './pressRules';
import {MID,POST_A,POST_B,SPOT,aimFrom,type BP,type V,type Who} from './model';

/**
 * backpass-1992 · the penalty-area model (Oct 12 2026 anatomy Paper rebuild; user: every exhibit but the penalty kick is an
 * isometric technical illustration in the Paper theme, LARGE, filling the screen). Pure: tests render it in Node.
 * A bench model of your penalty area, seen from up the pitch: a base plate on feet, a turf deck with the box painted on, your
 * goal and net, a stand of paper fans behind it (they nod off while your keeper holds the ball), and the stadium clock on a
 * post, its digits showing the match time (88:00 → 90:00). The keeper's floor ring is the law: green = hands allowed, red
 * (the accent) = feet only. World: centimetres (model.ts works in metres; ×100 here).
 */
export const AZ=14,EL=32;
const C=100;
export const PLATE:Plan={x:-560,y:-380,w:2260,d:1860,r:36};
export const TURF=k.insetPlan(PLATE,36);
const STAND={x:-300,rows:4,y0:-120,y1:1320};
const CLOCK={x:-330,y:-200};
export function cameraFor(w:number,h:number):Projection{
 const narrow=w/h<1.1;
 const pts:Point3[]=narrow?[...k.boxCorners({x:-200,y:0,w:1450,d:1320,r:0},0,120),[CLOCK.x,CLOCK.y,330]]
  :[...k.boxCorners({x:-420,y:-120,w:1820,d:1480,r:0},0,120),[CLOCK.x,CLOCK.y,330]];
 return k.fitProjection(pts,Math.max(1,w),Math.max(1,h),{pad:narrow?6:Math.min(26,w*.025),azimuth:AZ,elevation:narrow?56:EL});
}
/** The floor point (metres, model.ts) under a screen point. */
export function floorAt(P:Projection,sx:number,sy:number){const o=k.iso([0,0,0],P),ax=k.iso([1,0,0],P),ay=k.iso([0,1,0],P);
 const a=ax[0]-o[0],b=ay[0]-o[0],c=ax[1]-o[1],d=ay[1]-o[1],det=a*d-b*c||1,X=sx-o[0],Y=sy-o[1];return {x:(d*X-b*Y)/det/C,y:(a*Y-c*X)/det/C};}

export function benchParts(s:BP,P:Projection):Part[]{
 const out:Part[]=[],S=(paths:SolidPaths,o:Omit<Extract<Part,{kind:'solid'}>,'kind'|'paths'>={})=>out.push({kind:'solid',paths,...o});
 const Ln=(d:string,tone:LineTone='lo')=>out.push({kind:'line',d,tone});
 const byD=(pts:k.Plane[])=>[...pts].sort((a,b)=>k.depthOf([a[0],a[1],0],P)-k.depthOf([b[0],b[1],0],P));
 out.push({kind:'halo',d:k.haloOf(PLATE,-62,50,P)});
 for(const [x,y] of byD(k.corners(PLATE,70))){S(k.cylinder(x,y,30,-62,4,P,40),{tone:'mid',crease:'none'});S(k.cylinder(x,y,24,-58,14,P,40),{tone:'hi',crease:'lo'});}
 S(k.slabOf(PLATE,-46,36,P,8,1.6),{tone:'hi',crease:'lo',inner:k.lineSvg(k.sideSeam(PLATE,-30,P,8),{tone:'faint'})});
 Ln(k.planOutline(k.insetPlan(PLATE,13),-10,P));
 for(const [x,y] of k.corners(PLATE,25)){Ln(k.ring(x,y,7,-10,P,20));out.push({kind:'dots',pts:[k.iso([x,y,-10],P)],size:1.1,tone:'hi'});}
 const strip:Plan={x:PLATE.x+PLATE.w-28,y:PLATE.y+40,w:14,d:1500,r:2};S(k.slabOf(strip,-10,1.4,P,3),{tone:'lo',crease:'none'});
 const t=k.topTicks(strip.y+10,strip.y+strip.d-10,20,5,strip.x+.6,-8.6,[5,9.5],P,'y');Ln(t.minor);Ln(t.major,'mid');
 const label:Plan={x:PLATE.x+PLATE.w-32,y:PLATE.y+PLATE.d-210,w:22,d:170,r:3};S(k.slabOf(label,-10,1.8,P,4,.6),{tone:'mid',crease:'faint'});
 out.push({kind:'text',transform:k.topMatrix([label.x+15,label.y+10],-8.2,P,'y'),text:'LAW 12 · BACK-PASS 1992',size:8});
 S(k.slabOf(TURF,-10,10,P,6,1),{tone:'hi',crease:'lo'});
 const y0=TURF.y+2,y1=TURF.y+TURF.d-2;
 for(let x=150;x<TURF.x+TURF.w-20;x+=150)Ln(k.lineOnTop([x,y0],[x,y1],0,P),'faint');
 const paint=(pts:k.Plane[])=>Ln(k.onTop(pts,0,P),'mid');
 paint([[0,y0],[0,y1]]);paint([[-12,y0],[-12,y1]]);
 const box=(d:number)=>{const ya=Math.max(y0,POST_A*C-d),yb=Math.min(y1,POST_B*C+d);paint([[0,ya],[d,ya],[d,yb],[0,yb]]);paint([[0,ya+12],[d-12,ya+12],[d-12,yb-12],[0,yb-12]]);};
 box(550);box(1650);
 out.push({kind:'dots',pts:[k.iso([1100,MID*C,0],P)],size:2,tone:'hi'});
 // The arc at the top of the box (9.15 m from the spot), outside the box only.
 {const pts:k.Plane[]=[];for(let i=0;i<=24;i++){const a=-.92+1.84*i/24,x=1100+915*Math.cos(a),y=MID*C+915*Math.sin(a);if(x>=1650&&x<=TURF.x+TURF.w-2)pts.push([x,y]);}if(pts.length>1)paint(pts);}
 // The stand behind the goal: stepped benches, paper fans who nod off as the football stops.
 const sleepy=s.mode==='r1'?1-s.game.crowd/CROWD_MAX:0;
 for(let r=STAND.rows-1;r>=0;r--)S(k.slabOf({x:-300-r*60,y:STAND.y0,w:60,d:STAND.y1-STAND.y0,r:2},0,30+r*34,P,2,.6),{tone:'hi',crease:'lo'});
 // Fans: front row last (nearest); each a body capsule and a head; heads drop when asleep.
 const fans:Item[]=[];
 for(let r=STAND.rows-1;r>=0;r--){const h=30+r*34,x=-270-r*60;for(let i=0;i<22;i++){const y=STAND.y0+40+i*62+(r%2)*24,hash=(i*7+r*13)%11;if(hash===3)continue;
  const nod=sleepy>((hash*37+r*11)%100)/100;fans.push(...figureItems({id:'fan',x,y,h:0,kit:(['light','grey','light','keeper'] as Kit[])[hash%4],pose:nod?POSES.sleep:POSES.stand},P).filter(it=>it.kind!=='cap'||it.tone.startsWith('shirt')).map(it=>shiftUp(it,h,P)));}}
 out.push({kind:'items',items:byDepth(fans)});
 // The stadium clock on its post: a box with a window whose digits show the match time.
 const c=CLOCK;S(k.slabOf({x:c.x-40,y:c.y-40,w:80,d:80,r:6},0,10,P,4,.8),{tone:'hi',crease:'lo'});
 S(k.cylinder(c.x,c.y,8,10,190,P,24),{tone:'hi',crease:'none',inner:k.lineSvg(k.sideArc(c.x,c.y,8,110,P,12),{tone:'faint'})});
 const cb:Plan={x:c.x-30,y:c.y-120,w:60,d:240,r:6};S(k.slabOf(cb,200,110,P,4,1),{tone:'hi',crease:'lo'});
 S(k.slabOf(k.insetPlan(cb,-4),310,6,P,4,.6),{tone:'hi',crease:'lo'});
 const fx=cb.x+cb.w+.3,full=s.mode==='r1'&&s.game.clock>=CLOCK_END;
 out.push({kind:'line',d:k.pathOf([[fx,cb.y+18,220],[fx,cb.y+cb.d-18,220],[fx,cb.y+cb.d-18,292],[fx,cb.y+18,292]].map(p=>k.iso(p as Point3,P)),true),tone:'hi'});
 out.push({kind:'text',transform:k.sideMatrix([fx,cb.y+cb.d-26],268,P,'right'),text:s.mode==='r1'?clockText(s.game.clock):'88:00',size:46,ink:full?'accent':'hi'});
 out.push({kind:'text',transform:k.sideMatrix([fx,cb.y+cb.d-26],286,P,'right'),text:'HOME 1 – 0',size:13});
 // The goal: net behind, far post, crossbar, near post.
 const gx=-6,bx=-200,H=244,hb=180,ya=POST_A*C,yb=POST_B*C;
 for(let y=ya;y<=yb+.1;y+=61)Ln(k.segment([bx,y,0],[bx,y,hb],P),'faint');for(let z=0;z<=hb+.1;z+=36)Ln(k.segment([bx,ya,z],[bx,yb,z],P),'faint');
 for(let y=ya;y<=yb+.1;y+=61)Ln(k.segment([gx,y,H],[bx,y,hb],P),'faint');
 for(const y of [ya,yb])for(let x=gx;x>=bx;x-=40)Ln(k.segment([x,y,0],[x,y,H+(hb-H)*(gx-x)/(gx-bx)],P),'faint');
 S(k.cylinder(bx,ya,3,0,hb,P,16),{tone:'mid'});S(k.cylinder(bx,yb,3,0,hb,P,16),{tone:'mid'});
 S(k.cylinder(gx,ya,6,0,H,P,24),{tone:'hi',crease:'lo'});S(k.slabOf({x:gx-6,y:ya-6,w:12,d:yb-ya+12,r:5},H-12,12,P,3),{tone:'hi',crease:'lo'});S(k.cylinder(gx,yb,6,0,H,P,24),{tone:'hi',crease:'lo'});
 return out;
}
function shiftUp(it:Item,h:number,P:Projection):Item{const d=k.screenRise(h,P);
 if(it.kind==='cap')return {...it,a:[it.a[0],it.a[1]-d],b:[it.b[0],it.b[1]-d],depth:it.depth+h*.4};
 if(it.kind==='ball')return {...it,c:[it.c[0],it.c[1]-d],depth:it.depth+h*.4};return it;}

const KITS:Record<Who,Kit>={K:'keeper',D:'light',L:'light',R:'light',S:'grey',M:'grey',N:'grey'};
const face=(from:V,to:V)=>Math.atan2(to.y-from.y,to.x-from.x)*180/Math.PI;
/** Players, the ball, the keeper's ring (the law) and the live aim. `aim` = the drag point (metres) while you aim. */
export function actorItems(s:BP,P:Projection,aim:V|null){
 const r2=s.mode==='r2',rally=r2?current(s.press):null,K=s.pos.K,items:Item[]=[];
 const kicked=s.phase==='incoming'&&s.flight&&s.flight.t<.25,run=s.phase==='decide'&&!s.reduced;
 const poseOf=(w:Who):PoseName|'run'=>w==='K'?(s.inHands?'catch':'ready'):w==='D'?(kicked?(rally?.kind==='head'?'header':'pass'):'stand')
  :(w==='L'||w==='R')?(s.outcome==='pass'&&s.choice===w?'ready':'stand'):w==='S'?(run||(s.phase==='outcome'&&s.outcome==='stolen')?'run':'stand'):'stand';
 const figs:Fig[]=(Object.keys(s.pos) as Who[]).map(w=>{const p=s.pos[w],q=poseOf(w);
  return {id:w,x:p.x*C,y:p.y*C,h:w==='K'?0:face(p,s.ball),kit:KITS[w],pose:q==='run'?runAt(s.t,w==='S'?0:.5):POSES[q]};});
 for(const f of figs)items.push(...figureItems(f,P));
 if(s.inHands){const hk=handsOf(figs.find(f=>f.id==='K')!,P);items.push({...ballItem(hk,P,0,'ball',1.6),depth:k.depthOf(hk,P)+6});}
 else items.push(ballItem([s.ball.x*C,s.ball.y*C,s.ball.z*C+18],P,s.t*8,'ball',1.6));
 const shadows=figs.map(f=>shadowAt(f.x,f.y,34,P));if(!s.inHands)shadows.push(shadowAt(s.ball.x*C,s.ball.y*C,13,P));
 // The law under the keeper: a ring on the grass. Green = hands allowed (1990, or a header), red = feet only (a kick, 1992).
 const handsOk=!r2||rally?.kind==='head',ring=(s.mode==='r1'||s.phase==='decide')?{d:k.ring(K.x*C+20,K.y*C,92,0,P,48),d2:k.ring(K.x*C+20,K.y*C,80,0,P,48),ok:handsOk}:null;
 let aimLine:{d:string;target:string|null;ok:boolean}|null=null;
 if(aim&&s.phase==='decide'){const c=aimFrom(s,aim),from:Point3=[(SPOT.K.x+.35)*C,(SPOT.K.y+.15)*C,4],to:Point3=[aim.x*C,aim.y*C,4];
  const tgt=c==='L'||c==='R'?k.ring(s.pos[c].x*C,s.pos[c].y*C,70,0,P,40):c==='long'?k.ring(aim.x*C,aim.y*C,70,0,P,40):null;
  aimLine={d:k.segment(from,to,P),target:tgt,ok:!!c};}
 return {items:byDepth(items),shadows,ring,aim:aimLine,figs};
}
const handsOf=(f:Fig,P:Projection):Point3=>{void P;const j=jointsOf(f);return [(j.handL[0]+j.handR[0])/2+8,(j.handL[1]+j.handR[1])/2,(j.handL[2]+j.handR[2])/2+6];};
/** Screen position of each player (for a tap: nearest figure to the finger). */
export function figureAt(figs:Fig[],P:Projection,sx:number,sy:number,slop:number):string|null{let best:string|null=null,bd=slop;
 for(const f of figs){const c=k.iso([f.x,f.y,90],P),d=Math.hypot(c[0]-sx,c[1]-sy);if(d<bd){bd=d;best=f.id;}}return best;}

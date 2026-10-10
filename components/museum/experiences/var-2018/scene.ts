/**
 * var-2018 · the VAR room's practice moment (made up, not a real match): one deterministic 3-second clip, drawn by a tiny
 * Canvas 2D "broadcast" renderer from four camera angles. Pure functions only (no DOM, no timers): the Experience asks for a
 * frame when something changed and nothing runs in between.
 *
 * World: x across the pitch (touchlines at ±34 m), y up, z = distance from the goal line into the pitch (metres). The goal
 * line is 12 cm wide and lies between z = −0.12 and z = 0 (lines belong to the area they bound), posts at x = ±3.66.
 *
 * The moment: #10 passes (frame KICK) to #9, who is level-ish with the last outfield defender (ONSIDE by his foot; only his
 * outstretched ARM is ahead, and arms don't count, Law 11). #9 shoots, the keeper claws the ball off the line: at its deepest
 * (frame DEEP) part of the ball is still over the line, so it is NOT a goal (Law 10).
 */
export const FPS=24,FRAMES=72,LAST=FRAMES-1,KICK=20,DEEP=50,BALL_R=.11,LINE_W=.12;
export type CamId='wide'|'offside'|'goal'|'behind';
export type P3={x:number;y:number;z:number};
const p3=(x:number,y:number,z:number):P3=>({x,y,z});
const add=(a:P3,b:P3)=>p3(a.x+b.x,a.y+b.y,a.z+b.z),sub=(a:P3,b:P3)=>p3(a.x-b.x,a.y-b.y,a.z-b.z),mul=(a:P3,s:number)=>p3(a.x*s,a.y*s,a.z*s);
const dot=(a:P3,b:P3)=>a.x*b.x+a.y*b.y+a.z*b.z,cross=(a:P3,b:P3)=>p3(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);
const norm=(a:P3)=>{const l=Math.hypot(a.x,a.y,a.z)||1;return mul(a,1/l);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t,lerp3=(a:P3,b:P3,t:number)=>p3(lerp(a.x,b.x,t),lerp(a.y,b.y,t),lerp(a.z,b.z,t));
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));

// ---- People ------------------------------------------------------------------------------------------------------------------
type Key=[frame:number,x:number,z:number];
function track(keys:readonly Key[],f:number){
 if(f<=keys[0][0])return {x:keys[0][1],z:keys[0][2]};
 for(let i=1;i<keys.length;i++){const a=keys[i-1],b=keys[i];if(f<=b[0]){const t=(f-a[0])/(b[0]-a[0]);return {x:lerp(a[1],b[1],t),z:lerp(a[2],b[2],t)};}}
 const l=keys[keys.length-1];return {x:l[1],z:l[2]};
}
type Role='att'|'def'|'gk'|'ref';
type Person={id:string;role:Role;num:string;keys:readonly Key[];stride:number;omega:number;reach?:boolean};
// Every runner's stride peaks (right foot fully forward) on the kick frame, so the offside picture is crisp.
const PEOPLE:readonly Person[]=[
 {id:'passer',role:'att',num:'10',keys:[[0,-13.6,31.6],[KICK,-11,28.4],[40,-9.4,26],[LAST,-8,24.4]],stride:.42,omega:.52},
 {id:'striker',role:'att',num:'9',keys:[[0,-.2,21.6],[KICK,.6,16.98],[34,1.6,12.5],[38,1.9,11],[50,2.3,7.6],[LAST,2.5,6.6]],stride:.4,omega:.55,reach:true},
 {id:'defender',role:'def',num:'4',keys:[[0,-4.2,19.6],[KICK,-3.5,16.86],[34,-2.4,13.4],[50,-1.4,9.6],[LAST,-1.1,8.8]],stride:.4,omega:.55},
 {id:'winger',role:'att',num:'11',keys:[[0,10.4,25.6],[KICK,10.6,22.6],[LAST,8.6,14.6]],stride:.38,omega:.5},
 {id:'fullback',role:'def',num:'3',keys:[[0,6.8,23.4],[KICK,6.2,20.6],[LAST,4.4,12.2]],stride:.36,omega:.5},
 {id:'referee',role:'ref',num:'',keys:[[0,-7,38],[KICK,-6,34],[LAST,-3,26]],stride:.3,omega:.45},
];
/** Kits: shirt, shorts, socks, boots, skin, hair, number ink. Arms and legs are shaded as lit cylinders (light from the upper left). */
export const COLORS:Record<Role,{shirt:string;shorts:string;socks:string;boots:string;skin:string;hair:string;ink:string;gloves?:string}>={
 att:{shirt:'#ff7a2f',shorts:'#f4efe6',socks:'#ff7a2f',boots:'#15171a',skin:'#a86f4b',hair:'#1b1310',ink:'#fff4ea'},
 def:{shirt:'#6fc8ff',shorts:'#173b6b',socks:'#e9f4fb',boots:'#15171a',skin:'#e0b48e',hair:'#5a3a22',ink:'#0d2a4d'},
 gk:{shirt:'#ff4fd8',shorts:'#2a1033',socks:'#ff4fd8',boots:'#15171a',skin:'#8a5a3c',hair:'#120c0a',ink:'#2a1033',gloves:'#f5f7fa'},
 ref:{shirt:'#ffd84a',shorts:'#111418',socks:'#111418',boots:'#0b0c0e',skin:'#d39b72',hair:'#2b1d14',ink:'#111418'},
};
type Pose={pelvis:P3;neck:P3;head:P3;lSh:P3;rSh:P3;lEl:P3;rEl:P3;lHand:P3;rHand:P3;lKnee:P3;rKnee:P3;lAnk:P3;rAnk:P3;lToe:P3;rToe:P3};
const UP=p3(0,1,0);
function heading(p:Person,f:number){const a=track(p.keys,f-1),b=track(p.keys,f+1);const h=norm(p3(b.x-a.x,0,b.z-a.z));return h.x||h.z?h:p3(0,0,-1);}
function runPose(base:P3,fwd:P3,phase:number,stride:number,reach:boolean):Pose{
 const side=p3(-fwd.z,0,fwd.x),sw=Math.sin(phase),cw=Math.cos(phase),pelvis=add(base,p3(0,.95,0));
 const foot=(s:number,lift:number)=>add(add(base,mul(fwd,stride*s)),p3(0,.06+lift,0));
 const rAnk=add(foot(sw,.14*Math.max(0,-cw)),mul(side,.12)),lAnk=add(foot(-sw,.14*Math.max(0,cw)),mul(side,-.12));
 const knee=(ank:P3,s:number)=>add(lerp3(add(pelvis,mul(side,s*.1)),ank,.5),add(mul(fwd,.12),p3(0,.04,0)));
 const neck=add(add(base,mul(fwd,.06)),p3(0,1.45,0)),head=add(add(base,mul(fwd,.1)),p3(0,1.68,0));
 const rSh=add(neck,add(mul(side,.2),p3(0,-.04,0))),lSh=add(neck,add(mul(side,-.2),p3(0,-.04,0)));
 const rHand=reach?add(rSh,add(mul(fwd,.74),p3(0,-.06,0))):add(rSh,add(mul(fwd,-.32*sw),add(mul(side,.06),p3(0,-.44,0))));
 const lHand=add(lSh,add(mul(fwd,.32*sw),add(mul(side,-.06),p3(0,-.44,0))));
 const elbow=(sh:P3,hand:P3,s:number)=>add(lerp3(sh,hand,.5),add(mul(side,s*.06),p3(0,-.06,0)));
 return {pelvis,neck,head,lSh,rSh,lHand,rHand,lEl:elbow(lSh,lHand,-1),rEl:elbow(rSh,rHand,1),lKnee:knee(lAnk,-1),rKnee:knee(rAnk,1),lAnk,rAnk,lToe:add(lAnk,mul(fwd,.14)),rToe:add(rAnk,mul(fwd,.14))};
}
function personPose(p:Person,f:number):Pose{
 const t=track(p.keys,f),fwd=heading(p,f),phase=Math.PI/2+(f-KICK)*p.omega;
 return runPose(p3(t.x,0,t.z),fwd,phase,p.stride,!!p.reach&&f>=KICK-3&&f<=KICK+4);
}
/** The keeper: set on the line, then a dive to his left that claws the ball back off the line at DEEP. */
function keeperPose(f:number):Pose{
 if(f<=40){const t=track([[0,0,2.2],[30,.4,1.6],[40,.8,1.1]],f),base=p3(t.x,0,t.z),fwd=p3(0,0,1),side=p3(1,0,0),b=Math.sin(f*.5)*.02;
  const pelvis=add(base,p3(0,.86+b,0)),neck=add(base,p3(0,1.38+b,.08)),head=add(base,p3(0,1.6+b,.1));
  const rSh=add(neck,mul(side,.22)),lSh=add(neck,mul(side,-.22)),rHand=add(base,p3(.5,1.05,.3)),lHand=add(base,p3(-.5,1.05,.3));
  const rAnk=add(base,p3(.28,.06,0)),lAnk=add(base,p3(-.28,.06,0));
  return {pelvis,neck,head,rSh,lSh,rHand,lHand,rEl:lerp3(rSh,rHand,.5),lEl:lerp3(lSh,lHand,.5),rKnee:add(lerp3(pelvis,rAnk,.5),p3(.06,0,.14)),lKnee:add(lerp3(pelvis,lAnk,.5),p3(-.06,0,.14)),rAnk,lAnk,rToe:add(rAnk,mul(fwd,.14)),lToe:add(lAnk,mul(fwd,.14))};}
 const t=clamp((f-40)/10,0,1),e=1-(1-t)*(1-t),land=clamp((f-DEEP)/6,0,1);
 const theta=lerp(0,1.32,e),dir=p3(Math.sin(theta),Math.cos(theta),0),zSide=p3(0,0,1);
 const pelvis=p3(lerp(.8,1.55,e)+land*.1,lerp(.86,.44,e)-land*.24,lerp(1.1,.66,e));
 const neck=add(pelvis,mul(dir,.5)),head=add(pelvis,mul(dir,.72));
 const rSh=add(neck,mul(zSide,-.2)),lSh=add(neck,mul(zSide,.2));
 const b=ballAt(Math.min(f,DEEP+3)),reachT=clamp((f-43)/6,0,1);
 const rHand=lerp3(add(rSh,mul(dir,.4)),add(b,p3(.06,.07,-.15)),reachT),lHand=lerp3(add(lSh,mul(dir,.4)),add(b,p3(-.04,.12,.06)),reachT*.85);
 const rAnk=add(sub(pelvis,mul(dir,.92)),p3(0,0,-.16)),lAnk=add(sub(pelvis,mul(dir,.86)),p3(0,0,.2));
 rAnk.y=Math.max(.06,rAnk.y);lAnk.y=Math.max(.06,lAnk.y);
 return {pelvis,neck,head,rSh,lSh,rHand,lHand,rEl:add(lerp3(rSh,rHand,.5),p3(0,.08,0)),lEl:add(lerp3(lSh,lHand,.5),p3(0,.08,0)),rKnee:lerp3(pelvis,rAnk,.5),lKnee:add(lerp3(pelvis,lAnk,.5),p3(0,.1,0)),rAnk,lAnk,rToe:add(rAnk,p3(-.1,0,0)),lToe:add(lAnk,p3(-.1,0,0))};
}

// ---- Ball ---------------------------------------------------------------------------------------------------------------------
const PASSER=PEOPLE[0],STRIKER=PEOPLE[1];
/** The ball sits still on the kick spot until #10's right toe meets it on frame KICK. */
const KICK_SPOT=(()=>{const pose=personPose(PASSER,KICK),fwd=heading(PASSER,KICK);const s=add(pose.rToe,mul(fwd,BALL_R+.01));return p3(s.x,BALL_R,s.z);})();
const strikerFoot=(f:number)=>{const t=track(STRIKER.keys,f),h=heading(STRIKER,f);return p3(t.x+h.x*.62,BALL_R,t.z+h.z*.62);};
/** The deepest point: 17 cm behind the goal line's field edge, so the ball's near edge (−6 cm) is still on the 12 cm line. */
export const DEEPEST=p3(2.3,.26,-.17);
const BOUNCE=p3(3.4,BALL_R,2.6),REST=p3(4.6,BALL_R,4.6);
export function ballAt(f:number):P3{
 if(f<=KICK)return KICK_SPOT;
 if(f<=34){const t=(f-KICK)/14,a=KICK_SPOT,b=strikerFoot(34),p=lerp3(a,b,t);p.y=BALL_R+.45*Math.sin(Math.PI*t);return p;}
 if(f<=38)return strikerFoot(f);
 const S=strikerFoot(38);
 if(f<=DEEP){const t=(f-38)/(DEEP-38),p=lerp3(S,DEEPEST,t);p.y=lerp(BALL_R,DEEPEST.y,t)+.3*Math.sin(Math.PI*t);return p;}
 if(f<=58){const t=(f-DEEP)/8,p=lerp3(DEEPEST,BOUNCE,t);p.y=lerp(DEEPEST.y,BALL_R,t)+.5*Math.sin(Math.PI*t);return p;}
 const t=1-Math.pow(1-(f-58)/(LAST-58),2);return lerp3(BOUNCE,REST,t);
}

// ---- The truth (what the visitor has to find) -----------------------------------------------------------------------------
type Part={name:string;z:number};
/** The body parts you may score with (head, body, feet), and the arms (which don't count for offside, Law 11). */
function parts(p:Pose){
 const body:Part[]=[{name:'foot',z:p.lToe.z},{name:'foot',z:p.rToe.z},{name:'foot',z:p.lAnk.z},{name:'foot',z:p.rAnk.z},{name:'knee',z:p.lKnee.z},{name:'knee',z:p.rKnee.z},
  {name:'body',z:p.pelvis.z},{name:'shoulder',z:Math.min(p.lSh.z,p.rSh.z)},{name:'head',z:p.head.z-.11}];
 const arms:Part[]=[{name:'arm',z:p.lHand.z},{name:'arm',z:p.rHand.z},{name:'arm',z:p.lEl.z},{name:'arm',z:p.rEl.z}];
 const near=(l:Part[])=>l.reduce((a,b)=>b.z<a.z?b:a);
 return {body:near(body),arm:near(arms)};
}
const atKick=(id:string)=>parts(personPose(PEOPLE.find(p=>p.id===id)!,KICK));
export const TRUTH=(()=>{const d=atKick('defender'),a=atKick('striker'),edge=DEEPEST.z+BALL_R;
 return {defender:d.body.z,defenderPart:d.body.name,attacker:a.body.z,attackerPart:a.body.name,attackerArm:a.arm.z,
  /** cm the attacker's foot is BEHIND the defender's (positive = onside). */
  onsideCm:Math.round((a.body.z-d.body.z)*100),armAheadCm:Math.round((d.body.z-a.arm.z)*100),
  /** cm of the ball still over the goal line at its deepest (positive = no goal). */
  ballOnLineCm:Math.round((edge+LINE_W)*100),wholeBallOver:edge<-LINE_W};})();
export type LineTarget={id:'def'|'att'|'arm';z:number;label:string;who:'def'|'att'};
export const LINE_TARGETS:readonly LineTarget[]=[
 {id:'def',z:TRUTH.defender,label:`Defender’s ${TRUTH.defenderPart}`,who:'def'},
 {id:'att',z:TRUTH.attacker,label:`Attacker’s ${TRUTH.attackerPart}`,who:'att'},
 {id:'arm',z:TRUTH.attackerArm,label:'Attacker’s arm',who:'att'},
];
export const SNAP=.2;
export function snapLine(who:'def'|'att',z:number):{z:number;target:LineTarget|null}{
 let best:LineTarget|null=null,bd=SNAP;for(const t of LINE_TARGETS)if(t.who===who&&Math.abs(t.z-z)<bd){best=t;bd=Math.abs(t.z-z);}
 return best?{z:best.z,target:best}:{z,target:null};
}

// ---- Cameras --------------------------------------------------------------------------------------------------------------------
export type Cam={id:CamId;label:string;short:string;pos:P3;target:P3;fov:number};
export const CAMS:readonly Cam[]=[
 {id:'wide',label:'CAM 1 · Main',short:'Main',pos:p3(-46,21,28),target:p3(-1,0,13),fov:30},
 {id:'offside',label:'CAM 2 · Offside',short:'Offside',pos:p3(-44,15,17.2),target:p3(-.6,.7,16.6),fov:13},
 {id:'goal',label:'CAM 3 · Goal line',short:'Goal line',pos:p3(-3.1,.95,-.06),target:p3(2.3,.22,-.06),fov:19},
 {id:'behind',label:'CAM 4 · Behind the goal',short:'Behind',pos:p3(1.2,2.7,-10),target:p3(.8,.6,8),fov:42},
];
export const camOf=(id:CamId)=>CAMS.find(c=>c.id===id)!;
type View={toCam:(p:P3)=>P3;proj:(c:P3)=>{x:number;y:number};focal:number;w:number;h:number;cam:Cam;r:P3;u:P3;f:P3};
const NEAR=.05;
function view(cam:Cam,w:number,h:number,zoom=1):View{
 const f=norm(sub(cam.target,cam.pos)),r=norm(cross(f,UP)),u=cross(r,f),focal=(h/2)/Math.tan(cam.fov/zoom*Math.PI/360);
 return {f,r,u,focal,w,h,cam,toCam:p=>{const d=sub(p,cam.pos);return p3(dot(d,r),dot(d,u),dot(d,f));},proj:c=>({x:w/2+c.x/c.z*focal,y:h/2-c.y/c.z*focal})};
}
/** Where a screen point lands on the grass (z only), for dragging the offside lines. Null when it points at the sky. */
export function groundZAt(id:CamId,w:number,h:number,sx:number,sy:number,zoom=1):number|null{
 const v=view(camOf(id),w,h,zoom),d=add(v.f,add(mul(v.r,(sx-w/2)/v.focal),mul(v.u,-(sy-h/2)/v.focal)));
 if(d.y>=-1e-4)return null;const t=-v.cam.pos.y/d.y;return v.cam.pos.z+t*d.z;
}
export function screenOf(id:CamId,w:number,h:number,p:P3,zoom=1){const v=view(camOf(id),w,h,zoom),c=v.toCam(p);return c.z>NEAR?v.proj(c):null;}

// ---- Drawing ----------------------------------------------------------------------------------------------------------------------
function clipPoly(pts:P3[]):P3[]{
 const out:P3[]=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],ia=a.z>NEAR,ib=b.z>NEAR;
  if(ia)out.push(a);if(ia!==ib){const t=(NEAR-a.z)/(b.z-a.z);out.push(lerp3(a,b,t));}}
 return out;
}
function poly(g:CanvasRenderingContext2D,v:View,world:P3[],fill:string){
 const c=clipPoly(world.map(v.toCam));if(c.length<3)return;g.beginPath();c.forEach((q,i)=>{const s=v.proj(q);if(i)g.lineTo(s.x,s.y);else g.moveTo(s.x,s.y);});g.closePath();g.fillStyle=fill;g.fill();
}
function seg(g:CanvasRenderingContext2D,v:View,a:P3,b:P3){
 let ca=v.toCam(a),cb=v.toCam(b);if(ca.z<=NEAR&&cb.z<=NEAR)return null;
 if(ca.z<=NEAR)ca=lerp3(ca,cb,(NEAR-ca.z)/(cb.z-ca.z));else if(cb.z<=NEAR)cb=lerp3(cb,ca,(NEAR-cb.z)/(ca.z-cb.z));
 const sa=v.proj(ca),sb=v.proj(cb);return {sa,sb,depth:(ca.z+cb.z)/2};
}
const groundRect=(x0:number,x1:number,z0:number,z1:number)=>[p3(x0,0,z0),p3(x1,0,z0),p3(x1,0,z1),p3(x0,0,z1)];
function pitch(g:CanvasRenderingContext2D,v:View){
 poly(g,v,groundRect(-70,70,-50,100),'#123c24');
 for(let i=0;i<17;i++){const z0=i*5.25;poly(g,v,groundRect(-34,34,z0,z0+5.25),i%2?'#1a5531':'#1d5e36');}
 poly(g,v,groundRect(-34,34,-6,-LINE_W),'#154629');
 const L='#e9efe6',W=LINE_W,line=(x0:number,x1:number,z0:number,z1:number)=>poly(g,v,groundRect(x0,x1,z0,z1),L);
 line(-34,34,-W,0);line(-34-W,-34,-W,84);line(34,34+W,-W,84);
 line(-9.16,9.16,5.5-W,5.5);line(-9.16-W,-9.16,0,5.5);line(9.16,9.16+W,0,5.5);
 line(-20.16,20.16,16.5-W,16.5);line(-20.16-W,-20.16,0,16.5);line(20.16,20.16+W,0,16.5);
 line(-34,34,52.5-W/2,52.5+W/2);
 const spot:P3[]=[];for(let i=0;i<12;i++){const a=i/12*Math.PI*2;spot.push(p3(Math.cos(a)*.12,0,11+Math.sin(a)*.12));}poly(g,v,spot,L);
 // The penalty arc (outside the area): short quads round the spot at 9.15 m.
 const a0=Math.acos(5.5/9.15);for(let i=0;i<14;i++){const a=-Math.PI/2+a0+(Math.PI-2*a0)*i/14,b=-Math.PI/2+a0+(Math.PI-2*a0)*(i+1)/14,ri=9.15-W;
  poly(g,v,[p3(Math.sin(a)*9.15,0,11+Math.cos(a)*9.15),p3(Math.sin(b)*9.15,0,11+Math.cos(b)*9.15),p3(Math.sin(b)*ri,0,11+Math.cos(b)*ri),p3(Math.sin(a)*ri,0,11+Math.cos(a)*ri)],L);}
}
/** The stadium round the pitch: advertising boards, then a dark sloping stand with tier lines (on the far touchline and both ends). */
const BOARD_COLS=['#12345a','#0f2a44','#1b2f4f','#132a3d'];
function stands(g:CanvasRenderingContext2D,v:View){
 type Side={at:(u:number,d:number,y:number)=>P3;d:number;u0:number;u1:number};
 const sides:Side[]=[{at:(u,d,y)=>p3(d,y,u),d:36,u0:-12,u1:96}];
 if(v.cam.id!=='behind'&&v.cam.id!=='goal')sides.push({at:(u,d,y)=>p3(u,y,-d),d:7,u0:-42,u1:42});
 sides.push({at:(u,d,y)=>p3(u,y,d),d:96,u0:-42,u1:42});
 for(const s of sides){
  const q=(u0:number,u1:number,d0:number,d1:number,y0:number,y1:number)=>[s.at(u0,d0,y0),s.at(u1,d0,y0),s.at(u1,d1,y1),s.at(u0,d1,y1)];
  poly(g,v,q(s.u0-30,s.u1+30,s.d+1.6,s.d+46,0,26),'#0a1017');
  for(let k=1;k<9;k++){const t=k/9,d=s.d+1.6+44.4*t,y=26*t;poly(g,v,q(s.u0-30,s.u1+30,d,d+.5,y,y+.3),k%3?'#101923':'#152230');}
  const n=Math.round((s.u1-s.u0)/6);for(let i=0;i<n;i++){const u0=s.u0+i*6,u1=u0+5.9;
   poly(g,v,q(u0,u1,s.d,s.d,0,.9),BOARD_COLS[i%BOARD_COLS.length]);poly(g,v,q(u0,u1,s.d-.01,s.d-.01,.52,.62),'rgba(120,200,255,.18)');}
 }
}
type Item={depth:number;draw:()=>void};
/** A hex colour mixed toward black (k<0) or white (k>0). */
function tone(hex:string,k:number){const n=parseInt(hex.slice(1),16),c=[n>>16,(n>>8)&255,n&255].map(v=>Math.round(k<0?v*(1+k):v+(255-v)*k));return `rgb(${c[0]},${c[1]},${c[2]})`;}
const toneCache=new Map<string,[string,string]>();
const shades=(hex:string)=>{let t=toneCache.get(hex);if(!t){t=[tone(hex,-.38),tone(hex,.22)];toneCache.set(hex,t);}return t;};
const LIGHT={x:-.6,y:-.8};// screen-space light: upper left, the same for every camera
/** One limb as a lit cylinder: a dark rim on the shadow side, the colour, and a soft highlight toward the light. */
function limb(g:CanvasRenderingContext2D,v:View,items:Item[],a:P3,b:P3,width:number,color:string,bias=0){
 const s=seg(g,v,a,b);if(!s)return;items.push({depth:s.depth+bias,draw:()=>{
  const w=Math.max(1,width*v.focal/s.depth),dx=s.sb.x-s.sa.x,dy=s.sb.y-s.sa.y,l=Math.hypot(dx,dy)||1;let nx=-dy/l,ny=dx/l;if(nx*LIGHT.x+ny*LIGHT.y<0){nx=-nx;ny=-ny;}
  const [dark,lit]=shades(color);g.lineCap='round';
  const line=(o:number,lw:number,c:string)=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.moveTo(s.sa.x+nx*o,s.sa.y+ny*o);g.lineTo(s.sb.x+nx*o,s.sb.y+ny*o);g.stroke();};
  line(0,w,dark);if(w<2.5)return;line(w*.12,w*.74,color);if(w>5)line(w*.26,w*.22,lit);}});
}
function shadow(g:CanvasRenderingContext2D,v:View,x:number,z:number,rx:number,rz:number,alpha=.32){
 const pts:P3[]=[];for(let i=0;i<14;i++){const a=i/14*Math.PI*2;pts.push(p3(x+Math.cos(a)*rx,0,z+Math.sin(a)*rz));}poly(g,v,pts,`rgba(0,0,0,${alpha})`);
}
/** The shirt: a rounded, shaded box from shoulders to hips, with the number printed on it when the player is big enough. */
function torso(g:CanvasRenderingContext2D,v:View,items:Item[],p:Pose,c:typeof COLORS[Role],num:string){
 const side=norm(sub(p.rSh,p.lSh)),lHip=sub(p.pelvis,mul(side,.14)),rHip=add(p.pelvis,mul(side,.14));
 const pts=[add(p.lSh,mul(side,.03)),sub(p.rSh,mul(side,.03)),add(rHip,p3(0,.05,0)),add(lHip,p3(0,.05,0))].map(v.toCam);if(pts.some(q=>q.z<=NEAR))return;
 const depth=(pts[0].z+pts[1].z+pts[2].z+pts[3].z)/4,sc=pts.map(v.proj),thick=Math.max(1.5,.17*v.focal/depth);
 items.push({depth,draw:()=>{
  const xs=sc.map(q=>q.x),ys=sc.map(q=>q.y),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const [dark,lit]=shades(c.shirt),gr=g.createLinearGradient(x0-thick/2,y0-thick/2,x1+thick/2,y1+thick/2);gr.addColorStop(0,lit);gr.addColorStop(.45,c.shirt);gr.addColorStop(1,dark);
  g.beginPath();sc.forEach((q,i)=>i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y));g.closePath();g.lineJoin='round';g.lineWidth=thick;g.strokeStyle=gr;g.fillStyle=gr;g.stroke();g.fill();
  const hgt=y1-y0+thick;if(num&&hgt>26){const cx=(x0+x1)/2,cy=y0+(y1-y0)*.42;g.fillStyle=c.ink;g.globalAlpha=.9;g.font=`800 ${Math.round(hgt*.34)}px ui-rounded,system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(num,cx,cy);g.globalAlpha=1;g.textAlign='start';}
 }});
}
function head(g:CanvasRenderingContext2D,v:View,items:Item[],p:Pose,c:typeof COLORS[Role]){
 const h=v.toCam(p.head);if(h.z<=NEAR)return;const s=v.proj(h),r=Math.max(1.4,.115*v.focal/h.z);
 items.push({depth:h.z-.05,draw:()=>{
  g.fillStyle=c.skin;g.beginPath();g.arc(s.x,s.y,r,0,Math.PI*2);g.fill();
  if(r<2.5)return;
  g.save();g.beginPath();g.arc(s.x,s.y,r,0,Math.PI*2);g.clip();
  g.fillStyle=c.hair;g.beginPath();g.arc(s.x+r*.06,s.y-r*.78,r*.98,0,Math.PI*2);g.fill();
  const sh=g.createRadialGradient(s.x-r*.45,s.y-r*.5,r*.15,s.x,s.y,r*1.05);sh.addColorStop(0,'rgba(255,255,255,.2)');sh.addColorStop(.55,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.35)');
  g.fillStyle=sh;g.fillRect(s.x-r,s.y-r,r*2,r*2);g.restore();}});
}
function figure(g:CanvasRenderingContext2D,v:View,items:Item[],p:Pose,role:Role,num=''){
 const c=COLORS[role],mid=(a:P3,b:P3,t:number)=>lerp3(a,b,t);
 // Each part is its own depth-sorted item, so the far arm and leg sit behind the shirt and the near ones in front.
 limb(g,v,items,p.lAnk,p.lToe,.1,c.boots);limb(g,v,items,p.rAnk,p.rToe,.1,c.boots);
 for(const [knee,ank] of [[p.lKnee,p.lAnk],[p.rKnee,p.rAnk]] as const){
  const thigh=mid(p.pelvis,knee,.55);
  limb(g,v,items,p.pelvis,thigh,.17,c.shorts,.02);limb(g,v,items,thigh,knee,.12,c.skin,.01);limb(g,v,items,knee,ank,.105,c.socks);}
 torso(g,v,items,p,c,num);
 for(const [sh,el,hand] of [[p.lSh,p.lEl,p.lHand],[p.rSh,p.rEl,p.rHand]] as const){
  const sleeve=mid(sh,el,role==='gk'?1:.65);
  limb(g,v,items,sh,sleeve,.1,c.shirt,-.01);
  if(role==='gk'){limb(g,v,items,el,mid(el,hand,.75),.085,c.shirt,-.01);limb(g,v,items,mid(el,hand,.7),hand,.11,c.gloves??c.skin,-.02);}
  else{if(sleeve!==el)limb(g,v,items,sleeve,el,.08,c.skin,-.01);limb(g,v,items,el,hand,.075,c.skin,-.01);}}
 head(g,v,items,p,c);
}
function rod(g:CanvasRenderingContext2D,v:View,items:Item[],a:P3,b:P3,width:number,color:string){
 const s=seg(g,v,a,b);if(!s)return;items.push({depth:s.depth,draw:()=>{g.strokeStyle=color;g.lineWidth=Math.max(.75,width*v.focal/s.depth);g.lineCap='round';g.beginPath();g.moveTo(s.sa.x,s.sa.y);g.lineTo(s.sb.x,s.sb.y);g.stroke();}});
}
function goalFrame(g:CanvasRenderingContext2D,v:View,items:Item[]){
 const net='rgba(235,240,245,.3)',zl=-LINE_W/2;
 for(let i=0;i<=14;i++){const x=-3.66+7.32*i/14;rod(g,v,items,p3(x,2.44,zl),p3(x,2.1,-1.8),.012,net);rod(g,v,items,p3(x,2.1,-1.8),p3(x,0,-2),.012,net);}
 for(let j=0;j<=5;j++){const t=j/5;rod(g,v,items,p3(-3.66,lerp(2.1,0,t),lerp(-1.8,-2,t)),p3(3.66,lerp(2.1,0,t),lerp(-1.8,-2,t)),.012,net);}
 for(const sx of [-3.66,3.66])for(let j=0;j<=6;j++){const t=j/6;rod(g,v,items,p3(sx,lerp(2.44,0,t),zl),p3(sx,lerp(2.1,0,t),lerp(-1.8,-2,t)),.012,net);}
 const post='#f7f7f2';limb(g,v,items,p3(-3.66,0,zl),p3(-3.66,2.44,zl),LINE_W,post);limb(g,v,items,p3(3.66,0,zl),p3(3.66,2.44,zl),LINE_W,post);limb(g,v,items,p3(-3.66,2.44,zl),p3(3.66,2.44,zl),LINE_W,post);
}
/** Where to put a line's drag handle: the point of the line nearest the lower third of the screen (inside it), plus the screen
 *  direction in which the line moves when z grows (so the chevrons point the way it slides). */
export function handleAt(v:View,z:number,w:number,h:number,who:'def'|'att',at?:number){
 let best:{x:number;y:number;px:number}|null=null,bd=Infinity;const want=h*(at??(who==='def'?.8:.66));
 for(let x=-34;x<=34;x+=1){const c=v.toCam(p3(x,0,z));if(c.z<=NEAR)continue;const s=v.proj(c);if(s.x<24||s.x>w-24||s.y<24||s.y>h-24)continue;const d=Math.abs(s.y-want);if(d<bd){bd=d;best={x:s.x,y:s.y,px:x};}}
 if(!best)return null;const c2=v.toCam(p3(best.px,0,z+.5));if(c2.z<=NEAR)return {x:best.x,y:best.y,dx:1,dy:0};
 const s2=v.proj(c2),L=Math.hypot(s2.x-best.x,s2.y-best.y)||1;return {x:best.x,y:best.y,dx:(s2.x-best.x)/L,dy:(s2.y-best.y)/L};
}
export type DrawOpts={zoom?:number;lines?:{def:number|null;att:number|null};lineTags?:{def?:string;att?:string;attBad?:boolean};measure?:boolean;dim?:number;
 /** The line being dragged (drawn thicker) and whether to draw the round drag handles. */active?:'def'|'att'|null;handles?:boolean;
 /** Blueprint overlay: a metre grid on the grass (labelled every 2 m) and a dimension callout between the two lines. */grid?:boolean;/** Fraction of the width at the bottom-left kept clear of grid labels (the timecode sits there). */gridSkip?:number};
/** Draw one frame from one camera. w/h are canvas pixels. */
export function drawFrame(g:CanvasRenderingContext2D,w:number,h:number,camId:CamId,frame:number,o:DrawOpts={}){
 const f=clamp(Math.round(frame),0,LAST),v=view(camOf(camId),w,h,o.zoom??1);
 const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#0a0e14');sky.addColorStop(1,'#141b22');g.fillStyle=sky;g.fillRect(0,0,w,h);
 const glow=g.createRadialGradient(w*.5,-h*.2,0,w*.5,-h*.2,h*1.1);glow.addColorStop(0,'rgba(170,200,230,.16)');glow.addColorStop(1,'rgba(170,200,230,0)');g.fillStyle=glow;g.fillRect(0,0,w,h);
 pitch(g,v);stands(g,v);
 // Blueprint grid: one faint line every metre across the pitch, labelled every 2 m at the bottom of the picture (static, drawn with
 // the frame, so it costs nothing at rest).
 if(o.grid){g.save();const fs=Math.max(10,Math.round(h/42));g.font=`600 ${fs}px ui-monospace,SFMono-Regular,Menlo,monospace`;g.textAlign='center';g.textBaseline='bottom';
  for(let z=8;z<=26;z++){const s=seg(g,v,p3(-34,0,z),p3(34,0,z));if(!s)continue;g.strokeStyle=z%2?'rgba(150,210,255,.13)':'rgba(150,210,255,.26)';g.lineWidth=Math.max(1,w/1400);g.setLineDash(z%2?[3,5]:[]);
   g.beginPath();g.moveTo(s.sa.x,s.sa.y);g.lineTo(s.sb.x,s.sb.y);g.stroke();
   if(z%2===0){const lp=handleAt(v,z,w,h,'def',.96);if(lp&&lp.x>w*(o.gridSkip??0)){g.fillStyle='rgba(190,230,255,.75)';g.fillText(`${z} m`,lp.x,h-4);}}}
  g.setLineDash([]);g.restore();}
 // Offside lines lie on the grass, so they go under the players (as on TV).
 if(o.lines){const tags=o.lineTags??{};for(const who of ['def','att'] as const){const z=o.lines[who];if(z==null)continue;
  const s=seg(g,v,p3(-34,0,z),p3(34,0,z));if(!s)continue;const col=who==='def'?'#38a8ff':(tags.attBad?'#ffb020':'#ff3b4e');
  const on=o.active===who;
  g.save();g.strokeStyle=col;g.shadowColor=col;g.shadowBlur=Math.max(2,w/220)*(on?2.2:1);g.lineWidth=Math.max(2,w/420)*(on?1.8:1);g.beginPath();g.moveTo(s.sa.x,s.sa.y);g.lineTo(s.sb.x,s.sb.y);g.stroke();g.restore();
  if(o.handles){const hp=handleAt(v,z,w,h,who);if(hp){const r=Math.max(12,Math.min(w,h)/(on?17:21));
   g.save();g.fillStyle='rgba(5,8,12,.78)';g.strokeStyle=col;g.lineWidth=Math.max(2,r*.16);g.beginPath();g.arc(hp.x,hp.y,r,0,Math.PI*2);g.fill();g.stroke();
   // ‹ › chevrons along the line's screen direction: "slide me this way"
   const d=hp.dx,e=hp.dy,a=r*.5,b=r*.28;g.fillStyle='#fff';
   for(const sg of [-1,1]){const cx=hp.x+sg*d*a,cy=hp.y+sg*e*a;g.beginPath();g.moveTo(cx+sg*d*b,cy+sg*e*b);g.lineTo(cx-e*b-sg*d*b*.2,cy+d*b-sg*e*b*.2);g.lineTo(cx+e*b-sg*d*b*.2,cy-d*b-sg*e*b*.2);g.closePath();g.fill();}
   g.restore();}}}}
 // Dimension callout between the two lines (blueprint style: extension ticks, arrowheads, the gap in cm).
 if(o.grid&&o.lines&&o.lines.def!=null&&o.lines.att!=null){const zd=o.lines.def,za=o.lines.att,a=handleAt(v,zd,w,h,'def',.27),b=handleAt(v,za,w,h,'att',.27);
  if(a&&b&&Math.hypot(b.x-a.x,b.y-a.y)>4){const cm=Math.round((za-zd)*100),col='#e9f4ff',ux=(b.x-a.x),uy=(b.y-a.y),L=Math.hypot(ux,uy),nx=-uy/L,ny=ux/L,ah=Math.min(9,L/3);
   g.save();g.strokeStyle=col;g.fillStyle=col;g.lineWidth=Math.max(1.2,w/900);
   for(const p of [a,b]){g.beginPath();g.moveTo(p.x-nx*9,p.y-ny*9);g.lineTo(p.x+nx*9,p.y+ny*9);g.stroke();}
   g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
   for(const [p,sg] of [[a,1],[b,-1]] as const){const dx=ux/L*sg,dy=uy/L*sg;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+dx*ah+nx*ah*.45,p.y+dy*ah+ny*ah*.45);g.lineTo(p.x+dx*ah-nx*ah*.45,p.y+dy*ah-ny*ah*.45);g.closePath();g.fill();}
   const fs=Math.max(11,Math.round(h/30)),txt=`${Math.abs(cm)>=100?(Math.abs(cm)/100).toFixed(2)+' m':Math.abs(cm)+' cm'}`;g.font=`700 ${fs}px ui-monospace,SFMono-Regular,Menlo,monospace`;
   const tw=g.measureText(txt).width+12,mx=(a.x+b.x)/2,my=(a.y+b.y)/2-fs*1.3;g.fillStyle='rgba(8,32,58,.9)';g.fillRect(mx-tw/2,my-fs*.75,tw,fs*1.5);g.strokeRect(mx-tw/2,my-fs*.75,tw,fs*1.5);
   g.fillStyle=col;g.textAlign='center';g.textBaseline='middle';g.fillText(txt,mx,my);g.restore();}}
 const items:Item[]=[],ball=ballAt(f);
 for(const p of PEOPLE){const pose=personPose(p,f);shadow(g,v,pose.pelvis.x,pose.pelvis.z,.42,.3);figure(g,v,items,pose,p.role,p.num);}
 const kp=keeperPose(f);shadow(g,v,kp.pelvis.x,kp.pelvis.z,.55,.35);figure(g,v,items,kp,'gk','1');
 goalFrame(g,v,items);
 shadow(g,v,ball.x,ball.z,BALL_R*1.1,BALL_R*1.1,.45);
 const bc=v.toCam(ball);if(bc.z>NEAR){const s=v.proj(bc),r=Math.max(1.6,BALL_R*v.focal/bc.z);items.push({depth:bc.z,draw:()=>{
  const gr=g.createRadialGradient(s.x-r*.35,s.y-r*.35,r*.1,s.x,s.y,r);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'#b9c0c6');g.fillStyle=gr;g.beginPath();g.arc(s.x,s.y,r,0,Math.PI*2);g.fill();
  if(r>5){g.fillStyle='#22262b';for(const [dx,dy,k] of [[0,0,.32],[.62,-.4,.2],[-.6,-.38,.2],[-.05,.66,.2]] as const){g.beginPath();g.arc(s.x+dx*r,s.y+dy*r,r*k,0,Math.PI*2);g.fill();}}
  g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=Math.max(1,r*.08);g.beginPath();g.arc(s.x,s.y,r,0,Math.PI*2);g.stroke();}});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
 // The goal-line check, once answered: the slice of ball still over the line, in yellow.
 if(o.measure&&f===DEEP){const a=v.toCam(p3(ball.x,ball.y,-LINE_W)),b=v.toCam(p3(ball.x,ball.y,ball.z+BALL_R));if(a.z>NEAR&&b.z>NEAR){const sa=v.proj(a),sb=v.proj(b),r=BALL_R*v.focal/a.z;
  g.save();g.fillStyle='rgba(255,214,0,.55)';g.fillRect(Math.min(sa.x,sb.x),sa.y-r,Math.abs(sb.x-sa.x),r*2);g.strokeStyle='#ffd600';g.lineWidth=Math.max(1.5,w/500);g.strokeRect(Math.min(sa.x,sb.x),sa.y-r,Math.abs(sb.x-sa.x),r*2);
  // callout: a leader line up to a label, like a note on a technical drawing
  if(camId==='goal'){const fs=Math.max(11,Math.round(h/28)),lx=Math.min(sa.x,sb.x)+Math.abs(sb.x-sa.x)/2,ly=sa.y+r,ty=Math.min(h-fs*2.6,ly+h*.16),txt=`${TRUTH.ballOnLineCm} cm ON THE LINE`;
  g.strokeStyle='#ffd600';g.lineWidth=Math.max(1.2,w/900);g.beginPath();g.moveTo(lx,ly);g.lineTo(lx,ty);g.lineTo(lx+18,ty);g.stroke();
  g.font=`800 ${fs}px ui-monospace,SFMono-Regular,Menlo,monospace`;const tw=g.measureText(txt).width+12,bx=Math.min(w-tw-4,lx+18);g.fillStyle='rgba(20,16,0,.88)';g.fillRect(bx,ty-fs*.75,tw,fs*1.5);g.strokeRect(bx,ty-fs*.75,tw,fs*1.5);
  g.fillStyle='#ffd600';g.textBaseline='middle';g.fillText(txt,bx+6,ty);}g.restore();}}
 // Tags on snapped lines: a label at the near end of each line.
 if(o.lines&&o.lineTags){g.save();g.font=`600 ${Math.max(11,Math.round(h/34))}px ui-monospace,SFMono-Regular,Menlo,monospace`;g.textBaseline='middle';
  for(const who of ['def','att'] as const){const z=o.lines[who],t=o.lineTags[who];if(z==null||!t)continue;const anchor=v.toCam(p3(-1.2+(who==='att'?1.8:0),who==='att'?2.25:.1,z));if(anchor.z<=NEAR)continue;const s=v.proj(anchor);
   const pad=6,tw=g.measureText(t).width+pad*2,th=Math.max(18,h/22),x=clamp(s.x-tw/2,4,w-tw-4),y=clamp(s.y+(who==='att'?-th:th*.6),4,h-th-4);
   g.fillStyle=who==='def'?'rgba(16,70,120,.92)':(o.lineTags.attBad?'rgba(120,70,0,.92)':'rgba(120,16,30,.92)');g.fillRect(x,y,tw,th);g.fillStyle='#fff';g.fillText(t,x+pad,y+th/2);}
  g.restore();}
 if(o.dim){g.fillStyle=`rgba(4,6,9,${o.dim})`;g.fillRect(0,0,w,h);}
}
/** The frame where the ball is deepest (for the test and the timeline marker). */
export function deepestFrame(){let best=0,bz=Infinity;for(let f=0;f<=LAST;f++){const z=ballAt(f).z;if(z<bz){bz=z;best=f;}}return best;}
export const timecode=(f:number)=>`00:00:${String(Math.floor(f/FPS)).padStart(2,'0')}:${String(f%FPS).padStart(2,'0')}`;

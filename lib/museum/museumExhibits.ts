import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {CASE_PLACES,CASE} from './museumLayout';
import {museumSfx} from './museumSound';
import {paintStage,STAGE,STAGE_H,STAGE_RECTS,type Rect} from './museumStagePaint';
import CAST from './museumCast.json';
import {STORIES} from './museumStories';
import {buildBatch2} from './museumExhibits2';

/**
 * The storytelling exhibits' stages (Oct 4 2026; beats in lib/museum/museumStories.ts). Each open story case is an open stage
 * on its plinth (no glass): a riso-printed backdrop and set (museumStagePaint.ts), the game's REAL bean characters as baked
 * stills (scripts/museum/render-museum-cast.cjs → public/museum/cast.webp, one sprite sheet), and a machine the kid works:
 *  - laws-1863: a meeting-room diorama; four club players argue with rule books of every colour → one book → they play
 *    together → the IFAB stamp lands with a sparkle;
 *  - penalty-1891: "stand where they stood", seen low from behind the taker: the referee's whistle puff, the ball rolled to
 *    the spot, the gloved keeper bouncing on the line, then the arc into the corner, the keeper's dive and the net's ripple;
 *  - backpass-1992: a hand-cranked zoetrope that speeds up with the crank; its window replays the old rule, then (lever) the new;
 *  - worldcup-1930: a split-flap board that flutters (with its clatter) through the story; the trophy rises in confetti.
 * Heat: static set pieces join the room's ONE merged mesh (`add`); all backdrops/pitch/net-sides are ONE merged print mesh on
 * one 1024² canvas; characters are a few textured quads on one 2048×1024 sheet (frames swap by UV, no new geometry);
 * particles are two small instanced meshes. Canvas textures (zoetrope window 256×128, flap display 512×256) redraw only while
 * their exhibit animates; `update` reports busy only while something moves, so the room's loop sleeps after each beat.
 * Reduced motion: every animation jumps to its end state; no particles, no ripple, no coasting drum.
 */
type Add=(geo:T.BufferGeometry,x:number,y:number,z:number,hex:string,rx?:number,ry?:number,rz?:number,s?:number)=>unknown;
export type ExhibitAnim={id:string;anim:string;t:number;dur:number;arg?:number};
type Frame={x:number;y:number;w:number;h:number};
const FRAMES=CAST.frames as Record<string,Frame>,SHEET_W=CAST.w,SHEET_H=CAST.h;
const TOP=CASE.plinthH+.04;
const ease=(t:number)=>t<=0?0:t>=1?1:t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const clamp01=(v:number)=>v<0?0:v>1?1:v;
const seg=(t:number,a:number,b:number)=>ease(clamp01((t-a)/Math.max(.001,b-a)));
const lin=(t:number,a:number,b:number)=>clamp01((t-a)/Math.max(.001,b-a));

export function createStoryExhibits(scene:T.Scene,opts:{open:Readonly<Record<string,boolean>>;reduced:boolean;add:Add;material:T.Material;onReady?:()=>void;earned?:number}){
 const {add,reduced}=opts,mat=opts.material,disposables:{dispose:()=>void}[]=[],o=new T.Object3D(),col=new T.Color();
 const built=new Set<string>();const any=Object.keys(STORIES).some(id=>opts.open[id]);
 /** Vertex-colour a geometry; a geometry that already carries colours (a merged multi-colour prop) keeps them. */
 const colored=(g:T.BufferGeometry,hex:string)=>{let n=g.index?g.toNonIndexed():g;if(n!==g)g.dispose();if(n.attributes.color)return n;col.set(hex);const c=new Float32Array(n.attributes.position.count*3);for(let i=0;i<c.length;i+=3){c[i]=col.r;c[i+1]=col.g;c[i+2]=col.b;}n.setAttribute('color',new T.BufferAttribute(c,3));if(!n.attributes.uv)n.setAttribute('uv',new T.BufferAttribute(new Float32Array(n.attributes.position.count*2),2));return n;};
 const mesh=(g:T.BufferGeometry,hex='#ffffff',name='')=>{const m=new T.Mesh(colored(g,hex),mat);m.name=name;scene.add(m);disposables.push(m.geometry);return m;};
 const setI=(m:T.InstancedMesh,i:number,x:number,y:number,z:number,ry=0,s=1,rx=0,rz=0)=>{o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.setScalar(s);o.updateMatrix();m.setMatrixAt(i,o.matrix);};

 // ---- Shared textures: the printed stage set (one canvas) and the bean cast (one sprite sheet) ---------------------------
 const stageCanvas=any?paintStage(document.createElement('canvas')):null,stageTex=stageCanvas?new T.CanvasTexture(stageCanvas):null;if(stageTex){stageTex.colorSpace=T.SRGBColorSpace;stageTex.anisotropy=2;disposables.push(stageTex);}
 const stageMat=new T.MeshBasicMaterial({map:stageTex,alphaTest:.3,side:T.DoubleSide});disposables.push(stageMat);
 const fxMat=new T.MeshBasicMaterial({map:stageTex,transparent:true,depthWrite:false,side:T.DoubleSide});disposables.push(fxMat);
 const castTex=any?new T.TextureLoader().load('/museum/cast.webp',()=>{castImage=castTex!.image as HTMLImageElement;opts.onReady?.();}):null;let castImage:HTMLImageElement|null=null;
 if(castTex){castTex.colorSpace=T.SRGBColorSpace;castTex.anisotropy=2;disposables.push(castTex);}
 const castMat=new T.MeshBasicMaterial({map:castTex,alphaTest:.5,side:T.DoubleSide});disposables.push(castMat);
 const uvRect=(g:T.BufferGeometry,rc:Rect,W=STAGE,H=STAGE_H)=>{const uv=g.attributes.uv as T.BufferAttribute,u0=rc.x/W,u1=(rc.x+rc.w)/W,v1=1-rc.y/H,v0=1-(rc.y+rc.h)/H;uv.setXY(0,u0,v1);uv.setXY(1,u1,v1);uv.setXY(2,u0,v0);uv.setXY(3,u1,v0);uv.needsUpdate=true;return g;};
 const prints:T.BufferGeometry[]=[];
 /** A printed quad of the stage set, merged into one mesh (rx/ry orient it; default faces +z). */
 const print=(rc:Rect,x:number,y:number,z:number,w:number,h:number,rx=0,ry=0)=>{const g=uvRect(new T.PlaneGeometry(w,h),rc);g.rotateX(rx);g.rotateY(ry);g.translate(x,y,z);prints.push(g);};
 /** A bean still on a quad, anchored bottom-centre; `setFrame` swaps its pose (UV only) and keeps its height. */
 type Sprite=T.Mesh&{userData:{h:number;frame:string;flip:boolean}};
 const sprite=(frame:string,h:number,name:string):Sprite=>{const g=new T.PlaneGeometry(1,1);g.translate(0,.5,0);const m=new T.Mesh(g,castMat) as unknown as Sprite;m.name=name;m.userData={h,frame:'',flip:false};setFrame(m,frame);scene.add(m);disposables.push(g);return m;};
 function setFrame(m:Sprite,frame:string,flip=m.userData.flip,h=m.userData.h){const f=FRAMES[frame];if(!f)return;if(m.userData.frame!==frame){uvRect(m.geometry,f,SHEET_W,SHEET_H);m.userData.frame=frame;}m.userData.flip=flip;m.userData.h=h;m.scale.set(h*f.w/f.h*(flip?-1:1),h,1);}
 /** The stage's printed backdrop (true to the print's aspect) in a dark-green proscenium frame. */
 const stageTops:Record<string,number>={};
 const backdrop=(id:string,rc:Rect)=>{const p=CASE_PLACES[id],h=.94*rc.h/rc.w;stageTops[id]=TOP+.04+h;print(rc,p.x,TOP+.02+h/2,p.z-.45,.94,h);add(new T.BoxGeometry(.98,.045,.045),p.x,TOP+.04+h,p.z-.46,'#294f43');for(const s of [-1,1])add(new T.BoxGeometry(.045,h+.06,.045),p.x+s*.48,TOP+(h+.06)/2,p.z-.46,'#294f43');};

 // ---- Particles: a sparkle burst and confetti (two small instanced meshes, idle = hidden) ---------------------------------
 const SPARKS=10,CONFETTI=28;
 const sparks=new T.InstancedMesh(uvRect(new T.PlaneGeometry(.06,.06),STAGE_RECTS.spark),fxMat,SPARKS);sparks.frustumCulled=false;sparks.visible=false;scene.add(sparks);disposables.push(sparks.geometry);
 const confetti=new T.InstancedMesh(colored(new T.PlaneGeometry(.025,.014),'#ffffff'),mat,CONFETTI);confetti.frustumCulled=false;confetti.visible=false;scene.add(confetti);disposables.push(confetti.geometry);
 const CONF_COLS=['#ff48b0','#2f8f8a','#f2bb45','#3255a4','#e0453d','#fff1d3'];for(let i=0;i<CONFETTI;i++)confetti.setColorAt(i,col.set(CONF_COLS[i%CONF_COLS.length]));
 let burst:{x:number;y:number;z:number;t:number}|null=null,rain:{x:number;y:number;z:number;t:number}|null=null;
 function sparkle(x:number,y:number,z:number){if(reduced)return;burst={x,y,z,t:0};sparks.visible=true;}
 function stepParticles(dt:number){let busy=false;
  if(burst){burst.t+=dt;const k=burst.t/.7;if(k>=1){burst=null;sparks.visible=false;}else{busy=true;for(let i=0;i<SPARKS;i++){const a=i/SPARKS*Math.PI*2,r=.05+k*.16;setI(sparks,i,burst.x+Math.cos(a)*r,burst.y+Math.sin(a)*r*.8,burst.z+.02,0,(1-k)*(i%2?.8:1.2),0,a+k*3);}sparks.instanceMatrix.needsUpdate=true;}}
  if(rain){rain.t+=dt;const k=rain.t/2.2;if(k>=1){rain=null;confetti.visible=false;}else{busy=true;for(let i=0;i<CONFETTI;i++){const s=(i*97)%100/100,x=rain.x+(s-.5)*.8+Math.sin(rain.t*4+i)*.03,y=rain.y+.5-(rain.t*(.35+s*.3))%0.9;setI(confetti,i,x,y,rain.z+((i*37)%10)/40-.1,rain.t*5+i,1,rain.t*7+i,0);}confetti.instanceMatrix.needsUpdate=true;}}
  return busy;}
 /** A small icosphere ball with dark patches (the museum's ball look). */
 const ballGeo=(r:number)=>{const g=new T.IcosahedronGeometry(r,2),pos=g.attributes.position,c=new Float32Array(pos.count*3),v=new T.Vector3(),dirs=[...Array(12)].map((_,i)=>new T.Vector3().setFromSphericalCoords(1,Math.acos(1-2*(i+.5)/12),i*2.4));
  for(let f=0;f<pos.count;f+=3){v.set(0,0,0);for(let k=0;k<3;k++)v.add(new T.Vector3().fromBufferAttribute(pos,f+k));v.normalize();const dark=dirs.some(d=>d.dot(v)>.93);for(let k=0;k<3;k++){c[(f+k)*3]=dark?.13:.96;c[(f+k)*3+1]=dark?.15:.94;c[(f+k)*3+2]=dark?.2:.88;}}
  g.setAttribute('color',new T.BufferAttribute(c,3));return g;};
 const ballMesh=(r:number,name:string)=>{const m=new T.Mesh(ballGeo(r),mat);m.name=name;scene.add(m);disposables.push(m.geometry);return m;};

 // ---- 1863: the meeting room ---------------------------------------------------------------------------------------------
 const laws=(()=>{const id='laws-1863';if(!opts.open[id])return null;built.add(id);const p=CASE_PLACES[id];backdrop(id,STAGE_RECTS.laws);
  add(new T.BoxGeometry(.52,.03,.26),p.x,TOP+.2,p.z-.06,'#9d805b');add(new T.BoxGeometry(.54,.012,.28),p.x,TOP+.216,p.z-.06,'#7a5a3a');for(const sx of [-1,1])for(const sz of [-1,1])add(new T.BoxGeometry(.025,.19,.025),p.x+sx*.23,TOP+.095,p.z-.06+sz*.1,'#6f5236');
  add(new T.CylinderGeometry(.006,.002,.09,5),p.x+.16,TOP+.25,p.z-.12,'#fff7e4',0,0,.5);add(new T.CylinderGeometry(.02,.022,.025,10),p.x+.17,TOP+.23,p.z-.13,'#22366b');// quill + inkwell
  const seats=[[-.1,-.2],[.1,-.2],[-.22,.03],[.22,.03]] as const,out=[[-.24,.24],[-.08,.3],[.08,.3],[.24,.24]] as const;
  const figs=seats.map((_,i)=>sprite(`g${i}-argue`,.34,`museum-laws-g${i}`));
  const bookCols=['#bd3b3b','#2a5c9e','#2f7d4a','#c9921f'],books=new T.InstancedMesh(colored(new T.BoxGeometry(.085,.016,.115),'#ffffff'),mat,4);books.name='museum-laws-books';books.frustumCulled=false;scene.add(books);disposables.push(books.geometry);
  bookCols.forEach((c,i)=>books.setColorAt(i,col.set(c)));
  const ball=ballMesh(.024,'museum-laws-ball'),stamp=mesh(mergeGeometries([colored(new T.BoxGeometry(.07,.03,.07),'#22366b'),colored(new T.CylinderGeometry(.012,.012,.08,8).translate(0,.055,0),'#9d805b'),colored(new T.SphereGeometry(.022,8,6).translate(0,.1,0),'#9d805b')])!,'#ffffff','museum-laws-stamp');
  const sealG=uvRect(new T.PlaneGeometry(.075,.075),STAGE_RECTS.seal);sealG.rotateX(-Math.PI/2);const seal=new T.Mesh(sealG,stageMat);seal.name='museum-laws-seal';scene.add(seal);disposables.push(sealG);
  const st={merged:false,out:false,stamped:false};
  function pose(a:ExhibitAnim|null){const t=a?a.t:0,k=a?clamp01(t/a.dur):1,ph=a?.anim??'';
   for(let i=0;i<4;i++){const f=figs[i];let [sx,sz]=seats[i] as readonly [number,number];let y=TOP,rz=0;
    if(st.out||ph==='play'){const kk=ph==='play'?seg(k,0,.35):1;sx+=(out[i][0]-sx)*kk;sz+=(out[i][1]-sz)*kk;}
    if(ph==='argue'){y+=Math.abs(Math.sin(t*8+i*1.7))*.03;rz=Math.sin(t*6+i)*.08;}
    if(ph==='play'){y+=Math.abs(Math.sin(t*7+i*1.3))*.04;}
    const playing=st.out||ph==='play'&&k>.2;setFrame(f,playing?(i%2?`g${i}-cheer`:`g${i}-kick`):`g${i}-argue`,i%2===1);f.position.set(p.x+sx,y,p.z+sz);f.rotation.z=rz;
    // Rule books: raised in each player's hand; they flap while arguing, fly to the table and become one.
    let bx=p.x+sx*.82,by=TOP+.27,bz=p.z+sz+.06,bs=1,brx=0;if(ph==='argue')brx=Math.sin(t*16+i)*.7,by+=Math.abs(Math.sin(t*8+i*1.7))*.03;
    if(ph==='merge'||st.merged){const kk=ph==='merge'?seg(k,.05,.75):1,tx=p.x,tz=p.z-.06,ty=TOP+.224+.004*i;bx+=(tx-bx)*kk;bz+=(tz-bz)*kk;by+=(ty-by)*kk+Math.sin(kk*Math.PI)*.12;if(kk>=1){bs=i?0:1.5;}}
    setI(books,i,bx,by,bz,i*.3,bs,brx);}
   books.setColorAt(0,col.set(st.merged||ph==='merge'&&k>.75?'#fff1d3':bookCols[0]));books.instanceMatrix.needsUpdate=true;if(books.instanceColor)books.instanceColor.needsUpdate=true;
   ball.visible=st.out||ph==='play';if(ph==='play'){const seq=[0,2,1,3,0],u=k*4,a=Math.floor(Math.min(3.999,u)),f=u-a,A=out[seq[a]],B=out[seq[a+1]];ball.position.set(p.x+A[0]+(B[0]-A[0])*f,TOP+.025+Math.sin(f*Math.PI)*.12,p.z+A[1]+.04+(B[1]-A[1])*f);ball.rotation.x+=.2;}else if(st.out)ball.position.set(p.x,TOP+.025,p.z+.32);
   stamp.visible=ph==='stamp';if(ph==='stamp'){const d=Math.sin(Math.min(1,k*1.4)*Math.PI);stamp.position.set(p.x,TOP+.42-d*.18,p.z-.06);stamp.scale.set(1+d*.15,1-d*.2,1+d*.15);}
   seal.visible=st.stamped||ph==='stamp'&&k>.4;seal.position.set(p.x+.005,TOP+.236,p.z-.06);}
  pose(null);
  return {id,pose,play(anim:string){if(anim==='argue')museumSfx.flapBook();if(anim==='play')museumSfx.crowd();return reduced?0:{argue:1.8,merge:1.6,play:2.8,stamp:1.3}[anim]??1;},
   onTime(anim:string,t:number,prev:number){if(anim==='argue'&&Math.floor(t*4)!==Math.floor(prev*4))museumSfx.flapBook();if(anim==='merge'&&prev<1.25&&t>=1.25){museumSfx.reveal();sparkle(p.x,TOP+.3,p.z-.06);}if(anim==='stamp'&&prev<.55&&t>=.55){museumSfx.stamp();sparkle(p.x,TOP+.3,p.z-.06);}},
   finish(anim:string){if(anim==='merge')st.merged=true;if(anim==='play')st.out=true;if(anim==='stamp')st.stamped=true;},
   reset(){st.merged=st.out=st.stamped=false;pose(null);}};
 })();

 // ---- 1891: the penalty, seen from behind the taker ----------------------------------------------------------------------
 const penalty=(()=>{const id='penalty-1891';if(!opts.open[id])return null;built.add(id);const p=CASE_PLACES[id];backdrop(id,STAGE_RECTS.pen);
  const D=.86,gz=p.z-D/2+D*18/256,spot={x:p.x,z:p.z-D/2+D*150/256};
  print(STAGE_RECTS.grass,p.x,TOP+.006,p.z,.94,D,-Math.PI/2);
  for(const sx of [-1,1])add(new T.BoxGeometry(.016,.26,.016),p.x+sx*.22,TOP+.13,gz,'#ffffff');add(new T.BoxGeometry(.456,.016,.016),p.x,TOP+.26,gz,'#ffffff');
  for(const sx of [-1,1]){add(new T.BoxGeometry(.01,.01,.1),p.x+sx*.22,TOP+.26,gz-.05,'#e8e8e8');print(STAGE_RECTS.net,p.x+sx*.22,TOP+.13,gz-.05,.1,.26,0,Math.PI/2);}
  print(STAGE_RECTS.net,p.x,TOP+.26,gz-.05,.44,.1,-Math.PI/2);
  const netG=uvRect(new T.PlaneGeometry(.44,.26,10,6),STAGE_RECTS.net);const net=new T.Mesh(netG,stageMat);net.position.set(p.x,TOP+.13,gz-.1);net.name='museum-pen-net';scene.add(net);disposables.push(netG);
  const netBase=(netG.attributes.position.array as Float32Array).slice();
  const keeper=sprite('gk-ready',.27,'museum-pen-keeper'),taker=sprite('taker-stand',.28,'museum-pen-taker'),ref=sprite('ref',.29,'museum-pen-ref');
  taker.position.set(p.x-.27,TOP,p.z+.3);ref.position.set(p.x+.37,TOP,p.z-.12);
  const ball=ballMesh(.024,'museum-pen-ball');
  const puffG=uvRect(new T.PlaneGeometry(.16,.16),STAGE_RECTS.puff);const puff=new T.Mesh(puffG,fxMat);puff.name='museum-pen-puff';puff.visible=false;scene.add(puff);disposables.push(puffG);
  const st={placed:false,shot:-1,keeperSide:0,netHit:-1,ripple:-1};
  function rippleNet(dt:number){if(st.ripple<0)return false;st.ripple+=dt;const a=netG.attributes.position as T.BufferAttribute,arr=a.array as Float32Array;const hx=[-.15,0,.15][st.netHit+1]??0,hy=st.netHit===0?-.06:.04;
   if(st.ripple>1.2||reduced){arr.set(netBase);a.needsUpdate=true;st.ripple=-1;return false;}
   for(let i=0;i<arr.length;i+=3){const d=Math.hypot(arr[i]-hx,arr[i+1]-hy);arr[i+2]=netBase[i+2]-Math.exp(-d*9)*Math.exp(-st.ripple*3)*Math.cos(st.ripple*18-d*30)*.07;}a.needsUpdate=true;return true;}
  function pose(a:ExhibitAnim|null){const t=a?a.t:0,k=a?clamp01(t/a.dur):1,ph=a?.anim??'';
   // Keeper: on the line; bounces side to side; dives the wrong way on the shot (the baked dive pose, mirrored for left).
   let kx=p.x,ky=TOP;if(ph==='keeper'){kx+=Math.sin(t*5)*.07;ky+=Math.abs(Math.sin(t*10))*.018;}
   const diving=ph==='shoot'&&t>.45||st.shot>=0&&ph!=='shoot';
   if(diving){const kk=ph==='shoot'?seg(t,.45,.8):1;setFrame(keeper,'gk-dive',st.keeperSide<0,.2);kx=p.x+st.keeperSide*.15*kk;ky=TOP+.05*Math.sin(Math.min(1,kk)*Math.PI*.9)+.01;}else setFrame(keeper,'gk-ready',false,.27);
   keeper.position.set(kx,ky,gz+.03);
   // Taker: steps up and strikes.
   setFrame(taker,ph==='shoot'&&t<.5||st.shot>=0?'taker-kick':'taker-stand');taker.position.x=p.x-.27+(ph==='shoot'?seg(t,0,.25)*.06:st.shot>=0?.06:0);
   // Referee and the whistle puff.
   puff.visible=ph==='whistle'&&!reduced;if(puff.visible){const s=.6+seg(t,0,.4)*.6;puff.scale.setScalar(s);puff.position.set(p.x+.3,TOP+.36+t*.05,p.z-.1);(puff.material as T.MeshBasicMaterial).opacity=1-lin(t,.9,1.4);}
   // Ball: beside the spot → rolled onto it → the arc into the chosen corner, then it drops in the net.
   let bx=p.x+.2,by=TOP+.024,bz=p.z+.3;
   if(ph==='place'||st.placed){const kk=ph==='place'?seg(k,0,.85):1;bx+=(spot.x-bx)*kk;bz+=(spot.z-bz)*kk;}
   if(ph==='shoot'||st.shot>=0){const side=ph==='shoot'?(a?.arg??0):st.shot,kk=ph==='shoot'?lin(t,.3,.62):1,tx=p.x+[-.16,0,.16][side+1],ty=TOP+[.2,.14,.2][side+1];
    bx=spot.x+(tx-spot.x)*kk;bz=spot.z+(gz-.08-spot.z)*kk;by=TOP+.024+(ty-TOP-.024)*kk+Math.sin(kk*Math.PI)*.08;
    const rest=ph==='shoot'?seg(t,.75,1.1):1;by+=(TOP+.024-by)*rest;bz+=(gz-.09-bz)*rest;ball.rotation.x-=.4;}
   ball.position.set(bx,by,bz);}
  pose(null);
  return {id,pose,
   play(anim:string,arg=0){if(anim==='whistle')museumSfx.whistle();if(anim==='shoot'){st.keeperSide=arg===0?-1:-arg;museumSfx.kick();}return reduced?0:{whistle:1.4,place:1,keeper:1.8,shoot:1.6}[anim]??1;},
   onTime(anim:string,t:number,prev:number,arg=0){if(anim==='shoot'&&prev<.62&&t>=.62){st.netHit=arg;st.ripple=0;museumSfx.net();sparkle(p.x+[-.16,0,.16][arg+1],TOP+.2,gz-.04);}if(anim==='shoot'&&prev<.8&&t>=.8)museumSfx.crowd();if(anim==='place'&&prev<.2&&t>=.2)museumSfx.tick();},
   finish(anim:string,arg=0){if(anim==='place')st.placed=true;if(anim==='shoot')st.shot=arg;},
   step:rippleNet,
   reset(){st.placed=false;st.shot=-1;st.keeperSide=0;st.ripple=-1;const a=netG.attributes.position as T.BufferAttribute;(a.array as Float32Array).set(netBase);a.needsUpdate=true;pose(null);}};
 })();

 // ---- 1992: the hand-cranked zoetrope ------------------------------------------------------------------------------------
 const zoetrope=(()=>{const id='backpass-1992';if(!opts.open[id])return null;built.add(id);const p=CASE_PLACES[id];backdrop(id,STAGE_RECTS.zoe);
  const dz=p.z-.12;add(new T.CylinderGeometry(.2,.24,.06,24),p.x,TOP+.03,dz,'#6f5236');add(new T.CylinderGeometry(.016,.016,.3,8),p.x,TOP+.18,dz,'#9d805b');
  add(new T.BoxGeometry(.52,.3,.03),p.x,TOP+.36,p.z+.16,'#294f43');add(new T.BoxGeometry(.03,.36,.03),p.x-.25,TOP+.18,p.z+.16,'#294f43');add(new T.BoxGeometry(.03,.36,.03),p.x+.25,TOP+.18,p.z+.16,'#294f43');
  const drumMat=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});disposables.push(drumMat);const drum=new T.Mesh(colored(new T.CylinderGeometry(.26,.26,.2,32,1,true),'#22366b'),drumMat);drum.name='museum-zoe-drum';drum.position.set(p.x,TOP+.33,dz);scene.add(drum);disposables.push(drum.geometry);
  const slots=new T.InstancedMesh(colored(new T.BoxGeometry(.016,.07,.006),'#f4cc7c'),mat,16);slots.name='museum-zoe-slots';slots.frustumCulled=false;scene.add(slots);disposables.push(slots.geometry);
  const crank=mesh(mergeGeometries([colored(new T.BoxGeometry(.012,.12,.012).translate(0,.06,0),'#9d805b'),colored(new T.CylinderGeometry(.014,.014,.05,8).rotateZ(Math.PI/2).translate(.025,.12,0),'#e0453d')])!,'#ffffff','museum-zoe-crank');crank.position.set(p.x+.3,TOP+.33,dz);crank.rotation.z=Math.PI/2;
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;const g=canvas.getContext('2d')!,tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;disposables.push(tex);
  const winMat=new T.MeshBasicMaterial({map:tex});disposables.push(winMat);const win=new T.Mesh(new T.PlaneGeometry(.46,.23),winMat);win.position.set(p.x,TOP+.36,p.z+.177);win.name='museum-zoe-window';scene.add(win);disposables.push(win.geometry);
  const lever=mesh(mergeGeometries([colored(new T.BoxGeometry(.016,.17,.016).translate(0,.085,0),'#9d805b'),colored(new T.SphereGeometry(.026,10,8).translate(0,.17,0),'#e0453d')])!,'#ffffff','museum-zoe-lever');lever.position.set(p.x+.38,TOP+.03,p.z+.26);
  add(new T.BoxGeometry(.08,.04,.08),p.x+.38,TOP+.02,p.z+.26,'#294f43');
  const st={angle:0,v:0,era:'old' as 'old'|'new',leverDown:false,lastFrame:-1,tickAt:0};
  const drawCast=(frame:string,x:number,baseY:number,h:number,flip=false)=>{const f=FRAMES[frame];if(!f||!castImage)return;const w=h*f.w/f.h;g.save();g.translate(x,baseY);if(flip)g.scale(-1,1);g.drawImage(castImage,f.x,f.y,f.w,f.h,-w/2,-h,w,h);g.restore();};
  /** One of 12 frames per drum turn: the team-mate (left) kicks it back to the keeper (right, by the goal); old rule: the keeper
   *  catches it and holds on while the clock ticks; new rule: the keeper controls it with the foot and passes it on. */
  function draw(frame:number){if(frame===st.lastFrame)return;st.lastFrame=frame;const f=frame%12,W=256,H=128;
   g.fillStyle='#f6ecd6';g.fillRect(0,0,W,H);g.fillStyle='#4f9a5b';g.fillRect(0,H*.7,W,H*.3);g.fillStyle='#5aa866';for(let x=0;x<W;x+=32)g.fillRect(x,H*.7,16,H*.3);
   g.strokeStyle='#fff8e6';g.lineWidth=3;g.strokeRect(W-26,H*.34,34,H*.36);
   const kx=208,gy=H*.9;let bx=70,by=gy-6,ballOn=true,keeper='z-gk-idle';
   if(f<6){bx=70+(kx-28-70)*(f/5);}
   else if(st.era==='old'){keeper='z-gk-hands';ballOn=false;g.fillStyle='#fff';g.beginPath();g.arc(48,26,15,0,Math.PI*2);g.fill();g.strokeStyle='#22366b';g.lineWidth=2;g.stroke();const ang=(f-6)/6*Math.PI*2;g.beginPath();g.moveTo(48,26);g.lineTo(48+Math.sin(ang)*11,26-Math.cos(ang)*11);g.stroke();}
   else{keeper=f<8?'z-gk-foot':'z-gk-idle';const k=Math.max(0,(f-7)/4);bx=kx-28-k*150;by=gy-6-Math.sin(k*Math.PI)*16;}
   drawCast(f<2?'z-pass':'z-pass',52,gy,92,false);drawCast(keeper,kx,gy,96,true);
   if(ballOn){g.fillStyle='#fff';g.strokeStyle='#22366b';g.lineWidth=1.5;g.beginPath();g.arc(bx,by,6,0,Math.PI*2);g.fill();g.stroke();}
   g.fillStyle=st.era==='old'?'#22366b':'#e0453d';g.font='900 13px system-ui, sans-serif';g.fillText(st.era==='old'?'BEFORE':'1992 RULE',8,H-8);
   // Strobe: the zoetrope's shutter darkens the edges a little between slots.
   g.fillStyle='rgba(20,26,50,.18)';g.fillRect(0,0,10,H);g.fillRect(W-10,0,10,H);
   tex.needsUpdate=true;if(Math.abs(st.v)>.5&&performance.now()-st.tickAt>70){st.tickAt=performance.now();museumSfx.tick();}}
  function pose(a:ExhibitAnim|null){const t=a?a.t:0,ph=a?.anim??'';
   drum.rotation.y=st.angle;crank.rotation.x=st.angle;for(let i=0;i<16;i++){const ang=st.angle+i/16*Math.PI*2;setI(slots,i,p.x+Math.sin(ang)*.262,TOP+.37,dz+Math.cos(ang)*.262,ang);}slots.instanceMatrix.needsUpdate=true;
   const lk=ph==='lever'?seg(t,0,.45):st.leverDown?1:0;lever.rotation.z=-lk*1.15;
   draw(Math.floor(((st.angle/(Math.PI*2))%1+1)%1*12));}
  pose(null);
  return {id,pose,
   play(anim:string){if(anim==='old')st.era='old';if(anim==='lever'){st.leverDown=true;museumSfx.stamp();}if(anim==='new'||anim==='feet')st.era='new';if(anim!=='lever'&&!reduced)st.v=Math.max(st.v,4);if(reduced&&anim!=='lever')st.angle+=Math.PI*2/12*6;st.lastFrame=-1;return reduced?0:{old:2.6,lever:.8,new:2.6,feet:3}[anim]??1;},
   /** While a crank beat plays the drum winds up (faster and faster), as if the handle were turning. */
   onTime(anim:string,t:number){if(!reduced&&anim!=='lever')st.v=Math.max(st.v,Math.min(13,4+t*5));},
   finish(){/* the drum coasts down on its own */},
   crank(d:number){if(reduced){st.angle+=Math.sign(d)*Math.PI*2/12;}else{st.angle+=d;st.v=Math.max(-13,Math.min(13,st.v+d*12));}},
   step(dt:number){if(reduced||Math.abs(st.v)<.05){st.v=0;return false;}st.angle+=st.v*dt;st.v*=Math.exp(-dt*1.3);return true;},
   reset(){st.era='old';st.leverDown=false;st.v=0;st.lastFrame=-1;pose(null);},
   get angle(){return st.angle;},get era(){return st.era;},get speed(){return st.v;}};
 })();

 // ---- 1930: the split-flap scoreboard ------------------------------------------------------------------------------------
 const board=(()=>{const id='worldcup-1930';if(!opts.open[id])return null;built.add(id);const p=CASE_PLACES[id];backdrop(id,STAGE_RECTS.wc);
  const bz=p.z-.16;add(new T.BoxGeometry(.72,.42,.05),p.x,TOP+.58,bz,'#22366b');for(const sx of [-1,1])add(new T.BoxGeometry(.04,.38,.04),p.x+sx*.27,TOP+.19,bz,'#22366b');
  add(new T.BoxGeometry(.08,.04,.08),p.x+.33,TOP+.02,p.z+.16,'#294f43');add(new T.CylinderGeometry(.09,.11,.07,18),p.x-.26,TOP+.035,p.z+.18,'#294f43');
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const g=canvas.getContext('2d')!,tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=2;disposables.push(tex);
  const dispMat=new T.MeshBasicMaterial({map:tex});disposables.push(dispMat);const disp=new T.Mesh(new T.PlaneGeometry(.68,.34),dispMat);disp.position.set(p.x,TOP+.58,bz+.027);disp.name='museum-flap-display';scene.add(disp);disposables.push(disp.geometry);
  const lever=mesh(mergeGeometries([colored(new T.BoxGeometry(.016,.18,.016).translate(0,.09,0),'#9d805b'),colored(new T.SphereGeometry(.028,10,8).translate(0,.18,0),'#f2bb45')])!,'#ffffff','museum-flap-lever');lever.position.set(p.x+.33,TOP+.04,p.z+.16);
  const trophy=mesh(mergeGeometries([colored(new T.CylinderGeometry(.035,.05,.08,12).translate(0,.04,0),'#f2bb45'),colored(new T.CylinderGeometry(.03,.04,.06,10).translate(0,.11,0),'#f2bb45'),colored(new T.CylinderGeometry(.085,.04,.11,14).translate(0,.195,0),'#f2bb45'),colored(new T.TorusGeometry(.045,.01,6,12,Math.PI).rotateZ(Math.PI/2).translate(.085,.2,0),'#f2bb45'),colored(new T.TorusGeometry(.045,.01,6,12,Math.PI).rotateZ(-Math.PI/2).translate(-.085,.2,0),'#f2bb45')])!,'#ffffff','museum-flap-trophy');
  const COLS=13,TEAM_COLS=['#6fa8dc','#e0453d','#f8d651','#3a9e5c','#ffffff','#d8466f','#2f6fb0','#e0a33a','#8a5a33','#477c6a','#bd7657','#22366b','#c9ccd1'];
  const st={rows:['PULL THE','LEVER'] as string[],from:['PULL THE','LEVER'] as string[],flip:1,showAt:0,teams:0,trophy:0,flaps:0};
  const pad=(s:string)=>s.padEnd(COLS).slice(0,COLS);
  function draw(){const W=512,H=256,cw=W/COLS,ch=H/2;g.fillStyle='#14203f';g.fillRect(0,0,W,H);let flipped=0;
   for(let r=0;r<2;r++)for(let c=0;c<COLS;c++){const a=pad(st.from[r]??'')[c],b=pad(st.rows[r]??'')[c],k=a===b?1:clamp01(st.flip*1.6-(c+r*3)*.06),flipT=Math.abs(Math.cos(k*Math.PI)),chr=k<.5?a:b;if(a!==b&&k>=.5)flipped++;
    const x=c*cw+3,y=r*ch+8,w=cw-6,h=ch-16;g.fillStyle='#22305a';g.fillRect(x,y,w,h);g.fillStyle='#0d162e';g.fillRect(x,y+h/2-1,w,2);
    if(chr!==' '){g.save();g.translate(x+w/2,y+h/2);g.scale(1,Math.max(.05,flipT));g.fillStyle='#fff1d3';g.font=`800 ${Math.round(h*.62)}px system-ui, sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(chr,0,2);g.restore();}}
   if(st.teams>0&&st.rows[0]==='13 TEAMS')for(let i=0;i<Math.min(13,st.teams);i++){g.fillStyle=TEAM_COLS[i];g.fillRect(10+i*38,H*.6,30,22);g.strokeStyle='#fff1d3';g.lineWidth=2;g.strokeRect(10+i*38,H*.6,30,22);}
   // The flutter: one soft clack per flipped cell (throttled by the sound module's own short noise).
   if(flipped>st.flaps){for(let i=0;i<Math.min(3,flipped-st.flaps);i++)museumSfx.flap();st.flaps=flipped;}
   tex.needsUpdate=true;}
  function show(rows:string[],at=0){st.from=st.rows;st.rows=rows;st.flip=reduced?1:0;st.showAt=at;st.flaps=0;}
  function pose(a:ExhibitAnim|null){const t=a?a.t:0,ph=a?.anim??'';
   const lk=a&&['host','teams','final'].includes(ph)?Math.sin(seg(t,0,.5)*Math.PI):0;lever.rotation.z=-lk*1.2;
   if(a){st.flip=reduced?1:clamp01((t-st.showAt)/.9);
    if(ph==='teams')st.teams=reduced?13:Math.min(13,Math.floor(t/1.4*13));
    if(ph==='final'&&t>1.3&&st.rows[0]!=='URUGUAY    4')show(['URUGUAY    4','ARGENTINA  2'],t);
    if(ph==='final')st.trophy=reduced?1:seg(t,1.6,2.6);}
   trophy.position.set(p.x-.26,TOP-.2+.27*st.trophy,p.z+.18);trophy.rotation.y=st.trophy*Math.PI*2;trophy.visible=st.trophy>0;draw();}
  draw();pose(null);
  return {id,pose,
   play(anim:string){if(anim==='host')show(['WORLD CUP','URUGUAY 1930']);if(anim==='teams'){show(['13 TEAMS','']);st.teams=0;}if(anim==='final'){show(['FINAL','MONTEVIDEO']);st.trophy=0;}
    if(reduced&&anim==='final'){show(['URUGUAY    4','ARGENTINA  2']);st.trophy=1;}if(reduced&&anim==='teams')st.teams=13;draw();return reduced?0:{host:1.6,teams:1.8,final:3}[anim]??1;},
   onTime(anim:string,t:number,prev:number){if(anim==='final'&&prev<2.4&&t>=2.4){museumSfx.crowd();museumSfx.reveal();if(!reduced){rain={x:p.x,y:TOP+.4,z:p.z+.1,t:0};confetti.visible=true;}sparkle(p.x-.26,TOP+.25,p.z+.2);}if(anim==='teams'&&Math.floor(t/1.4*13)!==Math.floor(prev/1.4*13)&&t<1.4)museumSfx.flap();},
   finish(anim:string){st.flip=1;if(anim==='teams')st.teams=13;if(anim==='final'){if(st.rows[0]!=='URUGUAY    4')show(['URUGUAY    4','ARGENTINA  2']);st.flip=1;st.trophy=1;}draw();},
   reset(){st.rows=st.from=['PULL THE','LEVER'];st.flip=1;st.teams=0;st.trophy=0;draw();pose(null);},
   get rows(){return [...st.rows];}};
 })();

 // Batch 2 (lantern, VAR booth, globe, futsal court, ball cabinet, TV, lockers, podium): museumExhibits2.ts, same kit.
 const batch2=buildBatch2({scene,reduced,open:opts.open,earned:opts.earned??0,mat,stageMat,fxMat,disposables,add,print,backdrop,sprite,setFrame,mesh,colored,uvRect:(g,rc)=>uvRect(g,rc),ballMesh,sparkle,
  confetti:(x,y,z)=>{if(reduced)return;rain={x,y,z,t:0};confetti.visible=true;},castImage:()=>castImage,castFrame:id=>FRAMES[id]});
 for(const e of batch2)built.add(e.id);
 if(prints.length){const stage=new T.Mesh(mergeGeometries(prints,false)!,stageMat);stage.name='museum-stages';stage.matrixAutoUpdate=false;scene.add(stage);disposables.push(stage.geometry);for(const p of prints)p.dispose();}
 type Ex={id:string;pose:(a:ExhibitAnim|null)=>void;play:(a:string,arg?:number)=>number;onTime?:(a:string,t:number,prev:number,arg?:number)=>void;finish:(a:string,arg?:number)=>void;reset:()=>void;step?:(dt:number)=>boolean};
 const all=[...([laws,penalty,zoetrope,board].filter(v=>!!v) as unknown as Ex[]),...(batch2 as Ex[])];
 const byId=new Map<string,Ex>(all.map(e=>[e.id,e]));
 let active:ExhibitAnim|null=null;
 return {
  /** Cases whose object is this module's stage (the scene skips their vitrine and static object). */
  built,
  /** Each stage's proscenium top (world y): the room hangs the case's year/title plaque there. */
  stageTops,
  has:(id:string)=>byId.has(id),
  /** Play one beat's animation; returns its length in seconds (0 with reduced motion). */
  play(id:string,anim:string,arg?:number){const e=byId.get(id);if(!e)return 0;if(active){const prev=byId.get(active.id);prev?.finish(active.anim,active.arg);prev?.pose(null);}
   const dur=e.play(anim,arg);active={id,anim,t:0,dur,arg};if(dur<=0){e.onTime?.(anim,99,0,arg);e.finish(anim,arg);e.pose(null);active=null;}else e.pose(active);return dur;},
  /** The zoetrope's crank (radians of drum turn, from a drag). */
  crank(d:number){zoetrope?.crank(d);zoetrope?.pose(active?.id===zoetrope.id?active:null);},
  reset(id:string){const e=byId.get(id);if(active?.id===id)active=null;e?.reset();},
  /** Advance the playing animation and the particles; true while anything moves (the room's loop keeps rendering). */
  update(dt:number){let busy=false;
   if(active){const e=byId.get(active.id)!,prev=active.t;active.t+=dt;e.onTime?.(active.anim,active.t,prev,active.arg);if(active.t>=active.dur){e.finish(active.anim,active.arg);e.pose(null);active=null;}else{e.pose(active);busy=true;}}
   for(const e of all)if(e.step?.(dt)){if(e===(zoetrope as unknown as Ex))e.pose(active?.id===e.id?active:null);busy=true;}
   if(stepParticles(dt))busy=true;return busy;},
  get debug(){return {active:active?{...active}:null,zoetrope:zoetrope?{angle:zoetrope.angle,era:zoetrope.era,speed:zoetrope.speed}:null,board:board?board.rows:null,castLoaded:!!castImage};},
  dispose(){for(const d of disposables)d.dispose();},
 };
}
export type StoryExhibits=ReturnType<typeof createStoryExhibits>;

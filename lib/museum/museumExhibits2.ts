import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {CASE_PLACES,CASE} from './museumLayout';
import {museumSfx} from './museumSound';
import {STAGE_RECTS,type Rect} from './museumStagePaint';

/**
 * Storytelling stages, batch 2 (Oct 4 2026): the lantern (cards 1970), the VAR booth, the globe (1991), the futsal court, the
 * ball cabinet (laced leather), the 1970 TV set (Telstar), the kit lockers and the Hall of Fame podium. Same recipe and helpers
 * as museumExhibits.ts (which owns the shared textures, sprites and particles and passes them in as `kit`).
 * Screens (lantern slide, VAR monitor, TV, globe board, scale sign) are small canvas textures redrawn only while a beat plays.
 * Every word drawn on a screen comes from the case's own facts (years, places, scores, sizes) or is a plain label.
 */
export type ExhibitAnim={id:string;anim:string;t:number;dur:number;arg?:number};
export type Ex={id:string;pose:(a:ExhibitAnim|null)=>void;play:(a:string,arg?:number)=>number;onTime?:(a:string,t:number,prev:number,arg?:number)=>void;finish:(a:string,arg?:number)=>void;reset:()=>void;step?:(dt:number)=>boolean};
type Sprite=T.Mesh&{userData:{h:number;frame:string;flip:boolean}};
export type Kit={scene:T.Scene;reduced:boolean;open:Readonly<Record<string,boolean>>;earned:number;mat:T.Material;stageMat:T.Material;fxMat:T.Material;disposables:{dispose:()=>void}[];
 add:(geo:T.BufferGeometry,x:number,y:number,z:number,hex:string,rx?:number,ry?:number,rz?:number,s?:number)=>unknown;
 print:(rc:Rect,x:number,y:number,z:number,w:number,h:number,rx?:number,ry?:number)=>void;backdrop:(id:string,rc:Rect)=>void;
 sprite:(frame:string,h:number,name:string)=>Sprite;setFrame:(m:Sprite,frame:string,flip?:boolean,h?:number)=>void;
 mesh:(g:T.BufferGeometry,hex?:string,name?:string)=>T.Mesh;colored:(g:T.BufferGeometry,hex:string)=>T.BufferGeometry;uvRect:(g:T.BufferGeometry,rc:Rect)=>T.BufferGeometry;
 ballMesh:(r:number,name:string)=>T.Mesh;sparkle:(x:number,y:number,z:number)=>void;confetti:(x:number,y:number,z:number)=>void;castImage:()=>HTMLImageElement|null;castFrame:(id:string)=>{x:number;y:number;w:number;h:number}|undefined};
const TOP=CASE.plinthH+.04;
const ease=(t:number)=>t<=0?0:t>=1?1:t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const clamp01=(v:number)=>v<0?0:v>1?1:v;
const seg=(t:number,a:number,b:number)=>ease(clamp01((t-a)/Math.max(.001,b-a)));
const FONT='system-ui, -apple-system, "Segoe UI", sans-serif';

export function buildBatch2(k:Kit):Ex[]{
 const {reduced,add,scene}=k,out:Ex[]=[];
 /** A canvas screen on a quad; `draw` repaints it (only while its exhibit animates). */
 function screen(w:number,h:number,pw:number,ph:number,name:string){const c=document.createElement('canvas');c.width=pw;c.height=ph;const g=c.getContext('2d')!,tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=2;const m=new T.MeshBasicMaterial({map:tex,transparent:false});const mesh=new T.Mesh(new T.PlaneGeometry(w,h),m);mesh.name=name;scene.add(mesh);k.disposables.push(tex,m,mesh.geometry);return {g,tex,mesh,W:pw,H:ph};}
 const cast=(g:CanvasRenderingContext2D,id:string,x:number,baseY:number,h:number,flip=false)=>{const f=k.castFrame(id),img=k.castImage();if(!f||!img)return;const w=h*f.w/f.h;g.save();g.translate(x,baseY);if(flip)g.scale(-1,1);g.drawImage(img,f.x,f.y,f.w,f.h,-w/2,-h,w,h);g.restore();};
 /** Text that always fits: shrinks from `size` until it is no wider than `maxW` (default: the canvas width minus margins). */
 const text=(g:CanvasRenderingContext2D,s:string,x:number,y:number,size:number,color:string,align:CanvasTextAlign='center',weight=900,maxW=g.canvas.width-24)=>{g.fillStyle=color;g.textAlign=align;g.textBaseline='middle';let px=size;do{g.font=`${weight} ${px}px ${FONT}`;px-=1;}while(g.measureText(s).width>maxW&&px>8);g.fillText(s,x,y);};
 const card=(g:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string,rot=0)=>{g.save();g.translate(x,y);g.rotate(rot);g.fillStyle=color;g.strokeStyle='#ffffff';g.lineWidth=Math.max(2,w*.08);g.beginPath();g.roundRect(-w/2,-h/2,w,h,w*.12);g.fill();g.stroke();g.restore();};

 // ---- 1970 cards: the magic lantern --------------------------------------------------------------------------------------
 if(k.open['cards-1970']){const id='cards-1970',p=CASE_PLACES[id];k.backdrop(id,STAGE_RECTS.cards);
  add(new T.BoxGeometry(.17,.14,.2),p.x-.26,TOP+.12,p.z+.2,'#c99a2e');add(new T.CylinderGeometry(.04,.05,.09,14).rotateX(Math.PI/2),p.x-.26,TOP+.13,p.z+.06,'#22366b');add(new T.CylinderGeometry(.025,.03,.1,10),p.x-.26,TOP+.24,p.z+.22,'#22366b');add(new T.BoxGeometry(.2,.05,.24),p.x-.26,TOP+.025,p.z+.2,'#6f5236');
  const s=screen(.66,.495,512,384,'museum-lantern-slide');s.mesh.position.set(p.x+.06,TOP+.4,p.z-.43);
  const beamG=k.uvRect(new T.PlaneGeometry(1,1),STAGE_RECTS.beam);const beam=new T.Mesh(beamG,k.fxMat);beam.name='museum-lantern-beam';scene.add(beam);k.disposables.push(beamG);
  beam.position.set(p.x-.1,TOP+.27,p.z-.2);beam.rotation.set(-Math.PI/2+.15,0,.35);beam.scale.set(.32,.62,1);beam.visible=false;
  const st={slide:'off',lit:''};
  function draw(slide:string,t:number){const {g,W,H}=s;g.fillStyle='#14101e';g.fillRect(0,0,W,H);if(slide==='off'){s.tex.needsUpdate=true;return;}
   const glow=reduced?1:seg(t,0,.4);g.globalAlpha=glow;g.fillStyle='#fff3d6';g.fillRect(12,12,W-24,H-24);
   if(slide==='lamp'||slide==='yellow'||slide==='red'){// the traffic light that gave the idea, then the cards growing out of it
    g.fillStyle='#2b2b33';g.beginPath();g.roundRect(W/2-60,40,120,300,20);g.fill();
    const on=(c:string)=>slide==='yellow'&&c==='amber'||slide==='red'&&c==='red';
    for(const [c,y,col] of [['red',100,'#e0453d'],['amber',190,'#f2bb45'],['green',280,'#3a9e5c']] as const){g.fillStyle=on(c)?col:'#4a4a55';g.beginPath();g.arc(W/2,y,36,0,Math.PI*2);g.fill();}
    if(slide==='yellow'){const kk=reduced?1:seg(t,.4,1.2);card(g,W/2+150*kk,190-40*kk,60+40*kk,84+56*kk,'#f8d651',.2*kk);text(g,'CAREFUL',W/2+150,330,30,'#22366b');}
    if(slide==='red'){card(g,W/2+150,150,100,140,'#f8d651',.2);const kk=reduced?1:seg(t,.4,1.2);card(g,W/2-150*kk,100+50*kk,60+40*kk,84+56*kk,'#e0453d',-.2*kk);text(g,'STOP',W/2-150,330,30,'#22366b');}}
   if(slide==='mexico'){g.fillStyle='#4f9a5b';g.fillRect(12,250,W-24,H-262);cast(g,'ref',W/2,330,230);card(g,W/2+95,95,52,72,'#f8d651',.15);text(g,'MEXICO 1970',W/2,40,34,'#22366b');}
   if(slide==='crowd'){g.fillStyle='#c9a36a';g.fillRect(12,150,W-24,H-162);for(let i=0;i<11;i++){const x=40+i*42,y=250+(i%2)*40;g.fillStyle=['#3255a4','#ff48b0','#2f8f8a'][i%3];g.beginPath();g.arc(x,y,16,0,Math.PI*2);g.fill();g.fillRect(x-14,y+14,28,40);
     if(i%2===0){const by=y-58,kk=reduced?1:seg(t,.2+i*.05,.6+i*.05);g.globalAlpha=glow*kk;g.fillStyle='#ffffff';g.beginPath();g.roundRect(x-22,by-18,44,34,10);g.fill();card(g,x,by-1,16,22,i%4?'#e0453d':'#f8d651');g.globalAlpha=glow;}}
    card(g,W/2,90,70,98,'#e0453d',.1);}
   g.globalAlpha=1;s.tex.needsUpdate=true;}
  draw('off',0);
  out.push({id,pose(a){const ph=a?.anim??'';if(a&&['lamp','yellow','red','mexico','crowd'].includes(ph)){st.slide=ph;draw(ph,a.t);}beam.visible=st.slide!=='off'&&!reduced;},
   play(anim){if(anim==='lamp')museumSfx.look();if(anim==='yellow'||anim==='red')museumSfx.card();if(anim==='crowd')museumSfx.crowd();st.slide=anim;draw(anim,reduced?9:0);return reduced?0:{lamp:1.2,yellow:1.4,red:1.4,mexico:1.2,crowd:1.6}[anim]??1;},
   onTime(anim,t,prev){if(anim==='red'&&prev<1&&t>=1)k.sparkle(p.x-.05,TOP+.5,p.z-.4);},
   finish(anim){st.slide=anim;draw(anim,9);},reset(){st.slide='off';draw('off',0);beam.visible=false;}});}

 // ---- 2018: the VAR booth ------------------------------------------------------------------------------------------------
 if(k.open['var-2018']){const id='var-2018',p=CASE_PLACES[id];k.backdrop(id,STAGE_RECTS.var);
  add(new T.BoxGeometry(.66,.035,.26),p.x,TOP+.3,p.z-.05,'#3a3f4d');for(const sx of [-1,1])add(new T.BoxGeometry(.03,.3,.24),p.x+sx*.3,TOP+.15,p.z-.05,'#2b2f3a');
  add(new T.BoxGeometry(.54,.33,.03),p.x,TOP+.52,p.z-.162,'#1b1f29');add(new T.BoxGeometry(.05,.2,.04),p.x,TOP+.4,p.z-.2,'#1b1f29');add(new T.BoxGeometry(.14,.02,.08),p.x+.18,TOP+.33,p.z+.02,'#22366b');// monitor stand + jog dial pad
  const s=screen(.5,.29,512,296,'museum-var-monitor');s.mesh.position.set(p.x,TOP+.52,p.z-.143);
  const dial=k.mesh(new T.CylinderGeometry(.035,.035,.02,16),'#d8466f','museum-var-dial');dial.position.set(p.x+.18,TOP+.35,p.z+.02);
  const chair=k.mesh(mergeGeometries([k.colored(new T.BoxGeometry(.13,.03,.12).translate(0,.13,0),'#2b2f3a'),k.colored(new T.BoxGeometry(.13,.15,.03).translate(0,.22,.06).rotateX(-.12),'#c0303a'),k.colored(new T.BoxGeometry(.11,.11,.035).translate(0,.22,.063),'#2b2f3a'),
   k.colored(new T.BoxGeometry(.02,.02,.1).translate(-.07,.17,0),'#2b2f3a'),k.colored(new T.BoxGeometry(.02,.02,.1).translate(.07,.17,0),'#2b2f3a'),k.colored(new T.CylinderGeometry(.01,.01,.11,6).translate(0,.06,0),'#c9ccd1'),
   ...[0,1,2,3,4].map(i=>k.colored(new T.BoxGeometry(.012,.01,.06).translate(0,.008,.03).rotateY(i/5*Math.PI*2),'#c9ccd1'))])!,'#ffffff','museum-var-chair');
  const st={on:false,checks:false,scene:'over' as 'over'|'on',plays:0,call:-1};
  function pitch(g:CanvasRenderingContext2D,W:number,H:number){g.fillStyle='#3f8f55';g.fillRect(0,0,W,H);for(let x=0;x<W;x+=48){g.fillStyle='#46995d';g.fillRect(x,0,24,H);}}
  /** The booth monitor, phone-first: big type, one word or an icon per idea, nothing stacked on anything else. */
  function draw(ph:string,t:number,arg=-1){const {g,W,H}=s;if(!st.on&&ph!=='booth'){g.fillStyle='#0d1018';g.fillRect(0,0,W,H);s.tex.needsUpdate=true;return;}
   g.globalAlpha=ph==='booth'?(reduced?1:seg(t,0,.6)):1;pitch(g,W,H);
   const tag=(label:string)=>{g.font=`900 26px ${FONT}`;const w=Math.min(W-20,g.measureText(label).width+28);g.fillStyle='rgba(13,22,46,.85)';g.beginPath();g.roundRect(10,10,w,42,10);g.fill();text(g,label,10+w/2,31,26,'#fff1d3','center',900,w-20);};
   if(ph==='booth'){tag('VAR');text(g,'2018',W/2,H/2-30,80,'#fff1d3');text(g,'RUSSIA',W/2,H/2+48,46,'#f2bb45');}
   else if(ph==='checks'||(st.checks&&ph==='')){tag('VAR CAN CHECK');
    // Four big tiles, an icon and ONE word each.
    const words=['GOALS','PENALTY','RED CARD','WHO?'],tw=(W-50)/2,th=(H-90)/2;
    words.forEach((w,i)=>{const kk=reduced||ph!=='checks'?1:seg(t,.2+i*.35,.5+i*.35),x=18+(i%2)*(tw+14),y=66+Math.floor(i/2)*(th+8);
     g.globalAlpha=.3+.7*kk;g.fillStyle='#14203f';g.beginPath();g.roundRect(x,y,tw,th,14);g.fill();g.globalAlpha=1;
     const ix=x+44,iy=y+th/2,c=kk>.5?'#f2bb45':'#6a7a9a';g.fillStyle=c;g.strokeStyle=c;g.lineWidth=5;
     if(i===0)g.strokeRect(ix-24,iy-16,48,32);else if(i===1){g.beginPath();g.arc(ix,iy,12,0,Math.PI*2);g.fill();}else if(i===2)card(g,ix,iy,28,40,kk>.5?'#e0453d':'#6a7a9a');else{g.beginPath();g.arc(ix,iy-8,12,0,Math.PI*2);g.fill();g.fillRect(ix-14,iy+6,28,18);}
     text(g,w,x+86,iy,32,'#fff1d3','left',900,tw-96);});}
   else{// The replay: wide shot (the shot flies at the goal), then the close-up on the line, then the call.
    const kk=ph==='scrub'?(reduced?1:clamp01(t/2.4)):1,lineX=W*.62;
    if(kk<.55){tag('REPLAY');g.fillStyle='#fff8e6';g.fillRect(lineX-4,0,8,H);cast(g,'z-pass',120,H-20,170,true);const b=kk/.55;g.fillStyle='#fff';g.beginPath();g.arc(140+(lineX+40-140)*b,H-50-Math.sin(b*Math.PI)*70,13,0,Math.PI*2);g.fill();}
    else{tag('CLOSE-UP');g.fillStyle='#fff8e6';g.fillRect(lineX-6,0,12,H);const r=58,cx=st.scene==='over'?lineX+r+24:lineX+14;g.fillStyle='#ffffff';g.strokeStyle='#22366b';g.lineWidth=5;g.beginPath();g.arc(cx,H/2+10,r,0,Math.PI*2);g.fill();g.stroke();}
    if(ph==='call'&&arg>=0||st.call>=0&&ph===''){const c=ph==='call'?arg:st.call,right=(c===1)===(st.scene==='over');
     g.fillStyle='rgba(13,22,46,.9)';g.beginPath();g.roundRect(14,H-112,W*.5-10,98,14);g.fill();
     text(g,c===1?'GOAL':'NO GOAL',14+(W*.5-10)/2,H-80,40,'#fff1d3','center',900,W*.5-36);text(g,right?'✓ RIGHT':'✗ LOOK AGAIN',14+(W*.5-10)/2,H-36,30,right?'#f2bb45':'#ff9a9a','center',900,W*.5-36);}}
   g.globalAlpha=1;s.tex.needsUpdate=true;}
  draw('',0);
  function pose(a:ExhibitAnim|null){const ph=a?.anim??'',t=a?.t??0;const ck=ph==='booth'?seg(t,0,.8):st.on?1:0;chair.position.set(p.x+.36,TOP,p.z+.26-ck*.12);chair.rotation.y=-.5;dial.rotation.y=ph==='scrub'?t*6:dial.rotation.y;if(a)draw(ph,t,a.arg);}
  pose(null);
  out.push({id,pose,play(anim,arg){if(anim==='booth'){st.on=true;st.scene=st.plays++%2?'on':'over';museumSfx.look();}if(anim==='checks')st.checks=true;if(anim==='scrub'){st.checks=false;st.call=-1;museumSfx.turn();}if(anim==='call'){st.call=arg??0;museumSfx.reveal();}
    if(reduced)draw(anim,9,arg);return reduced?0:{booth:1,checks:1.8,scrub:2.6,call:1.2}[anim]??1;},
   onTime(anim,t,prev){if(anim==='checks'&&Math.floor((t-.2)/.35)!==Math.floor((prev-.2)/.35)&&t>.2&&t<1.8)museumSfx.tick();if(anim==='scrub'&&Math.floor(t*8)!==Math.floor(prev*8))museumSfx.tick();},
   finish(anim,arg){draw(anim,9,arg);},reset(){st.on=st.checks=false;st.call=-1;draw('',0);pose(null);}});}

 // ---- 1991: the globe and the final --------------------------------------------------------------------------------------
 if(k.open['wwc-1991']){const id='wwc-1991',p=CASE_PLACES[id];k.backdrop(id,STAGE_RECTS.wwc);
  add(new T.CylinderGeometry(.07,.09,.03,16),p.x-.2,TOP+.015,p.z-.05,'#9d805b');add(new T.CylinderGeometry(.012,.012,.2,8),p.x-.2,TOP+.12,p.z-.05,'#9d805b');add(new T.TorusGeometry(.19,.008,6,30,Math.PI).rotateZ(Math.PI/2),p.x-.2,TOP+.38,p.z-.05,'#c99a2e');
  const gg=new T.IcosahedronGeometry(.17,3),pos=gg.attributes.position,c=new Float32Array(pos.count*3),v=new T.Vector3();
  for(let f=0;f<pos.count;f+=3){v.set(0,0,0);for(let j=0;j<3;j++)v.add(new T.Vector3().fromBufferAttribute(pos,f+j));v.normalize();const land=Math.sin(v.x*5+v.y*3)*Math.cos(v.z*4-v.y*2)>.25;const col=new T.Color(land?(v.y>0?'#e46aa8':'#2f8f8a'):'#6fa8dc');for(let j=0;j<3;j++){c[(f+j)*3]=col.r;c[(f+j)*3+1]=col.g;c[(f+j)*3+2]=col.b;}}
  gg.setAttribute('color',new T.BufferAttribute(c,3));const globe=new T.Mesh(gg,k.mat);globe.name='museum-globe';globe.position.set(p.x-.2,TOP+.38,p.z-.05);scene.add(globe);k.disposables.push(gg);
  const pin=k.mesh(mergeGeometries([k.colored(new T.ConeGeometry(.012,.05,8).rotateX(Math.PI).translate(0,.025,0),'#e0453d'),k.colored(new T.SphereGeometry(.016,8,6).translate(0,.055,0),'#e0453d')])!,'#ffffff','museum-globe-pin');pin.visible=false;
  const s=screen(.3,.15,256,128,'museum-wwc-board');s.mesh.position.set(p.x+.2,TOP+.62,p.z-.3);add(new T.BoxGeometry(.32,.17,.02),p.x+.2,TOP+.62,p.z-.312,'#22366b');add(new T.BoxGeometry(.02,.5,.02),p.x+.2,TOP+.3,p.z-.315,'#22366b');
  for(const sx of [-1,1])add(new T.BoxGeometry(.01,.12,.01),p.x+.28+sx*.08,TOP+.06,p.z-.25,'#ffffff');add(new T.BoxGeometry(.17,.01,.01),p.x+.28,TOP+.12,p.z-.25,'#ffffff');
  const striker=k.sprite('w-striker',.24,'museum-wwc-striker');striker.position.set(p.x+.12,TOP,p.z+.12);const ball=k.ballMesh(.02,'museum-wwc-ball');ball.position.set(p.x+.16,TOP+.02,p.z+.1);
  const st={spun:false,goals:0,result:false};
  function draw(){const {g,W,H}=s;g.fillStyle='#14203f';g.fillRect(0,0,W,H);if(st.result){text(g,'USA 2 – 1 NOR',W/2,H/2-14,30,'#fff1d3');text(g,'FINAL',W/2,H/2+26,20,'#f2bb45');}else if(st.goals>0){text(g,'AKERS',W/2,H/2-18,28,'#fff1d3');for(let i=0;i<st.goals;i++){g.fillStyle='#fff';g.beginPath();g.arc(W/2-20+i*40,H/2+24,13,0,Math.PI*2);g.fill();}}else if(st.spun){text(g,'CHINA 1991',W/2,H/2,32,'#fff1d3');}else text(g,'1991',W/2,H/2,34,'#5a6a8a');s.tex.needsUpdate=true;}
  draw();
  function pose(a:ExhibitAnim|null){const ph=a?.anim??'',t=a?.t??0;
   if(ph==='spin'){globe.rotation.y=(reduced?1:seg(t,0,1.6))*Math.PI*5+.6;pin.visible=t>1.5||reduced;}else if(st.spun){globe.rotation.y=Math.PI*5+.6;pin.visible=true;}
   pin.position.set(globe.position.x+.04,globe.position.y+.12,globe.position.z+.11);
   if(ph==='goals'){const shot=(t%1.3)/1.3,n=Math.floor(t/1.3);k.setFrame(striker,shot<.35?'w-striker':'w-cheer');const kk=seg(shot,.25,.55);ball.position.set(p.x+.16+(.12)*kk,TOP+.02+Math.sin(kk*Math.PI)*.08,p.z+.1-(.35)*kk);if(n!==st.goals&&shot>.55&&n<2){st.goals=Math.min(2,n+1);draw();}}
   else{k.setFrame(striker,st.result||st.goals>=2?'w-cheer':'w-striker');ball.position.set(p.x+(st.goals?.28:.16),TOP+.02,p.z+(st.goals?-.25:.1));}}
  pose(null);
  out.push({id,pose,play(anim){if(anim==='spin')museumSfx.spin();if(anim==='result')museumSfx.whistle();if(anim==='goals'){st.goals=0;museumSfx.kick();}return reduced?0:{spin:1.8,goals:2.7,result:1.4}[anim]??1;},
   onTime(anim,t,prev){if(anim==='goals'&&[.5,1.8].some(x=>prev<x&&t>=x)){museumSfx.net();k.sparkle(p.x+.28,TOP+.1,p.z-.25);}if(anim==='spin'&&prev<1.5&&t>=1.5){st.spun=true;draw();museumSfx.look();}if(anim==='result'&&prev<.5&&t>=.5){st.result=true;draw();museumSfx.crowd();k.confetti(p.x,TOP+.3,p.z);}},
   finish(anim){if(anim==='spin')st.spun=true;if(anim==='goals')st.goals=2;if(anim==='result')st.result=true;draw();},reset(){st.spun=false;st.goals=0;st.result=false;draw();pose(null);}});}

 // ---- 1989: the futsal court ---------------------------------------------------------------------------------------------
 if(k.open['futsal-1989']){const id='futsal-1989',p=CASE_PLACES[id];k.backdrop(id,STAGE_RECTS.futsal);
  add(new T.BoxGeometry(.86,.02,.56),p.x,TOP+.01,p.z+.05,'#6aa5c2');for(const [w,d,x,z] of [[.84,.008,0,-.22],[.84,.008,0,.32],[.008,.54,-.42,.05],[.008,.54,.42,.05],[.008,.54,0,.05]] as const)add(new T.BoxGeometry(w,.004,d),p.x+x,TOP+.022,p.z+z,'#fff8e6');
  add(new T.TorusGeometry(.07,.004,4,24).rotateX(Math.PI/2),p.x,TOP+.022,p.z+.05,'#fff8e6');for(const sx of [-1,1]){add(new T.BoxGeometry(.008,.1,.008),p.x+sx*.42,TOP+.06,p.z,'#ffffff');add(new T.BoxGeometry(.008,.1,.008),p.x+sx*.42,TOP+.06,p.z+.1,'#ffffff');add(new T.BoxGeometry(.008,.008,.11),p.x+sx*.42,TOP+.11,p.z+.05,'#ffffff');}
  const players=['k9','k10','kid-m','z-pass','f-sole'].map((f,i)=>{const sp=k.sprite(f,.2,'museum-futsal-'+i);sp.visible=false;return sp;});const spots=[[-.28,.15],[-.12,-.05],[.08,.2],[.24,-.02],[-.02,.05]] as const;
  const big=k.ballMesh(.03,'museum-futsal-big'),small=k.ballMesh(.022,'museum-futsal-small');(small.material as T.Material);big.visible=small.visible=false;
  const pole=k.mesh(new T.BoxGeometry(.01,.36,.01),'#9d805b','museum-futsal-pole'),flag=k.mesh(new T.BoxGeometry(.14,.09,.005),'#3a9e5c','museum-futsal-pennant'),flagStripe=k.mesh(new T.BoxGeometry(.1,.03,.006),'#f8d651','museum-futsal-stripe');
  pole.position.set(p.x+.36,TOP+.18,p.z-.22);const st={lit:false,cup:false};
  function pose(a:ExhibitAnim|null){const ph=a?.anim??'',t=a?.t??0;
   players.forEach((sp,i)=>{sp.visible=st.lit||ph==='court'&&t>i*.15;const [x,z]=spots[i];sp.position.set(p.x+x,TOP+.02+(ph==='court'?Math.max(0,.04-(t-i*.15)*.1):0),p.z+z);});
   const solo=players[4];if(ph==='sole'){const kk=reduced?1:seg(t,0,1.6);solo.position.x=p.x-.02+.2*kk;small.visible=true;small.position.set(solo.position.x+.04,TOP+.022,p.z+.08);small.rotation.z-=.2;}
   if(ph==='bounce'){big.visible=small.visible=true;const hb=(t:number,h0:number,e:number)=>{let h=h0,tt=t,v=0;for(let i=0;i<6;i++){const dur=Math.sqrt(2*h/9.8)*(i?2:1)*1.6;if(tt<dur){const tau=i?tt-dur/2:tt-dur;v=i?h-(9.8/1.6/1.6)*.5*tau*tau:h-(9.8/1.6/1.6)*.5*tau*tau;return Math.max(0,v);}tt-=dur;h*=e;}return 0;};
    big.position.set(p.x-.15,TOP+.03+hb(t,.3,.62),p.z+.22);small.position.set(p.x+.15,TOP+.022+hb(t,.3,.2),p.z+.22);}
   else if(ph!=='sole'&&!st.cup&&ph!=='cup'){if(st.lit&&ph!=='court'){big.visible=true;big.position.set(p.x-.15,TOP+.03,p.z+.22);small.visible=true;small.position.set(p.x+.15,TOP+.022,p.z+.22);}}
   const fk=ph==='cup'?seg(t,0,1):st.cup?1:0;flag.visible=flagStripe.visible=fk>0;flag.position.set(p.x+.36+.075,TOP+.06+.28*fk,p.z-.22);flagStripe.position.set(flag.position.x,flag.position.y,flag.position.z+.004);}
  pose(null);
  out.push({id,pose,play(anim){if(anim==='court'){st.lit=true;museumSfx.bell();}if(anim==='bounce')museumSfx.kick();if(anim==='cup')museumSfx.reveal();return reduced?0:{court:1.2,bounce:2.4,sole:1.8,cup:1.4}[anim]??1;},
   onTime(anim,t,prev){if(anim==='bounce'&&Math.floor(t*3)!==Math.floor(prev*3))museumSfx.tick();if(anim==='cup'&&prev<1&&t>=1){k.sparkle(p.x+.43,TOP+.36,p.z-.2);museumSfx.crowd();}},
   finish(anim){if(anim==='cup')st.cup=true;},reset(){st.lit=st.cup=false;big.visible=small.visible=false;pose(null);}});}

 // ---- Laced leather: the ball cabinet ------------------------------------------------------------------------------------
 if(k.open['laced-leather']){const id='laced-leather',p=CASE_PLACES[id];k.backdrop(id,STAGE_RECTS.leather);
  add(new T.BoxGeometry(.26,.06,.2),p.x-.18,TOP+.03,p.z+.05,'#c9ccd1');add(new T.CylinderGeometry(.07,.07,.02,20).rotateX(Math.PI/2),p.x-.18,TOP+.1,p.z+.156,'#fff8e6');add(new T.BoxGeometry(.02,.06,.02),p.x-.18,TOP+.12,p.z+.06,'#c9ccd1');
  const plate=k.mesh(new T.CylinderGeometry(.1,.1,.012,20),'#c9ccd1','museum-scale-plate');const needle=k.mesh(new T.BoxGeometry(.006,.055,.004).translate(0,.025,0),'#e0453d','museum-scale-needle');needle.position.set(p.x-.18,TOP+.1,p.z+.168);
  const lmat=new T.MeshLambertMaterial({vertexColors:true});k.disposables.push(lmat);
  const lg=new T.IcosahedronGeometry(.06,2),lp=lg.attributes.position,lc=new Float32Array(lp.count*3),v=new T.Vector3();for(let f=0;f<lp.count;f+=3){v.set(0,0,0);for(let j=0;j<3;j++)v.add(new T.Vector3().fromBufferAttribute(lp,f+j));v.normalize();const seam=Math.abs(v.y)<.1||Math.abs(v.x)<.06&&v.z>0;const col=new T.Color(seam?'#e9dcc0':'#8a5a33');for(let j=0;j<3;j++){lc[(f+j)*3]=col.r;lc[(f+j)*3+1]=col.g;lc[(f+j)*3+2]=col.b;}}
  lg.setAttribute('color',new T.BufferAttribute(lc,3));const leather=new T.Mesh(lg,lmat);leather.name='museum-leather-ball';scene.add(leather);k.disposables.push(lg);
  const size5=k.ballMesh(.066,'museum-size5');const s3=k.ballMesh(.05,'museum-size3'),s4=k.ballMesh(.058,'museum-size4');
  const kids=[['kid-s',.22],['kid-m',.27],['kid-l',.32]].map(([f,h],i)=>{const sp=k.sprite(f as string,h as number,'museum-kid-'+i);sp.visible=false;sp.position.set(p.x+.02+i*.16,TOP,p.z-.12);return sp;});
  const cloudG=k.uvRect(new T.PlaneGeometry(.3,.22),STAGE_RECTS.cloud);const cloud=new T.Mesh(cloudG,k.fxMat);cloud.name='museum-rain-cloud';cloud.visible=false;scene.add(cloud);k.disposables.push(cloudG);
  const drops=new T.InstancedMesh(k.uvRect(new T.PlaneGeometry(.018,.036),STAGE_RECTS.drop),k.fxMat,10);drops.name='museum-rain';drops.frustumCulled=false;drops.visible=false;scene.add(drops);k.disposables.push(drops.geometry);
  const s=screen(.3,.1,256,86,'museum-scale-sign');s.mesh.position.set(p.x+.2,TOP+.62,p.z-.42);const o=new T.Object3D();
  const st={on:false,wet:false,five:false,sizes:false};
  function sign(txt:string,sub=''){const {g,W,H}=s;g.fillStyle='#22366b';g.fillRect(0,0,W,H);text(g,txt,W/2,sub?30:H/2,txt.length>12?22:28,'#fff1d3');if(sub)text(g,sub,W/2,64,18,'#f2bb45');s.tex.needsUpdate=true;}
  sign('BALL CABINET');
  function pose(a:ExhibitAnim|null){const ph=a?.anim??'',t=a?.t??0,kk=a?(reduced?1:seg(t,0,.9)):1;
   const onScale=(ph==='weigh'?kk:st.on&&!st.five?1:0)*(ph==='size5'?1-kk:1);
   leather.position.set(p.x-.18+(1-onScale)*.32,TOP+.18+(ph==='weigh'?Math.sin(kk*Math.PI)*.1:0)-(st.wet||ph==='rain'?.008:0),p.z+.05);leather.visible=!st.sizes;
   const w5=ph==='size5'?kk:st.five?1:0;size5.visible=(st.five||ph==='size5')&&!st.sizes&&ph!=='sizes';size5.position.set(p.x-.18+(1-w5)*.34,TOP+.18,p.z+.05);
   const load=st.sizes?0:st.five||ph==='size5'?.55*w5+(1-w5)*(st.wet?.95:.5)*onScale:(st.wet||ph==='rain'?(ph==='rain'?.5+.45*seg(t,.3,1.6):.95):.5)*onScale;
   plate.position.set(p.x-.18,TOP+.115-load*.012,p.z+.05);needle.rotation.z=-load*2.2+1.1;
   (lmat.color as T.Color).set(st.wet||ph==='rain'&&t>.6?'#6b5a52':'#ffffff');
   cloud.visible=ph==='rain'&&!reduced;cloud.position.set(p.x-.18,TOP+.55,p.z+.05);drops.visible=cloud.visible;if(drops.visible){for(let i=0;i<10;i++){const y=TOP+.5-((t*.9+i*.07)%.38);o.position.set(p.x-.3+i*.026,y,p.z+.06);o.updateMatrix();drops.setMatrixAt(i,o.matrix);}drops.instanceMatrix.needsUpdate=true;}
   const sk=ph==='sizes'?kk:st.sizes?1:0;kids.forEach(sp=>sp.visible=sk>0);[s3,s4].forEach(b=>b.visible=sk>0);if(sk>0){s3.position.set(p.x+.02,TOP+.05,p.z+.1);s4.position.set(p.x+.18,TOP+.058,p.z+.1);size5.visible=true;size5.position.set(p.x+.34,TOP+.066,p.z+.1);kids.forEach((sp,i)=>sp.position.y=TOP+(1-sk)*-.3);}}
  pose(null);
  out.push({id,pose,play(anim){if(anim==='weigh'){st.on=true;sign('BROWN LEATHER','WITH LACES');museumSfx.tick();}if(anim==='rain'){st.on=true;museumSfx.hush();}if(anim==='size5'){sign('SIZE 5','68–70 cm · 410–450 g');museumSfx.tick();}if(anim==='sizes'){sign('SIZE 3 · 4 · 5','A BALL THAT FITS');museumSfx.reveal();}return reduced?0:{weigh:1,rain:1.8,size5:1.1,sizes:1.2}[anim]??1;},
   onTime(anim,t,prev){if(anim==='rain'&&prev<.6&&t>=.6)sign('SOAKED','HEAVIER');},
   finish(anim){if(anim==='rain'){st.wet=true;sign('SOAKED','HEAVIER');}if(anim==='size5')st.five=true;if(anim==='sizes')st.sizes=true;},
   reset(){st.on=st.wet=st.five=st.sizes=false;sign('BALL CABINET');pose(null);}});}

 // ---- 1970: the TV set and the Telstar -----------------------------------------------------------------------------------
 if(k.open['telstar-1970']){const id='telstar-1970',p=CASE_PLACES[id];k.backdrop(id,STAGE_RECTS.telstar);
  add(new T.BoxGeometry(.5,.36,.24),p.x+.08,TOP+.32,p.z-.2,'#8a5a33');add(new T.BoxGeometry(.54,.04,.26),p.x+.08,TOP+.12,p.z-.2,'#6f5236');for(const sx of [-1,1])add(new T.BoxGeometry(.03,.12,.03),p.x+.08+sx*.22,TOP+.06,p.z-.2,'#6f5236');
  for(const r of [-.5,.5])add(new T.CylinderGeometry(.004,.004,.2,4),p.x+.08+r*.1,TOP+.58,p.z-.25,'#c9ccd1',0,0,r);
  const s=screen(.34,.26,256,196,'museum-tv-screen');s.mesh.position.set(p.x+.03,TOP+.32,p.z-.077);
  const knob=k.mesh(new T.CylinderGeometry(.025,.025,.02,14).rotateX(Math.PI/2),'#f2bb45','museum-tv-knob');knob.position.set(p.x+.27,TOP+.38,p.z-.075);
  // The Telstar on a little stand in front: 12 dark pentagons on white.
  const tg=new T.IcosahedronGeometry(.07,3),tp=tg.attributes.position,tc=new Float32Array(tp.count*3),v=new T.Vector3(),dirs:T.Vector3[]=[],ico=new T.IcosahedronGeometry(1,0),ip=ico.attributes.position;for(let i=0;i<ip.count;i++){const d=new T.Vector3().fromBufferAttribute(ip,i).normalize();if(!dirs.some(o=>o.distanceTo(d)<.01))dirs.push(d);}ico.dispose();
  for(let f=0;f<tp.count;f+=3){v.set(0,0,0);for(let j=0;j<3;j++)v.add(new T.Vector3().fromBufferAttribute(tp,f+j));v.normalize();const dark=dirs.some(d=>d.dot(v)>.952);for(let j=0;j<3;j++){tc[(f+j)*3]=dark?.1:.97;tc[(f+j)*3+1]=dark?.11:.96;tc[(f+j)*3+2]=dark?.13:.92;}}
  tg.setAttribute('color',new T.BufferAttribute(tc,3));const ball=new T.Mesh(tg,k.mat);ball.name='museum-telstar-ball';ball.position.set(p.x-.24,TOP+.13,p.z+.18);scene.add(ball);k.disposables.push(tg);add(new T.CylinderGeometry(.04,.05,.06,12),p.x-.24,TOP+.03,p.z+.18,'#294f43');
  const st={on:false,bw:false};
  function draw(t:number,mode:'off'|'on'|'bw'|'big'){const {g,W,H}=s;if(mode==='off'){g.fillStyle='#1d2b2a';g.fillRect(0,0,W,H);g.fillStyle='rgba(255,255,255,.06)';g.fillRect(20,20,W-40,40);s.tex.needsUpdate=true;return;}
   const bw=mode==='bw'||mode==='big';g.fillStyle=bw?'#7d7d7d':'#3f9a55';g.fillRect(0,0,W,H);for(let x=0;x<W;x+=40){g.fillStyle=bw?'#8a8a8a':'#47a35d';g.fillRect(x,0,20,H);}
   const pl=(x:number,y:number,c:string)=>{g.fillStyle=bw?'#5a5a5a':c;g.beginPath();g.arc(x,y,10,0,Math.PI*2);g.fill();g.fillRect(x-9,y+8,18,26);};
   pl(60,100,'#f8d651');pl(190,90,'#2f6fb0');pl(140,140,'#f8d651');
   const r=mode==='big'?44:14,bx=mode==='big'?W/2:115,by=mode==='big'?H/2:125;g.fillStyle='#ffffff';g.beginPath();g.arc(bx,by,r,0,Math.PI*2);g.fill();g.fillStyle='#111';for(let i=0;i<5;i++){const a=i/5*Math.PI*2+t;g.beginPath();g.arc(bx+Math.cos(a)*r*.62,by+Math.sin(a)*r*.62,r*.22,0,Math.PI*2);g.fill();}g.beginPath();g.arc(bx,by,r*.25,0,Math.PI*2);g.fill();
   if(mode==='on'){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,H-26,W,26);g.fillStyle='#fff';g.font=`900 15px ${FONT}`;g.textAlign='center';g.fillText('MEXICO 1970',W/2,H-9);}
   g.fillStyle='rgba(255,255,255,.05)';for(let y=0;y<H;y+=4)g.fillRect(0,y,W,1);s.tex.needsUpdate=true;}
  draw(0,'off');
  function pose(a:ExhibitAnim|null){const ph=a?.anim??'',t=a?.t??0;if(ph==='tv')draw(t,'on');if(ph==='bw'){knob.rotation.z=-(reduced?1:seg(t,0,.6))*2;draw(t,t>.5||reduced?'bw':'on');}if(ph==='spin'){ball.rotation.y=t*7;ball.rotation.x=Math.sin(t*2)*.4;draw(t*2,'big');}}
  out.push({id,pose,play(anim){if(anim==='tv'){st.on=true;museumSfx.look();}if(anim==='bw'){st.bw=true;museumSfx.tick();}if(anim==='spin')museumSfx.spin();if(reduced)draw(0,anim==='tv'?'on':anim==='bw'?'bw':'big');return reduced?0:{tv:1.2,bw:1.2,spin:2.2}[anim]??1;},
   onTime(anim,t,prev){if(anim==='spin'&&prev<1.8&&t>=1.8)k.sparkle(p.x-.24,TOP+.2,p.z+.2);},
   finish(anim){if(anim==='tv')draw(0,'on');if(anim==='bw')draw(0,'bw');if(anim==='spin')draw(0,'big');},reset(){st.on=st.bw=false;knob.rotation.z=0;draw(0,'off');}});}

 // ---- Shirts: the kit lockers --------------------------------------------------------------------------------------------
 if(k.open['shirts']){const id='shirts',p=CASE_PLACES[id];k.backdrop(id,STAGE_RECTS.shirts);
  const xs=[-.28,0,.28],nums=['1','9','10'],frames=['k1','k9','k10'];
  for(const x of xs){add(new T.BoxGeometry(.25,.5,.02),p.x+x,TOP+.26,p.z-.32,'#4a6a7a');for(const sx of [-1,1])add(new T.BoxGeometry(.015,.5,.2),p.x+x+sx*.125,TOP+.26,p.z-.23,'#5f8494');add(new T.BoxGeometry(.25,.015,.2),p.x+x,TOP+.51,p.z-.23,'#5f8494');}
  const plates=screen(.001,.001,384,96,'museum-locker-plates');plates.mesh.visible=false;
  {const {g,W,H}=plates;g.fillStyle='#f6ecd6';g.fillRect(0,0,W,H);nums.forEach((n,i)=>{g.fillStyle='#22366b';g.font=`900 64px ${FONT}`;g.textAlign='center';g.textBaseline='middle';g.fillText(n,W/6+i*W/3,H/2+4);});plates.tex.needsUpdate=true;}
  const plateMat=new T.MeshBasicMaterial({map:plates.tex});k.disposables.push(plateMat);
  const doors=xs.map((x,i)=>{const pivot=new T.Group();pivot.position.set(p.x+x-.125,TOP+.26,p.z-.13);scene.add(pivot);const door=new T.Mesh(k.colored(new T.BoxGeometry(.25,.5,.012).translate(.125,0,0),'#2f8f8a'),k.mat);pivot.add(door);k.disposables.push(door.geometry);
   const pg=new T.PlaneGeometry(.12,.1),uv=pg.attributes.uv as T.BufferAttribute,u0=i/3,u1=(i+1)/3;uv.setXY(0,u0,1);uv.setXY(1,u1,1);uv.setXY(2,u0,0);uv.setXY(3,u1,0);const plate=new T.Mesh(pg,plateMat);plate.position.set(.125,.12,.008);pivot.add(plate);k.disposables.push(pg);plate.visible=false;
   const vent=new T.Mesh(k.colored(new T.BoxGeometry(.12,.04,.004),'#22666a'),k.mat);vent.position.set(.125,-.1,.008);pivot.add(vent);k.disposables.push(vent.geometry);return {pivot,plate};});
  const inside=frames.map((f,i)=>{const sp=k.sprite(f,.34,'museum-locker-'+i);sp.position.set(p.x+xs[i],TOP+.05,p.z-.27);sp.visible=false;return sp;});
  const line=['g0-cheer','g0-cheer','g1-cheer','g1-cheer','k1','ref'].map((f,i)=>{const sp=k.sprite(f,.2,'museum-lineup-'+i);sp.visible=false;sp.position.set(p.x-.36+i*.145,TOP,p.z+.22);return sp;});
  const st={lit:false,open:[false,false,false],lined:false};
  function pose(a:ExhibitAnim|null){const ph=a?.anim??'',t=a?.t??0;
   doors.forEach((d,i)=>{d.plate.visible=st.lit||ph==='numbers'&&t>.2+i*.3;const opening=ph===`open${nums[i]}`,ok=opening?(reduced?1:seg(t,0,.7)):st.open[i]?1:0;d.pivot.rotation.y=-ok*1.9;inside[i].visible=ok>.3;inside[i].position.y=TOP+.05+(opening?Math.sin(Math.min(1,t/.8)*Math.PI)*.03:0);});
   const lk=ph==='colours'?(reduced?1:seg(t,0,1.2)):st.lined?1:0;line.forEach((sp,i)=>{sp.visible=lk>0;sp.position.y=TOP+(1-clamp01(lk*1.6-i*.12))*-.25;});}
  pose(null);
  out.push({id,pose,play(anim){if(anim==='numbers'){st.lit=true;museumSfx.reveal();}const m=/^open(\d+)$/.exec(anim);if(m){st.open[nums.indexOf(m[1])]=true;museumSfx.flapBook();}if(anim==='colours'){st.lined=true;museumSfx.whistle();}return reduced?0:{numbers:1.2,open1:1,open9:1,open10:1,colours:1.6}[anim]??1;},
   onTime(anim,t,prev){if(/^open/.test(anim)&&prev<.6&&t>=.6){const i=nums.indexOf(anim.slice(4));k.sparkle(p.x+xs[i],TOP+.4,p.z-.2);}},finish(){},reset(){st.lit=st.lined=false;st.open=[false,false,false];pose(null);}});}

 // ---- Hall of Fame: the podium ---------------------------------------------------------------------------------------------
 if(k.open['hall-of-fame']){const id='hall-of-fame',p=CASE_PLACES[id];k.backdrop(id,STAGE_RECTS.hall);
  add(new T.BoxGeometry(.18,.14,.16),p.x,TOP+.07,p.z+.05,'#f2bb45');add(new T.BoxGeometry(.16,.09,.15),p.x-.18,TOP+.045,p.z+.05,'#c9ccd1');add(new T.BoxGeometry(.16,.06,.15),p.x+.18,TOP+.03,p.z+.05,'#bd7657');
  const frames=[0,1,2,3,4].map(i=>{const lit=i<k.earned;add(new T.BoxGeometry(.13,.16,.015),p.x-.32+i*.16,TOP+.62,p.z-.425,lit?'#e7b94a':'#7a6a58');const paper=k.mesh(new T.PlaneGeometry(.1,.12),lit?'#fff1d3':'#4a3f36','museum-hall-frame-'+i);paper.position.set(p.x-.32+i*.16,TOP+.62,p.z-.416);return paper;});void frames;
  const hero=k.sprite('hero-cheer',.3,'museum-hall-hero');hero.position.set(p.x,TOP+.14,p.z+.05);hero.visible=false;
  const boat=k.mesh(mergeGeometries([k.colored(new T.BoxGeometry(.26,.05,.08),'#294f43'),k.colored(new T.BoxGeometry(.12,.06,.06).translate(-.02,.055,0),'#fff1d3'),k.colored(new T.CylinderGeometry(.012,.012,.06,8).translate(.05,.09,0),'#e0453d')])!,'#ffffff','museum-hall-ferry');boat.visible=false;
  const sea=k.mesh(new T.BoxGeometry(.9,.012,.12),'#6fa8dc','museum-hall-sea');sea.position.set(p.x,TOP+.006,p.z+.32);sea.visible=false;
  const st={on:false,ferry:false};
  function pose(a:ExhibitAnim|null){const ph=a?.anim??'',t=a?.t??0;const hk=ph==='podium'?(reduced?1:seg(t,0,.6)):st.on?1:0;hero.visible=hk>0;hero.position.y=TOP+.14+(1-hk)*-.2+(ph==='podium'?Math.abs(Math.sin(t*6))*.02:0);
   const fk=ph==='ferry'?(reduced?1:seg(t,0,1.6)):st.ferry?1:0;boat.visible=sea.visible=fk>0;boat.position.set(p.x-.5+fk*.8,TOP+.035+Math.sin(t*5)*.005,p.z+.32);}
  pose(null);
  out.push({id,pose,play(anim){if(anim==='podium'){st.on=true;museumSfx.bell();}if(anim==='ferry'){st.ferry=true;museumSfx.hush();}return reduced?0:{podium:1.2,ferry:1.8}[anim]??1;},
   onTime(anim,t,prev){if(anim==='podium'&&prev<.6&&t>=.6){k.sparkle(p.x,TOP+.45,p.z+.05);if(k.earned>0)k.confetti(p.x,TOP+.4,p.z);}},finish(){},reset(){st.on=st.ferry=false;pose(null);}});}
 return out;
}

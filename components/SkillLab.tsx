'use client';
// Skill moves lab (dev review page, not linked from the island): plays one skill move on the real rig (bean style),
// with a ball and a defender for context. Query: ?skill=<type>&side=1|-1&view=side|q|front|top&t=<0..1 paused>.
// ?base=run|turn|stop|pass|shot|idle shows the base motions used for the fine-tunes. Heat: renders only while
// playing (stops after three loops), pauses when hidden; `window.__fiSkill` seeks and renders single frames for strips.
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {createPlayer,profileFor,type PlayerMotion} from '@/lib/graphics/player';
import {createIslandLighting} from '@/lib/graphics/islandLighting';
import {createMatchBallTexture} from '@/lib/graphics/matchBallTexture';
import {matchPlayerDress} from '@/lib/town/beanLooks';
import {SKILL_MOVES,SKILL_TYPES,applySkill,skillFrame,type SkillMove} from '@/lib/graphics/skillMoves';
import {createPreviewDriver,moveBounds,moveSeconds,type PreviewProbe} from '@/lib/graphics/previewMoves';
import {applyCelebrationArms} from '@/lib/graphics/celebrations';

type Base='run'|'turn'|'stop'|'pass'|'shot'|'idle'|'showcase';
const BASES:Base[]=['run','turn','stop','pass','shot','idle','showcase'];
const BASE_SECONDS:Record<Base,number>={run:2,turn:2.2,stop:2.4,pass:1.8,shot:2,idle:3,showcase:0};
const DT=1/60;
/** Short names for the demo URL (?skill=feint, ?skill=rainbow …). */
const ALIASES:Record<string,SkillMove>={insidecut:'insideCut',hook:'insideCut',outsidecut:'outsideCut',fakeshot:'fakeShot',fake:'fakeShot',nutmeg:'nutmeg',chip:'chipShot',trivela:'trivela',outside:'trivela',toepoke:'toePoke',toe:'toePoke',curl:'finesseShot',finesse:'finesseShot',block:'blockTackle',tackle:'blockTackle',poke:'pokeTackle',throw:'keeperThrow',roll:'keeperRoll',rollout:'keeperRoll',punt:'keeperPunt',airplane:'airplane',kneeslide:'kneeSlide',thanks:'thankPasser',point:'thankPasser',feint:'bodyFeint',bodyfeint:'bodyFeint',shoulderdrop:'bodyFeint',stepover:'stepover',scissors:'scissors',cruyff:'cruyffTurn',dragback:'dragBack',pullback:'dragBack',croqueta:'croqueta',elastico:'elastico',flipflap:'elastico',roulette:'roulette',marseille:'roulette',rainbow:'rainbowFlick',lambreta:'rainbowFlick',shield:'shield',charge:'shoulderCharge',scan:'scan',showcase:'showcase' as SkillMove};

export default function SkillLab(){
 const host=useRef<HTMLDivElement>(null);
 const [skill,setSkill]=useState<SkillMove|Base>('bodyFeint'),[side,setSide]=useState<1|-1>(1),[view,setView]=useState('q');
 const api=useRef<{restart:()=>void}>();
 const config=useRef({skill,side,view});config.current={skill,side,view};
 useEffect(()=>{
  const q=new URLSearchParams(location.search),raw=q.get('skill')??q.get('base'),s=raw&&ALIASES[raw.toLowerCase()]||raw;
  if(s&&((SKILL_TYPES as string[]).includes(s)||(BASES as string[]).includes(s)))setSkill(s as SkillMove);
  if(q.get('side')==='-1')setSide(-1);if(q.get('view'))setView(q.get('view')!);
 },[]);
 useEffect(()=>{
  const node=host.current;if(!node)return;let disposed=false,frame=0,loops=0,clock=0,prev=0,acc=0;
  const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;node.appendChild(renderer.domElement);
  const scene=new T.Scene();scene.background=new T.Color('#9fc7d8');
  const camera=new T.PerspectiveCamera(30,1,.1,60);
  const hemi=new T.HemisphereLight(),sun=new T.DirectionalLight();sun.position.set(-3,7,4);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:20});sun.shadow.bias=-.001;scene.add(hemi,sun,sun.target);
  createIslandLighting(scene,hemi,sun,renderer).update('day',0,true);
  const pitchGeo=new T.PlaneGeometry(40,40),pitchMat=new T.MeshStandardMaterial({color:'#5f9a4f',roughness:1}),pitch=new T.Mesh(pitchGeo,pitchMat);pitch.rotation.x=-Math.PI/2;pitch.receiveShadow=true;scene.add(pitch);
  const lines=new T.GridHelper(40,40,'#8fbf78','#79ab66');lines.position.y=.003;scene.add(lines);
  const ballMap=createMatchBallTexture(),ballGeo=new T.SphereGeometry(.19,20,14),ballMat=new T.MeshStandardMaterial({map:ballMap,roughness:.8}),ball=new T.Mesh(ballGeo,ballMat);ball.castShadow=true;scene.add(ball);
  const makeRig=(id:string,team:'home'|'away',num:number)=>{const r=createPlayer(id,team);r.setProfile(profileFor(team==='home'?'fwd':'def',7));const d=matchPlayerDress(id,team,false,num);r.setBeanLook(d.look,d.outfit);r.setShirtNumber(num);scene.add(r.root);return r;};
  let rig=makeRig('skill-lab-10','home',10);const defender=makeRig('skill-lab-4','away',4);
  const motion:PlayerMotion={},dm:PlayerMotion={},root={x:0,z:0},bp={x:0,y:.19,z:0},start={x:0,z:0,yaw:0};
  // ?skill=showcase: the Make it yours Skills showcase (lib/graphics/previewMoves.ts), full size.
  let show=createPreviewDriver(),showCelebrate=-1;const tA=new T.Vector3(),tB=new T.Vector3();
  const probe:PreviewProbe={ankle:(sd,o)=>{rig.root.getObjectByName(sd<0?'left-ankle':'right-ankle')!.getWorldPosition(tA);o.x=tA.x;o.y=tA.y;o.z=tA.z;return o;},hands:o=>{rig.handPositions(tA,tB);o.x=(tA.x+tB.x)/2;o.y=(tA.y+tB.y)/2;o.z=(tA.z+tB.z)/2;return o;}};
  let t=0,dur=1,ballShown=true;const showSeconds=moveSeconds('showcase')+.6;
  const isBase=(k:string):k is Base=>(BASES as string[]).includes(k);
  // Defender placement for context: in front for feints/turns, beside for the charge, behind for the shield.
  const placeDefender=(k:string)=>{
   const sd=config.current.side,g=isBase(k)?'':SKILL_MOVES[k as SkillMove].group;defender.root.visible=!isBase(k)&&k!=='scan'&&g!=='celebrate'&&g!=='keeper';
   if(k==='shoulderCharge')return {x:sd*.84+root.x,z:root.z+.08,f:0,ready:0};
   // Batch 2: the chip goes over a keeper off his line; a curler/trivela/toe poke past a blocking defender; the
   // tackles face the dribbler whose ball they win; the nutmeg's defender stands square, feet apart.
   if(k==='chipShot')return {x:.1,z:4.2,f:Math.PI,ready:1};
   if(g==='shoot')return {x:sd*1.15,z:2.6,f:Math.PI,ready:1};
   if(g==='defend')return {x:.15,z:k==='pokeTackle'?1.75:Math.max(1.4,bp.z+.8),f:Math.PI,ready:0};
   if(k==='nutmeg')return {x:0,z:1.55,f:Math.PI,ready:1};
   if(k==='shield')return {x:sd*.5,z:-.55,f:Math.PI*.1*-sd+0,ready:1};
   return {x:0,z:2.9,f:Math.PI,ready:1};
  };
  const baseStep=(k:Base,i:number,m:PlayerMotion)=>{
   for(const key of Object.keys(m))delete (m as Record<string,unknown>)[key];
   if(k==='showcase'){if(i===0)show.set('showcase');probe.headTop=rig.headTop;probe.juggleHead=rig.juggleHead;const f=show.step(i===0?0:DT,probe);Object.assign(m,f.motion);root.x=f.x;root.z=f.z;bp.x=f.ball.x;bp.y=f.ball.y;bp.z=f.ball.z;showCelebrate=f.celebrate;ballShown=f.ballVisible;return;}
   const tt=i*DT;m.facing=0;
   if(k==='run'){const v=Math.min(7,tt*6);root.z+=v*DT;m.runIntensity=v/7;}
   else if(k==='turn'){const h=tt<.9?0:Math.min(Math.PI/2,(tt-.9)*3.6);root.x+=Math.sin(h)*5*DT;root.z+=Math.cos(h)*5*DT;m.facing=h;m.runIntensity=.7;m.intentHeading=tt>.75?Math.PI/2:0;}
   else if(k==='stop'){const v=tt<1.1?Math.min(7,tt*7):Math.max(0,7-(tt-1.1)*15);root.z+=v*DT;m.runIntensity=v/7;m.brake=tt>1.1&&v>0?1:0;}
   else if(k==='pass'||k==='shot'){const kk=tt<.6?undefined:Math.min(1,(tt-.6)/(k==='pass'?.66:.75));const v=tt<.6?1.6:0;root.z+=v*DT;m.runIntensity=.2;m.kick=kk;m.actionKind=k;m.powerKick=k==='shot';m.shotPower=.8;m.kickSide=1;m.strikeX=.14;m.strikeZ=.62;}
   if(k==='pass'||k==='shot'){const kk=m.kick??0;if(kk<.5){bp.x=root.x+.14;bp.z=root.z+.62;bp.y=.19;}else{const u=(kk-.5)*(k==='shot'?9:5);bp.x=root.x+.14;bp.z=root.z+.62+u;bp.y=.19+(k==='shot'?u*.12:0);}}
   else if(k!=='idle'){rig.dribbleContact(ball.position);bp.x=ball.position.x;bp.y=.19;bp.z=ball.position.z;}
   else{bp.x=0;bp.z=.7;}
  };
  const step=(i:number)=>{
   const k=config.current.skill,sd=config.current.side;
   if(isBase(k)){baseStep(k,i,motion);}
   else{
    const pre=20;
    if(i<pre){motion.facing=0;motion.skill=undefined;root.x=0;root.z=0;const b={x:0,y:0,z:0};applySkill({},k,0,sd,start,{x:0,z:0},b);bp.x=b.x;bp.y=b.y;bp.z=b.z;}
    else{const p=(i-pre)*DT/dur;if(p<=1)applySkill(motion,k,p,sd,start,root,bp);else motion.skill=undefined;}
   }
   rig.update(root.x,root.z,DT,i*DT,false,motion);if(k==='showcase'&&showCelebrate>=0)applyCelebrationArms(rig.root,showCelebrate);
   const d=placeDefender(k);for(const key of Object.keys(dm))delete (dm as Record<string,unknown>)[key];dm.facing=d.f;dm.ready=d.ready;dm.lookX=bp.x;dm.lookZ=bp.z;
   // The fair charge knocks the opponent off balance (a stumble that recovers, no fall).
   if(k==='shoulderCharge'&&motion.skill){const pr=(motion.skill.progress-.36)/.5;if(pr>0&&pr<1){dm.reaction='stumble';dm.reactionProgress=pr;dm.kickSide=config.current.side;}}
   defender.update(d.x,d.z,DT,i*DT,false,dm);
   ball.position.set(bp.x,bp.y,bp.z);ball.visible=k==='showcase'?ballShown:isBase(k)?k!=='idle':SKILL_MOVES[k as SkillMove].ball;
  };
  const framesFor=()=>{const k=config.current.skill;dur=k==='showcase'?showSeconds:isBase(k)?BASE_SECONDS[k]:SKILL_MOVES[k].seconds;return (isBase(k)?0:20)+Math.round(dur/DT)+(isBase(k)?0:36);};
  const reset=()=>{show=createPreviewDriver();scene.remove(rig.root);rig.dispose();rig=makeRig('skill-lab-10','home',10);root.x=root.z=0;t=0;for(const key of Object.keys(motion))delete (motion as Record<string,unknown>)[key];};
  const seek=(i:number)=>{reset();for(let f=0;f<=i;f++)step(f);t=i;};
  const place=(v:string)=>{
   const P=rig.root.position,sd=config.current.side;const cx=P.x,cz=P.z;
   // Skill moves: a fixed camera on the middle of the move (travel reads); base motions follow the player.
   const k=config.current.skill,mid=isBase(k)?undefined:skillFrame(k,.5,sd),box=k==='showcase'?moveBounds('showcase'):undefined;
   const lx=box?(box.minX+box.maxX)/2:mid?mid.x*.6:(cx+ball.position.x)/2,lz=box?(box.minZ+box.maxZ)/2:mid?mid.z*.6+.35:(cz+ball.position.z)/2;
   if(v==='side')camera.position.set(lx-sd*4.5,1.05,lz+.1);else if(v==='front')camera.position.set(lx+.2,1.25,lz+4);else if(v==='top')camera.position.set(lx+.01,5.5,lz+.5);else if(v==='back')camera.position.set(lx+.3,1.4,lz-4);
   else camera.position.set(lx-sd*3.5,2.05,lz+3.6);
   camera.lookAt(lx,.9,lz);sun.position.set(cx-3,7,cz+4);sun.target.position.set(cx,0,cz);
  };
  const render=(v=config.current.view)=>{place(v);renderer.render(scene,camera);};
  const resize=()=>{renderer.setSize(node.clientWidth,node.clientHeight,false);camera.aspect=node.clientWidth/Math.max(1,node.clientHeight);camera.updateProjectionMatrix();render();};
  const tick=(now:number)=>{if(disposed)return;const dt=Math.min(.1,(now-prev)/1000);prev=now;acc+=dt;const n=framesFor();
   while(acc>=DT){acc-=DT;t++;if(t>n){loops++;if(loops>=3){frame=0;render();return;}seek(0);}else step(t);}
   render();clock=t;frame=requestAnimationFrame(tick);};
  const play=()=>{if(frame||document.hidden)return;loops=0;prev=performance.now();seek(0);frame=requestAnimationFrame(tick);};
  api.current={restart:()=>{cancelAnimationFrame(frame);frame=0;play();}};
  const vis=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}};document.addEventListener('visibilitychange',vis);
  (window as unknown as {__fiSkill?:unknown}).__fiSkill={types:SKILL_TYPES,bases:BASES,specs:SKILL_MOVES,
   /** Poses the move at progress p (0..1; >1 = after the end) with a fresh rig and renders one frame; returns a JPEG data URL. */
   shot:(k:SkillMove|Base,p:number,sd:1|-1,v:string)=>{cancelAnimationFrame(frame);frame=0;config.current={skill:k,side:sd,view:v};framesFor();const pre=isBase(k)?0:20;seek(pre+Math.round(p*dur/DT));render(v);return renderer.domElement.toDataURL('image/jpeg',.86);},
   get clock(){return clock;},rig:()=>rig,ball};
  const q=new URLSearchParams(location.search);resize();const ro=new ResizeObserver(resize);ro.observe(node);
  if(q.get('t'))((window as unknown as {__fiSkill:{shot:(k:string,p:number,s:number,v:string)=>void}}).__fiSkill).shot(config.current.skill,Number(q.get('t')),config.current.side,config.current.view);else play();
  return()=>{disposed=true;cancelAnimationFrame(frame);ro.disconnect();document.removeEventListener('visibilitychange',vis);rig.dispose();defender.dispose();ballGeo.dispose();ballMat.dispose();ballMap.dispose();pitchGeo.dispose();pitchMat.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 useEffect(()=>{api.current?.restart();},[skill,side,view]);
 const spec=(SKILL_TYPES as string[]).includes(skill)?SKILL_MOVES[skill as SkillMove]:undefined;
 return <main style={{fontFamily:'system-ui,sans-serif',padding:'12px 16px',maxWidth:980,margin:'0 auto'}}>
  <h1 style={{fontSize:20,margin:'4px 0'}}>Skill moves lab</h1>
  <div style={{display:'flex',flexWrap:'wrap',gap:8,margin:'8px 0'}}>
   <select aria-label="Move" value={skill} onChange={e=>setSkill(e.target.value as SkillMove)} style={{fontSize:16}}>
    <optgroup label="Skill moves">{SKILL_TYPES.map(k=><option key={k} value={k}>{SKILL_MOVES[k].label}</option>)}</optgroup>
    <optgroup label="Base motions">{BASES.map(k=><option key={k} value={k}>{k}</option>)}</optgroup>
   </select>
   <select aria-label="Foot" value={side} onChange={e=>setSide(Number(e.target.value) as 1|-1)} style={{fontSize:16}}><option value={1}>Right foot</option><option value={-1}>Left foot</option></select>
   <select aria-label="View" value={view} onChange={e=>setView(e.target.value)} style={{fontSize:16}}>{['q','side','front','back','top'].map(v=><option key={v} value={v}>{v}</option>)}</select>
   <button onClick={()=>api.current?.restart()} style={{fontSize:16,minHeight:44,padding:'0 16px',background:'#1f2a24',color:'#fff',border:'1px solid #fff4',borderRadius:6}}>Replay</button>
  </div>
  <div ref={host} data-skill-lab style={{width:'100%',aspectRatio:'16 / 10',maxHeight:'70vh',background:'#9fc7d8',borderRadius:8,overflow:'hidden'}}/>
  {spec&&<p style={{lineHeight:1.45}}><b>{spec.label}.</b> {spec.teach} {spec.history&&<i>{spec.history}</i>}</p>}
 </main>;
}

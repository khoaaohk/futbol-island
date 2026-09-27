'use client';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {createPlayer} from '@/lib/graphics/player';
import {beanSkinOf} from '@/lib/graphics/beanSkin';
import {createIslandLighting} from '@/lib/graphics/islandLighting';
import {createMatchBallTexture} from '@/lib/graphics/matchBallTexture';
import {applyCelebrationArms} from '@/lib/graphics/celebrations';
import {PREVIEW_MOVES,createPreviewDriver,moveBounds,stepBounds,type PreviewFrame,type PreviewProbe} from '@/lib/graphics/previewMoves';
import {CUSTOMIZATION_OPTIONS,MAIN_PLAYER_NUMBER,beanLookFor,playerOutfit,type CharacterCustomization} from '@/lib/town/customization';
import styles from './CharacterCustomizer.module.css';

/** After an appearance change the rig keeps drawing briefly (so the idle settles), then the preview sleeps. */
const SETTLE_MS=900;
/** After a move's loops finish and it has settled into idle, the preview draws this long more, then sleeps. */
const IDLE_TAIL_MS=700;
const FPS=24;
/**
 * Uses the exact island rig (bean style by default). One small renderer exists only while the host is open.
 * The rig performs the selected move in place (lib/graphics/previewMoves.ts): a few loops, then idle.
 * Heat: frames are drawn at ≤24 fps only while a move plays (or briefly after a change/resize/drag), never while the
 * page or the preview is hidden; once the move settles into idle the preview sleeps (no rAF). Reduced motion shows
 * one still key pose per move and never loops.
 */
export default function CharacterPreview({open,value,move=0}:{open:boolean;value:CharacterCustomization;move?:number}){
 const host=useRef<HTMLDivElement>(null),appearance=useRef(value),refresh=useRef<(()=>void)|null>(null),selectMove=useRef<((index:number)=>void)|null>(null),moveRef=useRef(move);
 const [failed,setFailed]=useState(false);
 appearance.current=value;moveRef.current=move;
 // Wake only on a real appearance change: a parent re-render with an equal value object must not wake the loop.
 const valueKey=JSON.stringify(value);
 useEffect(()=>{refresh.current?.();},[valueKey]);
 useEffect(()=>{selectMove.current?.(move);},[move]);
 useEffect(()=>{
  const element=host.current;if(!open||!element)return;
  setFailed(false);
  let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');canvas.dataset.characterPreview='true';canvas.style.touchAction='pan-y';canvas.style.opacity='0';canvas.style.transition=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'none':'opacity .24s ease-out';element.appendChild(canvas);
  let revealed=false;
  const scene=new T.Scene();scene.background=new T.Color('#e8b98b');
  const camera=new T.PerspectiveCamera(32,1,.1,20);camera.position.set(2.2,1.85,4.7);camera.lookAt(0,.9,0);
  const hemi=new T.HemisphereLight(),sun=new T.DirectionalLight();sun.position.set(-3,6,4);sun.castShadow=true;sun.shadow.mapSize.set(512,512);Object.assign(sun.shadow.camera,{left:-2.2,right:2.2,top:2.2,bottom:-2.2,near:.1,far:15});sun.shadow.bias=-.001;scene.add(hemi,sun);
  createIslandLighting(scene,hemi,sun,renderer).update('sunset',0,true);
  const turntable=new T.Group(),rig=createPlayer('you','home');rig.setShirtNumber(MAIN_PLAYER_NUMBER);rig.setExpression('neutral');turntable.add(rig.root);scene.add(turntable);
  // No coloured ground (user, Sep 26 2026): the bean stands on the plain background. An invisible shadow catcher keeps
  // the sun's soft shadows (feet and ball), and a small radial blob under the player gives a contact shadow.
  const groundGeometry=new T.CircleGeometry(2.1,48),groundMaterial=new T.ShadowMaterial({color:'#1d3b33',opacity:.22});
  const ground=new T.Mesh(groundGeometry,groundMaterial);ground.rotation.x=-Math.PI/2;ground.position.y=-.01;ground.receiveShadow=true;turntable.add(ground);
  const blobCanvas=document.createElement('canvas');blobCanvas.width=blobCanvas.height=64;{const g=blobCanvas.getContext('2d');if(g){const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(29,59,51,.34)');r.addColorStop(.55,'rgba(29,59,51,.16)');r.addColorStop(1,'rgba(29,59,51,0)');g.fillStyle=r;g.fillRect(0,0,64,64);}}
  const blobMap=new T.CanvasTexture(blobCanvas),blobGeometry=new T.PlaneGeometry(1,1),blobMaterial=new T.MeshBasicMaterial({map:blobMap,transparent:true,depthWrite:false});
  const blob=new T.Mesh(blobGeometry,blobMaterial);blob.rotation.x=-Math.PI/2;blob.position.y=-.005;blob.scale.set(.95,.7,1);blob.renderOrder=-1;turntable.add(blob);
  const ballMap=createMatchBallTexture(),ballGeometry=new T.SphereGeometry(.19,20,14),ballMaterial=new T.MeshStandardMaterial({map:ballMap,roughness:.8});
  const ball=new T.Mesh(ballGeometry,ballMaterial);ball.castShadow=true;ball.visible=false;ball.name='preview-ball';turntable.add(ball);
  const driver=createPreviewDriver();
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const phone=window.matchMedia('(max-width: 700px)');
  // Live limbs in the turntable's space, for the touches that follow a boot or the gloves.
  const tmpA=new T.Vector3(),tmpB=new T.Vector3();
  const probe:PreviewProbe={
   ankle:(side,out)=>{rig.root.getObjectByName(side<0?'left-ankle':'right-ankle')!.getWorldPosition(tmpA);turntable.worldToLocal(tmpA);out.x=tmpA.x;out.y=tmpA.y;out.z=tmpA.z;return out;},
   hands:out=>{rig.handPositions(tmpA,tmpB);tmpA.add(tmpB).multiplyScalar(.5);turntable.worldToLocal(tmpA);out.x=tmpA.x;out.y=tmpA.y;out.z=tmpA.z;return out;},
  };
  const syncProbe=()=>{probe.headTop=rig.headTop;probe.juggleHead=rig.juggleHead;};
  // Framing: the standing rig (tall ears, horns, oversized heads) united with the move's own box (bicycle height,
  // dive width, travel). Refit after appearance, viewport or move changes, never while turning.
  let needsFit=true,needsAppearance=true,needsMeasure=true,cameraSnap=true,framedStep=-9;
  const bounds=new T.Box3(),center=new T.Vector3(),offset=new T.Vector3(2.2,.95,4.7).normalize(),corner=new T.Vector3(),size=new T.Vector3(),rigBox=new T.Box3();
  const right=new T.Vector3().crossVectors(camera.up,offset).normalize(),up=new T.Vector3().crossVectors(offset,right).normalize();
  const goal={position:new T.Vector3(),target:new T.Vector3(),far:20},look=new T.Vector3(0,.9,0);
  const measureRig=()=>{
   const yaw=turntable.rotation.y;turntable.rotation.y=0;turntable.updateMatrixWorld(true);rigBox.makeEmpty();
   // Bean meshes carry loose culling boxes (their shape is set in the vertex shader), so frame the bean by the
   // classic joints' meshes it follows, hidden or not. Costumes render classic and use their visible meshes.
   const bean=beanSkinOf(rig)&&(appearance.current.costume??'none')==='none';
   if(bean)rig.root.traverse(object=>{if(object instanceof T.Mesh&&!object.name.startsWith('bean-')&&object.name!=='character-selection-glow')rigBox.expandByObject(object);});
   else rig.root.traverseVisible(object=>{if(object instanceof T.Mesh)rigBox.expandByObject(object);});
   turntable.rotation.y=yaw;turntable.updateMatrixWorld(true);
   // Relative to the rig's own position, so a mid-move refit does not shift the frame.
   if(!rigBox.isEmpty()){rigBox.min.x-=rig.root.position.x;rigBox.max.x-=rig.root.position.x;rigBox.min.z-=rig.root.position.z;rigBox.max.z-=rig.root.position.z;}
  };
  const fit=()=>{
   if(needsMeasure){measureRig();needsMeasure=false;}
   // The long chained showcase follows its current step (and the next); single moves keep one stable frame.
   const id=PREVIEW_MOVES[moveRef.current]?.id??'showcase',box=id==='showcase'&&!reduced.matches?stepBounds(id,framedStep=driver.stepIndex):moveBounds(id);
   bounds.min.set(box.minX,box.minY,box.minZ);bounds.max.set(box.maxX,box.maxY,box.maxZ);
   // Tall ears, horns and oversized costume heads keep their headroom (and width) through every move.
   if(!rigBox.isEmpty()){bounds.max.y+=Math.max(0,rigBox.max.y-1.95);const wide=Math.max(0,Math.max(-rigBox.min.x,rigBox.max.x)-.42);bounds.min.x-=wide;bounds.max.x+=wide;}
   // Phones (user, Sep 26 2026: "enlarge the player"): frame tighter. Moves whose box stops at the generic 1.95 body top
   // use the rig's measured height plus a little headroom; tall moves (keep-ups, rainbow, bicycle, header, keeper,
   // celebrations) keep their own taller box, so only they zoom out. Desktop/tablet framing is unchanged.
   const tight=phone.matches;
   if(tight&&!rigBox.isEmpty()&&box.maxY<=1.951)bounds.max.y=Math.min(bounds.max.y,Math.max(1.5,rigBox.max.y+.14));
   const pad=tight?1.03:1.1;
   bounds.getCenter(center);const tan=Math.tan(T.MathUtils.degToRad(camera.fov/2));let distance=0;
   for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
    corner.set(x,y,z).sub(center);const depth=corner.dot(offset);
    distance=Math.max(distance,depth+Math.abs(corner.dot(up))*pad/tan,depth+Math.abs(corner.dot(right))*pad/(tan*camera.aspect));
   }
   goal.position.copy(center).addScaledVector(offset,Math.max(2,distance));goal.target.copy(center);goal.far=Math.max(20,distance+bounds.getSize(size).length()+5);
   if(cameraSnap){camera.position.copy(goal.position);look.copy(goal.target);cameraSnap=false;}
   camera.far=goal.far;camera.updateProjectionMatrix();camera.lookAt(look);
  };
  /** Eases the camera toward the current framing (a move change reframes smoothly while it plays). */
  const easeCamera=(dt:number)=>{const k=dt>0?1-Math.exp(-dt*5):1;camera.position.lerp(goal.position,k);look.lerp(goal.target,k);camera.lookAt(look);};
  let frame=0,last=0,elapsed=0,wakeUntil=0,idleSince=-1,visible=true,disposed=false,expression='neutral',still=false;
  const awake=()=>!disposed&&!document.hidden&&visible;
  const apply=(f:PreviewFrame,dt:number,calm:boolean)=>{
   rig.update(f.x,f.z,dt,elapsed,calm,f.motion);blob.position.x=f.x;blob.position.z=f.z;
   if(f.celebrate>=0)applyCelebrationArms(rig.root,f.celebrate);
   ball.visible=f.ballVisible;if(f.ballVisible){const px=ball.position.x,pz=ball.position.z;ball.position.set(f.ball.x,f.ball.y,f.ball.z);ball.rotation.x+=(f.ball.z-pz)/.19;ball.rotation.z-=(f.ball.x-px)/.19;}
   if(f.expression!==expression){expression=f.expression;rig.setExpression(f.expression);}
  };
  /** Reduced motion: the move's still key pose, settled with a few calm updates, drawn once. */
  const poseStill=()=>{syncProbe();const f=driver.still(PREVIEW_MOVES[moveRef.current]?.id??'showcase',probe);for(let i=0;i<12;i++){elapsed+=1/60;apply(f,1/60,true);}still=true;};
  const draw=(dt=0)=>{
   if(!awake())return;
   if(needsAppearance){const value=appearance.current,male=value.character!=='female';scene.background=new T.Color(male?'#a9cfe5':'#e8b6aa');rig.setAppearance(value);rig.setBeanLook(beanLookFor(value),playerOutfit(value));needsAppearance=false;syncProbe();}
   if(reduced.matches){if(!still)poseStill();}
   else{still=false;elapsed+=dt;syncProbe();apply(driver.step(dt,probe),dt,false);if(driver.id==='showcase'&&driver.stepIndex!==framedStep)needsFit=true;}
   if(needsFit){fit();needsFit=false;}
   if(!reduced.matches)easeCamera(dt);else{camera.position.copy(goal.position);look.copy(goal.target);camera.lookAt(look);}
   renderer.render(scene,camera);
   // Fade the canvas in only once it holds a real frame (no blank or black flash while Make it yours opens).
   if(!revealed){revealed=true;requestAnimationFrame(()=>{canvas.style.opacity='1';});}
  };
  // ≤24 fps while the move plays or a settle window is open; stops on its own once the move rests in idle.
  // Paced at ≤24 fps: a timeout waits for the next frame slot, then one rAF draws (≈24 callbacks/s, not 60).
  // Once the move rests in idle (and any settle window closed) nothing is scheduled at all: no timer, no rAF.
  let timer:ReturnType<typeof setTimeout>|0=0;
  const stop=()=>{cancelAnimationFrame(frame);frame=0;if(timer)clearTimeout(timer);timer=0;};
  const schedule=()=>{if(frame||timer||disposed)return;timer=setTimeout(()=>{timer=0;if(awake())frame=requestAnimationFrame(tick);},Math.max(0,1000/FPS-(performance.now()-last)));};
  const tick=(time:number)=>{
   frame=0;if(!awake())return;
   const dt=Math.min((time-last)/1000,.1);last=time;draw(dt);
   const resting=reduced.matches||driver.finished;
   if(resting&&idleSince<0)idleSince=time;if(!resting)idleSince=-1;
   const settled=resting&&time-idleSince>IDLE_TAIL_MS;
   if(settled&&!reduced.matches){camera.position.copy(goal.position);look.copy(goal.target);camera.lookAt(look);renderer.render(scene,camera);}
   if(!reduced.matches&&(!settled||time<wakeUntil))schedule();
  };
  const run=(ms=0)=>{wakeUntil=Math.max(wakeUntil,performance.now()+ms);if(!awake())return;if(reduced.matches){draw();return;}idleSince=-1;if(!frame&&!timer){last=performance.now();frame=requestAnimationFrame(tick);}};
  const resume=()=>{if(!awake()){stop();return;}draw();run(SETTLE_MS);};
  const resize=()=>{const width=element.clientWidth,height=element.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();needsFit=true;cameraSnap=true;draw();};
  // Appearance hot-swap (user, Sep 26 2026): Male/Female, colours, hair or face change the look on the running rig; the
  // move keeps its playback time and the camera keeps its frame. Only costume/build/headwear (which change the rig's
  // size) remeasure and reframe. Asleep: the short settle window redraws the new look, then sleeps again.
  const sizeKey=(v:CharacterCustomization)=>`${v.costume??'none'}|${v.build}|${v.headwear}`;let fittedKey=sizeKey(appearance.current);
  refresh.current=()=>{const key=sizeKey(appearance.current);if(key!==fittedKey){fittedKey=key;needsFit=true;needsMeasure=true;}needsAppearance=true;still=false;run(SETTLE_MS);if(!frame)draw();};
  // Arrows: switch at once (the driver walks back to the middle and blends into the new move) and reframe.
  selectMove.current=index=>{const id=PREVIEW_MOVES[index]?.id;if(!id)return;if(!reduced.matches)driver.set(id);still=false;idleSince=-1;needsFit=true;if(reduced.matches){cameraSnap=true;draw();}else run();};
  // Drag to turn: one coalesced frame per pointer move, nothing when idle.
  let dragX:number|null=null,pointer=-1,turnFrame=0;
  const turn=()=>{turnFrame=0;if(frame||timer)return;renderer.render(scene,camera);};
  const down=(e:PointerEvent)=>{if(e.button>0)return;dragX=e.clientX;pointer=e.pointerId;};
  const move=(e:PointerEvent)=>{if(dragX===null||e.pointerId!==pointer)return;const dx=e.clientX-dragX;if(Math.abs(dx)<1)return;if(!canvas.hasPointerCapture(pointer)&&Math.abs(dx)>4)canvas.setPointerCapture(pointer);turntable.rotation.y+=dx*.012;dragX=e.clientX;if(!turnFrame&&awake())turnFrame=requestAnimationFrame(turn);};
  const release=(e:PointerEvent)=>{if(e.pointerId===pointer){dragX=null;pointer=-1;}};
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
  const observer=new ResizeObserver(resize);observer.observe(element);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;resume();});intersection.observe(element);
  const motionChange=()=>{still=false;if(!reduced.matches)driver.set(PREVIEW_MOVES[moveRef.current]?.id??'showcase');resume();};
  document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',motionChange);
  driver.set(PREVIEW_MOVES[moveRef.current]?.id??'showcase');
  resize();resume();
  // Dev/test hook (strips): seek the current move to t seconds and draw one frame.
  (window as unknown as {__fiPreview?:unknown}).__fiPreview={seek:(t:number)=>{stop();driver.set(PREVIEW_MOVES[moveRef.current].id);for(let s=0;s<t;s+=1/30){elapsed+=1/30;syncProbe();apply(driver.step(1/30,probe),1/30,false);}needsFit=true;cameraSnap=true;fit();renderer.render(scene,camera);},get sleeping(){return frame===0&&timer===0;},get step(){return driver.finished?'idle':'playing';}};
  return()=>{disposed=true;refresh.current=null;selectMove.current=null;stop();cancelAnimationFrame(turnFrame);observer.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',resume);reduced.removeEventListener('change',motionChange);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',release);canvas.removeEventListener('pointercancel',release);canvas.removeEventListener('lostpointercapture',release);delete (window as unknown as {__fiPreview?:unknown}).__fiPreview;rig.dispose();groundGeometry.dispose();groundMaterial.dispose();blobGeometry.dispose();blobMaterial.dispose();blobMap.dispose();ballGeometry.dispose();ballMaterial.dispose();ballMap.dispose();sun.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();};
 },[open]);
 const option=(key:keyof CharacterCustomization)=>CUSTOMIZATION_OPTIONS[key].find(item=>item.id===value[key])?.label.toLowerCase();
 const name=value.character==='female'?'female':'male',kit=option('clothing');
 const description=`${name} character with a ${option('bodyColor')} body, ${option('skinTone')} face, ${option('hair')} hair${value.headwear!=='none'?`, ${option('headwear')}`:''} and the ${kit}, number ${MAIN_PLAYER_NUMBER}`;
 const moveLabel=PREVIEW_MOVES[move]?.label.toLowerCase();
 return <div ref={host} className={styles.preview} role="img" aria-label={`3D preview: ${description}${moveLabel?`, showing: ${moveLabel}`:''}.`}>{failed&&<p className={styles.previewFallback}>Your {description}. The 3D preview is unavailable on this device; your choices still update on the island.</p>}</div>;
}

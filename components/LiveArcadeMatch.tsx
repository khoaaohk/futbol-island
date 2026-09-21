'use client';
import {createMatchScenery} from '@/lib/arcade/matchScenery';
import {BackButton} from './BackButton';
import {DoneButton} from './DoneButton';
import {recordExploreActivity} from '@/lib/town/exploreActivity';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import * as T from 'three';
import {buildFormatFields} from '@/lib/town/fields';
import {createFieldRuntime} from '@/lib/town/fieldRuntime';
import {venueById,fieldPoint} from '@/lib/town/venues';
import {usePhoneController} from '@/lib/usePhoneController';
import {remoteInput,resetRemoteInput} from '@/lib/remoteInput';
import {matchAxes,neutralLiveInput,MATCH_DURATION_SECONDS} from '@/lib/arcade/liveMatchInput';
import styles from './LiveArcadeMatch.module.css';

export default function LiveArcadeMatch({onExit}:{onExit:()=>void}){
 const host=useRef<HTMLDivElement>(null),local=useRef(neutralLiveInput()),keys=useRef(new Set<string>()),phaseRef=useRef<'ready'|'playing'|'paused'|'finished'>('ready');
 const [phase,setPhase]=useState<typeof phaseRef.current>('ready'),[view,setView]=useState({gold:0,blue:0,seconds:0,message:'Control the gold team'}),[failed,setFailed]=useState(false),[qr,setQr]=useState(''),[qrError,setQrError]=useState(false),[pairing,setPairing]=useState(false);
 const [stick,setStick]=useState({x:0,y:0}),joy=useRef<HTMLDivElement>(null),joyId=useRef<number|null>(null),restart=useRef(()=>{});
 const wake=useRef(()=>{});
 const phone=usePhoneController(true),send=useRef(phone.send);send.current=phone.send;
 const release=()=>{keys.current.clear();local.current=neutralLiveInput();resetRemoteInput();setStick({x:0,y:0});joyId.current=null;};
 const changePhase=(next:typeof phase)=>{release();phaseRef.current=next;setPhase(next);if(next==='playing'){recordExploreActivity('arcade');host.current?.focus({preventScroll:true});}wake.current();};
 useEffect(()=>{let cancelled=false;setQr('');setQrError(false);if(phone.available&&phone.url)import('qrcode').then(({default:qrcode})=>qrcode.toDataURL(phone.url,{width:240,margin:2,errorCorrectionLevel:'M'})).then(value=>{if(!cancelled)setQr(value);}).catch(()=>{if(!cancelled)setQrError(true);});return()=>{cancelled=true;};},[phone.available,phone.url]);
 useEffect(()=>{
  const node=host.current;if(!node)return;let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,window.matchMedia('(pointer:coarse)').matches?1.25:1.75));renderer.setClearColor('#527253');renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;node.appendChild(renderer.domElement);
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(42,1,.5,600),venue=venueById('11v11'),fields=buildFormatFields(scene),games=createFieldRuntime(scene),entry=games.entries.find(e=>e.venue.id==='11v11')!,sim=entry.sim;
  for(const [format,root]of fields.roots)root.visible=format==='11v11';for(const e of games.entries)if(e!==entry)games.setPaused(e.venue.id,true);
  sim.resetMatch();sim.enableUser('gold');const scenery=createMatchScenery(scene,venue);scenery.update(0);
  const ringGeometry=new T.RingGeometry(.95,1.3,32),ringMaterial=new T.MeshBasicMaterial({color:'#ffe463',side:T.DoubleSide,depthTest:false}),ring=new T.Mesh(ringGeometry,ringMaterial);ring.rotation.x=-Math.PI/2;ring.renderOrder=8;scene.add(ring);
  let elapsed=0,frame=0,last=performance.now(),lastDraw=last,lastHud=0,disposed=false;
  const fit=()=>{const w=node.clientWidth,h=node.clientHeight;renderer.setSize(w,h);camera.aspect=w/Math.max(1,h);const target=new T.Vector3(venue.x,0,venue.z),offset=new T.Vector3(0,125,95);for(let n=0;n<20;n++){camera.position.copy(target).add(offset);camera.lookAt(target);camera.updateProjectionMatrix();camera.updateMatrixWorld();let extent=0;for(const x of[-1,1])for(const z of[-1,1]){const p=new T.Vector3(venue.x+x*(venue.width/2+4),0,venue.z+z*(venue.length/2+5)).project(camera);extent=Math.max(extent,Math.abs(p.x),Math.abs(p.y));}if(extent<.91)break;offset.multiplyScalar(1.08);}};
  const resize=new ResizeObserver(()=>{fit();wake.current();});resize.observe(node);fit();
  restart.current=()=>{sim.resetMatch();sim.enableUser('gold');elapsed=0;setView({gold:0,blue:0,seconds:0,message:'Kick-off'});};
  const blur=()=>{release();if(phaseRef.current==='playing'){phaseRef.current='paused';setPhase('paused');}};
  const hidden=()=>{if(document.hidden)blur();else wake.current();last=performance.now();};
  const down=(event:KeyboardEvent)=>{if(event.target instanceof HTMLElement&&event.target.closest('input,textarea,select,a,button'))return;if(event.code==='Escape'){event.preventDefault();blur();return;}if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','Space','KeyJ','KeyK','KeyL','KeyQ','ShiftLeft','ShiftRight','KeyE'].includes(event.code))return;event.preventDefault();if(phaseRef.current!=='playing')return;keys.current.add(event.code);if(!event.repeat){if(event.code==='Space'||event.code==='KeyJ')local.current.pass=true;if(event.code==='KeyK')local.current.shoot=true;if(event.code==='KeyL')local.current.through=true;if(event.code==='KeyQ')local.current.switchPlayer=true;}};
  const up=(event:KeyboardEvent)=>{keys.current.delete(event.code);};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',hidden);
  const animate=(now:number)=>{frame=0;if(disposed)return;if(document.hidden){last=now;return;}if(now-lastDraw<1000/30){frame=requestAnimationFrame(animate);return;}lastDraw=now;const dt=Math.min(.05,(now-last)/1000);last=now;const active=phaseRef.current==='playing',k=keys.current,l=local.current;
   if(active){const keyboardX=Number(k.has('ArrowRight')||k.has('KeyD'))-Number(k.has('ArrowLeft')||k.has('KeyA')),keyboardY=Number(k.has('ArrowUp')||k.has('KeyW'))-Number(k.has('ArrowDown')||k.has('KeyS')),remote=remoteInput.connected,axes=matchAxes(remote&&remoteInput.active?remoteInput.mx:(keyboardX||l.mx),remote&&remoteInput.active?remoteInput.my:(keyboardY||l.my));
    sim.setUserInput(axes.x,axes.y,l.shoot||(remote&&remoteInput.shootEdge),l.pass||(remote&&remoteInput.passEdge),{through:l.through||(remote&&remoteInput.throughEdge),switchReq:l.switchPlayer||(remote&&remoteInput.switchEdge),sprint:l.sprint||k.has('ShiftLeft')||k.has('ShiftRight')||(remote&&remoteInput.sprint),jockey:l.jockey||k.has('KeyE')||(remote&&remoteInput.jockey),shootPower:remote&&remoteInput.shootEdge?remoteInput.shootPower:l.power});
    l.shoot=l.pass=l.through=l.switchPlayer=false;remoteInput.shootEdge=remoteInput.passEdge=remoteInput.throughEdge=remoteInput.switchEdge=false;elapsed=Math.min(MATCH_DURATION_SECONDS,elapsed+dt);
   }else sim.setUserInput(0,0,false,false);
   games.update(active?dt:0,elapsed,camera,null,active,'11v11',node.clientHeight);
   const selected=sim.userId?sim.players[sim.userId]:null;ring.visible=!!selected;if(selected){const p=fieldPoint(venue,selected);ring.position.set(p.x,.14,p.z);}
   scenery.update(elapsed);renderer.render(scene,camera);
   if(elapsed>=MATCH_DURATION_SECONDS&&phaseRef.current==='playing'){phaseRef.current='finished';setPhase('finished');release();}
   if(now-lastHud>250){setView({gold:sim.score.gold,blue:sim.score.blue,seconds:elapsed,message:sim.msgT>0?sim.msg:'Gold team · attack toward the far goal'});send.current({gold:sim.score.gold,blue:sim.score.blue});lastHud=now;}
   if(phaseRef.current==='playing')frame=requestAnimationFrame(animate);
  };wake.current=()=>{if(!disposed&&!document.hidden&&!frame){last=performance.now();frame=requestAnimationFrame(animate);}};wake.current();
  (window as unknown as {__fi2Live?:unknown}).__fi2Live={sim,scene,camera,renderer,local,phaseRef,getElapsed:()=>elapsed};
  return()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',hidden);release();wake.current=()=>{};scenery.dispose();games.dispose();fields.dispose();ringGeometry.dispose();ringMaterial.dispose();renderer.dispose();renderer.domElement.remove();delete (window as unknown as {__fi2Live?:unknown}).__fi2Live;};
 },[]);
 const moveStick=(event:PointerEvent<HTMLDivElement>)=>{if(event.pointerId!==joyId.current||!joy.current)return;const r=joy.current.getBoundingClientRect(),x=(event.clientX-r.x-r.width/2)/40,y=(event.clientY-r.y-r.height/2)/40,d=Math.max(1,Math.hypot(x,y));local.current.mx=x/d;local.current.my=-y/d;setStick({x:x/d*32,y:y/d*32});};
 const releaseStick=()=>{joyId.current=null;local.current.mx=local.current.my=0;setStick({x:0,y:0});};
 const remaining=Math.max(0,MATCH_DURATION_SECONDS-Math.floor(view.seconds)),clock=`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;
 return <section className={styles.root} aria-label="Live 11v11 match">
  <header className={styles.header}><BackButton onBack={()=>{release();onExit();}}/><div className={styles.score}><span>GOLD <b>{view.gold}</b></span><time>{clock}</time><span><b>{view.blue}</b> BLUE</span></div><button onClick={()=>{if(phase==='playing')changePhase('paused');else if(phase==='paused')changePhase('playing');else setPairing(!pairing);}}>{phase==='playing'?'Pause':phase==='paused'?'Resume':'Pair phone'}</button></header>
  <div className={styles.body}><div className={styles.stage} ref={host} tabIndex={-1} onPointerDown={()=>host.current?.focus({preventScroll:true})}/>
   {phase!=='playing'&&<div className={styles.overlay}><div className={styles.card}><small>ISLAND ARCADE · 11v11</small><h2>{failed?'The pitch could not load':phase==='ready'?'Your full match.':phase==='paused'?'Match paused.':'Full time.'}</h2><p>{failed?'Return to the Arcade and try again.':phase==='ready'?'Three minutes. Control the gold player with the yellow ring. Pass, tackle, shoot and switch players.':phase==='paused'?'Your score and match time are held.':`Gold ${view.gold} – ${view.blue} Blue`}</p>{!failed&&<button className={styles.primary} onClick={()=>{if(phase==='finished')restart.current();changePhase('playing');}}>{phase==='ready'?'Kick off':phase==='paused'?'Resume match':'Play again'}</button>}<button onClick={()=>setPairing(!pairing)}>{pairing?'Hide phone pairing':'Use your phone as controller'}</button><p className={styles.instructions}>WASD / arrows move · Space or J pass / tackle · K shoot · L through ball · Q switch · Shift sprint · E jockey</p></div></div>}
   {pairing&&<aside className={styles.pairing} aria-label="Phone controller pairing"><DoneButton onDone={()=>setPairing(false)}/><h3>Phone controller</h3><p role="status">{phone.connected?'Phone connected':phone.available?(phone.relayStatus==='error'?'Pairing relay is reconnecting. Keyboard and touch still work.':phone.relayStatus==='connecting'?'Connecting to the pairing relay…':'Scan this QR on your phone.'):'Phone pairing is not configured on this island yet. Keyboard and touch controls work now.'}</p>{phone.available&&<>{qr?<img src={qr} width="160" height="160" alt="QR code to join this match with a phone controller"/>:<p>{qrError?'QR could not load. Open the link below.':'Preparing QR…'}</p>}<a href={phone.url} target="_blank" rel="noopener noreferrer">Open controller · {phone.code}</a><small>On a local preview, use the same Wi-Fi network.</small></>}</aside>}
  </div>
  <footer className={styles.footer}><p>{view.message}</p><div className={styles.touchControls} aria-label="Touch match controls"><div ref={joy} className={styles.joystick} role="group" aria-label="Move player" onPointerDown={event=>{if(phase!=='playing')return;joyId.current=event.pointerId;event.currentTarget.setPointerCapture(event.pointerId);moveStick(event);}} onPointerMove={moveStick} onPointerUp={releaseStick} onPointerCancel={releaseStick} onLostPointerCapture={releaseStick}><span style={{transform:`translate(${stick.x}px,${stick.y}px)`}}/></div><div className={styles.actions}>{(['pass','shoot','through','switchPlayer'] as const).map(action=><button key={action} disabled={phase!=='playing'} onPointerDown={event=>{event.preventDefault();local.current[action]=true;}}>{({pass:'Pass / tackle',shoot:'Shoot',through:'Through',switchPlayer:'Switch'})[action]}</button>)}<button disabled={phase!=='playing'} onPointerDown={event=>{event.currentTarget.setPointerCapture(event.pointerId);local.current.sprint=true;}} onPointerUp={()=>local.current.sprint=false} onPointerCancel={()=>local.current.sprint=false} onLostPointerCapture={()=>local.current.sprint=false}>Sprint</button></div></div></footer>
 </section>;
}

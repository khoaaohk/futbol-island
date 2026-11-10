'use client';
import {ARCADE_EXIT_EVENT} from './RotateLock';
import dynamic from 'next/dynamic';
import ArcadeGameLoading from './ArcadeGameLoading';
import {NavigationButton} from './DoneButton';
import ArcadeLoading from './ArcadeLoading';
import ArcadeCoinsPanel from './ArcadeCoinsPanel';
import TravelIcon from './TravelIcon';
import {Icon} from './Icon';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {installGameGuard} from '@/lib/arcade/gameGuard';
import {enterActivity} from '@/lib/analytics/tracker';
import {countArcadeGame} from '@/lib/analytics/sponsorEvents';
import type {ActivityId} from '@/lib/analytics/islandIds';
import {arcadeCabinets,type ArcadeCabinetId} from '@/lib/arcade/arcadeCatalog';
import {gashaponPanel,useGashaponPanel,useToyOverlay} from '@/lib/gashapon/gashaponBrowser';import GashaponToyLayer from './GashaponToyLayer';
import {gashaponMachine} from '@/lib/gashapon/machines';
const GashaponPanel=dynamic(()=>import('./GashaponPanel'),{ssr:false});// gashapon capsule machines (Nov 8 2026)
import type {createArcadeRoomScene,ArcadeRoomAction} from '@/lib/arcade/arcadeRoomScene';
import styles from './ArcadeRoom.module.css';
import {setArcadeBusy} from '@/lib/arcade/arcadeRoomHooks';
// Party in rooms (docs/multiplayer-rooms-design.md Phase 3): friends in the Arcade walk about the hub; a friend in a game shows at its
// cabinet in a force field. The layer lives for the PAGE (a game replaces the hub); Leave-only chip under the header.
import {useArcadeRoomParty} from './party/useArcadeRoomParty';
const RoomPartyChip=dynamic(()=>import('./party/RoomPartyChip'),{ssr:false});// only rendered with a live party (flag on)
import {paintJoystick} from '@/lib/town/joystickFeedback';
import {stickInput,stickTravel} from '@/lib/town/floatingStick';
import {useJoystickBounds} from '@/lib/town/useJoystickBounds';
const Tennis=dynamic(()=>import('./games/ArcadeGame3D'),{ssr:false,loading:()=> <ArcadeGameLoading game="tennis"/>});
const Pinball=dynamic(()=>import('./games/ArcadeGame3D'),{ssr:false,loading:()=> <ArcadeGameLoading game="pinball"/>});
const Runner=dynamic(()=>import('./games/ArcadeGame3D'),{ssr:false,loading:()=> <ArcadeGameLoading game="runner"/>});
const PassPuzzle=dynamic(()=>import('./games/PassPuzzleGame'),{ssr:false,loading:()=> <ArcadeGameLoading game="puzzle"/>});
const Strikers=dynamic(()=>import('./LiveArcadeMatch'),{ssr:false,loading:()=> <ArcadeGameLoading game="live"/>});
const gameComponents={tennis:Tennis,pinball:Pinball,runner:Runner};
// The Hall of High Scores (docs/arcade-leaderboards.md): lazy, loaded when Scores is tapped; the room sleeps under it.
const ArcadeBoards=dynamic(()=>import('./arcade/ArcadeBoards'),{ssr:false});
// Today in the arcade (Nov 10 2026): one daily challenge per cabinet; lazy, loaded when Today is tapped.
const ArcadeTodayPanel=dynamic(()=>import('./arcade/ArcadeTodayPanel'),{ssr:false});
export default function ArcadeRoom(){
 const party=useArcadeRoomParty();// before the scene effect: on unmount the layer goes first, then the hub
 const [socialNear,setSocialNear]=useState<number|null>(null);
 const [revealed,setRevealed]=useState(false),[entryDone,setEntryDone]=useState(false),[minimumLoadingDone,setMinimumLoadingDone]=useState(false);
 useEffect(()=>{const timer=setTimeout(()=>setMinimumLoadingDone(true),3000);return()=>clearTimeout(timer);},[]);
 useEffect(()=>{if(!revealed)return;const timer=setTimeout(()=>setEntryDone(true),matchMedia('(prefers-reduced-motion:reduce)').matches?0:2500);return()=>clearTimeout(timer);},[revealed]);
 const [exiting,setExiting]=useState(false),exitingRef=useRef(false),exitTimer=useRef<ReturnType<typeof setTimeout>>();
 const [queryReady,setQueryReady]=useState(false);
 const [gashaNear,setGashaNear]=useState<string|null>(null),gashaOpen=useGashaponPanel(),toyCover=useToyOverlay();const [game,setGame]=useState<ArcadeCabinetId|null>(null),[near,setNear]=useState<ArcadeCabinetId|null>(null),[list,setList]=useState(false),[hall,setHall]=useState(false),[today,setToday]=useState(false),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
 const machinePrompt=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(!game)return;countArcadeGame(game);return enterActivity(`arcade_${game}` as ActivityId);},[game]);// admin analytics: one play per launch (sponsorEvents.ts) +// admin analytics: time per arcade game (module variable, no render)
 const canvas=useRef<HTMLCanvasElement>(null),room=useRef<ReturnType<typeof createArcadeRoomScene>|null>(null),position=useRef<{x:number;z:number}>(),joy=useRef<HTMLDivElement>(null),pointer=useRef<number|null>(null),tap=useRef<{x:number;y:number}|null>(null);
 const joyRect=useJoystickBounds(joy,ready&&!game);
 const leave=(destination='/play?from=arcade')=>{if(exitingRef.current)return;exitingRef.current=true;room.current?.clearInput();setExiting(true);exitTimer.current=setTimeout(()=>window.location.assign(destination),matchMedia('(prefers-reduced-motion:reduce)').matches?60:360);};
 useEffect(()=>()=>{if(exitTimer.current)clearTimeout(exitTimer.current);},[]);
 useEffect(()=>installGameGuard(),[]);// no Copy / Search with Google bar, magnifier or pinch zoom while a cabinet is open
 useEffect(()=>{const id=new URLSearchParams(location.search).get('game');if(arcadeCabinets.some(c=>c.id===id))setGame(id as ArcadeCabinetId);setQueryReady(true);},[]);
 useEffect(()=>{if(!queryReady||game||!canvas.current)return;let canceled=false;setReady(false);setFailed(false);setNear(null);setSocialNear(null);setGashaNear(null);const node=canvas.current;import('@/lib/arcade/arcadeRoomScene').then(({createArcadeRoomScene})=>{if(canceled)return;try{const scene=createArcadeRoomScene(node,setNear,position.current,(x,y,visible)=>{const button=machinePrompt.current;if(button){button.style.left=`${x}px`;button.style.top=`${y}px`;button.style.visibility=visible?'visible':'hidden';}},()=>leave(),setSocialNear,setGashaNear);room.current=scene;(window as unknown as {__arcadeRoom?:unknown}).__arcadeRoom=scene;setReady(true);}catch{setFailed(true);}}).catch(()=>!canceled&&setFailed(true));return()=>{canceled=true;if(room.current){const s=room.current.state;position.current={x:s.x,z:s.z};room.current.dispose();room.current=null;}delete (window as unknown as {__arcadeRoom?:unknown}).__arcadeRoom;pointer.current=null;joyRect.current=null;};},[game,queryReady]);
 const play=(id:ArcadeCabinetId)=>{if(exitingRef.current)return;setList(false);setToday(false);setGame(id);history.replaceState(null,'',`/arcade?game=${id}`);};
 const back=()=>{setGame(null);history.replaceState(null,'','/arcade');};
 useEffect(()=>{const leave=()=>back();window.addEventListener(ARCADE_EXIT_EVENT,leave);return()=>window.removeEventListener(ARCADE_EXIT_EVENT,leave);},[]);
 useEffect(()=>{if(game)return;const key=(e:KeyboardEvent)=>{if((e.code==='Enter'||e.code==='KeyE')&&near&&!(e.target instanceof HTMLButtonElement)){e.preventDefault();play(near);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[game,near]);
 const stop=(e?:{pointerId:number})=>{if(e&&e.pointerId!==pointer.current)return;const id=pointer.current;pointer.current=null;joyRect.current=null;if(id!==null&&joy.current?.hasPointerCapture(id))joy.current.releasePointerCapture(id);room.current?.setStick(0,0);paintJoystick(joy.current,0,0);};
 const move=(e:PointerEvent<HTMLDivElement>)=>{if(pointer.current!==e.pointerId)return;e.preventDefault();const r=joyRect.current??(joyRect.current=e.currentTarget.getBoundingClientRect()),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,T=stickTravel(r.width),{px:x,py:y}=stickInput(dx,dy,T);room.current?.setStick(x/T,y/T);paintJoystick(joy.current,x,y,T);/* bounds-scaled: same feel at any ring size */};
 useEffect(()=>{const clear=()=>stop();window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);return()=>{window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);};},[]);
 const toyCovering=toyCover.toy!==null||toyCover.shelf;// the gashapon Toy Shelf / toy viewer cover the room (round 3A): its scene sleeps
 useEffect(()=>{if(list||hall||today||toyCovering)stop();room.current?.setCovered(list||hall||today||toyCovering);},[list,hall,today,ready,toyCovering]);
 useEffect(()=>setArcadeBusy(game,list||today,hall),[game,list,today,hall]);// multiplayer rooms: busy flags for the party layer (no-op until one attaches)
 const actionButton=(kind:ArcadeRoomAction,className:string,label:string,key:string)=><button key={kind} className={className} data-arcade-action={kind} data-social={socialNear!==null} aria-label={label} title={`${label} · ${key}`} onContextMenu={e=>e.preventDefault()} onPointerDown={e=>{if(!ready||e.button!==0)return;e.preventDefault();e.currentTarget.dataset.actionUntil=String(performance.now()+700);e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.dataset.charging='true';room.current?.beginAction(kind);}} onPointerUp={e=>{e.preventDefault();e.currentTarget.dataset.actionUntil=String(performance.now()+700);delete e.currentTarget.dataset.charging;room.current?.endAction(kind);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={e=>{delete e.currentTarget.dataset.charging;room.current?.endAction(kind,true);}} onLostPointerCapture={e=>{delete e.currentTarget.dataset.charging;room.current?.endAction(kind,true);}} onClick={e=>{if(performance.now()<Number(e.currentTarget.dataset.actionUntil??0))return;room.current?.action(kind);}}>{kind==='wave'||kind==='applaud'||kind==='celebrate'?<Icon name={kind==='wave'?'gloves':kind==='applaud'?'handshake':'star'} size={28}/>:<TravelIcon kind={kind==='jump'?'jump':kind==='shoot'?'shoot':kind==='keepups'?'juggle':kind==='rainbow'?'spin':'ballFeint'}/>}</button>;
 const chosen=arcadeCabinets.find(c=>c.id===near);
 useEffect(()=>{if(revealed||!queryReady||!minimumLoadingDone)return;if(failed||game){setRevealed(true);return;}if(!ready)return;let frame=0;const reveal=()=>{if((room.current?.state.draws??0)>0)setRevealed(true);else frame=requestAnimationFrame(reveal);};frame=requestAnimationFrame(reveal);return()=>cancelAnimationFrame(frame);},[ready,failed,game,queryReady,revealed,minimumLoadingDone]);
 const ArcadeGame=gameComponents[game==='tennis'||game==='runner'?game:'pinball'];
 return <main aria-label="The Arcade" className={styles.root} data-entering={!revealed} data-exiting={exiting} data-arcade-room={game?'playing':'room'}>
 {game?<div className={styles.game}>{game==='live'?<Strikers onExit={back}/>:game==='puzzle'?<PassPuzzle onExit={back}/>:<ArcadeGame kind={game} onExit={back}/>}</div>:<>
 <header className={styles.header}><NavigationButton back label="Exit" onNavigate={()=>leave()}/><div className={styles.headerActions}><button onClick={()=>{setList(false);setHall(false);setToday(true);}} aria-haspopup="dialog" data-arcade-today><span className={styles.buttonFace}>Today</span></button><button onClick={()=>{setList(false);setToday(false);setHall(true);}} aria-haspopup="dialog" data-arcade-scores><span className={styles.buttonFace}>Scores</span></button><button onClick={()=>setList(v=>!v)} aria-expanded={list} aria-controls="arcade-coins-panel"><span className={styles.buttonFace}>Coins</span></button></div></header>
 {party&&<div className={styles.partySlot}><RoomPartyChip party={party} hidden={list||hall||today} align="right"/></div>}
 <canvas ref={canvas} tabIndex={0} className={styles.canvas} aria-label="Walkable arcade room. Use WASD or arrow keys to walk, then Enter to play. You can also choose a machine from Coins." onPointerDown={e=>{tap.current={x:e.clientX,y:e.clientY};}} onPointerUp={e=>{const p=tap.current;tap.current=null;if(p&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<12){(document.activeElement as HTMLElement)?.blur?.();room.current?.pick(e.clientX,e.clientY);}}}/>
 {failed&&<div className={styles.error}><h2>The room couldn’t load.</h2><p>You can still choose a game.</p><button onClick={()=>setList(true)}>Choose a game</button></div>}
 {chosen&&<button ref={machinePrompt} className={`store-enter-prompt ${styles.machinePrompt}`} aria-label={`Play ${chosen.name}`} data-arcade-play={chosen.id} onPointerEnter={()=>room.current?.holdPrompt(chosen.id)} onPointerLeave={()=>room.current?.holdPrompt(null)} onClick={()=>play(chosen.id)}>Play</button>}
 {gashaNear&&!gashaOpen&&<button className={`store-enter-prompt ${styles.gashaPrompt}`} data-gashapon-go={gashaNear} aria-label={`Open the ${gashaponMachine(gashaNear)?.name??''} capsule machine`} onClick={()=>gashaponPanel.open(gashaNear)}>Gashapon</button>}
 {gashaOpen&&<GashaponPanel/>}
 <GashaponToyLayer/>
 {today&&<ArcadeTodayPanel onClose={()=>{setToday(false);requestAnimationFrame(()=>canvas.current?.focus({preventScroll:true}));}} onPlay={play}/>}
 {hall&&<ArcadeBoards onClose={()=>{setHall(false);requestAnimationFrame(()=>canvas.current?.focus({preventScroll:true}));}}/>}
 {list&&<ArcadeCoinsPanel ready={ready} onClose={()=>setList(false)} onPlay={play} onWalk={id=>{setList(false);room.current?.walkTo(id);requestAnimationFrame(()=>canvas.current?.focus({preventScroll:true}));}} onStore={()=>leave('/play?from=arcade&store=packs')}/>}
 <div className={`travel-actions ${styles.roomActions}`} data-social-near={socialNear!==null}>{actionButton(socialNear===null?'rainbow':'applaud','travel-mode',socialNear===null?'Rainbow flick':'Cheer together','F')}{actionButton(socialNear===null?'scissors':'celebrate','minimap-toggle',socialNear===null?'Scissors':'Celebrate together','C')}<div className="touch-actions">{actionButton(socialNear===null?'shoot':'jump','touch-shoot',socialNear===null?'Shoot':'Jump together','Space')}{actionButton(socialNear===null?'keepups':'wave','touch-juggle',socialNear===null?'Keep-ups':'Say hello','Q')}</div></div>
 <div className="touch-controls"><div className="joystick" data-edge="false" ref={joy} draggable={false} onDragStart={e=>e.preventDefault()} onContextMenu={e=>e.preventDefault()} role="group" aria-label="Move around the arcade" onPointerDown={e=>{if(pointer.current!==null||!ready)return;e.preventDefault();pointer.current=e.pointerId;joyRect.current=null;e.currentTarget.setPointerCapture(e.pointerId);move(e);}} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}><i className="joystick-contact" aria-hidden="true"><i className="joystick-contact-arc"/></i><span aria-hidden="true"/></div></div>
 </>}
 {!entryDone&&<ArcadeLoading exiting={revealed}/>}
 <div className={styles.fade} aria-hidden="true"/>
 </main>;
}

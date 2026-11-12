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
import {arcadeCabinets,arcadeAnalyticsId,type ArcadeCabinetId} from '@/lib/arcade/arcadeCatalog';
import {gashaponPanel,useGashaponPanel,useToyOverlay} from '@/lib/gashapon/gashaponBrowser';import GashaponToyLayer from './GashaponToyLayer';
import {gashaponMachine} from '@/lib/gashapon/machines';
const GashaponPanel=dynamic(()=>import('./GashaponPanel'),{ssr:false});// gashapon capsule machines (Nov 8 2026)
import type {createArcadeRoomScene,ArcadeRoomAction} from '@/lib/arcade/arcadeRoomScene';
import styles from './ArcadeRoom.module.css';
import {setArcadeBusy} from '@/lib/arcade/arcadeRoomHooks';
// Party in rooms (docs/multiplayer-rooms-design.md Phase 3): friends in the Arcade walk about the hub; a friend in a game shows at its
// cabinet in a force field. The layer lives for the PAGE (a game replaces the hub); Leave-only chip under the header.
import {useArcadeRoomParty} from './party/useArcadeRoomParty';import type {RoomPartyHandle} from './party/useRoomParty';import {RoomPlayerCard,roomTapPlayer} from './party/RoomPlayerTap';
const RoomPartyChip=dynamic(()=>import('./party/RoomPartyChip'),{ssr:false});// only rendered with a live party (flag on)
import {paintJoystick} from '@/lib/town/joystickFeedback';
import {stickInput,stickTravel} from '@/lib/town/floatingStick';
import {useJoystickBounds} from '@/lib/town/useJoystickBounds';
const Tennis=dynamic(()=>import('./games/TennisGame3D'),{ssr:false,loading:()=> <ArcadeGameLoading game="tennis"/>});
const Pinball=dynamic(()=>import('./games/PinballGame3D'),{ssr:false,loading:()=> <ArcadeGameLoading game="pinball"/>});
const Runner=dynamic(()=>import('./games/RunnerGame3D'),{ssr:false,loading:()=> <ArcadeGameLoading game="runner"/>});
const PassPuzzle=dynamic(()=>import('./games/PassPuzzleGame'),{ssr:false,loading:()=> <ArcadeGameLoading game="puzzle"/>});
// Nov 10 2026: Kit Rush took Island Strikers' cabinet. Strikers (./LiveArcadeMatch, lib/arcade/striker*) stays in the repo but is no longer
// reachable from the arcade; an old /arcade?game=live link opens Kit Rush.
const SquadSnake=dynamic(()=>import('./games/SquadSnakeGame'),{ssr:false,loading:()=> <ArcadeGameLoading game="snake"/>});
const AirFutbol=dynamic(()=>import('./games/AirFutbolGame'),{ssr:false,loading:()=> <ArcadeGameLoading game="airhockey"/>});
const KitRush=dynamic(()=>import('./games/KitRushGame'),{ssr:false,loading:()=> <ArcadeGameLoading game="kitrush"/>});
const gameComponents={tennis:Tennis,pinball:Pinball,runner:Runner};
/* Nov 11 2026 (slow-connection loading, docs/qa/arcade-load-after.md): the same chunks as the dynamic() games above (webpack shares them).
 * A deep link /arcade?game=<id> starts its game's download while this module evaluates, before hydration, instead of after it. */
const gameChunks:Record<ArcadeCabinetId,()=>Promise<unknown>>={tennis:()=>import('./games/TennisGame3D'),pinball:()=>import('./games/PinballGame3D'),runner:()=>import('./games/RunnerGame3D'),puzzle:()=>import('./games/PassPuzzleGame'),snake:()=>import('./games/SquadSnakeGame'),airhockey:()=>import('./games/AirFutbolGame'),kitrush:()=>import('./games/KitRushGame')};
let earlyGame:{id:string;chunk:Promise<unknown>}|null=null;
if(typeof window!=='undefined'){const raw=new URLSearchParams(location.search).get('game'),id=raw==='live'?'kitrush':raw;if(id&&Object.prototype.hasOwnProperty.call(gameChunks,id))earlyGame={id,chunk:gameChunks[id as ArcadeCabinetId]().catch(()=>{})};}
const gameChunk=(id:ArcadeCabinetId)=>earlyGame?.id===id?earlyGame.chunk:gameChunks[id]().catch(()=>{});
/** The party layer (three.js + avatars, ~0.5 MB) mounts once the room has drawn or the game's code is in, on idle: it no longer competes
 * with a deep-linked 2D game or the room for a slow connection. Late attach is supported (arcadeRoomHooks attachArcadeLayer/busy). */
function ArcadePartyLayer({onParty}:{onParty:(p:RoomPartyHandle|null)=>void}){const party=useArcadeRoomParty();useEffect(()=>{onParty(party);},[party,onParty]);useEffect(()=>()=>onParty(null),[onParty]);return null;}
// The Hall of High Scores (docs/arcade-leaderboards.md): lazy, loaded when Scores is tapped; the room sleeps under it.
const ArcadeBoards=dynamic(()=>import('./arcade/ArcadeBoards'),{ssr:false});
// Today in the arcade (Nov 10 2026): one daily challenge per cabinet; lazy, loaded when Today is tapped.
const ArcadeTodayPanel=dynamic(()=>import('./arcade/ArcadeTodayPanel'),{ssr:false});
/** One play per launch + time per game for admin analytics. `game` is the cabinet's analytics id (arcadeCatalog.ts arcadeAnalyticsId: Kit Rush reports on the slot it took over). */
function trackArcadeGame(game:string|null){if(!game)return;countArcadeGame(game);return enterActivity(`arcade_${game}` as ActivityId);}
export default function ArcadeRoom(){
 const [party,takeParty]=useState<RoomPartyHandle|null>(null),[partyOn,startParty]=useState(false);// the layer: <ArcadePartyLayer> below (not a busy flag: tests/mp-rooms-arcade.cjs)
 const [socialNear,setSocialNear]=useState<number|null>(null);
 const [revealed,setRevealed]=useState(false),[entryDone,setEntryDone]=useState(false),[minimumLoadingDone,setMinimumLoadingDone]=useState(false);
 useEffect(()=>{const timer=setTimeout(()=>setMinimumLoadingDone(true),700/* Nov 11 2026 (owner: the arcade took a while to get into): was 3000 */);return()=>clearTimeout(timer);},[]);
 useEffect(()=>{if(!revealed)return;const timer=setTimeout(()=>setEntryDone(true),matchMedia('(prefers-reduced-motion:reduce)').matches?0:1100/* was 2500; ArcadeLoading.module.css .exiting fades at .5s for .55s */);return()=>clearTimeout(timer);},[revealed]);
 const [exiting,setExiting]=useState(false),exitingRef=useRef(false),exitTimer=useRef<ReturnType<typeof setTimeout>>();
 const [queryReady,setQueryReady]=useState(false);
 /* Nov 10 2026 (owner): the Gashapon button sits just above the machine you are standing at, like the cabinet prompts; the scene reports its screen spot. */
 const gashaPrompt=useRef<HTMLButtonElement|null>(null),gashaAt=useRef<{x:number;y:number;visible:boolean}|null>(null),placeGasha=(b:HTMLButtonElement|null)=>{const at=gashaAt.current;if(!b||!at)return;b.style.left=`${at.x}px`;b.style.top=`${at.y}px`;b.style.bottom='auto';b.style.transform='translate(-50%,-100%)';b.style.visibility=at.visible?'visible':'hidden';};
 const [gashaNear,setGashaNear]=useState<string|null>(null),gashaOpen=useGashaponPanel(),toyCover=useToyOverlay();const [game,setGame]=useState<ArcadeCabinetId|null>(null),[near,setNear]=useState<ArcadeCabinetId|null>(null),[list,setList]=useState(false),[hall,setHall]=useState(false),[today,setToday]=useState(false),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
 const machinePrompt=useRef<HTMLButtonElement>(null);
 useEffect(()=>trackArcadeGame(game&&arcadeAnalyticsId(game)),[game]);// admin analytics: one play per launch (sponsorEvents.ts) +// admin analytics: time per arcade game (module variable, no render)
 const canvas=useRef<HTMLCanvasElement>(null),room=useRef<ReturnType<typeof createArcadeRoomScene>|null>(null),position=useRef<{x:number;z:number}>(),joy=useRef<HTMLDivElement>(null),pointer=useRef<number|null>(null),tap=useRef<{x:number;y:number}|null>(null);
 const joyRect=useJoystickBounds(joy,ready&&!game);
 const leave=(destination='/play?from=arcade')=>{if(exitingRef.current)return;exitingRef.current=true;room.current?.clearInput();setExiting(true);exitTimer.current=setTimeout(()=>window.location.assign(destination),matchMedia('(prefers-reduced-motion:reduce)').matches?60:360);};
 useEffect(()=>()=>{if(exitTimer.current)clearTimeout(exitTimer.current);},[]);
 useEffect(()=>installGameGuard(),[]);// no Copy / Search with Google bar, magnifier or pinch zoom while a cabinet is open
 useEffect(()=>{const raw=new URLSearchParams(location.search).get('game'),id=raw==='live'?'kitrush':raw;/* old Strikers links open Kit Rush */if(arcadeCabinets.some(c=>c.id===id))setGame(id as ArcadeCabinetId);setQueryReady(true);},[]);
 useEffect(()=>{if(!queryReady||game||!canvas.current)return;let canceled=false;setReady(false);setFailed(false);setNear(null);setSocialNear(null);setGashaNear(null);const node=canvas.current;import('@/lib/arcade/arcadeRoomScene').then(({createArcadeRoomScene})=>{if(canceled)return;try{const scene=createArcadeRoomScene(node,setNear,position.current,(x,y,visible)=>{const button=machinePrompt.current;if(button){button.style.left=`${x}px`;button.style.top=`${y}px`;button.style.visibility=visible?'visible':'hidden';}},()=>leave(),setSocialNear,setGashaNear,(x,y,visible)=>{gashaAt.current={x,y,visible};placeGasha(gashaPrompt.current);});room.current=scene;(window as unknown as {__arcadeRoom?:unknown}).__arcadeRoom=scene;setReady(true);}catch{setFailed(true);}}).catch(()=>!canceled&&setFailed(true));return()=>{canceled=true;if(room.current){const s=room.current.state;position.current={x:s.x,z:s.z};room.current.dispose();room.current=null;}delete (window as unknown as {__arcadeRoom?:unknown}).__arcadeRoom;pointer.current=null;joyRect.current=null;};},[game,queryReady]);
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
 useEffect(()=>{if(revealed||!queryReady)return;if(failed||game){setRevealed(true);return;}/* Nov 10 2026: a deep-linked game (/arcade?game=) has its own loading card, so the room's 3 s minimum no longer holds this screen over a menu that is already up */if(!minimumLoadingDone)return;if(!ready)return;let frame=0;const reveal=()=>{if((room.current?.state.draws??0)>0)setRevealed(true);else frame=requestAnimationFrame(reveal);};frame=requestAnimationFrame(reveal);return()=>cancelAnimationFrame(frame);},[ready,failed,game,queryReady,revealed,minimumLoadingDone]);
 useEffect(()=>{if(partyOn||!queryReady)return;const go=game?gameChunk(game):revealed?Promise.resolve():null;if(!go)return;let dead=false,idle=0,timer:ReturnType<typeof setTimeout>|undefined;const w=window as Window&{requestIdleCallback?:(cb:()=>void,o?:{timeout:number})=>number;cancelIdleCallback?:(id:number)=>void};const on=()=>{if(dead)return;if(w.requestIdleCallback)idle=w.requestIdleCallback(()=>{if(!dead)startParty(true);},{timeout:2500});else timer=setTimeout(()=>{if(!dead)startParty(true);},1200);};go.then(on,on);return()=>{dead=true;if(idle)w.cancelIdleCallback?.(idle);if(timer)clearTimeout(timer);};},[partyOn,queryReady,game,revealed]);// party layer on idle after the room drew / the game's code arrived
 const ArcadeGame=gameComponents[game==='tennis'||game==='runner'?game:'pinball'];
 return <main aria-label="The Arcade" className={styles.root} data-entering={!revealed} data-exiting={exiting} data-arcade-room={game?'playing':'room'}>
 {partyOn&&<ArcadePartyLayer onParty={takeParty}/>}
 {game?<div className={styles.game}>{game==='kitrush'?<KitRush onExit={back}/>:game==='snake'?<SquadSnake onExit={back}/>:game==='airhockey'?<AirFutbol onExit={back}/>:game==='puzzle'?<PassPuzzle onExit={back}/>:<ArcadeGame kind={game} onExit={back}/>}</div>:<>
 {/* Nov 11 2026 (owner): Today and Scores on the left, Exit on the right; no Coins button now that every arcade game is free to play. */}<header className={styles.header}><div className={styles.headerActions}><button onClick={()=>{setList(false);setHall(false);setToday(true);}} aria-haspopup="dialog" data-arcade-today><span className={styles.buttonFace}>Today</span></button><button onClick={()=>{setList(false);setToday(false);setHall(true);}} aria-haspopup="dialog" data-arcade-scores><span className={styles.buttonFace}>Scores</span></button></div><NavigationButton back label="Exit" onNavigate={()=>leave()}/></header>
 {party&&<div className={styles.partySlot}><RoomPartyChip party={party} hidden={list||hall||today} align="right"/></div>}<RoomPlayerCard party={party} blocked={list||hall||today}/>
 <canvas ref={canvas} tabIndex={0} className={styles.canvas} aria-label="Walkable arcade room. Use WASD or arrow keys to walk, then Enter to play. You can also choose a machine from Coins." onPointerDown={e=>{tap.current={x:e.clientX,y:e.clientY};}} onPointerUp={e=>{const p=tap.current;tap.current=null;if(p&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<12){(document.activeElement as HTMLElement)?.blur?.();const onCabinet=room.current?.cabinetAt(e.clientX,e.clientY);room.current?.pick(e.clientX,e.clientY);if(!onCabinet)roomTapPlayer(party,e.clientX,e.clientY,e.currentTarget);}}}/>
 {failed&&<div className={styles.error}><h2>The room couldn’t load.</h2><p>You can still choose a game.</p><button onClick={()=>setList(true)}>Choose a game</button></div>}
 {chosen&&<button ref={machinePrompt} className={`store-enter-prompt ${styles.machinePrompt}`} aria-label={`Play ${chosen.name}`} data-arcade-play={chosen.id} onPointerEnter={()=>room.current?.holdPrompt(chosen.id)} onPointerLeave={()=>room.current?.holdPrompt(null)} onClick={()=>play(chosen.id)}>Play</button>}
 {gashaNear&&!gashaOpen&&<button ref={n=>{gashaPrompt.current=n;placeGasha(n);}} className={`store-enter-prompt ${styles.gashaPrompt}`} data-gashapon-go={gashaNear} aria-label={`Open the ${gashaponMachine(gashaNear)?.name??''} capsule machine`} onClick={()=>gashaponPanel.open(gashaNear)}>Gashapon</button>}
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

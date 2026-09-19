'use client';
import {FORMAT_PATH_LAUNCH,validPathLaunch,type FormatPathLaunch} from '@/lib/paths/formatPaths';
import {createTruckReactions} from '@/lib/graphics/truckReactions';
import {truckHitsCharacter} from '@/lib/town/truckCollisions';
import {isVideoPlaying,subscribeVideoPlayback} from '@/lib/videoPlayback';
import {useJoystickBounds} from '@/lib/town/useJoystickBounds';
import {rideSurfacePose} from '@/lib/town/rideSurfacePose';
import {createPitchVisibility} from '@/lib/town/pitchVisibility';
import {createObstacleGrid} from '@/lib/town/obstacleGrid';
import {createShadowVisibility} from '@/lib/graphics/shadowVisibility';
import {paintJoystick} from '@/lib/town/joystickFeedback';
import {createPositionStore} from '@/lib/town/positionStore';
import {MovingIslandOverview,MovingIslandTravelMap} from './MovingIslandMap';
import {createHiddenTransformGate} from '@/lib/graphics/hiddenTransformGate';
import {Icon} from './Icon';
import { useEffect, useRef, useState } from 'react';
import {createIslandSound} from '@/lib/audio/islandSound';
import {createIslandMusic} from '@/lib/audio/islandMusic';
import * as T from 'three';
import CoachLesson from './CoachLesson';
import TravelIcon from './TravelIcon';
import {createSpinGesture} from '@/lib/town/spinGesture';
import {tapHaptic} from '@/lib/town/haptics';
import {findWallJuggleTarget} from '@/lib/town/wallJuggleTarget';
import {assistedShotYaw} from '@/lib/town/shotAssist';
import IslandSettings from './IslandSettings';
import IslandLoading from './IslandLoading';
import CharacterCustomizer from './CharacterCustomizer';
import IslandStore from './IslandStore';
import CoachesCentre from './CoachesCentre';
import PositionGuide from './PositionGuide';
import {positionInfo,type PositionSelection} from '@/lib/town/playerPositions';
import Arcade from './Arcade';
import dynamic from 'next/dynamic';
import IslandOnboarding from './IslandOnboarding';
import {shouldShowIslandOnboarding} from '@/lib/town/onboarding';
import {LEARNING_LAUNCH} from '@/lib/town/learningProgress';
import {journeyById,type LearningId} from '@/lib/town/learningJourneys';
import {recordExploreActivity,recordExploreKnockover} from '@/lib/town/exploreActivity';
import {recordQuestVisit} from '@/lib/town/questProgress';
import NpcConversation from './NpcConversation';
import {createIslandNpcs} from '@/lib/graphics/islandNpcs';
import type {NpcDefinition} from '@/lib/town/npcDialogues';
import {useQuizProgress,getQuizProgress} from '@/lib/town/quizProgress';
import {equippedActions} from '@/lib/town/equipmentActions';
import {createBallAppearance} from '@/lib/graphics/ballAppearance';
import {DEFAULT_CUSTOMIZATION,loadCustomization,saveCustomization,sanitizeCustomization,BALL_COLORS,type CharacterCustomization} from '@/lib/town/customization';
import {COACH_VOICES} from '@/lib/town/useLessonVoice';
import {createIslandLighting,type TimeOfDay} from '@/lib/graphics/islandLighting';
import {createStaticShadowBatches} from '@/lib/graphics/staticShadowBatches';
import {createStaticShadowCache} from '@/lib/graphics/staticShadowCache';
import {createCharacterArrival} from '@/lib/graphics/characterArrival';
import {createCoinHunt} from '@/lib/graphics/coinHunt';
import CoinHuntHud from './CoinHuntHud';
import Museum from './Museum';
import FerryPreview from './FerryPreview';
import {createLiveKnockout} from '@/lib/graphics/liveKnockout';
import {createRooftopTravel,ROOF_RECOVERY_TIME} from '@/lib/town/rooftopTravel';
import FieldLearning from './FieldLearning';
import {type MapFootprint} from './IslandOverview';
import {VENUES,ISLAND_SQUARE,ARCADE_DOOR,COACHES_DOOR,STORE_DOOR,venueById,venueEntrance,nearestVenue,fieldSurfaceHeight,type Format} from '@/lib/town/venues';
import {buildFormatFields} from '@/lib/town/fields';
import {createFieldRuntime} from '@/lib/town/fieldRuntime';
import type {FieldSession} from '@/lib/town/formatLessons';
import { PASSER, DEFENDER, passingLane, LessonPhase } from '@/lib/town/learning';
import { fitIslandShadows } from '@/lib/graphics/islandShadows';
import { createVehicle } from '@/lib/graphics/vehicle';
import {createCoachPractice} from '@/lib/town/coachPractice';
import {createFlightMotion} from '@/lib/graphics/flightMotion';
import {createBoundaryFeedback} from '@/lib/graphics/boundaryFeedback';
import {createLandingMarker} from '@/lib/graphics/landingMarker';
import {createQuizViewControls} from '@/lib/town/quizViewControls';
import {createLearningView,type LearningAngle} from '@/lib/town/learningView';
import {createJetExhaust} from '@/lib/graphics/jetExhaust';
import {createVolleyballGame} from '@/lib/graphics/volleyballGame';
import {createTreeDebris} from '@/lib/graphics/treeDebris';
import {createStreetTraffic} from '@/lib/graphics/streetTraffic';
import {createFlightTrail,FLIGHT_TRAIL_COLORS} from '@/lib/graphics/flightTrail';
import { createRideTrail } from '@/lib/graphics/rideTrail';
import { TRAVEL_MODES, type TravelMode } from '@/lib/town/travelModes';
import {createJetpackActions} from '@/lib/town/jetpackActions';
import {createBallReactions,type BallHitTarget} from '@/lib/graphics/ballReactions';
import {createRideChange} from '@/lib/graphics/rideChange';
import {createJetpackBreakup} from '@/lib/graphics/jetpackBreakup';
import {createSonicBurst} from '@/lib/graphics/sonicBurst';
import {createCharacterGlow} from '@/lib/graphics/characterGlow';
import {createBuildingGlow} from '@/lib/graphics/buildingGlow';
import {createNpcHover} from '@/lib/graphics/npcHover';
import {createOnboardingNpcFocus,type OnboardingNpcTarget} from '@/lib/graphics/onboardingNpc';
import {createCraterEffect} from '@/lib/graphics/craterEffect';
import {createParachuteTrail} from '@/lib/graphics/parachuteTrail';
import {createParachute} from '@/lib/graphics/parachute';
import {planRoofRamps,planRideRamps,rampSurface,createRampMotion} from '@/lib/town/rideRamps';
import {createRideRampVisuals} from '@/lib/graphics/rideRamps';
import {createRideTricks,isHeldRideAction} from '@/lib/town/rideTricks';
import {createWalkBall,SHOT_WINDUP} from '@/lib/town/walkBall';
import {createBallEffects} from '@/lib/graphics/ballEffects';
import { createPlayer } from '@/lib/graphics/player';
import { graphicsQuality, FrameBudget } from '@/lib/graphics/quality';
import { buildTown } from '@/lib/town/world';
import { District, DISTRICTS, districtAt, stepPlayer, blocked, flightBlocked, ISLAND_BOUNDS } from '@/lib/town/simulation';

const BallHuntLesson=dynamic(()=>import('./BallHuntLesson'),{ssr:false});
const LiveArcadeMatch=dynamic(()=>import('./LiveArcadeMatch'),{ssr:false});
const INITIAL_SPAWN={x:103,z:-8};
const INITIAL_FLIGHT_HEIGHT=28;
type Input = {charging?:boolean;shotPower?:number;x:number;z:number;sprint:boolean;kick:boolean;juggle:boolean};
export default function Island() {
  const [videoPlaying,setVideoPlaying]=useState(false);
  const [talkingNpc,setTalkingNpc]=useState<NpcDefinition|null>(null),[conversationOpen,setConversationOpen]=useState(false);
  const [nearbyNpc,setNearbyNpc]=useState<NpcDefinition|null>(null),nearbyNpcRef=useRef<NpcDefinition|null>(null);
  const openConversation=(npc:NpcDefinition)=>{recordExploreActivity('character',npc.id);setTalkingNpc(npc);setConversationOpen(true);};
  const quizProgress=useQuizProgress();
  const onboardingNpcStep=useRef(false),onboardingNpcTarget=useRef<OnboardingNpcTarget|null>(null);
  const [onboardingOpen,setOnboardingOpen]=useState(false),onboardingRef=useRef(false);onboardingRef.current=onboardingOpen;
  const [arcadeOpen,setArcadeOpen]=useState(false),[liveArcadeOpen,setLiveArcadeOpen]=useState(false);
  const [storeOpen,setStoreOpen]=useState(false);
  const [formatPathRequest,setFormatPathRequest]=useState<FormatPathLaunch|null>(null);
  useEffect(()=>{const launch=(event:Event)=>{const detail=(event as CustomEvent).detail;if(!validPathLaunch(detail))return;setFormatPathRequest(detail);setLearningRequest(null);setSettingsOpen(false);setStoreOpen(false);setConversationOpen(false);setMap(false);setFieldCatalog(detail.format);setHint(false);};window.addEventListener(FORMAT_PATH_LAUNCH,launch);return()=>window.removeEventListener(FORMAT_PATH_LAUNCH,launch);},[]);
  const [learningRequest,setLearningRequest]=useState<{id:LearningId;nonce:number}|null>(null);
  useEffect(()=>{const launch=(event:Event)=>{const detail=(event as CustomEvent<{id:LearningId;nonce:number}>).detail,j=journeyById(detail?.id);if(!j)return;setFormatPathRequest(null);setLearningRequest(detail);setSettingsOpen(false);setStoreOpen(false);setConversationOpen(false);setMap(false);setFieldCatalog(j.format);setHint(false);};window.addEventListener(LEARNING_LAUNCH,launch);return()=>window.removeEventListener(LEARNING_LAUNCH,launch);},[]);
  const [storeItemRequest,setStoreItemRequest]=useState<{id:string;nonce:number}|null>(null),[pathsRequest,setPathsRequest]=useState<{nonce:number}|null>(null);
  const [coachesOpen,setCoachesOpen]=useState(false);
  const [ferryOpen,setFerryOpen]=useState(false);
  const [museumOpen,setMuseumOpen]=useState(false);
  const [ballLessons,setBallLessons]=useState<string[]>([]),[coinNear,setCoinNear]=useState('');
  useEffect(()=>{const show=()=>{setStoreOpen(false);setSettingsOpen(true);window.dispatchEvent(new Event('fi2-open-coin-panel'));};const hide=()=>setSettingsOpen(false);window.addEventListener('fi2-coin-quest-open',show);window.addEventListener('fi2-coin-hint',hide);return()=>{window.removeEventListener('fi2-coin-quest-open',show);window.removeEventListener('fi2-coin-hint',hide);};},[]);
  const [positionSelection,setPositionSelection]=useState<PositionSelection|null>(null);
  const positionSelectionRef=useRef(positionSelection);positionSelectionRef.current=positionSelection;
  const openStore=(itemId?:string)=>{if(itemId)setStoreItemRequest({id:itemId,nonce:Date.now()});setSettingsOpen(false);setCustomizerOpen(false);setConversationOpen(false);setMap(false);setStoreOpen(true);setHint(false);};
  const [customizerOpen,setCustomizerOpen]=useState(false),customizerRef=useRef(false);customizerRef.current=customizerOpen;
  const [customization,setCustomization]=useState<CharacterCustomization>({...DEFAULT_CUSTOMIZATION}),customizationRef=useRef(customization);customizationRef.current=customization;
  useEffect(()=>{const progress=getQuizProgress();setCustomization(loadCustomization(progress.completed,progress.total));},[]);
  const changeCustomization=(value:CharacterCustomization)=>{const progress=getQuizProgress(),safe=sanitizeCustomization(value,progress.completed,progress.total);customizationRef.current=safe;setCustomization(safe);saveCustomization(safe);};
  const [settingsOpen,setSettingsOpen]=useState(false),settingsRef=useRef(false);settingsRef.current=settingsOpen||customizerOpen||conversationOpen||storeOpen||onboardingOpen||arcadeOpen||liveArcadeOpen||coachesOpen||museumOpen||ferryOpen||!!positionSelection||ballLessons.length>0;
  const [voiceEnabled,setVoiceEnabled]=useState(true),[coachVoice,setCoachVoice]=useState('kokoro_af_bella'),[controlsFlipped,setControlsFlipped]=useState(false);
  useEffect(()=>{try{setVoiceEnabled(localStorage.getItem('fi2-voice-enabled')!=='false');const coach=localStorage.getItem('fi2-coach-voice');if(COACH_VOICES.some(([id])=>id===coach))setCoachVoice(coach!);setControlsFlipped(localStorage.getItem('fi2-controls-flipped')==='true');}catch{}},[]);
  const savePreference=(key:string,value:string)=>{try{localStorage.setItem(key,value);}catch{}};
  const [timeOfDay,setTimeOfDay]=useState<TimeOfDay>('sunset'),timeRef=useRef<TimeOfDay>('sunset');
  const changeTime=(mode:TimeOfDay)=>{timeRef.current=mode;setTimeOfDay(mode);try{localStorage.setItem('fi2-time-of-day',mode);}catch{}};
  const musicRef=useRef<ReturnType<typeof createIslandMusic>|null>(null);
  const [musicEnabled,setMusicEnabled]=useState(true);
  const [musicVolume,setMusicVolume]=useState(.04),[soundVolume,setSoundVolume]=useState(.5);
  const toggleMusic=()=>{const enabled=!musicEnabled;setMusicEnabled(enabled);musicRef.current?.setEnabled(enabled);try{localStorage.setItem('fi2-music-enabled',String(enabled));}catch{}};
  const unlockAudio=()=>{soundRef.current?.unlock();musicRef.current?.unlock();};
  const soundRef=useRef<ReturnType<typeof createIslandSound>|null>(null);
  const [soundMuted,setSoundMuted]=useState(false);
  const toggleSound=()=>{const muted=!soundMuted;setSoundMuted(muted);soundRef.current?.setMuted(muted);try{localStorage.setItem('fi2-sound-muted',String(muted));}catch{}};
  const soundButton=(target:EventTarget|null)=>target instanceof Element?target.closest('button:not(:disabled), a[href], [role=button]:not([aria-disabled=true])'):null;
  const [mapFootprints,setMapFootprints]=useState<{roads:MapFootprint[];buildings:MapFootprint[]}>({roads:[],buildings:[]});
  const [juggling,setJuggling]=useState(false);
  const [rideMode,setRideMode]=useState<TravelMode>('jetpack'),rideRef=useRef<TravelMode>('jetpack');
  const pendingRide=useRef<TravelMode|null>(null),cancelLanding=useRef(false);
  const nearbyTruck=useRef<number|null>(null),requestedTruck=useRef<number|null>(null),truckExitRequested=useRef(false),truckBoostRequested=useRef(false),truckHonkRequested=useRef(false);
  const [truckRiding,setTruckRiding]=useState(false);
  const landOnTruck=()=>{if(nearbyTruck.current!==null){requestedTruck.current=nearbyTruck.current;pendingRide.current='walk';cancelLanding.current=false;}};
  const selectRide=(mode:TravelMode)=>{if(mode==='jetpack'){pendingRide.current=null;cancelLanding.current=true;}if(rideRef.current==='jetpack'&&mode!=='jetpack'){pendingRide.current=mode;setHint(false);return;}rideRef.current=mode;setRideMode(mode);setHint(false);};
  const cycleRide=()=>{const order:TravelMode[]=['walk','scooter','bike','moped','jetpack'];selectRide(order[(order.indexOf(rideRef.current)+1)%order.length]);};
  const [fieldCatalog,setFieldCatalog]=useState<Format|null>(null),learningFormat=useRef<Format|null>(null);learningFormat.current=fieldCatalog;
  const gamesRef=useRef<ReturnType<typeof createFieldRuntime>|null>(null);
  const learningAngle=useRef<LearningAngle>('default');
  const resetQuizView=useRef<()=>void>(()=>{});
  const fieldSession=useRef<FieldSession|null>(null),fieldTravel=useRef<Format|null>(null),fieldMenu=useRef(false);
  fieldMenu.current=fieldCatalog!==null;
  const goField=(id:Format)=>{if(lessonRef.current)lessonCommand.current='exit';travel.current=null;fieldSession.current=null;setFieldCatalog(null);fieldTravel.current=id;setMap(false);setHint(false);};
  const [lesson,setLesson]=useState<LessonPhase|null>(null),[laneOpen,setLaneOpen]=useState(false),[coachFeedback,setCoachFeedback]=useState('');
  const lessonRef=useRef<LessonPhase|null>(null),lessonCommand=useRef<LessonPhase|'exit'|null>(null);
  const requestLesson=(phase:LessonPhase|'exit')=>{selectRide('walk');lessonCommand.current=phase;setHint(false);setMap(false);setCoachFeedback('');};
  const heldRidePointers=useRef(new Map<number,{action:number;button:HTMLButtonElement}>());
  const host=useRef<HTMLDivElement>(null),input=useRef<Input>({x:0,z:0,sprint:false,kick:false,juggle:false});
  const shotHold=useRef<{id:number|'keyboard';start:number;button?:HTMLButtonElement}|null>(null);
  const cancelShotHold=()=>{const hold=shotHold.current;shotHold.current=null;input.current.charging=false;if(hold?.button){hold.button.dataset.touchActionUntil=String(performance.now()+700);hold.button.removeAttribute('data-charging');if(typeof hold.id==='number'&&hold.button.hasPointerCapture(hold.id))hold.button.releasePointerCapture(hold.id);}};
  const beginShotHold=(id:number|'keyboard',button?:HTMLButtonElement)=>{if(shotHold.current)return;shotHold.current={id,start:performance.now(),button};input.current.charging=true;input.current.shotPower=0;if(button){button.dataset.touchActionUntil=String(performance.now()+700);button.setAttribute('data-charging','true');}};
  const finishShotHold=()=>{const hold=shotHold.current;if(!hold)return;const power=Math.max(0,Math.min(1,(performance.now()-hold.start-180)/1800));if(hold.button)hold.button.dataset.touchActionUntil=String(performance.now()+700);cancelShotHold();if(rideRef.current==='walk'&&!lessonRef.current&&!settingsRef.current&&!mapRef.current&&!fieldMenu.current){input.current.shotPower=power;input.current.kick=true;tapHaptic();soundRef.current?.ui('click');}};
  useEffect(()=>{
    const canvasHost=host.current;if(!canvasHost)return;
    const pinch=(event:WheelEvent)=>{if(event.ctrlKey)event.preventDefault();};
    const gesture=(event:Event)=>event.preventDefault();
    canvasHost.addEventListener('wheel',pinch,{passive:false});
    canvasHost.addEventListener('gesturestart',gesture,{passive:false});
    canvasHost.addEventListener('gesturechange',gesture,{passive:false});
    return()=>{canvasHost.removeEventListener('wheel',pinch);canvasHost.removeEventListener('gesturestart',gesture);canvasHost.removeEventListener('gesturechange',gesture);};
  },[]);
  const travel=useRef<District|'square'|'coaches'|'store'|null>(null),mapRef=useRef(false);
  const [district,setDistrict]=useState<District>('coast'),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
  useEffect(()=>{if(ready&&!failed&&shouldShowIslandOnboarding())setOnboardingOpen(true);},[ready,failed]);
  const [minimapCollapsed,setMinimapCollapsed]=useState(false);
  const [map,setMap]=useState(false),[goals,setGoals]=useState(0),[scored,setScored]=useState(false);
  const [positionStore]=useState(()=>createPositionStore(INITIAL_SPAWN)),[hint,setHint]=useState(true);
  const zoneAt=(x:number,z:number)=>(nearestVenue(x,z)?1:0)|(Math.abs(x-ISLAND_SQUARE.x)<40&&Math.abs(z-ISLAND_SQUARE.z)<35?2:0);
  const [locationZone,setLocationZone]=useState(()=>zoneAt(INITIAL_SPAWN.x,INITIAL_SPAWN.z)),zoneRef=useRef(locationZone),hudRenders=useRef(0);hudRenders.current++;
  const joystickPointer=useRef<number|null>(null),spinGesture=useRef(createSpinGesture()),spinRequested=useRef(false);
  const joystick=useRef<HTMLDivElement>(null);
  const joystickBounds=useJoystickBounds(joystick,ready&&!failed);
  // The control mounts only after loading; the scene effect runs before its ref exists.
  useEffect(()=>{
    const element=joystick.current;if(!ready||failed||!element)return;
    const prevent=(event:Event)=>{if(event.cancelable)event.preventDefault();};
    const gestures=['touchstart','touchmove','touchend','dblclick','selectstart','contextmenu','gesturestart','gesturechange','gestureend'];
    for(const name of gestures)element.addEventListener(name,prevent,{passive:false,capture:true});
    return()=>{for(const name of gestures)element.removeEventListener(name,prevent,true);};
  },[ready,failed]);
  const setStick=({x,y}:{x:number;y:number})=>paintJoystick(joystick.current,x,y);
  const [mapMounted,setMapMounted]=useState(false);
  useEffect(()=>{if(map){setMapMounted(true);return;}const timer=setTimeout(()=>setMapMounted(false),window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:380);return()=>clearTimeout(timer);},[map]);
  mapRef.current=map||mapMounted;
  const go=(to:District|'square'|'coaches'|'store')=>{if(to==='coast'||to==='oldtown'){goField(to==='coast'?'futsal':'7v7');return;}fieldSession.current=null;setFieldCatalog(null);if(lessonRef.current)lessonCommand.current='exit';travel.current=to;setMap(false);setHint(false);};
  useEffect(()=>{
    const parent=host.current;if(!parent)return;
    let renderer:T.WebGLRenderer;
    try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'default'});}catch{setFailed(true);return;}
    let savedMuted=false;try{savedMuted=localStorage.getItem('fi2-sound-muted')==='true';}catch{}
    const savedVolume=(key:string,fallback:number)=>{try{const raw=localStorage.getItem(key),n=raw===null?fallback:Number(raw);return Number.isFinite(n)?Math.max(0,Math.min(1,n)):fallback;}catch{return fallback;}};
    // Apply the requested mix once to existing saves, then retain slider edits.
    let useNewAudioMix=true;try{useNewAudioMix=localStorage.getItem('fi2-audio-mix')!=='4-50-v1';if(useNewAudioMix){localStorage.setItem('fi2-music-volume','.04');localStorage.setItem('fi2-sound-volume','.5');localStorage.setItem('fi2-audio-mix','4-50-v1');}}catch{}
    const initialSoundVolume=useNewAudioMix?.5:savedVolume('fi2-sound-volume',.5),initialMusicVolume=useNewAudioMix?.04:savedVolume('fi2-music-volume',.04);setSoundVolume(initialSoundVolume);setMusicVolume(initialMusicVolume);
    const sound=createIslandSound(savedMuted,initialSoundVolume);soundRef.current=sound;setSoundMuted(savedMuted);
    let savedMusic=true;try{savedMusic=localStorage.getItem('fi2-music-enabled')!=='false';}catch{}
    const music=createIslandMusic(savedMusic,initialMusicVolume,sound.getContext);musicRef.current=music;setMusicEnabled(savedMusic);
    const quality=graphicsQuality(),budget=new FrameBudget();renderer.setPixelRatio(quality.pixelRatio);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;parent.appendChild(renderer.domElement);
    const scene=new T.Scene();scene.background=new T.Color('#e8b98b');scene.fog=null;
    const coinHunt=createCoinHunt(scene,()=>sound.ui('click'),setCoinNear,c=>setBallLessons(queue=>queue.includes(c.id)?queue:[...queue,c.id]));
    const characterArrival=createCharacterArrival(scene);
    const camera=new T.PerspectiveCamera(40,1,1,500);
    const hemi=new T.HemisphereLight('#ffe0aa','#9b785c',2.0);scene.add(hemi);
    const sun=new T.DirectionalLight('#ffc477',3.0);sun.position.set(-288,252,198);sun.castShadow=true;sun.shadow.mapSize.set(quality.shadowSize,quality.shadowSize);Object.assign(sun.shadow.camera,{left:-35,right:35,top:35,bottom:-35,near:1,far:100});sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;sun.shadow.radius=3;scene.add(sun);scene.add(sun.target);
    try{const saved=localStorage.getItem('fi2-time-of-day');if(saved==='day'||saved==='sunset'||saved==='night'){timeRef.current=saved;setTimeOfDay(saved);}}catch{}
    const lighting=createIslandLighting(scene,hemi,sun,renderer);lighting.update(timeRef.current,0,true);
    let wasSettingsOpen=false;
    const learningView=createLearningView();let wasLearning=false;
    const quizView=createQuizViewControls(renderer.domElement,camera,()=>Boolean(learningFormat.current));resetQuizView.current=quizView.reset;
    const world=buildTown(scene),fields=buildFormatFields(scene),ballReactions=createBallReactions(scene),games=createFieldRuntime(scene,ballReactions);gamesRef.current=games;
    const shadowBatches=createStaticShadowBatches(renderer,scene,window.matchMedia("(pointer: coarse)").matches);
    const shadowVisibility=createShadowVisibility(renderer,scene,sun);
    const shadowCache=createStaticShadowCache(renderer,scene,sun,!window.matchMedia("(pointer: coarse)").matches);
    coinHunt.connectCollisions(world.obstacles,world.roofObstacles);
    const ballObstacleGrid=createObstacleGrid(world.obstacles),ballRoofGrid=createObstacleGrid(world.roofObstacles),ballWallGrid=createObstacleGrid(world.walls);
    const footprint=(o:{x:number;z:number;w:number;d:number})=>`${o.x}:${o.z}:${o.w}:${o.d}`;
    const ballBuildingHeights=new Map(world.buildings.map(b=>[footprint(b),b.height]));
    const ballAboveBuilding=(o:{x:number;z:number;w:number;d:number},height:number)=>(ballBuildingHeights.get(footprint(o))??Infinity)<=height;
    const treeDebris=createTreeDebris(scene,world.assets,fieldSurfaceHeight);
    const coachPractice=createCoachPractice(scene,ballReactions);
    const chooseFieldTarget=(event:PointerEvent)=>{const s=fieldSession.current;if(!s?.quiz||s.answer!==null||quizView.blocksSelection())return;const r=renderer.domElement.getBoundingClientRect(),view=renderer.getViewport(new T.Vector4()),top=r.height-view.y-view.w;const answer=games.pickQuiz(new T.Vector2((event.clientX-r.left-view.x)/view.z*2-1,1-(event.clientY-r.top-top)/view.w*2),camera);if(answer!==undefined){tapHaptic();s.onAnswer?.(answer);}};
    renderer.domElement.addEventListener('pointerup',chooseFieldTarget);
    setMapFootprints({roads:world.roads,buildings:world.buildings});
    const liveKnockout=createLiveKnockout(scene);
    const player=createPlayer('you','home');scene.add(player.root);player.root.scale.setScalar(1.12);player.root.name='main-character';player.root.rotation.y=Math.atan2(16,33);const characterGlow=createCharacterGlow(player.root);
    const characterRay=new T.Raycaster();let hoverPoint:T.Vector2|null=null,characterHovered=false;
    const ferryGlow=createBuildingGlow(world.ferry,8.3,17.3,4.8,'ferry');
    let ferryWasHovered=false;
    const ferryHit=new T.Vector3(),pointsAtFerry=()=>characterRay.ray.intersectBox(world.ferryLockBounds,ferryHit)!==null||characterRay.ray.intersectBox(world.ferryBounds,ferryHit)!==null;
    const characterTapPoint=new T.Vector2(),characterFoot=new T.Vector3(),characterHead=new T.Vector3();
    const nearCharacter=(point:T.Vector2,touch=false)=>{
      if(!player.root.visible)return false;
      const rect=renderer.domElement.getBoundingClientRect();
      player.root.localToWorld(characterFoot.set(0,.25,0)).project(camera);player.root.localToWorld(characterHead.set(0,1.9,0)).project(camera);
      if(characterFoot.z>1||characterFoot.z< -1||characterHead.z>1||characterHead.z< -1)return false;
      const x=point.x*rect.width/2,y=point.y*rect.height/2,ax=characterFoot.x*rect.width/2,ay=characterFoot.y*rect.height/2,bx=characterHead.x*rect.width/2,by=characterHead.y*rect.height/2,dx=bx-ax,dy=by-ay;
      const t=T.MathUtils.clamp(((x-ax)*dx+(y-ay)*dy)/Math.max(1,dx*dx+dy*dy),0,1);
      return Math.hypot(x-ax-dx*t,y-ay-dy*t)<=(touch?32:24);
    };
    const trackCharacterHover=(event:PointerEvent)=>{if(event.pointerType==='touch')return;const rect=renderer.domElement.getBoundingClientRect();hoverPoint=new T.Vector2((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);};
    const clearCharacterHover=(event?:PointerEvent)=>{if(event?.relatedTarget instanceof Element&&event.relatedTarget.closest('.store-enter-prompt'))return;hoverPoint=null;renderer.domElement.style.cursor='';};
    renderer.domElement.addEventListener('pointermove',trackCharacterHover);renderer.domElement.addEventListener('pointerleave',clearCharacterHover);
    const storeHit=new T.Vector3();
    const arcadeHit=new T.Vector3();
    const pointsAtArcade=()=>characterRay.ray.intersectBox(world.arcadeBounds,arcadeHit)!==null;
    const buildingEffects=([
      {name:'store',bounds:world.storeBounds,z:-59,w:14,d:12,h:7.2},
      {name:'arcade',bounds:world.arcadeBounds,z:-59,w:14,d:12,h:6.2},
      {name:'coaches',bounds:world.coachesBounds,z:-43,w:22,d:12,h:7.5},
      {name:'museum',bounds:world.museumBounds,z:181,w:30,d:9,h:5}
    ] as const).map(({name,bounds,z,w,d,h})=>{const center=bounds.getCenter(new T.Vector3()),root=new T.Group();root.name=name+'-selection';root.position.set(center.x,0,z);scene.add(root);const glow=createBuildingGlow(root,w,d,h,name);return{glow,dispose(){glow.dispose();root.removeFromParent();}};});
    let nearMuseum=false,museumHovered=false;let buildingHoverKind='',buildingHoverUntil=0;
    const museumHit=new T.Vector3(),pointsAtMuseum=()=>characterRay.ray.intersectBox(world.museumBounds,museumHit)!==null;
    let nearStore=false,nearArcade=false,nearCoaches=false,storeHovered=false,arcadeHovered=false,coachesHovered=false;
    const coachesHit=new T.Vector3();
    const pointsAtCoaches=()=>characterRay.ray.intersectBox(world.coachesBounds,coachesHit)!==null;const storePromptPoint=new T.Vector3();
    const pointsAtStore=()=>characterRay.ray.intersectBox(world.storeBounds,storeHit)!==null;
    const livePlayerGlow=createNpcHover(scene,'live-player-hover-glow');let livePlayerHover:ReturnType<typeof games.pickPlayer>=null;
    const inspectLivePlayer=(event:PointerEvent)=>{if(fieldSession.current||lessonRef.current||mapRef.current||settingsRef.current||quizView.blocksSelection())return false;const r=renderer.domElement.getBoundingClientRect(),point=new T.Vector2((event.clientX-r.left)/r.width*2-1,1-(event.clientY-r.top)/r.height*2),hit=games.pickPlayer(point,camera,r.width,r.height,learningFormat.current,event.pointerType==='touch');if(!hit)return false;games.setHoverPaused(hit.format);setPositionSelection(hit);sound.ui('click');return true;};
    let pointerStart:{x:number;y:number}|null=null;
    const beginCharacterTap=(event:PointerEvent)=>{pointerStart={x:event.clientX,y:event.clientY};};
    const pickCharacter=(event:PointerEvent)=>{const start=pointerStart;pointerStart=null;if(!start||Math.hypot(event.clientX-start.x,event.clientY-start.y)>10||lessonRef.current||mapRef.current||settingsRef.current)return;if(inspectLivePlayer(event))return;if(fieldMenu.current)return;const rect=renderer.domElement.getBoundingClientRect();characterTapPoint.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);characterRay.setFromCamera(characterTapPoint,camera);if(characterRay.intersectObject(player.root,true).length||nearCharacter(characterTapPoint,event.pointerType==='touch')){tapHaptic();sound.ui('click');setCustomizerOpen(true);setHint(false);return;}const npc=islandNpcs.pick(characterRay)??coachPractice.pick(characterRay)??volleyballGame.pick(characterRay);if(npc){tapHaptic();sound.ui('click');openConversation(npc);setHint(false);return;}if(pointsAtFerry()){tapHaptic();sound.ui('click');setFerryOpen(true);return;}if(pointsAtMuseum()){tapHaptic();sound.ui('click');setMuseumOpen(true);return;}if(pointsAtStore()){tapHaptic();sound.ui('click');openStore();return;}if(pointsAtArcade()){tapHaptic();sound.ui('click');setArcadeOpen(true);return;}if(pointsAtCoaches()){tapHaptic();sound.ui('click');setCoachesOpen(true);}};
    renderer.domElement.addEventListener('pointerdown',beginCharacterTap);renderer.domElement.addEventListener('pointerup',pickCharacter);
    const flightMotion=createFlightMotion(),boundaryFeedback=createBoundaryFeedback();scene.add(boundaryFeedback.root);
    const jetExhaust=createJetExhaust();scene.add(jetExhaust.root);
    const splatMaterial=new T.MeshBasicMaterial({color:'#edcf94',transparent:true,opacity:0,depthWrite:false});
    const dizzyStars=new T.Group();dizzyStars.name='player-dazed-stars';scene.add(dizzyStars);
    const starShape=new T.Shape();
    for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.PI/2,r=i%2?.13:.3;i?starShape.lineTo(Math.cos(a)*r,Math.sin(a)*r):starShape.moveTo(Math.cos(a)*r,Math.sin(a)*r);}starShape.closePath();
    const starGeometry=new T.ShapeGeometry(starShape),starMaterial=new T.MeshBasicMaterial({color:'#ffdf60',side:T.DoubleSide,depthWrite:false});
    for(let i=0;i<5;i++)dizzyStars.add(new T.Mesh(starGeometry,starMaterial));
    dizzyStars.visible=false;
    const splat=new T.Mesh(new T.RingGeometry(.6,1,16),splatMaterial);splat.rotation.x=-Math.PI/2;splat.visible=false;scene.add(splat);
    const rideTrail=createRideTrail(),flightTrail=createFlightTrail();scene.add(rideTrail.root,flightTrail.root);
    const stairRidePose={height:0,pitch:0};
    const vehicle=createVehicle();scene.add(vehicle.root);vehicle.root.scale.setScalar(1.12);let appliedCustomization:CharacterCustomization|null=null;let previousRide:TravelMode='jetpack';let arrivalFacing:number|undefined=Math.atan2(16,33);
    const npcs=Array.from({length:2},(_,i)=>{const rig=createPlayer('local'+i,i%2?'away':'home');scene.add(rig.root);return rig;});
    const ballMaterial=new T.MeshStandardMaterial({color:'#f4edd3',roughness:.7});const ballAppearance=createBallAppearance(ballMaterial);const ball=new T.Mesh(new T.SphereGeometry(.19,20,16),ballMaterial);ball.castShadow=true;ball.name='player-ball';scene.add(ball);
    const patchMaterial=new T.MeshStandardMaterial({color:'#344c43',roughness:.8});
    for(const direction of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const v=new T.Vector3(...direction as [number,number,number]);const patch=new T.Mesh(new T.CircleGeometry(.078,5),patchMaterial);patch.position.copy(v.clone().multiplyScalar(.187));patch.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),v);ball.add(patch);}
    const ring=new T.Mesh(new T.RingGeometry(.48,.54,48),new T.MeshBasicMaterial({color:'#fff0b7',transparent:true,opacity:.8,side:T.DoubleSide}));ring.name='player-foot-ring';ring.rotation.x=-Math.PI/2;scene.add(ring);
    const rideChange=createRideChange();scene.add(rideChange.root);
    const guideMaterial=new T.LineDashedMaterial({color:'#e79e6b',dashSize:.35,gapSize:.22,depthTest:false});
    const guide=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(11,.16,21),new T.Vector3(11,.16,9)]),guideMaterial);guide.renderOrder=2;guide.visible=false;scene.add(guide);
    const receiveRing=new T.Mesh(new T.RingGeometry(.65,.72,48),new T.MeshBasicMaterial({color:'#b7e7a6',side:T.DoubleSide,transparent:true,opacity:.8}));receiveRing.rotation.x=-Math.PI/2;receiveRing.visible=false;scene.add(receiveRing);
    let lessonTime=0,lastLane=false;
    const setPhase=(phase:LessonPhase|null)=>{lessonRef.current=phase;setLesson(phase);lessonTime=0;};
    const location={...INITIAL_SPAWN},velocity={x:0,z:0},orb={x:INITIAL_SPAWN.x+.7,z:INITIAL_SPAWN.z,vx:0,vz:0};
    const volleyballGame=createVolleyballGame(scene,ballReactions);
    const truckReactions=createTruckReactions(scene);
    const streetTraffic=createStreetTraffic(scene,world.obstacles,world.roads);
    const rideRamps=[...planRideRamps(world.roads,world.obstacles),...planRoofRamps(world.buildings)],rampVisuals=createRideRampVisuals(rideRamps),rampMotion=createRampMotion(rideRamps,world.obstacles,world.buildings,world.walls);scene.add(rampVisuals.root);
    const rooftop=createRooftopTravel([...world.buildings,...world.walkSurfaces],world.obstacles,location,world.roofObstacles,(x,z)=>rampSurface(rideRamps,x,z));
    const islandNpcs=createIslandNpcs(scene,{isWalkable:(x,z)=>rooftop.canLand(x,z)&&Math.abs(rooftop.surface(x,z)-fieldSurfaceHeight(x,z))<.2&&!world.roads.some(road=>Math.abs(x-road.x)<road.w/2+.4&&Math.abs(z-road.z)<road.d/2+.4),heightAt:fieldSurfaceHeight},ballReactions);
    const onboardingNpcFocus=createOnboardingNpcFocus(islandNpcs),npcHover=createNpcHover(scene);
    let hoveredNpcId:string|null=null;
    const leftHand=new T.Vector3(),rightHand=new T.Vector3();
    const walkBall=createWalkBall(),ballEffects=createBallEffects(),rideTricks=createRideTricks(),jetActions=createJetpackActions(),parachute=createParachute(),sonicBurst=createSonicBurst(),parachuteTrail=createParachuteTrail(),craterEffect=createCraterEffect();scene.add(ballEffects.root,parachute.root,sonicBurst.root,parachuteTrail.root,craterEffect.root);
    const landingMarker=createLandingMarker();scene.add(landingMarker.root);
    let landingPreview:{x:number;z:number}|null=null,previewX=Infinity,previewZ=Infinity,previewAge=1;
    const flight={height:INITIAL_FLIGHT_HEIGHT,takeoffTime:1.05,startHeight:fieldSurfaceHeight(location.x,location.z),landTime:-1,landHeight:0,landing:null as {x:number;z:number}|null};
    (window as unknown as {__fi2?:unknown}).__fi2={get hudRenders(){return hudRenders.current;},positionStore,get hiddenTransforms(){return hiddenTransforms;},get renderStats(){return renderStats;},shadowCache,shadowVisibility,shadowBatches,liveKnockout,player,characterArrival,coinHunt,treeDebris,rideRamps,rampMotion,streetTraffic,volleyballGame,music:music.getState,sound:sound.debug,scene,renderer,camera,games,world,coachPractice,islandNpcs,truckReactions,walkBall,rideTricks,jetActions,ballReactions,fieldSession,fieldTravel,location,velocity,rideRef,vehicle,flight,rooftop,pendingRide,bounds:ISLAND_BOUNDS};
    const targetMovement=(target:BallHitTarget):{canMove:(nx:number,nz:number)=>boolean;move:(nx:number,nz:number)=>void}=>( {canMove:(nx,nz)=>rooftop.canLand(nx,nz)&&Math.abs(rooftop.surface(nx,nz)-target.y)<.3,move:(nx,nz)=>{const npc=islandNpcs.entries.find(e=>'npc:'+e.id===target.id);if(npc){npc.position.x=nx;npc.position.z=nz;return;}const volleyball=volleyballGame.entries.find(e=>'npc:'+e.id===target.id);if(volleyball){volleyball.position.x=nx;volleyball.position.z=nz;return;}const coach=coachPractice.entries.find(e=>'npc:'+e.id===target.id);if(coach){coach.offset.x+=nx-coach.position.x;coach.offset.z+=nz-coach.position.z;coach.position.x=nx;coach.position.z=nz;return;}for(const field of games.entries){const prefix='field:'+field.venue.id+':';if(target.id.startsWith(prefix)){const actor=field.sim.players[target.id.slice(prefix.length)];if(actor){actor.x=135+(nx-field.venue.x)/field.venue.width*250;actor.y=200+(nz-field.venue.z)/field.venue.length*380;actor.vx=actor.vy=0;}break;}}}} );
    let truckHitAge=0,lastHitTruck=-1;const lastTruckHitPosition={x:0,z:0};
    const previousLocation={...location},visualLocation={...location};
    const keys=new Set<string>(),camTarget=new T.Vector3(),lookAt=new T.Vector3();
    const jetpackBreakup=createJetpackBreakup();scene.add(jetpackBreakup.root);
    let spinCrashAge=Infinity;
    const renderStats={rendered:0,skipped:0};let resizeRevision=0,idleSince=0,idleRevision=-1,idleAppearance:CharacterCustomization|null=null,idleTimeOfDay='',idleGrace=0;
    const domCache=new Map<string,HTMLElement>();const uiElement=<E extends HTMLElement>(selector:string)=>{const previous=domCache.get(selector);if(previous?.isConnected)return previous as E;const el=parent.parentElement?.querySelector<E>(selector);if(el)domCache.set(selector,el);return el;};
    const placeUI=(el:HTMLElement,left:number,top:number)=>{const position=`${Math.round(left*2)/2}px ${Math.round(top*2)/2}px`;if(el.style.left!=='0px')el.style.left='0px';if(el.style.top!=='0px')el.style.top='0px';if(el.style.translate!==position)el.style.translate=position;};
    let hudX=NaN,hudZ=NaN,hudJuggling:boolean|undefined,signalMode='';
    let viewportW=1,viewportH=1;
    const setUIHidden=(el:HTMLElement,hidden:boolean)=>{if(el.hidden!==hidden)el.hidden=hidden;};
    let firstFrame=true,lastRendered=0,shadowElevation=0,boostLean=0,flightHeading=player.root.rotation.y;
    const coarse=window.matchMedia("(pointer: coarse)").matches;
    const pitchVisibility=createPitchVisibility(),fieldCardExit=new Map<HTMLButtonElement,number>();
    const shadowBasis=new T.Matrix4().lookAt(new T.Vector3(-288,252,198),new T.Vector3(),new T.Vector3(0,1,0));
    const shadowRight=new T.Vector3().setFromMatrixColumn(shadowBasis,0),shadowUp=new T.Vector3().setFromMatrixColumn(shadowBasis,1);
    let last=performance.now(),frame=0,elapsed=0,accumulator=0,disposed=false,lastDistrict:District='coast',lastHud=0,goalTimer=0,lastFieldCheck=-Infinity,cachedVisibleVenue:Format|null=null;
    const resetInputs=(preserveMovement=false)=>{cancelShotHold();heldRidePointers.current.clear();spinGesture.current.reset();spinRequested.current=false;if(!preserveMovement)keys.clear();input.current={x:preserveMovement?input.current.x:0,z:preserveMovement?input.current.z:0,sprint:preserveMovement&&input.current.sprint,kick:false,juggle:false};if(!preserveMovement)releaseStick();};
    const keydown=(e:KeyboardEvent)=>{sound.unlock();music.unlock();if(settingsRef.current)return;if(e.target instanceof HTMLButtonElement&&['Enter',' '].includes(e.key))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.repeat)return;if(e.key.toLowerCase()==='r'&&!fieldMenu.current&&!lessonRef.current)cycleRide();if(e.key.toLowerCase()==='e'&&nearbyNpcRef.current&&!fieldMenu.current&&!lessonRef.current&&!mapRef.current)openConversation(nearbyNpcRef.current);if(e.key.toLowerCase()==='m')setMap(v=>!v);if(e.key==='Escape')setMap(false);if(e.code==='Space'){if(streetTraffic.rider.index>=0)truckBoostRequested.current=true;else if(rideRef.current==='walk'&&!lessonRef.current&&!fieldMenu.current)beginShotHold('keyboard');else input.current.kick=true;}if(e.key.toLowerCase()==='j'&&!fieldMenu.current&&!lessonRef.current){if(streetTraffic.rider.index>=0)truckHonkRequested.current=true;else input.current.juggle=true;}};
    const keyup=(e:KeyboardEvent)=>{keys.delete(e.key.toLowerCase());if(e.code==='Space'&&shotHold.current?.id==='keyboard')finishShotHold();};
    const blur=()=>{resetInputs();sound.silence(true);};
    const visibility=()=>{sound.visibility();music.visibility();last=performance.now();accumulator=0;if(document.hidden)blur();};
    const finishJoystick=(event:PointerEvent)=>{releaseStick(event);releaseRideAction(event.pointerId);};
    const finishTouches=(event:TouchEvent)=>{if(event.touches.length===0)releaseStick();};
    window.addEventListener('pointerup',finishJoystick,true);window.addEventListener('pointercancel',finishJoystick,true);window.addEventListener('touchend',finishTouches,{passive:true});window.addEventListener('touchcancel',finishTouches,{passive:true});window.addEventListener('pagehide',blur);
    window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
    const resize=()=>{resizeRevision++;shadowCache.invalidate();const w=parent.clientWidth,h=parent.clientHeight;if(w===viewportW&&h===viewportH)return;viewportW=w;viewportH=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();fitIslandShadows(sun,camera,shadowElevation);};const observer=new ResizeObserver(resize);observer.observe(parent);window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);resize();
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function liftJetpack(dt:number){
      flight.takeoffTime=Math.min(1.05,flight.takeoffTime+dt);const t=flight.takeoffTime/1.05,q=t-1;
      const ease=reduced?t:1+1.9*q*q*q+.9*q*q;flight.height=flight.startHeight+(28-flight.startHeight)*ease;
    }
    function landingImpact(height:number){
      coinHunt.land({x:location.x,y:height,z:location.z});
      const nearby:BallHitTarget[]=[...islandNpcs.entries.map(e=>({id:'npc:'+e.id,...e.position})),...volleyballGame.entries.filter(()=>volleyballGame.root.visible).map(e=>({id:'npc:'+e.id,...e.position})),...coachPractice.entries.map(e=>({id:'npc:'+e.id,...e.position})),...games.entries.flatMap(e=>Array.from(e.rigs.entries()).filter(([,rig])=>e.root.visible&&rig.root.visible).map(([id,rig])=>({id:'field:'+e.venue.id+':'+id,x:rig.root.position.x,y:rig.root.position.y,z:rig.root.position.z})))];
      let hit=false;for(const p of nearby){const dx=p.x-location.x,dz=p.z-location.z;if(Math.abs(p.y-height)>.8||Math.hypot(dx,dz)>4)continue;const yaw=Math.hypot(dx,dz)>.05?Math.atan2(dx,dz):player.root.rotation.y;hit=ballReactions.hit(p,Math.sin(yaw)*14,Math.cos(yaw)*14)||hit;}
      if(hit){sound.impact();tapHaptic();}
    }
    let wasTruckRiding=false;let truckLanding:number|null=null;const truckApproach={x:0,z:0};
    function tick(dt:number){
      if(liveKnockout.frozen){input.current.kick=input.current.juggle=false;velocity.x=velocity.z=0;}const arenaPosition=liveKnockout.playerPosition();if(arenaPosition){location.x=arenaPosition.x;location.z=arenaPosition.z;rooftop.reset(location.x,location.z,arenaPosition.y);velocity.x=velocity.z=0;if(liveKnockout.frozen){input.current.kick=input.current.juggle=false;return;}}
      if(liveKnockout.frozen)return;

      if(cancelLanding.current){cancelLanding.current=false;if(flight.landing){flight.landing=null;flight.landTime=-1;flight.startHeight=flight.height;flight.takeoffTime=0;}}
      if(Number.isFinite(spinCrashAge)){spinCrashAge+=dt;if(rooftop.state.recovery<=0)spinCrashAge=Infinity;}
      if(spinRequested.current){spinRequested.current=false;if(coarse&&!fieldMenu.current&&!lessonRef.current&&!rooftop.state.falling&&rooftop.state.recovery<=0){
        const mode=rideRef.current;resetInputs();velocity.x=velocity.z=0;walkBall.reset({...location,y:rooftop.state.height,yaw:player.root.rotation.y});rideTricks.reset();tapHaptic();
        if(mode==='jetpack'&&jetActions.state.phase!=='fall'){jetpackBreakup.trigger(vehicle.root,reduced);sonicBurst.trigger(location.x,flight.height,location.z,0,true,'#ffb65b');rideChange.trigger(1.4);sound.impact();pendingRide.current='walk';flight.landing=null;flight.landTime=-1;jetActions.crash();}
        else if(mode!=='jetpack'){spinCrashAge=0;rooftop.state.recovery=ROOF_RECOVERY_TIME;sound.fall();}
      }}

      if(rideRef.current==='jetpack'){
        streetTraffic.rider.index=-1;
        if(requestedTruck.current!==null){truckLanding=requestedTruck.current;requestedTruck.current=null;flight.landing=null;flight.landTime=-1;}
        if(!pendingRide.current)truckLanding=null;
        if(pendingRide.current&&truckLanding===null&&!flight.landing)truckLanding=streetTraffic.landingTruckAt(location.x,location.z)?.index??null;
        if(truckLanding!==null&&pendingRide.current){
          truckExitRequested.current=false;const bed=streetTraffic.bedPoint(truckLanding);
          if(flight.landTime<0){flight.landTime=0;flight.landHeight=flight.height;truckApproach.x=location.x-bed.x;truckApproach.z=location.z-bed.z;}
          flight.landTime=Math.min(1,flight.landTime+dt);const t=flight.landTime,ease=t*t*(3-2*t);flight.height=T.MathUtils.lerp(flight.landHeight,bed.y,ease);
          location.x=bed.x+truckApproach.x*(1-ease);location.z=bed.z+truckApproach.z*(1-ease);
          velocity.x=velocity.z=0;
          if(t>=1){streetTraffic.touchdown(truckLanding);truckLanding=null;pendingRide.current=null;flight.landing=null;flight.landTime=-1;rideRef.current='walk';setRideMode('walk');rooftop.reset(bed.x,bed.z,bed.y);sound.ball('bounce');}
          return;
        }
        if(!flight.landing&&!pendingRide.current&&flight.takeoffTime>=1.05){
          if(input.current.kick&&jetActions.state.phase==='idle'){jetActions.start(0,flight.height,player.root.rotation.y,null);sonicBurst.trigger(location.x,flight.height,location.z,player.root.rotation.y,false,FLIGHT_TRAIL_COLORS[customizationRef.current.jetpack],customizationRef.current.jetpack==='classic',customizationRef.current.jetpack);sound.boost();}
          if(input.current.juggle)jetActions.start(1,flight.height,player.root.rotation.y,rooftop.findLanding(location.x,location.z));
        }
        input.current.kick=input.current.juggle=false;
        if(jetActions.state.phase==='parachute'&&pendingRide.current)jetActions.cut();
        if(jetActions.state.phase!=='idle'){
          const sx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+input.current.x,sy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+input.current.z;
          const phase=jetActions.state.phase,oldX=location.x,oldZ=location.z,result=jetActions.update(dt,location,flight.height,{blocked:(x,z)=>flightBlocked(x,z)||(jetActions.state.phase==='parachute'&&rooftop.surface(x,z)>flight.height-1),floor:rooftop.surface,steer:{x:sx*.857+sy*.515,z:-sx*.515+sy*.857},findLanding:rooftop.findLanding});flight.height=result.height;
          if(phase==='charge'&&jetActions.state.phase==='blast'){sonicBurst.trigger(location.x,flight.height,location.z,0,true,FLIGHT_TRAIL_COLORS[customizationRef.current.jetpack],false,customizationRef.current.jetpack);sound.boost('up');}
          velocity.x=(location.x-oldX)/dt;velocity.z=(location.z-oldZ)/dt;
          if(result.landed){
            // Validate every touchdown, including falls onto props, roof edges and stairs.
            if(!rooftop.canLand(location.x,location.z)){const safe=rooftop.findLanding(location.x,location.z);if(!safe){flight.height=result.height+2;return;}location.x=safe.x;location.z=safe.z;result.height=rooftop.surface(safe.x,safe.z);flight.height=result.height;}
            landingImpact(result.height);const mode=pendingRide.current??'walk';pendingRide.current=null;rideRef.current=mode;setRideMode(mode);flight.landing=null;flight.landTime=-1;rooftop.reset(location.x,location.z,result.height);if(result.crashed){craterEffect.trigger(location.x,result.height,location.z);rooftop.state.recovery=ROOF_RECOVERY_TIME;sound.impact();if(!reduced)navigator.vibrate?.([45,30,65]);}velocity.x=velocity.z=0;}
          orb.x=location.x+.7;orb.z=location.z;return;
        }
        if(pendingRide.current&&!flight.landing){
          flight.landing=rooftop.findLanding(location.x,location.z);
        }
        const target=flight.landing;
        if(target){
          if(!rooftop.canLand(target.x,target.z)){flight.landing=null;flight.landTime=-1;return;}
          const dx=target.x-location.x,dz=target.z-location.z,d=Math.hypot(dx,dz);
          if(d>.1){liftJetpack(dt);if(flight.takeoffTime>=1.05){const step=Math.min(d,dt*20);location.x+=dx/d*step;location.z+=dz/d*step;}}
          else{location.x=target.x;location.z=target.z;const floor=rooftop.surface(target.x,target.z);
            if(flight.landTime<0){flight.landTime=0;flight.landHeight=flight.height;}
            flight.landTime=Math.min(.95,flight.landTime+dt);const t=flight.landTime/.95;
            if(reduced)flight.height=T.MathUtils.lerp(flight.landHeight,floor,t);
            else if(t<.72){const u=t/.72;flight.height=T.MathUtils.lerp(flight.landHeight,floor,u*u*(3-2*u));}
            else flight.height=floor+Math.sin((t-.72)/.28*Math.PI)*.65;
            if(t>=1){landingImpact(floor);flight.height=floor;const mode=pendingRide.current??'walk';pendingRide.current=null;flight.landing=null;rideRef.current=mode;setRideMode(mode);rooftop.reset(location.x,location.z,floor);}}

          velocity.x=velocity.z=0;return;
        }
        liftJetpack(dt);
        if(flight.takeoffTime<1.05){velocity.x=velocity.z=0;return;}
        const sx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+input.current.x,sy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+input.current.z;
        const ix=sx*.857+sy*.515,iz=-sx*.515+sy*.857,len=Math.hypot(ix,iz);
        if(len>.01){const nx=ix/len,nz=iz/len;if(flightBlocked(location.x+nx*1.2,location.z+nz*1.2)){sound.boundary();boundaryFeedback.hit(location.x+nx*.8,flight.height,location.z+nz*.8,-nx,-nz,Math.max(.7,Math.hypot(velocity.x,velocity.z)/25));}}
        stepPlayer(location,velocity,{x:ix,z:iz,sprint:false},dt,[],'jetpack');orb.x=location.x+.7;orb.z=location.z;return;
      }

      const phase=lessonRef.current;
      if(phase){
        lessonTime+=dt;
        if(phase==='watch'){
          const t=T.MathUtils.smoothstep(lessonTime,1,3.5);location.x=11-6*t;location.z=9;
          const pass=T.MathUtils.smoothstep(lessonTime,3.8,5);orb.x=T.MathUtils.lerp(PASSER.x,location.x,pass);orb.z=T.MathUtils.lerp(PASSER.z,location.z,pass);
          if(lessonTime>6){location.x=11;location.z=9;orb.x=PASSER.x;orb.z=PASSER.z;setPhase('practice');}
          return;
        }
        if(phase==='passing'){const t=Math.min(1,lessonTime/1.15);orb.x=T.MathUtils.lerp(PASSER.x,location.x,t);orb.z=T.MathUtils.lerp(PASSER.z,location.z,t);if(t===1)setPhase('complete');return;}
        if(phase!=='practice')return;
      }
      const sx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+input.current.x;
      const sy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+input.current.z;
      // Screen-relative controls follow the fixed camera heading.
      const ix=sx*.857+sy*.515,iz=-sx*.515+sy*.857;
      if(streetTraffic.rider.index>=0){
        const index=streetTraffic.rider.index,bed=streetTraffic.bedPoint(index);
        if(truckExitRequested.current){
          truckExitRequested.current=false;
          const yaw=streetTraffic.cars[index].group.rotation.y;let exit=null;
          findExit:for(const radius of [3.5,4.5,5.5])for(const angle of [yaw+Math.PI/2,yaw-Math.PI/2,yaw+Math.PI,yaw]){const x=bed.x+Math.sin(angle)*radius,z=bed.z+Math.cos(angle)*radius;if(rooftop.canLand(x,z)&&rooftop.surface(x,z)<1){exit={x,z};break findExit;}}
          if(exit){truckExitRequested.current=false;streetTraffic.rider.index=-1;location.x=exit.x;location.z=exit.z;rooftop.reset(exit.x,exit.z);sound.stair('walk','down');}
        }
        // A held thumb or blocked exit stays attached instead of colliding with the truck.
        if(streetTraffic.rider.index>=0){location.x=bed.x;location.z=bed.z;rooftop.reset(bed.x,bed.z,bed.y);velocity.x=velocity.z=0;orb.x=bed.x;orb.z=bed.z;return;}
      }
      const wasFalling=rooftop.state.falling;
      const moveLength=Math.hypot(ix,iz);
      if(moveLength>.01&&!rooftop.state.falling&&rooftop.state.recovery===0&&blocked(location.x+ix/moveLength*.65,location.z+iz/moveLength*.65,[],0))sound.boundary();
      if((walkBall.state.mode==='windup'||parachute.covering())&&rideRef.current==='walk')velocity.x=velocity.z=0;
      if(rideRef.current==='walk'&&walkBall.state.mode==='windup'&&walkBall.state.age<SHOT_WINDUP*.55&&!rooftop.state.falling&&rooftop.state.recovery===0){
        const dx=Math.sin(walkBall.state.yaw)*2.8,dz=Math.cos(walkBall.state.yaw)*2.8,nx=location.x+dx*dt,nz=location.z+dz*dt;
        if(rooftop.canLand(nx,nz)&&Math.abs(rooftop.surface(nx,nz)-rooftop.state.height)<.35){velocity.x=dx;velocity.z=dz;}
      }
      const stairBefore=rooftop.state.height;
      const rampBefore={...location},rampStep=rampMotion.update(dt,location,velocity,rideRef.current,reduced);
      if(!rampStep.owns)rooftop.update(dt,location,velocity,{x:walkBall.state.mode==='windup'||parachute.covering()?0:ix,z:walkBall.state.mode==='windup'||parachute.covering()?0:iz,sprint:input.current.sprint||keys.has('shift')},rideRef.current);
      const stairDelta=rooftop.state.height-stairBefore;
      if(!rampStep.owns&&!wasFalling&&!rooftop.state.falling&&rooftop.state.recovery===0&&Math.abs(stairDelta)>.01&&Math.abs(stairDelta)<=1&&world.walkSurfaces.some(s=>Math.abs(location.x-s.x)<=s.w/2+.1&&Math.abs(location.z-s.z)<=s.d/2+.5))sound.stair(rideRef.current,stairDelta>0?'up':'down');
      if(rampStep.crashed){resetInputs();rideTricks.reset();sound.impact();if(!reduced)navigator.vibrate?.([25,30,35]);}
      if(rampStep.recovered){const landingRamp=rideRamps.find(r=>r.landingOnly);if(landingRamp){for(const distance of [.6,1.2,1.8,2.4,3.2]){const x=location.x-Math.sin(landingRamp.yaw)*distance,z=location.z-Math.cos(landingRamp.yaw)*distance;if(rooftop.canLand(x,z)&&rooftop.surface(x,z)<.5){location.x=x;location.z=z;break;}}}rooftop.reset(location.x,location.z);rooftop.state.recovery=1.8;velocity.x=velocity.z=0;resetInputs();}
      if(rampStep.landed){if(rampMotion.state.ramp?.cannon)recordExploreActivity('ramp');coinHunt.land({x:location.x,y:rooftop.surface(location.x,location.z),z:location.z});rooftop.reset(location.x,location.z);sound.ball('bounce');if(!reduced)navigator.vibrate?.(18);}
      if(!rampStep.owns&&!rooftop.state.falling&&rooftop.state.recovery===0&&rampMotion.enter(rampBefore,location,velocity,rideRef.current,rooftop.state.height)){rooftop.reset(location.x,location.z,rampMotion.state.ramp?.base??0);rideTricks.reset();sound.boost('forward');}
      if(!wasFalling&&rooftop.state.falling)sound.fall();
      if(rooftop.state.impact){coinHunt.land({x:location.x,y:rooftop.state.height,z:location.z});sound.impact();}
      if(rooftop.state.impact&&!reduced)navigator.vibrate?.([45,30,65]);
      if(phase==='practice'){
        location.x=T.MathUtils.clamp(location.x,3.8,18.2);location.z=T.MathUtils.clamp(location.z,6,12);
        const lane=passingLane(location);
        if(input.current.kick){if(lane.open){velocity.x=velocity.z=0;setCoachFeedback('');setPhase('passing');}else setCoachFeedback('That pass would meet the defender. Move farther to either side, then call again.');input.current.kick=false;}
        return;
      }
      if(liveKnockout.frozen)return;
      if(liveKnockout.joined){if(input.current.kick){if(liveKnockout.kick(player.root.rotation.y))sound.ball('kick');input.current.kick=false;input.current.shotPower=0;}input.current.juggle=false;walkBall.reset({...location,y:rooftop.state.height,yaw:player.root.rotation.y});return;}
      const ballPlayer={...location,y:rooftop.state.height,yaw:player.root.rotation.y};
      if(rideRef.current!=='walk'){if(rampMotion.state.phase==='idle'&&input.current.kick)rideTricks.start(rideRef.current,0);if(rampMotion.state.phase==='idle'&&input.current.juggle)rideTricks.start(rideRef.current,1);input.current.kick=input.current.juggle=false;walkBall.reset(ballPlayer);orb.x=location.x+.7;orb.z=location.z;orb.vx=orb.vz=0;return;}
      goalTimer=Math.max(0,goalTimer-dt);
      const nearbyWalls=ballWallGrid.query(ballPlayer.x,ballPlayer.z,8).filter(w=>w.floor<=ballPlayer.y+.4&&w.top>ballPlayer.y+1.15&&Math.abs(ballPlayer.x-w.x)<=w.w/2+8&&Math.abs(ballPlayer.z-w.z)<=w.d/2+8);
      const wallTarget=(input.current.juggle||walkBall.state.mode==='juggle'||walkBall.state.mode==='wall-juggle')?findWallJuggleTarget(ballPlayer,ballPlayer.yaw,(x,z)=>nearbyWalls.find(w=>Math.abs(x-w.x)<=w.w/2&&Math.abs(z-w.z)<=w.d/2)?.top??false,walkBall.state.mode==='wall-juggle'):null;
      if(input.current.juggle&&!rooftop.state.falling)walkBall.juggle(ballPlayer,wallTarget??undefined);
      walkBall.updateWallTarget(ballPlayer,wallTarget??undefined);
      const targets:BallHitTarget[]=[...islandNpcs.entries.map(e=>({id:'npc:'+e.id,...e.position})),...volleyballGame.entries.filter(()=>volleyballGame.root.visible).map(e=>({id:'npc:'+e.id,...e.position})),...coachPractice.entries.map(e=>({id:'npc:'+e.id,...e.position})),...games.entries.flatMap(e=>Array.from(e.rigs.entries()).filter(([,rig])=>e.root.visible&&rig.root.visible).map(([id,rig])=>({id:'field:'+e.venue.id+':'+id,x:rig.root.position.x,y:rig.root.position.y,z:rig.root.position.z})))];
      const ballAway=walkBall.state.mode==='shot'||walkBall.state.mode==='return';
      if(!liveKnockout.joined&&input.current.charging&&!rooftop.state.falling&&walkBall.state.mode!=='charging'&&(!ballAway||shotHold.current&&performance.now()-shotHold.current.start>180)){if(ballAway)walkBall.reset(ballPlayer);walkBall.beginCharge(ballPlayer,ballPlayer.yaw);}
      if(walkBall.state.mode==='charging'&&!input.current.charging&&!input.current.kick)walkBall.reset(ballPlayer);
      if(input.current.kick&&ballAway&&(input.current.shotPower??0)===0){walkBall.reset(ballPlayer);}
      if(input.current.kick&&!rooftop.state.falling){
        const obstacles=world.obstacles.filter(o=>!ballAboveBuilding(o,ballPlayer.y+.5));
        const yaw=coinHunt.aim(ballPlayer,ballPlayer.yaw,(x,z)=>!blocked(x,z,obstacles,.2)&&rooftop.surface(x,z)<=ballPlayer.y+.6)??assistedShotYaw(ballPlayer,ballPlayer.yaw,targets.filter(t=>!ballReactions.get(t.id)),(x,z)=>!blocked(x,z,obstacles,.2)&&rooftop.surface(x,z)<=ballPlayer.y+.6);walkBall.shoot(ballPlayer,(input.current.shotPower??0)>0?ballPlayer.yaw:yaw,input.current.shotPower??0);input.current.shotPower=0;
      }
      input.current.kick=input.current.juggle=false;
      const previousBall={x:walkBall.state.x,z:walkBall.state.z};

      walkBall.update(dt,ballPlayer,{
        juggleHead:player.juggleHead,
        moving:Math.hypot(velocity.x,velocity.z)>.15||Math.hypot(input.current.x,input.current.z)>.1,
        ballStyle:customizationRef.current.ball,
        floor:rooftop.surface,
        blocked:(x,z,y)=>{if((walkBall.state.mode==='shot'||walkBall.state.mode==='wall-juggle')&&coinHunt.hit(x,y,z,walkBall.state.vx,walkBall.state.vz))return false;const collision=blocked(x,z,ballObstacleGrid.query(x,z,.19).filter(o=>!ballAboveBuilding(o,y+.05)),.19)||ballRoofGrid.query(x,z,.19).some(o=>y>o.floor&&y<o.top+.2&&Math.abs(x-o.x)<o.w/2+.19&&Math.abs(z-o.z)<o.d/2+.19);if(collision&&(walkBall.state.mode==='shot'||walkBall.state.mode==='wall-juggle')){treeDebris.hit(x,y,z,Math.hypot(walkBall.state.vx,walkBall.state.vz),reduced);world.umbrellaReaction.hit(x,y,z,Math.hypot(walkBall.state.vx,walkBall.state.vz),reduced);}return collision;},
        hit:(x,y,z,vx,vz)=>{if(world.umbrellaReaction.hit(x,y,z,Math.hypot(vx,vz),reduced))return true;if(coinHunt.hit(x,y,z,vx,vz))return true;const target=targets.find(t=>!ballReactions.get(t.id)&&y>=t.y-.1&&y<=t.y+1.9&&Math.hypot(x-t.x,z-t.z)<.9);if(!target)return false;return recordExploreKnockover(ballReactions.hit(target,vx,vz,customizationRef.current.ball,targetMovement(target)));},
        impact:(x,y,z)=>{ballEffects.impact(x,y,z);sound.ball('bounce');},strike:()=>{sound.ball('kick');if(walkBall.state.mode==='shot')ballEffects.launch(walkBall.state.x,walkBall.state.y,walkBall.state.z,walkBall.state.charge);},receive:()=>sound.ball('receive')
      });
      Object.assign(orb,{x:walkBall.state.x,z:walkBall.state.z,vx:walkBall.state.vx,vz:walkBall.state.vz});
      if(goalTimer===0&&walkBall.state.mode==='shot'&&VENUES.some(v=>[-1,1].some(side=>{const plane=v.z+side*v.length/2;if((previousBall.z-plane)*side>=0||(orb.z-plane)*side<0||Math.abs(walkBall.state.y-(v.elevation??0))>v.goalHeight)return false;const t=(plane-previousBall.z)/(orb.z-previousBall.z);return Math.abs(previousBall.x+(orb.x-previousBall.x)*t-v.x)<v.goalWidth/2-.1;}))){setGoals(n=>n+1);setScored(true);goalTimer=2.5;walkBall.recall();}
      if(goalTimer===0)setScored(false);
    }
    function animate(now:number){
      if(disposed||isVideoPlaying()){last=now;accumulator=0;return;}frame=requestAnimationFrame(animate);
      if(document.hidden){last=now;return;}
      const paused=(mapRef.current||settingsRef.current)&&!onboardingRef.current;
      if(!paused){idleSince=0;idleTimeOfDay=timeRef.current;}else{
        if(!idleSince||idleRevision!==resizeRevision||idleAppearance!==customizationRef.current||idleTimeOfDay!==timeRef.current){idleGrace=idleTimeOfDay!==timeRef.current?3000:0;idleSince=now;idleRevision=resizeRevision;idleAppearance=customizationRef.current;idleTimeOfDay=timeRef.current;}
        if(now-idleSince>idleGrace){last=now;accumulator=0;renderStats.skipped++;return;}
      }
      if(coarse&&now-lastRendered<1000/30-1)return;
      lastRendered=coarse?now-Math.max(0,(now-lastRendered)%(1000/30)):now;
      const ms=now-last;last=now;
      const dt=Math.max(0,Math.min(ms/1000,.05)),active=!mapRef.current&&!settingsRef.current;
      coinHunt.update(dt,{x:location.x,y:rideRef.current==='jetpack'?flight.height:rooftop.state.height+rampMotion.state.lift,z:location.z},active&&!fieldMenu.current&&!lessonRef.current,reduced,rampMotion.state.phase==='air'?rampMotion.state.ramp?.id??null:null,jetActions.state.phase==='parachute');
      world.umbrellaReaction.update(active&&!fieldMenu.current?dt:0,reduced);
      treeDebris.update(active&&!fieldMenu.current?dt:0,!fieldMenu.current&&!lessonRef.current,reduced);
      ballReactions.update(active&&!fieldMenu.current?dt:0,camera,reduced,!fieldMenu.current&&!lessonRef.current);
      lighting.update(timeRef.current,dt,reduced);if(signalMode!==timeRef.current){signalMode=timeRef.current;world.updateTrafficSignals(timeRef.current);}
      streetTraffic.root.visible=!fieldMenu.current&&!lessonRef.current;
      if(truckBoostRequested.current){truckBoostRequested.current=false;if(streetTraffic.rider.index>=0)streetTraffic.boost();}
      if(truckHonkRequested.current){truckHonkRequested.current=false;if(streetTraffic.rider.index>=0)sound.honk();}
      const driveX=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+input.current.x,driveZ=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+input.current.z;
      if(streetTraffic.root.visible)streetTraffic.update(active?dt:0,{x:location.x,y:rideRef.current==='jetpack'?flight.height:rooftop.state.height+rampMotion.state.lift,z:location.z},{drive:{x:driveX*.857+driveZ*.515,z:-driveX*.515+driveZ*.857},vx:rooftop.state.recovery>0?0:velocity.x,vz:rooftop.state.recovery>0?0:velocity.z,reduced,onCrash:()=>{resetInputs();velocity.x=velocity.z=0;rideTricks.reset();rampMotion.reset();spinCrashAge=0;rooftop.state.recovery=ROOF_RECOVERY_TIME;sound.impact();tapHaptic();}});
      const hitTruck=streetTraffic.rider.index>=0?streetTraffic.cars[streetTraffic.rider.index]:null;
      if(!hitTruck||!active||fieldMenu.current||Math.abs(hitTruck.driveSpeed)<1){lastHitTruck=-1;truckHitAge=0;}
      else{
        if(lastHitTruck!==hitTruck.index){lastHitTruck=hitTruck.index;lastTruckHitPosition.x=hitTruck.group.position.x;lastTruckHitPosition.z=hitTruck.group.position.z;truckHitAge=.1;}
        truckHitAge+=dt;
        if(truckHitAge>=.1){truckHitAge=0;const position=hitTruck.group.position,yaw=hitTruck.group.rotation.y;
          let collision=false;
          const strike=(target:BallHitTarget)=>{
            if(ballReactions.get(target.id)||!truckHitsCharacter(lastTruckHitPosition,position,yaw,target))return;
            const movement=targetMovement(target);
            movement.canMove=(x,z)=>!blocked(x,z,ballObstacleGrid.query(x,z,.4).filter(o=>!o.dynamic),.4)&&Math.abs(rooftop.surface(x,z)-target.y)<.3;
            if(ballReactions.hit(target,Math.sin(yaw)*hitTruck.driveSpeed,Math.cos(yaw)*hitTruck.driveSpeed,'sunset',movement,'truck')){collision=true;sound.impact();}
          };
          for(const e of islandNpcs.entries)strike({id:'npc:'+e.id,...e.position});
          for(const e of volleyballGame.entries)if(volleyballGame.root.visible)strike({id:'npc:'+e.id,...e.position});
          for(const e of coachPractice.entries)strike({id:'npc:'+e.id,...e.position});
          for(const e of games.entries)if((e.venue.elevation??0)<1&&Math.abs(e.venue.x-position.x)<e.venue.width/2+8&&Math.abs(e.venue.z-position.z)<e.venue.length/2+8)for(const token of e.liveFrame.tokens){const p=e.sim.players[token.id];strike({id:'field:'+e.venue.id+':'+token.id,x:e.venue.x+(p.x-135)/250*e.venue.width,y:.105,z:e.venue.z+(p.y-200)/380*e.venue.length});}
          if(collision){
            const witnesses:{root:T.Object3D;id?:string}[]=[];
            const add=(root:T.Object3D,id?:string)=>{if(!root.visible||Math.hypot(root.position.x-position.x,root.position.z-position.z)>19||Math.abs(root.position.y-position.y)>2||witnesses.some(w=>w.root.position.distanceTo(root.position)<5))return;witnesses.push({root,id});};
            for(const e of games.entries)for(const [id,rig] of e.rigs)if(!ballReactions.get('field:'+e.venue.id+':'+id))add(rig.root);
            for(const e of islandNpcs.entries)if(!ballReactions.get('npc:'+e.id))add(e.rig.root,e.id);
            if(truckReactions.trigger(witnesses.slice(0,3).map(w=>({root:w.root,context:w.id?'island' as const:'match' as const}))))for(const witness of witnesses.slice(0,3))if(witness.id)islandNpcs.reactToTruck(witness.id,position.x,position.z);
          }
          lastTruckHitPosition.x=position.x;lastTruckHitPosition.z=position.z;
        }
      }
      truckReactions.update(active&&!fieldMenu.current?dt:0,reduced,!fieldMenu.current&&!lessonRef.current);
      if(streetTraffic.rider.index>=0&&rideRef.current!=='jetpack'){const bed=streetTraffic.bedPoint(streetTraffic.rider.index);location.x=bed.x;location.z=bed.z;rooftop.reset(bed.x,bed.z,bed.y);}
      for(const index of [7,8])coinHunt.moveTruck(index,streetTraffic.bedPoint(index),streetTraffic.rider.index===index);
      if(settingsRef.current!==wasSettingsOpen){resetInputs();wasSettingsOpen=settingsRef.current;}
      // Keep the approved resolution steady; reduce repeated work instead of lowering graphics.
      if(lessonCommand.current&&rideRef.current!=='jetpack'){
        const command=lessonCommand.current;lessonCommand.current=null;resetInputs();velocity.x=velocity.z=orb.vx=orb.vz=0;
        if(command==='exit'){setPhase(null);location.x=-7;location.z=14;orb.x=-6.3;orb.z=14;}else{setPhase(command);location.x=11;location.z=9;orb.x=PASSER.x;orb.z=PASSER.z;setCoachFeedback('');}
      }
      if(fieldTravel.current){streetTraffic.rider.index=-1;rampMotion.reset();arrivalFacing=Math.atan2(16,33);player.root.rotation.y=arrivalFacing;characterArrival.restart();const v=venueById(fieldTravel.current),p=venueEntrance(v);location.x=p.x;location.z=p.z;velocity.x=velocity.z=0;orb.x=p.x+.7;orb.z=p.z;orb.vx=orb.vz=0;fieldTravel.current=null;rooftop.reset(p.x,p.z);camera.position.set(p.x+18,23+fieldSurfaceHeight(p.x,p.z),p.z+30);resetInputs();}
      if(travel.current){streetTraffic.rider.index=-1;rampMotion.reset();arrivalFacing=Math.atan2(16,33);player.root.rotation.y=arrivalFacing;characterArrival.restart();const target=travel.current==='square'?ARCADE_DOOR:travel.current==='coaches'?COACHES_DOOR:travel.current==='store'?STORE_DOOR:DISTRICTS[travel.current];location.x=target.x;location.z=target.z;velocity.x=velocity.z=0;orb.x=target.x+.7;orb.z=target.z;orb.vx=orb.vz=0;travel.current=null;rooftop.reset(target.x,target.z);camera.position.set(target.x+18,23+fieldSurfaceHeight(target.x,target.z),target.z+30);resetInputs();}
      if(previousRide!==rideRef.current){rampMotion.reset();rideChange.trigger(({walk:1,scooter:1.65,bike:2.15,moped:2.3,jetpack:1.4} as const)[rideRef.current]*.54);jetActions.reset();sound.ride(rideRef.current);if(rideRef.current==='jetpack'){flightMotion.reset();flight.height=rooftop.state.height;flight.startHeight=flight.height;flight.takeoffTime=0;flight.landTime=-1;flight.landing=null;}velocity.x=velocity.z=0;walkBall.reset({...location,y:rooftop.state.height,yaw:player.root.rotation.y});resetInputs(true);previousRide=rideRef.current;}
      if(Math.hypot(location.x-visualLocation.x,location.z-visualLocation.z)>3){previousLocation.x=location.x;previousLocation.z=location.z;accumulator=0;}
      if(fieldMenu.current){if(!wasLearning)resetInputs();velocity.x=velocity.z=0;accumulator=0;previousLocation.x=location.x;previousLocation.z=location.z;}
      if(active){elapsed+=dt;if(!fieldMenu.current){accumulator+=dt;while(accumulator>=1/60){previousLocation.x=location.x;previousLocation.z=location.z;tick(1/60);accumulator-=1/60;}}}
      else{accumulator=0;velocity.x=velocity.z=0;input.current.kick=false;}
      if(wasTruckRiding!==(streetTraffic.rider.index>=0)){wasTruckRiding=streetTraffic.rider.index>=0;setTruckRiding(wasTruckRiding);}
      sound.truck(streetTraffic.rider.index>=0?streetTraffic.cars[streetTraffic.rider.index].driveSpeed:0,active&&!fieldMenu.current&&!lessonRef.current&&streetTraffic.rider.index>=0);
      sound.move(rideRef.current,Math.hypot(velocity.x,velocity.z),active&&!fieldMenu.current&&!lessonRef.current&&!['parachute','fall'].includes(jetActions.state.phase)&&(rideRef.current==='jetpack'||!rooftop.state.falling&&rooftop.state.recovery===0));
      const blend=accumulator*60;
      visualLocation.x=active?T.MathUtils.lerp(previousLocation.x,location.x,blend):location.x;visualLocation.z=active?T.MathUtils.lerp(previousLocation.z,location.z,blend):location.z;
      if(appliedCustomization!==customizationRef.current){appliedCustomization=customizationRef.current;player.setAppearance(appliedCustomization);vehicle.setCustomization(appliedCustomization);ballAppearance.setStyle(appliedCustomization.ball);}
      player.root.visible=!fieldMenu.current;ring.visible=!fieldMenu.current&&rideRef.current!=='jetpack';ball.visible=!fieldMenu.current&&rideRef.current==='walk';
      if(Math.hypot(velocity.x,velocity.z)>.1)arrivalFacing=undefined;
      const flightPose=rideRef.current==='jetpack'?flightMotion.update(active?dt:0,elapsed,velocity.x,velocity.z,flightHeading,flight.landTime>=0?'landing':flight.takeoffTime<1.05?'takeoff':'cruise',flight.landTime>=0?flight.landTime/.95:flight.takeoffTime/1.05,reduced):undefined;
      if(rooftop.state.falling||rooftop.state.recovery>0)rideTricks.reset();
      const groundVariant=rideRef.current==='scooter'||rideRef.current==='bike'||rideRef.current==='moped'?customizationRef.current[rideRef.current]:'classic';
      const trickPose=rideTricks.update(active?dt:0,rideRef.current,reduced,groundVariant,keys.has(rideTricks.state.action===0?' ':'j')||Array.from(heldRidePointers.current.values()).some(hold=>hold.action===rideTricks.state.action));
      trickPose.pitch+=rampMotion.state.trickPitch;trickPose.roll+=rampMotion.state.trickRoll;trickPose.yaw+=rampMotion.state.trickYaw;trickPose.lift+=rampMotion.state.lift;trickPose.pitch+=rampMotion.state.pitch*(reduced?.3:1);trickPose.roll+=rampMotion.state.roll*(reduced?.2:1);trickPose.yaw+=rampMotion.state.yaw*(reduced?.2:1);rampVisuals.root.visible=!fieldMenu.current;rampVisuals.update(rampMotion.state,reduced);
      if(flightPose){if(jetActions.state.phase==='charge'){flightPose.compression=.26*Math.min(1,jetActions.state.age/.65);flightPose.thrust=1.5;}if(jetActions.state.phase==='blast'){flightPose.thrust=2.6;flightPose.pitch=-.15;flightPose.compression=.07;}if(jetActions.state.phase==='dash')flightPose.thrust=2.2;boostLean=T.MathUtils.damp(boostLean,jetActions.state.phase==='dash'?(reduced?.6:1.25):0,jetActions.state.phase==='dash'?22:12,active?dt:0);flightPose.pitch=Math.max(flightPose.pitch,boostLean);}
      const steppingBack=rideRef.current==='walk'&&walkBall.state.mode==='charging'&&walkBall.state.age>.18&&walkBall.state.age<.65,steppingIn=rideRef.current==='walk'&&walkBall.state.mode==='windup'&&walkBall.state.age<SHOT_WINDUP*.55;
      player.update(visualLocation.x,visualLocation.z,active?dt:0,elapsed,reduced,{truckRiding:streetTraffic.rider.index>=0,truckSpeed:streetTraffic.rider.index>=0?streetTraffic.cars[streetTraffic.rider.index].driveSpeed:0,turnSmoothing:jetActions.state.phase==='parachute'?3:undefined,juggleTouch:walkBall.state.mode==='juggle'?walkBall.state.juggleTouch:'foot',parachute:jetActions.state.phase==='parachute',wallSplat:rampMotion.state.phase==='splat',mopedStand:trickPose.stand,mopedSuperman:reduced?0:rampMotion.state.trickStretch,flyingCar:['flying-car','mini-plane'].includes(customizationRef.current.jetpack),rocketboard:customizationRef.current.jetpack==='rocketboard',rooftopPose:jetActions.state.phase==='fall'?(jetActions.state.age<.65?'hang':'fall'):rideRef.current==='jetpack'?undefined:rooftop.state.falling?(rooftop.state.hangTime>0?'hang':'fall'):rooftop.state.recovery>0?'dizzy':undefined,flight:flightPose,facing:streetTraffic.rider.index>=0?streetTraffic.cars[streetTraffic.rider.index].group.rotation.y:rideRef.current==='walk'&&(walkBall.state.mode==='windup'||walkBall.state.kick>0)?walkBall.state.yaw:arrivalFacing,travelMode:rideRef.current,shotStep:steppingBack?(walkBall.state.age-.18)/.47:steppingIn?walkBall.state.age/(SHOT_WINDUP*.55):undefined,shotPower:walkBall.state.charge,shotCharge:rideRef.current==='walk'&&walkBall.state.mode==='charging'?walkBall.state.charge:undefined,powerKick:rideRef.current==='walk'&&(walkBall.state.mode==='windup'||walkBall.state.mode==='shot'&&walkBall.state.kick>0),dribbling:liveKnockout.joined?liveKnockout.hasBall:rideRef.current==='walk'&&Math.hypot(orb.x-visualLocation.x,orb.z-visualLocation.z)<1.3,kick:rideRef.current==='walk'?(liveKnockout.joined?liveKnockout.kickPose:walkBall.state.kick):undefined,juggle:rideRef.current==='walk'&&(walkBall.state.mode==='juggle'||walkBall.state.mode==='wall-juggle'&&(walkBall.state.wallPhase==='receive'||walkBall.state.wallPhase==='kick'))?walkBall.state.jugglePhase:undefined,kickSide:walkBall.state.juggleSide});
      flightHeading=player.root.rotation.y;
      vehicle.update(rideRef.current,visualLocation.x,visualLocation.z,player.root.rotation.y,active?dt:0,Math.hypot(velocity.x,velocity.z),flightPose);vehicle.root.visible=vehicle.root.visible&&!fieldMenu.current&&(customizationRef.current.jetpack==='ironman'||!['parachute','fall'].includes(jetActions.state.phase));
      let groundY=rooftop.state.height;let ridePitch=0;
      if(rideRef.current!=='walk'&&rideRef.current!=='jetpack'&&!rooftop.state.falling&&groundY<=fieldSurfaceHeight(visualLocation.x,visualLocation.z)+.2){const yaw=player.root.rotation.y,front=(rideRef.current==='scooter'?.5:.62)*1.12,rear=(rideRef.current==='scooter'?.4:.53)*1.12;const hf=fieldSurfaceHeight(visualLocation.x+Math.sin(yaw)*front,visualLocation.z+Math.cos(yaw)*front),hr=fieldSurfaceHeight(visualLocation.x-Math.sin(yaw)*rear,visualLocation.z-Math.cos(yaw)*rear);ridePitch=Math.atan2(hr-hf,front+rear);groundY=(hf*rear+hr*front)/(front+rear)+.005;}
      if(rideRef.current!=='walk'&&rideRef.current!=='jetpack'&&!rooftop.state.falling&&groundY>fieldSurfaceHeight(visualLocation.x,visualLocation.z)+.2&&rampMotion.state.phase==='idle'&&streetTraffic.rider.index<0){rideSurfacePose(rideRef.current,visualLocation.x,visualLocation.z,player.root.rotation.y,rooftop.state.height,rooftop.surface,stairRidePose);ridePitch=stairRidePose.pitch;groundY=stairRidePose.height;}
      if(rideRef.current==='jetpack')groundY=flight.height;
      player.root.rotation.order='YXZ';player.root.rotation.x=ridePitch;vehicle.root.rotation.order='YXZ';vehicle.root.rotation.x=ridePitch;player.root.position.y=groundY;vehicle.root.position.y=groundY;
      const crash=rideRef.current==='jetpack'?0:rooftop.state.recovery/ROOF_RECOVERY_TIME;
      const collapse=Number.isFinite(spinCrashAge)?T.MathUtils.smoothstep(spinCrashAge,.15,.65):1;
      const squash=(crash>.5?1:T.MathUtils.smoothstep(crash,.28,.5))*collapse;
      let hovering=false;
      if(hoverPoint&&active&&!fieldMenu.current&&!lessonRef.current){characterRay.setFromCamera(hoverPoint,camera);hovering=characterRay.intersectObject(player.root,true).length>0||nearCharacter(hoverPoint);}
      if(hovering&&!characterHovered)sound.ui('hover');characterHovered=hovering;
      const canEnter=active&&!fieldMenu.current&&!lessonRef.current;
      const nearEntrance=(x:number,z:number,width:number)=>canEnter&&rideRef.current!=='jetpack'&&!rooftop.state.falling&&Math.abs(groundY)<1&&location.z>z-3&&location.z<z+8&&Math.abs(location.x-x)<width;
      nearMuseum=nearEntrance(168,188,16);
      nearStore=nearEntrance(85,-50,8);nearArcade=nearEntrance(103,-50,8);nearCoaches=nearEntrance(161,-34,11);
      const flightNear=(bounds:T.Box3)=>canEnter&&rideRef.current==='jetpack'&&flight.height<bounds.max.y+40&&Math.hypot(Math.max(bounds.min.x-location.x,0,location.x-bounds.max.x),Math.max(bounds.min.z-location.z,0,location.z-bounds.max.z))<12;
      const overMuseum=!!(hoverPoint&&canEnter&&pointsAtMuseum());
      if(overMuseum&&!museumHovered)sound.ui('hover');museumHovered=overMuseum;
      const overStore=!!(hoverPoint&&canEnter&&pointsAtStore()),overArcade=!!(hoverPoint&&canEnter&&pointsAtArcade()),overCoaches=!!(hoverPoint&&canEnter&&pointsAtCoaches());
      if(overStore&&!storeHovered||overArcade&&!arcadeHovered||overCoaches&&!coachesHovered)sound.ui('hover');storeHovered=overStore;arcadeHovered=overArcade;coachesHovered=overCoaches;
      const hoveredBuilding=overStore?'store':overArcade?'arcade':overCoaches?'coaches':overMuseum?'museum':'';if(hoveredBuilding){buildingHoverKind=hoveredBuilding;buildingHoverUntil=now+450;}
      const buildingTargets=[{index:0,kind:'store',x:85,z:-53,active:overStore||nearStore||flightNear(world.storeBounds)},{index:1,kind:'arcade',x:103,z:-53,active:overArcade||nearArcade||flightNear(world.arcadeBounds)},{index:2,kind:'coaches',x:161,z:-37,active:overCoaches||nearCoaches||flightNear(world.coachesBounds)},{index:3,kind:'museum',x:168,z:186,active:overMuseum||nearMuseum||flightNear(world.museumBounds)}];
      const singleBuilding=coarse||viewportW<=600;
      const highlightedBuilding=singleBuilding?buildingTargets.filter(b=>b.active).sort((a,b)=>Math.hypot(location.x-a.x,location.z-a.z)-Math.hypot(location.x-b.x,location.z-b.z))[0]?.kind:undefined;
      for(const b of buildingTargets)buildingEffects[b.index].glow.update(b.active&&(!singleBuilding||b.kind===highlightedBuilding),dt,reduced||singleBuilding&&b.kind!==highlightedBuilding);

      let hoveredNpc=hoverPoint&&canEnter&&!hovering?(islandNpcs.pick(characterRay)??coachPractice.pick(characterRay)??volleyballGame.pick(characterRay)):null;
      if(!hoveredNpc&&hoverPoint&&canEnter&&!hovering&&hoveredNpcId){const last=islandNpcs.entries.find(e=>e.id===hoveredNpcId)??coachPractice.entries.find(e=>e.id===hoveredNpcId)??volleyballGame.entries.find(e=>e.id===hoveredNpcId);if(last&&!ballReactions.get('npc:'+last.id)){const center=new T.Vector3(last.position.x,last.position.y+1,last.position.z);if(characterRay.ray.distanceToPoint(center)<1.1&&characterRay.ray.origin.distanceTo(center)<90)hoveredNpc=last.definition;}}
      const hoveredEntry=hoveredNpc?(islandNpcs.entries.find(e=>e.id===hoveredNpc.id)??coachPractice.entries.find(e=>e.id===hoveredNpc.id)??volleyballGame.entries.find(e=>e.id===hoveredNpc.id)):undefined;
      if(hoveredNpc&&hoveredNpc.id!==hoveredNpcId)sound.ui('hover');hoveredNpcId=hoveredNpc?.id??null;
      npcHover.update(hoveredEntry?{id:hoveredEntry.id,...hoveredEntry.position}:null,dt,reduced);
      renderer.domElement.style.cursor=hovering||hoveredNpc||overStore||overArcade||overCoaches||overMuseum?'pointer':'';
      characterGlow.update(hovering,dt,reduced);
      player.root.scale.set(1+squash*.65,1-squash*.82,1+squash*.65);vehicle.root.scale.setScalar(1.12);player.root.rotation.z=0;
      if(crash>0&&!reduced){player.root.rotation.z=Math.sin(elapsed*5)*.15*(1-squash);player.root.rotation.x+=Math.cos(elapsed*4)*.1*(1-squash);}
      if(Number.isFinite(spinCrashAge)&&crash>0){player.root.rotation.z+=squash*.8;if(rideRef.current!=='walk')player.root.position.x+=Math.cos(player.root.rotation.y)*squash*.65;}
      vehicle.setCrash(crash*collapse);
      splat.visible=crash>0&&!fieldMenu.current;
      if(splat.visible){const progress=1-crash;splat.position.set(location.x,groundY+.04,location.z);splat.scale.setScalar(1+progress*3);splatMaterial.opacity=(1-progress)*.65;}

      const wallSplat=rampMotion.state.phase==='splat';
      dizzyStars.visible=(crash>0||wallSplat)&&!fieldMenu.current;
      if(dizzyStars.visible){
        dizzyStars.position.set(visualLocation.x,groundY+(wallSplat?rampMotion.state.lift:0)+2*(1-squash*.82)+.55,visualLocation.z);
        dizzyStars.scale.setScalar(wallSplat?1:Math.min(1,rooftop.state.recovery/.4));
        dizzyStars.children.forEach((star,i)=>{const a=(reduced?0:elapsed*3.5)+i*Math.PI*2/5;star.position.set(Math.cos(a)*.9,reduced?0:Math.sin(a*2)*.12,Math.sin(a)*.65);star.quaternion.copy(camera.quaternion);});
      }
      const bob=flightPose?.bob??0;
      player.root.rotation.z+=flightPose?.roll??0;vehicle.root.rotation.z=flightPose?.roll??0;player.root.rotation.x+=flightPose?.pitch??0;vehicle.root.rotation.x+=flightPose?.pitch??0;player.root.position.y+=bob;vehicle.root.position.y+=bob;
      const bikeSway=crash>0||rooftop.state.falling||rampMotion.state.phase==='air'||wallSplat?0:(player.bikeRoll+player.rideTurnRoll)*(rideTricks.state.active?.3:1);
      player.root.rotation.z+=bikeSway;vehicle.root.rotation.z+=bikeSway;
      if(rideRef.current==='walk'&&(walkBall.state.mode==='charging'||walkBall.state.mode==='windup')){
        const back=walkBall.state.mode==='charging'?T.MathUtils.smoothstep(walkBall.state.age,.18,.65):T.MathUtils.smoothstep(walkBall.state.charge*1.8,0,.47)*(1-T.MathUtils.smoothstep(walkBall.state.age,0,SHOT_WINDUP*.55));
        const x=player.root.position.x-Math.sin(player.root.rotation.y)*back*1.1,z=player.root.position.z-Math.cos(player.root.rotation.y)*back*1.1;
        if(rooftop.canLand(x,z)&&Math.abs(rooftop.surface(x,z)-groundY)<.35){player.root.position.x=x;player.root.position.z=z;}
      }
      const showLanding=rideRef.current==='jetpack'&&!fieldMenu.current&&!lessonRef.current;
      const overPickup=streetTraffic.updateLandingIndicator(location.x,location.z,showLanding,elapsed,reduced,truckLanding);
      if(showLanding&&!overPickup){
        previewAge+=dt;
        if(jetActions.state.phase==='parachute'&&jetActions.state.target)landingPreview=jetActions.state.target;
        else if(flight.landing)landingPreview=flight.landing;
        else if(rooftop.canLand(location.x,location.z)){landingPreview={x:location.x,z:location.z};previewX=location.x;previewZ=location.z;}
        else if(previewAge>=.12&&(Math.hypot(location.x-previewX,location.z-previewZ)>.3||!landingPreview)){landingPreview=rooftop.findLanding(location.x,location.z);previewX=location.x;previewZ=location.z;previewAge=0;}
      }
      landingMarker.update(landingPreview,flight.height,rooftop.surface,showLanding&&!overPickup,elapsed,reduced);
      if(streetTraffic.rider.index>=0&&!reduced&&streetTraffic.rider.landingAge<.85){const age=streetTraffic.rider.landingAge,settle=Math.exp(-age*5),compress=Math.sin(Math.min(1,age/.3)*Math.PI)*.18;player.root.scale.y*=1-compress;player.root.scale.x*=1+compress*.2;player.root.rotation.z+=Math.sin(age*20)*settle*.1;player.root.position.y+=Math.sin(age*16)*settle*.06;}
      boundaryFeedback.update(active?dt:0,reduced,camera);boundaryFeedback.root.visible=!fieldMenu.current;
      player.root.position.y+=trickPose.lift;vehicle.root.position.y+=trickPose.lift;player.root.rotation.x+=trickPose.pitch;vehicle.root.rotation.x+=trickPose.pitch;player.root.rotation.y+=trickPose.yaw;vehicle.root.rotation.y+=trickPose.yaw;player.root.rotation.z+=trickPose.roll;vehicle.root.rotation.z+=trickPose.roll;
      if(wallSplat){const yaw=rampMotion.state.ramp!.yaw,flatten=reduced?.55:.2;player.root.rotation.set(0,yaw,0,'YXZ');player.root.scale.set(1.28,1.1,flatten);player.root.position.x+=Math.sin(yaw)*.6;player.root.position.z+=Math.cos(yaw)*.6;vehicle.root.rotation.set(.3,yaw,.55,'YXZ');vehicle.root.position.y=groundY+Math.max(0,rampMotion.state.lift-.8);}
      if(!reduced&&(jetActions.state.phase==='blast'||jetActions.state.phase==='dash')){const t=Math.min(1,jetActions.state.age/(jetActions.state.phase==='dash'?.45:1.05)),twist=Math.PI*(customizationRef.current.jetpack==='helicopter'?4:2)*t*t*(3-2*t);if(customizationRef.current.jetpack==='mini-plane'&&jetActions.state.phase==='blast'){player.root.rotateX(-twist);vehicle.root.rotateX(-twist);}else if(['flying-car','mini-plane'].includes(customizationRef.current.jetpack)){player.root.rotateZ(twist);vehicle.root.rotateZ(twist);}else if(customizationRef.current.jetpack==='rocketboard'){if(jetActions.state.phase==='blast'){player.root.rotateY(twist*1.5);vehicle.root.rotateY(twist*1.5);}else{player.root.rotateX(twist);vehicle.root.rotateX(twist);}}else if(customizationRef.current.jetpack==='ironman'){const surge=Math.sin(t*Math.PI)*.3;player.root.rotateX(-surge);vehicle.root.rotateX(-surge);}else{player.root.rotateY(twist);vehicle.root.rotateY(twist);}}
      const arrivalScale=characterArrival.update(dt,visualLocation.x,groundY,visualLocation.z,reduced,!fieldMenu.current&&!lessonRef.current);
      player.root.scale.multiplyScalar(arrivalScale);vehicle.root.scale.multiplyScalar(arrivalScale);
      vehicle.syncArmor(player.root,rideRef.current==='jetpack'&&!['parachute','fall'].includes(jetActions.state.phase));
      craterEffect.update(active?dt:0,reduced);if(fieldMenu.current)craterEffect.root.visible=false;
      jetpackBreakup.update(active?dt:0,rooftop.surface,!fieldMenu.current);
      sonicBurst.root.visible=!fieldMenu.current;sonicBurst.update(active?dt:0,reduced);
      parachuteTrail.root.visible=!fieldMenu.current;parachuteTrail.update(visualLocation.x,groundY,visualLocation.z,player.root.rotation.y,active?dt:0,jetActions.state.phase==='parachute',reduced);if(fieldMenu.current)parachuteTrail.root.visible=false;
      parachute.root.visible=!fieldMenu.current;parachute.update(visualLocation.x,groundY,visualLocation.z,player.root.rotation.y,jetActions.state.phase==='parachute',jetActions.state.age,active?dt:0,rooftop.surface(visualLocation.x,visualLocation.z),reduced,jetActions.state.phase==='fall');
      if(jetActions.state.phase==='parachute'){player.handPositions(leftHand,rightHand);parachute.attachHands(leftHand,rightHand);}
      jetExhaust.update(visualLocation.x,groundY+bob,visualLocation.z,player.root.rotation.y,fieldSurfaceHeight(visualLocation.x,visualLocation.z),active?dt:0,vehicle.root.visible&&rideRef.current==='jetpack'&&customizationRef.current.jetpack==='classic'&&active,flight.takeoffTime<1.05||Boolean(flight.landing)||['charge','blast','dash'].includes(jetActions.state.phase),reduced);
      flightTrail.root.visible=!fieldMenu.current;flightTrail.update(visualLocation.x,groundY+bob,visualLocation.z,flightHeading,Math.hypot(velocity.x,velocity.z),active?dt:0,customizationRef.current.jetpack,vehicle.root.visible&&rideRef.current==='jetpack'&&customizationRef.current.jetpack!=='classic'&&active&&!['parachute','fall'].includes(jetActions.state.phase),['dash','blast'].includes(jetActions.state.phase),reduced,jetActions.state.phase==='blast');
      rideTrail.update(visualLocation.x,groundY,visualLocation.z,player.root.rotation.y,Math.hypot(velocity.x,velocity.z),active?dt:0,vehicle.root.visible&&rideRef.current!=='walk'&&rideRef.current!=='jetpack'&&active&&!fieldMenu.current&&rampMotion.state.phase!=='air',reduced,groundVariant,rideTricks.state.active||rampMotion.state.phase==='climb');
      islandNpcs.root.visible=!fieldMenu.current&&!lessonRef.current;
      islandNpcs.update(active?dt:0,elapsed,reduced,{x:visualLocation.x,y:groundY,z:visualLocation.z},!active||!islandNpcs.root.visible,!coarse&&viewportW>600,hoveredNpcId,camera);
      if(now-lastHud>150){const visitor={x:visualLocation.x,y:groundY,z:visualLocation.z};const next=[islandNpcs.root.visible?islandNpcs.nearest(visitor):null,coachPractice.nearest(visitor),volleyballGame.nearest(visitor)].filter((npc):npc is NpcDefinition=>npc!==null).sort((a,b)=>Math.hypot(a.x-visitor.x,a.z-visitor.z)-Math.hypot(b.x-visitor.x,b.z-visitor.z))[0]??null;if(next?.id!==nearbyNpcRef.current?.id){nearbyNpcRef.current=next;setNearbyNpc(next);}}
      npcs.forEach((rig,i)=>{
        rig.root.visible=Boolean(lessonRef.current);if(!lessonRef.current)return;
        if(lessonRef.current&&i<2){const point=i===0?PASSER:DEFENDER;rig.update(point.x,point.z,dt,elapsed,reduced);rig.root.position.y=fieldSurfaceHeight(point.x,point.z);return;}
        const center=i<3?15:-38,angle=elapsed*.22+i*2.1;rig.update(10+Math.sin(angle)*4+(i%2),center+Math.cos(angle)*7,dt,elapsed,reduced);});
      guide.visible=receiveRing.visible=Boolean(lessonRef.current);
      if(lessonRef.current){const lane=passingLane(location);guideMaterial.color.set(lane.open?'#b7f1a4':'#f1a06c');const a=guide.geometry.attributes.position.array as Float32Array;a.set([PASSER.x,.16+fieldSurfaceHeight(PASSER.x,PASSER.z),PASSER.z,location.x,.16+groundY,location.z]);guide.geometry.attributes.position.needsUpdate=true;guide.computeLineDistances();receiveRing.position.set(PASSER.x,.14+fieldSurfaceHeight(PASSER.x,PASSER.z),PASSER.z);if(lane.open!==lastLane){lastLane=lane.open;setLaneOpen(lane.open);}}
      const walkingBall=rideRef.current==='walk'&&!lessonRef.current&&!liveKnockout.joined;
      ball.position.set(orb.x,walkingBall?walkBall.state.y:.25+fieldSurfaceHeight(orb.x,orb.z),orb.z);
      const ballSquash=walkingBall&&!reduced?Math.sin(walkBall.state.bounce/.16*Math.PI)*.22:0;ball.scale.set((1+ballSquash)*1.0125,(1-ballSquash)*1.0125,(1+ballSquash)*1.0125);
      ballEffects.root.visible=walkingBall&&!fieldMenu.current;ballEffects.update(active?dt:0,ball.position,walkingBall&&(walkBall.state.mode==='shot'||walkBall.state.mode==='wall-juggle'||walkBall.state.mode==='juggle'),reduced,camera,walkBall.state.mode==='shot'?walkBall.state.charge:0,walkBall.state.mode==='charging'?walkBall.state.charge:-1,BALL_COLORS[customizationRef.current.ball],customizationRef.current.ball);
      liveKnockout.update(active?dt:0,location,groundY,rideRef.current==='walk',camera,!fieldMenu.current&&!lessonRef.current,reduced,player.root.rotation.y);
      liveKnockout.posePlayer(player.root);if(liveKnockout.joined)ball.visible=false;
      const arenaStatus=uiElement<HTMLElement>('[data-knockout-status]');if(arenaStatus){setUIHidden(arenaStatus,!liveKnockout.joined||Boolean(liveKnockout.countdown));const message=liveKnockout.countdown|| (liveKnockout.state.phase!=='playing'?'Round over · next round starting…':liveKnockout.waiting?'Knocked out · wait in the corner line':('Rooftop free-for-all · '+liveKnockout.state.remaining+' left · '+(3-liveKnockout.state.players[0].hits)+' hits left · '+(liveKnockout.state.players[0].shield>0?'Shield active':liveKnockout.hasBall?'Ball collected · Aim and Kick':'Find a ball, then Kick')));if(arenaStatus.textContent!==message)arenaStatus.textContent=message;}
      const ballDt=active?dt:0;
      if(walkingBall&&['attached','charging','juggle','wall-juggle','windup'].includes(walkBall.state.mode)){
        const spin=((walkBall.state.mode==='juggle'||walkBall.state.mode==='wall-juggle')?5:1.2+Math.hypot(velocity.x,velocity.z)/.19)*ballDt;
        ball.rotation.x+=Math.cos(player.root.rotation.y)*spin;ball.rotation.z-=Math.sin(player.root.rotation.y)*spin;
      }else{ball.rotation.x+=orb.vz*ballDt/.19;ball.rotation.z-=orb.vx*ballDt/.19;}
      rideChange.update(active?dt:0,visualLocation.x,groundY,visualLocation.z,reduced);if(fieldMenu.current)rideChange.root.visible=false;
      ring.position.set(visualLocation.x,.10+groundY,visualLocation.z);
      const ringSize=({walk:1,scooter:1.65,bike:2.15,moped:2.3,jetpack:1} as const)[rideRef.current];ring.scale.setScalar(reduced?ringSize:T.MathUtils.lerp(ring.scale.x,ringSize,1-Math.exp(-dt*10))); 
      const current=location.x>25?'coast':districtAt(location.z);if(current!==lastDistrict){lastDistrict=current;setDistrict(current);}
      // One fixed golden sunset treatment across every neighborhood.
      
      onboardingNpcFocus.restore(camera);
      // One consistent island view. Walking/travel changes position, never zoom or angle.
      const flying=rideRef.current==='jetpack',rampCamera=['climb','air','splat'].includes(rampMotion.state.phase),mobileTravel=coarse&&(rideRef.current!=='walk'||streetTraffic.rider.index>=0);
      camTarget.set(visualLocation.x+(flying||mobileTravel?16:18),23+groundY+(rampCamera?rampMotion.state.lift:0)+(mobileTravel?1:0),visualLocation.z+(flying||mobileTravel?33:30));
      if(!learningFormat.current){camera.position.lerp(camTarget,reduced?1:1-Math.exp(-dt*(mobileTravel?20:flying?14:rampCamera?10:4)));
        // Bound follow lag on phones so boosted rides stay near the center.
        if(mobileTravel){const lag=camera.position.distanceTo(camTarget);if(lag>1.2)camera.position.lerp(camTarget,1-1.2/lag);}
        // Vertical blast speed exceeds the eased follow; lock altitude to keep the pilot framed.
        if(jetActions.state.phase!=='idle')camera.position.y=camTarget.y;
      }
      // Keep the viewing direction constant even while the follow position eases.
      lookAt.set(camera.position.x-16,camera.position.y-23,camera.position.z-33);
      if(!learningFormat.current)camera.lookAt(lookAt);
      const learning=learningFormat.current;
      const fullWidth=viewportW,fullHeight=viewportH;
      const viewportWidth=fullWidth,viewportHeight=fullHeight;
      quizView.restore();
      renderer.setViewport(0,fullHeight-viewportHeight,viewportWidth,viewportHeight);
      if(Math.abs(camera.aspect-viewportWidth/viewportHeight)>.0001){camera.aspect=viewportWidth/viewportHeight;camera.updateProjectionMatrix();}
      if(learning){learningView.update(camera,venueById(learning),fieldSession.current,dt,reduced,learningAngle.current,{width:viewportWidth,height:viewportHeight,mobile:fullWidth<=600||window.matchMedia('(pointer:coarse)').matches});quizView.apply([fieldSession.current?.lesson.id,fieldSession.current?.quiz,fieldSession.current?.question,learningAngle.current].join(':'),learningView.target,dt,reduced);}
      else if(wasLearning){camera.up.set(0,1,0);camera.zoom=1;camera.updateProjectionMatrix();learningView.reset();camera.position.set(location.x+18,23+groundY,location.z+30);camera.lookAt(location.x+2,groundY,location.z-3);}
      if(Boolean(learning)!==wasLearning){
        world.setVisible(!learning);
      }
      fields.roots.forEach((root,id)=>root.visible=!learning||id===learning);wasLearning=Boolean(learning);
      onboardingNpcTarget.current=onboardingNpcFocus.update(camera,onboardingRef.current&&onboardingNpcStep.current,location,fullWidth,fullHeight,dt,reduced);
      const neededShadowElevation=Math.ceil(Math.max(0,camera.position.y-23)/4)*4;
      if(neededShadowElevation!==shadowElevation){shadowElevation=neededShadowElevation;fitIslandShadows(sun,camera,shadowElevation);}
      sun.target.position.set(camera.position.x-18,0,camera.position.z-30);
      // Keep the shadow texture aligned to its texels as the flying camera moves.
      const shadowCamera=sun.shadow.camera,texelX=(shadowCamera.right-shadowCamera.left)/sun.shadow.mapSize.x,texelY=(shadowCamera.top-shadowCamera.bottom)/sun.shadow.mapSize.y;
      const shadowX=sun.target.position.dot(shadowRight),shadowY=sun.target.position.dot(shadowUp);
      sun.target.position.addScaledVector(shadowRight,Math.round(shadowX/texelX)*texelX-shadowX).addScaledVector(shadowUp,Math.round(shadowY/texelY)*texelY-shadowY);
      sun.position.set(sun.target.position.x-288,sun.target.position.y+252,sun.target.position.z+198);
      const inspectEnabled=active&&!fieldSession.current&&!lessonRef.current&&!quizView.blocksSelection();
      let ferryHovered=false;if(inspectEnabled&&hoverPoint){characterRay.setFromCamera(hoverPoint,camera);ferryHovered=pointsAtFerry();}world.setFerryLockHovered(ferryHovered);ferryGlow.update(ferryHovered,dt,reduced);if(ferryHovered&&!ferryWasHovered)sound.ui('hover');ferryWasHovered=ferryHovered;if(ferryHovered)renderer.domElement.style.cursor='pointer';
      livePlayerHover=inspectEnabled&&hoverPoint?games.pickPlayer(hoverPoint,camera,fullWidth,fullHeight,learning):null;
      games.setHoverPaused(positionSelectionRef.current?.format??livePlayerHover?.format??null);
      livePlayerGlow.update(livePlayerHover?{id:livePlayerHover.format+':'+livePlayerHover.id,x:livePlayerHover.x,y:livePlayerHover.y,z:livePlayerHover.z}:null,dt,reduced);
      const positionTip=uiElement<HTMLDivElement>('[data-position-tip]');if(positionTip){setUIHidden(positionTip,!livePlayerHover);if(livePlayerHover){const tip=positionInfo(livePlayerHover)?.name+" · What’s this position?";if(positionTip.textContent!==tip)positionTip.textContent=tip;placeUI(positionTip,T.MathUtils.clamp(livePlayerHover.screenX,120,fullWidth-120),Math.max(90,livePlayerHover.screenY-46));renderer.domElement.style.cursor='pointer';}}
      games.update(active?dt:0,elapsed,camera,fieldSession.current,active,learning,viewportHeight);
      coachPractice.update(active?dt:0,elapsed,camera,!learning,reduced,hoveredNpcId);
      volleyballGame.update(active?dt:0,camera,!learning&&!lessonRef.current,reduced,hoveredNpcId);
      // One stable screen-space entry point for whichever field is in view.
      let visibleVenue=cachedVisibleVenue;
      if(now-lastFieldCheck>=100){lastFieldCheck=now;visibleVenue=null;let bestFieldScore=Infinity;
      if(!fieldMenu.current&&!mapRef.current&&(!settingsRef.current||onboardingRef.current)&&!lessonRef.current){
        for(const v of VENUES){
          // Clip the actual pitch polygon to the screen. A bounding rectangle can
          // overlap the view even after the whole angled field has left it.
          const score=pitchVisibility(camera,v.x,.2+(v.elevation??0),v.z,v.width,v.length);
          if(score<bestFieldScore){bestFieldScore=score;visibleVenue=v.id;}
        }
      }
      cachedVisibleVenue=visibleVenue;
      }
      if(fieldMenu.current||mapRef.current||settingsRef.current&&!onboardingRef.current||lessonRef.current)visibleVenue=null;
      for(const v of VENUES){const button=uiElement<HTMLButtonElement>(`[data-field="${v.id}"]`);if(!button)continue;if(v.id===visibleVenue){if(button.hidden||button.disabled){button.hidden=false;button.disabled=false;button.tabIndex=0;delete button.dataset.leaving;fieldCardExit.delete(button);}}else if(!button.hidden){button.disabled=true;button.tabIndex=-1;if(!fieldCardExit.has(button)){fieldCardExit.set(button,now);button.dataset.leaving='true';}if(reduced||now-fieldCardExit.get(button)!>=350){button.hidden=true;delete button.dataset.leaving;fieldCardExit.delete(button);}}}

      world.updateArcade(elapsed,reduced);
      world.updateWater(active&&!learning?dt:0,reduced);
      world.updateFerry(active&&!learning?dt:0,reduced);
      if(active&&!learning&&!reduced)world.waves.forEach((wave,i)=>{wave.position.x+=Math.sin(elapsed*.6+i)*dt*.065;});
      if(now-lastHud>150){if(active&&!fieldMenu.current&&!lessonRef.current&&rideRef.current!=='jetpack'&&!rooftop.state.falling&&Math.abs(player.root.position.y-fieldSurfaceHeight(location.x,location.z))<1){const visited=nearestVenue(location.x,location.z);if(visited)recordQuestVisit(visited.id);}const nextJuggling=rideRef.current==='walk'&&(walkBall.state.mode==='juggle'||walkBall.state.mode==='wall-juggle');if(hudJuggling!==nextJuggling){hudJuggling=nextJuggling;setJuggling(nextJuggling);}if(hudX!==location.x||hudZ!==location.z){hudX=location.x;hudZ=location.z;positionStore.publish({x:hudX,z:hudZ});const zone=zoneAt(hudX,hudZ);if(zone!==zoneRef.current){zoneRef.current=zone;setLocationZone(zone);}}lastHud=now;}
      const mobileEntry=coarse||fullWidth<=600;
      const entries=[['store',nearStore,85,11.2,-53,world.storeBounds],['arcade',nearArcade,103,11,-53,world.arcadeBounds],['coaches',nearCoaches,161,11.8,-37,world.coachesBounds],['museum',nearMuseum,168,9.5,186,world.museumBounds]] as const;
      const truckCandidate=canEnter&&rideRef.current==='jetpack'&&truckLanding===null&&!pendingRide.current?streetTraffic.landingTruckAt(location.x,location.z):undefined;
      nearbyTruck.current=truckCandidate?.index??null;
      const exitPrompt=uiElement<HTMLButtonElement>('[data-truck-exit]');if(exitPrompt){setUIHidden(exitPrompt,!(canEnter&&streetTraffic.rider.index>=0));if(!exitPrompt.hidden)placeUI(exitPrompt,fullWidth/2,82);}
      const truckPrompt=uiElement<HTMLButtonElement>('[data-truck-land]');if(truckPrompt){setUIHidden(truckPrompt,!truckCandidate);if(truckCandidate)placeUI(truckPrompt,fullWidth/2,82);}
      let closestEntry:typeof entries[number][0]|undefined,closestEntryDistance=Infinity;
      if(mobileEntry&&!truckCandidate)for(const [kind,near,x,,z,bounds] of entries){if(!near&&!flightNear(bounds))continue;const distance=(location.x-x)**2+(location.z-z)**2;if(distance<closestEntryDistance){closestEntry=kind;closestEntryDistance=distance;}}
      for(const [kind,near,x,y,z] of entries){const prompt=uiElement<HTMLButtonElement>(`[data-${kind}-enter]`);if(prompt){const hoverEntry=canEnter&&!mobileEntry&&((kind===buildingHoverKind&&now<buildingHoverUntil)||prompt.matches(':hover'));let hidden=!!truckCandidate||(mobileEntry?kind!==closestEntry:!near&&!hoverEntry);if(!hidden){storePromptPoint.set(x,y,z).project(camera);hidden=storePromptPoint.z< -1||storePromptPoint.z>1;if(!hidden)placeUI(prompt,T.MathUtils.clamp((storePromptPoint.x+1)*fullWidth/2,75,fullWidth-75),T.MathUtils.clamp((1-storePromptPoint.y)*fullHeight/2,90,fullHeight-160));}setUIHidden(prompt,hidden);}}
      if(closestEntry||truckCandidate||streetTraffic.rider.index>=0)for(const venue of VENUES){const prompt=uiElement<HTMLElement>(`.field-learn-card[data-field="${venue.id}"]`);if(prompt)setUIHidden(prompt,true);}

      renderer.render(scene,camera);renderStats.rendered++;
      if(firstFrame){firstFrame=false;setReady(true);}
    }
    if(new URLSearchParams(window.location.search).get('lesson')==='space'){rideRef.current='walk';setRideMode('walk');previousRide='walk';lessonCommand.current='intro';}
    const hiddenTransforms=createHiddenTransformGate(scene);
    const initialFlying=rideRef.current==='jetpack',initialHeight=initialFlying?INITIAL_FLIGHT_HEIGHT:fieldSurfaceHeight(INITIAL_SPAWN.x,INITIAL_SPAWN.z);
    const stopVideoSubscription=subscribeVideoPlayback(playing=>{
      setVideoPlaying(playing);sound.setMediaPaused(playing);music.setMediaPaused(playing);
      cancelAnimationFrame(frame);last=performance.now();accumulator=0;
      if(playing)resetInputs();else if(!disposed)frame=requestAnimationFrame(animate);
    });
    camera.position.set(INITIAL_SPAWN.x+(initialFlying?16:18),23+initialHeight,INITIAL_SPAWN.z+(initialFlying?33:30));camera.lookAt(camera.position.x-16,initialHeight,camera.position.z-33);cancelAnimationFrame(frame);if(!isVideoPlaying())frame=requestAnimationFrame(animate);
    return()=>{liveKnockout.dispose();hiddenTransforms.dispose();shadowCache.dispose();shadowVisibility.dispose();shadowBatches.dispose();characterArrival.dispose();coinHunt.dispose();treeDebris.dispose();rampVisuals.dispose();livePlayerGlow.dispose();npcHover.dispose();onboardingNpcFocus.dispose();buildingEffects.forEach(effect=>effect.dispose());ferryGlow.dispose();jetpackBreakup.dispose();quizView.dispose();resetQuizView.current=()=>{};rideChange.dispose();craterEffect.dispose();parachuteTrail.dispose();ballReactions.dispose();sonicBurst.dispose();characterGlow.dispose();parachute.dispose();ballAppearance.dispose();ballEffects.dispose();islandNpcs.dispose();landingMarker.dispose();stopVideoSubscription();music.dispose();musicRef.current=null;sound.dispose();soundRef.current=null;disposed=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',resize);window.visualViewport?.removeEventListener('resize',resize);window.removeEventListener('pointerup',finishJoystick,true);window.removeEventListener('pointercancel',finishJoystick,true);window.removeEventListener('touchend',finishTouches);window.removeEventListener('touchcancel',finishTouches);window.removeEventListener('pagehide',blur);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);boundaryFeedback.dispose();starGeometry.dispose();starMaterial.dispose();dizzyStars.removeFromParent();splat.geometry.dispose();splatMaterial.dispose();splat.removeFromParent();jetExhaust.dispose();rideTrail.dispose();flightTrail.dispose();truckReactions.dispose();streetTraffic.dispose();volleyballGame.dispose();vehicle.dispose();player.dispose();npcs.forEach(r=>r.dispose());coachPractice.dispose();renderer.domElement.removeEventListener('pointermove',trackCharacterHover);renderer.domElement.removeEventListener('pointerleave',clearCharacterHover);renderer.domElement.removeEventListener('pointerdown',beginCharacterTap);renderer.domElement.removeEventListener('pointerup',pickCharacter);renderer.domElement.removeEventListener('pointerup',chooseFieldTarget);games.dispose();fields.dispose();world.dispose();delete (window as unknown as {__fi2?:unknown}).__fi2;guide.geometry.dispose();guideMaterial.dispose();scene.traverse(object=>{if(object instanceof T.Mesh){object.geometry.dispose();const mats=Array.isArray(object.material)?object.material:[object.material];mats.forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();};
  },[]);
  useEffect(()=>{musicRef.current?.setDucked(Boolean(fieldCatalog||lesson));},[fieldCatalog,lesson]);
  const updateStick=(e:React.PointerEvent)=>{const rect=joystickBounds.current??(joystickBounds.current=joystick.current!.getBoundingClientRect()),dx=e.clientX-rect.left-rect.width/2,dy=e.clientY-rect.top-rect.height/2,len=Math.hypot(dx,dy),scale=Math.min(1,36/Math.max(1,len));setStick({x:dx*scale,y:dy*scale});input.current.x=dx*scale/36;input.current.z=dy*scale/36;if(spinGesture.current.update(input.current.x,input.current.z,performance.now(),e.pointerType==='touch'&&window.matchMedia('(pointer:coarse)').matches))spinRequested.current=true;if(hint)setHint(false);};
  // Secondary touches do not reliably synthesize click while the joystick is captured.
  const travelControlDown=(e:React.PointerEvent<HTMLButtonElement>,activate:()=>void)=>{if(e.pointerType==='mouse')return;e.preventDefault();e.currentTarget.dataset.touchActionUntil=String(performance.now()+700);activate();tapHaptic();soundRef.current?.ui('click');};
  const travelControlClick=(e:React.MouseEvent<HTMLButtonElement>,activate:()=>void)=>{if(e.detail!==0&&performance.now()<Number(e.currentTarget.dataset.touchActionUntil??0))return;activate();};
  const releaseRideAction=(pointerId:number)=>{const hold=heldRidePointers.current.get(pointerId);if(!hold)return;heldRidePointers.current.delete(pointerId);hold.button.dataset.touchActionUntil=String(performance.now()+700);};
  const actionDown=(e:React.PointerEvent<HTMLButtonElement>,action:'kick'|'juggle')=>{const mode=rideRef.current,variant=mode==='bike'?customizationRef.current.bike:mode==='moped'?customizationRef.current.moped:'';if(!truckRiding&&isHeldRideAction(mode,variant,action==='kick'?0:1)){e.preventDefault();heldRidePointers.current.set(e.pointerId,{action:action==='kick'?0:1,button:e.currentTarget});e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.dataset.touchActionUntil=String(performance.now()+700);input.current[action]=true;tapHaptic();soundRef.current?.ui('click');return;}if(!truckRiding&&action==='kick'&&rideRef.current==='walk'&&!lessonRef.current&&e.button===0){e.preventDefault();if(shotHold.current)return;beginShotHold(e.pointerId,e.currentTarget);e.currentTarget.setPointerCapture(e.pointerId);return;}if(e.pointerType==='mouse')return;e.preventDefault();e.currentTarget.dataset.touchActionUntil=String(performance.now()+700);if(truckRiding){if(action==='kick')truckBoostRequested.current=true;else truckHonkRequested.current=true;}else input.current[action]=true;tapHaptic();soundRef.current?.ui('click');};
  const actionClick=(e:React.MouseEvent<HTMLButtonElement>,action:'kick'|'juggle')=>{if(performance.now()<Number(e.currentTarget.dataset.touchActionUntil??0))return;if(truckRiding){if(action==='kick')truckBoostRequested.current=true;else truckHonkRequested.current=true;}else input.current[action]=true;};
  const releaseStick=(e?:{pointerId:number})=>{if(e&&e.pointerId!==joystickPointer.current)return;const pointer=joystickPointer.current;joystickPointer.current=null;joystickBounds.current=null;if(pointer!==null&&joystick.current?.hasPointerCapture(pointer))joystick.current.releasePointerCapture(pointer);spinGesture.current.reset();setStick({x:0,y:0});input.current.x=input.current.z=0;};
  return <main onPointerDownCapture={unlockAudio} onPointerUpCapture={unlockAudio} onKeyDownCapture={unlockAudio} onPointerOverCapture={e=>{const button=soundButton(e.target);if(e.pointerType!=='touch'&&button&&!(e.relatedTarget instanceof Node&&button.contains(e.relatedTarget)))soundRef.current?.ui('hover');}} onFocusCapture={e=>{if(soundButton(e.target))soundRef.current?.ui('hover');}} onClickCapture={e=>{const button=soundButton(e.target);if(button&&!(e.detail!==0&&performance.now()<Number((button as HTMLElement).dataset.touchActionUntil??0))){tapHaptic();const cue=(button as HTMLElement).dataset.uiSound;soundRef.current?.ui(cue==='expand'||cue==='collapse'?cue:'click');}}} className={'town-app district-'+district+(controlsFlipped?' controls-flipped':'')+(lesson||fieldCatalog?' in-lesson':'')+(locationZone&1?' at-field':'')+(locationZone&2?' at-square':'')}>
    {ready&&!failed&&<NpcConversation npc={talkingNpc} open={conversationOpen} onOpenChange={setConversationOpen}/>}
    {ready&&!failed&&nearbyNpc&&!conversationOpen&&!customizerOpen&&!storeOpen&&!settingsOpen&&!map&&!fieldCatalog&&!lesson&&<button className="npc-talk-prompt" data-tour="npcs" aria-keyshortcuts="E" onClick={()=>openConversation(nearbyNpc)}>Talk to {nearbyNpc.name}</button>}
    {ready&&!failed&&<IslandOnboarding npcTarget={onboardingNpcTarget} onNpcStepChange={active=>{onboardingNpcStep.current=active;}} open={onboardingOpen} onClose={()=>setOnboardingOpen(false)} value={customization} onChange={changeCustomization}/>}
    {ready&&!failed&&liveArcadeOpen&&<LiveArcadeMatch onExit={()=>{setLiveArcadeOpen(false);setArcadeOpen(true);}}/>}
    {ready&&!failed&&<Arcade open={arcadeOpen} onOpenChange={setArcadeOpen} onPlayLive={()=>{setArcadeOpen(false);setLiveArcadeOpen(true);}}/>}
    {ready&&!failed&&!settingsRef.current&&!map&&!fieldCatalog&&!lesson&&<CoinHuntHud near={coinNear}/>}
    {ready&&!failed&&<FerryPreview open={ferryOpen} onOpenChange={setFerryOpen}/>}
    {ready&&!failed&&<Museum open={museumOpen} onOpenChange={setMuseumOpen}/>}
    {ready&&!failed&&<CoachesCentre open={coachesOpen} onOpenChange={setCoachesOpen}/>}
    {ready&&!failed&&<IslandStore itemRequest={storeItemRequest} open={storeOpen} onOpenChange={setStoreOpen} value={customization} onChange={changeCustomization} onEquipRide={selectRide}/>}
    {ready&&!failed&&<CharacterCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} value={customization} onChange={changeCustomization} completedQuizCount={quizProgress.completed} totalQuizCount={quizProgress.total} onEquipRide={selectRide}/>}
    {ready&&!failed&&!fieldCatalog&&!lesson&&<IslandSettings pathsRequest={pathsRequest} onRestartOnboarding={()=>setOnboardingOpen(true)} onOpenStore={openStore} onStartLearning={()=>{setFieldCatalog(nearestVenue(positionStore.getSnapshot().x,positionStore.getSnapshot().z)?.id??'futsal');setHint(false);}} voiceEnabled={voiceEnabled} onVoiceChange={value=>{setVoiceEnabled(value);savePreference('fi2-voice-enabled',String(value));}} coachVoice={coachVoice} onCoachVoiceChange={value=>{setCoachVoice(value);savePreference('fi2-coach-voice',value);}} controlsFlipped={controlsFlipped} onControlsFlippedChange={value=>{releaseStick();setControlsFlipped(value);savePreference('fi2-controls-flipped',String(value));}} onOpenMap={()=>setMap(true)} open={settingsOpen} onOpenChange={value=>{setSettingsOpen(value);if(value)setMap(false);}} musicEnabled={musicEnabled} musicVolume={musicVolume} soundVolume={soundVolume} onMusicVolumeChange={value=>{setMusicVolume(value);musicRef.current?.setVolume(value);savePreference('fi2-music-volume',String(value));}} onSoundVolumeChange={value=>{setSoundVolume(value);soundRef.current?.setVolume(value);savePreference('fi2-sound-volume',String(value));}} onMusicChange={value=>{setMusicEnabled(value);musicRef.current?.setEnabled(value);try{localStorage.setItem('fi2-music-enabled',String(value));}catch{}}} soundMuted={soundMuted} onSoundMutedChange={value=>{setSoundMuted(value);soundRef.current?.setMuted(value);try{localStorage.setItem('fi2-sound-muted',String(value));}catch{}}} timeOfDay={timeOfDay} onTimeOfDayChange={changeTime}/>}
    <button type="button" className="store-enter-prompt" data-truck-exit hidden onPointerDown={e=>travelControlDown(e,()=>{truckExitRequested.current=true;})} onClick={e=>travelControlClick(e,()=>{truckExitRequested.current=true;})}>Hop off</button>
    <button type="button" className="store-enter-prompt" data-truck-land hidden onPointerDown={e=>travelControlDown(e,landOnTruck)} onClick={e=>travelControlClick(e,landOnTruck)}>Land on truck</button>
    <button type="button" className="store-enter-prompt" data-store-enter aria-label="Enter Store" hidden onClick={()=>openStore()}>Enter</button>
    <button type="button" className="store-enter-prompt" data-arcade-enter aria-label="Enter Arcade" hidden onClick={()=>setArcadeOpen(true)}>Enter</button>
    <div data-knockout-status className="knockout-status" role="status" hidden/>
    <button type="button" className="store-enter-prompt" data-museum-enter aria-label="Enter History Museum" hidden onClick={()=>setMuseumOpen(true)}>Enter</button>
    <button type="button" className="store-enter-prompt" data-coaches-enter aria-label="Enter Coaches" hidden onClick={()=>setCoachesOpen(true)}>Enter</button>
    <div className="town-scene" ref={host}/>{VENUES.map(v=><button key={v.id} data-tour="plays" data-field={v.id} className="meet-coach field-learn-card" hidden onClick={()=>{setFieldCatalog(v.id);setHint(false);}}><span>{v.name.toUpperCase()}</span><strong>Learn <span className="field-format">{v.id==='futsal'?'Futsal':v.id}</span> Plays</strong><span className="field-go" aria-hidden="true">Go <Icon name="arrow"/></span></button>)}

    {ready&&!failed&&<><aside className={'town-minimap'+(minimapCollapsed?' is-minimized':'')}>
      {<button tabIndex={minimapCollapsed?-1:0} aria-hidden={minimapCollapsed} id="corner-map" className="minimap-content" aria-label="View map" onClick={()=>setMap(true)}><div className="minimap-heading">Explore the island <span>N <Icon name="up"/></span></div><MovingIslandOverview roads={mapFootprints.roads} buildings={mapFootprints.buildings} store={positionStore} active={!minimapCollapsed}/><div className="minimap-footer">View Map <span><Icon name="external"/></span></div></button>}
    </aside>



    <div className="travel-actions" data-tour="controls"><button className="travel-mode" onPointerDown={e=>travelControlDown(e,cycleRide)} onClick={e=>travelControlClick(e,cycleRide)} aria-label={`Travel mode: ${rideMode==='jetpack'?({classic:'Twin jet','flying-car':'Flying car',helicopter:'Helicopter pack',ironman:'Iron Man suit',rocketboard:'Rocket surfboard','mini-plane':'Mini airplane'}[customization.jetpack]):TRAVEL_MODES[rideMode].label}. Change ride`}><TravelIcon kind={rideMode}/></button><button className="minimap-toggle" aria-label={minimapCollapsed?'Expand map':'Minimize map'} aria-expanded={!minimapCollapsed} aria-controls="corner-map" onPointerDown={e=>travelControlDown(e,()=>setMinimapCollapsed(value=>!value))} onClick={e=>travelControlClick(e,()=>setMinimapCollapsed(value=>!value))}><TravelIcon kind={minimapCollapsed?'map':'minus'}/></button><div className="touch-actions"><button className="touch-shoot" aria-label={truckRiding?'Speed up':lesson?'Call for pass':equippedActions(rideMode,customization)[0]} onPointerDown={e=>actionDown(e,'kick')} onPointerUp={e=>{if(shotHold.current?.id===e.pointerId)finishShotHold();}} onPointerCancel={e=>{if(shotHold.current?.id===e.pointerId)cancelShotHold();}} onLostPointerCapture={e=>{releaseRideAction(e.pointerId);if(shotHold.current?.id===e.pointerId)cancelShotHold();}} onContextMenu={e=>e.preventDefault()} onKeyDown={e=>{if(e.code==='Space'&&!truckRiding&&rideRef.current==='walk'&&!lessonRef.current){e.preventDefault();e.stopPropagation();if(!e.repeat)beginShotHold('keyboard',e.currentTarget);}}} onKeyUp={e=>{if(e.code==='Space'&&shotHold.current?.id==='keyboard'){e.preventDefault();e.stopPropagation();finishShotHold();}}} onBlur={e=>{if(shotHold.current?.button===e.currentTarget)cancelShotHold();}} title={`${truckRiding?'Speed up':equippedActions(rideMode,customization)[0]} · Space${rideMode==='walk'&&!truckRiding?'. Hold for a higher, stronger kick.':''}`} onClick={e=>actionClick(e,'kick')}>{truckRiding?<TravelIcon kind="boost"/>:<TravelIcon kind={rideMode==='scooter'?'spin':rideMode==='bike'?'front':rideMode==='moped'?'stand':rideMode==='jetpack'?'boost':'shoot'}/>}</button><button className="touch-juggle" hidden={Boolean(lesson)} aria-label={truckRiding?'Honk':rideMode==='walk'&&juggling?'Stop juggling':equippedActions(rideMode,customization)[1]} title={`${truckRiding?'Honk':equippedActions(rideMode,customization)[1]} · J`} aria-pressed={rideMode==='walk'?juggling:undefined} onPointerDown={e=>actionDown(e,'juggle')} onLostPointerCapture={e=>releaseRideAction(e.pointerId)} onClick={e=>actionClick(e,'juggle')}>{truckRiding?<Icon name="horn" size={26}/>:<TravelIcon kind={rideMode==='bike'?'back':rideMode==='scooter'||rideMode==='moped'?'jump':rideMode==='jetpack'?'skydive':juggling?'stop':'juggle'}/>}</button></div></div><div className="touch-controls"><div className="joystick" data-edge="false" ref={joystick} draggable={false} onDragStart={e=>e.preventDefault()} onContextMenu={e=>e.preventDefault()} onPointerDown={e=>{if(joystickPointer.current!==null){if(e.currentTarget.hasPointerCapture(joystickPointer.current))return;releaseStick();}e.preventDefault();joystickBounds.current=null;joystickPointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);updateStick(e);}} onPointerMove={e=>{if(e.pointerId===joystickPointer.current&&e.currentTarget.hasPointerCapture(e.pointerId)){e.preventDefault();updateStick(e);}}} onPointerUp={releaseStick} onPointerCancel={releaseStick} onLostPointerCapture={releaseStick} role="group" aria-label="Drag to move"><i className="joystick-contact" aria-hidden="true"><i className="joystick-contact-arc"/></i><span  aria-hidden="true"/></div></div>
    {scored&&<div className="goal-toast" role="status">GOLAZO! <span>GO GET ANOTHER.</span></div>}</>}
    {ballLessons.length>0&&<BallHuntLesson key={ballLessons[0]} spotId={ballLessons[0]} onDismiss={()=>setBallLessons(queue=>queue.slice(1))}/>}
    {fieldCatalog&&<FieldLearning pathRequest={formatPathRequest??undefined} learningId={learningRequest?.id} onResetQuizView={()=>resetQuizView.current()} onResizeSound={()=>soundRef.current?.ui('hover')} onLivePause={paused=>gamesRef.current?.setPaused(fieldCatalog,paused)} readMatch={()=>gamesRef.current?.getView(fieldCatalog)??null} cameraAngle={learningAngle} key={formatPathRequest?.nonce??learningRequest?.nonce??fieldCatalog} format={fieldCatalog} session={fieldSession} voiceEnabled={voiceEnabled} coachVoice={coachVoice} narrationPaused={settingsOpen||map||conversationOpen||videoPlaying} onClose={()=>{fieldSession.current=null;setFieldCatalog(null);if(learningRequest||formatPathRequest){setFormatPathRequest(null);setLearningRequest(null);setPathsRequest({nonce:Date.now()});setSettingsOpen(true);}}}/>}
    {lesson&&<CoachLesson phase={lesson} open={laneOpen} feedback={coachFeedback} onWatch={()=>requestLesson('watch')} onPractice={()=>requestLesson('practice')} onPass={()=>{input.current.kick=true;}} onExit={()=>requestLesson('exit')}/>}
    {!ready&&!failed&&<IslandLoading/>}
    {failed&&<div className="town-loading"><h2>The island needs WebGL.</h2><p>Enable hardware acceleration in your browser, then reload.</p><button className="pixel-button" onClick={()=>window.location.reload()}>TRY AGAIN</button></div>}
    <PositionGuide selection={positionSelection} onClose={()=>{setPositionSelection(null);gamesRef.current?.setHoverPaused(null);}}/>
    <div data-position-tip className="live-position-tip" role="status" hidden/>
    <MovingIslandTravelMap store={positionStore} open={map} onOpenChange={setMap} {...mapFootprints} onSelect={destination=>{if(destination==='store'||destination==='square'||destination==='coaches')go(destination);else goField(destination);}}/>
  </main>;
}

'use client';
import {createDailyPlay,dailyPlayCounts} from '@/lib/town/dailyPlay';
import {grantDailyPlayCoins} from '@/lib/arcade/arcadeWallet';
import { readIslandReturnPosition, saveIslandReturnPosition } from '@/lib/arcade/islandReturnPosition';
import {KONBINI_DOORS,KONBINI_BUILDINGS,konbiniDoorNear,saveKonbiniDeparture,konbiniUrl,type KonbiniDoor} from '@/lib/konbini/konbiniDoors';
import KonbiniDoorSlide from './KonbiniDoorSlide';
import {saveMuseumDeparture,MUSEUM_URL,museumExitPoint} from '@/lib/museum/museumDoors';
import {createGroundBallRoll} from '../lib/graphics/groundBallRoll';
import {FORMAT_PATH_LAUNCH,validPathLaunch,type FormatPathLaunch} from '@/lib/paths/formatPaths';
import {createTruckReactions} from '@/lib/graphics/truckReactions';
import {truckHitsCharacter,rideHitsCharacter} from '@/lib/town/truckCollisions';
import {isVideoPlaying,subscribeVideoPlayback} from '@/lib/videoPlayback';
import {useJoystickBounds} from '@/lib/town/useJoystickBounds';
import {rideSurfacePose} from '@/lib/town/rideSurfacePose';
import {createPitchVisibility} from '@/lib/town/pitchVisibility';
import {createObstacleGrid} from '@/lib/town/obstacleGrid';
import {createShadowVisibility} from '@/lib/graphics/shadowVisibility';
import {createViewGate} from '@/lib/graphics/viewGate';
import {paintJoystick} from '@/lib/town/joystickFeedback';
import {shapeStick,walkCameraOffset,walkCameraLead,createOcclusionProbe} from '@/lib/town/walkControl';
import {createHiddenPlayerMarker} from '@/lib/graphics/hiddenPlayerMarker';
import {createPositionStore} from '@/lib/town/positionStore';
import {MovingIslandOverview,MovingIslandTravelMap} from './MovingIslandMap';
import {createHiddenTransformGate} from '@/lib/graphics/hiddenTransformGate';
import {Icon} from './Icon';
import { useEffect, useRef, useState } from 'react';
import {createIslandSound} from '@/lib/audio/islandSound';
import {stopIslandNarration} from '@/lib/audio/islandNarration';
import {createIslandMusic} from '@/lib/audio/islandMusic';
import * as T from 'three';
import TravelIcon from './TravelIcon';
import {createSpinGesture} from '@/lib/town/spinGesture';
import {tapHaptic} from '@/lib/town/haptics';
import {frameCapSlot} from '@/lib/town/frameCap';
import {createIdleRide} from '@/lib/town/idleRide';
import {createIslandHeat} from '@/lib/graphics/islandHeat';
import {heatOptions} from '@/lib/graphics/heatTier';
import {applyLambertScenery,sharpenSceneTextures} from '@/lib/graphics/lambertScenery';
import {emitIslandFrame} from '@/lib/town/islandFrames';
import {findWallJuggleTarget} from '@/lib/town/wallJuggleTarget';
import {assistedShotYaw} from '@/lib/town/shotAssist';
import {goalFinish} from '@/lib/town/goalFinish';
import {sweepGoalFrame,type FrameHit} from '@/lib/town/goalCollisions';
import IslandSettingsHost from './IslandSettings';
import IslandLoading from './IslandLoading';
import IslandReturnLoading from './IslandReturnLoading';
import {isDrinkMachine} from '@/lib/town/drinkMachines';
import {createVendingMachines,type VendingMachines} from '@/lib/graphics/vendingMachines';
import {readArcadeWallet} from '@/lib/arcade/arcadeWallet';
import {createVendingKick} from '@/lib/graphics/vendingKick';
import {nearestVendingMachine,vendingMachine,vendingItemFor,type VendingMachineId} from '@/lib/town/vendingCatalog';
/** QA11 A-2: the map's Island Square vending trip lands on the Konbini machine's walk-up spot, facing it (its "Go" prompt shows at
 *  once), instead of the old Store door 10–12 m away with the machines off-screen. Clear of the Konbini door's Enter strip. */
const SQUARE_VENDING_ARRIVAL=(m=>m?{x:m.x+Math.sin(m.yaw)*2,z:m.z+Math.cos(m.yaw)*2,yaw:m.yaw+Math.PI}:{x:85,z:-50,yaw:Math.PI})(vendingMachine('plaza'));
import {isVendingPreview,testCoinsRequested} from '@/lib/town/vendingPreview';
import {grantTestingCoins} from '@/lib/arcade/arcadeWallet';
import {enforceVendingOwnership} from '@/lib/town/vendingWallet';
import {positionInfo,type PositionSelection} from '@/lib/town/playerPositions';
import dynamic from 'next/dynamic';
import {stableMemo} from '@/lib/ui/stableMemo';
import {prefetchOnIdle,prefetchPart,prefetchWhenIdle} from '@/lib/ui/idlePrefetch';
import {loadBottleLogo,loadCoaches,loadCoachLesson,loadConversation,loadCustomizer,loadFieldLearning,loadOnboarding,loadPathsPanel,loadVending} from './islandParts';
import {ensureStarterKit} from '@/lib/town/backpackStore';
import WelcomeBack from './WelcomeBack';
import {shouldShowIslandOnboarding} from '@/lib/town/onboarding';
import {countPathLaunch} from '@/lib/analytics/learnEvents';// Paths format share (Oct 9 2026): a map increment per launch
import {LEARNING_LAUNCH} from '@/lib/town/learningProgress';
import {journeyById,type LearningId} from '@/lib/town/learningJourneys';
import {recordExploreActivity,recordExploreKnockover,exploreActivityNow} from '@/lib/town/exploreActivity';
import {createExploreZones} from '@/lib/town/exploreZones';
import {recordQuestVisit} from '@/lib/town/questProgress';
import {createIslandNpcs} from '@/lib/graphics/islandNpcs';
import type {NpcDefinition} from '@/lib/town/npcDialogues';
import {useQuizProgress,getQuizProgress} from '@/lib/town/quizProgress';
import {equippedActions} from '@/lib/town/equipmentActions';
import {addBallPatches,createBallAppearance} from '@/lib/graphics/ballAppearance';
import {DEFAULT_CUSTOMIZATION,loadCustomization,saveCustomization,sanitizeCustomization,BALL_COLORS,beanLookFor,playerOutfit,type CharacterCustomization} from '@/lib/town/customization';
import {enforceRideUnlocks} from '@/lib/town/rideUnlocks';
import {COACH_VOICES,primeLessonVoice,lessonVoiceSpeaking} from '@/lib/town/useLessonVoice';
import {createIslandLighting,type TimeOfDay} from '@/lib/graphics/islandLighting';
import {createStaticShadowBatches} from '@/lib/graphics/staticShadowBatches';
import {createNpcShadowBatch} from '@/lib/graphics/npcShadowBatch';
import {createStaticShadowCache} from '@/lib/graphics/staticShadowCache';
import {createCharacterArrival} from '@/lib/graphics/characterArrival';
import {createCoinHunt} from '@/lib/graphics/coinHunt';
import CoinHuntHud from './CoinHuntHud';
import IslandJobs from './IslandJobs';
const IslandBalanceDrawer=dynamic(()=>import('./IslandBalanceDrawer'),{ssr:false});
import FishingHost from './FishingHost';
import {createFishingWorld,fishingKioskObstacles} from '@/lib/town/fishing/fishingWorld';
import {inGarden} from '@/lib/town/jobs/garden';
import {jobById} from '@/lib/town/jobs/jobCatalog';
import {createFocusArbiter,type HudCandidate,type HudFocus} from '@/lib/ui/hudStack';
import {HudStackContext} from './HudStack';
import {fishingSession} from '@/lib/town/fishing/fishingStore';
import {createJobScene,FARM_STAND_SELL} from '@/lib/town/jobs/jobScene';
import {createJobMoves,heldPose,poseForEvent,rideAllowed,RIDE_WAIT_NOTE,KICK_CONTACT,UPPER_POSES,type JobButton,type JobFrame} from '@/lib/town/jobs/jobMoves';
import MuseumHost from './Museum';
import FerryPreviewHost from './FerryPreview';
import {createLiveKnockout} from '@/lib/graphics/liveKnockout';
import {createRooftopTravel,ROOF_RECOVERY_TIME} from '@/lib/town/rooftopTravel';
import {roofJumpMotion,applyRoofJumpPose} from '@/lib/town/rooftopJump';
import {type MapFootprint} from './IslandOverview';
import {VENUES,ISLAND_SQUARE,ARCADE_DOOR,COACHES_DOOR,venueById,venueEntrance,nearestVenue,fieldSurfaceHeight,liveHalfX,liveHalfZ,liveWorldX,liveWorldZ,liveFieldPoint,type Format} from '@/lib/town/venues';
import {buildFormatFields} from '@/lib/town/fields';
import {createFieldRuntime,teachingPoseAdvances} from '@/lib/town/fieldRuntime';
import {createFieldCollision} from '@/lib/town/fieldCollision';
import {quizOutcomeStep,type FieldSession} from '@/lib/town/formatLessons';
import { PASSER, DEFENDER, passingLane, LessonPhase } from '@/lib/town/learning';
import { lessonFormat, newAttempts, recordAttempt, readLessonStroke, predictLessonPass, lessonFrame, createLessonWorld, replayLessonPass, strokeStartsAtBall, PASSER_FACING, REPLAY_SPEED, LESSON_FORMAT_KEY, type AttemptState, type AttemptRecord, type LessonFormat, type LessonPrediction, type StrokePoint } from '@/lib/town/learningPass';
import type { PuzzleWorld, PuzzleState } from '@/lib/passPuzzle';
import { fitIslandShadows, fitShadowsToBox } from '@/lib/graphics/islandShadows';
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
import {createPropReactions} from '@/lib/graphics/propReactions';
import {createStreetTraffic} from '@/lib/graphics/streetTraffic';
import {createFlightTrail,FLIGHT_TRAIL_COLORS} from '@/lib/graphics/flightTrail';
import { createRideTrail } from '@/lib/graphics/rideTrail';
import { TRAVEL_MODES, type TravelMode } from '@/lib/town/travelModes';
import {createJetpackActions,PARACHUTE_REAIM_METRES,PARACHUTE_REAIM_SECONDS} from '@/lib/town/jetpackActions';
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
import {createKnockdownFace,knockdownLift} from '@/lib/graphics/knockdown';
import {planRoofRamps,planRideRamps,rampSurface,createRampMotion} from '@/lib/town/rideRamps';
import {createRideRampVisuals} from '@/lib/graphics/rideRamps';
import {createRideTricks,isHeldRideAction} from '@/lib/town/rideTricks';
import {createWalkBall,SHOT_WINDUP} from '@/lib/town/walkBall';
import {createBallEffects} from '@/lib/graphics/ballEffects';
import { createPlayer, profileFor } from '@/lib/graphics/player';
import { sideGameDress, mainPlayerDress } from '@/lib/town/beanLooks';
import { DEFAULT_PLAYER_NUMBER } from '@/lib/graphics/shirtNumbers';
import { graphicsQuality, FrameBudget, MotionResolution, dynamicResolutionEnabled } from '@/lib/graphics/quality';
import { buildTown } from '@/lib/town/world';
import { District, DISTRICTS, districtAt, stepPlayer, blocked, flightBlocked, ISLAND_BOUNDS, insideObstacle, clearSpotNear } from '@/lib/town/simulation';
import {ballGround,OUT_OF_PLAY_NOTE} from '@/lib/town/ballSea';
import {createPierTarget} from '@/lib/town/eastPierChallenge';
import {CORAL_CAY_ARRIVAL} from '@/lib/town/coralCay';

const BallHuntLesson=dynamic(()=>import('./BallHuntLesson'),{ssr:false});
import CardOfferHost from './CardOfferHost';
// Lane 2 endgame (Sep 30 2026): graduations, certificates, the live Ferry/Museum/Coaches Board (docs/endgame-2026-09-30.md).
import GraduationHost from './GraduationHost';
import FieldPathCard from './FieldPathCard';
import {ENDGAME_OPEN,GRADUATIONS_CHANGED,readGraduations,type EndgameOpen} from '@/lib/endgame/graduationStore';
import {ferryUnlocked} from '@/lib/endgame/graduationModel';
import LearningHost from './LearningHost';
import CostumeMilestoneToast from './CostumeMilestoneToast';
import RideUnlockToast from './RideUnlockToast';
import FuelToast from './FuelToast';
import {fuelTravel,fuelAllowsRide,fuelCanSprint} from '@/lib/town/fuelStore';
import JobActionButton from './JobActionButton';
import {earnForBall} from '@/lib/town/cardRewardTriggers';
import {enterActivity,islandFrame} from '@/lib/analytics/tracker';
import {placeAt} from '@/lib/analytics/islandPlaces';
/** The position guide (PlayerCard, PlayerArt, photo manifests, film registry and player) loads on the first live-player tap, not with the island. */
const PositionGuide=stableMemo(dynamic(()=>import('./PositionGuide'),{ssr:false}));
// Heat (overnight audit F4): Town re-renders on its HUD tick; these dialog hosts (closed almost all the time) re-render only when a
// data prop changes. Their inline callbacks reach them through stable wrappers (lib/ui/stableMemo.ts).
const IslandSettings=stableMemo(IslandSettingsHost),Museum=stableMemo(MuseumHost),FerryPreview=stableMemo(FerryPreviewHost);
// Lazy-load pass (Oct 7 2026, docs/performance-guide.md): these dialogs are not in the boot bundle. Each mounts the first time it
// is wanted and then stays mounted (its own close animation and focus restore still run); its chunk is warmed beforehand by the
// idle warm-up or by the HUD focus that offers it (components/islandParts.ts), so a first open does not wait on the network.
const CharacterCustomizer=stableMemo(dynamic(()=>import('./CharacterCustomizer'),{ssr:false})),CoachesCentre=stableMemo(dynamic(()=>import('./CoachesCentre'),{ssr:false})),IslandOnboarding=stableMemo(dynamic(()=>import('./IslandOnboarding'),{ssr:false})),NpcConversation=stableMemo(dynamic(()=>import('./NpcConversation'),{ssr:false}));
const VendingMachine=dynamic(()=>import('./VendingMachine'),{ssr:false}),FieldLearning=dynamic(()=>import('./FieldLearning'),{ssr:false}),CoachLesson=dynamic(()=>import('./CoachLesson'),{ssr:false});
// The two outdoor drink machines (lib/town/drinkMachines.ts): same in-world machine, drink stock and the Konbini consumable flow.
const DrinkMachine=dynamic(()=>import('./DrinkMachine'),{ssr:false});
const INITIAL_SPAWN={x:103,z:-8};
const INITIAL_FLIGHT_HEIGHT=28;
type Input = {charging?:boolean;shotPower?:number;x:number;z:number;sprint:boolean;kick:boolean;juggle:boolean};
export default function Island({returningFromArcade=false,openArcadePacks=false}:{returningFromArcade?:boolean;openArcadePacks?:boolean}={}) {
  const initialSpawn=returningFromArcade?ARCADE_DOOR:INITIAL_SPAWN;
  const [videoPlaying,setVideoPlaying]=useState(false);
  const [talkingNpc,setTalkingNpc]=useState<NpcDefinition|null>(null),[conversationOpen,setConversationOpen]=useState(false);
  const [nearbyNpc,setNearbyNpc]=useState<NpcDefinition|null>(null),nearbyNpcRef=useRef<NpcDefinition|null>(null);
  const openConversation=(npc:NpcDefinition)=>{recordExploreActivity('character',npc.id);setTalkingNpc(npc);setConversationOpen(true);};
  const quizProgress=useQuizProgress();
  const onboardingNpcStep=useRef(false),onboardingNpcTarget=useRef<OnboardingNpcTarget|null>(null);
  const [onboardingOpen,setOnboardingOpen]=useState(false),onboardingRef=useRef(false);onboardingRef.current=onboardingOpen;
  const [arcadeOpen,setArcadeOpen]=useState(false);
  // Konbini (Sep 29 2026): like the Arcade, a document boundary that unloads the island; the departure is that store's door.
  const [konbiniDoor,setKonbiniDoor]=useState<KonbiniDoor|null>(null);
  // The Enter tap's click (onClickCapture → ui('click')) is still sounding when this runs: disposing the island sound here closed
  // its context mid-click, so the Konbini/Arcade Enter was silent (user, Oct 1 2026). Stop the loops now; dispose as the page changes.
  const leaveIslandSound=()=>{const s=soundRef.current;s?.truck(0,false);s?.move('walk',0,false);return ()=>s?.dispose();};
  useEffect(()=>{if(!konbiniDoor)return;saveKonbiniDeparture(konbiniDoor,rideRef.current);musicRef.current?.setSceneActive(false);stopIslandNarration();const disposeSound=leaveIslandSound();const timer=setTimeout(()=>{disposeSound();window.location.assign(konbiniUrl(konbiniDoor));},matchMedia('(prefers-reduced-motion:reduce)').matches?120:380);return()=>clearTimeout(timer);},[konbiniDoor]);
  const saveArcadeDeparture=useRef<()=>void>(()=>{});
  // A document boundary aborts island loading and releases its complete runtime.
  useEffect(()=>{if(!arcadeOpen)return;saveArcadeDeparture.current();musicRef.current?.setSceneActive(false);stopIslandNarration();const disposeSound=leaveIslandSound();const timer=setTimeout(()=>{disposeSound();window.location.assign('/arcade');},matchMedia('(prefers-reduced-motion:reduce)').matches?120:380);return()=>clearTimeout(timer);},[arcadeOpen]);
  // The Store became eight vending machines (docs/vending-machines.md); storeOpen = a vending machine's dialog is open.
  const [storeOpen,setStoreOpen]=useState(false),[vendingId,setVendingId]=useState<VendingMachineId>('plaza'),vendingRef=useRef<VendingMachines|null>(null);
  const [formatPathRequest,setFormatPathRequest]=useState<FormatPathLaunch|null>(null);
  // Shared lesson-launch path (QA11): a lesson can start from inside Make it yours (book check, Spot it) or the
  // coin drawer, so close every overlay that would sit over the pitch or keep the island loop asleep (settingsRef).
  const closeForLesson=()=>{setSettingsOpen(false);setStoreOpen(false);setConversationOpen(false);setCustomizerOpen(false);setBalancesOpen(false);setMap(false);setHint(false);};
  useEffect(()=>{const launch=(event:Event)=>{const detail=(event as CustomEvent).detail;if(!validPathLaunch(detail))return;countPathLaunch(detail.format);primeLessonVoice();setFormatPathRequest(detail);setLearningRequest(null);closeForLesson();setFieldCatalog(detail.format);};window.addEventListener(FORMAT_PATH_LAUNCH,launch);return()=>window.removeEventListener(FORMAT_PATH_LAUNCH,launch);},[]);
  const [learningRequest,setLearningRequest]=useState<{id:LearningId;nonce:number}|null>(null);
  useEffect(()=>{const launch=(event:Event)=>{const detail=(event as CustomEvent<{id:LearningId;nonce:number}>).detail,j=journeyById(detail?.id);if(!j)return;primeLessonVoice();setFormatPathRequest(null);setLearningRequest(detail);closeForLesson();setFieldCatalog(j.format);};window.addEventListener(LEARNING_LAUNCH,launch);return()=>window.removeEventListener(LEARNING_LAUNCH,launch);},[]);
  const [storeItemRequest,setStoreItemRequest]=useState<{id:string;nonce:number}|null>(null),[pathsRequest,setPathsRequest]=useState<{nonce:number}|null>(null);
  const [coachesOpen,setCoachesOpen]=useState(false);
  const [ferryOpen,setFerryOpen]=useState(false),[graduationOpen,setGraduationOpen]=useState(false);
  // QA11 H-1 (heat): the warm-up drawer and the For grown-ups sheet cover the island, so it sleeps behind them.
  const [learningOpen,setLearningOpen]=useState(false),[grownUpsOpen,setGrownUpsOpen]=useState(false);
  const [museumOpen,setMuseumOpen]=useState(false);
  // The History Museum (Oct 3 2026) is a walk-in building like the Konbini: every way in (building tap, door prompt, ENDGAME_OPEN
  // 'museum') sets museumOpen; save the departure at its door, quiet the island and change page (components/Museum.tsx = the doors).
  useEffect(()=>{if(!museumOpen)return;saveMuseumDeparture(rideRef.current);musicRef.current?.setSceneActive(false);stopIslandNarration();const disposeSound=leaveIslandSound();const timer=setTimeout(()=>{disposeSound();window.location.assign(MUSEUM_URL);},matchMedia('(prefers-reduced-motion:reduce)').matches?120:380);return()=>clearTimeout(timer);},[museumOpen]);
  const [ballLessons,setBallLessons]=useState<string[]>([]),[coinNear,setCoinNear]=useState(''),[seaNote,setSeaNote]=useState('');
  // Card rewards: the "choose a card" offer is open (the island sleeps behind it like any other dialog).
  const [cardOfferOpen,setCardOfferOpen]=useState(false);
  useEffect(()=>{const show=()=>{setStoreOpen(false);setSettingsOpen(true);window.dispatchEvent(new Event('fi2-open-coin-panel'));};const hide=()=>setSettingsOpen(false);window.addEventListener('fi2-coin-quest-open',show);window.addEventListener('fi2-coin-hint',hide);return()=>{window.removeEventListener('fi2-coin-quest-open',show);window.removeEventListener('fi2-coin-hint',hide);};},[]);
  const [positionSelection,setPositionSelection]=useState<PositionSelection|null>(null);
  const positionSelectionRef=useRef(positionSelection);positionSelectionRef.current=positionSelection;
  // Mounted from the first selection on and kept mounted, so the guide's own close/focus-restore effect still runs.
  // It also mounts (closed) once its idle prefetch lands, so the first tap only fills an already-mounted dialog.
  const [guideWarm,setGuideWarm]=useState(false),guideMounted=useRef(false);if(positionSelection||guideWarm)guideMounted.current=true;
  // Lazy dialogs (components/islandParts.ts) mount the first time they are wanted and then stay mounted, like the guide.
  const lazyMounted=useRef<Record<string,true>>({});const mountWhen=(part:string,wanted:boolean)=>wanted?(lazyMounted.current[part]=true):lazyMounted.current[part]===true;
  /** Opens a vending machine: the given one, or the nearest. The camera zooms straight onto its face (vendingMachines.ts), then the machine face itself is the UI (VendingMachine.tsx). */
  const openVending=(id?:VendingMachineId,itemId?:string)=>{const p=positionStore.getSnapshot(),m=(id&&vendingMachine(id))||nearestVendingMachine(p.x,p.z),request=vendingItemFor(itemId);
    setStoreItemRequest(request?{id:request,nonce:Date.now()}:null);setSettingsOpen(false);setCustomizerOpen(false);setConversationOpen(false);setMap(false);setHint(false);setVendingId(m.id);
    const v=vendingRef.current;if(v){v.focus(m.id,()=>setStoreOpen(true));wakeLoopRef.current();}else setStoreOpen(true);};// in-world machine: always zoom onto its face (from afar the camera flies over)
  /** Old Store entry points (Settings, quests, ?store= links) redirect to the nearest vending machine. */
  const openStore=(itemId?:string)=>openVending(undefined,itemId);
  const openVendingRef=useRef(openVending);openVendingRef.current=openVending;
  const [vendingLeaving,setVendingLeaving]=useState(false);// camera easing back out: card offers wait so the island doesn't pause mid-move
  const getVendingMachines=useRef(()=>vendingRef.current).current;// stable: the in-world machine face follows the zoom camera
  const [customizerOpen,setCustomizerOpen]=useState(false),customizerRef=useRef(false);customizerRef.current=customizerOpen;
  const [customization,setCustomization]=useState<CharacterCustomization>({...DEFAULT_CUSTOMIZATION}),customizationRef=useRef(customization);customizationRef.current=customization;
  useEffect(()=>{const progress=getQuizProgress();setCustomization(enforceVendingOwnership(enforceRideUnlocks(loadCustomization(progress.completed,progress.total))));},[]);
  const changeCustomization=(value:CharacterCustomization)=>{if(isVendingPreview()){customizationRef.current=value;setCustomization(value);return;}const progress=getQuizProgress(),safe=enforceVendingOwnership(enforceRideUnlocks(sanitizeCustomization(value,progress.completed,progress.total)));customizationRef.current=safe;setCustomization(safe);saveCustomization(safe);};
  // Wakes the island's render loop after it slept behind a paused menu (see wakeLoop); runs after every Town render.
  // Replays the character's arrival burst when the loading screen leaves (on first load it would otherwise finish unseen underneath).
  const arrivalRestartRef=useRef<()=>void>(()=>{});
  const wakeLoopRef=useRef<()=>void>(()=>{});useEffect(()=>{wakeLoopRef.current();});
  const [fishingOpen,setFishingOpen]=useState(false),[fishingDialog,setFishingDialog]=useState(false);// fishingOpen: live fishing or its dialogs (card offers wait); fishingDialog: Fishbook / market stand open (the island rests)
  const [balancesOpen,setBalancesOpen]=useState(false);
  // HUD stack (docs/ui/HUD_STACK.md): the one column under the coins bar, and the arbiter's focus (Town's ~150 ms HUD tick sets it
  // only when it changes). Spot it and job cards report in through refs so the arbiter can see them without extra renders.
  const [hudFocus,setHudFocus]=useState<HudFocus|null>(null),[hudStackEl,setHudStackEl]=useState<HTMLDivElement|null>(null);
  const spotWaiting=useRef(false),jobCardOpen=useRef(false);
  // The job owns the stack (HUD_STACK.md): while a shift runs or a job card is open, the guide (welcome-back) card waits. React state
  // flips only when a job starts/ends or a card opens/closes (set on change; same-value sets bail out).
  const [jobRunning,setJobRunning]=useState(false),[jobCardShown,setJobCardShown]=useState(false);
  const onSpotChange=useRef((waiting:boolean)=>{spotWaiting.current=waiting;wakeLoopRef.current?.();}).current;
  const onJobCardChange=useRef((open:boolean)=>{jobCardOpen.current=open;setJobCardShown(open);wakeLoopRef.current?.();}).current;
  // Door / post prompts never rise into the stack: its bottom edge is --hud-floor (globals.css). One ResizeObserver on the column
  // (it fires only when a piece appears, goes or rewraps), replacing the old per-toast observer and the :has() offset chains.
  useEffect(()=>{const el=hudStackEl,app=el?.closest<HTMLElement>('.town-app');if(!el||!app||typeof ResizeObserver==='undefined')return;
   const publish=()=>{if(el.hidden)return;const top=app.getBoundingClientRect().top,r=el.getBoundingClientRect();app.style.setProperty('--hud-floor',`${Math.round((r.height>0?r.bottom+10:r.top)-top)}px`);};
   const ro=new ResizeObserver(publish);ro.observe(el);return()=>{ro.disconnect();app.style.removeProperty('--hud-floor');};},[hudStackEl]);
  // Heat (overnight audit F1): the full-screen, opaque Choose plays sheet (FieldLearning → PlaysPicker) sleeps the island like a menu.
  const [playsPickerOpen,setPlaysPickerOpen]=useState(false);
  const [settingsOpen,setSettingsOpen]=useState(false),settingsRef=useRef(false);settingsRef.current=playsPickerOpen||graduationOpen||learningOpen||grownUpsOpen||!!konbiniDoor||balancesOpen||settingsOpen||customizerOpen||conversationOpen||storeOpen||onboardingOpen||arcadeOpen||coachesOpen||museumOpen||ferryOpen||!!positionSelection||ballLessons.length>0||cardOfferOpen||fishingDialog;
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
  const [parachuting,setParachuting]=useState(false),parachutingRef=useRef(false);
  const [skyJuggling,setSkyJuggling]=useState(false),skyJugglingRef=useRef(false);
  const [rideMode,setRideMode]=useState<TravelMode>(returningFromArcade?'walk':'jetpack'),rideRef=useRef<TravelMode>(returningFromArcade?'walk':'jetpack');
  const pendingRide=useRef<TravelMode|null>(null),cancelLanding=useRef(false);
  const nearbyTruck=useRef<number|null>(null),requestedTruck=useRef<number|null>(null),truckExitRequested=useRef(false),truckBoostRequested=useRef(false),truckHonkRequested=useRef(false);
  const [truckRiding,setTruckRiding]=useState(false);
  const landOnTruck=()=>{if(nearbyTruck.current!==null){requestedTruck.current=nearbyTruck.current;pendingRide.current='walk';cancelLanding.current=false;}};
  // Island jobs are on foot (Sep 30 2026, docs/island-jobs.md §10): the job's own buttons replace Kick / Juggle / Ride.
  const [jobButtons,setJobButtons]=useState<JobButton[]|null>(null),jobButtonsRef=useRef<JobButton[]|null>(null),jobActiveRef=useRef(false);
  const jobNoteRef=useRef<(text:string)=>void>(()=>{}),jobPressRef=useRef<(b:JobButton,phase:'tap'|'down'|'up')=>void>(()=>{});
  const pressJob=(b:JobButton,phase:'tap'|'down'|'up')=>jobPressRef.current(b,phase);
  const selectRide=(mode:TravelMode)=>{if(!rideAllowed(mode,jobActiveRef.current)){jobNoteRef.current(RIDE_WAIT_NOTE);return;}if(!fuelAllowsRide(mode))return;if(mode==='jetpack'){pendingRide.current=null;cancelLanding.current=true;}if(rideRef.current==='jetpack'&&mode!=='jetpack'){pendingRide.current=mode;setHint(false);return;}rideRef.current=mode;setRideMode(mode);setHint(false);};
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
  const requestLesson=(phase:LessonPhase|'exit')=>{selectRide('walk');lessonCommand.current=phase;setHint(false);setMap(false);setCoachFeedback('');if(phase==='intro'||phase==='practice'){setPassAttempts(newAttempts(passFormat));setAimStatus('none');}};
  // Draw-the-pass lesson flow (lib/town/learningPass.ts): brief → hint → 3 attempts, wording scaled by format.
  const [passFormat,setPassFormat]=useState<LessonFormat>('7v7'),[passAttempts,setPassAttempts]=useState<AttemptState>(()=>newAttempts('7v7')),[aimStatus,setAimStatus]=useState<'none'|'clear'|'threat'|'nobody'>('none');
  const passAttemptsRef=useRef(passAttempts);passAttemptsRef.current=passAttempts;
  const lessonAim=useRef<{straight:()=>void;play:()=>void;cancel:()=>void;replay:()=>void}|null>(null);
  useEffect(()=>{let stored:Storage|null=null;try{stored=localStorage;}catch{}const f=lessonFormat(stored);setPassFormat(f);setPassAttempts(a=>a.used?a:newAttempts(f));},[]);
  const choosePassFormat=(f:LessonFormat)=>{setPassFormat(f);setPassAttempts(a=>({...a,format:f}));try{localStorage.setItem(LESSON_FORMAT_KEY,f);}catch{}};
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
  const travel=useRef<District|'square'|'coaches'|'store'|'cay'|'museum'|null>(null),mapRef=useRef(false);
  const [district,setDistrict]=useState<District>('coast'),[sceneReady,setSceneReady]=useState(false),[failed,setFailed]=useState(false);
  const [minimumLoadElapsed,setMinimumLoadElapsed]=useState(returningFromArcade);
  const loadingComplete=sceneReady&&minimumLoadElapsed;
  const [ready,setReady]=useState(false);
  useEffect(()=>{if(!loadingComplete)return;const timer=window.setTimeout(()=>setReady(true),window.matchMedia('(prefers-reduced-motion: reduce)').matches?60:returningFromArcade?1050:2050);return()=>window.clearTimeout(timer);},[loadingComplete,returningFromArcade]);
  // The loading screen starts sliding away 1.55 s after loadingComplete (IslandLoading .exiting delay): start the arrival as it departs.
  useEffect(()=>{if(!loadingComplete||returningFromArcade)return;const timer=window.setTimeout(()=>arrivalRestartRef.current(),window.matchMedia('(prefers-reduced-motion: reduce)').matches?80:1500);return()=>window.clearTimeout(timer);},[loadingComplete,returningFromArcade]);
  useEffect(()=>{if(returningFromArcade)return;const timer=window.setTimeout(()=>setMinimumLoadElapsed(true),3000);return()=>window.clearTimeout(timer);},[returningFromArcade]);
  useEffect(()=>{if(ready&&!failed&&!returningFromArcade&&shouldShowIslandOnboarding())setOnboardingOpen(true);},[ready,failed]);
  useEffect(()=>{if(!ready||failed)return;const url=new URL(window.location.href);const store=url.searchParams.get('store');if(store===null)return;if(store==='books'&&isVendingPreview())openVending('plaza','display:plaza:book');else openStore(store==='packs'||openArcadePacks?'packs:legend':undefined);url.searchParams.delete('store');window.history.replaceState(null,'',url.pathname+url.search);},[ready,failed]);
  useEffect(()=>{if(testCoinsRequested())void grantTestingCoins();},[]);// dev builds on localhost only (lib/town/vendingPreview.ts, G-16)
  const [minimapCollapsed,setMinimapCollapsed]=useState(false);
  const [map,setMap]=useState(false),[goals,setGoals]=useState(0),[scored,setScored]=useState(false);
  // Admin analytics (lib/analytics/tracker.ts): which open panel the island's time goes to. A module variable, no render.
  const panelActivity=settingsOpen||map||customizerOpen||balancesOpen||onboardingOpen||ferryOpen||playsPickerOpen?'menu':storeOpen?'vending':coachesOpen?'coaches':conversationOpen?'talk':videoPlaying?'films':ballLessons.length>0?'lesson':fishingOpen?'fishing':jobRunning?'job':null;
  useEffect(()=>panelActivity?enterActivity(panelActivity):undefined,[panelActivity]);
  // Lane 2 endgame: certificates, the Coaches Board and the Ferry open other places (Paths on a format, the Ferry, the Museum).
  useEffect(()=>{const open=(event:Event)=>{const d=(event as CustomEvent<EndgameOpen>).detail;if(!d||d.target==='certificate')return;
   setFerryOpen(false);setMuseumOpen(false);setCoachesOpen(false);
   if(d.target==='paths'){if(d.format)try{localStorage.setItem('fi2-path-format-v1',d.format);}catch{}setPathsRequest({nonce:Date.now()});setSettingsOpen(true);}
   else{setSettingsOpen(false);if(d.target==='ferry')setFerryOpen(true);else if(d.target==='museum')setMuseumOpen(true);else setCoachesOpen(true);}};
   window.addEventListener(ENDGAME_OPEN,open);return()=>window.removeEventListener(ENDGAME_OPEN,open);},[]);
  const [positionStore]=useState(()=>createPositionStore(initialSpawn)),[hint,setHint]=useState(!returningFromArcade);
  const zoneAt=(x:number,z:number)=>(nearestVenue(x,z)?1:0)|(Math.abs(x-ISLAND_SQUARE.x)<40&&Math.abs(z-ISLAND_SQUARE.z)<35?2:0);
  const [locationZone,setLocationZone]=useState(()=>zoneAt(initialSpawn.x,initialSpawn.z)),zoneRef=useRef(locationZone),hudRenders=useRef(0);hudRenders.current++;
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
  // Heat pass 3: thumb moves paint on the island's next rendered frame (one compositor frame per island frame, not one per touch
  // event at 60–120 Hz); the input itself still updates at once. Resets, or an island that is not drawing, paint immediately.
  const stickPaint=useRef<{x:number;y:number}|null>(null),islandFrameAt=useRef(0);
  const setStick=({x,y}:{x:number;y:number})=>{if(x===0&&y===0||performance.now()-islandFrameAt.current>100){stickPaint.current=null;paintJoystick(joystick.current,x,y);}else stickPaint.current={x,y};};
  const [mapMounted,setMapMounted]=useState(false);
  useEffect(()=>{if(map){setMapMounted(true);return;}const timer=setTimeout(()=>setMapMounted(false),window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:380);return()=>clearTimeout(timer);},[map]);
  mapRef.current=map||mapMounted;
  const go=(to:District|'square'|'coaches'|'store'|'cay'|'museum')=>{if(to==='coast'||to==='oldtown'){goField(to==='coast'?'futsal':'7v7');return;}fieldSession.current=null;setFieldCatalog(null);if(lessonRef.current)lessonCommand.current='exit';travel.current=to;setMap(false);setHint(false);};
  useEffect(()=>{
    const parent=host.current;if(!parent)return;
    const departure=returningFromArcade?readIslandReturnPosition():null;
    const sceneSpawn=departure?{x:departure.x,z:departure.z}:initialSpawn;
    if(departure){rideRef.current=departure.ride;setRideMode(departure.ride);positionStore.publish(sceneSpawn);const zone=zoneAt(sceneSpawn.x,sceneSpawn.z);zoneRef.current=zone;setLocationZone(zone);}
    let renderer:T.WebGLRenderer;
    // MSAA per lib/graphics/quality phoneGraphicsFor (kept on for phones after the Sep 26 2026 visual check; the lever is PHONE_ANTIALIAS_OFF_AT_DPR2).
    try{renderer=new T.WebGLRenderer({antialias:graphicsQuality().antialias,powerPreference:'default'});}catch{setFailed(true);return;}
    let savedMuted=false;try{savedMuted=localStorage.getItem('fi2-sound-muted')==='true';}catch{}
    const savedVolume=(key:string,fallback:number)=>{try{const raw=localStorage.getItem(key),n=raw===null?fallback:Number(raw);return Number.isFinite(n)?Math.max(0,Math.min(1,n)):fallback;}catch{return fallback;}};
    // Apply the requested mix once to existing saves, then retain slider edits.
    let useNewAudioMix=true;try{useNewAudioMix=localStorage.getItem('fi2-audio-mix')!=='4-50-v1';if(useNewAudioMix){localStorage.setItem('fi2-music-volume','.04');localStorage.setItem('fi2-sound-volume','.5');localStorage.setItem('fi2-audio-mix','4-50-v1');}}catch{}
    const initialSoundVolume=useNewAudioMix?.5:savedVolume('fi2-sound-volume',.5),initialMusicVolume=useNewAudioMix?.04:savedVolume('fi2-music-volume',.04);setSoundVolume(initialSoundVolume);setMusicVolume(initialMusicVolume);
    const sound=createIslandSound(savedMuted,initialSoundVolume);soundRef.current=sound;setSoundMuted(savedMuted);
    let savedMusic=true;try{savedMusic=localStorage.getItem('fi2-music-enabled')!=='false';}catch{}
    const music=createIslandMusic(savedMusic,initialMusicVolume,sound.getContext,sound.setMusicAudible,{active:()=>isVideoPlaying()||lessonVoiceSpeaking()||Boolean(fieldSession.current?.playing),onIdle:sound.setIdle});musicRef.current=music;setMusicEnabled(savedMusic);
    const quality=graphicsQuality(),budget=new FrameBudget();renderer.setPixelRatio(quality.pixelRatio);
    // Phones/tablets: 1.5x pixel ratio while the view moves, full sharpness after 0.5 s still (heat audit pass 2, proposal A).
    // Phones hold one resolution (the governor's tier sets it); the moving/still switch stays a desktop-free no-op on them.
    const motionResolution=new MotionResolution(quality.pixelRatio,dynamicResolutionEnabled(window.devicePixelRatio||1,window.matchMedia('(pointer: coarse)').matches),quality.phone?quality.pixelRatio:undefined);
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;parent.appendChild(renderer.domElement);
    const scene=new T.Scene();scene.background=new T.Color('#e8b98b');scene.fog=null;
    // A ball-hunt hint (e.g. "Land inside the ring…") owns the top prompt slot: the Learn-plays card steps aside while it shows.
    const focusArbiter=createFocusArbiter();let hudFocusNow:HudFocus|null=null;// HUD stack arbiter (lib/ui/hudStack.ts), decided on the HUD tick
    let coinHintShown=false,seaNoteShown=false,pierNoteTimer:ReturnType<typeof setTimeout>|undefined;const pierTarget=createPierTarget(scene);// East Pier shooting ring (eastPierChallenge.ts): static, moved only on a hit.
const coinHunt=createCoinHunt(scene,()=>sound.ui('click'),(text:string)=>{coinHintShown=!!text;setCoinNear(text);},c=>{earnForBall(c);setBallLessons(queue=>queue.includes(c.id)?queue:[...queue,c.id]);});
    const jobs=createJobScene(scene);// island jobs + Community Garden (docs/island-jobs.md)
    let suppressInitialArrival=returningFromArcade;const characterArrival=createCharacterArrival(scene);arrivalRestartRef.current=()=>{suppressInitialArrival=false;characterArrival.restart();wakeLoopRef.current();};
    const camera=new T.PerspectiveCamera(40,1,1,500);if(returningFromArcade)camera.position.set(initialSpawn.x+18,23+fieldSurfaceHeight(initialSpawn.x,initialSpawn.z),initialSpawn.z+30);
    const hemi=new T.HemisphereLight('#ffe0aa','#9b785c',2.0);scene.add(hemi);
    const sun=new T.DirectionalLight('#ffc477',3.0);sun.position.set(-288,252,198);sun.castShadow=true;sun.shadow.mapSize.set(quality.shadowSize,quality.shadowSize);Object.assign(sun.shadow.camera,{left:-35,right:35,top:35,bottom:-35,near:1,far:100});sun.shadow.normalBias=.12*2048/quality.shadowSize;/* bias scales with the texel: 1024² phones would show acne stripes on flat roofs at .12 (heat pass 4) */sun.shadow.bias=-.0002;sun.shadow.radius=3;scene.add(sun);scene.add(sun.target);
    try{const saved=localStorage.getItem('fi2-time-of-day');if(saved==='day'||saved==='sunset'||saved==='night'){timeRef.current=saved;setTimeOfDay(saved);}}catch{}
    const lighting=createIslandLighting(scene,hemi,sun,renderer);lighting.update(timeRef.current,0,true);
    let wasSettingsOpen=false;
    const learningView=createLearningView();let wasLearning=false;
    const quizView=createQuizViewControls(renderer.domElement,camera,()=>Boolean(learningFormat.current));resetQuizView.current=quizView.reset;
    const LEARNING_HIDE=['vending-machines','fishing-spots','fishing-spot-selection','market-stand-selection','fishing-live','fishing-shore-foam'];let learningHidden:[T.Object3D,boolean][]|null=null;
    const world=buildTown(scene),vending=createVendingMachines(scene,{coins:()=>readArcadeWallet().balance});world.obstacles.push(...vending.obstacles,...fishingKioskObstacles());vendingRef.current=vending;
    const fields=buildFormatFields(scene),ballReactions=createBallReactions(scene),games=createFieldRuntime(scene,ballReactions);gamesRef.current=games;const fieldBump=createFieldCollision();
    const shadowBatches=createStaticShadowBatches(renderer,scene,window.matchMedia("(pointer: coarse)").matches);
    const npcShadows=createNpcShadowBatch(renderer,scene);/* heat pass 6b: wrapped inside shadowVisibility, so it batches only casters that survive its culling */
    const shadowVisibility=createShadowVisibility(renderer,scene,sun);
    const shadowCache=createStaticShadowCache(renderer,scene,sun,!window.matchMedia("(pointer: coarse)").matches);
    coinHunt.connectCollisions(world.obstacles,world.roofObstacles);
    const ballObstacleGrid=createObstacleGrid(world.obstacles),ballRoofGrid=createObstacleGrid(world.roofObstacles),ballWallGrid=createObstacleGrid(world.walls),playerOcclusion=createOcclusionProbe((x,z,r)=>ballWallGrid.query(x,z,r));
    const footprint=(o:{x:number;z:number;w:number;d:number})=>`${o.x}:${o.z}:${o.w}:${o.d}`;
    const ballBuildingHeights=new Map(world.buildings.map(b=>[footprint(b),b.height]));
    const ballAboveBuilding=(o:{x:number;z:number;w:number;d:number},height:number)=>(ballBuildingHeights.get(footprint(o))??Infinity)<=height;
    const treeDebris=createTreeDebris(scene,world.assets,fieldSurfaceHeight);
    // Kicked props sway, rustle, jolt or ripple for <1 s with a soft cue (lib/graphics/propReactions.ts); idle = one check.
    const propSpecs=[...world.propSpecs,...fields.propSpecs],propReactions=createPropReactions(propSpecs);
    const propCue=(cue:string|null)=>{if(cue)document.dispatchEvent(new CustomEvent('fi2-job-cue',{detail:cue}));};
    const coachPractice=createCoachPractice(scene,ballReactions);
    const chooseFieldTarget=(event:PointerEvent)=>{const s=fieldSession.current;if(!s?.quiz||s.answer!==null||quizView.blocksSelection())return;const r=renderer.domElement.getBoundingClientRect(),view=renderer.getViewport(new T.Vector4()),top=r.height-view.y-view.w;const answer=games.pickQuiz(new T.Vector2((event.clientX-r.left-view.x)/view.z*2-1,1-(event.clientY-r.top-top)/view.w*2),camera);if(answer!==undefined){tapHaptic();s.onAnswer?.(answer);}};
    renderer.domElement.addEventListener('pointerup',chooseFieldTarget);
    setMapFootprints({roads:world.roads,buildings:world.buildings});
    const liveKnockout=createLiveKnockout(scene);
    const player=createPlayer('you','home',true,true);player.setShirtNumber(DEFAULT_PLAYER_NUMBER);player.setBeanLook(beanLookFor(customizationRef.current),playerOutfit(customizationRef.current));player.setProfile(profileFor('you',0));scene.add(player.root);player.root.scale.setScalar(1.12);player.root.name='main-character';player.root.rotation.y=departure?.yaw??(returningFromArcade?0:Math.atan2(16,33));const characterGlow=createCharacterGlow(player.root);
    const characterRay=new T.Raycaster();let hoverPoint:T.Vector2|null=null,characterHovered=false;
    const ferryGlow=createBuildingGlow(world.ferry,8.3,17.3,4.8,'ferry');
    // Lane 2: the ferry's lock (and its sparkles) leave once all four paths graduate; one visibility write per change, no loop.
    const showFerryLock=()=>{const locked=!ferryUnlocked(readGraduations());for(const name of ['matchday-ferry-locked','ferry-lock-particles']){const lock=world.ferry.getObjectByName(name);if(lock&&lock.visible!==locked){lock.visible=locked;wakeLoopRef.current?.();}}};
    showFerryLock();window.addEventListener(GRADUATIONS_CHANGED,showFerryLock);
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
    const arcadeHit=new T.Vector3();
    // Konbinis (Sep 29 2026): enterable like the Arcade, with the same building highlight, hover and from-the-air Enter.
    const konbiniBox=(d:KonbiniDoor)=>{const b=KONBINI_BUILDINGS[d];return new T.Box3(new T.Vector3(b.x-b.w/2,0,b.z-b.d/2),new T.Vector3(b.x+b.w/2,b.h,b.z+b.d/2));};
    const konbiniBounds={main:konbiniBox('main'),cay:konbiniBox('cay')},pointsAtKonbini=(d:KonbiniDoor)=>characterRay.ray.intersectBox(konbiniBounds[d],arcadeHit)!==null;
    const pointsAtArcade=()=>characterRay.ray.intersectBox(world.arcadeBounds,arcadeHit)!==null;
    const buildingEffects=([
      {name:'arcade',bounds:world.arcadeBounds,z:-59,w:14,d:12,h:6.2},
      {name:'coaches',bounds:world.coachesBounds,z:-43,w:22,d:12,h:7.5},
      {name:'museum',bounds:world.museumBounds,z:181,w:30,d:9,h:5},
      {name:'konbini',bounds:konbiniBounds.main,z:KONBINI_BUILDINGS.main.z,w:KONBINI_BUILDINGS.main.w,d:KONBINI_BUILDINGS.main.d,h:KONBINI_BUILDINGS.main.h},
      {name:'konbini',bounds:konbiniBounds.cay,z:KONBINI_BUILDINGS.cay.z,w:KONBINI_BUILDINGS.cay.w,d:KONBINI_BUILDINGS.cay.d,h:KONBINI_BUILDINGS.cay.h},
      {name:'museum-wing',bounds:world.museumWingBounds,z:186,w:14,d:26,h:5}
    ] as const).map(({name,bounds,z,w,d,h})=>{const center=bounds.getCenter(new T.Vector3()),root=new T.Group();root.name=name+'-selection';root.position.set(center.x,0,z);scene.add(root);const glow=createBuildingGlow(root,w,d,h,name);return{glow,dispose(){glow.dispose();root.removeFromParent();}};});
    const fishing=createFishingWorld(scene,player.root,fishingSession);// fishing posts + market stand prompts (docs/fishing.md)
    let nearMuseum=false,museumHovered=false;let buildingHoverKind='',buildingHoverUntil=0;
    const museumHit=new T.Vector3(),pointsAtMuseum=()=>characterRay.ray.intersectBox(world.museumBounds,museumHit)!==null||characterRay.ray.intersectBox(world.museumWingBounds,museumHit)!==null;
    let nearStore=false,nearArcade=false,nearCoaches=false,storeHovered=false,arcadeHovered=false,coachesHovered=false;
    const coachesHit=new T.Vector3();
    const pointsAtCoaches=()=>characterRay.ray.intersectBox(world.coachesBounds,coachesHit)!==null;const storePromptPoint=new T.Vector3();
    const livePlayerGlow=createNpcHover(scene,'live-player-hover-glow');let livePlayerHover:ReturnType<typeof games.pickPlayer>=null;
    const inspectLivePlayer=(event:PointerEvent)=>{if(fieldSession.current||lessonRef.current||mapRef.current||settingsRef.current||quizView.blocksSelection())return false;const r=renderer.domElement.getBoundingClientRect(),point=new T.Vector2((event.clientX-r.left)/r.width*2-1,1-(event.clientY-r.top)/r.height*2),hit=games.pickPlayer(point,camera,r.width,r.height,learningFormat.current,event.pointerType==='touch');if(!hit)return false;games.setHoverPaused(hit.format);setPositionSelection(hit);sound.ui('click');return true;};
    let pointerStart:{x:number;y:number}|null=null;
    const beginCharacterTap=(event:PointerEvent)=>{pointerStart={x:event.clientX,y:event.clientY};};
    const pickCharacter=(event:PointerEvent)=>{const start=pointerStart;pointerStart=null;if(!start||Math.hypot(event.clientX-start.x,event.clientY-start.y)>10||lessonRef.current||mapRef.current||settingsRef.current)return;if(inspectLivePlayer(event))return;if(fieldMenu.current)return;const rect=renderer.domElement.getBoundingClientRect();characterTapPoint.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);characterRay.setFromCamera(characterTapPoint,camera);if(characterRay.intersectObject(player.root,true).length||nearCharacter(characterTapPoint,event.pointerType==='touch')){tapHaptic();sound.ui('click');setCustomizerOpen(true);setHint(false);return;}const npc=islandNpcs.pick(characterRay)??coachPractice.pick(characterRay)??volleyballGame.pick(characterRay);if(npc){tapHaptic();sound.ui('click');openConversation(npc);setHint(false);return;}const machine=vending.pick(characterRay);if(machine){tapHaptic();sound.ui('click');openVendingRef.current(machine);return;}if(pointsAtFerry()){tapHaptic();sound.ui('click');setFerryOpen(true);return;}if(pointsAtMuseum()){tapHaptic();sound.ui('click');setMuseumOpen(true);return;}if(pointsAtArcade()){tapHaptic();sound.ui('click');setArcadeOpen(true);return;}if(pointsAtKonbini('main')||pointsAtKonbini('cay')){tapHaptic();sound.ui('click');setKonbiniDoor(pointsAtKonbini('main')?'main':'cay');return;}if(pointsAtCoaches()){tapHaptic();sound.ui('click');setCoachesOpen(true);}};
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
    const vehicle=createVehicle();scene.add(vehicle.root);const knockFace=createKnockdownFace(e=>player.setExpression(e));vehicle.root.scale.setScalar(1.12);let appliedCustomization:CharacterCustomization|null=null;let appliedTeamLook=false;let previousRide:TravelMode=rideRef.current;let arrivalFacing:number|undefined=departure?.yaw??(returningFromArcade?0:Math.atan2(16,33));
    const npcs=Array.from({length:2},(_,i)=>{const rig=createPlayer('local'+i,i%2?'away':'home');rig.setShirtNumber(i?4:8);const dress=sideGameDress('local'+i,i%2?'away':'home',i?4:8);rig.setBeanLook(dress.look,dress.outfit);scene.add(rig.root);return rig;});
    const ballMaterial=new T.MeshStandardMaterial({color:'#f4edd3',roughness:.7});const ballAppearance=createBallAppearance(ballMaterial);const ball=new T.Mesh(new T.SphereGeometry(.19,20,16),ballMaterial);ball.castShadow=true;ball.name='player-ball';scene.add(ball);
    addBallPatches(ball,.19);// six dark pentagons; the shop snapshots (StorePreviews) add the same ones
    const ring=new T.Mesh(new T.RingGeometry(.48,.54,48),new T.MeshBasicMaterial({color:'#fff0b7',transparent:true,opacity:.8,side:T.DoubleSide}));ring.name='player-foot-ring';ring.rotation.x=-Math.PI/2;scene.add(ring);const hiddenMarker=createHiddenPlayerMarker(ring);scene.add(hiddenMarker.root);
    const rideChange=createRideChange();scene.add(rideChange.root);
    const guideMaterial=new T.LineDashedMaterial({color:'#e79e6b',dashSize:.35,gapSize:.22,depthTest:false});
    const guide=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(11,.16,21),new T.Vector3(11,.16,9)]),guideMaterial);guide.renderOrder=2;guide.visible=false;scene.add(guide);
    const receiveRing=new T.Mesh(new T.RingGeometry(.65,.72,48),new T.MeshBasicMaterial({color:'#b7e7a6',side:T.DoubleSide,transparent:true,opacity:.8}));receiveRing.rotation.x=-Math.PI/2;receiveRing.visible=false;scene.add(receiveRing);
    let lessonTime=0,lastLane=false;
    const setPhase=(phase:LessonPhase|null)=>{lessonRef.current=phase;setLesson(phase);lessonTime=0;};
    // Draw-the-pass: one fixed-size predicted-path line, a red threat ring and a target ring. Prediction
    // runs only on pointer move; while the child aims, the frozen scene sleeps until the stroke changes.
    // The path is a flat ground ribbon (a 1px line vanishes on a phone), rewritten only when the stroke changes.
    const AIM_POINTS=37,aimGeometry=new T.BufferGeometry();aimGeometry.setAttribute('position',new T.BufferAttribute(new Float32Array(AIM_POINTS*6),3));
    aimGeometry.setIndex(Array.from({length:AIM_POINTS-1},(_,i)=>[i*2,i*2+1,i*2+2,i*2+1,i*2+3,i*2+2]).flat());
    const aimMaterial=new T.MeshBasicMaterial({color:'#b7f1a4',depthTest:false,transparent:true,opacity:.85,side:T.DoubleSide});
    const aimLine=new T.Mesh(aimGeometry,aimMaterial);aimLine.renderOrder=3;aimLine.visible=false;aimLine.frustumCulled=false;scene.add(aimLine);
    const threatRing=new T.Mesh(new T.RingGeometry(.62,.8,48),new T.MeshBasicMaterial({color:'#e0533d',side:T.DoubleSide,transparent:true,opacity:.9,depthTest:false}));threatRing.rotation.x=-Math.PI/2;threatRing.renderOrder=3;threatRing.visible=false;scene.add(threatRing);
    const aimTarget=new T.Mesh(new T.RingGeometry(.4,.48,40),new T.MeshBasicMaterial({color:'#ffd17b',side:T.DoubleSide,transparent:true,opacity:.9,depthTest:false}));aimTarget.rotation.x=-Math.PI/2;aimTarget.renderOrder=3;aimTarget.visible=false;scene.add(aimTarget);
    const lessonDefender={x:DEFENDER.x,z:DEFENDER.z};let passerKick=0,passerFacing=PASSER_FACING,aimRevision=0,stroke:StrokePoint[]|null=null,strokePointer=-1,aimPrediction:LessonPrediction|null=null,aimRecord:AttemptRecord|null=null,lessonPass:AttemptRecord|null=null,replayReturn:LessonPhase='practice',lessonWorld:PuzzleWorld|null=null,lessonSim:{state:()=>PuzzleState;advance:(dt:number)=>void}|null=null,lessonCalled=0,lessonHold=0;
    const aimRay=new T.Raycaster(),aimPlane=new T.Plane(new T.Vector3(0,1,0),0),aimHit=new T.Vector3(),aimScreen=new T.Vector3();
    const showAim=(prediction:LessonPrediction|null)=>{aimPrediction=prediction;aimRevision++;
      if(!prediction){aimLine.visible=threatRing.visible=aimTarget.visible=false;return;}
      const a=aimGeometry.attributes.position.array as Float32Array,path=prediction.path;
      for(let i=0;i<AIM_POINTS;i++){const q=path[Math.min(i,path.length-1)],p0=path[Math.max(0,Math.min(i,path.length-1)-1)],p1=path[Math.min(path.length-1,i+1)];
        const tx=p1.x-p0.x,tz=p1.z-p0.z,l=Math.hypot(tx,tz)||1,w=.13*(1-.45*i/(AIM_POINTS-1)),nx=-tz/l*w,nz=tx/l*w,y=.05+fieldSurfaceHeight(q.x,q.z);
        a.set([q.x+nx,y,q.z+nz,q.x-nx,y,q.z-nz],i*6);}
      aimGeometry.attributes.position.needsUpdate=true;aimGeometry.computeBoundingSphere();
      const threat=prediction.threats.length>0;aimMaterial.color.set(threat?'#f1a06c':'#b7f1a4');aimLine.visible=true;
      threatRing.visible=threat;const end=path[path.length-1];aimTarget.position.set(end.x,.15+fieldSurfaceHeight(end.x,end.z),end.z);aimTarget.visible=true;};
    // Lane C's engine (lib/passPuzzle) owns stroke reading, prediction, the pass itself and the replay.
    const updateAim=()=>{const kick=stroke&&lessonWorld?readLessonStroke(stroke,lessonWorld):null;
      if(!kick||!lessonWorld){aimRecord=null;showAim(null);setAimStatus('none');return;}
      const prediction=predictLessonPass(lessonWorld,kick);
      aimRecord={kick,prediction,receiver:{x:location.x,z:location.z},defender:{x:DEFENDER.x,z:DEFENDER.z},start:lessonWorld.snapshot(),inputs:[]};showAim(prediction);setAimStatus(prediction.threats.length||prediction.end==='intercept'?'threat':prediction.end==='receive'?'clear':'nobody');};
    const groundAt=(event:PointerEvent)=>{const r=renderer.domElement.getBoundingClientRect(),view=renderer.getViewport(new T.Vector4()),top=r.height-view.y-view.w;
      aimRay.setFromCamera(new T.Vector2((event.clientX-r.left-view.x)/view.z*2-1,1-(event.clientY-r.top-top)/view.w*2),camera);aimPlane.constant=-fieldSurfaceHeight(PASSER.x,PASSER.z);
      return aimRay.ray.intersectPlane(aimPlane,aimHit)?{x:aimHit.x,z:aimHit.z}:null;};
    const nearBallOnScreen=(event:PointerEvent)=>{const r=renderer.domElement.getBoundingClientRect();aimScreen.set(PASSER.x,fieldSurfaceHeight(PASSER.x,PASSER.z)+.2,PASSER.z).project(camera);return Math.hypot((aimScreen.x+1)/2*r.width+r.left-event.clientX,(1-aimScreen.y)/2*r.height+r.top-event.clientY)<=56;};
    const startLessonPass=(record:AttemptRecord)=>{const world=lessonWorld;if(!world||!world.kick(record.kick))return;record.inputs=world.inputs();lessonPass=record;lessonSim={state:()=>world.state,advance:dt=>world.step(dt)};lessonHold=0;stroke=null;strokePointer=-1;velocity.x=velocity.z=0;setPhase('passing');};
    const aimDown=(event:PointerEvent)=>{if(lessonRef.current!=='aim'||event.button>0)return;const p=groundAt(event);if(!p||!(strokeStartsAtBall(p)||nearBallOnScreen(event)))return;
      event.preventDefault();strokePointer=event.pointerId;try{renderer.domElement.setPointerCapture(event.pointerId);}catch{}stroke=[{x:PASSER.x,z:PASSER.z,t:event.timeStamp/1000}];updateAim();wakeLoop();};
    const aimMove=(event:PointerEvent)=>{if(event.pointerId!==strokePointer||!stroke||lessonRef.current!=='aim')return;const p=groundAt(event);if(!p)return;const last=stroke[stroke.length-1];if(Math.hypot(p.x-last.x,p.z-last.z)<.2)return;
      if(stroke.length>=64)stroke.splice(1,1);stroke.push({x:p.x,z:p.z,t:event.timeStamp/1000});updateAim();wakeLoop();};
    const aimUp=(event:PointerEvent)=>{if(event.pointerId!==strokePointer)return;strokePointer=-1;if(lessonRef.current==='aim'&&aimRecord)startLessonPass(aimRecord);else{stroke=null;updateAim();}wakeLoop();};
    renderer.domElement.addEventListener('pointerdown',aimDown);renderer.domElement.addEventListener('pointermove',aimMove);renderer.domElement.addEventListener('pointerup',aimUp);renderer.domElement.addEventListener('pointercancel',aimUp);
    // Keyboard / switch access: preview a straight pass to the receiver, then play it.
    lessonAim.current={
      straight:()=>{if(lessonRef.current!=='aim')return;stroke=[{x:PASSER.x,z:PASSER.z,t:0},{x:location.x,z:location.z,t:.3}];updateAim();wakeLoop();},
      play:()=>{if(lessonRef.current==='aim'&&aimRecord)startLessonPass(aimRecord);wakeLoop();},
      cancel:()=>{if(lessonRef.current!=='aim')return;stroke=null;updateAim();setPhase('practice');wakeLoop();},
      replay:()=>{const last=passAttemptsRef.current.last;if(!last||lessonRef.current==='replay'||lessonRef.current==='passing')return;replayReturn=lessonRef.current==='complete'?'complete':'practice';lessonPass=last;const run=replayLessonPass(last.start,last.inputs,REPLAY_SPEED);lessonSim={state:()=>run.world.state,advance:dt=>{run.advance(dt);}};lessonHold=0;showAim(last.prediction);setPhase('replay');wakeLoop();},
    };
    const location={...sceneSpawn},velocity={x:0,z:0},orb={x:sceneSpawn.x+.7,z:sceneSpawn.z,vx:0,vz:0};
    const volleyballGame=createVolleyballGame(scene,ballReactions);
    const truckReactions=createTruckReactions(scene);
    const rideRamps=[...planRideRamps(world.roads,world.obstacles,world.surfaceAreas.filter(area=>area.kind==='path')),...planRoofRamps(world.buildings)],rampVisuals=createRideRampVisuals(rideRamps),rampMotion=createRampMotion(rideRamps,world.obstacles,world.buildings,world.walls);scene.add(rampVisuals.root);
    const streetTraffic=createStreetTraffic(scene,world.obstacles,world.roads,rideRamps);
    const rooftop=createRooftopTravel([...world.buildings,...world.walkSurfaces],world.obstacles,location,world.roofObstacles,(x,z)=>rampSurface(rideRamps,x,z),world.landingExclusions);
    const islandNpcs=createIslandNpcs(scene,{isWalkable:(x,z)=>rooftop.canLand(x,z)&&Math.abs(rooftop.surface(x,z)-fieldSurfaceHeight(x,z))<.2&&!world.roads.some(road=>Math.abs(x-road.x)<road.w/2+.4&&Math.abs(z-road.z)<road.d/2+.4),heightAt:fieldSurfaceHeight},ballReactions);
    shadowVisibility.addDynamicRoots([islandNpcs.root,streetTraffic.root]);npcShadows.addRoots([islandNpcs.root]);
    // Heat audit Sep 30 2026 ("only what's in view"): for each render, hide static chunks and units whose sun-swept volume misses the view (pixel-identical).
    const viewGate=createViewGate(renderer,scene,sun);viewGate.addUnitRoots([islandNpcs.root,streetTraffic.root,coinHunt.root]);
    const noObstacles:Parameters<typeof blocked>[2]=[],fieldBumpCtx={entries:games.entries,npcs:islandNpcs.entries,height:0,ride:'walk',disabled:false,canMove:(x:number,z:number)=>!blocked(x,z,noObstacles,0)};
    const onboardingNpcFocus=createOnboardingNpcFocus(islandNpcs),npcHover=createNpcHover(scene);
    let hoveredNpcId:string|null=null;
    const leftHand=new T.Vector3(),rightHand=new T.Vector3();
    const rollWalkingBall=createGroundBallRoll();
    const airBallFrom=new T.Vector3(),airBallTo=new T.Vector3(),dribblePlayer={x:0,y:0,z:0,yaw:0};
    const walkBall=createWalkBall(),ballEffects=createBallEffects(),rideTricks=createRideTricks(),jetActions=createJetpackActions(),parachute=createParachute(),sonicBurst=createSonicBurst(),parachuteTrail=createParachuteTrail(),craterEffect=createCraterEffect();scene.add(ballEffects.root,parachute.root,sonicBurst.root,parachuteTrail.root,craterEffect.root);
    // Kicked vending machines shake and vibrate with a thunk (lib/graphics/vendingKick.ts); idle = no work.
    const vendingKick=createVendingKick({scene,entries:vending.entries,material:vending.material,size:vending.size,host:parent.parentElement});
    const walkingFrameHit:FrameHit={x:0,y:0,z:0,t:0,nx:0,ny:0,nz:0,part:'post'};
    const landingMarker=createLandingMarker();scene.add(landingMarker.root);
    let landingPreview:{x:number;z:number}|null=null,previewX=Infinity,previewZ=Infinity,previewAge=1;
    const flight={cruiseHeight:departure?.ride==='jetpack'?departure.flightHeight:INITIAL_FLIGHT_HEIGHT,height:departure?.flightHeight??(returningFromArcade?fieldSurfaceHeight(location.x,location.z):INITIAL_FLIGHT_HEIGHT),takeoffTime:1.05,startHeight:fieldSurfaceHeight(location.x,location.z),landTime:-1,landHeight:0,landing:null as {x:number;z:number}|null};
    saveArcadeDeparture.current=()=>saveIslandReturnPosition({version:1,x:location.x,z:location.z,yaw:player.root.rotation.y,ride:rideRef.current,flightHeight:flight.height,camera:{x:camera.position.x,y:camera.position.y,z:camera.position.z}});
    (window as unknown as {__fi2?:unknown}).__fi2={get hudRenders(){return hudRenders.current;},get lessonPass(){return {phase:lessonRef.current,time:lessonTime,sleeping:loopSleeping,prediction:aimPrediction,record:lessonPass,defender:{...lessonDefender},threatVisible:threatRing.visible,aimVisible:aimLine.visible,camera,canvas:renderer.domElement};},positionStore,get hiddenTransforms(){return hiddenTransforms;},get renderStats(){return renderStats;},shadowCache,shadowVisibility,viewGate,shadowBatches,npcShadows,liveKnockout,player,characterArrival,coinHunt,treeDebris,rideRamps,rampMotion,streetTraffic,volleyballGame,music:music.getState,sound:sound.debug,scene,renderer,camera,games,world,coachPractice,islandNpcs,truckReactions,walkBall,rideTricks,jetActions,ballReactions,fieldSession,fieldTravel,location,velocity,rideRef,vehicle,flight,flightPoses:flightMotion.poses,rooftop,pendingRide,vending,vendingKick,pierTarget,bounds:ISLAND_BOUNDS,selectRide:(m:TravelMode)=>selectRide(m),get jobFrame(){return jobFrame;},jobMoves:()=>jobMoves,ball};
    (window as unknown as {__fi2:Record<string,unknown>}).__fi2.motionResolution=motionResolution;
    // Heat pass 4: thermal fallback tiers + Battery saver (lib/graphics/heatTier). Tier 0 (default) changes nothing.
    const heat=createIslandHeat({renderer,sun,resolution:motionResolution,npcs:islandNpcs,traffic:streetTraffic,governed:quality.phone});(window as unknown as {__fi2:Record<string,unknown>}).__fi2.heat=heat;(window as unknown as {__fi2:Record<string,unknown>}).__fi2.propReactions=propReactions;(window as unknown as {__fi2:Record<string,unknown>}).__fi2.propSpecs=propSpecs;if(quality.phone&&heatOptions().lambertScenery)applyLambertScenery(scene);// visible option, off by default
    sharpenSceneTextures(scene,renderer.capabilities.getMaxAnisotropy());// quality pass: crisp textures at grazing angles
    const targetMovement=(target:BallHitTarget):{canMove:(nx:number,nz:number)=>boolean;move:(nx:number,nz:number)=>void}=>( {canMove:(nx,nz)=>rooftop.canLand(nx,nz)&&Math.abs(rooftop.surface(nx,nz)-target.y)<.3,move:(nx,nz)=>{const npc=islandNpcs.entries.find(e=>'npc:'+e.id===target.id);if(npc){npc.position.x=nx;npc.position.z=nz;return;}const volleyball=volleyballGame.entries.find(e=>'npc:'+e.id===target.id);if(volleyball){volleyball.position.x=nx;volleyball.position.z=nz;return;}const coach=coachPractice.entries.find(e=>'npc:'+e.id===target.id);if(coach){coach.offset.x+=nx-coach.position.x;coach.offset.z+=nz-coach.position.z;coach.position.x=nx;coach.position.z=nz;return;}for(const field of games.entries){const prefix='field:'+field.venue.id+':';if(target.id.startsWith(prefix)){const actor=field.sim.players[target.id.slice(prefix.length)];if(actor){const f=liveFieldPoint(field.venue,nx,nz);actor.x=f.x;actor.y=f.y;actor.vx=actor.vy=0;}break;}}}} );
    let truckHitAge=0,lastHitTruck=-1;const lastTruckHitPosition={x:0,z:0},lightRidePosition=new T.Vector3();
    const previousLocation={...location},visualLocation={...location};
    const keys=new Set<string>(),camTarget=new T.Vector3(),lookAt=new T.Vector3(),walkOffset={x:18,z:30},walkLead={x:0,z:0};
    const jetpackBreakup=createJetpackBreakup();scene.add(jetpackBreakup.root);
    let spinCrashAge=Infinity;
    const renderStats={rendered:0,skipped:0,sleeps:0,idleRide:0};let loopSleeping=false,resizeRevision=0,idleSince=0,idleRevision=-1,idleAppearance:CharacterCustomization|null=null,idleTimeOfDay='',idleGrace=0;
    // A quiz question waiting for its answer (or answered, once its replay has ended or paused) sleeps like a menu once the camera
    // has settled. Canvas gestures bump quizInput and wake it.
    let idleQuiz='',quizInput=0,cameraMoving=false,lastCameraZoom=1;const lastCameraPosition=new T.Vector3(),lastCameraQuaternion=new T.Quaternion();
    const wakeQuizInput=(event:Event)=>{if(!fieldSession.current?.quiz||event.type==='pointermove'&&!(event as PointerEvent).buttons)return;quizInput++;wakeLoop();};
    for(const name of ['pointerdown','pointermove','wheel','touchstart','touchmove'] as const)renderer.domElement.addEventListener(name,wakeQuizInput,{passive:true});
    const domCache=new Map<string,HTMLElement>();const uiElement=<E extends HTMLElement>(selector:string)=>{const previous=domCache.get(selector);if(previous?.isConnected)return previous as E;const el=parent.parentElement?.querySelector<E>(selector);if(el)domCache.set(selector,el);return el;};
    /** Door "Enter" prompts (QA11 A-1): the projected door point, but globals.css keeps the pill below the HUD row and below a
     *  "Talk to …" prompt (the same :has() stacking rule as the ball-hunt hint), so it never overlaps another tap target. */
    const placeEntryPrompt=(el:HTMLElement,left:number,top:number)=>{if(el.dataset.entryPrompt===undefined)el.dataset.entryPrompt='';if(el.style.left!=='0px')el.style.left='0px';if(el.style.top!=='0px')el.style.top='0px';const x=`${Math.round(left*2)/2}px`,y=`${Math.round(top*2)/2}px`;if(el.style.getPropertyValue('--entry-x')!==x)el.style.setProperty('--entry-x',x);if(el.style.getPropertyValue('--entry-y')!==y)el.style.setProperty('--entry-y',y);};
    const placeUI=(el:HTMLElement,left:number,top:number)=>{const position=`${Math.round(left*2)/2}px ${Math.round(top*2)/2}px`;if(el.style.left!=='0px')el.style.left='0px';if(el.style.top!=='0px')el.style.top='0px';if(el.style.translate!==position)el.style.translate=position;};
    let hudX=NaN,hudZ=NaN,hudJuggling:boolean|undefined,signalMode='';
    let viewportW=1,viewportH=1;
    const setUIHidden=(el:HTMLElement,hidden:boolean)=>{if(el.hidden!==hidden)el.hidden=hidden;};
    // Heat (overnight audit F2): a leaving field card used to rewrite disabled/tabindex on every frame of its 350 ms fade (each write is a
    // mutation that can restyle the page's :has() rules). Write only on change, like setUIHidden.
    const setCardInactive=(button:HTMLButtonElement)=>{if(!button.disabled)button.disabled=true;if(button.tabIndex!==-1)button.tabIndex=-1;};
    let firstFrame=true,lastRendered=0,shadowElevation=0,boostLean=0,flightHeading=player.root.rotation.y;
    const coarse=window.matchMedia("(pointer: coarse)").matches;
    const pitchVisibility=createPitchVisibility(),fieldCardExit=new Map<HTMLButtonElement,number>();
    const shadowBasis=new T.Matrix4().lookAt(new T.Vector3(-288,252,198),new T.Vector3(),new T.Vector3(0,1,0));
    const shadowRight=new T.Vector3().setFromMatrixColumn(shadowBasis,0),shadowUp=new T.Vector3().setFromMatrixColumn(shadowBasis,1);
    let last=performance.now(),frame=0,elapsed=0,accumulator=0,disposed=false,lastDistrict:District='coast',lastHud=0,goalTimer=0,lastFieldCheck=-Infinity,cachedVisibleVenue:Format|null=null;
    const resetInputs=(preserveMovement=false)=>{cancelShotHold();heldRidePointers.current.clear();spinGesture.current.reset();spinRequested.current=false;if(!preserveMovement)keys.clear();input.current={x:preserveMovement?input.current.x:0,z:preserveMovement?input.current.z:0,sprint:preserveMovement&&input.current.sprint,kick:false,juggle:false};if(!preserveMovement)releaseStick();};
    /** A job's action cluster owns Space / J / R while it runs (hold steps: key down = press, key up = release). */
    const jobKey=(e:KeyboardEvent,down:boolean)=>{const list=jobButtonsRef.current;if(!list||fieldMenu.current||lessonRef.current)return false;const key=e.code==='Space'?'Space':e.key.toLowerCase()==='j'?'J':e.key.toLowerCase()==='r'?'R':'';if(!key)return false;
      e.preventDefault();const b=list.find(x=>x.key===key);if(!b){if(key==='R'&&down&&!e.repeat)jobNoteRef.current(RIDE_WAIT_NOTE);return true;}
      if(b.hold){if(down&&!e.repeat)jobPressRef.current(b,'down');else if(!down)jobPressRef.current(b,'up');}else if(down&&!e.repeat)jobPressRef.current(b,'tap');return true;};
    const keydown=(e:KeyboardEvent)=>{sound.unlock();music.unlock();if(settingsRef.current)return;if(e.target instanceof HTMLButtonElement&&['Enter',' '].includes(e.key))return;if(jobKey(e,true))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.repeat)return;if(e.key.toLowerCase()==='r'&&!fieldMenu.current&&!lessonRef.current)cycleRide();if(e.key.toLowerCase()==='e'&&nearbyNpcRef.current&&!fieldMenu.current&&!lessonRef.current&&!mapRef.current)openConversation(nearbyNpcRef.current);if(e.key.toLowerCase()==='m')setMap(v=>!v);if(e.key==='Escape')setMap(false);if(e.code==='Space'){if(streetTraffic.rider.index>=0)truckBoostRequested.current=true;else if(rideRef.current==='walk'&&!lessonRef.current&&!fieldMenu.current)beginShotHold('keyboard');else input.current.kick=true;}if(e.key.toLowerCase()==='j'&&!fieldMenu.current&&!lessonRef.current){if(streetTraffic.rider.index>=0)truckHonkRequested.current=true;else input.current.juggle=true;}};
    const keyup=(e:KeyboardEvent)=>{keys.delete(e.key.toLowerCase());if(jobKey(e,false))return;if(e.code==='Space'&&shotHold.current?.id==='keyboard')finishShotHold();};
    const blur=()=>{resetInputs();sound.silence();};
    const visibility=()=>{sound.visibility();music.visibility();last=performance.now();accumulator=0;if(document.hidden)blur();};
    const finishJoystick=(event:PointerEvent)=>{releaseStick(event);releaseRideAction(event.pointerId);};
    const finishTouches=(event:TouchEvent)=>{if(event.touches.length===0)releaseStick();};
    window.addEventListener('pointerup',finishJoystick,true);window.addEventListener('pointercancel',finishJoystick,true);window.addEventListener('touchend',finishTouches,{passive:true});window.addEventListener('touchcancel',finishTouches,{passive:true});window.addEventListener('pagehide',blur);
    window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
    const resize=()=>{resizeRevision++;shadowCache.invalidate();wakeLoop();const w=parent.clientWidth,h=parent.clientHeight;if(w===viewportW&&h===viewportH)return;viewportW=w;viewportH=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();fitIslandShadows(sun,camera,shadowElevation);};const observer=new ResizeObserver(resize);observer.observe(parent);window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);resize();
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // ---- Island job character moves (docs/island-jobs.md §10, lib/town/jobs/jobMoves.ts): poses, Kick the tree, the ball set aside.
    const jobMoves=createJobMoves(),NO_JOB_FRAME:JobFrame={pose:null,stand:null,ball:null,still:false,caught:false};let jobFrame=NO_JOB_FRAME,jobWas=false,jobStroke=9,jobKickLast=0;
    const jobHandL=new T.Vector3(),jobHandR=new T.Vector3();const jobSpotV=new T.Vector3();
    /** Fuel (bug A6): false until the player first moves after the arrival; the opening hover is never charged. */
    let fuelArmed=false;
    const jobFloor=(x:number,z:number)=>rooftop.surface(x,z),jobPlayer=()=>({x:location.x,z:location.z,y:rooftop.state.height,yaw:player.root.rotation.y});
    const jobBallNow=()=>({x:ball.position.x,y:ball.position.y,z:ball.position.z});
    const canStandJob=(x:number,z:number)=>rooftop.canLand(x,z)&&Math.abs(rooftop.surface(x,z)-rooftop.state.height)<.35;
    jobNoteRef.current=text=>jobs.note(text);
    /** The job's pose, facing, kick and step-back over the walking motion (only while a job frame is live). */
    const withJob=(m:NonNullable<Parameters<typeof player.update>[5]>)=>{const f=jobFrame;if(f===NO_JOB_FRAME||rideRef.current!=='walk')return m;
      if(f.pose){m.job=f.pose;if(!UPPER_POSES.has(f.pose.kind)){m.juggle=undefined;m.dribbling=false;}}
      if(f.facing!==undefined){m.facing=f.facing;m.intentHeading=undefined;}
      if(f.kick!==undefined){m.kick=f.kick;m.actionKind='pass';m.strikeX=0;m.strikeZ=.65/Math.max(.1,player.root.scale.x);m.powerKick=false;m.shotCharge=undefined;m.juggle=undefined;m.dribbling=false;}
      if(f.shotStep!==undefined)m.shotStep=f.shotStep;
      if(f.ball)m.dribbling=false;
      return m;};
    const offJobView=jobs.subscribe(()=>{const a=jobs.getView().active,next=a?.buttons??null;if(jobActiveRef.current!==!!a)setJobRunning(!!a);jobActiveRef.current=!!a;
      if(JSON.stringify(next)!==JSON.stringify(jobButtonsRef.current)){jobButtonsRef.current=next;setJobButtons(next);}});
    const offJobEvents=jobs.onEvent((e,def)=>{if(e.type==='pump')jobStroke=0;if(rideRef.current!=='walk')return;const p=poseForEvent(def,e);if(!p)return;
      const target=p.at==='spot'&&e.index!==undefined?jobs.spot(e.index):p.at==='item'&&e.x!==undefined&&e.z!==undefined?{x:e.x,z:e.z}:p.at==='deliver'?jobs.deliverPoint():null;
      jobMoves.start(p.kind,jobPlayer(),target,jobFloor,reduced,jobBallNow(),!!p.basket);wakeLoop();});
    jobPressRef.current=(b,phase)=>{if(!b.enabled&&phase!=='up'){if(b.id==='kick')jobs.note('Walk up to a tree with ripe fruit (follow the arrow), then Kick the tree.');return;}
      if(rideRef.current!=='walk'||!jobs.run)return;tapHaptic();wakeLoop();
      if(b.id==='kick'){const tree=jobs.armedTree();if(!tree||jobMoves.kicking)return;
        jobMoves.startKick(tree,jobPlayer(),reduced,jobBallNow(),()=>{sound.ball('bounce');ballEffects.impact(ball.position.x,ball.position.y,ball.position.z);jobs.act('kick');},canStandJob);return;}
      if(b.hold){jobs.act(phase==='up'?b.id+':up':b.id);return;}
      if(phase!=='up')jobs.act(b.id);};
    function liftJetpack(dt:number){
      flight.takeoffTime=Math.min(1.05,flight.takeoffTime+dt);const t=flight.takeoffTime/1.05,q=t-1;
      const ease=reduced?t:1+1.9*q*q*q+.9*q*q;flight.height=flight.startHeight+(flight.cruiseHeight-flight.startHeight)*ease;
    }
    function landingImpact(height:number){
      coinHunt.land({x:location.x,y:height,z:location.z},true);
      const nearby:BallHitTarget[]=[...islandNpcs.entries.map(e=>({id:'npc:'+e.id,...e.position})),...volleyballGame.entries.filter(()=>volleyballGame.root.visible).map(e=>({id:'npc:'+e.id,...e.position})),...coachPractice.entries.map(e=>({id:'npc:'+e.id,...e.position})),...games.entries.flatMap(e=>Array.from(e.rigs.entries()).filter(([,rig])=>e.root.visible&&rig.root.visible).map(([id,rig])=>({id:'field:'+e.venue.id+':'+id,x:rig.root.position.x,y:rig.root.position.y,z:rig.root.position.z})))];
      let hit=false;for(const p of nearby){const dx=p.x-location.x,dz=p.z-location.z;if(Math.abs(p.y-height)>.8||Math.hypot(dx,dz)>4)continue;const yaw=Math.hypot(dx,dz)>.05?Math.atan2(dx,dz):player.root.rotation.y;hit=ballReactions.hit(p,Math.sin(yaw)*14,Math.cos(yaw)*14)||hit;}
      if(hit){sound.impact();tapHaptic();}
    }
    let wasTruckRiding=false;let truckLanding:number|null=null;const truckApproach={x:0,z:0};
    function tick(dt:number){
      liveKnockout.buttons(input.current);// Rooftop Knockout: kick on press (buffered) and Dodge, before anything clears the buttons.
      if(liveKnockout.frozen){input.current.kick=input.current.juggle=false;velocity.x=velocity.z=0;}const arenaPosition=liveKnockout.playerPosition();if(arenaPosition){location.x=arenaPosition.x;location.z=arenaPosition.z;rooftop.reset(location.x,location.z,arenaPosition.y);velocity.x=velocity.z=0;if(liveKnockout.frozen){input.current.kick=input.current.juggle=false;return;}}
      if(liveKnockout.frozen)return;

      if(cancelLanding.current){cancelLanding.current=false;if(flight.landing){flight.landing=null;flight.landTime=-1;flight.startHeight=flight.height;flight.takeoffTime=0;}}
      if(Number.isFinite(spinCrashAge)){spinCrashAge+=dt;if(rooftop.state.recovery<=0)spinCrashAge=Infinity;}
      if(spinRequested.current){spinRequested.current=false;if(coarse&&!liveKnockout.joined&&!fieldMenu.current&&!lessonRef.current&&!rooftop.state.falling&&rooftop.state.recovery<=0){
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
          if(jetActions.state.phase==='parachute'){if(input.current.kick)jetActions.parachuteAction(0,player.root.rotation.y);if(input.current.juggle)jetActions.parachuteAction(1,player.root.rotation.y);}
          if(input.current.kick&&jetActions.state.phase==='idle'){jetActions.start(0,flight.height,player.root.rotation.y,null);sonicBurst.trigger(location.x,flight.height,location.z,player.root.rotation.y,false,FLIGHT_TRAIL_COLORS[customizationRef.current.jetpack],customizationRef.current.jetpack==='classic',customizationRef.current.jetpack);sound.boost();}
          if(input.current.juggle)jetActions.start(1,flight.height,player.root.rotation.y,rooftop.findLanding(location.x,location.z));
        }
        input.current.kick=input.current.juggle=false;
        if(jetActions.state.phase==='parachute'&&pendingRide.current)jetActions.cut();
        if(jetActions.state.phase!=='idle'){
          const sx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+input.current.x,sy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+input.current.z;
          let scanHeld=keys.has(' ');if(!scanHeld&&jetActions.state.phase==='parachute')for(const hold of heldRidePointers.current.values()){if(hold.action===0){scanHeld=true;break;}}
          const phase=jetActions.state.phase,oldX=location.x,oldZ=location.z,result=jetActions.update(dt,location,flight.height,{blocked:flightBlocked,floor:rooftop.surface,steer:{x:sx*.857+sy*.515,z:-sx*.515+sy*.857},scanHeld,reducedMotion:reduced,findLanding:rooftop.findLanding});flight.height=result.height;
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
        if((phase==='passing'||phase==='replay')&&lessonPass&&lessonSim){
          // The live pass steps the engine; "Watch again" re-runs the recorded kick through replay() at 0.38×.
          const record=lessonPass,sim=lessonSim;sim.advance(dt);const f=lessonFrame(sim.state());
          orb.x=f.ball.x;orb.z=f.ball.z;location.x=f.receiver.x;location.z=f.receiver.z;lessonDefender.x=f.defender.x;lessonDefender.z=f.defender.z;passerKick=f.kick;passerFacing=f.passerFacing;lessonCalled=f.done||!f.flying&&f.kick>=.36?0:1;
          threatRing.position.set(lessonDefender.x,.15+fieldSurfaceHeight(lessonDefender.x,lessonDefender.z),lessonDefender.z);
          if(f.done)lessonHold+=dt;
          if(f.done&&lessonHold>(phase==='replay'?.9:.6)){
            if(phase==='passing')record.outcome=f.outcome;
            const success=record.outcome==='receive',back=phase==='replay'?replayReturn:success?'complete':'practice';
            if(phase==='passing')setPassAttempts(recordAttempt(passAttemptsRef.current,record));
            if(back==='practice'){location.x=record.receiver.x;location.z=record.receiver.z;orb.x=PASSER.x;orb.z=PASSER.z;}
            lessonDefender.x=DEFENDER.x;lessonDefender.z=DEFENDER.z;passerKick=0;passerFacing=PASSER_FACING;lessonPass=null;lessonSim=null;lessonCalled=0;showAim(null);setAimStatus('none');setPhase(back);
          }
          return;
        }
        if(phase==='aim'){if(input.current.kick){input.current.kick=false;if(aimRecord)startLessonPass(aimRecord);}velocity.x=velocity.z=0;return;}
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
      if((walkBall.state.mode==='windup'||parachute.covering()||jobFrame.still)&&rideRef.current==='walk')velocity.x=velocity.z=0;
      if(rideRef.current==='walk'&&walkBall.state.mode==='windup'&&walkBall.state.age<SHOT_WINDUP*.55&&!rooftop.state.falling&&rooftop.state.recovery===0){
        const dx=Math.sin(walkBall.state.yaw)*2.8,dz=Math.cos(walkBall.state.yaw)*2.8,nx=location.x+dx*dt,nz=location.z+dz*dt;
        if(rooftop.canLand(nx,nz)&&Math.abs(rooftop.surface(nx,nz)-rooftop.state.height)<.35){velocity.x=dx;velocity.z=dz;}
      }
      const stairBefore=rooftop.state.height;
      const rampBefore={...location},rampStep=rampMotion.update(dt,location,velocity,rideRef.current,reduced);
      const holdStill=walkBall.state.mode==='windup'||parachute.covering()||jobFrame.still&&rideRef.current==='walk';
      if(liveKnockout.joined)liveKnockout.steer(velocity,ix,iz,dt);
      if(!rampStep.owns)rooftop.update(dt,location,velocity,{x:holdStill?0:ix,z:holdStill?0:iz,sprint:(input.current.sprint||keys.has('shift'))&&fuelCanSprint()},rideRef.current);
      // A job action steps the player up to its spot (the plant, the tree's kicking spot), on walkable ground only.
      if(jobFrame.stand&&rideRef.current==='walk'&&!rooftop.state.falling){const sx=jobFrame.stand.x-location.x,sz=jobFrame.stand.z-location.z,sd=Math.hypot(sx,sz);
        if(sd>.03){const stepLen=Math.min(sd,(jobMoves.kicking?6:3.5)*dt),nx=location.x+sx/sd*stepLen,nz=location.z+sz/sd*stepLen;if(canStandJob(nx,nz)){location.x=nx;location.z=nz;}}}
      // Live-field players are solid: slide round them with a soft bump, never a knockdown (lib/town/fieldCollision).
      {fieldBumpCtx.height=rooftop.state.height;fieldBumpCtx.ride=rideRef.current;fieldBumpCtx.disabled=rampStep.owns||rooftop.state.falling||rooftop.state.recovery>0||!!phase||liveKnockout.joined;const bump=fieldBump.step(dt,location,velocity,fieldBumpCtx);if(bump&&fieldBump.feedbackReady()){sound.ball('receive');if(!reduced)navigator.vibrate?.(bump.strength>.6?12:8);}}
      const stairDelta=rooftop.state.height-stairBefore;
      if(!rampStep.owns&&!wasFalling&&!rooftop.state.falling&&rooftop.state.recovery===0&&Math.abs(stairDelta)>.01&&Math.abs(stairDelta)<=1&&world.walkSurfaces.some(s=>Math.abs(location.x-s.x)<=s.w/2+.1&&Math.abs(location.z-s.z)<=s.d/2+.5))sound.stair(rideRef.current,stairDelta>0?'up':'down');
      if(rampStep.crashed){resetInputs();rideTricks.reset();sound.impact();if(!reduced)navigator.vibrate?.([25,30,35]);}
      if(rampStep.recovered){const landingRamp=rideRamps.find(r=>r.landingOnly);if(landingRamp){for(const distance of [.6,1.2,1.8,2.4,3.2]){const x=location.x-Math.sin(landingRamp.yaw)*distance,z=location.z-Math.cos(landingRamp.yaw)*distance;if(rooftop.canLand(x,z)&&rooftop.surface(x,z)<.5){location.x=x;location.z=z;break;}}}rooftop.reset(location.x,location.z);rooftop.state.recovery=1.8;velocity.x=velocity.z=0;resetInputs();}
      if(rampStep.landed){if(rampMotion.state.ramp?.cannon)recordExploreActivity('ramp');coinHunt.land({x:location.x,y:rooftop.surface(location.x,location.z),z:location.z});rooftop.reset(location.x,location.z);sound.ball('bounce');if(!reduced)navigator.vibrate?.(18);}
      if(!rampStep.owns&&!rooftop.state.falling&&rooftop.state.recovery===0&&rampMotion.enter(rampBefore,location,velocity,rideRef.current,rooftop.state.height)){rooftop.reset(location.x,location.z,rampMotion.state.ramp?.base??0);rideTricks.reset();sound.boost('forward');}
      if(!wasFalling&&rooftop.state.falling)sound.fall();
      if(rooftop.jump.started)sound.boost('up');if(rooftop.jump.landed){sound.stair(rideRef.current,'down');if(!reduced)navigator.vibrate?.(18);}
      if(rooftop.state.impact){coinHunt.land({x:location.x,y:rooftop.state.height,z:location.z});sound.impact();}
      if(rooftop.state.impact&&!reduced)navigator.vibrate?.([45,30,65]);
      if(phase==='practice'){
        location.x=T.MathUtils.clamp(location.x,3.8,18.2);location.z=T.MathUtils.clamp(location.z,6,12);
        const lane=passingLane(location);
        // Calling for the ball freezes play: the receiver waves, and the child draws the pass from the ball.
        if(input.current.kick&&passAttemptsRef.current.result==='spent')input.current.kick=false;
        if(input.current.kick){velocity.x=velocity.z=0;setCoachFeedback(lane.open?'':'You called from behind the defender. Watch for the red ring.');stroke=null;aimRecord=null;lessonWorld=createLessonWorld({x:location.x,z:location.z},passAttemptsRef.current.format);showAim(null);setAimStatus('none');setPhase('aim');input.current.kick=false;}
        return;
      }
      if(liveKnockout.frozen)return;
      if(liveKnockout.joined){if(input.current.kick){if(liveKnockout.kick(player.root.rotation.y))sound.ball('kick');input.current.kick=false;input.current.shotPower=0;}input.current.juggle=false;walkBall.reset({...location,y:rooftop.state.height,yaw:player.root.rotation.y});return;}
      const ballPlayer={...location,y:rooftop.state.height,yaw:player.root.rotation.y};
      if(rideRef.current!=='walk'){if(rampMotion.state.phase==='idle'&&input.current.kick)rideTricks.start(rideRef.current,0);if(rampMotion.state.phase==='idle'&&input.current.juggle)rideTricks.start(rideRef.current,1);input.current.kick=input.current.juggle=false;walkBall.reset(ballPlayer);orb.x=location.x+.7;orb.z=location.z;orb.vx=orb.vz=0;return;}
      // A job's own buttons own the ball while it runs: no kicks, juggles or charged shots; a set-down or kicked ball is placed
      // by jobMoves (Kick the tree, the ball beside the player while the hands work).
      if(jobButtonsRef.current){input.current.kick=input.current.juggle=false;input.current.shotPower=0;if(walkBall.state.mode==='charging'||walkBall.state.mode==='windup')walkBall.reset(ballPlayer);}
      if(jobFrame.ball){orb.x=jobFrame.ball.x;orb.z=jobFrame.ball.z;orb.vx=orb.vz=0;return;}
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
        const yaw=coinHunt.aim(ballPlayer,ballPlayer.yaw,(x,z)=>!blocked(x,z,obstacles,.2)&&rooftop.surface(x,z)<=ballPlayer.y+.6)??pierTarget.aim(ballPlayer,ballPlayer.yaw)??assistedShotYaw(ballPlayer,ballPlayer.yaw,targets.filter(t=>!ballReactions.get(t.id)),(x,z)=>!blocked(x,z,obstacles,.2)&&rooftop.surface(x,z)<=ballPlayer.y+.6);const power=input.current.shotPower??0,finish=goalFinish(ballPlayer,power,VENUES);walkBall.shoot(ballPlayer,power>0?ballPlayer.yaw:yaw,power,finish);input.current.shotPower=0;
      }
      input.current.kick=input.current.juggle=false;
      const previousBall={x:walkBall.state.x,z:walkBall.state.z};

      walkBall.update(dt,ballPlayer,{
        frame:(from,to)=>{if(!sweepGoalFrame(from,to,.2,walkingFrameHit))return null;if(walkBall.state.mode==='shot'||walkBall.state.mode==='wall-juggle')propCue(propReactions.hit(walkingFrameHit.x,walkingFrameHit.y,walkingFrameHit.z,walkBall.state.vx,walkBall.state.vz,reduced));return walkingFrameHit;},
        juggleHead:player.juggleHead,headTop:player.headTop,
        moving:Math.hypot(velocity.x,velocity.z)>.15||Math.hypot(input.current.x,input.current.z)>.1,
        ballStyle:customizationRef.current.ball,
        floor:rooftop.surface,
        // Out to sea (ballSea.ts): open water no longer stops the ball; only real solids over it (the buoy, any obstacle) do.
        sea:ballGround,splash:(x,y,z)=>{ballEffects.splash(x,y,z);document.dispatchEvent(new CustomEvent('fi2-path-cue',{detail:'undock'}));const pierNote=pierTarget.splash(x,z,ballPlayer);if(pierNote){seaNoteShown=true;setSeaNote(pierNote);clearTimeout(pierNoteTimer);pierNoteTimer=setTimeout(()=>setSeaNote(''),6500);return;}if(!seaNoteShown){seaNoteShown=true;setSeaNote(OUT_OF_PLAY_NOTE);clearTimeout(pierNoteTimer);pierNoteTimer=setTimeout(()=>setSeaNote(''),5000);}},// one tracked timer for both notes (code review finding 10)
        blocked:(x,z,y)=>{if((walkBall.state.mode==='shot'||walkBall.state.mode==='wall-juggle')&&coinHunt.hit(x,y,z,walkBall.state.vx,walkBall.state.vz))return false;const react=()=>{if(walkBall.state.mode!=='shot'&&walkBall.state.mode!=='wall-juggle')return;const sp=Math.hypot(walkBall.state.vx,walkBall.state.vz);jobs.ballContact(x,y,z,walkBall.state.mode);treeDebris.hit(x,y,z,sp,reduced);propCue(propReactions.hit(x,y,z,walkBall.state.vx,walkBall.state.vz,reduced));world.umbrellaReaction.hit(x,y,z,sp,reduced);if(vendingKick.kick(vendingKick.hitAt(x,y,z),sp)){document.dispatchEvent(new CustomEvent('fi2-vending-cue',{detail:'thunk'}));if(!reduced)navigator.vibrate?.(14);}};if(walkBall.state.mode==='shot'&&ballGround(x,z)!=='land'){const hitSolid=coinHunt.buoySolid(x,y,z)||ballObstacleGrid.query(x,z,.19).some(o=>insideObstacle(x,z,o,.19));if(hitSolid)react();return hitSolid;}const collision=blocked(x,z,ballObstacleGrid.query(x,z,.19).filter(o=>!ballAboveBuilding(o,y+.05)),.19)||ballRoofGrid.query(x,z,.19).some(o=>y>o.floor&&y<o.top+.2&&Math.abs(x-o.x)<o.w/2+.19&&Math.abs(z-o.z)<o.d/2+.19);if(collision)react();return collision;},
        hit:(x,y,z,vx,vz)=>{if(world.umbrellaReaction.hit(x,y,z,Math.hypot(vx,vz),reduced))return true;if(coinHunt.hit(x,y,z,vx,vz))return true;const target=targets.find(t=>!ballReactions.get(t.id)&&y>=t.y-.1&&y<=t.y+1.9&&Math.hypot(x-t.x,z-t.z)<.9);if(!target)return false;return recordExploreKnockover(ballReactions.hit(target,vx,vz,customizationRef.current.ball,targetMovement(target)));},
        impact:(x,y,z)=>{ballEffects.impact(x,y,z);sound.ball('bounce');},strike:()=>{sound.ball('kick');if(walkBall.state.mode==='shot')ballEffects.launch(walkBall.state.x,walkBall.state.y,walkBall.state.z,walkBall.state.charge);},receive:()=>sound.ball('receive')
      });
      Object.assign(orb,{x:walkBall.state.x,z:walkBall.state.z,vx:walkBall.state.vx,vz:walkBall.state.vz});
      if(goalTimer===0&&walkBall.state.mode==='shot'&&VENUES.some(v=>[-1,1].some(side=>{const plane=v.z+side*v.length/2;if((previousBall.z-plane)*side>=0||(orb.z-plane)*side<0||Math.abs(walkBall.state.y-(v.elevation??0))>v.goalHeight)return false;const t=(plane-previousBall.z)/(orb.z-previousBall.z);return Math.abs(previousBall.x+(orb.x-previousBall.x)*t-v.x)<v.goalWidth/2-.1;}))){setGoals(n=>n+1);setScored(true);goalTimer=2.5;walkBall.recall();}
      if(goalTimer===0)setScored(false);
    }
    /** A paused island (menus) stops requesting frames once its frozen frame is drawn: an idle rAF chain would still force a
     * main-thread frame 60 times a second, restyling every running CSS animation over it (even composited ones). Any Town
     * render (menu open/close, appearance, time of day) and any resize wakes it. */
    function wakeLoop(){if(!loopSleeping||disposed||isVideoPlaying())return;loopSleeping=false;cancelAnimationFrame(frame);last=performance.now();accumulator=0;frame=requestAnimationFrame(animate);}
    wakeLoopRef.current=wakeLoop;
    // Idle ride / flight (lib/town/idleRide.ts, Oct 1 2026): no input and no travel for 4 s on a ride or the jetpack → 20 fps.
    const idleRide=createIdleRide(),idleInput=new AbortController(),stir=()=>idleRide.stir(performance.now());
    for(const type of ['pointerdown','pointermove','keydown','wheel'])window.addEventListener(type,stir,{capture:true,passive:true,signal:idleInput.signal});
    const dailyPlay=createDailyPlay({now:Date.now,claim:grantDailyPlayCoins,earned:amount=>window.dispatchEvent(new CustomEvent('fi2-daily-play-earned',{detail:{amount}}))});
    let dailyX=location.x,dailyZ=location.z;
    const exploreZones=createExploreZones(exploreActivityNow(),kind=>recordExploreActivity(kind));// Coral Cay / East Jetty checklist items (G-13)
    function animate(now:number){
      loopSleeping=false;
      if(disposed||isVideoPlaying()){last=now;accumulator=0;return;}frame=requestAnimationFrame(animate);
      if(document.hidden){last=now;return;}
      const paused=(mapRef.current||settingsRef.current)&&!(onboardingRef.current&&onboardingNpcStep.current),quiz=fieldSession.current,quizWaiting=!paused&&Boolean(quiz?.quiz&&(quiz.answer===null||!teachingPoseAdvances(quiz,quizOutcomeStep(quiz))));
      // A frozen draw-the-pass aim sleeps like a waiting quiz; each stroke change (aimRevision) wakes one short burst.
      const aimWaiting=!paused&&!quizWaiting&&lessonRef.current==='aim'&&strokePointer<0;
      const quizKey=quizWaiting?`${quiz!.lesson.id}:${quiz!.question}:${learningAngle.current}:${quizInput}:${quiz!.answer}:${quiz!.outcomeProgress??0}`:aimWaiting?`aim:${aimRevision}`:'';
      if(!paused&&!quizWaiting&&!aimWaiting){idleSince=0;idleTimeOfDay=timeRef.current;}else{
        if(!idleSince||idleRevision!==resizeRevision||idleAppearance!==customizationRef.current||idleTimeOfDay!==timeRef.current||idleQuiz!==quizKey||quizWaiting&&cameraMoving){idleGrace=idleTimeOfDay!==timeRef.current?3000:quizWaiting||aimWaiting?1200:0;idleSince=now;idleRevision=resizeRevision;idleAppearance=customizationRef.current;idleTimeOfDay=timeRef.current;idleQuiz=quizKey;}
        if(now-idleSince>idleGrace){last=now;accumulator=0;renderStats.skipped++;renderStats.sleeps++;cancelAnimationFrame(frame);loopSleeping=true;return;}
      }
      const idleFrame=idleRide.interval(now,rideRef.current!=='walk');
      renderStats.idleRide=idleFrame;
      if(idleFrame||coarse||heat.cap30){const slot=frameCapSlot(now,lastRendered,Math.max(idleFrame,heat.frameMs));if(slot<0)return;lastRendered=slot;}else lastRendered=now;
      idleRide.sample(now,player.root.position,camera.position);
      const ms=now-last;last=now;
      const dt=Math.max(0,Math.min(ms/1000,.05)),active=!mapRef.current&&!settingsRef.current&&!vending.zooming;
      coinHunt.update(dt,{x:location.x,y:rideRef.current==='jetpack'?flight.height:rooftop.state.height+rampMotion.state.lift,z:location.z},active&&!fieldMenu.current&&!lessonRef.current,reduced,rampMotion.state.phase==='air'?rampMotion.state.ramp?.id??null:null,jetActions.state.phase==='parachute',rideRef.current==='jetpack');
      jobs.update(dt,{x:location.x,y:rideRef.current==='jetpack'?flight.height:rooftop.state.height+rampMotion.state.lift,z:location.z},rideRef.current==='walk'?walkBall.state:null,active&&!fieldMenu.current&&!lessonRef.current,!fieldMenu.current&&!lessonRef.current,reduced);
      world.umbrellaReaction.update(active&&!fieldMenu.current?dt:0,reduced);
      treeDebris.update(active&&!fieldMenu.current?dt:0,!fieldMenu.current&&!lessonRef.current,reduced);
      propReactions.update(active&&!fieldMenu.current?dt:0,reduced);
      ballReactions.update(active&&!fieldMenu.current?dt:0,camera,reduced,!fieldMenu.current&&!lessonRef.current);
      lighting.update(timeRef.current,dt,reduced);if(signalMode!==timeRef.current){signalMode=timeRef.current;world.updateTrafficSignals(timeRef.current);}
      streetTraffic.root.visible=!fieldMenu.current&&!lessonRef.current;
      if(truckBoostRequested.current){truckBoostRequested.current=false;if(streetTraffic.rider.index>=0)streetTraffic.boost();}
      if(truckHonkRequested.current){truckHonkRequested.current=false;if(streetTraffic.rider.index>=0)sound.honk();}
      const driveX=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+input.current.x,driveZ=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+input.current.z;
      const dailyMoved=Math.hypot(location.x-dailyX,location.z-dailyZ)>.001;dailyX=location.x;dailyZ=location.z;
      dailyPlay.step(dt,dailyPlayCounts({active,menuOpen:!!fieldMenu.current,inLesson:!!lessonRef.current,onTruck:streetTraffic.rider.index>=0,steering:Math.hypot(driveX,driveZ)>.1,moved:dailyMoved}),!document.hidden);// any steered ride counts (G-11)
      if(active&&!exploreZones.finished)exploreZones.step(dt,location.x,location.z,rideRef.current==='jetpack');
      // Admin analytics: base activity + a place/heat-map sample every ~5 s (lib/analytics/tracker.ts; a no-op when not counting).
      islandFrame(location.x,location.z,fieldSession.current?(fieldSession.current.quiz?'quiz':'lesson'):lessonRef.current?'lesson':fieldMenu.current?'watch':rideRef.current==='jetpack'||jetActions.state.phase==='parachute'?'fly':rideRef.current!=='walk'||streetTraffic.rider.index>=0?'ride':'walk',placeAt);
      if(streetTraffic.root.visible)streetTraffic.update(active?dt:0,{x:location.x,y:rideRef.current==='jetpack'?flight.height:rooftop.state.height+rampMotion.state.lift,z:location.z},{drive:{x:driveX*.857+driveZ*.515,z:-driveX*.515+driveZ*.857},vx:rooftop.state.recovery>0?0:velocity.x,vz:rooftop.state.recovery>0?0:velocity.z,reduced,onCrash:()=>{resetInputs();velocity.x=velocity.z=0;rideTricks.reset();rampMotion.reset();spinCrashAge=0;rooftop.state.recovery=ROOF_RECOVERY_TIME;sound.impact();tapHaptic();}});
      const hitTruck=streetTraffic.rider.index>=0?streetTraffic.cars[streetTraffic.rider.index]:null;
      const ride=rideRef.current,lightRide=ride==='scooter'||ride==='bike'||ride==='moped'?ride:null;
      const rideSpeed=Math.hypot(velocity.x,velocity.z),grounded=rampMotion.state.lift<.45&&!rooftop.state.falling;
      lightRidePosition.set(location.x,rooftop.state.height,location.z);
      const hitIndex=hitTruck?.index??(lightRide==='scooter'?-2:lightRide==='bike'?-3:-4);
      if((!hitTruck&&(!lightRide||!grounded||rideSpeed<2))||!active||fieldMenu.current||lessonRef.current||(hitTruck&&Math.abs(hitTruck.driveSpeed)<1)){lastHitTruck=-1;truckHitAge=0;}
      else{
        const hitPosition=hitTruck?.group.position??lightRidePosition;
        if(lastHitTruck!==hitIndex){lastHitTruck=hitIndex;lastTruckHitPosition.x=hitPosition.x;lastTruckHitPosition.z=hitPosition.z;truckHitAge=.1;}
        truckHitAge+=dt;
        if(truckHitAge>=.1){truckHitAge=0;const position=hitPosition,yaw=hitTruck?.group.rotation.y??player.root.rotation.y;
          let collision=false;
          const strike=(target:BallHitTarget)=>{
            if(ballReactions.get(target.id)||!(hitTruck?truckHitsCharacter(lastTruckHitPosition,position,yaw,target):lightRide&&rideHitsCharacter(lastTruckHitPosition,position,yaw,target,lightRide)))return;
            const movement=targetMovement(target);
            movement.canMove=(x,z)=>!blocked(x,z,ballObstacleGrid.query(x,z,.4).filter(o=>!o.dynamic),.4)&&Math.abs(rooftop.surface(x,z)-target.y)<.3;
            if(ballReactions.hit(target,hitTruck?Math.sin(yaw)*hitTruck.driveSpeed:velocity.x,hitTruck?Math.cos(yaw)*hitTruck.driveSpeed:velocity.z,'sunset',movement,'truck')){collision=true;sound.impact();}
          };
          // Townsfolk get the soft fieldCollision bump from the character's own rides; only a truck knocks them over.
          if(hitTruck)for(const e of islandNpcs.entries)strike({id:'npc:'+e.id,...e.position});
          for(const e of volleyballGame.entries)if(volleyballGame.root.visible)strike({id:'npc:'+e.id,...e.position});
          for(const e of coachPractice.entries)strike({id:'npc:'+e.id,...e.position});
          // Live-field players only get the soft fieldCollision bump from the character's own rides; a truck still knocks them.
          for(const e of games.entries)if(hitTruck&&Math.abs((e.venue.elevation??0)-position.y)<1&&Math.abs(e.venue.x-position.x)<liveHalfX(e.venue)+8&&Math.abs(e.venue.z-position.z)<liveHalfZ(e.venue)+8)for(const token of e.liveFrame.tokens){const p=e.sim.players[token.id];strike({id:'field:'+e.venue.id+':'+token.id,x:liveWorldX(e.venue,p.x,p.y),y:(e.venue.elevation??0)+.105,z:liveWorldZ(e.venue,p.x,p.y)});}
          if(collision){
            const witnesses:{root:T.Object3D;id?:string}[]=[];
            const add=(root:T.Object3D,id?:string)=>{if(!root.visible||Math.hypot(root.position.x-position.x,root.position.z-position.z)>19||Math.abs(root.position.y-position.y)>2||witnesses.some(w=>w.root.position.distanceTo(root.position)<5))return;witnesses.push({root,id});};
            for(const e of games.entries)for(const [id,rig] of e.rigs)if(!ballReactions.get('field:'+e.venue.id+':'+id))add(rig.root);
            for(const e of islandNpcs.entries)if(!ballReactions.get('npc:'+e.id))add(e.rig.root,e.id);
            if(truckReactions.trigger(witnesses.slice(0,3).map(w=>({root:w.root,context:w.id?'island' as const:'match' as const})),!!lightRide&&!hitTruck))for(const witness of witnesses.slice(0,3))if(witness.id)islandNpcs.reactToTruck(witness.id,position.x,position.z);
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
        stroke=null;strokePointer=-1;lessonPass=null;lessonSim=null;lessonWorld=null;lessonCalled=0;aimRecord=null;showAim(null);lessonDefender.x=DEFENDER.x;lessonDefender.z=DEFENDER.z;passerKick=0;passerFacing=PASSER_FACING;
        if(command==='exit'){setPhase(null);location.x=-7;location.z=14;orb.x=-6.3;orb.z=14;}else{setPhase(command);location.x=11;location.z=9;orb.x=PASSER.x;orb.z=PASSER.z;setCoachFeedback('');}
      }
      if(fieldTravel.current){if(rideRef.current!=='walk'){pendingRide.current=null;cancelLanding.current=false;rideRef.current='walk';setRideMode('walk');}suppressInitialArrival=false;streetTraffic.rider.index=-1;rampMotion.reset();arrivalFacing=Math.atan2(16,33);player.root.rotation.y=arrivalFacing;characterArrival.restart();const v=venueById(fieldTravel.current),entrance=venueEntrance(v),p=clearSpotNear(entrance.x,entrance.z,world.obstacles);/* A1 (Oct 3 2026): the 7v7 entrance is inside a vending machine */location.x=p.x;location.z=p.z;velocity.x=velocity.z=0;orb.x=p.x+.7;orb.z=p.z;orb.vx=orb.vz=0;fieldTravel.current=null;rooftop.reset(p.x,p.z);camera.position.set(p.x+18,23+fieldSurfaceHeight(p.x,p.z),p.z+30);resetInputs();}
      // Fast travel lands ON FOOT at the door (G-13): walking shows the Enter prompt there; the ride-change block below resets flight.
      if(travel.current){if(rideRef.current!=='walk'){pendingRide.current=null;cancelLanding.current=false;rideRef.current='walk';setRideMode('walk');}suppressInitialArrival=false;streetTraffic.rider.index=-1;rampMotion.reset();arrivalFacing=Math.atan2(16,33);player.root.rotation.y=arrivalFacing;characterArrival.restart();if(travel.current==='store'){arrivalFacing=SQUARE_VENDING_ARRIVAL.yaw;player.root.rotation.y=arrivalFacing;}const named=travel.current==='square'?ARCADE_DOOR:travel.current==='coaches'?COACHES_DOOR:travel.current==='store'?SQUARE_VENDING_ARRIVAL:travel.current==='cay'?CORAL_CAY_ARRIVAL:travel.current==='museum'?museumExitPoint():DISTRICTS[travel.current],target=clearSpotNear(named.x,named.z,world.obstacles);location.x=target.x;location.z=target.z;velocity.x=velocity.z=0;orb.x=target.x+.7;orb.z=target.z;orb.vx=orb.vz=0;travel.current=null;rooftop.reset(target.x,target.z);camera.position.set(target.x+18,23+fieldSurfaceHeight(target.x,target.z),target.z+30);resetInputs();}
      if(previousRide!==rideRef.current){rampMotion.reset();rideChange.trigger(({walk:1,scooter:1.65,bike:2.15,moped:2.3,jetpack:1.4} as const)[rideRef.current]*.54);jetActions.reset();sound.ride(rideRef.current);if(rideRef.current==='jetpack'){flightMotion.reset();flight.cruiseHeight=INITIAL_FLIGHT_HEIGHT;flight.height=rooftop.state.height;flight.startHeight=flight.height;flight.takeoffTime=0;flight.landTime=-1;flight.landing=null;}velocity.x=velocity.z=0;walkBall.reset({...location,y:rooftop.state.height,yaw:player.root.rotation.y});resetInputs(true);previousRide=rideRef.current;}
      if(Math.hypot(location.x-visualLocation.x,location.z-visualLocation.z)>3){previousLocation.x=location.x;previousLocation.z=location.z;accumulator=0;}
      if(fieldMenu.current){if(!wasLearning)resetInputs();velocity.x=velocity.z=0;accumulator=0;previousLocation.x=location.x;previousLocation.z=location.z;}
      if(active){elapsed+=dt;if(!fieldMenu.current){accumulator+=dt;while(accumulator>=1/60){previousLocation.x=location.x;previousLocation.z=location.z;tick(1/60);accumulator-=1/60;}}}
      else{accumulator=0;velocity.x=velocity.z=0;input.current.kick=false;}
      if(wasTruckRiding!==(streetTraffic.rider.index>=0)){wasTruckRiding=streetTraffic.rider.index>=0;setTruckRiding(wasTruckRiding);}
      sound.truck(streetTraffic.rider.index>=0?streetTraffic.cars[streetTraffic.rider.index].driveSpeed:0,active&&!fieldMenu.current&&!lessonRef.current&&streetTraffic.rider.index>=0);
      sound.move(rideRef.current,Math.hypot(velocity.x,velocity.z),active&&!fieldMenu.current&&!lessonRef.current&&!['parachute','fall'].includes(jetActions.state.phase)&&(rideRef.current==='jetpack'||!rooftop.state.falling&&rooftop.state.recovery===0));
      const blend=accumulator*60;
      visualLocation.x=active?T.MathUtils.lerp(previousLocation.x,location.x,blend):location.x;visualLocation.z=active?T.MathUtils.lerp(previousLocation.z,location.z,blend):location.z;
      const customizationChanged=appliedCustomization!==customizationRef.current;
      if(appliedCustomization!==customizationRef.current){appliedCustomization=customizationRef.current;player.setAppearance(appliedCustomization);player.setBeanLook(beanLookFor(appliedCustomization),playerOutfit(appliedCustomization));vehicle.setCustomization(appliedCustomization);ballAppearance.setStyle(appliedCustomization.ball);}
      // Team colours for the player's own character while the draw-the-pass lesson or rooftop knockout is on (lib/town/beanLooks mainPlayerDress); own look restored after.
      {const inTeam=Boolean(lessonRef.current)||liveKnockout.joined;if(inTeam!==appliedTeamLook||inTeam&&customizationChanged){appliedTeamLook=inTeam;const c=customizationRef.current,d=mainPlayerDress(beanLookFor(c),playerOutfit(c),inTeam,DEFAULT_PLAYER_NUMBER);player.setBeanLook(d.look,d.outfit);}}
      const isParachuting=jetActions.state.phase==='parachute',airJuggling=isParachuting&&jetActions.state.juggleAge>=0,airJuggleCycle=jetActions.state.juggleAge/.8,airJugglePhase=airJuggleCycle-Math.floor(airJuggleCycle),airJuggleSide=(Math.floor(airJuggleCycle)%2===0?1:-1) as -1|1;if(skyJugglingRef.current!==airJuggling){skyJugglingRef.current=airJuggling;setSkyJuggling(airJuggling);}if(parachutingRef.current!==isParachuting){parachutingRef.current=isParachuting;setParachuting(isParachuting);}
      const vendingHide=vending.hidesPlayer;player.root.visible=!fieldMenu.current&&!vendingHide;ring.visible=!fieldMenu.current&&!vendingHide&&rideRef.current!=='jetpack';ball.visible=!fieldMenu.current&&!vendingHide&&(rideRef.current==='walk'||airJuggling);
      if(Math.hypot(velocity.x,velocity.z)>.1)arrivalFacing=undefined;
      const flightPose=rideRef.current==='jetpack'?flightMotion.update(active?dt:0,elapsed,velocity.x,velocity.z,flightHeading,flight.landTime>=0?'landing':flight.takeoffTime<1.05?'takeoff':'cruise',flight.landTime>=0?flight.landTime/.95:flight.takeoffTime/1.05,reduced,location.x,location.z,flight.height,jetActions.state.phase,customizationRef.current.jetpack):undefined;
      if(rooftop.state.falling||rooftop.state.recovery>0)rideTricks.reset();
      const groundVariant=rideRef.current==='scooter'||rideRef.current==='bike'||rideRef.current==='moped'?customizationRef.current[rideRef.current]:'classic';
      const trickPose=rideTricks.update(active?dt:0,rideRef.current,reduced,groundVariant,keys.has(rideTricks.state.action===0?' ':'j')||Array.from(heldRidePointers.current.values()).some(hold=>hold.action===rideTricks.state.action));
      trickPose.pitch+=rampMotion.state.trickPitch;trickPose.roll+=rampMotion.state.trickRoll;trickPose.yaw+=rampMotion.state.trickYaw;trickPose.lift+=rampMotion.state.lift;trickPose.pitch+=rampMotion.state.pitch*(reduced?.3:1);trickPose.roll+=rampMotion.state.roll*(reduced?.2:1);trickPose.yaw+=rampMotion.state.yaw*(reduced?.2:1);rampVisuals.root.visible=!fieldMenu.current;rampVisuals.update(rampMotion.state,reduced);
      if(flightPose){if(jetActions.state.phase==='charge'){flightPose.compression=.26*Math.min(1,jetActions.state.age/.65);flightPose.thrust=1.5;}if(jetActions.state.phase==='blast'){flightPose.thrust=2.6;flightPose.pitch=-.15;flightPose.compression=.07;}if(jetActions.state.phase==='dash')flightPose.thrust=2.2;boostLean=T.MathUtils.damp(boostLean,jetActions.state.phase==='dash'?(reduced?.6:1.25):0,jetActions.state.phase==='dash'?22:12,active?dt:0);flightPose.pitch=Math.max(flightPose.pitch,boostLean);}
      // Island job moves: start/end of a job resets the ball and the poses; per frame only while a job runs (or its ball rests).
      const jobRun=jobs.run;
      if(!!jobRun!==jobWas){jobWas=!!jobRun;cancelShotHold();if(!jobRun)jobMoves.end();/* the last one-shot pose plays out (bug A9) */jobFrame=NO_JOB_FRAME;walkBall.reset({...location,y:rooftop.state.height,yaw:player.root.rotation.y});}
      if(active){jobStroke+=dt;jobFrame=(jobRun||jobMoves.parked||jobMoves.kicking||jobMoves.posing)&&rideRef.current==='walk'?jobMoves.update(dt,jobPlayer(),jobFloor,heldPose(jobRun,elapsed,jobStroke)):NO_JOB_FRAME;}
      if(jobFrame.caught){sound.ball('receive');walkBall.reset({...location,y:rooftop.state.height,yaw:player.root.rotation.y});}
      if(jobFrame.kick!==undefined){if(jobKickLast<KICK_CONTACT&&jobFrame.kick>=KICK_CONTACT)sound.ball('kick');jobKickLast=jobFrame.kick;}else jobKickLast=0;
      const steppingBack=rideRef.current==='walk'&&walkBall.state.mode==='charging'&&walkBall.state.age>.18&&walkBall.state.age<.65,steppingIn=rideRef.current==='walk'&&walkBall.state.mode==='windup'&&walkBall.state.age<SHOT_WINDUP*.55;
      // Released stick/keys at speed: request a planted stop (the 'you' profile is identity, so only the stop changes).
      const steering=Math.hypot(input.current.x,input.current.z)>.1||keys.has('w')||keys.has('a')||keys.has('s')||keys.has('d')||keys.has('arrowup')||keys.has('arrowdown')||keys.has('arrowleft')||keys.has('arrowright');
      const intentSX=input.current.x+(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),intentSZ=input.current.z+(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
      const walkBrake=rideRef.current==='walk'&&!steering&&!rooftop.state.falling&&streetTraffic.rider.index<0?T.MathUtils.smoothstep(Math.hypot(velocity.x,velocity.z),1,3.2):0;
      player.update(visualLocation.x,visualLocation.z,active?dt:0,elapsed,reduced,withJob({skill:liveKnockout.joined?liveKnockout.dodgeSkill:undefined,called:lessonRef.current==='aim'?1:lessonRef.current==='passing'||lessonRef.current==='replay'?lessonCalled:lessonRef.current?0:undefined,intentHeading:rideRef.current==='walk'&&Math.hypot(intentSX,intentSZ)>.05?Math.atan2(intentSX*.857+intentSZ*.515,-intentSX*.515+intentSZ*.857):undefined,brake:walkBrake,truckRiding:streetTraffic.rider.index>=0,truckSpeed:streetTraffic.rider.index>=0?streetTraffic.cars[streetTraffic.rider.index].driveSpeed:0,turnSmoothing:jetActions.state.phase==='parachute'?(jetActions.state.scanAge>=0?18:3):undefined,juggleTouch:walkBall.state.mode==='juggle'?walkBall.state.juggleTouch:'foot',parachute:jetActions.state.phase==='parachute',parachuteSpin:jetActions.state.scanIntensity,parachuteJuggle:airJuggling?{phase:airJugglePhase,side:airJuggleSide}:undefined,wallSplat:rampMotion.state.phase==='splat',mopedStand:trickPose.stand,mopedSuperman:reduced?0:rampMotion.state.trickStretch,flyingCar:['flying-car','mini-plane'].includes(customizationRef.current.jetpack),rocketboard:customizationRef.current.jetpack==='rocketboard',jump:roofJumpMotion(rooftop.jump,rideRef.current),rooftopPose:jetActions.state.phase==='fall'?(jetActions.state.age<.65?'hang':'fall'):rideRef.current==='jetpack'?undefined:rooftop.state.falling?(rooftop.state.hangTime>0?'hang':'fall'):rooftop.state.recovery>0?'dizzy':undefined,flight:flightPose,facing:jetActions.state.scanAge>=0&&!reduced?jetActions.state.scanYaw:streetTraffic.rider.index>=0?streetTraffic.cars[streetTraffic.rider.index].group.rotation.y:rideRef.current==='walk'&&(walkBall.state.mode==='windup'||walkBall.state.kick>0)?walkBall.state.yaw:arrivalFacing,travelMode:rideRef.current,shotStep:steppingBack?(walkBall.state.age-.18)/.47:steppingIn?walkBall.state.age/(SHOT_WINDUP*.55):undefined,actionKind:rideRef.current==='walk'&&walkBall.state.kick>0?'shot':undefined,strikeX:rideRef.current==='walk'&&walkBall.state.kick>0?0:undefined,strikeZ:rideRef.current==='walk'&&walkBall.state.kick>0?.65/Math.max(.1,player.root.scale.x):undefined,shotPower:walkBall.state.charge,shotCharge:rideRef.current==='walk'&&walkBall.state.mode==='charging'?walkBall.state.charge:undefined,powerKick:rideRef.current==='walk'&&(walkBall.state.mode==='windup'||walkBall.state.mode==='shot'&&walkBall.state.kick>0),dribbling:liveKnockout.joined?liveKnockout.hasBall:rideRef.current==='walk'&&Math.hypot(orb.x-visualLocation.x,orb.z-visualLocation.z)<1.3,kick:rideRef.current==='walk'?(liveKnockout.joined?liveKnockout.kickPose:walkBall.state.kick):undefined,juggle:rideRef.current==='walk'&&(walkBall.state.mode==='juggle'||walkBall.state.mode==='wall-juggle'&&(walkBall.state.wallPhase==='receive'||walkBall.state.wallPhase==='kick'))?walkBall.state.jugglePhase:undefined,kickSide:walkBall.state.juggleSide}));
      flightHeading=player.root.rotation.y;
      vehicle.update(rideRef.current,visualLocation.x,visualLocation.z,player.root.rotation.y,active?dt:0,Math.hypot(velocity.x,velocity.z),flightPose);vehicle.root.visible=vehicle.root.visible&&!fieldMenu.current&&!vending.hidesPlayer&&(customizationRef.current.jetpack==='ironman'||!['parachute','fall'].includes(jetActions.state.phase));
      let groundY=rooftop.state.height;let ridePitch=0;
      if(rideRef.current!=='walk'&&rideRef.current!=='jetpack'&&!rooftop.state.falling&&groundY<=fieldSurfaceHeight(visualLocation.x,visualLocation.z)+.2){const yaw=player.root.rotation.y,front=(rideRef.current==='scooter'?.5:.62)*1.12,rear=(rideRef.current==='scooter'?.4:.53)*1.12;const hf=fieldSurfaceHeight(visualLocation.x+Math.sin(yaw)*front,visualLocation.z+Math.cos(yaw)*front),hr=fieldSurfaceHeight(visualLocation.x-Math.sin(yaw)*rear,visualLocation.z-Math.cos(yaw)*rear);ridePitch=Math.atan2(hr-hf,front+rear);groundY=(hf*rear+hr*front)/(front+rear)+.005;}
      if(rideRef.current!=='walk'&&rideRef.current!=='jetpack'&&!rooftop.state.falling&&!rooftop.jump.active&&groundY>fieldSurfaceHeight(visualLocation.x,visualLocation.z)+.2&&rampMotion.state.phase==='idle'&&streetTraffic.rider.index<0){rideSurfacePose(rideRef.current,visualLocation.x,visualLocation.z,player.root.rotation.y,rooftop.state.height,rooftop.surface,stairRidePose);ridePitch=stairRidePose.pitch;groundY=stairRidePose.height;}
      if(rideRef.current==='jetpack')groundY=flight.height;
      if(streetTraffic.rider.index>=0){const truck=streetTraffic.cars[streetTraffic.rider.index],bed=streetTraffic.bedPoint(truck.index);groundY=bed.y;ridePitch=truck.group.rotation.x;player.root.position.x=bed.x;player.root.position.z=bed.z;}
      player.root.rotation.order='YXZ';player.root.rotation.x=ridePitch;vehicle.root.rotation.order='YXZ';vehicle.root.rotation.x=ridePitch;player.root.position.y=groundY;vehicle.root.position.y=groundY;
      const crash=rideRef.current==='jetpack'?0:rooftop.state.recovery/ROOF_RECOVERY_TIME;
      const collapse=Number.isFinite(spinCrashAge)?T.MathUtils.smoothstep(spinCrashAge,.15,.65):1;
      const squash=(crash>.5?1:T.MathUtils.smoothstep(crash,.28,.5))*collapse;
      let hovering=false;
      if(hoverPoint&&active&&!fieldMenu.current&&!lessonRef.current){characterRay.setFromCamera(hoverPoint,camera);hovering=characterRay.intersectObject(player.root,true).length>0||nearCharacter(hoverPoint);}
      if(hovering&&!characterHovered)sound.sceneHover(rideRef.current==='jetpack');characterHovered=hovering;
      const canEnter=active&&!fieldMenu.current&&!lessonRef.current;
      const nearEntrance=(x:number,z:number,width:number)=>canEnter&&rideRef.current!=='jetpack'&&!rooftop.state.falling&&Math.abs(groundY)<1&&location.z>z-3&&location.z<z+8&&Math.abs(location.x-x)<width;
      nearMuseum=nearEntrance(168,188,16);
      nearStore=false;nearArcade=nearEntrance(103,-50,8);nearCoaches=nearEntrance(161,-34,11);
      const konbiniNear=(door:KonbiniDoor)=>canEnter&&rideRef.current!=='jetpack'&&!rooftop.state.falling&&Math.abs(groundY)<1&&konbiniDoorNear(door,location.x,location.z),nearKonbiniMain=konbiniNear('main'),nearKonbiniCay=konbiniNear('cay');
      const flightNear=(bounds:T.Box3)=>canEnter&&rideRef.current==='jetpack'&&flight.height<bounds.max.y+40&&Math.hypot(Math.max(bounds.min.x-location.x,0,location.x-bounds.max.x),Math.max(bounds.min.z-location.z,0,location.z-bounds.max.z))<12;
      const overMuseum=!!(hoverPoint&&canEnter&&pointsAtMuseum());
      if(overMuseum&&!museumHovered)sound.sceneHover(rideRef.current==='jetpack');museumHovered=overMuseum;
      const overStore=false,overArcade=!!(hoverPoint&&canEnter&&pointsAtArcade()),overCoaches=!!(hoverPoint&&canEnter&&pointsAtCoaches()),overKonbiniMain=!!(hoverPoint&&canEnter&&pointsAtKonbini('main')),overKonbiniCay=!!(hoverPoint&&canEnter&&pointsAtKonbini('cay'));
      if(overStore&&!storeHovered||overArcade&&!arcadeHovered||overCoaches&&!coachesHovered)sound.sceneHover(rideRef.current==='jetpack');storeHovered=overStore;arcadeHovered=overArcade;coachesHovered=overCoaches;
      const hoveredBuilding=overStore?'store':overArcade?'arcade':overCoaches?'coaches':overMuseum?'museum':overKonbiniMain?'konbini':overKonbiniCay?'caykonbini':'';if(hoveredBuilding){buildingHoverKind=hoveredBuilding;buildingHoverUntil=now+450;}
      const buildingTargets=[{index:0,kind:'arcade',x:103,z:-53,active:overArcade||nearArcade||flightNear(world.arcadeBounds)},{index:1,kind:'coaches',x:161,z:-37,active:overCoaches||nearCoaches||flightNear(world.coachesBounds)},{index:2,kind:'museum',x:168,z:186,active:overMuseum||nearMuseum||flightNear(world.museumBounds)},{index:3,kind:'konbini',x:KONBINI_BUILDINGS.main.x,z:KONBINI_BUILDINGS.main.z,active:overKonbiniMain||nearKonbiniMain||flightNear(konbiniBounds.main)},{index:4,kind:'caykonbini',x:KONBINI_BUILDINGS.cay.x,z:KONBINI_BUILDINGS.cay.z,active:overKonbiniCay||nearKonbiniCay||flightNear(konbiniBounds.cay)},{index:5,kind:'museum',x:168,z:186,active:overMuseum||nearMuseum||flightNear(world.museumBounds)||flightNear(world.museumWingBounds)}];
      const singleBuilding=coarse||viewportW<=600;
      const highlightedBuilding=singleBuilding?buildingTargets.filter(b=>b.active).sort((a,b)=>Math.hypot(location.x-a.x,location.z-a.z)-Math.hypot(location.x-b.x,location.z-b.z))[0]?.kind:undefined;
      for(const b of buildingTargets)buildingEffects[b.index].glow.update(b.active&&(!singleBuilding||b.kind===highlightedBuilding),dt,reduced||singleBuilding&&b.kind!==highlightedBuilding);

      let hoveredNpc=hoverPoint&&canEnter&&!hovering?(islandNpcs.pick(characterRay)??coachPractice.pick(characterRay)??volleyballGame.pick(characterRay)):null;
      if(!hoveredNpc&&hoverPoint&&canEnter&&!hovering&&hoveredNpcId){const last=islandNpcs.entries.find(e=>e.id===hoveredNpcId)??coachPractice.entries.find(e=>e.id===hoveredNpcId)??volleyballGame.entries.find(e=>e.id===hoveredNpcId);if(last&&!ballReactions.get('npc:'+last.id)){const center=new T.Vector3(last.position.x,last.position.y+1,last.position.z);if(characterRay.ray.distanceToPoint(center)<1.1&&characterRay.ray.origin.distanceTo(center)<90)hoveredNpc=last.definition;}}
      const hoveredEntry=hoveredNpc?(islandNpcs.entries.find(e=>e.id===hoveredNpc.id)??coachPractice.entries.find(e=>e.id===hoveredNpc.id)??volleyballGame.entries.find(e=>e.id===hoveredNpc.id)):undefined;
      if(hoveredNpc&&hoveredNpc.id!==hoveredNpcId)sound.sceneHover(rideRef.current==='jetpack');hoveredNpcId=hoveredNpc?.id??null;
      npcHover.update(hoveredEntry?{id:hoveredEntry.id,...hoveredEntry.position}:null,dt,reduced);
      renderer.domElement.style.cursor=hovering||hoveredNpc||overStore||overArcade||overCoaches||overMuseum||overKonbiniMain||overKonbiniCay?'pointer':'';
      characterGlow.update(hovering,dt,reduced);
      player.root.scale.set(1+squash*.65,1-squash*.82,1+squash*.65);vehicle.root.scale.setScalar(1.12);player.root.rotation.z=streetTraffic.rider.index>=0?streetTraffic.cars[streetTraffic.rider.index].group.rotation.z:0;
      if(crash>0&&!reduced){player.root.rotation.z=Math.sin(elapsed*5)*.15*(1-squash);player.root.rotation.x+=Math.cos(elapsed*4)*.1*(1-squash);}
      if(Number.isFinite(spinCrashAge)&&crash>0){player.root.rotation.z+=squash*.8;if(rideRef.current!=='walk')player.root.position.x+=Math.cos(player.root.rotation.y)*squash*.65;}
      fieldBump.pose(player.root,active?dt:0,reduced);
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
      // Kick the tree: two steps back from the set ball, then in to strike it (a visual offset, like the charged shot's step back).
      if(jobFrame.back&&rideRef.current==='walk'){const x=player.root.position.x-Math.sin(player.root.rotation.y)*jobFrame.back,z=player.root.position.z-Math.cos(player.root.rotation.y)*jobFrame.back;
        if(rooftop.canLand(x,z)&&Math.abs(rooftop.surface(x,z)-groundY)<.35){player.root.position.x=x;player.root.position.z=z;}}
      if(jobs.holding&&rideRef.current==='walk'){player.handPositions(jobHandL,jobHandR);jobs.holdProps(jobHandL,jobHandR,player.root.rotation.y);}
      const showLanding=rideRef.current==='jetpack'&&!fieldMenu.current&&!lessonRef.current;
      const overPickup=streetTraffic.updateLandingIndicator(location.x,location.z,showLanding,elapsed,reduced,truckLanding);
      if(showLanding&&!overPickup){
        previewAge+=dt;
        if(jetActions.state.phase==='parachute'&&jetActions.state.target)landingPreview=jetActions.state.target;
        else if(flight.landing)landingPreview=flight.landing;
        else if(rooftop.canLand(location.x,location.z)){landingPreview={x:location.x,z:location.z};previewX=location.x;previewZ=location.z;}
        else if(previewAge>=.12&&(!landingPreview||Math.hypot(location.x-previewX,location.z-previewZ)>PARACHUTE_REAIM_METRES||previewAge>=PARACHUTE_REAIM_SECONDS&&Math.hypot(location.x-previewX,location.z-previewZ)>.3)){// same re-aim budget as the parachute (findLanding scans far rings over open sea)
          landingPreview=rooftop.findLanding(location.x,location.z);previewX=location.x;previewZ=location.z;previewAge=0;}
        const cover=coinHunt.manholeTarget();if(cover)landingPreview=cover;// right over an unopened manhole: target its cover
      }
      landingMarker.update(landingPreview,flight.height,rooftop.surface,showLanding&&!overPickup,elapsed,reduced,showLanding&&!overPickup&&coinHunt.manholeTarget()?3.2:1);// the same ring, sized to sit around a manhole's rim
      if(streetTraffic.rider.index>=0&&!reduced&&streetTraffic.rider.landingAge<.85){const age=streetTraffic.rider.landingAge,settle=Math.exp(-age*5),compress=Math.sin(Math.min(1,age/.3)*Math.PI)*.18;player.root.scale.y*=1-compress;player.root.scale.x*=1+compress*.2;player.root.rotation.z+=Math.sin(age*20)*settle*.1;player.root.position.y+=Math.sin(age*16)*settle*.06;}
      boundaryFeedback.update(active?dt:0,reduced,camera);boundaryFeedback.root.visible=!fieldMenu.current;
      applyRoofJumpPose(rooftop.jump,rideRef.current,reduced,player.root,vehicle.root);
      player.root.position.y+=trickPose.lift;vehicle.root.position.y+=trickPose.lift;player.root.rotation.x+=trickPose.pitch;vehicle.root.rotation.x+=trickPose.pitch;player.root.rotation.y+=trickPose.yaw;vehicle.root.rotation.y+=trickPose.yaw;player.root.rotation.z+=trickPose.roll;vehicle.root.rotation.z+=trickPose.roll;
      if(wallSplat){const yaw=rampMotion.state.ramp!.yaw,flatten=reduced?.55:.2;player.root.rotation.set(0,yaw,0,'YXZ');player.root.scale.set(1.28,1.1,flatten);player.root.position.x+=Math.sin(yaw)*.6;player.root.position.z+=Math.cos(yaw)*.6;vehicle.root.rotation.set(.3,yaw,.55,'YXZ');vehicle.root.position.y=groundY+Math.max(0,rampMotion.state.lift-.8);}
      if(!reduced&&(jetActions.state.phase==='blast'||jetActions.state.phase==='dash')){const t=Math.min(1,jetActions.state.age/(jetActions.state.phase==='dash'?.45:1.05)),twist=Math.PI*(customizationRef.current.jetpack==='helicopter'?4:2)*t*t*(3-2*t);if(customizationRef.current.jetpack==='mini-plane'&&jetActions.state.phase==='blast'){player.root.rotateX(-twist);vehicle.root.rotateX(-twist);}else if(['flying-car','mini-plane'].includes(customizationRef.current.jetpack)){player.root.rotateZ(twist);vehicle.root.rotateZ(twist);}else if(customizationRef.current.jetpack==='rocketboard'){if(jetActions.state.phase==='blast'){player.root.rotateY(twist*1.5);vehicle.root.rotateY(twist*1.5);}else{player.root.rotateX(twist);vehicle.root.rotateX(twist);}}else if(customizationRef.current.jetpack==='ironman'){const surge=Math.sin(t*Math.PI)*.3;player.root.rotateX(-surge);vehicle.root.rotateX(-surge);}else{player.root.rotateY(twist);vehicle.root.rotateY(twist);}}
      const arrivalScale=characterArrival.update(dt,visualLocation.x,groundY,visualLocation.z,reduced||suppressInitialArrival,!fieldMenu.current&&!lessonRef.current);if(suppressInitialArrival&&characterArrival.getState().done)suppressInitialArrival=false;
      player.root.scale.multiplyScalar(arrivalScale);vehicle.root.scale.multiplyScalar(arrivalScale);
      // Falls with bean bodies (lane F): keep a squashed or knocked-over body on the ground, and show the fall on the face.
      if(crash>0)player.root.position.y+=knockdownLift(player.root,groundY);
      knockFace.update(active?dt:0,rooftop.state.falling||jetActions.state.phase==='fall',crash>0||wallSplat);
      vehicle.syncArmor(player.root,rideRef.current==='jetpack'&&!['parachute','fall'].includes(jetActions.state.phase));
      craterEffect.update(active?dt:0,reduced);if(fieldMenu.current)craterEffect.root.visible=false;
      jetpackBreakup.update(active?dt:0,rooftop.surface,!fieldMenu.current);
      sonicBurst.root.visible=!fieldMenu.current;sonicBurst.update(active?dt:0,reduced);
      parachuteTrail.root.visible=!fieldMenu.current;parachuteTrail.update(visualLocation.x,groundY,visualLocation.z,player.root.rotation.y,active?dt:0,jetActions.state.phase==='parachute',reduced);if(fieldMenu.current)parachuteTrail.root.visible=false;
      parachute.root.visible=!fieldMenu.current;parachute.update(visualLocation.x,groundY,visualLocation.z,player.root.rotation.y,jetActions.state.phase==='parachute',jetActions.state.age,active?dt:0,rooftop.surface(visualLocation.x,visualLocation.z),reduced,jetActions.state.phase==='fall');

      if(jetActions.state.phase==='parachute'){player.handPositions(leftHand,rightHand);parachute.attachHands(leftHand,rightHand,vehicle.harnessAnchor);}
      jetExhaust.update(visualLocation.x,groundY+bob,visualLocation.z,player.root.rotation.y,fieldSurfaceHeight(visualLocation.x,visualLocation.z),active?dt:0,vehicle.root.visible&&rideRef.current==='jetpack'&&customizationRef.current.jetpack==='classic'&&active,flight.takeoffTime<1.05||Boolean(flight.landing)||['charge','blast','dash'].includes(jetActions.state.phase),reduced);
      flightTrail.root.visible=!fieldMenu.current;flightTrail.update(visualLocation.x,groundY+bob,visualLocation.z,flightHeading,Math.hypot(velocity.x,velocity.z),active?dt:0,customizationRef.current.jetpack,vehicle.root.visible&&rideRef.current==='jetpack'&&customizationRef.current.jetpack!=='classic'&&active&&!['parachute','fall'].includes(jetActions.state.phase),['dash','blast'].includes(jetActions.state.phase),reduced,jetActions.state.phase==='blast');
      rideTrail.update(visualLocation.x,groundY,visualLocation.z,player.root.rotation.y,Math.hypot(velocity.x,velocity.z),active?dt:0,vehicle.root.visible&&rideRef.current!=='walk'&&rideRef.current!=='jetpack'&&active&&!fieldMenu.current&&rampMotion.state.phase!=='air',reduced,groundVariant,rideTricks.state.active||rampMotion.state.phase==='climb');
      islandNpcs.root.visible=!fieldMenu.current&&!lessonRef.current;
      islandNpcs.update(active?dt:0,elapsed,reduced,{x:visualLocation.x,y:groundY,z:visualLocation.z},!active||!islandNpcs.root.visible,!coarse&&viewportW>600,hoveredNpcId,camera,(rideRef.current==='jetpack'&&flight.height>1.2)||vending.focused!==null);fieldBump.applyNpcNudges();
      const hudTick=now-lastHud>150;
      if(hudTick){const visitor={x:visualLocation.x,y:groundY,z:visualLocation.z};const next=[islandNpcs.root.visible?islandNpcs.nearest(visitor):null,coachPractice.nearest(visitor),volleyballGame.nearest(visitor)].filter((npc):npc is NpcDefinition=>npc!==null).sort((a,b)=>Math.hypot(a.x-visitor.x,a.z-visitor.z)-Math.hypot(b.x-visitor.x,b.z-visitor.z))[0]??null;if(next?.id!==nearbyNpcRef.current?.id){nearbyNpcRef.current=next;setNearbyNpc(next);}}
      npcs.forEach((rig,i)=>{
        rig.root.visible=Boolean(lessonRef.current);if(!lessonRef.current)return;
        if(lessonRef.current&&i<2){const phase=lessonRef.current,live=phase==='aim'||phase==='passing'||phase==='replay',point=i===0?PASSER:lessonDefender;
          // Passer: wind-up and strike on the pass (kick contact = release). Marker: ready stance while the pass is on.
          rig.update(point.x,point.z,dt,elapsed,reduced,!live?undefined:i===0?{facing:passerFacing,kick:passerKick,actionKind:'pass'}:{ready:1,lookX:orb.x,lookZ:orb.z});rig.root.position.y=fieldSurfaceHeight(point.x,point.z);return;}
        const center=i<3?15:-38,angle=elapsed*.22+i*2.1;rig.update(10+Math.sin(angle)*4+(i%2),center+Math.cos(angle)*7,dt,elapsed,reduced);});
      guide.visible=receiveRing.visible=Boolean(lessonRef.current)&&!aimLine.visible&&lessonRef.current!=='passing'&&lessonRef.current!=='replay';
      if(threatRing.visible&&lessonRef.current==='aim')threatRing.position.set(lessonDefender.x,.15+fieldSurfaceHeight(lessonDefender.x,lessonDefender.z),lessonDefender.z);
      if(lessonRef.current){const lane=passingLane(location);guideMaterial.color.set(lane.open?'#b7f1a4':'#f1a06c');const a=guide.geometry.attributes.position.array as Float32Array;a.set([PASSER.x,.16+fieldSurfaceHeight(PASSER.x,PASSER.z),PASSER.z,location.x,.16+groundY,location.z]);guide.geometry.attributes.position.needsUpdate=true;guide.computeLineDistances();receiveRing.position.set(PASSER.x,.14+fieldSurfaceHeight(PASSER.x,PASSER.z),PASSER.z);if(lane.open!==lastLane){lastLane=lane.open;setLaneOpen(lane.open);}}
      const walkingBall=rideRef.current==='walk'&&!lessonRef.current&&!liveKnockout.joined;
      if(walkingBall&&walkBall.state.mode==='attached'&&!jobFrame.ball){
        player.dribbleContact(airBallFrom);dribblePlayer.x=visualLocation.x;dribblePlayer.z=visualLocation.z;dribblePlayer.y=groundY;dribblePlayer.yaw=player.root.rotation.y;
        walkBall.syncDribble(dribblePlayer,airBallFrom,rooftop.surface);orb.x=walkBall.state.x;orb.z=walkBall.state.z;
      }
      ball.position.set(orb.x,walkingBall?walkBall.state.y:.25+fieldSurfaceHeight(orb.x,orb.z),orb.z);
      if(walkingBall&&jobFrame.ball){ball.position.set(jobFrame.ball.x,jobFrame.ball.y,jobFrame.ball.z);orb.x=jobFrame.ball.x;orb.z=jobFrame.ball.z;}
      if(airJuggling){player.ballContact(airJuggleSide,airBallFrom);player.ballContact(airJuggleSide===1?-1:1,airBallTo);ball.position.lerpVectors(airBallFrom,airBallTo,airJugglePhase);ball.position.y+=.19+4*airJugglePhase*(1-airJugglePhase)*(reduced?.3:.7);ball.rotation.x+=active?dt*4:0;}
      const ballSquash=walkingBall&&!reduced?Math.sin(walkBall.state.bounce/.16*Math.PI)*.22:0;ball.scale.set((1+ballSquash)*1.0125,(1-ballSquash)*1.0125,(1+ballSquash)*1.0125);
      ballEffects.root.visible=walkingBall&&!fieldMenu.current;ballEffects.update(active?dt:0,ball.position,walkingBall&&(walkBall.state.mode==='shot'&&!walkBall.state.floating||walkBall.state.mode==='wall-juggle'||walkBall.state.mode==='juggle'),reduced,camera,walkBall.state.mode==='shot'&&!walkBall.state.floating?walkBall.state.charge:0,walkBall.state.mode==='charging'?walkBall.state.charge:-1,BALL_COLORS[customizationRef.current.ball],customizationRef.current.ball);
      liveKnockout.update(active?dt:0,location,groundY,rideRef.current==='walk',camera,!fieldMenu.current&&!lessonRef.current,reduced,player.root.rotation.y);
      liveKnockout.feedback(sound,reduced);liveKnockout.posePlayer(player.root);if(liveKnockout.joined)ball.visible=false;
      const arenaStatus=uiElement<HTMLElement>('[data-knockout-status]');if(arenaStatus){setUIHidden(arenaStatus,!liveKnockout.joined||Boolean(liveKnockout.countdown));const message=liveKnockout.status;if(arenaStatus.textContent!==message)arenaStatus.textContent=message;}
      {const actions=uiElement<HTMLElement>('.travel-actions'),arena=liveKnockout.joined;if(actions&&actions.hasAttribute('data-knockout')!==arena){actions.toggleAttribute('data-knockout',arena);const kick=actions.querySelector<HTMLElement>('.touch-shoot'),dodge=actions.querySelector<HTMLElement>('.touch-juggle');for(const [el,label,tip] of [[kick,'Kick','Kick · Space'],[dodge,'Dodge','Dodge sideways · J']] as const){if(!el)continue;if(arena){el.dataset.koLabel=el.getAttribute('aria-label')??'';el.dataset.koTitle=el.getAttribute('title')??'';el.setAttribute('aria-label',label);el.setAttribute('title',tip);}else if(el.dataset.koLabel!==undefined){el.setAttribute('aria-label',el.dataset.koLabel);el.setAttribute('title',el.dataset.koTitle??'');delete el.dataset.koLabel;delete el.dataset.koTitle;}}}}
      const ballDt=active?dt:0;
      const groundRolling=walkingBall&&['attached','charging','windup'].includes(walkBall.state.mode);
      rollWalkingBall(ball,ballDt,groundRolling);
      if(!groundRolling&&walkingBall&&['juggle','wall-juggle'].includes(walkBall.state.mode)){
        const spin=5*ballDt;
        ball.rotation.x+=Math.cos(player.root.rotation.y)*spin;ball.rotation.z-=Math.sin(player.root.rotation.y)*spin;
      }else if(!groundRolling){ball.rotation.x+=orb.vz*ballDt/.19;ball.rotation.z-=orb.vx*ballDt/.19;}
      rideChange.update(active?dt:0,visualLocation.x,groundY,visualLocation.z,reduced);if(fieldMenu.current)rideChange.root.visible=false;
      ring.position.set(visualLocation.x,.10+groundY,visualLocation.z);
      const ringSize=({walk:1,scooter:1.65,bike:2.15,moped:2.3,jetpack:1} as const)[rideRef.current];ring.scale.setScalar(reduced?ringSize:T.MathUtils.lerp(ring.scale.x,ringSize,1-Math.exp(-dt*10))); 
      const current=location.x>25?'coast':districtAt(location.z);if(current!==lastDistrict){lastDistrict=current;setDistrict(current);}
      // One fixed golden sunset treatment across every neighborhood.
      
      onboardingNpcFocus.restore(camera);
      // One consistent island view. Walking/travel changes position, never zoom or angle.
      const flying=rideRef.current==='jetpack',rampCamera=['climb','air','splat'].includes(rampMotion.state.phase),mobileTravel=coarse&&(rideRef.current!=='walk'||streetTraffic.rider.index>=0);
      walkCameraOffset(camera.aspect,walkOffset);camTarget.set(visualLocation.x+(flying||mobileTravel?16:walkOffset.x),23+groundY+(rampCamera?rampMotion.state.lift:0)+(mobileTravel?1:0),visualLocation.z+(flying||mobileTravel?33:walkOffset.z));
      // A7: portrait views centre the walker; walking looks a little ahead of travel (lib/town/walkControl.ts).
      if(rideRef.current==='walk'&&streetTraffic.rider.index<0&&!reduced&&!lessonRef.current){walkCameraLead(velocity.x,velocity.z,walkLead);camTarget.x+=walkLead.x;camTarget.z+=walkLead.z;}
      // Coach lesson on a portrait phone: frame passer, marker and receiver above the coach card (same view angle).
      if(lessonRef.current&&camera.aspect<.85){const fx=(PASSER.x+lessonDefender.x+location.x)/3,fz=(PASSER.z+lessonDefender.z+location.z)/3,shift=5.5/Math.hypot(16,33),scale=1.2;
        camTarget.set(fx+16*shift+16*scale,groundY+23*scale,fz+33*shift+33*scale);}
      if(!learningFormat.current){camera.position.lerp(camTarget,reduced?1:1-Math.exp(-dt*(mobileTravel?20:flying?14:rampCamera?10:4)));
        // Bound follow lag on phones so boosted rides stay near the center.
        if(mobileTravel){const lag=camera.position.distanceTo(camTarget);if(lag>1.2)camera.position.lerp(camTarget,1-1.2/lag);}
        // Vertical blast speed exceeds the eased follow; lock altitude to keep the pilot framed.
        if(jetActions.state.phase!=='idle')camera.position.y=camTarget.y;
      }
      // Keep the viewing direction constant even while the follow position eases.
      lookAt.set(camera.position.x-16,camera.position.y-23,camera.position.z-33);
      if(!learningFormat.current)camera.lookAt(lookAt);
      if(!learningFormat.current){vending.applyCamera(camera,dt,reduced);fishing.applyCamera(camera,dt,reduced);}
      if(!learningFormat.current)jobs.applyCamera(camera,dt,reduced);// assistant-referee replay camera (idle: early return)
      // A7: hidden behind a building: the foot ring draws through it so the player is never lost (~6 Hz probe, no new draw).
      hiddenMarker.update(rideRef.current==='walk'&&!learningFormat.current&&!fieldMenu.current&&ring.visible&&playerOcclusion.update(dt,visualLocation.x,groundY,visualLocation.z,camera.position.x,camera.position.y,camera.position.z),visualLocation.x,groundY,visualLocation.z,dt,elapsed,reduced);
      const learning=learningFormat.current;
      const fullWidth=viewportW,fullHeight=viewportH;
      const viewportWidth=fullWidth,viewportHeight=fullHeight;
      quizView.restore();
      renderer.setViewport(0,fullHeight-viewportHeight,viewportWidth,viewportHeight);
      if(Math.abs(camera.aspect-viewportWidth/viewportHeight)>.0001){camera.aspect=viewportWidth/viewportHeight;camera.updateProjectionMatrix();}
      if(learning){learningView.update(camera,venueById(learning),fieldSession.current,dt,reduced,learningAngle.current,{width:viewportWidth,height:viewportHeight,mobile:fullWidth<=600||coarse});quizView.apply([fieldSession.current?.lesson.id,fieldSession.current?.quiz,fieldSession.current?.question,learningAngle.current].join(':'),learningView.target,dt,reduced);}
      else if(wasLearning){camera.up.set(0,1,0);camera.zoom=1;camera.updateProjectionMatrix();learningView.reset();camera.position.set(location.x+18,23+groundY,location.z+30);camera.lookAt(location.x+2,groundY,location.z-3);}
      if(Boolean(learning)!==wasLearning){
        world.setVisible(!learning);coinHunt.setSceneryVisible(!learning);
        fields.setIsolated(Boolean(learning));
      }
      // The watch view shows only the watched pitch: island props that live outside world/fields (vending machines, fishing
      // posts, their glows and live fishing art) hide too, and get their own visibility back afterwards.
      if(learning){if(!learningHidden){learningHidden=[];for(const name of LEARNING_HIDE){const o=scene.getObjectByName(name);if(o)learningHidden.push([o,o.visible]);}}for(const [o] of learningHidden)o.visible=false;}
      else if(learningHidden){for(const [o,v] of learningHidden)o.visible=v;learningHidden=null;}
      fields.roots.forEach((root,id)=>root.visible=!learning||id===learning);wasLearning=Boolean(learning);
      fields.updateLighting(timeRef.current,camera,learning,dt,reduced,liveKnockout.joined,player.root.position);
      onboardingNpcTarget.current=onboardingNpcFocus.update(camera,onboardingRef.current&&onboardingNpcStep.current,location,fullWidth,fullHeight,dt,reduced);
      // Quality pass: the watch view fits the shadow map to the watched pitch (the view-based fit spanned ~680 m there).
      const watchedVenue=learning?venueById(learning):null,neededShadowElevation=watchedVenue?-1-VENUES.indexOf(watchedVenue):Math.ceil(Math.max(0,camera.position.y-23)/4)*4;
      if(neededShadowElevation!==shadowElevation){shadowElevation=neededShadowElevation;if(watchedVenue)fitShadowsToBox(sun,watchedVenue.width/2+3,watchedVenue.length/2+3,0,6);else fitIslandShadows(sun,camera,shadowElevation);}
      if(watchedVenue)sun.target.position.set(watchedVenue.x,watchedVenue.elevation??0,watchedVenue.z);else sun.target.position.set(camera.position.x-18,0,camera.position.z-30);
      // Keep the shadow texture aligned to its texels as the flying camera moves.
      const shadowCamera=sun.shadow.camera,texelX=(shadowCamera.right-shadowCamera.left)/sun.shadow.mapSize.x,texelY=(shadowCamera.top-shadowCamera.bottom)/sun.shadow.mapSize.y;
      const shadowX=sun.target.position.dot(shadowRight),shadowY=sun.target.position.dot(shadowUp);
      sun.target.position.addScaledVector(shadowRight,Math.round(shadowX/texelX)*texelX-shadowX).addScaledVector(shadowUp,Math.round(shadowY/texelY)*texelY-shadowY);
      sun.position.set(sun.target.position.x-288,sun.target.position.y+252,sun.target.position.z+198);
      const inspectEnabled=active&&!fieldSession.current&&!lessonRef.current&&!quizView.blocksSelection();
      let ferryHovered=false;if(inspectEnabled&&hoverPoint){characterRay.setFromCamera(hoverPoint,camera);ferryHovered=pointsAtFerry();}world.setFerryLockHovered(ferryHovered);ferryGlow.update(ferryHovered,dt,reduced);if(ferryHovered&&!ferryWasHovered)sound.sceneHover(rideRef.current==='jetpack');ferryWasHovered=ferryHovered;if(ferryHovered)renderer.domElement.style.cursor='pointer';
      livePlayerHover=inspectEnabled&&hoverPoint?games.pickPlayer(hoverPoint,camera,fullWidth,fullHeight,learning):null;
      games.setHoverPaused(positionSelectionRef.current?.format??livePlayerHover?.format??null);
      livePlayerGlow.update(livePlayerHover?{id:livePlayerHover.format+':'+livePlayerHover.id,x:livePlayerHover.x,y:livePlayerHover.y,z:livePlayerHover.z}:null,dt,reduced);
      const positionTip=uiElement<HTMLDivElement>('[data-position-tip]');if(positionTip){setUIHidden(positionTip,!livePlayerHover);if(livePlayerHover){const tip=positionInfo(livePlayerHover)?.name+" · What’s this position?";if(positionTip.textContent!==tip)positionTip.textContent=tip;placeUI(positionTip,T.MathUtils.clamp(livePlayerHover.screenX,120,fullWidth-120),Math.max(90,livePlayerHover.screenY-46));renderer.domElement.style.cursor='pointer';}}
      fieldBump.updateNudges(active?dt:0,reduced);games.update(active?dt:0,elapsed,camera,fieldSession.current,active,learning,viewportHeight,location);
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

      world.updateArcade(elapsed,reduced);
      world.updateWater(active&&!learning?dt:0,reduced||heat.staticAmbience);
      world.updateFerry(active&&!learning?dt:0,reduced||heat.staticAmbience);
      world.updateSharks(active&&!learning?dt:0,reduced||heat.staticAmbience,camera,location);// Coral Cay sharks: sleep when far/off screen
      if(active&&!learning&&!reduced&&!heat.staticAmbience)world.waves.forEach((wave,i)=>{wave.position.x+=Math.sin(elapsed*.6+i)*dt*.065;});
      // Fuel (docs/economy/FUEL_2026-09-30.md): charge this tick's movement; out of fuel on a ride/jetpack → land and walk.
      // Bug A6: the arrival burst and the opening jetpack hover are scripted, not the player's travel: free until the first move.
      if(!fuelArmed&&(Math.hypot(input.current.x,input.current.z)>.1||keys.size>0||Math.hypot(velocity.x,velocity.z)>.5)&&characterArrival.getState().done)fuelArmed=true;
      if(hudTick&&fuelTravel(now,rideRef.current,location.x,location.z,input.current.sprint||keys.has('shift'),!active||!!learning||!!lessonRef.current||fieldMenu.current||streetTraffic.rider.index>=0,rideRef.current==='jetpack'&&flight.height>.5,!fuelArmed,Math.hypot(driveX,driveZ)>.1||rideRef.current==='jetpack'&&(flight.takeoffTime<1.05||jetActions.state.phase==='dash'||jetActions.state.phase==='charge'||jetActions.state.phase==='blast'))&&rideRef.current!=='walk'&&pendingRide.current!=='walk'){if(rideRef.current==='jetpack')pendingRide.current='walk';else{rideRef.current='walk';setRideMode('walk');}}
      if(hudTick){if(active&&!fieldMenu.current&&!lessonRef.current&&rideRef.current!=='jetpack'&&!rooftop.state.falling&&Math.abs(player.root.position.y-fieldSurfaceHeight(location.x,location.z))<1){const visited=nearestVenue(location.x,location.z);if(visited)recordQuestVisit(visited.id);}const nextJuggling=rideRef.current==='walk'&&(walkBall.state.mode==='juggle'||walkBall.state.mode==='wall-juggle');if(hudJuggling!==nextJuggling){hudJuggling=nextJuggling;setJuggling(nextJuggling);}if(hudX!==location.x||hudZ!==location.z){hudX=location.x;hudZ=location.z;positionStore.publish({x:hudX,z:hudZ});const zone=zoneAt(hudX,hudZ);if(zone!==zoneRef.current){zoneRef.current=zone;setLocationZone(zone);}}lastHud=now;}
      const mobileEntry=coarse||fullWidth<=600;
      const entries=[['arcade',nearArcade,103,11,-53,world.arcadeBounds],['coaches',nearCoaches,161,11.8,-37,world.coachesBounds],['museum',nearMuseum,168,9.5,186,world.museumBounds],['konbini',nearKonbiniMain,KONBINI_DOORS.main.x,3.2,KONBINI_DOORS.main.front,konbiniBounds.main],['caykonbini',nearKonbiniCay,KONBINI_DOORS.cay.x,3.1,KONBINI_DOORS.cay.front,konbiniBounds.cay]] as const;
      const truckCandidate=canEnter&&rideRef.current==='jetpack'&&truckLanding===null&&!pendingRide.current?streetTraffic.landingTruckAt(location.x,location.z):undefined;
      nearbyTruck.current=truckCandidate?.index??null;
      // Ride prompts sit in the HUD stack's task slot (docs/ui/HUD_STACK.md): the stack places them, the arbiter shows them.
      const riding=canEnter&&streetTraffic.rider.index>=0;
      const exitPrompt=uiElement<HTMLButtonElement>('[data-truck-exit]');if(exitPrompt)setUIHidden(exitPrompt,!(riding&&hudFocusNow==='hop-off'));
      const truckPrompt=uiElement<HTMLButtonElement>('[data-truck-land]');if(truckPrompt)setUIHidden(truckPrompt,!(truckCandidate&&hudFocusNow==='land-truck'));
      let closestEntry:typeof entries[number][0]|undefined,closestEntryDistance=Infinity;
      // One contextual action on desktop and touch. Explicit hover wins over proximity.
      if(!truckCandidate&&streetTraffic.rider.index<0)for(const [kind,near,x,,z,bounds] of entries){
        const prompt=uiElement<HTMLButtonElement>(`[data-${kind}-enter]`);
        const hoverEntry=canEnter&&!mobileEntry&&((kind===buildingHoverKind&&now<buildingHoverUntil)||!!prompt?.matches(':hover'));
        if(mobileEntry?!near&&!flightNear(bounds):!near&&!hoverEntry)continue;
        const distance=hoverEntry?-1:(location.x-x)**2+(location.z-z)**2;
        if(distance<closestEntryDistance){closestEntry=kind;closestEntryDistance=distance;}
      }
      let shownEntry=false;
      for(const [kind,,x,y,z] of entries){const prompt=uiElement<HTMLButtonElement>(`[data-${kind}-enter]`);if(prompt){let hidden=kind!==closestEntry||hudFocusNow!=='enter';if(!hidden){storePromptPoint.set(x,y,z).project(camera);hidden=storePromptPoint.z< -1||storePromptPoint.z>1;if(!hidden)placeEntryPrompt(prompt,T.MathUtils.clamp((storePromptPoint.x+1)*fullWidth/2,75,fullWidth-75),T.MathUtils.clamp((1-storePromptPoint.y)*fullHeight/2,90,fullHeight-160));}if(!hidden)shownEntry=true;setUIHidden(prompt,hidden);}}
      // Job edge arrow (Oct 1 2026: every job, not only Wall rebounds' circle): toward the beacon's goal (the loose ball, the ball
      // box, the next mark, the pump station…) while it is off screen. HUD tick only, style written on change.
      if(hudTick){const el=uiElement<HTMLElement>('[data-job-spot-arrow]');if(el){const spot=jobs.arrowGoal;let show=false;
        if(spot&&canEnter){jobSpotV.set(spot.x,rooftop.surface(spot.x,spot.z)+.2,spot.z).project(camera);let x=jobSpotV.x,y=jobSpotV.y;const behind=jobSpotV.z>1;
          if(behind||Math.abs(x)>.9||Math.abs(y)>.9){show=true;if(behind){x=-x;y=-y;}const m=Math.max(Math.abs(x),Math.abs(y))||1;x/=m;y/=m;
            const t=`translate(${Math.round((x*.84+1)/2*fullWidth)}px,${Math.round((1-y*.8)/2*fullHeight)}px) rotate(${Math.atan2(-y,x).toFixed(2)}rad)`;if(el.style.transform!==t)el.style.transform=t;}}
        if(el.hidden!==!show)setUIHidden(el,!show);}}
      const vendingPrompt=uiElement<HTMLButtonElement>('[data-vending-go]');
      const vendingTarget=vending.update({now,dt,reduced,hoverRay:hoverPoint&&canEnter?(characterRay.setFromCamera(hoverPoint,camera),characterRay):null,canEnter,flying:rideRef.current==='jetpack',flightHeight:flight.height,location,groundY:player.root.position.y,camera,width:fullWidth,height:fullHeight,hidePrompt:hudFocusNow!=='vending',prompt:vendingPrompt??null,placeUI:placeEntryPrompt,setUIHidden,onHoverStart:()=>sound.sceneHover(rideRef.current==='jetpack')});
      if(vending.hovered)renderer.domElement.style.cursor='pointer';
      vendingKick.update(active&&!fieldMenu.current?dt:0,camera,reduced,fullWidth,fullHeight,active&&!fieldMenu.current&&!learning);
      const fishingHover=fishing.update({x:location.x,z:location.z,onFoot:rideRef.current!=='jetpack'&&!rooftop.state.falling&&streetTraffic.rider.index<0&&player.root.position.y<1.2,canEnter,ray:hoverPoint&&canEnter?characterRay:null,now,dt,elapsed,reduced,camera,width:fullWidth,height:fullHeight,mobile:mobileEntry,blocked:hudFocusNow!=='fish'&&hudFocusNow!=='sell',ui:uiElement,place:placeEntryPrompt,hide:setUIHidden});
      if(fishingHover.hoverStarted)sound.sceneHover(false);if(fishingHover.hovered)renderer.domElement.style.cursor='pointer';
      // HUD stack arbiter (lib/ui/hudStack.ts, docs/ui/HUD_STACK.md): on the HUD tick, every prompt that wants the focus slot
      // competes (ride > job sign > nearest proximity action > Spot it > hint > Learn Plays, with hysteresis); only a change
      // re-renders. The prompts above read hudFocusNow, so exactly one shows.
      if(hudTick){const cands:HudCandidate[]=[],jobView=jobs.getView();
        if(riding)cands.push({kind:'hop-off',distance:0});
        if(truckCandidate)cands.push({kind:'land-truck',distance:0});
        if(jobView.near){const board=jobById(jobView.near)?.board;cands.push({kind:'job-offer',key:jobView.near,distance:board?Math.hypot(board.x-location.x,board.z-location.z):0});}
        else if(jobView.stand)cands.push({kind:'job-offer',key:'farm-stand',distance:Math.hypot(FARM_STAND_SELL.x-location.x,FARM_STAND_SELL.z-location.z)});// the farm stand's Sell button shares the job-sign slot
        const npc=nearbyNpcRef.current;if(npc)cands.push({kind:'talk',key:npc.id,distance:Math.hypot(npc.x-location.x,npc.z-location.z)});
        if(closestEntry)cands.push({kind:'enter',key:closestEntry,distance:closestEntryDistance<0?-1:Math.sqrt(closestEntryDistance)});
        if(vendingTarget)cands.push({kind:'vending',key:vendingTarget,distance:vending.targetDistance});
        if(fishingHover.wants)cands.push({kind:fishingHover.wants,distance:fishingHover.wantsDistance});
        if(spotWaiting.current)cands.push({kind:'spot',distance:0});
        if(coinHintShown||seaNoteShown)cands.push({kind:'hint',distance:0});
        if(visibleVenue)cands.push({kind:'learn',key:visibleVenue,distance:Infinity});
        const next=focusArbiter.choose(cands,{ridingTruck:streetTraffic.rider.index>=0,flying:rideRef.current==='jetpack',jobActive:!!jobView.active||jobCardOpen.current,inGarden:inGarden(location.x,location.z)},now)?.kind??null;
        if(next!==hudFocusNow){hudFocusNow=next;setHudFocus(next);}
      }
      const contextOwnsAction=hudFocusNow!=='learn';
      if(contextOwnsAction){for(const v of VENUES){const button=uiElement<HTMLButtonElement>(`[data-field="${v.id}"]`);if(button&&(!button.hidden||!button.disabled||fieldCardExit.has(button))){setUIHidden(button,true);setCardInactive(button);delete button.dataset.leaving;fieldCardExit.delete(button);}}}
      else {
      for(const v of VENUES){const button=uiElement<HTMLButtonElement>(`[data-field="${v.id}"]`);if(!button)continue;if(v.id===visibleVenue){if(button.hidden||button.disabled){setUIHidden(button,false);if(button.disabled)button.disabled=false;if(button.tabIndex!==0)button.tabIndex=0;delete button.dataset.leaving;fieldCardExit.delete(button);}}else if(!button.hidden){setCardInactive(button);if(!fieldCardExit.has(button)){fieldCardExit.set(button,now);button.dataset.leaving='true';}if(visibleVenue||reduced||now-fieldCardExit.get(button)!>=350){button.hidden=true;delete button.dataset.leaving;fieldCardExit.delete(button);}}}
      }

      // Dynamic resolution switches at this frame boundary; the canvas CSS size is unchanged, only the drawing buffer.
      const viewMoved=camera.position.distanceToSquared(lastCameraPosition)>1e-6||1-Math.abs(camera.quaternion.dot(lastCameraQuaternion))>1e-9||camera.zoom!==lastCameraZoom;
      const resolution=motionResolution.update(now,viewMoved||Math.hypot(velocity.x,velocity.z)>.1||Boolean(learning&&!quiz?.quiz),paused||Boolean(quiz?.quiz)||aimWaiting);
      if(resolution){renderer.setPixelRatio(resolution);renderer.setViewport(0,fullHeight-viewportHeight,viewportWidth,viewportHeight);}
      heat.beforeRender(location,Boolean(learning&&!quiz?.quiz)||(!learning&&!viewMoved&&Math.hypot(velocity.x,velocity.z)<.05&&games.stats.visiblePlayers>0));renderer.render(scene,camera);renderStats.rendered++;heat.afterRender(now,ms,performance.now()-now,renderer.info.render.calls,learning??'');positionStore.frame(location.x,location.z);emitIslandFrame(now);islandFrameAt.current=performance.now();if(stickPaint.current){paintJoystick(joystick.current,stickPaint.current.x,stickPaint.current.y);stickPaint.current=null;}// minimap and thumb move on this frame (heat pass 3)
      cameraMoving=camera.position.distanceToSquared(lastCameraPosition)>1e-8||1-Math.abs(camera.quaternion.dot(lastCameraQuaternion))>1e-10||camera.zoom!==lastCameraZoom;lastCameraPosition.copy(camera.position);lastCameraQuaternion.copy(camera.quaternion);lastCameraZoom=camera.zoom;
      if(firstFrame){firstFrame=false;setSceneReady(true);}
    }
    if(new URLSearchParams(window.location.search).get('lesson')==='space'){rideRef.current='walk';setRideMode('walk');previousRide='walk';lessonCommand.current='intro';}
    const hiddenTransforms=createHiddenTransformGate(scene);
    const initialFlying=rideRef.current==='jetpack',initialHeight=initialFlying?flight.height:fieldSurfaceHeight(sceneSpawn.x,sceneSpawn.z);
    const stopVideoSubscription=subscribeVideoPlayback(playing=>{
      setVideoPlaying(playing);sound.setMediaPaused(playing);music.setMediaPaused(playing);
      cancelAnimationFrame(frame);last=performance.now();accumulator=0;
      if(playing)resetInputs();else if(!disposed)frame=requestAnimationFrame(animate);
    });
    camera.position.set(sceneSpawn.x+(initialFlying?16:18),23+initialHeight,sceneSpawn.z+(initialFlying?33:30));if(departure?.camera)camera.position.set(departure.camera.x,departure.camera.y,departure.camera.z);camera.lookAt(camera.position.x-16,initialHeight,camera.position.z-33);cancelAnimationFrame(frame);if(!isVideoPlaying())frame=requestAnimationFrame(animate);
    return()=>{idleInput.abort();saveArcadeDeparture.current=()=>{};clearTimeout(pierNoteTimer);pierTarget.dispose();fishing.dispose();heat.dispose();hiddenMarker.dispose();propReactions.dispose();liveKnockout.dispose();hiddenTransforms.dispose();shadowCache.dispose();viewGate.dispose();shadowVisibility.dispose();shadowBatches.dispose();npcShadows.dispose();characterArrival.dispose();coinHunt.dispose();offJobView();offJobEvents();jobs.dispose();treeDebris.dispose();rampVisuals.dispose();livePlayerGlow.dispose();npcHover.dispose();onboardingNpcFocus.dispose();buildingEffects.forEach(effect=>effect.dispose());vendingKick.dispose();vending.dispose();vendingRef.current=null;ferryGlow.dispose();window.removeEventListener(GRADUATIONS_CHANGED,showFerryLock);jetpackBreakup.dispose();quizView.dispose();resetQuizView.current=()=>{};rideChange.dispose();craterEffect.dispose();parachuteTrail.dispose();ballReactions.dispose();sonicBurst.dispose();characterGlow.dispose();parachute.dispose();ballAppearance.dispose();ballEffects.dispose();islandNpcs.dispose();landingMarker.dispose();stopVideoSubscription();music.dispose();musicRef.current=null;sound.dispose();soundRef.current=null;disposed=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',resize);window.visualViewport?.removeEventListener('resize',resize);window.removeEventListener('pointerup',finishJoystick,true);window.removeEventListener('pointercancel',finishJoystick,true);window.removeEventListener('touchend',finishTouches);window.removeEventListener('touchcancel',finishTouches);window.removeEventListener('pagehide',blur);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);boundaryFeedback.dispose();starGeometry.dispose();starMaterial.dispose();dizzyStars.removeFromParent();splat.geometry.dispose();splatMaterial.dispose();splat.removeFromParent();jetExhaust.dispose();rideTrail.dispose();flightTrail.dispose();truckReactions.dispose();streetTraffic.dispose();volleyballGame.dispose();vehicle.dispose();player.dispose();npcs.forEach(r=>r.dispose());coachPractice.dispose();renderer.domElement.removeEventListener('pointermove',trackCharacterHover);renderer.domElement.removeEventListener('pointerleave',clearCharacterHover);renderer.domElement.removeEventListener('pointerdown',beginCharacterTap);renderer.domElement.removeEventListener('pointerup',pickCharacter);renderer.domElement.removeEventListener('pointerup',chooseFieldTarget);for(const name of ['pointerdown','pointermove','wheel','touchstart','touchmove'] as const)renderer.domElement.removeEventListener(name,wakeQuizInput);games.dispose();fields.dispose();world.dispose();delete (window as unknown as {__fi2?:unknown}).__fi2;guide.geometry.dispose();aimGeometry.dispose();aimMaterial.dispose();lessonAim.current=null;renderer.domElement.removeEventListener('pointerdown',aimDown);renderer.domElement.removeEventListener('pointermove',aimMove);renderer.domElement.removeEventListener('pointerup',aimUp);renderer.domElement.removeEventListener('pointercancel',aimUp);guideMaterial.dispose();scene.traverse(object=>{if(object instanceof T.Mesh){object.geometry.dispose();const mats=Array.isArray(object.material)?object.material:[object.material];mats.forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();};
  },[]);
  useEffect(()=>{musicRef.current?.setDucked(Boolean(fieldCatalog||lesson));},[fieldCatalog,lesson]);
  // The card code (PlayerCard, PlayerArt, photo manifests, film registry) is no longer in the island bundle: warm it while
  // the island is idle, and the binder's own chunk when the Paths menu opens, so a first card or binder opens without a parse stall.
  useEffect(()=>{if(!ready)return;const w=window as Window&{requestIdleCallback?:(cb:()=>void,o?:{timeout:number})=>number;cancelIdleCallback?:(id:number)=>void};
   const timer=setTimeout(()=>{const load=()=>{void import('./PositionGuide').then(()=>setGuideWarm(true),()=>{});};if(w.requestIdleCallback)w.requestIdleCallback(load,{timeout:4000});else load();},6000);return ()=>clearTimeout(timer);},[ready]);
  useEffect(()=>{if(settingsOpen){void import('./CardCollection');prefetchPart(loadFieldLearning);}},[settingsOpen]);
  // Lazy-load pass (Oct 7 2026): the island's dialogs load on first use. One idle warm-up, 8 s after the island is interactive and
  // only while the tab is visible, fetches the parts one tap away from anywhere (Paths, your character, a lesson, a chat); the HUD
  // focus warms what the player is standing next to; a new player's welcome starts loading with the island.
  useEffect(()=>{if(!ready||failed)return;ensureStarterKit();return prefetchOnIdle([loadPathsPanel,loadBottleLogo,loadCustomizer,loadFieldLearning,loadConversation,loadCoachLesson],8000);},[ready,failed]);
  useEffect(()=>{if(!ready)return;if(hudFocus==='talk')prefetchWhenIdle(loadCoachLesson);const part=hudFocus==='talk'?loadConversation:hudFocus==='vending'?loadVending:hudFocus==='learn'?loadFieldLearning:hudFocus==='enter'?loadCoaches:null;if(part)prefetchWhenIdle(part);},[hudFocus,ready]);
  useEffect(()=>{if(!returningFromArcade&&shouldShowIslandOnboarding())prefetchPart(loadOnboarding);},[]);
  const updateStick=(e:React.PointerEvent)=>{const rect=joystickBounds.current??(joystickBounds.current=joystick.current!.getBoundingClientRect()),dx=e.clientX-rect.left-rect.width/2,dy=e.clientY-rect.top-rect.height/2,len=Math.hypot(dx,dy),scale=Math.min(1,36/Math.max(1,len));setStick({x:dx*scale,y:dy*scale});shapeStick(dx*scale/36,dy*scale/36,input.current);/* A7: dead zone + walk floor (lib/town/walkControl.ts) */if(spinGesture.current.update(dx*scale/36,dy*scale/36,performance.now(),e.pointerType==='touch'&&window.matchMedia('(pointer:coarse)').matches))spinRequested.current=true;if(hint)setHint(false);};
  // Secondary touches do not reliably synthesize click while the joystick is captured.
  const travelControlDown=(e:React.PointerEvent<HTMLButtonElement>,activate:()=>void)=>{if(e.pointerType==='mouse')return;e.preventDefault();e.currentTarget.dataset.touchActionUntil=String(performance.now()+700);activate();tapHaptic();soundRef.current?.ui('click');};
  const travelControlClick=(e:React.MouseEvent<HTMLButtonElement>,activate:()=>void)=>{if(e.detail!==0&&performance.now()<Number(e.currentTarget.dataset.touchActionUntil??0))return;activate();};
  const releaseRideAction=(pointerId:number)=>{const hold=heldRidePointers.current.get(pointerId);if(!hold)return;heldRidePointers.current.delete(pointerId);hold.button.dataset.touchActionUntil=String(performance.now()+700);};
  const actionDown=(e:React.PointerEvent<HTMLButtonElement>,action:'kick'|'juggle')=>{const mode=rideRef.current,variant=mode==='bike'?customizationRef.current.bike:mode==='moped'?customizationRef.current.moped:'';if(!truckRiding&&(isHeldRideAction(mode,variant,action==='kick'?0:1)||mode==='jetpack'&&parachutingRef.current&&action==='kick')){e.preventDefault();heldRidePointers.current.set(e.pointerId,{action:action==='kick'?0:1,button:e.currentTarget});e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.dataset.touchActionUntil=String(performance.now()+700);input.current[action]=true;tapHaptic();soundRef.current?.ui('click');return;}if(!truckRiding&&action==='kick'&&rideRef.current==='walk'&&!lessonRef.current&&e.button===0){e.preventDefault();if(shotHold.current)return;beginShotHold(e.pointerId,e.currentTarget);e.currentTarget.setPointerCapture(e.pointerId);return;}if(e.pointerType==='mouse')return;e.preventDefault();e.currentTarget.dataset.touchActionUntil=String(performance.now()+700);if(truckRiding){if(action==='kick')truckBoostRequested.current=true;else truckHonkRequested.current=true;}else input.current[action]=true;tapHaptic();soundRef.current?.ui('click');};
  const actionClick=(e:React.MouseEvent<HTMLButtonElement>,action:'kick'|'juggle')=>{if(performance.now()<Number(e.currentTarget.dataset.touchActionUntil??0))return;if(truckRiding){if(action==='kick')truckBoostRequested.current=true;else truckHonkRequested.current=true;}else input.current[action]=true;};
  const releaseStick=(e?:{pointerId:number})=>{if(e&&e.pointerId!==joystickPointer.current)return;const pointer=joystickPointer.current;joystickPointer.current=null;joystickBounds.current=null;if(pointer!==null&&joystick.current?.hasPointerCapture(pointer))joystick.current.releasePointerCapture(pointer);spinGesture.current.reset();setStick({x:0,y:0});input.current.x=input.current.z=0;};
  // Fishing hides the stick without remounting its native gesture blockers. Release any captured thumb first.
  useEffect(()=>{if(fishingOpen)releaseStick();},[fishingOpen]);// eslint-disable-line react-hooks/exhaustive-deps
  // The "calm moment" rule (GraduationHost's blocked list): no ceremony over a menu, lesson, shop door or card offer. QA11: the
  // welcome-back card and costume/ride toasts reuse it and also wait for the graduation ceremony and settings/Paths.
  const calmBlocked=learningOpen||grownUpsOpen||cardOfferOpen||vendingLeaving||fishingOpen||ballLessons.length>0||conversationOpen||onboardingOpen||customizerOpen||storeOpen||arcadeOpen||coachesOpen||museumOpen||ferryOpen||map||!!positionSelection||!!fieldCatalog||!!lesson||!!konbiniDoor;
  const toastBlocked=calmBlocked||graduationOpen||settingsOpen;
  // The HUD stack sleeps under any dialog, menu, lesson or the live fishing session (fishing has its own top HUD); notes wait.
  const stackCovered=calmBlocked||graduationOpen||settingsOpen||balancesOpen;
  return <main onPointerDownCapture={unlockAudio} onPointerUpCapture={unlockAudio} onKeyDownCapture={unlockAudio} onPointerOverCapture={e=>{const button=soundButton(e.target);/* relatedTarget null = the browser re-hit-testing after the DOM changed under a resting pointer (an animating preview re-rendering a button), not the pointer arriving: no hover tick, or it repeats while you hover Done. */if(e.pointerType!=='touch'&&button&&e.relatedTarget instanceof Node&&!button.contains(e.relatedTarget))soundRef.current?.ui(button.getAttribute('data-sound')==='slide'?'slide':'hover');}} onFocusCapture={e=>{if(soundButton(e.target))soundRef.current?.ui('hover');}} onClickCapture={e=>{const button=soundButton(e.target);if(button&&!(e.detail!==0&&performance.now()<Number((button as HTMLElement).dataset.touchActionUntil??0))){tapHaptic();const cue=(button as HTMLElement).dataset.uiSound;soundRef.current?.ui(cue==='expand'||cue==='collapse'?cue:'click');}}} className={'town-app'+(loadingComplete?' island-revealing':'')+' district-'+district+(controlsFlipped?' controls-flipped':'')+(lesson||fieldCatalog?' in-lesson':'')+(locationZone&1?' at-field':'')+(locationZone&2?' at-square':'')}>
    <HudStackContext.Provider value={hudStackEl}>
    {ready&&!failed&&mountWhen('conversation',conversationOpen)&&<NpcConversation npc={talkingNpc} open={conversationOpen} onOpenChange={setConversationOpen}/>}
    {ready&&!failed&&mountWhen('onboarding',onboardingOpen)&&<IslandOnboarding npcTarget={onboardingNpcTarget} onNpcStepChange={active=>{onboardingNpcStep.current=active;if(active)wakeLoopRef.current();}} open={onboardingOpen} onClose={()=>setOnboardingOpen(false)} value={customization} onChange={changeCustomization}/>}
    {ready&&!failed&&!settingsRef.current&&!map&&!fieldCatalog&&!lesson&&<CoinHuntHud near={hudFocus==='hint'?coinNear||seaNote:''}/>}
    {balancesOpen&&<IslandBalanceDrawer onClose={()=>setBalancesOpen(false)}/>}
    {ready&&!failed&&<FishingHost paused={balancesOpen} onOpenChange={setFishingOpen} onDialogChange={setFishingDialog}/>}
    {ready&&!failed&&<LearningHost blocked={map||storeOpen||conversationOpen||customizerOpen||arcadeOpen||onboardingOpen} spotAllowed={hudFocus==='spot'} onSpotChange={onSpotChange} onOpenChange={setLearningOpen}/>/* Lane 3: the daily warm-up and live-match Spot it */}
    {ready&&!failed&&<IslandJobs onOpenBalances={()=>setBalancesOpen(true)} blocked={settingsRef.current||map||!!fieldCatalog||!!lesson} holdToasts={stackCovered} offerAllowed={hudFocus==='job-offer'} onCardChange={onJobCardChange} onRequestWalk={()=>{if(rideRef.current!=='walk')selectRide('walk');}}/>}
    {ready&&!failed&&<FerryPreview open={ferryOpen} onOpenChange={setFerryOpen}/>}
    {ready&&!failed&&<Museum open={museumOpen} onOpenChange={setMuseumOpen}/>}
    {ready&&!failed&&mountWhen('coaches',coachesOpen)&&<CoachesCentre open={coachesOpen} onOpenChange={setCoachesOpen}/>}
    {ready&&!failed&&isDrinkMachine(vendingId)&&<DrinkMachine machineId={vendingId} open={storeOpen} onOpenChange={open=>{setStoreOpen(open);if(!open){setVendingLeaving(true);vendingRef.current?.release(()=>setVendingLeaving(false));}}} machines={getVendingMachines}/>}
    {ready&&!failed&&mountWhen('vending',storeOpen&&!isDrinkMachine(vendingId))&&<VendingMachine machineId={vendingId} itemRequest={storeItemRequest} open={storeOpen&&!isDrinkMachine(vendingId)} onOpenChange={open=>{setStoreOpen(open);if(!open){setVendingLeaving(true);vendingRef.current?.release(()=>setVendingLeaving(false));}}} value={customization} onChange={changeCustomization} onEquipRide={selectRide} machines={getVendingMachines}/>}
    {ready&&!failed&&mountWhen('customizer',customizerOpen)&&<CharacterCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} value={customization} onChange={changeCustomization} completedQuizCount={quizProgress.completed} totalQuizCount={quizProgress.total} onEquipRide={selectRide}/>}
    {ready&&!failed&&!fieldCatalog&&!lesson&&<IslandSettings onGrownUpsOpenChange={setGrownUpsOpen} pathsRequest={pathsRequest} onRestartOnboarding={()=>setOnboardingOpen(true)} onOpenStore={openStore} onStartLearning={()=>{setFieldCatalog(nearestVenue(positionStore.getSnapshot().x,positionStore.getSnapshot().z)?.id??'futsal');setHint(false);}} voiceEnabled={voiceEnabled} onVoiceChange={value=>{setVoiceEnabled(value);savePreference('fi2-voice-enabled',String(value));}} coachVoice={coachVoice} onCoachVoiceChange={value=>{setCoachVoice(value);savePreference('fi2-coach-voice',value);}} controlsFlipped={controlsFlipped} onControlsFlippedChange={value=>{releaseStick();setControlsFlipped(value);savePreference('fi2-controls-flipped',String(value));}} onOpenMap={()=>setMap(true)} open={settingsOpen} onOpenChange={value=>{setSettingsOpen(value);if(value)setMap(false);}} musicEnabled={musicEnabled} musicVolume={musicVolume} soundVolume={soundVolume} onMusicVolumeChange={value=>{setMusicVolume(value);musicRef.current?.setVolume(value);savePreference('fi2-music-volume',String(value));}} onSoundVolumeChange={value=>{setSoundVolume(value);soundRef.current?.setVolume(value);savePreference('fi2-sound-volume',String(value));}} onMusicChange={value=>{setMusicEnabled(value);musicRef.current?.setEnabled(value);try{localStorage.setItem('fi2-music-enabled',String(value));}catch{}}} soundMuted={soundMuted} onSoundMutedChange={value=>{setSoundMuted(value);soundRef.current?.setMuted(value);try{localStorage.setItem('fi2-sound-muted',String(value));}catch{}}} timeOfDay={timeOfDay} onTimeOfDayChange={changeTime}/>}
    <div className="job-spot-arrow" data-job-spot-arrow hidden aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30"><path d="M4 12h13 M12 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
    <button type="button" className="store-enter-prompt" data-vending-go aria-label="Go to the vending machine" hidden onClick={e=>{const id=e.currentTarget.dataset.vending as VendingMachineId|undefined;if(id)openVending(id);}}>Go</button>
    <button type="button" className="store-enter-prompt" data-arcade-enter aria-label="Enter Arcade" hidden onClick={()=>setArcadeOpen(true)}>Enter</button>
    {arcadeOpen&&<div className="arcade-departure-fade" data-arcade-departure aria-hidden="true"/>}
    <button type="button" className="store-enter-prompt" data-konbini-enter aria-label="Enter the Konbini" hidden onClick={()=>setKonbiniDoor('main')}>Enter</button>
    <button type="button" className="store-enter-prompt" data-caykonbini-enter aria-label="Enter the Coral Cay Konbini" hidden onClick={()=>setKonbiniDoor('cay')}>Enter</button>
    {konbiniDoor&&<KonbiniDoorSlide mode="enter"/>}
    <button type="button" className="store-enter-prompt" data-museum-enter aria-label="Enter History Museum" hidden onClick={()=>setMuseumOpen(true)}>Enter</button>
    <button type="button" className="store-enter-prompt" data-coaches-enter aria-label="Enter Coaches" hidden onClick={()=>setCoachesOpen(true)}>Enter</button>
    <div className="town-scene" ref={host}/>
    {/* HUD stack (docs/ui/HUD_STACK.md, lib/ui/hudStack.ts): one column under the coins bar. Slot order is CSS (task → focus → toast →
        guide); other components portal in with <HudSlot>. Town's own pieces render here; its HUD tick decides which one has the focus. */}
    <div className="hud-stack" data-hud-stack ref={setHudStackEl} hidden={stackCovered}>
    <div data-knockout-status data-hud-slot="task" className="knockout-status" role="status" hidden/>
    <button type="button" className="store-enter-prompt" data-hud-slot="task" data-truck-exit hidden onPointerDown={e=>travelControlDown(e,()=>{truckExitRequested.current=true;})} onClick={e=>travelControlClick(e,()=>{truckExitRequested.current=true;})}>Hop off</button>
    <button type="button" className="store-enter-prompt" data-hud-slot="task" data-truck-land hidden onPointerDown={e=>travelControlDown(e,landOnTruck)} onClick={e=>travelControlClick(e,landOnTruck)}>Land on truck</button>
    {ready&&!failed&&nearbyNpc&&hudFocus==='talk'&&<button className="npc-talk-prompt" data-hud-slot="focus" data-tour="npcs" aria-keyshortcuts="E" onClick={()=>openConversation(nearbyNpc)}>Talk to {nearbyNpc.name}</button>}
    {/* Clear path (Oct 4 2026): the pitch card starts or continues this pitch's Paths lesson (components/FieldPathCard.tsx). */}
    {VENUES.map(v=><FieldPathCard key={v.id} venue={v} onPlays={()=>setFieldCatalog(v.id)} onLaunch={()=>setHint(false)}/>)}
    </div>

    {ready&&!failed&&<><aside className={'town-minimap'+(minimapCollapsed?' is-minimized':'')}>
      {<button tabIndex={minimapCollapsed?-1:0} aria-hidden={minimapCollapsed} id="corner-map" className="minimap-content" aria-label="View map" onClick={()=>setMap(true)}><div className="minimap-heading">Explore the island <span>N <Icon name="up"/></span></div><MovingIslandOverview roads={mapFootprints.roads} buildings={mapFootprints.buildings} store={positionStore} active={!minimapCollapsed}/><div className="minimap-footer">View Map <span><Icon name="external"/></span></div></button>}
    </aside>



    <div className="travel-actions" data-tour="controls" data-job-buttons={jobButtons?'':undefined}>{jobButtons?(jobButtons.find(b=>b.slot==='ride')?<JobActionButton b={jobButtons.find(b=>b.slot==='ride')!} className="travel-mode" onPress={pressJob}/>:<button type="button" className="travel-mode job-action" data-job-onfoot aria-disabled aria-label="On foot for the job: rides wait until it is done" title="On foot during the job · R" onPointerDown={e=>travelControlDown(e,()=>jobNoteRef.current(RIDE_WAIT_NOTE))} onClick={e=>travelControlClick(e,()=>jobNoteRef.current(RIDE_WAIT_NOTE))}><TravelIcon kind="walk"/><small>On foot</small></button>):<button className="travel-mode" onPointerDown={e=>travelControlDown(e,cycleRide)} onClick={e=>travelControlClick(e,cycleRide)} aria-label={`Travel mode: ${rideMode==='jetpack'?({classic:'Twin jet','flying-car':'Flying car',helicopter:'Helicopter pack',ironman:'Iron Man suit',rocketboard:'Rocket surfboard','mini-plane':'Mini airplane'}[customization.jetpack]):TRAVEL_MODES[rideMode].label}. Change ride`}><TravelIcon kind={rideMode}/></button>}<button className="minimap-toggle" aria-label={minimapCollapsed?'Expand map':'Minimize map'} aria-expanded={!minimapCollapsed} aria-controls="corner-map" onPointerDown={e=>travelControlDown(e,()=>setMinimapCollapsed(value=>!value))} onClick={e=>travelControlClick(e,()=>setMinimapCollapsed(value=>!value))}><TravelIcon kind={minimapCollapsed?'map':'minus'}/></button><div className="touch-actions">{jobButtons?<>{jobButtons.filter(b=>b.slot==='shoot').map(b=><JobActionButton key="shoot" b={b} className="touch-shoot" onPress={pressJob}/>)}{jobButtons.filter(b=>b.slot==='juggle').map(b=><JobActionButton key="juggle" b={b} className="touch-juggle" onPress={pressJob}/>)}</>:<><button className="touch-shoot" aria-label={truckRiding?'Speed up':lesson?'Call for pass':(parachuting?'Sky scan':equippedActions(rideMode,customization)[0])} onPointerDown={e=>actionDown(e,'kick')} onPointerUp={e=>{releaseRideAction(e.pointerId);if(shotHold.current?.id===e.pointerId)finishShotHold();}} onPointerCancel={e=>{releaseRideAction(e.pointerId);if(shotHold.current?.id===e.pointerId)cancelShotHold();}} onLostPointerCapture={e=>{releaseRideAction(e.pointerId);if(shotHold.current?.id===e.pointerId)cancelShotHold();}} onContextMenu={e=>e.preventDefault()} onKeyDown={e=>{if(e.code==='Space'&&parachutingRef.current){e.preventDefault();e.stopPropagation();heldRidePointers.current.set(-1,{action:0,button:e.currentTarget});if(!e.repeat)input.current.kick=true;return;}if(e.code==='Space'&&!truckRiding&&rideRef.current==='walk'&&!lessonRef.current){e.preventDefault();e.stopPropagation();if(!e.repeat)beginShotHold('keyboard',e.currentTarget);}}} onKeyUp={e=>{if(e.code==='Space'&&parachutingRef.current){e.preventDefault();e.stopPropagation();releaseRideAction(-1);return;}if(e.code==='Space'&&shotHold.current?.id==='keyboard'){e.preventDefault();e.stopPropagation();finishShotHold();}}} onBlur={e=>{releaseRideAction(-1);if(shotHold.current?.button===e.currentTarget)cancelShotHold();}} title={`${truckRiding?'Speed up':(parachuting?'Sky scan — hold to spin faster and look for open space':equippedActions(rideMode,customization)[0])} · Space${rideMode==='walk'&&!truckRiding?'. Hold for a higher, stronger kick.':''}`} onClick={e=>actionClick(e,'kick')}>{truckRiding?<TravelIcon kind="boost"/>:<TravelIcon kind={parachuting?'spin':rideMode==='scooter'?'spin':rideMode==='bike'?'front':rideMode==='moped'?'stand':rideMode==='jetpack'?'boost':'shoot'}/>}</button><button className="touch-juggle" hidden={Boolean(lesson)} aria-label={truckRiding?'Honk':rideMode==='walk'&&juggling?'Stop juggling':(parachuting?(skyJuggling?'Stop juggling':'Juggle'):equippedActions(rideMode,customization)[1])} title={`${truckRiding?'Honk':(parachuting?'Juggle in the sky — alternate soft touches while you glide':equippedActions(rideMode,customization)[1])} · J`} aria-pressed={parachuting?skyJuggling:rideMode==='walk'?juggling:undefined} onPointerDown={e=>actionDown(e,'juggle')} onLostPointerCapture={e=>releaseRideAction(e.pointerId)} onClick={e=>actionClick(e,'juggle')}>{truckRiding?<Icon name="horn" size={26}/>:<TravelIcon kind={parachuting?(skyJuggling?'stop':'juggle'):rideMode==='bike'?'back':rideMode==='scooter'||rideMode==='moped'?'jump':rideMode==='jetpack'?'skydive':juggling?'stop':'juggle'}/>}</button></>}</div></div><div className="touch-controls"><div className="joystick" data-edge="false" ref={joystick} draggable={false} onDragStart={e=>e.preventDefault()} onContextMenu={e=>e.preventDefault()} onPointerDown={e=>{if(joystickPointer.current!==null){if(e.currentTarget.hasPointerCapture(joystickPointer.current))return;releaseStick();}e.preventDefault();joystickBounds.current=null;joystickPointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);updateStick(e);}} onPointerMove={e=>{if(e.pointerId===joystickPointer.current&&e.currentTarget.hasPointerCapture(e.pointerId)){e.preventDefault();updateStick(e);}}} onPointerUp={releaseStick} onPointerCancel={releaseStick} onLostPointerCapture={releaseStick} role="group" aria-label="Drag to move"><i className="joystick-contact" aria-hidden="true"><i className="joystick-contact-arc"/></i><span  aria-hidden="true"/></div></div>
    {scored&&<div className="goal-toast" role="status">GOLAZO! <span>GO GET ANOTHER.</span></div>}</>}
    {ready&&!failed&&<GraduationHost blocked={calmBlocked} onOpenChange={setGraduationOpen}/>}
    {ready&&!failed&&<CardOfferHost blocked={graduationOpen||vendingLeaving||fishingOpen||ballLessons.length>0||conversationOpen||onboardingOpen||customizerOpen||storeOpen||arcadeOpen||coachesOpen||museumOpen||ferryOpen||map||!!positionSelection} onOpenChange={setCardOfferOpen}/>}
    {ready&&!failed&&<CostumeMilestoneToast blocked={toastBlocked}/>}{ready&&!failed&&<RideUnlockToast blocked={toastBlocked}/>}{ready&&!failed&&<FuelToast blocked={stackCovered/* also waits under the island pocket (bug A3) */}/>}{ready&&!failed&&<WelcomeBack blocked={toastBlocked||jobRunning||jobCardShown} held={stackCovered}/>}
    {ballLessons.length>0&&<BallHuntLesson key={ballLessons[0]} spotId={ballLessons[0]} onDismiss={()=>setBallLessons(queue=>queue.slice(1))}/>}
    {fieldCatalog&&<FieldLearning pathRequest={formatPathRequest??undefined} learningId={learningRequest?.id} onResetQuizView={()=>resetQuizView.current()} onResizeSound={()=>soundRef.current?.ui('hover')} onWake={()=>wakeLoopRef.current()} onLivePause={paused=>gamesRef.current?.setPaused(fieldCatalog,paused)} onPickerChange={setPlaysPickerOpen} readMatch={()=>gamesRef.current?.getView(fieldCatalog)??null} cameraAngle={learningAngle} key={formatPathRequest?.nonce??learningRequest?.nonce??fieldCatalog} format={fieldCatalog} session={fieldSession} voiceEnabled={voiceEnabled} coachVoice={coachVoice} narrationPaused={arcadeOpen||settingsOpen||map||conversationOpen||videoPlaying||cardOfferOpen} onClose={()=>{fieldSession.current=null;setFieldCatalog(null);if(learningRequest||formatPathRequest){setFormatPathRequest(null);setLearningRequest(null);setPathsRequest({nonce:Date.now()});setSettingsOpen(true);}}}/>}
    {lesson&&<CoachLesson phase={lesson} open={laneOpen} feedback={coachFeedback} onWatch={()=>requestLesson('watch')} onPractice={()=>requestLesson('practice')} onPass={()=>{input.current.kick=true;}} onExit={()=>requestLesson('exit')} format={passFormat} onFormat={choosePassFormat} attempts={passAttempts} aimStatus={aimStatus} onStraight={()=>lessonAim.current?.straight()} onPlay={()=>lessonAim.current?.play()} onCancel={()=>lessonAim.current?.cancel()} onReplay={()=>lessonAim.current?.replay()}/>}
    {!ready&&!failed&&(returningFromArcade?<IslandReturnLoading exiting={loadingComplete}/>:<IslandLoading exiting={loadingComplete}/>)}
    {failed&&<div className="town-loading"><h2>The island needs WebGL.</h2><p>Enable hardware acceleration in your browser, then reload.</p><button className="pixel-button" onClick={()=>window.location.reload()}>TRY AGAIN</button></div>}
    {guideMounted.current&&<PositionGuide selection={positionSelection} onClose={()=>{setPositionSelection(null);gamesRef.current?.setHoverPaused(null);}}/>}
    <div data-position-tip className="live-position-tip" role="status" hidden/>
    <MovingIslandTravelMap store={positionStore} open={map} onOpenChange={setMap} {...mapFootprints} onSelect={destination=>{if(destination==='store'||destination==='square'||destination==='coaches'||destination==='cay'||destination==='museum')go(destination);else goField(destination);}}/>
    </HudStackContext.Provider>
  </main>;
}

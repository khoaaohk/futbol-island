/**
 * Summit Isle activities runtime (Oct 12 2026): the Sunset Kick challenge's hoops. Rules: lib/town/summitKick.ts; static props
 * (the start post): summitActivitiesWorld.ts; HUD: components/SummitKickHud.tsx (it talks through lib/town/summitStore.ts).
 * The lookout telescope that shared this runtime was removed (Oct 14 2026, user: "let's remove the telescope entirely"); the
 * zipline stands where it stood (lib/graphics/zipline.ts).
 *
 * Heat: everything here is built on demand and disposed when it ends. While nothing is on, Town's calls cost a few comparisons:
 *  - update(): one distance to the start post (the prompt);
 *  - ball() / aim() / holdPlayer(): one phase check.
 * A round adds 5 hoop meshes (one shared geometry and material) and a chalk line, animated only while the round runs. No timers,
 * no rAF of its own, no network but the one board session request when a round starts.
 */
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {kickLayout,createKickRound,kickCoins,recordKickRound,sanitizeKickSave,behindLine,onKickPitch,HOOP_COUNT,KICK_RULES,KICK_RUN_PREFIX,KICK_PERFECT_REWARD,KICK_SAVE_KEY,type KickLayout,type KickRound,type KickHoop,type KickVec} from '../town/summitKick';
import {kickStore,installSummitActions} from '../town/summitStore';
import {creditRun,creditOnce} from '../arcade/arcadeWallet';
import {beginBoardSession} from '../arcade/boardClient';
import {createLearnCoins,LEARN_COINS_EARNED} from '../town/learnCoins';
import {countKickPlay} from '../analytics/summitEvents';
import {COIN_QUEST} from '../town/coinQuest';
import {readCoinProgress,recordCoin} from '../town/coinProgress';
import {SCORE_BALL_HOOPS} from '../town/summitBalls';
/** Summit Isle hidden ball (Oct 15 2026, summitBalls.ts): a Summit Kick round with SCORE_BALL_HOOPS hoops pops one out of the post.
 *  Revealing writes the ball hunt's own save (no new key). */
const SCORE_BALL=COIN_QUEST.find(s=>s.reveal==='score');
const ballRevealed=(id:string)=>{try{return readCoinProgress().revealed.includes(id);}catch{return true;}};

/** The start prompt shows within this many metres of the post (on foot). */
const REACH=3.4;
type Ports={
 /** Puts the player on the kick spot facing the goal, the ball at their feet. */
 teleport:(x:number,z:number,yaw:number)=>void;
 /** A small burst where a hoop pops (Town's ball effects). */
 impact:(x:number,y:number,z:number)=>void;
};
export type SummitUpdate={
 now:number;dt:number;elapsed:number;reduced:boolean;camera:T.Camera;width:number;height:number;
 x:number;z:number;
 /** On foot on the ground (not flying, riding or falling). */
 onFoot:boolean;canEnter:boolean;sunset:boolean;
 /** The HUD arbiter's current 'enter' key (lib/ui/hudStack.ts), so exactly one prompt shows. */
 focusKey:string|null;
 ui:<E extends HTMLElement>(selector:string)=>E|null|undefined;place:(el:HTMLElement,x:number,y:number)=>void;hide:(el:HTMLElement,hidden:boolean)=>void;
};
const cue=(detail:string)=>{if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('fi2-vending-cue',{detail}));};
const learnCoins=createLearnCoins({creditOnce:(id,game,amount,reason)=>creditOnce(id,game,amount,reason),notify:detail=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(LEARN_COINS_EARNED,{detail}));}});
const SUNSET_RING=new T.Color('#ffb04a'),DAY_RING=new T.Color('#ef6a3c');

function hoopGeometry(r:number){
 const parts:T.BufferGeometry[]=[];const paint=(g:T.BufferGeometry,c:string)=>{const col=new T.Color(c),n=g.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=col.r;a[i*3+1]=col.g;a[i*3+2]=col.b;}g.setAttribute('color',new T.BufferAttribute(a,3));g.deleteAttribute('uv');g.deleteAttribute('normal');return g.index?g.toNonIndexed():g;};
 // Eight alternating arcs (sunset orange / cream) in the ring's plane (x = 0 after the turn below: the hoop faces ±x).
 for(let i=0;i<8;i++){const g=new T.TorusGeometry(r,.055,6,6,Math.PI/4);g.rotateZ(i*Math.PI/4);parts.push(paint(g,i%2?'#fff3df':'#ffffff'));}
 const merged=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());merged.rotateY(Math.PI/2);return merged;
}
export function createSummitActivities(scene:T.Scene,ports:Ports){
 // Positions are computed lazily (first prompt check), from the island's shape as it is now.
 let layout:KickLayout|null=null;
 const ensure=()=>{if(!layout)layout=kickLayout();return {layout:layout!};};
 const anchor=new T.Vector3();

 // ---------------------------------------------------------------------------------------------------- kick challenge
 let phase:'idle'|'intro'|'playing'|'done'='idle',round:KickRound|null=null,roundNo=0,prevMode='',hoopsRoot:T.Group|null=null;
 /** A pending move to the kick spot, and whether the player has reached the pitch since the round began. */
 let teleport:{x:number;z:number;yaw:number}|null=null,onPitch=false;
 let hoopGeo:T.BufferGeometry|null=null,hoopMat:T.MeshBasicMaterial|null=null,lineGeo:T.BufferGeometry|null=null,lineMat:T.MeshBasicMaterial|null=null;
 const hoopMeshes=new Map<string,T.Mesh>(),popAge=new Map<string,number>();
 const prev:KickVec={x:0,y:0,z:0};let pops=0;
 function buildHoops(L:KickLayout){
  disposeHoops();
  hoopGeo=hoopGeometry(KICK_RULES.hoopRadius);hoopMat=new T.MeshBasicMaterial({vertexColors:true,color:SUNSET_RING.clone(),toneMapped:false});
  hoopsRoot=new T.Group();hoopsRoot.name='summit-kick-hoops';
  for(const h of L.hoops){const m=new T.Mesh(hoopGeo,hoopMat);m.name='summit-kick-hoop-'+h.id;m.position.set(h.x,h.y,h.z);m.castShadow=m.receiveShadow=false;hoopsRoot.add(m);hoopMeshes.set(h.id,m);}
  // The chalk line the shots count from (a thin strip across the middle of the pitch).
  lineGeo=new T.PlaneGeometry(.14,9);lineGeo.rotateX(-Math.PI/2);lineMat=new T.MeshBasicMaterial({color:'#fbf3dc',transparent:true,opacity:.85,depthWrite:false});
  const line=new T.Mesh(lineGeo,lineMat);line.name='summit-kick-line';line.position.set(L.lineX,L.ground+.03,L.spot.z);line.renderOrder=1;hoopsRoot.add(line);
  scene.add(hoopsRoot);
 }
 function disposeHoops(){if(hoopsRoot){hoopsRoot.removeFromParent();hoopsRoot=null;}hoopMeshes.clear();popAge.clear();hoopGeo?.dispose();hoopMat?.dispose();lineGeo?.dispose();lineMat?.dispose();hoopGeo=lineGeo=null;hoopMat=lineMat=null;}
 const readSave=()=>{try{return sanitizeKickSave(JSON.parse(localStorage.getItem(KICK_SAVE_KEY)??'null'));}catch{return sanitizeKickSave(null);}};
 const viewOf=()=>{const s=round?.state;return {hits:s?.hits??0,kicks:s?.kicks??0,secondsLeft:Math.ceil(round?.timeLeft??KICK_RULES.seconds)};};
 function startKick(){if(phase!=='idle')return;phase='intro';kickStore.set({phase:'intro',result:null,note:'',hits:0,kicks:0,maxKicks:KICK_RULES.kicks,hoops:HOOP_COUNT,secondsLeft:KICK_RULES.seconds});cue('select');}
 function beginRound(){
  if(phase!=='intro'&&phase!=='done')return;
  const L=ensure().layout;buildHoops(L);round=createKickRound(L,performance.now());roundNo++;prevMode='';
  beginBoardSession('kick');// the play token for the island board, issued as the round starts
  countKickPlay();// admin analytics: a Summit Kick round played (best score is read from the arcade board)
  // Applied at the start of the next island tick (holdPlayer), inside the loop like any other move.
  teleport={x:L.spot.x,z:L.spot.z,yaw:L.spot.yaw};onPitch=false;
  phase='playing';kickStore.set({phase:'playing',result:null,note:'Shoot from behind the chalk line (a kick moves you a step closer). Tap Kick for the low hoops, hold Kick a moment for the high ones.',...viewOf(),popped:'',pops});cue('confirm');
 }
 function endKick(){if(phase==='playing')round?.quit();phase='idle';teleport=null;round=null;disposeHoops();kickStore.set({phase:'idle',result:null,note:'',popped:''});}
 function pop(h:KickHoop){
  popAge.set(h.id,0);pops++;ports.impact(h.x,h.y,h.z);cue('pop');try{navigator.vibrate?.(18);}catch{}
  kickStore.set({...viewOf(),popped:h.label,pops,note:round&&round.hoopsLeft>0?`${h.label}! ${round.hoopsLeft} to go.`:''});
 }
 function finishRound(){
  if(!round)return;const s=round.state,end=s.end??'kicks',score=round.score,quit=end==='quit';
  let best=readSave().best,newBest=false;
  if(!quit){const r=recordKickRound(readSave(),{hits:s.hits,score:score.total});newBest=r.newBest;best=r.save.best;try{localStorage.setItem(KICK_SAVE_KEY,JSON.stringify(r.save));}catch{/* private mode */}}
  phase='done';
  const result={end,hits:s.hits,kicks:s.kicks,seconds:Math.round(s.elapsed),score:score.total,hoopPoints:score.hoops,accuracy:score.accuracy,speed:score.speed,best,newBest,coins:0,round:roundNo};
  kickStore.set({phase:'done',result,...viewOf(),note:''});cue(s.hits===HOOP_COUNT?'equip':'confirm');
  const coins=quit?0:kickCoins(s.hits);
  if(coins>0)void creditRun(`${KICK_RUN_PREFIX}${Date.now().toString(36)}-${roundNo}`,'island',coins,`Summit Kick · ${s.hits}/${HOOP_COUNT} hoops`).then(paid=>{const v=kickStore.get();if(v.result&&v.result.round===result.round)kickStore.set({result:{...v.result,coins:paid}});if(paid>0)cue('coin');});
  if(s.hits===HOOP_COUNT)void learnCoins.pay('explore',KICK_PERFECT_REWARD,'Summit Kick: all five hoops');
  if(!quit&&SCORE_BALL&&s.hits>=SCORE_BALL_HOOPS&&!ballRevealed(SCORE_BALL.id)&&recordCoin(SCORE_BALL.id,'reveal')){kickStore.set({note:'A hidden ball popped out of the kick post! Go and grab it.'});cue('equip');}
 }

 const off=installSummitActions({startKick,beginRound,exitKick:endKick});

 return {
 get kickPhase(){return phase;},
  get layout(){return ensure().layout;},
  /** At the start of each island tick: a round's pending move to the kick spot. Never holds the player (always false). */
  holdPlayer(_input?:unknown,_keys?:unknown,_dt?:number){
   if(teleport){const t=teleport;teleport=null;ports.teleport(t.x,t.z,t.yaw);}
   return false;
  },
  /** Tap-shot aim help during a round: toward the nearest low hoop within 18° of the facing (like the pier ring's); null = leave it. */
  aim(p:{x:number;z:number},yaw:number):number|null{
   if(phase!=='playing'||!layout||!round||!behindLine(layout,p.x))return null;
   let best:number|null=null,bestD=18*Math.PI/180;
   for(const h of layout.hoops){if(round.popped.has(h.id)||h.y-layout.ground>1)continue;const a=Math.atan2(h.x-p.x,h.z-p.z),d=Math.abs(Math.atan2(Math.sin(a-yaw),Math.cos(a-yaw)));if(d<bestD){bestD=d;best=a;}}
   return best;
  },
  /** After each walking-ball step: counts kicks (a new shot), tests the ball's path through the hoops, ends a shot. */
  ball(b:{mode:string;x:number;y:number;z:number},kicker:{x:number;z:number}){
   if(phase!=='playing'||!round){prevMode=b.mode;return;}
   const cur={x:b.x,y:b.y,z:b.z};
   if(b.mode==='shot'&&prevMode!=='shot'){const r=round.kick(kicker.x);
    if(r==='close')kickStore.set({note:'Too close! Step back behind the chalk line to shoot.'});
    else if(r==='counted'){kickStore.set({...viewOf(),note:''});const h=round.ball(prev,cur);if(h)pop(h);}}
   else if(b.mode==='shot'){const h=round.ball(prev,cur);if(h)pop(h);}
   if(prevMode==='shot'&&b.mode!=='shot')round.shotOver();
   prev.x=cur.x;prev.y=cur.y;prev.z=cur.z;prevMode=b.mode;
  },
  /** Per frame (Town's HUD block): the prompt, the round clock, hoop animation. */
  update(c:SummitUpdate):{key:string;distance:number}|null{
   // ---- the round
   if(phase==='playing'&&round&&layout){
    round.step(c.dt);
    const inside=onKickPitch(layout,c.x,c.z);if(inside)onPitch=true;
    if(!teleport&&onPitch&&(!c.onFoot||!inside))round.leave();
    if(round.state.phase==='done')finishRound();else kickStore.set({secondsLeft:Math.ceil(round.timeLeft),sunset:c.sunset});
   }
   if(hoopsRoot&&hoopMat){
    const t=c.elapsed;if(phase==='playing'){hoopMat.color.copy(c.sunset?SUNSET_RING:DAY_RING);}
    for(const [id,m] of hoopMeshes){const age=popAge.get(id);
     if(age!==undefined){const a=age+c.dt;popAge.set(id,a);if(a>.32){if(m.visible)m.visible=false;}else m.scale.setScalar(1+a*2.4);continue;}
     if(phase==='playing'&&!c.reduced){m.rotation.x=t*1.2;m.scale.setScalar(1+.04*Math.sin(t*4+m.position.z));}}
   }
   // ---- prompts (world-anchored, like the fishing post's)
   let want:{key:string;distance:number}|null=null;
   const kickPrompt=c.ui<HTMLButtonElement>('[data-summit-kick-start]');
   if(!kickPrompt)return null;
   // Summit Kick needs feet on the ball.
   const near=c.onFoot&&c.canEnter&&phase==='idle';
   let dk=Infinity,L:KickLayout|null=null;
   // Cheap box test first: the post is on Summit Isle (x > 400), so the main island never computes the layout.
   if(near&&c.x>400){L=ensure().layout;dk=Math.hypot(c.x-L.post.x,c.z-L.post.z);}
   if(dk<REACH)want={key:'summit-kick',distance:dk};
   const show=(el:HTMLButtonElement|null|undefined,visible:boolean,x:number,y:number,z:number)=>{if(!el)return;let hidden=!visible;
    if(!hidden){anchor.set(x,y,z).project(c.camera);hidden=anchor.z< -1||anchor.z>1;if(!hidden)c.place(el,T.MathUtils.clamp((anchor.x+1)*c.width/2,75,c.width-75),T.MathUtils.clamp((1-anchor.y)*c.height/2,90,c.height-160));}
    c.hide(el,hidden);};
   show(kickPrompt,!!want&&want.key==='summit-kick'&&c.focusKey==='summit-kick',L?.post.x??0,(L?.ground??0)+2.9,L?.post.z??0);
   return want;
  },
  dispose(){off();disposeHoops();round=null;phase='idle';},
 };
}
export type SummitActivities=ReturnType<typeof createSummitActivities>;

// Moving emotes (user, Oct 22 2026: "do the walking emotes"). While you walk / run on foot the wheel shows the moving emotes (Oct 23: one per standing
// emote, ten) layered on the locomotion: never stopping or slowing you, no zoom, legs untouched. Pure checks on lib/town/moveEmotes.ts (sets, variants, bags, overlay
// bounds, pairwise difference, rules), the writer, the camera rules, plus source scans of the wiring (Town, townsfolk, friends, analytics).
const assert=require('node:assert'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
function load(file,over={}){
 const full=path.join(ROOT,file),m={exports:{}};
 vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,Object,Uint8Array,Float32Array,require:id=>{
   if(id.startsWith('.')){const rel=path.resolve(path.dirname(full),id),key=path.basename(rel);if(over[key])return over[key];return load(path.relative(ROOT,rel+'.ts'),over);}
   throw new Error('unexpected require '+id);}});
 return m.exports;
}
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const M=load('lib/town/moveEmotes.ts'),B=load('lib/town/emoteBody.ts'),EB=load('lib/town/emoteBounds.ts').EMOTE_BOUNDS,C=B.BC;
const Ctx=load('lib/town/emoteContexts.ts'),CM=load('lib/town/emoteCameraMath.ts');
const seeded=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const RA=[.05,.12,-.1];
const pose=(e,v,a)=>Array.from(M.sampleMovePose(e,v,a,new Float32Array(B.BODY_CH)));
const ALLV=[];for(const s of M.MOVE_SCRIPTS)s.variants.forEach((d,v)=>ALLV.push({s,v,id:s.label+'/'+d.id}));

t('ten moving emotes (one per standing emote), three named variants each, local ids 50..59, wire values reuse the protocol Emote 0..9',()=>{
 assert.equal(M.MOVE_SCRIPTS.length,10);assert.deepEqual({...M.MOVE_EMOTE},{WaveOnMove:50,VictoryJog:51,Skip:52,Strut:53,RunByFive:54,CallForIt:55,JuggleOnMove:56,WellPlayedOnMove:57,LaughOnMove:58,ThanksOnMove:59});
 assert.deepEqual(M.MOVE_SCRIPTS.map(s=>s.wire),[0,1,8,4,2,6,3,5,7,9],'wave → Wave, jog → Cheer, skip → Dance, strut → ShowOff, run-by five → HighFive, call → PassBall, juggle, well played, laugh, thanks');
 assert.equal(new Set(M.MOVE_SCRIPTS.map(s=>s.wire)).size,10,'one wire each: every standing emote has a moving version a friend sees');
 const ids=new Set();for(const s of M.MOVE_SCRIPTS){assert.equal(s.variants.length,3,s.label);assert(s.seconds>=2.6&&s.seconds<=4,s.label+' length');for(const d of s.variants){ids.add(s.emote+d.id);assert(d.name.length>3);}}
 assert.equal(ids.size,30);for(let e=50;e<=59;e++)assert(M.isMoveEmote(e));for(const e of [0,9,18,34,49,60])assert(!M.isMoveEmote(e));
 const proto=read('multiplayer/protocol/types.ts');assert(/Walk: 0, Run: 1/.test(proto),'Mode.Walk / Mode.Run pinned');assert.equal(M.WIRE_WALK,0);assert.equal(M.WIRE_RUN,1);
 assert(/Emote = \{ Wave: 0, Cheer: 1, HighFive: 2, JuggleWithMe: 3, ShowOff: 4, WellPlayed: 5, PassBall: 6, Laugh: 7, Dance: 8, Thanks: 9 \}/.test(proto),'no new wire values');
 const R=load('lib/town/emoteReact.ts',{celebrations:{celebrationJump(){}}});for(const s of M.MOVE_SCRIPTS)assert.equal(R.EMOTE_EMOJI[s.emote],s.emoji,'bubble emoji '+s.label);
});
t('the moving wheel: ten buttons in the standing wheel\'s order, Wave on the move first; the EmoteWheel picks it for ctx "move"',()=>{
 const w=M.moveWheel();assert.equal(w.length,10);const R0=load('lib/town/emoteReact.ts',{celebrations:{celebrationJump(){}}});assert.deepEqual(w.map(x=>M.moveScriptFor(x.emote).wire),R0.LOCAL_EMOTES.map(x=>x.emote),'same order as standing');assert.equal(w[0].label,'Wave on the move');assert.equal(w[0].icon,'hand');
 const chip=read('components/party/PartyChip.tsx');const std=new Set(R0.LOCAL_EMOTES.map(x=>x.icon));for(const x of w)if(!std.has(x.icon))assert(chip.includes(`'${x.icon}':`),'glyph '+x.icon);
 assert(/ctx === 'move' \? moveWheel\(\)/.test(read('components/party/EmoteWheel.tsx')));
});
t('shuffled bag of three: never the same twice in a row, every bag uses all three; you and a friend draw separately',()=>{
 const bag=M.createMoveBag(),r=seeded(5);let last=-1;const seen=[];
 for(let i=0;i<300;i++){const v=M.nextMoveVariant(r,bag);assert(v>=0&&v<3);assert.notEqual(v,last);last=v;seen.push(v);}
 for(let i=0;i<300;i+=3)assert.equal(new Set(seen.slice(i,i+3)).size,3);
 for(const s of M.MOVE_SCRIPTS){let l=-1;for(let i=0;i<30;i++){const v=M.pickMoveVariant(s.emote,M.MOVE_ROLE.Friend,r);assert.notEqual(v,l);l=v;}}
 assert.equal(M.moveVariantIndex(50,0),0);assert.equal(M.moveVariantIndex(54,2),14);assert.equal(M.moveVariantIndex(59,2),29);assert.equal(M.moveVariantIndex(7,0),-1);
});

// ---- the overlay: upper body only, inside the bounds ----
const LEGS=[C.lhx,C.lhz,C.lkn,C.rhx,C.rhz,C.rkn],ROOT_CH=[C.px,C.pz,C.crouch];
const PELVIS=.88,SHOULDER=.385,ARM=.62,HEAD=.95,WALK_BOB=.05;
t('upper body only: legs, root travel and crouch are never written; the bounce stays small; the highest point is under EMOTE_BOUNDS.maxHeight',()=>{
 let hi=0,hopMax=0;
 for(const x of ALLV)for(let a=0;a<=x.s.seconds+1e-9;a+=1/60){const o=pose(x.s.emote,x.v,a),id=x.id+' t '+a.toFixed(2);
  for(const i of [...LEGS,...ROOT_CH])assert.equal(o[i],0,id+' channel '+i);
  assert(o[C.hop]>=-1e-9&&o[C.hop]<=M.MOVE_MAX_HOP,id+' hop '+o[C.hop]);hopMax=Math.max(hopMax,o[C.hop]);
  assert(Math.abs(o[C.yaw])<=.3&&Math.abs(o[C.roll])<=.3,id+' hip twist / sway small');
  const h=PELVIS+WALK_BOB+o[C.hop]+Math.max(SHOULDER+ARM,HEAD);hi=Math.max(hi,h);assert(h<=EB.maxHeight,id+' height '+h.toFixed(2));
  for(const i of [C.pitch,C.twist,C.side,C.hx,C.hy,C.hz])assert(Math.abs(o[i])<=1.1,id+' channel '+i+' '+o[i]);}
 console.log('  biggest bounce '+hopMax.toFixed(2)+' m (limit '+M.MOVE_MAX_HOP+'), highest point '+hi.toFixed(2)+' m (limit '+EB.maxHeight+'); root moves with the player (no rootRadius)');
});
t('every variant starts and ends at rest (the writer eases it on top of the walk)',()=>{
 for(const x of ALLV)for(const a of [0,x.s.seconds]){const o=pose(x.s.emote,x.v,a);
  for(let i=0;i<o.length;i++){if(Number.isNaN(o[i]))continue;const rest=i>=C.lsx&&i<=C.rel?RA[(i-C.lsx)%3]:0;assert(Math.abs(o[i]-rest)<.1,x.id+' t '+a+' channel '+i+' '+o[i].toFixed(3));}}
 assert.equal(M.moveWeight(0,3),0);assert.equal(M.moveWeight(1,3),1);assert(M.moveWeight(2.9,3)<.35);
});
const range=(x,idx)=>{let s=0;for(const i of idx){let lo=1e9,hi=-1e9;for(let a=0;a<=x.s.seconds;a+=.05){let v=pose(x.s.emote,x.v,a)[i];if(Number.isNaN(v))v=RA[(i-C.lsx)%3];lo=Math.min(lo,v);hi=Math.max(hi,v);}s+=hi-lo;}return s;};
t('whole upper body, not a static arm: torso, head and arms all move; hops or sways on top of the walk',()=>{
 for(const x of ALLV){
  assert(range(x,[C.pitch,C.twist,C.side])>=.25,x.id+' torso');assert(range(x,[C.hx,C.hy,C.hz])>=.2,x.id+' head');
  assert(Math.max(range(x,[C.lsx,C.lsz,C.lel]),range(x,[C.rsx,C.rsz,C.rel]))>=.6,x.id+' arms');
  assert(range(x,[C.hop,C.roll,C.yaw])>=.06,x.id+' bounce / hip sway');}
});
// ---- difference: every variant from every other (weighted RMS over the upper-body channels, 32 samples; an arm left to the walk counts as rest) ----
const UPPER=[C.hop,C.yaw,C.pitch,C.twist,C.side,C.hx,C.hy,C.hz,C.lsx,C.lsz,C.lel,C.rsx,C.rsz,C.rel,C.roll],W=new Array(24).fill(1);W[C.hop]=3;
const sig=x=>Array.from({length:32},(_,i)=>{const o=pose(x.s.emote,x.v,(i+.5)/32*x.s.seconds);for(let k=C.lsx;k<=C.rel;k++)if(Number.isNaN(o[k]))o[k]=RA[(k-C.lsx)%3];return o;});
const rms=(A,Bs)=>{let s=0,c=0;for(let i=0;i<A.length;i++)for(const j of UPPER){const e=(A[i][j]-Bs[i][j])*W[j];s+=e*e;c++;}return Math.sqrt(s/c);};
t('all 30 moving variants differ pairwise (weighted RMS over the upper body, threshold .3 like emote-body)',()=>{
 const l=ALLV.map(x=>({id:x.id,s:sig(x)}));let min=1e9,who='';
 for(let i=0;i<l.length;i++)for(let j=i+1;j<l.length;j++){const d=rms(l[i].s,l[j].s);if(d<min){min=d;who=l[i].id+' / '+l[j].id;}assert(d>=.3,l[i].id+' vs '+l[j].id+' '+d.toFixed(3));}
 console.log('  closest moving pair: '+who+' RMS '+min.toFixed(3));
});

// ---- rules ----
t('wheel: the moving set on foot above the threshold (hysteresis), never on a ride / flying / swimming / in a job',()=>{
 const s=(speed,o={})=>({speed,ride:'walk',flying:false,swimming:false,inJob:false,...o});
 assert.equal(M.moveWheelOn(false,s(.5)),false);assert.equal(M.moveWheelOn(false,s(1.2)),true);assert.equal(M.moveWheelOn(true,s(.6)),true,'holds while slowing');assert.equal(M.moveWheelOn(true,s(.3)),false);
 for(const o of [{ride:'scooter'},{ride:'jetpack'},{flying:true},{swimming:true},{inJob:true}])assert.equal(M.moveWheelOn(true,s(3,o)),false,JSON.stringify(o));
});
t('button: walking / running shows the moving set ONLY with a townsperson or friend to answer; flying / swimming keep their own sets',()=>{
 const R=o=>Ctx.emoteButtonState({flying:false,swimming:false,npcNear:false,friendNear:false,friendFlyingNear:false,friendSwimmingNear:false,...o});
 assert.deepEqual(R({moving:true}),{hidden:true,disabled:false,ctx:'move',why:'Nobody to emote with'});
 assert.equal(R({moving:true,npcNear:true}).hidden,false);assert.equal(R({moving:true,npcNear:true}).ctx,'move');assert.equal(R({moving:true,friendNear:true}).ctx,'move');
 assert.equal(R({npcNear:true}).ctx,'ground','standing: the standing set');
 assert.equal(R({moving:true,flying:true,friendFlyingNear:true}).ctx,'fly');assert.equal(R({moving:true,swimming:true}).ctx,'swim');assert.equal(R({moving:true,swimming:true}).hidden,true);
 assert.equal(Ctx.emoteCtxStore.get().moving,false,'idle store: not moving');
});
t('mechanics: moving never ends it; stopping eases it out within its length; menu / room / ride / fly / swim / job / lesson end it',()=>{
 const s=o=>M.moveEmoteStop({age:1,end:3.4,ride:'walk',flying:false,swimming:false,inJob:false,lesson:false,menuOpen:false,room:false,...o});
 assert.equal(s({}),'');assert.equal(s({age:3.4}),'done');
 for(const [o,why] of [[{menuOpen:true},'menu'],[{room:true},'room'],[{ride:'bike'},'ride'],[{flying:true},'fly'],[{swimming:true},'swim'],[{inJob:true},'job'],[{lesson:true},'lesson']])assert.equal(s(o),why);
 assert.equal(M.moveEndAfter(1,3.4,3),3.4,'moving: full length');assert.equal(M.moveEndAfter(1,3.4,0),1+M.MOVE_STOP_FADE,'stopped: eases out');assert.equal(M.moveEndAfter(3.2,3.4,0),3.4,'never lengthens');
 // the overlay never touches velocity / input: the module and writer have no movement state at all
 for(const f of ['lib/town/moveEmotes.ts','lib/graphics/moveEmotePose.ts'])assert(!/velocity|input\.current|stickFor|routine\.speed/.test(read(f).replace(/\/\/.*$/gm,'')),f);
});
t('camera: a moving emote never zooms (emoteCamSkip "move"); the standing "moving" block is unchanged; the nudge is <= 15%, eased, none when running fast',()=>{
 const base={reduced:false,riding:false,swimming:false,flying:false,inJob:false,cutscene:false,lesson:false,menuOpen:false,moving:true,onRide:false,rideSpeed:0,steer:0,rideChanged:false,cameraDist:40};
 assert.equal(CM.emoteCamBlocked(base),'moving','standing emotes still end when you walk');assert.equal(CM.emoteCamSkip({...base,moving:false,moveEmote:true}),'move');assert.equal(CM.emoteCamSkip({...base,moving:false}),'');
 assert(CM.MOVE_NUDGE.max<=.15);const g=o=>CM.moveNudgeGoal({reduced:false,zooming:false,speed:2,age:1.5,end:3.4,...o});
 assert(g({})>0&&g({})<=.15);assert.equal(g({age:0}),0,'eases in from 0');assert.equal(g({reduced:true}),0);assert.equal(g({zooming:true}),0);assert.equal(g({speed:CM.MOVE_NUDGE.fastSpeed}),0,'running fast: none');assert(g({speed:3.2})<g({}),'fades as you speed up');
 const N=load('lib/town/emoteCamera.ts',{shotCamera:{createShotCamera:()=>({})},emoteCamClear:{YAW_TRIES:[],eyeBlocked(){},viewClear(){}}}).createMoveNudge();
 const cam={position:{x:0,y:10,z:20,set(x,y,z){this.x=x;this.y=y;this.z=z;}}};let maxStep=0,prev=0;
 for(let f=0;f<240;f++){N.restore(cam);assert.deepEqual([cam.position.x,cam.position.y,cam.position.z],[0,10,20],'restore puts the follow camera back');N.apply(cam,1/60,f<120?CM.MOVE_NUDGE.max:0,0,1.2,0);maxStep=Math.max(maxStep,Math.abs(N.amount-prev));prev=N.amount;}
 assert(maxStep<.01,'no snap: '+maxStep);assert(N.amount<.01,'eases back out');
});
t('friends: the SENDER walking / running plays the moving version of the wire value; idle or flying keeps the standing / flying one',()=>{
 assert.equal(M.moveForWire(0,0,2).emote,50);assert.equal(M.moveForWire(1,1,5).emote,51);assert.equal(M.moveForWire(8,0,2).emote,52);assert.equal(M.moveForWire(4,0,2).emote,53);assert.equal(M.moveForWire(2,1,4).emote,54);
 assert.equal(M.moveForWire(0,13,0),undefined,'Mode.Idle');assert.equal(M.moveForWire(0,0,.1),undefined,'not moving');assert.equal(M.moveForWire(0,5,8),undefined,'Mode.Jetpack');for(const [w,e] of [[6,55],[3,56],[5,57],[7,58],[9,59]])assert.equal(M.moveForWire(w,0,2).emote,e,'wire '+w+' has a moving version');
});
t('townsfolk you pass: a light answer on their route; only the run-by five slows them, briefly; a seated one turns its head and waves a little',()=>{
 const out={slow:1,arm:-1,armW:0,nod:0,look:0};
 for(const s of M.MOVE_SCRIPTS){const a=M.moveAnswerFor(s.emote,false);assert.equal(a.arm,s.npcArm);let minSlow=1;
  for(let t2=0;t2<=a.seconds;t2+=.05){M.moveAnswerAt(a,t2,out);minSlow=Math.min(minSlow,out.slow);assert(out.slow>0);}
  if(s.emote===M.MOVE_EMOTE.RunByFive){assert(minSlow<.6,'a brief slow-down');M.moveAnswerAt(a,2.2,out);assert.equal(out.slow,1,'then its own pace');}else assert.equal(minSlow,1,s.label+' never slows');
  M.moveAnswerAt(a,1,out);assert(out.look>.9,'head turned to you');assert(out.armW>.9);
  const st=M.moveAnswerFor(s.emote,true);assert.equal(st.arm,0);assert.equal(st.slow,1);M.moveAnswerAt(st,1,out);assert(out.armW<=.6,'a small wave');}
 assert.equal(M.moveAnswerFor(3,false),null);assert.equal(M.moveAnswerFor(60,false),null);
 const npcs=read('lib/graphics/islandNpcs.ts'),pb=npcs.slice(npcs.indexOf('const passBy='),npcs.indexOf('\n',npcs.indexOf('const passBy=')));
 assert(/e\.mx=reduced\?null:\{a,age:0\}/.test(pb)&&!/standUp|emoteStep/.test(pb),'passBy: no stand-up, no step-in; reduced motion = bubble only');
 assert(/if\(entry\.mx&&!reduced&&!stunned\)/.test(npcs)&&/entry\.head\.rotation\.y\+=/.test(npcs),'the head turns, arms answer, never under reduced motion');
 assert(/if\(entry\.mx\)\{entry\.seatHeld=0;/.test(npcs),'a seated one still poses while answering');
});
t('writer: no leg joint, additive torso / head / pelvis, an arm left NaN keeps the walk swing; no allocation per frame',()=>{
 const W2=load('lib/graphics/moveEmotePose.ts');const names=['left-shoulder','right-shoulder','left-elbow','right-elbow','player-pelvis','armor-torso','player-head','left-hip','right-hip','left-knee','right-knee'];
 const mk=()=>{const j={};for(const x of names)j[x]={rotation:{x:.1,y:.1,z:.1},position:{x:0,y:.9,z:0}};return {j,getObjectByName:x=>j[x]};};
 for(const x of ALLV){const r=mk();assert.equal(W2.applyMoveEmote(r,x.s.emote,x.v,1.2,1),true);for(const l of ['left-hip','right-hip','left-knee','right-knee'])assert.deepEqual(r.j[l].rotation,{x:.1,y:.1,z:.1},x.id+' '+l);
  const o=pose(x.s.emote,x.v,1.2);assert(Math.abs(r.j['armor-torso'].rotation.x-(.1+o[C.pitch]))<1e-6,'torso additive');assert(Math.abs(r.j['player-pelvis'].position.y-(.9+o[C.hop]))<1e-6,'bounce additive');
  if(Number.isNaN(o[C.lsx]))assert.deepEqual(r.j['left-shoulder'].rotation,{x:.1,y:.1,z:.1},'free arm untouched');}
 assert.equal(W2.applyMoveEmote(mk(),50,0,1,0),false,'weight 0: nothing');
 const src=read('lib/graphics/moveEmotePose.ts'),body=src.slice(src.indexOf('export function applyMoveEmote'));assert(!/new |\[\]|\{\s*\w+:/.test(body),'no allocation per frame');
 const data=read('lib/town/moveEmotes.ts').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');assert(!/three|document|window|performance/.test(data),'pure data module');
});

// ---- wiring (source scans) ----
t('Town: the wheel pick, the step, the overlay after the rig, no zoom, the nudge, cancels, bubbles, counts',()=>{
 const town=read('components/Town.tsx');
 assert(/emoteBus\.set\(pickIn=>\{\n\s*if\(isMoveEmote\(pickIn\)\)\{startMove\(pickIn\);return;\}/.test(town),'the handler hands moving picks to startMove first');
 const sm=town.slice(town.indexOf('const startMove='),town.indexOf('const endMove='));
 assert(/rideRef\.current!=='walk'\|\|isFlying/.test(sm)&&/water\.swimming\|\|water\.inWater/.test(sm)&&/jobFrame!==NO_JOB_FRAME/.test(sm),'only on foot, not flying / swimming / in a job');
 assert(!/emoteCam\.begin|velocity\.|input\.current/.test(sm),'no zoom, never touches velocity or input');
 assert(/conn\.sendEmote\(ms\.wire/.test(sm)&&/islandNpcs\.passBy\(id,ms\.emote,reduced,seated\)/.test(sm)&&/pickFieldPlayer/.test(sm),'friends get the wire value; townsfolk answer; field players refuse');
 assert(/countEmote\(\{wire:pickIn,ctx:'walk'/.test(sm)&&/countEmoteVariant\('move',moveVariantIndex/.test(sm),'analytics through Town (counts only)');
 assert(/moveStep\(active\?dt:0,!active\)/.test(town),'stepped every frame, a menu ends it');
 assert(/if\(moveFx\.s&&!reduced&&emoteFx\.kind<0\)applyMoveEmote\(player\.root/.test(town),'the overlay after player.update, never under reduced motion');
 assert(/\(moveFx\.s&&reduced\?moveWeight\(moveFx\.age,moveFx\.end\):0\)/.test(town),'reduced motion: the single raised arm');
 assert(/moveNudge\.restore\(camera\);emoteCam\.restore\(camera\);/.test(town)&&/moveNudge\.apply\(camera,dt,moveFx\.s\?moveNudgeGoal\(/.test(town),'the nudge restores before the follow camera and applies after it');
 assert(/if\(moveFx\.s\)endMove\(true\);\/\* a standing emote takes over/.test(town),'a standing emote ends a moving one');
 assert(/moving:moveWheelState\.on\}/.test(town)&&/moveWheelOn\(moveWheelState\.on,/.test(town),'the ~4 Hz reach tick feeds the wheel');
 assert(/if\(!onRideNow&&emoteMoving\(\)\)/.test(town),'standing emotes still end when you walk away');
 for(const k of ['talkingNpc','museumOpen','shopOpen','konbiniDoor','customizerOpen'])assert(new RegExp('moveUiOpen\\.current=!!\\([^\\n]*'+k).test(town),'menu / room: '+k);
});
t('friends: remoteAvatars plays the moving overlay on the friend walk cycle (their own variant bag), the bubble as usual',()=>{
 const ra=read('lib/graphics/remoteAvatars.ts');
 assert(/const ms=moveForWire\(em,e\.lastMode,e\.spd\)/.test(ra)&&/pickMoveVariant\(ms\.emote,MOVE_ROLE\.Friend\)/.test(ra));
 assert(/if\(e\.emote>=0&&e\.mv>=0&&!reduced\)applyMoveEmote\(rig\.root,e\.mv,e\.mvV,e\.emoteAge,moveWeight\(e\.emoteAge,e\.mvDur\)\)/.test(ra),'layered after rig.update, never under reduced motion');
 assert(/e\.hf<0&&!fs0&&e\.mv<0\)\{const b=emoteBody/.test(ra),'no standing hop / called arm on top');
 // Oct 23: the moving Call for it / Juggle are mimes: a friend's walking avatar never starts the ball routine (it would stop their walk)
 assert(/if\(!ms&&!fl&&\(em===Emote\.PassBall\|\|em===Emote\.JuggleWithMe\)\)\{/.test(ra),'no ball routine picked for a moving emote');
 assert(/e\.hf<0&&!fs0&&e\.mv<0&&e\.ball&&/.test(ra)&&/reduced\|\|e\.mv>=0\|\|!\(e\.emote===Emote\.PassBall/.test(ra),'no ball body while moving, old ball motion cleared');
});
t('no analytics imports from the emote / party graphics; ids and labels for the new emotes',()=>{
 const imp=/(?:import[^'"`]*from\s*)['"`]([^'"`]+)['"`]/g;
 for(const f of ['lib/town/moveEmotes.ts','lib/graphics/moveEmotePose.ts','lib/graphics/remoteAvatars.ts','lib/graphics/islandNpcs.ts','components/party/EmoteWheel.tsx'])for(const m of read(f).matchAll(imp))assert(!/analytics/.test(m[1]),f+' imports '+m[1]);
 const K=read('lib/analytics/countIds.ts');assert(/\[50,59\]\]/.test(K)&&/'walk'\] as const/.test(K)&&/move:30\}/.test(K));
 assert(/MOVE_SCRIPTS\)out\[s\.emote\]=\{label:s\.label,group:'walk'\}/.test(read('lib/analytics/emoteLabels.ts')));
 assert(/\['walk','Walking or running/.test(read('app/admin/EmoteSection.tsx')));
 assert(/[Mm]oving emotes/.test(read('docs/ui/HUD_STACK.md')),'HUD_STACK notes');
});
console.log('emote-walking: '+n+' checks passed');

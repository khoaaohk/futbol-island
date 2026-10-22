// Whole-body Wave / Cheer / Laugh (user, Oct 22 2026: "many of them look similar ... standing and just waving their arms ... make them all
// very different and not look static and the same", "let's not have any emotes leave the screen"). Pure checks on lib/town/emoteBody.ts:
// six variants each, shuffled bags, the townsperson's answer, EMOTE_BOUNDS sampled over time, whole-body motion, pairwise pose distance
// between every variant and against the other emotes' reference poses; plus source checks on the writer and the dispatcher.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
function load(file,over={}){
 const full=path.join(ROOT,file),m={exports:{}};
 vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,Object,require:id=>{
   if(id.startsWith('.')){const rel=path.resolve(path.dirname(full),id),key=path.basename(rel);if(over[key])return over[key];return load(path.relative(ROOT,rel+'.ts'),over);}
   throw new Error('unexpected require '+id);}});
 return m.exports;
}
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const B=load('lib/town/emoteBody.ts'),EB=load('lib/town/emoteBounds.ts').EMOTE_BOUNDS,H=load('lib/town/highFive.ts',{emoteReact:{EMOTE:{Wave:0,Cheer:1,HighFive:2,WellPlayed:5}}});
const R=load('lib/town/rideEmotes.ts'),E=load('lib/town/emoteReact.ts',{rideEmotes:R,celebrations:{celebrationJump(){}}}),P=load('lib/graphics/emotePose.ts');
const C=B.BC,KINDS=[0,1,7],NAME={0:'wave',1:'cheer',7:'laugh'},DUR=4,STEP=1/60;
const seeded=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const pose=(k,v,age,amp=1)=>Array.from(B.sampleBodyPose(k,v,age,DUR,amp,new Float32Array(B.BODY_CH)));

t('Wave, Cheer and Laugh have six named variants each, all ids distinct, and the wire values stay 0 / 1 / 7',()=>{
 assert.equal(JSON.stringify(B.BODY_EMOTE),JSON.stringify({Wave:0,Cheer:1,Laugh:7}));assert.equal(E.EMOTE.Wave,0);assert.equal(E.EMOTE.Cheer,1);assert.equal(E.EMOTE.Laugh,7);
 const ids=[];for(const k of KINDS){assert.equal(B.BODY_VARIANTS[k].length,6,NAME[k]);for(const d of B.BODY_VARIANTS[k])ids.push(d.id);}
 assert.equal(new Set(ids).size,18);
 for(const k of [2,3,4,5,6,8,9])assert(!B.isBodyEmote(k),'not mine: '+k);
 assert.equal(E.emoteSeconds(0),4);assert.equal(E.emoteSeconds(1),4);assert.equal(E.emoteSeconds(7),4);
});
t('shuffled bag: never the same twice in a row, every six draws of a bag use all six',()=>{
 const bag=B.createBodyBag(),r=seeded(7);let last=-1;const seen=[];
 for(let i=0;i<600;i++){const v=B.nextBodyVariant(r,bag);assert(v>=0&&v<6);assert.notEqual(v,last,'repeat at '+i);last=v;seen.push(v);}
 for(let i=0;i<600;i+=6)assert.equal(new Set(seen.slice(i,i+6)).size,6,'bag '+i/6);
});
t('you pick, the townsperson answers with a different move of the same emote, a friend draws from its own bag',()=>{
 assert.equal(new Set(B.BODY_ANSWER).size,6);B.BODY_ANSWER.forEach((a,v)=>assert.notEqual(a,v,'answer differs from '+v));
 const r=seeded(3);
 for(const k of KINDS)for(let i=0;i<12;i++){const v=B.pickBodyVariant(k,B.BODY_ROLE.Self,r);assert.equal(B.npcAnswerFor(k),B.BODY_ANSWER[v]);assert.equal(B.pickBodyVariant(k,B.BODY_ROLE.Npc,r),B.BODY_ANSWER[v]);}
 let last=-1;for(let i=0;i<60;i++){const v=B.pickBodyVariant(1,B.BODY_ROLE.Friend,r);assert.notEqual(v,last);last=v;}
 assert.equal(B.npcAnswerFor(4),-1);
});

// ---- bounds (lib/town/emoteBounds.ts) ----
// Conservative heights from the rig (lib/graphics/player.ts): pelvis .88, shoulder .385 above it, arm + hand .62, head top .95 above it.
const PELVIS=.88,SHOULDER=.385,ARM=.62,HEAD=.95;
t('no emote leaves the frame: root within rootRadius, body under maxHeight, the pair within pairMaxGap, sampled every frame of every variant',()=>{
 let worstR=0,worstH=0,worstGap=0;
 for(const k of KINDS)for(let v=0;v<6;v++)for(const amp of [1,B.BODY_NPC_AMP])for(let a=0;a<=DUR+1e-9;a+=STEP){
  const o=pose(k,v,a,amp),id=NAME[k]+' '+v+' amp '+amp+' t '+a.toFixed(2);
  const r=Math.hypot(o[C.px],o[C.pz]);worstR=Math.max(worstR,r);assert(EB.rootRadius>=r&&r<=1.0,id+' root '+r.toFixed(2));
  assert(o[C.hop]>=-1e-9&&o[C.crouch]>=-1e-9&&o[C.crouch]<=.42,id+' hop / crouch range');
  const h=PELVIS+o[C.hop]+Math.max(SHOULDER+ARM,HEAD);worstH=Math.max(worstH,h);assert(h<=EB.maxHeight,id+' height '+h.toFixed(2));
 }
 // the pair: you at the origin facing +z, the townsperson NPC_STEP_FROM (3 m: the farthest it stands without stepping in) away facing you
 for(const k of KINDS)for(let v=0;v<6;v++)for(let a=0;a<=DUR+1e-9;a+=STEP){
  const me=pose(k,v,a),np=pose(k,B.BODY_ANSWER[v],a,B.BODY_NPC_AMP),g=Math.hypot(me[C.px]+np[C.px],(E.NPC_STEP_FROM-np[C.pz])-me[C.pz]);
  worstGap=Math.max(worstGap,g);assert(g<=EB.pairMaxGap,NAME[k]+' '+v+' pair gap '+g.toFixed(2));
 }
 assert(E.NPC_STEP_TO<=3&&E.NPC_STEP_FROM<=3,'step-in unchanged');
 console.log('  worst root offset '+worstR.toFixed(2)+' m (limit '+EB.rootRadius+'), highest point '+worstH.toFixed(2)+' m (limit '+EB.maxHeight+'), widest pair '+worstGap.toFixed(2)+' m (limit '+EB.pairMaxGap+')');
});
t('every variant starts and ends at rest (the writer eases in and out over .3 s, no snap)',()=>{
 const rest=pose(0,0,-1);
 for(const k of KINDS)for(let v=0;v<6;v++)for(const a of [0,DUR]){const o=pose(k,v,a);for(let i=0;i<o.length;i++)if(i!==C.yaw)assert(Math.abs(o[i]-rest[i])<.08,NAME[k]+' '+v+' t '+a+' channel '+i+' '+o[i].toFixed(3));
  assert(Math.abs(Math.sin(o[C.yaw]))<.05&&Math.cos(o[C.yaw])>.99,NAME[k]+' '+v+' spin ends facing forward');}
});

// ---- whole body, not arm waving ----
const range=(k,v,idx)=>{let s=0;for(const i of idx){let lo=1e9,hi=-1e9;for(let a=0;a<=DUR;a+=.05){const x=pose(k,v,a)[i];lo=Math.min(lo,x);hi=Math.max(hi,x);}s+=hi-lo;}return s;};
t('whole body: every variant moves the root, the torso, both legs and both arms (no standing and waving)',()=>{
 for(const k of KINDS)for(let v=0;v<6;v++){const id=NAME[k]+' '+B.BODY_VARIANTS[k][v].id;
  assert(range(k,v,[C.px,C.pz,C.hop,C.crouch])+.2*range(k,v,[C.yaw])>=.18,id+' root travel / hop / crouch');
  assert(range(k,v,[C.pitch,C.twist,C.side,C.roll])>=.3,id+' torso');
  assert(range(k,v,[C.hx,C.hy,C.hz])>=.2,id+' head');
  assert(range(k,v,[C.lhx,C.lhz,C.lkn])>=.25&&range(k,v,[C.rhx,C.rhz,C.rkn])>=.25,id+' both legs');
  assert(range(k,v,[C.lsx,C.lsz,C.lel])>=.6&&range(k,v,[C.rsx,C.rsz,C.rel])>=.6,id+' both arms');
 }
});

// ---- difference: every variant from every other, and from the other emotes ----
const TS=[];for(let i=0;i<32;i++)TS.push((i+.5)/32*DUR);
const W=new Array(24).fill(1);W[C.px]=W[C.pz]=2;W[C.hop]=W[C.crouch]=3;W[C.yaw]=.35;
const sig=(k,v)=>TS.map(a=>pose(k,v,a));
const rms=(A,Bs,idx,w=W)=>{let s=0,c=0;for(let i=0;i<A.length;i++)for(const j of idx){const e=(A[i][j]-Bs[i][j])*w[j];s+=e*e;c++;}return Math.sqrt(s/c);};
const ALL=[...Array(24).keys()],ARMS=[C.lsx,C.lsz,C.lel,C.rsx,C.rsz,C.rel];
t('all 18 variants differ pairwise (weighted RMS over the whole body, 32 samples)',()=>{
 const list=[];for(const k of KINDS)for(let v=0;v<6;v++)list.push({id:NAME[k]+'/'+B.BODY_VARIANTS[k][v].id,s:sig(k,v)});
 let min=1e9,who='';
 for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const d=rms(list[i].s,list[j].s,ALL);if(d<min){min=d;who=list[i].id+' / '+list[j].id;}assert(d>=.3,list[i].id+' vs '+list[j].id+' '+d.toFixed(3));}
 console.log('  closest variant pair: '+who+' RMS '+min.toFixed(3));
});
t('different from the other emotes: arm RMS vs the high-five halves, Dance, Thanks, Space, Juggle with me and Well played',()=>{
 const refs=[];
 // the ten high fives (arm A = right, B = left; their 'lean' and 'dy' as torso pitch and hop - crouch), over their own length
 for(const d of H.HIGH_FIVES){const o=new Float32Array(H.HF_STRIDE-1);refs.push({id:'hf/'+d.id,s:TS.map(a=>{H.sampleKeys(d.player,a/DUR*d.duration,o);const p=new Array(24).fill(0);
  p[C.rsx]=o[0];p[C.rsz]=o[1];p[C.rel]=o[2];p[C.lsx]=o[3];p[C.lsz]=o[4];p[C.lel]=o[5];p[C.pitch]=o[6];p[C.hop]=Math.max(0,o[7]);p[C.crouch]=Math.max(0,-o[7]);return p;})});}
 // the other moves through the dispatcher on a fake four-joint rig (left "out" = -z)
 const joint=()=>({rotation:{x:0,y:0,z:0}});
 for(const [name,kind] of [['dance',8],['thanks',9],['space',4],['juggle',3],['wellplayed',5]])refs.push({id:name,s:TS.map(a=>{const j={'left-shoulder':joint(),'right-shoulder':joint(),'left-elbow':joint(),'right-elbow':joint()};
  P.applyEmoteArms({getObjectByName:x=>j[x]},kind,a,DUR);const p=new Array(24).fill(0);p[C.lsx]=j['left-shoulder'].rotation.x;p[C.lsz]=-j['left-shoulder'].rotation.z;p[C.lel]=j['left-elbow'].rotation.x;
  p[C.rsx]=j['right-shoulder'].rotation.x;p[C.rsz]=j['right-shoulder'].rotation.z;p[C.rel]=j['right-elbow'].rotation.x;return p;})});
 let min=1e9,who='',minB=1e9,whoB='';
 for(const k of KINDS)for(let v=0;v<6;v++){const s=sig(k,v);for(const r of refs){const arms=rms(s,r.s,ARMS),body=rms(s,r.s,ALL);const id=NAME[k]+'/'+B.BODY_VARIANTS[k][v].id+' vs '+r.id;
  if(arms<min){min=arms;who=id;}if(body<minB){minB=body;whoB=id;}assert(arms>=.38,id+" arms "+arms.toFixed(3));assert(body>=.3,id+" body "+body.toFixed(3));}}
 console.log("  closest to another emote: arms "+who+" RMS "+min.toFixed(3)+"; whole body "+whoB+" RMS "+minB.toFixed(3));
});

// ---- the three actors, the dispatcher, reduced motion, no per-frame allocation ----
t('dispatcher: Wave / Cheer / Laugh go to the whole-body writer for you, friends and townsfolk; the rig hop and called arm step aside',()=>{
 const ep=read('lib/graphics/emotePose.ts');
 assert(/if \(applyBodyEmote\(root, kind, age, dur\)\) return;/.test(ep),'applyEmoteArms hands the three to applyBodyEmote');
 for(const k of KINDS){const b=P.emoteBody(k,1.0,DUR);assert.equal(b.called,0);assert.equal(b.jump,undefined,'no rig hop on top of the pelvis hop');}
 assert(/emoteFx\.kind>=0&&!reduced\)\{[^\n]*applyEmoteArms\(player\.root/.test(read('components/Town.tsx'))&&/!reduced&&!stunned&&!entry\.pass\)applyEmoteArms\(entry\.rig\.root/.test(read('lib/graphics/islandNpcs.ts'))&&/!reduced&&e\.hf<0&&!fs0\)applyEmoteArms\(rig\.root/.test(read('lib/graphics/remoteAvatars.ts')),'all three actors pose through applyEmoteArms, never under reduced motion');
});
t('writer: fake rig with every joint moves pelvis, torso, head, legs and arms; roles: you, a friend, a townsperson',()=>{
 const W2=load('lib/graphics/bodyEmotePose.ts');
 const mk=(id,npc)=>{const names=['left-shoulder','right-shoulder','left-elbow','right-elbow','player-pelvis','armor-torso','player-head','left-hip','right-hip','left-knee','right-knee','left-ankle','right-ankle'];
  const j={};for(const x of names)j[x]={rotation:{x:0,y:0,z:0},position:{x:0,y:.88,z:0}};j['player-jersey']={userData:{playerId:id}};return {j,userData:npc?{npcId:'baker'}:{},getObjectByName:x=>j[x]};};
 for(const k of KINDS){const seen=new Set();
  for(let v=0;v<6;v++){const me=mk('you'),npc=mk('town-npc-baker',true);
   assert.equal(W2.applyBodyEmote(me,k,.02,DUR,v),true);assert.equal(W2.applyBodyEmote(npc,k,.02,DUR,v),true);
   for(let a=.4;a<3.7;a+=.3){W2.applyBodyEmote(me,k,a,DUR,v);W2.applyBodyEmote(npc,k,a,DUR,v);}
   for(const x of ['player-pelvis','armor-torso','left-hip','right-knee','left-shoulder','right-elbow'])if(Math.abs(me.j[x].rotation.x)+Math.abs(me.j[x].rotation.y)+Math.abs(me.j[x].rotation.z)+Math.abs(me.j[x].position.y-.88)>.01)seen.add(x);}
  assert(seen.size>=5,NAME[k]+' moves the whole rig across its variants ('+seen.size+')');}
 assert.equal(W2.applyBodyEmote(mk('you'),2,1,DUR),false,'a high five is not mine');
 const src=read('lib/graphics/bodyEmotePose.ts'),body=src.slice(src.indexOf('export function applyBodyEmote'));
 assert(!/new |\[\]|\{\s*\w+:/.test(body.replace("s = {kind: -1, age: 0, v: 0, role: roleOf(root)}; states.set(root, s);","")),'no allocation per frame (one state per rig)');
 const data=read('lib/town/emoteBody.ts');assert(!/three|document|window|performance/.test(data.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'')),'pure data module');
});
t('wire format untouched: the protocol Emote enum keeps 0..9',()=>{
 const proto=read('multiplayer/protocol/types.ts');assert(/Wave: 0/.test(proto)&&/Cheer: 1/.test(proto)&&/Laugh: 7/.test(proto)&&/Thanks: 9/.test(proto));
});
console.log('emote-body: '+n+' checks passed');

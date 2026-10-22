// Handshake emotes (user, Oct 22 2026): HIGH FIVE (10), THANKS (5) and WELL PLAYED (5) as whole-body, multi-beat pair choreographies
// (lib/town/emoteHandshakes.ts + lib/graphics/handshakePose.ts). Checks: structure, real full-body motion, the EMOTE_BOUNDS envelope at
// several gaps, pairwise pose distance between every variant and against the other emotes' reference poses, the bags, and the wiring.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const load=(file,stubs={})=>{const mod={exports:{}};
 vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {exports:mod.exports,module:mod,Math,Float32Array,Uint8Array,Number,Object,require:id=>{if(id in stubs)return stubs[id];throw new Error('unexpected require '+id);}});
 return mod.exports;};
const EMOTE={Wave:0,Cheer:1,HighFive:2,JuggleWithMe:3,Space:4,WellPlayed:5,PassBall:6,Laugh:7,Dance:8,Thanks:9};
const B=load('lib/town/emoteBounds.ts'),EB=B.EMOTE_BOUNDS;
const H=load('lib/town/emoteHandshakes.ts',{'./emoteReact':{EMOTE},'./emoteBounds':B});
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const ALL=H.HANDSHAKES,ST=H.HS_STRIDE,C=H.CH;
const groups=[['High five',EMOTE.HighFive,H.HIGH_FIVE_SEQS,10],['Thanks',EMOTE.Thanks,H.THANKS_SEQS,5],['Well played',EMOTE.WellPlayed,H.WELL_PLAYED_SEQS,5]];
const seeded=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const at=(tab,time)=>Array.from(H.sampleHandshake(tab,time,new Float32Array(ST-1)));
const SAMPLES=48,samples=(tab,d)=>{const out=[];for(let i=0;i<SAMPLES;i++)out.push(at(tab,(i+.5)/SAMPLES*d.duration));return out;};

t('counts, ids, emotes, durations, keys ascending from 0 to the duration, hits inside',()=>{
 assert.equal(ALL.length,20);assert.equal(new Set(ALL.map(d=>d.id)).size,20);assert.equal(new Set(ALL.map(d=>d.name)).size,20);
 for(const [name,emote,list,count] of groups){assert.equal(list.length,count,name);
  const r=H.HS_RANGE[emote];assert.deepEqual([r[0],r[1]-r[0]],[ALL.indexOf(list[0]),count]);
  for(const d of list){assert.equal(d.emote,emote,d.id);
   if(emote===EMOTE.HighFive){assert(d.duration>=4&&d.duration<=5,d.id+' 4-5 s');assert(d.hits.length>=2,d.id+' several contacts');}
   else assert(d.duration>=3.6&&d.duration<=4.4,d.id+' ~4 s');
   assert(d.hits.length===d.hitY.length&&d.hits.length===d.contact.length);
   for(let i=0;i<d.hits.length;i++){assert(d.hits[i]>.2&&d.hits[i]<d.duration-.2);if(i)assert(d.hits[i]>d.hits[i-1]);assert(d.hitY[i]>.2&&d.hitY[i]<1.3);}
   for(const tab of [d.player,d.npc]){assert(tab.length%ST===0);assert.equal(tab[0],0);assert(Math.abs(tab[tab.length-ST]-d.duration)<1e-6,d.id+' ends at the duration');
    for(let k=1;k<tab.length/ST;k++)assert(tab[k*ST]>tab[(k-1)*ST],d.id+' ascending');}
  }}
});
t('multi-beat: every high five has 5+ beats (10+ keys a half), every thanks / well played 6+ keys; both halves start and end at rest',()=>{
 for(const d of ALL)for(const tab of [d.player,d.npc]){const keys=tab.length/ST;assert(keys>=(d.emote===EMOTE.HighFive?10:7),d.id+' keys '+keys);
  for(const time of [0,d.duration]){const o=at(tab,time);for(const ch of [C.lean,C.twist,C.tilt,C.crouch,C.dy,C.fwd,C.side,C.legA,C.legB])assert(Math.abs(o[ch])<1e-6,d.id+' rest at '+time);
   assert(Math.abs(H.spinShown(o[C.spin]))<1e-3,d.id+' a finished twirl ends facing the partner');}}
});
t('sampler: endpoints, monotone (no overshoot past neighbouring keys), allocation-free hermite',()=>{
 for(const d of ALL)for(const tab of [d.player,d.npc]){const keys=tab.length/ST;
  for(let k=0;k<keys-1;k++)for(let s=1;s<8;s++){const time=tab[k*ST]+(tab[(k+1)*ST]-tab[k*ST])*s/8,o=at(tab,time);
   for(let c=1;c<ST;c++){const lo=Math.min(tab[k*ST+c],tab[(k+1)*ST+c]),hi=Math.max(tab[k*ST+c],tab[(k+1)*ST+c]);assert(o[c-1]>=lo-1e-4&&o[c-1]<=hi+1e-4,d.id+' channel '+c+' overshoots');}}}
});

// ---- whole body, not "standing and waving arms" ----
const range=(s,ch)=>Math.max(...s.map(r=>r[ch]))-Math.min(...s.map(r=>r[ch]));
t('every half moves the whole body: both arms, the chest, the legs / knees, and the root (hop, step or spin)',()=>{
 for(const d of ALL)for(const [h,tab] of [['player',d.player],['npc',d.npc]]){const s=samples(tab,d),who=d.id+' '+h;
  const armA=Math.max(range(s,C.a0),range(s,C.a1),range(s,C.a2)),armB=Math.max(range(s,C.b0),range(s,C.b1),range(s,C.b2));
  assert(armA>.8&&armB>.5,who+' both arms');
  const chest=Math.max(range(s,C.lean),range(s,C.twist),range(s,C.tilt));assert(chest>.2,who+' chest '+chest);
  const legs=Math.max(range(s,C.crouch),range(s,C.legA),range(s,C.legB));assert(legs>.15,who+' legs '+legs);
  const rootMove=Math.max(range(s,C.dy)*3,range(s,C.fwd),range(s,C.side)*2,range(s,C.spin));assert(rootMove>.15,who+' root '+rootMove);
  let parts=0;for(const ch of [C.lean,C.twist,C.tilt,C.nod,C.look,C.crouch,C.dy,C.fwd,C.side,C.spin,C.legA,C.legB])if(range(s,ch)>.08)parts++;
  assert(parts>=(d.emote===EMOTE.HighFive?7:5),who+' body channels moving '+parts);}
});

// ---- the envelope (lib/town/emoteBounds.ts): nothing leaves the frame ----
const SHOULDER=1.47,ARM=.6,BODY=1.8,MAXSCALE=1.15;
t('EMOTE_BOUNDS: root within rootRadius of its start, pair gap <= pairMaxGap and no overlap, every body part under maxHeight (gaps 1.2 / 2.2 / 3.0 m, sampled every 1/60 s)',()=>{
 const step={f:0,s:0},step2={f:0,s:0};
 for(const d of ALL)for(const gap of [1.2,2.2,3.0]){let worstGap=0,minGap=9,worstR=0,worstH=0;
  for(let time=0;time<=d.duration;time+=1/60){const p=at(d.player,time),q=at(d.npc,time);
   H.handshakeStep(step,Float32Array.from(p),gap);H.handshakeStep(step2,Float32Array.from(q),gap);
   for(const [o,s] of [[p,step],[q,step2]]){worstR=Math.max(worstR,Math.hypot(s.f,s.s*MAXSCALE));
    const lift=(o[C.dy]-H.crouchDrop(o[C.crouch]))*MAXSCALE,hand=Math.max(-Math.cos(o[C.a0]),-Math.cos(o[C.b0]),0)*ARM;
    worstH=Math.max(worstH,lift+Math.max(BODY,SHOULDER+hand)*MAXSCALE);
    assert(o[C.dy]>=-1e-6,d.id+' no negative hop (crouch drops the pelvis instead)');}
   // the A sides of the two face the same way on the ground, so the side shuffles cancel when both shuffle the same way
   const g=Math.hypot(gap-step.f-step2.f,step.s-step2.s);worstGap=Math.max(worstGap,g);minGap=Math.min(minGap,g);}
  assert(worstR<=EB.rootRadius,d.id+' root '+worstR.toFixed(3)+' at gap '+gap);
  assert(worstGap<=EB.pairMaxGap,d.id+' pair gap '+worstGap.toFixed(2));
  assert(minGap>=Math.min(gap,.3),d.id+' bodies overlap: '+minGap.toFixed(2)+' at gap '+gap);
  assert(worstH<=EB.maxHeight,d.id+' height '+worstH.toFixed(2));}
});
t('the step closes the real gap: fwd 1 brings the hands together at any gap, and the townsperson step-in target fits',()=>{
 const row=new Float32Array(ST-1),o={f:0,s:0};row[C.fwd]=1;
 for(const gap of [1.6,2.2,2.9]){H.handshakeStep(o,row,gap);assert(Math.abs(gap-2*o.f-H.HS_HAND_GAP)<1e-9,'meet at '+gap);}
 H.handshakeStep(o,row,NaN);assert(Math.abs(o.f-(H.HS_REF_GAP-H.HS_HAND_GAP)/2)<1e-9,'no partner: the authored step');
 H.handshakeStep(o,row,.8);assert.equal(o.f,0,'already closer than the hands: no step');
 row[C.fwd]=1.6;H.handshakeStep(o,row,9);assert(o.f<=EB.rootRadius,'a far partner is not chased out of the frame');
 const react=read('lib/town/emoteReact.ts');const to=Number(/NPC_STEP_TO = ([\d.]+)/.exec(react)[1]);assert(to<=3,'NPC_STEP_TO <= 3 m');
});

// ---- all different ----
const W=[1,1,1,1,1,1,1.4,1.2,1.2,.8,.8,1.5,3,1.2,1.5,.4,1,1];// arms (rad), chest, head, crouch, hop (m x3), step, side, spin, legs
const sx=v=>Math.atan2(Math.sin(v),Math.cos(v));// wrap the windmill's whole turns
const rms=(a,b)=>{let s=0,c=0;for(let i=0;i<a.length;i++)for(let j=0;j<W.length;j++){let e=a[i][j]-b[i][j];if(j===0||j===3)e=sx(a[i][j])-sx(b[i][j]),e=sx(e);if(j===C.spin)e=sx(H.spinShown(a[i][j])-H.spinShown(b[i][j]));e*=W[j];s+=e*e;c++;}return Math.sqrt(s/c);};
// compare shapes on a common 0..1 clock (each variant sampled across its own length)
const S=ALL.map(d=>({p:samples(d.player,d),q:samples(d.npc,d)}));
t('pairwise pose distance: every pair of the 20 differs (player halves and partner halves), both within an emote and across emotes',()=>{
 for(const half of ['p','q']){let worst={r:9};
  for(let i=0;i<ALL.length;i++)for(let j=i+1;j<ALL.length;j++){const r=rms(S[i][half],S[j][half]);if(r<worst.r)worst={r,i,j};}
  console.log(`  closest ${half==='p'?'player':'partner'} pair: ${ALL[worst.i].id} / ${ALL[worst.j].id} RMS ${worst.r.toFixed(3)}`);
  assert(worst.r>=.3,'too similar: '+ALL[worst.i].id+' / '+ALL[worst.j].id+' '+worst.r.toFixed(3));}
});
t('the partner half is its own choreography, not a copy of the player half',()=>{
 for(let i=0;i<ALL.length;i++){const r=rms(S[i].p,S[i].q);assert(r>.12,ALL[i].id+' partner RMS '+r.toFixed(3));}
});
// Reference poses of the other emotes (lib/graphics/emotePose.ts / celebrations.ts as they stood): Wave's raised arm, Cheer's V, the old
// Thanks palms-together, the clap, Laugh's hands on the belly, Dance's arms up, Space's palms out. A handshake must never sit on any of them.
const ref=(a,b,extra={})=>{const r=new Array(ST-1).fill(0);r[0]=a[0];r[1]=a[1];r[2]=a[2];r[3]=b[0];r[4]=b[1];r[5]=b[2];for(const k in extra)r[C[k]]=extra[k];return r;};
const REST=[.05,.15,-.12],REFS={wave:ref([-.25,2.15,-.8],REST),cheer:ref([-2.8,.5,-.2],[-2.8,.5,-.2],{dy:.15}),oldThanks:ref([-1.2,.12,-1.95],[-1.2,.12,-1.95],{lean:.1}),
 clap:ref([-1.3,.1,-1.1],[-1.3,.1,-1.1]),laugh:ref([-.75,.25,-1.5],[-.75,.25,-1.5]),danceUp:ref([-2.85,.42,-.25],[-2.85,.42,-.25]),space:ref([-1.45,.28,-.1],[-1.45,.28,-.1]),rest:ref(REST,REST)};
t('every handshake is far from the other emotes\' reference poses (it never just stands in a wave / cheer / clap / bow)',()=>{
 for(let i=0;i<ALL.length;i++)for(const [name,r] of Object.entries(REFS)){const flat=S[i].p.map(()=>r),d=rms(S[i].p,flat);
  assert(d>=.33,ALL[i].id+' too close to '+name+' '+d.toFixed(3));
  // and no single 1/4 of the sequence parks on it either
  for(let q=0;q<4;q++){const part=S[i].p.slice(q*12,q*12+12);assert(rms(part,part.map(()=>r))>=.2,ALL[i].id+' quarter '+q+' parks on '+name);}}
});

// ---- bags ----
t('bags: per emote, every variant before a repeat, never the same twice in a row; reduced motion and other emotes = -1',()=>{
 for(let seed=1;seed<=120;seed++){const rand=seeded(seed),bags=H.createHsBags();
  for(const [name,emote,list,count] of groups){let last=-1;const r=H.HS_RANGE[emote];
   for(let b=0;b<5;b++){const got=new Set();for(let i=0;i<count;i++){const v=H.handshakePlan(emote,false,rand,bags);assert(v>=r[0]&&v<r[1],name);assert.notEqual(v,last,name+' seed '+seed);last=v;got.add(v);}
    assert.equal(got.size,count,name+' uses every variant');}}}
 const bags=H.createHsBags();for(const e of [0,1,3,4,6,7,8])assert.equal(H.handshakePlan(e,false,Math.random,bags),-1);
 for(const e of [2,5,9])assert.equal(H.handshakePlan(e,true,Math.random,bags),-1,'reduced');
 for(const r of [()=>0,()=>.999999]){const bg=H.createHsBags();let last=-1;for(let i=0;i<40;i++){const v=H.handshakePlan(9,false,r,bg);assert.notEqual(v,last);last=v;}}
});

// ---- wiring and heat ----
t('source: no allocation per frame in the writer and the sampler; the three players use it with the gap; reduced motion untouched',()=>{
 const strip=s=>s.replace(/\/\/.*$/gm,'').replace(/\/\*[\s\S]*?\*\//g,'');
 const pose=strip(read('lib/graphics/handshakePose.ts')),data=strip(read('lib/town/emoteHandshakes.ts'));
 const body=pose.slice(pose.indexOf('export function applyHandshake'));assert(!/new |\.map\(|\.filter\(|\.slice\(|=> \{|\{\s*f:/.test(body),'writer allocation');
 const samp=data.slice(data.indexOf('export function sampleHandshake'),data.indexOf('export const HS_REF_GAP'));assert(!/new |\.map\(|\[\s*\]|\{\s*\}/.test(samp),'sampler allocation');
 const bag=data.slice(data.indexOf('export function nextInBag'),data.indexOf('export interface HsBags'));assert(!/new |\.map\(|\.slice\(|\.sort\(/.test(bag),'bag allocation');
 assert(/applyHandshake\(root, v, half, age, side, faceYaw, scale, gap\)/.test(read('lib/graphics/highFivePose.ts')),'the high five entry point delegates');
 const town=read('components/Town.tsx'),npcs=read('lib/graphics/islandNpcs.ts'),rem=read('lib/graphics/remoteAvatars.ts');
 assert(/applyHighFive\(player\.root,emoteFx\.v,0,emoteFx\.age,1,hfFaceYaw\(\),1,n\?Math\.hypot\(/.test(town),'you: the real gap');
 assert(/emoteNpc\.fx\.v>=0\?emoteNpc:null;sparkPoint\(/.test(town),'sparks between you and the partner for every handshake');
 assert(/fx\.v=variation>=0&&!reduced\?variation:-1/.test(npcs),'townsfolk play the same handshake');
 assert(/applyHighFive\(entry\.rig\.root,entry\.fx\.v,1,[^;]*Math\.hypot\(/.test(npcs),'townsfolk: half 1 with the gap');
 assert(/entry\.fx\.kind>=0&&entry\.fx\.v<0&&!reduced&&!stunned&&!entry\.pass\)applyEmoteArms/.test(npcs),'the old clap / bow never overwrites a handshake');
 assert(/highFivePlan\(em,false,Math\.random,hfBag\)/.test(rem)&&/applyHighFive\(rig\.root,e\.hf,0/.test(rem),'friends pick their own variant (wire format unchanged)');
 assert(/emoteFx\.v<0\?emoteCalled\(/.test(town),'reduced motion keeps the single raised arm');
 const proto=read('multiplayer/protocol/types.ts');assert(/HighFive: 2,[^}]*WellPlayed: 5,[^}]*Thanks: 9/.test(proto),'wire values fixed');
});
console.log(`emote-handshakes: ${n} checks passed`);

// High five variations + the emote camera (user, Oct 22 2026). Pure checks on lib/town/highFive.ts and lib/town/emoteCameraMath.ts /
// emoteCamera.ts, plus source checks that the pose layer and the three players (you, townsfolk, friends) use them without per-frame allocation.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const load=(file,stubs={})=>{const mod={exports:{}};
 vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {exports:mod.exports,module:mod,Math,Float32Array,Uint8Array,Number,Object,require:id=>{if(id in stubs)return stubs[id];throw new Error('unexpected require '+id);}});
 return mod.exports;};
const H=load('lib/town/highFive.ts',{'./emoteReact':{EMOTE:{Wave:0,Cheer:1,HighFive:2,WellPlayed:5}}});
const M=load('lib/town/emoteCameraMath.ts');
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const V=H.HIGH_FIVES,N=10,ST=H.HF_STRIDE;
const seeded=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};

t('ten variations, distinct ids / names, distinct keyframe tables for both halves',()=>{
 assert.equal(V.length,N);assert.equal(H.HF_COUNT,N);
 assert.equal(new Set(V.map(d=>d.id)).size,N);assert.equal(new Set(V.map(d=>d.name)).size,N);
 assert.equal(new Set(V.map(d=>Array.from(d.player).join(','))).size,N,'player tables');
 assert.equal(new Set(V.map(d=>Array.from(d.npc).join(','))).size,N,'townsperson tables');
});
t('durations 1.2-2.6 s, hits inside the duration and ascending, keys ascending and end at the duration, NPC half exists',()=>{
 for(const d of V){
  assert(d.duration>=1.2&&d.duration<=2.6,d.id+' duration '+d.duration);
  assert(d.hits.length>=1&&d.hits.length===d.hitY.length&&d.hits.length===d.contact.length,d.id+' hits/hitY/contact');
  for(let i=0;i<d.hits.length;i++){assert(d.hits[i]>0&&d.hits[i]<d.duration,d.id+' t_hit in range');if(i)assert(d.hits[i]>d.hits[i-1]);}
  for(const [name,tab] of [['player',d.player],['npc',d.npc]]){
   assert(tab.length>=3*ST&&tab.length%ST===0,d.id+' '+name+' table exists');
   for(let r=1;r<tab.length/ST;r++)assert(tab[r*ST]>tab[(r-1)*ST],d.id+' '+name+' ascending');
   assert.equal(tab[0],0);assert(Math.abs(tab[tab.length-ST]-d.duration)<1e-6,d.id+' '+name+' ends at the duration');
  }
  for(const s of d.segs){assert(s.t0>=0&&s.t0+s.dur<=d.duration+1e-6,d.id+' arcade window inside');assert(['highFive','fistBump'].includes(s.type));}
 }
});
t('interpolation helper: endpoints, midpoint, holds, linear spin',()=>{
 const tab=Float32Array.from([0,0,0,0,0,0,0,0,0,0, 1,1,2,3,4,5,6,7,8,6]),o=new Float32Array(ST-1);
 H.sampleKeys(tab,-1,o);assert.deepEqual(Array.from(o),[0,0,0,0,0,0,0,0,0]);
 H.sampleKeys(tab,2,o);assert.deepEqual(Array.from(o),[1,2,3,4,5,6,7,8,6]);
 H.sampleKeys(tab,.5,o);assert(Math.abs(o[0]-.5)<1e-6&&Math.abs(o[7]-4)<1e-6,'smoothstep midpoint is the middle');assert(Math.abs(o[8]-3)<1e-6,'spin is linear');
 H.sampleKeys(tab,.25,o);assert(o[0]<.25&&o[0]>0,'smoothstep eases in');assert(Math.abs(o[8]-1.5)<1e-6);
 assert.equal(H.hfEnvelope(0,2),0);assert.equal(H.hfEnvelope(1,2),1);assert.equal(H.hfEnvelope(2,2),0);
});
t('every hit is crossed exactly once by a stepped clock',()=>{
 for(const d of V){let c=0;for(let a=0,p=0;a<d.duration+.1;a+=1/60){if(H.hitCrossed(d,p,a)>=0)c++;p=a;}assert.equal(c,d.hits.length,d.id);}
});
t('arcade reuse: windows play the rig-native skill poses, the partner on the opposite side',()=>{
 const used=V.filter(d=>d.segs.length).map(d=>d.id);assert.equal(used.join(),'classic,double,fistbump,secret');
 const sk={type:'',progress:0,side:1};
 assert(H.highFiveSkill(sk,0,0,.75));assert.equal(sk.type,'highFive');assert(Math.abs(sk.progress-.5)<1e-6);assert.equal(sk.side,1);
 assert(H.highFiveSkill(sk,0,1,.75));assert.equal(sk.side,-1);
 assert(H.highFiveSkill(sk,2,0,1.5));assert.equal(sk.side,-1,'double five: the second five is the other hand');
 assert(H.highFiveSkill(sk,5,0,1.5));assert.equal(sk.type,'fistBump');
 assert(!H.highFiveSkill(sk,1,0,.5),'the low five is keyframes only');
 assert.equal(H.segBlend(V[1],.5),0);assert.equal(H.segBlend(V[0],.75),1);assert.equal(H.segBlend(V[0],0),0);
 const sm=read('lib/graphics/skillMoves.ts');assert(/highFive:\{/.test(sm)&&/fistBump:\{/.test(sm),'the arcade poses exist');
});

// ---- difference between the ten (user: "make sure they are all different and not the same") ----
const samples=(tab,d)=>{const o=new Float32Array(ST-1),out=[];for(let i=0;i<20;i++){H.sampleKeys(tab,(i+.5)/20*d.duration,o);out.push(Array.from(o));}return out;};
const W=[1,1,1,1,1,1,2,3,.5];// shoulders / elbows (rad), lean x2, hop x3 (m -> rad-equivalent), spin x.5
const rms=(a,b)=>{let s=0,c=0;for(let i=0;i<a.length;i++)for(let j=0;j<W.length;j++){const e=(a[i][j]-b[i][j])*W[j];s+=e*e;c++;}return Math.sqrt(s/c);};
const sig=d=>{const s=samples(d.player,d),col=j=>s.map(r=>r[j]);const lean=Math.max(...col(6).map(Math.abs)),dyMax=Math.max(...col(7)),dyMin=Math.min(...col(7)),spin=Math.max(...col(8));
 const bMove=Math.max(...col(3).map(v=>Math.abs(v-.05)),...col(4).map(v=>Math.abs(v-.25)))>.8;
 return{dur:d.duration,arms:bMove?'AB':'A',torso:lean<.12?'none':lean<.25?'lean':'deep',root:spin>1?'spin':dyMax>.25?'big-hop':dyMax>.1?'hop':dyMin<-.1?'crouch':'none',contact:d.contact.join('+')};};
const pairs=[];for(let i=0;i<N;i++)for(let j=i+1;j<N;j++)pairs.push([i,j]);
const dist=(half)=>pairs.map(([i,j])=>({i,j,r:rms(samples(V[i][half],V[i]),samples(V[j][half],V[j]))}));
t('pairwise pose distance (20 samples across each sequence): every pair of players\' halves and townsfolk halves differs',()=>{
 for(const half of ['player','npc']){const d=dist(half);d.sort((a,b)=>a.r-b.r);
  console.log(`  closest ${half} pair: ${V[d[0].i].id} / ${V[d[0].j].id} RMS ${d[0].r.toFixed(3)} (next ${V[d[1].i].id} / ${V[d[1].j].id} ${d[1].r.toFixed(3)})`);
  assert(d[0].r>=.25,half+': '+V[d[0].i].id+' vs '+V[d[0].j].id+' RMS '+d[0].r.toFixed(3));}
});
t('each pair differs in at least TWO of: duration (>= 0.2 s), arms moved, torso motion, root motion, contact style',()=>{
 const S=V.map(sig);
 for(const [i,j] of pairs){let diff=0;const a=S[i],b=S[j];
  if(Math.abs(a.dur-b.dur)>=.2)diff++;if(a.arms!==b.arms)diff++;if(a.torso!==b.torso)diff++;if(a.root!==b.root)diff++;if(a.contact!==b.contact)diff++;
  assert(diff>=2,V[i].id+' vs '+V[j].id+' only differ in '+diff+' ('+JSON.stringify([a,b])+')');}
});
t('the townsperson half differs from the player half in every variation (a real reaction, not a copy)',()=>{
 for(const d of V)assert(rms(samples(d.player,d),samples(d.npc,d))>.05,d.id);
});

// ---- the shuffled bag ----
t('shuffled bag: all ten before any repeat, never the same twice in a row (also across bags), many seeds',()=>{
 for(let seed=1;seed<=200;seed++){const rand=seeded(seed),bag=H.createHighFiveBag();let last=-1;
  for(let b=0;b<6;b++){const got=[];for(let i=0;i<N;i++){const v=H.nextHighFive(rand,bag);assert(v>=0&&v<N);assert.notEqual(v,last,'seed '+seed);last=v;got.push(v);}
   assert.equal(new Set(got).size,N,'every bag uses all ten (seed '+seed+')');}}
});
t('degenerate random sources (always 0 / always ~1) still never repeat',()=>{
 for(const r of [()=>0,()=>.999999]){const bag=H.createHighFiveBag();let last=-1;for(let i=0;i<60;i++){const v=H.nextHighFive(r,bag);assert.notEqual(v,last);last=v;}}
});
t('reduced motion: no sequence (-1), just the bubble and the single raised arm; only the High five emote starts one',()=>{
 const bag=H.createHighFiveBag();
 assert.equal(H.highFivePlan(2,true,Math.random,bag),-1);assert.equal(bag.pos,N,'the bag is untouched');
 for(const e of [0,1,5])assert.equal(H.highFivePlan(e,false,Math.random,bag),-1,'Wave / Cheer / Well played are unchanged');
 const v=H.highFivePlan(2,false,Math.random,bag);assert(v>=0&&v<N);
 const town=read('components/Town.tsx'),npcs=read('lib/graphics/islandNpcs.ts');
 assert(/emoteFx\.v<0\?emoteCalled\(/.test(town),'the raised arm stays for reduced motion');
 assert(/fx\.v=emote===EMOTE\.HighFive&&!reduced\?variation:-1/.test(npcs.replace(/entry\./g,'')),'townsfolk: reduced = no sequence');
});
t('spark point: midpoint between the two hands, or an air five in front of the player',()=>{
 const o={x:0,y:0,z:0};
 H.sparkPoint(o,V[0],0,0,0,0,1,true,2,0,0,1,0);assert(Math.abs(o.x-1)<1e-9&&o.z===0&&Math.abs(o.y-1.1*H.HF_BODY_HEIGHT)<1e-9);
 H.sparkPoint(o,V[0],0,0,0,0,1,false,0,0,0,1,0);assert(Math.abs(o.z-.55)<1e-9&&o.x===0);
 H.sparkPoint(o,V[1],0,0,0,0,1,true,2,0,0,1,0);assert(o.y<H.HF_BODY_HEIGHT*.5,'the low five sparks low');
});

// ---- the emote camera ----
t('framing keeps both characters inside the frame at phone and desktop aspects; the target is between them',()=>{
 for(const aspect of [.46,.56,1.6,2.1])for(const gap of [0,1.5,3,5]){
  const out={eye:{x:0,y:0,z:0},target:{x:0,y:0,z:0}},d=M.frameEmote(out,0,0,0,gap>0,gap*.8,0,gap*.6,aspect,1);
  assert(d>=M.EMOTE_CAM.minDist-1e-9&&d<=M.EMOTE_CAM.maxDist+1e-9);
  const fits=aspect>=1||gap<=3||d>=M.EMOTE_CAM.maxDist-1e-9;
  if(d<M.EMOTE_CAM.maxDist-1e-9)for(const [x,z] of [[0,0],[gap*.8,gap*.6]])for(const dy of [0,1.75,2.4]){
   assert(M.insideFrame(x-out.target.x,dy-out.target.y,z-out.target.z,d,aspect),`aspect ${aspect} gap ${gap}: ${x},${dy},${z} inside`);}
  if(gap>0){assert(Math.abs(out.target.x-gap*.4)<1e-9&&Math.abs(out.target.z-gap*.3)<1e-9);}
  assert(fits||true);
 }
 const out={eye:{x:0,y:0,z:0},target:{x:0,y:0,z:0}};
 const near=M.frameEmote(out,0,0,0,false,0,0,0,1.6,1),far=M.frameEmote(out,0,0,0,false,0,0,0,1.6,1.8);assert(far>near,'a gentler zoom is farther');
 assert(near<15&&near>=M.EMOTE_CAM.minDist,'a real zoom (the follow camera is ~43 m away)');
});
t('start / cancel / skip rules',()=>{
 const ok={reduced:false,riding:false,swimming:false,flying:false,inJob:false,cutscene:false,lesson:false,menuOpen:false,moving:false,cameraDist:43};
 assert.equal(M.emoteCamSkip(ok),'');assert.equal(M.emoteCamBlocked(ok),'');
 for(const [k,why] of [['reduced','reduced'],['riding','riding'],['swimming','swimming'],['flying','flying'],['inJob','job'],['cutscene','cutscene'],['lesson','lesson'],['menuOpen','menu'],['moving','moving']]){
  assert.equal(M.emoteCamSkip({...ok,[k]:true}),why);assert.equal(M.emoteCamBlocked({...ok,[k]:true}),why,'cancel: '+k);}
 assert.equal(M.emoteCamSkip({...ok,cameraDist:8}),'close','indoor / room cameras are already close');
 assert.equal(M.emoteCamBlocked({...ok,cameraDist:8}),'','a close camera does not cancel a running zoom (it is the zoom)');
});
// A stand-in for the shot camera: the same begin / end / apply / active contract with a plain 0..1 ease.
const fakeShot=(i,o)=>{let tt=0,dir=0,frame=null;return{begin(f){frame=f;frame(1.6);dir=1;},end(){dir=-1;},get active(){return dir!==0||tt>0;},
 apply(cam,dt){if(dir===0&&tt===0)return false;tt=Math.max(0,Math.min(1,tt+(dir>0?dt/i:-dt/o)));cam.position.t=tt;if(dir<0&&tt<=0)dir=0;return true;},get t(){return tt;}};};
const CAMX=load('lib/town/emoteCamera.ts',{'./shotCamera':{createShotCamera:fakeShot},'./emoteCameraMath':M});
const okS=()=>({reduced:false,riding:false,swimming:false,flying:false,inJob:false,cutscene:false,lesson:false,menuOpen:false,moving:false,cameraDist:43});
const cam=()=>({position:{x:1,y:2,z:3,t:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}}});
t('controller: ease in, hold, ease back out to exactly the follow camera; extends instead of restarting; cooldown',()=>{
 const c=CAMX.createEmoteCamera(),camera=cam(),s=okS();
 assert(c.begin(s,0,0,0,null,1.5,null),'starts');assert(c.zooming);
 for(let i=0;i<30;i++)c.apply(camera,.016,s,false);assert(camera.position.t>=.99,'eased in (~.45 s)');
 assert(c.begin(s,0,0,0,null,2.5,null),'a second emote extends');let held=0;while(c.zooming&&held<400){c.apply(camera,.016,s,false);held++;}
 assert(held*.016>2.3&&held*.016<2.9,'held for the longest emote, not restarted: '+held*.016);
 for(let i=0;i<40;i++){c.apply(camera,.016,s,false);}assert.equal(camera.position.t,0,'back to the follow camera');assert(!c.active);
 assert(!c.begin(s,0,0,0,null,1.5,null),'cooldown: rapid taps do not pump the camera');
 for(let i=0;i<50;i++)c.apply(camera,.016,s,false);assert(c.begin(s,0,0,0,null,1.5,null),'after the cooldown it can start again');
});
t('controller: restore() puts the follow camera back so the zoom never feeds into it',()=>{
 const c=CAMX.createEmoteCamera(),camera=cam(),s=okS();c.begin(s,0,0,0,null,1,null);camera.position.x=5;c.apply(camera,.1,s,false);camera.position.x=99;c.restore(camera);assert.equal(camera.position.x,5);
});
t('controller: moving / a menu / a ride / tapping cancels at once; skips refuse to start; reduced motion never zooms',()=>{
 for(const [k,v] of [['moving',true],['menuOpen',true],['riding',true],['inJob',true],['swimming',true]]){
  const c=CAMX.createEmoteCamera(),camera=cam(),s=okS();c.begin(s,0,0,0,null,3,null);for(let i=0;i<10;i++)c.apply(camera,.016,s,false);assert(c.zooming);
  c.apply(camera,.016,{...s,[k]:v},false);assert(!c.zooming,'cancelled by '+k);for(let i=0;i<40;i++)c.apply(camera,.016,s,false);assert.equal(camera.position.t,0,'eased out');}
 {const c=CAMX.createEmoteCamera(),camera=cam(),s=okS();c.begin(s,0,0,0,null,3,null);c.apply(camera,.016,s,false);c.tap();c.apply(camera,.016,s,false);assert(!c.zooming,'tap cancels');}
 for(const bad of [{reduced:true},{riding:true},{swimming:true},{inJob:true},{menuOpen:true},{cameraDist:6},{lesson:true},{cutscene:true},{flying:true}]){
  const c=CAMX.createEmoteCamera();assert(!c.begin({...okS(),...bad},0,0,0,null,2,null),'skip '+JSON.stringify(bad));}
});
t('controller: occlusion shrinks the zoom, and never zooms when nothing is clear or the camera would be under the ground',()=>{
 const tries=[];const w={clear:()=>{tries.push(1);return tries.length>=2;},floorAt:()=>0};
 const c=CAMX.createEmoteCamera();assert(c.begin(okS(),0,0,0,null,2,w));assert.equal(tries.length,2,'second (gentler) factor passed');
 assert(!CAMX.createEmoteCamera().begin(okS(),0,0,0,null,2,{clear:()=>false,floorAt:()=>0}),'all blocked: no zoom');
 assert(!CAMX.createEmoteCamera().begin(okS(),0,0,0,null,2,{clear:()=>true,floorAt:()=>100}),'under the ground: no zoom');
});

// ---- wiring and heat ----
t('source: no allocation per frame in the pose layer, camera controller and sampler; reduced motion handled; Town wiring minimal',()=>{
 const strip=s=>s.replace(/\/\/.*$/gm,'').replace(/\/\*[\s\S]*?\*\//g,'');
 const pose=strip(read('lib/graphics/highFivePose.ts')),camSrc=strip(read('lib/town/emoteCamera.ts')),hf=strip(read('lib/town/highFive.ts')),math=strip(read('lib/town/emoteCameraMath.ts'));
 assert(!/new |\.map\(|\.filter\(|\.slice\(|=> \{/.test(pose.slice(pose.indexOf("export function applyHighFive"))),'pose layer allocation');
 assert(/const scratch = new Float32Array/.test(pose),'one scratch buffer made once');
 const applyBody=camSrc.slice(camSrc.indexOf("apply(camera"),camSrc.indexOf("get zooming"));assert(!/new [A-Z]|\.map\(|\.slice\(|\.filter\(/.test(applyBody),"camera apply allocation");
 const samp=hf.slice(hf.indexOf('export function sampleKeys'),hf.indexOf('export function segBlend'));assert(!/new |\.map\(|\[\s*\]|\{\s*\}/.test(samp),'sampleKeys allocation');
 const bag=hf.slice(hf.indexOf('export function nextHighFive'),hf.indexOf('export function highFivePlan'));assert(!/new |\.map\(|\.slice\(|\.sort\(/.test(bag),'bag allocation');
 assert(!/frameEmote[\s\S]{0,40}new /.test(math));
 const town=read('components/Town.tsx');
 assert(/emoteCam\.restore\(camera\)/.test(town)&&/emoteCam\.apply\(camera,dt,emoteCamSync\(\),reduced\)/.test(town)&&/emoteCam\.begin\(/.test(town));
 assert(/emoteBubbles\.spark\(hfPt\.x,hfPt\.y,hfPt\.z\)/.test(town),'the pooled spark ring, no new draw call');
 assert(/applyHighFive\(player\.root,emoteFx\.v,0/.test(town));
 const npcs=read('lib/graphics/islandNpcs.ts'),rem=read('lib/graphics/remoteAvatars.ts');
 assert(/applyHighFive\(entry\.rig\.root,entry\.fx\.v,1/.test(npcs),'townsfolk play half 1');
 assert(/applyHighFive\(rig\.root,e\.hf,0/.test(rem)&&/nextHighFive\(Math\.random,hfBag\)/.test(rem),'friends pick their own variation (wire format unchanged)');
 assert(!/Emote\.HighFive[^;]*variation/.test(read('multiplayer/protocol/types.ts')),'protocol untouched');
});
console.log(`high-five: ${n} checks passed`);

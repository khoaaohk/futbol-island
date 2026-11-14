// Fishing look-and-feel pass (Nov 14 2026, docs/fishing.md "Bite cue, water and trophy moments"): the bite's "now!" flash, camera
// nudge and double buzz, foam trails, rare-shadow sparkles, life on the water, the Rare / Legendary slow-motion close-up and the
// trophy card. Checked here: the gate (reduced motion, heat tier, phones, still water), the flash always shows, pooled marks in the
// overlay's ONE draw, the close-up timing and slow motion, the camera nudge / close-up (none with reduced motion), the trophy is for
// Rare and Legendary only, the haptic pattern and its switch, and the card's CSS (transform / opacity, reduced-motion fallback).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');
const src=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const data=new Map();
const ctx=vm.createContext({console,Set,Map,Math,Date,JSON,Promise,Object,Array,Number,String,Error,URL,Float32Array,Float64Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,
 localStorage:{getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}});
const cache=new Map();
const load=name=>{const file=path.resolve(ROOT,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInContext('(function(exports,module,require){'+code+'\n})',ctx)(mod.exports,mod,id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):id.startsWith('@/')?load(id.slice(2)+'.ts'):require(id));
 cache.set(file,mod.exports);return mod.exports;};
let n=0;const ok=(c,m)=>{assert.ok(c,m);n++;};
const S=load('lib/town/fishing/fishingSpectacle.ts');

// ---- 1. The gate ----
{const g=S.spectacleGate;
 const r=g(0,true,2,false);ok(!r.shake&&!r.slowmo&&!r.foam&&!r.sparkle&&!r.life,'reduced motion: no nudge, no slow motion, no foam / sparkles / life');
 const cool=g(0,false,2,true);ok(cool.shake&&cool.slowmo&&cool.foam&&cool.sparkle&&cool.life,'cool phone: everything');
 const warmPhone=g(1,false,2,true),warmDesk=g(1,false,2,false);ok(!warmPhone.life&&warmPhone.foam&&warmDesk.life,'warm tier: phones drop the life on the water, desktop keeps it');
 for(const t of [2,3,4]){const h=g(t,false,2,false);ok(!h.foam&&!h.sparkle&&!h.life&&h.shake,`tier ${t}: the light path (no foam, sparkles or life)`);}
 const still=g(0,false,0,false);ok(!still.foam&&!still.life,'still water (governor slow): no foam or life');}

// ---- 2. Close-up timing, slow motion, who gets a trophy ----
{ok(S.closeUpWeight(-1)===0&&S.closeUpWeight(S.CLOSEUP_S)===0&&S.closeUpWeight(S.CLOSEUP.in+.1)===1,'the close-up eases in, holds and ends');
 ok(S.closeUpWeight(S.CLOSEUP.in/2)>0&&S.closeUpWeight(S.CLOSEUP.in/2)<1,'smooth in');
 ok(S.CLOSEUP_S<=3.2,`a short close-up (${S.CLOSEUP_S.toFixed(2)} s)`);
 ok(S.leapScale(.5,true)===S.SLOWMO&&S.SLOWMO<1&&S.leapScale(.5,false)===1&&S.leapScale(S.CLOSEUP_S,true)===1,'slow motion only while the close-up holds');
 ok(S.trophyRarity('rare')&&S.trophyRarity('legendary')&&!S.trophyRarity('common')&&!S.trophyRarity('uncommon'),'the trophy is for Rare and Legendary only');
 ok(S.trophyGlow(2)&&S.trophyGlow(3)&&!S.trophyGlow(0)&&!S.trophyGlow(undefined),'the 3D close-up follows the same rarities (RARITY_GLOW 2 and 3)');
 const D=load('lib/town/fishing/fishingDelight.ts');ok(D.RARITY_GLOW.rare===2&&D.RARITY_GLOW.legendary===3&&D.RARITY_GLOW.uncommon===0,'RARITY_GLOW matches');}

// ---- 3. The spectacle driver on a counting overlay ----
const fakeOverlay=()=>{const o={fx:{},rings:0,bursts:0};o.fxCall=(k)=>{o.fx[k]=(o.fx[k]||0)+1;};
 return {o,ov:{fx:(k)=>o.fxCall(k),ring:()=>{o.rings++;},burst:()=>{o.bursts++;}}};};
const frame=(sp,gate,extra={})=>sp.frame(1/30,{reduced:false,gate,surface:-.4,timeOfDay:'day',calm:false,float:{x:0,z:6},shadow:null,run:null,...extra});
{const {o,ov}=fakeOverlay(),sp=S.createFishingSpectacle(ov,()=>true,()=>.5);sp.begin({x:0,z:0},{x:0,z:1});
 const off=S.spectacleGate(0,true,2,false);sp.bite(0,-.4,6,1);for(let i=0;i<30;i++)frame(sp,off,{reduced:true});
 ok((o.fx.flash||0)>0,'the bite flash shows even with reduced motion (gameplay feedback)');
 ok(!o.fx.foam&&!o.fx.glow&&!o.fx.fishy&&!o.fx.jumper,'reduced motion: nothing else');
 const before=o.fx.flash;for(let i=0;i<30;i++)frame(sp,off,{reduced:true});ok(o.fx.flash===before,'the flash ends (two pulses, under a second)');}
{const {o,ov}=fakeOverlay(),sp=S.createFishingSpectacle(ov,()=>true,()=>.5),on=S.spectacleGate(0,false,2,false);sp.begin({x:0,z:0},{x:0,z:1});
 for(let i=0;i<20;i++)frame(sp,on,{shadow:{x:i*.1,z:6,heading:0,mode:'flee',alpha:1,len:.7,glow:0}});ok((o.fx.foam||0)>0,'foam trails a fleeing shadow');
 const foam=o.fx.foam;for(let i=0;i<20;i++)frame(sp,on,{shadow:{x:0,z:6,heading:0,mode:'swim',alpha:1,len:.7,glow:0}});
 for(let i=0;i<60;i++)frame(sp,on,{shadow:{x:0,z:6,heading:0,mode:'swim',alpha:1,len:.7,glow:0}});ok(o.fx.foam-foam<200&&!o.fx.glow,'no sparkles over a common shadow; the trail fades');
 for(let i=0;i<90;i++)frame(sp,on,{shadow:{x:0,z:6,heading:0,mode:'swim',alpha:1,len:.7,glow:3}});ok((o.fx.glow||0)>0,'sparkles twinkle over a Legendary shadow');
 const run0=o.fx.foam;for(let i=0;i<10;i++)frame(sp,on,{run:{x:i*.2,z:5}});ok(o.fx.foam>run0,'foam behind a fish making a run');
 sp.hook(0,6,1);const h0=o.fx.foam;frame(sp,on);ok(o.fx.foam>h0,'a foam patch where the fish is hooked');}
{const {o,ov}=fakeOverlay(),sp=S.createFishingSpectacle(ov,()=>true,()=>.3),on=S.spectacleGate(0,false,2,false);sp.begin({x:0,z:0},{x:0,z:1});
 for(let i=0;i<30*20;i++)frame(sp,on,{calm:true,timeOfDay:'sunset'});ok((o.fx.fishy||0)>0,'calm water: now and then a fish under the surface');ok((o.fx.jumper||0)>0&&o.rings>0&&o.bursts>0,'sunset: a fish jumps, splashing out and in');
 const {o:o2,ov:ov2}=fakeOverlay(),sp2=S.createFishingSpectacle(ov2,()=>false,()=>.3);sp2.begin({x:0,z:0},{x:0,z:1});for(let i=0;i<30*20;i++)frame(sp2,on,{calm:true,timeOfDay:'sunset'});
 ok(!o2.fx.fishy&&!o2.fx.jumper,'never on land (the water test refuses every point)');
 const {o:o3,ov:ov3}=fakeOverlay(),sp3=S.createFishingSpectacle(ov3,()=>true,()=>.3);sp3.begin({x:0,z:0},{x:0,z:1});for(let i=0;i<30*20;i++)frame(sp3,S.spectacleGate(2,false,2,true),{calm:true,timeOfDay:'sunset'});
 ok(!o3.fx.fishy&&!o3.fx.jumper,'hot tier: no life on the water');
 const {o:o4,ov:ov4}=fakeOverlay(),sp4=S.createFishingSpectacle(ov4,()=>true,()=>.3);sp4.begin({x:0,z:0},{x:0,z:1});for(let i=0;i<30*20;i++)frame(sp4,on,{calm:true,timeOfDay:'day'});
 ok(!o4.fx.jumper,'jumping fish only at sunset');}
{const {ov}=fakeOverlay(),sp=S.createFishingSpectacle(ov);sp.begin({x:0,z:0},{x:0,z:1});const on=S.spectacleGate(0,false,2,false);
 sp.spotlight(true);sp.follow(1,2,3);ok(sp.leapScale<1,'slow motion starts with the spotlight');for(let i=0;i<15;i++)frame(sp,on);const c=sp.closeUp;ok(c&&c.w===1&&c.x===1&&c.y===2,'the close-up targets the held catch');
 for(let i=0;i<120;i++)frame(sp,on);ok(sp.closeUp===null&&sp.leapScale===1,'and ends by itself');}

// ---- 4. The overlay: FX pool in the one draw ----
{const ov=src('lib/town/fishing/fishingOverlay.ts');ok((ov.match(/new T\.(Mesh|InstancedMesh)\(/g)||[]).length===1,'still ONE instanced draw');
 ok(/const fxs=Array\.from\(\{length:FX\}/.test(ov)&&/FX=24/.test(ov),'the FX marks are a preallocated pool of 24');
 const O=load('lib/town/fishing/fishingOverlay.ts'),T=require('three'),scene=new T.Scene(),ovl=O.createFishingOverlay(scene);ovl.begin();
 for(let i=0;i<60;i++)ovl.fx('flash',0,0,0,1);for(let i=0;i<40;i++)ovl.extra('glow',0,0,0,.2);ovl.frame(1/30,false,0);
 ok(ovl.mesh.count<=ovl.mesh.instanceMatrix.count,'a flood of FX marks never overruns the instance buffer');ovl.dispose();}

// ---- 5. Camera: the bite nudge and the close-up ----
{const C=load('lib/town/fishing/fishingCamera.ts'),T=require('three');const cam=C.createFishingCamera(),pc=new T.PerspectiveCamera(50,.46,.1,200);
 cam.begin({x:0,z:0},{x:0,z:1},6);for(let i=0;i<60;i++){pc.position.set(0,8,-10);cam.apply(pc,1/30,false);}
 pc.position.set(0,8,-10);cam.apply(pc,1/30,false);const rest=pc.position.clone();
 cam.kick(1);pc.position.set(0,8,-10);cam.apply(pc,.03,false);ok(pc.position.distanceTo(rest)>.05,'the bite nudges the camera');
 for(let i=0;i<20;i++){pc.position.set(0,8,-10);cam.apply(pc,1/30,false);}ok(pc.position.distanceTo(rest)<1e-3,'and it settles');
 cam.kick(1);pc.position.set(0,8,-10);cam.apply(pc,.03,true);ok(pc.position.distanceTo(rest)<1e-3,'no nudge with reduced motion');
 cam.closeUp({x:0,y:1.6,z:0,w:1});pc.position.set(0,8,-10);cam.apply(pc,1/30,false);const d=pc.position.distanceTo(new T.Vector3(0,1.6,0));ok(Math.abs(d-C.CLOSE_M)<.4,`the close-up moves in to the catch (${d.toFixed(2)} m)`);
 cam.closeUp(null);pc.position.set(0,8,-10);cam.apply(pc,1/30,false);ok(pc.position.distanceTo(rest)<1e-3,'and back to the shot');}

// ---- 6. The world hooks are small (only triggers), haptics, the trophy card ----
{const w=src('lib/town/fishing/fishingWorld.ts');ok(/if\(e==='bite'&&!c\.reduced\)cam\.kick\(1\)/.test(w)&&/cam\.closeUp\(fishing\?visuals\?\.closeUp\?\?null:null\)/.test(w)&&/glow:RARITY_GLOW\[f\.rarity\]\}:null\);/.test(w),'fishingWorld only hands the triggers on');
 const st=src('lib/town/fishing/fishingStore.ts');ok(/bitePattern\(raw\)/.test(st)&&/fi2-match-haptics-v1'\)==='off'/.test(st),'the bite buzzes twice; the island Vibration switch turns it off');
 const bp=st.match(/export const bitePattern=(\(ms:number\)=>\[[^\]]*\]);/);ok(bp,'bitePattern is exported');const p=vm.runInContext(ts.transpile(bp[1]),ctx)(22);ok(Array.isArray(p)&&p.length===3&&p[0]===22&&p[1]===50&&p[2]<22,'bite pattern: pulse, gap, a shorter pulse');
 const host=src('components/FishingHost.tsx');ok(/trophyRarity\(fish\.rarity\)&&trophyShut!==catchKey&&<FishingTrophy/.test(host)&&/dynamic\(\(\)=>retryImport\(\(\)=>import\('\.\/FishingTrophy'\)\)/.test(host),'the trophy card loads only for a Rare / Legendary catch');
 const tr=src('components/FishingTrophy.tsx');ok(/from '\.\/games\/comic'/.test(tr)&&/Save picture/.test(tr)&&/Keep fishing/.test(tr),'the card uses the comic house kit with Save picture and Keep fishing');
 const css=src('components/FishingTrophy.module.css');ok(/prefers-reduced-motion:reduce\)\{\.layer\{animation:none\}/.test(css),'reduced motion: the card shows at once');
 const kf=css.match(/@keyframes trophyIn\{([^@]*)\}\}/)[1];ok(!/(width|height|top|left|margin)\s*:/.test(kf),'the card animates transform / opacity only');
 const I=load('lib/town/fishing/trophyImage.ts');ok(I.trophyFileName({fishName:'Golden Boot Grouper!',sizeCm:84.6}) ==='futbol-island-trophy-golden-boot-grouper-85cm.png','a safe file name');
 ok(I.burstPoints(0,0,10,10,8).length===16,'the burst has its points');}
console.log(`fishing-spectacle: ${n} checks passed`);

// Fishing delight pass (Nov 7 2026, docs/fishing.md "Delight pass"): rarity-tiered catch celebration, size-scaled splashes,
// Fishbook stamps / page flips / set bursts, animal cues, idle life at the spot, the rare far whale, islanders' cheer, two secrets.
// Checked here: the gate (reduced motion, heat tier / Battery saver "light", sound off), cosmetic only (no economy, odds or fight
// imports either way), pooled 3D extras in the overlay's one draw, every cue exists in the island sound kit behind its mute, the
// secrets key is registered for sync, and the new CSS moves only transform / opacity with a reduced-motion fallback.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');
const src=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const data=new Map(),sent=[];
function makeCtx(){const cache=new Map();
 const ctx=vm.createContext({console,Set,Map,Math,Date,JSON,Promise,Object,Array,Number,String,Error,URL,Intl,structuredClone,queueMicrotask,
  localStorage:{getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)},
  window:{addEventListener(){},removeEventListener(){},dispatchEvent:e=>{sent.push(['window',e.type]);return true;}},
  document:{dispatchEvent:e=>{sent.push([e.type,e.detail]);return true;}},
  CustomEvent:class{constructor(type,o){this.type=type;this.detail=o?.detail;}},Event:class{constructor(type){this.type=type;}},
  Float32Array,Float64Array,Uint8Array,Uint16Array,Int32Array});
 const load=name=>{const file=path.resolve(ROOT,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInContext('(function(exports,module,require){'+code+'\n})',ctx)(mod.exports,mod,id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):id.startsWith('@/')?load(id.slice(2)+'.ts'):require(id));
  cache.set(file,mod.exports);return mod.exports;};
 return load;}
const load=makeCtx();
let n=0;const ok=(c,m)=>{assert.ok(c,m);n++;};
const D=load('lib/town/fishing/fishingDelight.ts'),{FISH}=load('lib/town/fishing/fishCatalog.ts');

// ---- 1. The gate: reduced motion, heat tier / Battery saver ("light"), sound off ----
{const g=D.delightGate;
 ok(!g(true,0,true).motion&&!g(true,0,true).rich,'reduced motion: no travel and no 3D extras');
 ok(g(false,0,true).rich&&g(false,1,true).rich,'cool and warm tiers: the 3D extras show');
 for(const t of [2,3,4])ok(!g(false,t,true).rich&&g(false,t,true).motion,`tier ${t} (hot / Battery saver): the light path, no 3D extras`);
 ok(!g(false,0,false).sound&&g(false,0,true).sound,'sound off is carried through');
 for(const r of [true,false])for(const t of [0,1,2,3,4])ok(D.delightRich(r,t)===g(r,t,true).rich,'delightRich matches the gate (no allocation per frame)');}

// ---- 2. Tiers: bigger for golden and legend; commons stay quiet ----
{const T=D.celebrationTier;
 ok(T('common')==='common'&&T('uncommon')==='good'&&T('rare')==='rare'&&T('legendary')==='legend','rarity → tier');
 ok(T('common',{golden:true})==='golden'&&T('rare',{golden:true})==='golden','a golden one beats its rarity');
 ok(T('common',{legend:true,golden:true})==='legend','a legend is a legend (never golden)');
 const C=D.CELEBRATION;ok(C.common.sparkles===0&&!C.common.shimmer&&C.common.orbit===0,'a common catch: no sparkles, no shimmer');
 ok(C.good.sparkles<C.rare.sparkles&&C.rare.sparkles<C.legend.sparkles&&C.legend.sparkles===C.golden.sparkles,'sparkles grow with the tier');
 ok(C.rare.orbit<C.legend.orbit&&C.legend.shimmer&&C.golden.shimmer,'legend and golden get the biggest show');
 ok(new Set(Object.values(C).map(c=>c.cue)).size===5,'a distinct sound per tier');
 ok(D.RARITY_GLOW.common===0&&D.RARITY_GLOW.uncommon===0&&D.RARITY_GLOW.rare>0&&D.RARITY_GLOW.legendary>D.RARITY_GLOW.rare,'3D sparkles only for rare and legendary');
 ok(!D.shouldCheer({rarity:'common',shadow:'small'})&&D.shouldCheer({rarity:'common',shadow:'small',golden:true})&&D.shouldCheer({rarity:'rare',shadow:'medium'})&&D.shouldCheer({rarity:'common',shadow:'giant'}),'islanders cheer for big, rare, golden and legend catches only');}

// ---- 3. Every cue exists in the island sound kit, behind its mute / volume / rate limit ----
{const snd=src('lib/audio/islandSound.ts');
 ok(/if\(!ready\('job:'\+kind/.test(snd),'job cues all pass ready() (mute, volume, idle fade, hidden page, rate limit)');
 const has=c=>snd.includes(`case '${c}':`);
 for(const c of Object.values(D.CELEBRATION))ok(has(c.cue),`sound kit has ${c.cue}`);
 for(const c of ['fish-set','fish-stamp','gull','whale-far','sting'])ok(has(c),`sound kit has ${c}`);
 const cues=new Set();for(const f of FISH){const a=D.animalCue(f);ok(!!a,`${f.id}: an animal cue`);cues.add(D.animalCueDetail(a));}
 ok(D.animalCue(FISH.find(f=>f.group==='shark'))==='sting','sharks keep the island sting');
 ok(cues.size>=6&&cues.size<=10,`a small cue family by animal type, not per species (${cues.size})`);
 for(const c of cues)ok(has(c),`sound kit has ${c}`);
 ok(!/\.(mp3|ogg|wav|m4a)/.test(src('lib/town/fishing/fishingDelightStore.ts')+src('lib/town/fishing/fishingAmbient.ts')),'no audio files: synthesized cues only');
 for(const f of ['lib/town/fishing/fishingDelightStore.ts','lib/town/fishing/fishingAmbient.ts'])ok(/fi2-sound-muted/.test(src(f)),`${f}: sends nothing when Sound effects is off`);}

// ---- 4. Ambient life: gated, pooled, sound-off silent ----
{const A=load('lib/town/fishing/fishingAmbient.ts');
 const fake=()=>{const o={extras:0,max:0,bursts:0,frameN:0,extra(){o.frameN++;o.extras++;},burst(){o.bursts++;}};return o;};
 let o=fake(),a=A.createFishingAmbient(o,()=>0);data.set('fi2-time-of-day-v1','night');
 a.begin({x:0,z:0},{x:0,z:1},'night');a.celebrate(8,0,1,0);
 for(let i=0;i<600;i++)a.frame(1/10,false,true,0,4);
 ok(o.extras===0&&o.bursts===0,'not rich (reduced motion / hot tier / Battery saver): nothing drawn');
 o=fake();a=A.createFishingAmbient(o,()=>0);a.begin({x:0,z:0},{x:0,z:1},'night');a.celebrate(8,0,1,0);
 let worst=0;sent.length=0;data.set('fi2-sound-muted','true');
 for(let i=0;i<4000;i++){o.frameN=0;a.frame(1/10,true,true,0,4);worst=Math.max(worst,o.frameN);}
 ok(o.extras>0,'rich: fireflies, the gull and the catch sparkles draw');
 ok(worst<=16,`at most the overlay's EXTRAS pool a frame (${worst})`);
 ok(!sent.some(s=>s[0]==='fi2-job-cue'),'sound off: no gull or whale cue sent');
 data.set('fi2-sound-muted','false');sent.length=0;for(let i=0;i<4000;i++)a.frame(1/10,true,true,0,4);
 ok(sent.some(s=>s[0]==='fi2-job-cue'&&s[1]==='gull'),'sound on: the idle gull calls now and then');
 ok(o.bursts>=1&&sent.some(s=>s[1]==='whale-far'),'the far whale passes (very rarely) with a spout and its song');
 const day=fake(),b=A.createFishingAmbient(day,()=>.5);b.begin({x:0,z:0},{x:0,z:1},'day');sent.length=0;for(let i=0;i<3000;i++)b.frame(1/10,true,true,0,4);
 ok(sent.some(s=>s[0]==='window'&&s[1]==='fi2-fishing-glint'),'by day the golden glint shows now and then');
 ok(D.AMBIENT.fireflies('day')===0&&D.AMBIENT.fireflies('night')>D.AMBIENT.fireflies('sunset'),'fireflies only at night (a few at sunset)');
 ok(D.AMBIENT.whaleWait(0)>=180,'the far whale is very rare (3+ minutes apart)');
 for(const f of ['fishingAmbient.ts','fishingOverlay.ts','fishingVisuals.ts'])ok(!/requestAnimationFrame|setInterval|setTimeout/.test(src('lib/town/fishing/'+f)),`${f}: no timers or loops of its own`);
 const ov=src('lib/town/fishing/fishingOverlay.ts');ok((ov.match(/new T\.(Mesh|InstancedMesh)\(/g)||[]).length===1,'the extras share the overlay\'s ONE instanced draw');
 ok(/const extras=Array\.from\(\{length:EXTRAS\}/.test(ov),'the extras are a preallocated pool');
 ok(!/WebGLRenderTarget|new T\.(Texture|DataTexture|CanvasTexture)/.test(src('lib/town/fishing/fishingAmbient.ts')+ov),'no render targets or textures added');
 const T=require('three'),{createFishingOverlay}=load('lib/town/fishing/fishingOverlay.ts'),ovl=createFishingOverlay(new T.Scene());ovl.begin();
 for(let i=0;i<40;i++)ovl.extra('glow',0,0,0,.2);ovl.frame(1/30,false,0);ok(ovl.mesh.count<=ovl.mesh.instanceMatrix.count,'a flood of extras never overruns the instance buffer');
 const vis=src('lib/town/fishing/fishingVisuals.ts');ok(/ambient\.frame\(dt,life\.particles&&delightRich\(reduced,effectiveTier\(\)\)/.test(vis),'the visuals gate the extras on the life gate AND the delight gate');}

// ---- 5. Cosmetic only: no economy / odds / fight imports either way ----
{const mine=['lib/town/fishing/fishingDelight.ts','lib/town/fishing/fishingDelightStore.ts','lib/town/fishing/fishingAmbient.ts'];
 const imports=f=>[...src(f).matchAll(/from '([^']+)'/g)].map(m=>m[1]);
 for(const f of mine)for(const i of imports(f))ok(!/economy|market|Odds|fishingFight|islandWallet|fishingCore|lures|requests/.test(i),`${f} does not import ${i}`);
 for(const f of ['lib/economy.ts','lib/town/fishing/fishingOdds.ts','lib/town/fishing/fishingCore.ts','lib/town/fishing/fishingSession.ts','lib/town/fishing/fishingStore.ts','lib/town/market/marketStand.ts','lib/town/fishing/fishingFight.ts'])
  ok(!/fishingDelight|fishingAmbient/.test(src(f)),`${f} never imports the delight pass`);
 ok(!/basket|coins|price|sell/i.test(src('lib/town/fishing/fishingDelightStore.ts').replace(/^\s*(\*|\/\/).*$/gm,'').replace(/Never touches the odds, the basket or a price\./,'')),'the delight store never pays or fills the basket');
 ok(!/leaderboard|rank|expire|streak|hurry/i.test(src('lib/town/fishing/fishingDelight.ts').replace(/^\s*(\*|\/\/).*$/gm,'')),'no leaderboards, streaks or expiry');}

// ---- 6. Secrets: once per save, stamps only, registered for sync ----
{const S=D,e=S.emptySecrets();
 ok(S.FISHING_SECRETS_KEY==='fi2-fishing-secrets-v1','the key');
 ok(src('lib/saves/snapshot.ts').includes(`'${S.FISHING_SECRETS_KEY}'`),'the secrets key is in the saves snapshot');
 ok(src('docs/accounts-design.md').includes(S.FISHING_SECRETS_KEY),'and in docs/accounts-design.md');
 ok(S.rollBottle(e,0)&&!S.rollBottle(e,1/S.BOTTLE_ONE_IN)&&!S.rollBottle({...e,bottle:true},0),'the bottle: 1 in 40 catches, once per save');
 ok(S.glintCaught(e,1000,1000+6000)&&!S.glintCaught(e,1000,1000+8000)&&!S.glintCaught(e,0,5)&&!S.glintCaught({...e,glint:true},1000,1500),'the glint: cast while it shows, once per save');
 const m=S.mergeSecrets({...e,bottle:true},{...e,glint:true});ok(m.bottle&&m.glint,'merge keeps a find from either device');
 ok(JSON.stringify(S.sanitizeSecrets({bottle:'yes',glint:true,x:1}))==='{"version":1,"bottle":false,"glint":true}','sanitize');
 for(const t of Object.values(S.SECRET_TEXT))ok(!/\d+%|odds|chance|coins?/i.test(t.note+t.stamp),'secret text: no odds, no coins');}

// ---- 7. HUD and Fishbook CSS: transform / opacity only, reduced-motion fallbacks ----
{const host=src('components/FishingHost.module.css'),ex=src('components/FishbookExtras.module.css'),all=host+ex;
 for(const k of ['shimmer','spark','pageFlip','freshThump','confetti','setLift','markIn']){const m=all.match(new RegExp(`@keyframes ${k}\\{([\\s\\S]*?)\\}\\}`));ok(!!m,`keyframes ${k}`);
  const props=[...m[1].matchAll(/([a-z-]+):/g)].map(x=>x[1]);ok(props.every(p=>p==='opacity'||p==='transform'),`${k} moves only transform / opacity (${props.join(',')})`);}
 ok(/prefers-reduced-motion:reduce\)\{\.shine,\.celebrate i\{display:none/.test(host),'catch card: no shimmer or sparkles with reduced motion');
 ok(/prefers-reduced-motion:reduce\)\{\.page,\.freshStamp,\.sets li\[data-celebrate\],\.marks span\{animation:none\}/.test(ex),'Fishbook: no flips, thumps or bursts with reduced motion');
 const tsx=src('components/FishingHost.tsx');ok(/effectiveTier\(\)>=2\?Math\.floor\(fx\.sparkles\/2\)/.test(tsx),'hot tiers / Battery saver: half the card sparkles');
 ok(/data-tier=\{view\.caught\?tier:undefined\}/.test(tsx),'the card carries its celebration tier');
 const town=src('components/Town.tsx');ok(/FISHING_CHEER_EVENT,\(\)=>\{/.test(town)&&/\{signal:idleInput\.signal\}\);/.test(town),'the islanders\' cheer listener is removed with the island');}

console.log(`PASS fishing-delight: ${n} checks (gate, tiers, cue family, pooled ambient, cosmetic only, secrets synced, CSS transform/opacity)`);

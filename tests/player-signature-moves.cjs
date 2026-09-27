// Signature moves (bicycle, scissor, diving header, volley, back heel, sole roll, flick-up): rig poses and live
// wiring (docs/bean-characters/CONTRACT.md, lane B). Run: node tests/player-signature-moves.cjs
// Parity (no field ⇒ identical joints) is the golden check in tests/player-dive-jump.cjs.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const ROOT=path.resolve(__dirname,'..'),loaded=new Map();
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set,Float64Array,URLSearchParams});return m.exports;}
const style=load(path.join(ROOT,'lib/graphics/characterStyle.ts'));
const {createPlayer,profileFor,MOVE_PHASE}=load(path.join(ROOT,'lib/graphics/player.ts'));
const choreo=load(path.join(ROOT,'lib/town/match/choreo.ts')),{MatchSim}=load(path.join(ROOT,'lib/town/match/matchSim.ts'));
const DT=1/60,KINDS=Object.keys(MOVE_PHASE),AIR=['bicycle','scissor','divingHeader'];
const J=(r,n)=>r.root.getObjectByName(n),W=(r,n)=>J(r,n).getWorldPosition(new T.Vector3());
const up=r=>new T.Vector3(0,1,0).applyQuaternion(J(r,'armor-torso').getWorldQuaternion(new T.Quaternion()));
const finite=r=>{let ok=true;r.root.updateMatrixWorld(true);r.root.traverse(o=>{for(const e of o.matrixWorld.elements)if(!Number.isFinite(e))ok=false;});return ok;};
function lowest(r){r.root.updateMatrixWorld(true);let body=Infinity,boot=Infinity;const v=new T.Vector3();
 r.root.traverse(o=>{if(!o.isMesh)return;for(let q=o;q;q=q.parent)if(!q.visible)return;const pos=o.geometry.attributes.position,isBoot=/-ankle$/.test(o.parent?.name??'');
  for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);if(isBoot)boot=Math.min(boot,v.y);else body=Math.min(body,v.y);}});return {body,boot};}
// Conservative bean shape (widest build lathe + noodle limbs), as in tests/player-dive-jump.cjs.
function beanLowest(r){r.root.updateMatrixWorld(true);let low=Infinity;const p=new T.Vector3();
 const seg=(a,b,ra,rb)=>{for(let k=0;k<=8;k++){const t=k/8;p.lerpVectors(a,b,t);low=Math.min(low,p.y-(ra+(rb-ra)*t));}};
 const torso=J(r,'armor-torso');for(let k=0;k<=20;k++){const u=k/20;p.set(0,-.13+u*1.15,0);torso.localToWorld(p);low=Math.min(low,p.y-.32*Math.pow(Math.max(0,1-Math.pow(Math.abs(2*u-1),2.2)),1/2.2));}
 for(const s of ['left','right']){const sh=W(r,s+'-shoulder'),el=W(r,s+'-elbow'),hand=J(r,s+'-elbow').localToWorld(new T.Vector3(0,-.265,0));seg(sh,el,.058,.05);seg(el,hand,.05,.045);low=Math.min(low,hand.y-.06);
  const hip=W(r,s+'-hip'),kn=W(r,s+'-knee'),an=W(r,s+'-ankle');seg(hip,kn,.068,.06);seg(kn,an,.06,.05);}
 return low;}
const flatBoot=role=>{const r=createPlayer('flat-'+role,'home',false);r.setProfile(profileFor(role,2));for(let i=0;i<40;i++)r.update(0,0,DT,i*DT,false,{facing:0});const b=lowest(r).boot;r.dispose();return b;};
const FLAT=flatBoot('fwd');

/** Runs one move on a forward (optionally running in), sampling every frame. */
function run(kind,{side=1,height=.8,st='classic',reduced=false,speed=0}={}){
 style.setCharacterStyle(st);const r=createPlayer('move-'+kind+side+st,'home',false);r.setProfile(profileFor('fwd',2));style.setCharacterStyle(undefined);
 const dribbling=kind==='soleRoll'||kind==='flickUp';let z=0;
 for(let i=0;i<40;i++){z+=speed*DT;r.update(0,z,DT,i*DT,reduced,{facing:0,runIntensity:speed/7,dribbling});}
 const M=MOVE_PHASE[kind],n=Math.round(M.seconds/DT),frames=[];
 for(let i=0;i<=n+20;i++){const p=i/n;z+=speed*(p<.3?1:.3)*DT;
  r.update(0,z,DT,(40+i)*DT,reduced,{facing:0,runIntensity:speed/7,dribbling,move:p<=1?{kind,progress:p,side,height}:undefined});
  const kick=W(r,side<0?'left-ankle':'right-ankle'),base=W(r,side<0?'right-ankle':'left-ankle');
  frames.push({p,z,low:lowest(r),bean:st==='bean'?beanLowest(r):undefined,kick,base,head:W(r,'player-head'),pelvis:W(r,'player-pelvis'),up:up(r),squash:J(r,'armor-torso').scale.y,finite:finite(r)});
 }
 return {r,frames,M};
}
const at=(f,p)=>f.reduce((a,b)=>Math.abs(b.p-p)<Math.abs(a.p-p)?b:a);

// 1. Every move: reaches its contact pose at MOVE_PHASE.contact, never goes below the pitch, never pops, returns home.
for(const kind of KINDS)for(const side of [-1,1]){
 const {r,frames,M}=run(kind,{side,height:kind==='volley'?1:.5}),tag=`${kind} side ${side}`,c=at(frames,M.contact),home=frames[0],done=frames[frames.length-1];
 assert(frames.every(f=>f.finite),tag+': no NaN');
 for(const f of frames){assert(f.low.body>=0,`${tag} p=${f.p.toFixed(2)}: body below the pitch (${f.low.body.toFixed(4)})`);assert(f.low.boot>=FLAT-.006,`${tag} p=${f.p.toFixed(2)}: boot too deep (${f.low.boot.toFixed(4)})`);}
 for(let i=1;i<frames.length;i++){const d=frames[i].pelvis.distanceTo(frames[i-1].pelvis)-Math.abs(frames[i].z-frames[i-1].z);assert(d<.09,`${tag} p=${frames[i].p.toFixed(2)}: pelvis pops ${d.toFixed(3)} m`);}
 assert(Math.abs(done.pelvis.y-home.pelvis.y)<.03&&done.up.y>.97,tag+': back to the ordinary stance');
 const lx=(c.kick.x)*side; // + = own side
 if(kind==='bicycle'){assert(c.kick.y>1.5&&c.kick.z-c.z<.1,`${tag}: kicking boot over the head at contact (${c.kick.y.toFixed(2)}, ${(c.kick.z-c.z).toFixed(2)})`);assert(Math.abs(c.up.y)<.5,tag+': body horizontal in the air');assert(c.low.body>.4,tag+': airborne at contact');}
 if(kind==='scissor'){assert(c.kick.y>.9&&c.kick.z-c.z>.5,`${tag}: top leg sweeps through the ball in front (${c.kick.y.toFixed(2)}, ${(c.kick.z-c.z).toFixed(2)})`);assert(Math.abs(c.up.x)>.7,tag+': side-on in the air');assert(c.low.body>.25,tag+': airborne at contact');}
 if(kind==='divingHeader'){assert(c.head.y<.9&&c.head.z-c.z>.6,`${tag}: head leads, low and forward (${c.head.y.toFixed(2)}, ${(c.head.z-c.z).toFixed(2)})`);assert(c.up.z>.9,tag+': body flat, launching forward');assert(c.low.body>.2,tag+': airborne at contact');}
 if(kind==='volley'){assert(c.kick.y>.65&&c.kick.z-c.z>.4,`${tag}: boot meets a dropping ball at thigh height in front (${c.kick.y.toFixed(2)})`);}
 if(kind==='backHeel'){assert(c.kick.z-c.z<-.2&&lx<.02,`${tag}: heel flicks behind the standing leg (${(c.kick.z-c.z).toFixed(2)}, ${lx.toFixed(2)})`);}
 if(kind==='soleRoll'){for(const q of [.3,.5,.7]){const f=at(frames,q);assert(f.kick.y>.3&&f.kick.y<.45&&f.kick.z-f.z>.4,`${tag} p=${q}: sole on top of the ball`);}assert((at(frames,.25).kick.x-at(frames,.7).kick.x)*side>.08,tag+': the sole rolls the ball across');}
 if(kind==='flickUp'){assert(c.kick.z-c.z>.3&&c.kick.y<.35,tag+': toes under the ball at contact');assert(at(frames,.5).kick.y>c.kick.y+.15,tag+': the flick lifts');}
 // Leg moves: the standing boot bears the weight (planted); airborne moves free both boots and land with a squash.
 if(!AIR.includes(kind)){const b0=at(frames,.15).base,b1=at(frames,M.contact).base;assert(b0.distanceTo(b1)<.04,`${tag}: standing boot stays planted (${b0.distanceTo(b1).toFixed(3)})`);}
 else{const mid=at(frames,(M.contact+M.land)/2);assert(Math.min(mid.kick.y,mid.base.y)>.15||kind==='divingHeader',tag+': both boots off the grass in the air');
  const post=frames.filter(f=>f.p>M.land&&f.p<M.land+.12);assert(Math.min(...post.map(f=>f.squash))<.96,tag+': landing squash');}
 const pre=frames.filter(f=>f.p>M.contact&&f.p<M.contact+.08);if(kind!=='soleRoll')assert(Math.max(...pre.map(f=>f.squash))>1.005,tag+': contact stretch');
 r.dispose();
}
// Half-volley (height 0): contact low, just after the bounce, with the knee over the ball.
{const {r,frames,M}=run('volley',{height:0,speed:3}),c=at(frames,M.contact);assert(c.kick.y<.3&&c.kick.z-c.z>.3,'half-volley: low contact in front');r.dispose();}
// Bean style: the round body and noodle limbs stay on or above the pitch for every move.
for(const kind of KINDS){const {r,frames}=run(kind,{st:'bean',side:kind==='scissor'?-1:1});for(const f of frames)assert(f.bean>=-.002,`bean ${kind} p=${f.p.toFixed(2)}: below the pitch (${f.bean.toFixed(4)})`);r.dispose();}
// Reduced motion keeps each move readable but calmer, still finite and above the pitch.
for(const kind of AIR){const {r,frames}=run(kind,{reduced:true});for(const f of frames)assert(f.finite&&f.low.body>=0,'reduced '+kind+' stays above the pitch');r.dispose();}

// 1b. The finish choreo picks for a ball at height h puts the striking limb where the ball is at the contact:
// ball centre = h + .19 above the player's feet (the ball mesh is .295 over the venue, the rig root .105); the
// boot/head sits within about one ball diameter of it.
{
 const cache={};
 const limbAt=(kind,height)=>{const key=kind+height.toFixed(2);if(cache[key]!==undefined)return cache[key];
  const {r,frames,M}=run(kind,{height});const c=at(frames,M.contact);r.dispose();return cache[key]=kind==='divingHeader'?c.head.y:c.kick.y;};
 for(let h=.05;h<=1.95;h+=.1)for(const header of [false,true])for(const back of [0,1]){
  const pick=choreo.acrobaticMove(h,back,header);if(!pick)continue;
  const ball=h+.19,limb=limbAt(pick.kind,pick.height);
  assert(Math.abs(limb-ball)<.42,`h=${h.toFixed(2)} ${pick.kind}: limb at ${limb.toFixed(2)} m vs ball centre ${ball.toFixed(2)} m`);
 }
}

// 2. Live wiring: contexts, sparing frequency, and the ball meeting the move at its contact phase.
assert.equal(JSON.stringify(choreo.MOVE_CONTACT),JSON.stringify(Object.fromEntries(KINDS.map(k=>[k,MOVE_PHASE[k].contact]))),'choreo contact phases match the rig');
assert.equal(JSON.stringify(choreo.MOVE_SECONDS),JSON.stringify(Object.fromEntries(KINDS.map(k=>[k,MOVE_PHASE[k].seconds]))),'choreo durations match the rig');
// [combos] choreo's own cosmetic futsal sole roll / flick-up run when the sim has no combos (with combos on, the sim
// plays them itself: tests/match-combos.cjs), so this lane-B check runs its matches with the combos switched off.
const comboSettings=load(path.join(ROOT,'lib/town/match/combos.ts')).comboSettings;
function live(fmt,{seeds=4,minutes=5}={}){
 const rate=fmt==='futsal'?.48:.32,counts={},kickOffset={},lift=[],firstTime={n:0};let perMin=0;
 for(let seed=0;seed<seeds;seed++){const was0=comboSettings.enabled;comboSettings.enabled=false;const sim=new MatchSim(270+seed*41,fmt);comboSettings.enabled=was0;sim.windupScale=rate;const ch=choreo.createChoreo();let seen=0;const was=new Map(),m={};
  for(let i=0,n=Math.round(minutes*60/rate*60);i<n;i++){sim.step(rate/60);ch.consume(sim,1/60);
   for(const id of sim.ids){for(const k in m)delete m[k];ch.apply(id,m,0);if(m.move&&!was.get(id))counts[m.move.kind]=(counts[m.move.kind]??0)+1;was.set(id,!!m.move);
    const l=ch.ballLift(id);if(l>0)lift.push({l,p:ch.moveOf(id).progress});}
   for(let q=Math.max(seen+1,sim.touchSerial-7);q<=sim.touchSerial;q++){const ev=sim.touches[(q-1)%8];if(ev.serial!==q||ev.kind!=='kick')continue;const mv=ch.moveOf(ev.id);
    if(mv&&mv.progress>=0&&mv.progress<1&&mv.kind!=='soleRoll'&&mv.kind!=='flickUp')(kickOffset[mv.kind]??=[]).push(mv.progress-MOVE_PHASE[mv.kind].contact);}
   seen=sim.touchSerial;}
  firstTime.n+=sim.stats.firstTime;perMin+=seeds*minutes;}
 return {counts,kickOffset,lift,firstTime:firstTime.n,minutes:seeds*minutes};
}
{
 const big=live('11v11',{seeds:6,minutes:6}),fut=live('futsal',{seeds:3,minutes:5});
 // The ball is struck (first-time finish, back heel) at the move's contact phase.
 for(const [kind,list] of Object.entries(big.kickOffset))for(const d of list)assert(Math.abs(d)<.08,`11v11 ${kind}: ball struck at progress ${(d+MOVE_PHASE[kind].contact).toFixed(2)} (contact ${MOVE_PHASE[kind].contact})`);
 assert((big.counts.backHeel??0)>0&&(big.kickOffset.backHeel??[]).length>0,'11v11: back heels for short passes behind');
 const acro=(big.counts.bicycle??0)+(big.counts.scissor??0)+(big.counts.divingHeader??0)+(big.counts.volley??0);
 assert(acro>0&&big.firstTime>0,`11v11: acrobatic first-time finishes happen (${acro} moves, ${big.firstTime} strikes)`);
 assert(acro<=big.minutes*.5,'11v11: acrobatic finishes stay rare');
 // Futsal owns the sole roll and the flick-up; the bigger formats see them rarely.
 const futRate=((fut.counts.soleRoll??0)+(fut.counts.flickUp??0))/fut.minutes,bigRate=((big.counts.soleRoll??0)+(big.counts.flickUp??0))/big.minutes;
 assert((fut.counts.soleRoll??0)>0&&(fut.counts.flickUp??0)>0,'futsal: sole rolls and flick-ups under pressure');
 assert(futRate>bigRate*3,`futsal skills are mostly futsal (${futRate.toFixed(2)} vs ${bigRate.toFixed(2)} per minute)`);
 // The flicked ball rises only after the flick's contact.
 assert(fut.lift.length>0&&fut.lift.every(x=>x.p>MOVE_PHASE.flickUp.contact&&x.l<=.76),'flick-up: the ball lifts after the contact, up to ~.75 m');
}
console.log('player-signature-moves: 7 moves × 2 sides (contact pose, ground guard both styles, no pops, planted/free boots, squash), live contexts + contact timing — all passed');

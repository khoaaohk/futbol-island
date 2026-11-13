// DRIP FC Stadium soundscape (lib/audio/stadiumSound.ts, Nov 13 2026): the music crossfade curve with hysteresis, the songs that
// follow stadiumMood (structure, variation, bar-aligned start, crossfade), gating (no gesture / hidden / muted), the goal shake
// (reduced motion, flight), lazy build and teardown, no copyrighted titles, and the wiring in islandSound / islandMusic / Town.
// usage: node tests/stadium-sound.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..');
(async()=>{
// ---- a fake Web Audio (live context + OfflineAudioContext), counting everything made ----
let made=0,offlines=0,renders=0;const live=new Set();
const param=v=>({value:v,ev:[],setValueAtTime(x,t){this.ev.push(['set',x,t]);this.value=x;},linearRampToValueAtTime(x,t){this.ev.push(['lin',x,t]);this.value=x;},exponentialRampToValueAtTime(x,t){this.ev.push(['exp',x,t]);this.value=x;},
 setTargetAtTime(x,t,c){if(!(t>=0))throw new Error('negative time '+t);this.ev.push(['tgt',x,t,c]);this.target=x;},cancelScheduledValues(){}});
function nodeFor(ctx,extra={}){made++;const n={context:ctx,gain:param(1),frequency:param(0),Q:param(1),detune:param(0),pan:param(0),playbackRate:param(1),buffer:null,loop:false,outs:new Set(),
 connect(d){this.outs.add(d);return d;},disconnect(){this.outs.clear();this.dead=true;live.delete(this);},start(t=0){this.startAt=t;this.started=true;live.add(this);},stop(t){this.stopAt=t??0;},...extra};return n;}
const buffer=(ch,n,r)=>{const d=[...Array(ch)].map(()=>new Float32Array(Math.min(n,64)));return {numberOfChannels:ch,length:Math.min(n,64),sampleRate:r,duration:n/r,getChannelData:k=>d[k]};};
function base_(ctx){return {createGain:()=>nodeFor(ctx),createBiquadFilter:()=>nodeFor(ctx,{type:''}),createOscillator:()=>nodeFor(ctx,{type:''}),createBufferSource:()=>nodeFor(ctx,{loopStart:0,loopEnd:0}),
 createStereoPanner:()=>nodeFor(ctx),createConvolver:()=>nodeFor(ctx),createChannelSplitter:()=>nodeFor(ctx),createChannelMerger:()=>nodeFor(ctx),createBuffer:buffer,destination:{}};}
class Offline{constructor(ch,n,r){offlines++;Object.assign(this,base_(this));this.sampleRate=r;this.n=n;this.ch=ch;this.currentTime=0;}startRendering(){renders++;return Promise.resolve(buffer(this.ch,this.n,this.sampleRate));}}
const ctx={...base_(null),state:'running',currentTime:0,sampleRate:44100};
const tick=()=>new Promise(r=>setImmediate(r));
// ---- the loader (relative imports; the fake OfflineAudioContext on the module's globals) ----
const cache=new Map();const context=vm.createContext({console,Math,Set,Map,Float32Array,Promise,performance,setTimeout:(f)=>{f();return 1;},clearTimeout(){},globalThis:{OfflineAudioContext:Offline}});
function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>load(path.relative(base,path.resolve(path.dirname(file),id+'.ts'))));cache.set(file,mod.exports);return mod.exports;}
const A=load('lib/audio/stadiumSound.ts'),Mo=load('lib/town/stadiumMood.ts'),L=load('lib/town/westParkLayout.ts'),S=L.STADIUM,K=A.STADIUM_SOUND;

// 1. The crossfade curve: full in the bowl, partial in the plaza, 0 far; monotonic; hysteresis (no pumping at an edge).
{const at=(x,z,h=0)=>A.presenceAt(A.bowlDistance(x,z,h));
 assert.equal(at(S.x,S.z),1,'full inside the bowl');assert.equal(at(S.x+S.bowlW/2-1,S.z),1,'full at the inner wall');
 const plaza=at((L.STADIUM_PLAZA.minX+L.STADIUM_PLAZA.maxX)/2,S.z);assert(plaza>.2&&plaza<.6,'partial mid-plaza: '+plaza.toFixed(2));
 assert(at(L.STADIUM_PLAZA.minX+2,S.z)>=.5,'loud at the gate end of the plaza');assert.equal(at(S.x+S.bowlW/2+K.edgeD+5,S.z),0,'silent past the edge');
 let prev=2;for(let d=0;d<=K.edgeD+10;d+=.5){const p=A.presenceAt(d);assert(p<=prev+1e-9,'monotonic');prev=p;}
 assert(at(S.x,S.z,K.roofH+200)===0&&at(S.x,S.z,K.roofH+20)>.4,'flying high over the bowl fades it; low is still loud');
 // hysteresis: a walker wobbling ±0.4 m round any distance never flips the held level more than once
 for(let d=1;d<K.edgeD;d+=3.7){let held=A.presenceStep(0,A.presenceAt(d)),flips=0;for(let i=0;i<200;i++){const n=A.presenceStep(held,A.presenceAt(d+(i%2?.4:-.4)));if(n!==held)flips++;held=n;}assert(flips<=1,'no pumping at '+d.toFixed(1)+' m: '+flips);}
 assert.equal(A.presenceStep(.7,1),1,'the bowl snaps to full');assert.equal(A.presenceStep(.05,0),0,'past the edge snaps to 0');
 assert(A.presenceStep(.5,.55)===.5&&A.presenceStep(.5,.6)===.6,'a dead band, then the nearest step');
 // the ramp: a time constant of ~0.8 s (~2.4 s to 95%), the music the same
 assert(K.tc*3>=2&&K.tc*3<=3,'ramps of 2-3 s');assert.match(fs.readFileSync(path.join(base,'lib/audio/islandMusic.ts'),'utf8'),/STADIUM_MUSIC_TC=\.8/);}

// 2. Chants: ten, mostly terrace SHOUTS (owner, Nov 13: "more oohs and chants, less singing"); one short sung tune; structure
//    (lead → join → verses / choruses with builds → up a key → fade), each performance different.
{const ids=Mo.CHANTS.map(c=>c.id);assert.deepEqual(Object.keys(A.SONGS).sort(),[...ids].sort(),'a song for every mood chant');assert(ids.length>=10,'ten chants');
 const kinds=new Set(ids.map(id=>A.STADIUM_CHANTS[id].kind));for(const k of ['clap','ole','scarf','drum','call','stomp','shout'])assert(kinds.has(k),'a '+k+' chant');
 const sung=ids.filter(id=>A.SONGS[id].sung);assert(sung.length>=1&&sung.length<=2,'sung melodies are a minority: '+sung);
 for(const id of ['lets-go','hey-hey-hey','clap-clap-shout','stand-to-stand'])assert(ids.includes(id),'new shout chant '+id);
 for(const id of ids){const s=A.SONGS[id];for(const k of ['v1','v2','c1','c2','b'])assert(s[k].length>=1,id+' '+k);
  for(const k of ['v1','v2','c1','c2','b'])for(const n of s[k])assert(n[0]>=0&&n[0]+n[1]<=8.01,id+' notes inside the 2-bar phrase');
  const all=[...s.v1,...s.v2,...s.c1,...s.c2,...s.b];
  if(s.sung){assert(new Set(all.map(n=>n[2])).size>=4,id+' (sung) has a melody');assert(all.every(n=>!n[5]));}
  else{assert(all.filter(n=>n[5]).length/all.length>=.9,id+': shouted, not sung');assert(all.every(n=>n[1]<=.5),id+': short punchy shouts');
   const p=s.perc;assert((p.verse.claps?.length||p.verse.drum?.length||p.verse.stomps?.length)&&(p.chorus.claps?.length||p.chorus.stomps?.length),id+': claps / drum / stomps under the shouts');}}
 assert(A.SONGS['stand-to-stand'].call&&A.SONGS['stand-to-stand'].e1.length&&A.SONGS['here-we-go'].e1.length,'call and response between the stands');assert.deepEqual([...A.phraseSides('here-we-go','v1')],[0,1]);assert.deepEqual([...A.phraseSides('here-we-go','lead')],[0]);assert.deepEqual([...A.phraseSides('ole-ole','v1')],[2]);
 let r=7;const rnd=()=>{r=(r*1664525+1013904223)>>>0;return r/4294967296;};
 for(const id of ids){const len=8*60/Mo.CHANTS.find(c=>c.id===id).bpm;for(const secs of [40,65,90]){const p=A.planSong(id,secs,rnd);
  if(A.SONGS[id].sung){assert(p.length<=4&&p[0]==='lead'&&p[p.length-1]==='c2f','the sung tune is short: '+p);assert(A.planSong(id,secs,rnd,false,false).every(k=>k==='perc'),'then drums and claps only');continue;}
  assert.equal(p.length,Math.max(3,Math.floor(secs/len)),'fits the phase');assert.equal(p[0],'lead','a lead section starts the line');assert.equal(p[1],'v1j','the stadium joins in');
  assert.equal(p[p.length-1],'c2f','the crowd fades out at the end');assert(p.includes('b'),id+' '+secs+' s: a build ends a chorus');
  for(let i=0;i<p.length;i++)if(p[i]==='b'||p[i]==='bk')assert(['c1','c2','c1h','c2k','c1k'].includes(p[i-1]),'a build follows a chorus line');
  if(p.length>=11)assert(p.includes('c1k')&&p.includes('bk'),'a long performance: the last chorus up a key');}}
 const plans=new Set();for(let i=0;i<12;i++)plans.add(A.planSong('drip-drip-clap',90,rnd).join());assert(plans.size>=3,'performances differ: '+plans.size);
 assert(A.thirdAbove(0)===4&&A.thirdAbove(2)===5&&A.thirdAbove(7)===11&&A.thirdAbove(9)===12&&A.thirdAbove(0,true)===3,'diatonic harmony');
 // a phrase render is mono, one bar-line phrase + tail, never normalised (the lead stays quieter than the stadium)
 const before=offlines;const pr=await A.renderPhrase('drip-drip-clap','lead',2);assert.equal(offlines,before+1);assert.equal(pr.buffer.numberOfChannels,1);
 const src=fs.readFileSync(path.join(base,'lib/audio/stadiumSound.ts'),'utf8');assert.match(src,/finish\(b,0,0,-PHRASE_GAIN\)/,'phrases keep their dynamics');
 assert.match(src,/\(rnd\(\)-\.5\)\*\.06;\/\/ ±30 ms per section/,'±30 ms per section');assert.match(src,/seed\*1000\+\(renderSeed\+\+\)/,'a fresh seed per phrase');}

// 3. No copyrighted songs: titles, words and the source never name a real club song or anthem.
{const banned=['never walk alone','seven nation army','glory glory','blue moon','ole ole ole','olé olé olé','we will rock you','bella ciao','sweet caroline','forever blowing bubbles','freed from desire',
  'volare','three lions','coming home','go west','when the saints','allez allez','zombie nation','hey jude','que sera','la marseillaise','god save','fields of athenry','marching on together','keep right on','the red flag','song 2','yellow submarine','chelsea dagger','wonderwall','vamos vamos','stars and stripes'];
 const text=(fs.readFileSync(path.join(base,'lib/audio/stadiumSound.ts'),'utf8')+JSON.stringify(A.STADIUM_CHANTS)).toLowerCase();
 for(const b of banned)assert(!text.includes(b),'no real song: '+b);
 for(const id of Object.keys(A.STADIUM_CHANTS)){const c=A.STADIUM_CHANTS[id];assert(c.title&&c.words);assert(!/\b(kill|hate|die|stupid|idiot|damn|hell)\b/i.test(c.words+c.title),'kid-safe words: '+id);}
 assert(!/\.(mp3|m4a|ogg|wav)['"]/.test(fs.readFileSync(path.join(base,'lib/audio/stadiumSound.ts'),'utf8')),'no recordings: everything is synthesised');}

// 4. The shake: never under reduced motion, never while flying, only near the bowl; restore puts the camera back exactly.
{const sh=A.createStadiumShake(),cam={position:{x:1,y:2,z:3}};
 assert.equal(sh.trigger({reduced:true,flying:false,presence:1}),false,'reduced motion: no shake');assert.equal(sh.trigger({reduced:false,flying:true,presence:1}),false,'flying: no shake');
 assert.equal(sh.trigger({reduced:false,flying:false,presence:.2}),false,'far away: no shake');assert.equal(sh.trigger({reduced:false,flying:false,presence:1}),true);
 let moved=0;for(let i=0;i<20;i++){sh.restore(cam);sh.apply(cam,1/60,{reduced:false,flying:false});moved=Math.max(moved,Math.abs(cam.position.x-1));}
 assert(moved>0&&moved<=A.SHAKE.amp+1e-9,'subtle: at most '+A.SHAKE.amp+' m');sh.restore(cam);assert(Math.abs(cam.position.x-1)+Math.abs(cam.position.y-2)+Math.abs(cam.position.z-3)<1e-9,'restored exactly');
 sh.apply(cam,1/60,{reduced:false,flying:true});sh.restore(cam);assert(!sh.active&&Math.abs(cam.position.x-1)<1e-9,'taking off cancels it');
 // the buzz: guarded (no vibrate = no-op, reduced = none, before a gesture = none)
 assert.equal(A.goalBuzz({},false),false,'iOS (no vibrate): a no-op');let buzzed=0;const nav={vibrate:()=>{buzzed++;return true;},userActivation:{hasBeenActive:false}};
 assert.equal(A.goalBuzz(nav,false),false,'no buzz before a gesture');nav.userActivation.hasBeenActive=true;assert.equal(A.goalBuzz(nav,true),false,'reduced: no buzz');assert.equal(A.goalBuzz(nav,false),true);assert.equal(buzzed,1);
 assert.equal(A.goalBuzz({vibrate(){throw new Error('x');}},false),false,'a throwing vibrate is swallowed');}

// 5. Lazy build, gating, the songs following the mood, goals, teardown.
{let gesture=false,ok=true,sfx=true,linked=null;const master={};
 const host={ctx:()=>gesture?ctx:null,master:()=>master,ok:()=>ok,sfxOn:()=>sfx,changed(){},wake(){host.woke=(host.woke||0)+1;},bind(s){linked=s;}};
 const snd=A.createStadiumSound(host);assert(linked&&linked.active()===false,'bound to the island sound');
 Mo.resetStadiumMood();const mood=Mo.stadiumMood(),far={x:S.x+400,z:S.z,h:0,rx:1,rz:0,lite:false,mood},bowl={...far,x:S.x+20,z:S.z};
 const run=async(f,n=1)=>{for(let i=0;i<n;i++){ctx.currentTime+=.1;snd.update(.1,f);await tick();}};
 const o0=offlines;await run(far,50);assert.equal(offlines,o0,'far away: nothing rendered');assert.equal(snd.debug.ticks,50,'10 Hz work');
 for(let i=0;i<5;i++)snd.update(.016,far);assert.equal(snd.debug.ticks,50,'a frame under the tick does nothing');
 await run(bowl,20);assert.equal(offlines,o0,'no gesture yet: nothing built, nothing rendered');assert.equal(snd.ready,false);
 gesture=true;ok=false;await run(bowl,10);assert(snd.debug.builds===1&&offlines>o0,'after a gesture, the first approach renders the beds');assert.equal(snd.ready,false,'muted / hidden: no live graph');assert(host.woke>0,'asks the idle-suspended context to wake');
 ok=true;await run(bowl,2);assert.equal(snd.ready,true,'unmuted in the bowl: the live graph');assert.equal(snd.presence,1);assert.equal(snd.musicFade,1,'the music fades out in the bowl');
 sfx=false;await run(bowl,1);assert.equal(snd.musicFade,1,'effects muted: the island music still stops at the stadium');sfx=true;

 const liveSrc=()=>[...live].filter(n=>n.context===null&&n.started&&!n.dead&&n.buffer).length;assert(liveSrc()<=4,'between matches: murmur, roar, rumble only');assert.equal(snd.song,null,'no song without a match');
 // a match wakes: the mood's chant cycle → the song follows; it starts on a bar line
 const m={live:true,exhibition:true,goals:0,ball:{x:S.x,z:S.z}};let guard=0;while(Mo.stadiumMood().phase==='quiet'&&guard++<400)Mo.stepStadiumMood(.1,m);
 const want=mood.chant;assert(want,'the mood is chanting');await run(bowl,1);assert.equal(snd.song,want,'the song follows the mood: '+want);
 assert.equal(snd.debug.steps[0],'lead');const bar=A.nextBarIn(mood.beat,mood.bpm,.6),spb=60/mood.bpm;assert(Math.abs(((mood.beat+bar/spb)%4+4)%4)<1e-6||Math.abs(((mood.beat+bar/spb)%4)-4)<1e-6,'starts on a bar line');
 for(let i=0;i<160;i++){Mo.stepStadiumMood(.1,m);await run(bowl,1);}assert(snd.debug.phrases>=3,'phrases go out one after another: '+snd.debug.phrases);
 const nodesBefore=made;for(let i=0;i<10;i++)snd.update(.016,bowl);assert.equal(made,nodesBefore,'no nodes made between ticks');
 const songSrcs=[...live].filter(n=>n.context===null&&n.started&&!n.dead&&n.buffer&&!n.loop).length;assert(songSrcs<=8,'a small fixed pool of phrase sources: '+songSrcs);
 // a chant change crossfades into the next song
 const starts=snd.debug.chantStarts;guard=0;while(mood.chant===want&&guard++<2000)Mo.stepStadiumMood(.1,m);guard=0;while(!mood.chant&&guard++<400)Mo.stepStadiumMood(.1,m);
 await run(bowl,1);assert.equal(snd.song,mood.chant,'the next chant: '+mood.chant);assert.equal(snd.debug.chantStarts,starts+1);
 // a goal: the roar one-shot; a near miss: the ooh
 const goals=snd.debug.goals;Mo.stepStadiumMood(.1,{...m,goals:1});await run(bowl,1);assert.equal(snd.debug.goals,goals+1,'a goal roars');
 // reactions: a near miss "ooh" + "aah", the attack swell and its fizzle, the touch ring (save, tackle, long ball), ripples
 {const R=snd.debug.reactions,before={...R};const sim={touches:Array.from({length:8},()=>({serial:0,kind:'receive',team:'gold',height:0,other:null})),touchSerial:0};
  const touch=(kind,o={})=>{sim.touchSerial++;Object.assign(sim.touches[(sim.touchSerial-1)%8],{serial:sim.touchSerial,kind,team:'gold',height:0,other:'x',...o});};
  const fs_={...bowl,sim};await run(fs_,1);
  for(let i=0;i<5;i++)touch('receive');await run(fs_,1);assert.deepEqual({...R},{...before,ooh:R.ooh,aah:R.aah,applause:R.applause},'old touches are not replayed');
  const t0={...R};touch('parry');await run(fs_,1);assert(R.ooh>t0.ooh&&R.applause>t0.applause,'a save: ooh + applause');
  await run(fs_,40);const t1={...R};touch('kick',{height:1,other:'y'});touch('receive');await run(fs_,1);assert(R.applause>t1.applause,'a long ball well received: applause');
  await run(fs_,70);const t2={...R};touch('tackle');await run(fs_,1);assert(R.applause+R.jeer>t2.applause+t2.jeer,'a tackle: applause (or whistles)');
  const t3={...R};mood.excitement=.3;await run(fs_,1);mood.excitement=.7;await run(fs_,1);assert.equal(R.swell,t3.swell+1,'an attack near the box: the swell');
  mood.excitement=.3;await run(fs_,25);assert(R.groan+R.aah>t3.groan+t3.aah,'the attack fizzles: a groan / aah');
  const t4={...R};Mo.stepStadiumMood(.1,m);const mm=Mo.stadiumMood();mm.sinceGoal=5;mm.sinceNearMiss=0;await run(fs_,1);assert(R.ooh>t4.ooh&&R.aah>t4.aah,'a near miss: ooh, then aah');
  const t5=Object.values(R).reduce((a,b)=>a+b,0);await run({...bowl,sim:null},400);assert(Object.values(R).reduce((a,b)=>a+b,0)-t5>=3,'ripples from the sections while nothing happens');
  const pool=[...live].filter(n=>n.context===null&&n.started&&!n.dead&&n.buffer&&!n.loop).length;assert(pool<=15,'still a fixed pool (2 song slots x 6 + 3 one-shots): '+pool);}
 // hidden / muted: the island sound's silence() stops it at once
 linked.stop(true);assert.equal(snd.ready,false,'silenced');ok=false;await run(bowl,3);assert.equal(snd.ready,false,'stays silent while hidden');ok=true;await run(bowl,2);assert.equal(snd.ready,true,'comes back on return');
 // leaving: fades, stops after a few seconds, tears the renders down after TEARDOWN s
 await run(far,10);assert.equal(snd.ready,true,'still fading out');await run(far,Math.ceil(K.stopAfter*10)+2);assert.equal(snd.ready,false,'stopped after leaving');
 const t0=snd.debug.teardowns;await run(far,K.teardown*10+5);assert.equal(snd.debug.teardowns,t0+1,'torn down after a while away');
 const o1=offlines;await run(far,20);assert.equal(offlines,o1,'nothing rendered after teardown while away');
 // lite mix: fewer voices, no olé roll
 const lite=A.createStadiumSound(host);await run({...bowl,lite:true},1);for(let i=0;i<12;i++){lite.update(.1,{...bowl,lite:true});ctx.currentTime+=.1;await tick();}assert.equal(lite.debug.lite,true);lite.dispose();snd.dispose();}

// 6. Wiring: the island sound hosts it (gates, silence, idle, audible), the music crossfades, Town drives it.
{const is=fs.readFileSync(path.join(base,'lib/audio/islandSound.ts'),'utf8'),mu=fs.readFileSync(path.join(base,'lib/audio/islandMusic.ts'),'utf8'),town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8');
 assert.match(is,/ok:\(\)=>!!context&&!!master&&context\.state==='running'&&!muted&&!idleFaded&&volume>0&&!hidden&&!disposed/,'gated like the water sound');
 assert.match(is,/function silence\(now=false\)\{water\.stop\(now\);stadium\?\.stop\(now\);/,'hide / mute silence it');assert.match(is,/stopCrowd\(\);stadium\?\.stop\(false\);/,'the idle fade stops it');
 assert.match(is,/!!stadium\?\.active\(\)/,'counts as audible (no idle suspend while it plays)');assert.match(is,/ctx:\(\)=>disposed\?null:context/,'never creates the context itself');
 assert.match(mu,/&&stadiumFade<1&&/,'the music pauses when fully faded');assert.match(mu,/setStadiumFade\(value:number\)/);
 assert.match(town,/stadiumAudio\.update\(dt,sf\);music\.setStadiumFade\(stadiumAudio\.musicFade\);/,'Town drives it each frame');
 assert.match(town,/stadiumShake\.trigger\(\{reduced:rm,flying:rideRef\.current==='jetpack',presence:stadiumAudio\.presence\}\)/,'the shake checks reduced motion and flight');
 assert.match(town,/stadiumShake\.restore\(camera\);moveNudge\.restore\(camera\)/,'the shake is undone before the camera is placed');
 assert.match(town,/sf\.lite=heat\.tier>=2\|\|heat\.saver/,'lighter mix on heat tier 2+ and in Battery saver');}
console.log('stadium-sound: ok');
})().catch(e=>{console.error(e);process.exit(1);});

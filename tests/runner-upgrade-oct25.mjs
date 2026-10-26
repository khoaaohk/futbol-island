// Breakaway Run upgrade (Oct 25 2026, docs/ARCADE_BREAKAWAY_UPGRADE_OCT25.md): a save drops ONE multiplier tier instead of
// the whole combo, footsteps follow the stride, new event layers stay inside the voice cap, and the new visuals are pooled.
import '../scripts/register-local-ts.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const R=await import('../lib/arcade/runnerGame.ts');
const {createRunnerGame,runnerMultiplier,dropTier}=R;

// 1. Combo tier drop (fairness): ×3 → ×2, ×2 → ×1, ×1 stays ×1 and is not counted as a drop.
{const s=createRunnerGame();s.combo=14;dropTier(s);assert.equal(runnerMultiplier(s),2,'×3 keeps ×2 after a save');assert.equal(s.combo,6);assert.equal(s.comboDrops,1);
 dropTier(s);assert.equal(runnerMultiplier(s),1,'×2 falls to ×1');assert.equal(s.combo,0);assert.equal(s.comboDrops,2);
 s.combo=4;dropTier(s);assert.equal(s.combo,0);assert.equal(s.comboDrops,2,'no tier lost at ×1, no drop cue');}
// A real save at a golden-frame goal goes through dropTier.
{const s=createRunnerGame();s.spawn=99;s.nextGoal=1e6;s.combo=13;
 s.objects=[{kind:'goal',lane:0,z:-14,passed:false,openLane:1}];s.x=-2.4;s.lane=-1;
 R.runnerShoot(s);for(let i=0;i<120&&s.eventKind!=='save'&&s.eventKind!=='goal';i++)R.tickRunner(s,1/60);
 assert.equal(s.eventKind,'save','a wrong-lane shot is saved');assert.equal(runnerMultiplier(s),2,'the save cost one tier only');assert.equal(s.streak,0);}

// 2. Soundtrack: footsteps from the stride, silent in the air / sliding; drop + fanfare + full-time cues bounded.
globalThis.localStorage={store:{},getItem(k){return this.store[k]??null;},setItem(k,v){this.store[k]=String(v);}};
class Param{constructor(v=0){this.value=v;}setValueAtTime(){}linearRampToValueAtTime(){}exponentialRampToValueAtTime(v){if(!(v>0))throw new RangeError('exponential ramp to non-positive');}}
class Node{connect(){}disconnect(){}}
let started=0;
class Source extends Node{constructor(){super();this.frequency=new Param(440);this.onended=null;}start(_at,_offset,duration){started++;if(duration!==undefined)this.onended?.();}stop(){this.onended?.();}}
class Ctx{constructor(){this.state='running';this.currentTime=0;this.sampleRate=8000;this.destination=new Node();}
 createGain(){return Object.assign(new Node(),{gain:new Param(1)});}createOscillator(){return new Source();}createBufferSource(){const s=new Source();s.buffer=null;return s;}
 createBiquadFilter(){return Object.assign(new Node(),{type:'',Q:new Param(1),frequency:new Param(1000)});}createStereoPanner(){return Object.assign(new Node(),{pan:new Param(0)});}
 createBuffer(_c,length,rate){const data=new Float32Array(length);return{duration:length/rate,getChannelData:()=>data};}}
const {createRunnerSoundtrack}=await import('../components/games/runnerAudio.ts');
localStorage.setItem('fi2-music-enabled','false');
const ctx=new Ctx(),track=createRunnerSoundtrack(()=>ctx),game=createRunnerGame();
const frames=(seconds,each)=>{const before=started;for(let i=0;i<seconds*30;i++){each?.();ctx.currentTime+=1/30;track.frame(1/30,game);}return started-before;};
frames(1.2);// settle prefs
const still=frames(1);
const running=frames(2,()=>{game.stride+=9.1/30;});
assert(running-still*2>=10,`footsteps play while running (${running} vs ${still})`);
game.y=.6;const air=frames(1,()=>{game.stride+=9.1/30;});game.y=0;
game.slide=.5;const sliding=frames(1,()=>{game.stride+=9.1/30;});game.slide=0;
assert(air<=still+1&&sliding<=still+1,'no footsteps in the air or while sliding');
game.comboDrops=1;assert(frames(.05)>=2,'tier drop plays a soft two-note cue');
game.event++;game.eventKind='goal';frames(.05);game.event++;game.eventKind='save';frames(.05);
game.lives=0;game.event++;game.eventKind='hit';frames(.1);
assert(track.debug().voices<=28,'voice cap holds through the new layers');
track.dispose();

// 3. Visual layer contract (source checks; the renderer itself is checked in the browser).
const fx=fs.readFileSync(new URL('../lib/arcade/runnerFx.ts',import.meta.url),'utf8');
assert.match(fx,/const FLASHES=24;/,'camera flashes are one bounded pool');
assert.match(fx,/function photoFlashes\(count:number\)\{\s*if\(reduced\)return;/,'no flashing lights under reduced motion');
assert.match(fx,/runner-combo-aura/,'combo aura exists');
assert.match(fx,/active:\(\)=>[^;]*flashes\.visible/,'flashes keep frames only while alive');
assert.match(fx,/COMBO ×\$\{pendingTier\}!/,'tier-up word');
const adapter=fs.readFileSync(new URL('../lib/arcade/islandArcadePlayer.ts',import.meta.url),'utf8');
assert.match(adapter,/intent\.plant=o\?\.plant;intent\.squash=o\?\.squash;intent\.squashSerial=o\?\.squashSerial;/,'plant + squash reach the island rig');
console.log('PASS runner upgrade Oct 25: one-tier save penalty, stride footsteps, new cues inside the voice cap, pooled aura/flashes, plant+squash wiring');

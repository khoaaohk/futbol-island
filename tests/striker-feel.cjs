// Island Strikers game feel (Oct 10 2026 senior game-dev pass): shot gauge zones, charge cues at 30/60/120Hz, impact
// hit-stop table and wiring, neutral-stick open-side aim, HUD re-render gate, tap-to-skip replay, no per-substep arrays.
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const mods={};function load(name){if(mods[name])return mods[name].exports;const m={exports:{}};mods[name]=m;
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(`lib/arcade/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math,require:p=>load(p.replace('./',''))});return m.exports;}
const match=load('strikerMatch'),feel=load('strikerFeel');
const {strikerGaugeZone,strikerChargeCue,strikerImpact,STRIKER_MAX_HOLD,STRIKER_OVERHIT}=feel,{STRIKER_CLEAN,strikerAim,STRIKER_AUTO_AIM,createStrikerMatch,strikerInput}=match;

// Gauge zones match the sim's numbers (clean band and overhit lift).
assert.equal(strikerGaugeZone(.1),'build');assert.equal(strikerGaugeZone(STRIKER_CLEAN[0]),'clean');assert.equal(strikerGaugeZone(STRIKER_CLEAN[1]),'clean');
assert.equal(strikerGaugeZone(.9),'hard');assert.equal(strikerGaugeZone(STRIKER_OVERHIT),'over');assert.equal(strikerGaugeZone(1),'over');
const shoot=fs.readFileSync('lib/arcade/strikerMatch.ts','utf8');assert.match(shoot,/overhit=power>\.93/,'gauge overhit zone matches the shot lift threshold');

// Charge cues: build, band, over exactly once each in order, at any frame rate, using the sim's real charge rate.
for(const hz of [30,60,120]){const g=createStrikerMatch(),s=g.state,i=strikerInput();g.reset();for(const p of s.players)if(p.id!==0)p.stun=99;Object.assign(s.ball,{owner:0,lock:0});s.selected=0;
 i.charge=true;let prev=0;const cues=[];for(let n=0;n<hz*1.4;n++){g.step(1/hz,i);const c=strikerChargeCue(prev,s.charge);if(c)cues.push(c);prev=s.charge;}
 assert.deepEqual(cues,['build','band','over'],`charge cues at ${hz}Hz`);}
assert.equal(strikerChargeCue(.7,0),'','releasing is silent');assert.equal(strikerChargeCue(.5,.5),'');

// Impact hit-stop: big contacts hold briefly, routine ones stay fluid, never longer than the cap.
assert.equal(strikerImpact('shot').hold,0,'a plain shot stays fluid');assert(strikerImpact('shot',{clean:true}).hold>0,'clean strike holds');
assert(strikerImpact('shot',{special:true}).hold>strikerImpact('shot',{clean:true}).hold,'Team Strike hits hardest');
for(const k of ['steal','post','hit','beat'])assert(strikerImpact(k).hold>0,k);for(const k of ['pass','touch','board','intercept','goal'])assert.equal(strikerImpact(k).hold,0,k);
assert.equal(strikerImpact('save').hold,0,'a keeper picking up a roller is not an impact');assert(strikerImpact('save',{hardShot:true}).hold>0);
for(const k of ['shot','steal','post','save','hit','beat'])for(const o of [{},{clean:true},{special:true},{hardShot:true}])assert(strikerImpact(k,o).hold<=STRIKER_MAX_HOLD&&strikerImpact(k,o).kick<=1);

// Neutral-stick aim: a held up/down is exact; neutral picks the corner whose path passes farther from the keeper.
assert.equal(strikerAim(.8,10,0,22.5,0),.8);assert.equal(strikerAim(-.3,10,0,22.5,0),-.3);
assert.equal(strikerAim(0,10,0,22.5,1.5),-STRIKER_AUTO_AIM,'keeper shifted up: aim down');assert.equal(strikerAim(0,10,0,22.5,-1.5),STRIKER_AUTO_AIM);
assert.equal(strikerAim(0,12,-7,22.5,0),-STRIKER_AUTO_AIM,'from the bottom flank the bottom corner path stays clear of a central keeper');
// In the sim: a neutral shot no longer goes at the keeper, and the aim marker (state.aim) shows the same corner.
{const g=createStrikerMatch(),s=g.state,i=strikerInput();g.reset();for(const p of s.players)if(!p.keeper)p.stun=99;Object.assign(s.players[0],{x:12,z:3,stun:0,yaw:Math.PI/2});Object.assign(s.players[7],{x:22.5,z:1.2});Object.assign(s.ball,{owner:0,x:12.8,z:3,lock:0});s.selected=0;
 i.charge=true;g.step(1/60,i);const shown=s.aim;assert(Math.abs(shown)>0,'marker shows the auto corner');i.charge=false;i.shoot=true;i.power=.7;g.step(1/60,i);assert.equal(s.ball.owner,-1);assert(s.ball.vz<0,'shot heads for the open (lower) corner');assert(shown<0);}
// Set pieces keep the player's own choice (penalty: pick a corner).
assert.match(shoot,/state\.aim=state\.setPiece\.kind\?input\.z:strikerAim\(/);

// Wiring: the sim holds while the scene does, inputs stay buffered; HUD renders only on change; tapping the pitch skips the replay.
const ui=fs.readFileSync('components/LiveArcadeMatch.tsx','utf8'),scene=fs.readFileSync('lib/arcade/strikerScene.ts','utf8'),audio=fs.readFileSync('lib/arcade/strikerAudio.ts','utf8');
const holdAt=ui.indexOf('if(active&&visual.holding)'),stepAt=ui.indexOf('match.step(dt,input)');assert(holdAt>0&&holdAt<stepAt,'hold check runs before the sim step');
assert.match(ui,/visual\.impact\(Math\.min\(STRIKER_MAX_HOLD,im\.hold\),im\.kick\)/);assert.match(ui,/if\(key!==hudKey\)\{hudKey=key;setView\(/,'HUD re-renders only on change');
assert.match(ui,/if\(phaseRef\.current==='playing'\)skipReplay\.current=true;/,'tap the pitch to skip the replay');assert.match(ui,/charging\.current\|\|skipReplay\.current/);
assert.match(ui,/strikerChargeCue\(chargeTone,s\.charge\)/);assert.match(audio,/case 'band':/);
assert.match(scene,/const anim=s\.hitStop>0\|\|held\?0:dt\*s\.timeScale/,'bodies freeze during the hold');assert.match(scene,/if\(dt>0&&!held&&/,'replay tape skips held frames');
assert.match(scene,/gaugeFillGeometry\.setDrawRange\(0,/,'gauge fill uses drawRange, no rebuild');assert(!/powerRing/.test(scene),'old power ring removed');
assert.match(scene,/punch=Math\.max\(punch,kick\)/);assert.match(scene,/const motion=!stage\.reduced/,'camera punch still gated by reduced motion');
// Heat: no arrays built inside the 120 Hz substep loop for the chaser/cover scratch; no find() closure per scene frame.
const loop=shoot.slice(shoot.indexOf('for(let tick=0;tick<count;tick++){'),shoot.indexOf('// Separate bodies gently'));
assert(!/const closest=\[|const cover=\[|of \[0,1\]|of \[1\]/.test(loop),'no per-substep arrays');assert(!/s\.players\.find\(/.test(scene));
console.log('PASS Strikers feel: gauge zones, band/overhit cues at 30/60/120Hz, impact hit-stop, open-side neutral aim, HUD gate, tap-to-skip, no per-substep arrays');

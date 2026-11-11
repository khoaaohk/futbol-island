// Futbol Pinball machine look (Nov 10 2026, docs/arcade-aaa/pinball-direction.md): the score panel's calls (comic restyle, was the dot-matrix),
// the no-neon look, filament lamps, the self-stopping roll voice and the flat cabinet skin.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const read=f=>fs.readFileSync(f,'utf8');
// Nov 10 2026 comic restyle: the dot-matrix display became a comic score panel (lib/games/soccerPinballScorePanel.ts +
// components/games/PinballScorePanel.tsx); the call mapping (dmdCall -> scoreCall) is pinned as before, the dot frames became call pins.
const m={exports:{}};vm.runInNewContext(ts.transpileModule(read('lib/games/soccerPinballScorePanel.ts'),{compilerOptions:{module:1,target:7}}).outputText,{Math,Number,String,Array,Object,RegExp,exports:m.exports,module:m});
const D=m.exports;
// 1. Coaching lines become short calls; the resting hints do not.
assert.deepEqual({...D.scoreCall('CHALLENGE +200 · GOAL! +950 · Another defender joins.')},{kind:'goal',title:'GOAL!',sub:'+950',life:2.3});
assert.equal(D.scoreCall('CORNER FINISH! +1200 · You beat the back three!').title,'CORNER FINISH');
assert.equal(D.scoreCall('Find your timing: let the ball reach the flipper before you strike.').title,'BALL LOST');
assert.equal(D.scoreCall('RIVAL GOAL · read the wind-up and time your return.').kind,'lost');
assert.equal(D.scoreCall('SAVED! Aim for the gold pockets beside the posts.').title,'SAVED!');
assert.equal(D.scoreCall('DEFENDER DAZED · attack the open space!').title,'DEFENDER DAZED');
for(const rest of ['BUILD → SWITCH → FINISH · Link both feet, then score.','Launch power · 60%','FINISH! 12s · Lit goal +1000 · Corners +150',''])assert.equal(D.scoreCall(rest),null,rest);
// 2. The calls (bursts over the upper table): none at rest or on the plunger, a goal takes the panel and small calls never cover it, the call ends
// by its one timer, kick off, new best, and full time rests on the final score.
const view={phase:'playing',score:960,clock:"23'",balls:2,division:'DIV 3',late:false,waiting:false,message:''};
let s=D.stepScorePanel(D.createScorePanel(),view,0);assert.equal(s.call,null,'resting score');assert.equal(D.stepScorePanel(s,{...view},.1).call,null,'an unchanged read makes no call');
assert.equal(D.stepScorePanel(s,{...view,waiting:true,message:'Launch power · 60%'},.2).call,null,'the plunger charge is on the Launch key, not a call');
s=D.stepScorePanel(s,{...view,message:'GOAL! +950 · Another defender joins.'},1);assert.equal(s.call.kind,'goal');assert.equal(s.call.sub,'+950');const goal=s.call.id;
s=D.stepScorePanel(s,{...view,message:'DEFENDER DAZED · attack the open space!'},1.2);assert.equal(s.call.id,goal,'a small call never covers a goal');
s=D.endScoreCall(s,goal);assert.equal(s.call,null,'the call ends and the panel rests');
s=D.stepScorePanel(s,{...view,waiting:true},2);s=D.stepScorePanel(s,{...view},2.1);assert.equal(s.call.kind,'kick','kick off');
s=D.stepScorePanel(s,{...view,score:1910,best:1500,message:'x'},5);assert.equal(s.call.kind,'best','new best');assert.equal(s.call.sub,'1910');
s=D.stepScorePanel(s,{...view,phase:'over',score:1910},9);assert.equal(s.call,null,'full time rests on the final score');
// Heat: one setTimeout (it ends a call), no rAF / interval, no looping CSS; the score is the pill and the status tab sits inside the top bar
// row (the owner retired the display band); reduced motion drops every frame.
{const panel=read('components/games/PinballScorePanel.tsx'),css=read('components/games/skins/pinball.module.css');
 assert.ok(!/requestAnimationFrame|setInterval/.test(panel)&&(panel.match(/setTimeout\(/g)||[]).length===1,'one timer: it ends a call');assert.ok(!/infinite/.test(css),'no looping animation');
 assert.match(panel,/<div data-pinball-dmd data-pb-phase=\{phase\} aria-hidden="true">/,'the camera solver and pinballGame.ts still find the panel');
 assert.match(css,/\.skin \[data-pinball-dmd\]\{position:absolute;z-index:2;top:calc\(var\(--arcade-edge-top,14px\) \+ env\(safe-area-inset-top,0px\) \+ 41px\);[^}]*height:16px/,'the status tab hangs just under the score pill, its foot at the solver top line (71 px; no display band)');assert.doesNotMatch(css,/\[data-arcade-pill\]\{opacity:0\}/,'the score is the top-bar pill');
 assert.match(panel,/\{call&&<div key=\{call\.id\} data-pinball-call=\{call\.kind\}/,'a call burst exists only while it plays');assert.match(panel,/<ComicBurst word=\{call\.title\}/,'GOAL! is the kit starburst');
 assert.match(css,/prefers-reduced-motion:reduce\)\{\.skin \[data-pinball-call\],\.skin \[data-pinball-call\] \*\{animation:none!important\}/);}
// 3. The look (comic house style, Nov 10 2026: pins moved from the machine look): the kit's print base, nothing emissive, no env map or
// additive lamp, one playfield print, print lamps on one shader, the page tone on the comic bands (the stage lights never change).
const look=read('lib/arcade/looks/pinball.ts'),game=read('lib/arcade/games/pinballGame.ts'),cab=read('lib/games/soccerPinballCabinet.ts');
assert.ok(!/neon/i.test(look.replace(/Nothing here is neon/,''))&&!/createNeonSpill|createGlassFloor|neonCabinet/.test(game+cab),'no neon cabinet pieces');
assert.match(look,/export const pinballLook:ArcadeStageLook=comicLook\(\{/);assert.doesNotMatch(look,/emissive:|toneMapping:|exposure:/);assert.match(read('lib/arcade/comic/look.ts'),/powerPreference:'low-power',pixelRatioCap:\{mobile:1\.5,desktop:2\}/);
assert.doesNotMatch(game+cab+read('lib/games/soccerPinballTableView.ts')+read('lib/games/soccerPinballHype.ts')+read('lib/games/soccerPinballFx.ts'),/AdditiveBlending|envMap:|PMREMGenerator|pinballBulb|pinballEnv|metalness:[.1]/,'no env map, bloom sprite, additive lamp or metal left from the machine look');
assert.match(cab,/export function paintPinballPlayfield/);assert.match(cab,/export const lampStep=/);assert.match(cab,/export function printLampMaterial\(ink:ComicUniforms,core=1\/PINBALL_BLOOM,hole=0\)/);assert.match(cab,/const ink=createComicUniforms\(\);comicDotCell\(ink,renderer\)/);
assert.match(game,/ink\.uInkLight\.value\.copy\(toneTier\)\.lerp\(toneDusk,dusk\)\.lerp\(toneHot,hot\);ink\.uInkShade\.value\.copy\(toneShade\)\.lerp\(toneDeep,dusk\*\.8\)/,'drain, goal and full time tint the comic bands');assert.doesNotMatch(game,/giHemi|giSun/,'the lights are never dimmed');assert.match(game,/aimComicSun\(ink,sunDir,stage\.camera\);stage\.effects\(dt\)/);
// AAA pass 2: the ready table holds a still attract pattern, so the loop sleeps when no lamp is still easing (not when every lamp is dark).
assert.match(game,/showT>0\|\|floorWave>0\|\|floorMoving\|\|Math\.abs\(giHeat-giTarget\)>\.01/,'lamps, light shows and GI let the table sleep');assert.match(game,/floorEnergy\[i\]=dt>0&&!waiting\?lampStep\(floorEnergy\[i\],energy,dt\):energy/,'lamps snap on the plunger: no easing frames while waiting');
// 4. Audio: hand-played comic palette (Nov 10 restyle: pan replaces chime/bell, cajon the coils, woodBlock+rim the flipper coil, clap the knocker, shaker the glass rattle; rubber kept), one trim -> limiter bus, and the roll voice stops itself.
const audio=read('lib/games/soccerPinballAudio.ts');for(const fn of ['pan','cajon','rubber','woodBlock','rim','clap','shaker','fanfare'])assert.match(audio,new RegExp('function '+fn+'\\('));assert.match(audio,/trim\.connect\(c\);c\.connect\(ctx\.destination\);v\.out=trim;/,'voices -> trim -> limiter -> destination, once');
// AAA pass 2 (Safari): the voice is made once and never stop()ped; a gain envelope silences it and one timer parks it off the destination.
assert.doesNotMatch(audio.slice(audio.indexOf('export function pinballRollSound')),/\.stop\(/,'roll voice never calls stop()');assert.match(audio,/voice\.gain\.gain\.setTargetAtTime\(0,now\+\.14,\.09\)/,'roll voice decays by its own gain envelope');assert.match(audio,/voice\.gain\.disconnect\(\);\}catch\{\}voice\.live=false/,'roll voice parks itself when the table sleeps');
// 5. Skin: flat cabinet parts. No gradients, blur or glow; buttons in the UI sans at weight 800.
const skin=read('components/games/skins/pinball.module.css'),card=read('components/games/PinballCard.module.css');
for(const css of [skin,card]){assert.ok(!/gradient\(|backdrop-filter|blur\(|text-shadow:0 0|IslandBrush/.test(css),'flat ink only');// AAA pass 2: the cabinet buttons are drawn with hard-edged tone steps (zero-blur box-shadow rings and side walls). Still no blurred shadow or glow anywhere.
 for(const m of css.matchAll(/box-shadow:([^;}]+)/g)){if(/^none/.test(m[1]))continue;for(const layer of m[1].replace('!important','').split(',')){const nums=layer.trim().replace(/^inset\s+/,'').split(/\s+/).filter(t=>/^-?[\d.]+(px)?$/.test(t));assert.ok(nums.length<3||parseFloat(nums[2])===0,'no resting shadows or glows (hard-edged steps only): '+layer);}}}
assert.match(read('components/games/ArcadeGame3D.tsx'),/\{kind==='pinball'&&<PinballScorePanel hud=\{hud\} phase=\{phase\} best=\{record\.best\}\/>\}/);assert.match(read('components/games/ArcadeGame3D.tsx'),/\$\{arcadeSkin\[kind\]\}\$\{kind==='pinball'\?` \$\{comicRoot\}`:''\}/,'pinball wears the comic kit');
console.log('PASS pinball machine nov10: score panel calls + one-timer heat rule, comic print look, print lamps + page-tone sleep, hand-played audio, flat skin');

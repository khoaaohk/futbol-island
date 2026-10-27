// Breakaway Run clean UI (owner, Oct 27 2026: "fix the break away game. same thing. same consistent pause modal, score bar. also fix
// the left right buttons to have the joystick instead to match with the other games"). Source contract for:
// 1. Strikers' floating stick replaces the lane buttons; the thumb cluster is round, big and does not overlap.
// 2. While playing the only text is a short GOAL! / Tackled! flash (no coach line, tips, header detail or floating captions).
// 3. Strikers-style top bar (Back, one points pill, Pause) and pause card (Paused, big Resume, Arcade / Restart, keycaps on desktop).
// 4. Landscape on phones via requestLandscape (RotateLock turns upright phones).
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm');
const read=f=>fs.readFileSync(f,'utf8');
const pad=read('components/games/RunnerControls.tsx'),padCss=read('components/games/RunnerControls.module.css'),hook=read('lib/arcade/useFloatingStick.ts');
const game=read('components/games/ArcadeGame3D.tsx'),bar=read('components/arcade/ArcadeTopBar.tsx'),pause=read('components/arcade/ArcadePauseCard.tsx'),pauseCss=read('components/arcade/ArcadePauseCard.module.css');
const hud=read('lib/arcade/runnerHud.ts'),fx=read('lib/arcade/runnerFx.ts');

// 1. Joystick present, lane buttons gone.
assert.match(pad,/useFloatingStick\(/,'pad uses the shared floating stick hook');
assert.match(pad,/className="joystick" data-floating="true"/,'Strikers joystick markup (global .joystick)');
assert.match(pad,/joystick-contact-arc/,'rim-glow contact arc like Strikers');
assert.match(pad,/data-runner-stick-zone \{\.\.\.stick\.zone\}/,'press anywhere in the left zone anchors the stick');
assert.doesNotMatch(pad,/Move one lane|pressLane|styles\.lane\b/,'no left/right lane buttons');
assert.doesNotMatch(padCss,/\.lane\.lane|\.lanes\{/,'no lane button styles');
for(const name of ['paintJoystick','clampAnchor','stickTravel','shapeStick'])assert.match(hook,new RegExp(name+'\\('),`hook uses Strikers' ${name}`);
assert.match(padCss,/\.zone\{[^}]*width:45%[^}]*touch-action:none/,'left 45% stick zone like Strikers');
assert.match(padCss,/@media \(pointer:fine\)\{\.zone,\.movement\.movement,\.cluster\{display:none\}\}/,'mouse windows hide the pad (keyboard play)');
// Steering: one lane per push past the threshold, hold to repeat, back inside the dead band to re-arm.
{const m={exports:{}};vm.runInNewContext(ts.transpileModule(read('lib/arcade/runnerSteer.ts'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math});
 const {runnerSteer,runnerSteerState,RUNNER_STEER}=m.exports,s=runnerSteerState();
 assert.equal(runnerSteer(s,.2,0),0,'small push: nothing');assert.equal(runnerSteer(s,.7,.01),1,'push right: one lane');
 assert.equal(runnerSteer(s,.8,.1),0,'held: no instant double step');assert.equal(runnerSteer(s,.8,.1+RUNNER_STEER.repeat),1,'held: repeats');
 assert.equal(runnerSteer(s,.4,1),0,'between off and on: keeps state, no step');assert.equal(runnerSteer(s,.1,1.1),0,'back to centre re-arms');
 assert.equal(runnerSteer(s,-.9,1.2),-1,'push left: one lane');assert.equal(runnerSteer(s,.9,1.25),1,'flick across: immediate');}
// Cluster geometry: every button >= 64 px, no two overlap (centres are offsets from Shoot's centre).
{const btn=n=>{const r=padCss.match(new RegExp(`\\.${n}\\.${n}\\{([^}]*)\\}`))[1];const v=k=>{const x=r.match(new RegExp(`--${k}:(-?\\d+)px`));return x?Number(x[1]):0;};return{n,d:v('d'),x:v('x'),y:v('y')};};
 const all=['shoot','jump','slide','skill'].map(btn);for(const b of all)assert(b.d>=64,`${b.n} is ${b.d}px`);
 assert(all[0].d>=90&&all.every(b=>b.d<=all[0].d),'Shoot is the biggest');
 for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const a=all[i],b=all[j],gap=Math.hypot(a.x-b.x,a.y-b.y)-(a.d+b.d)/2;assert(gap>=12,`${a.n}/${b.n} gap ${gap.toFixed(1)}px`);}}

// 2. In-play text removed.
assert.match(game,/\{phase==='playing'&&kind==='runner'&&<RunnerControls /,'runner pad renders on its own while playing');
assert.match(game,/\{phase==='playing'&&kind!=='runner'&&<>/,'the shared message line is not rendered for the runner');
assert.doesNotMatch(game,/<footer className=\{styles\.controls\}>\{kind==='runner'/,'runner pad is not inside the shared footer');
assert.match(pad,/\{hud\.flash&&<p key=\{hud\.flashId\}[^>]*data-runner-flash/,'the only in-play text is the flash');
assert.doesNotMatch(pad.slice(pad.indexOf(' return <div')),/hud\.message|hold to|swipe/i,'no coach line or hold-to captions on the pad');
assert.match(hud,/return r\.eventKind==='goal'\?'GOAL!':r\.eventKind==='hit'\?'Tackled!':'';/,'flash only after a goal or a tackle');
assert.match(fx,/export const RUNNER_WORD_POPS:boolean=false;/,'floating caption words are off');
assert.match(fx,/if\(!RUNNER_WORD_POPS\|\|!wordCtx/,'pop() honours the switch');

// 3. Header and pause card: the shared arcade bar and pause card (docs/ARCADE_CHROME_OCT27.md; tests/arcade-chrome-shared.cjs).
assert.match(game,/<ArcadeTopBar game=\{kind\}[^>]*value=\{hud\.score\} word=\{kind==='tennis'\?undefined:'pts'\}/,'runner: Back · one points pill · Pause');
assert.doesNotMatch(bar.slice(bar.indexOf(' return <header')),/detail/,'no second detail line');
assert.match(game,/\{phase==='paused'&&!error&&<ArcadePauseCard game=\{kind\}[^>]*onRestart=\{restart\}/,'shared pause card with Restart');
assert.match(pause,/<h2 className=\{styles\.title\}>Paused<\/h2>/);assert.equal((pause.match(/className=\{styles\.resume\}/g)||[]).length,1,'one big Resume');
assert.match(pause,/>Resume<\/button>/);assert.match(pause,/>Arcade<\/button>/);assert.match(pause,/onClick=\{onRestart\}[^>]*>Restart<\/button>/);
assert.match(pauseCss,/@media \(pointer:coarse\)\{\.keys\.keys\{display:none\}\}/,'keycaps on desktop only');
assert.match(pauseCss,/\.resume\.resume\{[^}]*min-height:56px/,'Resume is the big button');
assert.match(game,/const restart=\(\)=>\{change\('ready'\);void start\(\);\};/,'Restart begins a fresh run');

// 4. Landscape.
assert.match(game,/useEffect\(\(\)=>kind==='runner'\|\|kind==='tennis'\?requestLandscape\(\):undefined,\[kind\]\);/,'Breakaway asks for landscape on phones');
console.log('PASS breakaway clean UI: floating stick, round thumb cluster, flash-only play, Strikers bar + pause card, landscape');

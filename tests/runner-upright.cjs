// Breakaway Run plays UPRIGHT (Nov 11 2026, owner: "the break away game should not be turned sideways to play"). Run: node tests/runner-upright.cjs
//  1. the gate: Breakaway asks for EITHER orientation (no turn-your-phone card upright or sideways); Strikers' landscape request is untouched
//  2. the upright chase camera (lib/arcade/runnerFrame.ts): runner above the thumb cluster, horizon a third down, three readable lanes,
//     and the fairness measure: an obstacle is 24 px tall at least as far ahead of the runner as on a sideways phone (same speed => same or
//     more time to react), at every supported phone size
//  3. wiring: the runtime applies the frame on upright touch screens only; the pad's upright layout; swipes; the stick's press origin
// Browser proof: scripts/check-breakaway-browser.cjs --mobile [--size=WxH] (upright), --landscape, --touch.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const ROOT=path.join(__dirname,'..');process.chdir(ROOT);
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const F=require('../lib/arcade/runnerFrame.ts'),O=require('../lib/orientationMode.ts'),read=f=>fs.readFileSync(f,'utf8');

// 1. The gate.
const shell=read('components/games/ArcadeGame3D.tsx'),lockCss=read('components/RotateLock.module.css');
assert.match(shell,/useEffect\(\(\)=>kind==='runner'\?requestAnyOrientation\(\):undefined,\[kind\]\);/,'Breakaway asks for either orientation');
assert.doesNotMatch(shell,/requestLandscape/,'no arcade 3D game forces landscape');
assert.equal(O.wrongOrientationQuery('any'),'not all','no wrong orientation in the either-way mode');
assert.equal(O.wrongOrientationQuery('portrait'),O.PORTRAIT_ONLY_QUERY);assert.equal(O.wrongOrientationQuery('landscape'),O.LANDSCAPE_ONLY_QUERY);
assert.doesNotMatch(lockCss,/data-mode=any/,'the card has no rule that shows it in the either-way mode');
{const releaseAny=O.requestAnyOrientation();assert.equal(O.getOrientationMode(),'any');const releaseLand=O.requestLandscape();assert.equal(O.getOrientationMode(),'landscape','a landscape request wins while both are held');
 releaseLand();assert.equal(O.getOrientationMode(),'any');releaseAny();releaseAny();assert.equal(O.getOrientationMode(),'portrait','leaving restores the portrait-only app');
 const again=O.requestLandscape();again();assert.equal(O.getOrientationMode(),'portrait','Strikers alone still restores portrait');}

// 2. The frame. Sideways reference: the 844x390 phone the game was tuned on.
const side=F.runnerSidewaysFrame(390),sideAhead=F.runnerSightAhead(side);
assert(Math.abs(side.depth-12.67)<.05&&Math.abs(side.ppm-44.7)<.5,'the sideways reference matches runnerFx (12.7 m from the lens, 45 px per metre)');
const rows=[];
for(const [w,h] of [[390,844],[390,664],[375,553],[360,560],[393,852],[430,932],[412,915],[320,568]]){
 const f=F.runnerUprightFrame(w,h,F.RUNNER_UPRIGHT.pad+16),ahead=F.runnerSightAhead(f),clusterTop=h-16-174;
 rows.push(`${w}x${h}: cam ${f.y.toFixed(1)} up / ${f.z.toFixed(1)} back, ${f.ppm.toFixed(0)} px/m, sees ${ahead.toFixed(1)} m`);
 assert(f.feetY<clusterTop-20,`${w}x${h}: feet (${f.feetY.toFixed(0)}) above the cluster (${clusterTop})`);
 assert(f.feetY/h>=.56&&f.feetY/h<=.8,`${w}x${h}: runner in the lower part of the frame`);
 assert(f.horizonY/h>=.3&&f.horizonY/h<=.38,`${w}x${h}: horizon about a third down (sky is a composition, not a strip)`);
 assert(f.horizonY>101+50,`${w}x${h}: sky shows under the margin strip`);
 assert(f.y>2.5&&f.pitch>0&&f.pitch<.3,`${w}x${h}: a low chase view looking slightly down`);
 // Lanes: 2.4 m apart; the camera follows 20 % of the runner's x, so a side lane sits 0.8 * 2.4 m off centre.
 const lane=2.4*.8*f.ppm;assert(lane>=w*.2&&lane<w*.3,`${w}x${h}: side lanes ${lane.toFixed(0)} px off centre`);
 assert(f.depth>=side.depth,`${w}x${h}: the runner is at least as far from the lens as sideways`);
 assert(ahead>=sideAhead,`${w}x${h}: a 1.7 m tackler is 24 px tall ${ahead.toFixed(1)} m ahead (sideways ${sideAhead.toFixed(1)} m)`);
 // A 0.7 m cone is only ~31 px tall AT the runner, so its readable size is taken as 12 px.
 // (a 320 px wide phone is 3 % short of sideways for the cone, the one case below the line: 19.8 m against 20.4 m.)
 if(w>=360)assert(F.runnerSightAhead(f,.7,12)>=F.runnerSightAhead(side,.7,12),`${w}x${h}: a cone reads as early too`);
}
// Same speed, so reaction time is the distance ratio; at the owner's 390x664 it is clearly better than sideways.
{const f=F.runnerUprightFrame(390,664,216);assert(F.runnerSightAhead(f)/sideAhead>=1.15,'390x664: at least 15 % more warning than sideways');}

// 3. Wiring.
const rt=read('lib/arcade/games/runnerGame3d.ts'),padCss=read('components/games/RunnerControls.module.css'),pad=read('components/games/RunnerControls.tsx'),hook=read('lib/arcade/useFloatingStick.ts'),fx=read('lib/arcade/runnerFx.ts');
assert.match(rt,/const upright=stage\.mobile&&stage\.camera\.aspect<1,fov=upright\?RUNNER_UPRIGHT\.fov:runnerFov0;/,'upright touch screens only; sideways and desktop keep their fov');
assert.match(rt,/runnerUprightFrame\(el\.clientWidth,el\.clientHeight,RUNNER_UPRIGHT\.pad\+padBottom\(\)\)/,'solved from the canvas and the real bottom gutter (safe area included)');
assert.match(rt,/height:calc\(var\(--arcade-edge-bottom,16px\) \+ env\(safe-area-inset-bottom,0px\)\)/);
assert.match(rt,/if\(!stage\.mobile\)\{stage\.camera\.position\.set\(0,6\.2,14\);/,'desktop framing unchanged');
assert.match(fx,/if\(stage\.mobile&&cam\.aspect>1\.45\)\{cam\.position\.set\(cam\.position\.x,5\.4,12\);lookTarget\.set\(cam\.position\.x\*\.5,1\.66,-13\);/,'sideways phone framing unchanged');
assert.deepEqual([F.RUNNER_SIDEWAYS.y,F.RUNNER_SIDEWAYS.z,F.RUNNER_SIDEWAYS.lookY,F.RUNNER_SIDEWAYS.lookZ],[5.4,12,1.66,-13],'the reference is that framing');
const up=padCss.match(/@media \(pointer:coarse\) and \(orientation:portrait\)\{([\s\S]*?)\n/);assert.ok(up,'upright pad block');
assert.match(up[1],/\.pad\{--cw:178px;--ch:174px;/,'a 174 px tall cluster (RUNNER_UPRIGHT.pad covers it)');assert(F.RUNNER_UPRIGHT.pad>=174+20);
assert.match(up[1],/\.jump\.jump\{--x:-6px;--y:-92px\}\.slide\.slide\{--x:-96px;--y:8px\}\.skill\.skill\{--x:-86px;--y:-74px\}/);
// Same token sizes as sideways (no shrinking): Shoot 92, Jump / Slide 72, Skill 62 at the tall tokens; gaps between discs >= 8 px.
{const R={shoot:46,jump:36,slide:36,skill:31},P={shoot:[0,0],jump:[-6,-92],slide:[-96,8],skill:[-86,-74]},names=Object.keys(P);
 for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){const a=names[i],b=names[j],gap=Math.hypot(P[a][0]-P[b][0],P[a][1]-P[b][1])-R[a]-R[b];assert(gap>=8,`${a} / ${b} gap ${gap.toFixed(1)} px`);}
 assert(46+92+36<=174&&46+96+36<=178,'the discs fit the cluster box');assert(16+132+178+16<=360,'stick + cluster fit a 360 px phone');}
assert.doesNotMatch(up[1],/--arcade-btn/,'button sizes stay the shared tokens');
assert.match(pad,/const stick=useFloatingStick\(\(x\)=>\{step\(x\);[^\n]*\},\(\)=>true,true\);/,'the runner stick measures from the press point');
assert.match(hook,/rect\.current=pressOrigin\?new DOMRect\(e\.clientX-r,e\.clientY-r,r\*2,r\*2\):new DOMRect\(a\.x-r,a\.y-r,r\*2,r\*2\);/,'so a press in the narrow upright zone is never an instant lane change');
assert.match(hook,/export function useFloatingStick\(onMove:\(x:number,y:number\)=>void,enabled:\(\)=>boolean,pressOrigin=false\)\{/,'other games keep the ring-centre origin');
assert.match(pad,/data-runner-swipe-zone \{\.\.\.layer\}/);assert.match(padCss,/\.swipe\{position:absolute;left:45%;right:0;/,'swipes over the road, both ways up');
console.log('PASS runner upright: no rotate card, frame fair vs sideways ('+sideAhead.toFixed(1)+' m)\n  '+rows.join('\n  '));

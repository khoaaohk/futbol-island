// Breakaway Run final-polish pass (Nov 10 2026, docs/arcade-aaa/runner-direction.md). Source contract for what the pass added:
// typed HUD fields instead of parsing the status line, the comic shading additions (constant-width ink line, lamp pools and
// lightning on characters, shaded hills), packed instances, the strike beat, the state juice and the audio review fixes.
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=f=>fs.readFileSync(f,'utf8');
const types=read('lib/arcade/arcadeGameTypes.ts'),hud=read('lib/arcade/runnerHud.ts'),pad=read('components/games/RunnerControls.tsx'),padCss=read('components/games/RunnerControls.module.css');
const track=read('lib/arcade/runnerTrack.ts'),game=read('lib/arcade/games/runnerGame3d.ts'),fx=read('lib/arcade/runnerFx.ts'),weather=read('lib/arcade/runnerWeather.ts'),audio=read('components/games/runnerAudio.ts');
// HUD: typed runner fields end to end; the pad no longer parses hud.detail.
for(const f of ['runnerLives','runnerMaxLives','runnerBalls','runnerMult','runnerMeters','runnerToGo','runnerNear']){assert.match(types,new RegExp(f+'\\?:'),`ArcadeHUD has ${f}`);assert.match(hud,new RegExp(f+':'),`runnerHud fills ${f}`);assert.match(pad,new RegExp('hud\\.'+f),`the pad reads ${f}`);}
assert.doesNotMatch(pad,/hud\.detail|\.match\(/,'no parsing of the status line in the pad');
// Clean UI rule kept: the flash is still the only in-play word; the new beats are drawn, not written.
for(const hook of ['data-runner-tier','data-runner-crack','data-runner-inset','data-runner-whoosh'])assert.match(pad,new RegExp(hook),`${hook} is rendered`);
assert.match(pad,/onPointerDownCapture=\{\(\)=>\{if\(goal&&skipped!==hud\.flashId\)setSkipped/,'any touch skips the strike panels');
assert.match(padCss,/@media \(prefers-reduced-motion:reduce\)\{[^}]*\}\.inset,\.whoosh,\.crack::before\{display:none\}/,'reduced motion: no inset slam, streak or red flash');
assert.match(padCss,/\.page\[data-runner-tier="3"\]\{--tier:#ffc83a;--dot:2\.9px/,'x3 changes the frame colour and the dot screen');
assert.match(padCss,/\.movement :global\(\.joystick\)>span\{[^}]*border:3\.5px solid #231a2e!important;box-shadow:3px 4px 0 #231a2e!important/,'the stick knob is an inked paper disc with a hard shadow');
// Shading: constant-width ink line, lamp pools and lightning on characters, hills shaded by their slope.
/* the shading moved to the shared comic kit (Nov 10 2026) */assert.match(read('lib/arcade/comic/shading.ts'),/float rkPx=\(1\.-rkNV\)\/max\(fwidth\(rkNV\),1e-4\)\*\.5;/,'ink outline width is measured in pixels');
assert.match(track,/if\(uInkLamp\.y>\.01\)\{float rs=uInkLamp\.x-vRbS\.y,cell=floor\(rs\/30\.\)/,'characters read the same lamp cells as the road');
assert.match(track,/rkCol=mix\(rkCol,vec3\(1\.\),uInkLamp\.z\*/,'lightning rims characters');assert.match(weather,/world\.ink\.uInkLamp\.value\.z=flick;/);
assert.match(track,/rtShade=\(\.175\+\.83\*max\(0\.,dot\(normalize\(vec3\(-hx\*sign\(vSide\),1\.,hs\)\),uSunS\)\)\)/,'hill slope decides the print band');
assert.match(track,/rkLit\*=rtShade;/);
// Heat: packed instances, chunks behind the camera skipped, cheap pick-up balls, balls out of the shadow map, packed stands, two fewer canvas textures.
assert.match(track,/function pack\(\)\{[\s\S]*?m\.count=c;/,'instance buffers are packed to the instances in use');
assert.match(track,/const first=Math\.floor\(\(d-16\)\/CHUNK\)/,'no chunk wholly behind the camera');
assert.match(game,/new T\.IcosahedronGeometry\(\.27,2\)/,'pick-up balls are 320 triangles');assert.match(game,/for\(const b of \[ball,\.\.\.runnerShots\]\)b\.traverse\(o=>\{o\.castShadow=false;\}\);/);
assert.match(fx,/stand\.mesh\.count=n;/,'stands draw only the fans present');
assert.doesNotMatch(weather,/checkerTexture/,'the chequered line is vertex colour');assert.doesNotMatch(fx,/createRadialGradient/,'the combo rings are geometry');
// Strike beat: a render hold only (rules keep their clock), skipped by input, reset and reduced motion.
assert.match(game,/stage\.render=\(\)=>\{if\(freeze>0&&runner\.lives>0\)return;draw\(\);\};/,'the freeze-frame skips draws, not time');
assert.match(game,/if\(runner\.eventKind==='goal'&&!stage\.reduced\)freeze=\.11;/);assert.match(game,/function action\(id:number\)\{freeze=0;/);assert.match(game,/function reset\(\)\{freeze=0;/);
// Wind-ups per role and the commit alarm.
assert.match(game,/if\(role==='tackler'\)\{sx=1\+\.16\*wind;sy=1-\.22\*wind;rx=-\.26\*wind;\}else if\(role==='sweeper'\)/,'each role has its own wind-up silhouette');
assert.match(game,/alert\.visible=committed;/);
// Juice scales with pace; near-miss whoosh; tier-up shake.
assert.match(fx,/const pace=clamp01\(\(s\.speed-12\.4\)\/6\.6\)/);assert.match(fx,/lineGeometry\.setDrawRange\(0,/);assert.match(fx,/whooshAge=\.32;/);assert.match(fx,/if\(!reduced\)\{trauma=Math\.min\(1,trauma\+\.3\);lineFlash=1;\}/);
// Audio review: one limiter, a gate that closes when frames stop, bounded voices that leave room for effects, disposal.
assert.match(audio,/limiter = context\.createDynamicsCompressor\(\);/);assert.match(audio,/out = limiter;/);assert.match(audio,/sfx\.connect\(out\);/);assert.match(audio,/gate\.connect\(out\);/);assert.match(audio,/music\.connect\(gate\);/);assert.doesNotMatch(audio,/(sfx|music)\.connect\(context\.destination\)/,'no bus bypasses the limiter');
assert.match(audio,/gate\.gain\.setTargetAtTime\(0, hold, 0\.06\);/,'music fades when frames stop (pause, sleep)');
assert.match(audio,/voices >= \(bus === music \? MUSIC_CAP : VOICE_CAP\)/,'the groove cannot use every voice');assert.match(game,/dispose\(\)\{runnerFx\?\.dispose\(\);runnerSoundtrack\?\.dispose\(\);stage\.dispose\(\);\}/);
console.log('runner-pass2-nov10 ok');

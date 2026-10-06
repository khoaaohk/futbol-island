// telstar-1970 full-screen experience ("The broadcast", Oct 5 2026): the case's facts reach the screen, Back is the shared
// ExperienceBack (shared, fixed position; no local NavigationButton Back), the 3D picture is lazy-loaded, sleeps and disposes, and every added fact is sourced.
// usage: node tests/museum-exp-telstar-1970.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/telstar-1970/',read=f=>fs.readFileSync(path.join(root,dir+f),'utf8');
const X=require('../lib/endgame/museum.ts');
const exp=read('Experience.tsx'),scene=read('tvScene.ts'),css=read('Experience.module.css'),card=read('TestCard.tsx'),room=read('Room.tsx');
const e=X.EXHIBITS.find(x=>x.id==='telstar-1970');

// 1. Facts: the case's three facts and its "take it to your game" line are all shown (read from the exhibit, unchanged).
{assert.equal(e.facts.length,3);
 for(const i of [0,1,2])assert.match(exp,new RegExp(`exhibit\\.facts\\[${i}\\]`),`fact ${i+1} is captioned`);
 assert.match(exp,/exhibit\.forYourGame/,'the take-it-to-your-game line is captioned');
 assert.match(e.facts[1],/32 panels were black and white/);
 // The added facts, each one tied to a cited source below.
 assert.match(exp,/star of television/);assert.match(exp,/launched in 1962/);assert.match(exp,/12 black pentagons .*20 white hexagons/);assert.match(exp,/live around the world by satellite/);
 assert.match(exp,/pretend/i,'the pretend match is labelled as such (real history vs game fiction)');
 console.log('PASS facts: 3 case facts + the game line + 3 sourced extras, pretend match labelled');}

// 2. Sources: the case's own plus the extras, shown in a Sources list with URLs.
{assert.match(exp,/exhibit\.sources/);assert.match(exp,/<summary>Sources<\/summary>/);
 for(const url of ['https://en.wikipedia.org/wiki/Telstar_1','https://www.sciencemuseum.org.uk/objects-and-stories/telstar-intelsat-and-first-global-satellite-broadcast','https://americanhistory.si.edu/collections/object/nmah_682185','https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls'])
  assert.ok(exp.includes(url),'cites '+url);
 assert.ok(e.sources.some(s=>/Adidas_Telstar/.test(s.url))&&e.sources.some(s=>/1970_FIFA_World_Cup/.test(s.url)),'case sources: Adidas Telstar and the 1970 World Cup');
 console.log('PASS sources: case sources + Telstar 1, Science Museum, Smithsonian, ball list');}

// 3. Contract: dialog root, the shared ExperienceBack (no local NavigationButton Back), Escape, 44 px controls.
{assert.match(exp,/role="dialog" aria-modal="true"/);assert.match(exp,/data-museum-experience="telstar-1970"/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/);assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/);
 assert.equal((exp.match(/<ExperienceBack /g)||[]).length,1,'exactly one Back');
 assert.doesNotMatch(exp,/NavigationButton/,'no local NavigationButton Back');assert.doesNotMatch(exp,/immediate/,'never immediate');
 assert.match(css,/\.top\{[^}]*padding-left:96px/,'the header keeps clear of the fixed Back corner');
 assert.match(exp,/e\.key==='Escape'/);
 assert.match(css,/\.root\{position:fixed;inset:0;z-index:20/);
 for(const m of css.matchAll(/(?:width|height|min-height):(\d+)px/g))if(/knob|power|pager|action/.test(css.slice(Math.max(0,m.index-120),m.index)))assert.ok(+m[1]>=44||+m[1]<20,'controls ≥ 44 px ('+m[0]+')');
 for(const sel of css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@media[^{]*\{/g,'').split('}').map(s=>s.split('{')[0].trim()).filter(s=>s&&!s.startsWith('@')&&!/^(from|to|\d+%)/.test(s)))
  for(const part of sel.split(','))assert.match(part,/\.[a-zA-Z]/,`CSS module selector "${part}" has a local class`);
 console.log('PASS contract: dialog root, shared ExperienceBack (no local Back), Escape, pure CSS module selectors');}

// 4. Heat: lazy 3D, render on demand, sleeps, hidden tab, capped resolution, disposal; reuses the gallery's exact Telstar.
{assert.match(exp,/import\('\.\/tvScene'\)/,'the 3D picture is lazy-loaded');
 assert.match(exp,/import type \{BallKind,Shot,TvScene\} from '\.\/tvScene'/,'only types are imported eagerly');
 assert.match(scene,/import \{createBallMaterial\} from '@\/lib\/museum\/wcBalls\/ballViewer'/);assert.match(scene,/wcBalls\/designs\/1970-telstar/);
 assert.match(scene,/if\(roll\|\|held\|\|spinning\|\|panning\|\|omega\.lengthSq\(\)>0\)frame=requestAnimationFrame\(step\);else last=0;/,'the loop sleeps when nothing moves');
 assert.match(scene,/document\.hidden/,'stops while the tab is hidden');assert.match(scene,/setPixelRatio\(1\)/);assert.match(scene,/560\/w/,'TV-resolution cap');
 for(const d of ['m.dispose()','pitchMat.dispose()','pitchGeo.dispose()','ballGeo.dispose()','renderer.dispose()','ro.disconnect()','cancelAnimationFrame(frame)'])assert.ok(scene.includes(d),'dispose: '+d);
 assert.match(exp,/scene\.current\?\.dispose\(\)/,'disposed on unmount');assert.match(exp,/clearTimeout/,'timers cleared on unmount');
 assert.match(css,/prefers-reduced-motion/);
 // Polish pass: the floor is measured with a ResizeObserver (no polling), the power-off collapse is a one-shot WAAPI animation
 // skipped under reduced motion, and the rolling bar / flash / lower-third are finite (iteration 1 or timed exit).
 assert.match(exp,/new ResizeObserver\(measure\)/);assert.match(exp,/ro\.disconnect\(\)/);
 assert.match(exp,/if\(reduced\|\|!el\|\|typeof el\.animate!=='function'\)\{off\(\);return;\}/,'power-off animation skipped under reduced motion');
 assert.match(css,/animation:roll \.5s linear 1/);assert.match(css,/animation:flash \.32s ease-out 1/);assert.match(css,/animation:lowerOut [^;]*forwards/);
 for(const m of css.matchAll(/animation:[^;}]*infinite/g))assert.match(m[0],/snow/,'only the tuning snow loops, and only while tuning: '+m[0]);assert.doesNotMatch(css,/infinite[^}]*beckon|beckon[^;]*infinite/,'the power-button glow does not loop forever');
 assert.doesNotMatch(exp+scene+card+room,/setInterval/,'no polling');assert.doesNotMatch(exp+scene+card+css+room,/https?:\/\/(?!en\.wikipedia|www\.sciencemuseum|www\.britannica|americanhistory)/,'no external asset requests');
 console.log('PASS heat: lazy three, on-demand loop that sleeps and disposes, capped resolution, no polling');}

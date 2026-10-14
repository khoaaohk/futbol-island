// Island Tutorial (Oct 13 2026; user: "in the island paths, change how your journey works to 'Island Tutorial' … a riso animation …
// audio … text below for people hard of hearing"). Static checks of the Paths card button, the in-card player, every scene's caption
// and voiced clip, the mute rules, reduced motion and the heat rules (no rAF/canvas/three, lazy chunk, sleeps when hidden).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),ts=require('typescript'),vm=require('node:vm');
const read=f=>fs.readFileSync(f,'utf8');
const quests=read('components/IslandQuests.tsx'),player=read('components/IslandTutorial.tsx'),art=read('components/IslandTutorialArt.tsx'),css=read('components/IslandTutorial.module.css'),journeyCss=read('components/IslandJourney.module.css');
const script=JSON.parse(read('lib/tutorial/islandTutorial.json')),timing=JSON.parse(read('lib/tutorial/islandTutorialTiming.json'));

// 1. The Paths card: "How your journey works" is gone; the same row is now the "Island Tutorial" button.
{
 assert(!/How your journey works/.test(quests)&&!/How your journey works/.test(journeyCss),'the old "How your journey works" expander is gone');
 assert(!/guideReveal|howOpen|toggleHow/.test(quests),'no leftover disclosure state');
 assert.match(quests,/<div ref=\{guideRow\} className=\{journey\.guide\}><button ref=\{tutorialButton\}[^>]*>/,'the guide row holds an "Island Tutorial" button');
 assert.match(quests,/<span className=\{journey\.ctaLabel\}>Island Tutorial<\/span>/,'the button is labelled "Island Tutorial"');
 assert.match(quests,/\{tutorial\?<IslandTutorial onClose=\{closeTutorial\}[^/]*\/>:<>/,'open, the tutorial replaces the card content (same box, not a page modal)');
 assert.match(quests,/data-tutorial=\{tutorial\|\|undefined\}/,'the card knows it holds the tutorial');
 assert.match(quests,/const closeTutorial=\(\)=>\{returnFocus\.current=true;[^}]*setTutorial\(false\);\}/,'closing flags the focus return');
 assert.match(quests,/if\(!tutorial&&returnFocus\.current\)\{returnFocus\.current=false;tutorialButton\.current\?\.focus\(/,'focus goes back to the Island Tutorial button');
 // Lazy: the tutorial is its own chunk, never a static import of the Paths panel.
 assert(!/^import .*['"]\.\/IslandTutorial['"]/m.test(quests),'IslandQuests does not import the tutorial statically');
 assert.match(quests,/const loadTutorial=\(\)=>import\('\.\/IslandTutorial'\);/);assert.match(quests,/dynamicImport\(loadTutorial,\{ssr:false\}\)/);
 // The old journey text lives on in the last chapter.
 assert(!script.scenes.some(s=>s.id==='ferry'||/Matchday/.test(s.narration)),'no Matchday section (user, Oct 13 2026)');
}
// 2. Open / close: a ≥44px × button, Escape closes (and Settings never sees the key), focus starts in the tutorial.
{
 assert.match(player,/className=\{styles\.close\} onClick=\{onClose\} aria-label="Close Island Tutorial"/,'a labelled close button');
 const close=css.match(/\.close\{[^}]*\}/)[0];assert(/width:48px/.test(close)&&/height:48px/.test(close),'the close button is 48px');
 assert.match(player,/if\(e\.key==='Escape'\)\{e\.preventDefault\(\);e\.stopPropagation\(\);onClose\(\);return;\}/,'Escape closes');
 assert.match(player,/root\.current\?\.focus\(\{preventScroll:true\}\)/,'opening moves focus into the tutorial');
 assert.match(player,/role="region" aria-label="Island Tutorial"/);
 for(const label of ['Previous scene','Next scene','Mute narration','Tutorial scenes'])assert(player.includes(label),`control: ${label}`);
 assert.match(player,/aria-label=\{status==='playing'\?'Pause':status==='finished'\?'Replay tutorial':'Play'\}/,'play / pause / replay');
 assert.match(player,/>Watch again</,'replay at the end');assert.match(player,/aria-label=\{`Scene \$\{i\+1\}: \$\{s\.headline\}`\}/,'a scene bar to jump to any scene');
 assert(!/Jump to a chapter|styles\.where/.test(player),'no chapter label or menu: the scene bar is the indicator (user, Oct 13 2026)');
}
// 3. Every scene: a caption, a headline, an existing art, and a voiced clip that matches its line.
{
 const chapters=new Set(script.chapters.map(c=>c.id)),arts=new Set([...art.matchAll(/(\w+):(\w+)[,}]/g)].map(m=>m[1]));
 assert.equal(script.chapters.length,4);for(const c of script.chapters)assert(script.scenes.some(s=>s.chapter===c.id),`chapter ${c.id} has scenes`);
 assert.deepEqual(script.chapters.map(c=>c.title),['Getting around','Earning & spending','Things to do','Your journey']);
 let total=0;const ids=new Set();
 for(const s of script.scenes){
  assert(!ids.has(s.id),`unique id ${s.id}`);ids.add(s.id);assert(chapters.has(s.chapter),`${s.id}: known chapter`);
  assert(s.narration&&s.narration.split(/\s+/).length>=10,`${s.id}: a caption`);assert(s.headline&&s.headline.length<=16,`${s.id}: a short headline`);
  assert(arts.has(s.art),`${s.id}: art "${s.art}" exists`);
  const clip=timing.scenes[s.id];assert(clip,`${s.id}: voiced`);const file=path.join('public',clip.src);
  assert(fs.existsSync(file)&&fs.statSync(file).size>5000,`${s.id}: ${file} exists`);
  assert.equal(clip.sha256,crypto.createHash('sha256').update(s.say||s.narration).digest('hex'),`${s.id}: the clip voices the current line (re-run scripts/build-tutorial-narration.py)`);
  assert(clip.duration>3&&clip.duration<20,`${s.id}: clip length`);total+=clip.duration;
  // A spoken-only variant may only spell things out for the voice; the caption keeps the same words.
  if(s.say)assert(Math.abs(s.say.split(/\s+/).length-s.narration.split(/\s+/).length)<=8,`${s.id}: say ≈ caption`);
 }
 assert(total>=100&&total<=170,`about 2–2.5 minutes of narration (${total.toFixed(1)} s)`);
 assert.equal(timing.voice,'Kokoro af_heart','the path films\' narrator');
 // Captions: always on, under the art, at least 16px.
 assert.match(player,/<div className=\{styles\.caption\} data-tutorial-caption="" aria-live="polite">\s*<p key=\{`c\$\{run\}:\$\{index\}`\}>\{scene\.narration\}<\/p>/,'the caption is always rendered');
 for(const m of css.matchAll(/\.caption p\{[^}]*font-size:(\d+)px/g))assert(Number(m[1])>=16,'caption ≥ 16px');
}
// 4. Mute: the app's settings decide (sound, volume, voice); muted scenes follow caption timing; nothing plays while muted.
{
 const store=new Map(),sandbox={module:{exports:{}},localStorage:{getItem:k=>store.has(k)?store.get(k):null},Audio:class{constructor(src){this.src=src;this.dataset={};this.played=0;}play(){this.played++;return Promise.resolve();}}};
 const sound={isSoundEnabled:()=>store.get('fi2-sound-muted')!=='true',getSoundVolume:()=>store.has('fi2-sound-volume')?Number(store.get('fi2-sound-volume')):.5};
 sandbox.require=id=>id==='@/lib/games/sound'?sound:id==='./islandTutorialTiming.json'?{default:timing}:require(id);sandbox.exports=sandbox.module.exports;
 vm.runInNewContext(ts.transpileModule(read('lib/tutorial/tutorialAudio.ts'),{compilerOptions:{module:1,target:7,esModuleInterop:false}}).outputText,sandbox);
 const {narrationOn,primeTutorialNarration,tutorialClipUrl}=sandbox.module.exports;
 assert.equal(narrationOn(),true,'default: narration on');
 const primed=primeTutorialNarration('welcome');assert(primed&&primed.played===1&&primed.src===tutorialClipUrl('welcome'),'the opening tap starts the first line (iOS gesture)');
 store.set('fi2-sound-muted','true');assert.equal(narrationOn(),false,'sound muted → narration off');assert.equal(primeTutorialNarration('welcome'),null,'…and nothing is primed');store.clear();
 store.set('fi2-sound-volume','0');assert.equal(narrationOn(),false,'volume 0 → off');store.clear();
 store.set('fi2-voice-enabled','false');assert.equal(narrationOn(),false,'voice setting off → off');store.clear();
 assert.match(player,/useState\(\(\)=>!narrationOn\(\)\)/,'the player starts muted when the settings say so');
 assert.match(player,/const voiced=Boolean\(media&&!muted&&scene\.audio&&/,'muted scenes never call play()');
 assert.match(player,/timer=setTimeout\(finishLine,Math\.max\(0,scene\.seconds-c\.elapsed\)\*1000\)/,'one timer per scene: caption timing drives muted playback');
 assert.match(player,/islandNarrationAllowed\(\)/);assert.match(player,/registerIslandNarration\(media\)/,'one narration at a time across the island');
}
// 5. Reduced motion: no loops, no transitions, static scenes with captions, still navigable.
{
 const rm=css.slice(css.lastIndexOf('@media(prefers-reduced-motion:reduce)'));
 assert.match(rm,/\.tutorial \*,\.tutorial \*::before,\.tutorial \*::after\{animation:none!important;transition:none!important\}/,'reduced motion stops every animation');
 assert.match(rm,/\.progress button>span>i\{transform:scaleX\(\.5\)\}/,'the scene bar still shows the current scene without moving');assert(!player.includes("matchMedia('(prefers-reduced-motion"),'navigation and narration do not depend on motion');
}
// 6. Heat: CSS/SVG only, no rAF or canvas, loops pause unless active, sleeps hidden / off-screen, audio freed on close.
{
 for(const [name,src] of [['IslandTutorial.tsx',player],['IslandTutorialArt.tsx',art]]){
  const code=src.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');assert(!/requestAnimationFrame|<canvas|getContext\(|from 'three'/.test(code),`${name}: no rAF, canvas or three.js`);
 }
 assert.match(css,/\.tutorial\[data-active=false\] \*,[^{]*\{animation-play-state:paused!important\}/,'loops pause unless playing, visible and on-screen');
 assert.match(player,/data-active=\{active\}/);assert.match(player,/const active=status==='playing'&&awake;/);
 assert.match(player,/new IntersectionObserver/);assert.match(player,/document\.addEventListener\('visibilitychange',update\)/);
 assert.match(player,/media\.pause\(\);delete media\.dataset\.scene;media\.removeAttribute\('src'\);media\.load\(\);/,'close stops and frees the audio');
 assert(!/backdrop-filter/.test(css),'no blur');
 const loops=[...css.matchAll(/@keyframes (\w+)\{[^@]*?\}\}/g)].map(m=>m[0]);for(const k of loops)assert(!/(?:left|top|width|height|filter|box-shadow)\s*:/.test(k.replace(/^@keyframes \w+\{/,'')),`compositor-only keyframes: ${k.slice(0,40)}`);
}
// 7. Shared height token: closed and open use the exact same min-height rules (no separate value for the open tutorial), so
//    opening/closing never resizes the card; the closed card's spare height goes above the button row, not under it.
{
 const bands=[...journeyCss.matchAll(/\.arrival\.arrival\{min-height:([^}]+)\}/g)];
 assert(bands.length>=4,`a min-height token for every breakpoint band (found ${bands.length})`);
 assert(!/\.arrival\[data-tutorial\][^}]*\{[^}]*min-height/.test(journeyCss),'no separate min-height just for the open tutorial: closed and open share the same token');
 assert.match(journeyCss,/\.arrival\{align-items:center;grid-template-rows:minmax\(0,1fr\) auto\}/,'closed: spare height centres the headline+art row; the button row stays pinned to the bottom padding');
}
// 8. Tablet+desktop (≥601px) tutorial layout: caption matches the art's height, the scene bar is its own full-width row above the
//    full-width, centred controls row.
{
 const wide=css.slice(css.indexOf('@media(min-width:601px)'));
 assert.match(wide,/grid-template-areas:'top top' 'caption stage' 'progress progress' 'controls controls'/,'scene bar: a full-width row above the controls row; caption beside the art');
 assert.match(wide,/\.caption\{grid-area:caption;align-self:stretch/,'the caption box stretches to match the art\'s height');
 assert.match(wide,/\.stage\{grid-area:stage;align-self:stretch/,'the art pane also fills the row, so both edges line up even if the caption needs more room');
 assert.match(wide,/\.controls\{grid-area:controls;justify-content:center\}/,'controls stay centred, full width');
 assert.match(wide,/\.caption p\{font-size:18px\}/,'desktop captions ≥18px');
}
// 9. The "Island Tutorial" CTA: noticeable, animated, heat-safe, and does not change the card's height.
{
 assert.match(journeyCss,/\.ctaIcon\{[^}]*background:var\(--btn-gold-bright/,'the ▸ sits in a filled gold circle (the app\'s button tokens)');
 assert.match(journeyCss,/\.ctaPulse \.ctaIcon\{animation:ctaPop [^}]* 3\}/,'the icon pop plays a finite 3 cycles');
 assert.match(journeyCss,/\.ctaPulse \.ctaIcon::after\{animation:ctaRing [^}]* 3\}/,'the ring ripple plays a finite 3 cycles');
 assert.match(journeyCss,/\.ctaPulse \.ctaLabel\{animation:ctaNudge [^}]* 3\}/,'the label nudges a finite 3 cycles');
 for(const m of journeyCss.matchAll(/@keyframes (cta\w+)\{([^@]*?)\}\}/g))assert(!/(?:left|top|width|height|filter|box-shadow)\s*:/.test(m[2]),`compositor-only: ${m[1]}`);
 assert.match(journeyCss,/\.guide\[data-page-hidden=true\][^{]*\{animation-play-state:paused\}/,'the CTA animation pauses while the tab is hidden');
 assert.match(journeyCss,/@media\(prefers-reduced-motion:reduce\)\{\.ctaPulse[^}]*animation:none!important/,'reduced motion: no CTA animation, just the stronger static styling');
 assert.match(journeyCss,/min-height:var\(--btn-height,44px\)/,'the button keeps a ≥44px tap target');
 assert.match(quests,/new IntersectionObserver\(entries=>\{\s*if\(entries\[0\]\?\.isIntersecting&&!ctaSeen\.current\)/,'the CTA plays once the row scrolls into view');
 assert.match(quests,/onPointerEnter=\{\(\)=>\{preloadTutorial\(\);bumpCta\(\);\}\}/,'hovering re-triggers the CTA');
 assert.match(quests,/node\.dataset\.pageHidden=String\(document\.hidden\)/,'the row tracks page visibility locally, not with global state');
}
console.log(`PASS island tutorial: button, open/close + focus, ${script.scenes.length} scenes with captions and voiced clips, mute rules, reduced motion, heat, shared height token, desktop caption/art/scene-bar layout, CTA animation`);

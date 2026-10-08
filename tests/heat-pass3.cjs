// Heat audit pass 3 (docs/performance-guide.md): while the child steers, nothing but the 30 fps island may produce compositor frames,
// no backdrop blur sits over a moving canvas, hidden matches do no rig work and menus put the island to sleep.
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const load=(path,extra={})=>{const m={exports:{}};vm.runInNewContext(ts.transpileModule(read(path),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText,{module:m,exports:m.exports,require:n=>extra[n]??{},...extra.globals});return m.exports;};

// 1. useSceneryRest `hold`: held gameplay input rests the art (after settle) instead of waking it; the last release wakes it.
{
  let now=0;const timers=new Map();let nextId=1;
  const setTimeout_=(f,ms)=>{const id=nextId++;timers.set(id,{f,at:now+ms});return id;},clearTimeout_=id=>{timers.delete(id);};
  const advance=ms=>{const end=now+ms;for(;;){let best=null;for(const [id,t] of timers)if(t.at<=end&&(!best||t.at<best[1].at))best=[id,t];if(!best)break;timers.delete(best[0]);now=best[1].at;best[1].f();}now=end;};
  const listeners=new Map();const window={addEventListener:(t,f)=>{(listeners.get(t)??listeners.set(t,new Set()).get(t)).add(f);},removeEventListener:(t,f)=>listeners.get(t)?.delete(f)};
  const fire=(type,props={})=>{const e={type,target:props.target??null,...props};for(const f of listeners.get(type)??[])f(e);};
  const classes=new Set(),el={classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)},dataset:{},contains:()=>false};
  let cleanup=null,settleCalls=0;
  const {useSceneryRest,SCENERY_AWAKE_MS}=load('lib/sceneryRest.ts',{react:{useEffect:f=>{cleanup=f();}},globals:{window,performance:{now:()=>now},setTimeout:setTimeout_,clearTimeout:clearTimeout_,Element:class{},document:{activeElement:null}}});
  const joystick={closest:()=>null},hold=e=>e.type==='keydown'?e.key==='ArrowUp':e.target===joystick;
  useSceneryRest({current:el},'rest',()=>{settleCalls++;return 0;},hold);
  assert.equal(el.dataset.scenery,'live');
  fire('pointerdown',{pointerId:1,target:joystick});assert.equal(el.dataset.scenery,'rest','a held joystick rests the loops at once (clean frame)');
  for(let i=0;i<50;i++){advance(16);fire('pointermove',{pointerId:1,target:joystick});}
  assert.equal(el.dataset.scenery,'rest','joystick moves never wake the loops');assert.equal(settleCalls,1,'moves do not re-query the settle frame');
  fire('pointerdown',{pointerId:2,target:joystick});fire('pointerup',{pointerId:2});assert.equal(el.dataset.scenery,'rest','a second held pointer let go while steering keeps the rest');
  fire('pointerup',{pointerId:1});assert.equal(el.dataset.scenery,'rest','heat pass 4: releasing gameplay input leaves the loops resting (no animation restart per tap)');
  for(let i=0;i<5;i++){fire('pointerdown',{pointerId:9,target:joystick});fire('pointerup',{pointerId:9});}assert.equal(el.dataset.scenery,'rest','repeated gameplay taps never restart the loops');
  fire('keydown',{key:'ArrowUp'});fire('keydown',{key:'ArrowUp'});assert.equal(el.dataset.scenery,'rest');fire('keyup',{key:'ArrowUp'});assert.equal(el.dataset.scenery,'rest','a held movement key behaves like the joystick');
  fire('pointerdown',{pointerId:3,target:{closest:()=>null}});assert.equal(el.dataset.scenery,'live','other taps still wake the loops');
  advance(SCENERY_AWAKE_MS-10);assert.equal(el.dataset.scenery,'live');advance(20);assert.equal(el.dataset.scenery,'rest','…and they rest again after the usual awake time');
  fire('pointerdown',{pointerId:4,target:joystick});fire('blur');fire('pointermove',{pointerId:4,target:{}});assert.equal(el.dataset.scenery,'live','window blur drops stale holds (a later move of that pointer is ordinary input)');
  cleanup();assert.equal([...listeners.values()].reduce((n,s)=>n+s.size,0),0,'all listeners removed');
  // Without `hold` the old behaviour is unchanged: any pointer move wakes.
  classes.clear();useSceneryRest({current:el},'rest');advance(SCENERY_AWAKE_MS+1);assert.equal(el.dataset.scenery,'rest');fire('pointermove',{pointerId:1,target:joystick});assert.equal(el.dataset.scenery,'live');cleanup();
}
// 2. The HUD passes the gameplay hold, and its selector names Town's real control containers.
{
  const settings=read('components/IslandSettings.tsx'),town=read('components/Town.tsx');
  assert.match(settings,/useSceneryRest\(triggers,styles\.hudRest,hudSettle,hudHold\)/);
  const selector=settings.match(/HUD_HOLD_SELECTOR='([^']+)'/)[1].split(',');
  for(const s of selector)assert(town.includes(`className="${s.slice(1)}"`),`Town has no ${s} control`);
  for(const k of ["'w'","'arrowup'","' '"])assert(settings.includes(k),`hold key ${k}`);
}
// 3. The minimap and joystick thumb move on the island's rendered frames, never on a CSS transition or per touch event.
{
  const {createPositionStore}=load('lib/town/positionStore.ts');const store=createPositionStore({x:0,z:0});const seen=[];
  const off=store.subscribeFrame((x,z)=>seen.push([x,z]));store.frame(1,2);off();store.frame(3,4);assert.deepEqual(seen,[[1,2]]);
  const town=read('components/Town.tsx'),overview=read('components/IslandOverview.tsx'),moving=read('components/MovingIslandMap.tsx');
  assert.match(town,/renderer\.render\(scene,camera\);renderStats\.rendered\+\+;(heat\.afterRender\([^;]*\);)?positionStore\.frame\(location\.x,location\.z\);(emitIslandFrame\(now\);)?islandFrameAt\.current=performance\.now\(\);if\(stickPaint\.current\)\{paintJoystick\(/,'minimap frame + coalesced thumb paint right after the island render');
  assert.match(town,/const setStick=\(\{x,y\}:\{x:number;y:number\}\)=>\{if\(x===0&&y===0\|\|performance\.now\(\)-islandFrameAt\.current>100\)\{stickPaint\.current=null;paintJoystick\(/,'thumb resets / sleeping island paint at once');
  assert.match(moving,/frames=\{props\.active===false\?undefined:store\.subscribeFrame\}/);
  {const i=overview.indexOf('style={frames?{'),j=overview.indexOf("transition:'none'}:{",i),branch=overview.slice(i,j);assert(i>0&&j>i&&!branch.includes('transform'),'frame-driven layer has no transition and React leaves its transform alone');}
  assert.match(overview,/a\.frames===b\.frames/);
}
// 4. No backdrop blur over a moving canvas: the transcript panel (over the live 30 fps match) is solid, and every remaining
// backdrop-filter is on a known surface that only appears while the island (or its game) is paused or not drawing.
{
  const panel=read('components/FieldTranscript.module.css').match(/\.panel\{[^}]*\}/)[0];
  assert(!/backdrop-filter:\s*blur/.test(panel),'FieldTranscript panel must not blur the live match');
  const allowed={'globals.css':6,'Arcade.module.css':1,'CharacterCustomizer.module.css':3,'CoachesCentre.module.css':1,'IslandJourney.module.css':1,'IslandMapFrame.module.css':0,'IslandSettings.module.css':4,'IslandStore.module.css':1,'IslandTravelMap.module.css':2,'NpcConversation.module.css':3,'PositionGuide.module.css':1,'BreakawayRun.module.css':4,'SoccerPinballGame.module.css':1,'SoccerTennisGame.module.css':1};
  const files=['app/globals.css',...fs.readdirSync('components').filter(f=>f.endsWith('.css')).map(f=>'components/'+f),...fs.readdirSync('components/games').filter(f=>f.endsWith('.css')).map(f=>'components/games/'+f)];
  for(const f of files){const n=[...read(f).matchAll(/[^{}]*\{[^{}]*backdrop-filter\s*:\s*(?!none)[^;}]*/g)].length,name=f.split('/').pop();
    assert(n<=(allowed[name]??0),`${f}: ${n} backdrop-filter rules (allowed ${allowed[name]??0}). A new blur over the moving island costs a re-blur every frame on iOS: use a solid or semi-opaque background, or only blur a paused view.`);}
}
// 5. Hidden matches do no rig work; menus put the island to sleep.
{
  const runtime=read('lib/town/fieldRuntime.ts'),town=read('components/Town.tsx');
  const skip=runtime.indexOf('e.root.visible=visible;'),skipLine=runtime.slice(skip,runtime.indexOf('\n',skip));
  // QA11: strip a trailing // comment first, so a skip that got commented out does not count.
  const skipCode=skipLine.replace(/\/\/.*$/,'');
  assert(/if\(!visible\)continue;/.test(skipCode),'offscreen fields leave the loop before any rig is created or posed (the skip must be live code, not inside a // comment)');
  assert(skip<runtime.indexOf('createPlayer(token.id')&&skip<runtime.indexOf('rig.update(px,pz'),'rig creation/posing comes after the visibility skip');
  assert.match(runtime,/const matchDt=e\.clock\.take\(dt,immediate,/,'distant hidden matches step on the throttled match clock');
  for(const menu of ['customizerOpen','storeOpen','settingsOpen','cardOfferOpen','conversationOpen'])assert(new RegExp(`settingsRef\\.current=[^;]*\\b${menu}\\b`).test(town),`${menu} pauses the island`);
  assert.match(town,/if\(now-idleSince>idleGrace\)\{[^}]*cancelAnimationFrame\(frame\);loopSleeping=true;return;\}/,'a paused island stops requesting frames');
}
// 6. Quality-gated trade-offs that were evaluated and rejected as visible (guide, "Quality-gated trade-offs"): keep them rejected.
{
  assert.match(read('lib/graphics/quality.ts'),/shadowSize:\s*2048/,'1024² shadows showed acne and soft edges in same-frame captures: keep 2048²');
  const cap=read('lib/town/frameCap.ts');assert.match(cap,/export const PHONE_FRAME_MS = 1000 \/ 30;/);assert(!/1000 \/ 20/.test(cap),'no 20 fps idle tier: every island view has visible motion (player idle/hover at minimum)');
}
// 7. Overnight heat audit (Sep 30 2026, docs/performance-guide.md).
{
  const town=read('components/Town.tsx'),field=read('components/FieldLearning.tsx'),pickerCss=read('components/PlaysPicker.module.css');
  // F1: the full-screen, opaque Choose plays sheet sleeps the island like a menu, with no blur under it.
  assert(/settingsRef\.current=[^;]*\bplaysPickerOpen\b/.test(town),'the Choose plays sheet pauses the island (settingsRef)');
  assert.match(town,/<FieldLearning [^\n]*onPickerChange=\{setPlaysPickerOpen\}/,'Town hears the picker');
  assert.match(field,/useEffect\(\(\)=>\{pickerCallback\.current\?\.\(pickerOpen\);\},\[pickerOpen\]\);/,'FieldLearning reports every open/close');
  assert.match(field,/useEffect\(\(\)=>\(\)=>\{pickerCallback\.current\?\.\(false\);\},\[\]\);/,'…and clears it on unmount (a lesson launch or Done never leaves the island asleep)');
  assert.match(pickerCss,/\.dialog\.dialog\.dialog::backdrop\{backdrop-filter:none;-webkit-backdrop-filter:none\}/,'no blur under the opaque sheet');
  const tint=pickerCss.match(/@keyframes playsTintIn\{[^\n]*\}\}/);assert(tint&&!/backdrop-filter/.test(tint[0]),'its fade-in animates the tint only (the shared backdropIn would hold blur(3px) while open)');
  assert.match(pickerCss,/\.dialog\.dialog\.dialog\[open\]::backdrop\{animation-name:playsTintIn\}/);
  // F2: field cards write disabled/tabindex only on change.
  assert.match(town,/const setCardInactive=\(button:HTMLButtonElement\)=>\{if\(!button\.disabled\)button\.disabled=true;if\(button\.tabIndex!==-1\)button\.tabIndex=-1;\};/);
  assert(!/button\.disabled=true;button\.tabIndex=-1;/.test(town),'no unconditional per-frame disabled/tabindex writes');
  // F10: no matchMedia per frame in the learning view.
  assert(!/learningView\.update\([^\n]*matchMedia/.test(town),'the learning view uses the cached coarse flag');
  // F3: the closed travel map keeps its last position and a stable onSelect, behind memo.
  const moving=read('components/MovingIslandMap.tsx');
  assert.match(moving,/const TravelMap=memo\(IslandTravelMap\);/);assert.match(moving,/const shown=useRef\(live\);if\(props\.open\)shown\.current=live;/);
  assert.match(moving,/<TravelMap \{\.\.\.props\} onSelect=\{select\} position=\{shown\.current\}\/>/);
  assert.match(read('components/IslandOverview.tsx'),/if\(!mounted\)return null;/,'IslandOverview keeps its client-only mounted gate');
  // F4: closed dialog hosts are memoized with stable callbacks.
  for(const host of ['IslandSettings','Museum','FerryPreview'])assert.match(town,new RegExp(`\\b${host}=stableMemo\\(${host}Host\\)`),`${host} is memoized`);
  // Lazy-load pass (Oct 7 2026): these hosts load on first use and are memoized around their next/dynamic wrapper.
  for(const host of ['CharacterCustomizer','CoachesCentre','IslandOnboarding','NpcConversation'])assert.match(town,new RegExp(`\\b${host}=stableMemo\\(dynamic\\(\\(\\)=>import\\('\\./${host}'\\),\\{ssr:false\\}\\)\\)`),`${host} is memoized (lazy)`);
  assert.match(town,/const PositionGuide=stableMemo\(dynamic\(/);
  // stableMemo itself: data props pass through, callbacks become one stable wrapper per prop that calls the latest function.
  {const refs=[];let i=0,memoArg=null;const fakeReact={memo:c=>{memoArg=c;return {memoOf:c};},useRef:v=>{const k=i++;return refs[k]??(refs[k]={current:v});},createElement:(type,props)=>({type,props})};
   const {stableMemo}=load('lib/ui/stableMemo.ts',{react:fakeReact});const Host=()=>null,Wrapped=stableMemo(Host);assert.equal(memoArg,Host);
   const calls=[];const render=props=>{i=0;return Wrapped(props);};
   const a=render({open:false,value:1,onClose:()=>calls.push('a')}),b=render({open:false,value:1,onClose:()=>calls.push('b')});
   assert.deepEqual(a.type,{memoOf:Host});assert.equal(a.props.onClose,b.props.onClose,'a new inline callback keeps the same wrapper (memo can bail out)');
   assert.equal(a.props.open,b.props.open);assert.equal(a.props.value,b.props.value);
   a.props.onClose();assert.deepEqual(calls,['b'],'the wrapper calls the latest callback');
   const c=render({open:true,value:1,onClose:()=>calls.push('c')});assert.equal(c.props.open,true,'data changes reach the host');c.props.onClose();assert.deepEqual(calls,['b','c']);
   const d=render({open:true,value:1});assert.equal(d.props.onClose,undefined,'an absent callback stays absent');}
  // F6: store previews skip baked ball pictures and render over idle time, publishing one complete map.
  const previews=read('components/StorePreviews.tsx');
  assert.match(previews,/STORE_ITEMS\.filter\(item=>onlyItem\?item\.id===onlyItem:bake\|\|item\.category!=='ball'\|\|!vendingBallPicture\(item\.id\)\)/);
  assert.match(previews,/requestIdleCallback\(deadline=>slice\(/);assert.match(previews,/first\?400:30\)/,'Safari fallback: 400 ms, then short slices');
  assert.match(previews,/dispose\(\);setPreviews\(result\);/,'one complete map (VendingMachine/Backpack cache the first non-empty result)');
  assert.match(read('scripts/capture-vending-products.cjs'),/window\.__fi2BakeBallPictures=true/,'the bake script still gets ball snapshots');
  // Konbini door prompt: half-pixel rounding, written only on change.
  assert.match(read('components/KonbiniRoom.tsx'),/if\(b\.style\.left!==l\)b\.style\.left=l;if\(b\.style\.top!==t\)b\.style\.top=t;if\(b\.style\.visibility!==v\)b\.style\.visibility=v;/);
}
console.log('PASS heat pass 3+4: HUD rests while steering and stays resting after gameplay taps, minimap/thumb on island frames, no blur over moving canvases, hidden matches skip rigs, menus sleep (incl. Choose plays), closed dialogs memoized');

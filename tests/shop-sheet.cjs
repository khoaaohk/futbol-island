// Kit Shop studios · the resizable phone sheet + stage fit (Oct 14 2026, user: "for mobile, everything is so tight, can we resize
// and change the heights of the bottom section. when resizing have the top portion scale to position the ball better and show
// more?"). Pure logic (lib/shop/studioSheet.ts): snap heights, tap cycle, keyboard steps, drag settle, persistence (try/catch),
// the stage's visible box and the camera fit. Static wiring: the one shared hook + handle in StudioControls, used by all three
// studios and their scenes; the handle's a11y; the desktop (≥ 900px) layout untouched; one cream Save button everywhere; one
// shared section-title size. Browser (optional): SHEET_LAB_URL=http://localhost:PORT runs the three snaps in /shop-lab/* at
// 390×844 (handle tap/keys/drag, persistence, the model fully inside the visible box, 0 rAF once settled) and checks 1440×900.
// usage: node tests/shop-sheet.cjs   |   SHEET_LAB_URL=http://localhost:8178 node tests/shop-sheet.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const S=require('../lib/shop/studioSheet.ts');

// 1. Snap heights: ≈ 34 / 50 / 78% on a 390×844 phone, always ordered, the stage never squeezed out on short screens.
{const h=S.snapHeights(844);
 assert.deepEqual(S.SHEET_SNAPS,['compact','default','tall']);
 assert.ok(Math.abs(h.compact/844-.34)<.01&&Math.abs(h.default/844-.5)<.01&&Math.abs(h.tall/844-.78)<.01,JSON.stringify(h));
 for(const vh of [480,568,640,667,700,740,812,844,915,932,1100]){const x=S.snapHeights(vh);
  assert.ok(x.compact<x.default&&x.default<x.tall,vh+': ordered '+JSON.stringify(x));
  assert.ok(x.compact>=S.SHEET_MIN_PX,vh+': compact still holds the pills, a peek of content and Save/Buy');
  assert.ok(vh-S.HEADER_PX-x.tall>=Math.min(S.STAGE_MIN_PX,vh*.15)-1,vh+': tall leaves stage above it');}
 console.log('PASS snaps: compact %d / default %d / tall %d px on 844 (%s), ordered and stage-safe from 480 to 1100px tall',h.compact,h.default,h.tall,
  ['compact','default','tall'].map(k=>Math.round(h[k]/8.44)+'%').join(' / '));}

// 2. Tap cycles, keyboard steps clamp, a drag settles by position + flick, and rubber-bands only a little past the ends.
{assert.equal(S.nextSnap('compact'),'default');assert.equal(S.nextSnap('default'),'tall');assert.equal(S.nextSnap('tall'),'compact');
 assert.equal(S.stepSnap('compact',1),'default');assert.equal(S.stepSnap('tall',1),'tall');assert.equal(S.stepSnap('default',-1),'compact');assert.equal(S.stepSnap('compact',-1),'compact');
 const h=S.snapHeights(844);
 assert.equal(S.settleSnap(h,h.compact+20),'compact');assert.equal(S.settleSnap(h,h.default-30),'default');assert.equal(S.settleSnap(h,h.tall-50),'tall');
 assert.equal(S.settleSnap(h,h.default+20,1.2),'tall','a quick upward flick goes on to tall');
 assert.equal(S.settleSnap(h,h.default-20,-1.2),'compact','a quick downward flick drops to compact');
 assert.equal(S.settleSnap(h,h.default,99),'tall','velocity is clamped, not wild');
 assert.ok(S.clampDrag(h,0)>=h.compact-28&&S.clampDrag(h,5000)<=h.tall+20);
 console.log('PASS gestures: tap cycles compact → default → tall → compact, Up/Down clamp at the ends, drag settles by position + flick');}

// 3. Persistence: one key per device, junk → default, blocked storage never throws.
{const mem={};const store={getItem:k=>k in mem?mem[k]:null,setItem:(k,v)=>{mem[k]=String(v);}};
 assert.equal(S.SHEET_KEY,'fi2-studio-sheet-v1');
 assert.equal(S.loadSnap(store),'default','nothing saved → default');
 S.saveSnap('tall',store);assert.equal(mem['fi2-studio-sheet-v1'],'tall');assert.equal(S.loadSnap(store),'tall');
 mem['fi2-studio-sheet-v1']='huge';assert.equal(S.loadSnap(store),'default','junk → default');
 const boom={getItem(){throw new Error('SecurityError');},setItem(){throw new Error('QuotaExceeded');}};
 assert.doesNotThrow(()=>S.saveSnap('compact',boom));assert.equal(S.loadSnap(boom),'default');
 assert.equal(S.loadSnap(null),'default');assert.doesNotThrow(()=>S.saveSnap('tall',null));
 console.log('PASS persistence: fi2-studio-sheet-v1, junk → default, private-mode storage errors swallowed');}

// 4. The stage's visible box + the camera fit: the model is centred between the controls and the sheet, as large as fits.
{const host={top:68,bottom:600,height:532},icons={top:80,bottom:124,height:44},chips={top:540,bottom:580,height:40},sheet={top:578,bottom:844,height:266};
 const ins=S.stageInsets(host,[icons],[chips,sheet]);
 assert.equal(ins.top,124-68+10);assert.equal(ins.bottom,600-(540-10));
 assert.deepEqual(S.stageInsets(host,[{top:0,bottom:0,height:0}],[]),{top:0,bottom:0},'hidden controls are ignored');
 const tight=S.stageInsets({top:68,bottom:200,height:132},[{top:80,bottom:190,height:110}],[{top:150,bottom:844,height:694}]);
 assert.ok(132-tight.top-tight.bottom>=132*.36-1,'a tall sheet + toggles still leaves ≥ 36% of the canvas: '+JSON.stringify(tight));
 assert.equal(S.insetShift({top:60,bottom:20}),20);
 // the fit: a unit ball at the fitted distance spans ≤ fillW of the width and ≤ fillH of the visible height, and touches one
 const fov=30,t=Math.tan(fov*Math.PI/360);
 for(const [w,h,i] of [[390,532,ins],[390,700,{top:66,bottom:44}],[390,140,{top:30,bottom:20}],[390,300,{top:0,bottom:0}]]){
  const d=S.fitDistance({fov,w,h,insets:i,halfW:1,halfH:1,fillW:.8,fillH:.78}),rpx=h/2/(t*d),vis=h-i.top-i.bottom;
  assert.ok(2*rpx<=.8*w+.5&&2*rpx<=.78*vis+.5,`${w}×${h}: fits (${(2*rpx).toFixed(1)}px)`);
  assert.ok(Math.abs(2*rpx-.8*w)<.5||Math.abs(2*rpx-.78*vis)<.5,`${w}×${h}: as large as fits`);}
 // compact (a big stage) is noticeably bigger than the old fixed fit (radius 0.31 × width = 242px across on a 390 phone)
 const big=S.fitDistance({fov,w:390,h:520,insets:{top:66,bottom:44},halfW:1,halfH:1,fillW:.8,fillH:.78});
 assert.ok(2*(520/2/(t*big))>242*1.2,'compact: the ball is ≥ 20% bigger than before');
 // applyInsetOffset: an off-axis frustum moving the picture down by the shift; none → cleared
 const calls=[];const cam={setViewOffset:(...a)=>calls.push(['set',...a]),clearViewOffset:()=>calls.push(['clear']),updateProjectionMatrix:()=>calls.push(['upd'])};
 S.applyInsetOffset(cam,390,500,{top:60,bottom:20});S.applyInsetOffset(cam,390,500,null);S.applyInsetOffset(cam,390,500,{top:30,bottom:30});
 assert.deepEqual(calls,[['set',390,500,0,-20,390,500],['upd'],['clear'],['upd'],['clear'],['upd']]);
 console.log('PASS fit: visible box below the icon row / above the chips + sheet, ≥ 36% kept, model as large as fits and centred by a view offset');}

// 5. Static wiring: one shared hook + handle, used by all three studios; every scene fits from the insets; a11y; heat.
{const ctl=read('components/shop/StudioControls.tsx'),css=read('components/shop/StudioControls.module.css');
 assert.match(ctl,/export function useStudioSheet\(/);assert.match(ctl,/export function StudioSheetHandle\(/);
 assert.match(ctl,/aria-label="Resize panel"/);assert.match(ctl,/aria-valuetext=\{SHEET_LABEL\[sheet\.snap\]\}/);assert.match(ctl,/<button type="button" role="slider"/);
 assert.match(ctl,/k==='ArrowUp'[\s\S]{0,60}stepSnap\(snap,1\)[\s\S]{0,80}k==='ArrowDown'[\s\S]{0,60}stepSnap\(snap,-1\)/,'Up = taller, Down = shorter');
 assert.match(ctl,/e\.preventDefault\(\);e\.stopPropagation\(\)/,'arrow keys on the handle never also turn the model');
 assert.match(ctl,/settleTo\(nextSnap\(snap\)\)/,'a tap cycles the snaps');
 assert.match(ctl,/loadSnap\(\)/);assert.match(ctl,/saveSnap\(s\)/);
 assert.match(ctl,/el\.style\.height=`\$\{next\}px`/,'a drag writes the height straight to the element (no React render per move)');
 assert.match(ctl,/data-studio-top=""/);assert.match(ctl,/data-studio-bottom=""/);
 assert.match(css,/\.sheetHandle\{display:none\}/,'no handle on desktop');
 assert.match(css,/@media\(max-width:899px\),\(max-height:480px\) and \(orientation:landscape\),\(max-device-width:480px\)\{[\s\S]*?\.sheetResizable\{transition:height \.22s/,'~220ms snap ease, phones only (landscape phones too, lib/ui/phoneLayout.ts)');
 assert.equal(S.SHEET_PHONE_QUERY,'(max-width:899px),(max-height:480px) and (orientation:landscape),(max-device-width:480px)','the studio sheet uses the shared phone predicate (Pro Max 932 x 430 landscape gets the sheet)');
 assert.match(css,/\.sheetResizable\[data-sheet-dragging\]\{transition:none\}/);
 assert.match(css,/prefers-reduced-motion:reduce\)\{\s*\.sheetResizable,\.sheetHandle::before\{transition:none!important\}/);
 assert.match(css,/\.sheetHandle\{[^}]*height:44px[^}]*touch-action:none/,'a 44px hit area that never scrolls the page');
 assert.match(ctl,/style:phone\?\{height:`\$\{heights\[snap\]\}px`\}:undefined/,'desktop gets no inline height');
 const studios=[['Ball','components/shop/BallStudio.tsx','components/shop/BallStudio.module.css','lib/shop/ballStage.ts'],
  ['Boot','components/shop/BootStudio.tsx','components/shop/BootStudio.module.css','lib/shop/bootScene.ts'],
  ['Jersey','components/shop/JerseyStudio.tsx','components/shop/JerseyStudio.module.css','components/shop/jerseyScene.ts']];
 for(const [name,tsx,cssP,scene] of studios){const t=read(tsx),c=read(cssP),sc=read(scene);
  assert.match(t,/import\s*\{[^}]*useStudioSheet[^}]*\}\s*from '\.\/StudioControls'/,name+': uses the shared hook');
  assert.match(t,/<StudioSheetHandle sheet=\{\w+\}\/>\s*<StudioSteps/,name+': the handle sits right above the shared step pills');
  assert.match(t,/\.sheetClass\}`\} \{\.\.\.\w+\.sheetProps\}/,name+': the sheet takes the shared height + transition');
  assert.match(t,/setInsets\(i\)/,name+': the sheet\'s insets drive the scene');assert.match(t,/setInsets\(insetsRef\.current\)/,name+': a late-loading scene gets the current insets');
  assert.match(sc,/setInsets\(i\)\{if\((disposed\|\|)?sameInsets\(i,insets\)\)return;/,name+' scene: an unchanged box costs nothing');
  assert.match(sc,/fitDistance\(\{fov:camera\.fov,w,h,insets,/,name+' scene: fits the visible box');assert.match(sc,/applyInsetOffset\(camera,w,h,insets\)/,name+' scene: centres it by a view offset');
  assert.ok(!/\.grab\{|\.sheet::before\{content/.test(c),name+': the old decorative grab bar is gone');
  assert.ok(!/data-step=['"]?draw['"]?\]?\s*\.sheet\{height|\[data-step='draw'\]\{--sheet-h/.test(c),name+': no per-step phone height fighting the snap');
  assert.match(t,/studioSectionTitle/,name+': section titles use the shared size');}
 // render on demand: the inset change asks for ONE frame, no new loops
 assert.match(read('lib/shop/ballStage.ts'),/setInsets\(i\)\{[\s\S]{0,90}?placeCamera\(\);invalidate\(\);\}/,'Ball: one frame per box change');
 assert.match(read('lib/shop/bootScene.ts'),/setInsets\(i\)\{[\s\S]{0,90}?fit\(\);invalidate\(\);\}/,'Boot: one frame per box change');
 assert.match(read('components/shop/jerseyScene.ts'),/setInsets\(i\)\{[\s\S]{0,110}?fit\(\);if\(flatOn\)\{flatLayout\(\);flatDraw\(null\);\}request\(\);\}/,'Jersey: one frame, and the flat template re-lays out too');
 assert.match(read('components/shop/jerseyScene.ts'),/insets\?`\$\{insets\.top\},\$\{insets\.bottom\}`:''/,'Jersey: the GPU pick buffer is redone when the box moves');
 console.log('PASS wiring: one hook + handle in StudioControls, used by Ball, Boot and Jersey; scenes fit from the insets on demand; a11y + reduced motion');}

// 6. Desktop (≥ 900px) unchanged; one cream Save; one section-title size on phones.
{const ball=read('components/shop/BallStudio.module.css'),boot=read('components/shop/BootStudio.module.css'),jer=read('components/shop/JerseyStudio.module.css'),ctl=read('components/shop/StudioControls.module.css');
 assert.match(ball,/@media\(min-width:900px\) and \(min-height:481px\) and \(min-device-width:481px\),\(min-width:900px\) and \(orientation:portrait\) and \(min-device-width:481px\)\{\s*\.root\{grid-template-columns:minmax\(0,1fr\) 474px;grid-template-rows:auto minmax\(0,1fr\)\}/);
 assert.match(ball,/\.sheet\{width:auto;min-width:0;height:auto;margin:20px 20px 20px 14px/);
 assert.match(boot,/\.studio\{grid-template-columns:minmax\(0,1fr\) 488px;grid-template-rows:auto minmax\(0,1fr\)\}/);assert.match(boot,/\.sheet\{height:auto\}/);
 assert.match(jer,/\.sheet\{grid-column:2;grid-row:2;height:auto;margin:20px 20px 20px 14px/);
 for(const s of ['ballStage','bootScene'])assert.match(read('lib/shop/'+s+'.ts'),/insets\?fitDistance\(/,s+': without insets (desktop) the legacy fit is kept as it was');
 assert.match(read('lib/shop/ballStage.ts'),/:1\/\(t\*\(w>=h\?\.3:\.31\*w\/h\)\*2\)\)\/zoom/,'Ball: the desktop fit is byte-for-byte the old one');
 assert.match(read('lib/shop/bootScene.ts'),/:Math\.max\(span\/2\/\(tH\*camera\.aspect\),1\.9\/2\/tH\)\*1\.08\)\/zoom/,'Boot: the desktop fit is the old one');
 // Save: Ball's cream pill in all three
 const cream=/background:var\(--btn-cream,#fff1d3\)[^}]*box-shadow:0 4px 0 #dccfae/;
 assert.match(ball.match(/\.save\{[^}]*\}/)[0],cream);assert.match(boot.match(/\.save\{flex[^}]*\}/)[0],cream);assert.match(jer.match(/\.saveBtn\{padding[^}]*\}/)[0],cream);
 assert.ok(!/\.save\{background:var\(--btn-mint\)/.test(boot)&&!/\.saveBtn\{background:var\(--btn-mint\)/.test(jer),'no mint Save left');
 assert.match(ctl,/\.sectionTitle\.sectionTitle\{font-size:19px/,'one phone section-title size, shared');
 console.log('PASS desktop unchanged (grid, side panel, legacy camera fits); one cream Save in Ball, Boot and Jersey; one shared title size');}

// 7. Browser (optional): the three snaps for real in each studio at 390×844, the model inside the visible box, 0 rAF at rest.
if(process.env.SHEET_LAB_URL){(async()=>{const {chromium}=require('playwright');const base=process.env.SHEET_LAB_URL.replace(/\/$/,'');const b=await chromium.launch();
 try{const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,hasTouch:true,isMobile:true});
  await ctx.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.__rafs=0;window.requestAnimationFrame=cb=>{window.__rafs++;return raf(cb);};});
  for(const st of ['ball','boots','jersey']){const p=await ctx.newPage();await p.goto(`${base}/shop-lab/${st}`,{waitUntil:'networkidle'});await p.waitForTimeout(6500);
   const H=S.snapHeights(844),handle=p.locator('[data-sheet-handle]');
   assert.equal(await handle.getAttribute('aria-label'),'Resize panel');
   const sheetH=()=>p.evaluate(()=>Math.round(document.querySelector('[data-sheet-snap]').getBoundingClientRect().height));
   assert.ok(Math.abs(await sheetH()-H.default)<=2,st+': default');
   for(const want of ['tall','compact','default']){await handle.click();await p.waitForTimeout(450);
    assert.equal(await p.evaluate(()=>document.querySelector('[data-sheet-snap]').dataset.sheetSnap),want,st+': tap → '+want);
    assert.ok(Math.abs(await sheetH()-H[want])<=2,st+': '+want+' height');
    assert.equal(await p.evaluate(()=>localStorage.getItem('fi2-studio-sheet-v1')),want,st+': remembered');}
   await handle.focus();await p.keyboard.press('ArrowDown');await p.waitForTimeout(400);assert.equal(await handle.getAttribute('aria-valuetext'),'Small panel');
   await p.keyboard.press('ArrowUp');await p.keyboard.press('ArrowUp');await p.waitForTimeout(400);assert.equal(await handle.getAttribute('aria-valuetext'),'Tall panel');
   // drag from tall down to about the default height
   const bb=await handle.boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+20);await p.mouse.down();
   for(let i=1;i<=12;i++){await p.mouse.move(bb.x+bb.width/2,bb.y+20+i*(H.tall-H.default)/12);await p.waitForTimeout(16);}
   await p.waitForTimeout(200);await p.mouse.up();await p.waitForTimeout(450);
   assert.equal(await p.evaluate(()=>document.querySelector('[data-sheet-snap]').dataset.sheetSnap),'default',st+': a drag settles on the nearest snap');
   // heat: nothing animates once settled
   const r0=await p.evaluate(()=>window.__rafs);await p.waitForTimeout(2000);const r1=await p.evaluate(()=>window.__rafs);
   assert.ok(r1-r0<=2,`${st}: ${r1-r0} rAF calls in 2 s at rest`);
   console.log(`PASS browser ${st}: tap/keys/drag snaps, remembered, ${r1-r0} rAF in 2 s at rest`);await p.close();}
  await ctx.close();
  const d=await b.newContext({viewport:{width:1440,height:900}});const p=await d.newPage();await p.goto(`${base}/shop-lab/ball`,{waitUntil:'networkidle'});await p.waitForTimeout(3000);
  assert.equal(await p.locator('[data-sheet-handle]').isVisible(),false,'desktop: no handle');
  assert.equal(await p.evaluate(()=>document.querySelector('[data-sheet-snap]').style.height),'','desktop: no inline height');
  console.log('PASS browser desktop: no handle, no inline height');await d.close();
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});}

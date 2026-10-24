// Landscape audit batch 3 (Oct 23 2026, docs/LANDSCAPE_AUDIT_OCT23.md): ONE phone-layout predicate that includes landscape phones
// (lib/ui/phoneLayout.ts), its JS + CSS users, the contained travel map on short screens, the top-right note dock, 44 px emote pager
// arrows, party tabs and the Kit Shop inset. Source checks; the measured boxes come from scripts/audit-landscape.cjs batch3.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const L=require('../lib/ui/phoneLayout.ts');let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const CSS_PHONE='(max-width:600px),(max-height:480px) and (orientation:landscape),(max-device-width:480px)';

t('one predicate: the HUD family (portrait width cut, landscape max-height 480, max-device-width 480)',()=>{
 assert.equal(L.PHONE_LAYOUT_QUERY,CSS_PHONE);assert.equal(L.phoneLayoutQuery(899),CSS_PHONE.replace('600px','899px'));
 assert.equal(L.isPhoneLayout(),false,'false on the server');
 // A tiny media evaluator: landscape phones match, tablets / desktop do not.
 const match=(q,w,h)=>q.split(',').some(part=>part.split(' and ').every(c=>{const m=c.trim().match(/^\((max-width|max-height|max-device-width|orientation):(\w+?)(px)?\)$/);assert(m,c);
  return m[1]==='orientation'?(m[2]==='landscape')===(w>h):m[1]==='max-height'?h<=+m[2]:w<=+m[2];}));
 for(const [w,h] of [[393,852],[440,956],[667,375],[852,393],[932,430],[956,440]])assert(match(L.PHONE_LAYOUT_QUERY,w,h),`${w}x${h} is a phone layout`);
 for(const [w,h] of [[1024,768],[768,1024],[1280,800],[1440,900]])assert(!match(L.PHONE_LAYOUT_QUERY,w,h),`${w}x${h} keeps its layout`);
});
t('JS users: no width-only phone checks left in the audited files',()=>{
 const files={'lib/shop/studioSheet.ts':/SHEET_PHONE_QUERY=phoneLayoutQuery\(899\)/,'components/QuestLearningPath.tsx':/matchMedia\(PHONE_LAYOUT_QUERY\)[\s\S]*<source media=\{PHONE_LAYOUT_QUERY\}/,
  'components/CardCollection.tsx':/phone=matchMedia\(phoneLayoutQuery\(699\)\)\.matches[\s\S]*const page=isPhoneLayout\(\)\?/,'components/CharacterPreview.tsx':/matchMedia\(phoneLayoutQuery\(700\)\)/};
 for(const [f,re] of Object.entries(files)){const s=read(f);assert.match(s,re,f);assert(!/matchMedia\('\(max-width: ?\d+px\)'\)|innerWidth<=600|media="\(max-width:600px\)"/.test(s),`${f}: a width-only check is left`);}
 for(const f of ['JerseyStudio','BootStudio','StudioControls','BallStudio']){const s=read(`components/shop/${f}.module.css`);assert(!/@media ?\((max-width:899px|min-width:900px)\)\{/.test(s),`${f}: the studio CSS follows the JS query`);}
 assert.equal((read('components/CardCollection.module.css').match(/max-height:480px\) and \(orientation:landscape\)/g)||[]).length,2,'binder band rules follow isPhoneLayout()');
});
t('travel map: contained under max-height:500px (whole island, centred), the key in one 44 px row',()=>{
 const m=read('components/IslandTravelMap.tsx'),c=read('components/IslandTravelMap.module.css');
 assert.match(m,/MAP_FIT_QUERY='\(max-height:500px\)'/);assert.match(m,/size\.fit\?Math\.min\(size\.w\/Math\.min\(MAP_W,CONTENT_W\),size\.h\/MAP_H\):Math\.max\(size\.w\/MAP_W,size\.h\/MAP_H\)/,'contain on short screens, cover otherwise');
 assert.match(m,/\{left:offX,top:offY,width:stageW/,'centred in the frame');assert.match(m,/data-map-fit=/);
 const block=c.slice(c.indexOf('@media(max-height:500px)'));assert.match(block,/\.legend\{display:flex;flex-wrap:wrap/);assert.match(block,/\.legendTip\{min-height:44px\}/);
});
t('notes dock top-right in short landscape: clear of the centre band, <= 18% of the height',()=>{
 const g=read('app/globals.css'),i=g.indexOf('@media (orientation:landscape) and (max-height:500px){\n .town-app .hud-stack.hud-stack.hud-stack>[data-hud-slot=toast]');assert(i>0,'dock rule for every toast');
 const r=g.slice(i,g.indexOf('\n}',i));assert.match(r,/right:calc\(50% - 50vw \+ 12px \+ env\(safe-area-inset-right,0px\)\)/);assert.match(r,/max-width:min\(340px,calc\(50vw - 56px - env\(safe-area-inset-right,0px\)\)\)/,'stops 56px short of the centre line');
 assert.match(r,/max-height:18dvh/);assert(!/\[data-job-running\]>\[data-hud-slot=toast\]/.test(g),'no longer only while a job runs');
});
t('44 px targets: emote pager arrows, party Code | List tabs; Kit Shop top bar inside the side insets',()=>{
 const g=read('app/globals.css');assert.match(g,/\.emote-wheel-arrow\{flex:0 0 auto;display:grid;place-items:center;width:44px;height:44px;/);assert.match(g,/\.emote-wheel-arrow\{width:clamp\(24px,calc\(\(100vw - 300px\) \/ 2\),44px\)\}/);
 const p=read('components/party/party.module.css');assert(!/--tabs-h:48px/.test(p));assert.match(p,/--tabs-h:56px/);
 assert.match(read('components/shop/ShopRoom.module.css'),/\.top\{[^}]*max\(20px,calc\(12px \+ env\(safe-area-inset-right,0px\)\)\) 0 max\(20px,calc\(12px \+ env\(safe-area-inset-left,0px\)\)\)/);
});
console.log('landscape-polish: '+n+' tests passed');

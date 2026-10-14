// Boot studio (Oct 12 2026): the design schema and validation, the name filter, the curated quotes, the sticker limit, the price,
// the heat rules of the 3D scene (no loop at rest, phone caps, dispose) and no real brands anywhere in the studio.
// Silhouettes (Oct 12 2026): thirteen boot models with distinct 3D shapes, valid decal zones on each, old saves load as 'speed'.
// usage: node tests/shop-boots.cjs   (browser heat probe: scratchpad shop-boots/heat.cjs against a running server)
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const B=require('../lib/shop/boots.ts');
const FILES=['lib/shop/boots.ts','lib/shop/bootStickers.ts','lib/shop/bootGeometry.ts','lib/shop/bootBake.ts','lib/shop/bootScene.ts','lib/shop/bootZones.ts','lib/shop/bootGlyphs.ts','lib/shop/bootProfiles.ts','lib/shop/bootMaterials.ts','components/shop/BootStudio.tsx','components/shop/BootStudio.module.css','app/shop-lab/boots/page.tsx','app/shop-lab/boots/BootLab.tsx'];

// 1. Schema: the default is valid and stable; junk becomes a safe design; unknown values fall back.
{const d=B.validateBoots(B.DEFAULT_BOOTS);assert.deepEqual(d,B.DEFAULT_BOOTS,'the default design validates to itself');
 assert.equal(B.BOOTS_KEY,'fi2-shop-boots-v1');
 for(const junk of [null,undefined,42,'boots',[],{colors:'red'},{decals:'x'}]){const v=B.validateBoots(junk);assert.equal(v.v,1);assert.equal(v.decals.length,0);assert.match(v.colors.toe,/^#[0-9a-f]{6}$/);}
 const v=B.validateBoots({upper:'velvet',collar:'high',laces:'zip',finish:'chrome',studs:'spikes',pattern:'plaid',colors:{toe:'#ABCDEF',mid:'red',heel:'#12345'},number:100,flag:'xx',heelText:'both'});
 assert.equal(v.upper,B.DEFAULT_BOOTS.upper);assert.equal(v.collar,'low');assert.equal(v.laces,'visible');assert.equal(v.finish,B.DEFAULT_BOOTS.finish);assert.equal(v.studs,'fg');
 assert.equal(v.colors.toe,'#abcdef','hex colours are kept (lower case)');assert.equal(v.colors.mid,B.DEFAULT_BOOTS.colors.mid,'a colour name is not a hex');assert.equal(v.colors.heel,B.DEFAULT_BOOTS.colors.heel);
 assert.equal(v.number,null,'numbers are 0–99');assert.equal(v.flag,null,'only bundled flags');assert.equal(v.heelText,B.DEFAULT_BOOTS.heelText);
 // decals: refs must exist, positions are clamped, ids are unique, quotes get a tint
 const dv=B.validateBoots({decals:[{id:'a',kind:'sticker',ref:'star',zone:'outside',x:5,y:-5,size:9,rot:200},{id:'a',kind:'flag',ref:'br',zone:'heel'},{kind:'sticker',ref:'swoosh'},{kind:'quote',ref:'never-give-up',zone:'moon'},{kind:'flag',ref:'zz'}]});
 assert.equal(dv.decals.length,3,'unknown stickers and flags are dropped');assert.deepEqual([dv.decals[0].x,dv.decals[0].y,dv.decals[0].size,dv.decals[0].rot],[1,-1,1.6,60]);
 assert.equal(new Set(dv.decals.map(d=>d.id)).size,3,'decal ids are unique');assert.equal(dv.decals[2].zone,'outside');assert.match(dv.decals[2].tint,/^#[0-9a-f]{6}$/);
 // every preset and a run of random designs validate unchanged
 for(const p of B.PRESETS){const d={...B.DEFAULT_BOOTS,...p.design};assert.deepEqual(B.validateBoots(d),d,p.id+' preset is valid');}
 let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;for(let i=0;i<200;i++){const r=B.randomBoots(rnd);assert.deepEqual(B.validateBoots(r),r);}
 assert.ok(B.PRESETS.length>=B.MODEL_IDS.length&&B.PRESETS.length<=B.MODEL_IDS.length+2,'a look per model (and a spare)');
 for(const m of B.MODEL_IDS)assert.ok(B.PRESETS.some(p=>p.design.model===m),m+' has a "Start from a look" preset');
 assert.equal(new Set(B.PRESETS.map(p=>p.id)).size,B.PRESETS.length,'preset ids are unique');
 // models: an old save has no model → the modern shape it was made with, its collar and laces kept; fixed shapes own theirs
 assert.equal(B.DEFAULT_BOOTS.model,'speed');assert.equal(B.MODELS.length,B.MODEL_IDS.length);assert.deepEqual(B.MODELS.map(m=>m.id),[...B.MODEL_IDS]);
 const v1={v:1,upper:'knit',collar:'sock',laces:'laceless',finish:'matte',studs:'sg',pattern:'solid',colors:B.DEFAULT_BOOTS.colors};
 const vv=B.validateBoots(v1);assert.equal(vv.model,'speed','an old save loads as the modern shape');assert.equal(vv.collar,'sock');assert.equal(vv.laces,'laceless');assert.equal(vv.studs,'sg');
 assert.equal(B.validateBoots({...v1,model:'starship'}).model,'speed','an unknown model falls back');
 for(const m of B.MODELS){const d=B.validateBoots({...v1,model:m.id});assert.equal(d.model,m.id);
  if(m.collar){assert.equal(d.collar,m.collar,m.id+' keeps its own collar');assert.equal(d.laces,m.laces,m.id+' keeps its own lacing');}
  assert.ok(m.blurb.length>40&&m.blurb.length<140,m.id+' has a one-line kid blurb');assert.ok(m.label.length<=20&&m.era.length<=14,m.id+' label and era are short');}
 assert.equal(B.validateBoots({...v1,model:'speed',collar:'mid',laces:'covered'}).laces,'covered','the modern shape takes any collar and lacing');
 // stud variety (Oct 12 2026): 12 layouts, each with a kid-sized pitch line; stud finish + tip colour; old saves still load
 assert.equal(B.STUDS.length,12);assert.deepEqual(B.STUDS.map(s=>s.id),[...B.STUD_TYPES]);
 for(const s of B.STUDS){assert.ok(s.pitch.length>20&&s.pitch.length<120,s.id+' explains its pitch in one line');assert.ok(Number.isInteger(B.PRICE.studs[s.id]),s.id+' has a price');}
 for(const f of B.STUD_FINISH_IDS)assert.ok(Number.isInteger(B.PRICE.studFinish[f])&&B.STUD_FINISHES.some(x=>x.id===f),f);
 const old={v:1,upper:'knit',collar:'sock',laces:'visible',finish:'matte',studs:'turf',pattern:'solid',colors:{toe:'#000000',mid:'#000000',heel:'#000000',collar:'#000000',laces:'#000000',soleplate:'#000000',studs:'#ff0000',accent:'#000000'}};
 const ov=B.validateBoots(old);assert.equal(ov.studs,'turf','an old save keeps its studs');assert.equal(ov.studFinish,B.DEFAULT_BOOTS.studFinish);assert.equal(ov.colors.tips,B.DEFAULT_BOOTS.colors.tips);assert.equal(ov.colors.studs,'#ff0000');
 for(const [from,to] of [['TF','turf'],['ic','indoor'],['mg','ag'],['blades','blade'],['elite','carbon']])assert.equal(B.validateBoots({studs:from}).studs,to,from+' maps to the nearest type');
 assert.equal(B.validateBoots({studFinish:'gold'}).studFinish,B.DEFAULT_BOOTS.studFinish);
 console.log('PASS schema: defaults, junk, fallbacks, decal clamping, presets, random designs, 12 stud layouts and 5 stud finishes validate');}

// 2. The name filter: letters, spaces and hyphens, at most 12, and a blocklist.
{assert.equal(B.cleanName('  Khoa  Do  '),'Khoa Do ');assert.equal(B.cleanName('Ana-María'),'Ana-María');assert.equal(B.cleanName('Zoë 10!!'),'Zoë ');
 assert.equal(B.cleanName('<script>alert(1)</script>'),'scriptalerts');assert.equal(B.cleanName('a'.repeat(30)).length,12);assert.equal(B.cleanName('--Leo'),'Leo');assert.equal(B.cleanName('Jo---Jo'),'Jo-Jo');
 assert.equal(B.cleanName('李小龙'),'李小龙','any alphabet');assert.equal(B.cleanName('😀Sam'),'Sam');
 for(const ok of ['Khoa','Cassidy','Hello','Dieter','Killian','Dickson','Assia','Hancock','Sussex','',' ']) assert.ok(B.nameAllowed(ok),ok+' is allowed');
 const bad=['dumb','poo','sh it','s-h-i-t','Bum','die','i love poo'.replace('i love ','')];for(const n of bad)assert.ok(!B.nameAllowed(n),n+' is blocked');
 assert.ok(!B.nameAllowed(Buffer.from('bmlrZQ==','base64').toString()),'brand names are blocked as names too');
 assert.equal(B.validateBoots({name:'dumb'}).name,'','a blocked name never reaches a saved design');
 assert.equal(B.validateBoots({name:'Mia 7'}).name,'Mia','digits are stripped');
 console.log('PASS name filter: letters/spaces/hyphens, 12 max, whole-word and substring blocklist');}

// 3. Quotes are a curated list: short, no free text field for them, no duplicates.
{assert.ok(B.QUOTES.length>=10);assert.equal(new Set(B.QUOTES.map(q=>q.id)).size,B.QUOTES.length);
 for(const q of B.QUOTES){assert.ok(q.text.length<=16,q.text+' is short');assert.match(q.text,/^[A-Za-z !']+$/,q.text+' is plain words');assert.ok(B.nameAllowed(q.text.replace(/[!']/g,'')),q.text);}
 for(const must of ['Never give up','Team first','Dream big','Play fair'])assert.ok(B.QUOTES.some(q=>q.text===must),must);
 const ui=read('components/shop/BootStudio.tsx');assert.equal((ui.match(/<input/g)||[]).length,3,'only three inputs: the name, the colour picker and a save-slot name');
 assert.match(ui,/addDecal\('quote',q\.id\)/,'quotes are added by id from the list');
 assert.ok(B.validateBoots({decals:[{kind:'quote',ref:'you are rubbish'}]}).decals.length===0,'a quote that is not in the list is dropped');
 console.log('PASS quotes: '+B.QUOTES.length+' curated quotes, picked by id, unknown text dropped');}

// 4. Sticker limit: 8 placed (the name, number and flag badge are separate).
{assert.equal(B.DECAL_LIMIT,8);const many=Array.from({length:12},(_,i)=>({id:'s'+i,kind:'sticker',ref:B.STICKER_IDS[i%B.STICKER_IDS.length],zone:'outside'}));
 assert.equal(B.validateBoots({decals:many}).decals.length,8,'validation keeps at most 8');
 const ui=read('components/shop/BootStudio.tsx');assert.match(ui,/design\.decals\.length>=DECAL_LIMIT/,'the studio refuses a 9th sticker');
 const bake=read('lib/shop/bootBake.ts');assert.match(bake,/MAX_DECALS=12/,'the bake holds 8 stickers + name + number + flag');
 const stick=require('../lib/shop/bootStickers.ts');for(const id of B.STICKER_IDS){assert.ok(stick.STICKERS[id],id+' has art');assert.match(stick.STICKERS[id].svg,/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 256 256">/);}
 for(const f of B.FLAGS)assert.ok(fs.existsSync(path.join(root,'public/shop/flags',f.code+'.svg')),f.code+'.svg is bundled');
 assert.ok(!B.FLAGS.some(f=>f.code==='sa'),'no flag with religious text on footwear');
 assert.ok(fs.existsSync(path.join(root,'public/shop/flags/LICENSE.txt'))&&/MIT License/.test(read('public/shop/flags/LICENSE.txt')),'the flag-icons MIT licence ships with the flags');
 assert.ok(fs.existsSync(path.join(root,'docs/third-party/flag-icons.md')),'the third-party notice is recorded');
 console.log('PASS limit: 8 stickers, '+B.STICKER_IDS.length+' original stickers, '+B.FLAGS.length+' bundled flags with the MIT licence');}

// 5. Price in coins. Computed from B.PRICE (the shop owns the numbers), so a re-price never breaks this test.
{const P=B.PRICE;
 const plain={...B.DEFAULT_BOOTS,finish:'matte',pattern:'solid',number:null,name:'',heelText:'number'};assert.equal(B.bootPrice(plain),P.base,'plain boots cost the base');
 assert.equal(B.bootPrice(B.DEFAULT_BOOTS),P.base+P.finish[B.DEFAULT_BOOTS.finish]+P.pattern+P.name,'default: base + finish + fade + number stitching');
 const loaded={...plain,finish:'iridescent',collar:'sock',laces:'laceless',studs:'sg',pattern:'camo',name:'Leo',heelText:'name',flag:'br',
  decals:Array.from({length:8},(_,i)=>({id:'d'+i,kind:'sticker',ref:'star',zone:'outside',x:0,y:0,size:1,rot:0}))};
 assert.equal(B.bootPrice(loaded),P.base+P.finish.iridescent+P.collar.sock+P.laces.laceless+P.studs.sg+P.pattern+8*P.decal+P.name+P.flag);
 assert.ok(B.bootPrice(loaded)>B.bootPrice(plain)&&B.bootPrice(loaded)<=P.base*2.5,'options add to the price but never more than the boots themselves');
 assert.equal(B.bootPriceLines(loaded).reduce((a,l)=>a+l.coins,0),B.bootPrice(loaded),'the receipt adds up');
 assert.equal(B.bootPrice({...plain,studs:'carbon',studFinish:'translucent'}),P.base+P.studs.carbon+P.studFinish.translucent,'elite plates and stud finishes are priced from PRICE');
 assert.equal(B.bootPrice({...plain,studs:'indoor',studFinish:'chrome'}),P.base+P.studs.indoor,'a flat indoor sole has no studs to finish');
 for(const m of B.MODELS){assert.ok(Number.isInteger(P.model[m.id])&&P.model[m.id]>=0&&P.model[m.id]<=P.base/5,m.id+' model price is small');
  const d=B.validateBoots({...plain,model:m.id});assert.equal(B.bootPrice(d),P.base+P.model[m.id]+P.collar[d.collar]+P.laces[d.laces],m.id+' is priced from PRICE');}
 assert.equal(B.bootPrice({...plain,model:'speed',collar:'mid',laces:'covered'}),P.base+P.collar.mid+P.laces.covered);
 assert.ok(B.bootPriceLines(loaded).every(l=>Number.isInteger(l.coins)&&l.coins>0));
 const ui=read('components/shop/BootStudio.tsx');assert.match(ui,/const price=bootPrice\(design\),lines=bootPriceLines\(design\)/,'the studio reads the price from bootPrice()');
 console.log('PASS price: base '+P.base+', options add up, fully loaded '+B.bootPrice(loaded)+' coins');}

// 6. Saves: auto-save + 3 named slots, tolerant of junk.
{const mem={};const store={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=v;}};
 const s0=B.loadBootSaves(store);assert.equal(s0.slots.length,3);assert.deepEqual(s0.current,B.DEFAULT_BOOTS);
 B.storeBootSaves({...s0,current:{...B.DEFAULT_BOOTS,name:'Ava'},slots:[{name:'Match day',design:B.DEFAULT_BOOTS,at:1},null,{name:'dumb',design:{junk:1},at:2}]},store);
 const s1=B.loadBootSaves(store);assert.equal(s1.current.name,'Ava');assert.equal(s1.slots[0].name,'Match day');assert.equal(s1.slots[1],null);assert.equal(s1.slots[2].name,'Boots 3','a blocked slot name is replaced');
 mem[B.BOOTS_KEY]='{not json';assert.deepEqual(B.loadBootSaves(store).current,B.DEFAULT_BOOTS,'corrupt storage falls back');
 console.log('PASS saves: current design + 3 named slots under '+B.BOOTS_KEY);}

// 7. Heat (static): render on demand, no loop at rest, phone caps, hidden-tab pause, everything disposed.
{const sc=read('lib/shop/bootScene.ts');
 assert.doesNotMatch(sc,/setInterval\(/,'no polling timers');
 const rafs=sc.match(/requestAnimationFrame\(step\)/g)||[];assert.equal(rafs.length,3,'requestAnimationFrame only in kick(), the step() continuation and its 30 fps skip');
 // touch devices: 30 fps on the island's slot grid (fix pass Oct 13 2026, heat audit); desktop uncapped; dt from the last rendered frame
 assert.match(sc,/const capMs=studioFrameMs\(\);/,'the boot studio reads the touch frame cap');
 assert.match(sc,/stats\.rafs\+\+;\n[^\n]*\n  if\(capMs\)\{const next=frameCapSlot\(now,slot,capMs\);if\(next<0\)\{frame=requestAnimationFrame\(step\);return;\}slot=next;\}\n  const dt=Math\.min\(\.05,last\?\(now-last\)\/1000:1\/60\);last=now;/,'≤ 30 fps on touch: an early vsync is skipped before dt is taken (frame-rate independent inertia)');
 {const cap=read('lib/shop/studioFrameCap.ts');assert.match(cap,/coarse\|\|touch\?PHONE_FRAME_MS:0/,'30 fps on a coarse pointer or a hover-less touch screen, uncapped on desktop');}
 assert.match(sc,/if\(moving\)frame=requestAnimationFrame\(step\);else last=0;/,'the loop continues only while something moves');
 assert.match(sc,/function kick\(\)\{if\(!frame&&!disposed&&!paused\)/,'one pending frame at most, none when hidden or disposed');
 assert.match(sc,/if\(k>=1\)intro=null/,'the opening turn ends');assert.match(sc,/if\(!reduced\)\{intro=/,'no opening turn with reduced motion');
 assert.match(sc,/if\(reduced\)\{stepAcc/,'reduced motion: stepped rotation');
 assert.match(sc,/Math\.min\(window\.devicePixelRatio\|\|1,coarse\?1\.5:2\)/,'phones render at ≤ 1.5×');
 assert.match(sc,/const BAKE=coarse\?1024:2048/,'phones bake at 1024²');assert.match(sc,/atlasCanvas\.width=1024;atlasCanvas\.height=1024/,'sticker atlas 1024²');
 assert.match(sc,/visibilitychange/,'pauses when the tab is hidden');assert.match(sc,/function scheduleAtlas\(\)\{clearTimeout\(atlasTimer\);atlasTimer=setTimeout\(rebuildAtlas,\d+\)/,'the atlas upload is debounced');
 assert.match(sc,/atlasTex\.needsUpdate=true;stats\.atlasUploads\+\+/,'the atlas uploads only after a rebuild');
 const disp=sc.slice(sc.indexOf('dispose(){\n   disposed=true'));for(const what of ['cancelAnimationFrame(frame)','ro.disconnect()','removeEventListener(\'visibilitychange\'','baker.dispose()','renderer.dispose()','forceContextLoss()','b.upper.geometry.dispose()','shapes.clear()','atlasTex','env','freeStud(sb)','studCache.clear()','removeEventListener(\'pointerdown\''])assert.ok(disp.includes(what),'dispose: '+what);
 const ui=read('components/shop/BootStudio.tsx');assert.match(ui,/import\('@\/lib\/shop\/bootScene'\)/,'three.js loads only when the studio opens');assert.match(ui,/scene\?\.dispose\(\)/,'the studio disposes the scene on close');
 assert.doesNotMatch(ui,/^import .*from 'three'/m,'the studio shell does not import three statically');
 const css=read('components/shop/BootStudio.module.css');assert.doesNotMatch(css,/infinite/,'no endless CSS animation');assert.match(css,/prefers-reduced-motion:reduce/);
 for(const kf of css.matchAll(/@keyframes \w+\{([^@]*?)\}\}/g))assert.doesNotMatch(kf[1],/(width|height|top|left|margin|padding)\s*:/,'keyframes animate transform/opacity only');
 const g=read('lib/shop/bootGeometry.ts');assert.match(g,/detail==='desktop'\?112:84/,'phones use fewer mesh rows');
 assert.doesNotMatch(sc,/InstancedMesh\(|tipMat/,'every stud layout is one merged mesh with its tips (no extra draw calls)');
 assert.match(sc,/const SHAPE_CACHE=\d+,shapes=new Map/,'built silhouettes are cached (no rebuild when you flick back)');assert.match(sc,/const STUD_CACHE=\d+,studCache=new Map/,'plates and studs are cached per model too');assert.match(sc,/while\(studCache\.size>=STUD_CACHE\)/);assert.match(sc,/while\(shapes\.size>=SHAPE_CACHE\)/,'the cache is bounded');
 assert.doesNotMatch(sc,/new T\.Mesh\([^)]*fin|finMesh|coverMesh/i,'fins and the lace cover are merged into the upper (no extra draw calls)');
 console.log('PASS heat: on-demand render, no loop at rest, ≤1.5× and 1024² on phones, hidden pause, dispose');}

// 8. No real brands anywhere in the studio (logos, stripes trademarks, model names), and none in any rendered string: the model
//    names, eras and blurbs, the preset names, the colour hints. The silhouettes are inspired by eras and styles, never products.
{const BRANDS=/\b(nike|adidas|puma|mizuno|umbro|joma|diadora|new balance|under armour|asics|kipsta|lotto|kappa|hummel|swoosh|three stripes|3-stripes|formstrip|jumpman|predator|phantom|mercurial|superfly|vapor|tiempo|copa mundial|copa pure|x speedportal|crazyfast|morelia|ultra ultimate|king platinum|king top|puma king|total ?90|t90|f50|adizero|tunit|magista|hypervenom|nemeziz|ace 1[0-9]|purecontrol|accelerator|powerswerve|mania|ctr360|r9|zhero|flyknit|primeknit|boost|traxion|trx|sprintframe|sprintskin|sprintweb|torsion ?frame|nikeskin|agility ?bandage|speed ?rib|kng-100|k-leather)\b/i;
 const PLAYERS=/\b(ronaldo|ronaldinho|messi|beckham|zidane|maradona|pel[eé]|henry|rooney|figo|kak[aá]|ibrahimovi[cć]|lampard|torres|neymar|mbapp[eé]|haaland|cruyff|matth[aä]us|eus[eé]bio)\b/i;
 for(const f of FILES){const src=read(f);const m=src.match(BRANDS);assert.ok(!m,`${f} mentions "${m&&m[0]}"`);}
 const shown=[...B.MODELS.flatMap(m=>[m.label,m.era,m.blurb]),...B.PRESETS.flatMap(p=>[p.label,p.sub]),...B.COLOUR_ZONES.flatMap(z=>[z.label,z.hint]),...B.STUDS.flatMap(s=>[s.label,s.pitch]),...B.UPPERS.flatMap(u=>[u.label,u.note])];
 for(const t of shown){assert.ok(!BRANDS.test(t),'no brand in "'+t+'"');assert.ok(!PLAYERS.test(t),'no player in "'+t+'"');}
 const ui=read('components/shop/BootStudio.tsx');for(const t of ui.match(/>[^<>{}]{3,}</g)||[]){assert.ok(!BRANDS.test(t)&&!PLAYERS.test(t),'studio text '+t);}
 assert.ok(B.PRESETS.every(p=>B.MODELS.some(m=>m.label===p.label)),'preset names are the original model names');
 const stick=read('lib/shop/bootStickers.ts');assert.doesNotMatch(stick,/<image|href=/,'stickers are drawn, not embedded images');
 console.log('PASS brands: no real brand, mark, model or player name in '+FILES.length+' studio files or '+shown.length+' rendered strings');}

// 9. The boot's shape: a sleek modern football boot, not a bowling shoe (proportions, a thin plate, toe spring, stance on the studs).
{const Module=require('node:module'),three=path.join(root,'node_modules/three/');
 // three's examples are ES modules: transpile them to CommonJS for this test
 const jsLoad=Module._extensions['.js'];Module._extensions['.js']=(m,f)=>f.startsWith(three+'examples/')?m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f):jsLoad(m,f);
 const G=require('../lib/shop/bootGeometry.ts');G.useShape('speed');
 const up=G.buildUpperGeometry({collar:'low',laces:'visible',studs:'fg',detail:'phone'}).geometry;up.computeBoundingBox();const bb=up.boundingBox;
 const L=bb.max.x-bb.min.x,W=bb.max.z-bb.min.z;assert.ok(L/W>2.6&&L/W<2.9,'length ≈ 2.6–2.9× the width: '+(L/W).toFixed(2));
 const instep=(G.base(G.S_THROAT)+G.hsec(G.S_THROAT)-G.plateBottom(G.S_THROAT,'fg'))/G.BOOT_L;assert.ok(instep>.22&&instep<.42,'instep from the traced profile: '+instep.toFixed(3));
 assert.ok(bb.max.y<1.5,'the upper (with its tongue) stays boot-sized: '+bb.max.y.toFixed(2));
 const PR=require('../lib/shop/bootProfiles.ts').BOOT_PROFILES;assert.deepEqual(G.SHAPES.speed.hsec,PR.speed.hsec,'the default shape is the traced one, not the old hand-made base');
 const plate=G.plateTop(.5)-G.plateBottom(.5,'fg');assert.ok(plate<.045,'a thin plate, not a midsole: '+(plate*100).toFixed(1)+' mm');
 assert.ok(G.base(1)-G.base(.7)>.1,'clear toe spring');assert.ok(G.hsec(.93)<.62*G.hsec(.5)&&G.hsec(1)<.4*G.hsec(.5),'the toe box tapers down from the instep');
 const w=s=>{const p=G.plan(s);return p.lat+p.med;};let wmax=0;for(let s=0;s<=1;s+=.01)wmax=Math.max(wmax,w(s));assert.ok(w(.12)<.72*wmax,'the heel is narrower than the forefoot');
 assert.ok(w(.95)<.45*wmax,'a tapered, pointed toe');
 const top=G.surface(.55,Math.PI/2).z,eye=G.eyeletRows().map(r=>(G.surface(r.s,r.phiIn).z+G.surface(r.s,r.phiOut).z)/2);assert.ok(eye.every(z=>z>top+.02),'asymmetric lacing: offset to the outside');
 assert.ok(eye.length*2<=12,'eyelets fit the bake');
 for(const t of B.STUD_TYPES){const sg=G.buildStudsGeometry(t),flat=t==='indoor'||t==='futsal';
  if(flat){assert.equal(sg,null,t+' is a flat gum sole');continue;}
  assert.ok(sg&&sg.getAttribute('aStud'),t+' builds one merged stud mesh with tip marks');const tris=sg.getAttribute('position').count/3;assert.ok(tris<16000,t+' stud triangles '+tris);
  const lift=G.plateBottom(.65,t)-G.studGround(t);assert.ok(lift>(t==='turf'?.035:.07),t+' stands on its studs: '+(lift*100).toFixed(1)+' mm');
  if(t==='sg'||t==='sgmix'){const a=sg.getAttribute('aStud');let metal=0;for(let i=0;i<a.count;i++)metal+=a.getY(i);assert.ok(metal>0,t+' has metal tips');}}
 assert.ok(G.plateBottom(.45,'split')>G.plateBottom(.45,'fg'),'the split plate is open under the arch');
 // 10. Silhouettes: every model builds with its own collar and lacing; the shapes are measurably different; decal zones work.
 const T=require('three'),Z=require('../lib/shop/bootZones.ts'),GL=require('../lib/shop/bootGlyphs.ts'),P=require('../lib/shop/bootProfiles.ts').BOOT_PROFILES;
 const sig={};
 for(const m of B.MODELS){G.useShape(m.id);const collar=m.collar??'low',laces=m.laces??'visible',t0=Date.now();
  const u=G.buildUpperGeometry({collar,laces,studs:m.studs,detail:'phone'}),g=u.geometry;g.computeBoundingBox();const bb=g.boundingBox,zA=g.getAttribute('aZone');
  const parts=new Set();for(let i=0;i<zA.count;i++)parts.add(Math.round(zA.getW(i)));
  const lacesG=G.buildLacesGeometry(),sole=G.buildSoleGeometry(m.studs),studs=G.buildStudsGeometry(m.studs);
  const tris=g.index.count/3+(laces==='visible'?lacesG.getAttribute('position').count/3:0)+sole.index.count/3+(studs?studs.getAttribute('position').count/3:0);
  assert.ok(tris<30000,m.id+': under 30k triangles on phones ('+Math.round(tris)+')');assert.ok(Date.now()-t0<400,m.id+' builds quickly');
  for(const a of ['position','normal','uv','uvFlip','aZone','aSurf']){const arr=g.getAttribute(a).array;for(let i=0;i<arr.length;i++)if(!Number.isFinite(arr[i]))assert.fail(m.id+' '+a+' has NaN');}
  const sh=G.shape(),W=bb.max.z-bb.min.z,L=bb.max.x-bb.min.x;
  sig[m.id]={top:bb.max.y,LW:L/W,instep:G.hsec(.5),toe:G.hsec(.9),toeW:(G.plan(.95).lat+G.plan(.95).med)/W,tongue:G.hasTongue({collar,laces})?sh.tongue.top:0,fold:u.tongueFold<1?1:0,flap:sh.tongue.kind==='fold'?sh.tongue.flapTo:0,
   collar:collar==='sock'?sh.sockTop:collar==='mid'?sh.midTop:0,lace:laces==='visible'?sh.laceC:laces==='covered'?-1:-2,fins:parts.has(G.PART.fin)?1:0,cover:parts.has(G.PART.cover)?1:0,heel:sh.heelCtr,sole:sh.soleT};
  // the 3D features are real geometry
  if(sh.fins)assert.ok(parts.has(G.PART.fin),m.id+' has rubber fins');else assert.ok(!parts.has(G.PART.fin),m.id+' has no fins');
  assert.equal(parts.has(G.PART.cover),laces==='covered',m.id+' lace cover iff covered');assert.equal(parts.has(G.PART.collar),collar!=='low',m.id+' knit collar iff mid/sock');
  assert.equal(parts.has(G.PART.tongue),G.hasTongue({collar,laces}),m.id+' tongue iff low and laced');
  if(sh.tongue.kind==='fold'&&G.hasTongue({collar,laces})){assert.ok(u.tongueFold>.2&&u.tongueFold<.8,m.id+' tongue folds over');
   const {curve}=G.tongueCurve(),tip=curve.getPointAt(1);assert.ok(G.sAt(tip.x)>.5,m.id+' flap lies over the laces');assert.ok(tip.y>G.base(G.sAt(tip.x))+G.hsec(G.sAt(tip.x)),m.id+' flap sits above the upper');}
  assert.equal(G.eyeletRows().length*2<=14,true,m.id+' eyelets fit the bake');
  // decal zones: every corner and the centre of every zone lands on a decal-friendly part
  const mesh=new T.Mesh(g,new T.MeshBasicMaterial({side:T.DoubleSide})),ray=new T.Raycaster();
  for(const zone of ['outside','inside','toe','heel','tongue'])for(const [x,y] of [[0,0],[-1,-1],[1,-1],[-1,1],[1,1]]){
   const r=Z.zoneRay(zone,x,y,{collar,laces});ray.set(r.o,r.d);ray.far=6;
   const hit=ray.intersectObject(mesh,false).find(h=>Z.decalPart(Math.round(zA.getW(h.face.a)),zA.getY(h.face.a),zA.getZ(h.face.a)));
   assert.ok(hit,`${m.id}: ${zone} (${x},${y}) lands on the boot`);
   if(zone==='heel'||zone==='outside'||zone==='inside'){const back=Z.zoneParams(zone,hit.point,{collar,laces});assert.ok(Math.abs(back.x-x)<.25&&Math.abs(back.y-y)<.3,`${m.id}: ${zone} (${x},${y}) round-trips to (${back.x.toFixed(2)},${back.y.toFixed(2)})`);}}
  const hb=Z.heelBand();assert.ok(hb.y1-hb.y0>=.15,m.id+' heel band is tall enough for a name');
  assert.ok(GL.BOOT_GLYPHS[m.id]&&/^M[\d.]+ /.test(GL.BOOT_GLYPHS[m.id].body),m.id+' has a thumbnail silhouette');
  g.dispose();u.flipGeometry.dispose();lacesG.dispose();sole.dispose();studs?.dispose();}
 // traced: every model but the generic indoor shoe takes its side profile from a fitted reference trace
 for(const m of B.MODEL_IDS){if(m==='indoor')continue;assert.ok(P[m]&&P[m].hsec.length>=8&&P[m].tongueTop>0,m+' has a traced profile');assert.deepEqual(G.SHAPES[m].hsec,P[m].hsec,m+' uses it');}
 // distinct: every pair of models differs clearly in at least two measures of shape
 const ids=Object.keys(sig),D=(a,b)=>{let n=0;const A=sig[a],Bb=sig[b];
  if(Math.abs(A.top-Bb.top)>.06)n++;if(Math.abs(A.LW-Bb.LW)>.08)n++;if(Math.abs(A.instep-Bb.instep)>.03)n++;if(Math.abs(A.toe-Bb.toe)>.025)n++;if(Math.abs(A.toeW-Bb.toeW)>.03)n++;
  if(Math.abs(A.tongue-Bb.tongue)>.05)n++;if(A.fold!==Bb.fold)n++;if(Math.abs(A.flap-Bb.flap)>.04)n++;if(Math.abs(A.collar-Bb.collar)>.1)n++;if(Math.abs(A.lace-Bb.lace)>.03)n++;if(A.fins!==Bb.fins)n++;if(A.cover!==Bb.cover)n++;
  if(Math.abs(A.heel-Bb.heel)>.25)n++;if(Math.abs(A.sole-Bb.sole)>.007)n++;return n;};
 for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)assert.ok(D(ids[i],ids[j])>=2,`${ids[i]} and ${ids[j]} differ in shape (${D(ids[i],ids[j])} measures)`);
 assert.ok(sig.fins.fold&&sig.classic.fold&&sig.retro.fold&&sig.longflap.fold&&!sig.speed.fold,'the classic shapes fold their tongues over the laces');
 assert.ok(sig.longflap.flap>sig.classic.flap+.1&&sig.retro.flap>sig.classic.flap,'a long flap vs a short fold');
 assert.ok(sig.sock.collar>sig.laceless.collar&&sig.knit.collar>sig.laceless.collar&&sig.laceless.collar>0,'sock collars > a mid collar > none');
 assert.ok(sig.offset.lace>.1&&G.SHAPES.cage.laceC>.05&&sig.classic.lace===0,'off-centre lacing vs centred');assert.ok(sig.cage.heel>1.2&&sig.feather.heel<.5,'a tall heel clip vs a soft leather heel');
 assert.ok(sig.track.LW>sig.indoor.LW+.3,'a slim spike shape vs a wide indoor shoe');assert.ok(sig.wrap.sole<sig.classic.sole-.01,'the thinnest plate vs a classic sole');
 // 11. Soles with real shape (Oct 13 2026; user: "all the soles of the styles are so flat"): every model's plate has edge thickness,
 //     a side wall that wraps up the boot (tallest at the heel, a toe bumper), a raised heel block, an arch cut-out, a flex groove,
 //     and the studs stand on the plate square to it, following the toe spring.
 {const soleInfo=[];
  for(const m of B.MODELS){G.useShape(m.id);const sh=G.shape(),studs=G.isFlatSole(m.studs)?m.studs:'fg',flat=G.isFlatSole(m.studs);
   const sole=G.buildSoleGeometry(m.studs),pos=sole.getAttribute('position');
   // side wall height above the upper's underside, measured on the built plate: heel (s < .05), waist (.4–.55), toe (s > .93)
   let heelW=0,midW=0,toeW=0;for(let i=0;i<pos.count;i++){const x=pos.getX(i),s=G.sAt(x),h=pos.getY(i)-G.base(s);if(s<.05)heelW=Math.max(heelW,h);else if(s>.4&&s<.55)midW=Math.max(midW,h);else if(s>.93)toeW=Math.max(toeW,h);}
   const edge=G.base(.72)-G.plateUnder(.72,1,m.studs);
   assert.ok(edge>=.028,m.id+': the plate edge has real thickness ('+(edge*100).toFixed(1)+' mm at the forefoot)');
   assert.ok(heelW>=.04&&heelW>midW+.02,m.id+': the side wall wraps up the heel counter ('+(heelW*100).toFixed(1)+' mm) higher than the waist ('+(midW*100).toFixed(1)+' mm)');
   assert.ok(midW>=.006,m.id+': a side wall along the waist');assert.ok(toeW>=.018,m.id+': a toe bumper ('+(toeW*100).toFixed(1)+' mm)');
   if(!flat){const rel=(s,f=0)=>G.plateUnder(s,f,'fg')-G.base(s);
    assert.ok(rel(.42)>rel(.7)+.012,m.id+': an arch cut-out (the bridge rises '+((rel(.42)-rel(.7))*100).toFixed(1)+' mm)');
    assert.ok(rel(.42,-.8)>rel(.42,.8),m.id+': the arch is cut deeper on the inside');
    assert.ok(rel(.12)<rel(.4)-.02,m.id+': a raised heel block stands below the arch');
    assert.ok(rel(.635)>rel(.6)+.002,m.id+': a flex groove across the forefoot');
    for(const s of [.42,.5])for(const f of [-1,0,1])assert.ok(G.plateUnder(s,f,'fg')<G.base(s)-.005,m.id+': the bridge stays under the upper');}
   if(sh.plate.welt)assert.ok(sh.plate.kind==='rubber','a stitched welt sits on a classic rubber sole');
   soleInfo.push(m.id+' '+(edge*100).toFixed(1)+'/'+(heelW*100).toFixed(1)+' mm');
   sole.dispose();}
  // the eras differ: the leather classics stand on thick rubber soles with stitched edges, the 2010s plates are thin frames
  G.useShape('classic');const cl=G.shape().plate;G.useShape('wrap');const wr=G.shape().plate;
  assert.ok(cl.kind==='rubber'&&cl.welt&&cl.t>=wr.t+.015&&wr.kind==='frame','a thick stitched rubber sole (1970s) vs a thin frame (2010)');
  // studs: each stud stands on the plate (its flange on the underside there), square to it, and the toe studs ride the toe spring
  for(const id of ['speed','classic','sock']){G.useShape(id);
   for(const t of ['fg','sg','blade']){const lay=G.studLayout(t),g=G.buildStudsGeometry(t),p=g.getAttribute('position'),a=g.getAttribute('aStud');
    for(const st of lay){let sum=0,n=0,tx=0,tn=0;
     for(let i=0;i<p.count;i++){const dx=p.getX(i)-st.x,dz=p.getZ(i)-st.z;if(dx*dx+dz*dz>.012)continue;if(a.getX(i)<.02){sum+=p.getY(i);n++;}if(a.getX(i)>.97){tx+=dx;tn++;}}
     assert.ok(n>0,id+' '+t+' stud found');const y=sum/n,want=G.underAt(st.x,st.z,t);
     assert.ok(Math.abs(y-want)<.02,`${id} ${t}: stud at s=${G.sAt(st.x).toFixed(2)} sits on the plate (${(y*100).toFixed(1)} vs ${(want*100).toFixed(1)} mm)`);
     if(G.sAt(st.x)>.86&&tn)assert.ok(tx/tn>.002,`${id} ${t}: the toe stud leans with the toe spring`);}
    g.dispose();}
   const toe=G.underAt(G.sx(.92),0,'fg'),ball=G.underAt(G.sx(.69),0,'fg');assert.ok(toe>ball+.02,id+': the plate rises at the toe (toe spring)');}
  // every one of the 12 stud types builds on every model, keeping the model's plate shape
  for(const m of B.MODELS){G.useShape(m.id);const kind=G.shape().plate.kind;for(const t of B.STUD_TYPES){const st=G.buildStudsGeometry(t),so=G.buildSoleGeometry(t);
   assert.ok(G.isFlatSole(t)?st===null:st&&st.getAttribute('position').count>0,m.id+' '+t+' builds');assert.equal(G.shape().plate.kind,kind);st?.dispose();so.dispose();}}
  console.log('PASS soles: edge thickness / heel wall per model '+soleInfo.join(', ')+'; arch cut-outs, heel blocks, flex grooves; studs on the plate following the toe spring');}

 // 12. Sides with real 3D form: the relief is geometry (overlays, padded collars, quilting puffs, pads, bandage strips), the inside
 //     wall is flatter than the outside, and the triangle budget holds for every model with its heaviest stud layout.
 {for(const id of ['classic','pro','fins','offset','longflap','laceless','sock','retro']){G.useShape(id);const sh=G.shape(),keep=sh.relief;
   const m=B.modelOf(id),opt={collar:m.collar??'low',laces:m.laces??'visible',studs:m.studs,detail:'phone'};
   const a=G.buildUpperGeometry(opt).geometry;sh.relief={...keep,overlay:0,collar:0,cup:0,seam:0,puff:0,quilt:0,pad:0,pads:0,panel:0,toecap:0,bands:0,cage:0,ribs:0};G.useShape(id);
   const b=G.buildUpperGeometry(opt).geometry;sh.relief=keep;G.useShape(id);
   const pa=a.getAttribute('position'),pb=b.getAttribute('position');let mx=0;for(let i=0;i<pa.count;i++)mx=Math.max(mx,Math.hypot(pa.getX(i)-pb.getX(i),pa.getY(i)-pb.getY(i),pa.getZ(i)-pb.getZ(i)));
   assert.ok(mx>=.004&&mx<.03,id+': the sides carry real relief ('+(mx*100).toFixed(2)+' mm max)');a.dispose();b.dispose();}
  G.useShape('speed');const inner=G.surface(.6,Math.PI*.25),outer=G.surface(.6,Math.PI*.75),c=G.plan(.6);
  assert.ok(Math.abs(inner.z-c.zc)/c.med>Math.abs(outer.z-c.zc)/c.lat,'the inside wall is fuller and flatter, the outside rounder');
  let worst=0,worstId='';
  for(const m of B.MODELS){G.useShape(m.id);const opt={collar:m.collar??'low',laces:m.laces??'visible',studs:m.studs,detail:'phone'},u=G.buildUpperGeometry(opt).geometry,l=G.buildLacesGeometry();
   for(const t of B.STUD_TYPES){const so=G.buildSoleGeometry(t),st=G.buildStudsGeometry(t);const tris=u.index.count/3+(opt.laces==='visible'?l.getAttribute('position').count/3:0)+so.index.count/3+(st?st.getAttribute('position').count/3:0);
    if(tris>worst){worst=tris;worstId=m.id+'+'+t;}so.dispose();st?.dispose();}u.dispose();l.dispose();}
  assert.ok(worst<=30000,'every boot on a phone stays within 30k triangles (worst '+worstId+' '+Math.round(worst)+')');
  console.log('PASS sides: geometric relief on 8 models, a flatter inside wall; triangle budget '+Math.round(worst)+' ≤ 30k ('+worstId+')');}
 G.useShape('speed');
 Module._extensions['.js']=jsLoad;
 console.log('PASS silhouettes: '+ids.length+' models build (fins, lace cover, fold-over tongues, mid/sock collars), differ pairwise, decal zones land on each');
 console.log('PASS shape: L/W '+(L/W).toFixed(2)+', instep '+instep.toFixed(2)+'·L, '+(plate*100).toFixed(1)+' mm plate, toe spring, offset lacing, '+B.STUD_TYPES.length+' stud layouts on their studs');}

// 13. Natural materials (Oct 13 2026; user: "all the boots look plastic and shiny"): the default finish is the natural one, each
//     material class has a non-glossy roughness, "glossy" is a thin clear coat, SG tips are metal, and the bake writes roughness.
{const M=require('../lib/shop/bootMaterials.ts'),N=M.NATURAL_ROUGHNESS;
 assert.equal(B.DEFAULT_BOOTS.finish,'matte','the default boot is the natural finish');
 for(const u of ['leather','synthetic','knit']){const f=M.upperFinish('matte',u),r=N[u]*f.roughK;assert.ok(r>=.45,u+' is not glossy by default (roughness '+r+')');assert.equal(f.clearcoat,0,u+': no clear coat by default');assert.equal(f.metalness,0);}
 assert.ok(N.leather>=.55&&N.leather<=.75,'leather: soft matte');assert.ok(N.synthetic>=.42&&N.synthetic<=.6,'synthetic: satin');assert.ok(N.knit>=.85,'knit: matte');
 assert.ok(M.upperFinish('matte','knit').sheen>=.8&&M.upperFinish('matte','knit').specularIntensity<=.4,'knit: a fibre sheen, no specular hotspot');
 assert.ok(M.upperFinish('matte','leather').sheen>0&&M.upperFinish('matte','leather').specularIntensity<.7,'leather: low specular, a faint sheen');
 assert.ok(N.rubber>=.8&&N.lining>=.9&&N.rubberSole>=.7&&N.gum>=.7&&N.lace>=.8,'rubber fins, pads, soles, laces and lining are matte');
 assert.ok(N.plate>=.45,'the plate is satin');assert.ok(M.plateFinish('matte',false).clearcoat===0&&M.plateFinish('matte',true).roughK===1);
 const g=M.upperFinish('glossy','synthetic');assert.ok(g.clearcoat>0&&g.clearcoat<=.6&&g.clearcoatRoughness>=.1&&N.synthetic*g.roughK>=.35,'glossy is a thin clear coat over satin, not wet plastic');
 assert.ok(M.upperFinish('metallic','synthetic').metalness>.5,'metallic still works');assert.ok(N.metalTip<.4,'SG tips: polished metal');
 assert.ok(M.studFinishParams('matte').roughness>=.7&&M.studFinishParams('chrome').metalness===1);
 // studs read as matte or satin moulded plastic, never wet gloss (fix pass Oct 13 2026): even the 'glossy' studs are a satin coat
 for(const f of ['matte','glossy'])assert.ok(M.studFinishParams(f).roughness>=.45&&M.studFinishParams(f).clearcoat<=.15,f+' studs are matte/satin');
 assert.ok(N.stud>=.5,'the default stud is satin');
 for(const p of B.PRESETS)assert.ok(['matte','metallic','iridescent','glossy'].includes(p.design.finish));
 assert.ok(B.PRESETS.filter(p=>p.design.finish==='matte').length>=B.PRESETS.length/2,'most looks show the natural finish');
 const bake=read('lib/shop/bootBake.ts'),sc=read('lib/shop/bootScene.ts');
 assert.match(bake,/gl_FragColor=vec4\(n\*\.5\+\.5,s0\.r\)/,'the bake writes per-texel roughness into the normal map alpha');assert.match(bake,/attribute float aAO/,'occlusion baked from the geometry');
 assert.match(sc,/texture2D\(normalMap,vNormalMapUv\)\.a\*uRoughK/,'the materials read the baked roughness');assert.match(sc,/function studioScene\(\)/,'a soft studio environment');
 assert.doesNotMatch(sc,/RoomEnvironment/,'no hard room lights');assert.match(sc,/function drawShadow\(\)/,'a contact shadow in the footprint');
 assert.match(sc,/vertexColors:true/,'laces with darker eyelets');
 // every boot studio source is scanned for brands (section 8)
 const all=fs.readdirSync(path.join(root,'lib/shop')).filter(f=>/^boot/.test(f)).map(f=>'lib/shop/'+f);for(const f of all)assert.ok(FILES.includes(f),f+' is in the brand scan');
 console.log('PASS materials: natural matte/satin defaults per class (leather '+N.leather+', synthetic '+N.synthetic+', knit '+N.knit+'), clear-coat glossy, metal tips, baked roughness + AO; brand scan covers '+all.length+' boot files');}

// 14. Soles that differ and real studs (Oct 13 2026, second pass; user: "the soles still look too similar ... the blade studs look
//     crude"). Each model has its own underside art, waist and stud arrangement; the moulded studs are lofted from rounded outlines
//     with a draft (wider base, narrower tip), a filleted flange, a rounded tip and smooth (shared) normals; the SG studs have a hex
//     collar and a metal tip; and a top-down sole raster of the 15 models (outline + stud footprints, with each model's own
//     preset studs) differs pairwise. The rendered check: BOOT_SOLE_BASE=http://localhost:PORT runs the sole-compare sheet in a
//     browser (all 15 Sole views in uniform colours, a pixel difference for every pair).
{const Module=require('node:module'),three=path.join(root,'node_modules/three/');
 const jsLoad=Module._extensions['.js'];Module._extensions['.js']=(m,f)=>f.startsWith(three+'examples/')?m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f):jsLoad(m,f);
 const G=require('../lib/shop/bootGeometry.ts'),sc=read('lib/shop/bootScene.ts');
 // blades, chevrons, triangles, cones: a draft (the tip narrower than the base, both ways for blades), a flange wider than the
 // body (the fillet into the plate), a rounded tip below the base, one indexed mesh (smooth normals)
 const prof={};for(const s of ['blade','bladeThin','bladeRound','slim','cluster','chevron','tri','halfmoon','cone','coneShort','pod']){const p=G.studProfile(s);prof[s]=p;
  assert.ok(p.indexed,s+' is one indexed loft (smooth shared normals, no facets)');
  assert.ok(p.tip.x<p.base.x*.9&&p.tip.z<p.base.z*.9,`${s} tapers: base ${(p.base.x*100).toFixed(1)}×${(p.base.z*100).toFixed(1)} mm → tip ${(p.tip.x*100).toFixed(1)}×${(p.tip.z*100).toFixed(1)}`);
  assert.ok(p.root.x>p.base.x+.006&&p.root.z>p.base.z+.006,s+' has a flange (bevel) where it meets the plate');
  assert.ok(p.tris<900,s+' stays light on phones ('+p.tris+' triangles)');}
 for(const s of ['blade','bladeThin','slim'])assert.ok(prof[s].tip.z<prof[s].base.z*.6&&prof[s].base.x>prof[s].base.z*2.5,s+' is a thin blade with a real draft across');
 // sleeker studs (fix pass Oct 13 2026; user: "the cones and blades still read as little cups with flat ends"): cones taper to a
 // rounded tip 35–45 % of the base, blades are long and thin and taper to a narrow edge, triangles taper hard, the flange is subtle
 for(const s of ['cone','coneShort','pod']){const r=prof[s].tip.x/prof[s].base.x;assert.ok(s==='pod'?r<.45:r>=.35&&r<=.45,`${s}: the tip is ${(r*100).toFixed(0)}% of the base`);}
 for(const s of ['blade','bladeThin','slim','cluster']){const p=prof[s];assert.ok(p.tip.z<=p.base.z*.45&&p.base.x>=p.base.z*2.9,`${s}: long and thin (${(p.base.x*100).toFixed(1)}×${(p.base.z*100).toFixed(1)} mm), a narrow edge (${(p.tip.z*100).toFixed(1)} mm)`);}
 assert.ok(prof.blade.base.x>=.18&&prof.blade.base.z<=.05,'the modern blade is longer and thinner than before (17×5.5 mm)');
 for(const s of ['tri','chevron'])assert.ok(prof[s].tip.x<=prof[s].base.x*.75&&prof[s].tip.z<=prof[s].base.z*.66,s+' tapers hard to its tip');
 for(const s of ['blade','bladeThin','slim','cluster','chevron','tri','halfmoon','cone','coneShort'])assert.ok(prof[s].root.x-prof[s].base.x<=.027&&prof[s].root.z-prof[s].base.z<=.027,s+': a subtle flange ('+((prof[s].root.x-prof[s].base.x)*100).toFixed(1)+' mm, was up to 3.5)');
 // the faces are smooth: adjacent normals round a blade's mid ring never jump (no box edges)
 {const T=require('three');const g=G.buildStudsGeometry('blade');const n=g.getAttribute('normal');let jumps=0;for(let i=0;i<n.count;i+=3){const a=new T.Vector3().fromBufferAttribute(n,i),b=new T.Vector3().fromBufferAttribute(n,i+1),c=new T.Vector3().fromBufferAttribute(n,i+2);if(a.angleTo(b)>1.2||b.angleTo(c)>1.2)jumps++;}
  assert.ok(jumps/(n.count/3)<.04,'blade normals are smooth ('+(100*jumps/(n.count/3)).toFixed(1)+'% of faces with a hard edge)');g.dispose();}
 assert.ok(G.STUD_DEPTH.sg>.15&&G.studProfile('sg').indexed,'the SG stud: a boss on the plate, a body, a long metal tip');assert.match(read('lib/shop/bootGeometry.ts'),/hexR=r0\+\.02/,'the SG stud screws in on a hex collar');
 // each model's sole is its own: art, waist, layout; the shader colours the zones (second colour, windows, see-through)
 const arts=new Set(),sigs={};
 for(const m of B.MODELS){G.useShape(m.id);const p=G.shape().plate;arts.add(p.art);}
 assert.equal(arts.size,B.MODELS.length,'every model draws its own underside');
 for(const a of arts)assert.match(sc,new RegExp('\\n '+a+':'),a+' plate art exists');
 // the Featherlight sole (fix pass Oct 13 2026; user: dark wavy lines ran across it): its plate art is the wave window and grooves
 // only (no second-colour wave lines, no dark gaps), and the upper's stitched wave line is masked to the wall above the plate
 {const w=sc.slice(sc.indexOf('\n wave:a=>{'),sc.indexOf('\n },',sc.indexOf('\n wave:a=>{')));assert.ok(w.length>40&&!/zone:'(p2|dark)'/.test(w)&&!/wavy\([^)]*\.8\d,/.test(w),'the wave sole draws no dark or second-colour lines');
  assert.match(read('lib/shop/bootBake.ts'),/if\(uSide\.x>0\.\)\{[^\n]*\*smoothstep\(\.2,\.26,yr\);/,'the stitched wave line stays on the upper, above the plate');}
 assert.match(sc,/uniform sampler2D uZone/,'the plate shader reads the zone texture');assert.match(sc,/uPlate2/,'a second plate colour');
 // top-down raster: the plate outline (waist, narrow heel, scalloped edge) and every stud's footprint for the model's preset studs
 const RW=128,RH=48,ras=id=>{G.useShape(id);const m=B.modelOf(id),pre=B.PRESETS.find(p=>p.design.model===id),studs=pre.design.studs,img=new Float32Array(RW*RH),lay=G.studLayout(studs),sole=G.buildSoleGeometry(studs),pos=sole.getAttribute('position');
  const X=x=>Math.round((x+1.45)/2.9*(RW-1)),Z=z=>Math.round((z+.6)/1.2*(RH-1));
  for(let i=0;i<pos.count;i++){const y=pos.getY(i),x=pos.getX(i),z=pos.getZ(i),s=G.sAt(x);if(y<G.base(s)-.004){const k=Z(z)*RW+X(x);if(k>=0&&k<img.length)img[k]=Math.max(img[k],.4);}}
  for(const st of lay){const L=(st.shape==='sg'||st.shape==='sgShort'||st.shape==='cone'||st.shape==='pod'||st.shape==='ag'||st.shape==='nub'||st.shape==='coneShort')?0:.08*st.scale,R=.05*st.scale;
   for(let t=-1;t<=1;t+=.1){const x=st.x+Math.cos(st.yaw)*L*t,z=st.z-Math.sin(st.yaw)*L*t;for(let dz=-R;dz<=R;dz+=.02)for(let dx=-R;dx<=R;dx+=.02){if(dx*dx+dz*dz>R*R)continue;const k=Z(z+dz)*RW+X(x+dx);if(k>=0&&k<img.length)img[k]=1;}}}
  sole.dispose();void m;return img;};
 for(const m of B.MODEL_IDS)sigs[m]=ras(m);
 let min=1,minPair='';const ids=Object.keys(sigs);for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const a=sigs[ids[i]],b=sigs[ids[j]];let d=0;for(let k=0;k<a.length;k++)d+=Math.abs(a[k]-b[k]);d/=a.length;if(d<min){min=d;minPair=ids[i]+'/'+ids[j];}}
 assert.ok(min>.03,'every pair of soles differs in outline and studs (closest '+minPair+' '+(min*100).toFixed(1)+'%)');
 // heat: the heaviest model × stud layout on a phone stays within budget (the stud loft has a phone level of detail)
 let worst=0,wid='';for(const m of B.MODELS){G.useShape(m.id);for(const t of B.STUD_TYPES){const st=G.buildStudsGeometry(t,'phone');const n=st?st.getAttribute('position').count/3:0;if(n>worst){worst=n;wid=m.id+'+'+t;}st?.dispose();}}
 assert.ok(worst<=8000,'the heaviest stud layout on a phone: '+worst+' triangles ('+wid+') ≤ 8k');
 G.useShape('speed');Module._extensions['.js']=jsLoad;
 console.log('PASS soles 2: '+arts.size+' undersides; studs taper and fillet (blade '+(prof.blade.base.x*100).toFixed(0)+'×'+(prof.blade.base.z*100).toFixed(1)+' → '+(prof.blade.tip.x*100).toFixed(0)+'×'+(prof.blade.tip.z*100).toFixed(1)+' mm), smooth normals; closest sole raster '+minPair+' '+(min*100).toFixed(1)+'%; heaviest studs '+worst+' (phone)');
 if(process.env.BOOT_SOLE_BASE)soleCompare(process.env.BOOT_SOLE_BASE).catch(e=>{console.error(e);process.exitCode=1;});}

/** The sole-compare sheet (browser): every model's Sole view in the same colours, shrunk to 128×48 grey, compared pairwise. */
async function soleCompare(BASE){const {chromium}=require('@playwright/test'),TH=5;
 const U={toe:'#f6f3ea',mid:'#f6f3ea',heel:'#f6f3ea',collar:'#f6f3ea',laces:'#f6f3ea',soleplate:'#c9ccd2',studs:'#18191d',tips:'#18191d',accent:'#d7262e'};
 const b=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});const px={};
 try{for(const m of B.MODEL_IDS){const pre=B.PRESETS.find(p=>p.design.model===m);const d={...B.DEFAULT_BOOTS,...pre.design,pattern:'solid',finish:'matte',studFinish:'matte',colors:U,number:null};
  const ctx=await b.newContext({viewport:{width:1440,height:900}});const page=await ctx.newPage();await page.addInitScript(s=>localStorage.setItem('fi2-shop-boots-v1',s),JSON.stringify({v:1,current:d,slots:[null,null,null]}));
  await page.goto(BASE+'/shop-lab/boots',{waitUntil:'domcontentloaded',timeout:180000});await page.waitForFunction(()=>window.__bootStudio,null,{timeout:180000});await page.waitForTimeout(600);
  await page.evaluate(()=>window.__bootStudio.pose(0,-1.5707));await page.waitForTimeout(600);
  const shot=(await page.locator('canvas').screenshot()).toString('base64');
  px[m]=await page.evaluate(async src=>{const im=new Image();im.src='data:image/png;base64,'+src;await im.decode();const c=document.createElement('canvas');c.width=128;c.height=48;const g=c.getContext('2d');
   g.drawImage(im,im.width*.06,im.height*.3,im.width*.88,im.height*.42,0,0,128,48);const a=g.getImageData(0,0,128,48).data,o=[];for(let i=0;i<a.length;i+=4)o.push(.2126*a[i]+.7152*a[i+1]+.0722*a[i+2]);return o;},shot);
  await ctx.close();}}finally{await b.close();}
 let min=100,pair='';const ids=Object.keys(px);for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){let d=0;const a=px[ids[i]],c=px[ids[j]];for(let k=0;k<a.length;k++)d+=Math.abs(a[k]-c[k]);d=d/a.length/2.55;if(d<min){min=d;pair=ids[i]+'/'+ids[j];}}
 assert.ok(min>TH,'every pair of rendered soles differs by more than '+TH+'% (closest '+pair+' '+min.toFixed(2)+'%)');
 console.log('PASS sole compare (browser): 15 Sole views, closest pair '+pair+' '+min.toFixed(2)+'% > '+TH+'%');}

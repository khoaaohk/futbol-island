// Leftovers QA round (Nov 14 2026): source contracts for the small fixes that have no engine to unit-test.
const fs=require('fs'),assert=require('assert'),read=p=>fs.readFileSync(p,'utf8');
let n=0;const ok=(name,fn)=>{fn();n++;};
ok('arcade room: a pin over the player shows while a cabinet hides them',()=>{const s=read('lib/arcade/arcadeRoomScene.ts');
 assert.match(s,/new T\.MeshBasicMaterial\(\{color:'#81fbed',depthTest:false/);assert.match(s,/playerPin\.renderOrder=999/);
 assert.match(s,/const hiddenBehindCabinet=\(px:number,pz:number\)=>/);assert.match(s,/crowd\.update\(dt,time,x,z\);updatePlayerPin\(time\);/);});
ok('Kit Rush: the NEW BEST burst sits below the Best chip',()=>{assert.match(read('components/games/KitRushGame.module.css'),/\.stamp\{position:absolute;right:-16px;top:18px\}/);});
ok('binder: the full-back side tab fits ("Backs")',()=>{assert.match(read('components/CardCollection.tsx'),/fullback:'Backs'/);});
ok('lineup format landings: the h1 follows the builder format (server text = the registry h1)',()=>{
 const ts=require('typescript');require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
 const src=read('lib/site/tools/registry.ts'),{lineupHeading}=require('../lib/site/tools/lineupHeading.ts');
 for(const f of ['7v7','9v9','11v11','futsal']){const m=new RegExp(`slug:'${f}-lineup-builder'[^}]*?h1:'([^']*)'`).exec(src);assert(m,f);assert.equal(lineupHeading(f),m[1],`${f} heading words match the registry h1`);}
 assert.match(read('components/site/tools/LineupBuilder.tsx'),/useEffect\(\(\)=>\{window\.dispatchEvent\(new CustomEvent\(LINEUP_FORMAT_EVENT,\{detail:format\}\)\);\},\[format\]\)/);
 assert.match(read('components/site/tools/LineupHeading.tsx'),/addEventListener\(LINEUP_FORMAT_EVENT,on\)/);
 assert.match(read('app/(site)/tools/[slug]/page.tsx'),/headingFormat=\{p\.format&&lineupHeading\(p\.format\)===p\.h1\?p\.format:undefined\}/);});
ok('a11y: guide tables named once; the Explore panel body is focusable while it has nothing else to focus',()=>{
 assert.match(read('lib/site/GuideParts.tsx'),/role="region" aria-label=\{label\}><table className=\{styles\.table\}>/);
 assert.match(read('components/IslandSettings.tsx'),/<div ref=\{body\} className=\{shell\.body\} \{\.\.\.\(tab==='exploration'\?\{tabIndex:0,role:'region','aria-labelledby':'island-settings-title'\}/);});
ok('lessons on phones: radar clear of the caption, Choose plays clear of Done at 320, no doubled chips, no half-cut tokens',()=>{
 assert.match(read('components/IslandMapFrame.module.css'),/@media\(max-width:600px\) and \(min-height:421px\)\{\.frame\{top:calc\(76px[^}]*bottom:auto/);
 assert.match(read('components/FieldLearning.module.css'),/@media\(max-width:350px\)\{\.corners \.choose,\.corners button\.choose\[data-navigation\]\{--navigation-width:132px;left:calc\(50% - 12px\)\}\}/);
 assert.match(read('components/VisualQuestion.tsx'),/focus\.has\(id\)&&!thumb&&!labelled\.has\(id\)&&<Chip/);
 const ts=require('typescript');require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
 const {frameView}=require('../lib/town/visualQuiz.ts');
 const pose={ball:{x:135,y:200},positions:new Map([['a',{x:135,y:200}],['b',{x:150,y:240}],['gk',{x:135,y:158}],['far',{x:135,y:60}]]),trails:new Map()};
 const v=frameView({fmt:'7v7'},{focus:['a','b']},pose);assert.ok(v.y<=158-12,'a keeper straddling the top edge is pulled fully in');assert.ok(v.y>60,'a player well outside stays out');});
ok('stadium: the row in front of a seated player clears; nothing to clear on the front row or off the stands',()=>{
 const load=require('./summit-harness.cjs').createLoader(),C=load('lib/town/stadiumCrowd.ts'),S=load('lib/town/stadiumSeats.ts'),T=require('three');
 const west=S.STANDS.find(s=>s.id==='west'),v=new T.Vector3();
 const at=row=>S.standWorld(west,west.inner+row*S.ROW_DEPTH+S.SEAT_DEPTH-.04,5);
 const p=at(4);assert.ok(C.aheadClear(p.x,p.z,v));const f=at(3);assert.ok(Math.hypot(v.x-f.x,v.y-f.z)<1e-6&&v.z===C.AHEAD_RADIUS,'the spot one row down');
 const p0=at(0);assert.equal(C.aheadClear(p0.x,p0.z,v),false);assert.equal(v.z,-1,'front row: nothing ahead');
 assert.equal(C.aheadClear(0,0,v),false,'on the pitch: nothing');
 assert.match(read('lib/town/stadiumCrowd.ts'),/transformed\*=1\.-step\(distance\(fanAt\.xz,uClearA\.xy\),uClearA\.z\);/);});
ok('stadium: a take-off under a stand roof is held under it; roof ends have walls like the long edges',()=>{
 const load=require('./summit-harness.cjs').createLoader(),F=load('lib/town/stadiumFlight.ts'),S=load('lib/town/stadiumSeats.ts');
 const west=S.STANDS.find(s=>s.id==='west'),seat=S.standWorld(west,west.inner+5*S.ROW_DEPTH,10),pitch=S.standWorld(west,20,10);
 assert.equal(F.roofCeiling(seat.x,seat.z,S.rowHeight(5)),F.ROOF_CEILING,'under the roof');assert.ok(F.ROOF_CEILING+1.8<S.ROOF.y-S.FRONT_FRAME.below,'head stays under the frame');
 assert.ok(F.ROOF_CEILING>S.CONCOURSE_HEIGHT+1,'room to hover over the top row');
 assert.equal(F.roofCeiling(pitch.x,pitch.z,3),Infinity,'over the pitch: free');assert.equal(F.roofCeiling(seat.x,seat.z,S.ROOF.y+.3),Infinity,'already above the roof');
 const town=read('components/Town.tsx');assert.equal((town.match(/flight\.height=Math\.min\(flight\.height,Math\.max\(was,roofCeiling\(location\.x,location\.z,was\)\)\);/g)||[]).length,2,'take-off/cruise and the landing glide');
 assert.match(read('lib/town/stadiumWorld.ts'),/for\(const \[e0,e1\] of \[\[a0-P,a0\+\.12\],\[a1-\.12,a1\+P\]\] as const\)\{const r=standRect\(s,ROOF\.front\+\.12,ROOF\.back-\.12,e0,e1\);[\s\S]{0,120}rails\.push/);});
ok('island: a chat bubble starts above a shown name tag; viewers clear of the screen-post lanes',()=>{
 assert.match(read('components/Town.tsx'),/chatterBubbles\.follow\(i,sp\.position\.x,sp\.position\.y\+\(sp\.label\.visible\?2\.5\*sp\.rig\.profileScale\+\.62:2\.75\*sp\.rig\.profileScale\)/);
 assert.match(read('lib/graphics/islandNpcs.ts'),/label\.position\.y=2\.5;label\.scale\.set\(3\.5\/rig\.profileScale,1\.094\/rig\.profileScale/,'tag size the bubble lift assumes');
 const spots=[...read('lib/town/stadiumNpcs.ts').matchAll(/\['stadium-viewer-[a-z]+',(-?[\d.]+),(-?[\d.]+)\]/g)].map(m=>+m[1]);assert.equal(spots.length,6);
 for(const dx of spots)assert.ok(Math.abs(dx)<=3.6,'viewer within 3.6 m of the middle (posts at ±6.5): '+dx);});
console.log(`qa-leftovers-nov14: ${n} groups passed`);

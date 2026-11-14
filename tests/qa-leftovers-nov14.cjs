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
console.log(`qa-leftovers-nov14: ${n} groups passed`);

// SEO leftovers guard (Nov 20 2026, verify pass). No build: the real modules are transpiled as in tests/seo-rules-terms-sizes.cjs.
//  1. Every Spanish cross link (lib/i18n/es/crossLinks.ts) of every Spanish rule and term page points at an existing /es page.
//  2. Every lesson description, English and Spanish, is 120 to 155 characters, and any step or question count it states is the lesson's own.
// usage: node tests/seo-es-crosslinks-lesson-desc.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.join(__dirname,'..');process.chdir(root);
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const cache=new Map();
const cssProxy=new Proxy({},{get:(_,k)=>typeof k==='string'?k:undefined});
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const req=id=>{
  if(id==='next/navigation')return {notFound:()=>{throw new Error('NEXT_NOT_FOUND');}};
  if(/\.css$/.test(id))return {__esModule:true,default:cssProxy};
  if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
  const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
  for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
  throw new Error('Cannot resolve '+id+' from '+file);};
 new Function('exports','module','require',out)(mod.exports,mod,req);
 return mod.exports;
}
const L=rel=>load(path.join(root,rel));
const esPaths=L('lib/i18n/esPaths.ts'),cross=L('lib/i18n/es/crossLinks.ts'),lessons=L('lib/site/lessons.ts'),esLessons=L('lib/i18n/es/lessons.ts');
const ES=new Set(esPaths.ES_PAGES.map(p=>esPaths.toEs(p)));
let links=0;
for(const [kind,slugs,fn] of [['rule',esPaths.ES_RULE_SLUGS,cross.esRuleCrossLinks],['term',esPaths.ES_TERM_SLUGS,cross.esTermCrossLinks]])for(const slug of slugs){
 const list=fn(slug);
 assert(new Set(list.map(x=>x.path)).size===list.length,`${kind} ${slug}: a Spanish cross link is listed twice`);
 for(const x of list){links++;
  assert(x.path.startsWith('/es/')&&ES.has(x.path),`${kind} ${slug}: Spanish cross link ${x.path} is not an existing /es page`);
  assert(x.name&&x.line,`${kind} ${slug}: Spanish cross link ${x.path} has a name and a line`);}}
assert(links>=40,`Spanish cross links exist (${links})`);
const count=(d,re,want,where)=>{const m=d.match(re);if(m)assert.equal(Number(m[1]),want,`${where}: the count in "${d}" matches the lesson data`);};
assert(lessons.LESSONS.length>=90,'the lessons loaded');
for(const l of lessons.LESSONS){
 const d=lessons.lessonDescription(l);
 assert(d.length>=120&&d.length<=155,`EN lesson ${l.id}: description is ${d.length} characters (120-155): ${d}`);
 count(d,/(\d+) (?:coach )?steps?\b/,l.steps.length,`EN ${l.id}`);count(d,/(\d+) quiz questions?\b/,l.questions.length,`EN ${l.id}`);}
for(const l of esLessons.ES_LESSONS()){
 const d=esLessons.lessonDescriptionEs(l);
 assert(d.length>=120&&d.length<=155,`ES lesson ${l.id}: description is ${d.length} characters (120-155): ${d}`);
 count(d,/(\d+) pasos?\b/,l.steps.length,`ES ${l.id}`);count(d,/(\d+) preguntas?\b/,l.questions.length,`ES ${l.id}`);}
console.log(`seo-es-crosslinks-lesson-desc: ok (${links} Spanish cross links, ${lessons.LESSONS.length} EN + ${esLessons.ES_LESSONS().length} ES lesson descriptions)`);

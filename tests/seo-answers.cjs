// Answer-first pages (SEO CTR round, Nov 16 2026; docs/seo-ctr/LLM-CHECKLIST.md). Data-level and fast: every term, rule,
// position and drill-guide page opens with a stand-alone answer an AI assistant or a search snippet can quote.
//  1. The first sentence of `answer` (terms, rules, positions, the positions-by-number page) or `lead` (drill guides) is at most
//     45 words and says "soccer" or "futsal" (or "football").
//  2. A term page's first sentence names the term (its name, or one of its `also` names), so the definition stands alone.
//  3. Every FAQ question ends with "?" (question-shaped, matching how people search) and there are 3 to 5 of them.
//  4. llms.txt has the "Short answers" section and links the new pages.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const SITE='https://futbolisland.app';

// ---- loader: the REAL modules, TypeScript transpiled into a vm ----------------------------------------------------------------
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext(out,{Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,RegExp,Date,Boolean,Infinity,NaN,isFinite,console,URL,URLSearchParams,
  setTimeout,clearTimeout,process:{env:{NODE_ENV:'production'},cwd:()=>root},exports:mod.exports,module:mod,require:id=>{
  if(id==='next/navigation')return {notFound:()=>{throw new Error('NEXT_NOT_FOUND');}};
  if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
  const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
  for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
  throw new Error('Cannot resolve '+id+' from '+file);}});
 return mod.exports;
}
const L=rel=>load(path.join(root,rel));
const terms=L('lib/site/terms.ts'),rules=L('lib/site/rules.ts'),positions=L('lib/site/positions.ts'),nums=L('lib/site/positionNumbers.ts'),dg=L('lib/site/drillGuides.ts'),llms=L('lib/site/llms.ts').llmsText();
const first=s=>s.replace(/\s+/g,' ').trim().split(/(?<=[.!?])\s+(?=[A-Z0-9“])/)[0];
const words=s=>s.split(' ').filter(Boolean).length;
const norm=s=>s.toLowerCase().replace(/[‐-]/g,' ').replace(/-/g,' ');
let n=0;
const check=(where,answer,faq)=>{n++;const f=first(answer);
 assert(words(f)<=45,`${where}: the first sentence is ${words(f)} words (<= 45): ${f}`);
 assert(/soccer|futsal|football/i.test(f),`${where}: the first sentence says soccer, futsal or football: ${f}`);
 if(faq){assert(faq.length>=3&&faq.length<=5,`${where}: 3-5 FAQ questions`);for(const q of faq)assert(/\?$/.test(q.q),`${where}: FAQ is a question: ${q.q}`);}
 return f;};
for(const t of terms.TERM_PAGES){const f=norm(check(t.path,t.answer,t.faq));
 const names=[t.name,...(t.also?t.also.split(', '):[])].map(norm);assert(names.some(x=>f.includes(x)),`${t.path}: the first sentence names the term (${names.join(' / ')}): ${f}`);}
for(const r of rules.RULES)check(r.path,r.answer,r.faq);
for(const p of positions.POSITIONS)check(p.path,p.answer,p.faq);
check(nums.NUMBERS_PATH,nums.NUMBERS_PAGE.answer,nums.NUMBERS_PAGE.faq);
for(const g of dg.DRILL_GUIDES)check(g.path,g.lead,g.faq);
assert(/^## Short answers$/m.test(llms),'llms.txt: Short answers section');
for(const p of [nums.NUMBERS_PATH,'/learn/soccer-terms/free-kick-wall','/learn/soccer-drills/defending'])assert(llms.includes(`(https://futbolisland.app${p})`),`llms.txt links ${p}`);
assert(/futbolisland\.app\/scan\b/.test(llms)&&/futbolisland\.app\/coach\b/.test(llms),'llms.txt names the /scan and /coach apps');
console.log(`seo-answers: ${n} answer-first pages ok`);

// Card and fish page notes (SEO, Nov 14 2026; Search Console: the card and fish pages were "Crawled – currently not indexed",
// about 200 unique words each). lib/site/cardNotes.json / fishNotes.json, lib/site/cardNotes.ts / fishNotes.ts.
//  1. Sources: every note is for a real card / fish; word ranges; every card fact has a source URL (Wikipedia on every card);
//     no links, URLs, statistics, heading advice or stale wording in kid-facing text; every note's sentences are its own; the
//     drill a card links exists; the source docs are up to date (scripts/gen-content-sources.cjs --check); the game tips and the
//     related-fish links are there for every fish; the pages render the sections.
//  2. A built site (NEXT_DIST_DIR or .next): every card and fish page is prerendered with one self canonical, JSON-LD that
//     parses (an Article about the Person / Thing on enriched pages, no ratings), no outside links in the page body, and a minimum
//     of words found on no other page of the family (sentences unique to the page, the same count as tests/seo-boost.cjs).
// usage: node tests/cards-seo.cjs   (build first for part 2: NEXT_DIST_DIR=.next-cards npm run -s build:quiet)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.join(__dirname,'..'),read=rel=>fs.readFileSync(path.join(root,rel),'utf8'),SITE='https://futbolisland.app';
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext(out,{Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,RegExp,Date,Boolean,Infinity,NaN,isFinite,console,URL,URLSearchParams,
  setTimeout,clearTimeout,process:{env:{NODE_ENV:'production'},cwd:()=>root},exports:mod.exports,module:mod,require:id=>{
  if(id==='next/navigation')return {notFound:()=>{throw new Error('NEXT_NOT_FOUND');}};
  if(id==='next/og')return {ImageResponse:class{}};
  if(id.endsWith('.css'))return new Proxy({},{get:(_,k)=>String(k)});
  if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
  const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
  for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
  throw new Error('Cannot resolve '+id+' from '+file);}});
 return mod.exports;
}
const L=rel=>load(path.join(root,rel));
const words=s=>s.trim().split(/\s+/).filter(Boolean).length;
const sentences=s=>s.split(/(?<=[.!?:])\s+/).map(x=>x.trim()).filter(x=>x.length>12);
const issues=[],check=(ok,msg)=>{if(!ok)issues.push(msg);};
/** Kid-facing text: no links or web addresses, no statistics, no heading advice, nothing that dates ("currently", "today's"). */
function kidSafe(t,who,heading=true){
 check(!/https?:|www\.|\.com\b|\.org\b|<a\b/i.test(t),`${who}: no links or web addresses in kid-facing text: ${t.slice(0,60)}`);
 check(!/\d+\s?%|percent/i.test(t),`${who}: no statistics: ${t.slice(0,60)}`);
 check(!heading||!/\bhead (?:it|the ball)\b|\bheaders?\b(?! the)|\bheading\b/i.test(t)||/never|no heading|not head|do not|don’t|don't/i.test(t),`${who}: no heading advice: ${t.slice(0,60)}`);
 check(!/\bcurrently\b|\bthese days\b|\bstill plays\b|\bnowadays\b|\btoday's best\b|\bbest (?:player|keeper|goalkeeper|defender|striker) in the world\b/i.test(t),`${who}: nothing that goes stale: ${t.slice(0,60)}`);
}
const MIN_CARDS=150,MIN_FISH=160;
// ---- 1. sources -----------------------------------------------------------------------------------------------------------------
const CN=L('lib/site/cardNotes.ts'),FN=L('lib/site/fishNotes.ts'),cards=L('lib/site/cards.ts').SITE_CARDS,fish=L('lib/site/fish.ts').SITE_FISH,D=L('lib/site/drills.ts');
const byName=new Map(cards.map(c=>[c.name,c])),seen=new Map();
const own=(t,who)=>{for(const s of sentences(t)){check(!seen.has(s),`${who}: sentence also on ${seen.get(s)}: ${s.slice(0,60)}`);seen.set(s,who);}};
const cardKeys=Object.keys(CN.CARD_NOTES);
assert(cardKeys.length>=MIN_CARDS,`at least ${MIN_CARDS} cards have notes (${cardKeys.length})`);
for(const name of cardKeys){
 const n=CN.CARD_NOTES[name],c=byName.get(name),who=`card ${name}`;
 check(c,`${who}: a real card (roster name)`);
 check(words(n.why)>=50&&words(n.why)<=110,`${who}: why is 50-110 words (${words(n.why)})`);
 check(words(n.learn.text)>=22&&words(n.learn.text)<=65,`${who}: learn is 22-65 words (${words(n.learn.text)})`);
 check(D.drillBySlug(n.learn.drill),`${who}: drill ${n.learn.drill} exists`);
 check(n.facts.length>=1&&n.facts.length<=2,`${who}: 1 or 2 facts`);
 for(const f of n.facts){check(words(f.text)>=10&&words(f.text)<=50,`${who}: fact is 10-50 words`);
  check(f.src.length>=1&&f.src.every(u=>/^https:\/\/[^\s]+$/.test(u)),`${who}: every fact has https source URLs`);}
 check(n.facts.some(f=>f.src.some(u=>/^https:\/\/[a-z]+\.wikipedia\.org\//.test(u))),`${who}: checked against Wikipedia`);
 check(/^2026-\d\d-\d\d$/.test(n.checked),`${who}: checked date`);
 for(const t of [n.why,n.learn.text,...n.facts.map(f=>f.text)]){kidSafe(t,who);own(t,who);}
 const words_=words(n.why)+words(n.learn.text)+n.facts.reduce((a,f)=>a+words(f.text),0);
 check(words_>=110,`${who}: about 120-200 new words (${words_})`);
}
const fishKeys=Object.keys(FN.FISH_NOTES),fishIds=new Set(fish.map(f=>f.id));
assert(fishKeys.length>=MIN_FISH,`at least ${MIN_FISH} fish have notes (${fishKeys.length})`);
for(const id of fishKeys){
 const n=FN.FISH_NOTES[id],who=`fish ${id}`;
 check(fishIds.has(id),`${who}: a real Fishbook id`);
 check(words(n.lives)>=10&&words(n.lives)<=40,`${who}: lives is 10-40 words (${words(n.lives)})`);
 check(words(n.fact)>=30&&words(n.fact)<=85,`${who}: fact is 30-85 words (${words(n.fact)})`);
 check(n.src.length>=1&&n.src.every(u=>/^https:\/\/[^\s]+$/.test(u)),`${who}: https source URLs`);
 for(const t of [n.lives,n.fact]){kidSafe(t,who,false);own(t,who);}
}
assert.deepEqual(issues.slice(0,40),[],`${issues.length} note problems`);
// the game tips and related fish: every fish
for(const f of fish){const tips=FN.fishCatchTips(f);
 assert(tips.length>=4&&tips.every(t=>t.length>20&&!/undefined|NaN/.test(t)),`${f.id}: game tips`);tips.forEach(t=>kidSafe(t,f.id));}
const relFish=fish.filter(f=>{const r=FN.withRelatedFish(f,L('lib/site/related.ts').fishRelated(f));return r.groups[0]?.title.startsWith('Related fish');}).length;
assert(relFish>=fish.length-3,`related fish on (nearly) every fish page (${relFish}/${fish.length})`);
// docs: every URL listed, and the generated docs are current
try{execFileSync('node',[path.join(root,'scripts/gen-content-sources.cjs'),'--check'],{stdio:'pipe'});}catch(e){assert.fail(String(e.stderr||e.message).trim());}
const cardDoc=read('docs/card-content-sources.md'),fishDoc=read('docs/fishing-content-sources.md');
for(const name of cardKeys)for(const f of CN.CARD_NOTES[name].facts)for(const u of f.src)assert(cardDoc.includes(u),`card ${name}: ${u} in docs/card-content-sources.md`);
for(const id of fishKeys){assert(fishDoc.includes('`'+id+'`'),`fish ${id} listed in docs/fishing-content-sources.md`);for(const u of FN.FISH_NOTES[id].src)assert(fishDoc.includes(u),`fish ${id}: ${u} in the doc`);}
// pages render the sections
const cp=read('app/(site)/cards/[number]/page.tsx'),fp=read('app/(site)/fish/[id]/page.tsx');
for(const id of ['why','learn','know'])assert(cp.includes(`id="${id}"`),`card page has the ${id} section`);
assert.match(cp,/cardArticleLd\(/,'enriched cards describe themselves as an Article');
for(const id of ['wild','catch'])assert(fp.includes(`id="${id}"`),`fish page has the ${id} section`);
assert.match(fp,/withRelatedFish\(/,'fish pages link related fish');
const sample=cards.find(c=>CN.CARD_NOTES[c.name]),ld=CN.cardArticleLd({c:sample,n:CN.CARD_NOTES[sample.name],path:'/cards/'+sample.number,description:'d',image:'/x.png',modified:'2026-11-14',person:{'@type':'Person',name:sample.displayName}});
assert.equal(ld['@type'],'Article');assert.equal(ld.about['@type'],'Person');assert(!('aggregateRating' in ld)&&!('review' in ld),'no ratings');
console.log(`cards-seo: source checks OK (${cardKeys.length} cards, ${fishKeys.length} fish with notes)`);

// ---- 2. built site ---------------------------------------------------------------------------------------------------------------
const dist=path.join(root,process.env.NEXT_DIST_DIR||'.next'),app=path.join(dist,'server/app');
if(!fs.existsSync(path.join(app,'cards'))||!fs.existsSync(path.join(app,'fish'))){console.log(`  SKIP built-site checks: no build in ${path.relative(root,dist)}`);process.exit(0);}
const strip=s=>s.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<style[\s\S]*?<\/style>/g,' ').replace(/<svg[\s\S]*?<\/svg>/g,' ');
const textOf=h=>{const m=h.match(/<main[\s\S]*<\/main>/);return strip(m?m[0]:h).replace(/<[^>]+>/g,' ').replace(/&#x27;|&#39;/g,'\'').replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&[a-z#0-9]+;/gi,' ').replace(/\s+/g,' ').trim().replace(/[’']/g,'\'');};
const problems=[],fam={card:[],fish:[]};
for(const c of cards)fam.card.push([`/cards/${c.number}`,!!CN.CARD_NOTES[c.name]]);
for(const f of fish)fam.fish.push([`/fish/${f.id}`,!!FN.FISH_NOTES[f.id]]);
const texts={};
for(const [f,list] of Object.entries(fam))for(const [p,rich] of list){
 const file=path.join(app,p.slice(1)+'.html');if(!fs.existsSync(file)){problems.push(`${p}: not prerendered`);continue;}
 const h=fs.readFileSync(file,'utf8');
 const canon=[...h.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(m=>m[1]);
 if(canon.length!==1||canon[0]!==SITE+p)problems.push(`${p}: canonical ${canon.join(',')||'none'}`);
 const lds=[...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>{try{return JSON.parse(m[1]);}catch{problems.push(`${p}: JSON-LD does not parse`);return {};}});
 const main=lds.find(x=>x['@type']==='Article'||x['@type']==='CreativeWork');
 if(!main)problems.push(`${p}: no Article / CreativeWork JSON-LD`);
 else{if(rich&&main['@type']!=='Article')problems.push(`${p}: enriched page is not an Article`);
  if(rich)for(const k of ['headline','description','datePublished','dateModified','author','publisher','image'])if(!main[k])problems.push(`${p}: Article without ${k}`);
  if(JSON.stringify(main).match(/aggregateRating|"review"/))problems.push(`${p}: ratings in JSON-LD`);}
 const body=(h.match(/<main[\s\S]*<\/main>/)||[''])[0];
 for(const m of body.matchAll(/<a\b[^>]*href="(https?:\/\/[^"]+)"/g))if(!m[1].startsWith(SITE))problems.push(`${p}: outside link ${m[1]}`);
 texts[p]=[f,rich,textOf(h)];
}
const MIN={card:{rich:300,plain:150},fish:{rich:260,plain:250}},stats={};
for(const f of Object.keys(fam)){const ps=Object.keys(texts).filter(p=>texts[p][0]===f),sents=ps.map(p=>texts[p][2].split(/(?<=[.!?:])\s+/).filter(s=>s.length>12)),df=new Map();
 sents.forEach(ss=>new Set(ss).forEach(s=>df.set(s,(df.get(s)||0)+1)));
 ps.forEach((p,i)=>{const u=sents[i].filter(s=>df.get(s)===1).reduce((a,s)=>a+s.split(' ').length,0),rich=texts[p][1],k=`${f} ${rich?'with notes':'without'}`;
  (stats[k]??=[]).push(u);const min=MIN[f][rich?'rich':'plain'];if(u<min)problems.push(`${p}: ${u} unique words (${k} minimum ${min})`);});}
assert.deepEqual(problems.slice(0,30),[],`${problems.length} built-page problems`);
const avg=a=>Math.round(a.reduce((x,y)=>x+y,0)/a.length);
console.log(`cards-seo: ${Object.keys(texts).length} built card and fish pages OK; unique words ${Object.entries(stats).map(([k,a])=>`${k}: min ${Math.min(...a)} / avg ${avg(a)} (${a.length})`).join('; ')}`);

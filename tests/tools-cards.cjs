// The tools hub cards (Nov 17 2026, components/site/tools/ToolCards.tsx + ToolIcons.tsx). Same method as tests/seo-tools.cjs:
// the REAL page modules are transpiled and rendered to static HTML. On /tools and /es/tools: every tool page is one card, every
// card is a link with an energy-bar icon (16x16, aria-hidden, the brown outline), each group has its own tint, and the four
// group headings are still h2s. Every icon kind is drawn. usage: node tests/tools-cards.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.join(__dirname,'..');process.chdir(root);
const cache=new Map(),cssProxy=new Proxy({},{get:(_,k)=>typeof k==='string'?k:undefined});
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const req=id=>{
  if(id==='next/navigation')return {notFound:()=>{throw new Error('NEXT_NOT_FOUND');},usePathname:()=>'/',useRouter:()=>({})};
  if(/\.css$/.test(id))return {__esModule:true,default:cssProxy};
  if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
  const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
  for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
  throw new Error('Cannot resolve '+id+' from '+file);};
 new Function('exports','module','require',out)(mod.exports,mod,req);
 return mod.exports;
}
const L=rel=>load(path.join(root,rel));
const {renderToStaticMarkup}=require('react-dom/server'),React=require('react');
const reg=L('lib/site/tools/registry.ts'),icons=L('components/site/tools/ToolIcons.tsx');
const en=renderToStaticMarkup(React.createElement(L('app/(site)/tools/page.tsx').default,{}));
const es=renderToStaticMarkup(L('components/es/pages/ToolsEs.tsx').toolsEsRoute('/tools').render());

function check(h,lang,prefix){
 const lists=[...h.matchAll(/<ul[^>]*data-tool-cards=""[^>]*>([\s\S]*?)<\/ul>/g)];
 assert.equal(lists.length,4,`${lang}: four card groups`);
 assert.deepEqual(lists.map(m=>/data-tint="([^"]+)"/.exec(m[0])[1]),['lineups','time','practice','print'],`${lang}: each group has its own tint`);
 const cards=[...h.matchAll(/<a [^>]*data-tool-card="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
 const hrefs=cards.map(m=>/href="([^"]+)"/.exec(m[0])[1]);
 const want=reg.TOOL_PAGES.filter(p=>p.path!==reg.TOOLS_HUB.path).map(p=>prefix+p.path);
 assert.deepEqual([...hrefs].sort(),[...want].sort(),`${lang}: one card per tool page, no more, no less`);
 for(const [a,kind,inner] of cards){
  const where=`${lang} card ${/href="([^"]+)"/.exec(a)[1]}`;
  assert(/^<a [^>]*class="card"/.test(a),`${where}: the whole card is the link`);
  const svg=/<svg[^>]*>/.exec(inner);assert(svg,`${where}: has an icon`);
  assert(/viewBox="0 0 16 16"/.test(svg[0])&&/data-tool-icon="/.test(svg[0]),`${where}: a 16x16 tool icon`);
  assert(/<span class="tile" aria-hidden="true">/.test(inner),`${where}: the icon is decorative`);
  assert(inner.includes('#7a4e12'),`${where}: the energy-bar outline`);
  assert(/class="name">[^<]{4,}</.test(inner),`${where}: a name`);
  assert(/class="line">[^<]{8,}</.test(inner),`${where}: its one line`);
  assert.equal(kind,icons.toolIconFor(/href="([^"]+)"/.exec(a)[1]).kind,`${where}: icon by path`);
 }
 for(const id of ['lineups','playing-time','practice','printables'])assert(new RegExp(`<h2[^>]*id="${id}"`).test(h),`${lang}: the ${id} heading is an h2`);
 return new Set(cards.map(m=>m[1]));
}
const kinds=check(en,'en','');check(es,'es','/es');
for(const k of ['lineup','court','clock','rotation','diagram','blank','cheat','shirt','scan'])assert(kinds.has(k),`the hub shows the ${k} icon`);
for(const k of ['lineup','court','clock','rotation','diagram','blank','cheat','shirt','scan','whistle'])
 assert(/<path|<circle|<rect/.test(renderToStaticMarkup(React.createElement(icons.ToolIcon,{kind:k}))),`icon ${k} draws`);
assert.equal(icons.toolIconFor('/tools/9v9-lineup-builder').badge,'9v9');assert.equal(icons.toolIconFor('/es/tools/futsal-lineup-builder').kind,'court');
console.log(`tools-cards: OK (${kinds.size} icon kinds, every tool a card on /tools and /es/tools)`);

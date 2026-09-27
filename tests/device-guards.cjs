#!/usr/bin/env node
/*
 * Device guard tests: static, fast checks for iPhone/iPad bugs that desktop testing never shows.
 *
 * They read the source (CSS modules, app/globals.css and the TSX that uses them) and fail with
 * file, selector/element, why and how to fix. Intentional exceptions (and known bugs waiting for a
 * fix) live in tests/device-guards.allowlist.json, each with a reason.
 *
 *   1  Game controls and 3D/2D canvas containers have -webkit-touch-callout:none + user-select:none
 *      (own class or an ancestor rule). Found by pattern: <canvas>, onPointerDown with a hold
 *      (pointer-up/cancel, setPointerCapture, preventDefault), spread pointer props, and refs that
 *      get a canvas appended or pointer listeners attached.                                    [error]
 *   2  No full-screen fixed/absolute overlay sized only by 100vh/100dvh/100svh (needs inset:0 or
 *      top+bottom).                                                                              [error]
 *      2b A dvh/vh height that wins on a touch device beside an inset still beats `bottom` (over-constrained
 *      box), so the box keeps the stale dvh height.                                              [error]
 *   3  Buttons are at least 44x44 CSS px where width/height/min-* are statically known.          [error]
 *   4  Text inputs have font-size >= 16px (iOS zooms the page on focus otherwise).               [error]
 *   5  viewport-fit=cover is set, and fixed top/bottom bars use env(safe-area-inset-*).          [error]
 *   6  :hover rules that reveal content without a focus/active/state equivalent.                [warning]
 *   7  user-scalable=no / maximum-scale=1 while an input would zoom.                            [warning]
 *
 * Usage: node tests/device-guards.cjs [--verbose] [--json out.json]
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const ts=require('typescript');

const ROOT=process.env.DEVICE_GUARDS_ROOT?path.resolve(process.env.DEVICE_GUARDS_ROOT):path.join(__dirname,'..');
const VERBOSE=process.argv.includes('--verbose');
const JSON_OUT=(i=>i>0?process.argv[i+1]:null)(process.argv.indexOf('--json'));
const ALLOW_FILE=path.join(__dirname,'device-guards.allowlist.json');
const MIN_TAP=44,MIN_INPUT_FONT=16;
/** Internal review pages (noindex, not linked from the game): /motion-lab and /skill-lab. */
const SKIP_FILES=[/^components\/(MotionLab|SkillLab)\./,/^app\/(motion-lab|skill-lab)\//];

const rel=f=>path.relative(ROOT,f).split(path.sep).join('/');
function walk(dir,out=[]){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()){if(e.name!=='node_modules'&&!e.name.startsWith('.'))walk(p,out);}else out.push(p);}return out;}
const SOURCES=[...walk(path.join(ROOT,'app')),...walk(path.join(ROOT,'components'))].filter(f=>!SKIP_FILES.some(re=>re.test(rel(f))));
const CSS_FILES=SOURCES.filter(f=>f.endsWith('.css'));
const TSX_FILES=SOURCES.filter(f=>f.endsWith('.tsx'));

/* ───────────────────────────── CSS parsing ───────────────────────────── */

const GLOBAL_MARK='\u0001';
/** Selectors a browser would reject (the whole rule is dropped), e.g. text left outside a comment. */
const INVALID=[];
/** Parses a stylesheet into flat style rules with their @media/@supports context and line numbers. */
function parseCss(file){
 const src=fs.readFileSync(file,'utf8');
 const text=src.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,' '));
 const lineStarts=[0];for(let i=0;i<text.length;i++)if(text[i]==='\n')lineStarts.push(i+1);
 const lineOf=off=>{let lo=0,hi=lineStarts.length-1;while(lo<hi){const mid=(lo+hi+1)>>1;if(lineStarts[mid]<=off)lo=mid;else hi=mid-1;}return lo+1;};
 const isModule=/\.module\.css$/.test(file),scope=isModule?rel(file):'g';
 const rules=[],customProps=[];
 // Index just past the brace that closes the block opened at `open` (respects strings).
 const closeOf=open=>{let depth=0;for(let i=open;i<text.length;i++){const c=text[i];if(c==='"'||c==="'"){const q=c;for(i++;i<text.length&&text[i]!==q;i++)if(text[i]==='\\')i++;continue;}if(c==='{')depth++;else if(c==='}'){depth--;if(!depth)return i+1;}}return text.length;};
 const nextStop=(from,end)=>{let paren=0;for(let i=from;i<end;i++){const c=text[i];if(c==='"'||c==="'"){const q=c;for(i++;i<end&&text[i]!==q;i++)if(text[i]==='\\')i++;continue;}if(c==='(')paren++;else if(c===')')paren--;else if(!paren&&(c==='{'||c===';'||c==='}'))return i;}return end;};
 function block(from,end,at){
  let i=from;
  while(i<end){
   while(i<end&&/\s/.test(text[i]))i++;if(i>=end)break;
   if(text[i]==='}'){i++;continue;}
   const stop=nextStop(i,end);const prelude=text.slice(i,stop).trim();
   if(stop>=end||text[stop]!=='{'){i=stop+1;continue;}
   const close=closeOf(stop);
   if(prelude.startsWith('@')){
    const name=prelude.match(/^@([\w-]+)/)[1].toLowerCase();
    if(['media','supports','container','layer','document'].includes(name))block(stop+1,close-1,[...at,{type:name,text:prelude.slice(name.length+1).trim()}]);
   }else{
    const body=text.slice(stop+1,close-1);
    const decls=[];
    if(!body.includes('{'))for(const part of splitTop(body,';')){const m=part.match(/^\s*([-\w]+)\s*:([\s\S]*)$/);if(!m)continue;let value=m[2].trim(),important=false;if(/!\s*important\s*$/i.test(value)){important=true;value=value.replace(/!\s*important\s*$/i,'').trim();}decls.push({prop:m[1].toLowerCase(),value,important});}
    let sel=prelude;
    if(isModule){for(let k=0;k<5&&/:global\(/.test(sel);k++)sel=sel.replace(/:global\(((?:[^()]|\([^()]*\))*)\)/g,(_,inner)=>inner.replace(/\.(-?[_a-zA-Z][\w-]*)/g,`.${GLOBAL_MARK}$1`));}
    const parsed=splitTop(sel,',').map(s=>parseSelector(s.trim(),scope)).filter(Boolean);
    if(parsed.some(x=>x.invalid))INVALID.push({file:rel(file),line:lineOf(i),selector:prelude.replace(/\s+/g,' ').slice(0,120)});
    const rule={file:rel(file),line:lineOf(i),selectorText:prelude.replace(/\s+/g,' '),selectors:parsed.filter(x=>!x.invalid),decls,at};
    rules.push(rule);
    for(const d of decls)if(d.prop.startsWith('--'))customProps.push({name:d.prop,value:d.value,rule});
   }
   i=close;
  }
 }
 block(0,text.length,[]);
 return {rules,customProps};
}
function splitTop(s,sep){const out=[];let depth=0,cur='',q=null;for(let i=0;i<s.length;i++){const c=s[i];if(q){cur+=c;if(c==='\\'){cur+=s[++i]??'';}else if(c===q)q=null;continue;}if(c==='"'||c==="'"){q=c;cur+=c;continue;}if(c==='('||c==='[')depth++;else if(c===')'||c===']')depth--;if(c===sep&&!depth){out.push(cur);cur='';continue;}cur+=c;}if(cur.trim())out.push(cur);return out;}

const STATE_PSEUDO=new Set(['hover','active','focus','focus-visible','focus-within']);
/** A complex selector as compounds right-to-left friendly: [{tag,classes,attrs,ids,states,pseudoEl,comb}] */
function parseSelector(s,scope){
 const compounds=[];let cur=null,comb=' ',i=0;
 const start=()=>{if(!cur){cur={tag:null,classes:[],attrs:[],ids:[],states:[],pseudoEl:null,pc:0,comb};compounds.push(cur);}};
 while(i<s.length){
  const c=s[i];
  if(/\s/.test(c)||c==='>'||c==='+'||c==='~'){let k=i,sym=' ';while(k<s.length&&/[\s>+~]/.test(s[k])){if(s[k]!==' '&&!/\s/.test(s[k]))sym=s[k];k++;}if(cur){cur=null;comb=sym;}i=k;continue;}
  start();
  if(c==='.'){const m=s.slice(i+1).match(/^(\u0001?)(-?[_a-zA-Z][\w-]*)/);if(!m)return null;cur.classes.push(`${m[1]||scope==='g'?'g':scope}::${m[2]}`);i+=1+m[0].length;continue;}
  if(c==='#'){const m=s.slice(i+1).match(/^[\w-]+/);cur.ids.push(m?.[0]);i+=1+(m?.[0].length||0);continue;}
  if(c==='['){const end=s.indexOf(']',i);const inner=s.slice(i+1,end);const m=inner.match(/^\s*([\w-]+)\s*(?:([~|^$*]?=)\s*["']?([^"'\]]*)["']?)?/);if(m)cur.attrs.push({name:m[1].toLowerCase(),op:m[2]||null,value:m[3]??null});i=end+1;continue;}
  if(c===':'){const el=s[i+1]===':';const m=s.slice(i+(el?2:1)).match(/^[\w-]+/);const name=(m?.[0]||'').toLowerCase();let k=i+(el?2:1)+name.length;let arg=null;if(s[k]==='('){let depth=0,j=k;for(;j<s.length;j++){if(s[j]==='(')depth++;else if(s[j]===')'){depth--;if(!depth)break;}}arg=s.slice(k+1,j);k=j+1;}
   if(el||['before','after','placeholder','selection','marker','backdrop','first-line','first-letter'].includes(name)||name.startsWith('-webkit-')||name.startsWith('-moz-'))cur.pseudoEl=name;
   else if(STATE_PSEUDO.has(name)){cur.states.push(name);cur.pc++;}
   else if(name==='root'){cur.tag='html';cur.pc++;}
   else cur.pc+=(name==='where'?0:1);
   // :not/:has/:is/:where/:nth-*/structural/:disabled...: ignored (optimistic match).
   i=k;continue;}
  if(c==='*'){cur.tag='*';i++;continue;}
  const m=s.slice(i).match(/^[a-zA-Z][\w-]*/);if(m){if(cur.tag||cur.classes.length||cur.attrs.length)return {invalid:true,text:s};cur.tag=m[0].toLowerCase();i+=m[0].length;continue;}
  if(/[\d%]/.test(c)&&!compounds.length)return null;// keyframe selectors (from, 50%)
  return {invalid:true,text:s};
 }
 if(!compounds.length)return null;
 const spec=[0,0,0];for(const c of compounds){spec[0]+=c.ids.length;spec[1]+=c.classes.length+c.attrs.length+c.pc;spec[2]+=(c.tag&&c.tag!=='*'&&c.tag!=='html'?1:0)+(c.pseudoEl?1:0);}
 return {text:s,compounds,spec};
}

/** Touch devices the media queries are evaluated for (CSS px, coarse pointer, no hover). */
const DEVICES=[
 {name:'iPhone SE portrait',w:375,h:667},{name:'iPhone SE landscape',w:667,h:375},
 {name:'iPhone 15 portrait',w:393,h:852},{name:'iPhone 15 landscape',w:852,h:393},
 {name:'iPad portrait',w:810,h:1080},{name:'iPad landscape',w:1080,h:810},{name:'iPad Pro 11 portrait',w:834,h:1194},
];
function mediaFeature(p,dev){
 p=p.trim();if(!p)return true;
 if(/^(screen|all)$/i.test(p))return true;if(/^print$/i.test(p))return false;
 let m=p.match(/^not\s*\((.*)\)$/i);if(m)return !mediaFeature(`(${m[1]})`,dev);
 m=p.match(/^\(\s*(width|height)\s*(<=|>=|<|>)\s*([\d.]+)(px|em|rem)?\s*\)$/i);
 if(m){const v=+m[3]*(/r?em/.test(m[4]||'')?16:1),x=m[1]==='width'?dev.w:dev.h;return m[2]==='<='?x<=v:m[2]==='>='?x>=v:m[2]==='<'?x<v:x>v;}
 m=p.match(/^\(\s*([\w-]+)\s*(?::\s*([^)]+))?\)$/);if(!m)return true;
 const f=m[1].toLowerCase(),v=(m[2]||'').trim().toLowerCase(),px=parseFloat(v)*(/r?em$/.test(v)?16:1);
 switch(f){
  case 'max-width':return dev.w<=px;case 'min-width':return dev.w>=px;case 'max-height':return dev.h<=px;case 'min-height':return dev.h>=px;
  case 'orientation':return v==='portrait'?dev.h>=dev.w:dev.w>dev.h;
  case 'pointer':case 'any-pointer':return v?v==='coarse':true;
  case 'hover':case 'any-hover':return v?v==='none':false;
  case 'prefers-reduced-motion':return v!=='reduce';
  case 'prefers-color-scheme':return v!=='dark';
  default:return true;
 }
}
function mediaMatches(text,dev){return splitTop(text,',').some(q=>{q=q.trim().replace(/^only\s+/i,'');let neg=false;if(/^not\s+(?!\()/i.test(q)){neg=true;q=q.replace(/^not\s+/i,'');}
 const r=q.split(/\s+and\s+/i).every(p=>mediaFeature(p,dev));return neg?!r:r;});}
const appliesOn=(at,dev)=>at.every(a=>a.type!=='media'||mediaMatches(a.text,dev));
/** Rules that apply on every touch device (used for protection rules, which should not depend on the screen). */
const touchApplies=at=>DEVICES.every(d=>appliesOn(at,d));
const mediaLabel=at=>at.filter(a=>a.type==='media').map(a=>`@media ${a.text}`).join(' ');

const CSS={rules:[],customProps:new Map()};
// globals.css loads first (app/layout.tsx), then the modules.
CSS_FILES.sort((a,b)=>(rel(a)==='app/globals.css'?-1:rel(b)==='app/globals.css'?1:rel(a).localeCompare(rel(b))));
for(const f of CSS_FILES){const {rules,customProps}=parseCss(f);CSS.rules.push(...rules);for(const p of customProps){if(!CSS.customProps.has(p.name))CSS.customProps.set(p.name,[]);CSS.customProps.get(p.name).push(p);}}
CSS.rules.forEach((r,i)=>r.order=i);

/* ───────────────────────────── TSX model ───────────────────────────── */

const FILES=new Map();// rel -> {sf,text,elements,usages,components,exports,defaultExport}
function resolveImport(fromFile,spec){
 let base;if(spec.startsWith('@/'))base=path.join(ROOT,spec.slice(2));else if(spec.startsWith('.'))base=path.resolve(path.dirname(path.join(ROOT,fromFile)),spec);else return null;
 for(const ext of ['','.tsx','.ts','/index.tsx','/index.ts'])if(fs.existsSync(base+ext)&&fs.statSync(base+ext).isFile())return rel(base+ext);
 return null;
}
const attrName=a=>a.name.getText();
function buildFile(file){
 const text=fs.readFileSync(file,'utf8'),r=rel(file);
 const sf=ts.createSourceFile(r,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const cssImports=new Map(),compImports=new Map(),vars=new Map(),funcs=new Map();
 let defaultExport=null;
 const visitTop=n=>{
  if(ts.isImportDeclaration(n)){const spec=n.moduleSpecifier.text,target=/\.css$/.test(spec)?(resolveImport(r,spec)||spec):resolveImport(r,spec);const cl=n.importClause;if(!cl)return;
   if(/\.module\.css$/.test(spec)){if(cl.name)cssImports.set(cl.name.text,target);}
   else if(target){if(cl.name)compImports.set(cl.name.text,{file:target,name:'default'});if(cl.namedBindings&&ts.isNamedImports(cl.namedBindings))for(const el of cl.namedBindings.elements)compImports.set(el.name.text,{file:target,name:(el.propertyName||el.name).text});}}
  if(ts.isExportAssignment(n)&&ts.isIdentifier(n.expression))defaultExport=n.expression.text;
  if(ts.isFunctionDeclaration(n)&&n.name&&n.modifiers?.some(m=>m.kind===ts.SyntaxKind.DefaultKeyword))defaultExport=n.name.text;
 };
 sf.statements.forEach(visitTop);
 // Variables/functions anywhere (for className identifiers, handler bodies and dynamic imports).
 (function scan(n){
  if(ts.isVariableDeclaration(n)&&ts.isIdentifier(n.name)&&n.initializer){if(!vars.has(n.name.text))vars.set(n.name.text,n.initializer);
   const init=n.initializer;if(ts.isCallExpression(init)&&/^(dynamic|lazy)$/.test(init.expression.getText())){const m=init.arguments[0]?.getText().match(/import\(\s*['"]([^'"]+)['"]\s*\)(?:\.then\(\s*\w+\s*=>\s*\w+\.(\w+))?/);if(m){const t=resolveImport(r,m[1]);if(t)compImports.set(n.name.text,{file:t,name:m[2]||'default'});}}
   if(ts.isArrowFunction(init)||ts.isFunctionExpression(init))funcs.set(n.name.text,init);}
  if(ts.isFunctionDeclaration(n)&&n.name)funcs.set(n.name.text,n);
  ts.forEachChild(n,scan);
 })(sf);
 const info={file:r,sf,text,cssImports,compImports,vars,funcs,defaultExport,elements:[],usages:[]};
 FILES.set(r,info);
 // Walk JSX, tracking the enclosing component and the nearest JSX parent.
 (function walkJsx(n,parent,component){
  let comp=component;
  if((ts.isFunctionDeclaration(n)&&n.name&&/^[A-Z]/.test(n.name.text)))comp=n.name.text;
  else if(ts.isVariableDeclaration(n)&&ts.isIdentifier(n.name)&&/^[A-Z]/.test(n.name.text)&&n.initializer&&(ts.isArrowFunction(n.initializer)||ts.isFunctionExpression(n.initializer)||ts.isCallExpression(n.initializer)))comp=n.name.text;
  if(ts.isJsxElement(n)||ts.isJsxSelfClosingElement(n)){
   const open=ts.isJsxElement(n)?n.openingElement:n;const tag=open.tagName.getText();
   const node=makeNode(info,open,tag,parent,comp);
   if(/^[a-z]/.test(tag))info.elements.push(node);else info.usages.push(node);
   if(ts.isJsxElement(n))n.children.forEach(ch=>walkJsx(ch,node,comp));
   // JSX passed through attributes (e.g. render props) keeps this node as parent.
   open.attributes.properties.forEach(p=>walkJsx(p,node,comp));
   return;
  }
  ts.forEachChild(n,ch=>walkJsx(ch,parent,comp));
 })(sf,null,null);
 return info;
}
function makeNode(info,open,tag,parent,component){
 const attrs=new Map(),spreads=[];
 for(const p of open.attributes.properties){
  if(ts.isJsxSpreadAttribute(p)){spreads.push(p.expression);continue;}
  const name=attrName(p);let value=true;
  if(p.initializer){if(ts.isStringLiteral(p.initializer))value=p.initializer.text;else value=p.initializer;}
  attrs.set(name,value);
 }
 const classes=new Set();let dynamicClass=false;
 const cn=attrs.get('className');
 if(cn!==undefined){const res=classTokens(info,typeof cn==='string'?null:cn.expression??cn,typeof cn==='string'?cn:null);res.tokens.forEach(t=>classes.add(t));dynamicClass=res.dynamic;}
 const line=info.sf.getLineAndCharacterOfPosition(open.getStart()).line+1;
 const label=typeof attrs.get('aria-label')==='string'?attrs.get('aria-label'):null;
 return {file:info.file,line,tag:/^[a-z]/.test(tag)?tag.toLowerCase():tag,classes,dynamicClass,attrs,spreads,parent,component,label,open,info};
}
/** Possible class tokens of a className expression ("scope::name"; scope is the CSS module path or "g"). */
function classTokens(info,expr,literal){
 const tokens=new Set();let dynamic=false;
 const addStr=s=>s.split(/\s+/).filter(Boolean).forEach(t=>tokens.add(`g::${t}`));
 if(literal!=null){addStr(literal);return {tokens,dynamic};}
 const seen=new Set();
 (function ev(e){
  if(!e)return;
  if(ts.isParenthesizedExpression(e)||ts.isJsxExpression(e)||ts.isAsExpression(e)||ts.isNonNullExpression(e))return ev(e.expression);
  if(ts.isStringLiteral(e)||ts.isNoSubstitutionTemplateLiteral(e))return addStr(e.text);
  if(ts.isTemplateExpression(e)){const parts=[e.head.text,...e.templateSpans.map(s=>s.literal.text)];
   // Tokens glued to an interpolation (e.g. `is-${x}`) are unknowable; keep whole words only.
   parts.forEach((p,k)=>{const words=p.split(/(\s+)/);const clean=words.filter((w,idx)=>w.trim()&&!(k>0&&idx===0)&&!(k<parts.length-1&&idx===words.length-1));clean.forEach(w=>addStr(w));if((k>0&&words[0].trim())||(k<parts.length-1&&words[words.length-1].trim()))dynamic=true;});
   e.templateSpans.forEach(s=>ev(s.expression));return;}
  if(ts.isPropertyAccessExpression(e)&&ts.isIdentifier(e.expression)&&info.cssImports.has(e.expression.text)){tokens.add(`${info.cssImports.get(e.expression.text)}::${e.name.text}`);return;}
  if(ts.isElementAccessExpression(e)&&ts.isIdentifier(e.expression)&&info.cssImports.has(e.expression.text)){const a=e.argumentExpression;if(ts.isStringLiteral(a)||ts.isNoSubstitutionTemplateLiteral(a))tokens.add(`${info.cssImports.get(e.expression.text)}::${a.text}`);else dynamic=true;return;}
  if(ts.isConditionalExpression(e)){ev(e.whenTrue);ev(e.whenFalse);return;}
  if(ts.isBinaryExpression(e)){const op=e.operatorToken.kind;if(op===ts.SyntaxKind.PlusToken||op===ts.SyntaxKind.BarBarToken||op===ts.SyntaxKind.QuestionQuestionToken){ev(e.left);ev(e.right);return;}if(op===ts.SyntaxKind.AmpersandAmpersandToken){ev(e.right);return;}}
  if(ts.isArrayLiteralExpression(e)){e.elements.forEach(ev);return;}
  if(ts.isCallExpression(e)){const callee=e.expression;if(ts.isPropertyAccessExpression(callee)&&/^(join|filter|trim)$/.test(callee.name.text)){ev(callee.expression);return;}if(/^(clsx|cx|classNames|cn)$/.test(callee.getText())){e.arguments.forEach(ev);return;}}
  if(ts.isIdentifier(e)&&info.vars.has(e.text)&&!seen.has(e.text)){seen.add(e.text);return ev(info.vars.get(e.text));}
  dynamic=true;
 })(expr);
 return {tokens,dynamic};
}

for(const f of TSX_FILES)buildFile(f);
// Component usage sites: "file#Component" -> [usage nodes]
const SITES=new Map();
for(const info of FILES.values()){
 for(const u of info.usages){
  const name=u.tag.split('.')[0];let target;
  if(info.compImports.has(name)){const imp=info.compImports.get(name);const t=FILES.get(imp.file);if(!t)continue;target=`${imp.file}#${imp.name==='default'?(t.defaultExport||'default'):imp.name}`;}
  else target=`${info.file}#${name}`;
  if(!SITES.has(target))SITES.set(target,[]);SITES.get(target).push(u);
 }
}
/** Ancestors of a node: in-file JSX parents, then (optimistically) the first usage site of its component. */
function ancestorsOf(node,depth=0){
 const out=[];let p=node.parent;
 while(p){if(/^[a-z]/.test(p.tag))out.push(p);if(!p.parent){return out.concat(p.component&&depth<6?siteAncestors(p,depth):[]);}p=p.parent;}
 return out.concat(node.component&&depth<6?siteAncestors(node,depth):[]);
}
function siteAncestors(node,depth){const sites=SITES.get(`${node.file}#${node.component}`);if(!sites?.length)return [];const s=sites[0];if(s.file===node.file&&s.component===node.component)return [];return ancestorsOf(s,depth+1);}

/* ───────────────────────────── selector matching ───────────────────────────── */

const VIRTUAL_ROOT=[{tag:'body',classes:new Set(),attrs:new Map([['virtual',true]])},{tag:'html',classes:new Set(),attrs:new Map([['virtual',true]])}];
function compoundMatches(el,c){
 if(c.tag&&c.tag!=='*'&&c.tag!==el.tag)return false;
 for(const k of c.classes)if(!el.classes.has(k))return false;
 for(const a of c.attrs){if(!el.attrs.has(a.name)){
   // Attributes that React or the browser set at runtime.
   if(a.name==='open'&&el.tag==='dialog')continue;if(a.name==='hidden'||a.name==='disabled'||a.name.startsWith('aria-'))continue;return false;}
  const v=el.attrs.get(a.name);if(a.op==='='&&typeof v==='string'&&a.value!=null&&v!==a.value)return false;}
 for(const id of c.ids)if(el.attrs.get('id')!==id)return false;
 return true;
}
/** Does selector `sel` match element `el` given its ancestor chain? (descendant and child treated alike) */
function selectorMatches(sel,el,chain){
 const cs=sel.compounds;if(!compoundMatches(el,cs[cs.length-1]))return false;
 let k=0;const all=[...chain,...VIRTUAL_ROOT];
 for(let i=cs.length-2;i>=0;i--){let found=false;while(k<all.length){if(compoundMatches(all[k++],cs[i])){found=true;break;}}if(!found)return false;}
 return true;
}
/** Rules (with the specific selector) that apply to el itself on touch devices. */
const cmpSpec=(a,b)=>{for(let i=0;i<3;i++)if(a[i]!==b[i])return a[i]-b[i];return 0;};
/** Font-size carried by a `font` shorthand: a size, 'inherit', or null when the declaration is invalid (dropped by the browser). */
function fontShorthandSize(v){if(/^(inherit|initial|unset|revert)$/.test(v))return v==='inherit'?'inherit':null;if(/\binherit\b/.test(v))return null;const m=v.match(/(?:^|\s)((?:[\d.]+(?:px|rem|em|%|vw|vh|dvh))|(?:(?:min|max|clamp|calc|var)\([^)]*\)+))(?:\/\S+)?\s+\S/);return m?m[1]:null;}
/** Winning declarations for `props` on el on device `dev` (importance, specificity, source order), like the browser cascade. */
function cascade(el,chain,dev,props){
 const win={};
 const better=(a,b)=>!b||(a.imp!==b.imp?a.imp:(cmpSpec(a.spec,b.spec)||(a.order-b.order)||1)>0);
 for(const r of CSS.rules){
  if(!r.decls.some(d=>props.includes(d.prop)||(d.prop==='font'&&props.includes('font-size'))))continue;
  if(!appliesOn(r.at,dev))continue;
  let best=null;
  for(const s of r.selectors){const last=s.compounds[s.compounds.length-1];if(last.pseudoEl||s.compounds.some(c=>c.states.length))continue;if(selectorMatches(s,el,chain)&&(!best||cmpSpec(s.spec,best.spec)>0))best=s;}
  if(!best)continue;
  for(const d of r.decls){let prop=d.prop,value=d.value;if(prop==='font'){prop='font-size';value=fontShorthandSize(d.value);if(value==null)continue;}if(!props.includes(prop))continue;
   const cand={value,imp:d.important,spec:best.spec,order:r.order,rule:r,raw:`${d.prop}:${d.value}${d.important?'!important':''} (${r.file}:${r.line})`};if(better(cand,win[prop]))win[prop]=cand;}
 }
 return win;
}
const decl=(rule,prop)=>{let v=null;for(const d of rule.decls)if(d.prop===prop)v=d;return v;};

/* ───────────────────────────── findings ───────────────────────────── */

const allow=JSON.parse(fs.readFileSync(ALLOW_FILE,'utf8')).entries;
const used=new Set();const findings=[];
const globRe=g=>new RegExp('^'+g.split('*').map(s=>s.replace(/[.+?^${}()|[\]\\]/g,'\\$&')).join('.*')+'$');
function report(f){
 const hit=allow.findIndex(a=>a.check===f.check&&a.file===f.file&&globRe(a.key).test(f.key));
 if(hit>=0){used.add(hit);f.allowed=allow[hit];}
 findings.push(f);
}
const elKey=el=>{const cls=[...el.classes].map(c=>c.split('::')[1]).slice(0,3);return `${el.tag}${cls.length?'.'+cls.join('.'):''}${el.label?`[aria-label="${el.label.slice(0,60)}"]`:''}`;};

/* 0 ─ rules the browser drops */
for(const x of INVALID)report({check:0,severity:'error',file:x.file,line:x.line,key:x.selector,why:'invalid selector: browsers drop the whole rule, so its declarations never apply (often text left outside a /* comment */).',fix:'Fix the selector or close the comment before it.'});

/* 1 ─ long-press callout + selection on game controls and canvases */
const HOLD_UP=['onPointerUp','onPointerCancel','onLostPointerCapture','onTouchEnd','onTouchCancel'];
function handlerText(info,value){
 if(!value||value===true||typeof value==='string')return '';
 const expr=value.expression??value;let text=expr.getText();
 // One level of indirection: named handlers and helpers called from inline arrows.
 for(const m of text.matchAll(/\b([a-zA-Z_$][\w$]*)\s*(?=\(|$)/g)){const f=info.funcs.get(m[1]);if(f)text+='\n'+f.getText();}
 if(ts.isIdentifier(expr)&&info.funcs.has(expr.text))text+='\n'+info.funcs.get(expr.text).getText();
 return text;
}
function refDrivesInput(info,refName){
 const t=info.text,esc=refName.replace(/\$/g,'\\$');
 const names=[`${esc}\\.current\\??`];
 for(const m of t.matchAll(new RegExp(`(?:const|let|var)\\s+([\\w$]+)\\s*=\\s*${esc}\\.current\\b`,'g')))names.push(m[1].replace(/\$/g,'\\$'));
 const use=`\\.(?:(?:appendChild|append|prepend)\\(\\s*(?:[\\w$.]*[cC]anvas\\b|[\\w$.]*domElement\\b)|setPointerCapture|addEventListener\\(\\s*['"](?:pointer(?:down|move)|touch(?:start|move)|gesture\\w*|contextmenu)['"])`;
 return names.some(n=>new RegExp(`(?:^|[^\\w$.])${n}${use}`).test(t));
}
function holdReason(el){
 const info=el.info;
 if(el.tag==='canvas')return 'a <canvas> game/3D surface';
 const down=['onPointerDown','onTouchStart','onMouseDown'].find(a=>el.attrs.has(a));
 // A handler that only stops propagation (e.g. a dialog shielding the scene) is not a press control.
 const onlyStop=a=>{const v=el.attrs.get(a);return v&&v!==true&&typeof v!=='string'&&/^\s*\(?\s*\w*\s*\)?\s*=>\s*\{?\s*\w+\.stopPropagation\(\)\s*;?\s*\}?\s*$/.test((v.expression??v).getText());};
 if(down&&onlyStop(down))return null;
 if(down){const txt=handlerText(info,el.attrs.get(down));
  if(HOLD_UP.some(a=>el.attrs.has(a)))return `${down} + ${HOLD_UP.filter(a=>el.attrs.has(a)).join('/')} (press-and-hold)`;
  if(/setPointerCapture/.test(txt))return `${down} with setPointerCapture`;
  if(/\b(hold|charg\w*|held)\b/i.test(txt))return `${down} with hold/charge`;
  if(/preventDefault\(\)/.test(txt)&&el.tag==='button')return `${down} game button (preventDefault press)`;}
 for(const s of el.spreads){if(ts.isCallExpression(s)){const f=info.funcs.get(s.expression.getText());if(f&&/onPointerDown|onTouchStart/.test(f.getText()))return `spread ${s.expression.getText()}() pointer-hold props`;}}
 const ref=el.attrs.get('ref');if(ref&&ref!==true&&typeof ref!=='string'){const r=(ref.expression??ref).getText();if(/^[\w$]+$/.test(r)&&refDrivesInput(info,r))return `ref ${r} gets a canvas or pointer/touch listeners`;}
 return null;
}
const PROT={callout:1,select:2};
function ruleProtection(r){let m=0;for(const d of r.decls){if(d.prop==='-webkit-touch-callout'&&d.value==='none')m|=PROT.callout;if((d.prop==='user-select'||d.prop==='-webkit-user-select')&&d.value==='none')m|=PROT.select;}return m;}
const PROTECTING=CSS.rules.filter(r=>ruleProtection(r));
function ownProtection(node,chain){let m=0;for(const r of PROTECTING){if(!touchApplies(r.at))continue;for(const s of r.selectors){if(s.compounds.some(c=>c.states.length||c.pseudoEl))continue;if(selectorMatches(s,node,chain)){m|=ruleProtection(r);break;}}}return m;}
/** Protection from the node or any ancestor; across component usage sites every site must protect (AND). */
const protMemo=new Map();
function protection(node,depth=0){
 if(protMemo.has(node))return protMemo.get(node);protMemo.set(node,0);
 let m=0;
 if(/^[a-z]/.test(node.tag))m|=ownProtection(node,ancestorsOf(node));
 if(node.parent)m|=protection(node.parent,depth);
 else if(node.component&&depth<8){const sites=(SITES.get(`${node.file}#${node.component}`)||[]).filter(s=>!(s.file===node.file&&s.component===node.component));
  if(sites.length){let all=3;for(const s of sites)all&=protection(s,depth+1);m|=all;}}
 protMemo.set(node,m);return m;
}
let holdCount=0;const holdList=[];
for(const info of FILES.values())for(const el of info.elements){
 const why=holdReason(el);if(!why)continue;
 // Pass-through layers (pointer-events:none on every device) can't be long-pressed.
 const chainH=ancestorsOf(el);if(DEVICES.every(dev=>cascade(el,chainH,dev,['pointer-events'])['pointer-events']?.value==='none'))continue;
 holdCount++;
 const m=protection(el);holdList.push(`${el.file}:${el.line} ${elKey(el)} — ${why}${(m&3)===3?'':' [UNPROTECTED]'}`);if((m&3)===3)continue;
 const missing=[!(m&PROT.callout)&&'-webkit-touch-callout:none',!(m&PROT.select)&&'user-select:none'].filter(Boolean);
 const cls=[...el.classes][0];const target=cls?(cls.startsWith('g::')?`.${cls.slice(3)}`:`.${cls.split('::')[1]} in ${cls.split('::')[0]}`):`the element or its container`;
 report({check:1,severity:'error',file:el.file,line:el.line,key:elKey(el),
  why:`${why} lacks ${missing.join(' + ')} (own class or ancestor). A long press on iOS opens the "Save image / Copy / Share" callout or starts text selection and steals the held input.`,
  fix:`Add to ${target} (or a container rule like \`.x, .x *\`): -webkit-touch-callout:none; -webkit-user-select:none; user-select:none; -webkit-user-drag:none`});
}

/* 2 ─ full-screen overlays sized only by viewport units */
const FULL_VH=/^(?:100(?:d|s|l)?vh)$/;
const subjectSig=s=>{const c=s.compounds[s.compounds.length-1];return JSON.stringify([c.tag,[...c.classes].sort(),c.attrs.map(a=>a.name).sort(),s.compounds.length>1?s.compounds.slice(0,-1).map(x=>[x.tag,x.classes]):null]);};
const sigRules=new Map();for(const r of CSS.rules)for(const s of r.selectors){const k=r.file+'|'+subjectSig(s);if(!sigRules.has(k))sigRules.set(k,[]);sigRules.get(k).push(r);}
/** JSX elements a (last-compound) selector could land on, to learn if it is a <dialog>. */
function tagsForSubject(s){const c=s.compounds[s.compounds.length-1];if(c.tag&&c.tag!=='*')return new Set([c.tag]);const tags=new Set();if(!c.classes.length)return tags;for(const info of FILES.values())for(const el of info.elements)if(c.classes.every(k=>el.classes.has(k)))tags.add(el.tag);return tags;}
/** True when every JSX element this selector lands on ends up (after the whole cascade, on every touch device) with a
 *  height that is not a viewport unit — e.g. a module's `height:100dvh` beaten by the global `dialog[open]{height:auto!important}`.
 *  Desktop (fine pointer, no collapsing toolbar) is out of scope. */
function viewportHeightOverriddenOnTouch(sel){
 const c=sel.compounds[sel.compounds.length-1];if(!c.classes.length&&!c.tag)return false;
 const els=[];for(const info of FILES.values())for(const el of info.elements)if(compoundMatches(el,c)&&(!c.classes.length||c.classes.every(k=>el.classes.has(k)))){const chain=ancestorsOf(el);if(selectorMatches(sel,el,chain))els.push({el,chain});}
 if(!els.length)return false;
 return els.every(({el,chain})=>DEVICES.every(dev=>{const w=cascade(el,chain,dev,['height']).height;return !w||!/\d(d|s|l)?vh\b/.test(w.value);}));
}
const DIALOG_TAG_RULES=CSS.rules.filter(r=>touchApplies(r.at)&&r.selectors.some(s=>{const c=s.compounds[s.compounds.length-1];return s.compounds.length===1&&c.tag==='dialog'&&!c.classes.length&&!c.pseudoEl&&!c.states.length;}));
function insetInfo(rules){
 let top=false,bottom=false,position=null;
 for(const r of rules)for(const d of r.decls){
  if(d.prop==='position')position=d.value;
  if(d.prop==='inset'){const p=d.value.split(/\s+/);const t=p[0],b=p.length>=3?p[2]:p[0];if(t!=='auto')top=true;if(b!=='auto')bottom=true;}
  if(d.prop==='inset-block'){const p=d.value.split(/\s+/);if(p[0]!=='auto')top=true;if((p[1]??p[0])!=='auto')bottom=true;}
  if(d.prop==='top'||d.prop==='inset-block-start')top=d.value!=='auto'||top;
  if(d.prop==='bottom'||d.prop==='inset-block-end')bottom=d.value!=='auto'||bottom;
 }
 return {top,bottom,position};
}
for(const r of CSS.rules){
 const hs=r.decls.filter(d=>(d.prop==='height'||d.prop==='min-height')&&FULL_VH.test(d.value));if(!hs.length)continue;
 for(const s of r.selectors){
  const last=s.compounds[s.compounds.length-1];if(last.pseudoEl)continue;
  const same=sigRules.get(r.file+'|'+subjectSig(s))||[r];
  const tags=tagsForSubject(s),isDialog=tags.has('dialog');
  // A <dialog> also takes the author's tag rules (e.g. the phone-wide `dialog[open]{inset:0}` in globals.css). The UA's own
  // modal inset is not counted: the check wants the author to pin the box explicitly.
  const own=insetInfo([r]),all=insetInfo(isDialog?[...same,...DIALOG_TAG_RULES]:same);
  const position=own.position||all.position||(isDialog?'fixed (modal <dialog>)':null);
  if(!position||!/fixed|absolute/.test(position))continue;
  const top=all.top,bottom=all.bottom;
  const h=hs.map(d=>`${d.prop}:${d.value}${d.important?'!important':''}`).join('; ');
  if(!(top&&bottom)){
   report({check:2,severity:'error',file:r.file,line:r.line,key:s.text.trim(),
    why:`${position} overlay sized by ${h} with no inset:0 / top+bottom. iPhone Safari keeps dvh/vh at the toolbar-expanded height after the toolbar collapses, leaving a band of page background below it.`,
    fix:`Pin it to the viewport instead: position:fixed; inset:0; height:auto (keep dvh only on children that need a number).`});
  }else if(hs.some(d=>d.prop==='height')&&!viewportHeightOverriddenOnTouch(s)){
   report({check:'2b',severity:'error',file:r.file,line:r.line,key:s.text.trim(),
    why:`${h} next to ${own.top&&own.bottom?'its own inset':'an inset from another rule'} ${mediaLabel(r.at)}: with top, bottom and height all set the box is over-constrained and CSS ignores \`bottom\`, so the stale dvh height still decides the size.`,
    fix:`Use height:auto (or drop the height) and let inset:0 size it; use max-height:none too.`});
  }
 }
}
// Relative panels that fill a full-screen dialog with a viewport unit (they go short with a stale dvh).
for(const r of CSS.rules){const h=decl(r,'height');if(!h||!FULL_VH.test(h.value))continue;const pos=decl(r,'position');if(pos&&/fixed|absolute/.test(pos.value))continue;
 for(const s of r.selectors){if(s.compounds.length<2)continue;const anc=s.compounds.slice(0,-1);if(!anc.some(c=>c.tag==='dialog'||c.classes.some(k=>/dialog|modal/i.test(k))))continue;
  if(viewportHeightOverriddenOnTouch(s))continue;
  report({check:'2b',severity:'error',file:r.file,line:r.line,key:s.text.trim(),why:`panel inside a full-screen dialog uses height:${h.value}${h.important?'!important':''} ${mediaLabel(r.at)}; with a stale dvh it stops short of the viewport bottom even when the dialog is pinned with inset:0.`,fix:`Use height:100% (of the pinned dialog) or flex:1 instead of a viewport unit.`});}}

/* 3 ─ tap targets */
function pxLower(v,depth=0){
 if(v==null)return null;v=String(v).trim();
 let m=v.match(/^(-?[\d.]+)px$/);if(m)return +m[1];
 if(/^0$/.test(v))return 0;
 m=v.match(/^([\d.]+)rem$/);if(m)return +m[1]*16;
 m=v.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/);if(m&&depth<4){const defs=CSS.customProps.get(m[1])||[];const vals=defs.map(d=>pxLower(d.value,depth+1));if(m[2])vals.push(pxLower(m[2],depth+1));return vals.length&&vals.every(x=>x!=null)?Math.min(...vals):null;}
 m=v.match(/^(min|max|clamp)\((.*)\)$/);if(m){const args=splitTop(m[2],',').map(a=>pxLower(a,depth+1));if(m[1]==='clamp')return args[0];if(args.some(a=>a==null))return m[1]==='max'&&args.some(a=>a!=null)?Math.max(...args.filter(a=>a!=null)):null;return m[1]==='min'?Math.min(...args):Math.max(...args);}
 m=v.match(/^calc\(\s*([\d.]+)px\s*\+\s*env\([^)]*\)\s*\)$/);if(m)return +m[1];
 return null;
}
/** Rendered lower bound of one dimension from width/height + min-*, or null when it depends on content/layout. */
function dimension(size,min){
 const s=size?pxLower(size.value):null,m=min?pxLower(min.value):null;
 if(s==null)return m!=null&&m>=MIN_TAP?{v:m,src:[min.raw]}:null;
 return {v:Math.max(s,m||0),src:[size.raw,...(min&&m?[min.raw]:[])]};
}
const TAP_PROPS=['width','min-width','height','min-height','inline-size','block-size','display'];
/** Invisible hit-area expansion: an absolutely positioned ::before/::after with a negative inset on the element grows the
 *  tap target without changing the visual size. Returns the px added in each axis on `dev`. */
function hitExpansion(el,chain,dev){
 let w=0,h=0;
 for(const r of CSS.rules){
  if(!appliesOn(r.at,dev))continue;const inset=decl(r,'inset'),pos=decl(r,'position');if(!inset||!pos||pos.value!=='absolute')continue;
  if(!r.selectors.some(s=>{const c=s.compounds[s.compounds.length-1];return (c.pseudoEl==='before'||c.pseudoEl==='after')&&!s.compounds.some(x=>x.states.length)&&selectorMatches(s,el,chain);}))continue;
  const v=inset.value.split(/\s+/).map(x=>pxLower(x));if(v.some(x=>x==null))continue;
  const [t,rr,b,l]=[v[0],v[1]??v[0],v[2]??v[0],v[3]??v[1]??v[0]];
  w=Math.max(w,-(l+rr));h=Math.max(h,-(t+b));
 }
 return {w,h};
}
const tapStats={checked:0,ok:0,small:0,unknown:0,unknownList:[]};
for(const info of FILES.values())for(const el of info.elements){
 if(el.tag!=='button')continue;
 if(el.attrs.get('aria-hidden')==='true'||el.attrs.get('tabIndex')==='-1')continue;
 tapStats.checked++;
 const chain=ancestorsOf(el);let small=null,known=false;
 for(const dev of DEVICES){
  const c=cascade(el,chain,dev,TAP_PROPS);if(c.display?.value==='none')continue;
  const W=dimension(c.width||c['inline-size'],c['min-width']),H=dimension(c.height||c['block-size'],c['min-height']);
  if((W&&W.v<MIN_TAP)||(H&&H.v<MIN_TAP)){const x=hitExpansion(el,chain,dev);if(W&&x.w>0)W.v+=x.w,W.src.push(`hit area +${x.w}px`);if(H&&x.h>0)H.v+=x.h,H.src.push(`hit area +${x.h}px`);}
  if(W||H)known=true;
  const bad=[W&&W.v<MIN_TAP&&{d:'width',...W},H&&H.v<MIN_TAP&&{d:'height',...H}].filter(Boolean);
  if(bad.length&&!small)small={dev,bad};
 }
 if(!small){if(known)tapStats.ok++;else{tapStats.unknown++;tapStats.unknownList.push(`${el.file}:${el.line} ${elKey(el)}`);}continue;}
 tapStats.small++;
 report({check:3,severity:'error',file:el.file,line:el.line,key:elKey(el),why:`tap target ${small.bad.map(b=>`${b.d} ${b.v}px`).join(' × ')} (< ${MIN_TAP}px) on ${small.dev.name}, from ${[...new Set(small.bad.flatMap(b=>b.src))].join(', ')}. Kids on phones miss small targets.`,fix:`Give it min-width:${MIN_TAP}px; min-height:${MIN_TAP}px, or keep the visual size and add an invisible hit area (::before with inset:-Npx).`});
}

/* 4 ─ inputs at 16px or more */
const NO_ZOOM_TYPES=/^(checkbox|radio|range|button|submit|reset|hidden|color|file|image)$/;
/** Computed font-size of a form field on a device: {px, src} or {px:null} when unknowable. */
function fieldFont(el,chain,dev){
 const c=cascade(el,chain,dev,['font-size','display']);if(c.display?.value==='none')return {hidden:true};
 const own=c['font-size'];
 if(!own)return {px:13.33,src:'no font-size: the form-field default (about 13px)'};
 if(own.value!=='inherit'){const px=pxLower(own.value);return {px,src:own.raw};}
 for(let i=0;i<chain.length;i++){const f=cascade(chain[i],chain.slice(i+1),dev,['font-size'])['font-size'];if(!f||f.value==='inherit')continue;const px=pxLower(f.value);return {px,src:`inherited ${f.raw}`};}
 return {px:16,src:'inherited root 16px'};
}
let inputCount=0;
for(const info of FILES.values())for(const el of info.elements){
 if(!['input','textarea','select'].includes(el.tag))continue;
 const type=el.attrs.get('type');if(el.tag==='input'&&typeof type==='string'&&NO_ZOOM_TYPES.test(type))continue;
 if(el.attrs.get('readOnly')===true||el.attrs.get('hidden')===true||el.attrs.get('tabIndex')==='-1')continue;
 inputCount++;
 const chain=ancestorsOf(el);let worst=null;
 for(const dev of DEVICES){const f=fieldFont(el,chain,dev);if(f.hidden||f.px==null)continue;if(!worst||f.px<worst.px)worst={...f,dev};}
 if(!worst||worst.px>=MIN_INPUT_FONT)continue;
 report({check:4,severity:'error',file:el.file,line:el.line,key:elKey(el),why:`font-size ${Math.round(worst.px*10)/10}px (< ${MIN_INPUT_FONT}px) on ${worst.dev.name} — ${worst.src}. Safari zooms the whole page when the field gets focus.`,fix:`Set font-size:16px (or more) on the field for phones, e.g. font-size:max(16px,1em).`});
}

/* 5 ─ viewport-fit=cover and safe areas on fixed bars */
const layoutText=fs.existsSync(path.join(ROOT,'app/layout.tsx'))?fs.readFileSync(path.join(ROOT,'app/layout.tsx'),'utf8'):'';
if(!/viewportFit\s*:\s*['"]cover['"]|viewport-fit\s*=\s*cover/.test(layoutText))report({check:5,severity:'error',file:'app/layout.tsx',line:1,key:'viewport',why:'viewport meta lacks viewport-fit=cover: env(safe-area-inset-*) are all 0 and the page is letterboxed around the notch/home bar.',fix:"export const viewport: Viewport = { width:'device-width', initialScale:1, viewportFit:'cover' }"});
const SAFE_VARS=new Set([...CSS.customProps.entries()].filter(([,defs])=>defs.some(d=>/safe-area-inset/.test(d.value))).map(([k])=>k));
const usesSafe=r=>r.decls.some(d=>/env\(\s*safe-area-inset/.test(d.value)||[...d.value.matchAll(/var\(\s*(--[\w-]+)/g)].some(m=>SAFE_VARS.has(m[1])));
for(const r of CSS.rules){
 const pos=decl(r,'position');if(!pos||pos.value!=='fixed')continue;
 const ii=insetInfo([r]);if(ii.top&&ii.bottom)continue;// full-screen layers are checked by 2
 const v=p=>decl(r,p)?.value;const inset=v('inset')?.split(/\s+/);
 const lr=(v('left')==='0'||v('left')==='0px')&&(v('right')==='0'||v('right')==='0px')||(inset&&inset.length>=2&&(inset[1]==='0')&&((inset[3]??inset[1])==='0'))||/^100(%|vw)$/.test(v('width')||'');
 if(!lr)continue;
 const edge=ii.bottom?'bottom':ii.top?'top':null;if(!edge)continue;
 for(const s of r.selectors){if(s.compounds[s.compounds.length-1].pseudoEl)continue;
  const same=sigRules.get(r.file+'|'+subjectSig(s))||[r];if(same.some(usesSafe))continue;
  report({check:5,severity:'error',file:r.file,line:r.line,key:s.text.trim(),why:`fixed ${edge} bar without env(safe-area-inset-${edge}): on notched iPhones and in landscape its content sits under the ${edge==='bottom'?'home indicator':'status bar / Dynamic Island'}.`,fix:`padding-${edge}:calc(<current> + env(safe-area-inset-${edge},0px)) (and left/right insets for landscape).`});}
}

/* 6 ─ hover-only reveals */
for(const r of CSS.rules){
 const reveals=r.decls.filter(d=>(d.prop==='opacity'&&/^(1|1\.0+|100%)$/.test(d.value))||(d.prop==='visibility'&&d.value==='visible')||(d.prop==='display'&&d.value!=='none')||(d.prop==='content'&&d.value!=='none'&&d.value!=="''"&&d.value!=='""')||(d.prop==='max-height'&&d.value!=='0'&&d.value!=='0px'));
 if(!reveals.length)continue;
 const hov=r.selectors.filter(s=>s.compounds.some(c=>c.states.includes('hover')));if(!hov.length)continue;
 const touchTwin=r.selectors.some(s=>s.compounds.some(c=>c.states.some(x=>x!=='hover')))||r.selectors.length>hov.length;
 if(touchTwin)continue;
 for(const s of hov)report({check:6,severity:'warning',file:r.file,line:r.line,key:s.text.trim(),why:`:hover reveals content (${reveals.map(d=>`${d.prop}:${d.value}`).join('; ')}) ${mediaLabel(r.at)} with no :focus-visible/:focus-within/:active or state-class twin. Touch has no hover, so kids never see it.`,fix:`Add the same reveal for :focus-visible/:focus-within or a tapped state ([data-open], .is-open), or show it by default on (hover:none).`});
}

/* 7 ─ user-scalable=no */
const scaleHits=[];for(const f of [...TSX_FILES,...(fs.existsSync(path.join(ROOT,'public'))?walk(path.join(ROOT,'public')):[]).filter(p=>/\.html?$/.test(p))]){const t=fs.readFileSync(f,'utf8');if(/user-scalable\s*=\s*(no|0)|userScalable\s*:\s*false|maximum-scale\s*=\s*1(?:\.0)?\b|maximumScale\s*:\s*1\b/.test(t))scaleHits.push(rel(f));}
// Only where a small input can actually appear: the same route folder (app/layout.tsx covers every page).
for(const f of scaleHits){const scope=f==='app/layout.tsx'?'':path.posix.dirname(f)+'/';if(findings.some(x=>x.check===4&&x.file.startsWith(scope)))report({check:7,severity:'warning',file:f,line:1,key:'user-scalable',why:'pinch zoom is disabled while some inputs are under 16px: iOS still zooms on focus (it ignores user-scalable=no) and players cannot zoom back out.',fix:'Remove user-scalable=no / maximum-scale=1 and fix the input font sizes instead.'});}

/* ───────────────────────────── output ───────────────────────────── */

const NAMES={0:'Invalid CSS selectors',1:'Long-press callout / selection on game controls',2:'Full-screen overlays sized by viewport units','2b':'Viewport-unit height beside an inset',3:'Tap targets under 44px',4:'Inputs under 16px',5:'viewport-fit and safe areas',6:'Hover-only reveals',7:'user-scalable=no'};
const errors=findings.filter(f=>f.severity==='error'&&!f.allowed),warnings=findings.filter(f=>f.severity==='warning'&&!f.allowed),known=findings.filter(f=>f.allowed);
const fmt=f=>`  ${f.file}:${f.line}  ${f.key}\n      why: ${f.why}\n      fix: ${f.fix}`;
for(const check of Object.keys(NAMES)){
 const errs=errors.filter(f=>String(f.check)===check),warns=warnings.filter(f=>String(f.check)===check);
 if(errs.length){console.log(`\n✗ [${check}] ${NAMES[check]} — ${errs.length} failure(s)`);errs.forEach(f=>console.log(fmt(f)));}
 if(warns.length){console.log(`\n⚠ [${check}] ${NAMES[check]} — ${warns.length} warning(s)`);
  if(VERBOSE)warns.forEach(f=>console.log(fmt(f)));else{console.log(fmt(warns[0]));warns.slice(1).forEach(f=>console.log(`  ${f.file}:${f.line}  ${f.key}`));}}
}
const bugs=known.filter(f=>f.allowed.bug);
if(bugs.length){console.log(`\n⚠ Known bugs held in the allowlist (${bugs.length}) — fix them, then delete their entries${VERBOSE?':':' (details: --verbose)'}`);
 if(VERBOSE)bugs.forEach(f=>console.log(`  [${f.check}] ${f.file}:${f.line}  ${f.key} — ${f.allowed.reason}`));
 else for(const check of Object.keys(NAMES)){const b=bugs.filter(f=>String(f.check)===check);if(b.length)console.log(`  [${check}] ${NAMES[check]}: ${b.length} in ${[...new Set(b.map(f=>f.file.replace(/^components\//,'')))].join(', ')}`);}}
if(VERBOSE){const ok=known.filter(f=>!f.allowed.bug);if(ok.length){console.log(`\nAllowlisted exceptions (${ok.length}):`);ok.forEach(f=>console.log(`  [${f.check}] ${f.file}:${f.line}  ${f.key} — ${f.allowed.reason}`));}
 console.log(`\nHold controls and canvases found (${holdList.length}):`);holdList.forEach(s=>console.log('  '+s));
 console.log(`\nTap targets not statically sized (${tapStats.unknown}):`);tapStats.unknownList.forEach(s=>console.log('  '+s));}
const stale=allow.map((a,i)=>({a,i})).filter(({i})=>!used.has(i));
if(stale.length){console.log(`\n⚠ Stale allowlist entries (nothing matches; delete them from tests/device-guards.allowlist.json):`);stale.forEach(({a})=>console.log(`  [${a.check}] ${a.file}  ${a.key}`));}
if(JSON_OUT)fs.writeFileSync(JSON_OUT,JSON.stringify({findings:findings.map(({allowed,...f})=>({...f,allowed:allowed?.reason??null})),tapStats},null,1));
const summary=`Device guards: ${holdCount} hold controls/canvases, ${tapStats.checked} buttons (${tapStats.ok} ≥44px, ${tapStats.small} small, ${tapStats.unknown} not static), ${inputCount} text inputs, ${CSS.rules.length} CSS rules — ${errors.length} error(s), ${warnings.length} warning(s), ${known.length} allowlisted (${bugs.length} known bugs).`;
if(errors.length){console.log(`\n${summary}\nFix the failures above or, if intentional, add {check,file,key,reason} to tests/device-guards.allowlist.json.`);process.exit(1);}
console.log(`\n${summary}`);

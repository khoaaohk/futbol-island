// Printable coach sheets (seo-extras, Nov 15 2026; components/site/PrintSheet.tsx, PrintButton.tsx, printSheet.module.css):
//  1. Every drill page and every rule page renders the sheet: a "Print / Save as PDF" button (window.print, no PDF library) and a
//     print-only URL line with the page's own address.
//  2. The parts the sheet keeps exist on those pages (title, answer, diagram, steps / referee points, coaching points / mix-ups).
//  3. The print stylesheet exists and, in @media print, hides the site chrome (everything in the page wrapper but <main>: the
//     bar, the footer, a sticky Play bar), the breadcrumbs and buttons, and every other section (FAQ, link lists); the screen row hides.
// usage: node tests/seo-print.cjs
const assert=require('node:assert/strict');
const {root,L,read,render,React}=require('./lib/tsLoad.cjs');process.chdir(root);
const drills=L('lib/site/drills.ts'),rules=L('lib/site/rules.ts');
const css=read('components/site/printSheet.module.css'),print=(css.match(/@media print\{([\s\S]*)\}\s*$/)||[])[1]||'';
assert(print.length>200,'a print block');
for(const r of ['body:has(.sheet) [data-reading-page]>:not(main){display:none!important}','main:has(.sheet)>header>:not(h1):not([data-answer]):not([data-quick-answer]){display:none!important}','main:has(.sheet) [data-key-facts]{display:none!important}','main:has(.sheet) button{display:none!important}','.screen{display:none!important}','@page{margin:12mm}'])
 assert(print.includes(r),`print CSS: ${r}`);
assert(/main:has\(\.sheet\)>:not\(header\):not\(\.sheet\)(:not\(section\[aria-labelledby=[a-z-]+\]\))+\{display:none!important\}/.test(print),'print CSS drops every section it does not keep');
assert(/^\.url\{display:none\}/m.test(css),'the URL line is print-only');
assert(/@media print\{\.header\{display:none\}\}/.test(read('app/(site)/site.module.css')),'the site bar is hidden in print');
assert(/onClick=\{\(\)=>window\.print\(\)\}/.test(read('components/site/PrintButton.tsx')),'the button opens the print dialog');
const pkg=JSON.parse(read('package.json')),deps={...pkg.dependencies,...pkg.devDependencies};
assert(!Object.keys(deps).some(d=>/jspdf|pdfkit|pdfmake|react-pdf|html2pdf/.test(d)),'no PDF library');
const keep=[...print.matchAll(/:not\(section\[aria-labelledby=([a-z]+)\]\)/g)].map(m=>m[1]);
const check=(file,items,want)=>{const P=L(file);for(const it of items){
 const h=render(React.createElement(P.default,{params:{slug:it.path.split('/').pop()}}));
 assert(/data-print-sheet=""/.test(h)&&/>Print \/ Save as PDF<\/button>/.test(h),`${it.path}: the print button`);
 assert(h.includes(`futbolisland.app${it.path}</p>`),`${it.path}: the URL footer`);
 assert(/<h1/.test(h)&&/data-answer=""/.test(h),`${it.path}: title and answer`);
 for(const id of want){assert(keep.includes(id),`kept: ${id}`);assert(h.includes(`aria-labelledby="${id}"`),`${it.path}: has the ${id} section`);}
 assert(h.includes('aria-labelledby="faq"')&&!keep.includes('faq'),`${it.path}: the FAQ is dropped in print`);}
 return items.length;};
const n=check('app/(site)/learn/soccer-drills/[slug]/page.tsx',drills.DRILLS,['diagram','steps','cues'])+check('app/(site)/learn/soccer-rules/[slug]/page.tsx',rules.RULES,['diagram','referee','mixups']);
console.log(`seo-print: ok (${n} drill and rule sheets)`);

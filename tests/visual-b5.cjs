// Visual pass, batch 5 (Nov 17 2026; owner: "pages are a wall of text, make them visual"). Renders the REAL page modules
// (tests/lib/tsLoad.cjs, no build) and checks components/site/PageParts.tsx on the about, safety, trust, Fishbook, drill and
// practice-plan pages, EN and ES:
//  1. Key facts: the trust tiles (about, safe: 5 tiles, each with an aria-hidden icon), the trust page's quick answer (4 facts),
//     the fish key-facts strip (rarity, size, where, shadow, price), the drill and plan "At a glance" chips.
//  2. Pictures: every <img> on these pages has width, height and a real alt (or alt="" only where the words already say it);
//     the screenshots exist in public/.
//  3. FAQ: the FAQPage JSON-LD names the same questions in the same order, and each answer is on the page: on /safe the short
//     line plus the "More" rest is exactly the answer.
//  4. Lists: catch steps are a real <ol> with one icon per tip; coaching points are a checklist with one tick per cue.
// usage: node tests/visual-b5.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {root,L,render,React,ldOf}=require('./lib/tsLoad.cjs');process.chdir(root);
let n=0;const ok=(c,m)=>{assert(c,m);n++;};
const routes=L('components/es/routes.tsx');
const page=(file,params={})=>render(React.createElement(L(file).default,{params}));
const es=enPath=>{const r=routes.esRoute(enPath);assert(r,`${enPath}: a Spanish route`);return render(r.render());};
const dec=s=>s.replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const text=h=>dec(h.replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();

function images(h,where){
 const imgs=[...h.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);
 for(const i of imgs){
  ok(/ width="\d+"/.test(i)&&/ height="\d+"/.test(i),`${where}: image has width and height: ${i.slice(0,90)}`);
  ok(/ alt="/.test(i),`${where}: image has alt`);
  const src=/ src="([^"]+)"/.exec(i)[1];
  if(!/^\/fish\//.test(src))ok(fs.existsSync(path.join(root,'public',src)),`${where}: ${src} exists in public/`);
 }
 return imgs;
}
function trust(h,where){
 const m=/<ul class="trust"[^>]*data-trust-tiles="">([\s\S]*?)<\/ul>/.exec(h);ok(m,`${where}: trust tiles`);
 const tiles=[...m[1].matchAll(/<li class="trustTile">([\s\S]*?)<\/li>/g)];
 ok(tiles.length===5,`${where}: 5 trust tiles (${tiles.length})`);
 for(const t of tiles)ok(/^<svg[^>]*aria-hidden="true"/.test(t[1])&&/<b class="trustTitle">[^<]+<\/b>/.test(t[1]),`${where}: each tile has an icon and a title`);
 ok(h.indexOf('data-trust-tiles')<h.indexOf('<h2'),`${where}: the tiles sit under the title, before the first section`);
 ok(!/\bno chat\b|\bsin chat(?! abierto)/i.test(text(m[1])),`${where}: never "no chat"`);
}
function faqLdMatches(h,where){
 const faq=ldOf(h).find(x=>x['@type']==='FAQPage');ok(faq,`${where}: FAQPage JSON-LD`);
 const t=text(h);for(const x of faq.mainEntity){ok(t.includes(x.name),`${where}: question on the page: ${x.name}`);ok(t.includes(x.acceptedAnswer.text.replace(/\s+/g,' ')),`${where}: answer on the page: ${x.name}`);}
 return faq;
}
// ---- 1. about (EN + ES) ----
for(const [where,h] of [['/about',page('app/(site)/about/page.tsx')],['/es/about',es('/about')]]){
 trust(h,where);
 const tiles=/<ul class="tiles" data-picture-tiles="">([\s\S]*?)<\/ul>/.exec(h);ok(tiles,`${where}: "What it teaches" picture tiles`);
 const hrefs=[...tiles[1].matchAll(/<a class="tile" href="([^"]+)">/g)].map(m=>m[1]);
 ok(['/learn/lessons','/cards','/fish','/exhibits'].every(p=>hrefs.includes(p)),`${where}: tiles link lessons, cards, fish and museum`);
 for(const i of images(tiles[1],where))ok(/ alt="[^"]{20,}"/.test(i)&&/ loading="lazy"/.test(i),`${where}: tile picture has a real alt and loads lazily`);
 ok(/data-icon-list=""/.test(h),`${where}: "How it works" is an icon list`);
 faqLdMatches(h,where);
 ok(/<div class="faqList" data-faq="faq">/.test(h),`${where}: the FAQ is the site's collapsible rows`);
 images(h,where);
}
// ---- 2. the parents' guide ----
{const where='/safe-football-game-for-kids',h=page('app/(site)/safe-football-game-for-kids/page.tsx'),S=L('lib/site/safety.ts');
 trust(h,where);
 const pr=/<ul class="promises" data-promises="">([\s\S]*?)<\/ul>/.exec(h);ok(pr,`${where}: the promises`);
 const cards=[...pr[1].matchAll(/<li class="promise ([^"]+)">([\s\S]*?)<\/li>/g)];
 ok(cards.length===S.SAFE_FACTS.length,`${where}: every safety fact is a promise card (${cards.length})`);
 for(const f of S.SAFE_FACTS)ok(text(pr[1]).includes(dec(f.text)),`${where}: the fact is word for word: ${f.title}`);
 const shots=images(pr[1],where);ok(shots.length>=4,`${where}: at least 4 game screenshots beside the promises (${shots.length})`);
 for(const i of shots)ok(/ alt="[^"]{30,}"/.test(i),`${where}: screenshot alt says what it shows`);
 const faq=faqLdMatches(h,where);
 const rows=[...h.matchAll(/<div class="faqRow" data-q="[^"]*"><h3 class="faqQ">([^<]+)<\/h3><p class="faqA">([^<]*)<\/p>(?:<details class="faqMore"><summary>More<\/summary><p>([^<]*)<\/p><\/details>)?<\/div>/g)];
 ok(rows.length===faq.mainEntity.length,`${where}: one short row per FAQPage question (${rows.length})`);
 rows.forEach((r,i)=>{const x=faq.mainEntity[i];ok(dec(r[1])===x.name,`${where}: same question, same order: ${x.name}`);
  ok([dec(r[2]),dec(r[3]||'')].filter(Boolean).join(' ')===x.acceptedAnswer.text,`${where}: short line + More is exactly the answer: ${x.name}`);
  ok(dec(r[2]).length<x.acceptedAnswer.text.length||!r[3],`${where}: the short line is shorter than the answer`);});
 ok(rows.some(r=>r[3]),`${where}: some answers fold the rest under More`);
 images(h,where);}
// ---- 3. how we check facts ----
{const where='/about/how-we-check-facts',h=page('app/(site)/about/how-we-check-facts/page.tsx');
 const q=/<div class="quick" data-quick-answer="">([\s\S]*?)<\/dl><\/div>/.exec(h);ok(q&&/data-answer=""/.test(q[1]),`${where}: the answer in the quick-answer card`);
 ok([...q[1].matchAll(/<div class="fact">/g)].length===4,`${where}: 4 key facts`);
 for(const m of q[1].matchAll(/href="#([^"]+)"/g))ok(h.includes(` id="${m[1]}"`),`${where}: #${m[1]} has its target`);
 ok((h.match(/data-icon-list=""/g)||[]).length===2,`${where}: the two rule lists are icon lists`);}
// ---- 4. Fishbook pages ----
{const fish=L('lib/site/fish.ts'),notes=L('lib/site/fishNotes.ts'),all=fish.SITE_FISH;
 const picks=[all[0],all.find(f=>f.when),all.find(f=>f.deepSea),all.find(f=>f.story),all.at(-1)].filter(Boolean);
 for(const f of picks){const where=fish.fishPath(f.id),h=page('app/(site)/fish/[id]/page.tsx',{id:f.id});
  ok(!/class="eyebrow"/.test(h),`${where}: no eyebrow over the title (rarity is a key fact now)`);
  const k=/<dl class="facts" data-key-facts="">([\s\S]*?)<\/dl>/.exec(h);ok(k,`${where}: key-facts strip`);
  const facts=[...k[1].matchAll(/<dt><svg[^>]*aria-hidden="true"[\s\S]*?<span>([^<]+)<\/span><\/dt>/g)].map(m=>m[1]);
  for(const l of ['Rarity','Size','Where','Shadow','Market price'])ok(facts.includes(l),`${where}: key fact ${l}`);
  ok(facts.includes('When')===!!f.when,`${where}: "When" only for night or sunset fish`);
  ok(h.indexOf('data-key-facts')>h.indexOf('<img')&&h.indexOf('data-key-facts')<h.indexOf('data-fish-grid'),`${where}: the art first, then the facts, then the cards`);
  const st=/<ol class="steps" data-icon-steps="">([\s\S]*?)<\/ol>/.exec(h);ok(st,`${where}: catch steps are a numbered list`);
  const tips=notes.fishCatchTips(f),li=[...st[1].matchAll(/<li><svg[^>]*aria-hidden="true"[\s\S]*?<p>([\s\S]*?)<\/p><\/li>/g)];
  ok(li.length===tips.length&&li.every((m,i)=>dec(m[1])===tips[i]),`${where}: one icon step per tip, same words`);
  images(h,where);}}
// ---- 5. drills and practice plans (EN + ES) ----
{const drills=L('lib/site/drills.ts'),plans=L('lib/site/plans.ts'),ep=L('lib/i18n/esPaths.ts');
 const glance=(h,where,labels)=>{const g=/<dl class="glance"[^>]*data-glance="">([\s\S]*?)<\/dl>/.exec(h);ok(g,`${where}: "At a glance" chips`);
  const got=[...g[1].matchAll(/<div class="chip(?: chipWide)?"><dt><svg[^>]*aria-hidden="true"[\s\S]*?<span>([^<]+)<\/span><\/dt><dd>[^<]+<\/dd><\/div>/g)].map(m=>m[1]);
  ok(labels.every(l=>got.includes(l)),`${where}: chips ${labels.join(', ')} (${got.join(', ')})`);
  ok(!/<table/.test(h.slice(h.indexOf('id="facts"'),h.indexOf('id="facts"')+600)),`${where}: no table for the facts any more`);};
 const checks=(h,where,items)=>{const c=/<ul class="checks" data-checklist="">([\s\S]*?)<\/ul>/.exec(h);ok(c,`${where}: checklist`);
  ok((c[1].match(/data-fact-icon="tick"/g)||[]).length===items.length,`${where}: one tick per point`);
  for(const t of items)ok(text(c[1]).includes(dec(t)),`${where}: the point is on the page`);};
 for(const d of [drills.DRILLS[0],drills.DRILLS.at(-1)]){
  const h=page('app/(site)/learn/soccer-drills/[slug]/page.tsx',{slug:d.slug});
  glance(h,d.path,['Ages','Players','Space','Time','Skill','Equipment']);checks(h,d.path,d.cues);
  ok(h.indexOf('id="diagram"')<h.indexOf('data-glance'),`${d.path}: the diagram stays above the chips`);faqLdMatches(h,d.path);
  const e=es(d.path);glance(e,ep.toEs(d.path),['Edades','Jugadores','Espacio','Tiempo','Habilidad','Material']);ok(/data-checklist=""/.test(e),`${ep.toEs(d.path)}: checklist`);}
 for(const p of [plans.PLANS[0],plans.PLANS.at(-1)]){
  const h=page('app/(site)/learn/soccer-practice-plans/[slug]/page.tsx',{slug:p.slug});
  glance(h,p.path,['Age group','Length','Players','Goal for the day','Final game']);checks(h,p.path,p.notes);faqLdMatches(h,p.path);
  const e=es(p.path);glance(e,ep.toEs(p.path),['Edad','Duración','Jugadores','Objetivo del día','Partido final']);ok(/data-checklist=""/.test(e),`${ep.toEs(p.path)}: checklist`);}}
// ---- 6. CSS: phone first, reduced motion, no outlines or shadows at rest ----
{const css=fs.readFileSync(path.join(root,'components/site/PageParts.module.css'),'utf8');
 ok(!/box-shadow/.test(css)&&!/gradient/.test(css),'PageParts CSS: no shadows, no gradients');
 ok(/prefers-reduced-motion:reduce/.test(css),'PageParts CSS: reduced motion');
 ok(/\.trust\{[^}]*repeat\(2,minmax\(0,1fr\)\)/.test(css)&&/@media\(min-width:720px\)\{\.trust\{grid-template-columns:repeat\(5/.test(css),'trust tiles: 2 across on a phone, 5 from 720 px');
 ok(/@media print\{\.chip/.test(css),'chips print plainly');}
console.log(`visual-b5: ${n} checks OK`);

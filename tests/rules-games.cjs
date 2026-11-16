// The back-pass, throw-in, handball and fouls pages' deck and game (Nov 16 2026; lib/site/rulePlay.ts, lib/i18n/es/rulePlay.ts,
// components/site/RulePlaySections.tsx, the shared CardDeck.tsx and RefCallGame.tsx):
//  1. Content: every page has a deck (5-9 slides, unique ids, each with a name, explanation, example and next line, a tone the
//     deck names and a drawn icon) and a game that passes checkCallGame (10-15 scenarios, every answer one of the 2-3 choices,
//     every choice used). Every scenario has English AND Spanish text and a reason; Spanish has the same ids, tones, icons,
//     answers, choices, swipes and level thresholds; no banned Spanish words.
//  2. Server HTML (English page and its /es twin): every slide's words are in the markup (the deck enhances a real list), the
//     deck is a labelled carousel with one labelled group per slide, the game has its title and Start button, the FAQPage
//     JSON-LD is still valid; the print sheet stays the normal rule sheet; other rule pages get no deck or game.
// usage: node tests/rules-games.cjs
const assert=require('node:assert/strict');
const {root,L,read,render,React,ldOf}=require('./lib/tsLoad.cjs');process.chdir(root);
const RP=L('lib/site/rulePlay.ts'),ES=L('lib/i18n/es/rulePlay.ts'),RC=L('lib/site/refCall.ts'),RD=L('lib/site/ruleDeck.ts'),GL=L('lib/i18n/es-glossary.ts');
let n=0;const ok=(c,m)=>{assert(c,m);n++;};
const decode=h=>h.replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const icons=read('components/site/CardIcons.tsx');
const SLUGS=['back-pass-rule','throw-in','handball','fouls-and-free-kicks'];
ok(JSON.stringify([...RP.RULE_PLAY_SLUGS])===JSON.stringify(SLUGS),'the four rule pages');
const sig=c=>JSON.stringify({slides:c.slides.map(s=>[s.id,s.tone,s.icon]),choices:c.game.choices.map(x=>[x.id,x.swipe,RC.toneOf(x)]),
 scenarios:c.game.scenarios.map(s=>[s.id,s.answer]),levels:c.game.levels.map(l=>l.min),deck:c.deck.id,game:c.game.id});
// ---- 1. content ----
for(const slug of SLUGS){
 const en=RP.RULE_PLAY[slug],es=ES.RULE_PLAY_ES[slug];
 ok(sig(en)===sig(es),`${slug}: Spanish has the same slides, tones, icons, choices, swipes, answers and levels`);
 for(const [tag,c] of [['en',en],['es',es]]){
  ok(c.slides.length>=5&&c.slides.length<=9&&new Set(c.slides.map(s=>s.id)).size===c.slides.length,`${tag}/${slug}: 5-9 slides, unique ids`);
  for(const s of c.slides){
   for(const k of ['name','explain','example','next'])ok(typeof s[k]==='string'&&s[k].trim().length>2,`${tag}/${slug}/${s.id}: ${k}`);
   ok(c.deck.words.kinds[s.tone],`${tag}/${slug}/${s.id}: the deck names tone ${s.tone}`);
   ok(RD.DECK_ICONS.includes(s.icon)&&new RegExp(`\\n ${s.icon}:<>`).test(icons),`${tag}/${slug}/${s.id}: icon ${s.icon} is drawn`);}
  RC.checkCallGame(c.game);n++;
  const ids=c.game.choices.map(x=>x.id);
  for(const s of c.game.scenarios){ok(s.text.trim().length>10&&s.why.trim().length>5,`${tag}/${slug}/${s.id}: text and reason`);ok(ids.includes(s.answer),`${tag}/${slug}/${s.id}: answer is a choice`);}
  for(const x of c.game.choices)ok(x.label.trim(),`${tag}/${slug}: choice ${x.id} label`);
  for(const k of ['title','intro','how','start','progress','answerIs','score','noScript'])ok(c.game.words[k].trim(),`${tag}/${slug}: game words ${k}`);
  ok(/\{n\}/.test(c.game.words.progress)&&/\{call\}/.test(c.game.words.answerIs)&&/\{score\}/.test(c.game.words.score)&&/\{n\}/.test(c.deck.words.position),`${tag}/${slug}: placeholders`);
  ok(c.game.choices.every(x=>{const w=c.game.words.how.toLowerCase();return w.includes(x.swipe==='up'?(tag==='es'?'arriba':'up'):x.swipe==='left'?(tag==='es'?'izquierda':'left'):(tag==='es'?'derecha':'right'));}),`${tag}/${slug}: the how line names every swipe`);
 }
 for(const s of en.game.scenarios){const e=es.game.scenarios.find(x=>x.id===s.id);ok(e&&e.text!==s.text&&e.why!==s.why,`${slug}/${s.id}: Spanish text differs from English (translated)`);}
 const esText=JSON.stringify(es);for(const re of GL.ES_BANNED)ok(!re.test(esText),`${slug}: Spanish avoids ${re}`);
}
ok(RP.RULE_PLAY['fouls-and-free-kicks'].game.choices.length===3&&['back-pass-rule','throw-in','handball'].every(s=>RP.RULE_PLAY[s].game.choices.length===2),'fouls game has three calls, the others two');
ok(/checked Nov 16 2026/.test(read('lib/site/rulePlay.ts'))&&/fouls-and-misconduct/.test(read('lib/site/rulePlay.ts'))&&/the-throw-in/.test(read('lib/site/rulePlay.ts')),'rulePlay.ts cites its IFAB sources and check date');
ok(!/from '@\//.test(read('lib/i18n/es/rulePlay.ts'))&&!/from '@\/lib\/i18n/.test(read('lib/site/rulePlay.ts')),'i18n imports are relative');
// ---- 2. server HTML ----
const P=L('app/(site)/learn/soccer-rules/[slug]/page.tsx'),routes=L('components/es/routes.tsx'),rules=L('lib/site/rules.ts'),esReg=L('lib/i18n/es/registry.ts');
for(const slug of SLUGS){
 const pages=[['en',decode(render(React.createElement(P.default,{params:{slug}}))),RP.RULE_PLAY[slug],rules.ruleBySlug(slug)],
  ['es',decode(render(routes.esRoute(`/learn/soccer-rules/${slug}`).render())),ES.RULE_PLAY_ES[slug],esReg.esRule(slug)]];
 for(const [tag,h,c,r] of pages){
  for(const s of c.slides)for(const k of ['name','explain','example','next'])ok(h.includes(s[k]),`${tag}/${slug} HTML has ${s.id}.${k}`);
  ok(h.includes(`aria-labelledby="${c.deck.id}"`)&&h.includes(c.deck.title),`${tag}/${slug}: deck section`);
  ok(/data-card-deck=""/.test(h)&&/role="region" aria-roledescription="carousel" aria-label="[^"]+"/.test(h),`${tag}/${slug}: deck is a labelled carousel region`);
  ok((h.match(/role="group" aria-roledescription="card" aria-label="[^"]+"/g)||[]).length===c.slides.length,`${tag}/${slug}: one labelled group per slide`);
  ok(!/inert=""/.test(h)&&!/data-ready/.test(h),`${tag}/${slug}: server HTML is the plain list`);
  ok(h.includes(`data-ref-call="${c.game.id}"`)&&h.includes(c.game.words.title)&&h.includes(c.game.words.start),`${tag}/${slug}: game title and Start button`);
  ok(h.indexOf(`aria-labelledby="${c.deck.id}"`)<h.indexOf('aria-labelledby="diagram"')&&h.indexOf('aria-labelledby="diagram"')<h.indexOf(`data-ref-call="${c.game.id}"`),`${tag}/${slug}: deck, then the diagram, then the game`);
  ok(!/aria-labelledby="card-rules"/.test(h)&&/data-print-sheet=""/.test(h),`${tag}/${slug}: the normal rule sheet (not the card rules sheet)`);
  const ld=ldOf(h),faq=ld.find(x=>x['@type']==='FAQPage');
  ok(faq&&faq.mainEntity.length===r.faq.length&&faq.mainEntity.every((e,i)=>e.name===r.faq[i].q&&e.acceptedAnswer.text),`${tag}/${slug}: FAQPage JSON-LD unchanged and valid`);
 }
}
const off=decode(render(React.createElement(P.default,{params:{slug:'offside'}})));
ok(!/data-card-deck/.test(off)&&!/data-ref-call/.test(off),'other rule pages: no deck, no game');
ok(/:has\(section\[aria-labelledby=card-rules\]\)/.test(read('components/site/printSheet.module.css'))&&!/:has\(\[data-card-deck\]\)/.test(read('components/site/printSheet.module.css')),'print: only the cards page drops its diagram for the card rules sheet');
const css=read('components/site/refCallGame.module.css'),dcss=read('components/site/cardDeck.module.css');
for(const t of ['pitch','gold'])ok(new RegExp(`\\.choice\\[data-call=${t}\\]`).test(css)&&new RegExp(`\\.card\\[data-call=${t}\\] \\.back`).test(css)&&new RegExp(`\\.card\\[data-color=${t}\\] \\.front`).test(dcss)&&new RegExp(`\\.dot\\[data-color=${t}\\]`).test(dcss),`tone ${t} styled in the deck and the game`);
ok(/\.choices\[data-n="2"\]/.test(css),'two-choice games lay out two buttons');
console.log(`rules-games: ${n} checks OK`);

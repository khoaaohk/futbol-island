// "Share the game with your team" (Nov 20 2026; components/share/TeamShare.tsx, lib/share/teamShare.ts, lib/analytics/shareIds.ts).
// No build: the real modules are transpiled and run (tests/lib/tsLoad.cjs).
//  1. The message: per format and language, truthful fixed wording, plain text, the right links.
//  2. The links: fixed campaign marks only (no team name, no ids), every path is a real page (the game, each lesson, Spanish too).
//  3. The QR code: the `qrcode` package (already a dependency, runs on the device) is given the game link and encodes exactly it.
//  4. The Team homework sheet: team name (escaped) only on the sheet, the short link, the write-on line, both languages.
//  5. The counts: on the allowlist, within the wire pattern (so no migration), labelled, and the component sends no others.
//  6. Where it shows: the coach app (Team and Summary), the lineup, playing-time and practice-plan pages; never the embed or home.
// usage: node tests/team-share.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {root,L,read}=require('./lib/tsLoad.cjs');process.chdir(root);
const T=L('lib/share/teamShare.ts'),I=L('lib/analytics/shareIds.ts'),K=L('lib/analytics/countIds.ts'),D=L('lib/analytics/daily.ts');
const {LESSONS}=L('lib/site/lessons.ts'),{esLesson}=L('lib/i18n/es/lessons.ts'),{ES_LESSON_PAGES}=L('lib/i18n/esPaths.ts');
let checks=0;const ok=(c,m)=>{assert(c,m);checks++;};
const SURFACES=I.SHARE_SURFACES.map(x=>x[0]),LANGS=['en','es'],FORMATS=['4v4','5v5','7v7','9v9','11v11','futsal',undefined];
const lessons=LESSONS.map(l=>[l.format,l.id,l.title,esLesson(l.id).title]);
const BAD=/—|–|no ads\b|sin anuncios(?! emergentes)|guarantee|will improve|mejorará|@|\/marketing/i;
const linksOf=s=>s.match(/https:\/\/[^\s<"]+/g)||[];
const checkLink=(u,surface,via)=>{const x=new URL(u);ok(x.origin==='https://futbolisland.app','our own site: '+u);
 ok([...x.searchParams.keys()].join()==='utm_source,utm_medium','campaign marks only: '+u);
 ok(x.searchParams.get('utm_source')===T.SHARE_SOURCE[surface]&&x.searchParams.get('utm_medium')===via&&!x.hash,'fixed values: '+u);return x.pathname;};

/* ---- 1. the message ---- */
for(const lang of LANGS)for(const surface of SURFACES)for(const format of FORMATS){
 const m=T.shareMessage({lang,surface,format});
 ok(!BAD.test(m),`plain truthful wording (${lang} ${format}): ${m}`);
 ok(m.includes('Futbol Island')&&/7 (to|a) 12/.test(m)&&(lang==='es'?/gratis/.test(m)&&/No hay que descargar nada ni crear una cuenta\./.test(m)&&/navegador/.test(m):/free/.test(m)&&/No download and no account needed\./.test(m)&&/browser/.test(m)),'free, browser, no download, no account');
 const withFormat=T.hasLessons(format);
 ok(withFormat===m.includes(format==='futsal'?'futsal':String(format)),`the format is named only when the game has its lessons (${format})`);
 const links=linksOf(m);ok(links.length===1&&links[0]===T.gameLink(surface)&&m.trim().endsWith(links[0]),'one link, the game, last');
 ok(checkLink(links[0],surface,'share')==='/play','the game link opens /play');
 ok(m.length<520&&m.split('\n\n').length===3,'three short paragraphs');
}
ok(T.shareMessage({lang:'en',surface:'coach',format:'7v7'})===`Hi families. Here is a free football (soccer) game our players can try at home: Futbol Island. It is for kids aged 7 to 12. It has short 7v7 lessons with quick quizzes.\n\nIt plays in the browser on a phone, tablet or computer. No download and no account needed.\n\nPlay the game: https://futbolisland.app/play?utm_source=coach-app&utm_medium=share`,'the English 7v7 message, word for word');
ok(T.shareMessage({lang:'es',surface:'coach',format:'9v9'})===`Hola, familias. Les comparto un juego de fútbol gratis que nuestros jugadores pueden probar en casa: Futbol Island. Es para niños de 7 a 12 años. Tiene lecciones cortas de fútbol 9v9 con pruebas rápidas.\n\nSe juega en el navegador, en un teléfono, una tableta o una computadora. No hay que descargar nada ni crear una cuenta.\n\nJugar: https://futbolisland.app/play?utm_source=coach-app&utm_medium=share`,'the Spanish 9v9 message, word for word');

/* ---- 2. lessons and paths ---- */
ok(fs.existsSync('app/play/page.tsx')&&fs.existsSync('app/(site)/learn/lessons/[slug]/page.tsx')&&fs.existsSync('app/es/[[...path]]/page.tsx'),'the routes exist');
for(const f of T.LESSON_FORMATS){
 const list=T.lessonsFor(lessons,f);ok(list.length>=5&&list.every(l=>l[0]===f),`${f} has its own lessons (${list.length})`);
 for(const l of list)for(const lang of LANGS){
  const m=T.shareMessage({lang,surface:'coach',format:f,lesson:l}),links=linksOf(m);
  ok(links.length===2&&links[1]===T.gameLink('coach')&&m.includes(`${lang==='es'?'La lección de esta semana':'This week’s lesson'}: ${lang==='es'?l[3]:l[2]}\n${links[0]}`),'the lesson by its title, with its link');
  const p=checkLink(links[0],'coach','share');
  ok(lang==='es'?ES_LESSON_PAGES.includes(p.replace(/^\/es/,''))&&p.startsWith('/es/learn/lessons/'):p==='/learn/lessons/'+l[1],'a real lesson page: '+p);
  ok(LESSONS.some(x=>x.id===l[1]&&x.format===f)&&!BAD.test(m.replace(l[2],'').replace(l[3],'')),'the lesson belongs to the format');
 }
}
ok(T.lessonsFor(lessons,'4v4').length===0&&T.lessonsFor(undefined,'7v7').length===0,'no lesson picker without lessons');

/* ---- 3. the QR code ---- */
{const QR=require('qrcode');ok(Object.keys(JSON.parse(read('package.json')).dependencies).includes('qrcode'),'qrcode is an existing dependency');
 for(const surface of SURFACES)for(const via of ['qr','print']){const u=T.gameLink(surface,via);ok(checkLink(u,surface,via)==='/play','QR link');
  const q=QR.create(u,{errorCorrectionLevel:'M'});ok(Buffer.from(q.segments.map(s=>s.data).reduce((a,b)=>Buffer.concat([a,Buffer.from(b)]),Buffer.alloc(0))).toString('utf8')===u&&q.modules.size>=25,'the code holds exactly the link');}
 const src=read('components/share/TeamShare.tsx');
 ok(/makeQr\(gameLink\(surface,'qr'\),480\)/.test(src)&&/makeQr\(gameLink\(surface,'print'\),300\)/.test(src)&&/await import\('qrcode'\)/.test(src),'the component draws the game link, on the device, on demand');
 ok(!/fetch\(|XMLHttpRequest|sendBeacon|https?:\/\//.test(src),'no network call and no outside address in the component');
 ok(/navigator\.share\(\{text\}\)/.test(src)&&/navigator\.clipboard\.writeText\(text\)/.test(src),'share sheet and copy send the message text only');}

/* ---- 4. the Team homework sheet ---- */
for(const lang of LANGS){const w=T.SHARE_WORDS[lang];
 const h=T.homeworkHtml({lang,team:'Tigers <U10> & co',qr:'data:image/png;base64,AAAA',tryLine:'Roles'});
 ok((h.match(/class="half"/g)||[]).length===2&&h.includes('Tigers &lt;U10&gt; &amp; co')&&!h.includes('<U10>'),'two half pages, the team name escaped');
 ok(h.includes(w.hwTitle)&&h.includes(w.hwTry)&&h.includes(T.SHARE_SHORT_LINK)&&h.includes(w.hwCut)&&h.includes('>Roles</span>'),'title, write-on line, short link');
 ok(!/<script|https?:\/\//.test(h)&&!BAD.test(h.replace(/<style>[\s\S]*?<\/style>/,'')),'self-contained, plain wording');
 const bare=T.homeworkHtml({lang});ok(!bare.includes('class="team"')&&!bare.includes('<img')&&bare.includes(T.SHARE_SHORT_LINK)&&bare.includes('<span class="fill"></span>'),'no team, no QR: still a usable sheet with a blank line');
 ok(Object.keys(T.SHARE_WORDS.en).join()===Object.keys(w).join()&&Object.values(w).every(v=>typeof v==='string'&&v&&!BAD.test(v)),'words: same keys, plain');}
ok(T.SHARE_WORDS.en.line==='Coaching a team? Send your players the free game.','the tool-page line');

/* ---- 5. the counts ---- */
{ok(I.SHARE_COUNT_IDS.length===I.SHARE_EVENTS.length*SURFACES.length&&new Set(I.SHARE_COUNT_IDS).size===I.SHARE_COUNT_IDS.length,'one id per event and surface');
 for(const id of I.SHARE_COUNT_IDS){ok(K.COUNT_KEY_RE.test(id)&&K.isCountId(id)&&K.FIXED_COUNT_IDS.includes(id),'on the allowlist: '+id);ok(D.counterLabel(id)!==id,'labelled: '+id);}
 ok(JSON.stringify(I.SHARE_EVENTS.map(e=>e[0]))==='["open","copy","sheet","qr","print"]'&&I.shareId('qr','coach')==='ts:qr_coach'&&!K.isCountId('ts:open_home'),'events and id shape');
 const src=read('components/share/TeamShare.tsx'),sent=[...new Set([...src.matchAll(/tally\('([a-z]+)'\)/g)].map(m=>m[1]))].sort();
 ok(JSON.stringify(sent)==='["copy","open","print","qr","sheet"]'&&(src.match(/count\(/g)||[]).length===1&&/count\(shareId\(e,surface\)\)/.test(src),'the component sends these totals and nothing else');
}

/* ---- 6. where it shows ---- */
{const app=read('components/coach/CoachApp.tsx');ok((app.match(/\{share\}/g)||[]).length===3&&/<TeamShare surface="coach" lang=\{lang\} format=\{store\.settings\.format\} team=\{store\.team\.name\} lessons=\{lessons\} heading\/>/.test(app),'coach app: Team tab, Summary tab (with and without a game)');
 ok(/lessons=\{SHARE_LESSONS\}/.test(read('app/coach/page.tsx')),'the coach page hands in the lesson titles');
 const tools=read('app/(site)/tools/[slug]/page.tsx'),toolsEs=read('components/es/pages/ToolsEs.tsx');
 ok((tools.match(/ teamShare\/>/g)||[]).length===2&&(toolsEs.match(/lang="es" teamShare\/>/g)||[]).length===2,'lineup builders and playing-time pages, English and Spanish');
 ok(/<TeamShare surface="lineup"/.test(read('components/site/tools/LineupBuilder.tsx'))&&/<TeamShare surface="minutes"/.test(read('components/site/tools/RotationPlanner.tsx')),'inside the tools, near the result');
 ok(/<TeamShare surface="practice"\/>/.test(read('app/(site)/learn/soccer-practice-plans/[slug]/page.tsx'))&&/<TeamShare surface="practice" lang="es"\/>/.test(read('components/es/pages/DrillsEs.tsx')),'practice plans, English and Spanish');
 ok(!/teamShare|TeamShare/.test(read('app/embed/[tool]/page.tsx'))&&!/TeamShare/.test(read('app/(site)/page.tsx')),'not in the club embed, not on the home page');
 ok(/@media print\{\.root\{display:none!important\}\}/.test(read('components/share/teamShare.module.css')),'never printed with the page around it');}
console.log(`team-share: ok (${checks} checks)`);

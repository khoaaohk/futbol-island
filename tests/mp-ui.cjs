// Multiplayer invite / join UI (Task D): flag gating, parent gate before create and join, only the six code boxes take text,
// link / pending-code / code-filter pure checks, >= 44px targets, toasts through toastLane, qrcode loaded dynamically only.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8'),req=require('node:module').createRequire(ROOT+'/package.json');
const cache=new Map(),env={NEXT_PUBLIC_MULTIPLAYER:'1',NEXT_PUBLIC_MULTIPLAYER_URL:'http://localhost:8790/'};
const store=new Map(),calls=[];let href='https://futbolisland.app/?party=k7m-q4r&x=1',origin='https://futbolisland.app';
const sandbox={
 sessionStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},
 location:{get href(){return href;},get origin(){return origin;}},history:{state:null,replaceState:(_s,_t,u)=>{href='https://futbolisland.app'+u;}},
};
function resolveTs(from,id){const base=path.resolve(path.dirname(from),id);return fs.existsSync(base+'.ts')?base+'.ts':path.join(base,'index.ts');}
function load(file){if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {exports:mod.exports,module:mod,Math,Date,JSON,Number,Array,Object,Error,Map,Set,URL,Promise,String,console,process:{env},fetch:(u,o)=>{calls.push([u,o&&o.method]);return Promise.resolve({ok:false,status:404});},
   ...sandbox,require:id=>id.startsWith('.')?load(resolveTs(file,id)):req(id)});
 cache.set(file,mod.exports);return mod.exports;}
const I=load(path.join(ROOT,'lib/multiplayer/invite.ts'));
let n=0;const t=(name,fn)=>{try{const r=fn();n++;return r;}catch(e){console.error('FAIL',name);throw e;}};

const host=read('components/party/PartyHost.tsx'),joinCard=read('components/party/JoinParty.tsx'),join=joinCard+'\n'+read('components/party/CodeBoxes.tsx'),invite=read('components/party/PartyInvite.tsx'),
 chip=read('components/party/PartyChip.tsx'),wheel=read('components/party/EmoteWheel.tsx'),css=read('components/party/party.module.css'),inv=read('lib/multiplayer/invite.ts');
const all=[host,join,invite,chip,wheel,inv].join('\n');

t('flag gating: PartyHost returns null when multiplayerEnabled() is false, before any hook',()=>{
 const m=/export default function PartyHost\([\s\S]*?\n\}\n/.exec(host);assert(m,'PartyHost export');
 assert(/if\s*\(!multiplayerEnabled\(\)\)\s*return null/.test(m[0]),'null when off');
 assert(!/use[A-Z]\w*\(/.test(m[0].replace(/<Host[^>]*>/,'')),'no hooks in the gate wrapper (rules of hooks)');
});
t('parent gate before create and before join',()=>{
 assert(host.indexOf('ParentGate')>=0&&host.indexOf("from '@/components/ParentGate'")<host.indexOf('createParty('),'ParentGate imported before createParty is called');
 assert(/afterGate\(\{ kind: 'create' \}\)/.test(host)&&/afterGate\(\{ kind: 'join', code: c \}\)/.test(host),'both entries go through the gate');
 const g=host.indexOf('const afterGate');assert(g>0&&g<host.indexOf('async function startCreate')&&g<host.indexOf('async function startJoin'),'gate helper first');
 assert(/parentGatePassed\(\)\)\s*run\(p\)/.test(host),'a recent pass is honoured');
 assert(!/createParty\(\)/.test(host.replace(/async function startCreate[\s\S]*?\n  \}\n/,'')),'createParty only called from startCreate');
 assert(!/connection\.join\(/.test(host.replace(/async function start(Create|Join)[\s\S]*?\n  \}\n/g,'')),'connection.join only from the gated starters');
});
t('pending link waits for the island and the intro',()=>{
 assert(/!islandReady\s*\|\|\s*!introDone/.test(host),'islandReady && introDone');
 assert(host.lastIndexOf('readPendingParty()')>host.search(/!islandReady\s*\|\|\s*!introDone/),'read after the guard');
});
t('first-name field: the only other text input, in the grown-up steps, never on the title screen',()=>{
 const nf=read('components/party/NickField.tsx');
 const inp=(nf.match(/<input[\s\S]*?\/>/g)||[]);assert.equal(inp.length,1,'one input');
 for(const a of [/maxLength=\{NICK_MAX\}/,/inputMode="text"/,/autoCapitalize="words"/,/autoComplete="off"/,/autoCorrect="off"/,/spellCheck=\{false\}/,/placeholder="Your first name"/])assert(a.test(inp[0]),String(a));
 assert(/aria-label="First name"/.test(nf)&&!/>First name</.test(nf)&&!/optional/i.test(nf)&&/Letters only\. First name only, no last names\./.test(nf),'label and hint');
 assert(/filterNickInput/.test(nf)&&/aria-label="Clear first name"/.test(nf),'live filter and clear button');
 assert(!/localStorage|sessionStorage|document\.cookie|console\.|analytics|lib\/saves/.test(nf.replace(/\/\*[\s\S]*?\*\//g,'')),'memory only, no logging');
 assert(/<NickField onChange/.test(join)&&/<NickField onChange/.test(host),'shown in the join card and the start card');
 for(const f of fs.readdirSync(path.join(ROOT,'components')).filter(x=>/^landing$/.test(x)).flatMap(d=>fs.readdirSync(path.join(ROOT,'components',d)).map(x=>'components/'+d+'/'+x)).filter(x=>/\.tsx$/.test(x)))assert(!/NickField/.test(read(f)),f+' must not show the name field');
 assert(/Reset name to \$\{m\.name\}/.test(host)&&/host\.resetName\(m\.id\)/.test(host)&&/state\.isHost && m\.nick/.test(host)&&/Name reset/.test(host),'host-only Reset name button with toast');
 assert(!/<small>\{m\.name\}<\/small>/.test(host),'no made-up name line any more');
});
t('only the code boxes take text',()=>{
 for(const f of ['PartyHost','PartyInvite','PartyChip','EmoteWheel']){const s=read(`components/party/${f}.tsx`);assert(!/<input|<textarea|contentEditable/i.test(s),f+' has no text input');}
 const inputs=join.match(/<input[\s\S]*?\/>/g)||[];assert.equal(inputs.length,1,'one input element (rendered 6 times)');
 assert(/type="text"/.test(inputs[0])&&/maxLength=\{1\}/.test(inputs[0]),'single-character boxes');
 assert(/acceptCodeChar/.test(join)&&/filterCodeText/.test(join),'alphabet filter');
 assert(/SLOTS = Array\.from\(\{ length: CODE_LENGTH/.test(join)&&/CODE_LENGTH = 6|CODE_LENGTH\b/.test(join),'six slots');
 assert(!/<input[^>]*type="(email|tel|search|url|password)"/.test(all),'no other input types');
});
t('code filter is exact (alphabet, no guessing)',()=>{
 assert.equal(I.acceptCodeChar('k'),'K');assert.equal(I.acceptCodeChar('7'),'7');
 for(const bad of ['O','0','1','I','L','U','A','E','-',' ','!','kk',''])assert.equal(I.acceptCodeChar(bad),null,'rejects '+JSON.stringify(bad));
 let r=I.filterCodeText('k7m-q4r');assert.deepEqual(JSON.parse(JSON.stringify(r)),{chars:'K7MQ4R',rejected:false});
 r=I.filterCodeText('K7O Q4R9');assert.equal(r.chars,'K7Q4R9');assert.equal(r.rejected,true);
 assert.equal(I.filterCodeText('23456789BCDFGHJKM').chars.length,6);
 assert.match(I.NOT_IN_CODES_HINT,/isn't used in codes/);assert(join.includes('NOT_IN_CODES_HINT'),'hint shown');
});
t('display and links',()=>{
 assert.equal(I.partyLink('K7MQ4R'),'https://futbolisland.app/?party=K7MQ4R');
 origin='http://localhost:3000';assert.equal(I.partyLink('K7MQ4R'),'http://localhost:3000/?party=K7MQ4R','localhost links stay on localhost (#9)');
 origin='https://futbol-island-git-x-team.vercel.app';assert(I.partyLink('K7MQ4R').startsWith(origin+'/?party='),'preview links stay on the preview');
 origin='https://evil.example';assert.equal(I.partyLink('K7MQ4R'),'https://futbolisland.app/?party=K7MQ4R','unknown origins fall back to SITE_URL');
 origin='https://futbolisland.app';
 assert.equal(I.groupCode('K7MQ4R'),'K7M-Q4R');assert.equal(I.groupCode('K7'),'K7');
 assert(invite.includes('groupCode(code)')&&/Share link|Copy link/.test(invite)&&/Share only with friends you know/.test(invite)&&/Works for/.test(invite)&&/New code/.test(invite)&&/expiresAt > 0/.test(invite)&&/partyQr/.test(invite),'invite card content');
 assert.equal(I.joinNote(['Red']),'Red joined');assert.equal(I.joinNote(['a','b']),'2 friends joined');
 assert.equal(I.expiryText(0,0),'');assert.equal(I.expiryText(112*60000,0),'1 hour 52 minutes');assert.equal(I.expiryText(30*60000,0),'30 minutes');assert.equal(I.expiryText(120*60000,0),'2 hours');assert.equal(I.expiryText(61*60000,0),'1 hour 1 minute');assert.equal(I.expiryText(60000,0),'1 minute');
});
t('readPendingParty: ?party= moves to sessionStorage and leaves the URL; invalid codes are rejected',()=>{
 assert.equal(I.readPendingParty(),'K7MQ4R');assert(/^K7MQ4R:\d+$/.test(store.get('fi-party-pending')),'stored with a time stamp');assert(!/party=/.test(href),'removed from the URL: '+href);assert(/x=1/.test(href),'other params kept');
 assert.equal(I.readPendingParty(),'K7MQ4R','survives a reload via sessionStorage');
 I.clearPendingParty();assert.equal(I.readPendingParty(),null);
 for(const bad of ['O0O0O0','K7MQ4','K7MQ4RR','<script>','..%2f','1234567'.slice(0,6)]){store.clear();href='https://futbolisland.app/?party='+encodeURIComponent(bad);assert.equal(I.readPendingParty(),null,'rejects '+bad);assert.equal(store.has('fi-party-pending'),false);}
 {const w=Date.now;store.set('fi-party-pending','K7MQ4R:'+(w()-31*60*1000));href='https://futbolisland.app/';assert.equal(I.readPendingParty(),null,'a pending code older than 30 min is dropped (#19)');assert.equal(store.has('fi-party-pending'),false);
  store.set('fi-party-pending','K7MQ4R:'+(w()-60*1000));assert.equal(I.readPendingParty(),'K7MQ4R','a fresh one stays');store.clear();
  href='https://futbolisland.app/?party=K7MQ4R&x=1';I.stripPartyParam();assert(!/party=/.test(href)&&/x=1/.test(href),'stripPartyParam removes it without storing');assert.equal(store.has('fi-party-pending'),false);}
 store.set('fi-party-pending','nope!!');href='https://futbolisland.app/';assert.equal(I.readPendingParty(),null);assert.equal(store.has('fi-party-pending'),false,'a bad stored value is dropped');
});
t('no animals: picker gone, create and join send only the first name; the name is required',()=>{
 assert(!fs.existsSync(path.join(ROOT,'components/party/AnimalPicker.tsx'))&&!fs.existsSync(path.join(ROOT,'components/party/animalPicker.module.css')),'picker files removed');
 for(const f of ['PartyHost','JoinParty','PartyChip','NickField'])assert(!/animal|Animal|Surprise/.test(read(`components/party/${f}.tsx`)),f+' has no animal');
 assert(host.split('nick: getNick()').length===3,'create and join both send the first name (memory only)');
 const inputs=(join.match(/<input/g)||[]).length;assert.equal(inputs,1,'join card has the code boxes only (the name is NickField)');
 const nf=read('components/party/NickField.tsx');
 assert(/Type your first name to play/.test(read('lib/multiplayer/nick.ts'))&&/NICK_HINT/.test(nf),'hint when the name is missing');
 assert(/disabled=\{busy \|\| !named\}/.test(host)&&host.split('busy || !named').length===3,'Start a party and Join with a code are disabled until a valid name');
 assert(/!complete \|\| busy/.test(join)&&/code\.length === CODE_LENGTH && named/.test(join),'Join is disabled until a valid name and a full code');
 assert(/if \(!getNick\(\)\)/.test(host),'create / join also guard in code');
 assert(/\[ErrorCode\.BadName\]/.test(host),'a relay BadName refusal has a message');
});
t('grown-up gate: the same card shell as Play with friends, Back top left (no bottom Go back), Esc = Back',()=>{
 const gate=fs.readFileSync(path.join(ROOT,'components/ParentGate.tsx'),'utf8'),gcss=fs.readFileSync(path.join(ROOT,'components/ParentGate.module.css'),'utf8');
 assert(/<ParentGate shell /.test(host)&&/view === 'menu' \|\| \(view === 'gate' && pending\)/.test(host),'gate renders inside the same grow Card as the menu (no size jump)');
 assert(/grid-template-columns:76px minmax\(0,1fr\) 76px/.test(gcss)&&/\.shell\{[^}]*padding:16px 24px 24px[^}]*border-radius:24px/.test(gcss)&&/\.header h2[^{]*\{[^}]*IslandBrush[^}]*font-size:clamp\(24px,3vw,38px\)/.test(gcss),'same header grid, padding, radius and title style');
 assert(/<BackButton onBack=\{onCancel\} data-parent-gate-back\/>/.test(gate)&&!/Go back/.test(gate),'Back (shared BackButton) replaces the bottom Go back');
 assert(/onEscape=\{view === 'gate'/.test(host),'Escape goes Back from the gate');
});
t('Play with friends card: wide, grows out of the HUD button, animated close, Done top right, soft scroll fade',()=>{
 assert(/\.dialogWide\{[^}]*width:min\(560px,92vw\)/.test(css),'card is min(560px,92vw) wide');
 assert(/grow from=\{[^}]*\bfrom\}/.test(host)&&/data-party-open/.test(host)&&/getBoundingClientRect/.test(host),'menu card grows from the HUD button');
 assert(/GROW_IN_MS = 300/.test(host)&&/GROW_OUT_MS = 200/.test(host)&&/clipPath/.test(host)&&!/scale\(|flipTransform|invert\(/.test(host.slice(host.indexOf('function growFrame'),host.indexOf('function Card'))),'grow: ~300 ms open, 200 ms close, clip-path reveal with a constant radius, no scale (no oval)');
 assert(/borderRadius: '999px'/.test(host)===false&&/GROW_IN_MS \* 0\.4/.test(host)&&/GROW_IN_MS \* 0\.6/.test(host),'content fades in over the last 60% of the grow; no 999px radius morph');
 assert(/reducedMotion\(\)\) \{ closeRef\.current\(\)/.test(host)&&/prefers-reduced-motion: reduce/.test(host),'reduced motion: no morph, close at once');
 assert(/e\.key === 'Escape'\) \{ e\.stopPropagation\(\); if \(escRef\.current\) escRef\.current\(\); else requestClose\(\)/.test(host)&&/role="dialog" aria-modal="true"/.test(host),'Escape / backdrop use the animated close; dialog aria kept');
 assert(/<DoneButton onDone=\{requestClose\} \/>/.test(host)&&!/>Close<\/button>/.test(host.slice(host.indexOf('data-party-menu'),host.indexOf("view === 'join' && ("))),'Done (shared DoneButton) replaces the bottom Close');
 assert(/\.menuHeader h2\{[^}]*IslandBrush[^}]*font-weight:400;font-size:clamp\(24px,3vw,38px\)/.test(css)&&/grid-template-columns:76px minmax\(0,1fr\) 76px/.test(css),'title matches the other sheet titles');
 assert(/\.nickInput\{[^}]*width:100%;box-sizing:border-box/.test(css),'name field as wide as the buttons');
 assert(/\.fadeScroll\{[^}]*mask-image/.test(css)&&/dataset\.top/.test(read('components/party/FadeScroll.tsx'))&&/dataset\.bottom/.test(read('components/party/FadeScroll.tsx')),'scroll area fades only where content continues');
});
t('shared modal header: Play with friends, grown-ups gate, Join, Invite and the party sheet use one header geometry',()=>{
 const gcss=read('components/ParentGate.module.css'),rule=(c,re)=>{const m=re.exec(c);assert(m,'rule '+re);return m[1];};
 const mh=rule(css,/\.menuHeader\{([^}]*)\}/),gh=rule(gcss,/\.header\{([^}]*)\}/);
 for(const d of ['display:grid','grid-template-columns:76px minmax(0,1fr) 76px','align-items:center','gap:8px','min-height:44px']){assert(mh.includes(d)&&gh.includes(d),'both headers share '+d);}
 const mt=rule(css,/\.menuHeader h2\{([^}]*)\}/),gt=rule(gcss,/\.header h2,\.header h3\{([^}]*)\}/);assert.equal(mt,gt.replace('var(--btn-font,sans-serif)','var(--btn-font)'),'identical title rules');
 const pad=rule(gcss,/\.shell\{[^}]*(padding:[^;}]*)/);assert(css.includes('.card.menuCard{gap:16px;'+pad+'}'),'same card padding (menuCard must out-rank .card, which is declared later)');
 assert(/@media\(max-width:600px\)\{\.card\.menuCard\{gap:14px;padding:12px var\(--phone-gutter,18px\) 18px\}/.test(css)&&/@media\(max-width:600px\)\{\.shell\{gap:14px;padding:12px var\(--phone-gutter,18px\) 18px\}/.test(gcss),'same phone padding');
 for(const [f,id] of [['PartyHost','party-menu-title'],['PartyInvite','party-invite-title'],['JoinParty','party-join-title'],['PartyHost','party-sheet-title']]){const src=read('components/party/'+f+'.tsx');assert(new RegExp('<header className=\\{styles\\.menuHeader\\}>[\\s\\S]{0,260}<h2 id="'+id+'"').test(src),id+' uses the shared header + h2');}
 assert(!/<h3 id="party-/.test(all),'no party title still uses the old h3');
 assert(/<DoneButton onDone=\{onClose\} \/>/.test(read('components/party/PartyInvite.tsx'))&&!/>Done<\/button>/.test(read('components/party/PartyInvite.tsx')),'Invite: Done top right (shared DoneButton)');
 assert(/Card label="Invite friends"[^>]*grow/.test(host)&&/Card label="Join with a code"[^>]*grow/.test(host),'Invite and Join use the wide grow card');
});
t('party sheet rows: coloured dot + name, aria-labels carry the colour',()=>{
 assert(host.split('m.colourHex').length>=2&&/me\.colourHex/.test(host),'dot for me and friends');
 assert(/colourName\(m\.colourIdx\)/.test(host)&&/colourName\(me\.colourIdx\)/.test(host),'aria-label includes the colour');
 assert(/You \(\{displayName\(me\)\}\)/.test(host),"local row says 'You'");
 assert(/styles\.badge[^<]*Host/.test(host),'host badge stays');
});
t('relay calls: offline / not found behave, nothing thrown',async()=>{});
(async()=>{
 const r=await I.createParty();assert.deepEqual(JSON.parse(JSON.stringify(r)),{error:'offline'});assert.equal(calls[0][0],'http://localhost:8790/party');assert.equal(calls[0][1],'POST');
 assert.equal(await I.checkParty('K7M-Q4R'),null);assert.equal(calls[1][0],'http://localhost:8790/party/K7MQ4R');
 assert.equal(await I.checkParty('bad'),null);assert.equal(calls.length,2,'an invalid code never reaches the network');
 n++;
 // ---- static checks ----
 t('tap targets >= 44px',()=>{
  const rules=css.split('}').map(r=>r.trim()).filter(Boolean);
  const px=(sel)=>{const r=rules.filter(x=>new RegExp('(^|,|\\s)\\.'+sel+'(\\b|[,:{\\[])').test(x.split('{')[0]));assert(r.length,sel);return r.join(';');};
  for(const c of ['chip','round','mini'])assert(/width:(4[4-9]|[5-9]\d)px/.test(px(c))&&/height:(4[4-9]|[5-9]\d)px/.test(px(c)),c+' is >= 44px');
  assert(/min-height:var\(--btn-height,44px\)/.test(px('primary')),'buttons use the 44px token');
  assert(/width:(4[4-9]|[5-9]\d)px/.test(px('box')),'code box');
  assert(/prefers-reduced-motion:reduce/.test(css),'reduced motion');
  assert(/position:fixed/.test(px('corner')),'chip in a fixed corner');
  assert(!/#[0-9a-f]{6}\b/i.test(css.replace(/#(fff1d3b0|193f3766)/gi,'')),'island tokens, no raw hex');
 });
 t('icon-only chip with aria-labels',()=>{
  assert(/aria-label=\{label\}/.test(chip)&&/aria-expanded/.test(chip),'chip label');assert(!/>\s*[A-Za-z]{3,}\s*</.test(chip.replace(/<svg[\s\S]*?<\/svg>/g,'')),'no visible words on the chip');
  assert(/aria-label=\{x\.label\}/.test(wheel)&&(read('lib/town/emoteReact.ts').split('/** What the wheel shows')[0].split('export const LOCAL_EMOTES')[1].match(/emote: EMOTE\./g)||[]).length===10,'ten labelled emotes (Wave, High five, Cheer, Well played, ...)');
  assert(/Hide \$\{m\.name\}|Hide/.test(host)&&/Mute|Unmute/.test(host)&&/Remove \$\{displayName\(m\)\}/.test(host),'hide / mute / remove per friend');
  for(const w of ['Lock party','New code','End party for everyone','Leave party','Invite'])assert(host.includes(w),w);
 });
 t('messages go through toastLane at note priority; no analytics / saves',()=>{
  assert(/toastLane\.request\('party'\)/.test(host)&&/useToastLaneBusy\('party'\)/.test(host)&&/toastLane\.release\('party'\)/.test(host),'lane used');
  const lane=read('lib/ui/toastLane.ts');assert(!/\bparty\s*:/.test(lane.split('TOAST_PRIORITY')[1].split(';')[0]),'party is a plain note (unlisted = priority 1)');
  assert(!/alert\(|window\.confirm|\bnew Notification/.test(all),'no other message surface');
  assert(!/lib\/saves|lib\/analytics|localStorage/.test(all.replace(/\/\/[^\n]*/g,'')),'privacy: no saves / analytics / persistent storage');
  assert(/sessionStorage/.test(inv)&&!/localStorage/.test(inv),'pending code in sessionStorage only');
 });
 t('qrcode is imported dynamically only',()=>{
  assert(!/^import[^\n]*['"]qrcode['"]/m.test(all)&&!/require\(['"]qrcode['"]\)/.test(all),'no static import');
  assert(/await import\('qrcode'\)/.test(inv),'dynamic import');assert.equal((all.match(/qrcode'/g)||[]).length,1);
 });
 t('mounted in Town only behind the flag (Task E / coordinator, Oct 22 2026)',()=>{
  const town=read('components/Town.tsx');
  assert(/import PartyHost from '@\/components\/party\/PartyHost'/.test(town),'imported');
  assert(/\{multiplayerEnabled\(\)&&<PartyHost /.test(town),'mounted behind multiplayerEnabled()');
 });
 {const sett=read('components/IslandSettings.tsx'),pa=read('lib/multiplayerAllowed.ts');
 t('Play with friends button + gated Settings switch (#8)',()=>{
  assert(/\{friendsOn&&<button[^>]*aria-label="Play with friends"[^>]*onClick=\{openPartyMenu\}/.test(sett),'icon-only circle button calling openPartyMenu');
  assert(/friendsOn=multiplayerEnabled\(\)&&friendsAllowed/.test(sett),'behind the flag and the switch');
  assert(/Play with friends: \{friendsAllowed\?'Allowed':'Off'\}/.test(sett)&&/parentGatePassed\(\)\)setMultiplayerAllowed/.test(sett)&&/<ParentGate/.test(sett),'gated toggle');
  assert(/fi2-multiplayer-allowed-v1/.test(pa)&&/function Allowed/.test(host)&&/if \(!allowed\) return null/.test(host),'PartyHost returns null when Off');
 });}
 t('kick prompt, optimistic lock, Kicked note (#5 #6 #16)',()=>{
  assert(/setKickPrompt\(true\)/.test(host)&&/data-party-kick-prompt/.test(host)&&/New code/.test(host.slice(host.indexOf('data-party-kick-prompt')))&&/Lock party/.test(host.slice(host.indexOf('data-party-kick-prompt'))),'post-kick New code / Lock prompt');
  assert(/connection\.host\.lock\(!state\.locked\); partyStore\.setLocked\(!state\.locked\)/.test(host),'host lock updates the store at once');
  assert(/state\.error !== ErrorCode\.Kicked \|\| !everLive\.current/.test(host)&&/text\('You left the party'\)/.test(host),'Kicked raises the left note');
 });
 t('title screen Join friends (flag-gated, same sheet as Use a different code, reuses CodeBoxes, pending store, no analytics)',()=>{
  const ta=read('components/landing/TitleActions.tsx'),jf=read('components/landing/JoinFriends.tsx'),js=read('components/landing/JoinFriendsSheet.tsx'),cb=read('components/party/CodeBoxes.tsx'),jc=read('components/landing/JoinFriends.module.css');
  assert(/multiplayerEnabled\(\)&&\(state==='new'\|\|state==='returning'\)&&<JoinFriends/.test(ta),'TitleActions mounts it only behind the flag, on the new / returning cards');
  assert(/multiplayerEnabled\(\)&&multiplayerAllowed\(\)/.test(jf)&&/if\(!on\)return null/.test(jf),'hidden while the grown-up switch is Off');
  assert(/mode:'create'\|'restore'\|'join'/.test(ta)&&/setSheet\(\{mode:'join'/.test(ta)&&/<JoinFriendsSheet/.test(ta)&&/'Join friends'/.test(ta),'opens in the title screen\'s own sheet (same morph as Use a different code)');
  assert(/import CodeBoxes from '..\/party\/CodeBoxes'/.test(js)&&/<CodeBoxes/.test(js)&&/<CodeBoxes/.test(joinCard)&&!/data-code-box/.test(joinCard),'one shared code-box component for JoinParty and the title sheet');
  assert(/data-code-box/.test(cb)&&/filterCodeText/.test(cb)&&/acceptCodeChar/.test(cb),'CodeBoxes holds the alphabet filter');
  assert(/<BackButton/.test(js)&&!/Cancel/.test(js)&&/>Join</.test(js)&&/NOT_IN_CODES_HINT/.test(js)&&/SaveCode\.module\.css/.test(js)&&/styles\.footer/.test(js),'Back (not Cancel) bottom left, Join bottom right, the save sheet\'s styles and fonts');
  assert(/Party code waiting: /.test(jf)&&/clearPendingParty\(\)/.test(jf)&&/groupCode\(pending\)/.test(jf),'pending line with clear');
  assert(!/<input/.test(jf+js)&&!/<textarea/.test(jf+js),'no free text besides the code boxes');
  assert(!/from '[^']*(analytics|deviceMarks)/.test(jf+js+cb)&&!/from '[^']*lib\/saves/.test(jf+js+cb)&&!/console\./.test(jf+js+cb)&&!/data-track/.test(jf+js),'the code is never logged or tracked');
  assert(!/connection\.|createParty|checkParty|fetch\(/.test(jf+js),'does not connect from the title screen');
  assert(/min-height:4[48]px/.test(jc),'>= 44 px targets');
  assert(!/transition|animation/.test(jc)||/prefers-reduced-motion:reduce\)\{\.join\{transition:none\}/.test(jc),'the Use-a-different-code style motion has a reduced-motion override');
  assert(!/(^|\n)import .*party/.test(read('components/landing/saveCodeAdapter.tsx')),'save adapter untouched');
  // setPendingParty
  store.clear();
  assert.equal(I.setPendingParty('k7m-q4r'),'K7MQ4R','normalised');
  assert(/^K7MQ4R:\d+$/.test(store.get(I.PENDING_KEY)),'stored with a stamp');
  assert.equal(I.readPendingParty(),'K7MQ4R','read back');
  store.clear();
  for(const bad of ['','K7MQ4','K7MQ4RR','K7MQ0R','K7M Q4!','OOOOOO'])assert.equal(I.setPendingParty(bad),null,'rejects '+bad),assert.equal(store.size,0,'nothing stored for '+bad);
  I.clearPendingParty();assert.equal(store.size,0);
 });
 console.log(`mp-ui: ${n} checks passed`);
})().catch(e=>{console.error(e);process.exit(1);});

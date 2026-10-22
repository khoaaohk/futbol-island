// Island Emote button + 2x2 action grid (user, Oct 22 2026). Pure range / cooldown / busy checks, plus source checks that the button
// is always rendered inside the island's action cluster (not under the party chip), needs no flag, and the CSS grid order holds.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const mod={exports:{}};
vm.runInNewContext(ts.transpileModule(read('lib/town/emoteReact.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
 {exports:mod.exports,module:mod,Math,require:()=>({celebrationJump:p=>p>=0&&p<=.36?{progress:p/.36,height:.3}:undefined})});
const E=mod.exports;let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const npc=(id,x,o={})=>({id,x,y:0,z:0,busy:false,cooldownUntil:0,...o}),me={x:0,y:0,z:0};

t('nearest townsperson within 5 m is picked',()=>{
 assert.equal(E.pickEmoteNpc([npc('far',4.9),npc('near',2),npc('out',6)],me,10),'near');
 assert.equal(E.pickEmoteNpc([npc('out',5.1)],me,10),null,'beyond 5 m: nobody answers');
 assert.equal(E.pickEmoteNpc([],me,10),null);
});
t('height counts (a rooftop or a flyer is not "near")',()=>{assert.equal(E.pickEmoteNpc([npc('up',1,{y:6})],me,0),null);});
t('busy townsfolk are skipped, the next nearest answers',()=>{
 assert.equal(E.pickEmoteNpc([npc('busy',1,{busy:true}),npc('free',3)],me,0),'free');
 assert.equal(E.pickEmoteNpc([npc('busy',1,{busy:true})],me,0),null);
});
t('2 s cooldown per townsperson',()=>{
 assert.equal(E.NPC_COOLDOWN_SECONDS,2);
 assert.equal(E.pickEmoteNpc([npc('a',1,{cooldownUntil:12})],me,11),null,'cooling');
 assert.equal(E.pickEmoteNpc([npc('a',1,{cooldownUntil:12}),npc('b',3)],me,11),'b','the other one answers');
 assert.equal(E.pickEmoteNpc([npc('a',1,{cooldownUntil:12})],me,12),'a','ready again');
});
t('busy rules: riding, driving, sleeping, hidden, stunned, freestyle',()=>{
 const base={visible:true,stunned:false,freestyle:false};
 assert.equal(E.npcBusy(base),false);assert.equal(E.npcBusy({...base,travel:'run'}),false,'a runner can still wave back');
 for(const bad of [{travel:'scooter'},{travel:'skateboard'},{pose:'lie'},{visible:false},{stunned:true},{freestyle:true}])assert.equal(E.npcBusy({...base,...bad}),true,JSON.stringify(bad));
});
t('ten presets, protocol numbers, timing',()=>{
 assert.equal(JSON.stringify(E.LOCAL_EMOTES.map(x=>x.label)),JSON.stringify(['Wave','High five','Cheer','Well played','Thumbs up','Laugh','Dance','Thanks','Pass to me','Space']));
 assert.equal(JSON.stringify(E.LOCAL_EMOTES.map(x=>x.emote)),JSON.stringify([0,2,1,5,6,7,8,9,3,4]));
 assert.equal(E.EMOTE_SECONDS,1.5);assert.equal(E.NPC_EMOTE_SECONDS,2);assert.equal(E.NPC_EMOTE_RANGE,5);
 assert(E.emoteCalled(E.EMOTE.Wave,.1,1.5)>0&&E.emoteCalled(E.EMOTE.Wave,0,1.5)===0&&E.emoteCalled(E.EMOTE.Cheer,.5,1.5)===0);
 assert(E.emoteCelebration(E.EMOTE.Cheer,.75,1.5)===.5&&E.emoteCelebration(E.EMOTE.Wave,.5,1.5)===-1);
});
t('the bus works with no party and no flag (a handler is all it needs)',()=>{
 assert.equal(E.emoteBus.fire(0),false,'no handler yet');let got=null;E.emoteBus.set(e=>{got=e;});assert.equal(E.emoteBus.fire(2),true);assert.equal(got,2);E.emoteBus.set(null);
});

const town=read('components/Town.tsx'),ctl=read('components/EmoteControl.tsx'),host=read('components/party/PartyHost.tsx'),css=read('app/globals.css'),npcs=read('lib/graphics/islandNpcs.ts');
t('Emote button is rendered inside the action cluster, after the action buttons, and not under the party chip',()=>{
 const i=town.indexOf('<div className="travel-actions"'),j=town.indexOf('<div className="touch-controls">');assert(i>0&&j>i);
 assert(/data-emote-grid/.test(town.slice(i,i+200)),'grid marker on the cluster');
 assert(town.slice(i,j).includes('<EmoteControl/>'),'EmoteControl is inside .travel-actions');
 assert(!/data-party-emotes|EmoteWheel|sendEmote/.test(host),'PartyHost no longer renders an Emotes button');
});
t('always present: not behind multiplayerEnabled() or a live party; sending is gated on a live party',()=>{
 assert(!/multiplayerEnabled|partyStore|usePartyState/.test(ctl),'the button needs no flag');
 assert(/emoteBus\.set\(pick=>\{[\s\S]*?multiplayerEnabled\(\)\)\{const conn=partyConnection\(\);if\(conn\.status==='live'\)conn\.sendEmote\(pick\)/.test(town),'friends get it only while live');
 assert(/emoteBubbles\.show\(0,pick,emoteFx\.dur\)/.test(town)&&/emoteFx\.kind=pick/.test(town),'your own pose + bubble are immediate');
 assert(/islandNpcs\.react\(id,pick,reduced,emoteFx\.v\)/.test(town),'the nearest free townsperson reacts');
});
t('icon-only, labelled, >= 44 px, upward wheel',()=>{
 assert(/aria-label="Emotes"/.test(ctl)&&/aria-expanded=\{open\}/.test(ctl));
 assert(/\.emote-wheel-btn\{[^}]*width:52px;height:52px;min-width:44px;min-height:44px/.test(css));
 assert(/\.emote-wheel\{[^}]*bottom:calc\(100% \+ 12px/.test(css),'opens upward from the grid');
 assert(/prefers-reduced-motion:reduce\)\{\.emote-wheel\{animation:none\}/.test(css));
});
t('grid CSS: desktop 2x2 (Fly, Parachute / Emote, kick); phones 3x2: Parachute + map toggle over Fly + Sprint, Emote left of Fly',()=>{
 assert(/\[data-emote-grid\] \.travel-mode\{grid-column:1;grid-row:1/.test(css)&&/\[data-emote-grid\] \.touch-emote\{grid-column:1;grid-row:2\}/.test(css));
 assert(/\[data-emote-grid\] \.touch-actions \.touch-juggle\{grid-column:2;grid-row:1/.test(css)&&/\[data-emote-grid\] \.touch-actions \.touch-shoot\{grid-column:2;grid-row:2/.test(css));
 assert(/\[data-emote-grid\]\{display:grid;grid-template-columns:var\(--action-size\) var\(--action-size\);[^}]*gap:12px/.test(css));
 const ph=css.slice(css.indexOf('3 columns x 2 rows'),css.indexOf('@media(min-width:601px) and (pointer:fine){\n .town-app .travel-actions[data-emote-grid]'));
 assert(/grid-template-columns:repeat\(3,var\(--action-size\)\)/.test(ph));
 assert(/\.travel-mode\{grid-column:2;grid-row:2\}/.test(ph)&&/\.minimap-toggle\{position:static;grid-column:3;grid-row:1/.test(ph),'phone: Parachute over Fly, map toggle where Emote was');
 assert(/\.touch-emote\{grid-column:1;grid-row:2\}/.test(ph)&&/\.touch-juggle\{grid-column:2;grid-row:1\}/.test(ph)&&/\.touch-shoot\{grid-column:3;grid-row:2\}/.test(ph),'phone: Emote | Fly | Sprint, Parachute above Fly');
 assert(/\.town-minimap:not\(\.is-collapsed\)\{bottom:calc\(var\(--control-bottom\) \+ 142px\)/.test(ph),'the open map sits 14 px above the grid');
 assert(/\.town-minimap\.is-minimized\{scale:\.4/.test(ph)&&/\.emote-wheel\)[^{]*\.town-minimap\{opacity:0/.test(ph),'it folds into the toggle; hidden while the wheel is open');
 assert(/mapFoldNow/.test(town)&&/setMinimapCollapsed\(true\)/.test(town),'the phone map folds away under a dialog or job card');
 assert(/min-width:601px\) and \(pointer:fine\)\{[\s\S]*?\.minimap-toggle\{position:fixed/.test(css.slice(css.indexOf('[data-emote-grid] .touch-emote'))),'desktop: map stays at the lower left');
 assert(/data-job-camera\] :is\(\.touch-emote,\.emote-wheel\)\{visibility:hidden/.test(css),'hidden with the job camera like the other action buttons');
});
t('townsfolk answer: pooled bubble, no per-frame allocation while idle, reduced motion = bubble only',()=>{
 assert(/const react=\(id:string,emote:number,reduced:boolean,variation=-1\)/.test(npcs)&&/if\(fx\.kind<0\|\|reduced\|\|fx\.v>=0\)return null/.test(npcs));
 assert(/emoteBubbles\.update\(active\?dt:0,reduced\)/.test(town)&&(read('lib/graphics/emoteBubbles.ts').match(/new T\.Sprite\(/g)||[]).length===1,'one sprite factory, two pooled sprites');
});
console.log(`emote-grid: ${n} checks passed`);

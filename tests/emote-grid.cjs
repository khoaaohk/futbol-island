// Island Emote button + 2x2 action grid (user, Oct 22 2026). Pure range / cooldown / busy checks, plus source checks that the button
// is always rendered inside the island's action cluster (not under the party chip), needs no flag, and the CSS grid order holds.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const ld=f=>{const m={exports:{}};vm.runInNewContext(ts.transpileModule(read(f),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:m.exports,module:m,Math,Object,require:id=>ld(path.relative(ROOT,path.resolve(path.dirname(path.join(ROOT,f)),id)+'.ts'))});return m.exports;};
const mod={exports:{}};
vm.runInNewContext(ts.transpileModule(read('lib/town/emoteReact.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
 {exports:mod.exports,module:mod,Math,Object,require:id=>{if(id==='./rideEmotes'){const m2={exports:{}};vm.runInNewContext(ts.transpileModule(read('lib/town/rideEmotes.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:m2.exports,module:m2,Math});return m2.exports;}if(id==='./emoteContexts')return ld('lib/town/emoteContexts.ts');if(id==='./emotePass')return ld('lib/town/emotePass.ts');return {celebrationJump:p=>p>=0&&p<=.36?{progress:p/.36,height:.3}:undefined};}});
const E=mod.exports;let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const npc=(id,x,o={})=>({id,x,y:0,z:0,busy:false,cooldownUntil:0,...o}),me={x:0,y:0,z:0};

t('nearest townsperson within 9 m is picked (user Oct 22 2026: "the emotes are not interacting with the npcs": 5 m was too tight)',()=>{
 assert.equal(E.NPC_EMOTE_RANGE,9);
 assert.equal(E.pickEmoteNpc([npc('far',8.9),npc('near',2),npc('out',9.5)],me,10),'near');
 assert.equal(E.pickEmoteNpc([npc('six',6)],me,10),'six','6 m answers now');
 assert.equal(E.pickEmoteNpc([npc('out',9.1)],me,10),null,'beyond 9 m: nobody answers');
 assert.equal(E.pickEmoteNpc([],me,10),null);
});
t('in front wins: a townsperson ahead of you beats a slightly nearer one behind (bonus up to 2 m), but never beyond the range',()=>{
 const ahead=npc('ahead',4),behind=npc('behind',3,{x:-3});
 assert.equal(E.pickEmoteNpc([behind,ahead],me,10,undefined,{x:1,z:0}),'ahead');
 assert.equal(E.pickEmoteNpc([behind,ahead],me,10),'behind','no facing: plain nearest');
 assert.equal(E.pickEmoteNpc([npc('wayAhead',12)],me,10,undefined,{x:1,z:0}),null);
 assert.equal(E.pickEmoteNpc([npc('ahead7',7),npc('behind1',1,{x:-1})],me,10,undefined,{x:1,z:0}),'behind1','a close one behind still beats a far one ahead');
});
t('a merely walking townsperson is picked: only busy ones are skipped (the walk state is not a candidate field)',()=>{
 const base={visible:true,stunned:false,freestyle:false};
 assert.equal(E.npcBusy({...base,travel:undefined,pose:undefined}),false);
 assert.equal(E.pickEmoteNpc([npc('walker',5,{busy:E.npcBusy({...base})})],me,10),'walker');
 for(const bad of [{pose:'lie'},{stunned:true},{freestyle:true},{travel:'scooter'},{visible:false}])assert.equal(E.pickEmoteNpc([npc('x',3,{busy:E.npcBusy({...base,...bad})})],me,10),null,JSON.stringify(bad)+' ignores emotes');
});
t('a townsperson beyond ~3 m steps toward you: at most 2.5 m, never closer than 2.2 m, none when already close',()=>{
 assert.equal(E.npcStepDistance(2.9),0);assert.equal(E.npcStepDistance(3),0);
 assert(Math.abs(E.npcStepDistance(4)-1.8)<1e-9,'4 m: walks 1.8 m to 2.2 m');
 assert.equal(E.npcStepDistance(9),2.5,'capped');assert(Math.abs(E.npcStepDistance(5)-2.5)<1e-9);
 for(let d=0;d<=9;d+=.25){const s=E.npcStepDistance(d);assert(s>=0&&s<=2.5);if(s>0)assert(d-s>=2.2-1e-9);}
});
t('height counts (a rooftop or a flyer is not "near")',()=>{assert.equal(E.pickEmoteNpc([npc('up',1,{y:12})],me,0),null);});
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
 assert.equal(JSON.stringify(E.LOCAL_EMOTES.map(x=>x.label)),JSON.stringify(['Wave','High five','Cheer','Pass it','Juggle with me','Well played','Laugh','Dance','Thanks','Show off']));
 assert.equal(JSON.stringify(E.LOCAL_EMOTES.map(x=>x.emote)),JSON.stringify([0,2,1,6,3,5,7,8,9,4]));
 assert.equal(E.EMOTE_SECONDS,4);assert.equal(E.NPC_EMOTE_SECONDS,4);assert.equal(E.emoteSeconds(E.EMOTE.PassBall),E.PASS_SECONDS);assert(E.PASS_SECONDS>=6.5&&E.PASS_SECONDS<=8);assert.equal(E.emoteSeconds(E.EMOTE.Dance),4);assert.equal(E.NPC_EMOTE_RANGE,9);
 assert(E.emoteCalled(E.EMOTE.Wave,.1,4)>0&&E.emoteCalled(E.EMOTE.Wave,0,4)===0&&E.emoteCalled(E.EMOTE.Cheer,.5,4)===0&&E.emoteCalled(E.EMOTE.PassBall,.5,4)===0);
 assert(Math.abs(E.emoteCelebration(E.EMOTE.Cheer,1,4)-.5)<1e-9&&E.emoteCelebration(E.EMOTE.Wave,.5,4)===-1);assert(Math.abs(E.emoteCelebration(E.EMOTE.Cheer,3,4)-.5)<1e-9,'two cheers back to back fill 4 s');assert.equal(E.emoteCelebration(E.EMOTE.Dance,1,4),-1,'Dance has its own moves');
 assert.equal(E.emoteCelebration(E.EMOTE.WellPlayed,.75,4),-1,'Well played is a clap, not the cheer');
 assert(E.emoteClap(E.EMOTE.WellPlayed,2,4)===1&&E.emoteClap(E.EMOTE.WellPlayed,0,4)===0&&E.emoteClap(E.EMOTE.Cheer,2,4)===0,'the clap exists only for Well played, ramped in / out');
});
t('the bus works with no party and no flag (a handler is all it needs)',()=>{
 assert.equal(E.emoteBus.fire(0),false,'no handler yet');let got=null;E.emoteBus.set(e=>{got=e;});assert.equal(E.emoteBus.fire(2),true);assert.equal(got,2);E.emoteBus.set(null);
});

const town=read('components/Town.tsx'),ctl=read('components/EmoteControl.tsx'),host=read('components/party/PartyHost.tsx'),css=read('app/globals.css'),npcs=read('lib/graphics/islandNpcs.ts');
t('Emote button is rendered inside the action cluster, after the action buttons, and not under the party chip',()=>{
 const i=town.indexOf('<div className="travel-actions"'),j=town.indexOf('<div className="touch-controls">');assert(i>0&&j>i);
 assert(/data-emote-grid/.test(town.slice(i,i+200)),'grid marker on the cluster');
 assert(town.slice(i,j).includes('<EmoteControl ride={rideMode}/>'),'EmoteControl is inside .travel-actions');
 assert(!/data-party-emotes|EmoteWheel|sendEmote/.test(host),'PartyHost no longer renders an Emotes button');
});
t('always present: not behind multiplayerEnabled() or a live party; sending is gated on a live party',()=>{
 assert(!/multiplayerEnabled|partyStore|usePartyState/.test(ctl),'the button needs no flag');
 assert(/emoteBus\.set\(pickIn=>\{[\s\S]*?multiplayerEnabled\(\)\)\{const conn=partyConnection\(\);if\(conn\.status==='live'\)conn\.sendEmote\(pick as/.test(town),'friends get it only while live');
 assert(/emoteBubbles\.show\(0,cs\?cs\.emote:rs\?rs\.emote:pick,emoteFx\.dur\)/.test(town)&&/emoteFx\.kind=rs\?rs\.emote:pick;/.test(town),'your own pose + bubble are immediate');
 assert(/const npcPick=rs\?rs\.npc:pick;\/\*[^*]*\*\/emoteNpc=islandNpcs\.react\(id,npcPick,reduced,emoteFx\.v,rs\?rideStop:Math\.hypot/.test(town)&&/pickEmoteNpc\(emoteCands,\{x:me\.x,y:me\.y,z:me\.z\},now,undefined,emoteFacing\)/.test(town),'the best free townsperson (nearest, in front) reacts');
 assert(/emoteBubbles\.show\(1,pick,/.test(town),'a bubble over the townsperson');
});
t('icon-only, labelled, >= 44 px, upward wheel',()=>{
 assert(/aria-label="Emotes"/.test(ctl)&&/aria-expanded=\{open\}/.test(ctl));
 assert(/\.emote-wheel-btn\{[^}]*width:52px;height:52px;min-width:44px;min-height:44px/.test(css));
 assert(/\.emote-wheel\{[^}]*bottom:calc\(100% \+ 12px/.test(css),'opens upward from the grid');
 assert(/prefers-reduced-motion:reduce\)\{\.emote-wheel\{animation:none\}/.test(css));
});
t('grid CSS: desktop 2x2 (Fly, Parachute / Emote, kick; Emote bottom-left); phones 3x2: Parachute + map toggle over Fly + Sprint, Emote left of Fly',()=>{
 assert(/\[data-emote-grid\] \.travel-mode\{grid-column:1;grid-row:1/.test(css)&&/\[data-emote-grid\] \.touch-emote\{grid-column:1;grid-row:2\}/.test(css));
 assert(/\[data-emote-grid\] \.touch-actions \.touch-juggle\{grid-column:2;grid-row:1/.test(css)&&/\[data-emote-grid\] \.touch-actions \.touch-shoot\{grid-column:2;grid-row:2/.test(css));
 assert(/\[data-emote-grid\]\{display:grid;grid-template-columns:var\(--action-size\) var\(--action-size\);[^}]*gap:12px/.test(css));
 const ph=css.slice(css.indexOf('3 columns x 2 rows'),css.indexOf('@media(min-width:601px) and (pointer:fine){\n .town-app .travel-actions[data-emote-grid]'));
 assert(/grid-template-columns:repeat\(3,var\(--action-size\)\)/.test(ph));
 assert(/\.travel-mode\{grid-column:2;grid-row:1\}/.test(ph)&&/\.minimap-toggle\{position:static;grid-column:3;grid-row:1/.test(ph),'phone: Parachute over Fly, map toggle where Emote was');
 assert(/\.touch-emote\{grid-column:1;grid-row:2\}/.test(ph)&&/\.touch-juggle\{grid-column:2;grid-row:2\}/.test(ph)&&/\.touch-shoot\{grid-column:3;grid-row:2\}/.test(ph),'phone: Emote | Fly | Sprint, Parachute above Fly');
 assert(/\.town-minimap:not\(\.is-collapsed\)\{bottom:calc\(var\(--control-bottom\) \+ 142px\)/.test(ph),'the open map sits 14 px above the grid');
 assert(/\.town-minimap\.is-minimized\{scale:\.4/.test(ph)&&/\.emote-wheel\)[^{]*\.town-minimap\{opacity:0/.test(ph),'it folds into the toggle; hidden while the wheel is open');
 assert(/mapFoldNow/.test(town)&&/setMinimapCollapsed\(true\)/.test(town),'the phone map folds away under a dialog or job card');
 assert(/min-width:601px\) and \(pointer:fine\)\{[\s\S]*?\.minimap-toggle\{position:fixed/.test(css.slice(css.indexOf('[data-emote-grid] .touch-emote'))),'desktop: map stays at the lower left');
 assert(/data-job-camera\] :is\(\.touch-emote,\.emote-wheel\)\{visibility:hidden/.test(css),'hidden with the job camera like the other action buttons');
});
t('townsfolk answer: pooled bubble, no per-frame allocation while idle, reduced motion = bubble only',()=>{
 assert(/const react=\(id:string,emote:number,reduced:boolean,variation=-1,player\?:Position,spacing\?:\{min:number;max:number\}\)/.test(npcs)&&/if\(fx\.kind<0\|\|reduced\|\|fx\.v>=0\)return null/.test(npcs));
 assert(/emoteBubbles\.update\(active\?dt:0,reduced\)/.test(town)&&(read('lib/graphics/emoteBubbles.ts').match(/new T\.Sprite\(/g)||[]).length===2,'one pooled-copy sprite factory + the one text sprite');
});
t('townsfolk hold still, face you and step in; the name tag hides; riding emotes use one arm and keep the vehicle',()=>{
 assert(/entry\.near=entry\.distance<7\|\|entry\.fx\.kind>=0/.test(npcs),'an answering townsperson is "near": the routine stops it and it faces you');
 assert(/npcStepDistance\(d\)/.test(npcs)&&/canTravel\(entry\.position,to\)/.test(npcs)&&/NPC_STEP_SPEED/.test(npcs),'the step needs a clear path');
 assert(/applyEmoteArms\(entry\.rig\.root/.test(npcs)&&/applyApplause/.test(read('lib/graphics/emotePose.ts')),'Well played: townsfolk clap (and every other move through applyEmoteArms)');
 assert(/\|\|emoteCam\.active\);fieldBump/.test(town),'no name tag over the close-up');
 assert(/highFivePlan\(pick,reduced\|\|onRideNow,/.test(town),'on a ride: an air five, no spin / hop / crouch variation');
 assert(/applyRideEmote\(player\.root,k,/.test(town)&&/emoteCam\.begin\([^;]*onRideNow[,)]/.test(town)&&/emoteCam\.track\(/.test(town));
 const cel=read('lib/graphics/celebrations.ts'),ride=cel.slice(cel.indexOf('export function applyRideEmote'));
 assert(!/j\.ls|j\.le/.test(ride),'the ride emote never touches the left arm (it stays on the bar)');
 assert(/\.react\(id,pick|ecs\.onRide=/.test(town)&&/ecs\.riding=\(rideRef\.current==='jetpack'&&ecs\.ctx!=='fly'\)\|\|streetTraffic\.rider\.index>=0\|\|zipline\.active/.test(town),'the jetpack, truck and zipline stay blocked');
});
console.log(`emote-grid: ${n} checks passed`);

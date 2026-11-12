// Public island UI (Agent C, Nov 11 2026; docs/multiplayer-public-island-plan-2026-11-11.md, docs/multiplayer/CLIENT-HANDOFF.md).
// Flag off: the people button, PartyHost's menu and the Settings toggle are today's code (pinned branches). Flag on: three choices from
// publicCopy, no party things in a world, a report sheet with no typing, a three-way lock behind the grown-up check, the first-time
// card and the button hint through the one-message lane (once each), Town passes the three signals and routes events to the counters.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
function loadTs(f){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(read(f),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Number,Object,String,Array});return mod.exports;}
const host=read('components/party/PartyHost.tsx'),sett=read('components/IslandSettings.tsx'),choice=read('components/party/PresenceChoice.tsx'),
 report=read('components/party/ReportSheet.tsx'),first=read('components/party/PublicFirstCard.tsx'),btn=read('components/party/PeopleButton.tsx'),
 lock=read('components/party/PlayLock.tsx'),roomPub=read('components/party/RoomPublicChip.tsx'),roomChip=read('components/party/RoomPartyChip.tsx'),
 near=read('components/party/publicNear.ts'),town=read('components/Town.tsx'),arcade=read('components/party/useArcadeRoomParty.ts'),css=read('components/party/party.module.css');
const C=loadTs('lib/multiplayer/publicCopy.ts');

t('flag off: the people button, the Settings toggle and PartyHost are today\'s code (pinned branches)',()=>{
 assert(/\{friendsOn&&\(publicWorldEnabled\(\)\?<PeopleButton className=\{styles\.circle\}\/>:<button type="button" className=\{styles\.circle\} data-party-open data-party-live=\{partyLive\?'true':undefined\} aria-label=\{partyLive\?`Your party, \$\{party\.members\.length\} playing`:'Play with friends'\} onClick=\{openPartyMenu\}/.test(sett),'flag off: the old button, untouched');
 assert(/\{multiplayerEnabled\(\)&&\(publicWorldEnabled\(\)\?<PlayLock\/>:<section className=\{styles\.preferenceCard\} aria-label="Play with friends"><h3>Play with friends<\/h3>/.test(sett)&&/Play with friends: \{friendsAllowed\?'Allowed':'Off'\}/.test(sett),'flag off: the old Allowed / Off toggle');
 assert(/return publicWorldEnabled\(\) \? <WithPresence \{\.\.\.props\} \/> : <Host \{\.\.\.props\} \/>;/.test(host),'PartyHost: flag off renders Host without presence');
 assert(/const publicUi = !!ps && ps\.tutorialDone;/.test(host)&&/setView\(liveRef\.current \? 'sheet' : publicRef\.current \? 'choice' : 'menu'\)/.test(host),'no ps (flag off) = the old menu');
 assert(/\{ps && <PublicFirstCard/.test(host)&&/view === 'choice' && ps &&/.test(host),'card and panel need the presence state (flag on)');
 assert(/publicUi \? <BackButton[^]*?: <span aria-hidden="true" \/>/.test(host),'menu header: the old spacer unless the panel came first');
});
t('flag on: "Who\'s on your island?" and the three choices come from publicCopy, current one marked, With friends continues to today\'s menu',()=>{
 assert.equal(JSON.stringify(C.PRESENCE_CHOICES.map(c=>c.id)),JSON.stringify(['solo','public','friends']));
 assert(/PRESENCE_CHOICES\.map/.test(choice)&&/\{PUBLIC_PANEL_TITLE\}/.test(choice)&&/publicChoiceLabel\(count\)/.test(choice),'rendered from publicCopy');
 assert(/aria-current=\{on \? 'true' : undefined\}/.test(choice)&&/aria-pressed=/.test(choice),'current mode marked');
 assert(/onFriends=\{\(\) => \{ setFrom\(null\); setView\('menu'\); \}\}/.test(host),'With friends opens today\'s menu (gate, name, code)');
 assert(/setMode\(id\);\s*onClose\(\);/.test(choice),'one tap switches (no reload) and closes at once');
 assert(/ps\.sharedMatch && id !== marked/.test(choice)&&/PUBLIC_MATCH_LEAVE\.line/.test(choice)&&/PUBLIC_MATCH_LEAVE\.stay/.test(choice),'in a shared match: You\'ll leave this match, Switch / Stay');
 assert(/PUBLIC_REASON_LINE\[r\]/.test(choice)&&/role="status" data-presence-reason/.test(choice),'a calm reason line, never an error');
 for(const k of ['locked-friends','locked-off','tutorial','closed','unavailable'])assert(typeof C.PUBLIC_REASON_LINE[k]==='string',k);
});
t('in a world: never party things (code, invite, QR, host tools, Lock name, first-name field)',()=>{
 assert(/const live = !world && \(state\.status === 'live' \|\| state\.status === 'reconnecting'\);/.test(host),'party branches key off live, false in a world');
 assert(/if \(world\) \{ prevIds\.current = null; return; \}/.test(host)&&/if \(world \|\| \(wasWorld && !joining\.current\)\) return;/.test(host),'no joined / party ended notes for strangers');
 for(const [f,src] of [['PresenceChoice',choice],['ReportSheet',report],['PublicFirstCard',first],['RoomPublicChip',roomPub],['PeopleButton',btn]]){
  const s=strip(src).replace(/^import .*$/gm,'');
  assert(!/NickField|PartyInvite|qrcode|\.host\.|nameLock|Lock name|Start a party|invite/i.test(s),`${f}: no party-only affordance`);
 }
 assert(/if \(state\.kind === 'world'\) return live \? <RoomPublicChip/.test(roomChip),'rooms: a world gets the public chip, never the party roster');
 assert(/if \(prevWorld \|\| state\.kind === 'world'\) return;/.test(roomChip),'rooms: no "The party ended" when a world closes');
});
t('roster: generated names, nearest first, at most 8, Hide / Report, hidden ones with Show again',()=>{
 assert(/export const ROSTER_MAX = 8;/.test(choice)&&/nearestFirst\(/.test(choice),'nearest first, capped');
 assert(/hideMember\(m\.id\)/.test(choice)&&/setReport\(m\)/.test(choice)&&/unhideMember\(m\.id\)/.test(choice),'hide, report, unhide');
 assert(/\{m\.name\}/.test(choice)&&!/displayName|m\.nick/.test(strip(choice)),'the store\'s generated name only (nick is null in a world)');
 assert(/hideMember\(m\.id\)/.test(roomPub)&&/<ReportSheet/.test(roomPub)&&/setMode\('solo'\)/.test(roomPub),'rooms: the same Hide / Report and Just me');
});
t('report sheet: four large reasons, no typing, reporting hides at once, then the thanks line',()=>{
 const s=strip(report);
 assert(!/<input|<textarea|contentEditable/i.test(s),'no text field');
 assert(/REPORT_REASONS\.map/.test(s)&&/reportMember\(id, r\.wire\)/.test(s)&&/PUBLIC_REPORT\.thanks/.test(s),'reasons -> reportMember (hides + C.Report) -> thanks');
 assert.equal(JSON.stringify(C.REPORT_REASONS.map(r=>r.wire)),JSON.stringify([0,1,2,3]));
 assert(/\.reportReasons>\.secondary\{min-height:52px/.test(css),'large buttons');
});
t('grown-up lock: three settings from PLAY_LOCK_SETTINGS behind the parent gate; the store reacts',()=>{
 assert.equal(JSON.stringify(C.PLAY_LOCK_SETTINGS.map(s=>s.id)),JSON.stringify(['all','friends','off']));
 assert(/PLAY_LOCK_SETTINGS\.map/.test(lock)&&/parentGatePassed\(\)\) setMultiplayerLock\(v\); else setGateFor\(v\)/.test(lock)&&/<ParentGate reason=\{PLAY_LOCK_GATE\}/.test(lock),'gated three-way');
 assert(/useSyncExternalStore\(subscribeMultiplayerAllowed, multiplayerLock/.test(lock),'follows the lock');
 assert(/const lock = useSyncExternalStore\(subscribeMultiplayerAllowed, multiplayerLock/.test(arcade)&&/\[allowed, lock\]/.test(arcade),'Arcade re-checks all <-> friends');
});
t('first-time card: through the toast lane, once per device, never during lessons, matches or menus',()=>{
 assert(/toastLane\.want\(FIRST_CARD_LANE\)/.test(first)&&/toastLane\.request\(FIRST_CARD_LANE\)/.test(first)&&/toastLane\.hold\(FIRST_CARD_LANE, true\)/.test(first)&&/toastLane\.held/.test(first),'lane: waits for Welcome back / quiet holds, holds while shown');
 assert(/seenMark\('card'\)/.test(first)&&/setMark\('card'\)/.test(first),'once per device');
 assert(/if \(blocked \|\| busy \|\|/.test(first)&&/blocked=\{!!publicBlocked \|\| view !== 'none'\}/.test(host)&&/publicBlocked=\{toastBlocked\}/.test(town),'blocked by menus / lessons, and by the panel itself');
 assert(/PUBLIC_FIRST_CARD\.title/.test(first)&&/PUBLIC_FIRST_CARD\.ok/.test(first)&&/setMode\('solo'\)/.test(first),'OK and Just me');
 assert(/FIRST_NEAR_M = 25/.test(near)&&/liveJoin\.joined\|\|liveKnockout\.joined\|\|!!lessonRef\.current\|\|!!fieldSession\.current/.test(town),'25 m; busy = match / lesson / quiz');
 assert(/HINT_KEY = 'fi2-public-hint-v1'/.test(near)&&/'fi2-public-hint-v1'/.test(read('lib/saves/snapshot.ts')),'the device key named by the plan (classified)');
});
t('people button: label and badge from publicCopy, hint once through the lane, a new player sees today\'s button',()=>{
 assert.equal(C.peopleButtonLabel(null),'Who’s on your island?');assert.equal(C.peopleButtonLabel(8),'Players on your island, 8');assert.equal(C.peopleButtonLabel(30),'Players on your island, lots');
 assert.equal(C.peopleBadge(30),'lots on now');assert.equal(C.peopleBadge(3),'3 on now');assert.equal(C.peopleBadge(0),null);assert.equal(C.publicRoomChip(1),'1 player here');assert.equal(C.publicRoomChip(4),'4 players here');
 assert(/ps\.tutorialDone \? peopleButtonLabel\(pub \? others : null\) : 'Play with friends'/.test(btn),'before the tour ends: today\'s label');
 assert(/const pub = ps\.tutorialDone && !partyLive && party\.kind === 'world'/.test(btn)&&/const count = !partyLive && pub \? peopleBadge\(others\) : null/.test(btn),'badge only in a world with others (hidden at 0)');
 assert(/toastLane\.request\(HINT_LANE\)/.test(btn)&&/seenMark\('hint'\)/.test(btn)&&/setMark\('hint'\)/.test(btn)&&/!seenMark\('card'\)/.test(btn),'hint once, through the lane, not after the card');
 assert(/@media\(prefers-reduced-motion:reduce\)\{\.choice\{transition:none\}[^\n]*\.peoplePulse\{animation:none/.test(css),'reduced motion');
});
t('Town: the three signals, discrete inputs, counters on presence events, the frame helpers, the neutral match line',()=>{
 const i=town.indexOf('publicPresence.onEvent('),j=town.indexOf('createPublicWorld({conn:partyConnection(),look:partyLook})');
 assert(i>0&&j>i,'subscribed before the driver starts (it raises arm)');
 assert(/if\(!multiplayerEnabled\(\)\|\|!publicWorldEnabled\(\)\)return;/.test(town),'inert with the flag off');
 assert(/publicWorld\.current\?\.islandReady\(ready&&!failed\)/.test(town),'island ready = PartyHost\'s islandReady');
 assert(/publicWorld\.current\?\.tutorialDone\(ready&&!failed&&!onboardingOpen&&!shouldShowIslandOnboarding\(\)\)/.test(town),'tutorial done = really finished');
 assert(/addEventListener\('pointerdown',input,\{capture:true,passive:true\}\)/.test(town)&&/addEventListener\('keydown',input/.test(town)&&/pub\.noteInput\(\)/.test(town),'first input (never per frame)');
 for(const c of ["case 'arm':countPublicArm(e.arm,e.back)","case 'connect':countPublicConnect()","case 'seen':countPublicSeen()","case 'switch':countPublicSwitch(e.to)","case 'hide':countPublicHide()","case 'report':countPublicReport(e.reason)","case 'fallback':countPublicFallback(e.why)","case 'match_join':countPublicMatchJoin()"])assert(town.includes(c),c);
 assert(/publicFrame\(t,othersNear\(\)\)/.test(town)&&/onPublicCard=\{countPublicHint\}/.test(town),'minutes + the card count');
 assert(/offEvents\(\);(?:offLife\(\);)?pub\.dispose\(\)/.test(town),'disposed (phase 3: and the island life listener)');
 assert(/join:publicWorldEnabled\(\)\?strangerJoin\(liveJoin\):liveJoin/.test(town)&&/PUBLIC_MATCH_LINES\.lost/.test(near),'a neutral mid-match line for strangers');
 // final pass (Nov 11 2026): "Just me" mid-match closes the world socket BEFORE matchLink says the lost line, so the wrapper keeps the
 // last isPublic() sampled on a roster change (friendsChanged) while the shared match was live (browser: the line said "friends").
 assert(/w\.say = \(text: string, seconds\?: number\) => join\.say\(strangerLine\(text, pub\), seconds\);/.test(near)&&/w\.friendsChanged = \(\) => \{ pub = isPublic\(\); join\.friendsChanged\(\); \};/.test(near)&&/if \(!isPublic\(\) && !wasPublic\) return text;/.test(near),'the lost line after a switch to Just me keeps the stranger wording');
});
t('targets and focus: 44 px+, focus-visible, Escape closes',()=>{
 assert(/\.choice\{[^}]*min-height:72px/.test(css)&&/\.choice:focus-visible\{outline/.test(css),'big choices with focus ring');
 assert(/e\.key === 'Escape'/.test(first)&&/e\.key === 'Escape'/.test(roomPub),'Escape closes the card and the room roster (the panel uses PartyHost\'s Card)');
});
console.log(`mp-public-ui: ${n} checks passed`);

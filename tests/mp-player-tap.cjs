// Tap on a player (public island phase 1, Nov 11 2026): the picking maths (lib/graphics/remotePick.ts), the islander / object
// priority in Town and the rooms, the card's actions (components/party/PlayerCard.tsx) and that the flag OFF hooks up nothing.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
function loadTs(f){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(read(f),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Number,Object,String,Array});return mod.exports;}
const P=loadTs('lib/graphics/remotePick.ts'),C=loadTs('lib/multiplayer/publicCopy.ts');
const town=read('components/Town.tsx'),card=read('components/party/PlayerCard.tsx'),tap=read('components/party/usePlayerTap.ts'),room=read('components/party/RoomPlayerTap.tsx'),
 avatars=read('lib/graphics/remoteAvatars.ts'),css=read('components/party/playerCard.module.css');
// A simple camera: `s` px per metre, x to the right, y up; depth z (NDC) grows with world z (bigger z = further).
const cam=(s=20,ox=200,oy=400)=>(x,y,z)=>({x:ox+x*s,y:oy-y*s,z:z/100});
const spot=(id,x,z,o={})=>({id,x,y:0,z,k:1,d:5,...o});

t('a tap on the body picks that player; empty ground picks nobody',()=>{
 const s=[spot(1,0,10)],pr=cam();// body: feet (200,400), head (200,358): 42 px tall
 assert.equal(P.pickRemote(200,380,s,pr),1);
 assert.equal(P.pickRemote(320,380,s,pr),null,'empty ground');
 assert.equal(P.pickRemote(200,250,s,pr),null,'the sky above them');
 assert.equal(P.pickRemote(200,380,[],pr),null,'nobody drawn');
});
t('hit box: never under 44 px, never over 1.6x a body bigger than that',()=>{
 const small=P.hitBox({x:0,y:100,z:0},{x:0,y:90,z:0});// a 10 px body
 assert.equal(small.w,44);assert.equal(small.h,44);
 const big=P.hitBox({x:0,y:400,z:0},{x:0,y:100,z:0});// a 300 px body
 assert(big.h<=big.bodyH*1.6&&big.h>=big.bodyH,'height bounded');assert(big.w<=Math.max(44,big.bodyW*1.6)&&big.w>=big.bodyW,'width bounded');
 const pr=cam(5);// a far, small body (10.5 px tall): the 44 px floor still lets a thumb hit it
 assert.equal(P.pickRemote(200+21,400-5,[spot(1,0,10)],pr),1);assert.equal(P.pickRemote(200+23,400-5,[spot(1,0,10)],pr),null);
 const near=cam(150);// a big body (315 px tall, 132 px wide): 1.3x around its centre
 assert.equal(P.pickRemote(200+85,400-157,[spot(1,0,10)],near),1);assert.equal(P.pickRemote(200+110,400-157,[spot(1,0,10)],near),null,'beyond 1.6x the body');
});
t('only near (<= 30 m), drawn (fade >= .35), in front of the camera',()=>{
 const pr=cam();
 assert.equal(P.pickRemote(200,380,[spot(1,0,10,{d:31})],pr),null,'too far from me');
 assert.equal(P.pickRemote(200,380,[spot(1,0,10,{d:30})],pr),1);
 assert.equal(P.pickRemote(200,380,[spot(1,0,10,{k:.2})],pr),null,'faded out');
 assert.equal(P.pickRemote(200,380,[spot(1,0,150)],pr),null,'behind / past the far plane');
 assert.equal(P.MAX_M,30);assert.equal(P.CLOSE_M,35);
});
t('overlap: the one nearest the camera wins',()=>{
 const pr=cam();
 assert.equal(P.pickRemote(200,380,[spot(1,0,40),spot(2,.3,12),spot(3,-.2,25)],pr),2);
 assert.equal(P.pickRemote(200,380,[spot(3,-.2,25),spot(1,0,40)],pr),3);
});
t('hidden, leaving and over-the-room-cap players are never listed; the list is built on a tap only',()=>{
 assert(/tapSpots\(\)\{const spots=\[\];for\(const e of list\)\{if\(e\.hidden\|\|e\.leaving\|\|!e\.sel\)continue;/.test(avatars),'tapSpots skips hidden / leaving / !sel');
 assert(/e\.shown&&e\.rig/.test(avatars)&&/e\.label\?\.visible/.test(avatars),'only what was drawn last frame (body, or ring + label)');
 assert(/camera:root\.visible\?tapCam:null/.test(avatars),'friends layer hidden (zoomed, busy): no camera, no pick');
 assert.equal((avatars.match(/tapCam=camera;/g)||[]).length,1,'the only per-frame cost: one reference');
});
t('priority: Town asks after its own player, live-match players, islanders and machines, before the building boxes; rooms after their own pick',()=>{
 const pick=town.slice(town.indexOf('const pickCharacter='),town.indexOf('renderer.domElement.addEventListener(\'pointerdown\',beginCharacterTap)'));
 const at=pick.indexOf('tapPlayer(');
 assert(at>0,'hooked in pickCharacter');
 assert(pick.indexOf('Math.hypot(event.clientX-start.x,event.clientY-start.y)>10')<at,'a drag / stick / camera move (> 10 px) never reaches it');
 for(const before of ['inspectLivePlayer(event)','characterRay.intersectObject(player.root,true)','islandNpcs.pick(characterRay)','vending.pick(characterRay)','gashaPrompt.pick(characterRay)'])assert(pick.indexOf(before)<at,before+' keeps priority');
 for(const after of ['pointsAtFerry()','pointsAtMuseum()','pointsAtShop()','pointsAtArcade()','pointsAtKonbini(','pointsAtCoaches()'])assert(pick.indexOf(after,at)>at,after+' comes after');
 for(const f of ['components/MuseumRoom.tsx','components/shop/ShopRoom.tsx'])assert(/\{if\(!room\.current\?\.pick\(e\.clientX,e\.clientY\)\)roomTapPlayer\(party,e\.clientX,e\.clientY,e\.currentTarget\);\}/.test(read(f)),f+': only when the room pick found no shelf / exhibit');
 const arc=read('components/ArcadeRoom.tsx');assert(/const onCabinet=room\.current\?\.cabinetAt\(e\.clientX,e\.clientY\);room\.current\?\.pick\(e\.clientX,e\.clientY\);if\(!onCabinet\)roomTapPlayer\(/.test(arc),'Arcade: a cabinet keeps priority');
  for(const f of ['components/ArcadeRoom.tsx','components/MuseumRoom.tsx','components/shop/ShopRoom.tsx'])assert(!read(f).includes('roomTapPlayerNearer'),f+': nearer-wins is Konbini only');
 assert(/cabinetAt\(clientX:number,clientY:number\)\{return hitCabinet\(clientX,clientY\)>=0;\}/.test(read('lib/arcade/arcadeRoomScene.ts')));
});
t('flag OFF: nothing is hooked up (Town, rooms, the tap itself); party friends get no card either',()=>{
 assert(/if\(publicWorldEnabled\(\)&&!fieldSession\.current&&!liveJoinRef\.current\?\.joined&&tapPlayer\(/.test(town),'Town tap behind the flag');
 assert(/\{publicWorldEnabled\(\)&&<PlayerCard /.test(town),'Town card behind the flag');
 assert(/export function tapPlayer[^]*?\{\s*if \(!publicWorldEnabled\(\) \|\| !source\) return false;/.test(tap),'tapPlayer is inert with the flag off');
 assert(/export function roomTapPlayer[^]*?\{\s*if \(!publicWorldEnabled\(\) \|\| !party\) return;/.test(room)&&/export function RoomPlayerCard[^]*?const on = publicWorldEnabled\(\) && !!party;\s*useEffect\(\(\) => \{ if \(on && !tapMod\)[^]*?if \(!on\) return null;/.test(room),'rooms inert with the flag off');
 assert(/dynamic\(\(\) => import\('\.\/PlayerCard'\)/.test(room)&&/import\('\.\/usePlayerTap'\)/.test(room)&&!/^import [^\n]*(PlayerCard'|usePlayerTap')/m.test(room),'rooms load the card code only on demand');
 for(const f of ['components/KonbiniRoom.tsx','components/MuseumRoom.tsx','components/shop/ShopRoom.tsx','components/ArcadeRoom.tsx'])assert(!/import [^;]*from '[^']*(PlayerCard|usePlayerTap)'/.test(read(f)),f+': no static import of the card');
});
t('the card: Wave through the existing emote path, Hide / Report through the client API; no Report for party friends',()=>{
 assert(/tapPlayer\(event\.clientX,event\.clientY,renderer\.domElement,party,\(\)=>emoteBus\.fire\(EMOTE\.Wave\)\)/.test(town),'island Wave = the emote button\'s path (plays on you, sends with its rate limit)');
 assert(/party\.emote\(Emote\.Wave\)/.test(room),'room Wave = the room handle\'s emote');
 assert(/else hideMember\(m\.id\);\s*playerCard\.close\(\);/.test(card),'stranger Hide = publicWorld.hideMember (counted through the presence event)');
 assert(/if \(onHideFriend\) onHideFriend\(next\);[^\n]*else setHiddenFriends\(next\);/.test(card)&&/onHideFriend=\{onHiddenFriends\}/.test(town),'friend Hide = the party Hide path');
 assert(/<ReportSheet id=\{m\.id\}/.test(card),'Report opens the existing sheet (reportMember hides at once)');
 assert(/\{!friend && <button[^\n]*data-act="card-report"/.test(card),'no Report for a party friend');
 assert(/friend: s\.kind !== 'world'/.test(tap));
 assert(/strangerLabel\(m\.nameIdx, m\.colourHex\)/.test(card),'a stranger shows the generated name only');
});
t('no typing anywhere; 44 px targets; labels; reduced motion',()=>{
 for(const src of [card,tap,room])assert(!/<input|<textarea|contentEditable|<select/i.test(src),'no text field');
 assert(/aria-label=\{label\}/.test(card)&&C.playerCardLabel('Teal Giraffe',false)==='Teal Giraffe, another player');
 assert(/className=\{styles\.act\}/.test(card),'the party .act buttons (>= 44 px)');assert(/min-height:44px/.test(css));
 assert(/prefers-reduced-motion:reduce\)\{\.card,\.card\[data-docked\]\{animation:none\}/.test(css));
 assert(!/IslandBrush/.test(css),'button font rule');
});
t('closes: elsewhere, Escape, Done, > 35 m, gone, hidden, mode change, blocked; one card; the one-message lane',()=>{
 assert(/e\.key === 'Escape'/.test(card)&&/document\.addEventListener\('pointerdown', down, true\)/.test(card)&&/<DoneButton onDone=\{done\}/.test(card));
 assert(/l\.d > CLOSE_M/.test(card)&&/setInterval\([^]*?, 1000\)/.test(card),'distance re-checked once a second, only while open');
 assert(/\(!m && !reportRef\.current\) \|\| party\.kind !== at\.kind \|\| party\.status !== 'live' \|\| blocked/.test(card),'left / mode changed / blocked');
 assert(/onHiddenStrangers\(check\)/.test(card)&&/onFriendFilters\(check\)/.test(card),'hidden from anywhere');
 assert(/if \(!open && toastLane\.held\) return false;/.test(tap)&&/toastLane\.hold\(PLAYER_CARD_LANE, true\)/.test(tap)&&/playerCard\.close\(\);\s*if \(toastLane\.held\) return false;/.test(tap),'never over another card; holds the lane while open; one at a time');
 assert(/publicBlocked=\{toastBlocked\}/.test(town)&&/<PlayerCard blocked=\{toastBlocked\}/.test(town),'blocked like the first-time card (lesson, quiz, match, menu)');
});
t('strings live in publicCopy and pass the banned-claims check',()=>{
 const all=C.allPublicCopy();for(const s of Object.values(C.PUBLIC_PLAYER_CARD))assert(all.includes(s));
 const banned=[/COPPA[- ]compliant/i,/\bcertified\b/i,/no data (?:is )?collected/i,/\bno chat\b/i,/collects? no data/i];
 assert(/export const BANNED_CLAIMS=\[\/COPPA\[- \]compliant\/i,\/\\bcertified\\b\/i,/.test(read('lib/site/safety.ts')),'the list this test mirrors');
 for(const s of all)for(const b of banned)assert(!b.test(s),s);
 assert(!/'[A-Z][a-z]+ [a-z]+!?'/.test(card.replace(/\/\/.*$/gm,'').replace(/'use client'/,'')),'no literal copy in the card');
});
t('Konbini: the nearer thing wins (a stranger in front of the shelf opens the card; else the shelf, as before)',()=>{
 // depth = world z here (bigger z = further from the camera); the body's middle is 1.05 m up (BODY_H 2.1)
 const depth=(x,y,z)=>z,s=spot(1,0,10);
 assert.equal(P.playerNearer(s,depth,12),true,'stranger at 10 m, shelf at 12 m: the stranger');
 assert.equal(P.playerNearer(s,depth,8),false,'shelf at 8 m in front of them: the shelf');
 assert.equal(P.playerNearer(s,depth,10),false,'a tie keeps the shelf');
 assert.equal(P.playerNearer(s,depth,null),true,'no shelf behind: the stranger (the old path)');
 let at=null;P.playerNearer(spot(1,0,10,{k:.5}),(x,y,z)=>{at=y;return z;},12);assert.equal(at,.525,'default: the drawn body middle');
 // the camera looks down: higher on the body = nearer. A shelf at 10.5 m hides their legs but not their head.
 const down=(x,y,z)=>z-y*.5;
 assert.equal(P.playerNearer(s,down,9.5,0),false,'a tap on the feet: the shelf');assert.equal(P.playerNearer(s,down,9.5,1),true,'a tap on the head: the stranger');
 P.playerNearer(s,(x,y,z)=>{at=y;return z;},12,7);assert.equal(at,2.1,'clamped to the head');P.playerNearer(s,(x,y,z)=>{at=y;return z;},12,NaN);assert.equal(at,1.05,'bad input: the middle');
 const k=read('components/KonbiniRoom.tsx'),up=k.slice(k.indexOf('onPointerUp={e=>{const p=tap.current'),k.indexOf('}}}/>',k.indexOf('onPointerUp={e=>{const p=tap.current')));
 const sd=up.indexOf('shelfDepth('),near=up.indexOf('roomTapPlayerNearer('),pk=up.indexOf('room.current?.pick('),old=up.indexOf('roomTapPlayer(party');
 assert(sd>0&&sd<near&&near<pk&&pk<old,'shelf depth, then the nearer stranger, then the shelf pick, then the old stranger path');
 assert(/if\(sd!==null&&roomTapPlayerNearer\(party,e\.clientX,e\.clientY,e\.currentTarget,sd\)\)return;/.test(up),'a nearer stranger skips the shelf');
 assert(/if\(!room\.current\?\.pick\(e\.clientX,e\.clientY\)\)roomTapPlayer\(party,e\.clientX,e\.clientY,e\.currentTarget\);/.test(up),'otherwise the shelf exactly as before');
 assert(/const sd=party\?/.test(up),'flag off / no party: shelfDepth is not even asked');
 const sc=read('lib/konbini/konbiniScene.ts'),fn=sc.slice(sc.indexOf('shelfDepth(clientX'),sc.indexOf('walkTo(id:ShelfId)'));
 assert(fn.length>0&&!/walkToPoi|sound\.|wake\(|route=|target=/.test(fn),'shelfDepth moves nothing and plays nothing');
 assert(/if\(leaving\|\|covered\|\|zoomIndex!==null\)return null;/.test(fn),'same guard as pick');
 assert(/export function roomTapPlayerNearer[\s\S]*?if \(!publicWorldEnabled\(\) \|\| !party \|\| !tapMod\) return false;/.test(room),'synchronous, inert with the flag off');
 assert(/if \(objectDepth !== undefined\)[\s\S]*?if \(!playerNearer\([\s\S]*?\(fy - \(clientY - r\.top\)\) \/ \(fy - hy\)\)\) return false;[\s\S]*?playerCard\.close\(\);/.test(tap),'tapPlayer checks the depth at the tapped point, before opening');
});
console.log(`mp-player-tap: ${n} checks passed`);

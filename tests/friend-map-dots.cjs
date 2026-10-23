// Friends on the map (Oct 23 2026, owner: "on the map, can we show where friends are?"): pure rules (lib/town/friendMarks.ts),
// the key's "Friends" entry only with a party, the store's last island spots, and the heat guards (no loop, no new messages).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(base,f),'utf8');
function load(file){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Set,Map,Array,require:()=>{throw new Error('pure module only');}});return mod.exports;}
const F=load('lib/town/friendMarks.ts'),M=load('lib/town/mapMarkers.ts');
const eq=(a,b,msg)=>assert.equal(JSON.stringify(a),JSON.stringify(b),msg);
const B={minX:-300,maxX:300,minZ:-250,maxZ:250};

// 1. World -> map: the map's viewBox is world metres, so an on-map friend keeps their spot; a far one stays on the rim.
eq(F.friendMapPoint(12.5,-40,B),{x:12.5,z:-40});
eq(F.friendMapPoint(900,-900,B),{x:304,z:-254},'clamped inside the 8-unit rim');
eq(F.friendMapPoint(-900,900,B,8),{x:-304,z:254});

// 2. Which friends get a dot.
const m=(id,o={})=>({id,name:['Red','Blue','Green','Yellow','Orange'][id]??'Pink',nick:null,colourHex:'#D62828',presence:'active',room:-1,...o});
const spots=new Map([[0,{x:0,z:0}],[1,{x:10,z:20}],[2,{x:-50,z:5}],[3,{x:7,z:7}],[4,{x:30,z:-30}]]);
const doors=[{room:6,x:111,z:-22}];
const members=[m(0),m(1,{nick:'ana',colourHex:'#0072B2'}),m(2,{presence:'busy'}),m(3,{presence:'indoors',room:6}),m(4,{presence:'away'}),m(5)];
{const dots=F.friendDots(members,0,id=>spots.get(id),new Set(),doors,B);
 eq(dots.map(d=>d.id),[1,2,3,4],'never me; a friend with no spot yet (5) has no dot');
 const ana=dots[0];assert.equal(ana.initial,'A','first initial of the typed name, upper case');assert.equal(ana.name,'ana');assert.equal(ana.hex,'#0072B2','party colour');assert.equal(ana.dim,false);
 assert.equal(dots[1].dim,true,'busy is dimmed');assert.equal(dots[3].dim,true,'away is dimmed');
 assert.equal(dots[2].indoors,true);assert.equal(dots[2].dim,false,'indoors is not dimmed: it wears the door badge');
 eq([dots[2].x,dots[2].z],[111,-22],'a friend in a room sits at its building door');
 assert.equal(dots[1].initial,'G','no nick: the colour name');}
{const dots=F.friendDots(members,0,id=>spots.get(id),new Set([1,4]),doors,B);eq(dots.map(d=>d.id),[2,3],'hidden friends are not drawn');}
{// muted is not a filter here at all: friendDots never sees the muted set
 assert(!/muted/i.test(read('components/FriendMapDots.tsx').replace(/\/\/.*$/gm,'')),'muted friends are drawn');}
{// indoors in a room with no known door: the last island spot (where they went in); legacy door pose (room -1) = its island spot
 const d=F.friendDots([m(3,{presence:'indoors',room:9}),m(4,{presence:'indoors',room:-1})],0,id=>spots.get(id),new Set(),doors,B);
 eq(d.map(x=>[x.x,x.z,x.indoors]),[[7,7,true],[30,-30,true]]);}
assert.equal(F.friendDotText({presence:'indoors'},'in the Konbini'),'in the Konbini');
assert.equal(F.friendDotText({presence:'busy'}),'busy right now');
assert.equal(F.friendDotText({presence:'active'}),'is here');

// 3. Redraw only when needed: the minimap's 1 m step.
{const a=F.friendDots(members,0,id=>spots.get(id),new Set(),doors,B),same=a.map(d=>({...d}));
 assert.equal(F.friendDotsChanged(a,same,1),false);
 same[0].x+=.6;assert.equal(F.friendDotsChanged(a,same,1),false,'under 1 m: no redraw');
 same[0].x+=.5;assert.equal(F.friendDotsChanged(a,same,1),true,'1 m or more: redraw');
 assert.equal(F.friendDotsChanged(a,a.slice(1),1),true,'a friend left');
 const b=a.map(d=>({...d}));b[0].presence='busy';assert.equal(F.friendDotsChanged(a,b,1),true,'state change');}

// 4. The key: "Friends" only with a party; 6 entries otherwise (unchanged), 7 with (phones: 4 + 3).
eq(Array.from(M.mapLegend(false),i=>i.label),['Vending','Fishing','Jobs','Explore','Fly there','You']);
eq(Array.from(M.mapLegend(true),i=>i.label),['Vending','Fishing','Jobs','Explore','Fly there','You','Friends']);
assert.equal(M.mapLegend(true)[6].tip,'friend');assert.match(M.legendTipText('friend'),/^Friends: /);
{const map=read('components/IslandTravelMap.tsx'),css=read('components/IslandTravelMap.module.css'),dots=read('components/FriendMapDots.tsx'),o=read('components/IslandOverview.tsx');
 assert.match(map,/mapLegend\(usePartyHasFriends\(open\)\)/,'the key asks for Friends only while the map is open with a party');
 assert.match(css,/\.legend\[data-legend-count="7"\]\{grid-template-columns:repeat\(4,max-content\)/,'phones: 4 + 3 with Friends');
 // 5. Heat: no loop, no interval, no network; listeners only while live; You drawn after the friends (stays on top).
 assert(!/requestAnimationFrame|setInterval|sendPose|send\(/.test(dots),'no loop, no polling, no messages');
 assert.match(dots,/if\(!live\|\|!multiplayerEnabled\(\)\)\{setDots\(NONE\);return;\}/,'nothing subscribes when not live / multiplayer off');
 assert.match(dots,/const kick=\(\)=>\{if\(timer===undefined\)timer=setTimeout\(flush,everyMs\);\}/,'one timer per burst');
 assert.match(dots,/useFriendDots\(live,full\?\.5:1,full\?300:500\)/,'full map ~3 Hz, minimap 2 Hz and 1 m');
 assert.match(o,/\{terrain\}\{friends!==undefined&&<FriendMapDots mode="full" live=\{friends\}[^>]*\/>\}\{you\}/,'friends above the marks, You on top');
 assert.match(o,/<FriendMapDots mode="mini" live=\{active\}\/>/,'minimap dots sleep while the minimap is collapsed');
 assert.match(map,/friends=\{open\}/,'full map dots only while open');}

// 6. The store keeps each member's last island spot without emitting (no re-render per pose); rooms keep the door spot.
{const s=read('lib/multiplayer/store.ts');
 assert.match(s,/function keepSpot\(id: MemberId, body: ArrayLike<number>\): void \{\n  if \(roomOf\(body\) >= 0\) return;/);
 assert.match(s,/case S\.Left:\n        spots\.delete\(m\[1\]\);/);
 assert.match(s,/if \(cur && room < 0\) keepSpot\(id, scratch\);/,'a late pose for a member who already left never brings their map spot back');
 assert.doesNotMatch(s,/\n\s+if \(room < 0\) keepSpot\(id, scratch\);/);
 assert.match(s,/reset\(\): void \{ spots\.clear\(\);/);}
console.log('friend map dots ok');

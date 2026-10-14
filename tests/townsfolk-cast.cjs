// Townsfolk cast (Oct 12 2026, user-approved; lib/town/townsfolkCast.ts, docs/npc-cast.md): about 60 new islanders spread over
// five areas, nobody on a pitch, a per-view budget under the +50 safe line, a persona and rotating lines for everyone, short
// kid-friendly lines with no banned topics, and the runtime rules (focus mode, 10 Hz far poses) applying to them.
const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('exports','module','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id));cache.set(file,m.exports);return m.exports;}
const {NPC_DIALOGUES}=load('lib/town/npcDialogues.ts');
const cast=load('lib/town/townsfolkCast.ts'),{TOWNSFOLK_CAST:NEW,TOWNSFOLK_MOVES:MOVES,TOWNSFOLK_VOICES:VOICES,AGE_PROFILES}=cast;
const {VENUES}=load('lib/town/venues.ts'),{BEACH_COURT}=load('lib/town/coralCay.ts');
const {npcOpener,npcOpeners,markNpcVisited}=load('lib/town/npcOpeners.ts');
const src=f=>fs.readFileSync(f,'utf8');

// ---- Count and areas: about 60, 15 / 15 / 10 / 10 / 10, all in NPC_DIALOGUES (so the shared runtime builds them).
assert(NEW.length>=55&&NEW.length<=65,`about 60 new townsfolk (${NEW.length})`);
const per={};for(const n of NEW)per[n.area]=(per[n.area]??0)+1;
assert.deepEqual(per,{square:15,beach:15,pier:10,cay:10,residential:10},JSON.stringify(per));
for(const n of NEW)assert(NPC_DIALOGUES.includes(n),`${n.id} is an islander`);
assert.equal(new Set(NPC_DIALOGUES.map(n=>n.id)).size,NPC_DIALOGUES.length,'unique ids');
assert.equal(new Set(NPC_DIALOGUES.map(n=>n.name)).size,NPC_DIALOGUES.length,'unique names');

// ---- Placement bounds per area, and nobody new (or moved) on a pitch or the beach soccer court.
const BOX={square:[[-60,235,-62,-5]],beach:[[-60,200,-235,-200],[60,185,195,218],[-40,45,95,135]],pier:[[240,380,50,105],[200,245,190,215]],cay:[[380,710,-240,-60]],residential:[[-60,240,-200,-80],[-60,-40,-20,45],[90,100,40,160]]};
const inBox=(n,b)=>n.x>=b[0]&&n.x<=b[1]&&n.z>=b[2]&&n.z<=b[3];
for(const n of NEW)assert(BOX[n.area].some(b=>inBox(n,b)),`${n.id} (${n.x}, ${n.z}) inside its area "${n.area}"`);
const onPitch=(x,z)=>VENUES.some(v=>Math.abs(x-v.x)<v.width/2+1&&Math.abs(z-v.z)<v.length/2+1)||(Math.abs(x-BEACH_COURT.x)<BEACH_COURT.length/2+3&&Math.abs(z-BEACH_COURT.z)<BEACH_COURT.width/2+3);
for(const n of [...NEW,...NPC_DIALOGUES.filter(n=>MOVES[n.id])])assert(!onPitch(n.x,n.z),`${n.id} is not on a pitch`);
assert(!NEW.some(n=>n.freestyle!==undefined||n.activity||n.matchStory),'no new pitch players, freestylers, workers or match desks');

// ---- Heat budget: at most ~40 new townsfolk inside any phone view (72 m draw radius), well under the +50 safe line; the
// Island Square spawn (103, -8) gains only a handful on top of today's 15.
let worst=0,at=null;for(let x=-120;x<=720;x+=8)for(let z=-260;z<=230;z+=8){const k=NEW.filter(n=>Math.hypot(n.x-x,n.z-z)<72).length;if(k>worst){worst=k;at=[x,z];}}
assert(worst<=40,`at most 40 new in one view (worst ${worst} at ${at})`);
const spawnNew=NEW.filter(n=>Math.hypot(n.x-103,n.z+8)<40).length;assert(spawnNew<=10,`spawn view gains ${spawnNew}`);
console.log(`PASS ${NEW.length} new townsfolk: ${JSON.stringify(per)}; worst single view +${worst} at ${at}; spawn +${spawnNew}`);

// ---- Each new islander: name, persona, ≥ 3 lines, a topic with a follow-up; looks are explicit and varied.
for(const n of NEW){
 assert(n.name&&n.role&&n.pursuit&&n.persona&&n.greeting,`${n.id} has a name, role, purpose, persona and greeting`);
 assert(Array.isArray(n.lines)&&n.lines.length>=3,`${n.id} has at least 3 lines`);
 assert(n.topics.length>=1&&n.topics.every(t=>t.question&&t.answer&&t.followUp.question&&t.followUp.answer),`${n.id} has a topic and follow-up`);
 assert(['kid','teen','adult','elder'].includes(n.age)&&Number.isInteger(n.look.skin)&&n.look.skin>=0&&n.look.skin<=7,`${n.id} age and skin`);
 if(n.pose){assert(['bench','sit','lie'].includes(n.pose)&&typeof n.workYaw==='number',`${n.id} pose faces a set way`);assert(!n.travel,`${n.id} still or travelling, not both`);}
}
const ages=new Set(NEW.map(n=>n.age)),skins=new Set(NEW.map(n=>n.look.skin)),hair=new Set(NEW.map(n=>n.look.hair)),genders=NEW.reduce((a,n)=>(a[n.character]++,a),{male:0,female:0});
assert.equal(ages.size,4,'kids, teens, adults and grandparents');for(const a of ['kid','teen','elder'])assert(NEW.filter(n=>n.age===a).length>=8,`${a}s: at least 8`);
assert(skins.size===8,'all eight skin tones');assert(hair.size>=7,'varied hair styles');assert(Math.abs(genders.male-genders.female)<=4,`balanced: ${JSON.stringify(genders)}`);
assert(NEW.filter(n=>n.age==='elder'&&/^#(c9c6c0|ece9e2|a9a7a3)$/.test(n.look.hairColor??'')).length>=6,'grey and white hair for grandparents');
const poses=NEW.reduce((a,n)=>(a[n.pose??n.travel??'walk']=(a[n.pose??n.travel??'walk']??0)+1,a),{});
assert(poses.bench>=8&&poses.sit>=3&&poses.lie>=4&&poses.run>=3&&poses.walk>=25,`varied routines ${JSON.stringify(poses)}`);
for(const [k,p] of Object.entries(AGE_PROFILES))assert(p.height>0&&p.height<=1,`${k} height`);
assert(AGE_PROFILES.kid.height<AGE_PROFILES.teen.height,'children are smaller than teens');

// ---- Everyone (old and new) has a persona and rotating lines; the greeting stays the first opener.
for(const n of NPC_DIALOGUES){assert(n.persona&&n.lines?.length>=2,`${n.id} has a persona and at least 2 extra lines`);}
assert.deepEqual(Object.keys(VOICES).filter(id=>!NPC_DIALOGUES.some(n=>n.id===id)),[],'voices only for real islanders');
{const n=NEW[0],all=npcOpeners(n);assert.equal(all[0],n.greeting);assert.equal(npcOpener(n),n.greeting);markNpcVisited(n.id);assert.equal(npcOpener(n),n.lines[0]);for(let i=1;i<all.length;i++)markNpcVisited(n.id);assert.equal(npcOpener(n),n.greeting,'wraps round');}

// ---- Lines: short, kid-friendly, and free of banned topics (betting, alcohol, brands, politics, put-downs).
const BANNED=/\b(bet|bets|betting|gambl\w*|casino|odds|lottery|beer|wine|alcohol\w*|drunk|vodka|cigarette\w*|smok\w*|vape|politic\w*|election\w*|president\w*|war|wars|hate|hates|stupid|idiot\w*|loser\w*|rubbish|sucks|useless|nike|adidas|puma|sponsor\w*|brand\w*)\b/i;
const texts=[];for(const n of NPC_DIALOGUES){const voice=VOICES[n.id],isNew=NEW.includes(n);
 for(const l of [...(voice?.lines??[]),...(isNew?[n.greeting,...n.lines]:[])])texts.push([n.id,l,170]);
 if(isNew){texts.push([n.id,n.persona,200]);for(const t of n.topics)texts.push([n.id,t.question,80],[n.id,t.answer,260],[n.id,t.followUp.question,80],[n.id,t.followUp.answer,260]);}}
for(const [id,t,max] of texts){assert(t.length<=max,`${id}: "${t.slice(0,40)}…" is ${t.length} > ${max} characters`);const m=t.match(BANNED);assert(!m,`${id}: banned word "${m&&m[0]}" in "${t}"`);assert(!/[<>{}]|\s{2}/.test(t),`${id}: clean text`);}
// Two sentences at most for a persona line (ages 7–12 reading level).
for(const n of NEW)for(const l of n.lines)assert((l.match(/[.!?](\s|$)/g)??[]).length<=2,`${n.id}: "${l}" is at most two sentences`);
console.log(`PASS ${texts.length} lines and answers are short and free of banned topics; every islander has a persona and rotating openers`);

// ---- Spread: moved regulars have no gameplay tie (no freestyle, café route, work prop, video desk, job/quest/test position).
const tied=/^(court-|cay-|pier-|video-|cafe-)|^(hugo|hostel-ari|home-koa|home-lina|sandbar-nia|noor|okafor)$/;
for(const id of Object.keys(MOVES)){const n=NPC_DIALOGUES.find(n=>n.id===id);assert(n,id);assert(!tied.test(id)&&!n.activity&&n.freestyle===undefined,`${id} is free to move`);assert.equal(n.x,MOVES[id].x);}
const areaOf=n=>n.area;for(const a of Object.keys(BOX)){const old=NPC_DIALOGUES.filter(n=>!NEW.includes(n)&&(n.area===a||BOX[a].some(b=>inBox(n,b)))).length;assert(old>=2,`old and new faces mix in ${a} (${old} regulars)`);}

// ---- Runtime wiring (lib/graphics/islandNpcs.ts): one list, so focus mode, the 10 Hz far pose and the off-screen routine step
// cover the new townsfolk; still poses use the freestyle stances; children get the rig's height profile.
const npcs=src('lib/graphics/islandNpcs.ts');
assert.match(npcs,/const entries=NPC_DIALOGUES\.map\(/,'every islander is an entry');
assert.match(npcs,/for\(const entry of entries\)\{if\(isThinned\(entry\)\|\|heldByFocus\(entry\)\)continue;/,'focus mode holds routines');
assert.match(npcs,/for\(const entry of entries\)\{if\(frozen\.has\(entry\.id\)\|\|heldByFocus\(entry\)\)continue;/,'focus mode holds posing');
assert.match(npcs,/bucket===entry\.poseBucket&&!entry\.definition\.travel&&[^;]*distance>FAR_POSE/,'still and walking townsfolk pose at 10 Hz beyond FAR_POSE');
assert.match(npcs,/const seat=definition\.pose\?npcSeatPose\(definition\.pose,rig\.profileScale\):undefined;/,'still poses built once');
assert.match(npcs,/\.\.\.\(entry\.seat\?\{trick:entry\.seat\}:null\)/,'still pose handed to the rig as its trick pose');
assert.match(npcs,/if\(entry\.seat&&!entry\.near&&!entry\.stunned&&entry\.seatHeld>=2&&!truckWitnesses\.has\(entry\.id\)\)/,'a still townsperson holds its solved pose (re-solved after a wave, bump or truck)');
assert.match(npcs,/rig\.setProfile\(AGE_PROFILES\[definition\.age\]\)/,'age height profile');
assert.match(npcs,/radius<=12&&!authoredRoute&&!definition\.pose;/,'still poses keep their exact bench / towel spot');
assert.match(src('lib/graphics/npcSeatPose.ts'),/stancePose\('lie',ctx,o\)[\s\S]*stancePose\('sit',ctx,o\)/,'existing freestyle stances');
assert.match(src('components/Town.tsx'),/islandNpcs\.setFocus\(\{x:s\.x,z:s\.z,r:focusNearLive\?FOCUS_LIVE_M:-1\}\)/,'fishing focus freezes all townsfolk');
assert.match(src('lib/town/npcDialogues.ts'),/if\(townsfolkCastEnabled\(\)\)\{/,'?npcmore=0 A/B switch');
assert.match(src('components/NpcConversation.tsx'),/npcOpener\(npc\)/,'conversations open with the rotating line');
console.log('PASS runtime: focus mode, 10 Hz far poses, still poses, age profiles and rotating openers cover the cast');

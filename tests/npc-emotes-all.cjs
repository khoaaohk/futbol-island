// Every townsperson answers all ten emotes (owner, Oct 23 2026): one row per NPC activity, the wheel stays the standard ten, the ball
// townsfolk (jugglers) play the two-ball party duet with the player (both balls end with their owners), field players still refuse.
// Pure rules (lib/town/npcEmoteSets.ts, lib/town/emoteDuet.ts) + wiring checks on the source (Town.tsx, islandNpcs.ts).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file);
 const full=path.join(ROOT,file),m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,Object,Array,Set,Map,Float32Array,Float64Array,Uint8Array,Error,Infinity,Number,require:id=>{
   if(id.startsWith('.'))return load(path.relative(ROOT,path.resolve(path.dirname(full),id)+'.ts'));
   throw new Error('unexpected require '+id);}});
 cache.set(file,m.exports);return m.exports;
}
const NS=load('lib/town/npcEmoteSets.ts'),D=load('lib/town/emoteDuet.ts');
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const town=read('components/Town.tsx'),npcs=read('lib/graphics/islandNpcs.ts'),react=read('lib/town/emoteReact.ts');
const WHEEL=[...react.matchAll(/\{emote: EMOTE\.(\w+), icon: '[^']*', label: '([^']+)'\}/g)].slice(0,10).map(m=>m[2]);

t('the wheel order is the standard ten (source of truth: LOCAL_EMOTES)',()=>{
 assert.equal(WHEEL.join('|'),'Wave|High five|Cheer|Pass it|Juggle with me|Well played|Laugh|Dance|Thanks|Show off');
});
t('every NPC activity answers 10 of 10 (set size = 10 for each)',()=>{
 // activity -> how it answers: the set kinds have a script per wire value; walkers / runners / workers / seated go through islandNpcs.react (all ten)
 const rows={walker:{},runner:{travel:'run'},worker:{},seated:{pose:'bench'},skater:{travel:'skateboard'},scooter:{travel:'scooter'},juggler:{freestyle:2}};
 for(const [name,def] of Object.entries(rows)){const cls=NS.npcEmoteClass(def),kind=NS.npcSetFor(cls,'walk');
  const answered=kind?NS.npcAnswersFor(kind).filter(Boolean).length:10;/* '' = the ordinary react path: every EMOTE value is a reaction (below) */
  assert.equal(answered,10,name);}
 assert(/const react=\(id:string,emote:number/.test(npcs)&&/applyEmoteArms\(entry\.rig\.root,entry\.fx\.kind/.test(npcs),'the ordinary path plays any of the ten');
 assert.equal(NS.npcEmoteClass({},true),'field');assert.equal(NS.npcSetFor('field','walk'),'','active match / practice / rally players keep the refusal');
});
t('ball NPC duet wiring: Town starts the party duet with the juggler as role 1; islandNpcs rests its routine and draws its own ball',()=>{
 assert(/const startNpcDuet=\(ns:NpcScript,e:/.test(town)&&/islandNpcs\.duet\(e\.id,emote,dur\)/.test(town)&&/duet\.npc=e;/.test(town),'the duet targets the townsperson');
 assert(/if\(ns&&nsTarget&&ns\.duet&&!rs&&startNpcDuet\(ns,nsTarget,pickIn\)\)return;/.test(town),'ball emotes with a juggler start the duet');
 assert(/const duetPartner=\(\)=>/.test(town)&&/const fp=duetPartner\(\),me=player\.root\.position;/.test(town),'the same duet step serves a friend or a townsperson');
 assert(/n\.pass=reduced\?null:duetOut\.actors\[1-duet\.role\]/.test(town)&&/n\.duetBall=n\.passBall;/.test(town),'its body and its own ball follow the routine');
 assert(/if\(duet\.npc\)\{const n=duet\.npc;n\.duetBall=null;n\.pass=null;n\.fx\.kind=-1;duet\.npc=null;\}else party\?\.endDuet/.test(town),'the end hands the townsperson its ball back (no relay message for NPCs)');
 assert(/conn\.sendEmote\(pickIn as/.test(town),'friends still see the player\'s own emote');
 assert(/const duet=\(id:string,emote:number,seconds:number\)=>/.test(npcs)&&/e\.fxDur=seconds/.test(npcs),'the townsperson holds still for the whole routine');
 assert(/!entry\.duetBall,reduced,freestyleClock/.test(npcs)&&/entry\.freestyle\.ball\.position\.set\(\(c\*dx-si\*dz\)\*k,dy\*k,\(si\*dx\+c\*dz\)\*k\)/.test(npcs),'world -> rig frame, no allocation');
 assert(!/new T\.|\{x:0,y:0,z:0\}/.test((town.match(/const duetPartner=[\s\S]*?return true;\};/)||[''])[0].replace('npcDuetPose={x:0,y:0,z:0,mode:0}','')),'no per-frame allocation in the duet step');
});
t('ball NPC duets: for every routine both balls start and end with their owners, and both move (player A, juggler B)',()=>{
 const A={x:0,y:0,z:0},B={x:4,y:0,z:1.5};
 for(const s of NS.npcAnswersFor('juggler').filter(x=>x.duet))for(const seed of s.duet.seed>=0?[s.duet.seed]:[0,1,2]){
  const o=D.createDuetOut(),dur=D.duetSeconds(s.duet.emote,seed);D.duetAt(s.duet.emote,seed,0,A,B,o);
  const a0={...o.balls[0]},b0={...o.balls[1]};assert(Math.hypot(a0.x-A.x,a0.z-A.z)<1&&Math.hypot(b0.x-B.x,b0.z-B.z)<1,s.label+' starts at the owners');
  let moved0=0,moved1=0,crossed=false;for(let a=0;a<=dur;a+=.05){D.duetAt(s.duet.emote,seed,a,A,B,o);moved0=Math.max(moved0,Math.hypot(o.balls[0].x-a0.x,o.balls[0].z-a0.z));moved1=Math.max(moved1,Math.hypot(o.balls[1].x-b0.x,o.balls[1].z-b0.z));if(Math.hypot(o.balls[0].x-B.x,o.balls[0].z-B.z)<1.2)crossed=true;}
  assert(moved0>1.5&&moved1>1.5,s.label+': both balls in play');assert(crossed,s.label+': the balls swap sides');
  D.duetAt(s.duet.emote,seed,dur,A,B,o);assert(Math.hypot(o.balls[0].x-A.x,o.balls[0].z-A.z)<1&&Math.hypot(o.balls[1].x-B.x,o.balls[1].z-B.z)<1,s.label+' ends with each ball back at its owner');
 }
});
t('non-ball answers: skaters / scooter riders never take a ball; the player plays the ball emotes solo while they answer on their route',()=>{
 for(const k of ['skater','scooter'])assert.equal(NS.npcAnswersFor(k).filter(s=>s.duet).length,0);
 assert(/const soloBall=!emoteNpc\|\|!!ns;/.test(town)&&/pick===EMOTE\.PassBall&&soloBall/.test(town),'pass to the air partner / solo keep-ups');
 assert(/if\(entry\.ix\)\{[^]*?entry\.routine\.speed=entry\.baseSpeed\*entry\.ixOut\.slow/.test(npcs),'only the speed dips; the route is untouched');
});
console.log('npc-emotes-all: '+n+' tests passed');

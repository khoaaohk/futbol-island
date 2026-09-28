const assert=require('node:assert/strict');
const pos=require('../lib/town/positionPlayers.json'),plays=require('../lib/town/iconicPlays.json');
const TEMPLATES=new Set(['solo_dribble_goal','long_range_goal','free_kick_goal','header_goal','volley_goal','bicycle_kick','chip_goal','penalty_goal','through_ball_assist','cross_assist','save','penalty_save','last_ditch_tackle','aerial_clearance','interception_counter','skill_move','overlap_run','sweeper_keeper']);
const TRICKS=new Set(['roulette','elastico','stepover','cruyff_turn','rabona','nutmeg','flip_flap','drag_back','la_croqueta']);
// Coach cards (role "coach", Sep 28 2026) teach a coaching idea (lib/town/coachIdeas.json), not an iconic play.
const names=new Set();for(const [role,v] of Object.entries(pos))if(role!=='coach')for(const k of ['current','allTime'])for(const n of v[k]||[])names.add(n);
assert.equal(names.size,400,'expected 400 unique players');
for(const n of names)assert(plays[n],'missing entry: '+n);
for(const n of Object.keys(plays))assert(names.has(n),'extra key: '+n);
for(const [n,e] of Object.entries(plays)){
 const at=m=>n+': '+m;
 assert(['moment','signature'].includes(e.kind),at('bad kind'));
 assert(TEMPLATES.has(e.template),at('bad template '+e.template));
 assert(typeof e.title==='string'&&e.title.length>0&&e.title.length<=60,at('title length'));
 assert(typeof e.lesson==='string'&&e.lesson.trim().length>0&&e.lesson.length<=160,at('lesson length'));
 if(e.kind==='moment'){assert(Number.isInteger(e.year)&&e.year>=1900&&e.year<=2026,at('moment needs year'));assert(typeof e.event==='string'&&e.event.length>0,at('moment needs event'));}
 else{assert(!('year' in e),at('signature must not have year'));assert(!('event' in e),at('signature must not have event'));}
 const p=e.params||{};
 for(const k of Object.keys(p))assert(['side','beaten','distance','foot','trick','dive'].includes(k),at('unknown param '+k));
 if(p.side!==undefined)assert(['left','right','center'].includes(p.side),at('side'));
 if(p.beaten!==undefined)assert(Number.isInteger(p.beaten)&&p.beaten>=1&&p.beaten<=5,at('beaten'));
 if(p.distance!==undefined)assert(['box','edge','long'].includes(p.distance),at('distance'));
 if(p.foot!==undefined)assert(['left','right'].includes(p.foot),at('foot'));
 if(p.dive!==undefined)assert(['left','right'].includes(p.dive),at('dive'));
 if(p.trick!==undefined)assert(TRICKS.has(p.trick),at('trick'));
}
const kinds={};for(const e of Object.values(plays))kinds[e.kind]=(kinds[e.kind]||0)+1;
console.log(`PASS iconic plays: ${names.size} players covered, no extras (${kinds.moment||0} moments / ${kinds.signature||0} signatures)`);

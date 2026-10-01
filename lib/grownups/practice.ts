/**
 * Real-world practice for grown-ups (G-09): short, safe backyard or park activities tied to the island lessons a child has
 * explored. Each needs at most a ball, a few cones (shoes or bottles work) and one grown-up or friend. No equipment to buy.
 */
export type Practice={id:string;title:string;setup:string;howTo:string;talk:string;match:RegExp};
export const PRACTICE_SAFETY='Play on grass or a soft, open space away from roads, with a grown-up nearby. Stop for water and when anyone is tired. Keep it fun: trying counts more than getting it right.';
export const PRACTICES:Practice[]=[
 {id:'look-turn',title:'Look, then turn or pass back',setup:'A ball, you and your child about 5 big steps apart.',howTo:'As you pass, hold up 1 or 2 fingers beside you. Your child glances at you before the ball arrives and calls the number: 1 = turn with it, 2 = pass it back.',talk:'What did you see before the ball came?',match:/receive|passtofeet|throughlines|firstpass|pivot/},
 {id:'hide-seek',title:'Hide-and-seek passing',setup:'A ball and a cone, chair or bag as the “defender” between two players.',howTo:'Put the cone between you. Before each pass, your child takes small side-steps until they can see your feet past the cone, then calls for it.',talk:'Where did you move so I could pass to you?',match:/support|spread|shadow|reachable|lane|checking/},
 {id:'wall-pass',title:'One-two against a wall',setup:'A ball and a wall, step or bench.',howTo:'Pass to the wall, take two steps forward and receive the rebound. Then try: pass to you, you pass straight back, they run past you for the return.',talk:'When is a quick pass back better than dribbling?',match:/onetwo|pared|wall|thirdman|thirdplayer|two_one|2v1|paralela/},
 {id:'cone-gate-1v1',title:'Backyard 1v1 with a cone gate',setup:'A ball and two cones about 3 big steps apart as a gate, 10 steps away.',howTo:'Your child dribbles to the gate while you walk in as a gentle defender. If there is room, they carry it through. If you block, they stop and pass back to you.',talk:'How did you know when to dribble and when to pass?',match:/carry|dribble|roles|shape|restdefense|fmn_/},
 {id:'shadow',title:'Shadow the ball',setup:'A ball and a cone as “our goal”.',howTo:'You dribble slowly around. Your child stays between you and the cone, facing you, without diving in. Swap after a minute.',talk:'Where did you stand to protect the goal?',match:/goalside|delay|dontballwatch|denypivot|farpostdefense|keeperposition/},
 {id:'lost-it',title:'Lost it? Race back',setup:'Two cones: one “middle” cone behind your child.',howTo:'Pass the ball back and forth. When you shout “Lost it!”, your child races back to the middle cone and turns to face you. Keep it short: five goes, then a rest.',talk:'What is the first thing you do when your team loses the ball?',match:/lostball|recover|winitback|trailing|secondball/},
 {id:'say-it',title:'“I’ve got ball!” talking game',setup:'A ball and two or three players.',howTo:'One person dribbles. The two defenders must speak before moving: one calls “I’ve got ball!” and steps up, the other says “Cover!” and stands behind.',talk:'What did you and your partner say to each other?',match:/cover|pressurecover|shift|diamond|handoff|organise|pressreturn|screen|frontpair|spareback/},
 {id:'keeper-start',title:'Start from the keeper',setup:'A ball and two cones as passing targets on each side.',howTo:'You are the keeper with the ball. Your child moves to whichever cone is free (you stand near one) and calls for the pass.',talk:'Where can you go so the keeper can pass to you?',match:/keeper|buildout|splitcb|usekeeper|restart|whenlong/},
 {id:'switch-gates',title:'Two-gate switch',setup:'A ball and two small cone gates far apart.',howTo:'Your child dribbles toward a gate. If you step across to guard it, they look up and pass or dribble to the other gate.',talk:'How did you spot that the other side was free?',match:/switch|otherside|farchannel|flanks|block/},
 {id:'restart-backup',title:'Throw-in with a backup',setup:'A ball and two players or targets.',howTo:'Your child takes a throw-in (or kick-in). Before throwing they check two options and pick the one that is free.',talk:'Which option did you choose, and why?',match:/throwin|kickin|corner|freekick|set_|restartreturn|shortcorner/},
 {id:'run-on-cue',title:'Run when their head goes up',setup:'A ball and some space.',howTo:'You dribble slowly. The moment you look up at your child, they run into space to receive. If they run before you look, reset and try again.',talk:'What told you it was time to run?',match:/runoncue|farpost|cutback|fourthrunner|wingback|droppingnine|movement|arrive/},
];
const fallback=PRACTICES.find(p=>p.id==='cone-gate-1v1')!;
/** `n` different activities: those matching the lessons given first (most relevant first), topped up with starters. */
export function practiceFor(lessons:{id:string}[],n=3):Practice[]{
 const out:Practice[]=[];
 for(const l of lessons){const p=PRACTICES.find(p=>p.match.test(l.id));if(p&&!out.includes(p))out.push(p);if(out.length>=n)break;}
 // Top up with the universal starters (1v1 gate, look-then-turn, hide-and-seek) so there is always a small choice.
 for(const id of [fallback.id,'look-turn','hide-seek']){if(out.length>=n)break;const p=PRACTICES.find(p=>p.id===id)!;if(!out.includes(p))out.push(p);}
 return out;
}

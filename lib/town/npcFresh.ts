import type {NpcFreshBook} from './npcFreshTypes';
/**
 * STUB (Nov 1 2026, mechanism branch): a few pools so lib/town/npcFreshPicker.ts can be built and tested. The content agent's
 * lib/town/npcFresh.ts REPLACES this whole file at merge.
 */
export const FRESH:NpcFreshBook={byNpc:{
 rosa:{topics:[
  {id:'sole',question:'Why do futsal players use the sole so much?',answer:'The futsal ball is smaller and heavier, so it bounces less. The sole lets you stop it, roll it and protect it in a tight space.'},
  {id:'pivot',question:'What is a pivot in futsal?',answer:'The pivot is the player furthest forward. They hold the ball with their back to goal so teammates can join the attack.',followUp:{question:'How do I hold the ball up?',answer:'Keep your body between the defender and the ball, stay low and ask for it to your safe foot.'}}
 ],challenges:[
  {id:'kickin',prompt:'In futsal the ball goes out over the sideline. How do you restart?',options:['A throw-in','A kick-in','A drop ball'],correct:1,right:'Yes! Futsal uses a kick-in from the line, and you have four seconds to take it.',wrong:'Not quite. Futsal has no throw-ins: you restart with your feet.'},
  {id:'fouls',prompt:'How many players are on the court for each futsal team?',options:['Five','Seven','Eleven'],correct:0,right:'Right: five, and one of them is the goalkeeper.',wrong:'That is a different format. Futsal is small: five a side.'}
 ],openers:['Back on the rooftop! The court is quick today.','Hey! Ready for a few fast touches?'],returning:['Last time we talked about “{topic}”. Shall we learn something new today?']},
 sam:{topics:[
  {id:'subs',question:'How do we pick fair teams?',answer:'Mix the players up so each team has quick, strong and new players. Swap someone if one team keeps winning easily.'}
 ],challenges:[
  {id:'offside',prompt:'A teammate passes forward. When can you be offside?',options:['When you are behind the ball','When you are past the last defender as the pass is played','In your own half'],correct:1,right:'Exactly. Offside is judged at the moment the pass is played, in the other team’s half.',wrong:'Not that one. You can never be offside behind the ball or in your own half.'}
 ],openers:['Old Town is buzzing! Grab a bib.'],returning:['You asked me “{topic}” before. Want a new one?']},
 maya:{topics:[],challenges:[
  {id:'backpass',prompt:'A teammate kicks the ball back to you on purpose. Can you pick it up?',options:['Yes, always','No, play it with your feet','Only inside the six-yard box'],correct:1,right:'Correct. The back-pass rule keeps the game moving, so a keeper uses their feet.',wrong:'Close, but the back-pass rule says a kicked pass to the keeper must be played with the feet.'}
 ],openers:[],returning:[]},
 'konbini-cashier-hana':{topics:[
  {id:'halftime',question:'What should I eat at half-time?',answer:'Something light: water and a little fruit give you energy without feeling heavy for the second half.'}
 ],challenges:[
  {id:'water',prompt:'When should a player drink water on a hot match day?',options:['Only at full time','Before, at breaks and after','Never during a game'],correct:1,right:'Yes! Small sips before, at every break and after keep your legs and focus sharp.',wrong:'Not quite. Waiting too long makes you tired. Little and often is best.'}
 ],openers:['Welcome back to the counter!'],returning:['You asked me “{topic}” last time. Got a new question?']}
},byArea:{
 square:{topics:[
  {id:'square-shape',question:'What is a triangle in football?',answer:'Three teammates spread out so the player on the ball always has two passing options.'}
 ],challenges:[
  {id:'square-corner',prompt:'Where is a corner kick taken from?',options:['The penalty spot','The corner arc','The halfway line'],correct:1,right:'Yes, from the little arc in the corner of the pitch.',wrong:'Not there. Corners are taken from the corner arc.'}
 ],openers:['Busy day in the square! Talk football with me?'],returning:['We chatted about “{topic}” last time. Here is something new.']}
}};

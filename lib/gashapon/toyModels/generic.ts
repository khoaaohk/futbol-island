/**
 * The generic capsule-toy figure (round 3A, Nov 8 2026): every toy without its own builder yet shows this, in its two colours,
 * so the viewer never breaks. Its reactions and voices are read from the toy's own words in lib/gashapon/toys.ts (`touch` and
 * `sound`), mapped onto the figure's parts (body, head region above y 0.62, armL/armR, feet, eyes, hat).
 */
import type {ToyBehaviour,ToyBuilder,ReactionRef} from '../toyKit';
import {voicesFromText} from '../toySound';

const MAP:[RegExp,ReactionRef[]][]=[
 [/squish|squash|flat|squeez|stretch(es)? long|snaps back/,['squash']],[/stretch|tall|proud|long/,['stretch']],
 [/spin|twirl|circle|loop|turn|orbit/,['spin']],[/wave|beckon|paw|point|raises/,['wave:armR']],[/flap|wing|clap|flips? up/,['flap:armL+armR']],
 [/hop|jump|bounc|boing|kick|leap|sprint/,['hop']],[/wobble|rock|sway|tip|stay|rolls?/,['wobble']],[/bow|nod/,['bow']],
 [/blink|wink|yawn|eye/,['blink']],[/glow|shine|shiny|sparkl|twinkl|chime|rainbow|light/,['glow','sparkle']],
 [/steam|puff|ink|mist|spout|fizz|squirt|spray/,['puff']],[/bubble|blub/,['bubbles']],[/petal|float|drip|drop/,['petal']],
 [/giggl|laugh|purr|rattl|shake|sizzl|crunch|crackl|clack|ping|flex/,['jiggle']],[/swim|dart|glide|paddl|curl/,['swim']],
];
export function reactionsFromText(text:string,fallback:ReactionRef[]):ReactionRef[]{
 const t=text.toLowerCase(),out:ReactionRef[]=[];for(const [re,refs] of MAP)if(re.test(t))for(const r of refs)if(!out.includes(r))out.push(r);
 return out.length?out.slice(0,2):fallback;
}

export const genericToy:ToyBuilder=k=>{
 const {body,accent,ink}=k.c;
 k.part('armL',{at:[-.3,.5,0]});k.part('armR',{at:[.3,.5,0]});k.part('feet',{at:[0,.06,0]});k.part('hat',{at:[0,.98,0]});
 k.capsule(.3,.42,{at:[0,.51,0],color:body});
 k.sphere(.22,{at:[0,.36,.18],scale:[1,.9,.42],color:accent});
 k.face('body',{at:[0,.7,.27],sphere:[0,.72,0,.3],gap:.11,size:.042});
 for(const s of [-1,1] as const)k.capsule(.07,.16,{part:s<0?'armL':'armR',at:[s*.34,.44,0],rot:[0,0,s*.5],color:body});
 for(const s of [-1,1])k.sphere(.1,{part:'feet',at:[s*.13,.06,.06],scale:[1,.6,1.3],color:k.shade(body,-.15)});
 k.sphere(.09,{part:'hat',at:[0,1.03,0],color:accent});k.cyl(.03,.05,.08,{part:'hat',at:[0,.96,0],color:ink});
 const t=k.toy.touch,b:ToyBehaviour={
  squeeze:reactionsFromText(t.squeeze,['squash']),poke:{default:reactionsFromText(t.poke,['jiggle']),feet:['hop'],hat:['wiggle:hat'],armL:['wave:armL'],armR:['wave:armR']},
  tap:reactionsFromText(t.tap,['hop']),head:{above:.62},voice:voicesFromText(k.toy.sound)};
 return b;
};

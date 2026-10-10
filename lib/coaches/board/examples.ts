import {PLAY_VERSION,type Arrow,type Chip,type Format,type Play,type Vec,type ZoomView} from './types';

/**
 * Built-in example plays (read-only; "Edit a copy" makes one the coach's own). Each teaches one idea with a one-line
 * coaching point and plays through in 3–4 steps. Coordinates: u toward the goal the home team attacks, v from its left.
 */
type Spec={id:string;name:string;format:Format;view:ZoomView;note:string;chips:[string,'home'|'away'|'ball',string,boolean?][];
 steps:{pos:Record<string,Vec>;arrows?:[Arrow['kind'],string|Vec,string|Vec,number?][]}[]};
const end=(x:string|Vec)=>typeof x==='string'?{c:x}:{p:x};
function build(s:Spec):Play{
 const chips:Chip[]=s.chips.map(([id,team,label,gk])=>({id,team,label,...(gk?{gk:true}:{})}));
 let prev:Record<string,Vec>={};
 const steps=s.steps.map((st,i)=>{const pos={...prev,...st.pos};prev=pos;
  return {pos,arrows:(st.arrows??[]).map(([kind,a,b,bend],k)=>({id:`${s.id}${i}${k}`,kind,a:end(a),b:end(b),bend:bend??0,ink:0})),ink:[]};});
 return {v:PLAY_VERSION,id:s.id,name:s.name,format:s.format,chips,steps,note:s.note,view:s.view,created:0,updated:0};
}
const SPECS:Spec[]=[
 {id:'exgiveandgo',name:'Give-and-go (one-two)',format:'7v7',view:'half',
  note:'Pass and move: give it, sprint past your defender into space and get it straight back. Two passes beat one defender.',
  chips:[['h8','home','8'],['h9','home','9'],['a4','away','4'],['a5','away','5'],['agk','away','1',true],['ball','ball','']],
  steps:[
   {pos:{h8:[.56,.42],ball:[.598,.43],h9:[.75,.6],a4:[.66,.45],a5:[.8,.64],agk:[.975,.5]},arrows:[['pass','h8','h9'],['run','h8',[.84,.36],-.22]]},
   {pos:{h8:[.84,.36],ball:[.722,.585],a4:[.7,.53],a5:[.8,.6]},arrows:[['pass','h9','h8',.08]]},
   {pos:{ball:[.875,.375],a4:[.77,.45],a5:[.84,.5],agk:[.965,.45]},arrows:[['pass','h8',[1.005,.47],.05]]},
   {pos:{ball:[1.012,.47],agk:[.975,.43]}},
  ]},
 {id:'exoverlap',name:'Overlap down the wing',format:'11v11',view:'half',
  note:'The overlap makes a 2v1 on the wing: the winger drives inside, the full-back bursts round the outside and crosses.',
  chips:[['h7','home','7'],['h2','home','2'],['h9','home','9'],['h10','home','10'],['a3','away','3'],['a5','away','5'],['a4','away','4'],['agk','away','1',true],['ball','ball','']],
  steps:[
   {pos:{h7:[.66,.86],ball:[.685,.835],h2:[.55,.92],h9:[.8,.5],h10:[.7,.58],a3:[.75,.86],a5:[.85,.6],a4:[.86,.42],agk:[.985,.5]},
    arrows:[['dribble','h7',[.73,.72],.12],['run','h2',[.87,.94],.1]]},
   {pos:{h7:[.73,.72],ball:[.752,.695],h2:[.87,.94],a3:[.77,.77],a5:[.86,.6],h9:[.84,.5],h10:[.75,.6]},
    arrows:[['pass','h7','h2',-.1],['run','h9',[.94,.46],-.12]]},
   {pos:{ball:[.892,.915],h9:[.94,.46],h7:[.8,.66],a3:[.82,.84],a5:[.92,.55],a4:[.91,.42]},arrows:[['pass','h2',[.945,.48],.22]]},
   {pos:{ball:[.958,.49],a5:[.93,.52]},arrows:[['pass','h9',[1.006,.53],0]]},
   {pos:{ball:[1.014,.53],agk:[.98,.46]}},
  ]},
 {id:'express',name:'Pressing a goal kick',format:'9v9',view:'half',
  note:'Press as a pack: curve your run to cut off the pass back, so the ball is trapped by the touchline. Win it high, score fast.',
  chips:[['agk','away','1',true],['a4','away','4'],['a2','away','2'],['a6','away','6'],['h9','home','9'],['h11','home','11'],['h7','home','7'],['h8','home','8'],['ball','ball','']],
  steps:[
   {pos:{agk:[.975,.5],ball:[.95,.5],a4:[.88,.22],a2:[.88,.8],a6:[.76,.5],h9:[.79,.5],h11:[.76,.26],h7:[.75,.7],h8:[.66,.52]},
    arrows:[['pass','agk','a2',.12],['run','h7',[.86,.74],-.35],['run','h9',[.9,.55],0],['run','h8',[.77,.57],0],['run','h11',[.84,.36],0]]},
   {pos:{ball:[.868,.77],h7:[.86,.74],h9:[.9,.55],h8:[.77,.57],h11:[.84,.36],a6:[.74,.46]},
    arrows:[['pass','a2',[.79,.6],.05],['run','h8',[.79,.6],0]]},
   {pos:{ball:[.805,.585],h8:[.79,.6],a2:[.86,.77]},arrows:[['pass','h8','h9',.1]]},
   {pos:{ball:[.915,.535]},arrows:[['pass','h9',[1.006,.46],0]]},
   {pos:{ball:[1.014,.46],agk:[.98,.55]}},
  ]},
 {id:'excorner',name:'Corner: near-post flick-on',format:'11v11',view:'box',
  note:'Attack the near post: one runner flicks the corner on, the others crash the far post and the penalty spot.',
  chips:[['h7','home','7'],['h5','home','5'],['h9','home','9'],['h4','home','4'],['h10','home','10'],['a3','away','3'],['a2','away','2'],['a6','away','6'],['agk','away','1',true],['ball','ball','']],
  steps:[
   {pos:{h7:[1.012,1.012],ball:[.998,.992],h5:[.86,.6],h9:[.86,.42],h4:[.83,.5],h10:[.81,.68],a3:[.9,.6],a2:[.9,.44],a6:[.96,.58],agk:[.99,.5]},
    arrows:[['run','h5',[.955,.61],.15],['run','h9',[.96,.42],-.18],['run','h4',[.9,.5],0],['pass','ball',[.955,.615],.18]]},
   {pos:{ball:[.962,.632],h5:[.955,.61],h9:[.96,.42],h4:[.9,.5],a3:[.94,.62],a2:[.93,.45],a6:[.96,.6]},arrows:[['pass','h5','h9',.22]]},
   {pos:{ball:[.97,.44],agk:[.985,.54]},arrows:[['pass','h9',[1.006,.47],0]]},
   {pos:{ball:[1.014,.47]}},
  ]},
];
export const EXAMPLE_PLAYS:readonly Play[]=SPECS.map(build);
export const isExample=(id:string)=>EXAMPLE_PLAYS.some(p=>p.id===id);

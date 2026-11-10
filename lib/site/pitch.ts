/**
 * Pitch geometry for the guide diagrams (Nov 10 2026, SEO content clusters: formations and positions). Pure data and maths:
 * the inline SVG (lib/site/PitchDiagram.tsx) and the PNG image route (app/(site)/learn/diagrams) both draw from this, so a
 * diagram on a page and its image URL can never disagree. Each format has its own field proportions and markings (a 7v7 field
 * is not a small 11v11 field: it has build-out lines; a futsal court has rounded penalty areas and a second penalty mark).
 * Sizes are in metres and are only used for drawing in proportion; the pages do not quote them as rules.
 */
export type GuideFormat='7v7'|'9v9'|'11v11'|'futsal';
export const GUIDE_FORMATS=['7v7','9v9','11v11','futsal'] as const;
export const PLAYERS_PER_TEAM:Record<GuideFormat,number>={'7v7':7,'9v9':9,'11v11':11,futsal:5};
export const FORMAT_NAME:Record<GuideFormat,string>={'7v7':'7v7','9v9':'9v9','11v11':'11v11',futsal:'futsal'};
export type PitchSpec={w:number;l:number;px:number;box?:[number,number];six?:[number,number];circle:number;spot:number;spot2?:number;goal:number;buildOut?:number;arc?:number};
export const PITCH:Record<GuideFormat,PitchSpec>={
 '11v11':{w:68,l:105,px:340,box:[40.3,16.5],six:[18.3,5.5],circle:9.15,spot:11,goal:7.3},
 '9v9':{w:46,l:73,px:310,box:[30,13],six:[14,5],circle:7.3,spot:9,goal:6.4},
 '7v7':{w:34,l:52,px:280,box:[23,11],six:[7.3,3.7],circle:7.3,spot:9,goal:5.6,buildOut:18.5},
 futsal:{w:20,l:40,px:250,circle:3,spot:6,spot2:10,goal:3,arc:6},
};
/** `team:'opp'` draws the dot in the other team's colour (the rule and glossary scenes, lib/site/scenes.ts). */
export type Spot={n:string;label:string;pos?:string;dy?:number;team?:'opp'};
export type Line={name:string;spots:Spot[]};
export type Placed=Spot&{x:number;y:number;line:string};
export type Arrow={from:[number,number];to:[number,number]};
export type Mode='base'|'attack'|'defend';
const ROW_X:Record<number,number[]>={1:[50],2:[32,68],3:[17,50,83],4:[12,37,63,88],5:[9,29,50,71,91]};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
/**
 * Place a team on the pitch: x 0-100 from the left touchline, y 0-100 from the team's own goal line (the team attacks up the
 * picture). Lines run back to front and each line reads left to right. `attack` pushes the team up and wide, `defend` drops it
 * and makes it narrow ("wide with the ball, narrow without it": the 7v7 lessons, prn_7_spread, and lib/town/match/formatAI.ts).
 */
export function place(lines:readonly Line[],mode:Mode='base'):Placed[]{
 const out:Placed[]=[],field=lines.slice(1),L=field.length;
 const move=(x:number,y:number,keeper:boolean):[number,number]=>mode==='attack'?[keeper?x:clamp(50+(x-50)*1.14,6,94),keeper?y+7:y+17]:mode==='defend'?[keeper?x:50+(x-50)*.7,keeper?y:13+(y-18)*.6]:[x,y];
 for(const s of lines[0].spots){const [x,y]=move(50,5,true);out.push({...s,x,y,line:lines[0].name});}
 field.forEach((ln,i)=>{const y0=L===1?45:18+i*(54/(L-1)),xs=ROW_X[ln.spots.length];
  if(!xs)throw new Error(`a line of ${ln.spots.length} players has no layout`);
  ln.spots.forEach((s,j)=>{const edge=ln.spots.length>=4&&(j===0||j===ln.spots.length-1)&&i>0?3:0;const [x,y]=move(xs[j],y0+edge+(s.dy??0),false);out.push({...s,x,y,line:ln.name});});});
 return out;
}
/** Arrows from each outfield player's starting spot to where the team moves (attack or defend pictures). */
export function arrows(lines:readonly Line[],mode:Mode):Arrow[]{
 if(mode==='base')return [];
 const a=place(lines,'base'),b=place(lines,mode);
 return a.map((p,i)=>({from:[p.x,p.y] as [number,number],to:[b[i].x,b[i].y] as [number,number]})).filter((_,i)=>i>0);
}
const list=(xs:string[])=>xs.length>1?`${xs.slice(0,-1).join(', ')} and ${xs[xs.length-1]}`:xs[0]??'';
/** The text alternative every diagram carries (<desc>, the caption under it and the image alt). */
export function describe(o:{format:GuideFormat;what:string;lines:readonly Line[];mode?:Mode;highlight?:string}):string{
 const field=o.format==='futsal'?'futsal court':`${o.format} soccer field`;
 const rows=o.lines.map(l=>`${l.name}: ${list(l.spots.map(s=>s.n===s.label?s.label:`${s.label} (${s.n})`))}`).join('. ');
 const n=o.lines.reduce((a,l)=>a+l.spots.length,0);
 const tail=o.mode==='attack'?' Arrows show the team moving up the field and spreading wide.':o.mode==='defend'?' Arrows show the team dropping back and squeezing together in the middle.':'';
 const hi=o.highlight?` The ${o.highlight} is marked in gold.`:'';
 return `Diagram of ${o.what} on a ${field}, seen from above, with ${n} players attacking up the picture. ${rows}.${hi}${tail}`;
}

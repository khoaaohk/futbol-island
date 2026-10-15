/**
 * The catch card's words (Oct 15 2026, docs/fishing-research.md A4, A6): the size in football units and the rarity as an icon
 * row as well as a word and a colour (colour-blind safe). Pure, shared by the HUD's catch card, the Fishbook and Rosa's stand.
 *
 * Football sizes (the learning link: measurement and the real dimensions of the game): a size 5 ball is about 22 cm across
 * (68-70 cm round, IFAB Law 2), an adult football boot is about 28 cm long, and a goal is 7.32 m wide
 * (8 yards, IFAB Law 1). Never a weight, never a price: size still never sets the price.
 */
import type {FishRarity} from './fishCatalog';

export const BALL_CM=22,BOOT_CM=28,GOAL_CM=732;
export type SizeCompare={unit:'ball'|'boot'|'goal';count:number;text:string};
const half=(n:number)=>Math.max(.5,Math.round(n*2)/2);
const say=(n:number)=>{const w=Math.floor(n),h=n-w>.25;return w===0?'half':`${w}${h?'½':''}`;};
/** "about 2 boots long", "about 1½ balls across", "about a fifth of a goal wide" … for a size in cm. */
export function sizeCompare(cm:number):SizeCompare{
 const c=Math.max(0,cm);
 if(c>=GOAL_CM*.18){const frac=c/GOAL_CM,parts:[number,string][]=[[1/5,'a fifth'],[1/4,'a quarter'],[1/3,'a third'],[1/2,'half']];
  const [n,word]=parts.reduce((b,p)=>Math.abs(p[0]-frac)<Math.abs(b[0]-frac)?p:b);return {unit:'goal',count:n,text:`about ${word} of a goal wide`};}
 if(c>=40){const n=half(c/BOOT_CM);return {unit:'boot',count:n,text:`about ${say(n)} football boot${n>1?'s':''} long`};}
 if(c>=15){const n=half(c/BALL_CM);return {unit:'ball',count:n,text:n===1?'about as wide as a football':`about ${say(n)} footballs across`};}
 if(c>=9)return {unit:'ball',count:.5,text:'about half a football across'};
 return {unit:'ball',count:.25,text:'smaller than half a football'};
}
/** Rarity as a count of stars (1-4) beside its word and colour. */
export const RARITY_STARS:Record<FishRarity,number>={common:1,uncommon:2,rare:3,legendary:4};
/** The plain-text form (screen readers / alt text): "★★☆☆". */
export const rarityStarText=(r:FishRarity)=>'★'.repeat(RARITY_STARS[r])+'☆'.repeat(4-RARITY_STARS[r]);

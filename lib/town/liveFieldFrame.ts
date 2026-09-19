import type {SimPlayer} from './match/matchSim';
import type {PlayerMotion} from '../graphics/player';

/** Stable live rosters; lesson-specific poses remain on their own rendering path. */
export function createLiveFieldFrame(format:string){
 const tokens:{id:string;label:string;home:boolean}[]=[],poses=new Map<string,{x:number;y:number}>(),used=new Set<string>();
 const rows=new Map<string,{motion:PlayerMotion;hitId:string;frozen:boolean;x:number;y:number}>();
 let rebuilds=0;
 function sync(players:Record<string,SimPlayer>){
  let index=0,changed=false;
  for(const id in players){if(tokens[index++]?.id!==id)changed=true;}
  if(index!==tokens.length)changed=true;
  if(changed){tokens.length=0;poses.clear();used.clear();rows.clear();rebuilds++;
   for(const id in players){tokens.push({id,label:'',home:false});used.add(id);rows.set(id,{motion:{},hitId:'field:'+format+':'+id,frozen:false,x:0,y:0});}
  }
  for(const token of tokens){const p=players[token.id];if(p.isGK)token.label='GK';else if(!token.label||token.label==='GK')token.label=token.id.toUpperCase();token.home=p.team==='gold';poses.set(token.id,p);}
 }
 return {tokens,poses,used,rows,sync,get rebuilds(){return rebuilds;}};
}

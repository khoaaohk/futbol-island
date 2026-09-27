/** Original four-bar arcade groove. Render once into a small mono loop; no live sequencer. */
export function createArcadeRoomMusicBuffer(context:BaseAudioContext){
 const rate=24000,beat=60/112,length=beat*16,buffer=context.createBuffer(1,Math.round(rate*length),rate),out=buffer.getChannelData(0);
 const roots=[50,46,53,48],melody=[74,77,81,77,74,72,69,72,70,74,77,74,70,69,65,69,72,77,81,84,81,77,74,72,72,76,79,76,74,72,67,69];
 const hz=(m:number)=>440*Math.pow(2,(m-69)/12);
 function note(at:number,duration:number,midi:number,level:number,bass=false){const start=Math.round(at*rate),count=Math.round(duration*rate),f=hz(midi);for(let n=0;n<count;n++){const t=n/rate,p=n/count,envelope=Math.min(1,t/.008)*Math.pow(1-p,bass?1.2:1.7),phase=t*f*Math.PI*2;
  const wave=bass?Math.sin(phase)+.18*Math.sin(phase*2):Math.sin(phase)+.22*Math.sin(phase*3)+.07*Math.sin(phase*5);out[(start+n)%out.length]+=wave*envelope*level;}}
 let seed=317;for(let b=0;b<16;b++){const bar=Math.floor(b/4),root=roots[bar];note(b*beat,beat*.7,root,.18,true);if(b%4===2)note((b+.75)*beat,beat*.2,root+7,.09,true);
  // Soft kick, backbeat and short closed hat: deterministic noise, never sample downloads.
  for(let n=0;n<rate*.13;n++){const t=n/rate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1,env=Math.exp(-t*37),kick=b%2===0?Math.sin(2*Math.PI*(55*t+1.4*(1-Math.exp(-t*35))))*Math.exp(-t*30)*.22:0,snare=b%2===1?noise*env*.075:0;out[(Math.round(b*beat*rate)+n)%out.length]+=kick+snare;}
  for(let off=0;off<2;off++)for(let n=0;n<rate*.025;n++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;out[(Math.round((b+off*.5)*beat*rate)+n)%out.length]+=(seed/2147483648-1)*Math.exp(-n/rate*160)*.035;}
 }
 for(let n=0;n<melody.length;n++)note((n*.5+.07)*beat,beat*.32,melody[n],n%4===0?.12:.085);
 for(let bar=0;bar<4;bar++)for(let k=0;k<4;k++)note((bar*4+k+.65)*beat,beat*.23,roots[bar]+(k%2?19:12),.035);
 // Bound the mixed loop without compression pumping or a seam discontinuity.
 let peak=0;for(let n=0;n<out.length;n++)peak=Math.max(peak,Math.abs(out[n]));const scale=.72/Math.max(.72,peak);for(let n=0;n<out.length;n++)out[n]*=scale*Math.min(1,n/(rate*.002),(out.length-1-n)/(rate*.002));
 return buffer;
}

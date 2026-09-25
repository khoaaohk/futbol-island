/** One next-chapter download; at most one ready blob plus the active clip.
 * No second audio player, no polling, and failed prefetches fall back to the original URL. */
export function createNarrationBuffer(){
 let pending:AbortController|undefined,source='',ready='',active='',disposed=false;
 const clearNext=()=>{pending?.abort();pending=undefined;if(ready)URL.revokeObjectURL(ready);ready='';source='';};
 return{
  prepare(next?:string){
   if(disposed||!next||next===source)return;clearNext();source=next;
   const controller=new AbortController();pending=controller;
   void fetch(next,{signal:controller.signal}).then(response=>{if(!response.ok)throw new Error('Narration prefetch failed');return response.blob();}).then(blob=>{
    if(disposed||controller.signal.aborted||pending!==controller)return;
    ready=URL.createObjectURL(blob);pending=undefined;
   }).catch(()=>{if(pending===controller){pending=undefined;source='';}});
  },
  take(next:string){
   if(active)URL.revokeObjectURL(active);active='';
   if(next===source&&ready){active=ready;ready='';source='';return active;}
   clearNext();return next;
  },
  dispose(){disposed=true;clearNext();if(active)URL.revokeObjectURL(active);active='';},
 };
}

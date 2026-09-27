/** Stories and optional items that sit on the path after a chapter's last stop (between two chapter islands) are centred in the gap
 * between the upper island's bottom edge and the next island's top edge, spaced evenly when several share it (user, Sep 25 2026:
 * they overlapped the island above). Islands span a chapter's first stop − 90 px to its last stop + 180 px (+ ≈10 px of wave), and a
 * story's tile and labels are ≈150 px from the tile's top (stop.y − 32). A gap too small grows by pushing every later stop down. */
export const BETWEEN_H=150,BETWEEN_PAD=16;
/** Island (chapter region) edges relative to its first and last stop, as drawn in QuestLearningPath. */
export const ISLAND_TOP=-90,ISLAND_BOTTOM=190;
export function placeBetweenStops<T extends {story?:unknown;upcoming?:unknown;index:number;lesson:{id:string};y:number}>(stops:T[],chapterEnds:string[]){
 const between=(s:T)=>!!(s.story||s.upcoming)&&s.index>=0;
 for(let i=1;i<stops.length;i++){
  if(!between(stops[i])||between(stops[i-1]))continue;
  const upper=stops[i-1];if(!chapterEnds.includes(upper.lesson.id))continue;
  let end=i;while(end+1<stops.length&&between(stops[end+1]))end++;
  const n=end-i+1,lower=stops[end+1],top=upper.y+ISLAND_BOTTOM,need=n*BETWEEN_H+(n+1)*BETWEEN_PAD;
  const bottom=lower?lower.y+ISLAND_TOP-5:top+need+8,grow=Math.max(0,need-(bottom-top));
  if(grow)for(let k=end+1;k<stops.length;k++)stops[k].y+=grow;
  const slot=(bottom+grow-top-n*BETWEEN_H)/(n+1);
  for(let k=0;k<n;k++)stops[i+k].y=Math.round(top+slot*(k+1)+BETWEEN_H*k+32);
  i=end;}
 return stops;}

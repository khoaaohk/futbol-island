/**
 * Round-robin tournament schedule maker (Nov 22 2026; /tools/soccer-tournament-schedule-maker). Pure and import-free
 * (tests/new-tools.cjs checks: every pair meets exactly once (twice in a double round robin), no team plays twice in one time
 * slot, no more games in a slot than fields, the clock adds up).
 * Fixtures: the circle method. Team 1 stays still and the others turn one place each round; with an odd number of teams a
 * "bye" joins and whoever meets it rests. Home and away alternate so nobody is always listed first.
 * Slots: the games are dealt round by round onto the fields. A slot takes the earliest games whose two teams are both free in
 * it, preferring teams that did not play in the slot before (a rest between games), then any free team.
 */
export const MAX_TEAMS=16,MAX_FIELDS=8;
export type Game={id:string;round:number;a:number;b:number};
export type SlotGame=Game&{field:number};
export type Slot={start:number;end:number;games:SlotGame[];resting:number[]};
export type Schedule={teams:string[];rounds:Game[][];byes:number[][];slots:Slot[];endMin:number};
export function circleRounds(n:number,double=false):{rounds:Game[][];byes:number[][]}{
 const ids=Array.from({length:n},(_,i)=>i);if(n%2)ids.push(-1);
 const m=ids.length,rounds:Game[][]=[],byes:number[][]=[];let arr=ids.slice();
 for(let r=0;r<m-1;r++){
  const games:Game[]=[],bye:number[]=[];
  for(let i=0;i<m/2;i++){
   let a=arr[i],b=arr[m-1-i];
   if(a===-1||b===-1){bye.push(a===-1?b:a);continue;}
   if((i===0&&r%2===1)||(i>0&&i%2===1))[a,b]=[b,a];
   games.push({id:`r${r+1}g${games.length+1}`,round:r+1,a,b});
  }
  rounds.push(games);byes.push(bye);
  arr=[arr[0],arr[m-1],...arr.slice(1,m-1)];
 }
 if(double){const back=rounds.map((g,r)=>g.map((x,i)=>({id:`r${rounds.length+r+1}g${i+1}`,round:rounds.length+r+1,a:x.b,b:x.a})));
  return {rounds:[...rounds,...back],byes:[...byes,...byes.map(b=>b.slice())]};}
 return {rounds,byes};
}
export type ScheduleInput={teams:string[];fields:number;matchMin:number;breakMin:number;startMin:number;double?:boolean};
export function makeSchedule(o:ScheduleInput):Schedule{
 const teams=o.teams.slice(0,MAX_TEAMS),n=teams.length,fields=Math.max(1,Math.min(MAX_FIELDS,Math.floor(o.fields)||1));
 const matchMin=Math.max(1,Math.round(o.matchMin)||10),breakMin=Math.max(0,Math.round(o.breakMin)||0);
 const {rounds,byes}=n>=2?circleRounds(n,!!o.double):{rounds:[],byes:[]};
 const queue=rounds.flat(),slots:Slot[]=[];let t=o.startMin,prev=new Set<number>();
 while(queue.length){
  const used=new Set<number>(),take:Game[]=[];
  for(const pass of [0,1])for(let i=0;i<queue.length&&take.length<fields;i++){
   const g=queue[i];if(take.includes(g)||used.has(g.a)||used.has(g.b))continue;
   if(pass===0&&(prev.has(g.a)||prev.has(g.b)))continue;
   /* keep the rounds in order: a game may not jump ahead of an earlier game of one of its teams */
   if(queue.slice(0,i).some(x=>!take.includes(x)&&(x.a===g.a||x.b===g.a||x.a===g.b||x.b===g.b)))continue;
   take.push(g);used.add(g.a);used.add(g.b);
  }
  if(!take.length)take.push(queue[0]);
  for(const g of take)queue.splice(queue.indexOf(g),1);
  const games=take.sort((x,y)=>x.round-y.round||x.id.localeCompare(y.id)).map((g,i)=>({...g,field:i+1}));
  const busy=new Set(games.flatMap(g=>[g.a,g.b]));
  slots.push({start:t,end:t+matchMin,games,resting:Array.from({length:n},(_,i)=>i).filter(i=>!busy.has(i))});
  prev=busy;t+=matchMin+breakMin;
 }
 return {teams,rounds,byes,slots,endMin:slots.length?slots[slots.length-1].end:o.startMin};
}
export const clock=(min:number)=>{const m=((Math.round(min)%1440)+1440)%1440;return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;};
export const parseClock=(s:string)=>{const m=/^(\d{1,2}):(\d{2})$/.exec(s.trim());return m?Math.min(23,Number(m[1]))*60+Math.min(59,Number(m[2])):null;};
export type Score=[number,number];
export type Row={team:number;name:string;p:number;w:number;d:number;l:number;gf:number;ga:number;gd:number;pts:number};
/** The table: 3 points for a win and 1 for a draw; then goal difference, goals scored and the name. */
export function standings(teams:readonly string[],games:readonly Game[],scores:Readonly<Record<string,Score>>,win=3,draw=1):Row[]{
 const rows:Row[]=teams.map((name,team)=>({team,name,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0}));
 for(const g of games){const s=scores[g.id];if(!s||!Number.isFinite(s[0])||!Number.isFinite(s[1]))continue;
  const A=rows[g.a],B=rows[g.b];if(!A||!B)continue;
  A.p++;B.p++;A.gf+=s[0];A.ga+=s[1];B.gf+=s[1];B.ga+=s[0];
  if(s[0]>s[1]){A.w++;B.l++;A.pts+=win;}else if(s[0]<s[1]){B.w++;A.l++;B.pts+=win;}else{A.d++;B.d++;A.pts+=draw;B.pts+=draw;}}
 for(const r of rows)r.gd=r.gf-r.ga;
 return rows.sort((x,y)=>y.pts-x.pts||y.gd-x.gd||y.gf-x.gf||x.name.localeCompare(y.name));
}
export const cleanTeam=(s:string)=>s.replace(/[<>"`]/g,'').replace(/\s+/g,' ').trim().slice(0,28);
export const parseTeams=(text:string)=>text.split(/\n|,/).map(cleanTeam).filter(Boolean).slice(0,MAX_TEAMS);

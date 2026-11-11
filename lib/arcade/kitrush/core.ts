/**
 * Kit Rush rules (Nov 10 2026, docs/arcade-aaa/kitrush-direction.md). Pure and deterministic: no DOM, no storage, no clock.
 * Kit is tossed up the page in waves; the player swipes through their own team's kit, leaves the rival kit and never touches
 * the referee's whistle. Teaches: know your team at a glance (colour AND pattern), scan before you act, react to a switch.
 * Everything is pooled: step() and swipe() allocate nothing. The view drains `events` each frame.
 * Units: the field is 100 wide and `h` tall (the screen's aspect, clamped), y grows downwards, kit flies up from y = h.
 */
export const KR={
 fieldW:100,minH:130,maxH:225,
 r:7.2,ownSlop:1.6,hazardSlop:-1.2,easySlop:1.2,
 lives:3,points:10,comboCap:6,comboLink:.55,callBonusFrom:3,callBonus:10,minTravel:2.5,
 cleanForSub:12,subStep:6,safe:1.1,
 flight:2.55,flightStep:.97,flightFloor:.62,apexRef:.7,
 gap:1.55,gapStep:.93,gapFloor:.68,teach:3,wavesPerLevel:5,
 rivalShare:.22,rivalStep:.035,rivalMax:.46,
 whistleFrom:5,whistle:.12,whistleStep:.035,whistleMax:.34,
 thirdTeamLevel:3,fourthTeamLevel:6,
 switchFirst:[7,9] as const,switchEvery:[5,8] as const,beat:.9,readyBeat:.85,
 specialEvery:[6,9] as const,frenzy:5,frenzyGap:.17,frenzyPoints:15,slow:5,slowScale:.55,armband:8,
 medals:[500,1200,2500,5000] as const,
 maxItems:36,maxLaunch:36,maxEvents:96,
} as const;

/** Kit kinds 0-5 carry a team; 6-9 are the whistle and the three specials. */
export const KIND={ball:0,bib:1,boot:2,shirt:3,cone:4,bottle:5,whistle:6,golden:7,stopwatch:8,armband:9} as const;
export const KIT_KINDS=6;
export const KIND_NAMES=['ball','bib','boot','shirt','cone','bottle','whistle','golden','stopwatch','armband'] as const;
/** Four kits: a colour and a pattern each, so a kit is never told apart by colour alone. */
export const TEAMS=[
 {id:'sun',name:'Gold',pattern:'plain',color:'#ffc83a',dark:'#d98a1c',ink:'#231a2e'},
 {id:'teal',name:'Teal',pattern:'hoops',color:'#19b5a5',dark:'#0f7f86',ink:'#231a2e'},
 {id:'red',name:'Red',pattern:'stripes',color:'#f0452e',dark:'#b02a3a',ink:'#231a2e'},
 {id:'pink',name:'Pink',pattern:'sash',color:'#f06aa6',dark:'#b8306e',ink:'#231a2e'},// not violet: the stand and the evening shadows are violet
] as const;
export const CALLS=['','','ONE-TWO!','HAT-TRICK!','TIKI-TAKA!','TOTAL FOOTBALL!','GOLAZO!'] as const;
export const callFor=(n:number)=>n<2?'':CALLS[Math.min(n,CALLS.length-1)];
export const MEDAL_NAMES=['Bronze','Silver','Gold','Captain'] as const;
/** 0 = none, 1 Bronze ... 4 Captain. */
export function medalFor(score:number){let m=0;for(const t of KR.medals)if(score>=t)m++;return m;}

export type KitItem={active:boolean;kind:number;team:number;x:number;y:number;vx:number;vy:number;rot:number;vr:number;frenzy:boolean;peaked:boolean;seq:number};
type Launch={on:boolean;at:number;kind:number;team:number;x:number;vx:number;vy:number;frenzy:boolean};
export type KitEventType='toss'|'slice'|'special'|'foul'|'puff'|'miss'|'call'|'switch'|'ready'|'sub'|'over'|'effectEnd';
/** One slot of the event ring. `a`..`d` mean: slice a=points b=place in swipe c=kind d=team, angle in `ang`; foul a=1 whistle / 0 rival, b=lives left;
 *  call a=items b=bonus; switch/ready a=team; special a=kind; puff c=kind d=team; effectEnd a=kind. */
export type KitEvent={type:KitEventType;x:number;y:number;a:number;b:number;c:number;d:number;ang:number};
/** `deadUntil`: a foul or a switch mutes the finger for a moment (never two lives from one swipe); a lifted finger is muted until it lands again. */
export type KitStroke={count:number;last:number;travel:number;deadUntil:number;x:number;y:number};
export type KitStats={sliced:number;missed:number;rival:number;whistle:number;bestCombo:number;bestClean:number;waves:number;switches:number;specials:number;swipes:number};
export type KitRushState={
 seed:number;daily:boolean;h:number;t:number;real:number;score:number;lives:number;team:number;teams:number[];nTeams:number;
 wave:number;level:number;nextWaveAt:number;switchAt:number;specialAt:number;beat:number;safe:number;clean:number;
 frenzy:number;slow:number;armband:number;frenzyNext:number;subs:number;subAt:number;over:boolean;stats:KitStats;
 items:KitItem[];events:KitEvent[];eventHead:number;eventCount:number;
};

/** mulberry32: small, fast, the same on every device. */
function rng(seed:number){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
/** FNV-1a of the local play day: the same Daily Rush for everyone that day. */
export function kitRushDailySeed(day:string){let h=0x811c9dc5;const s='kitrush:'+day;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return 1+h%2_000_000_000;}
export const kitRushFieldH=(width:number,height:number)=>Math.max(KR.minH,Math.min(KR.maxH,width>0?KR.fieldW*height/width:160));

const SHAPES=['single','pair','line','fan','vee','stairs','cross','wall','sandwich','fountain'] as const;
type Shape=typeof SHAPES[number];
type Slot={dt:number;x0:number;x1:number;apex:number;role:0|1|2|3};// role 0 free, 1 own, 2 rival, 3 whistle

export type KitRush=ReturnType<typeof createKitRush>;
export function createKitRush(opts:{seed:number;h?:number;daily?:boolean}){
 const rand=rng(opts.seed),h=Math.max(KR.minH,Math.min(KR.maxH,opts.h??160));
 const int=(a:number,b:number)=>a+Math.floor(rand()*(b-a+1));
 const perm=[0,1,2,3];for(let i=3;i>0;i--){const j=Math.floor(rand()*(i+1)),t=perm[i];perm[i]=perm[j];perm[j]=t;}
 const items:KitItem[]=Array.from({length:KR.maxItems},()=>({active:false,kind:0,team:0,x:0,y:0,vx:0,vy:0,rot:0,vr:0,frenzy:false,peaked:false,seq:0}));
 const queue:Launch[]=Array.from({length:KR.maxLaunch},()=>({on:false,at:0,kind:0,team:0,x:0,vx:0,vy:0,frenzy:false}));
 const events:KitEvent[]=Array.from({length:KR.maxEvents},()=>({type:'toss' as KitEventType,x:0,y:0,a:0,b:0,c:0,d:0,ang:0}));
 const slots:Slot[]=Array.from({length:8},()=>({dt:0,x0:0,x1:0,apex:0,role:0 as 0|1|2|3}));
 const strokes:KitStroke[]=[0,1,2,3].map(()=>({count:0,last:-9,travel:0,deadUntil:0,x:0,y:0}));
 const s:KitRushState={seed:opts.seed,daily:!!opts.daily,h,t:0,real:0,score:0,lives:KR.lives,team:perm[0],teams:perm,nTeams:2,wave:0,level:0,
  nextWaveAt:KR.readyBeat,switchAt:int(KR.switchFirst[0],KR.switchFirst[1]),specialAt:int(KR.specialEvery[0],KR.specialEvery[1]),beat:KR.readyBeat,safe:0,clean:0,
  frenzy:0,slow:0,armband:0,frenzyNext:0,subs:0,subAt:KR.cleanForSub,over:false,
  stats:{sliced:0,missed:0,rival:0,whistle:0,bestCombo:0,bestClean:0,waves:0,switches:0,specials:0,swipes:0},
  items,events,eventHead:0,eventCount:0};
 let seq=0,specialTurn=int(0,2);
 function emit(type:KitEventType,x=0,y=0,a=0,b=0,c=0,d=0,ang=0){
  const e=events[(s.eventHead+s.eventCount)%KR.maxEvents];e.type=type;e.x=x;e.y=y;e.a=a;e.b=b;e.c=c;e.d=d;e.ang=ang;
  if(s.eventCount<KR.maxEvents)s.eventCount++;else s.eventHead=(s.eventHead+1)%KR.maxEvents;
 }
 /** The view calls this each frame: handles every pending event in order, then the ring is empty. */
 function drain(fn:(e:KitEvent)=>void){while(s.eventCount>0){const e=events[s.eventHead];s.eventHead=(s.eventHead+1)%KR.maxEvents;s.eventCount--;fn(e);}}
 emit('ready',50,h*.4,s.team);

 const flightTime=()=>KR.flight*Math.max(KR.flightFloor,Math.pow(KR.flightStep,s.level));
 function queueLaunch(at:number,kind:number,team:number,x0:number,x1:number,apexFrac:number,frenzy=false){
  for(const q of queue)if(!q.on){const T=flightTime()*(frenzy?.8:1),g=8*KR.apexRef*h/(T*T),apex=Math.max(.3,Math.min(.8,apexFrac))*h+KR.r,vy=-Math.sqrt(2*g*apex),up=-vy/g;
   q.on=true;q.at=at;q.kind=kind;q.team=team;q.x=x0;q.vx=(x1-x0)/up;q.vy=vy;q.frenzy=frenzy;return;}
 }
 const gravity=(frenzy:boolean)=>{const T=flightTime()*(frenzy?.8:1);return 8*KR.apexRef*h/(T*T);};
 function launch(q:Launch){
  q.on=false;for(const it of items)if(!it.active){it.active=true;it.kind=q.kind;it.team=q.team;it.x=q.x;it.y=h+KR.r;it.vx=q.vx;it.vy=q.vy;it.rot=(q.x*.37)%6.28;it.vr=(q.vx>=0?1:-1)*(1.4+((q.x*7.3)%1.6));it.frenzy=q.frenzy;it.peaked=false;it.seq=++seq;
   emit('toss',q.x,h,q.kind,q.team);return;}
 }
 function rivalTeam(){const n=s.nTeams-1;let k=int(0,n-1);for(let i=0;i<s.nTeams;i++){const t=s.teams[i];if(t===s.team)continue;if(k--===0)return t;}return s.teams[s.teams[0]===s.team?1:0];}
 function pickShape(n:number):Shape{
  const L=s.level;for(let tries=0;tries<12;tries++){const sh=SHAPES[int(0,SHAPES.length-1)];
   if(sh==='single'&&L>1)continue;if((sh==='wall'||sh==='cross')&&L<1)continue;if(sh==='sandwich'&&s.wave<KR.whistleFrom)continue;if(sh==='fountain'&&L<2)continue;
   if(sh==='pair'&&n>3)continue;return sh;}
  return 'line';
 }
 function buildWave(){
  const w=s.wave,L=s.level=Math.max(0,Math.floor((w-KR.teach)/KR.wavesPerLevel));
  s.nTeams=L>=KR.fourthTeamLevel?4:L>=KR.thirdTeamLevel?3:2;
  if(!s.teams.slice(0,s.nTeams).includes(s.team)){const i=s.teams.indexOf(s.team),t=s.teams[0];s.teams[0]=s.team;s.teams[i]=t;}
  let n=0,shape:Shape='single';const at=s.t;
  const put=(dt:number,x0:number,x1:number,apex:number,role:0|1|2|3=0)=>{const sl=slots[n++];sl.dt=dt;sl.x0=x0;sl.x1=x1;sl.apex=apex;sl.role=role;};
  if(w===0)put(0,50,50,.62,1);
  else if(w===1){put(0,30,34,.6,1);put(0,70,66,.6,1);}
  else if(w===2){put(0,26,24,.66,1);put(.1,74,76,.5,2);}
  else{
   const max=Math.min(6,3+Math.floor(L/2)),count=int(L>=2?2:1,max);shape=pickShape(count);
   const apex=.52+rand()*.26,dir=rand()<.5?1:-1;
   if(shape==='single')put(0,int(28,72),int(30,70),apex,1);
   else if(shape==='pair'){put(0,28,32,apex);put(0,72,68,apex);}
   else if(shape==='line'){const c=Math.max(3,Math.min(5,count));for(let i=0;i<c;i++){const x=14+72*i/(c-1);put(0,x,x,apex);}}
   else if(shape==='fan'){const c=Math.max(3,Math.min(5,count));for(let i=0;i<c;i++)put(0,46+i*2,12+76*i/(c-1),apex+.06*Math.sin(Math.PI*i/(c-1)));}
   else if(shape==='vee'){const c=count%2?Math.max(3,Math.min(5,count)):Math.min(5,count+1);for(let i=0;i<c;i++){const k=Math.abs(i-(c-1)/2)/((c-1)/2),x=14+72*i/(c-1);put(0,x,x,.46+.3*k);}}
   else if(shape==='stairs'){const c=Math.max(3,Math.min(6,count));for(let i=0;i<c;i++){const k=dir>0?i:c-1-i,x=12+76*k/(c-1);put(i*.16,x,x,.42+.4*i/(c-1));}}
   else if(shape==='cross'){const c=Math.max(2,Math.min(6,count+(count%2)));for(let i=0;i<c;i++){const left=i%2===0;put(Math.floor(i/2)*.22,left?6:94,left?78:22,apex-.05*Math.floor(i/2),left?1:0);}}
   else if(shape==='wall'){const c=count>=5?5:3;for(let i=0;i<c;i++){const x=16+68*i/(c-1);put(0,x,x,apex,i===(c-1)/2?2:1);}}
   else if(shape==='sandwich'){put(0,24,24,apex,1);put(0,50,50,apex,3);put(0,76,76,apex,1);}
   else{const c=Math.max(3,Math.min(6,count));for(let i=0;i<c;i++)put(i*.13,50,50+dir*(i%2?-1:1)*(10+i*6),apex+.03*(i%3));}
  }
  // roles: free slots become own or rival; one may become a whistle, one own slot may carry a special
  const rivalP=Math.min(KR.rivalMax,KR.rivalShare+KR.rivalStep*L),whistleP=w<KR.whistleFrom?0:Math.min(KR.whistleMax,KR.whistle+KR.whistleStep*L);
  let own=0;for(let i=0;i<n;i++){const sl=slots[i];if(sl.role===0)sl.role=rand()<rivalP?2:1;if(sl.role===1)own++;}
  if(own===0&&n>0){slots[int(0,n-1)].role=1;own=1;}
  if(whistleP>0&&shape!=='sandwich'&&n>=2&&rand()<whistleP){const k=int(0,n-1);if(!(slots[k].role===1&&own===1)){if(slots[k].role===1)own--;slots[k].role=3;}}
  let special=-1;if(w>=s.specialAt&&own>=1&&s.frenzy<=0){special=KIND.golden+(specialTurn++%3);s.specialAt=w+int(KR.specialEvery[0],KR.specialEvery[1]);}
  let last=0;for(let i=0;i<n;i++){const sl=slots[i];let kind=int(0,KIT_KINDS-1),team=s.team;
   if(sl.role===2)team=rivalTeam();else if(sl.role===3){kind=KIND.whistle;team=-1;}else if(special>=0){kind=special;team=-1;special=-1;}
   queueLaunch(at+sl.dt,kind,team,sl.x0,sl.x1,sl.apex);if(sl.dt>last)last=sl.dt;}
  s.wave++;s.stats.waves++;
  const gap=Math.max(KR.gapFloor,KR.gap*Math.pow(KR.gapStep,L));
  s.nextWaveAt=at+last+gap+(w<KR.teach?.35:0);
 }
 function clearAir(){for(const it of items)if(it.active){it.active=false;emit('puff',it.x,it.y,0,0,it.kind,it.team);}for(const q of queue)q.on=false;}
 function doSwitch(){
  const old=s.team;let next=rivalTeam();if(next===old)next=s.teams.find(t=>t!==old)??old;
  clearAir();s.team=next;s.stats.switches++;s.beat=KR.beat;s.nextWaveAt=s.t+.05;s.switchAt=s.wave+int(KR.switchEvery[0],KR.switchEvery[1]);
  for(const k of strokes){k.count=0;k.deadUntil=Math.max(k.deadUntil,s.real+KR.beat+.15);}
  emit('switch',50,h*.4,next,old);
 }
 function bank(k:KitStroke){
  if(k.count>=2){const bonus=k.count>=KR.callBonusFrom?k.count*KR.callBonus*(s.armband>0?2:1):0;s.score+=bonus;if(k.count>s.stats.bestCombo)s.stats.bestCombo=k.count;emit('call',k.x,k.y,k.count,bonus);}
  k.count=0;
 }
 function loseLife(whistle:boolean,x:number,y:number){
  s.lives--;s.clean=0;s.subAt=KR.cleanForSub+KR.subStep*s.subs;if(whistle)s.stats.whistle++;else s.stats.rival++;
  for(const k of strokes){k.count=0;k.deadUntil=Math.max(k.deadUntil,s.real+.4);}
  emit('foul',x,y,whistle?1:0,s.lives);clearAir();s.safe=KR.safe;s.nextWaveAt=s.t+KR.safe;
  if(s.lives<=0){s.over=true;emit('over',x,y,s.score);}
 }
 function hit(it:KitItem,k:KitStroke,ang:number){
  const special=it.kind>=KIND.golden&&!it.frenzy,hazard=it.kind===KIND.whistle||(it.kind<KIT_KINDS&&it.team!==s.team);
  if(hazard){if(s.safe>0||s.frenzy>0)return;it.active=false;loseLife(it.kind===KIND.whistle,it.x,it.y);return;}
  it.active=false;k.count++;k.last=s.real;k.x=it.x;k.y=it.y;
  const base=it.frenzy?KR.frenzyPoints:KR.points*Math.min(k.count,KR.comboCap),pts=base*(s.armband>0?2:1);
  s.score+=pts;s.stats.sliced++;
  if(!it.frenzy){s.clean++;if(s.clean>s.stats.bestClean)s.stats.bestClean=s.clean;if(s.clean>=s.subAt){if(s.lives<KR.lives){s.lives++;s.subs++;emit('sub',it.x,it.y,s.lives);}s.subAt=s.clean+KR.cleanForSub+KR.subStep*s.subs;}}
  emit('slice',it.x,it.y,pts,k.count,it.kind,it.frenzy?-2:it.team,ang);
  if(special){s.stats.specials++;
   if(it.kind===KIND.golden){s.frenzy=KR.frenzy;s.frenzyNext=s.t+.25;for(const o of items)if(o.active&&(o.kind===KIND.whistle||(o.kind<KIT_KINDS&&o.team!==s.team))){o.active=false;emit('puff',o.x,o.y,0,0,o.kind,o.team);}for(const q of queue)q.on=false;}
   else if(it.kind===KIND.stopwatch)s.slow=KR.slow;else s.armband=KR.armband;
   emit('special',it.x,it.y,it.kind);}
 }
 /** A finger moved from (x0,y0) to (x1,y1) in field units. `pointer` 0-3 keeps each finger's own combo. */
 function swipe(pointer:number,x0:number,y0:number,x1:number,y1:number){
  if(s.over||s.beat>0)return;const k=strokes[pointer&3],dx=x1-x0,dy=y1-y0,len2=dx*dx+dy*dy;k.travel+=Math.sqrt(len2);
  if(s.real<k.deadUntil||k.travel<KR.minTravel||len2<1e-6)return;const ang=Math.atan2(dy,dx),easy=s.wave<=KR.teach+KR.wavesPerLevel?KR.easySlop:0;
  for(let i=0;i<items.length;i++){const it=items[i];if(!it.active)continue;
   const own=it.kind>=KIND.golden||(it.kind<KIT_KINDS&&it.team===s.team),R=KR.r+(own?KR.ownSlop+easy:KR.hazardSlop);
   let t=((it.x-x0)*dx+(it.y-y0)*dy)/len2;t=t<0?0:t>1?1:t;const px=x0+dx*t-it.x,py=y0+dy*t-it.y;
   if(px*px+py*py<=R*R){hit(it,k,ang);if(s.real<k.deadUntil||s.over)return;}}
 }
 function beginStroke(pointer:number){const k=strokes[pointer&3];if(k.count>0)bank(k);k.count=0;k.travel=0;k.deadUntil=0;k.last=-9;s.stats.swipes++;}
 function endStroke(pointer:number){const k=strokes[pointer&3];bank(k);k.deadUntil=Infinity;}
 function step(dtReal:number){
  if(s.over)return;const dr=Math.min(.05,Math.max(0,dtReal));s.real+=dr;
  for(const k of strokes)if(k.count>0&&s.real-k.last>KR.comboLink)bank(k);
  if(s.safe>0)s.safe-=dr;
  if(s.beat>0){s.beat-=dr;return;}
  const dt=dr*(s.slow>0?KR.slowScale:1);s.t+=dt;
  if(s.slow>0){s.slow-=dr;if(s.slow<=0)emit('effectEnd',0,0,KIND.stopwatch);}
  if(s.armband>0){s.armband-=dr;if(s.armband<=0)emit('effectEnd',0,0,KIND.armband);}
  if(s.frenzy>0){s.frenzy-=dr;
   if(s.frenzy<=0){emit('effectEnd',0,0,KIND.golden);s.nextWaveAt=s.t+.9;}
   else if(s.frenzy>.7&&s.t>=s.frenzyNext){s.frenzyNext=s.t+KR.frenzyGap;const x0=int(12,88);queueLaunch(s.t,KIND.golden,-1,x0,x0+int(-14,14),.45+rand()*.35,true);}}
  else if(s.t>=s.nextWaveAt){if(s.wave>=s.switchAt&&s.wave>KR.teach)doSwitch();else buildWave();}
  for(const q of queue)if(q.on&&s.t>=q.at)launch(q);
  for(let i=0;i<items.length;i++){const it=items[i];if(!it.active)continue;const g=gravity(it.frenzy);
   it.vy+=g*dt;it.x+=it.vx*dt;it.y+=it.vy*dt;it.rot+=it.vr*dt;if(it.vy>0)it.peaked=true;
   if(it.x<KR.r){it.x=KR.r;it.vx=Math.abs(it.vx)*.6;}else if(it.x>KR.fieldW-KR.r){it.x=KR.fieldW-KR.r;it.vx=-Math.abs(it.vx)*.6;}
   if(it.peaked&&it.y>h+KR.r+2){it.active=false;if(it.kind<KIT_KINDS&&it.team===s.team){s.clean=0;s.subAt=KR.cleanForSub+KR.subStep*s.subs;s.stats.missed++;emit('miss',it.x,h);}}}
 }
 return {state:s,step,swipe,beginStroke,endStroke,drain,strokes};
}

/** Coins for a run (lib/economy.ts cap): 1 per 150 points. */
export const kitRushCoins=(score:number)=>Math.floor(Math.max(0,score)/150);
/** What the results card says about the next medal: the near-miss line. */
export function nextMedalLine(score:number):{medal:number;next:string|null;gap:number}{
 const m=medalFor(score);if(m>=KR.medals.length)return {medal:m,next:null,gap:0};return {medal:m,next:MEDAL_NAMES[m],gap:KR.medals[m]-score};
}

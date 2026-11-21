/**
 * Keepy-Uppy Beat rules (Nov 21 2026, docs/arcade-aaa/keepyuppy-direction.md): a rhythm game about juggling a football. Pure and
 * deterministic: no clock, no randomness, no DOM. The shell passes SONG TIME in seconds (0 = the first beat of bar 1; the count-in is
 * negative) taken from the audio clock, already corrected by the player's calibration offset.
 *
 * One ball, so one touch at a time: four pads = four body parts (lane 0 left foot, 1 thigh, 2 head, 3 right foot). Charts are written
 * in STRONG / WEAK foot (S / W) and mapped to left / right by the foot the player picked, so a left-footer gets the mirrored chart and
 * the weak-foot sections always land on the player's weaker foot.
 * Chart text: bars split by spaces; a bar is 4, 8 or 16 slots. `.` rest, `S` strong foot, `W` weak foot, `T` thigh, `H` head,
 * `A`/`a` Around the World (swipe a circle, strong / weak foot), `K`/`k` Heel Flick (swipe up), `X`/`x` Crossover (swipe sideways),
 * `N` Neck Stall (hold; each `=` after it holds one more slot), `[TST]` Thigh-Foot-Thigh and `[HHH]` Seal Taps (tap tricks).
 * Teaches (AGENTS.md): a soft touch buys time (the gap to the next touch IS the height of the pop: view.ts draws the real parabola),
 * both feet (weak-foot accuracy is counted on its own), juggling rhythm, and the names of real tricks.
 */
import {TRACKS,type Track} from './charts';

export type Part='S'|'W'|'T'|'H';
export type TrickId='tft'|'seal'|'stall'|'atw'|'heel'|'cross';
export type Kind='tap'|'hold'|'swipe';
export type Dir=''|'any'|'up'|'side';
export type Grade='sweet'|'good'|'early'|'late'|'wrong'|'slip'|'drop';
export type Foot='L'|'R';
export type TwistId='weak'|'mirror'|'nothigh'|'low'|'speedup';

/** Timing windows are seconds either side of the beat. sweet / good keep the combo; early / late keep the ball up but break the combo;
 *  past `ok` the ball is dropped. Chart limits (min*, after*, maxGap) are what tests/keepyuppy-core.cjs holds every chart to. */
export const KU={sweet:.055,good:.11,ok:.17,calibWindow:.3,lives:3,regain:8,swipeWait:.32,holdSlack:.2,
 minGap:.2,minSameLane:.3,minSameThumb:.25,afterSwipe:.4,afterHold:.2,maxGap:1.6,
 pts:{sweet:100,good:60,early:20,late:20,slip:20,wrong:0,drop:0} as Record<Grade,number>,
 weight:{sweet:1,good:.8,early:.4,late:.4,slip:.4,wrong:0,drop:0} as Record<Grade,number>,
 trickBonus:150,comboStep:10,comboMax:10,clearBonus:300,stars:[.4,.7,.88],unlock:[0,1,3,5,8,11],trickNeed:5,
 medals:[4000,10000,20000],scoreMax:40000,speedUp:1.12,calibBpm:100,calibTaps:8} as const;
export const MEDAL_NAMES=['Bronze','Silver','Gold'] as const;
export const medalFor=(score:number)=>{let m=0;for(const v of KU.medals)if(score>=v)m++;return m;};
/** Kid words for each grade (the view prints them). */
export const GRADE_WORD:Record<Grade,string>={sweet:'SWEET!',good:'GOOD',early:'EARLY',late:'LATE',wrong:'OTHER PAD!',slip:'SLIPPED',drop:'DROPPED'};
export const LANE_NAME=['Left foot','Thigh','Head','Right foot'] as const;
export const clean=(g:Grade|'')=>g==='sweet'||g==='good';

export type TrickInfo={id:TrickId;name:string;how:string;keys:string;fact:string;color:string};
/** The Trick Book. Every name is a real juggling move. `how` is the 10-second lesson's line. */
export const TRICKS:readonly TrickInfo[]=[
 {id:'tft',name:'Thigh-Foot-Thigh',how:'Three quick touches: thigh, foot, thigh. Tap the pads in that order.',keys:'tap, tap, tap',fact:'Changing from thigh to foot and back teaches you to judge the height of each touch.',color:'#ffc83a'},
 {id:'seal',name:'Seal Taps',how:'Three headers in a row. Tap the head pad three times, on the beat.',keys:'tap, tap, tap',fact:'Named after a seal with a ball on its nose. Use your forehead, eyes open, and push up with your legs, not your neck.',color:'#8f78b8'},
 {id:'stall',name:'Neck Stall',how:'Catch the ball on the back of your neck. Hold the head pad down until the bar is full.',keys:'hold (key: hold J)',fact:'Bend forward, look up and make a cradle between your shoulders. The ball sits still.',color:'#19b5a5'},
 {id:'atw',name:'Around the World',how:'Your foot circles the ball in the air. Swipe a circle on the foot pad.',keys:'swipe a circle (keys: Space + foot key)',fact:'Flick the ball up softly, circle it with your foot, and meet it again on the way down.',color:'#ff8a3c'},
 {id:'heel',name:'Heel Flick',how:'Flick the ball up from behind with your heel. Swipe UP on the foot pad.',keys:'swipe up (keys: Space + foot key)',fact:'The ball goes over your head from behind. Turn your head to find it again.',color:'#f0452e'},
 {id:'cross',name:'Crossover',how:'One leg crosses over the ball as it rises. Swipe SIDEWAYS on the foot pad.',keys:'swipe sideways (keys: Space + foot key)',fact:'Small, soft touches leave you time to cross a leg over the ball.',color:'#5aa9e6'},
];
export const TRICK_IDS:readonly TrickId[]=TRICKS.map(t=>t.id);
export const trickInfo=(id:TrickId)=>TRICKS.find(t=>t.id===id)!;

export type TwistInfo={id:TwistId;name:string;line:string};
export const TWISTS:readonly TwistInfo[]=[
 {id:'weak',name:'Weak foot only',line:'Every foot touch is on your weaker foot today.'},
 {id:'mirror',name:'Swap feet',line:'Your feet swap jobs today: strong becomes weak.'},
 {id:'nothigh',name:'No thighs',line:'Feet and head only: every thigh touch is a header today.'},
 {id:'low',name:'Keep it low',line:'No headers today: every header is a thigh touch.'},
 {id:'speedup',name:'Fast finish',line:'The last third of the track is faster.'},
];
export const twistInfo=(id:TwistId)=>TWISTS.find(t=>t.id===id)!;

/** Feats for a future cross-arcade weekly card (not built here): ids only, earned once, kept in the save. */
export type FeatId='first'|'combo25'|'combo50'|'full'|'sweet10'|'weak80'|'weak95'|'comeback'|'trick3'|'daily3'|'stars9'|'stars18'|'book';
export const KU_FEATS:readonly {id:FeatId;name:string;how:string}[]=[
 {id:'first',name:'Kept it up',how:'Finish a track.'},
 {id:'combo25',name:'25 touches',how:'25 clean touches in a row.'},
 {id:'combo50',name:'50 touches',how:'50 clean touches in a row.'},
 {id:'full',name:'Never dropped',how:'Finish a track with every touch Sweet or Good.'},
 {id:'sweet10',name:'Sweet ten',how:'Ten Sweet touches in a row.'},
 {id:'weak80',name:'Both feet',how:'Weak-foot score of 80 or more on a track.'},
 {id:'weak95',name:'Two-footed',how:'Weak-foot score of 95 or more on a track.'},
 {id:'comeback',name:'Come back',how:'Win a ball back and finish the track.'},
 {id:'trick3',name:'Show-off',how:'Land three different tricks in one track.'},
 {id:'daily3',name:'Daily three',how:'Three stars on a Track of the Day.'},
 {id:'stars9',name:'Nine stars',how:'Nine stars in total.'},
 {id:'stars18',name:'All the stars',how:'Three stars on every track.'},
 {id:'book',name:'Trick Book full',how:'Fill every card in the Trick Book.'},
];
export const KU_FEAT_IDS:readonly FeatId[]=KU_FEATS.map(f=>f.id);

/* ---- charts ---- */
type Tok={part:Part;kind:Kind;dir:Dir;trick:TrickId|''};
const tok=(part:Part,kind:Kind='tap',dir:Dir='',trick:TrickId|''=''):Tok=>({part,kind,dir,trick});
const TOKEN:Record<string,Tok>={S:tok('S'),W:tok('W'),T:tok('T'),H:tok('H'),A:tok('S','swipe','any','atw'),a:tok('W','swipe','any','atw'),K:tok('S','swipe','up','heel'),k:tok('W','swipe','up','heel'),
 X:tok('S','swipe','side','cross'),x:tok('W','swipe','side','cross'),N:tok('H','hold','','stall')};
export type RawNote={beat:number;len:number;part:Part;kind:Kind;dir:Dir;trick:TrickId|'';group:number};
/** Chart text -> notes in beats. Throws on a malformed bar, so a typo in a chart fails the test, not the player. */
export function parseChart(src:string):{notes:RawNote[];bars:number}{
 const out:RawNote[]=[],bars=src.trim().split(/\s+/);let group=0,open=-1;
 bars.forEach((bar,b)=>{const n=bar.replace(/[[\]]/g,'').length;if(n!==4&&n!==8&&n!==16)throw new Error(`bar ${b+1} has ${n} slots`);let slot=0;
  for(const ch of bar){
   if(ch==='['){if(open>=0)throw new Error(`bar ${b+1}: [ inside [`);open=out.length;group++;continue;}
   if(ch===']'){if(open<0)throw new Error(`bar ${b+1}: ] without [`);const g=out.slice(open),sig=g.map(x=>x.part==='W'?'S':x.part).join(''),id:TrickId|''=sig==='TST'?'tft':sig==='HHH'?'seal':'';
    if(!id||g.some(x=>x.kind!=='tap'))throw new Error(`bar ${b+1}: unknown trick ${sig}`);for(const x of g){x.trick=id;x.group=group;}open=-1;continue;}
   const beat=b*4+slot*4/n;slot++;if(ch==='.')continue;
   if(ch==='='){const last=out[out.length-1];if(!last||last.kind!=='hold')throw new Error(`bar ${b+1}: = without N`);last.len+=4/n;continue;}
   const k=TOKEN[ch];if(!k)throw new Error(`bar ${b+1}: unknown token ${ch}`);if(open>=0&&k.kind!=='tap')throw new Error(`bar ${b+1}: only taps inside [ ]`);
   out.push({beat,len:k.kind==='hold'?4/n:0,part:k.part,kind:k.kind,dir:k.dir,trick:k.trick,group:open>=0?group:k.trick?++group:0});}
  if(open>=0)throw new Error(`bar ${b+1}: [ not closed`);});
 return {notes:out,bars:bars.length};
}
/** A daily twist rewrites the parts (never the rhythm, except the fast finish). Tap tricks that no longer spell a trick lose their name. */
export function applyTwist(notes:RawNote[],twist:TwistId|''):RawNote[]{
 if(!twist||twist==='speedup')return notes.map(n=>({...n}));
 const out=notes.map(n=>{const m={...n};
  if(twist==='weak'&&m.part==='S')m.part='W';else if(twist==='mirror'&&(m.part==='S'||m.part==='W'))m.part=m.part==='S'?'W':'S';
  else if(twist==='nothigh'&&m.part==='T')m.part='H';else if(twist==='low'&&m.part==='H'&&m.kind==='tap')m.part='T';return m;});
 for(const m of out)if(m.kind==='tap'&&m.trick){const g=out.filter(x=>x.group===m.group),sig=g.map(x=>x.part==='W'?'S':x.part).join('');if(!((m.trick==='tft'&&sig==='TST')||(m.trick==='seal'&&sig==='HHH')))for(const x of g){x.trick='';x.group=0;}}
 return out;
}
export const laneOf=(part:Part,strong:Foot)=>part==='T'?1:part==='H'?2:(part==='S')===(strong==='L')?0:3;
export type Note=RawNote&{i:number;lane:number;t:number;tEnd:number;
 /** 0 waiting, 1 pressed (a hold being held, a swipe waiting for its swipe), 2 judged */st:0|1|2;grade:Grade|'';pressT:number};
export type Chart={notes:Note[];bpm:number;bars:number;/** song seconds: the count-in starts at `start` (negative), the run ends at `end` */start:number;end:number;
 /** the beat where the fast finish starts (Infinity without it) and its tempo */speedAt:number;bpm2:number;weakTotal:number;tricks:TrickId[]};
export const timeOfBeat=(c:{bpm:number;speedAt:number;bpm2:number},beat:number)=>beat<=c.speedAt?beat*60/c.bpm:c.speedAt*60/c.bpm+(beat-c.speedAt)*60/c.bpm2;
export const beatAtTime=(c:{bpm:number;speedAt:number;bpm2:number},t:number)=>{const ts=c.speedAt*60/c.bpm;return t<=ts?t*c.bpm/60:c.speedAt+(t-ts)*c.bpm2/60;};
export function buildChart(src:string,bpm:number,strong:Foot,twist:TwistId|''=''):Chart{
 const p=parseChart(src),raw=applyTwist(p.notes,twist),speedAt=twist==='speedup'?Math.floor(p.bars*2/3)*4:Infinity,bpm2=Math.round(bpm*KU.speedUp),tempo={bpm,speedAt,bpm2};
 const notes:Note[]=raw.map((n,i)=>({...n,i,lane:laneOf(n.part,strong),t:timeOfBeat(tempo,n.beat),tEnd:timeOfBeat(tempo,n.beat+n.len),st:0,grade:'',pressT:0}));
 const last=notes[notes.length-1],end=Math.max(timeOfBeat(tempo,p.bars*4),last?last.tEnd+.5:0)+.6;
 return {notes,bpm,bars:p.bars,start:-4*60/bpm,end,speedAt,bpm2,weakTotal:notes.filter(n=>n.part==='W').length,tricks:TRICK_IDS.filter(id=>notes.some(n=>n.trick===id))};
}
const thumb=(lane:number)=>lane<2?0:1;
/** Why a chart could not be played with two thumbs (empty = fine). Checked for both feet and every daily twist. */
export function chartProblems(c:Chart):string[]{
 const out:string[]=[],N=c.notes;
 for(let i=1;i<N.length;i++){const a=N[i-1],b=N[i],from=a.kind==='hold'?a.tEnd:a.t,gap=b.t-from,at=`note ${i} (beat ${b.beat})`,e=1e-6;
  if(gap<KU.minGap-e)out.push(`${at}: ${Math.round(gap*1000)} ms after the last touch`);
  if(a.kind==='hold'&&gap<KU.afterHold-e)out.push(`${at}: too soon after a stall`);
  if(a.kind==='swipe'&&gap<KU.afterSwipe-e)out.push(`${at}: too soon after a swipe`);
  if(a.lane===b.lane&&gap<KU.minSameLane-e)out.push(`${at}: the same pad twice in ${Math.round(gap*1000)} ms`);
  if(thumb(a.lane)===thumb(b.lane)&&gap<KU.minSameThumb-e)out.push(`${at}: the same thumb twice in ${Math.round(gap*1000)} ms`);
  if(gap>KU.maxGap+e)out.push(`${at}: ${gap.toFixed(2)} s with no touch`);}
 for(const n of N)if(n.kind==='hold'&&n.tEnd-n.t<.5)out.push(`note ${n.i}: a stall shorter than half a second`);
 return out;
}

/** The 10-second lesson for a trick: the move three times, slowly, with nothing to lose. */
export function lessonSource(trick:TrickId,fast:boolean):string{
 switch(trick){
  case 'tft':return fast?'[T.S.T.].. [T.S.T.].. [T.W.T.]..':'[TST]..S.. [TST]..S.. [TWT]..W..';
  case 'seal':return '[H.H.H.].. [H.H.H.].. [H.H.H.]..';
  case 'stall':return 'N=====.. N=====.. N===....';
  case 'atw':return 'A...S... A...S... A...S...';
  case 'heel':return 'K...S... K...S... K...S...';
  default:return 'X...W... X...W... X...W...';}
}
export const lessonBpm=(trackBpm:number)=>Math.min(100,trackBpm);
export const CALIB_SOURCE='S.S.S.S. S.S.S.S.';
/** Verifier (Nov 21 2026): the guided first eight touches, shown once before the first track: every pad twice, slowly. */
export const GUIDE_SOURCE='S.S. W.W. T.T. H.H.',GUIDE_BPM=80;

/* ---- the day's track ---- */
export function keepyDailySeed(day:string){let h=0x811c9dc5;const s='keepyuppy:'+day;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return 1+h%2_000_000_000;}
/** Every (track, twist) pair that is still a fair chart for both feet and really changes the track. Only the first three tracks (verifier, Nov 21 2026: was four; Cage Night with a twist finished by a careful first-timer about 1 run in 7): the day's track must be kind to a new player. */
export const DAILY_POOL:readonly {track:number;twist:TwistId}[]=(()=>{const out:{track:number;twist:TwistId}[]=[];
 TRACKS.slice(0,3).forEach((tr,track)=>{const base=JSON.stringify(parseChart(tr.chart).notes);for(const tw of TWISTS){
  const changed=tw.id==='speedup'||JSON.stringify(applyTwist(parseChart(tr.chart).notes,tw.id))!==base;
  if(changed&&(['L','R'] as const).every(f=>chartProblems(buildChart(tr.chart,tr.bpm,f,tw.id)).length===0))out.push({track,twist:tw.id});}});return out;})();
/** The track first (so every track gets its days), then one of its twists. */
export function dailyPick(seed:number){const tracks=[...new Set(DAILY_POOL.map(p=>p.track))],track=tracks[seed%tracks.length],tw=DAILY_POOL.filter(p=>p.track===track);return tw[Math.floor(seed/7)%tw.length];}

/* ---- a run ---- */
export type KuEvent={type:'press'|'hit'|'drop'|'trick'|'life'|'combo'|'stray'|'over';/** note index */i:number;grade:Grade|'';points:number;/** life: lives now. combo: the count. over: 1 finished, 0 out. trick: index in TRICKS */a:number;lane:number};
export type KuMode='track'|'lesson'|'calib'|'guide';
export type KuOpts={strong:Foot;track?:number;twist?:TwistId|'';lesson?:TrickId;calib?:boolean;/** the guided first touches: the ball waits in its ring until the right pad is tapped */guide?:boolean};
export type Keepy=ReturnType<typeof createKeepy>;
export function createKeepy(o:KuOpts){
 const mode:KuMode=o.guide?'guide':o.calib?'calib':o.lesson?'lesson':'track',track:Track=TRACKS[Math.max(0,Math.min(TRACKS.length-1,o.track??0))];
 const chart=mode==='guide'?buildChart(GUIDE_SOURCE,GUIDE_BPM,o.strong):mode==='calib'?buildChart(CALIB_SOURCE,KU.calibBpm,o.strong):mode==='lesson'?buildChart(lessonSource(o.lesson!,track.bpm>120),lessonBpm(track.bpm),o.strong):buildChart(track.chart,track.bpm,o.strong,o.twist??'');
 const N=chart.notes,free=mode!=='track',balls=mode==='track'?track.balls:KU.lives,win=mode==='calib'?KU.calibWindow:KU.ok;
 const s={mode,t:chart.start,score:0,combo:0,bestCombo:0,lives:balls,cleanRun:0,sweetRun:0,bestSweet:0,base:0,over:false,out:false,sum:0,judged:0,weakSum:0,weakN:0,regained:0,stray:0,
  counts:{sweet:0,good:0,early:0,late:0,wrong:0,slip:0,drop:0} as Record<Grade,number>,tricks:{} as Partial<Record<TrickId,number>>,/** calibration: tap time minus beat time, seconds */offsets:[] as number[]};
 const q:KuEvent[]=[],emit=(type:KuEvent['type'],i:number,grade:Grade|'',points:number,a:number,lane:number)=>{q.push({type,i,grade,points,a,lane});};
 const first=()=>{for(let i=s.base;i<N.length;i++)if(N[i].st===0)return N[i];return undefined;};
 const mult=()=>1+Math.min(KU.comboMax,Math.floor(s.combo/KU.comboStep))*.1;
 function judge(n:Note,grade:Grade){
  if(n.st===2)return;n.st=2;n.grade=grade;s.counts[grade]++;s.judged++;s.sum+=KU.weight[grade];if(n.part==='W'){s.weakN++;s.weakSum+=KU.weight[grade];}
  const pts=free?0:Math.round(KU.pts[grade]*mult());s.score+=pts;
  // a ball is won back by touches that kept it up (Early and Late count here; only Sweet and Good build the combo)
  if(grade!=='drop'&&grade!=='wrong'&&grade!=='slip'){s.cleanRun++;if(!free&&s.cleanRun>=KU.regain){s.cleanRun=0;if(s.lives<balls){s.lives++;s.regained++;emit('life',n.i,grade,0,s.lives,n.lane);}}}else s.cleanRun=0;
  if(clean(grade)){s.combo++;if(s.combo>s.bestCombo)s.bestCombo=s.combo;s.sweetRun=grade==='sweet'?s.sweetRun+1:0;if(s.sweetRun>s.bestSweet)s.bestSweet=s.sweetRun;
   if(!free&&(s.combo===10||s.combo===25||s.combo===50||s.combo===100))emit('combo',n.i,grade,0,s.combo,n.lane);}
  else{s.combo=0;s.sweetRun=0;}
  if(grade==='drop'){if(!free){s.lives--;}emit('drop',n.i,grade,0,s.lives,n.lane);}else emit('hit',n.i,grade,pts,0,n.lane);
  if(n.trick){const g=N.filter(x=>x.group===n.group);if(g.every(x=>x.st===2)&&g.every(x=>clean(x.grade))){s.tricks[n.trick]=(s.tricks[n.trick]??0)+1;const bonus=free?0:Math.round(KU.trickBonus*mult());s.score+=bonus;emit('trick',n.i,grade,bonus,TRICK_IDS.indexOf(n.trick),n.lane);}}
  if(!free&&s.lives<=0&&!s.over){s.over=true;s.out=true;emit('over',n.i,'',0,0,-1);}
 }
 const gradeOf=(d:number):Grade=>{const a=Math.abs(d);return a<=KU.sweet?'sweet':a<=KU.good?'good':d<0?'early':'late';};
 /** Song time moves on: late balls are dropped, a full stall is landed, a swipe that never came slips. */
 function advance(t:number){
  if(s.over)return;if(mode==='guide'){const w=first();if(w&&t>w.t)t=w.t;}s.t=t;
  for(let i=s.base;i<N.length;i++){const n=N[i];if(n.st===2){if(i===s.base)s.base++;continue;}
   if(n.st===0){if(t>n.t+win)judge(n,'drop');else break;}
   else if(n.kind==='hold'){if(t>=n.tEnd)judge(n,n.grade as Grade);}
   else if(t>n.pressT+KU.swipeWait)judge(n,'slip');
   if(s.over)return;if((n.st as number)===2&&i===s.base)s.base++;}
  if(t>=chart.end&&!s.over){s.over=true;const bonus=free?0:KU.clearBonus*stars();s.score+=bonus;emit('over',-1,'',bonus,1,-1);}
 }
 /** A pad goes down at song time t. Returns the grade, 'held' for a press that waits (stall, swipe) or '' for a tap with no ball near. */
 function press(lane:number,t:number):Grade|'held'|''{
  if(s.over)return '';
  if(mode==='guide'){const w=first();if(w&&w.lane===lane&&s.t>=w.t-1e-9){judge(w,'sweet');return 'sweet';}}
  let n0:Note|undefined,n1:Note|undefined;for(let i=s.base;i<N.length&&!n1;i++)if(N[i].st===0){if(!n0)n0=N[i];else n1=N[i];}
  const fits=(n:Note|undefined)=>!!n&&Math.abs(t-n.t)<=win&&(mode==='calib'||n.lane===lane);
  // the nearer of the next two balls that this pad can play; the second one only when it really is the nearer (else: the wrong pad)
  const near1=!!n0&&!!n1&&Math.abs(t-n1.t)<Math.abs(t-n0.t),n=fits(n0)&&fits(n1)?(near1?n1:n0):fits(n0)?n0:fits(n1)&&near1?n1:undefined;
  if(!n){if(mode!=='guide'&&n0&&Math.abs(t-n0.t)<=win&&n0.lane!==lane){judge(n0,'wrong');return 'wrong';}s.stray++;emit('stray',-1,'',0,0,lane);return '';}
  if(n===n1&&n0&&n0.st===0)judge(n0,'drop');if(s.over)return '';
  const grade=gradeOf(t-n.t);if(mode==='calib')s.offsets.push(t-n.t);
  if(n.kind==='tap'){judge(n,grade);return grade;}
  n.st=1;n.grade=grade;n.pressT=t;emit('press',n.i,grade,0,0,n.lane);return 'held';
 }
 /** The thumb swiped on a pad (dir 'any' from the keyboard, where one key does every swipe). */
 function swipe(lane:number,dir:Dir,t:number):boolean{
  const n=N.find(x=>x.st===1&&x.kind==='swipe'&&x.lane===lane);if(!n||s.over)return false;void t;
  judge(n,n.dir==='any'||dir==='any'||dir===n.dir?n.grade as Grade:'slip');return true;
 }
 function release(lane:number,t:number):boolean{
  const n=N.find(x=>x.st===1&&x.kind==='hold'&&x.lane===lane);if(!n||s.over)return false;
  judge(n,t>=n.tEnd-KU.holdSlack?n.grade as Grade:'slip');return true;
 }
 const accuracy=()=>N.length?s.sum/N.length:0;
 function stars(){if(s.out||free)return 0;const a=accuracy();return a>=KU.stars[2]?3:a>=KU.stars[1]?2:a>=KU.stars[0]?1:0;}
 /** Weak-foot score 0-100 over every weak-foot touch in the chart (-1 when the chart has none or the run ended early). */
 const weakScore=()=>chart.weakTotal>0&&!s.out&&s.over?Math.round(100*s.weakSum/chart.weakTotal):-1;
 /** The run's feats (the save adds the ones that need the whole career). */
 function feats(daily:boolean):FeatId[]{
  const f:FeatId[]=[];if(free||!s.over)return f;const done=!s.out,w=weakScore();
  if(done)f.push('first');if(s.bestCombo>=25)f.push('combo25');if(s.bestCombo>=50)f.push('combo50');if(done&&s.counts.sweet+s.counts.good===N.length)f.push('full');if(s.bestSweet>=10)f.push('sweet10');
  if(w>=80&&chart.weakTotal>=6)f.push('weak80');if(w>=95&&chart.weakTotal>=6)f.push('weak95');if(done&&s.regained>0)f.push('comeback');if(Object.keys(s.tricks).length>=3)f.push('trick3');if(daily&&stars()===3)f.push('daily3');
  return f;
 }
 return {state:s,chart,track,mode,balls,press,swipe,release,advance,accuracy,stars,weakScore,feats,mult,drain(cb:(e:KuEvent)=>void){while(q.length)cb(q.shift()!);},
  /** the next ball to land (the first note still waiting) */next:first,
  /** the guide: the ball sitting in its ring, waiting for its pad (undefined when none is waiting) */waiting(){const w=first();return mode==='guide'&&w&&s.t>=w.t-1e-9?w:undefined;}};
}
/** The median tap offset from a calibration run, in ms (the first two taps are warm-up). Null when there were too few taps. */
export function calibOffset(offsets:readonly number[]):number|null{
 const v=offsets.slice(offsets.length>=6?2:0).sort((a,b)=>a-b);if(v.length<4)return null;
 const m=v.length%2?v[(v.length-1)/2]:(v[v.length/2-1]+v[v.length/2])/2;return Math.max(-200,Math.min(200,Math.round(m*1000)));
}
export const keepyCoins=(score:number)=>Math.max(0,Math.min(12,Math.floor(score/2000)));

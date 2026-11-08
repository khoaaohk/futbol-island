// Multiplayer slice 2 (Nov 4 2026; docs/join-live-game-design.md "Multiplayer slice 2"): the wire side of a SHARED live match.
// Pure: no three.js, no DOM, no protocol import (the numbers below match multiplayer/protocol/types.ts MatchKind / MATCH_BTN and are
// checked by tests/join-live-mp.cjs). The owner's phone runs the only MatchSim; every 1/12 s it encodes a snapshot (encodeSnap) into
// ONE reused number array. Friends keep their MatchSim as a puppet: it is never stepped; an 8-frame ring (createSnapBuffer, JITTER) is sampled
// every frame into its players / ball / score (interpolated ~100 ms behind, your own slot dead-reckoned from the newest frame), so the
// unchanged field renderer draws the owner's match. Their controls go the other way as C.Match In (encodeIn / decodeIn), buffered by
// the owner's sim exactly like a local press (humanInputs.writeHumanInput keeps one-shot actions armed for INPUT_BUFFER).
// Teaching purpose: friends on the same pitch see the same pass, the same space and the same goal (teamwork for real).
// Heat: the owner pays one encode + JSON per 83 ms only while a friend is on the field; a puppet pays a lerp per player per frame
// and skips the whole AI step. No per-frame allocation on either side.
import {BEACH_HUMAN_NOTES,type MatchSim} from './matchSim';
import {POWER_SHOT,TRICK_KINDS,type HumanFrame} from './humanInputs';

/** C.Match / S.Match codes and kinds (multiplayer/protocol/types.ts; mirrored here so this module stays protocol-free). */
export const NET={C_MATCH:19,S_MATCH:40,JOIN:0,LEAVE:1,IN:2,SNAP:3,WATCH:4} as const;
export const NET_FIELDS=['7v7','futsal','9v9','11v11','beach'] as const;
export const NET_BTN={pass:1,shoot:2,through:4,tackle:8,jockey:16,sprint:32,call:64,save:128,trick:256,press:512} as const;
/** Snapshot send gap (ms; ~12 Hz) and how far behind the newest snapshot friends draw the match (ms). */
export const SNAP_GAP_MS=83,INTERP_MS=110,IN_GAP_MS=80;
/** Your own slot (a friend's screen): drawn from the newest frame plus its velocity for at most this long (s): a light prediction. */
export const OWN_LEAD_S=.18;
/** Header numbers after [code, kind, field]: seq, flags, score gold, score blue, ball x, y, h, owner, player count. */
const HEAD=9;
/** Longest C.Match Snap frame the relay accepts: MATCH_SNAP_MAX (120, multiplayer/protocol/types.ts) + [code, kind, field]. */
export const SNAP_MAX_LEN=123;
/** …and its JSON size cap (MAX_INBOUND_BYTES): a bigger frame is never sent (connection.encode refuses it), so friends would freeze. */
export const SNAP_MAX_BYTES=512;
/** JSON characters of an integer (no allocation). */
const digits=(v:number)=>{const a=v<0?-v:v;return (v<0?1:0)+(a<10?1:a<100?2:a<1000?3:a<10000?4:a<100000?5:String(a).length);};
export const SNAP_FLAG={restart:1,lofted:2,goal:4,hands:8,/** quick goal reset: the scored ball is faded out */ballHidden:128} as const;
/** Quick goal reset (Nov 5 2026, matchSim GOAL_RESET): the flags number also carries sim.goalReset.serial mod 4 at bits 8-9 (period
 *  keeps bits 4-6), so a friend's screen fades the ball and plays the arrival on the centre spot too. No extra number in the frame;
 *  an older reader ignores the bits (it masks the period with &7). */
export const SNAP_RESET_SHIFT=8;
/** Owner popups on friends' screens (Nov 5 2026): after the targets, ONE packed value per listed human (same order), so the trick
 *  word / "Power shot!" / "Slipped away!" and the trick move on the rig play on every phone. Bits: trick serial mod 8 (0-2), shot
 *  serial mod 8 (3-5), slip serial mod 8 (6-8), trick kind (9-10, TRICK_KINDS), full-power shot (11), aimed shot (12), trick side
 *  left (13). Backward compatible: an older reader stops after the targets; a frame without the values (an older owner) bumps nothing.
 *  Slow motion is never mirrored (a shared field runs at 1x: liveJoinRuntime timeScale). */
export const SNAP_EVENTS={trick:0,shot:3,slip:6,kind:9,power:2048,aimed:4096,left:8192} as const;
const evPack=(h:{trickSerial:number;shotSerial:number;slipSerial:number;trickKind:string;trickSide:number;shotPw:number;shotAimed:boolean})=>
  (h.trickSerial&7)|((h.shotSerial&7)<<3)|((h.slipSerial&7)<<6)|(Math.max(0,TRICK_KINDS.indexOf(h.trickKind as typeof TRICK_KINDS[number]))<<9)|(h.shotPw>=POWER_SHOT.full?SNAP_EVENTS.power:0)|(h.shotAimed?SNAP_EVENTS.aimed:0)|(h.trickSide<0?SNAP_EVENTS.left:0);
/** Keeper + body moves (Nov 5 2026, docs/join-live-game-design.md "Goalkeeper feel + body moves"): a SECOND packed value per listed
 *  human, after the popup values (same order), so a friend sees the new move, the beaten defender's stumble, the keeper's dive and
 *  save and the shoulder challenge. Bits: trick kind high bit (0: TRICK_KINDS index = bits 9-10 of the first value | this << 2),
 *  the trick beat a defender (1), dive serial mod 4 (2-3), dive to sim −x (4), save serial mod 4 (5-6), save kind (7-8: catch /
 *  parry / tip), a big save (9), shoulder serial mod 4 (10-11), shielding now (12). Every value stays far inside the relay's
 *  ±100 000 integer check. Backward compatible both ways: an older reader stops before it (it reads only the first block), and a
 *  frame without it (an older owner) bumps nothing. No protocol or relay change. */
export const SNAP_BODY={kindHi:1,beat:2,dive:2,diveLeft:16,save:5,saveKind:7,big:512,shoulder:10,shield:4096} as const;
const bodyPack=(h:{trickKind:string;trickBeat:string|null;diveSerial:number;diveSide:number;saveSerial:number;saveKind:number;saveBig:boolean;shoulderSerial:number;shield:boolean})=>
  (TRICK_KINDS.indexOf(h.trickKind as typeof TRICK_KINDS[number])>3?SNAP_BODY.kindHi:0)|(h.trickBeat?SNAP_BODY.beat:0)|((h.diveSerial&3)<<SNAP_BODY.dive)|(h.diveSide<0?SNAP_BODY.diveLeft:0)
  |((h.saveSerial&3)<<SNAP_BODY.save)|((h.saveKind&3)<<SNAP_BODY.saveKind)|(h.saveBig?SNAP_BODY.big:0)|((h.shoulderSerial&3)<<SNAP_BODY.shoulder)|(h.shield?SNAP_BODY.shield:0);
/** Tackle wind-up + result (Nov 7 2026, liveMechanics TACKLE_FX; MatchSim.tackleNetBits / netTackle): the BODY value carries the human
 *  tackler's set (bit 13) and his result serial mod 4 (bits 14-15), the POPUP value the result kind (bits 14-15: TACKLE_KINDS steal /
 *  deflect / stumble). Both values stay < 65 536 (the relay's ±100 000 integer check); the byte fit above counts them. No relay or
 *  protocol change; an older reader ignores the bits. */
export const SNAP_TACKLE={winding:8192,serial:14,kind:14} as const;
const NO_AIM=-1000;

/** Owner: write the snapshot of `sim` into `out` as a full C.Match Snap frame [19, 3, field, ...]. `ballH` is the rendered ball
 *  height (m, the field runtime's ball physics). Reuses `out` (length set here). Returns `out`. */
export function encodeSnap(sim:MatchSim,field:number,seq:number,ballH:number,out:number[]):number[]{
  const ids=sim.ids;let n=0;
  out[n++]=NET.C_MATCH;out[n++]=NET.SNAP;out[n++]=field;
  out[n++]=seq%100000;
  out[n++]=(sim.isRestart?SNAP_FLAG.restart:0)|(sim.ball.lofted?SNAP_FLAG.lofted:0)|(sim.goalHold>0?SNAP_FLAG.goal:0)|(sim.keeperHands?SNAP_FLAG.hands:0)|((sim.period&7)<<4)|(sim.goalReset.hidden?SNAP_FLAG.ballHidden:0)|((sim.goalReset.serial&3)<<SNAP_RESET_SHIFT);
  out[n++]=sim.score.gold;out[n++]=sim.score.blue;
  out[n++]=Math.round(sim.ball.x*10);out[n++]=Math.round(sim.ball.y*10);out[n++]=Math.round(Math.max(0,ballH)*100);
  out[n++]=sim.ball.owner?ids.indexOf(sim.ball.owner):-1;out[n++]=ids.length;
  for(let i=0;i<ids.length;i++){const p=sim.players[ids[i]];out[n++]=Math.round(p.x*10);out[n++]=Math.round(p.y*10);out[n++]=Math.round(Math.max(0,p.kick)*100);}
  // The pass / forward assist each human sees (computed by the owner's step; a puppet never steps).
  // The frame must stay within MATCH_SNAP_MAX + 3 numbers (SNAP_MAX_LEN): 11v11 = 12 + 66 leaves room for 14 humans' targets (9v9: 17).
  // More humans than that (a big party on the 11v11, Nov 5 2026) rotate by seq; a puppet keeps a missing human's last targets.
  // Each listed human also carries one popup value (SNAP_EVENTS) and one body value (SNAP_BODY) after the targets: 5 numbers a
  // human (11v11: 8 a frame, 9v9: 11).
  // QA round 1 (Nov 5 2026): the count cap alone let a big party overflow the 512 B cap (9v9 with 11 humans, every slot ≥ 100 u
  // from the line, kicks and serial bits set: up to ~522 B, refused by encode, a frozen match). Fit the listed humans by bytes too,
  // at the costliest human's size (2 + 2 + 2 + 5 + 4 digits + 5 commas at most), so every frame stays ≤ SNAP_MAX_BYTES.
  let used=2+n+2;for(let i=0;i<n;i++)used+=digits(out[i]);// brackets, the commas, the count
  let worst=0;sim.humans.forEach((h,id)=>{const t=sim.humanTargets.get(id);const c=digits(ids.indexOf(id))+digits(t?.pass.id?ids.indexOf(t.pass.id):-1)+digits(t?.forward.id?ids.indexOf(t.forward.id):-1)+digits(evPack(h)|sim.tackleNetBits(id,false))+digits(bodyPack(h)|sim.tackleNetBits(id,true))+5;if(c>worst)worst=c;});
  const H=sim.humans.size,fit=Math.min(H,Math.max(0,Math.floor((SNAP_MAX_LEN-n-1)/5)),worst>0?Math.max(0,Math.floor((SNAP_MAX_BYTES-used)/worst)):H),start=H>fit&&fit>0?(seq*fit)%H:0;
  out[n++]=fit;let j=0;
  for(const id of sim.humans.keys()){const rel=(j++-start+H)%H;if(rel>=fit)continue;const t=sim.humanTargets.get(id);out[n++]=ids.indexOf(id);out[n++]=t?.pass.id?ids.indexOf(t.pass.id):-1;out[n++]=t?.forward.id?ids.indexOf(t.forward.id):-1;}
  j=0;for(const h of sim.humans.values()){const rel=(j++-start+H)%H;if(rel>=fit)continue;out[n++]=evPack(h)|sim.tackleNetBits(h.id,false);}
  j=0;for(const h of sim.humans.values()){const rel=(j++-start+H)%H;if(rel>=fit)continue;out[n++]=bodyPack(h)|sim.tackleNetBits(h.id,true);}
  out.length=n;return out;
}

/** Jitter (QA round 1, Nov 5 2026): the owner sends on a fixed SNAP_GAP_MS schedule and its seq counts every gap, also the skipped
 *  ones (matchLink), so seq × SNAP_GAP_MS is the owner's clock. A friend stamps each frame with it plus the lower envelope of
 *  arrival − seq × gap (it may creep up `creep` ms per ms, so clocks drifting apart never pile up lateness), not with its arrival:
 *  frames that arrive bunched behind a slow one keep their real spacing, so the ball no longer steps 2x per frame under jitter. The
 *  draw delay is INTERP_MS plus the recent lateness (a decaying peak, at most `maxLateMs`; it grows at `up` and shrinks at `down` ms
 *  per ms, so the picture slows or hurries by a few % and never jumps): on a steady link (any fixed latency) it stays within a frame
 *  or two of INTERP_MS (the owner's and my frame grids) and the stamps are the arrival times, as before. A frame later than
 *  `maxLateMs` (an owner stall) re-anchors the envelope. `ring` frames cover the longest delay. No allocation. */
export const JITTER={ring:8,creep:.02,maxLateMs:300,decay:.97,up:.2,down:.04} as const;
/** One received snapshot (preallocated). */
type Frame={t:number;len:number;v:Float64Array};
export type SnapBuffer={
  /** Copy a snapshot body (the numbers after [code, kind, field]) received at `tMs`. Older or duplicate seqs are ignored. */
  push(data:readonly number[],from:number,tMs:number):boolean;
  /** Write the interpolated state into the puppet `sim` for render time `nowMs`; `ownIdx` = my slot's index (-1 none); `simPerMs` =
   *  sim seconds per real ms (live game speed / 1000). False until the first frame. */
  sample(sim:MatchSim,nowMs:number,ownIdx:number,simPerMs:number):boolean;
  readonly frames:number;readonly restart:boolean;readonly hands:boolean;readonly ballH:number;readonly lastAt:number;
  /** The current draw delay behind the owner's clock (ms): INTERP_MS on a steady link, more under jitter. */
  readonly delay:number;
  clear():void;
};
export function createSnapBuffer():SnapBuffer{
  const R=JITTER.ring,ring:Frame[]=Array.from({length:R},()=>({t:-1,len:0,v:new Float64Array(128)}));
  let head=-1,count=0,lastSeq=-1,restart=false,hands=true,ballH=0,lastAt=-1,evAt=-1,resetSeen=-1;
  /** Beach toasts on a friend's screen (QA round 2, Nov 5 2026): the newest frame's seq, period and restart flag seen, and where the
   *  ball stood in the last restart frame (-1: not yet in this stream, so nothing from before I joined pops late). */
  let beachAt=-1,bPeriod=-1,bRestart=false,bx0=0,by0=0;
  /** Seq-clock stamping (JITTER): unwrapped seq, envelope offset (ms), lateness peak (ms), the eased draw delay (ms), last sample time. */
  let u=0,off=0,lateMax=0,delay:number=INTERP_MS,lastNow=-1;
  /** The last popup value seen per slot index (-1 = not yet: the first one is only remembered, so an old trick never pops late). */
  const evSeen=new Int32Array(64).fill(-1),bodySeen=new Int32Array(64).fill(-1),trickAt=new Float64Array(64).fill(-1);
  const newer=(s:number)=>lastSeq<0||((s-lastSeq+100000)%100000)>0&&((s-lastSeq+100000)%100000)<50000;
  const api:SnapBuffer={
    push(data,from,tMs){
      const seq=data[from];if(!newer(seq))return false;const ds=lastSeq<0?0:(seq-lastSeq+100000)%100000;lastSeq=seq;
      let st:number;
      if(count===0){u=0;off=tMs;lateMax=0;st=tMs;}
      else{u+=ds;off=Math.min(off+JITTER.creep*Math.max(0,tMs-lastAt),tMs-u*SNAP_GAP_MS);st=u*SNAP_GAP_MS+off;const late=tMs-st;
        if(late>JITTER.maxLateMs){off=tMs-u*SNAP_GAP_MS;st=tMs;lateMax=0;}else lateMax=Math.max(late,lateMax*JITTER.decay);
        st=Math.max(st,ring[head].t+1);}
      head=(head+1)%R;const f=ring[head];const len=Math.min(128,data.length-from);for(let i=0;i<len;i++)f.v[i]=data[from+i];f.len=len;f.t=st;count=Math.min(R,count+1);lastAt=tMs;return true;
    },
    sample(sim,nowMs,ownIdx,simPerMs){
      if(count===0)return false;
      const dtR=lastNow<0?0:Math.max(0,Math.min(250,nowMs-lastNow));lastNow=nowMs;
      const want=INTERP_MS+Math.min(JITTER.maxLateMs,lateMax);delay+=Math.max(-JITTER.down*dtR,Math.min(JITTER.up*dtR,want-delay));
      const b=ring[head],prev=count>1?ring[(head+R-1)%R]:b;
      // The pair around render time (newest-first search); after the newest frame: hold it; before the oldest: hold that.
      const rt=nowMs-delay;let A=prev,B=b;
      if(count>1&&rt<prev.t){let nx=prev;A=nx;for(let i=2;i<count;i++){const fr=ring[(head+R-i)%R];B=nx;A=fr;if(fr.t<=rt)break;nx=fr;}}
      const span=B.t-A.t,k=span>0?Math.max(0,Math.min(1,(rt-A.t)/span)):1;
      const dtSim=Math.max(1e-3,(b.t-prev.t)*simPerMs);
      const ids=sim.ids,N=Math.min(ids.length,b.v[HEAD-1]|0);
      for(let i=0;i<N;i++){
        const p=sim.players[ids[i]],o=HEAD+i*3;
        if(i===ownIdx){// my own slot: the newest frame + its velocity (no 110 ms delay on the player I steer)
          const vx=count>1?(b.v[o]-prev.v[o])/10/dtSim:0,vy=count>1?(b.v[o+1]-prev.v[o+1])/10/dtSim:0,lead=Math.min(OWN_LEAD_S,Math.max(0,nowMs-b.t)/1000)*simPerMs*1000;
          p.x=Math.max(0,Math.min(270,b.v[o]/10+vx*lead));p.y=Math.max(0,Math.min(400,b.v[o+1]/10+vy*lead));p.vx=vx;p.vy=vy;
        }else{
          const ax=A.v[o]/10,ay=A.v[o+1]/10,bx=B.v[o]/10,by=B.v[o+1]/10,ds=Math.max(1e-3,span*simPerMs);
          p.x=ax+(bx-ax)*k;p.y=ay+(by-ay)*k;p.vx=span>0?(bx-ax)/ds:0;p.vy=span>0?(by-ay)/ds:0;
        }
        p.kick=B.v[o+2]/100;
      }
      const ax=A.v[4]/10,ay=A.v[5]/10,bx=B.v[4]/10,by=B.v[5]/10,ds=Math.max(1e-3,span*simPerMs);
      const ball=sim.ball;ball.x=ax+(bx-ax)*k;ball.y=ay+(by-ay)*k;ball.vx=span>0?(bx-ax)/ds:0;ball.vy=span>0?(by-ay)/ds:0;
      if((A.v[1]|0)&SNAP_FLAG.ballHidden){ball.x=bx;ball.y=by;ball.vx=ball.vy=0;}// it landed on the centre spot: no slide across the pitch
      ballH=(A.v[6]+(B.v[6]-A.v[6])*k)/100;ball.height=ballH;
      const own=B.v[7]|0;ball.owner=own>=0&&own<ids.length?ids[own]:null;
      const fl=B.v[1]|0;restart=(fl&SNAP_FLAG.restart)!==0;hands=(fl&SNAP_FLAG.hands)!==0;ball.lofted=(fl&SNAP_FLAG.lofted)!==0;sim.goalHold=(fl&SNAP_FLAG.goal)?1:0;sim.period=(fl>>4)&7||sim.period;
      // Quick goal reset: the owner's hidden flag as is; a new serial (mod 4) bumps the puppet's, which fieldRuntime turns into the arrival.
      sim.goalReset.hidden=(fl&SNAP_FLAG.ballHidden)!==0;{const rs=(fl>>SNAP_RESET_SHIFT)&3;if(resetSeen>=0&&rs!==resetSeen)sim.goalReset.serial+=(rs-resetSeen+4)&3;resetSeen=rs;}
      sim.score.gold=b.v[2];sim.score.blue=b.v[3];
      // Beach (QA round 2): the owner's restart toasts for MY slot and the full-time line come from its sim (humanNote, results), which a
      // puppet never steps. Derived here from what every frame already carries, once per new frame: the restart flag ending with my
      // slot on the ball where a kick-off / kick-in stands (centre spot / touchline, not a corner or a goal clearance), and the period
      // reaching 5 (full time; level = a shoot-out, its score is the owner's only). The HUD (liveJoinRuntime) reads them as on the owner.
      if(sim.isBeach&&b.v[0]!==beachAt){beachAt=b.v[0];const fb=b.v[1]|0,per=(fb>>4)&7,rs=(fb&SNAP_FLAG.restart)!==0,bo=b.v[7]|0;
        if(bPeriod>=0){
          if(per===5&&bPeriod!==5){const g=b.v[2]|0,bl=b.v[3]|0;sim.results.push(g===bl?{gold:g,blue:bl,pens:{gold:0,blue:0},extra:bPeriod===4}:{gold:g,blue:bl,extra:bPeriod===4});}
          if(bRestart&&!rs&&ownIdx>=0&&bo===ownIdx){const kickoff=Math.abs(bx0-135)<6&&Math.abs(by0-200)<6,kickin=(bx0<24||bx0>246)&&by0>=20&&by0<=380;
            if(kickoff||kickin){sim.humanNote.serial++;sim.humanNote.id=ids[ownIdx];sim.humanNote.text=kickoff?BEACH_HUMAN_NOTES.kickoff:BEACH_HUMAN_NOTES.kickin;}}}
        bPeriod=per;bRestart=rs;if(rs){bx0=b.v[4]/10;by0=b.v[5]/10;}}
      // The assist targets the owner computed for each human (the Pass ring / Forward marker on a friend's screen).
      const hAt=HEAD+(b.v[HEAD-1]|0)*3,H=b.v[hAt]|0;
      for(let j=0;j<H;j++){const o=hAt+1+j*3,id=ids[b.v[o]|0],t=id?sim.humanTargets.get(id):undefined;if(!t)continue;const pi=b.v[o+1]|0,fi=b.v[o+2]|0;t.pass.id=pi>=0?ids[pi]??null:null;t.forward.id=fi>=0?ids[fi]??null:null;}
      // The owner's popups (SNAP_EVENTS): each newest frame once; the serial deltas (mod 8) bump the puppet's human state, which the
      // field runtime (trick move, sparkle, sounds) and the HUD (popup words) already read. No allocation.
      const evFrom=hAt+1+H*3;
      if(b.v[0]!==evAt&&b.len>=evFrom+H){evAt=b.v[0];
        for(let j=0;j<H;j++){const si=b.v[hAt+1+j*3]|0,e=b.v[evFrom+j]|0;if(si<0||si>=64)continue;const was=evSeen[si];evSeen[si]=e;const h=sim.humans.get(ids[si]);if(was<0||was===e||!h)continue;
          const dt=((e&7)-(was&7)+8)&7,ds=(((e>>3)&7)-((was>>3)&7)+8)&7,dl=(((e>>6)&7)-((was>>6)&7)+8)&7;
          if(dt){h.trickSerial+=dt;h.trickKind=TRICK_KINDS[(e>>9)&3]??'stepover';h.trickSide=e&SNAP_EVENTS.left?-1:1;}
          if(ds){h.shotSerial+=ds;h.shotPw=e&SNAP_EVENTS.power?POWER_SHOT.full:.5;h.shotAimed=(e&SNAP_EVENTS.aimed)!==0;}
          if(dl)h.slipSerial+=dl;}
        // Keeper + body moves (SNAP_BODY): the move's high kind bit and beaten defender, the dive / save / shoulder serials, the shield.
        const bFrom=evFrom+H;if(b.len>=bFrom+H)for(let j=0;j<H;j++){const si=b.v[hAt+1+j*3]|0,e2=b.v[bFrom+j]|0;if(si<0||si>=64)continue;const was=bodySeen[si];bodySeen[si]=e2;const h=sim.humans.get(ids[si]);if(!h)continue;
          h.shield=(e2&SNAP_BODY.shield)!==0;
          {const kind=((b.v[evFrom+j]|0)>>SNAP_TACKLE.kind)&3,bumps=was<0?0:(((e2>>SNAP_TACKLE.serial)&3)-((was>>SNAP_TACKLE.serial)&3)+4)&3;if(was<0||was!==e2)sim.netTackle(ids[si],(e2&SNAP_TACKLE.winding)!==0,bumps,kind);}
          if(was<0||was===e2)continue;
          const dd=(((e2>>SNAP_BODY.dive)&3)-((was>>SNAP_BODY.dive)&3)+4)&3,dv=(((e2>>SNAP_BODY.save)&3)-((was>>SNAP_BODY.save)&3)+4)&3,dh=(((e2>>SNAP_BODY.shoulder)&3)-((was>>SNAP_BODY.shoulder)&3)+4)&3;
          if(dd){h.diveSerial+=dd;h.diveSide=e2&SNAP_BODY.diveLeft?-1:1;}
          if(dv){h.saveSerial+=dv;h.saveKind=((e2>>SNAP_BODY.saveKind)&3) as 0|1|2;h.saveBig=(e2&SNAP_BODY.big)!==0;}
          if(dh){h.shoulderSerial+=dh;const o=sim.ball.owner;h.shoulderOn=o&&sim.players[o]&&sim.players[o].team!==h.team?o:null;}}
        // The trick read above used the first value's two kind bits: complete it (flick = 4) and name the beaten defender here
        // (the nearest opponent outfielder of the trickster on this screen: the one the owner's sim picked, within a step).
        for(let j=0;j<H;j++){const si=b.v[hAt+1+j*3]|0;if(si<0||si>=64)continue;const h=sim.humans.get(ids[si]);if(!h||h.trickSerial===trickAt[si])continue;trickAt[si]=h.trickSerial;
          const e2=b.len>=bFrom+H?b.v[bFrom+j]|0:0,k=((b.v[evFrom+j]|0)>>9&3)|((e2&SNAP_BODY.kindHi)<<2);h.trickKind=TRICK_KINDS[k]??'stepover';
          h.trickBeat=null;if(e2&SNAP_BODY.beat){const me=sim.players[ids[si]];let nd=Infinity;for(const id of ids){const q=sim.players[id];if(q.team===me.team||q.isGK)continue;const d=Math.hypot(q.x-me.x,q.y-me.y);if(d<nd){nd=d;h.trickBeat=id;}}}}}
      return true;
    },
    get frames(){return count;},get restart(){return restart;},get hands(){return hands;},get ballH(){return ballH;},get lastAt(){return lastAt;},get delay(){return delay;},
    clear(){head=-1;count=0;lastSeq=-1;u=0;off=0;lateMax=0;delay=INTERP_MS;lastNow=-1;restart=false;hands=true;ballH=0;lastAt=-1;evAt=-1;resetSeen=-1;beachAt=-1;bPeriod=-1;bRestart=false;evSeen.fill(-1);bodySeen.fill(-1);trickAt.fill(-1);for(const f of ring){f.t=-1;f.len=0;}},
  };
  return api;
}

// ---------------------------------------------------------------- controls (a friend -> the owner)
/** A friend's controls between two sends: the stick is the latest, one-shot buttons are OR-ed until sent (so a tap is never lost). */
export type InAccum={mx:number;my:number;btn:number;passPower:number;shootPower:number;long:number;aimX:number;aimH:number;/** a one-shot button waits */urgent:boolean;dirty:boolean};
export const createInAccum=():InAccum=>({mx:0,my:0,btn:0,passPower:0,shootPower:1,long:0,aimX:NaN,aimH:NaN,urgent:false,dirty:false});
const ONE_SHOT=NET_BTN.pass|NET_BTN.shoot|NET_BTN.through|NET_BTN.tackle|NET_BTN.call|NET_BTN.save|NET_BTN.trick|NET_BTN.press;
/** Fold one frame of local controls (sim-space stick) into the accumulator. */
export function accumulateIn(a:InAccum,f:HumanFrame){
  if(Math.abs(f.mx-a.mx)>.04||Math.abs(f.my-a.my)>.04)a.dirty=true;
  a.mx=f.mx;a.my=f.my;
  const held=(f.jockey?NET_BTN.jockey:0)|(f.sprint?NET_BTN.sprint:0);
  if(held!==(a.btn&(NET_BTN.jockey|NET_BTN.sprint)))a.dirty=true;
  a.btn=(a.btn&ONE_SHOT)|held;
  if(f.pass){a.btn|=NET_BTN.pass;a.passPower=f.passPower??0;a.long=f.long??0;}
  if(f.through){a.btn|=NET_BTN.through;a.passPower=f.passPower??0;}
  if(f.shoot){a.btn|=NET_BTN.shoot;a.shootPower=f.shootPower??1;a.aimX=f.aimX??NaN;a.aimH=f.aimH??NaN;}
  if(f.tackle)a.btn|=NET_BTN.tackle;if(f.call)a.btn|=NET_BTN.call;if(f.save)a.btn|=NET_BTN.save;if(f.trick)a.btn|=NET_BTN.trick;if(f.press)a.btn|=NET_BTN.press;
  if(a.btn&ONE_SHOT)a.urgent=true;
}
const q=(v:number)=>Math.max(-1000,Math.min(1000,Math.round(v*100)));
/** Write the accumulator as a C.Match In frame into `out` (reused) and clear its one-shot buttons. */
export function encodeIn(a:InAccum,seq:number,out:number[]):number[]{
  out.length=11;out[0]=NET.C_MATCH;out[1]=NET.IN;out[2]=seq;out[3]=q(a.mx);out[4]=q(a.my);out[5]=a.btn;out[6]=q(a.passPower);out[7]=q(a.shootPower);out[8]=q(a.long);
  out[9]=a.aimX===a.aimX?q(a.aimX):NO_AIM;out[10]=a.aimH===a.aimH?q(a.aimH):NO_AIM;
  a.btn&=~ONE_SHOT;a.urgent=false;a.dirty=false;return out;
}
/** Read a C.Match In body (the values from `seq` on, at `from`) into a HumanFrame (reused). */
export function decodeIn(d:readonly number[],from:number,out:HumanFrame):HumanFrame{
  const b=d[from+3];
  out.mx=d[from+1]/100;out.my=d[from+2]/100;
  out.pass=(b&NET_BTN.pass)!==0;out.shoot=(b&NET_BTN.shoot)!==0;out.through=(b&NET_BTN.through)!==0;out.tackle=(b&NET_BTN.tackle)!==0;out.jockey=(b&NET_BTN.jockey)!==0;
  out.sprint=(b&NET_BTN.sprint)!==0;out.call=(b&NET_BTN.call)!==0;out.save=(b&NET_BTN.save)!==0;out.trick=(b&NET_BTN.trick)!==0;out.press=(b&NET_BTN.press)!==0;
  out.passPower=d[from+4]/100;out.shootPower=d[from+5]/100;out.long=d[from+6]/100;
  out.aimX=d[from+7]===NO_AIM?NaN:d[from+7]/100;out.aimH=d[from+8]===NO_AIM?NaN:d[from+8]/100;
  return out;
}

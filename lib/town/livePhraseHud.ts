// Quick phrases in live matches, the HUD side (Nov 7 2026; lib/town/quickPhrases.ts has the set, the limit and the wire): the
// phrase button + tray (components/LiveJoinHud.tsx), the speech bubbles over players' heads, the AI teammates' cosmetic answers,
// and the HUD pieces for the sim's assist / tackle wind-up (feature-detected; nothing shows while the sim lacks them).
// Teaching purpose: talking on the pitch (calling for it, claiming it, cheering a teammate) is part of playing as a team.
// Heat: a fixed pool of BUBBLE.pool elements; with no bubble up the frame costs a few compares. While a bubble shows, one
// projection per bubble and a transform written only when its whole-pixel spot changes (transform + opacity only; the pop is a
// CSS animation, off with reduced motion and Match effects Light). No per-frame allocation.
import * as T from 'three';
import {PHRASES,AI_REPLIES,AI_NICE_TO,AI_REPLY,BUBBLE,createBubblePool,createPhraseLimiter,phrasesEnabled,isPhrase,goalAssist,tackleTelegraph,type PhraseBus} from './quickPhrases';
import {liveWorldX,liveWorldZ,type LiveVenue} from './venues';
import {slotName} from './liveJoin';

type P={x:number;y:number;team:string;isGK?:boolean;role?:string}&Record<string,unknown>;
export type PhraseSim={ids:readonly string[];players:Record<string,P>;humans:{has(id:string):boolean};ball:{owner:string|null}}&Record<string,unknown>;
type Deps={el:(sel:string)=>HTMLElement|null;set:(e:HTMLElement|null,attr:string,value:string|null)=>void;sound:(gain:number)=>void;now?:()=>number;random?:()=>number};

const SEL=Array.from({length:BUBBLE.pool},(_,i)=>`[data-join-bubble="${i}"]`);
const CHIP_SEL=PHRASES.map((_,i)=>`[data-join-phrase="${i}"]`);
/** How long the assist caption and the tackle cue stay (s). */
export const ASSIST_S=2.4,TELEGRAPH_S=.7;

export function createPhraseHud(d:Deps){
  const now=d.now??(()=>performance.now()),rnd=d.random??Math.random;
  const pool=createBubblePool(),limiter=createPhraseLimiter(),v=new T.Vector3();
  const px=new Int32Array(BUBBLE.pool).fill(-1e6),py=new Int32Array(BUBBLE.pool).fill(-1e6),off=new Uint8Array(BUBBLE.pool);
  let sim:PhraseSim|null=null,format='',mySlot='',joined=false,trayOpen=false,canShown:boolean|null=null,btnShown:boolean|null=null,enabledShown:boolean|null=null,calmShown:boolean|null=null;
  let replyKey='',replyT=-1,lastOwner:string|null=null,mineCool=0,assistT=0,teleT=0,teleShown=false,serial=0;
  const bus:PhraseBus={
    out:{id:0,serial:0,at:-1e12},
    show(slotIdx,id){if(!joined||!sim||!phrasesEnabled()||!isPhrase(id))return;const key=sim.ids[slotIdx];if(!key||key===mySlot)return;pool.add(key,PHRASES[id]);d.sound(.45);},
  };
  const tray=()=>d.el('[data-join-phrases]');
  function setTray(open:boolean){trayOpen=open;const t=tray();d.set(t,'data-open',open?'':null);d.set(d.el('[data-join-phrase-open]'),'aria-expanded',open?'true':'false');canShown=null;}
  function hideBubble(i:number){const e=d.el(SEL[i]);d.set(e,'data-show',null);d.set(e,'data-out',null);px[i]=py[i]=-1e6;}
  const api={
    bus,pool,limiter,
    get trayOpen(){return trayOpen;},
    toggleTray(){if(!joined||!phrasesEnabled())return;setTray(!trayOpen);},
    closeTray(){if(trayOpen)setTray(false);},
    /** The kid tapped phrase `id`: rate-limited; true when it was said. */
    say(id:number){
      if(!joined||!sim||!mySlot||!phrasesEnabled()||!isPhrase(id))return false;
      const t=now();if(!limiter.take(t))return false;
      pool.add(mySlot,PHRASES[id]);d.sound(.55);setTray(false);
      serial=serial%7+1;bus.out.id=id;bus.out.serial=serial;bus.out.at=t;
      // an AI teammate may cheer back (cosmetic, this phone only)
      if(AI_NICE_TO.includes(id)&&rnd()<AI_REPLY.chance){const k=nearestMate(120);if(k){replyKey=k;replyT=AI_REPLY.delayS;}}
      return true;
    },
    /** A goal (the runtime's score change): the assist caption when the sim tells who made it. */
    goal(){
      if(!sim)return;const a=goalAssist(sim);if(!a)return;const p=sim.players[a],cap=d.el('[data-join-assist]');if(!p||!cap)return;
      const t=a===mySlot?'Assist: you!':'Assist: '+slotName(a,p.team==='blue'?'blue':'gold',String(p.role??''),format);
      if(cap.textContent!==t)cap.textContent=t;cap.removeAttribute('data-show');void cap.offsetWidth;cap.setAttribute('data-show','');assistT=ASSIST_S;
    },
    /** Per frame while joined (or once with joined = false to tidy up). */
    frame(dt:number,on:boolean,s:PhraseSim|null,f:string,slot:string,venue:Pick<LiveVenue,'x'|'z'|'width'|'length'|'yaw'>|null,ground:number,camera:T.Camera,onBall:boolean,calm:boolean){
      const enabled=phrasesEnabled(),was=joined;joined=on&&!!s&&!!slot;sim=s;format=f;mySlot=slot;
      if(!joined){if(was){pool.clear();for(let i=0;i<BUBBLE.pool;i++)hideBubble(i);setTray(false);replyT=-1;lastOwner=null;if(assistT>0){assistT=0;d.set(d.el('[data-join-assist]'),'data-show',null);}if(teleShown){teleShown=false;d.set(d.el('[data-join-telegraph]'),'data-show',null);}}return;}
      // Nov 8 2026 (owner: "speech button shouldn't be showing at all"): the phrase button and tray stay hidden in every state; friends' bubbles and the AI answers still show.
      const show=false;if(show!==btnShown){btnShown=show;const t=tray();if(t&&t.hidden!==!show)t.hidden=!show;if(!show)setTray(false);}
      if(enabled!==enabledShown){enabledShown=enabled;if(!enabled)pool.clear();}
      if(calm!==calmShown){calmShown=calm;d.set(d.el('[data-join-bubbles]'),'data-calm',calm?'':null);}
      if(trayOpen){const can=limiter.can(now());if(can!==canShown){canShown=can;for(const sel of CHIP_SEL)d.set(d.el(sel),'aria-disabled',can?null:'true');}}
      // AI answers: "Nice!" after a cheer, "Mine!" now and then as an AI teammate near me takes the ball
      if(replyT>=0){replyT-=dt;if(replyT<0&&enabled&&s!.players[replyKey])pool.add(replyKey,AI_REPLIES.nice);}
      if(mineCool>0)mineCool-=dt;
      const own=s!.ball.owner;
      if(own!==lastOwner){const prev=lastOwner;lastOwner=own;
        if(prev!==null&&own&&enabled&&mineCool<=0&&own!==slot&&!s!.humans.has(own)){const p=s!.players[own],me=s!.players[slot];
          if(p&&me&&p.team===me.team&&Math.hypot(p.x-me.x,p.y-me.y)<AI_REPLY.mineRange&&rnd()<AI_REPLY.mineChance){pool.add(own,AI_REPLIES.mine);mineCool=AI_REPLY.mineCoolS;}}}
      // the assist caption and the tackle wind-up cue (feature-detected)
      if(assistT>0){assistT-=dt;if(assistT<=0)d.set(d.el('[data-join-assist]'),'data-show',null);}
      if(tackleTelegraph(s as never,slot,onBall))teleT=TELEGRAPH_S;else if(teleT>0)teleT-=dt;
      if((teleT>0)!==teleShown){teleShown=teleT>0;d.set(d.el('[data-join-telegraph]'),'data-show',teleShown?'':null);}
      // bubbles
      pool.step(dt);if(!venue)return;
      const W=innerWidth,H=innerHeight;
      for(let i=0;i<BUBBLE.pool;i++){
        const b=pool.items[i],e=d.el(SEL[i]);if(!e)continue;
        if(!b.live){if(e.hasAttribute('data-show'))hideBubble(i);continue;}
        const p=s!.players[b.key];if(!p){b.live=false;hideBubble(i);continue;}
        if(b.fresh){b.fresh=false;const sp=e.firstElementChild as HTMLElement|null;if(sp&&sp.textContent!==b.text)sp.textContent=b.text;d.set(e,'data-out',null);e.removeAttribute('data-show');void e.offsetWidth;e.setAttribute('data-show','');d.set(e,'data-me',b.key===slot?'':null);}
        if(b.age>=BUBBLE.showS-BUBBLE.outS)d.set(e,'data-out','');
        v.set(liveWorldX(venue,p.x,p.y),ground+BUBBLE.headM,liveWorldZ(venue,p.x,p.y)).project(camera);
        const hid=v.z>1||Math.abs(v.x)>1.05||Math.abs(v.y)>1.05?1:0;if(hid!==off[i]){off[i]=hid;d.set(e,'data-off',hid?'':null);}
        if(hid)continue;
        const x=Math.round((v.x+1)*W/2),y=Math.max(BUBBLE.topPx,Math.round((1-v.y)*H/2));
        if(x!==px[i]||y!==py[i]){px[i]=x;py[i]=y;e.style.transform='translate('+x+'px,'+y+'px)';}
      }
    },
  };
  function nearestMate(range:number){
    const s=sim,me=s?.players[mySlot];if(!s||!me)return null;let best:string|null=null,bd=range;
    for(const id of s.ids){if(id===mySlot||s.humans.has(id))continue;const p=s.players[id];if(!p||p.team!==me.team||p.isGK)continue;const dd=Math.hypot(p.x-me.x,p.y-me.y);if(dd<bd){bd=dd;best=id;}}
    return best;
  }
  return api;
}

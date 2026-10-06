/**
 * The coach's route: plays a puzzle's taught route the way a finger would draw it (a straight stroke
 * from the ball, a hold for loft, a bow for curl, runs dragged from teammates), so the arcade can replay
 * it next to the child's own attempt. Pure and bounded (≤ 40 s of sim at 1/120); run on demand only.
 */
import type {Scenario,Kick,StrokePoint,PuzzleWorld,PuzzleSnapshot,PuzzleInput} from './types';
import {createPuzzle} from './world';
import {readStroke} from './stroke';
import {isCall,type Step} from './packs';

/** The stroke a child would draw for a stored kick (the same rules the route tests use). */
export function strokeForKick(w:PuzzleWorld,k:Kick):StrokePoint[]{
  const s=w.state,b=s.ball.p,g=w.scenario.pitch,goalZ=g.length/2,hg=g.goalWidth/2-0.25;
  let end:{x:number;z:number};
  if(k.kind==='shot')end={x:Math.max(-hg,Math.min(hg,k.target.x)),z:goalZ+2};
  else if((k.kind==='pass-feet'||k.kind==='header')&&k.receiver!=null&&s.attackers[k.receiver]){const a=s.attackers[k.receiver].p;end={x:a.x,z:a.z};}
  else end={x:k.target.x,z:k.target.z};
  const DX=end.x-b.x,DZ=end.z-b.z,L=Math.hypot(DX,DZ)||1,nx=DZ/L,nz=-DX/L;
  const bow=k.curl?Math.sign(k.curl)*(Math.abs(k.curl)*0.22*L+0.4):0,loft=k.loft>0?Math.min(1,Math.max(0.16,k.loft)):0;
  const hold=loft>0?0.25+(loft-0.15)*0.45/0.85+0.002:0,pts:StrokePoint[]=[],n=Math.max(3,Math.min(24,Math.floor(L/0.5)));
  for(let i=0;i<=n;i++){const u=i/n,o=Math.sin(Math.PI*u)*bow;pts.push({x:b.x+DX*u+nx*o,z:b.z+DZ*u+nz*o,t:u*0.4});}
  if(hold>0){for(let t=0.05;t<hold;t+=0.05)pts.push({x:end.x+0.02,z:end.z,t:0.4+t});pts.push({x:end.x,z:end.z,t:0.4+hold});}
  return pts;
}

/** Run the route; returns what replay() needs, and whether the route solved the puzzle. */
export function coachRun(sc:Scenario,steps:Step[]):{start:PuzzleSnapshot;inputs:PuzzleInput[];ok:boolean}{
  const w=createPuzzle(sc);let i=0;
  for(let g=0;g<120*40;g++){
    const ph=w.state.phase;if(ph==='success'||ph==='fail')break;
    if(ph==='aiming'){if(i>=steps.length)break;const st=steps[i++];
      if(isCall(st)){w.callRun(st.call.attacker,st.call.to);continue;}
      if(!w.kick(readStroke(strokeForKick(w,st),w)))break;}
    w.step(1/120);
  }
  return {start:w.attemptStart(),inputs:w.inputs(),ok:w.state.phase==='success'};
}

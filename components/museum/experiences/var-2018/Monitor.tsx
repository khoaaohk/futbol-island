'use client';
import {BAR,BAR_W,monitorOf,monitorWindow,tickStep,ballAt,type Cam} from './model';
import {BALL_R,LINE_W,type Clip} from './goalline';
import v from './var.module.css';

/**
 * var-2018 · the VAR's monitor picture (Oct 12 2026 rebuild, no people). The two goal-line cameras at TRUE scale, in cm, drawn
 * from the same numbers that move the ball on the bench (model.ts ballAt), so the picture is the truth:
 *  - LINE CAM looks straight along the goal line: the line is a 12 cm band on the ground, its far edge (the goal side) is the
 *    plane the WHOLE ball must pass; the crossbar is seen end-on at the top.
 *  - TOP CAM looks straight down: the line is a 12 cm stripe; the ball's shadow is offset by its height.
 * `measure` draws the truth (a dimension between the ball's trailing edge and the line's goal edge) for the verdict.
 */
const R=BALL_R*100,LW=LINE_W*100;
export function MonitorPicture({clip,frame,cam,zoom,aspect,measure,idle}:{clip:Clip;frame:number;cam:Cam;zoom:number;aspect:number;measure:boolean;idle:boolean}){
 const b=ballAt(clip,frame),win=monitorWindow(cam,zoom,aspect,b),m=monitorOf({clip,frame}),step=tickStep(win.w);
 const by=cam==='line'?-b.z:0,fs=win.w/26,x0=win.x,x1=win.x+win.w,yT=win.y,yB=win.y+win.h;
 const ticks:JSX.Element[]=[];const tickBase=cam==='line'?Math.min(yB,14):yB;
 for(let cm=Math.ceil((x0+LW)/step)*step;cm<=x1+LW;cm+=step){const x=cm-LW,big=cm%(step*5)===0,zero=cm===0;
  ticks.push(<line key={cm} x1={x} y1={tickBase} x2={x} y2={tickBase-(zero?win.h*.09:big?win.h*.055:win.h*.03)} className={zero?v.mAcc:v.mInk} strokeWidth={zero?1.4:.8}/>);}
 const spin=frame*31,net=Math.max(8,Math.round(win.w/24));
 const dimY=cam==='line'?by-R-win.h*.07:by-R-win.h*.09,over=m.over,gap=Math.round(Math.abs(m.near+LW));
 return <svg viewBox={`${x0} ${yT} ${win.w} ${win.h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-idle={idle||undefined} data-cam-view={cam}>
  <rect x={x0-10} y={yT-10} width={win.w+20} height={win.h+20} className={v.mSky}/>
  {cam==='line'?<>
   {/* inside the goal (behind the line's plane) is a shade darker; the ground, the line band, the line's plane, the bar end-on */}
   <rect x={x0-10} y={-BAR} width={-LW-x0+10} height={BAR} className={v.mGoal}/>
   <rect x={x0-10} y={0} width={win.w+20} height={Math.max(0,yB-0)+10} className={v.mGround}/>
   {Array.from({length:8},(_,i)=><line key={i} x1={x0-10} x2={x1+10} y1={3+i*6} y2={3+i*6} className={v.mFaint}/>)}
   <rect x={-LW} y={-BAR} width={LW} height={BAR} className={v.mPlane}/>
   <rect x={-LW} y={-1.4} width={LW} height={2.8} className={v.mLine}/>
   <line x1={-LW} y1={0} x2={-LW} y2={-BAR+BAR_W} className={v.mEdge}/>
   <rect x={-LW} y={-BAR} width={BAR_W} height={BAR_W} rx={2} className={v.mBar}/>
   <ellipse cx={b.x} cy={1.2} rx={R*Math.max(.5,1-b.z/300)} ry={1.6} className={v.mShadow} opacity={Math.max(.12,.32-b.z/600)}/>
  </>:<>
   <rect x={0} y={yT-10} width={x1+10} height={win.h+20} className={v.mPitch}/>
   {Array.from({length:Math.ceil((x1+10)/24)+1},(_,i)=><rect key={i} x={i*24} y={yT-10} width={12} height={win.h+20} className={v.mStripe}/>)}
   <rect x={x0-10} y={yT-10} width={-LW-x0+10} height={win.h+20} className={v.mGoal}/>
   {Array.from({length:Math.ceil((-LW-x0)/net)+1},(_,i)=><line key={i} x1={-LW-net-i*net} y1={yT-10} x2={-LW-net-i*net} y2={yB+10} className={v.mNet}/>)}
   <rect x={-LW} y={yT-10} width={LW} height={win.h+20} className={v.mLine}/>
   <line x1={-LW} y1={yT-10} x2={-LW} y2={yB+10} className={v.mEdge}/>
   <ellipse cx={b.x+b.z*.18} cy={b.z*.12} rx={R*1.02} ry={R*.92} className={v.mShadow} opacity={Math.max(.1,.24-b.z/900)}/>
  </>}
  {!idle&&<g>
   <circle cx={b.x} cy={by} r={R} className={v.mBallSh}/>
   <circle cx={b.x-R*.12} cy={by-R*.12} r={R*.86} className={v.mBall}/>
   <circle cx={b.x-R*.36} cy={by-R*.38} r={R*.32} className={v.mBallHi}/>
   <g transform={`rotate(${spin} ${b.x} ${by})`}><path d={`M${b.x-R*.92} ${by+R*.12}Q${b.x} ${by+R*.62} ${b.x+R*.92} ${by+R*.12}M${b.x-R*.06} ${by-R*.98}Q${b.x+R*.44} ${by} ${b.x-R*.06} ${by+R*.98}`} className={v.mSeam}/></g>
   <circle cx={b.x} cy={by} r={R} className={v.mBallEdge}/>
   <line x1={m.near} y1={by-R*.4} x2={m.near} y2={by+R*.4} className={v.mAcc} strokeWidth={1.4}/>
  </g>}
  {measure&&<g data-var-measure>
   <line x1={-LW} y1={dimY} x2={m.near} y2={dimY} className={v.mDim}/>
   <line x1={-LW} y1={dimY-win.h*.03} x2={-LW} y2={dimY+win.h*.03} className={v.mDim}/><line x1={m.near} y1={dimY-win.h*.03} x2={m.near} y2={dimY+win.h*.03} className={v.mDim}/>
   <text x={(m.near-LW)/2} y={dimY-win.h*.035} fontSize={fs} textAnchor="middle" className={v.mText}>{gap} cm {over?'over':'on the line'}</text>
  </g>}
  <g>{ticks}</g>
 </svg>;
}

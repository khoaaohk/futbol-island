import * as T from 'three';
import {districtAt} from '@/components/games/runnerRoute';
import {createArcadeStage} from './arcadeStage';
import {createTennis,tennisNeedsFrames,beginTennis,resetTennis,tickTennis,setTennisTarget,requestTennisKick,type TennisShot} from '@/lib/games/soccerTennis';
import {createPinballState,stepPinball,launchPinball,pinballDefenders,pinballFlippers} from '@/lib/games/soccerPinball';
import {createRunnerGame,tickRunner,runnerJump,runnerSlide} from './runnerGame';
export type ArcadeKind='tennis'|'pinball'|'runner';
export type ArcadeInput={x:number;y:number;left:boolean;right:boolean;charge:boolean};
export type ArcadeHUD={score:string;detail:string;message:string;over:boolean;ready:boolean};
export function createArcadeGame(canvas:HTMLCanvasElement,kind:ArcadeKind,onSound:(goal:boolean)=>void){
 const stage=createArcadeStage(canvas),tennis=createTennis(),pinball=createPinballState(),runner=createRunnerGame();
 const ball=stage.football(kind==='pinball'?7/30:.22);let elapsed=0,event=0;
 const players=[stage.player('#efbd58'),stage.player('#b492d0'),stage.player('#b492d0'),stage.player('#b492d0')];
 players.forEach(p=>p.root.visible=false);
 const strips:T.Mesh[]=[],flippers:T.Group[]=[],runnerObjects:T.Group[]=[],shadow=new T.Mesh(new T.CircleGeometry(.28,24),new T.MeshBasicMaterial({color:'#183f45',transparent:true,opacity:.25,depthWrite:false}));shadow.rotation.x=-Math.PI/2;stage.scene.add(shadow);
 const px=(x:number)=>(x-180)/30,pz=(y:number)=>(y-310)/30;
 if(kind==='tennis'){
  stage.box(0,-.06,0,11,.12,17,'#588f88').castShadow=false;
  for(let side of[-1,1]){stage.box(0,.004,side*4,9.9,.016,7.9,side===1?'#338e7c':'#527ea4').castShadow=false;stage.bar(-5,side*8,5,side*8,.025,.035,'#fff0cf');stage.bar(side*5,-8,side*5,8,.025,.035,'#fff0cf');stage.cylinder(side*5.3,.66,0,.07,1.32,'#fff0cf');}
  stage.bar(-5.3,0,5.3,0,1.1,.035,'#fff4df');const net:number[]=[];for(let x=-5.25;x<=5.3;x+=.3)net.push(x,.08,0,x,1.1,0);for(let y=.08;y<=1.1;y+=.2)net.push(-5.3,y,0,5.3,y,0);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(net,3));stage.scene.add(new T.LineSegments(geo,new T.LineBasicMaterial({color:'#e7eee0',transparent:true,opacity:.55})));
  players[0].root.visible=players[1].root.visible=true;
 }else if(kind==='pinball'){
  stage.box(0,-.18,0,12.7,.35,21,'#467f7b').castShadow=false;stage.box(-.25,.005,-.1,10.5,.015,18.5,'#348a70').castShadow=false;
  for(let y=90;y<580;y+=60)stage.box(-.25,.022,pz(y),10.5,.012,1,'#459c7c').castShadow=false;
  const walls=[[20,45,100,45],[260,45,318,45],[100,30,100,53],[260,30,260,53],[318,45,352,60],[352,60,366,108],[20,45,20,455],[366,108,366,599],[341,150,341,402],[341,455,341,594],[20,455,99,535],[338,458,261,535],[344,599,364,599]];
  for(const [a,b,c,d]of walls)stage.bar(px(a),pz(b),px(c),pz(d),.18,.13,'#f0be70');
  stage.ring(-.3,0,1.8,'#e4edce');stage.bar(-5.3,0,5.3,0,.03,.025,'#e4edce');stage.goal(0,pz(45),160/30);
  for(const side of[0,1]){const group=new T.Group();stage.scene.add(group);stage.box(1.05,0,0,2.1,.25,.46,side?'#ed9f87':'#eec55d',group);flippers.push(group);}
  players[0].root.visible=true;players[0].root.scale.setScalar(.7);
  for(let i=1;i<4;i++){players[i].root.scale.setScalar(.75);}
 }else{
  stage.box(0,-.07,-24,8.8,.12,76,'#367e70').castShadow=false;
  for(const side of[-1,1])stage.bar(side*4.4,8,side*4.4,-62,.03,.06,'#fce8ba');for(let i=0;i<18;i++){const strip=stage.box(0,.005,7-i*4,8.6,.015,2,'#4b9180');strip.castShadow=false;strips.push(strip);}
  players[0].root.visible=true;players[0].root.scale.setScalar(1.15);
  for(let i=0;i<24;i++){const g=new T.Group();g.visible=false;stage.scene.add(g);runnerObjects.push(g);}
 }
 const poolKinds=new Map<T.Group,string>(),used=new Set<T.Group>();
 function decorate(g:T.Group,type:string){if(poolKinds.get(g)===type)return;g.clear();poolKinds.set(g,type);if(type==='coin'){const m=stage.cylinder(0,.7,0,.26,.12,'#ffe084',g);m.rotation.x=Math.PI/2;}else if(type==='cone'){const m=new T.Mesh(new T.ConeGeometry(.42,.9,8),new T.MeshStandardMaterial({color:'#e89470',roughness:.8}));m.position.y=.45;m.castShadow=true;g.add(m);}else if(type==='defender'){const p=stage.player('#b492d0');stage.scene.remove(p.root);g.add(p.root);g.userData.rig=p;}else{const goal=stage.goal(0,0,7.6);stage.scene.remove(goal);g.add(goal);const marker=stage.box(0,.025,0,1.5,.025,1.3,'#f7d979',g);marker.name='open-lane';for(const lane of[-1,0,1]){const blocker=stage.box(lane*2.4,.6,0,1.7,1.2,.22,'#b492d0',g);blocker.name=`blocked-${lane}`;}}}
 // Construct reusable runner visuals once; no geometry creation during play.
 if(kind==='runner')for(let i=0;i<24;i++)decorate(runnerObjects[i],['defender','cone','coin','goal'][Math.floor(i/6)]);
 function fit(){stage.fit(kind==='pinball'?13:kind==='tennis'?12:10,kind==='pinball'?23:19,kind==='runner');}
 function reset(){if(kind==='tennis'){resetTennis(tennis);beginTennis(tennis);}else if(kind==='pinball')Object.assign(pinball,createPinballState());else Object.assign(runner,createRunnerGame());elapsed=event=0;}
 function action(id:number){if(kind==='tennis')requestTennisKick(tennis,undefined,(['auto','lob','drop'] as TennisShot[])[id]??'auto');else if(kind==='pinball'){if(pinball.phase==='ready')launchPinball(pinball);}else if(id===0)runnerJump(runner);else runnerSlide(runner);}
 function target(x:number,y:number){const p=stage.pick(x,y);if(p&&kind==='tennis')setTennisTarget(tennis,p.x,p.z);}
 function update(dt:number,input:ArcadeInput){elapsed+=dt;
  if(kind==='tennis'){
   if(input.x||input.y)setTennisTarget(tennis,tennis.you.x+input.x*1.1,tennis.you.y+input.y*1.1);tickTennis(tennis,dt);
  }else if(kind==='pinball')stepPinball(pinball,{left:input.left,right:input.right,charge:input.charge},dt);
  else{if(input.x)runner.lane=T.MathUtils.clamp(Math.round(input.x),-1,1);tickRunner(runner,dt);}
  sync(dt);stage.effects(dt);stage.lighting(elapsed);
 }
 function sync(dt:number){
  if(kind==='tennis'){
   [tennis.you,tennis.rival].forEach((p,i)=>{const rig=players[i];rig.root.position.x=p.x;rig.root.position.z=p.y;rig.pose(dt,Math.hypot(p.vx,p.vy),i?0:Math.PI,p.kick,p.kickStyle===2?Math.sin(Math.min(1,p.kick)*Math.PI)*.5:0,p.vx*.12);});ball.position.set(tennis.ball.x,Math.max(.18,tennis.ball.z),tennis.ball.y);ball.rotation.x=tennis.ball.rot;
   if(tennis.kickCount!==event){event=tennis.kickCount;stage.burst(ball.position.x,ball.position.y,ball.position.z);onSound(false);}
  }else if(kind==='pinball'){
   ball.position.set(px(pinball.ball.x),7/30,pz(pinball.ball.y));ball.rotation.z=pinball.ball.spin;const f=pinballFlippers(pinball);f.forEach((p,i)=>{flippers[i].position.set(px(p.x),.2,pz(p.y));flippers[i].rotation.y=-p.angle;});players[0].root.position.set(px(pinball.keeper),0,pz(83));players[0].pose(dt,Math.abs(pinball.keeperDive)*3,0,pinball.flash*.4,0,pinball.keeperDive);
   const defenders=pinballDefenders(pinball.time,pinball.defs,pinball.defJoin,pinball.defs-1);for(let i=0;i<3;i++){players[i+1].root.visible=i<defenders.length;if(i<defenders.length){const p=defenders[i];players[i+1].root.position.set(px(p.x),0,pz(p.y));players[i+1].pose(dt,1.5,Math.atan2(ball.position.x-px(p.x),ball.position.z-pz(p.y)),pinball.bumperCooldown[i]*4);}}
   if(event!==pinball.hitId){event=pinball.hitId;stage.burst(px(pinball.hitX),.4,pz(pinball.hitY),pinball.phase==='goal'?2:1);onSound(pinball.phase==='goal');}
  }else{
   stage.scrollScenery(runner.distance);strips.forEach((m,i)=>m.position.z=7-i*4+runner.distance%4);players[0].root.position.x=runner.x;players[0].pose(dt,runner.lives?6:0,Math.PI,0,runner.y*.65,runner.lane-runner.x/2.4);players[0].body.rotation.x=runner.slide>0?-.8:.1;players[0].root.visible=runner.hurt===0||Math.floor(runner.hurt*12)%2===0;ball.position.set(runner.x+Math.sin(elapsed*12)*.13,.24+runner.y*.2,-.9);ball.rotation.x=-runner.distance;
   runnerObjects.forEach(g=>g.visible=false);used.clear();for(const o of runner.objects){const g=runnerObjects.find(g=>!used.has(g)&&poolKinds.get(g)===o.kind);if(!g)continue;used.add(g);g.visible=true;g.position.set(o.lane*2.4,0,o.z);if(o.kind==='coin')g.rotation.y=elapsed*2;if(o.kind==='goal'){g.getObjectByName('open-lane')!.position.x=o.openLane*2.4;for(const lane of[-1,0,1])g.getObjectByName(`blocked-${lane}`)!.visible=lane!==o.openLane;}if(o.kind==='defender')g.userData.rig.pose(dt,Math.abs(o.z)<8?2:0,0,0,0,0);}
   if(event!==runner.event){event=runner.event;stage.burst(runner.x,.4,-.5,runner.hurt?1:2);onSound(runner.hurt===0);}
  }
  shadow.position.set(ball.position.x,.04,ball.position.z);const h=ball.position.y;shadow.scale.setScalar(1+h*.2);(shadow.material as T.MeshBasicMaterial).opacity=.3/(1+h*.4);
 }
 function hud():ArcadeHUD{if(kind==='tennis')return{score:`${tennis.score.you} : ${tennis.score.rival}`,detail:`Rally ${tennis.rally} · First to 7`,message:tennis.message,over:tennis.phase==='over',ready:tennis.phase==='serve'&&tennis.server==='you'};if(kind==='pinball')return{score:String(pinball.score),detail:`${pinball.goals} goals · ${pinball.balls} balls`,message:pinball.phase==='ready'?(pinball.plunger>.02?`Launch power · ${Math.round(pinball.plunger*100)}%`:'Hold Launch to choose your power.'):pinball.phase==='goal'?'GOAL! Another defender joins the pitch.':'Time your flippers. Find the angle past the keeper.',over:pinball.phase==='over',ready:pinball.phase==='ready'};return{score:String(runner.score),detail:`${runner.goals} goals · ${runner.lives} chances · ${runner.energy}/5 boost · ${districtAt(runner.distance).name}`,message:runner.message,over:runner.lives<=0,ready:false};}
 sync(0);fit();stage.render();return{needsFrames:()=>stage.effectsActive()||(kind==='tennis'?tennisNeedsFrames(tennis):kind==='pinball'?pinball.phase!=='ready'&&pinball.phase!=='over':runner.lives>0),stage,update,reset,action,target,hud,fit,state:{tennis,pinball,runner}};
}

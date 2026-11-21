// Scripted players for scripts/capture-game-shots.cjs: per game, the start button, the game state to log next to each frame, and
// a loop that plays (real touches through CDP) until H.stop.
const airState=()=>{const k=window.__airhockey,g=k&&k.game,s=g&&g.state;return s?{phase:k.phase,p:s.phase,px:+s.px.toFixed(1),py:+s.py.toFixed(1),v:+Math.hypot(s.pvx,s.pvy).toFixed(0),sx:+s.sx[0].toFixed(0),sy:+s.sy[0].toFixed(0),goals:[...s.goals],level:s.level,heat:+s.heat.toFixed(2),rally:s.rally,smash:+(s.t-s.smashT).toFixed(2),bank:s.bank}:null;};
module.exports={
 airhockey:{start:'[data-air-play]',meta:airState,async play(H){const {page,cdp,wait}=H;
  await page.waitForFunction(()=>window.__airhockey&&window.__airhockey.phase==='playing',null,{timeout:10000});
  const L=await page.evaluate(()=>{const k=window.__airhockey;const r=document.querySelector('[data-air-stage]').getBoundingClientRect();return {...k.layout,left:r.left,top:r.top};});
  const P=(x,y)=>({x:L.left+(L.side?L.cx+(y-80)*L.scale:L.cx+(x-50)*L.scale),y:L.top+(L.side?L.cy-(x-50)*L.scale:L.cy+(y-80)*L.scale)});
  let down=false;const send=async(type,x,y)=>{const p=P(x,y);await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:[{x:p.x,y:p.y,id:1}]});};
  while(!H.stop){const s=await page.evaluate(airState);if(!s||s.p==='between'||s.phase!=='playing'){await wait(60);continue;}
   let tx=50,ty=132;if(s.p==='play'&&s.py>82){const ax=50+(s.px<50?9:-9),dx=ax-s.px,dy=-s.py,d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d,rx=s.px-s.sx,ry=s.py-s.sy,along=rx*ux+ry*uy,lat=Math.abs(rx*uy-ry*ux);
     if(along>5&&lat<6){tx=s.px+ux*26;ty=s.py+uy*26;}else if(s.sy<s.py+2){tx=s.px+(s.sx<s.px?-16:16);ty=s.py+10;}else{tx=s.px-ux*15;ty=s.py-uy*15;}}
   else if(s.p==='play'){tx=50+(s.px-50)*.45;ty=138;}
   tx=Math.max(9,Math.min(91,tx));ty=Math.max(89,Math.min(151,ty));if(!down){await send('touchStart',tx,ty);down=true;}else await send('touchMove',tx,ty);await wait(24);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}},
};

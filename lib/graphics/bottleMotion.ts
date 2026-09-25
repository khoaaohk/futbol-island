export type BottleFloat={x:number;y:number;angle:number;vx:number;vy:number;spin:number};
export const createBottleFloat=():BottleFloat=>({x:0,y:0,angle:0,vx:0,vy:0,spin:0});
/** The same travelling surface drives painted water and the bottle's buoyancy. */
export function bottleWaterHeight(t:number,u:number,cycle:number,wash:number){
 return Math.sin(u*Math.PI*2.4-t*1.2+cycle*.4)*(12+30*wash)+Math.sin(u*Math.PI*4+t*.7)*(4+8*wash);
}
/** Bounded spring buoyancy, lateral restoring force and water drag; no allocations. */
export function stepBottleFloat(s:BottleFloat,t:number,wash:number,dt:number){
 const targetX=Math.sin(t*.47)*(8+14*wash),targetY=bottleWaterHeight(t,.5,0,wash)*.6;
 const slope=(bottleWaterHeight(t,.52,0,wash)-bottleWaterHeight(t,.48,0,wash))/.04;
 const targetAngle=Math.max(-9,Math.min(9,slope*.055));
 const count=Math.ceil(Math.min(.08,Math.max(0,dt))*120),h=count?Math.min(.08,dt)/count:0;
 for(let i=0;i<count;i++){s.vx+=(4*(targetX-s.x)-3.8*s.vx)*h;s.vy+=(14*(targetY-s.y)-5.2*s.vy)*h;s.spin+=(9*(targetAngle-s.angle)-4.6*s.spin)*h;s.x+=s.vx*h;s.y+=s.vy*h;s.angle+=s.spin*h;}
}

export type BottleBounds={x:number;y:number};
/** Screen-space current with soft wall rebounds, using the same swell and drag. */
export function driftBottle(s:BottleFloat,t:number,wash:number,dt:number,bounds:BottleBounds,mobile=false,viewport?:BottleViewport){
 const count=Math.ceil(Math.min(.08,Math.max(0,dt))*120),h=count?Math.min(.08,dt)/count:0;
 const speed=mobile?1.4:1;
 const slope=(bottleWaterHeight(t,.52,0,wash)-bottleWaterHeight(t,.48,0,wash))/.04;
 for(let i=0;i<count;i++){
  const directionX=s.vx<0?-1:1,directionY=s.vy<0?-1:1;
  s.vx+=((directionX*(42+22*wash)*speed-s.vx)*.65+Math.sin(t*.7)*5)*h;
  s.vy+=((directionY*(28+18*wash)*speed-s.vy)*.7+Math.sin(t*1.2)*7*wash)*h;
  s.spin+=((32+24*wash)*speed+slope*.04-s.spin)*1.4*h;
  s.x+=s.vx*h;s.y+=s.vy*h;s.angle+=s.spin*h;
  if(viewport)fitBottleToViewport(s,viewport,mobile);
  else{
  if(Math.abs(s.x)>bounds.x){s.x=Math.sign(s.x)*bounds.x;s.vx=-Math.sign(s.x||1)*Math.max(18,Math.abs(s.vx)*.8);s.spin+=22*speed;}
  if(Math.abs(s.y)>bounds.y){s.y=Math.sign(s.y)*bounds.y;s.vy=-Math.sign(s.y||1)*Math.max(12,Math.abs(s.vy)*.78);s.spin+=14*speed;}
  }
 }
}

export type BottleViewport={width:number;height:number;bottleWidth:number;bottleHeight:number};
// Outer glass polygon and cork corners in the SVG's 28 7 124 252 viewBox.
// Project the painted silhouette, not the transparent rotated SVG rectangle.
const BOTTLE_OUTLINE=[69,26,111,26,111,78,133,107,146,142,146,231,130,253,50,253,34,231,34,142,47,107,69,78,73,13,107,13,107,43,73,43];
export function fitBottleToViewport(s:BottleFloat,v:BottleViewport,mobile=false){
 const scale=Math.min(v.bottleWidth/124,v.bottleHeight/252),angle=(s.angle-8)*Math.PI/180,c=Math.cos(angle),sn=Math.sin(angle);
 let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
 for(let i=0;i<BOTTLE_OUTLINE.length;i+=2){const x=(BOTTLE_OUTLINE[i]-90)*scale,y=(BOTTLE_OUTLINE[i+1]-133)*scale,px=x*c-y*sn,py=x*sn+y*c;left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);}
 const stroke=2*scale,minX=-v.width/2-left+stroke,maxX=v.width/2-right-stroke,minY=-v.height/2-top+stroke,maxY=v.height/2-bottom-stroke;
 let hit=0;
 if(s.x<minX){s.x=minX;if(s.vx<0){s.vx=Math.max(18,-s.vx*.8);hit|=1;}}
 else if(s.x>maxX){s.x=maxX;if(s.vx>0){s.vx=-Math.max(18,s.vx*.8);hit|=2;}}
 if(s.y<minY){s.y=minY;if(s.vy<0){s.vy=Math.max(12,-s.vy*.78);hit|=4;}}
 else if(s.y>maxY){s.y=maxY;if(s.vy>0){s.vy=-Math.max(12,s.vy*.78);hit|=8;}}
 if(hit)s.spin+=(hit&3?22:14)*(mobile?1.4:1);
 return hit;
}

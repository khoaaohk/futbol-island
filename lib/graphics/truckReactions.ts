import * as T from 'three';
const MATCH_LINES=["Get off the pitch!","Be nice! Let us play!","This is futbol, not bumper cars!","Can't play? Is that why you're running us over?","You can run us over, but we won't stop playing!","Try passing the ball—not your driving test!","Ref! That's definitely a parking foul!","Our kit doesn't include seatbelts!","Leave us alone—we're on a winning streak!","The car park is THAT way!","Nice wheels. Terrible defending!","You missed the ball by an entire truck!"];
const ISLAND_LINES=[
 "I ordered a taxi, not a tackle!",
 "My groceries didn't sign up for this!",
 "That's one way to interrupt my walk!",
 "Great. Now my smoothie is a milkshake!",
 "I'm a pedestrian, not a speed bump!",
 "The pavement has a no-truck policy!",
 "My step counter does NOT count flying!",
 "Use your brakes, superstar!",
 "You nearly sent my lunch into extra time!",
 "I was having a perfectly normal Tuesday!",
 "I asked for directions, not a lift-off!",
 "Could you honk BEFORE the surprise?",
];
type ReactionContext='match'|'island';
export function applyTruckProtest(root:T.Object3D,time:number,reduced:boolean){
 const arm=(root.userData.truckReactionArm??=root.getObjectByName('right-shoulder')) as T.Object3D|undefined;
 if(arm)arm.rotation.set(-.55+(reduced?0:Math.sin(time*4)*.12),0,.65);
 root.rotation.z=reduced?0:Math.sin(time*2.5)*.025;
}
export function createTruckReactions(scene:T.Scene){
 const root=new T.Group();root.name='truck-reaction-bubbles';scene.add(root);
 const slots:{sprite:T.Sprite;canvas:HTMLCanvasElement;texture:T.CanvasTexture;anchor:T.Object3D|null;delay:number}[]=[];
 let age=Infinity,cooldown=0;const nextLine:Record<ReactionContext,number>={match:0,island:0};
 function trigger(anchors:{root:T.Object3D;context:ReactionContext}[]){
  if(cooldown>0||!anchors.length)return false;
  while(slots.length<3){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=192;const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));sprite.visible=false;root.add(sprite);slots.push({sprite,canvas,texture,anchor:null,delay:0});}
  age=0;cooldown=8;
  slots.forEach((slot,i)=>{slot.anchor=anchors[i]?.root??null;slot.delay=i*.35;slot.sprite.visible=false;if(!slot.anchor)return;const ctx=slot.canvas.getContext('2d')!;ctx.clearRect(0,0,512,192);ctx.fillStyle='#f5eed6';ctx.strokeStyle='#8e9c78';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(3,3,506,165,24);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(242,166);ctx.lineTo(256,189);ctx.lineTo(270,166);ctx.fill();ctx.fillStyle='#294f43';ctx.font='700 26px sans-serif';ctx.textAlign='center';const context=anchors[i].context,lines=context==='match'?MATCH_LINES:ISLAND_LINES;const words=lines[nextLine[context]++%lines.length].split(' '),rows:string[]=[];let row='';for(const word of words){if(ctx.measureText(row+' '+word).width>455){rows.push(row);row=word;}else row+=(row?' ':'')+word;}if(row)rows.push(row);rows.forEach((text,j)=>ctx.fillText(text,256,84-(rows.length-1)*16+j*32));slot.texture.needsUpdate=true;});return true;
 }
 function update(dt:number,reduced:boolean,visible:boolean){cooldown=Math.max(0,cooldown-dt);root.visible=visible;if(age===Infinity||dt<=0)return;age+=dt;if(age>5.2){age=Infinity;slots.forEach(s=>{s.sprite.visible=false;s.anchor=null;});return;}for(const slot of slots){const t=age-slot.delay;slot.sprite.visible=!!slot.anchor&&slot.anchor.visible&&t>=0;if(!slot.sprite.visible||!slot.anchor)continue;slot.sprite.position.copy(slot.anchor.position);slot.sprite.position.y+=3.6;const pop=reduced?1:Math.min(1,t/.16);slot.sprite.scale.set(7*pop,2.625*pop,1);slot.sprite.material.opacity=Math.min(1,(5.2-age)/.5);}}
 return {root,trigger,update,get active(){return age!==Infinity;},dispose(){for(const s of slots){s.texture.dispose();s.sprite.material.dispose();}root.removeFromParent();}};
}

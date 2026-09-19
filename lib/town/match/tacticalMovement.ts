type Point={x:number;y:number};
/** Step perpendicular to a blocked passing lane; hold when it is already clear.
 * Field units match the simulation's 270 × 400 pitch. */
export function laneAdjustment(ball:Point,player:Point,defender:Point,preferredSide:number):Point {
 const dx=player.x-ball.x,dy=player.y-ball.y,length=Math.hypot(dx,dy);
 if(length<15||length>150)return {x:0,y:0};
 const along=((defender.x-ball.x)*dx+(defender.y-ball.y)*dy)/(length*length);
 const cross=((defender.x-ball.x)*-dy+(defender.y-ball.y)*dx)/length;
 if(along<.15||along>.95||Math.abs(cross)>=10)return {x:0,y:0};
 const side=Math.abs(cross)>.8?-Math.sign(cross):preferredSide;
 const distance=(10-Math.abs(cross))*.8;
 return {x:-dy/length*distance*side,y:dx/length*distance*side};
}
/** Screen the ball-to-option lane while staying closer to the marked option. */
export function screenPosition(ball:Point,option:Point):Point {
 return {x:option.x+(ball.x-option.x)*.24,y:option.y+(ball.y-option.y)*.24};
}

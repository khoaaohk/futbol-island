/** Rides & Rollers (gs-jetty) toy icons: see the guide in ./index.ts. */
import {dot,edge,fill,hl,line,shape,type ToyIconSet} from './types';

const TEAL='#2fa4a9',ORANGE='#ff7a45';
const TOWER='M5.4 13.4 6.4 5.4H9.6L10.6 13.4Z';
/** A wheel: a slate tyre and a white hub. */
const wheel=(cx:number,cy:number,r:number,tyre='#7f93a6')=>dot(cx,cy,r,tyre,1.1)+dot(cx,cy,r*.42,'#ffffff',.7);

export const ICONS:ToyIconSet={
 // A kick scooter side on: a teal deck with a kicked-up tail, the stem and T-bar with orange grips, a yellow bell, two orange wheels.
 'scooter-skip':line('M4 11 3.2 2.6','#244d40',2.2)+line('M4 11 3.2 2.8',TEAL,1)+line('M1.4 2.6H5','#244d40',2)+line('M1.4 2.6H5','#ffffff',.8)
  +shape('M.8 1.8H2.2V3.4H.8ZM4.2 1.8H5.6V3.4H4.2Z',ORANGE,.8)+dot(5.2,4.4,.9,'#ffd447',.8)
  +shape('M3 10.6H12.8L14 9.4H15V10.8C15 11.6 14.6 12 14 12H3Z',TEAL,1.2)+fill('M5 10.8h7.2v.6H5Z','#9fe0e2')
  +wheel(4,13.2,1.8,ORANGE)+wheel(13,13.2,1.8,ORANGE)+hl('M5.4 10.4H8',.8),
 // A bicycle side on: two spoked wheels, a cyan diamond frame, saddle, bars, a gold chainring and a bell.
 'bike-bram':dot(3.6,11.2,3.1,'#e4f6fb',1.3)+dot(12.4,11.2,3.1,'#e4f6fb',1.3)
  +line('M3.6 8.6V13.8M1 11.2H6.2M12.4 8.6V13.8M9.8 11.2H15','#9fb4c4',.5)
  +line('M3.6 11.2 6.6 6.6H11.4L12.4 11.2M6.6 6.6 8 11.2 11.4 6.6M3.6 11.2H8M6.6 6.6 6.2 4.8M11.4 6.6 11 4.6 12.8 4.2','#244d40',2)
  +line('M3.6 11.2 6.6 6.6H11.4L12.4 11.2M6.6 6.6 8 11.2 11.4 6.6M3.6 11.2H8M6.6 6.6 6.2 4.8M11.4 6.6 11 4.6 12.8 4.2','#3ec6e0',1)
  +shape('M4.8 4.2H7.6L7.2 5.2H5.2Z',ORANGE,.8)+dot(8,11.2,1.2,'#ffd447',.8)+dot(3.6,11.2,.6,'#ffffff',.6)+dot(12.4,11.2,.6,'#ffffff',.6)+dot(11.4,3.2,.7,'#ffd447',.7),
 // A little moped side on: an orange body and leg shield, a white seat and floorboard, a yellow headlamp and mirror.
 'moped-mo':line('M11.6 11 12.6 13','#244d40',1.4)+line('M13.2 3.4 13.8 1.8','#244d40',.9)+dot(14,1.6,.7,'#c9d3dc',.7)
  +shape('M1.4 11.6C1.4 8.8 3.4 7.4 6 7.4H8.6L9.8 11.6Z',ORANGE,1.3)+shape('M9.2 11.6 10.8 4.2H12.6L11.8 11.6Z',ORANGE,1.2)
  +shape('M5.8 11.2H11.8V12.4H5.8Z','#ffffff',1)+shape('M2.6 7.6C2.6 6.4 3.6 6 4.6 6H8.2C8.8 6 9 6.6 8.6 7.4Z','#ffffff',1)
  +line('M10.4 4 13.6 3.2','#244d40',1.6)+line('M10.4 4 13.6 3.2','#c9d3dc',.6)+dot(12.6,5,1.1,'#ffe14d',.9)
  +wheel(4.2,13,1.8)+wheel(12.6,13,1.8)+hl('M2.6 10C2.8 9.2 3.4 8.6 4.2 8.4',.9),
 // A jetpack: two silver rocket tanks with red nose cones, a red strap pack between, orange-and-yellow flames below.
 'jetpack-jo':shape('M3.4 12.4H6.8L7.6 15.4C6.4 14.8 4.8 14.8 3.6 15.4ZM9.2 12.4H12.6L12.4 15.4C11.2 14.8 9.6 14.8 8.4 15.4Z','#ff9a3c',.9)
  +fill('M4.4 12.4h2v1.6h-2ZM9.8 12.4h2v1.6h-2Z','#ffe14d')
  +shape('M6.2 5H9.8V10.4H6.2Z','#ff4d4d',1)
  +shape('M2.4 4.6C2.4 2.6 3.6 1.4 5 1.4C6.4 1.4 7.6 2.6 7.6 4.6V11H2.4Z','#c9d3dc',1.3)+shape('M8.4 4.6C8.4 2.6 9.6 1.4 11 1.4C12.4 1.4 13.6 2.6 13.6 4.6V11H8.4Z','#c9d3dc',1.3)
  +shape('M2.4 4.6C2.4 2.6 3.6 1.4 5 1.4C6.4 1.4 7.6 2.6 7.6 4.6ZM8.4 4.6C8.4 2.6 9.6 1.4 11 1.4C12.4 1.4 13.6 2.6 13.6 4.6Z','#ff4d4d',1.1)
  +shape('M3 11H7L6.6 12.6H3.4ZM9 11H13L12.6 12.6H9.4Z','#8a9cb0',1)+fill('M2.6 7.6h4.8v.8H2.6ZM8.6 7.6h4.8v.8H8.6Z','#ff4d4d')+hl('M3.6 5.6V9.4'),
 // The ferry: a white hull with a blue stripe, a cabin of round windows, the bridge, a red funnel, riding a blue wave.
 'ferry-fern':shape('M4.4 1.8H6.6V5.4H4.4Z','#e94b3c',1)+fill('M4.4 3h2.2v.8H4.4Z','#ffd447')
  +shape('M8 3H11.6V5.4H8Z','#ffffff',1)+fill('M8.8 3.8h2v.8h-2Z','#8fd0ea')
  +shape('M3 5.4H12.6V8.8H3Z','#ffffff',1.1)+fill('M4 6.4h1.2v1.2H4ZM6.2 6.4h1.2v1.2H6.2ZM8.4 6.4h1.2v1.2H8.4ZM10.6 6.4h1.2v1.2h-1.2Z','#8fd0ea')
  +shape('M.8 8.6H15.2L13.4 12.8H2.8Z','#ffffff',1.3)+fill('M1.4 10h13.2l-.4 1H1.8Z','#2f6fd6')
  +shape('M.6 12.6C2 11.8 3.4 11.8 4.8 12.6C6.2 13.4 7.6 13.4 9 12.6C10.4 11.8 11.8 11.8 13.2 12.6C14 13 14.8 13 15.4 12.8V15.2H.6Z','#4fb8f0',1.1)+hl('M2.2 9.2H5',.9),
 // The rare: the East Jetty lighthouse: a red-and-white striped tower, red gallery and cap, a yellow lantern beaming, on its rock.
 'lighthouse-lumi':line('M10.4 3.2 14.8 1.8M10.4 4 14.8 5.2M5.6 3.2 1.2 1.8M5.6 4 1.2 5.2','#ffd447',1.1)
  +shape(TOWER,'#ffffff',1.3)+fill('M6.2 7H9.8L10 8.6H6ZM5.8 10.2H10.2L10.4 11.8H5.6Z','#e94b3c')+fill('M7.4 13.4V12.6C7.4 12 8.6 12 8.6 12.6V13.4Z','#c48a4a')+edge(TOWER,1.3)
  +shape('M6.4 2.2H9.6V4.6H6.4Z','#ffe14d',1)+shape('M6 2.2 8 .6 10 2.2Z','#e94b3c',.9)+shape('M5 4.6H11V5.6H5Z','#e94b3c',.9)
  +shape('M2.8 15.2C2.8 13.8 4.2 13.2 5.4 13.4H10.6C11.8 13.2 13.2 13.8 13.2 15.2Z','#a9a9b8',1)+line('M.8 15.2H2.4M13.6 15.2H15.2','#4fb8f0',1)+hl('M7 6.2 6.8 7.4',.8),
};

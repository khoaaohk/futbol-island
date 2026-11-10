/** Bug Squad (gs-cayplaza) toy icons: see the guide in ./index.ts. No faces: bugs read by their bodies, legs and wings. */
import {ball,dot,fill,flipX,hl,line,shape,type ToyIconSet} from './types';

/** "Black" bug parts as a bright slate stand-in (owner: no black fills). */
const SLATE='#4d5f86',SIENNA='#a0522d';
const WING_UP='M7.4 7.2C5.8 3.6 3.2 1.6 1.6 2.4C.6 3 1 6.4 2.4 8C3.8 8.6 6 8.2 7.4 7.2Z';
const WING_LO='M7.4 8.4C5 8.2 2.6 9.2 2.6 11.4C2.6 13.4 4.6 14.2 6 13C7 12 7.4 10 7.4 8.4Z';
const monarchHalf=shape(WING_UP,'#ff8f1f',1.2)+shape(WING_LO,'#ff8f1f',1.2)
 +line('M7.2 7 3.4 3.4M7.2 7.2 2.6 6.4M7.2 8.8 4 11.4M7 9.4 5.6 12.6',SIENNA,.6)
 +fill('M1.6 3.4h.8v.8h-.8ZM1.6 5.4h.8v.8h-.8ZM3.2 12.4H4v.8h-.8Z','#ffffff');

export const ICONS:ToyIconSet={
 // A ladybug from above: red wing cases split down the middle, slate spots, slate head with antennae, lime goalie gloves up front.
 'ladybug-libby':line('M3.4 7.4 1.6 6.4M3 10.6 1.2 11.4M12.6 7.4 14.4 6.4M13 10.6 14.8 11.4M5.6 4 3.4 4.6M10.4 4 12.6 4.6','#244d40',1)
  +line('M7 2.2 5.8.8M9 2.2 10.2.8','#244d40',.9)+dot(3,4.6,1.2,'#b6f24a',.9)+dot(13,4.6,1.2,'#b6f24a',.9)
  +shape('M5 4.2C5 2.2 6.4 1.4 8 1.4C9.6 1.4 11 2.2 11 4.2Z',SLATE,1.1)
  +dot(8,9.2,5.6,'#e2452f',1.4)+line('M8 3.6V14.8','#244d40',1)
  +fill('M4.6 6.8h1.6v1.6H4.6ZM9.8 6.8h1.6v1.6H9.8ZM4.2 10.4h1.6V12H4.2ZM10.2 10.4h1.6V12h-1.6ZM6.4 12.4h1.2V14H6.4ZM8.4 12.4h1.2V14H8.4Z',SLATE)+hl('M3.8 8.2C4 6.6 4.8 5.4 5.8 4.8'),
 // A grasshopper side on: a long green body, folded wings, a big springy hind leg with yellow chevrons, a sweatband, a ball.
 'grasshopper-gil':line('M13.4 6.4C13.8 4.4 14.6 3 15.4 2.4M12.8 6.6C12.6 4.6 12.8 3 13.4 1.8','#244d40',.8)
  +line('M6.4 11.6 4.6 14.6M8.6 11.6 8.4 14.4M11.4 11 12.4 13.4','#244d40',1)
  +shape('M1.4 10C1.4 8.6 2.8 7.8 4.4 7.8H10.6C11.4 6.4 13.4 5.6 14.6 6.8C15.6 8 15.2 10.2 13.2 10.8C12.4 11 11.6 11 10.8 10.8H4.4C2.8 11.2 1.4 11.2 1.4 10Z','#7fb13c',1.3)
  +line('M13.4 6.4 14.8 8.4','#ffd84a',1)
  +shape('M2.6 8.6C4.8 7 8.4 7 10.6 8L9.6 9.2H3.2Z','#b6d86a',1)
  +line('M3 4.6 4.2 14.4','#244d40',1.6)+line('M3 4.8 4.1 14.2','#9cd04a',.6)+line('M3.4 14.6H5.2','#244d40',1)
  +shape('M7.6 10C6.4 8.6 3.8 6 2.8 4.6C2.4 3.8 3 3.2 3.8 3.8C5.4 5 8 7.4 9 8.8C9.4 9.6 8.4 10.6 7.6 10Z','#9cd04a',1.1)+line('M4.4 5 5 5.8M5.8 6.2 6.4 7M7.2 7.6 7.8 8.4','#ffd84a',.8)
  +ball(13.2,13.4,1.6,'#4d5f86',.9)+hl('M3 9.2C3.6 8.8 4.4 8.6 5.2 8.6',.8),
 // An ant side on (bright orange-brown), holding the team's crate of blue water bottles above her head.
 'ant-ace':line('M12.4 7.6C13 6 14 5 15.2 4.8M12 7.6C11.8 6 12.2 4.8 13 4.2','#244d40',.8)
  +line('M8.2 10.6 6.6 14.4M9 10.8 9.4 14.4M9.8 10.4 12 13.8M9 9.2 8.6 7.6M9.8 9.2 10.8 7.6','#244d40',1)
  +shape('M3.4 1.4H5V4H3.4ZM6 1.4H7.6V4H6ZM8.6 1.4H10.2V4H8.6Z','#3ec6e0',.8)+fill('M3.4 1.4H5v.8H3.4ZM6 1.4h1.6v.8H6ZM8.6 1.4h1.6v.8H8.6Z','#ffffff')
  +shape('M2.4 3.8H11.2V7.6H2.4Z','#ff9a3c',1.1)+line('M2.4 5.7H11.2','#d06a1c',.7)
  +`<ellipse cx="4.4" cy="10.4" rx="2.8" ry="2.2" fill="#b5652a" stroke="#244d40" stroke-width="1.2"/>`
  +`<ellipse cx="8.8" cy="10" rx="1.6" ry="1.2" fill="#b5652a" stroke="#244d40" stroke-width="1.1"/>`+dot(12.2,9.2,1.8,'#b5652a',1.2)+hl('M3 9.4C3.4 8.8 4 8.6 4.6 8.6',.8),
 // A dragonfly from above: four clear wings with gold tip weights, a long cyan body with green bands.
 'dragonfly-dax':`<ellipse cx="4.6" cy="5" rx="3.8" ry="1.3" fill="#c9f2ff" stroke="#244d40" stroke-width="1" transform="rotate(-12 4.6 5)"/>`
  +`<ellipse cx="11.4" cy="5" rx="3.8" ry="1.3" fill="#c9f2ff" stroke="#244d40" stroke-width="1" transform="rotate(12 11.4 5)"/>`
  +`<ellipse cx="4.8" cy="8" rx="3.6" ry="1.2" fill="#c9f2ff" stroke="#244d40" stroke-width="1" transform="rotate(10 4.8 8)"/>`
  +`<ellipse cx="11.2" cy="8" rx="3.6" ry="1.2" fill="#c9f2ff" stroke="#244d40" stroke-width="1" transform="rotate(-10 11.2 8)"/>`
  +fill('M1 4.6h1.2v1H1ZM13.8 4.6H15v1h-1.2ZM1.4 7.8h1.2v1H1.4ZM13.4 7.8h1.2v1h-1.2Z','#ffd447')
  +line('M8 4V15','#244d40',2.4)+line('M8 4.2V14.8','#3ec6e0',1.2)+line('M7.6 8.6h.8M7.6 10.6h.8M7.6 12.6h.8','#7ad6a6',1)
  +dot(8,5.4,1.3,'#3ec6e0',1)+dot(8,2.8,1.4,'#7ad6a6',1)+hl('M2.4 4.8 4.4 4.4',.7),
 // A firefly from above: a salmon hood, green wing cases, and a big glowing yellow tail with amber rings and light rays.
 'firefly-fia':line('M2 12.4 .8 12.8M14 12.4 15.2 12.8M3.4 14.8 2.6 15.6M12.6 14.8 13.4 15.6M8 15.2V15.8','#ffd447',1)
  +line('M7.2 2.4 5.8.8M8.8 2.4 10.2.8','#244d40',.9)
  +dot(8,11.4,3.6,'#ffe878',1.3)+line('M4.8 12.4C6.6 13.6 9.4 13.6 11.2 12.4M5.6 14C7 14.8 9 14.8 10.4 14','#f0a020',.8)+dot(8,11.6,1.2,'#fffbd0',0)
  +shape('M4.2 9.4C3.8 6 5.6 4 8 4C10.4 4 12.2 6 11.8 9.4C10.2 10.6 5.8 10.6 4.2 9.4Z','#6aa36f',1.2)+line('M8 4.4V10.2','#244d40',.9)
  +shape('M5.6 4.6C5.6 2.8 6.6 1.8 8 1.8C9.4 1.8 10.4 2.8 10.4 4.6Z','#ff9a80',1)+hl('M5.2 8.4C5.2 7 5.6 6 6.4 5.4',.8),
 // The rare: a monarch butterfly from above: orange wings with sienna veins and white-dotted edges, antennae with knobs.
 'monarch-mara':monarchHalf+flipX(monarchHalf)
  +line('M8 4.4V13','#244d40',2.2)+line('M8 4.6V12.8',SIENNA,1)+line('M7.6 4.4 6.2 1.6M8.4 4.4 9.8 1.6','#244d40',.8)
  +dot(6.2,1.4,.5,SIENNA,.6)+dot(9.8,1.4,.5,SIENNA,.6)+hl('M2.2 3.6C2.6 3 3.2 3 3.8 3.4',.8),
};

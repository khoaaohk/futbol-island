/** Reef Friends (gs-sharks) toy icons: see the guide in ./index.ts. No faces: sea life reads by its body, fins and markings. */
import {dot,edge,fill,hl,line,shape,type ToyIconSet} from './types';

const SHARK='M1.2 5.8C2.4 7 3.4 7.6 4.4 7.8C6.4 6 9.6 5.4 12.4 6.4C14 7 15 8 15 8.8C14.2 10.4 11.6 11.4 8.6 11.4C6.6 11.4 5 10.8 4.2 10.2C3.2 10.6 2.2 11.4 1.2 12.4C1.8 10.4 1.8 7.8 1.2 5.8Z';
const FISH='M3 8C4.2 5 7 4 9.6 4.4C12.6 4.8 14.6 6.6 14.8 8C14.6 9.6 12.6 11.2 9.6 11.6C7 12 4.2 11 3 8Z';
const MANTA='M8 3.4C9.4 3.4 10.4 4.2 11 5.2C12.6 6 14.4 7.6 15.2 9.6C13 9.8 11 10.4 9.6 12C9 12.6 8.6 13 8 13C7.4 13 7 12.6 6.4 12C5 10.4 3 9.8.8 9.6C1.6 7.6 3.4 6 5 5.2C5.6 4.2 6.6 3.4 8 3.4Z';
const WHALE='M.8 9.2C.8 6.8 3.2 5.4 6.2 5.4C9.2 5.4 11.4 6.8 12.6 8.4L13.4 7.6C13.8 8.8 13.6 9.8 13 10.6C11.8 12.4 9.2 13.2 6.2 13.2C3 13.2.8 11.8.8 9.2Z';

export const ICONS:ToyIconSet={
 // A reef shark side on: blue-grey with a white belly, a tall dorsal fin, gill slits and a gold wind-up key on his back.
 'reef-shark-remi':line('M5.4 7V4.6','#244d40',1.2)+dot(4,3.8,1.3,'#ffd447',.8)+dot(6.8,3.8,1.3,'#ffd447',.8)+shape('M4.8 3.2H6V4.8H4.8Z','#ffd447',.7)
  +shape('M7.4 6 9 2.2C9.6 3.4 10.2 4.8 10.4 6Z','#7fa3c2',1.1)
  +shape(SHARK,'#7fa3c2',1.4)+fill('M5 10C6.6 10.8 8.2 11 9.6 10.8C11.6 10.6 13.4 9.8 14.4 8.8L14.8 9.2C14 10.6 11.6 11.4 8.6 11.4C6.6 11.4 5.6 10.8 5 10Z','#ffffff')+edge(SHARK,1.4)
  +shape('M8.4 10.2 7.2 13.6 10.4 10.8Z','#7fa3c2',1)+line('M11.2 7.6V9M12 7.6V9','#4f6f8f',.6)+hl('M5.6 7.6C7 6.8 8.6 6.4 10 6.4',.9),
 // A clownfish in her anemone: orange with three white bands, orange fins, pink tentacles waving below.
 'clownfish-coco':line('M3 15.4C2.6 14 3.6 13.4 3.2 12.2M5.6 15.4C5.2 13.6 6.4 13 6 11.8M10.2 15.4C10.8 13.6 9.6 13 10 11.8M12.8 15.4C13.2 14 12.2 13.4 12.6 12.2','#244d40',2)
  +line('M3 15.4C2.6 14 3.6 13.4 3.2 12.2M5.6 15.4C5.2 13.6 6.4 13 6 11.8M10.2 15.4C10.8 13.6 9.6 13 10 11.8M12.8 15.4C13.2 14 12.2 13.4 12.6 12.2','#ff8fc8',1)
  +shape('M3.6 8 1 5V11Z','#ff7f2a',1.1)+shape('M7.4 4.6 9 2.4 11 4.8Z','#ff7f2a',1)
  +shape(FISH,'#ff7f2a',1.4)+fill('M5.2 5.6C5.8 6.6 5.8 9.4 5.2 10.4L6.6 11C7.2 9.6 7.2 6.4 6.6 5Z','#ffffff')
  +fill('M8.4 4.4C9 6 9 10 8.4 11.6H9.8C10.4 10 10.4 6 9.8 4.4Z','#ffffff')+fill('M12.2 5.2C12.6 6.6 12.6 9.4 12.2 10.8L13.2 10.2C13.6 9 13.6 7 13.2 5.8Z','#ffffff')
  +line('M5.2 5.6C5.8 6.6 5.8 9.4 5.2 10.4M6.6 5C7.2 6.4 7.2 9.6 6.6 11M8.4 4.4C9 6 9 10 8.4 11.6M9.8 4.4C10.4 6 10.4 10 9.8 11.6M12.2 5.2C12.6 6.6 12.6 9.4 12.2 10.8','#244d40',.5)
  +edge(FISH,1.4)+hl('M4.2 7.2C4.6 6.4 5.2 5.8 5.8 5.4',.8),
 // An octopus: a purple spotted dome, arms curling over the sand, two arms up juggling balls.
 'octo-otto':line('M4.4 9.4C3 11 1.4 11.4 1.2 13M6.2 9.8 5.4 13.4C5.2 14.6 4 15 3.6 14.2M9.8 9.8 10.6 13.4C10.8 14.6 12 15 12.4 14.2M11.6 9.4C13 11 14.6 11.4 14.8 13M3.8 7C2.2 6.6 1.6 5.4 2 4.2M12.2 7C13.8 6.6 14.4 5.4 14 4.2','#244d40',2.6)
  +line('M4.4 9.4C3 11 1.4 11.4 1.2 13M6.2 9.8 5.4 13.4C5.2 14.6 4 15 3.6 14.2M9.8 9.8 10.6 13.4C10.8 14.6 12 15 12.4 14.2M11.6 9.4C13 11 14.6 11.4 14.8 13M3.8 7C2.2 6.6 1.6 5.4 2 4.2M12.2 7C13.8 6.6 14.4 5.4 14 4.2','#c45ab3',1.3)
  +shape('M3.6 7.8C3.6 3.8 5.4 1.4 8 1.4C10.6 1.4 12.4 3.8 12.4 7.8C12.4 9.4 11.6 10.2 8 10.2C4.4 10.2 3.6 9.4 3.6 7.8Z','#c45ab3',1.4)
  +fill('M6 4h1.2v1.2H6ZM9.6 5.2h1.2v1.2H9.6ZM7.4 7.4h1.2v1.2H7.4ZM5 7.8h.8v.8H5Z','#ffd0f0')
  +dot(2,2.4,1.2,'#ffd447',.9)+dot(14,2.4,1.2,'#3ec6e0',.9)+hl('M5 6.4C5 4.6 5.6 3.4 6.6 2.8'),
 // A manta ray from above: a wide navy-blue diamond, the two front horn fins, white shoulder chevrons, a thin tail.
 'manta-maya':line('M8 12.8V15.4','#244d40',1.6)+line('M8 13V15.2','#3f5f9a',.6)
  +shape('M6.6 3.8 5.8 1.6 7.4 3.4ZM9.4 3.8 10.2 1.6 8.6 3.4Z','#3f5f9a',.9)
  +shape(MANTA,'#3f5f9a',1.4)+fill('M4.4 6.6 7 7.8 6.6 8.8 3.8 7.6ZM11.6 6.6 9 7.8 9.4 8.8 12.2 7.6Z','#f3f6fb')
  +hl('M3 8.4C3.8 7.4 4.8 6.6 5.8 6',.9),
 // A sea turtle from above: a green shell with a lighter scute pattern, tan flippers and head, a plumeria flower on her shell.
 'turtle-tali':shape('M4.4 6C2.6 4.6 1 4.4.8 5.4C.8 6.6 2.4 7.6 3.8 8.2ZM11.6 6C13.4 4.6 15 4.4 15.2 5.4C15.2 6.6 13.6 7.6 12.2 8.2Z','#d9c27a',1)
  +shape('M4.8 12.4C3.6 13 2.8 14 3.2 14.6C3.8 15 5 14.2 5.8 13.4ZM11.2 12.4C12.4 13 13.2 14 12.8 14.6C12.2 15 11 14.2 10.2 13.4Z','#d9c27a',1)
  +dot(8,2.4,1.6,'#d9c27a',1.1)
  +`<ellipse cx="8" cy="8.8" rx="4.8" ry="5.2" fill="#4f8a4b" stroke="#244d40" stroke-width="1.4"/>`
  +shape('M8 6.2 9.8 7.4V9.8L8 11 6.2 9.8V7.4Z','#79b56a',.7)+line('M8 3.8V6.2M9.8 7.4 12.4 6.4M9.8 9.8 12.4 11M6.2 7.4 3.6 6.4M6.2 9.8 3.6 11M8 11V13.8','#79b56a',.7)
  +dot(10.6,5.6,1,'#ffffff',.7)+dot(11.8,6.4,.9,'#ffffff',.7)+dot(10.2,6.8,.9,'#ffffff',.7)+dot(10.9,6.2,.5,'#ffd447',0)+hl('M4.4 7.2C4.8 6 5.4 5.2 6.2 4.6',.9),
 // The rare: a humpback whale side on: blue back, pale pleated throat, a long pale flipper, raised flukes and a spout.
 'whale-wendell':line('M3.8 5V2.4M3.8 2.6C3 1.6 2.2 1.6 1.6 2.2M3.8 2.6C4.6 1.6 5.4 1.6 6 2.2','#8fd0ea',1.1)
  +shape('M12.8 8.6 12 5.4 13.8 6.8 15.2 4.8 15.2 7.6Z','#3b5f8a',1)
  +shape(WHALE,'#3b5f8a',1.4)+fill('M1.6 10.4C3 12.2 6 12.8 8.6 12.6C10.6 12.4 12 11.6 12.8 10.6C11.6 12.4 9.2 13.2 6.2 13.2C3.6 13.2 1.8 12.2 1.6 10.4Z','#bfe3ff')
  +line('M3 11.6H6.6M4 12.4H7.6','#8fb8dc',.5)+edge(WHALE,1.4)
  +shape('M5.4 10.8 7.4 14.6 8.4 14.2 7.4 10.8Z','#bfe3ff',1)+fill('M2.6 8h.6v.6h-.6ZM9.4 6.6h.6v.6h-.6Z','#ffffff')+hl('M2.4 7.8C3 6.8 4 6.2 5.2 6',.9),
};

/** Trophies & Legends (gs-oldtown) toy icons: see the guide in ./index.ts. */
import {ball,dot,edge,fill,hl,line,shape,type ToyIconSet} from './types';

const GOLD='#f5c542',DEEP='#d9a520',GREEN='#3d8f4f';

export const ICONS:ToyIconSet={
 // A gold loving cup: two big handles, a stem and foot, green-and-white ribbons on one handle, a red plinth with a gold plate.
 'cup-captain':line('M3.8 3.2C.8 3.2 1 7.4 4.6 7.6M12.2 3.2C15.2 3.2 15 7.4 11.4 7.6','#244d40',2.6)+line('M3.8 3.2C.8 3.2 1 7.4 4.6 7.6M12.2 3.2C15.2 3.2 15 7.4 11.4 7.6',GOLD,1.2)
  +shape('M3.6 1.6H12.4V4.4C12.4 7.6 10.4 9.6 8 9.6C5.6 9.6 3.6 7.6 3.6 4.4Z',GOLD,1.4)+fill('M3.8 2.8h8.4v.8H3.8Z',DEEP)
  +shape('M7.2 9.4H8.8V11.2H7.2ZM5.2 11.2H10.8V12.6H5.2Z',GOLD,1)+shape('M3.4 12.6H12.6V15H3.4Z','#c0573a',1.1)+fill('M6.4 13.2h3.2v1.2H6.4Z',GOLD)
  +line('M13.6 6.8 14.2 10.2',GREEN,1.1)+line('M13.2 7 12.8 9.8','#ffffff',1)+hl('M5.2 3.8C5.2 5.4 5.6 6.6 6.4 7.4'),
 // A gold winner's medal on a green-and-white striped ribbon: a raised rim and a star.
 'medal-milo':shape('M2.6.8H6.6L9.4 7.2H5.4Z',GREEN,1.1)+shape('M13.4.8H9.4L6.6 7.2H10.6Z',GREEN,1.1)+line('M4.6 1.2 7.2 6.8M11.4 1.2 8.8 6.8','#ffffff',.8)
  +dot(8,10.4,4.4,GOLD,1.4)+`<circle cx="8" cy="10.4" r="3.1" fill="none" stroke="${DEEP}" stroke-width=".8"/>`
  +shape('M8 8 8.7 9.5 10.3 9.6 9.1 10.6 9.5 12.2 8 11.3 6.5 12.2 6.9 10.6 5.7 9.6 7.3 9.5Z','#fff1b0',.7)+hl('M4.8 9.4C5 8.4 5.6 7.6 6.4 7.2'),
 // A chrome pea whistle: the mouthpiece, the round chamber, its slot and pea, the ring with yellow and red cards.
 'whistle-wyn':line('M12.6 6.6C13.4 4.6 12.4 3.4 11 3.2','#e94b3c',1.1)+dot(12.4,7,1,'#d6e2ee',.9)
  +shape('M1.4 7H7.6V7.8C8.4 7 9.4 6.6 10.4 6.6C13 6.6 14.8 8.4 14.8 10.8C14.8 13.2 13 15 10.4 15C7.8 15 6 13.2 6 10.8V10.2H1.4Z','#d6e2ee',1.3)
  +fill('M3.6 7.2h2.4v1.2H3.6Z','#7f93a6')+dot(10.4,10.8,1.6,'#ffd447',.8)
  +shape('M9 .8 11.6 1.4 11 4.6 8.4 4Z','#ffd447',.9)+shape('M11.8 1 14.4 .8 14.6 4 12 4.2Z','#e94b3c',.9)+hl('M1.8 7.4H4',.9),
 // A green-and-white supporters' scarf round a neck: two striped tails, one crossing over, tassels at the ends.
 'scarf-skye':line('M4 14v1.2M5 14v1.2M6 14v1.2M8.4 14.4l-.2 1M9.6 14.4l-.2 1M10.8 14.4l-.2 1',GREEN,.8)
  +shape('M3.6 6V4C3.6 2 5.4 1 8 1C10.6 1 12.4 2 12.4 4V6H9.6V4.4C9.6 3.6 9 3.2 8 3.2C7 3.2 6.4 3.6 6.4 4.4V6Z',GREEN,1.2)
  +shape('M3.6 5.4H6.6V14H3.6Z',GREEN,1.2)+fill('M3.6 7.6h3v1.2h-3ZM3.6 10.8h3V12h-3Z','#ffffff')+edge('M3.6 5.4H6.6V14H3.6Z')
  +shape('M9.6 5.4H12.6L11 14.4H8Z',GREEN,1.2)+fill('M9.2 7.6h3.1l-.2 1.2H9ZM8.6 10.8h3.1l-.2 1.2H8.4Z','#ffffff')+edge('M9.6 5.4H12.6L11 14.4H8Z')
  +hl('M4.4 3.4C5 2.4 6 2 7 1.8',.9),
 // The 1970 TV ball: a white panel ball with dark slate patches and a rabbit-ear antenna.
 'tv-ball-tico':line('M8 4.4 4.6 1.2M8 4.4 11.4 1.2','#244d40',1.6)+line('M8 4.4 4.6 1.2M8 4.4 11.4 1.2','#c9d3d6',.7)
  +dot(4.4,1.2,.8,'#e94b3c',.8)+dot(11.6,1.2,.8,'#e94b3c',.8)+ball(8,9.6,5.4,'#5a6b8c',1.4)+hl('M3.8 8.4C4.2 6.8 5.2 5.6 6.4 5',1.1),
 // The rare: the Old Town Ground: a bowl of stands with a colourful crowd, a green pitch, two floodlights beaming.
 'stadium-stan':line('M2 9V2.6M14 9V2.6','#244d40',1.6)+line('M2 9V2.8M14 9V2.8','#c9d3d6',.7)
  +shape('M.8 1.2H3.2V3H.8ZM12.8 1.2H15.2V3H12.8Z','#ffe9a8',.8)+line('M3.6 2.4 5.6 4.4M12.4 2.4 10.4 4.4','#ffd447',.9)
  +shape('M1 9.4C1 6.8 4.2 5.4 8 5.4C11.8 5.4 15 6.8 15 9.4V12C15 14 11.8 15.2 8 15.2C4.2 15.2 1 14 1 12Z','#6cb0e0',1.3)
  +fill('M2.6 10.4h.8v.8h-.8ZM4 12.2h.8v.8H4ZM12.2 12.2h.8v.8h-.8ZM13 10.2h.8v.8H13ZM6 13.6h.8v.8H6ZM9.4 13.6h.8v.8h-.8Z','#ffd447')
  +fill('M3.2 11.4h.8v.8h-.8ZM12.4 11.2h.8v.8h-.8ZM7.6 14h.8v.8h-.8Z','#ff65c8')
  +`<ellipse cx="8" cy="9.6" rx="4.6" ry="2.4" fill="${GREEN}" stroke="#244d40" stroke-width="1"/>`
  +line('M8 7.4V11.8','#ffffff',.6)+`<circle cx="8" cy="9.6" r=".9" fill="none" stroke="#ffffff" stroke-width=".5"/>`+hl('M2.2 8.6C2.8 7.6 3.8 7 4.8 6.6',.9),
};

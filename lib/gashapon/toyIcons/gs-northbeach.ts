/** Shell Seekers (gs-northbeach) toy icons: see the guide in ./index.ts. */
import {ball,dot,fill,hl,line,shape,type ToyIconSet} from './types';

const STAR='M8 1.4Q8.9 1.4 9.7 6.1Q14.5 5.6 14.8 6.4Q15 7.3 10.8 9.4Q12.8 13.5 12.2 14.1Q11.5 14.6 8 11.4Q4.5 14.6 3.8 14.1Q3.2 13.5 5.2 9.4Q1 7.3 1.2 6.4Q1.5 5.6 6.3 6.1Q7.1 1.4 8 1.4Z';

export const ICONS:ToyIconSet={
 // A five-armed orange sea star with pale tubercle bumps down every arm.
 'starfish-stella':shape(STAR,'#ff8a5c',1.4)
  +fill('M7.6 3.6h.8v.8h-.8ZM7.6 5.4h.8v.8h-.8ZM11.4 6.8h.8v.8h-.8ZM12.8 6.6h.8v.8h-.8ZM10.2 10.6h.8v.8h-.8ZM11 12.2h.8v.8H11ZM5 10.6h.8v.8H5ZM4.2 12.2h.8v.8h-.8ZM3.8 6.8h.8v.8h-.8ZM2.4 6.6h.8v.8h-.8Z','#ffd0b5')
  +dot(8,8.4,1.2,'#ffd0b5',.8)+hl('M7 5.4 7.4 3.4',.9),
 // A hermit crab in a borrowed spiral shell: one big claw out front, legs, tiny white football boots.
 'hermit-hank':line('M5.6 11.6 4.2 13.4M7.4 12 7 13.6','#244d40',1)
  +shape('M3.8 13.2H5.6V14.8H3.2C3.2 14 3.4 13.4 3.8 13.2ZM6.8 13.4H8.4V14.8H6.2C6.2 14 6.4 13.6 6.8 13.4Z','#ffffff',.8)
  +shape('M3.6 9.4C3.6 8 5 7.4 6.4 7.6L8 11.6C6.6 12.6 3.6 12 3.6 9.4Z','#ff7a5a',1.1)
  +shape('M3.2 9.6C1.6 9.8 .8 8.6 1.2 7.4C1.6 6.4 2.8 6 3.6 6.6L2.6 7.6 4 8.4C4.2 9 3.8 9.4 3.2 9.6Z','#ff7a5a',1)
  +dot(9.8,7.4,5,'#d97b4a',1.4)+line('M9.8 7.4C10.8 7.4 11 8.6 10 8.8C8.6 9 8.2 7.2 9 6.4C10.2 5.2 12.2 6 12.4 7.8C12.6 10 10.2 11.2 8.2 10.4','#ffd0b5',1)
  +fill('M7.4 3.4h1v1h-1ZM12.6 4h1v1h-1Z','#ffd0b5')+hl('M6 5.4C6.6 4 7.6 3.2 8.8 2.8'),
 // A flat sand dollar seen from above: a five-petal flower of pores and five little slots.
 'sand-dollar-dee':dot(8,8,6.6,'#f3eee2',1.4)
  +[0,72,144,216,288].map(a=>`<ellipse cx="8" cy="5.3" rx=".9" ry="1.9" fill="#c9bfa5" transform="rotate(${a} 8 8)"/>`).join('')
  +[36,108,180,252,324].map(a=>`<path d="M8 12.2V13.4" fill="none" stroke="#b3a684" stroke-width="1" stroke-linecap="round" transform="rotate(${a} 8 8)"/>`).join('')
  +dot(8,8,.7,'#b3a684',0)+hl('M3.2 6.2C3.6 4.8 4.4 3.8 5.4 3.2',1.1),
 // A pink conch: a stepped spiral spire, knobbed shoulder and a flared coral-pink lip.
 'conch-connie':shape('M2.2 2.2 7.4 3.8C10.6 3.8 13.8 5.4 14.6 8.6C15.2 11.2 13.4 13.8 10.6 14.6C7.8 15.2 5.2 13.8 4.8 11.2C4.4 8.8 5 7.2 5.8 6.2Z','#f7c6b0',1.4)
  +line('M3.6 2.6 3.2 3.8M5.2 3.2 4.6 4.8M6.6 3.6 5.8 5.6','#e98a6b',.9)
  +dot(9.6,4,.8,'#f7c6b0',.9)+dot(12,4.8,.8,'#f7c6b0',.9)+dot(13.8,6.6,.8,'#f7c6b0',.9)
  +shape('M8.4 7.8C11.2 7.2 13.4 9.4 12.8 11.8C12.4 13.4 10.2 14 8.8 13.2C7.4 12.2 7.2 9.2 8.4 7.8Z','#ff8fa0',1)
  +line('M9.4 9.2C10.4 9.6 10.6 11 10 12','#ffd0c0',.8)+hl('M5.8 8.4C6 7.4 6.4 6.8 7 6.4',.9),
 // A cheeky gull standing by a ball: white body, grey wing with blue-grey tips and a white mirror, a yellow beak with its red spot.
 'seagull-sully':line('M6.6 12 6.2 14.6M8.6 12 8.8 14.6','#ff9a3c',1)+line('M5.4 14.8H7M8.2 14.8H9.8','#ff9a3c',1)
  +shape('M3.4 4.6 .8 5.4 3.4 6.4Z','#ffb03b',.9)+fill('M1.8 5.2h.8v.6h-.8Z','#e94b3c')
  +shape('M3 6C3 4 4.4 2.6 6.4 2.6C8.2 2.6 9.2 3.8 9.4 5.4L14.8 8.8C13.6 11 11 12.2 8.2 12.2C5 12.2 3 10.2 3 7.6Z','#ffffff',1.3)
  +shape('M6 7.6C8.2 6.4 11.6 7 14.8 8.8C12.4 10.2 8.8 10.4 6 7.6Z','#b9c8d6',1)+fill('M11.6 8 14.4 8.8C13.6 9.4 12.6 9.8 11.6 10Z','#6f87a6')+dot(12.6,9,.4,'#ffffff',0)
  +ball(12.8,13.4,1.6,'#4d5f86',.9)+hl('M4.4 6C4.4 4.8 5 4 5.8 3.6',.9),
 // The rare: a frosted green sea-glass pebble, a clear frosted window, sparkles round it.
 'sea-glass-gem':shape('M3.2 6.4C4.4 3.4 8.6 2.2 11.6 3.4C14.4 4.6 15 8.6 13.4 11.4C11.8 14.2 7.4 14.8 4.6 13.2C2 11.8 2 8.8 3.2 6.4Z','#7ad6a6',1.4)
  +fill('M5.4 6.6C6.4 5 9 4.4 10.8 5.2C12.2 5.8 12.4 7.8 11.4 9.2C10 11 6.6 11.4 5.2 9.8C4.6 9 4.8 7.6 5.4 6.6Z','#b4f0d2')
  +fill('M7.4 7.4 9.6 6.8 10.2 8.2 8.4 9.4Z','#d8fff0')
  +line('M14.2 1v2.4M13 2.2h2.4M1.6 12.4v2M.6 13.4h2','#3ec6e0',.9)+hl('M4.2 7.4C4.6 6 5.6 4.8 6.8 4.2',1.1),
};

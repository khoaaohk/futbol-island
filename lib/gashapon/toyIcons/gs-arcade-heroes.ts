/** Cabinet Heroes (gs-arcade-heroes) toy icons: see the guide in ./index.ts. */
import {dot,fill,hl,line,shape,type ToyIconSet} from './types';

export const ICONS:ToyIconSet={
 // Striker Sparky celebrating: pink spiky hair, both arms up, a pink kit with a white bolt, a ball at his feet.
 'striker-sparky':line('M5.2 7.4 2.6 3.6M10.8 7.4 13.4 3.6','#244d40',2.4)+line('M5.2 7.4 2.6 3.6M10.8 7.4 13.4 3.6','#f2c39a',1.2)
  +shape('M5 7H11L10.4 12H5.6Z','#ff65c8',1.2)+fill('M8.6 7.8 7 9.8H8.2L7.4 11.4 9.4 9.2H8.2Z','#ffffff')
  +line('M6.8 12.2V14.4M9.2 12.2V14.4','#244d40',2)+line('M6.8 12.2V14.2M9.2 12.2V14.2','#f2c39a',1)
  +dot(8,4.4,2.2,'#f2c39a',1.1)+shape('M5.6 5C5.2 3.4 5.6 2.4 6.4 1.8L5.6.8 7.6 1.2 8.4.4 9.2 1.4 11.2 1 10.4 2.2 11.6 3 10.4 3.4C10.6 4 10.6 4.6 10.4 5C9.8 4.2 9.2 3.8 8.4 3.8C7.4 3.8 6.4 4.2 5.6 5Z','#ff4fb8',.9)
  +dot(12.6,13.6,1.6,'#ffffff',1)+fill('M12.2 13.2h.8v.8h-.8Z','#7fa0b0')+hl('M13.2 3.4 12.4 4.6',.6),
 // Breakaway Bolt's racing shoe: a cyan sprint sneaker with pink laces, a white sole and speed streaks.
 'breakaway-bolt':line('M.8 6.4H4M1.4 8.8H3.6M.8 11.2H3','#60e9f2',1.2)
  +shape('M4.6 12.6V6.4C4.6 5.2 5.4 4.4 6.6 4.4H8.2C8.8 4.4 9.2 4.8 9.4 5.4L10 7.4C12.6 7.6 14.8 9 15 11.4V12.6Z','#3fd6e8',1.3)
  +shape('M4.2 12.4H15.2V14.2H4.2Z','#ffffff',1.1)+line('M6.8 6.6 8.6 7.4M6.6 8.4 9 9.2','#ff65c8',1)+line('M11 9.8 14.2 11','#ffffff',.9)+hl('M5.6 7V9.4'),
 // Tennis Tess: a felt tennis ball with its white seam curve and a purple sweatband.
 'tennis-tess':dot(8,8.6,6.2,'#d9f25a',1.4)+line('M2.6 5.4C5.4 7 5.4 11.6 3.2 13M13.4 5.4C10.6 7 10.6 11.6 12.8 13','#ffffff',1)
  +shape('M2.4 5C5 3.4 11 3.4 13.6 5L13.2 7C10.6 5.6 5.4 5.6 2.8 7Z','#a77bff',1)+line('M13.4 6 15 7.6M14.8 5.6 15.4 8.4','#a77bff',1)+hl('M4.6 9.4C4.8 11 5.4 12 6.2 12.6',.9),
 // Flipper Finn: a mini pinball table: two pink bumpers, a goal at the top, pink flippers and a steel ball.
 'flipper-finn':shape('M2.6 1.4H13.4L14.6 14.6H1.4Z','#60e9f2',1.3)+shape('M5.6 2.4H10.4V4H5.6Z','#ffffff',.9)+line('M6.6 2.8v.8M8 2.8v.8M9.4 2.8v.8','#7fa0b0',.5)
  +dot(5.4,7,1.5,'#ff65c8',1)+dot(10.6,7,1.5,'#ff65c8',1)+dot(8,9.4,1.1,'#ffd447',.9)
  +shape('M3.4 11.6 6.8 13.2 6.4 13.8 3 12.4Z','#ff4fb8',.9)+shape('M12.6 11.6 9.2 13.2 9.6 13.8 13 12.4Z','#ff4fb8',.9)+dot(9.4,11.2,.9,'#e4ecf0',.8)+hl('M3.4 3 3 6.4',.9),
 // Puzzle Pip: a pink jigsaw tile with a yellow passing arrow across it.
 'puzzle-pip':shape('M2 3.6H6C5.6 2.8 5.6 1.4 7 1.4C8.4 1.4 8.4 2.8 8 3.6H12.4V7.4C13.2 7 14.6 7 14.6 8.4C14.6 9.8 13.2 9.8 12.4 9.4V13.6H8.6C9 12.8 9 11.4 7.6 11.4C6.2 11.4 6.2 12.8 6.6 13.6H2Z','#ff65c8',1.3)
  +line('M4 10.4 9 6.2','#ffe14d',1.4)+shape('M8 5.4 10.4 5.2 9.8 7.6Z','#ffe14d',.8)+dot(4,10.6,1,'#ffffff',.8)+hl('M3.2 5V7.6'),
 // The rare: the Claw Club claw, gripping a gold bean buddy.
 'claw-club-bean':line('M8 .4V4','#9aa8b0',1.4)+shape('M5.4 3.6H10.6V5.8H5.4Z','#4f97a6',1.1)
  +line('M6 5.6 3.6 8.4 4.4 11M10 5.6 12.4 8.4 11.6 11','#244d40',2.2)+line('M6 5.6 3.6 8.4 4.4 11M10 5.6 12.4 8.4 11.6 11','#c9d3d6',1.1)
  +`<ellipse cx="8" cy="10.4" rx="3.2" ry="4" fill="#efbf55" stroke="#244d40" stroke-width="1.3"/>`+fill('M6.4 13.6h3.2v.8H6.4Z','#d99a32')
  +line('M2 13.6 2.6 14.4M13.6 1.8l.8.8M14.4 1.8l-.8.8','#ffd447',.9)+hl('M6.2 8.4C6.4 7.6 6.8 7.2 7.4 7',.9),
};

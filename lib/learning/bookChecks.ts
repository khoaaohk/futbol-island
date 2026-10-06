import type {PlayerBookId} from '../books/catalog';
import type {ConceptId} from './conceptMap';
import type {Format} from '../town/venues';
/**
 * "Take it to your game" (docs/learning/apply-in-play.md): one question after a pop-up book's final page that turns the book's
 * message into a football decision, tied to a Paths lesson through the concept map. The words are ours (not quotations) and
 * kept at the simplest level, because books are read by every age. `format` picks which format's lesson it credits first.
 * A first-try right answer counts toward that lesson's review (lib/learning/review.ts applyElsewhere); the first right answer
 * pays LEARN_COINS.book once per book.
 */
export type BookCheck={concept:ConceptId;format:Format;q:string;options:[string,string,string];answer:0|1|2;why:string};
const C=(concept:ConceptId,format:Format,q:string,options:[string,string,string],answer:0|1|2,why:string):BookCheck=>({concept,format,q,options,answer,why});
export const BOOK_CHECKS:Record<PlayerBookId,BookCheck>={
 island:C('scan-receive','7v7','The ball is coming to you. What do you do first?',['Look over your shoulder','Close your eyes','Run away from the ball'],0,'A quick look shows you where the defender is, so your first touch can go into space.'),
 messi:C('one-two','7v7','A defender blocks your way. How can a teammate help you get past?',['Pass, run past, and get it back','Kick it out of play','Stand still and wait'],0,'That is a wall pass: your friend is the wall, and the return lands in the space behind the defender.'),
 falcao:C('pivot','futsal','The pivot has their back to goal and a defender right behind. What can they do?',['Kick it at the defender','Hold it, then turn or pass to a runner','Stop playing'],1,'The pivot protects the ball with their body, then turns if there is room or lays it off to a teammate.'),
 marta:C('two-v-one','7v7','Two of you against one defender. When should you pass?',['Before you move at all','Never, just dribble','When the defender comes to you'],2,'Dribble at the defender. Once they come to you, your teammate is free: pass!'),
 maldini:C('goal-side','7v7','An attacker runs at your goal. Where do you stand?',['Behind the attacker','Between the attacker and your goal','By the corner flag'],1,'Goal-side means between the attacker and your goal, so you can always block the way.'),
 zidane:C('scan-receive','7v7','Zidane looked around before the ball arrived. Why?',['So he knew where to turn','To wave to the crowd','To find the referee'],0,'Looking early means you already know which way is free when the ball arrives.'),
 ronaldinho:C('scan-receive','futsal','A defender is close as the ball arrives. Where does your first touch go?',['Right at the defender','Into the open space','Under your foot, then stop'],1,'Touch the ball away from the defender, into space. Now you have time.'),
 pele:C('width-space','7v7','Everyone runs to the ball. What should you do?',['Join the crowd','Sit down','Find open space'],2,'A crowd is easy to stop. Open space gives the player with the ball a pass.'),
 cruyff:C('width-space','7v7','How can you make space for a teammate?',['Run wide and take a defender with you','Stand next to the ball','Walk off the pitch'],0,'When you run away, your defender follows you, and your teammate gets room.'),
 modric:C('support-angle','7v7','The passer can’t see you because a defender is in the way. What do you do?',['Hide behind the defender','Step sideways out of the shadow','Just shout louder'],1,'A few steps sideways opens a clear line from the ball to you.'),
 cristiano:C('lose-it','7v7','Your team just lost the ball. What should you do?',['Stop and complain','Walk slowly','Help: get back between the ball and your goal'],2,'When the ball is lost, the whole team helps. Protect the middle first.'),
 iniesta:C('support-angle','futsal','Your teammate is under pressure. How can you help?',['Move to where they can pass to you','Stand behind a defender','Turn away'],0,'Asking for help works on the pitch too: show for the ball at a clear angle.'),
 vardy:C('through-ball','11v11','There is space behind the defenders. When do you start your run?',['Before your teammate even has the ball','When the passer is ready to pass','Never'],1,'Wait until the passer can see you, then go. You and the ball arrive together.'),
 salah:C('far-post','futsal','The ball is on the other wing. Where does the winger run?',['To the far post','Back to halfway','Out of the pitch'],0,'The far post is often empty. Arrive there as the ball comes across.'),
 kane:C('follow-in','7v7','Your teammate shoots. What do you do?',['Stop and watch','Run in, in case the keeper drops it','Walk away'],1,'Keepers sometimes push the ball out. The player who follows in scores the rebound.'),
 putellas:C('press-cover','futsal','One teammate goes to the ball. What do you do?',['Go to the ball too','Stand still far away','Stay just behind them to cover'],2,'One goes, one helps. If the attacker gets past, you are there.'),
 bronze:C('overlap','7v7','Your winger has the ball by the sideline. How can a defender help?',['Run around the outside','Stand behind the winger','Stay in your own goal'],0,'Running round the outside makes two against one. The defender has to choose.'),
 kerr:C('far-post','futsal','A cross is coming. Where should the attackers run?',['All to the same spot','Split up: near post and far post','Back to halfway'],1,'Different runs mean the defenders can’t mark everyone.'),
 buffon:C('keeper-set','futsal','An attacker is about to shoot. What does a good keeper do?',['Dive before the kick','Turn around','Get set and wait for the shot'],2,'Stay on your toes and wait. Diving early is a guess.'),
 eriksen:C('third-man','11v11','The player ahead is marked. How can you still get the ball to them?',['Pass to a nearby friend who passes it on','Kick it at the defender','Give up'],0,'A teammate in the middle can pass it on to the player you couldn’t reach.'),
 debruyne:C('switch-play','9v9','The defenders crowd one side. Where is the space?',['Where the ball is','On the other side','Behind your own goal'],1,'When everyone moves to the ball, the far side is empty. Switch it!'),
 ibrahimovic:C('pivot','futsal','Your striker has their back to goal. What can they do?',['Shield it, then pass to a runner','Kick it high to nobody','Fall over'],0,'Holding the ball with your body buys time for a teammate to arrive.'),
 lukaku:C('win-it','9v9','You just won the ball. What do you do first?',['Kick it out','Look forward for a pass','Stand on it'],1,'Right after winning the ball, the other team is not ready. Look forward first.'),
 rashford:C('restart-options','futsal','Your team has a kick-in. What should your teammates do?',['All stand in one spot','Walk away','Offer two different passes'],2,'Two options means the defenders can’t block both.'),
 ronaldo:C('two-v-one','9v9','You dribble at the last defender with a teammate beside you. The defender comes to you. Now?',['Pass to your teammate','Dribble into the defender','Stop'],0,'The defender chose you, so your teammate is free.'),
 garrincha:C('two-v-one','7v7','A defender is close. What helps you get past?',['Standing still','A quick change of speed or direction','Passing backwards every time'],1,'A sudden change of pace or direction leaves the defender behind.'),
 davies:C('overlap','11v11','A full-back runs past the winger on the outside. What is that called?',['A throw-in','A goal kick','An overlap'],2,'The overlap gives the winger a pass down the line.'),
 eusebio:C('cutback','11v11','You reach the end line and the defenders run toward their goal. Where do you pass?',['Back to the player arriving behind','Into the defender','Out of play'],0,'The cut-back finds the free player arriving at the penalty spot.'),
 weah:C('two-v-one','7v7','Open grass ahead and nobody close. What do you do?',['Stop the ball dead','Push it ahead and run with it','Pass it backwards'],1,'Big touches into space let you run fast with the ball.'),
 drogba:C('far-post','futsal','A high cross comes into the box. What do strikers do?',['Duck','Run away from goal','Attack the ball and meet it'],2,'Move to meet the ball before a defender gets there. Be brave, and be first.'),
 mane:C('press-cover','9v9','You press, and the opponent’s first touch is heavy. What do you do?',['Jump in and win the ball','Walk back','Look away'],0,'A heavy touch is the moment to press. A teammate covers behind you.'),
 saka:C('overlap','7v7','You are the winger, and your full-back runs round you. What do you do?',['Kick it out','Pass into their run','Ignore them'],1,'The overlap only works if you use it: pass into the space ahead of the runner.'),
 hegerberg:C('offside','7v7','Where should you wait so you are not offside?',['Level with the last defender','Past the last defender, near their goal','Inside the goal'],0,'Level is onside. Past the last defender is offside, so wait level and run when the pass is played.'),
 cafu:C('overlap','7v7','On the overlap, where does the full-back run?',['Straight at the defender','Back to the goal','Around the outside of the winger'],2,'Outside the winger gives them a pass and makes two against one.'),
 nadim:C('follow-in','7v7','A teammate takes a penalty. What should the attackers do?',['Celebrate before it goes in','Run in once it is kicked','Walk away'],1,'Wait outside the box until it is kicked. If the keeper saves, the first player there can score the rebound.'),
 kante:C('win-it','futsal','You win the ball. What do you do next?',['Pass quickly to a free teammate','Dribble alone into three defenders','Kick it out'],0,'Win it, then give it quickly. The whole team attacks together.'),
 oshoala:C('team-roles','9v9','A defender moves up the pitch. Who helps?',['Nobody','A teammate covers their space','The referee'],1,'Great teams share the jobs: when one player moves, another covers.'),
};

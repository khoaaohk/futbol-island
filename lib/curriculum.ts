export type Player = { id: string; label: string; side: 'home' | 'away'; x: number; z: number };
export type Beat = { title: string; body: string; ball: string; focus: string; moves: Record<string, [number, number]>; cue?: [string, string] };
export type Lesson = { id: string; number: string; title: string; category: 'Possession' | 'Attacking' | 'Defending'; difficulty: string; minutes: number; description: string; takeaway: string; players: Player[]; carrier: string; beats: Beat[]; question: string; answers: { id: string; label: string; feedback: string }[]; correct: string };
const home = (id: string, label: string, x: number, z: number): Player => ({ id, label, x, z, side: 'home' });
const away = (id: string, x: number, z: number): Player => ({ id, label: 'Defender', x, z, side: 'away' });
export const LESSONS: Lesson[] = [
  { id: 'find-space', number: '01', title: 'Space is your teammate.', category: 'Possession', difficulty: 'Foundation', minutes: 3,
    description: 'Learn to see the free player before the ball arrives.', takeaway: 'Scan first. Open your body. Play away from pressure.',
    players: [home('6', 'You · No. 6', 0, 5), home('8', 'No. 8', -5, 0), home('10', 'No. 10', 2, -3), away('d1', 1.5, 2), away('d2', 2.7, -2)], carrier: '6',
    beats: [
      { title: 'Look beyond the ball.', body: 'Two defenders have crowded the right side. Notice the space on the left.', ball: '6', focus: '8', moves: {}, cue: ['6', '8'] },
      { title: 'Use the free player.', body: 'Play to No. 8, away from pressure. A simple pass gives your team time.', ball: '8', focus: '8', moves: { '8': [-5, -1], d1: [-1, 1] }, cue: ['6', '8'] },
      { title: 'Move to help again.', body: 'After passing, change your angle so your teammate has a safe next pass.', ball: '8', focus: '6', moves: { '6': [-1, 3] }, cue: ['8', '6'] },
    ], question: 'Pressure is coming from the right. Who gives you the best way out?', correct: '8', answers: [
      { id: '8', label: 'No. 8 · wide left', feedback: 'Exactly. No. 8 has space to receive and time to look forward.' },
      { id: '10', label: 'No. 10 · through the middle', feedback: 'That lane is crowded. The defender can challenge No. 10 as the ball arrives.' },
      { id: '6', label: 'Keep carrying the ball', feedback: 'You would carry toward pressure. Scan for the free teammate instead.' },
    ] },
  { id: 'one-two', number: '02', title: 'Pass. Move. Reappear.', category: 'Attacking', difficulty: 'Foundation', minutes: 3,
    description: 'Beat a defender with a teammate, not a trick.', takeaway: 'The first pass starts the combination. Your run makes it work.',
    players: [home('7', 'You · No. 7', -3, 4), home('9', 'No. 9', 2, 0), home('6', 'No. 6', 0, 7), away('d1', -2, 1), away('d2', 4, -4)], carrier: '7',
    beats: [
      { title: 'Invite the defender.', body: 'The defender is set in front of No. 7. Your teammate is available to the side.', ball: '7', focus: '9', moves: {}, cue: ['7', '9'] },
      { title: 'Pass, then accelerate.', body: 'No. 9 acts as the wall. No. 7 runs beyond the defender immediately.', ball: '9', focus: '7', moves: { '7': [-3, -3], d1: [-1, 0] }, cue: ['7', '9'] },
      { title: 'Meet the return pass.', body: 'The return ball meets the runner in the space behind the defender.', ball: '7', focus: '7', moves: { '7': [-2, -6] }, cue: ['9', '7'] },
    ], question: 'A defender blocks your dribble. Who can help you play a one-two?', correct: '9', answers: [
      { id: '9', label: 'No. 9 · to your right', feedback: 'Yes. No. 9 can receive and return the pass into your run.' },
      { id: '6', label: 'No. 6 · behind you', feedback: 'That is a safe reset, but it does not create the forward one-two here.' },
      { id: '7', label: 'Dribble straight ahead', feedback: 'The defender is waiting. Use your teammate to change the passing angle.' },
    ] },
  { id: 'switch', number: '03', title: 'Find the other side.', category: 'Possession', difficulty: 'Developing', minutes: 4,
    description: 'Move the opposition, then use the space they leave.', takeaway: 'Draw pressure to one side. Move the ball before the space closes.',
    players: [home('3', 'You · No. 3', -5, 3), home('6', 'No. 6', 0, 5), home('2', 'No. 2', 6, -2), away('d1', -4, 0), away('d2', -2, 2)], carrier: '3',
    beats: [
      { title: 'See the imbalance.', body: 'The defenders have moved across. No. 2 is waiting on the far side.', ball: '3', focus: '2', moves: {}, cue: ['3', '6'] },
      { title: 'Find the connector.', body: 'No. 6 offers a safe angle to move the ball around the pressure.', ball: '6', focus: '6', moves: { d2: [-1, 3] }, cue: ['3', '6'] },
      { title: 'Switch before they recover.', body: 'The next pass reaches No. 2 with space to attack forward.', ball: '2', focus: '2', moves: { '2': [6, -4], d1: [-2, 0] }, cue: ['6', '2'] },
    ], question: 'Who is the safe first connection for a switch of play?', correct: '6', answers: [
      { id: '6', label: 'No. 6 · central support', feedback: 'Yes. No. 6 connects both sides without forcing a pass through pressure.' },
      { id: '2', label: 'No. 2 · directly across', feedback: 'That direct lane passes through the pressing defenders. Use the connector first.' },
      { id: '3', label: 'Stay on the crowded side', feedback: 'You are letting the defenders keep the advantage. Move the ball out.' },
    ] },
  { id: 'third-player', number: '04', title: 'The run they don’t see.', category: 'Attacking', difficulty: 'Developing', minutes: 4,
    description: 'Use a third player to reach a blocked passing lane.', takeaway: 'If you cannot find the runner directly, find the player who can.',
    players: [home('6', 'You · No. 6', 0, 5), home('9', 'No. 9', -3, 0), home('8', 'No. 8', 4, 1), away('d1', 1, 2), away('d2', 0, -2)], carrier: '6',
    beats: [
      { title: 'The direct route is closed.', body: 'A defender screens No. 8. No. 9 offers a different angle.', ball: '6', focus: '9', moves: {}, cue: ['6', '9'] },
      { title: 'Connect while the runner moves.', body: 'No. 6 finds No. 9 as No. 8 accelerates beyond the screening defender.', ball: '9', focus: '8', moves: { '8': [4, -4], d1: [0, 1] }, cue: ['6', '9'] },
      { title: 'Find the third player.', body: 'No. 9 now has a clear angle into the runner’s path.', ball: '8', focus: '8', moves: { '8': [3, -6] }, cue: ['9', '8'] },
    ], question: 'Which teammate changes the angle and unlocks No. 8’s run?', correct: '9', answers: [
      { id: '9', label: 'No. 9 · the link player', feedback: 'Exactly. The link player creates the angle the original passer did not have.' },
      { id: '8', label: 'Force it straight to No. 8', feedback: 'The defender is screening that pass. Change the angle first.' },
      { id: '6', label: 'Wait in the same position', feedback: 'Waiting alone does not change the defender’s screening angle.' },
    ] },
  { id: 'cover', number: '05', title: 'Defend as a pair.', category: 'Defending', difficulty: 'Foundation', minutes: 3,
    description: 'One player applies pressure. The other protects the space.', takeaway: 'When your teammate presses, give cover behind and inside.',
    players: [home('4', 'No. 4 · pressing', -2, 1), home('5', 'You · No. 5', 3, 4), home('6', 'No. 6 · midfield', 1, -3), away('d1', -3, -1), away('d2', 4, -5)], carrier: 'd1',
    beats: [
      { title: 'One player goes to the ball.', body: 'No. 4 is close enough to pressure the attacker. Both defenders should not rush in.', ball: 'd1', focus: '4', moves: { '4': [-2.5, 0] } },
      { title: 'Protect the inside route.', body: 'No. 5 moves behind and inside No. 4 to cover a dribble or pass.', ball: 'd1', focus: '5', moves: { '5': [0, 2] }, cue: ['5', '4'] },
      { title: 'Move together.', body: 'As the attacker moves wide, the covering defender keeps the protective angle.', ball: 'd1', focus: '5', moves: { d1: [-5, -1], '4': [-4, 0], '5': [-1.5, 2] }, cue: ['5', '4'] },
    ], question: 'No. 4 is pressing. Which player should provide cover?', correct: '5', answers: [
      { id: '5', label: 'No. 5 · behind the pressure', feedback: 'Yes. No. 5 can protect the space if the attacker gets past No. 4.' },
      { id: '4', label: 'No. 4 · leave the attacker', feedback: 'No. 4 already has the pressure role. The pair needs both pressure and cover.' },
      { id: '6', label: 'No. 6 · ahead of the ball', feedback: 'No. 6 is too high to give immediate protection behind No. 4.' },
    ] },
  { id: 'recover', number: '06', title: 'Win the race back.', category: 'Defending', difficulty: 'Developing', minutes: 3,
    description: 'Make your first recovery run protect the goal.', takeaway: 'Recover toward your goal first, then approach the ball.',
    players: [home('8', 'You · No. 8', 4, 0), home('4', 'No. 4 · centre-back', 0, 6), home('7', 'No. 7 · wide', -5, -1), away('d1', 2, 2), away('d2', -2, 4)], carrier: 'd1',
    beats: [
      { title: 'The ball has been lost.', body: 'The attacker is moving toward your goal at the near end of the pitch.', ball: 'd1', focus: '8', moves: {} },
      { title: 'Recover inside first.', body: 'No. 8 sprints toward the route to goal instead of chasing from behind.', ball: 'd1', focus: '8', moves: { '8': [2, 5], d1: [2, 3] }, cue: ['8', '4'] },
      { title: 'Help the defender delay.', body: 'With the goal protected, No. 8 can help No. 4 slow the attack.', ball: 'd1', focus: '8', moves: { '8': [1.5, 5], '4': [-0.5, 5.5] }, cue: ['8', '4'] },
    ], question: 'Which player needs to recover inside to help No. 4?', correct: '8', answers: [
      { id: '8', label: 'No. 8 · recover toward goal', feedback: 'Correct. Recovering inside lets No. 8 protect the goal and help No. 4.' },
      { id: '4', label: 'No. 4 · run away from goal', feedback: 'No. 4 is the last protection. Pulling away would open the route to goal.' },
      { id: '7', label: 'No. 7 · stay wide', feedback: 'Staying wide does not address the immediate danger through the middle.' },
    ] },
];

export function lessonFrame(lesson: Lesson, beat: number, fraction: number) {
  const previous = lesson.players.map(p => ({ ...p }));
  for (let i = 0; i < beat; i++) for (const p of previous) { const move = lesson.beats[i].moves[p.id]; if (move) [p.x, p.z] = move; }
  const current = lesson.beats[Math.max(0, Math.min(beat, lesson.beats.length - 1))];
  const t = Math.max(0, Math.min(1, fraction));
  const smooth = t * t * (3 - 2 * t);
  const players = previous.map(p => { const move = current.moves[p.id]; return move ? { ...p, x: p.x + (move[0] - p.x) * smooth, z: p.z + (move[1] - p.z) * smooth } : p; });
  const from = previous.find(p => p.id === (beat === 0 ? lesson.carrier : lesson.beats[beat - 1].ball))!;
  const to = players.find(p => p.id === current.ball)!;
  return { players, ball: { x: from.x + (to.x - from.x) * smooth, z: from.z + (to.z - from.z) * smooth }, focus: current.focus, cue: current.cue };
}

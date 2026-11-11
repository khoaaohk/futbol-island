# Air Futbol: game, two players, look and online findings (builder, Nov 11 2026)

**One line:** the air hockey table that already stood in the arcade room is now the seventh game (`airhockey`): football air hockey on a
mini pitch, solo against a line of named opponents or two players on one device. Upright phone first, comic-print house style.
## What it teaches (AGENTS.md)
- **Angles and rebounds** (a board pass is a wall pass; a goal off a side board is a BANK SHOT), **the goalkeeper's rule** (stay between
  the puck and your goal, near post first) and **the counter-attack** (a goal within 3.5 s of your own save is a COUNTER).
- The results card's one coaching line is picked from how the goals against really went in (near post / far corner / caught up the pitch /
  off the boards / own goal) from an authored set that rotates; each opponent's walk-on card names one thing to try against them.
## Rules and numbers (`lib/arcade/airhockey/core.ts`, all in `AH` and `RAMP`)
- Table 100 x 160 units; puck r 4.4, striker r 8, goal mouth 46 wide. Side 0 defends the bottom, side 1 the top.
- Physics: fixed 120 Hz steps, each cut into micro-steps of at most 0.4 puck radii (no tunnelling at any legal speed); puck cap 340 u/s,
  striker cap 460 u/s (a finger cannot teleport it through the puck); striker hit restitution 0.55 plus the striker's own speed; boards and
  posts 0.9; light drag 0.3/s; a pinned puck pushes the striker back; a puck resting within 2.5 u of a board for 2 s is nudged out at 46 u/s.
- Goal = whole puck over the line. Beat 1.15 s, then the puck waits on the centre spot and is served (50 u/s) toward the side that conceded
  0.35 s after a finger is down. With no finger down nothing moves and the game sleeps.
- **Solo:** first to 5 beats an opponent; the next walks on (2.2 s card, a tap skips), points carry over. Points: goal 100, bank +75, quick
  (within 4 s of the serve) +50, counter +50, clean sheet +300, match win 250 + 50 x level (capped at level 12). Coins: 1 per 250, cap 12.
- **Life rule: three lives.** A lost match costs one and the SAME opponent plays again; every third win gives one back (max 3). Why: one
  bad match should not end a 7-year-old's ten-minute run, and the rematch with the tip is the lesson; the run still ends, so the board counts.
- **Ramp** (level name: react s / striker u/s / shot u/s / reads rebounds / guards the line / attacks / aim error / uses boards):
  1 Sandy .50/62/90/0/.25/.30/18/0 · 2 Pip .42/80/110/.10/.35/.40/15/0 · 3 Coco .36/98/130/.20/.45/.50/13/0 ·
  4 Rafa .30/116/150/.32/.55/.58/11/.10 · 5 Mina .26/134/170/.44/.64/.65/9.5/.15 · 6 Bruno .22/152/190/.55/.72/.72/8/.20 ·
  7 Kiko .19/170/210/.65/.79/.78/7/.25 · 8 Zuri .16/190/230/.74/.85/.83/6/.30 · 9 Dax .135/210/250/.82/.90/.88/5/.35 ·
  10 Vela .115/232/270/.90/.94/.92/4/.40 · 11 Captain Coral .10/255/290/.95/.97/.95/3.2/.45 · 12 The Lighthouse .085/280/310/1/1/.97/2.5/.50.
  Past 12 the last row plays on ("Sandy II"). Tests: monotone; a scripted player beats level 1 and loses to level 10.
- **Two players, one device:** first to 7; player 1 bottom, player 2 top (their label, score, hint and a results line are turned 180
  degrees). A touch that STARTS in a half drives only that half's striker; extra touches are ignored; a lost pointer-up cannot glue a striker
  (`touch.ts`: window listeners + reconciliation against the real touch list, as `lib/arcade/stickRelease.ts`). Rematch is one tap. No
  board, no coins, no record: only "today's head-to-head" in the save (`fi2-airhockey-v1`).
- **Desktop:** the mouse drives player 1 without a press (arrows too); a second player uses W A S D. **Sideways phone:** the table lies on
  its side (player 1 at the right), no rotate card (`requestAnyOrientation`).
## Look, sound, heat
- Comic print in the house palette (ink `#231a2e`, paper `#fff3d6`, sun `#ffc83a`, orange `#ff8a3c`, red `#f0452e`, teal `#19b5a5`): a mown
  pitch with a printed dot grid and paper lines in an orange boardwalk frame on dotted sand, sea and a low sun above on tall phones. The score
  is printed big on each half; names and lives sit on the end rails (no HUD strip, so the table gets the height). Chunky inked strikers
  (teal you, red them), a flat football puck with speed lines, impact stars, starburst GOAL! / SAVE! / YOU WIN!. Cards: `components/games/comic`.
- Sound (own WebAudio module, one limiter, starts on the first tap): plastic clack scaled by impact, board tick pitched by speed, post ping,
  a table hum that exists only while the puck moves, pea-whistle serve, two-tone goal horn with claps, falling horn, brass for a match win.
- Heat: 2D canvas. The static layer repaints only on resize or a score change. The loop runs only while playing AND something moves: start,
  pause, results, a hidden tab and "waiting for a serve with no finger down" draw nothing. 60 fps cap, DPR cap 2 (1.5 on long frames).
## Online play with a friend: findings and proposal (NOT built in this pass)
- What exists (read in `multiplayer/protocol/types.ts`, `limits.ts`, `multiplayer/relay/src/roomCore.ts`): besides 10 Hz poses, relay v1.8
  has a shared-match channel (`Cap.Match`, built for the island's live pitches). The first joiner of a "field" OWNS it and runs the only
  simulation; the others send `C.Match In` (integers, every 80 ms, relay cap 16/s burst 24) which go only to the owner; the owner sends
  `C.Match Snap` (up to 120 integers, about 12 Hz) to the field's members and watchers; the relay keeps the roster, migrates the owner and
  promotes past a silent one. Parties are private codes, names come from a fixed list, there is no free text, and two-player emotes
  already ask the friend for a yes (`EmoteAsk`). Fields are an allow-list of five pitch ids (`MATCH_FIELDS`); the arcade is not one.
- Latency with what exists: about 200-350 ms from a guest's move to seeing its effect (80 ms send gap + a hop, each way). The puck crosses
  the table in under half a second, so drawing snapshots as they arrive (what the pitches do) would feel broken: the guest must predict.
- Proposal: (1) add a sixth field id `airhockey` with two slots behind a capability bit (old relays refuse unknown fields), no other
  relay change. (2) Two friends in the same party standing at the table get "Play together"; the friend answers the existing yes / no
  card. (3) Authority: the owner runs `core.ts` (already deterministic and input-driven); goals are the owner's call. (4) The guest sends
  its striker target at 16 Hz, moves its own striker at once, and runs the same `core.ts` locally from the last snapshot (board rebounds
  are deterministic), blending to each new snapshot over about 100 ms; the other striker is drawn 80 ms behind. (5) Online only: puck cap
  260 u/s, and the owner swaps each rematch so the small advantage is shared. (6) Cheating: matches stay off the board and pay no coins,
  like same-device matches, so there is nothing to win by it. (7) Leaving the table or the party ends the match; no new text anywhere.
  Size: about 5-6 days and a relay deploy, so it was left out; same-device two-player is the multi play for now.

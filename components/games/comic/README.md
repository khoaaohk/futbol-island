# Comic HUD kit

The arcade's house style (owner, Nov 10 2026: "all these games should be in the new style"), taken value for value from
Breakaway Run's comic page. First user: Kit Rush (`components/games/KitRushGame.tsx`).

## Adopt it in a game
1. Put the tokens and the shared-overlay rules on the game root, next to the game's skin class:
   `className={`${styles.game} ${arcadeSkin.<id>} ${comicRoot}`}` (`comicRoot` = `.comic` tokens + `.chrome`).
   `.chrome` draws the shared top-bar pill and pause key, the pause card, the boards and the high-score entry
   (`data-arcade-pill`, `data-arcade-pause*`, `data-arcade-board`, `data-board-*`, `data-hs-*`, `data-wheel`) as a comic page.
2. Re-colour per game by overriding tokens on the skin class, e.g. `.skin{--cm-sun:#ffd24a}`. Never restyle the back button.
3. Build cards and HUD from the pieces below; game-specific layout stays in the game's own CSS module.

## Tokens (`.comic`)
Ink `--cm-ink #231a2e` (never pure black), paper `--cm-paper #fff3d6`, sun `#ffc83a`, orange `#ff8a3c`, red `#f0452e`,
teal `#19b5a5`, violet `#8f78b8` (shadow tint), muted text `#51465f`. Lines 2 / 3 / 4 px. Hard shadows 3 / 4 / 8 px, offset
down-right, no blur. Dot screens `--cm-dots`, `--cm-dots-ink`, `--cm-dots-orange` (8 px Ben-Day tile: the only gradient call).
Type: `--cm-title` (Arial Black italic 900, lettering), `--cm-letter` (condensed italic 800, overlay headings),
`--cm-numeral` (IslandBrush, big numerals only), `--cm-ui` (UI sans; every button label at weight 800).

## Pieces (`index.tsx`)
| Piece | Use |
| --- | --- |
| `ComicButton` | `variant` primary (sun, 56 px) / paper / ink / teal, `size` small (44 px), `wide`. Shadow collapses on press. |
| `ComicPanel` | Caption box. `tone` paper / dots / sun / red / teal / ink, `tilt` degrees, `flat`. |
| `ComicBurst` | Starburst word panel: `word`, star `color`, letter `fill`, `size`, `tilt`. |
| `ComicStat` | Numeral over one short word. `tone` sun / teal / dots. |
| `ComicCard` | Start / results card on a dot scrim: `badge` stamp, `best` chip, lettered `title`, children. |
| `comicLettering`, `comicNumeral` | Class names for a lettered heading and a hand-cut numeral (`--cm-letter-size`, `--cm-numeral-size`). |

## Rules
- Buttons: UI sans 800, never IslandBrush. Touch targets at least 44 px. `:focus-visible` ring is teal, 3 px.
- Reduced motion: no tilt, no press travel. Nothing in the kit animates on its own (no loops, no timers).
- No blur, glow, pill or soft shadow. Square corners; round only for discs (the pause key).
- Canvas games use the same hex values: `lib/arcade/kitrush/view.ts` exports `INK`, `PAPER`, `SUN`, `ORANGE`, `RED`, `TEAL`, `VIOLET`.

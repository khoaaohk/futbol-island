# Museum: modern gallery style (Oct 10 2026)

User: "fix the art exhibits to be more modern and clean like the World Cup balls … more of a MoMA where things are more
abstract", then "change the inside to the museum look and feel too". This is the shared brief for the hall AND every exhibit's
inside, so the museum reads as one modern gallery. The World Cup balls display is the reference and stays as is.

## Principles
- **Gallery calm.** Warm gallery white ground, lots of negative space, one idea per view. Nothing busy, no texture noise.
- **Abstract, not literal.** Each exhibit's subject becomes geometric art: spheres, lines, planes, grids, colour fields,
  rhythm. A penalty is a sphere and a line at 11 m; cards are two floating planes; VAR is a frame within a frame; kits are colour
  fields. Figures, when needed, are reduced to simple shapes (a circle head, a rounded body, a line for motion), never cartoons.
- **Swiss / International typography.** One clean grotesque sans (the app's sans stack; `var(--btn-font)` is fine), strong
  hierarchy, big numerals for years and stats, left-aligned text blocks, generous line height. Wall-label pattern for titles:
  **Title**, then a small line "Year · Place" in muted ink.
- **Restrained colour.** Ground `#f6f4ef`, ink `#1d1d1b`, muted ink `#6b6a66`, hairlines `#d9d6cf`. One accent per exhibit,
  drawn from a primary palette: red `#e4322b`, blue `#2a5bd7`, yellow `#f2c230`, green `#1f8a5b` (plus black). Accents mark the
  idea, never decorate.
- **Precise motion.** Calm, spring-eased reveals (stagger 40–80 ms), lines that draw, planes that slide; no bounce for its own
  sake. Transform, opacity and stroke-dashoffset only; 0 rAF at rest; reduced motion is a complete static composition.
- **Interaction that teaches.** Every exhibit keeps one meaningful interaction (it shows the WHY of the rule or moment), a short
  quick check, and a quiet payoff (a gallery-style "Visited" mark, not confetti).

## Shared pieces (use, don't re-invent)
- Wall label: title, then "Year · Place", then an optional one-line caption.
- Quick check: question in the sans, answers as plain outlined pills; right answer fills with the exhibit accent; one-line why.
- Ending: the accent shape completes plus a "You've seen …" line and the take-it-to-your-game sentence.
- Navigation: the app's NavigationButton (Back top left). Keep `onComplete` for the museum passport.

## Keep
Verified facts and sources, data-* hooks, progress keys, the passport `onComplete`, accessibility, phone-first layout (no
horizontal scroll at 390 px).

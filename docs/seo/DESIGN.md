# Reference pages design (Oct 17 2026)

The static reference pages under `app/(site)/` (about, learn + 96 lessons, fish + 73 species, cards + 450 cards, exhibits + 22
exhibits) exist for search engines and AI assistants. They teach the same football as the island (positions, tactics, rules, club
history), so they should read clearly. The rule from Oct 16 still holds: **no section navigation**. A visitor sees the page, one gold
"Play" button into the island and the privacy link. SEO pieces (titles, descriptions, canonicals, JSON-LD, breadcrumb markup) are
unchanged, and lessons never show the correct quiz answer.

All styling is in one module, `app/(site)/site.module.css`. Pages use its named classes only. They add no scripts and no animation,
and the one shared image is the button grain the title screen already uses (phone heat, AGENTS.md).

## Audit (before, production build, 390 px and 1280 px, 9 page types)

| Area | Finding before | Change |
|---|---|---|
| Line length | Body ran the full 828 px column at 1280 (~95 characters per line) | Paragraphs and list items capped at 68ch |
| Type sizes | h1 32/48, h2 21 at both widths, body 17, lead 19. Weak step from h2 to body on desktop | Title 40/56, h2 22/26, h3 18/20, body 17/18 (lh 1.55), lead 19/21, caption 14, label 12 |
| Hierarchy | Detail eyebrow, "Real football fact" and "Island story" all used the same brown caps `.tag` | Eyebrow (brown caps) is separate from the one green pill `.label` for fact or fiction |
| Spacing | 18 px grid gap everywhere; h2 margins of 10/6 px; headings sat close to the previous block | 8-pt scale 8/16/24/40/64: 24 between sections, 16 inside, an intro block with 16 rhythm, 64 page bottom |
| Card styles | Cards had uneven radius (20/26/18/16) and a hard 4 px shadow. Quiz cards were indented by the `ol` and squeezed at 390 | One cream card: `#f7f0db` with a hairline rule, 16 radius, soft shadow, 16/24 padding. Quiz is a flush stack of cards with a "Question N" eyebrow |
| Index lists | 3-column grid of tiles at every width, so 77 striker tiles made a long phone scroll | Phone: one cream card of hairline rows (title + one meta line). Desktop: card grid (min 240 px) |
| Labels | Fish fact and story labels looked like body eyebrows. Cards and exhibits had no fact/fiction label | `.label` pill "Real football fact" on fish, card and exhibit facts, "Island story" on fish places |
| Colour | Green ink, brown tags, plain yellow pill button (#f2c230) that was not the island's gold. Footer was a heavy tan band | Island tokens only: cream paper, green ink, `--btn-gold` / rim / grain / gold shadow. Quiet footer with a hairline top border |
| CTA placement | Varied: lessons at the top, fish/cards/exhibits at the bottom, fish and cards index had none. A footer Play link was repeated on every page | Index pages and About: once near the top in the intro. Detail pages: once at the end. Footer is the line plus Privacy |
| Breadcrumbs | Underlined green links, the same weight as body links | Quiet 14 px line in muted ink, underline on hover |
| Extra links | "All lessons", "The whole Fishbook" and similar back-links duplicated the breadcrumbs | Removed (breadcrumbs keep the way up and their JSON-LD) |
| Small widths | No horizontal scroll at 320 | Same (checked scrollWidth on all 9 page types at 320) |

## Scale

- Type: title IslandBrush 40 / 56 with a gold `0 3px 0 var(--btn-gold)` shadow. Section h2 bold green 22 / 26. h3 18 / 20. Body 17 / 18, line-height 1.55, max 68ch. Lead 19 / 21. Caption 14. Eyebrow and label 12, caps, letter-spaced.
- Spacing: `--s1..--s5` = 8 / 16 / 24 / 40 / 64. Gutters 16 on phone, 24 from 720 px. Content column max 1040 px, with the header and footer aligned to it.
- Classes: `intro`, `crumbs`, `eyebrow`, `title`, `lead`, `section`, `h2`, `h3`, `count`, `caption`, `card`, `stack`, `label`, `art`, `list`/`itemTitle`/`itemMeta`, `cta`, `end`, `bare`, `options`.
- `color-scheme: light` on the pages and on html/body.

## Screenshots (after)

`docs/seo/about-390.png`, `docs/seo/lesson-390.png`, `docs/seo/fish-1280.png`, `docs/seo/card-1280.png`.

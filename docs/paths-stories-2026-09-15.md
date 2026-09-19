# Paths and the person behind the player

Local implementation, September 15, 2026. Not deployed. The user requested the exact spelling **futbo** within Paths; app branding remains Futbol Island. User-facing quest labels become Paths while all existing IDs, event names, storage keys and earned tactical/collection progress remain unchanged.

## Teaching design and research

CASEL recommends explicit, sequenced, active, focused learning, with reflection and opportunities to use a skill beyond the lesson. Its examples include a character story, discussion, role-playing responses and real-world reflection. We adapt this into three learner-paced panels: notice a concrete moment, explore either of two responses, and choose a real-world practice idea. This app adaptation has not itself been evaluated as an evidence-based SEL curriculum. [CASEL: Explicit SEL Instruction](https://schoolguide.casel.org/focus-area-3/classroom/explicit-sel-instruction/).

The FA treats emotional control, concentration, identity and self-esteem as part of youth development. It also recommends interactive, experiential learning and ownership in a meaningful game context. Our stories stay on the pitch or around a match, with players making choices rather than receiving a lecture. [The FA: Youth Development Phase and the psychological corner](https://www.thefa.com/bootroom/resources/coaching/youth-development-phase-and-the-psychological-corner), [Developing socially skilled children](https://www.thefa.com/bootroom/resources/coaching/developing-socially-skilled-children-in-the-foundation-phase).

AASP describes emotion regulation as involving attention, interpretation and responses, with strategies depending on the athlete and situation. We show noticing body clues and selecting a manageable response, without promising an emotion will disappear. [AASP: Managing Emotions in Sport](https://appliedsportpsych.org/blog/2016/09/managing-emotions-in-sport/).

AASP recommends asking what a young athlete learned from a mistake and whether they want feedback, rather than blame. Its communication guidance favors support for autonomy. Accordingly, both story choices are valid, reflection can wait, and seeking help is a strength. [AASP: Do’s and Don’ts for Parents of Young Athletes](https://appliedsportpsych.org/resources/resources-for-parents/dos-and-donts-for-parents-of-young-athletes/), [Our Words Matter](https://appliedsportpsych.org/blog/2021/10/our-words-matter-suggestions-for-communicating-with-young-athletes/).

These sources inform the design; the fictional characters and stories are original. Grit is framed as returning with feedback, a smaller task and recovery. Mental toughness is reconnecting with a controllable action, including asking for support. No score for emotions, no shame for sadness, no demand to persist through injury, and no claim to diagnose or treat mental health conditions.

## Five distinct stories

| Story | Visual setting | Skill / transfer |
| --- | --- | --- |
| One miss. A next moment. | Missed chance and goal | Reset word or teammate cue; help again while disappointed |
| When the game feels unfair. | Whistle and tense player | Unclench/breathe or ask coach for a moment; choose a response |
| Not yet is a starting point. | Practice cones | Smaller task or rest/return plan; feedback and recovery |
| The teammate who went quiet. | Bench with a teammate | Ask/listen or offer support; body language is not certainty |
| After the final whistle. | Scoreboard stays 1–2 | Time then reflection or connection; value a teammate beyond the result |

No pitch tokens, passing diagrams, tactical quiz scoring or timed responses are used. Choices reveal different speech and consequences; the final panel provides one practice prompt. All cards can be replayed after opening.

## Preview, persistence and production

`PATHS_PREVIEW` is enabled only outside `production`. Local story nodes and all six tactical stops in each chapter are open for review. Story preview never saves completion. Tactical preview stores its cursor/exposure in a separate in-memory state, suppresses attempts and completion, suppresses correct-answer stars in FieldLearning, and clears on leaving. Existing stored learning data remains byte-for-byte unchanged.

Production disables preview, rejects a `paths-preview` launch, preserves tactical progression, and unlocks each story after its immediately preceding tactical stop is completed, or when that story was already completed. There is no cross-chapter prerequisite. Story progress uses its own `fi2-life-paths-v1` key and earns no tactical badge or equipment. This records reading, not demonstrated mastery.

## Performance and accessibility

Only lightweight card metadata loads with Paths. Story component, text and SVG illustrations load dynamically on opening. It uses the existing 720×800 viewport-capped modal dimensions, fixed header/footer, scrollable body, native dialog focus containment and return focus. Escape/close affects the story rather than its parent drawer. Island Settings remains open, preserving the existing world-pause behavior. No network requests, audio, 3D scene, render loop, timers or perpetual animations were added. CSS entrance/breath animations are finite and stop in hidden documents; reduced motion removes them.

## Validation

- `node tests/path-stories.cjs`: five unique settings, ten different consequences, production predecessor locks, local all-open mode, byte-identical persisted learning after preview, no attempts/completion, production preview rejected, lazy component and finite CSS checks.
- `node tests/learning-journeys.cjs`: original tactical scenes, geometry, evidence, saved cursor, spaced review and reward rules pass.
- Typecheck and browser verification reported separately in final handoff; production build belongs to root integration checkpoint.

## Integrated chapter layout

Stories are part of the same connected road as the plays and quizzes, with a pink rounded-square book marker and explicit STORY label. Support contains reset after tactical stage 0 and empathy after stage 2; width contains regulation after stage 1; movement contains grit after stage 0 and loss after stage 3. Display indices determine road positions only. Saved tactical stages remain 0–5, and the four-stop tactical badge requirement is unchanged. There is no standalone story collection.

Choice-specific illustrations show breathing versus a coach, smaller practice versus seated rest and water, listening versus passing support, solo reset versus a teammate cue, and solo loss reflection versus reconnection. All remain finite SVG/CSS.

Final local browser verification: all five stories opened from their chapter road at 390×700, both response branches exercised, and all modal bounds stayed 366×676 with Got it visible. All six tactical steps were enabled in local preview. Completing a preview quiz, completing preview playback, and leaving each preserved all three learning/achievement/star storage values byte-for-byte. No JavaScript errors. Typecheck and focused content/progress tests pass. Production build remains the root integration check; no Paths deployment.

## Scene-first reference adaptation

The user requested an experience like https://www.diiverge.co/a/the-crystal-pass. Browser inspection showed a large illustrated scene with tappable character/object hotspots and scene navigation. The local adaptation uses original futbo illustrations and dialogue: three accessible hotspots per story, specific thoughts/context, visited and active indicators, and two supportive response branches. No reference artwork or prose was copied.

Stories remain connected stops within all three chapter roads, with pink rounded-square book markers and STORY labels. The separate story collection was removed. All stops remain open in development preview without earning progress; production gating remains tied to the chapter's preceding tactical step.

Mobile browser validation passed all 15 hotspots (at least 44px targets), both choices across five stories, fixed 366×676 modal bounds at 390×700, visible footer controls, and no JavaScript errors. Final production build passed. Artwork is code-native SVG; content/modal loads only on demand, with finite transitions and no new renderer, video, timer or animation loop. Local only; not deployed.

## Additional user reference: Kurzgesagt

The user requested Kurzgesagt as a reference for playful, highly interactive explainer stories. Its official video overview describes researched narratives, vibrant vector artwork and 2D/3D animation: https://kurzgesagt.org/what-we-do?visit=videos . Its interactive work extends explanations into player exploration: https://kurzgesagt.org/what-we-do?visit=interactive . This is an art/storytelling reference, not an AI generation service or a source of reusable assets.

Direction for the next illustration/motion pass: combine Diiverge's explorable scenes with colorful layered vector worlds, expressive original futbo characters, visual metaphors, cause-and-effect motion and short purposeful transitions. Players should change something in the scene and see the consequence. Every interaction needs a clear futbo learning purpose.

Proposed original interactions (not implemented in this reference-only update):
- Reset after a miss: tap one controllable next action; a tangled thought-cloud rearranges into a clear cue, then the character rejoins play. Disappointment need not disappear.
- Regulating emotions: drag a focus marker from the referee to an available teammate; show the next useful action, with optional breathing cue and no time pressure.
- Grit: choose a smaller practice target or a recovery break; animate a different next attempt or a rest/return plan. Avoid presenting endless effort as the answer.
- Empathy: tap a teammate to ask how they feel, then choose a supportive response; reveal their words instead of treating a facial expression as certainty.
- Handling loss: explore the unchanged scoreboard, one useful effort and one next-practice idea; animate those observations into a small take-forward card.

Keep story nodes integrated into chapters with their distinct marker. Preserve fixed modal bounds, accessible tap alternatives for drag gestures, replay, reduced-motion behavior and local preview progress isolation. Pre-create assets, load only the opened story, stop animations after each response and keep the island paused behind the modal. Do not add continuous video, background loops or runtime AI generation. Any new animation pass still needs browser validation and separate device thermal feedback.

## Simplified interactive stories and Passport removal

Latest user direction supersedes the multi-hotspot layout above. Each story now has one large tappable scene, short copy, two response choices, and Back / Next / Got it navigation with three small progress marks. Tapping the opening reveals the character's thought; later taps replay the selected response. No hotspot clusters, nested explanation panels, competing captions or narration controls. There is no audio narration in this version.

New original vector scenes use five distinct palettes and contextual objects. Response-specific finite motion includes returning to play, teammate arrival, an expanding breath cue, a controlled small touch, seated recovery, listening cues, a supportive pass, a reflection card and a connection heart. The loss score remains 1–2. A selected response does not assert emotional mastery or award a tactical badge.

Passport entry, tab, store links, costume links and onboarding references are removed. Lesson exits return to Paths. Existing stored club-quiz evidence is preserved for mascot quizzes; the old Passport view is no longer imported into the active interface. Paths still contains chapter progress, rewards and stories. All chapter stops remain available in local development preview.

Five-story mobile browser check passed both responses, thought reveal, replayable scene, fixed 366×676 modal size, visible footer, no saved preview progress, no Passport entry and return from a tactical preview to Paths. No JavaScript errors. Production build passed. No deployment. Scenes load with the lazy story module; finite CSS animations pause with hidden documents and respect reduced motion. No new timers, 3D renderer, video or runtime AI requests.

## User-supplied cast artwork (latest visual direction)

The user rejected the flat vector art as too amateur and supplied a polished faceted 3D cast image. This reference applies ONLY to stories. Five three-moment storyboards were generated with the built-in image_gen tool using the supplied reference; prompts are saved in story-art-prompts-2026-09-15.json. Fifteen cropped, WebP-encoded scene assets live in public/stories/*-v2-[012].webp. The on-island people, landscape and gameplay renderer were not replaced.

Cast in the new scenes: Luna and Kai (reset), Jayden and Coach Rivera (regulation), Kai and Coach Rivera (practice/recovery), Maya and Zoe (empathy), Luna and Jayden (loss). Story names/copy match the artwork. The loss scoreboard remains1–2 in each moment.

PathStoryScene now displays authored illustrations, with a short dissolve on changing a choice and replay. These are interactive illustrated moments, not real-time articulated 3D animation or generated video. Only the opened story loads its three moments; nothing loads on the Paths overview. No runtime AI, video, renderer or animation loop. The island remains paused behind the modal. Mobile verification passed all five stories, both choices, loaded assets, no eager artwork requests, fixed366×676 modal bounds, footer visibility, unchanged preview storage and return to Paths.

Costume UI follow-up: removed ISLAND ORIGINAL overlays and the featured Matchday Fox panel. Fox is one of24 ordinary cards. All50 valid hunt IDs now unlock all costumes through both Store and customization selection. The legacy fox reward remains valid for previous finishers but does not unlock the rest early. Club stories stay readable while outfits are locked. Reward copy is consistent in Paths, discoveries, onboarding and the final-ball lesson. Store Free tags and ball-card keyboard hints were removed. The onboarding opening now reads: “Explore the island while learning futbol concepts. Pick your character to begin.”

Settings now has a desktop-only Keyboard shortcuts second-level view with Back to settings. Mobile hides its entry; switching to a coarse/small viewport while it is open returns to settings. Desktop/mobile browser checks passed both navigation and Store cleanup. Changes are local, not deployed.


## Polygon reference revision
Replaced all five story illustrations with 15 v3 WebP moments generated using built-in image_gen and the new user reference. Angular flat-shaded faces, rectangular eyes and polygon hair replace the softer previous cast. Prompts: story-polygon-prompts-2026-09-15.json. Runtime assets: public/stories/*-v3-[012].webp, 1,074,524 bytes total (about 15% smaller than v2). Story-only loading and fixed modal sizing preserved; no new animation loop. All five mobile stories and both choices passed browser checks with no page errors; path-stories test passed. Local, not deployed.


## Polygon sticker revision
User supplied sticker cast sheet dzNbKR. Generated five storyboards with built-in image_gen; prompts saved in story-sticker-prompts-2026-09-15.json. Runtime: public/stories/*-v4-[012].webp, 15 frames, 861994 bytes total. White die-cut character outlines, flat polygon color planes, simple eyes and simplified island backdrops. Existing narrative, lazy story loading and fixed modal remain. No new animation loop. Local, not deployed.


## Pixel story revision
Fifteen AI-generated 16-bit-style illustrations are now public/stories/*-v5-[012].webp. Prompts: story-pixel-prompts-2026-09-15.json. Tap the scene to reveal the opening thought, tap again to reach the choice, choose a response, then tap to continue. Footer navigation remains available. The modal retains the app white container and regular controls per user correction; pixel styling applies only to the illustration. Finite stepped camera movement and a brief sparkle replace dissolves. These are illustrated scene changes, not articulated sprite footage or AI video. Square-wave step/completion sounds use the existing island sound context, effects volume/mute, cooldown, and source cleanup. No background animation loop. All five mobile story flows and build passed before the final CSS-only restoration of the normal modal. Local, not deployed.

## Embedded mini-game layout
The white standard modal now wraps a taller pixel story game. The illustration uses a 3:2 viewport instead of 2:1, with dialogue, choices, scene progress and Back/Next inside the game. Final Next becomes Replay. A separate standard Done button closes from any step; completion is recorded only when leaving the final step. The illustration crop favors character positions. All five stories and both choices passed 390x700 browser checks, fixed modal size and visible Done footer; production build passed. Local only.


## Shared modal and playable 16-bit scene
Paths uses a centered 720x800 maximum modal. Stories are a portal into the same dialog, hiding/inerting the prior view; Back and Escape restore it without losing chapter/scroll. Title is Story, using the shared back icon. The modal body padding is tighter, compact ball hunt sits first, chapter numbers/labels are centered in a sliding selector; preview labels removed. Clues has a header Back control.

Static story images are replaced by a local canvas simulation with movable characters, ball ownership, passes/shots, rebounds, and story-choice movement cues. It uses a generated transparent 16-bit sprite atlas (public/stories/characters-16bit.webp; prompt docs/story-sprites-16bit.json), idle/walking/kicking frames, cached procedural island background, speaker-anchored DOM speech bubbles, and finite pixel transitions. This is a small playable story scene, not AI video. The actor renderer runs only during activity, caps draws near 30Hz, pauses hidden, and disposes RAF/listeners/observer. No story-image atlas downloads remain. Desktop and390x700 browser checks passed one dialog, return navigation/Escape, player movement, idle draw stability, compact hunt and visible game navigation/Done. Sound and story tests passed. Build passed before final aspect-ratio-only sprite adjustment. All local, not deployed.

Final follow-up: removed the legacy 28px content margin above modal content (in addition to tighter shared body padding); centered chapter labels and numbers. The desktop/mobile shared-modal game check passed visible controls, Back/Escape, player movement, idle draw stability and compact ball-hunt placement. Final build passed including sprite aspect handling.

## Watch-only revision
User requested only Back/Replay interactions inside stories. Removed canvas input listeners, choice buttons and clickable dialogue. Five scripted moments advance after at least 8.5 seconds (longer for longer dialogue); Replay restarts the current moment, Back revisits the previous one, Done returns to Paths. Hidden-document playback pauses its advance timer. Names no longer render in the scene. Speech placement uses cached canvas dimensions, chooses a clear side where possible, and otherwise stays above both heads; long text scrolls within a bounded bubble. Desktop/mobile checks passed automatic advance, Back/Replay, noninteractive scene, no bubble/face overlap, and one shared modal. Added30px above the first path stop. Scripted kicks use the existing frame chain without scheduling a duplicate RAF. Local, not deployed.

Follow-up correction: restored Next alongside Back and Replay. Removed automatic timed scene advancement; each moment waits for Next. The scene and speech remain non-clickable; the final Next is disabled and Done closes/records completion.

Latest controls/layout: Back and Next are shown through the five moments; final Next becomes Replay, which returns to the beginning. Indicator uses an equal-column grid for true centering. Characters face their movement direction and face their partner when stopped. Walking alternates idle/contact and stride frames instead of two nearly identical stride poses. Speech bubbles collapse/expand with finite stepped scale (no opacity fade), with reduced-motion override. Store mascot-history Back moved to its header; Paths mobile size now matches Store (viewport minus16px) and chapter labels use centered number/text groups. Typecheck passed.

## Expanded story walkthroughs
All five stories now have twelve manually advanced moments, ending in an original motivational line. Done, header navigation, Escape, and backdrop dismissal remain locked until the last moment is reached. Completion stays available during replay. Mobile Done spans the footer; Back/Next use muted sage. Existing finite canvas animation and idle sleep remain unchanged. Story ball now has a stepped round silhouette, panels and shading with aspect correction; narrow-screen actor targets have minimum separation. TypeScript and desktop/mobile browser walkthrough checks verify navigation, completion gating and final quotes. Local only; no deployment or device thermal measurement.

## Exploration and scene choreography
Island exploration is now a compact summary directly below Ball Hunt. It opens a second-level modal with header Back, keeping the same modal dimensions. Achievements use a progress-card checklist, distinct from learning paths. Removed the extra Store CTA and footer explanation. Paths title has no trailing period. Desktop/mobile navigation checks passed.

Replaced the three reused animation states with 60 authored finite scene timelines in `storyChoreography.ts`, indexed directly by story page. Each dialogue moment now has its own actor routes, ball route where relevant, body gesture and/or contextual cue. Added story-specific props (restart flag, teammate bench, final score). Includes missed shots and recovery, emotional resets, controlled touches and cone turns, giving space and listening, rest and team reflection. Ball is a rounded, aspect-correct pixel sprite. Actor separation is enforced using projected silhouettes. All sequences last 2.4–4.6 seconds and sleep when finished; background/sprite drawing remains Canvas2D with no new asset requests or perpetual effects. Route tests verify all 60 are distinct, bounded and aligned with dialogue. No deployment or physical-device heat claim.

## Production deployment
September 15: production build, type checks, story data/choreography tests and 60-scene desktop/mobile browser checks passed before deployment. Released as `dpl_9ki3bVH7E3WrvHLMaNbjH6nF2wK7`, https://futbol-island-owz6q18rr-khoa0aohk.vercel.app, aliased to https://futbolisland.app. Includes expanded stories, completion gate, unique finite choreography, exploration achievement modal, and prior local UI/render-upload changes. Real iPhone thermal outcome remains unmeasured.

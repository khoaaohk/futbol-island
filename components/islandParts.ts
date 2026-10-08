/**
 * Island parts that are NOT in the boot bundle (lazy-load pass, Oct 7 2026; docs/performance-guide.md "Load parts of the
 * island when they are opened"). Each loader is the same `import()` the matching `next/dynamic` wrapper uses, so webpack puts
 * both in one chunk; `prefetchPart(loader)` (lib/ui/idlePrefetch.ts) warms a chunk once, from whichever trigger comes first.
 *
 * Triggers (Town.tsx, IslandSettings.tsx):
 * - one idle warm-up, 8 s after the island is interactive, tab visible: Paths panel + bottle, customizer, lessons, conversations, coach lesson;
 * - the HUD focus (the player is next to it): talk → conversation + coach lesson, vending → machine, learn → lessons, enter → Coaches;
 * - touching/hovering the Settings or Paths button (or the dialog opening): Paths panel, bottle, ball hunt; Paths open → lessons;
 * - a new player's boot: the welcome. Fishing visuals load by distance in lib/town/fishing/fishingWorld.ts.
 */
export const loadPathsPanel=()=>import('./IslandQuests');
export const loadBottleLogo=()=>import('./IslandBottle');
export const loadCoinQuest=()=>import('./CoinQuest');
export const loadCustomizer=()=>import('./CharacterCustomizer');
export const loadVending=()=>import('./VendingMachine');
export const loadCoaches=()=>import('./CoachesCentre');
export const loadConversation=()=>import('./NpcConversation');
export const loadOnboarding=()=>import('./IslandOnboarding');
export const loadFieldLearning=()=>import('./FieldLearning');
export const loadCoachLesson=()=>import('./CoachLesson');

#!/usr/bin/env node
/*
 * UI spec regression guard (docs/ui/UI_SPEC.md, Sep 30 2026 UI fix pass). Static greps only, no browser:
 *
 *   1  One focus token: --btn-focus / --btn-focus-offset are defined once in app/globals.css, and the global
 *      a/button :focus-visible default uses them.
 *   2  The files of the UI fix pass keep the token: no :focus-visible rule there paints a hard-coded outline colour.
 *   3  No hard-coded 2px press in those files: an :active rule moves by var(--btn-press), never translate:0 2px /
 *      translateY(2px).
 *   4  One modal title size: ModalShell's phone title rule is clamp(24px,3vw,38px), the old phone clamp is gone,
 *      and the titles aligned in this pass use the same clamp.
 *   5  One phone gutter token (--phone-gutter:18px), and the custom HUD headers fixed in this pass put the phone
 *      anchors under the (pointer:coarse) query too, so landscape phones match portrait.
 *   6  NPC header: the subtitle rule never reaches DoneButton's label (`.header span` stays scoped).
 *   7  Motion: the two modal recipes (drawer .24s ease-in-out after .14s; full-screen .26s ease-out / .2s ease-in)
 *      and one toast timing (.3s ease).
 *   8  Heat: full-screen opaque menus (Settings/Paths fullModal, Make it yours, Coaches Centre, PositionGuide) hold no live
 *      backdrop blur once open; the tint keeps its fade.
 *
 * Usage: node tests/ui-spec.cjs
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let failed=0,passed=0;
const ok=(cond,msg)=>{if(cond)passed++;else{failed++;console.error('  FAIL '+msg);}};

/** Files this pass brought onto the spec. A new hard-coded focus colour or 2px press in any of them fails. */
const TOUCHED=[
 'app/globals.css','app/controller/controller.css',
 'components/ModalShell.module.css','components/NpcConversation.module.css','components/PlayerPopUpBook.module.css',
 'components/VendingMachine.module.css','components/games/ArcadeGame3D.module.css','components/IslandTravelMap.module.css',
 'components/IslandOnboarding.module.css','components/WelcomeBack.module.css','components/CostumeMilestoneToast.module.css',
 'components/FishingHost.module.css','components/LearningReview.module.css','components/IslandPassport.module.css',
 'components/GrownUps.module.css','components/CharacterCustomizer.module.css','components/Fishbook.module.css',
 'components/MarketStand.module.css','components/CardOffer.module.css','components/BallHuntLesson.module.css',
 'components/IslandSettings.module.css','components/CoinQuest.module.css','components/ParentGate.module.css',
 'components/CardCollection.module.css','components/LiveArcadeMatch.module.css','components/ArcadeCoinsPanel.module.css',
 'components/ArcadeRoom.module.css','components/CharacterToggle.module.css','components/CoachesCentre.module.css',
 'components/CoinCostumeReward.module.css','components/CostumeCollection.module.css','components/Endgame.module.css',
 'components/FormatPaths.module.css','components/IdpPlan.module.css','components/IslandBottle.module.css',
 'components/IslandHome.module.css','components/IslandJourney.module.css','components/IslandSelect.module.css',
 'components/IslandStore.module.css','components/KonbiniReveal.module.css','components/KonbiniRoom.module.css',
 'components/MarketCardsSection.module.css','components/PlayerCard.module.css','components/PositionGuide.module.css',
 'components/VendingCardReveal.module.css','components/VendingFace.module.css','components/VisualQuestion.module.css',
 'components/games/PassPuzzleGame.module.css',// Oct 26 2026: the dead 2D BreakawayRun / SoccerTennisGame were deleted.
 // Sep 30 2026 (UI_SPEC §5 open items, second pass): Pocket, Choose plays, field lesson, island jobs.
 'components/IslandBalanceDrawer.module.css','components/PlaysPicker.module.css','components/FieldLearning.module.css','components/IslandJobs.module.css',
];
const RULE=/([^{}]*)\{([^{}]*)\}/g;
const rules=css=>[...css.matchAll(RULE)].map(m=>({sel:m[1].trim(),body:m[2]}));
const TITLE='clamp(24px,3vw,38px)';

// 1 one focus token
const g=read('app/globals.css');
ok((g.match(/--btn-focus:/g)||[]).length===1,'app/globals.css defines --btn-focus exactly once');
ok((g.match(/--btn-focus-offset:/g)||[]).length===1,'app/globals.css defines --btn-focus-offset exactly once');
ok(/a:focus-visible,button:focus-visible\{outline:var\(--btn-focus\);outline-offset:var\(--btn-focus-offset\)\}/.test(g),'the global a/button :focus-visible default uses var(--btn-focus) and var(--btn-focus-offset)');

for(const f of TOUCHED){
 if(!fs.existsSync(path.join(ROOT,f))){ok(false,f+' is missing (update TOUCHED)');continue;}
 for(const {sel,body} of rules(read(f))){
  // 2 focus rings use the token (outline:none for an inner-ring design and negative inset offsets stay allowed)
  if(/focus-visible/.test(sel)&&/outline:\s*\d+px\s+solid/.test(body))ok(false,`${f}: "${sel.slice(-70)}" paints a hard-coded focus outline; use outline:var(--btn-focus);outline-offset:var(--btn-focus-offset)`);
  if(/focus-visible/.test(sel)&&/var\(--btn-focus,/.test(body))ok(false,`${f}: "${sel.slice(-70)}" gives --btn-focus a fallback colour; use var(--btn-focus)`);
  // 3 presses use the token
  if(/:active/.test(sel)&&/(translate:\s*0\s+2px|translateY\(2px\))/.test(body))ok(false,`${f}: "${sel.slice(-70)}" presses by a hard-coded 2px; use translate:0 var(--btn-press)`);
 }
 passed++;
}

// 4 one modal title size
const shell=read('components/ModalShell.module.css');
ok(!shell.includes('clamp(17px,4.5vw,26px)'),'ModalShell no longer shrinks phone titles to clamp(17px,4.5vw,26px)');
ok(shell.includes(`.shell>.header h2{font-size:${TITLE}}`),`ModalShell phone title is ${TITLE}`);
for(const [f,needle] of [
 ['components/NpcConversation.module.css','.dialog .header h2{color:#fff2cd;font:400 '+TITLE],
 ['components/Fishbook.module.css','.dialog .header h2{font-size:'+TITLE+'}'],
 ['components/MarketStand.module.css','.panel h2{font-family:IslandBrush,sans-serif;font-weight:400;font-size:'+TITLE],
 ['components/LearningReview.module.css','font-size:'+TITLE],
 ['components/IslandTravelMap.module.css','font-size:'+TITLE],
 ['components/CharacterCustomizer.module.css','.dialog .header h2{font-size:'+TITLE+'}'],
 ['components/IslandOnboarding.module.css','.header h2{font:400 '+TITLE],
 ['components/PlayerPopUpBook.module.css','.chapterLine h2{margin:2px 0 0;font:400 '+TITLE],
 ['components/IslandBalanceDrawer.module.css','.header h2{font:400 '+TITLE],
 ['components/PlaysPicker.module.css','.dialog .header h2{font:400 '+TITLE],
])ok(read(f).includes(needle),`${f}: modal title uses ${TITLE}`);
ok(/\.fullModal \.header h2\.settingsTitle\{font-size:clamp\(24px,3vw,38px\)\}/.test(read('components/IslandSettings.module.css')),'Settings home title uses the one title clamp');

// 5 gutter token + coarse-aware phone anchors
ok((g.match(/--phone-gutter:18px/g)||[]).length===1,'app/globals.css defines --phone-gutter:18px once');
ok(/\.hud-stack\{[^}]*width:min\(420px,calc\(100% - 2 \* var\(--phone-gutter\)\)\)/.test(g),'HUD stack column uses the phone gutter on both sides');
ok(/@media\(max-width:600px\),\(pointer:coarse\)\{\.hudDone\{/.test(read('components/VendingMachine.module.css')),'Vending Done uses the phone anchors on touch landscape');
ok(/@media\(max-width:600px\),\(pointer:coarse\)\{\.game>\.header\.header\{padding:calc\(16px/.test(read('components/games/ArcadeGame3D.module.css')),'Arcade game header uses the phone anchors on touch landscape');
ok(/@media\(max-width:700px\),\(pointer:coarse\)\{\.header\{top:calc\(16px/.test(read('components/PlayerPopUpBook.module.css')),'Book reader Back uses the phone anchors on touch landscape');
ok(!/padding:16px 24px!important/.test(read('components/IslandTravelMap.module.css')),'Travel map header keeps the ModalShell anchors (no own padding)');
ok(!/calc\(100vw - 24px\)/.test(read('components/IslandOnboarding.module.css')),'Onboarding card no longer uses a 12px gutter');

// 6 NPC Done label colour
const npc=read('components/NpcConversation.module.css');
ok(!/\.header span\{/.test(npc),'NpcConversation: no bare `.header span` rule (it recoloured the DoneButton label)');

// 7 motion
ok(/\.entering \.panel\{animation:reviewSlideIn \.24s ease-in-out \.14s both\}/.test(read('components/LearningReview.module.css')),'the warm-up drawer uses the drawer motion');
ok(/\.entering \.panel\{animation:bookSlideIn \.24s ease-in-out \.14s both\}/.test(read('components/Fishbook.module.css')),'Fishbook uses the drawer motion');
ok(/\.dialog\.entering \.panel\{animation:wardrobeIn \.26s ease-out both\}/.test(read('components/CharacterCustomizer.module.css')),'Make it yours uses the full-screen fade');
ok(/animation:playbookFade \.26s ease-out both/.test(read('components/PlaysPicker.module.css')),'Choose plays uses the full-screen fade');
ok(/animation:toastIn \.3s ease both/.test(read('components/CostumeMilestoneToast.module.css')),'Costume toast uses the one toast timing');
ok(/animation-name:hudStackIn;animation-duration:\.3s;animation-timing-function:ease/.test(g),'HUD stack pieces share the one toast timing');

// 8 heat: no held backdrop blur behind full-screen menus
const settingsCss=read('components/IslandSettings.module.css');
const tint=settingsCss.slice(settingsCss.indexOf('@keyframes fullTintIn'));
ok(/\.dialog\.fullModal::backdrop\{backdrop-filter:none/.test(settingsCss),'Settings/Paths fullModal backdrop never blurs');
ok(/\.dialog\.fullModal\.entering::backdrop\{animation-name:fullTintIn\}/.test(settingsCss)&&/^@keyframes fullTintIn\{from\{background:[^}]*\}to\{background:[^}]*\}\}/.test(tint),'fullModal entrance fades the tint only (no blur keyframe)');
for(const f of ['components/CharacterCustomizer.module.css','components/CoachesCentre.module.css','components/PositionGuide.module.css'])
 ok(/\.dialog\.dialog::backdrop\{backdrop-filter:none/.test(read(f)),f+': full-screen dialog backdrop never blurs');
ok(read('components/GrownUps.module.css').includes('.panel>header h2{font-size:'+TITLE+'}'),'For grown-ups title uses the one title clamp');

// 9 Oct 22 2026 UI consistency audit (docs/ui/UI_AUDIT_OCT22.md): multiplayer, rooms, emote wheel, title Join friends, admin tabs
ok(/:root\{\s*--btn-font:Arial,Helvetica,sans-serif;--font-body:var\(--btn-font\);/.test(g)&&(g.match(/--font-body:/g)||[]).length===1,'--font-body is defined once (it was used in 15 font shorthands but never defined, which dropped their weight and size)');
{
 const pc=read('components/party/party.module.css');
 ok(!/system-ui/.test(pc),'party UI: every font is the island button font (no system-ui)');
 for(const {sel,body} of rules(pc)){
  if(/focus-visible/.test(sel)&&/outline:\s*\d+px\s+solid/.test(body))ok(false,`party.module.css: "${sel.slice(-60)}" paints a hard-coded focus outline`);
  if(/:active/.test(sel)&&/translateY\(3px\)|translate:0 3px/.test(body))ok(false,`party.module.css: "${sel.slice(-60)}" presses by a literal 3px; use var(--btn-press)`);
 }
 ok(/\.roomEmote\{[^}]*var\(--btn-grain\)/.test(pc),'room Emote button has the textured gold face like the other round gold buttons');
 ok(!/--tabs-h:48px/.test(pc)&&/\.body\{[^}]*--tabs-h:56px/.test(pc)&&/\.tabs\{[^}]*height:var\(--tabs-h\);padding:6px/.test(pc),'Code | List tabs are 44px tall boxes in portrait and landscape (56px track - 2 x 6px; Oct 23 2026)');
 ok(/\.toast\{[^}]*animation:partyIn \.3s ease\}/.test(pc)&&/:global\(\.hud-stack\)>\.toast\{position:static/.test(pc),'party note: one toast timing, and it sits in the HUD stack on the island');
 ok(/\.roomSheet\{[^}]*animation:partyIn \.26s ease-out/.test(pc),'room roster opens with the modal fade timing');
 const host=read('components/party/PartyHost.tsx'),town=read('components/Town.tsx');
 ok(/<HudSlot><p className=\{styles\.toast\}[^>]*data-hud-slot="toast"/.test(host),'PartyHost notes portal into the HUD stack');
 ok(town.indexOf('<PartyHost ')>0&&town.indexOf('<PartyHost ')<town.indexOf('</HudStackContext.Provider>'),'PartyHost renders inside the HUD stack provider');
 ok(/useLayoutEffect\(\(\) => \{[\s\S]{0,200}getBoundingClientRect\(\)[\s\S]{0,300}style\.translate/.test(read('components/party/RoomPartyChip.tsx')),'room wheel / roster are kept inside the screen');
 const wheel=g.slice(g.indexOf('.emote-wheel-btn{'),g.indexOf('.emote-wheel-btn{')+600);
 ok(!/#fff2cd|#244d40|#b8923f/.test(wheel.split('}')[0]+wheel.split('}')[1]),'emote wheel buttons use the --btn-* tokens');
 ok(/\.emote-wheel-arrow\{[^}]*font:700 24px\/1 var\(--btn-font\)/.test(g),'emote wheel arrows use the button font');
 const jf=read('components/landing/JoinFriends.module.css');
 ok(!/outline:3px solid/.test(jf)&&!/system-ui/.test(jf)&&!/\.go\{|\.cancel\{/.test(jf),'title Join friends: token focus ring and font, no dead card rules');
 ok(/@media\(max-width:600px\),\(pointer:coarse\)\{\.header\{padding:calc\(16px \+ env\(safe-area-inset-top,0px\)\) calc\(var\(--phone-gutter\)/.test(read('components/MuseumRoom.module.css')),'museum header uses the phone gutter like the Konbini');
 ok(!/\.tab\{flex:1 1 0;min-width:0/.test(read('app/admin/SponsorOverview.module.css')),'admin phone tabs size to their labels (no squeezed, overlapping labels)');
}

console.log(`ui-spec: ${passed} passed, ${failed} failed`);
process.exit(failed?1:0);

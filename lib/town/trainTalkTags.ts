/**
 * Every Island Line NPC line belongs to a football topic (owner, Nov 24 2026: "fix the NPCs to have facts about trains. They have to
 * relate to football or teach concepts relating to football" + "something about speed, endurance, tie to something, not just
 * trains"). Tags for the station islanders (lib/town/stationNpcs.ts base talk + their fresh pools lib/town/npcFresh/part10.ts) and
 * Conductor Kenji (lib/town/trainConductor.ts); the passengers' tags live beside their pools (trainPassengerTalkPools.ts TALK_TAGS).
 * tests/train-talk.cjs: every topic, follow-up and challenge has a football tag; `ride` (social: greetings, openers, welcome-back
 * lines, ambient lines, the ride banter) is allowed only on those social lines, never on a topic or a question.
 * Keys: g greeting, l<i> ambient line, t<i> base topic, o<i> fresh opener, r<i> returning line, k<i> Kenji topic, else a fresh
 * topic / challenge id.
 */
export const FOOTBALL_TOPICS=['speed','endurance','agility','recovery','safety','nutrition','technique','tactics','teamwork','scanning','offside','rules','positions','history','clubs','fans','island'] as const;
export type FootballTopic=typeof FOOTBALL_TOPICS[number];
export const SOCIAL_TAG='ride';
const R='o0:ride o1:ride o2:ride o3:ride r0:ride r1:ride r2:ride';
export const TRAIN_NPC_TAGS:Record<string,string>={
 'stn-hana':`g:ride l0:safety l1:ride t0:fans t1:teamwork whistle-depart:rules shirt-numbers:positions timetable-plan:rules signal-colours:rules staff-uniform:rules first-steps:speed match-rush:fans braking-feet:agility c-quick-start:speed c-yellow-card:rules c-kit-colours:rules c-call-ball:teamwork ${R}`,
 'stn-ted':`g:fans l0:fans l1:fans t0:fans t1:fans why-scarves:fans away-tickets:fans sing-on-board:fans match-programme:fans groundhopping:fans first-match:fans kick-off-times:fans early-arrival:safety c-away-section:fans c-friendly-fan:fans c-programme:fans c-winter-scarf:fans ${R}`,
 'stn-ines':`g:fans l0:ride l1:fans t0:fans t1:fans why-chant:fans travel-bag:safety home-advantage:tactics good-guest:fans turnstile:fans what-derby:fans trip-length:fans new-friends:fans c-derby:fans c-home-wins:tactics c-guest:fans c-turnstile:fans ${R}`,
 'stn-kofi':`g:clubs l0:safety l1:clubs t0:clubs t1:clubs ball-hands:safety dial-square:clubs irons:clubs juventus-name:clubs church-clubs:clubs badge-stories:clubs railway-towns:clubs team-start:teamwork c-dial-square:clubs c-hammers:clubs c-ball-track:safety c-juventus:clubs ${R}`,
 'stn-ren':`g:nutrition l0:nutrition l1:nutrition t0:nutrition t1:history orange-slices:nutrition onigiri-fillings:nutrition first-final:history asia-cup-2002:history leather-ball:history museum-nearby:history rest-on-train:recovery share-bento:teamwork c-1930-final:history c-2002-hosts:history c-pre-match:nutrition c-half-time:recovery ${R}`,
 'stn-mo':`g:tactics l0:ride l1:ride t0:history t1:tactics my-notebook:tactics sprint-speed:speed kingfisher-nose:technique how-far-run:endurance added-time:rules count-passes:tactics shot-speed:technique pace-yourself:endurance c-top-speed:speed c-clean-strike:technique c-distance:endurance c-added:rules ${R}`,
 'stn-lena':`g:recovery l0:safety l1:recovery t0:recovery t1:endurance sleep-hours:recovery kit-list:safety shin-pads-rule:rules warm-up-plan:safety altitude-games:endurance cool-down:recovery time-zones:recovery team-journey:teamwork c-pads:rules c-sleep:recovery c-thin-air:endurance c-cool:recovery ${R}`,
 'stn-pip':`g:clubs l0:ride l1:ride t0:clubs t1:clubs crowd-noise:fans railway-and-football:history change-direction:agility old-boots:history cheetah-start:speed hike-legs:endurance jetpack-sprint:speed roof-balance:agility c-turn:agility c-endurance:endurance c-boots-fit:safety c-balance:agility ${R}`,
 'stn-kai':`g:safety l0:safety l1:fans t0:history t1:rules beach-pitch:rules no-draws:rules kick-ins:rules sun-safety:safety hot-day-water:safety point-ball:teamwork rest-days:recovery check-shoulder:scanning c-no-draw:rules c-hot-water:safety c-kick-in:rules c-sun:safety ${R}`,
 'stn-bea':`g:rules l0:technique l1:ride t0:rules t1:history brazil-beaches:history beach-world-cup:history keeper-throws:tactics sand-running:endurance weekly-trip:fans overhead-safe:safety league-trains:fans beach-ball-touch:technique c-brazil:history c-first-wc:history c-sand-legs:endurance c-flicks:technique ${R}`,
 'train-kenji':'g:ride l0:teamwork l1:safety l2:safety k0:teamwork k1:fans k2:speed k3:endurance k4:teamwork',
};
/** The parsed tags of one NPC (key → topic). */
export const tagsOf=(id:string):Record<string,string>=>Object.fromEntries((TRAIN_NPC_TAGS[id]??'').split(/\s+/).filter(Boolean).map(p=>p.split(':') as [string,string]));

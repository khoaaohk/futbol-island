#!/usr/bin/env node
// Smart welcome (Nov 14 2026, docs/welcome-suggestions.md): the on-device interest tally (scoring, recency decay), the hook
// registry's tiers, back-off after 3 ignores and taps that reinforce, the 10% holdout, the 1-in-5 cross nudge, the new-player
// rotation, the save-code sanitiser, the ws: counters and the admin reading. Pure modules only (no browser).
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:1,target:7,esModuleInterop:true}}).outputText,f);
const T=require('../lib/welcome/tally.ts'),L=require('../lib/welcome/learn.ts'),H=require('../lib/welcome/hooks.ts'),W=require('../lib/welcomeSuggestion.ts');
let n=0;const ok=(c,m)=>{assert(c,m);n++;};
const D=20400;// a day number
const lessonFact={format:'7v7',lessonId:'learn7_carry',name:'Carry or Pass?',minutes:2};
const facts=(o={})=>({weekend:false,
 fishing:{species:6,nearSet:null},
 lessons:{next:lessonFact,pathTitle:'7v7',leftInPath:5,streak:0,lessonToday:false,passing:{format:'7v7',lessonId:'prn_7_support',name:'Step Out of the Blocked Lane',minutes:2}},
 arcade:{fav:{game:'puzzle',name:'Pass Puzzles'},challenge:{game:'puzzle',name:'Pass Puzzles',line:'Solve today’s puzzle.',done:false},weekDays:0,pennantLit:false},
 kit:{news:null,visited:false},...o});
const tallyWith=(min,act=[0,0,0,0,0],day=D)=>({...T.emptyTally(),d:day,m:min,a:act,l:min.map(x=>x?day:0)});
const learnN=k=>({...L.emptyLearn(),n:k,last:D-1});
const pick=(o)=>W.pickWelcomeSuggestion({arm:'on',tally:T.emptyTally(),learn:learnN(10),today:D,facts:facts(),...o});

// ---- 1. Classification (the beat's activity ids, reused) ----
ok(T.interestOf('fishing')==='fishing'&&T.interestOf('lesson')==='lessons'&&T.interestOf('quiz')==='lessons'&&T.interestOf('paths')==='lessons','fishing / lessons');
ok(T.interestOf('arcade_puzzle')==='arcade'&&T.interestOf('arcade_lobby')==='arcade'&&T.interestOf('walk')==='roam'&&T.interestOf('swim')==='roam'&&T.interestOf('kit_studio')==='kit','arcade / roam / kit');
ok(T.interestOf('menu')===null&&T.interestOf('idle')===null&&T.interestOf(null)===null,'menus and idle are no interest');
ok(T.cabinetOf('arcade_live')==='kitrush'&&T.cabinetOf('arcade_lobby')===null&&T.cabinetOf('arcade_snake')==='snake','cabinets');
const islandIds=read('lib/analytics/islandIds.ts');for(const a of ['fishing','lesson','quiz','paths','walk','kit_shop','kit_studio','arcade_puzzle'])ok(islandIds.includes(`['${a}',`),`${a} is a real beat activity`);

// ---- 2. Scoring and recency decay ----
{let t=T.emptyTally();t=T.addMinutes(t,'fishing',8,D);t=T.addAction(t,'fishing',D);t=T.addMinutes(t,'lessons',2,D);
 const s=T.interestScores(t,D);ok(s.fishing===8+T.ACTION_WEIGHT&&s.lessons===2,'minutes + actions');
 ok(T.rankInterests(s).join()==='fishing,lessons','ranked best first; zero scores left out');
 ok(T.addMinutes(T.emptyTally(),'roam',90,D).m[3]===T.SEGMENT_CAP_MIN,'a segment is capped');
 const old=T.decayTally(tallyWith([40,0,0,0,0],[0,0,0,0,0],D-14),D);ok(Math.abs(old.m[0]-40*Math.pow(T.DAY_DECAY,14))<0.11,'14 days decay to about 10%');
 const mixed={...T.emptyTally(),d:D-14,m:[40,0,0,0,0]};const recent=T.addMinutes(mixed,'arcade',10,D);
 ok(T.rankInterests(T.interestScores(recent,D))[0]==='arcade','a recent visit outranks a bigger old one');
 ok(T.decayTally(t,D)===t,'no decay within a day');}
// Streak
{let t=T.emptyTally();t=T.addAction(t,'lessons',D-2);t=T.addAction(t,'lessons',D-1);
 ok(T.lessonStreak(t,D).days===2&&!T.lessonStreak(t,D).today,'2-day streak alive, not yet today');
 ok(T.lessonStreak(t,D+1).days===0,'a missed day breaks it');t=T.addAction(t,'lessons',D);ok(T.lessonStreak(t,D).days===3&&T.lessonStreak(t,D).today,'today extends it');
 ok(T.addAction(t,'lessons',D).st[0]===3,'twice a day counts once');}
// Sanitiser (save code)
{const t=T.sanitizeTally({v:1,d:5,m:[1,-3,'x',1e9],a:[2],l:[1,2,3,4,5,6],st:[2,4],fav:'<script>'});
 ok(t.m.join()==='1,0,0,100000,0'&&t.a.join()==='2,0,0,0,0'&&t.l.length===5&&t.fav===null,'odd values clamp');
 ok(T.sanitizeTally(null).v===1&&T.cleanTallyRaw('{bad')===null,'never throws');
 ok(JSON.stringify(T.addMinutes(T.addAction(T.emptyTally(),'arcade',D,'puzzle'),'arcade',3,D)).length<160,'tiny (a few numbers)');}

// ---- 3. Picker: interests, tiers ----
{const fisher=tallyWith([30,2,0,0,0],[3,0,0,0,0]);
 ok(pick({tally:fisher}).kind==='fish_go','a fisher gets fishing (evergreen when nothing more)');
 ok(pick({tally:fisher,facts:facts({fishing:{species:9,nearSet:{title:'Every shark',left:2}}})}).line==='2 more fish to finish Every shark! Tap to go fishing','almost done wins');
 ok(pick({tally:fisher,facts:facts({lessons:{...facts().lessons,leftInPath:1}})}).kind==='lesson_grad','the 2nd interest wins only with a strictly better tier (almost done vs evergreen)');
 ok(pick({tally:fisher,facts:facts({fishing:{species:9,nearSet:{title:'Every shark',left:1}},lessons:{...facts().lessons,streak:4}})}).kind==='fish_set','the top interest keeps a tie-ish tier');
 const learner=tallyWith([0,20,0,0,0],[0,3,0,0,0]);
 const st=pick({tally:learner,facts:facts({lessons:{...facts().lessons,streak:4}})});ok(st.kind==='lesson_streak'&&st.line==='Next up: Carry or Pass? (2 min). Keep your 4-day streak!'&&st.action.to==='paths','streak about to be lost');
 ok(pick({tally:learner}).line==='Next up: Carry or Pass? (2 min). Tap to start','next lesson');
 ok(pick({tally:learner,facts:facts({weekend:true})}).kind==='lesson_weekend','weekend: a longer suggestion');
 const fan=tallyWith([0,0,25,0,0],[0,0,4,0,0]);const ad=pick({tally:fan});
 ok(ad.kind==='arcade_daily'&&ad.action.to==='arcade'&&ad.action.game==='puzzle'&&ad.action.today,'arcade fan: today’s challenge');
 ok(pick({tally:fan,facts:facts({arcade:{...facts().arcade,weekDays:2}})}).kind==='arcade_pennant','one day from the pennant');
 ok(pick({tally:fan,facts:facts({arcade:{...facts().arcade,challenge:{...facts().arcade.challenge,done:true}}})}).kind==='arcade_go','done today → the favourite');
 const kit=tallyWith([0,0,0,0,9],[0,0,0,0,2]);ok(pick({tally:kit,facts:facts({kit:{news:{line:'New boot stickers in the Kit Shop! Tap to design your boots'},visited:true}})}).kind==='kit_news','Kit Shop news');
 ok(pick({tally:kit}).action.to==='shop','Kit Shop evergreen opens the shop');
 ok(pick({tally:tallyWith([0,0,0,30,0])}).kind!=='cross_roam_fish'&&pick({tally:tallyWith([0,0,0,30,0])}),'an explorer (no hooks of its own) still gets a line');}

// ---- 4. Learns from taps: back-off after 3 ignores, taps reinforce ----
{const fisher=tallyWith([30,10,0,0,0],[3,1,0,0,0]);let l=learnN(10);
 for(let i=0;i<3;i++){l=L.noteShown(l,'fish_go',D);l=L.noteIgnored(l,D);}
 ok(l.k.fish_go.join()===`3,0,3,${D}`&&L.backedOff(l,'fish_go',D),'3 ignores in a row back the kind off');
 ok(pick({tally:fisher,learn:{...l,n:10}}).interest==='lessons','backed off → the next interest');
 ok(!L.backedOff(l,'fish_go',D+L.BACKOFF_DAYS),'it may come back after BACKOFF_DAYS');
 const tapped=L.noteTapped(l,'fish_go',1000);ok(tapped.k.fish_go[1]===1&&tapped.k.fish_go[2]===0&&tapped.pend.interest==='fishing'&&!L.backedOff(tapped,'fish_go',D),'a tap resets the ignores and waits for "acted"');
 ok(L.noteActed(tapped,'fishing',1000+60_000).kind==='fish_go'&&L.noteActed(tapped,'arcade',2000).kind===null&&L.noteActed(tapped,'fishing',1000+L.ACT_WINDOW_MS+1).kind===null,'acted = the interest starts within the window');
 // Taps reinforce: two interests tied on time, taps on lessons put lessons first
 const tie=tallyWith([10,10,0,0,0]);let lt=learnN(10);lt=L.noteTapped(L.noteShown(lt,'lesson_next',D),'lesson_next',1);
 ok(L.tapBoost(lt).lessons===L.TAP_BOOST&&pick({tally:tie,learn:{...lt,n:10}}).interest==='lessons','taps reinforce');
 ok(pick({tally:tie}).interest==='fishing','without taps the tie keeps INTERESTS order');
 // A note left open when the page closed is ignored at the next one
 const open=L.noteShown(learnN(1),'fish_go',D);ok(open.cur.kind==='fish_go'&&L.noteShown(open,null,D+1).k.fish_go[2]===1,'an unresolved note counts as ignored');
 ok(L.noteShown(learnN(1),null,D).n===2,'visits counted');
 ok(L.interestOfKind('cross_arcade_lesson')==='lessons'&&L.interestOfKind('fish_set')==='fishing'&&L.interestOfKind('kit_news')==='kit','kind → interest');
 ok(L.sanitizeLearn({v:1,n:'x',k:{nope:[1],fish_go:[1,2,3,4]},cur:{kind:'bad'}}).k.fish_go.join()==='1,2,3,4'&&L.sanitizeLearn({v:1,k:{nope:[1]}}).k.nope===undefined,'learn sanitiser');}

// ---- 5. Holdout ----
ok(L.armFor(0)==='hold'&&L.armFor(0.099)==='hold'&&L.armFor(0.1)==='on'&&L.armFor(0.7)==='on'&&L.armFor(NaN)==='on','10% hold');
{let h=0;for(let i=0;i<1000;i++)if(L.armFor(i/1000)==='hold')h++;ok(h===100,'exactly 10% of a uniform draw');}
ok(pick({arm:'hold',tally:tallyWith([30,0,0,0,0])})===null&&W.pickWelcomeSuggestion({arm:'hold',tally:T.emptyTally(),learn:L.emptyLearn(),today:D,facts:facts()})===null,'holdout: the plain line only');

// ---- 6. Cross nudge, about 1 in 5 ----
{const fisher=tallyWith([30,0,0,0,0]),fan=tallyWith([0,0,30,0,0]),learner=tallyWith([0,30,0,0,0]);
 let cross=0;for(let v=W.NEW_PLAYER_VISITS;v<W.NEW_PLAYER_VISITS+50;v++)if(pick({tally:fisher,learn:learnN(v)}).kind.startsWith('cross_'))cross++;
 ok(cross===10,'1 visit in 5 is a cross nudge');
 const fx=pick({tally:fisher,learn:learnN(4)});ok(fx.kind==='cross_fish_lesson'&&fx.action.to==='paths','fisher → a lesson');
 const ax=pick({tally:fan,learn:learnN(9)});ok(ax.kind==='cross_arcade_lesson'&&ax.action.to==='lesson'&&ax.action.lessonId==='prn_7_support','arcade fan → the passing lesson behind Pass Puzzles');
 ok(pick({tally:learner,learn:learnN(4)}).kind==='cross_lesson_arcade','learner → Pass Puzzles');
 ok(pick({tally:tallyWith([0,0,0,30,0]),learn:learnN(4)}).kind==='cross_roam_fish','explorer → fishing');
 let lb=learnN(4);for(let i=0;i<3;i++)lb=L.noteIgnored(L.noteShown(lb,'cross_fish_lesson',D),D);
 ok(!pick({tally:fisher,learn:{...lb,n:4}}).kind.startsWith('cross_'),'a backed-off cross nudge is skipped');}

// ---- 7. New players rotate fishing / a lesson / the arcade ----
ok([0,1,2].map(v=>pick({tally:tallyWith([50,0,0,0,0]),learn:learnN(v)}).interest).join()==='fishing,lessons,arcade','first visits rotate (even with a tally)');
ok(pick({learn:learnN(1),facts:facts({lessons:undefined})}).interest==='arcade','a rotation slot with nothing to offer moves on');
ok(pick({learn:learnN(7),tally:T.emptyTally()}).interest,'no tally yet after the first visits: rotate');

// ---- 8. Copy: short, plain, one line ----
{const all=[];const f=facts({weekend:true,fishing:{species:3,nearSet:{title:'The shared ten',left:3}},kit:{news:{line:'New boot stickers in the Kit Shop! Tap to design your boots'},visited:true}});
 f.lessons={...f.lessons,leftInPath:1,streak:3};f.arcade={...f.arcade,weekDays:2};
 for(const i of T.INTERESTS){all.push(...H.hooksFor(i,f));const x=H.crossHook(i,f);if(x)all.push(x);}
 for(const h of all){ok(h.line.length<=80,`short: ${h.line}`);ok(!/[\u{1F300}-\u{1FAFF}]|\n/u.test(h.line),'no emoji, one line');ok((require('../lib/welcome/kinds.ts').WELCOME_KINDS).includes(h.kind),'a fixed kind');}
 ok(all.length>=15,'every provider yields');}
// A provider that throws is skipped, never breaks the note
H.registerHooks('roam',()=>{throw new Error('x');});ok(H.hooksFor('roam',facts()).length===0,'a throwing provider is ignored');
// The comeback slots are wired already
{const f=facts({fishing:{species:9,nearSet:null,fishOfDay:{name:'Moon Ray'},visitorLeaving:{name:'Sunfish',days:1},sunsetSpot:{name:'Sunset Shoals'}}});
 ok(H.hooksFor('fishing',f).map(h=>h.kind).join()==='fish_visitor,fish_day,fish_sunset,fish_go','comeback hooks ordered by tier');
 ok(/TODO\(fish-comeback merge\)/.test(read('lib/welcome/facts.ts'))&&/TODO\(fish-comeback merge\)/.test(read('lib/welcome/hooks.ts')),'TODO slot marked for comeback.ts');}

// ---- 9. Saves, privacy, counters, admin ----
{const S=require('../lib/saves/snapshot.ts');
 ok(S.SYNC_KEYS.includes(T.WELCOME_TALLY_KEY)&&S.isSyncKey(T.WELCOME_TALLY_KEY),'the tally follows a save code');
 ok(S.DEVICE_KEYS.includes(L.WELCOME_LEARN_KEY)&&S.DEVICE_KEYS.includes(L.WELCOME_ARM_KEY)&&!S.isSyncKey(L.WELCOME_LEARN_KEY)&&!S.isSyncKey(L.WELCOME_ARM_KEY),'taps and the arm stay on the device');
 const c=S.cleanKeys({[T.WELCOME_TALLY_KEY]:JSON.stringify({v:1,d:3,m:[1e12],extra:'x'})});ok(JSON.parse(c[T.WELCOME_TALLY_KEY]).m[0]===100000&&!('extra' in JSON.parse(c[T.WELCOME_TALLY_KEY])),'sanitised on load');
 ok(!(T.WELCOME_TALLY_KEY in S.cleanKeys({[T.WELCOME_TALLY_KEY]:'{bad'})),'a bad tally is dropped');
 ok(S.PLAYED_IGNORE_KEYS.includes(T.WELCOME_TALLY_KEY),'just being somewhere is not "played more recently"');}
for(const f of ['lib/welcome/tally.ts','lib/welcome/learn.ts','lib/welcome/hooks.ts','lib/welcome/facts.ts','lib/welcome/tallyLive.ts','lib/welcomeSuggestion.ts'])ok(!/fetch\(|sendBeacon|XMLHttpRequest/.test(read(f)),`${f}: never sends the profile`);
ok(!/count\(/.test(read('lib/welcome/tally.ts')+read('lib/welcome/hooks.ts')+read('lib/welcomeSuggestion.ts')),'the picker counts nothing');
{const C=require('../lib/analytics/countIds.ts');
 for(const id of ['ws:arm_on','ws:arm_hold','ws:back_on','ws:back_hold','ws:none','ws:s_fish_set','ws:t_lesson_streak','ws:a_cross_arcade_lesson'])ok(C.isCountId(id)&&C.FIXED_COUNT_IDS.includes(id),'registered '+id);
 const WR=require('../lib/analytics/welcomeReport.ts');
 const r=WR.buildWelcome({counts:{'ws:arm_on':90,'ws:back_on':45,'ws:arm_hold':10,'ws:back_hold':4,'ws:s_fish_set':20,'ws:t_fish_set':5,'ws:a_fish_set':4,'ws:none':3}});
 ok(r.status==='ok'&&r.arms[0].backShare===0.5&&r.arms[1].backShare===0.4&&r.kinds.length===1&&r.kinds[0].tapShare===0.25&&r.totals.acted===4&&r.none===3,'admin reading: totals and shares');
 ok(WR.buildWelcome({counts:{}}).status==='empty','empty');}
{const card=read('app/admin/WelcomeSuggestCard.tsx'),dash=read('app/admin/AnalyticsDashboard.tsx');
 ok(/data-metric="players\.welcome"><WelcomeSuggestCard data=\{report\.welcome\}/.test(dash)&&/ChartCard/.test(card),'admin card on the Players and retention tab');
 const K=require('../lib/welcome/kinds.ts').WELCOME_KINDS;for(const k of K)ok(card.includes(k+':'),'labelled '+k);}

// ---- 10. The note: same style, one tap target, existing events ----
{const wb=read('components/WelcomeBack.tsx'),act=read('lib/welcome/act.ts'),town=read('components/Town.tsx'),room=read('components/ArcadeRoom.tsx');
 ok((wb.match(/<button\b/g)||[]).length===1&&/className=\{styles\.note\} data-welcome-suggest-line/.test(wb)&&/toast\.toast/.test(wb),'one line in the existing note, same classes');
 ok(/ENDGAME_OPEN/.test(act)&&/FORMAT_PATH_LAUNCH/.test(act)&&/requestGoFishing/.test(act)&&/WELCOME_GO/.test(act),'tap acts through existing events');
 ok(/window\.location\.assign\('\/arcade'\+arcadeQueryRef\.current\)/.test(town)&&/addEventListener\(WELCOME_GO/.test(town),'Town: the same Enter doors');
 ok(/q\.get\('today'\)==='1'[^\n]*requestTodayLaunch/.test(room),'the arcade opens today’s challenge from ?today=1');
 // (act.ts is not required here: './formatPaths' would resolve to the .json beside it under this simple loader)
 ok(/arcadeQuery=\(game:string,today:boolean\)=>`\?game=\$\{encodeURIComponent\(game\)\}\$\{today\?'&today=1':''\}`/.test(act),'arcade query');
 ok(!/welcome\/|welcomeSuggestion/.test(read('components/landing/TitleActions.tsx')),'the title screen card is untouched');}

console.log(`WELCOME_SUGGESTIONS_PASS ${n} checks (tally, decay, tiers, back-off, holdout, cross nudge, rotation, saves, counters, admin)`);

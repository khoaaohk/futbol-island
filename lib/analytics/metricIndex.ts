/**
 * The metric index (Nov 6 2026, the /admin rebuild): every number the dashboard showed before the rebuild (the audit's
 * inventory, docs/analytics-audit-2026-11-06.md, plus every section of every old tab) and where it lives now. Each entry's
 * `id` is carried by a `data-metric` attribute in its new place; tests/admin-dashboard.cjs checks every id is rendered (and
 * the screenshot script checks it in a real browser), so nothing the owner had is lost.
 * `def`: the daily-layer series that defines it (its row in Definitions), when there is one.
 */
export type DashTab='overview'|'players'|'learning'|'island'|'matches'|'fishing'|'marketing'|'live'|'report';
export const DASH_TABS:[DashTab,string][]=[['overview','Overview'],['players','Players and retention'],['learning','Learning'],['island','Island and games'],['matches','Live matches'],['fishing','Fishing'],['marketing','Marketing'],['live','Live now'],['report','Sponsor report']];
/** Old tab hashes (#engagement …) open the tab that holds their sections now. */
export const OLD_TAB:Record<string,DashTab>={engagement:'island',players:'players',matches:'matches',marketing:'marketing',live:'live',report:'report',overview:'overview'};
export type MetricEntry={id:string;was:string;label:string;tab:DashTab;where:string;def?:string};

export const METRIC_INDEX:readonly MetricEntry[]=[
 // Old Overview (the audit inventory's headline numbers) → the new Overview story and "What players do".
 {id:'overview.players',was:'Overview',label:'Players (distinct player ids)',tab:'overview',where:'Headline tiles; Players and retention',def:'people.players_distinct'},
 {id:'overview.players_per_day',was:'Overview',label:'Players per day',tab:'overview',where:'Headline tiles and the main chart',def:'audience.players_per_day'},
 {id:'overview.returning_sessions',was:'Overview',label:'Returning sessions',tab:'overview',where:'Headline tiles',def:'people.returning_share'},
 {id:'overview.avg_session',was:'Overview',label:'Avg session',tab:'overview',where:'Headline tiles',def:'audience.avg_session_minutes'},
 {id:'overview.sessions',was:'Overview (CSV)',label:'Sessions',tab:'overview',where:'Headline tiles and the main chart',def:'audience.sessions'},
 {id:'overview.minutes_per_player',was:'(new)',label:'Minutes per player',tab:'overview',where:'Headline tiles',def:'audience.minutes_per_player'},
 {id:'overview.cards',was:'Overview',label:'Engagement cards (games, designs, cards, videos, books, reading, quizzes, friends, emotes)',tab:'overview',where:'What players do (cards, Download CSV, Export, How these are counted)',def:'engagement.games'},
 {id:'overview.games',was:'Overview',label:'Games played',tab:'island',where:'Island and games: trends',def:'engagement.games'},
 {id:'overview.cards_found',was:'Overview',label:'Cards found',tab:'overview',where:'Headline tiles',def:'engagement.cards'},
 {id:'overview.watched',was:'Overview',label:'Videos & stories',tab:'learning',where:'Learning: trends',def:'engagement.watched'},
 {id:'overview.quizzes',was:'Overview',label:'Quizzes taken',tab:'learning',where:'Learning: trends',def:'engagement.quizzes'},
 {id:'overview.friends_minutes',was:'Overview',label:'Minutes with friends',tab:'overview',where:'Headline tiles',def:'engagement.social'},
 {id:'overview.emotes',was:'Overview',label:'Emotes used',tab:'island',where:'Island and games: trends',def:'engagement.emotes'},
 {id:'overview.kit',was:'Overview',label:'T-shirts / cleats designed',tab:'island',where:'Island and games: trends',def:'engagement.shirts'},
 {id:'overview.change_vs_prior',was:'Overview',label:'Change vs the period before',tab:'overview',where:'Every tile (Compare toggle in the header)'},
 {id:'overview.export',was:'Overview',label:'Export (Summary, Daily, Definitions, ZIP)',tab:'overview',where:'Header Export panel and What players do'},
 // Old Players tab.
 {id:'players.headline',was:'Players',label:'Headline tiles (player-days, ≈ a day, save codes, growth)',tab:'players',where:'Headline'},
 {id:'players.visitors_chart',was:'Players',label:'Visitors, sessions and page views chart',tab:'players',where:'Headline',def:'audience.pageviews'},
 {id:'players.weekly_codes',was:'Players',label:'Weekly save codes',tab:'players',where:'Headline'},
 {id:'players.retention',was:'Players',label:'Save-code retention',tab:'players',where:'Headline'},
 {id:'players.new_player_funnel',was:'Players',label:'New-player funnel (title screen → island, codes that came back)',tab:'players',where:'Acquisition'},
 {id:'players.new_codes',was:'Players',label:'New save codes',tab:'players',where:'Acquisition'},
 {id:'players.sources',was:'Players',label:'Where they come from (source)',tab:'players',where:'Acquisition'},
 {id:'players.countries',was:'Players',label:'Countries',tab:'players',where:'Acquisition'},
 {id:'players.region',was:'Players',label:'States and provinces (Region)',tab:'players',where:'Acquisition'},
 {id:'players.referrers',was:'Players',label:'Referring sites',tab:'players',where:'Acquisition'},
 {id:'players.campaigns',was:'Players',label:'Campaigns',tab:'players',where:'Acquisition'},
 {id:'players.devices',was:'Players',label:'Devices',tab:'players',where:'Acquisition'},
 {id:'players.entry',was:'Players',label:'Entry pages',tab:'players',where:'Acquisition'},
 {id:'players.sources_section',was:'Players',label:'Where players come from (Sources: countries → regions, returning, codes)',tab:'players',where:'Acquisition'},
 {id:'players.save_health',was:'Players',label:'Save health and operations (limits, breaker, storage, expiry)',tab:'players',where:'Save health'},
 {id:'players.list',was:'Live (players slide-out)',label:'Players list and each player',tab:'players',where:'Players (list and detail)'},
 // Old Engagement tab.
 {id:'engagement.tiles',was:'Engagement',label:'Engagement tiles',tab:'players',where:'Engagement'},
 {id:'engagement.coming_back',was:'Engagement',label:'Coming back (save codes)',tab:'players',where:'Engagement'},
 {id:'engagement.restores',was:'Engagement',label:'Restores',tab:'players',where:'Engagement'},
 {id:'engagement.time_on_site',was:'Engagement',label:'Time on site (median, average, bounce, length buckets)',tab:'players',where:'Engagement',def:'audience.bounce_rate'},
 {id:'engagement.areas',was:'Engagement',label:'Where they spend time (minutes by area)',tab:'island',where:'Product usage',def:'time.area_minutes.island'},
 {id:'engagement.plan',was:'Engagement',label:'Football plan',tab:'island',where:'Product usage'},
 {id:'engagement.island',was:'Engagement',label:'Island (places, heatmap, activities)',tab:'island',where:'Product usage'},
 {id:'engagement.summit_kit',was:'Engagement',label:'Summit Isle and the Kit Shop',tab:'island',where:'Product usage'},
 {id:'engagement.fishing',was:'Engagement',label:'Fishing (and the fishing funnel)',tab:'fishing',where:'Fishing',def:'fishing.funnel_sessions.start'},
 {id:'engagement.water',was:'Engagement',label:'Water and swimming',tab:'island',where:'Product usage'},
 {id:'engagement.friends',was:'Engagement',label:'Friends and parties (incl. relay health)',tab:'island',where:'Product usage',def:'engagement.social'},
 {id:'engagement.emotes',was:'Engagement',label:'Emotes',tab:'island',where:'Product usage',def:'engagement.emotes'},
 {id:'engagement.party_retention',was:'Engagement',label:'Party retention',tab:'island',where:'Product usage'},
 {id:'engagement.start',was:'Engagement',label:'Title screen detail (every funnel, For grown-ups, donations, privacy)',tab:'players',where:'Onboarding detail',def:'counters.st:view.sessions'},
 {id:'engagement.learning',was:'Engagement',label:'Learning detail (lesson funnels, questions, settings)',tab:'learning',where:'Learning detail',def:'learning.first_try.share'},
 // Live matches, Marketing, Live, Sponsor report.
 {id:'matches.section',was:'Live matches',label:'Live matches (visits, joins, players, a week, play share, minutes, average, median, formats, by day, how often, length, positions, friends, endings)',tab:'matches',where:'Live matches',def:'live_matches.joins.all'},
 {id:'matches.goals_replays_slots',was:'(new)',label:'Goals, replays, AI and human players',tab:'matches',where:'Live matches',def:'live_matches.goals.all'},
 {id:'marketing.section',was:'Marketing page',label:'Tour page (views, time, bounce, play funnel, cards, slides, FAQ)',tab:'marketing',where:'Marketing',def:'marketing.tour_views'},
 {id:'marketing.visits',was:'Marketing page',label:'Investor page visits (places, hours, stay)',tab:'marketing',where:'Marketing',def:'marketing.investor_visits'},
 {id:'live.on_now',was:'Live',label:'On now, today’s players, players in this range',tab:'live',where:'Live now'},
 {id:'report.weekly',was:'Sponsor report',label:'Weekly sponsor report',tab:'report',where:'Sponsor report'},
];

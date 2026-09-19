export const UPCOMING_STORIES:Record<string,{id:string;title:string;theme:string}[]>={
 futsal:[{id:'chalk-line',title:'The Chalk Line',theme:'Creative confidence'},{id:'woven-court',title:'The Woven Court',theme:'Trust and shared responsibility'},{id:'kite-turned',title:'The Kite That Turned',theme:'Adapting when plans change'}],
 '7v7':[{id:'place-picture',title:'A Place in the Picture',theme:'Belonging as yourself'},{id:'pocket-radio',title:'The Pocket Radio',theme:'A kinder inner voice'},{id:'signal-water',title:'The Signal Across the Water',theme:'Asking for help'}],
 '9v9':[{id:'different-tides',title:'Different Tides',theme:'Growing at your own pace'},{id:'harbour-night',title:'The Harbour at Night',theme:'Making room for rest'},{id:'unfinished-map',title:'The Unfinished Map',theme:'Learning from feedback'}],
 '11v11':[{id:'quiet-lantern',title:'The Quiet Lantern',theme:'Quiet leadership'},{id:'boat-weather',title:'The Boat and the Weather',theme:'Finding what you can control'},{id:'more-shirt',title:'More Than a Shirt',theme:'You are more than your position'}]
};
export type UpcomingStory=typeof UPCOMING_STORIES[string][number];

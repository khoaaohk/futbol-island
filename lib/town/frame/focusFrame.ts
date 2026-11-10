import type * as T from 'three';

/* Focus mode, one step of Town's frame loop (moved out of animate(), Nov 10 2026 split; same code, same place in the frame:
   after the catch stage, before match focus). Runs every frame; allocates only on an enter/exit edge, as before. The context is
   one long-lived object Town builds once before the loop. */
type Stand={x:number;z:number};
export type FocusFrame={
  focusAllowed:boolean;focusNearLive:boolean;focusParam:string|null;FOCUS_LIVE_M:number;
  fishing:{readonly focused:boolean;readonly stand:Stand};easel:{readonly focused:boolean;readonly stand:Stand};
  learningFormat:{current:unknown};lessonRef:{current:unknown};fieldMenu:{current:unknown};
  focus:{readonly active:boolean;enter(x:number,z:number,backdrop:boolean):void;exit():void;near(root:T.Object3D,m:number):boolean};
  islandNpcs:{setFocus(f:{x:number;z:number;r:number}|null):void};heat:{setFocus(on:boolean):void};
  focusLive:{games:boolean;traffic:boolean;volleyball:boolean;coaches:boolean};
  games:{readonly entries:readonly {readonly venue:{x:number;z:number;width:number;length:number}}[]};
  streetTraffic:{readonly cars:readonly {readonly group:T.Object3D}[]};
  volleyballGame:{readonly root:T.Object3D};coachPractice:{readonly root:T.Object3D};
};

// Focus mode: on once the fishing camera has arrived, off the moment fishing stops (the camera eases out with the island live).
export function stepFocusMode(c:FocusFrame){
  const {focusAllowed,focusNearLive,focusParam,FOCUS_LIVE_M,fishing,easel,learningFormat,lessonRef,fieldMenu,focus,islandNpcs,heat,focusLive,games,streetTraffic,volleyballGame,coachPractice}=c;
  const focusWanted=focusAllowed&&(fishing.focused||easel.focused)&&!learningFormat.current&&!lessonRef.current&&!fieldMenu.current;
  if(focusWanted!==focus.active){
    // User (Oct 12 2026): "when fishing, have the npcs not move around ... don't have npcs move in at all": EVERYTHING holds still,
    // near ones too (r −1 holds every townsperson); ?fishfocus=near brings back the old 30 m live ring for A/B runs.
    if(focusWanted){const s=easel.focused?easel.stand:fishing.stand,near=(x:number,z:number,r=0)=>focusNearLive&&Math.hypot(x-s.x,z-s.z)-r<FOCUS_LIVE_M;
      focus.enter(s.x,s.z,!easel.focused&&focusParam!=='hold');/* fishing: low-detail backdrop past the near cells (?fishfocus=hold: full detail) */islandNpcs.setFocus({x:s.x,z:s.z,r:focusNearLive?FOCUS_LIVE_M:-1});heat.setFocus(true);
      focusLive.games=games.entries.some(e=>near(e.venue.x,e.venue.z,Math.hypot(e.venue.width,e.venue.length)/2));
      focusLive.traffic=streetTraffic.cars.some(car=>near(car.group.position.x,car.group.position.z));
      focusLive.volleyball=focusNearLive&&focus.near(volleyballGame.root,FOCUS_LIVE_M);focusLive.coaches=focusNearLive&&focus.near(coachPractice.root,FOCUS_LIVE_M);}
    else{focus.exit();islandNpcs.setFocus(null);heat.setFocus(false);focusLive.games=focusLive.traffic=focusLive.volleyball=focusLive.coaches=true;}
  }
}

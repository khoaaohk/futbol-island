const KEY='fi2-welcome-v1';
let finishedThisVisit=false;
export function shouldShowIslandOnboarding(){if(finishedThisVisit)return false;try{return localStorage.getItem(KEY)===null;}catch{return true;}}
export function finishIslandOnboarding(reason:'completed'|'dismissed'){finishedThisVisit=true;try{localStorage.setItem(KEY,reason);}catch{/* Keep dismissal for this visit when storage is unavailable. */}}

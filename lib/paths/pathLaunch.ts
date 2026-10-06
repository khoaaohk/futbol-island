'use client';
import {FORMAT_PATH_LAUNCH,type PathLesson} from './formatPaths';
import {PATH_LAST_OPENED_KEY,pathLaunchDetail,savedLastOpened} from './pathContinue';
import {endLearningPreview} from '../town/learningProgress';
import type {Format} from '../town/venues';
/**
 * Start (or resume) a Paths lesson from anywhere: remembers it as the path's last-opened lesson (so Paths' landing card and
 * Continue agree) and fires the usual FORMAT_PATH_LAUNCH event (Town opens the pitch and FieldLearning plays it). Used by the
 * HUD pitch card, the onboarding's last button and the quiz end's "Next lesson" (Oct 4 2026, clear path).
 */
export function launchPathLesson(format:Format,lesson:PathLesson,steps:ReadonlySet<string>,answers:ReadonlySet<string>){
 endLearningPreview();
 try{localStorage.setItem(PATH_LAST_OPENED_KEY,JSON.stringify({...savedLastOpened(localStorage),[format]:lesson.id}));}catch{}
 window.dispatchEvent(new CustomEvent(FORMAT_PATH_LAUNCH,{detail:pathLaunchDetail(format,lesson,steps,answers)}));
}
/** The last-opened lesson per format, read safely (empty without storage). */
export function readLastOpened():Record<string,string>{try{return savedLastOpened(localStorage);}catch{return {};}}

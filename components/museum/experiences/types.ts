import type {Exhibit} from '@/lib/endgame/museum';
import type {CertificateId} from '@/lib/endgame/certificate';
/**
 * The contract every full-screen museum experience implements (Oct 5 2026, user: "build each of the museum areas to be more
 * experimental like this full screen area … more out of the box thinking and design"). One folder per exhibit under
 * components/museum/experiences/<exhibit id>/ with a default-exported Experience. The host (MuseumRoom) mounts it over the hall
 * (the hall's render loop is paused while it's open) and unmounts it on close; the experience must dispose everything it made.
 */
export type ExperienceProps={
 exhibit:Exhibit;
 /** Leave the experience (call it from a shared NavigationButton back "Back", never `immediate`). */
 onClose:()=>void;
 /** The player's earned certificates (Hall of Fame) and a way to show one. */
 earned:readonly CertificateId[];
 openCertificate:(id:CertificateId)=>void;
 /** Optional (timeline wall): close the experience and take the hall to this case. Experiences that don't jump ignore it. */
 onVisit?:(exhibitId:string)=>void;
 /** Optional (timeline wall): step straight inside another exhibit's experience. Back from there returns to the timeline. */
 onEnter?:(exhibitId:string)=>void;
 /**
  * Optional: call once when the visitor has finished this exhibit (its takeaway is showing, the challenge is done…). It turns
  * the exhibit's passport stamp gold (lib/museum/museumVisits.ts). Calling it again is harmless. Stepping inside already earns
  * the ordinary stamp, so exhibits that never call it still count as visited.
  */
 onComplete?:()=>void;
};

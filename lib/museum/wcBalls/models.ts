/**
 * Balls shown from a licensed 3D model instead of a procedural design (Oct 5 2026; sources and licences in
 * docs/museum/BALL_SOURCES.md). The GLB lives in public/models/wcballs/<id>.glb; the procedural design stays as the fallback
 * (loading, failure, and the museum plinth). Every model is CC BY 4.0: the gallery credits title, author, link and licence.
 */
export type ModelCredit={title:string;author:string;url:string;licence:string;changed?:string};
export type BallModel={url:string;credit:ModelCredit;/** Euler (radians) that turns the model to the gallery's hero view. */turn?:readonly [number,number,number]};
export const BALL_MODELS:Readonly<Record<string,BallModel>>={};

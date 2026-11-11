import type * as T from 'three';

/** The five arcade games (ids match lib/arcade/arcadeCatalog.ts). */
export type ArcadeGameId='live'|'runner'|'tennis'|'pinball'|'puzzle'|'kitrush'|'snake'|'airhockey';

/** What a look's environment builder may use: the stage's scene plus its shared-geometry primitive helpers
 * (materials are cached per colour and coloured through the look's own `surface`). */
export type ArcadeStageKit={
 scene:T.Scene;mobile:boolean;reduced:boolean;
 mat(color:string):T.MeshStandardMaterial;
 box(x:number,y:number,z:number,w:number,h:number,d:number,color:string,parent?:T.Object3D):T.Mesh;
 sphere(x:number,y:number,z:number,r:number,color:string,parent?:T.Object3D):T.Mesh;
 cylinder(x:number,y:number,z:number,r:number,h:number,color:string,parent?:T.Object3D):T.Mesh;
};
/** `scenery` is the group the stage exposes as stage.scenery (games hide it or scroll it); `dispose` frees what the
 * scene walk in stage.dispose() cannot reach (it already disposes every geometry, material and texture in the scene). */
export type ArcadeEnvironment={scenery:T.Group;dispose():void};

/** One game's stage look: everything lib/arcade/arcadeStage.ts used to hard-code. Each game owns one of these
 * (lib/arcade/looks/<game>.ts) and passes it to createArcadeStage(canvas, look). Heat rules still apply (AGENTS.md):
 * one sun, no postprocessing chain, capped pixel ratio, low-power context. */
export type ArcadeStageLook={
 id:ArcadeGameId;
 renderer:{antialias:boolean;powerPreference:WebGLPowerPreference;
  /** devicePixelRatio is clamped to this. */pixelRatioCap:{mobile:number;desktop:number};
  shadows:boolean;shadowType:T.ShadowMapType;toneMapping:T.ToneMapping;exposure:number};
 background:string;
 fog:{color:string;near:number;far:number};
 camera:{fov:number;near:number;far:number};
 hemi:{sky:string;ground:string;intensity:number};
 sun:{color:string;intensity:number;position:[number,number,number];shadowMapSize:{mobile:number;desktop:number};
  frustum:{left:number;right:number;top:number;bottom:number;near:number;far:number};normalBias:number;bias:number;radius:number};
 /** Every stage.box/sphere/cylinder/ring colour passes through here (today: the neon cabinet remap). */
 surface:{color(color:string):string;emissive(color:string):boolean;roughness:number;emissiveIntensity:number};
 /** stage.football() / footballMerged() colours (still passed through `surface`). */
 ball:{base:string;patch:string};
 /** stage.burst() particle colour. */
 sparks:{color:string};
 /** Builds the ground and backdrop once, at stage creation. */
 environment(kit:ArcadeStageKit):ArcadeEnvironment;
};

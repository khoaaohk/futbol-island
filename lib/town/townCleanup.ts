import * as T from 'three';

/* Town unmount (Nov 10 2026 split): each resource registers its own cleanup where Town creates it; unmount runs them newest
   first (reverse order of registration), then the scene-wide sweep below, then the renderer and its context. */
export type TownDisposers={add(fn:()=>void):void;runAll():void};

export function createTownDisposers():TownDisposers{
  const list:(()=>void)[]=[];
  return {
    add(fn){list.push(fn);},
    runAll(){for(let i=list.length-1;i>=0;i--)list[i]();list.length=0;},
  };
}

/* Nov 10 2026 (arcadeStage.ts pattern): textures too, shared module-level ones included (a live renderer that still uses one
   re-uploads it; dispose only frees this context's copy, and every uploaded texture's dispose listener otherwise pins this
   context), shadow-pass materials, then the context itself (Town calls renderer.dispose() and forceContextLoss() after this). */
export function disposeTownSceneResources(scene:T.Scene){
  const textures=new Set<T.Texture>(),addTexture=(v:unknown)=>{if((v as T.Texture|null)?.isTexture)textures.add(v as T.Texture);},mats=new Set<T.Material>();addTexture(scene.background);addTexture(scene.environment);scene.traverse(object=>{if(object instanceof T.Mesh||object instanceof T.Line||object instanceof T.Points||object instanceof T.Sprite){object.geometry.dispose();const list=Array.isArray(object.material)?object.material:[object.material];list.forEach(m=>mats.add(m));for(const m of [object.customDepthMaterial,object.customDistanceMaterial])if(m)mats.add(m);}});mats.forEach(m=>{for(const v of Object.values(m)){addTexture(v);if(v&&typeof v==='object'&&!(v as T.Texture).isTexture&&!Array.isArray(v))for(const u of Object.values(v as Record<string,unknown>))addTexture((u as {value?:unknown}|null)?.value);}m.dispose();});textures.forEach(t=>t.dispose());
}

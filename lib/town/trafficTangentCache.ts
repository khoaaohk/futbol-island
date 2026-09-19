import * as T from 'three';

/** Two exact samples cover the current and proposed pose without approximating turns. */
export function createTrafficTangentCache(){
 const routes=new WeakMap<T.Curve<T.Vector3>,{a:number;b:number;av:T.Vector3;bv:T.Vector3}>();
 const stats={evaluations:0,hits:0};
 return {stats,sample(path:T.Curve<T.Vector3>,progress:number,out:T.Vector3){
  let cache=routes.get(path);
  if(!cache){cache={a:NaN,b:NaN,av:new T.Vector3(),bv:new T.Vector3()};routes.set(path,cache);}
  if(cache.a===progress){stats.hits++;return out.copy(cache.av);}
  if(cache.b===progress){stats.hits++;return out.copy(cache.bv);}
  cache.b=cache.a;cache.bv.copy(cache.av);cache.a=progress;
  path.getTangentAt(progress,cache.av);stats.evaluations++;return out.copy(cache.av);
 }};
}

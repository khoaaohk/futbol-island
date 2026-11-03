interface Env{MEDIA:R2Bucket}
const ORIGINS=new Set(['https://futbolisland.app','https://www.futbolisland.app']);
const TYPES:Record<string,string>={mp4:'video/mp4',webm:'video/webm',webp:'image/webp',png:'image/png',jpg:'image/jpeg',json:'application/json'};

export default{
 async fetch(req:Request,env:Env,ctx:ExecutionContext):Promise<Response>{
  if(req.method!=='GET'&&req.method!=='HEAD')return new Response('Method not allowed',{status:405});
  const url=new URL(req.url);
  const key=decodeURIComponent(url.pathname.replace(/^\/+/,''));
  if(!key||key.includes('..'))return new Response('Not found',{status:404});
  const origin=req.headers.get('Origin')||'';
  const cors:Record<string,string>={'Vary':'Origin','Access-Control-Allow-Origin':ORIGINS.has(origin)||/^http:\/\/localhost:\d+$/.test(origin)?origin:'https://futbolisland.app','Accept-Ranges':'bytes'};
  const cache=caches.default;
  const range=req.headers.get('Range');
  if(!range){const hit=await cache.match(req);if(hit)return hit;}
  const obj=await env.MEDIA.get(key,range?{range:req.headers}:undefined);
  if(!obj)return new Response('Not found',{status:404,headers:cors});
  const h=new Headers(cors);
  const ext=key.split('.').pop()||'';
  h.set('Content-Type',TYPES[ext]||obj.httpMetadata?.contentType||'application/octet-stream');
  h.set('Cache-Control','public, max-age=31536000, immutable');
  h.set('ETag',obj.httpEtag);
  const body=obj as R2ObjectBody;
  let status=200;
  if(range&&obj.range&&'offset' in obj.range){
   const r=obj.range as {offset:number;length:number};
   h.set('Content-Range',`bytes ${r.offset}-${r.offset+r.length-1}/${obj.size}`);h.set('Content-Length',String(r.length));status=206;
  }else h.set('Content-Length',String(obj.size));
  const res=new Response(req.method==='HEAD'?null:body.body,{status,headers:h});
  if(!range&&status===200&&req.method==='GET')ctx.waitUntil(cache.put(req,res.clone()));
  return res;
 },
};

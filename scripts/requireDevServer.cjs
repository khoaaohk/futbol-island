// Dev-only browser scripts (QA11): `?preview=all`, `?testCoins=`, `?store=` and the lab pages (/motion-lab, /skill-lab,
// /splash-lab) are switched off in production builds (lib/dev/labRoutes.ts, isVendingPreview/testCoinsRequested), so against
// `npm start` a script would silently see the normal island or a 404. Run these scripts against `npm run dev` (:8092).
// requireDevServer(base) fails fast with a clear message when the server is missing or is a production build. It makes one
// cheap request for Next's dev-only webpack runtime (production builds only serve the hashed webpack-<hash>.js).
async function requireDevServer(base=process.env.FUTBOL_BASE_URL||'http://localhost:8092'){
 const url=new URL('/_next/static/chunks/webpack.js',base).href;let res;
 try{res=await fetch(url,{method:'HEAD'});}catch{throw new Error(`No server at ${base}. Start the dev server first: npm run dev`);}
 if(res.status===404)throw new Error(`${base} is a production build (npm start). This script needs ?preview=all / ?testCoins / the lab pages, which only exist under the dev server: stop it and run npm run dev`);
}
module.exports={requireDevServer};

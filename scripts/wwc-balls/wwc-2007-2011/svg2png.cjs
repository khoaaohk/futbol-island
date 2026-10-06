// node svg2png.cjs in.svg out.png width
const {chromium}=require('/Users/khoado/Desktop/Warp Claude Projects/futbol-island/node_modules/playwright');const fs=require('fs');
(async()=>{const [i,o,w]=process.argv.slice(2);const svg=fs.readFileSync(i,'utf8');const b=await chromium.launch({args:['--mute-audio']});const p=await b.newPage();
await p.setContent(`<html><body style="margin:0;background:transparent"><img id=i style="width:${w}px" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></body></html>`);
await p.waitForTimeout(300);const e=await p.$('#i');await e.screenshot({path:o,omitBackground:true});await b.close();})();

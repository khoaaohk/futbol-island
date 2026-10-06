// usage: node svg2png.cjs in.svg out.png heightPx  -> transparent PNG of the SVG (black fill kept)
const {chromium}=require('/Users/khoado/Desktop/Warp Claude Projects/futbol-island/node_modules/playwright');const fs=require('fs');
(async()=>{const [inp,out,h]=process.argv.slice(2);const svg=fs.readFileSync(inp,'utf8');const b=await chromium.launch({args:['--mute-audio']});const p=await b.newPage();
 await p.setContent(`<html><body style="margin:0;background:transparent"><img id=i style="height:${h}px" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></body></html>`);
 const el=await p.$('#i');await p.waitForTimeout(300);await el.screenshot({path:out,omitBackground:true});await b.close();})();

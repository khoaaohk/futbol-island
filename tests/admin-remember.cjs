#!/usr/bin/env node
// Admin "Remember this device for 30 days" (Nov 16 2026): the 30-day flag is signed into the token, a plain session keeps
// its 12 h cap, cookie flags, tampering, the session epoch, a new password, Log out, and the sliding renewal.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const {createLoader}=require('./summit-harness.cjs');
const A=createLoader({})('lib/analytics/adminAuth.ts');
const read=f=>fs.readFileSync(f,'utf8');
const H=3_600_000,D=24*H,env={ADMIN_PASSWORD:'a long admin password'},now=Date.UTC(2026,10,16,12);
const resign=(payload,e=env,epoch=0)=>{const k=crypto.createHmac('sha256',e.ADMIN_PASSWORD).update('futbol-island admin session v1'+(epoch>0?':epoch '+epoch:'')).digest();
 return payload+'.'+crypto.createHmac('sha256',k).update(payload).digest('base64url');};
let n=0;const ok=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};

ok('lifetimes',()=>{
 assert.equal(A.SESSION_TTL_MS,12*H);assert.equal(A.REMEMBER_TTL_MS,30*D);
 const r=A.signSession(now,env,0,true);
 assert(A.verifySession(r,now,env,0)&&A.verifySession(r,now+30*D-1,env,0),'remembered: valid for 30 days');
 assert(!A.verifySession(r,now+30*D,env,0)&&!A.verifySession(r,now+31*D,env,0),'remembered: fails after 30 days');
 assert.deepEqual(A.readSession(r,now,env,0),{exp:now+30*D,remember:true,since:now});
 const p=A.signSession(now,env,0);
 assert(A.verifySession(p,now+12*H-1,env,0)&&!A.verifySession(p,now+12*H,env,0)&&!A.verifySession(p,now+13*H,env,0),'plain: 12 h as before');
 assert.deepEqual(A.readSession(p,now,env,0),{exp:now+12*H,remember:false});
 assert.equal(p.split('.').length,3,'plain token format unchanged');assert.equal(r.split('.')[2],'r');
 assert(A.signSession(now,env,0,false).split('.').length===3);
});
ok('cookie flags',()=>{
 for(const rem of [false,true]){const o=A.cookieOptions(rem);
  assert.equal(o.httpOnly,true);assert.equal(o.secure,true);assert.equal(o.sameSite,'strict');assert.equal(o.path,'/');
  assert.equal(o.maxAge,rem?30*86400:12*3600);}
 assert.equal(A.cookieOptions().maxAge,12*3600,'default stays 12 h');assert.equal(A.ADMIN_COOKIE,'fi_admin');
});
ok('tampering',()=>{
 const p=A.signSession(now,env,0),[exp,nonce,sig]=p.split('.');
 assert(!A.verifySession(`${exp}.${nonce}.r.${sig}`,now,env,0),'adding the remember flag breaks the signature');
 assert(!A.verifySession(`${now+29*D}.${nonce}.${sig}`,now,env,0),'stretched expiry, old signature');
 const r=A.signSession(now,env,0,true),[re,rn,,rsince,rs]=r.split('.');
 assert(!A.verifySession(`${re}.${rn}.${rs}`,now,env,0),'dropping the flag breaks the signature');
 assert(!A.verifySession(`${Number(re)+D}.${rn}.r.${rsince}.${rs}`,now,env,0),'remembered expiry tampered');
 assert(!A.verifySession(`${re}.${rn}.r.${Number(rsince)+D}.${rs}`,now,env,0),'sign-in time tampered');
 // Even a correctly keyed token is held to its kind's cap (defence in depth) and to the exact shape.
 assert(!A.verifySession(resign(`${now+13*H}.${nonce}`),now,env,0),'plain token past 12 h refused');
 assert(!A.verifySession(resign(`${now+31*D}.${nonce}.r.${now}`),now,env,0),'remembered token past 30 days refused');
 assert(!A.verifySession(resign(`${now+D}.${nonce}.x`),now,env,0)&&!A.verifySession(resign(`${now+D}.${nonce}.r.r`),now,env,0)&&!A.verifySession(resign(`${now+D}.${nonce}.r`),now,env,0)&&!A.verifySession(resign(`${now+D}.${nonce}.r.${now+H}`),now,env,0),'unknown shapes (and a sign-in time in the future) refused');
 assert(!A.verifySession(resign(`${now+D}.${nonce}.r.${now-90*D}`),now,env,0),'past sign-in + 90 days refused even when correctly keyed');
 assert(A.verifySession(resign(`${now+D}.${nonce}.r.${now-H}`),now,env,0),'harness check: a well-formed remembered token passes');
});
ok('revocation',()=>{
 const r=A.signSession(now,env,0,true);
 assert(!A.verifySession(r,now+H,env,1),'Sign out everywhere (epoch bump) revokes a remembered session');
 assert(!A.verifySession(r,now,{ADMIN_PASSWORD:'another long password'},0),'a new password revokes it');
 assert(!A.verifySession(r,now,{...env,ADMIN_SESSION_SECRET:'y'.repeat(40)},0),'a new session secret revokes it');
 assert.equal(A.renewSession(r,now+25*D,env,1),null,'a revoked session cannot be renewed');
 const lo=read('app/api/admin/logout/route.ts');assert(/cookies\(\)\.set\(ADMIN_COOKIE,'',\{\.\.\.cookieOptions\(\),maxAge:0\}\)/.test(lo)&&lo.indexOf('sameOrigin(')<lo.indexOf('cookies().set'),'Log out clears the cookie (same path/flags, Max-Age 0)');
 const so=read('app/api/admin/signout-all/route.ts');assert(/maxAge:0/.test(so));
});
ok('sliding renewal',()=>{
 const r=A.signSession(now,env,0,true);
 assert.equal(A.renewSession(r,now+22*D,env,0),null,'8 days left: no renewal');
 const fresh=A.renewSession(r,now+24*D,env,0);assert(fresh&&fresh!==r,'6 days left: re-issued');
 assert.deepEqual(A.readSession(fresh,now+24*D,env,0),{exp:now+54*D,remember:true,since:now},'for 30 days from now, still remembered, original sign-in kept');
 assert.equal(A.renewSession(A.signSession(now,env,0),now+11*H,env,0),null,'a plain session is never extended');
 assert.equal(A.renewSession(r,now+31*D,env,0),null,'an expired session is not renewed');
 assert.equal(A.renewSession('junk',now,env,0),null);
});
ok('90-day cap',()=>{
 assert.equal(A.REMEMBER_MAX_MS,90*D);
 let t=A.signSession(now,env,0,true),at=now,renewals=0;
 for(let i=0;i<20;i++){const s=A.readSession(t,at,env,0);if(!s)break;const n=A.renewSession(t,s.exp-D,env,0);at=s.exp-D;if(!n)break;t=n;renewals++;}
 const last=A.readSession(t,at,env,0);
 assert(last&&last.exp===now+90*D&&last.since===now,'renewals stop exactly at sign-in + 90 days');
 assert(renewals>=2&&renewals<=4,'a few renewals, then none');
 assert.equal(A.renewSession(t,now+90*D-D,env,0),null,'at the cap: no further renewal');
 assert(!A.verifySession(t,now+90*D,env,0),'day 90: signed out, password again');
 assert.equal(A.signSession(now+90*D,env,0,true,now),null,'cannot mint a remembered token past the cap');
 const fresh=A.signSession(now+91*D,env,0,true);assert(A.verifySession(fresh,now+91*D,env,0),'signing in again starts a new 90 days');
 const route=read('app/api/admin/session/route.ts');
 assert(route.indexOf('sameOrigin(')<route.indexOf('loadSessionEpoch()')&&route.indexOf('loadSessionEpoch()')<route.indexOf('verifySession(cookies')&&route.indexOf('verifySession(cookies')<route.indexOf('renewSession('),'origin, epoch, session, then renew');
 assert(/cookies\(\)\.set\(ADMIN_COOKIE,fresh,cookieOptions\(true\)\)/.test(route)&&/export async function POST/.test(route)&&!/export async function GET/.test(route));
});
ok('login route and form',()=>{
 const login=read('app/api/admin/login/route.ts');
 assert(/remember=b\?\.remember===true/.test(login),'only a literal true remembers');
 assert(/signSession\(now,undefined,undefined,remember\)!,cookieOptions\(remember\)/.test(login));
 assert(login.indexOf('sameOrigin(')<login.indexOf('lockout.locked(')&&login.indexOf('passwordMatches(')<login.indexOf('signSession('),'origin + lockout + constant-time compare still first');
 assert(/loginBudget\(ip\)/.test(login)&&/text\.length>512/.test(login));
 const form=read('app/admin/AdminLogin.tsx');
 assert(/useState\(false\)/.test(form)&&/id="admin-remember" type="checkbox"/.test(form)&&/htmlFor="admin-remember"/.test(form)&&/Remember this device for 30 days/.test(form),'unchecked by default, labelled');
 assert(/JSON\.stringify\(\{password,remember\}\)/.test(form));
 const sh=read('app/admin/SiteHealthSection.tsx');assert(/Remembered on this device until/.test(sh)&&/Forget this device/.test(sh));
});
console.log(`admin-remember: ${n} groups passed`);

const fs=require('fs'),assert=require('assert');
const s=fs.readFileSync('components/Town.tsx','utf8');
assert(/ringNormal=new T\.Vector3/.test(s)&&/ringFace=new T\.Vector3/.test(s),'ring scratch vectors are created once, not per frame');
assert(/ring\.quaternion\.setFromUnitVectors\(ringFace,ringNormal\)/.test(s),'on open terrain the foot ring lies in the ground plane');
assert(/else ring\.rotation\.set\(-Math\.PI\/2,0,0\)/.test(s),'on roofs, ramps and in the air the ring goes back to flat');
assert(!/ring\.position\.y\+=[^;]*new T\./.test(s),'no allocation in the ring lift');
console.log('ring-slope: ok');

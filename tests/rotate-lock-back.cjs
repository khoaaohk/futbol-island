// "Turn your phone sideways" card has a Back to arcade button that makes ArcadeRoom leave the open game (owner, Oct 27 2026).
const fs=require('fs'),assert=require('assert');
const lock=fs.readFileSync('components/RotateLock.tsx','utf8'),css=fs.readFileSync('components/RotateLock.module.css','utf8'),room=fs.readFileSync('components/ArcadeRoom.tsx','utf8');
assert(/mode === 'landscape' && <button type="button" className=\{styles\.leave\}/.test(lock),'button on the landscape-game card');
assert(/mode === 'portrait' && inArcade && <button type="button" className=\{styles\.leave\} data-portrait-back/.test(lock),'portrait card has Back in the arcade only (Nov 14 2026)');
assert(/startsWith\('\/arcade'\)/.test(lock),'portrait Back scoped to /arcade');
assert(/Back to arcade/.test(lock)&&/ARCADE_EXIT_EVENT/.test(lock),'button sends the exit event');
assert(/\.leave\{[^}]*min-height:48px/.test(css),'thumb-sized button');
assert(/addEventListener\(ARCADE_EXIT_EVENT,leave\)/.test(room)&&/const leave=\(\)=>gameOpen\.current\?back\(\):leaveRef\.current\(\)/.test(room),'arcade room leaves the game (or the room) on the event');
console.log('Rotate card back button: passed.');

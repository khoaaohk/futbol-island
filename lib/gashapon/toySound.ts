/**
 * Toy voices for the gashapon viewer (round 3A, Nov 8 2026): original synth, no audio files. Each toy's `sound` recipe
 * (lib/gashapon/toys.ts, plain words) is spoken by a few named presets (`VOICES`): a builder lists them per action
 * (`voice:{squeeze:['squish','bloop:1.2'],…}`, the number is a pitch factor) and the generic figure picks them from the recipe's
 * words (`voicesFromText`). Through the page's shared AudioContext (lib/konbini/konbiniSound.ts; null while the island is muted)
 * at the island's volume, into ONE bus per viewer. Throttled (one start per 80 ms per action), polyphony-capped (4 voices),
 * every source stops within ~1 s, and `dispose()` stops whatever is still sounding and disconnects the bus.
 */
import {getSoundVolume,isSoundEnabled} from '../games/sound';
import {konbiniAudioContext,unlockKonbiniAudio} from '../konbini/konbiniSound';

type Ctx={c:AudioContext;out:AudioNode;at:number;p:number;track:(n:AudioScheduledSourceNode,end:number)=>void};
type Preset=(x:Ctx)=>number;// returns the voice's length in seconds

function tone(x:Ctx,hz:number,to:number,at:number,dur:number,vol:number,type:OscillatorType='sine'){
 const {c}=x,o=c.createOscillator(),g=c.createGain(),t=x.at+at;o.type=type;o.frequency.setValueAtTime(hz*x.p,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,to*x.p),t+dur);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(x.out);o.start(t);o.stop(t+dur+.03);x.track(o,t+dur+.03);
}
let noiseBuf:AudioBuffer|null=null;
function noise(x:Ctx,hz:number,to:number,at:number,dur:number,vol:number,q=1.2,type:BiquadFilterType='bandpass'){
 const {c}=x;if(!noiseBuf||noiseBuf.sampleRate!==c.sampleRate){const n=Math.round(c.sampleRate*.6),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let s=11;for(let i=0;i<n;i++){s=(Math.imul(s,1664525)+1013904223)>>>0;d[i]=s/2147483648-1;}noiseBuf=b;}
 const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),t=x.at+at;src.buffer=noiseBuf;f.type=type;f.Q.value=q;f.frequency.setValueAtTime(hz*x.p,t);f.frequency.exponentialRampToValueAtTime(Math.max(40,to*x.p),t+dur);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+Math.min(.03,dur/4));g.gain.exponentialRampToValueAtTime(.0001,t+dur);src.connect(f);f.connect(g);g.connect(x.out);src.start(t);src.stop(t+dur+.03);x.track(src,t+dur+.03);
}

export const VOICES:Record<string,Preset>={
 squish:x=>{tone(x,520,880,0,.16,.05,'triangle');noise(x,1800,900,0,.12,.025,2);return .18;},
 squeak:x=>{tone(x,900,1500,0,.12,.045,'square');return .14;},
 bloop:x=>{tone(x,260,520,0,.2,.07);return .22;},
 boop:x=>{tone(x,440,440,0,.14,.06,'triangle');return .16;},
 mmhm:x=>{tone(x,240,220,0,.16,.06);tone(x,300,380,.18,.16,.06);return .36;},
 boing:x=>{tone(x,180,720,0,.3,.06,'triangle');tone(x,720,540,.3,.12,.03,'triangle');return .44;},
 pop:x=>{noise(x,2200,1200,0,.04,.05,3);tone(x,480,1150,0,.1,.05);return .12;},
 pip:x=>{tone(x,1320,1500,0,.08,.04,'square');return .1;},
 click:x=>{noise(x,3200,2600,0,.03,.06,4);return .04;},
 crispy:x=>{for(let i=0;i<3;i++)noise(x,3000+i*300,2200,i*.07,.04,.06,3);return .24;},
 crunch:x=>{for(let i=0;i<5;i++)noise(x,1400+i*220,900,i*.035,.05,.05,1.5);return .22;},
 sizzle:x=>{noise(x,5200,7000,0,.4,.03,.8,'highpass');return .42;},
 hiss:x=>{noise(x,4000,2200,0,.3,.03,.9);return .32;},
 puff:x=>{noise(x,900,400,0,.34,.06,.7,'lowpass');return .36;},
 yawn:x=>{tone(x,420,200,0,.6,.045,'triangle');return .62;},
 giggle:x=>{for(let i=0;i<4;i++)tone(x,620+i*40,760+i*40,i*.08,.07,.04,'triangle');return .34;},
 chime:x=>{[1047,1319,1568,2093].forEach((h,i)=>tone(x,h,h,i*.07,.35,.03,'sine'));return .6;},
 bell:x=>{tone(x,1568,1568,0,.6,.035);tone(x,3920,3920,0,.25,.012);return .62;},
 lowbell:x=>{tone(x,392,392,0,.9,.05);tone(x,784,784,0,.5,.015);return .92;},
 sparkle:x=>{for(let i=0;i<4;i++)tone(x,2640+i*260,2900+i*260,i*.05,.09,.014);return .3;},
 tok:x=>{tone(x,760,620,0,.06,.07,'triangle');noise(x,1200,900,0,.04,.04,3);return .08;},
 roll:x=>{for(let i=0;i<5;i++)tone(x,300-i*12,280-i*12,i*.08,.06,.04,'triangle');return .44;},
 ting:x=>{tone(x,2350,2350,0,.4,.03);return .42;},
 purr:x=>{const o=x.c.createOscillator(),g=x.c.createGain(),lfo=x.c.createOscillator(),lg=x.c.createGain(),t=x.at;o.type='sawtooth';o.frequency.value=70*x.p;lfo.frequency.value=22;lg.gain.value=.025;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035,t+.08);g.gain.linearRampToValueAtTime(0,t+.5);lfo.connect(lg);lg.connect(g.gain);o.connect(g);g.connect(x.out);o.start(t);lfo.start(t);o.stop(t+.52);lfo.stop(t+.52);x.track(o,t+.52);x.track(lfo,t+.52);return .52;},
 rustle:x=>{noise(x,3000,2000,0,.22,.035,.8);noise(x,2400,1800,.12,.16,.03,.8);return .3;},
 flapflap:x=>{noise(x,700,500,0,.08,.06,.9,'lowpass');noise(x,700,500,.14,.08,.06,.9,'lowpass');return .24;},
 whoosh:x=>{noise(x,400,2400,0,.4,.045,.7);return .42;},
 blip:x=>{tone(x,700,1400,0,.07,.04);return .08;},
 knock:x=>{tone(x,320,260,0,.07,.08,'triangle');tone(x,320,260,.12,.07,.06,'triangle');return .2;},
 creak:x=>{tone(x,180,240,0,.3,.025,'sawtooth');return .32;},
 hum:x=>{tone(x,330,392,0,.5,.035,'triangle');return .52;},
 breeze:x=>{noise(x,800,1300,0,.7,.025,.6);return .72;},
 cheer:x=>{tone(x,523,523,0,.12,.04,'triangle');tone(x,659,659,.1,.12,.04,'triangle');tone(x,784,784,.2,.22,.045,'triangle');return .44;},
 fizz:x=>{noise(x,6000,8000,0,.45,.025,.7,'highpass');return .46;},
 bubble:x=>{for(let i=0;i<3;i++)tone(x,500+i*180,900+i*180,i*.09,.06,.035);return .3;},
 // Added for the Coral Cay sweets / bento and Cabinet Heroes toys (Nov 8 2026); nothing above changed.
 clink:x=>{tone(x,2800,2700,0,.12,.03,'triangle');tone(x,3500,3400,.06,.1,.022,'triangle');return .18;},
 tinkle:x=>{[2093,2637,2349,3136,2794].forEach((h,i)=>tone(x,h,h*1.01,i*.045,.16,.014));noise(x,6000,5000,0,.12,.008,1);return .4;},
 stretchy:x=>{tone(x,200,620,0,.34,.05,'triangle');tone(x,640,260,.34,.09,.045,'triangle');return .45;},
 pat:x=>{noise(x,500,300,0,.05,.07,.8,'lowpass');tone(x,190,150,0,.06,.05,'triangle');return .1;},
 flop:x=>{tone(x,230,110,0,.14,.07,'triangle');noise(x,420,220,0,.1,.04,.7,'lowpass');return .16;},
 slurp:x=>{noise(x,700,2400,0,.32,.04,4);tone(x,320,520,.04,.24,.02,'triangle');return .36;},
 hothot:x=>{tone(x,700,1100,0,.09,.04,'square');tone(x,760,1200,.14,.09,.04,'square');return .26;},
 ding:x=>{tone(x,1568,1568,0,.13,.03,'square');tone(x,1568,1568,.16,.2,.03,'square');return .38;},
 crowd:x=>{noise(x,1200,900,0,.55,.05,.5);tone(x,392,440,0,.4,.012,'sawtooth');tone(x,494,523,.05,.35,.01,'sawtooth');return .56;},
 steps:x=>{for(let i=0;i<6;i++)noise(x,700+(i%2)*200,400,i*.065,.04,.06,1,'lowpass');return .42;},
 pok:x=>{tone(x,420,260,0,.07,.08,'triangle');noise(x,1600,900,0,.03,.04,2);return .12;},
 clack:x=>{noise(x,2600,1800,0,.04,.08,5);tone(x,620,420,0,.05,.05,'square');return .08;},
 bong:x=>{tone(x,220,200,0,.5,.07);tone(x,440,410,0,.28,.025,'triangle');return .5;},
 slide:x=>{noise(x,1200,2200,0,.22,.03,2.5);return .24;},
 whirr:x=>{tone(x,140,190,0,.45,.03,'sawtooth');tone(x,280,380,0,.45,.012,'square');return .46;},
 yay:x=>{tone(x,520,880,0,.18,.045,'triangle');tone(x,880,1040,.16,.22,.04,'triangle');return .4;},
};
// Added for the Boots & Kits, Trophies & Legends and Rides & Rollers toys (batch D, Nov 8 2026; every name starts d_); nothing above changed.
Object.assign(VOICES,{
 d_zip:x=>{noise(x,1400,5200,0,.18,.045,2.2);tone(x,600,1400,0,.14,.012,'triangle');return .2;},// a lace being pulled
 d_thump:x=>{tone(x,130,70,0,.16,.09);noise(x,380,180,0,.1,.06,.7,'lowpass');return .18;},
 d_ready:x=>{tone(x,880,880,0,.08,.035,'square');tone(x,1175,1175,.11,.13,.035,'square');return .26;},
 d_ribbit:x=>{tone(x,230,160,0,.07,.05,'sawtooth');tone(x,270,190,.1,.1,.05,'sawtooth');return .22;},
 d_clap:x=>{noise(x,1300,900,0,.05,.09,.9,'lowpass');noise(x,1300,900,.13,.05,.08,.9,'lowpass');return .2;},// two padded glove claps
 d_hup:x=>{noise(x,900,500,0,.05,.03,.8);tone(x,330,494,.02,.14,.05,'triangle');return .18;},
 d_twang:x=>{tone(x,300,190,0,.42,.035,'sawtooth');tone(x,600,380,0,.25,.015,'triangle');return .44;},
 d_flutter:x=>{for(let i=0;i<6;i++)noise(x,900,600,i*.045,.04,.05,.9,'lowpass');return .3;},
 d_hooray:x=>{noise(x,700,1500,0,.5,.045,.6);tone(x,392,523,.05,.4,.025,'triangle');tone(x,494,659,.1,.35,.02,'triangle');return .55;},
 d_whistle:x=>{tone(x,2500,2560,0,.16,.03);tone(x,2950,3000,.19,.22,.03);noise(x,5000,5000,0,.38,.008,1,'highpass');return .42;},// a referee's two-tone toot
 d_fulltime:x=>{tone(x,2700,2720,0,.12,.03);tone(x,2700,2720,.17,.12,.03);tone(x,2700,2650,.34,.45,.032);return .8;},
 d_lala:x=>{[523,587,659].forEach((h,i)=>tone(x,h,h*1.03,i*.16,.14,.04,'triangle'));return .48;},
 d_crackle:x=>{for(let i=0;i<9;i++)noise(x,3200+(i*977)%2400,2600,((i*37)%11)*.03,.015,.05,3);tone(x,440,440,0,.32,.008,'square');return .36;},// an old radio
 d_roar:x=>{noise(x,500,1500,0,.7,.06,.5,'lowpass');noise(x,1200,1800,.2,.45,.03,.7);return .72;},
 d_wheel:x=>{tone(x,95,150,0,.42,.03,'triangle');noise(x,700,500,0,.42,.02,.8,'lowpass');return .44;},
 d_ringring:x=>{for(let i=0;i<6;i++)tone(x,i%2?2350:2200,i%2?2350:2200,i*.04,.06,.025);return .3;},// a bike-bell trill
 d_puttputt:x=>{for(let i=0;i<6;i++)tone(x,95,80,i*.085,.05,.06,'sawtooth');return .52;},
 d_meep:x=>{tone(x,700,660,0,.1,.035,'square');tone(x,820,780,.13,.12,.035,'square');return .27;},
 d_sputter:x=>{[0,.07,.17,.22,.36].forEach((at,i)=>noise(x,900-i*80,500,at,.05,.07,.8,'lowpass'));return .42;},
 d_horn:x=>{tone(x,116,112,0,.28,.06,'sawtooth');tone(x,155,150,.3,.42,.06,'sawtooth');return .74;},// "boo-oop"
 d_lap:x=>{noise(x,500,300,0,.3,.04,.6,'lowpass');noise(x,520,320,.32,.3,.035,.6,'lowpass');return .62;},
 d_foghorn:x=>{tone(x,82,78,0,.85,.05,'sawtooth');tone(x,164,158,0,.8,.02,'triangle');return .86;},
} satisfies Record<string,Preset>);
// Added for the Pixel Pitch, Beach Day and Shell Seekers toys (batch C, Nov 8 2026; every name starts c_); nothing above changed.
Object.assign(VOICES,{
 c_bip:x=>{tone(x,880,880,0,.05,.035,'square');tone(x,1320,1320,.06,.06,.035,'square');return .13;},// an 8-bit bounce
 c_bwip:x=>{tone(x,300,1250,0,.13,.035,'square');return .15;},// a chiptune dive
 c_ta:x=>{tone(x,784,784,0,.07,.035,'square');tone(x,1047,1047,.08,.16,.035,'square');return .26;},// the save "ta"
 c_freeet:x=>{for(let i=0;i<7;i++)tone(x,i%2?2650:2450,i%2?2650:2450,i*.045,.05,.026,'square');return .34;},// a square-wave whistle trill
 c_chatter:x=>{for(let i=0;i<8;i++){noise(x,2600,2200,i*.035,.02,.05,4);tone(x,180,170,i*.035,.02,.025,'square');}return .3;},// a ticket printer
 c_glidehum:x=>{tone(x,200,250,0,.5,.03,'triangle');noise(x,600,900,0,.5,.015,.7,'lowpass');return .52;},
 c_fanfare:x=>{[523,659,784,1047].forEach((h,i)=>tone(x,h,h,i*.07,.08,.032,'square'));tone(x,1319,1319,.3,.3,.035,'square');return .62;},
 c_countup:x=>{for(let i=0;i<8;i++)tone(x,600+i*110,600+i*110,i*.04,.03,.028,'square');return .34;},
 c_bonk:x=>{tone(x,320,170,0,.16,.07);tone(x,640,380,0,.08,.025,'triangle');return .18;},// a hollow beach-ball bonk
 c_shuffle:x=>{for(let i=0;i<3;i++)noise(x,2600,1800,i*.09,.08,.03,.9);return .28;},// sandy steps
 c_pour:x=>{noise(x,1400,600,0,.5,.03,.6,'lowpass');noise(x,3000,2400,0,.4,.01,1);return .52;},// sand trickling
 c_flipflop:x=>{noise(x,900,500,0,.04,.08,.9,'lowpass');tone(x,260,200,0,.04,.05,'triangle');noise(x,700,400,.14,.04,.07,.9,'lowpass');tone(x,200,150,.14,.04,.045,'triangle');return .2;},
 c_swish:x=>{noise(x,500,1800,0,.25,.04,.7);noise(x,1800,700,.22,.3,.03,.7);return .52;},// a wave
 c_woo:x=>{tone(x,380,820,0,.28,.045,'triangle');return .3;},
 c_whistle:x=>{tone(x,2100,2200,0,.22,.022);tone(x,2200,2250,.24,.12,.018);return .38;},// a soft lifeguard whistle
 c_gull:x=>{tone(x,1700,1150,0,.16,.03,'triangle');tone(x,1650,1100,.2,.18,.028,'triangle');return .4;},
 c_squawk:x=>{tone(x,1400,900,0,.2,.04,'sawtooth');noise(x,2200,1600,0,.15,.02,2);return .22;},// "kyaa"
 c_tiptap:x=>{for(let i=0;i<4;i++)tone(x,1500+(i%2)*200,1400,i*.06,.025,.035,'triangle');return .22;},
 c_crack:x=>{noise(x,4200,3600,0,.025,.05,4);noise(x,3800,3000,.05,.02,.035,4);return .08;},
 c_horn:x=>{tone(x,233,240,0,.55,.05,'triangle');noise(x,466,480,0,.5,.02,3);tone(x,233,240,.5,.4,.016,'triangle');return .92;},// "toooo", then its echo
 c_shimmer:x=>{[2637,2794,3136,2794].forEach((h,i)=>{tone(x,h,h,i*.08,.3,.012);tone(x,h*1.005,h*1.005,i*.08,.3,.008);});return .56;},
} satisfies Record<string,Preset>);
// Added for the Bug Squad, Reef Friends and Summit Orchard toys (batch E, Nov 8 2026; every name starts e_); nothing above changed.
Object.assign(VOICES,{
 e_tinybuzz:x=>{tone(x,210,230,0,.22,.022,'sawtooth');tone(x,420,440,0,.22,.01,'square');return .24;},
 e_chirp:x=>{for(let g=0;g<2;g++)for(let i=0;i<3;i++)tone(x,4100,4300,g*.16+i*.03,.022,.022,'square');return .32;},// chirp-chirp
 e_taptap:x=>{for(let i=0;i<6;i++)tone(x,i%2?700:900,i%2?650:850,i*.08,.03,.04,'triangle');return .5;},// six tiny marching steps
 e_wingbuzz:x=>{for(let i=0;i<10;i++)noise(x,320,260,i*.028,.02,.05,1.5);tone(x,150,170,0,.3,.012,'sawtooth');return .32;},
 e_zip:x=>{tone(x,500,2600,0,.12,.035,'triangle');noise(x,2000,5000,0,.1,.012,1.5);return .14;},
 e_twinkle:x=>{[1760,2349,2093].forEach((h,i)=>{tone(x,h,h,i*.11,.32,.02);tone(x,h*2,h*2,i*.11,.12,.006);});return .58;},
 e_gliss:x=>{tone(x,1100,2600,0,.42,.025);tone(x,2200,5200,0,.3,.006);return .44;},// a light rising glissando
 e_bwomm:x=>{tone(x,120,72,0,.5,.07);noise(x,500,200,0,.35,.03,.8,'lowpass');return .52;},// underwater
 e_blipblop:x=>{tone(x,620,980,0,.07,.04);tone(x,520,340,.11,.09,.04);return .22;},
 e_squelch:x=>{noise(x,700,250,0,.2,.05,1.4,'lowpass');tone(x,330,170,0,.2,.04,'triangle');tone(x,260,200,.05,.12,.02);return .24;},
 e_whooshlow:x=>{noise(x,250,800,0,.8,.04,.6,'lowpass');tone(x,90,110,0,.8,.015,'triangle');return .82;},
 e_plipplop:x=>{tone(x,950,700,0,.06,.035);tone(x,620,430,.38,.08,.035);return .48;},// a slow paddle
 e_whalecall:x=>{tone(x,95,270,0,.95,.05);tone(x,190,520,.05,.85,.014,'triangle');return .98;},
 e_spouthiss:x=>{noise(x,2600,5200,0,.5,.035,.7,'highpass');tone(x,300,500,0,.12,.02,'triangle');return .52;},
 e_splorp:x=>{noise(x,1300,300,0,.16,.05,1.1,'lowpass');tone(x,280,140,0,.18,.05,'triangle');return .2;},
 e_seedrattle:x=>{for(let i=0;i<10;i++)noise(x,2400+(i*613)%1400,2000,i*.03+((i*7)%3)*.006,.014,.04,3);return .34;},
 e_tunk:x=>{tone(x,340,300,0,.12,.07,'triangle');tone(x,680,600,0,.06,.02);return .14;},// hollow
 e_spray:x=>{noise(x,4200,6500,0,.32,.035,.8,'highpass');noise(x,1800,1200,0,.1,.02,1.5);return .34;},// a zesty mist
 e_wheee:x=>{tone(x,480,1150,0,.36,.04,'triangle');tone(x,1150,900,.36,.18,.03,'triangle');return .56;},
 e_stones:x=>{[0,.1,.19].forEach((at,i)=>{noise(x,2300-i*250,1600,at,.035,.07,4);tone(x,520-i*60,380-i*40,at,.05,.045,'triangle');});return .26;},
 e_breezewhistle:x=>{noise(x,700,1200,0,.55,.025,.6);tone(x,1400,1750,.05,.42,.018);return .6;},
 e_netswish:x=>{noise(x,2600,800,0,.32,.045,1.1);noise(x,5200,3000,0,.18,.012,1.5,'highpass');return .34;},
 e_postping:x=>{tone(x,3150,3100,0,.32,.03);tone(x,3150,3100,.3,.28,.012);tone(x,3150,3100,.56,.22,.005);return .8;},// a post "ping" and its echo
} satisfies Record<string,Preset>);
// Round 3B kind sounds (Nov 9 2026; every name starts k_): what the toy's MATERIAL and MECHANISM sound like, under its own voice.
Object.assign(VOICES,{
 k_squelch:x=>{noise(x,900,260,0,.22,.05,1.2,'lowpass');tone(x,240,150,0,.2,.035,'triangle');noise(x,2400,1400,.03,.08,.012,2);return .24;},// a soft squeeze
 k_puffback:x=>{tone(x,180,420,0,.16,.04,'triangle');noise(x,700,1400,0,.14,.02,.8,'lowpass');return .18;},// springing back round
 k_dent:x=>{tone(x,330,210,0,.09,.05,'triangle');noise(x,600,300,0,.06,.03,.9,'lowpass');return .1;},
 k_crackle:x=>{for(let i=0;i<5;i++)noise(x,3400+(i*731)%1800,2600,i*.028+((i*5)%3)*.007,.018,.05,3.5);return .18;},// a crisp crust
 k_pop:x=>{noise(x,1800,700,0,.05,.06,2);tone(x,380,900,0,.07,.05);return .09;},// a piece pulled free
 k_snap:x=>{noise(x,4200,3400,0,.018,.09,5);tone(x,1660,1640,.006,.05,.03,'square');tone(x,2490,2480,.03,.12,.018);return .16;},// it clicks into its socket
 k_drop:x=>{tone(x,260,180,0,.06,.05,'triangle');noise(x,900,500,0,.04,.03,1.4,'lowpass');return .08;},
 k_blocked:x=>{tone(x,200,170,0,.12,.045,'triangle');return .13;},
 k_complete:x=>{[784,988,1175,1568,1976].forEach((h,i)=>tone(x,h,h,i*.06,.3,.028));tone(x,3136,3136,.32,.4,.01);return .72;},// whole again
 k_ratchet:x=>{noise(x,3000,2400,0,.012,.07,6);tone(x,1200,900,0,.014,.02,'square');return .03;},
 k_whirr:x=>{tone(x,320,180,0,.8,.022,'sawtooth');tone(x,640,360,0,.8,.008,'triangle');return .82;},
 k_tick:x=>{noise(x,2200,1800,0,.012,.04,4);return .02;},
 k_twist:x=>{tone(x,160,210,0,.18,.022,'sawtooth');noise(x,2600,2200,0,.05,.03,4);return .2;},
 k_reveal:x=>{noise(x,2000,800,0,.06,.06,2);[1047,1319,1568,2093,2637].forEach((h,i)=>tone(x,h,h,.06+i*.05,.32,.026));return .66;},
 k_close:x=>{tone(x,700,520,0,.06,.05,'triangle');noise(x,3000,2400,.05,.02,.06,5);return .1;},
 // Round 3C (Nov 9 2026): working parts, charms, poses.
 k_click:x=>{noise(x,3600,3000,0,.01,.08,6);tone(x,1900,1700,0,.025,.025,'square');return .04;},// a hinge reaching its end stop
 k_clack:x=>{noise(x,1500,700,0,.03,.1,2.5);tone(x,420,260,0,.06,.06,'triangle');noise(x,4200,3600,.012,.012,.05,6);return .08;},// a lid snapping shut
 k_detent:x=>{noise(x,2800,2400,0,.008,.035,6);return .015;},
 k_thunk:x=>{tone(x,190,120,0,.07,.07,'triangle');noise(x,800,400,0,.03,.05,1.6,'lowpass');return .08;},// a plunger bottoming out
 k_spring:x=>{tone(x,300,900,0,.12,.05,'triangle');tone(x,900,700,.11,.16,.03,'triangle');return .28;},// a pop-up springing up
 k_roll:x=>{noise(x,500,300,0,.22,.03,1,'lowpass');return .22;},
 k_tinkle:x=>{[2637,3136,2794].forEach((h,i)=>tone(x,h,h,i*.045,.16,.012));return .26;},// a ball chain's little jingle (rare)
 k_pose:x=>{tone(x,660,660,0,.09,.04,'triangle');tone(x,990,990,.08,.16,.04,'triangle');return .26;},// "ta-da" (pitch per pose)
} satisfies Record<string,Preset>);
export const VOICE_NAMES=Object.keys(VOICES);
/** 'bell:1.5' → ['bell', 1.5]. Unknown presets resolve to null. */
export function parseVoice(ref:string):[string,number]|null{const [n,p]=ref.split(':');if(!VOICES[n])return null;const k=p===undefined?1:Number(p);return [n,Number.isFinite(k)&&k>0?Math.min(3,Math.max(.3,k)):1];}

/** The generic figure's voices, picked from the toy's sound recipe words. */
const WORDS:[RegExp,string][]=[[/bell|ting/,'bell'],[/chime/,'chime'],[/sparkl|tinkl|glitter/,'sparkle'],[/boing|spring/,'boing'],[/bubbl|blub|blip|blop/,'bubble'],[/pop/,'pop'],
 [/hiss|spray/,'hiss'],[/sizzl/,'sizzle'],[/fizz/,'fizz'],[/puff|fwoo|steam|breath/,'puff'],[/whoosh|wind|zip/,'whoosh'],[/rustl|paper/,'rustle'],[/purr/,'purr'],[/click|clack|clink|tok|knock|tunk|ping|pok/,'tok'],
 [/crunch|crisp|krsh|crackl/,'crunch'],[/hum|song|call|sing/,'hum'],[/cheer|ta-da|crowd/,'cheer'],[/roll|drum|patter/,'roll'],[/ding|arcade/,'pip'],[/slurp|gurgl|squelch|splorp|juicy/,'bloop'],[/yawn/,'yawn'],[/bloop|boop|bwomm|plip/,'bloop']];
export function voicesFromText(text:string):{squeeze:string[];poke:string[];tap:string[]}{
 const t=text.toLowerCase(),hits:string[]=[];for(const [re,v] of WORDS)if(re.test(t)&&!hits.includes(v))hits.push(v);
 const a=hits[0]??'bloop',b=hits[1]??'boop';return {squeeze:['squish',a],poke:[b],tap:[a,'sparkle']};
}

/** `action` throttles per action (80 ms): the five touch actions, or `kind:<event>` for the round 3B kind sounds. */
export type ToyVoice={say(action:'squeeze'|'poke'|'tap'|'hold'|'open'|`kind:${string}`,refs:readonly string[]):boolean;unlock():void;active():number;dispose():void};
/**
 * One viewer's voice: a bus on the shared context. `context` is injectable for tests. Returns false (silent) when muted,
 * throttled, over the polyphony cap or disposed.
 */
export function createToyVoice(opts:{context?:()=>AudioContext|null;now?:()=>number}={}):ToyVoice{
 const ctx=opts.context??(()=>isSoundEnabled()?konbiniAudioContext():null),now=opts.now??(()=>performance.now());
 let bus:GainNode|null=null,busCtx:AudioContext|null=null,disposed=false;const sources=new Set<AudioScheduledSourceNode>(),ends:number[]=[],last=new Map<string,number>();
 const MAX=4,GAP=80;
 return {
  unlock(){if(!opts.context&&isSoundEnabled())unlockKonbiniAudio();},
  active(){return sources.size;},
  say(action,refs){
   if(disposed)return false;if(typeof document!=='undefined'&&document.hidden)return false;const c=ctx();if(!c||c.state==='closed')return false;
   // The opening "hello" is not a gesture: on a still-locked context (iOS autoplay) it would queue and burst out on the first tap.
   if(action==='open'&&c.state!=='running')return false;
   const t=now();if(t-(last.get(action)??-1e9)<GAP)return false;
   const sec=c.currentTime;for(let i=ends.length-1;i>=0;i--)if(ends[i]<=sec)ends.splice(i,1);if(ends.length>=MAX)return false;
   last.set(action,t);
   if(!bus||busCtx!==c){bus=c.createGain();busCtx=c;bus.connect(c.destination);}
   bus.gain.value=Math.min(1,getSoundVolume()*2.2);
   let at=0;const x:Ctx={c,out:bus,at:sec+.01,p:1,track:(n,end)=>{sources.add(n);n.onended=()=>{sources.delete(n);};void end;}};
   let len=0;
   try{for(const ref of refs.slice(0,3)){const v=parseVoice(ref);if(!v)continue;x.at=sec+.01+at;x.p=v[1];const d=VOICES[v[0]](x);at+=d*.8;len=at;}}catch{/* no audio */}
   ends.push(sec+len+.2);return true;
  },
  dispose(){disposed=true;for(const n of sources){try{n.onended=null;n.stop();}catch{/* already stopped */}try{n.disconnect();}catch{/* gone */}}sources.clear();ends.length=0;try{bus?.disconnect();}catch{/* gone */}bus=null;},
 };
}

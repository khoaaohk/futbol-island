'use client';
import { useEffect, useRef, useState } from 'react';
import * as T from 'three';
import { Lesson, lessonFrame } from '@/lib/curriculum';
import { Icon } from './Icon';
import { createPlayer, PlayerRig } from '@/lib/graphics/player';
import { graphicsQuality, FrameBudget } from '@/lib/graphics/quality';

type Props = { lesson: Lesson; beat: number; progress: number; overview?: boolean; challenge?: boolean; selected?: string | null; aerial?: boolean; onSelect?: (id: string) => void };
export default function Pitch(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef(props); state.current = props;
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const parent = host.current; if (!parent) return;
    let renderer: T.WebGLRenderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { setFailed(true); return; }
    const quality = graphicsQuality(), budget = new FrameBudget();
    renderer.setPixelRatio(quality.pixelRatio);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
    parent.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', 'Interactive three-dimensional football training island');
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(38, 1, .1, 180);
    const ambient = new T.HemisphereLight('#fff4df', '#597a66', 2.4); scene.add(ambient);
    const sun = new T.DirectionalLight('#fff1d9', 3.2); sun.position.set(-18, 32, 18); sun.castShadow = true;
    sun.shadow.mapSize.set(quality.shadowSize, quality.shadowSize); Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 35, bottom: -30, near: .1, far: 100 }); sun.shadow.normalBias = .025; sun.shadow.bias = -.0002; sun.shadow.radius = 3; scene.add(sun);
    const materials: T.Material[] = [];
    const mat = (color: string, roughness = .9) => { const m = new T.MeshStandardMaterial({ color, roughness, metalness: 0 }); materials.push(m); return m; };
    const grass = mat('#7eaa83'), stripe = mat('#769f7c'), cream = mat('#eee7ce'), sand = mat('#c5b894'), soil = mat('#9eaa88'), teal = mat('#244c43'), clay = mat('#bf8064'), gold = mat('#f2bd60'), leaf = mat('#68876b'), leafLight = mat('#8ca77b'), bark = mat('#92745b'), stone = mat('#aaa88f');
    const world = new T.Group(); scene.add(world);
    const add = (geometry: T.BufferGeometry, material: T.Material, x: number, y: number, z: number, group: T.Group = world) => { const mesh = new T.Mesh(geometry, material); mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh; };
    const box = (w: number, h: number, d: number, material: T.Material, x: number, y: number, z: number, group = world) => add(new T.BoxGeometry(w, h, d), material, x, y, z, group);
    const roundRect = (w: number, h: number, r: number) => { const s = new T.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s; };
    const slab = (w: number, d: number, h: number, y: number, material: T.Material) => { const mesh = add(new T.ExtrudeGeometry(roundRect(w, d, 3), { depth: h, bevelEnabled: true, bevelSize: .25, bevelThickness: .25, bevelSegments: 3, steps: 1 }), material, 0, y, 0); mesh.rotation.x = -Math.PI / 2; return mesh; };
    slab(29, 37, 1.6, -2.2, soil); slab(28.5, 36.5, .25, -.6, sand); slab(27.5, 35.5, .12, -.28, grass);
    // The playing surface is quiet: mown colour bands, painted lines and soft contact shadows.
    for (let i = 0; i < 8; i++) box(16, .018, 3, i % 2 ? grass : stripe, 0, .02, -10.5 + i * 3);
    const stroke = (points: T.Vector3[], color = '#f2f1de', dashed = false) => {
      const geometry = new T.BufferGeometry().setFromPoints(points);
      const material = dashed ? new T.LineDashedMaterial({ color, dashSize: .35, gapSize: .22, transparent: true, opacity: .8 }) : new T.LineBasicMaterial({ color, transparent: true, opacity: .86 }); materials.push(material);
      const line = new T.Line(geometry, material); if (dashed) line.computeLineDistances(); world.add(line); return line;
    };
    const rectangle = (w: number, d: number, z = 0) => stroke([[-w/2,-d/2], [w/2,-d/2], [w/2,d/2], [-w/2,d/2], [-w/2,-d/2]].map(([x, v]) => new T.Vector3(x, .06, v + z)));
    rectangle(16,24); rectangle(8,4.4,-9.8); rectangle(8,4.4,9.8); rectangle(3.9,1.6,-11.2); rectangle(3.9,1.6,11.2);
    stroke([new T.Vector3(-8,.06,0), new T.Vector3(8,.06,0)]);
    stroke(Array.from({length:65}, (_,i)=>new T.Vector3(Math.cos(i/64*Math.PI*2)*2.35,.065,Math.sin(i/64*Math.PI*2)*2.35)));
    const centre = add(new T.CircleGeometry(.11,16), cream,0,.07,0);centre.rotation.x=-Math.PI/2;
    for (const end of [-1,1]) {
      for (const x of [-2,2]) add(new T.CylinderGeometry(.045,.045,1.45,10),cream,x,.75,end*12);
      const bar=add(new T.CylinderGeometry(.045,.045,4,10),cream,0,1.47,end*12);bar.rotation.z=Math.PI/2;
      for(let i=0;i<=16;i++){const x=-2+i*.25;stroke([new T.Vector3(x,.08,end*12.9),new T.Vector3(x,1.43,end*12.9),new T.Vector3(x,1.43,end*12)],'#d8deca');}
      for(let y=.2;y<1.5;y+=.25)stroke([new T.Vector3(-2,y,end*12.9),new T.Vector3(2,y,end*12.9)],'#d8deca');
    }
    // A compact club campus: a pavilion, stepped seats, floodlights and individual trees.
    box(3.5,2.8,6,cream,-11,1.35,-7);box(4.4,.24,6.7,teal,-11,2.9,-7);box(.04,1.55,1.6,teal,-9.22,1.0,-7);
    for(const z of [-9,-5]){box(.06,1.2,1.25,teal,-9.2,1.65,z);box(.4,.1,1.6,clay,-9.05,2.35,z);}
    for(let i=0;i<3;i++){box(1,.25+i*.35,7,cream,10+i*.7,(.25+i*.35)/2,1);for(let seat=0;seat<7;seat++)box(.45,.16,.6,seat%3?teal:clay,10+i*.7,.42+i*.35,-2+seat);}
    const tree = (x:number,z:number,scale:number) => {const group=new T.Group();group.position.set(x,0,z);group.scale.setScalar(scale);world.add(group);add(new T.CylinderGeometry(.12,.2,2,7),bark,0,1,0,group);add(new T.IcosahedronGeometry(1.2,1),leaf,0,2.35,0,group);add(new T.IcosahedronGeometry(.9,1),leafLight,.5,2.9,.12,group);};
    [[-11,8,1],[-11,12,.85],[-7,15,1.1],[11,-11,1],[10,12,.9],[6,15,.75],[-12,-14,.8]].forEach(([x,z,s])=>tree(x,z,s));
    for(const x of [-9,9])for(const z of [-13,13]){add(new T.CylinderGeometry(.05,.08,4,8),teal,x,2,z);box(.65,.18,.32,cream,x,4,z);}
    for(let i=0;i<7;i++){const rock=add(new T.IcosahedronGeometry(.5,0),stone,-12+(i*7%24),-.1,i%2?16:-16);rock.scale.set(1.3,.6,1);}
    // A floating academy badge on the side of the island gives the diorama a crafted edge.
    box(4,.65,.1,teal,0,-.6,18.1);
    const actorGroup = new T.Group();world.add(actorGroup);
    const actors=new Map<string,{root:T.Group;rig:PlayerRig;ring:T.Mesh;tag:T.Sprite}>();
    const textureList:T.Texture[]=[];
    function actor(id:string,side:string,label:string){
      const rig=createPlayer(id,side),root=rig.root;root.userData.playerId=id;actorGroup.add(root);
      const ringMaterial=new T.MeshBasicMaterial({color:'#faf0c6',transparent:true,opacity:.9,side:T.DoubleSide});materials.push(ringMaterial);
      const ring=add(new T.RingGeometry(.45,.49,40),ringMaterial,0,.08,0,root);ring.rotation.x=-Math.PI/2;ring.castShadow=false;
      const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;const context=canvas.getContext('2d')!;context.fillStyle='#183b32';context.beginPath();context.roundRect(34,8,60,44,12);context.fill();context.fillStyle='#fffbeb';context.font='bold 30px sans-serif';context.textAlign='center';context.fillText(id.startsWith('d')?'•':id,64,41);
      const texture=new T.CanvasTexture(canvas);textureList.push(texture);const tagMaterial=new T.SpriteMaterial({map:texture,depthTest:false});materials.push(tagMaterial);const tag=new T.Sprite(tagMaterial);tag.position.set(0,2.05,0);tag.scale.set(1.4,.7,1);root.add(tag);
      root.traverse(object=>{if(object instanceof T.Mesh)object.userData.playerId=id;});
      return {root,rig,ring,tag};
    }
    const ball=add(new T.SphereGeometry(.16,20,14),cream,0,.2,0);const panels=mat('#2c463e');
    for(const vector of [new T.Vector3(1,0,0),new T.Vector3(-1,0,0),new T.Vector3(0,1,0),new T.Vector3(0,-1,0),new T.Vector3(0,0,1),new T.Vector3(0,0,-1)]){const patch=new T.Mesh(new T.CircleGeometry(.068,5),panels);patch.position.copy(vector.clone().multiplyScalar(.159));patch.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),vector);ball.add(patch);}
    const cueMaterial=new T.LineDashedMaterial({color:'#fff1ac',dashSize:.35,gapSize:.22,transparent:true,opacity:.9});materials.push(cueMaterial);
    const cue=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3()]),cueMaterial);world.add(cue);
    const raycaster=new T.Raycaster(),pointer=new T.Vector2();
    const click=(event:PointerEvent)=>{if(!state.current.challenge)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(actorGroup.children.filter(child=>child.visible),true);const id=hits.find(hit=>hit.object.userData.playerId)?.object.userData.playerId;if(id)state.current.onSelect?.(id);};
    renderer.domElement.addEventListener('pointerup',click);
    let disposed=false,frame=0,lastLesson='',elapsed=0,last=performance.now();
    const resize=()=>{const width=parent.clientWidth,height=parent.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};
    const observer=new ResizeObserver(resize);observer.observe(parent);resize();
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animate=(now:number)=>{
      if(disposed)return;frame=requestAnimationFrame(animate);if(document.hidden){last=now;return;}const frameMs=now-last;const nextRatio=budget.sample(frameMs,renderer.getPixelRatio());if(nextRatio!==renderer.getPixelRatio())renderer.setPixelRatio(nextRatio);const dt=Math.min((now-last)/1000,.05);last=now;elapsed+=dt;
      const p=state.current;
      if(lastLesson!==p.lesson.id){for(const a of actors.values())a.root.visible=false;for(const player of p.lesson.players){const key=player.side+':'+player.id;if(!actors.has(key))actors.set(key,actor(player.id,player.side,player.label));actors.get(key)!.root.visible=true;}lastLesson=p.lesson.id;}
      const f=p.challenge?{players:p.lesson.players,ball:p.lesson.players.find(player=>player.id===p.lesson.carrier)!,focus:'',cue:undefined}:lessonFrame(p.lesson,p.beat,p.progress);
      for(const player of f.players){const a=actors.get(player.side+':'+player.id)!;a.rig.update(player.x,player.z,dt,elapsed,reduced);a.ring.visible=player.id===(p.selected||f.focus);a.tag.visible=!p.overview;a.ring.scale.setScalar(reduced?1:1+Math.sin(elapsed*3)*.035);}
      const travel=Math.hypot(f.ball.x-ball.position.x,f.ball.z+.32-ball.position.z);
      if(travel<1&&!reduced)ball.rotation.x+=travel/.16;
      ball.position.set(f.ball.x,.22,f.ball.z+.32);
      cue.visible=Boolean(!p.challenge&&!p.overview&&f.cue);
      if(cue.visible&&f.cue){const a=f.players.find(player=>player.id===f.cue![0])!,b=f.players.find(player=>player.id===f.cue![1])!;const arr=cue.geometry.attributes.position.array as Float32Array;arr.set([a.x,.1,a.z,b.x,.1,b.z]);cue.geometry.attributes.position.needsUpdate=true;cue.computeLineDistances();}
      const portrait=camera.aspect<.9;const destination=p.aerial?new T.Vector3(0,43,.01):p.overview?new T.Vector3(portrait?34:30,portrait?39:31,portrait?42:34):new T.Vector3(portrait?21:18,portrait?34:26,portrait?34:27);
      camera.position.lerp(destination,1-Math.exp(-dt*5));camera.lookAt(0,0,0);if(p.overview&&!reduced)world.rotation.y=Math.sin(elapsed*.12)*.025;else world.rotation.y=0;
      renderer.render(scene,camera);
    };
    camera.position.set(30,31,34);camera.lookAt(0,0,0);frame=requestAnimationFrame(animate);setReady(true);
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();renderer.domElement.removeEventListener('pointerup',click);scene.traverse(object=>{if(object instanceof T.Mesh||object instanceof T.Line)object.geometry.dispose();});for(const texture of textureList)texture.dispose();for(const material of materials)material.dispose();for(const a of actors.values())a.rig.dispose();renderer.dispose();renderer.domElement.remove();};
  },[]);
  return <div className={'pitch-wrap '+(props.overview?'overview-pitch':'')}><div className="pitch-canvas" ref={host} />{!ready&&!failed&&<div className="pitch-loading"><Icon name="ball" size={28}/><span>Getting the pitch ready…</span></div>}{failed&&<div className="pitch-loading"><Icon name="book" size={28}/><span>The 3D view needs WebGL. You can still use the lesson and answer controls.</span></div>}</div>;
}

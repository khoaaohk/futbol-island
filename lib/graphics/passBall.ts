// The one pooled ball for the Pass it emote (user, Oct 22 2026): a white football with dark patches, made once, hidden outside the sequence.
import * as T from 'three';
export interface PassBall {mesh: T.Group; set(x: number, y: number, z: number, age: number): void; hide(): void; dispose(): void}
export function createPassBall(scene: T.Scene): PassBall {
  const mesh = new T.Group(); mesh.name = 'emote-pass-ball'; mesh.visible = false;
  const R = .2, geo = new T.SphereGeometry(R, 14, 10), mat = new T.MeshStandardMaterial({color: 0xffffff, roughness: .55});
  const patchGeo = new T.IcosahedronGeometry(R * 1.015, 0), patchMat = new T.MeshBasicMaterial({color: 0x20242b, wireframe: true});
  const ball = new T.Mesh(geo, mat), patches = new T.Mesh(patchGeo, patchMat); ball.raycast = patches.raycast = () => {};
  mesh.add(ball, patches); scene.add(mesh);
  return {
    mesh,
    set(x, y, z, age) { mesh.visible = true; mesh.position.set(x, y, z); mesh.rotation.x = age * 9; mesh.rotation.z = age * 5; },
    hide() { mesh.visible = false; },
    dispose() { scene.remove(mesh); geo.dispose(); mat.dispose(); patchGeo.dispose(); patchMat.dispose(); },
  };
}

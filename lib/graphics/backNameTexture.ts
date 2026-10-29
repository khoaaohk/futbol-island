import * as T from 'three';
import type {FontId} from '../shop/jersey';
import {paintBackNameCoverage} from '../shop/jerseyPaint';
import {BEAN_NAME_W,BEAN_NAME_H,BEAN_NAME_CAP} from './shirtNumbers';
/**
 * The own player's back name on the in-game bean kit (owner, Oct 29 2026). The bean has no per-player kit texture: its shirt is
 * shaded in the shared body shader, the number from the shared digit atlas. So the name is ONE small coverage texture (R = fill,
 * G = outline, like the digit atlas), painted once when the worn jersey's name or font changes and cached by that key; the bean
 * body shader samples it only on the own player's material (BEAN_NAME define), never per frame and never on batched players.
 */
export const BEAN_NAME_TEX_W=512, BEAN_NAME_TEX_H=120;
let cached:{key:string;texture:T.Texture}|null=null;
/** The cached name texture for `name` in `font` (null for no name or no DOM). Replaces (and disposes) the previous one. */
export function backNameTexture(name:string|null|undefined,font:FontId='classic'):T.Texture|null{
 const text=(name??'').trim();if(!text||typeof document==='undefined')return null;
 const key=font+'|'+text.toUpperCase();if(cached?.key===key)return cached.texture;
 const canvas=document.createElement('canvas');canvas.width=BEAN_NAME_TEX_W;canvas.height=BEAN_NAME_TEX_H;
 const ctx=canvas.getContext('2d');if(!ctx)return null;
 paintBackNameCoverage(ctx,text,font,BEAN_NAME_TEX_W,BEAN_NAME_TEX_H,BEAN_NAME_CAP/BEAN_NAME_H*BEAN_NAME_TEX_H);
 const texture=new T.CanvasTexture(canvas);
 texture.flipY=false;texture.colorSpace=T.NoColorSpace;texture.anisotropy=4;texture.generateMipmaps=true;
 texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;texture.wrapS=texture.wrapT=T.ClampToEdgeWrapping;texture.name='bean-back-name';
 cached?.texture.dispose();cached={key,texture};return texture;
}

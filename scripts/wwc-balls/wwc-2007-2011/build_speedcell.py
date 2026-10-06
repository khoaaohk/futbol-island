"""2011 Speedcell (WWC Germany 2011) exact print -> 6 cube-face decals.
Frame: the GLSL Jabulani frame (triangles at (1,1,1),(1,-1,-1),(-1,1,-1),(-1,-1,1)). The eye+ring motif sits on each triangle,
the lime-edged crescents and grey pinstripes on the hexagons; the print outside the marks is tetrahedral (T). Sources:
'ks' = Commons "Speedcell.jpg" (kandschwar, CC BY-SA 3.0, the WWC 2011 ball), 'col' = Commons "Adidas Speedcell Colombia
2011.jpg" (Futbolero, CC BY-SA 2.5 CO, the same Speedcell graphic with U-20 marks; used for the ring/crescents/hexagons only).
"""
import sys, json, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tools'))
from sphere import *
from tiles import tile_dirs, tile_uv

OUT = sys.argv[1] if len(sys.argv) > 1 else 'out/sc'
N = int(sys.argv[2]) if len(sys.argv) > 2 else 512
os.makedirs(os.path.dirname(OUT) or '.', exist_ok=True)
REF = '../refs/wwc-2011-speedcell/'
SRC = {'ks': REF + 'photo-Speedcell.jpg', 'col': REF + 'photo-Adidas-Speedcell-Colombia-2011.jpg'}
def load(n):
    cx, cy, R, D = json.load(open(f'C_{n}.json')); return Shaded(SRC[n], cx, cy, R, D, np.load(f'M_{n}.npy'))
PH = {k: load(k) for k in SRC}
G = tetra_group()
T0 = nrm(np.array([1., 1, 1]))
TRIS = [nrm(np.array(t, float)) for t in [(1, 1, 1), (1, -1, -1), (-1, 1, -1), (-1, -1, 1)]]
PAPER = np.array([.95, .955, .95])

# ---------------------------------------------------------------- masks (T0 tile: 500 px, half-extent .75, tiles.frame)
EYE = np.load('eye_mask_tile.npy').astype(np.float32)          # fitted 3-fold outline of the eye (Colombia tile)
EYE_D = cv2.erode(EYE, np.ones((13, 13), np.uint8))             # eye proper, inside its black rim
EYE_X = cv2.dilate(EYE, np.ones((15, 15), np.uint8))            # eye + rim margin: the fold skips it
TEXT_BOXES = [(0, 60, 110, 250), (150, 425, 370, 500)]          # crescent texts next to T0 (both photos)
def t0uv(Q):
    X, Y, d = tile_uv(Q, (1, 1, 1), 500, .75); d = np.where((X < 0) | (Y < 0) | (X > 499) | (Y > 499), 0, d); return X, Y, d
def eye_any(P, img):
    """img sampled at the nearest triangle's tile (eye masks for all four triangles)."""
    out = np.zeros(P.shape[:-1]); best = np.full(P.shape[:-1], -2.)
    for g in G:
        Q = P @ g; X, Y, d = t0uv(Q); v = np.where(d > .5, sample(img, X, Y), 0)
        sel = d > best; out[sel] = v[sel]; best[sel] = d[sel]
    return out
def in_text(Q):
    X, Y, d = t0uv(Q); m = np.zeros(Q.shape[:-1], bool)
    for x0, y0, x1, y1 in TEXT_BOXES: m |= (d > .5) & (X >= x0) & (X <= x1) & (Y >= y0) & (Y <= y1 + 60 * (y1 == 500))
    return m
OCCL = {'col': lambda X, Y: (X < 880) & (Y < 690)}            # the FIFA quality cards in front of the Colombia ball

# ---------------------------------------------------------------- fold (most face-on symmetric copy, eyes excluded)
BONUS = {'col': .12, 'ks': 0.}
def fold(P, temp=.025):
    cs = []; ss = []
    for g in G:
        Q = P @ g.T; skip = in_text(Q)
        for n, ph in PH.items():
            c, w = ph.sample_ball(Q)
            if n in OCCL:
                X, Y = ph.project(Q @ ph.M.T); skip2 = skip | OCCL[n](X, Y)
            else: skip2 = skip
            cs.append(c); ss.append(np.where(skip2 | (w < .15), -9., w + BONUS[n]))
    cs = np.array(cs); ss = np.array(ss); smax = ss.max(0); k = np.exp((ss - smax) / temp) * (ss > -5)
    return (cs * k[..., None]).sum(0) / np.maximum(k.sum(0), 1e-9)[..., None], smax

# ---------------------------------------------------------------- marks
from tiles import frame
TS, TH = 500, .75
def tile_img_at(t, img):
    """Lookup function: sample a T0-tile image at the copy of it placed on triangle t (rotated by the T element t <- T0)."""
    t = nrm(np.array(t, float)); g = next(g for g in G if np.allclose(g @ T0, t))
    def f(P):
        X, Y, d = t0uv(P @ g); return np.where(d > .5, sample(img, X, Y), 0)
    return f
# T0 tile from the WWC photo
P0 = tile_dirs(T0, TS, TH); KS0, KSW = PH['ks'].sample_ball(P0); KS0 = KS0.astype(np.float32)
L0 = KS0.mean(-1); paper0 = cv2.GaussianBlur(cv2.dilate(L0, np.ones((9, 9), np.uint8)), (0, 0), 3)
BH = cv2.morphologyEx(L0, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)) - L0                  # thin dark strokes on white (blackhat)
WHITE_GROUND = cv2.morphologyEx(L0, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)) > .72
GLYPH = (np.clip((BH - .12) / .15, 0, 1) * WHITE_GROUND).astype(np.float32)               # dark print on the white skin
def box(img, x0, y0, x1, y1):
    m = np.zeros_like(img); m[y0:y1, x0:x1] = img[y0:y1, x0:x1]; return m
# crescent texts round T0 (FIFA Women's World Cup 2011 / dates) from the WWC photo
TXT = (box(GLYPH, 0, 20, 110, 230) + box(GLYPH, 140, 430, 360, 500)) * (KSW > .3)
# eye 2: SPEEDCELL / OFFICIAL MATCH BALL (the WWC photo's own lettering) and the big adidas Badge of Sport + wordmark
# (redrawn from Commons "Adidas Logo.svg", public domain / trademark); layout measured on the collector photo (reference only)
SPD = box(GLYPH, 285, 115, 385, 255) * (KSW > .3)
LOGO = np.asarray(Image.open('adidas_logo.png'))[..., 3].astype(np.float32) / 255
def place(img_shape, logo, cx, cy, width, ang_cw):
    h = int(logo.shape[0] * width / logo.shape[1]); l = cv2.resize(logo, (int(width), h), interpolation=cv2.INTER_AREA)
    pad = np.zeros(img_shape, np.float32); H, W = img_shape; big = max(l.shape) * 2
    canvas = np.zeros((big, big), np.float32); y0 = big // 2 - l.shape[0] // 2; x0 = big // 2 - l.shape[1] // 2; canvas[y0:y0 + l.shape[0], x0:x0 + l.shape[1]] = l
    R = cv2.getRotationMatrix2D((big / 2, big / 2), -ang_cw, 1); canvas = cv2.warpAffine(canvas, R, (big, big))
    xs, ys = int(cx - big / 2), int(cy - big / 2)
    for yy in range(big):
        Y = ys + yy
        if 0 <= Y < H:
            xa, xb = max(0, xs), min(W, xs + big); pad[Y, xa:xb] = np.maximum(pad[Y, xa:xb], canvas[yy, xa - xs:xb - xs])
    return pad
spd_c = np.array([330., 185.]); d = spd_c - 250; ang = math.degrees(math.atan2(d[0], -d[1]))
EYE2 = np.maximum(SPD, place((TS, TS), LOGO, 250 - .10 * d[0], 250 - .10 * d[1], 135, ang))
E2_TRI = (-1, 1, -1)   # not seen in any CC photo; chosen so that no photo contradicts it (see report)
eye2 = tile_img_at(E2_TRI, EYE2 * EYE_D)
# adidas Badge of Sport on the hexagon beside the blank eye (Commons "Diana Matheson in 2011", CC BY-SA 3.0): centre and
# size measured there, drawn from Commons "Adidas 2022 logo.svg" (bars only)
BADGE = np.asarray(Image.open('badge.png'))[..., 3].astype(np.float32) / 255
HB = nrm(np.load('adi_hex_dir.npy')); _, he1, he2 = frame(HB)
HB_IMG = place((600, 600), BADGE, 300 + .012 * 1200, 300 - .072 * 1200, .30 * 1200, -296)
def hex_badge(P):
    X, Y, d = tile_uv(P, HB, 600, .25); return np.where((d > .8) & (X > 0) & (Y > 0) & (X < 599) & (Y < 599), sample(HB_IMG, X, Y), 0)
INK = np.array([.10, .11, .14])

def colour(P):
    col, s = fold(P)
    e = eye_any(P, EYE_D)
    col = col * (1 - e[..., None]) + PAPER * e[..., None]
    # the T0 eye: the WWC ball itself (kandschwar photo)
    c, w = PH['ks'].sample_ball(P); X, Y, d = t0uv(P)
    a = np.where(d > .5, sample(EYE_D, X, Y), 0) * np.clip((w - .3) / .1, 0, 1)
    col = col * (1 - a[..., None]) + c * a[..., None]
    t = np.where(d > .5, sample(TXT, X, Y), 0); col = col * (1 - t[..., None]) + INK * t[..., None]
    for f in (eye2, hex_badge):
        a = np.clip(f(P), 0, 1); col = col * (1 - a[..., None]) + INK * a[..., None]
    return np.clip(col, 0, 1)

if __name__ == '__main__':
    W = 1200; E = colour(eq_dirs(W, W // 2)); Image.fromarray((E * 255).astype(np.uint8)).save(OUT + '-eq.png')
    if N > 0: print(write_faces(colour, OUT, n=N))

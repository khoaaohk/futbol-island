"""2007 Teamgeist (WWC China 2007) print -> 6 cube-face decals, as a posterised REDRAW (no photo pixels are shipped).
Only one photo of the real ball was found (Flickr 'ykyeco', all rights reserved): it is used for registration, measurement and
tracing into flat inks. The 6 propellers are congruent under the Teamgeist's tetrahedral rotations, and each is 2-fold
symmetric (the 180-degree turn about its face normal is in T), so the print is traced ONCE in propeller coordinates
(u along the propeller, v across, as tg_prop in 2006-teamgeist.ts): every visible propeller in the photo votes into one
canonical map (most face-on sample wins), which is posterised to the ball's inks and mapped back onto all six. The
+TEAMGEIST roundel is traced separately and placed on its own lobe.
"""
import sys, json, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tools'))
from sphere import *
from tg import nearest, TGN, TGA

OUT = sys.argv[1] if len(sys.argv) > 1 else 'out/tg'
N = int(sys.argv[2]) if len(sys.argv) > 2 else 512
cx, cy, R, D = json.load(open('C_tg.json'))
PH = Shaded('ref/tg07_fl1.jpg', cx, cy, R, D, np.load('M_tg.npy'))
EXCL = [(330, 430, 480, 540)]   # the roundel (one-off)
# the watermark and the signature: inpaint their dark strokes out of the photo first (ball print under them is plain white)
_im = (np.clip(PH.img, 0, 1) * 255).astype(np.uint8); _m = np.zeros(_im.shape[:2], np.uint8)
for x0, y0, x1, y1 in [(335, 222, 625, 250), (355, 250, 640, 415)]:
    sub = _im[y0:y1, x0:x1].astype(int); dark = (sub.max(-1) < 110) & ((sub.max(-1) - sub.min(-1)) < 60); _m[y0:y1, x0:x1] = dark
_m = cv2.dilate(_m, np.ones((5, 5), np.uint8)); PH.img = cv2.inpaint(_im, _m, 5, cv2.INPAINT_TELEA).astype(np.float32) / 255
Image.fromarray(cv2.inpaint(_im, _m, 5, cv2.INPAINT_TELEA)).save(OUT + '-clean.png')
LOGO = (338, 436, 470, 536)
US, VS, RES = 1.3, .8, .0015
CW, CH = int(2 * US / RES), int(2 * VS / RES)

# ---------------------------------------------------------------- canonical propeller map from the photo (gather)
G = tetra_group()
uu = -US + (np.arange(CW) + .5) * RES; vv = VS - (np.arange(CH) + .5) * RES; UU, VV = np.meshgrid(uu, vv)
n0, a0 = TGN[0], TGA[0]; b0 = np.cross(n0, a0)
P0 = (np.cos(VV) * np.cos(UU))[..., None] * n0 + (np.cos(VV) * np.sin(UU))[..., None] * a0 + np.sin(VV)[..., None] * b0
d0, pid0, _, _ = nearest(P0); own = pid0 == 0          # canonical pixels that belong to propeller 0's region
cs = []; ss = []
for g in G:
    Q = P0 @ g.T; C = Q @ PH.M.T; X, Y = PH.project(C); c, w = PH.sample_ball(Q)
    bad = np.zeros(X.shape, bool)
    for x0, y0, x1, y1 in EXCL: bad |= (X >= x0 - 4) & (X <= x1 + 4) & (Y >= y0 - 4) & (Y <= y1 + 4)
    cs.append(c); ss.append(np.where(bad | (w < .3), -9., w))
cs = np.array(cs); ss = np.array(ss); smax = ss.max(0); k = np.exp((ss - smax) / .015) * (ss > -5)
canon = (cs * k[..., None]).sum(0) / np.maximum(k.sum(0), 1e-9)[..., None]
best = np.where(smax > -5, 1., -1.)
print('canonical coverage', (best > 0).mean(), 'min facing used', smax[smax > -5].min())
# fill holes by nearest filled (inpaint)
hole = (best < 0).astype(np.uint8)
c8 = (np.clip(canon, 0, 1) * 255).astype(np.uint8); c8 = cv2.inpaint(c8, hole, 3, cv2.INPAINT_TELEA)
canon = c8.astype(np.float32) / 255
Image.fromarray(c8).save(OUT + '-canon-raw.png')

# ---------------------------------------------------------------- inks
INKS = np.array([(.94, .94, .92), (.74, .73, .70), (.82, .20, .12), (.13, .08, .47), (.08, .07, .10)])  # white, silver, red, blue, black
def classify(c):
    L = c.mean(-1, keepdims=True); ch = c - L
    F = np.concatenate([L, ch * 2.2], -1); PL = INKS.mean(-1, keepdims=True); PF = np.concatenate([PL, (INKS - PL) * 2.2], -1)
    return ((F[..., None, :] - PF) ** 2).sum(-1).argmin(-1)
cb = cv2.GaussianBlur(canon, (0, 0), .5); r_, g_, b_ = cb[..., 0], cb[..., 1], cb[..., 2]; L = cb.mean(-1)
blue = (b_ - r_ > .12) & (b_ > g_ + .05)
red = (r_ - b_ > .18) & (r_ - g_ > .15)
# silver keylines: thin strokes darker than the local paper (blackhat), not blue/red
bh = cv2.morphologyEx(L.astype(np.float32), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)) - L
silver = (bh > .07) & ~blue & ~red
lab = np.zeros(L.shape, int); lab[silver] = 1; lab[red] = 2; lab[blue] = 3
onehot = np.stack([cv2.GaussianBlur((lab == k).astype(np.float32), (0, 0), .9) for k in range(4)], -1) if False else np.stack([cv2.GaussianBlur((lab == k).astype(np.float32), (0, 0), .6) for k in range(4)], -1); lab = onehot.argmax(-1)
# the valve (a physical hole on one panel, copied by the fold): fill small non-blue islands inside the blue
nb = (lab != 3).astype(np.uint8); n_, cc, st_, _ = cv2.connectedComponentsWithStats(nb, 4)
for i in range(1, n_):
    if st_[i, 4] < 2600 and st_[i, 0] > 0 and st_[i, 1] > 0 and st_[i, 0] + st_[i, 2] < CW and st_[i, 1] + st_[i, 3] < CH:
        ring = cv2.dilate((cc == i).astype(np.uint8), np.ones((5, 5), np.uint8)) & ~(cc == i)
        if (lab[ring > 0] == 3).mean() > .8: lab[cc == i] = 3
# straight grey lines in the white = the physical triangle seams (drawn by the shader's groove, not print): drop them
sm = (lab == 1).astype(np.uint8); n_, cc, st_, _ = cv2.connectedComponentsWithStats(sm, 8); dropped = 0
for i in range(1, n_):
    ys_, xs_ = np.nonzero(cc == i)
    if len(xs_) < 40: continue
    X_ = np.stack([xs_, ys_], 1).astype(float); X_ -= X_.mean(0); ev = np.linalg.eigvalsh(X_.T @ X_ / len(X_))
    if ev[1] > 330 and ev[0] / ev[1] < .004: lab[cc == i] = 0; dropped += 1
# remaining isolated grey strokes away from the stripes are seams / shading, not print
near = cv2.dilate(((lab == 2) | (lab == 3)).astype(np.uint8), np.ones((51, 51), np.uint8)) > 0
sm = (lab == 1).astype(np.uint8); n_, cc, st_, _ = cv2.connectedComponentsWithStats(sm, 8)
for i in range(1, n_):
    if not near[cc == i].mean() > .5: lab[cc == i] = 0; dropped += 1
print('seam lines dropped', dropped)
CANON = INKS[lab].astype(np.float32)
Image.fromarray((CANON * 255).astype(np.uint8)).save(OUT + '-canon.png')

# ---------------------------------------------------------------- roundel (traced, posterised to blue/white/red)
LP = None
def roundel(P):
    C = P @ PH.M.T; X, Y = PH.project(C); f = PH.facing(C)
    x0, y0, x1, y1 = LOGO; m = (X >= x0) & (X <= x1) & (Y >= y0) & (Y <= y1) & (f > .2)
    c = sample(PH.img, X, Y); c = Shaded.sample_ball(PH, P)[0]
    return m, INKS[classify(c)]

def colour(P):
    d, pid, U, V = nearest(P)
    X = (U + US) / RES - .5; Y = (VS - V) / RES - .5
    col = sample(CANON, X, Y)
    # the straight triangle-triangle seams photographed as grey lines: not print
    a = np.abs(P); plane = np.arcsin(np.minimum(a[..., 0], np.minimum(a[..., 1], a[..., 2])))
    sil = np.abs(col - INKS[1]).sum(-1) < .35
    col[sil & (plane < .02) & (d > 0)] = INKS[0]
    m, rc = roundel(P); col[m] = rc[m]
    return col

if __name__ == '__main__':
    W2 = 1200; E = colour(eq_dirs(W2, W2 // 2)); Image.fromarray((np.clip(E, 0, 1) * 255).astype(np.uint8)).save(OUT + '-eq.png')
    if N > 0: print(write_faces(colour, OUT, n=N))

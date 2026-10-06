"""Conext15 (WWC 2015) and Conext15 Final Vancouver print -> 6 cube-face decals (Oct 6 2026).
Frame: the GLSL ball frame of BZ_CORE (panels on the cube faces, 3-panel corners at the cube corners). Photo poses: Mg_<name>.npy
+ C_<name>g.json (junction-anchored, refined jointly). Print symmetry measured on the photos: D4 (4-fold about z, 2-fold about
x/y), not the full octahedral group. Inks: white, black, red, green, blue (k-means per photo), mosaic of the most face-on
symmetric copy; marks drawn separately (adidas from the Commons SVG, the conext15 text cut from the CC photo, the WWC emblem
from the enwiki SVG)."""
import sys, json
sys.path.insert(0, 'tools')
from tiles import *

BALL = sys.argv[1] if len(sys.argv) > 1 else 'c15'      # c15 | final
OUT = sys.argv[2] if len(sys.argv) > 2 else 'out/c15'
N = int(sys.argv[3]) if len(sys.argv) > 3 else 512
os.makedirs(os.path.dirname(OUT) or '.', exist_ok=True)
R_ = 'refs/wwc-2015-conext15/photo-BALON-DEL-CAMPEONATO-'
SRC = {'a3': R_ + '16397047065.jpg', 'a1': R_ + '15774583044.jpg', 'fh1': 'ro/fh1.jpg', 'eq1': 'ro/eq1.jpg'}
CC = {'a3', 'a1'}
def loadp(n, p, shaded=True):
    cx, cy, R, D = json.load(open(f'C_{n}g.json')); return (Shaded if shaded else Photo)(p, cx, cy, R, D, np.load(f'Mg_{n}.npy'))
PH = {k: loadp(k, v) for k, v in SRC.items()}
G = np.load('D4.npy'); GO = octa_group()
BONUS = [.35 if np.allclose(g, np.eye(3)) else (.15 if any(np.allclose(g, h) for h in G) else 0.) for g in GO]

# ---------------------------------------------------------------- marks (ball-frame positions from the photos)
def bdir(n, px): ph = PH[n]; return nrm(ph.M.T @ ph.cam_dir(*px))
def tile_from(n, c, half, size=400, ref=None):
    ref = PH[n].M.T @ np.array([0, 1., 0]) if ref is None else ref
    P = tile_dirs(c, size, half, ref); col, w = PH[n].sample_ball(P); return col.astype(np.float32), w
MARKS = {}
# adidas Badge of Sport + wordmark: SVG fitted to the CC photo a1 (dark ink on white)
def fit_svg(n, centre_px, half, svg_png, ink_dark=True, scales=np.arange(1.2, 1.9, .03), rots=range(0, 360, 4)):
    c = bdir(n, centre_px); col, w = tile_from(n, c, half); L = col.mean(-1)
    paper = cv2.GaussianBlur(cv2.dilate(L, np.ones((31, 31), np.uint8)), (0, 0), 5); ink = np.clip((paper - L) / .35, 0, 1) * (w > .2)
    rgba = np.asarray(Image.open(svg_png).convert('RGBA')).astype(np.float32) / 255; svg = rgba[..., 3]; dark = rgba[..., 3] * (1 - rgba[..., :3].mean(-1) * .9)
    ys, xs = np.nonzero(svg > .5); svg = svg[ys.min():ys.max() + 1, xs.min():xs.max() + 1]; rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]; dark = dark[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    best = None
    for sc in scales:
        wpx = int(400 * sc * .5); hpx = int(wpx * svg.shape[0] / svg.shape[1]); s = cv2.resize(dark, (wpx, hpx), interpolation=cv2.INTER_AREA)
        for r in rots:
            canvas = np.zeros((400, 400), np.float32); y0 = 200 - hpx // 2; x0 = 200 - wpx // 2
            if y0 < 0 or x0 < 0: continue
            canvas[y0:y0 + hpx, x0:x0 + wpx] = s; A = cv2.getRotationMatrix2D((200, 200), r, 1); cv = cv2.warpAffine(canvas, A, (400, 400))
            # allow a shift: correlate
            res = cv2.matchTemplate(ink, cv[100:300, 50:350] if False else cv, cv2.TM_CCORR_NORMED) if False else None
            F1 = np.fft.rfft2(ink); F2 = np.fft.rfft2(cv); cc = np.fft.irfft2(F1 * np.conj(F2), s=ink.shape)
            iy, ix = np.unravel_index(np.argmax(cc), cc.shape); val = cc[iy, ix] / (np.sqrt((cv ** 2).sum() * (ink ** 2).sum()) + 1e-6)
            if best is None or val > best[0]: best = (val, sc, r, ix, iy, cv)
    val, sc, r, ix, iy, cv = best
    ix = ix - 400 if ix > 200 else ix; iy = iy - 400 if iy > 200 else iy; A = np.float32([[1, 0, ix], [0, 1, iy]])
    wpx = int(400 * sc * .5); hpx = int(wpx * rgba.shape[0] / rgba.shape[1]); s4 = cv2.resize(rgba, (wpx, hpx), interpolation=cv2.INTER_AREA)
    can = np.zeros((400, 400, 4), np.float32); y0 = 200 - hpx // 2; x0 = 200 - wpx // 2; can[y0:y0 + hpx, x0:x0 + wpx] = s4
    can = cv2.warpAffine(cv2.warpAffine(can, cv2.getRotationMatrix2D((200, 200), r, 1), (400, 400)), A, (400, 400), borderMode=cv2.BORDER_CONSTANT)
    print('  svg fit', svg_png, 'score', round(float(val), 3), 'scale', round(float(sc), 2), 'rot', r, 'shift', ix, iy)
    placed = can[..., 3]
    Image.fromarray((np.concatenate([ink, placed], 1) * 255).astype(np.uint8)).save(f'dbg_fit_{os.path.basename(svg_png)}.png')
    return dict(c=c, half=half, ref=PH[n].M.T @ np.array([0, 1., 0]), a=placed, rgb=np.clip(can[..., :3] / np.maximum(can[..., 3:], 1e-3), 0, 1))
MARKS['adidas'] = dict(fit_svg('a1', (940, 495), .26, 'adidas_logo.png'), ink=np.array([.07, .07, .08])); MARKS['adidas'].pop('rgb')
def cut_badge(n, centre_px, half, size=600):
    c = bdir(n, centre_px); col, w = tile_from(n, c, half, size); L = col.mean(-1)
    paper = cv2.GaussianBlur(cv2.dilate(L, np.ones((41, 41), np.uint8)), (0, 0), 6); a = np.clip((.42 - L) / .14, 0, 1) * (w > .2)
    m = (a > .5).astype(np.uint8); n_, lab, st, cen = cv2.connectedComponentsWithStats(m, 8); keep = np.zeros(n_, bool)
    for i in range(1, n_): keep[i] = st[i, 4] > 8 and np.hypot(*(cen[i] - size / 2)) < size * .42
    a = a * cv2.dilate(keep[lab].astype(np.uint8), np.ones((3, 3), np.uint8))
    Image.fromarray((a * 255).astype(np.uint8)).save(f'dbg_badge_{n}.png'); return dict(c=c, half=half, ref=PH[n].M.T @ np.array([0, 1., 0]), a=a.astype(np.float32), size=size)
# The ball carries the adidas mark twice (a1: adidas + text, a3: adidas + FIFA badge across the band; both register onto the same
# place because the swoosh print is symmetric). Copy B is placed by the 180-degree turn about the print's 4-fold (y) axis.
RB = GO[11]  # the D4 turn that hides copy B from all three other views (fh1, eq1, a1 show no second adidas/badge)
def turned(d): e = dict(d); e['c'] = RB @ d['c']; e['ref'] = RB @ d['ref']; return e
MARKS['adidas2'] = turned(MARKS['adidas'])
BADGE_A3 = cut_badge('a3', (950, 775), .11); MARKS['badge'] = turned(dict(BADGE_A3, ink=np.array([.07, .07, .08])))
def place_svg(n, centre_px, height_px, svg_png, size=400):
    """Upright (photo camera up) SVG of the measured on-photo height, centred on the measured point; pixels are our render of the SVG."""
    ph = PH[n]; c = bdir(n, centre_px); h = math.acos(np.clip(ph.cam_dir(centre_px[0], centre_px[1] - height_px / 2) @ ph.cam_dir(centre_px[0], centre_px[1] + height_px / 2), -1, 1))
    half = h * .75; rgba = np.asarray(Image.open(svg_png).convert('RGBA')).astype(np.float32) / 255
    ys, xs = np.nonzero(rgba[..., 3] > .5); rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    hp = int(size * h / (2 * half)); wp = int(hp * rgba.shape[1] / rgba.shape[0]); s4 = cv2.resize(rgba, (wp, hp), interpolation=cv2.INTER_AREA)
    can = np.zeros((size, size, 4), np.float32); y0 = size // 2 - hp // 2; x0 = size // 2 - wp // 2; can[y0:y0 + hp, x0:x0 + wp] = s4
    print('  placed', svg_png, 'height rad', round(h, 3))
    return dict(c=c, half=half, ref=ph.M.T @ np.array([0, 1., 0]), a=can[..., 3], rgb=np.clip(can[..., :3] / np.maximum(can[..., 3:], 1e-3), 0, 1), size=size)
EMBLEM = place_svg('eq1', (441, 258), 68, 'wwc15_emblem.png')
# conext15 official match ball: glyphs cut from the CC photo a1 (black text on white)
def cut_text(n, centre_px, half, size=1000, strip=((175, 668), (950, 280)), sw=42, ref_half=.27):
    """Text glyphs cut from the CC photo: dark ink below the local paper, inside a strip measured on the ref_half tile."""
    c = bdir(n, centre_px); col, w = tile_from(n, c, half, size); L = col.mean(-1); sat = col.max(-1) - col.min(-1)
    paper = cv2.GaussianBlur(cv2.dilate(L, np.ones((25, 25), np.uint8)), (0, 0), 4)
    a = np.clip((paper - L - .2) / .14, 0, 1) * (paper > .7) * (w > .2)
    k = ref_half / half; p0 = 500 + (np.array(strip[0]) - 500) * k; p1 = 500 + (np.array(strip[1]) - 500) * k
    yy, xx = np.mgrid[0:size, 0:size].astype(float); t = p1 - p0; Lt = np.linalg.norm(t); t /= Lt
    rx, ry = xx - p0[0], yy - p0[1]; along = rx * t[0] + ry * t[1]; across = -rx * t[1] + ry * t[0]
    a = a * (np.abs(across) < sw * k) * (along > -20) * (along < Lt + 10)
    m = (a > .5).astype(np.uint8); n_, lab, st, _ = cv2.connectedComponentsWithStats(m, 8); keep = np.zeros(n_, bool)
    for i in range(1, n_): keep[i] = st[i, 4] > 12
    a = a * cv2.dilate(keep[lab].astype(np.uint8), np.ones((2, 2), np.uint8))
    Image.fromarray((a * 255).astype(np.uint8)).save(f'dbg_text_{n}.png')
    return dict(c=c, half=half, ref=PH[n].M.T @ np.array([0, 1., 0]), a=a.astype(np.float32), size=size)
MARKS['text'] = dict(cut_text('a1', (1200, 600), .27), ink=np.array([.1, .1, .11]))

def mark_layer(P, marks):
    alpha = np.zeros(P.shape[:-1]); col = np.zeros(P.shape[:-1] + (3,))
    for nm, d in marks.items():
        near = P @ d['c'] > math.cos(d['half'] * 1.5)
        if not near.any(): continue
        S_ = d.get('size', 400); X, Y, _ = tile_uv(P[near], d['c'], S_, d['half'], d['ref']); a = sample(d['a'], X, Y)
        a = np.where((X < 0) | (Y < 0) | (X > S_ - 1) | (Y > S_ - 1), 0, a)
        aa = alpha[near]; cc = col[near]; sel = a > aa
        if 'rgb' in d:
            rgb = sample(d['rgb'], X, Y); cc[sel] = rgb[sel] ** 2.2 if False else rgb[sel]
        else: cc[sel] = d['ink']
        aa[sel] = a[sel]; alpha[near] = aa; col[near] = cc
    return alpha, col

# ---------------------------------------------------------------- unique regions the ink vote skips (logos, badge, emblem)
UNIQUE = [(MARKS['adidas']['c'], .26), (MARKS['adidas2']['c'], .26), (BADGE_A3['c'], .13), (MARKS['text']['c'], .13), (MARKS['badge']['c'], .13), (EMBLEM['c'], .14)]
def unique_mask(Q):
    m = np.zeros(Q.shape[:-1], bool)
    for c, r in UNIQUE: m |= Q @ c > math.cos(r)
    return m

# ---------------------------------------------------------------- inks
NAMES = ['white', 'black', 'red', 'green', 'blue']
INIT = np.array([[.92, 0, 0], [.12, 0, 0], [.45, .35, -.1], [.45, -.12, .2], [.45, -.2, -.1]])
def class_maps(ph, n):
    img = np.nan_to_num(deshaded_image(ph), nan=.5); A = (np.clip(img, 0, 1) * 255).astype(np.uint8); k = max(3, int(ph.R / 220) | 1)
    c = cv2.medianBlur(A, k).astype(np.float32) / 255
    H, W = c.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]; r = np.hypot(xx - ph.cx, yy - ph.cy) / ph.R
    L = c.mean(-1); sat = c.max(-1) - c.min(-1)
    paper = c[(r < .8) & (L > np.percentile(L[r < .8], 80)) & (sat < .12)]
    c = c * (np.array([.92, .92, .93]) / (np.median(paper, 0) if len(paper) > 50 else np.array([.92, .92, .93]))); c = np.nan_to_num(c, nan=.5); L = c.mean(-1)
    sat = c.max(-1) - c.min(-1); sg = lambda x, a, b: np.clip((x - a) / (b - a), 0, 1)
    pK = sg(.36 - L, 0, .1) * (1 - sg(sat, .14, .26))
    chroma = sg(sat, .12, .22) * (1 - pK)
    r_, g_, b_ = c[..., 0], c[..., 1], c[..., 2]
    hr = sg(r_ - np.maximum(g_, b_), 0, .12); hg = sg(g_ - np.maximum(r_, b_), 0, .08); hb = sg(b_ - np.maximum(r_, g_), 0, .1)
    hs = hr + hg + hb + 1e-6
    pR, pG, pB = chroma * hr / hs, chroma * hg / hs, chroma * hb / hs
    pW = np.clip(1 - pK - pR - pG - pB, 0, 1)
    p = np.stack([pW, pK, pR, pG, pB], -1)
    print('  class fractions', n, np.round(p[(r < .85)].mean(0), 3))
    # colour level (for gradients inside the colour classes): luminance
    return np.concatenate([p, L[..., None]], -1).astype(np.float32), c
CM = {}; WB = {}
for n in SRC: CM[n], WB[n] = class_maps(PH[n], n)
SW = {'a3': .1, 'a1': .1, 'fh1': .05, 'eq1': 0.}
def vote(P, temp=.03):
    vs = []; ss = []
    for g, bonus in zip(GO, BONUS):
        Q = P @ g.T; um = unique_mask(Q)
        for n in SRC:
            ph = PH[n]; C = Q @ ph.M.T; X, Y = ph.project(C); f = ph.facing(C)
            H, W = ph.img.shape[:2]; ok = (f > .25) & (X >= 0) & (Y >= 0) & (X < W - 1) & (Y < H - 1) & ~um
            vs.append(sample(CM[n], X, Y)); ss.append(np.where(ok & (f > .45 if bonus == 0 else True), f + SW[n] + bonus, -9.))
    ss = np.array(ss); smax = ss.max(0); k = np.exp((ss - smax) / temp) * (ss > -5)
    acc = (np.array(vs) * k[..., None]).sum(0) / np.maximum(k.sum(0), 1e-9)[..., None]
    # The two 4-fold poles (where the four bands cross) are seen by no photo: the bands run black into them on every view.
    hole = (smax < -5) | (np.abs(P[..., 1]) > .965); acc[hole] = np.array([0, 1, 0, 0, 0, .1], np.float32)
    return acc, smax

# palette: measured on the studio images (white-balanced medians per class), dark/light ends for the colour gradients
PAL = {'c15': dict(white=(.93, .93, .935), black=(.07, .07, .09), red=((.55, .05, .12), (.93, .2, .3)),
                   green=((.03, .35, .18), (.2, .72, .38)), blue=((.12, .14, .5), (.25, .55, .9))),
       'final': dict(white=(.93, .93, .935), black=(.07, .07, .09), red=((.55, .04, .07), (.9, .13, .16)),
                     green=((.55, .42, .14), (.88, .74, .38)), blue=((.55, .42, .14), (.88, .74, .38)))}
def ink_colour(v, pal):
    p = v[..., :5] ** 3; p /= np.maximum(p.sum(-1, keepdims=True), 1e-9); L = np.clip((v[..., 5] - .2) / .6, 0, 1)[..., None]
    col = p[..., 0:1] * np.array(pal['white']) + p[..., 1:2] * np.array(pal['black'])
    for i, nm in ((2, 'red'), (3, 'green'), (4, 'blue')):
        lo, hi = np.array(pal[nm][0]), np.array(pal[nm][1]); col += p[..., i:i + 1] * (lo * (1 - L) + hi * L)
    return col

def colour_c15(P):
    v, s = vote(P); col = ink_colour(v, PAL['c15'])
    la, lc = mark_layer(P, dict(MARKS, emblem=EMBLEM)); col = col * (1 - la[..., None]) + lc * la[..., None]
    return np.clip(col, 0, 1)

# ---------------------------------------------------------------- Final Vancouver: same layout (fv1 registers onto the
# Conext15 mosaic), streak hues traced from the adidas launch image (reference only) into two inks: Canada red and gold.
FV = None
def fv_setup():
    global FV
    cx, cy, R, D = json.load(open('C_fv1g.json')); F = Photo('ro/fv1.jpg', cx, cy, R, D, np.load('Mg_fv1.npy'))
    c = cv2.medianBlur((F.img * 255).astype(np.uint8), 3).astype(np.float32) / 255
    r_, g_, b_ = c[..., 0], c[..., 1], c[..., 2]; sat = c.max(-1) - c.min(-1)
    red = np.clip((r_ - g_ - .25) / .15, 0, 1) * (g_ < .35)
    gold = np.clip((g_ - b_ - .12) / .1, 0, 1) * np.clip((r_ - .45) / .15, 0, 1) * (1 - red)
    FV = dict(F=F, m=np.stack([red, gold], -1).astype(np.float32))
    yy, xx = np.mgrid[0:c.shape[0], 0:c.shape[1]]; inb = np.hypot(xx - cx, yy - cy) < R * .9
    FV['red'] = np.median(c[inb & (red > .9)], 0); FV['gold'] = np.median(c[inb & (gold > .9)], 0)
    print('  final inks red', np.round(FV['red'] * 255), 'gold', np.round(FV['gold'] * 255))
def fv_hue(P):
    F = FV['F']; best = np.full(P.shape[:-1], -9.); hue = np.full(P.shape[:-1], -1.)
    for g, bonus in zip(GO, BONUS):
        Q = P @ g.T; C = Q @ F.M.T; X, Y = F.project(C); f = F.facing(C); H, W = F.img.shape[:2]
        ok = (f > .3) & (X >= 0) & (Y >= 0) & (X < W - 1) & (Y < H - 1)
        m = sample(FV['m'], X, Y); tot = m.sum(-1); sc = np.where(ok & (tot > .5), f + bonus, -9.)
        sel = sc > best; best[sel] = sc[sel]; hue[sel] = (m[..., 1] / np.maximum(tot, 1e-6))[sel]
    return hue
def fv_text(size=800, box=(306, 468, 390, 479.5)):
    """'conext15 final vancouver / official match ball' traced from the adidas launch image fv1 (reference only) into one flat
    ink: text tile unwrapped from the registered image, adaptive threshold (dark below the local paper), only blobs in the
    measured text box kept."""
    F = FV['F']; cxy = ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2); c = nrm(F.M.T @ F.cam_dir(*cxy)); ref = F.M.T @ np.array([0, 1., 0])
    half = .45; P = tile_dirs(c, size, half, ref); col, w = F.sample_ball(P); L = cv2.GaussianBlur(col.mean(-1).astype(np.float32), (0, 0), 2.5)
    paper = cv2.GaussianBlur(cv2.dilate(L, np.ones((31, 31), np.uint8)), (0, 0), 5)
    a = np.clip((paper - L - .16) / .08, 0, 1) * (w > .2)
    C = P @ F.M.T; X, Y = F.project(C); inbox = (X >= box[0]) & (X <= box[2]) & (Y >= box[1]) & (Y <= box[3])
    a = a * inbox
    m = (a > .5).astype(np.uint8); n_, lab, st, _ = cv2.connectedComponentsWithStats(m, 8); keep = np.zeros(n_, bool)
    for i in range(1, n_): keep[i] = st[i, 4] > 15
    a = a * cv2.dilate(keep[lab].astype(np.uint8), np.ones((3, 3), np.uint8)); a = np.clip((cv2.GaussianBlur(a, (0, 0), 1.5) - .35) / .3, 0, 1)
    # Hybrid for legibility (the launch image's text is ~4 px tall): 'conext15' and 'official match ball' are the sharp CC
    # glyphs (ANDES photo, same words, same typeface), fitted into the boxes they occupy on the final ball; only
    # 'final vancouver' stays as traced from the reference image.
    def tile_px(px, py): q = nrm(F.M.T @ F.cam_dir(px, py)); X_, Y_, _ = tile_uv(q[None], c, size, half, ref); return float(X_[0]), float(Y_[0])
    def word_masks():
        t = MARKS['text']; A = (t['a'] > .5).astype(np.uint8); ys, xs = np.nonzero(A); pts = np.stack([xs, ys], 1).astype(np.float32)
        vx, vy, x0, y0 = cv2.fitLine(pts, cv2.DIST_L2, 0, .01, .01).ravel(); ang = math.degrees(math.atan2(vy, vx))
        R_ = cv2.getRotationMatrix2D((float(x0), float(y0)), ang, 1); Ar = cv2.warpAffine(t['a'], R_, A.shape[::-1])
        if Ar[: int(y0)].sum() < Ar[int(y0):].sum() * 0: pass
        cols = (Ar > .5).sum(0); xs_ = np.nonzero(cols)[0]
        # split at the widest gap between ink columns (between 'conext15' and 'official')
        gaps = [(xs_[i + 1] - xs_[i], i) for i in range(len(xs_) - 1)]; g, i = max(gaps)
        rows = np.nonzero((Ar > .5).sum(1))[0]; y0_, y1_ = rows.min(), rows.max() + 1
        w1 = Ar[y0_:y1_, xs_[0]:xs_[i] + 1]; w2 = Ar[y0_:y1_, xs_[i + 1]:xs_[-1] + 1]
        return w1, w2
    w1, w2 = word_masks()
    # orientation check: the CC tile may be upside down relative to the fv tile; 'conext15' is the longer-first word in reading order
    def put(mask, p0, p1, height_px):
        (xa, ya), (xb, yb) = tile_px(*p0), tile_px(*p1); L_ = math.hypot(xb - xa, yb - ya); ang = math.degrees(math.atan2(yb - ya, xb - xa))
        h = L_ * mask.shape[0] / mask.shape[1]; m = cv2.resize(mask, (max(1, int(L_)), max(1, int(h))), interpolation=cv2.INTER_AREA)
        can = np.zeros((size, size), np.float32); cx_, cy_ = (xa + xb) / 2, (ya + yb) / 2
        Mx = cv2.getRotationMatrix2D((m.shape[1] / 2, m.shape[0] / 2), -ang, 1); Mx[0, 2] += cx_ - m.shape[1] / 2; Mx[1, 2] += cy_ - m.shape[0] / 2
        return cv2.warpAffine(m, Mx, (size, size))
    # photo boxes on fv1 (baseline-centre end points, measured on the 8x grid): line 1 'conext15' 307..339 at y 472,
    # 'final vancouver' 341..389; line 2 'official match ball' 307..333 at y 477.5
    keep_fv = np.zeros_like(a); x1_, y1_ = tile_px(339.6, 472); xs_fv = np.arange(size)[None, :].repeat(size, 0)
    (xl, yl), (xr, yr) = tile_px(307, 472), tile_px(389, 472); d = np.array([xr - xl, yr - yl]); d /= np.linalg.norm(d)
    yy_, xx_ = np.mgrid[0:size, 0:size]; along = (xx_ - x1_) * d[0] + (yy_ - y1_) * d[1]; across = -(xx_ - x1_) * d[1] + (yy_ - y1_) * d[0]
    line1 = np.abs(across) < np.hypot(*(np.array(tile_px(340, 469.5)) - np.array(tile_px(340, 475))))
    fv_part = a * line1 * (along > 0)
    flip = 1
    if np.mean(w1) < 0: flip = -1
    c1 = put(w1, (307, 472), (338.5, 472), 0); c2 = put(w2, (307, 477.5), (333, 477.5), 0)
    a = np.maximum(fv_part, np.maximum(c1, c2))
    Image.fromarray((a * 255).astype(np.uint8)).save('dbg_fvtext.png')
    return dict(c=c, half=half, ref=ref, a=a.astype(np.float32), size=size, ink=np.array([.1, .1, .11]))
def colour_final(P):
    v, s = vote(P); p = v[..., :5] ** 3; p /= np.maximum(p.sum(-1, keepdims=True), 1e-9)
    hue = fv_hue(P)
    fallback = (p[..., 4] + .5 * p[..., 2]) / np.maximum(p[..., 2] + p[..., 3] + p[..., 4], 1e-6)  # blue->gold, green->red
    hue = np.where(hue < 0, fallback, hue)[..., None]
    L = np.clip((v[..., 5] - .2) / .6, 0, 1)[..., None]
    redc = FV['red'] * (.75 + .35 * L); goldc = FV['gold'] * (.8 + .3 * L)
    pc = (p[..., 2] + p[..., 3] + p[..., 4])[..., None]
    col = p[..., 0:1] * np.array(PAL['c15']['white']) + p[..., 1:2] * np.array(PAL['c15']['black']) + pc * (redc * (1 - hue) + goldc * hue)
    la, lc = mark_layer(P, dict(MARKS, emblem=EMBLEM, text=FTEXT)); col = col * (1 - la[..., None]) + lc * la[..., None]
    return np.clip(col, 0, 1)

if __name__ == '__main__':
    if BALL == 'final':
        fv_setup(); FTEXT = fv_text()
        files = write_faces(colour_final, OUT, n=N); print(files)
        W = 1200; Image.fromarray((colour_final(eq_dirs(W, W // 2)) * 255).astype(np.uint8)).save(OUT + '-eq.png')
    if BALL == 'c15':
        files = write_faces(colour_c15, OUT, n=N); print(files)
        W = 1200; Image.fromarray((colour_c15(eq_dirs(W, W // 2)) * 255).astype(np.uint8)).save(OUT + '-eq.png')

"""Oceaunz (WWC 2023) exact print -> 6 cube-face decals.
Frame: the GLSL ball frame (triangles at cube corners, kites at edge midpoints). Pose of every photo: M_<name>.npy/C_<name>.json.
Structure found from the photos: the swirl is tetrahedral (T, 12 rotations); the logo cluster round +z repeats round -z by the
180-degree turn about y (C2_y); the 8 triangles each carry a different pattern."""
import sys, json
sys.path.insert(0, 'tools')
from tiles import *

OUT = sys.argv[1] if len(sys.argv) > 1 else 'out/wwc-2023-oceaunz'
N = int(sys.argv[2]) if len(sys.argv) > 2 else 512
os.makedirs(os.path.dirname(OUT), exist_ok=True)
SRC = {'st': 'refs/wwc-2023-oceaunz/photo-2023-07-07-Fussball-Frauen-Landerspiel-Deutschland-Sambia-1DX-6938-by-Stepro-cropped.jpg',
       'p912': 'refs/ref-only/oceaunz/ht9011_9112459.png', 'p844': 'refs/ref-only/oceaunz/ht9011_8441688.png',
       'n14': 'refs/wwc-2023-oceaunz/photo-National-Football-Museum-displays-14.jpg'}
PH = {k: load(k, v) for k, v in SRC.items()}
G = np.load('oz_G.npy')
C2Y = np.diag([-1., 1, -1])
TRIS = [(a, b, c) for a in (1, -1) for b in (1, -1) for c in (1, -1)]
# triangle pattern sources (photo names, best first); colour from the studio photo where there is one
TRI_SRC = {(1, 1, 1): ['st', 'p912'], (-1, 1, 1): ['st', 'p912'], (1, -1, 1): ['p912', 'st'], (-1, -1, 1): ['p912'],
           (1, 1, -1): ['n14', 'p844'], (-1, 1, -1): ['n14', 'p844'], (1, -1, -1): ['p844'], (-1, -1, -1): ['p844']}
TN, TH = 360, .40  # triangle tile resolution / half-extent (gnomonic)

def best_sample(names, P, power=4, minw=.12):
    acc = np.zeros(P.shape[:-1] + (3,)); wsum = np.zeros(P.shape[:-1])
    for n in names:
        c, w = PH[n].sample_ball(P); w = np.where(w > minw, w, 0) ** power
        acc += c * w[..., None]; wsum += w
    return acc / np.maximum(wsum, 1e-9)[..., None], wsum > 0

# ---------------------------------------------------------------- triangles: posterised 2-ink tiles
from patterns import lattice, complete, motif_fill, refine_lattice, hatch, fit_hatch, zigzag, fit_zigzag
ORBIT_A = [(1, 1, 1), (1, -1, -1), (-1, 1, -1), (-1, -1, 1)]  # T-orbit of (1,1,1); the other four are orbit B
def g_to(t, base_t):
    for g in G:
        if np.allclose(g @ nrm(np.array(base_t, float)), nrm(np.array(t, float))): return g
def raw_tile(t, name):
    P = tile_dirs(t, TN, TH); c, w = PH[name].sample_ball(P); return P, c.astype(np.float32), w
def ink_of(c, w, mode='blue'):
    """Ink alpha. 'blue': blueness above the local paper; 'dark': darkness below the local paper (navy line art)."""
    c = cv2.GaussianBlur(c, (0, 0), .6); L = c.mean(-1); bl = c[..., 2] - (c[..., 0] + c[..., 1]) / 2
    vis = w > .12
    if vis.sum() < 200: return np.zeros_like(L), vis
    if mode == 'dark':
        paper = cv2.GaussianBlur(cv2.dilate(L, np.ones((11, 11), np.uint8)), (0, 0), 4); d = paper - L
        d98 = np.percentile(d[vis & (bl > np.percentile(bl[vis], 30))], 98)
        return np.clip((d - .35 * d98) / (.3 * d98 + 1e-3), 0, 1) * (bl > np.percentile(bl[vis], 40)) * vis, vis
    paper = cv2.GaussianBlur(cv2.erode(bl, np.ones((9, 9), np.uint8)), (0, 0), 4); d = bl - paper
    sat = c.max(-1) - c.min(-1)
    d99 = np.percentile(d[vis], 99.5)
    return np.clip((d - .3 * d99) / (.3 * d99 + 1e-3), 0, 1) * (L > .12) * vis * (sat > .05), vis
def kmeans_ink(c, vis, hull, t0=.38, t1=.24):
    """Two-ink split (paper / blue ink) of the pixels inside the patch, soft alpha by feature distance."""
    c = cv2.GaussianBlur(c, (0, 0), .5); L = c.mean(-1); bl = c[..., 2] - (c[..., 0] + c[..., 1]) / 2
    F = np.stack([L, bl * 1.5], -1); m = vis & (hull > 0)
    if m.sum() < 100: return np.zeros_like(L)
    X = F[m]; p = np.percentile(X[:, 0], 92); q = np.percentile(X[:, 0], 8)
    cp = X[X[:, 0] >= p].mean(0); ci = X[X[:, 0] <= q].mean(0)
    for _ in range(12):
        dp = np.linalg.norm(X - cp, axis=1); di = np.linalg.norm(X - ci, axis=1); lab = di < dp
        if lab.sum() > 10: ci = X[lab].mean(0)
        if (~lab).sum() > 10: cp = X[~lab].mean(0)
    dp = np.linalg.norm(F - cp, axis=-1); di = np.linalg.norm(F - ci, axis=-1)
    a = dp / (dp + di + 1e-6); a = np.clip((a - t0) / t1, 0, 1)
    return a * vis
def hull_of(ink):
    m = (ink > .5).astype(np.uint8); yy, xx = np.mgrid[0:TN, 0:TN]; m[np.hypot(xx - TN / 2, yy - TN / 2) > .75 * TN / 2] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    n_, lab, st_, _ = cv2.connectedComponentsWithStats(m, 8); keep = np.zeros_like(m)
    big = max(range(1, n_), key=lambda i: st_[i, 4]) if n_ > 1 else None
    if big: keep[lab == big] = 1  # the outline is the largest connected ink stroke
    h = np.zeros_like(m); pts = cv2.findNonZero(keep)
    if pts is not None: cv2.fillConvexPoly(h, cv2.convexHull(pts), 1)
    return h
_, c0, w0 = raw_tile((1, 1, 1), 'st'); TEMPLATE = hull_of(ink_of(c0, w0)[0]).astype(np.float32)
def fit_hull(ink, vis):
    """Rotate/scale the R outline about the tile centre to sit on this triangle's visible outline stroke."""
    best = (-1, 0, 1); cxy = (TN / 2 - .5, TN / 2 - .5)
    for sc in np.arange(.88, 1.13, .02):
        for th in range(0, 360, 2):
            A = cv2.getRotationMatrix2D(cxy, th, sc); h = cv2.warpAffine(TEMPLATE, A, (TN, TN)) > .5
            ring = h & ~cv2.erode(h.astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool)
            v = ring & vis
            if v.sum() < 200: continue
            sc_ = ink[v].mean() - .5 * ink[h & ~ring & vis].mean()
            if sc_ > best[0]: best = (sc_, th, sc)
    A = cv2.getRotationMatrix2D(cxy, best[1], best[2]); return (cv2.warpAffine(TEMPLATE, A, (TN, TN)) > .5).astype(np.uint8), best
ring_w = 7  # outline width in tile px (measured on R: ~0.016 rad)
TRI_SRC = {(1, 1, 1): 'st', (-1, 1, 1): 'st', (1, -1, 1): 'p912', (-1, -1, 1): 'p912',
           (1, 1, -1): 'n14', (-1, 1, -1): 'n14', (1, -1, -1): 'p844', (-1, -1, -1): 'p844'}
LATTICE = {(1, -1, 1): ((21, -8), (12, 6))}  # zigzag: measured on the p912 tile autocorrelation (peaks .57/.52)
HULL_FIX = {(-1, 1, -1): (63, 1.12)}
THR = {(-1, -1, 1): (.22, .2)}
MINW = {(1, -1, 1): .3, (-1, -1, 1): .1}
PERIODIC = {(1, -1, 1), (-1, -1, 1)}   # zigzag and cross-hatch: unseen parts completed from their own lattice
SYNTH_RING = {(1, -1, 1), (-1, -1, 1)}
def tri_tile(t):
    name = TRI_SRC[t]; P, c, w = raw_tile(t, name); ink, vis = ink_of(c, w, 'dark' if t == (-1, 1, -1) else 'blue')
    if t in HULL_FIX:
        th, sc = HULL_FIX[t]; A = cv2.getRotationMatrix2D((TN / 2 - .5, TN / 2 - .5), th, sc); hull = (cv2.warpAffine(TEMPLATE, A, (TN, TN)) > .5).astype(np.uint8)
    else:
        hull, fitp = fit_hull(ink, vis & (w > .2)); print('  hull fit', t, np.round(fitp, 3))
    minw = MINW.get(t, .15)
    ink = kmeans_ink(c, vis & (w > minw), hull, *THR.get(t, (.38, .24))); vis = vis & (w > minw)
    if t == (1, -1, 1):
        Lz = cv2.GaussianBlur(c, (0, 0), .6).mean(-1); bz = c[..., 2] - c[..., 0]
        ink = np.clip((.78 - Lz) / .2, 0, 1) * (bz > .15) * vis
    inner = cv2.erode(hull, np.ones((2 * ring_w + 5, 2 * ring_w + 5), np.uint8)).astype(bool)
    ring = (hull.astype(bool) & ~cv2.erode(hull, np.ones((2 * ring_w, 2 * ring_w), np.uint8)).astype(bool))
    pat = ink * inner; vis_in = vis & (w > .2)
    if t in PERIODIC:
        Lr = 1 - cv2.GaussianBlur(c, (0, 0), .6).mean(-1); v1, v2 = LATTICE[t] if t in LATTICE else lattice(Lr, (w > .3) & inner, 40); v1, v2 = np.array(v1, float), np.array(v2, float); print('  lattice', t, v1, v2)
        v1, v2, sc = refine_lattice(pat, vis_in & (w > .25) & inner, v1, v2); print('  refined lattice', t, np.round(v1, 2), np.round(v2, 2), round(sc, 4))
        if t == (1, -1, 1):
            m_ = vis_in & (w > .25) & inner
            m_ = vis_in & (w > .35) & inner
            def zsc(p):
                z = zigzag(ink.shape, *p); v = ink[m_] - ink[m_].mean(); return (z[m_] * v).mean() / (z[m_].std() + 1e-6)
            best = None
            for ang in (96, 100, 104):
              for sp in (18, 19, 20):
                for per in (20, 24, 28):
                  for amp in (8, 10, 12):
                    for a_ in np.linspace(0, 1, 10, endpoint=False):
                      for b_ in np.linspace(0, 1, 6, endpoint=False):
                        q = np.array([ang, sp, per, amp, a_, b_, .5]); v = zsc(q)
                        if best is None or v > best[0]: best = (v, q)
            pz, scz = best[1], best[0]; print('  zigzag fit', np.round(pz, 3), round(scz, 3))
            pat = zigzag(pat.shape, *pz) * inner
        elif t == (-1, -1, 1):
            m_ = vis_in & (w > .2) & inner; sc_, p1, p2 = fit_hatch(pat, m_, v1, v2, 2.2); print('  hatch fit', round(sc_, 4), p1, p2)
            pat = hatch(pat.shape, v1, v2, 2.2, p1, p2) * inner
        else:
          pat, cell = motif_fill(pat, vis_in & (w > .25), inner, v1, v2); frac = (pat[vis_in & (w > .3) & inner] > .5).mean(); thr = np.quantile(cell, 1 - frac); print('  ink fraction', round(frac, 3)); pat = np.clip((pat - thr) / (.15 * cell.std() + 1e-3) + .5, 0, 1)
          Image.fromarray((cell / max(cell.max(), 1e-6) * 255).astype(np.uint8)).resize((192, 192), 0).save('dbg_cell_%d%d%d.png' % tuple(int(v > 0) for v in t))
    full = np.maximum(pat, ring.astype(float)) if t in SYNTH_RING else np.maximum(pat, ink * hull)
    # ink colour: studio photo where it shows the triangle, else the orbit's colour
    cols = []
    for n in ('p912', 'p844'):
        _, cc, cw = raw_tile(t, n); ik, _ = ink_of(cc, cw); sel = (ik > .85) & (cw > .35) & (hull > 0)
        if sel.sum() > 300:
            wsel = (hull > 0) & (ik < .05) & (cw > .35); wh = np.median(cc[wsel], 0) if wsel.sum() > 100 else np.array([.95, .95, .94])
            cols.append(np.clip(np.median(cc[sel], 0) * np.array([.95, .95, .94]) / wh, 0, 1))
    inkc = cols[0] if cols else None
    return dict(t=t, ink=full * hull, hull=hull, inkc=inkc, src=name, vis=vis)
TRI = {t: tri_tile(t) for t in TRIS}
for orb in (ORBIT_A, [t for t in TRIS if t not in ORBIT_A]):
    known = [TRI[t]['inkc'] for t in orb if TRI[t]['inkc'] is not None]; avg = np.mean(known, 0)
    for t in orb:
        if TRI[t]['inkc'] is None: TRI[t]['inkc'] = avg
for t, d in TRI.items(): print('triangle', t, d['src'], np.round(d['inkc'] * 255))
for t, d in TRI.items():
    Image.fromarray((np.clip(1 - d['ink'][..., None] * (1 - d['inkc']), 0, 1) * 255).astype(np.uint8)).save('dbg_ink_%d%d%d.png' % tuple(int(v > 0) for v in t))

def tri_lookup(P):
    """(inside-patch mask, ink alpha, ink colour) for directions P."""
    k = np.argmax(P @ np.array(TRIS, float).T, -1)
    inside = np.zeros(P.shape[:-1], bool); alpha = np.zeros(P.shape[:-1]); col = np.zeros(P.shape[:-1] + (3,))
    for i, t in enumerate(TRIS):
        m = k == i
        if not m.any(): continue
        X, Y, d = tile_uv(P[m], t, TN, TH)
        h = sample(TRI[t]['hull'].astype(np.float32), X, Y) > .5
        a = sample(TRI[t]['ink'].astype(np.float32), X, Y)
        inside[m] = h; alpha[m] = a * h; col[m] = TRI[t]['inkc']
    return inside, alpha, col

# ---------------------------------------------------------------- marks
st = PH['st']
BOX = {'emblem': (588, 440, 712, 668)}
def in_box(P, name):
    C = P @ st.M.T; X, Y = st.project(C); x0, y0, x1, y1 = BOX[name]
    return (X >= x0) & (X <= x1) & (Y >= y0) & (Y <= y1) & (st.facing(C) > .1)
def ball_dir(name, px): ph = PH[name]; return ph.M.T @ ph.cam_dir(*px)
# marks traced by mk_marks.py: OFFICIAL MATCH BALL and OCEAUNZ PRO glyphs (traced from the studio photo into one ink),
# adidas Badge of Sport = the Commons SVG (Adidas_2022_logo.svg, PD-shape) fitted to the Stepro photo
MT = {}
for nm, c0, half, a in np.load('marks_text.npy', allow_pickle=True):
    MT[nm] = dict(c=np.array(c0, float), half=float(half), a=np.asarray(a, np.float32), ink=np.array((.66, .68, .70) if nm == 'omb' else (.58, .6, .63)))
c0, half, a = np.load('mark_adidas.npy', allow_pickle=True)
MT['adidas'] = dict(c=np.array(c0, float), half=float(half), a=np.asarray(a, np.float32), ink=np.array((.11, .12, .14)))

def logo_layer(P):
    """alpha, colour of the printed marks at P (the +z cluster and its C2_y copy round -z)."""
    alpha = np.zeros(P.shape[:-1]); col = np.zeros(P.shape[:-1] + (3,))
    for Q in (P, P @ C2Y.T):
        c, w = st.sample_ball(Q)
        m = in_box(Q, 'emblem'); alpha[m] = 1; col[m] = c[m]
        for nm, d in MT.items():
            near = Q @ d['c'] > math.cos(d['half'] * 1.6)
            if not near.any(): continue
            X, Y, _ = tile_uv(Q[near], d['c'], 400, d['half']); a = sample(d['a'], X, Y)
            a = np.where((X < 0) | (Y < 0) | (X > 399) | (Y > 399), 0, a)
            cur = alpha[near]; sel = a > cur; idx = np.nonzero(near)
            aa = alpha[near]; cc = col[near]; aa[sel] = a[sel]; cc[sel] = d['ink']; alpha[near] = aa; col[near] = cc
    return alpha, col

EMB_C = nrm(ball_dir('st', (650, 554)))
DIL = {nm: cv2.dilate(d['a'], np.ones((45, 45), np.uint8)) for nm, d in MT.items()}
def unique_mask(Q):
    """Ball-frame regions that hold one-off print (triangle patches, emblem, marks, and their -z copies)."""
    inside, _, _ = tri_lookup(Q); m = inside.copy()
    for Qq in (Q, Q @ C2Y.T):
        m |= Qq @ EMB_C > math.cos(.27)
        for nm, d in MT.items():
            near = Qq @ d['c'] > math.cos(d['half'] * 1.42)
            if near.any():
                X, Y, _ = tile_uv(Qq[near], d['c'], 400, d['half']); a = sample(DIL[nm], X, Y)
                a = np.where((X < 0) | (Y < 0) | (X > 399) | (Y > 399), 0, a); mm = m[near]; mm |= a > .1; m[near] = mm
    return m

# ---------------------------------------------------------------- swirl: ink vote over the 12 symmetric copies, then redrawn
SWIRL_SRC = ['p912', 'p844', 'st']
SWIRL_W = {'p912': .1, 'p844': .1, 'st': 0.}
BLUE_LUT = None
INKS = np.array([[241, 243, 238], [39, 45, 56], [61, 197, 239], [144, 215, 239], [201, 224, 230], [211, 238, 160]], float) / 255
INK_NAMES = ['white', 'navy-black', 'cyan', 'light blue', 'pale blue', 'lime']  # measured on the studio photo (colours only)
def class_maps(ph):
    """Per-photo ink memberships: the photo is levelled (its paper and its black mapped to the measured inks), glitter
    is median-filtered out, and each pixel is softly assigned to the nearest ink."""
    A = deshaded_image(ph); k = 3  # small median: glitter out, thin lime keylines kept
    c = cv2.medianBlur((np.clip(A, 0, 1) * 255).astype(np.uint8), k).astype(np.float32) / 255
    H, W = c.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]; r = np.hypot(xx - ph.cx, yy - ph.cy) / ph.R; on = r < .85
    L = c.mean(-1); sat = c.max(-1) - c.min(-1)
    wh = np.median(c[on & (L > np.percentile(L[on], 80)) & (sat < .1)], 0); bk = np.median(c[on & (L < np.percentile(L[on], 6))], 0)
    c = INKS[1] + (c - bk) / np.maximum(wh - bk, .05) * (INKS[0] - INKS[1])
    d = ((c[..., None, :] - INKS) ** 2).sum(-1)
    # dark grey (glitter-lit black) belongs to black
    d[..., 1] = np.minimum(d[..., 1], ((c - np.array([76, 80, 90]) / 255) ** 2).sum(-1))
    e = np.exp(-(d - d.min(-1, keepdims=True)) / .003); p = e / e.sum(-1, keepdims=True)
    return p.astype(np.float32)
CM = {n: class_maps(PH[n]) for n in SWIRL_SRC}
# occluders: the plinth under the Stepro ball, the retail sticker on the studio ball
BAD = {'st': lambda X, Y: Y > 950, 'p844': lambda X, Y: (X > 1080) & (X < 1420) & (Y > 1560), 'p912': lambda X, Y: Y > 1800}
def vote(P, temp=.02):
    """Mosaic, not average: each point takes the symmetric copy seen most face-on (soft-max over copies and photos),
    because the residual misregistration between copies (2-4 deg) would smear the thin lime and blue strokes."""
    vs = []; ss = []
    for gi, g in enumerate(G):
        Q = P @ g.T; um = unique_mask(Q) if gi else np.zeros(P.shape[:-1], bool)  # the photo's own view keeps its marks (overdrawn later)
        for n in SWIRL_SRC:
            ph = PH[n]; C = Q @ ph.M.T; X, Y = ph.project(C); f = ph.facing(C)
            H, W = ph.img.shape[:2]; ok = (f > .3) & (X >= 0) & (Y >= 0) & (X < W - 1) & (Y < H - 1) & ~um & ~BAD.get(n, lambda X, Y: X < -1e9)(X, Y)
            vs.append(sample(CM[n], X, Y)); ss.append(np.where(ok, f + SWIRL_W[n] + (.3 if gi == 0 else 0.), -9.))
    ss = np.array(ss); smax = ss.max(0); k = np.exp((ss - smax) / temp) * (ss > -5)
    acc = (np.array(vs) * k[..., None]).sum(0) / np.maximum(k.sum(0), 1e-9)[..., None]
    return acc, smax
PAL = dict(white=np.array([.93, .93, .935]), black=np.array([.13, .15, .19]), lime=np.array([.83, .93, .63]),
           blue0=np.array([.75, .87, .95]), blue1=np.array([.24, .76, .93]))
def swirl(P):
    v, ws = vote(P)
    if P.ndim == 3:  # a face / map grid: smooth the memberships so edges are clean curves, not pixel noise
        v = np.stack([cv2.GaussianBlur(v[..., k].astype(np.float32), (0, 0), 2.4) for k in range(v.shape[-1])], -1)
    pw, pk, pc, pl, pp, pg = [v[..., k] for k in range(6)]
    # the sky-blue gradient: a continuous ramp white -> pale -> light -> cyan, from the ink memberships
    t = (pp * 1 + pl * 2 + pc * 3) / np.maximum(pw + pp + pl + pc, 1e-6) / 3
    ramp = np.array([INKS[0], INKS[4], INKS[3], INKS[2]]); x = np.clip(t * 3, 0, 2.999); i0 = np.floor(x).astype(int); fr = (x - i0)[..., None]
    col = ramp[i0] * (1 - fr) + ramp[i0 + 1] * fr
    kb = np.clip((pk - .42) / .16, 0, 1)[..., None]; col = col * (1 - kb) + INKS[1] * kb
    kl = np.clip((pg - .22) / .14, 0, 1)[..., None]; col = col * (1 - kl) + INKS[5] * kl
    col[ws < -5] = INKS[0]
    p = v
    # glitter on the black: small specks from a fixed 3D hash (white-grey with a few lime ones), as on the ball
    # glitter: single-texel specks (about 0.003 rad, like the real flakes), white-grey with some lime, on the black only
    rng = np.random.default_rng(int(abs(P.sum()) * 1000) % (2 ** 32)); r = rng.random(P.shape[:-1])
    speck = (r < .07).astype(float) * .85; lime = (r < .012)[..., None]
    sc = np.where(lime, INKS[5], np.array([.80, .82, .84]))
    kb = np.clip((pk - .42) / .16, 0, 1)
    col = col * (1 - (speck * kb)[..., None]) + sc * (speck * kb)[..., None]
    return col, ws

def colour(P):
    col, w = swirl(P)
    inside, a, ic = tri_lookup(P)
    col[inside] = INKS[0]
    col = col * (1 - a[..., None]) + ic * a[..., None]
    la, lc = logo_layer(P)
    col = col * (1 - la[..., None]) + lc * la[..., None]
    return np.clip(col, 0, 1)

if __name__ == '__main__':
    files = write_faces(colour, OUT, n=N)
    print(files)
    W = 1600; E = colour(eq_dirs(W, W // 2)); Image.fromarray((E * 255).astype(np.uint8)).save(OUT + '-eq.png')

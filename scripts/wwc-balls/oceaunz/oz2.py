"""Oceaunz + Oceaunz Final Pro, v2 (Oct 6 2026). One print layout, two colourways.
usage: python3 oz2.py <outdir> [N]   -> <outdir>/oz-1..6.png, ozf-1..6.png, oz-eq.png, ozf-eq.png
- Swirl: direct mosaic of 7 registered photos (4 of the Oceaunz, 3 of the Final; same layout verified by registration), each
  photo's marks inpainted away first; the point takes the photo that sees it most face-on; where no photo sees it (about 5%
  of the sphere) the tetrahedral copy (12 identical kites) fills in.
- Triangles: per-triangle patterns from build_oceaunz.py, inside the rounded-triangle outline measured on the Stepro photo,
  placed by the ball's own symmetry (same outline on all 8).
- Marks: emblem (black box cut from the Stepro photo, posterised black/white), adidas (Commons SVG), OFFICIAL MATCH BALL,
  OCEAUNZ PRO / FINAL OCEAUNZ PRO (traced), each round +z and copied round -z by the half turn about y."""
import sys
OUTD = sys.argv[1] if len(sys.argv) > 1 else 'out/v2'; NN = int(sys.argv[2]) if len(sys.argv) > 2 else 512
sys.argv = ['x', 'out/_tmp', '16']
src = open('build_oceaunz.py').read().split('# ---------------------------------------------------------------- swirl')[0]
src = src.replace("def tri_tile(t):", '''def sym_hull(t):
    """The measured rounded-triangle outline (Stepro, triangle (1,1,1)), 3-fold symmetrised, carried to triangle t by the print's
    own symmetry: a T rotation for (1,1,1)'s orbit; for the other orbit an octahedral turn plus 66 deg about t (measured: the
    tapa, zigzag, dots and checker outlines all fit best at 66-69 deg, IoU .78-.96)."""
    O = octa_group(); Tn = nrm(np.array(t, float))
    if t in ORBIT_A: R = [g for g in G if np.allclose(g @ nrm(np.ones(3)), Tn)][0]; ang = 0.
    else: R = [g for g in O if np.allclose(g @ nrm(np.ones(3)), Tn)][0]; ang = math.radians(66)
    P = tile_dirs(t, TN, TH) @ rot(Tn, ang).T; acc = 0
    for k in range(3):
        Q = (P @ R) @ rot(np.ones(3), 2 * math.pi / 3 * k).T
        X, Y, _ = tile_uv(Q, (1, 1, 1), TN, TH); acc = acc + sample(TEMPLATE, X, Y)
    return (acc / 3 > .5).astype(np.uint8)
def tri_tile(t):''')
src = src.replace("""    if t in HULL_FIX:
        th, sc = HULL_FIX[t]; A = cv2.getRotationMatrix2D((TN / 2 - .5, TN / 2 - .5), th, sc); hull = (cv2.warpAffine(TEMPLATE, A, (TN, TN)) > .5).astype(np.uint8)
    else:
        hull, fitp = fit_hull(ink, vis & (w > .2)); print('  hull fit', t, np.round(fitp, 3))""", "    hull = sym_hull(t)")
os_ = __import__('os'); os_.makedirs(OUTD, exist_ok=True)
exec(src)

# ---------------------------------------------------------------- emblem: the black box only, posterised
Pt = tile_dirs(EMB_C, 400, .34); ce, we = st.sample_ball(Pt); Le = cv2.GaussianBlur(ce.mean(-1).astype(np.float32), (0, 0), .8)
EB0 = in_box(Pt, 'emblem').astype(np.uint8); pts = cv2.findNonZero((EB0 & (Le < .3)).astype(np.uint8)); EB = np.zeros((400, 400), np.uint8); cv2.fillConvexPoly(EB, cv2.boxPoints(cv2.minAreaRect(pts)).astype(np.int32), 1)
EW = np.clip((Le - .45) / .2, 0, 1) * EB  # white parts of the emblem inside the box
print('emblem box px', int(EB.sum()))
def emblem_layer(P):
    a = np.zeros(P.shape[:-1]); w_ = np.zeros(P.shape[:-1])
    for Q in (P, P @ C2Y.T):
        near = Q @ EMB_C > math.cos(.45)
        if not near.any(): continue
        X, Y, _ = tile_uv(Q[near], EMB_C, 400, .34); ok = (X >= 0) & (Y >= 0) & (X <= 399) & (Y <= 399)
        aa = np.where(ok, sample(EB.astype(np.float32), X, Y), 0); ww = np.where(ok, sample(EW.astype(np.float32), X, Y), 0)
        t1 = a[near]; t1 = np.maximum(t1, aa); a[near] = t1; t2 = w_[near]; t2 = np.maximum(t2, ww); w_[near] = t2
    return a, w_

def text_layer(P, marks):
    alpha = np.zeros(P.shape[:-1]); col = np.zeros(P.shape[:-1] + (3,))
    for Q in (P, P @ C2Y.T):
        for nm, d in marks.items():
            near = Q @ d['c'] > math.cos(d['half'] * 1.6)
            if not near.any(): continue
            n1 = d['a'].shape[0] - 1; X, Y, _ = tile_uv(Q[near], d['c'], n1 + 1, d['half']); a = sample(d['a'], X, Y)
            a = np.where((X < 0) | (Y < 0) | (X > n1) | (Y > n1), 0, a)
            aa = alpha[near]; cc = col[near]; sel = a > aa; aa[sel] = a[sel]; cc[sel] = d['ink']; alpha[near] = aa; col[near] = cc
    return alpha, col
c0, half, a = np.load('mark_finalword.npy', allow_pickle=True)
FINALWORD = dict(c=np.array(c0, float), half=float(half), a=np.asarray(a, np.float32), ink=np.zeros(3))

# ---------------------------------------------------------------- photos: marks inpainted, ink classes
SRC7 = dict(SRC); SRC7.update({n: f'refs/ref-only/ozfinal/{n}.jpg' for n in ('eb6', 'eb1', 'eb3')})
FINAL = {'eb6', 'eb1', 'eb3'}
PH7 = {k: load(k, v) for k, v in SRC7.items()}
INKS_O = np.array([[241, 243, 238], [39, 45, 56], [61, 197, 239], [144, 215, 239], [201, 224, 230], [211, 238, 160]], float) / 255
INKS_F = np.array([[226, 218, 190], [30, 36, 48], [245, 135, 75], [240, 180, 120], [228, 205, 170], [228, 172, 88], [165, 200, 210]], float) / 255
def mark_mask_photo(ph, final):
    H, W = ph.img.shape[:2]; ys, xs = np.mgrid[0:H, 0:W]; x = (xs - ph.cx) / ph.R; y = -(ys - ph.cy) / ph.R; r2 = x * x + y * y
    m = np.zeros((H, W), np.uint8); on = r2 < .98
    pts = np.stack([xs[on], ys[on]], -1).astype(float)
    C = np.array([ph.cam_dir(px, py) for px, py in pts[::1]]) if ph.D else np.stack([x[on], y[on], np.sqrt(1 - r2[on])], -1)
    B = C @ ph.M
    marks = {k: v for k, v in MT.items() if not (final and k == 'oceaunz')}
    if final: marks['finalword'] = FINALWORD
    la, _ = text_layer(B, marks); ea, _ = emblem_layer(B); inside, _, _ = tri_lookup(B)
    v = np.maximum(la, ea); v[inside] = 1
    m[on] = (v > .05).astype(np.uint8)
    k = max(9, int(ph.R / 18) | 1); return cv2.dilate(m, np.ones((k, k), np.uint8))
def class_maps7(name):
    ph = PH7[name]; final = name in FINAL
    A = (np.clip(deshaded_image(ph), 0, 1) * 255).astype(np.uint8)
    mm = mark_mask_photo(ph, final)
    A = cv2.inpaint(A, mm, 7, cv2.INPAINT_TELEA)
    c = cv2.medianBlur(A, 3).astype(np.float32) / 255
    H, W = c.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]; r = np.hypot(xx - ph.cx, yy - ph.cy) / ph.R; on = r < .85
    L = c.mean(-1); sat = c.max(-1) - c.min(-1); INK = INKS_F if final else INKS_O
    wh = np.median(c[on & (L > np.percentile(L[on], 80)) & (sat < (.25 if final else .1))], 0); bk = np.median(c[on & (L < np.percentile(L[on], 6))], 0)
    c = INK[1] + (c - bk) / np.maximum(wh - bk, .05) * (INK[0] - INK[1])
    d = ((c[..., None, :] - INK) ** 2).sum(-1)
    if final: d = np.concatenate([d[..., :5], np.minimum(d[..., 5:6], d[..., 6:7])], -1)  # yellow or sky = the keyline class
    d[..., 1] = np.minimum(d[..., 1], ((c - INK[1] * 1.8) ** 2).sum(-1))
    e = np.exp(-(d - d.min(-1, keepdims=True)) / .003); p = e / e.sum(-1, keepdims=True)
    Image.fromarray((np.clip(A, 0, 255)).astype(np.uint8)).resize((W // 4, H // 4)).save(f'{OUTD}/inpaint_{name}.jpg')
    return p.astype(np.float32)
CM7 = {n: class_maps7(n) for n in SRC7}
BAD7 = {'st': lambda X, Y: Y > 950, 'p844': lambda X, Y: (X > 1080) & (X < 1420) & (Y > 1560), 'p912': lambda X, Y: Y > 1800}
PRI = {'st': .3, 'p844': .2, 'n14': .1}  # the sharpest, best-registered views win where they see the point well
def vote7(P, temp=.004):
    vs = []; ss = []
    for gi, g in enumerate(G):
        Q = P @ g.T; tri_in = tri_lookup(Q)[0] if gi else np.zeros(P.shape[:-1], bool)
        for n, ph in PH7.items():
            C = Q @ ph.M.T; X, Y = ph.project(C); f = ph.facing(C); H, W = ph.img.shape[:2]
            ok = (f > (.25 if gi == 0 else .35)) & (X >= 0) & (Y >= 0) & (X < W - 1) & (Y < H - 1) & ~tri_in & ~BAD7.get(n, lambda X, Y: X < -1e9)(X, Y)
            vs.append(sample(CM7[n], X, Y)); ss.append(np.where(ok, f + (.35 + PRI.get(n, 0.) * (f > .45) if gi == 0 else 0.), -9.))
    ss = np.array(ss); smax = ss.max(0); k = np.exp((ss - smax) / temp) * (ss > -5)
    return (np.array(vs) * k[..., None]).sum(0) / np.maximum(k.sum(0), 1e-9)[..., None], smax
def memberships(P):
    v, ws = vote7(P)
    if P.ndim == 3: v = np.stack([cv2.GaussianBlur(v[..., k].astype(np.float32), (0, 0), 2.0) for k in range(6)], -1)
    return v, ws

# ---------------------------------------------------------------- colourways
def paint(P, v, ws, final):
    pw, pk, pc, pl, pp, pg = [v[..., k] for k in range(6)]
    t = (pp * 1 + pl * 2 + pc * 3) / np.maximum(pw + pp + pl + pc, 1e-6) / 3
    I = INKS_F if final else INKS_O
    ramp = np.array([I[0], I[4], I[3], I[2]]); x = np.clip(t * 3, 0, 2.999); i0 = np.floor(x).astype(int); fr = (x - i0)[..., None]
    col = ramp[i0] * (1 - fr) + ramp[i0 + 1] * fr
    kb = np.clip((pk - .42) / .16, 0, 1)[..., None]; col = col * (1 - kb) + I[1] * kb
    if final:
        grad = cv2.GaussianBlur((pc + pl).astype(np.float32), (0, 0), 4) if P.ndim == 3 else (pc + pl)
        kc = np.where((grad > .18)[..., None], I[5], I[6])
    else: kc = I[5]
    kl = np.clip((pg - .22) / .14, 0, 1)[..., None]; col = col * (1 - kl) + kc * kl
    col[ws < -5] = I[0]
    r = np.random.default_rng(7).random(P.shape[:-1]); speck = (r < .07) * .85; hi = (r < .015)[..., None]
    sc = np.where(hi, np.array([.85, .72, .45]) if final else I[5], np.array([.80, .82, .84])); kbs = kb[..., 0]
    col = col * (1 - (speck * kbs)[..., None]) + sc * (speck * kbs)[..., None]
    # triangles
    inside, a, ic = tri_lookup(P)
    if final:
        NAVY = {(1, 1, -1), (1, -1, 1), (-1, 1, 1), (-1, -1, -1)}; k_ = np.argmax(P @ np.array(TRIS, float).T, -1)
        ic = np.array([I[1] if tt in NAVY else I[6] for tt in TRIS])[k_]
    col[inside] = I[0]; col = col * (1 - a[..., None]) + ic * a[..., None]
    # marks
    marks = {k: dict(d) for k, d in MT.items()}
    if final: marks.pop('oceaunz'); marks['finalword'] = dict(FINALWORD)
    for k, d in marks.items(): d['ink'] = I[1] if k == 'adidas' else (np.array([214, 204, 172]) / 255 if final else np.array([.62, .64, .66]))
    la, lc = text_layer(P, marks); col = col * (1 - la[..., None]) + lc * la[..., None]
    ea, ew = emblem_layer(P); emc = np.array([.08, .08, .09]) * (1 - ew[..., None]) + np.array([.96, .96, .95]) * ew[..., None]
    col = col * (1 - ea[..., None]) + emc * ea[..., None]
    return np.clip(col, 0, 1)

cache = {}
def colour_o(P):
    key = P.shape + (round(float(P.sum()), 6),)
    if key not in cache: cache.clear(); cache[key] = memberships(P)
    v, ws = cache[key]; return paint(P, v, ws, False)
def colour_f(P):
    key = P.shape + (round(float(P.sum()), 6),)
    if key not in cache: cache.clear(); cache[key] = memberships(P)
    v, ws = cache[key]; return paint(P, v, ws, True)
if __name__ == '__main__' or True:
    Wd = 1600; D = eq_dirs(Wd, Wd // 2); v, ws = memberships(D)
    Image.fromarray((paint(D, v, ws, False) * 255).astype(np.uint8)).save(f'{OUTD}/oz-eq.png')
    Image.fromarray((paint(D, v, ws, True) * 255).astype(np.uint8)).save(f'{OUTD}/ozf-eq.png')
    for i, (d, up) in enumerate(FACES):
        pass
    print(write_faces(lambda P: paint(P, *memberships(P), False), f'{OUTD}/oz', n=NN))
    print(write_faces(lambda P: paint(P, *memberships(P), True), f'{OUTD}/ozf', n=NN))

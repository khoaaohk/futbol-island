import numpy as np, cv2
def lattice(ink, vis, maxp=80):
    """Two shortest independent lattice vectors of a periodic ink pattern (masked autocorrelation)."""
    a = (ink - ink[vis].mean()) * vis
    F = np.fft.fft2(a); Fv = np.fft.fft2(vis.astype(float))
    ac = np.real(np.fft.ifft2(F * np.conj(F))); nv = np.real(np.fft.ifft2(Fv * np.conj(Fv)))
    ac = np.fft.fftshift(ac / np.maximum(nv, nv.max() * .05)); H, W = ac.shape; cy, cx = H // 2, W // 2
    win = ac[cy - maxp:cy + maxp + 1, cx - maxp:cx + maxp + 1].copy()
    yy, xx = np.mgrid[-maxp:maxp + 1, -maxp:maxp + 1]; r = np.hypot(xx, yy)
    win[r < 5] = -1e9
    win = win.astype(np.float32); np.save('dbg_ac.npy', win)
    loc = (win == cv2.dilate(win, np.ones((5, 5), np.uint8))) & (win > win[r >= 5].max() * .35) & (r >= 5)
    pts = sorted([(-win[y, x], x - maxp, y - maxp) for y, x in zip(*np.nonzero(loc))])
    v1 = np.array(pts[0][1:3], float)
    for p in pts[1:]:
        v2 = np.array(p[1:3], float)
        if abs(v1[0] * v2[1] - v1[1] * v2[0]) > .3 * np.linalg.norm(v1) * np.linalg.norm(v2): break
    return v1, v2

def complete(ink, vis, region, v1, v2, R=12):
    """Fill region & ~vis by the nearest lattice translate that lands in the visible area."""
    out = ink.copy(); H, W = ink.shape
    ys, xs = np.nonzero(region & ~vis)
    best = np.full(len(xs), 1e9)
    for i in range(-R, R + 1):
        for j in range(-R, R + 1):
            if i == 0 and j == 0: continue
            d = i * v1 + j * v2; X = np.round(xs + d[0]).astype(int); Y = np.round(ys + d[1]).astype(int)
            ok = (X >= 0) & (Y >= 0) & (X < W) & (Y < H)
            ok[ok] &= vis[Y[ok], X[ok]] & region[Y[ok], X[ok]]
            dist = np.hypot(*d); sel = ok & (dist < best)
            out[ys[sel], xs[sel]] = ink[Y[sel], X[sel]]; best[sel] = dist
    return out, (best < 1e9)

def motif_fill(ink, vis, region, v1, v2, res=48):
    """Average the visible ink over the lattice's unit cell and re-tile it over the region (a clean periodic redraw)."""
    H, W = ink.shape; B = np.array([v1, v2], float).T; Bi = np.linalg.inv(B)
    ys, xs = np.mgrid[0:H, 0:W]; uv = np.einsum('ij,jyx->iyx', Bi, np.stack([xs - W / 2, ys - H / 2]).astype(float))
    fu = np.mod(uv[0], 1); fv = np.mod(uv[1], 1)
    iu = np.minimum((fu * res).astype(int), res - 1); iv = np.minimum((fv * res).astype(int), res - 1)
    m = vis & region
    acc = np.zeros((res, res)); cnt = np.zeros((res, res))
    np.add.at(acc, (iv[m], iu[m]), ink[m]); np.add.at(cnt, (iv[m], iu[m]), 1)
    cell = acc / np.maximum(cnt, 1)
    big = np.tile(cell, (3, 3)); big = cv2.GaussianBlur(big.astype(np.float32), (0, 0), .7)[res:2 * res, res:2 * res]
    out = big[iv, iu]
    return np.where(region, out, ink), cell

def refine_lattice(ink, mask, v1, v2, res=24):
    """Sub-pixel lattice: maximise the contrast of the averaged unit cell."""
    H, W = ink.shape; ys, xs = np.nonzero(mask); vals = ink[ys, xs]; X = np.stack([xs - W / 2, ys - H / 2]).astype(float)
    def score(p):
        B = np.array([[p[0], p[2]], [p[1], p[3]]]); uv = np.linalg.solve(B, X)
        iu = np.minimum((np.mod(uv[0], 1) * res).astype(int), res - 1); iv = np.minimum((np.mod(uv[1], 1) * res).astype(int), res - 1)
        idx = iv * res + iu; s = np.bincount(idx, vals, res * res); n = np.bincount(idx, None, res * res)
        m = s / np.maximum(n, 1); return (n * (m - vals.mean()) ** 2).sum() / len(vals)
    p = np.array([v1[0], v1[1], v2[0], v2[1]], float); best = score(p); step = .5
    while step > .005:
        imp = False
        for i in range(4):
            for s in (step, -step):
                q = p.copy(); q[i] += s; sc = score(q)
                if sc > best: best, p, imp = sc, q, True
        if not imp: step /= 2
    return p[:2], p[2:], best

def hatch(shape, v1, v2, width, ph1=0., ph2=0.):
    """Lines along v1 (repeating every v2) and along v2 (repeating every v1)."""
    H, W = shape; ys, xs = np.mgrid[0:H, 0:W]; X = np.stack([xs - W / 2, ys - H / 2]).astype(float)
    out = np.zeros(shape)
    for d, rep, ph in ((v1, v2, ph1), (v2, v1, ph2)):
        n = np.array([-d[1], d[0]]) / np.linalg.norm(d); sp = abs(np.dot(rep, n))
        t = (np.einsum('i,iyx->yx', n, X) / sp + ph) % 1; dist = np.minimum(t, 1 - t) * sp
        out = np.maximum(out, np.clip(1 - (dist - width / 2 + .5), 0, 1))
    return out

def fit_hatch(ink, mask, v1, v2, width):
    best = (-1, 0, 0)
    for p1 in np.linspace(0, 1, 24, endpoint=False):
        for p2 in np.linspace(0, 1, 24, endpoint=False):
            h = hatch(ink.shape, v1, v2, width, p1, p2); s = (h[mask] * (ink[mask] - ink[mask].mean())).mean()
            if s > best[0]: best = (s, p1, p2)
    return best

def zigzag(shape, ang, spacing, period, amp, ph_q, ph_s, duty=.5, soft=.7):
    """Parallel zigzag stripes: stripe direction ang (deg, image coords), ink where frac(stripe coord) < duty."""
    H, W = shape; ys, xs = np.mgrid[0:H, 0:W]; x = xs - W / 2; y = ys - H / 2
    a = np.radians(ang); d = np.array([np.cos(a), np.sin(a)]); n = np.array([-d[1], d[0]])
    s = x * d[0] + y * d[1]; q = x * n[0] + y * n[1]
    tri = 2 * np.abs(((s / period + ph_s) % 1) - .5) - .5  # -0.5..0.5 triangle wave
    u = ((q - amp * tri) / spacing + ph_q) % 1
    dist = np.minimum(np.abs(u - duty / 2), 1 - np.abs(u - duty / 2)) * spacing  # distance to stripe centre
    return np.clip((duty * spacing / 2 - dist) / soft + .5, 0, 1)

def fit_zigzag(ink, mask, init):
    p = np.array(init, float)
    def sc(p):
        z = zigzag(ink.shape, *p); v = ink[mask] - ink[mask].mean(); return (z[mask] * v).mean() / (z[mask].std() + 1e-6)
    best = sc(p); steps = np.array([3, 1.5, 1.5, 1.5, .1, .1, .05])
    # coarse phase search first
    for a in np.linspace(0, 1, 12, endpoint=False):
        for b in np.linspace(0, 1, 12, endpoint=False):
            q = p.copy(); q[4], q[5] = a, b; s_ = sc(q)
            if s_ > best: best, p = s_, q
    while steps.max() > .01:
        imp = False
        for i in range(7):
            for s in (steps[i], -steps[i]):
                q = p.copy(); q[i] += s
                if q[6] <= .1 or q[6] >= .9 or q[1] < 4 or q[2] < 4: continue
                s_ = sc(q)
                if s_ > best: best, p, imp = s_, q, True
        if not imp: steps /= 2
    return p, best

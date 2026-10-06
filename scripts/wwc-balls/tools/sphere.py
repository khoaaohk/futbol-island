"""Sphere-print toolkit for the WWC exact balls (Oct 6 2026).

Frames: everything is in the ball-local frame of the GLSL designs (p = unit vector). The audit seam map is equirect 2048x1024:
lon=(x/w*2-1)*pi, lat=(.5-y/h)*pi (row 0 = north), p=(cos lat sin lon, sin lat, cos lat cos lon).
Photo frame (unwrap.py): camera-space unit vectors, +x right, +y up, +z toward the viewer.
"""
import numpy as np, math, json, os
from PIL import Image
import cv2

def nrm(v):
    v = np.asarray(v, float); return v / np.linalg.norm(v, axis=-1, keepdims=True)

# ---------------------------------------------------------------- equirect
def eq_dirs(w, h):
    x = (np.arange(w) + .5) / w; y = (np.arange(h) + .5) / h
    lon = (x * 2 - 1) * math.pi; lat = (.5 - y) * math.pi
    lon, lat = np.meshgrid(lon, lat)
    return np.stack([np.cos(lat) * np.sin(lon), np.sin(lat), np.cos(lat) * np.cos(lon)], -1)

def dir_to_eq(P, w, h):
    lon = np.arctan2(P[..., 0], P[..., 2]); lat = np.arcsin(np.clip(P[..., 1], -1, 1))
    return (lon / math.pi + 1) / 2 * w - .5, (.5 - lat / math.pi) * h - .5

def sample(img, X, Y, wrap=False):
    """Bilinear sample of an HxWxC float array at float pixel coords."""
    H, W = img.shape[:2]
    X0 = np.floor(X).astype(int); Y0 = np.floor(Y).astype(int); fx = (X - X0)[..., None]; fy = (Y - Y0)[..., None]
    if wrap: X0 %= W; X1 = (X0 + 1) % W
    else: X0 = np.clip(X0, 0, W - 1); X1 = np.clip(X0 + 1, 0, W - 1)
    Y0 = np.clip(Y0, 0, H - 1); Y1 = np.clip(Y0 + 1, 0, H - 1)
    a = img if img.ndim == 3 else img[..., None]
    o = a[Y0, X0] * (1 - fx) * (1 - fy) + a[Y0, X1] * fx * (1 - fy) + a[Y1, X0] * (1 - fx) * fy + a[Y1, X1] * fx * fy
    return o if img.ndim == 3 else o[..., 0]

# ---------------------------------------------------------------- seam map / panels
class SeamMap:
    def __init__(s, path):
        A = np.asarray(Image.open(path).convert('RGB')).astype(int)
        s.h, s.w = A.shape[:2]
        s.seam = (A[..., 0] == 230) & (A[..., 1] == 20) & (A[..., 2] == 40)
        s.col = A
        m = (~s.seam).astype(np.uint8)
        n, lab = cv2.connectedComponents(m, connectivity=4)
        # merge across the longitude wrap
        par = list(range(n))
        def f(i):
            while par[i] != i: par[i] = par[par[i]]; i = par[i]
            return i
        for y in range(s.h):
            a, b = lab[y, 0], lab[y, -1]
            if a and b: par[f(a)] = f(b)
        for y in (0, s.h - 1):
            row = lab[y]
            for x in range(s.w // 2):
                a, b = row[x], row[x + s.w // 2]
                if a and b: par[f(a)] = f(b)
        lab = np.vectorize(f)(lab) if n < 5000 else lab
        lab[s.seam] = 0
        # keep big regions, renumber
        D = eq_dirs(s.w, s.h); wgt = np.cos(np.arcsin(D[..., 1]))
        ids, inv = np.unique(lab, return_inverse=True); inv = inv.reshape(lab.shape)
        area = np.bincount(inv.ravel(), wgt.ravel()) / wgt.sum()
        keep = [k for k, i in enumerate(ids) if i != 0 and area[k] > .004]
        s.label = np.full(lab.shape, -1)
        s.centres = []; s.areas = []
        for j, k in enumerate(sorted(keep, key=lambda k: -area[k])):
            msk = inv == k; s.label[msk] = j
            c = (D[msk] * wgt[msk][:, None]).sum(0); s.centres.append(c / np.linalg.norm(c)); s.areas.append(area[k])
        s.centres = np.array(s.centres)
        # distance-to-seam (in eq px, approx) for each pixel, used for nearest-panel fill on seams
        s.D = D

    def panel(s, P):
        """Panel index at directions P (nearest non-seam label)."""
        X, Y = dir_to_eq(P, s.w, s.h)
        xi = np.clip(np.round(X).astype(int) % s.w, 0, s.w - 1); yi = np.clip(np.round(Y).astype(int), 0, s.h - 1)
        return s.label[yi, xi]

# ---------------------------------------------------------------- rotations / symmetry
def rot(axis, ang):
    k = nrm(axis); K = np.array([[0, -k[2], k[1]], [k[2], 0, -k[0]], [-k[1], k[0], 0]])
    return np.eye(3) + math.sin(ang) * K + (1 - math.cos(ang)) * K @ K

def group_close(gens, tol=1e-6):
    G = [np.eye(3)]
    changed = True
    while changed:
        changed = False
        for g in list(G):
            for h in gens:
                m = g @ h
                if not any(np.abs(m - x).max() < tol for x in G): G.append(m); changed = True
    return G

def octa_group():
    return group_close([rot([1, 0, 0], math.pi / 2), rot([0, 1, 0], math.pi / 2)])

def tetra_group():
    return group_close([rot([1, 1, 1], 2 * math.pi / 3), rot([1, 0, 0], math.pi)])

# ---------------------------------------------------------------- photos
class Photo:
    """A calibrated photo. M: ball->camera rotation; ball circle (cx,cy,R) in px; D: camera distance in ball radii (None=ortho)."""
    def __init__(s, path, cx, cy, R, D=None, M=None):
        s.path = path; s.img = np.asarray(Image.open(path).convert('RGB')).astype(np.float32) / 255
        s.cx, s.cy, s.R, s.D = cx, cy, R, D; s.M = np.eye(3) if M is None else M

    def cam_dir(s, px, py):
        if not s.D:
            x = (px - s.cx) / s.R; y = -(py - s.cy) / s.R; return np.array([x, y, math.sqrt(max(0, 1 - x * x - y * y))])
        D = s.D; f = s.R * math.sqrt(D * D - 1); d = nrm([(px - s.cx) / f, -(py - s.cy) / f, -1.]); o = np.array([0, 0, D])
        b = np.dot(o, d); c = np.dot(o, o) - 1; t = -b - math.sqrt(max(b * b - c, 0)); return nrm(o + t * d)

    def project(s, Pcam):
        if not s.D: return s.cx + s.R * Pcam[..., 0], s.cy - s.R * Pcam[..., 1]
        D = s.D; f = s.R * math.sqrt(D * D - 1)
        return s.cx + f * Pcam[..., 0] / (D - Pcam[..., 2]), s.cy - f * Pcam[..., 1] / (D - Pcam[..., 2])

    def facing(s, Pcam):
        if not s.D: return Pcam[..., 2]
        V = np.array([0, 0, s.D]) - Pcam; V = V / np.linalg.norm(V, axis=-1, keepdims=True)
        return (Pcam * V).sum(-1)

    def fit(s, pts):
        """pts: [(px,py,ball_dir)] -> Kabsch rotation."""
        obs = np.array([s.cam_dir(x, y) for x, y, _ in pts]); ball = nrm(np.array([b for *_, b in pts]))
        H = ball.T @ obs; U, S, Vt = np.linalg.svd(H); d = np.sign(np.linalg.det(Vt.T @ U.T))
        s.M = Vt.T @ np.diag([1, 1, d]) @ U.T
        s.res = [math.degrees(math.acos(min(1, float(np.dot(s.M @ b, o))))) for b, o in zip(ball, obs)]
        return s.res

    def sample_ball(s, P):
        """Colour and facing weight of ball directions P (...x3)."""
        C = P @ s.M.T; X, Y = s.project(C); f = s.facing(C)
        col = sample(s.img, X, Y)
        H, W = s.img.shape[:2]
        ok = (f > 0) & (X >= 0) & (Y >= 0) & (X < W - 1) & (Y < H - 1)
        return col, np.where(ok, f, 0.)

def overlay(photo, seammap, out, extra=None):
    """Draw the seam map's seams (projected with photo.M) on the photo."""
    im = (photo.img * 255).astype(np.uint8).copy()
    P = seammap.D[seammap.seam]
    C = P @ photo.M.T; X, Y = photo.project(C); f = photo.facing(C)
    k = (f > .05)
    xi = np.round(X[k]).astype(int); yi = np.round(Y[k]).astype(int); H, W = im.shape[:2]
    g = (xi >= 0) & (yi >= 0) & (xi < W) & (yi < H)
    im[yi[g], xi[g]] = [255, 0, 255]
    if extra:
        for (b, colr) in extra:
            c = photo.M @ nrm(b)
            if photo.facing(c[None])[0] > 0:
                x, y = photo.project(c[None]); cv2.circle(im, (int(x[0]), int(y[0])), 6, colr, 2)
    Image.fromarray(im).save(out)

# ---------------------------------------------------------------- cube-face decals
FACES = [((1, 0, 0), (0, 1, 0)), ((-1, 0, 0), (0, 1, 0)), ((0, 1, 0), (0, 0, -1)), ((0, -1, 0), (0, 0, 1)), ((0, 0, 1), (0, 1, 0)), ((0, 0, -1), (0, 1, 0))]
HALF = .74

def face_dirs(d, up, n=512, half=HALF):
    d = nrm(d); up = nrm(up); r = nrm(np.cross(up, d)); u = np.cross(d, r)
    a = ((np.arange(n) + .5) / n * 2 - 1) * half; b = (1 - (np.arange(n) + .5) / n * 2) * half
    A, B = np.meshgrid(a, b); c = np.sqrt(np.clip(1 - A * A - B * B, 0, 1))
    return d * c[..., None] + r * A[..., None] + u * B[..., None], c

def write_faces(colfn, outprefix, n=512, half=HALF, overlap=.012):
    """colfn(P: (...,3)) -> RGB float 0..1. Writes outprefix-1..6.png (RGBA; alpha = this face's share of the sphere)."""
    files = []
    for i, (d, up) in enumerate(FACES):
        P, c = face_dirs(d, up, n, half)
        ax = int(np.argmax(np.abs(d))); sg = np.sign(d[ax])
        own = sg * P[..., ax] - np.abs(P).max(-1)  # >= 0 where this face is the dominant axis
        alpha = np.clip((own + overlap) / overlap, 0, 1) * (c > .32)
        rgb = colfn(P)
        out = np.zeros((n, n, 4), np.uint8); out[..., :3] = np.clip(rgb * 255 + .5, 0, 255); out[..., 3] = (alpha * 255).astype(np.uint8)
        f = f'{outprefix}-{i + 1}.png'; Image.fromarray(out, 'RGBA').save(f, optimize=True); files.append(f)
    return files

def decal_ts(id_, credit, n=6, half=HALF, gloss=None, start=1):
    rows = []
    for i, (d, up) in enumerate(FACES[:n]):
        g = f',gloss:{gloss}' if gloss is not None else ''
        rows.append(f" {{src:'/museum/wcballs/decals/{id_}-{i + start}.png',dir:[{d[0]},{d[1]},{d[2]}],up:[{up[0]},{up[1]},{up[2]}],w:{half},h:{half}{g},credit:{json.dumps(credit)}}}")
    return rows

def viewer_euler(M, elev_deg=7.):
    """three.js XYZ Euler for the gallery pose that shows the ball as the photo does (camera 7 deg above)."""
    t = math.radians(elev_deg); Rx = np.array([[1, 0, 0], [0, math.cos(t), -math.sin(t)], [0, math.sin(t), math.cos(t)]])
    Q = Rx.T @ M
    y = math.asin(max(-1, min(1, Q[0, 2])))
    if abs(Q[0, 2]) < .9999999: x = math.atan2(-Q[1, 2], Q[2, 2]); z = math.atan2(-Q[0, 1], Q[0, 0])
    else: x = math.atan2(Q[2, 1], Q[1, 1]); z = 0
    return x, y, z

def corner_pts(photo, centre_px, centre_dir, corners):
    """Correspondences for a patch centred on a panel: centre plus corners [(px,py,axis_dir)] placed on the geodesic from the
    centre toward axis_dir at the angle measured in the photo."""
    c = photo.cam_dir(*centre_px); C = nrm(centre_dir); out = [(centre_px[0], centre_px[1], C)]
    for x, y, ax in corners:
        a = math.acos(min(1, float(np.dot(c, photo.cam_dir(x, y)))))
        t = nrm(np.asarray(ax, float) - C * np.dot(ax, C)); out.append((x, y, C * math.cos(a) + t * math.sin(a)))
    return out

def rodrigues(w):
    a = np.linalg.norm(w)
    return np.eye(3) if a < 1e-12 else rot(w / a, a)

def lm(f, x0, iters=200, lam=1e-2):
    """Levenberg-Marquardt on residual vector f(x)."""
    x = np.array(x0, float); r = f(x); c = r @ r
    for _ in range(iters):
        J = np.zeros((len(r), len(x)))
        for i in range(len(x)):
            h = 1e-5 * max(1, abs(x[i])); xp = x.copy(); xp[i] += h; J[:, i] = (f(xp) - r) / h
        A = J.T @ J; g = J.T @ r
        while True:
            dx = -np.linalg.solve(A + lam * np.diag(np.diag(A) + 1e-9), g); xn = x + dx; rn = f(xn); cn = rn @ rn
            if cn < c: x, r, c = xn, rn, cn; lam = max(lam / 3, 1e-9); break
            lam *= 4
            if lam > 1e9: return x, r
        if np.abs(dx).max() < 1e-9: break
    return x, r

def project_pts(M, cx, cy, R, D, B):
    ph = Photo.__new__(Photo); ph.cx, ph.cy, ph.R, ph.D = cx, cy, R, D
    X, Y = ph.project(np.asarray(B) @ M.T); return np.stack([X, Y], -1)

def sh9(n):
    x, y, z = n[..., 0], n[..., 1], n[..., 2]
    return np.stack([np.ones_like(x), x, y, z, x * y, y * z, x * z, x * x - y * y, 3 * z * z - 1], -1)

class Shaded(Photo):
    """A Photo whose lighting is divided out: a 2nd-order SH illumination per channel is fitted to the paper-white pixels."""
    def __init__(s, path, cx, cy, R, D=None, M=None, white=(.95, .95, .94), wmask=None, order=9):
        super().__init__(path, cx, cy, R, D, M)
        H, W = s.img.shape[:2]
        ys, xs = np.mgrid[0:H:4, 0:W:4]
        x = (xs - s.cx) / s.R; y = -(ys - s.cy) / s.R; r2 = x * x + y * y; ok = r2 < .85 ** 2
        n = np.stack([x, y, np.sqrt(np.clip(1 - r2, 0, 1))], -1)
        c = s.img[ys, xs]; L = c.mean(-1); sat = c.max(-1) - c.min(-1)
        sel = ok & (L > np.percentile(L[ok], 55)) & (sat < .12) & (L < .985)
        if wmask is not None: sel &= wmask(c)
        A = sh9(n[sel])[:, :order]
        s.coef = [np.linalg.lstsq(A, c[sel][:, k], rcond=None)[0] for k in range(3)]
        s.order = order; s.white = np.array(white)
    def sample_ball(s, P):
        col, w = super().sample_ball(P)
        C = P @ s.M.T; A = sh9(C)[..., :s.order]
        L = np.stack([A @ s.coef[k] for k in range(3)], -1)
        return np.clip(col / np.maximum(L, .05) * s.white, 0, 1), w

def deshaded_image(s):
    """The whole photo divided by its fitted illumination (pixels off the ball are left as they are)."""
    H, W = s.img.shape[:2]; ys, xs = np.mgrid[0:H, 0:W]
    x = (xs - s.cx) / s.R; y = -(ys - s.cy) / s.R; r2 = x * x + y * y
    n = np.stack([x, y, np.sqrt(np.clip(1 - r2, 0, 1))], -1); A = sh9(n)[..., :s.order]
    L = np.stack([A @ s.coef[k] for k in range(3)], -1)
    out = np.where((r2 < 1)[..., None], np.clip(s.img / np.maximum(L, .05) * s.white, 0, 1), s.img)
    return out.astype(np.float32)

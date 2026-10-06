set -e
cd /private/tmp/claude-501/-Users-khoado/fd423a7b-446c-4400-bc24-5a60700b32ca/scratchpad/wwc-balls/lane9903
P="/Users/khoado/Desktop/Warp Claude Projects/futbol-island/public/museum/wcballs/decals"
python3 -c "
from PIL import Image
for i in range(1,7): Image.open(f'out/ic-{i}.png').save(f'out/ic-{i}.webp',quality=88,method=6,alpha_quality=90)"
for i in 1 2 3 4 5 6; do cp out/ic-$i.webp "$P/wwc-1999-icon-$i.webp"; done
POSES=$(python3 -c "
import sys,json;sys.path.insert(0,'tools');from sphere import *
print(json.dumps([list(viewer_euler(np.load(f'M_{n}.npy'))) for n in ['fb','r1','r3']]))")
node tools/pose.cjs wwc-1999-icon shots/ic.png "$POSES" | grep -v -E "GPU stall|preload" || true
python3 tools/compare.py cmp_ic.jpg shots/ic-0.png ref/icon_fb_c.png C_fb.json "1999 original, football-balls.com (reference only)" shots/ic-1.png ref/IW5503_b2b012_plp.png C_r1.json "2024 reissue IW5503 (reference only)" shots/ic-2.png ref/IW5503_b2b212_pdp.png C_r3.json "2024 reissue IW5503, back (reference only)"

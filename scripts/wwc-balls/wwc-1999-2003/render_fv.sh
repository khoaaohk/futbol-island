set -e
cd /private/tmp/claude-501/-Users-khoado/fd423a7b-446c-4400-bc24-5a60700b32ca/scratchpad/wwc-balls/lane9903
P="/Users/khoado/Desktop/Warp Claude Projects/futbol-island/public/museum/wcballs/decals"
python3 -c "
from PIL import Image
for i in range(1,8): Image.open(f'out/fv-{i}.png').save(f'out/fv-{i}.webp',quality=88,method=6,alpha_quality=90)"
for i in 1 2 3 4 5 6 7; do cp out/fv-$i.webp "$P/wwc-2003-fevernova-$i.webp"; done
POSES=$(python3 -c "
import sys,json;sys.path.insert(0,'tools');from sphere import *
print(json.dumps([list(viewer_euler(np.load(f'M_{n}.npy'))) for n in ['mex','mex_02','mex_03','mex_04','mex_05']]))")
node tools/pose.cjs wwc-2003-fevernova shots/fv.png "$POSES" | grep -v -E "GPU stall|preload" || true
python3 tools/compare.py cmp_fv.jpg shots/fv-0.png ref/mex.png C_mex.json "studio view 1 (reference only)" shots/fv-1.png ref/mex_02.png C_mex_02.json "studio view 2 (reference only)" shots/fv-2.png ref/mex_03.png C_mex_03.json "studio view 3 (reference only)" shots/fv-3.png ref/mex_04.png C_mex_04.json "studio view 4 (reference only)" shots/fv-4.png ref/mex_05.png C_mex_05.json "studio view 5 (reference only)"

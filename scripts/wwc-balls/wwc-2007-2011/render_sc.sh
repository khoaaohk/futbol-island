set -e
cd /private/tmp/claude-501/-Users-khoado/fd423a7b-446c-4400-bc24-5a60700b32ca/scratchpad/wwc-balls/lane0711
python3 build_speedcell.py out/sc 512 | tail -1
P="/Users/khoado/Desktop/Warp Claude Projects/futbol-island/public/museum/wcballs/decals"
for i in 1 2 3 4 5 6; do python3 -c "from PIL import Image;Image.open('out/sc-$i.png').save('$P/wwc-2011-speedcell-$i.webp',quality=88,method=6)"; done
POSES=$(python3 -c "
import sys;sys.path.insert(0,'tools');from sphere import *;import json
print(json.dumps([[round(v,4) for v in viewer_euler(np.load(f'M_{n}.npy'))] for n in ['ks','col','dm']]))")
node tools/pose.cjs wwc-2011-speedcell shots/sc.png "$POSES" | grep -v -E "GPU stall|preload" || true
python3 tools/compare.py cmp_sc.jpg shots/sc-0.png ../refs/wwc-2011-speedcell/photo-Speedcell.jpg C_ks.json "Speedcell.jpg kandschwar CC BY-SA 3.0 (WWC 2011)" shots/sc-1.png ../refs/wwc-2011-speedcell/photo-Adidas-Speedcell-Colombia-2011.jpg C_col.json "Speedcell Colombia 2011 Futbolero CC BY-SA 2.5 CO (U-20 marks; ours shows the WWC marks)" shots/sc-2.png ../refs/speedcell/Diana-Matheson-in-2011.JPG C_dm.json "Diana Matheson in 2011 CC BY-SA 3.0"

set -e
cd /private/tmp/claude-501/-Users-khoado/fd423a7b-446c-4400-bc24-5a60700b32ca/scratchpad/wwc-balls
P="/Users/khoado/Desktop/Warp Claude Projects/futbol-island/public/museum/wcballs/decals"
python3 - "$1" "$P" <<'PY'
import sys;from PIL import Image
d,P=sys.argv[1],sys.argv[2]
for pre,dst in [('oz','wwc-2023-oceaunz'),('ozf','wwc-2023-oceaunz-final-pro')]:
  for i in range(1,7): Image.open(f'{d}/{pre}-{i}.png').save(f'{P}/{dst}-{i}.webp','WEBP',quality=88,method=6,alpha_quality=90)
PY
node tools/pose.cjs wwc-2023-oceaunz shots/oz.png '[[0.4314,-0.5136,-0.2464],[0.238,-0.1265,-0.4439],[2.4639,-0.1272,-2.7088],[-2.402,0.6158,-2.5408]]' | grep -v -E "GPU stall|preload" || true
node tools/pose.cjs wwc-2023-oceaunz-final-pro shots/ozf.png "$(python3 -c "
import sys,json;sys.path.insert(0,'tools');from sphere import *
print(json.dumps([[round(v,4) for v in viewer_euler(np.load(f'M_{n}.npy'))] for n in ['eb6','eb1','eb3']]))")" | grep -v -E "GPU stall|preload" || true
python3 - <<'PY'
import sys,json;sys.path.insert(0,'tools');from sphere import *
print([[round(v,4) for v in viewer_euler(np.load(f'M_{n}.npy'))] for n in ['st','p912','p844','n14']])
PY
R=refs/wwc-2023-oceaunz; F=refs/ref-only/ozfinal
python3 tools/compare.py cmp_oz.jpg shots/oz-0.png "$R/photo-2023-07-07-Fussball-Frauen-Landerspiel-Deutschland-Sambia-1DX-6938-by-Stepro-cropped.jpg" C_st.json "Oceaunz - Stepro CC BY-SA 4.0" shots/oz-1.png refs/ref-only/oceaunz/ht9011_9112459.png C_p912.json "Oceaunz - adidas HT9011 product (reference only)" shots/oz-2.png refs/ref-only/oceaunz/ht9011_8441688.png C_p844.json "Oceaunz - adidas HT9011 product (reference only)" shots/oz-3.png $R/photo-National-Football-Museum-displays-14.jpg C_n14.json "Oceaunz - NFM display 14 CC BY-SA 4.0"
python3 tools/compare.py cmp_ozf.jpg shots/ozf-0.png $F/eb6.jpg C_eb6.json "Final Oceaunz Pro - listing photo (reference only)" shots/ozf-1.png $F/eb1.jpg C_eb1.json "Final - listing photo (reference only)" shots/ozf-2.png $F/eb3.jpg C_eb3.json "Final - listing photo (reference only)"

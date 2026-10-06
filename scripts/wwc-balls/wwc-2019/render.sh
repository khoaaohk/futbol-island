# render.sh <id> <outprefix-of-faces> <name:path ...>   installs faces, renders at photo poses, makes compare sheet cmp_<id>.jpg
set -e
cd /private/tmp/claude-501/-Users-khoado/fd423a7b-446c-4400-bc24-5a60700b32ca/scratchpad/wwc-balls/lane2019
ID=$1;PF=$2;shift 2
P="/Users/khoado/Desktop/Warp Claude Projects/futbol-island/public/museum/wcballs/decals"
for i in 1 2 3 4 5 6; do cp $PF-$i.webp "$P/$ID-$i.webp"; done
POSES=$(python3 -c "
import sys,json;sys.path.insert(0,'tools');from sphere import *
print(json.dumps([list(viewer_euler(np.load('M_%s.npy'%a.split(':')[0]))) for a in sys.argv[1:]]))" "$@")
node tools/pose.cjs $ID shots/$ID.png "$POSES" | grep -v -E "GPU stall|preload" || true
ARGS=();i=0
for a in "$@"; do n=${a%%:*};p=${a#*:};ARGS+=(shots/$ID-$i.png "$p" C_$n.json "$n");i=$((i+1)); done
python3 tools/compare.py cmp_$ID.jpg "${ARGS[@]}"

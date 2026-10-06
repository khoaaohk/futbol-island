set -e
cd /private/tmp/claude-501/-Users-khoado/fd423a7b-446c-4400-bc24-5a60700b32ca/scratchpad/wwc-balls
P="/Users/khoado/Desktop/Warp Claude Projects/futbol-island/public/museum/wcballs/decals"
for i in 1 2 3 4 5 6; do cp out/$1-$i.png "$P/wwc-2023-oceaunz-$i.png"; done
node tools/pose.cjs wwc-2023-oceaunz shots/oz.png '[[0.4314,-0.5136,-0.2464],[0.238,-0.1265,-0.4439],[2.4639,-0.1272,-2.7088],[-2.402,0.6158,-2.5408]]' | grep -v -E "GPU stall|preload" || true
R=refs/wwc-2023-oceaunz
python3 tools/compare.py cmp_oz.jpg shots/oz-0.png "$R/photo-2023-07-07-Fussball-Frauen-Landerspiel-Deutschland-Sambia-1DX-6938-by-Stepro-cropped.jpg" C_st.json "Stepro CC BY-SA 4.0" shots/oz-1.png refs/ref-only/oceaunz/ht9011_9112459.png C_p912.json "adidas HT9011 product (reference only)" shots/oz-2.png refs/ref-only/oceaunz/ht9011_8441688.png C_p844.json "adidas HT9011 product (reference only)" shots/oz-3.png $R/photo-National-Football-Museum-displays-14.jpg C_n14.json "NFM display 14 CC BY-SA 4.0"

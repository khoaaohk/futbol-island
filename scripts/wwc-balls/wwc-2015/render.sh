# render.sh <ballid> <tag>
cd /private/tmp/claude-501/-Users-khoado/fd423a7b-446c-4400-bc24-5a60700b32ca/scratchpad/wwc-balls/lane2015
node tools/pose.cjs $1 shots/$2.png '[[-0.2979, 0.747, -3.0982], [-0.3351, 0.9088, -2.8696], [-0.4321, 0.2233, 2.9335], [-0.257, -0.0107, 3.0041]]' | grep -v -E "GPU stall|preload|^ok$" || true
R=refs/wwc-2015-conext15/photo-BALON-DEL-CAMPEONATO-
python3 tools/compare.py cmp_$2.jpg shots/$2-0.png ${R}16397047065.jpg C_a3g.json "ANDES 16397047065 CC BY-SA 2.0" shots/$2-1.png ${R}15774583044.jpg C_a1g.json "ANDES 15774583044 CC BY-SA 2.0" shots/$2-2.png ro/fh1.jpg C_fh1g.json "adidas launch image via footyheadlines (reference only)" shots/$2-3.png ro/eq1.jpg C_eq1g.json "adidas WWC image via equalizersoccer (reference only)"

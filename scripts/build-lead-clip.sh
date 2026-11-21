#!/bin/zsh
# matchmix re-cut (Nov 20 2026): cuts 1-3 from the kept master (7v7 behind, futsal side, 9v9 close), cut 4 the stadium 11v11 from the
# Close camera, cut 5 beach soccer from the Close camera cropped 1600x900 around the play; every cut goes straight to 1280x720 (never upscaled).
FF=/opt/homebrew/bin/ffmpeg; D=${MEDIA:?set MEDIA to the folder with raw/<fmt>-<angle>.webm from scripts/record-live-match.cjs}; L=${LEAD:?set LEAD to the folder with master-1080.mkv}
ST=${ST:-5.0}; BE=${BE:-10.3}
$FF -hide_banner -loglevel error -y -i $L/master-1080.mkv -ss $ST -t 3.5 -i $D/raw/stadium-close.webm -ss $BE -t 3.5 -i $D/raw/beach-close.webm -filter_complex \
 "[0]trim=0:9,setpts=PTS-STARTPTS,scale=1280:720:flags=lanczos,setsar=1[a];[1]fps=30,trim=end_frame=90,setpts=PTS-STARTPTS,scale=1280:720:flags=lanczos,setsar=1[b];[2]fps=30,trim=end_frame=90,setpts=PTS-STARTPTS,crop=1600:900:320:120,scale=1280:720:flags=lanczos,setsar=1[c];[a][b][c]concat=n=3:v=1:a=0,format=yuv420p[v]" \
 -map '[v]' -c:v ffv1 $D/master-720.mkv
M=$D/master-720.mkv; P=$D/out; mkdir -p $P
$FF -hide_banner -loglevel error -y -i $M -c:v libx264 -preset slow -b:v 2200k -pass 1 -passlogfile $P/x -an -f null /dev/null
$FF -hide_banner -loglevel error -y -i $M -c:v libx264 -preset slow -b:v 2200k -pass 2 -passlogfile $P/x -pix_fmt yuv420p -profile:v high -movflags +faststart -an $P/matchmix.mp4
$FF -hide_banner -loglevel error -y -i $M -c:v libvpx-vp9 -crf ${VCRF:-36} -b:v ${VBR:-1500k} -row-mt 1 -an $P/matchmix.webm
$FF -hide_banner -loglevel error -y -i $M -vf scale=640:360:flags=lanczos -c:v libx264 -preset slow -b:v 450k -pass 1 -passlogfile $P/s -an -f null /dev/null
$FF -hide_banner -loglevel error -y -i $M -vf scale=640:360:flags=lanczos -c:v libx264 -preset slow -b:v 450k -pass 2 -passlogfile $P/s -pix_fmt yuv420p -profile:v high -movflags +faststart -an $P/matchmix-s.mp4
ls -l $P/matchmix* | awk '{print $5, $NF}'

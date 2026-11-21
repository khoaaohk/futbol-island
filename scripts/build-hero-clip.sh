#!/bin/zsh
# Hero loop for /games (public/games/clips/hero.*): three phone recordings from scripts/capture-game-media.cjs record, side by side,
# 720x520, 10 s, 30 fps, silent. K/S/A = clip start (s) in the Kit Rush, Squad Snake and Air Futbol recordings. Writes to $OUT.
G=${G:-/Users/khoado/Desktop/Warp\ Claude\ Projects/futbol-island/.claude/worktrees/_recovery-nov20/game-media}  # the record dirs of scripts/capture-game-media.cjs
FF=/opt/homebrew/bin/ffmpeg; O=${OUT:-$PWD}
K=${K:-10.97}; S=${S:-47.98}; A=${A:-1.17}; CRF=${CRF:-30}; VCRF=${VCRF:-40}
IN=(-f concat -safe 0 -ss $K -t 10 -i "$G/rec-kitrush/clip.txt" -f concat -safe 0 -ss $S -t 10 -i "$G/rec-snake/clip.txt" -f concat -safe 0 -ss $A -t 10 -i "$G/rec-airhockey/clip.txt")
VF="[0]fps=30,scale=240:520:flags=lanczos,setsar=1[a];[1]fps=30,scale=240:520:flags=lanczos,setsar=1[b];[2]fps=30,scale=240:520:flags=lanczos,setsar=1[c];[a][b][c]hstack=3,trim=duration=10[v]"
$FF -hide_banner -loglevel error -y $IN -filter_complex $VF -map '[v]' -an -c:v libx264 -pix_fmt yuv420p -crf $CRF -preset slow -movflags +faststart $O/hero.mp4
$FF -hide_banner -loglevel error -y $IN -filter_complex $VF -map '[v]' -an -c:v libvpx-vp9 -crf $VCRF -b:v 0 -row-mt 1 $O/hero.webm
ls -l $O/hero.mp4 $O/hero.webm | awk '{print $5, $9}'

# install.sh <outprefix> <ballid>  : converts faces to webp and copies into public
set -e
cd /private/tmp/claude-501/-Users-khoado/fd423a7b-446c-4400-bc24-5a60700b32ca/scratchpad/wwc-balls/lane2015
P="/Users/khoado/Desktop/Warp Claude Projects/futbol-island/public/museum/wcballs/decals"
python3 -c "
from PIL import Image;import sys,os
for i in range(1,7):
  im=Image.open('$1-%d.png'%i);im.save('$P/$2-%d.webp'%i,'WEBP',quality=88,method=6);print(os.path.getsize('$P/$2-%d.webp'%i))"

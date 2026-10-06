Women's World Cup exact balls (Oct 6 2026): build scripts for the decal faces in public/museum/wcballs/decals/wwc-*.webp.
They were run from the work folder that held the reference photos (not committed: the photos keep their own licences; the
Commons originals are listed in docs/museum/BALL_SOURCES.md). Each folder keeps the solved photo poses (M_*.npy rotation,
C_*.json circle centre/radius/camera distance) so a rebuild only needs the photos back in refs/.
  oceaunz/oz2.py             Oceaunz + Oceaunz Final Pro (one swirl mosaic, two colourways)
  wwc-2019/                  Conext19 (build_conext19.py) and Tricolore 19 (build_tricolore19.py)
  wwc-2015/                  Conext15 and Final Vancouver (build_conext15.py c15|final <out> 512)
  wwc-2007-2011/             Speedcell (build_speedcell.py) and Teamgeist Blue (build_tg07.py)
  wwc-1999-2003/             Icon (build_icon.py) and Fevernova 2003 (build_fv03.py, clean_fv.py, build_fv03_faces.py, valve.py)
  tools/                     sphere.py (photo registration, unwrap, cube-face writer), register.py, pose.cjs, compare.py,
                             wwc-balls-fetch.py (throttled Wikimedia fetcher sharing the photo agents' lock file)
